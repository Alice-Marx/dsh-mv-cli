import test from 'node:test'
import assert from 'node:assert/strict'
import { ScriptFilm } from '../.dsh-plugin/client/mv/script-film.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
import { packRequires } from '../.dsh-plugin/shared/mv-workshop.mjs'

test('bitmap subtitles: workshop minimum is 0.9.3 without a declared override', () => {
  for (const output of ['pixels','webgl']) assert.equal(packRequires({canvas:{renderer:'script',output,subtitles:true}},'0.9.1'),'0.9.3')
  assert.equal(packRequires({canvas:{renderer:'script',output:'webgl',subtitles:false}}),'0.9.2')
})

function context(width = 960, height = 540) {
  const calls = []
  const g = { canvas: { width, height }, calls, measureText: t => ({ width: t.length * 12 }) }
  for (const method of ['setTransform', 'fillRect', 'drawImage', 'save', 'restore', 'beginPath', 'rect', 'clip', 'fillText', 'strokeText']) g[method] = (...args) => calls.push({ method, args })
  return g
}
function film() {
  const f = new ScriptFilm()
  f.bitmap = {}; f.output = 'webgl'; f.size = [1280, 720]; f.request = () => {}
  f.setLyrics(parseLyrics('lyrics.js', 'export const LYRICS = [{t:1,en:"Demo caption",cn:"示例字幕"},{t:12,en:"Demo last"}];'))
  return f
}

test('bitmap subtitles: opt-in, bilingual data, offset, expiry and missing-frame no-op', () => {
  const f = film(), g = context()
  f.draw(g, 2)
  assert.equal(g.calls.some(c => c.method === 'fillText'), false)
  g.calls.length = 0; f.draw(g, 2, { subtitles: true })
  assert.deepEqual(g.calls.filter(c => c.method === 'fillText').map(c => c.args[0]), ['Demo caption', '示例字幕'])
  assert.equal(g.calls.filter(c => c.method === 'save').length, 1)
  assert.equal(g.calls.filter(c => c.method === 'restore').length, 1)
  for (const [t, options] of [[0, {}], [2, {offset:2}], [8, {}]]) {
    g.calls.length = 0; f.draw(g, t, { subtitles:true, ...options })
    assert.equal(g.calls.some(c => c.method === 'fillText'), false)
  }
  f.bitmap = null; g.calls.length = 0; f.draw(g, 2, { subtitles:true })
  assert.equal(g.calls.some(c => c.method === 'fillText'), false)
})

test('bitmap subtitles: stays inside letterbox on resize, bounds long user text', () => {
  const f = film(), g = context(1000, 800)
  f.draw(g, 2, { subtitles:true })
  const rect = g.calls.find(c => c.method === 'rect').args
  assert.deepEqual(rect, [0, 119, 1000, 563])
  for (const c of g.calls.filter(c => c.method === 'fillText')) {
    assert.equal(c.args[1], 500)
    assert.ok(c.args[2] >= rect[1] && c.args[2] <= rect[1] + rect[3])
    assert.equal(c.args[3], 900)
  }
  f.setLyrics([{time:1,end:3,en:'X'.repeat(10000),zh:''}]); g.calls.length=0
  f.draw(g,2,{subtitles:true})
  const drawn = g.calls.find(c=>c.method==='fillText').args[0]
  assert.ok(drawn.length < 512)
  assert.ok(drawn.endsWith('…'))
})
