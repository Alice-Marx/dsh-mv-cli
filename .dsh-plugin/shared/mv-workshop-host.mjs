/**
 * Host side of the MV 创意工坊: fetch the catalogue (index.json) from the
 * workshop GitHub repository, install packs into
 * %LOCALAPPDATA%\dsh-mv\workshop\<id>\ after checking every file's size and
 * sha256 against the index, uninstall them, and prepare a pack for
 * publishing (audio and lyric text stripped, lyric timings kept as hashes).
 * Publishing itself happens in the user's browser on github.com; this module
 * never uploads anything and never runs anything from a pack.
 */
import { createHash, randomBytes } from 'node:crypto'
import https from 'node:https'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { proxyFromEnv, tunnel } from './mv-lrclib.mjs'
import { loadPack, packFilePath } from './mv-pack-host.mjs'
import { parseLyrics } from './mv-lyrics.mjs'
import {
  COVER_NAMES, FINGERPRINT_KIND, WORKSHOP_INDEX_URL, WORKSHOP_LIMITS, WORKSHOP_REPO, WORKSHOP_TIMING_FILE, WORKSHOP_TIMING_FORMAT,
  checkScriptSafety, normalizeLyricLine, parseWorkshopIndex, publishLinks, validateWorkshopPack, workshopFileUrl,
} from './mv-workshop.mjs'

export function workshopDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'workshop')
  return join(env.XDG_DATA_HOME || (homedir() ? join(homedir(), '.local', 'share') : tmpdir()), 'dsh-mv', 'workshop')
}

const STATE_FILE = '.workshop.json'
const sha256 = data => createHash('sha256').update(data).digest('hex')
const json = value => `${JSON.stringify(value, null, 2)}\n`

/** GET a URL as bytes (200 only; size-capped; HTTPS proxy from the environment). */
export async function getBytes(url, { proxy = null, timeoutMs = 20_000, userAgent = 'dsh-mv-cli', maxBytes = WORKSHOP_LIMITS.indexBytes, request = https.request } = {}) {
  const target = new URL(url)
  if (target.protocol !== 'https:') throw new Error('只允许 https 下载')
  const options = { method: 'GET', headers: { 'User-Agent': userAgent, Accept: '*/*' }, timeout: timeoutMs }
  if (proxy) { const socket = await tunnel(proxy, target.hostname, { timeoutMs }); options.createConnection = () => socket; options.agent = false }
  return new Promise((resolve, reject) => {
    const req = request(target, options, res => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`GitHub 返回 ${res.statusCode}：${target.pathname}`)); return }
      const chunks = []; let size = 0
      res.on('data', chunk => { size += chunk.length; if (size > maxBytes) { req.destroy(new Error(`下载内容超过 ${Math.round(maxBytes / 1024)} KB`)); return } chunks.push(chunk) })
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.on('timeout', () => req.destroy(new Error('连接 GitHub 超时（如需代理，请设置 HTTPS_PROXY）')))
    req.on('error', reject)
    req.end()
  })
}

export function createWorkshopManager({ root = workshopDir(), publishRoot = join(dirname(root), 'workshop-publish'), get = getBytes, env = process.env, proxy = () => '', userAgent = 'dsh-mv-cli', now = () => new Date(), cacheMs = 5 * 60_000 } = {}) {
  let cached = null
  const covers = new Map()
  const options = maxBytes => ({ proxy: proxyFromEnv(env, proxy()), userAgent, maxBytes })

  async function index(refresh = false) {
    if (!refresh && cached && now().getTime() - cached.at < cacheMs) return cached.value
    const bytes = await get(WORKSHOP_INDEX_URL, options(WORKSHOP_LIMITS.indexBytes))
    let value
    try { value = parseWorkshopIndex(JSON.parse(bytes.toString('utf8'))) } catch (error) { throw new Error(`工坊索引无法解析：${error.message}`) }
    cached = { at: now().getTime(), value }
    return value
  }

  async function installed() {
    let names = []
    try { names = await readdir(root) } catch { return [] }
    const list = []
    for (const name of names) {
      if (name.startsWith('.')) continue
      try {
        const state = JSON.parse(await readFile(join(root, name, STATE_FILE), 'utf8'))
        if (state?.id !== name) continue
        list.push({ id: state.id, version: state.version, title: state.title, artist: state.artist, license: state.license, author: state.author, duration: state.duration ?? null, commit: state.commit, installedAt: state.installedAt, manifestPath: join(root, name, 'mv.json') })
      } catch { /* not a workshop install */ }
    }
    return list.sort((a, b) => String(b.installedAt).localeCompare(String(a.installedAt)))
  }

  return {
    root,
    async index({ refresh }) {
      const value = await index(refresh)
      return { ...value, installed: await installed(), source: WORKSHOP_INDEX_URL }
    },
    installed: async () => ({ installed: await installed() }),
    async cover({ id }) {
      const value = await index(false)
      const entry = value.packs.find(p => p.id === id)
      if (!entry?.cover) return { id, found: false }
      const file = entry.files.find(f => f.path === entry.cover)
      const key = `${id}@${file.sha256}`
      if (!covers.has(key)) {
        const bytes = await get(workshopFileUrl(value.commit, id, file.path), options(WORKSHOP_LIMITS.coverBytes))
        if (sha256(bytes) !== file.sha256) throw new Error('封面校验失败（sha256 不符）')
        if (covers.size > 200) covers.clear()
        covers.set(key, bytes.toString('base64'))
      }
      const mime = file.path.endsWith('.webp') ? 'image/webp' : file.path.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return { id, found: true, mime, base64: covers.get(key) }
    },
    async install({ id }) {
      const value = await index(true)
      const entry = value.packs.find(p => p.id === id)
      if (!entry) throw new Error(`工坊里没有这个包：${id}`)
      await mkdir(root, { recursive: true })
      const temp = join(root, `.tmp-${id}-${randomBytes(4).toString('hex')}`)
      try {
        for (const file of entry.files) {
          const bytes = await get(workshopFileUrl(value.commit, id, file.path), options(Math.max(file.size, 1)))
          if (bytes.length !== file.size) throw new Error(`${file.path} 大小不符（索引 ${file.size}，下载 ${bytes.length}）`)
          if (sha256(bytes) !== file.sha256) throw new Error(`${file.path} 校验失败（sha256 与索引不符），已取消安装`)
          const target = join(temp, ...file.path.split('/'))
          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, bytes, { flag: 'wx' })
        }
        // Re-check the downloaded pack with the same rules as the workshop CI.
        const result = await validateWorkshopPack({ id, files: entry.files.map(f => ({ path: f.path, size: f.size })), readText: path => readFile(join(temp, ...path.split('/')), 'utf8') })
        if (result.errors.length) throw new Error(`下载的包没有通过检查：\n${result.errors.join('\n')}`)
        await writeFile(join(temp, STATE_FILE), json({ id, version: entry.version, commit: value.commit, title: entry.title, artist: entry.artist, license: entry.license, author: entry.author, duration: entry.duration, installedAt: now().toISOString(), files: entry.files, source: WORKSHOP_REPO }))
        const dir = join(root, id)
        await rm(dir, { recursive: true, force: true })
        await rename(temp, dir)
        return { id, version: entry.version, manifestPath: join(dir, 'mv.json'), files: entry.files.length, warnings: result.warnings }
      } catch (error) {
        await rm(temp, { recursive: true, force: true }).catch(() => {})
        throw error
      }
    },
    async uninstall({ id }) {
      const dir = join(root, id)
      try { await stat(join(dir, STATE_FILE)) } catch { throw new Error(`没有安装这个工坊包：${id}`) }
      await rm(dir, { recursive: true, force: true })
      return { id, removed: true }
    },
    publishPrepare: request => preparePublish(request, { publishRoot, now }),
  }
}

/** Lyric timings without text: per line start / end, 16-hex sha256 of the normalised text, word times. */
export function lyricsTiming(cues) {
  return {
    format: WORKSHOP_TIMING_FORMAT, version: 1, normalize: 'nfkc-lower-strip-space-punct', hash: 'sha256-16',
    lines: cues.map(cue => {
      const text = cue.en || cue.zh || ''
      const line = { t: Math.round(cue.time * 1000) / 1000, h: sha256(normalizeLyricLine(text)).slice(0, 16) }
      if (Number.isFinite(cue.end) && cue.end >= cue.time) line.e = Math.round(cue.end * 1000) / 1000
      if (Array.isArray(cue.words) && cue.words.length) line.w = cue.words.map(w => Math.round(w.time * 1000) / 1000)
      return line
    }),
  }
}

function packReadme({ title, artist, author, license, description, credits, hasTiming, duration }) {
  return `# ${title}${artist ? ` — ${artist}` : ''}

${description || 'An ASCII MV for DeepSeek Harness · MV 放映室 (dsh-mv).'}

- Author / 作者: ${author}
- License / 许可: ${license}
- Song length / 歌曲时长: ${duration ? `${Math.round(duration * 10) / 10} s` : 'unknown'}
${(credits ?? []).map(line => `- ${line}`).join('\n')}

## How to play / 如何播放

This pack contains **no audio and no lyric text**. Install it from 创意工坊 in the MV 放映室 panel, then choose
your own copy of the song${hasTiming ? ' and your own lyrics file (lines are matched to the pack\'s timings by hash)' : ''}.

本包**不含音频和歌词文本**。在 MV 放映室的「创意工坊」安装后，选择你自己的歌曲文件${hasTiming ? '和歌词文件（按哈希匹配包里的时间轴）' : ''}即可播放。
Song rights belong to their owners. 歌曲版权归原作者所有。
`
}

/** Build the publish folder for a local pack: stripped mv.json, scene, cover, README, timings. */
export async function preparePublish(request, { publishRoot, now = () => new Date(), load = loadPack, readText = p => readFile(p, 'utf8') }) {
  const { manifestPath, packDir, pack } = await load(request.manifestPath)
  const raw = JSON.parse(await readText(manifestPath))
  const files = new Map()
  const stripped = []
  if (raw.audio !== undefined) stripped.push('audio（音频不会上传）')
  if (raw.spectrum !== undefined) stripped.push('spectrum（由用户音频实时分析）')
  let timing = null
  if (pack.lyrics?.file) {
    stripped.push('lyrics（歌词文本不会上传，只保留时间轴哈希）')
    try {
      const path = packFilePath(packDir, pack.lyrics.file)
      const cues = parseLyrics(path, await readText(path), { duration: pack.duration ?? 1e9 })
      const shift = pack.lyrics.offset ?? 0
      if (cues.length) timing = lyricsTiming(cues.map(c => ({ ...c, time: c.time + shift, end: c.end + shift, words: c.words?.map(w => ({ ...w, time: w.time + shift })) })))
    } catch { /* no timings then */ }
  }
  if (pack.canvas?.renderer === 'script') {
    const source = await readText(packFilePath(packDir, pack.canvas.script))
    files.set('scenes.js', source)
  }
  const duration = request.duration ?? pack.duration ?? null
  const manifest = { ...raw }
  delete manifest.audio; delete manifest.lyrics; delete manifest.spectrum; delete manifest.$schema; delete manifest.terminal
  if (pack.canvas?.renderer === 'script') manifest.canvas = { ...raw.canvas, renderer: 'script', script: 'scenes.js' }
  if (duration) manifest.duration = Math.round(duration * 1000) / 1000
  const ai = raw['x-dsh-mv-ai']
  if (ai) { delete manifest['x-dsh-mv-ai']; if (Array.isArray(ai.sections) && ai.sections.length) manifest['x-dsh-mv-ai'] = { sections: ai.sections } }
  manifest.notice = 'Workshop pack: no audio or lyric text included. Play it with your own copy of the song. 工坊包不含音频和歌词文本，请使用你自己的歌曲文件。'
  manifest['x-dsh-mv-workshop'] = {
    id: request.id, version: request.version, license: request.license, author: request.author,
    ...(request.description ? { description: request.description } : {}), ...(request.tags.length ? { tags: request.tags } : {}), ...(request.homepage ? { homepage: request.homepage } : {}),
    audio: { ...(duration ? { duration: Math.round(duration * 1000) / 1000 } : {}), ...(request.fingerprint ? { fingerprint: { kind: FINGERPRINT_KIND, values: request.fingerprint } } : {}) },
    ...(timing ? { lyricsTiming: WORKSHOP_TIMING_FILE } : {}),
    publishedAt: now().toISOString().slice(0, 10),
  }
  files.set('mv.json', json(manifest))
  if (timing) files.set(WORKSHOP_TIMING_FILE, json(timing))
  files.set('README.md', packReadme({ title: pack.title, artist: pack.artist, author: request.author, license: request.license, description: request.description, credits: pack.credits, hasTiming: Boolean(timing), duration }))
  let cover = null
  if (request.coverPng) cover = { name: 'cover.png', bytes: Buffer.from(request.coverPng, 'base64') }
  else {
    for (const name of COVER_NAMES) {
      try { const bytes = await readFile(join(packDir, name)); cover = { name, bytes }; break } catch { /* next */ }
    }
  }
  if (cover && cover.name === 'cover.png' && !cover.bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) cover = null
  const entries = [...files].map(([path, text]) => ({ path, bytes: Buffer.from(text, 'utf8') }))
  if (cover) entries.push({ path: cover.name, bytes: cover.bytes })
  const result = await validateWorkshopPack({ id: request.id, files: entries.map(e => ({ path: e.path, size: e.bytes.length })), readText: async path => entries.find(e => e.path === path).bytes.toString('utf8') })
  const scriptCheck = files.has('scenes.js') ? checkScriptSafety(files.get('scenes.js')) : { errors: [], warnings: [] }
  const dir = join(publishRoot, request.id, 'packs', request.id)
  if (!result.errors.length) {
    await rm(join(publishRoot, request.id), { recursive: true, force: true })
    await mkdir(dir, { recursive: true })
    for (const entry of entries) await writeFile(join(dir, entry.path), entry.bytes)
  }
  return {
    ok: result.errors.length === 0, id: request.id, dir: result.errors.length ? null : dir,
    files: entries.map(e => ({ path: e.path, size: e.bytes.length, sha256: sha256(e.bytes) })),
    errors: result.errors, warnings: [...new Set([...result.warnings, ...scriptCheck.warnings])], stripped,
    timingLines: timing?.lines.length ?? 0, links: publishLinks(request.id),
    prTitle: `Add pack: ${pack.title}${pack.artist ? ` — ${pack.artist}` : ''} (${request.id})`,
    prBody: [
      `Pack: \`packs/${request.id}/\` · version ${request.version} · license ${request.license} · author ${request.author}`,
      '',
      '- [x] No audio, no lyric text (prepared by dsh-mv 发布到工坊; lyrics are timings + hashes only)',
      '- [x] Scene script passes the static sandbox checks',
      `- [x] I have the right to share this pack under ${request.license}`,
    ].join('\n'),
  }
}
