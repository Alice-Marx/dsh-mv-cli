/**
 * The downloadable MV pack template: mv.json, its JSON Schema, a bilingual
 * README, three examples (world.execute(me), the dsh-pv preset as a pack, scene script) and a placeholder LRC. Generated text only — no song,
 * lyric or artwork data.
 */
import { EXAMPLE_SCENE, SCENE_LIMITS } from './mv-scene.mjs'
import { MV_CANVAS_RENDERERS, MV_PACK_FORMAT, MV_PACK_SCHEMA_FILE, MV_PACK_VERSION } from './mv-pack.mjs'

export const TEMPLATE_FOLDER = 'dsh-mv-pack-template'

const json = value => `${JSON.stringify(value, null, 2)}\n`

export const TEMPLATE_MANIFEST = Object.freeze({
  $schema: `./${MV_PACK_SCHEMA_FILE}`,
  format: MV_PACK_FORMAT,
  version: MV_PACK_VERSION,
  title: 'Song title / 歌名',
  artist: 'Artist / 歌手',
  credits: ['Music & lyrics: … (rights belong to their owners)', 'Pack made by: …'],
  notice: 'Personal use. The audio and lyric files are your own copies and are not redistributed.',
  audio: { file: 'song.mp3', offset: 0 },
  lyrics: { file: 'lyrics.lrc', offset: 0 },
  canvas: { renderer: 'generic' },
})

/** The built-in world.execute(me) preset written as a pack (put it in your world_execute_me folder). */
export const WORLD_EXECUTE_ME_EXAMPLE = Object.freeze({
  $schema: `../${MV_PACK_SCHEMA_FILE}`,
  format: MV_PACK_FORMAT,
  version: MV_PACK_VERSION,
  title: 'world.execute(me);',
  artist: 'Mili',
  credits: ['Song and lyrics © Mili', 'Scenes: yym8224961/world.execute-me-ascii (野生大K), ported with permission'],
  duration: 211.906667,
  audio: { file: 'input/song.mp3' },
  lyrics: { file: 'input/lyrics.lrc' },
  canvas: { renderer: 'world-execute-me' },
})

/** The built-in dsh-pv preset (MisakaZentai's world.execute(me) PV, real-time canvas port) written as a pack. */
export const DSH_PV_EXAMPLE = Object.freeze({
  $schema: `../${MV_PACK_SCHEMA_FILE}`,
  format: MV_PACK_FORMAT,
  version: MV_PACK_VERSION,
  title: 'world.execute(me); · 大肥鱼眼中的 world.execute(me)',
  artist: 'Mili',
  credits: ['Song and lyrics © Mili', 'PV: MisakaZentai/world-execute-me-dsh-pv (code MIT; whale-girl artwork CC BY-NC-SA 4.0), real-time canvas port'],
  duration: 211.913,
  audio: { file: 'input/song.mp3' },
  lyrics: { file: 'input/lyrics.lrc' },
  canvas: { renderer: 'dsh-pv' },
})

const fileRef = (description, offset) => ({
  oneOf: [
    { type: 'string', description },
    {
      type: 'object', additionalProperties: false, required: ['file'],
      properties: { file: { type: 'string', description }, ...(offset ? { offset: { type: 'number', minimum: -30, maximum: 30, description: offset } } : {}) },
    },
  ],
})

export const MV_PACK_JSON_SCHEMA = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'dsh-mv-pack/1',
  title: 'dsh-mv MV pack (mv.json)',
  type: 'object',
  required: ['format', 'version', 'title'],
  patternProperties: { '^x-': {} },
  additionalProperties: false,
  properties: {
    $schema: { type: 'string' },
    format: { const: MV_PACK_FORMAT },
    version: { const: MV_PACK_VERSION },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    artist: { type: 'string', maxLength: 200 },
    album: { type: 'string', maxLength: 200 },
    credits: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 500 } },
    notice: { type: 'string', maxLength: 4000 },
    duration: { type: 'number', minimum: 1, maximum: 36000, description: 'Song length in seconds; defaults to the audio length.' },
    audio: fileRef('Audio file, relative to this mv.json (no ..) or absolute.', 'Seconds added to the audio clock (sync).'),
    lyrics: fileRef('LRC / SRT / VTT / lyrics.json ([{time,end,en,zh}]).', 'Seconds added to lyric times.'),
    spectrum: fileRef('Optional spectrum.json ({fps, frames: number[48][]}).'),
    canvas: {
      type: 'object', additionalProperties: false, patternProperties: { '^x-': {} },
      properties: {
        renderer: { enum: MV_CANVAS_RENDERERS, default: 'generic', description: 'generic | world-execute-me | dsh-pv | script (needs canvas.script).' },
        script: { type: 'string', pattern: '\\.m?js$', description: 'Scene script (.js) for renderer "script": defines render(t, cols, rows, ctx). Runs sandboxed in the panel.' },
        fontSize: { type: 'number', minimum: 8, maximum: 32 },
      },
    },
    terminal: { deprecated: true, description: 'Ignored since 0.6.0: the panel no longer runs external TUI players.' },
  },
})

const README_EN = `# dsh-mv MV pack template

An MV pack is a folder with an \`mv.json\` file. It tells the **MV 放映室** panel of
DeepSeek Harness which song to play and how to draw it. You provide the audio and
lyric files. The pack is plain JSON; \`mv.schema.json\` gives editors such as
VS Code completion and checks.

## Quick start

1. Copy this folder and rename it (e.g. \`My Song\`).
2. Put your own audio file next to \`mv.json\` (e.g. \`song.mp3\`) and your lyrics
   (\`lyrics.lrc\`, \`.srt\`, \`.vtt\` or a \`lyrics.json\`). Replace \`lyrics.example.lrc\`.
3. Edit \`mv.json\`: title, artist, file names.
4. Harness → MV 放映室 → **导入 MV 包…** → choose the folder (or paste the path of
   \`mv.json\`). Importing never runs anything.

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| \`format\`, \`version\` | yes | Always \`"${MV_PACK_FORMAT}"\` and \`${MV_PACK_VERSION}\`. |
| \`title\` | yes | Song title. \`artist\`, \`album\` are optional. |
| \`credits\`, \`notice\` | no | Shown in the panel: who made what, rights notice. |
| \`duration\` | no | Seconds. Defaults to the audio file's length. |
| \`audio\` | no | \`{ "file": "song.mp3", "offset": 0 }\`. Without audio the MV plays silently. \`offset\` (±30 s) shifts the picture against the audio. |
| \`lyrics\` | no | \`{ "file": "lyrics.lrc", "offset": 0 }\`. Bilingual LRC: two lines with the same time stamp, or \`English / 中文\` on one line. |
| \`spectrum\` | no | \`{ "file": "spectrum.json" }\` with \`{ fps, frames }\` (48 bands per frame). Without it the panel analyses the audio live. |
| \`canvas.renderer\` | no | \`generic\` (spectrum bars + title + lyrics; works for any song), \`world-execute-me\` (the built-in world.execute(me) scenes, timed for that song only), \`dsh-pv\` (the built-in dsh-pv PV, also timed for world.execute(me) only) or \`script\` (your own scene script, see below). |
| \`canvas.script\` | no | \`scenes.js\`: the scene script for \`script\` (setting it implies \`renderer: "script"\`). |
| \`canvas.fontSize\` | no | 8–32 px. |

Paths are relative to the folder of \`mv.json\` (\`/\` or \`\\\\\`; \`..\` is not allowed)
or absolute. Unknown fields are errors; put your own data in fields starting with \`x-\`.
A \`terminal\` section from packs made for versions before 0.6.0 is ignored with a
warning (the panel no longer runs external players).

## Audio formats

Anything the panel's Chromium can decode works: MP3, M4A/AAC
(including DASH/fragmented MP4 downloads), the audio track of MP4/MOV/WebM/MKV
video files, Ogg Vorbis/Opus, FLAC, WAV (PCM / float / A-law / μ-law). The format
is detected from the file's content, not its extension. For a pack's audio in a
format Chromium cannot decode (WMA, AIFF, AMR, AC-3, APE, …) the panel offers to
convert it with ffmpeg if it is installed (PATH or \`D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe\`)
into a cached WAV (\`%LOCALAPPDATA%\\dsh-mv\\audio-cache\`); it asks before running it.

## Scene scripts (\`canvas.renderer: "script"\`)

\`\`\`json
"canvas": { "renderer": "script", "script": "scenes.js" }
\`\`\`

\`scenes.js\` defines \`render(t, cols, rows, ctx)\` (and optionally \`setup(info)\`). It returns
an array of \`rows\` strings, or \`{ lines, styles }\` where \`styles[y]\` has one digit per
cell (0 dim, 1 normal, 2 bright, 3 white, 4 red, 5 brown, 6 olive). \`ctx\` is
\`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused }\`
(\`lyric\`/\`next\`: \`{ text, en, zh, start, end }\` or null).

The script runs in a Web Worker without network, storage, DOM or imports. A frame
should take under ${SCENE_LIMITS.frameBudgetMs} ms; a script that throws, hangs for
${SCENE_LIMITS.hardTimeoutMs} ms or is too slow is stopped and the panel falls back to the
\`generic\` renderer. \`examples/scenes.example.js\` is a working example.

See \`examples/\` for the two built-in world.execute(me) presets written as packs
(put them in a folder with your own \`input/song.mp3\` and \`input/lyrics.lrc\`).
`

const README_ZH = `# dsh-mv MV 包模板

MV 包就是一个带 \`mv.json\` 的文件夹，告诉 DeepSeek Harness 的 **MV 放映室**：播放哪首歌、
用什么方式画。音频和歌词文件由你自己提供。清单是普通 JSON；\`mv.schema.json\` 让
VS Code 等编辑器提供补全和校验。

## 快速开始

1. 复制本文件夹并改名（例如 \`我的歌\`）。
2. 把你自己的音频（如 \`song.mp3\`）和歌词（\`lyrics.lrc\` / \`.srt\` / \`.vtt\` / \`lyrics.json\`）
   放到 \`mv.json\` 旁边（替换 \`lyrics.example.lrc\`）。
3. 编辑 \`mv.json\`：歌名、歌手、文件名。
4. Harness → MV 放映室 → **导入 MV 包…** → 选择该文件夹（或粘贴 \`mv.json\` 的路径）。导入不会运行任何程序。

## 字段

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| \`format\`、\`version\` | 是 | 固定为 \`"${MV_PACK_FORMAT}"\` 和 \`${MV_PACK_VERSION}\`。 |
| \`title\` | 是 | 歌名；\`artist\`、\`album\` 可选。 |
| \`credits\`、\`notice\` | 否 | 面板里显示的制作信息与版权说明。 |
| \`duration\` | 否 | 秒；默认取音频长度。 |
| \`audio\` | 否 | \`{ "file": "song.mp3", "offset": 0 }\`；没有音频时静音播放画面。\`offset\`（±30 秒）调整画面与音频的同步。 |
| \`lyrics\` | 否 | \`{ "file": "lyrics.lrc", "offset": 0 }\`；双语 LRC：同一时间戳写两行，或一行写 \`English / 中文\`。 |
| \`spectrum\` | 否 | \`{ "file": "spectrum.json" }\`，格式 \`{ fps, frames }\`（每帧 48 个频段）；不填则实时分析音频。 |
| \`canvas.renderer\` | 否 | \`generic\`（通用：频谱 + 标题 + 歌词，任何歌都能放）、\`world-execute-me\`（内置的 world.execute(me) 场景，只适合这首歌的时间轴）、\`dsh-pv\`（内置的 dsh-pv PV，同样只适合这首歌）或 \`script\`（你自己的场景脚本，见下）。 |
| \`canvas.script\` | 否 | \`scenes.js\`：\`script\` 渲染器用的场景脚本（填了它就默认 \`renderer: "script"\`）。 |
| \`canvas.fontSize\` | 否 | 8–32 像素。 |

路径相对于 \`mv.json\` 所在文件夹（\`/\` 或 \`\\\\\` 都行，不允许 \`..\`），也可以写绝对路径。
未知字段会报错；自定义数据请用 \`x-\` 开头的字段。0.6.0 之前的包里的 \`terminal\` 字段会被忽略并给出提示（面板不再运行外部播放器）。

## 音频格式

支持面板里 Chromium 能解码的一切格式：MP3、M4A/AAC（包括 DASH / 分片 MP4 下载文件）、
MP4/MOV/WebM/MKV 视频里的音轨、Ogg Vorbis/Opus、FLAC、WAV（PCM / 浮点 / A-law / μ-law）。
格式按文件内容判断，不看扩展名。MV 包里 Chromium 解不了的格式（WMA、AIFF、AMR、AC-3、APE…），
如果装了 ffmpeg（PATH 里或 \`D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe\`），面板可以用它转换成 WAV 缓存
（\`%LOCALAPPDATA%\\dsh-mv\\audio-cache\`），运行前会先征求你同意；原文件不变。

## 场景脚本（\`canvas.renderer: "script"\`）

\`\`\`json
"canvas": { "renderer": "script", "script": "scenes.js" }
\`\`\`

\`scenes.js\` 定义 \`render(t, cols, rows, ctx)\`（可选 \`setup(info)\`），返回 \`rows\` 行字符串数组，
或 \`{ lines, styles }\`：\`styles[y]\` 每个字符一位数字（0 暗、1 普通、2 亮、3 白、4 红、5 棕、6 橄榄）。
\`ctx\` 为 \`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused }\`
（\`lyric\`/\`next\`：\`{ text, en, zh, start, end }\` 或 null）。

脚本在 Web Worker 沙箱里运行：没有网络、存储、DOM，不能 import。每帧应在 ${SCENE_LIMITS.frameBudgetMs} 毫秒内完成；
脚本报错、卡住 ${SCENE_LIMITS.hardTimeoutMs} 毫秒或持续太慢时会被停止，面板自动换回 \`generic\` 通用画面。
\`examples/scenes.example.js\` 是一个能直接运行的示例。

\`examples/\` 里是用 MV 包写法表示的两个内置 world.execute(me) 预设（放进带有你自己的
\`input/song.mp3\` 和 \`input/lyrics.lrc\` 的文件夹即可）。
`

const LRC_EXAMPLE = `[ti:Song title]
[ar:Artist]
[offset:0]
[00:00.00]（这是占位歌词：请替换成你自己的歌词文件）
[00:05.00]First line in English
[00:05.00]第一句中文
[00:10.00]Second line / 第二句
[00:15.00]Instrumental …
`

/** Template files as [{ path, text }] (forward-slash relative paths). */
export function templateFiles() {
  return [
    { path: 'mv.json', text: json(TEMPLATE_MANIFEST) },
    { path: MV_PACK_SCHEMA_FILE, text: json(MV_PACK_JSON_SCHEMA) },
    { path: 'README.md', text: README_EN },
    { path: 'README.zh.md', text: README_ZH },
    { path: 'lyrics.example.lrc', text: LRC_EXAMPLE },
    { path: 'examples/world-execute-me.mv.json', text: json(WORLD_EXECUTE_ME_EXAMPLE) },
    { path: 'examples/dsh-pv.mv.json', text: json(DSH_PV_EXAMPLE) },
    { path: 'examples/scenes.example.js', text: EXAMPLE_SCENE },
  ]
}
