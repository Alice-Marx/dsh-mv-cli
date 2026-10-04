// The world.execute(me) film is a port of world.execute-me-ascii (presets/world-execute-me, repo only since 0.9.0;
// it ships as the "world-execute-me" workshop pack's scenes.js). These goldens were
// rendered by the ORIGINAL player.Film (tools/make-goldens.py) with synthetic
// lyrics and a synthetic spectrum, and store only frame digests.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { Film, CHAPTERS, DURATION, MIN_COLS, MIN_ROWS, ORIGINAL_HINT, ORIGINAL_HELP_LINES, HELP_LINES, clockText } from '../presets/world-execute-me/src/film.mjs'
import { $round, $mod, $fmt } from '../presets/world-execute-me/src/pyrt.mjs'
import * as port from '../presets/world-execute-me/src/canvas.mjs'
import { cw, width, wrap, crop, Grid } from '../.dsh-plugin/client/mv/grid.mjs'
import { sceneScript } from '../presets/build-workshop-packs.mjs'
import { checkScriptSafety } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { checkScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { sceneContext, stripModuleSyntax } from '../.dsh-plugin/shared/mv-scene.mjs'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/film-goldens.json', import.meta.url), 'utf8'))

function syntheticLyrics() {
  const out = []
  let t = 0.6, i = 0
  while (t < 209) {
    out.push({ time: Math.round(t * 1000) / 1000, end: Math.round((t + 4.2) * 1000) / 1000, en: `PLACEHOLDER LINE ${String(i).padStart(3, '0')} OF THE TEST CUE`, zh: `测试字幕第${i}句` })
    t += 6.35; i += 1
  }
  return out
}
const band = (t, i) => ((i * 7 + Math.trunc(t * 30) * 13) % 17) / 16
const digest = c => createHash('sha256').update(c.cells.map(r => r.map(x => x[0]).join('') + '\t' + r.map(x => String(x[1])).join('')).join('\n')).digest('hex').slice(0, 20)

test('film: frames match the original Python renderer (digests)', () => {
  const film = new Film({ lyrics: syntheticLyrics(), energy: t => Array.from({ length: 48 }, (_, i) => band(t, i)) })
  const mismatched = []
  for (const c of fixture.cases) {
    const frame = film.render(c.t, c.w, c.h, { paused: c.paused, offset: c.help ? 0.3 : 0, help: c.help, ready: c.ready, hintText: ORIGINAL_HINT, helpLines: ORIGINAL_HELP_LINES })
    if (digest(frame) !== c.sha) mismatched.push(`${c.w}x${c.h}@${c.t}${c.help ? '+help' : ''}${c.ready ? '+ready' : ''}`)
  }
  // Known: a handful of frames in the legacy mesh (75–81 s) differ by float ulps / z-buffer ties.
  const unexpected = mismatched.filter(key => { const t = Number(key.split('@')[1].replace(/\+.*/, '')); return !(t >= 75 && t <= 81.5) })
  assert.deepEqual(unexpected, [], `unexpected mismatches: ${unexpected.join(', ')}`)
  assert.ok(mismatched.length <= fixture.cases.length * 0.03, `${mismatched.length} mismatches`)
})

test('film: optional full parity against a local world.execute-me-ascii copy (REF_ASCII_DIR)', { skip: !process.env.REF_ASCII_DIR || !existsSync(join(process.env.REF_ASCII_DIR ?? '', 'lyrics.json')) }, () => {
  const dir = process.env.REF_ASCII_DIR
  const lyrics = JSON.parse(readFileSync(join(dir, 'lyrics.json'), 'utf8'))
  const film = new Film({ lyrics })
  const frame = film.render(lyrics[3].time + 0.1, 120, 40, { paused: true })
  assert.match(frame.plain(), new RegExp(lyrics[3].en.slice(0, 8).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('film: small windows show the resize notice; chapters and clock follow player.py', () => {
  const film = new Film()
  assert.match(film.render(10, MIN_COLS - 1, MIN_ROWS).plain(), /请放大窗口/)
  assert.equal(film.chapter(0)[1], '01 / CREATION')
  assert.equal(film.chapter(CHAPTERS[3][0] + 0.01)[1], '04 / EXECUTION')
  assert.equal(clockText(65.37), '01:05.3 / 03:32')
  assert.equal(Math.round(DURATION), 212)
  const helped = film.render(40, 100, 30, { help: true, helpLines: HELP_LINES, offset: -0.2 }).plain()
  assert.match(helped, /CONTROLS \/ 操作/)
  assert.match(helped, /字幕偏移 -0\.2s/)
})

test('film: no lyrics shows the instrumental placeholder, never any lyric text', () => {
  const plain = new Film().render(40, 120, 40, { paused: true }).plain()
  assert.match(plain, /\[ instrumental \]/)
  assert.match(plain, /\[ 间奏 \]/)
})

test('pyrt / canvas: Python semantics', () => {
  assert.equal($round(2.5), 2)
  assert.equal($round(-2.5), -2)
  assert.equal($round(3.5), 4)
  assert.equal($mod(-7, 3), 2)
  assert.equal($fmt(3.14159, '.2f'), '3.14')
  assert.equal($fmt(5, '+.1f'), '+5.0')
  assert.equal(cw('中'), 2)
  assert.equal(cw('a'), 1)
  assert.equal(cw('\u0301'), 0)
  assert.equal(width('中文ab'), 6)
  assert.deepEqual(port.wrap('hello world again', 11), ['hello', 'world again'], 'same as player.py wrap')
  assert.equal(width(crop('中文中文中文', 5)) <= 5, true)
})

test('grid.mjs (MIT, the plugin\'s own) measures text exactly like the ported canvas', () => {
  for (const text of ['hello', '中文ab', 'e\u0301', '♪ world.execute(me); ♪', '한국어 カタカナ']) {
    assert.equal(width(text), port.width(text), text)
    assert.equal(crop(text, 5), port.crop(text, 5), text)
  }
  assert.deepEqual(wrap('hello world again', 11), ['hello world', 'again'], 'greedy wrap')
  for (const line of wrap('中文字幕很长很长的一句话 mixed text', 8)) assert.ok(width(line) <= 8, line)
  const g = new Grid(10, 2)
  g.put(0, 0, '中a', 2)
  assert.equal(g.cells[0][0][0], '中'); assert.equal(g.cells[0][1][0], ''); assert.equal(g.cells[0][2][0], 'a')
})

test('workshop pack scenes.js: the bundled port is a safe scene script and draws what Film draws', async () => {
  const source = await sceneScript()
  assert.deepEqual(checkScriptSafety(source).errors, [])
  assert.ok(Buffer.byteLength(source) < 256 * 1024)
  assert.match(source, /yym8224961\/world\.execute-me-ascii/)
  const sections = CHAPTERS.map((c, i) => ({ kind: 'chapter', label: c[1], start: c[0], end: CHAPTERS[i + 1]?.[0] ?? DURATION }))
  const cue = { time: 40, end: 44, en: 'PLACEHOLDER LINE', zh: '测试字幕' }
  const check = checkScene(source, { times: [0, 16.5, 40, 120, 190], cols: 100, rows: 32, info: { duration: DURATION, sections }, cues: [cue] })
  assert.equal(check.ok, true, check.problems.join('\n'))
  // frame parity with Film (same lyric cue, silent spectrum)
  const sandbox = vm.createContext({})
  vm.runInContext(stripModuleSyntax(source), sandbox)
  const film = new Film({ lyrics: [cue] })
  for (const [t, ready] of [[1, true], [17, false], [41, false], [150, false]]) {
    const ctx = JSON.parse(JSON.stringify(sceneContext({ t, duration: DURATION, cue: t >= 40 && t < 44 ? cue : null, ready })))
    const out = JSON.parse(JSON.stringify(sandbox.render(t, 100, 32, ctx)))
    const expected = film.render(t, 100, 32, { ready, hint: true }).cells.map(row => row.map(c => c[0]).join(''))
    assert.deepEqual(out.lines, expected, `t=${t}`)
    assert.equal(out.styles[0].length, [...out.lines[0]].length)
  }
})
