// Screenshot script for tools/ui-preview (not shipped). Needs puppeteer-core and Chrome:
//   node tools/ui-preview/build-preview.mjs && node tools/ui-preview/shoot.mjs <outDir> [filter]
// The dsh-pv scenes read the preset's files from .dsh-plugin/assets over HTTP. LOCAL_LRC may point at
// a lyrics file of your own copy of the song for the screenshots; it is served, never copied or shipped.
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const ASSETS = process.env.DSH_MV_ASSETS ?? new URL('../../.dsh-plugin/assets/', import.meta.url).pathname // set it when running a copy of this script
const DIR = '/tmp/mv-ui-preview', OUT = process.argv[2] || '/workspace/dsh-mv-cli-ui-shots'
fs.mkdirSync(OUT, { recursive: true })
const TYPES = { '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.lrc': 'text/plain; charset=utf-8', '.html': 'text/html; charset=utf-8' }
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const f = url === '/local/lyrics.lrc' ? process.env.LOCAL_LRC ?? ''
    : url.startsWith('/assets/') && !url.includes('..') ? path.join(ASSETS, url.slice(8))
      : path.join(DIR, url === '/' ? 'index.html' : url)
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end() } res.setHeader('content-type', TYPES[path.extname(f)] ?? 'text/html; charset=utf-8'); res.end(d) })
}).listen(8799)
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', '--lang=zh-CN'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const only = process.argv[3]
const shots = [
  ['01-first-run-light', 'first', 'light'], ['02-first-run-dark', 'first', 'dark'],
  ['03-canvas-playing-light', 'canvas', 'light', 'play'], ['04-canvas-playing-dark', 'canvas', 'dark', 'play'],
  ['05-dshpv-ready-light', 'dshpv', 'light', 'dshready'],
  ['06-dshpv-playing-satisfaction-dark', 'dshpv', 'dark', 'dsh:66.5'],
  ['07-dshpv-playing-chat-light', 'dshpv', 'light', 'dsh:96'],
  ['08-dshpv-playing-execution-dark', 'dshpv', 'dark', 'dsh:151'],
  ['09-dshpv-playing-whale-fall-dark', 'dshpv', 'dark', 'dsh:197'],
  ['10-dshpv-library-card-light', 'dshpv', 'light', 'library'],
  ['11-about-popover-dark', 'canvas', 'dark', 'about'],
  ['12-stale-host-light', 'canvas', 'light', '', '&stale=1'],
  ['13-import-dialog-light', 'canvas', 'light', 'import'],
  ['14-ai-dialog-light', 'ai', 'light', 'aiform'],
  ['15-ai-dialog-dark', 'ai', 'dark', 'aiform'],
  ['16-ai-created-light', 'ai', 'light', 'aicreate'],
  ['17-ai-session-started-dark', 'ai', 'dark', 'aisend'],
  ['18-ai-copy-fallback-light', 'ai', 'light', 'aicreate', '&session=0'],
  ['19-script-pack-playing-dark', 'script', 'dark', 'scriptplay'],
  ['20-script-pack-playing-light', 'script', 'light', 'scriptplay'],
  ['21-auto-make-form-light', 'auto', 'light', 'autoform'],
  ['22-auto-make-running-dark', 'auto', 'dark', 'autorun'],
  ['23-auto-make-done-light', 'auto', 'light', 'autodone'],
  ['24-engine-install-confirm-light', 'auto', 'light', 'engineconfirm', '&engine=missing'],
  ['25-engine-install-confirm-dark', 'auto', 'dark', 'engineconfirm', '&engine=missing'],
  ['26-calibration-editor-dark', 'calib', 'dark', 'calib'],
  ['27-calibration-editor-light', 'calib', 'light', 'calib'],
  ['28-calibration-editing-light', 'calib', 'light', 'calibedit'],
]
// A synthetic, silent-ish WAV for the AI dialog's file chooser (no real media).
const AUDIO = path.join(OUT, '..', 'starlight-run-preview.wav')
{
  const rate = 8000, n = rate * 20, buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(6000 * Math.sin(i * 2 * Math.PI * 330 / rate) * (0.5 + 0.5 * Math.sin(i / rate * 3))), 44 + i * 2)
  fs.writeFileSync(AUDIO, buf)
}
const typeInto = async (page, selector, text) => { await page.focus(selector); await page.keyboard.type(text) }
const clickText = async (page, selector, text) => page.evaluate((selector, text) => {
  const el = [...document.querySelectorAll(selector)].find(e => e.textContent.includes(text)); if (el) el.click(); return Boolean(el)
}, selector, text)
for (const [name, scene, theme, action, extra = ''] of shots) {
  if (only && !name.includes(only)) continue
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }])
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(`http://localhost:8799/?scene=${scene}&theme=${theme}${extra}`)
  await sleep(1500)
  if (action === 'play') {
    await page.click('.mv-play-big'); await sleep(400)
    await page.evaluate(() => { const r = document.querySelector('.mv-seek'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(r, '70'); r.dispatchEvent(new Event('input', { bubbles: true })) })
    await sleep(2500)
  }
  if (action === 'dshready') await sleep(2500)
  if (String(action ?? '').startsWith('dsh:')) {
    await sleep(2500); await page.click('.mv-play-big'); await sleep(400)
    await page.evaluate(t => { const r = document.querySelector('.mv-seek'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(r, t); r.dispatchEvent(new Event('input', { bubbles: true })) }, action.slice(4))
    await sleep(3000)
    const stage = await page.$('.mv-stage')
    if (stage) await stage.screenshot({ path: `${OUT}/${name}-stage.png` })
  }
  if (action === 'library') { await page.evaluate(() => document.querySelector('.mv-card-art-dshpv')?.scrollIntoView({ block: 'center' })); await sleep(400) }
  if (action === 'import') { await clickText(page, '.mv-card-ghost', '导入 MV 包'); await sleep(400) }
  if (String(action ?? '').startsWith('ai')) {
    const [chooser] = await Promise.all([page.waitForFileChooser(), clickText(page, '.mv-ai button', '选择音频')])
    await chooser.accept([AUDIO]); await sleep(500)
    await page.evaluate(() => { const t = document.querySelector('.mv-ai input[placeholder="歌名"]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(t, 'Starlight Run'); t.dispatchEvent(new Event('input', { bubbles: true })) })
    await typeInto(page, '.mv-ai input[placeholder="可选（自动从标签读取）"]', 'Alice')
    await typeInto(page, '.mv-ai textarea', '[00:20.00]Running through the neon rain\n[00:20.00]在霓虹雨里奔跑\n[00:26.00]Every light a name\n[00:26.00]每一盏灯都是一个名字')
    const areas = await page.$$('.mv-ai textarea'); await areas[1].type('赛博朋克雨夜，副歌时满屏代码雨，结尾慢慢熄灭')
    await sleep(300)
    if (action !== 'aiform') { await clickText(page, '.mv-ai button', '只建包'); await sleep(3500) }
    if (action === 'aisend') { await clickText(page, '.mv-ai button', '在新会话中交给 AI'); await sleep(800) }
  }
  if (['autoform', 'autorun', 'autodone', 'engineconfirm'].includes(action)) {
    const [chooser] = await Promise.all([page.waitForFileChooser(), clickText(page, '.mv-ai button', '选择音频')])
    await chooser.accept([AUDIO]); await sleep(500)
    await page.evaluate(() => { const t = document.querySelector('.mv-ai input[placeholder="歌名"]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(t, 'Starlight Run'); t.dispatchEvent(new Event('input', { bubbles: true })) })
    await typeInto(page, '.mv-ai input[placeholder="可选（自动从标签读取）"]', 'Alice')
    await typeInto(page, '.mv-ai textarea', 'Running through the neon rain / 在霓虹雨里奔跑\nEvery light a name / 每一盏灯都是一个名字\nStarlight, starlight, run with me\nInto the night we go\nCounting every heartbeat\nStarlight, starlight, run with me')
    await sleep(300)
    if (action === 'engineconfirm') { await clickText(page, '.mv-engine-card button', '一键安装'); await sleep(400) }
    if (action === 'autorun' || action === 'autodone') { await clickText(page, '.mv-ai button', '自动制作'); await sleep(action === 'autorun' ? 3200 : 9000) }
  }
  if (action === 'calib' || action === 'calibedit') {
    await sleep(1500); await page.click('.mv-play-big'); await sleep(400)
    await page.evaluate(() => { const r = document.querySelector('.mv-seek'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(r, '30.5'); r.dispatchEvent(new Event('input', { bubbles: true })) })
    await sleep(1200)
    await page.evaluate(() => { const li = document.querySelectorAll('.mv-calib-lines li')[2]; li?.click() })
    await sleep(1000)
    if (action === 'calibedit') { await page.evaluate(() => { const li = document.querySelectorAll('.mv-calib-lines li')[4]; li?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) }); await sleep(400) }
    await page.evaluate(() => document.querySelector('.mv-calib')?.scrollIntoView({ block: 'center' }))
  }
  if (action === 'scriptplay') {
    await sleep(1500); await page.click('.mv-play-big'); await sleep(400)
    await page.evaluate(() => { const r = document.querySelector('.mv-seek'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(r, '22'); r.dispatchEvent(new Event('input', { bubbles: true })) })
    await sleep(2500)
  }
  if (action === 'about') { await page.click('.mv-head .mv-icon-button'); await sleep(400) }
  const full = true
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log(name, errors.length ? 'ERRORS ' + errors.join(' | ').slice(0, 400) : 'ok')
  await context.close()
}
await browser.close(); server.close()
