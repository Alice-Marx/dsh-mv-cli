/**
 * The downloadable MV pack template: mv.json, its JSON Schema, a bilingual
 * README, examples (scene scripts, a full example pack), AI prompt
 * templates (prompts/zh, prompts/en) and a placeholder LRC. Generated text only — no song, lyric or artwork data.
 * The example scenes and prompts live in template/** and are generated into mv-template-assets.gen.mjs.
 */
import { EXAMPLE_SCENE, SCENE_LIMITS } from './mv-scene.mjs'
import { MV_RENDERERS_BUILTIN, MV_PACK_FORMAT, MV_PACK_SCHEMA_FILE, MV_PACK_VERSION } from './mv-pack.mjs'
import { TEMPLATE_ASSETS } from './mv-template-assets.gen.mjs'

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
    lyrics: fileRef('LRC / SRT / VTT / lyrics.json ([{time,end,en,zh}]) or lyrics.js / .mjs (static LYRICS = [{t,en,cn}]; never executed). Workshop packs (0.9.4+) may include explicitly licensed, attributed lyrics via a package-relative file.', 'Seconds added to lyric times.'),
    spectrum: fileRef('Optional spectrum.json ({fps, frames: number[48][]}).'),
    canvas: {
      type: 'object', additionalProperties: false, patternProperties: { '^x-': {} },
      properties: {
        renderer: { enum: MV_RENDERERS_BUILTIN, default: 'generic', description: 'generic | script (needs canvas.script) | dsh-pv (needs canvas.assets; used by the dsh PV workshop pack).' },
        assets: { type: 'object', description: 'Data files a renderer reads (name → relative .json/.webp/.png path, or a list of JSON shards). Used by dsh-pv; since 0.9.1 scene scripts get them in setup(info).assets. Since 0.9.5 only dsh-pv font-head / font-banner may name the supported local OFL TTF files.', properties: { 'font-head': { const: 'fonts/SpaceMono-Bold.ttf' }, 'font-banner': { const: 'fonts/Anton-Regular.ttf' } }, additionalProperties: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] } },
        output: { enum: ['text', 'pixels', 'webgl'], default: 'text', description: 'text: render(t, cols, rows, ctx); pixels (0.9.1+): paint(g, t, width, height, ctx) on Canvas2D; webgl (0.9.2+): setup(info, gl), paint(gl, t, width, height, ctx) on sandbox-owned WebGL2. Bundle dependencies before importing.' },
        size: { type: 'array', items: { type: 'integer' }, minItems: 2, maxItems: 2, default: [1280, 720], description: 'Bitmap scenes: canvas size [width, height] (160–1920 × 90–1080), letterboxed in the panel.' },
        subtitles: { type: 'boolean', default: false, description: '0.9.3+: opt-in player overlay of local or installed workshop lyric cues; only renderer "script" with output "pixels" or "webgl". Keep off if the scene draws its own subtitles.' },
        script: { type: 'string', pattern: '\\.m?js$', description: 'Scene script (.js) for renderer "script": defines render(t, cols, rows, ctx). Runs sandboxed in the panel.' },
        fontSize: { type: 'number', minimum: 8, maximum: 32 },
        bpm: { type: 'number', minimum: 20, maximum: 400, description: 'Song tempo for scene scripts: ctx.beat = { bpm, index, bar, phase, pulse }.' },
        beatOffset: { type: 'number', minimum: -60, maximum: 60, description: 'Time of the first beat in seconds (default 0).' },
      },
      allOf: [{ if: { required: ['assets'], properties: { assets: { anyOf: [{ required: ['font-head'] }, { required: ['font-banner'] }] } } }, then: { required: ['renderer'], properties: { renderer: { const: 'dsh-pv' } } } }],
    },
    'x-dsh-mv-workshop': {
      type: 'object', additionalProperties: true,
      description: 'Workshop metadata. Publishing requires id, version, license and author. If lyrics is present, also declare lyricsLicense and lyricsCredit; scene-code licensing does not grant lyric/translation distribution rights. Music/video never ship in a workshop pack.',
      properties: {
        id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$' },
        version: { type: 'string', pattern: '^\\d{1,4}\\.\\d{1,4}\\.\\d{1,4}$' },
        requires: { type: 'string', description: 'Minimum plugin version. A workshop pack with lyrics or spectrum requires 0.9.4 or newer.' },
        license: { type: 'string', minLength: 1, maxLength: 120, description: 'Shareable license for the pack/visual code, not automatically its lyrics or music.' },
        author: { type: 'string', minLength: 1, maxLength: 120 },
        lyricsLicense: { type: 'string', minLength: 1, maxLength: 120, description: 'Required when sharing lyric text: explicit distribution terms covering lyrics and translations, including any non-commercial restrictions. Unknown, UNLICENSED or pending permission is rejected; this is never inferred from MIT scene code.' },
        lyricsCredit: { type: 'string', minLength: 1, maxLength: 500, description: 'Required lyric author and translator attribution, kept with the installed pack.' },
        lyricsSource: { type: 'string', maxLength: 300, pattern: '^https://[^\\s"<>]{3,300}$', description: 'Optional HTTPS source or authorization/guideline link; not a remote lyric file to load.' },
        lyricsTiming: { type: 'string', description: 'Optional lyrics.timing.json: pure cue times and normalized-text hashes only, never text.' },
        fontsLicense: { const: 'OFL-1.1', description: 'Required when dsh-pv includes its supported OFL font files; not inherited from scene-code licensing.' },
        fontsCredit: { type: 'string', minLength: 1, maxLength: 500, description: 'Required original font authors/copyright attribution.' },
        fontsNotice: { const: 'fonts/NOTICE.md', description: 'Required bundled font attribution notice; include each matching fonts/OFL_*.txt in full.' },
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
   (\`lyrics.lrc\`, \`.srt\`, \`.vtt\`, \`lyrics.json\` or \`lyrics.js\`). Replace \`lyrics.example.lrc\`.
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
| \`canvas.renderer\` | no | \`generic\` (spectrum bars + title + lyrics; works for any song), \`script\` (your own scene script, see below) or \`dsh-pv\` (the dsh PV renderer; its data comes from \`canvas.assets\`, see the dsh PV pack in 创意工坊). |
| \`canvas.script\` | no | \`scenes.js\`: the scene script for \`script\` (setting it implies \`renderer: "script"\`). |
| \`canvas.fontSize\` | no | 8–32 px. |
| \`canvas.bpm\`, \`canvas.beatOffset\` | no | Tempo (20–400) and first-beat time for scene scripts (\`ctx.beat\`). |
| \`canvas.output\`, \`canvas.size\` | no | \`"pixels"\` (0.9.1+) draws Canvas2D with \`paint(g, t, width, height, ctx)\`; \`"webgl"\` (0.9.2+) draws WebGL2 with \`paint(gl, t, width, height, ctx)\`. Size defaults to \`[1280, 720]\`. \`setup(info, gl)\` receives JSON/ImageBitmap assets; WebGL also gets \`info.canvas\`, a minimal facade for an explicitly supplied Three.js context. |
| \`canvas.subtitles\` | no | \`true\` (0.9.3+) overlays the user's local bilingual lyrics on a \`script\` bitmap (\`pixels\` / \`webgl\`). Defaults to \`false\`; leave off when the scene already draws subtitles. |
| \`x-dsh-mv-ai.sections\` | no | Song sections \`[{ kind, label, start, end }]\` for scene scripts (\`ctx.section\`). |
| \`x-dsh-mv-workshop\` | no | Workshop data (id, version, license, author, audio duration / fingerprint; explicit lyric terms/credits when included); written by 发布到工坊. |

Paths are relative to the folder of \`mv.json\` (\`/\` or \`\\\\\`; \`..\` is not allowed)
or absolute. Unknown fields are errors; put your own data in fields starting with \`x-\`.
A \`terminal\` section from packs made for versions before 0.6.0 is ignored with a
warning (the panel no longer runs external players).

Local \`lyrics.js\` / \`.mjs\` files may declare a static \`LYRICS\` array with
\`{ t, en, cn }\` entries, including \`export const LYRICS = [...]\` as in
wiers-jack's MV. Only those data literals are read; helper functions are not
executed, and expressions or imports inside the data are not supported. Do not
rename JavaScript to JSON.

## Complete workshop packs (0.9.4+)

Publishing removes **only music/video**. With the necessary permissions, keep
lyrics, translations, cue timing, precomputed spectrum, cover art, scene code and
all referenced \`canvas.assets\` together. Install/update downloads every indexed
file, verifies its SHA256 and automatically loads the declared lyric and spectrum
files. The listener only needs to supply their own music; older timing-only packs
remain supported and can still use a local lyric file.

- Point \`lyrics.file\` to a package-relative LRC/SRT/VTT/JSON/TXT/JS/MJS file,
  and declare \`x-dsh-mv-workshop.lyricsLicense\` (explicit sharing terms) plus
  \`lyricsCredit\` (lyric author/translator). \`lyricsSource\` is an optional
  HTTPS source or permission/guideline link, not a remote download reference.
- Lyric and translation rights are independent of the visual code's MIT or
  other license. Respect non-commercial and attribution conditions. Pending or
  unknown permission is not publishable; no license is filled in automatically.
- Lyric JS is data, never a scene: only a static \`LYRICS\` array is read, with
  no execution/imports. Lyrics and spectrum data are limited to 512 KiB each.
  \`lyrics.timing.json\` remains times/hashes only, even in a complete pack.
- \`spectrum.file\` may reference local \`{ fps, bands?, frames }\` JSON with
  consistent numeric bands in 0–1 (not audio samples or base64 music). No spectrum
  file is necessary when using the live analyser. These packs require 0.9.4+.

## Optional dsh-pv fonts (0.9.5+)

The dsh-pv renderer may declare \`canvas.assets["font-head"] = "fonts/SpaceMono-Bold.ttf"\`
and \`canvas.assets["font-banner"] = "fonts/Anton-Regular.ttf"\`. Each is one local TTF
file, at most 512 KiB, loaded from pack bytes with fixed scoped font families and
weights. Other font keys, font shards, URLs and script-supplied font faces are
not supported. Declared fonts must load successfully; undeclared fonts preserve
the older local/system fallback behavior.

When publishing them, declare \`fontsLicense: "OFL-1.1"\`, \`fontsCredit\` and
\`fontsNotice: "fonts/NOTICE.md"\` in \`x-dsh-mv-workshop\`. Include that attribution
notice and the matching full \`fonts/OFL_spacemono.txt\` / \`fonts/OFL_anton.txt\`.
These font terms are independent of the visual code and artwork. Windows fonts
such as Consolas, Microsoft YaHei and Segoe UI are only used when installed on
the listener's computer; do not copy their font files or glyph atlases into a pack.

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
\`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused, section, sections, beat }\`:

- \`lyric\`: \`{ text, en, zh, start, end, progress, words: [{ text, start, end }], word }\` or null. Words come from
  enhanced-LRC word stamps (\`[00:12.00]<00:12.00>first <00:12.50>word\`), otherwise they are estimated; \`word\`
  is the index of the word being sung. \`next\` is the next line (without words).
- \`section\`: \`{ kind, label, start, end, index, progress }\` from \`x-dsh-mv-ai.sections\`, or null.
- \`beat\`: \`{ bpm, index, bar, phase, pulse }\` when \`canvas.bpm\` is set, else null.

The script runs in a Web Worker without network, storage, DOM or imports. A frame
should take under ${SCENE_LIMITS.frameBudgetMs} ms; a script that throws, hangs for
${SCENE_LIMITS.hardTimeoutMs} ms or is too slow is stopped and the panel falls back to the
\`generic\` renderer. \`examples/scenes.example.js\` is a working example.

### Real 3D (0.9.2+)

Use \`"canvas": { "renderer": "script", "script": "scenes.js", "output": "webgl", "size": [1280, 720] }\`.
WebGL scenes must define \`paint(gl, t, w, h, ctx)\`; initialize GPU resources in
\`setup(info, gl)\`. A bundled Three.js renderer must use
\`new THREE.WebGLRenderer({ canvas: info.canvas, context: gl })\`, never DOM or its own animation loop.
Scene time comes from \`t\`, not accumulated frame deltas: seeking must reconstruct the same frame.
Text/pixels scenes remain limited to 256 KiB; WebGL scenes to 2 MiB, with a 100 ms bitmap frame budget.
The Node preview records calls only; verify shader compilation, textures and output in a real browser.
HTML, remote/CDN imports, fetch, timers and DOM-dependent libraries are not supported.

The former built-in world.execute(me) presets are now workshop packs (MV 放映室 → 创意工坊);
install one and open its folder to see a complete script pack and a \`canvas.assets\` pack.
`

const README_ZH = `# dsh-mv MV 包模板

MV 包就是一个带 \`mv.json\` 的文件夹，告诉 DeepSeek Harness 的 **MV 放映室**：播放哪首歌、
用什么方式画。音频和歌词文件由你自己提供。清单是普通 JSON；\`mv.schema.json\` 让
VS Code 等编辑器提供补全和校验。

## 快速开始

1. 复制本文件夹并改名（例如 \`我的歌\`）。
2. 把你自己的音频（如 \`song.mp3\`）和歌词（\`lyrics.lrc\` / \`.srt\` / \`.vtt\` / \`lyrics.json\` / \`lyrics.js\`）
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
| \`canvas.renderer\` | 否 | \`generic\`（通用：频谱 + 标题 + 歌词，任何歌都能放）、\`script\`（你自己的场景脚本，见下）或 \`dsh-pv\`（dsh PV 渲染器，数据来自 \`canvas.assets\`，参考创意工坊里的 dsh PV 包）。 |
| \`canvas.script\` | 否 | \`scenes.js\`：\`script\` 渲染器用的场景脚本（填了它就默认 \`renderer: "script"\`）。 |
| \`canvas.fontSize\` | 否 | 8–32 像素。 |
| \`canvas.bpm\`、\`canvas.beatOffset\` | 否 | 歌曲速度（20–400）和第一拍时间，供场景脚本使用（\`ctx.beat\`）。 |
| \`canvas.output\`、\`canvas.size\` | 否 | \`"pixels"\`（0.9.1+）用 \`paint(g, t, width, height, ctx)\` 画 Canvas2D；\`"webgl"\`（0.9.2+）用 \`paint(gl, t, width, height, ctx)\` 画 WebGL2。默认大小 \`[1280, 720]\`。\`setup(info, gl)\` 接收 JSON/ImageBitmap 素材；WebGL 还收到供 Three.js 显式上下文使用的最小 \`info.canvas\` 接口。 |
| \`canvas.subtitles\` | 否 | \`true\`（0.9.3+）在 \`script\` 的 \`pixels\` / \`webgl\` 画面上叠加用户本地双语歌词。默认 \`false\`；场景已自行画字幕时不要打开，以免重复。 |
| \`x-dsh-mv-ai.sections\` | 否 | 歌曲段落 \`[{ kind, label, start, end }]\`，供场景脚本使用（\`ctx.section\`）。 |
| \`x-dsh-mv-workshop\` | 否 | 创意工坊信息（id、版本、许可、作者、音频时长 / 指纹；包含歌词时另写授权条款与署名），由「发布到工坊」写入。 |

路径相对于 \`mv.json\` 所在文件夹（\`/\` 或 \`\\\\\` 都行，不允许 \`..\`），也可以写绝对路径。
未知字段会报错；自定义数据请用 \`x-\` 开头的字段。0.6.0 之前的包里的 \`terminal\` 字段会被忽略并给出提示（面板不再运行外部播放器）。

本地 \`lyrics.js\` / \`.mjs\` 支持静态 \`LYRICS\` 数组中的 \`{ t, en, cn }\` 数据，
包括 wiers-jack MV 使用的 \`export const LYRICS = [...]\`。只读取数据字面量，不执行
后面的辅助函数，也不支持数组内的表达式或导入。无需把 JS 改名为 JSON。

## 完整工坊包（0.9.4+）

发布时**仅去掉歌曲音频 / 视频**。取得相应许可后，歌词、译文、时间轴、预计算频谱、
封面、场景代码与所有引用的 \`canvas.assets\` 可以一同保留。安装 / 更新会下载索引中的
每个文件、校验 SHA256，并自动加载清单声明的歌词和频谱；听众只需补自己的音乐。
旧的纯时间轴包仍然兼容，也可以手动选择本地歌词。

- \`lyrics.file\` 引用包内相对路径的 LRC/SRT/VTT/JSON/TXT/JS/MJS；同时填写
  \`x-dsh-mv-workshop.lyricsLicense\`（明确的歌词与译文分发条款）和
  \`lyricsCredit\`（词作者 / 译者署名）。\`lyricsSource\` 可选，填 HTTPS 来源 / 授权 / 指南链接，
  不是运行时远程下载歌词的地址。
- 歌词和译文权利不自动继承画面代码的 MIT 等许可；非商业、署名等条件必须分别遵守。
  未知许可或待授权不能发布，插件不会自动填写歌词许可。
- 歌词 JS 只读取静态 \`LYRICS\` 数据，不作为场景执行或导入。歌词与频谱单文件各限
  512 KiB；\`lyrics.timing.json\` 始终只允许时间和哈希，不含文字。
- \`spectrum.file\` 可引用包内 \`{ fps, bands?, frames }\` JSON，频段宽度一致、数值 0–1，
  不能携带音频采样或 base64 音乐；使用实时分析时不必提供。此类完整包需要插件 0.9.4+。

## 可选的 dsh-pv 字体（0.9.5+）

dsh-pv 渲染器可声明 \`canvas.assets["font-head"] = "fonts/SpaceMono-Bold.ttf"\`
和 \`canvas.assets["font-banner"] = "fonts/Anton-Regular.ttf"\`。每项只能是一个包内 TTF
文件，限 512 KiB，以固定的作用域字体名和字重从包内字节加载；不接受其他字体键、
字体分片、URL 或脚本指定的字体名称。已声明字体加载失败会明确报错；旧包未声明字体时，
继续使用本机 / 系统后备字体。

发布时在 \`x-dsh-mv-workshop\` 中声明 \`fontsLicense: "OFL-1.1"\`、
\`fontsCredit\` 和 \`fontsNotice: "fonts/NOTICE.md"\`，随包保留该署名说明及对应的
\`fonts/OFL_spacemono.txt\` / \`fonts/OFL_anton.txt\` 许可全文。字体许可不继承画面代码或
立绘的许可。Consolas、微软雅黑、Segoe UI 等 Windows 字体只使用听众本机已安装版本，
不能把字体文件或逐字符图集复制进工坊包。

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
\`ctx\` 为 \`{ duration, progress, title, artist, lyric, next, bands[48], energy, bass, mid, treble, ready, paused, section, sections, beat }\`：

- \`lyric\`：\`{ text, en, zh, start, end, progress, words: [{ text, start, end }], word }\` 或 null。逐词时间来自增强 LRC
  （\`[00:12.00]<00:12.00>第一 <00:12.50>个词\`），没有时自动估计；\`word\` 是正在唱的词的下标。\`next\` 是下一句（没有 words）。
- \`section\`：来自 \`x-dsh-mv-ai.sections\` 的 \`{ kind, label, start, end, index, progress }\`，或 null。
- \`beat\`：设置了 \`canvas.bpm\` 时为 \`{ bpm, index, bar, phase, pulse }\`，否则 null。

脚本在 Web Worker 沙箱里运行：没有网络、存储、DOM，不能 import。每帧应在 ${SCENE_LIMITS.frameBudgetMs} 毫秒内完成；
脚本报错、卡住 ${SCENE_LIMITS.hardTimeoutMs} 毫秒或持续太慢时会被停止，面板自动换回 \`generic\` 通用画面。
\`examples/scenes.example.js\` 是一个能直接运行的示例。

### 真正 3D（0.9.2+）

设置 \`"canvas": { "renderer": "script", "script": "scenes.js", "output": "webgl", "size": [1280, 720] }\`。
定义 \`paint(gl, t, w, h, ctx)\`，在 \`setup(info, gl)\` 初始化 GPU 资源；已打包的 Three.js 使用
\`new THREE.WebGLRenderer({ canvas: info.canvas, context: gl })\`，不能依赖 DOM 或自己的动画循环。
从绝对时间 \`t\` 重建画面，不累积帧 delta；拖动进度后同一时间应得到同一帧。
文本/2D 脚本上限 256 KiB，WebGL 2 MiB；位图帧预算 100 ms。Node 预览只记录调用，
着色器、纹理和实际画面必须另用真实浏览器验证。不支持 HTML、CDN/import、fetch、定时器或依赖 DOM 的库。

以前内置的两个 world.execute(me) 预设现在是创意工坊里的包（MV 放映室 → 创意工坊）；
安装后打开它的文件夹，就能看到完整的场景脚本包和使用 \`canvas.assets\` 的包。
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
    { path: 'examples/scenes.example.js', text: EXAMPLE_SCENE },
    ...Object.entries(TEMPLATE_ASSETS).map(([path, text]) => ({ path, text })),
  ]
}
