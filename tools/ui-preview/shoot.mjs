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
]
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
  if (action === 'about') { await page.click('.mv-head .mv-icon-button'); await sleep(400) }
  const full = true
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log(name, errors.length ? 'ERRORS ' + errors.join(' | ').slice(0, 400) : 'ok')
  await context.close()
}
await browser.close(); server.close()
