/**
 * "用 AI 制作新 MV" dialog: pick audio (+ optional lyrics, title/artist and
 * style notes) → the panel decodes it locally and computes spectrum.json →
 * the Host creates the pack folder → a new Harness agent session gets the
 * task (or the prompt is shown for copy & paste).
 */
import React from 'react'
import { Alert, Icon } from './mv-ui.jsx'
import { errorText } from './mv-terminal-state.mjs'
import { AUDIO_ACCEPT } from './canvas-mv.jsx'
import { createAiPack, inspectAiAudio, openBlankSession, sessionSupport, startAgentSession } from './mv-ai-state.mjs'
import { directoryPicker, loadPackFromHost, rememberPack } from './mv-pack-state.mjs'
import { looksTimed } from '../shared/mv-ai-prompt.mjs'

const STAGES = { read: '读取音频', decode: '在本机解码', spectrum: '计算频谱', copy: '复制音频到 MV 包', 'spectrum-save': '保存 spectrum.json', done: '完成' }
const baseName = name => String(name ?? '').replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim()

const AREA = { width: '100%', minHeight: 72, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--mv-border)', background: 'var(--mv-bg)', resize: 'vertical', fontFamily: 'inherit', fontSize: 12.5 }

export function AiPackDialog({ api, harness, info, onClose, onLoaded, onRecent }) {
  const [file, setFile] = React.useState(null)
  const [audioLabel, setAudioLabel] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [artist, setArtist] = React.useState('')
  const [lyrics, setLyrics] = React.useState('')
  const [style, setStyle] = React.useState('')
  const [parentDir, setParentDir] = React.useState('')
  const [progress, setProgress] = React.useState(null)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null) // { created, prompt, duration }
  const [prompt, setPrompt] = React.useState('')
  const [session, setSession] = React.useState(null)
  const [sending, setSending] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const pick = directoryPicker()
  const support = sessionSupport(harness)
  const toolsOn = info?.agentTools?.registered !== false

  const chooseAudio = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = AUDIO_ACCEPT
    input.onchange = async () => {
      const chosen = input.files?.[0]
      if (!chosen) return
      setError('')
      const head = new Uint8Array(await chosen.slice(0, 4096).arrayBuffer())
      const checked = inspectAiAudio(head)
      setAudioLabel(checked.sniff.label)
      if (checked.problem) { setError(checked.problem); setFile(null); return }
      setFile(chosen)
      if (!title.trim()) setTitle(baseName(chosen.name))
    }
    input.click()
  }
  const chooseLyrics = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.lrc,.txt,.srt,.vtt'
    input.onchange = async () => { const chosen = input.files?.[0]; if (chosen) setLyrics(await chosen.text()) }
    input.click()
  }
  const chooseDir = async () => { try { const dir = await pick?.(); if (dir) setParentDir(dir) } catch (failure) { setError(errorText(failure, '无法打开文件夹选择器。')) } }

  const create = async () => {
    setError(''); setProgress({ stage: 'read', ratio: 0 })
    try {
      const made = await createAiPack(api, { file, title, artist, lyrics, style, parentDir }, { toolsAvailable: toolsOn, onProgress: value => setProgress(value) })
      setResult(made); setPrompt(made.prompt)
      try {
        const loaded = await loadPackFromHost(api, made.created.manifestPath)
        onRecent(rememberPack(loaded)); onLoaded(loaded)
      } catch { /* the folder exists; it can be imported by hand */ }
    } catch (failure) { setError(errorText(failure, '无法创建 MV 包。')) }
    finally { setProgress(null) }
  }

  const send = async () => {
    setSending(true); setError('')
    try { setSession(await startAgentSession(harness, { packDir: result.created.packDir, title: title.trim(), prompt })) }
    catch (failure) { setError(errorText(failure, '无法启动会话。')) }
    finally { setSending(false) }
  }
  const copy = async () => {
    try { await globalThis.navigator?.clipboard?.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { setError('无法写入剪贴板，请手动选中上面的文字复制。') }
  }
  const openNew = async () => {
    try { if (!(await openBlankSession(harness, result.created.packDir))) setError('当前 Harness 无法从插件打开新会话：请在侧边栏手动新建一个会话，再粘贴提示词。') }
    catch (failure) { setError(errorText(failure, '无法打开新会话。')) }
  }

  const busy = Boolean(progress)
  const timed = looksTimed(lyrics)
  return (
    <div className="mv-dialog mv-ai" role="dialog" aria-label="用 AI 制作新 MV">
      <div className="mv-row" style={{ justifyContent: 'space-between' }}>
        <h2>用 AI 制作新 MV</h2>
        <button type="button" className="mv-icon-button" aria-label="关闭" onClick={onClose}><Icon.close /></button>
      </div>
      {!result && <>
        <p className="mv-caption">选一首你自己的歌，插件在本机建好 MV 包文件夹（复制音频、算好频谱），再让 Harness 的 Agent 写歌词时间轴、mv.json 和 ASCII 场景脚本。音频不会上传，原文件不会被修改。</p>
        <div className="mv-form">
          <div className="mv-field mv-wide"><span>音频或视频文件（必选；MP3、M4A/AAC、MP4/MOV/WebM/MKV、Opus/Ogg、FLAC、WAV…）</span>
            <span className="mv-field-row">
              <button type="button" className="mv-button mv-button-secondary" disabled={busy} onClick={chooseAudio}>{file ? '更换…' : '选择音频…'}</button>
              <span className="mv-caption" style={{ alignSelf: 'center' }}>{file ? `${file.name} · ${audioLabel} · ${(file.size / 1048576).toFixed(1)} MB` : audioLabel ? `不支持：${audioLabel}` : '未选择'}</span>
            </span></div>
          <label className="mv-field"><span>歌名（必填）</span><input value={title} disabled={busy} onChange={event => setTitle(event.target.value)} placeholder="歌名" /></label>
          <label className="mv-field"><span>歌手</span><input value={artist} disabled={busy} onChange={event => setArtist(event.target.value)} placeholder="可选" /></label>
          <label className="mv-field mv-wide"><span>歌词（可选；LRC 带时间轴最好，纯文本也行，AI 会估计时间）{lyrics.trim() ? ` · ${timed ? '已识别为 LRC' : '纯文本'}` : ''}</span>
            <textarea style={AREA} value={lyrics} disabled={busy} spellCheck={false} onChange={event => setLyrics(event.target.value)} placeholder={'[00:12.30]第一句\n[00:17.80]第二句\n…或直接粘贴歌词文本'} />
            <span><button type="button" className="mv-link" disabled={busy} onClick={chooseLyrics}>从文件读取…</button></span></label>
          <label className="mv-field mv-wide"><span>风格说明（可选，告诉 AI 你想要的画面）</span>
            <textarea style={{ ...AREA, minHeight: 52 }} value={style} disabled={busy} onChange={event => setStyle(event.target.value)} placeholder="例如：赛博朋克雨夜、副歌时满屏代码雨、结尾慢慢熄灭" /></label>
          <div className="mv-field mv-wide"><span>保存位置</span>
            <span className="mv-field-row">
              <input value={parentDir} disabled={busy} spellCheck={false} onChange={event => setParentDir(event.target.value)} placeholder={info?.aiPacksDir ? `默认：${info.aiPacksDir}` : '默认：%LOCALAPPDATA%\\dsh-mv\\packs'} />
              {pick && <button type="button" className="mv-button mv-button-secondary" disabled={busy} onClick={() => void chooseDir()}>浏览…</button>}
            </span>
            <span className="mv-field-help">会在这里新建一个以歌名命名的子文件夹，不会覆盖已有文件。</span></div>
        </div>
        {progress && <Alert kind="info"><p>{STAGES[progress.stage] ?? progress.stage}… {Math.round((progress.ratio ?? 0) * 100)}%</p></Alert>}
        <div className="mv-row">
          <button type="button" className="mv-button" disabled={!file || !title.trim() || busy} onClick={() => void create()}>{busy ? '正在创建…' : '创建 MV 包'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={busy} onClick={onClose}>取消</button>
        </div>
      </>}
      {result && <>
        <Alert kind="ok"><p className="mv-wrap">已创建 MV 包：<code>{result.created.packDir}</code>（{Math.round(result.duration)} 秒，频谱已算好）。它已出现在曲库里，现在就能用通用画面播放；AI 写好场景脚本后，在曲库里再点一次这张卡片即可重新载入。</p></Alert>
        {!session && <>
          <p className="mv-caption">{support.available ? '下面的任务会发送到一个新的 Agent 会话（工作区就是这个文件夹）。发送前可以修改：' : '当前 Harness 没有给插件开放会话接口：请复制下面的提示词，在新会话里粘贴发送。'}</p>
          <textarea style={{ ...AREA, minHeight: 150, fontFamily: '"Cascadia Mono", Consolas, monospace', fontSize: 12 }} value={prompt} spellCheck={false} onChange={event => setPrompt(event.target.value)} aria-label="发给 Agent 的提示词" />
          <ul className="mv-caption" style={{ margin: '6px 0', paddingLeft: 18 }}>
            <li>Agent 只会被要求修改这个文件夹里的文件；它写文件时 Harness 可能会请你批准权限。会话会消耗你的模型额度。</li>
            <li>{toolsOn ? 'Agent 可以用 mv_pack_validate / mv_pack_preview_frame 检查和预览（只读，在沙箱里运行场景脚本）。' : 'Agent 工具未注册（Host 没有 tools 服务或已在设置里关闭），Agent 会按 AGENT.md 自查。'}</li>
            <li>场景脚本在面板里运行于没有网络和 DOM 的 Web Worker 中，超时或出错会自动换回通用画面；插件不会运行任何外部程序。</li>
          </ul>
          <div className="mv-row">
            {support.available && <button type="button" className="mv-button" disabled={sending || !prompt.trim()} onClick={() => void send()}>{sending ? '正在启动会话…' : '在新会话中交给 AI'}</button>}
            <button type="button" className={support.available ? 'mv-button mv-button-secondary' : 'mv-button'} onClick={() => void copy()}>{copied ? '已复制' : '复制提示词'}</button>
            {!support.available && support.canCreate && <button type="button" className="mv-button mv-button-secondary" onClick={() => void openNew()}>打开新会话</button>}
            <button type="button" className="mv-button mv-button-secondary" onClick={onClose}>完成</button>
          </div>
        </>}
        {session && <>
          <Alert kind="ok"><p className="mv-wrap">已在新会话中开始制作{session.opened ? '（已切换到该会话）' : ''}。会话 ID <code>{session.sessionId}</code>。AI 完成后回到这里，在曲库里点「{title.trim()}」重新载入并播放。</p></Alert>
          <div className="mv-row"><button type="button" className="mv-button mv-button-secondary" onClick={onClose}>完成</button></div>
        </>}
      </>}
      {error && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{error}</p></Alert>}
    </div>
  )
}
