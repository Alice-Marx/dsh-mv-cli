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

  /** Host version, PTY backend, limits and live sessions. */
  info() { return settled(async () => ({ hostVersion: HOST_PLUGIN_VERSION, ...(await (this.services.info ?? unavailable)()) })) }

  /** Validate the launch on disk; runs nothing. */
  terminalCheck(request) { return settled(() => (this.services.terminalCheck ?? unavailable)(request)) }

  /** Start one confirmed session of the fixed MV terminal launch. */
  terminalStart(request) { return settled(() => (this.services.terminalStart ?? unavailable)(request)) }

  /** Long-poll new output from a cursor. */
  terminalRead(request) { return settled(() => (this.services.terminalRead ?? unavailable)(request)) }

  /** Forward keystrokes verbatim; never logged. */
  terminalWrite(request) { return settled(() => (this.services.terminalWrite ?? unavailable)(request)) }

  terminalResize(request) { return settled(() => (this.services.terminalResize ?? unavailable)(request)) }

  /** Separate Windows console windows opened by this plugin. */
  consoleInfo(request) { return settled(() => (this.services.consoleInfo ?? unavailable)(request ?? {})) }

  /** Open the fixed player in a new console window (confirmed launches only). */
  consoleStart(request) { return settled(() => (this.services.consoleStart ?? unavailable)(request)) }

  /** taskkill /T the tracked player of one console window. */
  consoleStop(request) { return settled(() => (this.services.consoleStop ?? unavailable)(request)) }

  terminalStop(request) { return settled(() => (this.services.terminalStop ?? unavailable)(request)) }

  /** Read and check an MV pack (mv.json); runs nothing. */
  packLoad(request) { return settled(() => (this.services.packLoad ?? unavailable)(request)) }

  /** One base64 chunk of the pack's audio / lyrics / spectrum file. */
  packRead(request) { return settled(() => (this.services.packRead ?? unavailable)(request)) }

  /** Write the MV pack template into a new subfolder of a chosen folder. */
  packTemplate(request) { return settled(() => (this.services.packTemplate ?? unavailable)(request)) }

  /** Sniff an audio file's real format by content; hash: true also looks up the WAV cache. */
  audioProbe(request) { return settled(() => (this.services.audioProbe ?? unavailable)(request)) }

  /** Start / continue / finish uploading a panel-made WAV into the plugin cache. */
  wavBegin(request) { return settled(() => (this.services.wavBegin ?? unavailable)(request)) }
  wavWrite(request) { return settled(() => (this.services.wavWrite ?? unavailable)(request)) }
  wavFinish(request) { return settled(() => (this.services.wavFinish ?? unavailable)(request)) }

  /** One chunk of a user-chosen audio / video file (media files only), for the panel's decoder. */
  audioRead(request) { return settled(() => (this.services.audioRead ?? unavailable)(request)) }

  /** Whether the user's ffmpeg was found (it is never run here). */
  ffmpegInfo(request) { return settled(() => (this.services.ffmpegInfo ?? unavailable)(request ?? {})) }

  /** Confirmed conversion with the user's ffmpeg into the WAV cache. */
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
}

/** Registration follows the Host plugin fiber; unload withdraws all endpoints. */
export function registerMvRemote(ctx, services = {}) {
  new MvRemoteService(ctx, services)
  ctx.effect(() => ctx.typert.register(MV_HOST_TYPERT), 'dsh-mv: remote descriptors')
}
