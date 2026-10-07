import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { gzipSync } from 'node:zlib'
import { createRequire } from 'node:module'
import { base64Bytes, decodeGzipChunks, decodeGzipJson } from '../presets/ports/frostnova-web/offline-data.mjs'
const portRequire = createRequire(new URL('../presets/ports/frostnova-web/package.json', import.meta.url))
const { build } = portRequire('esbuild')
const chunks = (bytes, size = 7) => ({ chunks: Array.from({ length: Math.ceil(bytes.length / size) }, (_, i) => bytes.subarray(i * size, (i + 1) * size).toString('base64')) })

test('FrostNova base64 preserves every byte and rejects malformed padding', () => {
  for (const length of [0, 1, 2, 3, 255, 256, 257]) {
    const original = Buffer.from(Array.from({ length }, (_, i) => i % 256))
    assert.deepEqual(Buffer.from(base64Bytes(original.toString('base64'))), original)
  }
  for (const bad of ['a', 'A===', '====', 'AB==', 'AAB=', 'AA A', 'ＡＡ==', 'AA=Z']) assert.throws(() => base64Bytes(bad))
})
test('FrostNova inert gzip chunks retain UTF-8 and bounded expansion', () => {
  const original = { source: '中文 🐳 code "quoted"\n', lines: ['é', '𝕏'] }
  const data = chunks(gzipSync(Buffer.from(JSON.stringify(original))), 10)
  assert.deepEqual(decodeGzipJson(data), original)
  assert.deepEqual(Buffer.from(decodeGzipChunks(data)), Buffer.from(JSON.stringify(original)))
  assert.throws(() => decodeGzipChunks({ chunks: Array(17).fill('AAAA') }), /chunks/)
  assert.throws(() => decodeGzipChunks({ chunks: ['AAAA'] }), /gzip/)
  const forged = Buffer.from(gzipSync(Buffer.from('small')))
  forged.writeUInt32LE(4 * 1024 * 1024 + 1, forged.length - 4)
  assert.throws(() => decodeGzipChunks(chunks(forged)), /Expanded/)
})
test('FrostNova gzip text decodes in an isolated VM without Host/browser decoders', async () => {
  const expected = { source: '原作中文 🐈 and quoted code' }
  const data = chunks(gzipSync(Buffer.from(JSON.stringify(expected))), 12)
  const bundle = await build({ entryPoints: [new URL('../presets/ports/frostnova-web/offline-data.mjs', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')], bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'Offline' })
  const result = vm.runInNewContext(`${bundle.outputFiles[0].text}\nJSON.stringify({text:Offline.decodeGzipJson(JSON.parse(${JSON.stringify(JSON.stringify(data))})),native:[typeof atob,typeof TextDecoder]})`, Object.create(null), { timeout: 2000, codeGeneration: { strings: false, wasm: false } })
  assert.deepEqual(JSON.parse(result), { text: expected, native: ['undefined', 'undefined'] })
})
