import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkCachedWav, probeAudioFile, sniffAudio, wavCacheDir } from '../.dsh-plugin/shared/mv-audio.mjs'
import { bytesToBase64, encodeWav } from '../.dsh-plugin/client/mv-wav.mjs'
import * as audioProtocol from '../.dsh-plugin/shared/mv-audio-protocol.mjs'
import * as wav from '../.dsh-plugin/client/mv-wav.mjs'

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

test('0.6.0: no MCI / WAV-upload surface is left (the panel terminal is gone)', () => {
  for (const name of ['mciWarning', 'parseAudioProbe', 'parseWavBegin', 'parseWavWrite', 'parseWavFinish']) assert.equal(audioProtocol[name], undefined, name)
  for (const name of ['convertFileToWav', 'prepareTerminalAudio', 'effectiveAudioPath']) assert.equal(wav[name], undefined, name)
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

test('wavCacheDir is plugin-owned', () => {
  assert.equal(wavCacheDir({ LOCALAPPDATA: 'C:\\Users\\u\\AppData\\Local' }, 'win32').replace(/\//g, '\\'), 'C:\\Users\\u\\AppData\\Local\\dsh-mv\\audio-cache')
  assert.match(wavCacheDir({ XDG_CACHE_HOME: '/c' }, 'linux'), /\/c\/dsh-mv\/audio-cache$/)
})

test('encodeWav writes a 16-bit PCM WAV that the ffmpeg cache check accepts', () => {
  const left = Float32Array.from([0, 1, -1, 0.5]), right = Float32Array.from([0, -1, 1, -0.5])
  const wav = encodeWav([left, right], 44100)
  assert.equal(wav.length, 44 + 16)
  assert.equal(sniffAudio(wav).format, 'wav')
  const view = new DataView(wav.buffer)
  assert.equal(view.getInt16(44 + 4, true), 32767); assert.equal(view.getInt16(44 + 6, true), -32768)
  assert.equal(typeof bytesToBase64(wav), 'string')
  assert.equal(checkCachedWav(wav, wav.length), '')
  assert.equal(checkCachedWav(wav, wav.length + 2), 'RIFF size does not match')
})
