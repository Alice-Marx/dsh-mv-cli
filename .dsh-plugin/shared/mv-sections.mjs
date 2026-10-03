/**
 * Section detection (pure): intro / verse / chorus / bridge / instrumental /
 * outro from lyric repetition, gaps and energy. Input lines are timed
 * ({ start, end, text }); `energyAt(t0, t1)` returns mean loudness 0..1.
 */
import { tokenize } from './mv-align.mjs'

const round = v => Math.round(v * 100) / 100

function similarity(a, b) {
  const A = new Set(a), B = new Set(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.min(A.size, B.size) * 0.6 + inter / (A.size + B.size - inter) * 0.4
}

/** Sung length of a line: LRC "end" is often just the next line's start. */
const sungEnd = line => Math.min(line.end ?? line.start + 3, line.start + Math.max(2.5, 0.45 * tokenize(line.text).length + 1.2))

/**
 * Split lines into blocks at long pauses, where a line run starts/stops
 * repeating elsewhere in the song, or every ~8 lines.
 */
export function lyricBlocks(lines, { gap = 3.5, maxLines = 8 } = {}) {
  const tokens = lines.map(line => tokenize(line.text))
  const repeats = tokens.map((t, i) => tokens.some((u, j) => j !== i && Math.abs(j - i) > 1 && similarity(t, u) >= 0.8))
  const blocks = []
  let current = []
  lines.forEach((line, i) => {
    const prev = current.at(-1)
    if (prev && (line.start - sungEnd(prev) > gap || current.length >= maxLines || repeats[i] !== repeats[i - 1])) { blocks.push(current); current = [] }
    current.push(line)
  })
  if (current.length) blocks.push(current)
  return blocks.map(block => ({ start: block[0].start, end: sungEnd(block.at(-1)), lines: block, tokens: block.flatMap(line => tokenize(line.text)) }))
}

export function detectSections(lines, { duration = 0, energyAt = null, instrumentalGap = 8 } = {}) {
  const timed = (lines ?? []).filter(line => Number.isFinite(line.start)).sort((a, b) => a.start - b.start)
  const total = duration || (timed.at(-1)?.end ?? 0) + 4
  const blocks = lyricBlocks(timed)
  // Group blocks that repeat (chorus candidates).
  const group = blocks.map(() => -1)
  let groups = 0
  for (let i = 0; i < blocks.length; i++) {
    if (group[i] >= 0) continue
    group[i] = groups
    for (let j = i + 1; j < blocks.length; j++) if (group[j] < 0 && similarity(blocks[i].tokens, blocks[j].tokens) >= 0.55) group[j] = groups
    groups++
  }
  const counts = new Array(groups).fill(0)
  for (const g of group) counts[g]++
  const energy = blocks.map(b => (energyAt ? energyAt(b.start, b.end) : 0))
  const repeated = counts.map((n, g) => ({ g, n, e: blocks.reduce((sum, b, i) => sum + (group[i] === g ? energy[i] : 0), 0) / Math.max(1, n) })).filter(x => x.n >= 2)
  repeated.sort((a, b) => b.n - a.n || b.e - a.e)
  let chorusGroup = repeated[0]?.g ?? -1
  if (chorusGroup < 0 && energyAt && blocks.length >= 3) {
    const loudest = energy.indexOf(Math.max(...energy))
    if (energy[loudest] > 0) chorusGroup = group[loudest]
  }
  const sections = []
  const add = (kind, start, end, extra = {}) => { if (end - start >= 0.5) sections.push({ kind, start: round(start), end: round(end), ...extra }) }
  if (!blocks.length) { add('instrumental', 0, total); return finish(sections, energyAt) }
  add('intro', 0, blocks[0].start)
  let verse = 0, seenChorus = 0
  blocks.forEach((block, i) => {
    let kind
    if (group[i] === chorusGroup) { kind = 'chorus'; seenChorus++ }
    else if (counts[group[i]] === 1 && seenChorus >= 2 && i < blocks.length - 1) kind = 'bridge'
    else { kind = 'verse'; verse++ }
    add(kind, block.start, block.end, { lines: [timed.indexOf(block.lines[0]), timed.indexOf(block.lines.at(-1))], label: kind === 'verse' ? `verse ${verse}` : kind, repeatGroup: group[i] })
    const next = blocks[i + 1]
    if (next && next.start - block.end >= instrumentalGap) add('instrumental', block.end, next.start)
  })
  add('outro', blocks.at(-1).end, total)
  return finish(sections, energyAt)
}

/** Merge neighbours of the same kind, fold short lyric sections in, keep one bridge. */
function tidy(sections, minLyric = 4) {
  const lyric = kind => kind === 'verse' || kind === 'chorus' || kind === 'bridge'
  const bridges = sections.filter(x => x.kind === 'bridge')
  if (bridges.length > 1) {
    const keep = bridges.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a))
    for (const x of bridges) if (x !== keep) x.kind = 'verse'
  }
  const out = []
  for (const x of sections) {
    const prev = out.at(-1)
    if (prev && lyric(x.kind) && lyric(prev.kind) && (x.kind === prev.kind || (x.end - x.start < minLyric && x.kind !== 'chorus'))) {
      prev.end = x.end
      if (prev.lines && x.lines) prev.lines = [prev.lines[0], x.lines[1]]
      continue
    }
    if (prev && lyric(prev.kind) && lyric(x.kind) && prev.end - prev.start < minLyric && prev.kind !== 'chorus') {
      Object.assign(prev, { ...x, start: prev.start, lines: prev.lines && x.lines ? [prev.lines[0], x.lines[1]] : x.lines })
      continue
    }
    out.push({ ...x })
  }
  let verse = 0
  for (const x of out) if (x.kind === 'verse') x.label = `verse ${++verse}`; else if (x.label) x.label = x.kind
  return out
}

function finish(sections, energyAt) {
  const out = tidy(sections)
  for (const s of out) if (energyAt) s.energy = round(energyAt(s.start, s.end))
  return out
}

/** energyAt from a spectrum.json ({ fps, frames: number[48][] }). */
export function energyFromSpectrum(spectrum) {
  const fps = spectrum?.fps || 20, frames = spectrum?.frames ?? []
  const level = frames.map(frame => frame.reduce((a, b) => a + b, 0) / (frame.length || 1))
  return (t0, t1) => {
    const a = Math.max(0, Math.floor(t0 * fps)), b = Math.min(level.length, Math.ceil(t1 * fps))
    if (b <= a) return 0
    let sum = 0
    for (let i = a; i < b; i++) sum += level[i]
    return sum / (b - a)
  }
}
