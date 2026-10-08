// SPDX-License-Identifier: MIT
// Nyankomint source is MIT; character art/output is separately CC BY-NC-SA 4.0.
// The supervisor supplies offline fonts/data/bitmaps. No DOM, network or audio.
import { createEngine } from 'nyan:src/engine/engine.js'
import { Art, ART_NAMES } from 'nyan:src/engine/art.js'
import { setSeed } from 'nyan:src/engine/prng.js'

let state = null
export function setup(info, gl) {
  if (!info.assets?.config || !info.assets?.features || !info.assets?.captions?.lines) throw new Error('Incomplete Nyankomint offline assets')
  if (info.assets.captions.lines.length !== 129) throw new Error('Nyankomint requires the original 129 lyric lines')
  const cfg = info.assets.config
  setSeed(cfg.seed)
  const art = new Art()
  art.regions = info.assets.regions
  state = { info, gl, cfg, art, engine: null, width: info.width, height: info.height }
}

export function* prepare(info, gl) {
  const total = ART_NAMES.length + 1 + 87 * 2
  let done = 0
  for (const name of ART_NAMES) {
    const image = info.assets[name.replaceAll('_', '-')]
    if (!image || !image.width || !image.height) throw new Error('Missing silhouette: ' + name)
    state.art._prepareInk(name, image)
    yield { progress: ++done / total, label: 'Separate / trace silhouette ' + name }
  }
  state.engine = createEngine({ canvas: info.canvas, width: info.width, height: info.height, cfg: state.cfg,
    featuresData: info.assets.features, lyricsData: info.assets.captions, art: state.art,
    script: info.assets.conversation, errors: info.assets.errors, flipY: false })
  const content = state.engine.scenes.filter(s => !s.overlay)
  if (content.length !== 87 || content.some(s => s.id.startsWith('todo-'))) throw new Error('The original 87 shots must all be present')
  yield { progress: ++done / total, label: 'All 87 original shots' }
  // Populate first-use masks, glyph caches, paper textures, GPU targets and post
  // shader paths under the cooperative preparation deadline, not during music.
  for (const shot of content) {
    for (const t of [shot.at + Math.min(.08, (shot.until - shot.at) / 4), (shot.at + shot.until) / 2]) {
      state.engine.renderFrame(t)
      gl.finish()
      yield { progress: ++done / total, label: 'Prewarm ' + shot.id }
    }
  }
}

export function warmup(info, gl) { state.engine.renderFrame(-state.cfg.safety.preroll); gl.finish() }
export function paint(gl, t, width, height) {
  if (!state?.engine) throw new Error('Nyankomint preparation has not completed')
  if (width !== state.width || height !== state.height) {
    state.engine.resize(width, height); state.width = width; state.height = height
  }
  state.engine.renderFrame(t)
}
