import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildCompletePvPack, COMPLETE_PV_SHARD_BYTES, CONFIRMED_PV_REFERENCE, mergeCompletePvShards, splitCompletePvData } from '../tools/dsh-pv/build-complete.mjs'
import { WORKSHOP_LIMITS } from '../.dsh-plugin/shared/mv-workshop.mjs'

// All fixtures are newly made header/data records, not real fonts, artwork or song text.
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const json = value => `${JSON.stringify(value)}\n`
const font = (family, style) => {
  const names = 30 + (family.length + style.length) * 2, bytes = Buffer.alloc(48 + names)
  bytes.writeUInt32BE(0x00010000, 0); bytes.writeUInt16BE(2, 4); bytes.write('head', 12); bytes.writeUInt32BE(44, 20); bytes.writeUInt32BE(4, 24)
  bytes.write('name', 28); bytes.writeUInt32BE(48, 36); bytes.writeUInt32BE(names, 40); bytes.writeUInt16BE(2, 50); bytes.writeUInt16BE(30, 52)
  let offset = 0
  for (const [i, text] of [family, style].entries()) {
    const at = 54 + i * 12
    for (const [delta, value] of [[0, 3], [2, 1], [4, 0x0409], [6, i + 1], [8, text.length * 2], [10, offset]]) bytes.writeUInt16BE(value, at + delta)
    for (let j = 0; j < text.length; j++) bytes.writeUInt16BE(text.charCodeAt(j), 78 + offset + j * 2)
    offset += text.length * 2
  }
  return bytes
}
const pngHeader = (width, height) => {
  const bytes = Buffer.alloc(24); Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes)
  bytes.write('IHDR', 12); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20); return bytes
}
const webpHeader = () => {
  const bytes = Buffer.alloc(26); bytes.write('RIFF', 0); bytes.writeUInt32LE(18, 4); bytes.write('WEBP', 8); bytes.write('VP8L', 12); bytes.writeUInt32LE(5, 16); bytes[20] = 47
  return bytes
}
const write = (root, path, bytes) => { const target = join(root, ...path.split('/')); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes); return target }
const hashes = root => {
  const result = {}
  const walk = (path = '') => {
    for (const row of readdirSync(join(root, path), { withFileTypes: true })) {
      const next = path ? `${path}/${row.name}` : row.name
      if (row.isDirectory()) walk(next); else result[next] = sha(readFileSync(join(root, next)))
    }
  }
  walk(); return result
}
const removeFixture = root => {
  const part = relative(resolve(tmpdir()), resolve(root))
  assert.ok(part && !part.startsWith('..') && !isAbsolute(part) && basename(root).startsWith('dshpv_complete_fixture-'))
  rmSync(root, { recursive: true, force: true })
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'dshpv_complete_fixture-'))
  const base = join(root, 'base'), upstream = join(root, 'upstream'), raster = join(root, 'raster'), out = join(root, 'built', 'world-execute-me-dsh-pv')
  for (const path of [base, upstream, raster]) mkdirSync(path, { recursive: true })
  const shots = Array.from({ length: 97 }, (_, i) => ({ s: i * 2, e: i * 2 + 2, fn: `synthetic-${i}`, kf: [{ t: i * 2, o: [] }, { t: i * 2 + 1, o: [] }] }))
  const originalTimeline = { pal: ['#000000'], shots, lead: [], tickers: [] }
  const raw = {
    format: 'dsh-mv-pack', version: 1, title: 'Synthetic complete-pack fixture', duration: 211.913, artist: 'Synthetic artist',
    credits: ['Song and lyrics synthetic (not included)', 'Synthetic artwork attribution'],
    canvas: { renderer: 'dsh-pv', assets: { timeline: ['data/old-timeline-1.json', 'data/old-timeline-2.json'], chat: 'data/old-chat.json', band: 'data/old-band.json', 'maid-left': 'art/maid-left.webp' } },
    'x-dsh-mv-workshop': { id: 'world-execute-me-dsh-pv', version: '1.0.0', license: 'CC-BY-NC-SA-4.0', author: 'Synthetic fixture author' },
  }
  write(base, 'mv.json', json(raw)); write(base, 'README.md', '# Synthetic legacy documentation\n'); write(base, 'NOTICE.md', '# Synthetic original attribution\n'); write(base, 'LICENSE.txt', 'Synthetic identical CC license fixture\n')
  write(base, 'art/LICENSE.txt', 'Synthetic identical CC license fixture\n'); write(base, 'art/NOTICE.md', '# Synthetic art chain\nThe duplicate license was `LICENSE`.\n'); write(base, 'art/maid-left.webp', webpHeader()); write(base, 'cover.webp', webpHeader())
  write(base, 'data/NOTICE.md', '# Synthetic recorded-data notice\nMIT License, Synthetic author.\n')
  write(base, 'data/old-timeline-1.json', json({ ...originalTimeline, shots: shots.slice(0, 50) })); write(base, 'data/old-timeline-2.json', json({ shots: shots.slice(50) }))
  write(base, 'data/old-chat.json', json({ blocks: [{ kind: 'test', content: 'Synthetic UI record' }], states: [[0, 0]] }))
  write(base, 'data/old-band.json', json({ fixes: {}, lines: [{ sha256: '0'.repeat(64), start: 0, end: 1, words: [] }] }))
  const fontRoot = 'film/ai_mascot_mv_world_execute_20260926/fonts/'
  write(upstream, `${fontRoot}SpaceMono-Bold.ttf`, font('Space Mono', 'Bold')); write(upstream, `${fontRoot}Anton-Regular.ttf`, font('Anton', 'Regular'))
  for (const name of ['OFL_spacemono.txt', 'OFL_anton.txt']) write(upstream, fontRoot + name, 'Synthetic fixture: SIL OPEN FONT LICENSE Version 1.1\n')
  const lyricPath = 'film/ai_mascot_mv_world_execute_20260926/audio/lyrics_synced.lrc'
  const lrc = Array.from({ length: 98 }, (_, i) => { const time = i * 2; return `[${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}.00]Synthetic verification cue ${i}` }).join('\n') + '\n'
  write(upstream, lyricPath, lrc)
  const dance = write(root, 'generated/dance-poses-v1.png', pngHeader(400, 200)), reference = write(root, 'reference/DeepSeek1.png', pngHeader(64, 64))
  const frames = Array.from({ length: 1657 }, (_, i) => ({ t: i / 8, ops: i === 100 ? [{ atlas: 0, src: [0, 0, 1, 1], dst: [20, 30, 80, 90], alpha: 1, z: 'over' }] : [] }))
  frames.push({ t: 207.1, ops: [] })
  const timeline = { version: 1, size: [1280, 720], frames }, timelineBytes = Buffer.from(json(timeline)), atlas = webpHeader()
  write(raster, 'raster-timeline.json', timelineBytes); write(raster, 'raster-atlas-00.webp', atlas)
  write(raster, 'ignored-private.capture.zip', 'Synthetic private capture file - must never be copied')
  const provenance = { upstream: 'https://github.com/MisakaZentai/world-execute-me-dsh-pv', commit: 'a'.repeat(40), audioOrVideoFiles: 0, songAudioRead: false, frames: frames.length, samplingFps: 8, uniqueSurfaces: 1, rasterScale: 1, dance: { poses: 8, sheetSha256: sha(readFileSync(dance)), originalMmdOrH3CachesUsed: false }, atlasPages: [{ file: 'raster-atlas-00.webp', width: 1, height: 1, bytes: atlas.length, sha256: sha(atlas) }], timeline: { file: 'raster-timeline.json', bytes: timelineBytes.length, sha256: sha(timelineBytes) } }
  write(raster, 'provenance.json', json(provenance))
  return { root, base, upstream, raster, out, dance, reference, authorizedReference: { basename: 'DeepSeek1.png', sha256: sha(readFileSync(reference)), permission: 'Synthetic fixture authorization, not a real image license.' }, originalTimeline, provenance, lyricPath }
}
const args = value => ({ base: value.base, upstream: value.upstream, raster: value.raster, out: value.out, dance: value.dance, reference: value.reference, authorizedReference: value.authorizedReference })
const rebuildProvenance = value => write(value.raster, 'provenance.json', json(value.provenance))
const readAsset = (root, manifest, name) => mergeCompletePvShards((Array.isArray(manifest.canvas.assets[name]) ? manifest.canvas.assets[name] : [manifest.canvas.assets[name]]).map(path => JSON.parse(readFileSync(join(root, path), 'utf8'))))

test('complete PV builder: UTF-8 shard caps preserve every value and root-array ordering', () => {
  const data = { title: '合成验证', first: Array.from({ length: 20 }, (_, i) => ({ i, nested: ['数据', i] })), empty: [], second: ['α', 'β'], scalar: { value: 'unchanged' } }
  const before = structuredClone(data), shards = splitCompletePvData(data, 180)
  assert.ok(shards.length > 1); assert.ok(shards.every(bytes => bytes.byteLength <= 180))
  assert.deepEqual(mergeCompletePvShards(shards.map(bytes => JSON.parse(bytes))), data); assert.deepEqual(data, before)
  assert.deepEqual(mergeCompletePvShards(splitCompletePvData({}).map(bytes => JSON.parse(bytes))), {})
  for (const input of [{ scalar: 'x'.repeat(200) }, { rows: [{ huge: 'x'.repeat(200) }] }]) assert.throws(() => splitCompletePvData(input, 64), /shard cap/)
  assert.throws(() => splitCompletePvData({}, COMPLETE_PV_SHARD_BYTES + 1), /byte cap/)
})

test('complete PV builder: a new full pack preserves baseline data and all independent notices', async () => {
  const value = fixture()
  try {
    const original = hashes(value.base), report = await buildCompletePvPack(args(value)), raw = JSON.parse(readFileSync(join(value.out, 'mv.json'), 'utf8'))
    assert.equal(report.version, '1.1.0'); assert.equal(report.requires, '0.9.5'); assert.equal(report.lyricCues, 98); assert.equal(report.rasterFrames, 1658); assert.equal(report.rasterAtlases, 1); assert.equal(report.developmentProbe, false)
    assert.deepEqual(report.errors, []); assert.deepEqual(hashes(value.base), original)
    assert.deepEqual(readAsset(value.out, raw, 'timeline'), value.originalTimeline)
    assert.deepEqual(readAsset(value.out, raw, 'chat'), JSON.parse(readFileSync(join(value.base, 'data/old-chat.json'), 'utf8')))
    assert.ok((Array.isArray(raw.canvas.assets.timeline) ? raw.canvas.assets.timeline : [raw.canvas.assets.timeline]).every(path => readFileSync(join(value.out, path)).length <= COMPLETE_PV_SHARD_BYTES))
    assert.equal(raw.lyrics.file, 'lyrics.json'); assert.equal(JSON.parse(readFileSync(join(value.out, 'lyrics.json'), 'utf8')).length, 98)
    assert.equal(raw.audio, undefined); assert.equal(raw['x-dsh-mv-workshop'].fontsLicense, 'OFL-1.1'); assert.match(raw['x-dsh-mv-workshop'].lyricsLicense, /Mili-NonCommercial/)
    assert.equal(raw['x-dsh-pv-provenance'].dance.originalFilmMmd, false); assert.equal(raw['x-dsh-pv-provenance'].dance.aiAssisted, true)
    assert.equal(raw['x-dsh-pv-provenance'].dance.reference.sha256, value.authorizedReference.sha256)
    assert.ok(!JSON.stringify(raw).includes(value.root))
    assert.ok(readFileSync(join(value.out, 'NOTICE.md'), 'utf8').includes('Synthetic recorded-data notice'))
    assert.ok(readFileSync(join(value.out, 'art/NOTICE.md'), 'utf8').includes('`../LICENSE.txt`'))
    for (const path of ['SpaceMono-Bold.ttf', 'Anton-Regular.ttf', 'OFL_spacemono.txt', 'OFL_anton.txt']) assert.deepEqual(readFileSync(join(value.out, 'fonts', path)), readFileSync(join(value.upstream, 'film/ai_mascot_mv_world_execute_20260926/fonts', path)))
    assert.ok(!existsSync(join(value.out, 'ignored-private.capture.zip'))); assert.ok(!existsSync(join(value.out, 'dance-poses-v1.png')))
    assert.equal(dirname(report.sourceArt), join(dirname(value.out), 'source-art'))
    assert.deepEqual(readFileSync(report.sourceArt), readFileSync(value.dance))
    assert.ok(readFileSync(join(value.out, 'README.md'), 'utf8').includes(`../source-art/${basename(report.sourceArt)}`))
  } finally { removeFixture(value.root) }
})

test('complete PV builder: existing output files and input directories are never overwritten', async () => {
  const value = fixture()
  try {
    write(value.out, 'user.txt', 'User data stays intact')
    await assert.rejects(buildCompletePvPack(args(value)), /new or empty directory/)
    assert.equal(readFileSync(join(value.out, 'user.txt'), 'utf8'), 'User data stays intact')
    const original = hashes(value.base)
    await assert.rejects(buildCompletePvPack({ ...args(value), out: join(value.base, 'must-not-create') }), /inside any source/)
    assert.deepEqual(hashes(value.base), original)
  } finally { removeFixture(value.root) }
})

test('complete PV builder: a replacement vector timeline must keep all 97 shot identities and keyframe times', async () => {
  const value = fixture()
  try {
    const replacement = structuredClone(value.originalTimeline); replacement.shots[10].kf[0].o.push(['r', 1, 2, 3, 4, 0])
    const path = write(value.root, 'vector/timeline.json', json(replacement)), report = await buildCompletePvPack({ ...args(value), timeline: path })
    const raw = JSON.parse(readFileSync(join(value.out, 'mv.json'), 'utf8'))
    assert.deepEqual(readAsset(value.out, raw, 'timeline'), replacement); assert.equal(report.errors.length, 0)
    assert.equal(raw['x-dsh-pv-provenance'].replacementVectorTimeline.originalShotsAndKeyframeTimesRetained, true)
    replacement.shots[10].kf[0].t += 0.1; write(value.root, 'vector/timeline.json', json(replacement))
    await assert.rejects(buildCompletePvPack({ ...args(value), out: join(value.root, 'bad-vector'), timeline: path }), /97 original shots and exact keyframe times/)
    assert.equal(existsSync(join(value.root, 'bad-vector')), false)
  } finally { removeFixture(value.root) }
})

test('complete PV builder: mismatched references, dance sheets and raster hashes fail before any output', async () => {
  for (const mutate of [
    value => { value.authorizedReference.sha256 = '0'.repeat(64) },
    value => { value.provenance.dance.sheetSha256 = '0'.repeat(64); rebuildProvenance(value) },
    value => { value.provenance.atlasPages[0].sha256 = '0'.repeat(64); rebuildProvenance(value) },
    value => { value.provenance.timeline.sha256 = '0'.repeat(64); rebuildProvenance(value) },
    value => { value.provenance.dance.originalMmdOrH3CachesUsed = true; rebuildProvenance(value) },
  ]) {
    const value = fixture()
    try {
      mutate(value); await assert.rejects(buildCompletePvPack(args(value)), /reference|sheet|hash|MMD/)
      assert.equal(existsSync(value.out), false)
    } finally { removeFixture(value.root) }
  }
})

test('complete PV builder: sparse probes require explicit opt-in and are labeled not for publication', async () => {
  const value = fixture()
  try {
    const probe = { version: 1, size: [1280, 720], fps: 8, frames: [{ t: 20, ops: [] }, { t: 198, ops: [] }] }, bytes = Buffer.from(json(probe))
    write(value.raster, 'raster-timeline.json', bytes); value.provenance.frames = 2; Object.assign(value.provenance.timeline, { bytes: bytes.length, sha256: sha(bytes) }); rebuildProvenance(value)
    await assert.rejects(buildCompletePvPack(args(value)), /probes require --probe/)
    assert.equal(existsSync(value.out), false)
    const report = await buildCompletePvPack({ ...args(value), probe: true }), raw = JSON.parse(readFileSync(join(value.out, 'mv.json'), 'utf8'))
    assert.equal(report.developmentProbe, true); assert.match(raw.title, /DEVELOPER PROBE/); assert.match(raw.notice, /Do not publish/)
    assert.match(readFileSync(join(value.out, 'README.md'), 'utf8'), /NOT FOR PUBLICATION/)
    assert.equal(readAsset(value.out, raw, 'raster-timeline').fps, undefined)
  } finally { removeFixture(value.root) }
})

test('complete PV builder: music or exceeded file budgets are reported without silently dropping content', async () => {
  for (const kind of ['music', 'files']) {
    const value = fixture()
    try {
      if (kind === 'music') write(value.base, 'song.mp3', 'Synthetic banned-extension test bytes, not real audio')
      else for (let i = 0; i <= WORKSHOP_LIMITS.dshPvFiles; i++) write(value.base, `extra-${i}.md`, 'Synthetic additional data\n')
      await assert.rejects(buildCompletePvPack(args(value)), error => {
        assert.ok(error.report); assert.ok(error.report.errors.some(message => kind === 'music' ? /音频|视频/.test(message) : /文件太多/.test(message)))
        if (kind === 'files') assert.ok(error.report.files > WORKSHOP_LIMITS.dshPvFiles)
        return true
      })
      assert.equal(existsSync(value.out), false)
    } finally { removeFixture(value.root) }
  }
})

test('complete PV builder: wrong cue counts and renamed proprietary fonts fail before writing', async () => {
  for (const kind of ['lyrics', 'font']) {
    const value = fixture()
    try {
      if (kind === 'lyrics') write(value.upstream, value.lyricPath, '[00:00.00]One synthetic cue only\n')
      else write(value.upstream, 'film/ai_mascot_mv_world_execute_20260926/fonts/SpaceMono-Bold.ttf', font('Consolas', 'Regular'))
      await assert.rejects(buildCompletePvPack(args(value)), /98 reconstructed|身份不符/)
      assert.equal(existsSync(value.out), false)
    } finally { removeFixture(value.root) }
  }
  assert.equal(CONFIRMED_PV_REFERENCE.basename, 'DeepSeek1.png')
  assert.equal(CONFIRMED_PV_REFERENCE.sha256, '1ee43fb06f5d0c6a9b342d37b0dd74859b73b375946f0e938b7bdc41c42833f0')
  assert.match(CONFIRMED_PV_REFERENCE.permission, /unrelated images/)
})
