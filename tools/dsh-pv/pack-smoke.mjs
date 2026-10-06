#!/usr/bin/env node
// Production install/read/React player QA; never load or download song audio.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, readdir, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:http'
import { build } from 'esbuild'
import { createWorkshopManager } from '../../.dsh-plugin/shared/mv-workshop-host.mjs'
import { loadPack, readPackFile } from '../../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../../.dsh-plugin/shared/mv-pack.mjs'
import { parseLyrics } from '../../.dsh-plugin/shared/mv-lyrics.mjs'
import { validateWorkshopPack, WORKSHOP_INDEX_FORMAT } from '../../.dsh-plugin/shared/mv-workshop.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.DSH_MV_PLAYWRIGHT || 'playwright')
const [outArg, packArg] = process.argv.slice(2)
assert.ok(outArg && packArg, 'usage: pack-smoke.mjs <output-dir> <complete-pack-dir>')
const out = resolve(outArg), source = resolve(packArg), commit = 'a'.repeat(40)
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
const files = await collect(source), raw = JSON.parse(await readFile(join(source, 'mv.json'), 'utf8')), id = raw['x-dsh-mv-workshop'].id
const checked = await validateWorkshopPack({ id, files, readText: p => readFile(join(source, p), 'utf8'), readBytes: p => readFile(join(source, p)) })
assert.deepEqual(checked.errors, [])
assert.ok(files.every(f => !/\.(mp3|wav|m4a|mp4|flac|ogg)$/i.test(f.path)))
const entry = { ...checked.meta, files: files.map(({ bytes, ...f }) => f) }
const index = { format: WORKSHOP_INDEX_FORMAT, version: 1, commit, packs: [entry] }
const content = new Map(files.map(f => [f.path, f.bytes]))
const manager = createWorkshopManager({ root: await mkdtemp(join(tmpdir(), 'dsh-pv-qa-')), get: async url => {
  if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
  const key = url.split(`/${commit}/packs/${id}/`)[1]
  assert.ok(content.has(key), 'only indexed resources fetched')
  return content.get(key)
} })
const installed = await manager.install({ id }), loaded = await loadPack(installed.manifestPath)
for (const file of entry.files) assert.equal(sha(await readFile(join(loaded.packDir, file.path))), file.sha256)
const pack = { ...loaded, id, loadedAt: 1 }
const cueCount = parseLyrics(pack.pack.lyrics.file, await readFile(join(pack.packDir, pack.pack.lyrics.file), 'utf8')).length
const version = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8')).version
const code = `import React from 'react';import {createRoot} from 'react-dom/client';import {CanvasMv} from './.dsh-plugin/client/canvas-mv.jsx';
let root=null;window.playerRef=React.createRef();
window.mountPack=async(pack)=>{if(root){root.unmount();root=null;}root=createRoot(document.getElementById('root'));root.render(React.createElement(CanvasMv,{pack,api:{packRead:request=>window.hostRead(request)},ref:window.playerRef}));};
window.unmountPack=()=>{if(root){root.unmount();root=null;}};`
const bundle = await build({ stdin: { contents: code, resolveDir: resolve(import.meta.dirname, '../..'), sourcefile: 'pv-qa.jsx' }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020', define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(version), 'process.env.NODE_ENV': '"production"' } })
const css = await readFile(new URL('../../.dsh-plugin/client/mv.css', import.meta.url), 'utf8')
const server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#10141c;color:white}#root{width:1280px}</style><div id="root"></div>') })
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: process.env.DSH_MV_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = { browser: await browser.version(), plugin: version, id, version: entry.version, files: files.length, bytes: files.reduce((s, f) => s + f.size, 0), cueCount, musicFiles: 0, frames: [], errors: [], externalRequests: [] }
try {
  const page = await browser.newPage({ viewport: { width: 1340, height: 1100 } })
  let blockNextFontRead = false, delayedFontRead = false
  page.on('pageerror', e => report.errors.push(e.message))
  page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().startsWith(origin)) report.externalRequests.push(r.url()) })
  await page.exposeFunction('hostRead', async request => {
    assert.equal(request.manifestPath, pack.manifestPath)
    if (blockNextFontRead && request.role === 'asset' && request.asset === 'font-head') {
      blockNextFontRead = false; delayedFontRead = true
      await new Promise(r => setTimeout(r, 1250))
    }
    return { ok: true, value: await readPackFile(parsePackRead(request)) }
  })
  await page.exposeFunction('hostStats', () => ({ delayedFontRead }))
  await page.goto(origin)
  await page.evaluate(() => {
    const native = window.createImageBitmap.bind(window)
    window.bitmapCounts = { created: 0, closed: 0 }
    window.createImageBitmap = async (...args) => {
      const bitmap = await native(...args), close = bitmap.close.bind(bitmap)
      window.bitmapCounts.created++
      let closed = false
      bitmap.close = () => { if (!closed) { closed = true; window.bitmapCounts.closed++; close() } }
      return bitmap
    }
  })
  await page.addStyleTag({ content: css }); await page.addScriptTag({ content: bundle.outputFiles[0].text })
  await page.evaluate(p => window.mountPack(p), pack)
  await page.waitForFunction(n => [...document.querySelectorAll('.mv-source-value')].some(el => el.textContent.includes('（' + n + ' 句')), cueCount, { timeout: 30000 })
  const families = () => page.evaluate(() => [...document.fonts].filter(f => f.family.startsWith('DshMvPv')).map(f => ({ family: f.family, status: f.status })))
  await page.waitForFunction(() => [...document.fonts].filter(f => f.family.startsWith('DshMvPv') && f.status === 'loaded').length === 2, null, { timeout: 30000 })
  report.fonts = await families()
  const stage = page.locator('canvas.mv-pixel')
  async function frame(t, file) {
    await page.evaluate(t => window.playerRef.current.seek(t), t)
    await page.waitForTimeout(350)
    assert.equal(await page.locator('.mv-alert-error').count(), 0)
    const bytes = await stage.screenshot({ path: file ? join(out, file) : undefined })
    const lit = await stage.evaluate(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for(let i=0;i<d.length;i+=64) if(d[i]+d[i+1]+d[i+2]>100)n++; return n })
    if (t >= 207.1) assert.ok(lit < 500, 'final hard cut clears the stage')
    else assert.ok(lit > 200, `nonblank scene at ${t}`)
    const result = { t, sha256: sha(bytes), litSamples: lit }; report.frames.push(result); return result
  }
  await mkdir(out, { recursive: true })
  for (const t of [20, 60, 92, 119.8, 151, 164, 176.75, 177, 185, 193.75, 198, 205.625, 207.1]) await frame(t, `frame-${String(t).replace('.', '-')}.png`)
  const a = await frame(20.25), b = await frame(20.5), aAgain = await frame(20.25)
  assert.notEqual(a.sha256, b.sha256, 'dance/scene frame changes')
  assert.equal(a.sha256, aAgain.sha256, 'backward seek is deterministic')
  const danceA = await frame(164.25), danceB = await frame(164.5)
  assert.notEqual(danceA.sha256, danceB.sha256, 'new dance/glyph grid moves')
  report.danceMoves = true
  report.seekDeterministic = true
  await page.evaluate(() => window.unmountPack())
  await page.waitForFunction(() => window.bitmapCounts.created === window.bitmapCounts.closed)
  assert.deepEqual(await families(), [])
  report.afterUnmount = await page.evaluate(() => window.bitmapCounts)
  // Legacy 1.0-style manifests must still play without the optional assets.
  const legacy = structuredClone(pack)
  for (const name of ['raster-timeline', 'raster-atlas', 'font-head', 'font-banner']) delete legacy.pack.canvas.assets[name]
  legacy.loadedAt = 2
  await page.evaluate(p => window.mountPack(p), legacy)
  await page.waitForFunction(() => window.playerRef.current !== null)
  await page.waitForTimeout(1500)
  await frame(20, 'legacy-compatible.png')
  assert.deepEqual(await families(), [])
  await page.evaluate(() => window.unmountPack())
  await page.waitForFunction(() => window.bitmapCounts.created === window.bitmapCounts.closed)
  // Rapid cancellation then re-open checks that stale loads release resources.
  blockNextFontRead = true
  await page.evaluate(p => window.mountPack({ ...p, loadedAt: 3 }), pack)
  await page.waitForFunction(async () => (await window.hostStats()).delayedFontRead, null, { timeout: 30000 })
  await page.evaluate(async p => { window.unmountPack(); await window.mountPack({ ...p, loadedAt: 4 }) }, pack)
  await page.waitForFunction(() => [...document.fonts].filter(f => f.family.startsWith('DshMvPv') && f.status === 'loaded').length === 2, null, { timeout: 30000 })
  await frame(119.8)
  await page.evaluate(() => window.unmountPack())
  await page.waitForFunction(() => window.bitmapCounts.created === window.bitmapCounts.closed)
  assert.deepEqual(await families(), [])
  report.legacyCompatible = true; report.rapidReload = true
  report.cancelledDuringFontRead = delayedFontRead
  report.finalResources = await page.evaluate(() => window.bitmapCounts)
  assert.deepEqual(report.errors, []); assert.deepEqual(report.externalRequests, [])
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report))
} finally { await browser.close(); await new Promise(r => server.close(r)) }
