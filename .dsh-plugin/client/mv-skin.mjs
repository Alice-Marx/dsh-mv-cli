/**
 * Panel skins (0.8.0): three looks over the same components, chosen in the header (外观) and kept in
 * localStorage. Each skin remembers its own light/dark mode; "auto" follows Harness
 * (body[data-ds-dark-theme]) or, outside Harness, the system colour scheme.
 */
export const SKIN_KEY = 'dsh-mv.skin.v1'
/** Window event fired after the skin or light/dark class changes. */
export const SKIN_EVENT = 'dsh-mv-skin-change'
export const SKINS = Object.freeze([
  { id: 'c', name: 'Harness', title: 'Harness 原生', description: '与 DeepSeek Harness 一致的卡片、柔和阴影和蓝色强调色。', defaultMode: 'auto' },
  { id: 'a', name: '音乐', title: '现代音乐应用', description: '大封面、渐变封面图、醒目的正在播放区，播放条吸附在底部。', defaultMode: 'dark' },
  { id: 'b', name: '终端', title: '终端 / 黑客', description: '等宽字体、霓虹绿配琥珀色、CRT 扫描线；浅色为「纸质终端」。', defaultMode: 'dark' },
])
export const DEFAULT_SKIN = 'c'
export const MODES = Object.freeze(['auto', 'light', 'dark'])
const byId = id => SKINS.find(skin => skin.id === id)

/** Parsed, validated skin settings: { skin, modes: { a, b, c } }. */
export function normalizeSkin(value) {
  const skin = byId(value?.skin) ? value.skin : DEFAULT_SKIN
  const modes = {}
  for (const s of SKINS) modes[s.id] = MODES.includes(value?.modes?.[s.id]) ? value.modes[s.id] : s.defaultMode
  return { skin, modes }
}
export function loadSkin(storage = globalThis.localStorage) {
  try { return normalizeSkin(JSON.parse(storage?.getItem(SKIN_KEY) ?? 'null')) } catch { return normalizeSkin(null) }
}
export function saveSkin(value, storage = globalThis.localStorage) {
  const clean = normalizeSkin(value)
  try { storage?.setItem(SKIN_KEY, JSON.stringify(clean)) } catch { /* private mode */ }
  return clean
}
/** true = dark. hostDark: Harness dark attribute (null when not in Harness); systemDark: prefers-color-scheme. */
export function resolveDark(mode, { hostDark = null, systemDark = false } = {}) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return hostDark ?? systemDark
}
/** Class names for the panel root. */
export function skinClasses(settings, env) {
  const { skin, modes } = normalizeSkin(settings)
  const mode = modes[skin]
  return `mv-skin-${skin} ${resolveDark(mode, env) ? 'mv-dark' : 'mv-light'}${mode === 'auto' ? ' mv-follow' : ''}`
}
/** Stable 0–359 hue for generated covers. */
export function coverHue(text) {
  let h = 2166136261
  for (const ch of String(text ?? '')) h = Math.imul(h ^ ch.codePointAt(0), 16777619)
  return (h >>> 0) % 360
}
/** One or two letters for a generated cover. */
export function coverInitials(title) {
  const clean = String(title ?? '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (!clean) return '♪'
  const words = clean.split(' ')
  return /[\u3400-\u9fff]/.test(clean[0]) ? clean[0] : (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
}
