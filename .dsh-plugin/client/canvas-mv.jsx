/**
 * "画布 MV": the terminal MV rendered on a <canvas> in the panel. The user's
 * audio plays in an <audio> element (its currentTime is the master clock),
 * lyrics and the optional spectrum come from the user's own files.
 */
import React from 'react'
import { Film, DURATION, CHAPTERS, clockText } from './mv/film.mjs'
import { GridRenderer } from './mv/renderer.mjs'
import { parseLyrics } from './mv/lyrics.mjs'
import { LiveSpectrum, spectrumFromJson, silentEnergy } from './mv/spectrum.mjs'
import { KNOWN_AUDIO, formatOffset, loadOffsets, saveOffsets, resetOffsets, sha256Hex, roundOffset } from './mv/sync.mjs'
import { openMediaStore, getMedia, putMedia, deleteMedia } from './mv/media-store.mjs'
import { FilmClock, frameTime, keyAction, stepCue, stepOffset } from './mv/player-state.mjs'

const FONT_KEY = 'dsh-mv.canvas.fontSize'
const readFont = fallback => { try { const v = Number(globalThis.localStorage?.getItem(FONT_KEY)); return v >= 8 && v <= 32 ? v : fallback } catch { return fallback } }
const storeFont = v => { try { globalThis.localStorage?.setItem(FONT_KEY, String(v)) } catch { /* ignore */ } }

const HINT = 'SPACE 播放/暂停  ←/→ 5s  [ ] 字幕  Alt+[ ] 音频同步  1-5 章节  F 全屏  H 帮助'

export function CanvasMv({ defaultFontSize = 14 }) {
  const wrap = React.useRef(null)
  const stage = React.useRef(null)
  const canvas = React.useRef(null)
  const audio = React.useRef(null)
  const engine = React.useRef(null) // { film, renderer, clock, live, energy, started, help, sha }
  const [audioInfo, setAudioInfo] = React.useState(null) // { name, sha, known, duration }
  const [lyricsInfo, setLyricsInfo] = React.useState(null) // { name, count }
  const [spectrumInfo, setSpectrumInfo] = React.useState(null) // { name }
  const [offsets, setOffsets] = React.useState({ audioOffset: 0, subtitleOffset: 0 })
  const [fontSize, setFontSize] = React.useState(() => readFont(defaultFontSize))
  const [status, setStatus] = React.useState({ t: 0, playing: false, cols: 0, rows: 0 })
  const [error, setError] = React.useState('')
  const [fullscreen, setFullscreen] = React.useState(false)
  const offsetsRef = React.useRef(offsets)
  offsetsRef.current = offsets
  const dbRef = React.useRef(null)

  // Engine setup and the render loop.
  React.useEffect(() => {
    const live = new LiveSpectrum(audio.current)
    const state = {
      film: new Film({ energy: t => state.energy(t) }),
      renderer: new GridRenderer(canvas.current, { fontSize }),
      clock: new FilmClock({ audio: audio.current }),
      live, energy: silentEnergy, fileEnergy: null, started: false, help: false, sha: '',
    }
    state.energy = () => live.energy()
    engine.current = state
    let raf = 0, lastStatus = 0
    const frame = now => {
      raf = requestAnimationFrame(frame)
      const box = stage.current
      if (!box) return
      const { cols, rows } = state.renderer.fit(box.clientWidth, box.clientHeight)
      const raw = state.clock.time()
      const { t, ready } = frameTime(raw, state.started)
      const playing = state.clock.playing
      const picture = state.film.render(t, cols, rows, {
        paused: !playing, ready, offset: offsetsRef.current.subtitleOffset, hintText: HINT, help: state.help,
      })
      state.renderer.draw(picture)
      if (now - lastStatus > 250) { lastStatus = now; setStatus({ t: raw, playing, cols, rows }) }
    }
    raf = requestAnimationFrame(frame)
    const onFs = () => setFullscreen(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('fullscreenchange', onFs); live.close() }
  }, [])

  React.useEffect(() => { engine.current?.renderer.setFontSize(fontSize); storeFont(fontSize) }, [fontSize])

  const applyOffsets = React.useCallback(next => {
    const value = { audioOffset: roundOffset(next.audioOffset), subtitleOffset: roundOffset(next.subtitleOffset) }
    setOffsets(value)
    if (engine.current) engine.current.clock.audioOffset = value.audioOffset
    if (engine.current?.sha) saveOffsets(engine.current.sha, value)
  }, [])

  const useAudioFile = React.useCallback(async (file, { remember = true } = {}) => {
    setError('')
    const state = engine.current
    try {
      const sha = await sha256Hex(await file.arrayBuffer())
      const old = audio.current.src
      audio.current.src = URL.createObjectURL(file)
      if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
      state.sha = sha
      const loaded = loadOffsets(sha, KNOWN_AUDIO)
      setOffsets({ audioOffset: loaded.audioOffset, subtitleOffset: loaded.subtitleOffset })
      state.clock.audioOffset = loaded.audioOffset
      state.started = false
      setAudioInfo({ name: file.name, sha, known: loaded.known, saved: loaded.saved, duration: null })
      if (remember) await putMedia(dbRef.current, 'audio', { file, name: file.name, sha })
    } catch (failure) {
      setError(`无法读取音频：${failure?.message ?? failure}`)
    }
  }, [])

  const useLyricsText = React.useCallback(async (name, body, { remember = true } = {}) => {
    setError('')
    try {
      const cues = parseLyrics(name, body, { duration: DURATION })
      if (!cues.length) throw new Error('文件里没有带时间的歌词行。')
      engine.current.film.setLyrics(cues)
      setLyricsInfo({ name, count: cues.length })
      if (remember) await putMedia(dbRef.current, 'lyrics', { name, text: body })
    } catch (failure) { setError(`无法解析歌词：${failure?.message ?? failure}`) }
  }, [])

  const useSpectrumText = React.useCallback(async (name, body, { remember = true } = {}) => {
    setError('')
    try {
      const fileEnergy = spectrumFromJson(body)
      engine.current.energy = t => fileEnergy(t)
      setSpectrumInfo({ name })
      if (remember) await putMedia(dbRef.current, 'spectrum', { name, text: body })
    } catch (failure) { setError(`无法读取频谱：${failure?.message ?? failure}`) }
  }, [])

  // Restore the last choices from IndexedDB.
  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      const db = await openMediaStore()
      if (cancelled) return
      dbRef.current = db
      const [a, l, s] = await Promise.all([getMedia(db, 'audio'), getMedia(db, 'lyrics'), getMedia(db, 'spectrum')])
      if (cancelled) return
      if (a?.file) await useAudioFile(a.file, { remember: false })
      if (l?.text) await useLyricsText(l.name, l.text, { remember: false })
      if (s?.text) await useSpectrumText(s.name, s.text, { remember: false })
    })()
    return () => { cancelled = true }
  }, [])

  const clearSpectrum = async () => {
    const state = engine.current
    state.energy = () => state.live.energy()
    setSpectrumInfo(null)
    await deleteMedia(dbRef.current, 'spectrum')
  }
  const clearLyrics = async () => {
    engine.current.film.setLyrics([])
    setLyricsInfo(null)
    await deleteMedia(dbRef.current, 'lyrics')
  }

  const play = async () => {
    const state = engine.current
    try { state.live.ensure() } catch { /* no Web Audio: spectrum stays flat */ }
    if (state.clock.time() >= DURATION - 0.5) state.clock.seek(0)
    state.started = true
    try { await state.clock.play() } catch (failure) { setError(`无法播放：${failure?.message ?? failure}`) }
  }

  const act = action => {
    const state = engine.current
    if (!state || !action) return false
    const t = state.clock.time()
    switch (action.type) {
      case 'toggle': if (!state.started || !state.clock.playing) void play(); else state.clock.pause(); return true
      case 'seekBy': state.clock.seek(Math.max(-60, t + action.delta)); return true
      case 'restart': state.clock.seek(0); void play(); return true
      case 'chapter': state.clock.seek(action.at); void play(); return true
      case 'cue': { const at = stepCue(state.film.times, t, action.direction); if (at !== null) { state.clock.seek(at); state.started = true } return true }
      case 'subtitleOffset': applyOffsets({ ...offsetsRef.current, subtitleOffset: stepOffset(offsetsRef.current.subtitleOffset, action.delta) }); return true
      case 'audioOffset': applyOffsets({ ...offsetsRef.current, audioOffset: stepOffset(offsetsRef.current.audioOffset, action.delta) }); return true
      case 'volume': audio.current.volume = Math.min(1, Math.max(0, Math.round((audio.current.volume + action.delta) * 100) / 100)); return true
      case 'mute': audio.current.muted = !audio.current.muted; return true
      case 'help': state.help = !state.help; return true
      case 'escape': if (state.help) { state.help = false; return true } return false
      case 'fullscreen': toggleFullscreen(); return true
      default: return false
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void wrap.current?.requestFullscreen?.().catch(failure => setError(`无法全屏：${failure?.message ?? failure}`))
  }

  const onKeyDown = event => {
    if (event.target?.tagName === 'INPUT' || event.target?.tagName === 'SELECT') return
    if (act(keyAction(event))) { event.preventDefault(); event.stopPropagation() }
  }

  const pickText = (accept, handler) => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = accept
    input.onchange = async () => { const file = input.files?.[0]; if (file) await handler(file.name, await file.text()) }
    input.click()
  }
  const pickAudio = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'audio/*,video/mp4,.mp3,.m4a,.aac,.mp4,.ogg,.opus,.flac,.wav'
    input.onchange = () => { const file = input.files?.[0]; if (file) void useAudioFile(file) }
    input.click()
  }

  const known = audioInfo?.known
  const chapter = CHAPTERS.reduce((current, item) => (item[0] <= Math.max(0, status.t) ? item : current), CHAPTERS[0])

  return (
    <div className="mv-canvas-tab">
      <div className="mv-toolbar">
        <button type="button" className="mv-button" onClick={pickAudio}>选择音频…</button>
        <button type="button" className="mv-button" onClick={() => pickText('.lrc,.srt,.vtt,.json,.txt', useLyricsText)}>选择歌词（LRC / SRT / lyrics.json）…</button>
        <button type="button" className="mv-button mv-button-secondary" onClick={() => pickText('.json', useSpectrumText)}>频谱 spectrum.json（可选）…</button>
        <label className="mv-inline">字号
          <input type="number" min={8} max={32} value={fontSize} onChange={event => setFontSize(Math.min(32, Math.max(8, Number(event.target.value) || 14)))} />
        </label>
        <button type="button" className="mv-button mv-button-secondary" onClick={toggleFullscreen}>{fullscreen ? '退出全屏' : '全屏 (F)'}</button>
      </div>
      <div className="mv-media-line">
        <span>音频：{audioInfo ? <><b>{audioInfo.name}</b> <code title={audioInfo.sha}>{audioInfo.sha.slice(0, 12)}…</code>{known ? ` · 已识别：${known.label}` : ' · 未识别的版本，请用 Alt+[ / Alt+] 校准'}</> : '未选择（静音模式，画面照常播放）'}</span>
        <span>歌词：{lyricsInfo ? <>{lyricsInfo.name}（{lyricsInfo.count} 句） <button type="button" className="mv-link" onClick={() => void clearLyrics()}>移除</button></> : '未加载（只显示 [ 间奏 ]）'}</span>
        <span>频谱：{spectrumInfo ? <>{spectrumInfo.name} <button type="button" className="mv-link" onClick={() => void clearSpectrum()}>改用实时</button></> : '实时分析（AnalyserNode）'}</span>
      </div>
      {error && <p className="mv-error" role="alert">{error}</p>}
      <div ref={wrap} className={`mv-stage-wrap${fullscreen ? ' mv-fullscreen' : ''}`} tabIndex={0} onKeyDown={onKeyDown}
        onDoubleClick={toggleFullscreen} aria-label="画布 MV（点击后可用键盘控制）">
        <div ref={stage} className="mv-stage" onClick={() => wrap.current?.focus()}><canvas ref={canvas} /></div>
      </div>
      <div className="mv-transport">
        <button type="button" className="mv-button" onClick={() => act({ type: 'toggle' })}>{status.playing ? '暂停' : '播放'}</button>
        <input className="mv-seek" type="range" min={0} max={DURATION} step={0.1} value={Math.max(0, Math.min(DURATION, status.t))}
          onChange={event => { engine.current.clock.seek(Number(event.target.value)); engine.current.started = true }} aria-label="进度" />
        <span className="mv-clock">{clockText(Math.max(0, status.t))}</span>
        <span className="mv-chip">{chapter[1]} {chapter[2]}</span>
      </div>
      <div className="mv-transport">
        <span className="mv-chip">字幕偏移 {formatOffset(offsets.subtitleOffset)}（[ / ]）</span>
        <span className="mv-chip">音频同步 {formatOffset(offsets.audioOffset)}（Alt+[ / Alt+]）</span>
        {audioInfo && <button type="button" className="mv-link" onClick={() => { resetOffsets(audioInfo.sha); const v = loadOffsets(audioInfo.sha, KNOWN_AUDIO); applyOffsets(v); resetOffsets(audioInfo.sha) }}>恢复默认偏移</button>}
        <span className="mv-caption">网格 {status.cols}×{status.rows}（最小 64×24，最大 240×85）· 偏移按音频 sha256 记在本机</span>
      </div>
      <audio ref={audio} preload="auto" onLoadedMetadata={event => setAudioInfo(info => info ? { ...info, duration: event.currentTarget.duration } : info)}
        onEnded={() => { if (engine.current) engine.current.started = true }} />
    </div>
  )
}
