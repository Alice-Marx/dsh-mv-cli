/**
 * The dsh-pv canvas preset's files, served read-only by the Host in 1 MiB
 * base64 chunks (same shape as analysisRead). Only the names below can be
 * read; nothing else under the plugin directory is reachable.
 *
 *   assets/dsh-pv/      MIT data ported from MisakaZentai/world-execute-me-dsh-pv
 *   assets/dsh-pv-art/  whale-girl artwork, CC BY-NC-SA 4.0 (see its NOTICE.md)
 */
import { open } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

export const DSHPV_EXPRESSIONS = Object.freeze(['cheerful', 'starry', 'shy', 'serious', 'confused', 'frightened', 'angry', 'exasperated'])

export const DSHPV_ASSETS = Object.freeze({
  timeline: 'dsh-pv/timeline.json',
  chat: 'dsh-pv/chat.json',
  band: 'dsh-pv/band.json',
  'maid-left': 'dsh-pv-art/maid-left.webp',
  ...Object.fromEntries(DSHPV_EXPRESSIONS.map(name => [`whale-${name}`, `dsh-pv-art/whale-${name}.webp`])),
})

export const DSHPV_CHUNK = 1024 * 1024
const ASSET_ROOT = fileURLToPath(new URL('../assets/', import.meta.url))
const fail = message => { throw new TypeError(message) }

export function parseDshPvAsset(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('dshpvAsset must be an object')
  const extra = Object.keys(value).filter(k => !['name', 'offset'].includes(k))
  if (extra.length) fail(`dshpvAsset: unexpected fields: ${extra.join(', ')}`)
  if (typeof value.name !== 'string' || !Object.hasOwn(DSHPV_ASSETS, value.name)) fail(`name must be one of ${Object.keys(DSHPV_ASSETS).join(', ')}`)
  const offset = value.offset ?? 0
  if (!Number.isInteger(offset) || offset < 0) fail('offset must be a non-negative integer')
  return { name: value.name, offset }
}

export async function readDshPvAsset({ name, offset }, root = ASSET_ROOT) {
  const path = join(root, ...DSHPV_ASSETS[name].split('/'))
  let handle
  try { handle = await open(path, 'r') } catch (error) {
    if (error?.code === 'ENOENT') return { exists: false, name, size: 0, offset, bytes: 0, done: true, base64: '' }
    throw error
  }
  try {
    const { size } = await handle.stat()
    const want = Math.max(0, Math.min(DSHPV_CHUNK, size - offset))
    const buffer = Buffer.alloc(want)
    const { bytesRead } = want ? await handle.read(buffer, 0, want, offset) : { bytesRead: 0 }
    return { exists: true, name, size, offset, bytes: bytesRead, done: offset + bytesRead >= size, base64: buffer.subarray(0, bytesRead).toString('base64') }
  } finally { await handle.close() }
}
