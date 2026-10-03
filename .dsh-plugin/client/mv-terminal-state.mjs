/**
 * Framework-free logic of the "MV 终端" tab: form validation, the confirmation
 * card and the client end of the long-poll transport.
 */
import { remoteErrorText, unwrapRemote } from './remote-state.mjs'
import {
  MV_TERMINAL_LIMITS,
  MV_TERMINAL_SCRIPT,
  PYTHON_BASENAME,
  displayCommand,
  isAbsolutePathText,
  isMvConsoleId,
  isMvSessionId,
  mvTerminalArgs,
  consoleCommandDisplay,
} from '../shared/mv-terminal-protocol.mjs'
import { MV_PACK_LIMITS, cmdSafetyProblems } from '../shared/mv-pack.mjs'

const text = value => typeof value === 'string' ? value.trim() : ''

/** The file tui_live.py will try to play for this form ('' when none). */
export function effectiveAudioOf(form) {
  if (form.player === 'pack' || form.noAudio) return ''
  const explicit = text(form.audioFile)
  if (explicit) return explicit
  const dir = text(form.packageDir).replace(/[\\/]+$/, '')
  if (!dir) return ''
  const sep = dir.includes('/') && !dir.includes('\\') ? '/' : '\\'
  return `${dir}${sep}input${sep}song.mp3`
}
const FORM_KEY = 'dsh-mv.terminal.form.v1'

export const EMPTY_FORM = Object.freeze({ packStart: '', packOffset: '', player: 'python', pythonPath: '', packageDir: '', audioFile: '', noAudio: false, start: '', audioLatency: '' })

/** Saved form; fields of removed players (0.3.x Rust option) are dropped. */
export function loadForm(storage = globalThis.localStorage) {
  let saved = {}
  try { saved = JSON.parse(storage?.getItem(FORM_KEY) ?? '{}') ?? {} } catch { saved = {} }
  const form = { ...EMPTY_FORM }
  for (const key of Object.keys(EMPTY_FORM)) if (key in saved) form[key] = saved[key]
  if (form.player !== 'python' && form.player !== 'pack') form.player = 'python'
  return form
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

/**
 * Form → launch request (what the Host validates again). `ctx.pack` is the
 * active MV pack; `ctx.audioOverride` = { source, path } replaces the audio
 * the player would open (source) with its cached WAV (path).
 */
export function launchFromForm(form, ctx = {}) {
  if (form.player === 'pack') {
    const launch = { player: 'pack', manifestPath: text(ctx.pack?.manifestPath) }
    if (text(String(form.packStart ?? ''))) launch.start = Number(form.packStart)
    if (text(String(form.packOffset ?? ''))) launch.offset = Number(form.packOffset)
    return launch
  }
  const launch = { player: 'python', pythonPath: text(form.pythonPath), packageDir: text(form.packageDir).replace(/(?<=.)[\\/]+$/, ''), noAudio: Boolean(form.noAudio) }
  if (!launch.noAudio && text(form.audioFile)) launch.audioFile = text(form.audioFile)
  const override = ctx.audioOverride
  if (!launch.noAudio && override?.path && override.source === effectiveAudioOf(form)) launch.audioFile = override.path
  if (text(String(form.start ?? ''))) launch.start = Number(form.start)
  if (text(String(form.audioLatency ?? ''))) launch.audioLatency = Number(form.audioLatency)
  return launch
}

/** First problem that keeps "检查" / "启动" disabled, '' when fine. */
export function formProblem(form, ctx = {}) {
  const launch = launchFromForm(form, ctx)
  if (launch.player === 'pack') {
    if (!ctx.pack?.terminal) return '当前 MV 包没有配置外部渲染程序（mv.json 里的 terminal）。请先导入带 terminal 的 MV 包，或选择其他播放器。'
    if ('start' in launch && !(Number.isFinite(launch.start) && launch.start >= 0 && launch.start <= MV_PACK_LIMITS.maxStart)) return `起始秒数应在 0–${MV_PACK_LIMITS.maxStart} 之间。`
    if ('offset' in launch && !(Number.isFinite(launch.offset) && Math.abs(launch.offset) <= MV_PACK_LIMITS.maxOffset)) return `偏移应在 ±${MV_PACK_LIMITS.maxOffset} 秒之内。`
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
export function commandPreview(form, ctx = {}) {
  if (form.player === 'pack') return ctx.checked?.display ?? '（点「检查」后显示 Host 从 mv.json 解析出的完整命令）'
  const launch = launchFromForm(form, ctx)
  const sep = sepOf(launch.packageDir || launch.pythonPath)
  const script = [launch.packageDir, ...MV_TERMINAL_SCRIPT].join(sep)
  return displayCommand(launch.pythonPath, mvTerminalArgs(launch, script))
}

export function confirmationDetails(form, checked, ctx = {}) {
  if (form.player === 'pack') {
    return {
      title: `启动 MV 包「${ctx.pack?.pack?.title ?? ''}」的外部渲染程序？`,
      command: checked?.display ?? '（尚未检查）',
      cwd: checked?.cwd ?? '',
      argv: checked?.args ?? [],
      points: [
        '这个程序和参数来自你导入的 mv.json。它是任意程序，会以你的权限运行，不经过 Harness 沙箱。只启动你信任的 MV 包。',
        `清单：${ctx.pack?.manifestPath ?? ''}`,
        '上面就是 Host 将执行的完整命令（每个参数单独传递，不经过 shell）。如果确认后 mv.json 被改动，Host 会拒绝启动。',
        '关闭面板、结束会话或约 2 分钟无人查看时，进程会被结束。',
      ],
    }
  }
  return {
    title: '启动 MV 终端？',
    command: checked?.display ?? commandPreview(form),
    cwd: checked?.cwd ?? launchFromForm(form, ctx).packageDir,
    points: [
      '将在伪终端里运行你本机的 Python 和播放器脚本（不经过 Harness 沙箱），和你自己在终端里运行它一样。',
      ...(ctx.audioOverride?.path ? [`音频已自动转换为 WAV 缓存（原文件 ${ctx.audioOverride.source} 不变）。`] : []),
      '只能启动固定的播放器；面板不能传任意命令或参数。',
      '画面是终端输出经 Host 长轮询转发到这里的，比原生终端多约 30–150 ms 延迟；对口型请用 --audio-latency 或画布 MV 模式。',
      '关闭面板、结束会话或约 2 分钟无人查看时，进程会被结束。',
    ],
  }
}

/** The {file, args, cwd} the Host will resolve for this form (paths unverified). */
export function plannedLaunch(form, ctx = {}) {
  if (form.player === 'pack') {
    if (!ctx.checked) throw new Error('请先点「检查」，由 Host 解析 MV 包的命令。')
    return { file: ctx.checked.file, args: ctx.checked.args, cwd: ctx.checked.cwd }
  }
  const launch = launchFromForm(form, ctx)
  const sep = sepOf(launch.packageDir || launch.pythonPath)
  return { file: launch.pythonPath, args: mvTerminalArgs(launch, [launch.packageDir, ...MV_TERMINAL_SCRIPT].join(sep)), cwd: launch.packageDir }
}

/** Exact cmd.exe line the Host runs for a separate window. */
export function consoleCommandPreview(form, ctx = {}) {
  try { return consoleCommandDisplay(plannedLaunch(form, ctx)) } catch (error) { return error.message }
}

/** Paths cmd.exe cannot carry safely (it expands %VAR% even inside quotes). */
export function consoleProblem(form, ctx = {}) {
  const { platform, pack, checked } = ctx
  if (platform && platform !== 'win32') return '独立控制台窗口只在 Windows 上可用；当前系统请用面板内的 MV 终端。'
  if (form.player === 'pack') {
    const problem = formProblem(form, { pack })
    if (problem || !checked) return problem
    const unsafe = cmdSafetyProblems(checked.file, checked.args ?? [], checked.cwd)
    return unsafe.length ? unsafe.join('\n') : ''
  }
  const launch = launchFromForm(form, { audioOverride: ctx.audioOverride })
  for (const value of [launch.pythonPath, launch.packageDir, launch.audioFile]) {
    if (typeof value === 'string' && /%/.test(value)) return `路径里含有 %，独立窗口模式无法安全传递：${value}`
  }
  return formProblem(form)
}

export function consoleConfirmationDetails(form, ctx = {}) {
  const pack = form.player === 'pack'
  return {
    title: pack ? `在独立的 Windows 控制台窗口中运行 MV 包「${ctx.pack?.pack?.title ?? ''}」的渲染程序？` : '在独立的 Windows 控制台窗口中播放？',
    command: consoleCommandPreview(form, ctx),
    player: commandPreview(form, ctx),
    points: pack ? [
      '这个程序和参数来自你导入的 mv.json。它是任意程序，会以你的权限运行，不经过 Harness 沙箱。只启动你信任的 MV 包。',
      '将用 cmd.exe 的 start 打开一个新的控制台窗口。所有路径和参数都加引号；含 % ! " ^ & | < > 或换行的值一律拒绝。',
      '如果确认后 mv.json 被改动，Host 会拒绝启动。面板里的「结束」会用 taskkill /T 结束它。',
    ] : [
      '将用 cmd.exe 的 start 打开一个新的控制台窗口（若系统默认终端是 Windows Terminal，会在其中打开），在里面运行上面这一个固定的播放器；不经过 Harness 沙箱。',
      '所有路径都加引号传递；不能附加任何其他命令或参数。',
      '画面直接由真实控制台显示，没有面板转发的延迟；按键请在那个窗口里按。',
      '面板里的「结束」会用 taskkill /T 结束播放器进程树；插件卸载或 Harness 退出时也会结束这些窗口。',
    ],
  }
}

export async function loadConsoles(api) {
  return unwrapRemote(await api.consoleInfo({}), '无法读取独立窗口状态。')
}

export async function startConsole(api, form, ctx = {}) {
  const started = unwrapRemote(await api.consoleStart({ ...launchFromForm(form, ctx), ...expectation(form, ctx), confirmed: true }), '无法打开独立窗口。')
  if (!isMvConsoleId(started?.consoleId)) throw new Error('启动结果缺少有效的窗口 ID。')
  return started
}

export async function stopConsole(api, consoleId) {
  return unwrapRemote(await api.consoleStop({ consoleId }), '无法结束独立窗口。')
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

export async function checkLaunch(api, form, ctx = {}) {
  return unwrapRemote(await api.terminalCheck(launchFromForm(form, ctx)), '路径检查失败。')
}

/** Pack launches carry the confirmed command; the Host refuses if it changed. */
function expectation(form, ctx) {
  if (form.player !== 'pack') return {}
  if (typeof ctx.checked?.display !== 'string') throw new Error('请先检查并确认 MV 包的命令。')
  return { expectDisplay: ctx.checked.display }
}

export async function startSession(api, form, { cols = 120, rows = 40 } = {}, ctx = {}) {
  const L = MV_TERMINAL_LIMITS
  const request = {
    ...launchFromForm(form, ctx), ...expectation(form, ctx), confirmed: true,
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
