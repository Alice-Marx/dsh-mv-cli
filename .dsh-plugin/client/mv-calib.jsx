/**
 * 歌词校准编辑器 (under the canvas player). Waveform (vocal stem when the
 * lyrics engine wrote one) with draggable lyric blocks, global offset,
 * tap-to-sync, nudge keys, split/merge, undo/redo, low-confidence jump and a
 * live preview on the MV canvas. Save writes lyrics.lrc + timing.json +
 * mv.json through the Host (each previous version is backed up).
 * Interaction ideas adapted from TKCB/King-LRC-Waveform-Editor (MIT).
 */
import React from 'react'
import { SKIN_EVENT } from './mv-skin.mjs'
import { Alert } from './mv-ui.jsx'
import { calibReduce, createCalib, exportLines, isUncertain, lineAt, linesToCues, nextUncertain, uncertainCount, NUDGE } from './mv-calib-state.mjs'
import { linesFromText } from '../shared/mv-align.mjs'
import { readAnalysisFile, saveCalibration } from './mv-auto.mjs'
import { decodeToChannels } from './mv-wav.mjs'

export const PEAKS_PER_SECOND = 100
const fmt = t => { const v = Math.max(0, t); const m = Math.floor(v / 60); return `${m}:${(v - m * 60).toFixed(2).padStart(5, '0')}` }
const sign = v => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)} s`

/** Peak envelope (0..1) of decoded channels. */
export function peaksOf(channels, sampleRate, perSecond = PEAKS_PER_SECOND) {
  const step = Math.max(1, Math.floor(sampleRate / perSecond))
  const n = Math.ceil((channels[0]?.length ?? 0) / step)
  const out = new Float32Array(n)
  let max = 1e-6
  for (let i = 0; i < n; i++) {
    let peak = 0
    for (const data of channels) for (let j = i * step, end = Math.min(data.length, j + step); j < end; j += 4) { const v = Math.abs(data[j]); if (v > peak) peak = v }
    out[i] = peak; if (peak > max) max = peak
  }
  for (let i = 0; i < n; i++) out[i] /= max
  return out
}

const reducer = (state, action) => (action.type === 'reset' ? action.state : calibReduce(state, action))

/**
 * props: api, pack, lyricsText, audioFile, duration, player { time(), seek(t), play(), pause(), playing() }, onPreview(cues|null)
 */
export function CalibEditor({ api, pack, lyricsText, audioFile, duration, player, onPreview }) {
  const [state, dispatch] = React.useReducer(reducer, null, () => createCalib([], { duration }))
  const [tap, setTap] = React.useState(false)
  const [editing, setEditing] = React.useState(-1)
  const [draft, setDraft] = React.useState({ text: '', alt: '' })
  const [peaks, setPeaks] = React.useState({ values: null, source: '' })
  const [view, setView] = React.useState({ span: 12 })
  const [message, setMessage] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [now, setNow] = React.useState(0)
  const canvas = React.useRef(null)
  const box = React.useRef(null)
  const drag = React.useRef(null)
  const listRef = React.useRef(null)
  const manifestPath = pack?.manifestPath ?? ''

  // Load lines: timing.json (with confidence) when present, else the pack's LRC.
  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      let lines = [], fromTiming = false
      if (api?.analysisRead && manifestPath) {
        try {
          const bytes = await readAnalysisFile(api, manifestPath, 'timing')
          if (bytes) { lines = JSON.parse(new TextDecoder().decode(bytes)).lines ?? []; fromTiming = lines.length > 0 }
        } catch { lines = [] }
      }
      if (!lines.length && lyricsText) { const parsed = linesFromText(lyricsText); if (parsed.timed) lines = parsed.lines.map(line => ({ ...line, confidence: 1, source: 'lrc' })) }
      if (!cancelled) dispatch({ type: 'reset', state: createCalib(lines, { duration, offset: fromTiming ? 0 : (pack?.pack?.lyrics?.offset ?? 0) }) })
    })()
    return () => { cancelled = true }
  }, [manifestPath, pack?.loadedAt, lyricsText])

  // Waveform: the vocal stem from the engine when it exists, else the song.
  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        let bytes = null, source = ''
        if (api?.analysisRead && manifestPath) { try { bytes = await readAnalysisFile(api, manifestPath, 'vocals'); source = '人声' } catch { bytes = null } }
        if (!bytes && audioFile) { bytes = new Uint8Array(await audioFile.arrayBuffer()); source = '原曲' }
        if (!bytes) return
        const decoded = await decodeToChannels(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
        if (!cancelled) setPeaks({ values: peaksOf(decoded.channels, decoded.sampleRate), source })
      } catch { if (!cancelled) setPeaks({ values: null, source: '' }) }
    })()
    return () => { cancelled = true }
  }, [manifestPath, pack?.loadedAt, audioFile])

  // Live preview on the MV canvas.
  React.useEffect(() => { if (state.lines.length && state.dirty) onPreview?.(linesToCues(exportLines(state))) }, [state.lines, state.offset])
  React.useEffect(() => () => onPreview?.(null), [])

  // Playhead.
  React.useEffect(() => { let raf = 0; const tick = () => { raf = requestAnimationFrame(tick); setNow(player?.time?.() ?? 0) }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf) }, [player])

  const total = duration || state.lines.at(-1)?.end || 60
  const left = Math.max(0, Math.min(Math.max(0, total - view.span), now - view.span * 0.3))
  const toX = (t, w) => ((t - left) / view.span) * w
  const toT = (x, w) => left + (x / w) * view.span

  // Redraw right away when the skin / light-dark changes (colours come from CSS variables).
  const [, repaint] = React.useReducer(n => n + 1, 0)
  React.useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(repaint) }
    globalThis.addEventListener?.(SKIN_EVENT, on)
    return () => { cancelAnimationFrame(raf); globalThis.removeEventListener?.(SKIN_EVENT, on) }
  }, [])
  // Draw.
  React.useEffect(() => {
    const el = canvas.current
    if (!el) return
    const dpr = globalThis.devicePixelRatio || 1
    const w = el.clientWidth, h = el.clientHeight
    if (el.width !== Math.round(w * dpr)) el.width = Math.round(w * dpr)
    if (el.height !== Math.round(h * dpr)) el.height = Math.round(h * dpr)
    const g = el.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const css = getComputedStyle(el)
    const color = name => css.getPropertyValue(name).trim()
    g.clearRect(0, 0, w, h)
    g.fillStyle = color('--mv-bg') || '#111'; g.fillRect(0, 0, w, h)
    const mid = h * 0.62
    if (peaks.values) {
      g.fillStyle = color('--mv-muted') || '#888'
      const p = peaks.values
      for (let x = 0; x < w; x++) {
        const a = Math.floor(toT(x, w) * PEAKS_PER_SECOND), b = Math.max(a + 1, Math.floor(toT(x + 1, w) * PEAKS_PER_SECOND))
        let v = 0
        for (let i = Math.max(0, a); i < Math.min(p.length, b); i++) if (p[i] > v) v = p[i]
        const y = v * h * 0.34
        g.fillRect(x, mid - y, 1, y * 2 || 1)
      }
    }
    // seconds grid
    g.fillStyle = color('--mv-muted') || '#888'; g.font = '10px sans-serif'
    for (let s = Math.ceil(left); s < left + view.span; s++) { const x = toX(s, w); g.fillRect(x, 0, 1, s % 5 ? 3 : 7); if (!(s % 5)) g.fillText(fmt(s).replace(/\.00$/, ''), x + 2, 10) }
    state.lines.forEach((line, i) => {
      const a = line.start + state.offset, b = line.end + state.offset
      if (b < left || a > left + view.span) return
      const x0 = toX(a, w), x1 = toX(b, w)
      const low = isUncertain(line)
      g.globalAlpha = i === state.selected ? 0.55 : 0.3
      g.fillStyle = low ? '#e6b422' : (color('--mv-accent') || '#4c8dff')
      g.fillRect(x0, 14, Math.max(2, x1 - x0), 22)
      g.globalAlpha = 1
      g.fillStyle = low ? '#e6b422' : (color('--mv-accent') || '#4c8dff')
      g.fillRect(x0, 14, 2, h - 14)
      if (i === state.selected) { g.fillRect(x1 - 2, 14, 2, 22) }
      g.fillStyle = color('--mv-text') || '#eee'; g.font = '11px sans-serif'
      g.save(); g.beginPath(); g.rect(x0 + 3, 14, Math.max(0, x1 - x0 - 5), 22); g.clip(); g.fillText(line.text, x0 + 5, 29); g.restore()
    })
    const px = toX(now, w)
    g.fillStyle = '#ff5050'; g.fillRect(px, 0, 1.5, h)
  })

  const seek = t => { player?.seek?.(Math.max(0, t)) }
  const playLine = i => { const line = state.lines[i]; if (!line) return; dispatch({ type: 'select', index: i }); seek(line.start + state.offset - 2); player?.play?.() }
  const select = i => { dispatch({ type: 'select', index: i }); listRef.current?.querySelector(`[data-line="${i}"]`)?.scrollIntoView?.({ block: 'nearest' }) }

  const onPointerDown = event => {
    const el = canvas.current; const rect = el.getBoundingClientRect(); const x = event.clientX - rect.left; const w = rect.width
    const t = toT(x, w)
    const hit = state.lines.findIndex(line => { const x0 = toX(line.start + state.offset, w), x1 = toX(line.end + state.offset, w); return x >= x0 - 5 && x <= x1 + 5 })
    if (hit < 0 || event.clientY - rect.top > 40) { seek(t); return }
    const line = state.lines[hit]
    const x0 = toX(line.start + state.offset, w), x1 = toX(line.end + state.offset, w)
    const edge = Math.abs(x - x0) <= 6 ? 'start' : Math.abs(x - x1) <= 6 ? 'end' : 'move'
    drag.current = { index: hit, edge, grab: t - (line.start + state.offset), moved: false }
    el.setPointerCapture?.(event.pointerId)
    dispatch({ type: 'select', index: hit })
  }
  const onPointerMove = event => {
    const d = drag.current
    const el = canvas.current
    if (!el) return
    const rect = el.getBoundingClientRect(); const x = event.clientX - rect.left
    if (!d) {
      const w = rect.width
      const near = state.lines.some(line => Math.abs(x - toX(line.start + state.offset, w)) <= 6 || Math.abs(x - toX(line.end + state.offset, w)) <= 6)
      el.style.cursor = near && event.clientY - rect.top <= 40 ? 'ew-resize' : 'pointer'
      return
    }
    const t = toT(x, rect.width) - state.offset
    if (!d.moved) { d.moved = true }
    else dispatch({ type: 'undo' }) // coalesce a drag into one history step
    if (d.edge === 'start') dispatch({ type: 'setStart', index: d.index, time: t })
    else if (d.edge === 'end') dispatch({ type: 'setEnd', index: d.index, time: t })
    else dispatch({ type: 'move', index: d.index, time: t - d.grab })
  }
  const onPointerUp = () => { const d = drag.current; drag.current = null; if (d && !d.moved) playLine(d.index) }

  const onKeyDown = event => {
    if (editing >= 0 || event.target?.tagName === 'INPUT' || event.target?.tagName === 'TEXTAREA') return
    const key = event.key
    const mod = event.ctrlKey || event.metaKey
    let handled = true
    if (key === ' ') { if (tap) { dispatch({ type: 'tap', time: player?.time?.() ?? 0 }); select(Math.min(state.lines.length - 1, state.selected + 1)) } else if (player?.playing?.()) player.pause(); else player?.play?.() }
    else if (mod && key.toLowerCase() === 'z' && !event.shiftKey) dispatch({ type: 'undo' })
    else if (mod && (key.toLowerCase() === 'y' || (key.toLowerCase() === 'z' && event.shiftKey))) dispatch({ type: 'redo' })
    else if (key === 'ArrowLeft' || key === 'ArrowRight') dispatch({ type: 'nudge', edge: event.altKey ? 'end' : 'start', delta: (key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? NUDGE.large : NUDGE.small) })
    else if (key === 'ArrowUp') select(Math.max(0, state.selected - 1))
    else if (key === 'ArrowDown') select(Math.min(state.lines.length - 1, state.selected + 1))
    else if (key === 'Enter') playLine(state.selected)
    else if (key.toLowerCase() === 'n' && !mod) { const j = nextUncertain(state); if (j >= 0) { select(j); playLine(j) } }
    else if (key.toLowerCase() === 's' && !mod) { const t = (player?.time?.() ?? 0) - state.offset; dispatch({ type: 'split', time: t }) }
    else if (key.toLowerCase() === 'm' && !mod) dispatch({ type: 'merge' })
    else if (key.toLowerCase() === 'c' && !mod) dispatch({ type: 'confirm' })
    else if (key === 'Delete') dispatch({ type: 'delete' })
    else if (key.toLowerCase() === 't' && !mod) setTap(v => !v)
    else handled = false
    if (handled) { event.preventDefault(); event.stopPropagation() }
  }

  const startEdit = i => { setEditing(i); setDraft({ text: state.lines[i].text, alt: state.lines[i].alt ?? '' }) }
  const finishEdit = commit => { if (commit && editing >= 0) dispatch({ type: 'text', index: editing, text: draft.text, alt: draft.alt }); setEditing(-1); box.current?.focus() }

  const save = async () => {
    setSaving(true); setMessage(null)
    try {
      const lines = exportLines(state)
      const saved = await saveCalibration(api, manifestPath, { lines, title: pack?.pack?.title ?? '', artist: pack?.pack?.artist ?? '', source: 'calibrated', duration: total })
      dispatch({ type: 'saved' })
      if (state.offset) dispatch({ type: 'reset', state: { ...createCalib(lines, { duration }), dirty: false } })
      setMessage({ kind: 'ok', text: `已保存 lyrics.lrc、timing.json 和 mv.json${saved.backups ? `（旧版本备份在 .dsh-mv-backup\\，共 ${saved.backups} 个）` : ''}。` })
    } catch (failure) { setMessage({ kind: 'error', text: `保存失败：${failure?.message ?? failure}` }) }
    finally { setSaving(false) }
  }

  const low = uncertainCount(state)
  const active = lineAt(state, now)
  if (!manifestPath) return null
  return (
    <details className="mv-details mv-calib" open={low > 0 || undefined}>
      <summary>歌词校准 <span className="mv-caption">{state.lines.length ? `${state.lines.length} 句${low ? ` · ${low} 句待确认（黄色）` : ' · 全部已确认'}${state.dirty ? ' · 未保存' : ''}` : '还没有带时间的歌词：先用「自动制作」或选择 LRC'}</span></summary>
      <div className="mv-details-body" ref={box} tabIndex={0} onKeyDown={onKeyDown} aria-label="歌词校准编辑器（点击后可用键盘）">
        <div className="mv-row mv-calib-tools">
          <button type="button" className={`mv-button mv-button-small${tap ? '' : ' mv-button-secondary'}`} aria-pressed={tap} title="打点模式（T）：播放时每按一次空格，把当前句的开始时间设为此刻并跳到下一句" onClick={() => { setTap(v => !v); box.current?.focus() }}>{tap ? '● 打点中（空格）' : '打点模式'}</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!low} title="下一句待确认（N）" onClick={() => { const j = nextUncertain(state); if (j >= 0) { select(j); playLine(j) } }}>下一个不确定 ▸</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!state.past.length} title="撤销（Ctrl+Z）" onClick={() => dispatch({ type: 'undo' })}>撤销</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!state.future.length} title="重做（Ctrl+Y）" onClick={() => dispatch({ type: 'redo' })}>重做</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={state.selected < 0} title="在播放头处拆分（S）" onClick={() => dispatch({ type: 'split', time: now - state.offset })}>拆分</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={state.selected < 0 || state.selected >= state.lines.length - 1} title="与下一句合并（M）" onClick={() => dispatch({ type: 'merge' })}>合并</button>
          <label className="mv-calib-offset" title="整体偏移：所有句子一起前后移动">整体偏移 <input type="range" min={-5} max={5} step={0.01} value={state.offset} onChange={event => dispatch({ type: 'offset', value: Number(event.target.value) })} aria-label="整体偏移" /> <span className="mv-caption">{sign(state.offset)}</span></label>
          <span className="mv-stepper" title="波形缩放">
            <button type="button" aria-label="放大" onClick={() => setView(v => ({ span: Math.max(3, v.span / 1.5) }))}>＋</button>
            <span>{Math.round(view.span)} s</span>
            <button type="button" aria-label="缩小" onClick={() => setView(v => ({ span: Math.min(120, v.span * 1.5) }))}>−</button>
          </span>
          <button type="button" className="mv-button mv-button-small" disabled={!state.dirty || saving || !state.lines.length} onClick={() => void save()}>{saving ? '正在保存…' : '保存'}</button>
        </div>
        <canvas ref={canvas} className="mv-calib-wave" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onWheel={event => { if (event.ctrlKey) { setView(v => ({ span: Math.min(120, Math.max(3, v.span * (event.deltaY > 0 ? 1.2 : 1 / 1.2))) })); event.preventDefault() } else seek(now + (event.deltaY > 0 ? 1 : -1) * view.span * 0.1) }}
          aria-label={`波形（${peaks.source || '未解码'}）：拖动色块两端改开始/结束，拖中间整体移动，点空白处跳转`} />
        <div className="mv-caption mv-calib-hint">波形：{peaks.source || '解码中…'} · 点一句从前 2 秒播放 · ←/→ 微调 ±50 ms（Shift ±500 ms，Alt 调结束）· ↑/↓ 选句 · 双击改字 · S 拆分 · M 合并 · C 确认 · N 下一个不确定 · Ctrl+Z / Ctrl+Y</div>
        <ol className="mv-calib-lines" ref={listRef}>
          {state.lines.map((line, i) => (
            <li key={i} data-line={i} className={`${i === state.selected ? 'mv-selected ' : ''}${isUncertain(line) ? 'mv-uncertain ' : ''}${i === active ? 'mv-active' : ''}`}
              onClick={() => playLine(i)} onDoubleClick={() => startEdit(i)} title={`置信度 ${Math.round((line.confidence ?? 1) * 100)}% · 来源 ${line.source ?? ''}`}>
              <span className="mv-calib-time">{fmt(line.start + state.offset)}</span>
              {editing === i
                ? <span className="mv-calib-edit" onClick={event => event.stopPropagation()}>
                    <input autoFocus value={draft.text} onChange={event => setDraft(d => ({ ...d, text: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') finishEdit(true); if (event.key === 'Escape') finishEdit(false) }} aria-label="歌词" />
                    <input value={draft.alt} placeholder="翻译（可选）" onChange={event => setDraft(d => ({ ...d, alt: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') finishEdit(true); if (event.key === 'Escape') finishEdit(false) }} aria-label="翻译" />
                  </span>
                : <span className="mv-calib-text">{line.text}{line.alt ? <span className="mv-caption"> / {line.alt}</span> : null}</span>}
              {isUncertain(line) && <span className="mv-calib-flag" aria-label="待确认">?</span>}
            </li>
          ))}
        </ol>
        {message && <Alert kind={message.kind}><p className="mv-wrap">{message.text}</p></Alert>}
      </div>
    </details>
  )
}
