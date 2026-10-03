/**
 * LRCLIB lyrics lookup (https://lrclib.net). Sends only track name, artist,
 * album and duration — never audio. HTTPS through the proxy in HTTPS_PROXY /
 * HTTP_PROXY (or the plugin setting) when one is set, using a CONNECT tunnel.
 */
import https from 'node:https'
import http from 'node:http'
import tls from 'node:tls'
import { LRCLIB_FIELDS, parseLyricsLookup } from './mv-calib-protocol.mjs'

export { LRCLIB_FIELDS, parseLyricsLookup }

export const LRCLIB_BASE = 'https://lrclib.net'
/** Query URLs for a lookup: exact /api/get first, then /api/search. */
export function lrclibUrls({ title, artist, album, duration }) {
  const urls = []
  if (artist && duration) {
    const q = new URLSearchParams({ track_name: title, artist_name: artist, ...(album ? { album_name: album } : {}), duration: String(Math.round(duration)) })
    urls.push({ kind: 'get', url: `${LRCLIB_BASE}/api/get?${q}` })
  }
  const search = new URLSearchParams(artist ? { track_name: title, artist_name: artist } : { q: title })
  urls.push({ kind: 'search', url: `${LRCLIB_BASE}/api/search?${search}` })
  if (artist) urls.push({ kind: 'search', url: `${LRCLIB_BASE}/api/search?${new URLSearchParams({ q: `${artist} ${title}` })}` })
  return urls
}

const norm = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

/** Pick the best record: duration within 4 s (when known), synced first, then title match. */
export function pickLrclib(records, { title = '', duration = null } = {}) {
  const usable = (records ?? []).filter(r => r && !r.instrumental && (r.syncedLyrics || r.plainLyrics))
  const scored = usable.map(r => {
    const diff = duration && Number.isFinite(r.duration) ? Math.abs(r.duration - duration) : null
    let score = 0
    if (diff !== null) score += diff <= 2 ? 30 : diff <= 4 ? 18 : diff <= 10 ? 4 : -30
    if (r.syncedLyrics) score += 20
    if (norm(r.trackName) === norm(title)) score += 10
    else if (norm(r.trackName).includes(norm(title)) || norm(title).includes(norm(r.trackName))) score += 4
    return { r, score, diff }
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score)
  return scored[0] ? { ...scored[0].r, durationDiff: scored[0].diff } : null
}

export function proxyFromEnv(env = process.env, configured = '') {
  const value = String(configured || env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || '').trim()
  if (!value) return null
  const noProxy = String(env.NO_PROXY || env.no_proxy || '')
  if (/(^|,)\s*(\*|\.?lrclib\.net)\s*(,|$)/i.test(noProxy)) return null
  try { const url = new URL(/^[a-z]+:\/\//i.test(value) ? value : `http://${value}`); return url.protocol === 'http:' ? url : null } catch { return null }
}

/** CONNECT tunnel through an HTTP proxy → a TLS socket to host:443. */
export function tunnel(proxy, host, { timeoutMs = 12_000, connectRequest = http.request } = {}) {
  return new Promise((resolve, reject) => {
    const headers = { Host: `${host}:443` }
    if (proxy.username) headers['Proxy-Authorization'] = `Basic ${Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64')}`
    const req = connectRequest({ host: proxy.hostname, port: Number(proxy.port || 80), method: 'CONNECT', path: `${host}:443`, headers, timeout: timeoutMs })
    req.once('connect', (res, socket) => {
      if (res.statusCode !== 200) { socket.destroy(); reject(new Error(`代理拒绝连接：HTTP ${res.statusCode}`)); return }
      const secure = tls.connect({ socket, servername: host })
      secure.once('secureConnect', () => resolve(secure))
      secure.once('error', reject)
    })
    req.once('timeout', () => req.destroy(new Error('代理连接超时')))
    req.once('error', reject)
    req.end()
  })
}

/** GET a JSON URL (status 200 → value, 404 → null). */
export async function getJson(url, { proxy = null, timeoutMs = 12_000, userAgent = 'dsh-mv-cli', request = https.request } = {}) {
  const target = new URL(url)
  const options = { method: 'GET', headers: { 'User-Agent': userAgent, Accept: 'application/json' }, timeout: timeoutMs }
  if (proxy) {
    const socket = await tunnel(proxy, target.hostname, { timeoutMs })
    options.createConnection = () => socket
    options.agent = false
  }
  return new Promise((resolve, reject) => {
    const req = request(target, options, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        if (res.statusCode === 404) return resolve(null)
        if (res.statusCode !== 200) return reject(new Error(`LRCLIB 返回 ${res.statusCode}`))
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch (error) { reject(error) }
      })
    })
    req.on('timeout', () => req.destroy(new Error('LRCLIB 请求超时')))
    req.on('error', reject)
    req.end()
  })
}

export function createLrclibClient({ get = getJson, env = process.env, proxy = () => '', userAgent = 'dsh-mv-cli' } = {}) {
  return {
    async lookup(query) {
      const sent = { title: query.title, artist: query.artist, album: query.album, duration: query.duration ? Math.round(query.duration) : null }
      const options = { proxy: proxyFromEnv(env, proxy()), userAgent }
      const tried = []
      for (const { kind, url } of lrclibUrls(query)) {
        tried.push(kind)
        const value = await get(url, options)
        const records = kind === 'get' ? (value ? [value] : []) : Array.isArray(value) ? value : []
        const best = pickLrclib(records, query)
        if (best) {
          return { found: true, via: kind, sent, id: best.id, trackName: best.trackName, artistName: best.artistName, albumName: best.albumName, duration: best.duration, durationDiff: best.durationDiff, synced: best.syncedLyrics || '', plain: best.plainLyrics || '', candidates: records.length }
        }
      }
      return { found: false, sent, tried }
    },
  }
}
