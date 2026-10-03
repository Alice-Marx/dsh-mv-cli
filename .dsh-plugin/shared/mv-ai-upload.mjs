/**
 * Pure request parsers of the AI-pack upload endpoints (shared with the
 * Typert descriptors, so browser-safe).
 */
import { MV_PACK_LIMITS, isAbsolutePackPath } from './mv-pack.mjs'
import { AI_UPLOAD_ROLES } from './mv-ai-prompt.mjs'
import { parseBase64Chunk } from './mv-audio-protocol.mjs'

const UPLOAD_ID = /^pack-[0-9a-f]{16,40}$/

export function parsePackUploadBegin(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('upload request must be an object')
  const extra = Object.keys(value).filter(key => !['packDir', 'role', 'bytes'].includes(key))
  if (extra.length) throw new TypeError(`upload request has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.packDir !== 'string' || !isAbsolutePackPath(value.packDir) || value.packDir.length > 1024) throw new TypeError('packDir must be an absolute path')
  if (!AI_UPLOAD_ROLES.includes(value.role)) throw new TypeError(`role must be ${AI_UPLOAD_ROLES.join(' / ')}`)
  const max = value.role === 'audio' ? MV_PACK_LIMITS.audioBytes : MV_PACK_LIMITS.textFileBytes
  if (!Number.isInteger(value.bytes) || value.bytes < 1 || value.bytes > max) throw new TypeError(`bytes must be 1..${max}`)
  return { packDir: value.packDir, role: value.role, bytes: value.bytes }
}

export function parsePackUploadWrite(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('upload write must be an object')
  const extra = Object.keys(value).filter(key => !['uploadId', 'offset', 'base64'].includes(key))
  if (extra.length) throw new TypeError(`upload write has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.uploadId !== 'string' || !UPLOAD_ID.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  if (!Number.isInteger(value.offset) || value.offset < 0 || value.offset > MV_PACK_LIMITS.audioBytes) throw new TypeError('offset is invalid')
  return { uploadId: value.uploadId, offset: value.offset, base64: parseBase64Chunk(value.base64) }
}

export function parsePackUploadFinish(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('upload finish must be an object')
  const extra = Object.keys(value).filter(key => key !== 'uploadId')
  if (extra.length) throw new TypeError(`upload finish has unexpected fields: ${extra.join(', ')}`)
  if (typeof value.uploadId !== 'string' || !UPLOAD_ID.test(value.uploadId)) throw new TypeError('uploadId is invalid')
  return { uploadId: value.uploadId }
}

/** Light check of spectrum.json written by the panel. */
export function checkSpectrumText(textValue) {
  let data
  try { data = JSON.parse(textValue) } catch { return 'spectrum.json 不是有效的 JSON' }
  if (!(Number(data?.fps) > 0) || !Array.isArray(data?.frames) || !data.frames.length) return 'spectrum.json 需要 fps 与 frames'
  if (data.frames.some(frame => !Array.isArray(frame) || frame.length !== 48 || frame.some(v => typeof v !== 'number' || !(v >= 0 && v <= 1)))) return 'spectrum.json 的每帧应是 48 个 0..1 的数字'
  return ''
}

