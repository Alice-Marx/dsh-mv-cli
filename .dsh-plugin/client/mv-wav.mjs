/**
 * Audio helpers of the panel: decode with the panel's own Chromium, encode a
 * 16-bit PCM WAV (AI-made packs, previews), base64 for chunked uploads, and
 * chunked reads of a user-chosen audio file from the Host.
 */
import { unwrapRemote } from './remote-state.mjs'

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
