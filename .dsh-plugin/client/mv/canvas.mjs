/**
 * Character-cell canvas, a JS port of the `Canvas` class and width helpers of
 * world.execute-me-ascii player.py (by yym8224961, used with permission).
 * Cells are [char, style]; a double-width char is followed by ['', style].
 */
import { WIDE, COMBINING } from './width-table.gen.mjs'
import { $int, $round, $str } from './pyrt.mjs'

export const DIM = 0, NORMAL = 1, BRIGHT = 2, WHITE = 3, RED = 4

function inRanges(table, cp) {
  let lo = 0, hi = table.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [a, b] = table[mid]
    if (cp < a) hi = mid - 1
    else if (cp > b) lo = mid + 1
    else return true
  }
  return false
}

const widthCache = new Map()
/** Terminal cell width of one code point: 0 combining, 2 East Asian W/F, else 1. */
export function cw(ch) {
  let w = widthCache.get(ch)
  if (w !== undefined) return w
  const cp = ch.codePointAt(0)
  w = inRanges(COMBINING, cp) ? 0 : inRanges(WIDE, cp) ? 2 : 1
  if (widthCache.size < 4096) widthCache.set(ch, w)
  return w
}

export function width(s) { let n = 0; for (const ch of s) n += cw(ch); return n }

export function crop(s, n) {
  let out = '', used = 0
  for (const ch of s) {
    const k = cw(ch)
    if (used + k > n) break
    out += ch; used += k
  }
  return out
}

export function wrap(s, n) {
  if (width(s) <= n) return [s]
  const parts = []
  const ascii = [...s].every(c => c.codePointAt(0) < 128)
  while (s) {
    let line = crop(s, n)
    if (!line) line = Array.from(s)[0]
    if ([...line].length < [...s].length && line.includes(' ') && ascii) line = line.slice(0, line.lastIndexOf(' ')) || line
    parts.push(line)
    s = s.slice(line.length).replace(/^\s+/u, '')
  }
  return parts
}

export class Canvas {
  constructor(w, h) {
    this.w = w; this.h = h
    this.clip = null
    this.cells = []
    for (let y = 0; y < h; y++) {
      const row = new Array(w)
      for (let x = 0; x < w; x++) row[x] = [' ', DIM]
      this.cells.push(row)
    }
  }

  put(x, y, s, style = NORMAL) {
    x = $int(x); y = $int(y)
    if (!(y >= 0 && y < this.h)) return
    if (this.clip && !(this.clip[0] <= y && y <= this.clip[1])) return
    const text = typeof s === 'string' ? s : $str(s)
    const row = this.cells[y]
    for (const ch of text) {
      const k = cw(ch)
      if (k === 0) continue
      if (x >= 0 && x + k <= this.w) {
        row[x] = [ch, style]
        if (k === 2) row[x + 1] = ['', style]
      }
      x += k
    }
  }

  center(y, s, style = NORMAL) { this.put(Math.floor((this.w - width(typeof s === 'string' ? s : $str(s))) / 2), y, s, style) }

  line(x0, y0, x1, y1, ch = '.', style = DIM) {
    const steps = Math.max(1, $int(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.5))
    for (let i = 0; i <= steps; i++) {
      const u = i / steps
      this.put($round(x0 + (x1 - x0) * u), $round(y0 + (y1 - y0) * u), ch, style)
    }
  }

  box(x, y, w, h, style = DIM) {
    if (w < 2 || h < 2) return
    const edge = '+' + '-'.repeat(Math.max(0, w - 2)) + '+'
    this.put(x, y, edge, style)
    this.put(x, y + h - 1, edge, style)
    for (let yy = $int(y + 1); yy < $int(y + h - 1); yy++) {
      this.put(x, yy, '|', style); this.put(x + w - 1, yy, '|', style)
    }
  }

  big(y, text, style = BRIGHT) {
    text = text.toUpperCase()
    const total = text.length * 6 - 1
    if (total > this.w - 6) { this.center(y + 2, text, style); return }
    const left = Math.floor((this.w - total) / 2)
    let i = 0
    for (const ch of text) {
      const rows = FONT.has(ch) ? FONT.get(ch) : FONT.get(' ')
      rows.forEach((row, dy) => {
        for (let dx = 0; dx < row.length; dx++) if (row[dx] === '1') this.put(left + i * 6 + dx, y + dy, '#', style)
      })
      i++
    }
  }

  /** Plain text, for tests and snapshots. */
  plain() { return this.cells.map(r => r.map(c => c[0]).join('')).join('\n') }
}

import { PyDict } from './pyrt.mjs'
const FONT_ROWS = {
  A: ['01110', '11011', '11111', '11011', '11011'], B: ['11110', '11011', '11110', '11011', '11110'],
  C: ['01111', '11000', '11000', '11000', '01111'], D: ['11110', '11011', '11011', '11011', '11110'],
  E: ['11111', '11000', '11110', '11000', '11111'], F: ['11111', '11000', '11110', '11000', '11000'],
  G: ['01111', '11000', '11011', '11011', '01111'], H: ['11011', '11011', '11111', '11011', '11011'],
  I: ['11111', '00100', '00100', '00100', '11111'], J: ['00111', '00011', '00011', '11011', '01110'],
  K: ['11011', '11110', '11100', '11110', '11011'], L: ['11000', '11000', '11000', '11000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'], N: ['11001', '11101', '11111', '10111', '10011'],
  O: ['01110', '11011', '11011', '11011', '01110'], P: ['11110', '11011', '11110', '11000', '11000'],
  Q: ['01110', '11011', '11011', '01110', '00011'], R: ['11110', '11011', '11110', '11101', '11011'],
  S: ['01111', '11000', '01110', '00011', '11110'], T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['11011', '11011', '11011', '11011', '01110'], V: ['11011', '11011', '11011', '01110', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'], X: ['11011', '01110', '00100', '01110', '11011'],
  Y: ['11011', '11011', '01110', '00100', '00100'], Z: ['11111', '00011', '00110', '01100', '11111'],
  0: ['01110', '11011', '11011', '11011', '01110'], 1: ['00100', '01100', '00100', '00100', '01110'],
  2: ['11110', '00011', '01110', '11000', '11111'], 3: ['11110', '00011', '01110', '00011', '11110'],
  4: ['11011', '11011', '11111', '00011', '00011'], 5: ['11111', '11000', '11110', '00011', '11110'],
  6: ['01111', '11000', '11110', '11011', '01110'], 7: ['11111', '00011', '00110', '01100', '01100'],
  8: ['01110', '11011', '01110', '11011', '01110'], 9: ['01110', '11011', '01111', '00011', '11110'],
  ';': ['00000', '00100', '00000', '00100', '01000'], '.': ['00000', '00000', '00000', '00000', '00100'],
  '(': ['00010', '00100', '00100', '00100', '00010'], ')': ['01000', '00100', '00100', '00100', '01000'],
  '-': ['00000', '00000', '11111', '00000', '00000'], ' ': ['00000', '00000', '00000', '00000', '00000'],
}
/** 5x5 block font of player.py, as the PyDict the scenes expect. */
export const FONT = new PyDict(Object.entries(FONT_ROWS))
