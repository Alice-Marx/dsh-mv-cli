/**
 * Host side of MV packs: read an mv.json from disk, resolve and check its
 * files, serve the pack's audio to the panel in chunks, build the external
 * renderer's launch, and write the template folder.
 *
 * Every launch re-reads the manifest from disk (the client only sends the
 * manifest path and two numbers), and a start whose freshly resolved command
 * differs from the one the user confirmed is refused.
 */
import { mkdir, open, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import {
  MV_PACK_LIMITS, MV_PACK_MANIFEST, MvPackError, REFUSED_PROGRAM_EXTENSIONS,
  basenameOf, expandPackArgs, isAbsolutePackPath, parseMvPack,
} from './mv-pack.mjs'
import { displayCommand } from './mv-terminal-protocol.mjs'
import { TEMPLATE_FOLDER, templateFiles } from './mv-pack-template.mjs'

const info = async (statPath, path) => { try { return await statPath(path) } catch { return null } }
const extOf = path => { const name = basenameOf(path); const at = name.lastIndexOf('.'); return at > 0 ? name.slice(at).toLowerCase() : '' }

/** mv.json path for a file or folder path. */
export async function locateManifest(path, { statPath = stat } = {}) {
  const entry = await info(statPath, path)
  if (!entry) throw new MvPackError([`找不到：${path}`])
  if (entry.isDirectory?.()) {
    const manifest = join(path, MV_PACK_MANIFEST)
    const file = await info(statPath, manifest)
    if (!file?.isFile?.()) throw new MvPackError([`文件夹里没有 ${MV_PACK_MANIFEST}：${path}`])
    return { manifestPath: manifest, size: file.size }
  }
  if (!entry.isFile?.()) throw new MvPackError([`不是文件或文件夹：${path}`])
  if (extOf(path) !== '.json') throw new MvPackError([`MV 包清单应是 .json 文件：${path}`])
  return { manifestPath: path, size: entry.size }
}

/** Absolute path of a manifest file reference. */
export const packFilePath = (packDir, ref) => isAbsolutePackPath(ref) || isAbsolute(ref) ? ref : resolve(packDir, ...ref.split('/'))

/** Read and validate a manifest; returns { manifestPath, packDir, pack }. */
export async function readPack(path, { statPath = stat, readText = p => readFile(p, 'utf8') } = {}) {
  const { manifestPath, size } = await locateManifest(path, { statPath })
  if (size > MV_PACK_LIMITS.manifestBytes) throw new MvPackError([`mv.json 超过 ${MV_PACK_LIMITS.manifestBytes / 1024} KB`])
  const pack = parseMvPack(await readText(manifestPath))
  return { manifestPath, packDir: dirname(manifestPath), pack }
}

async function fileState(statPath, path, maxBytes) {
  const entry = await info(statPath, path)
  if (!entry?.isFile?.()) return { path, exists: false }
  return { path, exists: true, size: entry.size, tooLarge: entry.size > maxBytes }
}

/**
 * Load a pack for the panel: metadata, resolved file states, the lyric and
 * spectrum texts (small), and whether the external renderer's files exist.
 * Missing media files are reported as warnings, not errors.
 */
export async function loadPack(path, { statPath = stat, readText = p => readFile(p, 'utf8') } = {}) {
  const { manifestPath, packDir, pack } = await readPack(path, { statPath, readText })
  const warnings = []
  const files = {}
  const media = { audio: MV_PACK_LIMITS.audioBytes, lyrics: MV_PACK_LIMITS.textFileBytes, spectrum: MV_PACK_LIMITS.textFileBytes }
  for (const [role, max] of Object.entries(media)) {
    if (!pack[role]) continue
    const state = await fileState(statPath, packFilePath(packDir, pack[role].file), max)
    files[role] = state
    if (!state.exists) warnings.push(`${role} 文件不存在：${state.path}`)
    else if (state.tooLarge) warnings.push(`${role} 文件太大（上限 ${Math.round(max / 1048576)} MB）：${state.path}`)
  }
  let terminal = null
  if (pack.terminal) {
    terminal = { label: pack.terminal.label ?? basenameOf(pack.terminal.program), program: packFilePath(packDir, pack.terminal.program) }
    if (pack.terminal.script) terminal.script = packFilePath(packDir, pack.terminal.script)
  }
  return {
    manifestPath, packDir, pack, files, terminal, warnings,
  }
}

/**
 * Read one chunk of a file the pack's manifest names as audio, lyrics or
 * spectrum (the manifest is re-read; no other path can be requested).
 */
export async function readPackFile({ manifestPath, role, offset, length }, { statPath = stat, readText, openFile = open } = {}) {
  const { packDir, pack } = await readPack(manifestPath, { statPath, ...(readText ? { readText } : {}) })
  if (!pack[role]) throw new Error(`这个 MV 包没有配置 ${role}。`)
  const path = packFilePath(packDir, pack[role].file)
  const max = role === 'audio' ? MV_PACK_LIMITS.audioBytes : MV_PACK_LIMITS.textFileBytes
  const state = await fileState(statPath, path, max)
  if (!state.exists) throw new Error(`${role} 文件不存在：${path}`)
  if (state.tooLarge) throw new Error(`${role} 文件超过 ${max / 1048576} MB`)
  const size = state.size
  const want = Math.max(0, Math.min(length, size - offset))
  const buffer = Buffer.alloc(want)
  let bytes = 0
  if (want > 0) {
    const handle = await openFile(path, 'r')
    try { ({ bytesRead: bytes } = await handle.read(buffer, 0, want, offset)) } finally { await handle.close() }
  }
  return { name: basenameOf(path), size, offset, bytes, done: offset + bytes >= size, base64: buffer.subarray(0, bytes).toString('base64') }
}

/**
 * Resolve the external renderer of a pack into { file, args, cwd, display }.
 * Checks that the program, script and every configured media file exist.
 */
export async function resolvePackLaunch(launch, { statPath = stat, readText = p => readFile(p, 'utf8'), platform = process.platform } = {}) {
  const { manifestPath, packDir, pack } = await readPack(launch.manifestPath, { statPath, readText })
  if (!pack.terminal) throw new MvPackError([`这个 MV 包没有 terminal（外部渲染程序）配置：${manifestPath}`])
  const problems = []
  const program = packFilePath(packDir, pack.terminal.program)
  const programInfo = await info(statPath, program)
  if (!programInfo?.isFile?.()) problems.push(`找不到渲染程序，或它不是文件：${program}`)
  const ext = extOf(program)
  if (REFUSED_PROGRAM_EXTENSIONS.includes(ext)) problems.push(`渲染程序不能是 ${ext} 文件：${program}`)
  if (platform === 'win32' && ext !== '.exe' && ext !== '.com') problems.push(`Windows 上渲染程序必须是 .exe（解释器写成 program，脚本写成 script）：${program}`)
  const values = { packDir, start: launch.start ?? 0, offset: (launch.offset ?? 0) + (pack.audio?.offset ?? 0) }
  if (pack.terminal.script) {
    values.script = packFilePath(packDir, pack.terminal.script)
    const scriptInfo = await info(statPath, values.script)
    if (!scriptInfo?.isFile?.()) problems.push(`找不到脚本文件：${values.script}`)
  }
  for (const role of ['audio', 'lyrics', 'spectrum']) {
    if (!pack[role]) continue
    const path = packFilePath(packDir, pack[role].file)
    const entry = await info(statPath, path)
    if (!entry?.isFile?.()) problems.push(`${role} 文件不存在：${path}`)
    values[role] = path
  }
  if (problems.length) throw new MvPackError(problems)
  const args = expandPackArgs(pack.terminal.args, values)
  const cwd = pack.terminal.cwd === 'program' ? dirname(program) : pack.terminal.cwd === 'script' ? dirname(values.script) : packDir
  const display = displayCommand(program, args)
  if (launch.expectDisplay !== undefined && launch.expectDisplay !== display) {
    throw new Error(`MV 包在你确认之后发生了变化，没有启动。请重新检查并确认新命令：\n${display}`)
  }
  return { file: program, args, cwd, script: values.script ?? program, display, pack: { title: pack.title, manifestPath, label: pack.terminal.label ?? basenameOf(program) } }
}

/** Write the template into a new subfolder of dir (never overwrites). */
export async function writeTemplate({ dir }, { statPath = stat, makeDir = mkdir, write = writeFile } = {}) {
  const parent = await info(statPath, dir)
  if (!parent?.isDirectory?.()) throw new Error(`不是已存在的文件夹：${dir}`)
  let target = join(dir, TEMPLATE_FOLDER)
  for (let i = 2; await info(statPath, target); i++) {
    if (i > 50) throw new Error('目标文件夹里已有太多模板副本。')
    target = join(dir, `${TEMPLATE_FOLDER} (${i})`)
  }
  await makeDir(target)
  const written = []
  for (const file of templateFiles()) {
    const path = join(target, ...file.path.split('/'))
    await makeDir(dirname(path), { recursive: true })
    await write(path, file.text, { encoding: 'utf8', flag: 'wx' })
    written.push(path)
  }
  return { path: target, files: written }
}
