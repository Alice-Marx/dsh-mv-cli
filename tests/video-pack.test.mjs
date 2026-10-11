import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MV_PACK_LIMITS, parseMvPack, parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { MV_PACK_JSON_SCHEMA, templateFiles } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { preparePublish } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { MvRemoteService } from '../.dsh-plugin/remote-service.mjs'
import { defaultPackOps, mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { unwrapRemote } from '../.dsh-plugin/client/remote-state.mjs'

const base = { format: 'dsh-mv-pack', version: 1, title: 'Rendered MV' }
const videoPack = { ...base, video: { file: 'render.mp4' }, canvas: { renderer: 'video' } }
const fixture = () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mv-video-'))
  writeFileSync(join(dir, 'mv.json'), JSON.stringify(videoPack))
  writeFileSync(join(dir, 'render.mp4'), Buffer.from('declared local movie'))
  return dir
}

test('video pack: normalized local containers, independent audio and optional subtitles', () => {
  for (const file of ['render.mp4', 'RENDER.M4V', 'media/render.mov', 'render.webm', 'render.mkv', 'D:\\Video\\render.mp4', '/home/user/render.mp4', '\\\\server\\share\\render.mp4']) {
    const pack = parseMvPack({ ...videoPack, video: { file }, audio: { file: 'song.mp3', offset: -0.75 }, canvas: { renderer: 'video', subtitles: true, fontSize: 16 } })
    assert.equal(pack.video.offset, 0)
    assert.equal(pack.audio.offset, -0.75)
    assert.equal(pack.canvas.subtitles, true)
    assert.equal(pack.canvas.size, undefined)
  }
  assert.equal(parseMvPack({ ...videoPack, video: { file: 'render.mp4', offset: 1.5 } }).video.offset, 1.5)
  assert.equal(parseMvPack({ ...videoPack, video: 'render.mp4' }).video.file, 'render.mp4')
  const attributed = parseMvPack({ ...videoPack, 'x-dsh-mv-workshop': { source: 'https://example.com/original', author: 'Original author' } })
  assert.equal(attributed.workshop.author, 'Original author', 'local attribution metadata is allowed')
})

test('video pack: video declarations require a video renderer and an explicit local movie', () => {
  for (const video of [undefined, null, {}, { file: '' }]) assert.throws(() => parseMvPack({ ...videoPack, video }), /video/)
  for (const renderer of ['generic', 'script', 'dsh-pv', 'world-execute-me']) {
    assert.throws(() => parseMvPack({ ...videoPack, canvas: { renderer, ...(renderer === 'script' ? { script: 'scene.js' } : {}) } }), /video 只用于/)
  }
  for (const file of ['../render.mp4', 'media/../render.mp4', 'song.mp3', 'scene.py', 'https://example.com/render.mp4', 'file:///tmp/render.mp4', 'data:render.mp4', 'C:render.mp4']) {
    assert.throws(() => parseMvPack({ ...videoPack, video: { file } }), /video|不能含/)
  }
  for (const offset of [-31, 31, NaN, Infinity, '0']) assert.throws(() => parseMvPack({ ...videoPack, video: { file: 'render.mp4', offset } }), /video.offset/)
  assert.throws(() => parseMvPack({ ...videoPack, video: { file: 'render.mp4', url: 'https://example.com' } }), /未知字段/)
})

test('video pack: script-only properties cannot change the video pipeline', () => {
  const values = { script: 'scene.js', assets: {}, output: 'text', size: [1280, 720], fonts: [], preroll: 0, context: {}, bpm: 120, beatOffset: 0 }
  for (const [key, value] of Object.entries(values)) {
    assert.throws(() => parseMvPack({ ...videoPack, canvas: { renderer: 'video', [key]: value } }), new RegExp(`canvas\\.${key} 不能用于 video`))
  }
  assert.throws(() => parseMvPack({ ...videoPack, canvas: { renderer: 'video', subtitles: 'yes' } }), /布尔值/)
  assert.equal(parseMvPack({ ...base, audio: 'song.mp3' }).canvas.renderer, 'generic')
  assert.equal(parseMvPack({ ...base, canvas: { script: 'scene.js' } }).canvas.renderer, 'script')
  assert.equal(parseMvPack({ ...base, canvas: { renderer: 'script', script: 'scene.js', output: 'pixels', subtitles: true } }).canvas.subtitles, true)
})

test('video host: load and chunk reads expose only the manifest-declared video', async () => {
  const dir = fixture()
  try {
    const loaded = await loadPack(dir)
    assert.equal(loaded.files.video.exists, true)
    assert.equal(loaded.files.video.size, 20)
    assert.deepEqual(loaded.warnings, [])
    const request = parsePackRead({ manifestPath: loaded.manifestPath, role: 'video', offset: 0, length: 8 })
    const chunk = await readPackFile(request)
    assert.equal(Buffer.from(chunk.base64, 'base64').toString(), 'declared')
    assert.equal(chunk.done, false)
    const end = await readPackFile({ ...request, offset: 16 })
    assert.equal(end.bytes, 4)
    assert.equal(end.done, true)
    await assert.rejects(readPackFile({ ...request, role: 'audio' }), /没有配置 audio/)
    assert.throws(() => parsePackRead({ ...request, path: join(dir, 'private.mp4') }), /unexpected fields/)
    assert.throws(() => parsePackRead({ ...request, asset: 'private' }), /only for role/)
    assert.throws(() => parsePackRead({ ...request, length: MV_PACK_LIMITS.readChunkBytes + 1 }), /length/)
    writeFileSync(loaded.manifestPath, JSON.stringify({ ...videoPack, video: { file: 'missing.webm' } }))
    await assert.rejects(readPackFile(request), /不存在/, 'the manifest is reread on every request')
    assert.match((await loadPack(dir)).warnings.join(), /video 文件不存在/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('video host: 1 GiB limit is enforced before opening movie bytes', async () => {
  const dir = fixture()
  try {
    const movie = join(dir, 'render.mp4'), manifestPath = join(dir, 'mv.json')
    const statPath = async path => path === movie ? { isFile: () => true, size: MV_PACK_LIMITS.videoBytes + 1 } : stat(path)
    assert.equal(MV_PACK_LIMITS.videoBytes, 1024 * 1024 * 1024)
    assert.equal((await loadPack(dir, { statPath })).files.video.tooLarge, true)
    let opened = false
    await assert.rejects(readPackFile({ manifestPath, role: 'video', offset: 0, length: 8 }, { statPath, openFile: async () => { opened = true; throw new Error('unexpected open') } }), /video 文件超过/)
    assert.equal(opened, false)
    assert.throws(() => parsePackRead({ manifestPath, role: 'video', offset: MV_PACK_LIMITS.videoBytes + 1 }), /offset/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('video gateway: the existing pack-read boundary supports the video role', async () => {
  const dir = fixture()
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices({}, defaultPackOps, {})
  const api = gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE)
  try {
    const loaded = unwrapRemote(await api.packLoad({ path: dir }))
    const chunk = unwrapRemote(await api.packRead({ manifestPath: loaded.manifestPath, role: 'video', offset: 0, length: 8 }))
    assert.equal(chunk.bytes, 8)
    assert.equal((await api.packRead({ manifestPath: loaded.manifestPath, role: 'video', command: 'run' })).ok, false)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('video workshop: local movie packs are rejected before resource reads', async () => {
  const read = []
  const manifest = { ...videoPack, lyrics: 'licensed.lrc', 'x-dsh-mv-workshop': { id: 'local-video', version: '1.0.0', license: 'MIT', author: 'Author' } }
  const result = await validateWorkshopPack({
    id: 'local-video', files: [{ path: 'mv.json', size: 300 }, { path: 'render.mp4', size: 20 }, { path: 'licensed.lrc', size: 30 }],
    readText: async path => { read.push(path); if (path === 'mv.json') return JSON.stringify(manifest); throw new Error('resource read should not happen') },
    readBytes: async () => { throw new Error('resource read should not happen') },
  })
  assert.match(result.errors.join(), /本地 video MV 包不能发布到创意工坊/)
  assert.deepEqual(read, ['mv.json'])
  assert.equal(result.meta, undefined)
})

test('video template: schema and both downloadable READMEs describe valid local packs', () => {
  assert.ok(MV_PACK_JSON_SCHEMA.properties.canvas.properties.renderer.enum.includes('video'))
  const pattern = new RegExp(MV_PACK_JSON_SCHEMA.properties.video.oneOf[1].properties.file.pattern)
  assert.equal(pattern.test('render.MP4'), true)
  assert.equal(pattern.test('song.mp3'), false)
  for (const path of ['README.md', 'README.zh.md']) {
    const text = templateFiles().find(file => file.path === path).text
    assert.ok(text.includes('1 GiB'))
    const example = [...text.matchAll(/```json\n([\s\S]*?)```/g)].map(match => match[1]).find(code => code.includes('"video":') && code.includes('"format":'))
    assert.ok(example, `${path} contains a local-video example`)
    assert.equal(parseMvPack(example).canvas.renderer, 'video')
  }
})

test('video publishing: rejects before reading lyrics, notices or creating a staging folder', async () => {
  const reads = []
  const result = await preparePublish({ manifestPath: '/local/mv.json', id: 'local-video' }, {
    publishRoot: '/must-not-be-created',
    load: async () => ({ manifestPath: '/local/mv.json', packDir: '/local', pack: parseMvPack({ ...videoPack, lyrics: 'lyrics.lrc' }) }),
    readText: async path => { reads.push(path); throw new Error('no resource should be read') },
    readBytes: async path => { reads.push(path); throw new Error('no resource should be read') },
  })
  assert.equal(result.ok, false)
  assert.equal(result.dir, null)
  assert.deepEqual(result.files, [])
  assert.match(result.errors.join(), /本地 video MV 包不能发布到创意工坊/)
  assert.deepEqual(reads, [])
})
