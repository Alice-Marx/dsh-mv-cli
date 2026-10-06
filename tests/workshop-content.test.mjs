import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  WORKSHOP_INDEX_FORMAT, WORKSHOP_LIMITS, checkSpectrum, packRequires,
  parseWorkshopIndex, parseWorkshopPublish, validateWorkshopPack,
} from '../.dsh-plugin/shared/mv-workshop.mjs'

// All text below is newly created test data, not a song or upstream lyrics.
const ID = 'complete-example'
const cue = { time: 1, end: 2, en: 'Synthetic verification line', zh: '自造验证文字' }
const sha = text => createHash('sha256').update(text).digest('hex')
const base = () => ({
  format: 'dsh-mv-pack', version: 1, title: 'Complete non-music example', duration: 10,
  canvas: { renderer: 'script', script: 'scenes.js' },
  'x-dsh-mv-workshop': { id: ID, version: '1.0.0', license: 'MIT', author: 'Test author' },
})
const authorized = (file = 'lyrics.json') => {
  const raw = base()
  raw.lyrics = { file, offset: 0.25 }
  Object.assign(raw['x-dsh-mv-workshop'], { lyricsLicense: 'CC0-1.0', lyricsCredit: 'Test author; test translation', lyricsSource: 'https://example.com/test-source' })
  return raw
}
const contents = (raw, extra = {}) => ({ 'mv.json': JSON.stringify(raw), 'scenes.js': 'function render(){return ["Synthetic scene"]}', ...extra })
const validate = files => validateWorkshopPack({ id: ID, files: Object.entries(files).map(([path, text]) => ({ path, size: Buffer.byteLength(text) })), readText: async path => { assert.ok(Object.hasOwn(files, path), path); return files[path] } })
const expectError = async (files, pattern) => {
  const result = await validate(files)
  assert.ok(result.errors.some(error => pattern.test(error)), `${pattern}: ${result.errors.join(' | ')}`)
}

test('workshop keeps explicitly licensed static lyrics in all supported formats', async () => {
  const formats = {
    'lyrics.json': JSON.stringify([cue]),
    'lyrics.lrc': '[00:01.00]Synthetic verification line\n[00:01.00]自造验证文字\n[00:02.00]\n',
    'lyrics.srt': '1\n00:00:01,000 --> 00:00:02,000\nSynthetic verification line\n自造验证文字\n',
    'lyrics.vtt': 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nSynthetic verification line\n自造验证文字\n',
    'lyrics.txt': '[00:01.00]Synthetic verification line\n[00:02.00]\n',
    'lyrics.js': 'export const LYRICS = [{t:1,end:2,en:"Synthetic verification line",cn:"自造验证文字"}];',
    'data/captions.mjs': 'const LYRICS = [{time:1,end:2,en:"Synthetic verification line",zh:"自造验证文字"}]; export { LYRICS };',
  }
  for (const [file, text] of Object.entries(formats)) {
    const result = await validate(contents(authorized(file), { [file]: text }))
    assert.deepEqual(result.errors, [], file)
    assert.equal(result.pack.lyrics.file, file)
    assert.equal(result.pack.lyrics.offset, 0.25)
    assert.equal(result.meta.lyrics, true)
    assert.equal(result.meta.lyricsLicense, 'CC0-1.0')
    assert.equal(result.meta.lyricsCredit, 'Test author; test translation')
    assert.equal(result.meta.requires, '0.9.4')
  }
})

test('lyric JS is only statically extracted, never executed or treated as a scene', async () => {
  const original = globalThis.__workshopLyricsExecuted
  delete globalThis.__workshopLyricsExecuted
  try {
    const source = 'globalThis.__workshopLyricsExecuted = true; throw new Error("must not run"); const LYRICS = [{time:1,end:2,en:"Synthetic safe data"}]; function helper(){ return fetch("https://example.com"); }'
    assert.deepEqual((await validate(contents(authorized('lyrics.js'), { 'lyrics.js': source }))).errors, [])
    assert.equal(globalThis.__workshopLyricsExecuted, undefined)
    await expectError(contents(authorized('lyrics.js'), { 'lyrics.js': 'const LYRICS = [{time:1,en:(globalThis.__workshopLyricsExecuted=true)}];' }), /静态|表达式/)
    const raw = authorized('lyrics.js')
    raw.canvas.script = 'lyrics.js'
    await expectError(contents(raw, { 'lyrics.js': source }), /不能同时用作 canvas.script/)
    assert.equal(globalThis.__workshopLyricsExecuted, undefined)
  } finally {
    if (original !== undefined) globalThis.__workshopLyricsExecuted = original
    else delete globalThis.__workshopLyricsExecuted
  }
})

test('unlicensed, unattributed, missing, remote and empty lyrics are rejected', async () => {
  for (const lyricsLicense of [undefined, '', 'UNLICENSED', 'Unknown', 'LicenseRef-Pending-Permission', 'pending', 'pending-approval', 'MIT (pending permission)', '待授权', 'All rights reserved']) {
    const raw = authorized()
    raw['x-dsh-mv-workshop'].lyricsLicense = lyricsLicense
    await expectError(contents(raw, { 'lyrics.json': JSON.stringify([cue]) }), /lyricsLicense/)
  }
  const raw = authorized()
  delete raw['x-dsh-mv-workshop'].lyricsCredit
  await expectError(contents(raw, { 'lyrics.json': JSON.stringify([cue]) }), /lyricsCredit/)
  await expectError(contents(authorized()), /歌词文件不在包里/)
  for (const file of ['https://example.com/lyrics.json', 'C:/lyrics.json', '../lyrics.json']) await expectError(contents(authorized(file)), /相对路径|相对路径不能含/)
  for (const text of ['[]', '[{"time":1,"en":""}]']) await expectError(contents(authorized(), { 'lyrics.json': text }), /非空歌词时间轴/)
  const badSource = authorized()
  badSource['x-dsh-mv-workshop'].lyricsSource = 'http://example.com'
  await expectError(contents(badSource, { 'lyrics.json': JSON.stringify([cue]) }), /lyricsSource/)
})

test('unreferenced and disguised lyrics remain rejected; hashes remain text-free', async () => {
  await expectError(contents(base(), { 'lyrics.json': JSON.stringify([cue]) }), /未声明的歌词文件/)
  await expectError(contents(base(), { 'lyrics.lrc': '[00:01.00]Synthetic verification line' }), /歌词文件/)
  await expectError(contents(base(), { 'data/captions.json': JSON.stringify([cue]) }), /未声明的歌词文本/)
  await expectError(contents(base(), { 'data/captions.js': 'const LYRICS = [{t:1,en:"Synthetic verification line"}]; function render(){return []}' }), /未声明的歌词文本/)
  const timing = { format: 'dsh-mv-lyrics-timing', version: 1, lines: [{ t: 1, e: 2, h: '0123456789abcdef' }] }
  assert.deepEqual((await validate(contents(base(), { 'lyrics.timing.json': JSON.stringify(timing) }))).errors, [])
  timing.lines[0].en = 'Synthetic verification line'
  await expectError(contents(base(), { 'lyrics.timing.json': JSON.stringify(timing) }), /不能有歌词文字/)
})

test('custom timing references are checked as text-free timing data, not arbitrary JSON', async () => {
  for (const file of ['custom-timing.json', 'lyrics.custom.json']) {
    const raw = base()
    raw['x-dsh-mv-workshop'].lyricsTiming = file
    const timing = { format: 'dsh-mv-lyrics-timing', version: 1, lines: [{ t: 1, e: 2, h: '0123456789abcdef' }] }
    const result = await validate(contents(raw, { [file]: JSON.stringify(timing) }))
    assert.deepEqual(result.errors, [], file)
    assert.equal(result.meta.timing, true)
    timing.lines[0].en = 'Synthetic hidden lyric text'
    await expectError(contents(raw, { [file]: JSON.stringify(timing) }), /不能有歌词文字/)
    await expectError(contents(raw, { [file]: '{"arbitrary":"JSON"}' }), /格式应为/)
    await expectError(contents(raw), /lyricsTiming 指向的文件不在包里/)
  }
  for (const file of ['https://example.com/timing.json', 'data/timing.json', '../timing.json', 'timing.txt']) {
    const raw = base()
    raw['x-dsh-mv-workshop'].lyricsTiming = file
    await expectError(contents(raw), /lyricsTiming 应是包内根目录/)
  }
  const raw = authorized()
  raw['x-dsh-mv-workshop'].lyricsTiming = 'lyrics.json'
  await expectError(contents(raw, { 'lyrics.json': JSON.stringify([cue]) }), /不能同时用作频谱或纯哈希时间轴/)
})

test('music and video are still forbidden even when a complete pack includes lyrics', async () => {
  const raw = authorized()
  for (const file of ['song.mp3', 'song.flac', 'mv.mp4', 'mv.webm', 'notes.mid']) await expectError(contents(raw, { 'lyrics.json': JSON.stringify([cue]), [file]: 'not actual music' }), /音频|视频/)
  raw.audio = { file: 'song.mp3' }
  await expectError(contents(raw, { 'lyrics.json': JSON.stringify([cue]) }), /不能包含 "audio"/)
})

test('lyric files use the data cap, not the relaxed WebGL scene cap', async () => {
  const raw = authorized('lyrics.js')
  raw.canvas = { renderer: 'script', output: 'webgl', script: 'scenes.js' }
  const source = '// synthetic padding\n'.repeat(Math.ceil(WORKSHOP_LIMITS.fileBytes / 21)) + 'const LYRICS = [{time:1,end:2,en:"Synthetic data"}];'
  assert.ok(Buffer.byteLength(source) > WORKSHOP_LIMITS.fileBytes)
  await expectError(contents(raw, { 'scenes.js': 'function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}', 'lyrics.js': source }), /lyrics.js 太大/)
  const text = JSON.stringify([cue])
  const files = contents(authorized(), { 'lyrics.json': text })
  const result = await validateWorkshopPack({ id: ID, files: Object.entries(files).map(([path, body]) => ({ path, size: Buffer.byteLength(body) })), readText: async path => path === 'lyrics.json' ? ' '.repeat(WORKSHOP_LIMITS.fileBytes) + text : files[path] })
  assert.ok(result.errors.some(error => /512 KB 数据限制/.test(error)))
})

test('a complete pack retains spectrum, timing, images and scene assets with no music', async () => {
  const raw = authorized()
  raw.spectrum = { file: 'data/spectrum.json' }
  raw.canvas.assets = { timeline: 'data/timeline.json', texture: 'art/test.png' }
  const files = contents(raw, {
    'lyrics.json': JSON.stringify([cue]),
    'data/spectrum.json': JSON.stringify({ fps: 2, bands: 2, frames: [[0, 0.1], [0.2, 1]] }),
    'data/timeline.json': JSON.stringify([{ start: 0, geometry: 'wireframe' }]),
    'art/test.png': 'test image bytes', 'cover.png': 'test cover bytes',
    'lyrics.timing.json': JSON.stringify({ format: 'dsh-mv-lyrics-timing', version: 1, lines: [{ t: 1, h: '0123456789abcdef' }] }),
  })
  const result = await validate(files)
  assert.deepEqual(result.errors, [])
  assert.equal(result.meta.lyrics, true)
  assert.equal(result.meta.spectrum, true)
  assert.equal(result.meta.timing, true)
  assert.equal(result.meta.cover, 'cover.png')
  assert.deepEqual(result.pack.canvas.assets, { timeline: 'data/timeline.json', texture: 'art/test.png' })
  assert.equal(result.meta.requires, '0.9.4')
  delete files['data/spectrum.json']
  await expectError(files, /频谱文件不在包里/)
  for (const value of [{ fps: 0, frames: [] }, { fps: 2, frames: [[1.1]] }, { fps: 2, frames: [['audio']] }, { fps: 2, bands: 2, frames: [[0]] }, { fps: 2, frames: [[0]], audio: 'hidden' }]) assert.ok(checkSpectrum(value).errors.length)
})

test('catalogue preserves complete-pack metadata and enforces the newer minimum', async () => {
  const files = contents(authorized('lyrics.lrc'), { 'lyrics.lrc': '[00:01.00]Synthetic verification line\n[00:02.00]\n' })
  const result = await validate(files)
  const entry = { ...result.meta, requires: '0.9.2', files: Object.entries(files).map(([path, text]) => ({ path, size: Buffer.byteLength(text), sha256: sha(text) })) }
  const parsed = parseWorkshopIndex({ format: WORKSHOP_INDEX_FORMAT, version: 1, packs: [entry, { ...entry, id: 'legacy-example', lyrics: undefined, spectrum: undefined }] })
  assert.equal(parsed.packs[0].lyrics, true)
  assert.equal(parsed.packs[0].lyricsLicense, 'CC0-1.0')
  assert.equal(parsed.packs[0].lyricsCredit, 'Test author; test translation')
  assert.equal(parsed.packs[0].requires, '0.9.4')
  assert.equal(parsed.packs[1].lyrics, false)
  assert.equal(packRequires({ lyrics: { file: 'lyrics.lrc' } }), '0.9.4')
  assert.equal(packRequires({ spectrum: { file: 'spectrum.json' } }), '0.9.4')
  assert.equal(packRequires({ lyrics: { file: 'lyrics.lrc' } }, '1.2.0'), '1.2.0')
})

test('publish requests accept explicit lyric distribution fields without inventing rights', () => {
  const request = { manifestPath: 'C:/test/mv.json', id: ID, version: '1.0.0', license: 'MIT', author: 'Test author' }
  const parsed = parseWorkshopPublish({ ...request, lyricsLicense: 'CC0-1.0', lyricsCredit: 'Test author', lyricsSource: 'https://example.com/lyrics' })
  assert.equal(parsed.lyricsLicense, 'CC0-1.0')
  assert.equal(parsed.lyricsCredit, 'Test author')
  assert.equal(parsed.lyricsSource, 'https://example.com/lyrics')
  assert.equal(parseWorkshopPublish(request).lyricsLicense, '')
  assert.throws(() => parseWorkshopPublish({ ...request, lyricsLicense: 'pending' }), /lyricsLicense/)
  assert.throws(() => parseWorkshopPublish({ ...request, lyricsCredit: 'x'.repeat(501) }), /lyricsCredit/)
  assert.throws(() => parseWorkshopPublish({ ...request, lyricsSource: 'http://example.com' }), /https/)
})
