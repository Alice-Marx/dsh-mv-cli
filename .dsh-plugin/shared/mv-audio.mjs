/**
 * Audio format checks and the WAV cache for the MV terminal.
 *
 * world_execute_me's tui_live.py plays sound through Windows MCI
 * (`open "<file>" type mpegvideo`). MCI opens real MP3 and WAV files, but not
 * MP4/AAC. That includes the fragmented "DASH" MP4 that video sites hand out
 * and people rename to .mp3. On such a file MCI answers error 277
 * ("初始化 MCI 时发生问题"), and tui_live.py prints "no music: …" just before the
 * full-screen picture covers it, so the film plays silently.
 *
 * The panel can decode such a file itself (Chromium decodes AAC) and upload a
 * 16-bit PCM WAV into a cache folder owned by this plugin. The player is then
 * started with that WAV, and the user's folders are never written to.
 */
import { createHash } from 'node:crypto'
import { mkdir, open, readdir, rename, rm, stat } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

import { MCI_FORMATS, WAV_LIMITS, mciWarning, parseAudioProbe, parseWavBegin, parseWavFinish, parseWavWrite, sniffAudio } from './mv-audio-protocol.mjs'

export { MCI_FORMATS, WAV_LIMITS, mciWarning, parseAudioProbe, parseWavBegin, parseWavFinish, parseWavWrite, sniffAudio }

export async function probeAudioFile(path, { openFile = open } = {}) {
  const handle = await openFile(path, 'r')
  try {
    const buffer = Buffer.alloc(64)
    const { bytesRead } = await handle.read(buffer, 0, 64, 0)
    const { size } = await handle.stat()
    return { ...sniffAudio(buffer.subarray(0, bytesRead)), size }
  } finally { await handle.close() }
}

/** Plugin-owned cache folder (never inside the user's MV folders). */
export function wavCacheDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'audio-cache')
  return join(env.XDG_CACHE_HOME || (homedir() ? join(homedir(), '.cache') : tmpdir()), 'dsh-mv', 'audio-cache')
}

/** Check that bytes start with a PCM WAV header whose sizes match the file. */
export function checkWavHeader(bytes, total) {
  const b = Buffer.from(bytes)
  if (b.length < 44 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WAVE' || b.toString('latin1', 12, 16) !== 'fmt ') return 'not a WAV header'
  if (b.readUInt32LE(4) !== total - 8) return 'RIFF size does not match'
  if (b.readUInt16LE(20) !== 1) return 'not PCM'
  const channels = b.readUInt16LE(22), rate = b.readUInt32LE(24), bits = b.readUInt16LE(34)
  if (channels < 1 || channels > 2 || rate < 8000 || rate > 192000 || bits !== 16) return 'unsupported WAV layout'
  if (b.toString('latin1', 36, 40) !== 'data' || b.readUInt32LE(40) !== total - 44) return 'data size does not match'
  return ''
}

/**
 * Receives one WAV at a time from the panel: begin → write (sequential
 * chunks) → finish. Files are named by the source audio's sha256; the cache
 * keeps the newest few.
 */
export function createWavCache({ dir = wavCacheDir(), random = () => createHash('sha1').update(String(Math.random()) + Date.now()).digest('hex').slice(0, 20), fs = { mkdir, open, readdir, rename, rm, stat } } = {}) {
  let upload = null

  const finalPath = sha => join(dir, `${sha}.wav`)

  const prune = async keep => {
    let names = []
    try { names = (await fs.readdir(dir)).filter(name => /^[0-9a-f]{64}\.wav$/.test(name)) } catch { return }
    const items = []
    for (const name of names) { try { items.push({ name, mtime: (await fs.stat(join(dir, name))).mtimeMs }) } catch { /* gone */ } }
    items.sort((a, b) => b.mtime - a.mtime)
    for (const item of items.slice(WAV_LIMITS.keepFiles)) if (item.name !== keep) await fs.rm(join(dir, item.name), { force: true })
  }

  const abort = async () => {
    if (!upload) return
    const current = upload
    upload = null
    try { await current.handle.close() } catch { /* closed */ }
    await fs.rm(current.part, { force: true }).catch(() => {})
  }

  return {
    dir,
    async begin({ sourceSha256, bytes }) {
      const path = finalPath(sourceSha256)
      try {
        const existing = await fs.stat(path)
        if (existing.isFile() && existing.size === bytes) return { exists: true, path }
      } catch { /* not cached */ }
      await abort()
      await fs.mkdir(dir, { recursive: true })
      const uploadId = `wav-${random()}`
      const part = join(dir, `${sourceSha256}.${uploadId}.part`)
      const handle = await fs.open(part, 'w')
      upload = { uploadId, part, path, bytes, written: 0, handle, header: null }
      return { exists: false, uploadId, path, chunkBytes: WAV_LIMITS.chunkBytes }
    },
    async write({ uploadId, offset, base64 }) {
      if (!upload || upload.uploadId !== uploadId) throw new Error('没有进行中的 WAV 上传（可能已被新的上传取代）。')
      if (offset !== upload.written) throw new Error(`WAV 分块顺序错误：期望偏移 ${upload.written}，收到 ${offset}`)
      const chunk = Buffer.from(base64, 'base64')
      if (upload.written + chunk.length > upload.bytes) { await abort(); throw new Error('WAV 数据超出声明的大小。') }
      if (offset === 0) upload.header = chunk.subarray(0, 44)
      await upload.handle.write(chunk, 0, chunk.length, offset)
      upload.written += chunk.length
      return { written: upload.written }
    },
    async finish({ uploadId }) {
      if (!upload || upload.uploadId !== uploadId) throw new Error('没有进行中的 WAV 上传。')
      const current = upload
      if (current.written !== current.bytes) { await abort(); throw new Error(`WAV 不完整：${current.written}/${current.bytes} 字节`) }
      const problem = checkWavHeader(current.header ?? Buffer.alloc(0), current.bytes)
      if (problem) { await abort(); throw new Error(`WAV 无效：${problem}`) }
      upload = null
      await current.handle.close()
      await fs.rm(current.path, { force: true })
      await fs.rename(current.part, current.path)
      await prune(`${current.path.split(/[\\/]/).pop()}`)
      return { path: current.path, bytes: current.bytes }
    },
    abort,
  }
}
