import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { disposeDshPvData, loadDshPv } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { DshPvFilm } from '../.dsh-plugin/client/mv/dshpv/film.mjs'
import { packRequires } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { DSHPV_RASTER_LIMITS, drawRasterLayer, rasterFrameAt, rasterImageDimensions, validateRasterAtlases, validateRasterTimeline } from '../.dsh-plugin/client/mv/dshpv/raster.mjs'

const enc = value => new TextEncoder().encode(JSON.stringify(value))
const image = (width = 8, height = 8, id = '') => ({ width, height, id, closed: 0, close() { this.closed++ } })
// Synthetic image headers are decoded by a fake factory; no original artwork or font binaries are fixtures.
function png(width = 8, height = 8) {
  const bytes = new Uint8Array(24), view = new DataView(bytes.buffer)
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]); bytes.set([73, 72, 68, 82], 12)
  view.setUint32(16, width); view.setUint32(20, height)
  return bytes
}
function webp(kind, payload) {
  const chunks = Array.isArray(kind) ? kind : [[kind, payload]]
  const bytes = new Uint8Array(12 + chunks.reduce((size, [, data]) => size + 8 + data.length + (data.length & 1), 0)), view = new DataView(bytes.buffer)
  bytes.set(new TextEncoder().encode('RIFF'), 0); view.setUint32(4, bytes.length - 8, true)
  bytes.set(new TextEncoder().encode('WEBP'), 8)
  let at = 12
  for (const [name, data] of chunks) {
    bytes.set(new TextEncoder().encode(name), at); view.setUint32(at + 4, data.length, true); bytes.set(data, at + 8)
    at += 8 + data.length + (data.length & 1)
  }
  return bytes
}
function vp8(width = 8, height = 8) {
  const bytes = new Uint8Array([0, 0, 0, 157, 1, 42, 0, 0, 0, 0]), view = new DataView(bytes.buffer)
  view.setUint16(6, width, true); view.setUint16(8, height, true)
  return bytes
}
function vp8l(width = 8, height = 8, alpha = false) {
  const bytes = new Uint8Array(5); bytes[0] = 47
  new DataView(bytes.buffer).setUint32(1, width - 1 | (height - 1) << 14 | (alpha ? 1 << 28 : 0), true)
  return bytes
}
function vp8x(width = 8, height = 8, flags = 0) {
  const bytes = new Uint8Array(10); bytes[0] = flags
  for (let i = 0; i < 3; i++) { bytes[4 + i] = (width - 1) >> (i * 8) & 255; bytes[7 + i] = (height - 1) >> (i * 8) & 255 }
  return bytes
}
const op = (atlas = 0, z = 'over') => ({ atlas, src: [0, 0, 8, 8], dst: [24, 56, 128, 128], alpha: 1, z })
const descriptor = () => ({ version: 1, size: [1280, 720], frames: [{ t: 1, ops: [op()] }, { t: 2, ops: [] }, { t: 4, ops: [op(0, 'under')] }] })
const baseData = () => ({ timeline: [enc({ shots: [] })], chat: [enc({ blocks: [], frames: [] })], band: [enc({ lines: [] })] })

test('dsh-pv raster: strictly validates and copies bounded data only', () => {
  const raw = descriptor(), parsed = validateRasterTimeline(raw)
  raw.frames[0].ops[0].src[0] = 100
  assert.deepEqual(parsed.frames[0].ops[0].src, [0, 0, 8, 8])
  const changes = [
    value => { value.file = '../secret.png' }, value => { value.url = 'https://example.test/image.png' },
    value => { value.frames[0].file = 'art/a.png' }, value => { value.frames[0].ops[0].url = 'https://example.test' },
    value => { value.version = 2 }, value => { value.size = [640, 360] }, value => { value.frames = [] },
    value => { value.frames[1].t = value.frames[0].t }, value => { value.frames[1].t = 0 },
    value => { value.frames[0].t = NaN }, value => { value.frames[0].t = Infinity },
    value => { value.frames[0].ops[0].atlas = -1 }, value => { value.frames[0].ops[0].atlas = 16 },
    value => { value.frames[0].ops[0].src = [0, 0, -1, 8] }, value => { value.frames[0].ops[0].src = [0.5, 0, 8, 8] },
    value => { value.frames[0].ops[0].dst = [Infinity, 0, 10, 10] }, value => { value.frames[0].ops[0].dst = [0, 0, 1281, 10] },
    value => { value.frames[0].ops[0].alpha = 2 }, value => { value.frames[0].ops[0].z = 'multiply' },
  ]
  for (const change of changes) { const value = descriptor(); change(value); assert.throws(() => validateRasterTimeline(value), /dsh-pv raster/) }
  assert.throws(() => validateRasterTimeline({ ...descriptor(), frames: Array.from({ length: DSHPV_RASTER_LIMITS.frames + 1 }, (_, i) => ({ t: i, ops: [] })) }), /数量/)
  assert.throws(() => validateRasterTimeline({ ...descriptor(), frames: [{ t: 0, ops: Array.from({ length: DSHPV_RASTER_LIMITS.frameOps + 1 }, () => op()) }] }), /ops/)
  assert.throws(() => validateRasterTimeline({ ...descriptor(), frames: Array.from({ length: 1001 }, (_, i) => ({ t: i, ops: Array.from({ length: 64 }, () => op()) })) }), /ops 总数/)
})

test('dsh-pv raster: bounded PNG and WebP dimensions are inspected before decoding', () => {
  assert.deepEqual(rasterImageDimensions(png(1280, 720)), { width: 1280, height: 720 })
  assert.deepEqual(rasterImageDimensions(webp([['VP8X', vp8x(128, 64)], ['VP8 ', vp8(128, 64)]])), { width: 128, height: 64 })
  assert.deepEqual(rasterImageDimensions(webp('VP8L', vp8l())), { width: 8, height: 8 })
  assert.deepEqual(rasterImageDimensions(webp('VP8 ', vp8())), { width: 8, height: 8 })
  for (const bytes of [new Uint8Array(40), png(0, 8), png(9000, 8), png(8192, 8192), webp('VP8X', new Uint8Array(2))]) assert.throws(() => rasterImageDimensions(bytes), /dsh-pv raster/)
  const truncated = webp('VP8X', vp8x()).subarray(0, 30); new DataView(truncated.buffer).setUint32(16, 100, true)
  assert.throws(() => rasterImageDimensions(truncated), /不完整/)
})

test('dsh-pv raster: static transparent WebP accepts bounded metadata but rejects animation and malformed containers', () => {
  assert.deepEqual(rasterImageDimensions(webp([['VP8X', vp8x(8, 8, 16)], ['ALPH', new Uint8Array([0, 1])], ['VP8 ', vp8()]])), { width: 8, height: 8 })
  assert.deepEqual(rasterImageDimensions(webp([['VP8X', vp8x(8, 8, 16)], ['VP8L', vp8l(8, 8, true)]])), { width: 8, height: 8 })
  assert.deepEqual(rasterImageDimensions(webp([['VP8X', vp8x(8, 8, 44)], ['ICCP', new Uint8Array([1])], ['VP8 ', vp8()], ['EXIF', new Uint8Array([2])], ['XMP ', new Uint8Array([3])]])), { width: 8, height: 8 })
  const bad = [
    webp([['VP8X', vp8x(8, 8, 2)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x()], ['ANIM', new Uint8Array(6)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x()], ['ANMF', new Uint8Array(16)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x(8, 8)], ['VP8 ', vp8(16, 8)]]),
    webp([['VP8X', vp8x(8, 8)], ['VP8L', vp8l(8, 16)]]),
    webp([['VP8 ', vp8()], ['VP8L', vp8l()]]), webp([['VP8 ', vp8()], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x()], ['VP8X', vp8x()], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x(8, 8, 193)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x()], ['JUNK', new Uint8Array(2)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x(8, 8, 32)], ['ICCP', new Uint8Array(256 * 1024 + 1)], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x()], ['EXIF', new Uint8Array([1])], ['VP8 ', vp8()]]),
    webp([['ALPH', new Uint8Array([1])], ['VP8 ', vp8()]]),
    webp([['VP8X', vp8x(8, 8, 16)], ['ALPH', new Uint8Array([1])], ['VP8L', vp8l()]]),
    webp([['VP8X', vp8x()], ['VP8 ', vp8()], ['ALPH', new Uint8Array([1])]]),
  ]
  for (const bytes of bad) assert.throws(() => rasterImageDimensions(bytes), /dsh-pv raster/)
  const riffMismatch = webp('VP8 ', vp8()); new DataView(riffMismatch.buffer).setUint32(4, riffMismatch.length, true)
  assert.throws(() => rasterImageDimensions(riffMismatch), /RIFF/)
  const nonzeroPadding = webp('VP8L', vp8l()); nonzeroPadding[nonzeroPadding.length - 1] = 1
  assert.throws(() => rasterImageDimensions(nonzeroPadding), /padding/)
  const truncated = webp('VP8 ', vp8()).subarray(0, 29); new DataView(truncated.buffer).setUint32(4, truncated.length - 8, true)
  assert.throws(() => rasterImageDimensions(truncated), /不完整/)
})

test('dsh-pv raster: raster-only packs raise the minimum player version to 0.9.5', () => {
  for (const asset of ['raster-timeline', 'raster-atlas']) assert.equal(packRequires({ canvas: { renderer: 'dsh-pv', assets: { [asset]: asset === 'raster-timeline' ? 'data/raster.json' : 'art/raster.webp' } } }), '0.9.5')
})

test('dsh-pv raster: existing Pillow-encoded static transparent WebP artwork remains compatible', () => {
  const folder = new URL('../presets/dsh-pv/art/', import.meta.url)
  const files = readdirSync(folder).filter(name => name.endsWith('.webp'))
  assert.equal(files.length, 9)
  let transparent = 0
  for (const name of files) {
    const bytes = readFileSync(new URL(name, folder)), dimensions = rasterImageDimensions(bytes)
    assert.ok(dimensions.width > 0 && dimensions.height > 0, name)
    if (bytes.subarray(12, 16).toString() === 'VP8X' && bytes[20] & 16) transparent++
  }
  assert.ok(transparent > 0, 'at least one real transparent WebP validates the VP8X/ALPH path')
})

test('dsh-pv raster: validates atlas indices, crops, decoded size and total memory bounds', () => {
  const raster = validateRasterTimeline(descriptor())
  assert.equal(validateRasterAtlases(raster, [image()]).atlases.length, 1)
  assert.throws(() => validateRasterAtlases(raster, []), /缺少/)
  assert.throws(() => validateRasterAtlases(raster, [image(7, 8)]), /src/)
  const bad = validateRasterTimeline(descriptor()); bad.frames[0].ops[0].atlas = 1
  assert.throws(() => validateRasterAtlases(bad, [image()]), /索引/)
  assert.throws(() => validateRasterAtlases(raster, Array.from({ length: 5 }, () => image(4096, 4096))), /总像素/)
  assert.throws(() => validateRasterAtlases(raster, [image(8192, 8192)]), /尺寸/)
})

test('dsh-pv raster: nearest-frame selection and crop/alpha draw order survive backward seek', () => {
  const raster = validateRasterAtlases(validateRasterTimeline(descriptor()), [image()])
  assert.equal(rasterFrameAt(raster, 0), null)
  assert.equal(rasterFrameAt(raster, NaN), null)
  assert.equal(rasterFrameAt(raster, 4).t, 4)
  assert.equal(rasterFrameAt(raster, 2.5).t, 2)
  assert.equal(rasterFrameAt(raster, 1).t, 1)
  const calls = [], ctx = { globalAlpha: 1, save() { calls.push(['save']) }, restore() { calls.push(['restore']) }, drawImage(...args) { calls.push(['draw', this.globalAlpha, ...args]) } }
  raster.frames[0].ops.push({ ...op(), alpha: 0.5 }, { ...op(0, 'under'), alpha: 0.25 })
  drawRasterLayer(ctx, raster, 1.5, 'over')
  const draws = calls.filter(row => row[0] === 'draw')
  assert.equal(draws.length, 2); assert.deepEqual(draws.map(row => row[1]), [1, 0.5])
  assert.deepEqual(draws[0].slice(3), [0, 0, 8, 8, 24, 56, 128, 128])
  assert.deepEqual(calls.at(-1), ['restore'])
})

test('dsh-pv raster: undeclared optional assets keep old packs working', async () => {
  const assets = baseData(), reads = []
  const loaded = await loadDshPv(async name => { reads.push(name); return assets[name] ?? null })
  assert.equal(loaded.raster, undefined)
  assert.ok(reads.includes('raster-timeline')); assert.ok(!reads.includes('raster-atlas'))
  assert.equal(loaded.missingArt.length, 9)
})

test('dsh-pv raster: merges descriptor shards and loads every declared image part', async () => {
  const raw = descriptor(); raw.frames[2].ops[0].atlas = 1
  const assets = { ...baseData(), 'raster-timeline': [enc({ version: 1, size: raw.size, frames: raw.frames.slice(0, 1) }), enc({ frames: raw.frames.slice(1) })], 'raster-atlas': [png(), png(16, 16)] }
  const made = []
  const loaded = await loadDshPv(async name => assets[name] ?? null, { decodeImage: async bytes => { const dimensions = rasterImageDimensions(bytes); const bitmap = image(dimensions.width, dimensions.height); made.push(bitmap); return bitmap } })
  assert.equal(loaded.raster.frames.length, 3); assert.equal(loaded.raster.atlases.length, 2)
  disposeDshPvData(loaded); disposeDshPvData(loaded)
  assert.deepEqual(made.map(bitmap => bitmap.closed), [1, 1])
})

test('dsh-pv raster: corrupt declared descriptors/images fail instead of silently disappearing', async () => {
  for (const additions of [
    { 'raster-timeline': [] }, { 'raster-timeline': [enc({ ...descriptor(), file: 'a.png' })] },
    { 'raster-timeline': [enc(descriptor())] }, { 'raster-timeline': [enc(descriptor())], 'raster-atlas': [png(9000, 1)] },
    { 'raster-timeline': [enc({ version: 1, size: [1280, 720], frames: [] }), enc({ version: 2, frames: descriptor().frames })] },
  ]) {
    const assets = { ...baseData(), ...additions }
    await assert.rejects(loadDshPv(async name => assets[name] ?? null, { decodeImage: async () => { assert.fail('invalid input must fail before image allocation') } }), /raster/)
  }
})

test('dsh-pv raster: failed decode closes art and completed atlas images exactly once', async () => {
  const assets = { ...baseData(), 'maid-left': [new Uint8Array([7])], 'raster-timeline': [enc(descriptor())], 'raster-atlas': [png(), png()] }, made = []
  let atlasAt = 0
  await assert.rejects(loadDshPv(async name => assets[name] ?? null, { decodeImage: async bytes => {
    if (bytes[0] !== 7 && ++atlasAt === 2) throw new Error('synthetic decode failure')
    const bitmap = image(); made.push(bitmap); return bitmap
  } }), /synthetic decode failure/)
  assert.equal(made.length, 2); assert.deepEqual(made.map(bitmap => bitmap.closed), [1, 1])
  disposeDshPvData({ art: { a: made[0] }, raster: { atlases: made } })
  assert.deepEqual(made.map(bitmap => bitmap.closed), [1, 1])
  const mismatch = { ...baseData(), 'raster-timeline': [enc(descriptor())], 'raster-atlas': [png()] }, wrong = image(9, 8)
  await assert.rejects(loadDshPv(async name => mismatch[name] ?? null, { decodeImage: async () => wrong }), /尺寸不匹配/)
  assert.equal(wrong.closed, 1)
})

test('dsh-pv raster: Film renders under/vector/over before character and chrome layers', () => {
  const events = [], raster = validateRasterAtlases(validateRasterTimeline({ version: 1, size: [1280, 720], frames: [{ t: 0, ops: [op(0, 'over'), op(1, 'under')] }] }), [image(8, 8, 'over'), image(8, 8, 'under')])
  const ctx = new Proxy({ canvas: { width: 1280, height: 720 }, drawImage(bitmap) { events.push(bitmap.id) } }, { get(target, key) { return key in target ? target[key] : () => {} }, set(target, key, value) { target[key] = value; return true } })
  const film = new DshPvFilm()
  film.setData({ timeline: { pal: [], hardCut: 100, uiGain: [[0, 1]], shots: [{ s: 0, e: 5, lay: ['raw'], kf: [{ o: [] }] }] }, chat: {}, band: {}, raster })
  film.ops = () => events.push('vector'); film.art_ = () => events.push('art'); film.header = () => events.push('header'); film.band_ = () => {}; film.post = () => {}
  film.frame(ctx, 1)
  assert.deepEqual(events, ['under', 'vector', 'over', 'art', 'header'])
  film.setData({ timeline: { pal: [], shots: [] }, chat: {}, band: {} })
  assert.equal(film.raster, null)
})
