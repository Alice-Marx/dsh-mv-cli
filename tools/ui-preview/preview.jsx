/**
 * Stand-alone preview of the MV 放映室 panel for screenshots (not shipped).
 * A mock Host answers the remote calls; ?scene= picks the state:
 *   first    – first run, nothing configured
 *   canvas   – canvas with a (synthetic) audio file, ready to play
 *   terminal – 面板终端 with paths set and an MP4-renamed-.mp3 warning
 *   termplay – 面板终端 while playing (frame rendered by the canvas engine)
 *   console  – 独立窗口 with the confirmation card open
 * ?theme=dark sets body[data-ds-dark-theme] like Harness does.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MvPanel } from '../../.dsh-plugin/client/mv-panel.jsx'
import { openMediaStore, putMedia } from '../../.dsh-plugin/client/mv/media-store.mjs'
import { encodeWav } from '../../.dsh-plugin/client/mv-wav.mjs'
import { Film } from '../../.dsh-plugin/client/mv/film.mjs'
import { PALETTE, BOLD, rowRuns } from '../../.dsh-plugin/client/mv/renderer.mjs'

const query = new URLSearchParams(location.search)
const scene = query.get('scene') || 'first'
if (query.get('theme') === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
const ok = value => Promise.resolve({ ok: true, value: { ok: true, value } })
const fail = message => Promise.resolve({ ok: true, value: { ok: false, error: { message } } })
const DIR = 'F:\\everyAI\\dsh-mv-cli\\world_execute_me'
const PY = `${DIR}\\python\\python.exe`
const SONG = `${DIR}\\input\\song.mp3`
const WARN = `音频文件实际是 MP4/AAC（DASH 分片）（扩展名不代表格式）：tui_live.py 用 Windows MCI 放音，MCI 打不开这种文件，会静音播放画面。请点「转换为 WAV…」，或换一个真正的 MP3。${SONG}`

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
  info: () => ok({ hostVersion: query.get('stale') ? '0.2.0' : __DSH_MV_CLIENT_VERSION__, platform: 'win32', backend: 'pty', canvasFontSize: 14 }),
  terminalCheck: launch => launch.player === 'python' && launch.pythonPath && launch.packageDir
    ? ok({ ok: true, display: `${PY} ${DIR}\\_tools\\tui_live.py --audio-file ${launch.audioFile ?? SONG} --start 60`, cwd: DIR, file: PY, args: [], audio: { format: 'mp4', label: 'MP4/AAC（DASH 分片）', warning: WARN }, backend: 'pty' })
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
  packLoad: ({ path }) => ok({ manifestPath: path, pack: { title: 'Ghost Rule', artist: 'DECO*27', credits: ['示例 MV 包（仅用于界面预览）'], canvas: { renderer: 'generic' } }, files: {}, warnings: [] }),
  packRead: () => fail('preview'), packTemplate: () => fail('preview'),
  audioProbe: ({ path }) => ok(/\.wav$/i.test(path) ? { format: 'wav', label: 'WAV', size: 1, warning: '' } : { format: 'mp4', label: 'MP4/AAC（DASH 分片）', size: 3752292, warning: WARN }),
  wavBegin: () => fail('preview'), wavWrite: () => fail('preview'), wavFinish: () => fail('preview'),
}

async function setup() {
  localStorage.clear()
  const db = await openMediaStore()
  if (scene !== 'first') {
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
  if (scene !== 'first' && scene !== 'canvas') {
    localStorage.setItem('dsh-mv.terminal.form.v1', JSON.stringify({ player: 'python', packageDir: DIR, pythonPath: PY, audioFile: SONG, start: '60' }))
  }
  localStorage.setItem('dsh-mv.panel.destination', { first: 'canvas', canvas: 'canvas', terminal: 'panel', termplay: 'panel', console: 'console' }[scene] ?? 'canvas')
  createRoot(document.getElementById('root')).render(<MvPanel api={api} />)
}
void setup()
