#!/usr/bin/env node
// Real Chromium integration test: production ScriptFilm + Blob Worker + ImageBitmap.
// npm install --no-save playwright (or set DSH_MV_PLAYWRIGHT to its installed directory).
// node tools/webgl-smoke.mjs <pack-dir> [...] [--out dist/webgl-smoke]
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { loadPack, packFilePath } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { assetParts } from '../.dsh-plugin/shared/mv-pack.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.DSH_MV_PLAYWRIGHT || 'playwright')
const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2), outAt = args.indexOf('--out')
const out = resolve(outAt < 0 ? 'dist/webgl-smoke' : args[outAt + 1])
const paths = (outAt < 0 ? args : args.slice(0, outAt)).map(p => resolve(p))
assert.ok(paths.length, 'Pass at least one pack folder')
const packs = []
for (const path of paths) {
  const { pack, packDir, warnings } = await loadPack(path)
  assert.deepEqual(warnings, [])
  const assets = {}
  for (const name of Object.keys(pack.canvas.assets ?? {})) {
    const refs = assetParts(pack, name)
    assert.ok(refs.every(p => p.endsWith('.json')), 'This smoke fixture expects JSON assets')
    const shards = await Promise.all(refs.map(ref => readFile(packFilePath(packDir, ref), 'utf8').then(JSON.parse)))
    const merged = {}
    for (const shard of shards) for (const [key, value] of Object.entries(shard)) merged[key] = Array.isArray(value) && Array.isArray(merged[key]) ? merged[key].concat(value) : value
    assets[name] = shards.length === 1 ? shards[0] : merged
  }
  const sectionTimes = (pack.sections ?? []).map(s => Math.min(s.end - 0.2, s.start + (s.end - s.start) * 0.55))
  const times = sectionTimes.length ? sectionTimes : [5, 30, 60]
  packs.push({ pack, source: await readFile(packFilePath(packDir, pack.canvas.script), 'utf8'), assets, times })
}

const browserCode = `
import { ScriptFilm } from './.dsh-plugin/client/mv/script-film.mjs';
import { EXAMPLE_SCENE } from './.dsh-plugin/shared/mv-scene.mjs';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const stage = document.querySelector('canvas'), g = stage.getContext('2d');
let film;
const failures = [], lifecycle = [];
const factory = source => {
  const worker = new Worker(URL.createObjectURL(new Blob([source], {type:'text/javascript'})));
  const realTerminate = worker.terminate.bind(worker);
  worker.terminate = () => { lifecycle.push('terminated'); realTerminate(); };
  return worker;
};
async function frame(t) {
  film.request(t, ...film.size, {paused:true});
  const started = performance.now();
  while (film.pending && film.state === 'ready') {
    if (performance.now() - started > 1500) film.request(t, ...film.size, {paused:true});
    await wait(10);
    if (performance.now() - started > 5000) throw new Error('Frame timeout');
  }
  if (film.state !== 'ready') throw new Error(film.error);
  g.fillStyle='#000'; g.fillRect(0,0,stage.width,stage.height);
  g.drawImage(film.bitmap,0,0,stage.width,stage.height);
  const pixels=g.getImageData(0,0,stage.width,stage.height).data;
  let hash=2166136261, bright=0, min=765, max=0;
  for(let i=0;i<pixels.length;i+=4) {
    const sum=pixels[i]+pixels[i+1]+pixels[i+2]; min=Math.min(min,sum); max=Math.max(max,sum);
    if(sum>60) bright++;
    hash=Math.imul(hash^pixels[i],16777619); hash=Math.imul(hash^pixels[i+1],16777619); hash=Math.imul(hash^pixels[i+2],16777619);
  }
  return {t,hash:hash>>>0,bright,range:max-min};
}
window.runPack=async data => {
  const old=film;
  old?.stop();
  if(old && (old.worker || old.bitmap || old.pending)) throw new Error('Leaked previous film');
  film=new ScriptFilm({title:data.pack.title,artist:data.pack.artist,duration:data.pack.duration,createWorker:factory,onFail:r=>failures.push(r)});
  film.setStructure({sections:data.pack.sections,bpm:data.pack.canvas.bpm,beatOffset:data.pack.canvas.beatOffset});
  await film.load(data.source,{output:data.pack.canvas.output,size:data.pack.canvas.size,assets:data.assets});
  const frames=[];
  for(const t of data.times) frames.push(await frame(t));
  const mismatches=[];
  for(const reference of frames) {
    await frame(data.times.at(-1));
    const repeated=await frame(reference.t);
    if(reference.hash!==repeated.hash) mismatches.push({t:reference.t,before:reference,after:repeated});
  }
  const request=film.request; film.request=()=>{};
  stage.width=1000;stage.height=800; film.draw(g,data.times[0],{paused:true});
  const corners=Array.from(g.getImageData(0,0,1,1).data);
  stage.width=960;stage.height=540; film.request=request;
  await frame(data.times[Math.min(1,data.times.length-1)]);
  return {title:data.pack.title,output:data.pack.canvas.output,frames,seekChecks:frames.length,seekEqual:mismatches.length===0,mismatches,letterboxBlack:corners[0]===0&&corners[1]===0&&corners[2]===0,failures:[...failures]};
};
window.regressions=async()=> {
  film.stop();
  const check=new ScriptFilm({createWorker:factory,onFail:r=>failures.push(r)});
  await check.load('function paint(g,t,w,h){g.fillStyle="#ff0000";g.fillRect(0,0,w,h)}',{output:'pixels',size:[320,180]});
  check.request(1,320,180,{paused:true});
  while(check.pending) await wait(10);
  g.drawImage(check.bitmap,0,0); const red=g.getImageData(10,10,1,1).data[0]===255;
  check.stop();
  await check.load(EXAMPLE_SCENE);
  check.request(1,80,24,{paused:true}); while(check.pending) await wait(10);
  const text=check.frame.lines.some(s=>s.trim());check.stop();
  const loss=new ScriptFilm({createWorker:factory});
  await loss.load('function paint(gl){const ext=gl.getExtension("WEBGL_lose_context");if(!ext)throw new Error("no lose_context extension");ext.loseContext();}',{output:'webgl',size:[320,180]});
  loss.request(0,320,180,{}); for(let i=0;i<300&&loss.state==='ready';i++)await wait(10);
  const lost=loss.state==='failed'&&/丢失/.test(loss.error);loss.stop();
  const denied=new ScriptFilm({createWorker:factory});
  await denied.load('function paint(gl){if([typeof fetch,typeof document,typeof window,typeof process,typeof postMessage,typeof globalThis,typeof setTimeout].some(x=>x!=="undefined"))throw new Error("privilege leak");gl.clearColor(0,1,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}',{output:'webgl',size:[320,180]});
  denied.request(0,320,180,{});while(denied.pending)await wait(10);
  const isolated=denied.state==='ready';denied.stop();
  return {pixels:red,text,contextLoss:lost,isolated,terminated:lifecycle.length};
};
window.gpuInfo=()=>{const gl=new OffscreenCanvas(4,4).getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {version:gl?.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl?.getParameter(gl.RENDERER)}};
`
const bundle = await build({ stdin: { contents: browserCode, resolveDir: root, sourcefile: 'webgl-smoke-entry.mjs' }, bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2020' })
const executablePath = process.env.DSH_MV_CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p))
let browser
try {
  browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } })
  const errors = [], consoleErrors = [], requests = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:') && !r.url().startsWith('blob:')) requests.push(r.url()) })
  // No server/network permission needed: all test code and pack assets are in memory.
  await page.setContent('<!doctype html><style>body{margin:0;background:#080b14}canvas{display:block}</style><canvas width="960" height="540"></canvas>')
  await page.addScriptTag({ content: bundle.outputFiles[0].text, type: 'module' })
  await page.waitForFunction(() => typeof window.runPack === 'function')
  await mkdir(out, { recursive: true })
  const results = []
  for (const data of packs) {
    const result = await page.evaluate(data => window.runPack(data), data)
    results.push(result)
    assert.ok(result.frames.every(f => f.range > 20 && f.bright > 10), `Blank/flat frame: ${JSON.stringify(result.frames)}`)
    assert.ok(result.seekEqual, `Seeking is not deterministic: ${result.title}: ${JSON.stringify(result.mismatches)}`)
    assert.ok(new Set(result.frames.map(f=>f.hash)).size > 1, 'Scene must change across its timeline')
    assert.ok(result.letterboxBlack, 'Letterbox corners must be black')
    assert.deepEqual(result.failures, [])
    const name = data.pack.workshop?.id ?? `pack-${results.length}`
    await page.locator('canvas').screenshot({ path: join(out, `${name}.png`) })
    console.log(`[WebGL browser] ${result.title}: ${result.frames.length} nonblank frames, seek/resize OK`)
  }
  const regressions = await page.evaluate(() => window.regressions())
  assert.ok(regressions.pixels && regressions.text && regressions.contextLoss && regressions.isolated, JSON.stringify(regressions))
  assert.deepEqual(errors, [])
  assert.deepEqual(consoleErrors, [], 'GPU shader/console errors')
  assert.deepEqual(requests, [], 'Unexpected network request')
  const report = { browser: await browser.version(), gpu: await page.evaluate(() => window.gpuInfo()), results, regressions, errors, consoleErrors, requests }
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`[WebGL browser] 2D/text compatibility, context loss, isolation and cleanup OK; report: ${out}`)
} finally {
  await browser?.close()
}
