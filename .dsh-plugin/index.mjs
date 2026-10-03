/**
 * Host plugin of @ljwei-stak/dsh-mv-cli for DeepSeek Harness Desktop.
 *
 * The canvas MV runs entirely in the client panel (the user's audio file never
 * reaches the Host). The Host only serves the "MV 终端": a pseudo terminal
 * running the user's own local TUI player with a fixed, validated launch.
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

export const defaultPackOps = Object.freeze({ load: loadPack, readFile: readPackFile, writeTemplate })

export function mvRemoteServices(terminals, config = {}, consoles = null, packs = defaultPackOps) {
  const noConsoles = async () => { throw new Error('独立窗口功能未加载。') }
  return {
    info: async () => ({ ...terminals.info(), canvasFontSize: config.canvasFontSize ?? 14 }),
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
  }
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
  registerMvRemote(ctx, mvRemoteServices(terminals, config, consoles))
  const logger = optionalService(ctx, 'logger')
  logger?.info?.(`dsh-mv ${HOST_PLUGIN_VERSION ?? ''} loaded`)
}
