/**
 * 「自动制作」 pipeline in the panel: pack → LRCLIB → lyrics engine → align →
 * sections → save. Each step reports to `onStep(id, state, detail)`; the
 * `signal` (AbortSignal) stops between steps and cancels a running engine job.
 * All network use is the optional LRCLIB lookup through the Host (title,
 * artist, album, duration only); the audio never leaves the machine.
 */
import { unwrapRemote } from './remote-state.mjs'
import { createAiPack } from './mv-ai-state.mjs'
import { readAudioTags, guessFromFileName } from '../shared/mv-tags.mjs'
import { alignLines, fillGaps, linesFromText, linesFromWords, linesToLrc, mergeTimed, LOW_CONFIDENCE } from '../shared/mv-align.mjs'
import { detectSections, energyFromSpectrum } from '../shared/mv-sections.mjs'
import { autoTimingNote } from '../shared/mv-ai-prompt.mjs'
import { MV_PACK_MANIFEST } from '../shared/mv-pack.mjs'

export const AUTO_STEPS = Object.freeze([
  { id: 'pack', label: '建 MV 包（本机解码、频谱）' },
  { id: 'lrclib', label: '查 LRCLIB 歌词时间轴' },
  { id: 'engine', label: '本机识别人声时间（歌词引擎）' },
  { id: 'align', label: '对齐歌词、计算置信度' },
  { id: 'sections', label: '识别段落（主歌 / 副歌 / 间奏）' },
  { id: 'save', label: '保存 lyrics.lrc / timing.json / mv.json' },
])

export class AutoStopped extends Error { constructor() { super('已停止。'); this.name = 'AutoStopped' } }
const checkStop = signal => { if (signal?.aborted) throw new AutoStopped() }

/** Base64 → bytes (browser and Node). */
export function base64ToBytes(base64) {
  if (typeof atob === 'function') { const bin = atob(base64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out }
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

export async function readAnalysisFile(api, manifestPath, name) {
  const parts = []
  let offset = 0, size = 0
  for (;;) {
    const chunk = unwrapRemote(await api.analysisRead({ manifestPath, name, offset }), `无法读取 ${name}。`)
    if (!chunk.exists) return null
    size = chunk.size
    parts.push(base64ToBytes(chunk.base64))
    offset += chunk.bytes
    if (chunk.done || !chunk.bytes) break
  }
  const out = new Uint8Array(size)
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.length }
  return out
}

/** Poll an engine job until done; onEvent gets every event. */
export async function followJob(api, jobId, { signal, onEvent = () => {}, onProgress = () => {} } = {}) {
  let cursor = 0
  let cancelled = false
  for (;;) {
    if (signal?.aborted && !cancelled) { cancelled = true; try { await api.jobCancel({ jobId }) } catch { /* gone */ } }
    const read = unwrapRemote(await api.jobRead({ jobId, cursor, waitMs: 1200 }), '无法读取引擎任务状态。')
    cursor = read.cursor
    for (const event of read.events) onEvent(event)
    onProgress(read)
    if (read.done) {
      if (read.cancelled || cancelled) throw new AutoStopped()
      if (!read.ok) throw new Error(read.error || '歌词引擎任务失败。')
      return read
    }
  }
}

/** Title / artist / album guess from tags or the file name. */
export async function guessMetadata(file) {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 4 * 1048576)).arrayBuffer())
  let tags = {}
  try { tags = readAudioTags(head) ?? {} } catch { tags = {} }
  if (!tags.title && file.size > head.length) {
    // ID3v1 / Vorbis-at-end fallbacks
    try { const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 128)).arrayBuffer()); const t = readAudioTags(tail); if (t?.title) tags = { ...t, ...tags, title: t.title } } catch { /* none */ }
  }
  const guess = guessFromFileName(file.name)
  return { title: tags.title || guess.title || '', artist: tags.artist || guess.artist || '', album: tags.album || '', duration: tags.duration || null, fromTags: Boolean(tags.title) }
}

/**
 * Run the pipeline. options: { file, title, artist, album, lyrics, style,
 * parentDir, useLrclib, useEngine, model, language, separate, verifySynced }.
 */
export async function runAutoMake(api, options, { onStep = () => {}, onProgress = () => {}, onLog = () => {}, signal = null, deps = {} } = {}) {
  const make = deps.createAiPack ?? createAiPack
  const result = { steps: {}, lines: [], sections: [], source: 'none' }
  const step = async (id, fn) => {
    checkStop(signal)
    onStep(id, 'running')
    const started = Date.now()
    try {
      const detail = await fn()
      const seconds = Math.round((Date.now() - started) / 100) / 10
      result.steps[id] = { state: detail?.skipped ? 'skipped' : 'done', seconds, ...detail }
      onStep(id, result.steps[id].state, result.steps[id])
      return detail
    } catch (error) {
      result.steps[id] = { state: error instanceof AutoStopped ? 'stopped' : 'failed', message: String(error?.message ?? error) }
      onStep(id, result.steps[id].state, result.steps[id])
      throw error
    }
  }

  let made, spectrum
  const userLyrics = String(options.lyrics ?? '')
  const user = userLyrics.trim() ? linesFromText(userLyrics) : { timed: false, lines: [] }
  await step('pack', async () => {
    made = await make(api, { file: options.file, title: options.title, artist: options.artist ?? '', lyrics: userLyrics, style: options.style ?? '', parentDir: options.parentDir ?? '' }, { toolsAvailable: options.toolsAvailable !== false, onProgress: value => onProgress('pack', value) })
    spectrum = made.spectrum ?? null
    return { packDir: made.created.packDir, duration: made.duration }
  })
  result.made = made
  const duration = made.duration
  const manifestPath = made.created.manifestPath

  let synced = user.timed ? user.lines.map(line => ({ ...line, source: 'user', confidence: 0.8 })) : []
  let text = user.lines.map(({ text, alt }) => ({ text, alt }))
  await step('lrclib', async () => {
    if (synced.length) return { skipped: true, reason: '你提供的歌词已带时间轴' }
    if (!options.useLrclib) return { skipped: true, reason: '设置里已关闭 LRCLIB 查询' }
    const query = { title: options.title.trim(), ...(options.artist?.trim() ? { artist: options.artist.trim() } : {}), ...(options.album?.trim() ? { album: options.album.trim() } : {}), ...(duration ? { duration: Math.round(duration) } : {}) }
    let found
    try { found = unwrapRemote(await api.lyricsLookup(query), 'LRCLIB 查询失败。') }
    catch (error) { onLog(`LRCLIB：${error?.message ?? error}`); return { found: false, sent: query, failed: true, reason: `查询失败（${String(error?.message ?? error).slice(0, 120)}），继续下一步` } }
    if (!found.found) return { found: false, sent: found.sent ?? query, reason: '没有找到' }
    if (found.synced) {
      const parsed = linesFromText(found.synced)
      synced = parsed.lines.map(line => ({ ...line, source: 'lrclib', confidence: 0.75 }))
      if (!text.length) text = parsed.lines.map(({ text, alt }) => ({ text, alt }))
    } else if (found.plain && !text.length) text = linesFromText(found.plain).lines.map(({ text, alt }) => ({ text, alt }))
    return { found: true, sent: found.sent ?? query, synced: Boolean(found.synced), plain: Boolean(found.plain), track: `${found.trackName ?? ''} — ${found.artistName ?? ''}`, id: found.id, durationDiff: found.durationDiff }
  })

  let words = null
  let transcript = null
  await step('engine', async () => {
    const needed = !synced.length || options.verifySynced
    if (!needed) return { skipped: true, reason: '已有时间轴（LRCLIB）；需要时可在设置里打开“用引擎核对”' }
    if (!options.useEngine) return { skipped: true, reason: '歌词引擎未安装或未启用' }
    const prompt = text.map(line => line.text).join(' ').slice(0, 600)
    const started = unwrapRemote(await api.engineTranscribe({ manifestPath, model: options.model, language: options.language ?? 'auto', separate: options.separate !== false, ...(prompt ? { prompt } : {}) }), '无法启动歌词引擎。')
    const done = await followJob(api, started.jobId, { signal, onEvent: event => { if (event.type === 'log' && event.message) onLog(event.message) }, onProgress: read => onProgress('engine', { ratio: read.ratio, stage: read.events.at(-1)?.stage ?? '' }) })
    const bytes = await readAnalysisFile(api, manifestPath, 'transcript')
    if (!bytes) throw new Error('歌词引擎没有写出 transcript.json。')
    transcript = JSON.parse(new TextDecoder().decode(bytes))
    words = transcript.words ?? []
    return { words: words.length, device: transcript.device, model: transcript.model, language: transcript.language, separated: transcript.separated, timings: transcript.timings, seconds: done.seconds }
  })
  result.transcript = transcript

  await step('align', async () => {
    let lines
    if (words?.length && text.length) {
      const aligned = alignLines(text, words, { duration })
      lines = synced.length ? mergeTimed(synced, aligned).lines : aligned
      result.source = synced.length ? `${synced[0].source}+engine` : 'engine'
    } else if (synced.length) { lines = synced; result.source = synced[0].source }
    else if (words?.length) { lines = linesFromWords(words); result.source = 'engine-words' }
    else if (text.length) { lines = fillGaps(text.map(line => ({ ...line, start: NaN, end: NaN, confidence: 0, source: 'estimate' })), { duration }); result.source = 'estimate' }
    else lines = []
    result.lines = lines
    const low = lines.filter(line => (line.confidence ?? 1) < LOW_CONFIDENCE).length
    return { lines: lines.length, low, source: result.source }
  })

  await step('sections', async () => {
    result.sections = detectSections(result.lines, { duration, energyAt: spectrum ? energyFromSpectrum(spectrum) : null })
    return { sections: result.sections.length, kinds: [...new Set(result.sections.map(s => s.kind))] }
  })

  await step('save', async () => {
    const saved = await saveCalibration(api, manifestPath, { lines: result.lines, sections: result.sections, title: options.title, artist: options.artist, source: result.source, duration })
    return saved
  })
  result.prompt = `${made.prompt}\n\n${autoTimingNote({ lines: result.lines.length, low: result.steps.align?.low ?? 0, source: result.source, sections: result.sections })}`
  return result
}

/** Timing JSON written next to lyrics.lrc (per-line confidence for the editor and the agent). */
export function timingDocument({ lines, source, duration, offset = 0 }) {
  return { format: 'dsh-mv-timing', version: 1, source, duration, offset, lines: lines.map(line => ({ start: line.start, end: line.end, text: line.text, alt: line.alt ?? '', confidence: Math.round((line.confidence ?? 1) * 100) / 100, source: line.source ?? source })) }
}

/** Save LRC + timing.json + sections.json and point mv.json at them (each write keeps a backup). */
export async function saveCalibration(api, manifestPath, { lines, sections = null, title = '', artist = '', source = 'user', duration = 0, offset = 0 }) {
  const writes = []
  const write = async (file, text) => { writes.push(unwrapRemote(await api.packWriteText({ manifestPath, file, text }), `无法保存 ${file}。`)) }
  if (lines.length) {
    await write('lyrics.lrc', linesToLrc(lines, { title, artist }))
    await write('timing.json', JSON.stringify(timingDocument({ lines, source, duration, offset }), null, 2))
  }
  if (sections) await write('sections.json', JSON.stringify({ format: 'dsh-mv-sections', version: 1, sections }, null, 2))
  const rawBytes = await readAnalysisFile(api, manifestPath, 'manifest')
  if (!rawBytes) throw new Error('无法读取 mv.json。')
  const manifest = JSON.parse(new TextDecoder().decode(rawBytes).replace(/^\uFEFF/, ''))
  if (lines.length) manifest.lyrics = { file: 'lyrics.lrc', offset: 0 }
  const ai = { ...(manifest['x-dsh-mv-ai'] ?? {}) }
  ai.timing = { file: 'timing.json', source, lines: lines.length, low: lines.filter(line => (line.confidence ?? 1) < LOW_CONFIDENCE).length, savedAt: new Date().toISOString() }
  if (sections) { ai.sections = sections.map(({ kind, start, end, label }) => ({ kind, start, end, ...(label ? { label } : {}) })); ai.sectionsFile = 'sections.json' }
  manifest['x-dsh-mv-ai'] = ai
  await write(MV_PACK_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  return { files: writes.map(w => w.path), backups: writes.filter(w => w.backup).length }
}
