// MV packs: manifest parsing/validation, Host loading and chunked reads,
// the ignored pre-0.6.0 "terminal" section, template and zip.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MvPackError, parseMvPack, parsePackRead, parsePackLoad } from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadPack, readPackFile, writeTemplate, TERMINAL_IGNORED } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { templateFiles, TEMPLATE_MANIFEST, WORLD_EXECUTE_ME_EXAMPLE, DSH_PV_EXAMPLE, MV_PACK_JSON_SCHEMA } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { MvRemoteService } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { defaultPackOps, mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { unwrapRemote } from '../.dsh-plugin/client/remote-state.mjs'
import { crc32, zipFiles, templateZip, fetchPackText, loadRecent, rememberPack, forgetPack } from '../.dsh-plugin/client/mv-pack-state.mjs'
import { GenericFilm, genericChapters } from '../.dsh-plugin/client/mv/generic-film.mjs'

const base = { format: 'dsh-mv-pack', version: 1, title: 'Song' }
const problemsOf = input => { try { parseMvPack(input); return [] } catch (error) { assert.ok(error instanceof MvPackError); return error.problems } }

test('pack: template manifests are valid and minimal packs normalise', () => {
  for (const manifest of [TEMPLATE_MANIFEST, WORLD_EXECUTE_ME_EXAMPLE, DSH_PV_EXAMPLE]) parseMvPack(JSON.stringify(manifest))
  const pack = parseMvPack({ ...base, audio: 'music/song.mp3', 'x-mine': 1 })
  assert.deepEqual(pack.audio, { file: 'music/song.mp3', offset: 0 })
  assert.equal(pack.canvas.renderer, 'generic')
  assert.equal(pack.terminal, undefined)
  assert.equal(parseMvPack({ ...base, audio: { file: '.\\a\\\\b.mp3' } }).audio.file, 'a/b.mp3')
  assert.equal(parseMvPack({ ...base, audio: { file: 'D:\\Music\\x (live).mp3' } }).audio.file, 'D:\\Music\\x (live).mp3')
  assert.equal(parseMvPack('\uFEFF' + JSON.stringify(base)).title, 'Song', 'BOM tolerated')
})

test('pack: every problem is reported', () => {
  assert.match(problemsOf('{nope').join(), /不是有效的 JSON/)
  const problems = problemsOf({ format: 'x', version: 2, tilte: 'typo', audio: { file: '../up.mp3' }, lyrics: { file: 'a.doc' }, spectrum: 's.txt', canvas: { renderer: 'fancy' } })
  for (const pattern of [/format/, /version/, /title 必填/, /未知字段 "tilte"/, /不能含 \.\./, /lyrics\.file/, /spectrum\.file/, /canvas\.renderer/]) {
    assert.ok(problems.some(p => pattern.test(p)), `${pattern} in ${problems.join(' | ')}`)
  }
  assert.ok(problemsOf({ ...base, audio: { file: 'a.mp3', offset: 99 } }).some(p => /audio\.offset/.test(p)))
  assert.ok(problemsOf({ ...base, audio: { file: 'a|b.mp3' } }).some(p => /不允许的字符/.test(p)))
})

test('pack: a pre-0.6.0 "terminal" section is ignored with a warning, never run', async () => {
  const old = { ...base, audio: 'song.mp3', terminal: { program: 'bin/player.exe', script: 'play.py', args: ['{script}', '--audio', '{audio}'] } }
  const pack = parseMvPack(old)
  assert.equal(pack.terminal, undefined)
  assert.deepEqual(pack.ignored, ['terminal'])
  assert.equal(parseMvPack({ ...base, terminal: 'anything at all' }).ignored[0], 'terminal', 'not validated any more')
  const dir = fixture(old, { 'song.mp3': Buffer.alloc(16) })
  try {
    const loaded = await loadPack(dir)
    assert.ok(loaded.warnings.includes(TERMINAL_IGNORED))
    assert.equal(JSON.stringify(loaded).includes('player.exe'), false, 'the program path never reaches the panel')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('pack: read and load requests carry only a manifest path, a role and numbers', () => {
  assert.throws(() => parsePackLoad({ path: '/m', program: 'calc.exe' }), /unexpected fields: program/)
  assert.throws(() => parsePackRead({ manifestPath: '/m/mv.json', role: 'program' }), /role/)
  assert.throws(() => parsePackRead({ manifestPath: '/m/mv.json', role: 'audio', length: 10 * 1024 * 1024 }), /length/)
})

function fixture(manifest, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mv-pack-'))
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true })
    writeFileSync(join(dir, name), body)
  }
  writeFileSync(join(dir, 'mv.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest))
  return dir
}

const PLAYER_PACK = { ...base, artist: 'A', audio: { file: 'song.mp3', offset: 0.5 }, lyrics: { file: 'lyrics.lrc' } }
const PLAYER_FILES = { 'song.mp3': Buffer.alloc(1_300_000, 7), 'lyrics.lrc': '[00:01.00]Hello\n[00:01.00]你好\n' }

test('pack host: load reports files and warnings, runs nothing', async () => {
  const dir = fixture({ ...PLAYER_PACK, spectrum: { file: 'spectrum.json' } }, PLAYER_FILES)
  try {
    const loaded = await loadPack(dir)
    assert.equal(loaded.manifestPath, join(dir, 'mv.json'))
    assert.equal(loaded.files.audio.exists, true)
    assert.equal(loaded.files.audio.size, 1_300_000)
    assert.equal(loaded.files.spectrum.exists, false)
    assert.match(loaded.warnings.join(), /spectrum 文件不存在/)
    assert.equal(JSON.stringify(loaded).includes('undefined'), false)
    await assert.rejects(loadPack(join(dir, 'song.mp3')), /\.json/)
    await assert.rejects(loadPack(join(dir, 'missing')), /找不到/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('pack host: chunked reads of the files the manifest names', async () => {
  const dir = fixture(PLAYER_PACK, PLAYER_FILES)
  try {
    const manifestPath = join(dir, 'mv.json')
    const first = await readPackFile({ manifestPath, role: 'audio', offset: 0, length: 524288 })
    assert.equal(first.bytes, 524288); assert.equal(first.done, false); assert.equal(first.size, 1_300_000)
    const last = await readPackFile({ manifestPath, role: 'audio', offset: 1_048_576, length: 524288 })
    assert.equal(last.bytes, 1_300_000 - 1_048_576); assert.equal(last.done, true)
    assert.equal(Buffer.from(last.base64, 'base64')[0], 7)
    await assert.rejects(readPackFile({ manifestPath, role: 'spectrum', offset: 0, length: 10 }), /没有配置 spectrum/)
    // Client side: reassemble text through the same API shape.
    const api = { packRead: async request => ({ ok: true, value: { ok: true, value: await readPackFile(request) } }) }
    const text = await fetchPackText(api, manifestPath, 'lyrics', { decode: b64 => new Uint8Array(Buffer.from(b64, 'base64')) })
    assert.equal(text.text, PLAYER_FILES['lyrics.lrc'])
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('pack gateway: import and read through the Typert boundary', async () => {
  const dir = fixture(PLAYER_PACK, PLAYER_FILES)
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices({}, defaultPackOps, {})
  const api = gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE)
  try {
    const loaded = unwrapRemote(await api.packLoad({ path: dir }))
    assert.equal(loaded.pack.title, 'Song')
    const chunk = unwrapRemote(await api.packRead({ manifestPath: loaded.manifestPath, role: 'audio', offset: 0, length: 16 }))
    assert.equal(chunk.bytes, 16)
    assert.equal((await api.packRead({ manifestPath: loaded.manifestPath, role: 'audio', command: 'x' })).ok, false)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('pack template: written into a new folder, never overwriting, and every manifest parses', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-mv-template-'))
  try {
    const first = await writeTemplate({ dir })
    const second = await writeTemplate({ dir })
    assert.equal(first.path, join(dir, 'dsh-mv-pack-template'))
    assert.equal(second.path, join(dir, 'dsh-mv-pack-template (2)'))
    assert.equal(first.files.length, templateFiles().length)
    parseMvPack(readFileSync(join(first.path, 'mv.json'), 'utf8'))
    for (const name of readdirSync(join(first.path, 'examples')).filter(name => name.endsWith('.json'))) parseMvPack(readFileSync(join(first.path, 'examples', name), 'utf8'))
    assert.match(readFileSync(join(first.path, 'examples', 'scenes.example.js'), 'utf8'), /function render\(t, cols, rows, ctx\)/)
    assert.equal(JSON.parse(readFileSync(join(first.path, 'mv.schema.json'), 'utf8')).$id, MV_PACK_JSON_SCHEMA.$id)
    const readme = readFileSync(join(first.path, 'README.zh.md'), 'utf8')
    for (const word of ['renderer', 'dsh-pv', 'x-', 'terminal']) assert.ok(readme.includes(word), word)
    await assert.rejects(writeTemplate({ dir: join(dir, 'nope') }), /不是已存在的文件夹/)
    const loaded = await loadPack(first.path)
    assert.match(loaded.warnings.join(), /audio 文件不存在/, 'the template expects your own song.mp3')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('pack zip: valid store-only archive', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
  const zip = zipFiles([{ path: 'a/中文.txt', text: 'hi' }, { path: 'b.json', text: '{}' }])
  const view = new DataView(zip.buffer)
  assert.equal(view.getUint32(0, true), 0x04034b50)
  const end = zip.length - 22
  assert.equal(view.getUint32(end, true), 0x06054b50)
  assert.equal(view.getUint16(end + 10, true), 2)
  const centralOffset = view.getUint32(end + 16, true)
  assert.equal(view.getUint32(centralOffset, true), 0x02014b50)
  assert.ok(templateZip().length > 5000)
})

test('pack recent list: most recent first, de-duplicated, bounded', () => {
  const store = new Map()
  const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) }
  for (let i = 0; i < 10; i++) rememberPack({ manifestPath: `D:\\p${i}\\mv.json`, pack: { title: `T${i}` } }, { storage, now: () => i })
  rememberPack({ manifestPath: 'd:\\P3\\MV.JSON', pack: { title: 'again' } }, { storage, now: () => 99 })
  const list = loadRecent(storage)
  assert.equal(list.length, 10) // bounded at MV_PACK_LIMITS.recentPacks (50 since 0.8.2; see skin.test.mjs)
  assert.equal(list[0].title, 'again')
  assert.equal(list.filter(item => item.manifestPath.toLowerCase() === 'd:\\p3\\mv.json').length, 1)
  assert.equal(forgetPack(list[0].manifestPath, storage).length, 9)
})

test('generic renderer: title, lyrics, next line, progress; chapters split the song', () => {
  const film = new GenericFilm({ title: 'My Song', artist: 'Someone', duration: 100, energy: () => new Array(48).fill(0.5),
    lyrics: [{ time: 10, end: 14, en: 'Hello world', zh: '你好世界' }, { time: 14, end: 18, en: 'Next line', zh: '' }] })
  const text = film.render(11, 80, 30, { hintText: 'SPACE' }).plain()
  assert.match(text, /My Song — Someone/)
  assert.match(text, /Hello world/)
  assert.match(text, /你 好 世 界|你好世界/)
  assert.match(text, /Next line/)
  assert.match(text, /00:11 \/ 01:40/)
  assert.match(text, /=+-+/)
  assert.match(text, /[@#%]/, 'spectrum bars drawn')
  assert.match(film.render(0, 80, 30, { ready: true }).plain(), /SPACE \/ ENTER TO START/)
  assert.match(film.render(0, 30, 10).plain(), /请放大窗口/)
  assert.deepEqual(genericChapters(100).map(c => c[0]), [0, 20, 40, 60, 80])
})

test('pack: canvas renderer "script" needs a .js/.mjs scene inside the pack', () => {
  const scripted = parseMvPack({ ...base, audio: 'a.m4a', canvas: { script: 'scenes.js' } })
  assert.equal(scripted.canvas.renderer, 'script', 'script implies the script renderer')
  assert.ok(problemsOf({ ...base, canvas: { renderer: 'script' } }).length > 0)
  assert.ok(problemsOf({ ...base, canvas: { renderer: 'script', script: 'scenes.py' } }).length > 0)
  assert.ok(problemsOf({ ...base, canvas: { renderer: 'script', script: '../x.js' } }).length > 0)
  assert.ok(problemsOf({ ...base, canvas: { renderer: 'rust' } }).length > 0)
})
