/**
 * Host plugin of @ljwei-stak/dsh-mv-cli for DeepSeek Harness Desktop.
 *
 * The canvas MV runs entirely in the client panel. The Host serves the
 * "MV 终端" (a pseudo terminal running the user's own local TUI player with a
 * fixed, validated launch), MV packs, the plugin's WAV cache, the folders of
 * AI-made packs, and two read-only agent tools (mv_pack_validate,
 * mv_pack_preview_frame) when Harness provides the `tools` service. Nothing is
 * uploaded anywhere: all files stay on this machine.
 */
import z from '@deepseek-ai/schemastery'
import { HOST_PLUGIN_VERSION, registerMvRemote } from './remote-service.mjs'
import { spawnSync } from 'node:child_process'
import { createMvConsoleManager } from './shared/mv-console.mjs'
import { createMvTerminalManager } from './shared/mv-terminal.mjs'
import {
  parseMvConsoleInfo,
  parseMvConsoleStart,
  parseMvConsoleStop,
  parseMvTerminalCheck,
  parseMvTerminalRead,
  parseMvTerminalResize,
  parseMvTerminalStart,
  parseMvTerminalStop,
  parseMvTerminalWrite,
} from './shared/mv-terminal-protocol.mjs'
import { parsePackLoad, parsePackRead, parseTemplateWrite } from './shared/mv-pack.mjs'
import { loadPack, readPackFile, writeTemplate } from './shared/mv-pack-host.mjs'
import {
  createFfmpegConverter, createWavCache, parseAudioConvert, parseAudioProbe, parseAudioRead, parseFfmpegInfo,
  parseWavBegin, parseWavFinish, parseWavWrite, probeForPanel, readAudioChunk,
} from './shared/mv-audio.mjs'
import { createAiPackManager, parsePackUploadBegin, parsePackUploadFinish, parsePackUploadWrite } from './shared/mv-ai-pack.mjs'
import { buildMvAgentTools } from './shared/mv-agent-tools.mjs'
import { createEngineManager, createJobManager } from './shared/mv-engine.mjs'
import { parseEngineInfo, parseEngineInstall, parseEngineModel, parseEngineTranscribe, parseJobCancel, parseJobRead } from './shared/mv-engine-protocol.mjs'
import { createLrclibClient, parseLyricsLookup } from './shared/mv-lrclib.mjs'
import { parseAnalysisRead, parsePackWriteText, readAnalysis, writePackText } from './shared/mv-pack-edit.mjs'

/** Cordis plugin name; equals the profile entry id in cordis.patch.yml. */
export const name = 'dsh-mv'
/** Required services only; anything optional is read with optionalService(). */
export const inject = ['typert']

export const Config = z.object({
  canvasFontSize: z.number().step(1).min(8).max(32).default(14).description('画布 MV 的默认字号（像素）。'),
  ffmpegPath: z.string().default('').description('可选：ffmpeg.exe 的完整路径。留空时在 PATH 和 D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe 中查找；只在面板无法解码某个音频、并且你确认后才会运行。'),
  lrclib: z.boolean().default(true).description('「自动制作」时到 LRCLIB（lrclib.net）查现成的歌词时间轴。只发送歌名、歌手、专辑和时长，不上传音频；关掉后完全离线。'),
  enginePython: z.string().default('').description('可选：已有 Python 环境里 python.exe 的完整路径（需已装 faster-whisper / torch / demucs）。留空时使用 %LOCALAPPDATA%\\dsh-mv\\engine 下由面板一键安装的引擎。'),
  uvPath: z.string().default('').description('可选：uv.exe 的完整路径，用于一键安装歌词引擎。留空时在 PATH 和常见位置查找。'),
  hfEndpoint: z.string().default('').description('可选：Hugging Face 镜像地址（例如 https://hf-mirror.com），只在下载模型时使用。'),
  agentTools: z.boolean().default(true).description('向 Harness 的 Agent 提供只读工具 mv_pack_validate / mv_pack_preview_frame（用于 AI 制作 MV 包）。'),
}).description('MV 放映室')

/**
 * Cordis throws `cannot get property "<name>" without inject` for any
 * ctx.<name> read outside `inject`, even through optional chaining, so
 * optional services are read with ctx.get().
 */
export function optionalService(ctx, serviceName) {
  try { return typeof ctx?.get === 'function' ? ctx.get(serviceName) : undefined } catch { return undefined }
}

export const defaultPackOps = Object.freeze({ load: loadPack, readFile: readPackFile, writeTemplate })

export function mvRemoteServices(terminals, config = {}, consoles = null, packs = defaultPackOps, wavCache = null, extras = {}) {
  const noConsoles = async () => { throw new Error('独立窗口功能未加载。') }
  const noWav = () => { throw new Error('WAV 缓存未加载。') }
  const noAi = () => { throw new Error('AI 制作 MV 功能未加载。') }
  const noFfmpeg = () => { throw new Error('ffmpeg 功能未加载。') }
  const noEngine = () => { throw new Error('歌词引擎功能未加载。') }
  const { aiPacks = null, ffmpeg = null, toolsState = () => ({ registered: false }), engine = null, lrclib = null, packEdit = { write: writePackText, read: readAnalysis } } = extras
  return {
    info: async () => ({ ...terminals.info(), canvasFontSize: config.canvasFontSize ?? 14, aiPacksDir: aiPacks?.root ?? null, agentTools: toolsState(), lrclib: config.lrclib !== false }),
    terminalCheck: async request => terminals.check(parseMvTerminalCheck(request)),
    terminalStart: async request => terminals.start(parseMvTerminalStart(request)),
    terminalRead: async request => terminals.read(parseMvTerminalRead(request)),
    terminalWrite: async request => terminals.write(parseMvTerminalWrite(request)),
    terminalResize: async request => terminals.resize(parseMvTerminalResize(request)),
    terminalStop: async request => terminals.stop(parseMvTerminalStop(request)),
    consoleInfo: async request => { parseMvConsoleInfo(request); return consoles ? consoles.info() : noConsoles() },
    consoleStart: async request => consoles ? consoles.start(parseMvConsoleStart(request)) : noConsoles(),
    consoleStop: async request => consoles ? consoles.stop(parseMvConsoleStop(request)) : noConsoles(),
    packLoad: async request => packs.load(parsePackLoad(request).path),
    packRead: async request => packs.readFile(parsePackRead(request)),
    packTemplate: async request => packs.writeTemplate(parseTemplateWrite(request)),
    audioProbe: async request => probeForPanel(parseAudioProbe(request), { cache: wavCache }),
    audioRead: async request => readAudioChunk(parseAudioRead(request)),
    ffmpegInfo: async request => { parseFfmpegInfo(request); return ffmpeg ? ffmpeg.info() : { available: false } },
    audioConvert: async request => (ffmpeg ?? noFfmpeg()).convert(parseAudioConvert(request)),
    aiPackCreate: async request => (aiPacks ?? noAi()).create(request),
    packUploadBegin: async request => (aiPacks ?? noAi()).uploadBegin(parsePackUploadBegin(request)),
    packUploadWrite: async request => (aiPacks ?? noAi()).uploadWrite(parsePackUploadWrite(request)),
    packUploadFinish: async request => (aiPacks ?? noAi()).uploadFinish(parsePackUploadFinish(request)),
    lyricsLookup: async request => {
      const query = parseLyricsLookup(request)
      if (config.lrclib === false) throw new Error('LRCLIB 查询已在插件设置里关闭。')
      if (!lrclib) throw new Error('LRCLIB 查询未加载。')
      return lrclib.lookup(query)
    },
    engineInfo: async request => { parseEngineInfo(request); return (engine ?? noEngine()).info() },
    engineProbe: async request => { parseEngineInfo(request); return (engine ?? noEngine()).probe() },
    engineInstall: async request => (engine ?? noEngine()).install(parseEngineInstall(request)),
    engineModel: async request => (engine ?? noEngine()).model(parseEngineModel(request)),
    engineTranscribe: async request => (engine ?? noEngine()).transcribe(parseEngineTranscribe(request)),
    jobRead: async request => (engine ?? noEngine()).read(parseJobRead(request)),
    jobCancel: async request => (engine ?? noEngine()).cancel(parseJobCancel(request)),
    packWriteText: async request => packEdit.write(parsePackWriteText(request)),
    analysisRead: async request => packEdit.read(parseAnalysisRead(request)),
    wavBegin: async request => (wavCache ?? noWav()).begin(parseWavBegin(request)),
    wavWrite: async request => (wavCache ?? noWav()).write(parseWavWrite(request)),
    wavFinish: async request => (wavCache ?? noWav()).finish(parseWavFinish(request)),
  }
}

/**
 * Register the read-only agent tools once the Host's `tools` service is up
 * (optional: without it the AI flow still works, the agent just checks by hand).
 */
export function registerAgentTools(ctx, state = {}, definitions = buildMvAgentTools()) {
  if (typeof ctx?.inject !== 'function') { state.error = 'no inject'; return null }
  try {
    return ctx.inject(['tools'], toolCtx => {
      toolCtx.effect(() => {
        const disposers = definitions.map(tool => toolCtx.tools.register(tool))
        state.registered = true
        return () => { state.registered = false; for (const dispose of disposers) { try { dispose?.() } catch { /* gone */ } } }
      }, 'dsh-mv: agent tools')
    })
  } catch (error) { state.error = String(error?.message ?? error); return null }
}

export function apply(ctx, config = {}) {
  const terminals = createMvTerminalManager()
  const consoles = createMvConsoleManager()
  // Plugin unload, patch reload or Host exit kills every MV terminal and
  // every separate console window this plugin opened.
  ctx.effect(() => {
    const onExit = () => { terminals.disposeAll('dispose'); consoles.disposeAllSync(spawnSync) }
    process.once('exit', onExit)
    return () => { process.off('exit', onExit); terminals.disposeAll('dispose'); return consoles.disposeAll('dispose') }
  }, 'dsh-mv: terminals')
  const wavCache = createWavCache()
  ctx.effect(() => () => wavCache.abort(), 'dsh-mv: wav cache')
  const ffmpeg = createFfmpegConverter({ cache: wavCache, configured: () => String(config.ffmpegPath ?? '').trim() })
  const aiPacks = createAiPackManager({ version: HOST_PLUGIN_VERSION ?? '' })
  ctx.effect(() => () => aiPacks.abort(), 'dsh-mv: ai packs')
  const tools = { registered: false, error: '' }
  if (config.agentTools !== false) registerAgentTools(ctx, tools)
  const engine = createEngineManager({ jobs: createJobManager(), config: () => config, loadPack })
  ctx.effect(() => () => engine.disposeAll(), 'dsh-mv: lyrics engine jobs')
  const lrclib = createLrclibClient({ userAgent: `dsh-mv-cli/${HOST_PLUGIN_VERSION ?? ''} (https://github.com/Alice-Marx/dsh-mv-cli)` })
  registerMvRemote(ctx, mvRemoteServices(terminals, config, consoles, defaultPackOps, wavCache, { aiPacks, ffmpeg, toolsState: () => ({ ...tools }), engine, lrclib }))
  const logger = optionalService(ctx, 'logger')
  logger?.info?.(`dsh-mv ${HOST_PLUGIN_VERSION ?? ''} loaded`)
}
