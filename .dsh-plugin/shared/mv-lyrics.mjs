/**
 * Lyric loaders. The plugin ships no lyric text: the user picks an LRC / SRT
 * file (bilingual: one English line and one Chinese line per cue, or two
 * timestamps with the same time), or the `lyrics.json` of their own local
 * world.execute-me-ascii copy. Everything becomes `{ time, end, en, zh }`.
 */

const CJK = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/

/** Split one cue's text lines into the English and Chinese rows. */
export function splitBilingual(lines) {
  const en = [], zh = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    // "English / 中文" or "English | 中文" on one line.
    const parts = line.split(/\s+[/|｜]\s+/)
    if (parts.length === 2 && !CJK.test(parts[0]) && CJK.test(parts[1])) { en.push(parts[0]); zh.push(parts[1]); continue }
    ;(CJK.test(line) ? zh : en).push(line)
  }
  return { en: en.join(' '), zh: zh.join(' ') }
}

function finish(cues, duration) {
  const sorted = cues.filter(c => Number.isFinite(c.time) && (c.en || c.zh)).sort((a, b) => a.time - b.time)
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[i + 1]
    if (!Number.isFinite(sorted[i].end) || sorted[i].end <= sorted[i].time) {
      sorted[i].end = next ? next.time : Math.min(duration, sorted[i].time + 5)
    }
  }
  return sorted.map(({ time, end, en, zh }) => ({ time: round3(time), end: round3(end), en: en ?? '', zh: zh ?? '' }))
}

const round3 = v => Math.round(v * 1000) / 1000

/** `[mm:ss.xx]` LRC (several stamps per line and `[offset:±ms]` supported). */
export function parseLrc(text, { duration = 1e9 } = {}) {
  const byTime = new Map()
  let offsetMs = 0
  const order = []
  for (const raw of String(text).replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const tag = /^\s*\[offset:\s*([+-]?\d+)\s*\]/i.exec(raw)
    if (tag) { offsetMs = Number(tag[1]); continue }
    const stamps = []
    let rest = raw
    let m
    while ((m = /^\s*\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]/.exec(rest))) {
      stamps.push(Number(m[1]) * 60 + Number(m[2].replace(':', '.')))
      rest = rest.slice(m[0].length)
    }
    if (!stamps.length) continue
    for (const t of stamps) {
      const key = round3(t)
      if (!byTime.has(key)) { byTime.set(key, []); order.push(key) }
      byTime.get(key).push(rest)
    }
  }
  // LRC offset: positive values make lyrics appear sooner.
  const shift = -offsetMs / 1000
  const cues = []
  for (const t of order) {
    const lines = byTime.get(t)
    if (lines.every(line => !line.trim())) { cues.push({ time: t + shift, blank: true }); continue }
    cues.push({ time: t + shift, ...splitBilingual(lines) })
  }
  // A blank stamped line ends the previous cue.
  cues.sort((a, b) => a.time - b.time)
  const out = []
  for (const cue of cues) {
    if (cue.blank) { const prev = out.at(-1); if (prev && !Number.isFinite(prev.end)) prev.end = cue.time; continue }
    out.push(cue)
  }
  return finish(out, duration)
}

const SRT_TIME = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/
const srtSeconds = m => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, '0')) / 1000

/** SubRip (also accepts WebVTT-style `.` separators). */
export function parseSrt(text, { duration = 1e9 } = {}) {
  const blocks = String(text).replace(/^\uFEFF/, '').replace(/\r/g, '').split(/\n\s*\n/)
  const cues = []
  for (const block of blocks) {
    const lines = block.split('\n')
    const at = lines.findIndex(line => line.includes('-->'))
    if (at < 0) continue
    const [a, b] = lines[at].split('-->')
    const ma = SRT_TIME.exec(a), mb = SRT_TIME.exec(b)
    if (!ma) continue
    const body = lines.slice(at + 1).map(line => line.replace(/<[^>]+>/g, ''))
    cues.push({ time: srtSeconds(ma), end: mb ? srtSeconds(mb) : NaN, ...splitBilingual(body) })
  }
  return finish(cues, duration)
}

/** world.execute-me-ascii `lyrics.json`: `[{time,end,en,zh}]`. */
export function parseLyricsJson(text, { duration = 1e9 } = {}) {
  const data = typeof text === 'string' ? JSON.parse(text.replace(/^\uFEFF/, '')) : text
  const list = Array.isArray(data) ? data : Array.isArray(data?.lyrics) ? data.lyrics : null
  if (!list) throw new Error('歌词 JSON 应为 [{ time, end, en, zh }] 数组。')
  return finish(list.map(item => ({
    time: Number(item?.time), end: Number(item?.end),
    en: typeof item?.en === 'string' ? item.en : '', zh: typeof item?.zh === 'string' ? item.zh : '',
  })), duration)
}

/** Pick the parser from the file name, falling back to sniffing the text. */
export function parseLyrics(name, text, options) {
  const lower = String(name ?? '').toLowerCase()
  const body = String(text)
  if (lower.endsWith('.json')) return parseLyricsJson(body, options)
  if (lower.endsWith('.srt') || lower.endsWith('.vtt')) return parseSrt(body, options)
  if (lower.endsWith('.lrc')) return parseLrc(body, options)
  if (/^\uFEFF?\s*(?:\{|\[\s*[{\]])/.test(body)) return parseLyricsJson(body, options)
  if (/-->/.test(body)) return parseSrt(body, options)
  return parseLrc(body, options)
}
