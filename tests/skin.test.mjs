import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SKIN_KEY, DEFAULT_SKIN, normalizeSkin, loadSkin, saveSkin, resolveDark, skinClasses, coverHue, coverInitials, fmtTime, asciiBar, SKIN_EVENT } from '../.dsh-plugin/client/mv-skin.mjs'

const memory = (init = {}) => { const m = new Map(Object.entries(init)); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), map: m } }

test('defaults: skin C (Harness), A/B dark, C follows the host', () => {
  assert.equal(DEFAULT_SKIN, 'c')
  assert.deepEqual(normalizeSkin(null), { skin: 'c', modes: { c: 'auto', a: 'dark', b: 'dark' } })
  assert.deepEqual(normalizeSkin({ skin: 'zz', modes: { a: 'neon', b: 'light' } }), { skin: 'c', modes: { c: 'auto', a: 'dark', b: 'light' } })
})

test('load/save round-trip through storage and survive junk', () => {
  const s = memory()
  assert.equal(loadSkin(s).skin, 'c')
  saveSkin({ skin: 'b', modes: { b: 'light' } }, s)
  assert.deepEqual(JSON.parse(s.map.get(SKIN_KEY)), { skin: 'b', modes: { c: 'auto', a: 'dark', b: 'light' } })
  assert.deepEqual(loadSkin(s), { skin: 'b', modes: { c: 'auto', a: 'dark', b: 'light' } })
  assert.equal(loadSkin(memory({ [SKIN_KEY]: '{not json' })).skin, 'c')
  assert.equal(loadSkin(undefined).skin, 'c')
  const broken = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
  assert.equal(loadSkin(broken).skin, 'c')
  assert.equal(saveSkin({ skin: 'a' }, broken).skin, 'a')
})

test('resolveDark: explicit modes win, auto prefers Harness then system', () => {
  assert.equal(resolveDark('dark', { hostDark: false }), true)
  assert.equal(resolveDark('light', { hostDark: true, systemDark: true }), false)
  assert.equal(resolveDark('auto', { hostDark: true, systemDark: false }), true)
  assert.equal(resolveDark('auto', { hostDark: false, systemDark: true }), false)
  assert.equal(resolveDark('auto', { hostDark: null, systemDark: true }), true)
  assert.equal(resolveDark('auto'), false)
})

test('skinClasses', () => {
  assert.equal(skinClasses(null, { hostDark: false }), 'mv-skin-c mv-light mv-follow')
  assert.equal(skinClasses(null, { hostDark: true }), 'mv-skin-c mv-dark mv-follow')
  assert.equal(skinClasses({ skin: 'a' }), 'mv-skin-a mv-dark')
  assert.equal(skinClasses({ skin: 'b', modes: { b: 'light' } }), 'mv-skin-b mv-light')
})

test('cover helpers are stable', () => {
  assert.equal(coverHue('Starlight Run'), coverHue('Starlight Run'))
  for (const t of ['', null, 'a', '世界', 'Token Rain']) { const h = coverHue(t); assert.ok(Number.isInteger(h) && h >= 0 && h < 360) }
  assert.equal(coverInitials('Starlight Run'), 'SR')
  assert.equal(coverInitials('world.execute(me);'), 'WE')
  assert.equal(coverInitials('鲸落'), '鲸')
  assert.equal(coverInitials('  '), '♪')
})

test('skin CSS ships with the panel and keeps the known fixes', () => {
  const css = readFileSync(new URL('../.dsh-plugin/client/mv-skins.css', import.meta.url), 'utf8')
  for (const s of ['a', 'b', 'c']) for (const m of ['light', 'dark']) assert.match(css, new RegExp(`\\.mv-root\\.mv-skin-${s}\\.mv-${m}\\s*\\{`))
  assert.match(css, /\.mv-ws-files li\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(css, /mv-skin-b:has\(\.mv-calib\[open\]\) \.mv-stage/)
})

test('player bar / status line helpers', () => {
  assert.equal(fmtTime(0), '0:00'); assert.equal(fmtTime(65.9), '1:05'); assert.equal(fmtTime(-3), '0:00'); assert.equal(fmtTime(NaN), '0:00')
  assert.equal(asciiBar(0, 0, 4), '[░░░░]'); assert.equal(asciiBar(30, 60, 4), '[██░░]'); assert.equal(asciiBar(99, 60, 4), '[████]')
  assert.equal(typeof SKIN_EVENT, 'string')
})

test('skin structure CSS: A sidebar + bar, B tmux + status, CRT kept off the canvas', () => {
  const css = readFileSync(new URL('../.dsh-plugin/client/mv-skins.css', import.meta.url), 'utf8')
  assert.match(css, /\.mv-skin-a \.mv-shell \{[^}]*grid-template-areas: "side main" "bar bar"/)
  assert.match(css, /\.mv-bar \{[^}]*position: sticky; bottom: 0/)
  assert.match(css, /\.mv-tmux \{[^}]*top: 0/)
  assert.match(css, /\.mv-status \{[^}]*bottom: 0/)
  assert.match(css, /\.mv-skin-b \.mv-stage-wrap \{ z-index: 21; \}/)
  const panel = readFileSync(new URL('../.dsh-plugin/client/mv-panel.jsx', import.meta.url), 'utf8')
  // fixed child slots so switching skins never remounts the canvas
  assert.match(panel, /skinId === 'a' \? <SideNav[^\n]*: null\}\n\s*\{skinId === 'b' \? <TmuxTabs[^\n]*: null\}\n\s*<div className="mv-main">/)
})

test('0.8.1 scroll: the root is its own scroll container and fits a clipping host', async () => {
  const css = readFileSync(new URL('../.dsh-plugin/client/mv.css', import.meta.url), 'utf8')
  const root = css.slice(css.indexOf('.mv-root {'), css.indexOf('}', css.indexOf('.mv-root {')))
  for (const rule of ['flex: 1 1 auto', 'min-height: 0', 'height: 100%', 'overflow-y: auto']) assert.ok(root.includes(rule), rule)
  const { clippingAncestor, hostHeight } = await import('../.dsh-plugin/client/mv-host-fit.mjs')
  const doc = { documentElement: null, body: null }
  const node = (overflowY, parentElement = null) => ({ overflowY, parentElement, ownerDocument: doc })
  const center = node('hidden'); const wrap = node('visible', center); const el = node('visible', wrap)
  const found = clippingAncestor(el, n => ({ overflowY: n.overflowY }))
  assert.equal(found.node, center); assert.equal(found.overflow, 'hidden')
  assert.equal(clippingAncestor(node('visible', node('visible')), n => ({ overflowY: n.overflowY })), null)
  assert.equal(hostHeight({ overflow: 'auto', room: 700, rootHeight: 2000, pinned: '' }), '')      // the host scrolls
  assert.equal(hostHeight({ overflow: 'hidden', room: 700, rootHeight: 700, pinned: '' }), '')    // flex already fits
  assert.equal(hostHeight({ overflow: 'hidden', room: 700, rootHeight: 2000, pinned: '' }), '700px') // unsized wrapper: pin
  assert.equal(hostHeight({ overflow: 'hidden', room: 650.6, rootHeight: 700, pinned: '700px' }), '650px') // follow resizes
  assert.equal(hostHeight({ overflow: 'hidden', room: 40, rootHeight: 700, pinned: '700px' }), '700px')
})

test('0.8.2 library list view: default list, persisted, durations on recent entries, larger library', async () => {
  const { LIBRARY_VIEW_KEY, loadLibraryView, saveLibraryView, rememberPack, noteDuration, loadRecent } = await import('../.dsh-plugin/client/mv-pack-state.mjs')
  const { MV_PACK_LIMITS } = await import('../.dsh-plugin/shared/mv-pack.mjs')
  const s = memory()
  assert.equal(loadLibraryView(s), 'list')
  assert.equal(saveLibraryView('grid', s), 'grid'); assert.equal(s.map.get(LIBRARY_VIEW_KEY), 'grid'); assert.equal(loadLibraryView(s), 'grid')
  assert.equal(saveLibraryView('weird', s), 'list'); assert.equal(loadLibraryView(memory({ [LIBRARY_VIEW_KEY]: 'x' })), 'list')
  assert.equal(loadLibraryView({ getItem: () => { throw new Error('no') } }), 'list')
  const list = rememberPack({ manifestPath: 'D:\\A\\mv.json', pack: { title: 'A', artist: 'x', duration: 125.5 } }, { storage: s, now: () => 1 })
  assert.equal(list[0].duration, 125.5)
  rememberPack({ manifestPath: 'D:\\B\\mv.json', pack: { title: 'B' } }, { storage: s, now: () => 2 })
  assert.equal(loadRecent(s)[0].duration, undefined)
  const after = noteDuration('D:\\B\\mv.json', 61, s)
  assert.deepEqual(after.map(item => [item.title, item.duration]), [['B', 61], ['A', 125.5]])
  assert.equal(noteDuration('D:\\missing\\mv.json', 10, s).length, 2)
  assert.ok(MV_PACK_LIMITS.recentPacks >= 50)
  for (let i = 0; i < 60; i++) rememberPack({ manifestPath: `D:\\P${i}\\mv.json`, pack: { title: `P${i}` } }, { storage: s })
  assert.equal(loadRecent(s).length, MV_PACK_LIMITS.recentPacks)
})
