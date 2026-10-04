// Every panel call runs through a faithful copy of the Typert gateway boundary
// and the real MvRemoteService envelope, exactly as the Desktop client sees them.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { MvRemoteService, HOST_PLUGIN_VERSION } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE, MV_REMOTE_PACKAGE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { defaultPackOps, mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { loadInfo } from '../.dsh-plugin/client/mv-info.mjs'
import { mergeShards, packAssetReader } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { unwrapRemote, versionNotice } from '../.dsh-plugin/client/remote-state.mjs'

function harness() {
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices({ canvasFontSize: 15 }, defaultPackOps, {})
  return { api: gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE), service }
}

test('descriptors: ids, namespace and strict codecs; no terminal or console endpoints', () => {
  assert.deepEqual(MV_REMOTE_DESCRIPTORS.map(d => d.method), ['info', 'packLoad', 'packRead', 'packTemplate', 'audioRead', 'ffmpegInfo', 'audioConvert', 'aiPackCreate', 'packUploadBegin', 'packUploadWrite', 'packUploadFinish', 'lyricsLookup', 'engineInfo', 'engineProbe', 'engineInstall', 'engineModel', 'engineTranscribe', 'jobRead', 'jobCancel', 'packWriteText', 'analysisRead', 'workshopIndex', 'workshopCover', 'workshopInstall', 'workshopUninstall', 'workshopInstalled', 'workshopPublish', 'workshopDirInfo', 'workshopDirSet', 'workshopDirMove', 'workshopDirOpen'])
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

test('gateway: canvas.assets are read through packRead (role asset), only files the manifest names', async () => {
  const { api } = harness()
  const dir = mkdtempSync(join(tmpdir(), 'mv-assets-'))
  try {
    mkdirSync(join(dir, 'data')); mkdirSync(join(dir, 'art'))
    const big = Array.from({ length: 30000 }, (_, i) => ({ i, pad: 'x'.repeat(20) }))
    writeFileSync(join(dir, 'data', 'timeline-1.json'), JSON.stringify({ fps: 30, shots: big.slice(0, 15000) }))
    writeFileSync(join(dir, 'data', 'timeline-2.json'), JSON.stringify({ shots: big.slice(15000) }))
    writeFileSync(join(dir, 'art', 'whale.webp'), Buffer.from('RIFF\0\0\0\0WEBPVP8 '))
    writeFileSync(join(dir, 'secret.txt'), 'not an asset')
    const manifest = { format: 'dsh-mv-pack', version: 1, title: 't', canvas: { renderer: 'dsh-pv', assets: { timeline: ['data/timeline-1.json', 'data/timeline-2.json'], 'whale-cheerful': 'art/whale.webp' } } }
    writeFileSync(join(dir, 'mv.json'), JSON.stringify(manifest))
    const manifestPath = join(dir, 'mv.json')
    const read = packAssetReader(api, manifestPath, parseMvPack(JSON.stringify(manifest)))
    const parts = await read('timeline')
    assert.equal(parts.length, 2)
    assert.ok(parts[0].length > 512 * 1024, 'first shard read in more than one chunk')
    const merged = mergeShards(parts.map(bytes => JSON.parse(new TextDecoder().decode(bytes))))
    assert.equal(merged.fps, 30)
    assert.equal(merged.shots.length, 30000)
    assert.equal(merged.shots[29999].i, 29999)
    const [art] = await read('whale-cheerful')
    assert.equal(new TextDecoder().decode(art.subarray(8, 12)), 'WEBP')
    assert.equal(await read('nope'), null)
    for (const request of [{ manifestPath, role: 'asset', asset: 'nope', offset: 0, length: 10 }, { manifestPath, role: 'asset', asset: 'timeline', part: 5, offset: 0, length: 10 }, { manifestPath, role: 'asset', asset: '../secret.txt', offset: 0, length: 10 }]) {
      const raw = await api.packRead(request)
      assert.equal(raw.ok && raw.value?.ok, false, JSON.stringify(request))
    }
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('gateway: workshop endpoints validate requests at the boundary; publish never takes a token', async () => {
  const { api } = harness()
  for (const [method, request] of [['workshopInstall', { id: '../../x' }], ['workshopInstall', { id: 'ok-id', url: 'https://evil' }], ['workshopUninstall', { id: 'C:\\Windows' }], ['workshopIndex', { url: 'https://evil' }], ['workshopPublish', { manifestPath: 'C:\\x\\mv.json', id: 'ok-id', version: '1.0.0', license: 'MIT', author: 'a', token: 'ghp_x' }]]) {
    const raw = await api[method](request)
    assert.equal(raw.ok, false, `${method} ${JSON.stringify(request)}`)
  }
  // Without the workshop service wired, valid requests fail politely.
  const raw = await api.workshopInstalled({})
  assert.equal(unwrapRemoteSafe(raw), '创意工坊功能未加载。')
})

function unwrapRemoteSafe(raw) { try { unwrapRemote(raw); return '' } catch (error) { return error.message } }
