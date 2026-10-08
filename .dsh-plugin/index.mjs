/**
 * Host plugin of @ljwei-stak/dsh-mv-cli for DeepSeek Harness Desktop.
 *
 * The MV plays entirely on the client panel's canvas. The Host serves MV
 * packs (read-only, nothing in a pack is ever run), chunked reads of the
 * user's audio, the optional confirmed ffmpeg conversion, the folders of
 * AI-made packs, the lyrics engine jobs, LRCLIB lookups and two read-only
 * agent tools (mv_pack_validate, mv_pack_preview_frame) when Harness provides
 * the `tools` service, and the MV 创意工坊 (catalogue and sha256-checked
 * downloads from a public GitHub repository; publishing prepares a folder the
 * user submits on github.com). Audio and lyrics never leave this machine.
 */
import z from '@deepseek-ai/schemastery'
import { HOST_PLUGIN_VERSION, registerMvRemote } from './remote-service.mjs'
import { parsePackLoad, parsePackRead, parseTemplateWrite } from './shared/mv-pack.mjs'
import { loadPack, readPackFile, writeTemplate } from './shared/mv-pack-host.mjs'
import { createFfmpegConverter, createWavCache, parseAudioConvert, parseAudioRead, parseFfmpegInfo, readAudioChunk } from './shared/mv-audio.mjs'
import { createAiPackManager, parsePackUploadBegin, parsePackUploadFinish, parsePackUploadWrite } from './shared/mv-ai-pack.mjs'
import { buildMvAgentTools } from './shared/mv-agent-tools.mjs'
import { createEngineManager, createJobManager } from './shared/mv-engine.mjs'
import { parseEngineInfo, parseEngineInstall, parseEngineModel, parseEngineTranscribe, parseJobCancel, parseJobRead } from './shared/mv-engine-protocol.mjs'
import { createLrclibClient, parseLyricsLookup } from './shared/mv-lrclib.mjs'
import { parseAnalysisRead, parsePackWriteText, readAnalysis, writePackText } from './shared/mv-pack-edit.mjs'
import { parseWorkshopDirInfo, parseWorkshopDirMove, parseWorkshopDirOpen, parseWorkshopDirSet, parseWorkshopId, parseWorkshopIndexRequest, parseWorkshopInstalled, parseWorkshopPublish } from './shared/mv-workshop.mjs'
import { createWorkshopManager } from './shared/mv-workshop-host.mjs'

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
  httpProxy: z.string().default('').description('可选：工坊和 LRCLIB 使用的 HTTP CONNECT 代理，如 http://127.0.0.1:7897。留空继承 HTTPS_PROXY/HTTP_PROXY；NO_PROXY 按实际下载主机匹配。不支持 socks:// 或 https:// 代理。'),
  workshopMirror: z.string().default('').description('可选：可信且可完整下载的工坊 HTTPS 备用源前缀。默认留空关闭；GitHub 网络失败后自动直连已配置备用源，仍按相同 commit 和 SHA-256 校验。'),
  workshopDir: z.string().default('').description('可选：创意工坊 MV 包的默认安装文件夹（例如 F:\\MV\\workshop）。留空时为 %LOCALAPPDATA%\\dsh-mv\\workshop。也可以在面板「创意工坊」页底部直接更改，面板里的设置保存在 %LOCALAPPDATA%\\dsh-mv\\settings.json，优先于这里。'),
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

export function mvRemoteServices(config = {}, packs = defaultPackOps, extras = {}) {
  const noAi = () => { throw new Error('AI 制作 MV 功能未加载。') }
  const noFfmpeg = () => { throw new Error('ffmpeg 功能未加载。') }
  const noEngine = () => { throw new Error('歌词引擎功能未加载。') }
  const noWorkshop = () => { throw new Error('创意工坊功能未加载。') }
  const { aiPacks = null, ffmpeg = null, toolsState = () => ({ registered: false }), engine = null, lrclib = null, packEdit = { write: writePackText, read: readAnalysis }, workshop = null } = extras
  return {
    info: async () => ({ platform: process.platform, canvasFontSize: config.canvasFontSize ?? 14, aiPacksDir: aiPacks?.root ?? null, agentTools: toolsState(), lrclib: config.lrclib !== false }),
    packLoad: async request => packs.load(parsePackLoad(request).path),
    packRead: async request => packs.readFile(parsePackRead(request)),
    packTemplate: async request => packs.writeTemplate(parseTemplateWrite(request)),
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
    workshopIndex: async request => (workshop ?? noWorkshop()).index(parseWorkshopIndexRequest(request)),
    workshopCover: async request => (workshop ?? noWorkshop()).cover(parseWorkshopId(request)),
    workshopInstall: async request => (workshop ?? noWorkshop()).install(parseWorkshopId(request)),
    workshopUninstall: async request => (workshop ?? noWorkshop()).uninstall(parseWorkshopId(request)),
    workshopInstalled: async request => { parseWorkshopInstalled(request); return (workshop ?? noWorkshop()).installed() },
    workshopPublish: async request => (workshop ?? noWorkshop()).publishPrepare(parseWorkshopPublish(request)),
    workshopDirInfo: async request => { parseWorkshopDirInfo(request); return (workshop ?? noWorkshop()).dirInfo() },
    workshopDirSet: async request => (workshop ?? noWorkshop()).setDir(parseWorkshopDirSet(request)),
    workshopDirMove: async request => (workshop ?? noWorkshop()).moveToCurrent(parseWorkshopDirMove(request)),
    workshopDirOpen: async request => { parseWorkshopDirOpen(request); return (workshop ?? noWorkshop()).openDir() },
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
  const wavCache = createWavCache()
  const ffmpeg = createFfmpegConverter({ cache: wavCache, configured: () => String(config.ffmpegPath ?? '').trim() })
  const aiPacks = createAiPackManager({ version: HOST_PLUGIN_VERSION ?? '' })
  ctx.effect(() => () => aiPacks.abort(), 'dsh-mv: ai packs')
  const tools = { registered: false, error: '' }
  if (config.agentTools !== false) registerAgentTools(ctx, tools)
  const engine = createEngineManager({ jobs: createJobManager(), config: () => config, loadPack })
  ctx.effect(() => () => engine.disposeAll(), 'dsh-mv: lyrics engine jobs')
  const proxy = () => String(config.httpProxy ?? '')
  const lrclib = createLrclibClient({ proxy, userAgent: `dsh-mv-cli/${HOST_PLUGIN_VERSION ?? ''} (https://github.com/Alice-Marx/dsh-mv-cli)` })
  const workshop = createWorkshopManager({ configDir: () => String(config.workshopDir ?? ''), proxy, mirror: () => String(config.workshopMirror ?? ''), userAgent: `dsh-mv-cli/${HOST_PLUGIN_VERSION ?? ''} (https://github.com/Alice-Marx/dsh-mv-cli)` })
  registerMvRemote(ctx, mvRemoteServices(config, defaultPackOps, { aiPacks, ffmpeg, toolsState: () => ({ ...tools }), engine, lrclib, workshop }))
  const logger = optionalService(ctx, 'logger')
  logger?.info?.(`dsh-mv ${HOST_PLUGIN_VERSION ?? ''} loaded`)
}
