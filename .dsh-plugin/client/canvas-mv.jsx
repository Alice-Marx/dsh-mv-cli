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
import { GenericFilm, genericChapters, timeText } from './mv/generic-film.mjs'
import { BUILTIN_PACK, fetchPackAudio, fetchPackText } from './mv-pack-state.mjs'
import { Alert, Icon, KeyHelp, Popover } from './mv-ui.jsx'

const FONT_KEY = 'dsh-mv.canvas.fontSize'
const readFont = fallback => { try { const v = Number(globalThis.localStorage?.getItem(FONT_KEY)); return v >= 8 && v <= 32 ? v : fallback } catch { return fallback } }
const storeFont = v => { try { globalThis.localStorage?.setItem(FONT_KEY, String(v)) } catch { /* ignore */ } }

const HINT = 'SPACE 播放/暂停  ←/→ 5s  [ ] 字幕  Alt+[ ] 音频同步  1-5 章节  F 全屏  H 帮助'

const isGeneric = pack => pack?.pack?.canvas?.renderer !== 'world-execute-me'

export const CanvasMv = React.forwardRef(function CanvasMv({ defaultFontSize = 14, pack = BUILTIN_PACK, api = null, onState = () => {} }, ref) {
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
  const packRef = React.useRef(pack)
  packRef.current = pack
  const [duration, setDuration] = React.useState(DURATION)
  const [packStatus, setPackStatus] = React.useState('')
  const [volume, setVolume] = React.useState({ level: 1, muted: false })

  // Engine setup and the render loop.
  React.useEffect(() => {
    const live = new LiveSpectrum(audio.current)
    const state = {
      wem: new Film({ energy: t => state.energy(t) }),
      generic: new GenericFilm({ energy: t => state.energy(t) }),
      film: null,
      renderer: new GridRenderer(canvas.current, { fontSize }),
      clock: new FilmClock({ audio: audio.current }),
      live, energy: silentEnergy, fileEnergy: null, started: false, help: false, sha: '',
    }
    state.energy = () => live.energy()
    state.film = state.wem
    engine.current = state
    let raf = 0, lastStatus = 0
    const frame = now => {
      raf = requestAnimationFrame(frame)
      const box = stage.current
      if (!box) return
      const { cols, rows } = state.renderer.fit(box.clientWidth, box.clientHeight)
      const raw = state.clock.time()
      const { t, ready } = frameTime(raw, state.started, state.clock.duration)
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

  const useAudioFile = React.useCallback(async (file, { remember = true, packOffset = 0 } = {}) => {
    setError('')
    const state = engine.current
    try {
      const sha = await sha256Hex(await file.arrayBuffer())
      const old = audio.current.src
      audio.current.src = URL.createObjectURL(file)
      if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
      state.sha = sha
      const loaded = loadOffsets(sha, KNOWN_AUDIO)
      // A pack's audio.offset applies until you calibrate this file yourself.
      if (!loaded.saved && !loaded.known && packOffset) loaded.audioOffset = packOffset
      setOffsets({ audioOffset: loaded.audioOffset, subtitleOffset: loaded.subtitleOffset })
      state.clock.audioOffset = loaded.audioOffset
      state.started = false
      setAudioInfo({ name: file.name, sha, known: loaded.known, saved: loaded.saved, duration: null })
      if (remember && packRef.current?.builtin) await putMedia(dbRef.current, 'audio', { file, name: file.name, sha })
    } catch (failure) {
      setError(`无法读取音频：${failure?.message ?? failure}`)
    }
  }, [])

  const useLyricsText = React.useCallback(async (name, body, { remember = true, shift = 0 } = {}) => {
    setError('')
    try {
      const generic = engine.current.film === engine.current.generic
      const cues = parseLyrics(name, body, { duration: generic ? 1e9 : DURATION })
      if (!cues.length) throw new Error('文件里没有带时间的歌词行。')
      if (shift) for (const cue of cues) { cue.time += shift; cue.end += shift }
      engine.current.film.setLyrics(cues)
      setLyricsInfo({ name, count: cues.length })
      if (remember && packRef.current?.builtin) await putMedia(dbRef.current, 'lyrics', { name, text: body })
    } catch (failure) { setError(`无法解析歌词：${failure?.message ?? failure}`) }
  }, [])

  const useSpectrumText = React.useCallback(async (name, body, { remember = true } = {}) => {
    setError('')
    try {
      const fileEnergy = spectrumFromJson(body)
      engine.current.energy = t => fileEnergy(t)
      setSpectrumInfo({ name })
      if (remember && packRef.current?.builtin) await putMedia(dbRef.current, 'spectrum', { name, text: body })
    } catch (failure) { setError(`无法读取频谱：${failure?.message ?? failure}`) }
  }, [])

  // Switch renderer and media whenever the active MV pack changes. The
  // built-in preset restores the last files from IndexedDB; a pack brings its own.
  React.useEffect(() => {
    let cancelled = false
    const state = engine.current
    void (async () => {
      dbRef.current ??= await openMediaStore()
      if (cancelled) return
      const db = dbRef.current
      state.clock.pause()
      state.started = false
      state.help = false
      state.wem.setLyrics([]); state.generic.setLyrics([])
      state.energy = () => state.live.energy()
      setLyricsInfo(null); setSpectrumInfo(null); setError(''); setPackStatus('')
      const generic = isGeneric(pack)
      state.film = generic ? state.generic : state.wem
      const length = generic ? (pack.pack.duration ?? 0) : (pack.pack.duration ?? DURATION)
      state.clock.duration = length || DURATION
      state.generic.duration = length
      state.generic.setMeta({ title: pack.pack.title, artist: pack.pack.artist ?? '' })
      state.wem.duration = generic ? DURATION : (pack.pack.duration ?? DURATION)
      setDuration(state.clock.duration)
      if (pack.pack.canvas?.fontSize) setFontSize(pack.pack.canvas.fontSize)
      if (pack.builtin) {
        const [a, l, s] = await Promise.all([getMedia(db, 'audio'), getMedia(db, 'lyrics'), getMedia(db, 'spectrum')])
        if (cancelled) return
        if (a?.file) await useAudioFile(a.file, { remember: false })
        else clearAudio()
        if (l?.text) await useLyricsText(l.name, l.text, { remember: false })
        if (s?.text) await useSpectrumText(s.name, s.text, { remember: false })
        return
      }
      for (const role of ['lyrics', 'spectrum']) {
        if (!pack.pack[role] || !pack.files?.[role]?.exists || pack.files[role].tooLarge || !api) continue
        try {
          const { name, text } = await fetchPackText(api, pack.manifestPath, role, { isCancelled: () => cancelled })
          if (cancelled) return
          if (role === 'lyrics') await useLyricsText(name, text, { remember: false, shift: pack.pack.lyrics?.offset ?? 0 })
          else await useSpectrumText(name, text, { remember: false })
        } catch (failure) { if (!cancelled) setError(`无法读取 MV 包的 ${role}：${failure?.message ?? failure}`) }
      }
      clearAudio()
      if (pack.pack.audio && pack.files?.audio?.exists && !pack.files.audio.tooLarge && api) {
        setPackStatus('正在从 MV 包读取音频…')
        try {
          const file = await fetchPackAudio(api, pack.manifestPath, {
            isCancelled: () => cancelled,
            onProgress: (done, total) => { if (!cancelled) setPackStatus(`正在从 MV 包读取音频… ${Math.round(done / Math.max(1, total) * 100)}%`) },
          })
          if (cancelled) return
          await useAudioFile(file, { remember: false, packOffset: pack.pack.audio.offset ?? 0 })
          setPackStatus('')
        } catch (failure) {
          if (!cancelled) { setPackStatus(''); setError(`无法读取 MV 包的音频：${failure?.message ?? failure}`) }
        }
      }
    })()
    return () => { cancelled = true }
  }, [pack.id, pack.loadedAt])

  const clearAudio = () => {
    const old = audio.current.src
    audio.current.removeAttribute('src'); audio.current.load?.()
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
    engine.current.sha = ''
    engine.current.clock.audioOffset = 0
    setAudioInfo(null)
    setOffsets({ audioOffset: 0, subtitleOffset: 0 })
  }

  const clearSpectrum = async () => {
    const state = engine.current
    state.energy = () => state.live.energy()
    setSpectrumInfo(null)
    if (packRef.current?.builtin) await deleteMedia(dbRef.current, 'spectrum')
  }
  const clearLyrics = async () => {
    engine.current.film.setLyrics([])
    setLyricsInfo(null)
    if (packRef.current?.builtin) await deleteMedia(dbRef.current, 'lyrics')
  }

  const play = async () => {
    const state = engine.current
    try { state.live.ensure() } catch { /* no Web Audio: spectrum stays flat */ }
    if (state.clock.time() >= state.clock.duration - 0.5) state.clock.seek(0)
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
      case 'chapter': state.clock.seek(state.film === state.generic ? genericChapters(state.clock.duration)[action.index][0] : action.at); void play(); return true
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
  const generic = isGeneric(pack)
  const chapterList = generic ? genericChapters(duration) : CHAPTERS
  const chapter = chapterList.reduce((current, item) => (item[0] <= Math.max(0, status.t) ? item : current), chapterList[0])

  React.useImperativeHandle(ref, () => ({ toggle: () => act({ type: 'toggle' }), pause: () => engine.current?.clock.pause(), focus: () => wrap.current?.focus() }))
  React.useEffect(() => { onState({ playing: status.playing, hasAudio: Boolean(audioInfo) }) }, [status.playing, Boolean(audioInfo)])
  const setLevel = level => { const el = audio.current; el.volume = Math.min(1, Math.max(0, level)); if (el.muted && level > 0) el.muted = false }
  const resetSync = () => { resetOffsets(audioInfo.sha); const v = loadOffsets(audioInfo.sha, KNOWN_AUDIO); applyOffsets(v); resetOffsets(audioInfo.sha) }
  const syncLabel = known ? `已识别：${known.label}` : audioInfo ? '未识别的版本：听着不同步就用 Alt+[ / Alt+] 校准' : ''

  return (
    <div className="mv-canvas-tab">
      {!audioInfo && !packStatus && <div className="mv-onboard">
        <span className="mv-onboard-badge">&gt;_</span>
        <div>
          <h2>{pack.builtin ? '第一次使用？先选一首歌' : '这个 MV 包没有可用的音频'}</h2>
          <ol>
            <li>选择你自己的音频文件（mp3 / m4a / aac / mp4 都行，在本机解码，不上传）。</li>
            <li>可选：选择歌词（LRC / SRT / lyrics.json），画面会显示字幕。</li>
            <li>点 <b>▶ 播放</b>。也可以不选音频，直接静音观看画面。</li>
          </ol>
          <div className="mv-row">
            <button type="button" className="mv-button" onClick={pickAudio}>选择音频…</button>
            <button type="button" className="mv-button mv-button-secondary" onClick={() => pickText('.lrc,.srt,.vtt,.json,.txt', useLyricsText)}>选择歌词…</button>
          </div>
        </div>
      </div>}
      {packStatus && <Alert kind="info"><p>{packStatus}</p></Alert>}
      <div className="mv-sources" aria-label="媒体文件">
        <div className={`mv-source${audioInfo ? '' : ' mv-source-empty'}`}>
          <span className="mv-source-icon" aria-hidden="true">♪</span>
          <div className="mv-source-main">
            <div className="mv-source-label">音频</div>
            <div className="mv-source-value" title={audioInfo ? `${audioInfo.name}\nsha256 ${audioInfo.sha}` : ''}>{audioInfo ? audioInfo.name : '未选择 · 静音模式'}</div>
          </div>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={pickAudio}>{audioInfo ? '更换' : '选择…'}</button>
        </div>
        <div className={`mv-source${lyricsInfo ? '' : ' mv-source-empty'}`}>
          <span className="mv-source-icon" aria-hidden="true">“</span>
          <div className="mv-source-main">
            <div className="mv-source-label">歌词</div>
            <div className="mv-source-value">{lyricsInfo ? `${lyricsInfo.name}（${lyricsInfo.count} 句）` : '未加载 · 只显示 [ 间奏 ]'}</div>
          </div>
          {lyricsInfo && <button type="button" className="mv-link" onClick={() => void clearLyrics()}>移除</button>}
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={() => pickText('.lrc,.srt,.vtt,.json,.txt', useLyricsText)}>{lyricsInfo ? '更换' : '选择…'}</button>
        </div>
        <div className="mv-source">
          <span className="mv-source-icon" aria-hidden="true">▮▮</span>
          <div className="mv-source-main">
            <div className="mv-source-label">频谱</div>
            <div className="mv-source-value">{spectrumInfo ? spectrumInfo.name : '实时分析'}</div>
          </div>
          {spectrumInfo && <button type="button" className="mv-link" onClick={() => void clearSpectrum()}>改用实时</button>}
          <button type="button" className="mv-button mv-button-secondary mv-button-small" title="可选：spectrum.json" onClick={() => pickText('.json', useSpectrumText)}>{spectrumInfo ? '更换' : '文件…'}</button>
        </div>
      </div>
      {error && <Alert kind="error" actions={<button type="button" className="mv-link" onClick={() => setError('')}>关闭</button>}><p>{error}</p></Alert>}
      <div ref={wrap} className={`mv-stage-wrap${fullscreen ? ' mv-fullscreen' : ''}`} tabIndex={0} onKeyDown={onKeyDown}
        onDoubleClick={toggleFullscreen} aria-label="画布 MV（点击后可用键盘控制）">
        <div ref={stage} className="mv-stage" onClick={() => wrap.current?.focus()}><canvas ref={canvas} /></div>
      </div>
      <div className="mv-playerbar" aria-label="播放控制">
        <button type="button" className="mv-round" aria-label={status.playing ? '暂停' : '播放'} title={status.playing ? '暂停（空格）' : '播放（空格）'} onClick={() => act({ type: 'toggle' })}>
          {status.playing ? <Icon.pause /> : <Icon.play />}
        </button>
        <div className="mv-seek-wrap">
          <span className="mv-time">{generic ? timeText(status.t) : clockText(Math.max(0, status.t)).split('/')[0].trim()}</span>
          <input className="mv-seek" type="range" min={0} max={Math.max(1, duration)} step={0.1} value={Math.max(0, Math.min(duration, status.t))}
            onChange={event => { engine.current.clock.seek(Number(event.target.value)); engine.current.started = true }} aria-label="进度" />
          <span className="mv-time">{timeText(Math.round(duration))}</span>
        </div>
        <span className="mv-chip" title="当前章节（1–5 跳转）">{chapter[1]} {chapter[2]}</span>
        <span className="mv-volume">
          <button type="button" className="mv-icon-button" aria-label={volume.muted ? '取消静音' : '静音'} title="静音（M）" onClick={() => act({ type: 'mute' })}>{volume.muted || volume.level === 0 ? <Icon.mute /> : <Icon.volume />}</button>
          <input type="range" min={0} max={1} step={0.05} value={volume.muted ? 0 : volume.level} aria-label="音量" onChange={event => setLevel(Number(event.target.value))} />
        </span>
        <span className="mv-stepper" title={`音频同步（Alt+[ / Alt+]）${syncLabel ? `\n${syncLabel}` : ''}`}>
          <button type="button" aria-label="音频同步 −0.1 秒" onClick={() => act({ type: 'audioOffset', delta: -0.1 })}>−</button>
          <span>同步 {formatOffset(offsets.audioOffset)}</span>
          <button type="button" aria-label="音频同步 +0.1 秒" onClick={() => act({ type: 'audioOffset', delta: 0.1 })}>+</button>
        </span>
        <Popover label="键盘快捷键" icon={<Icon.keyboard />}><KeyHelp /></Popover>
        <button type="button" className="mv-icon-button" aria-label={fullscreen ? '退出全屏' : '全屏'} title="全屏（F）" onClick={toggleFullscreen}><Icon.fullscreen /></button>
      </div>
      <details className="mv-details">
        <summary>设置 <span className="mv-caption">字号 {fontSize} · 字幕偏移 {formatOffset(offsets.subtitleOffset)}{syncLabel ? ` · ${syncLabel}` : ''}</span></summary>
        <div className="mv-details-body">
          <div className="mv-form">
            <label className="mv-field"><span>画面字号（像素）</span>
              <input type="number" min={8} max={32} value={fontSize} onChange={event => setFontSize(Math.min(32, Math.max(8, Number(event.target.value) || 14)))} /></label>
            <div className="mv-field"><span>字幕偏移（[ / ]）</span>
              <span className="mv-stepper" style={{ alignSelf: 'flex-start' }}>
                <button type="button" aria-label="字幕偏移 −0.1 秒" onClick={() => act({ type: 'subtitleOffset', delta: -0.1 })}>−</button>
                <span>{formatOffset(offsets.subtitleOffset)}</span>
                <button type="button" aria-label="字幕偏移 +0.1 秒" onClick={() => act({ type: 'subtitleOffset', delta: 0.1 })}>+</button>
              </span></div>
            <div className="mv-field"><span>偏移</span>
              <button type="button" className="mv-button mv-button-secondary" disabled={!audioInfo} onClick={resetSync} style={{ alignSelf: 'flex-start' }}>恢复默认偏移</button></div>
          </div>
          <p className="mv-caption">偏移按音频文件的 sha256 记在本机。{audioInfo && <>当前音频 <code title={audioInfo.sha}>{audioInfo.sha.slice(0, 12)}…</code>。</>}网格 {status.cols}×{status.rows}（最小 64×24，最大 240×85）。</p>
        </div>
      </details>
      <audio ref={audio} preload="auto" onLoadedMetadata={event => {
        const length = event.currentTarget.duration
        setAudioInfo(info => info ? { ...info, duration: length } : info)
        const state = engine.current
        if (state && state.film === state.generic && !packRef.current?.pack?.duration && Number.isFinite(length) && length > 0) {
          state.clock.duration = length; state.generic.duration = length; setDuration(length)
        }
      }}
        onVolumeChange={event => setVolume({ level: event.currentTarget.volume, muted: event.currentTarget.muted })}
        onEnded={() => { if (engine.current) engine.current.started = true }} />
    </div>
  )
})
