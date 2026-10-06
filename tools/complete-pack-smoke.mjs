#!/usr/bin/env node
// Full install -> production Host reads -> production React player -> reopen QA.
// Reports counts/hashes only; screenshot uses synthetic captions, not song text.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, readdir, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:http'
import { build } from 'esbuild'
import { createWorkshopManager } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { loadPack, readPackFile } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../.dsh-plugin/shared/mv-pack.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { validateWorkshopPack, WORKSHOP_INDEX_FORMAT } from '../.dsh-plugin/shared/mv-workshop.mjs'
const require = createRequire(import.meta.url)
const clientVersion = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version
const { chromium } = require(process.env.DSH_MV_PLAYWRIGHT || 'playwright')
const [outArg, ...packArgs] = process.argv.slice(2)
assert.ok(outArg && packArgs.length, 'usage: complete-pack-smoke.mjs <output-dir> <pack-dir> ...')
const out = resolve(outArg), commit = 'a'.repeat(40), catalogue = [], content = new Map(), calls = []
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
async function collect(root, sub = '') {
  const result = []
  for (const entry of await readdir(join(root, sub), { withFileTypes: true })) {
    const path = [sub, entry.name].filter(Boolean).join('/')
    if (entry.isDirectory()) result.push(...await collect(root, path))
    else { const bytes = await readFile(join(root, path)); result.push({ path, size: bytes.length, sha256: sha(bytes), bytes }) }
  }
  return result
}
for (const arg of packArgs) {
  const root = resolve(arg), files = await collect(root), raw = JSON.parse(await readFile(join(root, 'mv.json'), 'utf8')), id = raw['x-dsh-mv-workshop'].id
  const checked = await validateWorkshopPack({ id, files, readText: async path => (await readFile(join(root, path))).toString('utf8'), readBytes: path => readFile(join(root, path)) })
  assert.deepEqual(checked.errors, [], id)
  assert.ok(files.every(f => !/\.(mp3|wav|m4a|mp4|flac|ogg)$/i.test(f.path)), 'no music')
  catalogue.push({ ...checked.meta, files: files.map(({ bytes, ...file }) => file) })
  for (const file of files) content.set(`${id}/${file.path}`, file.bytes)
}
const index = { format: WORKSHOP_INDEX_FORMAT, version: 1, commit, packs: catalogue }
const manager = createWorkshopManager({ root: await mkdtemp(join(tmpdir(), 'dsh-complete-')), get: async url => {
  if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
  const key = url.split(`/${commit}/packs/`)[1]
  assert.ok(content.has(key), 'only indexed resources fetched'); return content.get(key)
} })
const installed = []
for (const entry of catalogue) {
  const done = await manager.install({ id: entry.id }), pack = await loadPack(done.manifestPath)
  for (const file of entry.files) assert.equal(sha(await readFile(join(pack.packDir, file.path))), file.sha256)
  const count = pack.pack.lyrics ? parseLyrics(pack.pack.lyrics.file, await readFile(join(pack.packDir, pack.pack.lyrics.file), 'utf8')).length : 0
  installed.push({ ...pack, id: entry.id, loadedAt: 1, expectedCues: count })
}
const clientSource = `import React from 'react';import {createRoot} from 'react-dom/client';import {CanvasMv} from './.dsh-plugin/client/canvas-mv.jsx';import {openMediaStore,putMedia} from './.dsh-plugin/client/mv/media-store.mjs';import {mediaSlot} from './.dsh-plugin/client/mv-workshop-state.mjs';
let root=null;window.playerRef=React.createRef();window.synthetic=false;
window.mountPack=async(pack,seed=false)=>{if(root){root.unmount();root=null;}if(seed){const db=await openMediaStore();await putMedia(db,mediaSlot(pack,'lyrics'),{name:'stale.json',text:JSON.stringify([{time:0,en:'STALE CACHE MUST NOT WIN'}])});}root=createRoot(document.getElementById('root'));root.render(React.createElement(CanvasMv,{pack,api:{packRead:request=>window.hostRead(request,window.synthetic)},ref:window.playerRef}));};`
const bundle = await build({ stdin: { contents: clientSource, resolveDir: resolve(import.meta.dirname, '..'), sourcefile: 'complete-pack-qa.jsx' }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(clientVersion), 'process.env.NODE_ENV': '"production"' } })
const css = await readFile(new URL('../.dsh-plugin/client/mv.css', import.meta.url), 'utf8')
const server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#10141c;color:white}#root{width:960px}</style><div id="root"></div>') })
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: process.env.DSH_MV_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = { browser: await browser.version(), packs: [], externalRequests: [], errors: [] }
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } })
  page.on('pageerror', e => report.errors.push(e.message))
  page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith(origin)) report.externalRequests.push(r.url()) })
  await page.exposeFunction('hostRead', async (request, synthetic) => {
    assert.ok(installed.some(p => p.manifestPath === request.manifestPath), 'Host read scope')
    calls.push({ id: installed.find(p => p.manifestPath === request.manifestPath).id, role: request.role })
    if (synthetic && request.role === 'lyrics') {
      const bytes = Buffer.from(JSON.stringify([{ time: 22, end: 28, en: 'AUTO-LOADED BILINGUAL DEMO', zh: '随包歌词自动加载 · 双语测试' }]))
      return { ok: true, value: { name: 'synthetic.json', base64: bytes.toString('base64'), bytes: bytes.length, done: true } }
    }
    return { ok: true, value: await readPackFile(parsePackRead(request)) }
  })
  async function setup() { await page.goto(origin); await page.addStyleTag({ content: css }); await page.addScriptTag({ content: bundle.outputFiles[0].text }) }
  await setup()
  for (const pack of installed) {
    await page.evaluate(p => window.mountPack(p, !!p.expectedCues), pack)
    if (pack.expectedCues) await page.waitForFunction(n => [...document.querySelectorAll('.mv-source-value')].some(el => el.textContent.includes('（' + n + ' 句')), pack.expectedCues, { timeout: 20000 })
    else await page.waitForTimeout(700)
    await page.waitForFunction(() => !!window.playerRef.current)
    await page.evaluate(() => window.playerRef.current.seek(23))
    await page.waitForTimeout(1500)
    assert.equal(await page.locator('.mv-alert-error').count(), 0)
    assert.ok(!(await page.locator('body').innerText()).includes('场景脚本无法运行'))
    const pixels = await page.locator('canvas.mv-pixel').evaluate(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n=0;for(let i=0;i<d.length;i+=64)if(d[i]+d[i+1]+d[i+2]>80)n++;return n })
    assert.ok(pixels > 200, `${pack.id}: actual bitmap must be nonblank`)
    const firstReads = calls.filter(c => c.id === pack.id && c.role === 'lyrics').length
    await setup(); await page.evaluate(p => window.mountPack(p), { ...pack, loadedAt: 2 })
    if (pack.expectedCues) {
      await page.waitForFunction(n => [...document.querySelectorAll('.mv-source-value')].some(el => el.textContent.includes('（' + n + ' 句')), pack.expectedCues, { timeout: 20000 })
      assert.ok(calls.filter(c => c.id === pack.id && c.role === 'lyrics').length > firstReads)
    }
    report.packs.push({ id: pack.id, version: pack.pack.workshop.version, files: catalogue.find(p => p.id === pack.id).files.length, cueCount: pack.expectedCues, nonblankPixelSamples: pixels, automaticLyrics: !!pack.expectedCues, reopened: true, staleCacheIgnored: pack.expectedCues ? true : null, musicFiles: 0 })
  }
  const three = installed.find(p => p.id === 'world-execute-me-three')
  if (three) {
    await page.evaluate(async p => { window.synthetic=true; await window.mountPack({ ...p, loadedAt: 3 }) }, three)
    await page.waitForFunction(() => [...document.querySelectorAll('.mv-source-value')].some(el => el.textContent.includes('synthetic.json')))
    await page.evaluate(() => window.playerRef.current.seek(23)); await page.waitForTimeout(2000)
    await mkdir(out, { recursive: true }); await page.locator('canvas.mv-pixel').screenshot({ path: join(out, 'complete-pack-overlay.png') })
  }
  assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.errors, [])
  await mkdir(out, { recursive: true }); await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report))
} finally { await browser.close(); await new Promise(r => server.close(r)) }
