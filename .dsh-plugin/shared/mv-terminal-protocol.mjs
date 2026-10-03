/**
 * Request contract for the "MV 终端" (embedded TUI player). Pure data and
 * validation, shared by the Host session manager, the Typert descriptors and
 * the Desktop client.
 *
 * The client never sends a command line. It sends a fixed-shape launch
 * description — python.exe, the player's package directory, an optional audio
 * file and a few numeric options — and the Host builds exactly
 *   <python> <packageDir>/_tools/tui_live.py [--audio-file <audio> | --no-audio] [--start N] [--audio-latency S]
 * after checking every path on disk.
 *
 * Optional second player: a user-supplied build of the Rust rewrite
 * (github.com/bilixxb/world-execute-me-ascii-rust; not bundled), launched as
 *   <exe> [--audio <file>] [--start N] [--offset S] [--autoplay]
 * with the executable's folder as working directory.
 */

export const MV_TERMINAL_SCRIPT = ['_tools', 'tui_live.py']
export const MV_TERMINAL_LABEL = 'MV 终端'

export const MV_TERMINAL_LIMITS = Object.freeze({
  maxSessions: 2,
  /** A session nobody reads (panel closed, client gone) is killed after this. */
  orphanTimeoutMs: 120_000,
  /** Hard lifetime of one session (the song is 3.5 minutes). */
  maxLifetimeMs: 2 * 60 * 60_000,
  /** Output kept per session for the client to catch up. */
  bufferChars: 2_000_000,
  /** Largest output slice returned by one read. */
  readChars: 512_000,
  /** Longest long-poll wait for new output. */
  maxWaitMs: 1_000,
  /** Largest single input write. */
  writeChars: 4_096,
  minCols: 20, maxCols: 400, minRows: 8, maxRows: 200,
  maxPathChars: 1_024,
  maxStartSeconds: 3_600,
  maxLatencySeconds: 5,
  maxOffsetSeconds: 30,
})

export const MV_PLAYERS = Object.freeze(['python', 'rust'])
/** Rust release binary name, optionally with a version / target suffix. */
export const RUST_BASENAME = /^world-execute-me(?:-rust)?(?:[-_.][\w.-]{0,60})?(?:\.exe)?$/i
export const MV_PLAYER_LABELS = Object.freeze({ python: 'world_execute_me（tui_live.py）', rust: 'world-execute-me-ascii-rust（用户自备可执行文件）' })

/** python, python3, python3.13, pythonw, py — with or without .exe. */
export const PYTHON_BASENAME = /^(?:python(?:3(?:\.\d{1,2})?)?w?|py)(?:\.exe)?$/i

const SESSION_ID = /^mvterm-[a-z0-9]{6,40}$/
export const isMvSessionId = value => typeof value === 'string' && SESSION_ID.test(value)

const CONSOLE_ID = /^mvcon-[a-z0-9]{6,40}$/
export const isMvConsoleId = value => typeof value === 'string' && CONSOLE_ID.test(value)
/** At most this many separate console windows at once. */
export const MV_CONSOLE_LIMIT = 2

function plainObject(value, subject) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${subject} must be an object`)
  return value
}

function sessionIdOf(value) {
  if (typeof value !== 'string' || !SESSION_ID.test(value)) throw new TypeError('sessionId is invalid')
  return value
}

function boundedInteger(value, min, max, subject) {
  if (!Number.isInteger(value) || value < min || value > max) throw new TypeError(`${subject} must be an integer from ${min} to ${max}`)
  return value
}

function boundedNumber(value, min, max, subject) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new TypeError(`${subject} must be a number from ${min} to ${max}`)
  return value
}

/** Absolute path on Windows (drive or UNC) or POSIX. */
export function isAbsolutePathText(value) {
  if (typeof value !== 'string') return false
  const path = value.trim()
  if (!path || path.length > MV_TERMINAL_LIMITS.maxPathChars || /[\0\r\n"]/.test(path)) return false
  return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || /^\\\\[^\\]+\\[^\\]+/.test(path)
}

function absolutePath(value, subject) {
  if (!isAbsolutePathText(value)) throw new TypeError(`${subject} 必须是绝对路径`)
  return value.trim()
}

function basenameOf(path) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? ''
}

/** The launch description; every field is validated, nothing else is accepted. */
function parseRustLaunch(request) {
  const allowed = new Set(['player', 'exePath', 'audioFile', 'start', 'offset', 'autoplay'])
  const extra = Object.keys(request).filter(key => !allowed.has(key))
  if (extra.length) throw new TypeError(`launch has unexpected fields: ${extra.join(', ')}`)
  const exePath = absolutePath(request.exePath, '可执行文件路径')
  if (!RUST_BASENAME.test(basenameOf(exePath))) throw new TypeError('可执行文件必须是 world-execute-me-rust(.exe) 这样的发布文件名')
  let audioFile
  if (request.audioFile !== undefined && request.audioFile !== null && request.audioFile !== '') audioFile = absolutePath(request.audioFile, '音频文件')
  const start = request.start === undefined || request.start === null ? 0 : boundedNumber(request.start, 0, MV_TERMINAL_LIMITS.maxStartSeconds, 'start')
  const offset = request.offset === undefined || request.offset === null ? undefined : boundedNumber(request.offset, -MV_TERMINAL_LIMITS.maxOffsetSeconds, MV_TERMINAL_LIMITS.maxOffsetSeconds, 'offset')
  if (request.autoplay !== undefined && typeof request.autoplay !== 'boolean') throw new TypeError('autoplay must be a boolean')
  return {
    player: 'rust', exePath, start, autoplay: request.autoplay === true,
    ...(audioFile ? { audioFile } : {}),
    ...(offset !== undefined ? { offset } : {}),
  }
}

export function parseMvLaunch(value) {
  const request = plainObject(value, 'launch')
  if (request.player !== undefined && !MV_PLAYERS.includes(request.player)) throw new TypeError('player must be python or rust')
  if (request.player === 'rust') return parseRustLaunch(request)
  const allowed = new Set(['player', 'pythonPath', 'packageDir', 'audioFile', 'noAudio', 'start', 'audioLatency'])
  const extra = Object.keys(request).filter(key => !allowed.has(key))
  if (extra.length) throw new TypeError(`launch has unexpected fields: ${extra.join(', ')}`)
  const pythonPath = absolutePath(request.pythonPath, 'Python 路径')
  if (!PYTHON_BASENAME.test(basenameOf(pythonPath))) throw new TypeError('Python 路径必须指向 python.exe / python3 / pythonw.exe 这样的解释器')
  const packageDir = absolutePath(request.packageDir, '播放器目录')
  const noAudio = request.noAudio === true
  if (request.noAudio !== undefined && typeof request.noAudio !== 'boolean') throw new TypeError('noAudio must be a boolean')
  let audioFile
  if (request.audioFile !== undefined && request.audioFile !== null && request.audioFile !== '') audioFile = absolutePath(request.audioFile, '音频文件')
  const start = request.start === undefined || request.start === null ? 0 : boundedNumber(request.start, 0, MV_TERMINAL_LIMITS.maxStartSeconds, 'start')
  const audioLatency = request.audioLatency === undefined || request.audioLatency === null ? undefined
    : boundedNumber(request.audioLatency, 0, MV_TERMINAL_LIMITS.maxLatencySeconds, 'audioLatency')
  return {
    player: 'python', pythonPath, packageDir, noAudio, start,
    ...(audioFile && !noAudio ? { audioFile } : {}),
    ...(audioLatency !== undefined ? { audioLatency } : {}),
  }
}

export function parseMvTerminalCheck(value) {
  return parseMvLaunch(value)
}

export function parseMvTerminalStart(value) {
  const request = plainObject(value, 'start request')
  const { cols, rows, confirmed, ...launch } = request
  const L = MV_TERMINAL_LIMITS
  return {
    launch: parseMvLaunch(launch),
    cols: boundedInteger(cols, L.minCols, L.maxCols, 'cols'),
    rows: boundedInteger(rows, L.minRows, L.maxRows, 'rows'),
    confirmed: confirmed === true,
  }
}

export function parseMvTerminalRead(value) {
  const request = plainObject(value, 'read request')
  return {
    sessionId: sessionIdOf(request.sessionId),
    cursor: request.cursor === undefined ? 0 : boundedInteger(request.cursor, 0, Number.MAX_SAFE_INTEGER, 'cursor'),
    waitMs: request.waitMs === undefined ? 0 : boundedInteger(request.waitMs, 0, MV_TERMINAL_LIMITS.maxWaitMs, 'waitMs'),
  }
}

export function parseMvTerminalWrite(value) {
  const request = plainObject(value, 'write request')
  if (typeof request.data !== 'string' || request.data.length === 0 || request.data.length > MV_TERMINAL_LIMITS.writeChars) {
    throw new TypeError(`data must be a string of 1 to ${MV_TERMINAL_LIMITS.writeChars} characters`)
  }
  return { sessionId: sessionIdOf(request.sessionId), data: request.data }
}

export function parseMvTerminalResize(value) {
  const request = plainObject(value, 'resize request')
  const L = MV_TERMINAL_LIMITS
  return {
    sessionId: sessionIdOf(request.sessionId),
    cols: boundedInteger(request.cols, L.minCols, L.maxCols, 'cols'),
    rows: boundedInteger(request.rows, L.minRows, L.maxRows, 'rows'),
  }
}

export function parseMvTerminalStop(value) {
  const request = plainObject(value, 'stop request')
  return { sessionId: sessionIdOf(request.sessionId) }
}

/** Arguments after the interpreter, in order. Paths are already validated. */
export function mvTerminalArgs(launch, scriptPath) {
  const args = [scriptPath]
  // No audio file and audio not disabled: the player's own lookup applies
  // (--audio-file, else $PV_AUDIO, else <packageDir>/input/song.mp3).
  if (launch.noAudio) args.push('--no-audio')
  else if (launch.audioFile) args.push('--audio-file', launch.audioFile)
  if (launch.start > 0) args.push('--start', String(launch.start))
  if (launch.audioLatency !== undefined) args.push('--audio-latency', String(launch.audioLatency))
  return args
}

/** Arguments of the Rust player. */
export function rustTerminalArgs(launch) {
  const args = []
  if (launch.audioFile) args.push('--audio', launch.audioFile)
  if (launch.start > 0) args.push('--start', String(launch.start))
  if (launch.offset !== undefined) args.push('--offset', String(launch.offset))
  if (launch.autoplay) args.push('--autoplay')
  return args
}

/** Human-readable command line, for the confirmation card. */
export function displayCommand(file, args) {
  const quote = text => /[\s"]/.test(text) ? `"${text}"` : text
  return [file, ...args].map(quote).join(' ')
}

/**
 * Start the fixed player in its own Windows console window. Same launch shape
 * as the embedded terminal; no size (the console owns its window).
 */
export function parseMvConsoleStart(value) {
  const request = plainObject(value, 'console start request')
  const { confirmed, ...launch } = request
  if (confirmed !== undefined && typeof confirmed !== 'boolean') throw new TypeError('confirmed must be a boolean')
  return { launch: parseMvLaunch(launch), confirmed: confirmed === true }
}

export function parseMvConsoleStop(value) {
  const request = plainObject(value, 'console stop request')
  const extra = Object.keys(request).filter(key => key !== 'consoleId')
  if (extra.length) throw new TypeError(`console stop request has unexpected fields: ${extra.join(', ')}`)
  if (!isMvConsoleId(request.consoleId)) throw new TypeError('consoleId is invalid')
  return { consoleId: request.consoleId }
}

export function parseMvConsoleInfo(value) {
  if (value === undefined || value === null) return {}
  const request = plainObject(value, 'console info request')
  if (Object.keys(request).length) throw new TypeError('console info request takes no fields')
  return {}
}

// ---- separate console window (Windows): the exact cmd.exe line ----------

export const CONSOLE_TITLE = 'world.execute(me)'

/** Characters cmd.exe would still interpret inside double quotes, or that cannot be quoted. */
const UNSAFE_FOR_CMD = /[%"\r\n\0]/
const SAFE_BARE_ARG = /^(?:--[a-z][a-z-]*|-?\d+(?:\.\d+)?)$/

/** cmd.exe-safe quoting of one token, or a thrown error. */
export function cmdQuote(text, subject = '参数') {
  const value = String(text)
  if (UNSAFE_FOR_CMD.test(value)) throw new Error(`${subject}含有独立窗口模式无法安全传递的字符（% 或换行）：${value}`)
  return `"${value}"`
}

/** Strip trailing separators so `"F:\dir\"` never reaches a parser; keep drive roots valid. */
export function consoleCwd(dir) {
  const trimmed = String(dir).replace(/[\\/]+$/, '')
  return /^[A-Za-z]:$/.test(trimmed) ? `${trimmed}\\.` : trimmed
}

/**
 * The inner `start` command line. Flags and numbers stay bare (validated by
 * the protocol); everything else is quoted.
 */
export function startCommandLine(resolved) {
  const args = resolved.args.map(arg => SAFE_BARE_ARG.test(arg) ? arg : cmdQuote(arg, '路径'))
  return ['start', `"${CONSOLE_TITLE}"`, '/D', cmdQuote(consoleCwd(resolved.cwd), '工作目录'), cmdQuote(resolved.file, '程序路径'), ...args].join(' ')
}

/** What the confirmation card shows: the full cmd.exe invocation. */
export function consoleCommandDisplay(resolved, cmdPath = 'cmd.exe') {
  return `${cmdPath} ${cmdArgv(resolved).join(' ')}`
}

/** argv for cmd.exe; passed with windowsVerbatimArguments so Node adds no quoting. */
export function cmdArgv(resolved) {
  return ['/d', '/v:off', '/s', '/c', `"${startCommandLine(resolved)}"`]
}

