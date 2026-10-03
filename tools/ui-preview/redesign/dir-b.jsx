// Direction B: terminal / hacker aesthetic matching world.execute(me): monospace, neon green with amber
// and red accents, box panels with labels on the border, tmux-like tab bar and status line, CRT
// scanlines and vignette. Best in dark; light is a "paper terminal".
import React, { useState } from 'react'
import { Icon } from './icons.jsx'
import { Cover, Stage, Seek, CalibEditor, useCues, Stepper, MiniBars, CUES, SECTIONS, cueAt, sectionAt } from './widgets.jsx'
import { LIBRARY, WORKSHOP, AI_STEPS, FILES, LICENSES, fmt, kb, fakeSha } from './data.mjs'

const TABS = [['library', '曲库'], ['now', '播放'], ['workshop', '工坊'], ['ai', 'AI 制作'], ['calib', '校准']]
const Panel = ({ label, right, className = '', children }) => <section className={`b-panel ${className}`}><header><span className="b-label">{label}</span>{right && <span className="b-right">{right}</span>}</header>{children}</section>
const lic = l => l.replace('CC-BY-', 'CC-BY-').toLowerCase()

function Shell({ screen, go, clock, item, theme, toggleTheme, children }) {
  const sec = sectionAt(clock.t), pct = clock.t / clock.duration
  const bar = '█'.repeat(Math.round(pct * 24)).padEnd(24, '░')
  return <div className="app B" data-theme={theme}>
    <div className="b-top">
      <span className="b-brand"><Icon name="terminal" size={16} stroke={2.4} />dsh-mv<em>0.7</em></span>
      <nav className="b-tabs" aria-label="导航">{TABS.map(([id, label], i) => <button key={id} className={screen === id || (screen === 'wsdetail' && id === 'workshop') ? 'on' : ''} onClick={() => go(id)}><kbd>{i + 1}</kbd>{label}</button>)}</nav>
      <span className="grow" />
      <span className="b-meter"><MiniBars t={clock.t} n={10} />120 BPM</span>
      <button className="b-btn ghost" onClick={toggleTheme} aria-label="切换主题"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} /></button>
    </div>
    <main className="b-main">{children}</main>
    <footer className="b-status">
      <button className={`b-mode${clock.playing ? ' on' : ''}`} onClick={clock.toggle}><Icon name={clock.playing ? 'pause' : 'play'} size={13} stroke={0} className="fill" />{clock.playing ? 'PLAYING' : 'PAUSED'}</button>
      <span className="b-st-title">{item.title}<em> — {item.artist}</em></span>
      <span className="b-st-bar" aria-hidden="true">[{bar}]</span>
      <span>{fmt(clock.t)}/{fmt(clock.duration)}</span>
      <span className="b-st-sec">§ {sec.kind}:{sec.label}</span>
      <span className="grow" />
      <span className="b-keys"><kbd>SPACE</kbd>播放 <kbd>←→</kbd>5s <kbd>F</kbd>全屏 <kbd>?</kbd>帮助</span>
    </footer>
    <div className="b-crt" aria-hidden="true" />
  </div>
}

function Library({ go, clock }) {
  const [sel, setSel] = useState(2), p = LIBRARY[sel]
  return <div className="b-page">
    <div className="b-prompt"><span className="b-user">alice@harness</span>:<span className="b-path">~/dsh-mv</span>$ ls --covers library/ <span className="b-cursor" /></div>
    <div className="b-lib">
      <Panel label="LIBRARY" right={`${LIBRARY.length} packs`}>
        <div className="b-toolbar"><label className="b-input"><span>grep</span><input placeholder="歌名 / 歌手…" /></label><button className="b-btn"><Icon name="folder" size={14} />导入</button><button className="b-btn accent" onClick={() => go('ai')}><Icon name="sparkles" size={14} />AI 制作</button></div>
        <table className="b-table"><thead><tr><th /><th>#</th><th>TITLE</th><th>ARTIST</th><th>TYPE</th><th>LEN</th></tr></thead>
          <tbody>{LIBRARY.map((x, i) => <tr key={x.id} className={i === sel ? 'on' : ''} tabIndex={0} onClick={() => setSel(i)} onDoubleClick={() => go('now')}>
            <td className="b-caret">{i === sel ? '▶' : ''}</td><td className="dim">{String(i + 1).padStart(2, '0')}</td>
            <td><span className="b-row-title"><Cover item={x} variant="B" />{x.title}</span></td><td>{x.artist}</td><td><span className={`b-type t${x.kind.length % 4}`}>{x.kind}</span></td><td className="dim">{fmt(x.dur)}</td></tr>)}</tbody></table>
      </Panel>
      <div className="b-col">
        <Panel label="PREVIEW" right={p.id + '.mv'}>
          <div className="b-preview"><Cover item={p} variant="B" /><div><h2>{p.title}</h2><p className="dim">{p.artist} · {p.kind} · {fmt(p.dur)}</p>
            <div className="b-kv"><span>renderer</span><b>script</b><span>sections</span><b>6</b><span>lyrics</span><b>lyrics.lrc · 21</b><span>audio</span><b className="ok">matched ✓</b></div></div></div>
          <Stage scene={p.scene} t={p.t} palette="B" cols={84} rows={22} className="b-stage sm" />
          <div className="b-actions"><button className="b-btn accent lg" onClick={() => go('now')}><Icon name="play" size={14} stroke={0} className="fill" />ENTER 播放</button><button className="b-btn" onClick={() => go('calib')}><Icon name="wave" size={14} />校准</button><button className="b-btn" onClick={() => go('workshop')}><Icon name="upload" size={14} />发布</button></div>
        </Panel>
        <Panel label="WORKSHOP.FEED" right="raw@main">
          <ul className="b-feed">{WORKSHOP.slice(1, 5).map(w => <li key={w.id} onClick={() => go('wsdetail')}><span className="dim">+</span> {w.title} <em>by {w.author}</em><span className="grow" /><span className="dim">{lic(w.license)}</span></li>)}</ul>
        </Panel>
      </div>
    </div>
  </div>
}

function NowPlaying({ clock, item, calib }) {
  const [cues, setCues] = useCues(), sec = sectionAt(clock.t), cur = cueAt(CUES, clock.t)
  const idx = cur ? CUES.indexOf(cur) : Math.max(0, CUES.findIndex(c => c.time > clock.t) - 1)
  return <div className="b-page">
    <div className="b-prompt"><span className="b-user">alice@harness</span>:<span className="b-path">~/dsh-mv</span>$ play {item.id}.mv --audio my-own-copy.flac <span className="b-cursor" /></div>
    <div className={`b-now${calib ? ' calib' : ''}`}>
      <Panel label={`STAGE · ${item.title}`} right={<><span className="ok">● audio matched</span> 96×30</>} className="b-stage-panel">
        <Stage scene={item.scene} t={clock.t} palette="B" className="b-stage" />
        <div className="b-transport">
          <button className="b-btn" aria-label="后退" onClick={() => clock.seek(clock.t - 5)}><Icon name="back" size={14} /></button>
          <button className="b-btn accent" onClick={clock.toggle}><Icon name={clock.playing ? 'pause' : 'play'} size={14} stroke={0} className="fill" />{clock.playing ? 'PAUSE' : 'PLAY'}</button>
          <button className="b-btn" aria-label="前进" onClick={() => clock.seek(clock.t + 5)}><Icon name="forward" size={14} /></button>
          <Seek clock={clock} className="b-seek" />
          <button className="b-btn" aria-label="字幕"><Icon name="captions" size={14} /></button><button className="b-btn" aria-label="全屏"><Icon name="maximize" size={14} /></button>
        </div>
        <div className="b-secbar">{SECTIONS.map(s => <button key={s.start} className={s === sec ? 'on' : ''} style={{ flexGrow: s.end - s.start }} onClick={() => clock.seek(s.start + 0.1)}>{s.kind}</button>)}</div>
      </Panel>
      {!calib && <div className="b-col">
        <Panel label="LYRICS.STREAM" right="lyrics.lrc">
          <ol className="b-lyrics">{CUES.slice(Math.max(0, idx - 3), idx + 6).map(c => <li key={c.time} className={c === cur ? 'on' : c.time < clock.t ? 'past' : ''}>
            <time>[{fmt(c.time)}.{String(Math.round((c.time % 1) * 100)).padStart(2, '0')}]</time>
            <span>{c === cur && c.words ? c.words.map((w, k) => <i key={k} className={clock.t >= w.time ? 'sung' : ''}>{w.text} </i>) : c.text}{c === cur && <span className="b-cursor" />}</span></li>)}</ol>
        </Panel>
        <Panel label="SPECTRUM" right="48 bands"><MiniBars t={clock.t} n={32} className="b-spec" /></Panel>
        <Panel label="SOURCES">
          <div className="b-kv wide"><span>audio</span><b>my-own-copy.flac <em className="ok">fp 0.94 ✓</em></b><span>lyrics</span><b>lyrics.lrc · 21 lines</b><span>spectrum</span><b>live analyser</b><span>sync</span><b>+0.00 s</b></div>
        </Panel>
      </div>}
    </div>
    {calib && <Panel label="CALIBRATE · lyrics.lrc" right={<span className="warn">2 lines need review</span>} className="b-cal"><CalibEditor clock={clock} cues={cues} setCues={setCues} labels={{ tap: 'TAP', next: 'NEXT ?', offset: 'offset', save: 'WRITE' }} /></Panel>}
  </div>
}

function Window({ label, onClose, children, className = '' }) {
  return <div className="b-scrim" role="dialog" aria-modal="true" aria-label={label}><div className={`b-window ${className}`}>
    <header><span className="b-dots"><i /><i /><i /></span><span className="b-label">{label}</span><button className="b-btn ghost" aria-label="关闭" onClick={onClose}><Icon name="x" size={14} /></button></header>{children}</div></div>
}

function AiDialog({ go }) {
  return <Window label="ai-make --new starlight-run" onClose={() => go('library')} className="wide">
    <div className="b-ai">
      <div className="b-form">
        <div className="b-file"><Icon name="music" size={16} /><b>starlight-run.flac</b><span className="dim">flac 44.1k 1:58 28.4M</span><button className="b-btn sm">更换</button></div>
        <label className="b-field"><span>title</span><input defaultValue="Starlight Run" /></label>
        <label className="b-field"><span>artist</span><input defaultValue="Alice" /></label>
        <div className="b-field"><span>lyrics</span><div className="b-radio"><button className="on">(•) 自动获取</button><button>( ) 粘贴</button><button>( ) 文件</button></div></div>
        <label className="b-field top"><span>style</span><textarea rows="3" defaultValue="赛博朋克雨夜，副歌满屏代码雨，桥段只留心跳线。" /></label>
        <label className="b-field"><span>out</span><input defaultValue="%LOCALAPPDATA%\dsh-mv\packs\Starlight Run" /></label>
        <p className="dim small"># 音频只在本机分析，不会上传；交给 AI 时使用你的模型额度。</p>
      </div>
      <div className="b-log"><div className="b-log-h">$ dsh-mv make --auto</div><Stepper steps={AI_STEPS} className="b-steps" />
        <div className="b-actions"><button className="b-btn">^C 停止</button><button className="b-btn accent" disabled>RUNNING 62%…</button></div></div>
    </div>
  </Window>
}

function Workshop({ go }) {
  const [q, setQ] = useState(''), [ls, setLs] = useState([]), [inst, setInst] = useState(false)
  const list = WORKSHOP.filter(p => (!q || (p.title + p.artist + p.author + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) && (!ls.length || ls.includes(p.license)) && (!inst || p.installed))
  return <div className="b-page">
    <div className="b-prompt"><span className="b-user">alice@harness</span>:<span className="b-path">~/dsh-mv</span>$ curl -s raw.githubusercontent.com/Alice-Marx/dsh-mv-workshop/main/index.json | mv-ls <span className="b-cursor" /></div>
    <div className="b-ws">
      <Panel label="FILTER" className="b-ws-filter">
        <label className="b-input"><span>grep</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="title / artist / tag" /></label>
        <div className="b-checks"><div className="dim small">license</div>{LICENSES.slice(1).map(l => <label key={l}><input type="checkbox" checked={ls.includes(l)} onChange={() => setLs(v => v.includes(l) ? v.filter(x => x !== l) : [...v, l])} /><span>[{ls.includes(l) ? 'x' : ' '}]</span> {lic(l)}</label>)}
          <div className="dim small">state</div><label><input type="checkbox" checked={inst} onChange={e => setInst(e.target.checked)} /><span>[{inst ? 'x' : ' '}]</span> installed only</label></div>
        <div className="b-trust"><Icon name="shield" size={14} /><span><b>TRUST</b> 社区包经 CI 校验 + sha256 核对；脚本在沙箱中运行：无网络 / 存储 / DOM。不含音频与歌词。</span></div>
        <button className="b-btn accent full"><Icon name="upload" size={14} />发布到工坊</button>
      </Panel>
      <Panel label="WORKSHOP" right={`${list.length}/${WORKSHOP.length} packs · 1 update`}>
        <div className="b-grid">{list.map(p => <button key={p.id} className="b-card" onClick={() => go('wsdetail')}>
          <span className="b-card-art"><Cover item={p} variant="B" />{p.installed && <span className={`b-badge${p.installed !== p.version ? ' upd' : ''}`}>{p.installed !== p.version ? 'UPDATE' : 'INSTALLED'}</span>}</span>
          <b>{p.title}</b><span className="b-meta"><span>{p.artist}</span><span>{fmt(p.dur)}</span></span><span className="b-meta dim"><span>@{p.author}</span><span>{lic(p.license)}</span></span>
        </button>)}</div>
      </Panel>
    </div>
  </div>
}

function WsDetail({ go }) {
  const p = WORKSHOP[0]
  return <Window label={`mv-info ${p.id}`} onClose={() => go('workshop')} className="wide">
    <div className="b-detail">
      <div><Cover item={p} variant="B" className="b-detail-art" /><div className="b-actions col"><button className="b-btn accent lg"><Icon name="refresh" size={14} />UPDATE → {p.version}</button><button className="b-btn"><Icon name="play" size={14} />OPEN</button><button className="b-btn danger"><Icon name="trash" size={14} />UNINSTALL</button><a className="b-btn ghost" href="#"><Icon name="github" size={14} />source</a></div></div>
      <div>
        <h2 className="b-h">{p.title}</h2><p className="dim">{p.artist} · by @{p.author} · v{p.installed} installed, v{p.version} available</p>
        <div className="b-kv wide"><span>license</span><b>{p.license}</b><span>duration</span><b>{fmt(p.dur)} (±2 s match)</b><span>renderer</span><b>{p.renderer} · {p.sections} sections</b><span>fingerprint</span><b className="ok">energy-2hz-v1 ✓</b><span>tags</span><b>{p.tags.map(t => `#${t}`).join(' ')}</b></div>
        <p className="b-desc">&gt; {p.desc}</p>
        <div className="b-trust"><Icon name="shield" size={14} /><span>脚本在沙箱里运行；请用你自己的音频播放，时长或指纹不一致会警告。</span></div>
        <pre className="b-ls">{`$ ls -l packs/${p.id}/\n` + FILES.map(([n, s]) => `-rw-r--r--  ${kb(s).padStart(8)}  ${n.padEnd(20)} sha256:${fakeSha(n).slice(0, 12)}…`).join('\n')}</pre>
      </div>
    </div>
  </Window>
}

export default function DirB({ screen, go, clock, theme, toggleTheme }) {
  const item = LIBRARY[2]
  const body = screen === 'now' ? <NowPlaying clock={clock} item={item} /> : screen === 'calib' ? <NowPlaying clock={clock} item={item} calib />
    : screen === 'workshop' || screen === 'wsdetail' ? <Workshop go={go} /> : <Library go={go} clock={clock} />
  return <Shell screen={screen} go={go} clock={clock} item={item} theme={theme} toggleTheme={toggleTheme}>{body}{screen === 'ai' && <AiDialog go={go} />}{screen === 'wsdetail' && <WsDetail go={go} />}</Shell>
}
