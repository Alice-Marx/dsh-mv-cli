/**
 * Host session manager for the "MV 终端": runs the user's local TUI player
 * (`<python> <packageDir>/_tools/tui_live.py …`) in a pseudo terminal
 * (prebuilt @lydell/node-pty; ConPTY on Windows). Falls back to pipes, with
 * documented limits, when the native PTY cannot load.
 *
 * Adapted from the official-CLI terminal of @ljwei-stak/dsh-model-router
 * (feat/cli-terminal). Output is buffered per session for long-poll reads;
 * keystrokes are forwarded verbatim and never logged.
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import {
  MV_TERMINAL_LABEL,
  MV_TERMINAL_LIMITS,
  MV_TERMINAL_SCRIPT,
  displayCommand,
  mvTerminalArgs,
  rustTerminalArgs,
} from './mv-terminal-protocol.mjs'

export const PTY_PACKAGE = '@lydell/node-pty'
export const PIPE_LIMITATION = '未能加载伪终端（PTY）组件，已改用管道模式：播放器看不到真实终端，Windows 下 tui_live.py 读取按键（msvcrt）和获取窗口大小都会失败，画面很可能无法显示。请确认插件目录里装有 @lydell/node-pty。'

const REMOVE_EXITED_AFTER_MS = 60_000
const SWEEP_INTERVAL_MS = 10_000

let cachedPty = null

/** Load the prebuilt PTY once. Returns { ok, pty } or { ok: false, error }. */
export function loadPtyModule({ requireFrom = createRequire(import.meta.url), fresh = false } = {}) {
  if (cachedPty && !fresh) return cachedPty
  try {
    const pty = requireFrom(PTY_PACKAGE)
    if (typeof pty?.spawn !== 'function') throw new Error(`${PTY_PACKAGE} 没有 spawn()`)
    cachedPty = { ok: true, pty, package: PTY_PACKAGE }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    cachedPty = { ok: false, error: message.split('\n')[0].slice(0, 400), package: PTY_PACKAGE }
  }
  return cachedPty
}

/**
 * Environment of the player: the Host's own environment plus what the
 * player's 启动终端版.cmd sets (UTF-8, no user site-packages). Bytecode
 * writing is disabled so running never adds __pycache__ to the user's folder.
 */
export function terminalEnvironment(env = process.env) {
  const result = {}
  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== 'string') continue
    if (key.toUpperCase() === 'ELECTRON_RUN_AS_NODE') continue
    result[key] = value
  }
  result.TERM = 'xterm-256color'
  result.COLORTERM = 'truecolor'
  result.PYTHONUTF8 = '1'
  result.PYTHONIOENCODING = 'utf-8'
  result.PYTHONNOUSERSITE = '1'
  result.PYTHONDONTWRITEBYTECODE = '1'
  return result
}

/**
 * Check every path of a parsed launch on disk and build the fixed command.
 * Returns { file, args, cwd, display, script }.
 */
export async function resolveMvLaunch(launch, { statPath = stat, joinPath = join, dirnameOf = dirname } = {}) {
  const problems = []
  const info = async path => { try { return await statPath(path) } catch { return null } }
  if (launch.player === 'rust') {
    const exe = await info(launch.exePath)
    if (!exe?.isFile?.()) problems.push(`找不到可执行文件，或它不是文件：${launch.exePath}`)
    if (launch.audioFile) {
      const audio = await info(launch.audioFile)
      if (!audio?.isFile?.()) problems.push(`音频文件不存在或不是文件：${launch.audioFile}`)
    }
    if (problems.length) { const error = new Error(problems.join('\n')); error.problems = problems; throw error }
    const args = rustTerminalArgs(launch)
    return { file: launch.exePath, args, cwd: dirnameOf(launch.exePath), script: launch.exePath, display: displayCommand(launch.exePath, args) }
  }
  const python = await info(launch.pythonPath)
  if (!python?.isFile?.()) problems.push(`找不到 Python 解释器，或它不是文件：${launch.pythonPath}`)
  const dir = await info(launch.packageDir)
  const script = joinPath(launch.packageDir, ...MV_TERMINAL_SCRIPT)
  if (!dir?.isDirectory?.()) problems.push(`播放器目录不存在或不是目录：${launch.packageDir}`)
  else {
    const scriptInfo = await info(script)
    if (!scriptInfo?.isFile?.()) problems.push(`目录里没有 ${MV_TERMINAL_SCRIPT.join('/')}：${script}`)
  }
  if (launch.audioFile) {
    const audio = await info(launch.audioFile)
    if (!audio?.isFile?.()) problems.push(`音频文件不存在或不是文件：${launch.audioFile}`)
  }
  if (problems.length) {
    const error = new Error(problems.join('\n'))
    error.problems = problems
    throw error
  }
  const args = mvTerminalArgs(launch, script)
  return { file: launch.pythonPath, args, cwd: launch.packageDir, script, display: displayCommand(launch.pythonPath, args) }
}

/** PTY-backed process adapter. */
function spawnPtyProcess(pty, launch, { cwd, cols, rows, env }) {
  const proc = pty.spawn(launch.file, launch.args, { name: 'xterm-256color', cols, rows, cwd, env })
  return {
    pid: proc.pid,
    onData: listener => { proc.onData(listener) },
    onExit: listener => { proc.onExit(event => listener({ exitCode: event?.exitCode ?? null, signal: event?.signal ?? null })) },
    write: data => { proc.write(data) },
    resize: (nextCols, nextRows) => { proc.resize(nextCols, nextRows); return true },
    kill: () => { proc.kill() },
  }
}

/** Pipe fallback: no TTY. */
export function spawnPipeProcess(launch, { cwd, env, platform = process.platform, spawnImpl = spawn }) {
  const child = spawnImpl(launch.file, launch.args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false })
  const stdoutDecoder = new StringDecoder('utf8')
  const stderrDecoder = new StringDecoder('utf8')
  const listeners = { data: [], exit: [] }
  let exited = false
  const emit = text => { if (text) for (const listener of listeners.data) listener(text.replace(/(?<!\r)\n/g, '\r\n')) }
  child.stdout?.on('data', chunk => emit(stdoutDecoder.write(chunk)))
  child.stderr?.on('data', chunk => emit(stderrDecoder.write(chunk)))
  const finish = (exitCode, signal) => {
    if (exited) return
    exited = true
    emit(stdoutDecoder.end()); emit(stderrDecoder.end())
    for (const listener of listeners.exit) listener({ exitCode, signal })
  }
  child.on('error', error => { emit(`\r\n[启动失败] ${error?.message ?? error}\r\n`); finish(null, null) })
  child.on('close', (code, signal) => finish(code, signal))
  const kill = () => {
    if (exited) return
    if (platform === 'win32' && child.pid) {
      try { spawnImpl('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }) } catch { /* fall through */ }
    }
    try { child.kill() } catch { /* gone */ }
  }
  return {
    pid: child.pid,
    onData: listener => { listeners.data.push(listener) },
    onExit: listener => { listeners.exit.push(listener) },
    write: data => {
      if (data === '\x03') { emit('^C\r\n'); kill(); return }
      try { child.stdin?.write(data) } catch { /* closed */ }
    },
    resize: () => false,
    kill,
  }
}

function newSessionId(random = randomBytes) {
  return `mvterm-${random(12).toString('hex')}`
}

/** Per-Host session manager. Every dependency is injectable for tests. */
export function createMvTerminalManager({
  loadPty = loadPtyModule,
  spawnPipe = spawnPipeProcess,
  resolveLaunch = resolveMvLaunch,
  environment = () => terminalEnvironment(process.env),
  onSessionEnd = () => {},
  now = Date.now,
  platform = process.platform,
  limits = MV_TERMINAL_LIMITS,
  randomId = newSessionId,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  setRepeating = setInterval,
  clearRepeating = clearInterval,
} = {}) {
  const sessions = new Map()
  let sweeper = null
  let disposed = false

  const backendInfo = () => {
    const loaded = loadPty()
    return loaded.ok
      ? { backend: 'pty', package: loaded.package }
      : { backend: 'pipe', package: loaded.package, ptyError: loaded.error, limitation: PIPE_LIMITATION }
  }

  const summary = session => ({
    sessionId: session.id, label: MV_TERMINAL_LABEL, cwd: session.cwd, backend: session.backend,
    display: session.display, startedAt: session.startedAt,
    exited: session.exited, exitCode: session.exitCode, endReason: session.endReason,
  })

  const wake = session => {
    const waiters = [...session.waiters]
    session.waiters.clear()
    for (const resolve of waiters) resolve()
  }

  const append = (session, text) => {
    if (!text) return
    session.text += text
    const overflow = session.text.length - limits.bufferChars
    if (overflow > 0) {
      session.text = session.text.slice(overflow)
      session.base += overflow
    }
    wake(session)
  }

  const finish = (session, { exitCode = null, signal = null } = {}) => {
    if (session.exited) return
    session.exited = true
    session.exitCode = exitCode
    session.signal = signal
    session.finishedAt = now()
    session.endReason ??= 'exit'
    wake(session)
    try {
      onSessionEnd({
        id: session.id, cwd: session.cwd, backend: session.backend, startedAt: session.startedAt, finishedAt: session.finishedAt,
        durationMs: Math.max(0, session.finishedAt - session.startedAt), exitCode, endReason: session.endReason,
      })
    } catch { /* recording must never break the terminal */ }
  }

  const terminate = (session, reason) => {
    if (session.exited) return
    session.endReason ??= reason
    try { session.proc.kill() } catch { /* already gone */ }
    session.killTimer = setTimer(() => finish(session, { exitCode: null }), 5_000)
    session.killTimer?.unref?.()
  }

  const sweep = () => {
    const at = now()
    for (const session of sessions.values()) {
      if (!session.exited) {
        if (at - session.lastReadAt > limits.orphanTimeoutMs) terminate(session, 'orphan')
        else if (at - session.startedAt > limits.maxLifetimeMs) terminate(session, 'lifetime')
      } else if (at - session.finishedAt > REMOVE_EXITED_AFTER_MS) {
        sessions.delete(session.id)
      }
    }
    if (sessions.size === 0 && sweeper !== null) { clearRepeating(sweeper); sweeper = null }
  }

  const ensureSweeper = () => {
    if (sweeper !== null) return
    sweeper = setRepeating(sweep, SWEEP_INTERVAL_MS)
    sweeper?.unref?.()
  }

  const get = id => {
    const session = sessions.get(id)
    if (!session) throw new Error('终端会话不存在或已结束。')
    return session
  }

  return {
    info() {
      return { ...backendInfo(), platform, limits, sessions: [...sessions.values()].map(summary) }
    },

    /** Validate a launch without starting anything; returns the exact command. */
    async check(launch) {
      const resolved = await resolveLaunch(launch)
      return { ok: true, display: resolved.display, cwd: resolved.cwd, script: resolved.script, ...backendInfo() }
    },

    async start({ launch, cols, rows, confirmed }) {
      if (disposed) throw new Error('插件正在卸载，无法启动终端。')
      if (confirmed !== true) throw new Error('启动 MV 终端前需要你的确认。')
      const live = [...sessions.values()].filter(session => !session.exited).length
      if (live >= limits.maxSessions) throw new Error(`最多同时运行 ${limits.maxSessions} 个 MV 终端，请先结束一个。`)
      const resolved = await resolveLaunch(launch)
      const env = environment()
      const backend = backendInfo()
      const options = { cwd: resolved.cwd, cols, rows, env, platform }
      let proc
      try {
        proc = backend.backend === 'pty' ? spawnPtyProcess(loadPty().pty, resolved, options) : spawnPipe(resolved, options)
      } catch (error) {
        throw new Error(`无法启动 ${resolved.display}：${error instanceof Error ? error.message : String(error)}`)
      }
      const at = now()
      const session = {
        id: randomId(), cwd: resolved.cwd, display: resolved.display, backend: backend.backend, proc,
        startedAt: at, lastReadAt: at, finishedAt: null,
        text: '', base: 0, waiters: new Set(), exited: false, exitCode: null, signal: null, endReason: null, killTimer: null,
      }
      sessions.set(session.id, session)
      proc.onData(data => append(session, data))
      proc.onExit(event => {
        if (session.killTimer) clearTimer(session.killTimer)
        finish(session, event)
      })
      ensureSweeper()
      return { ...summary(session), pid: proc.pid ?? null, ...(backend.backend === 'pipe' ? { limitation: PIPE_LIMITATION, ptyError: backend.ptyError } : {}) }
    },

    async read({ sessionId, cursor = 0, waitMs = 0 }) {
      const session = get(sessionId)
      session.lastReadAt = now()
      const end = () => session.base + session.text.length
      if (cursor >= end() && !session.exited && waitMs > 0) {
        await new Promise(resolve => {
          const timer = setTimer(() => { session.waiters.delete(done); resolve() }, waitMs)
          const done = () => { clearTimer(timer); resolve() }
          session.waiters.add(done)
        })
        session.lastReadAt = now()
      }
      const dropped = cursor < session.base
      const from = Math.min(Math.max(cursor, session.base), end())
      const slice = session.text.slice(from - session.base, from - session.base + limits.readChars)
      const next = from + slice.length
      return {
        sessionId, data: slice, cursor: next, dropped,
        exited: session.exited && next >= end(), exitCode: session.exitCode, endReason: session.endReason,
      }
    },

    write({ sessionId, data }) {
      const session = get(sessionId)
      if (session.exited) throw new Error('终端会话已结束。')
      session.proc.write(data)
      return { written: data.length }
    },

    resize({ sessionId, cols, rows }) {
      const session = get(sessionId)
      if (session.exited) return { resized: false }
      let resized = false
      try { resized = session.proc.resize(cols, rows) === true } catch { resized = false }
      return { resized }
    },

    stop({ sessionId }) {
      const session = sessions.get(sessionId)
      if (!session) return { stopped: false, alreadyEnded: true }
      terminate(session, 'stopped')
      return { stopped: true }
    },

    disposeAll(reason = 'dispose') {
      disposed = true
      for (const session of sessions.values()) {
        if (session.exited) continue
        session.endReason ??= reason
        try { session.proc.kill() } catch { /* gone */ }
        finish(session, { exitCode: null })
      }
      if (sweeper !== null) { clearRepeating(sweeper); sweeper = null }
    },

    sweep,
  }
}
