/** Optional dsh-pv OFL fonts. Local bytes only; family, face and weight never come from pack data. */
import { checkDshPvFont, DSHPV_FONT_ASSETS, DSHPV_FONT_LIMITS } from '../../../shared/mv-pack.mjs'

export const DSHPV_FONT_FAMILIES = Object.freeze({ head: 'DshMvPvSpaceMono', banner: 'DshMvPvAnton' })

// A document's FontFaceSet owns its faces. Identical concurrent loads share a
// face; each consumer releases one reference. Different bytes for the same
// fixed family cannot race and silently change another player's typography.
const documents = new WeakMap()
const sameBytes = (a, b) => a.byteLength === b.byteLength && a.every((value, i) => value === b[i])
const fail = message => { throw new Error(`dsh-pv fonts：${message}`) }

function release(entry) {
  if (entry.refs > 0) entry.refs--
  if (entry.refs !== 0) return
  if (entry.cache.get(entry.family) === entry) entry.cache.delete(entry.family)
  if (entry.registered) {
    entry.registered = false
    try { entry.fontSet.delete(entry.face) } catch { /* already detached */ }
  }
}

async function acquire(bytes, descriptor, fontSet, FontFaceClass) {
  let cache = documents.get(fontSet)
  if (!cache) { cache = new Map(); documents.set(fontSet, cache) }
  let entry = cache.get(descriptor.family)
  if (entry) {
    if (!sameBytes(entry.bytes, bytes)) fail(`${descriptor.family} 已被另一份不同字节的字体占用；请关闭原包后再加载`)
    entry.refs++
  } else {
    // Copy before handing it to a browser API so a preview reader cannot later
    // mutate the cached identity or a face which is still loading.
    const copy = new Uint8Array(bytes)
    const face = new FontFaceClass(descriptor.family, copy.buffer, { style: 'normal', weight: descriptor.weight, display: 'block' })
    entry = { bytes: copy, family: descriptor.family, face, fontSet, cache, refs: 1, registered: false, promise: null }
    cache.set(descriptor.family, entry)
    entry.promise = Promise.resolve().then(() => face.load()).then(() => {
      fontSet.add(face)
      entry.registered = true
      return entry
    }).catch(error => {
      if (cache.get(entry.family) === entry) cache.delete(entry.family)
      throw error
    })
  }
  try { return await entry.promise } catch (error) { release(entry); throw error }
}

/**
 * read(name, {maxBytes}) is a packAssetReader or a data-only preview reader.
 * null/undefined means an optional face was not declared (old packs keep their
 * local/system fallbacks). A declared but unreadable/invalid face is an error.
 * -> { families: { head?, banner? }, dispose() }; dispose is idempotent.
 */
export async function loadDshPvFonts(read, { FontFaceClass = globalThis.FontFace, fontSet = globalThis.document?.fonts } = {}) {
  if (typeof read !== 'function') fail('缺少包内字体读取器')
  const sources = await Promise.all(Object.entries(DSHPV_FONT_ASSETS).map(async ([name, descriptor]) => {
    let files
    try { files = await read(name, { maxBytes: DSHPV_FONT_LIMITS.fileBytes }) } catch (error) { fail(`${name} 无法读取：${error?.message ?? error}`) }
    if (files == null) return null
    if (!Array.isArray(files) || files.length !== 1) fail(`${name} 必须是单个 TTF 字体文件，不能使用分片`)
    const value = files[0]
    const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : null
    const checked = checkDshPvFont(bytes, name)
    if (checked.errors.length) fail(checked.errors.join('；'))
    return { name, descriptor, bytes }
  }))
  const declared = sources.filter(Boolean)
  const entries = [], families = {}
  if (declared.length && (typeof FontFaceClass !== 'function' || !fontSet || typeof fontSet.add !== 'function' || typeof fontSet.delete !== 'function')) fail('当前浏览器不能加载随包 TTF 字体（FontFace / document.fonts 不可用）')
  try {
    for (const source of declared) {
      try { entries.push(await acquire(source.bytes, source.descriptor, fontSet, FontFaceClass)) } catch (error) { fail(`${source.name} 加载失败：${error?.message ?? error}`) }
      families[source.name === 'font-head' ? 'head' : 'banner'] = source.descriptor.family
    }
  } catch (error) { for (const entry of entries) release(entry); throw error }
  let disposed = false
  return {
    families: Object.freeze(families),
    dispose() { if (disposed) return; disposed = true; for (const entry of entries) release(entry) },
  }
}
