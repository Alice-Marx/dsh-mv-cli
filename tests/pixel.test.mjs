import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { parseMvPack, MV_PIXEL_LIMITS } from '../.dsh-plugin/shared/mv-pack.mjs'
import { sceneWorkerSource, SCENE_BLOCKED_GLOBALS } from '../.dsh-plugin/shared/mv-scene.mjs'
import { checkScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { checkScriptSafety, packRequires, parseWorkshopIndex, validateWorkshopPack, WORKSHOP_INDEX_FORMAT } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { mergeShards, loadSceneAssets } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { tooOld } from '../.dsh-plugin/client/mv-workshop-state.mjs'

const PAINT = 'let n = 0\nfunction setup(info) { n = info.assets?.data?.items?.length ?? 0 }\nfunction paint(g, t, w, h) { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) g.fillRect(i * 10, 10, 8, 8) }'
const manifest = canvas => ({ format: 'dsh-mv-pack', version: 1, title: 'P', canvas: { renderer: 'script', script: 'scenes.js', ...canvas } })

test('pack: canvas.output / canvas.size (pixel scenes)', () => {
  const ok = parseMvPack(manifest({ output: 'pixels', size: [1920, 1080] }))
  assert.equal(ok.canvas.output, 'pixels'); assert.deepEqual(ok.canvas.size, [1920, 1080])
  assert.deepEqual(parseMvPack(manifest({ output: 'pixels' })).canvas.size, MV_PIXEL_LIMITS.defaultSize)
  // 0.9.2: 'webgl' is now a valid output (Three.js etc.); sizes are validated in the pixels / webgl branches.
  for (const bad of [{ output: 'pixels', size: [4000, 1000] }, { output: 'pixels', size: [100, 50] }, { size: [1280, 720] }, { output: 'pixels', size: [1280, 720] /* still ok */ }]) {
    if (bad.output === 'pixels' && bad.size && bad.size[0] === 1280) continue
    assert.throws(() => parseMvPack(manifest(bad)), undefined, JSON.stringify(bad))
  }
  assert.throws(() => parseMvPack({ ...manifest({}), canvas: { renderer: 'generic', output: 'pixels' } }))
})

test('pack: canvas.output "webgl" (0.9.2) — Three.js / Babylon.js / hand-written WebGL2', () => {
  const webgl = parseMvPack(manifest({ output: 'webgl', size: [1920, 1080] }))
  assert.equal(webgl.canvas.output, 'webgl'); assert.deepEqual(webgl.canvas.size, [1920, 1080])
  assert.deepEqual(parseMvPack(manifest({ output: 'webgl' })).canvas.size, MV_PIXEL_LIMITS.defaultSize)
  // size is still validated for webgl:
  for (const bad of [{ output: 'webgl', size: [4000, 1000] }, { output: 'webgl', size: [100, 50] }]) assert.throws(() => parseMvPack(manifest(bad)), undefined, JSON.stringify(bad))
  assert.throws(() => parseMvPack({ ...manifest({}), canvas: { renderer: 'generic', output: 'webgl' } }))
})

test('pixel worker: 2D only, paint() gets a reused canvas, blocked font loading', () => {
  const source = sceneWorkerSource(PAINT, { output: 'pixels' })
  assert.match(source, /transferToImageBitmap/)
  assert.match(source, /'2d'/)
  assert.match(source, /paint/)
  for (const name of ['FontFace', 'fonts']) assert.ok(SCENE_BLOCKED_GLOBALS.includes(name), name)
})

test('pixel scenes in the Host check: calls are counted, an empty frame is a problem, assets reach setup()', () => {
  const info = { duration: 10, assets: { data: { items: [1, 2, 3] } } }
  const good = checkScene(PAINT, { times: [0, 5], output: 'pixels', size: [640, 360], info })
  assert.equal(good.ok, true, good.problems.join('; '))
  assert.ok(good.frames.every(f => f.calls === 4), JSON.stringify(good.frames)) // background + one square per asset item
  const blank = checkScene('function paint(g, t, w, h) {}', { times: [1], output: 'pixels', size: [640, 360] })
  assert.ok(blank.problems.some(p => /没有画/.test(p)))
  // Only 2D contexts: WebGL / WebGPU give null.
  const webgl = checkScene('function paint(g, t, w, h) { const c = new OffscreenCanvas(4, 4); if (c.getContext("webgl") || c.getContext("webgpu") || c.getContext("bitmaprenderer")) g.fillRect(0, 0, 1, 1) }', { times: [1], output: 'pixels', size: [640, 360] })
  assert.ok(webgl.problems.some(p => /没有画/.test(p)))
  assert.deepEqual(checkScriptSafety(PAINT).errors, [])
  assert.ok(checkScriptSafety('const x = 1').errors.some(e => /render|paint/.test(e)))
})

test('requires: pixel and asset scripts need 0.9.1; old clients are told to update', () => {
  assert.equal(packRequires({ canvas: { renderer: 'script', output: 'pixels' } }), '0.9.1')
  assert.equal(packRequires({ canvas: { renderer: 'script', assets: { d: 'd.json' } } }), '0.9.1')
  assert.equal(packRequires({ canvas: { renderer: 'script' } }), undefined)
  assert.equal(packRequires({ canvas: { renderer: 'script' } }, '1.2.0'), '1.2.0')
  assert.equal(packRequires({ canvas: { renderer: 'script', output: 'pixels' } }, '0.9.0'), '0.9.1')
  const file = { path: 'mv.json', size: 10, sha256: 'b'.repeat(64) }
  const index = parseWorkshopIndex({ format: WORKSHOP_INDEX_FORMAT, version: 1, commit: 'c'.repeat(40), packs: [{ id: 'pix-pack', title: 'P', files: [file], license: 'MIT', version: '1.0.0', requires: '0.9.1' }] })
  assert.equal(index.packs[0].requires, '0.9.1')
  assert.equal(tooOld(index.packs[0], '0.9.0'), true)
  assert.equal(tooOld(index.packs[0], '0.9.1'), false)
  assert.equal(tooOld({ id: 'x' }, '0.1.0'), false)
})

test('scene assets: JSON shards are merged; images are skipped without a decoder', async () => {
  const enc = new TextEncoder()
  const files = { data: [enc.encode(JSON.stringify({ items: [1, 2], name: 'a' })), enc.encode(JSON.stringify({ items: [3] }))], pic: [new Uint8Array([1])] }
  const pack = { canvas: { assets: { data: ['data/a.json', 'data/b.json'], pic: 'cover.png' } } }
  const { assets, transfer } = await loadSceneAssets(async name => files[name], pack, { images: false })
  assert.deepEqual(assets.data, { items: [1, 2, 3], name: 'a' })
  assert.equal(assets.pic, undefined); assert.deepEqual(transfer, [])
  assert.deepEqual(mergeShards([{ a: [1] }, { a: [2], b: 1 }]), { a: [1, 2], b: 1 })
})

// The two ported packs: built from the upstream checkouts when they are present (DSH_MV_PORT_SRC, default /workspace/src3).
const SRC = process.env.DSH_MV_PORT_SRC || '/workspace/src3'
for (const [id, dir, script] of [['world-execute-me-wallpaper', 'world.execute-me-wallpaper', 'wallpaper'], ['polytech-tree', 'polytech-tree', 'polytech-tree']]) {
  test(`port ${id}: builds, passes the workshop rules and draws in the sandbox`, { skip: existsSync(join(SRC, dir)) ? false : `no checkout in ${SRC}` }, async () => {
    const out = join(mkdtempSync(join(tmpdir(), 'dsh-mv-port-')), id)
    execFileSync(process.execPath, [`presets/ports/${script}/build.mjs`, join(SRC, dir), out], { env: { ...process.env, SRC_COMMIT: '0'.repeat(40) }, stdio: 'pipe' })
    const walk = d => readdirSync(d).flatMap(n => statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [relative(out, join(d, n)).split('\\').join('/')])
    const files = walk(out).map(path => ({ path, size: statSync(join(out, path)).size }))
    const read = async p => readFileSync(join(out, p), 'utf8')
    const result = await validateWorkshopPack({ id, files, readText: read })
    assert.deepEqual(result.errors, [])
    const pack = result.pack
    const output = id === 'polytech-tree' ? 'webgl' : 'pixels'
    assert.equal(pack.canvas.output, output)
    assert.equal(packRequires(pack, result.meta.requires), output === 'webgl' ? '0.9.2' : '0.9.1')
    assert.ok(result.meta.source?.includes('github.com'))
    for (const f of files) assert.ok(!/\.(mp3|flac|wav|ogg|m4a|lrc)$/i.test(f.path), f.path)
    const assets = {}
    for (const [name, value] of Object.entries(pack.canvas.assets ?? {})) {
      const shards = await Promise.all((Array.isArray(value) ? value : [value]).filter(p => p.endsWith('.json')).map(async p => JSON.parse(await read(p))))
      if (shards.length) assets[name] = shards.length === 1 ? shards[0] : mergeShards(shards)
    }
    const duration = pack.duration ?? result.meta.duration
    const check = checkScene(await read(pack.canvas.script), { times: [1, duration / 2, duration - 1], output, size: pack.canvas.size, info: { duration, title: pack.title, sections: pack.sections ?? [], bpm: pack.canvas.bpm ?? 0, beatOffset: pack.canvas.beatOffset ?? 0, assets } })
    assert.equal(check.ok, true, check.problems.join('; '))
    assert.ok(check.frames.every(f => output === 'webgl' ? f.drawCalls >= 3 : f.calls > 50), JSON.stringify(check.frames))
    if (output === 'webgl') assert.equal(check.gpuValidated, false)
  })
}
