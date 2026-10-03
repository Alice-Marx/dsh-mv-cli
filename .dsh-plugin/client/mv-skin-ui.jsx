/** Skin state hook and the 外观 picker in the panel header. */
import React from 'react'
import { SKINS, loadSkin, saveSkin, skinClasses, resolveDark } from './mv-skin.mjs'
import { Popover, Segmented } from './mv-ui.jsx'

function readEnv() {
  const body = globalThis.document?.body
  const inHarness = Boolean(body && (body.hasAttribute('data-ds-dark-theme') || getComputedStyle(body).getPropertyValue('--dsw-alias-bg-base').trim()))
  return { hostDark: inHarness ? body.hasAttribute('data-ds-dark-theme') : null, systemDark: Boolean(globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches) }
}

export function useSkin() {
  const [settings, setSettings] = React.useState(loadSkin)
  const [env, setEnv] = React.useState(readEnv)
  React.useEffect(() => {
    const update = () => setEnv(readEnv())
    const observer = globalThis.MutationObserver && globalThis.document?.body ? new MutationObserver(update) : null
    observer?.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme', 'class', 'style'] })
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    media?.addEventListener?.('change', update)
    return () => { observer?.disconnect(); media?.removeEventListener?.('change', update) }
  }, [])
  const update = React.useCallback(change => setSettings(current => saveSkin({ ...current, ...change(current) })), [])
  const mode = settings.modes[settings.skin]
  return {
    settings, className: skinClasses(settings, env), dark: resolveDark(mode, env), mode,
    setSkin: skin => update(() => ({ skin })),
    setMode: value => update(current => ({ modes: { ...current.modes, [current.skin]: value } })),
  }
}

const Swatch = ({ id }) => <span className={`mv-skin-swatch mv-skin-swatch-${id}`} aria-hidden="true"><i /><i /><i /></span>
const PaletteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-1.8a1.7 1.7 0 0 0-1.2 2.9A1.7 1.7 0 0 1 13.8 22z" /><circle cx="7.5" cy="10.5" r="1" /><circle cx="12" cy="7" r="1" /><circle cx="16.5" cy="10.5" r="1" /></svg>

export function SkinPicker({ skin }) {
  const current = SKINS.find(s => s.id === skin.settings.skin)
  return (
    <Popover label="外观" title={`外观：${current.title}`} className="mv-skin-trigger" icon={<><PaletteIcon /><span>{current.name}</span></>}>
      <h3>外观</h3>
      <div className="mv-skin-list" role="radiogroup" aria-label="皮肤">
        {SKINS.map(s => (
          <button key={s.id} type="button" role="radio" aria-checked={s.id === skin.settings.skin} className="mv-skin-option" onClick={() => skin.setSkin(s.id)}>
            <Swatch id={s.id} />
            <span><b>{s.title}</b><small>{s.description}</small></span>
          </button>
        ))}
      </div>
      <p className="mv-skin-mode-label">「{current.title}」的明暗</p>
      <Segmented small label="明暗" value={skin.mode} onChange={skin.setMode}
        options={[{ value: 'auto', label: '跟随 Harness / 系统' }, { value: 'light', label: current.id === 'b' ? '浅色（纸质）' : '浅色' }, { value: 'dark', label: '深色' }]} />
      <p className="mv-caption">每个皮肤分别记住明暗设置；只保存在本机。</p>
    </Popover>
  )
}
