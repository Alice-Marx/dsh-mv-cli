import test from 'node:test'
import assert from 'node:assert/strict'
import { extractQuotes, formatTokens, parse, adaptInertBase64, sceneWrapper, SCENE_STAGES } from '../presets/ports/frostnova-web/build.mjs'
import { base64Bytes } from '../presets/ports/frostnova-web/offline-data.mjs'
import vm from 'node:vm'
test('FrostNova quotations remain exact static strings without executing input', () => {
  const quotes = {}, source = 'var SRC="real code\\nwith text"; var SELF="own source"; var unsafe = (()=>{throw new Error("must not execute")})();'
  const result = extractQuotes(source, 'src/ch/shot.js', quotes)
  assert.equal(result.count, 2)
  assert.deepEqual(quotes, { 'src/ch/shot.js:SRC': 'real code\nwith text', 'src/ch/shot.js:SELF': 'own source' })
  assert.ok(result.text.includes('quotedSources()["src/ch/shot.js:SRC"]'))
  assert.ok(result.text.includes('must not execute'))
})
test('FrostNova formatting preserves regex and nested template interpolation', () => {
  const source = 'function f(x){return `${x}tail ${`${x+1}inner`} suffix`;};const r=/[{};]/g; const s="{;}";'
  const ast = code => parse(code, { ecmaVersion: 'latest' })
  const value = code => {
    const node = ast(code).body[0].body.body[0].argument
    return node.quasis.map(q=>q.value.raw)
  }
  assert.deepEqual(value(formatTokens(source)), value(source))
  assert.ok(formatTokens(source).includes('new RegExp("[{};]","g")'))
  assert.ok(formatTokens(source).includes('"{;}"'))
})
test('FrostNova inert mesh tables need no atob or Host object', () => {
  const text = 'const b = Uint8Array.from(atob("AP8BAg==".replace(/\\s/g, "")), c => c.charCodeAt(0));'
  const adapted = adaptInertBase64(text, 'src/ch/title/cells.js')
  assert.equal(adaptInertBase64(text, 'src/player/vault.js'), text)
  assert.ok(!adapted.includes('atob('))
  const encoded = parse(adapted, { ecmaVersion: 'latest', sourceType: 'module' }).body[1].declarations[0].init.arguments[0].callee.object.value
  assert.deepEqual(Array.from(base64Bytes(encoded)), [0, 255, 1, 2])
  const original = vm.runInNewContext(text + '\nArray.from(b)', { atob: s => Buffer.from(s, 'base64').toString('binary') })
  assert.deepEqual(Array.from(original), Array.from(base64Bytes(encoded)))
})
test('the generated FrostNova adapter forwards every lifecycle stage, warmup included', () => {
  const scene = sceneWrapper('var __bundled = 1;')
  const declared = parse(scene, { ecmaVersion: 'latest', sourceType: 'script' }).body.filter(s => s.type === 'FunctionDeclaration').map(s => s.id.name)
  for (const stage of SCENE_STAGES) assert.ok(declared.includes(stage), `The generated adapter must forward ${stage}()`)
  // The worker only runs a stage it finds by name on the generated scene, so a
  // stage the bundled module exports but the wrapper omits is silently inert.
  for (const stage of ['setup', 'prepare', 'warmup', 'paint']) assert.ok(scene.includes(`__frostScene.${stage}(`), `${stage}() must reach the bundled scene`)
  assert.equal(SCENE_STAGES.length, 4)
})
