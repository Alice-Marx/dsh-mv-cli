/**
 * Client side of the MV 创意工坊: Host calls, the per-pack media slots for the
 * user's own audio / lyrics, audio fingerprinting and lyric re-timing.
 */
import { unwrapRemote } from './remote-state.mjs'
import { decodeToChannels, sha256Hex } from './mv-wav.mjs'
import { audioMatch, compareVersions, encodeFingerprint, energyFingerprint, retimeCues } from '../shared/mv-workshop.mjs'

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

/** IndexedDB slot for the user's media of a pack: builtin presets share 'audio'/'lyrics', workshop packs get their own. */
export function mediaSlot(pack, kind) {
  if (pack?.builtin) return kind
  const id = pack?.pack?.workshop?.id
  return id && !pack?.pack?.audio ? `workshop:${id}:${kind}` : null
}

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
