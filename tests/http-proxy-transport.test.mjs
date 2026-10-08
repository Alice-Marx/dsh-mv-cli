import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import tls from 'node:tls'
import { setTimeout as delay } from 'node:timers/promises'
import { bypassProxy, getJson, proxyFromEnv, tunnel } from '../.dsh-plugin/shared/mv-lrclib.mjs'
import { getBytes } from '../.dsh-plugin/shared/mv-workshop-host.mjs'

// Disposable, public localhost-only TLS fixture. This key has no account or
// production use and is deliberately shipped only in tests, never the plugin.
// Valid for 2000-2100 so tests do not depend on the generation day's clock.
const TEST_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgn00JKR91AWBhSE3v
F9QB3Y/CSZwjTcmsCQHGAp6MPCyhRANCAARVYr9mG1DXr1jI6kDBuBwBA5YVpKx1
7AUGYLtfOAaXwL8iSFxSKu2GwEr4NU1ODEVFFbKwjfvP+ZBFy91p0LAA
-----END PRIVATE KEY-----`
const TEST_CERT = `-----BEGIN CERTIFICATE-----
MIIBXDCCAQGgAwIBAgIUftU9zyy8iJZ7zqIOdgbSxicN4WgwCgYIKoZIzj0EAwIw
FDESMBAGA1UEAwwJbG9jYWxob3N0MCAXDTAwMDEwMTAwMDAwMFoYDzIxMDAwMTAx
MDAwMDAwWjAUMRIwEAYDVQQDDAlsb2NhbGhvc3QwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAARVYr9mG1DXr1jI6kDBuBwBA5YVpKx17AUGYLtfOAaXwL8iSFxSKu2G
wEr4NU1ODEVFFbKwjfvP+ZBFy91p0LAAoy8wLTAPBgNVHRMBAf8EBTADAQH/MBoG
A1UdEQQTMBGCCWxvY2FsaG9zdIcEfwAAATAKBggqhkjOPQQDAgNJADBGAiEAyoDa
xMnQTzoogGIZ4cA3DnJW/KrbMWiz7paHA8UdhOkCIQDsi+pRQYuZAbRpQdoQbd6+
q5XI3BzXMaoNTf0lEPNFLA==
-----END CERTIFICATE-----`

async function localServer(t, server) {
  const sockets = new Set()
  server.on('connection', socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)) })
  server.on('tlsClientError', () => {})
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => { server.off('error', reject); resolve() })
  })
  t.after(async () => {
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
  })
  return { server, sockets, port: server.address().port }
}

async function localProxy(t, targetPort) {
  const seen = [], upstreams = new Set()
  const proxy = await localServer(t, http.createServer())
  proxy.server.on('connect', (request, client, head) => {
    seen.push(request.url)
    assert.equal(request.url, `localhost:${targetPort}`, 'CONNECT uses the actual target port')
    const upstream = net.connect({ host: '127.0.0.1', port: targetPort })
    upstreams.add(upstream)
    upstream.once('close', () => upstreams.delete(upstream))
    upstream.once('error', () => client.destroy())
    client.once('error', () => upstream.destroy())
    client.once('close', () => upstream.destroy())
    upstream.once('connect', () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head.length) upstream.write(head)
      client.pipe(upstream).pipe(client)
    })
  })
  t.after(() => { for (const socket of upstreams) socket.destroy() })
  return { ...proxy, seen, url: new URL(`http://127.0.0.1:${proxy.port}`) }
}

const trustedTunnel = (proxy, host, options) => tunnel(proxy, host, {
  ...options,
  tlsConnect: options => tls.connect({ ...options, ca: TEST_CERT }),
})

test('proxy parser preserves HTTP/env compatibility and rejects unsupported protocols explicitly', () => {
  assert.equal(proxyFromEnv({ HTTPS_PROXY: '127.0.0.1:7897' }).href, 'http://127.0.0.1:7897/')
  assert.equal(proxyFromEnv({ https_proxy: 'http://localhost:7897' }).hostname, 'localhost')
  assert.equal(proxyFromEnv({ HTTP_PROXY: 'http://localhost:7897' }).port, '7897')
  assert.equal(proxyFromEnv({ HTTPS_PROXY: 'http://localhost:7897' }, 'http://configured:8080').hostname, 'configured')
  assert.equal(proxyFromEnv({}), null)
  for (const value of ['socks5://localhost:7897', 'socks5h://localhost:7897', 'https://localhost:7897']) {
    assert.throws(() => proxyFromEnv({ HTTPS_PROXY: value }), error => error.code === 'ERR_PROXY_PROTOCOL' && /CONNECT/.test(error.message))
  }
  for (const value of ['http://', 'http://localhost:wrong', 'http://localhost/path', 'http://localhost/?token=synthetic']) {
    assert.throws(() => proxyFromEnv({ HTTPS_PROXY: value }), error => error.code === 'ERR_PROXY_URL' && !error.message.includes('synthetic'))
  }
})

test('NO_PROXY is target-host aware, handles suffixes, ports and IPv6, and keeps the LRCLIB default', () => {
  const env = { HTTPS_PROXY: 'http://localhost:7897', NO_PROXY: 'lrclib.net' }
  assert.equal(proxyFromEnv(env), null)
  assert.equal(proxyFromEnv(env, '', 'raw.githubusercontent.com').hostname, 'localhost')
  assert.equal(proxyFromEnv({ ...env, NO_PROXY: 'raw.githubusercontent.com' }, '', 'raw.githubusercontent.com'), null)
  for (const [host, pattern, expected] of [
    ['raw.githubusercontent.com', '.githubusercontent.com', true],
    ['githubusercontent.com', '.githubusercontent.com', true],
    ['notgithubusercontent.com', 'githubusercontent.com', false],
    ['lrclib.net.evil.invalid', 'lrclib.net', false],
    ['https://raw.githubusercontent.com/file', 'raw.githubusercontent.com:443', true],
    ['https://raw.githubusercontent.com:444/file', 'raw.githubusercontent.com:443', false],
    ['https://API.EXAMPLE.COM./x', '*.example.com', true],
    ['https://[::1]:8443/x', '[::1]:8443', true],
    ['https://[::1]:8443/x', '[::1]:443', false],
    ['127.0.0.1', '0.0.1', false],
    ['anything.invalid', '*', true],
  ]) assert.equal(bypassProxy(host, pattern), expected, `${host} / ${pattern}`)
})

test('native HTTPS request actually uses the CONNECT TLS socket, not a new direct Agent connection', async t => {
  let gets = 0, handshakes = 0
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    gets++
    assert.equal(request.url, '/api/search?q=synthetic')
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ synthetic: true }))
  }))
  target.server.on('secureConnection', () => handshakes++)
  const proxy = await localProxy(t, target.port)
  const result = await getJson(`https://localhost:${target.port}/api/search?q=synthetic`, { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 })
  assert.deepEqual(result, { synthetic: true })
  assert.equal(proxy.seen.length, 1)
  assert.equal(handshakes, 1)
  assert.equal(gets, 1)
})

test('production tunnel keeps TLS certificate validation enabled', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => response.end('{}')))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(tunnel(proxy.url, 'localhost', { targetPort: target.port, timeoutMs: 1500 }), error => /SELF_SIGNED|UNABLE_TO_VERIFY/.test(error.code))
  assert.equal(proxy.seen.length, 1)
})

function fakeConnection() {
  const socket = new EventEmitter()
  socket.destroyCount = 0
  socket.destroy = () => { socket.destroyCount++ }
  socket.unshift = () => {}
  return socket
}

function connectStub(socket, { status = 200, head = Buffer.alloc(0), capture = () => {} } = {}) {
  const req = new EventEmitter()
  req.destroyCount = 0
  req.destroy = () => { req.destroyCount++ }
  req.end = () => queueMicrotask(() => req.emit('connect', { statusCode: status }, socket, head))
  return { req, connectRequest: options => { capture(options); return req } }
}

test('CONNECT head is restored before TLS consumes the stream; synthetic credentials stay in the proxy request', async () => {
  const raw = fakeConnection(), secure = fakeConnection(), events = []
  const head = Buffer.from([0x16, 0x03, 0x03])
  raw.unshift = value => { assert.equal(value, head); events.push('unshift') }
  const { connectRequest } = connectStub(raw, { head, capture: options => {
    assert.equal(options.headers.Host, 'example.invalid:443')
    assert.equal(options.headers['Proxy-Authorization'], `Basic ${Buffer.from('synthetic:example').toString('base64')}`)
  } })
  const result = await tunnel(new URL('http://synthetic:example@localhost:7897'), 'example.invalid', { connectRequest, tlsConnect: options => {
    events.push('tls')
    assert.equal(options.socket, raw)
    assert.equal(options.servername, 'example.invalid')
    assert.notEqual(options.rejectUnauthorized, false)
    queueMicrotask(() => secure.emit('secureConnect'))
    return secure
  } })
  assert.equal(result, secure)
  assert.deepEqual(events, ['unshift', 'tls'])
  assert.equal(raw.destroyCount, 0)
})

test('proxy rejection destroys the failed CONNECT socket and never starts TLS', async () => {
  const socket = fakeConnection(), { req, connectRequest } = connectStub(socket, { status: 407 })
  await assert.rejects(tunnel(new URL('http://localhost:7897'), 'example.invalid', { connectRequest, tlsConnect: () => assert.fail('TLS must not start') }), error => error.code === 'ERR_PROXY_CONNECT' && error.statusCode === 407)
  assert.equal(socket.destroyCount, 1)
  assert.equal(req.destroyCount, 1)
})

test('TLS handshake errors destroy both sockets and the CONNECT request', async () => {
  const raw = fakeConnection(), secure = fakeConnection(), { req, connectRequest } = connectStub(raw)
  const failure = Object.assign(new Error('synthetic handshake error'), { code: 'ECONNRESET' })
  await assert.rejects(tunnel(new URL('http://localhost:7897'), 'example.invalid', { connectRequest, tlsConnect: () => {
    queueMicrotask(() => secure.emit('error', failure))
    return secure
  } }), error => error === failure)
  assert.equal(raw.destroyCount, 1)
  assert.equal(secure.destroyCount, 1)
  assert.equal(req.destroyCount, 1)
})

test('TLS closure without an error still rejects, and a synchronous TLS constructor failure cleans up', async () => {
  const proxy = new URL('http://localhost:7897')
  const raw = fakeConnection(), secure = fakeConnection(), stub = connectStub(raw)
  await assert.rejects(tunnel(proxy, 'example.invalid', { connectRequest: stub.connectRequest, tlsConnect: () => {
    queueMicrotask(() => secure.emit('close'))
    return secure
  } }), error => error.code === 'ECONNRESET' && error.phase === 'tls')
  assert.equal(raw.destroyCount, 1)
  assert.equal(secure.destroyCount, 1)
  const another = fakeConnection(), next = connectStub(another)
  await assert.rejects(tunnel(proxy, 'example.invalid', { connectRequest: next.connectRequest, tlsConnect: () => { throw new Error('synthetic constructor failure') } }), /synthetic constructor failure/)
  assert.equal(another.destroyCount, 1)
  assert.equal(next.req.destroyCount, 1)
})

test('CONNECT has a total deadline even while the proxy keeps its TCP socket open', async t => {
  const proxy = await localServer(t, http.createServer())
  let held, issued, usedSocket
  proxy.server.on('connect', (_request, socket) => { held = socket; socket.on('error', () => {}); socket.resume() })
  await assert.rejects(tunnel(new URL(`http://127.0.0.1:${proxy.port}`), 'localhost', { timeoutMs: 120, connectRequest: options => {
    issued = http.request(options)
    issued.once('socket', socket => { usedSocket = socket })
    return issued
  } }), error => error.code === 'ETIMEDOUT' && error.phase === 'connect')
  await delay(30)
  assert.ok(issued.destroyed)
  assert.ok(usedSocket.destroyed)
  // Node's upgraded proxy socket may be half-open after observing the FIN.
  assert.ok(held && (held.readableEnded || held.destroyed))
})

test('TLS handshake gets its own total deadline and releases a silent tunneled connection', async t => {
  const target = await localServer(t, net.createServer(socket => socket.on('data', () => {})))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(tunnel(proxy.url, 'localhost', { targetPort: target.port, timeoutMs: 120 }), error => error.code === 'ETIMEDOUT' && error.phase === 'tls')
  await delay(30)
  assert.equal(proxy.sockets.size, 0)
  assert.equal(target.sockets.size, 0)
})

test('getJson settles a truncated native response instead of waiting indefinitely', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => {
    response.writeHead(200, { 'Content-Length': '100' })
    response.write('{"partial":')
    setImmediate(() => response.socket.destroy())
  }))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(getJson(`https://localhost:${target.port}/truncated`, { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 }), error => error.code === 'ECONNRESET')
})

test('getJson enforces a total GET deadline even if response bytes keep arriving', async t => {
  const timers = new Set()
  t.after(() => { for (const timer of timers) clearInterval(timer) })
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.write('{')
    const timer = setInterval(() => response.write(' '), 10)
    timers.add(timer)
    response.once('close', () => { clearInterval(timer); timers.delete(timer) })
  }))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(getJson(`https://localhost:${target.port}/trickle`, { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 120 }), error => error.code === 'ETIMEDOUT')
})

test('getJson preserves 404 and non-200 semantics and rejects insecure target protocols', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    response.statusCode = request.url === '/missing' ? 404 : 503
    response.end('{}')
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 }
  assert.equal(await getJson(`https://localhost:${target.port}/missing`, options), null)
  await assert.rejects(getJson(`https://localhost:${target.port}/unavailable`, options), /LRCLIB 返回 503/)
  await assert.rejects(getJson('http://localhost/insecure', options), /https/)
})

test('custom-socket HTTPS GET keeps the default port and Host header at 443 rather than HTTP 80', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    response.end(JSON.stringify({ host: request.headers.host, path: request.url }))
  }))
  const proxy = await localProxy(t, target.port)
  const result = await getJson('https://lrclib.net/api/search?q=synthetic', {
    proxy: proxy.url, timeoutMs: 1500,
    connectTunnel: (_proxy, host, options) => {
      assert.equal(host, 'lrclib.net')
      assert.equal(options.targetPort, 443)
      return trustedTunnel(proxy.url, 'localhost', { ...options, targetPort: target.port })
    },
    request: (url, options, callback) => {
      assert.equal(url.hostname, 'lrclib.net')
      assert.equal(typeof options.createConnection, 'function')
      assert.notEqual(options.agent, false)
      assert.equal(options.createConnection().remoteAddress, '127.0.0.1')
      assert.equal(options.createConnection().remotePort, proxy.port)
      return https.request(url, options, callback)
    },
  })
  assert.deepEqual(result, { host: 'lrclib.net', path: '/api/search?q=synthetic' })
  assert.equal(proxy.seen.length, 1)
})

test('getBytes uses the native proxy TLS socket and returns exact binary file bytes', async t => {
  const expected = Buffer.from([0x00, 0xff, 0x42, 0x80, 0x01])
  let gets = 0, handshakes = 0
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    gets++
    assert.equal(request.url, '/packs/synthetic/art.bin')
    assert.equal(request.headers.accept, '*/*')
    assert.equal(request.headers['user-agent'], 'synthetic-workshop-test')
    assert.equal(request.headers['proxy-authorization'], undefined)
    response.end(expected)
  }))
  target.server.on('secureConnection', () => handshakes++)
  const proxy = await localProxy(t, target.port)
  const result = await getBytes(`https://localhost:${target.port}/packs/synthetic/art.bin`, {
    proxy: proxy.url, connectTunnel: trustedTunnel, userAgent: 'synthetic-workshop-test', maxBytes: expected.length, timeoutMs: 1500,
  })
  assert.ok(Buffer.isBuffer(result))
  assert.deepEqual(result, expected)
  assert.equal(proxy.seen.length, 1)
  assert.equal(handshakes, 1)
  assert.equal(gets, 1)
})

test('getBytes rejects a truncated native file response without returning partial bytes', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => {
    response.writeHead(200, { 'Content-Length': '100' })
    response.write(Buffer.from([0x00, 0xff]))
    setImmediate(() => response.socket.destroy())
  }))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(getBytes(`https://localhost:${target.port}/partial.bin`, { proxy: proxy.url, connectTunnel: trustedTunnel, maxBytes: 100, timeoutMs: 1500 }), error => error.code === 'ECONNRESET')
})

test('getBytes total GET deadline cannot be kept alive by a trickling file response', async t => {
  const timers = new Set()
  t.after(() => { for (const timer of timers) clearInterval(timer) })
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
    response.write('x')
    const timer = setInterval(() => response.write('x'), 10)
    timers.add(timer)
    response.once('close', () => { clearInterval(timer); timers.delete(timer) })
  }))
  const proxy = await localProxy(t, target.port)
  await assert.rejects(getBytes(`https://localhost:${target.port}/trickle.bin`, { proxy: proxy.url, connectTunnel: trustedTunnel, maxBytes: 1000, timeoutMs: 120 }), error => error.code === 'ETIMEDOUT')
})

test('getBytes enforces the size limit for chunked bodies and accepts the exact boundary', async t => {
  const expected = Buffer.from([0x00, 0xff, 0x01, 0x80, 0x02, 0x42])
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
    response.write(expected.subarray(0, 3))
    response.end(expected.subarray(3))
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 }
  await assert.rejects(getBytes(`https://localhost:${target.port}/file.bin`, { ...options, maxBytes: expected.length - 1 }), error => error.code === 'ERR_DOWNLOAD_SIZE')
  assert.deepEqual(await getBytes(`https://localhost:${target.port}/file.bin`, { ...options, maxBytes: expected.length }), expected)
})

test('getBytes follows relative and same-host HTTPS redirects using fresh verified tunnels', async t => {
  const expected = Buffer.from([0x80, 0x00, 0xff]), paths = []
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    paths.push(request.url)
    if (request.url === '/start') { response.writeHead(302, { Location: '/middle' }); response.end(); return }
    if (request.url === '/middle') { response.writeHead(308, { Location: `https://localhost:${target.port}/final` }); response.end(); return }
    response.end(expected)
  }))
  const proxy = await localProxy(t, target.port)
  assert.deepEqual(await getBytes(`https://localhost:${target.port}/start`, { proxy: proxy.url, connectTunnel: trustedTunnel, maxBytes: expected.length, timeoutMs: 1500 }), expected)
  assert.deepEqual(paths, ['/start', '/middle', '/final'])
  assert.equal(proxy.seen.length, 3)
})

test('getBytes permits at most three redirects and refuses a fourth before contacting it', async t => {
  const paths = []
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    paths.push(request.url)
    const [, mode, hopText] = request.url.split('/'), hop = Number(hopText)
    if (mode === 'safe' && hop === 3) { response.end('ok'); return }
    response.writeHead(307, { Location: `/${mode}/${hop + 1}` })
    response.end()
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, maxBytes: 2, timeoutMs: 1500 }
  assert.equal((await getBytes(`https://localhost:${target.port}/safe/0`, options)).toString(), 'ok')
  assert.deepEqual(paths, ['/safe/0', '/safe/1', '/safe/2', '/safe/3'])
  paths.length = 0
  await assert.rejects(getBytes(`https://localhost:${target.port}/loop/0`, options), error => error.code === 'ERR_DOWNLOAD_REDIRECT')
  assert.deepEqual(paths, ['/loop/0', '/loop/1', '/loop/2', '/loop/3'])
  assert.equal(proxy.seen.length, 8)
})

test('getBytes refuses HTTP, URL credentials, foreign hosts and port changes in redirects', async t => {
  const paths = []
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    paths.push(request.url)
    const redirects = {
      '/plain': `http://localhost:${target.port}/not-contacted`,
      '/auth': `https://synthetic:never-echo-this@localhost:${target.port}/not-contacted`,
      '/foreign': 'https://unrelated.invalid/not-contacted',
      '/port': `https://localhost:${target.port === 65535 ? target.port - 1 : target.port + 1}/not-contacted`,
    }
    response.writeHead(302, { Location: redirects[request.url] })
    response.end()
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500, request: (url, options, callback) => {
    assert.equal(url.protocol, 'https:')
    assert.equal(url.hostname, 'localhost')
    assert.equal(url.port, String(target.port))
    assert.equal(url.username, '')
    assert.equal(url.password, '')
    return https.request(url, options, callback)
  } }
  for (const path of ['/plain', '/auth', '/foreign', '/port']) {
    await assert.rejects(getBytes(`https://localhost:${target.port}${path}`, options), error => error.code === 'ERR_DOWNLOAD_REDIRECT' && !error.message.includes('never-echo-this'))
  }
  assert.deepEqual(paths, ['/plain', '/auth', '/foreign', '/port'])
  assert.equal(proxy.seen.length, 4)
})

test('getBytes validates initial HTTPS URLs before creating a socket or request', async () => {
  const options = {
    proxy: new URL('http://localhost:7897'),
    connectTunnel: () => assert.fail('unsafe URLs must not open a tunnel'),
    request: () => assert.fail('unsafe URLs must not start a request'),
  }
  for (const url of ['http://localhost/file', 'https://synthetic:never-echo-this@localhost/file']) {
    await assert.rejects(getBytes(url, options), error => error.code === 'ERR_DOWNLOAD_URL' && !error.message.includes('never-echo-this'))
  }
})

test('getBytes refuses missing, blank and invalid redirect locations before following any path', async t => {
  const paths = []
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    paths.push(request.url)
    if (request.url === '/missing') response.writeHead(302)
    else if (request.url === '/blank') response.writeHead(302, { Location: ' ' })
    else if (request.url === '/invalid') response.writeHead(302, { Location: 'https://[invalid' })
    else { response.end('should not have followed'); return }
    response.end()
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 }
  for (const path of ['/missing', '/blank', '/invalid']) {
    await assert.rejects(getBytes(`https://localhost:${target.port}${path}`, options), error => error.code === 'ERR_DOWNLOAD_REDIRECT')
  }
  assert.deepEqual(paths, ['/missing', '/blank', '/invalid'])
  assert.equal(proxy.seen.length, 3)
})

test('getBytes allows only the explicit Gitee-to-raw redirect, over localhost TLS with virtual host headers', async t => {
  const seen = [], connects = []
  const expected = Buffer.from([0x00, 0xff, 0x7f])
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    seen.push([request.headers.host, request.url])
    if (request.headers.host === 'gitee.com') {
      response.writeHead(302, { Location: 'https://raw.giteeusercontent.com/synthetic/file.bin' })
      response.end()
    } else if (request.url === '/reverse') {
      response.writeHead(302, { Location: 'https://gitee.com/synthetic/not-contacted' })
      response.end()
    } else response.end(expected)
  }))
  const proxy = await localProxy(t, target.port)
  const options = {
    proxy: proxy.url, maxBytes: expected.length, timeoutMs: 1500,
    connectTunnel: (_proxy, host, options) => {
      assert.ok(['gitee.com', 'raw.giteeusercontent.com'].includes(host))
      connects.push(host)
      // Virtual host names are never resolved: their socket is always local.
      return trustedTunnel(proxy.url, 'localhost', { ...options, targetPort: target.port })
    },
    request: (url, options, callback) => {
      // Fail synchronously rather than allow an accidental external DNS/GET.
      assert.equal(typeof options.createConnection, 'function')
      assert.notEqual(options.agent, false)
      const socket = options.createConnection()
      assert.equal(socket.remoteAddress, '127.0.0.1')
      assert.equal(socket.remotePort, proxy.port)
      assert.equal(socket.authorized, true)
      return https.request(url, options, callback)
    },
  }
  assert.deepEqual(await getBytes('https://gitee.com/synthetic/file.bin', options), expected)
  assert.deepEqual(seen, [['gitee.com', '/synthetic/file.bin'], ['raw.giteeusercontent.com', '/synthetic/file.bin']])
  assert.deepEqual(connects, ['gitee.com', 'raw.giteeusercontent.com'])
  await assert.rejects(getBytes('https://raw.giteeusercontent.com/reverse', options), error => error.code === 'ERR_DOWNLOAD_REDIRECT')
  assert.equal(seen.length, 3)
  assert.equal(connects.length, 3)
})

test('getBytes exposes HTTP status and bounded Retry-After metadata without treating errors as file bytes', async t => {
  const target = await localServer(t, https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (request, response) => {
    response.writeHead(503, { 'Retry-After': request.url === '/long' ? '120' : '2' })
    response.end('not a pack file')
  }))
  const proxy = await localProxy(t, target.port)
  const options = { proxy: proxy.url, connectTunnel: trustedTunnel, timeoutMs: 1500 }
  await assert.rejects(getBytes(`https://localhost:${target.port}/short`, options), error => error.code === 'ERR_DOWNLOAD_HTTP' && error.statusCode === 503 && error.retryAfterMs === 2000)
  await assert.rejects(getBytes(`https://localhost:${target.port}/long`, options), error => error.code === 'ERR_DOWNLOAD_HTTP' && error.statusCode === 503 && error.retryAfterMs === 5000)
})
