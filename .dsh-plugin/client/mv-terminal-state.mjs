/**
 * Framework-free logic of the "MV 终端" tab: form validation, the confirmation
 * card and the client end of the long-poll transport.
 */
import { remoteErrorText, unwrapRemote } from './remote-state.mjs'
import {
  MV_TERMINAL_LIMITS,
  MV_TERMINAL_SCRIPT,
  PYTHON_BASENAME,
  RUST_BASENAME,
  displayCommand,
  isAbsolutePathText,
  isMvSessionId,
  mvTerminalArgs,
  rustTerminalArgs,
} from '../shared/mv-terminal-protocol.mjs'

const text = value => typeof value === 'string' ? value.trim() : ''
const FORM_KEY = 'dsh-mv.terminal.form.v1'

export const EMPTY_FORM = Object.freeze({ player: 'python', exePath: '', offset: '', autoplay: false, pythonPath: '', packageDir: '', audioFile: '', noAudio: false, start: '', audioLatency: '' })

export function loadForm(storage = globalThis.localStorage) {
  try { return { ...EMPTY_FORM, ...JSON.parse(storage?.getItem(FORM_KEY) ?? '{}') } } catch { return { ...EMPTY_FORM } }
}
export function saveForm(form, storage = globalThis.localStorage) {
  try { storage?.setItem(FORM_KEY, JSON.stringify(form)) } catch { /* private mode */ }
}

const basename = value => text(value).split(/[\\/]/).pop()
const sepOf = value => /\\/.test(value) || /^[a-z]:/i.test(value) ? '\\' : '/'

/** Suggest `<dir>\python\python.exe` for a world_execute_me folder. */
export function suggestedPython(packageDir) {
  const dir = text(packageDir).replace(/[\\/]+$/, '')
  if (!dir) return ''
  const sep = sepOf(dir)
  return `${dir}${sep}python${sep}python${sep === '\\' ? '.exe' : ''}`
}

/** Form → launch request (what the Host validates again). */
export function launchFromForm(form) {
  if (form.player === 'rust') {
    const launch = { player: 'rust', exePath: text(form.exePath), autoplay: Boolean(form.autoplay) }
    if (text(form.audioFile)) launch.audioFile = text(form.audioFile)
    if (text(String(form.start ?? ''))) launch.start = Number(form.start)
    if (text(String(form.offset ?? ''))) launch.offset = Number(form.offset)
    return launch
  }
  const launch = { player: 'python', pythonPath: text(form.pythonPath), packageDir: text(form.packageDir).replace(/(?<=.)[\\/]+$/, ''), noAudio: Boolean(form.noAudio) }
  if (!launch.noAudio && text(form.audioFile)) launch.audioFile = text(form.audioFile)
  if (text(String(form.start ?? ''))) launch.start = Number(form.start)
  if (text(String(form.audioLatency ?? ''))) launch.audioLatency = Number(form.audioLatency)
  return launch
}

/** First problem that keeps "检查" / "启动" disabled, '' when fine. */
export function formProblem(form) {
  const launch = launchFromForm(form)
  if (launch.player === 'rust') {
    if (!launch.exePath) return '请填写 world-execute-me-rust.exe 的路径（从该项目的 GitHub Release 自行下载）。'
    if (!isAbsolutePathText(launch.exePath)) return '可执行文件路径必须是绝对路径。'
    if (!RUST_BASENAME.test(basename(launch.exePath))) return '可执行文件名应为 world-execute-me-rust.exe（防止误启动其他程序）。'
    if (launch.audioFile && !isAbsolutePathText(launch.audioFile)) return '音频文件必须是绝对路径。'
    if ('start' in launch && !(Number.isFinite(launch.start) && launch.start >= 0 && launch.start <= MV_TERMINAL_LIMITS.maxStartSeconds)) return `起始秒数应在 0–${MV_TERMINAL_LIMITS.maxStartSeconds} 之间。`
    if ('offset' in launch && !(Number.isFinite(launch.offset) && Math.abs(launch.offset) <= MV_TERMINAL_LIMITS.maxOffsetSeconds)) return `字幕偏移应在 ±${MV_TERMINAL_LIMITS.maxOffsetSeconds} 秒之内。`
    return ''
  }
  if (!launch.pythonPath) return '请填写 Python 解释器路径（例如 world_execute_me\\python\\python.exe）。'
  if (!isAbsolutePathText(launch.pythonPath)) return 'Python 路径必须是绝对路径。'
  if (!PYTHON_BASENAME.test(basename(launch.pythonPath))) return 'Python 路径必须指向 python.exe / python3 这样的解释器。'
  if (!launch.packageDir) return '请填写播放器目录（含 _tools\\tui_live.py 的文件夹）。'
  if (!isAbsolutePathText(launch.packageDir)) return '播放器目录必须是绝对路径。'
  if (launch.audioFile && !isAbsolutePathText(launch.audioFile)) return '音频文件必须是绝对路径。'
  if ('start' in launch && !(Number.isFinite(launch.start) && launch.start >= 0 && launch.start <= MV_TERMINAL_LIMITS.maxStartSeconds)) return `起始秒数应在 0–${MV_TERMINAL_LIMITS.maxStartSeconds} 之间。`
  if ('audioLatency' in launch && !(Number.isFinite(launch.audioLatency) && launch.audioLatency >= 0 && launch.audioLatency <= MV_TERMINAL_LIMITS.maxLatencySeconds)) return `音频延迟应在 0–${MV_TERMINAL_LIMITS.maxLatencySeconds} 秒之间。`
  return ''
}

/** Preview of the exact command (the Host builds the real one the same way). */
export function commandPreview(form) {
  const launch = launchFromForm(form)
  if (launch.player === 'rust') return displayCommand(launch.exePath, rustTerminalArgs(launch))
  const sep = sepOf(launch.packageDir || launch.pythonPath)
  const script = [launch.packageDir, ...MV_TERMINAL_SCRIPT].join(sep)
  return displayCommand(launch.pythonPath, mvTerminalArgs(launch, script))
}

export function confirmationDetails(form, checked) {
  return {
    title: '启动 MV 终端？',
    command: checked?.display ?? commandPreview(form),
    cwd: checked?.cwd ?? (form.player === 'rust' ? text(form.exePath).replace(/[\\/][^\\/]*$/, '') : launchFromForm(form).packageDir),
    points: [
      form.player === 'rust'
        ? '将在伪终端里运行你自己下载的 Rust 版可执行文件（不经过 Harness 沙箱，第三方未签名程序，请确认来源）。它只能解码 MP3；不填音频时播放其内嵌的音乐。'
        : '将在伪终端里运行你本机的 Python 和播放器脚本（不经过 Harness 沙箱），和你自己在终端里运行它一样。',
      '只能启动固定的播放器；面板不能传任意命令或参数。',
      '画面是终端输出经 Host 长轮询转发到这里的，比原生终端多约 30–150 ms 延迟；对口型请用 --audio-latency 或画布 MV 模式。',
      '关闭面板、结束会话或约 2 分钟无人查看时，进程会被结束。',
    ],
  }
}

export function endDescription({ endReason, exitCode } = {}) {
  const code = exitCode === null || exitCode === undefined ? '' : `，退出码 ${exitCode}`
  switch (endReason) {
    case 'stopped': return `已由你结束${code}。`
    case 'orphan': return '长时间没有面板读取输出，已自动结束。'
    case 'lifetime': return '会话达到最长时长，已自动结束。'
    case 'dispose': return '插件已卸载或重新加载，会话已结束。'
    case 'lost': return '与后台的连接中断。'
    default: return `播放器已退出${code}。`
  }
}

export async function loadInfo(api) {
  const info = unwrapRemote(await api.info(), '无法读取 MV 插件状态。')
  if (!info || typeof info !== 'object') throw new Error('MV 插件状态格式无效。')
  return info
}

export async function checkLaunch(api, form) {
  return unwrapRemote(await api.terminalCheck(launchFromForm(form)), '路径检查失败。')
}

export async function startSession(api, form, { cols = 120, rows = 40 } = {}) {
  const L = MV_TERMINAL_LIMITS
  const request = {
    ...launchFromForm(form), confirmed: true,
    cols: Math.min(L.maxCols, Math.max(L.minCols, Math.round(cols))),
    rows: Math.min(L.maxRows, Math.max(L.minRows, Math.round(rows))),
  }
  const session = unwrapRemote(await api.terminalStart(request), 'MV 终端启动失败。')
  if (!isMvSessionId(session?.sessionId)) throw new Error('启动结果缺少有效的会话 ID。')
  return session
}

/** One long-poll read loop, ordered coalesced writes and debounced resizes. */
export class TerminalConnection {
  constructor({ api, sessionId, onData, onExit, onError, waitMs = 800, retryMs = 1_000, resizeDelayMs = 120, setTimer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { api, sessionId, onData, onExit, onError, waitMs, retryMs, resizeDelayMs })
    // Browser timers throw "Illegal invocation" when called as a method of another object.
    this.setTimer = (callback, ms) => setTimer(callback, ms)
    this.clearTimer = id => clearTimer(id)
    this.cursor = 0
    this.closed = false
    this.pendingInput = ''
    this.writing = null
    this.resizeTimer = null
    this.failures = 0
  }

  start() {
    if (!isMvSessionId(this.sessionId)) {
      this.closed = true
      this.onError?.(new Error('会话 ID 无效。'))
      this.onExit?.({ endReason: 'lost', exitCode: null })
      this.loop = Promise.resolve()
      return this.loop
    }
    this.loop = this.readLoop()
    return this.loop
  }

  async readLoop() {
    while (!this.closed) {
      let output
      try {
        output = unwrapRemote(await this.api.terminalRead({ sessionId: this.sessionId, cursor: this.cursor, waitMs: this.waitMs }), '读取终端输出失败。')
        this.failures = 0
      } catch (error) {
        if (this.closed) return
        this.failures += 1
        this.onError?.(error)
        if (this.failures >= 5) { this.closed = true; this.onExit?.({ endReason: 'lost', exitCode: null }); return }
        await new Promise(resolve => this.setTimer(resolve, this.retryMs))
        continue
      }
      if (this.closed) return
      if (output.dropped) this.onData?.('\r\n[部分较早的输出已丢弃]\r\n')
      if (output.data) this.onData?.(output.data)
      this.cursor = output.cursor
      if (output.exited) { this.closed = true; this.onExit?.({ endReason: output.endReason, exitCode: output.exitCode }); return }
    }
  }

  send(data) {
    if (this.closed || !data) return
    this.pendingInput += data
    if (!this.writing) this.writing = this.flush()
  }

  async flush() {
    try {
      while (this.pendingInput && !this.closed) {
        const chunk = this.pendingInput.slice(0, MV_TERMINAL_LIMITS.writeChars)
        this.pendingInput = this.pendingInput.slice(chunk.length)
        try { unwrapRemote(await this.api.terminalWrite({ sessionId: this.sessionId, data: chunk }), '发送按键失败。') }
        catch (error) { this.onError?.(error) }
      }
    } finally {
      this.writing = null
    }
  }

  resize(cols, rows) {
    if (this.closed || !Number.isFinite(cols) || !Number.isFinite(rows)) return
    const L = MV_TERMINAL_LIMITS
    cols = Math.min(L.maxCols, Math.max(L.minCols, Math.round(cols)))
    rows = Math.min(L.maxRows, Math.max(L.minRows, Math.round(rows)))
    if (this.resizeTimer) this.clearTimer(this.resizeTimer)
    this.resizeTimer = this.setTimer(() => {
      this.resizeTimer = null
      void Promise.resolve(this.api.terminalResize({ sessionId: this.sessionId, cols, rows })).catch(() => {})
    }, this.resizeDelayMs)
  }

  async stop() {
    const wasOpen = !this.closed
    this.closed = true
    if (this.resizeTimer) this.clearTimer(this.resizeTimer)
    if (wasOpen) {
      try { await this.api.terminalStop({ sessionId: this.sessionId }) } catch { /* orphan timeout still ends it */ }
    }
  }
}

export const errorText = (error, fallback) => remoteErrorText(text(error?.message), fallback)
