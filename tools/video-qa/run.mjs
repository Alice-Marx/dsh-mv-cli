/** Real Chromium + production React player. Usage: node tools/video-qa/run.mjs VIDEO OUTPUT */
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { build } from 'esbuild'
import { loadPack, readPackFile } from '../../.dsh-plugin/shared/mv-pack-host.mjs'
import { parsePackRead } from '../../.dsh-plugin/shared/mv-pack.mjs'
import { encodeWav } from '../../.dsh-plugin/client/mv-wav.mjs'
const [videoPath, outputPath] = process.argv.slice(2), out = resolve(outputPath || 'tmp/video-qa')
if (!videoPath) throw new Error('Pass the actual upstream rendered VIDEO and an OUTPUT directory.')
await mkdir(out, { recursive: true })
const packageDir = process.env.QA_PLAYWRIGHT || 'C:/Users/Jianw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
const { chromium } = await import(pathToFileURL(join(packageDir, 'index.mjs')).href)
const samples = new Float32Array(8000 * 212)
for (let i = 0; i < samples.length; i++) samples[i] = 0.02 * Math.sin(i * 2 * Math.PI * 220 / 8000)
const audioPath = join(out, 'synthetic.wav'); await writeFile(audioPath, encodeWav([samples], 8000))
const embeddedPath = join(out, 'embedded.mp4')
execFileSync(process.env.QA_FFMPEG || 'D:/Program Files/FFmpeg/bin/ffmpeg.exe', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=15', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', embeddedPath])
const invalidPath = join(out, 'invalid.mp4'); await writeFile(invalidPath, 'invalid video')
const manifest = file => ({ format: 'dsh-mv-pack', version: 1, title: 'Manim original', video: { file }, canvas: { renderer: 'video' } })
const packs = { original: manifest(resolve(videoPath)), soundtrack: { ...manifest(resolve(videoPath)), audio: { file: audioPath, offset: 5.16 } }, embedded: manifest(embeddedPath), bad: manifest(invalidPath), missing: manifest(join(out, 'missing.mp4')), generic: { format: 'dsh-mv-pack', version: 1, title: 'Generic regression', duration: 8, canvas: { renderer: 'generic' } } }
for (const [name, pack] of Object.entries(packs)) await writeFile(join(out, `${name}.json`), JSON.stringify(pack))
await build({ entryPoints: [new URL('./preview.jsx', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, format: 'iife', platform: 'browser', loader: { '.css': 'text' }, outfile: join(out, 'preview.js') })
const server = createServer(async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    if (req.url.startsWith('/api/load/')) return res.end(JSON.stringify(await loadPack(join(out, `${req.url.slice(10)}.json`))))
    if (req.url === '/api/read') {
      let text = ''; for await (const part of req) text += part
      const value = await readPackFile(parsePackRead(JSON.parse(text)))
      return res.end(JSON.stringify({ ok: true, value }))
    }
    if (req.url === '/preview.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(await readFile(join(out, 'preview.js'))) }
    res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#111;color:#ddd}#root{padding:12px}</style><div id="root"></div><script src="/preview.js"></script>')
  } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ ok: false, error: { message: error.message } })) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const browser = await chromium.launch({ executablePath: process.env.QA_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errors = [], checks = [], frames = []
const page = await browser.newPage({ viewport: { width: 1280, height: 980 } })
page.on('pageerror', error => errors.push(error.message))
const waitReady = () => page.waitForFunction(() => document.querySelector('video')?.readyState >= 2 && document.body.textContent.includes('×') && !document.body.textContent.includes('正在从 MV 包读取'))
const select = async name => { await page.evaluate(name => window.qa.select(name), name); if (!['bad', 'missing', 'generic'].includes(name)) await waitReady() }
const seek = async time => {
  await page.evaluate(t => window.qa.player().seek(t), time)
  await page.waitForFunction(t => { const v = document.querySelector('video'); return !v.seeking && Math.abs(v.currentTime - t) < 0.1 }, time)
  await page.waitForTimeout(120)
}
try {
  await page.goto(`http://127.0.0.1:${server.address().port}`); await waitReady()
  const actualDuration = await page.evaluate(() => document.querySelector('video').duration)
  assert.ok(actualDuration > 210 && actualDuration < 230); checks.push({ name: 'original duration', duration: actualDuration })
  for (const time of [0, 5.19, 45, 100, 150, actualDuration - 1]) {
    await seek(time)
    const pixels = await page.evaluate(() => { const c = document.querySelector('.mv-pixel'), data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] > 30) lit++; return { lit, count: data.length / 4 } })
    assert.ok(pixels.lit > 100, `black frame at ${time}`); frames.push({ time, ...pixels })
    if ([0, 45, 100, actualDuration - 1].includes(time)) await page.locator('.mv-stage').screenshot({ path: join(out, `frame-${Math.round(time)}.png`) })
  }
  const snapshot = await page.evaluate(() => window.qa.player().snapshotPng())
  assert.deepEqual([...Buffer.from(snapshot, 'base64').subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  checks.push({ name: 'PNG snapshot uses the actual video canvas', passed: true })
  await seek(30); await page.getByRole('button', { name: '播放', exact: true }).click()
  await page.waitForTimeout(700); const played = await page.evaluate(() => window.qa.player().time()); assert.ok(played > 30.3)
  await page.getByRole('button', { name: '暂停', exact: true }).click(); const paused = await page.evaluate(() => window.qa.player().time())
  await page.waitForTimeout(350); assert.ok(Math.abs((await page.evaluate(() => window.qa.player().time())) - paused) < 0.05); checks.push({ name: 'play and pause', passed: true })
  await select('soundtrack'); await seek(0); await page.getByRole('button', { name: '播放', exact: true }).click(); await page.waitForTimeout(300)
  assert.equal(await page.evaluate(() => document.querySelector('audio').paused), true)
  await seek(20); await page.waitForTimeout(700)
  const sync = await page.evaluate(() => { const v = document.querySelector('video'), a = document.querySelector('audio'); return { drift: a.currentTime + 5.16 - v.currentTime, videoMuted: v.muted, audioPaused: a.paused } })
  assert.ok(Math.abs(sync.drift) < 0.25); assert.equal(sync.videoMuted, true); assert.equal(sync.audioPaused, false); checks.push({ name: 'external soundtrack and positive offset', ...sync })
  await page.getByRole('button', { name: '暂停', exact: true }).click(); await page.waitForTimeout(150); assert.equal(await page.evaluate(() => document.querySelector('audio').paused), true)
  // Delay the primary media promise to exercise production cancellation, without autoplay flags.
  const deferVideoPlay = () => page.evaluate(() => {
    const v = document.querySelector('video'), native = v.play.bind(v)
    v.play = () => new Promise(resolve => { window.qaRelease = async () => { if (v.hasAttribute('src')) await native(); resolve() } })
    window.qaRestore = () => { v.play = native }
  })
  await deferVideoPlay(); await page.getByRole('button', { name: '播放', exact: true }).click(); await page.waitForTimeout(150)
  assert.equal(await page.evaluate(() => document.querySelector('audio').paused), true)
  await page.evaluate(() => window.qa.player().pause()); await page.evaluate(() => window.qaRelease()); await page.waitForTimeout(150)
  assert.equal(await page.evaluate(() => document.querySelector('video').paused && document.querySelector('audio').paused), true)
  await page.evaluate(() => window.qaRestore()); checks.push({ name: 'pause cancels deferred movie and soundtrack start', passed: true })
  await page.getByRole('button', { name: '移除', exact: true }).click(); assert.equal(await page.evaluate(() => document.querySelector('video').muted), false)
  await select('embedded'); await page.getByRole('button', { name: '播放', exact: true }).click(); await page.waitForTimeout(400)
  assert.equal(await page.evaluate(() => document.querySelector('video').paused), false)
  await page.getByRole('button', { name: '静音', exact: true }).click(); assert.equal(await page.evaluate(() => document.querySelector('video').muted), true)
  await seek(3.95); await page.waitForTimeout(350); await page.getByRole('button', { name: '播放', exact: true }).click(); await page.waitForTimeout(300)
  assert.ok((await page.evaluate(() => window.qa.player().time())) < 1); checks.push({ name: 'embedded sound, mute and replay', passed: true })
  await page.locator('.mv-stage-wrap').dblclick(); await page.waitForTimeout(200)
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), true)
  await page.evaluate(() => window.qa.player().fullscreen()); await page.waitForFunction(() => !document.fullscreenElement)
  checks.push({ name: 'fullscreen', passed: true })
  await select('soundtrack'); await seek(20); await deferVideoPlay(); await page.getByRole('button', { name: '播放', exact: true }).click(); await page.waitForTimeout(100)
  await select('generic'); await page.evaluate(async () => { try { await window.qaRelease() } catch {} }); await page.waitForTimeout(150)
  assert.equal(await page.evaluate(() => document.querySelector('audio').paused && document.querySelector('video').paused), true)
  await page.evaluate(() => window.qaRestore()); checks.push({ name: 'pack switch cancels deferred media start', passed: true })
  await select('generic'); await page.waitForTimeout(350); assert.equal(await page.evaluate(() => document.querySelector('video').hasAttribute('src')), false)
  assert.equal(await page.evaluate(() => document.querySelector('audio').hasAttribute('src')), false); checks.push({ name: 'switch to generic releases video and audio', passed: true })
  await select('bad'); await page.waitForFunction(() => document.body.textContent.includes('容器不受支持')); checks.push({ name: 'invalid video visible error', passed: true })
  await select('missing'); await page.waitForFunction(() => document.body.textContent.includes('找不到可用的视频')); checks.push({ name: 'missing video visible error', passed: true })
  assert.deepEqual(errors, [])
  await writeFile(join(out, 'report.json'), JSON.stringify({ browser: await browser.version(), videoPath: resolve(videoPath), checks, frames, pageErrors: errors }, null, 2))
  console.log(JSON.stringify({ passed: checks.length, frames: frames.length, report: join(out, 'report.json') }))
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
