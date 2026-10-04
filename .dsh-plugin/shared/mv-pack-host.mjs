/**
 * Host side of MV packs: read an mv.json from disk, resolve and check its
 * files, serve the pack's files to the panel in chunks (each read re-reads
 * the manifest, so only files it names can be requested), and write the
 * template folder. Nothing here runs a program.
 */
import { mkdir, open, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { MV_PACK_LIMITS, MV_PACK_MANIFEST, MvPackError, assetParts, basenameOf, isAbsolutePackPath, parseMvPack } from './mv-pack.mjs'
import { TEMPLATE_FOLDER, templateFiles } from './mv-pack-template.mjs'

const info = async (statPath, path) => { try { return await statPath(path) } catch { return null } }
const extOf = path => { const name = basenameOf(path); const at = name.lastIndexOf('.'); return at > 0 ? name.slice(at).toLowerCase() : '' }

export const TERMINAL_IGNORED = '这个 mv.json 里的 "terminal"（外部 TUI 程序）已被忽略：0.6.0 起插件只在画布上播放，不再运行外部播放器。'

/** mv.json path for a file or folder path. */
/** 0.9.0: the world.execute(me) scenes are no longer bundled (see the workshop pack). */
export const WEM_MOVED = '这个 mv.json 使用 "world-execute-me" 渲染器：0.9.0 起它不再内置，改用通用画面播放。请到「创意工坊」安装「world.execute(me);」MV 包（包含这些场景）。'

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
 * Load a pack for the panel: metadata and resolved file states. Missing
 * media files (and an ignored pre-0.6.0 "terminal" section) are reported as
 * warnings, not errors.
 */
export async function loadPack(path, { statPath = stat, readText = p => readFile(p, 'utf8') } = {}) {
  const { manifestPath, packDir, pack } = await readPack(path, { statPath, readText })
  const warnings = []
  const files = {}
  const media = { audio: MV_PACK_LIMITS.audioBytes, lyrics: MV_PACK_LIMITS.textFileBytes, spectrum: MV_PACK_LIMITS.textFileBytes, scene: MV_PACK_LIMITS.sceneBytes, timing: MV_PACK_LIMITS.textFileBytes }
  for (const [role, max] of Object.entries(media)) {
    const ref = roleFile(pack, role)
    if (!ref) continue
    const state = await fileState(statPath, packFilePath(packDir, ref), max)
    files[role] = state
    if (!state.exists) warnings.push(`${role} 文件不存在：${state.path}`)
    else if (state.tooLarge) warnings.push(`${role} 文件太大（上限 ${Math.round(max / 1048576)} MB）：${state.path}`)
  }
  const assets = {}
  for (const name of Object.keys(pack.canvas?.assets ?? {})) {
    const states = []
    for (const ref of assetParts(pack, name)) states.push(await fileState(statPath, packFilePath(packDir, ref), MV_PACK_LIMITS.assetBytes))
    assets[name] = { parts: states.length, exists: states.every(st => st.exists && !st.tooLarge) }
    if (!assets[name].exists) warnings.push(`canvas.assets.${name} 的文件缺失或太大`)
  }
  if (Object.keys(assets).length) files.assets = assets
  if (pack.canvas?.renderer === 'world-execute-me') warnings.push(WEM_MOVED)
  if (pack.ignored?.includes('terminal')) warnings.push(TERMINAL_IGNORED)
  return { manifestPath, packDir, pack, files, warnings }
}

/** The manifest's file reference for a readable role ('scene' = canvas.script). */
export const roleFile = (pack, role) => role === 'scene' ? pack.canvas?.script : role === 'timing' ? pack.workshop?.lyricsTiming : pack[role]?.file

/**
 * Read one chunk of a file the pack's manifest names as audio, lyrics,
 * spectrum or scene script (the manifest is re-read; no other path can be
 * requested).
 */
export async function readPackFile({ manifestPath, role, offset, length, asset, part = 0 }, { statPath = stat, readText, openFile = open } = {}) {
  const { packDir, pack } = await readPack(manifestPath, { statPath, ...(readText ? { readText } : {}) })
  const ref = role === 'asset' ? assetParts(pack, asset)[part] : roleFile(pack, role)
  if (!ref) throw new Error(role === 'asset' ? `这个 MV 包的 canvas.assets 里没有 ${asset}[${part}]。` : `这个 MV 包没有配置 ${role}。`)
  const path = packFilePath(packDir, ref)
  const max = role === 'audio' ? MV_PACK_LIMITS.audioBytes : role === 'scene' ? MV_PACK_LIMITS.sceneBytes : role === 'asset' ? MV_PACK_LIMITS.assetBytes : MV_PACK_LIMITS.textFileBytes
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
