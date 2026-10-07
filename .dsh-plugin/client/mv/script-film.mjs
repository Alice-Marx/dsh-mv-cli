/**
 * Film for `canvas.renderer: "script"` packs: the pack's scene script runs in
 * a Web Worker (created from a Blob; network, storage and nested workers are
 * removed from its global scope before the script runs). Each animation frame
 * posts { t, cols, rows, ctx } and paints the newest answer; a script that
 * throws, stalls (no answer within SCENE_LIMITS.hardTimeoutMs) or is too slow
 * for too many frames is terminated and the panel falls back to the generic
 * renderer.
 *
 * Two stages run before the first frame is accepted: `prepare()` cooperatively
 * yields progress, and the optional synchronous `warmup()` pays one-off GPU
 * first-use cost on the final output surface. Both have their own deadlines.
 *
 * The stall watchdog is graded. Inside SCENE_LIMITS.firstFrameGraceMs after
 * `ready`, a pending frame may take SCENE_LIMITS.firstFrameTimeoutMs (GPU
 * drivers legitimately compile and allocate on first use) and frames slower
 * than the frame budget are not charged to the steady-state slow-frame quota.
 * After that window the unchanged hardTimeoutMs and slowFramesAllowed apply, so
 * a scene that stalls or crawls during steady state is still stopped.
 *
 * Bitmap outputs ("pixels" and "webgl"): the script paints an
 * OffscreenCanvas of canvas.size in the worker; frames come back as
 * ImageBitmaps and draw() letterboxes them onto the panel's visible 2D canvas.
 */
import { Grid, cw, DIM, NORMAL } from './grid.mjs'
import { GenericFilm } from './generic-film.mjs'
import { PIXEL_SCENE_LIMITS, SCENE_LIMITS, sceneContext, sceneSourceProblems, sceneWorkerSource } from '../../shared/mv-scene.mjs'

/** Both 2D pixel scenes and WebGL scenes cross the worker boundary as ImageBitmaps. */
export const isBitmapSceneOutput = output => output === 'pixels' || output === 'webgl'

const closeBitmap = bitmap => { try { bitmap?.close?.() } catch { /* already closed */ } }
const invalidWorkerMessage = detail => `场景脚本返回了无效消息：${detail}`

/** Opt-in panel subtitles: independent from a worker's own scene/text drawing. */
function bitmapSubtitles(g, cue, x, y, w, h) {
  if (!cue || !(cue.en || cue.zh)) return
  const lines = [cue.en, cue.zh].filter(Boolean).map(text => String(text).slice(0, 512))
  const fontSize = Math.max(12, Math.min(40, Math.round(h / 22)))
  const lineHeight = fontSize * 1.35, pad = Math.max(5, h * 0.025)
  const top = y + h - pad - lines.length * lineHeight
  const maxWidth = w * 0.9
  g.save()
  try {
    g.beginPath(); g.rect(x, y, w, h); g.clip()
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'
    g.shadowBlur = 0; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillStyle = 'rgba(0,0,0,0.65)'
    g.fillRect(x + w * 0.025, top - pad * 0.5, w * 0.95, lines.length * lineHeight + pad)
    lines.forEach((text, i) => {
      let size = fontSize
      const setFont = () => { g.font = `600 ${size}px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif` }
      setFont()
      const measured = g.measureText(text).width
      if (measured > maxWidth) { size = Math.max(10, fontSize * maxWidth / measured); setFont() }
      if (g.measureText(text).width > maxWidth) {
        let lo = 0, hi = text.length
        while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (g.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid; else hi = mid - 1 }
        text = text.slice(0, lo) + '…'
      }
      g.lineWidth = Math.max(2, size / 8); g.strokeStyle = '#000'
      g.strokeText(text, x + w / 2, top + (i + 0.5) * lineHeight, maxWidth)
      g.fillStyle = i === 0 ? '#fff' : '#c4deff'
      g.fillText(text, x + w / 2, top + (i + 0.5) * lineHeight, maxWidth)
    })
  } finally { g.restore() }
}

/** Default worker factory (Blob URL). Returns null when workers are unavailable. */
export function blobWorkerFactory(source, { WorkerClass = globalThis.Worker, BlobClass = globalThis.Blob, url = globalThis.URL } = {}) {
  if (typeof WorkerClass !== 'function' || typeof BlobClass !== 'function' || typeof url?.createObjectURL !== 'function') return null
  const href = url.createObjectURL(new BlobClass([source], { type: 'text/javascript' }))
  try { return new WorkerClass(href, { name: 'dsh-mv-scene' }) } finally { setTimeout(() => url.revokeObjectURL(href), 10_000) }
}

export class ScriptFilm extends GenericFilm {
  constructor({ createWorker = blobWorkerFactory, now = () => (globalThis.performance?.now?.() ?? Date.now()), onFail = () => {}, onPrepare = () => {}, ...options } = {}) {
    super(options)
    this.createWorker = createWorker
    this.now = now
    this.onFail = onFail
    this.onPrepare = onPrepare
    this.worker = null
    this.state = 'idle' // idle | loading | preparing | warming | ready | failed
    this.frame = null
    this.pending = null
    this.slow = 0
    this.graceFrames = 0
    this.graceSlow = 0
    this.readyAt = 0
    this.nextId = 1
    this.error = ''
    this.output = 'text'
    this.size = [1280, 720]
    this.bitmap = null
    this.setupTimer = null
    this.prepareTimer = null
    this.prepareTotalTimer = null
    this.warmupTimer = null
    this.warmupId = null
    this.preparePending = null
    this.prepareProgress = 0
    this.prepared = false
    this.loadReject = null
  }

  /** Song structure for ctx.section / ctx.beat (from mv.json). */
  setStructure({ sections = [], bpm = 0, beatOffset = 0 } = {}) { this.sections = sections; this.bpm = bpm; this.beatOffset = beatOffset }

  /**
   * True while the one-off first-use window after `ready` is still open, where a
   * slow frame is expected GPU work rather than a stalled scene. A clock that
   * reads before `ready` (never in practice, but the clock is injectable) does
   * not reopen the window.
   */
  inFirstFrameGrace(now = this.now()) { const elapsed = now - this.readyAt; return this.state === 'ready' && elapsed >= 0 && elapsed < SCENE_LIMITS.firstFrameGraceMs }

  /** Milliseconds of first-use allowance already spent, negative before `ready`. */
  firstUseElapsed() { return this.now() - this.readyAt }

  /** Start the script; resolves when it is ready, rejects with the reason. */
  load(source, { output = 'text', size = [1280, 720], assets = {}, transfer = [] } = {}) {
    this.stop()
    const rejected = reason => { if (Array.isArray(transfer)) transfer.forEach(closeBitmap); return Promise.reject(this.fail(reason)) }
    this.output = isBitmapSceneOutput(output) ? output : 'text'
    this.size = Array.isArray(size) ? [Number(size[0]), Number(size[1])] : [0, 0]
    if (isBitmapSceneOutput(this.output) && (!Number.isInteger(this.size[0]) || !Number.isInteger(this.size[1]) || this.size[0] <= 0 || this.size[1] <= 0 || this.size[0] > PIXEL_SCENE_LIMITS.maxWidth || this.size[1] > PIXEL_SCENE_LIMITS.maxHeight)) {
      return rejected('位图场景的 canvas.size 必须是两个正整数，且不超过 1920×1080。')
    }
    const problems = sceneSourceProblems(source, { output: this.output })
    if (problems.length) return rejected(problems.join(' '))
    let worker
    try { worker = this.createWorker(sceneWorkerSource(source, { output: this.output })) } catch (error) { return rejected(`无法创建场景沙箱（Web Worker）：${error?.message ?? error}`) }
    if (!worker) return rejected('这个环境不支持 Web Worker，无法运行场景脚本。')
    this.worker = worker
    this.state = 'loading'
    return new Promise((resolve, reject) => {
      this.loadReject = reject
      const clearSetupTimer = () => {
        clearTimeout(this.setupTimer)
        this.setupTimer = null
      }
      const clearPrepareTimers = ({ keepProgress = false } = {}) => {
        clearTimeout(this.prepareTimer); clearTimeout(this.prepareTotalTimer)
        this.prepareTimer = null; this.prepareTotalTimer = null; this.preparePending = null
        if (!keepProgress) this.prepareProgress = 0
      }
      const reportPreparation = status => { try { this.onPrepare(status) } catch { /* UI callbacks cannot stall the preparation protocol. */ } }
      const sendPreparationStep = id => {
        if (id > SCENE_LIMITS.prepareMaxSteps) { reject(this.fail(`场景准备超过 ${SCENE_LIMITS.prepareMaxSteps} 个步骤。`)); return }
        this.preparePending = id
        this.prepareTimer = setTimeout(() => reject(this.fail(`场景准备单步骤超过 ${SCENE_LIMITS.prepareStepTimeoutMs} ms，已停止。`)), SCENE_LIMITS.prepareStepTimeoutMs)
        try { worker.postMessage({ type: 'prepare-next', id }) }
        catch (error) { reject(this.fail(`无法准备场景脚本：${error?.message ?? error}`)) }
      }
      this.setupTimer = setTimeout(() => reject(this.fail('场景脚本加载超时。')), SCENE_LIMITS.setupTimeoutMs)
      worker.onerror = event => {
        if (this.worker !== worker) return
        clearSetupTimer()
        event?.preventDefault?.()
        reject(this.fail(`场景脚本出错：${event?.message ?? '未知错误'}`))
      }
      worker.onmessage = event => {
        const msg = event?.data
        if (this.worker !== worker) { closeBitmap(msg?.bitmap); return }
        if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
          closeBitmap(msg?.bitmap)
          clearSetupTimer()
          reject(this.fail(invalidWorkerMessage('消息必须是对象。')))
          return
        }
        if (msg.type === 'fatal') {
          closeBitmap(msg.bitmap)
          clearSetupTimer()
          const error = this.fail(typeof msg.error === 'string' && msg.error ? msg.error.split('\n')[0] : invalidWorkerMessage('fatal 响应缺少 error 字符串。'))
          reject(error)
          return
        }
        if (this.state === 'loading' || this.state === 'preparing' || this.state === 'warming') {
          // 0.9.7: warmup() announces itself so it gets its own deadline instead of
          // being charged to the last prepare step's timeout.
          if (msg.type === 'warming') {
            const expected = this.state === 'loading' ? 0 : this.preparePending
            if (msg.bitmap !== undefined || this.state === 'warming' || !Number.isSafeInteger(msg.id) || msg.id !== expected) {
              closeBitmap(msg.bitmap); reject(this.fail(invalidWorkerMessage('准备完成后的预热通知不正确。'))); return
            }
            this.warmupId = msg.id
            clearSetupTimer()
            clearPrepareTimers({ keepProgress: true })
            this.state = 'warming'
            this.warmupTimer = setTimeout(() => reject(this.fail(`场景预热超过 ${SCENE_LIMITS.warmupTimeoutMs} ms，已停止。请让 warmup() 更快，或用 prepare() 分步预热。`)), SCENE_LIMITS.warmupTimeoutMs)
            return
          }
          if (msg.type === 'preparing') {
            const expected = this.state === 'loading' ? 0 : this.preparePending
            const valid = Number.isSafeInteger(msg.id) && msg.id === expected && msg.id <= SCENE_LIMITS.prepareMaxSteps && msg.bitmap === undefined && Number.isFinite(msg.progress) && msg.progress >= this.prepareProgress && msg.progress <= 1 && typeof msg.label === 'string' && msg.label.length <= 160 && (this.state !== 'loading' || msg.progress === 0)
            if (!valid) {
              closeBitmap(msg.bitmap); reject(this.fail(invalidWorkerMessage('准备进度或步骤编号不正确。'))); return
            }
            clearSetupTimer()
            clearTimeout(this.prepareTimer); this.prepareTimer = null
            if (this.state === 'loading') {
              this.state = 'preparing'
              this.prepared = true
              // This independent deadline is never renewed by progress messages.
              this.prepareTotalTimer = setTimeout(() => reject(this.fail(`场景准备总计超过 ${SCENE_LIMITS.prepareTotalTimeoutMs} ms，已停止。`)), SCENE_LIMITS.prepareTotalTimeoutMs)
            }
            this.prepareProgress = msg.progress
            reportPreparation({ step: msg.id, progress: msg.progress, label: msg.label, done: false })
            if (this.worker !== worker || this.state !== 'preparing') return
            sendPreparationStep(msg.id + 1)
            return
          }
          if (msg.type !== 'ready' || typeof msg.error !== 'string' || msg.bitmap !== undefined
            || (this.state === 'preparing' && (!Number.isSafeInteger(msg.id) || msg.id !== this.preparePending))
            || (this.state === 'warming' && msg.id !== this.warmupId)
            || (this.prepared && !Number.isSafeInteger(msg.id))) {
            closeBitmap(msg.bitmap)
            clearSetupTimer()
            reject(this.fail(invalidWorkerMessage('初始化响应格式不正确。')))
            return
          }
          clearSetupTimer()
          // A warmup stage may sit between the last prepare step and ready, so this
          // remembers that preparation ran rather than reading the current state.
          const prepared = this.prepared
          clearPrepareTimers({ keepProgress: prepared })
          clearTimeout(this.warmupTimer); this.warmupTimer = null
          if (msg.error) { reject(this.fail(`场景脚本无法加载：${msg.error.split('\n')[0]}`)); return }
          this.state = 'ready'
          this.readyAt = this.now()
          this.loadReject = null
          if (prepared) { this.prepareProgress = 1; reportPreparation({ step: msg.id, progress: 1, label: '', done: true }) }
          resolve()
          return
        }
        this.receive(msg)
      }
      const info = { title: this.title, artist: this.artist, duration: this.duration, sections: this.sections ?? [], bpm: this.bpm ?? 0, assets, ...(isBitmapSceneOutput(this.output) ? { width: this.size[0], height: this.size[1] } : {}) }
      try { worker.postMessage({ type: 'init', info }, Array.isArray(transfer) ? transfer : []) }
      catch (error) { clearSetupTimer(); reject(this.fail(`无法初始化场景脚本：${error?.message ?? error}`)) }
    }).catch(error => { if (Array.isArray(transfer)) transfer.forEach(closeBitmap); throw error })
  }

  receive(msg) {
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) { closeBitmap(msg?.bitmap); this.fail(invalidWorkerMessage('帧响应必须是对象。')); return }
    if (!this.pending || !Number.isSafeInteger(msg.id) || msg.id !== this.pending.id) {
      closeBitmap(msg.bitmap)
      this.fail(invalidWorkerMessage('帧编号与当前请求不匹配。'))
      return
    }
    const pending = this.pending
    this.pending = null
    if (msg.type === 'error') {
      closeBitmap(msg.bitmap)
      if (typeof msg.error !== 'string' || !msg.error) { this.fail(invalidWorkerMessage('错误响应缺少 error 字符串。')); return }
      this.fail(`render() 出错：${msg.error.split('\n')[0]}`)
      return
    }
    if (msg.type !== 'frame') { closeBitmap(msg.bitmap); this.fail(invalidWorkerMessage(`未知响应类型 ${String(msg.type)}。`)); return }
    if (!Number.isFinite(msg.ms) || msg.ms < 0) { closeBitmap(msg.bitmap); this.fail(invalidWorkerMessage('帧耗时必须是非负有限数。')); return }
    if (this.now() - pending.at > pending.timeoutMs || msg.ms > pending.timeoutMs) {
      closeBitmap(msg.bitmap)
      this.fail(this.frameTimeoutReason(pending))
      return
    }
    if (isBitmapSceneOutput(this.output)) {
      const bitmap = msg.bitmap
      if (!bitmap || typeof bitmap !== 'object' || typeof bitmap.close !== 'function' || (typeof globalThis.ImageBitmap === 'function' && !(bitmap instanceof globalThis.ImageBitmap)) || !Number.isInteger(bitmap.width) || !Number.isInteger(bitmap.height) || bitmap.width !== this.size[0] || bitmap.height !== this.size[1]) {
        closeBitmap(bitmap)
        this.fail(invalidWorkerMessage(`ImageBitmap 尺寸必须是 ${this.size[0]}×${this.size[1]}。`))
        return
      }
      closeBitmap(this.bitmap)
      this.bitmap = msg.bitmap
    } else {
      if (msg.bitmap !== undefined) { closeBitmap(msg.bitmap); this.fail(invalidWorkerMessage('文本场景不能返回 ImageBitmap。')); return }
      const { frame } = msg
      const validLines = frame && typeof frame === 'object' && !Array.isArray(frame) && Array.isArray(frame.lines) && frame.lines.length <= pending.rows && frame.lines.every(line => typeof line === 'string' && line.length <= pending.cols * 4)
      const validStyles = frame?.styles === undefined || (Array.isArray(frame.styles) && frame.styles.length <= pending.rows && frame.styles.every(style => typeof style === 'string' && style.length <= pending.cols * 2 && /^[0-6]*$/.test(style)))
      if (!validLines || !validStyles) { closeBitmap(msg.bitmap); this.fail(invalidWorkerMessage('文本帧格式或尺寸不正确。')); return }
      this.frame = msg.frame
    }
    const budget = isBitmapSceneOutput(this.output) ? PIXEL_SCENE_LIMITS.frameBudgetMs : SCENE_LIMITS.frameBudgetMs
    // 0.9.7: inside the first-use window a slow frame is expected GPU work, not a
    // crawling scene. Count it separately so it can neither mask nor be masked by
    // steady state; the quota below is only ever charged after `ready` settles.
    if (pending.firstUseGrace) {
      this.graceFrames++
      if (msg.ms > budget) this.graceSlow++
      return
    }
    if (msg.ms > budget) { if (++this.slow > SCENE_LIMITS.slowFramesAllowed) this.fail(`场景脚本太慢（一帧 ${Math.round(msg.ms)} ms，预算 ${budget} ms）。`) }
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
    clearTimeout(this.setupTimer)
    this.setupTimer = null
    clearTimeout(this.prepareTimer); clearTimeout(this.prepareTotalTimer); clearTimeout(this.warmupTimer)
    this.prepareTimer = null; this.prepareTotalTimer = null; this.preparePending = null; this.prepareProgress = 0
    this.warmupTimer = null
    this.warmupId = null
    this.prepared = false
    const reject = this.loadReject
    this.loadReject = null
    reject?.(new Error(keepState ? this.error : '场景脚本加载已取消。'))
    if (this.worker) { this.worker.onmessage = null; this.worker.onerror = null }
    try { this.worker?.terminate() } catch { /* gone */ }
    this.worker = null
    this.pending = null
    this.frame = null
    closeBitmap(this.bitmap)
    this.bitmap = null
    this.slow = 0
    this.graceFrames = 0
    this.graceSlow = 0
    if (!keepState) { this.state = 'idle'; this.error = '' }
  }

  request(t, w, h, opts) {
    if (this.state !== 'ready' || !this.worker) return
    const now = this.now()
    if (this.pending) {
      // 0.9.7: graded watchdog. A GPU legitimately compiles shaders and allocates
      // render targets on first use, so the first-use window gets its own, much
      // wider limit; steady state keeps the unchanged hardTimeoutMs.
      if (now - this.pending.at > this.pending.timeoutMs) this.fail(this.frameTimeoutReason(this.pending))
      return
    }
    const at = t + (opts.offset ?? 0)
    const ctx = sceneContext({ t, duration: this.duration, title: this.title, artist: this.artist, cue: this.cue(at), next: this.nextCue(at), bands: this.energy(t), ready: Boolean(opts.ready), paused: Boolean(opts.paused), sections: this.sections ?? [], bpm: this.bpm ?? 0, beatOffset: this.beatOffset ?? 0 })
    const id = this.nextId++
    const firstUseGrace = this.inFirstFrameGrace(now)
    this.pending = { id, at: now, cols: w, rows: h, firstUseGrace, timeoutMs: firstUseGrace ? SCENE_LIMITS.firstFrameTimeoutMs : SCENE_LIMITS.hardTimeoutMs }
    try { this.worker.postMessage({ type: 'frame', id, t, cols: w, rows: h, ctx }) }
    catch (error) { this.fail(`无法向场景脚本请求帧：${error?.message ?? error}`) }
  }

  frameTimeoutReason(pending) {
    return pending.firstUseGrace
      ? `场景脚本首帧 ${pending.timeoutMs} ms 没有返回，已停止。请在场景里加 warmup(info, gl) 预热，或让 setup()/prepare() 分步完成初始化。`
      : `场景脚本 ${pending.timeoutMs} ms 没有返回（可能是死循环），已停止。`
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
    } else if (this.state === 'loading' || this.state === 'preparing' || this.state === 'warming' || this.state === 'ready') c.center(Math.floor(h / 2), this.waitingLabel, DIM)
    if (opts.help) this.help(c, opts.offset ?? 0, opts.helpLines)
    return c
  }

  /** Placeholder shown while the scene is still loading / preparing / warming up. */
  get waitingLabel() {
    if (this.state === 'preparing') return `准备 ${Math.round(this.prepareProgress * 100)}%`
    if (this.state === 'warming') return '预热…'
    return '…'
  }

  /** Bitmap scenes: paint the newest frame letterboxed onto the panel's visible 2D canvas. */
  draw(g, t, opts = {}) {
    const [w, h] = this.size
    this.request(t, w, h, opts)
    const cw = g.canvas.width, ch = g.canvas.height
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.fillStyle = '#000'
    g.fillRect(0, 0, cw, ch)
    const scale = Math.min(cw / w, ch / h)
    const dw = Math.round(w * scale), dh = Math.round(h * scale)
    if (this.bitmap) {
      g.imageSmoothingEnabled = true
      g.imageSmoothingQuality = 'high'
      g.drawImage(this.bitmap, Math.round((cw - dw) / 2), Math.round((ch - dh) / 2), dw, dh)
      if (opts.subtitles === true) bitmapSubtitles(g, this.cue(t - (opts.offset ?? 0)), Math.round((cw - dw) / 2), Math.round((ch - dh) / 2), dw, dh)
    } else if (this.state === 'loading' || this.state === 'preparing' || this.state === 'warming' || this.state === 'ready') {
      g.fillStyle = '#556'
      g.font = `${Math.max(12, Math.round(ch / 30))}px monospace`
      g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillText(this.waitingLabel, cw / 2, ch / 2)
    }
  }
}
