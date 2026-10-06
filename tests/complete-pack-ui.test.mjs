import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { parseWorkshopPublish } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { MV_PACK_JSON_SCHEMA, templateFiles } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { fetchPackText, loadPackFromHost } from '../.dsh-plugin/client/mv-pack-state.mjs'
import { publishWorkshopPack, rememberedTrackApplies } from '../.dsh-plugin/client/mv-workshop-state.mjs'

const metadata = {
  id: 'synthetic-complete', version: '1.0.0', license: 'MIT', author: 'Test author',
  lyricsLicense: 'CC0-1.0', lyricsCredit: 'Test author; test translation', lyricsSource: 'https://example.com/test-permission',
}
const manifest = {
  format: 'dsh-mv-pack', version: 1, title: 'Synthetic complete pack', duration: 10,
  lyrics: { file: 'lyrics.js', offset: 0.2 }, spectrum: { file: 'spectrum.json' },
  canvas: { renderer: 'generic' }, 'x-dsh-mv-workshop': metadata,
}

test('complete-pack schema and normalized metadata separate visual and lyric rights', () => {
  const ws = MV_PACK_JSON_SCHEMA.properties['x-dsh-mv-workshop']
  assert.equal(ws.type, 'object')
  assert.equal(ws.properties.lyricsLicense.maxLength, 120)
  assert.equal(ws.properties.lyricsCredit.maxLength, 500)
  assert.equal(ws.properties.lyricsSource.maxLength, 300)
  assert.ok(new RegExp(ws.properties.lyricsSource.pattern).test(metadata.lyricsSource))
  assert.ok(!new RegExp(ws.properties.lyricsSource.pattern).test('http://example.com/test'))
  assert.match(ws.properties.lyricsLicense.description, /independent|never inferred|automatically/)
  const pack = parseMvPack(manifest)
  for (const field of ['lyricsLicense', 'lyricsCredit', 'lyricsSource']) assert.equal(pack.workshop[field], metadata[field])
  assert.equal(pack.audio, undefined, 'an installed complete pack still requires user-owned music')
})

test('complete-pack template explains automatic resource downloads in both languages', () => {
  for (const name of ['README.md', 'README.zh.md']) {
    const text = templateFiles().find(file => file.path === name).text
    for (const phrase of ['0.9.4', 'lyricsLicense', 'lyricsCredit', 'lyricsSource', 'canvas.assets', '512 KiB', 'lyrics.timing.json']) assert.ok(text.includes(phrase), `${name}: ${phrase}`)
    assert.doesNotMatch(text, /Workshop uploads still exclude lyric text|创意工坊仍不上传歌词文本/)
  }
  assert.match(templateFiles().find(file => file.path === 'README.md').text, /only music\/video/)
  assert.match(templateFiles().find(file => file.path === 'README.zh.md').text, /仅去掉歌曲音频 \/ 视频/)
})

test('client fetches bundled lyric/spectrum data through the existing Host roles without audio reads', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mv-complete-ui-'))
  const source = 'export const LYRICS=[{t:1,end:2,en:"Synthetic resource test",cn:"自造资源测试"}]; throw new Error("must never run");'
  const spectrum = JSON.stringify({ fps: 2, bands: 2, frames: [[0, 0.1], [0.2, 1]] })
  try {
    writeFileSync(join(dir, 'mv.json'), JSON.stringify(manifest))
    writeFileSync(join(dir, 'lyrics.js'), source)
    writeFileSync(join(dir, 'spectrum.json'), spectrum)
    const roles = []
    const api = {
      packLoad: async ({ path }) => ({ ok: true, value: await loadPack(path) }),
      packRead: async request => { roles.push(request.role); return { ok: true, value: await readPackFile(request) } },
    }
    const loaded = await loadPackFromHost(api, join(dir, 'mv.json'))
    assert.equal(loaded.files.lyrics.exists, true)
    assert.equal(loaded.files.spectrum.exists, true)
    const lyricFile = await fetchPackText(api, loaded.manifestPath, 'lyrics')
    const spectrumFile = await fetchPackText(api, loaded.manifestPath, 'spectrum')
    assert.equal(lyricFile.text, source)
    assert.equal(parseLyrics(lyricFile.name, lyricFile.text, { duration: 10 }).length, 1)
    assert.equal(spectrumFile.text, spectrum)
    assert.deepEqual(roles, ['lyrics', 'spectrum'])
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('publish request forwarding preserves explicit distribution declaration fields', async () => {
  const request = parseWorkshopPublish({ manifestPath: 'C:/synthetic/mv.json', ...metadata })
  let sent
  const value = { ok: true, lyricLines: 1, timingLines: 1 }
  const result = await publishWorkshopPack({ workshopPublish: async payload => { sent = payload; return { ok: true, value: { ok: true, value } } } }, request)
  assert.equal(result, value)
  for (const field of ['lyricsLicense', 'lyricsCredit', 'lyricsSource']) assert.equal(sent[field], metadata[field])
  const source = readFileSync(new URL('../.dsh-plugin/client/mv-workshop.jsx', import.meta.url), 'utf8')
  for (const field of ['lyricsLicense', 'lyricsCredit', 'lyricsSource']) {
    assert.match(source, new RegExp(`${field}: ws\\.${field} \\?\\? ''`), 'editor defaults to manifest declarations, never guesses rights')
    assert.match(source, new RegExp(`${field}: form\\.${field}\\.trim\\(\\)`), 'editor sends the declared fields')
  }
  assert.match(source, /歌词与译文使用条款（不自动继承代码许可）/)
  assert.match(source, /包里没有歌曲音频或无权分享的素材/)
})

test('panel and catalogue expose automatic packaged lyrics while preserving legacy timing-only packs', () => {
  const panel = readFileSync(new URL('../.dsh-plugin/client/canvas-mv.jsx', import.meta.url), 'utf8')
  const catalogue = readFileSync(new URL('../.dsh-plugin/client/mv-workshop.jsx', import.meta.url), 'utf8')
  assert.match(panel, /for \(const role of \['lyrics', 'spectrum'\]\)/)
  assert.match(panel, /fetchPackText\(api, pack\.manifestPath, role/)
  assert.match(panel, /useLyricsText\(name, text, \{ remember: false, shift: pack\.pack\.lyrics\?\.offset \?\? 0 \}\)/)
  assert.match(panel, /包内歌词与译文已自动加载；只需选择你自己的音乐文件/)
  assert.match(catalogue, /current\.lyrics \? '含歌词与译文' : current\.timing \? '仅歌词时间轴' : '无歌词轨'/)
  assert.match(catalogue, /歌词和译文随包下载，打开时自动加载/)
  assert.match(catalogue, /已授权歌词、译文和画面资源可随包安装并自动加载/)
  assert.match(catalogue, /pack\.lyrics && <span className="mv-card-sub">歌词与译文已包含 · 只需自备音乐/)
  assert.match(panel, /rememberedTrackApplies\(pack, l, bundledLoaded\.lyrics\)/)
  assert.match(panel, /rememberedTrackApplies\(pack, sp, bundledLoaded\.spectrum\)/)
})

test('updated packaged tracks win over old cached selections and overrides are version-bound', () => {
  const pack = { pack: parseMvPack(manifest) }
  const oldCache = { name: 'old-synthetic.lyrics.json', text: 'old synthetic data' }
  assert.equal(rememberedTrackApplies(pack, oldCache, true), false, 'pre-0.9.4 cache never silently replaces new bundled lyrics')
  assert.equal(rememberedTrackApplies(pack, oldCache, false), true, 'timing-only or failed bundled track may still use the user copy')
  assert.equal(rememberedTrackApplies(pack, { ...oldCache, override: true, packVersion: metadata.version }, true), true, 'a deliberate current-version replacement is preserved')
  assert.equal(rememberedTrackApplies(pack, { ...oldCache, override: true, packVersion: '0.9.9' }, true), false, 'updates select new packaged tracks instead of carrying a stale override')
  assert.equal(rememberedTrackApplies(pack, { ...oldCache, override: true }, true), false)
  assert.equal(rememberedTrackApplies({ pack: { workshop: {} } }, { ...oldCache, override: true, packVersion: metadata.version }, true), false)
})
