/** Local decoded video. Python/rendering code is never run by the player. */
import { GenericFilm } from './generic-film.mjs'
import { bitmapSubtitles } from './script-film.mjs'

export const VIDEO_ACCEPT = 'video/*,.mp4,.m4v,.mov,.webm,.mkv'

/** Container identity, independent of whether the first 4 KiB has a video track header. */
export function videoMime(sniff) {
  return { mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska' }[sniff?.format] ?? ''
}

export class VideoFilm extends GenericFilm {
  constructor(video, options) { super(options); this.video = video; this.href = ''; this.ready = false }
  async load(file, { signal, url = globalThis.URL, timeoutMs = 30_000 } = {}) {
    this.release(url)
    if (signal?.aborted) throw new Error('cancelled')
    const video = this.video, href = url.createObjectURL(file)
    this.href = href
    try {
      await new Promise((resolve, reject) => {
        const clean = () => { clearTimeout(timer); video.removeEventListener('loadeddata', loaded); video.removeEventListener('error', failed); signal?.removeEventListener('abort', aborted) }
        const loaded = () => { clean(); resolve() }
        const failed = () => { clean(); reject(new Error('视频无法解码；请使用 H.264 / yuv420p MP4 或浏览器支持的 WebM。')) }
        const aborted = () => { clean(); reject(new Error('cancelled')) }
        const timer = setTimeout(() => { clean(); reject(new Error('视频加载超过 30 秒。')) }, timeoutMs)
        video.addEventListener('loadeddata', loaded); video.addEventListener('error', failed); signal?.addEventListener('abort', aborted, { once: true })
        video.src = href; video.load()
      })
      if (signal?.aborted || this.href !== href) throw new Error('cancelled')
      if (!(video.videoWidth > 0 && video.videoHeight > 0 && Number.isFinite(video.duration) && video.duration > 0)) throw new Error('文件没有可播放的视频画面。')
      this.ready = true
    } catch (failure) { if (this.href === href) this.release(url); throw failure }
  }
  release(url = globalThis.URL) {
    this.ready = false
    this.video.pause(); this.video.removeAttribute('src'); this.video.load?.()
    if (this.href) url.revokeObjectURL(this.href)
    this.href = ''
  }
  draw(g, t, { subtitles = false, offset = 0 } = {}) {
    const { width: w, height: h } = g.canvas
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
    const video = this.video
    if (!this.ready || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return
    const scale = Math.min(w / video.videoWidth, h / video.videoHeight)
    const dw = Math.round(video.videoWidth * scale), dh = Math.round(video.videoHeight * scale)
    const x = Math.round((w - dw) / 2), y = Math.round((h - dh) / 2)
    g.drawImage(video, x, y, dw, dh)
    if (subtitles) bitmapSubtitles(g, this.cue(t - offset), x, y, dw, dh)
  }
}

/** A separate soundtrack follows video time; embedded sound is muted when it is selected.
 * Audio offset means film time = audio time + offset, just as in existing packs.
 * No seek per frame: ordinary decode jitter under 180 ms is tolerated.
 */
export class VideoSoundtrack {
  constructor(video, audio, { onError = () => {} } = {}) {
    this.video = video; this.audio = audio; this.onError = onError
    this.offset = 0; this.sequence = 0; this.pending = null; this.failed = false; this.blocked = false; this.wantsPlay = false
  }
  get enabled() { return Boolean(this.audio.src || this.audio.currentSrc) }
  pause() { this.sequence++; this.wantsPlay = false; this.audio.pause() }
  reset() { this.pause(); this.failed = false; this.blocked = false }
  async update(t, playing) {
    const audio = this.audio, video = this.video
    if (!this.enabled) return
    const target = t - this.offset
    const out = target < 0 || (Number.isFinite(audio.duration) && target >= audio.duration)
    if (!playing || video.paused === true || video.seeking || video.readyState < 3 || out || this.failed) {
      if (!this.blocked) { this.pause(); this.blocked = true }
      if (!playing && !out && Number.isFinite(target) && Math.abs(audio.currentTime - target) > 0.18) audio.currentTime = target
      return
    }
    this.blocked = false
    this.wantsPlay = true
    if (Math.abs(audio.currentTime - target) > 0.18) audio.currentTime = target
    audio.playbackRate = video.playbackRate
    if (!audio.paused || this.pending?.sequence === this.sequence) return
    const sequence = this.sequence, source = audio.src || audio.currentSrc
    const pending = { sequence }; this.pending = pending
    try {
      await audio.play()
      if (!this.wantsPlay) audio.pause()
    } catch (failure) {
      if (sequence === this.sequence && (audio.src || audio.currentSrc) === source) {
        this.failed = true; this.wantsPlay = false; audio.pause(); video.pause(); this.onError(failure)
      }
    } finally { if (this.pending === pending) this.pending = null }
  }
}
