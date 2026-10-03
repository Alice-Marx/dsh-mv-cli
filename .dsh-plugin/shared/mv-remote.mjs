/**
 * Narrow Typert Remote contract between the Desktop client panel and the Host.
 * The Desktop client mounts this contribution with remote.$mount; the Host
 * Typert registry owns the matching strict descriptors. No endpoint accepts a
 * command line or argument vector: the MV terminal takes a fixed-shape launch.
 */
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
} from './mv-terminal-protocol.mjs'
import { parsePackLoad, parsePackRead, parseTemplateWrite } from './mv-pack.mjs'
import { parseAudioProbe, parseWavBegin, parseWavFinish, parseWavWrite } from './mv-audio-protocol.mjs'

export const MV_REMOTE_PACKAGE = '@ljwei-stak/dsh-mv-cli'
export const MV_REMOTE_NAMESPACE = 'dshMv'

function strictCodec(typeSymbol, parse) {
  return Object.freeze({ mode: 'strict', typeSymbol, create: () => ({ parse }) })
}

/**
 * Request codec: validate at the gateway boundary but hand the Host the wire
 * value unchanged; the Host service parses it again (defence in depth) and
 * works on its own normalised copy.
 */
function requestCodec(typeSymbol, parse) {
  return strictCodec(typeSymbol, value => { parse(value); return value })
}

function plainObject(value, subject) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${subject} must be an object`)
  return value
}

const anyObjectCodec = name => strictCodec(`${MV_REMOTE_PACKAGE}#${name}`, value => plainObject(value, name))

function descriptor(method, parameters, result) {
  return Object.freeze({
    id: `${MV_REMOTE_PACKAGE}#${MV_REMOTE_NAMESPACE}/${method}`,
    service: MV_REMOTE_NAMESPACE,
    namespace: MV_REMOTE_NAMESPACE,
    method,
    invocation: { kind: 'direct' },
    parameters,
    result,
  })
}

const jsonParameter = (name, codec) => Object.freeze({ name, wire: name, source: 'json', codec })

export const MV_REMOTE_DESCRIPTORS = Object.freeze([
  descriptor('info', [], anyObjectCodec('MvInfo')),
  descriptor('terminalCheck', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalCheck`, parseMvTerminalCheck))], anyObjectCodec('MvTerminalChecked')),
  descriptor('terminalStart', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalStart`, parseMvTerminalStart))], anyObjectCodec('MvTerminalStarted')),
  descriptor('terminalRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalRead`, parseMvTerminalRead))], anyObjectCodec('MvTerminalOutput')),
  descriptor('terminalWrite', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalWrite`, parseMvTerminalWrite))], anyObjectCodec('MvTerminalWritten')),
  descriptor('terminalResize', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalResize`, parseMvTerminalResize))], anyObjectCodec('MvTerminalResized')),
  descriptor('consoleInfo', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvConsoleInfo`, parseMvConsoleInfo))], anyObjectCodec('MvConsoleInfo')),
  descriptor('consoleStart', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvConsoleStart`, parseMvConsoleStart))], anyObjectCodec('MvConsoleStarted')),
  descriptor('consoleStop', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvConsoleStop`, parseMvConsoleStop))], anyObjectCodec('MvConsoleStopped')),
  descriptor('terminalStop', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvTerminalStop`, parseMvTerminalStop))], anyObjectCodec('MvTerminalStopped')),
  descriptor('packLoad', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackLoad`, parsePackLoad))], anyObjectCodec('MvPackLoaded')),
  descriptor('packRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackRead`, parsePackRead))], anyObjectCodec('MvPackChunk')),
  descriptor('packTemplate', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackTemplate`, parseTemplateWrite))], anyObjectCodec('MvPackTemplateWritten')),
  descriptor('audioProbe', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvAudioProbe`, parseAudioProbe))], anyObjectCodec('MvAudioProbed')),
  descriptor('wavBegin', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWavBegin`, parseWavBegin))], anyObjectCodec('MvWavBegun')),
  descriptor('wavWrite', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWavWrite`, parseWavWrite))], anyObjectCodec('MvWavWritten')),
  descriptor('wavFinish', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWavFinish`, parseWavFinish))], anyObjectCodec('MvWavFinished')),
])

export const MV_CLIENT_REMOTE = Object.freeze({ package: MV_REMOTE_PACKAGE, descriptors: MV_REMOTE_DESCRIPTORS })

export const MV_HOST_TYPERT = Object.freeze({
  package: MV_REMOTE_PACKAGE,
  face: 'host',
  schemas: [],
  invocations: MV_REMOTE_DESCRIPTORS,
  model: { services: [], events: [], objects: [] },
})
