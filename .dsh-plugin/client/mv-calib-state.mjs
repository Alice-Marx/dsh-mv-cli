/**
 * Calibration editor state (pure). Lines: { start, end, text, alt, confidence, source }.
 * Every edit is undoable; a line the user touched becomes confidence 1
 * (source 'user'). `offset` is a global shift applied on export/preview.
 * Ideas adapted from TKCB/King-LRC-Waveform-Editor (MIT), see NOTICE.md.
 */
import { LOW_CONFIDENCE } from '../shared/mv-align.mjs'

export const NUDGE = Object.freeze({ small: 0.05, large: 0.5 })
export const MIN_LINE = 0.2
const HISTORY = 200
const r3 = v => Math.round(v * 1000) / 1000
const clean = line => ({ start: r3(line.start), end: r3(line.end ?? line.start + 2), text: String(line.text ?? ''), alt: String(line.alt ?? ''), confidence: line.confidence ?? 1, source: line.source ?? 'import' })

export function createCalib(lines = [], { duration = 0, offset = 0 } = {}) {
  const sorted = lines.map(clean).sort((a, b) => a.start - b.start)
  return { lines: sorted, duration, offset, selected: sorted.length ? 0 : -1, past: [], future: [], dirty: false }
}

const touch = line => ({ ...line, confidence: 1, source: 'user' })
const clampTime = (state, t) => Math.max(0, state.duration ? Math.min(state.duration, t) : t)

function commit(state, lines, extra = {}) {
  const past = [...state.past, { lines: state.lines, offset: state.offset, selected: state.selected }].slice(-HISTORY)
  return { ...state, ...extra, lines, past, future: [], dirty: true }
}

/** Keep starts ordered and ends after starts without reordering lines. */
function setStart(state, lines, i, t) {
  const prev = lines[i - 1], next = lines[i + 1]
  const lo = prev ? prev.start + MIN_LINE : 0
  const hi = next ? next.start - MIN_LINE : (state.duration || Infinity)
  const start = r3(Math.min(Math.max(clampTime(state, t), lo), hi))
  const line = touch({ ...lines[i], start, end: Math.max(lines[i].end, start + MIN_LINE) })
  const out = lines.slice()
  out[i] = line
  if (prev && prev.end > start) out[i - 1] = { ...prev, end: start }
  return out
}

function setEnd(state, lines, i, t) {
  const next = lines[i + 1]
  const hi = next ? next.start : (state.duration || Infinity)
  const end = r3(Math.min(Math.max(clampTime(state, t), lines[i].start + MIN_LINE), hi))
  const out = lines.slice()
  out[i] = touch({ ...lines[i], end })
  return out
}

function splitText(text, ratio = 0.5) {
  const words = text.split(/(\s+)/)
  if (words.filter(w => w.trim()).length >= 2) {
    const target = text.length * ratio
    let best = 0, bestDiff = Infinity, pos = 0
    for (const part of words) { pos += part.length; if (/^\s+$/.test(part)) { const d = Math.abs(pos - target); if (d < bestDiff) { bestDiff = d; best = pos } } }
    return [text.slice(0, best).trim(), text.slice(best).trim()]
  }
  const chars = [...text]
  const cut = Math.max(1, Math.round(chars.length * ratio))
  return [chars.slice(0, cut).join(''), chars.slice(cut).join('')]
}

export function calibReduce(state, action) {
  const { lines } = state
  const i = action.index ?? state.selected
  const valid = i >= 0 && i < lines.length
  switch (action.type) {
    case 'select': return valid ? { ...state, selected: i } : state
    case 'setStart': return valid ? commit(state, setStart(state, lines, i, action.time), { selected: i }) : state
    case 'setEnd': return valid ? commit(state, setEnd(state, lines, i, action.time), { selected: i }) : state
    case 'move': {
      if (!valid) return state
      const len = lines[i].end - lines[i].start
      const moved = setStart(state, lines, i, action.time)
      return commit(state, setEnd(state, moved, i, moved[i].start + len), { selected: i })
    }
    case 'nudge': {
      if (!valid) return state
      const delta = action.delta ?? NUDGE.small
      const edge = action.edge ?? 'start'
      const next = edge === 'end' ? setEnd(state, lines, i, lines[i].end + delta) : setStart(state, lines, i, lines[i].start + delta)
      return commit(state, next, { selected: i })
    }
    case 'tap': {
      // Tap-to-sync: mark the selected line's start at the playhead and advance.
      if (!valid) return state
      const next = setStart(state, lines, i, action.time - state.offset)
      return commit(state, next, { selected: Math.min(lines.length - 1, i + 1) })
    }
    case 'offset': return commit(state, lines, { offset: r3(Math.max(-30, Math.min(30, action.value))) })
    case 'text': {
      if (!valid) return state
      const out = lines.slice()
      out[i] = touch({ ...lines[i], text: String(action.text ?? '').trim(), alt: action.alt === undefined ? lines[i].alt : String(action.alt).trim() })
      return commit(state, out)
    }
    case 'split': {
      if (!valid) return state
      const line = lines[i]
      const [a, b] = splitText(line.text, action.ratio ?? 0.5)
      if (!b) return state
      const [altA, altB] = line.alt ? splitText(line.alt, action.ratio ?? 0.5) : ['', '']
      const at = r3(action.time !== undefined && action.time > line.start + MIN_LINE && action.time < line.end - MIN_LINE ? action.time : line.start + (line.end - line.start) * (action.ratio ?? 0.5))
      const out = [...lines.slice(0, i), touch({ ...line, text: a, alt: altA, end: at }), touch({ ...line, text: b, alt: altB, start: at }), ...lines.slice(i + 1)]
      return commit(state, out, { selected: i })
    }
    case 'merge': {
      if (!valid || i + 1 >= lines.length) return state
      const a = lines[i], b = lines[i + 1]
      const join = (x, y) => (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(x) ? `${x}${y}` : `${x} ${y}`).trim()
      const merged = touch({ ...a, end: b.end, text: join(a.text, b.text), alt: join(a.alt, b.alt), confidence: 1 })
      return commit(state, [...lines.slice(0, i), merged, ...lines.slice(i + 2)], { selected: i })
    }
    case 'delete': {
      if (!valid) return state
      const out = lines.filter((_, k) => k !== i)
      return commit(state, out, { selected: Math.min(i, out.length - 1) })
    }
    case 'insert': {
      const t = clampTime(state, action.time ?? 0)
      const line = touch({ start: r3(t), end: r3(t + 2), text: action.text ?? '♪', alt: '', confidence: 1 })
      const out = [...lines, line].sort((a, b) => a.start - b.start)
      const k = out.indexOf(line)
      if (out[k + 1] && line.end > out[k + 1].start) line.end = out[k + 1].start
      if (out[k - 1] && out[k - 1].end > line.start) out[k - 1] = { ...out[k - 1], end: line.start }
      return commit(state, out, { selected: k })
    }
    case 'confirm': {
      if (!valid) return state
      const out = lines.slice(); out[i] = touch(lines[i])
      return commit(state, out)
    }
    case 'undo': {
      const last = state.past.at(-1)
      if (!last) return state
      return { ...state, ...last, past: state.past.slice(0, -1), future: [{ lines: state.lines, offset: state.offset, selected: state.selected }, ...state.future], dirty: true }
    }
    case 'redo': {
      const next = state.future[0]
      if (!next) return state
      return { ...state, ...next, future: state.future.slice(1), past: [...state.past, { lines: state.lines, offset: state.offset, selected: state.selected }], dirty: true }
    }
    case 'saved': return { ...state, dirty: false }
    default: return state
  }
}

export const isUncertain = line => (line.confidence ?? 1) < LOW_CONFIDENCE
export function nextUncertain(state, from = state.selected) {
  const n = state.lines.length
  for (let k = 1; k <= n; k++) { const j = (from + k + n) % n; if (isUncertain(state.lines[j])) return j }
  return -1
}
export const uncertainCount = state => state.lines.filter(isUncertain).length

/** Line index active at time t (offset applied). */
export function lineAt(state, t) {
  const x = t - state.offset
  let lo = 0, hi = state.lines.length - 1, found = -1
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (state.lines[mid].start <= x) { found = mid; lo = mid + 1 } else hi = mid - 1 }
  return found
}

/** Lines with the global offset baked in (for saving / preview). */
export function exportLines(state) {
  return state.lines.map(line => ({ ...line, start: r3(Math.max(0, line.start + state.offset)), end: r3(Math.max(0, line.end + state.offset)) }))
}

/** Cues for the MV canvas player ({ time, end, en, zh }). */
export function linesToCues(lines) {
  return lines.map(line => ({ time: line.start, end: line.end, en: line.text, zh: line.alt ?? '' }))
}
