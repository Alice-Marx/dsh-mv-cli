/**
 * MV 终端 / 独立窗口: runs the user's own TUI player (world_execute_me
 * tui_live.py, a user-downloaded build of the Rust rewrite, or an MV pack's
 * external renderer) in a pseudo terminal on the Host and shows it with
 * xterm.js, or opens it in a real Windows console window.
 *
 * Paths are validated automatically (Host terminalCheck, debounced). Starting
 * always goes through the confirmation card that shows the exact command.
 */
import React from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import xtermCss from '@xterm/xterm/css/xterm.css'
import {
  TerminalConnection, checkLaunch, commandPreview, confirmationDetails, endDescription, errorText,
  formProblem, loadForm, saveForm, startSession, suggestedPython,
  consoleConfirmationDetails, consoleProblem, loadConsoles, startConsole, stopConsole,
} from './mv-terminal-state.mjs'
import { unwrapRemote } from './remote-state.mjs'
import { convertFileToWav, effectiveAudioPath } from './mv-wav.mjs'
import { directoryPicker } from './mv-pack-state.mjs'
import { Alert, Segmented } from './mv-ui.jsx'

const THEME = Object.freeze({ background: '#000000', foreground: '#ffaf5f', cursor: '#ffaf5f', selectionBackground: '#5f5f00' })
const FONT_KEY = 'dsh-mv.terminal.fontSize'
const readFont = () => { try { const v = Number(globalThis.localStorage?.getItem(FONT_KEY)); return v >= 8 && v <= 24 ? v : 13 } catch { return 13 } }

function TerminalScreen({ api, session, onEnded, fontSize, ended, onStop, onFont }) {
  const host = React.useRef(null)
  const [error, setError] = React.useState('')
  const [renderer, setRenderer] = React.useState('')
  const termRef = React.useRef(null)
  React.useEffect(() => {
    const term = new Terminal({
      cursorBlink: false, fontSize, scrollback: 0, theme: THEME, allowProposedApi: true,
      fontFamily: '"Cascadia Mono", Consolas, "Sarasa Mono SC", "Microsoft YaHei Mono", Menlo, monospace',
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(host.current)
    termRef.current = { term, fit }
    try {
      const webgl = new WebglAddon()
      webgl.onContextLoss(() => { webgl.dispose(); setRenderer('DOM（WebGL 上下文丢失后回退）') })
      term.loadAddon(webgl)
      setRenderer('WebGL')
    } catch { setRenderer('DOM（WebGL 不可用）') }
    const connection = new TerminalConnection({
      api, sessionId: session.sessionId,
      onData: data => term.write(data),
      onExit: event => { term.write(`\r\n\x1b[0m\x1b[90m[${endDescription(event)}]\x1b[0m\r\n`); onEnded(session.sessionId, event) },
      onError: failure => setError(errorText(failure, '终端通信失败。')),
    })
    const input = term.onData(data => connection.send(data))
    const resized = term.onResize(({ cols, rows }) => connection.resize(cols, rows))
    const refit = () => { try { if (host.current?.offsetParent !== null) fit.fit() } catch { /* hidden */ } }
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(refit) : null
    observer?.observe(host.current)
    refit()
    void connection.start()
    term.focus()
    return () => { observer?.disconnect(); input.dispose(); resized.dispose(); void connection.stop(); termRef.current = null; term.dispose() }
  }, [session.sessionId])
  React.useEffect(() => {
    const current = termRef.current
    if (!current || current.term.options.fontSize === fontSize) return
    current.term.options.fontSize = fontSize
    try { current.fit.fit() } catch { /* hidden */ }
  }, [fontSize])
  return (
    <div className="mv-term-pane">
      {session.limitation && <Alert kind="warn"><p>{session.limitation}{session.ptyError ? `（${session.ptyError}）` : ''}</p></Alert>}
      {error && <Alert kind="error"><p>{error}</p></Alert>}
      <div className="mv-term-screen" ref={host} />
      <div className="mv-term-bar">
        <span className={`mv-dot${ended ? ' mv-dot-off' : ''}`} aria-hidden="true" />
        <b>{ended ? endDescription(ended) : '正在面板终端播放'}</b>
        <span className="mv-caption">点进画面后按键直接发给播放器（Q 退出）· 渲染 {renderer || '…'} · 经长轮询转发，约慢 30–150 ms</span>
        <span className="mv-spacer" />
        <span className="mv-stepper" title="终端字号">
          <button type="button" aria-label="减小字号" onClick={() => onFont(fontSize - 1)}>A−</button>
          <span>{fontSize}px</span>
          <button type="button" aria-label="增大字号" onClick={() => onFont(fontSize + 1)}>A+</button>
        </span>
        {!ended && <button type="button" className="mv-button mv-button-danger mv-button-small" onClick={onStop}>结束</button>}
      </div>
    </div>
  )
}


const PLAYER_OPTIONS = Object.freeze([
  { value: 'python', label: 'world_execute_me', title: 'world_execute_me 自带的 tui_live.py（Python）' },
  { value: 'rust', label: 'Rust 版', title: 'world-execute-me-ascii-rust（自行下载的 exe）' },
  { value: 'pack', label: 'MV 包渲染程序', title: '当前 MV 包 mv.json 里的 terminal 配置' },
])

const splitProblems = text => String(text ?? '').split('\n').map(line => line.trim()).filter(Boolean)

export const MvTerminal = React.forwardRef(function MvTerminal({ api, info, infoError = '', reloadInfo, pack = null, destination = 'panel', onState = () => {} }, ref) {
  const [form, setFormState] = React.useState(loadForm)
  const [checked, setChecked] = React.useState(null)
  const [checking, setChecking] = React.useState(false)
  const [checkError, setCheckError] = React.useState('')
  const [confirming, setConfirming] = React.useState(false)
  const [starting, setStarting] = React.useState(false)
  const [problemText, setProblemText] = React.useState('')
  const [session, setSession] = React.useState(null)
  const [ended, setEnded] = React.useState(null)
  const [fontSize, setFontSizeState] = React.useState(readFont)
  const [consoles, setConsoles] = React.useState({ supported: null, reason: '', consoles: [] })
  const [consoleNote, setConsoleNote] = React.useState('')
  const [advanced, setAdvanced] = React.useState(false)
  const [onboardDir, setOnboardDir] = React.useState('')
  const [audioInfo, setAudioInfo] = React.useState(null)
  const [converting, setConverting] = React.useState('')
  const [convertNote, setConvertNote] = React.useState('')
  const wavInput = React.useRef(null)
  const mounted = React.useRef(true)
  React.useEffect(() => () => { mounted.current = false }, [])
  const consoleMode = destination === 'console'
  const setFontSize = value => { const next = Math.min(24, Math.max(8, Math.round(value) || 13)); setFontSizeState(next); try { globalThis.localStorage?.setItem(FONT_KEY, String(next)) } catch { /* ignore */ } }

  const refreshConsoles = React.useCallback(async () => {
    try { const value = await loadConsoles(api); if (mounted.current) setConsoles(value) }
    catch (error) { if (mounted.current) setConsoles(previous => ({ ...previous, supported: previous.supported ?? false, reason: errorText(error, '无法读取独立窗口状态。') })) }
  }, [api])
  React.useEffect(() => { void refreshConsoles() }, [refreshConsoles])
  const liveConsoles = consoles.consoles.filter(item => !item.exited)
  React.useEffect(() => {
    if (!liveConsoles.length) return undefined
    const timer = setInterval(() => { void refreshConsoles() }, 3000)
    return () => clearInterval(timer)
  }, [liveConsoles.length, refreshConsoles])

  const setForm = patch => {
    setFormState(previous => { const next = { ...previous, ...patch }; saveForm(next); return next })
    setChecked(null); setCheckError(''); setConfirming(false); setProblemText('')
  }
  const activePack = pack && !pack.builtin ? pack : null
  const ctx = { pack: activePack, checked }
  const problem = formProblem(form, ctx)
  const rust = form.player === 'rust'
  const packMode = form.player === 'pack'
  React.useEffect(() => { setChecked(null); setConfirming(false) }, [activePack?.id, activePack?.loadedAt])
  // Choosing an MV pack with a terminal section offers its renderer right away.
  React.useEffect(() => { if (activePack?.terminal && form.player !== 'pack' && !form.packageDir && !form.exePath) setForm({ player: 'pack' }) }, [activePack?.id])

  const check = async ({ quiet = false } = {}) => {
    setChecking(true); if (!quiet) setProblemText('')
    try { const value = await checkLaunch(api, form, ctx); if (mounted.current) { setChecked(value); setCheckError('') } return value }
    catch (error) { if (mounted.current) { setChecked(null); setCheckError(errorText(error, '路径检查失败。')) } return null }
    finally { if (mounted.current) setChecking(false) }
  }
  // Validate automatically shortly after the form settles (no "检查路径" button).
  const formKey = JSON.stringify(form) + (activePack?.loadedAt ?? '')
  React.useEffect(() => {
    if (problem || confirming || session && !ended) return undefined
    const timer = setTimeout(() => { void check({ quiet: true }) }, 450)
    return () => clearTimeout(timer)
  }, [formKey, problem, confirming])

  // Real format of the audio the player will open (MCI plays MP3/WAV only).
  const audioPath = effectiveAudioPath(form)
  React.useEffect(() => {
    setAudioInfo(null)
    if (!audioPath || typeof api.audioProbe !== 'function') return undefined
    let live = true
    const timer = setTimeout(() => {
      api.audioProbe({ path: audioPath, player: rust ? 'rust' : 'python' })
        .then(response => { if (live && mounted.current) setAudioInfo(unwrapRemote(response, '无法读取音频文件。')) })
        .catch(() => { if (live && mounted.current) setAudioInfo(null) })
    }, 400)
    return () => { live = false; clearTimeout(timer) }
  }, [api, audioPath, form.player])
  const audioWarning = audioInfo?.warning || ''

  const convertWav = async file => {
    if (!file) return
    setConverting('读取…'); setConvertNote(''); setProblemText('')
    try {
      const stageText = { read: '读取', decode: '解码', upload: '写入缓存', done: '完成' }
      const result = await convertFileToWav(api, file, { onProgress: ({ stage, ratio }) => { if (mounted.current) setConverting(`${stageText[stage] ?? stage} ${Math.round(ratio * 100)}%`) } })
      if (!mounted.current) return
      setForm({ audioFile: result.path, noAudio: false })
      setConvertNote(`已转换为 WAV（${(result.bytes / 1048576).toFixed(1)} MB，${Math.round(result.duration)} 秒${result.cached ? '，使用已有缓存' : ''}），音频已改为：${result.path}`)
    } catch (error) { if (mounted.current) setProblemText(errorText(error, '转换为 WAV 失败。')) }
    finally { if (mounted.current) setConverting('') }
  }

  const platform = consoles.platform ?? info?.platform
  const consoleBlocked = consoles.supported === false ? (consoles.reason || '独立窗口不可用。') : consoleProblem(form, { platform, pack: activePack, checked })
  const running = Boolean(session && !ended)
  const canPlay = !problem && !checking && !starting && !confirming && (consoleMode ? !consoleBlocked : !running) && !(packMode && !checked)

  const confirmAfterCheck = async () => {
    setProblemText('')
    const value = packMode || !checked ? await check() : checked
    if (!value) return
    if (consoleMode) {
      const blocked = consoleProblem(form, { platform, pack: activePack, checked: value })
      if (blocked) { setProblemText(blocked); return }
    }
    setConfirming(true)
  }
  React.useImperativeHandle(ref, () => ({ primary: () => { if (canPlay) void confirmAfterCheck() } }))
  React.useEffect(() => {
    onState({ canPlay, running, busy: checking || starting, label: consoleMode ? '在独立窗口播放' : '在面板终端播放', confirming })
  }, [canPlay, running, checking, starting, consoleMode, confirming])

  const openConsole = async () => {
    setStarting(true); setProblemText(''); setConsoleNote('')
    try {
      const value = await startConsole(api, form, ctx)
      if (!mounted.current) return
      setConfirming(false)
      setConsoleNote(value.warning ?? `已打开独立窗口（播放器 PID ${value.pid}）。`)
      await refreshConsoles()
    } catch (error) { if (mounted.current) setProblemText(errorText(error, '无法打开独立窗口。')) }
    finally { if (mounted.current) setStarting(false) }
  }
  const start = async () => {
    setStarting(true); setProblemText('')
    try {
      const value = await startSession(api, form, { cols: 120, rows: 40 }, ctx)
      if (!mounted.current) { void api.terminalStop({ sessionId: value.sessionId }); return }
      setSession(value); setEnded(null); setConfirming(false)
    } catch (error) { if (mounted.current) setProblemText(errorText(error, 'MV 终端启动失败。')) }
    finally { if (mounted.current) setStarting(false) }
  }
  const onEnded = React.useCallback((sessionId, event) => { if (mounted.current) { setEnded(event); void reloadInfo?.() } }, [reloadInfo])
  const details = confirmationDetails(form, checked, ctx)
  const consoleDetails = consoleConfirmationDetails(form, ctx)
  const pick = directoryPicker()
  const chooseDir = async field => {
    try {
      const dir = await pick?.()
      if (!dir) return
      if (field === 'packageDir') setForm({ packageDir: dir, ...(form.pythonPath ? {} : { pythonPath: suggestedPython(dir) }) })
      else setForm({ [field]: dir })
    } catch (error) { setProblemText(errorText(error, '无法打开文件夹选择器。')) }
  }

  // ---- status card -------------------------------------------------------
  const firstRun = form.player === 'python' && !form.packageDir.trim() && !form.pythonPath.trim()
  const suggestion = form.player === 'python' && form.packageDir.trim() && !form.pythonPath.trim() ? suggestedPython(form.packageDir) : ''
  const fixes = []
  if (suggestion) fixes.push(<button key="py" type="button" className="mv-button mv-button-small" onClick={() => setForm({ pythonPath: suggestion })}>使用 {suggestion}</button>)
  if (!firstRun) fixes.push(<button key="adv" type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => setAdvanced(true)}>打开设置</button>)

  let status = null
  if (infoError) status = <Alert kind="error"><p>{infoError}</p></Alert>
  else if (firstRun) {
    status = (
      <div className="mv-onboard">
        <span className="mv-onboard-badge">&gt;_</span>
        <div>
          <h2>在终端里播放，需要你本机的播放器</h2>
          <p className="mv-caption">选择 world_execute_me 文件夹（里面有 <code>_tools\tui_live.py</code> 和 <code>python\python.exe</code>），插件会自动填好 Python 路径并检查。也可以在上方切换为 Rust 版或 MV 包的渲染程序。</p>
          <div className="mv-field-row" style={{ marginTop: 8 }}>
            <input value={onboardDir} spellCheck={false} placeholder="F:\everyAI\dsh-mv-cli\world_execute_me" aria-label="world_execute_me 文件夹"
              style={{ height: 30, padding: '0 8px', borderRadius: 8, border: '1px solid var(--mv-border)', background: 'var(--mv-bg)' }}
              onChange={event => setOnboardDir(event.target.value)}
              onBlur={event => { const dir = event.target.value.trim(); if (dir) setForm({ packageDir: dir, pythonPath: suggestedPython(dir) }) }}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} />
            {pick && <button type="button" className="mv-button" onClick={() => void chooseDir('packageDir')}>选择文件夹…</button>}
            {onboardDir.trim() && <button type="button" className="mv-button mv-button-secondary" onClick={() => setForm({ packageDir: onboardDir.trim(), pythonPath: suggestedPython(onboardDir.trim()) })}>使用此文件夹</button>}
          </div>
        </div>
      </div>
    )
  } else if (problem) status = <Alert kind="warn" actions={fixes}><p>{problem}</p></Alert>
  else if (checkError) {
    status = <Alert kind="error" actions={fixes}>{splitProblems(checkError).map(line => <p key={line} className="mv-wrap">{line}</p>)}</Alert>
  } else if (checking && !checked) status = <Alert kind="info"><p>正在检查路径…</p></Alert>
  else if (checked) {
    status = (
      <Alert kind="ok"><p><b>{audioWarning && !packMode ? '路径检查通过（但声音有问题，见下方）' : '已就绪'}</b>{checked.audio?.format ? ` · 音频 ${checked.audio.label}` : form.noAudio && !rust && !packMode ? ' · 不播放声音' : ''}{consoleMode ? ' · 将打开一个 Windows 控制台窗口' : ' · 在下方面板终端中显示'}</p>
        <p className="mv-caption mv-wrap" title={checked.display}>{checked.display}</p></Alert>
    )
  }

  return (
    <div className="mv-term-tab">
      <style>{xtermCss}</style>
      <div className="mv-card-box">
        <div className="mv-row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>播放器</h2>
          <Segmented small label="播放器" value={form.player} onChange={value => setForm({ player: value })}
            options={PLAYER_OPTIONS.map(option => option.value === 'pack' ? { ...option, disabled: !activePack?.terminal && form.player !== 'pack', title: activePack?.terminal ? `MV 包：${activePack.pack.title}（${activePack.terminal.label}）` : '当前 MV 包没有 terminal 配置' } : option)} />
        </div>
        {packMode && activePack?.terminal && <p className="mv-caption">渲染程序 <code>{activePack.terminal.program}</code>{activePack.terminal.script ? <> · 脚本 <code>{activePack.terminal.script}</code></> : null}</p>}
        {status}
        {consoleMode && !problem && !firstRun && consoleBlocked && <Alert kind="warn"><p>独立窗口：{consoleBlocked}</p></Alert>}
        {audioInfo && audioWarning && !packMode && <Alert kind="warn" actions={!rust ? <>
          <button type="button" className="mv-button mv-button-small" disabled={Boolean(converting)} onClick={() => wavInput.current?.click()}>{converting || '转换为 WAV…'}</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => setForm({ noAudio: true })}>不播放声音</button>
          <span className="mv-caption">在弹出的对话框里选同一个文件；转换结果存入插件缓存，不改动原文件。</span>
        </> : null}><p className="mv-wrap">{audioWarning}</p></Alert>}
        {convertNote && <Alert kind="ok"><p className="mv-wrap">{convertNote}</p></Alert>}
        {problemText && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{problemText}</p></Alert>}
        {consoleNote && <Alert kind="info"><p>{consoleNote}</p></Alert>}
        {!rust && !packMode && <input ref={wavInput} type="file" accept="audio/*,video/mp4,.mp3,.m4a,.mp4,.aac,.ogg,.flac,.wav" className="mv-hidden"
          onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void convertWav(file) }} />}
      </div>

      {confirming && consoleMode && <div className="mv-confirm" role="dialog" aria-label="确认在独立窗口播放">
        <strong>{consoleDetails.title}</strong>
        <span className="mv-caption">Host 将执行：</span><code className="mv-cmd">{consoleDetails.command}</code>
        <span className="mv-caption">窗口里运行的播放器：</span><code className="mv-cmd">{consoleDetails.player}</code>
        <ul>{consoleDetails.points.map(point => <li key={point}>{point}</li>)}{audioWarning && !packMode && <li className="mv-error">{audioWarning}</li>}</ul>
        <div className="mv-row">
          <button type="button" className="mv-button" disabled={starting} onClick={() => void openConsole()}>{starting ? '正在打开…' : '确认打开窗口'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={starting} onClick={() => setConfirming(false)}>取消</button>
        </div>
      </div>}
      {confirming && !consoleMode && <div className="mv-confirm" role="dialog" aria-label="确认启动 MV 终端">
        <strong>{details.title}</strong>
        <span className="mv-caption">命令：</span><code className="mv-cmd">{details.command}</code>
        <span className="mv-caption">工作目录：<code>{details.cwd}</code></span>
        {details.argv?.length > 0 && <ol className="mv-argv" aria-label="逐个参数">{details.argv.map((arg, i) => <li key={i}><code>{arg}</code></li>)}</ol>}
        <ul>{details.points.map(point => <li key={point}>{point}</li>)}{!packMode && audioWarning && <li className="mv-error">{audioWarning}</li>}</ul>
        <div className="mv-row">
          <button type="button" className="mv-button" disabled={starting} onClick={() => void start()}>{starting ? '正在启动…' : '确认启动'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={starting} onClick={() => setConfirming(false)}>取消</button>
        </div>
      </div>}

      {consoleMode && consoles.consoles.length > 0 && <div className="mv-console-list" aria-label="独立播放窗口">
        {consoles.consoles.map(item => <div key={item.consoleId} className="mv-console-item">
          <span className={`mv-dot${item.exited ? ' mv-dot-off' : ''}`} aria-hidden="true" />
          <b>{item.exited ? (item.endReason === 'stopped' ? '已由你结束' : item.endReason === 'dispose' ? '插件卸载时已结束' : '窗口已关闭') : '独立窗口正在播放'}</b>
          <span className="mv-caption" title={item.display}>{item.pid ? `PID ${item.pid}` : '未跟踪'} · {new Date(item.startedAt).toLocaleTimeString()}</span>
          <span className="mv-spacer" />
          {!item.exited && item.tracked && <button type="button" className="mv-button mv-button-danger mv-button-small" onClick={() => { void stopConsole(api, item.consoleId).catch(error => setProblemText(errorText(error, '无法结束独立窗口。'))).then(refreshConsoles) }}>结束</button>}
        </div>)}
      </div>}
      {!consoleMode && session && <TerminalScreen key={session.sessionId} api={api} session={session} onEnded={onEnded} fontSize={fontSize} ended={ended}
        onFont={setFontSize} onStop={() => void api.terminalStop({ sessionId: session.sessionId })} />}
      {!consoleMode && !session && !confirming && !firstRun && <div className="mv-placeholder"><div>
        <b>面板终端</b>
        <p className="mv-caption">{canPlay ? '点上方的 ▶ 在面板终端播放，确认命令后画面会出现在这里。' : '设置好播放器后，点上方的 ▶ 播放。'}</p>
      </div></div>}

      <details className="mv-details" open={advanced} onToggle={event => setAdvanced(event.currentTarget.open)}>
        <summary>设置 / 高级 <span className="mv-caption">路径、音频、起始位置{rust ? '、字幕偏移' : packMode ? '、偏移' : '、延迟补偿'}、字号</span></summary>
        <div className="mv-details-body">
          <div className="mv-form">
            {packMode && <>
              <label className="mv-field"><span>起始秒数 {'{start}'}</span><input value={form.packStart} placeholder="0" inputMode="decimal" onChange={event => setForm({ packStart: event.target.value })} /></label>
              <label className="mv-field"><span>偏移（秒）{'{offset}'}</span><input value={form.packOffset} placeholder="0" inputMode="decimal" onChange={event => setForm({ packOffset: event.target.value })} /></label>
            </>}
            {!rust && !packMode && <>
              <label className="mv-field mv-wide"><span>播放器目录（含 _tools\tui_live.py）</span>
                <span className="mv-field-row">
                  <input value={form.packageDir} spellCheck={false} placeholder="F:\everyAI\dsh-mv-cli\world_execute_me" onChange={event => setForm({ packageDir: event.target.value })}
                    onBlur={() => { if (!form.pythonPath && form.packageDir) setForm({ pythonPath: suggestedPython(form.packageDir) }) }} />
                  {pick && <button type="button" className="mv-button mv-button-secondary" onClick={() => void chooseDir('packageDir')}>浏览…</button>}
                </span></label>
              <label className="mv-field mv-wide"><span>Python 解释器</span>
                <span className="mv-field-row">
                  <input value={form.pythonPath} spellCheck={false} placeholder={suggestedPython(form.packageDir) || 'F:\\everyAI\\dsh-mv-cli\\world_execute_me\\python\\python.exe'} onChange={event => setForm({ pythonPath: event.target.value })} />
                  {form.packageDir && form.pythonPath !== suggestedPython(form.packageDir) && <button type="button" className="mv-button mv-button-secondary" onClick={() => setForm({ pythonPath: suggestedPython(form.packageDir) })}>自动填写</button>}
                </span></label>
            </>}
            {rust && !packMode && <label className="mv-field mv-wide"><span>world-execute-me-rust.exe（自行从其 GitHub Release 下载）</span>
              <input value={form.exePath} spellCheck={false} placeholder="D:\tools\world-execute-me-rust\world-execute-me-rust.exe" onChange={event => setForm({ exePath: event.target.value })} /></label>}
            {!packMode && <label className="mv-field mv-wide"><span>{rust ? '音频文件（可选，仅 MP3；留空播放其内嵌音乐）' : '音频文件（可选；留空用播放器自带的 input\\song.mp3）'}</span>
              <input value={form.audioFile} spellCheck={false} disabled={!rust && form.noAudio} placeholder={rust ? 'D:\\music\\world.execute(me).mp3' : audioPath || 'D:\\music\\world.execute(me).mp3'} onChange={event => setForm({ audioFile: event.target.value })} />
              {audioInfo && !audioWarning && <span className="mv-field-help">格式：{audioInfo.label}（可以播放）</span>}</label>}
            {!packMode && <label className="mv-field"><span>起始秒数</span><input value={form.start} placeholder="0" inputMode="decimal" onChange={event => setForm({ start: event.target.value })} /></label>}
            {!rust && !packMode && <label className="mv-field"><span>音频延迟补偿（秒）</span><input value={form.audioLatency} placeholder="默认" inputMode="decimal" onChange={event => setForm({ audioLatency: event.target.value })} /></label>}
            {rust && <label className="mv-field"><span>字幕偏移（秒）</span><input value={form.offset} placeholder="0" inputMode="decimal" onChange={event => setForm({ offset: event.target.value })} /></label>}
            <label className="mv-field"><span>面板终端字号</span><input type="number" min={8} max={24} value={fontSize} onChange={event => setFontSize(Number(event.target.value))} /></label>
            {!rust && !packMode && <label className="mv-check"><input type="checkbox" checked={form.noAudio} onChange={event => setForm({ noAudio: event.target.checked })} /> 不播放声音（--no-audio）</label>}
            {rust && <label className="mv-check"><input type="checkbox" checked={form.autoplay} onChange={event => setForm({ autoplay: event.target.checked })} /> 立即播放（--autoplay）</label>}
          </div>
          <p className="mv-caption">将运行：<code className="mv-wrap">{problem ? '—' : (checked?.display ?? commandPreview(form, ctx))}</code></p>
          <div className="mv-row">
            <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={Boolean(problem) || checking} onClick={() => void check()}>{checking ? '检查中…' : '重新检查'}</button>
            <span className="mv-caption">修改后会自动检查；面板只能启动这几种固定的播放器，不能传任意命令。</span>
          </div>
        </div>
      </details>
    </div>
  )
})
