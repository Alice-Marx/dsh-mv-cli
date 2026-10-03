import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkWavHeader, createWavCache, mciWarning, parseAudioProbe, parseWavBegin, parseWavWrite, probeAudioFile, sniffAudio, wavCacheDir } from '../.dsh-plugin/shared/mv-audio.mjs'
import { bytesToBase64, convertFileToWav, effectiveAudioPath, encodeWav } from '../.dsh-plugin/client/mv-wav.mjs'

const hex = text => Uint8Array.from(text.split(' ').map(byte => parseInt(byte, 16)))
// First bytes of the user's song.mp3 (a DASH MP4 renamed .mp3).
const DASH = hex('00 00 00 20 66 74 79 70 69 73 6f 35 00 00 02 00 69 73 6f 35 69 73 6f 36 6d 70 34 31 64 61 73 68')

test('sniffAudio tells real formats apart from extensions', () => {
  assert.equal(sniffAudio(DASH).format, 'mp4')
  assert.equal(sniffAudio(DASH).fragmented, true)
  assert.match(sniffAudio(DASH).label, /DASH/)
  assert.equal(sniffAudio(Buffer.from('ID3\x04\x00')).format, 'mp3')
  assert.equal(sniffAudio(hex('ff fb 90 64')).format, 'mp3')
  assert.equal(sniffAudio(hex('ff f1 50 80')).format, 'aac')
  assert.equal(sniffAudio(Buffer.from('RIFF\x00\x00\x00\x00WAVEfmt ', 'latin1')).format, 'wav')
  assert.equal(sniffAudio(Buffer.from('OggS')).format, 'ogg')
  assert.equal(sniffAudio(Buffer.from('hello')).format, 'unknown')
})

test('mciWarning flags anything but MP3/WAV for tui_live.py, non-MP3 for rust', () => {
  assert.match(mciWarning(sniffAudio(DASH), 'F:\\a\\song.mp3'), /MCI.*转换为 WAV/)
  assert.equal(mciWarning({ format: 'mp3' }, 'x'), '')
  assert.equal(mciWarning({ format: 'wav' }, 'x'), '')
  assert.match(mciWarning({ format: 'wav', label: 'WAV' }, 'x', 'rust'), /只能解码 MP3/)
})

test('probeAudioFile reads only the header and size', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mvaudio-'))
  try {
    const file = join(dir, 'song.mp3')
    await writeFile(file, Buffer.concat([Buffer.from(DASH), Buffer.alloc(1000)]))
    const probe = await probeAudioFile(file)
    assert.equal(probe.format, 'mp4'); assert.equal(probe.size, 1032)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('parsers reject bad requests', () => {
  assert.throws(() => parseAudioProbe({ path: 'relative.mp3' }))
  assert.throws(() => parseAudioProbe({ path: 'C:\\a.mp3', extra: 1 }))
  assert.deepEqual(parseAudioProbe({ path: 'C:\\a.mp3' }), { path: 'C:\\a.mp3', player: 'python' })
  assert.throws(() => parseWavBegin({ sourceSha256: 'abc', bytes: 100 }))
  assert.throws(() => parseWavBegin({ sourceSha256: 'a'.repeat(64), bytes: 10 }))
  assert.throws(() => parseWavWrite({ uploadId: '../x', offset: 0, base64: 'AA==' }))
  assert.throws(() => parseWavWrite({ uploadId: 'wav-0123456789abcdef', offset: 0, base64: 'not base64!' }))
})

test('wavCacheDir is plugin-owned', () => {
  assert.equal(wavCacheDir({ LOCALAPPDATA: 'C:\\Users\\u\\AppData\\Local' }, 'win32').replace(/\//g, '\\'), 'C:\\Users\\u\\AppData\\Local\\dsh-mv\\audio-cache')
  assert.match(wavCacheDir({ XDG_CACHE_HOME: '/c' }, 'linux'), /\/c\/dsh-mv\/audio-cache$/)
})

test('encodeWav writes a header checkWavHeader accepts', () => {
  const left = Float32Array.from([0, 1, -1, 0.5]), right = Float32Array.from([0, -1, 1, -0.5])
  const wav = encodeWav([left, right], 44100)
  assert.equal(wav.length, 44 + 16)
  assert.equal(checkWavHeader(wav.subarray(0, 44), wav.length), '')
  assert.equal(checkWavHeader(wav.subarray(0, 44), wav.length + 2), 'RIFF size does not match')
  const view = new DataView(wav.buffer)
  assert.equal(view.getInt16(44 + 4, true), 32767); assert.equal(view.getInt16(44 + 6, true), -32768)
})

test('wav cache: begin → write → finish, then cache hit; bad order aborts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mvwav-'))
  try {
    const cache = createWavCache({ dir })
    const wav = encodeWav([new Float32Array(1000), new Float32Array(1000)], 44100)
    const sha = 'b'.repeat(64)
    const begun = await cache.begin({ sourceSha256: sha, bytes: wav.length })
    assert.equal(begun.exists, false)
    await assert.rejects(cache.write({ uploadId: begun.uploadId, offset: 10, base64: bytesToBase64(wav.subarray(0, 10)) }), /顺序/)
    await cache.write({ uploadId: begun.uploadId, offset: 0, base64: bytesToBase64(wav.subarray(0, 2000)) })
    await cache.write({ uploadId: begun.uploadId, offset: 2000, base64: bytesToBase64(wav.subarray(2000)) })
    const done = await cache.finish({ uploadId: begun.uploadId })
    assert.equal(done.path, join(dir, `${sha}.wav`))
    assert.deepEqual(new Uint8Array(await readFile(done.path)), wav)
    assert.deepEqual(await readdir(dir), [`${sha}.wav`])
    assert.equal((await cache.begin({ sourceSha256: sha, bytes: wav.length })).exists, true)
    // A non-WAV upload is refused at finish and leaves nothing behind.
    const bad = await cache.begin({ sourceSha256: 'c'.repeat(64), bytes: 50 })
    await cache.write({ uploadId: bad.uploadId, offset: 0, base64: bytesToBase64(new Uint8Array(50)) })
    await assert.rejects(cache.finish({ uploadId: bad.uploadId }), /WAV 无效/)
    assert.deepEqual(await readdir(dir), [`${sha}.wav`])
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('convertFileToWav decodes, uploads in chunks and returns the cache path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mvconv-'))
  try {
    const cache = createWavCache({ dir })
    const wrap = fn => async request => ({ ok: true, value: { ok: true, value: await fn(request) } })
    const api = { wavBegin: wrap(r => cache.begin(r)), wavWrite: wrap(r => cache.write(r)), wavFinish: wrap(r => cache.finish(r)) }
    const frames = 300_000
    const file = { arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }
    const decode = async () => ({ channels: [new Float32Array(frames).fill(0.25), new Float32Array(frames)], sampleRate: 44100, duration: frames / 44100 })
    const stages = []
    const result = await convertFileToWav(api, file, { decode, onProgress: p => stages.push(p.stage) })
    assert.equal(result.bytes, 44 + frames * 4)
    assert.ok(stages.filter(stage => stage === 'upload').length >= 3)
    assert.equal((await readFile(result.path)).length, result.bytes)
    assert.equal((await convertFileToWav(api, file, { decode })).cached, true)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('effectiveAudioPath follows tui_live.py defaults', () => {
  assert.equal(effectiveAudioPath({ player: 'python', packageDir: 'F:\\w\\', audioFile: '' }), 'F:\\w\\input\\song.mp3')
  assert.equal(effectiveAudioPath({ player: 'python', packageDir: 'F:\\w', audioFile: 'D:\\a.mp3' }), 'D:\\a.mp3')
  assert.equal(effectiveAudioPath({ player: 'python', packageDir: 'F:\\w', noAudio: true }), '')
  assert.equal(effectiveAudioPath({ player: 'rust', audioFile: '' }), '')
  assert.equal(effectiveAudioPath({ player: 'pack' }), '')
})

test('terminal check reports the real audio format and the MCI warning', async () => {
  const { createMvTerminalManager } = await import('../.dsh-plugin/shared/mv-terminal.mjs')
  const terminals = createMvTerminalManager({
    loadPty: async () => null,
    resolveLaunch: async () => ({ file: 'py', args: [], cwd: 'C:\\w', script: 's', display: 'py s' }),
    probeAudio: async () => ({ ...sniffAudio(DASH), size: 1 }),
  })
  const checked = await terminals.check({ player: 'python', pythonPath: 'C:\\w\\python.exe', packageDir: 'C:\\w', audioFile: 'F:\\w\\song.mp3', noAudio: false, start: 0 })
  assert.equal(checked.audio.format, 'mp4')
  assert.match(checked.audio.warning, /MCI/)
})
