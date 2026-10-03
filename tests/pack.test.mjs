// MV packs: manifest parsing/validation, placeholder substitution, Host loading,
// launches (exact argv, confirmation binding, cmd.exe safety), template and zip.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  MvPackError, parseMvPack, substitute, expandPackArgs, placeholdersOf, cmdSafetyProblems, parsePackLaunch, parsePackRead, numberArg, CMD_UNSAFE,
} from '../.dsh-plugin/shared/mv-pack.mjs'
import { loadPack, readPackFile, resolvePackLaunch, writeTemplate } from '../.dsh-plugin/shared/mv-pack-host.mjs'
import { templateFiles, TEMPLATE_MANIFEST, TERMINAL_EXAMPLE, WORLD_EXECUTE_ME_EXAMPLE, MV_PACK_JSON_SCHEMA } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { parseMvLaunch } from '../.dsh-plugin/shared/mv-terminal-protocol.mjs'
import { createMvTerminalManager, resolveMvLaunch } from '../.dsh-plugin/shared/mv-terminal.mjs'
import { createMvConsoleManager } from '../.dsh-plugin/shared/mv-console.mjs'
import { MvRemoteService } from '../.dsh-plugin/remote-service.mjs'
import { MV_REMOTE_DESCRIPTORS, MV_REMOTE_NAMESPACE } from '../.dsh-plugin/shared/mv-remote.mjs'
import { mvRemoteServices } from '../.dsh-plugin/index.mjs'
import { gatewayClient } from './helpers/typert-gateway.mjs'
import { fakePty } from './helpers/fake-pty.mjs'
import { unwrapRemote } from '../.dsh-plugin/client/remote-state.mjs'
import { EMPTY_FORM, checkLaunch, startSession, formProblem, launchFromForm, confirmationDetails, consoleProblem } from '../.dsh-plugin/client/mv-terminal-state.mjs'
import { crc32, zipFiles, templateZip, fetchPackText, loadRecent, rememberPack, forgetPack } from '../.dsh-plugin/client/mv-pack-state.mjs'
import { GenericFilm, genericChapters } from '../.dsh-plugin/client/mv/generic-film.mjs'

const base = { format: 'dsh-mv-pack', version: 1, title: 'Song' }
const problemsOf = input => { try { parseMvPack(input); return [] } catch (error) { assert.ok(error instanceof MvPackError); return error.problems } }

test('pack: template manifests are valid and minimal packs normalise', () => {
  for (const manifest of [TEMPLATE_MANIFEST, TERMINAL_EXAMPLE, WORLD_EXECUTE_ME_EXAMPLE]) parseMvPack(JSON.stringify(manifest))
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

test('pack: terminal validation (programs, placeholders, groups)', () => {
  const term = (terminal, extra = {}) => problemsOf({ ...base, ...extra, terminal })
  assert.deepEqual(term({ program: 'p.exe', args: ['--x'] }), [])
  assert.ok(term({ program: 'run.bat', args: [] }).some(p => /\.bat/.test(p)))
  assert.ok(term({ program: 'run.ps1', args: [] }).some(p => /\.ps1/.test(p)))
  assert.ok(term({ program: 'p.exe', args: 'a b' }).some(p => /必须是数组/.test(p)))
  assert.ok(term({ program: 'p.exe', args: ['{nope}'] }).some(p => /未知占位符 \{nope\}/.test(p)))
  assert.ok(term({ program: 'p.exe', args: ['{audio}'] }).some(p => /\{audio\}，但清单没有/.test(p)))
  assert.deepEqual(term({ program: 'p.exe', args: [{ when: 'audio', args: ['--a', '{audio}'] }] }), [], 'conditional group allows {audio}')
  assert.deepEqual(term({ program: 'p.exe', args: ['--a', '{audio}'] }, { audio: 'a.mp3' }), [])
  assert.ok(term({ program: 'p.exe', args: ['{script}'] }).some(p => /terminal\.script/.test(p)))
  assert.ok(term({ program: 'p.exe', args: ['a{b'] }).some(p => /缺少 \}/.test(p)))
  assert.ok(term({ program: 'p.exe', args: ['a}b'] }).some(p => /多余的 \}/.test(p)))
  assert.ok(term({ program: 'p.exe', args: ['a\nb'] }).some(p => /换行/.test(p)))
  assert.ok(term({ program: 'p.exe', args: [{ when: 'weather', args: ['x'] }] }).some(p => /when/.test(p)))
  assert.ok(term({ program: 'p.exe', args: [], cwd: 'script' }).some(p => /cwd 为 script/.test(p)))
  assert.ok(term({ program: 'p.exe', args: new Array(65).fill('x') }).some(p => /最多 64/.test(p)))
  assert.deepEqual(placeholdersOf('{{x}} {audio}-{start}'), ['audio', 'start'])
})

test('pack: placeholder substitution and argument expansion', () => {
  assert.equal(substitute('--file={audio}', { audio: 'C:\\a b\\s.mp3' }), '--file=C:\\a b\\s.mp3')
  assert.equal(substitute('{{literal}}', {}), '{literal}')
  assert.throws(() => substitute('{lyrics}', {}), /没有值/)
  assert.throws(() => substitute('{bad}', {}), /未知占位符/)
  assert.equal(numberArg(1.23456), '1.235')
  assert.equal(numberArg(-0), '0')
  const args = ['{script}', { when: 'audio', args: ['--audio', '{audio}'] }, { when: 'start', args: ['--start', '{start}'] }, { when: 'offset', args: ['--offset', '{offset}'] }, '--dir', '{packDir}']
  assert.deepEqual(expandPackArgs(args, { script: '/p/s.py', packDir: '/p', start: 0, offset: 0 }), ['/p/s.py', '--dir', '/p'])
  assert.deepEqual(expandPackArgs(args, { script: '/p/s.py', audio: '/p/a.mp3', packDir: '/p', start: 12.5, offset: -0.25 }),
    ['/p/s.py', '--audio', '/p/a.mp3', '--start', '12.5', '--offset', '-0.25', '--dir', '/p'])
  assert.throws(() => expandPackArgs(['{audio}'], { audio: 'x\ny' }), /换行/)
})

test('pack: cmd.exe safety rejects metacharacters and %, allows parentheses', () => {
  assert.deepEqual(cmdSafetyProblems('D:\\p.exe', ['D:\\Music\\world.execute(me).mp3', '--start', '3'], 'D:\\'), [])
  for (const bad of ['100%.mp3', 'a&b', 'a|b', 'a<b', 'a>b', 'a^b', 'a!b', 'a"b']) {
    assert.ok(CMD_UNSAFE.test(bad), bad)
    assert.equal(cmdSafetyProblems('D:\\p.exe', [bad], 'D:\\').length, 1, bad)
  }
  assert.equal(cmdSafetyProblems('D:\\50%\\p.exe', [], 'D:\\').length, 1)
})

test('pack: launch and read requests carry only a manifest path and numbers', () => {
  assert.deepEqual(parseMvLaunch({ player: 'pack', manifestPath: '/m/mv.json', start: 3 }), { player: 'pack', manifestPath: '/m/mv.json', start: 3, offset: 0 })
  assert.throws(() => parseMvLaunch({ player: 'pack', manifestPath: '/m/mv.json', program: 'calc.exe' }), /unexpected fields: program/)
  assert.throws(() => parsePackLaunch({ manifestPath: 'relative/mv.json' }), /绝对路径/)
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

const PLAYER_PACK = {
  ...base, artist: 'A', audio: { file: 'song.mp3', offset: 0.5 }, lyrics: { file: 'lyrics.lrc' },
  terminal: { program: 'bin/player', script: 'play.py', args: ['{script}', { when: 'audio', args: ['--audio', '{audio}'] }, '--offset', '{offset}', { when: 'start', args: ['--start', '{start}'] }] },
}
const PLAYER_FILES = { 'song.mp3': Buffer.alloc(1_300_000, 7), 'lyrics.lrc': '[00:01.00]Hello\n[00:01.00]你好\n', 'bin/player': '#!/bin/true\n', 'play.py': 'print(1)\n' }

test('pack host: load reports files and warnings, runs nothing', async () => {
  const dir = fixture({ ...PLAYER_PACK, spectrum: { file: 'spectrum.json' } }, PLAYER_FILES)
  try {
    const loaded = await loadPack(dir)
    assert.equal(loaded.manifestPath, join(dir, 'mv.json'))
    assert.equal(loaded.files.audio.exists, true)
    assert.equal(loaded.files.audio.size, 1_300_000)
    assert.equal(loaded.files.spectrum.exists, false)
    assert.match(loaded.warnings.join(), /spectrum 文件不存在/)
    assert.equal(loaded.terminal.program, join(dir, 'bin', 'player'))
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

test('pack host: exact argv, Windows .exe rule, confirmation bound to the command', async () => {
  const dir = fixture(PLAYER_PACK, PLAYER_FILES)
  try {
    const manifestPath = join(dir, 'mv.json')
    const resolved = await resolvePackLaunch({ player: 'pack', manifestPath, start: 30, offset: 0.25 }, { platform: 'linux' })
    assert.equal(resolved.file, join(dir, 'bin', 'player'))
    assert.deepEqual(resolved.args, [join(dir, 'play.py'), '--audio', join(dir, 'song.mp3'), '--offset', '0.75', '--start', '30'])
    assert.equal(resolved.cwd, dir)
    await assert.rejects(resolvePackLaunch({ player: 'pack', manifestPath }, { platform: 'win32' }), /必须是 \.exe/)
    await resolvePackLaunch({ player: 'pack', manifestPath, start: 30, offset: 0.25, expectDisplay: resolved.display }, { platform: 'linux' })
    writeFileSync(manifestPath, JSON.stringify({ ...PLAYER_PACK, terminal: { ...PLAYER_PACK.terminal, args: ['--evil'] } }))
    await assert.rejects(resolvePackLaunch({ player: 'pack', manifestPath, start: 30, offset: 0.25, expectDisplay: resolved.display }, { platform: 'linux' }), /确认之后发生了变化/)
    rmSync(join(dir, 'play.py'))
    await assert.rejects(resolvePackLaunch({ player: 'pack', manifestPath }, { platform: 'linux' }), /找不到脚本文件/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

function packHarness() {
  const pty = fakePty()
  const terminals = createMvTerminalManager({
    loadPty: () => ({ ok: true, pty: pty.module, package: '@lydell/node-pty' }),
    resolveLaunch: launch => resolveMvLaunch(launch, { platform: 'linux' }),
    environment: () => ({ PATH: '/bin' }), setRepeating: () => ({ unref() {} }), clearRepeating: () => {},
  })
  const service = Object.create(MvRemoteService.prototype)
  service.services = mvRemoteServices(terminals, {})
  return { api: gatewayClient(MV_REMOTE_DESCRIPTORS, service, MV_REMOTE_NAMESPACE), pty, terminals }
}

test('pack gateway: import, check, confirm, start — and nothing runs without the confirmed command', async () => {
  const dir = fixture(PLAYER_PACK, PLAYER_FILES)
  const { api, pty, terminals } = packHarness()
  try {
    const loaded = unwrapRemote(await api.packLoad({ path: dir }))
    assert.equal(loaded.pack.title, 'Song')
    assert.equal(pty.spawned.length, 0, 'import runs nothing')
    const pack = { id: `pack:${loaded.manifestPath}`, ...loaded }
    const form = { ...EMPTY_FORM, player: 'pack', packStart: '5' }
    assert.equal(formProblem(form, { pack }), '')
    assert.match(formProblem(form, { pack: { ...pack, terminal: null } }), /没有配置外部渲染程序/)
    assert.deepEqual(launchFromForm(form, { pack }), { player: 'pack', manifestPath: loaded.manifestPath, start: 5 })
    await assert.rejects(startSession(api, form, {}, { pack }), /先检查并确认/)
    const raw = unwrapRemote.bind(null, await api.terminalStart({ player: 'pack', manifestPath: loaded.manifestPath, cols: 80, rows: 24, confirmed: true }))
    assert.throws(raw, /确认它的完整命令/)
    assert.equal(pty.spawned.length, 0)
    const checked = await checkLaunch(api, form, { pack })
    assert.deepEqual(checked.args, [join(dir, 'play.py'), '--audio', join(dir, 'song.mp3'), '--offset', '0.5', '--start', '5'])
    const details = confirmationDetails(form, checked, { pack })
    assert.equal(details.command, checked.display)
    assert.match(details.points[0], /任意程序/)
    await startSession(api, form, { cols: 100, rows: 30 }, { pack, checked })
    assert.equal(pty.spawned.length, 1)
    assert.equal(pty.spawned[0].file, join(dir, 'bin', 'player'))
    assert.deepEqual(pty.spawned[0].args, checked.args)
    const chunk = unwrapRemote(await api.packRead({ manifestPath: loaded.manifestPath, role: 'audio', offset: 0, length: 16 }))
    assert.equal(chunk.bytes, 16)
  } finally { terminals.disposeAll(); rmSync(dir, { recursive: true, force: true }) }
})

test('pack console: cmd.exe mode refuses metacharacters before anything is spawned', async () => {
  let spawned = 0
  const consoles = createMvConsoleManager({
    platform: 'win32',
    resolveLaunch: async () => ({ file: 'D:\\p\\player.exe', args: ['--title', 'Rock & Roll'], cwd: 'D:\\p', display: 'x', pack: { title: 'T' } }),
    spawnImpl: () => { spawned++; throw new Error('must not spawn') },
    probes: { children: async () => [], processPath: async () => null, killTree: async () => 0 },
    env: { SystemRoot: 'C:\\Windows' }, wait: async () => {},
  })
  await assert.rejects(consoles.start({ launch: { player: 'pack', manifestPath: 'D:\\p\\mv.json', expectDisplay: 'x' }, confirmed: true }), /cmd\.exe）模式拒绝的字符 "&"/)
  await assert.rejects(consoles.start({ launch: { player: 'pack', manifestPath: 'D:\\p\\mv.json' }, confirmed: true }), /确认它的完整命令/)
  await assert.rejects(consoles.start({ launch: { player: 'pack', manifestPath: 'D:\\p\\mv.json', expectDisplay: 'x' }, confirmed: false }), /确认/)
  assert.equal(spawned, 0)
  const pack = { pack: { title: 'T' }, manifestPath: 'D:\\p\\mv.json', terminal: { label: 'p' } }
  assert.match(consoleProblem({ ...EMPTY_FORM, player: 'pack' }, { platform: 'win32', pack, checked: { file: 'D:\\p\\p.exe', args: ['50%'], cwd: 'D:\\p' } }), /%/)
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
    for (const word of ['{audio}', '{start}', 'when', '% ! " ^ & | < >']) assert.ok(readme.includes(word), word)
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
  assert.equal(list.length, 8)
  assert.equal(list[0].title, 'again')
  assert.equal(list.filter(item => item.manifestPath.toLowerCase() === 'd:\\p3\\mv.json').length, 1)
  assert.equal(forgetPack(list[0].manifestPath, storage).length, 7)
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
