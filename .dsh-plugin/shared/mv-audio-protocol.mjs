/**
 * Pure (browser-safe) part of the audio checks: format sniffing, the MCI
 * warning text and the strict request parsers for the WAV cache endpoints.
 */
export const WAV_LIMITS = Object.freeze({ maxBytes: 700 * 1024 * 1024, chunkBytes: 512 * 1024, keepFiles: 6 })

/** Classify a file by its first bytes. */
export function sniffAudio(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const ascii = (from, to) => String.fromCharCode(...b.subarray(from, to))
  if (b.length >= 12 && ascii(4, 8) === 'ftyp') {
    const brand = ascii(8, 12)
    const tail = ascii(8, Math.min(b.length, 40))
    return { format: 'mp4', brand, fragmented: /dash|iso5|iso6|msdh|msix/.test(tail), label: /dash|iso5|iso6/.test(tail) ? 'MP4/AAC（DASH 分片）' : 'MP4/AAC' }
  }
  if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { format: 'wav', label: 'WAV' }
  if (b.length >= 3 && ascii(0, 3) === 'ID3') return { format: 'mp3', label: 'MP3' }
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) {
    // MPEG audio frame sync; layer bits 01 = Layer III. ADTS AAC uses 0xFFF1/0xFFF9 (layer 00).
    return (b[1] & 0x06) === 0x00 ? { format: 'aac', label: 'AAC（ADTS）' } : { format: 'mp3', label: 'MP3' }
  }
  if (b.length >= 4 && ascii(0, 4) === 'OggS') return { format: 'ogg', label: 'Ogg' }
  if (b.length >= 4 && ascii(0, 4) === 'fLaC') return { format: 'flac', label: 'FLAC' }
  return { format: 'unknown', label: '未知格式' }
}

/** Formats Windows MCI (mpegvideo) is known to open on a stock system. */
export const MCI_FORMATS = Object.freeze(['mp3', 'wav'])

/** Problem text for a file the MCI-based player cannot play, or ''. */
export function mciWarning(sniff, path, player = 'python') {
  if (player === 'rust') {
    return sniff.format === 'mp3' ? '' : `音频文件实际是 ${sniff.label}，不是 MP3：Rust 版播放器只能解码 MP3，会没有声音。${path}`
  }
  if (MCI_FORMATS.includes(sniff.format)) return ''
  return `音频文件实际是 ${sniff.label}（扩展名不代表格式）：tui_live.py 用 Windows MCI 放音，MCI 打不开这种文件，会静音播放画面。请点「转换为 WAV…」，或换一个真正的 MP3。${path}`
}

const SHA = /^[0-9a-f]{64}$/
const UPLOAD = /^wav-[0-9a-f]{16,40}$/

export function parseWavBegin(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('wav request must be an object')
  const extra = Object.keys(value).filter(key => !['sourceSha256', 'bytes'].includes(key))
  if (extra.length) throw new TypeError(`wav request has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.sourceSha256 !== 'string' || !SHA.test(value.sourceSha256)) throw new TypeError('sourceSha256 must be 64 hex characters')
  if (!Number.isInteger(value.bytes) || value.bytes < 44 || value.bytes > WAV_LIMITS.maxBytes) throw new TypeError(`bytes must be 44..${WAV_LIMITS.maxBytes}`)
  return { sourceSha256: value.sourceSha256, bytes: value.bytes }
}

export function parseWavWrite(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('wav write must be an object')
  const extra = Object.keys(value).filter(key => !['uploadId', 'offset', 'base64'].includes(key))
  if (extra.length) throw new TypeError(`wav write has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.uploadId !== 'string' || !UPLOAD.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  if (!Number.isInteger(value.offset) || value.offset < 0 || value.offset > WAV_LIMITS.maxBytes) throw new TypeError('offset is invalid')
  if (typeof value.base64 !== 'string' || value.base64.length === 0 || value.base64.length > Math.ceil(WAV_LIMITS.chunkBytes / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value.base64)) {
    throw new TypeError('base64 chunk is invalid')
  }
  return { uploadId: value.uploadId, offset: value.offset, base64: value.base64 }
}

export function parseWavFinish(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('wav finish must be an object')
  const extra = Object.keys(value).filter(key => key !== 'uploadId')
  if (extra.length) throw new TypeError(`wav finish has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.uploadId !== 'string' || !UPLOAD.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  return { uploadId: value.uploadId }
}

export function parseAudioProbe(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('probe request must be an object')
  const extra = Object.keys(value).filter(key => !['path', 'player'].includes(key))
  if (extra.length) throw new TypeError(`probe request has unexpected fields: ${extra.join(', ')}`)
  const path = typeof value.path === 'string' ? value.path.trim() : ''
  if (!path || path.length > 1024 || /[\0\r\n"]/.test(path) || !(path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path))) throw new TypeError('path must be an absolute path')
  if (value.player !== undefined && !['python', 'rust'].includes(value.player)) throw new TypeError('player must be python or rust')
  return { path, player: value.player ?? 'python' }
}

