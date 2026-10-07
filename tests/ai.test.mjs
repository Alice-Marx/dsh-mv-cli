// 0.4.0: "用 AI 制作新 MV" — pack creation, uploads, agent tools, scene
// sandboxes (node:vm for the Host preview, Web Worker source for the panel),
// spectrum and the Harness session hand-off.
import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createAiPackManager, aiPacksDir, parsePackUploadBegin } from '../.dsh-plugin/shared/mv-ai-pack.mjs'
import { buildMvAgentTools, previewFrameForAgent, validatePackForAgent } from '../.dsh-plugin/shared/mv-agent-tools.mjs'
import { agentPrompt, packSlug, parseAiPackCreate, AI_TOOL_NAMES } from '../.dsh-plugin/shared/mv-ai-prompt.mjs'
import { checkScene, compileScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { EXAMPLE_SCENE, SCENE_BLOCKED_GLOBALS, sceneSourceProblems, sceneWorkerSource, SCENE_LIMITS } from '../.dsh-plugin/shared/mv-scene.mjs'
import { parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { registerAgentTools } from '../.dsh-plugin/index.mjs'
import { computeSpectrum, createAiPack, inspectAiAudio, sessionSupport, startAgentSession, SessionApiMissing } from '../.dsh-plugin/client/mv-ai-state.mjs'
import { ScriptFilm } from '../.dsh-plugin/client/mv/script-film.mjs'
import { encodeWav } from '../.dsh-plugin/client/mv-wav.mjs'

const wrap = fn => async request => { try { return { ok: true, value: { ok: true, value: await fn(request) } } } catch (error) { return { ok: true, value: { ok: false, error: { message: error.message } } } } }
const b64 = text => Buffer.from(text).toString('base64')

async function made(t) {
  const root = await mkdtemp(join(tmpdir(), 'mvai-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return { root, packs: createAiPackManager({ root, version: '0.4.0' }) }
}

test('agent preview merges asset shards exactly as playback (first metadata, concatenated arrays)', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mvai-assets-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await writeFile(join(root, 'one.json'), '{"label":"first","values":[1]}')
  await writeFile(join(root, 'two.json'), '{"label":"last","values":[2]}')
  await writeFile(join(root, 'scene.js'), 'let data;function setup(info){data=info.assets.mesh}function render(t,c,r){return [data.label+":"+data.values.join(",")]}')
  await writeFile(join(root, 'mv.json'), JSON.stringify({format:'dsh-mv-pack',version:1,title:'assets',canvas:{renderer:'script',script:'scene.js',assets:{mesh:['one.json','two.json']}}}))
  const preview = await previewFrameForAgent({ path: root })
  assert.equal(preview.ok, true, preview.problems.join('\n'))
  assert.equal(preview.frame.split('\n')[0], 'first:1,2')
})

test('ai pack: request parsing and slugs', () => {
  assert.throws(() => parseAiPackCreate({ title: '', audioExt: '.mp3' }), /歌名|title/)
  assert.throws(() => parseAiPackCreate({ title: 'x', audioExt: '.exe' }))
  assert.throws(() => parseAiPackCreate({ title: 'x', audioExt: '.mp3', parentDir: 'relative' }))
  assert.throws(() => parseAiPackCreate({ title: 'x', audioExt: '.mp3', command: 'calc' }))
  assert.equal(packSlug('a/b:c*?"<>|'), packSlug('a b c'))
  assert.ok(!/[\\/:*?"<>|]/.test(packSlug('CON: 歌 / 名')))
  assert.match(aiPacksDir({ LOCALAPPDATA: 'C:\\L' }, 'win32').replace(/\//g, '\\'), /^C:\\L\\dsh-mv\\packs$/)
})

test('ai pack: create → upload audio and spectrum → validate and preview', async t => {
  const { root, packs } = await made(t)
  const created = await packs.create({ title: '测试 Song', artist: 'Me', lyrics: 'hello\nworld', style: '赛博朋克', audioExt: '.m4a', duration: 120 })
  assert.ok(created.packDir.startsWith(root))
  const names = await readdir(created.packDir)
  for (const name of ['mv.json', 'mv.schema.json', 'AGENT.md', 'README.md', 'scenes.js', 'brief.json', 'lyrics.txt']) assert.ok(names.includes(name), name)
  assert.ok(!names.some(name => /\.(mp3|m4a|wav)$/.test(name)), 'no media before the upload')
  const again = await packs.create({ title: '测试 Song', audioExt: '.m4a' })
  assert.notEqual(again.packDir, created.packDir, 'never reuses a folder')

  // Writes only into folders this Host created, under fixed names, never overwriting.
  await assert.rejects(packs.uploadBegin({ packDir: root, role: 'audio', bytes: 4 }), /本次由插件创建/)
  assert.throws(() => parsePackUploadBegin({ packDir: created.packDir, role: 'scene', bytes: 4 }), /role/)
  assert.throws(() => parsePackUploadBegin({ packDir: created.packDir, role: 'audio', bytes: 4, name: '..\\x.exe' }))
  const audio = await packs.uploadBegin({ packDir: created.packDir, role: 'audio', bytes: 4 })
  await assert.rejects(packs.uploadWrite({ uploadId: audio.uploadId, offset: 2, base64: b64('ab') }), /顺序/)
  const audio2 = await packs.uploadBegin({ packDir: created.packDir, role: 'audio', bytes: 4 })
  await packs.uploadWrite({ uploadId: audio2.uploadId, offset: 0, base64: b64('abcd') })
  await packs.uploadFinish({ uploadId: audio2.uploadId })
  assert.equal(await readFile(join(created.packDir, 'audio.m4a'), 'utf8'), 'abcd')
  const dup = await packs.uploadBegin({ packDir: created.packDir, role: 'audio', bytes: 1 })
  await packs.uploadWrite({ uploadId: dup.uploadId, offset: 0, base64: b64('z') })
  await assert.rejects(packs.uploadFinish({ uploadId: dup.uploadId }), /不会覆盖/)

  const badSpec = '{"nope":1}'
  const bad = await packs.uploadBegin({ packDir: created.packDir, role: 'spectrum', bytes: badSpec.length })
  await packs.uploadWrite({ uploadId: bad.uploadId, offset: 0, base64: b64(badSpec) })
  await assert.rejects(packs.uploadFinish({ uploadId: bad.uploadId }))
  const spec = JSON.stringify({ fps: 10, bands: 48, frames: [new Array(48).fill(0.5), new Array(48).fill(0.2)] })
  const s = await packs.uploadBegin({ packDir: created.packDir, role: 'spectrum', bytes: Buffer.byteLength(spec) })
  await packs.uploadWrite({ uploadId: s.uploadId, offset: 0, base64: b64(spec) })
  await packs.uploadFinish({ uploadId: s.uploadId })

  const manifest = JSON.parse(await readFile(created.manifestPath, 'utf8'))
  assert.equal(manifest.audio.file, 'audio.m4a'); assert.match(JSON.stringify(manifest), /spectrum\.json/)
  assert.ok(parseMvPack(manifest))
  const first = await validatePackForAgent({ path: created.packDir })
  assert.equal(first.ok, true, JSON.stringify(first.problems))

  manifest.canvas = { renderer: 'script', script: 'scenes.js' }
  delete manifest['x-dsh-mv-ai']
  await writeFile(created.manifestPath, JSON.stringify(manifest))
  const checked = await validatePackForAgent({ path: created.packDir })
  assert.equal(checked.ok, true, JSON.stringify(checked.problems))
  const frame = await previewFrameForAgent({ path: created.packDir, t: 30, cols: 60, rows: 16 })
  assert.equal(frame.ok, true)
  assert.equal(frame.frame.split('\n').length, 16)

  await writeFile(join(created.packDir, 'scenes.js'), 'function render(){ while(true){} }')
  const loop = await validatePackForAgent({ path: created.packDir })
  assert.equal(loop.ok, false)
  assert.match(JSON.stringify(loop.problems), /超时|timed out/i)
})

test('scene sandbox (Host preview): no escape, no require, time limits', () => {
  assert.equal(checkScene(EXAMPLE_SCENE, { times: [0, 5, 60], cols: 80, rows: 24, info: { duration: 120, title: 'x' } }).ok, true)
  const escape = checkScene('function render(){ return [String(this.constructor.constructor("return typeof process")())] }')
  assert.ok(!escape.ok || !/object/.test(escape.frames[0]?.text ?? ''), 'no host process object reachable')
  assert.ok(sceneSourceProblems("import fs from 'node:fs'\nfunction render(){}").length > 0)
  assert.ok(sceneSourceProblems("const x = require('fs')").length > 0)
  assert.equal(compileScene('function nope() {}').ok, false, 'render() is required')
  assert.equal(compileScene('export function render() { return ["hi"] }').ok, true, 'export keyword is tolerated')
  assert.equal(checkScene('function render(){ throw new Error("boom") }').ok, false)
})

test('scene worker source: blocked globals are gone before the scene runs', async () => {
  const posted = []
  let listener = null
  const scope = { performance: { now: () => 0 } }
  for (const name of SCENE_BLOCKED_GLOBALS) if (!['Function', 'eval', 'globalThis'].includes(name)) scope[name] = () => 'leak'
  scope.postMessage = msg => posted.push(msg)
  scope.addEventListener = (type, fn) => { if (type === 'message') listener = fn }
  scope.self = scope
  const context = vm.createContext(scope)
  const probe = `var seen = [${SCENE_BLOCKED_GLOBALS.map(name => `[${JSON.stringify(name)}, typeof ${name}]`).join(',')}].filter(pair => pair[1] !== 'undefined').map(pair => pair[0]);
function render(t, cols, rows, ctx) { return { lines: ['leaks:' + seen.join(','), 'post:' + typeof postMessage, ctx.title], styles: [] } }`
  vm.runInContext(sceneWorkerSource(probe), context)
  listener({ data: { type: 'init', info: {} } })
  assert.deepEqual({ ...posted[0] }, { type: 'ready', error: '' })
  listener({ data: { type: 'frame', id: 7, t: 1, cols: 20, rows: 4, ctx: { title: 'T' } } })
  assert.equal(posted[1].id, 7)
  assert.equal(posted[1].frame.lines[0].trim(), 'leaks:')
  assert.equal(posted[1].frame.lines[1].trim(), 'post:undefined')
  assert.equal(posted[1].frame.lines.length, 4)
})

class FakeWorker {
  constructor(source) { this.source = source; this.sent = []; this.terminated = false; FakeWorker.last = this }
  postMessage(msg) {
    this.sent.push(msg)
    if (msg.type === 'init') queueMicrotask(() => this.onmessage({ data: { type: 'ready', error: FakeWorker.setupError ?? '' } }))
  }
  answer(ms = 1) { const msg = this.sent.at(-1); this.onmessage({ data: { type: 'frame', id: msg.id, ms, frame: { lines: ['abc'], styles: ['2'] } } }) }
  terminate() { this.terminated = true }
}

test('ScriptFilm: paints worker frames, falls back on stall, slowness and errors', async () => {
  let now = 0, failed = ''
  const film = new ScriptFilm({ createWorker: src => new FakeWorker(src), now: () => now, onFail: reason => { failed = reason } })
  await film.load(EXAMPLE_SCENE)
  film.render(0, 10, 3)
  FakeWorker.last.answer()
  const canvas = film.render(0.05, 10, 3)
  assert.equal(canvas.cells[0].slice(0, 3).map(cell => cell[0]).join(''), 'abc')
  assert.equal(canvas.cells[0][0][1], 2, 'per-character style digit')
  FakeWorker.last.answer()
  // Stall: once the graded first-use window has closed, a frame that never
  // answers still trips the unchanged steady-state hard timeout.
  now = SCENE_LIMITS.firstFrameGraceMs + 10
  film.render(0.1, 10, 3)
  now += SCENE_LIMITS.hardTimeoutMs + 1
  film.render(0.1, 10, 3)
  assert.match(failed, /可能是死循环/)
  assert.equal(FakeWorker.last.terminated, true)

  failed = ''
  let slowNow = 0
  const slow = new ScriptFilm({ createWorker: src => new FakeWorker(src), now: () => slowNow, onFail: reason => { failed = reason } })
  await slow.load(EXAMPLE_SCENE)
  // The quota is a steady-state allowance, so the clock has to leave the
  // first-use window before slow frames start being charged against it.
  slowNow = SCENE_LIMITS.firstFrameGraceMs + 10
  for (let i = 0; i <= SCENE_LIMITS.slowFramesAllowed + 1 && !failed; i++) { slow.render(i, 10, 3); FakeWorker.last.answer(SCENE_LIMITS.frameBudgetMs + 20) }
  assert.match(failed, /太慢/)

  FakeWorker.setupError = 'SyntaxError: nope'
  await assert.rejects(new ScriptFilm({ createWorker: src => new FakeWorker(src) }).load(EXAMPLE_SCENE), /无法加载/)
  FakeWorker.setupError = undefined
  await assert.rejects(new ScriptFilm({ createWorker: () => null }).load(EXAMPLE_SCENE), /Web Worker/)
  await assert.rejects(new ScriptFilm({ createWorker: src => new FakeWorker(src) }).load(''), /./)
})

test('computeSpectrum: 48 normalised bands at 20 fps', async () => {
  const rate = 8000, seconds = 2
  const tone = Float32Array.from({ length: rate * seconds }, (_, i) => Math.sin(2 * Math.PI * 440 * i / rate) * (i > rate ? 1 : 0.1))
  const spec = await computeSpectrum([tone], rate, { fps: 20 })
  assert.equal(spec.bands, 48); assert.equal(spec.fps, 20)
  assert.equal(spec.frames.length, 40)
  assert.ok(spec.frames.every(frame => frame.length === 48 && frame.every(v => v >= 0 && v <= 1)))
  const loud = spec.frames[30].reduce((a, b) => a + b), quiet = spec.frames[8].reduce((a, b) => a + b)
  assert.ok(loud > quiet, 'louder second half has more energy')
})

test('inspectAiAudio: accepts what Chromium decodes, by content', () => {
  const dash = Buffer.from('00000020667479706973 6f35000002006973 6f35697336 6d70 3431 6461 7368'.replace(/ /g, ''), 'hex')
  assert.equal(inspectAiAudio(dash).problem, '')
  assert.equal(inspectAiAudio(dash).ext, '.m4a')
  assert.equal(inspectAiAudio(Buffer.from('OggS\0\x02' + '\0'.repeat(22) + '\x13OpusHead', 'latin1')).problem, '')
  assert.equal(inspectAiAudio(Buffer.from('fLaC')).ext, '.flac')
  assert.match(inspectAiAudio(Buffer.from('MZ\x90\0')).problem, /无法识别/)
  assert.match(inspectAiAudio(Buffer.from('#!AMR\n')).problem, /不能在面板里播放/)
})

test('createAiPack: decode, spectrum, Host create and uploads', async t => {
  const { packs } = await made(t)
  const api = { aiPackCreate: wrap(r => packs.create(r)), packUploadBegin: wrap(r => packs.uploadBegin(r)), packUploadWrite: wrap(r => packs.uploadWrite(r)), packUploadFinish: wrap(r => packs.uploadFinish(r)) }
  const wav = encodeWav([new Float32Array(16000)], 8000)
  const file = { arrayBuffer: async () => wav.buffer.slice(0) }
  const stages = new Set()
  const result = await createAiPack(api, { file, title: ' My Song ', lyrics: '[00:01.00]hi' }, { decode: async () => ({ channels: [new Float32Array(16000)], sampleRate: 8000, duration: 2 }), onProgress: p => stages.add(p.stage) })
  assert.ok(['decode', 'spectrum', 'copy', 'done'].every(stage => stages.has(stage)))
  assert.ok((await readdir(result.created.packDir)).includes('audio.wav'))
  assert.match(result.prompt, new RegExp(AI_TOOL_NAMES.validate))
  assert.match(result.prompt, /AGENT\.md/)
  assert.doesNotMatch(agentPrompt({ packDir: 'C:\\p', title: 'x', toolsAvailable: false }), /并用 mv_pack_preview_frame 预览/)
})

test('startAgentSession: workspace → session → rename → queued prompt → open', async () => {
  const calls = []
  const harness = {
    get(name) {
      return {
        workspaces: { create: async request => { calls.push(['workspace', request]); return { workspaceId: 'ws1' } } },
        sessions: { create: async request => { calls.push(['session', request]); return 'sess-1' } },
        remote: { session: { rename: async r => { calls.push(['rename', r.title]); return { ok: true, value: {} } }, prompt: async r => { calls.push(['prompt', r.mode, r.content[0].text, r.sessionId]); return { ok: true, value: { accepted: true } } } } },
        uiWorkspace: { openSession: id => calls.push(['open', id]) },
      }[name]
    },
  }
  assert.equal(sessionSupport(harness).available, true)
  const started = await startAgentSession(harness, { packDir: 'C:\\p\\song', title: 'Song', prompt: 'do it' })
  assert.deepEqual(started, { sessionId: 'sess-1', workspaceId: 'ws1', opened: true })
  assert.deepEqual(calls, [['workspace', { path: 'C:\\p\\song' }], ['session', { workspaceId: 'ws1' }], ['rename', 'MV：Song'], ['prompt', 'queue', 'do it', 'sess-1'], ['open', 'sess-1']])
  const none = { get: () => { throw new Error('no such service') } }
  assert.equal(sessionSupport(none).available, false)
  await assert.rejects(startAgentSession(none, { packDir: 'C:\\p', title: 'x', prompt: 'y' }), SessionApiMissing)
})

test('agent tools: literal definitions registered through ctx.inject([tools])', async () => {
  const tools = buildMvAgentTools({ validate: async a => ({ ok: true, a }), preview: async a => ({ ok: true, a }) })
  assert.deepEqual(tools.map(tool => tool.name), [AI_TOOL_NAMES.validate, AI_TOOL_NAMES.preview])
  for (const tool of tools) { assert.equal(tool.parameters.type, 'object'); assert.equal(typeof tool.execute, 'function'); assert.equal(typeof tool.output.render, 'function') }
  assert.deepEqual(await tools[1].execute({ path: ' C:\\p ', t: '3' }), { ok: true, a: { path: 'C:\\p', t: 3, cols: 100, rows: 32 } })
  assert.equal((await tools[0].execute({})).ok, false)
  const registered = [], disposed = []
  const ctx = { inject(names, fn) { assert.deepEqual(names, ['tools']); fn({ effect: (f) => { const d = f(); ctx.dispose = d }, tools: { register: tool => { registered.push(tool.name); return () => disposed.push(tool.name) } } }) } }
  const state = {}
  registerAgentTools(ctx, state)
  assert.deepEqual(registered, [AI_TOOL_NAMES.validate, AI_TOOL_NAMES.preview])
  assert.equal(state.registered, true)
  ctx.dispose()
  assert.deepEqual(disposed, registered)
  assert.equal(state.registered, false)
  assert.equal(registerAgentTools({}, {}), null, 'no inject → no tools, no crash')
})
