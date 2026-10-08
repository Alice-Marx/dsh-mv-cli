import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { DSHPV_FONT_LIMITS } from '../.dsh-plugin/shared/mv-pack.mjs'
import { createWorkshopManager, preparePublish } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { parseWorkshopIndex, parseWorkshopPublish, validateWorkshopPack, WORKSHOP_INDEX_FORMAT, WORKSHOP_LIMITS } from '../.dsh-plugin/shared/mv-workshop.mjs'

const ID = 'synthetic-dsh-pv', sha = bytes => createHash('sha256').update(bytes).digest('hex')
const bytes = value => typeof value === 'string' ? Buffer.from(value) : Buffer.from(value)
const temp = () => mkdtempSync(join(tmpdir(), 'dshpv-workshop-'))

// Synthetic sfnt identity metadata only; no real font glyphs or song/lyric data.
function font(family = 'Space Mono', style = 'Bold') {
  const nameLength = 30 + (family.length + style.length) * 2
  const data = Buffer.alloc(48 + nameLength), view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  view.setUint32(0, 0x00010000); view.setUint16(4, 2)
  data.write('head', 12); view.setUint32(20, 44); view.setUint32(24, 4)
  data.write('name', 28); view.setUint32(36, 48); view.setUint32(40, nameLength)
  view.setUint16(50, 2); view.setUint16(52, 30)
  let offset = 0
  for (const [i, text] of [family, style].entries()) {
    const at = 54 + i * 12
    view.setUint16(at, 3); view.setUint16(at + 2, 1); view.setUint16(at + 4, 0x0409); view.setUint16(at + 6, i + 1)
    view.setUint16(at + 8, text.length * 2); view.setUint16(at + 10, offset)
    for (let j = 0; j < text.length; j++) view.setUint16(78 + offset + j * 2, text.charCodeAt(j))
    offset += text.length * 2
  }
  return data
}

function fixture({ renderer = 'dsh-pv', raster = false, fonts = false } = {}) {
  const files = { 'data/timeline.json': '{}', 'data/chat.json': '{}', 'data/band.json': '{}' }
  const assets = { timeline: 'data/timeline.json', chat: 'data/chat.json', band: 'data/band.json' }
  const ws = { id: ID, version: '1.0.0', license: fonts ? 'MIT AND OFL-1.1' : 'MIT', author: 'Synthetic test author' }
  if (raster) {
    assets['raster-timeline'] = 'data/raster.json'; assets['raster-atlas'] = 'art/raster.webp'
    files['data/raster.json'] = '{"version":1,"size":[1280,720],"frames":[{"t":0,"ops":[]}]}'
    files['art/raster.webp'] = Buffer.from('synthetic image bytes; not decoded by workshop validation')
  }
  if (fonts) {
    assets['font-head'] = 'fonts/SpaceMono-Bold.ttf'; assets['font-banner'] = 'fonts/Anton-Regular.ttf'
    Object.assign(ws, { fontsLicense: 'OFL-1.1', fontsCredit: 'Synthetic font authors', fontsNotice: 'fonts/NOTICE.md' })
    Object.assign(files, {
      'fonts/SpaceMono-Bold.ttf': font(), 'fonts/Anton-Regular.ttf': font('Anton', 'Regular'),
      'fonts/OFL_spacemono.txt': 'Synthetic rights fixture: SIL OPEN FONT LICENSE Version 1.1\nSpace Mono authors\n',
      'fonts/OFL_anton.txt': 'Synthetic rights fixture: SIL OPEN FONT LICENSE Version 1.1\nAnton authors\n',
      'fonts/NOTICE.md': 'Synthetic authors and change notices for the two OFL fonts.\n',
    })
  }
  const canvas = { renderer: renderer === 'webgl' ? 'script' : renderer, assets }
  if (renderer === 'script' || renderer === 'webgl') {
    canvas.script = 'scenes.js'; files['scenes.js'] = renderer === 'webgl' ? 'function paint(gl){ gl.clear(gl.COLOR_BUFFER_BIT) }' : 'function render(){ return ["Synthetic frame"] }'
    if (renderer === 'webgl') canvas.output = 'webgl'
  }
  const raw = { format: 'dsh-mv-pack', version: 1, title: 'Synthetic complete PV', duration: 10, canvas, 'x-dsh-mv-workshop': ws }
  files['mv.json'] = JSON.stringify(raw)
  return { files, raw }
}

const listings = files => Object.entries(files).map(([path, value]) => ({ path, size: bytes(value).length }))
const validate = (files, list = listings(files)) => validateWorkshopPack({ id: ID, files: list, readText: path => bytes(files[path]).toString('utf8'), readBytes: path => bytes(files[path]) })
function extras(files, count, size = 1) {
  const list = listings(files)
  for (let i = 0; i < count; i++) { files[`data/pad-${i}.json`] = '{}'; list.push({ path: `data/pad-${i}.json`, size }) }
  return list
}
const catalogue = entry => parseWorkshopIndex({ format: WORKSHOP_INDEX_FORMAT, version: 1, commit: 'a'.repeat(40), packs: [entry] }).packs
const entry = (meta, list) => ({ ...meta, files: list.map(file => ({ ...file, sha256: 'b'.repeat(64) })) })

test('dsh-pv workshop: only built-in PV packs receive 64 files / 24 MiB, including index parsing', async () => {
  assert.equal(WORKSHOP_LIMITS.maxFiles, 40); assert.equal(WORKSHOP_LIMITS.packBytes, 8 * 1024 * 1024)
  assert.equal(WORKSHOP_LIMITS.dshPvFiles, 64); assert.equal(WORKSHOP_LIMITS.dshPvPackBytes, 24 * 1024 * 1024)
  const pv = fixture(), extended = extras(pv.files, 60)
  const good = await validate(pv.files, extended)
  assert.deepEqual(good.errors, []); assert.equal(extended.length, 64)
  assert.equal(catalogue(entry(good.meta, extended)).length, 1)
  for (const renderer of ['generic', 'script']) {
    const ordinary = fixture({ renderer }), list = extras(ordinary.files, 60)
    const result = await validate(ordinary.files, list)
    assert.ok(result.errors.some(error => /文件太多.*40/.test(error)), renderer)
    assert.equal(catalogue(entry(result.meta, list)).length, 0, renderer)
  }
})

test('dsh-pv workshop: PV expansion keeps byte cap strict while ordinary renderers stay at 8 MiB', async () => {
  const pv = fixture(), list = extras(pv.files, 47, 512 * 1024)
  const good = await validate(pv.files, list)
  assert.deepEqual(good.errors, []); assert.ok(list.reduce((sum, file) => sum + file.size, 0) > WORKSHOP_LIMITS.packBytes)
  assert.equal(catalogue(entry(good.meta, list)).length, 1)
  const exact = fixture(), baseSize = listings(exact.files).reduce((sum, file) => sum + file.size, 0), exactList = extras(exact.files, 48, 512 * 1024)
  exactList.at(-1).size -= baseSize
  assert.equal(exactList.reduce((sum, file) => sum + file.size, 0), 24 * 1024 * 1024)
  const atLimit = await validate(exact.files, exactList)
  assert.deepEqual(atLimit.errors, []); assert.equal(catalogue(entry(atLimit.meta, exactList)).length, 1)
  const tooMany = [...list, ...Array.from({ length: 65 - list.length }, (_, i) => ({ path: `data/more-${i}.json`, size: 1 }))]
  for (const file of tooMany) pv.files[file.path] ??= '{}'
  assert.ok((await validate(pv.files, tooMany)).errors.some(error => /文件太多.*64/.test(error)))
  assert.equal(catalogue(entry(good.meta, tooMany)).length, 0)
  const overBytes = extras(fixture().files, 48, 512 * 1024)
  const overFiles = fixture().files; for (const file of overBytes) overFiles[file.path] ??= '{}'
  assert.ok((await validate(overFiles, overBytes)).errors.some(error => /整个包太大.*24/.test(error)))
  assert.equal(catalogue(entry(good.meta, overBytes)).length, 0)
  for (const renderer of ['generic', 'script']) {
    const ordinary = fixture({ renderer }), ordinaryList = extras(ordinary.files, 20, 512 * 1024), checked = await validate(ordinary.files, ordinaryList)
    assert.ok(checked.errors.some(error => /整个包太大.*8/.test(error)), renderer)
    assert.equal(catalogue(entry(checked.meta, ordinaryList)).length, 0, renderer)
  }
})

test('dsh-pv workshop: renderer-specific expansion never increases script, image, JSON or font single-file caps', async () => {
  for (const renderer of ['dsh-pv', 'script', 'webgl']) {
    const value = fixture({ renderer })
    value.files['extra.js'] = 'function render(){ return [] }'
    const limit = renderer === 'webgl' ? WORKSHOP_LIMITS.webglScriptBytes : WORKSHOP_LIMITS.scriptBytes
    const list = listings(value.files).map(file => file.path === 'extra.js' ? { ...file, size: limit + 1 } : file)
    assert.ok((await validate(value.files, list)).errors.some(error => /extra\.js.*太大/.test(error)), renderer)
    const meta = (await validate(value.files)).meta
    assert.equal(catalogue(entry(meta, list)).length, 0, renderer)
    for (const [path, cap] of [['art/extra.webp', WORKSHOP_LIMITS.coverBytes], ['data/extra.json', WORKSHOP_LIMITS.fileBytes]]) {
      value.files[path] = path.endsWith('.json') ? '{}' : 'synthetic bytes'
      assert.ok((await validate(value.files, listings(value.files).map(file => file.path === path ? { ...file, size: cap + 1 } : file))).errors.some(error => error.includes(path) && /太大/.test(error)))
    }
  }
  const pv = fixture({ fonts: true }), tooLargeFont = listings(pv.files).map(file => file.path === 'fonts/SpaceMono-Bold.ttf' ? { ...file, size: DSHPV_FONT_LIMITS.fileBytes + 1 } : file)
  assert.ok((await validate(pv.files, tooLargeFont)).errors.some(error => /SpaceMono-Bold\.ttf.*太大/.test(error)))
})

test('dsh-pv workshop: raster metadata requires both declared resources and index raises minimum version', async () => {
  const both = fixture({ raster: true }), checked = await validate(both.files)
  assert.deepEqual(checked.errors, []); assert.equal(checked.meta.raster, true); assert.equal(checked.meta.requires, '0.9.5')
  const parsed = catalogue({ ...entry(checked.meta, listings(both.files)), requires: '0.9.0' })[0]
  assert.equal(parsed.raster, true); assert.equal(parsed.requires, '0.9.5')
  for (const missing of ['raster-timeline', 'raster-atlas']) {
    const value = fixture({ raster: true }); delete value.raw.canvas.assets[missing]; value.files['mv.json'] = JSON.stringify(value.raw)
    assert.equal(Boolean((await validate(value.files)).meta.raster), false, missing)
  }
  const ordinary = fixture({ renderer: 'script' }), ordinaryMeta = (await validate(ordinary.files)).meta
  assert.equal(Boolean(catalogue({ ...entry(ordinaryMeta, listings(ordinary.files)), raster: true })[0].raster), false)
})

test('dsh-pv workshop: larger packs still reject missing OFL attribution and noncanonical / Windows fonts', async () => {
  for (const missing of ['fonts/OFL_spacemono.txt', 'fonts/OFL_anton.txt', 'fonts/NOTICE.md']) {
    const value = fixture({ fonts: true }); delete value.files[missing]
    assert.ok((await validate(value.files)).errors.some(error => /字体|OFL/.test(error)), missing)
  }
  for (const field of ['fontsLicense', 'fontsCredit', 'fontsNotice']) {
    const value = fixture({ fonts: true }); delete value.raw['x-dsh-mv-workshop'][field]; value.files['mv.json'] = JSON.stringify(value.raw)
    assert.ok((await validate(value.files)).errors.some(error => /fonts|OFL/.test(error)), field)
  }
  const wrong = fixture({ fonts: true }); wrong.raw.canvas.assets['font-head'] = 'fonts/custom.ttf'; wrong.files['fonts/custom.ttf'] = font(); wrong.files['mv.json'] = JSON.stringify(wrong.raw)
  assert.ok((await validate(wrong.files)).errors.some(error => /只能引用|canvas\.assets/.test(error)))
  const renamed = fixture({ fonts: true }); renamed.files['fonts/SpaceMono-Bold.ttf'] = font('Consolas', 'Regular')
  assert.ok((await validate(renamed.files)).errors.some(error => /身份不符/.test(error)))
  const windows = fixture({ fonts: true }); windows.files['fonts/msyh.ttf'] = font('Microsoft YaHei', 'Regular')
  assert.ok((await validate(windows.files)).errors.some(error => /Windows|未声明/.test(error)))
})

test('dsh-pv workshop: Host publish and hash-verified install retain canonical fonts and exact OFL companion notices', async () => {
  const value = fixture({ fonts: true, raster: true }), source = temp(), publishRoot = temp(), installRoot = temp()
  value.raw.audio = { file: 'song.mp3' }; value.files['mv.json'] = JSON.stringify(value.raw)
  value.files['song.mp3'] = 'synthetic audio placeholder, not a recording'
  value.files['fonts/private.txt'] = 'not selected and must not be published'
  for (const [path, content] of Object.entries(value.files)) { const target = join(source, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes(content)) }
  const request = parseWorkshopPublish({ manifestPath: join(source, 'mv.json'), id: ID, version: '1.1.0', license: 'MIT AND OFL-1.1', author: 'Synthetic test author' })
  const published = await preparePublish(request, { publishRoot })
  assert.equal(published.ok, true, published.errors.join('\n'))
  assert.ok(!published.files.some(file => ['song.mp3', 'fonts/private.txt'].includes(file.path)))
  const raw = JSON.parse(readFileSync(join(published.dir, 'mv.json'), 'utf8'))
  assert.equal(raw.audio, undefined); assert.equal(raw.canvas.assets['font-head'], 'fonts/SpaceMono-Bold.ttf')
  assert.equal(raw['x-dsh-mv-workshop'].fontsLicense, 'OFL-1.1'); assert.equal(raw['x-dsh-mv-workshop'].fontsCredit, 'Synthetic font authors'); assert.equal(raw['x-dsh-mv-workshop'].fontsNotice, 'fonts/NOTICE.md')
  const preserved = ['fonts/SpaceMono-Bold.ttf', 'fonts/Anton-Regular.ttf', 'fonts/OFL_spacemono.txt', 'fonts/OFL_anton.txt', 'fonts/NOTICE.md']
  for (const path of preserved) assert.deepEqual(readFileSync(join(published.dir, path)), bytes(value.files[path]), path)
  const content = Object.fromEntries(published.files.map(file => [file.path, readFileSync(join(published.dir, file.path))]))
  const checked = await validate(content), commit = 'a'.repeat(40), index = { format: WORKSHOP_INDEX_FORMAT, version: 1, commit, packs: [{ ...checked.meta, files: published.files }] }, fetched = []
  assert.deepEqual(checked.errors, [])
  const manager = createWorkshopManager({ root: installRoot, get: async url => {
    fetched.push(url)
    if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
    const path = url.split(`/${commit}/packs/${ID}/`)[1]
    assert.ok(content[path], `only commit-pinned indexed files requested: ${url}`)
    return content[path]
  } })
  const installed = await manager.install({ id: ID })
  assert.equal(installed.version, '1.1.0')
  const installedDir = dirname(installed.manifestPath)
  for (const path of preserved) assert.deepEqual(readFileSync(join(installedDir, path)), bytes(value.files[path]), path)
  for (const file of published.files) assert.equal(sha(readFileSync(join(installedDir, file.path))), file.sha256, file.path)
  assert.ok(fetched.every(url => url.endsWith('/main/index.json') || url.includes(`/${commit}/packs/${ID}/`)))
  assert.equal(readdirSync(join(installedDir, 'fonts')).length, 5)
  assert.equal(statSync(join(installedDir, 'fonts/SpaceMono-Bold.ttf')).size, bytes(value.files['fonts/SpaceMono-Bold.ttf']).length)
})
