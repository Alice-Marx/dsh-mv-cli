import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { WORKSHOP_INDEX_FORMAT, insideDir, normalizeWorkshopDir, parseWorkshopDirMove, parseWorkshopDirSet, sameDir } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { createSettingsStore, createWorkshopManager, ensureWritableDir, openFolder, settingsFile } from '../.dsh-plugin/shared/mv-workshop-host.mjs'
import { moveWorkshopPacks } from '../.dsh-plugin/client/mv-workshop-state.mjs'
import { ACTIVE_KEY, RECENT_KEY, relocatePacks } from '../.dsh-plugin/client/mv-pack-state.mjs'

const sha = b => createHash('sha256').update(b).digest('hex')
const tmp = () => mkdtempSync(join(tmpdir(), 'dsh-mv-dir-'))

test('install folder paths: Windows drives (C:, F:, …) and UNC; readable errors', () => {
  assert.equal(normalizeWorkshopDir('F:\\MV\\workshop'), 'F:\\MV\\workshop')
  assert.equal(normalizeWorkshopDir(' "f:/MV/workshop/" '), 'F:\\MV\\workshop')
  assert.equal(normalizeWorkshopDir('F:'), 'F:\\')
  assert.equal(normalizeWorkshopDir('F:\\'), 'F:\\')
  assert.equal(normalizeWorkshopDir('D:\\Program Files\\dsh mv\\.\\packs'), 'D:\\Program Files\\dsh mv\\packs')
  assert.equal(normalizeWorkshopDir('\\\\nas\\share\\mv'), '\\\\nas\\share\\mv')
  for (const [bad, pattern] of [['', /填写/], ['MV\\workshop', /盘符/], ['\\MV', /盘符/], ['F:\\a\\..\\b', /\.\./], ['F:\\a?b', /字符/], ['F:\\a:b', /字符/], ['F:\\con\\x', /保留名/], ['F:\\name.', /结尾/], ['F:\\a\nb', /无效/]]) {
    assert.throws(() => normalizeWorkshopDir(bad), pattern, bad)
  }
  assert.equal(normalizeWorkshopDir('/mnt/data//mv/', 'linux'), '/mnt/data/mv')
  assert.throws(() => normalizeWorkshopDir('mv', 'linux'), /绝对路径/)
  assert.ok(sameDir('F:\\MV\\', 'f:/mv'))
  assert.ok(insideDir('F:\\MV\\a', 'f:\\mv') && !insideDir('F:\\MVX', 'F:\\MV'))
  assert.deepEqual(parseWorkshopDirSet({ dir: ' F:\\MV ' }), { dir: 'F:\\MV', reset: false, keep: true })
  assert.deepEqual(parseWorkshopDirSet({ reset: true }), { dir: null, reset: true, keep: true })
  assert.throws(() => parseWorkshopDirSet({ dir: 'F:\\MV', evil: 1 }), /unexpected/)
  assert.throws(() => parseWorkshopDirSet({}), /无效/)
  assert.throws(() => parseWorkshopDirMove({ id: '../x' }), /无效/)
  assert.match(settingsFile({ LOCALAPPDATA: 'C:\\Users\\a\\AppData\\Local' }, 'win32'), /dsh-mv[\\/]settings\.json$/)
})

test('writable check creates the folder and reports a readable error', async () => {
  const base = tmp()
  await ensureWritableDir(join(base, 'a', 'b'))
  assert.ok(existsSync(join(base, 'a', 'b')))
  writeFileSync(join(base, 'file'), 'x')
  await assert.rejects(ensureWritableDir(join(base, 'file', 'x')), /无法使用这个文件夹/)
  if (typeof process.getuid === 'function' && process.getuid() !== 0) {
    const ro = join(base, 'ro'); mkdirSync(ro); chmodSync(ro, 0o500)
    await assert.rejects(ensureWritableDir(ro), /没有写入权限/)
  }
})

test('open folder runs the file manager with the folder as one argument (no shell)', () => {
  const calls = []
  const run = (cmd, args, opts) => { calls.push([cmd, args, opts.shell]); return { on() {}, unref() {} } }
  openFolder('F:\\MV & co', { platform: 'win32', run })
  openFolder('/x', { platform: 'linux', run })
  assert.deepEqual(calls, [['explorer.exe', ['F:\\MV & co'], undefined], ['xdg-open', ['/x'], undefined]])
})

function repo(ids) {
  const commit = 'b'.repeat(40)
  const filesOf = id => ({ 'mv.json': Buffer.from(JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'X', duration: 10, canvas: { renderer: 'script', script: 'scenes.js' }, 'x-dsh-mv-workshop': { id, version: '1.0.0', license: 'MIT', author: 'me' } })), 'scenes.js': Buffer.from('function render(t){ return ["hi"] }') })
  const index = { format: WORKSHOP_INDEX_FORMAT, version: 1, commit, generated: '2026-10-04T00:00:00Z', packs: ids.map(id => ({ id, title: id.toUpperCase(), author: 'me', license: 'MIT', version: '1.0.0', duration: 10, renderer: 'script', files: Object.entries(filesOf(id)).map(([path, b]) => ({ path, size: b.length, sha256: sha(b) })) })) }
  return async url => {
    if (url.endsWith('/main/index.json')) return Buffer.from(JSON.stringify(index))
    const [id, name] = url.split('/').slice(-2)
    const files = filesOf(id)
    if (!files[name]) throw new Error(`404 ${url}`)
    return files[name]
  }
}

test('change the install folder: keep (still listed), move (copy + verify + delete), reset; stored by the Host', async () => {
  const base = tmp(), defaultRoot = join(base, 'default'), other = join(base, 'F-drive', 'MV')
  const file = join(base, 'settings.json')
  const opened = []
  const make = (configDir = '') => createWorkshopManager({ defaultRoot, settings: createSettingsStore({ file }), platform: process.platform, get: repo(['pack-a', 'pack-b', 'pack-c']), configDir: () => configDir, open: d => opened.push(d) })
  let ws = make()
  assert.equal((await ws.dirInfo()).source, 'default')
  await ws.install({ id: 'pack-a' }); await ws.install({ id: 'pack-b' })
  // Change, keep the packs where they are: both still listed, from the old folder.
  const changed = await ws.setDir({ dir: other, keep: true })
  assert.equal(changed.dir, other); assert.equal(changed.source, 'custom'); assert.equal(changed.changed, true)
  assert.deepEqual(changed.movable.map(m => m.id).sort(), ['pack-a', 'pack-b'])
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')).workshop, { dir: other, extraDirs: [defaultRoot] })
  // A fresh manager (plugin restart) reads the setting.
  ws = make()
  assert.equal(await ws.currentRoot(), other)
  let list = (await ws.installed()).installed
  assert.deepEqual(list.map(i => i.id).sort(), ['pack-a', 'pack-b'])
  assert.ok(list.every(i => i.manifestPath.startsWith(defaultRoot)))
  // New installs go to the new folder.
  const cc = await ws.install({ id: 'pack-c' })
  assert.ok(cc.manifestPath.startsWith(other))
  // Re-installing a kept pack replaces the old copy.
  await ws.install({ id: 'pack-b' })
  assert.ok(!existsSync(join(defaultRoot, 'pack-b')))
  // Move the rest; progress is reported; the old folder is forgotten once empty.
  const progress = []
  const api = { workshopDirMove: async ({ id }) => ({ ok: true, value: await ws.moveToCurrent({ id }) }) }
  const { moved, failed } = await moveWorkshopPacks(api, ['pack-a'], p => progress.push(p))
  assert.deepEqual(failed, [])
  assert.equal(moved[0].oldManifestPath, join(defaultRoot, 'pack-a', 'mv.json'))
  assert.equal(moved[0].manifestPath, join(other, 'pack-a', 'mv.json'))
  assert.ok(existsSync(moved[0].manifestPath) && !existsSync(join(defaultRoot, 'pack-a')))
  assert.deepEqual(progress.map(p => p.done), [0, 1])
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')).workshop.extraDirs, [])
  list = (await ws.installed()).installed
  assert.deepEqual(list.map(i => i.id).sort(), ['pack-a', 'pack-b', 'pack-c'])
  assert.ok(list.every(i => i.dir === other))
  // Uninstall finds packs in any folder.
  await ws.uninstall({ id: 'pack-c' })
  // Open folder.
  assert.deepEqual((await ws.openDir()).dir, other); assert.deepEqual(opened, [other])
  // Reset to the default: packs can be moved back.
  const reset = await ws.setDir({ reset: true })
  assert.equal(reset.dir, defaultRoot); assert.equal(reset.source, 'default')
  assert.deepEqual(reset.movable.map(m => m.id).sort(), ['pack-a', 'pack-b'])
  // The plugin config field is the default when the panel has no setting.
  const cfgDir = join(base, 'cfg')
  ws = make(cfgDir)
  assert.equal(await ws.currentRoot(), cfgDir)
  assert.equal((await ws.dirInfo()).source, 'config')
  assert.equal((await ws.installed()).installed.length, 2)
})

test('a move that cannot be verified keeps the original; bad targets are refused', async () => {
  const base = tmp(), defaultRoot = join(base, 'default')
  const ws = createWorkshopManager({ defaultRoot, settings: createSettingsStore({ file: join(base, 's.json') }), platform: process.platform, get: repo(['pack-a']) })
  await ws.install({ id: 'pack-a' })
  // Tamper with the installed copy: the copy no longer matches the install record.
  writeFileSync(join(defaultRoot, 'pack-a', 'scenes.js'), 'changed')
  await ws.setDir({ dir: join(base, 'new') })
  await assert.rejects(ws.moveToCurrent({ id: 'pack-a' }), /校验失败.*原来的文件没有删除/)
  assert.ok(existsSync(join(defaultRoot, 'pack-a', 'mv.json')))
  assert.ok(!existsSync(join(base, 'new', 'pack-a')))
  // An existing folder of the same name in the target is never overwritten.
  writeFileSync(join(defaultRoot, 'pack-a', 'scenes.js'), 'function render(t){ return ["hi"] }')
  mkdirSync(join(base, 'new', 'pack-a'))
  await assert.rejects(ws.moveToCurrent({ id: 'pack-a' }), /已经有/)
  writeFileSync(join(base, 'blocker'), 'x')
  await assert.rejects(ws.setDir({ dir: join(base, 'blocker', 'sub') }), /无法使用这个文件夹/)
  await assert.rejects(ws.setDir({ dir: 'relative/dir' }), /绝对路径|完整路径/)
  await assert.rejects(createWorkshopManager({ root: base }).setDir({ dir: '/x' }), /固定/)
})

test('library entries follow moved packs', () => {
  const data = new Map()
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }
  storage.setItem(RECENT_KEY, JSON.stringify([{ manifestPath: 'C:\\old\\pack-a\\mv.json', title: 'A' }, { manifestPath: 'D:\\mine\\mv.json', title: 'Mine' }]))
  storage.setItem(ACTIVE_KEY, 'pack:C:\\old\\pack-a\\mv.json')
  const list = relocatePacks([{ oldManifestPath: 'c:\\OLD\\pack-a\\mv.json', manifestPath: 'F:\\MV\\pack-a\\mv.json' }], storage)
  assert.deepEqual(list.map(i => i.manifestPath), ['F:\\MV\\pack-a\\mv.json', 'D:\\mine\\mv.json'])
  assert.equal(storage.getItem(ACTIVE_KEY), 'pack:F:\\MV\\pack-a\\mv.json')
})
