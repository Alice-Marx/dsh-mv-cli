/**
 * Scene scripts: the `canvas.renderer: "script"` mode of MV packs. A scene
 * script is a plain JavaScript file (no imports, no DOM, no network) that
 * defines
 *
 *   function render(t, cols, rows, ctx) { return [ '…', '…' ] }
 *
 * returning the ASCII frame for time t (seconds) on a cols × rows grid, as an
 * array of lines or one string with "\n". It may instead return
 * { lines: [...], styles: [...] }, where each style line holds one digit per
 * cell: 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
 *
 * ctx = { duration, progress, title, artist, lyric, next, bands, energy, bass,
 *         mid, treble, ready, paused }
 *   lyric / next: { text, en, zh, start, end } or null
 *   bands: 48 numbers 0..1 (low → high frequencies); energy/bass/mid/treble 0..1
 *
 * The panel runs the script in a Web Worker with network and storage APIs
 * removed and a per-frame time budget; the Host runs the same code in a
 * node:vm context with a timeout for the agent tools. Any failure falls back to
 * the generic renderer. Shared, pure code: the runtime source below is
 * evaluated inside both sandboxes so validation matches playback.
 */
export const SCENE_LIMITS = Object.freeze({
  scriptBytes: 256 * 1024,
  /** A frame slower than this counts as slow; too many slow frames stop the script. */
  frameBudgetMs: 40,
  slowFramesAllowed: 45,
  /** No answer within this time: the worker is terminated. */
  hardTimeoutMs: 1500,
  /** Setup / first compile. */
  setupTimeoutMs: 2000,
  maxCols: 240,
  maxRows: 85,
})

/** Names removed from the worker global scope (and its prototypes) before the scene runs. */
export const SCENE_BLOCKED_GLOBALS = Object.freeze([
  'fetch', 'XMLHttpRequest', 'WebSocket', 'WebTransport', 'EventSource', 'importScripts', 'indexedDB', 'caches',
  'BroadcastChannel', 'Worker', 'SharedWorker', 'RTCPeerConnection', 'RTCDataChannel', 'Request', 'Response', 'Headers',
  'FileReader', 'FileReaderSync', 'Notification', 'navigator', 'location', 'open', 'close', 'storageFoundation',
  'WebAssembly', 'MessageChannel', 'importScripts',
])

/** Accept `export function render…` / `export default function…` written by habit. */
export function stripModuleSyntax(source) {
  return String(source)
    .replace(/^\uFEFF/, '')
    .replace(/^(\s*)export\s+default\s+(?=(?:async\s+)?function\b)/gm, '$1')
    .replace(/^(\s*)export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, '$1')
}

/** Problems that make a script unusable before running it (size, imports). */
export function sceneSourceProblems(source) {
  const problems = []
  const text = String(source ?? '')
  if (!text.trim()) problems.push('场景脚本是空的。')
  if (new TextEncoder().encode(text).length > SCENE_LIMITS.scriptBytes) problems.push(`场景脚本超过 ${SCENE_LIMITS.scriptBytes / 1024} KB。`)
  if (/^\s*import\s[^(]/m.test(text) || /\bimport\s*\(/.test(text) || /\brequire\s*\(/.test(text)) problems.push('场景脚本不能 import / require 其他模块（运行在没有文件和网络的沙箱里）。')
  return problems
}

/**
 * Source of the frame normaliser, evaluated inside the sandboxes. Defines
 * __mvNormalize(out, cols, rows) → { lines, styles } (strings, cropped and
 * padded; styles digits 0..6).
 */
export const SCENE_RUNTIME_SOURCE = String.raw`
function __mvNormalize(out, cols, rows) {
  var lines = out, styles = null
  if (out && typeof out === 'object' && !Array.isArray(out)) { lines = out.lines; styles = out.styles }
  if (typeof lines === 'string') lines = lines.split('\n')
  if (!Array.isArray(lines)) throw new TypeError('render() 必须返回字符串数组、带 \\n 的字符串，或 { lines, styles }')
  if (styles != null && typeof styles === 'string') styles = styles.split('\n')
  if (styles != null && !Array.isArray(styles)) throw new TypeError('styles 必须是字符串数组')
  var outLines = [], outStyles = []
  for (var y = 0; y < rows; y++) {
    var line = lines[y] == null ? '' : String(lines[y])
    if (line.length > cols * 4) line = line.slice(0, cols * 4)
    outLines.push(line.replace(/[\u0000-\u001f\u007f]/g, ' '))
    var style = styles && styles[y] != null ? String(styles[y]).slice(0, cols * 2).replace(/[^0-6]/g, '1') : ''
    outStyles.push(style)
  }
  return { lines: outLines, styles: outStyles }
}
`

/** Worker source: sandbox prelude, the user's scene, then the frame loop. */
export function sceneWorkerSource(userSource) {
  const blocked = JSON.stringify(SCENE_BLOCKED_GLOBALS)
  return `"use strict";
const __post = self.postMessage.bind(self);
const __listen = self.addEventListener.bind(self);
const __now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
(() => {
  const names = ${blocked};
  const seen = new Set();
  for (let o = self; o && !seen.has(o); o = Object.getPrototypeOf(o)) {
    seen.add(o);
    for (const name of names) { try { delete o[name] } catch (e) {} }
  }
  for (const name of names) { try { Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false }) } catch (e) {} }
  try { Object.defineProperty(self, 'postMessage', { value: undefined, writable: false, configurable: false }) } catch (e) {}
})();
${SCENE_RUNTIME_SOURCE}
let __scene = null, __setupError = '';
try {
  __scene = (function () {
${stripModuleSyntax(userSource)}
;return { render: typeof render === 'function' ? render : null, setup: typeof setup === 'function' ? setup : null };
  })();
  if (!__scene.render) __setupError = '场景脚本没有定义 render(t, cols, rows, ctx) 函数。';
} catch (error) { __setupError = String(error && error.stack || error); }
__listen('message', event => {
  const msg = event.data || {};
  if (msg.type === 'init') {
    if (!__setupError && __scene.setup) { try { __scene.setup(msg.info || {}) } catch (error) { __setupError = String(error && error.stack || error) } }
    __post({ type: 'ready', error: __setupError });
    return;
  }
  if (msg.type !== 'frame' || __setupError) return;
  const started = __now();
  try {
    const frame = __mvNormalize(__scene.render(msg.t, msg.cols, msg.rows, msg.ctx), msg.cols, msg.rows);
    __post({ type: 'frame', id: msg.id, frame, ms: __now() - started });
  } catch (error) {
    __post({ type: 'error', id: msg.id, error: String(error && error.stack || error).slice(0, 2000) });
  }
});
`
}

const SILENT = new Array(48).fill(0)
const avg = (bands, from, to) => { let s = 0; for (let i = from; i < to; i++) s += bands[i] ?? 0; return s / Math.max(1, to - from) }
const cueInfo = cue => cue ? { text: cue.en || cue.zh || '', en: cue.en || '', zh: cue.zh || '', start: cue.time, end: cue.end } : null

/** The ctx argument of render() (plain JSON data only). */
export function sceneContext({ t = 0, duration = 0, title = '', artist = '', cue = null, next = null, bands = SILENT, ready = false, paused = false } = {}) {
  const b = Array.from({ length: 48 }, (_, i) => Math.max(0, Math.min(1, Number(bands?.[i]) || 0)))
  return {
    duration, progress: duration > 0 ? Math.max(0, Math.min(1, t / duration)) : 0, title, artist,
    lyric: cueInfo(cue), next: cueInfo(next), bands: b,
    energy: avg(b, 0, 48), bass: avg(b, 0, 8), mid: avg(b, 8, 28), treble: avg(b, 28, 48), ready, paused,
  }
}

/** A small, valid example scene (also the starting point for AI-made packs). */
export const EXAMPLE_SCENE = String.raw`// scenes.js — scene script of a dsh-mv MV pack (canvas.renderer: "script").
// Runs in a sandbox: no DOM, no network, no imports. Keep each frame fast (< 40 ms).
//
// render(t, cols, rows, ctx) returns the frame: an array of rows lines (strings),
// or { lines, styles } where styles[y] has one digit per cell:
// 0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive.
// ctx: { duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused }
//   lyric / next: { text, en, zh, start, end } or null

function setup(info) {
  // Optional, called once: info = { title, artist, duration }.
}

function centered(text, cols) {
  const s = String(text).slice(0, cols)
  const left = Math.max(0, Math.floor((cols - s.length) / 2))
  return ' '.repeat(left) + s
}

function render(t, cols, rows, ctx) {
  const lines = [], styles = []
  for (let y = 0; y < rows; y++) {
    let line = '', style = ''
    for (let x = 0; x < cols; x++) {
      // A moving wave whose height follows the music.
      const band = ctx.bands[Math.min(47, Math.floor(x / cols * 48))]
      const wave = Math.sin(x * 0.15 + t * 2) * 0.5 + 0.5
      const level = rows - 1 - Math.floor((wave * 0.3 + band * 0.7) * (rows - 6))
      const on = y >= level && y < rows - 4
      line += on ? '#*+=-:.'[Math.min(6, y - level)] || '.' : ' '
      style += on ? (y - level < 2 ? '3' : y - level < 4 ? '2' : '1') : '0'
    }
    lines.push(line); styles.push(style)
  }
  lines[1] = centered(ctx.title + (ctx.artist ? ' - ' + ctx.artist : ''), cols); styles[1] = '2'.repeat(cols)
  if (ctx.lyric) { lines[rows - 3] = centered(ctx.lyric.text, cols); styles[rows - 3] = '3'.repeat(cols) }
  if (ctx.lyric && ctx.lyric.zh && ctx.lyric.en) { lines[rows - 2] = centered(ctx.lyric.zh, cols); styles[rows - 2] = '2'.repeat(cols) }
  return { lines, styles }
}
`
