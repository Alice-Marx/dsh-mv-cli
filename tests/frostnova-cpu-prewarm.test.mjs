import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { CAT_PREPARE_CHUNK, transformCpuModule } from '../presets/ports/frostnova-web/cpu-prewarm.mjs'

// Deliberately synthetic source: these tests never execute a third-party MV,
// music loader, private source checkout or GPU renderer.
const catBody = `function catShape(N) {
  const S = {pos:new Float32Array(N*4),nrm:new Float32Array(N*4),fur:new Float32Array(N*4),col:new Float32Array(N*4),aux:new Float32Array(N*4)};
  const C = cells(), r = rng(20260930);
  for (let i = 0; i < N;) {
    const x = r(), y = r(), z = r(), c = C[r()*C.length|0];
    if (x < .35) continue;
    const d = r();
    if (d < .25) continue;
    let g = 0;
    for (let k = 0; k < 3; k++) g += (x+y+z)/(k+1);
    coat(S, i++, x, y, z, d, c, g, r());
  }
  return S;
}`
const catFixture = `
var randCalls = 0, cellsCalls = 0, coatCalls = 0;
function cells(){cellsCalls++;return [3,7,19];}
function rng(seed){return ()=>{randCalls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function coat(S,i,x,y,z,d,c,g,r){
  coatCalls++;
  for(const [a,k] of [['pos',1],['nrm',2],['fur',3],['col',4],['aux',5]]){
    S[a].set([x*k+y,z*k+d,c*k+g,r*k],i*4);
  }
}
${catBody}
export { catShape };`
const bakeBody = `function bakeLight(S, N, sdf, L, o = {}) {
  const out = new Float32Array(N*2), p=[0,0,0], n=[0,0,0];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < 3; j++) {
      p[j] = S.pos[i*4+j];
      n[j] = S.nrm[i*4+j];
    }
    out[i*2] = openness(sdf,p,n,o.open);
    out[i*2+1] = shadow(sdf,p,n,L,o.shadow);
  }
  return out;
}`
const bakeFixture = `
var openCalls=0, shadowCalls=0;
function openness(sdf,p,n,k=.2){openCalls++;return sdf(...p)+n[1]*k;}
function shadow(sdf,p,n,L,k=.3){shadowCalls++;return sdf(...p)*k+n[0]*L[0]+n[1]*L[1]+n[2]*L[2];}
${bakeBody}
export { bakeLight };`
function realm(source, bindings = {}) {
  const context = vm.createContext(bindings, { codeGeneration: { strings: false, wasm: false } })
  const executable = source.replace(/^import[^\n]+\n/gm, '').replace(/^export\s*\{[^}]*\};?\s*$/gm, '').replace(/\bexport\s+(?=function\b)/g, '')
  vm.runInContext(executable, context, { timeout: 1000 })
  return context
}
function consume(iterator) {
  const progress = []
  for (;;) {
    const next = iterator.next()
    if (next.done) return { value: next.value, progress }
    progress.push({ ...next.value })
  }
}
const bytes = array => Buffer.from(array.buffer, array.byteOffset, array.byteLength)
function equalShape(actual, expected) {
  assert.deepEqual(Object.keys(actual), Object.keys(expected))
  for (const key of ['pos', 'nrm', 'fur', 'col', 'aux']) assert.deepEqual(bytes(actual[key]), bytes(expected[key]), key)
}

test('FrostNova CPU transformation is pure, path scoped and idempotent', () => {
  const source = 'throw Error("must never execute input");\n' + catFixture
  const transformed = transformCpuModule(source, 'src/ch/v2/cat.js')
  assert.ok(transformed.includes('must never execute input'))
  assert.ok(transformed.includes(catBody), 'original function must be retained byte-for-byte')
  assert.equal(transformCpuModule(transformed, 'src/ch/v2/cat.js'), transformed)
  assert.equal(transformCpuModule(source, 'src/ch/other.js'), source)
  assert.equal(transformCpuModule(catFixture, 'src\\ch\\v2\\cat.js?v=pinned'), transformCpuModule(catFixture, 'src/ch/v2/cat.js'))
  assert.equal(CAT_PREPARE_CHUNK, 4096)
})

test('cat chunking preserves all five typed arrays, seed calls and rejection order exactly', () => {
  for (const N of [0, 7, 4095, 4096, 4101, 8192, 8209]) {
    const original = realm(catFixture), adapted = realm(transformCpuModule(catFixture, 'src/ch/v2/cat.js'))
    const expected = original.catShape(N), iterator = adapted.catShapeStages(N)
    assert.equal(adapted.cellsCalls, 0, 'generator body must be lazy')
    const result = consume(iterator)
    equalShape(result.value, expected)
    assert.equal(adapted.randCalls, original.randCalls, 'yielding must not consume random values')
    assert.equal(adapted.cellsCalls, original.cellsCalls, 'initial cells scan is unchanged')
    assert.equal(adapted.coatCalls, N)
    assert.equal(result.progress.length, Math.floor(N / 4096), 'chunk boundaries count accepted, not rejected points')
    result.progress.forEach((step, index) => assert.deepEqual(step, { progress: (index + 1) * 4096 / N, label: 'cat surface' }))
  }
})

test('cat stages yield after the complete accepted coat call and preserve resume state', () => {
  const context = realm(transformCpuModule(catFixture, 'src/ch/v2/cat.js')), iterator = context.catShapeStages(8200)
  const first = iterator.next()
  assert.equal(first.done, false)
  assert.equal(context.coatCalls, 4096)
  const calls = context.randCalls
  const second = iterator.next()
  assert.equal(second.done, false)
  assert.equal(context.coatCalls, 8192)
  assert.ok(context.randCalls > calls)
  const last = iterator.next()
  assert.equal(last.done, true)
  assert.equal(context.coatCalls, 8200)
  assert.equal(last.value.pos.length, 8200 * 4)
})

test('lighting stages preserve both Float32 channels and all calls/options exactly', () => {
  const transformed = transformCpuModule(bakeFixture, 'src/ch/v2/bake.js')
  assert.ok(transformed.includes(bakeBody))
  assert.equal(transformCpuModule(transformed, 'src/ch/v2/bake.js'), transformed)
  for (const N of [0, 17, 4095, 4096, 4101, 8209]) {
    const S = { pos: Float32Array.from({ length: N * 4 }, (_, i) => Math.sin(i) * .2), nrm: Float32Array.from({ length: N * 4 }, (_, i) => Math.cos(i) * .1) }
    const args = [S, N, (x, y, z) => x * .25 + y * .5 + z * .75, [0, .6, .8], { open: .11, shadow: .37 }]
    const original = realm(bakeFixture), adapted = realm(transformed)
    const expected = original.bakeLight(...args), result = consume(adapted.bakeLightStages(...args))
    assert.deepEqual(bytes(result.value), bytes(expected))
    assert.equal(adapted.openCalls, original.openCalls)
    assert.equal(adapted.shadowCalls, original.shadowCalls)
    assert.equal(result.progress.length, Math.floor(N / 4096))
    result.progress.forEach((step, index) => assert.deepEqual(step, { progress: (index + 1) * 4096 / N, label: 'cat light' }))
  }
})

const chapterFixture = `
import { CAT, catSDF, catShape } from "./v2/cat.js?v=pinned";
import { bakeLight } from "./v2/bake.js?v=pinned";
const CAT_N=262144, CAT_LIGHT=[0,3,4], TAIL_FROM=.25;
const O={you:{N:256},scene:{add(...things){added.push(things);}}};
function norm3(v){const n=Math.hypot(...v);return v.map(x=>x/n);}
function makeCat(){
  const S=catShape(CAT_N),tailAt=CAT.tail[Math.round((CAT.tail.length-1)*TAIL_FROM)];
  O.cat=new Fur(S,CAT_N,bakeLight(S,CAT_N,catSDF,norm3(CAT_LIGHT)),{ears:CAT.ears,tail:{pivot:tailAt,from:TAIL_FROM}});
  O.youCat=new Swarm({count:O.you.N,bands:true});
  O.scene.add(...O.cat.objects,O.youCat.points);
}
function result(){return O;}`

test('chapter preparation maps both phases monotonically and makeCat uses exact cached inputs', () => {
  const calls = [], added = [], shape = { pos: 'original positions' }, light = new Float32Array([.1, .2])
  const transformed = transformCpuModule(chapterFixture, 'src/ch/06_v2.js')
  assert.match(transformed, /catShape, catShapeStages/)
  assert.match(transformed, /bakeLight, bakeLightStages/)
  assert.equal(transformCpuModule(transformed, 'src/ch/06_v2.js'), transformed)
  const context = realm(transformed, {
    added,
    CAT: { tail: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], ears: [9, 10] },
    catSDF: () => 0,
    catShape: () => { throw Error('eager shape fallback must not run') },
    bakeLight: () => { throw Error('eager light fallback must not run') },
    catShapeStages: function* (N) { calls.push({ type: 'shape', N }); yield { progress: .25, label: 'cat surface' }; yield { progress: 1, label: 'cat surface' }; return shape },
    bakeLightStages: function* (S, N, sdf, L) { calls.push({ type: 'light', S, N, sdf, L: [...L] }); yield { progress: .25, label: 'cat light' }; yield { progress: 1, label: 'cat light' }; return light },
    Fur: function (S, N, baked, options) { calls.push({ type: 'fur', S, N, baked, options }); this.objects = ['original fur objects'] },
    Swarm: function (options) { calls.push({ type: 'swarm', options }); this.points = 'original points' },
  })
  const preparation = consume(context.prepareCat())
  assert.deepEqual(preparation.progress.map(step => step.progress), [.125, .5, .625, 1])
  assert.deepEqual(preparation.progress.map(step => step.label), ['cat surface', 'cat surface', 'cat light', 'cat light'])
  assert.equal(calls[0].N, 262144, 'particle count is never lowered')
  assert.equal(calls[1].S, shape)
  assert.equal(calls[1].N, 262144)
  assert.deepEqual(calls[1].L, [0, .6, .8])
  context.makeCat()
  const fur = calls.find(call => call.type === 'fur')
  assert.equal(fur.S, shape)
  assert.equal(fur.N, 262144)
  assert.equal(fur.baked, light)
  assert.deepEqual(JSON.parse(JSON.stringify(fur.options)), { ears: [9, 10], tail: { pivot: [4, 5, 6], from: .25 } })
  assert.deepEqual(JSON.parse(JSON.stringify(calls.find(call => call.type === 'swarm').options)), { count: 256, bands: true })
  assert.deepEqual(JSON.parse(JSON.stringify(added)), [['original fur objects', 'original points']])
  assert.deepEqual(consume(context.prepareCat()).progress, [], 'preparing an already prepared cat is idempotent')
})

test('makeCat retains original fallback if preparation was not run', () => {
  const calls = [], shape = {}, light = new Float32Array([.25, .75])
  const context = realm(transformCpuModule(chapterFixture, 'src/ch/06_v2.js'), {
    added: [], CAT: { tail: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], ears: [9, 10] }, catSDF: () => 0,
    catShape: N => { calls.push(['shape', N]); return shape },
    bakeLight: (S, N) => { calls.push(['light', S, N]); return light },
    catShapeStages: function* () { throw Error('stage unexpectedly ran') },
    bakeLightStages: function* () { throw Error('stage unexpectedly ran') },
    Fur: function (S, N, baked) { assert.equal(S, shape); assert.equal(baked, light); this.objects = [] },
    Swarm: function () { this.points = 'points' },
  })
  context.makeCat()
  assert.deepEqual(calls, [['shape', 262144], ['light', shape, 262144]])
})

test('changed algorithm seams fail explicitly instead of silently changing work order', () => {
  assert.throws(() => transformCpuModule(catFixture.replace('coat(S, i++', 'coat(S, ++i'), 'src/ch/v2/cat.js'), /final coat/)
  assert.throws(() => transformCpuModule(catFixture.replace('i < N;', 'i <= N;'), 'src/ch/v2/cat.js'), /outer i < N/)
  assert.throws(() => transformCpuModule(bakeFixture.replace('i++)', 'i+=2)'), 'src/ch/v2/bake.js'), /loop increment/)
  assert.throws(() => transformCpuModule(chapterFixture.replace('bakeLight(S,', 'otherBake(S,'), 'src/ch/06_v2.js'), /one bakeLight/)
})
