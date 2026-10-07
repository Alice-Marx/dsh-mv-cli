/**
 * "用 AI 制作新 MV": the request contract, the AGENT.md written into a new pack
 * and the prompt handed to a Harness agent session. Pure, shared by Host and
 * client (the client shows the same prompt for copy & paste when no session
 * API is available).
 */
import { MV_PACK_FORMAT, MV_PACK_SCHEMA_FILE, MV_PACK_VERSION, isAbsolutePackPath } from './mv-pack.mjs'
import { SCENE_LIMITS } from './mv-scene.mjs'

export const AI_PACK_LIMITS = Object.freeze({ maxTitle: 200, maxStyle: 4000, maxLyrics: 200_000, maxDuration: 36_000 })
export const AI_AUDIO_EXTENSIONS = Object.freeze(['.mp3', '.mp2', '.m4a', '.mp4', '.aac', '.webm', '.mka', '.ogg', '.flac', '.wav'])
export const AI_UPLOAD_ROLES = Object.freeze(['audio', 'spectrum'])
export const AI_TOOL_NAMES = Object.freeze({ validate: 'mv_pack_validate', preview: 'mv_pack_preview_frame' })
export const AGENT_FILE = 'AGENT.md'
export const BRIEF_FILE = 'brief.json'
export const SCENE_FILE = 'scenes.js'

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value, max, subject, required = false) => {
  if (value === undefined || value === null || value === '') { if (required) throw new TypeError(`${subject} 必填`); return '' }
  if (typeof value !== 'string') throw new TypeError(`${subject} 必须是字符串`)
  if (value.length > max) throw new TypeError(`${subject} 超过 ${max} 个字符`)
  if (/[\0]/.test(value)) throw new TypeError(`${subject} 含有 NUL`)
  return value
}

/** LRC-style timestamps ([mm:ss.xx]) on at least two lines. */
export const looksTimed = lyrics => (String(lyrics).match(/^\s*\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/gm) ?? []).length >= 2

export function parseAiPackCreate(value) {
  if (!isObject(value)) throw new TypeError('request must be an object')
  const extra = Object.keys(value).filter(key => !['title', 'artist', 'lyrics', 'style', 'parentDir', 'audioExt', 'duration'].includes(key))
  if (extra.length) throw new TypeError(`request has unexpected fields: ${extra.join(', ')}`)
  const title = text(value.title, AI_PACK_LIMITS.maxTitle, '歌名', true).trim()
  if (!title) throw new TypeError('歌名 必填')
  const artist = text(value.artist, AI_PACK_LIMITS.maxTitle, '歌手').trim()
  const lyrics = text(value.lyrics, AI_PACK_LIMITS.maxLyrics, '歌词').replace(/\r\n?/g, '\n')
  const style = text(value.style, AI_PACK_LIMITS.maxStyle, '风格说明').trim()
  let parentDir = ''
  if (value.parentDir !== undefined && value.parentDir !== null && value.parentDir !== '') {
    if (typeof value.parentDir !== 'string' || !isAbsolutePackPath(value.parentDir.trim()) || /[\0\r\n"]/.test(value.parentDir) || value.parentDir.length > 1024) throw new TypeError('保存位置必须是绝对路径')
    parentDir = value.parentDir.trim()
  }
  if (!AI_AUDIO_EXTENSIONS.includes(value.audioExt)) throw new TypeError(`audioExt must be one of ${AI_AUDIO_EXTENSIONS.join(' ')}`)
  let duration
  if (value.duration !== undefined && value.duration !== null) {
    if (typeof value.duration !== 'number' || !Number.isFinite(value.duration) || value.duration < 1 || value.duration > AI_PACK_LIMITS.maxDuration) throw new TypeError('duration is invalid')
    duration = Math.round(value.duration * 1000) / 1000
  }
  return { title, artist, lyrics, style, parentDir, audioExt: value.audioExt, ...(duration ? { duration } : {}) }
}

/** Folder name for a new pack: readable, safe on Windows, ≤ 60 characters. */
export function packSlug(title, artist = '') {
  const base = [title, artist].filter(Boolean).join(' - ')
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ')
    .replace(/[.\s]+$/g, '')
    .replace(/^[.\s]+/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 60)
    .trim()
  const reserved = /^(con|prn|aux|nul|com\d|lpt\d)$/i
  return !base || reserved.test(base) ? 'MV' : base
}

/** The starting mv.json of an AI pack (valid immediately; the agent rewrites it). */
export function initialManifest({ title, artist, audioFile, lyricsFile, lyricsTimed, spectrumFile, duration }) {
  return {
    $schema: `./${MV_PACK_SCHEMA_FILE}`,
    format: MV_PACK_FORMAT,
    version: MV_PACK_VERSION,
    title,
    ...(artist ? { artist } : {}),
    credits: ['Pack made with dsh-mv 用 AI 制作新 MV'],
    notice: 'Personal use. The audio and lyric files are your own copies and are not redistributed.',
    ...(duration ? { duration } : {}),
    audio: { file: audioFile, offset: 0 },
    ...(lyricsFile && lyricsTimed ? { lyrics: { file: lyricsFile, offset: 0 } } : {}),
    ...(spectrumFile ? { spectrum: { file: spectrumFile } } : {}),
    canvas: { renderer: 'generic' },
    'x-dsh-mv-ai': { status: 'waiting-for-agent' },
  }
}

const bullet = items => items.filter(Boolean).map(item => `- ${item}`).join('\n')

/** AGENT.md: the full task description, kept in the pack folder. */
export function agentGuide({ title, artist, style, audioFile, lyricsFile, lyricsTimed, spectrumFile, duration }) {
  return `# 任务：为「${title}${artist ? ` — ${artist}` : ''}」制作 dsh-mv MV 包

这个文件夹是 DeepSeek Harness 插件 dsh-mv（MV 放映室）创建的 MV 包。请在**这个文件夹里**完成它，
不要改动文件夹外的任何文件，不要上传或联网发送音频与歌词。

## 已有文件

${bullet([
  `\`${audioFile}\`：用户自己的音频（只读，不要修改、转码或删除）。`,
  duration ? `时长约 ${Math.round(duration * 10) / 10} 秒。` : '',
  spectrumFile ? `\`${spectrumFile}\`：插件在本机算好的频谱（{ fps, bands: 48, frames }，每帧 48 个 0..1 的值），可直接使用。` : '',
  lyricsFile ? `\`${lyricsFile}\`：用户提供的歌词${lyricsTimed ? '（已带 LRC 时间轴）' : '（纯文本，没有时间轴）'}。` : '用户没有提供歌词。',
  `\`${BRIEF_FILE}\`：标题、歌手、风格说明等原始输入。`,
  `\`mv.json\`：初始清单（通用渲染器），可以通过检查；你需要把它改成最终版本。`,
  `\`${MV_PACK_SCHEMA_FILE}\`：mv.json 的 JSON Schema；\`README.md\`：格式说明。`,
  `\`${SCENE_FILE}\`：一个能运行的最小示例场景脚本，可以在它的基础上改。`,
  `\`prompts/zh/\`（英文版 \`prompts/en/\`）：制作流程的提示词模板——01 创意简报、02 分段分镜、03 场景脚本编写指南、04 自检清单、05 迭代提示词。`,
  `\`examples/\`：成熟的示例场景（聊天窗口、心跳线、操作日志、token 条、EXECUTION 分屏、鲸落结尾、后期效果）和完整多段落示例 \`examples/rich-pack/scenes.js\`，说明见 \`examples/README.md\`。可以借用其中的技巧和工具函数。`,
])}

## 要做的事

1. 读 \`README.md\` 和 \`${MV_PACK_SCHEMA_FILE}\`，了解 mv.json 格式；读 \`prompts/zh/03-scene-script-guide.md\` 和 \`examples/README.md\`。
   然后按 \`prompts/zh/01-creative-brief.md\` 写 \`notes/brief.md\`（创意简报），按 \`prompts/zh/02-storyboard.md\` 写 \`notes/storyboard.md\`（每个段落一张分镜卡）。
2. 歌词：${lyricsFile
    ? lyricsTimed
      ? `检查 \`${lyricsFile}\` 的时间轴是否合理（单调递增、不超过时长）；必要时修正，保存为 \`lyrics.lrc\`。`
      : `把 \`${lyricsFile}\` 整理成 LRC（\`lyrics.lrc\`）。你听不到音频，请按时长${spectrumFile ? '和 spectrum.json 的能量变化（人声段落、间奏）' : ''}合理估计每句的时间，并在 mv.json 的 notice 里说明时间轴是估计的、可用 [ ] 键微调。中英双语可写成同一时间的两行。`
    : '用户没有歌词：做纯音乐 MV（不要编造歌词），mv.json 里不写 lyrics。'}
3. 写场景脚本 \`${SCENE_FILE}\`：定义 \`function render(t, cols, rows, ctx)\`，返回当前时刻的 ASCII 画面（见下方接口）。
   画面要按分镜配合歌曲结构（ctx.section：前奏、主歌、副歌、间奏、尾声）变化，用 ctx.bands / ctx.energy / ctx.beat 跟随音乐，用 ctx.lyric（含逐词 words / word）显示歌词。
   能估计 BPM 时在 mv.json 写 \`canvas.bpm\`（和 \`canvas.beatOffset\`）。可以复制 examples 里的网格工具函数（处理中文宽字符）。
   ${style ? `用户的风格要求：${style.replace(/\n+/g, ' ')}` : '风格自定，保持终端 ASCII 美感。'}
4. 写最终的 \`mv.json\`：\`"canvas": { "renderer": "script", "script": "${SCENE_FILE}" }\`，保留 audio${spectrumFile ? '、spectrum' : ''}，${lyricsFile ? '加上 lyrics，' : ''}填好 title / artist / credits / duration，把 \`x-dsh-mv-ai\` 的 status 改成 "done"（保留其中的 timing / sections 字段，校准编辑器会用到）。如果文件夹里有 sections.json，按其中的段落（主歌 / 副歌 / 间奏）安排场景。
5. 用工具检查：\`${AI_TOOL_NAMES.validate}\`（参数 path = 本文件夹）必须没有错误；用 \`${AI_TOOL_NAMES.preview}\` 看几个时间点（如 0 秒、副歌、结尾）的画面，确认好看、不空白、不越界。
   如果这两个工具不可用，就仔细自查：mv.json 是合法 JSON 且符合 schema，scenes.js 没有语法错误、没有 import/require、每帧计算量小。
   然后逐条过一遍 \`prompts/zh/04-qa-checklist.md\`，问题记到 \`notes/qa.md\` 并修好。用户之后想调整时，可以用 \`prompts/zh/05-iteration.md\` 里的提示词。
6. 最后用一两句话告诉用户：在「MV 放映室 → 曲库」里打开这个包（或「导入 MV 包…」选这个文件夹）即可播放。

## 场景脚本接口

${bullet([
  '普通 JavaScript 文件，不能 import / require，没有 DOM、网络、文件、定时器。不要用 eval / new Function。',
  `render(t, cols, rows, ctx) 每帧调用一次（约 30–60 次/秒），必须在 ${SCENE_LIMITS.frameBudgetMs} ms 内返回，文件不超过 ${SCENE_LIMITS.scriptBytes / 1024} KB。`,
  '返回 rows 行字符串的数组（或含 \\n 的字符串）；超出 cols 的部分会被裁掉。也可以返回 { lines, styles }：styles[y] 每个字符一位数字，0 暗、1 正常、2 亮、3 白、4 红、5 棕、6 橄榄。',
  'ctx = { duration, progress, title, artist, lyric, next, bands, energy, bass, mid, treble, ready, paused, section, sections, beat }；bands 是 48 个 0..1 的频段值。',
  'lyric 为 { text, en, zh, start, end, progress, words: [{ text, start, end }], word } 或 null（words 来自增强 LRC 的 <mm:ss.xx> 逐词时间，否则自动估计；word 是正在唱的词的下标）；next 为下一句（没有 words）。',
  'section 为 { kind, label, start, end, index, progress }（来自 x-dsh-mv-ai.sections）或 null；beat 在 mv.json 设置 canvas.bpm 时为 { bpm, index, bar, phase, pulse }，否则 null。',
  '可选 function setup(info)：开始前调用一次，info = { title, artist, duration, sections, bpm, beatOffset }。',
  `如果初始化很慢（读很多数据、生成大量数组），把它拆进可选的 function* prepare(info)：每做完一块 yield { progress: 0..1, label: '简短说明' }，面板会显示进度并等你准备好，最多 ${SCENE_LIMITS.prepareStepTimeoutMs / 1000} 秒/步、${SCENE_LIMITS.prepareTotalTimeoutMs / 1000} 秒总计、${SCENE_LIMITS.prepareMaxSteps} 步。`,
  `一次性的大 GPU 开销（编译着色器、分配渲染目标）请放进可选的 function warmup(info, gl)：它在开画前、最终尺寸上调用一次，${SCENE_LIMITS.warmupTimeoutMs / 1000} 秒上限，且不能更改输出画布尺寸。不要把耗时工作放进第一帧 render()。`,
  '画面完全由 t 和 ctx 决定（同一时刻画面相同），这样拖动进度时也正确。',
  '不要在画面里放音乐或歌词以外的版权内容；只用 ASCII / 常见符号，中文字符占两格。',
])}
`
}

/** The prompt sent to (or pasted into) a Harness agent session. */
export function agentPrompt({ packDir, title, artist, toolsAvailable = true }) {
  return [
    `请帮我用 dsh-mv 插件制作「${title}${artist ? ` — ${artist}` : ''}」的 MV 包。`,
    '',
    `MV 包文件夹：${packDir}`,
    `先完整阅读该文件夹里的 ${AGENT_FILE}（任务说明和场景脚本接口），再读 README.md、${MV_PACK_SCHEMA_FILE}、prompts/zh/03-scene-script-guide.md 和 examples/README.md，然后按 ${AGENT_FILE} 的步骤完成。`,
    '流程：按 prompts/zh/01-creative-brief.md 写创意简报（notes/brief.md）→ 按 prompts/zh/02-storyboard.md 写分段分镜（notes/storyboard.md）→ 整理/对齐歌词为 LRC → 参考 examples/ 的技巧编写 ' + SCENE_FILE + ' → 写出最终 mv.json → 按 prompts/zh/04-qa-checklist.md 逐条自检。',
    toolsAvailable
      ? `完成后用 ${AI_TOOL_NAMES.validate} 检查（path 填上面的文件夹），并用 ${AI_TOOL_NAMES.preview} 预览几个时间点的画面，有问题就修改直到通过。`
      : `如果没有 ${AI_TOOL_NAMES.validate} / ${AI_TOOL_NAMES.preview} 工具，请自行仔细检查 JSON 和脚本。`,
    '只修改这个文件夹里的文件；不要修改或上传音频，不要运行外部程序，不要联网下载歌词或素材。',
  ].join('\n')
}

/** Extra prompt text after 「自动制作」 timed the lyrics locally. */
export function autoTimingNote({ lines = 0, low = 0, source = '', sections = [] }) {
  const kinds = sections.filter(s => s.kind !== 'intro' && s.kind !== 'outro').map(s => `${s.label ?? s.kind} ${s.start}–${s.end}s`).slice(0, 16)
  return [
    lines
      ? `插件已在本机自动对齐歌词：lyrics.lrc（${lines} 行，来源 ${source}${low ? `，其中 ${low} 行置信度低、用户会在校准编辑器里修正` : ''}）和 timing.json（每行置信度）。请直接使用 lyrics.lrc，不要重新估计或改动时间轴；mv.json 里保留 "lyrics": { "file": "lyrics.lrc" }。`
      : '插件没有找到歌词（可能是纯音乐）：做纯音乐 MV，不要编造歌词。',
    sections.length ? `sections.json（也写在 mv.json 的 x-dsh-mv-ai.sections）给出了段落：${kinds.join('；')}。请按这些段落安排场景（副歌更强烈、间奏用纯视觉），并在写最终 mv.json 时保留 x-dsh-mv-ai.sections。` : '',
  ].filter(Boolean).join('\n')
}
