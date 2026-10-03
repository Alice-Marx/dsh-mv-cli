/**
 * The "MV 放映室" workbench panel, laid out like a music player:
 * library (built-in preset + MV packs) → now playing + where to play
 * (画布 / 面板终端 / 独立窗口) + one big Play button → the stage → settings.
 */
import React from 'react'
import { CanvasMv } from './canvas-mv.jsx'
import { MvTerminal } from './mv-terminal.jsx'
import { loadInfo, errorText } from './mv-terminal-state.mjs'
import { CLIENT_VERSION, versionNotice } from './remote-state.mjs'
import { Library } from './mv-library.jsx'
import { Alert, Icon, Popover, Segmented } from './mv-ui.jsx'
import { BUILTIN_ID, BUILTIN_PACK, loadActive, loadPackFromHost, loadRecent, saveActive } from './mv-pack-state.mjs'
import css from './mv.css'

export const DEST_KEY = 'dsh-mv.panel.destination'
const LEGACY_TAB_KEY = 'dsh-mv.panel.tab'

export function loadDestination(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(DEST_KEY)
    if (value === 'canvas' || value === 'panel' || value === 'console') return value
    return storage?.getItem(LEGACY_TAB_KEY) === 'terminal' ? 'panel' : 'canvas'
  } catch { return 'canvas' }
}

function About({ pack }) {
  const credits = [...(pack.pack.credits ?? []), pack.pack.notice].filter(Boolean)
  return (
    <>
      <h3>关于 MV 放映室 <span className="mv-faint">v{CLIENT_VERSION || '?'}</span></h3>
      <p>非官方同人工具。插件<b>不附带</b>任何音频、视频、歌词或美术素材，请使用你自己的文件；音频和歌词只在本机读取，不会上传。</p>
      <p>内置 world.execute(me) 预设：歌曲与歌词版权归 Mili；画面场景移植自 yym8224961/world.execute-me-ascii（野生大K），经原作者许可。</p>
      {!pack.builtin && <>
        <h3>当前 MV 包：{pack.pack.title}</h3>
        {credits.length > 0 ? <ul>{credits.map(item => <li key={item}>{item}</li>)}</ul> : <p>清单里没有署名信息。</p>}
        <p className="mv-wrap"><code>{pack.manifestPath}</code></p>
      </>}
      <p>其他歌曲：在曲库里「新建（模板）」做一个 MV 包，再「导入」。</p>
    </>
  )
}

const PlayIcon = ({ playing }) => playing ? <Icon.pause /> : <Icon.play />

export function MvPanel({ api }) {
  const [destination, setDestinationState] = React.useState(loadDestination)
  const [info, setInfo] = React.useState({ status: 'loading', value: null, error: '' })
  const [terminalSeen, setTerminalSeen] = React.useState(() => loadDestination() !== 'canvas')
  const [canvasState, setCanvasState] = React.useState({ playing: false, hasAudio: false })
  const [terminalState, setTerminalState] = React.useState({ canPlay: false, running: false, busy: false, label: '', confirming: false })
  const canvasRef = React.useRef(null)
  const terminalRef = React.useRef(null)
  const setDestination = value => {
    if (value !== 'canvas' && canvasState.playing) canvasRef.current?.pause()
    setDestinationState(value); if (value !== 'canvas') setTerminalSeen(true)
    try { globalThis.localStorage?.setItem(DEST_KEY, value) } catch { /* ignore */ }
  }
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
  const platform = info.value?.platform
  const consoleOff = Boolean(platform) && platform !== 'win32'

  const canvas = destination === 'canvas'
  const primary = canvas
    ? { label: canvasState.playing ? '暂停' : '播放', disabled: false, playing: canvasState.playing, run: () => canvasRef.current?.toggle() }
    : { label: terminalState.running && destination === 'panel' ? '正在播放' : (terminalState.busy ? '检查中…' : terminalState.label || '播放'), disabled: !terminalState.canPlay, playing: false, run: () => terminalRef.current?.primary() }
  const hint = canvas
    ? (canvasState.hasAudio ? '画面以音频为时钟逐帧渲染；点一下画面后可用键盘控制。' : '还没有选择音频：可以先静音观看，或在下方选择你的歌曲。')
    : terminalState.confirming ? '请在下方核对将要执行的命令，确认后才会启动。'
      : terminalState.running && destination === 'panel' ? '播放器正在下方的面板终端中运行。'
        : terminalState.canPlay ? '点播放后会先显示将要执行的完整命令，确认后才启动。' : '先在下方完成播放器设置（路径会自动检查）。'
  const renderer = pack.pack.canvas?.renderer === 'world-execute-me' ? 'world.execute(me) 场景' : '通用画面（频谱 + 歌词）'

  return (
    <div className="mv-root">
      <style>{css}</style>
      <header className="mv-head">
        <h1 className="mv-title">MV 放映室</h1>
        <span className="mv-spacer" />
        {notice && <span className="mv-pill mv-pill-warn" role="status" title={notice}>⚠ 后台版本不一致 · 请完全重启 Harness</span>}
        <Popover label="关于与版权" icon={<Icon.info />}><About pack={pack} /></Popover>
      </header>

      <Library api={api} active={pack} recent={recent} onSelect={id => void selectPack(id)} onLoaded={onLoaded} onRecent={setRecent} />
      {packError && <Alert kind="error"><p className="mv-wrap">{packError}</p></Alert>}

      <section className="mv-hero" aria-label="正在播放">
        <div style={{ minWidth: 0 }}>
          <p className="mv-section-label" style={{ margin: 0 }}>正在播放</p>
          <h2 className="mv-hero-title">{pack.pack.title}</h2>
          <p className="mv-hero-sub">
            <span>{pack.pack.artist || '未知艺术家'}</span>
            <span className="mv-chip">{pack.builtin ? '内置预设' : 'MV 包'}</span>
            {canvas && <span className="mv-chip">{renderer}</span>}
            {!canvas && !pack.builtin && pack.terminal && <span className="mv-chip">外部渲染：{pack.terminal.label}</span>}
          </p>
        </div>
        <div className="mv-hero-actions">
          <Segmented label="在哪里播放" value={destination} onChange={setDestination} options={[
            { value: 'canvas', label: '画布', title: '在面板里用画布渲染（推荐，音画同步最好）' },
            { value: 'panel', label: '面板终端', title: '在面板里的终端中运行你本机的播放器' },
            { value: 'console', label: '独立窗口', disabled: consoleOff, title: consoleOff ? '独立控制台窗口只在 Windows 上可用' : '在真实的 Windows 控制台窗口中播放（无转发延迟）' },
          ]} />
          <button type="button" className="mv-play-big" disabled={primary.disabled} onClick={primary.run} aria-label={primary.label}>
            <PlayIcon playing={primary.playing} />{primary.label}
          </button>
        </div>
        <p className="mv-hero-hint">{hint}</p>
      </section>

      <div className={canvas ? '' : 'mv-hidden'}>
        <CanvasMv ref={canvasRef} api={api} pack={pack} defaultFontSize={info.value?.canvasFontSize ?? 14} onState={setCanvasState} />
      </div>
      {terminalSeen && <div className={canvas ? 'mv-hidden' : ''}>
        <MvTerminal ref={terminalRef} api={api} info={info.value} infoError={info.status === 'error' ? info.error : ''} reloadInfo={reloadInfo} pack={pack}
          destination={destination === 'console' ? 'console' : 'panel'} onState={setTerminalState} />
      </div>}
    </div>
  )
}
