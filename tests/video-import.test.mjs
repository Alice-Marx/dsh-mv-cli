import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, readdir, rm, rmdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { importVideoPack, parseManimAudioOffset, parseVideoImportArgs, VideoImportError } from '../.dsh-plugin/import-video.mjs'
import { loadPack } from '../.dsh-plugin/shared/mv-pack-host.mjs'

const cli = fileURLToPath(new URL('../.dsh-plugin/import-video.mjs', import.meta.url))
const media = Buffer.from([0, 0, 0, 24, ...Buffer.from('ftypisom'), 0, 0, 0, 0, ...Buffer.from('isommp42')])

async function fixture(t, { manim = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-mv-video-import-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await writeFile(join(root, 'original movie.mp4'), media)
  await writeFile(join(root, 'song.mp3'), Buffer.from([0xff, 0xfb, 0x90, 0x64]))
  await writeFile(join(root, 'lyrics.lrc'), '[00:00.03]A local test cue\n')
  if (manim) {
    await mkdir(join(root, 'scenes'))
    await mkdir(join(root, 'out'))
    await writeFile(join(root, 'scenes', 'world_execute_me.py'), '# fixture only\n')
    await writeFile(join(root, 'cues.py'), 'AUDIO_OFFSET = 5.16 # title card\n')
    await writeFile(join(root, 'out', 'world-execute-me-manim.mp4'), media)
    await writeFile(join(root, 'out', 'world-execute-me-manim-silent.mp4'), media)
  }
  return root
}

test('video importer: generic video creates a loadable pack with original file references', async t => {
  const root = await fixture(t), input = join(root, 'original movie.mp4'), audio = join(root, 'song.mp3'), lyrics = join(root, 'lyrics.lrc')
  const out = join(root, 'nested', 'new pack')
  const result = await importVideoPack({ input, out, audio, lyrics, title: 'Original frames' })
  assert.equal(result.manifest.title, 'Original frames')
  assert.deepEqual(result.manifest.video, { file: resolve(input), offset: 0 })
  assert.deepEqual(result.manifest.canvas, { renderer: 'video', subtitles: false })
  assert.deepEqual(result.manifest.audio, { file: resolve(audio), offset: 0 })
  assert.deepEqual(result.manifest.lyrics, { file: resolve(lyrics), offset: 0 })
  assert.deepEqual(await readdir(out), ['mv.json'], 'no media copies')
  assert.deepEqual(await readFile(input), media, 'rendered frames remain untouched')
  const loaded = await loadPack(out)
  assert.equal(loaded.pack.canvas.renderer, 'video')
  assert.equal(loaded.files.video.exists, true)
})

test('video importer: Manim output choice respects external audio and title card timing', async t => {
  const root = await fixture(t, { manim: true }), lyrics = join(root, 'lyrics.lrc'), audio = join(root, 'song.mp3')
  const muxed = await importVideoPack({ input: root, out: join(root, 'muxed-pack'), lyrics })
  assert.equal(muxed.manifest.video.file, join(root, 'out', 'world-execute-me-manim.mp4'))
  assert.equal(muxed.manifest.audio, undefined, 'embedded video track is used')
  assert.equal(muxed.manifest.lyrics.offset, 5.16)
  const external = await importVideoPack({ input: root, out: join(root, 'external-pack'), audio, lyrics })
  assert.equal(external.manifest.video.file, join(root, 'out', 'world-execute-me-manim-silent.mp4'))
  assert.equal(external.manifest.audio.offset, 0, 'reference audio already contains the title card silence')
  assert.equal(external.manifest.lyrics.offset, 5.16)
  const stripped = await importVideoPack({ input: root, out: join(root, 'stripped-pack'), audio, audioOffset: 5.16, lyrics, lyricsOffset: 4.25 })
  assert.equal(stripped.manifest.audio.offset, 5.16)
  assert.equal(stripped.manifest.lyrics.offset, 4.25)
})

test('video importer: changed static cues offset is read as data without Python execution', async t => {
  const root = await fixture(t, { manim: true }), lyrics = join(root, 'lyrics.lrc')
  const sideEffect = join(root, 'never-created.txt')
  await writeFile(join(root, 'cues.py'), `from pathlib import Path\nPath(${JSON.stringify(sideEffect)}).write_text('executed')\nAUDIO_OFFSET: float = 2.75 # custom render\n`)
  const result = await importVideoPack({ input: root, out: join(root, 'custom-pack'), lyrics })
  assert.equal(result.manifest.lyrics.offset, 2.75)
  assert.equal((await readdir(root)).includes('never-created.txt'), false)
  await writeFile(join(root, 'cues.py'), 'AUDIO_OFFSET = __import__("os").system("echo unsafe")\n')
  const fallback = await importVideoPack({ input: root, out: join(root, 'fallback-pack'), lyrics })
  assert.equal(fallback.manifest.lyrics.offset, 5.16)
  assert.equal(fallback.warnings.length, 1)
})

test('video importer: literal reader ignores strings, comments, nested assignments and expressions', () => {
  assert.equal(parseManimAudioOffset('"""\nAUDIO_OFFSET = 12\n"""\n# AUDIO_OFFSET = 10\nAUDIO_OFFSET = 5.16\n'), 5.16)
  assert.equal(parseManimAudioOffset('if True:\n    AUDIO_OFFSET = 9\n'), null)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = 5.16 + 1\n'), null)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = "5.16"\n'), null)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = "" +5.16\n'), null)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = 1e309\n'), null)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = -3e-1\n'), -0.3)
  assert.equal(parseManimAudioOffset('AUDIO_OFFSET = 31\n'), null)
})

test('video importer: explicit Manim flag sets timing for a direct render; generic never guesses 5.16', async t => {
  const root = await fixture(t), input = join(root, 'original movie.mp4'), lyrics = join(root, 'lyrics.lrc')
  const generic = await importVideoPack({ input, out: join(root, 'generic'), lyrics })
  const manim = await importVideoPack({ input, out: join(root, 'explicit-manim'), lyrics, manim: true })
  assert.equal(generic.manifest.lyrics.offset, 0)
  assert.equal(manim.manifest.lyrics.offset, 5.16)
})

test('video importer: recognizes missing renders and falls back to available silent output', async t => {
  const root = await fixture(t, { manim: true })
  await rm(join(root, 'out', 'world-execute-me-manim.mp4'))
  const result = await importVideoPack({ input: root, out: join(root, 'silent-pack') })
  assert.equal(result.manifest.video.file, join(root, 'out', 'world-execute-me-manim-silent.mp4'))
  await rm(join(root, 'out', 'world-execute-me-manim-silent.mp4'))
  await assert.rejects(importVideoPack({ input: root, out: join(root, 'missing-pack') }), error => error.code === 'MANIM_RENDER_MISSING' && /Render the Manim project first/.test(error.message))
})

test('video importer: validates inputs before writing and never overwrites even an empty output folder', async t => {
  const root = await fixture(t), input = join(root, 'original movie.mp4'), out = join(root, 'must-stay-new')
  await assert.rejects(importVideoPack({ input, out, audio: join(root, 'missing.mp3') }), { code: 'INPUT_FILE' })
  await assert.rejects(importVideoPack({ input, out, audioOffset: 5 }), { code: 'ARGUMENT' })
  await assert.rejects(importVideoPack({ input, out, lyrics: join(root, 'lyrics.lrc'), lyricsOffset: 31 }), { code: 'OFFSET' })
  await assert.rejects(importVideoPack({ input, out, title: '' }), { code: 'MANIFEST' })
  assert.equal((await readdir(root)).includes('must-stay-new'), false)
  await mkdir(out)
  await assert.rejects(importVideoPack({ input, out }), { code: 'OUTPUT_EXISTS' })
  assert.deepEqual(await readdir(out), [])
  await rmdir(out)
  await importVideoPack({ input, out })
  const original = await readFile(join(out, 'mv.json'), 'utf8')
  await assert.rejects(importVideoPack({ input, out, title: 'Overwrite attempt' }), { code: 'OUTPUT_EXISTS' })
  assert.equal(await readFile(join(out, 'mv.json'), 'utf8'), original)
})

test('video importer: concurrent imports into one output cannot overwrite each other', async t => {
  const root = await fixture(t), input = join(root, 'original movie.mp4'), out = join(root, 'concurrent')
  const results = await Promise.allSettled([importVideoPack({ input, out, title: 'A' }), importVideoPack({ input, out, title: 'B' })])
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
  const rejected = results.find(result => result.status === 'rejected')
  assert.ok(rejected.reason instanceof VideoImportError)
  assert.equal(rejected.reason.code, 'OUTPUT_EXISTS')
  assert.deepEqual(await readdir(out), ['mv.json'])
})

test('video importer: argument parser accepts paths with spaces and rejects invalid or ignored flags', () => {
  assert.deepEqual(parseVideoImportArgs(['movie.mp4', '--out=pack folder', '--audio', 'song.mp3', '--audio-offset', '-0.5', '--manim']), { out: 'pack folder', audio: 'song.mp3', audioOffset: -0.5, manim: true, input: 'movie.mp4' })
  for (const argv of [['movie.mp4'], ['movie.mp4', '--out'], ['a.mp4', 'b.mp4', '--out', 'pack'], ['a.mp4', '--out', 'pack', '--out', 'other'], ['a.mp4', '--out', 'pack', '--exec', 'python'], ['a.mp4', '--out', 'pack', '--audio-offset', 'NaN']]) assert.throws(() => parseVideoImportArgs(argv), VideoImportError)
})

test('video importer: real CLI produces JSON and errors on stderr without side effects', async t => {
  const root = await fixture(t), input = join(root, 'original movie.mp4'), out = join(root, 'cli-pack')
  const success = spawnSync(process.execPath, [cli, input, '--out', out], { encoding: 'utf8' })
  assert.equal(success.status, 0, success.stderr)
  assert.equal(JSON.parse(success.stdout).ok, true)
  assert.equal(success.stderr, '')
  const duplicate = spawnSync(process.execPath, [cli, input, '--out', out], { encoding: 'utf8' })
  assert.equal(duplicate.status, 1)
  assert.equal(duplicate.stdout, '')
  assert.deepEqual(JSON.parse(duplicate.stderr).error.code, 'OUTPUT_EXISTS')
  const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' })
  assert.equal(help.status, 0)
  assert.match(help.stdout, /Usage: dsh-mv-import-video/)
})

test('video importer: npm style symlink launches the real CLI', async t => {
  const root = await fixture(t), alias = join(root, 'import-video.mjs')
  try { await symlink(cli, alias) } catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) { t.skip('OS does not allow creating file symlinks'); return }
    throw error
  }
  const result = spawnSync(process.execPath, [alias, '--help'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Usage: dsh-mv-import-video/)
})
