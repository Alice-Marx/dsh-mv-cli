#!/usr/bin/env node
// Builds the workshop pack "world-execute-me-wallpaper" from a checkout of
// https://github.com/seasnakes/world.execute-me-wallpaper (MIT).
//   node presets/ports/wallpaper/build.mjs <checkout> <out-dir> [--cover file.png]
// Adapted: common.js + scenes2.js (the canvas renderer) become a pixel scene script
// (canvas.output "pixels", paint(g, t, w, h, ctx)); analysis.js (beat / spectrum data of the
// recording) becomes canvas.assets JSON shards; events.js is inlined. Not included: the audio,
// lyrics-data.js (lyric text; the card draws YOUR lyrics file instead), the Claude UI mock-up,
// Wallpaper Engine glue (wallpaper.js, project.json, index.html).
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const [src, out] = process.argv.slice(2)
const coverAt = process.argv.indexOf('--cover')
const cover = coverAt > 0 ? process.argv[coverAt + 1] : null
if (!src || !out) { console.error('usage: build.mjs <checkout> <out-dir> [--cover png]'); process.exit(2) }
const read = f => readFileSync(join(src, f), 'utf8').replace(/\r\n/g, '\n')
const load = (file, name) => { const box = { window: {} }; vm.runInNewContext(read(file), box); return box.window[name] }

const ID = 'world-execute-me-wallpaper'
const REPO = 'https://github.com/seasnakes/world.execute-me-wallpaper'
const COMMIT = process.env.SRC_COMMIT || ''

const A = load('analysis.js', 'ANALYSIS')
const EV = load('events.js', 'EV')
const license = read('LICENSE')

// --- scene script -----------------------------------------------------------
function body(file) {
  let s = read(file).replace(/^'use strict';\s*/, '')
  const swaps = [
    ['const A = window.ANALYSIS;', 'const A = __analysis;'],
    ["const cv = document.getElementById('c');", 'const cv = __canvas;'],
    ["function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }", 'function mk(w, h) { return new OffscreenCanvas(w, h); }'],
    ["String.fromCharCode(v)", "PRINTABLE[v - 32]"],
    ['const EV = window.EV;', 'const EV = __events;'],
    ["window.renderFrame = i => { drawFrame(i); return cv.toDataURL('image/jpeg', 0.93); };\n", ''],
    ['window.NFRAMES = A.nframes;\n', ''],
    ['window.READY = true;\n', ''],
  ]
  for (const [a, b] of swaps) if (s.includes(a)) s = s.split(a).join(b)
  return s
}
const common = body('common.js'), scenes = body('scenes2.js')
const lyricCard = readFileSync(join(here, 'lyric-card.js'), 'utf8')
const PRINTABLE = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('')
const script = `// world.execute(me); — Wallpaper MV, as a dsh-mv pixel scene (canvas.output "pixels").
// Original: ${REPO}${COMMIT ? ` (commit ${COMMIT.slice(0, 12)})` : ''}
// Copyright (c) 2026 seasnakes — MIT License (see LICENSE.txt). Adapted for dsh-mv by Alice-Marx:
// the renderer (common.js + scenes2.js) is unchanged apart from running on an OffscreenCanvas
// in the plugin's sandbox; the beat / spectrum analysis comes from canvas.assets; lyrics are
// YOUR lyrics file (ctx.lyric) drawn in the original's bilingual card. No audio, no lyric text.
// Music and lyrics: Mili — world.execute(me); (https://projectmili.com/copyright-guidelines)

const PRINTABLE = ${JSON.stringify(PRINTABLE)};
const __events = ${JSON.stringify(EV)};
let __analysis = null, __film = null, __canvas = null;

function setup(info) {
  __analysis = info && info.assets ? info.assets.analysis : null;
}

function __build() {
// ---- common.js -------------------------------------------------------------
${common}
// ---- scenes2.js ------------------------------------------------------------
${scenes}
  return { drawFrame, frames: A.nframes, fps: FPS };
}

// ---- lyric card (lyrics.js / lyrics.css) ------------------------------------
${lyricCard}

function paint(g, t, width, height, ctx) {
  if (!__analysis) {
    g.fillStyle = '#05060a'; g.fillRect(0, 0, width, height);
    g.fillStyle = '#e6edf5'; g.font = '32px monospace'; g.textAlign = 'center';
    g.fillText('analysis data missing (canvas.assets.analysis)', width / 2, height / 2);
    return;
  }
  if (!__film || __canvas !== g.canvas) { __canvas = g.canvas; __film = __build(); }
  __film.drawFrame(Math.max(0, Math.min(__film.frames - 1, t * __film.fps)));
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  drawLyricCard(g, ctx.lyric, width, height);
}
`
rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, 'data'), { recursive: true })
writeFileSync(join(out, 'scenes.js'), script)

// --- analysis shards ----------------------------------------------------------
const { spec, ...rest } = A
const half = Math.ceil(spec.length / 2)
const shards = [rest, { spec: spec.slice(0, half) }, { spec: spec.slice(half) }]
shards[0].spec = []
shards.forEach((s, i) => writeFileSync(join(out, 'data', `analysis-${i + 1}.json`), JSON.stringify(s)))
writeFileSync(join(out, 'data', 'NOTICE.md'), `# data/

\`analysis-*.json\` is \`analysis.js\` of ${REPO} (MIT, © 2026 seasnakes), split into shards
(\`spec\` is concatenated in order): beat grid, drum hits, loudness features and a 16-band spectrum per
frame (30 fps) of the recording of Mili's "world.execute(me);". It is analysis data only — no audio and
no lyric text. Bring your own copy of the song to play the pack.
`)

// --- manifest, docs -----------------------------------------------------------
const duration = Math.round(A.duration * 1000) / 1000
const sections = [
  ['intro', 'Boot', 0, 32], ['verse', 'Flight', 32, 60.5], ['verse', 'Math', 60.5, 94.5], ['verse', 'Travel', 94.5, 126], ['chorus', 'Chorus', 126, 158.5],
  ['verse', 'Food', 158.5, 190.5], ['verse', 'Switch', 190.5, 222], ['bridge', 'Leave', 222, 254.5], ['bridge', 'Erase', 254.5, 288], ['interlude', 'Kaleido', 288, 318],
  ['drop', 'EXECUTION', 318, 350.5], ['chorus', 'Final', 350.5, 382.5], ['outro', 'Love', 382.5, 416], ['outro', 'Outro', 416, 448],
].map(([kind, label, b0, b1]) => ({ kind, label, start: Math.round((A.t0 + b0 * 60 / A.bpm) * 1000) / 1000, end: Math.round(Math.min(A.duration, A.t0 + b1 * 60 / A.bpm) * 1000) / 1000 }))
const manifest = {
  $schema: './mv.schema.json',
  format: 'dsh-mv-pack', version: 1,
  title: 'world.execute(me); · Wallpaper MV',
  artist: 'Mili',
  credits: [
    'Visuals: seasnakes — world.execute(me); MV / Wallpaper Engine wallpaper (MIT), https://github.com/seasnakes/world.execute-me-wallpaper',
    'Music and lyrics: Mili — world.execute(me);',
    'dsh-mv adaptation: Alice-Marx',
  ],
  notice: 'Bring your own audio: this pack has no music and no lyric text. Choose your copy of Mili\'s "world.execute(me);" (and, if you like, your own lyrics file for the bilingual card).',
  duration,
  canvas: {
    renderer: 'script', script: 'scenes.js', output: 'pixels', size: [1920, 1080], bpm: A.bpm, beatOffset: A.t0,
    assets: { analysis: shards.map((_, i) => `data/analysis-${i + 1}.json`) },
  },
  'x-dsh-mv-ai': { sections },
  'x-dsh-mv-workshop': {
    id: ID, version: '1.0.0', license: 'MIT', author: 'Alice-Marx',
    description: 'seasnakes 的 world.execute(me); 动态壁纸 MV（1920×1080 画布动画，随原曲节拍与频谱同步），原样移植为像素场景；双语歌词卡片显示你自己的歌词文件。需要插件 0.9.1+。',
    tags: ['world.execute(me)', 'Mili', 'wallpaper', 'canvas', 'pixels'],
    source: REPO, homepage: `https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/${ID}`,
    requires: '0.9.1',
    audio: { duration },
  },
}
writeFileSync(join(out, 'mv.json'), `${JSON.stringify(manifest, null, 2)}\n`)
writeFileSync(join(out, 'LICENSE.txt'), license.endsWith('\n') ? license : `${license}\n`)
writeFileSync(join(out, 'NOTICE.md'), `# NOTICE — ${manifest.title}

- **Original / 原作:** [seasnakes/world.execute-me-wallpaper](${REPO})${COMMIT ? ` (commit \`${COMMIT.slice(0, 12)}\`)` : ''} —
  the code of the B 站 video 【Opus5.5 一句话生成 world.execute(me); mv】 and its Wallpaper Engine wallpaper.
- **License:** the original code is MIT, © 2026 seasnakes — full text in [LICENSE.txt](LICENSE.txt). This
  adaptation (scenes.js, data/) is distributed under the same MIT license.
- **Changes (Alice-Marx, 2026-10):** common.js + scenes2.js run as a dsh-mv pixel scene script on an
  OffscreenCanvas (DOM lookups replaced, \`String.fromCharCode\` replaced by a lookup table); analysis.js
  moved to \`data/analysis-*.json\`; events.js inlined; the HTML lyric card redrawn on the canvas from the
  user's own lyrics. Removed: audio, \`lyrics-data.js\` (lyric text), the "Claude UI" mock-up, Wallpaper Engine glue.
- **Music and lyrics:** Mili — "world.execute(me);". Not included. Rights belong to Mili and the respective
  rights holders; see https://projectmili.com/copyright-guidelines . The original repository is marked
  “仅供交流学习使用” (for exchange and study).
`)
writeFileSync(join(out, 'README.md'), `# ${manifest.title}

**Original / 原作:** [seasnakes/world.execute-me-wallpaper](${REPO}) · MIT

seasnakes 的 world.execute(me); 动态壁纸 MV（原为网页 / Wallpaper Engine 壁纸，1920×1080 Canvas 动画，按原曲的节拍与频谱逐帧同步），
移植为 dsh-mv 的**像素场景脚本**（\`canvas.output: "pixels"\`，需要 dsh-mv-cli **0.9.1** 或更新）。

- 不带音乐、不带歌词文本：安装后选择你自己的《world.execute(me);》音频（约 ${Math.round(duration)} 秒）；
  想看双语歌词卡片，再选你自己的歌词文件（LRC，可带中文翻译）。
- 画面完全由时间决定，可随意拖动进度；节拍 / 频谱来自原作的分析数据（\`data/\`），不是实时频谱。
- 未移植：原作默认关闭的 “Claude 对话动画”、壁纸属性面板。

See [NOTICE.md](NOTICE.md) for attribution and changes.
`)
if (cover) copyFileSync(cover, join(out, 'cover.png'))
console.log(`wrote ${out}: scenes.js ${script.length} chars, ${shards.length} analysis shards`)
