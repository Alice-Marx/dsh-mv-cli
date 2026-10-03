// ---- grid helpers (shared by every example; copy them into your own scenes.js) ----------------
// A frame is a grid of cells. ch[y][x] holds one character, st[y][x] its style digit:
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
// Wide characters (CJK, full-width punctuation) take two cells; the second cell holds '' so that
// lines and styles stay aligned when joined.
var WIDE = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/
function cellWidth(c) { return WIDE.test(c) ? 2 : 1 }
function textWidth(s) { var w = 0; for (var c of String(s)) w += cellWidth(c); return w }
function makeGrid(cols, rows) {
  var ch = [], st = []
  for (var y = 0; y < rows; y++) { ch.push(new Array(cols).fill(' ')); st.push(new Array(cols).fill('0')) }
  return { cols: cols, rows: rows, ch: ch, st: st }
}
function setCell(g, x, y, c, s) {
  if (y < 0 || y >= g.rows || x < 0 || x >= g.cols) return
  var row = g.ch[y], sty = g.st[y], w = cellWidth(c)
  if (x + w > g.cols) return
  if (row[x] === '' && x > 0) { row[x - 1] = ' '; sty[x - 1] = '0' }        // we hit the right half of a wide char
  if (w === 1 && row[x + 1] === '') { row[x + 1] = ' '; sty[x + 1] = '0' }  // we cover the left half of one
  if (w === 2 && row[x + 2] === '') { row[x + 2] = ' '; sty[x + 2] = '0' }
  row[x] = c; sty[x] = String(s)
  if (w === 2) { row[x + 1] = ''; sty[x + 1] = '' }
}
function put(g, x, y, text, s) {
  x = Math.round(x); y = Math.round(y)
  for (var c of String(text)) { setCell(g, x, y, c, s); x += cellWidth(c) }
}
function center(g, y, text, s) { put(g, Math.floor((g.cols - textWidth(text)) / 2), y, text, s) }
function fill(g, x, y, w, h, c, s) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) setCell(g, x + i, y + j, c, s) }
function box(g, x, y, w, h, s, title) {
  if (w < 2 || h < 2) return
  for (var i = 1; i < w - 1; i++) { setCell(g, x + i, y, '─', s); setCell(g, x + i, y + h - 1, '─', s) }
  for (var j = 1; j < h - 1; j++) { setCell(g, x, y + j, '│', s); setCell(g, x + w - 1, y + j, '│', s) }
  setCell(g, x, y, '┌', s); setCell(g, x + w - 1, y, '┐', s); setCell(g, x, y + h - 1, '└', s); setCell(g, x + w - 1, y + h - 1, '┘', s)
  if (title) put(g, x + 2, y, ' ' + title + ' ', s)
}
function frameOf(g) { return { lines: g.ch.map(function (r) { return r.join('') }), styles: g.st.map(function (r) { return r.join('') }) } }
// Deterministic pseudo-random numbers: the same (seed, i) always gives the same value, so a frame
// depends only on t and ctx (seeking works, the agent preview matches playback).
function hash(i, seed) { var h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
// Silent packs (no audio) get zero bands: fake a little motion from the beat so previews are not dead.
function energyOf(ctx, t) { return ctx.energy > 0.01 ? ctx.energy : 0.25 + 0.2 * (ctx.beat ? ctx.beat.pulse : 0.5 + 0.5 * Math.sin(t * 4)) }
function bandOf(ctx, i, t) { return ctx.energy > 0.01 ? ctx.bands[i] : clamp(0.35 + 0.3 * Math.sin(t * 3 + i * 0.45) * (1 - i / 64) + (ctx.beat ? 0.3 * ctx.beat.pulse : 0), 0, 1) }
// ---- end of grid helpers -------------------------------------------------------------------------
