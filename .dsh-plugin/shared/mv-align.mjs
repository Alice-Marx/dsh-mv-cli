/**
 * Lyric timing (pure): align lyric lines to the lyrics engine's word
 * timestamps, per-line confidence, LRCLIB merge, lines from a bare
 * transcript, and LRC output. A "line" is
 * { start, end, text, alt, confidence (0..1), source }.
 */
import { parseLyrics, looksLikeLyricsJs } from './mv-lyrics.mjs'

export const LOW_CONFIDENCE = 0.5
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/
const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d

/** Normalised tokens of a text: latin words, digits, and single CJK characters. */
export function tokenize(text) {
  const out = []
  const norm = String(text ?? '').normalize('NFKC').toLowerCase().replace(/[’`]/g, "'")
  let word = ''
  const flush = () => { const w = word.replace(/^'+|'+$/g, ''); if (w) out.push(w); word = '' }
  for (const ch of norm) {
    if (CJK.test(ch)) { flush(); out.push(ch) }
    else if (/[\p{L}\p{N}']/u.test(ch)) word += ch
    else flush()
  }
  flush()
  return out
}

const isCjkText = text => { let cjk = 0, latin = 0; for (const ch of String(text)) { if (CJK.test(ch)) cjk++; else if (/[a-z]/i.test(ch)) latin++ } return cjk > latin }

function levenshtein(a, b) {
  if (a === b) return 0
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i
    for (let j = 1; j <= b.length; j++) { const keep = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = keep }
  }
  return row[b.length]
}
export function tokenSimilarity(a, b) {
  if (a === b) return 1
  if (a.length < 3 || b.length < 3 || CJK.test(a) || CJK.test(b)) return 0
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length) >= 0.7 ? 0.6 : 0
}

/** Split engine words into tokens with times (CJK runs share the word's time evenly). */
export function wordTokens(words) {
  const out = []
  for (const word of words ?? []) {
    const tokens = tokenize(word.w)
    if (!tokens.length) continue
    const span = Math.max(0, (word.e - word.s)) / tokens.length
    tokens.forEach((token, i) => out.push({ t: token, s: word.s + span * i, e: word.s + span * (i + 1), p: word.p ?? 0.5 }))
  }
  return out
}

/** Which text of a bilingual line to align: the one written in the sung script. */
export function alignText(line, sungCjk) {
  if (!line.alt) return line.text
  return isCjkText(line.text) === sungCjk ? line.text : isCjkText(line.alt) === sungCjk ? line.alt : line.text
}

/** Needleman–Wunsch over tokens; returns for each lyric token the matched word token index (or -1) and similarity. */
export function alignTokens(lyric, heard, { match = 2, similar = 1, mismatch = -1, gap = -0.6 } = {}) {
  const n = lyric.length, m = heard.length
  const width = m + 1
  const score = new Float32Array((n + 1) * width)
  const move = new Uint8Array((n + 1) * width) // 1 diag, 2 up (skip lyric), 3 left (skip heard)
  for (let i = 1; i <= n; i++) { score[i * width] = i * gap; move[i * width] = 2 }
  for (let j = 1; j <= m; j++) { score[j] = j * gap; move[j] = 3 }
  for (let i = 1; i <= n; i++) {
    const a = lyric[i - 1]
    for (let j = 1; j <= m; j++) {
      const sim = tokenSimilarity(a, heard[j - 1].t)
      const diag = score[(i - 1) * width + j - 1] + (sim === 1 ? match : sim > 0 ? similar : mismatch)
      const up = score[(i - 1) * width + j] + gap
      const left = score[i * width + j - 1] + gap
      const at = i * width + j
      if (diag >= up && diag >= left) { score[at] = diag; move[at] = 1 } else if (up >= left) { score[at] = up; move[at] = 2 } else { score[at] = left; move[at] = 3 }
    }
  }
  const matchOf = new Int32Array(n).fill(-1), simOf = new Float32Array(n)
  let i = n, j = m
  while (i > 0 || j > 0) {
    const dir = move[i * width + j]
    if (dir === 1) { const sim = tokenSimilarity(lyric[i - 1], heard[j - 1].t); if (sim > 0) { matchOf[i - 1] = j - 1; simOf[i - 1] = sim } i--; j-- }
    else if (dir === 2) i--
    else j--
  }
  return { matchOf, simOf }
}

/**
 * Time lyric lines from engine words. `lines` need text (and optional alt);
 * existing start/end are ignored. Returns new line objects.
 */
export function alignLines(lines, words, { duration = 0 } = {}) {
  const heard = wordTokens(words)
  const sungCjk = heard.filter(token => CJK.test(token.t)).length > heard.length / 2
  const lyric = [], owner = []
  const units = lines.map((line, index) => { const tokens = tokenize(alignText(line, sungCjk)); for (const t of tokens) { lyric.push(t); owner.push(index) } return tokens.length })
  const { matchOf, simOf } = alignTokens(lyric, heard)
  const out = lines.map(line => ({ text: line.text, alt: line.alt ?? '', start: null, end: null, confidence: 0, source: 'engine' }))
  const stats = lines.map(() => ({ first: -1, last: -1, firstIdx: -1, lastIdx: -1, sims: 0, probs: 0, count: 0 }))
  let k = 0
  for (let index = 0; index < lines.length; index++) {
    const st = stats[index]
    for (let t = 0; t < units[index]; t++, k++) {
      const hit = matchOf[k]
      if (hit < 0) continue
      if (st.first < 0) { st.first = hit; st.firstIdx = t }
      st.last = hit; st.lastIdx = t
      st.sims += simOf[k]; st.probs += heard[hit].p; st.count++
    }
  }
  const counts = new Map()
  for (const token of heard) counts.set(token.t, (counts.get(token.t) ?? 0) + 1)
  const avgToken = heard.length > 1 ? Math.min(0.6, Math.max(0.12, (heard.at(-1).e - heard[0].s) / heard.length)) : 0.3
  for (let index = 0; index < lines.length; index++) {
    const st = stats[index], tokens = units[index]
    if (!st.count || !tokens) continue
    const start = heard[st.first].s - st.firstIdx * avgToken
    const end = heard[st.last].e + (tokens - 1 - st.lastIdx) * avgToken
    const coverage = st.sims / tokens
    let confidence = coverage * 0.75 + (st.probs / st.count) * 0.25
    if (st.count < 2 && tokens > 2) confidence *= 0.6
    if (end - start > Math.max(12, tokens * 1.5)) confidence *= 0.5
    // A one-word line whose word is sung several times may have matched the wrong one: ask the user.
    if (tokens === 1 && (counts.get(heard[st.first].t) ?? 0) > 1) confidence = Math.min(confidence, 0.45)
    out[index].start = Math.max(0, start); out[index].end = Math.max(start + 0.2, end); out[index].confidence = Math.min(1, confidence)
  }
  fillGaps(out, { duration: duration || (heard.at(-1)?.e ?? 0) + 2 })
  for (const line of out) { line.start = round(line.start); line.end = round(line.end); line.confidence = round(line.confidence, 2) }
  return out
}

/** Interpolate lines without a time, keep starts increasing, clamp ends. */
export function fillGaps(lines, { duration = 0 } = {}) {
  const n = lines.length
  for (let i = 0; i < n; i++) {
    if (lines[i].start !== null && lines[i].start !== undefined) continue
    let a = i - 1; while (a >= 0 && lines[a].start == null) a--
    let b = i + 1; while (b < n && lines[b].start == null) b++
    const from = a >= 0 ? lines[a].end ?? lines[a].start + 2 : 0
    const to = b < n ? lines[b].start : Math.max(from + (b - a) * 2, duration || from + (b - a) * 2)
    const slots = b - a
    for (let j = a + 1; j < b; j++) {
      const s = from + ((to - from) * (j - a - 1)) / Math.max(1, slots - 1 || 1)
      lines[j].start = s; lines[j].end = Math.min(to, s + Math.max(0.5, (to - from) / slots)); lines[j].confidence = 0
    }
    i = b - 1
  }
  for (let i = 1; i < n; i++) {
    if (lines[i].start < lines[i - 1].start + 0.05) { lines[i].start = lines[i - 1].start + 0.05; lines[i].confidence = Math.min(lines[i].confidence, 0.3) }
  }
  for (let i = 0; i < n; i++) {
    const next = i + 1 < n ? lines[i + 1].start : (duration || lines[i].end + 4)
    if (!(lines[i].end > lines[i].start)) lines[i].end = Math.min(next, lines[i].start + 3)
    lines[i].end = Math.min(lines[i].end, next)
  }
  return lines
}

/** Lines from the transcript alone (no lyric text known). */
export function linesFromWords(words, { maxTokens = 12, gap = 0.7 } = {}) {
  const lines = []
  let current = []
  const push = () => {
    if (!current.length) return
    const text = current.map(w => w.w).join('').replace(/\s+/g, ' ').trim()
    const cjk = isCjkText(text)
    lines.push({ start: round(current[0].s), end: round(current.at(-1).e), text: cjk ? text.replace(/\s+/g, '') : text, alt: '', confidence: round(current.reduce((n, w) => n + (w.p ?? 0.5), 0) / current.length * 0.8, 2), source: 'transcript' })
    current = []
  }
  for (const word of words ?? []) {
    const prev = current.at(-1)
    const count = current.reduce((n, w) => n + tokenize(w.w).length, 0)
    if (prev && (word.s - prev.e > gap || count >= maxTokens || /[.!?。！？]$/.test(prev.w.trim()))) push()
    current.push(word)
  }
  push()
  return lines
}

/** Lyric text (LRC / SRT / lyrics.json / plain) → lines; timed when the text has stamps. */
export function linesFromText(text, { name = 'lyrics.lrc' } = {}) {
  const body = String(text ?? '')
  if (looksLikeLyricsJs(body) || /\.(?:m?js)$/i.test(name) || /\[\d{1,3}:\d{1,2}([.:]\d{1,3})?\]/.test(body) || /-->/.test(body) || /^\s*\[\s*\{/.test(body)) {
    const ext = looksLikeLyricsJs(body) ? 'x.js' : /-->/.test(body) ? 'x.srt' : /^\s*\[\s*\{/.test(body) ? 'x.json' : name
    const cues = parseLyrics(ext, body)
    if (cues.length) return { timed: true, lines: cues.map(cue => ({ start: cue.time, end: cue.end, text: cue.en || cue.zh, alt: cue.en && cue.zh ? cue.zh : '', confidence: 0.6, source: 'lyrics' })) }
  }
  const lines = body.split(/\r?\n/).map(line => line.replace(/\[[a-z]+:[^\]]*\]/gi, '').trim()).filter(line => line && !/^(作词|作曲|编曲|词|曲)\s*[:：]/.test(line))
  return { timed: false, lines: lines.map(line => { const [text, alt = ''] = line.split(/\s+\/\s+/); return { start: null, end: null, text: text.trim(), alt: alt.trim(), confidence: 0, source: 'lyrics' } }) }
}

const median = values => { const s = [...values].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0 }

/**
 * Merge timed lyrics (LRCLIB / user LRC) with engine alignment: estimate a
 * global offset from confident lines, then per line keep the engine time
 * when it is confident, else the shifted LRC time. Agreement raises confidence.
 */
export function mergeTimed(timed, aligned) {
  const diffs = []
  timed.forEach((line, i) => { const a = aligned[i]; if (a && a.confidence >= 0.7 && Number.isFinite(line.start)) diffs.push(a.start - line.start) })
  const offset = diffs.length >= 3 ? median(diffs) : 0
  const lines = timed.map((line, i) => {
    const a = aligned[i]
    const shifted = line.start + offset
    const gap = a ? Math.abs(a.start - shifted) : Infinity
    if (gap <= 0.6) return { ...line, start: round((a.start + shifted) / 2), end: round(Math.max(a.end, line.end + offset)), confidence: round(Math.max(0.9, a.confidence), 2), source: `${line.source}+engine` }
    // Close disagreement with a confident engine line: trust the engine (LRC files are often coarse).
    if (gap <= 2.5 && a.confidence >= 0.75) return { ...line, start: a.start, end: a.end, confidence: round(a.confidence * 0.8, 2), source: 'engine' }
    // Large disagreement: keep the (shifted) LRC time but ask the user.
    return { ...line, start: round(shifted), end: round(line.end + offset), confidence: diffs.length >= 3 ? 0.45 : line.confidence, source: line.source }
  })
  return { offset: round(offset), lines: fillGaps(lines, {}) }
}

const stamp = t => { const v = Math.max(0, t); const m = Math.floor(v / 60), s = v - m * 60; return `[${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}]` }
export const lrcStamp = stamp

/** LRC text: bilingual lines share a stamp; a blank stamp ends a line before a long gap. */
export function linesToLrc(lines, { title = '', artist = '', gap = 1.5 } = {}) {
  const out = []
  if (title) out.push(`[ti:${title}]`)
  if (artist) out.push(`[ar:${artist}]`)
  out.push('[by:dsh-mv]')
  lines.forEach((line, i) => {
    out.push(`${stamp(line.start)}${line.text}`)
    if (line.alt) out.push(`${stamp(line.start)}${line.alt}`)
    const next = lines[i + 1]
    if (Number.isFinite(line.end) && (!next || next.start - line.end > gap)) out.push(stamp(line.end))
  })
  return `${out.join('\n')}\n`
}

/** Timing report vs. reference times (for tests and the accuracy check). */
export function compareStarts(lines, reference) {
  const errors = []
  const n = Math.min(lines.length, reference.length)
  for (let i = 0; i < n; i++) if (Number.isFinite(lines[i].start) && Number.isFinite(reference[i].start)) errors.push(Math.abs(lines[i].start - reference[i].start))
  const within = limit => errors.length ? round(errors.filter(e => e <= limit).length / errors.length, 3) : 0
  return { lines: errors.length, median: round(median(errors)), mean: errors.length ? round(errors.reduce((a, b) => a + b, 0) / errors.length) : 0, max: errors.length ? round(Math.max(...errors)) : 0, within02: within(0.2), within05: within(0.5), within1: within(1) }
}
