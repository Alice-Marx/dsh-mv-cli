/**
 * "MV 终端": runs the user's own TUI player (world_execute_me tui_live.py, or a
 * user-downloaded build of the Rust rewrite) in a pseudo terminal on the Host
 * and shows it with xterm.js (WebGL renderer, DOM fallback).
 */
import React from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import xtermCss from '@xterm/xterm/css/xterm.css'
import {
  TerminalConnection, checkLaunch, commandPreview, confirmationDetails, endDescription, errorText,
  formProblem, loadForm, loadInfo, saveForm, startSession, suggestedPython,
  consoleConfirmationDetails, consoleProblem, loadConsoles, startConsole, stopConsole,
} from './mv-terminal-state.mjs'
import { MV_PLAYER_LABELS } from '../shared/mv-terminal-protocol.mjs'

const THEME = Object.freeze({ background: '#000000', foreground: '#ffaf5f', cursor: '#ffaf5f', selectionBackground: '#5f5f00' })

function TerminalScreen({ api, session, onEnded, fontSize }) {
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
      {session.limitation && <p className="mv-error">{session.limitation}{session.ptyError ? `（${session.ptyError}）` : ''}</p>}
      {error && <p className="mv-error" role="alert">{error}</p>}
      <div className="mv-term-screen" ref={host} />
      <p className="mv-caption">渲染：{renderer || '…'} · 输出经长轮询转发，约比原生终端慢 30–150 ms。点进终端后按键直接发给播放器（Q 退出）。</p>
    </div>
  )
}

export function MvTerminal({ api, info, reloadInfo }) {
  const [form, setFormState] = React.useState(loadForm)
  const [checked, setChecked] = React.useState(null)
  const [checking, setChecking] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)
  const [starting, setStarting] = React.useState(false)
  const [problemText, setProblemText] = React.useState('')
  const [session, setSession] = React.useState(null)
  const [ended, setEnded] = React.useState(null)
  const [fontSize, setFontSize] = React.useState(13)
  const [consoleMode, setConsoleMode] = React.useState(false)
  const [consoles, setConsoles] = React.useState({ supported: null, reason: '', consoles: [] })
  const [consoleNote, setConsoleNote] = React.useState('')
  const mounted = React.useRef(true)
  React.useEffect(() => () => { mounted.current = false }, [])

  const refreshConsoles = React.useCallback(async () => {
    try { const value = await loadConsoles(api); if (mounted.current) setConsoles(value) }
    catch (error) { if (mounted.current) setConsoles(previous => ({ ...previous, supported: previous.supported ?? false, reason: errorText(error, '无法读取独立窗口状态。') })) }
  }, [api])
  React.useEffect(() => { void refreshConsoles() }, [refreshConsoles])
  const liveConsoles = consoles.consoles.filter(item => !item.exited)
  // While a window is open, poll whether its player is still running.
  React.useEffect(() => {
    if (!liveConsoles.length) return undefined
    const timer = setInterval(() => { void refreshConsoles() }, 3000)
    return () => clearInterval(timer)
  }, [liveConsoles.length, refreshConsoles])

  const setForm = patch => {
    setFormState(previous => { const next = { ...previous, ...patch }; saveForm(next); return next })
    setChecked(null); setConfirming(false); setProblemText('')
  }
  const problem = formProblem(form)
  const rust = form.player === 'rust'

  const check = async () => {
    setChecking(true); setProblemText('')
    try { const value = await checkLaunch(api, form); if (mounted.current) setChecked(value) }
    catch (error) { if (mounted.current) { setChecked(null); setProblemText(errorText(error, '路径检查失败。')) } }
    finally { if (mounted.current) setChecking(false) }
  }

  const openConsole = async () => {
    setStarting(true); setProblemText(''); setConsoleNote('')
    try {
      const value = await startConsole(api, form)
      if (!mounted.current) return
      setConfirming(false); setConsoleMode(false)
      setConsoleNote(value.warning ?? `已打开独立窗口（播放器 PID ${value.pid}）。`)
      await refreshConsoles()
    } catch (error) { if (mounted.current) setProblemText(errorText(error, '无法打开独立窗口。')) }
    finally { if (mounted.current) setStarting(false) }
  }

  const start = async () => {
    setStarting(true); setProblemText('')
    try {
      const value = await startSession(api, form, { cols: 120, rows: 40 })
      if (!mounted.current) { void api.terminalStop({ sessionId: value.sessionId }); return }
      setSession(value); setEnded(null); setConfirming(false)
    } catch (error) { if (mounted.current) setProblemText(errorText(error, 'MV 终端启动失败。')) }
    finally { if (mounted.current) setStarting(false) }
  }

  const onEnded = React.useCallback((sessionId, event) => { if (mounted.current) { setEnded(event); void reloadInfo?.() } }, [reloadInfo])
  const details = confirmationDetails(form, checked)
  const consoleDetails = consoleConfirmationDetails(form)
  const platform = consoles.platform ?? info?.platform
  const consoleBlocked = consoles.supported === false ? (consoles.reason || '独立窗口不可用。') : consoleProblem(form, { platform })
  const backendText = info ? (info.backend === 'pty' ? '伪终端（PTY）可用。' : `PTY 不可用，只能用管道模式（播放器多半无法显示）。${info.ptyError ? `原因：${info.ptyError}` : ''}`) : ''

  return (
    <div className="mv-term-tab">
      <style>{xtermCss}</style>
      <p className="mv-caption">在面板里运行你本机已有的终端播放器。{backendText}</p>
      <div className="mv-form">
        <label className="mv-field"><span>播放器</span>
          <select value={form.player} onChange={event => setForm({ player: event.target.value })}>
            <option value="python">{MV_PLAYER_LABELS.python}</option>
            <option value="rust">{MV_PLAYER_LABELS.rust}</option>
          </select></label>
        {!rust && <>
          <label className="mv-field mv-wide"><span>播放器目录（含 _tools\tui_live.py）</span>
            <input value={form.packageDir} spellCheck={false} placeholder="F:\everyAI\dsh-mv-cli\world_execute_me" onChange={event => setForm({ packageDir: event.target.value })}
              onBlur={() => { if (!form.pythonPath && form.packageDir) setForm({ pythonPath: suggestedPython(form.packageDir) }) }} /></label>
          <label className="mv-field mv-wide"><span>Python 解释器</span>
            <input value={form.pythonPath} spellCheck={false} placeholder="F:\everyAI\dsh-mv-cli\world_execute_me\python\python.exe" onChange={event => setForm({ pythonPath: event.target.value })} /></label>
        </>}
        {rust && <label className="mv-field mv-wide"><span>world-execute-me-rust.exe（自行从其 GitHub Release 下载）</span>
          <input value={form.exePath} spellCheck={false} placeholder="D:\tools\world-execute-me-rust\world-execute-me-rust.exe" onChange={event => setForm({ exePath: event.target.value })} /></label>}
        <label className="mv-field mv-wide"><span>{rust ? '音频文件（可选，仅 MP3；留空播放其内嵌音乐）' : '音频文件（可选；留空用播放器默认的 input\\song.mp3）'}</span>
          <input value={form.audioFile} spellCheck={false} disabled={!rust && form.noAudio} placeholder="D:\music\world.execute(me).mp3" onChange={event => setForm({ audioFile: event.target.value })} /></label>
        {!rust && <label className="mv-check"><input type="checkbox" checked={form.noAudio} onChange={event => setForm({ noAudio: event.target.checked })} /> 不播放声音（--no-audio）</label>}
        <label className="mv-field"><span>起始秒数</span><input value={form.start} placeholder="0" inputMode="decimal" onChange={event => setForm({ start: event.target.value })} /></label>
        {!rust && <label className="mv-field"><span>音频延迟补偿（秒）</span><input value={form.audioLatency} placeholder="默认" inputMode="decimal" onChange={event => setForm({ audioLatency: event.target.value })} /></label>}
        {rust && <label className="mv-field"><span>字幕偏移（秒）</span><input value={form.offset} placeholder="0" inputMode="decimal" onChange={event => setForm({ offset: event.target.value })} /></label>}
        {rust && <label className="mv-check"><input type="checkbox" checked={form.autoplay} onChange={event => setForm({ autoplay: event.target.checked })} /> 立即播放（--autoplay）</label>}
      </div>
      <p className="mv-caption">将运行：<code>{problem ? '—' : (checked?.display ?? commandPreview(form))}</code></p>
      {!confirming && <div className="mv-actions">
        <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(problem) || checking} onClick={() => void check()}>{checking ? '检查中…' : '检查路径'}</button>
        <button type="button" className="mv-button" disabled={Boolean(problem) || Boolean(session && !ended)} onClick={() => { setConsoleMode(false); setConfirming(true) }}>在面板中启动…</button>
        <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(consoleBlocked)} title={consoleBlocked || '在真实的 Windows 控制台窗口中播放'}
          onClick={() => { setConsoleMode(true); setConfirming(true) }}>在独立窗口播放…</button>
        {session && !ended && <button type="button" className="mv-button mv-button-secondary" onClick={() => void api.terminalStop({ sessionId: session.sessionId })}>结束</button>}
        <label className="mv-inline">字号<input type="number" min={8} max={24} value={fontSize} onChange={event => setFontSize(Math.min(24, Math.max(8, Number(event.target.value) || 13)))} /></label>
        <span className="mv-caption">{problem || (checked ? '路径检查通过。' : '')}</span>
      </div>}
      {!confirming && !problem && consoleBlocked && <p className="mv-caption">独立窗口：{consoleBlocked}</p>}
      {confirming && consoleMode && <div className="mv-confirm" role="dialog" aria-label="确认在独立窗口播放">
        <strong>{consoleDetails.title}</strong>
        <p className="mv-caption">Host 将执行：<code>{consoleDetails.command}</code><br />窗口里运行的播放器：<code>{consoleDetails.player}</code></p>
        <ul>{consoleDetails.points.map(point => <li key={point}>{point}</li>)}</ul>
        <div className="mv-actions">
          <button type="button" className="mv-button" disabled={starting} onClick={() => void openConsole()}>{starting ? '正在打开…' : '确认打开窗口'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={starting} onClick={() => { setConfirming(false); setConsoleMode(false) }}>取消</button>
        </div>
      </div>}
      {confirming && !consoleMode && <div className="mv-confirm" role="dialog" aria-label="确认启动 MV 终端">
        <strong>{details.title}</strong>
        <p className="mv-caption">命令：<code>{details.command}</code><br />工作目录：<code>{details.cwd}</code></p>
        <ul>{details.points.map(point => <li key={point}>{point}</li>)}</ul>
        <div className="mv-actions">
          <button type="button" className="mv-button" disabled={starting} onClick={() => void start()}>{starting ? '正在启动…' : '确认启动'}</button>
          <button type="button" className="mv-button mv-button-secondary" disabled={starting} onClick={() => setConfirming(false)}>取消</button>
        </div>
      </div>}
      {problemText && <pre className="mv-error" role="alert">{problemText}</pre>}
      {consoleNote && <p className="mv-caption">{consoleNote}</p>}
      {consoles.consoles.length > 0 && <div className="mv-console-list" aria-label="独立播放窗口">
        {consoles.consoles.map(item => <div key={item.consoleId} className="mv-console-item">
          <code title={item.display}>{item.pid ? `PID ${item.pid}` : '未跟踪'}</code>
          <span className="mv-caption">{item.exited ? (item.endReason === 'stopped' ? '已由你结束' : item.endReason === 'dispose' ? '插件卸载时已结束' : '窗口已关闭') : '正在播放'} · {new Date(item.startedAt).toLocaleTimeString()}</span>
          {!item.exited && item.tracked && <button type="button" className="mv-button mv-button-secondary" onClick={() => { void stopConsole(api, item.consoleId).catch(error => setProblemText(errorText(error, '无法结束独立窗口。'))).then(refreshConsoles) }}>结束</button>}
        </div>)}
      </div>}
      {session && <TerminalScreen key={session.sessionId} api={api} session={session} onEnded={onEnded} fontSize={fontSize} />}
      {ended && <p className="mv-caption">{endDescription(ended)}</p>}
    </div>
  )
}
