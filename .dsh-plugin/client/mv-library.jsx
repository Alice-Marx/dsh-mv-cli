/**
 * The library row: the built-in world.execute(me) preset and recent MV packs
 * as cards, plus "用 AI 制作新 MV", "导入" and "新建（模板）". Importing only
 * reads mv.json; nothing is ever run from here.
 */
import React from 'react'
import { errorText } from './mv-terminal-state.mjs'
import { unwrapRemote } from './remote-state.mjs'
import { Alert, Icon } from './mv-ui.jsx'
import { AiPackDialog } from './mv-ai.jsx'
import { BUILTIN_ID, TEMPLATE_ZIP_NAME, directoryPicker, forgetPack, loadPackFromHost, rememberPack, templateZip } from './mv-pack-state.mjs'

function downloadZip() {
  const blob = new Blob([templateZip()], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = TEMPLATE_ZIP_NAME
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const initials = title => {
  const clean = String(title ?? '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (!clean) return '♪'
  const words = clean.split(' ')
  return /[\u3400-\u9fff]/.test(clean[0]) ? clean[0] : (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
}

export function Library({ api, active, recent, onSelect, onLoaded, onRecent, harness = null, info = null, initialAi = false }) {
  const [importing, setImporting] = React.useState(false)
  const [aiOpen, setAiOpen] = React.useState(initialAi)
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

  const warnings = active.warnings ?? []
  return (
    <section aria-label="曲库">
      <p className="mv-section-label">曲库</p>
      <div className="mv-library">
        <button type="button" className="mv-card" aria-pressed={active.id === BUILTIN_ID} onClick={() => onSelect(BUILTIN_ID)} title="内置预设：使用你自己的音频和歌词文件">
          <span className="mv-card-art">&gt;_</span>
          <span className="mv-card-title">world.execute(me);</span>
          <span className="mv-card-sub">Mili · 内置预设</span>
        </button>
        {recent.map(item => {
          const id = `pack:${item.manifestPath}`
          return (
            <div key={item.manifestPath} role="button" tabIndex={0} className="mv-card" aria-pressed={active.id === id} title={item.manifestPath}
              onClick={() => onSelect(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id) } }}>
              <button type="button" className="mv-card-remove" aria-label={`从曲库移除「${item.title}」`} title="从曲库移除（不删除文件）"
                onClick={event => { event.stopPropagation(); onRecent(forgetPack(item.manifestPath)); if (active.id === id) onSelect(BUILTIN_ID) }}><Icon.close /></button>
              <span className="mv-card-art">{initials(item.title)}</span>
              <span className="mv-card-title">{item.title || item.manifestPath}</span>
              <span className="mv-card-sub">{item.artist ? `${item.artist} · MV 包` : 'MV 包'}</span>
            </div>
          )
        })}
        <button type="button" className="mv-card mv-card-ghost mv-card-ai" aria-expanded={aiOpen} onClick={() => { setAiOpen(value => !value); setImporting(false); setError('') }}
          title="选一首你的歌，让 Harness 的 Agent 写歌词时间轴、mv.json 和 ASCII 场景脚本">
          <span className="mv-card-art"><Icon.spark /></span>
          <span>用 AI 制作新 MV</span>
        </button>
        <button type="button" className="mv-card mv-card-ghost" aria-expanded={importing} onClick={() => { setImporting(value => !value); setAiOpen(false); setError('') }}>
          <span className="mv-card-art"><Icon.plus /></span>
          <span>导入 MV 包</span>
        </button>
        <button type="button" className="mv-card mv-card-ghost" disabled={busy === 'template'} onClick={() => void writeTemplate()}
          title={pick ? '选择一个文件夹，在其中新建 dsh-mv-pack-template（不会覆盖已有文件）' : `下载 ${TEMPLATE_ZIP_NAME}`}>
          <span className="mv-card-art"><Icon.folder /></span>
          <span>{busy === 'template' ? '正在写入…' : '新建（模板）'}</span>
        </button>
      </div>
      {recent.length === 0 && !importing && !aiOpen && <p className="mv-caption">想放别的歌？点「用 AI 制作新 MV」让 Agent 帮你做，或「新建（模板）」得到带说明的 mv.json，放入你自己的音频和歌词后「导入」。</p>}
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
