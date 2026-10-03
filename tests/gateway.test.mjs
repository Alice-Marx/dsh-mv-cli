// Every panel call runs through a faithful copy of the Typert gateway boundary
// and the real MvRemoteService envelope, exactly as the Desktop client sees them.
import test from 'node:test'
import assert from 'node:assert/strict'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { manager } from './helpers/fake-pty.mjs'
import { MvRemoteService, HOST_PLUGIN_VERSION } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE, MV_REMOTE_PACKAGE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { createMvTerminalManager } from '../.dsh-plugin/shared/mv-terminal.mjs'
import { mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { TerminalConnection, checkLaunch, loadInfo, startSession, EMPTY_FORM } from '../.dsh-plugin/client/mv-terminal-state.mjs'
import { unwrapRemote, versionNotice } from '../.dsh-plugin/client/remote-state.mjs'

const DIR = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me'
const PY = `${DIR}\\python\\python.exe`
const FILES = { [PY]: 'file', [DIR]: 'dir', [`${DIR}\\_tools\\tui_live.py`]: 'file' }
const FORM = { ...EMPTY_FORM, pythonPath: PY, packageDir: DIR, noAudio: true }

function harness() {
  const { terminals, pty } = manager(createMvTerminalManager, { files: FILES })
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices(terminals, { canvasFontSize: 15 })
  return { api: gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE), pty, terminals }
}

test('descriptors: ids, namespace and strict codecs', () => {
  assert.deepEqual(MV_REMOTE_DESCRIPTORS.map(d => d.method), ['info', 'terminalCheck', 'terminalStart', 'terminalRead', 'terminalWrite', 'terminalResize', 'consoleInfo', 'consoleStart', 'consoleStop', 'terminalStop', 'packLoad', 'packRead', 'packTemplate', 'audioProbe', 'wavBegin', 'wavWrite', 'wavFinish', 'audioRead', 'ffmpegInfo', 'audioConvert', 'aiPackCreate', 'packUploadBegin', 'packUploadWrite', 'packUploadFinish', 'lyricsLookup', 'engineInfo', 'engineProbe', 'engineInstall', 'engineModel', 'engineTranscribe', 'jobRead', 'jobCancel', 'packWriteText', 'analysisRead'])
  for (const d of MV_REMOTE_DESCRIPTORS) {
    assert.equal(d.id, `${MV_REMOTE_PACKAGE}#${MV_REMOTE_NAMESPACE}/${d.method}`)
    assert.equal(d.result.mode, 'strict')
  }
})

test('gateway: results arrive double-wrapped and unwrap to the Host value', async () => {
  const { api, terminals } = harness()
  const raw = await api.info()
  assert.equal(raw.ok, true)
  assert.equal(raw.value.ok, true)
  const info = unwrapRemote(raw)
  assert.equal(info.hostVersion, HOST_PLUGIN_VERSION)
  assert.equal(info.canvasFontSize, 15)
  assert.equal(info.backend, 'pty')
  assert.equal(versionNotice({ hostVersion: info.hostVersion, clientVersion: HOST_PLUGIN_VERSION }), '')
  assert.match(versionNotice({ hostVersion: '0.0.1', clientVersion: '0.1.0' }), /重启 Harness/)
  assert.equal((await loadInfo(api)).hostVersion, HOST_PLUGIN_VERSION)
  terminals.disposeAll()
})

test('gateway: the client cannot smuggle a command through the boundary', async () => {
  const { api, pty } = harness()
  const raw = await api.terminalStart({ ...{ pythonPath: PY, packageDir: DIR }, command: 'calc.exe', cols: 80, rows: 24, confirmed: true })
  assert.equal(raw.ok, false)
  assert.match(raw.error.message, /boundary validation|unexpected fields/)
  assert.equal(pty.spawned.length, 0)
  const unconfirmed = unwrapRemote.bind(null, await api.terminalStart({ pythonPath: PY, packageDir: DIR, cols: 80, rows: 24 }))
  assert.throws(unconfirmed, /确认/)
})

test('gateway: check + start + connection loop end to end', async () => {
  const { api, pty } = harness()
  const checked = await checkLaunch(api, FORM)
  assert.equal(checked.display, `${PY} ${DIR}\\_tools\\tui_live.py --no-audio`)
  const session = await startSession(api, FORM, { cols: 999, rows: 3 })
  assert.equal(pty.spawned[0].options.cols, 400, 'clamped to the Host limits')
  assert.equal(pty.spawned[0].options.rows, 8)
  const received = []
  let exit
  const connection = new TerminalConnection({ api, sessionId: session.sessionId, waitMs: 50, onData: d => received.push(d), onExit: e => { exit = e }, onError: e => { throw e } })
  const loop = connection.start()
  pty.spawned[0].emit('hello')
  connection.send('q')
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.deepEqual(pty.spawned[0].written, ['q'])
  pty.spawned[0].exit(0)
  await loop
  assert.equal(received.join(''), 'hello')
  assert.deepEqual(exit, { endReason: 'exit', exitCode: 0 })
})
