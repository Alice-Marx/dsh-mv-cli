/**
 * Pure (browser-safe) part of the audio handling: format sniffing by content
 * (never by file extension), which players can open what, and the strict
 * request parsers of the audio endpoints.
 *
 *  - Canvas MV and AI-made packs play through the panel's Chromium, which
 *    decodes MP3, AAC / M4A / MP4 (also fragmented "DASH" MP4 and the audio
 *    track of MP4 / MOV videos), WebM / Matroska (Opus, Vorbis), Ogg (Opus,
 *    Vorbis, FLAC), FLAC and WAV.
 *  - tui_live.py plays sound through Windows MCI (`type mpegvideo`), which on
 *    a stock system opens real MP3 and PCM WAV files only. Everything else is
 *    turned into a cached 16-bit PCM WAV automatically before the player starts.
 *  - Formats Chromium cannot decode (WMA, AIFF, AMR, CAF, AC-3, …) can be
 *    converted with the user's own ffmpeg, if one is installed.
 */
export const WAV_LIMITS = Object.freeze({ maxBytes: 1536 * 1024 * 1024, chunkBytes: 512 * 1024, keepFiles: 8 })
export const AUDIO_LIMITS = Object.freeze({ sniffBytes: 4096, maxSourceBytes: 1024 * 1024 * 1024, readChunkBytes: 512 * 1024 })

const ascii = (b, from, to) => {
  let out = ''
  for (let i = from; i < Math.min(to, b.length); i += 1) out += String.fromCharCode(b[i])
  return out
}
const indexOfAscii = (b, text, from = 0, to = b.length) => {
  outer: for (let i = from; i <= Math.min(to, b.length) - text.length; i += 1) {
    for (let j = 0; j < text.length; j += 1) if (b[i + j] !== text.charCodeAt(j)) continue outer
    return i
  }
  return -1
}

/** WAV fmt codes. */
const WAV_CODECS = { 1: 'PCM', 3: 'IEEE float', 6: 'A-law', 7: 'μ-law', 0x11: 'IMA ADPCM', 0x55: 'MP3', 0xfffe: 'extensible' }

function sniffWav(b) {
  // Walk RIFF chunks for fmt (usually at 12).
  let at = 12, codec = null, bits = null, channels = null, rate = null
  while (at + 8 <= b.length) {
    const id = ascii(b, at, at + 4)
    const size = b[at + 4] | (b[at + 5] << 8) | (b[at + 6] << 16) | (b[at + 7] << 24)
    if (id === 'fmt ' && at + 24 <= b.length) {
      codec = b[at + 8] | (b[at + 9] << 8)
      channels = b[at + 10] | (b[at + 11] << 8)
      rate = (b[at + 12] | (b[at + 13] << 8) | (b[at + 14] << 16) | (b[at + 15] << 24)) >>> 0
      bits = b[at + 22] | (b[at + 23] << 8)
      if (codec === 0xfffe && at + 34 <= b.length) codec = (b[at + 32] | (b[at + 33] << 8)) === 3 ? 3 : 1 // sub-format GUID starts with the plain code
      break
    }
    if (size < 0) break
    at += 8 + size + (size & 1)
  }
  const pcm = codec === 1 && (bits === 8 || bits === 16 || bits === 24) && channels >= 1 && channels <= 2
  const name = codec === null ? '' : `（${WAV_CODECS[codec] ?? `编码 ${codec}`}${bits ? ` ${bits} bit` : ''}）`
  return { format: 'wav', label: `WAV${name}`, codec, bits, channels, rate, pcm, chromium: codec === null || codec === 1 || codec === 3 || codec === 6 || codec === 7 }
}

/**
 * Classify a file by its first bytes (4 KB is plenty). Returns
 * { format, label, kind: 'audio'|'video'|'unknown', chromium, mci, ... }.
 * `chromium` = the panel can very likely decode it, `mci` = tui_live.py can
 * play it as is.
 */
export function sniffAudio(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const result = info => ({ kind: 'audio', chromium: true, mci: false, ...info })
  if (b.length >= 12 && ascii(b, 4, 8) === 'ftyp') {
    const brand = ascii(b, 8, 12)
    const head = ascii(b, 8, Math.min(b.length, 64))
    const dash = /dash|iso5|iso6|msdh|msix/.test(head)
    const quicktime = brand === 'qt  '
    const audioBrand = /^(M4A |M4B |M4P |F4A |F4B )$/.test(brand)
    const video = !audioBrand && (quicktime || indexOfAscii(b, 'vide', 0, Math.min(b.length, AUDIO_LIMITS.sniffBytes)) >= 0)
    const label = quicktime ? 'MOV（QuickTime）' : audioBrand ? 'M4A（AAC）' : dash ? 'MP4/AAC（DASH 分片）' : video ? 'MP4 视频（用其中的音轨）' : 'MP4/AAC'
    return result({ format: 'mp4', brand, fragmented: dash, label, kind: video ? 'video' : 'audio' })
  }
  if (b.length >= 8 && ['moov', 'moof', 'styp', 'sidx'].includes(ascii(b, 4, 8))) return result({ format: 'mp4', brand: '', fragmented: true, label: 'MP4/AAC（无 ftyp 分片）' })
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WAVE') {
    const wav = sniffWav(b)
    return result({ ...wav, mci: wav.pcm })
  }
  if (b.length >= 12 && (ascii(b, 0, 4) === 'RF64' || ascii(b, 0, 4) === 'BW64') && ascii(b, 8, 12) === 'WAVE') return result({ format: 'wav', label: 'WAV（RF64 大文件）', chromium: false })
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) {
    const webm = indexOfAscii(b, 'webm', 0, 64) >= 0
    const video = indexOfAscii(b, 'V_', 0, b.length) >= 0
    return result({ format: webm ? 'webm' : 'mkv', label: `${webm ? 'WebM' : 'Matroska（MKV/MKA）'}${video ? ' 视频（用其中的音轨）' : ''}`, kind: video ? 'video' : 'audio' })
  }
  if (b.length >= 4 && ascii(b, 0, 4) === 'OggS') {
    const head = ascii(b, 0, Math.min(b.length, 128))
    const codec = /OpusHead/.test(head) ? 'Opus' : /\x01vorbis/.test(head) ? 'Vorbis' : /\x7fFLAC/.test(head) ? 'FLAC' : /theora/.test(head) ? 'Theora' : ''
    return result({ format: 'ogg', label: codec ? `Ogg ${codec}` : 'Ogg', codec, kind: codec === 'Theora' ? 'video' : 'audio' })
  }
  if (b.length >= 4 && ascii(b, 0, 4) === 'fLaC') return result({ format: 'flac', label: 'FLAC' })
  if (b.length >= 3 && ascii(b, 0, 3) === 'ID3') {
    // ID3v2 tag: skip it (syncsafe size) to see what follows (some AAC files carry ID3 too).
    const size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f)
    const next = 10 + size + ((b[5] & 0x10) ? 10 : 0)
    if (next + 2 <= b.length && b[next] === 0xff && (b[next + 1] & 0xf6) === 0xf0) return result({ format: 'aac', label: 'AAC（ADTS，带 ID3）' })
    if (next + 4 <= b.length && ascii(b, next, next + 4) === 'fLaC') return result({ format: 'flac', label: 'FLAC（带 ID3）' })
    return result({ format: 'mp3', label: 'MP3', mci: true })
  }
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) {
    // MPEG audio frame sync. Layer bits 00 = ADTS AAC (0xFFF1 / 0xFFF9); 01/10/11 = MPEG layer III/II/I.
    if ((b[1] & 0x06) === 0x00) return result({ format: 'aac', label: 'AAC（ADTS）' })
    const layer = (b[1] & 0x06) === 0x02 ? 'MP3' : (b[1] & 0x06) === 0x04 ? 'MP2' : 'MP1'
    return result({ format: layer === 'MP3' ? 'mp3' : 'mp2', label: layer, mci: true })
  }
  if (b.length >= 12 && ascii(b, 0, 4) === 'FORM' && /^AIF[FC]$/.test(ascii(b, 8, 12))) return result({ format: 'aiff', label: 'AIFF', chromium: false })
  if (b.length >= 16 && b[0] === 0x30 && b[1] === 0x26 && b[2] === 0xb2 && b[3] === 0x75 && b[4] === 0x8e && b[5] === 0x66 && b[6] === 0xcf && b[7] === 0x11) return result({ format: 'asf', label: 'WMA / WMV（ASF）', chromium: false, mci: false })
  if (b.length >= 4 && ascii(b, 0, 4) === 'caff') return result({ format: 'caf', label: 'CAF（Apple Core Audio）', chromium: false })
  if (b.length >= 5 && ascii(b, 0, 5) === '#!AMR') return result({ format: 'amr', label: 'AMR', chromium: false })
  if (b.length >= 2 && b[0] === 0x0b && b[1] === 0x77) return result({ format: 'ac3', label: 'AC-3', chromium: false })
  if (b.length >= 4 && ascii(b, 0, 4) === 'MAC ') return result({ format: 'ape', label: "Monkey's Audio（APE）", chromium: false })
  if (b.length >= 4 && ascii(b, 0, 4) === 'wvpk') return result({ format: 'wavpack', label: 'WavPack', chromium: false })
  if (b.length >= 4 && ascii(b, 0, 4) === '.snd') return result({ format: 'au', label: 'Sun AU', chromium: false })
  if (b.length >= 188 * 2 && b[0] === 0x47 && b[188] === 0x47) return result({ format: 'mpegts', label: 'MPEG-TS（用其中的音轨）', kind: 'video', chromium: false })
  if (b.length >= 4 && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0xba) return result({ format: 'mpeg', label: 'MPEG-PS 视频', kind: 'video', chromium: false })
  if (b.length >= 3 && ascii(b, 0, 3) === 'FLV') return result({ format: 'flv', label: 'FLV 视频', kind: 'video', chromium: false })
  return { format: 'unknown', label: '未知格式', kind: 'unknown', chromium: false, mci: false }
}

/** Formats tui_live.py (Windows MCI, mpegvideo) opens as is on a stock system. */
export const MCI_FORMATS = Object.freeze(['mp3', 'mp2', 'wav'])

/** Content-based MIME type for a Blob / <audio> element. */
export function audioMimeOf(sniff) {
  switch (sniff?.format) {
    case 'mp3': case 'mp2': return 'audio/mpeg'
    case 'aac': return 'audio/aac'
    case 'mp4': return sniff.kind === 'video' ? 'video/mp4' : 'audio/mp4'
    case 'webm': return sniff.kind === 'video' ? 'video/webm' : 'audio/webm'
    case 'mkv': return sniff.kind === 'video' ? 'video/x-matroska' : 'audio/x-matroska'
    case 'ogg': return 'audio/ogg'
    case 'flac': return 'audio/flac'
    case 'wav': return 'audio/wav'
    default: return 'application/octet-stream'
  }
}

/** File extension matching the content (for copies the plugin writes). */
export function audioExtensionOf(sniff) {
  const map = { mp3: '.mp3', mp2: '.mp2', aac: '.aac', webm: '.webm', mkv: '.mka', ogg: '.ogg', flac: '.flac', wav: '.wav', aiff: '.aiff', asf: '.wma', caf: '.caf', amr: '.amr', ac3: '.ac3', ape: '.ape', wavpack: '.wv', au: '.au' }
  if (sniff?.format === 'mp4') return sniff.kind === 'video' ? '.mp4' : '.m4a'
  return map[sniff?.format] ?? '.bin'
}

/** Short note for a file tui_live.py cannot open as is ('' when it can). */
export function mciNote(sniff) {
  if (sniff?.mci) return ''
  return `音频实际是 ${sniff?.label ?? '未知格式'}（看内容，不看扩展名）。tui_live.py 用 Windows MCI 放音，只能直接播放 MP3 和 PCM WAV；播放前会自动转换成 WAV 缓存，原文件不变。`
}

/** Back-compat name used by older code paths and tests. */
export const mciWarning = (sniff, path = '') => {
  const note = mciNote(sniff)
  return note ? `${note}${path ? ` ${path}` : ''}` : ''
}

const SHA = /^[0-9a-f]{64}$/
const UPLOAD = /^wav-[0-9a-f]{16,40}$/

function plain(value, subject) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${subject} must be an object`)
  return value
}
function onlyKeys(value, keys, subject) {
  const extra = Object.keys(value).filter(key => !keys.includes(key))
  if (extra.length) throw new TypeError(`${subject} has unexpected fields: ${extra.join(', ')}`)
}

export function parseAbsolutePath(value, subject = 'path') {
  const path = typeof value === 'string' ? value.trim().replace(/^"(.*)"$/, '$1') : ''
  if (!path || path.length > 1024 || /[\0\r\n"]/.test(path) || !(path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path))) throw new TypeError(`${subject} must be an absolute path`)
  return path
}

export function parseWavBegin(value) {
  plain(value, 'wav request'); onlyKeys(value, ['sourceSha256', 'bytes'], 'wav request')
  if (typeof value.sourceSha256 !== 'string' || !SHA.test(value.sourceSha256)) throw new TypeError('sourceSha256 must be 64 hex characters')
  if (!Number.isInteger(value.bytes) || value.bytes < 44 || value.bytes > WAV_LIMITS.maxBytes) throw new TypeError(`bytes must be 44..${WAV_LIMITS.maxBytes}`)
  return { sourceSha256: value.sourceSha256, bytes: value.bytes }
}

export function parseBase64Chunk(value, max = WAV_LIMITS.chunkBytes) {
  if (typeof value !== 'string' || value.length === 0 || value.length > Math.ceil(max / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new TypeError('base64 chunk is invalid')
  return value
}

export function parseWavWrite(value) {
  plain(value, 'wav write'); onlyKeys(value, ['uploadId', 'offset', 'base64'], 'wav write')
  if (typeof value.uploadId !== 'string' || !UPLOAD.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  if (!Number.isInteger(value.offset) || value.offset < 0 || value.offset > WAV_LIMITS.maxBytes) throw new TypeError('offset is invalid')
  return { uploadId: value.uploadId, offset: value.offset, base64: parseBase64Chunk(value.base64) }
}

export function parseWavFinish(value) {
  plain(value, 'wav finish'); onlyKeys(value, ['uploadId'], 'wav finish')
  if (typeof value.uploadId !== 'string' || !UPLOAD.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  return { uploadId: value.uploadId }
}

/** { path, hash? }: hash=true also computes sha256 and looks up the WAV cache. */
export function parseAudioProbe(value) {
  plain(value, 'probe request'); onlyKeys(value, ['path', 'hash', 'player'], 'probe request')
  if (value.hash !== undefined && typeof value.hash !== 'boolean') throw new TypeError('hash must be a boolean')
  // `player` is accepted (and ignored) so a panel of 0.3.x does not break mid-upgrade.
  return { path: parseAbsolutePath(value.path), hash: value.hash === true }
}

/** One chunk of a user-chosen audio file (only files that sniff as media). */
export function parseAudioRead(value) {
  plain(value, 'audio read'); onlyKeys(value, ['path', 'offset', 'length'], 'audio read')
  const offset = value.offset ?? 0, length = value.length ?? AUDIO_LIMITS.readChunkBytes
  if (!Number.isInteger(offset) || offset < 0 || offset > AUDIO_LIMITS.maxSourceBytes) throw new TypeError('offset is invalid')
  if (!Number.isInteger(length) || length < 1 || length > AUDIO_LIMITS.readChunkBytes) throw new TypeError(`length must be 1..${AUDIO_LIMITS.readChunkBytes}`)
  return { path: parseAbsolutePath(value.path), offset, length }
}

/** Convert with the user's ffmpeg into the WAV cache (always after a confirmation). */
export function parseAudioConvert(value) {
  plain(value, 'convert request'); onlyKeys(value, ['path', 'confirmed'], 'convert request')
  if (value.confirmed !== true) throw new TypeError('ffmpeg conversion needs confirmed: true')
  return { path: parseAbsolutePath(value.path), confirmed: true }
}

export function parseFfmpegInfo(value) {
  if (value === undefined || value === null) return {}
  plain(value, 'ffmpeg info'); onlyKeys(value, [], 'ffmpeg info')
  return {}
}

/** The fixed ffmpeg argument vector: decode the first audio stream into 16-bit PCM WAV. */
export function ffmpegArgs(source, target) {
  return ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-map', '0:a:0', '-vn', '-sn', '-dn', '-map_metadata', '-1', '-ac', '2', '-ar', '44100', '-c:a', 'pcm_s16le', '-bitexact', '-f', 'wav', target]
}
