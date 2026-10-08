import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { parseMvPack, parsePackRead, MV_FONT_LIMITS, checkSceneFont } from '../.dsh-plugin/shared/mv-pack.mjs'
import { sceneWebglContextProblems, sceneWorkerSource } from '../.dsh-plugin/shared/mv-scene.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { packFontReader, loadSceneFonts } from '../.dsh-plugin/client/mv/dshpv/assets.mjs'
import { looksLikeLyricsJs } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { checkScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { MV_PACK_JSON_SCHEMA } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { validateWorkshopPack, parseWorkshopPublish, parseWorkshopIndex, packRequires, WORKSHOP_INDEX_FORMAT, WORKSHOP_DEFAULT_MIRROR } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { preparePublish, createWorkshopManager } from '../.dsh-plugin/shared/mv-workshop-host.mjs'

// Synthetic headers only: never real glyphs, recordings or lyric text.
const font=(length=52)=>{const b=Buffer.alloc(length);b.write('wOF2');b.writeUInt32BE(0x10000,4);b.writeUInt32BE(length,8);b.writeUInt16BE(1,12);b.writeUInt32BE(64,16);b.writeUInt32BE(4,20);return b}
const face={family:'Synthetic Font',file:'fonts/synthetic.woff2',licenseFile:'fonts/OFL-synthetic.txt'}
const base=()=>({format:'dsh-mv-pack',version:1,title:'Synthetic bitmap',duration:10,canvas:{renderer:'script',output:'webgl',script:'scene.js',fonts:[{...face}],preroll:5,context:{antialias:false,depth:false,preserveDrawingBuffer:true,premultipliedAlpha:true,powerPreference:'high-performance'}},'x-dsh-mv-workshop':{id:'synthetic-bitmap',version:'1.0.0',author:'Synthetic authors',license:'MIT AND OFL-1.1',fontsLicense:'OFL-1.1',fontsCredit:'Synthetic font authors',fontsNotice:'fonts/NOTICE.md'}})
const fixture=()=>{const raw=base();return {raw,files:{'mv.json':Buffer.from(JSON.stringify(raw)),'scene.js':Buffer.from('var Lyrics = class {}; const lyrics = new Lyrics(); function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}'),'fonts/synthetic.woff2':font(),'fonts/OFL-synthetic.txt':Buffer.from('Synthetic test fixture: SIL OPEN FONT LICENSE Version 1.1'),'fonts/NOTICE.md':Buffer.from('Synthetic authors and provenance')}}}
const listing=files=>Object.entries(files).map(([path,b])=>({path,size:b.length}))
const validate=(files,list=listing(files))=>validateWorkshopPack({id:'synthetic-bitmap',files:list,readText:p=>files[p].toString('utf8'),readBytes:p=>files[p]})

test('bitmap manifest restricts offline fonts, preroll and WebGL creation attributes',()=>{
  const p=parseMvPack(base());assert.equal(p.canvas.fonts[0].weight,'400');assert.equal(p.canvas.fonts[0].style,'normal');assert.equal(p.canvas.preroll,5);assert.equal(packRequires(p),'0.10.0')
  for(const [key,value] of [['file','https://example.com/x.woff2'],['file','../x.ttf'],['file','C:/x.ttf'],['file','fonts/msyh.ttf'],['family','Consolas'],['family','serif'],['family','1evil'],['weight','bold'],['unicodeRange','U+110000'],['unicodeRange','U+90-80'],['licenseFile','C:/NOTICE.md']]){const r=base();r.canvas.fonts[0][key]=value;assert.throws(()=>parseMvPack(r),undefined,key+': '+value)}
  for(const fonts of [null,Array.from({length:65},(_,i)=>({...face,family:'Font '+i})),[face,face]]){const r=base();r.canvas.fonts=fonts;assert.throws(()=>parseMvPack(r))}
  for(const output of ['text','pixels']){const r=base();r.canvas.output=output;assert.throws(()=>parseMvPack(r))}
  for(const preroll of [-1,31,NaN,'5']){const r=base();r.canvas.preroll=preroll;assert.throws(()=>parseMvPack(r))}
  const r=base();r.canvas.fonts[0].unicodeRange='U+11??, U+10-20';assert.equal(parseMvPack(r).canvas.fonts[0].unicodeRange,r.canvas.fonts[0].unicodeRange)
  assert.ok(new RegExp(MV_PACK_JSON_SCHEMA.properties.canvas.properties.fonts.items.properties.unicodeRange.pattern).test(r.canvas.fonts[0].unicodeRange))
  assert.deepEqual(sceneWebglContextProblems({antialias:false,depth:true,powerPreference:'default'}),[])
  for(const context of [{alpha:true},{depth:1},{powerPreference:'unsafe'},null,[]])assert.ok(sceneWebglContextProblems(context).length)
  assert.throws(()=>sceneWorkerSource('function paint(){}',{output:'webgl',context:{alpha:true}}))
  assert.match(sceneWorkerSource('function paint(){}',{output:'webgl',context:{antialias:false}}),/"antialias":false/)
})

test('font headers and metadata fail before allocation; no static lyric class false positives',()=>{
  assert.deepEqual(checkSceneFont(font(),'fonts/test.woff2').errors,[])
  for(const mutate of [b=>b.writeUInt32BE(99,8),b=>b.writeUInt16BE(129,12),b=>b.writeUInt16BE(1,14),b=>b.writeUInt32BE(9000000,16),b=>b.writeUInt32BE(10,20),b=>b.writeUInt32BE(100,28)]){const b=font();mutate(b);assert.ok(checkSceneFont(b,'fonts/test.woff2').errors.length)}
  assert.ok(checkSceneFont(font(),'font.ttf').errors.length)
  assert.ok(checkSceneFont(Buffer.alloc(MV_FONT_LIMITS.fileBytes+1),'font.woff2').errors.length)
  assert.equal(looksLikeLyricsJs('var Lyrics = class {}; const lyrics = new Lyrics()'),false)
  assert.equal(looksLikeLyricsJs('const LYRICS = /* static */ [{t:1,en:"Synthetic caption"}]'),true)
})

test('Host cannot replace an unavailable real image with fabricated geometry or a false missing-resource error',()=>{
  const source='function setup(info){if(!info.assets.figure)throw Error("missing");if(info.assets.figure.width<1)throw Error("invalid");} function paint(gl){gl.clear(gl.COLOR_BUFFER_BIT)}'
  const result=checkScene(source,{output:'webgl',unavailableBitmapAssets:['figure']})
  assert.equal(result.ok,false);assert.equal(result.requiresBrowserValidation,true);assert.equal(result.gpuValidated,false)
  const bad=checkScene('function setup(){throw Error("real bug")} function paint(){}',{output:'webgl',unavailableBitmapAssets:['figure']})
  assert.equal(bad.requiresBrowserValidation,undefined);assert.match(bad.problems.join(),/real bug/)
  assert.equal(checkScene('function paint(){}',{output:'webgl',unavailableBitmapAssets:['https://bad']}).ok,false)
})

test('font Host read is manifest-indexed and byte exact, client chunks reject inconsistent metadata',async()=>{
  const {raw,files}=fixture(),dir=await mkdtemp(join(tmpdir(),'bitmap-font-read-'))
  for(const [p,b] of Object.entries(files)){await mkdir(dirname(join(dir,p)),{recursive:true});await writeFile(join(dir,p),b)}
  const manifestPath=join(dir,'mv.json'),loaded=await loadPack(dir);assert.deepEqual(loaded.warnings,[])
  const reader=packFontReader({packRead:async r=>({ok:true,value:await readPackFile(parsePackRead(r))})},manifestPath)
  assert.deepEqual(Buffer.from(await reader(0)),files[face.file])
  const data=await loadSceneFonts(reader,loaded.pack);assert.equal(data.fonts.length,1);assert.equal(data.transfer[0],data.fonts[0].bytes);assert.equal(data.fonts[0].family,face.family)
  await assert.rejects(()=>reader(64));await assert.rejects(()=>reader(-1));await assert.rejects(()=>reader(1))
  assert.throws(()=>parsePackRead({manifestPath,role:'font',font:0,asset:'evil',offset:0,length:100}))
  assert.throws(()=>parsePackRead({manifestPath,role:'font',font:0,part:1,offset:0,length:100}))
  const good={size:52,bytes:52,offset:0,base64:font().toString('base64'),done:true}
  for(const change of [{size:MV_FONT_LIMITS.fileBytes+1},{offset:1},{bytes:0},{done:false},{base64:'AA=='}]){const bad=packFontReader({packRead:async()=>({ok:true,value:{...good,...change}})},manifestPath);await assert.rejects(()=>bad(0))}
  await assert.rejects(()=>loadSceneFonts(async()=>Buffer.alloc(52),raw))
})

test('bitmap workshop retains font rights, strict data caps and complete publish/install resources',async()=>{
  const {raw,files}=fixture(),checked=await validate(files);assert.deepEqual(checked.errors,[]);assert.equal(checked.meta.bitmap,true);assert.equal(checked.meta.requires,'0.10.0')
  for(const missing of ['fonts/NOTICE.md',face.licenseFile,face.file]){const bad={...files};delete bad[missing];assert.ok((await validate(bad)).errors.length,missing)}
  for(const field of ['fontsLicense','fontsCredit','fontsNotice']){const r=structuredClone(raw);delete r['x-dsh-mv-workshop'][field];const bad={...files,'mv.json':Buffer.from(JSON.stringify(r))};assert.ok((await validate(bad)).errors.length,field)}
  const list=listing(files);for(let i=0;i<90;i++){files['data/pad-'+i+'.json']=Buffer.from('{}');list.push({path:'data/pad-'+i+'.json',size:2})}
  assert.deepEqual((await validate(files,list)).errors,[])
  assert.ok((await validate(files,listing(files).map(e=>e.path.endsWith('.json')&&e.path!=='mv.json'?{...e,size:512*1024+1}:e))).errors.some(e=>/太大/.test(e)))
  const source=await mkdtemp(join(tmpdir(),'bitmap-publish-')),out=await mkdtemp(join(tmpdir(),'bitmap-publish-out-')),install=await mkdtemp(join(tmpdir(),'bitmap-install-'))
  files['song.mp3']=Buffer.from('Synthetic private audio');files['private.txt']=Buffer.from('Private unrelated data');raw.audio='song.mp3';files['mv.json']=Buffer.from(JSON.stringify(raw))
  for(const [p,b] of Object.entries(files)){await mkdir(dirname(join(source,p)),{recursive:true});await writeFile(join(source,p),b)}
  const {id,version,license,author}=raw['x-dsh-mv-workshop']
  const result=await preparePublish(parseWorkshopPublish({manifestPath:join(source,'mv.json'),id,version,license,author}),{publishRoot:out})
  assert.equal(result.ok,true,result.errors.join('\n'));assert.ok(!result.files.some(f=>['song.mp3','private.txt'].includes(f.path)))
  for(const p of [face.file,face.licenseFile,'fonts/NOTICE.md'])assert.deepEqual(await readFile(join(result.dir,p)),files[p])
  const published=JSON.parse(await readFile(join(result.dir,'mv.json'),'utf8'));assert.deepEqual(published.canvas,raw.canvas)
  const content=Object.fromEntries(await Promise.all(result.files.map(async f=>[f.path,await readFile(join(result.dir,f.path))])))
  const meta=(await validate(content)).meta,commit='a'.repeat(40),index={format:WORKSHOP_INDEX_FORMAT,version:1,commit,packs:[{...meta,files:result.files}]}
  assert.equal(parseWorkshopIndex(index).packs[0].requires,'0.10.0')
  const manager=createWorkshopManager({root:install,get:async url=>url.endsWith('/index.json')?Buffer.from(JSON.stringify(index)):content[url.split('/packs/synthetic-bitmap/')[1]]})
  const installed=await manager.install({id:'synthetic-bitmap'});assert.equal(installed.files,result.files.length)
  assert.deepEqual(await readFile(join(dirname(installed.manifestPath),face.file)),files[face.file])
})

test('default official mirror falls back without proxy; explicit empty string still disables it',async()=>{
  const index={format:WORKSHOP_INDEX_FORMAT,version:1,commit:'a'.repeat(40),packs:[]},calls=[]
  const get=async(url,opts)=>{calls.push({url,proxy:opts.proxy});if(url.startsWith(WORKSHOP_DEFAULT_MIRROR)){assert.equal(opts.proxy,null);return Buffer.from(JSON.stringify(index))}throw Object.assign(new Error('Synthetic offline GitHub'),{code:'ECONNRESET'})}
  const root=await mkdtemp(join(tmpdir(),'mirror-default-')),manager=createWorkshopManager({root,get,proxy:()=> 'http://127.0.0.1:9',retrySleep:async()=>{}})
  const result=await manager.index({refresh:true});assert.equal(result.downloadSource,'mirror');assert.ok(calls.some(c=>c.url===WORKSHOP_DEFAULT_MIRROR+'/main/index.json'))
  calls.length=0
  await assert.rejects(()=>createWorkshopManager({root,get,mirror:()=>'',retrySleep:async()=>{}}).index({refresh:true}))
  assert.ok(calls.every(c=>!c.url.startsWith(WORKSHOP_DEFAULT_MIRROR)))
})
