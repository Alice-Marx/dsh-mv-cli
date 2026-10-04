// The committed client.js is what Harness loads: run it in a VM with a stub
// module loader and React, then drive its apply() with fake Desktop services.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { generate } from '../scripts/build-client.mjs'

const plain = value => JSON.parse(JSON.stringify(value))
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bundle = readFileSync(new URL('../.dsh-plugin/client.js', import.meta.url), 'utf8')

function load() {
  let registration
  const React = { createElement: (type, props, ...children) => ({ type, props, children }), Fragment: 'Fragment', useState: () => [], useRef: () => ({}), useEffect() {}, useCallback: f => f, forwardRef: f => f, useImperativeHandle() {} }
  // a Harness-like renderer global environment
  vm.runInNewContext(bundle, { window: { __ModuleLoader__: { load(entry) { registration = entry } } }, navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0) Electron', platform: 'Win32', language: 'zh-CN', maxTouchPoints: 0 }, document: {}, queueMicrotask, setTimeout, clearTimeout, setInterval, clearInterval, console, TextEncoder, TextDecoder, URL }, { timeout: 5000 })
  const exports = registration.factory(name => {
    if (name === 'react') return React
    if (name === 'react-dom') return {}
    throw new Error(`unexpected require ${name}`)
  })
  return { registration, exports }
}

test('client.js is up to date with the sources', async () => {
  const result = await generate({ check: true })
  assert.deepEqual(result.errors ?? [], [])
  assert.equal(result.ok, true)
})

test('client bundle registers under the npm package name and embeds the version', () => {
  const { registration, exports } = load()
  assert.equal(registration.id, pkg.name)
  assert.deepEqual(plain(exports.inject), ['remote'])
  assert.ok(bundle.includes(JSON.stringify(pkg.version)))
  assert.doesNotMatch(bundle, /Switch on the power line|接通电源/, 'no lyric text in the bundle')
})

test('client apply mounts the remote and registers panel, sidebar and open action unconditionally', async () => {
  const { exports } = load()
  const mounted = [], slots = [], effects = []
  let injected
  const ctx = {
    remote: { $mount: async contribution => { mounted.push(contribution); return async () => {} }, dshMv: { info: async () => ({ ok: true }) } },
    inject(names, fn) { injected = names; const promise = Promise.resolve(fn(ctx)); promise.dispose = async () => {}; return promise },
    effect: (fn, label) => { effects.push(label); fn() },
    // No configForms: a Config without volatile fields is never served by settings.describe.
    configForms: { whileServed: () => { throw new Error('registration must not depend on whileServed') } },
    slots: { inject: (name, fn) => fn(), register: (item, component) => { slots.push({ item, component }); return () => {} } },
    layout: { selectPanel: id => slots.push({ selected: id }) },
  }
  const dispose = await exports.apply(ctx)
  assert.equal(typeof dispose, 'function')
  assert.equal(mounted[0].package, pkg.name)
  assert.equal(mounted[0].descriptors.length, 31)
  assert.deepEqual(plain(injected), ['slots', 'remote', 'remote.dshMv', 'layout'])
  assert.deepEqual(slots.map(s => s.item.name), ['main', 'sidebar.panellist', 'plugins.detail.actions'])
  assert.equal(slots[0].item.key, 'dsh-mv.main')
  assert.equal(slots[1].item.id, 'dsh-mv.main')
  assert.equal(slots[1].item.label, 'MV 放映室')
  assert.equal(slots[0].item.inject().api.dshpvAsset, undefined, 'removed in 0.9.0 (assets come from packs)')
  assert.equal(typeof slots[0].item.inject().api.aiPackCreate, 'function')
  for (const m of ['workshopIndex', 'workshopCover', 'workshopInstall', 'workshopUninstall', 'workshopInstalled', 'workshopPublish', 'workshopDirInfo', 'workshopDirSet', 'workshopDirMove', 'workshopDirOpen']) assert.equal(typeof slots[0].item.inject().api[m], 'function', m)
  assert.equal(typeof slots[0].item.inject().harness.get, 'function')
  assert.equal(slots[0].item.inject().harness.get('layout'), undefined, 'ctx.get is optional')
  assert.equal(slots[0].item.inject().harness.get('secrets'), undefined, 'only an allow-list of services')
  slots[2].item.inject().openPanel()
  assert.equal(slots.at(-1).selected, 'dsh-mv.main')
})

test('package metadata', () => {
  assert.equal(pkg.name, '@ljwei-stak/dsh-mv-cli')
  const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /id: dsh-mv\n\s+name: '@ljwei-stak\/dsh-mv-cli'/)
  for (const file of ['NOTICE.md', 'LICENSE', 'README.md', 'README.zh.md']) assert.ok(pkg.files.includes(file))
  assert.ok(!pkg.files.some(f => /client\/mv|ref|spectrum|\.mp3/.test(f) || (/lyrics/.test(f) && f !== '.dsh-plugin/shared/mv-lyrics.mjs')), 'only the built bundle ships client code')
})

test('every relative import of the shipped Host files is itself shipped', async () => {
  const { readFile } = await import('node:fs/promises')
  const { join, dirname, normalize } = await import('node:path')
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const shipped = new Set(pkg.files.map(f => normalize(f)))
  for (const file of pkg.files.filter(f => f.endsWith('.mjs'))) {
    const text = await readFile(new URL(`../${file}`, import.meta.url), 'utf8')
    for (const match of text.matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
      const target = normalize(join(dirname(file), match[1]))
      assert.ok(shipped.has(target), `${file} imports ${target}, which package.json files does not ship`)
    }
  }
})
