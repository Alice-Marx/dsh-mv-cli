#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright 2026 Alice-Marx. Pinned MIT source by Nyankomint;
// character artwork/output, fonts and captions have independent licences.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { build } from 'esbuild'
import { parse } from 'acorn'
export { parse }
import { lyricsTiming } from '../../../.dsh-plugin/shared/mv-workshop-host.mjs'
import { checkScriptSafety } from '../../../.dsh-plugin/shared/mv-workshop.mjs'

export const UPSTREAM_COMMIT = '2073b0c88c6fc837482478402a44f101b3b57d6f'
export const ID = 'world-execute-me-nyankomint'
export const WORKSHOP_VERSION = '1.0.0'
export const SOURCE = `https://github.com/Nyankomintsu/world-execute-me-lyric-mv/tree/${UPSTREAM_COMMIT}`
export const SECTIONS = [
  ['01_boot.js', 'bootShots'], ['02_title.js', 'titleShots'], ['03_verse1.js', 'verse1Shots'],
  ['04_pre1.js', 'pre1Shots'], ['05_chorus.js', 'chorusShots'], ['06_verse2.js', 'verse2Shots'],
  ['07_pre2.js', 'pre2Shots'], ['08_chorus2.js', 'chorus2Shots'], ['09_alone.js', 'aloneShots'],
  ['10_error.js', 'errorShots'], ['11_execution.js', 'executionShots'], ['11_count.js', 'countShots'],
  ['12_chorusx.js', 'chorusXShots'], ['12_outro.js', 'outroShots'], ['13_shutdown.js', 'shutdownShots'],
]
export const ART_NAMES = ['f_bust', 'f_profile', 'f_reach', 'f_eye', 'boy_bust', 'man_bust', 'cat_bust', 'cat_paws']
export const CHAPTERS = [
  [['boot'], 'intro', '启动'], [['title', 'chat'], 'intro', '标题与第一个问题'],
  [['v1'], 'verse', '主歌一：用数学回答'], [['pre1'], 'verse', '导歌一：设置被切换'],
  [['c1'], 'chorus', '副歌一：对话与四张版画'], [['v2'], 'verse', '主歌二：三个名词与校样'],
  [['pre2'], 'verse', '导歌二：设置改变她本人'], [['c2', 'left', 'alone'], 'chorus', '副歌二 / 空线程'],
  [['err', 'crash'], 'bridge', '越界 / 错误 / 扩散'], [['exec'], 'bridge', 'EXECUTION'],
  [['count', 'last'], 'bridge', '数数与最后一声'], [['cx'], 'chorus', '最后副歌：坏掉的版画'],
  [['out'], 'outro', 'LOVE：课 / 测验 / 公式 / 证明'], [['down'], 'outro', '未读图片 / 逆向关机'],
]
const here = dirname(fileURLToPath(import.meta.url))
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const put = (dir, path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text) }
const json = value => JSON.stringify(value, null, 2) + '\n'

/** Chapter navigation uses the original cut times, not rounded storyboard text. */
export function chapterMetadata(shots, duration) {
  const classified = new Set()
  const sections = CHAPTERS.map(([prefixes, kind, label]) => {
    const rows = shots.filter(s => prefixes.some(p => s.id === p || s.id.startsWith(p + '-')))
    assert.ok(rows.length, 'Missing original chapter: ' + label)
    rows.forEach(s => classified.add(s.id))
    return { kind, label, start: rows[0].at, end: Math.min(duration, rows.at(-1).until) }
  })
  assert.equal(classified.size, shots.filter(s => s.id !== 'preroll').length, 'Unclassified original shot')
  assert.equal(sections[0].start, 0)
  assert.equal(sections.at(-1).end, duration)
  sections.slice(1).forEach((s, i) => assert.equal(s.start, sections[i].end, 'Chapter boundaries must be continuous'))
  return sections
}

async function originalShots(checkout, cfg, data, captions) {
  const mod = path => import(pathToFileURL(join(checkout, path)).href)
  const [{ Features }, { Lyrics }, { sequence }, { prerollShot }] = await Promise.all([
    mod('src/engine/features.js'), mod('src/engine/lyrics.js'), mod('src/scenes/shot.js'), mod('src/scenes/overlay.js'),
  ])
  const features = new Features(data, cfg), lyrics = new Lyrics(captions, cfg, features)
  const env = { cfg, features, lyrics, art: new Proxy({}, { get: () => () => null }),
    script: readJson(join(checkout, 'docs/v4/chat_script.json')), errors: readJson(join(checkout, 'docs/v4/errors.json')) }
  const definitions = []
  for (const [file, fn] of SECTIONS) definitions.push(...(await mod('src/scenes/' + file))[fn](env))
  definitions.push(prerollShot(env))
  const shots = sequence(definitions, features.duration + 1)
  assert.equal(shots.length, 87)
  assert.deepEqual(shots.filter(s => s.id.startsWith('todo-') || !s.moment).map(s => s.id), [], 'No fallback or missing narrative moment')
  const covered = new Set(shots.flatMap(s => s.lines ? Array.from({ length: s.lines[1] - s.lines[0] + 1 }, (_, i) => s.lines[0] + i) : []))
  assert.equal(covered.size, 129, 'Every original lyric line must have a shot')
  return shots.map(({ render, ...s }) => s)
}

function replaceRequired(text, from, to, seam) {
  assert.ok(text.includes(from), `Pinned source seam changed: ${seam}`)
  return text.replace(from, to)
}

function removeDeclarations(text, names) {
  const ast = parse(text, { ecmaVersion: 'latest', sourceType: 'module' })
  const cuts = []
  for (const statement of ast.body) {
    const row = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement
    const ids = row?.type === 'FunctionDeclaration' ? [row.id.name] : row?.type === 'VariableDeclaration' ? row.declarations.map(d => d.id.name) : []
    if (ids.some(id => names.includes(id))) { assert.ok(ids.every(id => names.includes(id))); cuts.push(statement) }
  }
  for (const cut of cuts.reverse()) text = text.slice(0, cut.start) + text.slice(cut.end)
  return text
}

export function staticSceneRegistry() {
  return `// Fixed synchronous registry: original scene functions/order, no import(), fallback or loaders.\n`
    + SECTIONS.map(([file, fn]) => `import {${fn}} from './${file}';`).join('\n')
    + `\nimport {sequence} from './shot.js';\nimport {overlayScene,prerollShot} from './overlay.js';\n`
    + `import {initHistory} from './history.js';\n`
    + `export function buildShots(env) { initHistory(); const defs=[${SECTIONS.map(([, fn]) => `...${fn}(env)`).join(',')}];`
    + `const pre=prerollShot(env);if(pre)defs.push(pre);return sequence(defs,env.features.duration+1);}\n`
    + `export function buildScenes(env) {return [...buildShots(env),overlayScene(env)];}\n`
}

/** Small explicit loader/canvas seams only; the complete scene/math/post code is retained. */
export function adaptModule(original, path) {
  let text = original.replace(/\r\n/g, '\n')
  if (path === 'src/scenes/index.js') return staticSceneRegistry()
  if (path === 'src/engine/engine.js') {
    text = removeDeclarations(text, ['loadFonts', 'loadSteps', 'getJson'])
    text = replaceRequired(text, "import { loadArt, ART_NAMES } from './art.js';", '', 'removed HTML art loader import')
    text = replaceRequired(text, 'export async function createEngine({ canvas, width, height, cfg, featuresData, lyricsData, flipY = false, lab = null, onStep = null })',
      'export function createEngine({ canvas, width, height, cfg, featuresData, lyricsData, art, script, errors, flipY = false, onStep = null })', 'synchronous engine inputs')
    text = replaceRequired(text, "const [, art, script, errors] = await Promise.all([loadFonts(cfg, step), loadArt(cfg, step), getJson(cfg.paths.script), getJson(cfg.paths.errors)]);", '', 'offline assets')
    text = replaceRequired(text, 'await buildScenes({ cfg, features, lyrics, art, script: script ?? {}, errors: errors ?? {} }, { lab })',
      'buildScenes({ cfg, features, lyrics, art, script: script ?? {}, errors: errors ?? {} })', 'synchronous scenes')
    text = replaceRequired(text, "await step('scenes');", "step('scenes');", 'progress')
    text = replaceRequired(text, 'preroll: lab ? 0 : cfg.safety.preroll ?? 0,', 'preroll: cfg.safety.preroll ?? 0,', 'negative song time warning')
    // The source writes an error card and continues, which can hide lost shots.
    // In this verified adaptation errors surface to the supervisor instead.
    text = replaceRequired(text, 'layer.g.reset();\n      layer.begin(tv, f, layer.videoTime, layer.fx);\n      layer.clear();\n      layer.text(`shot "${sc.id}" failed: ${e.message}`, 80, 540, { size: 28, font: \'mono\', color: \'err\' });',
      'throw new Error(`shot "${sc.id}" failed: ${e.message}`);', 'no silent error-card fallback')
  }
  if (path === 'src/engine/art.js') {
    text = removeDeclarations(text, ['loadArt'])
    text = replaceRequired(text, 'const W = img.naturalWidth, H = img.naturalHeight, N = W * H;', 'const W = img.width, H = img.height, N = W * H;', 'ImageBitmap dimensions')
  }
  if (path === 'src/scenes/history.js') {
    // Original dynamic section imports happen AFTER createEngine sets cfg.seed.
    // A static bundle must defer this one seeded module initializer too.
    text = replaceRequired(text, 'const ROOFS = (() => {', 'let ROOFS;\nexport function initHistory() { ROOFS = (() => {', 'seeded history init')
    text = replaceRequired(text, '})();\n\n/**\n * The strip,', '})(); }\n\n/**\n * The strip,', 'seeded history boundary')
  }
  text = text.replace(/document\.createElement\(['"]canvas['"]\)/g, 'new OffscreenCanvas(8, 8)')
  return text
}

/** Normal JSON shards: merging top-level arrays reconstructs every numeric value exactly. */
export function featureShards(data, maxBytes = 500 * 1024) {
  const fixed = Object.fromEntries(Object.entries(data).filter(([, value]) => !Array.isArray(value)))
  const shards = [fixed]
  for (const [key, values] of Object.entries(data).filter(([, value]) => Array.isArray(value))) {
    let start = 0
    while (start < values.length) {
      let end = Math.min(values.length, start + 90000)
      while (Buffer.byteLength(JSON.stringify({ [key]: values.slice(start, end) })) > maxBytes) end = start + Math.floor((end - start) / 2)
      assert.ok(end > start)
      shards.push({ [key]: values.slice(start, end) }); start = end
    }
    if (!values.length) shards.push({ [key]: [] })
  }
  assert.ok(shards.every(s => Buffer.byteLength(JSON.stringify(s)) + 1 <= maxBytes))
  assert.ok(shards.length <= 16, 'Feature shards exceed the unchanged asset-part budget')
  return shards
}

export function unicodeCovered(range, point) {
  return range.split(',').some(part => {
    const match = /^\s*U\+([0-9A-F?]+)(?:-([0-9A-F]+))?\s*$/i.exec(part)
    if (!match) return false
    const low = parseInt(match[1].replaceAll('?', '0'), 16)
    const high = parseInt(match[2] || match[1].replaceAll('?', 'F'), 16)
    return point >= low && point <= high
  })
}

/** Copy the same unmodified Fontsource bytes, selecting CJK CSS ranges the source loads. */
export function copyFonts(cfg, out, fontRoot = join(here, 'node_modules/@fontsource')) {
  const faces = [], files = new Map(), packages = new Map()
  const add = (pkg, family, path, weight, style, unicodeRange) => {
    assert.equal(readJson(join(fontRoot, pkg, 'package.json')).version, '5.3.0', 'Font provenance requires exactly Fontsource 5.3.0: ' + pkg)
    const file = `fonts/${path.split('/').at(-1)}`, licenseFile = `fonts/OFL-${pkg}.txt`
    if (!files.has(file)) { const bytes = readFileSync(join(fontRoot, pkg, path)); put(out, file, bytes); files.set(file, { file, size: bytes.length, sha256: sha256(bytes), package: `@fontsource/${pkg}@5.3.0`, source: path }) }
    if (!packages.has(pkg)) {
      const license = readFileSync(join(fontRoot, pkg, 'LICENSE'), 'utf8')
      assert.match(license, /SIL\s+OPEN\s+FONT\s+LICENSE/)
      assert.match(license, /Version\s+1\.1/)
      put(out, licenseFile, license)
      packages.set(pkg, { package: `@fontsource/${pkg}@5.3.0`, licenseFile, licenseSha256: sha256(license), source: `https://www.npmjs.com/package/@fontsource/${pkg}/v/5.3.0` })
    }
    const face = { family, file, weight: String(weight), style, ...(unicodeRange ? { unicodeRange } : {}), licenseFile }
    if (!faces.some(f => JSON.stringify(f) === JSON.stringify(face))) faces.push(face)
  }
  for (const role of ['mono', 'serif', 'sans']) {
    const { family, pkg, weights, italic = [] } = cfg.fonts[role]
    for (const [style, list] of [['normal', weights], ['italic', italic]]) for (const weight of list)
      add(pkg, family, `files/${pkg}-latin-${weight}-${style}.woff2`, weight, style)
  }
  for (const { pkg, family, weight, text, role } of cfg.fonts.cjk) {
    const css = readFileSync(join(fontRoot, pkg, `${weight}.css`), 'utf8')
    const points = [...new Set([...text].map(c => c.codePointAt(0)))], covered = new Set()
    for (const [, block] of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      const unicodeRange = /unicode-range:\s*([^;]+);/.exec(block)?.[1]
      const file = /url\(\.\/([^)]*\.woff2)\)/.exec(block)?.[1]
      if (!unicodeRange || !file) continue
      const hits = points.filter(p => unicodeCovered(unicodeRange, p))
      if (hits.length) { add(pkg, family, file, weight, 'normal', unicodeRange); hits.forEach(p => covered.add(p)) }
    }
    assert.equal(covered.size, points.length, `CJK role ${role} contains unavailable glyphs`)
  }
  assert.ok(faces.length <= 64, 'Font descriptors exceed the bounded font protocol')
  assert.ok([...files.values()].every(f => f.size <= 2 * 1024 * 1024))
  const bytes = [...files.values()].reduce((n, f) => n + f.size, 0)
  assert.ok(bytes <= 12 * 1024 * 1024)
  put(out, 'fonts/NOTICE.md', '# Offline OFL font sources\n\nUnmodified Fontsource 5.3.0 font binaries. Sources/face descriptors and SHA-256 are in font-provenance.json.\n\nJetBrains Mono: JetBrains; Source Serif 4: Adobe / Frank Grie\u00dfhammer; Inter: Rasmus Andersson; Noto Sans/Serif KR/TC: Google / Adobe and contributors. Each original OFL 1.1 and copyright statement is retained separately. No Windows proprietary fonts.\n')
  const provenance = { format: 'nyankomint-offline-fonts', version: 1, faces, files: [...files.values()], packages: [...packages.values()], bytes }
  put(out, 'fonts/font-provenance.json', json(provenance))
  return provenance
}

export async function buildPack(checkout, out, { lyricsSource, fontRoot } = {}) {
  checkout = resolve(checkout); out = resolve(out)
  assert.ok(!existsSync(out), 'Choose a new output directory; existing outputs are never overwritten')
  assert.equal(execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), UPSTREAM_COMMIT)
  assert.equal(execFileSync('git', ['-C', checkout, 'status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' }).trim(), '', 'Pinned upstream must be clean; do not label modified source as the original commit')
  assert.ok(lyricsSource, 'Supply an existing locally authorised caption file; no lyrics are fetched by this builder')
  const src = path => readFileSync(join(checkout, path), 'utf8')
  const cfg = readJson(join(checkout, 'config.json')), features = readJson(join(checkout, 'data/audio_features.json'))
  const table = readJson(join(checkout, 'data/lyric_timing.json')), originalCaptions = readJson(resolve(lyricsSource))
  const localLines = originalCaptions.timing?.lines || originalCaptions.lines || (Array.isArray(originalCaptions) ? originalCaptions : originalCaptions.lyrics)
  assert.ok(localLines?.length)
  const lyricText = localLines.map(l => l.text || l.en || '').join('\n')
  const { fill } = await import(pathToFileURL(join(checkout, 'tools/fill_lyrics.mjs')).href)
  const { lyrics, report: alignment } = fill(table, Buffer.from(lyricText), 'Existing local licensed workshop captions')
  assert.equal(lyrics.lines.length, 129)
  for (const key of ['missing', 'wording', 'resplit', 'spelling']) assert.deepEqual(alignment[key], [], 'Lyric alignment must exactly match: ' + key)
  assert.equal(alignment.exact, 129)
  // English is exactly the maker's hashed line spelling. Optional local Chinese
  // captions remain separately attributed and do not alter the original layout.
  const translations = originalCaptions.translation?.lines || []
  const cues = lyrics.lines.map((l, i) => ({ time: l.start, end: l.end, en: l.text, zh: translations[i] || '' }))
  const shots = await originalShots(checkout, cfg, features, lyrics)
  const chapters = chapterMetadata(shots, features.meta.duration)
  const modules = {}, changed = []
  const bundle = await build({ entryPoints: [join(here, 'scene.mjs')], bundle: true, write: false, format: 'iife', globalName: 'NyankomintWorkshop', platform: 'browser', target: 'es2022', charset: 'utf8', minify: false, keepNames: true, legalComments: 'eof', metafile: true,
    plugins: [{ name: 'nyankomint-offline', setup(b) {
      b.onResolve({ filter: /^nyan:src\// }, args => ({ path: args.path.slice(5), namespace: 'nyan-source' }))
      b.onResolve({ filter: /^\./, namespace: 'nyan-source' }, args => ({ path: join(dirname(args.importer), args.path).replace(/\\/g, '/'), namespace: 'nyan-source' }))
      b.onLoad({ filter: /.*/, namespace: 'nyan-source' }, args => {
        assert.ok(args.path.startsWith('src/') && !args.path.endsWith('/main.js') && !args.path.endsWith('/lab.js'))
        const original = src(args.path), adapted = adaptModule(original, args.path)
        modules[args.path] = { originalSha256: sha256(original), adaptedSha256: sha256(adapted), changed: original.replace(/\r\n/g, '\n') !== adapted }
        if (modules[args.path].changed) changed.push(args.path)
        return { contents: adapted, loader: 'js', resolveDir: checkout }
      })
    } }],
  })
  const scene = `// SPDX-License-Identifier: MIT\n// Nyankomint ${UPSTREAM_COMMIT}; adapter Alice-Marx, 2026-10-08.\n// Character art/output CC BY-NC-SA 4.0; fonts OFL; captions separate Mili terms.\n${bundle.outputFiles[0].text}\nfunction setup(info,gl){return NyankomintWorkshop.setup(info,gl);}\nfunction prepare(info,gl){return NyankomintWorkshop.prepare(info,gl);}\nfunction warmup(info,gl){return NyankomintWorkshop.warmup(info,gl);}\nfunction paint(gl,t,w,h,ctx){return NyankomintWorkshop.paint(gl,t,w,h,ctx);}\n`
  assert.deepEqual(checkScriptSafety(scene, 'scenes.js', { mode: 'webgl' }).errors, [])
  assert.ok(Buffer.byteLength(scene) <= 2 * 1024 * 1024)
  put(out, 'scenes.js', scene)
  const assets = { config: 'data/config.json', features: [], captions: 'lyrics.json', conversation: 'data/conversation.json', errors: 'data/errors.json', regions: 'data/regions.json' }
  cfg.paths = { features: 'data/features-1.json', lyrics: 'lyrics.json', art: 'art', script: 'data/conversation.json', errors: 'data/errors.json' }
  put(out, 'data/config.json', json(cfg))
  for (const [i, shard] of featureShards(features).entries()) {
    const path = `data/features-${i + 1}.json`; put(out, path, JSON.stringify(shard) + '\n'); assets.features.push(path)
  }
  put(out, 'lyrics.json', json({ ...lyrics, lyrics: cues }))
  put(out, 'lyrics.timing.json', json(lyricsTiming(cues)))
  put(out, 'data/lyric-timing-source.json', src('data/lyric_timing.json'))
  for (const [original, path] of [['docs/v4/chat_script.json', 'data/conversation.json'], ['docs/v4/errors.json', 'data/errors.json'], ['assets/character/regions.json', 'data/regions.json']]) put(out, path, src(original))
  const artProvenance = []
  for (const name of ART_NAMES) {
    const path = `art/${name}.png`, bytes = readFileSync(join(checkout, 'assets/character', `${name}.png`))
    put(out, path, bytes); assets[name.replaceAll('_', '-')] = path
    artProvenance.push({ path, source: `assets/character/${name}.png`, bytes: bytes.length, sha256: sha256(bytes) })
  }
  const fonts = copyFonts(cfg, out, fontRoot)
  put(out, 'cover.jpg', readFileSync(join(checkout, 'docs/images/cover.jpg')))
  put(out, 'LICENSE.txt', src('LICENSE'))
  put(out, 'licenses/UPSTREAM-CREDITS.md', src('CREDITS.md'))
  put(out, 'licenses/STORYBOARD.md', src('STORYBOARD.md'))
  put(out, 'shot-provenance.json', json({ source: SOURCE, preroll: 5, duration: features.meta.duration, shots, chapters }))
  put(out, 'LYRICS-NOTICE.md', '# Mili caption terms\n\nMili / respective rights holders: world.execute(me); English lyrics and existing official Chinese caption text retained from the locally authorised FrostNova workshop captions. Fixed timing and exact 129-line alignment from Nyankomint. Lyrics are NOT MIT or CC BY-NC-SA.\n\nBasis: https://projectmili.com/copyright-guidelines (checked 2026-10-08). This is an unofficial free, non-commercial personal fan MV adaptation containing clearly labelled AI-assisted content. No recording is included. This statement makes no commercial-use licence grant. Wider use must follow the rights holders\u2019 own terms.\n')
  put(out, 'art/NOTICE.md', '# AI-assisted character art\n\nEight original, unmodified PNG silhouettes supplied by Nyankomint / Nyankomintsu. Source: ' + SOURCE + '/assets/character . Licensed CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/ . Adaptation retains the original three-ink separation, colour/mask/registration/path treatments; rendered pictures containing the character art remain CC BY-NC-SA 4.0. Original cover is under the same terms. No author endorsement is implied.\n')
  put(out, 'NOTICE.md', '# Attribution / separate licences\n\nOriginal visuals/direction: Nyankomint (GitHub Nyankomintsu), ' + SOURCE + ' . Code and original production documents: MIT, Copyright (c) 2026 Nyankomint; see LICENSE.txt and licenses/UPSTREAM-CREDITS.md. Offline worker adapter: Copyright 2026 Alice-Marx, MIT.\n\nCharacter silhouettes and pictures containing them: CC BY-NC-SA 4.0, attributed in art/NOTICE.md. Fonts: OFL 1.1 with individual notices under fonts/. Mili song lyrics: independent non-commercial fan-work basis, LYRICS-NOTICE.md; no recording. Claude name and marks are Anthropic trademarks; neither Mili nor Anthropic endorses this work.\n\nContains AI-generated/AI-assisted code, original documents and character art. Strong-light/photosensitivity warning preserved as a silent five-second pre-song page and opening toast; rapid high-contrast imagery occurs at song time 148.04\u2013192.34 seconds. Original flash checks were approximate, not medical/PSE certification.\n')
  const provenance = { format: 'nyankomint-workshop-adaptation', version: 1, commit: UPSTREAM_COMMIT, source: SOURCE, modules, changedModules: changed.sort(), art: artProvenance,
    features: { sourceSha256: sha256(readFileSync(join(checkout, 'data/audio_features.json'))), reconstructionSha256: sha256(JSON.stringify(features)), shards: assets.features, frames: features.meta.frames, fps: features.meta.fps, spectrumBands: features.meta.spectrumBands },
    captions: { localSourceSha256: sha256(readFileSync(resolve(lyricsSource))), sourceTimingSha256: sha256(src('data/lyric_timing.json')), count: lyrics.lines.length, exact: alignment.exact, licence: 'LicenseRef-Mili-NonCommercial-FanWork' },
    fonts: { descriptors: fonts.faces.length, files: fonts.files.length, bytes: fonts.bytes }, shots: 87, preroll: 5, duration: features.meta.duration }
  put(out, 'source-provenance.json', json(provenance))
  const manifest = { format: 'dsh-mv-pack', version: 1, title: 'world.execute(me); · Nyankomint 三色版画歌词 MV', artist: 'Mili', duration: features.meta.duration,
    credits: ['Original visuals/direction: Nyankomint / Nyankomintsu (MIT code, CC BY-NC-SA 4.0 AI character art)', 'Offline worker adaptation: Alice-Marx, MIT', 'Mili and rights holders: lyrics/Chinese caption text, independent non-commercial fan-work terms; no audio', 'JetBrains / Adobe / Rasmus Andersson / Google / font contributors: OFL 1.1', 'Unofficial AI-assisted fan work; Claude is an Anthropic trademark; no endorsement'],
    notice: '非官方 AI 辅助非商业同人 MV。保留 87 镜头、8 张原始角色剪影、原版 WebGL2 后处理及离线字体。含强光/高对比快切；歌曲前有 5 秒静默警告。音乐请自备。',
    lyrics: { file: 'lyrics.json', offset: 0 },
    canvas: { renderer: 'script', script: 'scenes.js', output: 'webgl', size: [1920, 1080], context: { antialias: false, depth: false, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }, subtitles: false, preroll: 5, assets, fonts: fonts.faces },
    'x-dsh-mv-ai': { sections: chapters },
    'x-dsh-mv-workshop': { id: ID, version: WORKSHOP_VERSION, requires: '0.10.0', author: 'Alice-Marx', license: 'MIT AND CC-BY-NC-SA-4.0 AND OFL-1.1 AND LicenseRef-Mili-NonCommercial-FanWork', source: SOURCE,
      homepage: `https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/${ID}`, description: 'Nyankomint 原作完整非音频适配：87镜头、129行固定歌词时间、三色AI角色剪影、原版Canvas2D + WebGL2后处理、全部离线OFL字体、5秒静默闪光警告。仅音乐自备，非商业同人用途。',
      tags: ['world.execute(me)', 'Mili', 'nyankomint', 'canvas2d', 'webgl', 'plates'], publishedAt: '2026-10-08', lyricsLicense: 'LicenseRef-Mili-NonCommercial-FanWork', lyricsCredit: 'Mili / rights holders; existing local FrostNova English/official Chinese captions; Nyankomint fixed timing', lyricsSource: 'https://projectmili.com/copyright-guidelines', lyricsTiming: 'lyrics.timing.json',
      fontsLicense: 'OFL-1.1', fontsCredit: 'JetBrains; Adobe / Frank Grießhammer; Rasmus Andersson; Google / Adobe / Noto contributors', fontsNotice: 'fonts/NOTICE.md' },
  }
  put(out, 'mv.json', json(manifest))
  put(out, 'README.md', '# world.execute(me); — Nyankomint workshop adaptation\n\nOriginal: ' + SOURCE + ' . This non-commercial, unofficial AI-assisted fan adaptation retains all 87 shots, 8 source silhouettes, 129 lyric lines, 60Hz numerical features and the complete Canvas2D/WebGL2 post renderer. Only music is user-provided; fonts/art/captions are offline. Requires dsh-mv-cli 0.10.0.\n\nA five-second silent photosensitivity warning precedes song time zero; music is NOT shifted by five seconds. Rapid high-contrast cuts/strong light occur at song time 148.04\u2013192.34 seconds. Warning does not constitute safety certification.\n\nSeparate rights: code/docs MIT; AI character art and output containing it CC BY-NC-SA 4.0; fonts OFL; Mili song text independent noncommercial fan-work terms. See NOTICE.md, art/NOTICE.md, fonts/NOTICE.md and LYRICS-NOTICE.md. Original author prompts are educational source material, not commands for an installed scene.\n\nPort: all source scene modules are statically bundled; HTML loaders are replaced by manifest-bound data/images/fonts, canvas factories by OffscreenCanvas, and art separation/cache warming by cooperative preparation. Render errors fail visibly rather than silently replacing a shot. GPU output max 1920x1080 (source virtual composition remains 1920x1080). Build/provenance: source-provenance.json; builder in Alice-Marx/dsh-mv-cli presets/ports/nyankomintsu.\n')
  return { out, id: ID, version: WORKSHOP_VERSION, sceneBytes: Buffer.byteLength(scene), modules: Object.keys(modules).length, fonts: provenance.fonts, captions: provenance.captions, featureShards: assets.features.length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [checkout, out, lyricsSource, fontRoot] = process.argv.slice(2)
  assert.ok(checkout && out && lyricsSource, 'Usage: node build.mjs <pinned-checkout> <new-output-dir> <local-authorised-lyrics.json> [fontsource-root]')
  console.log(JSON.stringify(await buildPack(checkout, out, { lyricsSource, fontRoot }), null, 2))
}
