import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { checkDshPvFont, DSHPV_FONT_ASSETS, DSHPV_FONT_LIMITS, parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadDshPvFonts, DSHPV_FONT_FAMILIES } from '../.dsh-plugin/client/mv/dshpv/fonts.mjs'
import { packAssetReader } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { packRequires, parseWorkshopIndex, validateWorkshopPack, WORKSHOP_INDEX_FORMAT } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { MV_PACK_JSON_SCHEMA, templateFiles } from '../.dsh-plugin/shared/mv-pack-template.mjs'

// Synthetic sfnt header/directory/name only; no copyrighted glyph or song data is a fixture.
const ttf = (tail = 0, family = 'Space Mono', style = 'Bold') => {
  const textBytes = (family.length + style.length) * 2, nameLength = 30 + textBytes
  const bytes = new Uint8Array(48 + nameLength), view = new DataView(bytes.buffer)
  view.setUint32(0, 0x00010000); view.setUint16(4, 2)
  bytes.set(new TextEncoder().encode('head'), 12)
  view.setUint32(20, 44); view.setUint32(24, 4); bytes[47] = tail
  bytes.set(new TextEncoder().encode('name'), 28); view.setUint32(36, 48); view.setUint32(40, nameLength)
  view.setUint16(50, 2); view.setUint16(52, 30)
  let stringOffset = 0
  for (const [i, text] of [family, style].entries()) {
    const at = 54 + i * 12
    view.setUint16(at, 3); view.setUint16(at + 2, 1); view.setUint16(at + 4, 0x0409); view.setUint16(at + 6, i + 1)
    view.setUint16(at + 8, text.length * 2); view.setUint16(at + 10, stringOffset)
    for (let j = 0; j < text.length; j++) view.setUint16(78 + stringOffset + j * 2, text.charCodeAt(j))
    stringOffset += text.length * 2
  }
  return bytes
}
const anton = (tail = 1) => ttf(tail, 'Anton', 'Regular')
const manifest = (assets = { 'font-head': DSHPV_FONT_ASSETS['font-head'].path, 'font-banner': DSHPV_FONT_ASSETS['font-banner'].path }) => ({
  format: 'dsh-mv-pack', version: 1, title: 'Synthetic font verification', duration: 10,
  canvas: { renderer: 'dsh-pv', assets: { timeline: 'data/timeline.json', chat: 'data/chat.json', band: 'data/band.json', ...assets } },
  'x-dsh-mv-workshop': { id: 'test-fonts', version: '1.0.0', license: 'MIT AND OFL-1.1', author: 'Synthetic test author', fontsLicense: 'OFL-1.1', fontsCredit: 'Original font authors; synthetic test attribution', fontsNotice: 'fonts/NOTICE.md' },
})
const contents = (raw = manifest()) => ({
  'mv.json': JSON.stringify(raw), 'data/timeline.json': '{}', 'data/chat.json': '{}', 'data/band.json': '{}',
  'fonts/NOTICE.md': 'Space Mono Bold and Anton Regular. Original font authors; OFL-1.1.',
  'fonts/OFL_spacemono.txt': 'Synthetic license validation fixture: SIL OPEN FONT LICENSE Version 1.1',
  'fonts/OFL_anton.txt': 'Synthetic license validation fixture: SIL OPEN FONT LICENSE Version 1.1',
  'fonts/SpaceMono-Bold.ttf': ttf(), 'fonts/Anton-Regular.ttf': anton(),
})
const asBytes = value => typeof value === 'string' ? new TextEncoder().encode(value) : value
const validate = (files, options = {}) => validateWorkshopPack({ id: 'test-fonts', files: Object.entries(files).map(([path, value]) => ({ path, size: asBytes(value).byteLength })), readText: path => { assert.equal(typeof files[path], 'string', `${path} must not be binary-decoded`); return files[path] }, readBytes: path => asBytes(files[path]), ...options })
const reader = (sources = { 'font-head': ttf(), 'font-banner': anton() }) => async name => sources[name] === undefined ? null : [sources[name]]
const environment = () => {
  const added = [], deleted = [], created = [], current = new Set()
  const fontSet = { add(face) { added.push(face); current.add(face) }, delete(face) { deleted.push(face); current.delete(face) } }
  class FontFaceClass {
    constructor(family, source, descriptors) { Object.assign(this, { family, source, descriptors }); created.push(this) }
    async load() { return this }
  }
  return { added, deleted, created, current, fontSet, FontFaceClass }
}

test('dsh-pv fonts: only two explicit renderer-scoped single-file TTF asset paths are accepted', () => {
  const parsed = parseMvPack(manifest())
  assert.equal(parsed.canvas.assets['font-head'], 'fonts/SpaceMono-Bold.ttf')
  assert.equal(parsed.workshop.fontsLicense, 'OFL-1.1')
  assert.equal(parsed.workshop.fontsNotice, 'fonts/NOTICE.md')
  assert.equal(packRequires(parsed), '0.9.5')
  assert.equal(parseMvPack(manifest({ constructor: 'data/ordinary.json' })).canvas.assets.constructor, 'data/ordinary.json')
  for (const assets of [{ 'font-head': ['fonts/SpaceMono-Bold.ttf'] }, { 'font-head': 'fonts/consola.ttf' }, { 'font-banner': 'fonts/msyh.ttf' }, { 'font-head': 'https://example.com/SpaceMono-Bold.ttf' }, { 'font-head': 'fonts/not-font.json' }, { arbitrary: 'fonts/SpaceMono-Bold.ttf' }, { 'font-banner': '../Anton-Regular.ttf' }]) assert.throws(() => parseMvPack(manifest(assets)), /canvas\.assets/)
  for (const renderer of ['generic', 'script']) {
    const raw = manifest(); raw.canvas.renderer = renderer; if (renderer === 'script') raw.canvas.script = 'scenes.js'
    assert.throws(() => parseMvPack(raw), /dsh-pv/)
  }
})

test('dsh-pv fonts: sfnt signature, size and table bounds are checked without evaluating data', () => {
  assert.deepEqual(checkDshPvFont(ttf()).errors, [])
  assert.deepEqual(checkDshPvFont(ttf().buffer).errors, [])
  for (const bytes of [null, [], new Uint8Array(11), new Uint8Array(DSHPV_FONT_LIMITS.fileBytes + 1), new TextEncoder().encode('url(https://example.com/font.ttf)')]) assert.ok(checkDshPvFont(bytes).errors.length)
  const wrongSignature = ttf(); wrongSignature.set(new TextEncoder().encode('OTTO'), 0)
  assert.match(checkDshPvFont(wrongSignature).errors[0], /TrueType/)
  const oversizedTable = ttf(); new DataView(oversizedTable.buffer).setUint32(24, 1000)
  assert.match(checkDshPvFont(oversizedTable).errors[0], /超出文件范围/)
  const directoryOverlap = ttf(); new DataView(directoryOverlap.buffer).setUint32(20, 12)
  assert.match(checkDshPvFont(directoryOverlap).errors[0], /超出文件范围/)
})

test('dsh-pv fonts: renamed Windows/unrelated families or the wrong supported style are rejected', async () => {
  assert.deepEqual(checkDshPvFont(ttf(), 'font-head').errors, [])
  assert.deepEqual(checkDshPvFont(anton(), 'fonts/Anton-Regular.ttf').errors, [])
  for (const bytes of [ttf(0, 'Consolas', 'Regular'), ttf(0, 'Microsoft YaHei', 'Regular'), ttf(0, 'Segoe UI Symbol', 'Regular'), ttf(0, 'Space Mono', 'Regular'), anton()]) {
    assert.ok(checkDshPvFont(bytes, 'fonts/SpaceMono-Bold.ttf').errors.some(error => /身份不符/.test(error)))
    const env = environment()
    await assert.rejects(loadDshPvFonts(reader({ 'font-head': bytes }), env), /name 表身份不符/)
    assert.equal(env.created.length, 0)
    const files = contents(); files['fonts/SpaceMono-Bold.ttf'] = bytes
    assert.ok((await validate(files)).errors.some(error => /name 表身份不符/.test(error)))
  }
})

test('dsh-pv fonts: name-table records and Unicode strings stay bounded and must establish identity', () => {
  const mutations = [
    bytes => bytes.set(new TextEncoder().encode('xxxx'), 28),
    bytes => bytes.set(new TextEncoder().encode('name'), 12),
    (bytes, view) => view.setUint16(50, DSHPV_FONT_LIMITS.maxNameRecords + 1),
    (bytes, view) => view.setUint16(52, 65535),
    (bytes, view) => view.setUint16(62, DSHPV_FONT_LIMITS.maxNameChars * 2 + 2),
    (bytes, view) => view.setUint16(64, 65535),
    (bytes, view) => view.setUint16(62, 17),
    (bytes, view) => { view.setUint16(54, 1); view.setUint16(66, 1) },
    (bytes, view) => view.setUint16(78, 0),
    (bytes, view) => view.setUint16(72, 16),
  ]
  for (const mutate of mutations) {
    const bytes = ttf(); mutate(bytes, new DataView(bytes.buffer))
    assert.ok(checkDshPvFont(bytes, 'font-head').errors.length, mutate.toString())
  }
  // Typed-array subviews retain their exact offset; no bytes outside the font are consulted.
  const padded = new Uint8Array(ttf().length + 20); padded.set(ttf(), 10)
  assert.deepEqual(checkDshPvFont(padded.subarray(10, padded.length - 10), 'font-head').errors, [])
})

test('dsh-pv fonts: workshop binary checks require independent rights, notices and OFL texts', async () => {
  const result = await validate(contents())
  assert.deepEqual(result.errors, [])
  assert.equal(result.meta.fonts, true); assert.equal(result.meta.requires, '0.9.5')
  for (const [field, value] of [['fontsLicense', undefined], ['fontsLicense', 'MIT'], ['fontsCredit', ''], ['fontsNotice', 'https://example.com/NOTICE.md']]) {
    const raw = manifest(); raw['x-dsh-mv-workshop'][field] = value
    assert.ok((await validate(contents(raw))).errors.some(error => /fonts|OFL 字体/.test(error)), field)
  }
  for (const path of ['fonts/NOTICE.md', 'fonts/OFL_spacemono.txt', 'fonts/OFL_anton.txt']) {
    const files = contents(); delete files[path]
    assert.ok((await validate(files)).errors.some(error => /字体|OFL/.test(error)), path)
  }
  const noBinary = await validate(contents(), { readBytes: undefined })
  assert.ok(noBinary.errors.some(error => /readBytes/.test(error)))
  const bad = contents(); bad['fonts/SpaceMono-Bold.ttf'] = new Uint8Array(32)
  assert.ok((await validate(bad)).errors.some(error => /TrueType/.test(error)))
  const mismatched = await validate(contents(), { readBytes: () => ttf().subarray(0, 31) })
  assert.ok(mismatched.errors.some(error => /字节长度/.test(error)))
})

test('dsh-pv fonts: undisclosed TTF and Windows font files remain forbidden', async () => {
  for (const path of ['fonts/consola.ttf', 'fonts/msyh.ttf', 'fonts/seguisym.ttf', 'fonts/unknown.ttf', 'renamed.ttf']) {
    const result = await validate({ ...contents(), [path]: ttf() })
    assert.ok(result.errors.some(error => /Windows|未声明|不受支持/.test(error)), path)
  }
  const tooBig = contents(); tooBig['fonts/SpaceMono-Bold.ttf'] = new Uint8Array(DSHPV_FONT_LIMITS.fileBytes + 1)
  assert.ok((await validate(tooBig)).errors.some(error => /太大/.test(error)))
})

test('dsh-pv fonts: catalogue retains font rights, rejects undeclared paths and raises minimum version', async () => {
  const files = contents(), checked = await validate(files)
  const entry = { ...checked.meta, requires: '0.9.1', files: Object.entries(files).map(([path, value]) => ({ path, size: asBytes(value).byteLength, sha256: createHash('sha256').update(asBytes(value)).digest('hex') })) }
  const catalogue = value => parseWorkshopIndex({ format: WORKSHOP_INDEX_FORMAT, version: 1, packs: [value] })
  const parsed = catalogue(entry).packs[0]
  assert.equal(parsed.fonts, true); assert.equal(parsed.fontsCredit, entry.fontsCredit); assert.equal(parsed.requires, '0.9.5')
  for (const value of [{ ...entry, renderer: 'script' }, { ...entry, fontsLicense: 'MIT' }, { ...entry, fontsCredit: '' }, { ...entry, files: entry.files.filter(file => file.path !== 'fonts/NOTICE.md') }, { ...entry, files: entry.files.map(file => file.path === 'fonts/Anton-Regular.ttf' ? { ...file, path: 'fonts/unknown.ttf' } : file) }]) assert.equal(catalogue(value).packs.length, 0)
})

test('dsh-pv fonts: absent optional fonts need no browser API and retain legacy fallbacks', async () => {
  const loaded = await loadDshPvFonts(async () => null, { FontFaceClass: undefined, fontSet: undefined })
  assert.deepEqual(loaded.families, {}); loaded.dispose(); loaded.dispose()
  assert.equal(packRequires(parseMvPack(manifest({}))), undefined)
})

test('dsh-pv fonts: browser faces use fixed names/weights and bytes, not URLs or JSON names', async () => {
  const env = environment(), reads = []
  const loaded = await loadDshPvFonts(async (name, options) => { reads.push([name, options]); return [name === 'font-head' ? ttf() : anton()] }, env)
  assert.deepEqual(loaded.families, DSHPV_FONT_FAMILIES)
  assert.deepEqual(env.created.map(face => [face.family, face.descriptors.weight]), [['DshMvPvSpaceMono', '700'], ['DshMvPvAnton', '400']])
  assert.ok(env.created.every(face => face.source instanceof ArrayBuffer && face.descriptors.style === 'normal'))
  assert.ok(reads.every(([name, options]) => Object.hasOwn(DSHPV_FONT_ASSETS, name) && options.maxBytes === DSHPV_FONT_LIMITS.fileBytes))
  assert.equal(env.current.size, 2); loaded.dispose(); loaded.dispose(); assert.equal(env.current.size, 0); assert.equal(env.deleted.length, 2)
})

test('dsh-pv fonts: invalid declared resources are surfaced before any faces are allocated', async () => {
  for (const bad of [[], [ttf(), ttf()], [new Uint8Array(32)], ['url(https://example.com/font.ttf)'], [{ family: 'attack', url: 'https://example.com/font.ttf' }]]) {
    const env = environment()
    await assert.rejects(loadDshPvFonts(async name => name === 'font-head' ? [ttf()] : bad, env), /dsh-pv fonts/)
    assert.equal(env.created.length, 0)
  }
  await assert.rejects(loadDshPvFonts(async () => { throw new Error('denied') }, environment()), /无法读取.*denied/)
  await assert.rejects(loadDshPvFonts(reader(), { fontSet: null }), /FontFace/)
})

test('dsh-pv fonts: identical concurrent callers share faces and reference-counted cleanup', async () => {
  const env = environment(), [a, b] = await Promise.all([loadDshPvFonts(reader(), env), loadDshPvFonts(reader(), env)])
  assert.equal(env.created.length, 2); assert.equal(env.added.length, 2)
  a.dispose(); assert.equal(env.current.size, 2)
  a.dispose(); assert.equal(env.deleted.length, 0)
  b.dispose(); assert.equal(env.current.size, 0); assert.equal(env.deleted.length, 2)
  const again = await loadDshPvFonts(reader(), env)
  assert.equal(env.created.length, 4); again.dispose(); assert.equal(env.deleted.length, 4)
})

test('dsh-pv fonts: overlapping asynchronous loading, rejection and retry do not leak faces', async () => {
  const env = environment(), resolvers = []
  env.FontFaceClass.prototype.load = function () { return new Promise(resolve => resolvers.push(() => resolve(this))) }
  const one = loadDshPvFonts(reader({ 'font-head': ttf() }), env), two = loadDshPvFonts(reader({ 'font-head': ttf() }), env)
  while (!resolvers.length) await new Promise(resolve => setImmediate(resolve))
  assert.equal(env.created.length, 1); resolvers[0]()
  const [a, b] = await Promise.all([one, two]); assert.equal(env.added.length, 1)
  a.dispose(); b.dispose(); assert.equal(env.deleted.length, 1)
  const failed = environment()
  failed.FontFaceClass.prototype.load = async function () { if (this.family === DSHPV_FONT_FAMILIES.banner) throw new Error('sanitizer rejected'); return this }
  await assert.rejects(loadDshPvFonts(reader(), failed), /font-banner.*sanitizer rejected/)
  assert.equal(failed.current.size, 0); assert.equal(failed.deleted.length, 1)
  failed.FontFaceClass.prototype.load = async function () { return this }
  const retry = await loadDshPvFonts(reader(), failed); assert.equal(failed.current.size, 2); retry.dispose(); assert.equal(failed.current.size, 0)
})

test('dsh-pv fonts: differing bytes cannot race under one family and source mutation is isolated', async () => {
  const env = environment(), bytes = Buffer.from(ttf()), loaded = await loadDshPvFonts(reader({ 'font-head': bytes }), env)
  bytes[47] = 2
  assert.equal(new Uint8Array(env.created[0].source)[47], 0)
  await assert.rejects(loadDshPvFonts(reader({ 'font-head': ttf(1) }), env), /不同字节/)
  assert.equal(env.current.size, 1); loaded.dispose()
  const next = await loadDshPvFonts(reader({ 'font-head': ttf(1) }), env); next.dispose(); assert.equal(env.current.size, 0)
})

test('dsh-pv fonts: manifest-bounded reader caps decoded bytes before font allocation', async () => {
  const size = ttf().byteLength
  const api = { async packRead(request) { assert.equal(request.asset, 'font-head'); return { ok: true, value: { bytes: size, base64: Buffer.from(ttf()).toString('base64'), done: true } } } }
  const read = packAssetReader(api, 'C:/test/mv.json', parseMvPack(manifest()))
  assert.deepEqual((await read('font-head', { maxBytes: size }))[0], ttf())
  assert.equal(await read('optional'), null)
  await assert.rejects(read('font-head', { maxBytes: size - 1 }), /读取限制/)
  await assert.rejects(read('font-head', { maxBytes: Infinity }), /限制无效/)
  const malformed = packAssetReader({ async packRead() { return { ok: true, value: { bytes: 1, base64: 'A'.repeat(100), done: true } } } }, 'C:/test/mv.json', parseMvPack(manifest()))
  await assert.rejects(malformed('font-head', { maxBytes: 32 }), /编码长度无效/)
})

test('dsh-pv fonts: template documents renderer scope, OFL notices and Windows no-redistribution boundary', () => {
  assert.equal(MV_PACK_JSON_SCHEMA.properties.canvas.properties.assets.properties['font-head'].const, 'fonts/SpaceMono-Bold.ttf')
  assert.equal(MV_PACK_JSON_SCHEMA.properties['x-dsh-mv-workshop'].properties.fontsLicense.const, 'OFL-1.1')
  for (const path of ['README.md', 'README.zh.md']) {
    const text = templateFiles().find(file => file.path === path).text
    for (const needle of ['0.9.5', 'font-head', 'font-banner', 'fontsNotice', 'OFL-1.1', '512 KiB', 'Consolas', 'Segoe UI']) assert.ok(text.includes(needle), `${path}: ${needle}`)
  }
})
