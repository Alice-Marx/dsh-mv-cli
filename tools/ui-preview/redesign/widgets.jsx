// Shared working widgets for the redesign mockups: generated covers, a live ASCII stage that runs the
// template's example scene scripts, the clock, the calibration editor and the AI stepper.
// Each direction (dir-a/b/c.jsx) composes them with its own markup; the CSS gives them their look.
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { TEMPLATE_ASSETS } from '../../../.dsh-plugin/shared/mv-template-assets.gen.mjs'
import { SCENE_RUNTIME_SOURCE, stripModuleSyntax, sceneContext } from '../../../.dsh-plugin/shared/mv-scene.mjs'
import { parseLrc } from '../../../.dsh-plugin/shared/mv-lyrics.mjs'
import { Icon } from './icons.jsx'
import { hash, fmt } from './data.mjs'

const RICH = JSON.parse(TEMPLATE_ASSETS['examples/rich-pack/mv.json'])
export const SECTIONS = RICH['x-dsh-mv-ai'].sections
export const CUES = parseLrc(TEMPLATE_ASSETS['examples/rich-pack/lyrics.placeholder.lrc']).map(c => ({ ...c, text: [c.en, c.zh].filter(Boolean).join(' / ') })).filter(c => c.text && !c.text.startsWith('('))
const CONF = [0.97, 0.93, 0.42, 0.88, 0.95, 0.9, 0.97, 0.36, 0.91, 0.94, 0.96, 0.89, 0.92, 0.95, 0.9, 0.55, 0.93, 0.96, 0.91, 0.94, 0.9]
export const cueAt = (cues, t) => cues.filter(c => c.time <= t && !(c.end <= t)).at(-1) ?? null
export const sectionAt = t => SECTIONS.find(s => t >= s.start && t < s.end) ?? SECTIONS.at(-1)

// ---------- clock ----------
export function useClock(t0 = 0, playing0 = false, duration = 120) {
  const [t, setT] = useState(t0), [playing, setPlaying] = useState(playing0)
  useEffect(() => {
    if (!playing) return
    let last = performance.now(), raf
    const tick = now => { setT(v => (v + (now - last) / 1000) % duration); last = now; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, duration])
  return { t, playing, duration, toggle: () => setPlaying(p => !p), seek: v => setT(Math.max(0, Math.min(duration, v))) }
}
export const bandsAt = (t, n = 48) => Array.from({ length: n }, (_, i) => Math.max(0, Math.min(1, 0.55 + 0.4 * Math.sin(t * 3.1 + i * 0.37) * (1 - i / (n * 1.4)) + 0.15 * Math.sin(t * 7.7 + i))))

// ---------- generated covers ----------
const wrap = (text, max) => { const out = []; let line = ''; for (const w of text.split(/\s+/).flatMap(w => w.length > max ? w.match(new RegExp(`.{1,${max}}`, 'g')) : [w])) { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w } else line = (line + ' ' + w).trim() } if (line) out.push(line); return out.slice(0, 3) }
export function Cover({ item, variant = 'A', className = '', alt = '' }) {
  if (item.cover) return <img className={`cover ${className}`} src={item.cover} alt={alt} draggable="false" />
  const h = hash(item.id + item.title), hue = h % 360, id = `g${h}`
  if (variant === 'B') {
    const neon = ['#39ff88', '#ffb000', '#3bd5ff', '#ff4fd8', '#ff3b5c'][h % 5], bars = '█▓▒░ '
    const rows = Array.from({ length: 7 }, (_, y) => Array.from({ length: 22 }, (_, x) => bars[(hash(`${item.id}${x},${y}`) >> 3) % 5]).join(''))
    return <svg className={`cover gen ${className}`} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={item.title}>
      <rect width="200" height="200" fill="#050806" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1="0" x2="200" y1={i * 20} y2={i * 20} stroke={neon} strokeOpacity=".07" />)}
      <text x="14" y="30" fill={neon} fillOpacity=".55" fontFamily="var(--mono)" fontSize="10">$ ./{item.id}.mv</text>
      {rows.map((r, y) => <text key={y} x="14" y={62 + y * 11} fill={neon} fillOpacity={0.12 + y * 0.05} fontFamily="var(--mono)" fontSize="10" xmlSpace="preserve">{r}</text>)}
      {wrap(item.title.toUpperCase(), 13).map((l, i) => <text key={i} x="14" y={158 + i * 18} fill={neon} fontFamily="var(--mono)" fontWeight="700" fontSize="16" style={{ filter: `drop-shadow(0 0 4px ${neon})` }}>{l}</text>)}
      <text x="14" y="190" fill="#9aa59f" fontFamily="var(--mono)" fontSize="9">{item.artist}</text>
    </svg>
  }
  if (variant === 'C') {
    return <svg className={`cover gen ${className}`} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={item.title}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${hue} 75% 90%)`} /><stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 70% 78%)`} /></linearGradient></defs>
      <rect width="200" height="200" fill={`url(#${id})`} />
      <circle cx="160" cy="40" r="70" fill="#fff" fillOpacity=".25" />
      <rect x="66" y="56" width="68" height="68" rx="18" fill="#fff" fillOpacity=".7" />
      <text x="100" y="103" textAnchor="middle" fill={`hsl(${hue} 45% 32%)`} fontSize="34" fontWeight="700" fontFamily="var(--sans)">{[...item.title][0]}</text>
      <text x="100" y="156" textAnchor="middle" fill={`hsl(${hue} 40% 22%)`} fontSize="13" fontWeight="600" fontFamily="var(--sans)">{item.title.length > 22 ? item.title.slice(0, 21) + '…' : item.title}</text>
      <text x="100" y="174" textAnchor="middle" fill={`hsl(${hue} 25% 35%)`} fontSize="10" fontFamily="var(--sans)">{item.artist}</text>
    </svg>
  }
  return <svg className={`cover gen ${className}`} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={item.title}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${hue} 85% 58%)`} /><stop offset="1" stopColor={`hsl(${(hue + 60) % 360} 80% 32%)`} /></linearGradient>
      <radialGradient id={`${id}r`} cx=".8" cy=".15" r=".7"><stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="200" height="200" fill={`url(#${id})`} /><rect width="200" height="200" fill={`url(#${id}r)`} />
    {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={30 + ((h >> (i * 3)) % 150)} cy={20 + ((h >> (i * 4)) % 100)} r={6 + i * 5} fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.5" />)}
    {wrap(item.title, 12).map((l, i, all) => <text key={i} x="16" y={176 - (all.length - 1 - i) * 24 - 16} fill="#fff" fontSize="22" fontWeight="800" fontFamily="var(--sans)" letterSpacing="-.5">{l}</text>)}
    <text x="16" y="182" fill="#fff" fillOpacity=".8" fontSize="11" fontWeight="500" fontFamily="var(--sans)">{item.artist}</text>
  </svg>
}

// ---------- live ASCII stage (runs the template's example scenes) ----------
const compiled = new Map()
function compile(key) {
  if (!compiled.has(key)) {
    // Mockup only: our own template examples, not user code (the panel runs scenes in its Worker sandbox).
    const factory = new Function(`${SCENE_RUNTIME_SOURCE}\n${stripModuleSyntax(TEMPLATE_ASSETS[key])}\n;return { render: typeof render === 'function' ? render : null, norm: __mvNormalize }`)
    compiled.set(key, factory())
  }
  return compiled.get(key)
}
export const PALETTES = {
  A: { bg: '#07070a', c: ['#4a4e5a', '#d8dbe3', '#ffffff', '#ffffff', '#ff375f', '#ff9f6b', '#c4e86b'] },
  B: { bg: '#030504', glow: true, c: ['#1f6b44', '#39ff88', '#b9ffd8', '#effff6', '#ff3b5c', '#ffb000', '#a6ff3b'] },
  Bl: { bg: '#f1ead8', c: ['#b4a27e', '#2a2216', '#000000', '#000000', '#c2410c', '#9a5b00', '#4d7c0f'] },
  C: { bg: '#0f1115', c: ['#4b5260', '#c9d1de', '#ffffff', '#ffffff', '#f25a5a', '#f7ad31', '#7aaaff'] },
}
export function Stage({ scene = 'examples/rich-pack/scenes.js', t, palette = 'A', cols = 96, rows = 30, title = 'Neon Terminal', artist = 'dsh-mv', className = '' }) {
  const ref = useRef(null), box = useRef(null), [w, setW] = useState(0)
  useEffect(() => { const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(box.current); return () => ro.disconnect() }, [])
  useEffect(() => {
    const cv = ref.current; if (!cv || !w) return
    const pal = PALETTES[palette], dpr = window.devicePixelRatio || 1, cw = w / cols, fs = cw / 0.6, lh = fs * 1.18
    cv.width = Math.round(w * dpr); cv.height = Math.round(rows * lh * dpr); cv.style.height = `${rows * lh}px`
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.fillStyle = pal.bg; g.fillRect(0, 0, w, rows * lh)
    let frame
    try {
      const s = compile(scene), cue = cueAt(CUES, t)
      const ctx = sceneContext({ t, duration: 120, title, artist, cue, next: CUES.find(c => c.time > t) ?? null, bands: bandsAt(t), sections: SECTIONS, bpm: 120, ready: true })
      frame = s.norm(s.render(t, cols, rows, ctx), cols, rows)
    } catch (e) { frame = { lines: [`scene error: ${e.message}`], styles: ['4'] } }
    g.font = `${fs}px "DejaVu Sans Mono", "Cascadia Mono", Consolas, monospace`; g.textBaseline = 'top'
    frame.lines.forEach((line, y) => {
      const st = frame.styles[y] || ''
      ;[...line].forEach((ch, x) => {
        if (ch === ' ') return
        const k = +(st[x] ?? 1), col = pal.c[k] ?? pal.c[1]
        g.fillStyle = col
        if (pal.glow && k >= 2) { g.shadowColor = col; g.shadowBlur = fs * 0.6 } else g.shadowBlur = 0
        g.fillText(ch, x * cw, y * lh + fs * 0.08)
      })
    })
  }, [t, w, scene, palette, cols, rows, title, artist])
  return <div ref={box} className={`stage ${className}`}><canvas ref={ref} aria-label="MV 画面" /></div>
}

// ---------- spectrum mini bars ----------
export function MiniBars({ t, n = 24, className = '' }) {
  return <div className={`minibars ${className}`} aria-hidden="true">{bandsAt(t, n).map((v, i) => <i key={i} style={{ height: `${12 + v * 88}%` }} />)}</div>
}

// ---------- seek bar ----------
export function Seek({ clock, className = '' }) {
  const pct = (clock.t / clock.duration) * 100
  return <div className={`seek ${className}`}>
    <span className="seek-time">{fmt(clock.t)}</span>
    <input type="range" min="0" max={clock.duration} step="0.1" value={clock.t} aria-label="进度" style={{ '--p': `${pct}%` }} onChange={e => clock.seek(+e.target.value)} />
    <span className="seek-time">{fmt(clock.duration)}</span>
  </div>
}

// ---------- calibration editor ----------
function waveData(n) { const out = []; let s = 12345; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const tt = i / 100, beat = Math.exp(-((tt % 0.5) * 9)); out.push(Math.min(1, 0.18 + 0.6 * beat * (0.7 + 0.3 * Math.sin(tt * 0.9)) + (s / 0x7fffffff) * 0.22)) } return out }
const WAVE = waveData(12000)
export function useCues() { return useState(() => CUES.map((c, i) => ({ id: i, time: c.time, end: c.end ?? c.time + 3.5, text: c.text, conf: CONF[i % CONF.length] }))) }
export function CalibEditor({ clock, cues, setCues, span = 14, toolbar = true, labels = {} }) {
  const area = useRef(null), cv = useRef(null), [sel, setSel] = useState(null), [w, setW] = useState(0)
  const t0 = Math.max(0, Math.min(120 - span, clock.t - span * 0.35))
  useEffect(() => { const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(area.current); return () => ro.disconnect() }, [])
  useEffect(() => {
    const c = cv.current; if (!c || !w) return
    const css = getComputedStyle(c), dpr = window.devicePixelRatio || 1, H = 112
    c.width = w * dpr; c.height = H * dpr; c.style.height = `${H}px`
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, H)
    const bar = 3, gap = 2, n = Math.floor(w / (bar + gap))
    for (let i = 0; i < n; i++) {
      const tt = t0 + (i / n) * span, v = WAVE[Math.floor(tt * 100) % WAVE.length], hh = v * (H - 16)
      g.fillStyle = tt < clock.t ? css.getPropertyValue('--wave-played') || '#888' : css.getPropertyValue('--wave') || '#aaa'
      g.beginPath(); if (g.roundRect) g.roundRect(i * (bar + gap), (H - hh) / 2, bar, hh, 1.5); else g.rect(i * (bar + gap), (H - hh) / 2, bar, hh); g.fill()
    }
  }, [w, t0, span, clock.t])
  const drag = (e, cue) => {
    e.preventDefault(); setSel(cue.id)
    const startX = e.clientX, orig = cue.time, len = cue.end - cue.time
    const move = ev => { const dt = ((ev.clientX - startX) / w) * span; setCues(cs => cs.map(c => c.id === cue.id ? { ...c, time: +(orig + dt).toFixed(2), end: +(orig + dt + len).toFixed(2) } : c)) }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const ticks = []; for (let s = Math.ceil(t0); s <= t0 + span; s++) ticks.push(s)
  const visible = cues.filter(c => c.end > t0 && c.time < t0 + span)
  const warn = cues.filter(c => c.conf < 0.6).length
  return <div className="cal">
    {toolbar && <div className="cal-toolbar" role="toolbar" aria-label="校准工具">
      <button className="btn ghost sm"><Icon name="tap" size={15} />{labels.tap ?? '打点'}</button>
      <button className="btn ghost sm"><Icon name="alert" size={15} />{labels.next ?? '下一个不确定'}<span className="count">{warn}</span></button>
      <span className="sep" />
      <button className="btn icon sm" aria-label="撤销"><Icon name="undo" size={15} /></button>
      <button className="btn icon sm" aria-label="重做"><Icon name="redo" size={15} /></button>
      <button className="btn icon sm" aria-label="拆分"><Icon name="scissors" size={15} /></button>
      <button className="btn icon sm" aria-label="合并"><Icon name="merge" size={15} /></button>
      <span className="sep" />
      <label className="cal-offset">{labels.offset ?? '整体偏移'}<input type="range" min="-2" max="2" step="0.05" defaultValue="0" style={{ '--p': '50%' }} /><b>+0.00 s</b></label>
      <span className="grow" />
      <button className="btn primary sm"><Icon name="save" size={15} />{labels.save ?? '保存'}</button>
    </div>}
    <div className="cal-track" ref={area}>
      <div className="cal-ruler">{ticks.map(s => <span key={s} style={{ left: `${((s - t0) / span) * 100}%` }}>{s % 2 === 0 ? fmt(s) : ''}</span>)}</div>
      <div className="cal-blocks">{visible.map(c => <div key={c.id} role="button" tabIndex={0} aria-label={`${c.text} ${fmt(c.time)}`}
        className={`cal-block${c.conf < 0.6 ? ' warn' : ''}${sel === c.id ? ' sel' : ''}${clock.t >= c.time && clock.t < c.end ? ' now' : ''}`}
        style={{ left: `${((c.time - t0) / span) * 100}%`, width: `${((c.end - c.time) / span) * 100}%` }} onPointerDown={e => drag(e, c)}><span>{c.text}</span></div>)}</div>
      <canvas ref={cv} className="cal-wave" aria-label="波形" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); clock.seek(t0 + ((e.clientX - r.left) / r.width) * span) }} />
      <div className="cal-head" style={{ left: `${((clock.t - t0) / span) * 100}%` }} />
    </div>
    <ol className="cal-lines">{cues.slice(Math.max(0, cues.findIndex(c => c.end > clock.t) - 2)).slice(0, 6).map(c =>
      <li key={c.id} className={`${c.conf < 0.6 ? 'warn' : ''}${clock.t >= c.time && clock.t < c.end ? ' now' : ''}`} onClick={() => clock.seek(c.time)}>
        <time>{fmt(c.time)}.{String(Math.round((c.time % 1) * 100)).padStart(2, '0')}</time><span className="txt">{c.text}</span>
        <span className="conf" title="置信度">{Math.round(c.conf * 100)}%</span></li>)}</ol>
  </div>
}

// ---------- AI stepper ----------
export function Stepper({ steps, className = '' }) {
  return <ol className={`stepper ${className}`}>{steps.map((s, i) => <li key={s.id} className={`step ${s.state}`}>
    <span className="step-dot">{s.state === 'done' ? <Icon name="check" size={14} stroke={3} /> : s.state === 'running' ? <Icon name="loader" size={14} stroke={3} className="spin" /> : <b>{i + 1}</b>}</span>
    <div className="step-body"><div className="step-title">{s.title}{s.took && <small>{s.took}</small>}</div><div className="step-detail">{s.detail}</div>
      {s.state === 'running' && <div className="step-bar" style={{ '--p': `${s.progress * 100}%` }}><i /></div>}</div>
  </li>)}</ol>
}
export function useFlag(init = false) { const [v, set] = useState(init); return [v, useCallback(() => set(x => !x), [])] }
