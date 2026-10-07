#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Corresponding-source build adapter, copyright 2026 Alice-Marx.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'
import { parse, tokenizer } from 'acorn'
import { transformCpuModule } from './cpu-prewarm.mjs'
export { parse }
import { parseLyricsJson } from '../../../.dsh-plugin/shared/mv-lyrics.mjs'
import { lyricsTiming } from '../../../.dsh-plugin/shared/mv-workshop-host.mjs'
import { checkScriptSafety, validateWorkshopPack } from '../../../.dsh-plugin/shared/mv-workshop.mjs'

export const UPSTREAM_COMMIT = '29aefca50e40c14498420e1c6e1f3a1037727e17'
export const ID = 'world-execute-me-frostnova'
const here = dirname(fileURLToPath(import.meta.url))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const pin = 'https://github.com/FrostNovaOrg/world-execute-web/tree/' + UPSTREAM_COMMIT
export const WORKSHOP_VERSION = '1.0.1'
const sourceUrl = `https://github.com/Alice-Marx/dsh-mv-workshop/releases/download/world-execute-me-frostnova-${WORKSHOP_VERSION}/20261007_frostnova-corresponding-source-${WORKSHOP_VERSION}.zip`

export function formatTokens(code) {
  // Insert whitespace only at parser-known punctuation, never inside literals,
  // regexes, shaders or template strings. Names and function source are not hidden.
  let last = 0, out = '', templates = []
  const tokens = tokenizer(code, { ecmaVersion: 'latest', sourceType: 'script' })
  for (let token = tokens.getToken(); token.type.label !== 'eof'; token = tokens.getToken()) {
    const label = token.type.label, top = templates.at(-1)
    if (label === 'regexp') { out += code.slice(last, token.start) + `(new RegExp(${JSON.stringify(token.value.pattern)},${JSON.stringify(token.value.flags)}))`; last = token.end }
    if (label === '`') { if (top?.phase === 'quasi') templates.pop(); else templates.push({ phase: 'quasi', depth: 0 }) }
    else if (label === '${' && top) { top.phase = 'expression'; top.depth = 0 }
    else if (label === '{' && top?.phase === 'expression') top.depth++
    else if (label === '}' && top?.phase === 'expression') { if (top.depth) top.depth--; else top.phase = 'quasi' }
    if (!templates.length && [';', ',', '{', '}'].includes(label)) { out += code.slice(last, token.end) + '\n'; last = token.end }
  }
  return out + code.slice(last)
}
export function extractQuotes(text, path, quotes) {
  const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' }), edits = []
  for (const statement of ast.body) {
    if (statement.type !== 'VariableDeclaration') continue
    for (const decl of statement.declarations) {
      if (decl.id.type !== 'Identifier' || !/^(?:__import_glob__\d+_\d+_|SELF|SRC)$/.test(decl.id.name) || decl.init?.type !== 'Literal' || typeof decl.init.value !== 'string') continue
      const key = `${path}:${decl.id.name}`
      quotes[key] = decl.init.value
      edits.push({ start: decl.init.start, end: decl.init.end, replacement: `quotedSources()[${JSON.stringify(key)}]` })
    }
  }
  for (const edit of edits.reverse()) text = text.slice(0, edit.start) + edit.replacement + text.slice(edit.end)
  return { text, count: edits.length }
}
export function adaptInertBase64(text, path) {
  if (!['src/ch/title/cells.js', 'src/ch/v1/ripples.js'].includes(path)) return text
  const calls = []
  const visit = node => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression'
      && node.callee.object.name === 'Uint8Array' && node.callee.property.name === 'from'
      && node.arguments[0]?.type === 'CallExpression' && node.arguments[0].callee.name === 'atob') calls.push(node)
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(parse(text, { ecmaVersion: 'latest', sourceType: 'module' }))
  assert.equal(calls.length, 1, `Expected one inert base64 byte table: ${path}`)
  const node = calls[0], input = node.arguments[0].arguments[0], mapper = node.arguments[1]
  assert.equal(mapper?.type, 'ArrowFunctionExpression')
  assert.equal(mapper.body?.callee?.property?.name, 'charCodeAt')
  assert.equal(mapper.body.arguments[0]?.value, 0)
  return `import { base64Bytes } from 'frost:offline-data';\n` + text.slice(0, node.start) + `base64Bytes(${text.slice(input.start, input.end)})` + text.slice(node.end)
}
function removeEngineMethods(text) {
  const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' })
  const engine = ast.body.find(row => row.type === 'VariableDeclaration' && row.declarations.some(d => d.id.name === 'Engine')).declarations.find(d => d.id.name === 'Engine').init
  for (const method of engine.body.body.filter(m => ['load', 'prewarm'].includes(m.key.name)).reverse()) text = text.slice(0, method.start) + text.slice(method.end)
  return text
}
function replaceRequired(text, from, to, name) {
  assert.ok(text.includes(from), `Upstream seam changed: ${name}`)
  return text.replace(from, to)
}
function compressedAssets(out, name, bytes, assets) {
  const data = gzipSync(bytes, { level: 9, mtime: 0 }), paths = []
  for (let offset = 0, part = 1; offset < data.length; offset += 350000, part++) {
    const path = `data/${name}-${part}.json`, text = JSON.stringify({ encoding: 'gzip', chunks: [data.subarray(offset, offset + 350000).toString('base64')] }) + '\n'
    assert.ok(Buffer.byteLength(text) < 512 * 1024)
    writeFileSync(join(out, path), text); paths.push(path)
  }
  assets[name] = paths.length === 1 ? paths[0] : paths
  return { sourceBytes: bytes.length, sourceSha256: sha(bytes), gzipBytes: data.length, files: paths }
}
// The worker discovers lifecycle stages by name on the generated scene, so a
// wrapper that forgets to forward one makes that stage permanently inert even
// though the bundled module exports it. Build the wrapper in one place and keep
// every stage listed here in step with the bundled scene.
export const SCENE_STAGES = ['setup', 'prepare', 'warmup', 'paint']
export function sceneWrapper(bundleText) {
  return `// SPDX-License-Identifier: AGPL-3.0-or-later\n// FrostNova world-execute-web ${UPSTREAM_COMMIT}; adapter Alice-Marx, modified 2026-10-07.\n// Corresponding Source: ${sourceUrl}\nlet __frostInitialAssets = null, __frostScene = null;\nfunction __makeFrostNova() {\n`
    + formatTokens(bundleText)
    + '\nreturn FrostNovaWorkshop;\n}\n'
    + `function setup(info, gl) { __frostInitialAssets = info.assets; __frostScene = __makeFrostNova(); return __frostScene.setup(info, gl); }\n`
    + `function prepare(info, gl) { return __frostScene.prepare(info, gl); }\n`
    + `function warmup(info, gl) { return __frostScene.warmup(info, gl); }\n`
    + `function paint(gl, t, w, h, ctx) { return __frostScene.paint(gl, t, w, h, ctx); }\n`
}
export async function buildPack(checkout, out, fontDir) {
  assert.ok(!existsSync(out), 'Choose a new output directory')
  if (existsSync(join(checkout, '.git'))) {
    assert.equal(execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), UPSTREAM_COMMIT)
  } else {
    const inventory = JSON.parse(readFileSync(join(checkout, 'UPSTREAM-FILES.json'), 'utf8'))
    assert.equal(inventory.commit, UPSTREAM_COMMIT)
    assert.ok(inventory.files.length > 100, 'Expected complete pinned upstream inventory')
    for (const file of inventory.files) {
      assert.ok(!file.path.includes('..') && !file.path.startsWith('/') && !file.path.includes('\\'), 'Invalid inventory path')
      assert.equal(sha(readFileSync(join(checkout, file.path))), file.sha256, `Upstream bytes changed: ${file.path}`)
    }
  }
  const quotes = Object.create(null), modules = Object.create(null), transformed = new Map()
  const src = path => readFileSync(join(checkout, path), 'utf8').replace(/\r\n/g, '\n')
  const adapt = path => {
    if (transformed.has(path)) return transformed.get(path)
    const original = src(path)
    let text = adaptInertBase64(transformCpuModule(original, path), path)
    if (path.startsWith('src/player/') || path === 'index.html.js') throw new Error('Song/browser bootstrap must not enter the rendering bundle')
    if (path === 'src/engine/engine.js') {
      text = text.replace(/^const __vite__mapDeps[^\n]*\n/, '').replace(/^import \{ __vitePreload \}[^\n]*\n/m, '')
      text = removeEngineMethods(text)
      text = text.replaceAll('performance.now()', '(typeof performance === "undefined" ? Date.now() : performance.now())')
      text = replaceRequired(text, 'preserve = true, fonts,', 'preserve = true, context, fonts,', 'Engine context argument')
      text = replaceRequired(text, '\t\t\tcanvas,', '\t\t\tcanvas, context,', 'Three supplied context')
      text = replaceRequired(text, 'this.renderer.setSize(w, h, false);', '// Output size is owned by the supervisor; only internal targets change here.', 'internal target resize')
      text = replaceRequired(text, 'if (!lead.ownsLyrics) drawLyrics(this.text.overlay, this.T, t);', 'if (!lead.ownsLyrics) drawLyrics(this.text.overlay, this.T, t);\n        drawChinese(this.text.overlay, this.T, t);', 'native Chinese subtitle layer')
      text = `import { drawChinese } from 'frost:resources';\n` + text
    }
    const extracted = extractQuotes(text, path, quotes)
    text = extracted.text
    if (extracted.count) text = `import { quotedSources } from 'frost:resources';\n` + text
    if (path === 'src/ch/10_bridge.js') {
      const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' })
      const declaration = ast.body.find(s => s.type === 'VariableDeclaration' && s.declarations.some(d => d.id.name === 'reassignGod'))
      assert.ok(declaration, 'Expected const-assignment error probe')
      text = text.slice(0, declaration.start) + 'function reassignGod() { throw new TypeError("Assignment to constant variable."); }' + text.slice(declaration.end)
    }
    if (path === 'src/engine/post.js') text = replaceRequired(text, 'structuredClone(POST_DEFAULTS)', '(typeof structuredClone === "undefined" ? JSON.parse(JSON.stringify(POST_DEFAULTS)) : structuredClone(POST_DEFAULTS))', 'plain post defaults clone for Host VM')
    // Three's frozen curve namespace is a null-prototype dictionary, not a
    // capability escape. Preserve that semantics with an explicit constructor.
    text = text.replace(/Object\.freeze\(\{\s*__proto__:\s*null,([\s\S]*?)\}\)/g, 'Object.freeze(Object.assign(Object.create(null), {$1}))')
    text = text.replace(/document\.createElement\(["']canvas["']\)/g, 'makeCanvas()')
    if (path === 'src/engine/text.js') {
      const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' }), load = ast.body.find(s => s.type === 'FunctionDeclaration' && s.id.name === 'loadFonts')
      assert.ok(load); text = text.slice(0, load.start) + 'function loadFonts() {}' + text.slice(load.end)
      text = replaceRequired(text, 'delete this.g.fillText;\n\t\t\tdelete this.g.strokeText;', 'restoreText(this.g);', 'font wrapper restoration')
    }
    text = text.replace(/globalThis\.__QUOTES/g, 'undefined')
    if (text.includes('makeCanvas()') || text.includes('restoreText(this.g)')) text = `import { makeCanvas, restoreText } from 'frost:fonts';\n` + text
    modules[path] = { originalSha256: sha(original), adaptedSha256: sha(text), changed: text !== original, quoteCount: extracted.count }
    transformed.set(path, text)
    return text
  }
  const chapters = readdirSync(join(checkout, 'src/ch')).filter(p => /^\d\d_.*\.js$/.test(p)).sort()
  assert.equal(chapters.length, 17)
  const bundle = await build({ entryPoints: [join(here, 'scene.mjs')], bundle: true, format: 'iife', globalName: 'FrostNovaWorkshop', write: false, platform: 'browser', target: 'es2022', supported: { 'template-literal': false }, charset: 'utf8', minify: true, keepNames: true, legalComments: 'eof', metafile: true,
    define: { window: 'undefined', document: 'undefined', self: 'undefined' },
    plugins: [{ name: 'frostnova-offline', setup(b) {
      b.onResolve({ filter: /^frost:fonts$/ }, () => ({ path: join(here, 'fonts/runtime.mjs') }))
      b.onResolve({ filter: /^frost:resources$/ }, () => ({ path: join(here, 'resource-runtime.mjs') }))
      b.onResolve({ filter: /^frost:offline-data$/ }, () => ({ path: join(here, 'offline-data.mjs') }))
      b.onResolve({ filter: /^frost:chapters-static$/ }, () => ({ path: 'chapters-static', namespace: 'frost-static' }))
      b.onLoad({ filter: /.*/, namespace: 'frost-static' }, () => ({ contents: chapters.map(p => `import 'frost:src/ch/${p}';`).join('\n'), loader: 'js' }))
      b.onResolve({ filter: /^frost:src\// }, args => ({ path: args.path.slice(6), namespace: 'frost-upstream' }))
      b.onResolve({ filter: /^\./, namespace: 'frost-upstream' }, args => ({ path: join(dirname(args.importer), args.path.split('?')[0]).replace(/\\/g, '/'), namespace: 'frost-upstream' }))
      b.onLoad({ filter: /.*/, namespace: 'frost-upstream' }, args => ({ contents: adapt(args.path), loader: 'js', resolveDir: checkout }))
    } }],
  })
  const scene = sceneWrapper(bundle.outputFiles[0].text)
  if (process.env.FROST_DEBUG_SCENE) writeFileSync(process.env.FROST_DEBUG_SCENE, scene)
  const checkedScript = checkScriptSafety(scene, 'scenes.js', { mode: 'webgl' })
  assert.deepEqual(checkedScript.errors, [])
  // The worker only runs a lifecycle stage the generated adapter actually
  // declares, so a wrapper that forgets to forward one is silently inert.
  const declared = new Set(parse(scene, { ecmaVersion: 'latest', sourceType: 'script' }).body.filter(s => s.type === 'FunctionDeclaration').map(s => s.id.name))
  for (const stage of SCENE_STAGES) assert.ok(declared.has(stage), `The generated adapter must forward ${stage}()`)
  assert.ok(!Object.keys(modules).some(p => p.startsWith('src/player/')))
  mkdirSync(join(out, 'data'), { recursive: true }); mkdirSync(join(out, 'licenses'))
  writeFileSync(join(out, 'scenes.js'), scene)
  const assets = { captions: 'lyrics.json', onsets: 'data/onsets.json', 'feature-meta': 'data/features.json' }
  const featureBytes = readFileSync(join(checkout, 'data/features.f32'))
  assert.equal(sha(featureBytes), 'f7617fc0f6c5806590e247c4046b55ef15f5ae2d58fc55d55b8280099894eae1')
  const featureProvenance = compressedAssets(out, 'features', featureBytes, assets)
  const quoteProvenance = compressedAssets(out, 'quotes', Buffer.from(JSON.stringify(quotes)), assets)
  for (const path of ['onsets.json', 'features.json']) writeFileSync(join(out, 'data', path), src(`data/${path}`))
  const timing = JSON.parse(src('data/timing.json')), translation = JSON.parse(src('assets/subs/zh.json'))
  assert.equal(timing.lines.length, 129)
  const cues = parseLyricsJson(timing.lines.map((l, i) => ({ time: l.start, end: l.end, en: l.text, zh: translation.lines[i] || '', words: l.words.map(w => ({ text: w.text, time: w.start })) })), { duration: timing.audio.duration })
  writeFileSync(join(out, 'lyrics.json'), JSON.stringify({ lyrics: cues, timing, translation }) + '\n')
  writeFileSync(join(out, 'lyrics.timing.json'), JSON.stringify(lyricsTiming(cues)) + '\n')
  for (const name of readdirSync(fontDir).filter(n => n.endsWith('.json'))) {
    const json = JSON.parse(readFileSync(join(fontDir, name), 'utf8'))
    if (json.format !== 'frostnova-font-masks') continue
    const key = name.replace(/\.json$/, '')
    copyFileSync(join(fontDir, name), join(out, 'data', name)); assets[key] = `data/${name}`
  }
  assert.ok(Object.keys(assets).some(k => k.startsWith('font-')), 'Bake OFL fonts before building a pack')
  for (const [from, to] of [ ['LICENSE', 'LICENSE.txt'], ['NOTICE.md', 'licenses/UPSTREAM-NOTICE.md'], ['NOTICE.zh-CN.md', 'licenses/UPSTREAM-NOTICE.zh-CN.md'], ['vendor/three/LICENSE', 'licenses/THREE-MIT.txt'] ]) writeFileSync(join(out, to), src(from))
  const fontNotices = ['JetBrainsMono', 'SpaceGrotesk', 'NotoSansSC'].map(name => `===== Original ${name} =====\n${src(`assets/fonts/${name}-OFL.txt`)}`)
  for (const name of readdirSync(fontDir).filter(n => n.endsWith('.txt')).sort()) fontNotices.push(`===== ${name} =====\n${readFileSync(join(fontDir,name),'utf8')}`)
  writeFileSync(join(out, 'licenses/FONTS-OFL.txt'), fontNotices.join('\n\n') + '\n')
  copyFileSync(join(fontDir, 'FONT-MASKS.md'), join(out, 'licenses/FONT-MASKS.md'))
  copyFileSync(join(fontDir, 'font-provenance.json'), join(out, 'licenses/FONT-PROVENANCE.json'))
  copyFileSync(join(checkout, 'assets/web/cover-16x9.jpg'), join(out, 'cover.jpg'))
  const terms = 'https://projectmili.com/copyright-guidelines'
  const manifest = { format: 'dsh-mv-pack', version: 1, title: 'world.execute(me); · FrostNova 实时 3D MV', artist: 'Mili', duration: timing.audio.duration,
    credits: ['Visuals — Claude Opus 5.5 Max; Copyright (C) 2026 FrostNova, AGPL-3.0-or-later', 'Worker adaptation © 2026 Alice-Marx, AGPL-3.0-or-later, modified 2026-10-07', 'Three.js contributors, MIT; offline font glyph masks from separately licensed OFL fonts', 'Mili and their rights holders: song text and official Chinese translation, NOT AGPL; music recording not included', 'Claude name and logo: Anthropic trademarks; no endorsement'],
    notice: 'Unofficial AI-assisted fan MV. Photosensitivity warning: rapid flashing and cuts. Choose only your own music. Original English/Chinese captions are static data. See NOTICE.md and Corresponding Source.',
    lyrics: { file: 'lyrics.json', offset: 0 },
    canvas: { renderer: 'script', script: 'scenes.js', output: 'webgl', size: [960, 540], subtitles: false, assets },
    'x-dsh-mv-ai': { sections: timing.sections.map(s => ({ kind: ['c1','c2','c3'].includes(s.id) ? 'chorus' : s.id === 'outro' ? 'outro' : s.id === 'intro' ? 'intro' : ['bridge','chant'].includes(s.id) ? 'bridge' : 'verse', label: s.label || s.id, start: s.start, end: s.end })) },
    'x-dsh-mv-workshop': { id: ID, version: '1.0.0', requires: '0.9.5', author: 'Alice-Marx', license: 'AGPL-3.0-or-later AND LicenseRef-Mili-NonCommercial-FanWork', source: pin, homepage: `https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/${ID}`, description: 'FrostNova 原作实时3D完整非音乐适配：305镜头、16章、逐词英文与官方中文、60Hz分析、代码字形和离线OFL字体素材随包提供。音乐自备，非官方AI辅助同人MV；需插件0.9.5。', tags: ['world.execute(me)', 'Mili', 'frostnova', 'three.js', '3d', 'webgl'], publishedAt: '2026-10-07', lyricsLicense: 'LicenseRef-Mili-NonCommercial-FanWork', lyricsCredit: 'Mili / rights holders: song text and official Chinese translation; timing from FrostNovaOrg/world-execute-web', lyricsSource: terms, lyricsTiming: 'lyrics.timing.json' },
  }
  manifest['x-dsh-mv-workshop'].requires = '0.9.7'
  manifest['x-dsh-mv-workshop'].version = WORKSHOP_VERSION
  manifest['x-dsh-mv-workshop'].description = manifest['x-dsh-mv-workshop'].description.replace('0.9.5', '0.9.7')
  writeFileSync(join(out, 'mv.json'), JSON.stringify(manifest, null, 2) + '\n')
  writeFileSync(join(out, 'LYRICS-NOTICE.md'), `# Song text and official Chinese translation\n\nMili and their rights holders own the English song text (including code-form lyric text) and official Chinese translation. Neither AGPL nor font OFL licenses these texts. Retained unchanged from ${pin}; timing and analysis are by FrostNova.\n\nThis free, non-commercial unofficial AI-assisted fan MV uses the previously confirmed fan-work scope under ${terms} (checked 2026-10-07). No recording, audio key, encrypted song part or official cover artwork is included. Commercial or broader use of these texts needs the rights holders' own permission. This restriction applies to song text, not to the AGPL software grant.\n`)
  writeFileSync(join(out, 'NOTICE.md'), `# Attribution, changes and source offer\n\nCopyright (C) 2026 FrostNova; Visuals — Claude Opus 5.5 Max. Original ${pin}. AGPL-3.0-or-later code and program-generated pictures; LICENSE.txt reproduces the full grant. Modified 2026-10-07 by Alice-Marx; the worker adapter is also AGPL-3.0-or-later.\n\nFree complete Corresponding Source download: ${sourceUrl}\nBuild adapter source: https://github.com/Alice-Marx/dsh-mv-cli/tree/main/presets/ports/frostnova-web\nThe source includes fixed upstream modules, patch/build logic, unminified adapter, fonts/mask builder, exact analysis inputs and build instructions. Anyone interacting with this adapted program can obtain it without charge.\n\nChanges: static 17 chapter registration, main edit's 305 shots/16 active chapters retained; network/DOM/player/vault bootstrap and asynchronous load/prewarm removed; all 2D texture canvases use offline OFL glyph masks; original quoted source strings and exact Float32 analysis restored from bounded gzip JSON chunks; original rig, draw/shader/pointcut/bloom algorithms and English word timing retained. Original Chinese subtitle schedule/rules/style composited offline. Output fixed at 960×540, initial internal render 640×360, bounded adaptive reduction to 320×180, realtime motion-blur cap 1. Negative-time 5-second warning source retained but song clock starts at zero; the photosensitivity warning is displayed in package documentation. No conversion to flat video or replacement generic geometry.\n\nThree.js and fflate retain their MIT notices in licenses/; OFL fonts/glyph-mask sources retain their own full notices and compatibility mappings. No Windows/Apple font file or proprietary per-glyph font atlas is distributed. Mili lyrics and official translation are separate: LYRICS-NOTICE.md. Claude name/logo are Anthropic trademarks, not licensed by AGPL; this fan adaptation does not imply sponsorship. Preserve upstream notices in licenses/.\n`)
  writeFileSync(join(out, 'README.md'), `# ${manifest.title}\n\nInstall dsh-mv-cli **0.9.5+**, refresh the workshop, and select only your own music. This is FrostNova's original live WebGL2/Three.js rendering, not a 2D substitute: the main edit has 305 shots across 16 chapters; camera rigs, procedural geometry, GLSL, bloom/pointcut, 60Hz stem/mel analysis, all original code quotations, 129 line indices with word timing and official Chinese captions are included offline.\n\n光敏警告：含快速闪烁、强对比与快速切镜。如对闪光敏感，请勿播放。歌曲从0秒对齐，原网页5秒负时间预警不插入音乐时间。需要WebGL2和EXT_color_buffer_float；兼容输出960×540，内部自适应，不宣称网页原生4K。中文原布局/淡入淡出随场景绘制；插件歌词会自动读取，不叠加重复字幕。\n\nAI visuals are credited to Claude Opus 5.5 Max; adaptation is unofficial. Music is not included and no original-site key/audio service is contacted. AGPL code/visuals, MIT libraries, OFL font-derived masks, Mili texts and Anthropic trademarks have distinct terms; only the song-text reuse is scoped to non-commercial fan work. See NOTICE.md, LICENSE.txt and licenses/.\n\n**Complete Corresponding Source, free download:** ${sourceUrl}\nUpstream fixed source: ${pin}\nAdapter/build source: https://github.com/Alice-Marx/dsh-mv-cli/tree/main/presets/ports/frostnova-web\n`)
  const fflateLicense = readFileSync(join(here, 'node_modules/fflate/LICENSE'), 'utf8')
  for (const name of ['README.md', 'NOTICE.md']) {
    const path = join(out, name)
    writeFileSync(path, readFileSync(path, 'utf8').replace(/0\.9\.5/g, '0.9.7') + '\nPlugin 0.9.6 adds bounded synchronous-generator preparation. The original start/middle/end/transition prewarm is performed per shot before music starts, preserving the original 2048-square galaxy map and all particle counts. The bridge dynamic const-assignment probe is replaced by a static TypeError with the same intended message; original quoted code remains unchanged.\nPlugin 0.9.7 adds a warmup() stage that runs after preparation and before playback at the final 640×360 internal size, so the opening frames no longer pay shader-compile and render-target cost inside the realtime frame watchdog. Shot count, chapter layout, particle counts and per-shot prewarm times are unchanged; the original quoted source is unchanged.\n')
  }
  writeFileSync(join(out, 'licenses/FFLATE-MIT.txt'), fflateLicense)
  const provenance = { repo: 'https://github.com/FrostNovaOrg/world-execute-web', commit: UPSTREAM_COMMIT, adaptedOn: '2026-10-07', sourceUrl, edit: 'main', chapters: 16, registeredModules: 17, expectedShots: 305, duration: timing.audio.duration, originalLineIndices: 129, cueCount: cues.length, bundleSha256: sha(scene), bundleBytes: Buffer.byteLength(scene), features: featureProvenance, quotes: { ...quoteProvenance, count: Object.keys(quotes).length }, modules: Object.fromEntries(Object.entries(modules).sort(([a],[b]) => a.localeCompare(b,'en'))), noAudioOrKeyService: true, fontSources: Object.keys(assets).filter(k => k.startsWith('font-')) }
  writeFileSync(join(out, 'source-provenance.json'), JSON.stringify(provenance, null, 2) + '\n')
  const files = []
  const collect = (dir, prefix='') => { for (const row of readdirSync(dir, { withFileTypes: true })) { const path=[prefix,row.name].filter(Boolean).join('/'); if(row.isDirectory())collect(join(dir,row.name),path);else{const bytes=readFileSync(join(dir,row.name)); files.push({path,size:bytes.length,sha256:sha(bytes)})} } }
  collect(out)
  const checked = await validateWorkshopPack({ id: ID, files, readText: async p => readFileSync(join(out,p),'utf8'), readBytes: async p => readFileSync(join(out,p)) })
  assert.deepEqual(checked.errors, [])
  return { out, files: files.length, bytes: files.reduce((n,f)=>n+f.size,0), bundleBytes: Buffer.byteLength(scene), cues: cues.length, quoteCount: Object.keys(quotes).length, warnings: checked.warnings }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [checkout, out, fonts] = process.argv.slice(2)
  assert.ok(checkout && out && fonts, 'usage: node build.mjs <fixed-upstream-checkout> <new-output-dir> <baked-font-dir>')
  console.log(JSON.stringify(await buildPack(resolve(checkout), resolve(out), resolve(fonts))))
}
