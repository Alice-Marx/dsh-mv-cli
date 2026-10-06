/**
 * Loads the dsh-pv renderer's data and art. Since 0.9.0 they are not bundled with the plugin: they come
 * from an MV pack's canvas.assets (the "world.execute(me); dsh PV" workshop pack), read through the Host's
 * packRead (role "asset"; only files the manifest names), or with a custom reader (preview harness).
 * A reader maps an asset name to a list of byte arrays (JSON shards, merged in order) or null.
 */
import { unwrapRemote } from '../../remote-state.mjs'
import { MV_PACK_LIMITS } from '../../../shared/mv-pack.mjs'
import { DSHPV_RASTER_LIMITS, rasterImageDimensions, validateRasterAtlases, validateRasterTimeline } from './raster.mjs'

export const DSHPV_DATA = ['timeline', 'chat', 'band']
export const DSHPV_ART = ['maid-left', ...['cheerful', 'starry', 'shy', 'serious', 'confused', 'frightened', 'angry', 'exasperated'].map(n => `whale-${n}`)]
const CHUNK = 512 * 1024

const fromBase64 = b64 => { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out }
const join = parts => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { out.set(p, at); at += p.length } return out }

/** True when a pack names everything the dsh-pv renderer needs. */
export const hasDshPvAssets = pack => DSHPV_DATA.every(name => pack?.pack?.canvas?.assets?.[name] !== undefined)

/** Reader over the Host for one loaded pack (its manifest decides which files exist). */
export function packAssetReader(api, manifestPath, pack) {
  return async (name, { maxBytes = MV_PACK_LIMITS.assetBytes } = {}) => {
    const value = pack?.canvas?.assets?.[name]
    if (value === undefined) return null
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MV_PACK_LIMITS.assetBytes) throw new Error(`MV 包资源 ${name} 的读取大小限制无效。`)
    const count = Array.isArray(value) ? value.length : 1
    const files = []
    for (let part = 0; part < count; part++) {
      const parts = []
      let offset = 0
      for (;;) {
        const chunk = unwrapRemote(await api.packRead({ manifestPath, role: 'asset', asset: name, part, offset, length: CHUNK }), `无法读取 MV 包资源 ${name}。`)
        if (!Number.isSafeInteger(chunk.bytes) || chunk.bytes < 0 || chunk.bytes > CHUNK || offset + chunk.bytes > maxBytes) throw new Error(`MV 包资源 ${name} 超过 ${Math.round(maxBytes / 1024)} KiB 读取限制。`)
        if (chunk.bytes > 0) {
          if (typeof chunk.base64 !== 'string' || chunk.base64.length > 4 * Math.ceil(chunk.bytes / 3)) throw new Error(`MV 包资源 ${name} 的返回编码长度无效。`)
          const bytes = fromBase64(chunk.base64)
          if (bytes.byteLength !== chunk.bytes) throw new Error(`MV 包资源 ${name} 的返回字节长度不一致。`)
          parts.push(bytes)
        }
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
  const blob = new Blob([bytes], { type: bytes[0] === 137 && bytes[1] === 80 ? 'image/png' : 'image/webp' })
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try { const img = new Image(); img.src = url; await img.decode(); return img } finally { URL.revokeObjectURL(url) }
}

const asList = value => (value == null ? null : Array.isArray(value) ? value : [value])

const disposedImages = new WeakSet()

/** Closes decoded art and optional raster atlases once, on cancellation, reload or failure. */
export function disposeDshPvData(data) {
  for (const image of [...Object.values(data?.art ?? {}), ...(data?.raster?.atlases ?? [])]) {
    if (!image || typeof image !== 'object' || disposedImages.has(image)) continue
    disposedImages.add(image)
    try { image.close?.() } catch { /* already transferred or closed */ }
  }
}

function parseRasterShards(files, dec) {
  if (!files.length || files.length > 16 || files.reduce((n, bytes) => n + bytes.byteLength, 0) > DSHPV_RASTER_LIMITS.jsonBytes) throw new Error('dsh-pv raster：时间轴文件数量或大小无效')
  const shards = files.map(bytes => JSON.parse(dec.decode(bytes)))
  for (const shard of shards) {
    if (!shard || typeof shard !== 'object' || Array.isArray(shard) || Object.keys(shard).some(key => !['version', 'size', 'frames'].includes(key))) throw new Error('dsh-pv raster：时间轴分片有未知字段')
    if (shard.version !== undefined && shard.version !== 1 || shard.size !== undefined && (!Array.isArray(shard.size) || shard.size.length !== 2 || shard.size[0] !== 1280 || shard.size[1] !== 720) || shard.frames !== undefined && !Array.isArray(shard.frames)) throw new Error('dsh-pv raster：时间轴分片无效')
  }
  return validateRasterTimeline(mergeShards(shards))
}

/** -> { timeline, chat, band, art, missingArt, raster? }. Undeclared raster data remains optional. */
export async function loadDshPv(read, { decodeImage = toImage } = {}) {
  const dec = new TextDecoder()
  const [timeline, chat, band] = await Promise.all(DSHPV_DATA.map(async name => {
    const files = asList(await read(name))
    if (!files?.length) throw new Error(`缺少 dsh-pv 资源 ${name}`)
    return mergeShards(files.map(bytes => JSON.parse(dec.decode(bytes))))
  }))
  const data = { timeline, chat, band, art: {}, missingArt: [] }
  try {
    const descriptor = asList(await read('raster-timeline'))
    const raster = descriptor === null ? null : parseRasterShards(descriptor, dec)
    let atlasFiles = null, dimensions = null
    if (raster) {
      atlasFiles = asList(await read('raster-atlas'))
      if (!atlasFiles?.length || atlasFiles.length > DSHPV_RASTER_LIMITS.atlases) throw new Error('dsh-pv raster：缺少图集或图集数量过多')
      dimensions = atlasFiles.map(rasterImageDimensions)
      // Validate all dimensions, total decoded pixels and crops before allocating any image.
      validateRasterAtlases(raster, dimensions)
    }
    await Promise.all(DSHPV_ART.map(async name => {
      try { const files = asList(await read(name)); if (files?.[0]) data.art[name] = await decodeImage(files[0]); else data.missingArt.push(name) } catch { data.missingArt.push(name) }
    }))
    if (raster) {
      data.raster = { ...raster, atlases: [] }
      for (let i = 0; i < atlasFiles.length; i++) {
        const image = await decodeImage(atlasFiles[i])
        data.raster.atlases.push(image)
        if (image?.width !== dimensions[i].width || image?.height !== dimensions[i].height) throw new Error('dsh-pv raster：解码后的图集尺寸不匹配')
      }
      data.raster = validateRasterAtlases(raster, data.raster.atlases)
    }
    return data
  } catch (error) { disposeDshPvData(data); throw error }
}

/**
 * canvas.assets for a scene script (0.9.1): JSON files parsed (shards merged),
 * images decoded to ImageBitmap for bitmap outputs (pixels / webgl).
 * -> { assets: { name: value }, transfer: [ImageBitmap…] }
 */
export async function loadSceneAssets(read, pack, { images = false } = {}) {
  const dec = new TextDecoder()
  const assets = {}, transfer = []
  try { for (const [name, value] of Object.entries(pack?.canvas?.assets ?? {})) {
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
  } } catch (error) { disposeSceneAssets({ transfer }); throw error }
  return { assets, transfer }
}

/** Dispose decoded assets if loading is cancelled before they reach the worker. */
export function disposeSceneAssets({ transfer = [] } = {}) {
  for (const bitmap of transfer) { try { bitmap?.close?.() } catch { /* transferred or already closed */ } }
}

