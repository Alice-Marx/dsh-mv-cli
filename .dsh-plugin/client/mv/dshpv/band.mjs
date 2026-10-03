/**
 * The dsh-pv lyric band timing, matched to the user's own lyrics.
 *
 * Ported from MisakaZentai/world-execute-me-dsh-pv (tools/lyrics.py, continuity_full_v2/words.py),
 * Copyright (c) 2026 MisakaZentai, MIT License. The bundled band.json holds no lyric text: per line only
 * the sha256 of its text, its times and its word spans. A user's LRC line is matched by the sha256 of its
 * text (written a few equivalent ways); unmatched songs fall back to line timing from the user's cues.
 */
export const BREAK = 2.0
export const MAX_TYPE = 0.25
export const MIN_TYPE = 0.06
const BEAT = 60 / 130
const INLINE = /<\d+:\d+(?:[.:]\d+)?>/g

export function lineVariants(text) {
  const body = String(text ?? '')
  return [...new Set([body.trim(), body.split(/\s+/).filter(Boolean).join(' '), body.replace(INLINE, '').split(/\s+/).filter(Boolean).join(' ')])].filter(Boolean)
}

export async function sha256Text(text, subtle = globalThis.crypto?.subtle) {
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export function applyPatch(text, ops = []) {
  let words = text.split(/\s+/).filter(Boolean)
  for (const op of ops) {
    if (op.op === 'reorder_words') {
      if (op.order.length !== words.length) return text
      words = op.order.map(k => words[k])
    } else if (op.op === 'replace_words') words.splice(op.at, op.remove, ...op.insert)
  }
  return words.join(' ')
}

function finish(lines, duration) {
  lines.sort((a, b) => a.start - b.start)
  lines.forEach((ln, k) => {
    const next = k + 1 < lines.length ? lines[k + 1].start : duration
    if (next - ln.end > BREAK) { ln.showUntil = ln.end + BEAT; ln.fadeUntil = ln.end + 2 * BEAT } else ln.showUntil = ln.fadeUntil = next
  })
  return lines
}

/**
 * band: parsed band.json; cues: [{time, end, text}] from the user's file.
 * Returns { lines: [{text, start, end, words: [[c0, c1, onset, typeDur]], showUntil, fadeUntil}], matched, total }.
 */
export async function matchBand(band, cues, { duration = 211.913, hash = sha256Text } = {}) {
  const want = new Map()
  band.lines.forEach((ln, k) => { if (ln.sha256) { if (!want.has(ln.sha256)) want.set(ln.sha256, []); want.get(ln.sha256).push(k) } })
  const found = new Map()
  for (const cue of cues ?? []) {
    for (const v of lineVariants(cue.text)) {
      const sha = await hash(v)
      if (want.has(sha)) { found.set(sha, v); break }
      // the timeline keeps a line after its patch: try the patched text of every patched line
    }
  }
  const lines = []
  band.lines.forEach(ln => {
    let text = found.get(ln.sha256)
    if (!text) return
    if (ln.patch) text = applyPatch(text, ln.patch)
    for (const [a, b] of Object.entries(band.fixes ?? {})) text = text.split(a).join(b)
    const words = ln.words.map(([c0, c1, onset, dur]) => {
      const shown = text.slice(c0, c1)
      const td = shown.includes('-') ? dur : Math.min(MAX_TYPE, dur)
      return [c0, c1, onset, Math.max(MIN_TYPE, td)]
    })
    if (!words.length) return
    lines.push({ text, start: words[0][2], end: ln.displayEnd, words })
  })
  const total = band.lines.filter(ln => ln.sha256).length
  if (lines.length >= Math.max(8, total * 0.5)) return { lines: finish(lines, duration), matched: lines.length, total }
  return { lines: fromCues(cues, duration), matched: lines.length, total }
}

/** Fallback: the user's own lines, words spread evenly over the first 60 % of each line. */
export function fromCues(cues, duration = 211.913) {
  const out = []
  for (const cue of cues ?? []) {
    const text = String(cue.text ?? '').trim()
    if (!text) continue
    const end = Number.isFinite(cue.end) ? cue.end : cue.time + 3
    const span = Math.max(0.3, Math.min(4, (end - cue.time) * 0.6))
    const words = []
    const re = /\S+/g
    let m
    const all = []
    while ((m = re.exec(text))) all.push([m.index, m.index + m[0].length])
    all.forEach(([c0, c1], k) => words.push([c0, c1, cue.time + span * k / Math.max(1, all.length), Math.max(MIN_TYPE, Math.min(MAX_TYPE, span / Math.max(1, all.length)))]))
    if (words.length) out.push({ text, start: cue.time, end, words })
  }
  return finish(out, duration)
}

export function lineAt(lines, t) {
  for (const ln of lines) {
    if (ln.start <= t && t < ln.fadeUntil) return t < ln.showUntil ? [ln, 1] : [ln, 1 - (t - ln.showUntil) / Math.max(1e-6, ln.fadeUntil - ln.showUntil)]
  }
  return null
}

/** [characters out at t, the time each character came out]. */
export function typed(ln, t) {
  const n = ln.text.length
  const when = new Array(n).fill(Infinity)
  ln.words.forEach(([i0, i1, onset, td], k) => {
    const len = Math.max(1, i1 - i0)
    for (let j = 0; j < i1 - i0; j++) when[i0 + j] = onset + td * j / len
    const next = k + 1 < ln.words.length ? ln.words[k + 1][0] : n
    for (let j = i1; j < next; j++) when[j] = onset + td
  })
  let out = 0
  while (out < n && when[out] <= t) out++
  return [out, when]
}

/** The satisfaction shot's attention tokens: "If" + the chorus line's words, from the user's own lines. */
export function attentionTokens(lines) {
  const at = lines.findIndex(ln => ln.start >= 60 && ln.text.toLowerCase().startsWith('then i can'))
  if (at < 0) return null
  const a = lines[at].text.split(/\s+/).slice(1, 6).map(w => w.replace(/,/g, ''))
  const b = (lines[at + 1]?.text ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w.toLowerCase())
  return ['If', ...a, ...b]
}

/** tuikit.tokenize: words and punctuation; long words break into two pieces. */
export function tokenize(s) {
  const out = []
  for (const w of String(s).match(/[A-Za-z']+|[^\sA-Za-z']/g) ?? []) {
    if (w.length > 7) { const k = Math.floor(w.length / 2) + 1; out.push(w.slice(0, k), w.slice(k)) } else out.push(w)
  }
  return out
}

let CRC
export function crc32(str) {
  if (!CRC) { CRC = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0 } }
  const bytes = new TextEncoder().encode(str)
  let c = 0xffffffff
  for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
export const tokenId = tok => crc32(tok.toLowerCase()) % 100000

export const KEYWORDS = new Set(['power', 'protection', 'creation', 'parameters', 'initialization', 'world', 'simulation', 'simulations',
  'dimension', 'circumference', 'tangents', 'infinity', 'limitations', 'vision', 'dizzy', 'unite', 'deeply',
  'satisfaction', 'happy', 'execution', 'trapped', 'strange', 'nutrients', 'antioxidants', 'enjoyment', 'god',
  'existence', 'trance', 'vibrations', 'completion', 'left', 'isolation', 'fragments', 'disheartened',
  'illegal', 'arguments', 'love', 'lo-o-ove', 'free', 'back'])
