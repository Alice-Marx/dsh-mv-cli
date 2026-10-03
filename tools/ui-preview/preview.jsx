/**
 * Stand-alone preview of the MV 放映室 panel for screenshots (not shipped).
 * A mock Host answers the remote calls; ?scene= picks the state:
 *   first    – first run, nothing configured
 *   canvas   – canvas with a (synthetic) audio file, ready to play
 *   terminal – 面板终端 with paths set and an MP4-renamed-.mp3 warning
 *   termplay – 面板终端 while playing (frame rendered by the canvas engine)
 *   console  – 独立窗口 with the confirmation card open
 *   ai       – 曲库 with the 用 AI 制作新 MV dialog open (mock Host creates the pack)
 *   script   – an AI-made pack with canvas.renderer "script" (example scene)
 * ?theme=dark sets body[data-ds-dark-theme] like Harness does.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MvPanel } from '../../.dsh-plugin/client/mv-panel.jsx'
import { openMediaStore, putMedia } from '../../.dsh-plugin/client/mv/media-store.mjs'
import { encodeWav } from '../../.dsh-plugin/client/mv-wav.mjs'
import { Film } from '../../.dsh-plugin/client/mv/film.mjs'
import { PALETTE, BOLD, rowRuns } from '../../.dsh-plugin/client/mv/renderer.mjs'
import { EXAMPLE_SCENE } from '../../.dsh-plugin/shared/mv-scene.mjs'

const query = new URLSearchParams(location.search)
const scene = query.get('scene') || 'first'
if (query.get('theme') === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
const ok = value => Promise.resolve({ ok: true, value: { ok: true, value } })
const fail = message => Promise.resolve({ ok: true, value: { ok: false, error: { message } } })
const DIR = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me'
const PY = `${DIR}\\python\\python.exe`
const SONG = `${DIR}\\input\\song.mp3`
const NOTE = '音频实际是 MP4/AAC（DASH 分片）（看内容，不看扩展名）。tui_live.py 用 Windows MCI 放音，只能直接播放 MP3 和 PCM WAV；播放前会自动转换成 WAV 缓存，原文件不变。'
const PACK_DIR = 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\packs\\Starlight Run'
const enc = new TextEncoder()
const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s) }
let scriptAudio = null
const scriptAudioBytes = () => {
  if (scriptAudio) return scriptAudio
  const rate = 8000, samples = new Float32Array(rate * 60)
  for (let i = 0; i < samples.length; i++) samples[i] = 0.25 * Math.sin(i * 2 * Math.PI * 330 / rate) * (0.5 + 0.5 * Math.sin(i / rate * 3))
  return (scriptAudio = encodeWav([samples], rate))
}
const SCRIPT_LRC = '[00:00.00]Starlight Run\n[00:20.00]Running through the neon rain\n[00:20.00]在霓虹雨里奔跑\n[00:26.00]Every light a name\n[00:26.00]每一盏灯都是一个名字\n'

function ansiFrame(t, cols, rows) {
  const film = new Film({ energy: () => Array.from({ length: 48 }, (_, i) => 0.35 + 0.3 * Math.sin(i / 3 + t)) })
  const picture = film.render(t, cols, rows, { ready: false })
  const hex = color => { const n = parseInt(color.slice(1), 16); return `${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}` }
  let out = '\x1b[2J\x1b[H'
  for (let y = 0; y < picture.h; y++) {
    out += `\x1b[${y + 1};1H`
    for (const run of rowRuns(picture.cells[y])) out += `\x1b[${run.x + 1}G\x1b[${BOLD[run.style] ? 1 : 22};38;2;${hex(PALETTE[run.style] ?? PALETTE[1])}m${run.text}`
  }
  return out + '\x1b[0m'
}

let sent = false
const api = {
  info: () => ok({ hostVersion: query.get('stale') ? '0.2.0' : __DSH_MV_CLIENT_VERSION__, platform: 'win32', backend: 'pty', canvasFontSize: 14, aiPacksDir: 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\packs', agentTools: { registered: true } }),
  terminalCheck: launch => launch.player === 'python' && launch.pythonPath && launch.packageDir
    ? ok({ ok: true, display: `${PY} ${DIR}\\_tools\\tui_live.py --audio-file ${launch.audioFile ?? SONG} --start 60`, cwd: DIR, file: PY, args: [], audio: { format: 'mp4', label: 'MP4/AAC（DASH 分片）', mciPlayable: false, note: NOTE }, backend: 'pty' })
    : fail('找不到 Python 解释器，或它不是文件'),
  terminalStart: () => ok({ sessionId: 'mvterm-preview01', backend: 'pty' }),
  terminalRead: async ({ cursor }) => {
    if (sent) { await new Promise(resolve => setTimeout(resolve, 800)); return { ok: true, value: { ok: true, value: { data: '', cursor } } } }
    sent = true
    return ok({ data: ansiFrame(70.4, 140, 40), cursor: 1 })
  },
  terminalWrite: () => ok({}), terminalResize: () => ok({}), terminalStop: () => ok({}),
  consoleInfo: () => ok({ supported: true, platform: 'win32', consoles: [] }),
  consoleStart: () => ok({ consoleId: 'mvcon-preview01', pid: 4242 }), consoleStop: () => ok({}),
  packLoad: ({ path }) => ok(/Starlight/.test(path)
    ? { manifestPath: path, pack: { title: 'Starlight Run', artist: 'Alice', credits: ['由 AI 制作的示例 MV 包（仅用于界面预览）'], audio: { file: 'audio.wav' }, lyrics: { file: 'lyrics.lrc' }, canvas: { renderer: scene === 'ai' ? 'generic' : 'script', script: 'scenes.js' } }, files: { audio: { exists: true, size: 960044 }, lyrics: { exists: true, size: 200 }, scene: { exists: true, size: EXAMPLE_SCENE.length } }, warnings: [] }
    : { manifestPath: path, pack: { title: 'Ghost Rule', artist: 'DECO*27', credits: ['示例 MV 包（仅用于界面预览）'], canvas: { renderer: 'generic' } }, files: {}, warnings: [] }),
  packRead: ({ role, offset, length }) => {
    const bytes = role === 'audio' ? scriptAudioBytes() : enc.encode(role === 'scene' ? EXAMPLE_SCENE : role === 'lyrics' ? SCRIPT_LRC : '')
    const part = bytes.subarray(offset, offset + length)
    return ok({ name: role === 'audio' ? 'audio.wav' : role === 'scene' ? 'scenes.js' : 'lyrics.lrc', size: bytes.length, offset, bytes: part.length, done: offset + part.length >= bytes.length, base64: b64(part) })
  },
  packTemplate: () => fail('preview'),
  audioProbe: ({ path }) => ok(/\.wav$/i.test(path) ? { format: 'wav', label: 'WAV（PCM 16 bit）', size: 1, mci: true, mciPlayable: true, note: '' } : { format: 'mp4', label: 'MP4/AAC（DASH 分片）', size: 3752292, chromium: true, mciPlayable: false, note: NOTE, sha256: 'f98eaa'.padEnd(64, '0'), cachedWav: 'C:\\Users\\Alice\\AppData\\Local\\dsh-mv\\audio-cache\\f98eaa.wav' }),
  wavBegin: () => fail('preview'), wavWrite: () => fail('preview'), wavFinish: () => fail('preview'),
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
  if (scene === 'script') {
    localStorage.setItem('dsh-mv.packs.recent.v1', JSON.stringify([{ manifestPath: `${PACK_DIR}\\mv.json`, title: 'Starlight Run', artist: 'Alice' }, { manifestPath: 'D:\\MV\\Ghost Rule\\mv.json', title: 'Ghost Rule', artist: 'DECO*27' }]))
    localStorage.setItem('dsh-mv.packs.active.v1', `pack:${PACK_DIR}\\mv.json`)
  } else if (scene !== 'first') {
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
  if (!['first', 'canvas', 'ai', 'script'].includes(scene)) {
    localStorage.setItem('dsh-mv.terminal.form.v1', JSON.stringify({ player: 'python', packageDir: DIR, pythonPath: PY, audioFile: SONG, start: '60' }))
  }
  localStorage.setItem('dsh-mv.panel.destination', { first: 'canvas', canvas: 'canvas', terminal: 'panel', termplay: 'panel', console: 'console' }[scene] ?? 'canvas')
  createRoot(document.getElementById('root')).render(<MvPanel api={api} harness={harness} initialAi={scene === 'ai'} />)
}
void setup()
