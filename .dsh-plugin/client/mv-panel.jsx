/**
 * The "MV 放映室" workbench panel, laid out like a music player:
 * library (MV packs; 创意工坊 when empty) → now playing + one big ▶ 播放
 * button → the canvas stage → settings.
 */
import React from 'react'
import { CanvasMv } from './canvas-mv.jsx'
import { loadInfo, errorText } from './mv-info.mjs'
import { CLIENT_VERSION, versionNotice } from './remote-state.mjs'
import { Library } from './mv-library.jsx'
import { Alert, Icon, Popover } from './mv-ui.jsx'
import { EMPTY_ID, EMPTY_PACK, noteDuration, loadActive, loadPackFromHost, loadRecent, placeholderPack, saveActive } from './mv-pack-state.mjs'
import css from './mv.css'
import skinCss from './mv-skins.css'
import { SkinPicker, useSkin } from './mv-skin-ui.jsx'
import { coverHue, coverInitials } from './mv-skin.mjs'
import { fitToHost } from './mv-host-fit.mjs'
import { PlayerBar, SideNav, StatusLine, TmuxTabs, useTransport } from './mv-shell.jsx'

const coverOf = pack => (pack.moved ? { hue: pack.moved.hue, text: pack.moved.cover } : pack.empty ? { hue: 210, text: '♪' } : { hue: coverHue(pack.pack.title), text: coverInitials(pack.pack.title) })

/** Keys of the removed 面板终端 / 独立窗口 modes (0.5.x and older); cleared once. */
export const LEGACY_KEYS = Object.freeze(['dsh-mv.panel.destination', 'dsh-mv.panel.tab', 'dsh-mv.terminal.form.v1'])
export function clearLegacy(storage = globalThis.localStorage) {
  try { for (const key of LEGACY_KEYS) storage?.removeItem(key) } catch { /* private mode */ }
}

function About({ pack }) {
  const credits = [...(pack.pack.credits ?? []), pack.pack.notice].filter(Boolean)
  return (
    <>
      <h3>关于 MV 放映室 <span className="mv-faint">v{CLIENT_VERSION || '?'}</span></h3>
      <p>非官方同人工具。插件<b>不附带</b>任何音频、视频或歌词，请使用你自己的文件；音频和歌词只在本机读取，不会上传。</p>
      <p>0.9.0 起插件不再内置任何 MV：以前的两个 world.execute(me) 预设已移到创意工坊，分别按各自的许可发布——场景移植自 <a href="https://github.com/yym8224961/world.execute-me-ascii" target="_blank" rel="noreferrer">yym8224961/world.execute-me-ascii</a>（野生大K，经原作者许可），dsh PV 移植自 <a href="https://github.com/MisakaZentai/world-execute-me-dsh-pv" target="_blank" rel="noreferrer">MisakaZentai/world-execute-me-dsh-pv</a>（代码 MIT，鲸鱼娘立绘 CC BY-NC-SA 4.0）。歌曲与歌词版权归 Mili。</p>
      <p>dsh-pv 渲染器（代码 MIT，© MisakaZentai 的移植）仍在插件里，它的数据和立绘随工坊包下载。</p>
      {!pack.empty && <>
        <h3>当前 MV 包：{pack.pack.title}</h3>
        {credits.length > 0 ? <ul>{credits.map(item => <li key={item}>{item}</li>)}</ul> : <p>清单里没有署名信息。</p>}
        {pack.pack.workshop?.source && <p>原作：<a href={pack.pack.workshop.source} target="_blank" rel="noreferrer">{pack.pack.workshop.source.replace(/^https:\/\/(github\.com\/)?/, '')}</a></p>}
        <p className="mv-wrap"><code>{pack.manifestPath}</code></p>
      </>}
      <p>其他歌曲：在曲库里打开「创意工坊」安装社区投稿的 MV 包（不含音频和歌词，用你自己的文件播放；脚本在沙箱里运行），点「用 AI 制作新 MV」让 Harness 的 Agent 帮你做，或「新建（模板）」手写一个 MV 包再「导入」。</p>
    </>
  )
}


export function MvPanel({ api, harness = null, initialAi = false, initialWorkshop = false, workshopIndex = null }) {
  const [info, setInfo] = React.useState({ status: 'loading', value: null, error: '' })
  const [canvasState, setCanvasState] = React.useState({ playing: false, hasAudio: false })
  const canvasRef = React.useRef(null)
  const skin = useSkin()
  React.useEffect(() => { clearLegacy() }, [])
  const reloadInfo = React.useCallback(async () => {
    try { const value = await loadInfo(api); setInfo({ status: 'ready', value, error: '' }) }
    catch (error) { setInfo({ status: 'error', value: null, error: errorText(error, '无法连接 MV 插件后台。') }) }
  }, [api])
  React.useEffect(() => { void reloadInfo() }, [reloadInfo])
  const [pack, setPack] = React.useState(() => placeholderPack(loadActive()))
  const [recent, setRecent] = React.useState(loadRecent)
  const [packError, setPackError] = React.useState('')
  const selectPack = React.useCallback(async id => {
    setPackError('')
    // 0.8.x preset ids (and "empty") become placeholders; the moved ones keep their id so the hint stays.
    if (!id.startsWith('pack:')) { setPack(placeholderPack(id)); return }
    try { const loaded = await loadPackFromHost(api, id.slice(5)); setPack(loaded); saveActive(loaded.id); setRecent(noteDuration(id.slice(5), loaded.pack.duration)) }
    catch (error) { setPackError(`无法读取 MV 包 ${id.slice(5)}：${errorText(error, '')}`); setPack(EMPTY_PACK); saveActive(EMPTY_ID) }
  }, [api])
  // Reopen the last pack (reading its mv.json only; nothing is run).
  React.useEffect(() => { const id = loadActive(); if (id.startsWith('pack:')) void selectPack(id) }, [selectPack])
  const onLoaded = loaded => { setPack(loaded); saveActive(loaded.id); setPackError('') }
  // Per-skin structure: A sidebar + bottom bar, B tmux tabs + status line (see mv-shell.jsx).
  const skinId = skin.settings.skin
  const rootRef = React.useRef(null)
  const transport = useTransport(canvasRef, skinId === 'a' || skinId === 'b')
  const [navRequest, setNavRequest] = React.useState(null)
  const [nav, setNav] = React.useState('library')
  // Harness puts panels in a `display:flex; flex-direction:column; overflow:hidden` column. The root is the
  // scroll container (mv.css); if a host ever lays it out unconstrained, pin it to the clipping ancestor, and
  // undo programmatic scrolls of that ancestor (focus()/scrollIntoView() can scroll overflow:hidden boxes,
  // which hid the header with no way to scroll back — the 0.8.0 bug).
  React.useLayoutEffect(() => fitToHost(rootRef.current), [])
  const calibOk = Boolean(!pack.empty && api?.packWriteText)
  const scrollTo = selector => requestAnimationFrame(() => rootRef.current?.querySelector(selector)?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }))
  const go = id => {
    setNav(id)
    if (id === 'workshop' || id === 'ai' || id === 'import') { setNavRequest({ view: id }); scrollTo('.mv-library-section'); return }
    if (id === 'library') { setNavRequest({ view: null }); scrollTo('.mv-library-section'); return }
    if (id === 'now') { scrollTo('.mv-hero'); return }
    if (id === 'calib') {
      const el = rootRef.current?.querySelector('.mv-calib')
      if (el) { el.open = true; scrollTo('.mv-calib') }
    }
  }
  const onLibraryView = view => { if (view) setNav(view); else setNav(current => (current === 'workshop' || current === 'ai' || current === 'import' ? 'library' : current)) }
  const cover = coverOf(pack)
  const recentItems = [
    ...recent.map(item => ({ id: `pack:${item.manifestPath}`, title: item.title || item.manifestPath, sub: item.artist || (item.workshop ? '创意工坊' : 'MV 包'), cover: { hue: coverHue(item.title), text: coverInitials(item.title) } })),
  ].slice(0, 6)
  const notice = info.status === 'ready' ? versionNotice({ hostVersion: info.value?.hostVersion }) : ''

  const label = canvasState.playing ? '暂停' : '播放'
  const hint = pack.empty ? (pack.moved ? `「${pack.moved.title}」已移到创意工坊：在上面的曲库里一键安装。` : '曲库是空的：到「创意工坊」安装一个 MV，或导入你自己的 MV 包。') : canvasState.hasAudio ? '画面以音频为时钟逐帧渲染；点一下画面后可用键盘控制。' : '还没有选择音频：可以先静音观看，或在下方选择你的歌曲。'
  const renderer = { 'world-execute-me': 'world.execute(me) 场景', 'dsh-pv': 'dsh-pv（大肥鱼眼中的 world.execute(me)）', script: '场景脚本（scenes.js）' }[pack.pack.canvas?.renderer] ?? '通用画面（频谱 + 歌词）'

  return (
    <div ref={rootRef} className={`mv-root ${skin.className}`} data-mv-skin={skinId}>
      <style>{css + skinCss}</style>
      {/* Fixed child slots: switching skins never remounts the content (the canvas keeps playing). */}
      <div className="mv-shell">
      {skinId === 'a' ? <SideNav active={nav} go={go} calibOk={calibOk} items={recentItems} activeId={pack.id} onSelect={id => void selectPack(id)} playing={canvasState.playing} /> : null}
      {skinId === 'b' ? <TmuxTabs active={nav} go={go} calibOk={calibOk} /> : null}
      <div className="mv-main">
      <header className="mv-head">
        <h1 className="mv-title">MV 放映室</h1>
        <span className="mv-spacer" />
        {notice && <span className="mv-pill mv-pill-warn" role="status" title={notice}>⚠ 后台版本不一致 · 请完全重启 Harness</span>}
        <SkinPicker skin={skin} />
        <Popover label="关于与版权" icon={<Icon.info />}><About pack={pack} /></Popover>
      </header>

      <Library playing={canvasState.playing} onPlay={() => canvasRef.current?.toggle()} onShowPlayer={() => go('now')} navRequest={navRequest} onView={onLibraryView} api={api} harness={harness} info={info.value} initialAi={initialAi} initialWorkshop={initialWorkshop} workshopIndex={workshopIndex} canvas={() => canvasRef.current} active={pack} recent={recent} onSelect={id => void selectPack(id)} onLoaded={onLoaded} onRecent={setRecent} />
      {packError && <Alert kind="error"><p className="mv-wrap">{packError}</p></Alert>}
      {info.status === 'error' && <Alert kind="warn"><p className="mv-wrap">{info.error}（画布播放不受影响；MV 包、AI 制作和歌词引擎需要后台。）</p></Alert>}

      <section className="mv-hero" aria-label="正在播放" style={{ '--mv-hue': cover.hue }} data-cover={cover.text}>
        <span className="mv-hero-art" aria-hidden="true">{cover.text}</span>
        <div style={{ minWidth: 0 }}>
          <p className="mv-section-label" style={{ margin: 0 }}>正在播放</p>
          <h2 className="mv-hero-title">{pack.pack.title}</h2>
          <p className="mv-hero-sub">
            <span>{pack.empty ? (pack.moved ? '已移到创意工坊' : '曲库为空') : pack.pack.artist || '未知艺术家'}</span>
            {!pack.empty && <span className="mv-chip">{pack.pack.workshop ? '创意工坊' : 'MV 包'}</span>}
            {!pack.empty && <span className="mv-chip">{renderer}</span>}
          </p>
        </div>
        <div className="mv-hero-actions">
          <button type="button" className="mv-play-big" disabled={pack.empty} onClick={() => canvasRef.current?.toggle()} aria-label={label}>
            {canvasState.playing ? <Icon.pause /> : <Icon.play />}{label}
          </button>
        </div>
        <p className="mv-hero-hint">{hint}</p>
      </section>

      <div hidden={pack.empty} className="mv-canvas-host"><CanvasMv ref={canvasRef} api={api} pack={pack} defaultFontSize={info.value?.canvasFontSize ?? 14} onState={setCanvasState} /></div>
      </div>
      {skinId === 'a' ? <PlayerBar title={pack.pack.title} artist={pack.empty ? '' : pack.pack.artist || '未知艺术家'} cover={cover} transport={transport} canvas={() => canvasRef.current} onShow={() => go('now')} /> : null}
      {skinId === 'b' ? <StatusLine title={pack.pack.title} artist={pack.empty ? '' : pack.pack.artist || '未知艺术家'} transport={transport} canvas={() => canvasRef.current} active={nav} /> : null}
      </div>
    </div>
  )
}
