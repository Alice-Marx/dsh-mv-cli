/**
 * MV 终端 / 独立窗口: runs the user's own TUI player (world_execute_me
 * tui_live.py, or an MV pack's external renderer) in a pseudo terminal on the
 * Host and shows it with xterm.js, or opens it in a real Windows console
 * window.
 *
 * Paths are validated automatically (Host terminalCheck, debounced). Audio
 * that tui_live.py's MCI cannot open is converted to a cached WAV on Play
 * (decoded by the panel, keyed by sha256; ffmpeg only after a confirmation).
 * Starting always goes through the confirmation card with the exact command.
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
import { AudioPrepareError, effectiveAudioPath, prepareTerminalAudio } from './mv-wav.mjs'
import { ffmpegArgs } from '../shared/mv-audio-protocol.mjs'
import { displayCommand } from '../shared/mv-terminal-protocol.mjs'
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
  const [prepared, setPrepared] = React.useState(null) // { source, path, cached, label }
  const [preparing, setPreparing] = React.useState('')
  const [prepareFail, setPrepareFail] = React.useState(null) // { message, path, label, ffmpeg, confirming, busy }
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
  const audioPath = effectiveAudioPath(form)
  const audioOverride = prepared && prepared.source === audioPath ? prepared : null
  const ctx = { pack: activePack, checked, audioOverride }
  const problem = formProblem(form, ctx)
  const packMode = form.player === 'pack'
  React.useEffect(() => { setChecked(null); setConfirming(false) }, [activePack?.id, activePack?.loadedAt])
  // Choosing an MV pack with a terminal section offers its renderer right away.
  React.useEffect(() => { if (activePack?.terminal && form.player !== 'pack' && !form.packageDir) setForm({ player: 'pack' }) }, [activePack?.id])

  const check = async ({ quiet = false, override = audioOverride } = {}) => {
    setChecking(true); if (!quiet) setProblemText('')
    try { const value = await checkLaunch(api, form, { ...ctx, audioOverride: override }); if (mounted.current) { setChecked(value); setCheckError('') } return value }
    catch (error) { if (mounted.current) { setChecked(null); setCheckError(errorText(error, '路径检查失败。')) } return null }
    finally { if (mounted.current) setChecking(false) }
  }
  // Validate automatically shortly after the form settles (no "检查路径" button).
  const formKey = JSON.stringify(form) + (activePack?.loadedAt ?? '') + (audioOverride?.path ?? '')
  React.useEffect(() => {
    if (problem || confirming || session && !ended) return undefined
    const timer = setTimeout(() => { void check({ quiet: true }) }, 450)
    return () => clearTimeout(timer)
  }, [formKey, problem, confirming])

  // Real format of the audio the player will open, by content (MCI plays MP3 / PCM WAV only).
  React.useEffect(() => {
    setAudioInfo(null); setPrepareFail(null)
    if (!audioPath || packMode || typeof api.audioProbe !== 'function') return undefined
    let live = true
    const timer = setTimeout(() => {
      api.audioProbe({ path: audioPath })
        .then(response => { if (live && mounted.current) setAudioInfo(unwrapRemote(response, '无法读取音频文件。')) })
        .catch(() => { if (live && mounted.current) setAudioInfo(null) })
    }, 400)
    return () => { live = false; clearTimeout(timer) }
  }, [api, audioPath, form.player])
  const needsWav = Boolean(audioInfo && !packMode && !form.noAudio && audioInfo.mciPlayable === false && !audioOverride)

  /** Convert the audio for tui_live.py (cached by sha256); returns the override or null. */
  const prepareAudio = async () => {
    const source = audioPath
    setPreparing('正在检查音频…'); setPrepareFail(null); setProblemText('')
    const stageText = { probe: '检查音频', read: '读取', decode: '解码', upload: '写入 WAV 缓存', done: '完成' }
    try {
      const result = await prepareTerminalAudio(api, source, { onProgress: ({ stage, ratio }) => { if (mounted.current) setPreparing(`正在转换音频：${stageText[stage] ?? stage} ${Math.round((ratio ?? 0) * 100)}%`) } })
      if (!mounted.current) return null
      if (!result.converted) return null
      const value = { source, path: result.path, cached: result.cached, label: result.probe?.label ?? '' }
      setPrepared(value)
      return value
    } catch (error) {
      if (!mounted.current) return null
      if (error instanceof AudioPrepareError && (error.code === 'decode-failed' || error.code === 'unknown-format')) {
        let ffmpeg = ''
        try { const found = unwrapRemote(await api.ffmpegInfo({}), ''); if (found?.available) ffmpeg = found.path } catch { /* none */ }
        setPrepareFail({ message: error.message, path: source, label: error.probe?.label ?? '', ffmpeg, confirming: false, busy: '' })
        return undefined
      }
      // The file is missing or unreadable: let the path check report it.
      if (!audioInfo) return null
      setProblemText(errorText(error, '音频转换失败。'))
      return undefined
    } finally { if (mounted.current) setPreparing('') }
  }
  const convertWithFfmpeg = async () => {
    const failed = prepareFail
    if (!failed) return
    setPrepareFail({ ...failed, busy: '正在用 ffmpeg 转换…' })
    try {
      const done = unwrapRemote(await api.audioConvert({ path: failed.path, confirmed: true }), 'ffmpeg 转换失败。')
      if (!mounted.current) return
      setPrepared({ source: failed.path, path: done.path, cached: done.cached, label: failed.label, ffmpeg: true })
      setPrepareFail(null)
    } catch (error) { if (mounted.current) { setPrepareFail({ ...failed, busy: '', confirming: false }); setProblemText(errorText(error, 'ffmpeg 转换失败。')) } }
  }

  const platform = consoles.platform ?? info?.platform
  const consoleBlocked = consoles.supported === false ? (consoles.reason || '独立窗口不可用。') : consoleProblem(form, { platform, pack: activePack, checked, audioOverride })
  const running = Boolean(session && !ended)
  const canPlay = !problem && !checking && !starting && !confirming && !preparing && (consoleMode ? !consoleBlocked : !running) && !(packMode && !checked)

  const confirmAfterCheck = async () => {
    setProblemText('')
    let override = audioOverride
    if (!packMode && audioPath && !form.noAudio && !audioOverride) {
      const made = await prepareAudio()
      if (made === undefined) return
      if (made) override = made
    }
    const value = packMode || !checked || override !== audioOverride ? await check({ override }) : checked
    if (!value) return
    if (consoleMode) {
      const blocked = consoleProblem(form, { platform, pack: activePack, checked: value, audioOverride: override })
      if (blocked) { setProblemText(blocked); return }
    }
    setConfirming(true)
  }
  React.useImperativeHandle(ref, () => ({ primary: () => { if (canPlay) void confirmAfterCheck() } }))
  React.useEffect(() => {
    onState({ canPlay, running, busy: checking || starting || Boolean(preparing), busyLabel: preparing ? '转换音频…' : '', label: consoleMode ? '在独立窗口播放' : '在面板终端播放', confirming })
  }, [canPlay, running, checking, starting, consoleMode, confirming, preparing])

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
          <p className="mv-caption">选择 world_execute_me 文件夹（里面有 <code>_tools\tui_live.py</code> 和 <code>python\python.exe</code>），插件会自动填好 Python 路径并检查。也可以在上方切换为 MV 包的渲染程序。</p>
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
      <Alert kind="ok"><p><b>已就绪</b>{audioOverride ? ` · 音频 ${audioOverride.label || ''} → WAV 缓存` : checked.audio?.format ? ` · 音频 ${checked.audio.label}` : form.noAudio && !packMode ? ' · 不播放声音' : ''}{consoleMode ? ' · 将打开一个 Windows 控制台窗口' : ' · 在下方面板终端中显示'}</p>
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
        {needsWav && !preparing && !prepareFail && <Alert kind="info"><p className="mv-wrap">音频是 <b>{audioInfo.label}</b>：tui_live.py（Windows MCI）只能直接播放 MP3 / PCM WAV，点播放时会自动转换成 WAV 缓存（每个文件只转换一次，原文件不变）。</p></Alert>}
        {preparing && <Alert kind="info"><p>{preparing}</p></Alert>}
        {audioOverride && <Alert kind="ok"><p className="mv-wrap">音频已{audioOverride.cached ? '使用缓存的' : '转换为'} WAV{audioOverride.ffmpeg ? '（ffmpeg）' : ''}：<code>{audioOverride.path}</code></p></Alert>}
        {prepareFail && <Alert kind="warn" actions={<>
          {prepareFail.ffmpeg && !prepareFail.confirming && <button type="button" className="mv-button mv-button-small" onClick={() => setPrepareFail({ ...prepareFail, confirming: true })}>用 ffmpeg 转换…</button>}
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => { setPrepareFail(null); setForm({ noAudio: true }) }}>不播放声音</button>
        </>}>
          <p className="mv-wrap">面板无法解码这个音频（{prepareFail.label || prepareFail.message}）。{prepareFail.ffmpeg ? '找到了你本机的 ffmpeg，可以用它转换。' : '安装 ffmpeg（放进 PATH，或 D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe）后可以转换；或换成 MP3 / M4A / FLAC / WAV。'}</p>
          {prepareFail.confirming && <div className="mv-confirm" role="dialog" aria-label="确认用 ffmpeg 转换">
            <strong>用你本机的 ffmpeg 转换这个文件？</strong>
            <span className="mv-caption">Host 将运行（不经过 shell，最多 10 分钟；输出写入插件的 WAV 缓存）：</span>
            <code className="mv-cmd">{displayCommand(prepareFail.ffmpeg, ffmpegArgs(prepareFail.path, '<插件缓存>\\<sha256>.wav'))}</code>
            <div className="mv-row">
              <button type="button" className="mv-button" disabled={Boolean(prepareFail.busy)} onClick={() => void convertWithFfmpeg()}>{prepareFail.busy || '确认转换'}</button>
              <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(prepareFail.busy)} onClick={() => setPrepareFail({ ...prepareFail, confirming: false })}>取消</button>
            </div>
          </div>}
        </Alert>}
        {problemText && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{problemText}</p></Alert>}
        {consoleNote && <Alert kind="info"><p>{consoleNote}</p></Alert>}
      </div>

      {confirming && consoleMode && <div className="mv-confirm" role="dialog" aria-label="确认在独立窗口播放">
        <strong>{consoleDetails.title}</strong>
        <span className="mv-caption">Host 将执行：</span><code className="mv-cmd">{consoleDetails.command}</code>
        <span className="mv-caption">窗口里运行的播放器：</span><code className="mv-cmd">{consoleDetails.player}</code>
        <ul>{consoleDetails.points.map(point => <li key={point}>{point}</li>)}{audioOverride && <li>音频已自动转换为 WAV 缓存（原文件 {audioOverride.source} 不变）。</li>}</ul>
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
        <ul>{details.points.map(point => <li key={point}>{point}</li>)}</ul>
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
        <summary>设置 / 高级 <span className="mv-caption">路径、音频、起始位置{packMode ? '、偏移' : '、延迟补偿'}、字号</span></summary>
        <div className="mv-details-body">
          <div className="mv-form">
            {packMode && <>
              <label className="mv-field"><span>起始秒数 {'{start}'}</span><input value={form.packStart} placeholder="0" inputMode="decimal" onChange={event => setForm({ packStart: event.target.value })} /></label>
              <label className="mv-field"><span>偏移（秒）{'{offset}'}</span><input value={form.packOffset} placeholder="0" inputMode="decimal" onChange={event => setForm({ packOffset: event.target.value })} /></label>
            </>}
            {!packMode && <>
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
            {!packMode && <label className="mv-field mv-wide"><span>音频或视频文件（可选；留空用播放器自带的 input\song.mp3；任何格式，按内容识别）</span>
              <input value={form.audioFile} spellCheck={false} disabled={form.noAudio} placeholder={audioPath || 'D:\\music\\world.execute(me).m4a'} onChange={event => setForm({ audioFile: event.target.value })} />
              {audioInfo && <span className="mv-field-help">格式：{audioInfo.label}{audioInfo.mciPlayable ? '（可以直接播放）' : '（播放前自动转换为 WAV）'}</span>}</label>}
            {!packMode && <label className="mv-field"><span>起始秒数</span><input value={form.start} placeholder="0" inputMode="decimal" onChange={event => setForm({ start: event.target.value })} /></label>}
            {!packMode && <label className="mv-field"><span>音频延迟补偿（秒）</span><input value={form.audioLatency} placeholder="默认" inputMode="decimal" onChange={event => setForm({ audioLatency: event.target.value })} /></label>}
            <label className="mv-field"><span>面板终端字号</span><input type="number" min={8} max={24} value={fontSize} onChange={event => setFontSize(Number(event.target.value))} /></label>
            {!packMode && <label className="mv-check"><input type="checkbox" checked={form.noAudio} onChange={event => setForm({ noAudio: event.target.checked })} /> 不播放声音（--no-audio）</label>}
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
