import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TEMPLATE_ASSETS } from '../.dsh-plugin/shared/mv-template-assets.gen.mjs'
import {
  WORKSHOP_INDEX_FORMAT, audioMatch, checkScriptSafety, checkTiming, compareFingerprints, compareVersions, encodeFingerprint, energyFingerprint,
  filterWorkshop, parseWorkshopIndex, parseWorkshopPublish, retimeCues, validateWorkshopPack, workshopFileUrl, workshopSlug, normalizeLyricLine,
} from '../.dsh-plugin/shared/mv-workshop.mjs'
import { createWorkshopManager, preparePublish } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { installedState, mediaSlot, durationText } from '../.dsh-plugin/client/mv-workshop-state.mjs'

const sha = b => createHash('sha256').update(b).digest('hex')
const tmp = () => mkdtempSync(join(tmpdir(), 'dsh-mv-ws-'))

async function publishedExample() {
  const src = tmp()
  for (const f of ['mv.json', 'scenes.js', 'lyrics.placeholder.lrc']) writeFileSync(join(src, f), TEMPLATE_ASSETS[`examples/rich-pack/${f}`])
  // Pretend the user had audio in the pack: it must be stripped.
  const manifest = JSON.parse(TEMPLATE_ASSETS['examples/rich-pack/mv.json'])
  manifest.audio = { file: 'song.mp3' }
  writeFileSync(join(src, 'mv.json'), JSON.stringify(manifest))
  writeFileSync(join(src, 'song.mp3'), 'ID3 not really audio')
  const out = tmp()
  const request = parseWorkshopPublish({ manifestPath: join(src, 'mv.json'), id: 'neon-terminal-example', version: '1.0.0', license: 'MIT', author: 'tester', tags: ['example'], duration: 120, fingerprint: encodeFingerprint(new Uint8Array([1, 2, 3, 4])) })
  return { result: await preparePublish(request, { publishRoot: out }), src }
}

test('publish: strips audio and lyric text, keeps timings as hashes, passes the workshop rules', async () => {
  const { result } = await publishedExample()
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.deepEqual(result.files.map(f => f.path).sort(), ['README.md', 'lyrics.timing.json', 'mv.json', 'scenes.js'])
  assert.ok(result.stripped.some(s => s.startsWith('audio')) && result.stripped.some(s => s.startsWith('lyrics')))
  const manifest = JSON.parse(readFileSync(join(result.dir, 'mv.json'), 'utf8'))
  assert.equal(manifest.audio, undefined); assert.equal(manifest.lyrics, undefined)
  assert.equal(manifest['x-dsh-mv-workshop'].license, 'MIT')
  assert.equal(manifest['x-dsh-mv-workshop'].audio.fingerprint.kind, 'energy-2hz-v1')
  assert.equal(manifest['x-dsh-mv-ai'].sections.length, 6)
  // No lyric text anywhere in the output.
  for (const name of readdirSync(result.dir)) {
    const text = readFileSync(join(result.dir, name), 'utf8')
    for (const phrase of ['first verse line goes here', 'karaoke highlight here', '占位 歌词']) assert.ok(!text.includes(phrase), `${name} contains lyric text`)
  }
  const timing = JSON.parse(readFileSync(join(result.dir, 'lyrics.timing.json'), 'utf8'))
  assert.deepEqual(checkTiming(timing).errors, [])
  assert.equal(timing.lines[1].h, sha(normalizeLyricLine('first verse line goes here')).slice(0, 16))
  assert.deepEqual(timing.lines[1].w, [12, 12.5, 13, 13.6, 14.1])
  assert.match(result.links.upload, /^https:\/\/github\.com\/Alice-Marx\/dsh-mv-workshop\/upload\/main\/packs\/neon-terminal-example$/)
})

test('workshop rules reject audio, lyric files, lyric text, missing license and unsafe scripts', async () => {
  const good = { 'mv.json': JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'x', duration: 10, canvas: { renderer: 'script', script: 'scenes.js' }, 'x-dsh-mv-workshop': { id: 'abc', version: '1.0.0', license: 'MIT', author: 'me' } }), 'scenes.js': 'function render(t){ return ["hi"] }' }
  const run = async files => validateWorkshopPack({ id: 'abc', files: Object.entries(files).map(([path, text]) => ({ path, size: Buffer.byteLength(text) })), readText: async p => files[p] })
  assert.deepEqual((await run(good)).errors, [])
  const cases = [
    [{ ...good, 'song.flac': 'x' }, /音频/],
    [{ ...good, 'lyrics.lrc': '[00:01.00]x' }, /歌词/],
    [{ ...good, 'lyrics.json': '[]' }, /歌词/],
    [{ ...good, 'data.json': JSON.stringify([1, 2, 3, 4].map(i => ({ time: i, text: `line ${i}` }))) }, /歌词文本/],
    [{ ...good, 'notes.md': '[00:01.00]a\n[00:02.00]b\n[00:03.00]c' }, /歌词/],
    [{ ...good, 'mv.json': good['mv.json'].replace('"license":"MIT",', '') }, /license 必填/],
    [{ ...good, 'mv.json': good['mv.json'].replace('"title":"x"', '"title":"x","audio":{"file":"a.mp3"}') }, /不能包含 "audio"/],
    [{ ...good, 'scenes.js': 'function render(){ fetch("https://x"); return [] }' }, /network/],
    [{ ...good, 'scenes.js': 'function render(){ return [].constructor.constructor("return this")() }' }, /constructor|Function/],
    [{ ...good, 'scenes.js': `function render(){ return ["${'a'.repeat(5000)}"] }` }, /超过 4000/],
    [{ ...good, '.hidden.js': 'x' }, /路径不允许/],
    [{ ...good, 'lyrics.timing.json': JSON.stringify({ format: 'dsh-mv-lyrics-timing', version: 1, lines: [{ t: 1, h: '0123456789abcdef', text: 'hello' }] }) }, /不能有歌词文字/],
  ]
  for (const [files, pattern] of cases) {
    const { errors } = await run(files)
    assert.ok(errors.some(e => pattern.test(e)), `${pattern}: ${errors.join(' | ')}`)
  }
  // Mentions inside strings and comments are fine.
  assert.deepEqual(checkScriptSafety('// fetch is not used\nfunction render(){ return ["window", "fetch"] }').errors, [])
  assert.ok(checkScriptSafety('function render(){ return [Math.random()] }').warnings.length)
})

test('every template example scene passes the workshop static checks', () => {
  for (const [path, source] of Object.entries(TEMPLATE_ASSETS)) if (path.endsWith('.js')) assert.deepEqual(checkScriptSafety(source, path).errors, [], path)
})

function fakeRepo(files, { corrupt = '' } = {}) {
  const commit = 'a'.repeat(40)
  const index = {
    format: WORKSHOP_INDEX_FORMAT, version: 1, commit, generated: '2026-10-03T00:00:00Z',
    packs: [{ id: 'neon-terminal-example', title: 'Neon', artist: 'dsh-mv', author: 'tester', license: 'MIT', version: '1.0.0', duration: 120, renderer: 'script', files: Object.entries(files).map(([path, bytes]) => ({ path, size: bytes.length, sha256: sha(bytes) })) }],
  }
  const urls = []
  const get = async url => {
    urls.push(url)
    if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
    const path = url.split(`/${commit}/packs/neon-terminal-example/`)[1]
    if (!path || !files[path]) throw new Error(`404 ${url}`)
    return path === corrupt ? Buffer.concat([files[path], Buffer.from('x')]).subarray(1) : files[path]
  }
  return { get, urls, index, commit }
}

test('install: downloads at the index commit, verifies sha256, lists, updates and uninstalls', async () => {
  const { result } = await publishedExample()
  const files = Object.fromEntries(readdirSync(result.dir).map(name => [name, readFileSync(join(result.dir, name))]))
  const root = tmp()
  const repo = fakeRepo(files)
  const ws = createWorkshopManager({ root, get: repo.get })
  const listed = await ws.index({ refresh: true })
  assert.equal(listed.packs.length, 1)
  assert.deepEqual(listed.installed, [])
  const done = await ws.install({ id: 'neon-terminal-example' })
  assert.ok(existsSync(done.manifestPath))
  assert.ok(repo.urls.some(u => u === workshopFileUrl(repo.commit, 'neon-terminal-example', 'scenes.js')))
  const after = await ws.index({ refresh: false })
  assert.equal(after.installed[0].version, '1.0.0')
  // A newer version in the index shows as an update.
  const { updates } = installedState({ ...after, packs: after.packs.map(p => ({ ...p, version: '1.1.0' })) })
  assert.ok(updates.has('neon-terminal-example'))
  await ws.uninstall({ id: 'neon-terminal-example' })
  assert.deepEqual((await ws.installed()).installed, [])
  await assert.rejects(ws.uninstall({ id: 'neon-terminal-example' }), /没有安装/)
})

test('install: a file whose sha256 does not match the index aborts and leaves nothing behind', async () => {
  const { result } = await publishedExample()
  const files = Object.fromEntries(readdirSync(result.dir).map(name => [name, readFileSync(join(result.dir, name))]))
  const root = tmp()
  const ws = createWorkshopManager({ root, get: fakeRepo(files, { corrupt: 'scenes.js' }).get })
  await assert.rejects(ws.install({ id: 'neon-terminal-example' }), /校验失败|大小不符/)
  assert.deepEqual(readdirSync(root), [])
})

test('index parsing drops malformed entries and unsafe paths', () => {
  const file = { path: 'mv.json', size: 10, sha256: 'b'.repeat(64) }
  const parsed = parseWorkshopIndex({ format: WORKSHOP_INDEX_FORMAT, version: 1, commit: 'c'.repeat(40), packs: [
    { id: 'ok-pack', title: 'OK', files: [file], license: 'MIT', version: '1.2.3' },
    { id: 'Bad Id', files: [file] },
    { id: 'traversal', files: [file, { path: '../x.js', size: 1, sha256: 'b'.repeat(64) }] },
    { id: 'audio-pack', files: [file, { path: 'a.mp3', size: 1, sha256: 'b'.repeat(64) }] },
    { id: 'no-manifest', files: [{ path: 'scenes.js', size: 1, sha256: 'b'.repeat(64) }] },
  ] })
  assert.deepEqual(parsed.packs.map(p => p.id), ['ok-pack'])
  assert.throws(() => parseWorkshopIndex({ format: 'x' }), /格式/)
  assert.equal(filterWorkshop(parsed.packs, { query: 'o k' }).length, 1)
  assert.equal(filterWorkshop(parsed.packs, { license: 'CC' }).length, 0)
  assert.equal(compareVersions('1.10.0', '1.9.9'), 1)
})

test('fingerprints: same recording matches (with shift), different audio and wrong duration warn', () => {
  const rate = 8000
  const song = new Float32Array(rate * 60)
  for (let i = 0; i < song.length; i++) song[i] = Math.sin(i / 7) * (0.2 + 0.8 * Math.abs(Math.sin(i / rate * 0.9)))
  const a = energyFingerprint(song, rate)
  assert.equal(a.length, 120)
  const shifted = energyFingerprint(song.subarray(rate), rate)
  const r = compareFingerprints(a, shifted)
  assert.ok(r.score > 0.95 && Math.abs(Math.abs(r.shift) - 1) < 0.01, JSON.stringify(r))
  const other = energyFingerprint(song.map((v, i) => v * (0.5 + 0.5 * Math.cos(i / rate * 2.7))), rate)
  assert.equal(audioMatch({ duration: 60, fingerprint: encodeFingerprint(a) }, { duration: 60, fingerprint: a }).ok, true)
  assert.equal(audioMatch({ duration: 60, fingerprint: encodeFingerprint(a) }, { duration: 60, fingerprint: other }).level, 'warn')
  assert.match(audioMatch({ duration: 60 }, { duration: 75 }).message, /时长不一致/)
  assert.equal(audioMatch({}, { duration: 75 }).level, 'unknown')
})

test('retime: the user\'s own lines take the pack times when their hashes match', async () => {
  const hash = async text => sha(text).slice(0, 16)
  const timing = { lines: [{ t: 10, e: 14, h: await hash(normalizeLyricLine('Hello, World!')), w: [10, 11] }, { t: 20, h: await hash('second') }] }
  const cues = [{ time: 9, end: 12, en: 'hello world', zh: '' }, { time: 15, end: 18, en: 'not in pack', zh: '' }, { time: 19, end: 22, en: 'Second', zh: '' }]
  const out = await retimeCues(cues, timing, hash)
  assert.equal(out.matched, 2)
  assert.equal(out.cues[0].time, 10); assert.equal(out.cues[0].end, 14)
  assert.deepEqual(out.cues[0].words, [{ text: 'hello', time: 10 }, { text: 'world', time: 11 }])
  assert.equal(out.cues[1].time, 15)
  assert.equal(out.cues[2].time, 20)
})

test('publish request parsing and helpers', () => {
  assert.throws(() => parseWorkshopPublish({ manifestPath: 'C:\\x\\mv.json', id: 'ok-id', version: '1', license: 'MIT', author: 'a' }), /version/)
  assert.throws(() => parseWorkshopPublish({ manifestPath: 'C:\\x\\mv.json', id: 'ok-id', version: '1.0.0', license: '', author: 'a' }), /license/)
  assert.throws(() => parseWorkshopPublish({ manifestPath: 'C:\\x\\mv.json', id: '../x', version: '1.0.0', license: 'MIT', author: 'a' }), /id/)
  assert.throws(() => parseWorkshopPublish({ manifestPath: 'C:\\x\\mv.json', id: 'ok-id', version: '1.0.0', license: 'MIT', author: 'a', homepage: 'http://x' }), /https/)
  assert.throws(() => parseWorkshopPublish({ manifestPath: 'C:\\x\\mv.json', id: 'ok-id', version: '1.0.0', license: 'MIT', author: 'a', token: 'x' }), /unexpected/)
  assert.equal(workshopSlug('Neon Terminal', 'dsh-mv'), 'dsh-mv-neon-terminal')
  assert.match(workshopSlug('世界', '', () => 'abc123'), /^mv-abc123$/)
  assert.equal(mediaSlot({ builtin: true }, 'audio'), 'audio')
  assert.equal(mediaSlot({ pack: { workshop: { id: 'x-y-z' } } }, 'lyrics'), 'workshop:x-y-z:lyrics')
  assert.equal(mediaSlot({ pack: { audio: { file: 'a.mp3' }, workshop: { id: 'x-y-z' } } }, 'audio'), null)
  assert.equal(durationText(59.6), '1:00')
})
