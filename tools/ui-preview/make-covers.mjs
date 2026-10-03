// Cover PNGs for the 创意工坊 preview (not shipped): renders a frame of each template example with the
// host sandbox, then cover.py (Pillow) draws it. Output: /tmp/mv-ui-preview/covers/<id>.png
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { TEMPLATE_ASSETS } from '../../.dsh-plugin/shared/mv-template-assets.gen.mjs'
import { compileScene } from '../../.dsh-plugin/shared/mv-scene-host.mjs'
import { sceneContext } from '../../.dsh-plugin/shared/mv-scene.mjs'
import { parseLrc } from '../../.dsh-plugin/shared/mv-lyrics.mjs'
const OUT = '/tmp/mv-ui-preview/covers'
mkdirSync(OUT, { recursive: true })
const pack = JSON.parse(TEMPLATE_ASSETS['examples/rich-pack/mv.json'])
const cues = parseLrc(TEMPLATE_ASSETS['examples/rich-pack/lyrics.placeholder.lrc'])
const covers = [
  ['neon-terminal-example', 'examples/rich-pack/scenes.js', 80.3], ['heartbeat-exe', 'examples/heartbeat.scene.js', 66.2], ['whale-fall-protocol', 'examples/whale-fall.scene.js', 104],
  ['token-rain', 'examples/token-bar.scene.js', 21.3], ['execute-split', 'examples/execution-split.scene.js', 44.2], ['ops-ticker-blues', 'examples/ops-ticker.scene.js', 50.5],
]
for (const [id, file, t] of covers) {
  const cue = cues.filter(c => c.time <= t && !(c.end <= t)).at(-1) ?? null
  const ctx = sceneContext({ t, duration: 120, title: pack.title, artist: pack.artist, cue, next: cues.find(c => c.time > t) ?? null, bands: Array.from({ length: 48 }, (_, i) => 0.5 + 0.45 * Math.sin(t * 3 + i * 0.4) * (1 - i / 64)), sections: pack['x-dsh-mv-ai'].sections, bpm: 120 })
  const frame = compileScene(TEMPLATE_ASSETS[file]).renderFrame(t, 84, 30, ctx)
  writeFileSync(`/tmp/cover-${id}.json`, JSON.stringify(frame))
  execFileSync('python3', [new URL('./cover.py', import.meta.url).pathname, `/tmp/cover-${id}.json`, `${OUT}/${id}.png`], { stdio: 'inherit' })
}
