// SPDX-License-Identifier: AGPL-3.0-or-later
// Offline static data adaptation, copyright 2026 Alice-Marx.
import { decodeGzipChunks, decodeGzipJson } from './offline-data.mjs'
import { makeCanvas } from './fonts/runtime.mjs'
import { subtitleAt, subtitleEvents } from 'frost:src/subs/schedule.js'
import { accent, rows } from 'frost:src/subs/rules.js'
import { STYLE, drawSubtitle } from 'frost:src/subs/style.js'

let quoted = Object.create(null), events = [], subs = null
if (typeof __frostInitialAssets !== 'undefined' && __frostInitialAssets) quoted = decodeGzipJson(__frostInitialAssets.quotes)
export function quotedSources() { return quoted }
export function configureResources(assets) {
  const featureBytes = decodeGzipChunks(assets.features), meta = assets['feature-meta']
  if (featureBytes.length !== meta.frames * meta.channels.length * 4 || meta.frames !== 12715 || meta.fps !== 60 || meta.channels.length !== 25) throw new Error('Original feature data dimensions changed')
  const data = new Float32Array(featureBytes.length / 4), view = new DataView(featureBytes.buffer, featureBytes.byteOffset, featureBytes.byteLength)
  for (let j = 0; j < data.length; j++) {
    const n = view.getFloat32(j * 4, true)
    if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error('Invalid original feature value')
    data[j] = n
  }
  return { data, meta, captions: assets.captions, onsets: assets.onsets }
}
export function configureChinese(T, translation) {
  events = subtitleEvents(T, translation.lines, { skip: translation.skip, silent: translation.silent, accent, rows })
  subs = makeCanvas()
}
export function drawChinese(layer, T, t) {
  const w = layer.canvas.width, h = layer.canvas.height
  if (subs.width !== w || subs.height !== h) { subs.width = w; subs.height = h }
  const style = { ...STYLE, font: { ...STYLE.font, family: 'Noto Sans SC' } }
  drawSubtitle(subs.getContext('2d'), subtitleAt(events, t), style, w / 1920)
  layer.draw(g => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(subs, 0, 0) })
}
