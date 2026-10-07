#!/usr/bin/env node
/** Full offline install -> production Host -> React/Worker -> reopen smoke.
 * This is a real-browser integration check, not a GPU stub certification.
 * Reports hashes/counts only; never reads or supplies a song recording.
 * Usage: node tools/frostnova-pack-host-smoke.mjs <pack-dir> <output-dir>
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, readdir, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:http'
import { createWorkshopManager } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { validateWorkshopPack, WORKSHOP_INDEX_FORMAT } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { SCENE_LIMITS } from '../.dsh-plugin/shared/mv-scene.mjs'

const require = createRequire(import.meta.url)
const portRequire = createRequire(new URL('../presets/ports/frostnova-web/package.json', import.meta.url))
const portModules = resolve(import.meta.dirname, '../presets/ports/frostnova-web/node_modules')
function dependency(name) { try { return portRequire(name) } catch { return require(name) } }
const { build } = dependency('esbuild')
const { chromium } = process.env.DSH_MV_PLAYWRIGHT ? require(process.env.DSH_MV_PLAYWRIGHT) : dependency('playwright')
assert.ok(process.argv[2] && process.argv[3], 'Usage: frostnova-pack-host-smoke.mjs <pack-dir> <output-dir>')
const root = resolve(process.argv[2]), out = resolve(process.argv[3]), commit = 'a'.repeat(40)
const raw = JSON.parse(await readFile(join(root, 'mv.json'), 'utf8')), id = raw['x-dsh-mv-workshop'].id
const clientVersion = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
async function collect(sub = '') {
  const files = []
  for (const ent of await readdir(join(root, sub), { withFileTypes: true })) {
    const path = [sub, ent.name].filter(Boolean).join('/')
    if (ent.isDirectory()) files.push(...await collect(path))
    else { const bytes = await readFile(join(root, path)); files.push({ path, size: bytes.length, sha256: sha(bytes), bytes }) }
  }
  return files
}
const files = await collect()
const checked = await validateWorkshopPack({ id, files, readText: p => readFile(join(root, p), 'utf8'), readBytes: p => readFile(join(root, p)) })
assert.deepEqual(checked.errors, [])
assert.ok(files.every(f => !/\.(mp3|mp2|aac|wav|m4a|mp4|flac|ogg|opus|webm)$/i.test(f.path)), 'No song recording in the pack')
const catalogue = { ...checked.meta, files: files.map(({ bytes, ...file }) => file) }
const content = new Map(files.map(f => [f.path, f.bytes]))
const index = { format: WORKSHOP_INDEX_FORMAT, version: 1, commit, packs: [catalogue] }
const installRequests = [], hostReads = []
const manager = createWorkshopManager({ root: await mkdtemp(join(tmpdir(), 'dsh-frost-offline-')), get: async url => {
  installRequests.push(url)
  if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
  const key = url.split(`/${commit}/packs/${id}/`)[1]
  assert.ok(content.has(key), 'Installer may only fetch hash-indexed pack files')
  return content.get(key)
} })
const installed = await manager.install({ id }), loaded = await loadPack(installed.manifestPath)
for (const file of catalogue.files) assert.equal(sha(await readFile(join(loaded.packDir, file.path))), file.sha256, `Installed bytes preserved: ${file.path}`)
const cues = parseLyrics(loaded.pack.lyrics.file, await readFile(join(loaded.packDir, loaded.pack.lyrics.file), 'utf8'))
const pack = { ...loaded, id, loadedAt: 1 }
const clientSource = `import React from 'react';import {createRoot} from 'react-dom/client';import {CanvasMv} from './.dsh-plugin/client/canvas-mv.jsx';import {openMediaStore,putMedia} from './.dsh-plugin/client/mv/media-store.mjs';import {mediaSlot} from './.dsh-plugin/client/mv-workshop-state.mjs';
const NativeWorker=window.Worker;window.qaWorkers=[];window.playerRef=React.createRef();let root;
window.Worker=class QaWorker extends NativeWorker{constructor(url,opt){super(url,opt);this.qa={sentFrames:0,progress:[],ready:null,terminated:false};window.qaWorkers.push(this.qa);this.addEventListener('message',e=>{const m=e.data||{};if(m.type==='preparing')this.qa.progress.push({step:m.id,progress:m.progress,label:m.label,at:performance.now()});if(m.type==='ready')this.qa.ready={error:m.error,id:m.id,at:performance.now()};if(m.type==='fatal')this.qa.fatal=m.error;});}postMessage(m,...args){if(m.type==='frame')this.qa.sentFrames++;return super.postMessage(m,...args);}terminate(){this.qa.terminated=true;return super.terminate();}};
window.mountPack=async(pack,seed=false)=>{if(root)root.unmount();if(seed){const db=await openMediaStore();await putMedia(db,mediaSlot(pack,'lyrics'),{name:'stale.json',text:JSON.stringify([{time:0,en:'STALE CACHE MUST NOT WIN'}])});}root=createRoot(document.getElementById('root'));root.render(React.createElement(CanvasMv,{pack,api:{packRead:window.hostRead},ref:window.playerRef}));};
window.qaSummary=()=>({workers:window.qaWorkers,time:window.playerRef.current?.time(),playing:window.playerRef.current?.playing(),audio:document.querySelector('audio')?.src??'',hasStatus:!!document.querySelector('[role="status"]'),fallback:[...document.querySelectorAll('.mv-alert-warn')].map(e=>e.innerText).filter(t=>/场景脚本/.test(t)),sourceValues:[...document.querySelectorAll('.mv-source-value')].map(e=>e.innerText)});`
const bundle = await build({ stdin: { contents: clientSource, resolveDir: resolve(import.meta.dirname, '..'), sourcefile: 'frostnova-full-pack-qa.jsx' }, nodePaths: [portModules], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(clientVersion), 'process.env.NODE_ENV': '"production"' } })
const css = await readFile(new URL('../.dsh-plugin/client/mv.css', import.meta.url), 'utf8')
const server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#10141c;color:white}#root{width:960px}</style><div id="root"></div>') })
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const gpuMode = process.env.DSH_MV_GPU_MODE === 'native' ? 'native' : 'swiftshader'
const executablePath = process.env.DSH_MV_CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true, args: gpuMode === 'swiftshader' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] })
const report = { id, clientVersion, browser: await browser.version(), gpuMode, files: files.length, bytes: files.reduce((n, f) => n + f.size, 0), cueCount: cues.length, scriptHash: files.find(f => f.path === pack.pack.canvas.script).sha256, installHashVerified: true, songRecordingFiles: 0, installRequests, hostReads, passes: [], errors: [], consoleErrors: [], externalRequests: [], passed: false }
await mkdir(out, { recursive: true })
let page
try {
  page = await browser.newPage({ viewport: { width: 1000, height: 900 } })
  page.on('pageerror', e => report.errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push(m.text()) })
  page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith(origin)) report.externalRequests.push(r.url()) })
  await page.route('**/*', route => { const url = route.request().url(); return /^https?:/.test(url) && !url.startsWith(origin) ? route.abort() : route.continue() })
  await page.exposeFunction('hostRead', async request => {
    assert.equal(request.manifestPath, pack.manifestPath, 'Host reads are scoped to the installed manifest')
    assert.notEqual(request.role, 'audio', 'Audio must never be requested')
    hostReads.push({ role: request.role, asset: request.asset, part: request.part, offset: request.offset })
    return { ok: true, value: await readPackFile(parsePackRead(request)) }
  })
  for (const pass of [1, 2]) {
    await page.goto(origin); await page.addStyleTag({ content: css }); await page.addScriptTag({ content: bundle.outputFiles[0].text })
    report.gpu ??= await page.evaluate(() => { const gl = new OffscreenCanvas(4, 4).getContext('webgl2'), ext = gl?.getExtension('WEBGL_debug_renderer_info'); return { version: gl?.getParameter(gl.VERSION), renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER) } })
    const lyricsReads = hostReads.filter(r => r.role === 'lyrics').length, start = Date.now()
    await page.evaluate(({ pack, seed }) => window.mountPack(pack, seed), { pack: { ...pack, loadedAt: pass }, seed: pass === 1 })
    // This observation allowance exceeds the supervisor's fixed deadline, so
    // production timeout failures remain visible; no worker limit is changed.
    await page.waitForFunction(n => {
      const w = window.qaWorkers[0]
      if (w?.fatal || w?.ready?.error || [...document.querySelectorAll('.mv-alert-warn')].some(e => /场景脚本无法运行|场景脚本已停用/.test(e.innerText))) return true
      return w?.ready && !document.querySelector('[role="status"]') && [...document.querySelectorAll('.mv-source-value')].some(e => e.innerText.includes('（' + n + ' 句'))
    }, cues.length, { timeout: SCENE_LIMITS.prepareTotalTimeoutMs + SCENE_LIMITS.setupTimeoutMs + 20000 })
    const ready = await page.evaluate(() => window.qaSummary())
    assert.deepEqual(ready.fallback, []); assert.ok(ready.workers[0].ready && !ready.workers[0].ready.error && !ready.workers[0].fatal, JSON.stringify(ready.workers[0]))
    assert.equal(ready.audio, ''); assert.equal(ready.playing, false); assert.equal(ready.time, 0)
    assert.ok(ready.sourceValues.some(v => v.includes(`lyrics.json（${cues.length} 句`))); assert.ok(!ready.sourceValues.some(v => v.includes('stale.json')))
    assert.ok(hostReads.filter(r => r.role === 'lyrics').length > lyricsReads, 'Reopen re-reads the bundled lyrics instead of old local cache')
    await page.evaluate(() => window.playerRef.current.seek(23)); await page.waitForTimeout(1800)
    const pixels = await page.locator('canvas.mv-pixel').evaluate(c => { const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let bright=0;for(let i=0;i<d.length;i+=64)if(d[i]+d[i+1]+d[i+2]>80)bright++;return bright })
    assert.ok(pixels > 200, 'Installed native 3D bitmap must contain a real nonblank frame')
    const final = await page.evaluate(() => window.qaSummary()); assert.deepEqual(final.fallback, [])
    await page.locator('canvas.mv-pixel').screenshot({ path: join(out, `offline-installed-pass-${pass}.png`) })
    const progress = ready.workers[0].progress
    report.passes.push({ pass, elapsedMs: Date.now() - start, preparationSteps: ready.workers[0].ready.id, progressMessages: progress.length, firstProgress: progress[0], lastProgress: progress.at(-1), automaticCues: cues.length, staleCacheIgnored: true, noAudio: true, nonblankPixelSamples: pixels })
    await writeFile(join(out, 'install-browser-report.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ pass, ...report.passes.at(-1) }))
    await page.evaluate(() => { window.mountPack({ id: 'empty', empty: true, loadedAt: 100, pack: { title: 'empty', canvas: { renderer: 'generic' } } }) })
    await page.waitForFunction(() => window.qaWorkers[0].terminated)
  }
  assert.deepEqual(report.errors, []); assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.consoleErrors, []); report.passed = true
  console.log(JSON.stringify({ passed: true, id, files: report.files, cueCount: cues.length, passes: report.passes.length, out }))
} catch (error) {
  report.failure = { message: error.message, stack: error.stack }
  if (page) { try { report.failureSnapshot = await page.evaluate(() => window.qaSummary()); await page.screenshot({ path: join(out, 'failure.png') }) } catch { /* page may be gone */ } }
  throw error
} finally {
  await writeFile(join(out, 'install-browser-report.json'), JSON.stringify(report, null, 2) + '\n')
  await browser.close(); await new Promise(r => server.close(r))
}
