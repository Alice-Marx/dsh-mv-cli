#!/usr/bin/env node
// Browser test with synthetic subtitles; optional upstream file is private input only.
// DSH_MV_PLAYWRIGHT=<installed playwright> node tools/lyrics-smoke.mjs <pack-dir> <out-dir> [local-lyrics.js]
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.DSH_MV_PLAYWRIGHT || 'playwright')
const [packArg, outArg, lyricArg] = process.argv.slice(2)
assert.ok(packArg && outArg, 'Expected pack folder and new output folder')
const out = resolve(outArg)
const source = await readFile(join(resolve(packArg), 'scenes.js'), 'utf8')
const privateLyrics = lyricArg ? await readFile(resolve(lyricArg), 'utf8') : null
const browserCode = `
import { ScriptFilm } from './.dsh-plugin/client/mv/script-film.mjs';
import { parseLyrics } from './.dsh-plugin/shared/mv-lyrics.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
window.lyricsQA=async({source,privateLyrics})=>{
  const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
  const parsed=privateLyrics?parseLyrics('renamed.json',privateLyrics,{duration:213}):null;
  const sourceText='export const LYRICS = [{t:22.27,en:"LYRICS.JS COMPATIBILITY DEMO",cn:"静态歌词数据 · 双语字幕测试"},{t:33,en:"NEXT DEMO"}]; throw new Error("must not execute");';
  const film=new ScriptFilm({duration:213});
  film.setLyrics(parseLyrics('lyrics.js',sourceText));
  try{
    await film.load(source,{output:'webgl',size:[1280,720]});
    film.request(23,1280,720,{paused:true});
    const began=performance.now();while(film.pending&&film.state==='ready'){await wait(10);if(performance.now()-began>5000)throw new Error('Frame timeout');}
    if(film.state!=='ready'||!film.bitmap)throw new Error(film.error||'No bitmap');
    film.request=()=>{};
    const real=g.fillText.bind(g),drawn=[];g.fillText=(...args)=>{drawn.push(args);return real(...args);};
    const draw=(t,opts)=>{drawn.length=0;film.draw(g,t,opts);return drawn.map(args=>args.slice());};
    const enabled=draw(23,{subtitles:true}),disabled=draw(23,{}),offset=draw(23,{subtitles:true,offset:3}),expired=draw(29,{subtitles:true});
    canvas.width=1000;canvas.height=800;const resized=draw(23,{subtitles:true});
    canvas.width=960;canvas.height=540;draw(23,{subtitles:true});
    return {actualCues:parsed?.length,actualFirst:parsed?.[0]?.time,actualLastEnd:parsed?.at(-1)?.end,enabled,disabled,offset,expired,resized,state:film.state};
  } finally {film.stop();}
};`
const bundle = await build({stdin:{contents:browserCode,resolveDir:fileURLToPath(new URL('..',import.meta.url)),sourcefile:'lyrics-smoke-entry.mjs'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2020'})
const browser = await chromium.launch({executablePath:process.env.DSH_MV_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']})
try {
  const page=await browser.newPage({viewport:{width:1000,height:800}}),errors=[],requests=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())})
  await page.setContent('<!doctype html><style>body{margin:0;background:#080b14}canvas{display:block}</style><canvas width="960" height="540"></canvas>')
  await page.addScriptTag({content:bundle.outputFiles[0].text,type:'module'})
  await page.waitForFunction(()=>typeof window.lyricsQA==='function')
  const report=await page.evaluate(data=>window.lyricsQA(data),{source,privateLyrics})
  assert.equal(report.enabled.length,2);assert.equal(report.disabled.length,0);assert.equal(report.offset.length,0);assert.equal(report.expired.length,0)
  assert.equal(report.resized.length,2);assert.ok(report.resized.every(args=>args[1]===500&&args[2]>119&&args[2]<682))
  if(privateLyrics){assert.equal(report.actualCues,75);assert.equal(report.actualFirst,0.27);assert.equal(report.actualLastEnd,212.46)}
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[])
  await mkdir(out,{recursive:true})
  await page.locator('canvas').screenshot({path:join(out,'lyrics-overlay.png')})
  await writeFile(join(out,'report.json'),JSON.stringify({browser:await browser.version(),...report,errors,requests},null,2))
  console.log('Browser lyrics: real Three WebGL frame, bilingual overlay/offset/expiry/resize and local module parsing OK; '+out)
}finally{await browser.close()}
