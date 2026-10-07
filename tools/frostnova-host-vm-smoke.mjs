#!/usr/bin/env node
/** Workshop-equivalent metadata/assets and structural Host VM preparation QA.
 * Does not compile GPU shaders or claim to verify visible rendering.
 * Usage: node tools/frostnova-host-vm-smoke.mjs <pack-dir> <output-dir>
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { checkScene, compileScene } from '../.dsh-plugin/shared/mv-scene-host.mjs'
import { validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { parseLyrics } from '../.dsh-plugin/shared/mv-lyrics.mjs'
assert.ok(process.argv[2] && process.argv[3], 'Usage: frostnova-host-vm-smoke.mjs <pack-dir> <output-dir>')
const root = resolve(process.argv[2]), out = resolve(process.argv[3]), files = []
async function collect(sub = '') {
  for (const ent of await readdir(join(root, sub), { withFileTypes: true })) {
    const path = [sub, ent.name].filter(Boolean).join('/')
    if (ent.isDirectory()) await collect(path)
    else { const bytes = await readFile(join(root, path)); files.push({ path, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }) }
  }
}
await collect()
const raw = JSON.parse(await readFile(join(root, 'mv.json'), 'utf8')), id = raw['x-dsh-mv-workshop'].id
const result = await validateWorkshopPack({ id, files, readText: p => readFile(join(root, p), 'utf8'), readBytes: p => readFile(join(root, p)) })
assert.ok(result.pack, result.errors.join('; '))
const pack = result.pack, assets = {}
// Exact merge semantics from workshop/scripts/validate.mjs and the player:
// arrays concatenate, non-array fields keep the first shard's value.
for (const [name, refs] of Object.entries(pack.canvas.assets ?? {})) {
  const list = Array.isArray(refs) ? refs : [refs]
  assert.ok(list.every(p => /\.json$/i.test(p)), `This pack's offline data must be JSON: ${name}`)
  const shards = await Promise.all(list.map(p => readFile(join(root, p), 'utf8').then(JSON.parse)))
  const merged = {}
  for (const shard of shards) for (const [key, value] of Object.entries(shard ?? {})) {
    if (Array.isArray(value) && Array.isArray(merged[key])) merged[key] = merged[key].concat(value)
    else if (!(key in merged)) merged[key] = value
  }
  assets[name] = shards.length === 1 ? shards[0] : merged
}
const info = { duration: pack.duration, title: pack.title, artist: pack.artist ?? '', sections: pack.sections ?? [], bpm: pack.canvas.bpm ?? 0, beatOffset: pack.canvas.beatOffset ?? 0, assets }
const times = [.5, pack.duration * .25, pack.duration * .5, pack.duration * .75, pack.duration - 1].map(t => Math.round(t * 10) / 10)
const source = await readFile(join(root, pack.canvas.script), 'utf8'), options = { times, cols: pack.canvas.size[0], rows: pack.canvas.size[1], output: pack.canvas.output, size: pack.canvas.size, info }
const pluginHost = checkScene(source, options)
let setupDiagnostic = null
if (!pluginHost.ok) {
  const compiled = compileScene(source, { output: pack.canvas.output })
  if (compiled.ok) { try { compiled.setup({ ...info, width: pack.canvas.size[0], height: pack.canvas.size[1] }) } catch (error) { setupDiagnostic = String(error.stack || error).slice(0, 6000) } }
}
const vendorUrl = new URL('../../dsh-mv-workshop/scripts/vendor/mv-scene-host.mjs', import.meta.url)
const workshopCi = existsSync(fileURLToPath(vendorUrl)) ? (await import(vendorUrl.href)).checkScene(source, options) : null
const report = { id, files: files.length, bytes: files.reduce((n, f) => n + f.size, 0), scriptHash: files.find(f => f.path === pack.canvas.script).sha256, manifestErrors: result.errors, manifestWarnings: result.warnings, assetNames: Object.keys(assets), cueCount: parseLyrics(pack.lyrics.file, await readFile(join(root, pack.lyrics.file), 'utf8')).length, audioFiles: files.filter(f => /\.(mp3|mp4|wav|flac|ogg|m4a|aac|opus|webm)$/i.test(f.path)).length, pluginHost, workshopCi, setupDiagnostic, gpuValidated: false, passed: result.errors.length === 0 && pluginHost.ok && (!workshopCi || workshopCi.ok) }
await mkdir(out, { recursive: true }); await writeFile(join(out, 'host-report.json'), JSON.stringify(report, null, 2) + '\n')
const summary = check => check && ({ ok: check.ok, problems: check.problems, frames: check.frames, preparation: check.preparation && { steps: check.preparation.steps, ms: check.preparation.ms, first: check.preparation.progress[0], last: check.preparation.progress.at(-1) } })
console.log(JSON.stringify({ ...report, pluginHost: summary(pluginHost), workshopCi: summary(workshopCi), out }))
if (!report.passed) process.exitCode = 1
