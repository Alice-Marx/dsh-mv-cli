/**
 * Read title / artist / album / duration tags from audio bytes (pure, no
 * dependencies): ID3v2 (2.2–2.4) and ID3v1, MP4/M4A (ilst + mvhd), FLAC
 * (VORBIS_COMMENT + STREAMINFO), Ogg Vorbis / Opus comments. Returns
 * { title, artist, album, duration } with '' / null when unknown.
 */
const latin1 = (b, from, to) => { let s = ''; for (let i = from; i < to; i++) s += String.fromCharCode(b[i]); return s }
const u32 = (b, at) => ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0
const u32le = (b, at) => (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24)) >>> 0
const clean = text => String(text ?? '').replace(/\0+$/g, '').replace(/\0/g, ' / ').trim()
const utf8 = (b, from, to) => { try { return new TextDecoder('utf-8').decode(b.subarray(from, to)) } catch { return '' } }
const utf16 = (b, from, to, littleDefault = true) => {
  let little = littleDefault, at = from
  if (to - from >= 2 && b[at] === 0xff && b[at + 1] === 0xfe) { little = true; at += 2 } else if (to - from >= 2 && b[at] === 0xfe && b[at + 1] === 0xff) { little = false; at += 2 }
  try { return new TextDecoder(little ? 'utf-16le' : 'utf-16be').decode(b.subarray(at, at + ((to - at) & ~1))) } catch { return '' }
}

function id3Text(b, from, to) {
  if (to <= from) return ''
  const enc = b[from]
  if (enc === 0) return clean(latin1(b, from + 1, to))
  if (enc === 1) return clean(utf16(b, from + 1, to))
  if (enc === 2) return clean(utf16(b, from + 1, to, false))
  return clean(utf8(b, from + 1, to))
}

function readId3v2(b, out) {
  if (b.length < 10 || latin1(b, 0, 3) !== 'ID3') return 0
  const version = b[3], flags = b[5]
  const size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f)
  const end = Math.min(b.length, 10 + size)
  let at = 10
  if (flags & 0x40 && version >= 3) at += version === 4 ? (((b[10] & 0x7f) << 21) | ((b[11] & 0x7f) << 14) | ((b[12] & 0x7f) << 7) | (b[13] & 0x7f)) : u32(b, 10) + 4
  const names = version === 2 ? { TT2: 'title', TP1: 'artist', TAL: 'album', TLE: 'length' } : { TIT2: 'title', TPE1: 'artist', TALB: 'album', TLEN: 'length' }
  while (at + (version === 2 ? 6 : 10) <= end) {
    const id = latin1(b, at, at + (version === 2 ? 3 : 4))
    if (!/^[A-Z0-9]{3,4}$/.test(id)) break
    let frameSize, header
    if (version === 2) { frameSize = (b[at + 3] << 16) | (b[at + 4] << 8) | b[at + 5]; header = 6 }
    else if (version === 4) { frameSize = ((b[at + 4] & 0x7f) << 21) | ((b[at + 5] & 0x7f) << 14) | ((b[at + 6] & 0x7f) << 7) | (b[at + 7] & 0x7f); header = 10 }
    else { frameSize = u32(b, at + 4); header = 10 }
    if (frameSize <= 0 || at + header + frameSize > end) break
    const key = names[id]
    if (key) {
      const text = id3Text(b, at + header, at + header + frameSize)
      if (key === 'length') { const ms = Number(text); if (ms > 0) out.duration ??= ms / 1000 } else if (text && !out[key]) out[key] = text
    }
    at += header + frameSize
  }
  return end
}

function readId3v1(b, out) {
  if (b.length < 128) return
  const at = b.length - 128
  if (latin1(b, at, at + 3) !== 'TAG') return
  const field = (from, len) => clean(latin1(b, at + from, at + from + len))
  out.title ||= field(3, 30); out.artist ||= field(33, 30); out.album ||= field(63, 30)
}

function walkBoxes(b, from, to, visit, depth = 0) {
  let at = from
  while (at + 8 <= to && depth < 8) {
    let size = u32(b, at), header = 8
    const type = latin1(b, at + 4, at + 8)
    if (size === 1 && at + 16 <= to) { size = u32(b, at + 8) * 2 ** 32 + u32(b, at + 12); header = 16 }
    if (size === 0) size = to - at
    if (size < header || at + size > to) { if (visit(type, at + header, to, true) === false) return; break }
    if (visit(type, at + header, at + size, false) === false) return
    at += size
  }
}

function readMp4(b, out) {
  if (b.length < 12 || latin1(b, 4, 8) !== 'ftyp') return false
  const ilstNames = { '\u00a9nam': 'title', '\u00a9ART': 'artist', aART: 'artist', '\u00a9alb': 'album' }
  const visit = depth => (type, from, to) => {
    if (type === 'moov' || type === 'udta' || type === 'trak' || type === 'mdia') walkBoxes(b, from, to, visit(depth + 1), depth + 1)
    else if (type === 'meta') walkBoxes(b, from + 4, to, visit(depth + 1), depth + 1)
    else if (type === 'ilst') {
      walkBoxes(b, from, to, (name, f, t) => {
        const key = ilstNames[name]
        if (!key) return
        walkBoxes(b, f, t, (inner, df, dt) => { if (inner === 'data' && !out[key]) { const text = clean(utf8(b, df + 8, dt)); if (text) out[key] = text } }, depth + 2)
      }, depth + 1)
    } else if (type === 'mvhd' && from + 20 <= to) {
      const version = b[from]
      const scale = version === 1 ? u32(b, from + 20) : u32(b, from + 12)
      const length = version === 1 ? u32(b, from + 24) * 2 ** 32 + u32(b, from + 28) : u32(b, from + 16)
      if (scale > 0 && length > 0 && length !== 0xffffffff) out.duration ??= length / scale
    }
  }
  walkBoxes(b, 0, b.length, visit(0))
  return true
}

function vorbisComments(b, at, end, out) {
  if (at + 4 > end) return
  const vendor = u32le(b, at); at += 4 + vendor
  if (at + 4 > end) return
  const count = u32le(b, at); at += 4
  for (let i = 0; i < count && at + 4 <= end; i++) {
    const len = u32le(b, at); at += 4
    if (at + len > end) break
    const entry = utf8(b, at, at + len); at += len
    const eq = entry.indexOf('=')
    if (eq < 0) continue
    const key = entry.slice(0, eq).toUpperCase(), value = clean(entry.slice(eq + 1))
    if (key === 'TITLE') out.title ||= value
    else if (key === 'ARTIST' || key === 'ALBUMARTIST') out.artist ||= value
    else if (key === 'ALBUM') out.album ||= value
  }
}

function readFlac(b, start, out) {
  if (latin1(b, start, start + 4) !== 'fLaC') return false
  let at = start + 4
  for (let guard = 0; guard < 64 && at + 4 <= b.length; guard++) {
    const last = b[at] & 0x80, type = b[at] & 0x7f, len = (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]
    const body = at + 4
    if (type === 0 && body + 18 <= b.length) {
      const rate = (b[body + 10] << 12) | (b[body + 11] << 4) | (b[body + 12] >> 4)
      const samples = (b[body + 13] & 0x0f) * 2 ** 32 + u32(b, body + 14)
      if (rate > 0 && samples > 0) out.duration ??= samples / rate
    }
    if (type === 4) vorbisComments(b, body, Math.min(b.length, body + len), out)
    if (last) break
    at = body + len
  }
  return true
}

function readOgg(b, out) {
  if (latin1(b, 0, 4) !== 'OggS') return false
  const scan = Math.min(b.length, 256 * 1024)
  for (const marker of ['\x03vorbis', 'OpusTags']) {
    for (let i = 0; i < scan - marker.length; i++) {
      if (b[i] === marker.charCodeAt(0) && latin1(b, i, i + marker.length) === marker) { vorbisComments(b, i + marker.length, b.length, out); return true }
    }
  }
  return true
}

export function readAudioTags(input) {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input)
  const out = { title: '', artist: '', album: '' }
  const afterId3 = readId3v2(b, out)
  if (!readMp4(b, out) && !readFlac(b, afterId3, out) && !readOgg(b, out)) readId3v1(b, out)
  return { title: out.title || '', artist: out.artist || '', album: out.album || '', duration: Number.isFinite(out.duration) && out.duration > 0 ? Math.round(out.duration * 1000) / 1000 : null }
}

/** "Artist - Title (Official Video) [xyz].mp3" → { title, artist } guess. */
export function guessFromFileName(name) {
  let base = String(name ?? '').replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ')
  base = base.replace(/[([【](official|mv|pv|lyrics?|audio|video|hd|hq|4k|动态歌词|歌词|官方)[^)\]】]*[)\]】]/gi, '').replace(/\s*-\s*副本$/, '').replace(/\s+/g, ' ').trim()
  const parts = base.split(/\s+[-–—]\s+/)
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() }
  return { artist: '', title: base }
}
