/**
 * Generic canvas renderer for MV packs without custom scenes: title card,
 * a full-width spectrum (48 bands → vertical bars), the current lyric (both
 * languages), the next line, and a progress bar. Same render() interface and
 * cell styles as the scene-script renderer, so GridRenderer paints it unchanged.
 */
import { Grid, width, crop, wrap, drawHelp, HELP_LINES, DIM, NORMAL, BRIGHT, WHITE } from './grid.mjs'

const BAR_LEVELS = ' .:-=+*#%@'
const SILENT = Object.freeze(new Array(48).fill(0))
const pad2 = n => String(n).padStart(2, '0')

export function timeText(t) {
  const s = Math.max(0, Math.trunc(t))
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

/** Five evenly spaced "chapters" for the 1–5 keys. */
export function genericChapters(duration) {
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0
  return [0, 1, 2, 3, 4].map(i => [Math.round(d * i / 5 * 10) / 10, `${i + 1} / 5`, ''])
}

/** Lyric cues (sorted by time) and lookups shared by the grid renderers. */
export class CueFilm {
  constructor({ lyrics = [], energy = () => SILENT, duration = 0 } = {}) {
    this.setLyrics(lyrics)
    this.energy = energy
    this.duration = duration
  }

  setLyrics(lyrics) {
    this.lyrics = [...(lyrics ?? [])].sort((a, b) => a.time - b.time)
    this.times = this.lyrics.map(cue => cue.time)
  }

  /** Index of the last cue starting at or before t (-1 if none). */
  cueIndex(t) {
    let lo = 0, hi = this.times.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (t < this.times[mid]) hi = mid; else lo = mid + 1 }
    return lo - 1
  }

  /** The cue showing at t, or null. */
  cue(t) {
    const cue = this.lyrics[this.cueIndex(t)]
    return cue && t < cue.end ? cue : null
  }

  help(grid, offset, lines = HELP_LINES) { drawHelp(grid, lines, offset) }
}

export class GenericFilm extends CueFilm {
  constructor({ title = '', artist = '', lyrics = [], energy = () => SILENT, duration = 0 } = {}) {
    super({ lyrics, energy, duration })
    this.title = title
    this.artist = artist
  }

  setMeta({ title, artist }) { this.title = title ?? this.title; this.artist = artist ?? this.artist }

  /** Next cue starting after t (for the dim preview line). */
  nextCue(t) { return this.lyrics[this.cueIndex(t) + 1] ?? null }

  chapter(t) {
    const chapters = genericChapters(this.duration)
    let act = chapters[0]
    for (const c of chapters) if (c[0] <= Math.max(0, t)) act = c
    return act
  }

  render(t, w, h, { paused = false, offset = 0, ready = false, hint = true, hintText = '', help = false, helpLines = HELP_LINES } = {}) {
    const c = new Grid(w, h)
    const title = (this.title || 'MV').toUpperCase()
    if (w < 40 || h < 14) {
      c.center(Math.floor(h / 2) - 1, crop(title, w - 2), BRIGHT)
      c.center(Math.floor(h / 2) + 1, '请放大窗口，或缩小字号', WHITE)
      return c
    }
    const state = ready ? 'READY' : paused ? 'PAUSED' : 'PLAYING'
    const clock = `${timeText(t)} / ${timeText(this.duration)}  ${state}`
    c.put(2, 0, crop(this.artist ? `${this.title} — ${this.artist}` : this.title, Math.max(4, w - width(clock) - 6)), BRIGHT)
    c.put(w - width(clock) - 2, 0, clock, DIM)
    c.put(2, 1, '-'.repeat(Math.max(0, w - 4)), DIM)

    // Spectrum: rows top..bottom, one column per cell, mirrored around the centre.
    const top = 3, bottom = h - 9
    const rows = Math.max(1, bottom - top + 1)
    const spec = this.energy(t) ?? SILENT
    const cols = w - 4
    for (let x = 0; x < cols; x++) {
      const centre = Math.abs(x - (cols - 1) / 2) / ((cols - 1) / 2 || 1)
      const band = Math.min(47, Math.trunc(centre * 47.999))
      const amp = Math.max(0, Math.min(1, spec[band] ?? 0))
      const height = amp * rows
      for (let r = 0; r < rows; r++) {
        const fill = height - r
        if (fill <= 0) break
        const level = fill >= 1 ? BAR_LEVELS.length - 1 : Math.max(1, Math.round(fill * (BAR_LEVELS.length - 1)))
        const style = r > rows * 0.75 ? WHITE : r > rows * 0.45 ? BRIGHT : r > rows * 0.15 ? NORMAL : DIM
        c.put(2 + x, bottom - r, BAR_LEVELS[level], style)
      }
    }
    if (ready) {
      const cy = Math.trunc((top + bottom) / 2)
      c.fill(top, bottom, DIM)
      const spaced = [...title].join(' ')
      c.center(cy - 1, crop(width(spaced) < w - 6 ? spaced : this.title, w - 4), BRIGHT)
      if (this.artist) c.center(cy + 3, crop(this.artist, w - 4), WHITE)
      c.center(Math.min(bottom, cy + 5), '[ SPACE / ENTER TO START ]', BRIGHT)
    }

    // Lyrics.
    const e = this.cue(t + offset)
    if (!ready) {
      if (e) {
        const ens = e.en ? wrap(e.en, w - 8) : []
        const zhs = e.zh ? wrap(e.zh, w - 8) : []
        ens.slice(0, 2).forEach((line, i) => c.center(h - 7 + i, line, WHITE))
        zhs.slice(0, 2).forEach((line, i) => c.center(h - 5 + i, line, BRIGHT))
      } else if (this.lyrics.length) {
        c.center(h - 6, '[ instrumental / 间奏 ]', DIM)
      }
      const next = this.nextCue(t + offset)
      if (next && next !== e) c.center(h - 3, crop(next.en || next.zh, w - 8), DIM)
    }

    // Progress.
    const barW = Math.max(10, w - 8)
    const done = this.duration > 0 ? Math.max(0, Math.min(1, t / this.duration)) : 0
    const filled = Math.round(done * barW)
    c.put(4, h - 2, '='.repeat(filled), NORMAL)
    c.put(4 + filled, h - 2, '-'.repeat(Math.max(0, barW - filled)), DIM)
    if (hint && hintText) c.center(h - 1, crop(hintText, w - 4), DIM)
    if (help) this.help(c, offset, helpLines)
    return c
  }
}
