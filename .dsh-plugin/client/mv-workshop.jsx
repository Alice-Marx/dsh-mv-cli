/**
 * MV 创意工坊: browse the community catalogue (a public GitHub repository),
 * install / update / uninstall packs into 曲库, and 发布到工坊 (prepare a
 * stripped pack folder and open GitHub's upload page — nothing is submitted
 * without the user doing it on github.com).
 */
import React from 'react'
import { errorText } from './mv-info.mjs'
import { Alert, Icon } from './mv-ui.jsx'
import { loadPackFromHost, relocatePacks, rememberPack } from './mv-pack-state.mjs'
import { durationText, tooOld, installWorkshopPack, installedState, loadWorkshop, moveWorkshopPacks, openWorkshopDir, publishWorkshopPack, setWorkshopDir, sizeText, uninstallWorkshopPack, workshopCover, workshopDirInfo } from './mv-workshop-state.mjs'
import { WORKSHOP_DEFAULT_LICENSE, WORKSHOP_REPO, compareVersions, filterWorkshop, workshopSlug } from '../shared/mv-workshop.mjs'
import { CLIENT_VERSION } from './remote-state.mjs'

export { tooOld }

const REPO_URL = `https://github.com/${WORKSHOP_REPO}`
const LICENSES = ['CC-BY-NC-SA-4.0', 'CC-BY-NC-4.0', 'CC-BY-SA-4.0', 'CC-BY-4.0', 'CC0-1.0', 'MIT']
const RENDERERS = { script: '场景脚本', generic: '通用画面', 'dsh-pv': 'dsh-pv', 'world-execute-me': 'world.execute(me)' }

export function TrustNote() {
  return (
    <Alert kind="info">
      <p className="mv-wrap"><b>关于信任：</b>工坊里的包由社区投稿，经维护者在 GitHub 上审核后合并；插件安装时按索引校验每个文件的 sha256，并重新做一遍检查。
        场景脚本<b>始终在沙箱里运行</b>（独立 Web Worker，没有网络、存储、DOM 和文件访问，每帧限时，出错自动换回通用画面），但仍请只安装你信任的作者的包。
        包里<b>没有音频和歌词文本</b>：请使用你自己的歌曲文件。</p>
    </Alert>
  )
}

function Cover({ api, pack, large = false, cache }) {
  const [src, setSrc] = React.useState(() => cache.current.get(pack.id) ?? '')
  React.useEffect(() => {
    if (!pack.cover || cache.current.has(pack.id) || !api?.workshopCover) return
    let alive = true
    workshopCover(api, pack.id).then(value => {
      if (!value?.found) return
      const url = `data:${value.mime};base64,${value.base64}`
      cache.current.set(pack.id, url)
      if (alive) setSrc(url)
    }).catch(() => {})
    return () => { alive = false }
  }, [pack.id])
  const style = large ? { width: '100%', aspectRatio: '16 / 10' } : undefined
  return src
    ? <img className="mv-ws-cover" src={src} alt={`${pack.title} 封面`} style={style} />
    : <span className="mv-ws-cover mv-ws-cover-empty" style={style} aria-hidden="true">{'>_'}</span>
}

/** "owner/repo" for a GitHub link, else the host + path. */
export const sourceLabel = url => String(url ?? '').replace(/^https:\/\/(www\.)?(github\.com\/)?/, '').replace(/\/$/, '')
/** The original work's link (x-dsh-mv-workshop.source), shown under the description. */
export function SourceLink({ url, compact = false }) {
  if (!url) return null
  return <span className={`mv-ws-source${compact ? ' mv-ws-source-compact' : ''}`}>原作 <a href={url} target="_blank" rel="noreferrer" title={url} onClick={event => event.stopPropagation()}>{sourceLabel(url)}</a></span>
}

const copy = async text => { try { await globalThis.navigator?.clipboard?.writeText(text); return true } catch { return false } }

export function WorkshopDialog({ api, onClose, onLoaded, onRecent, active = null, canvas = () => null, initialIndex = null }) {
  const [index, setIndex] = React.useState(initialIndex)
  const [loading, setLoading] = React.useState(!initialIndex)
  const [error, setError] = React.useState('')
  const [note, setNote] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [license, setLicense] = React.useState('')
  const [renderer, setRenderer] = React.useState('')
  const [onlyInstalled, setOnlyInstalled] = React.useState(false)
  const [selected, setSelected] = React.useState(null)
  const [busy, setBusy] = React.useState('')
  const [confirmUninstall, setConfirmUninstall] = React.useState('')
  const [publishing, setPublishing] = React.useState(false)
  const covers = React.useRef(new Map())

  const refresh = React.useCallback(async (force = false) => {
    setLoading(true); setError('')
    try { setIndex(await loadWorkshop(api, force)) }
    catch (failure) { setError(errorText(failure, '无法读取创意工坊。')) }
    finally { setLoading(false) }
  }, [api])
  React.useEffect(() => { if (!initialIndex) void refresh(false) }, [refresh])

  const { map: installed, updates } = installedState(index)
  const packs = index?.packs ?? []
  const shown = filterWorkshop(packs, { query, license, renderer, installed, onlyInstalled })
  const current = selected ? packs.find(p => p.id === selected) : null

  const open = async manifestPath => {
    const loaded = await loadPackFromHost(api, manifestPath)
    onRecent(rememberPack(loaded))
    onLoaded(loaded)
    return loaded
  }
  const install = async pack => {
    setBusy(`install:${pack.id}`); setError(''); setNote('')
    try {
      const done = await installWorkshopPack(api, pack.id)
      await open(done.manifestPath)
      await refresh(false)
      setNote(`已${installed[pack.id] ? '更新' : '安装'}「${pack.title}」v${done.version}（${done.files} 个文件，sha256 全部校验通过），已加入曲库并打开。选择你自己的歌曲文件即可播放。`)
    } catch (failure) { setError(errorText(failure, '安装失败。')) }
    finally { setBusy('') }
  }
  const uninstall = async pack => {
    setBusy(`uninstall:${pack.id}`); setError(''); setNote(''); setConfirmUninstall('')
    try { await uninstallWorkshopPack(api, pack.id); await refresh(false); setNote(`已卸载「${pack.title}」（删除了插件工坊文件夹里的这个包；你自己的音频和歌词文件不受影响）。`) }
    catch (failure) { setError(errorText(failure, '卸载失败。')) }
    finally { setBusy('') }
  }

  const canPublish = active && !active.empty && active.manifestPath
  return (
    <div className="mv-dialog mv-ws" role="dialog" aria-label="创意工坊">
      <div className="mv-row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>创意工坊 <span className="mv-caption">社区 MV 包 · <a href={REPO_URL} target="_blank" rel="noreferrer">{WORKSHOP_REPO}</a></span></h2>
        <div className="mv-row">
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={loading} onClick={() => void refresh(true)}>{loading ? '读取中…' : '刷新'}</button>
          <button type="button" className="mv-button mv-button-small" disabled={!canPublish} title={canPublish ? `把当前的 MV 包「${active.pack.title}」发布到工坊` : '先在曲库里打开你自己的 MV 包'} onClick={() => setPublishing(value => !value)}>发布到工坊…</button>
          <button type="button" className="mv-icon-button" aria-label="关闭创意工坊" onClick={onClose}><Icon.close /></button>
        </div>
      </div>
      <TrustNote />
      {publishing && canPublish && <PublishDialog api={api} pack={active} canvas={canvas} onClose={() => setPublishing(false)} />}
      <div className="mv-row mv-ws-filters">
        <input className="mv-ws-search" value={query} placeholder="搜索歌名、歌手、作者、标签" aria-label="搜索工坊" onChange={event => setQuery(event.target.value)} />
        <select value={license} aria-label="按许可证筛选" onChange={event => setLicense(event.target.value)}>
          <option value="">全部许可证</option>{LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={renderer} aria-label="按渲染方式筛选" onChange={event => setRenderer(event.target.value)}>
          <option value="">全部类型</option>{Object.entries(RENDERERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="mv-check" style={{ height: 'auto' }}><input type="checkbox" checked={onlyInstalled} onChange={event => setOnlyInstalled(event.target.checked)} /><span>只看已安装</span></label>
        <span className="mv-caption">{index ? `${shown.length} / ${packs.length} 个包${updates.size ? ` · ${updates.size} 个有更新` : ''}` : ''}</span>
      </div>
      {error && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{error}{/404/.test(error) ? '\n工坊仓库可能还没有发布内容（index.json 不存在）。' : /超时|ENOTFOUND|ECONN/.test(error) ? '\n连不上 raw.githubusercontent.com：检查网络，或在系统环境变量里设置 HTTPS_PROXY。' : ''}</p></Alert>}
      {note && <Alert kind="ok" actions={<button type="button" className="mv-link" onClick={() => setNote('')}>知道了</button>}><p className="mv-wrap">{note}</p></Alert>}
      {current ? (
        <div className="mv-ws-detail">
          <div className="mv-ws-detail-art"><Cover api={api} pack={current} large cache={covers} /></div>
          <div className="mv-ws-detail-body">
            <button type="button" className="mv-link" onClick={() => setSelected(null)}>← 返回列表</button>
            <h3 style={{ margin: '6px 0 2px' }}>{current.title}</h3>
            <p className="mv-caption" style={{ marginTop: 0 }}>{current.artist || '未知艺术家'} · 作者 {current.author || '—'} · v{current.version}</p>
            <p className="mv-wrap">{current.description || '（没有简介）'}</p>
            {current.source && <p className="mv-wrap"><SourceLink url={current.source} /></p>}
            <div className="mv-row">
              <span className="mv-chip">许可 {current.license}</span>
              <span className="mv-chip">时长 {durationText(current.duration)}</span>
              <span className="mv-chip">{RENDERERS[current.renderer] ?? current.renderer}</span>
              {current.requires && <span className={`mv-chip${tooOld(current) ? ' mv-chip-warn' : ''}`} title="能播放这个包的最低插件版本">需要插件 v{current.requires}+</span>}
              {current.sections > 0 && <span className="mv-chip">{current.sections} 个段落</span>}
              <span className="mv-chip" title="安装后用你自己的歌词文件；按哈希匹配包里的逐句时间">{current.timing ? '带歌词时间轴' : '无歌词时间轴'}</span>
              <span className="mv-chip" title="用来检查你的音频是否是同一个版本">{current.fingerprint ? '带音频指纹' : '仅按时长匹配'}</span>
              {current.tags.map(t => <span key={t} className="mv-chip">#{t}</span>)}
            </div>
            <p className="mv-caption">{current.files.length} 个文件 · {sizeText(current.size)}{current.updated ? ` · 更新于 ${current.updated.slice(0, 10)}` : ''}{current.homepage ? <> · <a href={current.homepage} target="_blank" rel="noreferrer">主页</a></> : null}
              {' · '}<a href={`${REPO_URL}/tree/${index?.commit ?? 'main'}/packs/${current.id}`} target="_blank" rel="noreferrer">在 GitHub 上查看源码</a></p>
            <ul className="mv-caption mv-ws-files">{current.files.map(f => <li key={f.path}><code title={f.path}>{f.path}</code><span className="mv-ws-size">{sizeText(f.size)}</span><span className="mv-faint mv-ws-sha" title={`sha256 ${f.sha256}`}>sha256 {f.sha256.slice(0, 12)}…</span></li>)}</ul>
            {tooOld(current) && <Alert kind="warn">这个包需要 dsh-mv-cli v{current.requires} 或更新（当前 v{CLIENT_VERSION}）。请先在 DSH 里更新插件再安装。</Alert>}
            <div className="mv-row">
              {!installed[current.id] && <button type="button" className="mv-button" disabled={Boolean(busy) || tooOld(current)} onClick={() => void install(current)}>{busy === `install:${current.id}` ? '正在下载并校验…' : '安装到曲库'}</button>}
              {installed[current.id] && updates.has(current.id) && <button type="button" className="mv-button" disabled={Boolean(busy) || tooOld(current)} onClick={() => void install(current)}>{busy === `install:${current.id}` ? '正在更新…' : `更新到 v${current.version}（已装 v${installed[current.id].version}）`}</button>}
              {installed[current.id] && <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(busy)} onClick={() => void open(installed[current.id].manifestPath).then(() => setNote(`已打开「${current.title}」。`)).catch(failure => setError(errorText(failure, '无法打开。')))}>打开</button>}
              {installed[current.id] && confirmUninstall !== current.id && <button type="button" className="mv-button mv-button-danger" disabled={Boolean(busy)} onClick={() => setConfirmUninstall(current.id)}>卸载</button>}
              {confirmUninstall === current.id && <span className="mv-row"><span className="mv-caption">确定卸载？会删除插件工坊文件夹里的这个包。</span>
                <button type="button" className="mv-button mv-button-danger mv-button-small" onClick={() => void uninstall(current)}>确认卸载</button>
                <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => setConfirmUninstall('')}>取消</button></span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="mv-ws-grid" aria-busy={loading}>
          {shown.map(pack => (
            <div key={pack.id} role="button" tabIndex={0} className="mv-ws-card" onClick={() => setSelected(pack.id)} title={pack.description}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(pack.id) } }}>
              <Cover api={api} pack={pack} cache={covers} />
              <span className="mv-card-title">{pack.title}</span>
              <span className="mv-card-sub">{pack.artist || '未知艺术家'} · {durationText(pack.duration)}</span>
              <span className="mv-card-sub">by {pack.author || '—'} · {pack.license}</span>
              {pack.source && <span className="mv-card-sub"><SourceLink url={pack.source} compact /></span>}
              {installed[pack.id] && <span className={`mv-ws-badge${updates.has(pack.id) ? ' mv-ws-badge-update' : ''}`}>{updates.has(pack.id) ? '有更新' : '已安装'}</span>}
            </div>
          ))}
          {index && !shown.length && <p className="mv-caption">{packs.length ? '没有符合条件的包。' : '工坊里还没有包。'}</p>}
        </div>
      )}
      <WorkshopDirSettings api={api} active={active} onRecent={onRecent} onLoaded={onLoaded} onChanged={() => void refresh(false)} />
      <p className="mv-caption">工坊没有服务器：目录来自仓库里由 GitHub Actions 生成的 index.json。想投稿？打开你的 MV 包后点「发布到工坊…」，或看 <a href={`${REPO_URL}/blob/main/CONTRIBUTING.zh.md`} target="_blank" rel="noreferrer">投稿说明</a>。</p>
    </div>
  )
}

const SOURCE_TEXT = { default: '默认位置', custom: '你设置的位置', config: '插件配置 workshopDir', fixed: '固定位置' }

/**
 * 0.9.1: where workshop packs are installed. Shows the folder, lets the user change it (any drive,
 * e.g. F:\MV), open it, or go back to the default; packs in the old folder can be moved (copy, verify,
 * delete) or kept — kept packs stay in the library. The choice is stored by the Host (settings.json).
 */
export function WorkshopDirSettings({ api, active = null, onRecent = () => {}, onLoaded = () => {}, onChanged = () => {}, initialInfo = null, initialStep = null }) {
  const [info, setInfo] = React.useState(initialInfo)
  const [editing, setEditing] = React.useState(initialStep?.editing ?? false)
  const [value, setValue] = React.useState(initialStep?.value ?? '')
  const [busy, setBusy] = React.useState('')
  const [error, setError] = React.useState(initialStep?.error ?? '')
  const [ask, setAsk] = React.useState(initialStep?.ask ?? null)
  const [progress, setProgress] = React.useState(initialStep?.progress ?? null)
  const [result, setResult] = React.useState(initialStep?.result ?? null)
  const reload = React.useCallback(async () => { try { setInfo(await workshopDirInfo(api)) } catch (failure) { setError(errorText(failure, '无法读取安装位置。')) } }, [api])
  React.useEffect(() => { if (!initialInfo) void reload() }, [reload])

  const apply = async request => {
    setBusy('set'); setError(''); setResult(null)
    try {
      const next = await setWorkshopDir(api, request)
      setInfo(next); setEditing(false)
      if (next.movable?.length) setAsk({ previous: next.previous, packs: next.movable })
      else setResult({ text: next.changed ? `安装位置已改为 ${next.dir}。以后安装的包会放在这里。` : '安装位置没有变化。' })
      onChanged()
    } catch (failure) { setError(errorText(failure, '无法更改安装位置。')) }
    finally { setBusy('') }
  }
  const move = async packs => {
    setAsk(null); setBusy('move'); setError(''); setResult(null)
    const { moved, failed } = await moveWorkshopPacks(api, packs.map(p => p.id), setProgress)
    const moves = moved.filter(m => m.moved)
    if (moves.length) {
      onRecent(relocatePacks(moves))
      const current = active && moves.find(m => m.oldManifestPath.toLowerCase() === String(active.manifestPath ?? '').toLowerCase())
      if (current) { try { onLoaded(await loadPackFromHost(api, current.manifestPath)) } catch { /* reopened from the library */ } }
    }
    setProgress(null); setBusy('')
    setResult({ text: `已移动 ${moves.length} / ${packs.length} 个包到 ${info?.dir ?? '新位置'}。`, failed })
    await reload(); onChanged()
  }
  const keep = () => { setResult({ text: `原位置的 ${ask.packs.length} 个包留在 ${ask.previous}，曲库里仍然可以打开；以后可以在这里再移动。` }); setAsk(null) }
  const open = async () => { setError(''); try { await openWorkshopDir(api) } catch (failure) { setError(errorText(failure, '无法打开文件夹。')) } }
  const fixed = info?.source === 'fixed'
  const example = info?.platform === 'win32' || !info ? 'F:\\MV\\workshop' : '/home/me/mv-workshop'
  return (
    <section className="mv-ws-dir" aria-label="工坊安装位置">
      <div className="mv-row" style={{ justifyContent: 'space-between' }}>
        <div className="mv-ws-dir-text">
          <span className="mv-caption">安装位置</span>
          <code className="mv-wrap" title={info?.dir}>{info?.dir ?? '…'}</code>
          {info && <span className="mv-caption">{SOURCE_TEXT[info.source] ?? info.source} · {info.packs} 个包{info.extraDirs?.length ? ` · 另有 ${info.extraDirs.reduce((n, d) => n + d.packs.length, 0)} 个在旧位置` : ''}</span>}
        </div>
        <div className="mv-row">
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!info || Boolean(busy)} onClick={() => void open()}>打开文件夹</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!info || fixed || Boolean(busy)} onClick={() => { setEditing(true); setValue(info?.dir ?? ''); setError('') }}>更改…</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" disabled={!info || fixed || Boolean(busy) || info?.source === 'default' || info?.source === 'config'} title={info ? `恢复为 ${info.defaultDir}` : ''} onClick={() => void apply({ reset: true, keep: true })}>恢复默认</button>
        </div>
      </div>
      {editing && (
        <form className="mv-row mv-ws-dir-edit" onSubmit={event => { event.preventDefault(); void apply({ dir: value, keep: true }) }}>
          <input value={value} autoFocus spellCheck={false} aria-label="新的安装文件夹" placeholder={`例如 ${example}`} onChange={event => setValue(event.target.value)} />
          <button type="submit" className="mv-button mv-button-small" disabled={busy === 'set' || !value.trim()}>{busy === 'set' ? '正在检查…' : '使用这个文件夹'}</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => { setEditing(false); setError('') }}>取消</button>
          <span className="mv-caption" style={{ flexBasis: '100%' }}>填写完整路径，可以是其他磁盘（例如 {example}）。文件夹不存在会自动创建，并先测试能否写入。</span>
        </form>
      )}
      {ask && (
        <Alert kind="warn" actions={<>
          <button type="button" className="mv-button mv-button-small" onClick={() => void move(ask.packs)}>移动到新位置</button>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={keep}>留在原处</button></>}>
          <p className="mv-wrap">原来的位置 <code>{ask.previous}</code> 里有 {ask.packs.length} 个已安装的包（{ask.packs.slice(0, 4).map(p => p.title || p.id).join('、')}{ask.packs.length > 4 ? ' 等' : ''}）。要移动到新位置吗？移动会先复制并校验 sha256，成功后才删除旧文件。留在原处的包仍会出现在曲库里。</p>
        </Alert>
      )}
      {progress && <div className="mv-ws-dir-progress" role="status"><progress max={progress.total} value={progress.done} /> <span className="mv-caption">正在移动 {progress.done + (progress.id ? 1 : 0)} / {progress.total}{progress.id ? `：${progress.id}` : ''}</span></div>}
      {!ask && !progress && info?.extraDirs?.length > 0 && !result && (
        <p className="mv-caption mv-wrap">旧位置里还有包：{info.extraDirs.map(d => `${d.dir}（${d.packs.length} 个）`).join('；')}。
          <button type="button" className="mv-link" disabled={Boolean(busy)} onClick={() => void move(info.extraDirs.flatMap(d => d.packs.map(id => ({ id }))))}>全部移动到当前位置</button></p>
      )}
      {error && <Alert kind="error"><p className="mv-wrap">{error}</p></Alert>}
      {result && <Alert kind={result.failed?.length ? 'warn' : 'ok'} actions={<button type="button" className="mv-link" onClick={() => setResult(null)}>知道了</button>}>
        <p className="mv-wrap">{result.text}</p>
        {result.failed?.length > 0 && <ul className="mv-caption">{result.failed.map(f => <li key={f.id} className="mv-wrap">{f.id}：{f.error}</li>)}</ul>}
      </Alert>}
    </section>
  )
}

export function PublishDialog({ api, pack, canvas = () => null, onClose }) {
  const ws = pack.pack.workshop ?? {}
  const [form, setForm] = React.useState(() => ({
    id: ws.id ?? workshopSlug(pack.pack.title, pack.pack.artist), version: ws.version ?? '1.0.0', license: ws.license ?? WORKSHOP_DEFAULT_LICENSE,
    author: ws.author ?? '', description: '', tags: '', fingerprint: true, cover: true,
  }))
  const [busy, setBusy] = React.useState('')
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [agreed, setAgreed] = React.useState(false)
  const [copied, setCopied] = React.useState('')
  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setResult(null); setAgreed(false) }

  const prepare = async () => {
    setBusy('正在检查并打包…'); setError(''); setResult(null); setAgreed(false)
    try {
      const view = canvas()
      let fp = null
      if (form.fingerprint && view?.audioFingerprint) { setBusy('正在计算音频指纹（本机）…'); try { fp = await view.audioFingerprint() } catch { fp = null } }
      const coverPng = form.cover ? view?.snapshotPng?.() || undefined : undefined
      setBusy('正在检查并打包…')
      const value = await publishWorkshopPack(api, {
        manifestPath: pack.manifestPath, id: form.id.trim(), version: form.version.trim(), license: form.license.trim(), author: form.author.trim(),
        description: form.description.trim(), tags: form.tags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean).slice(0, 8),
        ...(fp?.duration ? { duration: Math.round(fp.duration * 1000) / 1000 } : {}), ...(fp?.base64 ? { fingerprint: fp.base64 } : {}),
        ...(coverPng && coverPng.length < 1_300_000 ? { coverPng } : {}),
      })
      setResult(value)
    } catch (failure) { setError(errorText(failure, '无法准备发布。')) }
    finally { setBusy('') }
  }
  const doCopy = async (label, text) => { setCopied(await copy(text) ? label : ''); setTimeout(() => setCopied(''), 2000) }

  return (
    <div className="mv-confirm" role="dialog" aria-label="发布到工坊">
      <strong>发布「{pack.pack.title}」到创意工坊</strong>
      <p className="mv-caption">插件会：检查包 → <b>去掉音频和歌词文本</b>（歌词只保留每行时间、逐词时间和文字哈希）→ 生成 README 和封面 → 放进本机的发布文件夹。
        然后由你在浏览器里把文件上传到 GitHub 并创建 Pull Request；<b>插件不会替你提交任何东西</b>。</p>
      <div className="mv-form">
        <label className="mv-field"><span>包 id（文件夹名）</span><input value={form.id} spellCheck={false} onChange={event => set('id', event.target.value.toLowerCase())} /></label>
        <label className="mv-field"><span>版本</span><input value={form.version} spellCheck={false} onChange={event => set('version', event.target.value)} /></label>
        <label className="mv-field"><span>许可证</span><input list="mv-ws-licenses" value={form.license} spellCheck={false} onChange={event => set('license', event.target.value)} />
          <datalist id="mv-ws-licenses">{LICENSES.map(l => <option key={l} value={l} />)}</datalist></label>
        <label className="mv-field"><span>作者（GitHub 用户名或署名）</span><input value={form.author} spellCheck={false} onChange={event => set('author', event.target.value)} /></label>
      </div>
      <label className="mv-field"><span>简介</span><input value={form.description} maxLength={500} onChange={event => set('description', event.target.value)} /></label>
      <label className="mv-field" style={{ marginTop: 8 }}><span>标签（逗号分隔，最多 8 个）</span><input value={form.tags} onChange={event => set('tags', event.target.value)} /></label>
      <div className="mv-row" style={{ marginTop: 6 }}>
        <label className="mv-check"><input type="checkbox" checked={form.fingerprint} onChange={event => set('fingerprint', event.target.checked)} /><span>附带音频指纹 <span className="mv-caption">— 用当前加载的音频在本机计算：每 0.5 秒一个音量值，只能用来判断别人的音频是不是同一版本，无法还原音频</span></span></label>
        <label className="mv-check"><input type="checkbox" checked={form.cover} onChange={event => set('cover', event.target.checked)} /><span>用当前画面做封面</span></label>
      </div>
      <div className="mv-row" style={{ marginTop: 8 }}>
        <button type="button" className="mv-button" disabled={Boolean(busy) || !form.id || !form.license.trim() || !form.author.trim()} onClick={() => void prepare()}>{busy || '检查并打包'}</button>
        <button type="button" className="mv-button mv-button-secondary" onClick={onClose}>取消</button>
      </div>
      {error && <Alert kind="error"><p className="mv-wrap">{error}</p></Alert>}
      {result && !result.ok && <Alert kind="error"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>没有通过检查，请修改后重试：{'\n'}{result.errors.join('\n')}</p></Alert>}
      {result?.ok && <div className="mv-ws-publish">
        <Alert kind="ok"><p className="mv-wrap">已通过检查并打包到：<code>{result.dir}</code>
          {result.stripped.length > 0 && <><br />已去掉：{result.stripped.join('；')}</>}{result.timingLines ? <><br />歌词时间轴：{result.timingLines} 行（只有时间和哈希）</> : null}</p></Alert>
        {result.warnings.length > 0 && <Alert kind="warn"><p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{result.warnings.join('\n')}</p></Alert>}
        <ul className="mv-caption mv-ws-files">{result.files.map(f => <li key={f.path}><code title={f.path}>{f.path}</code><span className="mv-ws-size">{sizeText(f.size)}</span><span /></li>)}</ul>
        <ol className="mv-caption mv-ws-steps">
          <li>复制上面的文件夹路径，在资源管理器里打开它。<button type="button" className="mv-link" onClick={() => void doCopy('dir', result.dir)}>{copied === 'dir' ? '已复制' : '复制路径'}</button></li>
          <li>点下面的按钮，浏览器会打开工坊仓库 <code>packs/{result.id}/</code> 的上传页面（需要登录 GitHub；GitHub 会自动 fork）。</li>
          <li>把文件夹里的 {result.files.length} 个文件拖进页面，选「Create a new branch … and start a pull request」，标题和说明可以粘贴下面的内容，然后由你确认提交。
            <button type="button" className="mv-link" onClick={() => void doCopy('pr', `${result.prTitle}\n\n${result.prBody}`)}>{copied === 'pr' ? '已复制' : '复制 PR 标题和说明'}</button></li>
          <li>维护者审核、CI 检查通过并合并后，包会出现在所有人的创意工坊里。</li>
        </ol>
        <label className="mv-check" style={{ height: 'auto' }}><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} />
          <span>我确认有权以 <b>{form.license}</b> 分享这些文件，包里没有音频、歌词文本或无权分享的素材。</span></label>
        <div className="mv-row" style={{ marginTop: 6 }}>
          {agreed
            ? <a className="mv-button" href={result.links.upload} target="_blank" rel="noreferrer">在 GitHub 上提交…</a>
            : <button type="button" className="mv-button" disabled>在 GitHub 上提交…</button>}
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => void doCopy('link', result.links.upload)}>{copied === 'link' ? '已复制链接' : '复制上传链接'}</button>
          <a className="mv-link" href={result.links.contributing} target="_blank" rel="noreferrer">投稿说明</a>
        </div>
      </div>}
    </div>
  )
}
