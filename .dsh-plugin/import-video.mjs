#!/usr/bin/env node
/** Import already-rendered local video as a pack. Never renders or runs source code. */
import { lstat, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MV_LYRICS_EXTENSIONS, MV_PACK_LIMITS, MV_VIDEO_EXTENSIONS, parseMvPack } from './shared/mv-pack.mjs'

export const MANIM_REFERENCE_OFFSET = 5.16
export const MANIM_VIDEO_NAMES = Object.freeze({ muxed: 'world-execute-me-manim.mp4', silent: 'world-execute-me-manim-silent.mp4' })
const CUES_BYTES = 256 * 1024
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

export class VideoImportError extends Error {
  constructor(code, message) { super(message); this.name = 'VideoImportError'; this.code = code }
}

const fail = (code, message) => { throw new VideoImportError(code, message) }

export const VIDEO_IMPORT_HELP = `Usage: dsh-mv-import-video <video-or-Manim-dir> --out <new-folder>
  --audio <file>             Your local external audio (default offset: 0)
  --audio-offset <seconds>   Positive delays audio; negative starts partway in
  --lyrics <file>            Your local LRC/SRT/VTT/JSON/TXT/JS/MJS lyrics
  --lyrics-offset <seconds>  Override lyric shift (Manim default: AUDIO_OFFSET)
  --title <title>            Pack title
  --manim                   Use Manim timing (fallback: 5.16 seconds)
  --help                    Show this help

Render the upstream Manim project first. The importer references existing files;
it never runs Python, Manim or ffmpeg, copies media, or overwrites a pack.
`

export function parseVideoImportArgs(argv) {
  const result = {}, positional = [], seen = new Set()
  const options = new Map([['--out', 'out'], ['--audio', 'audio'], ['--audio-offset', 'audioOffset'], ['--lyrics', 'lyrics'], ['--lyrics-offset', 'lyricsOffset'], ['--title', 'title']])
  let onlyPositional = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!onlyPositional && arg === '--') { onlyPositional = true; continue }
    if (!onlyPositional && (arg === '--help' || arg === '-h')) { result.help = true; continue }
    if (!onlyPositional && arg === '--manim') {
      if (seen.has(arg)) fail('ARGUMENT', `Duplicate option: ${arg}`)
      seen.add(arg); result.manim = true; continue
    }
    if (!onlyPositional && arg.startsWith('-')) {
      const equal = arg.indexOf('='), key = equal < 0 ? arg : arg.slice(0, equal)
      if (!options.has(key)) fail('ARGUMENT', `Unknown option: ${key}`)
      if (seen.has(key)) fail('ARGUMENT', `Duplicate option: ${key}`)
      seen.add(key)
      const value = equal < 0 ? argv[++i] : arg.slice(equal + 1)
      if (value === undefined || value === '' || value.startsWith('--')) fail('ARGUMENT', `Missing value for ${key}`)
      result[options.get(key)] = value
    } else positional.push(arg)
  }
  if (result.help) return result
  if (positional.length !== 1 || !result.out) fail('ARGUMENT', 'Provide one video or Manim directory and --out <new-folder>. Use --help for examples.')
  result.input = positional[0]
  for (const key of ['audioOffset', 'lyricsOffset']) if (result[key] !== undefined) result[key] = parseOffset(result[key], key)
  return result
}

function parseOffset(value, label) {
  if ((typeof value !== 'number' && (typeof value !== 'string' || !NUMBER.test(value))) || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > MV_PACK_LIMITS.maxOffset) {
    fail('OFFSET', `${label} must be a finite number between -${MV_PACK_LIMITS.maxOffset} and ${MV_PACK_LIMITS.maxOffset} seconds.`)
  }
  return Number(value)
}

/** Remove Python comments/strings without evaluating Python, preserving line positions. */
function pythonCodeOnly(source) {
  let result = '', quote = '', triple = false, comment = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (comment) { result += ch === '\n' ? '\n' : ' '; if (ch === '\n') comment = false; continue }
    if (quote) {
      if (ch === '\\' && i + 1 < source.length) { result += ' ' + (source[++i] === '\n' ? '\n' : ' '); continue }
      if (ch === quote && (!triple || source.slice(i, i + 3) === quote.repeat(3))) {
        const size = triple ? 3 : 1; result += ' '.repeat(size); i += size - 1; quote = ''; triple = false
      } else result += ch === '\n' ? '\n' : ' '
      continue
    }
    if (ch === '#') { result += ' '; comment = true; continue }
    if (ch === "'" || ch === '"') {
      quote = ch; triple = source.slice(i, i + 3) === ch.repeat(3)
      const size = triple ? 3 : 1; result += '?'.repeat(size); i += size - 1; continue
    }
    result += ch
  }
  return result
}

/** Accept only a top-level numeric literal assignment; never imports/evaluates cues.py. */
export function parseManimAudioOffset(source) {
  const code = pythonCodeOnly(String(source).replace(/^\uFEFF/, ''))
  let found = null
  for (const line of code.split(/\r?\n/)) {
    const match = /^AUDIO_OFFSET\s*(?::\s*float\s*)?=\s*(.*?)\s*$/.exec(line)
    if (!match) continue
    found = NUMBER.test(match[1]) ? Number(match[1]) : null
  }
  return Number.isFinite(found) && Math.abs(found) <= MV_PACK_LIMITS.maxOffset ? found : null
}

async function regularFile(path, role, maxBytes, extensions) {
  let info
  try { info = await stat(path) } catch (error) { fail('INPUT_FILE', `${role} file cannot be read: ${path} (${error.code ?? error.message})`) }
  if (!info.isFile()) fail('INPUT_FILE', `${role} must be a regular file: ${path}`)
  if (info.size === 0 || info.size > maxBytes) fail('INPUT_FILE', `${role} must contain data and be at most ${maxBytes} bytes: ${path}`)
  if (extensions && !extensions.includes(extname(path).toLowerCase())) fail('INPUT_FILE', `${role} extension must be ${extensions.join(' / ')}: ${path}`)
  // Store canonical absolute paths so pack placement never changes their meaning.
  try { return await realpath(path) } catch (error) { fail('INPUT_FILE', `${role} path cannot be resolved: ${path} (${error.code ?? error.message})`) }
}

async function isFile(path) { try { return (await stat(path)).isFile() } catch { return false } }

export async function resolveManimVideo(directory, { externalAudio = false } = {}) {
  const order = externalAudio ? ['silent', 'muxed'] : ['muxed', 'silent']
  for (const kind of order) {
    const path = join(directory, 'out', MANIM_VIDEO_NAMES[kind])
    if (await isFile(path)) return path
  }
  fail('MANIM_RENDER_MISSING', `Render the Manim project first (./build.sh -ql or -qh). Expected out/${MANIM_VIDEO_NAMES.muxed} or out/${MANIM_VIDEO_NAMES.silent} in ${directory}. You can also pass the rendered WorldExecuteMe.mp4 directly.`)
}

/** Validate everything first, then exclusively create a new folder and its mv.json. */
export async function importVideoPack({ input, out, audio, audioOffset, lyrics, lyricsOffset, title, manim = false } = {}) {
  if (typeof input !== 'string' || !input.trim() || typeof out !== 'string' || !out.trim()) fail('ARGUMENT', 'input and out must be nonempty local paths.')
  if (audioOffset !== undefined && !audio) fail('ARGUMENT', '--audio-offset requires --audio.')
  if (lyricsOffset !== undefined && !lyrics) fail('ARGUMENT', '--lyrics-offset requires --lyrics.')
  const outputDir = resolve(out), inputPath = resolve(input), warnings = []
  try { await lstat(outputDir); fail('OUTPUT_EXISTS', `Output already exists; choose a new folder: ${outputDir}`) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  let info
  try { info = await stat(inputPath) } catch (error) { fail('INPUT_FILE', `Input cannot be read: ${inputPath} (${error.code ?? error.message})`) }
  let videoPath = inputPath, sourceDir = null, isManim = Boolean(manim)
  if (info.isDirectory()) {
    const recognized = await isFile(join(inputPath, 'scenes', 'world_execute_me.py')) && await isFile(join(inputPath, 'cues.py'))
    if (!recognized && !manim) fail('INPUT_DIRECTORY', 'A directory must contain scenes/world_execute_me.py and cues.py, or be explicitly marked --manim. Otherwise pass a video file.')
    isManim = true; sourceDir = inputPath
    videoPath = await resolveManimVideo(inputPath, { externalAudio: Boolean(audio) })
  } else if (!info.isFile()) fail('INPUT_FILE', `Input must be a regular file or Manim directory: ${inputPath}`)
  let manimOffset = MANIM_REFERENCE_OFFSET
  if (isManim && sourceDir && await isFile(join(sourceDir, 'cues.py'))) {
    const cuesPath = join(sourceDir, 'cues.py'), cuesInfo = await stat(cuesPath)
    if (cuesInfo.size > CUES_BYTES) fail('MANIM_CUES', `cues.py is too large to inspect safely (limit ${CUES_BYTES} bytes). Pass the video file with an explicit --lyrics-offset.`)
    const literal = parseManimAudioOffset(await readFile(cuesPath, 'utf8'))
    if (literal === null) warnings.push(`No supported numeric AUDIO_OFFSET literal in cues.py; using ${MANIM_REFERENCE_OFFSET}. Set --lyrics-offset to override.`)
    else manimOffset = literal
  }
  const videoFile = await regularFile(videoPath, 'Video', MV_PACK_LIMITS.videoBytes, MV_VIDEO_EXTENSIONS)
  const manifest = {
    format: 'dsh-mv-pack', version: 1,
    title: title ?? (isManim ? 'world.execute(me); — Manim' : basename(videoPath, extname(videoPath))),
    video: { file: videoFile, offset: 0 },
    canvas: { renderer: 'video', subtitles: false },
  }
  if (audio) manifest.audio = { file: await regularFile(resolve(audio), 'Audio', MV_PACK_LIMITS.audioBytes), offset: parseOffset(audioOffset ?? 0, 'audioOffset') }
  if (lyrics) manifest.lyrics = { file: await regularFile(resolve(lyrics), 'Lyrics', MV_PACK_LIMITS.textFileBytes, MV_LYRICS_EXTENSIONS), offset: parseOffset(lyricsOffset ?? (isManim ? manimOffset : 0), 'lyricsOffset') }
  try { parseMvPack(manifest) } catch (error) { fail('MANIFEST', error.message) }
  await mkdir(dirname(outputDir), { recursive: true })
  try { await mkdir(outputDir) } catch (error) {
    if (error.code === 'EEXIST') fail('OUTPUT_EXISTS', `Output already exists; choose a new folder: ${outputDir}`)
    throw error
  }
  const manifestPath = join(outputDir, 'mv.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', encoding: 'utf8' })
  return { manifestPath, manifest, warnings }
}

export async function videoImportMain(argv = process.argv.slice(2)) {
  try {
    if (Number(process.versions.node.split('.')[0]) < 20) fail('NODE_VERSION', 'dsh-mv-import-video requires Node.js 20 or newer.')
    const args = parseVideoImportArgs(argv)
    if (args.help) { process.stdout.write(VIDEO_IMPORT_HELP); return 0 }
    const result = await importVideoPack(args)
    process.stdout.write(JSON.stringify({ ok: true, ...result }) + '\n')
    return 0
  } catch (error) {
    process.stderr.write(JSON.stringify({ ok: false, error: { code: error.code ?? 'IMPORT_FAILED', message: error.message } }) + '\n')
    return 1
  }
}

if (process.argv[1]) {
  // npm bin entries are symlinks on Unix; resolve them before checking main.
  let entry = resolve(process.argv[1])
  try { entry = await realpath(entry) } catch { /* a non-file test runner argument */ }
  if (import.meta.url === pathToFileURL(entry).href) process.exitCode = await videoImportMain()
}
