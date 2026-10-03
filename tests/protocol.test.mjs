import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseMvLaunch, parseMvTerminalStart, parseMvTerminalRead, parseMvTerminalWrite, parseMvTerminalResize, parseMvTerminalStop,
  mvTerminalArgs, displayCommand, isAbsolutePathText, MV_TERMINAL_LIMITS,
} from '../.dsh-plugin/shared/mv-terminal-protocol.mjs'

const PY = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me\\python\\python.exe'
const DIR = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me'

test('protocol: python launch is a fixed shape with absolute paths', () => {
  assert.deepEqual(parseMvLaunch({ pythonPath: PY, packageDir: DIR }), { player: 'python', pythonPath: PY, packageDir: DIR, noAudio: false, start: 0 })
  assert.deepEqual(parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioFile: 'D:\\a b\\song.mp3', start: 30, audioLatency: 0.2 }),
    { player: 'python', pythonPath: PY, packageDir: DIR, noAudio: false, start: 30, audioFile: 'D:\\a b\\song.mp3', audioLatency: 0.2 })
  // noAudio drops the audio file
  assert.equal(parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioFile: 'D:\\x.mp3', noAudio: true }).audioFile, undefined)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: DIR, command: 'calc' }), /unexpected fields: command/)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: DIR, args: ['-c'] }), /unexpected fields/)
  assert.throws(() => parseMvLaunch({ pythonPath: 'C:\\Windows\\System32\\cmd.exe', packageDir: DIR }), /python/)
  assert.throws(() => parseMvLaunch({ pythonPath: 'python.exe', packageDir: DIR }), /绝对路径/)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: 'relative\\dir' }), /绝对路径/)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: DIR, start: -1 }), /start/)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioLatency: 99 }), /audioLatency/)
  assert.throws(() => parseMvLaunch({ pythonPath: PY, packageDir: DIR, noAudio: 'yes' }), /noAudio/)
  for (const ok of ['/usr/bin/python3', 'C:\\py\\pythonw.exe', 'D:\\x\\python3.13.exe', '\\\\server\\share\\python.exe']) assert.ok(parseMvLaunch({ pythonPath: ok, packageDir: '/srv/p' }))
})

test('protocol: the Rust player is gone; only python and pack remain', () => {
  for (const player of ['rust', 'node']) assert.throws(() => parseMvLaunch({ player, exePath: 'D:\\tools\\world-execute-me-rust.exe' }), /player/)
})

test('protocol: argument vectors', () => {
  const script = `${DIR}\\_tools\\tui_live.py`
  assert.deepEqual(mvTerminalArgs(parseMvLaunch({ pythonPath: PY, packageDir: DIR }), script), [script])
  assert.deepEqual(mvTerminalArgs(parseMvLaunch({ pythonPath: PY, packageDir: DIR, noAudio: true, start: 5 }), script), [script, '--no-audio', '--start', '5'])
  assert.deepEqual(mvTerminalArgs(parseMvLaunch({ pythonPath: PY, packageDir: DIR, audioFile: 'D:\\s.mp3', audioLatency: 0.15 }), script), [script, '--audio-file', 'D:\\s.mp3', '--audio-latency', '0.15'])
  assert.equal(displayCommand('D:\\a b\\python.exe', ['x.py', '--start', '3']), '"D:\\a b\\python.exe" x.py --start 3')
})

test('protocol: session requests', () => {
  assert.throws(() => parseMvTerminalStart({ pythonPath: PY, packageDir: DIR, cols: 5, rows: 30 }), /cols/)
  assert.equal(parseMvTerminalStart({ pythonPath: PY, packageDir: DIR, cols: 120, rows: 40, confirmed: true }).confirmed, true)
  assert.equal(parseMvTerminalStart({ pythonPath: PY, packageDir: DIR, cols: 120, rows: 40 }).confirmed, false)
  assert.throws(() => parseMvTerminalRead({ sessionId: 'term-abc', cursor: 0 }), /sessionId/)
  assert.ok(parseMvTerminalRead({ sessionId: 'mvterm-abcdef012345', cursor: 0, waitMs: 800 }))
  assert.throws(() => parseMvTerminalRead({ sessionId: 'mvterm-abcdef012345', cursor: -1 }))
  assert.throws(() => parseMvTerminalWrite({ sessionId: 'mvterm-abcdef012345', data: 'x'.repeat(MV_TERMINAL_LIMITS.writeChars + 1) }))
  assert.ok(parseMvTerminalResize({ sessionId: 'mvterm-abcdef012345', cols: 80, rows: 24 }))
  assert.ok(parseMvTerminalStop({ sessionId: 'mvterm-abcdef012345' }))
  assert.equal(isAbsolutePathText('C:/x'), true)
  assert.equal(isAbsolutePathText('C:x'), false)
})
