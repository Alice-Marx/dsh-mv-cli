/**
 * "用 AI 制作新 MV", panel side: decode the chosen audio locally, compute a
 * spectrum.json, have the Host create the pack folder (copy of the audio,
 * brief, lyrics, AGENT.md, initial mv.json), then start a Harness agent
 * session on that folder with the task prompt. When the Harness session API
 * is not reachable the prompt is shown for copy & paste instead.
 *
 * Nothing leaves the machine: the audio is copied into the pack folder on
 * the local Host only; the agent gets the folder path and text.
 */
import { unwrapRemote } from './remote-state.mjs'
import { bytesToBase64, decodeToChannels } from './mv-wav.mjs'
import { bandEdges, BANDS } from './mv/spectrum.mjs'
import { audioExtensionOf, sniffAudio } from '../shared/mv-audio-protocol.mjs'
import { AI_AUDIO_EXTENSIONS, agentPrompt, looksTimed } from '../shared/mv-ai-prompt.mjs'

export const SPECTRUM_FPS = 20
const FFT_SIZE = 2048

/** In-place radix-2 FFT (re, im of length n = power of two). */
export function fft(re, im) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = -2 * Math.PI / len, wr = Math.cos(angle), wi = Math.sin(angle)
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti
        const next = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = next
      }
    }
  }
}

/**
 * spectrum.json from decoded channels: { fps, bands: 48, frames }, each
 * frame 48 values 0..1 (log-spaced bands, per-band normalised to its 97th
 * percentile, two decimals). Same shape the canvas reads (spectrumFromJson).
 */
export async function computeSpectrum(channels, sampleRate, { fps = SPECTRUM_FPS, onProgress = () => {}, yieldEvery = 400 } = {}) {
  const left = channels[0], right = channels[1] ?? channels[0]
  const total = left.length
  const hop = sampleRate / fps
  const count = Math.max(1, Math.ceil(total / hop))
  const window = new Float32Array(FFT_SIZE)
  for (let i = 0; i < FFT_SIZE; i++) window[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FFT_SIZE - 1))
  const edges = bandEdges(FFT_SIZE / 2, sampleRate, BANDS)
  const raw = new Array(count)
  const re = new Float64Array(FFT_SIZE), im = new Float64Array(FFT_SIZE)
  for (let f = 0; f < count; f++) {
    const start = Math.round(f * hop) - FFT_SIZE / 2
    for (let i = 0; i < FFT_SIZE; i++) {
      const at = start + i
      re[i] = at >= 0 && at < total ? (left[at] + right[at]) * 0.5 * window[i] : 0
      im[i] = 0
    }
    fft(re, im)
    const bands = new Float32Array(BANDS)
    for (let b = 0; b < BANDS; b++) {
      let sum = 0, n = 0
      for (let i = edges[b]; i < Math.max(edges[b] + 1, edges[b + 1]); i++) { sum += Math.hypot(re[i], im[i]); n++ }
      bands[b] = Math.log10(1 + (n ? sum / n : 0) * 10)
    }
    raw[f] = bands
    if (f % yieldEvery === yieldEvery - 1) { onProgress(f / count); await new Promise(resolve => setTimeout(resolve, 0)) }
  }
  const frames = raw.map(() => new Array(BANDS))
  for (let b = 0; b < BANDS; b++) {
    const values = raw.map(frame => frame[b]).sort((x, y) => x - y)
    const peak = Math.max(1e-6, values[Math.min(values.length - 1, Math.floor(values.length * 0.97))])
    for (let f = 0; f < count; f++) frames[f][b] = Math.round(Math.min(1, raw[f][b] / peak) ** 1.4 * 100) / 100
  }
  onProgress(1)
  return { fps, bands: BANDS, frames }
}

/** Upload bytes into a pack folder the Host created (role audio | spectrum). */
export async function uploadPackFile(api, packDir, role, bytes, { onProgress = () => {} } = {}) {
  const begun = unwrapRemote(await api.packUploadBegin({ packDir, role, bytes: bytes.length }), `无法写入 ${role}。`)
  const chunk = Math.min(384 * 1024, begun.chunkBytes || 384 * 1024)
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    const part = bytes.subarray(offset, Math.min(bytes.length, offset + chunk))
    unwrapRemote(await api.packUploadWrite({ uploadId: begun.uploadId, offset, base64: bytesToBase64(part) }), `写入 ${role} 失败。`)
    onProgress(Math.min(1, (offset + part.length) / bytes.length))
  }
  return unwrapRemote(await api.packUploadFinish({ uploadId: begun.uploadId }), `无法完成 ${role}。`)
}

/** Check a chosen audio file by content: { sniff, ext, problem }. */
export function inspectAiAudio(headBytes) {
  const sniff = sniffAudio(headBytes)
  const ext = audioExtensionOf(sniff)
  if (sniff.format === 'unknown') return { sniff, ext, problem: '无法识别这个文件的格式（按内容判断，不看扩展名）。请选择音频或视频文件。' }
  if (!sniff.chromium || !AI_AUDIO_EXTENSIONS.includes(ext)) return { sniff, ext, problem: `${sniff.label} 不能在面板里播放。请先转换成 MP3 / M4A / FLAC / WAV / Opus 等格式（例如用 ffmpeg）。` }
  return { sniff, ext, problem: '' }
}

/**
 * Create the pack: decode + spectrum in the panel, then Host create and
 * uploads. Returns { created, prompt, duration, sniff }.
 */
export async function createAiPack(api, { file, title, artist = '', lyrics = '', style = '', parentDir = '' }, { onProgress = () => {}, decode = decodeToChannels, spectrum = computeSpectrum, toolsAvailable = true } = {}) {
  onProgress({ stage: 'read', ratio: 0 })
  const source = new Uint8Array(await file.arrayBuffer())
  const { sniff, ext, problem } = inspectAiAudio(source.subarray(0, 4096))
  if (problem) throw new Error(problem)
  onProgress({ stage: 'decode', ratio: 0 })
  const decoded = await decode(source.buffer.slice(0))
  onProgress({ stage: 'spectrum', ratio: 0 })
  const spec = await spectrum(decoded.channels, decoded.sampleRate, { onProgress: ratio => onProgress({ stage: 'spectrum', ratio }) })
  const created = unwrapRemote(await api.aiPackCreate({
    title: title.trim(), artist: artist.trim(), lyrics, style: style.trim(), audioExt: ext,
    ...(parentDir.trim() ? { parentDir: parentDir.trim() } : {}),
    ...(Number.isFinite(decoded.duration) && decoded.duration >= 1 ? { duration: Math.round(decoded.duration * 1000) / 1000 } : {}),
  }), '无法创建 MV 包文件夹。')
  await uploadPackFile(api, created.packDir, 'audio', source, { onProgress: ratio => onProgress({ stage: 'copy', ratio }) })
  await uploadPackFile(api, created.packDir, 'spectrum', new TextEncoder().encode(JSON.stringify(spec)), { onProgress: ratio => onProgress({ stage: 'spectrum-save', ratio }) })
  onProgress({ stage: 'done', ratio: 1 })
  return { created, duration: decoded.duration, sniff, lyricsTimed: looksTimed(lyrics), prompt: agentPrompt({ packDir: created.packDir, title: title.trim(), artist: artist.trim(), toolsAvailable }) }
}

export class SessionApiMissing extends Error {
  constructor(message) { super(message); this.name = 'SessionApiMissing' }
}

const callSafely = (fn, fallback = undefined) => { try { return fn() } catch { return fallback } }
const zone = () => callSafely(() => Intl.DateTimeFormat().resolvedOptions().timeZone, undefined)
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** What the Harness client offers right now (for the dialog). */
export function sessionSupport(harness) {
  const remote = callSafely(() => harness?.get?.('remote'))
  const sessionRemote = callSafely(() => remote?.session)
  const sessions = callSafely(() => harness?.get?.('sessions'))
  const workspaces = callSafely(() => harness?.get?.('workspaces'))
  const ui = callSafely(() => harness?.get?.('uiWorkspace'))
  const canCreate = typeof sessions?.create === 'function' || typeof sessionRemote?.create === 'function'
  const canPrompt = typeof sessionRemote?.prompt === 'function'
  return { available: canCreate && canPrompt, canCreate, canPrompt, canOpen: typeof ui?.openSession === 'function', canWorkspace: typeof workspaces?.create === 'function', sessionRemote, sessions, workspaces, ui }
}

/**
 * Start a new agent session on the pack folder and queue the prompt.
 * Returns { sessionId, workspaceId, opened }. Throws SessionApiMissing when
 * the Harness client does not offer the needed services.
 */
export async function startAgentSession(harness, { packDir, title, prompt }) {
  const support = sessionSupport(harness)
  if (!support.available) throw new SessionApiMissing('当前 Harness 没有提供可用的会话接口（session.create / session.prompt）。')
  let workspaceId
  if (support.canWorkspace) {
    try { workspaceId = (await support.workspaces.create({ path: packDir }))?.workspaceId }
    catch {
      const items = callSafely(() => support.workspaces.list.getSnapshot().items, [])
      workspaceId = items?.find(item => String(item.path).toLowerCase() === packDir.toLowerCase())?.workspaceId
    }
  }
  const target = workspaceId !== undefined ? { workspaceId } : { cwd: packDir }
  let sessionId
  if (typeof support.sessions?.create === 'function') sessionId = await support.sessions.create(target)
  else sessionId = unwrapRemote(await support.sessionRemote.create(target), '无法创建会话。')?.sessionId
  if (typeof sessionId !== 'string' || !sessionId) throw new Error('创建会话没有返回会话 ID。')
  if (typeof support.sessionRemote?.rename === 'function') {
    try { await support.sessionRemote.rename({ sessionId, title: `MV：${title}`.slice(0, 120) }) } catch { /* title is cosmetic */ }
  }
  const timeZone = zone()
  unwrapRemote(await support.sessionRemote.prompt({ requestId: uuid(), sessionId, mode: 'queue', content: [{ type: 'text', text: prompt }], ...(timeZone ? { clientTimeZone: timeZone } : {}) }), '无法把任务发送给会话。')
  let opened = false
  if (support.canOpen) { try { support.ui.openSession(sessionId); opened = true } catch { opened = false } }
  return { sessionId, workspaceId: workspaceId ?? null, opened }
}

/** Open the Harness UI on a new blank session (fallback path), when possible. */
export async function openBlankSession(harness, packDir) {
  const support = sessionSupport(harness)
  if (!support.canCreate) return false
  let target = { cwd: packDir }
  if (support.canWorkspace) { try { const id = (await support.workspaces.create({ path: packDir }))?.workspaceId; if (id !== undefined) target = { workspaceId: id } } catch { /* cwd */ } }
  const sessionId = typeof support.sessions?.create === 'function' ? await support.sessions.create(target) : unwrapRemote(await support.sessionRemote.create(target), '无法创建会话。')?.sessionId
  if (support.canOpen && sessionId) { support.ui.openSession(sessionId); return true }
  return false
}
