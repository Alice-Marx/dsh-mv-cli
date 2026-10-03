import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { TEMPLATE_ASSETS } from '../.dsh-plugin/shared/mv-template-assets.gen.mjs'
import { templateFiles, MV_PACK_JSON_SCHEMA } from '../.dsh-plugin/shared/mv-pack-template.mjs'
import { checkScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { parseLrc } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { parseMvPack } from '../.dsh-plugin/shared/mv-pack.mjs'
import { agentGuide, agentPrompt } from '../.dsh-plugin/shared/mv-ai-prompt.mjs'
import { sceneContext, cueWords } from '../.dsh-plugin/shared/mv-scene.mjs'

const root = new URL('..', import.meta.url).pathname

test('generated template assets are up to date with template/**', () => {
  execFileSync(process.execPath, ['scripts/gen-template.mjs', '--check'], { cwd: root, stdio: 'pipe' })
})

test('template ships examples, a rich pack and zh/en prompt templates', () => {
  const paths = templateFiles().map(file => file.path)
  for (const name of ['chat-window', 'heartbeat', 'ops-ticker', 'token-bar', 'execution-split', 'whale-fall', 'post-effects']) assert.ok(paths.includes(`examples/${name}.scene.js`), name)
  for (const lang of ['zh', 'en']) for (const n of ['01-creative-brief', '02-storyboard', '03-scene-script-guide', '04-qa-checklist', '05-iteration']) assert.ok(paths.includes(`prompts/${lang}/${n}.md`), `${lang}/${n}`)
  assert.ok(paths.includes('examples/rich-pack/mv.json') && paths.includes('examples/rich-pack/scenes.js') && paths.includes('examples/NOTICE.md'))
  // No audio, no artwork; MIT notice present.
  assert.ok(!paths.some(p => /\.(mp3|m4a|wav|flac|ogg|png|jpe?g|webp)$/i.test(p)))
  assert.match(TEMPLATE_ASSETS['examples/NOTICE.md'], /Copyright \(c\) 2026 MisakaZentai/)
  assert.ok(MV_PACK_JSON_SCHEMA.properties.canvas.properties.bpm)
})

const sections = [{ kind: 'intro', start: 0, end: 12 }, { kind: 'verse', start: 12, end: 40 }, { kind: 'chorus', start: 40, end: 60 }, { kind: 'bridge', start: 60, end: 76 }, { kind: 'chorus', start: 76, end: 96 }, { kind: 'outro', start: 96, end: 120 }]
const cues = parseLrc(TEMPLATE_ASSETS['examples/rich-pack/lyrics.placeholder.lrc'])

test('every example scene runs in the host sandbox: no errors, not blank, within budget', () => {
  const scenes = Object.entries(TEMPLATE_ASSETS).filter(([path]) => path.endsWith('.js'))
  assert.ok(scenes.length >= 8)
  for (const [path, source] of scenes) {
    assert.ok(!/\/\*@grid\*\//.test(source), `${path} still has the grid marker`)
    assert.ok(!/Math\.random|\bfetch\b|\beval\s*\(|new Function/.test(source), `${path} uses something it should not`)
    for (const info of [{ duration: 120, title: 'Example', sections, bpm: 120 }, { duration: 120, title: 'Example' }]) {
      for (const [cols, rows] of [[100, 32], [48, 14], [160, 48]]) {
        const result = checkScene(source, { times: [0.5, 14.3, 44, 66, 80.1, 115], cols, rows, info, cues, bandsAt: info.bpm ? undefined : () => new Array(48).fill(0) })
        assert.equal(result.ok, true, `${path} ${cols}x${rows}: ${result.problems.join('; ')}`)
        assert.deepEqual(result.problems, [], `${path} ${cols}x${rows}`)
      }
    }
  }
})

test('examples are deterministic (same t → same frame)', () => {
  const source = TEMPLATE_ASSETS['examples/rich-pack/scenes.js']
  const a = checkScene(source, { times: [44.2, 80.1], info: { duration: 120, sections, bpm: 120 }, cues })
  const b = checkScene(source, { times: [44.2, 80.1], info: { duration: 120, sections, bpm: 120 }, cues })
  assert.deepEqual(a.frames.map(f => f.text), b.frames.map(f => f.text))
})

test('rich example pack is a valid pack with sections, bpm and workshop data, and no audio', () => {
  const pack = parseMvPack(TEMPLATE_ASSETS['examples/rich-pack/mv.json'])
  assert.equal(pack.canvas.renderer, 'script')
  assert.equal(pack.canvas.bpm, 120)
  assert.equal(pack.sections.length, 6)
  assert.equal(pack.workshop.license, 'MIT')
  assert.equal(pack.audio, undefined)
})

test('enhanced LRC word stamps reach ctx.lyric.words; section and beat in ctx', () => {
  const cue = cues.find(c => c.en.startsWith('first verse'))
  assert.deepEqual(cue.words.map(w => w.text), ['first', 'verse', 'line', 'goes', 'here'])
  const ctx = sceneContext({ t: 13.1, duration: 120, cue, sections, bpm: 120 })
  assert.equal(ctx.lyric.word, 2)
  assert.equal(ctx.lyric.words[2].start, 13)
  assert.equal(ctx.section.kind, 'verse')
  assert.equal(ctx.section.index, 1)
  assert.equal(ctx.beat.index, 26)
  assert.equal(ctx.beat.pulse, 0.301)
  // Without stamps: spread over 70 % of the line, CJK per character.
  const est = cueWords({ time: 10, end: 20, zh: '你好 世界' })
  assert.deepEqual(est.map(w => w.text), ['你', '好', '世', '界'])
  assert.equal(est.at(-1).end, 17)
  assert.equal(sceneContext({ t: 1 }).beat, null)
})

test('AI session prompt and AGENT.md walk through the prompt templates', () => {
  const prompt = agentPrompt({ packDir: 'C:\\x', title: 'T' })
  for (const n of ['01-creative-brief', '02-storyboard', '03-scene-script-guide', '04-qa-checklist']) assert.match(prompt, new RegExp(n))
  const guide = agentGuide({ title: 'T', audioFile: 'audio.mp3', lyricsFile: '', duration: 100 })
  for (const n of ['01-creative-brief', '02-storyboard', '04-qa-checklist', '05-iteration', 'examples/README.md', 'ctx.beat', 'canvas.bpm']) assert.ok(guide.includes(n), n)
})
