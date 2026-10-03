/**
 * Turn an audio file the MCI-based player cannot open (MP4/AAC renamed to
 * .mp3, Opus, FLAC, video files, …) into a 16-bit PCM WAV, decoded by the
 * panel's own Chromium, and upload it into the plugin's cache folder on the
 * Host (keyed by the source's sha256, so each file is converted once). The
 * user's file and folders are only read. Formats Chromium cannot decode can
 * be converted with the user's own ffmpeg after a confirmation.
 */
import { unwrapRemote } from './remote-state.mjs'
import { effectiveAudioOf } from './mv-terminal-state.mjs'

export const WAV_RATE = 44100
export const WAV_CHUNK = 384 * 1024

/** 16-bit PCM WAV bytes from channel data (Float32Array per channel). */
export function encodeWav(channels, sampleRate) {
  const count = Math.min(2, channels.length)
  const frames = channels[0]?.length ?? 0
  const dataBytes = frames * count * 2
  const out = new Uint8Array(44 + dataBytes)
  const view = new DataView(out.buffer)
  const ascii = (offset, text) => { for (let i = 0; i < text.length; i += 1) out[offset + i] = text.charCodeAt(i) }
  ascii(0, 'RIFF'); view.setUint32(4, 36 + dataBytes, true); ascii(8, 'WAVE')
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, count, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * count * 2, true); view.setUint16(32, count * 2, true); view.setUint16(34, 16, true)
  ascii(36, 'data'); view.setUint32(40, dataBytes, true)
  let offset = 44
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < count; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame] || 0))
      view.setInt16(offset, sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff), true)
      offset += 2
    }
  }
  return out
}

export function bytesToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

export async function sha256Hex(buffer, subtle = globalThis.crypto?.subtle) {
  const digest = new Uint8Array(await subtle.digest('SHA-256', buffer))
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('')
}

/** Decode with WebAudio; resampled to 44.1 kHz, at most two channels. */
export async function decodeToChannels(buffer, { OfflineContext = globalThis.OfflineAudioContext } = {}) {
  if (typeof OfflineContext !== 'function') throw new Error('此面板不支持 WebAudio 解码。')
  const context = new OfflineContext(2, 1, WAV_RATE)
  let audio
  try { audio = await context.decodeAudioData(buffer.slice(0)) }
  catch (error) { throw new Error(`面板无法解码这个文件：${error?.message || error}`) }
  const channels = [audio.getChannelData(0)]
  channels.push(audio.numberOfChannels > 1 ? audio.getChannelData(1) : audio.getChannelData(0))
  return { channels, sampleRate: audio.sampleRate, duration: audio.duration }
}

/**
 * Whole pipeline. `file` is a browser File (or Blob). Returns
 * { path, bytes, duration, cached }.
 */
export async function convertFileToWav(api, file, { onProgress = () => {}, decode = decodeToChannels, hash = sha256Hex } = {}) {
  onProgress({ stage: 'read', ratio: 0 })
  const source = await file.arrayBuffer()
  const sourceSha256 = await hash(source)
  return uploadDecodedWav(api, source, sourceSha256, { onProgress, decode })
}

/** Decode bytes and store them as <sourceSha256>.wav in the Host cache. */
export async function uploadDecodedWav(api, source, sourceSha256, { onProgress = () => {}, decode = decodeToChannels } = {}) {
  onProgress({ stage: 'decode', ratio: 0 })
  const { channels, sampleRate, duration } = await decode(source)
  const wav = encodeWav(channels, sampleRate)
  const begun = unwrapRemote(await api.wavBegin({ sourceSha256, bytes: wav.length }), '无法开始写入 WAV。')
  if (begun.exists) { onProgress({ stage: 'done', ratio: 1 }); return { path: begun.path, bytes: wav.length, duration, cached: true } }
  const chunk = Math.min(WAV_CHUNK, begun.chunkBytes || WAV_CHUNK)
  for (let offset = 0; offset < wav.length; offset += chunk) {
    const part = wav.subarray(offset, Math.min(wav.length, offset + chunk))
    unwrapRemote(await api.wavWrite({ uploadId: begun.uploadId, offset, base64: bytesToBase64(part) }), '写入 WAV 失败。')
    onProgress({ stage: 'upload', ratio: Math.min(1, (offset + part.length) / wav.length) })
  }
  const done = unwrapRemote(await api.wavFinish({ uploadId: begun.uploadId }), '无法完成 WAV。')
  onProgress({ stage: 'done', ratio: 1 })
  return { path: done.path, bytes: done.bytes, duration, cached: false }
}

/** The file tui_live.py will try to play for this form ('' when none). */
export const effectiveAudioPath = effectiveAudioOf

const fromBase64 = text => {
  const binary = globalThis.atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Read a user-chosen audio file from the Host in chunks (Host serves media files only). */
export async function readHostAudio(api, path, { onProgress = () => {}, decode = fromBase64 } = {}) {
  let offset = 0, size = 0, buffer = null
  for (;;) {
    const chunk = unwrapRemote(await api.audioRead({ path, offset, length: 512 * 1024 }), '无法读取音频文件。')
    size = chunk.size
    buffer ??= new Uint8Array(size)
    if (chunk.bytes > 0) buffer.set(decode(chunk.base64), offset)
    offset += chunk.bytes
    onProgress({ stage: 'read', ratio: size ? offset / size : 1 })
    if (chunk.done || chunk.bytes === 0) break
  }
  return buffer ? buffer.buffer.slice(0, offset) : new ArrayBuffer(0)
}

export class AudioPrepareError extends Error {
  constructor(message, { code, probe } = {}) { super(message); this.name = 'AudioPrepareError'; this.code = code; this.probe = probe }
}

/**
 * Make sure tui_live.py gets a file MCI can open. Returns
 * { path, converted, cached, probe } (path = the original when it plays as is).
 * Throws AudioPrepareError with code 'decode-failed' when neither MCI nor the
 * panel's Chromium can handle the file (ffmpeg may still convert it).
 */
export async function prepareTerminalAudio(api, path, { onProgress = () => {}, decode = decodeToChannels, read = readHostAudio } = {}) {
  onProgress({ stage: 'probe', ratio: 0 })
  const probe = unwrapRemote(await api.audioProbe({ path, hash: true }), '无法读取音频文件。')
  if (probe.mciPlayable) return { path, converted: false, cached: false, probe }
  if (probe.cachedWav) { onProgress({ stage: 'done', ratio: 1 }); return { path: probe.cachedWav, converted: true, cached: true, probe } }
  if (probe.format === 'unknown') throw new AudioPrepareError(`无法识别这个文件的格式（按内容判断，不看扩展名）：${path}`, { code: 'unknown-format', probe })
  if (!probe.chromium) throw new AudioPrepareError(`${probe.label} 不能由面板解码。`, { code: 'decode-failed', probe })
  const source = await read(api, path, { onProgress })
  try {
    const result = await uploadDecodedWav(api, source, probe.sha256, { onProgress, decode })
    return { path: result.path, converted: true, cached: result.cached, duration: result.duration, probe }
  } catch (error) {
    if (/无法解码|decode/i.test(String(error?.message))) throw new AudioPrepareError(String(error.message), { code: 'decode-failed', probe })
    throw error
  }
}
