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
}

/** Registration follows the Host plugin fiber; unload withdraws all endpoints. */
export function registerMvRemote(ctx, services = {}) {
  new MvRemoteService(ctx, services)
  ctx.effect(() => ctx.typert.register(MV_HOST_TYPERT), 'dsh-mv: remote descriptors')
}
