// 0.5.0: automatic timing — tags, LRCLIB, lyrics engine jobs, alignment,
// sections, calibration editor state and pack writes with backups.
import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readAudioTags, guessFromFileName } from '../.dsh-plugin/shared/mv-tags.mjs'
import { alignLines, compareStarts, linesFromText, linesFromWords, linesToLrc, mergeTimed, tokenize, LOW_CONFIDENCE } from '../.dsh-plugin/shared/mv-align.mjs'
import { createLrclibClient, lrclibUrls, pickLrclib, proxyFromEnv, parseLyricsLookup } from '../.dsh-plugin/shared/mv-lrclib.mjs'
import { ENGINE_MODELS, engineArgs, installEstimate, parseEngineInstall, parseEngineModel, parseEngineTranscribe, parseJobRead, uvInstallSteps } from '../.dsh-plugin/shared/mv-engine-protocol.mjs'
import { createEngineManager, createJobManager, ENGINE_CONSTRAINTS, findUv } from '../.dsh-plugin/shared/mv-engine.mjs'
import { parsePackWriteText, parseAnalysisRead, writePackText, readAnalysis, BACKUP_DIR, BACKUP_KEEP } from '../.dsh-plugin/shared/mv-pack-edit.mjs'
import { detectSections, energyFromSpectrum } from '../.dsh-plugin/shared/mv-sections.mjs'
import { calibReduce, createCalib, exportLines, lineAt, linesToCues, nextUncertain, uncertainCount } from '../.dsh-plugin/client/mv-calib-state.mjs'
import { runAutoMake, saveCalibration } from '../.dsh-plugin/client/mv-auto.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { mvRemoteServices } from '../.dsh-plugin/index.mjs'

const tmp = async t => { const dir = await mkdtemp(join(tmpdir(), 'mvcal-')); t.after(() => rm(dir, { recursive: true, force: true })); return dir }
const ok = value => ({ ok: true, value: { ok: true, value } })
const wrap = fn => async request => { try { return ok(await fn(request)) } catch (error) { return { ok: true, value: { ok: false, error: { message: error.message } } } } }

function id3(frames) {
  const body = Buffer.concat(frames.map(([id, text]) => { const data = Buffer.concat([Buffer.from([3]), Buffer.from(text, 'utf8')]); const head = Buffer.alloc(10); head.write(id, 0, 'latin1'); head.writeUInt32BE(data.length, 4); return Buffer.concat([head, data]) }))
  const size = body.length
  const head = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, (size >> 21) & 0x7f, (size >> 14) & 0x7f, (size >> 7) & 0x7f, size & 0x7f])
  return new Uint8Array(Buffer.concat([head, body, Buffer.alloc(64)]))
}

test('tags: ID3v2 title/artist/album and file-name guesses', () => {
  const tags = readAudioTags(id3([['TIT2', 'world.execute(me);'], ['TPE1', 'Mili'], ['TALB', 'Miracle Milk']]))
  assert.equal(tags.title, 'world.execute(me);'); assert.equal(tags.artist, 'Mili'); assert.equal(tags.album, 'Miracle Milk')
  assert.deepEqual(guessFromFileName('Mili - world.execute(me).mp3'), { artist: 'Mili', title: 'world.execute(me)' })
  assert.equal(readAudioTags(new Uint8Array(16)).title, '')
})

test('lrclib: request fields, urls, pick, proxy and lookup without audio', async () => {
  assert.deepEqual(parseLyricsLookup({ title: ' T ', artist: 'A', duration: 212.4 }), { title: 'T', artist: 'A', album: '', duration: 212.4 })
  assert.throws(() => parseLyricsLookup({ title: 'x', audio: 'AAAA' }), /unexpected fields/)
  assert.throws(() => parseLyricsLookup({ artist: 'x' }), /title is required/)
  const urls = lrclibUrls({ title: 'T', artist: 'A', album: '', duration: 212 })
  assert.equal(urls[0].kind, 'get'); assert.match(urls[0].url, /^https:\/\/lrclib\.net\/api\/get\?track_name=T&artist_name=A&duration=212$/)
  assert.equal(lrclibUrls({ title: 'T' })[0].kind, 'search')
  const best = pickLrclib([{ id: 1, trackName: 'T', duration: 300, syncedLyrics: '[00:01.00]a' }, { id: 2, trackName: 'T', duration: 212.5, plainLyrics: 'a' }, { id: 3, trackName: 'T', duration: 213, syncedLyrics: '[00:01.00]a' }], { title: 'T', duration: 212 })
  assert.equal(best.id, 3)
  assert.equal(proxyFromEnv({ HTTPS_PROXY: 'http://127.0.0.1:7897' }).port, '7897')
  assert.equal(proxyFromEnv({ HTTPS_PROXY: 'http://127.0.0.1:7897', NO_PROXY: 'lrclib.net' }), null)
  const seen = []
  const client = createLrclibClient({ env: {}, get: async url => { seen.push(url); return url.includes('/api/get') ? null : [{ id: 9, trackName: 'T', artistName: 'A', duration: 211, syncedLyrics: '[00:02.00]x' }] } })
  const found = await client.lookup({ title: 'T', artist: 'A', album: '', duration: 212 })
  assert.equal(found.found, true); assert.equal(found.id, 9); assert.equal(found.via, 'search')
  assert.deepEqual(Object.keys(found.sent), ['title', 'artist', 'album', 'duration'])
  assert.ok(seen.every(url => url.startsWith('https://lrclib.net/api/')))
})

test('align: lyric lines get times and confidence from engine words', () => {
  const words = []
  const sung = ['there', 'were', 'no', 'cats', 'here', 'switch', 'on', 'the', 'power', 'line']
  sung.forEach((w, i) => words.push({ w, s: 10 + i * 0.5, e: 10.4 + i * 0.5, p: 0.9 }))
  const lines = alignLines([{ text: 'There were no cats here' }, { text: 'Switch on the power line' }, { text: 'never sung at all' }], words, { duration: 30 })
  assert.equal(lines[0].start, 10); assert.ok(lines[0].confidence >= 0.8)
  assert.equal(lines[1].start, 12.5)
  assert.ok(lines[2].confidence < LOW_CONFIDENCE)
  assert.ok(lines[2].start > lines[1].start)
  const fromWords = linesFromWords(words)
  assert.ok(fromWords.length >= 1)
  assert.deepEqual(tokenize('你好 world'), ['你', '好', 'world'])
  const lrc = linesToLrc([{ start: 1, end: 2, text: 'a', alt: '甲' }, { start: 5, end: 6, text: 'b' }], { title: 'T' })
  assert.match(lrc, /\[00:01\.00\]a\n\[00:01\.00\]甲/)
  assert.match(lrc, /\[00:02\.00\]\n/)
  const cues = parseLyrics('lyrics.lrc', lrc)
  assert.equal(cues[0].en, 'a')
  const text = linesFromText('[00:01.00]a\n[00:03.00]b\n')
  assert.equal(text.timed, true); assert.equal(text.lines.length, 2)
  const { lines: merged } = mergeTimed(text.lines.map(l => ({ ...l, confidence: 0.75, source: 'lrclib' })), [{ ...text.lines[0], start: 1.2, confidence: 0.9 }, { ...text.lines[1], start: 3.1, confidence: 0.9 }])
  assert.ok(merged.every(line => line.confidence >= 0.9))
  const cmp = compareStarts([{ start: 1.1 }, { start: 2.6 }], [{ start: 1 }, { start: 2 }])
  assert.equal(cmp.within05, 0.5)
})

test('engine protocol: confirm cards, model choice, fixed argv and uv steps', () => {
  assert.throws(() => parseEngineInstall({ profile: 'cuda' }), /confirmed/)
  assert.deepEqual(parseEngineInstall({ confirmed: true, profile: 'cpu', model: 'small' }), { confirmed: true, profile: 'cpu', model: 'small' })
  assert.throws(() => parseEngineInstall({ confirmed: true, command: 'pip install evil' }), /unexpected/)
  assert.throws(() => parseEngineModel({ confirmed: true, model: 'tiny-evil' }), /model/)
  assert.throws(() => parseEngineTranscribe({ manifestPath: 'relative/mv.json' }), /absolute/)
  assert.equal(parseEngineTranscribe({ manifestPath: 'C:\\p\\mv.json' }).model, 'large-v3')
  assert.throws(() => parseJobRead({ jobId: '../x' }), /jobId/)
  assert.deepEqual(engineArgs('C:\\e\\dsh_mv_engine.py', 'probe', 'C:\\e\\jobs\\a.json'), ['-X', 'utf8', '-u', 'C:\\e\\dsh_mv_engine.py', 'probe', 'C:\\e\\jobs\\a.json'])
  const steps = uvInstallSteps({ venv: 'C:\\e\\venv', python: 'C:\\e\\venv\\Scripts\\python.exe', profile: 'cuda', constraints: 'C:\\e\\c.txt' })
  assert.deepEqual(steps.map(s => s.id), ['python', 'torch', 'packages'])
  assert.ok(steps[1].args.includes('https://download.pytorch.org/whl/cu126'))
  assert.ok(steps.every(s => !s.args.some(a => /[;&|]/.test(a))))
  const big = installEstimate({ profile: 'cuda', model: 'large-v3' })
  assert.ok(big.downloadMB > 5500 && big.downloadMB < 7000, String(big.downloadMB))
  assert.ok(installEstimate({ profile: 'cpu', model: 'small' }).downloadMB < 1500)
  assert.ok(ENGINE_MODELS.small.downloadMB < ENGINE_MODELS['large-v3'].downloadMB)
  assert.ok(ENGINE_CONSTRAINTS.includes('faster-whisper==1.2.1') && ENGINE_CONSTRAINTS.every(p => /^[a-z0-9-]+==[\w.+]+$/i.test(p)))
})

function fakeSpawn(script) {
  const calls = []
  const spawnImpl = (file, args, options) => {
    const child = new EventEmitter()
    child.stdout = new EventEmitter(); child.stderr = new EventEmitter()
    child.pid = 4242; child.exitCode = null
    child.kill = () => { child.exitCode = 1; setImmediate(() => child.emit('close', 1)) }
    calls.push({ file, args, options, child })
    setImmediate(() => script(child, calls.length - 1, args))
    return child
  }
  return { calls, spawnImpl }
}
const until = async (jobs, jobId) => { let cursor = 0, all = []; for (;;) { const r = await jobs.read({ jobId, cursor, waitMs: 200 }); cursor = r.cursor; all = all.concat(r.events); if (r.done) return { ...r, all } } }

test('job manager: JSON-line progress, results, failures, one job, cancel', async () => {
  const { calls, spawnImpl } = fakeSpawn((child, i) => {
    if (i === 0) { child.stdout.emit('data', Buffer.from('{"type":"progress","stage":"x","ratio":0.5}\n{"type":"res')); child.stdout.emit('data', Buffer.from('ult","value":7}\nplain line\n')); child.exitCode = 0; child.emit('close', 0) }
    else if (i === 1) { child.stderr.emit('data', Buffer.from('Traceback: boom\n')); child.exitCode = 3; child.emit('close', 3) }
  })
  const jobs = createJobManager({ spawnImpl, killTree: () => {} })
  const job = jobs.start({ kind: 't', steps: [{ id: 'a', label: 'A', file: 'py.exe', args: ['-u', 's.py'], json: true }, { id: 'b', label: 'B', file: 'py.exe', args: [], json: true }] })
  assert.throws(() => jobs.start({ kind: 't', steps: [] }), /已有一个/)
  const done = await until(jobs, job.jobId)
  assert.equal(done.ok, false); assert.match(done.error, /B 失败（退出码 3）：Traceback: boom/)
  assert.equal(done.result.a.value, 7)
  assert.ok(done.all.some(e => e.type === 'log' && e.message === 'plain line'))
  assert.equal(calls[0].options.shell, false)
  let killed = 0
  const hang = fakeSpawn(() => {})
  const jobs2 = createJobManager({ spawnImpl: hang.spawnImpl, killTree: () => { killed++; hang.calls[0].child.exitCode = 1; hang.calls[0].child.emit('close', 1) } })
  const started = jobs2.start({ kind: 't', steps: [{ id: 'a', label: 'A', file: 'x', args: [] }, { id: 'b', label: 'B', file: 'x', args: [] }] })
  await new Promise(r => setTimeout(r, 20))
  assert.deepEqual(jobs2.cancel({ jobId: started.jobId }), { cancelled: true })
  const stopped = await until(jobs2, started.jobId)
  assert.equal(stopped.cancelled, true); assert.equal(killed, 1); assert.equal(hang.calls.length, 1)
})

test('engine manager: install runs uv with pinned constraints, then probe and model', async t => {
  const dir = await tmp(t)
  const files = new Set([join('C:', 'uv', 'uv.exe')])
  const { calls, spawnImpl } = fakeSpawn((child, i, args) => {
    if (args.includes('probe')) child.stdout.emit('data', Buffer.from(`${JSON.stringify({ type: 'result', probe: { packages: { 'faster-whisper': '1.2.1', ctranslate2: '4.8.2' }, cuda: true, ctranslate2Cuda: 1, gpu: { name: 'RTX', vramMB: 8188 }, models: { small: true }, demucs: true } })}\n`))
    child.exitCode = 0; child.emit('close', 0)
  })
  const engine = createEngineManager({ dir, jobs: createJobManager({ spawnImpl }), platform: 'win32', env: { LOCALAPPDATA: dir, PATH: '' }, locateUv: async () => 'C:\\uv\\uv.exe', statPath: async p => ({ isFile: () => files.has(p) }) })
  assert.equal((await engine.info()).status, 'missing')
  const started = await engine.install({ profile: 'cuda', model: 'small' })
  assert.deepEqual(started.steps.map(s => s.id), ['python', 'torch', 'packages', 'probe', 'model', 'probe'])
  const done = await until({ read: r => engine.read(r) }, started.jobId)
  assert.equal(done.ok, true, done.error)
  assert.equal(calls[0].file, 'C:\\uv\\uv.exe')
  assert.ok(calls[2].args.includes('--constraints'))
  const constraints = await readFile(join(dir, 'constraints.txt'), 'utf8')
  assert.match(constraints, /^torch==2\.8\.0$/m)
  const prefetch = calls.find(c => c.args.includes('prefetch'))
  const argsFile = JSON.parse(await readFile(prefetch.args.at(-1), 'utf8'))
  assert.deepEqual({ model: argsFile.model, demucs: argsFile.demucs }, { model: 'small', demucs: true })
  assert.equal(prefetch.options.env.HF_HUB_OFFLINE, undefined)
  const probe = calls.find(c => c.args.includes('probe'))
  assert.equal(probe.options.env.HF_HUB_OFFLINE, '1')
  const external = createEngineManager({ dir, jobs: createJobManager({ spawnImpl }), config: () => ({ enginePython: 'D:\\py\\python.exe' }), locateUv: async () => null, statPath: async () => ({ isFile: () => true }) })
  await assert.rejects(external.install({ profile: 'cuda', model: 'small' }), /自己的 Python/)
  assert.equal(await findUv({ configured: '', env: { PATH: '' }, platform: 'linux', statPath: async () => { throw new Error('no') } }), null)
})

test('pack edit: only fixed files, mv.json validated, backups kept (10), analysis reads', async t => {
  const dir = await tmp(t)
  const manifestPath = join(dir, 'mv.json')
  await writeFile(manifestPath, JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'T', audio: { file: 'a.mp3' } }))
  assert.throws(() => parsePackWriteText({ manifestPath, file: '../evil.js', text: '' }), /file must be one of/)
  assert.throws(() => parsePackWriteText({ manifestPath, file: 'scenes.js', text: '' }), /file must be one of/)
  await assert.rejects(writePackText(parsePackWriteText({ manifestPath, file: 'mv.json', text: '{"title":1}' })), /./)
  let n = 0
  const now = () => new Date(Date.UTC(2026, 9, 3, 12, 0, n++))
  for (let i = 0; i < 13; i++) await writePackText({ manifestPath, file: 'lyrics.lrc', text: `[00:0${i % 10}.00]v${i}\n` }, { now })
  const backups = (await readdir(join(dir, BACKUP_DIR))).filter(f => f.startsWith('lyrics.lrc.'))
  assert.equal(backups.length, BACKUP_KEEP)
  assert.match(await readFile(join(dir, 'lyrics.lrc'), 'utf8'), /v12/)
  const saved = await writePackText({ manifestPath, file: 'mv.json', text: JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'T2', audio: { file: 'a.mp3' }, 'x-dsh-mv-ai': { sections: [] } }) })
  assert.ok(saved.backup)
  await mkdir(join(dir, 'analysis'))
  await writeFile(join(dir, 'analysis', 'transcript.json'), '{"words":[]}')
  assert.throws(() => parseAnalysisRead({ manifestPath, name: '../../secret' }), /name must be one of/)
  const read = await readAnalysis(parseAnalysisRead({ manifestPath, name: 'transcript' }))
  assert.equal(Buffer.from(read.base64, 'base64').toString(), '{"words":[]}'); assert.equal(read.done, true)
  assert.equal((await readAnalysis(parseAnalysisRead({ manifestPath, name: 'vocals' }))).exists, false)
})

test('sections: chorus from repetition, instrumental gaps, energy', () => {
  const L = (t, text) => ({ start: t, end: t + 3, text })
  const lines = [L(10, 'walking down the road'), L(13, 'sun is high'), L(20, 'oh oh baby tonight'), L(23, 'we dance all night'), L(40, 'second verse here'), L(43, 'more words'), L(50, 'oh oh baby tonight'), L(53, 'we dance all night'), L(90, 'oh oh baby tonight'), L(93, 'we dance all night')]
  const spectrum = { fps: 1, frames: Array.from({ length: 110 }, (_, s) => new Array(4).fill(s >= 20 && s < 26 ? 0.9 : 0.2)) }
  const sections = detectSections(lines, { duration: 110, energyAt: energyFromSpectrum(spectrum) })
  assert.deepEqual(sections.map(s => s.kind), ['intro', 'verse', 'chorus', 'instrumental', 'verse', 'chorus', 'instrumental', 'chorus', 'outro'])
  assert.ok(sections[2].energy > sections[1].energy)
  assert.deepEqual(detectSections([], { duration: 60 }).map(s => s.kind), ['instrumental'])
})

test('calibration editor state: nudge, drag, tap-sync, split/merge, text, offset, undo/redo, uncertain jump', () => {
  let s = createCalib([{ start: 1, end: 3, text: 'hello there world', confidence: 0.3 }, { start: 4, end: 6, text: '你好世界', confidence: 0.9 }, { start: 8, end: 9, text: 'end', confidence: 0.2 }], { duration: 12 })
  assert.equal(uncertainCount(s), 2)
  assert.equal(nextUncertain(s, 0), 2)
  s = calibReduce(s, { type: 'nudge', delta: 0.05 })
  assert.equal(s.lines[0].start, 1.05); assert.equal(s.lines[0].confidence, 1)
  s = calibReduce(s, { type: 'nudge', index: 0, delta: 0.5, edge: 'end' })
  assert.equal(s.lines[0].end, 3.5)
  s = calibReduce(s, { type: 'setStart', index: 1, time: 0.5 })
  assert.ok(s.lines[1].start > s.lines[0].start, 'order kept')
  s = calibReduce(s, { type: 'undo' })
  s = calibReduce(s, { type: 'tap', index: 1, time: 3.2 })
  assert.equal(s.lines[1].start, 3.2); assert.equal(s.lines[0].end, 3.2); assert.equal(s.selected, 2)
  s = calibReduce(s, { type: 'split', index: 1 })
  assert.deepEqual(s.lines.slice(1, 3).map(l => l.text), ['你好', '世界'])
  s = calibReduce(s, { type: 'merge', index: 1 })
  assert.equal(s.lines[1].text, '你好世界')
  s = calibReduce(s, { type: 'text', index: 2, text: 'the end' })
  assert.equal(s.lines[2].text, 'the end')
  s = calibReduce(s, { type: 'offset', value: 0.25 })
  assert.equal(exportLines(s)[0].start, 1.3)
  assert.equal(lineAt(s, 3.5), 1)
  const before = s.lines.map(l => l.start)
  s = calibReduce(s, { type: 'undo' }); s = calibReduce(s, { type: 'undo' })
  s = calibReduce(s, { type: 'redo' }); s = calibReduce(s, { type: 'redo' })
  assert.deepEqual(s.lines.map(l => l.start), before)
  assert.equal(uncertainCount(s), 0)
  assert.deepEqual(linesToCues([{ start: 1, end: 2, text: 'a', alt: 'b' }]), [{ time: 1, end: 2, en: 'a', zh: 'b' }])
})

test('auto make: pack → LRCLIB synced → (engine skipped) → align → sections → save', async t => {
  const dir = await tmp(t)
  const manifestPath = join(dir, 'mv.json')
  await writeFile(manifestPath, JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'T', audio: { file: 'a.mp3' }, 'x-dsh-mv-ai': { status: 'waiting-for-agent' } }))
  const services = mvRemoteServices({ lrclib: true }, undefined, {
    lrclib: { lookup: async q => ({ found: true, sent: q, synced: '[00:05.00]oh oh baby\n[00:09.00]dance tonight\n[00:20.00]oh oh baby\n[00:24.00]dance tonight\n', id: 1 }) },
  })
  const api = Object.fromEntries(Object.entries(services).map(([k, fn]) => [k, wrap(fn)]))
  const steps = []
  const made = { created: { packDir: dir, manifestPath }, duration: 40, prompt: 'PROMPT', spectrum: null }
  const result = await runAutoMake(api, { file: {}, title: 'T', artist: 'A', useLrclib: true, useEngine: false, model: 'small' }, { onStep: (id, state) => steps.push(`${id}:${state}`), deps: { createAiPack: async () => made } })
  assert.deepEqual(steps.filter(s => !s.endsWith('running')), ['pack:done', 'lrclib:done', 'engine:skipped', 'align:done', 'sections:done', 'save:done'])
  assert.equal(result.lines.length, 4)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.deepEqual(manifest.lyrics, { file: 'lyrics.lrc', offset: 0 })
  assert.equal(manifest['x-dsh-mv-ai'].status, 'waiting-for-agent')
  assert.ok(manifest['x-dsh-mv-ai'].sections.some(s => s.kind === 'chorus'))
  assert.match(await readFile(join(dir, 'lyrics.lrc'), 'utf8'), /\[00:05\.00\]oh oh baby/)
  assert.match(result.prompt, /不要重新估计或改动时间轴/)
  const off = mvRemoteServices({ lrclib: false }, undefined, { lrclib: { lookup: async () => ({ found: true }) } })
  await assert.rejects(off.lyricsLookup({ title: 'x' }), /已在插件设置里关闭/)
  const ac = new AbortController(); ac.abort()
  await assert.rejects(runAutoMake(api, { file: {}, title: 'T' }, { signal: ac.signal, deps: { createAiPack: async () => made } }), /已停止/)
  await saveCalibration(api, manifestPath, { lines: result.lines, title: 'T' })
  assert.ok((await readdir(join(dir, BACKUP_DIR))).some(f => f.startsWith('mv.json.')))
})
