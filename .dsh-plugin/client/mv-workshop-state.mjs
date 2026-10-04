/**
 * Client side of the MV 创意工坊: Host calls, the per-pack media slots for the
 * user's own audio / lyrics, audio fingerprinting and lyric re-timing.
 */
import { CLIENT_VERSION, unwrapRemote } from './remote-state.mjs'
import { decodeToChannels, sha256Hex } from './mv-wav.mjs'
import { PRESET_PACKS, audioMatch, compareVersions, encodeFingerprint, energyFingerprint, retimeCues } from '../shared/mv-workshop.mjs'

export const loadWorkshop = async (api, refresh = false) => unwrapRemote(await api.workshopIndex({ refresh }), '无法读取创意工坊。')
export const installWorkshopPack = async (api, id) => unwrapRemote(await api.workshopInstall({ id }), '安装失败。')
export const uninstallWorkshopPack = async (api, id) => unwrapRemote(await api.workshopUninstall({ id }), '卸载失败。')
export const workshopCover = async (api, id) => unwrapRemote(await api.workshopCover({ id }), '')
export const publishWorkshopPack = async (api, request) => unwrapRemote(await api.workshopPublish(request), '无法准备发布。')

/** { [id]: installed record } and update flags. */
export function installedState(index) {
  const map = Object.fromEntries((index?.installed ?? []).map(item => [item.id, item]))
  const updates = new Set((index?.packs ?? []).filter(p => map[p.id] && compareVersions(p.version, map[p.id].version) > 0).map(p => p.id))
  return { map, updates }
}

/** IndexedDB slot for the user's media of a workshop pack (local packs bring their own files). */
export function mediaSlot(pack, kind) {
  const id = pack?.pack?.workshop?.id
  return id && !pack?.pack?.audio ? `workshop:${id}:${kind}` : null
}

/** Workshop packs that replaced the 0.8.x built-in presets reuse the files picked for those presets ('audio' / 'lyrics' / 'spectrum'). */
export const legacyPresetSlot = pack => PRESET_PACKS.some(p => p.id === pack?.pack?.workshop?.id)

/** Duration and energy fingerprint of an audio file's bytes (decoded locally; nothing leaves the panel). */
export async function fingerprintAudio(bytes, decode = decodeToChannels) {
  const { channels, sampleRate, duration } = await decode(bytes)
  const [a, b] = channels
  const mono = new Float32Array(a.length)
  for (let i = 0; i < a.length; i++) mono[i] = (a[i] + b[i]) / 2
  const fingerprint = energyFingerprint(mono, sampleRate)
  return { duration, fingerprint, base64: encodeFingerprint(fingerprint) }
}

/** Compare the user's audio with what the workshop pack was made for. */
export function checkAudioForPack(workshop, actual) {
  return audioMatch({ duration: workshop?.audio?.duration, fingerprint: workshop?.audio?.fingerprint?.values }, actual)
}

const encoder = new TextEncoder()
export const lineHash = async text => (await sha256Hex(encoder.encode(text))).slice(0, 16)

/** Re-time the user's own cues with the pack's lyrics.timing.json. */
export const retimeWithPack = (cues, timing, hash = lineHash) => retimeCues(cues, timing, hash)

/** "3:31" for seconds. */
export const durationText = s => { if (!(Number.isFinite(s) && s > 0)) return '—'; const r = Math.round(s); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}` }
export const sizeText = n => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

// 0.9.1: the install folder (shown and changed from the workshop page).
export const workshopDirInfo = async api => unwrapRemote(await api.workshopDirInfo({}), '无法读取安装位置。')
export const setWorkshopDir = async (api, request) => unwrapRemote(await api.workshopDirSet(request), '无法更改安装位置。')
export const moveWorkshopPack = async (api, id) => unwrapRemote(await api.workshopDirMove({ id }), '移动失败。')
export const openWorkshopDir = async api => unwrapRemote(await api.workshopDirOpen({}), '无法打开文件夹。')

/** Move packs one by one; onProgress({ done, total, id, error? }). Returns { moved, failed }. */
export async function moveWorkshopPacks(api, ids, onProgress = () => {}) {
  const moved = [], failed = []
  for (const [i, id] of ids.entries()) {
    onProgress({ done: i, total: ids.length, id })
    try { const result = await moveWorkshopPack(api, id); moved.push(result); if (result.warning) failed.push({ id, error: result.warning, copied: true }) }
    catch (error) { failed.push({ id, error: error?.message ?? String(error) }) }
  }
  onProgress({ done: ids.length, total: ids.length, id: '' })
  return { moved, failed }
}

/** The pack needs a newer plugin than this one (index "requires"). */
export const tooOld = (pack, version = CLIENT_VERSION) => Boolean(pack?.requires && version && compareVersions(version, pack.requires) < 0)
