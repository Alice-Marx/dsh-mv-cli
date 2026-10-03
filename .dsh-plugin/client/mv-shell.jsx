/**
 * Per-skin page structure (0.8.0). The panel content (library, now playing, canvas, calibration) is the
 * same in every skin; these pieces wrap it:
 *   A 现代音乐应用 — left sidebar navigation + recent list, page-wide bottom player bar.
 *   B 终端 — tmux-style tab bar on top, status line at the bottom.
 *   C Harness 原生 — no extra chrome (header + Fluent cards).
 * Navigation never unmounts anything (the canvas keeps playing): it opens the matching library dialog
 * or scrolls to the section.
 */
import React from 'react'
import { Icon } from './mv-ui.jsx'
import { asciiBar, fmtTime } from './mv-skin.mjs'

const svg = (children, size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const NavIcon = {
  library: () => svg(<><path d="M4 4v16M8 4v16" /><path d="M12 5l4-1 4 15-4 1z" /></>),
  now: () => svg(<><circle cx="8" cy="18" r="3" /><path d="M11 18V5l9-2v12" /><circle cx="17" cy="15" r="3" /></>),
  workshop: () => Icon.shop(),
  ai: () => Icon.spark(),
  calib: () => svg(<path d="M2 12h2l2-6 3 12 3-9 3 6 2-3h5" />),
  back: () => svg(<><path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" /></>),
  forward: () => svg(<><path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" /></>),
}

export const NAV = Object.freeze([
  { id: 'library', label: '曲库', tab: '曲库' },
  { id: 'now', label: '正在播放', tab: '播放' },
  { id: 'workshop', label: '创意工坊', tab: '工坊' },
  { id: 'ai', label: 'AI 制作', tab: 'AI 制作' },
  { id: 'calib', label: '歌词校准', tab: '校准' },
])

/** Polls the canvas transport (4×/s) while a skin shows a player bar or status line. */
export function useTransport(canvasRef, enabled) {
  const [state, setState] = React.useState({ t: 0, duration: 0, playing: false })
  React.useEffect(() => {
    if (!enabled) return undefined
    const read = () => {
      const c = canvasRef.current
      if (!c?.time) return
      const next = { t: c.time(), duration: c.duration(), playing: c.playing() }
      setState(prev => (Math.abs(prev.t - next.t) < 0.05 && prev.duration === next.duration && prev.playing === next.playing ? prev : next))
    }
    read()
    const id = setInterval(read, 250)
    return () => clearInterval(id)
  }, [canvasRef, enabled])
  return state
}

const Thumb = ({ cover, className = 'mv-thumb' }) => <span className={className} style={{ '--mv-hue': cover.hue }} aria-hidden="true">{cover.text}</span>

/** A: sidebar with brand, navigation and the recent list. */
export function SideNav({ active, go, calibOk, items, activeId, onSelect, playing }) {
  return (
    <aside className="mv-side" aria-label="导航">
      <div className="mv-side-in">
      <div className="mv-side-brand"><span className="mv-side-logo" aria-hidden="true">&gt;_</span><span><b>MV 放映室</b><small>dsh-mv</small></span></div>
      <nav className="mv-side-nav">
        {NAV.map(item => {
          const Ico = NavIcon[item.id]
          const disabled = item.id === 'calib' && !calibOk
          return (
            <button key={item.id} type="button" className="mv-side-item" aria-current={active === item.id ? 'page' : undefined} disabled={disabled}
              title={disabled ? '选择一个 MV 包（非内置预设）后可用' : item.label} onClick={() => go(item.id)}>
              <Ico /><span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <p className="mv-side-h">最近播放</p>
      <ul className="mv-side-recent">
        {items.map(item => (
          <li key={item.id}>
            <button type="button" aria-pressed={item.id === activeId} title={item.title} onClick={() => onSelect(item.id)}>
              <Thumb cover={item.cover} />
              <span className="mv-side-recent-text"><b>{item.title}</b><small>{item.sub}</small></span>
              {item.id === activeId && playing && <span className="mv-eq" aria-label="播放中"><i /><i /><i /></span>}
            </button>
          </li>
        ))}
      </ul>
      </div>
    </aside>
  )
}

/** A: page-wide bottom player bar (sticky to the bottom of the panel's scroll area). */
export function PlayerBar({ title, artist, cover, transport, canvas, onShow }) {
  const { t, duration, playing } = transport
  const c = () => canvas()
  return (
    <footer className="mv-bar" aria-label="播放条">
      <button type="button" className="mv-bar-now" onClick={onShow} title="回到画面">
        <Thumb cover={cover} className="mv-thumb mv-thumb-lg" />
        <span className="mv-bar-text"><b>{title}</b><small>{artist}</small></span>
      </button>
      <div className="mv-bar-mid">
        <div className="mv-bar-transport">
          <button type="button" className="mv-icon-button" aria-label="后退 5 秒" title="后退 5 秒" onClick={() => c()?.seekBy(-5)}><NavIcon.back /></button>
          <button type="button" className="mv-bar-play" aria-label={playing ? '暂停' : '播放'} onClick={() => c()?.toggle()}>{playing ? <Icon.pause /> : <Icon.play />}</button>
          <button type="button" className="mv-icon-button" aria-label="前进 5 秒" title="前进 5 秒" onClick={() => c()?.seekBy(5)}><NavIcon.forward /></button>
        </div>
        <div className="mv-bar-seek">
          <span className="mv-time">{fmtTime(t)}</span>
          <input type="range" min={0} max={Math.max(1, duration)} step={0.1} value={Math.min(Math.max(0, t), Math.max(1, duration))} aria-label="进度（播放条）"
            style={{ '--p': `${duration > 0 ? Math.min(100, (t / duration) * 100) : 0}%` }} onChange={event => c()?.seek(Number(event.target.value))} />
          <span className="mv-time">{fmtTime(duration)}</span>
        </div>
      </div>
      <div className="mv-bar-right">
        <button type="button" className="mv-icon-button" aria-label="全屏" title="全屏（F）" onClick={() => c()?.fullscreen()}><Icon.fullscreen /></button>
      </div>
    </footer>
  )
}

/** B: tmux-like window list. */
export function TmuxTabs({ active, go, calibOk }) {
  return (
    <nav className="mv-tmux" aria-label="导航">
      <span className="mv-tmux-session">[dsh-mv]</span>
      {NAV.map((item, i) => {
        const disabled = item.id === 'calib' && !calibOk
        return (
          <button key={item.id} type="button" className="mv-tmux-tab" aria-current={active === item.id ? 'page' : undefined} disabled={disabled}
            title={disabled ? '选择一个 MV 包（非内置预设）后可用' : item.label} onClick={() => go(item.id)}>
            {i}:{item.tab}{active === item.id ? '*' : ''}
          </button>
        )
      })}
    </nav>
  )
}

/** B: status line (mode, title, ASCII progress, time, clock). */
export function StatusLine({ title, artist, transport, canvas, active }) {
  const { t, duration, playing } = transport
  const [clock, setClock] = React.useState(() => new Date())
  React.useEffect(() => { const id = setInterval(() => setClock(new Date()), 30_000); return () => clearInterval(id) }, [])
  const hhmm = `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}`
  return (
    <footer className="mv-status" aria-label="状态栏">
      <button type="button" className="mv-status-mode" aria-pressed={playing} onClick={() => canvas()?.toggle()}>{playing ? <Icon.pause /> : <Icon.play />}{playing ? 'PLAYING' : 'PAUSED'}</button>
      <span className="mv-status-title">{title}<em> — {artist}</em></span>
      <span className="mv-status-bar" aria-hidden="true">{asciiBar(t, duration)}</span>
      <span className="mv-status-time">{fmtTime(t)}/{fmtTime(duration)}</span>
      <span className="mv-spacer" />
      <span className="mv-status-win">{NAV.findIndex(item => item.id === active)}:{NAV.find(item => item.id === active)?.tab ?? '曲库'}</span>
      <span className="mv-status-clock">{hhmm}</span>
    </footer>
  )
}
