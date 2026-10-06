/** Build a NEW dsh-pv 1.1.0 complete fan pack. No downloads, source mutation, deletion or publishing. */
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { assetParts, checkDshPvFont, DSHPV_FONT_ASSETS, parseMvPack } from '../../.dsh-plugin/shared/mv-pack.mjs'
import { parseLyrics } from '../../.dsh-plugin/shared/mv-lyrics.mjs'
import { validateWorkshopPack, WORKSHOP_LIMITS } from '../../.dsh-plugin/shared/mv-workshop.mjs'
import { rasterImageDimensions, validateRasterAtlases, validateRasterTimeline } from '../../.dsh-plugin/client/mv/dshpv/raster.mjs'

export const COMPLETE_PV_VERSION = '1.1.0'
export const COMPLETE_PV_REQUIRES = '0.9.5'
export const COMPLETE_PV_SHARD_BYTES = 480 * 1024
const PV_SOURCE = 'https://github.com/MisakaZentai/world-execute-me-dsh-pv'
const MILI_TERMS = 'https://projectmili.com/copyright-guidelines'
const MILI_LYRICS_LICENSE = 'LicenseRef-Mili-NonCommercial-FanWork'
const FONT_DIR = 'film/ai_mascot_mv_world_execute_20260926/fonts'
const LYRIC_PATH = 'film/ai_mascot_mv_world_execute_20260926/audio/lyrics_synced.lrc'
export const CONFIRMED_PV_REFERENCE = Object.freeze({
  basename: 'DeepSeek1.png', sha256: '1ee43fb06f5d0c6a9b342d37b0dd74859b73b375946f0e938b7bdc41c42833f0',
  permission: 'User confirmed public non-commercial fan-work distribution of this reference in the 2026-10-06 conversation; this statement does not grant rights to unrelated images or third-party MMD models/motions.',
})
const DEFAULT_REFERENCE = 'F:/picture/AIpicture/aipersona/model/DeepSeek/DeepSeek1.png'
const json = value => `${JSON.stringify(value)}\n`
const pretty = value => `${JSON.stringify(value, null, 2)}\n`
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const safePath = value => typeof value === 'string' && /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+){0,2}$/.test(value) && !value.split('/').some(part => part === '..' || part.startsWith('.'))
const within = (parent, child) => { const part = relative(parent, child); return !part || !part.startsWith('..') && !isAbsolute(part) }
const fail = message => { throw new Error(`dsh-pv complete: ${message}`) }
const loadJson = (bytes, label) => { try { return JSON.parse(bytes.toString('utf8')) } catch { fail(`${label} is not JSON`) } }

function readBounded(path, max = WORKSHOP_LIMITS.packBytes) {
  const info = lstatSync(path)
  if (!info.isFile() || info.isSymbolicLink() || info.size > max) fail(`input file is absent, linked or too large: ${path}`)
  return readFileSync(path)
}

function readTree(root, prefix = '', entries = new Map()) {
  for (const row of readdirSync(join(root, prefix), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = prefix ? `${prefix}/${row.name}` : row.name
    if (!safePath(path) || row.isSymbolicLink()) fail(`unsupported base path: ${path}`)
    if (row.isDirectory()) readTree(root, path, entries)
    else if (row.isFile()) entries.set(path, readBounded(join(root, ...path.split('/'))))
    else fail(`unsupported base entry: ${path}`)
  }
  return entries
}

/** Exactly the existing renderer's root-array concatenation/first-key merge semantics. */
export function mergeCompletePvShards(shards) {
  const merged = {}
  for (const shard of shards) {
    if (!object(shard)) fail('source shard must be an object')
    for (const [key, value] of Object.entries(shard)) {
      if (Array.isArray(value) && Array.isArray(merged[key])) merged[key] = merged[key].concat(value)
      else if (!Object.hasOwn(merged, key)) Object.defineProperty(merged, key, { value, enumerable: true, configurable: true, writable: true })
    }
  }
  return merged
}

/** Repartition data into <=480KiB JSON without changing any scalar, array order or nested value. */
export function splitCompletePvData(value, maxBytes = COMPLETE_PV_SHARD_BYTES) {
  if (!object(value) || !Number.isInteger(maxBytes) || maxBytes < 64 || maxBytes > COMPLETE_PV_SHARD_BYTES) fail('invalid JSON shard input or byte cap')
  const scalar = Object.fromEntries(Object.entries(value).filter(([, item]) => !Array.isArray(item)))
  let current = scalar, currentBytes = Buffer.byteLength(json(current))
  const output = []
  const flush = () => {
    if (Object.keys(current).length) {
      const bytes = Buffer.from(json(current))
      if (bytes.byteLength > maxBytes) fail('generated shard exceeded its calculated byte cap')
      output.push(bytes)
    }
    current = {}; currentBytes = 3
  }
  const arrayKeyBytes = key => Buffer.byteLength(JSON.stringify(key)) + 3 + (Object.keys(current).length ? 1 : 0)
  if (currentBytes > maxBytes) fail('non-array source metadata exceeds JSON shard cap')
  for (const [key, rows] of Object.entries(value).filter(([, item]) => Array.isArray(item))) {
    if (!rows.length) {
      if (currentBytes + arrayKeyBytes(key) > maxBytes) flush()
      currentBytes += arrayKeyBytes(key)
      Object.defineProperty(current, key, { value: [], enumerable: true, writable: true, configurable: true })
    }
    for (const row of rows) {
      const rowBytes = Buffer.byteLength(JSON.stringify(row))
      const growth = () => rowBytes + (Object.hasOwn(current, key) ? current[key].length ? 1 : 0 : arrayKeyBytes(key))
      if (currentBytes + growth() > maxBytes) flush()
      if (currentBytes + growth() > maxBytes) fail(`one ${key} row exceeds JSON shard cap; cannot split a nested value semantically`)
      currentBytes += growth()
      if (!Object.hasOwn(current, key)) Object.defineProperty(current, key, { value: [], enumerable: true, writable: true, configurable: true })
      current[key].push(row)
    }
  }
  flush()
  if (!output.length) output.push(Buffer.from('{}\n'))
  if (!isDeepStrictEqual(mergeCompletePvShards(output.map(bytes => loadJson(bytes, 'generated shard'))), value)) fail('generated shards do not reproduce the source data exactly')
  return output
}

function setShards(entries, name, shards, folder = 'data') {
  const paths = shards.map((bytes, index) => {
    const path = `${folder}/${name}-${index + 1}.json`; entries.set(path, bytes); return path
  })
  return paths.length === 1 ? paths[0] : paths
}

function checkOutput(out, inputs) {
  for (const input of inputs) if (within(input, out)) fail('output must not be inside any source/input directory')
  if (existsSync(out)) {
    const info = lstatSync(out)
    if (!info.isDirectory() || info.isSymbolicLink() || readdirSync(out).length) fail('output must be a new or empty directory; existing files are never overwritten')
  }
}

function fontsNotice() {
  return '# Bundled OFL fonts\n\nSpace Mono Bold: Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono).\n\nAnton Regular: Copyright 2020 The Anton Project Authors (https://github.com/googlefonts/AntonFont.git).\n\nBoth original, unmodified font binaries are redistributed under SIL Open Font License 1.1. Complete original copyright and license texts are in OFL_spacemono.txt and OFL_anton.txt. The player uses scoped CSS aliases only; it does not modify the font binaries.\n\nConsolas, Microsoft YaHei and Segoe UI/Symbol are used only when installed on the listener\'s own Windows computer. No Windows font binary or reusable per-glyph font atlas is included.\n'
}

function lyricsNotice() {
  return `# Song-caption terms (NOT MIT)\n\nCaption text: Mili, world.execute(me);. The 98 English cues are retained from the upstream local lyrics_synced.lrc reconstruction, using the upstream text-free timing records and official song words. No new Chinese translation is invented.\n\nUse basis: ${MILI_TERMS} (checked 2026-10-06). This is an unofficial, free, non-commercial fan MV adaptation. The guidelines permit non-profit / non-commercial personal derivative works; this adaptation makes no commercial-use grant or general standalone-lyric redistribution grant. Song recordings and official Mili artwork are not included.\n\nMili song text is NOT licensed by the renderer's MIT, the artwork's CC-BY-NC-SA-4.0, or the fonts' OFL license. Broader/commercial use must follow the rights holder's terms. This fan adaptation contains AI-assisted generated character visuals and is labeled accordingly.\n`
}

function readme({ frames, atlases, cues, fps, sourceArt }) {
  return `# world.execute(me); - complete dsh PV fan pack 1.1.0\n\nOriginal PV: [MisakaZentai/world-execute-me-dsh-pv](${PV_SOURCE}). Requires dsh-mv-cli >=0.9.5. This is an unofficial, non-commercial, AI-assisted fan adaptation, not an original-film/MMD restoration.\n\nOnly the music recording is user-provided. Install/update this pack, completely restart Harness after upgrading the plugin, and select your own Mili - world.execute(me); recording (211.913 seconds). The pack automatically loads ${cues} English caption cues, original timing/chat/vector data, ${frames} raster frames sampled at ${fps} fps in ${atlases} atlas pages, standing art, and its two OFL fonts. The original PV has no supplied Chinese translation; none is invented here.\n\nThe dancer is a newly AI-assisted eight-pose character remake from the user's DeepSeek1.png reference, with deterministic beat-timed changes/blends. It is NOT the original MMD dancer, model, motion, or MiniMax-H3 cache. The upstream compositor's other image surfaces (avatars, memory cards, sampling/convolution/heat maps and related layers) are supplied via the indexed raster atlas.\n\nFonts: Space Mono Bold and Anton Regular ship with their complete OFL notices. Consolas / Microsoft YaHei / Segoe UI Symbol are preferred locally on Windows when installed; their binaries and reusable glyph atlases are not redistributed. Other computers use the renderer's system fallback stack.\n\nCode/data retain MIT. Whale-girl-derived artwork, including the remade dance and raster adaptations, is CC-BY-NC-SA-4.0 with the full attribution chain in art/NOTICE.md. The user's permission is specific to the reference basename/hash recorded in mv.json, not a grant over unrelated works. Mili captions have independent non-commercial fan-work terms in LYRICS-NOTICE.md. See NOTICE.md, LICENSE.txt and fonts/NOTICE.md.\n\nThe original generated dance source sheet is archived separately as ${sourceArt}; it is already represented in the raster atlas and is not redundantly installed. The legacy pack and its baseline timeline are untouched.\n\n## 中文说明\n\n本完整包只需听众自备歌曲音频；98 条英文歌词、时间轴、矢量画面、聊天、头像/记忆卡片等栅格层、立绘及可公开的两种 OFL 字体自动随包加载。舞者是以用户提供 DeepSeek1.png 为参考的新 AI 辅助八姿态重做，不是原片 MMD 模型/动作或 MiniMax-H3 舞者缓存的恢复。Consolas、微软雅黑、Segoe UI Symbol 仅调用本机已安装版本，不复制 Windows 字体或逐字字形图集。仅限非商业同人用途，完整署名链及各素材独立许可必须保留。\n`
}

/** Inputs are explicit paths; only newly generated out/source-art files are written. */
export async function buildCompletePvPack({ base, upstream, raster, dance, out, reference = DEFAULT_REFERENCE, authorizedReference = CONFIRMED_PV_REFERENCE, timeline: replacementTimeline, probe = false }) {
  const roots = { base: resolve(base), upstream: resolve(upstream), raster: resolve(raster), dance: resolve(dance), out: resolve(out), reference: resolve(reference), ...(replacementTimeline ? { timeline: resolve(replacementTimeline) } : {}) }
  checkOutput(roots.out, [roots.base, roots.upstream, roots.raster, dirname(roots.dance), dirname(roots.reference)])
  const original = readTree(roots.base), raw = loadJson(original.get('mv.json') ?? fail('base mv.json is missing'), 'base mv.json'), parsed = parseMvPack(raw)
  if (parsed.canvas.renderer !== 'dsh-pv' || parsed.workshop?.id !== 'world-execute-me-dsh-pv') fail('base must be the existing world-execute-me-dsh-pv pack')
  const entries = new Map(original), assets = { ...parsed.canvas.assets }, oldDataNotices = []
  // These exact duplicated licenses can be consolidated into the retained root
  // notice/license; no source file is deleted or changed.
  for (const path of ['data/NOTICE.md', 'art/LICENSE.txt']) {
    if (!entries.has(path)) continue
    if (path === 'art/LICENSE.txt') {
      if (!entries.has('LICENSE.txt') || !entries.get(path).equals(entries.get('LICENSE.txt'))) fail('art license is not an exact duplicate of the retained root license')
    } else oldDataNotices.push(entries.get(path).toString('utf8'))
    entries.delete(path)
  }
  for (const name of ['timeline', 'chat', 'band']) {
    const paths = assetParts(parsed, name)
    if (!paths.length) fail(`base is missing ${name}`)
    let value = mergeCompletePvShards(paths.map(path => loadJson(original.get(path) ?? fail(`base data is missing: ${path}`), path)))
    if (name === 'timeline' && roots.timeline) {
      const updated = loadJson(readBounded(roots.timeline, WORKSHOP_LIMITS.dshPvPackBytes ?? WORKSHOP_LIMITS.packBytes), 'replacement vector timeline')
      if (!Array.isArray(value.shots) || !Array.isArray(updated.shots) || value.shots.length !== 97 || updated.shots.length !== 97 || !isDeepStrictEqual(value.shots.map(shot => [shot.s, shot.e, shot.fn, shot.kf?.map(frame => frame.t)]), updated.shots.map(shot => [shot.s, shot.e, shot.fn, shot.kf?.map(frame => frame.t)]))) fail('replacement vector timeline must retain all 97 original shots and exact keyframe times')
      value = updated
    }
    for (const path of paths) entries.delete(path)
    assets[name] = setShards(entries, name, splitCompletePvData(value))
  }
  const provenanceBytes = readBounded(join(roots.raster, 'provenance.json'), COMPLETE_PV_SHARD_BYTES), provenance = loadJson(provenanceBytes, 'raster provenance')
  if (!object(provenance) || provenance.upstream !== PV_SOURCE || !/^[0-9a-f]{40}$/.test(provenance.commit ?? '') || provenance.audioOrVideoFiles !== 0 || provenance.songAudioRead !== false || provenance.dance?.originalMmdOrH3CachesUsed !== false || provenance.dance?.poses !== 8) fail('raster provenance is missing source revision, eight-pose remake, or no-audio/no-original-MMD declarations')
  const danceBytes = readBounded(roots.dance, 8 * 1024 * 1024), referenceBytes = readBounded(roots.reference, 8 * 1024 * 1024)
  rasterImageDimensions(danceBytes)
  if (!object(authorizedReference) || basename(roots.reference) !== authorizedReference.basename || sha(referenceBytes) !== authorizedReference.sha256 || typeof authorizedReference.permission !== 'string' || !authorizedReference.permission.trim()) fail('reference does not match the explicitly authorized basename/hash/non-commercial permission')
  if (sha(danceBytes) !== provenance.dance.sheetSha256) fail('raster atlas was not rendered from the supplied dance sheet')
  const atlasRows = provenance.atlasPages
  if (!Array.isArray(atlasRows) || !atlasRows.length || atlasRows.length > 16) fail('raster atlas pages must contain 1-16 entries')
  const atlasPaths = [], dimensions = []
  for (const [index, row] of atlasRows.entries()) {
    const expected = `raster-atlas-${String(index).padStart(2, '0')}.webp`
    if (!object(row) || row.file !== expected) fail('raster atlas filenames must be ordered canonical local WebP names')
    const bytes = readBounded(join(roots.raster, row.file), WORKSHOP_LIMITS.coverBytes)
    if (bytes.byteLength !== row.bytes || sha(bytes) !== row.sha256) fail(`raster atlas bytes/hash mismatch: ${row.file}`)
    const size = rasterImageDimensions(bytes)
    if (size.width !== row.width || size.height !== row.height) fail(`raster atlas dimensions mismatch: ${row.file}`)
    const path = `raster/${row.file}`; entries.set(path, bytes); atlasPaths.push(path); dimensions.push(size)
  }
  const timelineFile = provenance.timeline?.file
  if (timelineFile !== 'raster-timeline.json') fail('raster provenance must reference its canonical local timeline')
  const timelineBytes = readBounded(join(roots.raster, timelineFile), 8 * 1024 * 1024)
  if (timelineBytes.byteLength !== provenance.timeline.bytes || sha(timelineBytes) !== provenance.timeline.sha256) fail('raster timeline bytes/hash mismatch')
  const timelineRaw = loadJson(timelineBytes, 'raster timeline')
  if (Object.keys(timelineRaw).some(key => !['version', 'size', 'frames', 'fps'].includes(key))) fail('raster timeline contains unsupported fields')
  const timeline = validateRasterTimeline({ version: timelineRaw.version, size: timelineRaw.size, frames: timelineRaw.frames })
  validateRasterAtlases(timeline, dimensions)
  if (timeline.frames.length !== provenance.frames || !Number.isFinite(provenance.samplingFps) || provenance.samplingFps <= 0 || provenance.samplingFps > 24) fail('raster sampling/provenance is inconsistent')
  if (!probe && (timeline.frames[0].t !== 0 || timeline.frames[0].ops.length || timeline.frames.at(-1).t < 207.1 || timeline.frames.at(-1).ops.length || timeline.frames.slice(1).some((frame, index) => frame.t - timeline.frames[index].t > 1 / provenance.samplingFps + 0.02))) fail('full raster must cover 0..207.1 seconds at the declared FPS, with empty initial/final cleanup frames; probes require --probe')
  assets['raster-timeline'] = setShards(entries, 'timeline', splitCompletePvData(timeline), 'raster')
  assets['raster-atlas'] = atlasPaths.length === 1 ? atlasPaths[0] : atlasPaths
  const fontProvenance = []
  for (const [name, descriptor] of Object.entries(DSHPV_FONT_ASSETS)) {
    const bytes = readBounded(join(roots.upstream, FONT_DIR, basename(descriptor.path)), 512 * 1024)
    const checked = checkDshPvFont(bytes, name)
    if (checked.errors.length) fail(checked.errors.join('; '))
    const licenseBytes = readBounded(join(roots.upstream, FONT_DIR, basename(descriptor.licenseFile)), COMPLETE_PV_SHARD_BYTES)
    entries.set(descriptor.path, bytes); entries.set(descriptor.licenseFile, licenseBytes); assets[name] = descriptor.path
    fontProvenance.push({ file: descriptor.path, sha256: sha(bytes), bytes: bytes.byteLength, licenseFile: descriptor.licenseFile, licenseSha256: sha(licenseBytes) })
  }
  entries.set('fonts/NOTICE.md', Buffer.from(fontsNotice()))
  const lyricBytes = readBounded(join(roots.upstream, LYRIC_PATH), COMPLETE_PV_SHARD_BYTES), cues = parseLyrics('lyrics_synced.lrc', lyricBytes.toString('utf8'), { duration: parsed.duration })
  if (cues.length !== 98) fail(`expected 98 reconstructed English lyric cues, got ${cues.length}`)
  entries.set('lyrics.json', Buffer.from(json(cues))); entries.set('LYRICS-NOTICE.md', Buffer.from(lyricsNotice()))
  const sourceArtName = `dance-poses-${sha(danceBytes).slice(0, 12)}.png`
  const sourceArt = join(dirname(roots.out), 'source-art', sourceArtName)
  const attribution = '溟月 © 上善无形 → 女仆版 ZipZipPipe → 立绘 Small-tailqwq / dsh-deep-whale → 表情 dsh-whale-galgame; upstream MisakaZentai; AI-assisted dancer remake from the user-provided reference.'
  raw.lyrics = { file: 'lyrics.json', offset: 0 }; delete raw.audio; delete raw.spectrum; delete raw.$schema
  raw.canvas = { ...raw.canvas, renderer: 'dsh-pv', assets }
  raw.credits = [
    'Music recording © Mili (not included); caption text © Mili, separate non-commercial fan-work terms in LYRICS-NOTICE.md.',
    ...(raw.credits ?? []).filter(line => !/^Song and lyrics/i.test(line)),
    'OFL fonts: Copyright 2016 The Space Mono Project Authors; Copyright 2020 The Anton Project Authors.',
    `AI-assisted eight-pose dancer remake, NOT original-film MMD: ${attribution}`,
  ]
  raw.notice = 'Only music audio is user-provided. 98 English caption cues, original vector/chat/band timing, raster layers, art and supported OFL fonts are included. Non-commercial unofficial AI-assisted fan adaptation; the dancer is newly remade, NOT original MMD/model/motion restoration. Windows fonts are local-only. 听众仅自备音乐；舞者为 AI 辅助重做，非原片 MMD 恢复。'
  raw['x-dsh-mv-workshop'] = {
    ...raw['x-dsh-mv-workshop'], version: COMPLETE_PV_VERSION, requires: COMPLETE_PV_REQUIRES,
    license: `MIT AND CC-BY-NC-SA-4.0 AND OFL-1.1 AND ${MILI_LYRICS_LICENSE}`,
    description: 'Complete non-commercial fan PV: 98 English captions, original timing/chat/vector scenes, raster avatars/memory/sampling layers, AI-remade dancer, Space Mono Bold and Anton Regular. Only music is user-provided; Windows fonts remain local-only.',
    fontsLicense: 'OFL-1.1', fontsCredit: 'Copyright 2016 The Space Mono Project Authors; Copyright 2020 The Anton Project Authors.', fontsNotice: 'fonts/NOTICE.md',
    lyricsLicense: MILI_LYRICS_LICENSE, lyricsCredit: 'Mili (song text); timing reconstructed from MisakaZentai/world-execute-me-dsh-pv text-free records and official song words.', lyricsSource: MILI_TERMS,
    publishedAt: '2026-10-07',
  }
  raw['x-dsh-pv-provenance'] = {
    baseManifestSha256: sha(original.get('mv.json')), source: PV_SOURCE, revision: provenance.commit,
    ...(roots.timeline ? { replacementVectorTimeline: { basename: basename(roots.timeline), sha256: sha(readBounded(roots.timeline, WORKSHOP_LIMITS.dshPvPackBytes ?? WORKSHOP_LIMITS.packBytes)), originalShotsAndKeyframeTimesRetained: true } } : {}),
    developmentProbe: probe === true,
    raster: provenance, fonts: fontProvenance,
    captions: { source: LYRIC_PATH, sourceSha256: sha(lyricBytes), cues: cues.length, terms: MILI_TERMS },
    dance: { reference: authorizedReference, sourceSheetBasename: basename(roots.dance), sourceSheetSha256: sha(danceBytes), attribution, aiAssisted: true, originalFilmMmd: false, standaloneSheetInstalled: false },
  }
  const oldNotice = original.get('NOTICE.md')?.toString('utf8') ?? ''
  entries.set('NOTICE.md', Buffer.from(`# Complete dsh PV 1.1.0: independent resource terms\n\nCode/data: MIT. Whale-girl-derived imagery and AI-remade dancer/raster adaptations: CC-BY-NC-SA-4.0. Fonts: OFL-1.1. Caption text: ${MILI_LYRICS_LICENSE}, per ${MILI_TERMS}. Only song audio is absent. This updated statement supersedes older pack notes saying all caption text/fonts/raster imagery were absent.\n\n${attribution}\n\nReference: ${authorizedReference.basename}, SHA256 ${authorizedReference.sha256}. ${authorizedReference.permission}\n\nAI use is explicitly labeled. The remade dancer does not use or redistribute the original MMD model, motion, MiniMax-H3 dance cache or any unconfirmed original dancer frames. Preserve art/NOTICE.md's full attribution chain. CC license text is retained at ../LICENSE.txt relative to art/; no artwork is relicensed as MIT. No Windows font binary or reusable per-character glyph atlas is shipped.\n\n## Retained legacy artwork/source attribution\n\n${oldNotice}\n\n## Retained original data MIT notice (unchanged text)\n\n${oldDataNotices.join('\n\n')}\n`))
  // Repair the legacy relative LICENSE reference because its duplicate art copy
  // is now consolidated at the root, while keeping all attribution text.
  if (entries.has('art/NOTICE.md')) entries.set('art/NOTICE.md', Buffer.from(entries.get('art/NOTICE.md').toString('utf8').replace(/`LICENSE`/g, '`../LICENSE.txt`')))
  entries.set('README.md', Buffer.from(readme({ frames: timeline.frames.length, atlases: atlasPaths.length, cues: cues.length, fps: provenance.samplingFps, sourceArt: `../source-art/${sourceArtName}` })))
  if (probe) {
    raw.title = `${raw.title} [DEVELOPER PROBE - NOT A COMPLETE RELEASE]`
    raw.notice = `DEVELOPER PROBE ONLY: ${timeline.frames.length} sampled frames, not full-song coverage. Do not publish this probe. ${raw.notice}`
    entries.set('README.md', Buffer.from(`# Developer probe only - NOT FOR PUBLICATION\n\nThis pack contains ${timeline.frames.length} sparse visual probes, not full-song raster coverage. It tests Host/FontFace/React integration only.\n\n${entries.get('README.md').toString('utf8')}`))
  }
  entries.set('mv.json', Buffer.from(pretty(raw)))
  const files = [...entries].map(([path, bytes]) => ({ path, size: bytes.byteLength, sha256: sha(bytes) }))
  const checked = await validateWorkshopPack({ id: parsed.workshop.id, files, readText: path => entries.get(path).toString('utf8'), readBytes: path => entries.get(path) })
  const report = { id: parsed.workshop.id, version: COMPLETE_PV_VERSION, requires: COMPLETE_PV_REQUIRES, developmentProbe: probe === true, files: files.length, bytes: files.reduce((n, file) => n + file.size, 0), lyricCues: cues.length, rasterFrames: timeline.frames.length, rasterAtlases: atlasPaths.length, samplingFps: provenance.samplingFps, reference: authorizedReference, sourceArt, errors: checked.errors, warnings: checked.warnings, resources: files }
  if (checked.errors.length) { const error = new Error(`dsh-pv complete: validation/budget failed (${report.files} files, ${report.bytes} bytes): ${checked.errors.join('; ')}`); error.report = report; throw error }
  // Recheck just before writing. Exclusive writes make a concurrent new user
  // file a hard error, never an overwrite. No cleanup or deletion is attempted.
  checkOutput(roots.out, [roots.base, roots.upstream, roots.raster, dirname(roots.dance), dirname(roots.reference)])
  mkdirSync(roots.out, { recursive: true })
  for (const [path, bytes] of entries) { const target = join(roots.out, ...path.split('/')); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes, { flag: 'wx' }) }
  mkdirSync(dirname(sourceArt), { recursive: true })
  if (existsSync(sourceArt)) { if (!readBounded(sourceArt, 8 * 1024 * 1024).equals(danceBytes)) fail('existing archived dance sheet has different bytes') }
  else writeFileSync(sourceArt, danceBytes, { flag: 'wx' })
  return report
}

function cliArgs(args) {
  const options = {}
  for (let i = 0; i < args.length; i++) {
    const key = args[i]
    if (key === '--probe') { options.probe = true; continue }
    if (!['--base', '--upstream', '--raster', '--dance', '--out', '--reference', '--timeline'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--')) fail(`unsupported or incomplete argument: ${key}`)
    options[key.slice(2)] = args[++i]
  }
  if (!['base', 'upstream', 'raster', 'dance', 'out'].every(key => options[key])) fail('required: --base --upstream --raster --dance --out [--reference]')
  return options
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await buildCompletePvPack(cliArgs(process.argv.slice(2))), null, 2)) } catch (error) { if (error.report) console.error(JSON.stringify(error.report, null, 2)); console.error(error.message); process.exitCode = 1 }
}
