import test from 'node:test'
import assert from 'node:assert/strict'
import { parseLrc, parseSrt, parseLyricsJson, parseLyrics, splitBilingual } from '../.dsh-plugin/client/mv/lyrics.mjs'
import { KNOWN_AUDIO, knownAudio, loadOffsets, saveOffsets, resetOffsets, sha256Hex, roundOffset, formatOffset } from '../.dsh-plugin/client/mv/sync.mjs'
import { spectrumFromJson, bandEdges, foldBands, BANDS } from '../.dsh-plugin/client/mv/spectrum.mjs'
import { FilmClock, SilentClock, frameTime, keyAction, stepCue } from '../.dsh-plugin/client/mv/player-state.mjs'
import { rowRuns, gridSize, PALETTE, MAX_COLS, MAX_ROWS } from '../.dsh-plugin/client/mv/renderer.mjs'
import { DEFAULT_DURATION as DURATION } from '../.dsh-plugin/client/mv/player-state.mjs'

// Placeholder text only: the package never ships the song's lyrics.
test('lyrics: bilingual LRC (same stamp twice, one line with a slash, blank stamp ends a cue)', () => {
  const cues = parseLrc('[ti:test]\n[00:01.50]First line\n[00:01.50]第一句\n[00:04.00]Second line / 第二句\n[00:06.25]\n[01:02.3]Third\n')
  assert.deepEqual(cues, [
    { time: 1.5, end: 4, en: 'First line', zh: '第一句' },
    { time: 4, end: 6.25, en: 'Second line', zh: '第二句' },
    { time: 62.3, end: 67.3, en: 'Third', zh: '' },
  ])
  assert.equal(parseLrc('[offset:500]\n[00:02.00]x')[0].time, 1.5)
  assert.equal(parseLrc('[00:01.00][00:03.00]repeat').length, 2)
})

test('lyrics: SRT with two text lines and ascii lyrics.json', () => {
  const srt = '1\r\n00:00:01,000 --> 00:00:02,500\r\nHello there\r\n你好\r\n\r\n2\r\n00:00:03,000 --> 00:00:04,000\r\n<i>Only English</i>\r\n'
  assert.deepEqual(parseSrt(srt), [{ time: 1, end: 2.5, en: 'Hello there', zh: '你好' }, { time: 3, end: 4, en: 'Only English', zh: '' }])
  const json = JSON.stringify([{ time: 2, end: 3, en: 'B', zh: '乙' }, { time: 0.1, end: 1.7, en: 'A', zh: '甲' }])
  assert.deepEqual(parseLyricsJson(json).map(c => c.en), ['A', 'B'])
  assert.equal(parseLyrics('x.json', json).length, 2)
  assert.equal(parseLyrics('x.srt', srt).length, 2)
  assert.equal(parseLyrics('x.lrc', '[00:01.00]a').length, 1)
  assert.throws(() => parseLyricsJson('{"nope":1}'), /数组/)
  assert.deepEqual(splitBilingual(['Mixed 中文']), { en: '', zh: 'Mixed 中文' })
})

test('sync: known encodes, per-sha offsets in storage', async () => {
  const storage = new Map()
  const local = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) }
  const f98 = KNOWN_AUDIO.find(item => item.sha256.startsWith('f98eaa'))
  assert.equal(f98.audioOffset, -4.83)
  assert.equal(knownAudio(f98.sha256, KNOWN_AUDIO), f98)
  assert.equal(knownAudio('zz', KNOWN_AUDIO), null)
  assert.equal(KNOWN_AUDIO.every(item => /^[0-9a-f]{64}$/.test(item.sha256)), true)
  assert.deepEqual(loadOffsets(f98.sha256, KNOWN_AUDIO, local).audioOffset, -4.83)
  saveOffsets(f98.sha256, { audioOffset: -4.7, subtitleOffset: 0.30000000004 }, local)
  assert.deepEqual([loadOffsets(f98.sha256, KNOWN_AUDIO, local).audioOffset, loadOffsets(f98.sha256, KNOWN_AUDIO, local).subtitleOffset], [-4.7, 0.3])
  resetOffsets(f98.sha256, local)
  assert.equal(loadOffsets(f98.sha256, KNOWN_AUDIO, local).audioOffset, -4.83)
  assert.equal(loadOffsets('a'.repeat(64), KNOWN_AUDIO, local).audioOffset, 0)
  assert.equal(await sha256Hex(new TextEncoder().encode('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  assert.equal(roundOffset(0.1 + 0.2), 0.3)
  assert.equal(formatOffset(-4.83), '−4.83 s')
})

test('spectrum: json frames like Film.energy, live band folding', () => {
  const energy = spectrumFromJson({ fps: 30, bands: 48, frames: [[0.1], [0.2], [0.3]] })
  assert.deepEqual(energy(0.04), [0.2])
  assert.deepEqual(energy(99), [0.3])
  assert.deepEqual(energy(-1), [0.1])
  assert.throws(() => spectrumFromJson({ fps: 0 }), /无效/)
  const edges = bandEdges(2048, 48000)
  assert.equal(edges.length, BANDS + 1)
  for (let i = 1; i < edges.length; i++) assert.ok(edges[i] > edges[i - 1])
  const bands = foldBands(new Uint8Array(2048).fill(128), edges, [])
  assert.equal(bands.length, BANDS)
  assert.ok(bands.every(v => v >= 0 && v <= 1))
})

test('player: clock maps audio time to film time with the sync offset', async () => {
  const audio = { src: 'blob:x', currentTime: 10, paused: true, duration: 224.45, play: async () => { audio.paused = false }, pause: () => { audio.paused = true } }
  const clock = new FilmClock({ audio, audioOffset: -4.83 })
  assert.equal(clock.time(), 10 - 4.83)
  clock.seek(100)
  assert.equal(audio.currentTime, 104.83)
  clock.seek(-50)
  assert.equal(audio.currentTime, 0)
  await clock.play()
  assert.equal(clock.playing, true)
  let now = 0
  const silent = new FilmClock({ silent: new SilentClock(() => now) })
  await silent.play(); now = 2500
  assert.equal(silent.time(), 2.5)
  assert.deepEqual(frameTime(-3, true), { t: 0, ready: true })
  assert.deepEqual(frameTime(5, false), { t: 5, ready: true })
  assert.equal(frameTime(999, true).t < DURATION, true)
  assert.equal(stepCue([1, 5, 9], 5.01, 1), 9)
  assert.equal(stepCue([1, 5, 9], 5.01, -1), 1)
  assert.equal(stepCue([], 3, 1), null)
})

test('player: keys follow player.py ([ = subtitles earlier, ] = later)', () => {
  assert.deepEqual(keyAction({ key: ' ' }), { type: 'toggle' })
  assert.deepEqual(keyAction({ key: '[' }), { type: 'subtitleOffset', delta: 0.1 })
  assert.deepEqual(keyAction({ key: ']' }), { type: 'subtitleOffset', delta: -0.1 })
  assert.deepEqual(keyAction({ key: '[', altKey: true }), { type: 'audioOffset', delta: -0.1 })
  assert.equal(keyAction({ key: '3' }).index, 2)
  assert.equal(keyAction({ key: 'c', ctrlKey: true }), null)
  assert.equal(keyAction({ key: 'F' }).type, 'fullscreen')
})

test('renderer: runs, wide glyphs and grid caps', () => {
  const row = [['a', 1], ['b', 1], ['c', 2], [' ', 0], ['中', 3], ['', 3], ['█', 0]]
  assert.deepEqual(rowRuns(row), [
    { x: 0, style: 1, text: 'ab', wide: false }, { x: 2, style: 2, text: 'c', wide: false },
    { x: 4, style: 3, text: '中', wide: true }, { x: 6, style: 0, text: '█', wide: false },
  ])
  assert.deepEqual(gridSize(100000, 100000, { width: 8, height: 16 }), { cols: MAX_COLS, rows: MAX_ROWS })
  assert.equal(PALETTE.length, 7)
})
