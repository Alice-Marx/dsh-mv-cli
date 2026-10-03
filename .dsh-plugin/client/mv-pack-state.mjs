/**
 * Framework-free MV pack logic of the panel: the built-in preset, recently
 * used packs (localStorage), Host calls, chunked audio download, the folder
 * picker and a store-only zip writer for the template fallback download.
 */
import { unwrapRemote } from './remote-state.mjs'
import { MV_PACK_LIMITS, packSummary, parseManifestPath } from '../shared/mv-pack.mjs'
import { TEMPLATE_FOLDER, templateFiles } from '../shared/mv-pack-template.mjs'
import { audioMimeOf, sniffAudio } from '../shared/mv-audio-protocol.mjs'

export const RECENT_KEY = 'dsh-mv.packs.recent.v1'
export const ACTIVE_KEY = 'dsh-mv.packs.active.v1'
export const BUILTIN_ID = 'builtin:world-execute-me'

/** The built-in world.execute(me) preset: your own files picked in the panel. */
export const BUILTIN_PACK = Object.freeze({
  id: BUILTIN_ID,
  builtin: true,
  pack: Object.freeze({
    title: 'world.execute(me);', artist: 'Mili',
    credits: ['Song and lyrics © Mili', 'Scenes: yym8224961/world.execute-me-ascii (野生大K), ported with permission'],
    canvas: Object.freeze({ renderer: 'world-execute-me' }),
  }),
})

export const DSH_PV_ID = 'builtin:dsh-pv'

/**
 * The built-in dsh-pv preset: MisakaZentai's world.execute(me) PV
 * (world-execute-me-dsh-pv) ported to a real-time canvas renderer. Same song,
 * so it shares the audio and lyric files you picked for the other preset.
 */
export const DSH_PV_PACK = Object.freeze({
  id: DSH_PV_ID,
  builtin: true,
  pack: Object.freeze({
    title: 'world.execute(me); dsh PV', artist: 'Mili',
    credits: [
      'Song and lyrics © Mili',
      'PV: MisakaZentai / world-execute-me-dsh-pv (code MIT), ported to a real-time canvas renderer',
      'Whale-girl artwork CC BY-NC-SA 4.0: 溟月 © 上善无形 → maid design ZipZipPipe → sprite Small-tailqwq / dsh-deep-whale → expressions dsh-whale-galgame (adapted)',
    ],
    duration: 211.913,
    canvas: Object.freeze({ renderer: 'dsh-pv' }),
  }),
})

/** Built-in presets by id. */
export const BUILTINS = Object.freeze({ [BUILTIN_ID]: BUILTIN_PACK, [DSH_PV_ID]: DSH_PV_PACK })

export function loadRecent(storage = globalThis.localStorage) {
  try {
    const list = JSON.parse(storage?.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(list) ? list.filter(item => typeof item?.manifestPath === 'string').slice(0, MV_PACK_LIMITS.recentPacks) : []
  } catch { return [] }
}

function saveRecent(list, storage) {
  try { storage?.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MV_PACK_LIMITS.recentPacks))) } catch { /* private mode */ }
}

/** Move a loaded pack to the front of the recent list. */
export function rememberPack(loaded, { storage = globalThis.localStorage, now = Date.now } = {}) {
  const entry = { manifestPath: loaded.manifestPath, title: loaded.pack.title, artist: loaded.pack.artist ?? '', usedAt: now() }
  const list = [entry, ...loadRecent(storage).filter(item => item.manifestPath.toLowerCase() !== entry.manifestPath.toLowerCase())]
  saveRecent(list, storage)
  return list.slice(0, MV_PACK_LIMITS.recentPacks)
}

export function forgetPack(manifestPath, storage = globalThis.localStorage) {
  const list = loadRecent(storage).filter(item => item.manifestPath !== manifestPath)
  saveRecent(list, storage)
  return list
}

export function loadActive(storage = globalThis.localStorage) {
  try { return storage?.getItem(ACTIVE_KEY) || BUILTIN_ID } catch { return BUILTIN_ID }
}
export function saveActive(id, storage = globalThis.localStorage) {
  try { storage?.setItem(ACTIVE_KEY, id) } catch { /* ignore */ }
}

export const recentLabel = item => `${packSummary({ title: item.title, artist: item.artist }) || item.manifestPath}`

/** Ask the Host to read and check a pack. Nothing runs. */
export async function loadPackFromHost(api, path) {
  const manifestPath = parseManifestPath(path)
  const loaded = unwrapRemote(await api.packLoad({ path: manifestPath }), '无法读取 MV 包。')
  if (!loaded?.pack || typeof loaded.manifestPath !== 'string') throw new Error('MV 包读取结果格式无效。')
  return { id: `pack:${loaded.manifestPath}`, loadedAt: Date.now(), ...loaded }
}

const fromBase64 = text => {
  const binary = globalThis.atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** MIME type from the content (never from the file extension). */
export const audioMime = bytes => audioMimeOf(sniffAudio(bytes ?? new Uint8Array(0)))

/** Read one pack file from the Host in chunks; returns { name, parts: Uint8Array[] }. */
export async function fetchPackBytes(api, manifestPath, role, { onProgress = () => {}, isCancelled = () => false, decode = fromBase64 } = {}) {
  const parts = []
  let offset = 0, name = role, size = 0
  for (;;) {
    if (isCancelled()) throw new Error('cancelled')
    const chunk = unwrapRemote(await api.packRead({ manifestPath, role, offset, length: MV_PACK_LIMITS.readChunkBytes }), `无法读取 MV 包的 ${role} 文件。`)
    name = chunk.name ?? name; size = chunk.size ?? size
    if (chunk.bytes > 0) parts.push(decode(chunk.base64))
    offset += chunk.bytes
    onProgress(offset, size)
    if (chunk.done || chunk.bytes === 0) break
  }
  return { name, parts }
}

/** The pack's audio as a File (for the <audio> element and its sha256). */
export async function fetchPackAudio(api, manifestPath, { FileClass = globalThis.File, ...options } = {}) {
  const { name, parts } = await fetchPackBytes(api, manifestPath, 'audio', options)
  return new FileClass(parts, name, { type: audioMime(parts[0]) })
}

/** The pack's lyrics or spectrum file as text. */
export async function fetchPackText(api, manifestPath, role, options = {}) {
  const { name, parts } = await fetchPackBytes(api, manifestPath, role, options)
  const total = parts.reduce((n, part) => n + part.length, 0)
  const bytes = new Uint8Array(total)
  let at = 0
  for (const part of parts) { bytes.set(part, at); at += part.length }
  return { name, text: new TextDecoder('utf-8').decode(bytes) }
}

/** Native folder chooser of the Harness desktop shell, or null when unavailable. */
export function directoryPicker(scope = globalThis) {
  const picker = scope.__DSH_DIRECTORY_PICKER__
  return typeof picker?.pick === 'function' ? () => picker.pick() : null
}

// ---- store-only zip (template fallback download) ------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0 }
  return table
})()

export function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** Zip [{ path, text }] without compression (UTF-8 names). Returns a Uint8Array. */
export function zipFiles(files, { date = new Date(2026, 9, 3) } = {}) {
  const encoder = new TextEncoder()
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  const locals = [], centrals = []
  let offset = 0
  for (const file of files) {
    const name = encoder.encode(file.path)
    const data = typeof file.text === 'string' ? encoder.encode(file.text) : file.bytes
    const crc = crc32(data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true)
    local.setUint16(8, 0, true); local.setUint16(10, time, true); local.setUint16(12, day, true)
    local.setUint32(14, crc, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true)
    local.setUint16(26, name.length, true); local.setUint16(28, 0, true)
    const central = new DataView(new ArrayBuffer(46))
    central.setUint32(0, 0x02014b50, true); central.setUint16(4, 20, true); central.setUint16(6, 20, true); central.setUint16(8, 0x0800, true)
    central.setUint16(10, 0, true); central.setUint16(12, time, true); central.setUint16(14, day, true)
    central.setUint32(16, crc, true); central.setUint32(20, data.length, true); central.setUint32(24, data.length, true)
    central.setUint16(28, name.length, true); central.setUint32(42, offset, true)
    locals.push(new Uint8Array(local.buffer), name, data)
    centrals.push(new Uint8Array(central.buffer), name)
    offset += 30 + name.length + data.length
  }
  const centralSize = centrals.reduce((n, part) => n + part.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true); end.setUint32(16, offset, true)
  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)]
  const out = new Uint8Array(parts.reduce((n, part) => n + part.length, 0))
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.length }
  return out
}

export const templateZip = () => zipFiles(templateFiles().map(file => ({ path: `${TEMPLATE_FOLDER}/${file.path}`, text: file.text })))
export const TEMPLATE_ZIP_NAME = `${TEMPLATE_FOLDER}.zip`
