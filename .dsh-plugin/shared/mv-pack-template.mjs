/**
 * The downloadable MV pack template: mv.json, its JSON Schema, a bilingual
 * README, two examples and a placeholder LRC. Generated text only — no song,
 * lyric or artwork data.
 */
import { MV_CANVAS_RENDERERS, MV_PACK_CONDITIONS, MV_PACK_CWD, MV_PACK_FORMAT, MV_PACK_PLACEHOLDERS, MV_PACK_SCHEMA_FILE, MV_PACK_VERSION } from './mv-pack.mjs'

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

export const TERMINAL_EXAMPLE = Object.freeze({
  $schema: `../${MV_PACK_SCHEMA_FILE}`,
  format: MV_PACK_FORMAT,
  version: MV_PACK_VERSION,
  title: 'Song played by an external TUI program',
  artist: '…',
  audio: { file: 'song.mp3' },
  lyrics: { file: 'lyrics.lrc' },
  canvas: { renderer: 'generic' },
  terminal: {
    label: 'my_player.py',
    program: 'python/python.exe',
    script: 'my_player.py',
    args: ['{script}', { when: 'audio', args: ['--audio', '{audio}'] }, { when: 'lyrics', args: ['--lyrics', '{lyrics}'] }, { when: 'start', args: ['--start', '{start}'] }],
    cwd: 'pack',
  },
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
  terminal: {
    label: 'tui_live.py',
    program: 'python/python.exe',
    script: '_tools/tui_live.py',
    args: ['{script}', { when: 'audio', args: ['--audio-file', '{audio}'] }, { when: 'start', args: ['--start', '{start}'] }],
    cwd: 'pack',
  },
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
      properties: { renderer: { enum: MV_CANVAS_RENDERERS, default: 'generic' }, fontSize: { type: 'number', minimum: 8, maximum: 32 } },
    },
    terminal: {
      type: 'object', additionalProperties: false, patternProperties: { '^x-': {} }, required: ['program', 'args'],
      properties: {
        label: { type: 'string', maxLength: 200 },
        program: { type: 'string', description: 'Executable or interpreter (e.g. python/python.exe). .bat/.cmd/.ps1 and other script files are refused.' },
        script: { type: 'string', description: 'Optional script file passed via {script}.' },
        cwd: { enum: MV_PACK_CWD, default: 'pack' },
        args: {
          type: 'array', maxItems: 64,
          description: `One argv element per item, never parsed by a shell. Placeholders: ${MV_PACK_PLACEHOLDERS.map(n => `{${n}}`).join(' ')}; {{ and }} are literal braces.`,
          items: {
            oneOf: [
              { type: 'string' },
              { type: 'object', additionalProperties: false, required: ['when', 'args'], properties: { when: { enum: MV_PACK_CONDITIONS }, args: { type: 'array', minItems: 1, items: { type: 'string' } } } },
            ],
          },
        },
      },
    },
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
| \`canvas.renderer\` | no | \`generic\` (spectrum bars + title + lyrics; works for any song) or \`world-execute-me\` (the built-in world.execute(me) scenes, timed for that song only). |
| \`canvas.fontSize\` | no | 8–32 px. |
| \`terminal\` | no | External TUI program for the **MV 终端** tab (see below). |

Paths are relative to the folder of \`mv.json\` (\`/\` or \`\\\\\`; \`..\` is not allowed)
or absolute. Unknown fields are errors; put your own data in fields starting with \`x-\`.

## External renderer (\`terminal\`)

\`\`\`json
"terminal": {
  "label": "my_player.py",
  "program": "python/python.exe",
  "script": "my_player.py",
  "args": ["{script}", { "when": "audio", "args": ["--audio", "{audio}"] }, "--start", "{start}"],
  "cwd": "pack"
}
\`\`\`

- \`program\`: the executable or interpreter. \`.bat\`, \`.cmd\`, \`.ps1\`, \`.vbs\`, \`.js\`,
  \`.lnk\` … are refused. Use the interpreter as \`program\` and the file as \`script\`.
- \`args\`: one array item = one argument. No shell parses them, so quotes and spaces
  need no escaping. Placeholders: ${MV_PACK_PLACEHOLDERS.map(n => `\`{${n}}\``).join(', ')}
  (absolute paths; \`start\`/\`offset\` are numbers from the panel). \`{{\` / \`}}\` are literal braces.
- \`{ "when": "audio" | "lyrics" | "spectrum" | "start" | "offset", "args": [...] }\` adds
  arguments only when that file is configured, or start > 0, or offset ≠ 0.
- \`cwd\`: \`pack\` (default), \`program\` or \`script\` folder.

**Safety.** An external renderer is a program from the pack, so it can do anything
you can. The panel never runs it on import. Before every start it checks that the
files exist and shows the exact command for you to confirm. It refuses to start if
mv.json changed after you confirmed. In the separate-window (cmd.exe) mode, any path or
argument containing \`% ! " ^ & | < >\` or a line break is refused.

See \`examples/\` for a python player and for the world.execute(me) preset written
as a pack.
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
| \`canvas.renderer\` | 否 | \`generic\`（通用：频谱 + 标题 + 歌词，任何歌都能放）或 \`world-execute-me\`（内置的 world.execute(me) 场景，只适合这首歌的时间轴）。 |
| \`canvas.fontSize\` | 否 | 8–32 像素。 |
| \`terminal\` | 否 | **MV 终端** 页使用的外部 TUI 程序（见下）。 |

路径相对于 \`mv.json\` 所在文件夹（\`/\` 或 \`\\\\\` 都行，不允许 \`..\`），也可以写绝对路径。
未知字段会报错；自定义数据请用 \`x-\` 开头的字段。

## 外部渲染程序（\`terminal\`）

\`\`\`json
"terminal": {
  "label": "my_player.py",
  "program": "python/python.exe",
  "script": "my_player.py",
  "args": ["{script}", { "when": "audio", "args": ["--audio", "{audio}"] }, "--start", "{start}"],
  "cwd": "pack"
}
\`\`\`

- \`program\`：可执行文件或解释器。拒绝 \`.bat\`、\`.cmd\`、\`.ps1\`、\`.vbs\`、\`.js\`、\`.lnk\` 等；请把解释器写成 \`program\`、脚本写成 \`script\`。
- \`args\`：数组的每一项就是一个参数，不经过 shell 解析，空格和引号无需转义。占位符：${MV_PACK_PLACEHOLDERS.map(n => `\`{${n}}\``).join('、')}
  （路径均为绝对路径；\`start\`/\`offset\` 是面板里填的数字）。\`{{\` / \`}}\` 表示字面的大括号。
- \`{ "when": "audio" | "lyrics" | "spectrum" | "start" | "offset", "args": [...] }\`：只有配置了该文件、或起始秒数 > 0、或偏移 ≠ 0 时才加入这些参数。
- \`cwd\`：\`pack\`（默认）、\`program\` 或 \`script\` 所在文件夹。

**安全说明。** 外部渲染程序本质上是包里指定的任意程序，能做你能做的任何事。导入时不会运行；每次启动前，
面板会检查文件是否存在，并显示完整命令等你确认；确认之后若 mv.json 被改动则拒绝启动。独立窗口（cmd.exe）
模式下，凡是含 \`% ! " ^ & | < >\` 或换行的路径和参数一律拒绝。

\`examples/\` 里有一个 Python 播放器示例，以及用 MV 包写法表示的 world.execute(me) 预设。
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
    { path: 'examples/terminal-python.mv.json', text: json(TERMINAL_EXAMPLE) },
    { path: 'examples/world-execute-me.mv.json', text: json(WORLD_EXECUTE_ME_EXAMPLE) },
  ]
}
