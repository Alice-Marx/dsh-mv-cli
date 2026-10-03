/** The "MV 放映室" workbench panel: canvas MV and the MV terminal. */
import React from 'react'
import { CanvasMv } from './canvas-mv.jsx'
import { MvTerminal } from './mv-terminal.jsx'
import { loadInfo, errorText } from './mv-terminal-state.mjs'
import { CLIENT_VERSION, versionNotice } from './remote-state.mjs'
import { PackBar } from './mv-pack-bar.jsx'
import { BUILTIN_ID, BUILTIN_PACK, loadActive, loadPackFromHost, loadRecent, saveActive } from './mv-pack-state.mjs'
import css from './mv.css'

const TAB_KEY = 'dsh-mv.panel.tab'

export function MvPanel({ api }) {
  const [tab, setTabState] = React.useState(() => { try { return globalThis.localStorage?.getItem(TAB_KEY) === 'terminal' ? 'terminal' : 'canvas' } catch { return 'canvas' } })
  const [info, setInfo] = React.useState({ status: 'loading', value: null, error: '' })
  const setTab = value => { setTabState(value); try { globalThis.localStorage?.setItem(TAB_KEY, value) } catch { /* ignore */ } }
  const reloadInfo = React.useCallback(async () => {
    try { const value = await loadInfo(api); setInfo({ status: 'ready', value, error: '' }) }
    catch (error) { setInfo({ status: 'error', value: null, error: errorText(error, '无法连接 MV 插件后台。') }) }
  }, [api])
  React.useEffect(() => { void reloadInfo() }, [reloadInfo])
  const [pack, setPack] = React.useState(BUILTIN_PACK)
  const [recent, setRecent] = React.useState(loadRecent)
  const [packError, setPackError] = React.useState('')
  const selectPack = React.useCallback(async id => {
    setPackError('')
    if (id === BUILTIN_ID || !id.startsWith('pack:')) { setPack(BUILTIN_PACK); saveActive(BUILTIN_ID); return }
    try { const loaded = await loadPackFromHost(api, id.slice(5)); setPack(loaded); saveActive(loaded.id) }
    catch (error) { setPackError(`无法读取 MV 包 ${id.slice(5)}：${errorText(error, '')}`); setPack(BUILTIN_PACK); saveActive(BUILTIN_ID) }
  }, [api])
  // Reopen the last pack (reading its mv.json only; nothing is run).
  React.useEffect(() => { const id = loadActive(); if (id !== BUILTIN_ID) void selectPack(id) }, [selectPack])
  const onLoaded = loaded => { setPack(loaded); saveActive(loaded.id); setPackError('') }
  const notice = info.status === 'ready' ? versionNotice({ hostVersion: info.value?.hostVersion }) : ''
  return (
    <div className="mv-root">
      <style>{css}</style>
      <header className="mv-head">
        <div>
          <h1 className="mv-title">MV 放映室</h1>
          <p className="mv-caption">非官方同人工具。插件不附带任何音频、视频或歌词，请使用你自己的文件。内置 world.execute(me) 预设：歌曲与歌词版权归 Mili；画面场景移植自 yym8224961/world.execute-me-ascii（经作者许可）。其他歌曲请用「MV 包」。</p>
        </div>
        <span className="mv-caption">v{CLIENT_VERSION || '?'}</span>
      </header>
      {notice && <div className="mv-banner" role="alert">{notice}</div>}
      <PackBar api={api} active={pack} recent={recent} onSelect={id => void selectPack(id)} onLoaded={onLoaded} onRecent={setRecent} />
      {packError && <div className="mv-banner" role="alert">{packError}</div>}
      {info.status === 'error' && tab === 'terminal' && <div className="mv-banner" role="alert">{info.error}</div>}
      <div className="mv-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'canvas'} onClick={() => setTab('canvas')}>画布 MV</button>
        <button type="button" role="tab" aria-selected={tab === 'terminal'} onClick={() => setTab('terminal')}>MV 终端</button>
      </div>
      <div style={{ display: tab === 'canvas' ? 'block' : 'none' }}><CanvasMv api={api} pack={pack} defaultFontSize={info.value?.canvasFontSize ?? 14} /></div>
      {tab === 'terminal' && <MvTerminal api={api} info={info.value} reloadInfo={reloadInfo} pack={pack} />}
    </div>
  )
}
