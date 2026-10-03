// Direction C: clean Fluent / Harness-native. DeepSeek Harness design tokens (--dsw-*), pivot tabs,
// white cards with soft shadows, InfoBars, a right-side details panel. Best in light.
import React, { useState } from 'react'
import { Icon } from './icons.jsx'
import { Cover, Stage, Seek, CalibEditor, useCues, Stepper, MiniBars, CUES, SECTIONS, cueAt, sectionAt } from './widgets.jsx'
import { LIBRARY, WORKSHOP, AI_STEPS, FILES, LICENSES, fmt, kb, fakeSha } from './data.mjs'

const TABS = [['library', '曲库'], ['now', '正在播放'], ['workshop', '创意工坊'], ['calib', '歌词校准']]
const lic = l => l.replace('CC-BY-', 'CC BY-').replace(/-4\.0$/, ' 4.0')
const Card = ({ title, action, className = '', children }) => <section className={`c-card ${className}`}>{(title || action) && <header><h3>{title}</h3>{action}</header>}{children}</section>

function Shell({ screen, go, theme, toggleTheme, children }) {
  return <div className="app C" data-theme={theme}>
    <header className="c-top">
      <span className="c-brand"><span className="c-logo"><Icon name="terminal" size={16} stroke={2.4} /></span>MV 放映室</span>
      <nav className="c-pivot" role="tablist">{TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={screen === id || (screen === 'wsdetail' && id === 'workshop')} onClick={() => go(id)}>{label}</button>)}</nav>
      <span className="grow" />
      <label className="c-search"><Icon name="search" size={15} /><input placeholder="搜索 MV" /><kbd>Ctrl K</kbd></label>
      <button className="btn primary" onClick={() => go('ai')}><Icon name="sparkles" size={15} />用 AI 制作</button>
      <button className="btn icon subtle" onClick={toggleTheme} aria-label="切换主题"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /></button>
      <button className="btn icon subtle" aria-label="关于"><Icon name="info" size={17} /></button>
    </header>
    <main className="c-main">{children}</main>
  </div>
}

function Library({ go, clock, item }) {
  const [view, setView] = useState('grid')
  return <div className="c-page">
    <div className="c-title"><div><h1>曲库</h1><p>{LIBRARY.length} 个 MV 包 · 内置预设、AI 制作和创意工坊</p></div><div className="c-row"><button className="btn"><Icon name="folder" size={15} />导入 MV 包</button><button className="btn" onClick={() => go('workshop')}><Icon name="store" size={15} />浏览创意工坊</button></div></div>
    <div className="c-recent">
      <Card className="c-continue">
        <div className="c-continue-art"><Stage scene={item.scene} t={clock.t} palette="C" cols={80} rows={26} /></div>
        <div className="c-continue-info"><span className="c-eyebrow">继续播放</span><h2>{item.title}</h2><p className="c-sub">{item.artist} · {item.kind} · {fmt(item.dur)}</p>
          <div className="c-progress"><i style={{ width: `${(clock.t / 120) * 100}%` }} /></div><p className="c-caption">{fmt(clock.t)} / {fmt(item.dur)} · 副歌 · spectrum ring</p>
          <div className="c-row"><button className="btn primary" onClick={() => go('now')}><Icon name="play" size={15} stroke={0} className="fill" />继续</button><button className="btn" onClick={() => go('calib')}><Icon name="wave" size={15} />校准歌词</button></div></div>
      </Card>
      <Card title="快速开始" className="c-quick">
        <button className="c-action" onClick={() => go('ai')}><span className="c-action-ic blue"><Icon name="sparkles" size={18} /></span><div><b>用 AI 制作新 MV</b><small>选一首歌，自动对齐歌词后交给 Agent</small></div><Icon name="right" size={16} /></button>
        <button className="c-action"><span className="c-action-ic green"><Icon name="music" size={18} /></span><div><b>播放本地歌曲</b><small>MP3、FLAC、M4A、视频音轨…</small></div><Icon name="right" size={16} /></button>
        <button className="c-action" onClick={() => go('workshop')}><span className="c-action-ic amber"><Icon name="store" size={18} /></span><div><b>创意工坊</b><small>8 个社区包 · 1 个更新</small></div><Icon name="right" size={16} /></button>
      </Card>
    </div>
    <div className="c-sec"><h2>全部</h2><div className="c-seg" role="radiogroup"><button aria-checked={view === 'grid'} role="radio" onClick={() => setView('grid')}><Icon name="grid" size={15} /></button><button aria-checked={view === 'list'} role="radio" onClick={() => setView('list')}><Icon name="list" size={15} /></button></div></div>
    {view === 'grid' ? <div className="c-grid">{LIBRARY.map(p => <button key={p.id} className="c-tile" onClick={() => go('now')}>
      <span className="c-tile-art"><Cover item={p} variant="C" /><span className="c-tile-play"><Icon name="play" size={16} stroke={0} className="fill" /></span></span>
      <span className="c-tile-body"><b>{p.title}</b><small>{p.artist} · {fmt(p.dur)}</small><span className={`c-badge k${p.kind.length % 4}`}>{p.kind}</span></span></button>)}</div>
      : <Card className="c-list">{LIBRARY.map(p => <button key={p.id} className="c-list-row" onClick={() => go('now')}><Cover item={p} variant="C" /><b>{p.title}</b><span>{p.artist}</span><span className={`c-badge k${p.kind.length % 4}`}>{p.kind}</span><span className="c-caption">{fmt(p.dur)}</span></button>)}</Card>}
  </div>
}

function NowPlaying({ clock, item, calib }) {
  const [cues, setCues] = useCues(), sec = sectionAt(clock.t), cur = cueAt(CUES, clock.t)
  const idx = cur ? CUES.indexOf(cur) : Math.max(0, CUES.findIndex(c => c.time > clock.t) - 1)
  return <div className="c-page">
    <div className={`c-now${calib ? ' calib' : ''}`}>
      <Card className="c-player">
        <div className="c-stage"><Stage scene={item.scene} t={clock.t} palette="C" /></div>
        <div className="c-sections">{SECTIONS.map(s => <button key={s.start} className={s === sec ? 'on' : ''} style={{ flexGrow: s.end - s.start }} onClick={() => clock.seek(s.start + 0.1)} title={s.label}><span>{s.kind}</span></button>)}</div>
        <div className="c-controls">
          <button className="btn icon subtle" aria-label="后退 5 秒" onClick={() => clock.seek(clock.t - 5)}><Icon name="back" size={17} /></button>
          <button className="c-play" onClick={clock.toggle} aria-label={clock.playing ? '暂停' : '播放'}><Icon name={clock.playing ? 'pause' : 'play'} size={18} stroke={0} className="fill" /></button>
          <button className="btn icon subtle" aria-label="前进 5 秒" onClick={() => clock.seek(clock.t + 5)}><Icon name="forward" size={17} /></button>
          <Seek clock={clock} />
          <span className="c-sync"><button className="btn icon subtle sm">−</button>同步 +0.00 s<button className="btn icon subtle sm">+</button></span>
          <button className="btn icon subtle" aria-label="字幕"><Icon name="captions" size={17} /></button><button className="btn icon subtle" aria-label="音量"><Icon name="volume" size={17} /></button><button className="btn icon subtle" aria-label="全屏"><Icon name="maximize" size={17} /></button>
        </div>
      </Card>
      <div className="c-side">
        <Card className="c-info"><div className="c-info-h"><Cover item={item} variant="C" /><div><span className="c-eyebrow">正在播放</span><h2>{item.title}</h2><p className="c-sub">{item.artist} · {item.kind}</p></div></div>
          <div className="c-chips"><span className="c-badge">120 BPM</span><span className="c-badge">6 段</span><span className="c-badge ok"><Icon name="check" size={12} stroke={3} />音频已匹配</span></div></Card>
        <Card title="媒体">
          <div className="c-media"><span className="c-action-ic green"><Icon name="music" size={16} /></span><div><b>my-own-copy.flac</b><small>FLAC · 2:00 · 指纹 0.94</small></div><button className="btn sm">更换</button></div>
          <div className="c-media"><span className="c-action-ic blue"><Icon name="file" size={16} /></span><div><b>lyrics.lrc</b><small>21 句 · 逐词时间</small></div><button className="btn sm">更换</button></div>
          <div className="c-media"><span className="c-action-ic amber"><Icon name="wave" size={16} /></span><div><b>频谱</b><small>实时分析</small></div><MiniBars t={clock.t} n={14} className="c-mini" /></div>
        </Card>
        {!calib && <Card title="歌词" action={<button className="btn subtle sm" onClick={() => {}}><Icon name="wave" size={14} />校准</button>}>
          <ol className="c-lyrics">{CUES.slice(Math.max(0, idx - 1), idx + 5).map(c => <li key={c.time} className={c === cur ? 'on' : c.time < clock.t ? 'past' : ''} onClick={() => clock.seek(c.time)}><time>{fmt(c.time)}</time><span>{c === cur && c.words ? c.words.map((w, k) => <i key={k} className={clock.t >= w.time ? 'sung' : ''}>{w.text} </i>) : c.text}</span></li>)}</ol>
        </Card>}
      </div>
    </div>
    {calib && <Card title="歌词校准" action={<span className="c-infobar warn sm"><Icon name="alert" size={14} />2 句置信度低</span>} className="c-cal"><CalibEditor clock={clock} cues={cues} setCues={setCues} /></Card>}
  </div>
}

function AiDialog({ go }) {
  return <div className="c-scrim" role="dialog" aria-modal="true" aria-label="用 AI 制作新 MV"><div className="c-dialog">
    <header><div><h2>用 AI 制作新 MV</h2><p className="c-sub">在本机分析音频与歌词，然后在新会话中交给 Agent。</p></div><button className="btn icon subtle" aria-label="关闭" onClick={() => go('library')}><Icon name="x" size={18} /></button></header>
    <div className="c-dialog-body">
      <div className="c-ai-steps"><Stepper steps={AI_STEPS} /></div>
      <div className="c-form">
        <div className="c-file"><span className="c-action-ic green"><Icon name="music" size={18} /></span><div><b>starlight-run.flac</b><small>FLAC · 44.1 kHz · 1:58 · 28.4 MB</small></div><button className="btn sm">更换</button></div>
        <div className="c-2"><label className="c-field"><span>歌名</span><input defaultValue="Starlight Run" /></label><label className="c-field"><span>歌手</span><input defaultValue="Alice" /></label></div>
        <div className="c-field"><span>歌词来源</span><div className="c-seg wide"><button aria-checked="true">自动获取</button><button>粘贴</button><button>从文件</button></div></div>
        <label className="c-field"><span>风格说明 <em>可选</em></span><textarea rows="3" defaultValue="赛博朋克雨夜，副歌满屏代码雨，桥段只留心跳线。" /></label>
        <label className="c-field"><span>保存位置</span><div className="c-path"><Icon name="folder" size={15} />%LOCALAPPDATA%\dsh-mv\packs\Starlight Run<button className="btn subtle sm">更改</button></div></label>
        <div className="c-infobar"><Icon name="info" size={15} />音频不会上传。交给 AI 后，Agent 会话使用你的模型额度。</div>
      </div>
    </div>
    <footer><button className="btn">停止</button><span className="grow" /><button className="btn" disabled>在新会话中交给 AI</button><button className="btn primary" disabled><Icon name="loader" size={15} className="spin" />正在识别歌词 62%</button></footer>
  </div></div>
}

function Workshop({ go }) {
  const [q, setQ] = useState(''), [l, setL] = useState('全部许可'), [inst, setInst] = useState(false), [kind, setKind] = useState('all')
  const list = WORKSHOP.filter(p => (!q || (p.title + p.artist + p.author + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) && (l === '全部许可' || p.license === l) && (!inst || p.installed) && (kind === 'all' || p.renderer === kind))
  return <div className="c-page">
    <div className="c-title"><div><h1>创意工坊</h1><p>社区 MV 包 · <a href="#">Alice-Marx/dsh-mv-workshop</a> · 索引更新于 5 分钟前</p></div><div className="c-row"><button className="btn"><Icon name="refresh" size={15} />刷新</button><button className="btn primary"><Icon name="upload" size={15} />发布到工坊</button></div></div>
    <div className="c-infobar"><Icon name="shield" size={16} /><div><b>关于信任</b> 工坊包由社区提交，经 GitHub Actions 检查，安装时核对每个文件的 sha256。场景脚本始终在沙箱中运行（无网络、存储和 DOM）。包内不含音频和歌词。</div></div>
    <div className="c-ws">
      <Card className="c-filters">
        <label className="c-search block"><Icon name="search" size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="歌名、歌手、作者、标签" /></label>
        <div className="c-fgroup"><h4>许可</h4>{LICENSES.map(x => <label key={x} className="c-radio"><input type="radio" name="lic" checked={l === x} onChange={() => setL(x)} /><i />{x === '全部许可' ? '全部' : lic(x)}</label>)}</div>
        <div className="c-fgroup"><h4>类型</h4>{[['all', '全部'], ['script', '场景脚本'], ['generic', '通用渲染']].map(([k, n]) => <label key={k} className="c-radio"><input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} /><i />{n}</label>)}</div>
        <label className="c-toggle"><input type="checkbox" checked={inst} onChange={e => setInst(e.target.checked)} /><i />只看已安装</label>
      </Card>
      <div>
        <div className="c-sec"><h2>{list.length} 个包</h2><span className="c-caption">排序：最近更新</span></div>
        <div className="c-grid ws">{list.map(p => <button key={p.id} className="c-tile" onClick={() => go('wsdetail')}>
          <span className="c-tile-art wide"><Cover item={p} variant="C" />{p.installed && <span className={`c-badge float ${p.installed !== p.version ? 'warn' : 'ok'}`}>{p.installed !== p.version ? '有更新' : '已安装'}</span>}</span>
          <span className="c-tile-body"><b>{p.title}</b><small>{p.artist} · {fmt(p.dur)}</small><span className="c-by"><span className="c-av">{p.author[0].toUpperCase()}</span>{p.author}<span className="c-badge">{lic(p.license)}</span></span></span></button>)}</div>
      </div>
    </div>
  </div>
}

function WsDetail({ go }) {
  const p = WORKSHOP[0]
  return <div className="c-scrim right" role="dialog" aria-modal="true" aria-label={p.title}><aside className="c-drawer">
    <header><button className="btn icon subtle" aria-label="返回" onClick={() => go('workshop')}><Icon name="left" size={18} /></button><span>包详情</span><span className="grow" /><a className="btn subtle sm" href="#"><Icon name="external" size={14} />GitHub</a><button className="btn icon subtle" aria-label="关闭" onClick={() => go('workshop')}><Icon name="x" size={18} /></button></header>
    <div className="c-drawer-body">
      <div className="c-detail-art"><Cover item={p} variant="C" /></div>
      <h2>{p.title}</h2><p className="c-sub">{p.artist} · by {p.author} · v{p.version}</p>
      <div className="c-row"><button className="btn primary"><Icon name="refresh" size={15} />更新到 {p.version}</button><button className="btn"><Icon name="play" size={15} stroke={0} className="fill" />打开</button><button className="btn danger-subtle"><Icon name="trash" size={15} />卸载</button></div>
      <div className="c-infobar warn"><Icon name="info" size={15} />已安装 {p.installed}。更新会替换包文件，不影响你选择的音频和歌词。</div>
      <p>{p.desc}</p>
      <dl className="c-dl"><dt>许可</dt><dd>{lic(p.license)}</dd><dt>时长</dt><dd>{fmt(p.dur)}（播放时按 ±2 秒比对）</dd><dt>渲染</dt><dd>场景脚本 · {p.sections} 段</dd><dt>音频指纹</dt><dd>energy-2hz-v1</dd><dt>标签</dt><dd>{p.tags.map(t => <span key={t} className="c-badge">{t}</span>)}</dd></dl>
      <h4>文件</h4>
      <ul className="c-files">{FILES.map(([n, s]) => <li key={n}><Icon name="file" size={15} /><b>{n}</b><span>{kb(s)}</span><code>{fakeSha(n).slice(0, 12)}…</code></li>)}</ul>
      <div className="c-infobar"><Icon name="shield" size={15} />场景脚本在沙箱中运行。请使用你自己合法取得的音频。</div>
    </div>
  </aside></div>
}

export default function DirC({ screen, go, clock, theme, toggleTheme }) {
  const item = LIBRARY[2]
  const body = screen === 'now' ? <NowPlaying clock={clock} item={item} /> : screen === 'calib' ? <NowPlaying clock={clock} item={item} calib />
    : screen === 'workshop' || screen === 'wsdetail' ? <Workshop go={go} /> : <Library go={go} clock={clock} item={item} />
  return <Shell screen={screen} go={go} theme={theme} toggleTheme={toggleTheme}>{body}{screen === 'ai' && <AiDialog go={go} />}{screen === 'wsdetail' && <WsDetail go={go} />}</Shell>
}
