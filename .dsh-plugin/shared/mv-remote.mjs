/**
 * Narrow Typert Remote contract between the Desktop client panel and the Host.
 * The Desktop client mounts this contribution with remote.$mount; the Host
 * Typert registry owns the matching strict descriptors. No endpoint accepts a
 * command line or argument vector, and none runs a program from an MV pack.
 */
import { parsePackLoad, parsePackRead, parseTemplateWrite } from './mv-pack.mjs'
import { parseAudioConvert, parseAudioRead, parseFfmpegInfo } from './mv-audio-protocol.mjs'
import { parseAiPackCreate } from './mv-ai-prompt.mjs'
import { parsePackUploadBegin, parsePackUploadFinish, parsePackUploadWrite } from './mv-ai-upload.mjs'
import { parseAnalysisRead, parseLyricsLookup, parsePackWriteText } from './mv-calib-protocol.mjs'
import { parseWorkshopId, parseWorkshopIndexRequest, parseWorkshopInstalled, parseWorkshopPublish, parseWorkshopDirInfo, parseWorkshopDirMove, parseWorkshopDirOpen, parseWorkshopDirSet } from './mv-workshop.mjs'
import { parseEngineInfo, parseEngineInstall, parseEngineModel, parseEngineTranscribe, parseJobCancel, parseJobRead } from './mv-engine-protocol.mjs'

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
  descriptor('packLoad', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackLoad`, parsePackLoad))], anyObjectCodec('MvPackLoaded')),
  descriptor('packRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackRead`, parsePackRead))], anyObjectCodec('MvPackChunk')),
  descriptor('packTemplate', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackTemplate`, parseTemplateWrite))], anyObjectCodec('MvPackTemplateWritten')),
  descriptor('audioRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvAudioRead`, parseAudioRead))], anyObjectCodec('MvAudioChunk')),
  descriptor('ffmpegInfo', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvFfmpegInfo`, parseFfmpegInfo))], anyObjectCodec('MvFfmpegInfo')),
  descriptor('audioConvert', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvAudioConvert`, parseAudioConvert))], anyObjectCodec('MvAudioConverted')),
  descriptor('aiPackCreate', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvAiPackCreate`, parseAiPackCreate))], anyObjectCodec('MvAiPackCreated')),
  descriptor('packUploadBegin', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadBegin`, parsePackUploadBegin))], anyObjectCodec('MvPackUploadBegun')),
  descriptor('packUploadWrite', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadWrite`, parsePackUploadWrite))], anyObjectCodec('MvPackUploadWritten')),
  descriptor('packUploadFinish', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackUploadFinish`, parsePackUploadFinish))], anyObjectCodec('MvPackUploadFinished')),
  descriptor('lyricsLookup', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvLyricsLookup`, parseLyricsLookup))], anyObjectCodec('MvLyricsLookupResult')),
  descriptor('engineInfo', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineInfo`, parseEngineInfo))], anyObjectCodec('MvEngineInfoResult')),
  descriptor('engineProbe', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineProbe`, parseEngineInfo))], anyObjectCodec('MvEngineProbeResult')),
  descriptor('engineInstall', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineInstall`, parseEngineInstall))], anyObjectCodec('MvEngineInstallResult')),
  descriptor('engineModel', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineModel`, parseEngineModel))], anyObjectCodec('MvEngineModelResult')),
  descriptor('engineTranscribe', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvEngineTranscribe`, parseEngineTranscribe))], anyObjectCodec('MvEngineTranscribeResult')),
  descriptor('jobRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvJobRead`, parseJobRead))], anyObjectCodec('MvJobReadResult')),
  descriptor('jobCancel', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvJobCancel`, parseJobCancel))], anyObjectCodec('MvJobCancelResult')),
  descriptor('packWriteText', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvPackWriteText`, parsePackWriteText))], anyObjectCodec('MvPackWriteTextResult')),
  descriptor('analysisRead', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvAnalysisRead`, parseAnalysisRead))], anyObjectCodec('MvAnalysisReadResult')),
  // 0.7.0 MV 创意工坊 (GitHub repository catalogue; downloads checked by sha256; publishing happens on github.com).
  descriptor('workshopIndex', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopIndex`, parseWorkshopIndexRequest))], anyObjectCodec('MvWorkshopIndexResult')),
  descriptor('workshopCover', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopCover`, parseWorkshopId))], anyObjectCodec('MvWorkshopCoverResult')),
  descriptor('workshopInstall', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopInstall`, parseWorkshopId))], anyObjectCodec('MvWorkshopInstallResult')),
  descriptor('workshopUninstall', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopUninstall`, parseWorkshopId))], anyObjectCodec('MvWorkshopUninstallResult')),
  descriptor('workshopInstalled', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopInstalled`, parseWorkshopInstalled))], anyObjectCodec('MvWorkshopInstalledResult')),
  descriptor('workshopPublish', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopPublish`, parseWorkshopPublish))], anyObjectCodec('MvWorkshopPublishResult')),
  descriptor('workshopDirInfo', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirInfo`, parseWorkshopDirInfo))], anyObjectCodec('MvWorkshopDirInfoResult')),
  descriptor('workshopDirSet', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirSet`, parseWorkshopDirSet))], anyObjectCodec('MvWorkshopDirSetResult')),
  descriptor('workshopDirMove', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirMove`, parseWorkshopDirMove))], anyObjectCodec('MvWorkshopDirMoveResult')),
  descriptor('workshopDirOpen', [jsonParameter('request', requestCodec(`${MV_REMOTE_PACKAGE}#MvWorkshopDirOpen`, parseWorkshopDirOpen))], anyObjectCodec('MvWorkshopDirOpenResult')),
])

export const MV_CLIENT_REMOTE = Object.freeze({ package: MV_REMOTE_PACKAGE, descriptors: MV_REMOTE_DESCRIPTORS })

export const MV_HOST_TYPERT = Object.freeze({
  package: MV_REMOTE_PACKAGE,
  face: 'host',
  schemas: [],
  invocations: MV_REMOTE_DESCRIPTORS,
  model: { services: [], events: [], objects: [] },
})
