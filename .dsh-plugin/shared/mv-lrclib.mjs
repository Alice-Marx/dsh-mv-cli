/**
 * LRCLIB lyrics lookup (https://lrclib.net). Sends only track name, artist,
 * album and duration — never audio. HTTPS through the proxy in HTTPS_PROXY /
 * HTTP_PROXY (or the plugin setting) when one is set, using a CONNECT tunnel.
 */
import https from 'node:https'
import http from 'node:http'
import tls from 'node:tls'
import { isIP } from 'node:net'
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

const networkError = (message, code, details = {}) => Object.assign(new Error(message), { code, ...details })

function targetAuthority(target) {
  const value = String(target || 'lrclib.net').trim()
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`)
    return { hostname: url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, ''), port: url.port || (url.protocol === 'http:' ? '80' : '443') }
  } catch { throw networkError('下载目标地址无效', 'ERR_PROXY_TARGET') }
}

/** NO_PROXY uses exact hosts or domain suffixes, optionally restricted to a port. */
export function bypassProxy(target, noProxy = '') {
  const { hostname, port } = targetAuthority(target)
  return String(noProxy).split(/[\s,]+/).filter(Boolean).some(entry => {
    if (entry === '*') return true
    let name = entry.toLowerCase(), matchPort = ''
    const ipv6 = /^\[([^\]]+)\](?::(\d+))?$/.exec(name)
    if (ipv6) { name = ipv6[1]; matchPort = ipv6[2] || '' }
    else {
      const authority = /^([^:]+):(\d+)$/.exec(name)
      if (authority) { name = authority[1]; matchPort = authority[2] }
    }
    name = name.replace(/^\*?\./, '').replace(/\.$/, '')
    return (!matchPort || matchPort === port) && !!name && (hostname === name || (!isIP(hostname) && hostname.endsWith(`.${name}`)))
  })
}

export function proxyFromEnv(env = process.env, configured = '', target = 'lrclib.net') {
  const value = String(configured || env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || '').trim()
  if (!value) return null
  const noProxy = String(env.NO_PROXY || env.no_proxy || '')
  if (bypassProxy(target, noProxy)) return null
  let url
  try { url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `http://${value}`) }
  catch { throw networkError('代理地址无效；请使用 http://主机:端口', 'ERR_PROXY_URL') }
  if (url.protocol !== 'http:') throw networkError(`不支持 ${url.protocol} 代理；目前只支持 http:// 代理，HTTPS 下载通过 CONNECT 加密隧道`, 'ERR_PROXY_PROTOCOL')
  if (!url.hostname || url.pathname !== '/' || url.search || url.hash) throw networkError('代理地址无效；只能包含主机、端口及可选的代理认证', 'ERR_PROXY_URL')
  return url
}

/** CONNECT tunnel through an HTTP proxy → a TLS socket to host:443. */
export function tunnel(proxy, host, { timeoutMs = 12_000, targetPort = 443, connectRequest = http.request, tlsConnect = tls.connect } = {}) {
  return new Promise((resolve, reject) => {
    let req, socket, secure, timer, settled = false, phase = 'connect'
    const budget = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12_000
    const fail = error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      secure?.destroy()
      socket?.destroy()
      req?.destroy()
      reject(error)
    }
    const deadline = () => {
      clearTimeout(timer)
      timer = setTimeout(() => fail(networkError(phase === 'tls' ? '代理隧道的 TLS 握手超时' : '代理 CONNECT 连接超时', 'ETIMEDOUT', { phase })), budget)
    }
    try {
      if (proxy.protocol !== 'http:') throw networkError('目前只支持 http:// CONNECT 代理', 'ERR_PROXY_PROTOCOL')
      const authority = `${host.includes(':') && !host.startsWith('[') ? `[${host}]` : host}:${targetPort}`
      const headers = { Host: authority }
      if (proxy.username) headers['Proxy-Authorization'] = `Basic ${Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64')}`
      req = connectRequest({ host: proxy.hostname, port: Number(proxy.port || 80), method: 'CONNECT', path: authority, headers, timeout: budget })
      deadline()
      req.once('connect', (res, connection, head) => {
        socket = connection
        if (settled) { socket.destroy(); return }
        if (res.statusCode !== 200) { fail(networkError(`代理拒绝连接：HTTP ${res.statusCode}`, 'ERR_PROXY_CONNECT', { statusCode: res.statusCode })); return }
        phase = 'tls'
        deadline()
        try {
          // CONNECT may have consumed the start of the TLS stream with its headers.
          if (head?.length) socket.unshift(head)
          secure = tlsConnect({ socket, servername: host })
          secure.once('secureConnect', () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            resolve(secure)
          })
          secure.once('error', fail)
          secure.once('close', () => { if (!settled) fail(networkError('TLS 握手完成前代理连接被关闭', 'ECONNRESET', { phase: 'tls' })) })
        } catch (error) { fail(error) }
      })
      req.once('timeout', () => { if (phase === 'connect') fail(networkError('代理 CONNECT 连接超时', 'ETIMEDOUT', { phase })) })
      req.once('error', fail)
      req.once('close', () => { if (!settled && phase === 'connect') fail(networkError('代理 CONNECT 完成前连接被关闭', 'ECONNRESET', { phase })) })
      req.end()
    } catch (error) { fail(error) }
  })
}

/** GET a JSON URL (status 200 → value, 404 → null). */
export async function getJson(url, { proxy = null, timeoutMs = 12_000, userAgent = 'dsh-mv-cli', request = https.request, connectTunnel = tunnel } = {}) {
  const target = new URL(url)
  if (target.protocol !== 'https:') throw new Error('只允许 https 下载')
  const budget = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12_000
  const options = { method: 'GET', defaultPort: 443, headers: { 'User-Agent': userAgent, Accept: 'application/json' }, timeout: budget }
  let socket
  if (proxy) {
    socket = await connectTunnel(proxy, target.hostname, { timeoutMs: budget, targetPort: Number(target.port || 443) })
    options.createConnection = () => socket
    // agent:false creates a new Agent and ignores createConnection in Node.
    // Omitting it makes ClientRequest consume this already-verified TLS socket.
  }
  return new Promise((resolve, reject) => {
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
        const chunks = []
        res.on('data', chunk => chunks.push(chunk))
        res.once('error', error => finish(error))
        res.once('aborted', () => finish(networkError('LRCLIB 响应中断', 'ECONNRESET')))
        res.once('end', () => {
          if (res.complete === false) return finish(networkError('LRCLIB 响应不完整', 'ECONNRESET'))
          if (res.statusCode === 404) return finish(null, null)
          if (res.statusCode !== 200) return finish(new Error(`LRCLIB 返回 ${res.statusCode}`))
          try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch (error) { finish(error) }
        })
        res.once('close', () => { if (!settled && res.complete === false) finish(networkError('LRCLIB 响应中断', 'ECONNRESET')) })
      })
      if (!settled) timer = setTimeout(() => finish(networkError('LRCLIB 请求超时', 'ETIMEDOUT')), budget)
      req.once('timeout', () => finish(networkError('LRCLIB 请求超时', 'ETIMEDOUT')))
      req.once('error', error => finish(error))
      req.end()
    } catch (error) { finish(error) }
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
