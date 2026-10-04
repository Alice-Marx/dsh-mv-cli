/**
 * The library: your MV packs (imported, AI-made, installed from 创意工坊) as a
 * list or cover grid, plus 创意工坊, "用 AI 制作新 MV", "导入" and "新建（模板）".
 * Since 0.9.0 nothing is built in: an empty library points to 创意工坊 and
 * offers one-click installs of the two world.execute(me) packs that used to be
 * presets. Importing only reads mv.json; nothing is ever run from here.
 */
import React from 'react'
import { errorText } from './mv-info.mjs'
import { unwrapRemote } from './remote-state.mjs'
import { Alert, Icon } from './mv-ui.jsx'
import { coverHue, coverInitials } from './mv-skin.mjs'
import { AiPackDialog } from './mv-ai.jsx'
import { WorkshopDialog } from './mv-workshop.jsx'
import { EMPTY_ID, TEMPLATE_ZIP_NAME, directoryPicker, forgetPack, loadLibraryCollapsed, loadLibraryView, loadPackFromHost, rememberPack, saveLibraryCollapsed, saveLibraryView, templateZip } from './mv-pack-state.mjs'
import { installWorkshopPack } from './mv-workshop-state.mjs'
import { PRESET_PACKS } from '../shared/mv-workshop.mjs'
import { fmtTime } from './mv-skin.mjs'

function downloadZip() {
  const blob = new Blob([templateZip()], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = TEMPLATE_ZIP_NAME
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const initials = coverInitials
const hue = title => ({ '--mv-hue': coverHue(title) })

export function Library({ api, active, recent, onSelect, onLoaded, onRecent, harness = null, info = null, initialAi = false, initialWorkshop = false, canvas = () => null, workshopIndex = null, navRequest = null, onView = null, playing = false, onPlay = () => {}, onShowPlayer = () => {} }) {
  const [layout, setLayout] = React.useState(loadLibraryView)
  const [collapsed, setCollapsed] = React.useState(loadLibraryCollapsed)
  const [importing, setImporting] = React.useState(false)
  const [aiOpen, setAiOpen] = React.useState(initialAi)
  const [workshopOpen, setWorkshopOpen] = React.useState(initialWorkshop)
  const [path, setPath] = React.useState('')
  const [busy, setBusy] = React.useState('')
  const [note, setNote] = React.useState('')
  const [error, setError] = React.useState('')
  const pick = directoryPicker()
  // Skin navigation (sidebar / tmux tabs) opens the same dialogs the cards do.
  React.useEffect(() => {
    if (!navRequest) return
    if (!navRequest.view) setCollapsed(saveLibraryCollapsed(false))
    setWorkshopOpen(navRequest.view === 'workshop'); setAiOpen(navRequest.view === 'ai'); setImporting(navRequest.view === 'import'); setError('')
  }, [navRequest])
  const view = workshopOpen ? 'workshop' : aiOpen ? 'ai' : importing ? 'import' : null
  React.useEffect(() => { onView?.(view) }, [view])

  const importPath = async value => {
    setBusy('import'); setError(''); setNote('')
    try {
      const loaded = await loadPackFromHost(api, value)
      onRecent(rememberPack(loaded))
      onLoaded(loaded)
      setImporting(false); setPath('')
      setNote(`已导入「${loaded.pack.title}」。导入只读取清单，不会运行任何程序。`)
    } catch (failure) { setError(errorText(failure, '无法导入 MV 包。')) }
    finally { setBusy('') }
  }
  const chooseFolder = async () => {
    setError('')
    try { const dir = await pick(); if (dir) { setPath(dir); await importPath(dir) } }
    catch (failure) { setError(errorText(failure, '无法打开文件夹选择器。')) }
  }
  const writeTemplate = async () => {
    if (!pick) { downloadZip(); setNote(`已下载 ${TEMPLATE_ZIP_NAME}。解压后编辑 mv.json，放入你自己的音频和歌词，再点「导入」。`); return }
    setBusy('template'); setError(''); setNote('')
    try {
      const dir = await pick()
      if (!dir) return
      const written = unwrapRemote(await api.packTemplate({ dir }), '无法写入模板。')
      setNote(`模板已保存到 ${written.path}（${written.files.length} 个文件）。编辑其中的 mv.json，放入你自己的音频和歌词，再点「导入」选择该文件夹。`)
    } catch (failure) { setError(errorText(failure, '无法写入模板。')) }
    finally { setBusy('') }
  }

  /** One-click install (or open, when it is already in the library) of a former built-in preset. */
  const installPreset = async preset => {
    const have = recent.find(item => item.workshop === preset.id)
    if (have) { onSelect(`pack:${have.manifestPath}`); return }
    setBusy(`preset:${preset.id}`); setError(''); setNote('')
    try {
      const done = await installWorkshopPack(api, preset.id)
      const loaded = await loadPackFromHost(api, done.manifestPath)
      onRecent(rememberPack(loaded))
      onLoaded(loaded)
      setNote(`已从创意工坊安装「${preset.title}」v${done.version}（${done.files} 个文件，sha256 校验通过）。包里没有音频：选择你自己的歌曲文件（可选歌词）后点 ▶ 播放。`)
    } catch (failure) { setError(errorText(failure, `无法安装「${preset.title}」。可以打开「创意工坊」重试。`)) }
    finally { setBusy('') }
  }
  const presetRow = preset => {
    const have = recent.some(item => item.workshop === preset.id)
    return (
      <div key={preset.id} className="mv-preset" role="listitem">
        <span className="mv-thumb mv-track-art" style={{ '--mv-hue': preset.hue }} aria-hidden="true">{preset.cover}</span>
        <span className="mv-preset-main">
          <span className="mv-track-title">{preset.title}</span>
          <span className="mv-track-artist">{preset.artist} · {preset.kind} · 原作 <a href={preset.source} target="_blank" rel="noreferrer">{preset.sourceLabel}</a></span>
        </span>
        <button type="button" className="mv-button mv-button-small" disabled={Boolean(busy) || !api?.workshopInstall} onClick={() => void installPreset(preset)}>
          {busy === `preset:${preset.id}` ? '正在安装…' : have ? '打开' : '一键安装'}</button>
      </div>
    )
  }
  const moved = active.moved ?? null
  const empty = recent.length === 0

  const toggleWorkshop = () => { setWorkshopOpen(value => !value); setAiOpen(false); setImporting(false); setError('') }
  const toggleAi = () => { setAiOpen(value => !value); setImporting(false); setWorkshopOpen(false); setError('') }
  const toggleImport = () => { setImporting(value => !value); setAiOpen(false); setWorkshopOpen(false); setError('') }
  const tools = [
    { key: 'ws', label: '创意工坊', Icon: Icon.shop, expanded: workshopOpen, onClick: toggleWorkshop, title: '浏览社区投稿的 MV 包，一键安装到曲库；也可以把你的 MV 包发布到工坊' },
    { key: 'ai', label: '用 AI 制作新 MV', Icon: Icon.spark, expanded: aiOpen, onClick: toggleAi, title: '选一首你的歌，让 Harness 的 Agent 写歌词时间轴、mv.json 和 ASCII 场景脚本' },
    { key: 'import', label: '导入 MV 包', Icon: Icon.plus, expanded: importing, onClick: toggleImport, title: '选择含 mv.json 的文件夹' },
    { key: 'template', label: busy === 'template' ? '正在写入…' : '新建（模板）', Icon: Icon.folder, disabled: busy === 'template', onClick: () => void writeTemplate(), title: pick ? '选择一个文件夹，在其中新建 dsh-mv-pack-template（不会覆盖已有文件）' : `下载 ${TEMPLATE_ZIP_NAME}` },
  ]
  const activeDuration = Number(active.pack?.duration) || 0
  const rows = [
    ...recent.map(item => {
      const id = `pack:${item.manifestPath}`
      return { id, manifestPath: item.manifestPath, title: item.title || item.manifestPath, artist: item.artist, type: item.workshop ? '创意工坊' : 'MV 包', kind: item.workshop ? 'workshop' : 'pack', cover: initials(item.title), hue: coverHue(item.title), duration: item.duration || (active.id === id ? activeDuration : 0), tip: item.manifestPath }
    }),
  ]
  const trackRow = (row, number) => {
            const current = active.id === row.id
            return (
              <div key={row.id} role="listitem" className="mv-track" aria-current={current ? 'true' : undefined} data-playing={current && playing ? 'true' : undefined}>
                <span className="mv-track-n">{current && playing ? <span className="mv-eq" aria-label="正在播放"><i /><i /><i /></span> : number}</span>
                <span className="mv-thumb mv-track-art" style={{ '--mv-hue': row.hue }} aria-hidden="true">{row.cover}</span>
                <button type="button" className="mv-track-main" title={row.tip} aria-pressed={current} onClick={() => onSelect(row.id)}>
                  <span className="mv-track-title">{row.title}</span>
                  <span className="mv-track-artist">{row.artist || '未知艺术家'}</span>
                </button>
                <span className={`mv-track-type mv-track-type-${row.kind}`}>{row.type}</span>
                <span className="mv-track-len">{row.duration > 0 ? fmtTime(row.duration) : '—'}</span>
                <span className="mv-track-actions">
                  <button type="button" className="mv-icon-button" aria-label={current ? (playing ? `暂停「${row.title}」` : `播放「${row.title}」`) : `切换到「${row.title}」`}
                    title={current ? (playing ? '暂停' : '播放') : '切换到这首（再点 ▶ 播放）'}
                    onClick={() => { if (current) onPlay(); else { onSelect(row.id); onShowPlayer() } }}>{current && playing ? <Icon.pause /> : <Icon.play />}</button>
                  {row.manifestPath && <button type="button" className="mv-icon-button" aria-label={`从曲库移除「${row.title}」`} title="从曲库移除（不删除文件）"
                    onClick={() => { onRecent(forgetPack(row.manifestPath)); if (current) onSelect(EMPTY_ID) }}><Icon.close /></button>}
                </span>
              </div>
            )
  }
  const activeRow = rows.find(row => row.id === active.id) ?? { id: active.id, manifestPath: '', title: active.pack?.title ?? '', artist: active.pack?.artist ?? '', type: active.empty ? '—' : 'MV 包', kind: 'pack', cover: initials(active.pack?.title), hue: coverHue(active.pack?.title), duration: activeDuration, tip: active.manifestPath ?? '' }
  const warnings = active.warnings ?? []
  return (
    <section className="mv-library-section" aria-label="曲库">
      <div className="mv-lib-head">
        <button type="button" className="mv-lib-collapse" aria-expanded={!collapsed} aria-controls="mv-lib-body" title={collapsed ? '展开曲库' : '收起曲库'}
          aria-label={collapsed ? '展开曲库' : '收起曲库'} onClick={() => setCollapsed(saveLibraryCollapsed(!collapsed))}><Icon.chevron /></button>
        <p className="mv-section-label">曲库 <span className="mv-lib-count">{recent.length} 首{collapsed ? ' · 已收起' : ''}</span></p>
        <span className="mv-spacer" />
        <div className="mv-segmented mv-segmented-small mv-lib-layout" role="radiogroup" aria-label="曲库显示方式">
          {[['list', '列表', Icon.list], ['grid', '网格', Icon.grid]].map(([value, label, Ico]) => (
            <button key={value} type="button" role="radio" aria-checked={layout === value} title={`${label}视图`} aria-label={`${label}视图`}
              onClick={() => setLayout(saveLibraryView(value))}><Ico /><span>{label}</span></button>
          ))}
        </div>
      </div>
      {moved && <Alert kind="info" actions={<button type="button" className="mv-button mv-button-small" disabled={Boolean(busy) || !api?.workshopInstall} onClick={() => void installPreset(moved)}>{busy === `preset:${moved.id}` ? '正在安装…' : '从创意工坊安装'}</button>}>
        <p className="mv-wrap">「{moved.title}」在 0.9.0 起不再内置，已移到创意工坊（原作 <a href={moved.source} target="_blank" rel="noreferrer">{moved.sourceLabel}</a>）。安装后会沿用你之前为它选择的音频和歌词。</p>
      </Alert>}
      {collapsed ? <div id="mv-lib-body" className="mv-tracks mv-tracks-mini" role="list" aria-label="正在播放">{active.empty ? <p className="mv-caption">曲库是空的：展开后到「创意工坊」安装 MV。</p> : trackRow(activeRow, '▸')}</div> : layout === 'list' ? <div id="mv-lib-body" className="mv-lib-body">
        <div className="mv-lib-tools" role="toolbar" aria-label="曲库操作">
          {tools.map(tool => (
            <button key={tool.key} type="button" className={`mv-lib-tool mv-lib-tool-${tool.key}`} aria-expanded={tool.expanded} disabled={tool.disabled} title={tool.title} onClick={tool.onClick}>
              <tool.Icon /><span>{tool.label}</span>
            </button>
          ))}
        </div>
        {!empty && <div className="mv-tracks" role="list" aria-label="曲目">
          <div className="mv-track mv-track-head" aria-hidden="true"><span className="mv-track-n">#</span><span /><span>标题</span><span>类型</span><span className="mv-track-len">时长</span><span /></div>
          {rows.map((row, index) => trackRow(row, index + 1))}
        </div>}
      </div> : <div id="mv-lib-body" className="mv-library">
        {recent.map(item => {
          const id = `pack:${item.manifestPath}`
          return (
            <div key={item.manifestPath} role="button" tabIndex={0} className="mv-card" aria-pressed={active.id === id} title={item.manifestPath}
              onClick={() => onSelect(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id) } }}>
              <button type="button" className="mv-card-remove" aria-label={`从曲库移除「${item.title}」`} title="从曲库移除（不删除文件）"
                onClick={event => { event.stopPropagation(); onRecent(forgetPack(item.manifestPath)); if (active.id === id) onSelect(EMPTY_ID) }}><Icon.close /></button>
              <span className="mv-card-art" style={hue(item.title)}>{initials(item.title)}</span>
              <span className="mv-card-title">{item.title || item.manifestPath}</span>
              <span className="mv-card-sub">{item.artist ? `${item.artist} · ` : ''}{item.workshop ? '创意工坊' : 'MV 包'}</span>
            </div>
          )
        })}
        <button type="button" className="mv-card mv-card-ghost mv-card-ws" aria-expanded={workshopOpen} onClick={() => { setWorkshopOpen(value => !value); setAiOpen(false); setImporting(false); setError('') }}
          title="浏览社区投稿的 MV 包，一键安装到曲库；也可以把你的 MV 包发布到工坊">
          <span className="mv-card-art"><Icon.shop /></span>
          <span>创意工坊</span>
        </button>
        <button type="button" className="mv-card mv-card-ghost mv-card-ai" aria-expanded={aiOpen} onClick={() => { setAiOpen(value => !value); setImporting(false); setWorkshopOpen(false); setError('') }}
          title="选一首你的歌，让 Harness 的 Agent 写歌词时间轴、mv.json 和 ASCII 场景脚本">
          <span className="mv-card-art"><Icon.spark /></span>
          <span>用 AI 制作新 MV</span>
        </button>
        <button type="button" className="mv-card mv-card-ghost" aria-expanded={importing} onClick={() => { setImporting(value => !value); setAiOpen(false); setWorkshopOpen(false); setError('') }}>
          <span className="mv-card-art"><Icon.plus /></span>
          <span>导入 MV 包</span>
        </button>
        <button type="button" className="mv-card mv-card-ghost" disabled={busy === 'template'} onClick={() => void writeTemplate()}
          title={pick ? '选择一个文件夹，在其中新建 dsh-mv-pack-template（不会覆盖已有文件）' : `下载 ${TEMPLATE_ZIP_NAME}`}>
          <span className="mv-card-art"><Icon.folder /></span>
          <span>{busy === 'template' ? '正在写入…' : '新建（模板）'}</span>
        </button>
      </div>}
      {empty && !collapsed && !workshopOpen && <div className="mv-empty-lib" role="region" aria-label="曲库是空的">
        <div className="mv-empty-head">
          <span className="mv-empty-icon" aria-hidden="true"><Icon.shop /></span>
          <div>
            <h3>曲库还是空的</h3>
            <p className="mv-caption">插件本身不带任何 MV：到「创意工坊」安装社区做好的 MV 包（不含音频和歌词，用你自己的歌曲文件播放）。下面两个是以前内置的 world.execute(me) MV，点一下就能装好。</p>
          </div>
          <button type="button" className="mv-button" onClick={toggleWorkshop}>打开创意工坊</button>
        </div>
        <div className="mv-presets" role="list" aria-label="推荐">{PRESET_PACKS.map(presetRow)}</div>
        <p className="mv-caption">也可以点「用 AI 制作新 MV」让 Agent 帮你做，或「新建（模板）」写一个自己的 MV 包再「导入」。</p>
      </div>}
      {workshopOpen && <WorkshopDialog api={api} active={active} canvas={canvas} initialIndex={workshopIndex} onClose={() => setWorkshopOpen(false)} onLoaded={onLoaded} onRecent={onRecent} />}
      {aiOpen && <AiPackDialog api={api} harness={harness} info={info} onClose={() => setAiOpen(false)} onLoaded={onLoaded} onRecent={onRecent} />}
      {importing && <div className="mv-dialog" role="dialog" aria-label="导入 MV 包">
        <h2>导入 MV 包</h2>
        <p className="mv-caption">选择含 mv.json 的文件夹，或粘贴 mv.json / 文件夹的绝对路径。只读取清单，不运行任何程序。</p>
        <div className="mv-field-row">
          <input value={path} spellCheck={false} placeholder="D:\MV\My Song\mv.json" aria-label="mv.json 或文件夹路径"
            style={{ height: 30, padding: '0 8px', borderRadius: 8, border: '1px solid var(--mv-border)', background: 'var(--mv-bg)' }}
            onChange={event => setPath(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && path.trim()) void importPath(path) }} />
          {pick && <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(busy)} onClick={() => void chooseFolder()}>选择文件夹…</button>}
          <button type="button" className="mv-button" disabled={!path.trim() || Boolean(busy)} onClick={() => void importPath(path)}>{busy === 'import' ? '读取中…' : '导入'}</button>
          <button type="button" className="mv-button mv-button-secondary" onClick={() => setImporting(false)}>取消</button>
        </div>
        {pick && <p className="mv-caption">没有现成的包？<button type="button" className="mv-link" onClick={downloadZip}>下载模板 zip</button></p>}
      </div>}
      {warnings.length > 0 && <Alert kind="warn"><p className="mv-wrap">{warnings.join('\n')}</p></Alert>}
      {error && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{error}</p></Alert>}
      {note && <Alert kind="ok" actions={<button type="button" className="mv-link" onClick={() => setNote('')}>知道了</button>}><p className="mv-wrap">{note}</p></Alert>}
    </section>
  )
}
