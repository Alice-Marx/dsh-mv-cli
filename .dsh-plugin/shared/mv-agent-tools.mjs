/**
 * Agent tools contributed to Harness while the plugin is loaded (only when
 * the Host provides the `tools` service): read-only checks of an MV pack an
 * agent is writing. Neither tool writes files, runs programs or touches the
 * network; scene scripts run in a node:vm context with timeouts.
 */
import { readFile } from 'node:fs/promises'
import { loadPack, packFilePath, packSceneBytes, readPack } from './mv-pack-host.mjs'
import { assetParts, MvPackError } from './mv-pack.mjs'
import { checkScene } from './mv-scene-host.mjs'
import { AI_TOOL_NAMES } from './mv-ai-prompt.mjs'
import { parseLyrics } from './mv-lyrics.mjs'

const errorText = error => error instanceof MvPackError ? error.problems : [String(error?.message ?? error)]

async function packAndScene(path) {
  const loaded = await loadPack(path)
  const { pack, packDir } = loaded
  let cues = []
  const problems = [], warnings = [...loaded.warnings]
  if (pack.lyrics && loaded.files.lyrics?.exists && !loaded.files.lyrics.tooLarge) {
    try {
      const body = await readFile(packFilePath(packDir, pack.lyrics.file), 'utf8')
      cues = parseLyrics(pack.lyrics.file, body, { duration: pack.duration ?? 1e9 })
      if (!cues.length) problems.push(`歌词文件 ${pack.lyrics.file} 里没有带时间的行。`)
      for (let i = 1; i < cues.length; i++) if (cues[i].time < cues[i - 1].time) { warnings.push('歌词时间不是递增的。'); break }
      if (pack.duration && cues.some(cue => cue.time > pack.duration)) warnings.push('有歌词时间超过了 duration。')
    } catch (error) { problems.push(`无法解析歌词：${error.message}`) }
  }
  let source = null
  if (pack.canvas?.renderer === 'script') {
    const state = loaded.files.scene
    if (!state?.exists) problems.push(`找不到场景脚本：${state?.path ?? pack.canvas.script}`)
    else if (state.tooLarge) problems.push(`场景脚本超过 ${packSceneBytes(pack) / 1024} KB`)
    else source = await readFile(state.path, 'utf8')
  }
  if (loaded.warnings.length) for (const w of loaded.warnings) if (/不存在/.test(w)) problems.push(w)
  const assets = {}
  for (const name of Object.keys(pack.canvas?.assets ?? {})) {
    if (!loaded.files.assets?.[name]?.exists) { problems.push(`canvas.assets.${name} 的文件缺失或太大`); continue }
    const refs = assetParts(pack, name)
    if (!refs.every(ref => /\.json$/i.test(ref))) { warnings.push(`Host 预览不能解码 canvas.assets.${name} 的图片；请在面板验证。`); continue }
    try {
      const shards = await Promise.all(refs.map(ref => readFile(packFilePath(packDir, ref), 'utf8').then(JSON.parse)))
      if (shards.length === 1) assets[name] = shards[0]
      else {
        const merged = {}
        for (const shard of shards) for (const [key, value] of Object.entries(shard)) {
          if (Array.isArray(value) && Array.isArray(merged[key])) merged[key] = merged[key].concat(value)
          else if (!(key in merged)) merged[key] = value
        }
        assets[name] = merged
      }
    } catch (error) { problems.push(`无法解析 canvas.assets.${name}：${error.message}`) }
  }
  return { loaded, cues, source, assets, problems, warnings: warnings.filter(w => !problems.includes(w)) }
}

export async function validatePackForAgent({ path }) {
  let state
  try { state = await packAndScene(path) } catch (error) { return { ok: false, problems: errorText(error) } }
  const { loaded, cues, source, assets } = state
  const problems = [...state.problems], warnings = [...state.warnings]
  const pack = loaded.pack
  let frames = []
  if (source !== null) {
    const d = pack.duration ?? 180
    const result = checkScene(source, { times: [0, d * 0.25, d * 0.5, d * 0.75, Math.max(0, d - 1)].map(t => Math.round(t * 10) / 10), cols: 100, rows: 32, cues, info: { title: pack.title, artist: pack.artist ?? '', duration: d, sections: pack.sections ?? [], bpm: pack.canvas?.bpm ?? 0, beatOffset: pack.canvas?.beatOffset ?? 0, assets }, output: pack.canvas?.output ?? 'text', size: pack.canvas?.size ?? [1280, 720] })
    problems.push(...result.problems.filter(p => /出错|超时|无法|没有定义|不能|超过 \d+ KB|空的/.test(p)))
    warnings.push(...result.problems.filter(p => !/出错|超时|无法|没有定义|不能|超过 \d+ KB|空的/.test(p)))
    frames = result.frames.map(frame => ({ t: frame.t, ms: frame.ms }))
  }
  if (pack.canvas?.renderer !== 'script') warnings.push(`canvas.renderer 是 ${pack.canvas?.renderer ?? 'generic'}，不是 script：不会使用 scenes.js。`)
  if (pack['x-dsh-mv-ai']?.status === 'waiting-for-agent') warnings.push('mv.json 还是插件生成的初始版本（x-dsh-mv-ai.status = waiting-for-agent）。')
  return {
    ok: problems.length === 0,
    manifestPath: loaded.manifestPath,
    title: pack.title, renderer: pack.canvas?.renderer ?? 'generic', output: pack.canvas?.output ?? 'text', ...(pack.canvas?.output === 'webgl' ? { gpuValidated: false, validation: 'webgl-call-recording' } : {}),
    lyrics: cues.length ? { cues: cues.length, first: cues[0].time, last: cues[cues.length - 1].time } : null,
    frames, problems, warnings,
  }
}

export async function previewFrameForAgent({ path, t = 0, cols = 100, rows = 32 }) {
  let state
  try { state = await packAndScene(path) } catch (error) { return { ok: false, problems: errorText(error) } }
  if (state.source === null) return { ok: false, problems: [...state.problems, 'canvas.renderer 不是 script，没有可预览的场景脚本。'] }
  const pack = state.loaded.pack
  const result = checkScene(state.source, { times: [Number(t) || 0], cols, rows, cues: state.cues, info: { title: pack.title, artist: pack.artist ?? '', duration: pack.duration ?? 180, sections: pack.sections ?? [], bpm: pack.canvas?.bpm ?? 0, beatOffset: pack.canvas?.beatOffset ?? 0, assets: state.assets }, output: pack.canvas?.output ?? 'text', size: pack.canvas?.size ?? [1280, 720] })
  const frame = result.frames[0]
  return { ok: Boolean(frame) && result.ok && !state.problems.length, t: Number(t) || 0, cols: result.cols, rows: result.rows, ms: frame?.ms, problems: [...state.problems, ...result.problems], frame: frame?.text ?? '', ...(pack.canvas?.output === 'webgl' ? { gpuValidated: false, validation: 'webgl-call-recording', drawCalls: frame?.drawCalls } : {}) }
}

const pathParam = { type: 'string', description: 'Absolute path of the MV pack folder or its mv.json.' }

/** Plain tool definitions (the shape the Harness tool registry accepts). */
export function buildMvAgentTools({ validate = validatePackForAgent, preview = previewFrameForAgent } = {}) {
  const output = { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 1) }] }
  const input = args => (typeof args === 'object' && args !== null ? args : {})
  const checkPath = value => typeof value === 'string' && value.trim() ? value.trim() : null
  return [
    {
      name: AI_TOOL_NAMES.validate,
      description: 'Check a dsh-mv MV pack (folder with mv.json): manifest schema, referenced files, lyric timing, and the canvas scene script (compiled and run at sample times in a sandbox with time limits). Read-only. Returns ok, problems and warnings.',
      parameters: { type: 'object', additionalProperties: false, properties: { path: pathParam }, required: ['path'] },
      output,
      timeoutMs: 30_000,
      async execute(args) {
        const path = checkPath(input(args).path)
        if (!path) return { ok: false, problems: ['path is required'] }
        return validate({ path })
      },
    },
    {
      name: AI_TOOL_NAMES.preview,
      description: "Render one frame of a dsh-mv MV pack's scene script (canvas.renderer \"script\") at time t seconds on a cols x rows grid and return it as plain text, with timing and problems. Read-only; runs the script in a sandbox with a time limit.",
      parameters: {
        type: 'object', additionalProperties: false, required: ['path'],
        properties: {
          path: pathParam,
          t: { type: 'number', description: 'Time in seconds (default 0).' },
          cols: { type: 'integer', description: 'Grid width, 20..160 (default 100).' },
          rows: { type: 'integer', description: 'Grid height, 8..60 (default 32).' },
        },
      },
      output,
      timeoutMs: 30_000,
      async execute(args) {
        const value = input(args)
        const path = checkPath(value.path)
        if (!path) return { ok: false, problems: ['path is required'] }
        return preview({ path, t: Number(value.t) || 0, cols: Number(value.cols) || 100, rows: Number(value.rows) || 32 })
      },
    },
  ]
}

export { readPack }
