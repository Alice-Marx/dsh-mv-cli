/**
 * "MV 包" bar: choose the built-in world.execute(me) preset or an imported
 * pack, import a pack (folder chooser or a pasted path), download the
 * template. Importing only reads mv.json; nothing is ever run from here.
 */
import React from 'react'
import { errorText } from './mv-terminal-state.mjs'
import { unwrapRemote } from './remote-state.mjs'
import {
  BUILTIN_ID, BUILTIN_PACK, TEMPLATE_ZIP_NAME, directoryPicker, forgetPack, loadPackFromHost, recentLabel, rememberPack, templateZip,
} from './mv-pack-state.mjs'

function downloadZip() {
  const blob = new Blob([templateZip()], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = TEMPLATE_ZIP_NAME
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export function PackBar({ api, active, recent, onSelect, onLoaded, onRecent }) {
  const [importing, setImporting] = React.useState(false)
  const [path, setPath] = React.useState('')
  const [busy, setBusy] = React.useState('')
  const [note, setNote] = React.useState('')
  const [error, setError] = React.useState('')
  const pick = directoryPicker()

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
    setBusy('template'); setError(''); setNote('')
    try {
      const dir = await pick()
      if (!dir) return
      const written = unwrapRemote(await api.packTemplate({ dir }), '无法写入模板。')
      setNote(`模板已保存到 ${written.path}（${written.files.length} 个文件）。编辑其中的 mv.json，放入你自己的音频和歌词，再用「导入 MV 包」选择该文件夹。`)
    } catch (failure) { setError(errorText(failure, '无法写入模板。')) }
    finally { setBusy('') }
  }

  const reload = async () => {
    if (active.builtin) return
    await importPath(active.manifestPath)
  }

  const pack = active.pack
  const warnings = active.warnings ?? []
  return (
    <section className="mv-pack" aria-label="MV 包">
      <div className="mv-toolbar">
        <label className="mv-inline">MV 包
          <select value={active.id} onChange={event => onSelect(event.target.value)}>
            <option value={BUILTIN_ID}>内置：world.execute(me);（自选音频 / 歌词）</option>
            {recent.map(item => <option key={item.manifestPath} value={`pack:${item.manifestPath}`}>{recentLabel(item)}</option>)}
          </select>
        </label>
        <button type="button" className="mv-button mv-button-secondary" onClick={() => { setImporting(value => !value); setError('') }}>导入 MV 包…</button>
        <button type="button" className="mv-button mv-button-secondary" disabled={busy === 'template'} onClick={() => pick ? void writeTemplate() : downloadZip()}
          title={pick ? '选择一个文件夹，在其中新建 dsh-mv-pack-template（不会覆盖已有文件）' : '下载 zip'}>{busy === 'template' ? '正在写入…' : '下载模板…'}</button>
        {pick && <button type="button" className="mv-link" onClick={downloadZip}>或下载 zip</button>}
        {!active.builtin && <>
          <button type="button" className="mv-link" disabled={Boolean(busy)} onClick={() => void reload()}>重新读取</button>
          <button type="button" className="mv-link" onClick={() => { onRecent(forgetPack(active.manifestPath)); onSelect(BUILTIN_ID) }}>从列表移除</button>
        </>}
      </div>
      {importing && <div className="mv-form">
        <label className="mv-field mv-wide"><span>mv.json 或它所在文件夹的绝对路径</span>
          <input value={path} spellCheck={false} placeholder="D:\MV\My Song\mv.json" onChange={event => setPath(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && path.trim()) void importPath(path) }} /></label>
        <div className="mv-actions" style={{ alignSelf: 'flex-end' }}>
          {pick && <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(busy)} onClick={() => void chooseFolder()}>选择文件夹…</button>}
          <button type="button" className="mv-button" disabled={!path.trim() || Boolean(busy)} onClick={() => void importPath(path)}>{busy === 'import' ? '读取中…' : '导入'}</button>
        </div>
      </div>}
      <div className="mv-pack-info">
        <b>{pack.title}</b>{pack.artist ? <> — {pack.artist}</> : null}
        <span className="mv-chip">{pack.canvas?.renderer === 'world-execute-me' ? '画布：world.execute(me) 场景' : '画布：通用（频谱 + 歌词）'}</span>
        {!active.builtin && <span className="mv-chip">{active.terminal ? `外部渲染：${active.terminal.label}` : '无外部渲染程序'}</span>}
        {!active.builtin && <code className="mv-caption" title={active.manifestPath}>{active.manifestPath}</code>}
      </div>
      {(pack.credits?.length > 0 || pack.notice) && <p className="mv-caption">{[...(pack.credits ?? []), pack.notice].filter(Boolean).join(' · ')}</p>}
      {warnings.length > 0 && <p className="mv-error">{warnings.join('\n')}</p>}
      {error && <pre className="mv-error" role="alert">{error}</pre>}
      {note && <p className="mv-caption">{note}</p>}
    </section>
  )
}

export { BUILTIN_PACK }
