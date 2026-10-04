/**
 * Film for `canvas.renderer: "script"` packs: the pack's scene script runs in
 * a Web Worker (created from a Blob; network, storage and nested workers are
 * removed from its global scope before the script runs). Each animation frame
 * posts { t, cols, rows, ctx } and paints the newest answer; a script that
 * throws, stalls (no answer within SCENE_LIMITS.hardTimeoutMs) or is too slow
 * for too many frames is terminated and the panel falls back to the generic
 * renderer.
 */
import { Grid, cw, DIM, NORMAL } from './grid.mjs'
import { GenericFilm } from './generic-film.mjs'
import { SCENE_LIMITS, sceneContext, sceneSourceProblems, sceneWorkerSource } from '../../shared/mv-scene.mjs'

/** Default worker factory (Blob URL). Returns null when workers are unavailable. */
export function blobWorkerFactory(source, { WorkerClass = globalThis.Worker, BlobClass = globalThis.Blob, url = globalThis.URL } = {}) {
  if (typeof WorkerClass !== 'function' || typeof BlobClass !== 'function' || typeof url?.createObjectURL !== 'function') return null
  const href = url.createObjectURL(new BlobClass([source], { type: 'text/javascript' }))
  try { return new WorkerClass(href, { name: 'dsh-mv-scene' }) } finally { setTimeout(() => url.revokeObjectURL(href), 10_000) }
}

export class ScriptFilm extends GenericFilm {
  constructor({ createWorker = blobWorkerFactory, now = () => (globalThis.performance?.now?.() ?? Date.now()), onFail = () => {}, ...options } = {}) {
    super(options)
    this.createWorker = createWorker
    this.now = now
    this.onFail = onFail
    this.worker = null
    this.state = 'idle' // idle | loading | ready | failed
    this.frame = null
    this.pending = null
    this.slow = 0
    this.nextId = 1
    this.error = ''
  }

  /** Song structure for ctx.section / ctx.beat (from mv.json). */
  setStructure({ sections = [], bpm = 0, beatOffset = 0 } = {}) { this.sections = sections; this.bpm = bpm; this.beatOffset = beatOffset }

  /** Start the script; resolves when it is ready, rejects with the reason. */
  load(source) {
    this.stop()
    const problems = sceneSourceProblems(source)
    if (problems.length) return Promise.reject(this.fail(problems.join(' ')))
    let worker
    try { worker = this.createWorker(sceneWorkerSource(source)) } catch (error) { return Promise.reject(this.fail(`无法创建场景沙箱（Web Worker）：${error?.message ?? error}`)) }
    if (!worker) return Promise.reject(this.fail('这个环境不支持 Web Worker，无法运行场景脚本。'))
    this.worker = worker
    this.state = 'loading'
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(this.fail('场景脚本加载超时。')), SCENE_LIMITS.setupTimeoutMs)
      worker.onerror = event => { clearTimeout(timer); event?.preventDefault?.(); reject(this.fail(`场景脚本出错：${event?.message ?? '未知错误'}`)) }
      worker.onmessage = event => {
        const msg = event.data ?? {}
        if (msg.type === 'ready') {
          clearTimeout(timer)
          if (msg.error) { reject(this.fail(`场景脚本无法加载：${String(msg.error).split('\n')[0]}`)); return }
          this.state = 'ready'
          resolve()
          return
        }
        this.receive(msg)
      }
      worker.postMessage({ type: 'init', info: { title: this.title, artist: this.artist, duration: this.duration, sections: this.sections ?? [], bpm: this.bpm ?? 0 } })
    })
  }

  receive(msg) {
    if (!this.pending || msg.id !== this.pending.id) return
    this.pending = null
    if (msg.type === 'error') { this.fail(`render() 出错：${String(msg.error).split('\n')[0]}`); return }
    if (msg.type !== 'frame' || !msg.frame || !Array.isArray(msg.frame.lines)) return
    this.frame = msg.frame
    if (msg.ms > SCENE_LIMITS.frameBudgetMs) { if (++this.slow > SCENE_LIMITS.slowFramesAllowed) this.fail(`场景脚本太慢（一帧 ${Math.round(msg.ms)} ms，预算 ${SCENE_LIMITS.frameBudgetMs} ms）。`) }
    else this.slow = Math.max(0, this.slow - 1)
  }

  fail(reason) {
    if (this.state === 'failed') return new Error(this.error)
    this.state = 'failed'
    this.error = reason
    this.stop({ keepState: true })
    this.onFail(reason)
    return new Error(reason)
  }

  stop({ keepState = false } = {}) {
    try { this.worker?.terminate() } catch { /* gone */ }
    this.worker = null
    this.pending = null
    this.frame = null
    this.slow = 0
    if (!keepState) { this.state = 'idle'; this.error = '' }
  }

  request(t, w, h, opts) {
    if (this.state !== 'ready' || !this.worker) return
    const now = this.now()
    if (this.pending) {
      if (now - this.pending.at > SCENE_LIMITS.hardTimeoutMs) this.fail(`场景脚本 ${SCENE_LIMITS.hardTimeoutMs} ms 没有返回（可能是死循环），已停止。`)
      return
    }
    const at = t + (opts.offset ?? 0)
    const ctx = sceneContext({ t, duration: this.duration, title: this.title, artist: this.artist, cue: this.cue(at), next: this.nextCue(at), bands: this.energy(t), ready: Boolean(opts.ready), paused: Boolean(opts.paused), sections: this.sections ?? [], bpm: this.bpm ?? 0, beatOffset: this.beatOffset ?? 0 })
    const id = this.nextId++
    this.pending = { id, at: now }
    this.worker.postMessage({ type: 'frame', id, t, cols: w, rows: h, ctx })
  }

  /** Same interface as Film / GenericFilm: a Canvas for time t. */
  render(t, w, h, opts = {}) {
    this.request(t, w, h, opts)
    const c = new Grid(w, h)
    const frame = this.frame
    if (frame) {
      for (let y = 0; y < Math.min(h, frame.lines.length); y++) {
        const style = frame.styles?.[y] ?? ''
        let x = 0, i = 0
        for (const ch of frame.lines[y]) {
          const k = cw(ch)
          if (x >= w) break
          if (k > 0 && ch !== ' ') c.put(x, y, ch, style ? Number(style[i] ?? style[style.length - 1] ?? NORMAL) : NORMAL)
          x += k; i += 1
        }
      }
    } else if (this.state === 'loading' || this.state === 'ready') c.center(Math.floor(h / 2), '…', DIM)
    if (opts.help) this.help(c, opts.offset ?? 0, opts.helpLines)
    return c
  }
}
