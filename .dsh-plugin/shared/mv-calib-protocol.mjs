/**
 * Request parsers for the lyrics lookup and calibration calls (pure; shared
 * by the gateway descriptors, the Host and the panel).
 */
import { MV_PACK_MANIFEST, isAbsolutePackPath } from './mv-pack.mjs'

const fail = message => { throw new TypeError(message) }

export const LRCLIB_FIELDS = Object.freeze(['title', 'artist', 'album', 'duration'])

export function parseLyricsLookup(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('lyricsLookup must be an object')
  const extra = Object.keys(value).filter(k => !LRCLIB_FIELDS.includes(k))
  if (extra.length) fail(`lyricsLookup: unexpected fields: ${extra.join(', ')}`)
  const text = (v, name, max = 300) => (v === undefined ? '' : typeof v === 'string' && v.length <= max ? v.trim() : fail(`${name} must be a string`))
  const title = text(value.title, 'title')
  if (!title) fail('title is required')
  const duration = value.duration === undefined || value.duration === null ? null : Number.isFinite(value.duration) && value.duration > 0 && value.duration < 36000 ? value.duration : fail('duration out of range')
  return { title, artist: text(value.artist, 'artist'), album: text(value.album, 'album'), duration }
}

export const PACK_TEXT_FILES = Object.freeze({ 'lyrics.lrc': 2 * 1048576, [MV_PACK_MANIFEST]: 512 * 1024, 'timing.json': 8 * 1048576, 'sections.json': 1048576 })
export const ANALYSIS_FILES = Object.freeze({ manifest: MV_PACK_MANIFEST, transcript: 'analysis/transcript.json', vocals: 'analysis/vocals.wav', timing: 'timing.json', sections: 'sections.json' })
export const BACKUP_DIR = '.dsh-mv-backup'
export const BACKUP_KEEP = 10
const READ_CHUNK = 1024 * 1024
const absManifest = v => (typeof v === 'string' && isAbsolutePackPath(v) ? v : fail('manifestPath must be an absolute path'))

export function parsePackWriteText(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('packWriteText must be an object')
  const extra = Object.keys(value).filter(k => !['manifestPath', 'file', 'text'].includes(k))
  if (extra.length) fail(`packWriteText: unexpected fields: ${extra.join(', ')}`)
  if (!Object.hasOwn(PACK_TEXT_FILES, value.file)) fail(`file must be one of ${Object.keys(PACK_TEXT_FILES).join(', ')}`)
  if (typeof value.text !== 'string') fail('text must be a string')
  if (Buffer.byteLength(value.text, 'utf8') > PACK_TEXT_FILES[value.file]) fail(`${value.file} is too large`)
  return { manifestPath: absManifest(value.manifestPath), file: value.file, text: value.text }
}

export function parseAnalysisRead(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('analysisRead must be an object')
  const extra = Object.keys(value).filter(k => !['manifestPath', 'name', 'offset', 'length'].includes(k))
  if (extra.length) fail(`analysisRead: unexpected fields: ${extra.join(', ')}`)
  if (!Object.hasOwn(ANALYSIS_FILES, value.name)) fail(`name must be one of ${Object.keys(ANALYSIS_FILES).join(', ')}`)
  const offset = value.offset ?? 0, length = value.length ?? READ_CHUNK
  if (!Number.isInteger(offset) || offset < 0) fail('offset must be a non-negative integer')
  if (!Number.isInteger(length) || length < 1 || length > READ_CHUNK) fail('length out of range')
  return { manifestPath: absManifest(value.manifestPath), name: value.name, offset, length }
}

