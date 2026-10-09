/**
 * Pure validation and catalogue selection for trusted community responses.
 * `authenticated` and award fields describe that response; parsing establishes
 * neither identity authentication nor an award calculation. Account integration
 * was cancelled: the client always discards reserved viewer/personal-like fields.
 * No telemetry, vote transport, grants, sessions, identifiers, authentication,
 * network calls or thresholds live here. A future anonymous service needs its
 * own explicitly defined privacy, idempotency and abuse controls.
 */
import { compareVersions, filterWorkshop, ID_PATTERN, VERSION_PATTERN, WORKSHOP_LIMITS } from './mv-workshop.mjs'

const SNAPSHOT_KEYS = ['status', 'fetchedAt', 'viewer', 'packs', 'policy']
const METRIC_KEYS = ['downloadCount', 'uniqueDownloadUsers', 'likeCount', 'likedByViewer', 'popularityScore', 'acclaimed']
const COUNTER_KEYS = ['downloadCount', 'uniqueDownloadUsers', 'likeCount']
const SELECTOR_KEYS = ['query', 'license', 'renderer', 'installed', 'installation', 'updates', 'lyrics', 'tag', 'compatibleOnly', 'clientVersion', 'onlyAcclaimed', 'sort']
const CONTROL_TEXT = /[\u0000-\u001f\u007f]/
const ISO_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/

function invalid(field) { throw new TypeError(`Invalid workshop community ${field}`) }

/** Admit JSON records only; reject private extras and accessor-backed values. */
function record(value, field, allowed = null) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) invalid(field)
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) invalid(field)
  const fields = Object.create(null)
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (typeof key !== 'string' || !descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')
      || allowed !== null && !allowed.includes(key)) invalid(`${field} fields`)
    fields[key] = descriptor.value
  }
  return fields
}

function text(value, field, limit) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit || CONTROL_TEXT.test(value)) invalid(field)
  return value
}

function choice(value, values, field) {
  if (!values.includes(value)) invalid(field)
  return value
}

function number(value, field, integer) {
  if (value == null) return null
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || integer && !Number.isSafeInteger(value)) invalid(field)
  return value === 0 ? 0 : value
}

/** Validate calendar components before normalizing an explicit ISO timezone. */
function timestamp(value, field) {
  if (typeof value !== 'string' || value.length > 29) invalid(field)
  const match = ISO_TIME.exec(value)
  if (match === null) invalid(field)
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zone] = match
  const year = Number(yearText), month = Number(monthText), day = Number(dayText)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]
    || Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText) > 59
    || zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) invalid(field)
  const time = Date.parse(value)
  if (!Number.isFinite(time)) invalid(field)
  const iso = new Date(time).toISOString()
  if (!/^\d{4}-/.test(iso) || iso.startsWith('0000-')) invalid(field)
  return iso
}

/**
 * Parse a bounded community projection, preserving unknown metrics as null.
 * Unknown fields, malformed numbers and awards without their declared policy
 * reject the entire response. This function does not verify a response's issuer.
 * @param value - already decoded JSON from a trusted response or local fixture.
 * @returns a fresh snapshot containing only the documented public fields.
 */
export function parseWorkshopCommunitySnapshot(value) {
  const input = record(value, 'snapshot', SNAPSHOT_KEYS)
  const status = choice(input.status, ['ready', 'stale', 'unavailable', 'offline'], 'status')
  const fetchedAt = input.fetchedAt == null ? null : timestamp(input.fetchedAt, 'fetchedAt')
  if (['ready', 'stale'].includes(status) && fetchedAt === null) invalid('fetchedAt')
  const rawViewer = record(input.viewer, 'viewer', ['status', 'name'])
  const viewerStatus = choice(rawViewer.status, ['unsupported', 'signed-out', 'authenticated'], 'viewer status')
  const viewerName = rawViewer.name == null ? null : text(rawViewer.name, 'viewer name', 120)
  if (viewerStatus !== 'authenticated' && viewerName !== null) invalid('signed-out viewer name')
  let policy = null
  if (input.policy != null) {
    const rawPolicy = record(input.policy, 'policy', ['id', 'description'])
    const id = text(rawPolicy.id, 'policy id', 80)
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(id)) invalid('policy id')
    policy = { id, description: text(rawPolicy.description, 'policy description', 2000) }
  }
  const rawPacks = record(input.packs, 'packs')
  const ids = Object.keys(rawPacks)
  if (ids.length > WORKSHOP_LIMITS.maxPacks) invalid('pack count')
  const entries = ids.map(id => {
    if (!ID_PATTERN.test(id)) invalid('pack id')
    const raw = record(rawPacks[id], 'pack metrics', METRIC_KEYS)
    const counters = Object.fromEntries(COUNTER_KEYS.map(key => [key, number(raw[key], key, true)]))
    if (counters.downloadCount !== null && counters.uniqueDownloadUsers !== null
      && counters.uniqueDownloadUsers > counters.downloadCount) invalid('uniqueDownloadUsers exceeds downloadCount')
    const likedByViewer = raw.likedByViewer == null ? null : raw.likedByViewer
    if (likedByViewer !== null && typeof likedByViewer !== 'boolean') invalid('likedByViewer')
    if (likedByViewer === true && viewerStatus !== 'authenticated') invalid('likedByViewer without authenticated viewer')
    let acclaimed = null
    if (raw.acclaimed != null) {
      const award = record(raw.acclaimed, 'award', ['awardedAt', 'criterion'])
      const criterion = text(award.criterion, 'award criterion', 80)
      if (policy === null || criterion !== policy.id) invalid('award policy')
      acclaimed = { awardedAt: timestamp(award.awardedAt, 'awardedAt'), criterion }
    }
    return [id, { ...counters, likedByViewer, popularityScore: number(raw.popularityScore, 'popularityScore', false), acclaimed }]
  })
  return { status, fetchedAt, viewer: { status: viewerStatus, name: viewerName }, packs: Object.fromEntries(entries), policy }
}

function usableCommunity(value) {
  if (value == null) return null
  try {
    const parsed = parseWorkshopCommunitySnapshot(value)
    return ['ready', 'stale'].includes(parsed.status) ? parsed : null
  } catch {
    // Malformed projections never satisfy selection; trusted transport is caller-owned.
    return null
  }
}

/**
 * Report whether a valid ready/stale projection has any numeric metric, including zero.
 * @param community - nullable community projection.
 * @returns false for offline, malformed, empty and all-null snapshots.
 */
export function hasWorkshopMetrics(community) {
  const usable = usableCommunity(community)
  return usable !== null && Object.values(usable.packs).some(row => [...COUNTER_KEYS, 'popularityScore'].some(key => row[key] !== null))
}

/** Format a known counter as plain text; never turn an unknown counter into zero.
 * @param value - nullable nonnegative safe integer.
 * @returns decimal text or an em dash for unknown/invalid counters.
 */
export function workshopMetricText(value) {
  return Number.isSafeInteger(value) && value >= 0 ? String(value) : '—'
}

function optionText(value, field, limit) {
  if (value === undefined) return ''
  if (typeof value !== 'string' || value.length > limit || CONTROL_TEXT.test(value)) invalid(`selector ${field}`)
  return value
}

function flag(value, field) {
  if (value === undefined) return false
  if (typeof value !== 'boolean') invalid(`selector ${field}`)
  return value
}

function installedPack(installed, id) {
  return installed instanceof Set ? installed.has(id) : Boolean(Object.getOwnPropertyDescriptor(installed ?? {}, id)?.value)
}

function updatedTime(value) {
  if (typeof value !== 'string') return null
  try { return Date.parse(timestamp(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value, 'updated')) }
  catch { return null } // Invalid catalogue dates sort after known dates.
}

function descendingKnown(a, b) {
  if (a === null) return b === null ? 0 : 1
  if (b === null) return -1
  return a === b ? 0 : a > b ? -1 : 1
}

/**
 * Select parsed catalogue packs without mutating the catalogue or local install state.
 * Timing means a timing-only pack; updates require an installed pack in the supplied Set.
 * Numeric sorts descend, unknown metrics/dates sort last, and ties keep catalogue order.
 * Invalid/offline community data cannot satisfy acclaimed selection or affect ranking.
 * @param packs - parsed workshop catalogue, bounded by WORKSHOP_LIMITS.maxPacks.
 * @param options - catalogue filters, local installation facts and requested sort.
 * @param community - optional trusted response projection; never an identity proof.
 * @returns original pack references in the selected order.
 */
export function selectWorkshopPacks(packs, options = {}, community = null) {
  if (!Array.isArray(packs) || packs.length > WORKSHOP_LIMITS.maxPacks) invalid('selector packs')
  const input = record(options, 'selector options', SELECTOR_KEYS)
  const query = optionText(input.query, 'query', 500)
  const license = optionText(input.license, 'license', 120)
  const renderer = optionText(input.renderer, 'renderer', 40)
  const tag = optionText(input.tag, 'tag', 24).trim().toLowerCase()
  const clientVersion = optionText(input.clientVersion, 'clientVersion', 40)
  const installation = choice(input.installation ?? 'any', ['any', 'installed', 'updates'], 'installation')
  const lyrics = choice(input.lyrics ?? 'any', ['any', 'included', 'timing', 'none'], 'lyrics selection')
  const sort = choice(input.sort ?? 'catalogue', ['catalogue', 'updated', 'title', 'downloads', 'likes', 'popular'], 'sort')
  const compatibleOnly = flag(input.compatibleOnly, 'compatibleOnly')
  const onlyAcclaimed = flag(input.onlyAcclaimed, 'onlyAcclaimed')
  const installed = input.installed ?? null
  if (installed !== null && !(installed instanceof Set)) record(installed, 'installed')
  const updates = input.updates ?? new Set()
  if (!(updates instanceof Set) || updates.size > WORKSHOP_LIMITS.maxPacks) invalid('updates')
  const usable = usableCommunity(community)
  const metric = id => usable !== null && Object.hasOwn(usable.packs, id) ? usable.packs[id] : null
  const selected = filterWorkshop(packs, { query, license, renderer }).filter(pack => {
    if (installation !== 'any' && !installedPack(installed, pack.id)) return false
    if (installation === 'updates' && !updates.has(pack.id)) return false
    if (lyrics === 'included' && pack.lyrics !== true) return false
    if (lyrics === 'timing' && (pack.timing !== true || pack.lyrics === true)) return false
    if (lyrics === 'none' && (pack.lyrics === true || pack.timing === true)) return false
    if (tag && !(pack.tags ?? []).some(value => typeof value === 'string' && value.trim().toLowerCase() === tag)) return false
    if (compatibleOnly && pack.requires && (!VERSION_PATTERN.test(pack.requires)
      || !VERSION_PATTERN.test(clientVersion) || compareVersions(pack.requires, clientVersion) > 0)) return false
    return !onlyAcclaimed || metric(pack.id)?.acclaimed != null
  })
  if (sort === 'catalogue') return selected
  const metricKey = { downloads: 'downloadCount', likes: 'likeCount', popular: 'popularityScore' }[sort]
  return selected.map((pack, position) => ({ pack, position })).sort((a, b) => {
    const result = sort === 'title'
      ? (a.pack.title || a.pack.id).localeCompare(b.pack.title || b.pack.id, 'zh-CN', { sensitivity: 'base' })
      : sort === 'updated'
        ? descendingKnown(updatedTime(a.pack.updated), updatedTime(b.pack.updated))
        : descendingKnown(metric(a.pack.id)?.[metricKey] ?? null, metric(b.pack.id)?.[metricKey] ?? null)
    return result || a.position - b.position
  }).map(entry => entry.pack)
}
