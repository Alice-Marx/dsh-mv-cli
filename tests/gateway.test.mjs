// Every panel call runs through a faithful copy of the Typert gateway boundary
// and the real MvRemoteService envelope, exactly as the Desktop client sees them.
import test from 'node:test'
import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { MvRemoteService, HOST_PLUGIN_VERSION } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE, MV_REMOTE_PACKAGE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { defaultPackOps, mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { loadInfo } from '../.dsh-plugin/client/mv-info.mjs'
import { hostReader } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { unwrapRemote, versionNotice } from '../.dsh-plugin/client/remote-state.mjs'

function harness() {
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices({ canvasFontSize: 15 }, defaultPackOps, {})
  return { api: gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE), service }
}

test('descriptors: ids, namespace and strict codecs; no terminal or console endpoints', () => {
  assert.deepEqual(MV_REMOTE_DESCRIPTORS.map(d => d.method), ['info', 'packLoad', 'packRead', 'packTemplate', 'audioRead', 'ffmpegInfo', 'audioConvert', 'aiPackCreate', 'packUploadBegin', 'packUploadWrite', 'packUploadFinish', 'lyricsLookup', 'engineInfo', 'engineProbe', 'engineInstall', 'engineModel', 'engineTranscribe', 'jobRead', 'jobCancel', 'packWriteText', 'analysisRead', 'dshpvAsset'])
  for (const d of MV_REMOTE_DESCRIPTORS) {
    assert.equal(d.id, `${MV_REMOTE_PACKAGE}#${MV_REMOTE_NAMESPACE}/${d.method}`)
    assert.equal(d.result.mode, 'strict')
  }
  const { service } = harness()
  assert.deepEqual(Object.keys(service.services).sort(), MV_REMOTE_DESCRIPTORS.map(d => d.method).sort())
})

test('gateway: results arrive double-wrapped and unwrap to the Host value', async () => {
  const { api } = harness()
  const raw = await api.info()
  assert.equal(raw.ok, true)
  assert.equal(raw.value.ok, true)
  const info = unwrapRemote(raw)
  assert.equal(info.hostVersion, HOST_PLUGIN_VERSION)
  assert.equal(info.canvasFontSize, 15)
  assert.equal(info.backend, undefined)
  assert.equal(versionNotice({ hostVersion: info.hostVersion, clientVersion: HOST_PLUGIN_VERSION }), '')
  assert.match(versionNotice({ hostVersion: '0.0.1', clientVersion: '0.1.0' }), /重启 Harness/)
  assert.equal((await loadInfo(api)).hostVersion, HOST_PLUGIN_VERSION)
})

test('gateway: dshpvAsset only serves its named files, nothing else under the plugin', async () => {
  const { api } = harness()
  for (const request of [{ name: '../index.mjs' }, { name: 'timeline', path: 'C:\\x' }, { name: 'timeline', offset: -1 }]) {
    const raw = await api.dshpvAsset(request)
    assert.equal(raw.ok, false, JSON.stringify(request))
    assert.match(raw.error.message, /boundary validation|unexpected fields|must be/)
  }
  const bytes = await hostReader(api)('timeline')
  assert.equal(bytes.length, statSync(new URL('../.dsh-plugin/assets/dsh-pv/timeline.json', import.meta.url)).size)
  assert.ok(bytes.length > 1024 * 1024, 'read in more than one chunk')
  assert.equal(JSON.parse(new TextDecoder().decode(bytes)).shots.length, 97)
  const art = await hostReader(api)('whale-cheerful')
  assert.equal(new TextDecoder().decode(art.subarray(8, 12)), 'WEBP')
})
