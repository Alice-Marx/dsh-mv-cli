/**
 * "MV 包" (MV pack): a folder with an `mv.json` manifest describing one song —
 * metadata, the user's own audio / lyrics / spectrum files (paths relative to
 * the manifest folder) and how to render it: a built-in canvas renderer, or an
 * external TUI program launched with an argument template.
 *
 * Pure data and validation, shared by the Host (which reads packs from disk
 * and builds launches), the Desktop client and the tests. Nothing here touches
 * the file system.
 *
 * Format (version 1), see README "MV 包格式" and mv.schema.json:
 * {
 *   "$schema": "./mv.schema.json",
 *   "format": "dsh-mv-pack", "version": 1,
 *   "title": "…", "artist": "…", "album": "…", "credits": ["…"], "notice": "…",
 *   "duration": 211.9,
 *   "audio":    { "file": "song.mp3", "offset": 0 },
 *   "lyrics":   { "file": "lyrics.lrc", "offset": 0 },
 *   "spectrum": { "file": "spectrum.json" },
 *   "canvas":   { "renderer": "generic" | "world-execute-me", "fontSize": 14 },
 *   "terminal": { "label": "…", "program": "python/python.exe", "script": "player.py",
 *                 "args": ["{script}", { "when": "audio", "args": ["--audio", "{audio}"] }, "--start", "{start}"],
 *                 "cwd": "pack" | "program" | "script" }
 * }
 */

export const MV_PACK_FORMAT = 'dsh-mv-pack'
export const MV_PACK_VERSION = 1
export const MV_PACK_MANIFEST = 'mv.json'
export const MV_PACK_SCHEMA_FILE = 'mv.schema.json'
export const MV_CANVAS_RENDERERS = Object.freeze(['generic', 'world-execute-me'])
export const MV_PACK_CWD = Object.freeze(['pack', 'program', 'script'])
/** Placeholders usable inside terminal.args strings. */
export const MV_PACK_PLACEHOLDERS = Object.freeze(['audio', 'lyrics', 'spectrum', 'script', 'packDir', 'start', 'offset'])
/** Conditions of `{ "when": …, "args": […] }` groups. */
export const MV_PACK_CONDITIONS = Object.freeze(['audio', 'lyrics', 'spectrum', 'start', 'offset'])
/** Pack files the panel may read (only through the pack's own manifest). */
export const MV_PACK_FILE_ROLES = Object.freeze(['audio', 'lyrics', 'spectrum'])
export const MV_LYRICS_EXTENSIONS = Object.freeze(['.lrc', '.srt', '.vtt', '.json', '.txt'])

export const MV_PACK_LIMITS = Object.freeze({
  manifestBytes: 256 * 1024,
  textFileBytes: 8 * 1024 * 1024,
  audioBytes: 512 * 1024 * 1024,
  readChunkBytes: 512 * 1024,
  maxArgs: 64,
  maxArgChars: 2_048,
  maxCredits: 50,
  maxTextChars: 4_000,
  maxShortChars: 200,
  maxPathChars: 1_024,
  maxDuration: 36_000,
  maxOffset: 30,
  maxStart: 36_000,
  recentPacks: 8,
})

/**
 * Programs the Host refuses as `terminal.program`: script hosts and shell
 * files would be run through an interpreter that parses the arguments again
 * (cmd.exe for .bat/.cmd). Use the interpreter as `program` and the file as
 * `script` instead (e.g. python.exe + player.py).
 */
export const REFUSED_PROGRAM_EXTENSIONS = Object.freeze(['.bat', '.cmd', '.ps1', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.msc', '.lnk', '.url', '.scr', '.hta', '.reg', '.sh'])

const TOP_KEYS = new Set(['$schema', 'format', 'version', 'title', 'artist', 'album', 'credits', 'notice', 'duration', 'audio', 'lyrics', 'spectrum', 'canvas', 'terminal'])

export class MvPackError extends Error {
  constructor(problems) {
    const list = Array.isArray(problems) ? problems : [String(problems)]
    super(list.join('\n'))
    this.name = 'MvPackError'
    this.problems = list
  }
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const extOf = path => { const name = basenameOf(path); const at = name.lastIndexOf('.'); return at > 0 ? name.slice(at).toLowerCase() : '' }
export const basenameOf = path => String(path).split(/[\\/]/).filter(Boolean).pop() ?? ''

/** Absolute path on Windows (drive or UNC) or POSIX. */
export function isAbsolutePackPath(value) {
  return typeof value === 'string' && (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]+\\[^\\]+/.test(value))
}

/**
 * A file reference inside the manifest: relative to the manifest folder (no
 * `..` segment, so a pack stays self-contained) or absolute.
 */
export function checkPackPath(value, subject, problems) {
  if (typeof value !== 'string' || !value.trim()) { problems.push(`${subject} 必须是非空字符串`); return undefined }
  const path = value.trim()
  if (path.length > MV_PACK_LIMITS.maxPathChars) { problems.push(`${subject} 过长`); return undefined }
  if (/[\0\r\n"<>|?*]/.test(path) || /[\u0000-\u001f]/.test(path)) { problems.push(`${subject} 含有路径中不允许的字符：${path}`); return undefined }
  if (isAbsolutePackPath(path)) return path
  if (/^[A-Za-z]:/.test(path) || path.startsWith('\\')) { problems.push(`${subject} 不是有效的相对或绝对路径：${path}`); return undefined }
  const parts = path.split(/[\\/]+/).filter(part => part && part !== '.')
  if (parts.includes('..')) { problems.push(`${subject} 的相对路径不能含 ..（请改用绝对路径）：${path}`); return undefined }
  if (!parts.length) { problems.push(`${subject} 不是文件路径：${path}`); return undefined }
  return parts.join('/')
}

function optionalText(source, key, max, problems, subject = key) {
  const value = source[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') { problems.push(`${subject} 必须是字符串`); return undefined }
  if (value.length > max) { problems.push(`${subject} 超过 ${max} 个字符`); return undefined }
  return value.trim() || undefined
}

function optionalNumber(source, key, min, max, problems, subject = key) {
  const value = source[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) { problems.push(`${subject} 必须是 ${min} 到 ${max} 之间的数字`); return undefined }
  return value
}

function unknownKeys(source, allowed, subject, problems) {
  for (const key of Object.keys(source)) if (!allowed.has(key) && !key.startsWith('x-')) problems.push(`${subject} 有未知字段 "${key}"（扩展字段请用 x- 前缀）`)
}

function mediaSection(source, key, problems, { offset = false } = {}) {
  const value = source[key]
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') return mediaSection({ [key]: { file: value } }, key, problems, { offset })
  if (!isObject(value)) { problems.push(`${key} 必须是 { "file": … } 对象或路径字符串`); return undefined }
  unknownKeys(value, new Set(offset ? ['file', 'offset'] : ['file']), key, problems)
  const file = checkPackPath(value.file, `${key}.file`, problems)
  const result = { file }
  if (offset) {
    const shift = optionalNumber(value, 'offset', -MV_PACK_LIMITS.maxOffset, MV_PACK_LIMITS.maxOffset, problems, `${key}.offset`)
    result.offset = shift ?? 0
  }
  return file === undefined ? undefined : result
}

/** Placeholder names used in one template string; throws on malformed braces. */
export function placeholdersOf(template) {
  const names = []
  const text = String(template)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') {
      if (text[i + 1] === '{') { i++; continue }
      const end = text.indexOf('}', i)
      if (end < 0) throw new Error(`参数模板缺少 }：${text}`)
      names.push(text.slice(i + 1, end))
      i = end
    } else if (ch === '}') {
      if (text[i + 1] === '}') { i++; continue }
      throw new Error(`参数模板有多余的 }（字面量请写 }}）：${text}`)
    }
  }
  return names
}

function templateString(value, subject, problems, available) {
  if (typeof value !== 'string') { problems.push(`${subject} 必须是字符串`); return undefined }
  if (value.length > MV_PACK_LIMITS.maxArgChars) { problems.push(`${subject} 过长`); return undefined }
  if (/[\0\r\n]/.test(value)) { problems.push(`${subject} 不能含换行或 NUL`); return undefined }
  let names
  try { names = placeholdersOf(value) } catch (error) { problems.push(`${subject}: ${error.message}`); return undefined }
  for (const name of names) {
    if (!MV_PACK_PLACEHOLDERS.includes(name)) problems.push(`${subject} 使用了未知占位符 {${name}}；可用：${MV_PACK_PLACEHOLDERS.map(n => `{${n}}`).join(' ')}`)
    else if (!available.has(name)) problems.push(`${subject} 使用了 {${name}}，但清单没有对应的 ${name === 'script' ? 'terminal.script' : name}；或把它放进 { "when": "${name}", "args": [...] } 里`)
  }
  return value
}

function terminalSection(value, problems, pack) {
  if (value === undefined || value === null) return undefined
  if (!isObject(value)) { problems.push('terminal 必须是对象'); return undefined }
  unknownKeys(value, new Set(['label', 'program', 'script', 'args', 'cwd']), 'terminal', problems)
  const program = checkPackPath(value.program, 'terminal.program', problems)
  if (program && REFUSED_PROGRAM_EXTENSIONS.includes(extOf(program))) {
    problems.push(`terminal.program 不能是 ${extOf(program)} 文件（会被再解析一遍参数）。请把解释器（如 python.exe）写成 program，脚本写成 script。`)
  }
  const script = value.script === undefined || value.script === null ? undefined : checkPackPath(value.script, 'terminal.script', problems)
  const cwd = value.cwd ?? 'pack'
  if (!MV_PACK_CWD.includes(cwd)) problems.push(`terminal.cwd 必须是 ${MV_PACK_CWD.join(' / ')}`)
  if (cwd === 'script' && value.script == null) problems.push('terminal.cwd 为 script 时必须提供 terminal.script')
  const always = new Set(['packDir', 'start', 'offset'])
  if (script) always.add('script')
  for (const key of ['audio', 'lyrics', 'spectrum']) if (pack[key] && pack[key].required !== false) always.add(key)
  const args = []
  if (!Array.isArray(value.args)) problems.push('terminal.args 必须是数组（每个元素是一个独立参数，不经过 shell）')
  else {
    let count = 0
    value.args.forEach((item, index) => {
      const subject = `terminal.args[${index}]`
      if (isObject(item)) {
        unknownKeys(item, new Set(['when', 'args']), subject, problems)
        if (!MV_PACK_CONDITIONS.includes(item.when)) { problems.push(`${subject}.when 必须是 ${MV_PACK_CONDITIONS.join(' / ')}`); return }
        if (!Array.isArray(item.args) || !item.args.length) { problems.push(`${subject}.args 必须是非空数组`); return }
        const available = new Set([...always, ...(['audio', 'lyrics', 'spectrum'].includes(item.when) ? [item.when] : [])])
        const group = item.args.map((arg, j) => templateString(arg, `${subject}.args[${j}]`, problems, available))
        count += group.length
        args.push({ when: item.when, args: group })
      } else {
        const arg = templateString(item, subject, problems, always)
        count += 1
        args.push(arg)
      }
    })
    if (count > MV_PACK_LIMITS.maxArgs) problems.push(`terminal.args 最多 ${MV_PACK_LIMITS.maxArgs} 个参数`)
  }
  const label = optionalText(value, 'label', MV_PACK_LIMITS.maxShortChars, problems, 'terminal.label')
  return { label, program, script, args, cwd }
}

/**
 * Validate a manifest (object or JSON text). Returns the normalised pack or
 * throws MvPackError listing every problem found.
 */
export function parseMvPack(input) {
  let data = input
  if (typeof input === 'string') {
    if (input.length > MV_PACK_LIMITS.manifestBytes) throw new MvPackError([`mv.json 超过 ${MV_PACK_LIMITS.manifestBytes / 1024} KB`])
    try { data = JSON.parse(input.replace(/^\uFEFF/, '')) } catch (error) { throw new MvPackError([`mv.json 不是有效的 JSON：${error.message}`]) }
  }
  if (!isObject(data)) throw new MvPackError(['mv.json 顶层必须是对象'])
  const problems = []
  unknownKeys(data, TOP_KEYS, 'mv.json', problems)
  if (data.format !== MV_PACK_FORMAT) problems.push(`format 必须是 "${MV_PACK_FORMAT}"`)
  if (data.version !== MV_PACK_VERSION) problems.push(`version 必须是 ${MV_PACK_VERSION}（本插件支持的清单版本）`)
  const title = optionalText(data, 'title', MV_PACK_LIMITS.maxShortChars, problems)
  if (!title) problems.push('title 必填')
  let credits = []
  if (data.credits !== undefined && data.credits !== null) {
    if (!Array.isArray(data.credits) || data.credits.length > MV_PACK_LIMITS.maxCredits || data.credits.some(item => typeof item !== 'string' || item.length > 500)) {
      problems.push(`credits 必须是最多 ${MV_PACK_LIMITS.maxCredits} 条、每条不超过 500 字的字符串数组`)
    } else credits = data.credits.map(item => item.trim()).filter(Boolean)
  }
  const pack = {
    format: MV_PACK_FORMAT,
    version: MV_PACK_VERSION,
    title: title ?? '',
    artist: optionalText(data, 'artist', MV_PACK_LIMITS.maxShortChars, problems),
    album: optionalText(data, 'album', MV_PACK_LIMITS.maxShortChars, problems),
    credits,
    notice: optionalText(data, 'notice', MV_PACK_LIMITS.maxTextChars, problems),
    duration: optionalNumber(data, 'duration', 1, MV_PACK_LIMITS.maxDuration, problems),
    audio: mediaSection(data, 'audio', problems, { offset: true }),
    lyrics: mediaSection(data, 'lyrics', problems, { offset: true }),
    spectrum: mediaSection(data, 'spectrum', problems),
  }
  if (pack.lyrics && !MV_LYRICS_EXTENSIONS.includes(extOf(pack.lyrics.file))) problems.push(`lyrics.file 应是 ${MV_LYRICS_EXTENSIONS.join(' / ')} 文件`)
  if (pack.spectrum && extOf(pack.spectrum.file) !== '.json') problems.push('spectrum.file 应是 .json 文件（{ fps, frames }）')
  const canvas = data.canvas ?? {}
  if (!isObject(canvas)) problems.push('canvas 必须是对象')
  else {
    unknownKeys(canvas, new Set(['renderer', 'fontSize']), 'canvas', problems)
    const renderer = canvas.renderer ?? 'generic'
    if (!MV_CANVAS_RENDERERS.includes(renderer)) problems.push(`canvas.renderer 必须是 ${MV_CANVAS_RENDERERS.join(' / ')}`)
    pack.canvas = { renderer, fontSize: optionalNumber(canvas, 'fontSize', 8, 32, problems, 'canvas.fontSize') }
  }
  pack.terminal = terminalSection(data.terminal, problems, pack)
  if (problems.length) throw new MvPackError(problems)
  return stripUndefined(pack)
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined)
  if (!isObject(value)) return value
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, stripUndefined(v)]))
}

/** Number text for argv: at most 3 decimals, no exponent, no "-0". */
export function numberArg(value) {
  const rounded = Math.round(Number(value) * 1000) / 1000
  if (!Number.isFinite(rounded)) throw new TypeError('number placeholder is not finite')
  return Object.is(rounded, -0) || rounded === 0 ? '0' : String(rounded)
}

/** Substitute placeholders in one template string ({{ and }} are literal braces). */
export function substitute(template, values) {
  let out = ''
  const text = String(template)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if ((ch === '{' || ch === '}') && text[i + 1] === ch) { out += ch; i++; continue }
    if (ch === '{') {
      const end = text.indexOf('}', i)
      if (end < 0) throw new Error(`参数模板缺少 }：${text}`)
      const name = text.slice(i + 1, end)
      if (!MV_PACK_PLACEHOLDERS.includes(name)) throw new Error(`未知占位符 {${name}}`)
      const value = values[name]
      if (value === undefined || value === null || value === '') throw new Error(`占位符 {${name}} 没有值`)
      out += value
      i = end
      continue
    }
    if (ch === '}') throw new Error(`参数模板有多余的 }：${text}`)
    out += ch
  }
  return out
}

/**
 * Expand terminal.args into argv. `values` holds absolute paths
 * (audio/lyrics/spectrum/script/packDir, absent when not configured) and the
 * numbers start/offset. Conditional groups are kept only when their condition
 * holds: a file is configured, or start > 0, or offset ≠ 0.
 */
export function expandPackArgs(args, values) {
  const holds = when => {
    if (when === 'start') return Number(values.start) > 0
    if (when === 'offset') return Number(values.offset) !== 0
    return typeof values[when] === 'string' && values[when] !== ''
  }
  const strings = {
    ...values,
    start: numberArg(values.start ?? 0),
    offset: numberArg(values.offset ?? 0),
  }
  const argv = []
  for (const item of args) {
    if (typeof item === 'string') argv.push(substitute(item, strings))
    else if (holds(item.when)) for (const arg of item.args) argv.push(substitute(arg, strings))
  }
  if (argv.length > MV_PACK_LIMITS.maxArgs) throw new Error(`参数超过 ${MV_PACK_LIMITS.maxArgs} 个`)
  for (const arg of argv) if (/[\0\r\n]/.test(arg)) throw new Error(`参数含有换行或 NUL：${JSON.stringify(arg)}`)
  return argv
}

/**
 * Characters refused in the separate-console (cmd.exe start) mode for pack
 * launches: cmd expands %VAR% and !VAR! even inside quotes, `"` cannot be
 * quoted, and & | < > ^ are refused too so a pack never relies on quoting to
 * keep them literal. Parentheses stay allowed (common in song file names; all
 * tokens are double-quoted, where cmd treats them literally).
 */
export const CMD_UNSAFE = /[%!"^&|<>\r\n\0]/

export function cmdSafetyProblems(file, args, cwd) {
  const problems = []
  for (const [subject, value] of [['程序路径', file], ['工作目录', cwd], ...args.map((arg, i) => [`参数 ${i + 1}`, arg])]) {
    const bad = String(value).match(CMD_UNSAFE)
    if (bad) problems.push(`${subject} 含有独立窗口（cmd.exe）模式拒绝的字符 ${JSON.stringify(bad[0])}：${value}`)
  }
  return problems
}

/** Launch request for a pack: only the manifest path and two numbers. */
export function parsePackLaunch(request) {
  const allowed = new Set(['player', 'manifestPath', 'start', 'offset', 'expectDisplay'])
  const extra = Object.keys(request).filter(key => !allowed.has(key))
  if (extra.length) throw new TypeError(`launch has unexpected fields: ${extra.join(', ')}`)
  const manifestPath = parseManifestPath(request.manifestPath)
  const start = request.start === undefined || request.start === null ? 0 : boundedNumber(request.start, 0, MV_PACK_LIMITS.maxStart, 'start')
  const offset = request.offset === undefined || request.offset === null ? 0 : boundedNumber(request.offset, -MV_PACK_LIMITS.maxOffset, MV_PACK_LIMITS.maxOffset, 'offset')
  if (request.expectDisplay !== undefined && (typeof request.expectDisplay !== 'string' || request.expectDisplay.length > 20_000)) throw new TypeError('expectDisplay must be a string')
  return { player: 'pack', manifestPath, start, offset, ...(request.expectDisplay !== undefined ? { expectDisplay: request.expectDisplay } : {}) }
}

function boundedNumber(value, min, max, subject) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new TypeError(`${subject} must be a number from ${min} to ${max}`)
  return value
}

/** Absolute path of an mv.json or of the folder holding one. */
export function parseManifestPath(value) {
  if (typeof value !== 'string') throw new TypeError('MV 包路径必须是字符串')
  const path = value.trim().replace(/^"(.*)"$/, '$1')
  if (!path || path.length > MV_PACK_LIMITS.maxPathChars || /[\0\r\n"]/.test(path)) throw new TypeError('MV 包路径无效')
  if (!isAbsolutePackPath(path)) throw new TypeError('MV 包路径必须是绝对路径（mv.json 文件或它所在的文件夹）')
  return path
}

export function parsePackLoad(value) {
  if (!isObject(value)) throw new TypeError('pack load request must be an object')
  const extra = Object.keys(value).filter(key => key !== 'path')
  if (extra.length) throw new TypeError(`pack load request has unexpected fields: ${extra.join(', ')}`)
  return { path: parseManifestPath(value.path) }
}

export function parsePackRead(value) {
  if (!isObject(value)) throw new TypeError('pack read request must be an object')
  const extra = Object.keys(value).filter(key => !['manifestPath', 'role', 'offset', 'length'].includes(key))
  if (extra.length) throw new TypeError(`pack read request has unexpected fields: ${extra.join(', ')}`)
  if (!MV_PACK_FILE_ROLES.includes(value.role)) throw new TypeError(`role must be ${MV_PACK_FILE_ROLES.join(' / ')}`)
  const offset = value.offset ?? 0
  const length = value.length ?? MV_PACK_LIMITS.readChunkBytes
  if (!Number.isInteger(offset) || offset < 0 || offset > MV_PACK_LIMITS.audioBytes) throw new TypeError('offset is invalid')
  if (!Number.isInteger(length) || length < 1 || length > MV_PACK_LIMITS.readChunkBytes) throw new TypeError(`length must be 1..${MV_PACK_LIMITS.readChunkBytes}`)
  return { manifestPath: parseManifestPath(value.manifestPath), role: value.role, offset, length }
}

export function parseTemplateWrite(value) {
  if (!isObject(value)) throw new TypeError('template request must be an object')
  const extra = Object.keys(value).filter(key => key !== 'dir')
  if (extra.length) throw new TypeError(`template request has unexpected fields: ${extra.join(', ')}`)
  return { dir: parseManifestPath(value.dir) }
}

/** Short one-line description of a pack for lists. */
export function packSummary(pack) {
  return [pack.title, pack.artist].filter(Boolean).join(' — ')
}
