/** Small shared UI pieces of the MV 放映室 panel (icons, alerts, popover, segmented control). */
import React from 'react'

const svg = (children, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const Icon = Object.freeze({
  play: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg>,
  pause: () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor" /></svg>,
  stop: () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>,
  info: () => svg(<><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></>),
  keyboard: () => svg(<><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>),
  fullscreen: () => svg(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />),
  volume: () => svg(<><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></>),
  mute: () => svg(<><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l4 6M21 9l-4 6" /></>),
  plus: () => svg(<path d="M12 5v14M5 12h14" />),
  folder: () => svg(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />),
  close: () => svg(<path d="M6 6l12 12M18 6L6 18" />, 14),
  spark: () => svg(<><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" /></>),
})

export function Alert({ kind = 'info', children, actions = null }) {
  const icon = { error: '!', warn: '!', ok: '✓', info: 'i' }[kind] ?? 'i'
  return (
    <div className={`mv-alert mv-alert-${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      <span className="mv-alert-icon" aria-hidden="true">{icon}</span>
      <div className="mv-alert-body">{children}{actions && <div className="mv-row">{actions}</div>}</div>
    </div>
  )
}

/** Button + popover that closes on outside click or Escape. */
export function Popover({ label, icon, children, className = 'mv-icon-button', title }) {
  const [open, setOpen] = React.useState(false)
  const box = React.useRef(null)
  React.useEffect(() => {
    if (!open) return undefined
    const onDown = event => { if (!box.current?.contains(event.target)) setOpen(false) }
    const onKey = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <span className="mv-pop-anchor" ref={box}>
      <button type="button" className={className} aria-label={label} title={title ?? label} aria-expanded={open} aria-pressed={open} onClick={() => setOpen(value => !value)}>{icon}</button>
      {open && <div className="mv-popover" role="dialog" aria-label={label}>{typeof children === 'function' ? children(() => setOpen(false)) : children}</div>}
    </span>
  )
}

/** options: [{ value, label, disabled?, title? }] */
export function Segmented({ value, options, onChange, label, small = false }) {
  return (
    <div className={`mv-segmented${small ? ' mv-segmented-small' : ''}`} role="radiogroup" aria-label={label}>
      {options.map(option => (
        <button key={option.value} type="button" role="radio" aria-checked={value === option.value} disabled={option.disabled}
          title={option.title ?? ''} onClick={() => onChange(option.value)}>{option.label}</button>
      ))}
    </div>
  )
}

export const KEY_HELP = Object.freeze([
  ['空格 / Enter', '播放 / 暂停'], ['← / →', '后退 / 前进 5 秒'], ['R', '从头播放'], ['1 – 5', '跳到各章节'],
  [', / .', '上一句 / 下一句歌词'], ['[ / ]', '字幕偏移 ±0.1 秒'], ['Alt+[ / Alt+]', '音频同步 −/+ 0.1 秒'],
  ['+ / −', '音量'], ['M', '静音'], ['F / 双击', '全屏'], ['H', '画面内帮助'],
])

export function KeyHelp() {
  return (
    <>
      <h3>键盘快捷键</h3>
      <p>先点一下画面，再使用：</p>
      <div className="mv-keys">{KEY_HELP.map(([key, text]) => <React.Fragment key={key}><kbd>{key}</kbd><span>{text}</span></React.Fragment>)}</div>
    </>
  )
}
