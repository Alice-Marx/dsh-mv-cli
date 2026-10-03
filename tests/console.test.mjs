// "在独立窗口播放": cmd.exe /c start with exact quoting, child discovery,
// taskkill /T stop, non-Windows refusal, gateway boundary.
import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { win32 } from 'node:path'
import { createMvConsoleManager, consoleEnvironment, systemTool, windowsProbes, CONSOLE_UNSUPPORTED } from '../.dsh-plugin/shared/mv-console.mjs'
import { cmdArgv, cmdQuote, consoleCwd, startCommandLine, parseMvConsoleStart, parseMvConsoleStop, parseMvLaunch } from '../.dsh-plugin/shared/mv-terminal-protocol.mjs'
import { resolveMvLaunch } from '../.dsh-plugin/shared/mv-terminal.mjs'
import { MvRemoteService } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { unwrapRemote } from '../.dsh-plugin/client/remote-state.mjs'
import { EMPTY_FORM, consoleCommandPreview, consoleProblem, startConsole, stopConsole, loadConsoles } from '../.dsh-plugin/client/mv-terminal-state.mjs'

const DIR = 'F:\\My Stuff (old)\\world_execute_me'
const PY = `${DIR}\\python\\python.exe`
const SCRIPT = `${DIR}\\_tools\\tui_live.py`
const AUDIO = 'D:\\Music & Co\\A^B (1).mp3'
const FILES = { [PY]: 'file', [DIR]: 'dir', [SCRIPT]: 'file', [AUDIO]: 'file' }
const ENV = { SystemRoot: 'C:\\Windows', PATH: 'C:\\x' }

const statPath = async path => {
  const kind = FILES[path]
  if (!kind) throw new Error('ENOENT')
  return { isFile: () => kind === 'file', isDirectory: () => kind === 'dir' }
}
const resolveLaunch = launch => resolveMvLaunch(launch, { statPath, joinPath: win32.join, dirnameOf: win32.dirname })

function fakeWindows({ startExit = 0, childPath = PY, findAfter = 1 } = {}) {
  const calls = { spawn: [], kills: [], children: 0 }
  const alive = new Map()
  const spawnImpl = (file, args, options) => {
    calls.spawn.push({ file, args, options })
    const child = new EventEmitter()
    child.pid = 9000 + calls.spawn.length
    setImmediate(() => { child.emit('spawn'); child.emit('exit', startExit) })
    if (startExit === 0) alive.set(5000 + calls.spawn.length, { parent: child.pid, path: childPath })
    return child
  }
  const probes = {
    async children(parent) { calls.children++; if (calls.children < findAfter) return []; return [...alive].filter(([, v]) => v.parent === parent).map(([pid, v]) => ({ pid, path: v.path })) },
    async processPath(pid) { return alive.get(pid)?.path ?? null },
    async killTree(pid) { calls.kills.push(pid); alive.delete(pid); return 0 },
  }
  return { calls, alive, spawnImpl, probes }
}

const manager = (fake, options = {}) => createMvConsoleManager({ platform: 'win32', resolveLaunch, spawnImpl: fake.spawnImpl, probes: fake.probes, env: ENV, wait: async () => {}, ...options })

test('console: exact cmd.exe line with every path quoted', () => {
  const resolved = { file: PY, args: [SCRIPT, '--audio-file', AUDIO, '--start', '30', '--audio-latency', '0.15'], cwd: `${DIR}\\` }
  assert.equal(startCommandLine(resolved),
    `start "world.execute(me)" /D "${DIR}" "${PY}" "${SCRIPT}" --audio-file "${AUDIO}" --start 30 --audio-latency 0.15`)
  assert.deepEqual(cmdArgv(resolved).slice(0, 4), ['/d', '/v:off', '/s', '/c'])
  assert.equal(cmdArgv(resolved)[4], `"${startCommandLine(resolved)}"`, '/s strips exactly this outer pair')
  assert.throws(() => cmdQuote('D:\\%USERPROFILE%\\x.mp3'), /%/)
  assert.throws(() => startCommandLine({ ...resolved, args: [SCRIPT, '--audio-file', 'D:\\100%.mp3'] }), /%/)
  assert.equal(consoleCwd('F:\\'), 'F:\\.')
  assert.equal(consoleCwd('F:\\a\\b\\\\'), 'F:\\a\\b')
})

test('console: start runs cmd from System32 verbatim, finds and tracks the player', async () => {
  const fake = fakeWindows({ findAfter: 3 })
  const consoles = manager(fake)
  const launch = parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioFile: AUDIO })
  await assert.rejects(consoles.start({ launch, confirmed: false }), /确认/)
  assert.equal(fake.calls.spawn.length, 0)
  const started = await consoles.start({ launch, confirmed: true })
  const call = fake.calls.spawn[0]
  assert.equal(call.file, 'C:\\Windows\\System32\\cmd.exe')
  assert.equal(call.options.windowsVerbatimArguments, true)
  assert.equal(call.options.shell, false)
  assert.equal(call.options.cwd, DIR)
  assert.equal(call.options.env.PYTHONDONTWRITEBYTECODE, '1')
  assert.equal(call.options.env.TERM, undefined, 'no fake TERM in a real console')
  assert.equal(call.args[4], `"start "world.execute(me)" /D "${DIR}" "${PY}" "${SCRIPT}" --audio-file "${AUDIO}""`)
  assert.equal(started.pid, 5001)
  assert.equal(started.tracked, true)
  assert.match(started.consoleId, /^mvcon-/)
  assert.match(started.display, /^C:\\Windows\\System32\\cmd\.exe \/d \/v:off \/s \/c "start /)
  const info = await consoles.info()
  assert.equal(info.supported, true)
  assert.equal(info.consoles[0].exited, false)
  assert.deepEqual(await consoles.stop({ consoleId: started.consoleId }), { stopped: true, taskkill: 0 })
  assert.deepEqual(fake.calls.kills, [5001])
  assert.equal((await consoles.info()).consoles[0].endReason, 'stopped')
  assert.deepEqual(await consoles.stop({ consoleId: started.consoleId }), { stopped: false, alreadyEnded: true })
})

test('console: a closed window is noticed and a reused pid is never killed', async () => {
  const fake = fakeWindows()
  const consoles = manager(fake)
  const started = await consoles.start({ launch: parseMvLaunch({ pythonPath: PY, packageDir: DIR, noAudio: true }), confirmed: true })
  fake.alive.set(started.pid, { parent: 1, path: 'C:\\Windows\\notepad.exe' }) // window closed, pid reused
  const info = await consoles.info()
  assert.equal(info.consoles[0].exited, true)
  assert.deepEqual(await consoles.stop({ consoleId: started.consoleId }), { stopped: false, alreadyEnded: true })
  assert.deepEqual(fake.calls.kills, [])
})

test('console: limit, failures, dispose', async () => {
  const fake = fakeWindows()
  const consoles = manager(fake)
  const launch = () => parseMvLaunch({ pythonPath: PY, packageDir: DIR, noAudio: true, start: 5 })
  const first = await consoles.start({ launch: launch(), confirmed: true })
  assert.equal(fake.calls.spawn[0].args[4], `"start "world.execute(me)" /D "${DIR}" "${PY}" "${SCRIPT}" --no-audio --start 5"`)
  await consoles.start({ launch: launch(), confirmed: true })
  await assert.rejects(consoles.start({ launch: launch(), confirmed: true }), /最多同时打开 2 个/)
  await consoles.disposeAll()
  assert.equal(fake.calls.kills.length, 2)
  assert.ok(fake.calls.kills.includes(first.pid))
  await assert.rejects(consoles.start({ launch: launch(), confirmed: true }), /卸载/)
  assert.throws(() => parseMvLaunch({ player: 'rust', exePath: 'D:\\tools\\wem\\world-execute-me-rust.exe' }), /player/)

  const missing = manager(fakeWindows())
  await assert.rejects(missing.start({ launch: parseMvLaunch({ pythonPath: PY, packageDir: 'F:\\gone' }), confirmed: true }), /播放器目录不存在/)
  const failing = manager(fakeWindows({ startExit: 1 }))
  await assert.rejects(failing.start({ launch: parseMvLaunch({ pythonPath: PY, packageDir: DIR }), confirmed: true }), /无法打开独立窗口/)
  const untracked = manager(fakeWindows({ childPath: 'C:\\other.exe' }), { findAttempts: 2 })
  const result = await untracked.start({ launch: parseMvLaunch({ pythonPath: PY, packageDir: DIR }), confirmed: true })
  assert.equal(result.tracked, false)
  assert.match(result.warning, /无法从面板结束/)
})

test('console: refused on non-Windows without spawning anything', async () => {
  const fake = fakeWindows()
  const consoles = manager(fake, { platform: 'linux', probes: null })
  const info = await consoles.info()
  assert.equal(info.supported, false)
  assert.equal(info.reason, CONSOLE_UNSUPPORTED)
  await assert.rejects(consoles.start({ launch: parseMvLaunch({ pythonPath: '/usr/bin/python3', packageDir: '/srv/w' }), confirmed: true }), /只在 Windows/)
  assert.equal(fake.calls.spawn.length, 0)
})

test('console: probes only interpolate integer pids and use System32 tools', async () => {
  const seen = []
  const spawnImpl = (file, args) => {
    seen.push({ file, args })
    const child = new EventEmitter(); child.stdout = new EventEmitter(); child.kill = () => {}
    setImmediate(() => { child.stdout.emit('data', '5001|F:\\x\\python.exe\r\n'); child.emit('close', 0) })
    return child
  }
  const probes = windowsProbes({ spawnImpl, env: ENV })
  assert.deepEqual(await probes.children(42), [{ pid: 5001, path: 'F:\\x\\python.exe' }])
  assert.equal(seen[0].file, 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')
  assert.match(seen[0].args.at(-1), /ParentProcessId=42'/)
  await assert.rejects(probes.children('1; rm -rf /'), /integer/)
  await probes.killTree(77)
  assert.deepEqual(seen.at(-1), { file: 'C:\\Windows\\System32\\taskkill.exe', args: ['/PID', '77', '/T', '/F'] })
  assert.equal(systemTool('cmd.exe', ENV), 'C:\\Windows\\System32\\cmd.exe')
  assert.equal(consoleEnvironment({ PATH: 'x' }).PYTHONUTF8, '1')
})

test('console: protocol and gateway boundary', async () => {
  assert.throws(() => parseMvConsoleStart({ pythonPath: PY, packageDir: DIR, command: 'calc' }), /unexpected/)
  assert.throws(() => parseMvConsoleStop({ consoleId: 'mvterm-abcdef' }), /consoleId/)
  const fake = fakeWindows()
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices({ info: () => ({}) }, {}, manager(fake))
  const api = gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE)
  const smuggled = await api.consoleStart({ pythonPath: PY, packageDir: DIR, args: ['/c', 'calc'], confirmed: true })
  assert.equal(smuggled.ok, false)
  assert.equal(fake.calls.spawn.length, 0)
  const form = { ...EMPTY_FORM, pythonPath: PY, packageDir: DIR, noAudio: true }
  assert.equal(consoleProblem(form, { platform: 'win32' }), '')
  const started = await startConsole(api, form)
  assert.equal(consoleCommandPreview(form), `cmd.exe /d /v:off /s /c "start "world.execute(me)" /D "${DIR}" "${PY}" "${SCRIPT}" --no-audio"`)
  assert.equal(started.display.replace('C:\\Windows\\System32\\', ''), consoleCommandPreview(form), 'card shows exactly what runs')
  assert.equal((await loadConsoles(api)).consoles.length, 1)
  assert.equal((await stopConsole(api, started.consoleId)).stopped, true)
  assert.equal(unwrapRemote(await api.consoleInfo({})).consoles[0].endReason, 'stopped')
})
