/**
 * Lyrics engine contract (pure): pinned packages, profiles, model sizes,
 * request parsers and the fixed argument vectors. The Host only ever runs
 *   uv venv … / uv pip install <pinned list>   (install, after confirmation)
 *   <engine python> <plugin>/engine/dsh_mv_engine.py <probe|prefetch|transcribe> <args.json>
 * Nothing here accepts a command line from the panel.
 */
import { isAbsolutePackPath } from './mv-pack.mjs'

export const ENGINE_VERSION = 1
export const ENGINE_PYTHON = '3.12'
export const ENGINE_SCRIPT = 'dsh_mv_engine.py'

/** Pinned top-level packages; ENGINE_CONSTRAINTS pins the resolved tree. */
export const ENGINE_TORCH = Object.freeze({
  cuda: Object.freeze({ packages: ['torch==2.8.0'], index: 'https://download.pytorch.org/whl/cu126', downloadMB: 2780, diskMB: 5860, label: 'NVIDIA GPU（CUDA 12.6）' }),
  cpu: Object.freeze({ packages: ['torch==2.8.0'], index: 'https://download.pytorch.org/whl/cpu', downloadMB: 600, diskMB: 1100, label: '仅 CPU' }),
})
export const ENGINE_PACKAGES = Object.freeze(['faster-whisper==1.2.1', 'ctranslate2==4.8.2', 'demucs==4.1.0', 'julius==0.2.8'])
export const ENGINE_PACKAGES_MB = Object.freeze({ downloadMB: 260, diskMB: 700 })
export const ENGINE_MODELS = Object.freeze({
  'large-v3': Object.freeze({ downloadMB: 2950, label: 'large-v3（最准，GPU 推荐，约 3 GB）', vramMB: 4500 }),
  medium: Object.freeze({ downloadMB: 1530, label: 'medium（约 1.5 GB）', vramMB: 2600 }),
  small: Object.freeze({ downloadMB: 470, label: 'small（最快，约 0.5 GB）', vramMB: 1200 }),
})
export const DEMUCS_MB = 80
export const ENGINE_LANGUAGES = Object.freeze(['auto', 'zh', 'ja', 'en', 'ko', 'yue'])
export const ENGINE_LIMITS = Object.freeze({ promptChars: 600, jobEvents: 4000, installTimeoutMs: 3 * 3600_000, runTimeoutMs: 3600_000, readWaitMs: 1500 })

export function installEstimate({ profile = 'cuda', model = 'large-v3' } = {}) {
  const torch = ENGINE_TORCH[profile] ?? ENGINE_TORCH.cpu
  const m = ENGINE_MODELS[model] ?? ENGINE_MODELS.small
  const downloadMB = torch.downloadMB + ENGINE_PACKAGES_MB.downloadMB + m.downloadMB + DEMUCS_MB
  const diskMB = torch.diskMB + ENGINE_PACKAGES_MB.diskMB + m.downloadMB + DEMUCS_MB
  return { downloadMB, diskMB, downloadGB: Math.round(downloadMB / 102.4) / 10, diskGB: Math.round(diskMB / 102.4) / 10 }
}

const fail = message => { throw new TypeError(message) }
const obj = (value, subject) => (value && typeof value === 'object' && !Array.isArray(value) ? value : fail(`${subject} must be an object`))
const only = (value, keys, subject) => { const extra = Object.keys(value).filter(k => !keys.includes(k)); if (extra.length) fail(`${subject}: unexpected fields: ${extra.join(', ')}`) }
const oneOf = (value, list, subject, fallback) => (value === undefined ? fallback : list.includes(value) ? value : fail(`${subject} must be one of ${list.join(', ')}`))
const bool = (value, subject, fallback) => (value === undefined ? fallback : typeof value === 'boolean' ? value : fail(`${subject} must be a boolean`))
const absPath = (value, subject) => (typeof value === 'string' && isAbsolutePackPath(value) && value.length < 1000 ? value : fail(`${subject} must be an absolute path`))
const jobIdOf = value => (typeof value === 'string' && /^mvjob-[a-f0-9]{12,32}$/.test(value) ? value : fail('jobId is invalid'))

export function parseEngineInfo(value = {}) { only(obj(value, 'engineInfo'), ['refresh'], 'engineInfo'); return { refresh: bool(value.refresh, 'refresh', false) } }

export function parseEngineInstall(value) {
  const v = obj(value, 'engineInstall')
  only(v, ['confirmed', 'profile', 'model'], 'engineInstall')
  if (v.confirmed !== true) fail('engineInstall needs confirmed: true')
  return { confirmed: true, profile: oneOf(v.profile, Object.keys(ENGINE_TORCH), 'profile', 'cuda'), model: oneOf(v.model, Object.keys(ENGINE_MODELS), 'model', 'large-v3') }
}

export function parseEngineModel(value) {
  const v = obj(value, 'engineModel')
  only(v, ['confirmed', 'model'], 'engineModel')
  if (v.confirmed !== true) fail('engineModel needs confirmed: true')
  return { confirmed: true, model: oneOf(v.model, Object.keys(ENGINE_MODELS), 'model', 'small') }
}

export function parseEngineTranscribe(value) {
  const v = obj(value, 'engineTranscribe')
  only(v, ['manifestPath', 'model', 'language', 'separate', 'prompt', 'device'], 'engineTranscribe')
  const prompt = v.prompt === undefined ? '' : typeof v.prompt === 'string' ? v.prompt.slice(0, ENGINE_LIMITS.promptChars) : fail('prompt must be a string')
  return {
    manifestPath: absPath(v.manifestPath, 'manifestPath'),
    model: oneOf(v.model, Object.keys(ENGINE_MODELS), 'model', 'large-v3'),
    language: oneOf(v.language, ENGINE_LANGUAGES, 'language', 'auto'),
    separate: bool(v.separate, 'separate', true),
    device: oneOf(v.device, ['auto', 'cuda', 'cpu'], 'device', 'auto'),
    prompt,
  }
}

export function parseJobRead(value) {
  const v = obj(value, 'jobRead')
  only(v, ['jobId', 'cursor', 'waitMs'], 'jobRead')
  const cursor = v.cursor ?? 0
  if (!Number.isInteger(cursor) || cursor < 0) fail('cursor must be a non-negative integer')
  const waitMs = v.waitMs ?? 0
  if (!Number.isInteger(waitMs) || waitMs < 0 || waitMs > ENGINE_LIMITS.readWaitMs) fail('waitMs out of range')
  return { jobId: jobIdOf(v.jobId), cursor, waitMs }
}
export function parseJobCancel(value) { const v = obj(value, 'jobCancel'); only(v, ['jobId'], 'jobCancel'); return { jobId: jobIdOf(v.jobId) } }

/** Fixed argv for the engine script. */
export function engineArgs(scriptPath, command, argsFile) {
  if (!['probe', 'prefetch', 'transcribe'].includes(command)) throw new TypeError('unknown engine command')
  return ['-X', 'utf8', '-u', scriptPath, command, argsFile]
}

/** Fixed uv argument vectors for the managed install. */
export function uvInstallSteps({ venv, python, profile = 'cuda', constraints }) {
  const torch = ENGINE_TORCH[profile] ?? ENGINE_TORCH.cpu
  return [
    { id: 'python', label: `创建 Python ${ENGINE_PYTHON} 环境（uv）`, weight: 0.03, args: ['venv', venv, '--python', ENGINE_PYTHON, '--no-project'] },
    { id: 'torch', label: `安装 PyTorch（${torch.label}，约 ${Math.round(torch.downloadMB / 100) / 10} GB）`, weight: 0.55, args: ['pip', 'install', '--python', python, '--no-cache', ...torch.packages, '--index-url', torch.index] },
    { id: 'packages', label: '安装 faster-whisper / Demucs 等依赖', weight: 0.12, args: ['pip', 'install', '--python', python, '--no-cache', ...ENGINE_PACKAGES, ...(constraints ? ['--constraints', constraints] : [])] },
  ]
}
