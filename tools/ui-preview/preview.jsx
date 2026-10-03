/**
 * Stand-alone preview of the MV 放映室 panel for screenshots (not shipped).
 * A mock Host answers the remote calls; ?scene= picks the state:
 *   first    – first run, nothing configured
 *   canvas   – canvas with a (synthetic) audio file, ready to play
 *   dshpv    – the built-in "world.execute(me); dsh PV" canvas preset; its data and art are
 *              served over HTTP by shoot.mjs, and the lyrics come from /local/lyrics.lrc when the
 *              screenshot machine has a local copy (never committed, never shipped)
 *   ai       – 曲库 with the 用 AI 制作新 MV dialog open (mock Host creates the pack)
 *   script   – an AI-made pack with canvas.renderer "script" (example scene)
 *   workshop – 曲库 with the 创意工坊 open (mock catalogue; covers from /covers/<id>.png made by shoot.mjs)
 *   wsplay   – an installed workshop pack playing with the user's own (synthetic) audio + placeholder lyrics
 *   wspublish – Starlight Run open, 创意工坊 → 发布到工坊 dialog
 *   example  – ?example=<name> plays template/examples/<name>.scene.js (or rich-pack)
 * ?theme=dark sets body[data-ds-dark-theme] like Harness does.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MvPanel } from '../../.dsh-plugin/client/mv-panel.jsx'
import { openMediaStore, putMedia } from '../../.dsh-plugin/client/mv/media-store.mjs'
import { encodeWav } from '../../.dsh-plugin/client/mv-wav.mjs'
import { DSHPV_ASSETS, DSHPV_CHUNK } from '../../.dsh-plugin/shared/mv-dshpv-protocol.mjs'
import { DSH_PV_ID } from '../../.dsh-plugin/client/mv-pack-state.mjs'
import { EXAMPLE_SCENE } from '../../.dsh-plugin/shared/mv-scene.mjs'
import { TEMPLATE_ASSETS } from '../../.dsh-plugin/shared/mv-template-assets.gen.mjs'
import { parseMvPack } from '../../.dsh-plugin/shared/mv-pack.mjs'
import { normalizeLyricLine, publishLinks } from '../../.dsh-plugin/shared/mv-workshop.mjs'
import { parseLrc } from '../../.dsh-plugin/shared/mv-lyrics.mjs'

const query = new URLSearchParams(location.search)
const scene = query.get('scene') || 'first'
if (query.get('theme') === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
const ok = value => Promise.resolve({ ok: true, value: { ok: true, value } })
const fail = message => Promise.resolve({ ok: true, value: { ok: false, error: { message } } })
const PACK_DIR = 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\packs\\Starlight Run'
const enc = new TextEncoder()
const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s) }
let scriptAudio = null
const LYRIC_LINES_LRC = () => LYRIC_LINES.map(([text, alt, start]) => { const m = Math.floor(start / 60), sec = (start - m * 60).toFixed(2).padStart(5, '0'); return `[0${m}:${sec}]${text}\n[0${m}:${sec}]${alt}\n` }).join('')
const scriptAudioBytes = () => {
  if (scriptAudio) return scriptAudio
  const rate = 8000, samples = new Float32Array(rate * 60)
  for (let i = 0; i < samples.length; i++) samples[i] = 0.25 * Math.sin(i * 2 * Math.PI * 330 / rate) * (0.5 + 0.5 * Math.sin(i / rate * 3))
  return (scriptAudio = encodeWav([samples], rate))
}
const SCRIPT_LRC = () => '[00:00.00]Starlight Run\n' + LYRIC_LINES_LRC()

// 0.5.0 mocks: lyrics engine, LRCLIB, analysis files and calibration writes.
const engineState = query.get('engine') || 'ready'
const ENGINE_INFO = {
  dir: 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\engine', status: engineState === 'missing' ? 'missing' : 'ready', external: false, python: 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\engine\\venv\\Scripts\\python.exe', uv: 'C:\\Users\\Alice\\.local\\bin\\uv.exe',
  models: engineState === 'missing' ? {} : { 'large-v3': true, medium: false, small: true }, demucs: engineState !== 'missing', cuda: engineState !== 'missing', gpu: engineState === 'missing' ? null : { name: 'NVIDIA GeForce RTX 4070 Laptop GPU', vramMB: 8188 },
  pins: { python: '3.12' }, modelSizes: { 'large-v3': 2950, medium: 1530, small: 470 }, demucsMB: 85,
  estimates: { 'cuda:large-v3': { downloadMB: 6080, diskMB: 8000 }, 'cuda:medium': { downloadMB: 4660, diskMB: 6600 }, 'cuda:small': { downloadMB: 3600, diskMB: 5500 }, 'cpu:large-v3': { downloadMB: 3900, diskMB: 4800 }, 'cpu:medium': { downloadMB: 2480, diskMB: 3400 }, 'cpu:small': { downloadMB: 1420, diskMB: 2300 } },
}
const LYRIC_LINES = [['Running through the neon rain', '在霓虹雨里奔跑', 20.1, 0.95], ['Every light a name', '每一盏灯都是一个名字', 25.6, 0.92], ['Starlight, starlight, run with me', '星光，星光，和我一起跑', 31.2, 0.31], ['Into the night we go', '我们奔向夜色', 36.4, 0.88], ['Counting every heartbeat', '数着每一次心跳', 41.9, 0.42], ['Starlight, starlight, run with me', '星光，星光，和我一起跑', 47.3, 0.9]]
const files = new Map()
files.set('timing', JSON.stringify({ format: 'dsh-mv-timing', version: 1, source: 'engine', lines: LYRIC_LINES.map(([text, alt, start, confidence], i) => ({ start, end: (LYRIC_LINES[i + 1]?.[2] ?? start + 5) - 0.3, text, alt, confidence, source: 'engine' })) }))
files.set('manifest', JSON.stringify({ format: 'dsh-mv-pack', version: 1, title: 'Starlight Run', audio: { file: 'audio.wav' }, canvas: { renderer: 'generic' }, 'x-dsh-mv-ai': { status: 'waiting-for-agent' } }))
files.set('transcript', JSON.stringify({ language: 'en', device: 'cuda', model: 'large-v3', separated: true, duration: 20, timings: { decode: 0.4, separate: 3.1, transcribe: 9.8 },
  words: LYRIC_LINES.flatMap(([text, , start, confidence], i) => confidence < 0.5 ? [] : text.split(' ').map((w, k) => ({ w, s: start - 18 + k * 0.4, e: start - 17.7 + k * 0.4, p: 0.9 }))) }))
let jobStarted = 0
const jobEvents = () => {
  const elapsed = (Date.now() - jobStarted) / 1000
  const ratio = Math.min(1, elapsed / 5)
  const stage = ratio < 0.15 ? 'decode' : ratio < 0.5 ? 'separate' : 'transcribe'
  return { ratio, stage, done: ratio >= 1 }
}

const assetCache = new Map()
const assetBytes = name => {
  if (!assetCache.has(name)) assetCache.set(name, fetch(`/assets/${DSHPV_ASSETS[name]}`).then(r => (r.ok ? r.arrayBuffer().then(b => new Uint8Array(b)) : null)))
  return assetCache.get(name)
}
// 0.7.0 MV 创意工坊 mocks (fictional packs; scenes are the template examples).
const WS_DIR = 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\workshop'
const RICH = TEMPLATE_ASSETS['examples/rich-pack/mv.json']
const PLACEHOLDER_LRC = TEMPLATE_ASSETS['examples/rich-pack/lyrics.placeholder.lrc']
const WS_PACKS = [
  { id: 'neon-terminal-example', title: 'Neon Terminal (example)', artist: 'dsh-mv', author: 'Alice-Marx', license: 'MIT', version: '1.1.0', duration: 120, scene: 'examples/rich-pack/scenes.js', tags: ['example', 'ascii', 'terminal'], description: 'Example pack from the dsh-mv template: boot log, chat window, spectrum ring, heartbeat, EXECUTE glitch and a sinking-whale ending.', fingerprint: false, timing: true, sections: 6 },
  { id: 'heartbeat-exe', title: 'heartbeat.exe', artist: 'Lumen Fold', author: 'pixelmoth', license: 'CC-BY-NC-SA-4.0', version: '1.0.2', duration: 198.4, scene: 'examples/heartbeat.scene.js', tags: ['ecg', 'minimal'], description: '心电图跟着 BPM 跳动，副歌时整屏余辉。', fingerprint: true, timing: true, sections: 8 },
  { id: 'whale-fall-protocol', title: 'Whale Fall Protocol', artist: 'Deep Sea Choir', author: 'tidepool', license: 'CC-BY-NC-SA-4.0', version: '2.0.0', duration: 245.1, scene: 'examples/whale-fall.scene.js', tags: ['ocean', 'ending'], description: '海雪、鱼群和慢慢下沉的剪影；尾声逐行熄灭。', fingerprint: true, timing: false, sections: 7 },
  { id: 'token-rain', title: 'Token Rain', artist: 'Null Pointer', author: 'kana-dev', license: 'CC-BY-4.0', version: '1.3.0', duration: 176.0, scene: 'examples/token-bar.scene.js', tags: ['karaoke', 'tokens'], description: '歌词被切成 token 逐个点亮，stdout 滚动 token id。', fingerprint: true, timing: true, sections: 6 },
  { id: 'execute-split', title: 'EXECUTE//SPLIT', artist: 'Glitch Atelier', author: 'mono-k', license: 'CC-BY-NC-4.0', version: '1.0.0', duration: 212.0, scene: 'examples/execution-split.scene.js', tags: ['glitch', 'red'], description: '分屏大字 + 斜向胶带，拍点时整行错位。', fingerprint: false, timing: true, sections: 9 },
  { id: 'ops-ticker-blues', title: 'Ops Ticker Blues', artist: 'Server Room Band', author: 'oncall', license: 'MIT', version: '0.9.1', duration: 163.7, scene: 'examples/ops-ticker.scene.js', tags: ['log', 'retro'], description: '运维日志随段落换词，底部跑马灯。', fingerprint: false, timing: false, sections: 5 },
]
const wsInstalled = new Map(scene === 'workshop' || scene === 'wsplay' ? [['neon-terminal-example', { version: '1.0.0' }], ['token-rain', { version: '1.3.0' }]] : [])
const wsIndex = () => ({
  commit: '6655401'.padEnd(40, '0'), generated: '2026-10-03T16:00:00Z', repo: 'Alice-Marx/dsh-mv-workshop', source: 'https://raw.githubusercontent.com/Alice-Marx/dsh-mv-workshop/main/index.json',
  packs: WS_PACKS.map(p => ({ ...p, renderer: 'script', homepage: '', cover: 'cover.png', updated: '2026-10-0' + (1 + (p.id.length % 3)) + 'T10:00:00Z', size: 30_000 + p.id.length * 900,
    files: ['mv.json', 'scenes.js', 'README.md', 'cover.png', ...(p.timing ? ['lyrics.timing.json'] : [])].map((path, i) => ({ path, size: [1900, 12500, 1020, 17074, 3008][i], sha256: (p.id + path).split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(64, '0').slice(0, 64) })) })),
  installed: [...wsInstalled].map(([id, v]) => ({ id, version: v.version, title: WS_PACKS.find(p => p.id === id).title, manifestPath: `${WS_DIR}\\${id}\\mv.json`, installedAt: '2026-10-03T12:00:00Z' })),
})
const wsManifest = id => {
  const p = WS_PACKS.find(x => x.id === id) ?? WS_PACKS[0]
  const data = JSON.parse(RICH)
  delete data.lyrics; delete data.$schema
  return { ...data, title: p.title, artist: p.artist, duration: p.duration === 120 ? 120 : data.duration, 'x-dsh-mv-workshop': { id: p.id, version: wsInstalled.get(p.id)?.version ?? p.version, license: p.license, author: p.author, audio: { duration: p.duration }, lyricsTiming: 'lyrics.timing.json' } }
}
let timingJson = ''
async function buildTiming() {
  const hash = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
  const cues = parseLrc(PLACEHOLDER_LRC)
  const lines = []
  for (const c of cues) lines.push({ t: c.time, e: c.end, h: await hash(normalizeLyricLine(c.en || c.zh)), ...(c.words?.length ? { w: c.words.map(w => w.time) } : {}) })
  timingJson = JSON.stringify({ format: 'dsh-mv-lyrics-timing', version: 1, lines })
}
const EXAMPLE = query.get('example') || 'rich-pack'
const exampleScene = () => TEMPLATE_ASSETS[EXAMPLE === 'rich-pack' ? 'examples/rich-pack/scenes.js' : `examples/${EXAMPLE}.scene.js`]
const sceneFor = path => {
  if (/workshop/.test(path)) { const id = path.split('\\').at(-2); return TEMPLATE_ASSETS[(WS_PACKS.find(p => p.id === id) ?? WS_PACKS[0]).scene] }
  if (/Examples/.test(path)) return exampleScene()
  return EXAMPLE_SCENE
}
const loadedFor = path => {
  if (/workshop/.test(path)) {
    const id = path.split('\\').at(-2)
    return { manifestPath: path, packDir: path.replace(/\\mv\.json$/, ''), pack: parseMvPack(JSON.stringify(wsManifest(id))), files: { scene: { exists: true, size: 12000 }, timing: { exists: true, size: 3000 } }, warnings: [] }
  }
  if (/Examples/.test(path)) {
    const data = JSON.parse(RICH); delete data.lyrics; delete data.$schema
    data.title = EXAMPLE === 'rich-pack' ? 'Neon Terminal (example)' : `${EXAMPLE}.scene.js`
    data.lyrics = { file: 'lyrics.placeholder.lrc' }
    return { manifestPath: path, packDir: path.replace(/\\mv\.json$/, ''), pack: parseMvPack(JSON.stringify(data)), files: { scene: { exists: true, size: 12000 }, lyrics: { exists: true, size: 2000 } }, warnings: [] }
  }
  return null
}
const wsMocks = {
  workshopIndex: async () => { await new Promise(r => setTimeout(r, 250)); return ok(wsIndex()) },
  workshopInstalled: () => ok({ installed: wsIndex().installed }),
  workshopCover: async ({ id }) => {
    const r = await fetch(`/covers/${id}.png`)
    if (!r.ok) return ok({ id, found: false })
    return ok({ id, found: true, mime: 'image/png', base64: b64(new Uint8Array(await r.arrayBuffer())) })
  },
  workshopInstall: async ({ id }) => { await new Promise(r => setTimeout(r, 900)); const p = WS_PACKS.find(x => x.id === id); wsInstalled.set(id, { version: p.version }); return ok({ id, version: p.version, manifestPath: `${WS_DIR}\\${id}\\mv.json`, files: p.timing ? 5 : 4, warnings: [] }) },
  workshopUninstall: ({ id }) => { wsInstalled.delete(id); return ok({ id, removed: true }) },
  workshopPublish: async request => {
    await new Promise(r => setTimeout(r, 700))
    const dir = `C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\workshop-publish\\${request.id}\\packs\\${request.id}`
    return ok({ ok: true, id: request.id, dir, files: [{ path: 'scenes.js', size: EXAMPLE_SCENE.length }, { path: 'mv.json', size: 1412 }, { path: 'lyrics.timing.json', size: 2210 }, { path: 'README.md', size: 1004 }, { path: 'cover.png', size: request.coverPng ? Math.round(request.coverPng.length * 0.75) : 0 }].filter(f => f.size),
      errors: [], warnings: request.fingerprint ? [] : ['没有附带音频指纹：安装的人只能按时长检查音频是否匹配'], stripped: ['audio（音频不会上传）', 'lyrics（歌词文本不会上传，只保留时间轴哈希）'], timingLines: 7, links: publishLinks(request.id),
      prTitle: `Add pack: Starlight Run — Alice (${request.id})`, prBody: `Pack: packs/${request.id}/ · version ${request.version} · license ${request.license}` })
  },
}

const api = {
  ...wsMocks,
  engineInfo: () => ok(ENGINE_INFO),
  engineProbe: () => { jobStarted = Date.now(); return ok({ jobId: 'mvjob-0123456789ab', steps: [{ id: 'probe', label: '检查' }] }) },
  engineInstall: () => { jobStarted = Date.now(); return ok({ jobId: 'mvjob-0123456789ab', steps: [{ id: 'torch', label: '安装 PyTorch（NVIDIA GPU（CUDA 12.6），约 2.7 GB）' }] }) },
  engineModel: () => { jobStarted = Date.now(); return ok({ jobId: 'mvjob-0123456789ab', steps: [{ id: 'model', label: '下载模型' }] }) },
  engineTranscribe: () => { jobStarted = Date.now(); return ok({ jobId: 'mvjob-0123456789ab', steps: [{ id: 'transcribe', label: '识别歌词时间（large-v3）' }], outDir: `${PACK_DIR}\\analysis` }) },
  jobRead: async ({ cursor }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const { ratio, stage, done } = jobEvents()
    return ok({ jobId: 'mvjob-0123456789ab', events: [{ type: 'progress', stage, ratio, message: stage === 'transcribe' ? 'Running through the neon rain' : stage }], cursor: (cursor ?? 0) + 1, done, ok: done, cancelled: false, error: '', ratio, seconds: Math.round(ratio * 13.3 * 10) / 10, result: done ? {} : null })
  },
  jobCancel: () => ok({ cancelled: true }),
  lyricsLookup: async request => { await new Promise(resolve => setTimeout(resolve, 400)); return ok({ found: false, sent: request, tried: ['get', 'search'] }) },
  analysisRead: ({ name, offset = 0 }) => {
    if (!files.has(name)) return ok({ exists: false, name, size: 0, offset, bytes: 0, done: true, base64: '' })
    const bytes = enc.encode(files.get(name)).subarray(offset)
    return ok({ exists: true, name, size: bytes.length + offset, offset, bytes: bytes.length, done: true, base64: b64(bytes) })
  },
  packWriteText: ({ file, text }) => { files.set({ 'mv.json': 'manifest', 'timing.json': 'timing', 'sections.json': 'sections', 'lyrics.lrc': 'lyrics' }[file], text); return ok({ path: `${PACK_DIR}\\${file}`, backup: `${PACK_DIR}\\.dsh-mv-backup\\${file}.20261003-120000`, bytes: text.length }) },
  info: () => ok({ hostVersion: query.get('stale') ? '0.2.0' : __DSH_MV_CLIENT_VERSION__, platform: 'win32', canvasFontSize: 14, aiPacksDir: 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\packs', agentTools: { registered: true }, lrclib: true }),
  dshpvAsset: async ({ name, offset = 0 }) => {
    const bytes = await assetBytes(name)
    if (!bytes) return ok({ exists: false, name, size: 0, offset, bytes: 0, done: true, base64: '' })
    const part = bytes.subarray(offset, offset + DSHPV_CHUNK)
    return ok({ exists: true, name, size: bytes.length, offset, bytes: part.length, done: offset + part.length >= bytes.length, base64: b64(part) })
  },
  packLoad: ({ path }) => ok(loadedFor(path) ?? (/Starlight/.test(path)
    ? { manifestPath: path, pack: { title: 'Starlight Run', artist: 'Alice', credits: ['由 AI 制作的示例 MV 包（仅用于界面预览）'], audio: { file: 'audio.wav' }, lyrics: { file: 'lyrics.lrc' }, canvas: { renderer: scene === 'ai' || scene === 'auto' ? 'generic' : 'script', script: 'scenes.js' } }, files: { audio: { exists: true, size: 960044 }, lyrics: { exists: true, size: 200 }, scene: { exists: true, size: EXAMPLE_SCENE.length } }, warnings: [] }
    : { manifestPath: path, pack: { title: 'Ghost Rule', artist: 'DECO*27', credits: ['示例 MV 包（仅用于界面预览）'], canvas: { renderer: 'generic' } }, files: {}, warnings: [] })),
  packRead: ({ manifestPath, role, offset, length }) => {
    const special = /workshop|Examples/.test(manifestPath)
    const text = role === 'scene' ? sceneFor(manifestPath) : role === 'timing' ? timingJson : role === 'lyrics' ? (special ? PLACEHOLDER_LRC : SCRIPT_LRC()) : ''
    const bytes = role === 'audio' ? scriptAudioBytes() : enc.encode(text)
    const part = bytes.subarray(offset, offset + length)
    return ok({ name: role === 'audio' ? 'audio.wav' : role === 'scene' ? 'scenes.js' : role === 'timing' ? 'lyrics.timing.json' : 'lyrics.lrc', size: bytes.length, offset, bytes: part.length, done: offset + part.length >= bytes.length, base64: b64(part) })
  },
  packTemplate: () => fail('preview'),
  audioRead: () => fail('preview'), ffmpegInfo: () => ok({ available: true, path: 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', source: 'known' }), audioConvert: () => fail('preview'),
  aiPackCreate: async request => { await new Promise(resolve => setTimeout(resolve, 300)); return ok({ packDir: PACK_DIR, manifestPath: `${PACK_DIR}\\mv.json`, files: ['mv.json', 'AGENT.md', 'scenes.js'], request }) },
  packUploadBegin: ({ role }) => ok({ uploadId: `pack-${role}0123456789`, name: role, chunkBytes: 524288 }),
  packUploadWrite: () => ok({}), packUploadFinish: () => ok({ path: PACK_DIR }),
}
// Harness client services: ?session=0 hides the session API (copy & paste fallback).
const harness = { get: name => (query.get('session') === '0' ? undefined : {
  workspaces: { create: async () => ({ workspaceId: 'ws-preview' }) },
  sessions: { create: async () => 'sess-preview-0001' },
  remote: { session: { rename: async () => ({ ok: true, value: {} }), prompt: async () => ({ ok: true, value: { accepted: true } }) } },
  uiWorkspace: { openSession: () => {} },
}[name]) }

async function setup() {
  localStorage.clear()
  // ?skin=a|b|c&mode=auto|light|dark picks the 0.8.0 panel skin (stored like the picker does).
  if (query.get('skin')) localStorage.setItem('dsh-mv.skin.v1', JSON.stringify({ skin: query.get('skin'), modes: { [query.get('skin')]: query.get('mode') || 'auto' } }))
  const db = await openMediaStore()
  await buildTiming()
  if (scene === 'workshop' || scene === 'wsplay') {
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([
      { manifestPath: `${WS_DIR}\\neon-terminal-example\\mv.json`, title: 'Neon Terminal (example)', artist: 'dsh-mv', workshop: 'neon-terminal-example' },
      { manifestPath: `${WS_DIR}\\token-rain\\mv.json`, title: 'Token Rain', artist: 'Null Pointer', workshop: 'token-rain' },
      { manifestPath: 'D:\\MV\\Ghost Rule\\mv.json', title: 'Ghost Rule', artist: 'DECO*27' },
    ]))
    if (scene === 'wsplay') {
      localStorage.setItem('dsh-mv.packs.active.v1', `pack:${WS_DIR}\\neon-terminal-example\\mv.json`)
      const rate = 8000, seconds = Number(query.get('seconds') || 126), samples = new Float32Array(rate * seconds)
      for (let i = 0; i < samples.length; i++) { const t = i / rate, beat = (t * 2) % 1; samples[i] = 0.3 * Math.sin(i * 2 * Math.PI * 110 / rate) * Math.exp(-beat * 5) + 0.06 * Math.sin(i * 2 * Math.PI * 523 / rate) * (0.5 + 0.5 * Math.sin(t)) }
      const file = new File([encodeWav([samples], rate)], 'my-own-copy.flac', { type: 'audio/wav' })
      await putMedia(db, 'workshop:neon-terminal-example:audio', { file, name: file.name, sha: 'c0ffee'.padEnd(64, '0') })
      await putMedia(db, 'workshop:neon-terminal-example:lyrics', { name: 'my-lyrics.lrc', text: PLACEHOLDER_LRC.replace(/<\d\d:\d\d\.\d\d>/g, '').replace(/\[(\d\d):(\d\d)\.(\d\d)\]/g, (m, a, b, c) => `[${a}:${String(Math.max(0, Number(b) - 1)).padStart(2, '0')}.${c}]`) })
    }
  } else if (scene === 'wspublish') {
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([{ manifestPath: `${PACK_DIR}\\mv.json`, title: 'Starlight Run', artist: 'Alice' }]))
    localStorage.setItem('dsh-mv.packs.active.v1', `pack:${PACK_DIR}\\mv.json`)
  } else if (scene === 'example') {
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([{ manifestPath: 'D:\\MV\\Examples\\x\\mv.json', title: EXAMPLE, artist: 'dsh-mv template' }]))
    localStorage.setItem('dsh-mv.packs.active.v1', 'pack:D:\\MV\\Examples\\x\\mv.json')
  } else if (scene === 'script' || scene === 'calib') {
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([{ manifestPath: `${PACK_DIR}\\mv.json`, title: 'Starlight Run', artist: 'Alice' }, { manifestPath: 'D:\\MV\\Ghost Rule\\mv.json', title: 'Ghost Rule', artist: 'DECO*27' }]))
    localStorage.setItem('dsh-mv.packs.active.v1', `pack:${PACK_DIR}\\mv.json`)
  } else if (scene !== 'first') {
    if (scene === 'auto') files.delete('timing')
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([
      { manifestPath: 'D:\\MV\\Ghost Rule\\mv.json', title: 'Ghost Rule', artist: 'DECO*27' },
      { manifestPath: 'D:\\MV\\Lagtrain\\mv.json', title: 'Lagtrain', artist: 'inabakumori' },
    ]))
  }
  if (scene === 'canvas') {
    const rate = 8000, seconds = 215, samples = new Float32Array(rate * seconds)
    for (let i = 0; i < samples.length; i++) samples[i] = 0.2 * Math.sin(i * 2 * Math.PI * 220 / rate) * (0.6 + 0.4 * Math.sin(i / rate * 6))
    const file = new File([encodeWav([samples], rate)], 'world.execute(me).m4a', { type: 'audio/wav' })
    await putMedia(db, 'audio', { file, name: file.name, sha: 'f98eaa58d0c2d5'.padEnd(64, '0') })
    await putMedia(db, 'lyrics', { name: 'lyrics.lrc', text: '[00:00.00](示例歌词，仅用于预览)\n[01:05.00]（示例）第一句\n[01:09.50]（示例）第二句\n[01:14.00]（示例）第三句\n' })
  }
  if (scene === 'dshpv') {
    localStorage.setItem('dsh-mv.packs.active.v1', DSH_PV_ID)
    const rate = 8000, seconds = 212, samples = new Float32Array(rate * seconds)
    for (let i = 0; i < samples.length; i++) { const t = i / rate, beat = (t * 2.1) % 1; samples[i] = 0.25 * Math.sin(i * 2 * Math.PI * 110 / rate) * Math.exp(-beat * 6) + 0.05 * Math.sin(i * 2 * Math.PI * 440 / rate) }
    const file = new File([encodeWav([samples], rate)], 'world.execute(me).m4a', { type: 'audio/wav' })
    await putMedia(db, 'audio', { file, name: file.name, sha: '5a1e'.padEnd(64, '0') })
    const local = await fetch('/local/lyrics.lrc').then(r => (r.ok ? r.text() : ''))
    await putMedia(db, 'lyrics', { name: 'lyrics.lrc', text: local || '[00:00.00](示例歌词，仅用于预览)\n[01:00.50]（示例）第一句\n[01:05.00]（示例）第二句\n' })
  }
  const panel = <MvPanel api={api} harness={harness} initialAi={scene === 'ai' || scene === 'auto'} initialWorkshop={scene === 'workshop' || scene === 'wspublish'} />
  // ?host=1 mirrors the Harness frame: the centre column is `display:flex; flex-direction:column; overflow:hidden`
  // (AppFrame centerCol). ?host=wrap adds a plain block wrapper in between; ?host=art a wallpaper behind a see-through theme.
  const host = query.get('host')
  createRoot(document.getElementById('root')).render(host ? (
    <div className={`pv-host${host === 'art' ? ' pv-host-art' : ''}`}>
      <div className="pv-host-top">deepseek HARNESS</div>
      <aside className="pv-host-side">插件 · 自动化任务 · 任务看板 · MV 放映室</aside>
      <div className="pv-host-center" data-testid="host-center">{host === 'wrap' ? <div className="pv-host-wrap">{panel}</div> : panel}</div>
    </div>
  ) : panel)
}
void setup()
