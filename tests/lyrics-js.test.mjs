import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parseLyrics, parseLyricsJson, parseLyricsJs } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { linesFromText, linesToLrc } from '../.dsh-plugin/shared/mv-align.mjs'

// Invented placeholder text only. Never commit the song's real lyrics.
const moduleText = `// lyric module with executable glue that must NOT run
import { PALETTE } from './palette.js';
const color = () => { throw new Error('must not execute'); };
export const LYRICS = [
  { t: 0.27, en: 'Demo first', cn: '示例一' },
  // Comment and trailing commas are legal.
  { t: 3.84, en: "Demo second", cn: "示例二", },
  { t: 8.125, en: 'Demo last', cn: '示例三' },
];
export const EXECUTION_BEATS = [1, 2];
throw new Error('must not execute');`

test('lyrics JS: original module structure and t/cn map to time/zh in absolute seconds', () => {
  const expected = [
    { time: 0.27, end: 3.76, en: 'Demo first', zh: '示例一' },
    { time: 3.84, end: 8.045, en: 'Demo second', zh: '示例二' },
    { time: 8.125, end: 10, en: 'Demo last', zh: '示例三' },
  ]
  assert.deepEqual(parseLyricsJs(moduleText, { duration: 10 }), expected)
  for (const name of ['lyrics.js', 'LYRICS.MJS', 'renamed.json', 'renamed.txt', 'renamed.lrc', '']) assert.deepEqual(parseLyrics(name, moduleText, { duration: 10 }), expected)
  assert.deepEqual(parseLyrics('lyrics.js', '\uFEFF' + moduleText.replace(/\n/g, '\r\n'), { duration: 10 }), expected)
})

test('lyrics JSON: t/cn aliases retain canonical time/zh precedence and existing JSON shape', () => {
  assert.deepEqual(parseLyricsJson('[{"t":1.5,"en":"Demo","cn":"示例"}]'), [{ time: 1.5, end: 6.5, en: 'Demo', zh: '示例' }])
  assert.deepEqual(parseLyricsJson({ lyrics: [{ time: 2, t: 9, end: 3, en: 'Demo', zh: '正', cn: '别' }] }), [{ time: 2, end: 3, en: 'Demo', zh: '正' }])
  assert.equal(parseLyrics('lyrics.json', '[{"time":1,"en":"const LYRICS = demo"}]')[0].en, 'const LYRICS = demo')
})

test('lyrics JS: comments, escaped quotes, Unicode and bracket characters stay data', () => {
  const source = String.raw`/* const LYRICS = [bad]; */
const fake = "const LYRICS = [bad];";
const brackets = "{";
const regex = /const LYRICS = [{t:0,en:"fake"}];/;
export /* gap */ const LYRICS /* gap */ = [
  { 't': 1e0, "en": 'Demo \'quoted\' ] } //', cn: '\u793a\u4f8b \u{1f642}' },
];`
  assert.deepEqual(parseLyricsJs(source), [{ time: 1, end: 7.5, en: "Demo 'quoted' ] } //", zh: '示例 🙂' }])
  assert.deepEqual(parseLyrics('renamed.json', source), parseLyricsJs(source))
})

test('lyrics JS: never executes malicious prelude, imports or trailing helper functions', () => {
  globalThis.__lyricExecuted = 0
  try {
    const source = `globalThis.__lyricExecuted++;\n${moduleText}\nexport function ignored() { globalThis.__lyricExecuted++; }`
    assert.equal(parseLyricsJs(source).length, 3)
    assert.equal(globalThis.__lyricExecuted, 0)
  } finally { delete globalThis.__lyricExecuted }
})

test('lyrics JS: computed values, calls, getters, spreads and prototype tricks are rejected', () => {
  const rows = [
    '{ t: 1 + 2, en: "Demo" }', '{ t: Number(1), en: "Demo" }',
    '{ t: (() => 1)(), en: "Demo" }', '{ get t() { return 1 }, en: "Demo" }',
    '{ t: 1, en: `Demo ${alert(1)}` }', '{ ...extra, t: 1, en: "Demo" }',
    '{ ["t"]: 1, en: "Demo" }', '{ t: 1, en: "Demo", __proto__: {} }',
    '{ t: 1, t: 2, en: "Demo" }', '{ t: Infinity, en: "Demo" }',
  ]
  for (const row of rows) assert.throws(() => parseLyricsJs(`export const LYRICS = [${row}];`), /歌词 JS/)
  for (const suffix of ['.map(fn);', '.concat(other);', ' + extra;']) assert.throws(() => parseLyricsJs(`const LYRICS = [{t:1,en:'Demo'}]${suffix}`), /歌词 JS/)
})

test('lyrics JS: malformed/no declaration, fake comment/string declarations and bounded data fail clearly', () => {
  for (const source of [
    '// const LYRICS = [{t:1,en:"Demo"}];', 'const fake="const LYRICS = []";',
    'const LYRICS = [{t:1,en:"Demo"}', 'const LYRICS = getCues();',
    'const LYRICS = [1];', 'const LYRICS = [{t:1,en:"Demo",extra:[[[[1]]]]}];',
    'const LYRICS = "[";', 'const LYRICS = [{t:1,en:"Demo"}] ";";',
    'const LYRICS = [{t:1,en:"Demo"}]; /* unclosed',
  ]) {
    // After the terminating semicolon, unrelated source is deliberately ignored.
    if (source.endsWith('/* unclosed')) assert.equal(parseLyricsJs(source).length, 1)
    else assert.throws(() => parseLyricsJs(source), /歌词 JS/)
  }
  assert.throws(() => parseLyricsJs(' '.repeat(2 * 1024 * 1024 + 1)), /限制/)
  assert.throws(() => parseLyricsJs('const LYRICS = [' + Array(10001).fill('{t:1,en:"Demo"}').join(',') + '];'), /10000/)
})

test('lyrics JS: calibration/automatic alignment reads cues, not source lines; LRC conversion round trips', () => {
  const parsed = linesFromText(moduleText)
  assert.equal(parsed.timed, true)
  assert.equal(parsed.lines.length, 3)
  assert.equal(parsed.lines[0].start, 0.27)
  assert.equal(parsed.lines[0].alt, '示例一')
  assert.equal(linesFromText(moduleText, { name: 'renamed.json' }).timed, true)
  assert.deepEqual(parseLyrics('converted.lrc', linesToLrc(parsed.lines)).map(c => [c.time, c.en, c.zh]), [[0.27, 'Demo first', '示例一'], [3.84, 'Demo second', '示例二'], [8.13, 'Demo last', '示例三']])
})

const upstream = process.env.DSH_MV_PORT_SRC && join(process.env.DSH_MV_PORT_SRC, 'world-execute-me-mv/src/lyrics.js')
test('lyrics JS: optional local actual upstream module without shipping its text', { skip: !upstream || !existsSync(upstream) }, () => {
  const source = readFileSync(upstream, 'utf8')
  const cues = parseLyrics('lyrics.js', source, { duration: 213 })
  assert.equal(cues.length, 75)
  assert.equal(cues[0].time, 0.27)
  assert.equal(cues.at(-1).time, 205.96)
  assert.equal(cues.at(-1).end, 212.46)
  assert.equal(cues.find(c => c.time === 12.93).end, 19.43)
  assert.equal(cues.every(c => c.en && c.zh && c.end > c.time), true)
  assert.deepEqual(parseLyrics('renamed.json', source, { duration: 213 }), cues)
  assert.equal(linesFromText(source).lines.length, cues.length)
})
