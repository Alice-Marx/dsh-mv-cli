/**
 * Entry of the world.execute(me) workshop pack's scenes.js (renderer "script"). Bundled by
 * presets/build-workshop-packs.mjs into one sandboxed scene script; not part of the npm package.
 * Wraps the port of yym8224961/world.execute-me-ascii (Film) into render(t, cols, rows, ctx).
 */
import { Film, DEFAULT_HINT } from './src/film.mjs'

const SILENT_BANDS = new Array(48).fill(0)
let bands = SILENT_BANDS
const film = new Film({ energy: () => bands })
let lastCue = null

/** render(t, cols, rows, ctx) → { lines, styles } (styles: digits 0..4 per character). */
export function render(t, cols, rows, ctx) {
  bands = (ctx && ctx.bands) || SILENT_BANDS
  if (ctx && ctx.duration > 0) film.duration = ctx.duration
  // ctx.lyric is the cue showing at t (subtitle offset already applied by the panel).
  const lyric = ctx && ctx.lyric
  const key = lyric ? `${lyric.start}|${lyric.end}|${lyric.en}|${lyric.zh}` : ''
  if (key !== lastCue) {
    lastCue = key
    film.setLyrics(lyric ? [{ time: lyric.start, end: lyric.end, en: lyric.en || (lyric.zh ? '' : lyric.text), zh: lyric.zh }] : [])
  }
  const canvas = film.render(t, cols, rows, { paused: Boolean(ctx && ctx.paused), ready: Boolean(ctx && ctx.ready), offset: 0, hint: true, hintText: DEFAULT_HINT })
  const lines = [], styles = []
  for (const row of canvas.cells) {
    let line = '', style = ''
    for (const cell of row) {
      if (cell[0] === '') continue // right half of a wide character
      line += cell[0]; style += String(cell[1])
    }
    lines.push(line); styles.push(style)
  }
  return { lines, styles }
}
