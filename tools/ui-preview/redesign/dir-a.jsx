// Direction A: modern music app (Spotify / Apple Music-like). Sidebar, large cover art, blurred-cover
// hero for now playing, Apple-style big lyrics, bottom player bar. Best in dark.
import React, { useState } from 'react'
import { Icon } from './icons.jsx'
import { Cover, Stage, Seek, CalibEditor, useCues, Stepper, MiniBars, CUES, SECTIONS, cueAt, sectionAt } from './widgets.jsx'
import { LIBRARY, WORKSHOP, AI_STEPS, FILES, LICENSES, fmt, kb, fakeSha } from './data.mjs'

const NAV = [['library', 'library', '曲库'], ['now', 'music', '正在播放'], ['workshop', 'store', '创意工坊'], ['ai', 'sparkles', 'AI 制作'], ['calib', 'wave', '歌词校准']]
const KINDS = ['全部', '预设', 'AI 制作', '创意工坊', 'MV 包']

function Shell({ screen, go, clock, item, theme, toggleTheme, children }) {
  return <div className="app A" data-theme={theme}>
    <aside className="a-side">
      <div className="a-brand"><span className="a-logo"><Icon name="terminal" size={18} stroke={2.4} /></span><div><b>MV 放映室</b><small>dsh-mv · 0.7</small></div></div>
      <nav className="a-nav" aria-label="导航">{NAV.map(([id, ic, label]) =>
        <button key={id} className={`a-nav-i${(screen === id || (screen === 'wsdetail' && id === 'workshop')) ? ' on' : ''}`} onClick={() => go(id)}><Icon name={ic} size={19} />{label}</button>)}</nav>
      <div className="a-side-h">最近播放</div>
      <ul className="a-recent">{LIBRARY.slice(0, 5).map(p => <li key={p.id} className={p.id === item.id ? 'on' : ''}><Cover item={p} variant="A" /><div><b>{p.title}</b><small>{p.artist}</small></div>{p.id === item.id && clock.playing && <MiniBars t={clock.t} n={4} />}</li>)}</ul>
      <div className="a-side-foot">
        <button className="btn ghost sm" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />{theme === 'dark' ? '浅色' : '深色'}</button>
        <button className="btn icon sm" aria-label="关于"><Icon name="info" size={16} /></button>
      </div>
    </aside>
    <main className="a-main">{children}</main>
    <footer className="a-bar">
      <div className="a-bar-now"><Cover item={item} variant="A" /><div><b>{item.title}</b><small>{item.artist} · {sectionAt(clock.t).label}</small></div></div>
      <div className="a-bar-mid">
        <div className="a-transport">
          <button className="btn icon" aria-label="后退 5 秒" onClick={() => clock.seek(clock.t - 5)}><Icon name="back" size={18} /></button>
          <button className="a-play" aria-label={clock.playing ? '暂停' : '播放'} onClick={clock.toggle}><Icon name={clock.playing ? 'pause' : 'play'} size={18} stroke={0} className="fill" /></button>
          <button className="btn icon" aria-label="前进 5 秒" onClick={() => clock.seek(clock.t + 5)}><Icon name="forward" size={18} /></button>
        </div>
        <Seek clock={clock} />
      </div>
      <div className="a-bar-right">
        <button className="btn icon" aria-label="字幕"><Icon name="captions" size={18} /></button>
        <span className="a-vol"><Icon name="volume" size={18} /><input type="range" defaultValue="70" style={{ '--p': '70%' }} aria-label="音量" /></span>
        <button className="btn icon" aria-label="全屏"><Icon name="maximize" size={18} /></button>
      </div>
    </footer>
  </div>
}

function Library({ go, clock, item }) {
  const [kind, setKind] = useState('全部')
  const list = LIBRARY.filter(p => kind === '全部' || p.kind.includes(kind === '预设' ? '预设' : kind))
  return <div className="a-page">
    <header className="a-head">
      <div><h1>曲库</h1><p className="sub">{LIBRARY.length} 首 MV · 用你自己的音频播放</p></div>
      <div className="a-head-act">
        <label className="a-search"><Icon name="search" size={16} /><input placeholder="搜索歌名、歌手" /></label>
        <button className="btn ghost"><Icon name="folder" size={16} />导入 MV 包</button>
        <button className="btn primary" onClick={() => go('ai')}><Icon name="sparkles" size={16} />用 AI 制作</button>
      </div>
    </header>
    <section className="a-hero" onClick={() => go('now')}>
      <div className="a-hero-bg"><Cover item={item} variant="A" /></div>
      <Cover item={item} variant="A" className="a-hero-cover" />
      <div className="a-hero-info">
        <span className="eyebrow">继续播放</span>
        <h2>{item.title}</h2>
        <p>{item.artist} · {item.kind} · {fmt(item.dur)}</p>
        <div className="a-hero-prog"><i style={{ width: `${(clock.t / 120) * 100}%` }} /></div>
        <div className="a-hero-act"><button className="a-play lg" aria-label="播放"><Icon name="play" size={22} stroke={0} className="fill" /></button><span className="muted">{fmt(clock.t)} / {fmt(item.dur)} · 副歌 spectrum ring</span></div>
      </div>
    </section>
    <div className="a-sec-h"><h3>全部 MV</h3><div className="chips" role="tablist">{KINDS.map(k => <button key={k} role="tab" aria-selected={k === kind} className={`chip${k === kind ? ' on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}</div></div>
    <div className="a-grid">{list.map(p => <button key={p.id} className="a-card" onClick={() => go('now')}>
      <span className="a-card-art"><Cover item={p} variant="A" /><span className="a-card-play"><Icon name="play" size={20} stroke={0} className="fill" /></span></span>
      <b>{p.title}</b><small>{p.artist}</small><span className="tag">{p.kind}</span>
    </button>)}
      <button className="a-card a-card-new" onClick={() => go('ai')}><span className="a-card-art"><Icon name="plus" size={34} /></span><b>新建 MV</b><small>选一首歌，AI 来写画面</small></button>
    </div>
    <div className="a-sec-h"><h3>来自创意工坊</h3><button className="btn link" onClick={() => go('workshop')}>查看全部<Icon name="right" size={16} /></button></div>
    <div className="a-row">{WORKSHOP.slice(1, 6).map(p => <button key={p.id} className="a-card sm" onClick={() => go('wsdetail')}><span className="a-card-art"><Cover item={p} variant="A" /></span><b>{p.title}</b><small>by {p.author}</small></button>)}</div>
  </div>
}

function Lyrics({ t }) {
  const i = CUES.findIndex(c => c.time > t), cur = cueAt(CUES, t), idx = cur ? CUES.indexOf(cur) : Math.max(0, i - 1)
  return <div className="a-lyrics" aria-live="polite">{CUES.slice(Math.max(0, idx - 2), idx + 5).map(c => {
    const on = c === cur, words = c.words ?? []
    return <p key={c.time} className={on ? 'on' : c.time < t ? 'past' : ''}>{on && words.length ? words.map((w, k) => <span key={k} className={t >= w.time ? 'sung' : ''}>{w.text} </span>) : c.text}</p>
  })}</div>
}

function NowPlaying({ clock, item, calib }) {
  const [cues, setCues] = useCues(), sec = sectionAt(clock.t)
  return <div className="a-page a-now">
    <div className="a-now-bg" aria-hidden="true"><Cover item={item} variant="A" /></div>
    <header className="a-now-head">
      <Cover item={item} variant="A" className="a-now-cover" />
      <div>
        <span className="eyebrow">正在播放 · {item.kind}</span>
        <h1 className="display">{item.title}</h1>
        <p className="a-now-meta">{item.artist}<span>·</span>{fmt(item.dur)}<span>·</span>120 BPM</p>
        <div className="chips"><span className="chip solid"><Icon name="check" size={14} stroke={3} />音频已匹配</span><span className="chip">my-own-copy.flac</span><span className="chip">lyrics.lrc · 21 句</span></div>
      </div>
    </header>
    <div className={`a-now-body${calib ? ' calib' : ''}`}>
      <div className="a-stage-wrap">
        <Stage scene={item.scene} t={clock.t} palette="A" className="a-stage" />
        <div className="a-stage-hud"><span className="pill">{sec.kind} · {sec.label}</span><button className="btn icon glass" aria-label="全屏"><Icon name="maximize" size={16} /></button></div>
      </div>
      {!calib && <Lyrics t={clock.t} />}
      {calib && <div className="a-side-card"><h3>校准提示</h3><p className="muted">黄色句子置信度低。拖动波形上的歌词块调整时间，点击波形从该处播放。</p><div className="a-stat"><b>2</b><span>句待确认</span></div><div className="a-stat"><b>0.17 s</b><span>中位误差</span></div></div>}
    </div>
    <div className="a-sections" role="list">{SECTIONS.map(s => <button key={s.start} role="listitem" className={`a-sec${s === sec ? ' on' : ''}`} style={{ flexGrow: s.end - s.start }} onClick={() => clock.seek(s.start + 0.1)}><b>{s.kind}</b><small>{s.label}</small>{s === sec && <i style={{ width: `${((clock.t - s.start) / (s.end - s.start)) * 100}%` }} />}</button>)}</div>
    {calib && <section className="a-panel"><div className="a-panel-h"><h3>歌词校准</h3><span className="muted">21 句 · 2 句待确认</span></div><CalibEditor clock={clock} cues={cues} setCues={setCues} /></section>}
  </div>
}

function Modal({ title, sub, onClose, children, footer, wide }) {
  return <div className="a-scrim" role="dialog" aria-modal="true" aria-label={title}><div className={`a-modal${wide ? ' wide' : ''}`}>
    <header><div><h2>{title}</h2>{sub && <p className="muted">{sub}</p>}</div><button className="btn icon" aria-label="关闭" onClick={onClose}><Icon name="x" size={18} /></button></header>
    <div className="a-modal-body">{children}</div>{footer && <footer>{footer}</footer>}
  </div></div>
}

function AiDialog({ go }) {
  return <Modal title="用 AI 制作新 MV" sub="选一首歌，插件在本机分析，再交给 Harness Agent 写画面。" onClose={() => go('library')} wide
    footer={<><span className="muted"><Icon name="shield" size={15} />音频不会上传；会话使用你的模型额度</span><span className="grow" /><button className="btn ghost">停止</button><button className="btn primary" disabled><Icon name="loader" size={16} className="spin" />制作中 62%</button></>}>
    <div className="a-ai">
      <div className="a-form">
        <div className="a-drop"><span className="a-file-ic"><Icon name="music" size={22} /></span><div><b>starlight-run.flac</b><small>FLAC · 44.1 kHz · 1:58 · 28.4 MB</small></div><button className="btn ghost sm">更换</button></div>
        <div className="a-2col"><label className="field"><span>歌名</span><input defaultValue="Starlight Run" /></label><label className="field"><span>歌手</span><input defaultValue="Alice" /></label></div>
        <div className="field"><span>歌词</span><div className="seg"><button className="on">自动获取</button><button>粘贴</button><button>从文件</button></div><small className="hint">先查 LRCLIB，找不到时用本机歌词引擎识别。</small></div>
        <label className="field"><span>风格说明</span><textarea rows="3" defaultValue="赛博朋克雨夜，副歌满屏代码雨，桥段只留心跳线。" /></label>
        <label className="field"><span>保存位置</span><div className="a-path"><Icon name="folder" size={16} />%LOCALAPPDATA%\dsh-mv\packs\Starlight Run</div></label>
      </div>
      <div className="a-ai-steps"><h3>制作进度</h3><Stepper steps={AI_STEPS} /></div>
    </div>
  </Modal>
}

const lic = l => l.replace('CC-BY-', 'CC BY-').replace(/-4\.0$/, ' 4.0')
function Workshop({ go }) {
  const [q, setQ] = useState(''), [l, setL] = useState('全部许可'), [inst, setInst] = useState(false)
  const list = WORKSHOP.filter(p => (!q || (p.title + p.artist + p.author + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) && (l === '全部许可' || p.license === l) && (!inst || p.installed))
  const f = WORKSHOP[0]
  return <div className="a-page">
    <header className="a-head"><div><h1>创意工坊</h1><p className="sub">社区 MV 包 · <a href="#">Alice-Marx/dsh-mv-workshop</a></p></div>
      <div className="a-head-act"><button className="btn ghost"><Icon name="refresh" size={16} />刷新</button><button className="btn primary"><Icon name="upload" size={16} />发布到工坊</button></div></header>
    <section className="a-feature" onClick={() => go('wsdetail')}>
      <div className="a-hero-bg"><Cover item={f} variant="A" /></div>
      <div className="a-feature-info"><span className="eyebrow">本周精选</span><h2>{f.title}</h2><p>{f.desc}</p>
        <div className="chips"><span className="chip">{lic(f.license)}</span><span className="chip">{fmt(f.dur)}</span><span className="chip">by {f.author}</span></div>
        <div className="a-hero-act"><button className="btn primary"><Icon name="refresh" size={16} />更新到 {f.version}</button><button className="btn glass">查看详情</button></div></div>
      <Cover item={f} variant="A" className="a-feature-art" />
    </section>
    <div className="a-trust"><Icon name="shield" size={16} />工坊包由社区提交，经 CI 检查并核对 sha256；场景脚本始终在沙箱里运行（无网络、存储和 DOM）。包内不含音频和歌词，请用你自己的文件。</div>
    <div className="a-filter">
      <label className="a-search"><Icon name="search" size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索歌名、歌手、作者、标签" /></label>
      <div className="chips">{LICENSES.map(x => <button key={x} className={`chip${x === l ? ' on' : ''}`} onClick={() => setL(x)}>{x === '全部许可' ? x : lic(x)}</button>)}</div>
      <label className="switch"><input type="checkbox" checked={inst} onChange={e => setInst(e.target.checked)} /><i />只看已安装</label>
    </div>
    <div className="a-grid ws">{list.map(p => <button key={p.id} className="a-card" onClick={() => go('wsdetail')}>
      <span className="a-card-art"><Cover item={p} variant="A" />{p.installed && <span className={`badge${p.installed !== p.version ? ' upd' : ''}`}>{p.installed !== p.version ? '有更新' : '已安装'}</span>}</span>
      <b>{p.title}</b><small>{p.artist} · {fmt(p.dur)}</small><span className="a-by"><span className="av">{p.author[0].toUpperCase()}</span>{p.author}<span className="tag">{lic(p.license)}</span></span>
    </button>)}</div>
  </div>
}

function WsDetail({ go }) {
  const p = WORKSHOP[0]
  return <Modal title="" onClose={() => go('workshop')} wide footer={null}>
    <div className="a-detail">
      <div className="a-detail-art"><Cover item={p} variant="A" /><a className="btn ghost sm" href="#"><Icon name="github" size={15} />在 GitHub 上查看</a></div>
      <div className="a-detail-info">
        <span className="eyebrow">创意工坊 · v{p.version}</span><h2 className="display sm">{p.title}</h2><p className="a-now-meta">{p.artist}<span>·</span>by {p.author}</p>
        <div className="chips"><span className="chip"><Icon name="scale" size={14} />{lic(p.license)}</span><span className="chip"><Icon name="clock" size={14} />{fmt(p.dur)}</span><span className="chip"><Icon name="list" size={14} />{p.sections} 段</span><span className="chip"><Icon name="wave" size={14} />含音频指纹</span>{p.tags.map(t => <span key={t} className="chip"><Icon name="tag" size={13} />{t}</span>)}</div>
        <p className="a-desc">{p.desc}</p>
        <div className="a-hero-act"><button className="btn primary lg"><Icon name="refresh" size={17} />更新到 {p.version}</button><button className="btn ghost lg"><Icon name="play" size={17} />打开</button><button className="btn ghost danger lg"><Icon name="trash" size={17} />卸载</button><span className="muted">已安装 {p.installed}</span></div>
        <div className="a-trust"><Icon name="shield" size={16} />场景脚本在沙箱中运行。播放时请选择你自己的音频，时长或指纹不一致会提示。</div>
        <table className="a-files"><thead><tr><th>文件</th><th>大小</th><th>sha256</th></tr></thead><tbody>{FILES.map(([n, s]) => <tr key={n}><td><Icon name="file" size={14} />{n}</td><td>{kb(s)}</td><td><code>{fakeSha(n).slice(0, 16)}…</code></td></tr>)}</tbody></table>
      </div>
    </div>
  </Modal>
}

export default function DirA({ screen, go, clock, theme, toggleTheme }) {
  const item = LIBRARY[2]
  const body = screen === 'now' ? <NowPlaying clock={clock} item={item} /> : screen === 'calib' ? <NowPlaying clock={clock} item={item} calib />
    : screen === 'workshop' || screen === 'wsdetail' ? <Workshop go={go} /> : <Library go={go} clock={clock} item={item} />
  return <Shell screen={screen} go={go} clock={clock} item={item} theme={theme} toggleTheme={toggleTheme}>
    {body}{screen === 'ai' && <AiDialog go={go} />}{screen === 'wsdetail' && <WsDetail go={go} />}
  </Shell>
}
