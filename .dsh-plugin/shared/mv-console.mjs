/**
 * "独立窗口播放": run the fixed MV player in its own real Windows console
 * window (conhost, or Windows Terminal when it is the default terminal app).
 *
 * Node cannot ask CreateProcess for CREATE_NEW_CONSOLE (`detached: true` maps
 * to DETACHED_PROCESS, i.e. no console at all — verified on Windows 11), so
 * the Host runs exactly
 *   %SystemRoot%\System32\cmd.exe /d /v:off /s /c "start "world.execute(me)" /D "<cwd>" "<player>" <fixed args>"
 * `start` gives the player a new console. Every path is quoted; cmd treats
 * `& | < > ^ ( )` inside quotes literally, `"` cannot occur in Windows paths,
 * and `%` (cmd variable expansion, active even inside quotes) is rejected.
 *
 * cmd exits right after `start`; the Host then finds the player as the child
 * of that cmd process (PowerShell CIM query with integer pid only) and keeps
 * its pid. Stop checks the pid still belongs to that executable and runs
 * `taskkill /PID <pid> /T /F` (System32 path).
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { win32 } from 'node:path'
import { MV_CONSOLE_LIMIT, cmdArgv, consoleCommandDisplay, startCommandLine } from './mv-terminal-protocol.mjs'
import { cmdSafetyProblems } from './mv-pack.mjs'
import { resolveMvLaunch, terminalEnvironment } from './mv-terminal.mjs'

export const CONSOLE_UNSUPPORTED = '独立控制台窗口只在 Windows 上可用；在其他系统上请使用面板内的 MV 终端。'
export { CONSOLE_TITLE, cmdArgv, cmdQuote, consoleCwd, startCommandLine } from './mv-terminal-protocol.mjs'

/** Environment for a real console: the same Python settings, without the PTY's fake TERM. */
export function consoleEnvironment(env = process.env) {
  const result = terminalEnvironment(env)
  delete result.TERM
  delete result.COLORTERM
  return result
}

const system32 = env => win32.join(env.SystemRoot || env.SYSTEMROOT || env.windir || 'C:\\Windows', 'System32')
export const systemTool = (name, env = process.env) => name === 'powershell.exe'
  ? win32.join(system32(env), 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : win32.join(system32(env), name)

/** Run a fixed system tool and collect stdout. */
function runTool(spawnImpl, file, args, timeoutMs = 8_000) {
  return new Promise(resolve => {
    let out = ''
    let child
    try { child = spawnImpl(file, args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, shell: false }) }
    catch { resolve({ code: null, out: '' }); return }
    const timer = setTimeout(() => { try { child.kill() } catch { /* gone */ } }, timeoutMs)
    child.stdout?.on('data', chunk => { out += chunk })
    child.on('error', () => { clearTimeout(timer); resolve({ code: null, out }) })
    child.on('close', code => { clearTimeout(timer); resolve({ code, out }) })
  })
}

/** Default Windows probes; every input interpolated into them is an integer pid. */
export function windowsProbes({ spawnImpl = spawn, env = process.env } = {}) {
  const ps = command => runTool(spawnImpl, systemTool('powershell.exe', env), ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command])
  const pidOf = value => { if (!Number.isInteger(value) || value <= 0) throw new TypeError('pid must be a positive integer'); return value }
  return {
    /** [{pid, path}] of the direct children of a process. */
    async children(parentPid) {
      const { out } = await ps(`Get-CimInstance Win32_Process -Filter 'ParentProcessId=${pidOf(parentPid)}' | ForEach-Object { '{0}|{1}' -f $_.ProcessId, $_.ExecutablePath }`)
      return out.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
        const at = line.indexOf('|')
        return { pid: Number(line.slice(0, at)), path: line.slice(at + 1) }
      }).filter(item => Number.isInteger(item.pid))
    },
    /** Executable path of a live pid, or null. */
    async processPath(pid) {
      const { out } = await ps(`$p = Get-CimInstance Win32_Process -Filter 'ProcessId=${pidOf(pid)}'; if ($p) { $p.ExecutablePath }`)
      return out.trim() || null
    },
    async killTree(pid) {
      return (await runTool(spawnImpl, systemTool('taskkill.exe', env), ['/PID', String(pidOf(pid)), '/T', '/F'])).code
    },
  }
}

const samePath = (a, b) => typeof a === 'string' && typeof b === 'string' && win32.normalize(a).toLowerCase() === win32.normalize(b).toLowerCase()
const newConsoleId = (random = randomBytes) => `mvcon-${random(12).toString('hex')}`
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export function createMvConsoleManager({
  platform = process.platform,
  resolveLaunch = resolveMvLaunch,
  spawnImpl = spawn,
  probes = null,
  env = process.env,
  environment = () => consoleEnvironment(env),
  now = Date.now,
  randomId = newConsoleId,
  limit = MV_CONSOLE_LIMIT,
  findAttempts = 15,
  findDelayMs = 200,
  wait = sleep,
} = {}) {
  const consoles = new Map()
  let disposed = false
  const supported = platform === 'win32'
  const probe = probes ?? (supported ? windowsProbes({ spawnImpl, env }) : null)

  const summary = item => ({
    consoleId: item.id, pid: item.pid, display: item.display, cwd: item.cwd, startedAt: item.startedAt,
    exited: item.exited, endReason: item.endReason, tracked: item.pid !== null,
  })

  const finish = (item, reason) => {
    if (item.exited) return
    item.exited = true
    item.endReason ??= reason
    item.finishedAt = now()
  }

  /** Is the tracked pid still our player? (guards against pid reuse) */
  const alive = async item => {
    if (item.exited || item.pid === null) return !item.exited && item.pid !== null
    const path = await probe.processPath(item.pid)
    if (!samePath(path, item.file)) { finish(item, 'exit'); return false }
    return true
  }

  const prune = () => {
    const ended = [...consoles.values()].filter(item => item.exited)
    for (const item of ended.slice(0, Math.max(0, ended.length - 4))) consoles.delete(item.id)
  }

  /** Run cmd /c start and wait for it to hand off; returns cmd's pid. */
  const runStart = resolved => new Promise((resolve, reject) => {
    let child
    try {
      child = spawnImpl(systemTool('cmd.exe', env), cmdArgv(resolved), {
        cwd: resolved.cwd, env: environment(), stdio: 'ignore', windowsHide: true, windowsVerbatimArguments: true, shell: false,
      })
    } catch (error) { reject(error); return }
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve(child.pid) : reject(new Error(`start 返回 ${code}（程序可能不存在或无法运行）`)))
  })

  const findPlayer = async (cmdPid, file) => {
    for (let i = 0; i < findAttempts; i++) {
      const match = (await probe.children(cmdPid)).find(item => samePath(item.path, file))
      if (match) return match.pid
      await wait(findDelayMs)
    }
    return null
  }

  const stopItem = async (item, reason) => {
    if (item.exited) return { stopped: false, alreadyEnded: true }
    if (item.pid === null) { finish(item, reason); return { stopped: false, untracked: true } }
    if (!(await alive(item))) return { stopped: false, alreadyEnded: true }
    item.endReason = reason
    const code = await probe.killTree(item.pid)
    finish(item, reason)
    return { stopped: true, taskkill: code }
  }

  return {
    async info({ refresh = true } = {}) {
      if (refresh && supported) await Promise.all([...consoles.values()].filter(item => !item.exited).map(alive))
      return { supported, reason: supported ? '' : CONSOLE_UNSUPPORTED, platform, limit, consoles: [...consoles.values()].map(summary) }
    },

    /** Validate on disk, then open one new console window running the fixed player. */
    async start({ launch, confirmed }) {
      if (!supported) throw new Error(CONSOLE_UNSUPPORTED)
      if (disposed) throw new Error('插件正在卸载，无法启动。')
      if (confirmed !== true) throw new Error('打开独立窗口前需要你的确认。')
      if (launch.player === 'pack' && launch.expectDisplay === undefined) throw new Error('启动 MV 包的渲染程序前，需要先检查并确认它的完整命令。')
      await Promise.all([...consoles.values()].filter(item => !item.exited).map(alive))
      const live = [...consoles.values()].filter(item => !item.exited).length
      if (live >= limit) throw new Error(`最多同时打开 ${limit} 个独立播放窗口，请先结束一个。`)
      const resolved = await resolveLaunch(launch)
      if (resolved.pack) {
        // Pack renderers come from a file the user imported: stricter than the fixed players.
        const unsafe = cmdSafetyProblems(resolved.file, resolved.args, resolved.cwd)
        if (unsafe.length) throw new Error(unsafe.join('\n'))
      }
      startCommandLine(resolved) // throws on unsafe characters before anything runs
      let cmdPid
      try { cmdPid = await runStart(resolved) }
      catch (error) { throw new Error(`无法打开独立窗口：${error instanceof Error ? error.message : String(error)}`) }
      const pid = await findPlayer(cmdPid, resolved.file)
      const item = {
        id: randomId(), pid, file: resolved.file, display: consoleCommandDisplay(resolved, systemTool('cmd.exe', env)), player: resolved.display, cwd: resolved.cwd, startedAt: now(),
        exited: false, endReason: null, finishedAt: null,
      }
      consoles.set(item.id, item)
      prune()
      return { ...summary(item), ...(pid === null ? { warning: '窗口已打开，但没能找到播放器进程，无法从面板结束它；请直接关闭该窗口。' } : {}) }
    },

    async stop({ consoleId }) {
      const item = consoles.get(consoleId)
      if (!item) return { stopped: false, alreadyEnded: true }
      return stopItem(item, 'stopped')
    },

    /** Plugin unload: close every window this plugin opened. */
    async disposeAll(reason = 'dispose') {
      disposed = true
      await Promise.all([...consoles.values()].map(item => stopItem(item, reason).catch(() => {})))
    },

    /** Host 'exit' handler: synchronous best effort. */
    disposeAllSync(spawnSyncImpl, reason = 'dispose') {
      disposed = true
      for (const item of consoles.values()) {
        if (item.exited || item.pid === null) continue
        try { spawnSyncImpl(systemTool('taskkill.exe', env), ['/PID', String(item.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }) } catch { /* ignore */ }
        finish(item, reason)
      }
    },
  }
}
