/* Explicit OFL replacements for every proprietary/generic face requested by
 * the upstream. This is name routing only: no local font is queried or baked.
 */
export const FONT_ALIASES = Object.freeze({
  'JetBrains Mono': ['Menlo', 'Menlo-Regular', 'Menlo-Bold', 'monospace'],
  'Space Grotesk': ['Avenir Next', 'AvenirNext', 'AvenirNext-Regular', 'AvenirNext-Medium', 'AvenirNext-DemiBold', 'AvenirNext-Bold', 'AvenirNext-Heavy', 'sans-serif'],
  'Noto Sans SC': ['PingFang SC', 'PingFangSC'],
  'Noto Sans KR': ['Apple SD Gothic Neo', 'AppleSDGothicNeo'],
  'Noto Sans Symbols 2': ['Apple Symbols'],
  'STIX Two Text': ['serif'],
});

export function aliasesFor(family) { return FONT_ALIASES[family] || []; }
export function normalizedFamily(name) { return String(name).trim().replace(/\s+/g, ' ').toLowerCase(); }

export function canonicalFamily(name) {
  const normalized = normalizedFamily(name);
  for (const [family, aliases] of Object.entries(FONT_ALIASES)) {
    if (normalizedFamily(family) === normalized || aliases.some(alias => normalizedFamily(alias) === normalized)) return family;
  }
  return name;
}
