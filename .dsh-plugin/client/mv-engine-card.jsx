/**
 * 歌词引擎 card: status, one-click install (confirm card with the download
 * size first), model downloads, progress with stop. The Host runs only its
 * fixed uv / engine-script steps; see README「歌词引擎」.
 */
import React from 'react'
import { Alert } from './mv-ui.jsx'
import { unwrapRemote } from './remote-state.mjs'
import { errorText } from './mv-info.mjs'
import { followJob } from './mv-auto.mjs'

const GB = mb => `${(mb / 1024).toFixed(mb >= 1024 ? 1 : 2)} GB`
export const MODEL_LABELS = Object.freeze({ 'large-v3': 'large-v3（最准，GPU 推荐）', medium: 'medium（折中）', small: 'small（最快，CPU 推荐）' })

export function useEngineInfo(api) {
  const [info, setInfo] = React.useState(null)
  const refresh = React.useCallback(async () => {
    if (!api?.engineInfo) return null
    try { const value = unwrapRemote(await api.engineInfo({}), ''); setInfo(value); return value } catch (failure) { setInfo({ status: 'error', error: errorText(failure, '') }); return null }
  }, [api])
  React.useEffect(() => { void refresh() }, [refresh])
  return [info, refresh]
}

export const engineReady = info => info?.status === 'ready' && Object.values(info.models ?? {}).some(Boolean)
export const installedModels = info => Object.entries(info?.models ?? {}).filter(([, present]) => present).map(([name]) => name)

export function EngineCard({ api, info, refresh, compact = false }) {
  const [confirm, setConfirm] = React.useState(null) // { kind: 'install' | 'model', profile, model }
  const [job, setJob] = React.useState(null) // { id, ratio, label, log: [] }
  const [error, setError] = React.useState('')
  const stop = React.useRef(null)
  if (!info) return null
  const estimate = confirm ? (confirm.kind === 'install' ? info.estimates?.[`${confirm.profile}:${confirm.model}`] : { downloadMB: (info.modelSizes?.[confirm.model] ?? 0) + (info.demucs ? 0 : info.demucsMB ?? 0), diskMB: info.modelSizes?.[confirm.model] ?? 0 }) : null

  const run = async (start, label) => {
    setError(''); setConfirm(null)
    const controller = new AbortController(); stop.current = controller
    try {
      const started = unwrapRemote(await start(), '无法启动。')
      setJob({ id: started.jobId, ratio: 0, label, step: started.steps?.[0]?.label ?? '', log: [] })
      await followJob(api, started.jobId, {
        signal: controller.signal,
        onEvent: event => setJob(current => current && ({
          ...current,
          step: event.type === 'step' ? event.label : current.step,
          detail: event.type === 'progress' ? event.message : current.detail,
          log: event.type === 'log' && event.message ? [...current.log, event.message].slice(-40) : current.log,
        })),
        onProgress: read => setJob(current => current && ({ ...current, ratio: read.ratio })),
      })
      setJob(null)
    } catch (failure) { setJob(current => current && { ...current, failed: true }); setError(errorText(failure, '失败。')) }
    finally { stop.current = null; await refresh() }
  }

  const status = info.status
  const gpu = info.gpu ? `${info.gpu.name}（${Math.round(info.gpu.vramMB / 1024)} GB）` : ''
  const models = installedModels(info)
  return (
    <div className="mv-engine-card" aria-label="歌词引擎">
      <div className="mv-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong>本机歌词引擎（faster-whisper + Demucs）</strong>
        <span className="mv-caption">{status === 'ready' ? (info.cuda ? `GPU：${gpu}` : '只能用 CPU（较慢）') : status === 'missing' ? '未安装' : status === 'unchecked' ? '已安装，待检查' : status === 'incomplete' ? '依赖不完整' : status}</span>
      </div>
      {!compact && <p className="mv-caption">没有现成时间轴时，用它在本机听歌识别每句的时间（音频不上传）。安装在 <code>{info.dir}</code>，用 uv 建独立的 Python {info.pins?.python} 环境，不影响你已有的 Python。</p>}
      {status === 'ready' && <p className="mv-caption">已下载模型：{models.length ? models.join('、') : '无'}{info.demucs ? ' · 人声分离 htdemucs ✓' : ' · 人声分离模型未下载'}{!info.cuda ? ' · 没有可用的 NVIDIA GPU：识别一首歌约需几分钟，建议用 small。' : ''}</p>}
      {info.external && <p className="mv-caption">使用设置里指定的 Python：<code>{info.python}</code>（不会自动安装；缺依赖时请手动 pip install 后点「检查」）。</p>}
      {!job && !confirm && <div className="mv-row">
        {(status === 'missing' || status === 'incomplete') && !info.external && <button type="button" className="mv-button mv-button-small" disabled={!info.uv} onClick={() => setConfirm({ kind: 'install', profile: 'cuda', model: 'large-v3' })}>一键安装…</button>}
        {status === 'ready' && ['large-v3', 'medium', 'small'].filter(m => !info.models?.[m]).length > 0 && <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => setConfirm({ kind: 'model', model: ['large-v3', 'medium', 'small'].find(m => !info.models?.[m]) })}>下载模型…</button>}
        {status !== 'missing' && <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => void run(() => api.engineProbe({}), '检查引擎')}>检查</button>}
        {!info.uv && status === 'missing' && !info.external && <span className="mv-caption">没有找到 uv：请先安装 uv（https://docs.astral.sh/uv/），或在插件设置里填 uv.exe 的路径 / 已有的 Python 环境。</span>}
      </div>}
      {confirm && <div className="mv-confirm" role="dialog" aria-label="确认下载">
        <strong>{confirm.kind === 'install' ? '下载并安装歌词引擎？' : '下载识别模型？'}</strong>
        {confirm.kind === 'install' && <label className="mv-field"><span>PyTorch 版本</span>
          <select value={confirm.profile} onChange={event => setConfirm(c => ({ ...c, profile: event.target.value }))}>
            <option value="cuda">NVIDIA GPU（CUDA 12.6，推荐有 N 卡时）</option>
            <option value="cpu">只用 CPU（下载小，识别慢）</option>
          </select></label>}
        <label className="mv-field"><span>识别模型</span>
          <select value={confirm.model} onChange={event => setConfirm(c => ({ ...c, model: event.target.value }))}>
            {Object.entries(MODEL_LABELS).filter(([m]) => confirm.kind === 'install' || !info.models?.[m]).map(([m, label]) => <option key={m} value={m}>{label} · {GB(info.modelSizes?.[m] ?? 0)}</option>)}
          </select></label>
        <span className="mv-caption">约需下载 <b>{GB(estimate?.downloadMB ?? 0)}</b>{estimate?.diskMB ? `，占用磁盘约 ${GB(estimate.diskMB)}` : ''}。来源：{confirm.kind === 'install' ? 'pypi.org、download.pytorch.org、' : ''}huggingface.co（模型）。可以随时停止，下次会接着装。</span>
        <div className="mv-row">
          <button type="button" className="mv-button mv-button-small" onClick={() => void (confirm.kind === 'install'
            ? run(() => api.engineInstall({ confirmed: true, profile: confirm.profile, model: confirm.model }), '安装歌词引擎')
            : run(() => api.engineModel({ confirmed: true, model: confirm.model }), `下载 ${confirm.model}`))}>确认下载</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => setConfirm(null)}>取消</button>
        </div>
      </div>}
      {job && <div aria-live="polite">
        <div className="mv-row" style={{ justifyContent: 'space-between' }}><span className="mv-caption">{job.label} · {job.step}{job.detail ? ` · ${job.detail}` : ''}</span><span className="mv-caption">{Math.round((job.ratio ?? 0) * 100)}%</span></div>
        <div className="mv-progress"><span style={{ width: `${Math.round((job.ratio ?? 0) * 100)}%` }} /></div>
        {job.log.length > 0 && <pre className="mv-log">{job.log.slice(-6).join('\n')}</pre>}
        {!job.failed && <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => stop.current?.abort()}>停止</button>}
      </div>}
      {error && <Alert kind="error"><p className="mv-wrap">{error}</p></Alert>}
    </div>
  )
}
