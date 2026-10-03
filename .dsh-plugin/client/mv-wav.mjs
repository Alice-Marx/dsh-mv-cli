/**
 * Turn an audio file the MCI-based player cannot open (MP4/AAC renamed to
 * .mp3, …) into a 16-bit PCM WAV, decoded by the panel's own Chromium, and
 * upload it into the plugin's cache folder on the Host. The user's file and
 * folders are only read.
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
export async function convertFileToWav(api, file, { onProgress = () => {}, decode = decodeToChannels, hash = sha256Hex } = {}) {
  onProgress({ stage: 'read', ratio: 0 })
  const source = await file.arrayBuffer()
  const sourceSha256 = await hash(source)
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
export function effectiveAudioPath(form) {
  if (form.player === 'pack') return ''
  if (form.player === 'rust') return (form.audioFile || '').trim()
  if (form.noAudio) return ''
  const explicit = (form.audioFile || '').trim()
  if (explicit) return explicit
  const dir = (form.packageDir || '').trim().replace(/[\\/]+$/, '')
  return dir ? `${dir}${dir.includes('/') && !dir.includes('\\') ? '/' : '\\'}input${dir.includes('/') && !dir.includes('\\') ? '/' : '\\'}song.mp3` : ''
}
