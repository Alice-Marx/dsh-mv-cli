import test from 'node:test'
import assert from 'node:assert/strict'
import { DshPvFilm } from '../.dsh-plugin/client/mv/dshpv/film.mjs'
import { validateRasterTimeline } from '../.dsh-plugin/client/mv/dshpv/raster.mjs'

test('dsh-pv raster: many tiny particle crops fit while full-screen overdraw remains bounded', () => {
  const op = { atlas: 0, src: [0, 0, 8, 8], dst: [0, 0, 16, 16], z: 'over' }
  const descriptor = ops => ({ version: 1, size: [1280, 720], frames: [{ t: 0, ops }] })
  assert.equal(validateRasterTimeline(descriptor(Array.from({ length: 171 }, () => op))).frames[0].ops.length, 171)
  assert.throws(() => validateRasterTimeline(descriptor(Array.from({ length: 257 }, () => op))), /ops 数量/)
  assert.throws(() => validateRasterTimeline(descriptor(Array.from({ length: 5 }, () => ({ ...op, dst: [0, 0, 1280, 720] })))), /绘制面积/)
})

test('dsh-pv post: paused repeats and backward seeks do not accumulate the previous frame', () => {
  for (const [previous, t, expected] of [[undefined, 20, 0], [20, 20, 0], [20.1, 20, 0], [19.9, 20, 1], [19, 20, 0]]) {
    let overlays = 0, copied = 0
    const buffer = {}, trail = { getContext: () => ({ drawImage: image => { assert.equal(image, buffer); copied++ } }) }
    const film = { lastT: previous, trail, buffer, bloom: false }
    const ctx = {
      save() {}, restore() {}, fillRect() {}, drawImage: image => { assert.equal(image, trail); overlays++ },
      createRadialGradient: () => ({ addColorStop() {} }),
    }
    DshPvFilm.prototype.post.call(film, ctx, t, 1)
    assert.equal(overlays, expected); assert.equal(copied, 1); assert.equal(film.lastT, t)
  }
})

test('dsh-pv art: actual raster coverage replaces legacy standing/EXECUTION mosaics', () => {
  const film = {
    raster: { frames: [{ t: 0, ops: [{}] }, { t: 10, ops: [] }] }, art: {},
    image: () => null, mosaic: () => { throw new Error('legacy mosaic must not cover source art') },
    banner: () => { throw new Error('legacy tape must not cover source art') },
  }
  for (const fn of ['exec_hit', 'whale_fall', 'last_execution']) {
    DshPvFilm.prototype.art_.call(film, {}, { fn, lay: ['split'] }, { o: [] }, 5, () => 0)
  }
  film.mosaic = () => { film.mosaics = (film.mosaics ?? 0) + 1 }
  DshPvFilm.prototype.art_.call(film, {}, { fn: 'whale_fall', lay: ['split'], s: 0, e: 20 }, { o: [] }, 11, () => 0)
  assert.equal(film.mosaics, 1, 'empty coverage retains the legacy fallback')
})
