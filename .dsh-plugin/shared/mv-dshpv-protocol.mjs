/**
 * Request shape of dshpvAsset (shared by the client gateway and the Host): the dsh-pv canvas preset's
 * files by name. Only the names below can be read.
 *
 *   assets/dsh-pv/      MIT data ported from MisakaZentai/world-execute-me-dsh-pv
 *   assets/dsh-pv-art/  whale-girl artwork, CC BY-NC-SA 4.0 (see its NOTICE.md)
 */
export const DSHPV_EXPRESSIONS = Object.freeze(['cheerful', 'starry', 'shy', 'serious', 'confused', 'frightened', 'angry', 'exasperated'])

export const DSHPV_ASSETS = Object.freeze({
  timeline: 'dsh-pv/timeline.json',
  chat: 'dsh-pv/chat.json',
  band: 'dsh-pv/band.json',
  'maid-left': 'dsh-pv-art/maid-left.webp',
  ...Object.fromEntries(DSHPV_EXPRESSIONS.map(name => [`whale-${name}`, `dsh-pv-art/whale-${name}.webp`])),
})

export const DSHPV_CHUNK = 1024 * 1024
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

