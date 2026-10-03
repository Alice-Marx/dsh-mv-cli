// Redesign mockup entry: ?dir=A|B|C&screen=library|now|ai|calib|workshop|wsdetail&theme=light|dark&t=44&play=1&shot=1
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import baseCss from './base.css'
import aCss from './a.css'
import bCss from './b.css'
import cCss from './c.css'
import DirA from './dir-a.jsx'
import DirB from './dir-b.jsx'
import DirC from './dir-c.jsx'
import { useClock } from './widgets.jsx'

const q = new URLSearchParams(location.search)
const DIRS = { A: [DirA, aCss, 'dark', 'A · 现代音乐应用'], B: [DirB, bCss, 'dark', 'B · 终端 / 黑客'], C: [DirC, cCss, 'light', 'C · Fluent / Harness 原生'] }
const SCREENS = [['library', '曲库'], ['now', '正在播放'], ['ai', 'AI 制作'], ['calib', '校准'], ['workshop', '工坊'], ['wsdetail', '工坊详情']]

function App() {
  const [dir, setDir] = useState(q.get('dir') ?? 'A'), [screen, setScreen] = useState(q.get('screen') ?? 'library')
  const [theme, setTheme] = useState(q.get('theme') ?? DIRS[dir][2])
  const clock = useClock(+(q.get('t') ?? 44.2), q.get('play') === '1', 120)
  const [Dir, css] = DIRS[dir]
  useEffect(() => { document.body.dataset.theme = theme; if (theme === 'dark') document.body.setAttribute('data-ds-dark-theme', ''); else document.body.removeAttribute('data-ds-dark-theme') }, [theme])
  useEffect(() => { const u = new URL(location.href); u.searchParams.set('dir', dir); u.searchParams.set('screen', screen); u.searchParams.set('theme', theme); history.replaceState(null, '', u) }, [dir, screen, theme])
  return <>
    <style>{baseCss + css}</style>
    <Dir screen={screen} go={setScreen} clock={clock} theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
    {!q.get('shot') && <div className="mock-switch" role="toolbar" aria-label="设计方向">
      {Object.entries(DIRS).map(([k, d]) => <button key={k} className={k === dir ? 'on' : ''} onClick={() => { setDir(k); setTheme(d[2]) }} title={d[3]}>{k}</button>)}
      <select value={screen} onChange={e => setScreen(e.target.value)}>{SCREENS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
      <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☾' : '☀'}</button>
    </div>}
  </>
}
createRoot(document.getElementById('root')).render(<App />)
