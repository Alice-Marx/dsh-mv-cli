#!/usr/bin/env node
/** Production React workshop QA using local synthetic settled-envelope fixtures only.
 * No Harness account, real catalogue, remote service, filesystem install, or vote is used.
 * Usage: node tools/workshop-community-ui-smoke.mjs [output-dir]
 * Optional: DSH_MV_PLAYWRIGHT and DSH_MV_CHROME specify existing local dependencies.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createServer } from 'node:http'

const require = createRequire(import.meta.url)
const root = resolve(import.meta.dirname, '..')
const portModules = join(root, 'presets/ports/frostnova-web/node_modules')
const runtimeModules = 'C:/Users/Jianw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const portRequire = createRequire(join(root, 'presets/ports/frostnova-web/package.json'))
function dependency(name) {
  for (const resolver of [require, portRequire]) { try { return resolver(name) } catch { /* try next local copy */ } }
  return require(join(runtimeModules, name))
}
const { build } = dependency('esbuild')
const { chromium } = process.env.DSH_MV_PLAYWRIGHT ? require(process.env.DSH_MV_PLAYWRIGHT) : dependency('playwright')
const clientVersion = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version
const out = resolve(process.argv[2] || 'E:/Obsidian_ljw/Obsidian/Alice_marx_workshop/tmp/20261009_workshop_community/release-ui-qa')
await mkdir(out, { recursive: true })

const LABEL = {
  search: '\u641c\u7d22\u5de5\u574a', sort: '\u5de5\u574a\u6392\u5e8f',
  license: '\u6309\u8bb8\u53ef\u8bc1\u7b5b\u9009', renderer: '\u6309\u6e32\u67d3\u65b9\u5f0f\u7b5b\u9009',
  tag: '\u6309\u6807\u7b7e\u7b5b\u9009', lyrics: '\u6309\u6b4c\u8bcd\u5185\u5bb9\u7b5b\u9009',
  installation: '\u6309\u5b89\u88c5\u72b6\u6001\u7b5b\u9009', compatible: '\u53ea\u770b\u53ef\u517c\u5bb9',
  acclaimed: '\u5e7f\u53d7\u597d\u8bc4', clear: '\u6e05\u9664\u7b5b\u9009',
  refresh: '\u5237\u65b0', back: '\u2190 \u8fd4\u56de\u5217\u8868', install: '\u5b89\u88c5\u5230\u66f2\u5e93',
  community: '\u793e\u533a\u7edf\u8ba1', downloads: '\u6210\u529f\u4e0b\u8f7d', likes: '\u70b9\u8d5e',
  ready: '\u793e\u533a\u6570\u636e\u5df2\u66f4\u65b0', stale: '\u7f13\u5b58\u793e\u533a\u7edf\u8ba1',
  unavailable: '\u793e\u533a\u7edf\u8ba1\u6682\u4e0d\u53ef\u7528', offline: '\u793e\u533a\u7edf\u8ba1\u79bb\u7ebf',
}
const report = {
  fixture: 'SYNTHETIC LOCAL QA ONLY; no real users, installs, counts, votes, accounts or community service',
  clientVersion, productionReact: true, browser: '', layoutCases: [], defaultLayoutCases: [], cases: [], combinations: [],
  failures: [], pageErrors: [], externalRequests: [], hostCalls: [], screenshots: [], passed: false,
}
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end('<!doctype html><html lang="zh"><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body{margin:0;min-height:100%;background:#7f8a99}.qa-fixture-note{padding:5px 12px;font:12px/18px system-ui;background:#ffe59c;color:#251500;overflow-wrap:anywhere}</style></head><body><div class="qa-fixture-note">SYNTHETIC LOCAL QA FIXTURE - all users, counts and packs are fictional</div><div id="root"></div></body></html>')
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const iso = '2026-10-09T08:30:00.000Z'
const syntheticDescription = 'SYNTHETIC QA fixture. No real song, music, creator or account. '
const rows = [
  ['alpha', 'Alpha SYNTHETIC QA long title for responsive workshop', 'Alice QA', 'MIT', 'script', true, true, ['neon', 'synthetic'], '2026-10-09', clientVersion],
  ['bravo', 'Bravo SYNTHETIC QA', 'Bob QA', 'CC0-1.0', 'webgl', true, false, ['neon'], '2026-10-08', '0.9.2'],
  ['charlie', 'Charlie SYNTHETIC QA', 'Alice QA', 'CC-BY-4.0', 'generic', false, true, ['ocean'], '2026-10-07', '0.9.0'],
  ['delta', 'Delta SYNTHETIC QA', 'Dana QA', 'CC-BY-NC-4.0', 'dsh-pv', false, false, ['synthetic'], '2026-10-06', '0.9.5'],
  ['echo', 'Echo SYNTHETIC QA', 'Alice QA', 'MIT', 'world-execute-me', false, true, ['neon'], '2026-10-05', '99.0.0'],
  ['foxtrot', 'Foxtrot SYNTHETIC QA', 'Fran QA', 'MIT', 'script', false, false, ['ocean'], '2026-10-04', '0.9.0'],
  ['golf', 'Golf SYNTHETIC QA', 'Gia QA', 'CC-BY-SA-4.0', 'webgl', true, true, ['synthetic'], '2026-10-10', '0.9.2'],
  ['hotel', 'Hotel SYNTHETIC QA', 'Han QA', 'CC-BY-NC-SA-4.0', 'generic', false, true, ['ocean'], '', '0.9.0'],
]
const packs = rows.map(([key, title, author, license, renderer, lyrics, timing, tags, updated, requires], i) => ({
  id: `qa-${key}`, title, artist: 'SYNTHETIC QA Artist', author, license, renderer, lyrics, timing, tags, updated,
  requires, version: '1.1.0', duration: 90 + i, description: syntheticDescription + 'LongMetadata'.repeat(16),
  source: `${origin}/SYNTHETIC-QA-original/${'long-source-path-'.repeat(12)}${key}`,
  homepage: '', cover: '', sections: 3, fingerprint: false, size: 32000,
  files: [{ path: `${'SYNTHETIC-long-file-name-'.repeat(8)}${key}.json`, size: 32000, sha256: 'a'.repeat(64) }],
}))
const syntheticPath = id => `F:\\SYNTHETIC-QA-ONLY\\workshop\\${id}\\mv.json`
const installed = ['qa-alpha', 'qa-bravo', 'qa-foxtrot'].map(id => ({ id, version: id === 'qa-bravo' ? '1.1.0' : '1.0.0', title: packs.find(p => p.id === id).title, manifestPath: syntheticPath(id) }))
const index = { commit: 'a'.repeat(40), generated: iso, repo: 'SYNTHETIC-QA/catalogue', source: `${origin}/SYNTHETIC-index`, packs, installed }
const policy = { id: 'synthetic-v1', description: 'SYNTHETIC QA server award policy: a fixture award record must match this explicit policy; no local like/download threshold.' }
const ready = {
  status: 'ready', fetchedAt: iso, viewer: { status: 'authenticated', name: 'SYNTHETIC QA ONLY - NOT A REAL USER' }, policy,
  packs: {
    'qa-alpha': { downloadCount: 0, uniqueDownloadUsers: 0, likeCount: 0, likedByViewer: true, popularityScore: 0, acclaimed: { awardedAt: iso, criterion: policy.id } },
    'qa-bravo': { downloadCount: Number.MAX_SAFE_INTEGER, uniqueDownloadUsers: 987654321012, likeCount: 456789012345, popularityScore: 2 },
    'qa-charlie': {},
    'qa-echo': { downloadCount: 10, likeCount: 3, popularityScore: 1, acclaimed: { awardedAt: iso, criterion: policy.id } },
    'qa-golf': { likeCount: 0 },
  },
}
const unavailable = { status: 'unavailable', fetchedAt: null, viewer: { status: 'unsupported', name: null }, packs: {}, policy: null }
const clientSource = `import React from 'react';import {createRoot} from 'react-dom/client';import {WorkshopDialog} from './.dsh-plugin/client/mv-workshop.jsx';import {loadWorkshopCommunity} from './.dsh-plugin/client/mv-workshop-state.mjs';
let root;window.qaCalls=[];window.qaCallbacks=[];window.qaMode='absent';window.qaCommunity=null;window.qaIndex=null;
const ok=value=>Promise.resolve({ok:true,value:{ok:true,value}});
const call=(method,request,value)=>{window.qaCalls.push({method,request});return ok(value)};
window.mountWorkshop=({index,community,mode='absent',width=1100,skin='c',theme='dark'})=>{if(root)root.unmount();window.qaIndex=JSON.parse(JSON.stringify(index));window.qaCommunity=community;window.qaMode=mode;window.qaCalls=[];window.qaCallbacks=[];
const host={workshopIndex:request=>call('workshopIndex',request,window.qaIndex),workshopDirInfo:request=>call('workshopDirInfo',request,{dir:'F:\\\\SYNTHETIC-QA-ONLY\\\\workshop',defaultDir:'F:\\\\SYNTHETIC-QA-ONLY\\\\workshop',source:'fixed',platform:'win32',packs:3,extraDirs:[]}),workshopCover:request=>call('workshopCover',request,{found:false}),
workshopInstall:request=>{const pack=window.qaIndex.packs.find(p=>p.id===request.id);const manifestPath='F:\\\\SYNTHETIC-QA-ONLY\\\\workshop\\\\'+request.id+'\\\\mv.json';window.qaIndex.installed.push({id:request.id,version:pack.version,manifestPath});return call('workshopInstall',request,{id:pack.id,version:pack.version,manifestPath,files:1,warnings:[]})},
packLoad:request=>{const id=request.path.split('\\\\').at(-2),pack=window.qaIndex.packs.find(p=>p.id===id);return call('packLoad',request,{manifestPath:request.path,pack:{title:pack.title,artist:pack.artist,duration:pack.duration,workshop:{id,version:pack.version},canvas:{renderer:'generic'}},files:{},warnings:[]})},
workshopLike:request=>{window.qaCalls.push({method:'FORBIDDEN_VOTE',request});throw Error('QA forbids votes')},workshopDirOpen:request=>call('workshopDirOpen',request,{opened:false})};
if(mode!=='absent')host.workshopCommunity=request=>{window.qaCalls.push({method:'workshopCommunity',request});if(window.qaMode==='rejected')return Promise.resolve({ok:true,value:{ok:false,error:{message:'SYNTHETIC QA community unavailable'}}});return ok(window.qaCommunity)};
window.qaReadProjection=()=>loadWorkshopCommunity(host);
const el=document.getElementById('root');el.className='mv-root mv-skin-'+skin+' mv-'+theme;el.dataset.mvSkin=skin;el.style.width=width+'px';document.body.toggleAttribute('data-ds-dark-theme',theme==='dark');root=createRoot(el);root.render(React.createElement(WorkshopDialog,{api:host,onClose:()=>window.qaCallbacks.push('close'),onLoaded:()=>window.qaCallbacks.push('loaded'),onRecent:()=>window.qaCallbacks.push('recent')}));};
window.setCommunity=(community,mode='ready')=>{window.qaCommunity=community;window.qaMode=mode};`
const bundle = await build({ stdin: { contents: clientSource, resolveDir: root, sourcefile: 'workshop-community-qa.jsx' }, nodePaths: [portModules, runtimeModules], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(clientVersion), 'process.env.NODE_ENV': '"production"' } })
const css = (await Promise.all(['mv.css', 'mv-skins.css'].map(name => readFile(join(root, '.dsh-plugin/client', name), 'utf8')))).join('\n')
const executablePath = process.env.DSH_MV_CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true })
report.browser = await browser.version()

async function pageFor(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce', colorScheme: options.theme || 'dark' })
  page.setDefaultTimeout(5000)
  page.on('pageerror', error => report.pageErrors.push(error.message))
  await page.route('**/*', route => {
    const url = route.request().url()
    if (/^https?:/.test(url) && !url.startsWith(origin + '/')) { report.externalRequests.push(url); return route.abort() }
    return route.continue()
  })
  await page.goto(origin)
  await page.addStyleTag({ content: css })
  await page.addScriptTag({ content: bundle.outputFiles[0].text })
  await page.evaluate(args => window.mountWorkshop(args), { index, community: ready, ...options })
  await page.waitForFunction(() => document.querySelectorAll('.mv-ws-card').length === 8 && !document.querySelector('.mv-ws-grid[aria-busy="true"]'))
  if (options.mode && options.mode !== 'absent') await page.locator('[aria-label="' + LABEL.community + '"] [role="status"]').filter({ hasNotText: /\u8bfb\u53d6\u4e2d/ }).waitFor()
  await assertAccountUiHidden(page)
  return page
}
const ids = page => page.locator('.mv-ws-card').evaluateAll(cards => cards.map(card => card.dataset.packId))
const card = (page, id) => page.locator(`.mv-ws-card[data-pack-id="${id}"]`)
const detailButton = (page, id) => page.getByRole('button', { name: '\u67e5\u770b\u300a' + packs.find(p => p.id === id).title + '\u300b\u8be6\u60c5', exact: true })
const optionsState = page => page.getByLabel(LABEL.sort, { exact: true }).locator('option').evaluateAll(options => Object.fromEntries(options.map(option => [option.value, option.disabled])))
async function assertAccountUiHidden(page) {
  assert.equal(await page.locator('.mv-ws-like, .mv-ws-account-note, .mv-ws-like-note').count(), 0, 'release scope has no account or vote controls')
  assert.equal(await page.getByRole('button', { name: /\u70b9\u8d5e|\u767b\u5f55|\u6388\u6743/ }).count(), 0)
  const body = await page.locator('body').innerText()
  assert.ok(!/Harness[^\n]*(?:\u8d26\u53f7|\u767b\u5f55|\u4e13\u7528\u6388\u6743)|\u8d26\u53f7\u6388\u6743|\u5f85 Harness|\u5df2\u767b\u5f55|\u5df2\u70b9\u8d5e|authenticated|SYNTHETIC QA ONLY - NOT A REAL USER/i.test(body), 'no account/login/authorization prompts may be rendered')
}
async function assertDefaultCommunityHidden(page) {
  assert.equal(await page.locator('.mv-ws-community, .mv-ws-stats, .mv-ws-trophy').count(), 0)
  assert.equal(await page.getByRole('checkbox', { name: LABEL.acclaimed, exact: true }).count(), 0)
  assert.deepEqual(Object.keys(await optionsState(page)), ['updated', 'title', 'catalogue'])
  await assertAccountUiHidden(page)
}
async function screenshot(page, file) { const path = join(out, file); await page.screenshot({ path, fullPage: true }); report.screenshots.push(path); return path }
async function overflow(page) {
  return page.evaluate(() => {
    const root = document.getElementById('root'), dialog = document.querySelector('.mv-ws'), bounds = root.getBoundingClientRect()
    let intentionallyClipped = 0
    const outside = [...root.querySelectorAll('*')].filter(el => {
      const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
      let left = rect.left, right = rect.right
      for (let parent = el.parentElement; parent && parent !== root; parent = parent.parentElement) {
        if (/hidden|clip|scroll|auto/.test(getComputedStyle(parent).overflowX)) {
          const clip = parent.getBoundingClientRect()
          if (left < clip.left || right > clip.right) intentionallyClipped++
          left = Math.max(left, clip.left); right = Math.min(right, clip.right)
        }
      }
      return rect.width > 0 && rect.height > 0 && right > left && style.display !== 'none' && (left < bounds.left - .6 || right > bounds.right + .6)
    }).map(el => ({ tag: el.tagName, class: el.className?.baseVal ?? el.className, text: el.textContent.slice(0, 90), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right }))
    return { root: { width: root.clientWidth, scroll: root.scrollWidth }, dialog: { width: dialog.clientWidth, scroll: dialog.scrollWidth }, outside, intentionallyClipped }
  })
}
async function caseRun(name, run) {
  try { const evidence = await run(); report.cases.push({ name, passed: true, ...evidence }) }
  catch (error) { report.failures.push({ name, message: error.message, stack: error.stack }); report.cases.push({ name, passed: false }); console.error(name + ': ' + error.message) }
}
function oracle(filters) {
  return packs.filter(p => (!filters.query || [p.title, p.artist, p.author, p.id, ...p.tags].join(' ').toLowerCase().includes(filters.query.toLowerCase()))
    && (!filters.license || p.license === filters.license) && (!filters.renderer || p.renderer === filters.renderer)
    && (!filters.tag || p.tags.includes(filters.tag)) && (filters.lyrics === 'any' || (filters.lyrics === 'included' ? p.lyrics : filters.lyrics === 'timing' ? p.timing && !p.lyrics : !p.lyrics && !p.timing))
    && (filters.installation === 'any' || installed.some(i => i.id === p.id && (filters.installation !== 'updates' || i.version !== p.version)))
    && (!filters.compatible || p.requires !== '99.0.0') && (!filters.acclaimed || Boolean(ready.packs[p.id]?.acclaimed))).map(p => p.id)
}
try {
  await caseRun('24 container/skin/theme layouts; grid and details have no horizontal overflow', async () => {
    for (const width of [320, 480, 720, 1100]) for (const skin of ['a', 'b', 'c']) for (const theme of ['dark', 'light']) {
      const page = await pageFor({ width, skin, theme, mode: 'ready' })
      const grid = await overflow(page)
      const largeCounter = await card(page, 'qa-bravo').locator('dd').first().evaluate(element => {
        const range = document.createRange(); range.selectNodeContents(element)
        const rects = [...range.getClientRects()].filter(rect => rect.width && rect.height)
        return { text: element.textContent, whiteSpace: getComputedStyle(element).whiteSpace, lines: new Set(rects.map(rect => Math.round(rect.top * 10))).size, textWidth: Math.max(...rects.map(rect => rect.width)), availableWidth: element.clientWidth }
      })
      assert.equal(largeCounter.text, String(Number.MAX_SAFE_INTEGER))
      assert.equal(largeCounter.lines, 1, `16-digit counter must be readable on one line: ${width}/${skin}/${theme}`)
      assert.ok(largeCounter.textWidth <= largeCounter.availableWidth + 1, `16-digit counter cannot clip: ${width}/${skin}/${theme}`)
      await screenshot(page, `layout-${width}-${skin}-${theme}-grid.png`)
      await detailButton(page, 'qa-alpha').click()
      const detail = await overflow(page)
      await screenshot(page, `layout-${width}-${skin}-${theme}-detail.png`)
      const passed = grid.root.scroll <= grid.root.width + 1 && grid.dialog.scroll <= grid.dialog.width + 1 && !grid.outside.length
        && detail.root.scroll <= detail.root.width + 1 && detail.dialog.scroll <= detail.dialog.width + 1 && !detail.outside.length
      report.layoutCases.push({ width, skin, theme, grid, detail, largeCounter, passed })
      if (!passed) report.failures.push({ name: `layout ${width}/${skin}/${theme}`, message: 'Horizontal overflow', grid, detail })
      await page.close()
    }
    assert.equal(report.layoutCases.filter(row => !row.passed).length, 0, 'all 24 grid/detail layouts must fit their container')
    return { combinations: report.layoutCases.length, screenshotCount: 48 }
  })
  await caseRun('24 default no-API layouts hide unfinished community features and fit the container', async () => {
    for (const width of [320, 480, 720, 1100]) for (const skin of ['a', 'b', 'c']) for (const theme of ['dark', 'light']) {
      const page = await pageFor({ width, skin, theme, mode: 'absent' })
      await assertDefaultCommunityHidden(page)
      const grid = await overflow(page)
      await screenshot(page, `default-layout-${width}-${skin}-${theme}-grid.png`)
      await detailButton(page, 'qa-delta').click()
      await assertDefaultCommunityHidden(page)
      const detail = await overflow(page)
      assert.ok(await page.getByRole('button', { name: LABEL.install, exact: true }).isEnabled())
      await screenshot(page, `default-layout-${width}-${skin}-${theme}-detail.png`)
      const passed = grid.root.scroll <= grid.root.width + 1 && grid.dialog.scroll <= grid.dialog.width + 1 && !grid.outside.length
        && detail.root.scroll <= detail.root.width + 1 && detail.dialog.scroll <= detail.dialog.width + 1 && !detail.outside.length
      report.defaultLayoutCases.push({ width, skin, theme, grid, detail, communityHidden: true, accountUiHidden: true, installAvailable: true, passed })
      if (!passed) report.failures.push({ name: `default layout ${width}/${skin}/${theme}`, message: 'Horizontal overflow', grid, detail })
      await page.close()
    }
    assert.equal(report.defaultLayoutCases.filter(row => !row.passed).length, 0)
    return { combinations: report.defaultLayoutCases.length, screenshotCount: 48 }
  })
  await caseRun('native detail buttons, independent source links, keyboard and no vote action', async () => {
    const page = await pageFor({ mode: 'ready' })
    assert.equal(await page.locator('button button, button a, a button, [role="button"] a').count(), 0, 'interactive controls must not be nested')
    assert.equal(await card(page, 'qa-alpha').evaluate(el => el.tagName), 'ARTICLE')
    const button = detailButton(page, 'qa-alpha')
    assert.equal(await button.evaluate(el => el.tagName), 'BUTTON')
    const source = card(page, 'qa-alpha').locator('.mv-ws-source a')
    assert.ok(await source.count())
    assert.equal(await source.evaluate(el => el.tagName), 'A')
    await page.evaluate(() => {
      window.qaSourceActivations = []
      document.addEventListener('click', event => { const anchor = event.target.closest('.mv-ws-source a'); if (anchor) { window.qaSourceActivations.push({ href: anchor.href, keyboard: event.detail === 0 }); event.preventDefault() } }, true)
    })
    await source.click({ position: { x: 4, y: 8 } })
    assert.equal(await page.evaluate(() => window.qaSourceActivations.length), 1, 'visible source link click activates native anchor')
    assert.equal(await page.locator('.mv-ws-detail').count(), 0, 'source click must not open details')
    await source.focus(); await page.keyboard.press('Enter')
    assert.deepEqual(await page.evaluate(() => window.qaSourceActivations.map(row => row.keyboard)), [false, true])
    assert.equal(await page.locator('.mv-ws-detail').count(), 0, 'source Enter must not open details')
    await button.focus(); await page.keyboard.press('Enter'); assert.equal(await page.locator('.mv-ws-detail').count(), 1)
    await page.getByRole('button', { name: LABEL.back, exact: true }).click(); await button.focus(); await page.keyboard.press('Space'); assert.equal(await page.locator('.mv-ws-detail').count(), 1)
    await assertAccountUiHidden(page)
    assert.equal(await page.evaluate(() => window.qaCalls.filter(c => c.method === 'FORBIDDEN_VOTE').length), 0)
    await screenshot(page, 'keyboard-detail.png'); await page.close()
    return { nestedInteractiveControls: 0, sourceClickAndEnterIndependent: true, detailEnterAndSpace: true, voteCalls: 0 }
  })
  await caseRun('all filter options, 256 combined-filter states, author search and clear', async () => {
    const page = await pageFor({ mode: 'ready' })
    await page.getByLabel(LABEL.sort, { exact: true }).selectOption('catalogue')
    const state = { query: '', license: '', renderer: '', tag: '', lyrics: 'any', installation: 'any', compatible: false, acclaimed: false }
    const defaultState = { ...state }
    const dimensions = Object.keys(state)
    const selected = { query: 'Alice QA', license: 'MIT', renderer: 'script', tag: 'neon', lyrics: 'included', installation: 'updates', compatible: true, acclaimed: true }
    async function change(key, value) {
      if (key === 'query') await page.getByLabel(LABEL.search, { exact: true }).fill(value)
      else if (key === 'compatible' || key === 'acclaimed') await page.getByRole('checkbox', { name: LABEL[key], exact: true }).setChecked(value)
      else await page.getByLabel(LABEL[key], { exact: true }).selectOption(value)
      state[key] = value
    }
    for (let mask = 0; mask < 256; mask++) {
      for (let bit = 0; bit < dimensions.length; bit++) { const key = dimensions[bit], value = mask & 1 << bit ? selected[key] : defaultState[key]; if (state[key] !== value) await change(key, value) }
      const actual = await ids(page), expected = oracle(state)
      assert.deepEqual(actual, expected, `filter combination ${mask}`)
      report.combinations.push({ mask, filters: { ...state }, expected, actual, passed: true })
    }
    await screenshot(page, 'all-filters-combined.png')
    await page.getByRole('button', { name: LABEL.clear, exact: true }).click(); Object.assign(state, defaultState)
    assert.deepEqual(await ids(page), packs.map(p => p.id)); assert.ok(await page.getByRole('button', { name: LABEL.clear, exact: true }).isDisabled())
    let singleOptions = 0
    for (const key of ['license', 'renderer', 'tag', 'lyrics', 'installation']) {
      const values = await page.getByLabel(LABEL[key], { exact: true }).locator('option').evaluateAll(rows => rows.map(row => row.value))
      for (const value of values) { await change(key, value); assert.deepEqual(await ids(page), oracle(state), `${key}=${value}`); singleOptions++ }
      await change(key, defaultState[key])
    }
    await page.close(); return { combinedStates: 256, singleOptions, clearRestoresAll: true, authorSearchCovered: true }
  })
  await caseRun('updated/title catalogue sorts and known-zero/unknown metric ranking', async () => {
    const page = await pageFor({ mode: 'ready' })
    const sort = page.getByLabel(LABEL.sort, { exact: true })
    const expected = {
      updated: ['qa-golf', 'qa-alpha', 'qa-bravo', 'qa-charlie', 'qa-delta', 'qa-echo', 'qa-foxtrot', 'qa-hotel'],
      title: packs.map(p => p.id), catalogue: packs.map(p => p.id),
      downloads: ['qa-bravo', 'qa-echo', 'qa-alpha', 'qa-charlie', 'qa-delta', 'qa-foxtrot', 'qa-golf', 'qa-hotel'],
      likes: ['qa-bravo', 'qa-echo', 'qa-alpha', 'qa-golf', 'qa-charlie', 'qa-delta', 'qa-foxtrot', 'qa-hotel'],
      popular: ['qa-bravo', 'qa-echo', 'qa-alpha', 'qa-charlie', 'qa-delta', 'qa-foxtrot', 'qa-golf', 'qa-hotel'],
    }
    for (const [name, order] of Object.entries(expected)) { await sort.selectOption(name); assert.deepEqual(await ids(page), order, name) }
    await page.close(); return { checkedSorts: Object.keys(expected), knownZeroBeforeUnknown: true }
  })
  await caseRun('missing community API hides unfinished features and preserves filters and local install', async () => {
    const page = await pageFor({ mode: 'absent' })
    await assertDefaultCommunityHidden(page)
    await screenshot(page, 'default-no-community-grid.png')
    await page.getByLabel(LABEL.search, { exact: true }).fill('Dana QA')
    assert.deepEqual(await ids(page), ['qa-delta'])
    await page.getByLabel(LABEL.license, { exact: true }).selectOption('CC-BY-NC-4.0')
    await page.getByLabel(LABEL.renderer, { exact: true }).selectOption('dsh-pv')
    assert.deepEqual(await ids(page), ['qa-delta'])
    await page.getByRole('button', { name: LABEL.clear, exact: true }).click(); assert.equal((await ids(page)).length, 8)
    await detailButton(page, 'qa-delta').click(); const install = page.getByRole('button', { name: LABEL.install, exact: true }); assert.ok(await install.isEnabled()); await install.click()
    await page.waitForFunction(() => window.qaCallbacks.includes('loaded'))
    const calls = await page.evaluate(() => window.qaCalls); report.hostCalls.push(...calls)
    assert.equal(calls.filter(c => c.method === 'workshopInstall').length, 1); assert.equal(calls.filter(c => c.method === 'FORBIDDEN_VOTE').length, 0)
    assert.deepEqual(await page.evaluate(() => window.qaCallbacks), ['recent', 'loaded'])
    await assertDefaultCommunityHidden(page)
    await screenshot(page, 'no-community-synthetic-installed.png'); await page.close()
    return { communityFeaturesHidden: true, noAccountPrompts: true, ordinaryFiltersWork: true, syntheticHostInstallSucceeded: true, realInstalls: 0 }
  })
  await caseRun('read-only snapshots distinguish 0/missing/large counters and documented trophy awards', async () => {
    const page = await pageFor({ mode: 'ready' })
    assert.deepEqual(await card(page, 'qa-alpha').locator('dd').allTextContents(), ['0', '0', '0'])
    assert.deepEqual(await card(page, 'qa-charlie').locator('dd').allTextContents(), ['\u2014', '\u2014', '\u2014'])
    assert.deepEqual(await card(page, 'qa-bravo').locator('dd').allTextContents(), ['9007199254740991', '987654321012', '456789012345'])
    assert.equal(await page.locator('.mv-ws-trophy').count(), 2)
    assert.match(await card(page, 'qa-alpha').locator('.mv-ws-trophy').getAttribute('aria-label'), /SYNTHETIC QA server award policy/)
    assert.equal(await card(page, 'qa-bravo').locator('.mv-ws-trophy').count(), 0, 'large counts alone cannot award a trophy')
    await assertAccountUiHidden(page)
    assert.equal(await page.getByText('SYNTHETIC QA ONLY - NOT A REAL USER', { exact: true }).count(), 0, 'snapshot viewer is not proof of local account')
    const projection = await page.evaluate(() => window.qaReadProjection())
    assert.deepEqual(projection.viewer, { status: 'unsupported', name: null })
    assert.ok(Object.values(projection.packs).every(row => row.likedByViewer === null), 'first-stage loader must redact personal like state')
    await screenshot(page, 'ready-synthetic-metrics.png'); await page.close()
    return { zero: true, missing: true, largeSafeIntegers: true, maxSafeInteger: Number.MAX_SAFE_INTEGER, trophyRequiresPolicyAndAward: true, publicProjectionViewer: projection.viewer, personalLikesAllRedacted: true, fixtureViewerNotClaimedAsHarnessAccount: true, voteCalls: 0 }
  })
  await caseRun('stale snapshot explains timestamp; ready-to-unavailable drops metrics and identity claims', async () => {
    const page = await pageFor({ mode: 'ready' })
    await page.evaluate(snapshot => window.setCommunity(snapshot), { ...ready, status: 'stale' })
    await page.getByRole('button', { name: LABEL.refresh, exact: true }).click()
    await page.getByRole('status').filter({ hasText: LABEL.stale }).waitFor()
    assert.equal(await page.locator('time').getAttribute('datetime'), iso)
    assert.match(await page.locator('time').innerText(), /2026-10-09 08:30 UTC/)
    assert.deepEqual(await card(page, 'qa-alpha').locator('dd').allTextContents(), ['0', '0', '0'])
    await screenshot(page, 'stale-explained.png')
    await page.getByLabel(LABEL.sort, { exact: true }).selectOption('popular'); await page.getByRole('checkbox', { name: LABEL.acclaimed, exact: true }).check()
    await page.evaluate(snapshot => window.setCommunity(snapshot), unavailable)
    await page.getByRole('button', { name: LABEL.refresh, exact: true }).click(); await page.getByRole('status').filter({ hasText: LABEL.unavailable }).waitFor()
    assert.equal(await page.getByLabel(LABEL.sort, { exact: true }).inputValue(), 'updated')
    const checkbox = page.getByRole('checkbox', { name: LABEL.acclaimed, exact: true }); assert.ok(await checkbox.isDisabled()); assert.equal(await checkbox.isChecked(), false)
    assert.deepEqual(await card(page, 'qa-alpha').locator('dd').allTextContents(), ['\u2014', '\u2014', '\u2014'])
    assert.equal(await page.locator('.mv-ws-trophy').count(), 0); assert.equal(await page.locator('time').count(), 0)
    const body = await page.locator('body').innerText(); assert.ok(!/\u5df2\u767b\u5f55|\u5df2\u70b9\u8d5e|authenticated|SYNTHETIC QA ONLY - NOT A REAL USER/i.test(body))
    await assertAccountUiHidden(page)
    await screenshot(page, 'ready-to-unavailable.png'); await page.close()
    return { staleTimestampExplained: true, cachedMetricsClearedOnUnavailable: true, popularFallsBackUpdated: true, acclaimedFilterCleared: true, noAuthenticatedClaim: true }
  })
  await caseRun('community read rejection remains optional and explains cached stale state', async () => {
    const page = await pageFor({ mode: 'ready' })
    await page.evaluate(() => window.setCommunity(null, 'rejected'))
    await page.getByRole('button', { name: LABEL.refresh, exact: true }).click(); await page.getByRole('status').filter({ hasText: LABEL.stale }).waitFor()
    assert.match(await page.locator('.mv-ws-community-error').innerText(), /SYNTHETIC QA community unavailable/)
    await assertAccountUiHidden(page)
    const body = await page.locator('body').innerText(); assert.ok(!/\u5df2\u767b\u5f55|\u5df2\u70b9\u8d5e|authenticated|SYNTHETIC QA ONLY - NOT A REAL USER/i.test(body))
    assert.deepEqual(await card(page, 'qa-alpha').locator('dd').allTextContents(), ['0', '0', '0'])
    await detailButton(page, 'qa-delta').click(); assert.ok(await page.getByRole('button', { name: LABEL.install, exact: true }).isEnabled())
    await screenshot(page, 'community-error-stale.png'); await page.close()
    return { cachedStaleExplanation: true, installAvailable: true, noVote: true }
  })
  assert.deepEqual(report.externalRequests, [], 'local QA cannot contact external services')
  assert.deepEqual(report.pageErrors, [], 'production React must not throw')
  report.passed = report.failures.length === 0
} catch (error) {
  report.failures.push({ name: 'harness invariant', message: error.message, stack: error.stack })
} finally {
  for (const [i, page] of browser.contexts().flatMap(context => context.pages()).entries()) { try { await screenshot(page, `failure-open-page-${i}.png`); report.hostCalls.push(...await page.evaluate(() => window.qaCalls ?? [])) } catch { /* page may have closed */ } }
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  const markdown = ['# Workshop release UI QA', '', report.fixture, '', `Passed: ${report.passed}`, `Browser: ${report.browser}`, `Client: ${clientVersion}; React production bundle`, `Read-only API layout matrix: ${report.layoutCases.length}/24 container/skin/theme states, each with grid and details`, `Default no-API layout matrix: ${report.defaultLayoutCases.length}/24 container/skin/theme states, each with grid and details`, `Counter boundary: ${Number.MAX_SAFE_INTEGER}; one readable line without clipping in each API layout`, `Filter combinations: ${report.combinations.length}/256`, `External requests: ${report.externalRequests.length}`, `Page errors: ${report.pageErrors.length}`, '', '## Cases', '', ...report.cases.map(row => `- ${row.passed ? 'PASS' : 'FAIL'}: ${row.name}`), '', '## Failures', '', ...(report.failures.length ? report.failures.map(row => `- ${row.name}: ${row.message}`) : ['None.']), '', '## Screenshots', '', ...report.screenshots.map(path => `- ${path}`), '', 'Limitations: pure local synthetic fixtures verify presentation and interaction only. Accounts were removed from release scope. No actual community backend, Harness SSO, real aggregate counts, votes, or real installs were exercised.', ''].join('\n')
  await writeFile(join(out, 'README.md'), markdown)
  await browser.close(); await new Promise(r => server.close(r))
}
console.log(JSON.stringify({ passed: report.passed, layoutCases: report.layoutCases.length, defaultLayoutCases: report.defaultLayoutCases.length, combinedFilters: report.combinations.length, cases: report.cases, failures: report.failures.map(({ name, message }) => ({ name, message })), out }, null, 2))
if (!report.passed) process.exitCode = 1
