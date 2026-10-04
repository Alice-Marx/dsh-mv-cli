/**
 * The film: one frame of the terminal MV as a pure function of song time t.
 * JS port of `Film.render` in world.execute-me-ascii player.py (by yym8224961,
 * used and modified with the author's permission; see NOTICE.md). Lyrics and
 * the spectrum are supplied at runtime by the user — nothing copyrighted ships.
 */
import { Canvas, FONT, width, crop, wrap, DIM, NORMAL, BRIGHT, WHITE } from './canvas.mjs'
import { $round } from './pyrt.mjs'
import { draw_scene, phosphor, title_takeover } from './scenes.gen.mjs'

export const DURATION = 211.906667
export const CHAPTERS = Object.freeze([
  [0, '01 / CREATION', '创建'], [29.709, '02 / DEVOTION', '献出自我'],
  [110.9, '03 / ISOLATION', '离开'], [125.708, '04 / EXECUTION', '失控'],
  [177.246, '05 / LOVE', '困于爱'],
])
export const MIN_COLS = 64
export const MIN_ROWS = 24
export const DEFAULT_HINT = 'SPACE play/pause  <- -> 5s  [ ] offset  1-5 chapter  F fullscreen  H help'
/** The original player's footer, used by the parity tests. */
export const ORIGINAL_HINT = 'SPACE play/pause   <- -> 5s   R restart   Q quit   H help'
/** Help overlay lines for the canvas player (the original lists Q/ESC to quit). */
export const HELP_LINES = Object.freeze(['CONTROLS / 操作', 'SPACE / ENTER   播放或暂停', 'LEFT / RIGHT    后退或前进 5 秒',
  'R               从头播放', '1 2 3 4 5       跳转五个章节', '[ / ]           字幕提前 / 延后 0.1 秒',
  ', / .           上一句 / 下一句', '+ / -           音量', 'M               静音', 'F               全屏',
  'ESC / H         关闭帮助'])
/** player.py's own help lines (parity tests). */
export const ORIGINAL_HELP_LINES = Object.freeze(['CONTROLS / 操作', 'SPACE / ENTER   播放或暂停', 'LEFT / RIGHT    后退或前进 5 秒',
  'R               从头播放', '1 2 3 4 5       跳转五个章节', '[ / ]           字幕提前 / 延后 0.1 秒',
  ', / .           上一句 / 下一句', '+ / -           音量', 'Q / ESC         退出', 'H               关闭帮助'])
const SILENT = Object.freeze(new Array(48).fill(0))

const pad2 = n => String(n).padStart(2, '0')

/** "mm:ss.d" exactly as player.py prints it (int(t)//60, int(t)%60, int(t*10)%10). */
export function clockText(t, duration = DURATION) {
  const s = Math.trunc(t), tenth = ((Math.trunc(t * 10) % 10) + 10) % 10
  const total = Math.round(duration)
  return `${pad2(Math.floor(s / 60))}:${pad2(((s % 60) + 60) % 60)}.${tenth} / ${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`
}

export class Film {
  /**
   * @param {object} options
   * @param {Array<{time:number,end:number,en?:string,zh?:string}>} options.lyrics cues, sorted
   * @param {(t:number)=>number[]} options.energy 48 normalised bands for time t
   */
  constructor({ lyrics = [], energy = () => SILENT, duration = DURATION } = {}) {
    this.setLyrics(lyrics)
    this.energy = energy
    this.duration = duration
  }

  setLyrics(lyrics) {
    this.lyrics = [...lyrics].sort((a, b) => a.time - b.time)
    this.times = this.lyrics.map(x => x.time)
  }

  /** The cue showing at t, or null (bisect_right − 1, then t < end). */
  cue(t) {
    let lo = 0, hi = this.times.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (t < this.times[mid]) hi = mid; else lo = mid + 1 }
    const e = lo - 1 >= 0 ? this.lyrics[lo - 1] : null
    return e && t < e.end ? e : null
  }

  chapter(t) {
    let act = CHAPTERS[0]
    for (const c of CHAPTERS) if (c[0] <= Math.max(0, t)) act = c
    return act
  }

  render(t, w, h, { paused = false, offset = 0, ready = false, hint = true, hintText = DEFAULT_HINT, help = false, helpLines = HELP_LINES } = {}) {
    const c = new Canvas(w, h)
    if (w < MIN_COLS || h < MIN_ROWS) {
      c.center(Math.floor(h / 2) - 2, 'WORLD.EXECUTE(ME);', BRIGHT)
      c.center(Math.floor(h / 2), '请放大窗口，或缩小字号', WHITE)
      c.center(Math.floor(h / 2) + 2, `${w} x ${h} / minimum ${MIN_COLS} x ${MIN_ROWS}`, NORMAL)
      c.center(Math.floor(h / 2) + 4, 'SPACE pause  F fullscreen', DIM)
      return c
    }
    if (t >= 15.8 && t < 29.709 && !ready) {
      const source = t < 18.1 ? this.render(15.799, w, h, { paused, offset, ready: false, hint, hintText }) : null
      title_takeover(c, t, FONT, source)
      if (help) this.help(c, offset, helpLines)
      return c
    }
    const e = this.cue(t + offset)
    const act = this.chapter(t)
    c.put(2, 0, 'WORLD.EXECUTE(ME);', BRIGHT)
    const state = ready ? 'READY' : paused ? 'PAUSED' : 'RUNNING'
    const clock = `${clockText(t, this.duration)}  ${state}`
    c.put(w - width(clock) - 2, 0, clock, DIM)
    c.put(2, 1, '-'.repeat(Math.max(0, w - 4)), DIM)
    c.put(2, 2, act[1], NORMAL)
    const top = 4, bottom = h - 8
    const spec = this.energy(t) ?? SILENT
    let pulse = 0
    for (let i = 0; i < 10; i++) pulse += spec[i] ?? 0
    pulse /= 10
    c.clip = [top, bottom]
    draw_scene(c, t, top, bottom, pulse, e)
    phosphor(c, t, top, bottom)
    c.clip = null
    const sy = h - 6, cols = Math.min(80, w - 8), start = Math.floor((w - cols) / 2)
    for (let i = 0; i < cols; i++) {
      const amp = spec[Math.trunc(i * 48 / cols)] ?? 0
      c.put(start + i, sy, '._:=|'[Math.min(4, $round(amp * 4))], DIM)
    }
    if (ready) {
      c.center(h - 5, 'MILI  /  world.execute(me);', WHITE)
      c.center(h - 3, '[ SPACE / ENTER TO START ]', BRIGHT)
    } else if (e) {
      const ens = e.en ? wrap(e.en, w - 8) : []
      const zhs = e.zh ? wrap(e.zh, w - 8) : []
      ens.slice(0, 2).forEach((line, i) => c.center(h - 5 + i, line, WHITE))
      zhs.slice(0, 2).forEach((line, i) => c.center(h - 3 + i, line, BRIGHT))
    } else if (t > 208) {
      c.center(h - 5, 'PROCESS ENDED. THE LOOP REMAINS.', WHITE)
    } else {
      c.center(h - 5, '[ instrumental ]', DIM)
      c.center(h - 3, '[ 间奏 ]', DIM)
    }
    if (hint) c.center(h - 1, crop(hintText, w - 4), DIM)
    if (ready) this.slate(c, top, bottom)
    if (help) this.help(c, offset, helpLines)
    return c
  }

  /** Controls overlay, as `Film.help` in player.py. */
  help(c, offset, lines = HELP_LINES) {
    const sign = offset < 0 ? '-' : '+'
    const all = [...lines, `字幕偏移 ${sign}${Math.abs(offset).toFixed(1)}s`]
    const w = Math.min(c.w - 4, 58), x = Math.floor((c.w - w) / 2), y = Math.floor((c.h - all.length - 3) / 2)
    for (let yy = y; yy < y + all.length + 3; yy++) c.put(x, yy, ' '.repeat(w), NORMAL)
    c.box(x, y, w, all.length + 3, BRIGHT)
    all.forEach((line, i) => c.put(x + 3, y + 2 + i, crop(line, w - 5), i === 0 ? WHITE : NORMAL))
  }

  slate(c, top, bottom) {
    for (let y = top; y <= bottom; y++) c.put(0, y, ' '.repeat(c.w), DIM)
    const cy = Math.trunc((top + bottom) / 2)
    c.center(top + 1, 'A TERMINAL MUSIC VIDEO', DIM)
    c.big(Math.max(top + 2, cy - 4), 'EXECUTE(ME);', BRIGHT)
    c.center(cy + 3, 'M I L I', WHITE)
    c.center(Math.min(bottom, cy + 6), '[ SPACE / ENTER TO START ]', BRIGHT)
  }
}
