#!/usr/bin/env node
// Real Chrome original-renderer / production ScriptFilm worker comparison.
// No audio or remote media. Usage: <pack> <pinned-upstream> <new-output> [--probe -4,16,80]
// DSH_MV_GPU_MODE=native selects the real GPU; default SwiftShader is diagnostic.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { UPSTREAM_COMMIT } from '../presets/ports/nyankomintsu/build.mjs'
import { flashCheck } from '../presets/ports/nyankomintsu/flash-check.mjs'

const require=createRequire(new URL('../presets/ports/nyankomintsu/package.json',import.meta.url))
const {build}=require('esbuild'), {chromium}=require('playwright')
const root=fileURLToPath(new URL('..',import.meta.url)), fontRoot=join(root,'presets/ports/nyankomintsu/node_modules/@fontsource')
const [packArg,upstreamArg,outArg,...args]=process.argv.slice(2)
assert.ok(packArg&&upstreamArg&&outArg,'Usage: nyankomintsu-smoke.mjs <pack-dir> <pinned-upstream> <new-qa-dir> [--probe seconds]')
assert.ok(!args.length||args.length===2&&args[0]==='--probe')
const packDir=resolve(packArg),upstream=resolve(upstreamArg),out=resolve(outArg),probe=args.length?args[1].split(',').map(Number):[]
assert.ok(probe.every(Number.isFinite));assert.ok(!existsSync(out),'Preserve previous QA artifacts: choose a new output folder')
await mkdir(out,{recursive:true})
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
const control=process.env.DSH_MV_QA_CONTROL==='offscreen'
const paired=process.env.DSH_MV_QA_CONTROL==='paired'
const report={status:'running',packDir,upstream,probe,baselineControl:control?'OffscreenCanvas factories only (diagnostic, not original pass)':paired?'Unmodified source plus OffscreenCanvas-only control':'unmodified source',frames:[],preparation:[],hostReads:[],baselineRequests:[],errors:[],warnings:[],failures:[],externalRequests:[],screenshots:[]}
const save=()=>writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n')
async function collect(dir,sub=''){const files=[];for(const ent of await readdir(join(dir,sub),{withFileTypes:true})){const path=[sub,ent.name].filter(Boolean).join('/');if(ent.isDirectory())files.push(...await collect(dir,path));else{const b=await readFile(join(dir,path));files.push({path,size:b.length,sha256:sha(b)})}}return files}
const browserEntry=String.raw`
import {ScriptFilm,blobWorkerFactory} from './.dsh-plugin/client/mv/script-film.mjs';
import {packAssetReader,packFontReader,loadSceneAssets,loadSceneFonts,disposeSceneAssets} from './.dsh-plugin/client/mv/dshpv/assets.mjs';
import {fetchPackText} from './.dsh-plugin/client/mv-pack-state.mjs';
import {parseLyrics} from './.dsh-plugin/shared/mv-lyrics.mjs';
let film=null,original=null,controlled=null,workerTimes=[],preparation=[],failure=[],messages=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const workerCanvas=document.querySelector('#worker'),baselineCanvas=document.querySelector('#original');
const g=workerCanvas.getContext('2d',{willReadFrequently:true}),reference=document.createElement('canvas'),rg=reference.getContext('2d',{willReadFrequently:true});
window.qaStart=async ({loaded,paired})=>{
  const p=loaded.pack,api={packRead:r=>window.hostRead(r)},scene=await loadSceneAssets(packAssetReader(api,loaded.manifestPath,p),p,{images:true}),source=await fetchPackText(api,loaded.manifestPath,'scene'),fontData=await loadSceneFonts(packFontReader(api,loaded.manifestPath),p);
  workerCanvas.width=baselineCanvas.width=reference.width=p.canvas.size[0];workerCanvas.height=baselineCanvas.height=reference.height=p.canvas.size[1];
  film=new ScriptFilm({title:p.title,artist:p.artist,duration:p.duration,createWorker:source=>{const worker=blobWorkerFactory(source);worker.addEventListener('message',e=>messages.push({type:e.data?.type,id:e.data?.id,ms:e.data?.ms,error:e.data?.error}));return worker;},onPrepare:s=>{preparation.push(s);window.hostPrepare(s);},onFail:r=>failure.push(r)});
  film.setStructure({sections:p.sections});const captions=await fetchPackText(api,loaded.manifestPath,'lyrics');film.setLyrics(parseLyrics(captions.name,captions.text));
  const started=performance.now();
  try{await film.load(source.text,{output:'webgl',size:p.canvas.size,context:p.canvas.context,assets:scene.assets,transfer:[...scene.transfer,...fontData.transfer],fonts:fontData.fonts});}catch(e){disposeSceneAssets(scene);throw e;}
  const workerLoadMs=performance.now()-started;
  const {createEngine}=await import('/original/src/engine/engine.js');
  const cfg=await (await fetch('/original/config.json')).json(),featuresData=await (await fetch('/original/data/audio_features.json')).json();
  const originalStarted=performance.now();original=await createEngine({canvas:baselineCanvas,width:p.canvas.size[0],height:p.canvas.size[1],cfg,featuresData,lyricsData:JSON.parse(captions.text),flipY:false});
  if(paired){const {createEngine}=await import('/control/src/engine/engine.js');const canvas=document.createElement('canvas');canvas.width=p.canvas.size[0];canvas.height=p.canvas.size[1];controlled=await createEngine({canvas,width:p.canvas.size[0],height:p.canvas.size[1],cfg,featuresData,lyricsData:JSON.parse(captions.text),flipY:false});controlled.qaCanvas=canvas;}
  const shots=original.scenes.filter(s=>!s.overlay).map(s=>({id:s.id,at:s.at,start:s.start,end:s.end,until:s.until,enter:s.enter,state:s.state}));
  if(shots.length!==87||shots.some(s=>s.id.startsWith('todo-')))throw new Error('Source baseline lost original shots');
  const gl=original.post.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {workerLoadMs,baselineLoadMs:performance.now()-originalStarted,shots,fonts:fontData.fonts.length,images:scene.transfer.length,captions:film.lyrics.length,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
};
function difference(a,b){let changed=0,channels=0,max=0,sum=0,alpha=0;for(let i=0;i<a.length;i+=4){let any=false;for(let c=0;c<4;c++){const d=Math.abs(a[i+c]-b[i+c]);if(d){any=true;channels++;sum+=d;max=Math.max(max,d);if(c===3)alpha++;}}if(any)changed++;}return {differentPixels:changed,differentFraction:changed/(a.length/4),differentChannels:channels,maxDelta:max,meanAbsDelta:sum/a.length,alphaDifferences:alpha};}
window.qaDecode=async()=>{
  const result=[];
  for(const name of ['f_bust','f_profile','f_reach','f_eye','boy_bust','man_bust','cat_bust','cat_paws']){
    const url='/assets/character/'+name+'.png',img=new Image();img.src=url;await img.decode();
    const bitmap=await createImageBitmap(await(await fetch(url)).blob());
    const dom=document.createElement('canvas');dom.width=img.naturalWidth;dom.height=img.naturalHeight;
    const off=new OffscreenCanvas(dom.width,dom.height),other=new OffscreenCanvas(dom.width,dom.height);
    const d=dom.getContext('2d',{willReadFrequently:true}),o=off.getContext('2d',{willReadFrequently:true}),b=other.getContext('2d',{willReadFrequently:true});
    d.drawImage(img,0,0);o.drawImage(img,0,0);b.drawImage(bitmap,0,0);
    const pixels=g=>g.getImageData(0,0,dom.width,dom.height).data;
    result.push({name,canvasFactory:difference(pixels(d),pixels(o)),decode:difference(pixels(o),pixels(b))});bitmap.close();
  }
  return result;
};
async function workerFrame(t){
  if(film.state!=='ready')throw new Error(film.error||film.state);const id=film.nextId;film.request(t,...film.size,{paused:true});
  while(film.pending&&film.state==='ready'){film.request(t,...film.size,{paused:true});await wait(4);}
  if(film.state!=='ready'||!film.bitmap)throw new Error(film.error||'No worker bitmap');
  const frame=messages.findLast(m=>m.type==='frame');if(frame?.id!==id)throw new Error('Comparison requires a fresh worker frame, never the previous bitmap');
  return frame;
}
window.qaFrame=async t=>{
  const at=performance.now(),last=await workerFrame(t);
  g.globalCompositeOperation='copy';g.drawImage(film.bitmap,0,0);g.globalCompositeOperation='source-over';
  original.renderFrame(t);original.post.gl.finish();rg.globalCompositeOperation='copy';rg.drawImage(baselineCanvas,0,0);rg.globalCompositeOperation='source-over';
  const a=g.getImageData(0,0,workerCanvas.width,workerCanvas.height).data,b=rg.getImageData(0,0,reference.width,reference.height).data;
  const d=difference(a,b),result={t,...d,workerId:last.id,workerMs:last.ms,wallMs:performance.now()-at,slowFrames:film.slow};
  if(controlled){controlled.renderFrame(t);controlled.post.gl.finish();rg.globalCompositeOperation='copy';rg.drawImage(controlled.qaCanvas,0,0);result.offscreenControl=difference(a,rg.getImageData(0,0,reference.width,reference.height).data);}
  workerTimes.push(result);return result;
};
// Approximate upstream tools/check_flash.py: exact same 64x36 general/red
// transition thresholds. This compares adaptation/source, not PSE certification.
const tiny=document.createElement('canvas'),tg=tiny.getContext('2d',{willReadFrequently:true});tiny.width=64;tiny.height=36;
function tinyPixels(canvas){tg.globalCompositeOperation='copy';tg.drawImage(canvas,0,0,64,36);return tg.getImageData(0,0,64,36).data;}
window.qaDense=async(start,count,fps)=>{
  const rows=[];
  for(let i=0;i<count;i++){
    const t=start+i/fps,last=await workerFrame(t);g.globalCompositeOperation='copy';g.drawImage(film.bitmap,0,0);g.globalCompositeOperation='source-over';
    original.renderFrame(t);original.post.gl.finish();
    const a=tinyPixels(workerCanvas),b=tinyPixels(baselineCanvas),d=difference(a,b);
    const encode=bytes=>{let s='';for(let i=0;i<bytes.length;i+=4)s+=String.fromCharCode(bytes[i],bytes[i+1],bytes[i+2]);return btoa(s);};
    const row={t,workerId:last.id,workerMs:last.ms,slowFrames:film.slow,...d,worker:encode(a),original:encode(b)};
    if(controlled){controlled.renderFrame(t);controlled.post.gl.finish();const c=tinyPixels(controlled.qaCanvas);row.offscreenControl=difference(a,c);row.controlled=encode(c);}
    rows.push(row);
  }
  return rows;
};
window.qaStop=()=>{film?.stop();return {failure,preparation,messages,workerTimes,worker:!!film?.worker,bitmap:!!film?.bitmap};};
window.qaIsolation=async()=>{const probe=new ScriptFilm({createWorker:blobWorkerFactory});await probe.load('function paint(gl){if([typeof FontFace,typeof fonts,typeof fetch,typeof document,typeof self,typeof globalThis].some(x=>x!=="undefined"))throw new Error("privilege leak");gl.clearColor(0,1,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}',{output:'webgl',size:[320,180]});probe.request(0,320,180,{paused:true});while(probe.pending&&probe.state==='ready'){probe.request(0,320,180,{paused:true});await wait(5);}const ok=probe.state==='ready',error=probe.error;probe.stop();if(!ok)throw new Error(error);return {isolated:ok};};
`

let server,browser,page
try{
  assert.equal(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),UPSTREAM_COMMIT)
  assert.equal(execFileSync('git',['-C',upstream,'status','--porcelain','--untracked-files=all'],{encoding:'utf8'}).trim(),'','Original baseline must be the unmodified pinned commit')
  const loaded=await loadPack(packDir),files=await collect(packDir)
  assert.deepEqual(loaded.warnings,[])
  const validated=await validateWorkshopPack({id:loaded.pack.workshop.id,files,readText:p=>readFile(join(packDir,p),'utf8'),readBytes:p=>readFile(join(packDir,p))})
  assert.deepEqual(validated.errors,[])
  report.files=files.length;report.bytes=files.reduce((n,f)=>n+f.size,0);report.sourceCommit=UPSTREAM_COMMIT
  const code=await build({stdin:{contents:browserEntry,sourcefile:'nyankomintsu-smoke-entry.mjs',resolveDir:root},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',external:['/original/*','/control/*']})
  server=createServer(async(req,res)=>{
    try{
      let url=decodeURIComponent(new URL(req.url,'http://local').pathname)
      if(url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><title>Nyankomint source/worker QA</title><style>body{margin:0;background:#000}canvas{display:block}</style><canvas id="worker"></canvas><canvas id="original"></canvas>');return}
      if(url==='/favicon.ico'){res.writeHead(204).end();return}
      let dir,path
      if(url.startsWith('/node_modules/@fontsource/')){dir=fontRoot;path=url.slice('/node_modules/@fontsource/'.length)}
      else {dir=upstream;path=url.replace(/^\/(original|control)\//,'/').slice(1)}
      assert.ok(!/\.(wav|mp3|mp4|m4a|flac|ogg|opus|webm)$/i.test(path)&&!path.includes('音頻&歌詞'),'Audio forbidden')
      assert.ok(!path.split('/').some(p=>p==='..'||p.startsWith('.')),'Invalid baseline path')
      const full=resolve(dir,path);assert.ok(!relative(dir,full).startsWith('..'))
      let bytes=await readFile(full);const mime={'.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.jpg':'image/jpeg'}
      if((control||url.startsWith('/control/'))&&path.endsWith('.js'))bytes=Buffer.from(bytes.toString('utf8').replace(/document\.createElement\(['"]canvas['"]\)/g,'new OffscreenCanvas(8,8)'))
      res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(bytes);report.baselineRequests.push(path)
    }catch(error){res.writeHead(404).end(error.message)}
  })
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`
  const executablePath=process.env.DSH_MV_CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
  const native=process.env.DSH_MV_GPU_MODE==='native';report.gpuMode=native?'native':'swiftshader'
  browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true,args:native?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']})
  report.browser=await browser.version();page=await browser.newPage({viewport:{width:1920,height:1080}})
  page.on('pageerror',error=>report.errors.push(error.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text())})
  await page.route('**/*',async route=>{const url=route.request().url();if(/^https?:/.test(url)&&!url.startsWith(origin+'/')){report.externalRequests.push(url);await route.abort();return}await route.continue()})
  await page.exposeFunction('hostRead',async req=>{assert.equal(req.manifestPath,loaded.manifestPath);assert.ok(['scene','asset','font','lyrics'].includes(req.role));report.hostReads.push({role:req.role,font:req.font,asset:req.asset,part:req.part,offset:req.offset});return {ok:true,value:await readPackFile(parsePackRead(req))}})
  await page.exposeFunction('hostPrepare',async s=>{report.preparation.push(s);if(s.step%20===0||s.done){console.log(`[Nyankomint] prepare ${s.step}: ${Math.round(s.progress*100)}% ${s.label}`);await save()}})
  await page.goto(origin);await page.addScriptTag({content:code.outputFiles[0].text,type:'module'});await page.waitForFunction(()=>typeof window.qaStart==='function')
  report.current={phase:'source-worker-load'};report.setup=await page.evaluate(opts=>window.qaStart(opts),{loaded,paired})
  assert.equal(report.setup.shots.length,87);assert.equal(report.setup.captions,129);assert.equal(report.setup.fonts,34)
  report.decodeDiagnostic=await page.evaluate(()=>window.qaDecode())
  const shots=report.setup.shots,chosen=probe.length?probe.map(t=>({id:`probe-${t}`,t})):shots.map(s=>({id:s.id,t:Math.min(loaded.pack.duration-.001,(s.at+s.until)/2)}))
  const keys=new Set(['preroll','title','v2-cat','left-away','err-window','count-kr','cx-eye','love-proof','down-power'])
  async function capture(t,kind,id,screenshot=false){report.current={phase:kind,id,t};const frame=await page.evaluate(t=>window.qaFrame(t),t);report.frames.push({kind,id,...frame});if(screenshot){const prefix=`${kind}-${id}`.replace(/[^A-Za-z0-9_-]/g,'-');for(const side of ['worker','original']){const name=`${prefix}-${side}.png`;await page.locator('#'+(side==='worker'?'worker':'original')).screenshot({path:join(out,name)});report.screenshots.push({name,t,kind,id,side})}}return frame}
  for(const [i,s]of chosen.entries()){await capture(s.t,'shot',s.id,probe.length||keys.has(s.id)||i%12===0);if(i%12===0){console.log(`[Nyankomint] ${i+1}/${chosen.length}: ${s.id}`);await save()}}
  if(!probe.length){
    for(let i=1;i<shots.length;i++){const s=shots[i],previous=shots[i-1];for(const t of [Math.max(-5,s.start+.005),s.at,Math.min(loaded.pack.duration-.001,previous.end-.005)])await capture(t,'transition',s.id)}
    for(const t of [-5,-3,-1,-.4,0,.1,47.1,50.82,88.96,92,148.04,159.11,162.81,177.57,192.20,192.34,211.5])await capture(t,'boundary',String(t),t===-3||t===192.2)
    for(const s of shots.filter((_,i)=>i%8===0)){const t=Math.min(loaded.pack.duration-.001,(s.at+s.until)/2);const a=await capture(t,'pause-reference',s.id);await capture(loaded.pack.duration-1,'seek-away',s.id);const b=await capture(t,'seek-back',s.id);report.frames.push({kind:'pause-seek-summary',id:s.id,t,before:a.meanAbsDelta,after:b.meanAbsDelta})}
    const fps=60,start=147,end=193,count=Math.ceil((end-start)*fps),dense=[];
    report.current={phase:'dense-strong-light',start,end,fps};
    for(let i=0;i<count;i+=30){const batch=await page.evaluate(({start,count,fps})=>window.qaDense(start,count,fps),{start:start+i/fps,count:Math.min(30,count-i),fps});dense.push(...batch);if(i%300===0){console.log(`[Nyankomint] dense strong-light ${i}/${count} frames`);await save()}}
    report.dense={start,end,fps,frames:dense.length,maxMeanAbsDelta:Math.max(...dense.map(f=>f.meanAbsDelta)),maxChannelDelta:Math.max(...dense.map(f=>f.maxDelta)),maxWorkerMs:Math.max(...dense.map(f=>f.workerMs))};
    await writeFile(join(out,'dense-strong-light.json'),JSON.stringify(dense.map(({worker,original,controlled,...f})=>f),null,2)+'\n');
    const scan=side=>flashCheck(dense.map(f=>Buffer.from(f[side],'base64')),fps,start);
    report.flash={worker:scan('worker'),original:scan('original'),...(paired?{offscreenControl:scan('controlled')}:{}),note:'Approximate 64x36 thresholds from pinned upstream tools/check_flash.py. Preserved warning; not medical/PSE certification.'};
    assert.deepEqual(report.flash.worker,report.flash.original,'General/red flash transitions and single-frame changes must match the source');
    const strict=f=>f.meanAbsDelta<=.1&&f.maxDelta<=2&&f.alphaDifferences===0;
    if(paired){assert.ok(dense.every(f=>strict(f.offscreenControl)),'Dense OffscreenCanvas-only control mismatch');assert.deepEqual(report.flash.worker,report.flash.offscreenControl);assert.ok(dense.every(f=>f.meanAbsDelta<=.15&&f.alphaDifferences===0),'Dense original DOM raster bound');}
    else assert.ok(dense.every(strict),'Dense strong-light source/worker raster differences');
  }
  report.isolation=await page.evaluate(()=>window.qaIsolation());report.cleanup=await page.evaluate(()=>window.qaStop())
  assert.deepEqual(report.cleanup.failure,[]);assert.ok(!report.cleanup.worker&&!report.cleanup.bitmap)
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[])
  assert.ok(report.warnings.every(w=>/GPU stall due to ReadPixels/.test(w)),'Unexpected font/shot/palette warning')
  const comparisons=report.frames.filter(f=>Number.isFinite(f.meanAbsDelta))
  report.comparison={frames:comparisons.length,maxMeanAbsDelta:Math.max(...comparisons.map(f=>f.meanAbsDelta)),maxDifferentFraction:Math.max(...comparisons.map(f=>f.differentFraction)),maxChannelDelta:Math.max(...comparisons.map(f=>f.maxDelta)),
    tolerance:{meanAbsDelta:.1,differentFraction:.005,maxDelta:2,alphaDifferences:0},note:'Same original/worker composition; allowances cover isolated Canvas2D/GPU rounding (at most 2/255), never missing/reflowed content. Inspect saved pairs.'}
  if(paired){
    report.comparison.tolerance={meanAbsDelta:.15,differentFraction:.02,maxDelta:150,alphaDifferences:0};
    report.comparison.controlTolerance={meanAbsDelta:.1,differentFraction:.005,maxDelta:2,alphaDifferences:0};
    report.comparison.note='Every frame also matches the source with ONLY DOM canvas factories changed to OffscreenCanvas at the strict 2/255 bound. Original DOM raster differences remain bounded and saved separately; image decoding is independently identical. No scene/math/layout is changed in the control.';
    assert.ok(comparisons.every(f=>f.offscreenControl.meanAbsDelta<=.1&&f.offscreenControl.differentFraction<=.005&&f.offscreenControl.maxDelta<=2&&f.offscreenControl.alphaDifferences===0),'OffscreenCanvas-only source control mismatch');
    assert.ok(comparisons.every(f=>f.meanAbsDelta<=.15&&f.differentFraction<=.02&&f.maxDelta<=150&&f.alphaDifferences===0),'Original DOM raster difference bound');
  }else assert.ok(comparisons.every(f=>f.meanAbsDelta<=.1&&f.differentFraction<=.005&&f.maxDelta<=2&&f.alphaDifferences===0),'Original/worker image differences exceed the explicit raster tolerance')
  report.status=probe.length?'probe-passed':'passed';delete report.current;console.log(`[Nyankomint] ${report.status}: ${comparisons.length} comparisons; ${out}`)
}catch(error){report.status='failed';report.failures.push({message:error.message,stack:error.stack,at:report.current});try{report.cleanup=await page?.evaluate(()=>window.qaStop())}catch{}process.exitCode=1;console.error(`[Nyankomint] FAIL: ${error.message}; ${out}`)}
finally{await save();await browser?.close();if(server)await new Promise(r=>server.close(r))}
