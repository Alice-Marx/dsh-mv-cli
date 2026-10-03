import test from 'node:test'
import assert from 'node:assert/strict'
import { win32 } from 'node:path'
import { createMvTerminalManager, resolveMvLaunch, terminalEnvironment, loadPtyModule } from '../.dsh-plugin/shared/mv-terminal.mjs'
import { parseMvLaunch } from '../.dsh-plugin/shared/mv-terminal-protocol.mjs'
import { manager } from './helpers/fake-pty.mjs'

const DIR = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me'
const PY = `${DIR}\\python\\python.exe`
const SCRIPT = `${DIR}\\_tools\\tui_live.py`
const AUDIO = 'D:\\Music\\song.mp3'
const RUST = 'D:\\tools\\wem\\world-execute-me-rust.exe'
const FILES = { [PY]: 'file', [DIR]: 'dir', [SCRIPT]: 'file', [AUDIO]: 'file', [RUST]: 'file' }

test('resolve: every path is checked on disk before anything runs', async () => {
  const { statPath } = manager(createMvTerminalManager, { files: FILES })
  const opts = { statPath, joinPath: win32.join, dirnameOf: win32.dirname }
  const ok = await resolveMvLaunch(parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioFile: AUDIO }), opts)
  assert.equal(ok.file, PY)
  assert.deepEqual(ok.args, [SCRIPT, '--audio-file', AUDIO])
  assert.equal(ok.cwd, DIR)
  await assert.rejects(resolveMvLaunch(parseMvLaunch({ pythonPath: PY, packageDir: 'F:\\nope', audioFile: 'D:\\missing.mp3' }), opts), error => {
    assert.equal(error.problems.length, 2)
    return /播放器目录不存在/.test(error.message) && /音频文件不存在/.test(error.message)
  })
  await assert.rejects(resolveMvLaunch(parseMvLaunch({ pythonPath: PY, packageDir: 'F:\\empty' }), { ...opts, statPath: async p => (p === 'F:\\empty' ? { isDirectory: () => true, isFile: () => false } : statPath(p)) }), /_tools\/tui_live\.py/)
  const rust = await resolveMvLaunch(parseMvLaunch({ player: 'rust', exePath: RUST, autoplay: true }), opts)
  assert.deepEqual([rust.file, rust.args, rust.cwd], [RUST, ['--autoplay'], 'D:\\tools\\wem'])
})

test('environment: UTF-8 Python without bytecode or user site', () => {
  const env = terminalEnvironment({ PATH: 'x', PYTHONPATH: 'evil' })
  assert.equal(env.PYTHONUTF8, '1')
  assert.equal(env.PYTHONDONTWRITEBYTECODE, '1', 'no __pycache__ written into the user folder')
  assert.equal(env.PYTHONNOUSERSITE, '1')
  assert.equal(env.TERM, 'xterm-256color')
})

test('manager: confirm, start, long-poll read, write, resize, stop', async () => {
  const { terminals, pty } = manager(createMvTerminalManager, { files: FILES })
  const launch = parseMvLaunch({ pythonPath: PY, packageDir: DIR, noAudio: true })
  await assert.rejects(terminals.start({ launch, cols: 100, rows: 30, confirmed: false }), /确认/)
  const session = await terminals.start({ launch, cols: 100, rows: 30, confirmed: true })
  assert.match(session.sessionId, /^mvterm-/)
  const proc = pty.spawned[0]
  assert.equal(proc.file, PY)
  assert.deepEqual(proc.args, [SCRIPT, '--no-audio'])
  assert.equal(proc.options.cwd, DIR)
  assert.equal(proc.options.cols, 100)
  const pending = terminals.read({ sessionId: session.sessionId, cursor: 0, waitMs: 500 })
  proc.emit('\x1b[2Jframe 1')
  const first = await pending
  assert.equal(first.data, '\x1b[2Jframe 1')
  assert.equal(first.cursor, 11)
  terminals.write({ sessionId: session.sessionId, data: ' ' })
  assert.deepEqual(proc.written, [' '])
  terminals.resize({ sessionId: session.sessionId, cols: 140, rows: 45 })
  assert.deepEqual(proc.sizes, [[140, 45]])
  assert.deepEqual(terminals.stop({ sessionId: session.sessionId }), { stopped: true })
  const last = await terminals.read({ sessionId: session.sessionId, cursor: first.cursor })
  assert.equal(last.exited, true)
  assert.equal(last.endReason, 'stopped')
  assert.equal(proc.killed, true)
})

test('manager: session limit, orphan sweep and dispose', async () => {
  let clock = 0
  const { terminals, pty } = manager(createMvTerminalManager, { files: FILES, now: () => clock })
  const launch = parseMvLaunch({ pythonPath: PY, packageDir: DIR })
  const a = await terminals.start({ launch, cols: 80, rows: 24, confirmed: true })
  await terminals.start({ launch, cols: 80, rows: 24, confirmed: true })
  await assert.rejects(terminals.start({ launch, cols: 80, rows: 24, confirmed: true }), /最多同时运行 2 个/)
  clock = 121_000
  terminals.sweep()
  assert.equal(pty.spawned.every(p => p.killed), true)
  assert.equal((await terminals.read({ sessionId: a.sessionId, cursor: 0 })).endReason, 'orphan')
  const { terminals: t2, pty: p2 } = manager(createMvTerminalManager, { files: FILES })
  await t2.start({ launch, cols: 80, rows: 24, confirmed: true })
  t2.disposeAll('dispose')
  assert.equal(p2.spawned[0].killed, true)
  await assert.rejects(t2.start({ launch, cols: 80, rows: 24, confirmed: true }), /卸载/)
})

test('manager: missing node-pty falls back to pipes with an explicit limitation', async () => {
  const spawned = []
  const { terminals } = manager(createMvTerminalManager, {
    files: FILES,
    loadPty: () => ({ ok: false, package: '@lydell/node-pty', error: 'not installed' }),
    spawnPipe: (resolved) => { spawned.push(resolved); return { pid: 1, onData() {}, onExit() {}, write() {}, resize: () => false, kill() {} } },
  })
  assert.equal(terminals.info().backend, 'pipe')
  const session = await terminals.start({ launch: parseMvLaunch({ pythonPath: PY, packageDir: DIR }), cols: 80, rows: 24, confirmed: true })
  assert.match(session.limitation, /管道模式/)
  assert.equal(spawned[0].file, PY)
})

test('loadPtyModule reports a missing module instead of throwing', () => {
  const result = loadPtyModule({ requireFrom: () => { throw new Error('Cannot find module') }, fresh: true })
  assert.equal(result.ok, false)
  assert.match(result.error, /Cannot find module/)
})
