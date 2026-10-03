/**
 * Loads the dsh-pv preset's files: through the Host (api.dshpvAsset, 1 MiB base64 chunks) in the panel,
 * or with a custom reader (the preview harness reads them over HTTP).
 */
import { unwrapRemote } from '../../remote-state.mjs'

export const DSHPV_DATA = ['timeline', 'chat', 'band']
export const DSHPV_ART = ['maid-left', ...['cheerful', 'starry', 'shy', 'serious', 'confused', 'frightened', 'angry', 'exasperated'].map(n => `whale-${n}`)]

const fromBase64 = b64 => { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out }

export function hostReader(api) {
  return async name => {
    const parts = []
    let offset = 0
    for (;;) {
      const chunk = unwrapRemote(await api.dshpvAsset({ name, offset }), `无法读取 dsh-pv 资源 ${name}。`)
      if (!chunk.exists) return null
      parts.push(fromBase64(chunk.base64))
      offset += chunk.bytes
      if (chunk.done || !chunk.bytes) break
    }
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
    let at = 0
    for (const p of parts) { out.set(p, at); at += p.length }
    return out
  }
}

async function toImage(bytes) {
  const blob = new Blob([bytes], { type: 'image/webp' })
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob)
  const url = URL.createObjectURL(blob)
  try { const img = new Image(); img.src = url; await img.decode(); return img } finally { URL.revokeObjectURL(url) }
}

/** -> { timeline, chat, band, art: { name: ImageBitmap }, missingArt: [] } */
export async function loadDshPv(read) {
  const dec = new TextDecoder()
  const [timeline, chat, band] = await Promise.all(DSHPV_DATA.map(async name => {
    const bytes = await read(name)
    if (!bytes) throw new Error(`缺少 dsh-pv 资源 ${name}.json`)
    return JSON.parse(dec.decode(bytes))
  }))
  const art = {}, missingArt = []
  await Promise.all(DSHPV_ART.map(async name => {
    try { const bytes = await read(name); if (bytes) art[name] = await toImage(bytes); else missingArt.push(name) } catch { missingArt.push(name) }
  }))
  return { timeline, chat, band, art, missingArt }
}
