// Independent review regressions. Every cue/text is synthetic test data.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { preparePublish } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { parseWorkshopPublish, retimeCues, normalizeLyricLine, checkTiming, validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { includeLyrics, MILI_LYRICS_LICENSE, MILI_TERMS } from '../presets/ports/lyrics-resource.mjs'

const sha = text => createHash('sha256').update(text).digest('hex')
const meta = { id: 'independent-review', version: '1.0.0', license: 'MIT', author: 'Synthetic tester', lyricsLicense: 'CC0-1.0', lyricsCredit: 'Synthetic tester; synthetic translation', lyricsSource: 'https://example.com/synthetic-permission' }
const base = () => ({ format: 'dsh-mv-pack', version: 1, title: 'Independent synthetic review', duration: 10, canvas: { renderer: 'generic' }, 'x-dsh-mv-workshop': { ...meta } })
async function withFixture(raw, files, work) {
  const src = mkdtempSync(join(tmpdir(), 'dsh-mv-review-src-'))
  const out = mkdtempSync(join(tmpdir(), 'dsh-mv-review-out-'))
  try {
    writeFileSync(join(src, 'mv.json'), JSON.stringify(raw))
    for (const [path, value] of Object.entries(files)) { mkdirSync(dirname(join(src, path)), { recursive: true }); writeFileSync(join(src, path), value) }
    const request = parseWorkshopPublish({ manifestPath: join(src, 'mv.json'), ...meta })
    await work({ src, out, request })
  } finally { rmSync(src, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }) }
}

test('review: missing request declarations reuse original manifest lyric rights without inventing them', async () => {
  const raw = { ...base(), lyrics: { file: 'lyrics.json' } }
  await withFixture(raw, { 'lyrics.json': JSON.stringify([{ time: 1, end: 2, en: 'Synthetic rights fixture' }]) }, async ({ request, out }) => {
    const omitted = parseWorkshopPublish(Object.fromEntries(Object.entries(request).filter(([key]) => !['lyricsLicense', 'lyricsCredit', 'lyricsSource'].includes(key))))
    const result = await preparePublish(omitted, { publishRoot: out })
    assert.equal(result.ok, true, result.errors.join('\n'))
    const published = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
    for (const field of ['lyricsLicense', 'lyricsCredit', 'lyricsSource']) assert.equal(published['x-dsh-mv-workshop'][field], meta[field])
  })
})

test('review: precomputed spectrum survives canonical export without an unsupported offset field', async () => {
  const raw = { ...base(), spectrum: { file: 'spectrum.json' } }
  const spectrum = { fps: 2, bands: 2, frames: [[0, 0.2], [0.4, 1]] }
  await withFixture(raw, { 'spectrum.json': JSON.stringify(spectrum) }, async ({ request, out }) => {
    const result = await preparePublish(request, { publishRoot: out })
    assert.equal(result.ok, true, result.errors.join('\n'))
    const published = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
    assert.deepEqual(Object.keys(published.spectrum), ['file'])
    assert.deepEqual(JSON.parse(readFileSync(join(result.dir, published.spectrum.file), 'utf8')), spectrum)
    assert.equal(published.audio, undefined)
  })
})

test('review: timing-only packs retain their existing text-free timing track', async () => {
  const raw = base()
  raw['x-dsh-mv-workshop'].lyricsTiming = 'custom-timing.json'
  const timing = { format: 'dsh-mv-lyrics-timing', version: 1, lines: [{ t: 1, e: 2, h: '0123456789abcdef', w: [1, 1.5] }] }
  await withFixture(raw, { 'custom-timing.json': JSON.stringify(timing) }, async ({ request, out }) => {
    const result = await preparePublish(request, { publishRoot: out })
    assert.equal(result.ok, true, result.errors.join('\n'))
    const published = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
    assert.ok(published['x-dsh-mv-workshop'].lyricsTiming, 'source timing must not silently disappear')
    const preserved = JSON.parse(readFileSync(join(result.dir, published['x-dsh-mv-workshop'].lyricsTiming), 'utf8'))
    assert.deepEqual(preserved, timing)
    assert.deepEqual(checkTiming(preserved, 10).errors, [])
    assert.equal(published.lyrics, undefined)
    assert.equal(result.timingLines, 1)
    assert.equal(result.lyricLines, 0)
  })
})

test('review: enhanced word/end timing round trips and both LRC and manifest offsets apply once', async () => {
  const raw = { ...base(), lyrics: { file: 'lyrics.lrc', offset: 0.25 } }
  const text = '[offset:100]\n[00:01.00]<00:01.00>Synthetic <00:01.50>word\n[00:02.00]\n'
  await withFixture(raw, { 'lyrics.lrc': text }, async ({ request, out }) => {
    const result = await preparePublish(request, { publishRoot: out })
    assert.equal(result.ok, true, result.errors.join('\n'))
    const published = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
    assert.equal(published.lyrics.offset, 0.25)
    const canonical = parseLyrics(published.lyrics.file, readFileSync(join(result.dir, published.lyrics.file), 'utf8'), { duration: 10 })
    assert.equal(canonical.length, 1)
    assert.equal(canonical[0].time, 0.9)
    assert.equal(canonical[0].end, 1.9)
    assert.deepEqual(canonical[0].words.map(word => word.time), [0.9, 1.4])
    const shifted = canonical.map(cue => ({ ...cue, time: cue.time + published.lyrics.offset, end: cue.end + published.lyrics.offset, words: cue.words.map(word => ({ ...word, time: word.time + published.lyrics.offset })) }))
    const timing = JSON.parse(readFileSync(join(result.dir, published['x-dsh-mv-workshop'].lyricsTiming), 'utf8'))
    assert.equal(timing.lines[0].h, sha(normalizeLyricLine('Synthetic word')).slice(0, 16))
    const retimed = await retimeCues(shifted, timing, async value => sha(value).slice(0, 16))
    assert.equal(retimed.matched, 1)
    assert.equal(retimed.cues[0].time, 1.15)
    assert.equal(retimed.cues[0].end, 2.15)
    assert.deepEqual(retimed.cues[0].words.map(word => word.time), [1.15, 1.65])
  })
})

test('review: lyric JS is canonicalized without executing code, and declared provenance/cover stay intact', async () => {
  const raw = { ...base(), lyrics: { file: 'lyrics.js', offset: -0.25 }, audio: { file: 'own-song.mp3' } }
  const source = 'globalThis.__independentLyricsRun=true; const LYRICS=[{t:1,end:2,en:"Synthetic source",cn:"自造源数据"}]; throw new Error("never run");'
  const cover = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
  delete globalThis.__independentLyricsRun
  try {
    await withFixture(raw, { 'lyrics.js': source, 'own-song.mp3': 'synthetic private music placeholder', 'README.md': 'Synthetic original documentation', 'NOTICE.md': 'Synthetic provenance notice', 'LICENSE.txt': 'Synthetic code license', 'cover.png': cover }, async ({ request, out }) => {
      const result = await preparePublish(request, { publishRoot: out })
      assert.equal(result.ok, true, result.errors.join('\n'))
      assert.equal(globalThis.__independentLyricsRun, undefined)
      assert.ok(!result.files.some(file => /own-song|lyrics\.js/.test(file.path)))
      const published = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
      assert.equal(published.lyrics.offset, -0.25)
      assert.equal(parseLyrics(published.lyrics.file, readFileSync(join(result.dir, published.lyrics.file), 'utf8'))[0].end, 2)
      assert.deepEqual(readFileSync(join(result.dir, 'cover.png')), cover)
      assert.match(readFileSync(join(result.dir, 'README.md'), 'utf8'), /Synthetic original documentation/)
      assert.equal(readFileSync(join(result.dir, 'NOTICE.md'), 'utf8'), 'Synthetic provenance notice')
      assert.equal(readFileSync(join(result.dir, 'LICENSE.txt'), 'utf8'), 'Synthetic code license')
      assert.ok(readdirSync(result.dir).includes(published.lyrics.file))
    })
  } finally { delete globalThis.__independentLyricsRun }
})

test('review: unreadable declared tracks fail publication instead of silently producing a partial pack', async () => {
  for (const role of ['lyrics', 'spectrum']) {
    const raw = { ...base(), [role]: { file: role === 'lyrics' ? 'missing-lyrics.json' : 'missing-spectrum.json' } }
    await withFixture(raw, {}, async ({ request, out }) => {
      const result = await preparePublish(request, { publishRoot: out })
      assert.equal(result.ok, false)
      assert.equal(result.dir, null)
      assert.ok(result.errors.some(error => /无法保留歌词|无法保留频谱数据/.test(error)))
      assert.deepEqual(readdirSync(out), [], 'no partial publication folder written')
    })
  }
})

test('review: validation never reads unsafe paths or follows remote lyric references', async () => {
  const raw = { ...base(), lyrics: { file: 'https://example.com/lyrics.json' } }
  const manifestText = JSON.stringify(raw)
  const reads = []
  const result = await validateWorkshopPack({
    id: meta.id,
    files: [{ path: 'mv.json', size: Buffer.byteLength(manifestText) }, { path: '../unsafe.js', size: 1 }, { path: '.hidden.js', size: 1 }],
    readText: async path => { reads.push(path); assert.equal(path, 'mv.json'); return manifestText },
  })
  assert.ok(result.errors.some(error => /包内相对路径/.test(error)))
  assert.ok(result.errors.some(error => /文件路径不允许/.test(error)))
  assert.deepEqual(reads, ['mv.json'])
})

test('review: port lyric helper only reads existing static literals and writes separate resource terms', async () => {
  delete globalThis.__reviewPortLyricsRun
  try {
    const js = 'globalThis.__reviewPortLyricsRun=true; export const LYRICS=[{t:1,end:2,en:"Synthetic port caption",cn:"自造适配字幕"}];'
    const wallpaper = 'window.LYRIC_LINES = ' + JSON.stringify([{ start: 1, end: 2, en: 'Synthetic wallpaper caption', zh: '自造桌面字幕' }]) + ';\n'
    for (const [kind, text] of [['js', js], ['wallpaper', wallpaper]]) {
      await withFixture(base(), { 'source.js': text }, async ({ src, out }) => {
        const resource = includeLyrics({ source: join(src, 'source.js'), out, kind, duration: 10, credit: 'Synthetic upstream test' })
        assert.equal(globalThis.__reviewPortLyricsRun, undefined)
        assert.equal(resource.workshop.lyricsLicense, MILI_LYRICS_LICENSE)
        assert.notEqual(resource.workshop.lyricsLicense, 'MIT')
        assert.equal(resource.workshop.lyricsSource, MILI_TERMS)
        assert.equal(resource.provenance.sourceSha256, sha(text))
        assert.equal(resource.provenance.cueCount, 1)
        const cues = parseLyrics(resource.lyrics.file, readFileSync(join(out, resource.lyrics.file), 'utf8'), { duration: 10 })
        assert.deepEqual(cues.map(cue => [cue.time, cue.end]), [[1, 2]])
        assert.deepEqual(checkTiming(JSON.parse(readFileSync(join(out, 'lyrics.timing.json'), 'utf8')), 10).errors, [])
        assert.match(readFileSync(join(out, 'LYRICS-NOTICE.md'), 'utf8'), /MIT license does not apply|MIT.*does not apply/)
      })
    }
  } finally { delete globalThis.__reviewPortLyricsRun }
})

test('review: JSON word data exceeding its cap or containing invalid stamps fails rather than truncating', async () => {
  for (const words of [Array.from({ length: 401 }, (_, i) => ({ text: 'Synthetic', time: 1 + i / 1000 })), [{ text: 'Synthetic', time: 'invalid' }]]) {
    const raw = { ...base(), lyrics: { file: 'lyrics.json' } }
    await withFixture(raw, { 'lyrics.json': JSON.stringify([{ time: 1, end: 2, en: 'Synthetic word fixture', words }]) }, async ({ request, out }) => {
      const result = await preparePublish(request, { publishRoot: out })
      assert.equal(result.ok, false)
      assert.ok(result.errors.some(error => /words|逐词时间/.test(error)))
      assert.equal(result.dir, null)
    })
  }
})

test('review: declared nested assets and their companion attribution survive without crawling private files', async () => {
  const raw = base()
  raw.canvas = { renderer: 'script', script: 'scenes.js', assets: { tree: 'data/tree.json', texture: 'art/texture.png' } }
  const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 20, 30])
  const files = {
    'scenes.js': 'function render(){return ["Synthetic geometry"]}',
    'data/tree.json': '{"nodes":[1,2,3]}', 'art/texture.png': image,
    'data/NOTICE.md': 'Synthetic data attribution', 'data/LICENSE.md': 'Synthetic data terms',
    'art/NOTICE.md': 'Synthetic image attribution', 'LYRICS-NOTICE.md': 'Synthetic separate lyric terms',
    'data/private.json': '{"private":"not declared"}', 'song.mp3': 'synthetic private music bytes',
  }
  await withFixture(raw, files, async ({ request, out }) => {
    const result = await preparePublish(request, { publishRoot: out })
    assert.equal(result.ok, true, result.errors.join('\n'))
    for (const path of ['data/tree.json', 'art/texture.png', 'data/NOTICE.md', 'data/LICENSE.md', 'art/NOTICE.md', 'LYRICS-NOTICE.md']) assert.deepEqual(readFileSync(join(result.dir, path)), Buffer.from(files[path]), path)
    assert.ok(!result.files.some(file => file.path === 'data/private.json' || file.path === 'song.mp3'))
  })
})
