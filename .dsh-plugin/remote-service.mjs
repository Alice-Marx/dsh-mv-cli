/** Host receiver for the MV panel's typed RPC. */
import { readFileSync } from 'node:fs'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { MV_HOST_TYPERT, MV_REMOTE_NAMESPACE } from './shared/mv-remote.mjs'

/** Version of the plugin code this Host process actually imported. */
export const HOST_PLUGIN_VERSION = (() => {
  try { return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version ?? null }
  catch { return null }
})()

function errorText(error) {
  return error instanceof Error ? error.message : String(error)
}

const unavailable = () => { throw new Error('MV 插件的 Host 服务尚未加载。') }

/**
 * Wrap a Host operation so the client always receives a plain object. The
 * gateway adds its own { ok, value } around this, so the client sees the
 * result double-wrapped and unwraps both levels (client/remote-state.mjs).
 */
export async function settled(operation) {
  try { return { ok: true, value: await operation() } }
  catch (error) { return { ok: false, error: errorText(error) } }
}

export class MvRemoteService extends TypertRemoteService {
  constructor(ctx, services = {}) {
    super(ctx, MV_REMOTE_NAMESPACE)
    this.services = services
  }

  /** Host version, platform and settings the panel needs. */
  info() { return settled(async () => ({ hostVersion: HOST_PLUGIN_VERSION, ...(await (this.services.info ?? unavailable)()) })) }

  /** Read and check an MV pack (mv.json); runs nothing. */
  packLoad(request) { return settled(() => (this.services.packLoad ?? unavailable)(request)) }

  /** One base64 chunk of the pack's audio / lyrics / spectrum file. */
  packRead(request) { return settled(() => (this.services.packRead ?? unavailable)(request)) }

  /** Write the MV pack template into a new subfolder of a chosen folder. */
  packTemplate(request) { return settled(() => (this.services.packTemplate ?? unavailable)(request)) }

  /** One chunk of a user-chosen audio / video file (media files only), for the panel's decoder. */
  audioRead(request) { return settled(() => (this.services.audioRead ?? unavailable)(request)) }

  /** Whether the user's ffmpeg was found (it is never run here). */
  ffmpegInfo(request) { return settled(() => (this.services.ffmpegInfo ?? unavailable)(request ?? {})) }

  /** Confirmed conversion with the user's ffmpeg into the plugin's WAV cache. */
  audioConvert(request) { return settled(() => (this.services.audioConvert ?? unavailable)(request)) }

  /** Create the folder of a new AI-made MV pack. */
  aiPackCreate(request) { return settled(() => (this.services.aiPackCreate ?? unavailable)(request)) }

  /** Upload the audio copy / spectrum.json into a pack folder this Host created. */
  packUploadBegin(request) { return settled(() => (this.services.packUploadBegin ?? unavailable)(request)) }
  packUploadWrite(request) { return settled(() => (this.services.packUploadWrite ?? unavailable)(request)) }
  packUploadFinish(request) { return settled(() => (this.services.packUploadFinish ?? unavailable)(request)) }

  /** 0.5.0: LRCLIB lookup (title/artist/album/duration only), lyrics engine jobs, calibration writes. */
  lyricsLookup(request) { return settled(() => (this.services.lyricsLookup ?? unavailable)(request ?? {})) }
  engineInfo(request) { return settled(() => (this.services.engineInfo ?? unavailable)(request ?? {})) }
  engineProbe(request) { return settled(() => (this.services.engineProbe ?? unavailable)(request ?? {})) }
  engineInstall(request) { return settled(() => (this.services.engineInstall ?? unavailable)(request ?? {})) }
  engineModel(request) { return settled(() => (this.services.engineModel ?? unavailable)(request ?? {})) }
  engineTranscribe(request) { return settled(() => (this.services.engineTranscribe ?? unavailable)(request ?? {})) }
  jobRead(request) { return settled(() => (this.services.jobRead ?? unavailable)(request ?? {})) }
  jobCancel(request) { return settled(() => (this.services.jobCancel ?? unavailable)(request ?? {})) }
  packWriteText(request) { return settled(() => (this.services.packWriteText ?? unavailable)(request ?? {})) }
  analysisRead(request) { return settled(() => (this.services.analysisRead ?? unavailable)(request ?? {})) }
  dshpvAsset(request) { return settled(() => (this.services.dshpvAsset ?? unavailable)(request ?? {})) }

  /** 0.7.0 MV 创意工坊: catalogue, covers, install / uninstall (sha256-checked), publish folder (no upload). */
  workshopIndex(request) { return settled(() => (this.services.workshopIndex ?? unavailable)(request ?? {})) }
  workshopCover(request) { return settled(() => (this.services.workshopCover ?? unavailable)(request ?? {})) }
  workshopInstall(request) { return settled(() => (this.services.workshopInstall ?? unavailable)(request ?? {})) }
  workshopUninstall(request) { return settled(() => (this.services.workshopUninstall ?? unavailable)(request ?? {})) }
  workshopInstalled(request) { return settled(() => (this.services.workshopInstalled ?? unavailable)(request ?? {})) }
  workshopPublish(request) { return settled(() => (this.services.workshopPublish ?? unavailable)(request ?? {})) }
}

/** Registration follows the Host plugin fiber; unload withdraws all endpoints. */
export function registerMvRemote(ctx, services = {}) {
  new MvRemoteService(ctx, services)
  ctx.effect(() => ctx.typert.register(MV_HOST_TYPERT), 'dsh-mv: remote descriptors')
}
