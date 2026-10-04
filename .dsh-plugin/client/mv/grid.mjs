/**
 * Character grid for the plugin's own renderers (generic, scene script): rows of
 * [char, style] cells, painted by GridRenderer (renderer.mjs). A double-width
 * character occupies its cell and the next one, which holds ''.
 * Written for dsh-mv-cli (MIT); styles index renderer.mjs PALETTE.
 */
import { WIDE, COMBINING } from './width-table.gen.mjs'

export const DIM = 0, NORMAL = 1, BRIGHT = 2, WHITE = 3, RED = 4

const within = (ranges, cp) => {
  let lo = 0, hi = ranges.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (cp < ranges[mid][0]) hi = mid - 1
    else if (cp > ranges[mid][1]) lo = mid + 1
    else return true
  }
  return false
}

const widths = new Map()
/** Cells a character takes: 0 for combining marks, 2 for East Asian wide / full-width, else 1. */
export function cw(ch) {
  let n = widths.get(ch)
  if (n === undefined) {
    const cp = ch.codePointAt(0) ?? 32
    n = within(COMBINING, cp) ? 0 : within(WIDE, cp) ? 2 : 1
    if (widths.size < 8192) widths.set(ch, n)
  }
  return n
}

export const width = text => { let n = 0; for (const ch of String(text)) n += cw(ch); return n }

/** The longest prefix of text that fits in n cells. */
export function crop(text, n) {
  let out = '', used = 0
  for (const ch of String(text)) {
    const k = cw(ch)
    if (used + k > n) break
    out += ch; used += k
  }
  return out
}

/** Break text into lines of at most n cells (at spaces when there are any, else anywhere). */
export function wrap(text, n) {
  const lines = []
  let rest = String(text).trim()
  if (n < 1) return [rest]
  while (rest) {
    if (width(rest) <= n) { lines.push(rest); break }
    let head = crop(rest, n) || [...rest][0]
    const space = head.lastIndexOf(' ')
    if (space > 0 && rest[head.length] !== ' ') head = head.slice(0, space)
    lines.push(head.trimEnd())
    rest = rest.slice(head.length).trimStart()
  }
  return lines.length ? lines : ['']
}

export class Grid {
  constructor(w, h) {
    this.w = w; this.h = h
    this.cells = Array.from({ length: h }, () => Array.from({ length: w }, () => [' ', DIM]))
  }

  /** Write text from column x on row y (clipped at the edges; wide characters never split). */
  put(x, y, text, style = NORMAL) {
    x = Math.trunc(x); y = Math.trunc(y)
    if (y < 0 || y >= this.h) return
    const row = this.cells[y]
    for (const ch of String(text)) {
      const k = cw(ch)
      if (!k) continue
      if (x >= 0 && x + k <= this.w) { row[x] = [ch, style]; if (k === 2) row[x + 1] = ['', style] }
      x += k
    }
  }

  center(y, text, style = NORMAL) { this.put(Math.floor((this.w - width(text)) / 2), y, text, style) }

  fill(y0, y1, style = DIM) { for (let y = Math.max(0, y0); y <= Math.min(this.h - 1, y1); y++) this.put(0, y, ' '.repeat(this.w), style) }

  frame(x, y, w, h, style = DIM) {
    if (w < 2 || h < 2) return
    const edge = `+${'-'.repeat(w - 2)}+`
    this.put(x, y, edge, style); this.put(x, y + h - 1, edge, style)
    for (let yy = y + 1; yy < y + h - 1; yy++) { this.put(x, yy, '|', style); this.put(x + w - 1, yy, '|', style) }
  }

  text() { return this.cells.map(row => row.map(cell => cell[0]).join('')).join('\n') }
  /** Same as text() (the name the ported Canvas used in tests). */
  plain() { return this.text() }
}

/** Keyboard help panel drawn over a grid (shared by the generic and script renderers). */
export function drawHelp(grid, lines, offset = 0) {
  const all = [...lines, `字幕偏移 ${offset < 0 ? '-' : '+'}${Math.abs(offset).toFixed(1)}s`]
  const w = Math.min(grid.w - 4, 58), h = all.length + 3
  const x = Math.floor((grid.w - w) / 2), y = Math.floor((grid.h - h) / 2)
  for (let yy = y; yy < y + h; yy++) grid.put(x, yy, ' '.repeat(w), NORMAL)
  grid.frame(x, y, w, h, BRIGHT)
  all.forEach((line, i) => grid.put(x + 3, y + 2 + i, crop(line, w - 5), i === 0 ? WHITE : NORMAL))
}

export const HELP_LINES = Object.freeze(['CONTROLS / 操作', 'SPACE / ENTER   播放或暂停', 'LEFT / RIGHT    后退或前进 5 秒',
  'R               从头播放', '1 2 3 4 5       跳转章节 / 段落', '[ / ]           字幕提前 / 延后 0.1 秒',
  ', / .           上一句 / 下一句', '+ / -           音量', 'M               静音', 'F               全屏',
  'ESC / H         关闭帮助'])
