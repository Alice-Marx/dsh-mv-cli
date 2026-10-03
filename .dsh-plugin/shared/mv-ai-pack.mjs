/**
 * Host side of "用 AI 制作新 MV": create the pack folder (template files, the
 * user's brief and lyrics, an initial mv.json), receive the audio copy and the
 * panel-computed spectrum.json in chunks, and nothing else. Uploads are only
 * accepted into folders this Host process created, under fixed file names.
 */
import { createHash } from 'node:crypto'
import { mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { MV_PACK_MANIFEST, MV_PACK_SCHEMA_FILE, parseMvPack } from './mv-pack.mjs'
import { MV_PACK_JSON_SCHEMA, templateFiles } from './mv-pack-template.mjs'
import { AGENT_FILE, BRIEF_FILE, SCENE_FILE, agentGuide, initialManifest, looksTimed, packSlug, parseAiPackCreate } from './mv-ai-prompt.mjs'
import { EXAMPLE_SCENE } from './mv-scene.mjs'
import { checkSpectrumText, parsePackUploadBegin, parsePackUploadFinish, parsePackUploadWrite } from './mv-ai-upload.mjs'

export { checkSpectrumText, parsePackUploadBegin, parsePackUploadFinish, parsePackUploadWrite }

export { parseAiPackCreate }

const json = value => `${JSON.stringify(value, null, 2)}\n`

/** Default parent folder of AI-made packs (plugin-owned). */
export function aiPacksDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'packs')
  return join(env.XDG_DATA_HOME || (homedir() ? join(homedir(), '.local', 'share') : tmpdir()), 'dsh-mv', 'packs')
}

export function createAiPackManager({ root = aiPacksDir(), version = '', now = () => new Date(), random = () => createHash('sha1').update(String(Math.random()) + Date.now()).digest('hex').slice(0, 20) } = {}) {
  /** packDir (resolved, lower-cased on Windows) → { packDir, audioFile, manifestPath } */
  const created = new Map()
  let upload = null
  const key = dir => { const full = resolve(dir); return process.platform === 'win32' ? full.toLowerCase() : full }

  const exists = async path => { try { await stat(path); return true } catch { return false } }

  const abort = async () => {
    if (!upload) return
    const current = upload
    upload = null
    try { await current.handle.close() } catch { /* closed */ }
    await rm(current.part, { force: true }).catch(() => {})
  }

  return {
    root,
    async create(request) {
      const brief = parseAiPackCreate(request)
      let parent = root
      if (brief.parentDir) {
        let info = null
        try { info = await stat(brief.parentDir) } catch { /* missing */ }
        if (!info?.isDirectory()) throw new Error(`保存位置不是已存在的文件夹：${brief.parentDir}`)
        parent = brief.parentDir
      } else await mkdir(parent, { recursive: true })
      const slug = packSlug(brief.title, brief.artist)
      let packDir = join(parent, slug)
      for (let i = 2; await exists(packDir); i++) {
        if (i > 99) throw new Error('同名的 MV 包文件夹太多了，请换个名字或位置。')
        packDir = join(parent, `${slug} (${i})`)
      }
      await mkdir(packDir)
      const audioFile = `audio${brief.audioExt}`
      const lyricsTimed = brief.lyrics.trim() ? looksTimed(brief.lyrics) : false
      const lyricsFile = brief.lyrics.trim() ? (lyricsTimed ? 'lyrics.lrc' : 'lyrics.txt') : ''
      const info = { title: brief.title, artist: brief.artist, style: brief.style, audioFile, lyricsFile, lyricsTimed, spectrumFile: '', duration: brief.duration }
      const write = (name, body) => writeFile(join(packDir, name), body, { encoding: 'utf8', flag: 'wx' })
      const readme = templateFiles()
      await write(MV_PACK_SCHEMA_FILE, json(MV_PACK_JSON_SCHEMA))
      await write('README.md', readme.find(file => file.path === 'README.md').text)
      await write('README.zh.md', readme.find(file => file.path === 'README.zh.md').text)
      await write(SCENE_FILE, EXAMPLE_SCENE)
      if (lyricsFile) await write(lyricsFile, brief.lyrics.endsWith('\n') ? brief.lyrics : `${brief.lyrics}\n`)
      await write(BRIEF_FILE, json({
        title: brief.title, artist: brief.artist || undefined, style: brief.style || undefined,
        audio: audioFile, lyrics: lyricsFile || undefined, lyricsTimed: lyricsFile ? lyricsTimed : undefined,
        duration: brief.duration, createdAt: now().toISOString(), createdBy: `@ljwei-stak/dsh-mv-cli ${version}`.trim(),
      }))
      await write(AGENT_FILE, agentGuide(info))
      const manifestPath = join(packDir, MV_PACK_MANIFEST)
      await write(MV_PACK_MANIFEST, json(initialManifest(info)))
      created.set(key(packDir), { packDir, audioFile, manifestPath, info })
      return { packDir, manifestPath, audioFile, lyricsFile, lyricsTimed, files: [MV_PACK_MANIFEST, MV_PACK_SCHEMA_FILE, 'README.md', 'README.zh.md', SCENE_FILE, BRIEF_FILE, AGENT_FILE, ...(lyricsFile ? [lyricsFile] : [])] }
    },
    async uploadBegin({ packDir, role, bytes }) {
      const entry = created.get(key(packDir))
      if (!entry) throw new Error('只能向本次由插件创建的 MV 包文件夹写入文件。')
      await abort()
      const name = role === 'audio' ? entry.audioFile : 'spectrum.json'
      const uploadId = `pack-${random()}`
      const part = join(entry.packDir, `.${name}.${uploadId}.part`)
      const handle = await open(part, 'wx')
      upload = { uploadId, entry, role, name, part, bytes, written: 0, handle }
      return { uploadId, name, chunkBytes: 512 * 1024 }
    },
    async uploadWrite({ uploadId, offset, base64 }) {
      if (!upload || upload.uploadId !== uploadId) throw new Error('没有进行中的上传。')
      if (offset !== upload.written) throw new Error(`分块顺序错误：期望偏移 ${upload.written}，收到 ${offset}`)
      const chunk = Buffer.from(base64, 'base64')
      if (upload.written + chunk.length > upload.bytes) { await abort(); throw new Error('数据超出声明的大小。') }
      await upload.handle.write(chunk, 0, chunk.length, offset)
      upload.written += chunk.length
      return { written: upload.written }
    },
    async uploadFinish({ uploadId }) {
      if (!upload || upload.uploadId !== uploadId) throw new Error('没有进行中的上传。')
      const current = upload
      if (current.written !== current.bytes) { await abort(); throw new Error(`文件不完整：${current.written}/${current.bytes} 字节`) }
      upload = null
      await current.handle.close()
      const target = join(current.entry.packDir, current.name)
      if (current.role === 'spectrum') {
        const problem = checkSpectrumText(await readFile(current.part, 'utf8'))
        if (problem) { await rm(current.part, { force: true }); throw new Error(problem) }
      }
      if (await exists(target)) { await rm(current.part, { force: true }); throw new Error(`${current.name} 已存在，不会覆盖。`) }
      await rename(current.part, target)
      if (current.role === 'spectrum') {
        // Reference the spectrum in mv.json and AGENT.md (still the plugin-written versions).
        const entry = current.entry
        entry.info.spectrumFile = 'spectrum.json'
        const manifest = JSON.parse(await readFile(entry.manifestPath, 'utf8'))
        if (manifest['x-dsh-mv-ai']?.status === 'waiting-for-agent') {
          manifest.spectrum = { file: 'spectrum.json' }
          parseMvPack(manifest)
          await writeFile(entry.manifestPath, json(manifest), 'utf8')
          await writeFile(join(entry.packDir, AGENT_FILE), agentGuide(entry.info), 'utf8')
        }
      }
      return { path: target, bytes: current.bytes }
    },
    abort,
    isCreated: dir => created.has(key(dir)),
  }
}
