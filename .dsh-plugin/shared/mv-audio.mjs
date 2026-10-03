/**
 * Host side of the audio handling: content sniffing of user-chosen files,
 * chunked reads of a chosen audio file for the panel's own decoder, and the
 * optional, confirmed ffmpeg conversion into a plugin-owned WAV cache
 * (keyed by the source's sha256) for pack audio the panel cannot decode.
 * The user's files and folders are only read.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, open, readdir, rename, rm, stat } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'

import {
  AUDIO_LIMITS, WAV_LIMITS, audioExtensionOf, audioMimeOf, ffmpegArgs, parseAudioConvert, parseAudioRead, parseFfmpegInfo, sniffAudio,
} from './mv-audio-protocol.mjs'

export { AUDIO_LIMITS, WAV_LIMITS, audioExtensionOf, audioMimeOf, ffmpegArgs, parseAudioConvert, parseAudioRead, parseFfmpegInfo, sniffAudio }

const SHA_NAME = /^[0-9a-f]{64}\.wav$/

/** First bytes + size, classified by content. */
export async function probeAudioFile(path, { openFile = open } = {}) {
  const handle = await openFile(path, 'r')
  try {
    const { size } = await handle.stat()
    const buffer = Buffer.alloc(Math.min(AUDIO_LIMITS.sniffBytes, Math.max(0, size)))
    const { bytesRead } = buffer.length ? await handle.read(buffer, 0, buffer.length, 0) : { bytesRead: 0 }
    return { ...sniffAudio(buffer.subarray(0, bytesRead)), size }
  } finally { await handle.close() }
}

/** Streamed sha256 of a file (hex). */
export function hashFile(path, { createStream = createReadStream } = {}) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createStream(path)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

/** Plugin-owned cache folder (never inside the user's MV folders). */
export function wavCacheDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'audio-cache')
  return join(env.XDG_CACHE_HOME || (homedir() ? join(homedir(), '.cache') : tmpdir()), 'dsh-mv', 'audio-cache')
}

/**
 * Lenient check of a finished (ffmpeg-made) cache file: RIFF
 * size matches, PCM fmt, and a data chunk that fits in the file.
 */
export function checkCachedWav(bytes, total) {
  const b = Buffer.from(bytes)
  if (b.length < 44 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WAVE') return 'not a WAV file'
  if (b.readUInt32LE(4) !== total - 8) return 'RIFF size does not match'
  let at = 12, fmt = false
  while (at + 8 <= b.length) {
    const id = b.toString('latin1', at, at + 4), size = b.readUInt32LE(at + 4)
    if (id === 'fmt ') { if (b.readUInt16LE(at + 8) !== 1) return 'not PCM'; fmt = true }
    if (id === 'data') return fmt && at + 8 + size <= total ? '' : 'data chunk does not fit'
    at += 8 + size + (size & 1)
  }
  return 'no data chunk in the first bytes'
}

/**
 * The plugin's WAV cache, written only by the confirmed ffmpeg conversion.
 * Files are named <source sha256>.wav; the newest few are kept.
 */
export function createWavCache({ dir = wavCacheDir(), fs = { open, readdir, rm, stat } } = {}) {
  const finalPath = sha => join(dir, `${sha}.wav`)

  const prune = async keep => {
    let names = []
    try { names = (await fs.readdir(dir)).filter(name => SHA_NAME.test(name)) } catch { return }
    const items = []
    for (const name of names) { try { items.push({ name, mtime: (await fs.stat(join(dir, name))).mtimeMs }) } catch { /* gone */ } }
    items.sort((a, b) => b.mtime - a.mtime)
    for (const item of items.slice(WAV_LIMITS.keepFiles)) if (item.name !== keep) await fs.rm(join(dir, item.name), { force: true })
  }

  /** Path of a valid cached WAV for this source sha256, or null. */
  const lookup = async sha => {
    const path = finalPath(sha)
    let handle
    try {
      const info = await fs.stat(path)
      if (!info.isFile() || info.size < 44) return null
      handle = await fs.open(path, 'r')
      const head = Buffer.alloc(Math.min(4096, info.size))
      await handle.read(head, 0, head.length, 0)
      return checkCachedWav(head, info.size) ? null : { path, bytes: info.size }
    } catch { return null } finally { await handle?.close().catch(() => {}) }
  }

  return { dir, finalPath, lookup, prune }
}

/**
 * One chunk of a user-chosen audio / video file, for the panel's own
 * decoder. Only files whose content is a known media container are served.
 */
export async function readAudioChunk({ path, offset, length }, { openFile = open } = {}) {
  const handle = await openFile(path, 'r')
  try {
    const { size } = await handle.stat()
    if (size > AUDIO_LIMITS.maxSourceBytes) throw new Error(`音频文件太大（上限 ${AUDIO_LIMITS.maxSourceBytes / 1048576} MB）`)
    const head = Buffer.alloc(Math.min(AUDIO_LIMITS.sniffBytes, size))
    if (head.length) await handle.read(head, 0, head.length, 0)
    const sniff = sniffAudio(head)
    if (sniff.format === 'unknown') throw new Error(`不是可识别的音频/视频文件（按内容判断）：${path}`)
    const want = Math.max(0, Math.min(length, size - offset))
    const buffer = Buffer.alloc(want)
    const { bytesRead } = want ? await handle.read(buffer, 0, want, offset) : { bytesRead: 0 }
    return { size, offset, bytes: bytesRead, done: offset + bytesRead >= size, format: sniff.format, label: sniff.label, base64: buffer.subarray(0, bytesRead).toString('base64') }
  } finally { await handle.close() }
}

// ---- optional ffmpeg -------------------------------------------------------

/** Well-known install location on the user's machine, checked after PATH. */
export const FFMPEG_FALLBACKS = Object.freeze(['D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', 'C:\\ffmpeg\\bin\\ffmpeg.exe'])

/** Locate ffmpeg: an explicit config path, then PATH, then FFMPEG_FALLBACKS. Never runs it. */
export async function findFfmpeg({ configured = '', env = process.env, platform = process.platform, statPath = stat, fallbacks = platform === 'win32' ? FFMPEG_FALLBACKS : ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg'] } = {}) {
  const isFile = async path => { try { return (await statPath(path)).isFile() } catch { return false } }
  const name = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  if (configured) return (await isFile(configured)) ? { path: configured, source: 'config' } : null
  const pathVar = env.PATH ?? env.Path ?? env.path ?? ''
  const sep = platform === 'win32' ? ';' : delimiter
  for (const dir of String(pathVar).split(sep).map(part => part.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean)) {
    const candidate = platform === 'win32' ? `${dir.replace(/[\\/]+$/, '')}\\${name}` : join(dir, name)
    if (await isFile(candidate)) return { path: candidate, source: 'PATH' }
  }
  for (const candidate of fallbacks) if (await isFile(candidate)) return { path: candidate, source: 'known' }
  return null
}

/**
 * Convert one file with ffmpeg into the WAV cache: fixed argument vector, no
 * shell, output to a .part file renamed on success, 10-minute limit.
 */
export function createFfmpegConverter({ cache, locate = findFfmpeg, spawnImpl = spawn, hasher = hashFile, probe = probeAudioFile, timeoutMs = 10 * 60_000, configured = () => '' } = {}) {
  let running = null
  return {
    async info() {
      const found = await locate({ configured: configured() })
      return found ? { available: true, path: found.path, source: found.source } : { available: false }
    },
    async convert({ path }) {
      if (running) throw new Error('已有一个 ffmpeg 转换在进行。')
      const found = await locate({ configured: configured() })
      if (!found) throw new Error('没有找到 ffmpeg（PATH 里或 D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe）。')
      const sniff = await probe(path)
      if (sniff.size > AUDIO_LIMITS.maxSourceBytes) throw new Error('音频文件太大。')
      const sha256 = await hasher(path)
      const cached = await cache.lookup(sha256)
      if (cached) return { path: cached.path, sha256, cached: true, command: '' }
      await mkdir(cache.dir, { recursive: true })
      const part = join(cache.dir, `${sha256}.ffmpeg.part.wav`)
      const args = ffmpegArgs(path, part)
      running = new Promise((resolve, reject) => {
        let stderr = ''
        const child = spawnImpl(found.path, args, { shell: false, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
        const timer = setTimeout(() => { try { child.kill() } catch { /* gone */ } reject(new Error('ffmpeg 超过 10 分钟，已结束。')) }, timeoutMs)
        child.stderr?.on('data', chunk => { if (stderr.length < 4000) stderr += chunk.toString('utf8') })
        child.on('error', error => { clearTimeout(timer); reject(error) })
        child.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`ffmpeg 退出码 ${code}：${stderr.trim().split('\n').slice(-3).join(' ')}`)) })
      })
      try {
        await running
        await rm(cache.finalPath(sha256), { force: true })
        await rename(part, cache.finalPath(sha256))
        const done = await cache.lookup(sha256)
        if (!done) throw new Error('ffmpeg 生成的 WAV 无效。')
        await cache.prune(`${sha256}.wav`)
        return { path: done.path, sha256, cached: false, command: [found.path, ...args].join(' ') }
      } catch (error) {
        await rm(part, { force: true }).catch(() => {})
        throw error
      } finally { running = null }
    },
  }
}
