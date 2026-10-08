import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  WORKSHOP_INDEX_FORMAT, WORKSHOP_INDEX_URL, workshopFileUrl,
} from '../.dsh-plugin/shared/mv-workshop.mjs'
import {
  createWorkshopManager, getBytes, getBytesWithRetry, workshopMirrorUrl,
} from '../.dsh-plugin/shared/mv-workshop-host.mjs'

const MIRROR = 'https://raw.giteeusercontent.com/tester/dsh-mv-workshop/raw'
const ID = 'network-example'
const COMMIT = 'a'.repeat(40)
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const failure = (code, message = code, extra = {}) => Object.assign(new Error(message), { code, ...extra })
const noSleep = async () => {}

async function temporaryRoot(t) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-mv-network-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

function fixture({ version = '1.0.0', commit = COMMIT } = {}) {
  const manifest = {
    format: 'dsh-mv-pack', version: 1, title: 'Network fixture', duration: 10,
    canvas: { renderer: 'generic' },
    'x-dsh-mv-workshop': { id: ID, version, license: 'MIT', author: 'tester' },
  }
  const files = {
    'mv.json': Buffer.from(JSON.stringify(manifest)),
    'README.md': Buffer.from('# Network fixture\nNo music is included.\n'),
    'note.txt': Buffer.from('Synthetic non-audio resource.\n'),
  }
  const index = {
    format: WORKSHOP_INDEX_FORMAT, version: 1, commit,
    generated: '2026-10-08T00:00:00Z',
    packs: [{
      id: ID, title: manifest.title, artist: 'tester', author: 'tester',
      license: 'MIT', version, duration: 10, renderer: 'generic',
      files: Object.entries(files).map(([path, bytes]) => ({ path, size: bytes.length, sha256: digest(bytes) })),
    }],
  }
  const indexBytes = Buffer.from(JSON.stringify(index))
  const bytesAt = url => {
    if (url === WORKSHOP_INDEX_URL || url === `${MIRROR}/main/index.json`) return indexBytes
    const path = url.split(`/${commit}/packs/${ID}/`)[1]
    if (path && files[path]) return files[path]
    throw failure('ERR_HTTP_STATUS', `HTTP 404: ${new URL(url).pathname}`, { statusCode: 404 })
  }
  return { files, index, indexBytes, bytesAt, commit }
}

function rejectMirrorUrl(base, original) {
  let result
  try { result = workshopMirrorUrl(base, original) } catch { return }
  assert.ok(!result, `Unsafe mirror mapping was accepted: ${base} / ${original}`)
}

test('mirror maps only the official workshop raw URL, preserving the complete commit and encoded path', () => {
  const original = workshopFileUrl(COMMIT, ID, 'data/some-file.json')
  assert.equal(workshopMirrorUrl(MIRROR, original), `${MIRROR}/${COMMIT}/packs/${ID}/data/some-file.json`)
  assert.equal(workshopMirrorUrl(`${MIRROR}/`, WORKSHOP_INDEX_URL), `${MIRROR}/main/index.json`)
  assert.equal(workshopMirrorUrl(MIRROR, `${WORKSHOP_INDEX_URL.replace('/index.json', '/files/a%20b.json')}`), `${MIRROR}/main/files/a%20b.json`)
  for (const base of [
    '', 'not-a-url', 'http://mirror.example/files',
    'https://user:password@mirror.example/files',
    'https://mirror.example/files?token=secret', 'https://mirror.example/files#fragment',
  ]) rejectMirrorUrl(base, original)
  for (const url of [
    'http://raw.githubusercontent.com/Alice-Marx/dsh-mv-workshop/main/index.json',
    'https://raw.githubusercontent.com/other/dsh-mv-workshop/main/index.json',
    'https://raw.githubusercontent.com/Alice-Marx/other-workshop/main/index.json',
    'https://raw.githubusercontent.com.evil.example/Alice-Marx/dsh-mv-workshop/main/index.json',
    'https://user:password@raw.githubusercontent.com/Alice-Marx/dsh-mv-workshop/main/index.json',
    `${WORKSHOP_INDEX_URL}?token=secret`, `${WORKSHOP_INDEX_URL}#fragment`,
  ]) rejectMirrorUrl(MIRROR, url)
})

test('temporary network failures and retryable HTTP statuses get at most three attempts', async () => {
  const cases = [
    failure('ECONNRESET'), failure('ETIMEDOUT'), failure('ECONNREFUSED'),
    failure('ERR_PROXY_CONNECT', 'Proxy returned 502', { statusCode: 502 }),
    ...[408, 429, 500, 502, 503, 504].map(statusCode => failure('ERR_HTTP_STATUS', `HTTP ${statusCode}`, { statusCode })),
  ]
  for (const error of cases) {
    const calls = [], sleeps = []
    await assert.rejects(getBytesWithRetry(WORKSHOP_INDEX_URL, { proxy: null, maxBytes: 100 }, {
      get: async (url, options) => { calls.push({ url, options }); throw error },
      sleep: async ms => { sleeps.push(ms) },
    }), caught => caught === error)
    assert.equal(calls.length, 3, error.message)
    assert.equal(sleeps.length, 2, error.message)
    assert.ok(sleeps.every(ms => Number.isFinite(ms) && ms >= 0))
    assert.ok(calls.every(call => call.url === WORKSHOP_INDEX_URL && call.options.maxBytes === 100 && call.options.proxy === null))
  }
})

test('retry stops after success, respects zero retries, and clamps excessive retry requests', async () => {
  let calls = 0
  const result = await getBytesWithRetry(WORKSHOP_INDEX_URL, {}, {
    get: async () => { if (++calls < 2) throw failure('ECONNRESET'); return Buffer.from('ok') },
    sleep: noSleep,
  })
  assert.equal(result.toString(), 'ok')
  assert.equal(calls, 2)
  for (const [retries, expected] of [[0, 1], [99, 3]]) {
    calls = 0
    await assert.rejects(getBytesWithRetry(WORKSHOP_INDEX_URL, {}, {
      get: async () => { calls++; throw failure('ECONNRESET') }, retries, sleep: noSleep,
    }), /ECONNRESET/)
    assert.equal(calls, expected)
  }
})

test('certificate errors, content limits, validation failures and non-retryable HTTP statuses are not retried', async () => {
  for (const error of [
    failure('CERT_HAS_EXPIRED'), failure('DEPTH_ZERO_SELF_SIGNED_CERT'),
    failure('UNABLE_TO_VERIFY_LEAF_SIGNATURE'), failure('ERR_TLS_CERT_ALTNAME_INVALID'),
    failure('ERR_DOWNLOAD_SIZE', 'Download content exceeds limit'),
    failure('ERR_WORKSHOP_HASH', 'SHA-256 mismatch'),
    failure('ERR_HTTP_STATUS', 'HTTP 404', { statusCode: 404 }),
    failure('ERR_HTTP_STATUS', 'HTTP 401', { statusCode: 401 }),
    failure('ERR_PROXY_CONNECT', 'Proxy authentication required', { statusCode: 407 }),
  ]) {
    let calls = 0, sleeps = 0
    await assert.rejects(getBytesWithRetry(WORKSHOP_INDEX_URL, {}, {
      get: async () => { calls++; throw error }, sleep: async () => { sleeps++ },
    }), caught => caught === error)
    assert.equal(calls, 1, error.code)
    assert.equal(sleeps, 0, error.code)
  }
})

// Synthetic HTTPS request/response: no server, DNS, TLS or external network.
function requestFixture({ statusCode = 200, headers = {}, chunks = [Buffer.from('ok')], timeout = false, responseError = null, aborted = false, complete } = {}) {
  return (url, options, respond) => {
    const req = new EventEmitter()
    req.destroyed = false
    req.destroy = error => { req.destroyed = true; if (error) queueMicrotask(() => req.emit('error', error)); return req }
    req.end = () => queueMicrotask(() => {
      if (timeout) { req.emit('timeout'); return }
      const res = new EventEmitter()
      res.statusCode = statusCode
      res.headers = headers
      res.complete = complete
      res.resume = () => {}
      res.destroy = () => { req.destroyed = true }
      respond(res)
      for (const chunk of chunks) { if (req.destroyed) return; res.emit('data', chunk) }
      if (responseError) res.emit('error', responseError)
      else if (aborted) res.emit('aborted')
      else if (!req.destroyed) res.emit('end')
    })
    return req
  }
}

test('byte downloader enforces limits and produces retry-classifiable HTTP and timeout errors', async () => {
  assert.equal((await getBytes(WORKSHOP_INDEX_URL, { request: requestFixture(), maxBytes: 2 })).toString(), 'ok')
  await assert.rejects(getBytes(WORKSHOP_INDEX_URL, {
    request: requestFixture({ chunks: [Buffer.from('ok'), Buffer.from('!')] }), maxBytes: 2,
  }), error => error.code === 'ERR_DOWNLOAD_SIZE')
  await assert.rejects(getBytes(WORKSHOP_INDEX_URL, {
    request: requestFixture({ statusCode: 503 }),
  }), error => error.statusCode === 503)
  await assert.rejects(getBytes(WORKSHOP_INDEX_URL, {
    request: requestFixture({ timeout: true }),
  }), error => error.code === 'ETIMEDOUT')
})

test('response errors, aborts and incomplete content are classified as failures rather than partial successes', async () => {
  const error = failure('ECONNRESET', 'Response connection reset')
  await assert.rejects(getBytes(WORKSHOP_INDEX_URL, {
    request: requestFixture({ responseError: error }),
  }), caught => caught === error)
  for (const options of [{ aborted: true }, { complete: false }]) {
    await assert.rejects(getBytes(WORKSHOP_INDEX_URL, { request: requestFixture(options) }), caught => caught.code === 'ECONNRESET')
  }
})

test('the downloader follows the official Gitee raw redirect but rejects unrelated or insecure targets', async () => {
  const original = `https://gitee.com/tester/dsh-mv-workshop/raw/${COMMIT}/index.json`
  const redirect = `${MIRROR}/${COMMIT}/index.json`
  const calls = []
  const request = (url, options, respond) => {
    calls.push(String(url))
    return requestFixture(String(url) === original ? { statusCode: 302, headers: { location: redirect } } : {})(url, options, respond)
  }
  assert.equal((await getBytes(original, { request })).toString(), 'ok')
  assert.deepEqual(calls, [original, redirect])
  for (const location of [
    'http://raw.giteeusercontent.com/tester/file',
    'https://untrusted.example/file',
    'https://raw.giteeusercontent.com.evil.example/file',
    'https://user:password@raw.giteeusercontent.com/tester/file',
  ]) {
    let count = 0
    await assert.rejects(getBytes(original, {
      request: (...args) => { count++; return requestFixture({ statusCode: 302, headers: { location } })(...args) },
    }), error => error.code === 'ERR_DOWNLOAD_REDIRECT')
    assert.equal(count, 1, location)
  }
})

test('proxy tunnel connection is used and cleaned up without creating a competing default Agent', async () => {
  const proxy = new URL('http://127.0.0.1:7897'), socket = { destroyed: 0, destroy() { this.destroyed++ } }
  let tunnelOptions, requestOptions
  const bytes = await getBytes(WORKSHOP_INDEX_URL, {
    proxy,
    connectTunnel: async (receivedProxy, host, options) => {
      assert.equal(receivedProxy, proxy)
      assert.equal(host, 'raw.githubusercontent.com')
      tunnelOptions = options
      return socket
    },
    request: (url, options, respond) => {
      requestOptions = options
      assert.equal(options.createConnection(), socket)
      return requestFixture()(url, options, respond)
    },
  })
  assert.equal(bytes.toString(), 'ok')
  assert.equal(tunnelOptions.targetPort, 443)
  assert.notEqual(requestOptions.agent, false)
  assert.equal(socket.destroyed, 1)
})

test('NO_PROXY applies to raw.githubusercontent.com rather than the unrelated lyrics service', async t => {
  const repo = fixture()
  for (const [noProxy, expected] of [['raw.githubusercontent.com', null], ['lrclib.net', 'http://127.0.0.1:7897/']]) {
    const calls = []
    const ws = createWorkshopManager({
      root: await temporaryRoot(t), env: { HTTPS_PROXY: 'http://127.0.0.1:7897', NO_PROXY: noProxy },
      retrySleep: noSleep,
      get: async (url, options) => { calls.push({ url, options }); return repo.bytesAt(url) },
    })
    const result = await ws.index({ refresh: true })
    assert.equal(result.downloadSource, 'github')
    assert.equal(calls.length, 1)
    assert.equal(calls[0].options.proxy === null ? null : String(calls[0].options.proxy), expected)
  }
})

test('a disconnected proxy falls back to the direct mirror, caches the source, and retries GitHub on refresh', async t => {
  const repo = fixture(), calls = []
  let githubAvailable = false
  const ws = createWorkshopManager({
    root: await temporaryRoot(t), env: {}, proxy: () => 'http://127.0.0.1:7897', mirror: () => MIRROR,
    retrySleep: noSleep,
    get: async (url, options) => {
      calls.push({ url, options })
      if (url === WORKSHOP_INDEX_URL && !githubAvailable) throw failure('ECONNREFUSED', 'Proxy is disconnected')
      return repo.bytesAt(url)
    },
  })
  const first = await ws.index({ refresh: true })
  assert.equal(first.downloadSource, 'mirror')
  assert.equal(first.commit, COMMIT)
  assert.equal(calls.filter(call => call.url === WORKSHOP_INDEX_URL).length, 3)
  assert.equal(calls.at(-1).url, `${MIRROR}/main/index.json`)
  assert.equal(calls.at(-1).options.proxy, null)
  const cached = await ws.index({ refresh: false })
  assert.equal(cached.downloadSource, 'mirror')
  assert.equal(calls.length, 4)
  githubAvailable = true
  assert.equal((await ws.index({ refresh: true })).downloadSource, 'github')
  assert.equal(calls.at(-1).url, WORKSHOP_INDEX_URL)
  assert.equal(calls.length, 5)
})

test('an index obtained from the mirror installs the same commit without probing GitHub for every file', async t => {
  const root = await temporaryRoot(t), repo = fixture(), calls = []
  const ws = createWorkshopManager({
    root, env: {}, mirror: () => MIRROR, retrySleep: noSleep,
    get: async (url, options) => {
      calls.push({ url, options })
      if (url === WORKSHOP_INDEX_URL) throw failure('ECONNRESET')
      return repo.bytesAt(url)
    },
  })
  const result = await ws.install({ id: ID })
  assert.equal(result.downloadSource, 'mirror')
  const downloaded = calls.filter(call => !call.url.endsWith('/index.json'))
  assert.equal(downloaded.length, Object.keys(repo.files).length)
  assert.ok(downloaded.every(call => call.url.startsWith(`${MIRROR}/${COMMIT}/packs/${ID}/`) && call.options.proxy === null))
  assert.equal(JSON.parse(await readFile(join(root, ID, '.workshop.json'), 'utf8')).commit, COMMIT)
})

test('a mid-install GitHub failure keeps the commit and uses the mirror for the remaining files', async t => {
  const root = await temporaryRoot(t), repo = fixture(), calls = []
  const failedFile = workshopFileUrl(COMMIT, ID, 'README.md')
  const ws = createWorkshopManager({
    root, env: {}, mirror: () => MIRROR, retrySleep: noSleep,
    get: async (url, options) => {
      calls.push({ url, options })
      if (url === failedFile) throw failure('ECONNRESET')
      return repo.bytesAt(url)
    },
  })
  const result = await ws.install({ id: ID })
  assert.equal(result.downloadSource, 'mirror')
  assert.equal(calls.filter(call => call.url === failedFile).length, 3)
  assert.ok(calls.some(call => call.url === `${MIRROR}/${COMMIT}/packs/${ID}/README.md`))
  assert.ok(calls.some(call => call.url === `${MIRROR}/${COMMIT}/packs/${ID}/note.txt`))
  assert.ok(!calls.some(call => call.url === workshopFileUrl(COMMIT, ID, 'note.txt')))
  assert.ok(calls.filter(call => call.url.startsWith(MIRROR)).every(call => call.options.proxy === null))
  for (const [path, bytes] of Object.entries(repo.files)) assert.deepEqual(await readFile(join(root, ID, path)), bytes)
  assert.deepEqual(await readdir(root), [ID])
})

test('TLS certificate and download-size failures never fall back to another source', async t => {
  for (const error of [failure('CERT_HAS_EXPIRED'), failure('ERR_DOWNLOAD_SIZE', 'Content exceeds allowed size')]) {
    const calls = []
    const ws = createWorkshopManager({
      root: await temporaryRoot(t), env: {}, mirror: () => MIRROR, retrySleep: noSleep,
      get: async url => { calls.push(url); throw error },
    })
    await assert.rejects(ws.index({ refresh: true }))
    assert.deepEqual(calls, [WORKSHOP_INDEX_URL], error.code)
  }
})

test('both source failures name GitHub and the mirror instead of silently returning stale data', async t => {
  const calls = []
  const ws = createWorkshopManager({
    root: await temporaryRoot(t), env: {}, mirror: () => MIRROR, retrySleep: noSleep,
    get: async url => { calls.push(url); throw failure('ECONNRESET', 'Connection was reset') },
  })
  await assert.rejects(ws.index({ refresh: true }), error => {
    assert.match(error.message, /GitHub/i)
    assert.match(error.message, /mirror|镜像|备用源/i)
    return true
  })
  assert.equal(calls.filter(url => url === WORKSHOP_INDEX_URL).length, 3)
  assert.equal(calls.filter(url => url === `${MIRROR}/main/index.json`).length, 3)
})

test('mirror hash mismatch aborts once, preserves the previous install, and cleans temporary files', async t => {
  const root = await temporaryRoot(t), old = fixture(), fresh = fixture({ version: '1.1.0', commit: 'b'.repeat(40) })
  const calls = []
  let updating = false
  const corruptUrl = `${MIRROR}/${fresh.commit}/packs/${ID}/README.md`
  const ws = createWorkshopManager({
    root, env: {}, mirror: () => MIRROR, retrySleep: noSleep,
    get: async url => {
      calls.push(url)
      if (!updating) return old.bytesAt(url)
      if (url === workshopFileUrl(fresh.commit, ID, 'README.md')) throw failure('ECONNRESET')
      if (url === corruptUrl) {
        const bytes = Buffer.from(fresh.files['README.md'])
        bytes[0] ^= 1
        return bytes
      }
      return fresh.bytesAt(url)
    },
  })
  assert.equal((await ws.install({ id: ID })).downloadSource, 'github')
  const oldState = await readFile(join(root, ID, '.workshop.json'))
  updating = true
  await assert.rejects(ws.install({ id: ID }), /sha256|校验失败/i)
  assert.equal(calls.filter(url => url === corruptUrl).length, 1)
  assert.deepEqual(await readdir(root), [ID])
  assert.deepEqual(await readFile(join(root, ID, '.workshop.json')), oldState)
  for (const [path, bytes] of Object.entries(old.files)) assert.deepEqual(await readFile(join(root, ID, path)), bytes)
})
