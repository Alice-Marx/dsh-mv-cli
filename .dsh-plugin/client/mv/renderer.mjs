/**
 * Paint a film Canvas (grid of [char, style] cells) on an HTML <canvas> with
 * the same 256-colour palette player.py writes as ANSI escapes.
 */
export const PALETTE = Object.freeze([
  '#af875f', // 0 DIM     38;5;137
  '#ffaf5f', // 1 NORMAL  38;5;215
  '#ffd75f', // 2 BRIGHT  38;5;221 bold
  '#ffffd7', // 3 WHITE   38;5;230 bold
  '#ff5f5f', // 4 RED     38;5;203 bold
  '#875f00', // 5         38;5;94
  '#5f5f00', // 6         38;5;58
])
export const BOLD = Object.freeze([false, false, true, true, true, false, false])
export const BACKGROUND = '#000000'
export const MAX_COLS = 240
export const MAX_ROWS = 85
export const FONT_FAMILY = '"Cascadia Mono", Consolas, "Sarasa Mono SC", "Noto Sans Mono CJK SC", "Microsoft YaHei Mono", Menlo, monospace'

/** Grid size that fits a box of css pixels with the given cell size. */
export function gridSize(cssWidth, cssHeight, cell) {
  return {
    cols: Math.max(1, Math.min(MAX_COLS, Math.floor(cssWidth / cell.width))),
    rows: Math.max(1, Math.min(MAX_ROWS, Math.floor(cssHeight / cell.height))),
  }
}

/** Measure one monospace cell for a font size (css px). */
export function measureCell(ctx2d, fontSize) {
  ctx2d.font = `${fontSize}px ${FONT_FAMILY}`
  const width = ctx2d.measureText('MMMMMMMMMM').width / 10 || fontSize * 0.6
  return { width, height: Math.ceil(fontSize * 1.18), fontSize }
}

const isAsciiPrintable = ch => ch.length === 1 && ch.charCodeAt(0) >= 0x21 && ch.charCodeAt(0) <= 0x7e

/**
 * Split one row into draw operations: runs of ASCII glyphs of one style (fast,
 * single fillText) and single non-ASCII glyphs placed on their own cell.
 */
export function rowRuns(row) {
  const runs = []
  let run = null
  for (let x = 0; x < row.length; x++) {
    const [ch, style] = row[x]
    if (ch === '' || ch === ' ') { run = null; continue }
    if (isAsciiPrintable(ch)) {
      if (run && run.style === style && run.x + run.text.length === x) run.text += ch
      else { run = { x, style, text: ch, wide: false }; runs.push(run) }
      continue
    }
    run = null
    runs.push({ x, style, text: ch, wide: row[x + 1]?.[0] === '' })
  }
  return runs
}

export class GridRenderer {
  constructor(canvas, { fontSize = 14, devicePixelRatio = globalThis.devicePixelRatio || 1 } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.dpr = devicePixelRatio
    this.setFontSize(fontSize)
  }

  setFontSize(fontSize) {
    this.fontSize = fontSize
    this.cell = measureCell(this.ctx, fontSize)
  }

  /** Resize the backing store to a css box; returns the grid that fits. */
  fit(cssWidth, cssHeight) {
    const grid = gridSize(cssWidth, cssHeight, this.cell)
    const w = Math.ceil(grid.cols * this.cell.width), h = grid.rows * this.cell.height
    const pw = Math.round(w * this.dpr), ph = Math.round(h * this.dpr)
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw; this.canvas.height = ph
      this.canvas.style.width = `${w}px`; this.canvas.style.height = `${h}px`
    }
    this.grid = grid
    return grid
  }

  draw(film) {
    const { ctx, cell } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.textBaseline = 'middle'
    const fonts = [`${cell.fontSize}px ${FONT_FAMILY}`, `bold ${cell.fontSize}px ${FONT_FAMILY}`]
    let currentFont = -1, currentColor = ''
    for (let y = 0; y < film.h; y++) {
      const cy = y * cell.height + cell.height / 2
      for (const run of rowRuns(film.cells[y])) {
        const f = BOLD[run.style] ? 1 : 0
        if (f !== currentFont) { ctx.font = fonts[f]; currentFont = f }
        const color = PALETTE[run.style] ?? PALETTE[1]
        if (color !== currentColor) { ctx.fillStyle = color; currentColor = color }
        if (run.text.length === 1 && !isAsciiPrintable(run.text)) {
          const span = run.wide ? 2 : 1
          ctx.textAlign = 'center'
          ctx.fillText(run.text, (run.x + span / 2) * cell.width, cy, span * cell.width)
          ctx.textAlign = 'left'
        } else {
          ctx.textAlign = 'left'
          ctx.fillText(run.text, run.x * cell.width, cy)
        }
      }
    }
  }
}
