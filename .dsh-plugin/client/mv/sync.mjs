/**
 * Audio identity and sync offsets. The film's time base is the 211.9 s cut of
 * the song; other encodes are recognised by sha256 and shifted:
 *   film time = audio.currentTime + audioOffset
 * Offsets the user tunes are stored per sha256 in localStorage.
 */
/**
 * Encodes seen in the wild. Offsets were measured on 2026-10-03 by
 * cross-correlating onset envelopes (10 ms resolution, 9 windows agreeing)
 * against the world.execute-me-ascii copy, whose lyric/scene timings the film
 * uses. Only digests are stored; no audio ships with the plugin.
 */
export const KNOWN_AUDIO = Object.freeze([
  Object.freeze({ sha256: '40e902c06dd2f5eee367ccc2fb9060a5e72d93870674ff7e3c8b63160e75f409', label: 'world.execute-me-ascii 附带版本（AAC，211.9 s）', audioOffset: 0, measured: true }),
  Object.freeze({ sha256: '8b7a415ffbc5100c4e3ab5f7230cdfd3a5e02d87e1af8b5437dbff40b2900db5', label: 'world-execute-me-dsh-pv input/song.mp3（AAC，211.9 s）', audioOffset: 0.12, measured: true }),
  Object.freeze({ sha256: '79c4e53663c7966b7160bff19326e614658485d4ce0199ff82715ea9d0a418fc', label: 'dsh-pv 参考 MP3（320 kbps，211.9 s）', audioOffset: 0.12, measured: false }),
  Object.freeze({ sha256: 'f98eaa583aaec0b5f9d5ffee25a1a22c39587ba28524bd453dd1dc22be13c2d5', label: 'world_execute_me 附带版本（AAC，224.5 s，前奏多 4.8 s）', audioOffset: -4.83, measured: true }),
])

export async function sha256Hex(buffer, subtle = globalThis.crypto?.subtle) {
  if (!subtle) throw new Error('当前环境不支持 SubtleCrypto。')
  const digest = await subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Match a digest against the table (full digest, or a ≥12-hex prefix entry). */
export function knownAudio(sha, table) {
  const value = String(sha ?? '').toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(value)) return null
  return table.find(item => item.sha256 === value || (item.sha256.length >= 12 && value.startsWith(item.sha256))) ?? null
}

const KEY = 'dsh-mv.sync.v1'

function readAll(storage) {
  try { const data = JSON.parse(storage?.getItem(KEY) ?? '{}'); return data && typeof data === 'object' ? data : {} } catch { return {} }
}

/** Stored {audioOffset, subtitleOffset} for a digest, else the known default. */
export function loadOffsets(sha, table, storage = globalThis.localStorage) {
  const saved = readAll(storage)[sha]
  const known = knownAudio(sha, table)
  return {
    audioOffset: Number.isFinite(saved?.audioOffset) ? saved.audioOffset : (known?.audioOffset ?? 0),
    subtitleOffset: Number.isFinite(saved?.subtitleOffset) ? saved.subtitleOffset : 0,
    known,
    saved: Boolean(saved),
  }
}

export function saveOffsets(sha, { audioOffset, subtitleOffset }, storage = globalThis.localStorage) {
  if (!sha) return
  const all = readAll(storage)
  all[sha] = { audioOffset: roundOffset(audioOffset), subtitleOffset: roundOffset(subtitleOffset), at: Date.now() }
  try { storage?.setItem(KEY, JSON.stringify(all)) } catch { /* quota / private mode */ }
}

export function resetOffsets(sha, storage = globalThis.localStorage) {
  const all = readAll(storage)
  delete all[sha]
  try { storage?.setItem(KEY, JSON.stringify(all)) } catch { /* ignore */ }
}

/** player.py rounds offsets to 2 decimals after each ±0.1 step. */
export const roundOffset = value => Math.round((Number(value) || 0) * 100) / 100

export const formatOffset = value => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(2)} s`
