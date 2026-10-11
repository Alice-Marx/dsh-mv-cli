import test from 'node:test'
import assert from 'node:assert/strict'
import { VideoFilm, VideoSoundtrack, videoMime } from '../.dsh-plugin/client/mv/video-film.mjs'
import { FilmClock } from '../.dsh-plugin/client/mv/player-state.mjs'
import { fetchPackVideo } from '../.dsh-plugin/client/mv-pack-state.mjs'
import { mediaSlot } from '../.dsh-plugin/client/mv-workshop-state.mjs'
import { MV_PACK_LIMITS } from '../.dsh-plugin/shared/mv-pack.mjs'

class FakeMedia extends EventTarget {
  constructor({ src = 'blob:media', duration = 120, width = 1920, height = 1080, deferred = false } = {}) {
    super()
    Object.assign(this, { src, duration, videoWidth: width, videoHeight: height, deferred, paused: true, readyState: 4, seeking: false, playbackRate: 1, plays: 0, pauses: 0, loads: 0 })
    this.time = 0; this.seeks = []; this.requests = []; this.listeners = new Map()
  }
  get currentSrc() { return this.src }
  get currentTime() { return this.time }
  set currentTime(value) { this.time = value; this.seeks.push(value) }
  play() {
    this.plays++
    if (!this.deferred) { this.paused = false; return Promise.resolve() }
    return new Promise((resolve, reject) => this.requests.push({ resolve: () => { this.paused = false; resolve() }, reject }))
  }
  pause() { this.pauses++; this.paused = true }
  load() { this.loads++ }
  removeAttribute(name) { if (name === 'src') this.src = '' }
  addEventListener(type, listener, options) {
    const list = this.listeners.get(type) ?? new Set(); list.add(listener); this.listeners.set(type, list)
    super.addEventListener(type, listener, options)
  }
  removeEventListener(type, listener, options) { this.listeners.get(type)?.delete(listener); super.removeEventListener(type, listener, options) }
  emit(type) { this.dispatchEvent(new Event(type)) }
  listenerCount() { return [...this.listeners.values()].reduce((total, list) => total + list.size, 0) }
}

const fakeUrls = () => {
  const created = [], revoked = []
  return { created, revoked, createObjectURL: file => { const href = `blob:test-${created.length + 1}`; created.push({ file, href }); return href }, revokeObjectURL: href => revoked.push(href) }
}
const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`)
const remote = value => ({ ok: true, value: { ok: true, value } })
const mp4 = () => { const bytes = Buffer.alloc(MV_PACK_LIMITS.readChunkBytes + 20, 7); bytes.write('ftyp', 4); bytes.write('isom', 8); return bytes }
const packApi = (bytes, calls) => ({
  packRead: async request => {
    calls.push(request)
    const part = bytes.subarray(request.offset, request.offset + request.length)
    return remote({ name: 'movie.mp4', size: bytes.length, offset: request.offset, bytes: part.length, done: request.offset + part.length >= bytes.length, base64: part.toString('base64') })
  },
})

test('video download uses content identity when MP4 track headers are outside the first chunk', async () => {
  const bytes = mp4(), calls = [], progress = []
  const file = await fetchPackVideo(packApi(bytes, calls), '/local/mv.json', { onProgress: (done, total) => progress.push([done, total]) })
  assert.equal(file.name, 'movie.mp4')
  assert.equal(file.type, 'video/mp4', 'an isom container without a vide header still reaches the video decoder')
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), bytes)
  assert.deepEqual(calls.map(call => [call.role, call.offset, call.length]), [['video', 0, MV_PACK_LIMITS.readChunkBytes], ['video', MV_PACK_LIMITS.readChunkBytes, MV_PACK_LIMITS.readChunkBytes]])
  assert.deepEqual(progress.at(-1), [bytes.length, bytes.length])
  assert.equal(videoMime({ format: 'webm', kind: 'audio' }), 'video/webm')
  assert.equal(videoMime({ format: 'mkv' }), 'video/x-matroska')
})

test('video download stops on cancellation and never treats arbitrary bytes as a movie', async () => {
  let cancelled = false
  const calls = []
  await assert.rejects(fetchPackVideo(packApi(mp4(), calls), '/local/mv.json', {
    isCancelled: () => cancelled, onProgress: () => { cancelled = true },
  }), /cancelled/)
  assert.equal(calls.length, 1)
  let constructed = false
  class NeverFile { constructor() { constructed = true } }
  await assert.rejects(fetchPackVideo(packApi(Buffer.from('not a media container'), []), '/local/mv.json', { FileClass: NeverFile }), /视频容器不受支持/)
  assert.equal(constructed, false)
  const never = []
  await assert.rejects(fetchPackVideo(packApi(mp4(), never), '/local/mv.json', { isCancelled: () => true }), /cancelled/)
  assert.equal(never.length, 0)
})

test('local silent-video media choices are isolated by manifest path and declared soundtracks take precedence', () => {
  const local = path => ({ manifestPath: path, pack: { canvas: { renderer: 'video' }, video: { file: 'movie.mp4' } } })
  const first = local('/mv/one/mv.json'), second = local('/mv/two/mv.json')
  assert.ok(mediaSlot(first, 'audio'))
  assert.notEqual(mediaSlot(first, 'audio'), mediaSlot(second, 'audio'))
  assert.notEqual(mediaSlot(first, 'audio'), mediaSlot(first, 'lyrics'))
  first.pack.workshop = { id: 'same-attribution' }; second.pack.workshop = { id: 'same-attribution' }
  assert.notEqual(mediaSlot(first, 'audio'), mediaSlot(second, 'audio'), 'attribution IDs do not merge local media')
  first.pack.audio = { file: 'song.mp3' }
  assert.equal(mediaSlot(first, 'audio'), null)
  assert.equal(mediaSlot({ pack: { canvas: { renderer: 'generic' } } }, 'audio'), null)
  assert.equal(mediaSlot({ pack: { workshop: { id: 'workshop-pack' } } }, 'audio'), 'workshop:workshop-pack:audio')
})

test('video stays the master clock while an external soundtrack uses its own 5.16-second offset', async () => {
  const video = new FakeMedia({ duration: 212 }), audio = new FakeMedia({ duration: 212 })
  const clock = new FilmClock({ audio: video, audioOffset: 0.4, duration: 212.4 })
  const soundtrack = new VideoSoundtrack(video, audio); soundtrack.offset = 5.16
  clock.seek(50)
  closeTo(video.currentTime, 49.6)
  await clock.play(); await soundtrack.update(clock.time(), clock.playing)
  closeTo(audio.currentTime, 44.84)
  audio.currentTime = 90
  closeTo(clock.time(), 50, 'audio cannot move the video clock')
  clock.pause(); soundtrack.pause(); clock.seek(30)
  await soundtrack.update(clock.time(), clock.playing)
  closeTo(video.currentTime, 29.6); closeTo(audio.currentTime, 24.84)
  assert.equal(audio.paused, true)
  assert.equal(video.paused, true)
})

test('soundtrack waits for its offset and stops at its own end without stopping the longer video', async () => {
  const video = new FakeMedia({ duration: 212 }), audio = new FakeMedia({ duration: 100 })
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio); soundtrack.offset = 5.16
  await soundtrack.update(0, true); await soundtrack.update(5, true)
  assert.equal(audio.plays, 0)
  assert.equal(audio.seeks.length, 0, 'no negative currentTime is assigned')
  await soundtrack.update(5.16, true)
  assert.equal(audio.plays, 1); assert.equal(audio.currentTime, 0)
  await soundtrack.update(105.16, true)
  assert.equal(audio.paused, true)
  assert.equal(video.paused, false)
  assert.equal(audio.plays, 1)
  await soundtrack.update(30, true)
  assert.equal(audio.paused, false); closeTo(audio.currentTime, 24.84)
})

test('soundtrack tolerates ordinary jitter and corrects larger drift only when needed', async () => {
  const video = new FakeMedia(), audio = new FakeMedia()
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio)
  audio.time = 10.1
  await soundtrack.update(10, true)
  assert.deepEqual(audio.seeks, [])
  assert.equal(audio.plays, 1)
  audio.time = 10.5
  await soundtrack.update(10, true)
  assert.deepEqual(audio.seeks, [10])
  video.playbackRate = 1.25
  await soundtrack.update(10.05, true)
  assert.equal(audio.playbackRate, 1.25)
  assert.deepEqual(audio.seeks, [10], 'close frames do not repeatedly seek')
  assert.equal(audio.plays, 1)
})

test('video buffering and seeking pause the soundtrack, then resume at the current movie position', async () => {
  const video = new FakeMedia(), audio = new FakeMedia()
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio)
  await soundtrack.update(10, true)
  video.readyState = 2
  await soundtrack.update(10.1, true)
  assert.equal(audio.paused, true)
  const pauses = audio.pauses
  await soundtrack.update(10.2, true)
  assert.equal(audio.pauses, pauses, 'unchanged buffer stalls do not restart pause work every frame')
  video.readyState = 4; video.seeking = true
  await soundtrack.update(60, true)
  assert.equal(audio.paused, true)
  video.seeking = false
  await soundtrack.update(60, true)
  assert.equal(audio.paused, false); assert.equal(audio.currentTime, 60)
})

test('an absent external soundtrack leaves embedded video playback untouched', async () => {
  const video = new FakeMedia(), audio = new FakeMedia({ src: '' })
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio)
  assert.equal(soundtrack.enabled, false)
  await soundtrack.update(40, true)
  assert.equal(video.paused, false)
  assert.equal(audio.plays, 0); assert.equal(audio.pauses, 0); assert.deepEqual(audio.seeks, [])
})

test('old play A resolving after resumed play B never pauses the newer intended soundtrack', async () => {
  const video = new FakeMedia(), audio = new FakeMedia({ deferred: true })
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio)
  const old = soundtrack.update(10, true)
  soundtrack.pause()
  const resumed = soundtrack.update(20, true)
  assert.equal(audio.requests.length, 2)
  audio.requests[1].resolve(); await resumed
  audio.requests[0].resolve(); await old
  assert.equal(audio.paused, false)
  assert.equal(audio.currentTime, 20)
  assert.equal(soundtrack.pending, null)
})

test('late deferred plays cannot revive paused, reset or buffering soundtracks', async () => {
  for (const action of ['pause', 'reset', 'buffer']) {
    const video = new FakeMedia(), audio = new FakeMedia({ deferred: true })
    video.paused = false
    const soundtrack = new VideoSoundtrack(video, audio)
    const playing = soundtrack.update(10, true)
    if (action === 'pause') soundtrack.pause()
    if (action === 'reset') soundtrack.reset()
    if (action === 'buffer') { video.readyState = 2; await soundtrack.update(10, true) }
    audio.requests[0].resolve(); await playing
    assert.equal(audio.paused, true, action)
  }
})

test('pending playback is shared between frames and current failures stop both media once', async () => {
  const video = new FakeMedia(), audio = new FakeMedia({ deferred: true }), failures = []
  video.paused = false
  const soundtrack = new VideoSoundtrack(video, audio, { onError: error => failures.push(error.message) })
  const pending = soundtrack.update(10, true)
  await soundtrack.update(10.02, true)
  assert.equal(audio.plays, 1)
  audio.requests[0].reject(new Error('autoplay denied')); await pending
  assert.equal(audio.paused, true); assert.equal(video.paused, true)
  assert.deepEqual(failures, ['autoplay denied'])
  await soundtrack.update(11, true)
  assert.equal(audio.plays, 1)
  soundtrack.reset(); video.paused = false
  const retried = soundtrack.update(0, true)
  audio.requests[1].resolve(); await retried
  assert.equal(audio.paused, false)
})

test('stale playback rejections after pause or source replacement do not stop the current movie', async () => {
  for (const changed of ['pause', 'source']) {
    const video = new FakeMedia(), audio = new FakeMedia({ deferred: true }), failures = []
    video.paused = false
    const soundtrack = new VideoSoundtrack(video, audio, { onError: error => failures.push(error) })
    const old = soundtrack.update(10, true)
    if (changed === 'pause') soundtrack.pause()
    else { audio.src = 'blob:new-song'; soundtrack.reset() }
    audio.requests[0].reject(new Error('old decoder failed')); await old
    assert.deepEqual(failures, [])
    assert.equal(video.paused, false)
    assert.equal(soundtrack.failed, false)
  }
})

test('video end and restart reuse the same clock and soundtrack transport', async () => {
  const video = new FakeMedia({ duration: 30 }), audio = new FakeMedia({ duration: 30 })
  const clock = new FilmClock({ audio: video, duration: 30 }), soundtrack = new VideoSoundtrack(video, audio)
  await clock.play(); await soundtrack.update(29, true)
  video.time = 30; video.paused = true
  await soundtrack.update(clock.time(), clock.playing)
  assert.equal(audio.paused, true)
  clock.pause(); soundtrack.pause(); clock.seek(clock.minimumTime)
  await clock.play(); await soundtrack.update(clock.time(), clock.playing)
  assert.equal(clock.time(), 0)
  assert.equal(video.paused, false); assert.equal(audio.paused, false)
  assert.equal(audio.currentTime, 0)
})

test('cancelled deferred video play leaves the master transport inactive for soundtrack updates', async () => {
  const video = new FakeMedia({ deferred: true }), audio = new FakeMedia()
  const clock = new FilmClock({ audio: video }), soundtrack = new VideoSoundtrack(video, audio)
  const starting = clock.play()
  clock.pause(); soundtrack.pause()
  video.requests[0].resolve()
  assert.equal(await starting, false)
  assert.equal(clock.playing, false)
  assert.equal(video.paused, true)
  await soundtrack.update(clock.time(), clock.playing)
  assert.equal(audio.paused, true)
  assert.equal(audio.plays, 0)
})

test('a pending primary video play cannot start external audio before the video actually plays', async () => {
  const video = new FakeMedia({ deferred: true }), audio = new FakeMedia()
  const clock = new FilmClock({ audio: video }), soundtrack = new VideoSoundtrack(video, audio)
  const starting = clock.play()
  assert.equal(clock.playing, true, 'the transport exposes its pending play request')
  assert.equal(video.paused, true, 'the media decoder has not begun playback')
  await soundtrack.update(clock.time(), clock.playing)
  assert.equal(audio.plays, 0)
  assert.equal(audio.paused, true)
  video.requests[0].resolve()
  assert.equal(await starting, true)
  assert.equal(video.paused, false)
  await soundtrack.update(clock.time(), clock.playing)
  assert.equal(audio.plays, 1)
  assert.equal(audio.paused, false)
})

test('video decoding succeeds with a local URL and release clears media and listeners', async () => {
  const video = new FakeMedia(), urls = fakeUrls(), file = new Blob(['movie'])
  const film = new VideoFilm(video)
  const loaded = film.load(file, { url: urls })
  assert.equal(video.src, 'blob:test-1')
  assert.equal(film.ready, false)
  video.emit('loadeddata'); await loaded
  assert.equal(film.ready, true)
  assert.equal(video.listenerCount(), 0)
  film.release(urls)
  assert.equal(video.src, ''); assert.equal(video.paused, true); assert.equal(film.ready, false)
  assert.deepEqual(urls.revoked, ['blob:test-1'])
})

test('video abort, decoder failure, missing video track and deadline all release allocated URLs', async () => {
  for (const failure of ['abort', 'decode', 'no-video', 'deadline']) {
    const video = new FakeMedia(), urls = fakeUrls(), abort = new AbortController(), film = new VideoFilm(video)
    const loaded = film.load(new Blob(['movie']), { url: urls, signal: abort.signal, timeoutMs: failure === 'deadline' ? 1 : 1000 })
    const rejected = assert.rejects(loaded, failure === 'abort' ? /cancelled/ : failure === 'decode' ? /无法解码/ : failure === 'no-video' ? /没有可播放/ : /超过/)
    if (failure === 'abort') abort.abort()
    if (failure === 'decode') video.emit('error')
    if (failure === 'no-video') { video.videoWidth = 0; video.emit('loadeddata') }
    await rejected
    assert.equal(film.ready, false, failure)
    assert.equal(video.src, '', failure)
    assert.equal(video.listenerCount(), 0, failure)
    assert.deepEqual(urls.revoked, ['blob:test-1'], failure)
  }
  const abort = new AbortController(); abort.abort()
  const urls = fakeUrls(), video = new FakeMedia(), film = new VideoFilm(video)
  await assert.rejects(film.load(new Blob(['movie']), { signal: abort.signal, url: urls }), /cancelled/)
  assert.deepEqual(urls.created, [], 'pre-cancelled loads allocate no URL')
})

test('aborting an older video load cannot clear a replacement movie URL', async () => {
  const video = new FakeMedia(), urls = fakeUrls(), older = new AbortController(), film = new VideoFilm(video)
  const oldLoad = film.load(new Blob(['old']), { signal: older.signal, url: urls })
  const oldRejected = assert.rejects(oldLoad, /cancelled/)
  const newLoad = film.load(new Blob(['new']), { url: urls })
  older.abort(); await oldRejected
  assert.equal(video.src, 'blob:test-2')
  video.emit('loadeddata'); await newLoad
  assert.equal(film.ready, true)
  assert.deepEqual(urls.revoked, ['blob:test-1'])
  film.release(urls)
  assert.deepEqual(urls.revoked, ['blob:test-1', 'blob:test-2'])
})

const recordingContext = (width, height) => {
  const calls = []
  const context = { canvas: { width, height }, calls, measureText: text => ({ width: text.length * 10 }) }
  for (const method of ['fillRect', 'drawImage', 'save', 'restore', 'beginPath', 'rect', 'clip', 'strokeText', 'fillText']) context[method] = (...args) => calls.push([method, ...args])
  return context
}

test('video frames letterbox to the source aspect and overlay bilingual cues only when enabled', () => {
  const video = new FakeMedia(), film = new VideoFilm(video, { lyrics: [{ time: 10, end: 12, en: 'Hello', zh: '你好' }] })
  film.ready = true
  const square = recordingContext(1000, 1000)
  film.draw(square, 10.5)
  assert.deepEqual(square.calls.find(call => call[0] === 'drawImage').slice(2), [0, 219, 1000, 563])
  assert.equal(square.calls.some(call => call[0] === 'fillText'), false)
  const overlay = recordingContext(1000, 1000)
  film.draw(overlay, 10.5, { subtitles: true })
  assert.deepEqual(overlay.calls.filter(call => call[0] === 'fillText').map(call => call[1]), ['Hello', '你好'])
  assert.deepEqual(overlay.calls.find(call => call[0] === 'rect').slice(1), [0, 219, 1000, 563], 'subtitles are clipped to the picture, not the letterbox')
  const shifted = recordingContext(1000, 1000)
  film.draw(shifted, 12.5, { subtitles: true, offset: 2 })
  assert.equal(shifted.calls.filter(call => call[0] === 'fillText').length, 2)
  const unavailable = recordingContext(1000, 1000)
  video.readyState = 1
  film.draw(unavailable, 10.5, { subtitles: true })
  assert.deepEqual(unavailable.calls.map(call => call[0]), ['fillRect'])
})
