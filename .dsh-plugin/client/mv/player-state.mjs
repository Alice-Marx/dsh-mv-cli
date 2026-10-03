/**
 * Framework-free clock and key handling of the canvas MV, so they can be
 * tested without a DOM. The <audio> element is the master clock when present:
 *   film time = audio.currentTime + audioOffset
 * Without audio a monotonic "silent clock" stands in.
 */
import { CHAPTERS, DURATION } from './film.mjs'
import { roundOffset } from './sync.mjs'

export class SilentClock {
  constructor(now = () => performance.now()) { this.now = now; this.base = 0; this.since = null }
  get playing() { return this.since !== null }
  time() { return this.base + (this.since === null ? 0 : (this.now() - this.since) / 1000) }
  play() { if (this.since === null) this.since = this.now() }
  pause() { this.base = this.time(); this.since = null }
  seek(t) { this.base = t; if (this.since !== null) this.since = this.now() }
}

/** Clock facade over an <audio> element (or the silent clock). */
export class FilmClock {
  constructor({ audio = null, silent = new SilentClock(), audioOffset = 0 } = {}) {
    this.audio = audio; this.silent = silent; this.audioOffset = audioOffset
  }
  get hasAudio() { return Boolean(this.audio?.src || this.audio?.currentSrc) }
  get playing() { return this.hasAudio ? !this.audio.paused : this.silent.playing }
  time() { return this.hasAudio ? this.audio.currentTime + this.audioOffset : this.silent.time() }
  async play() { if (this.hasAudio) await this.audio.play(); else this.silent.play() }
  pause() { if (this.hasAudio) this.audio.pause(); else this.silent.pause() }
  /** Seek in film time. */
  seek(t) {
    const target = Math.min(DURATION, t)
    if (this.hasAudio) {
      const at = target - this.audioOffset
      const end = Number.isFinite(this.audio.duration) ? this.audio.duration - 0.05 : Infinity
      this.audio.currentTime = Math.max(0, Math.min(end, at))
    } else this.silent.seek(Math.max(0, target))
  }
}

/** Film time to render plus whether the slate shows (before start / pre-roll). */
export function frameTime(t, started) {
  if (!started || t < 0) return { t: Math.max(0, t), ready: !started || t < 0 }
  return { t: Math.min(t, DURATION - 1e-3), ready: false }
}

/** Cue index navigation as player.py `,` / `.` (bisect_right(times, t+.03) - 1 ± 1). */
export function stepCue(times, t, direction) {
  if (!times.length) return null
  let lo = 0, hi = times.length
  while (lo < hi) { const mid = (lo + hi) >> 1; if (t + 0.03 < times[mid]) hi = mid; else lo = mid + 1 }
  const i = Math.min(times.length - 1, Math.max(0, lo - 1 + (direction > 0 ? 1 : -1)))
  return times[i]
}

/**
 * Map a KeyboardEvent-like {key, shiftKey, altKey} to an action, mirroring
 * player.py's keys plus F (fullscreen), M (mute) and Alt+[ / Alt+] for the
 * audio sync offset. Returns null for keys the player does not handle.
 */
export function keyAction({ key, altKey = false, ctrlKey = false, metaKey = false }) {
  if (ctrlKey || metaKey) return null
  switch (key) {
    case ' ': case 'Enter': return { type: 'toggle' }
    case 'ArrowLeft': return { type: 'seekBy', delta: -5 }
    case 'ArrowRight': return { type: 'seekBy', delta: 5 }
    case 'r': case 'R': return { type: 'restart' }
    case '1': case '2': case '3': case '4': case '5': return { type: 'chapter', index: Number(key) - 1, at: CHAPTERS[Number(key) - 1][0] }
    case '[': return altKey ? { type: 'audioOffset', delta: -0.1 } : { type: 'subtitleOffset', delta: 0.1 }
    case ']': return altKey ? { type: 'audioOffset', delta: 0.1 } : { type: 'subtitleOffset', delta: -0.1 }
    case '“': return { type: 'audioOffset', delta: -0.1 } // macOS Alt+[
    case '‘': return { type: 'audioOffset', delta: 0.1 } // macOS Alt+]
    case ',': return { type: 'cue', direction: -1 }
    case '.': return { type: 'cue', direction: 1 }
    case '+': case '=': return { type: 'volume', delta: 0.05 }
    case '-': return { type: 'volume', delta: -0.05 }
    case 'm': case 'M': return { type: 'mute' }
    case 'h': case 'H': case '?': return { type: 'help' }
    case 'Escape': return { type: 'escape' }
    case 'f': case 'F': return { type: 'fullscreen' }
    default: return null
  }
}

export const stepOffset = (value, delta) => roundOffset(value + delta)
