import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FilmClock, SilentClock, frameTime, preparationText, prerollCountdown } from '../.dsh-plugin/client/mv/player-state.mjs'
import { ScenePlayGate } from '../.dsh-plugin/client/mv/scene-play-gate.mjs'

const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve() }
function harness({ preroll = 5, offset = 0, deferred = false, withAudio = true } = {}) {
  let now = 0, calls = 0, pauses = 0
  const requests = []
  const audio = { src: 'blob:test', currentTime: 0, paused: true, duration: 212,
    play() {
      calls++
      if (!deferred) { this.paused = false; return Promise.resolve() }
      return new Promise((resolve, reject) => requests.push({ resolve: () => { this.paused = false; resolve() }, reject }))
    },
    pause() { pauses++; this.paused = true },
  }
  const clock = new FilmClock({ audio: withAudio ? audio : null, silent: new SilentClock(() => now), duration: 212, audioOffset: offset, preroll })
  return { clock, audio, requests, advance: ms => { now += ms }, calls: () => calls, pauses: () => pauses }
}

test('preroll is opt-in; legacy audio mapping, negative slate and seek remain unchanged', async () => {
  const h = harness({ preroll: 0, offset: -4.83 })
  assert.equal(h.clock.minimumTime, 0)
  assert.equal(h.clock.time(), -4.83)
  h.clock.seek(100)
  assert.equal(h.audio.currentTime, 104.83)
  assert.deepEqual(frameTime(-3, true), { t: 0, ready: true })
  await h.clock.play()
  assert.equal(h.calls(), 1)
  assert.equal(h.clock.playing, true)
})

test('countdown is silent, then starts audio at its existing zero without shifting the scene axis', async () => {
  const h = harness()
  assert.equal(h.clock.time(), -5)
  assert.equal(h.clock.playing, false)
  await h.clock.play()
  h.advance(3500); h.clock.tick()
  assert.equal(h.clock.time(), -1.5)
  assert.equal(h.calls(), 0)
  assert.equal(h.audio.currentTime, 0)
  assert.equal(h.audio.paused, true)
  h.advance(1500); h.clock.tick(); await flush()
  assert.equal(h.calls(), 1)
  assert.equal(h.clock.time(), 0)
  h.audio.currentTime = 2
  assert.equal(h.clock.time(), 2)
  h.clock.tick(); h.clock.tick()
  assert.equal(h.calls(), 1)
})

test('preroll pause/resume freezes negative time and cannot start audio while paused', async () => {
  const h = harness()
  await h.clock.play(); h.advance(2000); h.clock.pause()
  assert.equal(h.clock.time(), -3)
  h.advance(10000); h.clock.tick()
  assert.equal(h.clock.time(), -3)
  assert.equal(h.calls(), 0)
  await h.clock.play(); h.advance(3000); h.clock.tick(); await flush()
  assert.equal(h.clock.time(), 0)
  assert.equal(h.calls(), 1)
})

test('late RAF handoff never skips the start of audio; explicit sync offsets remain independent', async () => {
  const h = harness({ offset: 0.25 })
  await h.clock.play(); h.advance(9000); h.clock.tick(); await flush()
  assert.equal(h.audio.currentTime, 0)
  assert.equal(h.clock.time(), 0.25)
  assert.equal(h.calls(), 1)
})

test('silent viewing uses the same negative intro, then resumes a monotonic song clock', async () => {
  const h = harness({ withAudio: false })
  await h.clock.play(); h.advance(5000); h.clock.tick()
  assert.equal(h.clock.time(), 0)
  assert.equal(h.clock.playing, true)
  h.advance(1250)
  assert.equal(h.clock.time(), 1.25)
  h.clock.pause(); h.advance(5000)
  assert.equal(h.clock.time(), 1.25)
})

test('negative seeks clamp to declared preroll; paused positive seek never auto-plays', async () => {
  const h = harness()
  h.clock.seek(-100)
  assert.equal(h.clock.time(), -5)
  h.clock.seek(-2)
  assert.equal(h.clock.time(), -2)
  h.clock.seek(12)
  assert.equal(h.clock.time(), 12)
  assert.equal(h.clock.playing, false)
  assert.equal(h.calls(), 0)
  await h.clock.play()
  assert.equal(h.calls(), 1)
})

test('seeking directly from a playing intro starts audio at the requested song time', async () => {
  const h = harness()
  await h.clock.play(); h.advance(1000)
  h.clock.seek(12); await flush()
  assert.equal(h.calls(), 1)
  assert.equal(h.audio.currentTime, 12)
  assert.equal(h.clock.time(), 12)
})

test('seeking back into an intro pauses audio and starts it again only at zero', async () => {
  const h = harness()
  h.clock.seek(20); await h.clock.play()
  h.clock.seek(-2)
  assert.equal(h.audio.paused, true)
  assert.equal(h.clock.time(), -2)
  assert.equal(h.clock.playing, true)
  h.advance(2000); h.clock.tick(); await flush()
  assert.equal(h.audio.currentTime, 0)
  assert.equal(h.calls(), 2)
})

test('pause cancels a deferred handoff and late play resolution cannot produce ghost audio', async () => {
  const h = harness({ deferred: true })
  await h.clock.play(); h.advance(5000); h.clock.tick()
  assert.equal(h.requests.length, 1)
  assert.equal(h.clock.playing, true)
  h.clock.pause(); h.requests[0].resolve(); await flush()
  assert.equal(h.audio.paused, true)
  assert.equal(h.clock.playing, false)
  assert.equal(h.clock.takeError(), null)
})

test('restart into negative time cancels an old audio request while retaining the new intro', async () => {
  const h = harness({ deferred: true })
  await h.clock.play(); h.advance(5000); h.clock.tick()
  h.clock.pause(); h.clock.seek(h.clock.minimumTime); await h.clock.play()
  h.requests[0].resolve(); await flush()
  assert.equal(h.audio.paused, true)
  assert.equal(h.clock.time(), -5)
  assert.equal(h.clock.playing, true)
  h.advance(5000); h.clock.tick(); h.requests[1].resolve(); await flush()
  assert.equal(h.audio.paused, false)
  assert.equal(h.clock.time(), 0)
})

test('late older play does not pause a newer intended song-play request', async () => {
  const h = harness({ deferred: true })
  await h.clock.play(); h.advance(5000); h.clock.tick()
  h.clock.pause(); h.clock.seek(12)
  const newer = h.clock.play()
  h.requests[1].resolve(); await newer
  h.requests[0].resolve(); await flush()
  assert.equal(h.audio.paused, false)
  assert.equal(h.clock.playing, true)
  assert.equal(h.clock.time(), 12)
})

test('source reset and disposal invalidate deferred audio starts', async () => {
  for (const operation of ['reset', 'dispose']) {
    const h = harness({ deferred: true })
    await h.clock.play(); h.advance(5000); h.clock.tick()
    if (operation === 'reset') { h.audio.src = 'blob:new'; h.clock.reset(3) } else h.clock.dispose()
    h.requests[0].resolve(); await flush()
    assert.equal(h.audio.paused, true)
    assert.equal(h.clock.playing, false)
    if (operation === 'reset') assert.equal(h.clock.time(), -3)
  }
})

test('handoff playback failure is reported once; cancelled old failures stay inert', async () => {
  const h = harness({ deferred: true })
  await h.clock.play(); h.advance(5000); h.clock.tick()
  h.requests[0].reject(new Error('autoplay denied')); await flush()
  assert.match(h.clock.takeError().message, /autoplay/)
  assert.equal(h.clock.takeError(), null)
  assert.equal(h.clock.playing, false)
  const cancelled = harness({ deferred: true })
  await cancelled.clock.play(); cancelled.advance(5000); cancelled.clock.tick()
  cancelled.clock.pause(); cancelled.requests[0].reject(new Error('cancelled')); await flush()
  assert.equal(cancelled.clock.takeError(), null)
})

test('invalid preroll is disabled; valid negative frames render without a ready slate', () => {
  for (const value of [NaN, Infinity, -1, 31, '5']) assert.equal(harness({ preroll: value }).clock.preroll, 0)
  assert.deepEqual(frameTime(-3, true, 212, 5), { t: -3, ready: false })
  assert.deepEqual(frameTime(-99, false, 212, 5), { t: -5, ready: true })
  assert.equal(prerollCountdown(-4.01, 5), 5)
  assert.equal(prerollCountdown(-0.01, 5), 1)
  assert.equal(prerollCountdown(0, 5), null)
  assert.equal(prerollCountdown(-5, 0), null)
})

test('scene preparation has an explicit font stage and never labels every scene as 3D', () => {
  assert.match(preparationText({ phase: 'font-loading', progress: 0.5, label: 'Face' }), /加载场景字体.*50%.*Face/)
  assert.match(preparationText({ phase: 'warming' }), /预热场景/)
  assert.match(preparationText({ progress: 0.5 }), /准备场景资源.*50%/)
  assert.doesNotMatch(preparationText(), /3D|NaN/)
})

test('a user seek cancels a play request waiting on resource preparation', async () => {
  const h = harness()
  const gate = new ScenePlayGate()
  let resolve
  const load = new Promise(done => { resolve = done })
  const queued = gate.play(load, () => true, () => h.clock.play())
  gate.cancel(); h.clock.seek(12)
  resolve(); assert.equal(await queued, false)
  assert.equal(h.calls(), 0)
  assert.equal(h.clock.time(), 12)
})

test('CanvasMv connects bounded font reader, transferred font bytes and negative-time controls', () => {
  const source = readFileSync(new URL('../.dsh-plugin/client/canvas-mv.jsx', import.meta.url), 'utf8')
  assert.match(source, /loadSceneFonts\(packFontReader\(api, pack\.manifestPath\), pack\.pack\)/)
  assert.match(source, /fonts: loadedFonts\.fonts/)
  assert.match(source, /\.\.\.sceneAssets\.transfer, \.\.\.loadedFonts\.transfer/)
  assert.match(source, /state\.script\.draw\(el\.getContext\('2d'\), t,/)
  assert.doesNotMatch(source, /state\.script\.draw\([^\n]*Math\.max\(0, t\)/)
  assert.match(source, /min=\{-preroll\}/)
  assert.match(source, /静默前奏倒计时/)
  assert.match(source, /preservePlayRequest: true/)
  assert.match(source, /state\.clock\.dispose\(\)/)
})
