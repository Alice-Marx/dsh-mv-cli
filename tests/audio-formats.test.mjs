// 0.4.0: relaxed audio formats — content sniffing, automatic WAV for
// tui_live.py (cached by sha256), optional ffmpeg (located, never auto-run).
import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sniffAudio, audioMimeOf, ffmpegArgs, parseAudioConvert, parseAudioRead } from '../.dsh-plugin/shared/mv-audio-protocol.mjs'
import { createFfmpegConverter, createWavCache, findFfmpeg, probeForPanel, readAudioChunk, FFMPEG_FALLBACKS } from '../.dsh-plugin/shared/mv-audio.mjs'
import { encodeWav, prepareTerminalAudio, readHostAudio } from '../.dsh-plugin/client/mv-wav.mjs'
import { audioMime } from '../.dsh-plugin/client/mv-pack-state.mjs'

const B = (...parts) => Buffer.concat(parts.map(p => (typeof p === 'string' ? Buffer.from(p, 'latin1') : Buffer.from(p))))
const ftyp = brand => B([0, 0, 0, 0x18], 'ftyp', brand, [0, 0, 0, 0], brand, 'isom')
const wrap = fn => async request => { try { return { ok: true, value: { ok: true, value: await fn(request) } } } catch (error) { return { ok: true, value: { ok: false, error: { message: error.message } } } } }

test('sniffAudio: formats by content', () => {
  const cases = [
    [ftyp('M4A '), 'mp4', 'audio', true, false],
    [B(ftyp('isom'), 'moov....trak....mdia....hdlr........vide'), 'mp4', 'video', true, false],
    [ftyp('qt  '), 'mp4', 'video', true, false],
    [B([0x1a, 0x45, 0xdf, 0xa3], '....webm....', 'A_OPUS'), 'webm', 'audio', true, false],
    [B([0x1a, 0x45, 0xdf, 0xa3], '....matroska..', 'V_MPEG4/ISO/AVC'), 'mkv', 'video', true, false],
    [B('OggS', Buffer.alloc(24), 'OpusHead'), 'ogg', 'audio', true, false],
    [B('fLaC', Buffer.alloc(8)), 'flac', 'audio', true, false],
    [B('ID3', [4, 0, 0, 0, 0, 0, 0], [0xff, 0xfb, 0x90, 0x64]), 'mp3', 'audio', true, true],
    [B('ID3', [4, 0, 0, 0, 0, 0, 0], [0xff, 0xf1, 0x50, 0x80]), 'aac', 'audio', true, false],
    [encodeWav([new Float32Array(8)], 44100), 'wav', 'audio', true, true],
    [B('FORM', [0, 0, 0, 0], 'AIFF'), 'aiff', 'audio', false, false],
    [B([0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11], Buffer.alloc(8)), 'asf', 'audio', false, false],
    [B('#!AMR\n'), 'amr', 'audio', false, false],
    [B('FLV', [1, 5]), 'flv', 'video', false, false],
    [B('MZ', Buffer.alloc(20)), 'unknown', 'unknown', false, false],
  ]
  for (const [bytes, format, kind, chromium, mci] of cases) {
    const sniff = sniffAudio(bytes)
    assert.deepEqual([sniff.format, sniff.kind, sniff.chromium, sniff.mci], [format, kind, chromium, mci], `${format}: ${sniff.label}`)
  }
  // 32-bit float WAV: Chromium yes, MCI no (converted).
  const float = Buffer.from(encodeWav([new Float32Array(8)], 44100))
  float.writeUInt16LE(3, 20); float.writeUInt16LE(32, 34)
  assert.deepEqual([sniffAudio(float).chromium, sniffAudio(float).mci], [true, false])
  assert.match(audioMimeOf(sniffAudio(ftyp('M4A '))), /audio\/mp4/)
  assert.match(audioMime(new Uint8Array(B('OggS', Buffer.alloc(24), 'OpusHead'))), /ogg/)
})

test('request parsers: audioRead / audioConvert', () => {
  assert.throws(() => parseAudioRead({ path: 'C:\\a.m4a', offset: -1, length: 10 }))
  assert.throws(() => parseAudioRead({ path: 'a.m4a', offset: 0, length: 10 }))
  assert.throws(() => parseAudioConvert({ path: 'C:\\a.wma' }), /confirm/)
  assert.deepEqual(parseAudioConvert({ path: 'C:\\a.wma', confirmed: true }), { path: 'C:\\a.wma', confirmed: true })
  assert.throws(() => parseAudioConvert({ path: 'C:\\a.wma', confirmed: true, args: ['-i'] }))
})

test('readAudioChunk serves media files only, in chunks', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'mvread-')); t.after(() => rm(dir, { recursive: true, force: true }))
  const media = join(dir, 'song.bin'), secret = join(dir, 'notes.mp3')
  await writeFile(media, B(ftyp('M4A '), Buffer.alloc(100)))
  await writeFile(secret, 'password=hunter2')
  const first = await readAudioChunk({ path: media, offset: 0, length: 64 })
  assert.deepEqual([first.bytes, first.done, first.format], [64, false, 'mp4'])
  await assert.rejects(readAudioChunk({ path: secret, offset: 0, length: 64 }), /不是可识别/)
  const api = { audioRead: wrap(r => readAudioChunk(r)) }
  assert.equal((await readHostAudio(api, media)).byteLength, 124)
})

test('findFfmpeg: config, then PATH, then D:\\Program Files\\FFmpeg; never runs it', async () => {
  assert.ok(FFMPEG_FALLBACKS.includes('D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe'))
  const files = new Set(['C:\\tools\\ffmpeg.exe', 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', 'E:\\my\\ffmpeg.exe'])
  const statPath = async path => { if (!files.has(path)) throw new Error('ENOENT'); return { isFile: () => true } }
  const win = { platform: 'win32', statPath }
  assert.deepEqual(await findFfmpeg({ ...win, env: { Path: 'C:\\x;"C:\\tools\\"' } }), { path: 'C:\\tools\\ffmpeg.exe', source: 'PATH' })
  assert.deepEqual(await findFfmpeg({ ...win, env: { PATH: 'C:\\x' } }), { path: 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', source: 'known' })
  assert.deepEqual(await findFfmpeg({ ...win, configured: 'E:\\my\\ffmpeg.exe', env: {} }), { path: 'E:\\my\\ffmpeg.exe', source: 'config' })
  assert.equal(await findFfmpeg({ ...win, configured: 'E:\\none.exe', env: {} }), null)
  assert.equal(await findFfmpeg({ ...win, env: {}, fallbacks: [] }), null)
  const args = ffmpegArgs('D:\\in & out.wma', 'C:\\cache\\x.part.wav')
  assert.deepEqual(args.slice(0, 5), ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y'])
  assert.equal(args[args.indexOf('-i') + 1], 'D:\\in & out.wma', 'one argv entry, no shell')
  assert.equal(args.at(-1), 'C:\\cache\\x.part.wav')
})

test('ffmpeg converter: fixed argv, shell:false, result checked and cached', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'mvff-')); t.after(() => rm(dir, { recursive: true, force: true }))
  const cache = createWavCache({ dir })
  const spawned = []
  const spawnImpl = (file, args, options) => {
    spawned.push({ file, args, options })
    const child = new EventEmitter(); child.stderr = new EventEmitter(); child.kill = () => {}
    writeFile(args.at(-1), encodeWav([new Float32Array(100), new Float32Array(100)], 44100)).then(() => child.emit('close', 0))
    return child
  }
  const ffmpeg = createFfmpegConverter({ cache, spawnImpl, locate: async () => ({ path: 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', source: 'known' }), hasher: async () => 'd'.repeat(64), probe: async () => ({ format: 'asf', size: 10 }) })
  assert.deepEqual(await ffmpeg.info(), { available: true, path: 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe', source: 'known' })
  const done = await ffmpeg.convert({ path: 'D:\\m\\song.wma' })
  assert.equal(done.path, join(dir, `${'d'.repeat(64)}.wav`))
  assert.equal(spawned[0].options.shell, false)
  assert.equal(spawned[0].file, 'D:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe')
  assert.equal((await ffmpeg.convert({ path: 'D:\\m\\song.wma' })).cached, true)
  assert.equal(spawned.length, 1)
  const missing = createFfmpegConverter({ cache, locate: async () => null })
  assert.deepEqual(await missing.info(), { available: false })
  await assert.rejects(missing.convert({ path: 'D:\\x.wma' }), /没有找到 ffmpeg/)
})

test('prepareTerminalAudio: MP3 as is, cached WAV reused, otherwise decode + upload', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'mvprep-')); t.after(() => rm(dir, { recursive: true, force: true }))
  const cache = createWavCache({ dir })
  const mp3 = join(dir, 'a.mp3'), dash = join(dir, 'b.mp3'), amr = join(dir, 'c.amr')
  await writeFile(mp3, B('ID3', [4, 0, 0, 0, 0, 0, 0], [0xff, 0xfb, 0x90, 0x64]))
  await writeFile(dash, B(ftyp('iso5'), 'dash', Buffer.alloc(64)))
  await writeFile(amr, B('#!AMR\n', Buffer.alloc(10)))
  const api = {
    audioProbe: wrap(r => probeForPanel(r, { cache })), audioRead: wrap(r => readAudioChunk(r)),
    wavBegin: wrap(r => cache.begin(r)), wavWrite: wrap(r => cache.write(r)), wavFinish: wrap(r => cache.finish(r)),
  }
  const decode = async () => ({ channels: [new Float32Array(2000), new Float32Array(2000)], sampleRate: 44100, duration: 2000 / 44100 })
  assert.deepEqual((await prepareTerminalAudio(api, mp3, { decode })).converted, false)
  const stages = []
  const first = await prepareTerminalAudio(api, dash, { decode, onProgress: p => stages.push(p.stage) })
  assert.equal(first.converted, true); assert.match(first.path, /\.wav$/)
  assert.ok(stages.includes('probe') && stages.includes('read'))
  const again = await prepareTerminalAudio(api, dash, { decode: async () => { throw new Error('must not decode again') } })
  assert.deepEqual([again.cached, again.path], [true, first.path])
  await assert.rejects(prepareTerminalAudio(api, amr, { decode }), error => error.code === 'decode-failed')
  const failing = async () => { throw new Error('无法解码这个音频') }
  await writeFile(dash, B(ftyp('iso5'), 'dash', Buffer.alloc(65)))
  await assert.rejects(prepareTerminalAudio(api, dash, { decode: failing }), error => error.code === 'decode-failed')
})
