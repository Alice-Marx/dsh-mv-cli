// SPDX-License-Identifier: AGPL-3.0-or-later
// Bounded VM/worker-compatible inert resource decoder, copyright 2026 Alice-Marx.
import { gunzipSync, strFromU8 } from 'fflate'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const table = new Int16Array(128).fill(-1)
for (let i = 0; i < alphabet.length; i++) table[alphabet.charCodeAt(i)] = i
export function base64Bytes(text) {
  if (typeof text !== 'string' || text.length % 4 || text.length > 7 * 1024 * 1024) throw new Error('Invalid bounded base64')
  const padding = text.endsWith('==') ? 2 : text.endsWith('=') ? 1 : 0
  const end = text.length - padding, bytes = new Uint8Array(text.length / 4 * 3 - padding)
  let bits = 0, value = 0, offset = 0
  for (let i = 0; i < end; i++) {
    const code = text.charCodeAt(i), n = code < 128 ? table[code] : -1
    if (n < 0) throw new Error('Invalid base64 character')
    value = (value << 6) | n; bits += 6
    if (bits >= 8) { bits -= 8; bytes[offset++] = (value >> bits) & 255 }
  }
  if (offset !== bytes.length || bits && (value & ((1 << bits) - 1))) throw new Error('Invalid base64 padding')
  return bytes
}
export function decodeGzipChunks(data) {
  const chunks = data?.chunks
  if (!Array.isArray(chunks) || chunks.length > 16 || chunks.some(c => typeof c !== 'string')) throw new Error('Missing bounded offline data chunks')
  if (chunks.reduce((n, c) => n + c.length, 0) > 7 * 1024 * 1024) throw new Error('Compressed data too large')
  const parts = chunks.map(base64Bytes), length = parts.reduce((n, c) => n + c.length, 0)
  if (length > 5 * 1024 * 1024) throw new Error('Compressed data too large')
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const part of parts) { bytes.set(part, offset); offset += part.length }
  if (length < 18) throw new Error('Invalid gzip data')
  const expanded = new DataView(bytes.buffer).getUint32(length - 4, true)
  if (expanded > 4 * 1024 * 1024) throw new Error('Expanded data too large')
  return gunzipSync(bytes, { out: new Uint8Array(expanded) })
}
export function decodeGzipJson(data) { return JSON.parse(strFromU8(decodeGzipChunks(data))) }
