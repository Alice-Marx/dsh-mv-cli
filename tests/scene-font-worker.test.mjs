import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { SCENE_FONT_LIMITS, sceneFontFamilyValid, sceneFontUnicodeRangeValid, sceneFontProblems, sceneWorkerSource } from '../.dsh-plugin/shared/mv-scene.mjs'
import { PIXEL_STUB_SOURCE } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { ScriptFilm } from '../.dsh-plugin/client/mv/script-film.mjs'

const paint='function paint(g){g.fillRect(0,0,4,4)}'
const bytes=(size=8)=>{const b=new Uint8Array(size);b.set([119,79,70,50]);return b.buffer}
const face=(extra={})=>({family:'Offline-Test',weight:'400',style:'normal',bytes:bytes(),...extra})
const ready=()=>({type:'ready',error:''})
const progress=(loaded,total=2)=>({type:'font-loading',loaded,total,progress:loaded/total,label:'',done:loaded===total})
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()}

/** Native font stubs are created in a separate VM realm; only tests own the hooks. */
function workerHarness(source=paint,{native=true,output='pixels',registerFailure=0}={}){
  const posted=[],stages=[],timers=new Map();let listener,nextTimer=1,clock=0
  const context=vm.createContext({
    postMessage:m=>posted.push(m),addEventListener:(type,fn)=>{if(type==='message')listener=fn},
    performance:{now:()=>clock},setTimeout:(fn,ms)=>{const id=nextTimer++;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id),
    __stage:step=>stages.push(step),
  })
  vm.runInContext(`var self=globalThis;${PIXEL_STUB_SOURCE}
    OffscreenCanvas.prototype.transferToImageBitmap=function(){return {width:this.width,height:this.height,close(){}}};
    var __nativeFaces=[],__nativeRequests=[],__nativeRegistered=[];
    ${native?`function FontFace(family,data,options){this.family=family;this.data=data;this.options=options;this.status='unloaded';__nativeFaces.push(this);__stage('font-construct');}
    FontFace.prototype.load=function(){const face=this;return new Promise((resolve,reject)=>__nativeRequests.push({resolve(){face.status='loaded';__stage('font-loaded');resolve(face)},reject}));};
    var fonts={add(face){if(__nativeRegistered.length+1===${registerFailure})throw Error('font registration failed');__nativeRegistered.push(face);__stage('font-add');},delete(face){const at=__nativeRegistered.indexOf(face);if(at>=0)__nativeRegistered.splice(at,1);}};`:''}
  `,context)
  vm.runInContext(sceneWorkerSource(source,{output}),context,{timeout:2000})
  const send=message=>{
    if(Array.isArray(message.fonts)){
      // Structured cloning creates worker-realm buffers in browsers. Recreate
      // that behaviour rather than weakening instanceof validation in tests.
      context.__fontPayload=JSON.stringify(message.fonts.map(f=>({...f,bytes:f.bytes instanceof ArrayBuffer?[...new Uint8Array(f.bytes)]:f.bytes})))
      const cloned=vm.runInContext(`JSON.parse(__fontPayload).map(f=>({...f,bytes:Array.isArray(f.bytes)?Uint8Array.from(f.bytes).buffer:f.bytes}))`,context)
      delete context.__fontPayload;message={...message,fonts:cloned}
    }
    return listener({data:message})
  }
  const init=fonts=>send({type:'init',info:{width:320,height:180,assets:{answer:42}},...(fonts===undefined?{}:{fonts})})
  return {posted,stages,context,timers,send,init,setClock:value=>{clock=value},resolve:index=>vm.runInContext(`__nativeRequests[${index}].resolve()`,context),reject:index=>vm.runInContext(`__nativeRequests[${index}].reject(Error('bad font bytes'))`,context)}
}

class FakeWorker{
  sent=[];terminated=false
  postMessage(message,transfer){this.sent.push({message,transfer})}
  terminate(){this.terminated=true}
  reply(message){this.onmessage?.({data:message})}
}
function filmHarness(fonts=[face(),face({family:'Second-Font'})],options={}){
  const worker=new FakeWorker(),events=[]
  const film=new ScriptFilm({createWorker:()=>worker,onPrepare:s=>events.push(s),...options})
  const loading=film.load(paint,{output:'pixels',size:[320,180],fonts})
  return {worker,film,loading,events}
}

test('offline font transport bounds bytes, faces, safe family/style and CSS Unicode ranges',()=>{
  assert.equal(SCENE_FONT_LIMITS.loadMs,30_000)
  assert.deepEqual(sceneFontProblems([face({unicodeRange:'U+0-FF,U+4E00-4EFF,U+11??',style:'oblique'})],{output:'pixels'}),[])
  for(const family of ['sans-serif','SERIF','system-ui','ui-monospace','inherit','url(http://x)','"Quote"','C:\\Windows\\Fonts','Leading;Rule',''])assert.equal(sceneFontFamilyValid(family),false,family)
  assert.equal(sceneFontFamilyValid('JetBrains Mono'),true)
  for(const range of ['U+FF-0','U+110000','U+FFFFFF','U+??FFF','U+?','U+0,','url(http://x)','U+0,'.repeat(257)]){
    // U+? is a valid wildcard; the others are malformed or exceed bounds.
    assert.equal(sceneFontUnicodeRangeValid(range),range==='U+?',range)
  }
  for(const change of [{family:'url(http://x)'},{weight:'bold'},{style:'unknown'},{unicodeRange:'U+110000'},{bytes:new Uint8Array(8)},{bytes:bytes(2*1024*1024+1)},{file:'remote.woff2'},{bytes:new ArrayBuffer(8)}])assert.ok(sceneFontProblems([face(change)],{output:'webgl'}).length)
  assert.ok(sceneFontProblems(Array.from({length:65},()=>face()),{output:'webgl'}).length)
  assert.ok(sceneFontProblems(Array.from({length:7},()=>face({bytes:bytes(2*1024*1024)})),{output:'pixels'}).some(e=>e.includes('总计')))
  assert.ok(sceneFontProblems([face()],{output:'text'}).length)
  assert.deepEqual(sceneFontProblems([],{output:'text'}),[])
})

test('worker loads/registers all fonts before any user top-level/setup/prepare/warmup code',async()=>{
  const source=`__stage('user-top');
    function setup(info){__stage('setup');if(info.assets.answer!==42||'fonts'in info||'bytes'in info)throw Error('private data');
      if([typeof FontFace,typeof FontFaceSet,typeof fonts,typeof __FontFace,typeof __fontSet,typeof __loadFonts,typeof fetch,typeof document].some(t=>t!=='undefined'))throw Error('font privilege leak');}
    function* prepare(){__stage('prepare');yield {progress:.5}}
    function warmup(){__stage('warmup')}
    function paint(g){__stage('paint');g.fillRect(0,0,1,1)}`
  const h=workerHarness(source);h.init([face(),face({family:'Second-Font',style:'italic',unicodeRange:'U+0-FF'})])
  assert.deepEqual(h.stages,['font-construct','font-construct'])
  assert.equal(h.posted[0].type,'font-loading');assert.equal(h.posted[0].loaded,0)
  h.send({type:'frame',id:1,t:0,cols:320,rows:180,ctx:{}});assert.equal(h.posted.length,1,'no early frame')
  h.resolve(1);await flush();assert.equal(h.posted.at(-1).loaded,1)
  assert.ok(!h.stages.includes('user-top'))
  h.resolve(0);await flush()
  assert.deepEqual(h.stages,['font-construct','font-construct','font-loaded','font-loaded','font-add','font-add','user-top','setup'])
  assert.deepEqual(h.posted.map(m=>m.type),['font-loading','font-loading','font-loading','preparing'])
  assert.equal(h.posted[2].done,true)
  assert.equal(h.timers.size,0)
  h.send({type:'prepare-next',id:1});h.send({type:'prepare-next',id:2})
  assert.deepEqual(h.posted.slice(-2).map(m=>m.type),['warming','ready'])
  h.send({type:'frame',id:2,t:0,cols:320,rows:180,ctx:{}})
  assert.equal(h.posted.at(-1).type,'frame')
  assert.deepEqual(h.stages.slice(-3),['prepare','warmup','paint'])
})

test('worker rejects missing native font APIs, malformed messages and failed faces without setup/fallback',async()=>{
  const missing=workerHarness('__stage("user");'+paint,{native:false});missing.init([face()]);await flush()
  assert.equal(missing.posted.at(-1).type,'fatal');assert.match(missing.posted.at(-1).error,/FontFace/);assert.deepEqual(missing.stages,[])
  const invalid=workerHarness('__stage("user");'+paint);invalid.init([face({family:'url(http://x)'})]);assert.equal(invalid.posted.at(-1).type,'fatal');assert.deepEqual(invalid.stages,[])
  const broken=workerHarness('__stage("user");'+paint);broken.init([face(),face()]);broken.resolve(0);await flush();broken.reject(1);await flush()
  assert.equal(broken.posted.at(-1).type,'fatal');assert.match(broken.posted.at(-1).error,/bad font bytes/)
  assert.equal(vm.runInContext('__nativeRegistered.length',broken.context),0)
  assert.ok(!broken.stages.includes('user'));assert.equal(broken.timers.size,0)
  const registration=workerHarness(paint,{registerFailure:2});registration.init([face(),face()]);registration.resolve(0);registration.resolve(1);await flush()
  assert.equal(registration.posted.at(-1).type,'fatal');assert.equal(vm.runInContext('__nativeRegistered.length',registration.context),0,'atomic registration rollback')
})

test('worker font total timeout ignores partial progress and suppresses late completion',async()=>{
  const h=workerHarness('__stage("user");'+paint);h.init([face(),face()]);h.resolve(0);await flush()
  assert.equal(h.timers.size,1)
  const [timer]=h.timers.values();assert.equal(timer.ms,SCENE_FONT_LIMITS.loadMs)
  h.setClock(SCENE_FONT_LIMITS.loadMs);timer.fn();await flush()
  assert.equal(h.posted.at(-1).type,'fatal');assert.match(h.posted.at(-1).error,/30000/)
  const count=h.posted.length;h.resolve(1);await flush();assert.equal(h.posted.length,count,'expired fonts must not start a late scene')
  assert.ok(!h.stages.includes('user'))
})

test('worker empty-font legacy init stays synchronous even without FontFace support',()=>{
  for(const fontArgs of [undefined,[]]){
    const h=workerHarness('__stage("setup");'+paint,{native:false});h.init(fontArgs)
    assert.deepEqual(h.posted.map(m=>m.type),['ready']);assert.deepEqual(h.stages,['setup']);assert.equal(h.timers.size,0)
  }
})

test('ScriptFilm sends fonts outside info and transfers each font buffer exactly once',async()=>{
  const fonts=[face(),face({family:'Second-Font'})],h=filmHarness(fonts)
  const init=h.worker.sent[0]
  assert.equal(init.message.fonts,fonts)
  assert.equal('fonts'in init.message.info,false);assert.equal('bytes'in init.message.info,false)
  assert.deepEqual(init.transfer,fonts.map(f=>f.bytes))
  assert.equal(h.film.setupTimer,null);assert.notEqual(h.film.fontTimer,null)
  h.worker.reply(progress(0));h.worker.reply(progress(1));h.worker.reply(progress(2))
  assert.equal(h.film.state,'loading');assert.equal(h.film.fontTimer,null);assert.notEqual(h.film.setupTimer,null)
  h.worker.reply(ready());await h.loading
  assert.equal(h.film.state,'ready');assert.equal(h.events.length,3)
  assert.ok(h.events.every(e=>e.phase==='font-loading'))
  assert.equal(h.events.at(-1).done,true)
  h.film.stop()
  const w=new FakeWorker(),film=new ScriptFilm({createWorker:()=>w}),buffer=bytes(),descriptor=face({bytes:buffer})
  const loading=film.load(paint,{output:'pixels',fonts:[descriptor,descriptor],transfer:[buffer,buffer]})
  assert.deepEqual(w.sent[0].transfer,[buffer])
  film.stop();await assert.rejects(loading,/已取消/)
})

test('ScriptFilm font watchdog is 30s total, cannot renew, then setup keeps its separate 5s deadline',async t=>{
  t.mock.timers.enable({apis:['setTimeout']})
  const h=filmHarness(),rejected=assert.rejects(h.loading,/字体.*30000/)
  h.worker.reply(progress(0));t.mock.timers.tick(5001);assert.equal(h.film.state,'font-loading')
  h.worker.reply(progress(1));t.mock.timers.tick(SCENE_FONT_LIMITS.loadMs-5001);await rejected
  assert.equal(h.worker.terminated,true);assert.equal(h.film.fontTimer,null)
  const setup=filmHarness();setup.worker.reply(progress(0));t.mock.timers.tick(29_000)
  setup.worker.reply(progress(1));setup.worker.reply(progress(2))
  const setupFailed=assert.rejects(setup.loading,/脚本加载超时/)
  t.mock.timers.tick(1000);assert.equal(setup.film.state,'loading')
  t.mock.timers.tick(4000);await setupFailed;assert.equal(setup.worker.terminated,true)
})

test('ScriptFilm refuses early ready, malformed/duplicate font progress and closes unexpected bitmaps',async()=>{
  for(const bad of [ready(),{type:'preparing',id:0,progress:0,label:''},{...progress(0),total:3},{...progress(0),progress:NaN},{...progress(0),loaded:1},{...progress(0),done:true},{...progress(0),label:'x'.repeat(161)}]){
    const h=filmHarness(),failure=assert.rejects(h.loading,/字体/);h.worker.reply(bad);await failure;assert.equal(h.worker.terminated,true)
  }
  const repeat=filmHarness(),failed=assert.rejects(repeat.loading,/字体/);repeat.worker.reply(progress(0));repeat.worker.reply(progress(0));await failed
  let closed=0;const bitmap=filmHarness(),bad=assert.rejects(bitmap.loading,/字体/);bitmap.worker.reply({...progress(0),bitmap:{close(){closed++}}});await bad;assert.equal(closed,1)
})

test('ScriptFilm cancels font loading without stale callbacks reviving the scene',async()=>{
  const h=filmHarness(),old=h.worker.onmessage,failed=assert.rejects(h.loading,/已取消/)
  h.worker.reply(progress(0));h.film.stop();await failed
  assert.equal(h.film.fontTimer,null);old({data:progress(2)});assert.equal(h.film.state,'idle')
  const callbacks=filmHarness([face()],{onPrepare:()=>callbacks.film.stop()})
  const cancelled=assert.rejects(callbacks.loading,/已取消/);callbacks.worker.reply(progress(0,1));await cancelled
  assert.equal(callbacks.film.fontTimer,null);assert.equal(callbacks.worker.terminated,true)
})

test('ScriptFilm rejects invalid binary/font privilege payloads before creating a worker',async()=>{
  let created=0;const film=new ScriptFilm({createWorker:()=>{created++;return new FakeWorker()}})
  await assert.rejects(film.load(paint,{output:'pixels',fonts:[face({source:'https://font'})]}),/未知字段/)
  await assert.rejects(film.load('function render(){return ["x"]}',{fonts:[face()]}),/位图/)
  assert.equal(created,0)
})
