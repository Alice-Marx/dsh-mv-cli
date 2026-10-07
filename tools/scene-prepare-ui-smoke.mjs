#!/usr/bin/env node
/** Production React UI + Host reads + native WebGL worker preparation QA.
 * All captions/visuals are synthetic; the only audio is a locally made silent WAV.
 * Worker instrumentation observes messages/termination without changing any deadlines.
 * Usage: node tools/scene-prepare-ui-smoke.mjs [output-dir]
 * Set DSH_MV_PLAYWRIGHT / DSH_MV_CHROME when they are not available on PATH.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:http'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { SCENE_LIMITS, PIXEL_SCENE_LIMITS } from '../.dsh-plugin/shared/mv-scene.mjs'

const require = createRequire(import.meta.url)
const portRequire = createRequire(new URL('../presets/ports/frostnova-web/package.json', import.meta.url))
const portModules = resolve(import.meta.dirname, '../presets/ports/frostnova-web/node_modules')
function dependency(name) { try { return portRequire(name) } catch { return require(name) } }
const { build } = dependency('esbuild')
const { chromium } = process.env.DSH_MV_PLAYWRIGHT ? require(process.env.DSH_MV_PLAYWRIGHT) : dependency('playwright')
const out = resolve(process.argv[2] || join(tmpdir(), 'dsh-mv-scene-prepare-ui-qa'))
const fixtureRoot = await mkdtemp(join(tmpdir(), 'dsh-mv-prepare-fixtures-'))
const clientVersion = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version
const duration = 30, steps = 25, stepMs = 100
const lyrics = [{ time: 0, end: 10, en: 'SYNTHETIC FIRST CUE', zh: '合成测试第一句' }, { time: 10, end: 20, en: 'SYNTHETIC SECOND CUE', zh: '合成测试第二句' }, { time: 20, end: 30, en: 'SYNTHETIC FINAL CUE', zh: '合成测试第三句' }]
const slowSource = `let prepared=false;
function setup(info,gl){if(info.canvas.getContext('webgl2')!==gl)throw Error('wrong WebGL context');}
function* prepare(info,gl){for(let i=0;i<${steps};i++){const until=Date.now()+${stepMs};while(Date.now()<until){};yield {progress:(i+1)/${steps + 1},label:'SYNTHETIC GPU STAGE '+(i+1)};}prepared=true;}
function paint(gl,t,w,h,ctx){if(!prepared)throw Error('paint ran before preparation');gl.viewport(0,0,w,h);gl.clearColor(.05,.25,.8,1);gl.clear(gl.COLOR_BUFFER_BIT);}`
const legacySource = `function paint(gl,t,w,h,ctx){gl.viewport(0,0,w,h);gl.clearColor(.05,.65,.2,1);gl.clear(gl.COLOR_BUFFER_BIT);}`
const packs = new Map()
for (const [id, slow] of [['silent', true], ['cancel', true], ['toggle', true], ['audio', true], ['switch-old', true], ['switch-new', false], ['unmount', true], ['legacy', false]]) {
  const dir = join(fixtureRoot, id)
  await mkdir(dir)
  await writeFile(join(dir, 'scenes.js'), slow ? slowSource : legacySource)
  await writeFile(join(dir, 'lyrics.json'), JSON.stringify(lyrics))
  await writeFile(join(dir, 'mv.json'), JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: `PREPARE QA ${id}`, artist: 'Synthetic QA', duration, lyrics: { file: 'lyrics.json' }, canvas: { renderer: 'script', script: 'scenes.js', output: 'webgl', size: [320, 180], subtitles: true }, 'x-dsh-mv-workshop': { id: `prepare-qa-${id}`, version: '1.0.0', requires: clientVersion, license: 'MIT', audio: { duration } } }))
  const loaded = await loadPack(dir)
  assert.deepEqual(loaded.warnings, [])
  packs.set(id, { ...loaded, id: `prepare-qa-${id}`, loadedAt: 1 })
}
// PCM mono silence: valid local audio exercises the actual HTMLMediaElement clock.
const sampleRate = 8000, dataBytes = sampleRate * duration * 2
const wav = Buffer.alloc(44 + dataBytes)
wav.write('RIFF', 0); wav.writeUInt32LE(36 + dataBytes, 4); wav.write('WAVEfmt ', 8)
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22)
wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28)
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(dataBytes, 40)

const clientSource = `import React from 'react';import {createRoot} from 'react-dom/client';import {CanvasMv} from './.dsh-plugin/client/canvas-mv.jsx';import {openMediaStore,putMedia} from './.dsh-plugin/client/mv/media-store.mjs';import {mediaSlot} from './.dsh-plugin/client/mv-workshop-state.mjs';
const NativeWorker=window.Worker;window.workerLog=[];window.audioEvents=[];window.playerRef=React.createRef();window.stateLog=[];
window.Worker=class QaWorker extends NativeWorker{constructor(url,options){super(url,options);this.qa={title:'',sent:[],received:[],terminated:false};window.workerLog.push(this.qa);this.addEventListener('message',event=>{const m=event.data||{};this.qa.received.push({type:m.type,id:m.id,progress:m.progress,label:m.label,error:m.error,at:performance.now()});});}postMessage(message,...args){if(message.type==='init')this.qa.title=message.info.title;this.qa.sent.push({type:message.type,id:message.id,at:performance.now()});return super.postMessage(message,...args);}terminate(){this.qa.terminated=true;this.qa.terminatedAt=performance.now();return super.terminate();}};
let root=null;window.mountPack=async(pack,seed=false)=>{if(seed){const db=await openMediaStore();await putMedia(db,mediaSlot(pack,'lyrics'),{name:'stale.json',text:JSON.stringify([{time:0,en:'STALE CACHE MUST NOT WIN'}])});}if(!root)root=createRoot(document.getElementById('root'));root.render(React.createElement(CanvasMv,{pack,api:{packRead:window.hostRead},ref:window.playerRef,onState:s=>window.stateLog.push({...s,at:performance.now()})}));};
window.unmountPack=()=>{if(root){root.unmount();root=null;}};
for(const name of ['play','playing','pause','ended'])document.addEventListener(name,e=>{if(e.target.tagName==='AUDIO')window.audioEvents.push({type:name,at:performance.now(),time:e.target.currentTime,src:e.target.src});},true);
window.qaSnapshot=()=>{const a=document.querySelector('audio'),p=window.playerRef.current;return {time:p?.time()??null,playing:p?.playing()??null,audio:a?{time:a.currentTime,paused:a.paused,src:a.src,currentSrc:a.currentSrc}:null,preparing:document.querySelector('[role="status"]')?.textContent??'',body:document.body.innerText,workers:window.workerLog.map(w=>({...w})),audioEvents:[...window.audioEvents]};};`
const bundle = await build({ stdin: { contents: clientSource, resolveDir: resolve(import.meta.dirname, '..'), sourcefile: 'scene-prepare-ui-qa.jsx' }, nodePaths: [portModules], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(clientVersion), 'process.env.NODE_ENV': '"production"' } })
const css = await readFile(new URL('../.dsh-plugin/client/mv.css', import.meta.url), 'utf8')
const server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#10141c;color:white}#root{width:960px}</style><div id="root"></div>') })
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const gpuMode = process.env.DSH_MV_GPU_MODE === 'native' ? 'native' : 'swiftshader'
const executablePath = process.env.DSH_MV_CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true, args: gpuMode === 'swiftshader' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] })
const report = { browser: await browser.version(), gpuMode, clientVersion, protocolLimits: { setupMs: SCENE_LIMITS.setupTimeoutMs, prepareStepMs: SCENE_LIMITS.prepareStepTimeoutMs, prepareTotalMs: SCENE_LIMITS.prepareTotalTimeoutMs, prepareMaxSteps: SCENE_LIMITS.prepareMaxSteps, frameTimeoutMs: SCENE_LIMITS.hardTimeoutMs, pixelFrameBudgetMs: PIXEL_SCENE_LIMITS.frameBudgetMs }, syntheticPreparation: { steps, stepMs }, fixtureRoot, cases: [], hostReads: [], externalRequests: [], errors: [], passed: false }
await mkdir(out, { recursive: true })
async function pageFor(id, seed = false) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } })
  page.on('pageerror', e => report.errors.push({ id, message: e.message }))
  page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith(origin)) report.externalRequests.push(r.url()) })
  await page.route('**/*', route => { const url = route.request().url(); return /^https?:/.test(url) && !url.startsWith(origin) ? route.abort() : route.continue() })
  await page.exposeFunction('hostRead', async request => {
    assert.ok([...packs.values()].some(p => p.manifestPath === request.manifestPath), 'Host read is restricted to synthetic fixture manifests')
    report.hostReads.push({ id, role: request.role })
    return { ok: true, value: await readPackFile(parsePackRead(request)) }
  })
  await page.goto(origin)
  await page.addStyleTag({ content: css }); await page.addScriptTag({ content: bundle.outputFiles[0].text })
  await page.evaluate(({ pack, seed }) => window.mountPack(pack, seed), { pack: packs.get(id), seed })
  await page.waitForFunction(() => !!window.playerRef.current)
  return page
}
const transport = page => page.locator('.mv-playerbar .mv-round')
const snapshot = page => page.evaluate(() => window.qaSnapshot())
async function waitPreparing(page) {
  await page.waitForFunction(() => window.workerLog.some(w => w.received.some(m => m.type === 'preparing' && m.progress > 0)) && !!document.querySelector('[role="status"]'), null, { timeout: 10000 })
  const s = await snapshot(page)
  assert.match(s.preparing, /正在预热 3D 资源/)
  assert.equal(s.playing, false)
  return s
}
async function waitReady(page, id) {
  await page.waitForFunction(title => window.workerLog.some(w => w.title === title && w.received.some(m => m.type === 'ready' && !m.error)) && !document.querySelector('[role="status"]'), packs.get(id).pack.title, { timeout: 15000 })
  await page.waitForFunction(() => [...document.querySelectorAll('.mv-source-value')].some(e => e.textContent.includes('lyrics.json（3 句')))
  const s = await snapshot(page)
  assert.ok(!s.body.includes('场景脚本无法运行') && !s.body.includes('场景脚本已停用'), s.body)
  assert.equal(await page.locator('.mv-alert-error').count(), 0)
  return s
}
function assertWaiting(s) {
  assert.equal(s.playing, false, 'transport must remain paused during preparation')
  assert.equal(s.time, 0, 'silent/audio master clock must not advance early')
  assert.equal(s.workers[0].sent.filter(m => m.type === 'frame').length, 0, 'no premature paint request')
  assert.equal(s.audioEvents.filter(e => e.type === 'play').length, 0, 'audio must not start early')
}
try {
  {
    const page = await pageFor('silent'); await waitPreparing(page); await transport(page).click(); await page.waitForTimeout(350)
    const waiting = await snapshot(page); assertWaiting(waiting)
    await page.screenshot({ path: join(out, 'silent-waiting.png') })
    await waitReady(page, 'silent'); await page.waitForFunction(() => window.playerRef.current.playing() && window.playerRef.current.time() > .15)
    await page.evaluate(() => window.playerRef.current.pause())
    const paused = await snapshot(page); await page.waitForTimeout(300); assert.equal((await snapshot(page)).time, paused.time)
    report.cases.push({ name: 'silent playback is queued until ready', waitingTime: waiting.time, startedAfterReady: true, pausedClockStable: true }); await page.close()
  }
  {
    const page = await pageFor('cancel'); await waitPreparing(page); await transport(page).click(); await page.evaluate(() => window.playerRef.current.pause())
    await waitReady(page, 'cancel'); await page.waitForTimeout(300); const s = await snapshot(page)
    assert.equal(s.playing, false); assert.equal(s.time, 0)
    report.cases.push({ name: 'imperative pause cancels queued playback', remainedPausedAfterReady: true }); await page.close()
  }
  {
    const page = await pageFor('toggle'); await waitPreparing(page); await transport(page).click(); await transport(page).click()
    await waitReady(page, 'toggle'); await page.waitForTimeout(300); const s = await snapshot(page)
    assert.equal(s.playing, false); assert.equal(s.time, 0)
    report.cases.push({ name: 'second UI transport click cancels queued playback', remainedPausedAfterReady: true }); await page.close()
  }
  {
    const page = await pageFor('audio'); await waitPreparing(page)
    const chooser = page.waitForEvent('filechooser')
    await page.locator('.mv-sources .mv-source').first().locator('button').click()
    await (await chooser).setFiles({ name: 'synthetic-silence.wav', mimeType: 'audio/wav', buffer: wav })
    await page.waitForFunction(() => document.querySelector('audio').src.startsWith('blob:') && [...document.querySelectorAll('.mv-source-value')].some(e => e.textContent.includes('synthetic-silence.wav')))
    await transport(page).click(); await page.waitForTimeout(250)
    const waiting = await snapshot(page); assertWaiting(waiting); assert.ok(waiting.audio.src.startsWith('blob:'))
    await page.screenshot({ path: join(out, 'audio-waiting.png') })
    await waitReady(page, 'audio'); await page.waitForFunction(() => !document.querySelector('audio').paused && document.querySelector('audio').currentTime > .2)
    const ready = await snapshot(page)
    assert.equal(ready.audio.src, waiting.audio.src, 'late resource preparation must not clear the user-selected audio')
    assert.ok(ready.body.includes('synthetic-silence.wav')); assert.equal(ready.audioEvents.filter(e => e.type === 'play').length, 1)
    await page.evaluate(() => window.playerRef.current.pause())
    report.cases.push({ name: 'new local WAV survives preparation and starts only when ready', preservedBlob: true, audioPlayEvents: 1, preparedDurationMs: ready.workers[0].received.find(m => m.type === 'ready').at - ready.workers[0].received.find(m => m.type === 'preparing').at }); await page.close()
  }
  {
    const page = await pageFor('switch-old'); await waitPreparing(page); await transport(page).click()
    await page.evaluate(pack => window.mountPack(pack), packs.get('switch-new'))
    await waitReady(page, 'switch-new'); await page.waitForTimeout(steps * stepMs + 150)
    const s = await snapshot(page)
    assert.equal(s.workers[0].terminated, true, 'switch must terminate old preparation worker')
    assert.equal(s.workers[0].received.filter(m => m.type === 'ready').length, 0)
    assert.equal(s.playing, false); assert.equal(s.time, 0)
    await transport(page).click(); await page.waitForFunction(() => window.playerRef.current.playing())
    await page.evaluate(() => window.playerRef.current.pause())
    report.cases.push({ name: 'switching packs terminates old preparation and cannot start the new pack', oldWorkerTerminated: true, oldReadyNeverDelivered: true, newPackRequiresOwnPlay: true }); await page.close()
  }
  {
    const page = await pageFor('unmount'); await waitPreparing(page); await transport(page).click(); await page.evaluate(() => window.unmountPack())
    await page.waitForTimeout(steps * stepMs + 150)
    const s = await snapshot(page)
    assert.equal(s.workers[0].terminated, true); assert.equal(s.workers[0].received.filter(m => m.type === 'ready').length, 0)
    assert.equal(s.audioEvents.filter(e => e.type === 'play').length, 0); assert.equal(await page.locator('#root').innerHTML(), '')
    await page.evaluate(pack => window.mountPack(pack), packs.get('legacy')); await waitReady(page, 'legacy')
    assert.equal((await snapshot(page)).playing, false)
    report.cases.push({ name: 'unmount cancels preparation and queued playback', oldWorkerTerminated: true, emptyAfterUnmount: true, remountPaused: true }); await page.close()
  }
  {
    const page = await pageFor('legacy', true); await waitReady(page, 'legacy')
    const s = await snapshot(page)
    assert.equal(s.workers[0].received.filter(m => m.type === 'preparing').length, 0)
    assert.ok(!s.body.includes('stale.json') && !s.body.includes('STALE CACHE MUST NOT WIN'))
    await transport(page).click(); await page.waitForFunction(() => window.playerRef.current.playing()); await page.waitForTimeout(300)
    const pixels = await page.locator('canvas.mv-pixel').evaluate(c => { const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let green=0;for(let i=0;i<d.length;i+=64)if(d[i+1]>100&&d[i+1]>d[i+2])green++;return green; })
    assert.ok(pixels > 200, 'legacy scene actually renders its native WebGL bitmap')
    await page.screenshot({ path: join(out, 'legacy-automatic-lyrics.png') })
    report.cases.push({ name: 'legacy scripts still immediately initialize and automatically load bundled lyrics', preparationMessages: 0, automaticCues: 3, staleCacheIgnored: true, greenPixelSamples: pixels }); await page.close()
  }
  assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.errors, []); report.passed = true
  console.log(JSON.stringify({ passed: report.passed, browser: report.browser, cases: report.cases, out }))
} catch (error) {
  report.failure = { message: error.message, stack: error.stack }
  for (const [i, page] of browser.contexts().flatMap(c => c.pages()).entries()) {
    try { report.failureSnapshot = await snapshot(page); await page.screenshot({ path: join(out, `failure-${i}.png`) }) } catch { /* a failed page may already be gone */ }
  }
  throw error
} finally {
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  await browser.close(); await new Promise(r => server.close(r))
}
