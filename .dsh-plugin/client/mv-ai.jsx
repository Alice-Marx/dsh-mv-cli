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
import { AUTO_STEPS, AutoStopped, guessMetadata, runAutoMake } from './mv-auto.mjs'
import { EngineCard, MODEL_LABELS, engineReady, installedModels, useEngineInfo } from './mv-engine-card.jsx'
import { LRCLIB_FIELDS } from '../shared/mv-calib-protocol.mjs'

const STEP_DOT = { pending: '○', running: '◐', done: '●', skipped: '–', failed: '✕', stopped: '■' }
const LANGS = { auto: '自动识别', zh: '中文', ja: '日语', en: '英语', ko: '韩语', yue: '粤语' }

function stepText(id, detail) {
  if (!detail) return ''
  if (detail.reason) return detail.reason
  if (detail.message) return detail.message
  switch (id) {
    case 'pack': return `${Math.round(detail.duration ?? 0)} 秒`
    case 'lrclib': return detail.found ? `找到 ${detail.track}${detail.synced ? '（带时间轴）' : '（纯文本，用引擎对齐）'}` : '没有找到'
    case 'engine': return `${detail.model} · ${detail.device === 'cuda' ? 'GPU' : 'CPU'} · ${detail.words} 个词 · ${detail.seconds ?? ''} 秒${detail.separated ? ' · 已分离人声' : ''}`
    case 'align': return `${detail.lines} 句${detail.low ? `，${detail.low} 句置信度低（校准时标黄）` : ''} · 来源 ${detail.source}`
    case 'sections': return `${detail.sections} 段：${(detail.kinds ?? []).join(' / ')}`
    case 'save': return `已写入 ${detail.files?.length ?? 0} 个文件`
    default: return ''
  }
}

const STAGES = { read: '读取音频', decode: '在本机解码', spectrum: '计算频谱', copy: '复制音频到 MV 包', 'spectrum-save': '保存 spectrum.json', done: '完成', load: '加载模型', separate: '分离人声', transcribe: '识别', write: '写结果' }
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
  const [album, setAlbum] = React.useState('')
  const [engineInfo, refreshEngine] = useEngineInfo(api)
  const [auto, setAuto] = React.useState(null) // { steps: { id: { state, detail } }, progress, log, running }
  const [autoOptions, setAutoOptions] = React.useState({ useLrclib: info?.lrclib !== false, useEngine: true, model: '', language: 'auto', separate: true, verifySynced: null })
  const stopRef = React.useRef(null)
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
      const meta = await guessMetadata(chosen).catch(() => ({}))
      if (!title.trim()) setTitle(meta.title || baseName(chosen.name))
      if (!artist.trim() && meta.artist) setArtist(meta.artist)
      if (meta.album) setAlbum(meta.album)
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

  const models = installedModels(engineInfo)
  const model = autoOptions.model && models.includes(autoOptions.model) ? autoOptions.model : (engineInfo?.cuda && models.includes('large-v3') ? 'large-v3' : models.includes('small') ? 'small' : models[0] ?? '')
  const engineOn = engineReady(engineInfo) && autoOptions.useEngine && Boolean(model)
  const lrclibAllowed = info?.lrclib !== false
  // With a GPU the engine also checks LRCLIB timings (about a minute); on CPU only when asked.
  const verifySynced = autoOptions.verifySynced ?? Boolean(engineInfo?.cuda)

  const autoMake = async () => {
    setError('')
    const controller = new AbortController(); stopRef.current = controller
    const steps = Object.fromEntries(AUTO_STEPS.map(step => [step.id, { state: 'pending' }]))
    setAuto({ steps, progress: null, log: [], running: true })
    try {
      const made = await runAutoMake(api, { file, title: title.trim(), artist, album, lyrics, style, parentDir, useLrclib: lrclibAllowed && autoOptions.useLrclib, useEngine: engineOn, model, language: autoOptions.language, separate: autoOptions.separate, verifySynced: verifySynced, toolsAvailable: toolsOn }, {
        signal: controller.signal,
        onStep: (id, state, detail) => setAuto(current => ({ ...current, steps: { ...current.steps, [id]: { state, detail } }, progress: state === 'running' ? null : current.progress })),
        onProgress: (id, value) => setAuto(current => ({ ...current, progress: { id, ...value } })),
        onLog: message => setAuto(current => ({ ...current, log: [...current.log, message].slice(-20) })),
      })
      setAuto(current => ({ ...current, running: false, result: made }))
      setResult({ ...made.made, auto: made }); setPrompt(made.prompt)
      try { const loaded = await loadPackFromHost(api, made.made.created.manifestPath); onRecent(rememberPack(loaded)); onLoaded(loaded) } catch { /* can be imported by hand */ }
    } catch (failure) {
      setAuto(current => ({ ...current, running: false }))
      if (!(failure instanceof AutoStopped)) setError(errorText(failure, '自动制作失败。'))
    } finally { stopRef.current = null }
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

  const busy = Boolean(progress) || Boolean(auto?.running)
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
          <label className="mv-field"><span>歌手</span><input value={artist} disabled={busy} onChange={event => setArtist(event.target.value)} placeholder="可选（自动从标签读取）" /></label>
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
        <div className="mv-auto" aria-label="自动制作">
          <strong>自动制作（推荐）</strong>
          <p className="mv-caption">只要选好音频：自动查歌词时间轴 → 没有就用本机歌词引擎识别 → 对齐、算置信度 → 识别主歌 / 副歌 / 间奏 → 保存。之后在播放器下面的「歌词校准」里修正标黄的句子。</p>
          <label className="mv-check"><input type="checkbox" checked={lrclibAllowed && autoOptions.useLrclib} disabled={busy || !lrclibAllowed} onChange={event => setAutoOptions(o => ({ ...o, useLrclib: event.target.checked }))} />
            <span>到 LRCLIB（lrclib.net）查现成的时间轴 <span className="mv-caption">— 联网，只发送 {LRCLIB_FIELDS.map(f => ({ title: '歌名', artist: '歌手', album: '专辑', duration: '时长' })[f]).join('、')}{title.trim() ? `（「${title.trim()}」${artist.trim() ? ` / ${artist.trim()}` : ''}${album ? ` / ${album}` : ''}）` : ''}，不上传音频{lrclibAllowed ? '' : '；已在插件设置里关闭'}</span></span></label>
          <label className="mv-check"><input type="checkbox" checked={engineOn} disabled={busy || !engineReady(engineInfo)} onChange={event => setAutoOptions(o => ({ ...o, useEngine: event.target.checked }))} />
            <span>没有时间轴时用本机歌词引擎识别 <span className="mv-caption">— 不联网{engineReady(engineInfo) ? (engineInfo.cuda ? '，GPU' : '，只有 CPU，会慢一些') : '，需要先安装（见下方）'}</span></span></label>
          {engineReady(engineInfo) && <div className="mv-row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <label className="mv-field"><span>模型</span><select value={model} disabled={busy} onChange={event => setAutoOptions(o => ({ ...o, model: event.target.value }))}>{models.map(m => <option key={m} value={m}>{MODEL_LABELS[m] ?? m}</option>)}</select></label>
            <label className="mv-field"><span>语言</span><select value={autoOptions.language} disabled={busy} onChange={event => setAutoOptions(o => ({ ...o, language: event.target.value }))}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="mv-check"><input type="checkbox" checked={autoOptions.separate} disabled={busy} onChange={event => setAutoOptions(o => ({ ...o, separate: event.target.checked }))} /><span>先分离人声（Demucs，更准）</span></label>
            <label className="mv-check"><input type="checkbox" checked={verifySynced} disabled={busy} onChange={event => setAutoOptions(o => ({ ...o, verifySynced: event.target.checked }))} /><span>LRCLIB 有时间轴时也用引擎核对</span></label>
          </div>}
          {!engineReady(engineInfo) && <EngineCard api={api} info={engineInfo} refresh={refreshEngine} compact />}
          {auto && <ol className="mv-steps" aria-live="polite">
            {AUTO_STEPS.map(step => { const s = auto.steps[step.id] ?? { state: 'pending' }; const p = auto.progress?.id === step.id && s.state === 'running' ? auto.progress : null; return (
              <li key={step.id} className={`mv-step-${s.state}`}><span className="mv-step-dot" aria-hidden="true">{STEP_DOT[s.state]}</span>
                <span>{step.label}{p ? ` · ${Math.round((p.ratio ?? 0) * 100)}%${p.stage ? ` ${STAGES[p.stage] ?? p.stage}` : ''}` : ''}{s.detail ? <span className="mv-caption"> — {stepText(step.id, s.detail)}</span> : null}</span></li>) })}
          </ol>}
          {auto?.log?.length > 0 && auto.running && <pre className="mv-log">{auto.log.slice(-4).join('\n')}</pre>}
        </div>
        {progress && <Alert kind="info"><p>{STAGES[progress.stage] ?? progress.stage}… {Math.round((progress.ratio ?? 0) * 100)}%</p></Alert>}
        <div className="mv-row">
          <button type="button" className="mv-button" disabled={!file || !title.trim() || busy} onClick={() => void autoMake()}>{auto?.running ? '正在自动制作…' : '自动制作'}</button>
          {auto?.running && <button type="button" className="mv-button mv-button-secondary" onClick={() => stopRef.current?.abort()}>停止</button>}
          <button type="button" className="mv-button mv-button-secondary" disabled={!file || !title.trim() || busy} onClick={() => void create()}>{progress ? '正在创建…' : '只建包（AI 估计时间）'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={busy} onClick={onClose}>取消</button>
        </div>
      </>}
      {result && <>
        {result.auto && <Alert kind={result.auto.steps.align?.low ? 'warn' : 'ok'}><p className="mv-wrap">歌词时间轴已自动完成：{result.auto.lines.length} 句（来源 {result.auto.source}）{result.auto.steps.align?.low ? `，${result.auto.steps.align.low} 句置信度低，已在播放器下方「歌词校准」里标黄，按 N 逐句检查` : ''}；段落 {result.auto.sections.length} 个已写入 sections.json。</p></Alert>}
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
