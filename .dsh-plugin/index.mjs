/**
 * Host plugin of @ljwei-stak/dsh-mv-cli for DeepSeek Harness Desktop.
 *
 * The canvas MV runs entirely in the client panel (the user's audio file never
 * reaches the Host). The Host only serves the "MV 终端": a pseudo terminal
 * running the user's own local TUI player with a fixed, validated launch.
 */
import z from '@deepseek-ai/schemastery'
import { HOST_PLUGIN_VERSION, registerMvRemote } from './remote-service.mjs'
import { createMvTerminalManager } from './shared/mv-terminal.mjs'
import {
  parseMvTerminalCheck,
  parseMvTerminalRead,
  parseMvTerminalResize,
  parseMvTerminalStart,
  parseMvTerminalStop,
  parseMvTerminalWrite,
} from './shared/mv-terminal-protocol.mjs'

/** Cordis plugin name; equals the profile entry id in cordis.patch.yml. */
export const name = 'dsh-mv'
/** Required services only; anything optional is read with optionalService(). */
export const inject = ['typert']

export const Config = z.object({
  canvasFontSize: z.number().step(1).min(8).max(32).default(14).description('画布 MV 的默认字号（像素）。'),
}).description('MV 放映室')

/**
 * Cordis throws `cannot get property "<name>" without inject` for any
 * ctx.<name> read outside `inject`, even through optional chaining, so
 * optional services are read with ctx.get().
 */
export function optionalService(ctx, serviceName) {
  try { return typeof ctx?.get === 'function' ? ctx.get(serviceName) : undefined } catch { return undefined }
}

export function mvRemoteServices(terminals, config = {}) {
  return {
    info: async () => ({ ...terminals.info(), canvasFontSize: config.canvasFontSize ?? 14 }),
    terminalCheck: async request => terminals.check(parseMvTerminalCheck(request)),
    terminalStart: async request => terminals.start(parseMvTerminalStart(request)),
    terminalRead: async request => terminals.read(parseMvTerminalRead(request)),
    terminalWrite: async request => terminals.write(parseMvTerminalWrite(request)),
    terminalResize: async request => terminals.resize(parseMvTerminalResize(request)),
    terminalStop: async request => terminals.stop(parseMvTerminalStop(request)),
  }
}

export function apply(ctx, config = {}) {
  const terminals = createMvTerminalManager()
  // Plugin unload, patch reload or Host exit kills every MV terminal.
  ctx.effect(() => {
    const onExit = () => { terminals.disposeAll('dispose') }
    process.once('exit', onExit)
    return () => { process.off('exit', onExit); terminals.disposeAll('dispose') }
  }, 'dsh-mv: terminals')
  registerMvRemote(ctx, mvRemoteServices(terminals, config))
  const logger = optionalService(ctx, 'logger')
  logger?.info?.(`dsh-mv ${HOST_PLUGIN_VERSION ?? ''} loaded`)
}
