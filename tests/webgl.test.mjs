import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { parseMvPack, MV_PIXEL_LIMITS, MV_PACK_LIMITS } from '../.dsh-plugin/shared/mv-pack.mjs'
import { sceneWorkerSource, sceneBlockedGlobals, sceneSourceProblems, SCENE_LIMITS } from '../.dsh-plugin/shared/mv-scene.mjs'
import { checkScene, WEBGL_STUB_SOURCE, PIXEL_STUB_SOURCE } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { ScriptFilm } from '../.dsh-plugin/client/mv/script-film.mjs'
import { loadSceneAssets } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { packRequires } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { tooOld } from '../.dsh-plugin/client/mv-workshop-state.mjs'

const WEBGL_PAINT = `
let program;
function setup(info, gl) { program = gl.createProgram(); gl.linkProgram(program); }
function paint(gl, t, w, h) {
  gl.viewport(0, 0, w, h); gl.clearColor(Math.sin(t), 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(program); gl.drawArrays(gl.TRIANGLES, 0, 3);
}`

/** Execute the generated supervisor, including lockdown, in an isolated worker-shaped realm. */
function workerHarness(source, output = 'webgl') {
  const posted = []
  let listener
  const context = vm.createContext({
    postMessage: (message, transfer) => posted.push({ message, transfer }),
    addEventListener: (type, fn) => { if (type === 'message') listener = fn },
    performance: { now: () => 0 },
  })
  vm.runInContext(`
    var self = globalThis;
    function EventTarget() {}
    EventTarget.prototype.addEventListener = function(type, fn) { this.listeners[type] = fn; };
    Object.setPrototypeOf(self, EventTarget.prototype);
    ${output === 'pixels' ? PIXEL_STUB_SOURCE : WEBGL_STUB_SOURCE}
    var __canvases = [];
    var __BaseCanvas = OffscreenCanvas;
    Object.setPrototypeOf(__BaseCanvas.prototype, EventTarget.prototype);
    OffscreenCanvas = function (w, h) { __BaseCanvas.call(this, w, h); this.listeners = {}; __canvases.push(this); };
    OffscreenCanvas.prototype = Object.create(__BaseCanvas.prototype);
    OffscreenCanvas.prototype.transferToImageBitmap = function () { return { width: this.width, height: this.height, close: function () {} }; };
  `, context)
  vm.runInContext(sceneWorkerSource(source, { output }), context, { timeout: 2000 })
  const send = data => listener({ data })
  send({ type: 'init', info: { width: 640, height: 360, assets: {} } })
  return { posted, send, context }
}

test('WebGL manifest and scene byte limits support a bundled library without changing 2D limits', () => {
  const manifest = canvas => ({ format: 'dsh-mv-pack', version: 1, title: 'X', canvas: { renderer: 'script', script: 's.js', ...canvas } })
  assert.equal(parseMvPack(manifest({ output: 'webgl', size: [1920, 1080] })).canvas.output, 'webgl')
  assert.deepEqual(parseMvPack(manifest({ output: 'webgl' })).canvas.size, MV_PIXEL_LIMITS.defaultSize)
  for (const size of [[0, 0], [1921, 1080], [640, 1081], [640.5, 360]]) assert.throws(() => parseMvPack(manifest({ output: 'webgl', size })))
  assert.equal(SCENE_LIMITS.webglScriptBytes, MV_PACK_LIMITS.webglSceneBytes)
  const library = 'function paint() {}\n//' + 'x'.repeat(1200 * 1024)
  assert.deepEqual(sceneSourceProblems(library, { output: 'webgl' }), [])
  assert.ok(sceneSourceProblems(library, { output: 'pixels' }).length)
  assert.ok(sceneSourceProblems('//' + 'x'.repeat(SCENE_LIMITS.webglScriptBytes), { output: 'webgl' }).length)
  for (const source of ["import/* gap */('https://x')", "import\n('https://x')", "const x = `text ${import/*gap*/('https://x')}`", "const a = '/*'; import('https://x'); const b = '*/'"]) assert.ok(sceneSourceProblems(source, { output: 'webgl' }).length, source)
  assert.equal(packRequires({ canvas: { renderer: 'script', output: 'webgl' } }), '0.9.2')
  assert.equal(tooOld({ requires: '0.9.2' }, '0.9.1'), true)
})

test('generated WebGL worker initializes and snapshots the same GL canvas', () => {
  const { posted, send } = workerHarness(WEBGL_PAINT)
  assert.equal(posted[0].message.error, '')
  send({ type: 'frame', id: 7, t: 1, cols: 640, rows: 360, ctx: {} })
  const frame = posted[1]
  assert.equal(frame.message.type, 'frame')
  assert.equal(frame.message.id, 7)
  assert.deepEqual([frame.message.bitmap.width, frame.message.bitmap.height], [640, 360])
  assert.equal(frame.transfer[0], frame.message.bitmap)
})

test('Three-compatible canvas facade shares the supervisor context and denies browser privileges', () => {
  const source = `
    let canvas;
    function setup(info, gl) {
      canvas = info.canvas;
      if (canvas.getContext('webgl2') !== gl || canvas.width !== 640 || canvas.height !== 360) throw Error('wrong canvas');
      if (canvas.getContext('webgpu') !== null) throw Error('WebGPU leaked');
      canvas.style.width = '640px'; canvas.setAttribute('data-engine', 'three');
      canvas.addEventListener('webglcontextlost', () => {});
      if (typeof window !== 'undefined' || typeof document !== 'undefined' || typeof process !== 'undefined') throw Error('DOM leaked');
    }
    function paint(gl) { gl.clear(gl.COLOR_BUFFER_BIT); }
  `
  const { posted, send } = workerHarness(source)
  assert.equal(posted[0].message.error, '')
  send({ type: 'frame', id: 1, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(posted[1].message.type, 'frame')
  const host = checkScene(source, { output: 'webgl', size: [640, 360] })
  assert.equal(host.ok, true, host.problems.join('; '))
  assert.equal(host.gpuValidated, false)
  assert.equal(host.validation, 'webgl-call-recording')
  assert.ok(host.problems.some(p => /未在真实 GPU/.test(p)))
})

test('all scene modes preserve Math while blocking globals and private worker transport', () => {
  for (const output of ['text', 'pixels', 'webgl']) {
    for (const name of ['window', 'document', 'process', 'self', 'globalThis', 'fetch', 'indexedDB', 'Worker', 'setTimeout', 'postMessage', 'addEventListener', 'WebAssembly']) assert.ok(sceneBlockedGlobals(output).includes(name), `${output}: ${name}`)
    assert.ok(!sceneBlockedGlobals(output).includes('Math'))
  }
  const probe = `
    function setup() {
      if (typeof __post !== 'undefined' || typeof __listen !== 'undefined' || typeof __global !== 'undefined' || typeof __compile !== 'undefined') throw Error('private transport leaked');
      if (typeof fetch !== 'undefined' || typeof self !== 'undefined' || typeof globalThis !== 'undefined' || typeof setTimeout !== 'undefined') throw Error('globals leaked');
      if ((() => {}).constructor !== undefined || (async () => {}).constructor !== undefined || (function*() {}).constructor !== undefined) throw Error('dynamic compiler leaked');
    }
    function paint(gl) { gl.clear(gl.COLOR_BUFFER_BIT); }
  `
  const { posted } = workerHarness(probe)
  assert.equal(posted[0].message.error, '')
  const forbidden = workerHarness('function setup() { __post({type:"ready",error:""}) } function paint(gl) {}')
  assert.equal(forbidden.posted.length, 1)
  assert.match(forbidden.posted[0].message.error, /__post/)
})

test('pixel worker remains 2D-only and retains Math compatibility', () => {
  const source = `function paint(g, t, w, h) { const c = new OffscreenCanvas(4, 4); if(c.getContext('webgl2')) throw Error('GL leaked'); g.fillRect(Math.cos(t), 0, w, h); }`
  const { posted, send } = workerHarness(source, 'pixels')
  assert.equal(posted[0].message.error, '')
  send({ type: 'frame', id: 1, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(posted[1].message.type, 'frame')
})

test('WebGL worker detects context loss and emits a fatal fallback event', () => {
  const { posted, context } = workerHarness(WEBGL_PAINT)
  vm.runInContext(`__canvases[0].listeners.webglcontextlost({preventDefault() {}})`, context)
  assert.equal(posted[1].message.type, 'fatal')
  assert.match(posted[1].message.error, /上下文已丢失/)
})

class FakeWorker {
  constructor({ ready = true } = {}) { this.ready = ready; this.sent = []; this.terminated = false }
  postMessage(message) { this.sent.push(message); if (message.type === 'init' && this.ready) queueMicrotask(() => this.onmessage?.({ data: { type: 'ready', error: '' } })) }
  terminate() { this.terminated = true }
  reply(message) { this.onmessage?.({ data: message }) }
}
const bitmap = (w = 640, h = 360) => ({ width: w, height: h, closed: 0, close() { this.closed++ } })
async function loadedFilm(worker = new FakeWorker(), onFail = () => {}) {
  const film = new ScriptFilm({ createWorker: () => worker, onFail })
  await film.load(WEBGL_PAINT, { output: 'webgl', size: [640, 360] })
  return { film, worker }
}

test('ScriptFilm closes replaced and stopped WebGL bitmaps and rejects malformed frames', async () => {
  const { film, worker } = await loadedFilm()
  film.request(0, 640, 360, {})
  const first = bitmap()
  worker.reply({ type: 'frame', id: film.pending.id, bitmap: first, ms: 1 })
  film.request(1, 640, 360, {})
  const second = bitmap()
  worker.reply({ type: 'frame', id: film.pending.id, bitmap: second, ms: 1 })
  assert.equal(first.closed, 1)
  const oldHandler = worker.onmessage
  film.stop()
  assert.equal(second.closed, 1)
  assert.equal(worker.terminated, true)
  const late = bitmap()
  oldHandler({ data: { type: 'frame', id: 2, bitmap: late, ms: 1 } })
  assert.equal(late.closed, 1)
  assert.equal(film.state, 'idle')
  for (const alter of [msg => { msg.id++ }, msg => { msg.ms = NaN }, msg => { msg.bitmap.width-- }, msg => { msg.type = 'unknown' }]) {
    const { film, worker } = await loadedFilm()
    film.request(0, 640, 360, {})
    const bad = bitmap(), message = { type: 'frame', id: film.pending.id, bitmap: bad, ms: 1 }
    alter(message); worker.reply(message)
    assert.equal(film.state, 'failed')
    assert.equal(bad.closed, 1)
    assert.equal(worker.terminated, true)
  }
})

test('ScriptFilm settles cancelled initialization and handles fatal context loss without a pending frame', async () => {
  const worker = new FakeWorker({ ready: false })
  const film = new ScriptFilm({ createWorker: () => worker })
  const loading = film.load(WEBGL_PAINT, { output: 'webgl', size: [640, 360] })
  const cancelled = assert.rejects(loading, /已取消/)
  film.stop(); await cancelled
  assert.equal(film.setupTimer, null)
  const malformed = new FakeWorker({ ready: false })
  const badFilm = new ScriptFilm({ createWorker: () => malformed })
  const badLoading = badFilm.load(WEBGL_PAINT, { output: 'webgl', size: [640, 360] })
  const badReady = assert.rejects(badLoading, /初始化响应/)
  const leaked = bitmap()
  malformed.reply({ type: 'ready', error: '', bitmap: leaked })
  await badReady
  assert.equal(leaked.closed, 1)
  let failure = ''
  const live = await loadedFilm(new FakeWorker(), reason => { failure = reason })
  live.worker.reply({ type: 'fatal', error: 'WebGL 上下文已丢失' })
  assert.equal(live.film.state, 'failed')
  assert.match(failure, /上下文已丢失/)
})

test('scene asset loading closes decoded images when a later resource fails', async t => {
  const old = globalThis.createImageBitmap
  const decoded = bitmap()
  globalThis.createImageBitmap = async () => decoded
  t.after(() => { if (old) globalThis.createImageBitmap = old; else delete globalThis.createImageBitmap })
  const pack = { canvas: { assets: { texture: 'image.png', broken: 'broken.json' } } }
  await assert.rejects(loadSceneAssets(async name => [new TextEncoder().encode(name === 'broken' ? '{bad' : 'image')], pack, { images: true }))
  assert.equal(decoded.closed, 1)
})
