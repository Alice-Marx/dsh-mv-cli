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
const api = {
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
  packLoad: ({ path }) => ok(/Starlight/.test(path)
    ? { manifestPath: path, pack: { title: 'Starlight Run', artist: 'Alice', credits: ['由 AI 制作的示例 MV 包（仅用于界面预览）'], audio: { file: 'audio.wav' }, lyrics: { file: 'lyrics.lrc' }, canvas: { renderer: scene === 'ai' || scene === 'auto' ? 'generic' : 'script', script: 'scenes.js' } }, files: { audio: { exists: true, size: 960044 }, lyrics: { exists: true, size: 200 }, scene: { exists: true, size: EXAMPLE_SCENE.length } }, warnings: [] }
    : { manifestPath: path, pack: { title: 'Ghost Rule', artist: 'DECO*27', credits: ['示例 MV 包（仅用于界面预览）'], canvas: { renderer: 'generic' } }, files: {}, warnings: [] }),
  packRead: ({ role, offset, length }) => {
    const bytes = role === 'audio' ? scriptAudioBytes() : enc.encode(role === 'scene' ? EXAMPLE_SCENE : role === 'lyrics' ? SCRIPT_LRC() : '')
    const part = bytes.subarray(offset, offset + length)
    return ok({ name: role === 'audio' ? 'audio.wav' : role === 'scene' ? 'scenes.js' : 'lyrics.lrc', size: bytes.length, offset, bytes: part.length, done: offset + part.length >= bytes.length, base64: b64(part) })
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
  const db = await openMediaStore()
  if (scene === 'script' || scene === 'calib') {
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
  createRoot(document.getElementById('root')).render(<MvPanel api={api} harness={harness} initialAi={scene === 'ai' || scene === 'auto'} />)
}
void setup()
