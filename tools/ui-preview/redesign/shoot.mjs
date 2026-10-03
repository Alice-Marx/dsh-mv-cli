// Screenshots of the redesign mockups (not shipped). Needs puppeteer-core + Chrome:
//   node tools/ui-preview/redesign/build.mjs && node tools/ui-preview/redesign/shoot.mjs [outDir] [filter]
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const DIR = '/tmp/mv-redesign', OUT = process.argv[2] || '/workspace/dsh-mv-cli-ui-shots/redesign', only = process.argv[3]
const TYPES = { '.png': 'image/png', '.js': 'text/javascript', '.html': 'text/html; charset=utf-8' }
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]))
  if (!f.startsWith(DIR)) { res.statusCode = 403; return res.end() }
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end() } res.setHeader('content-type', TYPES[path.extname(f)] ?? 'application/octet-stream'); res.end(d) })
}).listen(8798)
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none', '--lang=zh-CN'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const BEST = { A: 'dark', B: 'dark', C: 'light' }, ALT = { A: 'light', B: 'light', C: 'dark' }
const SCREENS = [['01-library', 'library', 44.2], ['02-now-playing', 'now', 44.6], ['03-ai-make', 'ai', 44.2], ['04-calibration', 'calib', 21.2], ['05-workshop', 'workshop', 44.2], ['06-workshop-details', 'wsdetail', 44.2]]
const shots = []
for (const d of ['A', 'B', 'C']) {
  for (const [name, screen, t] of SCREENS) shots.push([d, `${name}-${BEST[d]}`, screen, BEST[d], t])
  for (const [name, screen, t] of SCREENS.slice(0, 2).concat([SCREENS[4]])) shots.push([d, `${name}-${ALT[d]}`, screen, ALT[d], t])
}
for (const [d, name, screen, theme, t] of shots) {
  if (only && !`${d}/${name}`.includes(only)) continue
  fs.mkdirSync(path.join(OUT, d), { recursive: true })
  const page = await browser.newPage(), errors = []
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()))
  await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:8798/?dir=${d}&screen=${screen}&theme=${theme}&t=${t}&shot=1`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready); await sleep(700)
  if (screen === 'library' && d !== 'B') await page.hover(d === 'A' ? '.a-grid .a-card:nth-child(3)' : '.c-grid .c-tile:nth-child(3)').catch(() => {})
  if (screen === 'library' && d === 'B') await page.hover('.b-table tbody tr:nth-child(5)').catch(() => {})
  if (screen === 'workshop') await page.hover(d === 'A' ? '.a-grid .a-card:nth-child(2)' : d === 'B' ? '.b-grid .b-card:nth-child(2)' : '.c-grid .c-tile:nth-child(2)').catch(() => {})
  await sleep(400)
  const file = path.join(OUT, d, `${name}.png`)
  if (!['ai', 'wsdetail'].includes(screen)) { // grow the viewport to the content so sticky bars sit at the bottom
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewport({ width: 1280, height: Math.max(860, h), deviceScaleFactor: 1 }); await sleep(500)
  }
  await page.screenshot({ path: file })
  console.log(`${d}/${name}`, errors.length ? 'ERRORS ' + errors.join(' | ') : 'ok')
  await page.close()
}
await browser.close(); server.close()
