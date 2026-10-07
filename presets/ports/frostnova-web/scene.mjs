// SPDX-License-Identifier: AGPL-3.0-or-later
// FrostNova's original Engine/main edit; worker glue copyright 2026 Alice-Marx.
import 'frost:chapters-static'
import { Engine } from 'frost:src/engine/engine.js'
import { Timing } from 'frost:src/engine/timing.js'
import { Features } from 'frost:src/engine/features.js'
import { Timeline } from 'frost:src/engine/timeline.js'
import { editTable } from 'frost:src/engine/edit.js'
import 'frost:src/edit/table.js'
import { prepareCat } from 'frost:src/ch/06_v2.js'
import { configureChinese, configureResources } from './resource-runtime.mjs'

let engine = null, width = 0, height = 0, scale = 1, slow = 0
const now = () => typeof performance === 'undefined' ? Date.now() : performance.now()
export function setup(info, gl) {
  if (!info.canvas || !gl?.getExtension('EXT_color_buffer_float')) throw new Error('FrostNova MV needs WebGL2 float render targets')
  if (engine) throw new Error('A FrostNova scene instance may only be initialized once')
  const { data, meta, captions, onsets } = configureResources(info.assets)
  engine = new Engine(info.canvas, { context: gl, width: 640, height: 360, mode: 'player', mb: 'auto', outFps: 30, preserve: false, fonts: null })
  engine.mbCap = 1
  engine.T = Timing.from(captions.timing, onsets)
  engine.T.preroll = 5
  engine.T.clockZero = -5
  engine.F = new Features(meta, data)
  engine.timeline = new Timeline(engine.T, [], { edit: editTable('main') })
  if (engine.timeline.problems.length || engine.timeline.shots.length !== 305) throw new Error('Original 305-shot edit did not register cleanly: ' + engine.timeline.problems.join('; '))
  engine.duration = engine.T.duration
  configureChinese(engine.T, captions.translation)
  width = height = 0
}
export function paint(gl, t, w, h) {
  if (!engine) throw new Error('Call setup before paint')
  if (w !== width || h !== height) {
    width = w; height = h
    engine.renderer.setSize(w, h, false)
    const innerWidth = Math.max(320, Math.round(Math.min(w, 640) * scale / 2) * 2)
    engine.setSize(innerWidth, Math.round(innerWidth * h / w))
  }
  const start = now()
  engine.renderFrame(Math.max(0, Math.min(engine.duration, Number(t) || 0)))
  if (engine.errors.length) throw new Error(engine.errors[0])
  // Quality changes only HDR/text targets, never the supervisor's output surface.
  if (now() - start > 75 && ++slow >= 3 && scale > .5) {
    scale = Math.max(.5, scale * .8); width = height = 0; slow = 0
  }
}

// The original page prewarms start/middle/end plus every transition before
// starting its music. Yield once per shot so the plugin can supervise/cancel
// loading separately from its strict realtime frame watchdog. No scene timer.
export function* prepare(info, gl) {
  if (!engine) throw new Error('Call setup before prepare')
  engine.renderer.setSize(info.width, info.height, false)
  engine.setSize(256, Math.round(256 * info.height / info.width))
  const shots = engine.timeline.shots, frame = 1 / 60
  let catPrepared = false
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i], end = Math.min(shot.end, engine.duration) - frame
    if (!catPrepared && shot.chapter.id === 'v2') {
      engine._init(shot)
      for (const stage of prepareCat()) {
        yield { progress: (i + stage.progress * .9) / shots.length, label: `v2 ${stage.label}` }
      }
      catPrepared = true
    }
    const times = [Math.min(shot.start + frame, end)]
    if (end - shot.start > 4 * frame) times.push((shot.start + end) / 2, end)
    if (shot.transitionIn) times.push(shot.start + shot.transitionIn.dur * (.5 - shot.transitionIn.bias))
    for (const t of times) {
      engine.renderFrame(t)
      if (engine.errors.length) throw new Error(engine.errors[0])
    }
    yield { progress: (i + 1) / shots.length, label: `${i + 1}/${shots.length} ${shot.id}` }
  }
  engine.setSize(Math.min(info.width, 640), Math.round(Math.min(info.width, 640) * info.height / info.width))
  width = info.width; height = info.height
  engine.renderFrame(0)
  if (engine.errors.length) throw new Error(engine.errors[0])
}

// prepare() walks all 305 shots at a small internal size, which is what the
// original page does, but the internal resize to 640 invalidates every render
// target and recompiles the size-dependent shaders. The very first frames that
// actually play would then pay that cost inside the panel's realtime frame
// watchdog, which reads as a stall rather than as first-use GPU work. Warm the
// opening at the final size, on the plugin's own pre-playback deadline.
export function warmup(info, gl) {
  if (!engine) throw new Error('Call setup before warmup')
  const innerWidth = Math.max(320, Math.round(Math.min(info.width, 640) * scale / 2) * 2)
  engine.renderer.setSize(info.width, info.height, false)
  engine.setSize(innerWidth, Math.round(innerWidth * info.height / info.width))
  width = info.width; height = info.height
  const shots = engine.timeline.shots, frame = 1 / 60
  for (const shot of shots.slice(0, 3)) {
    const end = Math.min(shot.end, engine.duration) - frame
    for (const t of [shot.start, Math.min(shot.start + frame, end), (shot.start + end) / 2]) {
      engine.renderFrame(Math.max(0, Math.min(engine.duration, t)))
      if (engine.errors.length) throw new Error(engine.errors[0])
    }
  }
  engine.renderFrame(0)
  if (engine.errors.length) throw new Error(engine.errors[0])
  // Leave the adaptive quality counter alone: warmup is not realtime playback.
  slow = 0
}
