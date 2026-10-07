#!/usr/bin/env node
// Real Chrome, production ScriptFilm/worker/Host readers, no music or upstream HTTP access.
// Usage: node tools/frostnova-smoke.mjs <pack-dir> <upstream-checkout> <new-output-dir> [--probe 5,15.3]
// Optional env: DSH_MV_PLAYWRIGHT, DSH_MV_CHROME, DSH_MV_GPU_MODE=native.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadPack, readPackFile, packFilePath } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { SCENE_LIMITS, PIXEL_SCENE_LIMITS } from '../.dsh-plugin/shared/mv-scene.mjs'

const require = createRequire(import.meta.url)
const portRequire = createRequire(new URL('../presets/ports/frostnova-web/package.json', import.meta.url))
let build
try { ({ build } = portRequire('esbuild')) } catch { ({ build } = require('esbuild')) }
const root = fileURLToPath(new URL('..', import.meta.url))
const [packArg, upstreamArg, outArg, ...options] = process.argv.slice(2)
assert.ok(packArg && upstreamArg && outArg, 'usage: frostnova-smoke.mjs <pack-dir> <upstream-checkout> <new-output-dir>')
const packDir = resolve(packArg), upstream = resolve(upstreamArg), out = resolve(outArg)
assert.ok(!options.length || options.length === 2 && ['--probe', '--seek-probe'].includes(options[0]), 'Optional syntax is --probe or --seek-probe <seconds[,seconds...]>')
const probeTimes = options.length ? options[1].split(',').map(Number) : []
const seekProbe = options[0] === '--seek-probe'
assert.ok(probeTimes.every(Number.isFinite), 'Probe times must be finite numbers.')
assert.ok(!existsSync(out) || (await readdir(out)).length === 0, 'Output must be new or empty; existing QA artifacts are preserved.')
await mkdir(out, { recursive: true })
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const cleanName = value => String(value).replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-|-$/g, '')
const report = {
  status: 'running', plugin: JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version,
  packDir, upstream, musicReads: 0, limits: { ...SCENE_LIMITS, bitmapFrameBudgetMs: PIXEL_SCENE_LIMITS.frameBudgetMs },
  mode: seekProbe ? 'seek-probe' : probeTimes.length ? 'probe' : 'full', probeTimes,
  preparation: [], frames: [], transitions: [], pauseChecks: [], seekChecks: [], errors: [], consoleErrors: [], consoleWarnings: [], consoleLog: [],
  externalRequests: [], hostReads: [], screenshots: [], failures: [],
}
let reportWrite = Promise.resolve()
function saveReport() {
  const json = JSON.stringify(report, null, 2) + '\n'
  return reportWrite = reportWrite.then(() => writeFile(join(out, 'report.json'), json))
}
async function collect(dir, sub = '') {
  const files = []
  for (const item of await readdir(join(dir, sub), { withFileTypes: true })) {
    const name = [sub, item.name].filter(Boolean).join('/')
    if (item.isDirectory()) files.push(...await collect(dir, name))
    else {
      const bytes = await readFile(join(dir, name))
      files.push({ path: name, size: bytes.length, sha256: sha(bytes) })
    }
  }
  return files
}
function loadPlaywright() {
  if (process.env.DSH_MV_PLAYWRIGHT) return require(process.env.DSH_MV_PLAYWRIGHT)
  // The Corresponding Source archive needs only npm ci in this port directory.
  // The main plugin checkout remains a fallback; no private runtime is needed.
  try { return portRequire('playwright') } catch {}
  try { return require('playwright') } catch {}
  throw new Error('Playwright is unavailable. Run npm ci --prefix presets/ports/frostnova-web or set DSH_MV_PLAYWRIGHT to its installed package.')
}

// Resolve the same versioned module identities the upstream engine/chapters use.
// Only timing/registration data executes here; no renderer, player, audio or HTTP loader runs.
async function upstreamShots() {
  const enginePath = join(upstream, 'src/engine/engine.js')
  const code = await readFile(enginePath, 'utf8')
  const imports = [...code.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map(m => m[1])
  const dependency = suffix => {
    const found = imports.find(p => p.split('?')[0].endsWith(suffix))
    assert.ok(found, `Upstream engine import missing: ${suffix}`)
    return new URL(found, pathToFileURL(enginePath)).href
  }
  await import(dependency('/edit/table.js'))
  const chapterFiles = (await readdir(join(upstream, 'src/ch'))).filter(f => /^\d.*\.js$/.test(f)).sort()
  assert.equal(chapterFiles.length, 17, 'Pinned source must retain all 17 registered chapter modules.')
  for (const name of chapterFiles) await import(pathToFileURL(join(upstream, 'src/ch', name)).href)
  const { Timing } = await import(dependency('/timing.js'))
  const { Timeline } = await import(dependency('/timeline.js'))
  const { editTable } = await import(dependency('/edit.js'))
  const { PROJECT, settingsFor } = await import(dependency('/config.js'))
  const timingBytes = await readFile(join(upstream, 'data/timing.json'))
  const onsetsBytes = await readFile(join(upstream, 'data/onsets.json'))
  const T = Timing.from(JSON.parse(timingBytes), JSON.parse(onsetsBytes))
  T.preroll = PROJECT.preroll
  T.clockZero = settingsFor('main').clockZero
  const timeline = new Timeline(T, [], { edit: editTable('main') })
  assert.deepEqual(timeline.problems, [], 'Original main timeline must resolve without missing shots.')
  assert.equal(timeline.shots.length, 305, 'All 305 main-edit shots must be present.')
  const shots = timeline.shots.map(s => ({ id: s.id, chapter: s.chapter.id, start: s.start,
    end: Math.min(s.end, T.duration), join: { type: s.join.type, dur: s.join.dur ?? 0, bias: s.join.bias ?? .5 } }))
  assert.equal(new Set(shots.map(s => s.chapter)).size, 16)
  return { shots, duration: T.duration, timingSha256: sha(timingBytes), onsetsSha256: sha(onsetsBytes),
    captionLines: T.lines.length, captionWords: T.words.length, preroll: T.preroll, clockZero: T.clockZero }
}

const browserSource = `
import {ScriptFilm, blobWorkerFactory} from './.dsh-plugin/client/mv/script-film.mjs';
import {packAssetReader, loadSceneAssets, disposeSceneAssets} from './.dsh-plugin/client/mv/dshpv/assets.mjs';
import {fetchPackText} from './.dsh-plugin/client/mv-pack-state.mjs';
import {parseLyrics} from './.dsh-plugin/shared/mv-lyrics.mjs';
import {SCENE_LIMITS, PIXEL_SCENE_LIMITS} from './.dsh-plugin/shared/mv-scene.mjs';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const stage = document.querySelector('canvas'), g = stage.getContext('2d', {willReadFrequently:true});
const pixelReferences = new Map();
let film = null, preparation = [], messages = [], commands = [], failures = [], workers = 0, terminated = 0, outputs = 0, closedOutputs = 0;
const hash = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
const factory = source => {
  const worker = blobWorkerFactory(source);
  if (!worker) throw new Error('No native Blob Worker');
  workers++;
  const terminate = worker.terminate.bind(worker); let stopped=false;
  worker.terminate = () => { if(!stopped) {stopped=true;terminated++;terminate();} };
  const send=worker.postMessage.bind(worker);
  worker.postMessage=(message,...rest)=>{commands.push({type:message?.type,id:message?.id,t:message?.t,sentAtMs:performance.now()});return send(message,...rest);};
  worker.addEventListener('message', event => {
    const m=event.data;
    messages.push({type:m?.type,id:m?.id,ms:m?.ms,progress:m?.progress,label:m?.label,error:m?.error,width:m?.bitmap?.width,height:m?.bitmap?.height,receivedAtMs:performance.now()});
    if(m?.bitmap) {
      outputs++;const close=m.bitmap.close.bind(m.bitmap);let done=false;
      m.bitmap.close=()=>{if(!done){done=true;closedOutputs++;close();}};
    }
  });
  return worker;
};
window.qaStart = async loaded => {
  film?.stop(); failures=[]; messages=[];commands=[];preparation=[];pixelReferences.clear();
  const pack=loaded.pack, api={packRead:request=>window.hostRead(request)};
  const source=await fetchPackText(api,loaded.manifestPath,'scene');
  const scene=await loadSceneAssets(packAssetReader(api,loaded.manifestPath,pack),pack,{images:true});
  let started=0;
  film=new ScriptFilm({title:pack.title,artist:pack.artist,duration:pack.duration,createWorker:factory,onFail:r=>failures.push(r),onPrepare:status=>{
    const now=performance.now(),command=commands.findLast(c=>status.step===0?c.type==='init':c.type==='prepare-next'&&c.id===status.step);
    const entry={...status,ms:command?now-command.sentAtMs:null,wallMs:now-started};
    preparation.push(entry);window.hostPrepare(entry);
  }});
  film.setStructure({sections:pack.sections,bpm:pack.canvas.bpm,beatOffset:pack.canvas.beatOffset});
  if(pack.lyrics) {const track=await fetchPackText(api,loaded.manifestPath,'lyrics');film.setLyrics(parseLyrics(track.name,track.text));}
  stage.width=pack.canvas.size[0];stage.height=pack.canvas.size[1];
  started=performance.now();
  try {await film.load(source.text,{output:pack.canvas.output,size:pack.canvas.size,assets:scene.assets,transfer:scene.transfer});}
  catch(e){disposeSceneAssets(scene);throw e;}
  const loadMs=performance.now()-started;
  return {setupMs:preparation[0]?.wallMs??loadMs,loadMs,prepareMs:preparation.length?loadMs-preparation[0].wallMs:0,prepareSteps:preparation.at(-1)?.step??0,sourceSha256:await hash(new TextEncoder().encode(source.text)),
    assets:Object.keys(scene.assets),imageAssets:scene.transfer.length,cueCount:film.lyrics.length,
    limits:{setupTimeoutMs:SCENE_LIMITS.setupTimeoutMs,hardTimeoutMs:SCENE_LIMITS.hardTimeoutMs,frameBudgetMs:PIXEL_SCENE_LIMITS.frameBudgetMs,prepareStepTimeoutMs:SCENE_LIMITS.prepareStepTimeoutMs,prepareTotalTimeoutMs:SCENE_LIMITS.prepareTotalTimeoutMs,prepareMaxSteps:SCENE_LIMITS.prepareMaxSteps}};
};
window.qaFrame = async ({t,compareKey,saveReference=false}) => {
  if(!film||film.state!=='ready')throw new Error(film?.error||'Film is not ready');
  const started=performance.now();film.request(t,...film.size,{paused:true});
  while(film.pending && film.state==='ready') {
    // Invoke the real production watchdog, with its unchanged 1500 ms limit.
    film.request(t,...film.size,{paused:true});
    await wait(5);
  }
  if(film.state!=='ready')throw new Error(film.error);
  if(!film.bitmap)throw new Error('No frame bitmap');
  const message=messages.at(-1);
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';
  g.drawImage(film.bitmap,0,0);g.globalCompositeOperation='source-over';
  const pixels=g.getImageData(0,0,stage.width,stage.height).data;
  let pixelDiff;
  if(compareKey && pixelReferences.has(compareKey)) {
    const before=pixelReferences.get(compareKey);let differentPixels=0,differentChannels=0,alphaDifferences=0,maxDelta=0,sumAbsDelta=0,xmin=stage.width,ymin=stage.height,xmax=-1,ymax=-1;
    for(let i=0;i<pixels.length;i+=4) {
      let changed=false;
      for(let j=0;j<4;j++){const d=Math.abs(pixels[i+j]-before[i+j]);if(d){changed=true;differentChannels++;if(j===3)alphaDifferences++;sumAbsDelta+=d;maxDelta=Math.max(maxDelta,d);}}
      if(changed){differentPixels++;const p=i/4,x=p%stage.width,y=Math.floor(p/stage.width);xmin=Math.min(xmin,x);ymin=Math.min(ymin,y);xmax=Math.max(xmax,x);ymax=Math.max(ymax,y);}
    }
    pixelDiff={differentPixels,differentChannels,alphaDifferences,maxDelta,sumAbsDelta,meanAbsDelta:sumAbsDelta/pixels.length,boundingBox:differentPixels?[xmin,ymin,xmax,ymax]:null};
  }
  if(compareKey&&saveReference)pixelReferences.set(compareKey,new Uint8ClampedArray(pixels));
  let litPixels=0,min=765,max=0;
  for(let i=0;i<pixels.length;i+=4){const sum=pixels[i]+pixels[i+1]+pixels[i+2];if(sum>60)litPixels++;min=Math.min(min,sum);max=Math.max(max,sum);}
  return {t,width:film.bitmap.width,height:film.bitmap.height,sha256:await hash(pixels),litPixels,range:max-min,
    wallMs:performance.now()-started,workerMs:message?.ms,slowFrames:film.slow,frameId:message?.id,filmState:film.state,pixelDiff};
};
window.qaStop = () => {const beforeStop={state:film?.state,pending:film?.pending,preparePending:film?.preparePending,prepareProgress:film?.prepareProgress};film?.stop();return {workers,terminated,outputs,closedOutputs,worker:!!film?.worker,bitmap:!!film?.bitmap,pending:!!film?.pending,beforeStop,preparation,failures:[...failures],commands,messages};};
window.qaIsolation = async () => {
  const check=new ScriptFilm({createWorker:factory,onFail:r=>failures.push(r)});
  await check.load('function paint(gl){if([typeof fetch,typeof FontFace,typeof fonts,typeof document,typeof window,typeof process,typeof globalThis,typeof self,typeof setTimeout,typeof WebSocket,typeof indexedDB].some(x=>x!=="undefined"))throw new Error("sandbox privilege leak");gl.clearColor(0,1,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}',{output:'webgl',size:[320,180]});
  check.request(0,320,180,{paused:true});
  while(check.pending&&check.state==='ready'){check.request(0,320,180,{paused:true});await wait(5);}
  const isolated=check.state==='ready';const error=check.error;check.stop();if(!isolated)throw new Error(error);
  return {isolated,workers,terminated,outputs,closedOutputs};
};
window.qaGpu = () => {const gl=new OffscreenCanvas(4,4).getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {version:gl?.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl?.getParameter(gl.RENDERER),extensions:gl?.getSupportedExtensions()};};
`

let browser, server, page
try {
  const loaded = await loadPack(packDir)
  assert.deepEqual(loaded.warnings, [])
  assert.equal(loaded.pack.canvas.renderer, 'script')
  assert.equal(loaded.pack.canvas.output, 'webgl')
  const files = await collect(packDir)
  assert.ok(files.every(f => !/\.(mp3|wav|m4a|mp4|flac|ogg|opus|webm)$/i.test(f.path)), 'No audio/video may enter this test.')
  const id = loaded.pack.workshop.id
  const validated = await validateWorkshopPack({ id, files, readText: p => readFile(join(packDir, p), 'utf8'), readBytes: p => readFile(join(packDir, p)) })
  assert.deepEqual(validated.errors, [], 'Production workshop validation must pass before browser playback.')
  const metadata = await upstreamShots()
  Object.assign(report, { id, version: loaded.pack.workshop.version, files: files.length, bytes: files.reduce((n, f) => n + f.size, 0),
    workshopWarnings: validated.warnings, source: { ...metadata, shots: undefined }, expectedShots: metadata.shots.length,
    expectedChapters: [...new Set(metadata.shots.map(s => s.chapter))] })
  try { report.upstreamCommit = execFileSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() } catch {}
  const sceneBytes = await readFile(packFilePath(loaded.packDir, loaded.pack.canvas.script))
  report.sceneBytes = sceneBytes.length; report.sceneSha256 = sha(sceneBytes)
  const code = await build({ stdin: { contents: browserSource, resolveDir: root, sourcefile: 'frostnova-smoke-entry.mjs' },
    bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022' })
  server = createServer((req, res) => {
    if(req.url !== '/') {res.statusCode=req.url==='/favicon.ico'?204:404;res.end();return}
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end('<!doctype html><meta charset="utf-8"><title>FrostNova local sandbox QA</title><style>body{margin:0;background:#000}canvas{display:block}</style><canvas></canvas>')
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const origin = `http://127.0.0.1:${server.address().port}`
  const executablePath = process.env.DSH_MV_CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
  const gpuMode = process.env.DSH_MV_GPU_MODE === 'native' ? 'native' : 'swiftshader'
  browser = await loadPlaywright().chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true,
    args: gpuMode === 'swiftshader' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] })
  report.browser = await browser.version(); report.gpuMode = gpuMode
  page = await browser.newPage({ viewport: { width: 1340, height: 900 } })
  page.on('pageerror', e => report.errors.push(e.message))
  page.on('console', m => {
    if(m.type()==='error')report.consoleErrors.push(m.text())
    if(m.type()==='warning')report.consoleWarnings.push(m.text())
    if(m.type()==='log'||m.type()==='info')report.consoleLog.push(m.text())
  })
  await page.route('**/*', async route => {
    const url = route.request().url()
    if(/^https?:/.test(url) && !url.startsWith(origin + '/')) {report.externalRequests.push(url);await route.abort();return}
    await route.continue()
  })
  await page.exposeFunction('hostRead', async request => {
    assert.equal(request.manifestPath, loaded.manifestPath, 'Host read is scoped to the requested pack.')
    assert.ok(['scene', 'asset', 'lyrics'].includes(request.role), 'Audio/other Host reads are prohibited.')
    report.hostReads.push({ role: request.role, asset: request.asset, part: request.part, offset: request.offset, length: request.length })
    return { ok: true, value: await readPackFile(parsePackRead(request)) }
  })
  await page.exposeFunction('hostPrepare', async entry => {
    report.preparation.push(entry); report.lastPrepare = entry
    if(entry.step % 20 === 0 || entry.done) {
      console.log(`[FrostNova Chrome] prepare ${entry.step}: ${Math.round(entry.progress*100)}% ${entry.label} (${Math.round(entry.ms ?? 0)} ms; ${Math.round(entry.wallMs)} ms wall)`)
      await saveReport()
    }
  })
  await page.goto(origin)
  await page.addScriptTag({ content: code.outputFiles[0].text, type: 'module' })
  await page.waitForFunction(() => typeof window.qaStart === 'function')
  report.gpu = await page.evaluate(() => window.qaGpu())
  report.current = {phase:'setup-prepare'}
  report.setup = await page.evaluate(loaded => window.qaStart(loaded), loaded)
  assert.equal(report.setup.sourceSha256, report.sceneSha256)
  assert.equal(report.setup.limits.setupTimeoutMs, SCENE_LIMITS.setupTimeoutMs)
  assert.equal(report.setup.limits.hardTimeoutMs, SCENE_LIMITS.hardTimeoutMs)
  const chapters = report.expectedChapters
  const chapterShots = chapter => metadata.shots.filter(s => s.chapter === chapter)
  const keyShots = new Set(chapters.map(ch => { const list=chapterShots(ch); return list[Math.floor(list.length/2)].id }))
  for (const pattern of [/^title\/flight$/, /^intro\/terrain$/, /^bridge\/trace$/, /^bridge\/assert$/, /^bridge\/dialogs2$/, /^bridge\/split$/,
    /^chant\/mem/, /^chant\/cad/, /^chant\/hit4$/, /^chant\/hit6$/, /^outro\/logo/, /^outro\/shrink$/, /^c2x\/.*shard/i]) {
    const shot = metadata.shots.find(s => pattern.test(s.id)); if(shot)keyShots.add(shot.id)
  }
  async function capture(t, info, screenshot, comparison = {}) {
    const result = await page.evaluate(request => window.qaFrame(request), {t,...comparison})
    assert.deepEqual([result.width, result.height], loaded.pack.canvas.size, 'Production output bitmap dimensions stay fixed.')
    const frame = { ...info, ...result }; report.frames.push(frame)
    if(screenshot) {
      const name = cleanName(screenshot) + '.png'
      await page.locator('canvas').screenshot({ path: join(out, name) })
      report.screenshots.push({ file: name, t, shot: info.shot })
    }
    return frame
  }
  const selectedShots = probeTimes.length ? probeTimes.map(t=>{
    const shot=metadata.shots.find(s=>s.start<=t&&t<s.end)??metadata.shots[0]
    return {...shot,start:t,end:t}
  }) : metadata.shots
  for (const [i, shot] of selectedShots.entries()) {
    const t = (shot.start + shot.end) / 2
    report.current = { phase: probeTimes.length ? 'probe' : 'shot-sweep', index: i, shot: shot.id, t }
    await capture(t, { kind: 'shot', shot: shot.id, chapter: shot.chapter, sandboxOnlyPreroll: t < 0 }, keyShots.has(shot.id)||probeTimes.length ? `shot-${String(i).padStart(3, '0')}-${shot.id}` : null)
    if(i % 20 === 0 || i === selectedShots.length-1) {await saveReport();console.log(`[FrostNova Chrome] ${i+1}/${selectedShots.length}: ${shot.id}`)}
  }
  const joinTypes = probeTimes.length ? [] : [...new Set(metadata.shots.filter(s => s.join.type !== 'cut' && s.join.dur > 0).map(s => s.join.type))]
  for (const shot of probeTimes.length ? [] : metadata.shots.filter(s => s.join.type !== 'cut' && s.join.dur > 0)) {
    const type = shot.join.type
    for(const progress of [.2, .5, .8]) {
      const t = shot.start + (progress - shot.join.bias) * shot.join.dur
      report.current = {phase:'transition',shot:shot.id,type,progress,t}
      const frame = await capture(t, {kind:'transition',shot:shot.id,chapter:shot.chapter,type,progress}, progress === .5 ? `transition-${type}-${shot.id}` : null)
      report.transitions.push({type,shot:shot.id,progress,t,sha256:frame.sha256})
    }
  }
  const deterministic = seekProbe ? selectedShots : probeTimes.length ? [] : chapters.filter(ch => ch !== 'warning').map(ch => { const list=chapterShots(ch);return list[Math.floor(list.length/2)] })
  for(const pattern of probeTimes.length ? [] : [/^bridge\/trace$/, /^bridge\/dialogs2$/, /^chant\/mem/, /^outro\/shrink$/]) {
    const hit=metadata.shots.find(s=>pattern.test(s.id));if(hit&&!deterministic.includes(hit))deterministic.push(hit)
  }
  for (const shot of deterministic) {
    const t=(shot.start+shot.end)/2
    report.current={phase:'pause-seek',shot:shot.id,t}
    const comparison={compareKey:shot.id},name=seekProbe?`det-${cleanName(shot.id)}`:null
    const first=await capture(t,{kind:'pause-reference',shot:shot.id,chapter:shot.chapter},name?name+'-reference':null,{...comparison,saveReference:true})
    for(let repeat=1;repeat<=(seekProbe?3:1);repeat++) {
      const paused=await capture(t,{kind:'paused-repeat',shot:shot.id,chapter:shot.chapter,repeat},name?name+`-repeat-${repeat}`:null,comparison)
      const pause={shot:shot.id,t,repeat,before:first.sha256,after:paused.sha256,equal:first.sha256===paused.sha256,pixelDiff:paused.pixelDiff};report.pauseChecks.push(pause)
    }
    if(seekProbe) {
      const nearby=Math.min(metadata.duration-.05,t+.3)
      await capture(nearby,{kind:'near-seek-away',shot:shot.id,chapter:shot.chapter})
      const near=await capture(t,{kind:'near-backward-seek',shot:shot.id,chapter:shot.chapter},name+'-near-seek',comparison)
      report.seekChecks.push({shot:shot.id,t,from:nearby,before:first.sha256,after:near.sha256,equal:first.sha256===near.sha256,pixelDiff:near.pixelDiff})
    }
    const away=Math.min(metadata.duration-.05,Math.max(t+.3,metadata.duration-2))
    await capture(away,{kind:'seek-away',shot:shot.id,chapter:shot.chapter})
    const again=await capture(t,{kind:'backward-seek',shot:shot.id,chapter:shot.chapter},name?name+'-far-seek':null,comparison)
    report.seekChecks.push({shot:shot.id,t,from:away,before:first.sha256,after:again.sha256,equal:first.sha256===again.sha256,pixelDiff:again.pixelDiff})
    await saveReport()
  }
  report.cleanup=await page.evaluate(()=>window.qaStop())
  report.isolation=await page.evaluate(()=>window.qaIsolation())
  const sweep=report.frames.filter(f=>f.kind==='shot')
  report.coverage={shots:sweep.length,chapters:chapters.map(ch=>({chapter:ch,shots:sweep.filter(f=>f.chapter===ch).length,
    litShots:sweep.filter(f=>f.chapter===ch&&f.litPixels>10).length,hashes:new Set(sweep.filter(f=>f.chapter===ch).map(f=>f.sha256)).size})),transitionTypes:joinTypes}
  assert.equal(sweep.length,selectedShots.length)
  if(!probeTimes.length)assert.ok(report.coverage.chapters.filter(c=>c.chapter!=='warning').every(c=>c.litShots>0),'Every song chapter has visible rendered geometry/text.')
  // The unchanged upstream also differs by one RGB code in 33/230400 pixels
  // after a seek on this GPU. Preserve the exact hashes and measure that tiny
  // readback difference; reject motion, alpha changes or larger colour errors.
  report.pixelComparison = { maxChannelDelta: 1, maxDifferentPixelFraction: .0002, alphaDifferences: 0, exactHashesRetained: true }
  const visuallyStable = c => c.equal || c.pixelDiff?.maxDelta <= 1 && c.pixelDiff.alphaDifferences === 0 && c.pixelDiff.differentPixels <= Math.ceil(loaded.pack.canvas.size[0] * loaded.pack.canvas.size[1] * .0002)
  for (const c of [...report.pauseChecks, ...report.seekChecks]) c.visuallyStable = visuallyStable(c)
  assert.ok(report.pauseChecks.every(c=>c.visuallyStable), 'Paused frames changed beyond the documented one-code GPU readback tolerance; see pauseChecks.')
  assert.ok(report.seekChecks.every(c=>c.visuallyStable), 'Backward seeks changed beyond the documented one-code GPU readback tolerance; see seekChecks.')
  assert.ok(!report.cleanup.worker&&!report.cleanup.bitmap&&!report.cleanup.pending)
  assert.equal(report.cleanup.workers,report.cleanup.terminated)
  assert.equal(report.cleanup.outputs,report.cleanup.closedOutputs)
  assert.equal(report.isolation.workers,report.isolation.terminated)
  assert.equal(report.isolation.outputs,report.isolation.closedOutputs)
  assert.deepEqual(report.cleanup.failures,[])
  assert.deepEqual(report.errors,[])
  assert.deepEqual(report.consoleErrors,[],'No shader/worker console errors may be ignored.')
  assert.deepEqual(report.externalRequests,[],'No external network request may be ignored.')
  report.status=probeTimes.length?'probe-passed':'passed';delete report.current
  console.log(`[FrostNova Chrome] ${probeTimes.length?'PROBE':'PASS'}: ${sweep.length} shots, ${report.transitions.length} joins, ${report.pauseChecks.length} pause/${report.seekChecks.length} seek checks. ${out}`)
} catch (error) {
  report.status='failed';report.failures.push({message:error.message,stack:error.stack,at:report.current})
  try {if(page)report.cleanup=await page.evaluate(()=>window.qaStop())} catch {}
  if(report.cleanup?.preparation) {
    report.preparation=report.cleanup.preparation
    report.lastPrepare=report.preparation.at(-1)??report.lastPrepare
  }
  console.error(`[FrostNova Chrome] FAIL: ${error.message}; partial report: ${out}`)
  process.exitCode=1
} finally {
  await saveReport()
  await browser?.close()
  if(server)await new Promise(r=>server.close(r))
}
