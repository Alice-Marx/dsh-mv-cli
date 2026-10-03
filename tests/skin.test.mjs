import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SKIN_KEY, DEFAULT_SKIN, normalizeSkin, loadSkin, saveSkin, resolveDark, skinClasses, coverHue, coverInitials } from '../.dsh-plugin/client/mv-skin.mjs'

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
