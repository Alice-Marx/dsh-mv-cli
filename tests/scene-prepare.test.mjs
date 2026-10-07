import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { SCENE_LIMITS, PIXEL_SCENE_LIMITS, sceneWorkerSource, sceneBlockedGlobals } from '../.dsh-plugin/shared/mv-scene.mjs'
import { checkScene, compileScene, PIXEL_STUB_SOURCE, WEBGL_STUB_SOURCE } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { ScriptFilm } from '../.dsh-plugin/client/mv/script-film.mjs'

const paint = 'function paint(gl) { gl.clear(gl.COLOR_BUFFER_BIT); }'
const render = 'function render() { return ["prepared"]; }'
const preparing = (id = 0, progress = 0, label = '') => ({ type: 'preparing', id, progress, label })
const ready = id => ({ type: 'ready', error: '', ...(id === undefined ? {} : { id }) })

test('Host Path2D handles stay inside the VM and remain recording-only', () => {
  const result = checkScene('function setup(){const p=new Path2D("M0 0L1 1");p.addPath(new Path2D());p.rect(0,0,10,10);if(typeof process!=="undefined")throw Error("Host leak")}function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}', {output:'webgl',size:[320,180]})
  assert.equal(result.ok, true)
  assert.equal(result.gpuValidated, false)
  assert.ok(result.frames[0].drawCalls > 0)
})
test('Host pixel-derived geometry explicitly requires a real browser', () => {
  const result = checkScene('function setup(){const g=new OffscreenCanvas(4,4).getContext("2d");g.fillText("X",0,0);g.getImageData(0,0,4,4)}function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}', {output:'webgl',size:[320,180]})
  assert.equal(result.ok, false)
  assert.equal(result.gpuValidated, false)
  assert.equal(result.requiresBrowserValidation, true)
  assert.deepEqual(result.frames, [])
})

function supervisor(source, { output = 'webgl', clock = () => 0, init = true } = {}) {
  const posted = []
  let listener
  const context = vm.createContext({
    postMessage: message => posted.push(message),
    addEventListener: (type, callback) => { if (type === 'message') listener = callback },
    performance: { now: clock },
  })
  vm.runInContext(`
    var self = globalThis;
    function EventTarget() {}
    EventTarget.prototype.addEventListener = function(type, fn) { this.listeners[type] = fn; };
    Object.setPrototypeOf(self, EventTarget.prototype);
    ${PIXEL_STUB_SOURCE}
    ${output === 'webgl' ? WEBGL_STUB_SOURCE : ''}
    var __canvases = [], __BaseCanvas = OffscreenCanvas;
    Object.setPrototypeOf(__BaseCanvas.prototype, EventTarget.prototype);
    OffscreenCanvas = function(w, h) { __BaseCanvas.call(this, w, h); this.listeners = {}; __canvases.push(this); };
    OffscreenCanvas.prototype = Object.create(__BaseCanvas.prototype);
    OffscreenCanvas.prototype.transferToImageBitmap = function() { return {width:this.width, height:this.height, close() {}}; };
  `, context)
  vm.runInContext(sceneWorkerSource(source, { output }), context, { timeout: 2000 })
  // The VM timeout substitutes for main-thread worker termination in malicious-loop tests.
  context.__deliver = listener
  const send = (message, timeout = 1000) => {
    context.__incoming = message
    return vm.runInContext('__deliver({data:__incoming})', context, { timeout })
  }
  if (init) send({ type: 'init', info: { width: 640, height: 360, assets: { answer: 42 } } })
  return { posted, context, send }
}

class FakeWorker {
  constructor() { this.sent = []; this.terminated = false }
  postMessage(message) { this.sent.push(message) }
  terminate() { this.terminated = true }
  reply(message) { this.onmessage?.({ data: message }) }
}
function filmHarness(options = {}) {
  const worker = new FakeWorker(), progress = []
  const film = new ScriptFilm({ createWorker: () => worker, onPrepare: status => progress.push(status), ...options })
  const loading = film.load(paint, { output: 'webgl', size: [640, 360] })
  return { worker, film, loading, progress }
}

test('preparation adds independent limits without relaxing setup or playback budgets', () => {
  assert.equal(SCENE_LIMITS.prepareStepTimeoutMs, 10_000)
  assert.equal(SCENE_LIMITS.prepareTotalTimeoutMs, 120_000)
  assert.equal(SCENE_LIMITS.prepareMaxSteps, 512)
  assert.equal(SCENE_LIMITS.setupTimeoutMs, 2000)
  assert.equal(SCENE_LIMITS.hardTimeoutMs, 1500)
  assert.equal(PIXEL_SCENE_LIMITS.frameBudgetMs, 100)
  for (const name of ['setTimeout', 'setInterval', 'fetch', 'Worker', 'postMessage', 'globalThis', 'Function', 'WebAssembly']) assert.ok(sceneBlockedGlobals().includes(name))
})

test('worker preparation is lazy, uses the same info/context, and prevents early frames', () => {
  const source = `
    let initialized = false;
    function setup(info, gl) { if (info.assets.answer !== 42 || info.canvas.getContext('webgl2') !== gl) throw Error('wrong setup'); initialized = true; }
    function* prepare(info, gl) {
      if (!initialized || info.assets.answer !== 42 || info.canvas.getContext('webgl2') !== gl) throw Error('wrong prepare');
      if (typeof __post !== 'undefined' || typeof __prepare !== 'undefined' || typeof fetch !== 'undefined' || typeof setTimeout !== 'undefined') throw Error('capability leaked');
      gl.createProgram(); yield {progress:.4,label:'programs'};
      gl.createTexture(); yield {progress:.8,label:'textures'};
    }
    ${paint}`
  const { posted, send } = supervisor(source)
  assert.deepEqual({ ...posted[0] }, preparing())
  send({ type: 'frame', id: 7, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(posted.length, 1)
  send({ type: 'prepare-next', id: 1 })
  assert.deepEqual({ ...posted[1] }, preparing(1, .4, 'programs'))
  send({ type: 'prepare-next', id: 2 })
  assert.deepEqual({ ...posted[2] }, preparing(2, .8, 'textures'))
  send({ type: 'prepare-next', id: 3 })
  assert.deepEqual({ ...posted[3] }, ready(3))
  send({ type: 'prepare-next', id: 4 })
  assert.equal(posted.length, 4, 'completed iterators must never be advanced again')
  send({ type: 'frame', id: 8, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(posted[4].type, 'frame')
  assert.equal(posted[4].id, 8)
  assert.equal(posted[4].bitmap.width, 640)
})

test('worker legacy scenes keep the immediate ready handshake', () => {
  for (const [output, source] of [['text', render], ['pixels', 'function paint(g){g.fillRect(0,0,1,1)}'], ['webgl', paint]]) {
    const { posted } = supervisor(source, { output })
    assert.deepEqual({ ...posted[0] }, ready())
  }
})

test('worker rejects Promise factories, async iterators, malformed/non-monotone progress and step floods', () => {
  for (const prepare of [
    'async function prepare() {}',
    'function prepare(){return null}',
    'async function* prepare(){yield {progress:.5}}',
    'function prepare(){return {next(){return {done:"no"}}}}',
    'function* prepare(){yield {progress:NaN}}',
    'function* prepare(){yield {progress:-.1}}',
    'function* prepare(){yield {progress:1.1}}',
    'function* prepare(){yield {progress:.5,label:"x".repeat(161)}}',
    'function* prepare(){yield "not copied data"}',
  ]) {
    const { posted, send } = supervisor(`${prepare}\n${paint}`)
    if (posted[0].type === 'preparing') send({ type: 'prepare-next', id: 1 })
    const failure = posted.at(-1)
    assert.ok(failure.type === 'fatal' || failure.type === 'ready' && failure.error, prepare)
  }
  const decreasing = supervisor(`function* prepare(){yield {progress:.8};yield {progress:.2}} ${paint}`)
  decreasing.send({ type: 'prepare-next', id: 1 }); decreasing.send({ type: 'prepare-next', id: 2 })
  assert.match(decreasing.posted.at(-1).error, /单调/)
  const endless = supervisor(`function* prepare(){while(true)yield;} ${paint}`)
  for (let id = 1; id <= SCENE_LIMITS.prepareMaxSteps + 1; id++) endless.send({ type: 'prepare-next', id })
  assert.equal(endless.posted.at(-1).type, 'fatal')
  assert.match(endless.posted.at(-1).error, /512/)
  const duplicate = supervisor(`function* prepare(){yield;} ${paint}`)
  duplicate.send({ type: 'prepare-next', id: 2 })
  assert.match(duplicate.posted.at(-1).error, /编号/)
})

test('worker bounds factory/getter/next execution and checks fixed output/context loss', () => {
  const endlessFactory = supervisor(`function prepare(){while(true){}} ${paint}`, { init: false })
  assert.throws(() => endlessFactory.send({ type: 'init', info: { width: 640, height: 360 } }, 25), /timed out/)
  for (const prepare of [
    'function* prepare(){while(true){}}',
    'function prepare(){return {next(){return {get done(){while(true){}}}}}}',
  ]) {
    const harness = supervisor(`${prepare} ${paint}`)
    assert.throws(() => harness.send({ type: 'prepare-next', id: 1 }, 25), /timed out/)
  }
  const resized = supervisor(`function* prepare(info){info.canvas.width=641;yield;} ${paint}`)
  resized.send({ type: 'prepare-next', id: 1 })
  assert.match(resized.posted.at(-1).error, /canvas.size/)
  const lost = supervisor(`function* prepare(){yield;} ${paint}`)
  vm.runInContext('__canvases[0].listeners.webglcontextlost({preventDefault(){}})', lost.context)
  assert.equal(lost.posted.at(-1).type, 'fatal')
  assert.match(lost.posted.at(-1).error, /上下文已丢失/)
})

test('worker also checks its own preparation wall deadlines', () => {
  let clock = 0
  const harness = supervisor(`function* prepare(){yield;} ${paint}`, { clock: () => clock })
  clock = SCENE_LIMITS.prepareTotalTimeoutMs + 1
  harness.send({ type: 'prepare-next', id: 1 })
  assert.match(harness.posted.at(-1).error, /总计超时/)
  let ticks = 0
  const slow = supervisor(`function* prepare(){yield;} ${paint}`, { clock: () => ticks++ * (SCENE_LIMITS.prepareStepTimeoutMs + 1) })
  slow.send({ type: 'prepare-next', id: 1 })
  assert.match(slow.posted.at(-1).error, /单步骤超时/)
})

test('Host preparation mirrors the lifecycle and keeps WebGL validation structural', () => {
  const source = `let finished=false;function* prepare(info,gl){if(!gl.getExtension('EXT_color_buffer_float'))throw Error('missing float');yield {progress:.5,label:'compile'};finished=true;}function paint(gl){if(!finished)throw Error('early frame');gl.clear(gl.COLOR_BUFFER_BIT)}`
  const checked = checkScene(source, { output: 'webgl', size: [640, 360], times: [0, 1] })
  assert.equal(checked.ok, true, checked.problems.join('; '))
  assert.equal(checked.preparation.steps, 2)
  assert.equal(checked.preparation.progress[0].progress, .5)
  assert.equal(checked.gpuValidated, false)
  assert.equal(checked.validation, 'webgl-call-recording')
  assert.ok(checked.problems.some(problem => /未在真实 GPU/.test(problem)))
  const scene = compileScene(`${render} function* prepare(){yield {progress:.5};}`)
  assert.throws(() => scene.renderFrame(0, 40, 12, {}), /尚未准备完成/)
  assert.equal(scene.setup({}).steps, 2)
  assert.equal(scene.renderFrame(0, 40, 12, {}).lines[0], 'prepared')
  for (const prepare of ['async function prepare(){}', 'async function* prepare(){yield;}', 'function* prepare(){yield {progress:.6};yield {progress:.2}}', 'function* prepare(){while(true)yield;}']) {
    const bad = checkScene(`${prepare} ${render}`)
    assert.equal(bad.ok, false, prepare)
    assert.match(bad.problems.join('; '), /prepare|Promise|512|单调/)
  }
})

test('ScriptFilm load resolves only after preparation and preserves legacy scripts', async () => {
  const { worker, film, loading, progress } = filmHarness()
  let resolved = false
  loading.then(() => { resolved = true })
  worker.reply(preparing())
  assert.equal(film.state, 'preparing')
  assert.equal(film.setupTimer, null)
  assert.deepEqual(worker.sent.at(-1), { type: 'prepare-next', id: 1 })
  film.request(0, 640, 360, {})
  assert.equal(worker.sent.length, 2, 'no early frame requests')
  worker.reply(preparing(1, .5, 'shaders'))
  await Promise.resolve()
  assert.equal(resolved, false)
  worker.reply(ready(2))
  await loading
  assert.equal(film.state, 'ready')
  assert.equal(progress.at(-1).done, true)
  assert.equal(progress.at(-1).progress, 1)
  assert.equal(film.prepareTimer, null)
  assert.equal(film.prepareTotalTimer, null)
  film.stop()
  const old = filmHarness()
  old.worker.reply(ready()); await old.loading
  assert.equal(old.film.state, 'ready')
  assert.deepEqual(old.progress, [])
  old.film.stop()
})

test('ScriptFilm cancels all preparation deadlines and closes late bitmaps', async () => {
  const { worker, film, loading } = filmHarness()
  worker.reply(preparing())
  const oldHandler = worker.onmessage
  const rejection = assert.rejects(loading, /已取消/)
  film.stop(); await rejection
  assert.equal(worker.terminated, true)
  assert.equal(film.prepareTimer, null)
  assert.equal(film.prepareTotalTimer, null)
  let closed = 0
  oldHandler({ data: { type: 'frame', bitmap: { close() { closed++ } } } })
  assert.equal(closed, 1)
  assert.equal(film.state, 'idle')
})

test('ScriptFilm preparation callbacks may cancel without resurrecting an old worker', async () => {
  let film
  const harness = filmHarness({ onPrepare: () => film.stop() }); film = harness.film
  const cancelled = assert.rejects(harness.loading, /已取消/)
  harness.worker.reply(preparing()); await cancelled
  assert.equal(harness.worker.sent.length, 1)
  assert.equal(film.prepareTimer, null)
  assert.equal(film.prepareTotalTimer, null)
})

test('ScriptFilm rejects malformed progress/ids/ready and closes invalid bitmaps', async () => {
  for (const alter of [message => { message.id = 2 }, message => { message.progress = NaN }, message => { message.progress = -1 }, message => { message.label = 'x'.repeat(161) }, message => { message.bitmap = { close() { this.closed = true } } }]) {
    const { worker, film, loading } = filmHarness()
    const bad = preparing(), rejected = assert.rejects(loading, /准备进度/)
    alter(bad); worker.reply(bad); await rejected
    assert.equal(worker.terminated, true)
    assert.equal(film.state, 'failed')
    if (bad.bitmap) assert.equal(bad.bitmap.closed, true)
  }
  for (const message of [preparing(2, .5), preparing(1, -.1), { ...ready(2) }, { type: 'frame', id: 1 }]) {
    const { worker, film, loading } = filmHarness()
    worker.reply(preparing())
    const rejected = assert.rejects(loading, /无效消息/)
    worker.reply(message); await rejected
    assert.equal(film.prepareTotalTimer, null)
  }
  const decreasing = filmHarness(); decreasing.worker.reply(preparing()); decreasing.worker.reply(preparing(1, .8))
  const rejected = assert.rejects(decreasing.loading, /准备进度/)
  decreasing.worker.reply(preparing(2, .7)); await rejected
})

test('ScriptFilm step and total deadlines are independent and progress cannot renew the total', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const stuck = filmHarness(); stuck.worker.reply(preparing())
  const single = assert.rejects(stuck.loading, /单步骤/)
  t.mock.timers.tick(SCENE_LIMITS.prepareStepTimeoutMs); await single
  assert.equal(stuck.worker.terminated, true)
  const progressing = filmHarness(); progressing.worker.reply(preparing())
  const total = assert.rejects(progressing.loading, /总计/)
  for (let id = 1; id <= 13; id++) {
    t.mock.timers.tick(9000)
    progressing.worker.reply(preparing(id, id / 20))
  }
  t.mock.timers.tick(3000); await total
  assert.equal(progressing.worker.terminated, true)
  assert.equal(progressing.film.prepareTimer, null)
})

test('ScriptFilm terminates never-completing fast preparation at the step cap', async () => {
  const harness = filmHarness(), rejected = assert.rejects(harness.loading, /512/)
  harness.worker.reply(preparing())
  for (let id = 1; id <= SCENE_LIMITS.prepareMaxSteps; id++) harness.worker.reply(preparing(id))
  await rejected
  assert.equal(harness.worker.terminated, true)
  assert.equal(harness.film.prepareTotalTimer, null)
})

test('prepared playback still terminates frame hangs and repeated slow GPU frames', async () => {
  let now = 0
  const hung = filmHarness({ now: () => now })
  hung.worker.reply(preparing()); hung.worker.reply(ready(1)); await hung.loading
  hung.film.request(0, 640, 360, {})
  now = SCENE_LIMITS.hardTimeoutMs + 1
  hung.film.request(0, 640, 360, {})
  assert.equal(hung.film.state, 'failed')
  assert.match(hung.film.error, /1500 ms/)
  assert.equal(hung.worker.terminated, true)
  const slow = filmHarness()
  slow.worker.reply(preparing()); slow.worker.reply(ready(1)); await slow.loading
  assert.equal(slow.film.slow, 0)
  for (let frame = 0; frame <= SCENE_LIMITS.slowFramesAllowed && slow.film.state === 'ready'; frame++) {
    slow.film.request(frame, 640, 360, {})
    slow.worker.reply({ type: 'frame', id: slow.film.pending.id, ms: PIXEL_SCENE_LIMITS.frameBudgetMs + 1, bitmap: { width: 640, height: 360, close() {} } })
  }
  assert.equal(slow.film.state, 'failed')
  assert.match(slow.film.error, /预算 100 ms/)
})
