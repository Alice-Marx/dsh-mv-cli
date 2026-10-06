/**
 * "画布 MV": the terminal MV rendered on a <canvas> in the panel. The user's
 * audio plays in an <audio> element (its currentTime is the master clock),
 * lyrics and the optional spectrum come from the user's own files.
 */
import React from 'react'
import { GridRenderer } from './mv/renderer.mjs'
import { parseLyrics } from './mv/lyrics.mjs'
import { LiveSpectrum, spectrumFromJson, silentEnergy } from './mv/spectrum.mjs'
import { KNOWN_AUDIO, formatOffset, loadOffsets, saveOffsets, resetOffsets, sha256Hex, roundOffset } from './mv/sync.mjs'
import { openMediaStore, getMedia, putMedia, deleteMedia } from './mv/media-store.mjs'
import { DEFAULT_DURATION, FilmClock, frameTime, keyAction, stepCue, stepOffset } from './mv/player-state.mjs'
import { GenericFilm, genericChapters, timeText } from './mv/generic-film.mjs'
import { ScriptFilm, isBitmapSceneOutput } from './mv/script-film.mjs'
import { DshPvFilm, DSHPV_CHAPTERS, DSHPV_DURATION } from './mv/dshpv/film.mjs'
import { hasDshPvAssets, loadDshPv, disposeDshPvData, loadSceneAssets, disposeSceneAssets, packAssetReader } from './mv/dshpv/assets.mjs'
import { loadDshPvFonts } from './mv/dshpv/fonts.mjs'
import { matchBand } from './mv/dshpv/band.mjs'
import { CalibEditor } from './mv-calib.jsx'
import { EMPTY_PACK, fetchPackAudio, fetchPackText } from './mv-pack-state.mjs'
import { readHostAudio } from './mv-wav.mjs'
import { unwrapRemote } from './remote-state.mjs'
import { audioMimeOf, displayCommand, ffmpegArgs, sniffAudio } from '../shared/mv-audio-protocol.mjs'
import { MV_LYRICS_EXTENSIONS } from '../shared/mv-pack.mjs'
import { Alert, Icon, KeyHelp, Popover } from './mv-ui.jsx'
import { checkAudioForPack, fingerprintAudio, legacyPresetSlot, mediaSlot, retimeWithPack, rememberedTrackApplies } from './mv-workshop-state.mjs'

/** Everything the panel's Chromium can decode; the content decides, not the extension. */
export const AUDIO_ACCEPT = 'audio/*,video/*,.mp3,.mp2,.m4a,.m4b,.mp4,.m4v,.mov,.aac,.webm,.mkv,.mka,.ogg,.oga,.opus,.flac,.wav'
export const LYRICS_ACCEPT = MV_LYRICS_EXTENSIONS.join(',')

const FONT_KEY = 'dsh-mv.canvas.fontSize'
const readFont = fallback => { try { const v = Number(globalThis.localStorage?.getItem(FONT_KEY)); return v >= 8 && v <= 32 ? v : fallback } catch { return fallback } }
const storeFont = v => { try { globalThis.localStorage?.setItem(FONT_KEY, String(v)) } catch { /* ignore */ } }

const HINT = 'SPACE 播放/暂停  ←/→ 5s  [ ] 字幕  Alt+[ ] 音频同步  1-5 章节  F 全屏  H 帮助'

const isGeneric = pack => pack?.pack?.canvas?.renderer !== 'dsh-pv'
const isDshPv = pack => pack?.pack?.canvas?.renderer === 'dsh-pv'
const isScript = pack => pack?.pack?.canvas?.renderer === 'script'
/** Chapters for the 1–5 keys and the chip: the pack's sections when it has some, else five even parts. */
const chaptersOf = (pack, duration) => {
  const sections = pack?.pack?.sections ?? []
  return sections.length ? sections.map(s => [s.start, s.label || s.kind, '']) : genericChapters(duration)
}

export const CanvasMv = React.forwardRef(function CanvasMv({ defaultFontSize = 14, pack = EMPTY_PACK, api = null, onState = () => {}, dshpvReader = null }, ref) {
  const wrap = React.useRef(null)
  const stage = React.useRef(null)
  const canvas = React.useRef(null)
  const pixel = React.useRef(null)
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
  const [duration, setDuration] = React.useState(DEFAULT_DURATION)
  const [packStatus, setPackStatus] = React.useState('')
  const [volume, setVolume] = React.useState({ level: 1, muted: false })
  const [sceneNote, setSceneNote] = React.useState('')
  const [decodeFail, setDecodeFail] = React.useState(null) // { path, label, ffmpeg, confirming, busy }
  const [audioFile, setAudioFile] = React.useState(null)
  const [lyricsText, setLyricsText] = React.useState('')
  const cuesRef = React.useRef([])
  const [matchNote, setMatchNote] = React.useState(null) // workshop packs: { level, message }
  const timingRef = React.useRef(null) // workshop packs: lyrics.timing.json
  const fpRef = React.useRef(null) // { sha, duration, fingerprint, base64 } of the current audio
  const [pixelScene, setPixelScene] = React.useState(false) // a pixels / webgl scene script is running

  // Engine setup and the render loop.
  React.useEffect(() => {
    const live = new LiveSpectrum(audio.current)
    const state = {
      generic: new GenericFilm({ energy: t => state.energy(t) }),
      script: new ScriptFilm({
        energy: t => state.energy(t),
        onFail: reason => {
          if (state.film === state.script) state.film = state.generic
          setPixelScene(false)
          setSceneNote(`场景脚本已停用，改用通用画面：${reason}`)
        },
      }),
      dshpv: new DshPvFilm({ energy: t => state.energy(t) }),
      dshpvLoad: null, dshpvData: null, dshpvFonts: null, dshpvOwner: null, disposed: false,
      film: null,
      renderer: new GridRenderer(canvas.current, { fontSize }),
      clock: new FilmClock({ audio: audio.current }),
      live, energy: silentEnergy, fileEnergy: null, started: false, help: false, sha: '',
    }
    state.energy = () => live.energy()
    state.film = state.generic
    engine.current = state
    let raf = 0, lastStatus = 0
    const frame = now => {
      raf = requestAnimationFrame(frame)
      const box = stage.current
      if (!box) return
      const raw = state.clock.time()
      const { t, ready } = frameTime(raw, state.started, state.clock.duration)
      const playing = state.clock.playing
      let cols = 0, rows = 0
      if (state.film === state.script && isBitmapSceneOutput(state.script.output)) {
        // pixel / webgl scene script (0.9.1 / 0.9.2): the worker paints canvas.size, letterboxed here
        const el = pixel.current
        const dpr = Math.min(2, globalThis.devicePixelRatio || 1)
        const w = Math.max(64, Math.round(box.clientWidth * dpr)), h = Math.max(36, Math.round(box.clientHeight * dpr))
        if (el.width !== w || el.height !== h) { el.width = w; el.height = h }
        state.script.draw(el.getContext('2d'), Math.max(0, t), { paused: !playing && state.started, ready, offset: offsetsRef.current.subtitleOffset, subtitles: packRef.current?.pack?.canvas?.subtitles === true })
      } else if (state.film === state.dshpv) {
        // dsh-pv draws pixels (1280x720, letterboxed), not the character grid
        const el = pixel.current
        const dpr = Math.min(2, globalThis.devicePixelRatio || 1)
        const w = Math.max(64, Math.round(box.clientWidth * dpr)), h = Math.max(36, Math.round(box.clientHeight * dpr))
        if (el.width !== w || el.height !== h) { el.width = w; el.height = h }
        state.dshpv.draw(el.getContext('2d'), Math.max(0, t), { paused: !playing && state.started, offset: offsetsRef.current.subtitleOffset })
      } else {
        ({ cols, rows } = state.renderer.fit(box.clientWidth, box.clientHeight))
        const picture = state.film.render(t, cols, rows, {
          paused: !playing, ready, offset: offsetsRef.current.subtitleOffset, hintText: HINT, help: state.help,
        })
        state.renderer.draw(picture)
      }
      if (now - lastStatus > 250) { lastStatus = now; setStatus({ t: raw, playing, cols, rows }) }
    }
    raf = requestAnimationFrame(frame)
    const onFs = () => setFullscreen(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      state.disposed = true; state.dshpvOwner = null
      disposeDshPvData(state.dshpvData); state.dshpvFonts?.dispose()
      state.dshpvData = null; state.dshpvFonts = null
      cancelAnimationFrame(raf); document.removeEventListener('fullscreenchange', onFs); live.close(); state.script.stop()
    }
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
    setDecodeFail(null)
    try {
      const bytes = await file.arrayBuffer()
      const sniff = sniffAudio(new Uint8Array(bytes, 0, Math.min(4096, bytes.byteLength)))
      if (!file.type && sniff.format !== 'unknown') file = new File([bytes], file.name, { type: audioMimeOf(sniff) })
      const sha = await sha256Hex(bytes)
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
      setAudioInfo({ name: file.name, sha, known: loaded.known, saved: loaded.saved, duration: null, label: sniff.label })
      setAudioFile(file)
      const slot = mediaSlot(packRef.current, 'audio')
      if (remember && slot) await putMedia(dbRef.current, slot, { file, name: file.name, sha })
      // Workshop packs: check the user's audio against the duration / fingerprint the pack was made for.
      const ws = packRef.current?.pack?.workshop
      if (ws && !packRef.current?.pack?.audio) {
        setMatchNote({ level: 'info', message: '正在检查你的音频是否与这个工坊包匹配…' })
        void fingerprintAudio(bytes).then(fp => {
          fpRef.current = { sha, ...fp }
          if (engine.current?.sha === sha) setMatchNote(checkAudioForPack(ws, fp))
        }).catch(() => { if (engine.current?.sha === sha) setMatchNote({ level: 'unknown', message: '无法在面板里解码这个音频来检查是否匹配。' }) })
      } else fpRef.current = null
    } catch (failure) {
      setError(`无法读取音频：${failure?.message ?? failure}`)
    }
  }, [])

  const useLyricsText = React.useCallback(async (name, body, { remember = true, shift = 0 } = {}) => {
    setError('')
    try {
      const state = engine.current
      const dshpv = state.film === state.dshpv
      const generic = !dshpv
      const cues = parseLyrics(name, body, { duration: dshpv ? DSHPV_DURATION : 1e9 })
      if (!cues.length) throw new Error('文件里没有带时间的歌词行。')
      if (shift) for (const cue of cues) { cue.time += shift; cue.end += shift; for (const word of cue.words ?? []) word.time += shift }
      if (dshpv) {
        const data = await state.dshpvLoad
        const band = data ? await matchBand(data.band, cues) : { lines: [], matched: 0, total: 0 }
        state.dshpv.setLines(band.lines)
        cuesRef.current = cues
        setLyricsInfo({ name, count: cues.length, note: band.matched ? `逐词时间匹配 ${band.matched}/${band.total} 句` : '未匹配到逐词时间，按行显示' })
      } else {
      let use = cues, note = ''
      if (generic && timingRef.current) {
        // Workshop pack: take line / word times from lyrics.timing.json for lines whose text hash matches.
        const timed = await retimeWithPack(cues, timingRef.current)
        if (timed.matched) use = timed.cues
        note = timed.matched ? `按工坊时间轴对齐 ${timed.matched}/${timed.total} 句` : '没有与工坊时间轴匹配的行，使用歌词文件自己的时间'
      }
      for (const film of [state.generic, state.script]) film.setLyrics(use)
      cuesRef.current = use
      setLyricsInfo({ name, count: use.length, ...(note ? { note } : {}) })
      }
      setLyricsText(body)
      const slot = mediaSlot(packRef.current, 'lyrics')
      if (remember && slot) await putMedia(dbRef.current, slot, { name, text: body, override: true, packVersion: packRef.current?.pack?.workshop?.version ?? '' })
      return true
    } catch (failure) { setError(`无法解析歌词：${failure?.message ?? failure}`); return false }
  }, [])

  const useSpectrumText = React.useCallback(async (name, body, { remember = true, shift = 0 } = {}) => {
    setError('')
    try {
      const fileEnergy = spectrumFromJson(body)
      engine.current.energy = t => fileEnergy(t - shift)
      setSpectrumInfo({ name })
      const slot = mediaSlot(packRef.current, 'spectrum')
      if (remember && slot) await putMedia(dbRef.current, slot, { name, text: body, override: true, packVersion: packRef.current?.pack?.workshop?.version ?? '' })
      return true
    } catch (failure) { setError(`无法读取频谱：${failure?.message ?? failure}`); return false }
  }, [])

  // Switch renderer and media whenever the active MV pack changes. The
  // workshop pack restores the files you chose for it from IndexedDB; a local pack brings its own.
  React.useEffect(() => {
    let cancelled = false
    const state = engine.current
    const dshpvOwner = Symbol('dsh-pv pack load')
    const releaseDshPv = () => {
      disposeDshPvData(state.dshpvData); state.dshpvFonts?.dispose()
      state.dshpvData = null; state.dshpvFonts = null; state.dshpvFor = ''
      state.dshpv.timeline = null; state.dshpv.chat = null; state.dshpv.band = null
      state.dshpv.art = {}; state.dshpv.raster = null; state.dshpv.lastT = undefined
    }
    state.dshpvOwner = dshpvOwner
    releaseDshPv()
    void (async () => {
      dbRef.current ??= await openMediaStore()
      if (cancelled) return
      const db = dbRef.current
      state.clock.pause()
      state.started = false
      state.help = false
      state.generic.setLyrics([]); state.script.setLyrics([]); state.dshpv.setLines([])
      state.script.stop()
      state.energy = () => state.live.energy()
      setLyricsInfo(null); setSpectrumInfo(null); setError(''); setPackStatus(''); setSceneNote(''); setDecodeFail(null); setLyricsText(''); cuesRef.current = []
      setMatchNote(null); timingRef.current = null; fpRef.current = null; setPixelScene(false)
      const generic = isGeneric(pack)
      state.film = generic ? state.generic : state.dshpv
      if (isDshPv(pack) && state.dshpvFor !== `${pack.id}@${pack.loadedAt ?? ''}`) {
        // 0.9.0: the dsh-pv data and art come from the pack (canvas.assets), not from the plugin.
        const read = dshpvReader ?? (hasDshPvAssets(pack) && api?.packRead ? packAssetReader(api, pack.manifestPath, pack.pack) : null)
        state.dshpvFor = `${pack.id}@${pack.loadedAt ?? ''}`
        state.dshpv.status = 'loading'
        state.dshpvLoad = read
          ? (async () => {
            let data = null, fonts = null
            try {
              data = await loadDshPv(read)
              if (cancelled || state.disposed || state.dshpvOwner !== dshpvOwner) {
                disposeDshPvData(data); return null
              }
              fonts = await loadDshPvFonts(read)
              if (cancelled || state.disposed || state.dshpvOwner !== dshpvOwner) {
                disposeDshPvData(data); fonts.dispose(); return null
              }
              state.dshpvData = data; state.dshpvFonts = fonts
              state.dshpv.setData(data)
              if (data.missingArt.length) setSceneNote(`dsh-pv：这个包缺少 ${data.missingArt.length} 张立绘，改用占位剪影。`)
              return data
            } catch (failure) {
              disposeDshPvData(data); fonts?.dispose()
              if (!cancelled && !state.disposed && state.dshpvOwner === dshpvOwner) {
                state.dshpv.status = 'error'; state.dshpvFor = ''; setError(`无法加载 dsh-pv 资源：${failure?.message ?? failure}`)
              }
              return null
            }
          })()
          : Promise.resolve(null)
        if (!read) { state.dshpv.status = 'error'; state.film = state.generic; setSceneNote('这个 MV 包使用 dsh-pv 渲染器，但没有附带它的数据（canvas.assets）。0.9.0 起插件不再内置这些数据：请到「创意工坊」安装「world.execute(me); dsh PV」包。现在改用通用画面。') }
      }
      if (isDshPv(pack)) await state.dshpvLoad
      if (cancelled) return
      if (isDshPv(pack) && state.dshpv.status === 'error') state.film = state.generic
      const dsh = state.film === state.dshpv
      const length = dsh ? (pack.pack.duration ?? DSHPV_DURATION) : (pack.pack.duration ?? 0)
      state.clock.duration = length || DEFAULT_DURATION
      for (const film of [state.generic, state.script]) { film.duration = length; film.setMeta({ title: pack.pack.title, artist: pack.pack.artist ?? '' }) }
      state.script.setStructure({ sections: pack.pack.sections ?? [], bpm: pack.pack.canvas?.bpm ?? 0, beatOffset: pack.pack.canvas?.beatOffset ?? 0 })
      setDuration(state.clock.duration)
      if (pack.pack.canvas?.fontSize) setFontSize(pack.pack.canvas.fontSize)
      if (pack.empty) { clearAudio(); return }
      if (isScript(pack)) {
        if (!pack.files?.scene?.exists || pack.files.scene.tooLarge || !api) setSceneNote(`找不到可用的场景脚本（${pack.pack.canvas.script}），改用通用画面。`)
        else {
          try {
            const { text } = await fetchPackText(api, pack.manifestPath, 'scene', { isCancelled: () => cancelled })
            if (cancelled) return
            // 0.9.1: scene scripts get the pack's canvas.assets in setup(info.assets).
            // 0.9.2: 'webgl' output is also a bitmap mode (ImageBitmap → letterboxed on stage).
            const requested = pack.pack.canvas?.output
            const output = isBitmapSceneOutput(requested) ? requested : 'text'
            const names = Object.keys(pack.pack.canvas?.assets ?? {})
            const { assets, transfer } = names.length ? await loadSceneAssets(packAssetReader(api, pack.manifestPath, pack.pack), pack.pack, { images: isBitmapSceneOutput(output) }) : { assets: {}, transfer: [] }
            if (cancelled) { disposeSceneAssets({ transfer }); return }
            state.film = state.script
            if (isBitmapSceneOutput(output)) setPixelScene(true)
            await state.script.load(text, { output, size: pack.pack.canvas?.size ?? [1280, 720], assets, transfer })
            if (cancelled) { state.script.stop(); return }
          } catch (failure) {
            if (cancelled) return
            if (state.film === state.script) state.film = state.generic
            setPixelScene(false)
            setSceneNote(`场景脚本无法运行，改用通用画面：${failure?.message ?? failure}`)
          }
        }
      }
      if (pack.pack.workshop?.lyricsTiming && pack.files?.timing?.exists && !pack.files.timing.tooLarge && api) {
        try {
          const { text } = await fetchPackText(api, pack.manifestPath, 'timing', { isCancelled: () => cancelled })
          if (cancelled) return
          timingRef.current = JSON.parse(text)
        } catch { timingRef.current = null }
      }
      const bundledLoaded = { lyrics: false, spectrum: false }
      for (const role of ['lyrics', 'spectrum']) {
        if (!pack.pack[role] || !pack.files?.[role]?.exists || pack.files[role].tooLarge || !api) continue
        try {
          const { name, text } = await fetchPackText(api, pack.manifestPath, role, { isCancelled: () => cancelled })
          if (cancelled) return
          if (role === 'lyrics') bundledLoaded.lyrics = await useLyricsText(name, text, { remember: false, shift: pack.pack.lyrics?.offset ?? 0 })
          else bundledLoaded.spectrum = await useSpectrumText(name, text, { remember: false, shift: pack.pack.spectrum?.offset ?? 0 })
        } catch (failure) { if (!cancelled) setError(`无法读取 MV 包的 ${role}：${failure?.message ?? failure}`) }
      }
      clearAudio()
      const audioSlot = mediaSlot(pack, 'audio'), lyricsSlot = mediaSlot(pack, 'lyrics')
      if (audioSlot) {
        // A workshop pack has no audio of its own: bring back the files you chose for it last time.
        // Packs that replaced the 0.8.x built-in presets fall back to the files you picked for those presets.
        const legacy = kind => (legacyPresetSlot(pack) ? getMedia(db, kind) : Promise.resolve(null))
        const [a, l, sp] = await Promise.all([
          getMedia(db, audioSlot).then(v => v ?? legacy('audio')),
          getMedia(db, lyricsSlot).then(v => v ?? legacy('lyrics')),
          getMedia(db, mediaSlot(pack, 'spectrum')).then(v => v ?? legacy('spectrum')),
        ])
        if (cancelled) return
        if (l?.text && rememberedTrackApplies(pack, l, bundledLoaded.lyrics)) await useLyricsText(l.name, l.text, { remember: false })
        if (sp?.text && rememberedTrackApplies(pack, sp, bundledLoaded.spectrum)) await useSpectrumText(sp.name, sp.text, { remember: false })
        if (a?.file) await useAudioFile(a.file, { remember: false })
        if (!a?.file) setMatchNote({ level: 'info', message: bundledLoaded.lyrics ? '包内歌词与译文已自动加载；只需选择你自己的音乐文件，插件会检查歌曲时长是否匹配。' : '这是创意工坊的包，不带音频：请选择你自己的歌曲文件。没有可用的包内歌词轨时，可另选本地歌词。' })
        return
      }
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
    return () => {
      cancelled = true
      if (state.dshpvOwner === dshpvOwner) { state.dshpvOwner = null; releaseDshPv() }
    }
  }, [pack.id, pack.loadedAt])

  const clearAudio = () => {
    const old = audio.current.src
    audio.current.removeAttribute('src'); audio.current.load?.()
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
    engine.current.sha = ''
    setAudioFile(null)
    engine.current.clock.audioOffset = 0
    setAudioInfo(null)
    setOffsets({ audioOffset: 0, subtitleOffset: 0 })
  }

  const clearSpectrum = async () => {
    const state = engine.current
    state.energy = () => state.live.energy()
    setSpectrumInfo(null)
    const slot = mediaSlot(packRef.current, 'spectrum')
    if (slot) await deleteMedia(dbRef.current, slot)
  }
  const clearLyrics = async () => {
    engine.current.film.setLyrics([])
    setLyricsInfo(null)
    const slot = mediaSlot(packRef.current, 'lyrics')
    if (slot) await deleteMedia(dbRef.current, slot)
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
      case 'chapter': {
        const list = state.film === state.dshpv ? DSHPV_CHAPTERS.filter((_, i) => i % 2 === 0) : chaptersOf(packRef.current, state.clock.duration)
        const at = list[Math.min(list.length - 1, action.index)]?.[0]
        if (at !== undefined) { state.clock.seek(at); void play() }
        return true
      }
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
    input.type = 'file'; input.accept = AUDIO_ACCEPT
    input.onchange = () => { const file = input.files?.[0]; if (file) void useAudioFile(file) }
    input.click()
  }

  // <audio> could not decode the file: for pack audio (a path on the Host) offer the user's ffmpeg.
  const onDecodeError = async () => {
    if (!audio.current?.src) return
    const current = packRef.current
    const path = current?.files?.audio?.path ?? ''
    const label = audioInfo?.label ?? '未知格式'
    let ffmpeg = ''
    if (path && api?.ffmpegInfo) { try { const found = unwrapRemote(await api.ffmpegInfo({}), ''); if (found?.available) ffmpeg = found.path } catch { /* no ffmpeg */ } }
    setDecodeFail({ path, label, ffmpeg: path ? ffmpeg : '', confirming: false, busy: '' })
  }
  const convertWithFfmpeg = async () => {
    const failed = decodeFail
    if (!failed?.path) return
    setDecodeFail(value => ({ ...value, busy: '正在用 ffmpeg 转换…' }))
    try {
      const done = unwrapRemote(await api.audioConvert({ path: failed.path, confirmed: true }), 'ffmpeg 转换失败。')
      setDecodeFail(value => ({ ...value, busy: '正在读取转换结果…' }))
      const bytes = await readHostAudio(api, done.path)
      setDecodeFail(null)
      await useAudioFile(new File([bytes], done.path.split(/[\\/]/).pop(), { type: 'audio/wav' }), { remember: false, packOffset: packRef.current?.pack?.audio?.offset ?? 0 })
    } catch (failure) { setDecodeFail(value => value && ({ ...value, busy: '', confirming: false })); setError(`ffmpeg 转换失败：${failure?.message ?? failure}`) }
  }

  const player = React.useMemo(() => ({
    time: () => engine.current?.clock.time() ?? 0,
    seek: t => { const state = engine.current; if (!state) return; state.clock.seek(t); state.started = true },
    play: () => { if (!engine.current?.clock.playing) void play() },
    pause: () => engine.current?.clock.pause(),
    playing: () => Boolean(engine.current?.clock.playing),
  }), [])
  const previewCues = React.useCallback(cues => {
    const state = engine.current
    if (!state) return
    for (const film of [state.generic, state.script]) film.setLyrics(cues ?? cuesRef.current)
  }, [])

  const known = audioInfo?.known
  const generic = isGeneric(pack)
  const dshActive = isDshPv(pack) && Boolean(dshpvReader || hasDshPvAssets(pack))
  const pixelActive = dshActive || pixelScene
  const chapterList = dshActive ? DSHPV_CHAPTERS : chaptersOf(pack, duration)
  const chapter = chapterList.reduce((current, item) => (item[0] <= Math.max(0, status.t) ? item : current), chapterList[0])

  React.useImperativeHandle(ref, () => ({
    toggle: () => act({ type: 'toggle' }), pause: () => engine.current?.clock.pause(), focus: () => wrap.current?.focus(),
    /** Transport for the skins' player bar / status line (polled; no per-frame panel renders). */
    time: () => engine.current?.clock.time() ?? 0,
    duration: () => engine.current?.clock.duration ?? 0,
    playing: () => Boolean(engine.current?.clock.playing),
    seek: t => player.seek(Math.max(0, t)),
    seekBy: delta => act({ type: 'seekBy', delta }),
    fullscreen: () => toggleFullscreen(),
    /** PNG (base64, ≤ 960 px wide) of the current frame, for a workshop cover. */
    snapshotPng: () => {
      const source = engine.current?.film === engine.current?.dshpv || (engine.current?.film === engine.current?.script && isBitmapSceneOutput(engine.current?.script.output)) ? pixel.current : canvas.current
      if (!source?.width) return ''
      const scale = Math.min(1, 960 / source.width)
      const out = document.createElement('canvas')
      out.width = Math.round(source.width * scale); out.height = Math.round(source.height * scale)
      out.getContext('2d').drawImage(source, 0, 0, out.width, out.height)
      return out.toDataURL('image/png').split(',')[1] ?? ''
    },
    /** Duration + energy fingerprint of the loaded audio (for 发布到工坊), or null without audio. */
    audioFingerprint: async () => {
      const sha = engine.current?.sha
      if (!sha || !audioFile) return null
      if (fpRef.current?.sha === sha) return fpRef.current
      const fp = await fingerprintAudio(await audioFile.arrayBuffer())
      fpRef.current = { sha, ...fp }
      return fpRef.current
    },
  }), [audioFile])
  React.useEffect(() => { onState({ playing: status.playing, hasAudio: Boolean(audioInfo) }) }, [status.playing, Boolean(audioInfo)])
  const setLevel = level => { const el = audio.current; el.volume = Math.min(1, Math.max(0, level)); if (el.muted && level > 0) el.muted = false }
  const resetSync = () => { resetOffsets(audioInfo.sha); const v = loadOffsets(audioInfo.sha, KNOWN_AUDIO); applyOffsets(v); resetOffsets(audioInfo.sha) }
  const syncLabel = known ? `已识别：${known.label}` : audioInfo ? '未识别的版本：听着不同步就用 Alt+[ / Alt+] 校准' : ''

  return (
    <div className="mv-canvas-tab">
      {!audioInfo && !packStatus && <div className="mv-onboard">
        <span className="mv-onboard-badge">&gt;_</span>
        <div>
          <h2>{pack.pack.workshop ? '创意工坊的包不带音频：选择你自己的歌曲' : '这个 MV 包没有可用的音频'}</h2>
          <ol>
            <li>选择你自己的音频或视频文件（MP3、M4A/AAC、MP4/MOV/WebM/MKV 视频的音轨、Opus/Ogg、FLAC、WAV 都行，按内容识别，不看扩展名；在本机解码，不上传）。</li>
            <li>可选：选择歌词（LRC / SRT / VTT / JSON / lyrics.js），画面会显示字幕。JS 只读取静态 LYRICS 数据，不执行代码。</li>
            <li>点 <b>▶ 播放</b>。也可以不选音频，直接静音观看画面。</li>
          </ol>
          <div className="mv-row">
            <button type="button" className="mv-button" onClick={pickAudio}>选择音频…</button>
            <button type="button" className="mv-button mv-button-secondary" onClick={() => pickText(LYRICS_ACCEPT, useLyricsText)}>选择歌词…</button>
          </div>
        </div>
      </div>}
      {packStatus && <Alert kind="info"><p>{packStatus}</p></Alert>}
      {matchNote && pack.pack.workshop && <Alert kind={matchNote.level === 'warn' ? 'warn' : matchNote.level === 'ok' ? 'ok' : 'info'} actions={<button type="button" className="mv-link" onClick={() => setMatchNote(null)}>关闭</button>}>
        <p className="mv-wrap" style={{ whiteSpace: 'pre-wrap' }}>{matchNote.level === 'warn' ? '⚠ 音频可能与这个工坊包不匹配：\n' : ''}{matchNote.message}</p>
      </Alert>}
      <div className="mv-sources" aria-label="媒体文件">
        <div className={`mv-source${audioInfo ? '' : ' mv-source-empty'}`}>
          <span className="mv-source-icon" aria-hidden="true">♪</span>
          <div className="mv-source-main">
            <div className="mv-source-label">音频</div>
            <div className="mv-source-value" title={audioInfo ? `${audioInfo.name}\nsha256 ${audioInfo.sha}` : ''}>{audioInfo ? `${audioInfo.name}${audioInfo.label && audioInfo.label !== '未知格式' ? ` · ${audioInfo.label}` : ''}` : '未选择 · 静音模式'}</div>
          </div>
          <button type="button" className="mv-button mv-button-secondary mv-button-small" onClick={pickAudio}>{audioInfo ? '更换' : '选择…'}</button>
        </div>
        <div className={`mv-source${lyricsInfo ? '' : ' mv-source-empty'}`}>
          <span className="mv-source-icon" aria-hidden="true">“</span>
          <div className="mv-source-main">
            <div className="mv-source-label">歌词</div>
            <div className="mv-source-value">{lyricsInfo ? `${lyricsInfo.name}（${lyricsInfo.count} 句${lyricsInfo.note ? ` · ${lyricsInfo.note}` : ''}）` : '未加载 · 只显示 [ 间奏 ]'}</div>
          </div>
          {lyricsInfo && <button type="button" className="mv-link" onClick={() => void clearLyrics()}>移除</button>}
          <button type="button" className="mv-button mv-button-secondary mv-button-small" title="LRC / SRT / VTT / JSON / lyrics.js（只读取静态 LYRICS 数据，不执行代码）" onClick={() => pickText(LYRICS_ACCEPT, useLyricsText)}>{lyricsInfo ? '更换' : '选择…'}</button>
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
      {sceneNote && <Alert kind="warn" actions={<button type="button" className="mv-link" onClick={() => setSceneNote('')}>关闭</button>}><p className="mv-wrap">{sceneNote}</p></Alert>}
      {decodeFail && <Alert kind="warn" actions={decodeFail.ffmpeg && !decodeFail.confirming ? <>
        <button type="button" className="mv-button mv-button-small" disabled={decodeFail.busy} onClick={() => setDecodeFail(value => ({ ...value, confirming: true }))}>用 ffmpeg 转换…</button>
      </> : null}>
        <p className="mv-wrap">面板无法解码这个音频（{decodeFail.label}）。{decodeFail.ffmpeg ? '找到了你本机的 ffmpeg，可以把它转换成 WAV 缓存后播放（原文件不变）。' : '安装 ffmpeg（放进 PATH，或 D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe）后可以自动转换；或者换成 MP3 / M4A / FLAC / WAV。'}</p>
        {decodeFail.confirming && <div className="mv-confirm" role="dialog" aria-label="确认用 ffmpeg 转换">
          <strong>用你本机的 ffmpeg 转换这个文件？</strong>
          <span className="mv-caption">Host 将运行（不经过 shell，最多 10 分钟）：</span>
          <code className="mv-cmd">{displayCommand(decodeFail.ffmpeg, ffmpegArgs(decodeFail.path, '<插件缓存>\\<sha256>.wav'))}</code>
          <div className="mv-row">
            <button type="button" className="mv-button" disabled={decodeFail.busy} onClick={() => void convertWithFfmpeg()}>{decodeFail.busy ? decodeFail.busy : '确认转换'}</button>
            <button type="button" className="mv-button mv-button-secondary" disabled={Boolean(decodeFail.busy)} onClick={() => setDecodeFail(value => ({ ...value, confirming: false }))}>取消</button>
          </div>
        </div>}
      </Alert>}
      <div ref={wrap} className={`mv-stage-wrap${fullscreen ? ' mv-fullscreen' : ''}`} tabIndex={0} onKeyDown={onKeyDown}
        onDoubleClick={toggleFullscreen} aria-label="画布 MV（点击后可用键盘控制）">
        <div ref={stage} className="mv-stage" onClick={() => wrap.current?.focus()}>
          <canvas ref={canvas} style={pixelActive ? { display: 'none' } : undefined} />
          <canvas ref={pixel} className="mv-pixel" style={pixelActive ? undefined : { display: 'none' }} aria-label={dshActive ? 'dsh-pv 画布' : 'MV 画布'} />
        </div>
      </div>
      <div className="mv-playerbar" aria-label="播放控制">
        <button type="button" className="mv-round" aria-label={status.playing ? '暂停' : '播放'} title={status.playing ? '暂停（空格）' : '播放（空格）'} onClick={() => act({ type: 'toggle' })}>
          {status.playing ? <Icon.pause /> : <Icon.play />}
        </button>
        <div className="mv-seek-wrap">
          <span className="mv-time">{timeText(status.t)}</span>
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
      {!pack.empty && api?.packWriteText && <CalibEditor api={api} pack={pack} lyricsText={lyricsText} audioFile={audioFile} duration={duration} player={player} onPreview={previewCues} />}
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
        if (state && (state.film === state.generic || state.film === state.script) && !packRef.current?.pack?.duration && Number.isFinite(length) && length > 0) {
          state.clock.duration = length; state.generic.duration = length; state.script.duration = length; setDuration(length)
        }
      }}
        onError={() => { void onDecodeError() }}
        onVolumeChange={event => setVolume({ level: event.currentTarget.volume, muted: event.currentTarget.muted })}
        onEnded={() => { if (engine.current) engine.current.started = true }} />
    </div>
  )
})
