// Peripheral integration for local JavaScript lyric data. Synthetic text only.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MV_ASSET_EXTENSIONS, MV_LYRICS_EXTENSIONS, MV_PACK_LIMITS, parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { MV_PACK_JSON_SCHEMA, templateFiles } from '../.dsh-plugin/shared/mv-pack-template.mjs'

const base = { format: 'dsh-mv-pack', version: 1, title: 'Synthetic fixture' }

test('local pack: JS/MJS lyric references keep path and offset validation', () => {
  for (const file of ['lyrics.js', 'lyrics.mjs', 'data/LYRICS.JS']) {
    assert.deepEqual(parseMvPack({ ...base, lyrics: { file, offset: 0.5 } }).lyrics, { file, offset: 0.5 })
  }
  assert.ok(MV_LYRICS_EXTENSIONS.includes('.js'))
  assert.ok(MV_LYRICS_EXTENSIONS.includes('.mjs'))
  assert.throws(() => parseMvPack({ ...base, lyrics: { file: '../lyrics.js' } }), /不能含/)
  assert.throws(() => parseMvPack({ ...base, lyrics: { file: 'lyrics.cjs' } }), /lyrics\.file/)
  assert.throws(() => parseMvPack({ ...base, lyrics: { file: 'lyrics.js', offset: 31 } }), /lyrics\.offset/)
  assert.ok(!MV_ASSET_EXTENSIONS.includes('.js'), 'this does not widen executable/data asset formats')
  assert.equal(MV_PACK_LIMITS.sceneBytes, 256 * 1024, '2D scene limits are unchanged')
})

test('local pack: bitmap subtitles are opt-in, boolean, and limited to script bitmaps', () => {
  for (const output of ['pixels', 'webgl']) {
    const canvas = { renderer: 'script', script: 'scene.js', output }
    const original = parseMvPack({ ...base, canvas }).canvas
    assert.equal(original.subtitles, undefined, 'old packs retain their existing normalized data and overlay stays off')
    for (const subtitles of [true, false]) assert.equal(parseMvPack({ ...base, canvas: { ...canvas, subtitles } }).canvas.subtitles, subtitles)
    for (const subtitles of ['true', 1, null, {}]) assert.throws(() => parseMvPack({ ...base, canvas: { ...canvas, subtitles } }), /canvas\.subtitles.*布尔值/)
  }
  assert.equal(parseMvPack({ ...base, canvas: { script: 'scene.js', output: 'webgl', subtitles: true } }).canvas.subtitles, true, 'implicit script renderer is supported')
  for (const canvas of [{ renderer: 'generic' }, { renderer: 'dsh-pv' }, { renderer: 'script', script: 'scene.js' }, { renderer: 'script', script: 'scene.js', output: 'text' }]) {
    for (const subtitles of [true, false]) assert.throws(() => parseMvPack({ ...base, canvas: { ...canvas, subtitles } }), /canvas\.subtitles.*只用于/)
  }
  assert.equal(MV_PACK_JSON_SCHEMA.properties.canvas.properties.subtitles.type, 'boolean')
  assert.equal(MV_PACK_JSON_SCHEMA.properties.canvas.properties.subtitles.default, false)
})

test('local pack host: lyric JS is returned as text without evaluating helpers', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mv-lyrics-js-'))
  const source = 'export const LYRICS = [{t:1,en:"Synthetic line",cn:"Synthetic translation"}];\nthrow new Error("must not execute");\n'
  try {
    writeFileSync(join(dir, 'mv.json'), JSON.stringify({ ...base, lyrics: { file: 'lyrics.js' } }))
    writeFileSync(join(dir, 'lyrics.js'), source)
    const loaded = await loadPack(dir)
    assert.equal(loaded.files.lyrics.exists, true)
    assert.equal(loaded.files.lyrics.tooLarge, false)
    const chunk = await readPackFile({ manifestPath: loaded.manifestPath, role: 'lyrics', offset: 0, length: 1024 })
    assert.equal(Buffer.from(chunk.base64, 'base64').toString('utf8'), source)
    assert.equal(chunk.done, true)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('lyrics picker and template document static data-only JS support', () => {
  const source = readFileSync(new URL('../.dsh-plugin/client/canvas-mv.jsx', import.meta.url), 'utf8')
  assert.match(source, /LYRICS_ACCEPT\s*=\s*MV_LYRICS_EXTENSIONS\.join\(','\)/)
  assert.equal((source.match(/pickText\(LYRICS_ACCEPT, useLyricsText\)/g) ?? []).length, 2, 'initial and replacement pickers share the supported extensions')
  assert.match(source, /只读取静态 LYRICS 数据，不执行代码/)
  assert.match(source, /state\.script\.draw\([^\n]*subtitles: packRef\.current\?\.pack\?\.canvas\?\.subtitles === true/)
  for (const path of ['README.md', 'README.zh.md']) {
    const text = templateFiles().find(file => file.path === path).text
    assert.match(text, /lyrics\.js/)
    assert.match(text, /LYRICS/)
    assert.match(text, /canvas\.subtitles/)
  }
  assert.match(MV_PACK_JSON_SCHEMA.properties.lyrics.oneOf[0].description, /static LYRICS/)
})
