/**
 * The "MV 放映室" workbench panel, laid out like a music player:
 * library (built-in presets + MV packs) → now playing + one big ▶ 播放
 * button → the canvas stage → settings.
 */
import React from 'react'
import { CanvasMv } from './canvas-mv.jsx'
import { loadInfo, errorText } from './mv-info.mjs'
import { CLIENT_VERSION, versionNotice } from './remote-state.mjs'
import { Library } from './mv-library.jsx'
import { Alert, Icon, Popover } from './mv-ui.jsx'
import { BUILTINS, BUILTIN_ID, BUILTIN_PACK, loadActive, loadPackFromHost, loadRecent, saveActive } from './mv-pack-state.mjs'
import css from './mv.css'

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
      <p>内置 world.execute(me) 预设：歌曲与歌词版权归 Mili；画面场景移植自 yym8224961/world.execute-me-ascii（野生大K），经原作者许可。</p>
      <p>内置 dsh-pv 预设：移植自 MisakaZentai/world-execute-me-dsh-pv（代码 MIT）。其中的鲸鱼娘美术按 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a> 随插件分发（已缩放、像素化、调色）：溟月 © 上善无形 → 女仆版 ZipZipPipe → 立绘 Small-tailqwq / dsh-deep-whale → 表情 dsh-whale-galgame。仅限非商业使用，改编须同协议分享。</p>
      {!pack.builtin && <>
        <h3>当前 MV 包：{pack.pack.title}</h3>
        {credits.length > 0 ? <ul>{credits.map(item => <li key={item}>{item}</li>)}</ul> : <p>清单里没有署名信息。</p>}
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
  React.useEffect(() => { clearLegacy() }, [])
  const reloadInfo = React.useCallback(async () => {
    try { const value = await loadInfo(api); setInfo({ status: 'ready', value, error: '' }) }
    catch (error) { setInfo({ status: 'error', value: null, error: errorText(error, '无法连接 MV 插件后台。') }) }
  }, [api])
  React.useEffect(() => { void reloadInfo() }, [reloadInfo])
  const [pack, setPack] = React.useState(() => BUILTINS[loadActive()] ?? BUILTIN_PACK)
  const [recent, setRecent] = React.useState(loadRecent)
  const [packError, setPackError] = React.useState('')
  const selectPack = React.useCallback(async id => {
    setPackError('')
    if (BUILTINS[id]) { setPack(BUILTINS[id]); saveActive(id); return }
    if (!id.startsWith('pack:')) { setPack(BUILTIN_PACK); saveActive(BUILTIN_ID); return }
    try { const loaded = await loadPackFromHost(api, id.slice(5)); setPack(loaded); saveActive(loaded.id) }
    catch (error) { setPackError(`无法读取 MV 包 ${id.slice(5)}：${errorText(error, '')}`); setPack(BUILTIN_PACK); saveActive(BUILTIN_ID) }
  }, [api])
  // Reopen the last pack (reading its mv.json only; nothing is run).
  React.useEffect(() => { const id = loadActive(); if (!BUILTINS[id]) void selectPack(id) }, [selectPack])
  const onLoaded = loaded => { setPack(loaded); saveActive(loaded.id); setPackError('') }
  const notice = info.status === 'ready' ? versionNotice({ hostVersion: info.value?.hostVersion }) : ''

  const label = canvasState.playing ? '暂停' : '播放'
  const hint = canvasState.hasAudio ? '画面以音频为时钟逐帧渲染；点一下画面后可用键盘控制。' : '还没有选择音频：可以先静音观看，或在下方选择你的歌曲。'
  const renderer = { 'world-execute-me': 'world.execute(me) 场景', 'dsh-pv': 'dsh-pv（大肥鱼眼中的 world.execute(me)）', script: '场景脚本（scenes.js）' }[pack.pack.canvas?.renderer] ?? '通用画面（频谱 + 歌词）'

  return (
    <div className="mv-root">
      <style>{css}</style>
      <header className="mv-head">
        <h1 className="mv-title">MV 放映室</h1>
        <span className="mv-spacer" />
        {notice && <span className="mv-pill mv-pill-warn" role="status" title={notice}>⚠ 后台版本不一致 · 请完全重启 Harness</span>}
        <Popover label="关于与版权" icon={<Icon.info />}><About pack={pack} /></Popover>
      </header>

      <Library api={api} harness={harness} info={info.value} initialAi={initialAi} initialWorkshop={initialWorkshop} workshopIndex={workshopIndex} canvas={() => canvasRef.current} active={pack} recent={recent} onSelect={id => void selectPack(id)} onLoaded={onLoaded} onRecent={setRecent} />
      {packError && <Alert kind="error"><p className="mv-wrap">{packError}</p></Alert>}
      {info.status === 'error' && <Alert kind="warn"><p className="mv-wrap">{info.error}（画布播放不受影响；MV 包、AI 制作和歌词引擎需要后台。）</p></Alert>}

      <section className="mv-hero" aria-label="正在播放">
        <div style={{ minWidth: 0 }}>
          <p className="mv-section-label" style={{ margin: 0 }}>正在播放</p>
          <h2 className="mv-hero-title">{pack.pack.title}</h2>
          <p className="mv-hero-sub">
            <span>{pack.pack.artist || '未知艺术家'}</span>
            <span className="mv-chip">{pack.builtin ? '内置预设' : 'MV 包'}</span>
            <span className="mv-chip">{renderer}</span>
          </p>
        </div>
        <div className="mv-hero-actions">
          <button type="button" className="mv-play-big" onClick={() => canvasRef.current?.toggle()} aria-label={label}>
            {canvasState.playing ? <Icon.pause /> : <Icon.play />}{label}
          </button>
        </div>
        <p className="mv-hero-hint">{hint}</p>
      </section>

      <CanvasMv ref={canvasRef} api={api} pack={pack} defaultFontSize={info.value?.canvasFontSize ?? 14} onState={setCanvasState} />
    </div>
  )
}
