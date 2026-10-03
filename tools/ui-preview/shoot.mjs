// Screenshot script for tools/ui-preview (not shipped). Needs puppeteer-core and Chrome:
//   node tools/ui-preview/build-preview.mjs && node tools/ui-preview/shoot.mjs <outDir>
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const DIR = '/tmp/mv-ui-preview', OUT = process.argv[2] || '/workspace/dsh-mv-cli-ui-shots'
fs.mkdirSync(OUT, { recursive: true })
const server = http.createServer((req, res) => {
  const f = path.join(DIR, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0])
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end() } res.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8'); res.end(d) })
}).listen(8799)
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', '--lang=zh-CN'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const only = process.argv[3]
const shots = [
  ['01-first-run-light', 'first', 'light'], ['02-first-run-dark', 'first', 'dark'],
  ['03-canvas-playing-light', 'canvas', 'light', 'play'], ['04-canvas-playing-dark', 'canvas', 'dark', 'play'],
  ['05-terminal-ready-light', 'terminal', 'light'], ['06-terminal-ready-dark', 'terminal', 'dark'],
  ['07-terminal-confirm-light', 'terminal', 'light', 'confirm'],
  ['08-terminal-playing-dark', 'termplay', 'dark', 'termplay'], ['09-terminal-playing-light', 'termplay', 'light', 'termplay'],
  ['10-console-confirm-dark', 'console', 'dark', 'confirm'],
  ['11-settings-open-light', 'terminal', 'light', 'settings'],
  ['12-about-popover-dark', 'canvas', 'dark', 'about'],
  ['13-stale-host-light', 'canvas', 'light', '', '&stale=1'],
  ['14-import-dialog-light', 'canvas', 'light', 'import'],
  ['15-ai-dialog-light', 'ai', 'light', 'aiform'],
  ['16-ai-dialog-dark', 'ai', 'dark', 'aiform'],
  ['17-ai-created-light', 'ai', 'light', 'aicreate'],
  ['18-ai-session-started-dark', 'ai', 'dark', 'aisend'],
  ['19-ai-copy-fallback-light', 'ai', 'light', 'aicreate', '&session=0'],
  ['20-script-pack-playing-dark', 'script', 'dark', 'scriptplay'],
  ['21-script-pack-playing-light', 'script', 'light', 'scriptplay'],
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
  if (action === 'confirm' || action === 'termplay') { await sleep(800); await page.click('.mv-play-big'); await sleep(800) }
  if (action === 'termplay') { await clickText(page, '.mv-confirm button', '确认启动'); await sleep(2000) }
  if (action === 'settings') { await page.evaluate(() => { document.querySelector('.mv-term-tab details').open = true }); await sleep(500) }
  if (action === 'import') { await clickText(page, '.mv-card-ghost', '导入 MV 包'); await sleep(400) }
  if (String(action ?? '').startsWith('ai')) {
    const [chooser] = await Promise.all([page.waitForFileChooser(), clickText(page, '.mv-ai button', '选择音频')])
    await chooser.accept([AUDIO]); await sleep(500)
    await page.evaluate(() => { const t = document.querySelector('.mv-ai input[placeholder="歌名"]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(t, 'Starlight Run'); t.dispatchEvent(new Event('input', { bubbles: true })) })
    await typeInto(page, '.mv-ai input[placeholder="可选"]', 'Alice')
    await typeInto(page, '.mv-ai textarea', '[00:20.00]Running through the neon rain\n[00:20.00]在霓虹雨里奔跑\n[00:26.00]Every light a name\n[00:26.00]每一盏灯都是一个名字')
    const areas = await page.$$('.mv-ai textarea'); await areas[1].type('赛博朋克雨夜，副歌时满屏代码雨，结尾慢慢熄灭')
    await sleep(300)
    if (action !== 'aiform') { await clickText(page, '.mv-ai button', '创建 MV 包'); await sleep(3500) }
    if (action === 'aisend') { await clickText(page, '.mv-ai button', '在新会话中交给 AI'); await sleep(800) }
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
