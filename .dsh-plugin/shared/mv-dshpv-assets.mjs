/**
 * Host side of dshpvAsset: read-only 1 MiB base64 chunks (same shape as analysisRead) of the files named in
 * mv-dshpv-protocol.mjs. Nothing else under the plugin directory is reachable.
 */
import { open } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { DSHPV_ASSETS, DSHPV_CHUNK } from './mv-dshpv-protocol.mjs'

export { DSHPV_ASSETS, DSHPV_CHUNK, DSHPV_EXPRESSIONS, parseDshPvAsset } from './mv-dshpv-protocol.mjs'

export const ASSET_ROOT = fileURLToPath(new URL('../assets/', import.meta.url))

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
