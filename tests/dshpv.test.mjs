// 0.6.0: the dsh-pv canvas preset (MisakaZentai/world-execute-me-dsh-pv, MIT) and its CC BY-NC-SA art.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash, webcrypto } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { DSHPV_ASSETS, parseDshPvAsset } from '../.dsh-plugin/shared/mv-dshpv-protocol.mjs'
import { readDshPvAsset } from '../.dsh-plugin/shared/mv-dshpv-assets.mjs'
import { applyPatch, attentionTokens, fromCues, lineAt, lineVariants, matchBand, tokenId, tokenize, typed } from '../.dsh-plugin/client/mv/dshpv/band.mjs'
import { DshPvFilm, DSHPV_CHAPTERS, DSHPV_DURATION, avatarSpec, chapterAt, decode, keyframeAt, prepareTimeline, shotAt } from '../.dsh-plugin/client/mv/dshpv/film.mjs'
import { blockParts, chatAt } from '../.dsh-plugin/client/mv/dshpv/chat.mjs'

const ASSETS = new URL('../.dsh-plugin/assets/', import.meta.url)
const json = name => JSON.parse(readFileSync(new URL(name, ASSETS), 'utf8'))
const timeline = json('dsh-pv/timeline.json'), chat = json('dsh-pv/chat.json'), band = json('dsh-pv/band.json')
const sha = text => createHash('sha256').update(text, 'utf8').digest('hex')

test('dshpvAsset: names only, chunked reads', async () => {
  assert.throws(() => parseDshPvAsset({ name: '../../package.json' }), /name must be one of/)
  assert.throws(() => parseDshPvAsset({ name: 'timeline', length: 5 }), /unexpected fields/)
  assert.throws(() => parseDshPvAsset({ name: 'band', offset: 1.5 }))
  assert.deepEqual(parseDshPvAsset({ name: 'band' }), { name: 'band', offset: 0 })
  const first = await readDshPvAsset({ name: 'timeline', offset: 0 })
  assert.equal(first.exists, true); assert.equal(first.done, false); assert.equal(first.bytes, 1024 * 1024)
  const missing = await readDshPvAsset({ name: 'band', offset: 0 }, '/nonexistent/')
  assert.equal(missing.exists, false)
  assert.equal(Object.keys(DSHPV_ASSETS).length, 12)
})

test('art folder: CC BY-NC-SA 4.0, kept apart with its own LICENSE and NOTICE', () => {
  const files = readdirSync(new URL('dsh-pv-art/', ASSETS)).sort()
  assert.deepEqual(files.filter(f => !f.endsWith('.webp')), ['LICENSE', 'NOTICE.md', 'upstream-NOTICE-dsh-deep-whale.txt', 'upstream-NOTICE-dsh-whale-galgame.md'])
  assert.match(readFileSync(new URL('dsh-pv-art/LICENSE', ASSETS), 'utf8'), /^Attribution-NonCommercial-ShareAlike 4\.0 International/)
  const notice = readFileSync(new URL('dsh-pv-art/NOTICE.md', ASSETS), 'utf8')
  for (const needle of ['上善', 'ZipZipPipe', 'Small-tailqwq', 'dsh-whale-galgame', 'MisakaZentai', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'Non-commercial', 'Changes made here', 'MIT AND CC-BY-NC-SA-4.0']) assert.ok(notice.includes(needle), needle)
  assert.equal(files.filter(f => f.endsWith('.webp')).length, 9)
  // the MIT data folder holds no artwork, and the package says it is not purely MIT
  assert.deepEqual(readdirSync(new URL('dsh-pv/', ASSETS)).sort(), ['NOTICE.md', 'band.json', 'chat.json', 'timeline.json'])
  assert.match(readFileSync(new URL('dsh-pv/NOTICE.md', ASSETS), 'utf8'), /Copyright \(c\) 2026 MisakaZentai/)
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.license, '(MIT AND CC-BY-NC-SA-4.0)')
  assert.ok(pkg.files.includes('.dsh-plugin/assets/dsh-pv-art/'))
})

test('no lyric text ships: band.json holds hashes and times only', () => {
  const hashes = new Set(band.lines.map(ln => ln.sha256))
  assert.equal(band.lines.length, 98)
  for (const ln of band.lines) assert.deepEqual(Object.keys(ln).filter(k => !['sha256', 'start', 'end', 'displayEnd', 'words', 'patch'].includes(k)), [])
  // no string in the shipped data is a lyric line (checked by hash; the builder also checks 4-word runs locally)
  const strings = new Set()
  const walk = v => { if (typeof v === 'string') strings.add(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk) }
  walk(timeline); walk(chat)
  for (const s of strings) for (const v of lineVariants(s)) assert.ok(!hashes.has(sha(v)), `lyric line in data: ${s.slice(0, 20)}…`)
  // the satisfaction shot keeps placeholders for the sung words
  const sat = timeline.shots.find(s => s.fn === 'satisfaction')
  assert.ok(sat.kf[0].o.some(op => op[0] === 't' && op[6] === '\u00010'))
})

test('band: user lines matched by sha256, patched, fixed; fallback from cues', async () => {
  const text = 'Alpha beta gamma delta'
  const fake = { fixes: { Trios: 'Trois' }, lines: [
    { sha256: sha(text), start: 1, end: 3, displayEnd: 3.2, words: [[0, 5, 1, 0.4], [6, 10, 1.5, 0.3], [11, 16, 2, 0.1], [17, 22, 2.5, 0.2]] },
    { sha256: sha('Un deux Trios'), start: 10, end: 12, displayEnd: 12.5, words: [[0, 2, 10, 0.2], [3, 7, 10.5, 0.2], [8, 13, 11, 0.2]], patch: [{ op: 'reorder_words', order: [0, 1, 2] }] },
  ] }
  for (let i = 0; i < 8; i++) fake.lines.push({ sha256: sha(`line ${i}`), start: 20 + i * 3, end: 21 + i * 3, displayEnd: 21.5 + i * 3, words: [[0, 4, 20 + i * 3, 0.3], [5, 6, 20.5 + i * 3, 0.3]] })
  const cues = [{ time: 0.9, end: 4, text: `  ${text} ` }, { time: 9.8, end: 13, text: 'Un  deux Trios' }, ...Array.from({ length: 8 }, (_, i) => ({ time: 20 + i * 3, end: 22 + i * 3, text: `line ${i}` }))]
  const hash = async v => Buffer.from(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(v))).toString('hex')
  const res = await matchBand(fake, cues, { duration: 60, hash })
  assert.equal(res.matched, 10)
  assert.equal(res.lines[1].text, 'Un deux Trois')
  assert.equal(res.lines[0].words[0][3], 0.25, 'typing capped at 0.25 s')
  const [n] = typed(res.lines[0], 1.6)
  assert.equal(res.lines[0].text.slice(0, n), 'Alpha be')
  assert.equal(lineAt(res.lines, 3.3)[0].text, text, 'held a beat after its end')
  assert.equal(lineAt(res.lines, 8), null, 'then gone before a long gap')
  assert.equal(applyPatch('a b c d', [{ op: 'reorder_words', order: [0, 2, 1, 3] }]), 'a c b d')
  const poor = await matchBand(fake, [{ time: 1, end: 3, text: 'something else entirely' }], { hash })
  assert.equal(poor.matched, 0); assert.equal(poor.lines[0].text, 'something else entirely')
  assert.equal(fromCues([{ time: 2, end: 4, text: 'a b' }])[0].words.length, 2)
  assert.deepEqual(attentionTokens([{ start: 61, text: 'Then I can be your only one', words: [] }, { start: 63, text: 'Next Line here', words: [] }]), ['If', 'I', 'can', 'be', 'your', 'only', 'next', 'line'])
  assert.deepEqual(tokenize('Be your only satisfaction'), ['Be', 'your', 'only', 'satisfa', 'ction'])
  assert.equal(tokenId('the'), 83078, 'crc32 % 100000 as upstream')
})

test('timeline: 97 shots, 10 chapters, every keyframe in its shot', () => {
  const tl = prepareTimeline(timeline)
  assert.equal(tl.shots.length, 97)
  assert.equal(DSHPV_CHAPTERS.length, 10)
  assert.ok(Math.abs(tl.duration - DSHPV_DURATION) < 1e-6)
  for (const shot of tl.shots) {
    assert.ok(shot.kf.length >= 2 && shot.kf.length <= 6)
    for (const kf of shot.kf) assert.ok(kf.t >= shot.s - 0.05 && kf.t <= shot.e + 0.05, `${shot.fn} ${kf.t}`)
  }
  assert.equal(shotAt(tl, 66).fn, 'satisfaction')
  assert.equal(shotAt(tl, 150).fn, 'exec_hit')
  assert.equal(chapterAt(150)[2], 'EXECUTION')
  assert.equal(keyframeAt(shotAt(tl, 0), 0).from, 0)
  assert.equal(decode('hello', null, Math.random), 'hello')
  assert.equal(decode('hello', 0, Math.random), '')
  assert.deepEqual(avatarSpec('d/m16', 110), { expr: 'cheerful', cells: 16 })
  assert.equal(avatarSpec('f/red', 150).tint, 'red')
})

test('chat: states by time, typing cuts parts', () => {
  assert.equal(chatAt(chat, 1), null)
  const row = chatAt(chat, 60.6)
  assert.ok(row[2].length > 3)
  const block = { k: 'h', p: [['body', 'hello world']] }
  assert.deepEqual(blockParts(block, 'body'.length + 1 + 5), [['body', 'hello']])
  assert.deepEqual(blockParts(block, -1), block.p)
})

test('film: renders every shot into a recording 2D context without throwing', () => {
  const calls = { fillText: 0, fillRect: 0, drawImage: 0 }
  const ctx = new Proxy({ canvas: { width: 1280, height: 720 }, measureText: s => ({ width: String(s).length * 8 }), createRadialGradient: () => ({ addColorStop() {} }) }, {
    get(target, key) { if (key in target) return target[key]; return (...args) => { if (key in calls) calls[key]++; return undefined } },
    set(target, key, value) { target[key] = value; return true },
  })
  const film = new DshPvFilm()
  film.buffer = { getContext: () => ctx }; film.trail = { getContext: () => ctx }; film.page = { getContext: () => ctx }; film.cell = { width: 1, height: 1, getContext: () => ctx }
  film.setData({ timeline: structuredClone(timeline), chat, band, art: {} })
  film.setLines([{ text: 'Be your only satisfaction', start: 60, end: 70, words: [[0, 2, 60, 0.2], [3, 7, 60.5, 0.2], [8, 12, 61, 0.2], [13, 25, 61.5, 0.25]], showUntil: 70, fadeUntil: 70 }])
  for (const shot of film.timeline.shots) film.frame(ctx, (shot.s + shot.e) / 2)
  film.draw(ctx, 210, { paused: true })
  assert.ok(calls.fillText > 2000 && calls.fillRect > 2000, JSON.stringify(calls))
})
