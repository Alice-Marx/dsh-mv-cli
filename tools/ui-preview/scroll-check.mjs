// Scroll regression check for the Harness frame (0.8.1, not shipped): preview with ?host=1|wrap|art, wheel over the
// MV canvas, scroll to the bottom, focus()/scrollIntoView, wheel back; the 外观 button must stay visible. Copy next to puppeteer-core.
// Usage: node scrollcheck.mjs <outDir> <label> [skins] [hosts]
import puppeteer from 'puppeteer-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const DIR = process.env.PREVIEW_DIR || '/tmp/mv-ui-preview', OUT = process.argv[2], LABEL = process.argv[3] || 'fix'
const SKINS = (process.argv[4] || 'c,a,b').split(','), HOSTS = (process.argv[5] || '1,wrap,art').split(',')
fs.mkdirSync(OUT, { recursive: true })
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); const f = u.startsWith('/assets/') ? path.join('/workspace/dsh-mv-cli/.dsh-plugin/assets/', u.slice(8)) : path.join(DIR, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end() } res.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.png') ? 'image/png' : 'application/octet-stream'); res.end(d) }) }).listen(8797)
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--lang=zh-CN'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))
let fail = 0
for (const skin of SKINS) for (const host of HOSTS) {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 })
  const errs = []; p.on('pageerror', e => errs.push(String(e)))
  await p.goto(`http://localhost:8797/?scene=calib&theme=light&skin=${skin}&mode=${skin === 'c' ? 'light' : 'dark'}&host=${host}`); await sleep(2500)
  const st = () => p.evaluate(() => { const r = document.querySelector('.mv-root'), c = document.querySelector('.pv-host-center'), h = document.querySelector('.mv-head') ?? document.querySelector('.mv-tmux'), pick = document.querySelector('.mv-skin-trigger'), cr = c.getBoundingClientRect(), pr = pick.getBoundingClientRect()
    return { rootScroll: r.scrollTop, rootMax: r.scrollHeight - r.clientHeight, rootH: r.clientHeight, centerH: c.clientHeight, centerScroll: c.scrollTop, pickerVisible: pr.top >= cr.top - 1 && pr.bottom <= cr.bottom && pr.width > 0 } })
  const s0 = await st()
  await p.screenshot({ path: `${OUT}/${LABEL}-${skin}-host-${host}-1-top.png` })
  // wheel over the MV canvas
  const box = await (await p.$('.mv-stage')).boundingBox()
  await p.mouse.move(box.x + box.width / 2, Math.min(box.y + box.height / 2, 700)); for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: 120 }); await sleep(60) }
  await sleep(500); const s1 = await st()
  await p.screenshot({ path: `${OUT}/${LABEL}-${skin}-host-${host}-2-wheel-over-canvas.png` })
  for (let i = 0; i < 40; i++) { await p.mouse.wheel({ deltaY: 240 }); await sleep(30) }
  await sleep(600); const s2 = await st()
  await p.screenshot({ path: `${OUT}/${LABEL}-${skin}-host-${host}-3-bottom.png` })
  // focus the stage + scrollIntoView of a calibration line (programmatic scrolls), then wheel back to the top
  await p.evaluate(() => { document.querySelector('.mv-stage-wrap')?.focus(); document.querySelectorAll('.mv-calib-lines li')[5]?.scrollIntoView({ block: 'nearest' }) }); await sleep(300)
  for (let i = 0; i < 60; i++) { await p.mouse.wheel({ deltaY: -240 }); await sleep(20) }
  await sleep(600); const s3 = await st()
  await p.screenshot({ path: `${OUT}/${LABEL}-${skin}-host-${host}-4-back-to-top.png` })
  const ok = s0.pickerVisible && s1.rootScroll > 0 && s2.rootScroll >= s2.rootMax - 2 && s2.rootMax > 100 && s3.rootScroll === 0 && s3.centerScroll === 0 && s3.pickerVisible && !errs.length
  if (!ok) fail++
  console.log(ok ? 'PASS' : 'FAIL', skin, 'host=' + host, JSON.stringify({ top: s0, wheelCanvas: s1.rootScroll, bottom: [s2.rootScroll, s2.rootMax], back: s3, errs }))
  await p.close()
}
await b.close(); server.close(); process.exit(fail ? 1 : 0)
