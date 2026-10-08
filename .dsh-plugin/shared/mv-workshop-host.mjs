/**
 * Host side of the MV 创意工坊: fetch the catalogue (index.json) from the
 * workshop GitHub repository, install packs into
 * %LOCALAPPDATA%\dsh-mv\workshop\<id>\ after checking every file's size and
 * sha256 against the index, uninstall them, and prepare a pack for
 * publishing (audio excluded; licensed lyrics and non-audio resources retained).
 * Publishing itself happens in the user's browser on github.com; this module
 * never uploads anything and never runs anything from a pack.
 */
import { createHash, randomBytes } from 'node:crypto'
import https from 'node:https'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { spawn } from 'node:child_process'
import { cp, mkdir, readdir, readFile, rename, rm, stat, unlink, writeFile } from 'node:fs/promises'
import { proxyFromEnv, tunnel } from './mv-lrclib.mjs'
import { assetParts, isAbsolutePackPath } from './mv-pack.mjs'
import { loadPack, packFilePath } from './mv-pack-host.mjs'
import { parseLyrics } from './mv-lyrics.mjs'
import {
  COVER_NAMES, FINGERPRINT_KIND, WORKSHOP_INDEX_URL, WORKSHOP_LIMITS, WORKSHOP_REPO, WORKSHOP_TIMING_FILE, WORKSHOP_TIMING_FORMAT,
  insideDir, normalizeLyricLine, normalizeWorkshopDir, packRequires, parseWorkshopIndex, publishLinks, sameDir, validateWorkshopPack, workshopFileUrl,
} from './mv-workshop.mjs'

export function workshopDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'workshop')
  return join(env.XDG_DATA_HOME || (homedir() ? join(homedir(), '.local', 'share') : tmpdir()), 'dsh-mv', 'workshop')
}

const STATE_FILE = '.workshop.json'

/** %LOCALAPPDATA%\dsh-mv\settings.json: settings the panel changes (0.9.1: workshop install location). */
export function settingsFile(env = process.env, platform = process.platform) { return join(dirname(workshopDir(env, platform)), 'settings.json') }

/** Host-side settings store (JSON file, atomic writes). */
export function createSettingsStore({ file = settingsFile() } = {}) {
  let cache = null
  return {
    file,
    async read() {
      if (cache) return cache
      try { const value = JSON.parse(await readFile(file, 'utf8')); cache = value && typeof value === 'object' && !Array.isArray(value) ? value : {} } catch { cache = {} }
      return cache
    },
    async update(patch) {
      const next = { ...(await this.read()), ...patch }
      await mkdir(dirname(file), { recursive: true })
      const temp = `${file}.${randomBytes(4).toString('hex')}.tmp`
      await writeFile(temp, json(next))
      await rename(temp, file)
      cache = next
      return next
    },
  }
}

/** Make sure a folder exists and is writable (creates it; writes and deletes a probe file). */
export async function ensureWritableDir(dir) {
  try {
    await mkdir(dir, { recursive: true })
    const probe = join(dir, `.dsh-mv-write-test-${randomBytes(4).toString('hex')}`)
    await writeFile(probe, 'ok', { flag: 'wx' })
    await unlink(probe)
  } catch (error) {
    const code = error?.code
    const reason = code === 'EACCES' || code === 'EPERM' ? '没有写入权限' : code === 'ENOENT' ? '找不到这个驱动器或路径' : code === 'EROFS' ? '这是只读磁盘' : code === 'ENOTDIR' || code === 'EEXIST' ? '路径里有同名的文件（不是文件夹）' : code === 'ENOSPC' ? '磁盘已满' : (error?.message ?? String(error))
    throw new Error(`无法使用这个文件夹：${dir}（${reason}）`)
  }
}

/** Open a folder in the system file manager (no shell; the folder path is one argument). */
export function openFolder(dir, { platform = process.platform, run = spawn } = {}) {
  const [command, args] = platform === 'win32' ? ['explorer.exe', [dir]] : platform === 'darwin' ? ['open', [dir]] : ['xdg-open', [dir]]
  const child = run(command, args, { detached: true, stdio: 'ignore', windowsHide: false })
  child.on?.('error', () => {})
  child.unref?.()
}
const sha256 = data => createHash('sha256').update(data).digest('hex')
const json = value => `${JSON.stringify(value, null, 2)}\n`

const downloadError = (message, code, details = {}) => Object.assign(new Error(message), { code, ...details })
const pauseDownload = ms => new Promise(resolve => setTimeout(resolve, ms))
const rawPrefix = `https://raw.githubusercontent.com/${WORKSHOP_REPO}/`

/** HTTPS only; redirects cannot leak proxy/URL credentials to unrelated hosts. */
export async function getBytes(url, { proxy = null, timeoutMs = 20_000, userAgent = 'dsh-mv-cli', maxBytes = WORKSHOP_LIMITS.indexBytes, request = https.request, connectTunnel = tunnel, redirects = 3 } = {}) {
  const target = new URL(url)
  if (target.protocol !== 'https:' || target.username || target.password) throw downloadError('只允许不含认证信息的 https 下载', 'ERR_DOWNLOAD_URL')
  const budget = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 20_000
  const options = { method: 'GET', defaultPort: 443, headers: { 'User-Agent': userAgent, Accept: '*/*' }, timeout: budget }
  let socket
  if (proxy) {
    socket = await connectTunnel(proxy, target.hostname, { timeoutMs: budget, targetPort: Number(target.port || 443) })
    options.createConnection = () => socket
    // agent:false would construct a default Agent and ignore this TLS tunnel.
  }
  const result = await new Promise((resolve, reject) => {
    let req, timer, settled = false
    const finish = (error, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (error) req?.destroy()
      socket?.destroy()
      if (error) reject(error); else resolve(value)
    }
    try {
      req = request(target, options, res => {
        res.once('error', error => finish(error))
        res.once('aborted', () => finish(downloadError('下载响应中断', 'ECONNRESET')))
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          if (typeof res.headers?.location !== 'string' || !res.headers.location.trim()) { finish(downloadError('下载重定向缺少地址', 'ERR_DOWNLOAD_REDIRECT')); return }
          let next
          try { next = new URL(res.headers.location, target) } catch { finish(downloadError('下载重定向地址无效', 'ERR_DOWNLOAD_REDIRECT')); return }
          const allowed = next.host === target.host || (target.hostname === 'gitee.com' && next.hostname === 'raw.giteeusercontent.com' && !next.port)
          if (!redirects || next.protocol !== 'https:' || next.username || next.password || !allowed) {
            finish(downloadError('拒绝不安全或过多的下载重定向', 'ERR_DOWNLOAD_REDIRECT')); return
          }
          res.resume()
          finish(null, { redirect: next.href })
          req?.destroy()
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          const retryAfter = Number(res.headers?.['retry-after'])
          const reason = res.statusCode === 451 ? '服务器内容访问限制（HTTP 451，非代理配置错误）' : `下载服务器返回 HTTP ${res.statusCode}`
          finish(downloadError(`${reason}：${target.hostname}${target.pathname}`, 'ERR_DOWNLOAD_HTTP', { statusCode: res.statusCode, retryAfterMs: Number.isFinite(retryAfter) ? Math.min(5000, Math.max(0, retryAfter * 1000)) : 0 }))
          return
        }
        const chunks = []; let size = 0
        res.on('data', chunk => {
          if (settled) return
          size += chunk.length
          if (size > maxBytes) { finish(downloadError(`下载内容超过 ${Math.round(maxBytes / 1024)} KB`, 'ERR_DOWNLOAD_SIZE')); return }
          chunks.push(chunk)
        })
        res.once('end', () => {
          if (res.complete === false) finish(downloadError('下载响应不完整', 'ECONNRESET'))
          else finish(null, { bytes: Buffer.concat(chunks) })
        })
        res.once('close', () => { if (!settled && res.complete === false) finish(downloadError('下载响应中断', 'ECONNRESET')) })
      })
      if (!settled) timer = setTimeout(() => finish(downloadError('下载请求超时', 'ETIMEDOUT')), budget)
      req.once('timeout', () => finish(downloadError('下载请求超时', 'ETIMEDOUT')))
      req.once('error', error => finish(error))
      req.end()
    } catch (error) { finish(error) }
  })
  if (result.redirect) return getBytes(result.redirect, { proxy, timeoutMs: budget, userAgent, maxBytes, request, connectTunnel, redirects: redirects - 1 })
  return result.bytes
}

export function retryableDownloadError(error) {
  return ['ECONNRESET', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPIPE', 'ECONNREFUSED', 'ENETUNREACH', 'EHOSTUNREACH', 'EAI_AGAIN', 'ENOTFOUND'].includes(error?.code)
    || [408, 429, 500, 502, 503, 504].includes(error?.statusCode)
}

/** At most three attempts; never retry certificate, integrity or configuration errors. */
export async function getBytesWithRetry(url, options, { get = getBytes, retries = 2, sleep = pauseDownload } = {}) {
  const limit = Math.min(2, Math.max(0, Math.floor(Number(retries) || 0)))
  for (let attempt = 0; ; attempt++) {
    try { return await get(url, options) }
    catch (error) {
      if (attempt >= limit || !retryableDownloadError(error)) throw error
      await sleep(Math.min(5000, Math.max(250 * 2 ** attempt, Number(error.retryAfterMs) || 0)))
    }
  }
}

/** An explicitly trusted repository raw prefix or commit-addressable static mirror. */
export function workshopMirrorUrl(base, githubUrl) {
  const value = String(base ?? '').trim()
  if (!value) return null
  let target
  try { target = new URL(value) } catch { throw downloadError('工坊备用源地址无效', 'ERR_WORKSHOP_MIRROR') }
  if (target.protocol !== 'https:' || target.username || target.password || target.search || target.hash) throw downloadError('工坊备用源必须是无认证、无查询参数的 HTTPS 地址', 'ERR_WORKSHOP_MIRROR')
  const original = new URL(githubUrl)
  if (!original.href.startsWith(rawPrefix) || original.search || original.hash) throw downloadError('备用源只用于官方工坊文件', 'ERR_WORKSHOP_MIRROR')
  return `${target.href.replace(/\/+$/, '')}/${original.href.slice(rawPrefix.length)}`
}

/**
 * Workshop manager. The install folder is `root` (tests) or, since 0.9.1, the user's choice: the panel's
 * setting (settings.json → workshop.dir) wins over the plugin config (workshopDir), then the default
 * %LOCALAPPDATA%\dsh-mv\workshop. Folders used before keep being scanned (workshop.extraDirs) until their
 * packs are moved, so the library keeps finding packs left where they were.
 */
export function createWorkshopManager({ root: fixedRoot = null, defaultRoot = workshopDir(), configDir = () => '', settings = null, platform = process.platform, publishRoot = join(dirname(fixedRoot ?? defaultRoot), 'workshop-publish'), get = getBytes, env = process.env, proxy = () => '', mirror = () => '', retrySleep = pauseDownload, userAgent = 'dsh-mv-cli', now = () => new Date(), cacheMs = 5 * 60_000, open = dir => openFolder(dir, { platform }) } = {}) {
  let cached = null
  const store = settings ?? (fixedRoot ? null : createSettingsStore())
  const configured = () => { const v = String(configDir() ?? '').trim(); if (!v) return null; try { return normalizeWorkshopDir(v, platform) } catch { return null } }
  async function prefs() { const all = store ? await store.read() : {}; const w = all.workshop && typeof all.workshop === 'object' ? all.workshop : {}; return { dir: typeof w.dir === 'string' && w.dir ? w.dir : null, extraDirs: Array.isArray(w.extraDirs) ? w.extraDirs.filter(d => typeof d === 'string' && d) : [] } }
  async function currentRoot() { if (fixedRoot) return fixedRoot; const p = await prefs(); return p.dir ?? configured() ?? defaultRoot }
  async function roots() { const root = await currentRoot(); const extra = (await prefs()).extraDirs.filter(d => !sameDir(d, root, platform)); return [root, ...extra.filter((d, i) => extra.findIndex(x => sameDir(x, d, platform)) === i)] }
  const covers = new Map()
  // A domestic backup deliberately bypasses an inherited, possibly stopped proxy.
  const options = (url, maxBytes, backup = false) => ({ proxy: backup ? null : proxyFromEnv(env, proxy(), url), userAgent, maxBytes })
  const eligibleForMirror = error => retryableDownloadError(error) || [403, 404].includes(error?.statusCode) && error?.code === 'ERR_DOWNLOAD_HTTP'
  const sourceUrl = (url, source) => source === 'mirror' ? workshopMirrorUrl(mirror(), url) : url
  async function download(url, maxBytes, route = { source: 'github' }) {
    // Validate a configured source even if GitHub succeeds; never silently accept bad settings.
    const backupUrl = workshopMirrorUrl(mirror(), url)
    const fetch = (target, backup) => getBytesWithRetry(target, options(target, maxBytes, backup), { get, sleep: retrySleep })
    if (route.source === 'mirror' && backupUrl) return fetch(backupUrl, true)
    try { return await fetch(url, false) }
    catch (primaryError) {
      if (backupUrl && eligibleForMirror(primaryError)) {
        try { const bytes = await fetch(backupUrl, true); route.source = 'mirror'; return bytes }
        catch (backupError) { throw new Error(`GitHub 与备用源都下载失败。GitHub：${primaryError.message}；备用源：${backupError.message}`, { cause: backupError }) }
      }
      if (eligibleForMirror(primaryError)) throw new Error(`无法下载工坊文件：${primaryError.message}。请检查网络、插件 httpProxy 或 HTTPS_PROXY；也可配置 workshopMirror 国内备用源。修改系统环境变量后需重启 Harness。`, { cause: primaryError })
      throw primaryError
    }
  }

  async function index(refresh = false) {
    if (!refresh && cached && now().getTime() - cached.at < cacheMs) return cached.value
    const route = { source: 'github' }
    const bytes = await download(WORKSHOP_INDEX_URL, WORKSHOP_LIMITS.indexBytes, route)
    let value
    try { value = parseWorkshopIndex(JSON.parse(bytes.toString('utf8'))) } catch (error) { throw new Error(`工坊索引无法解析：${error.message}`) }
    cached = { at: now().getTime(), value, source: route.source }
    return value
  }

  async function installedIn(root) {
    let names = []
    try { names = await readdir(root) } catch { return [] }
    const list = []
    for (const name of names) {
      if (name.startsWith('.')) continue
      try {
        const state = JSON.parse(await readFile(join(root, name, STATE_FILE), 'utf8'))
        if (state?.id !== name) continue
        list.push({ id: state.id, version: state.version, title: state.title, artist: state.artist, license: state.license, author: state.author, duration: state.duration ?? null, commit: state.commit, installedAt: state.installedAt, manifestPath: join(root, name, 'mv.json'), dir: root })
      } catch { /* not a workshop install */ }
    }
    return list
  }
  /** Installed packs in the current folder and in folders kept from before (the current folder wins on duplicates). */
  async function installed() {
    const seen = new Set(), list = []
    for (const root of await roots()) for (const item of await installedIn(root)) { if (seen.has(item.id)) continue; seen.add(item.id); list.push(item) }
    return list.sort((a, b) => String(b.installedAt).localeCompare(String(a.installedAt)))
  }
  async function forgetEmptyDirs() {
    if (!store) return
    const p = await prefs(), keep = []
    for (const dir of p.extraDirs) if ((await installedIn(dir)).length && !keep.some(d => sameDir(d, dir, platform))) keep.push(dir)
    if (keep.length !== p.extraDirs.length) await store.update({ workshop: { ...p, extraDirs: keep } })
  }
  async function dirInfo() {
    const root = await currentRoot(), p = await prefs(), cfg = configured()
    const list = await installed()
    const extra = []
    for (const dir of (await roots()).slice(1)) extra.push({ dir, packs: (await installedIn(dir)).map(i => i.id) })
    return {
      dir: root, defaultDir: cfg ?? defaultRoot, source: fixedRoot ? 'fixed' : p.dir ? 'custom' : cfg ? 'config' : 'default',
      platform, packs: list.filter(i => sameDir(i.dir, root, platform)).length, extraDirs: extra,
    }
  }

  return {
    get root() { return fixedRoot ?? defaultRoot },
    currentRoot,
    async index({ refresh }) {
      const value = await index(refresh)
      return { ...value, installed: await installed(), source: sourceUrl(WORKSHOP_INDEX_URL, cached.source), downloadSource: cached.source }
    },
    installed: async () => ({ installed: await installed() }),
    async cover({ id }) {
      const value = await index(false)
      const entry = value.packs.find(p => p.id === id)
      if (!entry?.cover) return { id, found: false }
      const file = entry.files.find(f => f.path === entry.cover)
      const key = `${id}@${file.sha256}`
      if (!covers.has(key)) {
        const bytes = await download(workshopFileUrl(value.commit, id, file.path), Math.max(file.size, 1), { source: cached.source })
        if (bytes.length !== file.size) throw new Error('封面大小不符')
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
      const root = await currentRoot()
      await mkdir(root, { recursive: true })
      const temp = join(root, `.tmp-${id}-${randomBytes(4).toString('hex')}`)
      const route = { source: cached.source }
      try {
        for (const file of entry.files) {
          let bytes
          try { bytes = await download(workshopFileUrl(value.commit, id, file.path), Math.max(file.size, 1), route) }
          catch (error) { throw new Error(`安装「${id}」失败，文件 ${file.path}：${error.message}`, { cause: error }) }
          if (bytes.length !== file.size) throw new Error(`${file.path} 大小不符（索引 ${file.size}，下载 ${bytes.length}）`)
          if (sha256(bytes) !== file.sha256) throw new Error(`${file.path} 校验失败（sha256 与索引不符），已取消安装`)
          const target = join(temp, ...file.path.split('/'))
          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, bytes, { flag: 'wx' })
        }
        // Re-check the downloaded pack with the same rules as the workshop CI.
        const result = await validateWorkshopPack({ id, files: entry.files.map(f => ({ path: f.path, size: f.size })), readText: path => readFile(join(temp, ...path.split('/')), 'utf8'), readBytes: path => readFile(join(temp, ...path.split('/'))) })
        if (result.errors.length) throw new Error(`下载的包没有通过检查：\n${result.errors.join('\n')}`)
        await writeFile(join(temp, STATE_FILE), json({ id, version: entry.version, commit: value.commit, title: entry.title, artist: entry.artist, license: entry.license, author: entry.author, duration: entry.duration, installedAt: now().toISOString(), files: entry.files, source: WORKSHOP_REPO }))
        const dir = join(root, id)
        await rm(dir, { recursive: true, force: true })
        await rename(temp, dir)
        // An older copy kept in a previous install folder is replaced by this one.
        for (const old of (await roots()).slice(1)) { try { await stat(join(old, id, STATE_FILE)); await rm(join(old, id), { recursive: true, force: true }) } catch { /* not there */ } }
        await forgetEmptyDirs()
        return { id, version: entry.version, manifestPath: join(dir, 'mv.json'), files: entry.files.length, warnings: result.warnings, downloadSource: route.source }
      } catch (error) {
        await rm(temp, { recursive: true, force: true }).catch(() => {})
        throw error
      }
    },
    async uninstall({ id }) {
      const item = (await installed()).find(i => i.id === id)
      if (!item) throw new Error(`没有安装这个工坊包：${id}`)
      await rm(join(item.dir, id), { recursive: true, force: true })
      await forgetEmptyDirs()
      return { id, removed: true }
    },
    dirInfo,
    /** Change (or reset) the install folder. keep=false: the panel then moves the packs one by one (moveToCurrent). */
    async setDir({ dir, reset = false, keep = true }) {
      if (!store) throw new Error('这个安装位置是固定的，不能修改。')
      const previous = await currentRoot()
      const target = reset ? (configured() ?? defaultRoot) : normalizeWorkshopDir(dir, platform)
      if (insideDir(target, join(previous), platform) && !sameDir(target, previous, platform)) {
        const first = target.slice(previous.length + 1).split(/[\\/]/)[0]
        if ((await installedIn(previous)).some(i => i.id.toLowerCase() === first.toLowerCase()) || first.startsWith('.')) throw new Error('新位置不能放在某个已安装的包里面。')
      }
      if (insideDir(target, publishRoot, platform)) throw new Error('新位置不能是「发布到工坊」的临时文件夹。')
      await ensureWritableDir(target)
      const p = await prefs()
      const pending = sameDir(target, previous, platform) ? [] : (await installedIn(previous)).map(i => i.id)
      const extraDirs = [...p.extraDirs.filter(d => !sameDir(d, target, platform)), ...(pending.length ? [previous] : [])]
      await store.update({ workshop: { dir: reset ? null : target, extraDirs: extraDirs.filter((d, i) => extraDirs.findIndex(x => sameDir(x, d, platform)) === i) } })
      // Packs from every older folder can be moved, not only the one just left.
      const movable = []
      for (const d of extraDirs) for (const i of await installedIn(d)) if (!movable.some(m => m.id === i.id)) movable.push({ id: i.id, title: i.title, from: d })
      return { ...(await dirInfo()), previous, changed: !sameDir(target, previous, platform), keep, movable }
    },
    /** Move one installed pack from an older folder into the current one: copy, verify, then delete the old copy. */
    async moveToCurrent({ id }) {
      const root = await currentRoot()
      const item = (await installed()).find(i => i.id === id)
      if (!item) throw new Error(`没有安装这个工坊包：${id}`)
      if (sameDir(item.dir, root, platform)) return { id, moved: false, manifestPath: item.manifestPath, oldManifestPath: item.manifestPath }
      const source = join(item.dir, id), target = join(root, id)
      try { await stat(target); throw Object.assign(new Error(`新位置里已经有「${id}」文件夹，没有覆盖；请先处理它。`), { code: 'EXISTS' }) } catch (error) { if (error.code === 'EXISTS') throw error }
      await mkdir(root, { recursive: true })
      const temp = join(root, `.tmp-move-${id}-${randomBytes(4).toString('hex')}`)
      try {
        await cp(source, temp, { recursive: true, errorOnExist: true, force: false })
        // Verify the copy against the install record (sizes and sha256 of every pack file).
        const state = JSON.parse(await readFile(join(temp, STATE_FILE), 'utf8'))
        for (const file of Array.isArray(state.files) ? state.files : []) {
          const bytes = await readFile(join(temp, ...String(file.path).split('/')))
          if (bytes.length !== file.size || sha256(bytes) !== file.sha256) throw new Error(`复制后校验失败：${file.path}`)
        }
        await rename(temp, target)
      } catch (error) {
        await rm(temp, { recursive: true, force: true }).catch(() => {})
        throw new Error(`无法移动「${id}」：${error?.message ?? error}（原来的文件没有删除）`)
      }
      let warning = ''
      try { await rm(source, { recursive: true, force: true }) } catch (error) { warning = `已复制到新位置，但旧文件夹删除失败：${source}（${error?.message ?? error}）` }
      await forgetEmptyDirs()
      return { id, moved: true, manifestPath: join(target, 'mv.json'), oldManifestPath: item.manifestPath, ...(warning ? { warning } : {}) }
    },
    async openDir() {
      const root = await currentRoot()
      await mkdir(root, { recursive: true })
      open(root)
      return { dir: root, opened: true }
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

function packReadme({ title, artist, author, license, description, credits, hasLyrics, lyricsLicense, lyricsCredit, lyricsSource, hasTiming, duration }) {
  return `# ${title}${artist ? ` — ${artist}` : ''}

${description || 'A canvas MV for DeepSeek Harness · MV 放映室 (dsh-mv).'}

- Author / 作者: ${author}
- License / 许可: ${license}
- Song length / 歌曲时长: ${duration ? `${Math.round(duration * 10) / 10} s` : 'unknown'}
${(credits ?? []).map(line => `- ${line}`).join('\n')}

## How to play / 如何播放

This pack contains **no audio**. Install it from 创意工坊 in the MV 放映室 panel, then choose
your own copy of the song. ${hasLyrics ? 'Included lyrics and translations load automatically.' : hasTiming ? 'Choose a local lyrics file to match the included timing hashes.' : 'This visual pack has no lyric track.'}

本包**不含音频**。在 MV 放映室的「创意工坊」安装后，选择你自己的歌曲文件即可播放。${hasLyrics ? '歌词和译文随包安装并自动加载。' : hasTiming ? '本包只有歌词时间轴，需另选本地歌词文件。' : '本视觉包没有歌词轨。'}
Song rights belong to their owners. 歌曲版权归原作者所有。
${hasLyrics ? `\n## Lyrics / 歌词\n\n- License / 使用条款: ${lyricsLicense}\n- Credit / 署名: ${lyricsCredit}\n${lyricsSource ? `- Source / 来源: ${lyricsSource}\n` : ''}\nThe pack's code license does not replace the separate lyric terms. 歌词使用条款独立于代码许可。\n` : ''}
`
}

/** Build a complete non-audio pack. Lyrics are parsed as static data, never executed. */
export async function preparePublish(request, { publishRoot, now = () => new Date(), load = loadPack, readText = p => readFile(p, 'utf8'), readBytes = p => readFile(p) }) {
  const { manifestPath, packDir, pack } = await load(request.manifestPath)
  const raw = JSON.parse(await readText(manifestPath))
  const files = new Map()
  const assetEntries = []
  const assetErrors = []
  const copiedAssets = new Set()
  // Carry the notices required by bundled libraries/adapted code. Do not crawl
  // arbitrary user files; only this explicit root-level provenance allow-list.
  for (const name of ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'NOTICE.md', 'LYRICS-NOTICE.md', 'source-provenance.json']) {
    try {
      const path = join(packDir, name), entry = await stat(path)
      if (!entry.isFile()) continue
      if (entry.size > WORKSHOP_LIMITS.fileBytes) { assetErrors.push(`${name} 太大（上限 512 KiB）`); continue }
      // Workshop accepts .txt/.md, not extensionless LICENSE.
      const target = name === 'LICENSE' ? 'LICENSE.original.txt' : name
      files.set(target, await readText(path))
    } catch (error) { if (error.code !== 'ENOENT') assetErrors.push(`无法保留 ${name}：${error.message}`) }
  }
  const scriptPath = pack.canvas?.renderer === 'script' ? (isAbsolutePackPath(pack.canvas.script) ? 'scenes.js' : pack.canvas.script) : null
  const stripped = []
  if (raw.audio !== undefined) stripped.push('audio（音频不会上传）')
  let timing = null
  let lyrics = null, spectrum = null
  const originalWorkshop = raw['x-dsh-mv-workshop'] ?? {}
  const lyricsLicense = request.lyricsLicense || originalWorkshop.lyricsLicense || ''
  const lyricsCredit = request.lyricsCredit || originalWorkshop.lyricsCredit || ''
  const lyricsSource = request.lyricsSource || originalWorkshop.lyricsSource || ''
  if (pack.lyrics?.file) {
    try {
      const path = packFilePath(packDir, pack.lyrics.file)
      const cues = parseLyrics(path, await readText(path), { duration: pack.duration ?? 1e9 })
      if (!cues.length) throw new Error('没有可发布的带时间歌词')
      lyrics = { file: 'lyrics.workshop.json', offset: pack.lyrics.offset ?? 0 }
      files.set(lyrics.file, json(cues))
      const shift = pack.lyrics.offset ?? 0
      timing = lyricsTiming(cues.map(c => ({ ...c, time: c.time + shift, end: c.end + shift, words: c.words?.map(w => ({ ...w, time: w.time + shift })) })))
    } catch (error) { assetErrors.push(`无法保留歌词：${error?.message ?? error}`) }
  } else if (pack.workshop?.lyricsTiming) {
    try { timing = JSON.parse(await readText(packFilePath(packDir, pack.workshop.lyricsTiming))) }
    catch (error) { assetErrors.push(`无法保留原有歌词时间轴：${error?.message ?? error}`) }
  }
  if (pack.spectrum?.file) {
    try {
      const value = JSON.parse(await readText(packFilePath(packDir, pack.spectrum.file)))
      spectrum = { file: 'spectrum.workshop.json' }
      files.set(spectrum.file, json(value))
    } catch (error) { assetErrors.push(`无法保留频谱数据：${error?.message ?? error}`) }
  }
  if (pack.canvas?.renderer === 'script') {
    const source = await readText(packFilePath(packDir, pack.canvas.script))
    files.set(scriptPath, source)
  }
  for (const name of Object.keys(pack.canvas?.assets ?? {})) {
    for (const ref of assetParts(pack, name)) {
      if (isAbsolutePackPath(ref)) {
        assetErrors.push(`canvas.assets.${name} 只能用包内的相对路径：${ref}`)
        continue
      }
      if (copiedAssets.has(ref)) continue
      copiedAssets.add(ref)
      try {
        assetEntries.push({ path: ref, bytes: Buffer.from(await readBytes(packFilePath(packDir, ref))) })
      } catch (error) {
        assetErrors.push(`canvas.assets.${name} 无法读取 ${ref}：${error?.message ?? String(error)}`)
      }
    }
  }
  // Preserve companion attribution, not arbitrary files or hidden audio.
  for (const parent of new Set([...copiedAssets].map(ref => dirname(ref)).filter(dir => dir !== '.'))) {
    for (const name of ['NOTICE.md', 'LICENSE.txt', 'LICENSE.md', ...(parent.replace(/\\/g, '/') === 'fonts' ? ['OFL_spacemono.txt', 'OFL_anton.txt'] : [])]) {
      const ref = `${parent.replace(/\\/g, '/')}/${name}`
      try {
        const path = packFilePath(packDir, ref), entry = await stat(path)
        if (!entry.isFile()) continue
        if (entry.size > WORKSHOP_LIMITS.fileBytes) { assetErrors.push(`${ref} 太大`); continue }
        if (!files.has(ref)) files.set(ref, await readText(path))
      } catch (error) { if (error.code !== 'ENOENT') assetErrors.push(`无法保留 ${ref}：${error.message}`) }
    }
  }
  const duration = request.duration ?? pack.duration ?? null
  const manifest = { ...raw }
  delete manifest.audio; delete manifest.lyrics; delete manifest.spectrum; delete manifest.$schema; delete manifest.terminal
  if (lyrics) manifest.lyrics = lyrics
  if (spectrum) manifest.spectrum = spectrum
  if (pack.canvas) manifest.canvas = { ...raw.canvas, ...(scriptPath ? { renderer: 'script', script: scriptPath } : {}), ...(pack.canvas.assets ? { assets: pack.canvas.assets } : {}) }
  if (duration) manifest.duration = Math.round(duration * 1000) / 1000
  const ai = raw['x-dsh-mv-ai']
  if (ai) { delete manifest['x-dsh-mv-ai']; if (Array.isArray(ai.sections) && ai.sections.length) manifest['x-dsh-mv-ai'] = { sections: ai.sections } }
  manifest.notice = [raw.notice, 'Workshop pack: no audio included. Licensed lyrics and declared visual/data resources are included when present. 工坊包不含音频；已授权歌词与声明的画面/数据资源随包提供。'].filter(Boolean).join('\n')
  manifest['x-dsh-mv-workshop'] = {
    id: request.id, version: request.version, license: request.license, author: request.author,
    ...(request.description ? { description: request.description } : {}), ...(request.tags.length ? { tags: request.tags } : {}), ...(request.homepage ? { homepage: request.homepage } : {}),
    audio: { ...(duration ? { duration: Math.round(duration * 1000) / 1000 } : {}), ...(request.fingerprint ? { fingerprint: { kind: FINGERPRINT_KIND, values: request.fingerprint } } : {}) },
    ...(timing ? { lyricsTiming: WORKSHOP_TIMING_FILE } : {}),
    ...(lyrics ? { lyricsLicense, lyricsCredit, ...(lyricsSource ? { lyricsSource } : {}) } : {}),
    ...(pack.canvas?.renderer === 'dsh-pv' && (pack.canvas.assets?.['font-head'] || pack.canvas.assets?.['font-banner']) ? {
      fontsLicense: originalWorkshop.fontsLicense, fontsCredit: originalWorkshop.fontsCredit, fontsNotice: originalWorkshop.fontsNotice,
    } : {}),
    ...(raw['x-dsh-mv-workshop']?.source ? { source: raw['x-dsh-mv-workshop'].source } : {}),
    ...(packRequires(pack, raw['x-dsh-mv-workshop']?.requires) ? { requires: packRequires(pack, raw['x-dsh-mv-workshop']?.requires) } : {}),
    publishedAt: now().toISOString().slice(0, 10),
  }
  files.set('mv.json', json(manifest))
  if (timing) files.set(WORKSHOP_TIMING_FILE, json(timing))
  files.set('README.md', packReadme({ title: pack.title, artist: pack.artist, author: request.author, license: request.license, description: request.description, credits: pack.credits, hasLyrics: Boolean(lyrics), lyricsLicense, lyricsCredit, lyricsSource, hasTiming: Boolean(timing), duration }))
  try {
    const path = join(packDir, 'README.md'), entry = await stat(path)
    if (entry.isFile()) {
      if (entry.size > WORKSHOP_LIMITS.fileBytes) assetErrors.push('原 README.md 太大（上限 512 KiB）')
      else files.set('README.md', `${files.get('README.md')}\n## Original pack documentation / 原包说明\n\n${await readText(path)}`)
    }
  } catch (error) { if (error.code !== 'ENOENT') assetErrors.push(`无法保留 README.md：${error.message}`) }
  let cover = null
  if (request.coverPng) cover = { name: 'cover.png', bytes: Buffer.from(request.coverPng, 'base64') }
  else {
    for (const name of COVER_NAMES) {
      try { const bytes = await readFile(join(packDir, name)); cover = { name, bytes }; break } catch { /* next */ }
    }
  }
  if (cover && cover.name === 'cover.png' && !cover.bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) cover = null
  const entries = [...files].map(([path, text]) => ({ path, bytes: Buffer.from(text, 'utf8') }))
  const entryPaths = new Set(entries.map(entry => entry.path))
  for (const entry of assetEntries) {
    if (entryPaths.has(entry.path)) {
      // An asset may name the scene itself. It is already copied, byte for byte.
      if (entries.find(e => e.path === entry.path)?.bytes.equals(entry.bytes)) continue
      assetErrors.push(`canvas.assets 的文件路径与发布文件冲突：${entry.path}`)
      continue
    }
    entries.push(entry)
    entryPaths.add(entry.path)
  }
  // A source cover may also be a canvas asset. Keep the asset bytes in that case
  // so the published manifest still refers to exactly the file it was authored with.
  if (cover && !entryPaths.has(cover.name)) entries.push({ path: cover.name, bytes: cover.bytes })
  const result = await validateWorkshopPack({ id: request.id, files: entries.map(e => ({ path: e.path, size: e.bytes.length })), readText: async path => entries.find(e => e.path === path).bytes.toString('utf8'), readBytes: async path => entries.find(e => e.path === path).bytes })
  const dir = join(publishRoot, request.id, 'packs', request.id)
  const errors = [...assetErrors, ...result.errors]
  if (!errors.length) {
    await rm(join(publishRoot, request.id), { recursive: true, force: true })
    await mkdir(dir, { recursive: true })
    for (const entry of entries) {
      const target = join(dir, ...entry.path.split('/'))
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, entry.bytes)
    }
  }
  return {
    ok: errors.length === 0, id: request.id, dir: errors.length ? null : dir,
    files: entries.map(e => ({ path: e.path, size: e.bytes.length, sha256: sha256(e.bytes) })),
    errors, warnings: [...new Set(result.warnings)], stripped,
    timingLines: timing?.lines.length ?? 0, lyricLines: lyrics ? timing?.lines.length ?? 0 : 0, links: publishLinks(request.id),
    prTitle: `Add pack: ${pack.title}${pack.artist ? ` — ${pack.artist}` : ''} (${request.id})`,
    prBody: [
      `Pack: \`packs/${request.id}/\` · version ${request.version} · license ${request.license} · author ${request.author}`,
      '',
      '- [x] No audio (lyrics, translations and visual/data resources are retained when declared)',
      ...(lyrics ? [`- [ ] I have the right to share lyrics under ${lyricsLicense}, credited to ${lyricsCredit}`] : []),
      '- [x] Scene script passes the static sandbox checks',
      `- [ ] I have the right to share this pack under ${request.license} (confirm before submitting)`,
    ].join('\n'),
  }
}
