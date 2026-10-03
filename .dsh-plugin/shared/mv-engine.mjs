/**
 * Host side of the lyrics engine: locate uv / the engine Python, install the
 * pinned environment under %LOCALAPPDATA%\dsh-mv\engine (only after the
 * user confirmed), and run the fixed engine script as cancellable jobs that
 * stream JSON progress lines. No shell, no command text from the panel.
 */
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { delimiter, dirname, join, win32 } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEMUCS_MB, ENGINE_LIMITS, ENGINE_MODELS, ENGINE_PACKAGES, ENGINE_PYTHON, ENGINE_SCRIPT, ENGINE_TORCH, ENGINE_VERSION,
  engineArgs, installEstimate, uvInstallSteps,
} from './mv-engine-protocol.mjs'

/** Absolute path of a Windows system tool (never looked up on PATH). */
const systemTool = (name, env = process.env) => win32.join(env.SystemRoot || env.SYSTEMROOT || env.windir || 'C:\\Windows', 'System32', name)

export const ENGINE_SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'engine', ENGINE_SCRIPT)

/** Resolved versions of the managed install (uv --constraints). */
/* Resolved with uv 0.12 on Windows x64 / CPython 3.12.14 (2026-10-03). */
export const ENGINE_CONSTRAINTS = Object.freeze([
  'anyio==4.15.1',
  'av==19.0.1',
  'certifi==2026.7.22',
  'click==8.5.0',
  'colorama==0.4.6',
  'ctranslate2==4.8.2',
  'demucs==4.1.0',
  'einops==0.8.2',
  'faster-whisper==1.2.1',
  'filelock==3.32.3',
  'flatbuffers==25.12.19',
  'fsspec==2026.7.0',
  'h11==0.16.0',
  'hf-xet==1.6.0',
  'httpcore==1.0.9',
  'httpx==0.28.1',
  'huggingface-hub==1.33.0',
  'idna==3.20',
  'jinja2==3.1.6',
  'julius==0.2.8',
  'lameenc==1.8.4',
  'markupsafe==3.0.3',
  'mpmath==1.3.0',
  'networkx==3.6.1',
  'numpy==2.5.3',
  'onnxruntime==1.30.0',
  'packaging==26.3',
  'protobuf==7.36.2',
  'pyyaml==6.0.3',
  'safetensors==0.8.0',
  'setuptools==78.1.0',
  'sphn==0.2.1',
  'sympy==1.14.0',
  'tokenizers==0.23.2',
  'torch==2.8.0',
  'tqdm==4.70.1',
  'typing-extensions==4.16.0',
])

export function engineDir(env = process.env, platform = process.platform) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'dsh-mv', 'engine')
  return join(env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'dsh-mv', 'engine')
}

const isFile = async (path, statPath = stat) => { try { return (await statPath(path)).isFile() } catch { return false } }

/** uv.exe: config, PATH, then the usual install locations. Never runs it. */
export async function findUv({ configured = '', env = process.env, platform = process.platform, statPath = stat } = {}) {
  const exe = platform === 'win32' ? 'uv.exe' : 'uv'
  if (configured) return (await isFile(configured, statPath)) ? configured : null
  const sep = platform === 'win32' ? ';' : delimiter
  for (const dir of String(env.PATH ?? env.Path ?? '').split(sep).map(p => p.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean)) {
    const candidate = platform === 'win32' ? `${dir.replace(/[\\/]+$/, '')}\\${exe}` : join(dir, exe)
    if (await isFile(candidate, statPath)) return candidate
  }
  const home = env.USERPROFILE || homedir()
  const known = platform === 'win32'
    ? [join(home, '.local', 'bin', exe), join(env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Programs', 'uv', exe), join(home, '.cargo', 'bin', exe)]
    : [join(home, '.local', 'bin', exe), join(home, '.cargo', 'bin', exe), '/usr/local/bin/uv', '/opt/homebrew/bin/uv']
  for (const candidate of known) if (await isFile(candidate, statPath)) return candidate
  return null
}

export function venvPython(dir, platform = process.platform) {
  return platform === 'win32' ? join(dir, 'venv', 'Scripts', 'python.exe') : join(dir, 'venv', 'bin', 'python')
}

/** Child environment: inherited (proxy settings included) + engine caches inside the engine folder. */
export function engineEnvironment(dir, { env = process.env, offline = true, hfEndpoint = '' } = {}) {
  const out = {}
  for (const [key, value] of Object.entries(env)) if (typeof value === 'string' && key.toUpperCase() !== 'ELECTRON_RUN_AS_NODE' && !/^PYTHON(PATH|HOME|STARTUP)$/i.test(key)) out[key] = value
  Object.assign(out, {
    PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8', PYTHONNOUSERSITE: '1', PYTHONDONTWRITEBYTECODE: '1',
    HF_HOME: join(dir, 'models', 'hf'), TORCH_HOME: join(dir, 'models', 'torch'), HF_HUB_DISABLE_TELEMETRY: '1',
    HF_HUB_DISABLE_SYMLINKS_WARNING: '1', HF_HUB_DISABLE_PROGRESS_BARS: '1', HF_HUB_DISABLE_XET: '1', HF_HUB_DOWNLOAD_TIMEOUT: '60', HF_HUB_ETAG_TIMEOUT: '30', TQDM_DISABLE: '1', DO_NOT_TRACK: '1',
    UV_LINK_MODE: 'copy', UV_NO_PROGRESS: '1', UV_PYTHON_PREFERENCE: 'managed',
  })
  if (offline) { out.HF_HUB_OFFLINE = '1'; out.TRANSFORMERS_OFFLINE = '1' }
  if (hfEndpoint) out.HF_ENDPOINT = hfEndpoint
  return out
}

const hexId = () => randomBytes(8).toString('hex')

/**
 * Jobs: a list of steps (fixed file + argv), run one after another. Engine
 * steps print JSON lines; other steps' output lines become log events.
 */
export function createJobManager({ spawnImpl = spawn, platform = process.platform, env = process.env, killTree = null, maxJobs = 4 } = {}) {
  const jobs = new Map()
  const kill = child => {
    if (!child || child.exitCode !== null) return
    if (killTree) { killTree(child.pid); return }
    if (platform === 'win32') { try { spawnSync(systemTool('taskkill.exe', env), ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }) } catch { /* gone */ } }
    try { child.kill() } catch { /* gone */ }
  }
  const wake = job => { for (const resolve of job.waiters.splice(0)) resolve() }
  const push = (job, event) => {
    job.events.push(event)
    if (job.events.length > ENGINE_LIMITS.jobEvents) { job.events.splice(0, job.events.length - ENGINE_LIMITS.jobEvents); job.dropped = (job.dropped ?? 0) + 1 }
    if (event.type === 'progress') {
      const step = job.steps[job.stepIndex]
      job.ratio = job.base + (step?.weight ?? 0) * (event.ratio ?? 0)
      job.stage = event.stage ?? job.stage
    }
    wake(job)
  }
  const runStep = (job, step) => new Promise(resolve => {
    let child
    try { child = spawnImpl(step.file, step.args, { cwd: step.cwd, env: step.env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }) }
    catch (error) { resolve({ code: -1, error: String(error?.message ?? error) }); return }
    job.child = child
    const timer = setTimeout(() => { push(job, { type: 'log', message: `超时，结束：${step.label}` }); kill(child) }, step.timeoutMs ?? ENGINE_LIMITS.runTimeoutMs)
    let pending = { out: '', err: '' }
    let lastError = ''
    const onLine = (line, stream) => {
      const text = line.replace(/\r/g, '').trimEnd()
      if (!text) return
      if (step.json && stream === 'out' && text.startsWith('{')) {
        try {
          const event = JSON.parse(text)
          if (event.type === 'result') job.result = { ...(job.result ?? {}), [step.id]: event }
          if (event.type === 'error') lastError = event.message
          push(job, { ...event, step: step.id })
          return
        } catch { /* plain line */ }
      }
      if (stream === 'err') lastError = text.slice(0, 500)
      push(job, { type: 'log', step: step.id, message: text.slice(0, 1000) })
    }
    const feed = stream => chunk => {
      pending[stream] += chunk.toString('utf8')
      const parts = pending[stream].split(/\n/)
      pending[stream] = parts.pop()
      for (const part of parts) onLine(part, stream)
    }
    child.stdout?.on('data', feed('out'))
    child.stderr?.on('data', feed('err'))
    child.on('error', error => { clearTimeout(timer); resolve({ code: -1, error: String(error?.message ?? error) }) })
    child.on('close', code => {
      clearTimeout(timer)
      for (const stream of ['out', 'err']) if (pending[stream]) onLine(pending[stream], stream)
      resolve({ code, error: lastError })
    })
  })
  return {
    start({ kind, steps, onDone = null, meta = {} }) {
      for (const [id, job] of jobs) if (job.done && jobs.size >= maxJobs) jobs.delete(id)
      if ([...jobs.values()].some(job => !job.done)) throw new Error('已有一个歌词引擎任务在运行，请等它结束或先停止。')
      const total = steps.reduce((n, s) => n + (s.weight ?? 1), 0) || 1
      const job = { id: `mvjob-${hexId()}`, kind, meta, steps: steps.map(s => ({ ...s, weight: (s.weight ?? 1) / total })), stepIndex: 0, base: 0, ratio: 0, stage: '', events: [], waiters: [], done: false, ok: false, cancelled: false, result: null, error: '', startedAt: Date.now() }
      jobs.set(job.id, job)
      void (async () => {
        for (let i = 0; i < job.steps.length; i++) {
          if (job.cancelled) break
          const step = job.steps[i]
          job.stepIndex = i
          push(job, { type: 'step', step: step.id, index: i, count: job.steps.length, label: step.label })
          const started = Date.now()
          const { code, error } = await runStep(job, step)
          job.child = null
          push(job, { type: 'stepDone', step: step.id, code, seconds: Math.round((Date.now() - started) / 100) / 10 })
          if (job.cancelled) break
          if (code !== 0) { job.error = `${step.label} 失败（退出码 ${code}）${error ? `：${error}` : ''}`; break }
          job.base += step.weight
          job.ratio = job.base
        }
        job.ok = !job.cancelled && !job.error
        if (job.ok && onDone) { try { job.result = { ...(job.result ?? {}), done: await onDone(job) } } catch (error) { job.ok = false; job.error = String(error?.message ?? error) } }
        job.done = true
        job.finishedAt = Date.now()
        push(job, { type: 'done', ok: job.ok, cancelled: job.cancelled, error: job.error })
      })()
      return { jobId: job.id, kind, steps: job.steps.map(s => ({ id: s.id, label: s.label })) }
    },
    async read({ jobId, cursor = 0, waitMs = 0 }) {
      const job = jobs.get(jobId)
      if (!job) throw new Error('没有这个任务（可能 Harness 已重启）。')
      if (cursor >= job.events.length && !job.done && waitMs > 0) await new Promise(resolve => { job.waiters.push(resolve); setTimeout(resolve, waitMs) })
      const from = Math.min(cursor, job.events.length)
      return { jobId, kind: job.kind, events: job.events.slice(from), cursor: job.events.length, done: job.done, ok: job.ok, cancelled: job.cancelled, error: job.error, ratio: Math.round(job.ratio * 1000) / 1000, step: job.steps[job.stepIndex]?.id ?? '', result: job.done ? job.result : null, seconds: Math.round(((job.finishedAt ?? Date.now()) - job.startedAt) / 100) / 10 }
    },
    cancel({ jobId }) {
      const job = jobs.get(jobId)
      if (!job) throw new Error('没有这个任务。')
      if (job.done) return { cancelled: false, done: true }
      job.cancelled = true
      kill(job.child)
      push(job, { type: 'log', message: '已请求停止。' })
      return { cancelled: true }
    },
    active() { return [...jobs.values()].find(job => !job.done)?.id ?? null },
    disposeAll() { for (const job of jobs.values()) if (!job.done) { job.cancelled = true; kill(job.child) } },
  }
}

/**
 * Engine manager. `config()` returns { enginePython, uvPath, hfEndpoint } from the
 * plugin settings; a non-empty enginePython means "use my own Python env".
 */
export function createEngineManager({ dir = engineDir(), jobs = createJobManager(), config = () => ({}), env = process.env, platform = process.platform, scriptPath = ENGINE_SCRIPT_PATH, statPath = stat, locateUv = findUv, loadPack = null } = {}) {
  const stateFile = join(dir, 'engine.json')
  const readState = async () => { try { return JSON.parse(await readFile(stateFile, 'utf8')) } catch { return null } }
  const writeState = async patch => { const next = { ...((await readState()) ?? {}), ...patch, version: ENGINE_VERSION }; await mkdir(dir, { recursive: true }); await writeFile(stateFile, JSON.stringify(next, null, 2), 'utf8'); return next }
  const pythonOf = () => String(config().enginePython ?? '').trim() || venvPython(dir, platform)
  const external = () => Boolean(String(config().enginePython ?? '').trim())
  const childEnv = offline => engineEnvironment(dir, { env, offline, hfEndpoint: String(config().hfEndpoint ?? '').trim() })
  const argsFile = async (name, data) => { const jobsDir = join(dir, 'jobs'); await mkdir(jobsDir, { recursive: true }); const file = join(jobsDir, `${name}-${hexId()}.json`); await writeFile(file, JSON.stringify(data), 'utf8'); return file }
  const engineStep = async (id, label, command, data, { weight = 1, offline = true, timeoutMs } = {}) => ({
    id, label, weight, json: true, timeoutMs, file: pythonOf(), cwd: dir, env: childEnv(offline),
    args: engineArgs(scriptPath, command, await argsFile(command, { modelsDir: join(dir, 'models'), ...data })),
  })
  const probeStep = () => engineStep('probe', '检查歌词引擎（Python、CUDA、模型）', 'probe', {}, { weight: 0.02, timeoutMs: 180_000 })
  const saveProbe = async job => { const probe = job.result?.probe; if (probe) await writeState({ probe, probedAt: new Date().toISOString(), python: pythonOf(), external: external() }); return probe ?? null }

  return {
    dir,
    async info() {
      const state = await readState()
      const python = pythonOf()
      const pythonExists = await isFile(python, statPath)
      const uv = external() ? null : await locateUv({ configured: String(config().uvPath ?? '').trim(), env, platform, statPath })
      const probe = pythonExists && state?.python === python ? state?.probe ?? null : null
      const models = probe?.models ?? {}
      const status = !pythonExists ? 'missing' : !probe ? 'unchecked' : (probe.packages?.['faster-whisper'] && probe.packages?.ctranslate2) ? 'ready' : 'incomplete'
      return {
        dir, status, external: external(), python, pythonExists, uv, script: scriptPath, probe, probedAt: state?.probedAt ?? null,
        profile: state?.profile ?? null, installedAt: state?.installedAt ?? null, models, demucs: Boolean(probe?.demucs),
        cuda: Boolean(probe?.cuda && (probe?.ctranslate2Cuda ?? 0) > 0), gpu: probe?.gpu ?? null, activeJob: jobs.active(),
        pins: { python: ENGINE_PYTHON, torch: ENGINE_TORCH, packages: ENGINE_PACKAGES },
        estimates: Object.fromEntries(['cuda', 'cpu'].flatMap(profile => Object.keys(ENGINE_MODELS).map(model => [`${profile}:${model}`, installEstimate({ profile, model })]))),
        modelSizes: Object.fromEntries(Object.entries(ENGINE_MODELS).map(([k, v]) => [k, v.downloadMB])), demucsMB: DEMUCS_MB,
      }
    },
    /** Re-run the probe (user action). */
    async probe() { return jobs.start({ kind: 'probe', steps: [await probeStep()], onDone: saveProbe }) },
    async install({ profile, model }) {
      if (external()) throw new Error('设置里指定了自己的 Python 环境，不能在那里自动安装；请按说明手动安装依赖，再点「检查引擎」。')
      const uv = await locateUv({ configured: String(config().uvPath ?? '').trim(), env, platform, statPath })
      if (!uv) throw new Error('没有找到 uv（https://docs.astral.sh/uv/）。请先安装 uv，或在插件设置里指定一个已有的 Python 3.10–3.12 环境。')
      await mkdir(dir, { recursive: true })
      const constraints = join(dir, 'constraints.txt')
      await writeFile(constraints, `${ENGINE_CONSTRAINTS.join('\n')}\n`, 'utf8')
      const python = venvPython(dir, platform)
      const installEnv = childEnv(false)
      const steps = uvInstallSteps({ venv: join(dir, 'venv'), python, profile, constraints }).map(step => ({ ...step, file: uv, cwd: dir, env: installEnv, timeoutMs: ENGINE_LIMITS.installTimeoutMs }))
      if (await isFile(python, statPath)) steps.shift()
      steps.push(await probeStep())
      steps.push(await engineStep('model', `下载模型 ${model} 和 htdemucs（约 ${Math.round((ENGINE_MODELS[model].downloadMB + DEMUCS_MB) / 100) / 10} GB）`, 'prefetch', { model, demucs: true }, { weight: ENGINE_MODELS[model].downloadMB / 1000, offline: false, timeoutMs: ENGINE_LIMITS.installTimeoutMs }))
      steps.push(await probeStep())
      await writeState({ profile, installStartedAt: new Date().toISOString() })
      return jobs.start({ kind: 'install', steps, meta: { profile, model }, onDone: async job => { const probe = await saveProbe(job); await writeState({ installedAt: new Date().toISOString(), profile }); return probe } })
    },
    async model({ model }) {
      if (!(await isFile(pythonOf(), statPath))) throw new Error('歌词引擎还没有安装。')
      return jobs.start({ kind: 'model', steps: [await engineStep('model', `下载模型 ${model}`, 'prefetch', { model, demucs: true }, { offline: false, timeoutMs: ENGINE_LIMITS.installTimeoutMs }), await probeStep()], meta: { model }, onDone: saveProbe })
    },
    async transcribe({ manifestPath, model, language, separate, prompt, device }) {
      if (!(await isFile(pythonOf(), statPath))) throw new Error('歌词引擎还没有安装。')
      if (!loadPack) throw new Error('MV 包功能未加载。')
      const loaded = await loadPack(manifestPath)
      const audio = loaded.files?.audio
      if (!audio?.exists || !audio.path) throw new Error('这个 MV 包没有可用的音频文件。')
      const packDir = dirname(loaded.manifestPath)
      const outDir = join(packDir, 'analysis')
      await mkdir(outDir, { recursive: true })
      const step = await engineStep('transcribe', `识别歌词时间（${model}）`, 'transcribe', { audio: audio.path, outDir, model, language, separate, prompt, device })
      return { ...jobs.start({ kind: 'transcribe', steps: [step], meta: { manifestPath: loaded.manifestPath, outDir } }), outDir }
    },
    read: request => jobs.read(request),
    cancel: request => jobs.cancel(request),
    disposeAll: () => jobs.disposeAll(),
    clearJobs: () => rm(join(dir, 'jobs'), { recursive: true, force: true }),
  }
}
