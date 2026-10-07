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
/** Message types the worker emitted, for asserting handshake order. */
const posted0 = harness => harness.posted.map(message => message.type)

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

test('preparation and warmup add independent limits without relaxing steady state', () => {
  assert.equal(SCENE_LIMITS.prepareStepTimeoutMs, 10_000)
  assert.equal(SCENE_LIMITS.prepareMaxSteps, 512)
  assert.equal(SCENE_LIMITS.warmupTimeoutMs, 20_000)
  assert.equal(SCENE_LIMITS.firstFrameTimeoutMs, 8000)
  assert.equal(SCENE_LIMITS.firstFrameGraceMs, 10_000)
  // Steady-state playback protection is unchanged by any of the above.
  assert.equal(SCENE_LIMITS.hardTimeoutMs, 1500)
  assert.equal(SCENE_LIMITS.slowFramesAllowed, 45)
  assert.equal(PIXEL_SCENE_LIMITS.frameBudgetMs, 100)
  assert.ok(SCENE_LIMITS.firstFrameTimeoutMs > SCENE_LIMITS.hardTimeoutMs)
  assert.ok(SCENE_LIMITS.setupTimeoutMs > 0 && SCENE_LIMITS.prepareTotalTimeoutMs > SCENE_LIMITS.prepareStepTimeoutMs)
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

test('worker runs warmup once, after prepare and before ready, on the final surface', () => {
  // Ordering and surface are asserted by the guards inside the scene itself:
  // warmup throws unless prepare finished, and paint throws unless warmup ran.
  const source = `
    let prepared = false, warmed = false;
    function setup(info, gl) { if (info.canvas.getContext('webgl2') !== gl) throw Error('wrong context') }
    function* prepare() { prepared = true; yield { progress: .5 } }
    function warmup(info, gl) {
      if (!prepared) throw Error('warmup ran before prepare finished')
      if (info.width !== 640 || info.height !== 360) throw Error('warmup is not on the final surface')
      if (info.canvas.getContext('webgl2') !== gl) throw Error('wrong context')
      gl.createProgram(); gl.finish(); warmed = true
    }
    function paint(gl) { if (!warmed) throw Error('paint before warmup'); gl.clear(gl.COLOR_BUFFER_BIT) }`
  const { posted, send } = supervisor(source)
  assert.deepEqual({ ...posted[0] }, preparing())
  send({ type: 'prepare-next', id: 1 })
  assert.deepEqual({ ...posted.at(-1) }, preparing(1, .5))
  send({ type: 'prepare-next', id: 2 })
  assert.deepEqual({ ...posted.at(-2) }, { type: 'warming', id: 2 })
  assert.deepEqual({ ...posted.at(-1) }, ready(2))
  send({ type: 'frame', id: 9, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(posted.at(-1).type, 'frame')
  // warmup runs exactly once, even if the worker is asked to keep preparing.
  send({ type: 'prepare-next', id: 3 })
  assert.equal(posted.at(-1).type, 'frame')
})

test('worker runs warmup without a prepare stage', () => {
  const { posted } = supervisor(`function warmup(info,gl){gl.createProgram();gl.finish()} ${paint}`)
  assert.deepEqual({ ...posted[0] }, { type: 'warming', id: 0 })
  assert.deepEqual({ ...posted[1] }, ready(0))
})

test('worker skips the warming handshake for scenes without warmup', () => {
  const withPrepare = supervisor(`function* prepare(){} ${paint}`)
  assert.deepEqual({ ...withPrepare.posted[0] }, preparing())
  withPrepare.send({ type: 'prepare-next', id: 1 })
  assert.deepEqual({ ...withPrepare.posted.at(-1) }, ready(1))
  assert.equal(withPrepare.posted.some(m => m.type === 'warming'), false)
})

test('worker reports warmup failures and refuses a resized output surface', () => {
  const thrown = supervisor(`function warmup(){throw Error('warmup exploded')} ${paint}`)
  assert.deepEqual(posted0(thrown), ['warming', 'fatal'])
  assert.match(thrown.posted.at(-1).error, /warmup exploded/)
  const resized = supervisor(`function warmup(info){info.canvas.width=641} ${paint}`)
  assert.deepEqual(posted0(resized), ['warming', 'fatal'])
  assert.match(resized.posted.at(-1).error, /canvas.size/)
  // warmup must not swallow later context loss or install a second handler.
  const lost = supervisor(`function warmup(info,gl){gl.createProgram()} ${paint}`)
  assert.deepEqual(posted0(lost), ['warming', 'ready'])
  vm.runInContext('__canvases[0].listeners.webglcontextlost({preventDefault(){}})', lost.context)
  assert.equal(lost.posted.at(-1).type, 'fatal')
  assert.match(lost.posted.at(-1).error, /上下文已丢失/)
})

test('worker bounds warmup execution', () => {
  const harness = supervisor(`function warmup(){while(true){}} ${paint}`, { init: false })
  assert.throws(() => harness.send({ type: 'init', info: { width: 640, height: 360 } }, 25), /timed out/)
})

test('worker and Host reject asynchronous warmup results before ready', () => {
  for (const body of [
    'return new Promise(() => {})',
    'return Promise.reject(Error("async failure"))',
    'return { then() { throw Error("thenable must not execute") } }',
    'return { next() { return { done: true } } }',
  ]) {
    const source = `function warmup(){${body}} ${paint}`
    const worker = supervisor(source)
    assert.deepEqual(posted0(worker), ['warming', 'fatal'], body)
    assert.match(worker.posted.at(-1).error, /同步完成|Promise|thenable/, body)
    const host = checkScene(source, { output: 'webgl', size: [320, 180] })
    assert.equal(host.ok, false, body)
    assert.match(host.problems.join('; '), /同步完成|Promise|thenable/, body)
    assert.deepEqual(host.frames, [])
  }
})

test('pixel warmup uses an initialized output surface and preserves legacy frames', () => {
  const source = `let warmed=false;function warmup(info,gl){if(info.width!==640||info.height!==360||gl!==undefined)throw Error('wrong pixel info');warmed=true}function paint(g){if(!warmed)throw Error('early paint');g.fillRect(0,0,4,4)}`
  const worker = supervisor(source, { output: 'pixels' })
  assert.deepEqual(posted0(worker), ['warming', 'ready'])
  assert.deepEqual({ ...worker.posted[0] }, { type: 'warming', id: 0 })
  worker.send({ type: 'frame', id: 1, t: 0, cols: 640, rows: 360, ctx: {} })
  assert.equal(worker.posted.at(-1).type, 'frame')
  assert.equal(worker.posted.at(-1).bitmap.width, 640)
  const host = checkScene(source, { output: 'pixels', size: [640, 360] })
  assert.equal(host.ok, true, host.problems.join('; '))
  assert.equal(host.preparation.warmup, true)
})

test('worker enforces its own warmup wall deadline and context loss checks', () => {
  let ticks = 0
  const expired = supervisor(`function warmup(){} ${paint}`, { clock: () => ticks++ * (SCENE_LIMITS.warmupTimeoutMs + 1) })
  assert.deepEqual(posted0(expired), ['warming', 'fatal'])
  assert.match(expired.posted.at(-1).error, /warmup\(\).*超时/)
  const lost = supervisor(`function warmup(info,gl){gl.isContextLost=()=>true} ${paint}`)
  assert.deepEqual(posted0(lost), ['warming', 'fatal'])
  assert.match(lost.posted.at(-1).error, /上下文已丢失/)
})

test('Host gives completed preparation and warmup independent VM deadlines', t => {
  const calls = []
  const original = vm.runInContext
  t.mock.method(vm, 'runInContext', (code, context, options) => {
    calls.push({ code, timeout: options?.timeout })
    return original(code, context, options)
  })
  const source = `let prepared=false,warmed=false;function* prepare(){prepared=true;yield;}function warmup(){if(!prepared)throw Error('early warmup');warmed=true}function render(){if(!warmed)throw Error('early frame');return ['ok']}`
  const host = checkScene(source)
  assert.equal(host.ok, true, host.problems.join('; '))
  assert.equal(host.preparation.steps, 2)
  assert.equal(host.preparation.warmup, true)
  assert.ok(calls.filter(call => call.code === '__hostPrepareStep()').every(call => call.timeout <= SCENE_LIMITS.prepareStepTimeoutMs))
  const warmupCalls = calls.filter(call => call.code === '__hostWarmup()')
  assert.equal(warmupCalls.length, 1)
  assert.equal(warmupCalls[0].timeout, SCENE_LIMITS.warmupTimeoutMs)
  const failed = compileScene(`function warmup(){throw Error('warmup failed')} ${render}`)
  assert.throws(() => failed.setup({}), /warmup failed/)
  assert.throws(() => failed.renderFrame(0, 40, 12, {}), /尚未准备完成/)
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
  // Progress messages must not renew the independent total deadline.
  const step = 9000
  const rounds = Math.ceil(SCENE_LIMITS.prepareTotalTimeoutMs / step) + 1
  for (let id = 1; id <= rounds; id++) {
    t.mock.timers.tick(step)
    progressing.worker.reply(preparing(id, id / rounds))
  }
  await total
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
  // Steady state keeps the unchanged hardTimeoutMs and slow-frame quota.
  let now = 0
  const hung = filmHarness({ now: () => now })
  hung.worker.reply(preparing()); hung.worker.reply(ready(1)); await hung.loading
  now = SCENE_LIMITS.firstFrameGraceMs + 1
  hung.film.request(0, 640, 360, {})
  now += SCENE_LIMITS.hardTimeoutMs + 1
  hung.film.request(0, 640, 360, {})
  assert.equal(hung.film.state, 'failed')
  assert.match(hung.film.error, /1500 ms/)
  assert.equal(hung.worker.terminated, true)

  const slow = filmHarness({ now: () => now })
  slow.worker.reply(preparing()); slow.worker.reply(ready(1)); await slow.loading
  now = SCENE_LIMITS.firstFrameGraceMs + 1
  assert.equal(slow.film.slow, 0)
  for (let frame = 0; frame <= SCENE_LIMITS.slowFramesAllowed && slow.film.state === 'ready'; frame++) {
    slow.film.request(frame, 640, 360, {})
    slow.worker.reply({ type: 'frame', id: slow.film.pending.id, ms: PIXEL_SCENE_LIMITS.frameBudgetMs + 1, bitmap: { width: 640, height: 360, close() {} } })
  }
  assert.equal(slow.film.state, 'failed')
  assert.match(slow.film.error, /预算 100 ms/)
})

test('the first-use window widens the stall limit without touching steady state', async () => {
  let now = 0
  const film = filmHarness({ now: () => now })
  film.worker.reply(preparing()); film.worker.reply(ready(1)); await film.loading
  assert.equal(film.film.inFirstFrameGrace(), true)
  // A first frame that outlasts the steady-state limit is expected GPU work.
  film.film.request(0, 640, 360, {})
  now = SCENE_LIMITS.hardTimeoutMs + 1
  film.film.request(0, 640, 360, {})
  assert.equal(film.film.state, 'ready')
  // But it is still bounded, and the reason points at warmup() instead of a loop.
  now = SCENE_LIMITS.firstFrameTimeoutMs + 1
  film.film.request(0, 640, 360, {})
  assert.equal(film.film.state, 'failed')
  assert.match(film.film.error, /warmup/)
  assert.doesNotMatch(film.film.error, /死循环/)
  assert.equal(film.worker.terminated, true)

  // Once the window closes, the unchanged limit applies again.
  let later = 0
  const steady = filmHarness({ now: () => later })
  steady.worker.reply(preparing()); steady.worker.reply(ready(1)); await steady.loading
  later = SCENE_LIMITS.firstFrameGraceMs + 1
  assert.equal(steady.film.inFirstFrameGrace(), false)
  steady.film.request(0, 640, 360, {})
  later += SCENE_LIMITS.hardTimeoutMs + 1
  steady.film.request(0, 640, 360, {})
  assert.equal(steady.film.state, 'failed')
  assert.match(steady.film.error, /死循环/)
})

test('first-use frames never spend the steady-state slow-frame quota', async () => {
  let now = 0
  const film = filmHarness({ now: () => now })
  film.worker.reply(preparing()); film.worker.reply(ready(1)); await film.loading
  // Far more slow frames than the quota allows, all inside the first-use window.
  for (let frame = 0; frame < SCENE_LIMITS.slowFramesAllowed * 3; frame++) {
    film.film.request(frame, 640, 360, {})
    film.worker.reply({ type: 'frame', id: film.film.pending.id, ms: PIXEL_SCENE_LIMITS.frameBudgetMs * 10, bitmap: { width: 640, height: 360, close() {} } })
    now += 1
  }
  assert.equal(film.film.state, 'ready')
  assert.equal(film.film.slow, 0)
  assert.equal(film.film.graceSlow, SCENE_LIMITS.slowFramesAllowed * 3)
  assert.equal(film.film.graceFrames, SCENE_LIMITS.slowFramesAllowed * 3)
  // After the window the very same scene is still stopped for being slow.
  now = SCENE_LIMITS.firstFrameGraceMs + 1
  for (let frame = 0; frame <= SCENE_LIMITS.slowFramesAllowed && film.film.state === 'ready'; frame++) {
    film.film.request(frame, 640, 360, {})
    film.worker.reply({ type: 'frame', id: film.film.pending.id, ms: PIXEL_SCENE_LIMITS.frameBudgetMs + 1, bitmap: { width: 640, height: 360, close() {} } })
  }
  assert.equal(film.film.state, 'failed')
  assert.match(film.film.error, /预算 100 ms/)
})

test('a first-use request keeps its allowance across the grace-window boundary', async () => {
  let now = 0
  const harness = filmHarness({ now: () => now })
  harness.worker.reply(ready()); await harness.loading
  now = SCENE_LIMITS.firstFrameGraceMs - 1
  harness.film.request(0, 640, 360, {})
  const id = harness.film.pending.id
  now += 2000
  harness.film.request(0, 640, 360, {})
  assert.equal(harness.film.state, 'ready', 'the in-flight first-use frame retains its 8-second deadline')
  harness.worker.reply({ type: 'frame', id, ms: 2000, bitmap: { width: 640, height: 360, close() {} } })
  assert.equal(harness.film.graceFrames, 1)
  assert.equal(harness.film.graceSlow, 1)
  assert.equal(harness.film.slow, 0, 'its slow response is still classified as first-use')
  harness.film.request(1, 640, 360, {})
  now += SCENE_LIMITS.hardTimeoutMs + 1
  harness.film.request(1, 640, 360, {})
  assert.equal(harness.film.state, 'failed', 'the next request uses the steady-state deadline')
  assert.match(harness.film.error, /1500 ms/)
  assert.equal(harness.worker.terminated, true)
})

test('late frame replies are rejected even without an intervening watchdog poll', async () => {
  for (const byWorkerTime of [false, true]) {
    let now = 0, closed = 0
    const harness = filmHarness({ now: () => now })
    harness.worker.reply(ready()); await harness.loading
    harness.film.request(0, 640, 360, {})
    const { id, timeoutMs } = harness.film.pending
    if (!byWorkerTime) now = timeoutMs + 1
    harness.worker.reply({ type: 'frame', id, ms: byWorkerTime ? timeoutMs + 1 : 1, bitmap: { width: 640, height: 360, close() { closed++ } } })
    assert.equal(harness.film.state, 'failed')
    assert.equal(harness.worker.terminated, true)
    assert.equal(closed, 1)
    assert.match(harness.film.error, /首帧/)
  }
})

test('ScriptFilm gives warmup its own deadline, separate from setup and preparation', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  // warmup straight after init: the setup deadline must already be gone.
  const plain = filmHarness()
  plain.worker.reply({ type: 'warming', id: 0 })
  assert.equal(plain.film.state, 'warming')
  assert.equal(plain.film.setupTimer, null)
  const rejected = assert.rejects(plain.loading, /预热/)
  t.mock.timers.tick(SCENE_LIMITS.warmupTimeoutMs); await rejected
  assert.equal(plain.worker.terminated, true)
  assert.equal(plain.film.warmupTimer, null)

  // warmup after preparation keeps the reported progress and drops prepare timers.
  const prepared = filmHarness()
  prepared.worker.reply(preparing()); prepared.worker.reply(preparing(1, .5, 'shaders'))
  prepared.worker.reply({ type: 'warming', id: 2 })
  assert.equal(prepared.film.state, 'warming')
  assert.equal(prepared.film.prepareTimer, null)
  assert.equal(prepared.film.prepareTotalTimer, null)
  assert.equal(prepared.film.prepareProgress, .5)
  prepared.worker.reply(ready(2)); await prepared.loading
  assert.equal(prepared.film.state, 'ready')
  assert.equal(prepared.film.warmupTimer, null)
  // The completion report still fires even though warmup sat between the last
  // prepare step and ready, and it echoes the final step id.
  assert.equal(prepared.progress.at(-1).done, true)
  assert.equal(prepared.progress.at(-1).step, 2)
  assert.equal(prepared.progress.at(-1).progress, 1)
  assert.deepEqual(prepared.progress.at(-2), { step: 1, progress: .5, label: 'shaders', done: false })
})

test('ScriptFilm rejects malformed warming notifications and cancels the deadline', async () => {
  const withBitmap = filmHarness()
  withBitmap.worker.reply({ type: 'warming', id: 0, bitmap: { width: 640, height: 360, close() {} } })
  await assert.rejects(withBitmap.loading, /预热通知/)
  assert.equal(withBitmap.worker.terminated, true)

  const repeated = filmHarness()
  repeated.worker.reply({ type: 'warming', id: 0 })
  repeated.worker.reply({ type: 'warming', id: 0 })
  await assert.rejects(repeated.loading, /预热通知/)

  // Cancelling clears the warmup deadline just like the other stages.
  const cancelled = filmHarness()
  cancelled.worker.reply({ type: 'warming', id: 0 })
  assert.notEqual(cancelled.film.warmupTimer, null)
  cancelled.film.stop()
  assert.equal(cancelled.film.warmupTimer, null)
  await assert.rejects(cancelled.loading, /已取消/)
})

test('ScriptFilm requires warming and ready to echo the final preparation id', async () => {
  for (const id of [undefined, -1, 1, NaN, '0']) {
    const harness = filmHarness()
    const rejected = assert.rejects(harness.loading, /预热通知/)
    harness.worker.reply({ type: 'warming', ...(id === undefined ? {} : { id }) })
    await rejected
    assert.equal(harness.worker.terminated, true)
  }
  const prepared = filmHarness()
  prepared.worker.reply(preparing()); prepared.worker.reply(preparing(1, .5))
  const incorrect = assert.rejects(prepared.loading, /预热通知/)
  prepared.worker.reply({ type: 'warming', id: 1 }); await incorrect
  const plain = filmHarness()
  plain.worker.reply({ type: 'warming', id: 0 })
  const readyMismatch = assert.rejects(plain.loading, /初始化响应/)
  plain.worker.reply(ready(1)); await readyMismatch
  const good = filmHarness()
  good.worker.reply({ type: 'warming', id: 0 }); good.worker.reply(ready(0)); await good.loading
  assert.equal(good.film.state, 'ready')
  good.film.stop()
})

test('ScriptFilm reports a warmup failure through the fatal channel', async () => {
  const harness = filmHarness()
  harness.worker.reply({ type: 'warming', id: 0 })
  harness.worker.reply({ type: 'fatal', error: 'warmup() exploded' })
  await assert.rejects(harness.loading, /warmup\(\) exploded/)
  assert.equal(harness.film.state, 'failed')
  assert.equal(harness.film.warmupTimer, null)
  assert.equal(harness.worker.terminated, true)
})

test('Host mirrors warmup after setup and after prepare, and still reports legacy scenes', () => {
  const scene = checkScene(`
    function setup(info) { if (info.canvas.getContext('webgl2') === undefined) throw Error('no gl') }
    function* prepare() { yield { progress: .5 } }
    function warmup(info, gl) { gl.createProgram(); gl.finish() }
    function paint(gl) { gl.clear(gl.COLOR_BUFFER_BIT) }`, { output: 'webgl', size: [320, 180] })
  assert.equal(scene.ok, true)
  assert.equal(scene.preparation.warmup, true)
  assert.equal(scene.preparation.steps, 2)
  assert.ok(scene.frames[0].drawCalls > 0)

  // Without warmup the Host is still ready, and says so honestly.
  const legacy = checkScene(`function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}`, { output: 'webgl', size: [320, 180] })
  assert.equal(legacy.ok, true)
  assert.equal(legacy.preparation, undefined)

  // A warmup that breaks is reported like any other lifecycle failure.
  const broken = checkScene(`function warmup(){throw Error('host warmup boom')} function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}`, { output: 'webgl', size: [320, 180] })
  assert.equal(broken.ok, false)
  assert.match(broken.problems.join('; '), /warmup/)

  // Text scenes get the same stage, with no GL argument.
  const text = checkScene(`function warmup(info, gl){ if (gl !== undefined) throw Error('text scenes have no gl') } function render(){return ['ok']}`, { output: 'text' })
  assert.equal(text.ok, true)
  assert.equal(text.preparation.warmup, true)
})
