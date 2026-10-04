/**
 * Loads the dsh-pv renderer's data and art. Since 0.9.0 they are not bundled with the plugin: they come
 * from an MV pack's canvas.assets (the "world.execute(me); dsh PV" workshop pack), read through the Host's
 * packRead (role "asset"; only files the manifest names), or with a custom reader (preview harness).
 * A reader maps an asset name to a list of byte arrays (JSON shards, merged in order) or null.
 */
import { unwrapRemote } from '../../remote-state.mjs'

export const DSHPV_DATA = ['timeline', 'chat', 'band']
export const DSHPV_ART = ['maid-left', ...['cheerful', 'starry', 'shy', 'serious', 'confused', 'frightened', 'angry', 'exasperated'].map(n => `whale-${n}`)]
const CHUNK = 512 * 1024

const fromBase64 = b64 => { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out }
const join = parts => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { out.set(p, at); at += p.length } return out }

/** True when a pack names everything the dsh-pv renderer needs. */
export const hasDshPvAssets = pack => DSHPV_DATA.every(name => pack?.pack?.canvas?.assets?.[name] !== undefined)

/** Reader over the Host for one loaded pack (its manifest decides which files exist). */
export function packAssetReader(api, manifestPath, pack) {
  return async name => {
    const value = pack?.canvas?.assets?.[name]
    if (value === undefined) return null
    const count = Array.isArray(value) ? value.length : 1
    const files = []
    for (let part = 0; part < count; part++) {
      const parts = []
      let offset = 0
      for (;;) {
        const chunk = unwrapRemote(await api.packRead({ manifestPath, role: 'asset', asset: name, part, offset, length: CHUNK }), `无法读取 MV 包资源 ${name}。`)
        if (chunk.bytes > 0) parts.push(fromBase64(chunk.base64))
        offset += chunk.bytes
        if (chunk.done || !chunk.bytes) break
      }
      files.push(join(parts))
    }
    return files
  }
}

/** Merge JSON shards: arrays are concatenated, other keys are taken from the first shard that has them. */
export function mergeShards(shards) {
  const out = {}
  for (const shard of shards) {
    for (const [key, value] of Object.entries(shard ?? {})) {
      if (Array.isArray(value) && Array.isArray(out[key])) out[key] = out[key].concat(value)
      else if (!(key in out)) out[key] = value
    }
  }
  return out
}

async function toImage(bytes) {
  const blob = new Blob([bytes], { type: 'image/webp' })
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try { const img = new Image(); img.src = url; await img.decode(); return img } finally { URL.revokeObjectURL(url) }
}

const asList = value => (value == null ? null : Array.isArray(value) ? value : [value])

/** -> { timeline, chat, band, art: { name: ImageBitmap }, missingArt: [] } */
export async function loadDshPv(read) {
  const dec = new TextDecoder()
  const [timeline, chat, band] = await Promise.all(DSHPV_DATA.map(async name => {
    const files = asList(await read(name))
    if (!files?.length) throw new Error(`缺少 dsh-pv 资源 ${name}`)
    return mergeShards(files.map(bytes => JSON.parse(dec.decode(bytes))))
  }))
  const art = {}, missingArt = []
  await Promise.all(DSHPV_ART.map(async name => {
    try { const files = asList(await read(name)); if (files?.[0]) art[name] = await toImage(files[0]); else missingArt.push(name) } catch { missingArt.push(name) }
  }))
  return { timeline, chat, band, art, missingArt }
}

/**
 * canvas.assets for a scene script (0.9.1): JSON files parsed (shards merged),
 * images decoded to ImageBitmap when the script paints pixels (otherwise left out).
 * -> { assets: { name: value }, transfer: [ImageBitmap…] }
 */
export async function loadSceneAssets(read, pack, { images = false } = {}) {
  const dec = new TextDecoder()
  const assets = {}, transfer = []
  for (const [name, value] of Object.entries(pack?.canvas?.assets ?? {})) {
    const paths = asList(value) ?? []
    const isJson = paths.every(p => /\.json$/i.test(p))
    if (!isJson && !images) continue
    const files = asList(await read(name)) ?? []
    if (!files.length) continue
    if (isJson) assets[name] = files.length === 1 ? JSON.parse(dec.decode(files[0])) : mergeShards(files.map(bytes => JSON.parse(dec.decode(bytes))))
    else if (typeof createImageBitmap === 'function') {
      const type = /\.png$/i.test(paths[0]) ? 'image/png' : 'image/webp'
      const bitmap = await createImageBitmap(new Blob([files[0]], { type }))
      assets[name] = bitmap; transfer.push(bitmap)
    }
  }
  return { assets, transfer }
}

