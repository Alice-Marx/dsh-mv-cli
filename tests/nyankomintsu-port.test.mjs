import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse, featureShards, unicodeCovered, staticSceneRegistry, adaptModule, chapterMetadata, CHAPTERS, ART_NAMES, SECTIONS, UPSTREAM_COMMIT, sha256 } from '../presets/ports/nyankomintsu/build.mjs'
import { mergeShards } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { sceneSourceProblems } from '../.dsh-plugin/shared/mv-scene.mjs'
import { flashCheck } from '../presets/ports/nyankomintsu/flash-check.mjs'

test('Nyankomint numerical shards reconstruct all top-level arrays and metadata exactly', () => {
  const data = { meta: { fps: 60, duration: 211.9576, frames: 12718 }, grid: { t0: .344, period: .461538 }, bpm: 130,
    onsets: { t: [.1,.3], s: [.2,.4] }, rms: Array.from({length:12718},(_,i)=>Math.sin(i)*.5+.5),
    spectrum: Array.from({length:12718*32},(_,i)=>i%256), empty: [] }
  const shards = featureShards(data)
  assert.ok(shards.length > 1 && shards.length <= 16)
  assert.ok(shards.every(s => Buffer.byteLength(JSON.stringify(s)) + 1 <= 500*1024))
  assert.deepEqual(mergeShards(shards), data)
})

test('Nyankomint offline CJK range selection includes intervals, singleton and wildcard forms', () => {
  assert.ok(unicodeCovered('U+4E00-4EFF,U+516D,U+11??', 0x516d))
  assert.ok(unicodeCovered('U+4E00-4EFF,U+516D,U+11??', 0x11a2))
  assert.ok(unicodeCovered('U+4E00-4EFF,U+516D,U+11??', 0x4e20))
  assert.equal(unicodeCovered('U+4E00-4EFF,U+516D,U+11??', 0x516e), false)
  assert.equal(unicodeCovered('invalid', 0x30), false)
})

test('Nyankomint static registry keeps all 15 musical modules and original warning/overlay', () => {
  assert.equal(SECTIONS.length, 15)
  assert.equal(ART_NAMES.length, 8)
  const registry = staticSceneRegistry(), ast = parse(registry, {ecmaVersion:'latest',sourceType:'module'})
  assert.equal(ast.body.filter(n=>n.type==='ImportDeclaration').length, 18)
  for (const [,fn] of SECTIONS) assert.ok(registry.includes(`...${fn}(env)`))
  assert.ok(registry.includes('prerollShot(env)'))
  assert.ok(registry.includes('overlayScene(env)'))
  assert.ok(registry.includes('initHistory();'))
  assert.ok(!registry.includes('fallbackShot('))
})

test('Nyankomint canvas seam and ImageBitmap loader seam are narrowly pinned', () => {
  assert.equal(adaptModule("const c = document.createElement('canvas');\r\nconst keep=42;",'src/components/plate.js'), 'const c = new OffscreenCanvas(8, 8);\nconst keep=42;')
  const art = 'export async function loadArt(){ throw new Error("never called"); }\nclass Art { init(img) { const W = img.naturalWidth, H = img.naturalHeight, N = W * H; } }'
  const adapted = adaptModule(art, 'src/engine/art.js')
  assert.ok(!adapted.includes('never called'))
  assert.ok(adapted.includes('const W = img.width, H = img.height, N = W * H;'))
  assert.throws(()=>adaptModule('export function createEngine() {}','src/engine/engine.js'),/Pinned source seam changed/)
})

test('Nyankomint chapter navigation derives all fourteen original chapter boundaries from exact cuts', () => {
  const cuts = CHAPTERS.map(([prefixes], i) => ({ id: prefixes[0] + '-test', at: i * 10, until: (i + 1) * 10 }))
  const sections = chapterMetadata([{ id:'preroll', at:-5, until:0 }, ...cuts], 140)
  assert.equal(sections.length, 14)
  assert.equal(sections[0].start, 0)
  assert.equal(sections.at(-1).end, 140)
  sections.slice(1).forEach((s,i)=>assert.equal(s.start,sections[i].end))
  assert.throws(()=>chapterMetadata([...cuts, {id:'unclassified',at:5,until:6}],140),/Unclassified original shot/)
})

test('Nyankomint flash regression measures opposing general/red transitions and isolated pops', () => {
  const black=new Uint8Array(64*36*3),white=new Uint8Array(64*36*3).fill(255),red=Uint8Array.from(black,(_,i)=>i%3?0:255)
  const alternating=color=>Array.from({length:121},(_,i)=>i%2?color:black)
  const general=flashCheck(alternating(white),60,-5),saturated=flashCheck(alternating(red),60,148)
  assert.equal(general.general.maxFlashesPerSecond,30)
  assert.equal(general.general.largeTransitions,120)
  assert.equal(general.red.maxFlashesPerSecond,0)
  assert.equal(general.hardChanges.busiestSecond,60)
  assert.equal(general.singleFramePops.length,119)
  assert.equal(saturated.red.maxFlashesPerSecond,30)
  assert.equal(saturated.red.windowStart,148)
  assert.throws(()=>flashCheck([new Uint8Array(3)],60),/64x36 RGB/)
})

test('Nyankomint generated pack preserves pinned assets, feature values and all faces', {skip: !process.env.DSH_NYAN_PACK || !process.env.DSH_NYAN_UPSTREAM}, () => {
  const packDir=process.env.DSH_NYAN_PACK, upstream=process.env.DSH_NYAN_UPSTREAM
  const read = path=>readFileSync(join(packDir,path)), manifest=JSON.parse(read('mv.json')), p=JSON.parse(read('source-provenance.json'))
  assert.equal(p.commit,UPSTREAM_COMMIT)
  assert.equal(p.shots,87); assert.equal(p.captions.exact,129)
  assert.equal(manifest.canvas.preroll,5)
  assert.equal(manifest.canvas.fonts.length,34)
  assert.equal(Object.keys(manifest.canvas.assets).length,14)
  assert.equal(manifest['x-dsh-mv-ai'].sections.length,14)
  const shotProvenance=JSON.parse(read('shot-provenance.json'))
  assert.equal(shotProvenance.shots.length,87)
  assert.deepEqual(shotProvenance.chapters,manifest['x-dsh-mv-ai'].sections)
  assert.deepEqual(sceneSourceProblems(read('scenes.js').toString(),{output:'webgl'}),[])
  const features=mergeShards(manifest.canvas.assets.features.map(path=>JSON.parse(read(path))))
  assert.deepEqual(features,JSON.parse(readFileSync(join(upstream,'data/audio_features.json'),'utf8')))
  for (const art of p.art) assert.equal(sha256(read(art.path)),sha256(readFileSync(join(upstream,art.source))))
  for (const face of manifest.canvas.fonts) assert.ok(existsSync(join(packDir,face.file))&&existsSync(join(packDir,face.licenseFile)))
  assert.equal(JSON.parse(read('lyrics.json')).lines.length,129)
})
