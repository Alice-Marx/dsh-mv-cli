// Production player with real Host pack reads; test controls never ship in npm.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasMv } from '../../.dsh-plugin/client/canvas-mv.jsx'
import css from '../../.dsh-plugin/client/mv.css'
const api = { packRead: value => fetch('/api/read', { method: 'POST', body: JSON.stringify(value) }).then(r => r.json()) }
function Preview() {
  const [pack, setPack] = React.useState(null), [status, setStatus] = React.useState({})
  const ref = React.useRef(null)
  window.qa = {
    select: async name => { const loaded = await fetch(`/api/load/${name}`).then(r => r.json()); setPack({ ...loaded, id: `pack:${loaded.manifestPath}`, loadedAt: Date.now() }) },
    player: () => ref.current,
  }
  React.useEffect(() => { void window.qa.select('original') }, [])
  return <div className="mv-root"><style>{css}</style><h1>Manim 原片播放验证</h1><p>{JSON.stringify(status)}</p>
    {pack && <CanvasMv ref={ref} api={api} pack={pack} onState={setStatus} />}
  </div>
}
createRoot(document.getElementById('root')).render(<Preview />)
