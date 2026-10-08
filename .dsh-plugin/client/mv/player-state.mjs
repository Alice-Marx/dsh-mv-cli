/**
 * Framework-free clock and key handling of the canvas MV, so they can be
 * tested without a DOM. The <audio> element is the master clock when present:
 *   film time = audio.currentTime + audioOffset
 * Without audio a monotonic "silent clock" stands in.
 */
/** Clock length before a pack or the audio says otherwise (seconds). */
export const DEFAULT_DURATION = 240
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
  constructor({ audio = null, silent = new SilentClock(), audioOffset = 0, duration = DEFAULT_DURATION, preroll = 0 } = {}) {
    this.audio = audio; this.silent = silent; this.audioOffset = audioOffset; this.duration = duration
    this.preroll = 0; this.inPreroll = false; this.sequence = 0; this.wantsPlay = false; this.starting = null; this.error = null; this.disposed = false
    if (preroll) this.reset(preroll)
  }
  get hasAudio() { return Boolean(this.audio?.src || this.audio?.currentSrc) }
  get minimumTime() { return this.preroll ? -this.preroll : 0 }
  get playing() {
    if (this.inPreroll) return this.silent.playing
    return this.hasAudio ? (!this.audio.paused || (this.wantsPlay && this.starting?.sequence === this.sequence)) : this.silent.playing
  }
  time() { return this.inPreroll ? Math.min(0, this.silent.time()) : this.hasAudio ? this.audio.currentTime + this.audioOffset : this.silent.time() }
  /** Pause/reset the transport when a pack or an audio source changes. */
  reset(preroll = this.preroll) {
    this.pause()
    this.preroll = Number.isFinite(preroll) && preroll >= 0 && preroll <= 30 ? preroll : 0
    this.inPreroll = this.preroll > 0
    this.silent.seek(-this.preroll)
    if (this.hasAudio) this.audio.currentTime = 0
    this.error = null
  }
  async startAudio() {
    const sequence = this.sequence
    const source = this.audio?.src || this.audio?.currentSrc
    const current = () => !this.disposed && this.sequence === sequence && this.wantsPlay && !this.inPreroll && this.hasAudio && (this.audio.src || this.audio.currentSrc) === source
    if (!current()) return false
    if (this.starting?.sequence === sequence) return this.starting.promise
    const pending = { sequence, promise: null }
    this.starting = pending
    pending.promise = (async () => {
      try {
        await this.audio.play()
        if (!current()) {
          // A late play promise must not revive paused audio or a new preroll.
          // Do not pause a newer valid audio-play request on the same element.
          if (!this.wantsPlay || this.inPreroll || this.disposed) this.audio.pause()
          return false
        }
        return true
      } catch (failure) {
        if (!current()) return false
        this.wantsPlay = false; this.audio.pause()
        throw failure
      } finally { if (this.starting === pending) this.starting = null }
    })()
    return pending.promise
  }
  async play() {
    if (this.disposed) return false
    this.wantsPlay = true; this.error = null
    if (this.inPreroll) { this.silent.play(); return true }
    if (this.hasAudio) return this.startAudio()
    this.silent.play(); return true
  }
  pause() {
    this.sequence++; this.wantsPlay = false
    this.silent.pause()
    if (this.hasAudio) this.audio.pause()
  }
  /** Called by the render loop: preroll is silent and audio still starts at 0. */
  tick() {
    if (this.disposed || !this.inPreroll || !this.wantsPlay || this.silent.time() < 0) return
    this.inPreroll = false; this.silent.pause(); this.silent.seek(0)
    if (this.hasAudio) {
      this.audio.currentTime = 0
      const sequence = this.sequence
      void this.startAudio().catch(failure => { if (this.sequence === sequence && !this.disposed) this.error = failure })
    } else this.silent.play()
  }
  takeError() { const error = this.error; this.error = null; return error }
  dispose() { this.pause(); this.disposed = true }
  /** Seek in film time. */
  seek(t) {
    if (!Number.isFinite(t) || this.disposed) return
    const wasPlaying = this.playing
    this.sequence++; this.wantsPlay = wasPlaying; this.error = null
    const target = Math.min(this.duration, t)
    if (this.preroll && target < 0) {
      this.inPreroll = true
      if (this.hasAudio) { this.audio.pause(); this.audio.currentTime = 0 }
      this.silent.seek(Math.max(-this.preroll, target))
      if (wasPlaying) this.silent.play(); else this.silent.pause()
      return
    }
    const wasPreroll = this.inPreroll
    this.inPreroll = false
    if (this.hasAudio) {
      this.silent.pause()
      const at = target - this.audioOffset
      const end = Number.isFinite(this.audio.duration) ? this.audio.duration - 0.05 : Infinity
      this.audio.currentTime = Math.max(0, Math.min(end, at))
      if (wasPlaying && (wasPreroll || this.starting)) {
        const sequence = this.sequence
        void this.startAudio().catch(failure => { if (this.sequence === sequence && !this.disposed) this.error = failure })
      }
    } else this.silent.seek(Math.max(0, target))
  }
}

/** Film time to render plus whether the slate shows (before start / pre-roll). */
export function frameTime(t, started, duration = DEFAULT_DURATION, preroll = 0) {
  if (preroll > 0 && preroll <= 30 && t < 0) return { t: Math.max(-preroll, t), ready: !started }
  if (!started || t < 0) return { t: Math.max(0, t), ready: !started || t < 0 }
  return { t: Math.min(t, duration - 1e-3), ready: false }
}

/** A positive countdown exists only for an explicitly enabled negative timeline. */
export function prerollCountdown(t, preroll = 0) { return preroll > 0 && preroll <= 30 && Number.isFinite(t) && t < 0 ? Math.ceil(Math.min(preroll, -t)) : null }

/** Preparation is shared by 2D/3D scenes; font loading is a separate stage. */
export function preparationText(progress = {}) {
  const label = progress.phase === 'font-loading' ? '正在加载场景字体…' : progress.phase === 'warming' ? '正在预热场景…' : '正在准备场景资源…'
  const percent = Number.isFinite(progress.progress) ? ` ${Math.round(Math.max(0, Math.min(1, progress.progress)) * 100)}%` : ''
  return `${label}${percent}${progress.label ? ` · ${progress.label}` : ''}`
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
    case '1': case '2': case '3': case '4': case '5': return { type: 'chapter', index: Number(key) - 1 }
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
