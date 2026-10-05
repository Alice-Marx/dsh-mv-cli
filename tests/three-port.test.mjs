import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateWorkshopPack } from '../.dsh-plugin/shared/mv-workshop.mjs'
import { validatePackForAgent, previewFrameForAgent } from '../.dsh-plugin/shared/mv-agent-tools.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = join(process.env.DSH_MV_PORT_SRC || '/workspace/src3', 'world-execute-me-mv')
test('original Three.js adapter builds offline with all 12 sections and an explicit author MIT opt-in', { skip: existsSync(join(src, 'app.js')) ? false : 'no upstream checkout (DSH_MV_PORT_SRC)' }, async () => {
  const out = join(mkdtempSync(join(tmpdir(), 'dsh-mv-three-')), 'pack')
  execFileSync(process.execPath, ['presets/ports/wiers-jack-three/build.mjs', src, out, '--offline-app'], { cwd: root, stdio: 'pipe' })
  const readText = path => readFileSync(join(out, path), 'utf8')
  const files = readdirSync(out).map(path => ({ path, size: statSync(join(out, path)).size }))
  const result = await validateWorkshopPack({ id: 'world-execute-me-three', files, readText })
  assert.deepEqual(result.errors, [])
  assert.equal(result.pack.canvas.output, 'webgl')
  assert.equal(result.pack.duration, 213)
  assert.equal(result.pack.sections.length, 12)
  assert.match(readText('scenes.js'), /UnrealBloomPass/)
  assert.doesNotMatch(readText('scenes.js'), /\bLYRICS\b|Switch on the power line|though we are trapped/)
  assert.match(readText('LICENSE.txt'), /Copyright 2010-2023 Three.js Authors/)
  assert.match(readText('NOTICE.md'), /no upstream LICENSE text/)
  const provenance = JSON.parse(readText('source-provenance.json'))
  assert.equal(provenance.authorGrant, null)
  assert.equal(provenance.sceneCount, 12)
  assert.equal(Object.keys(provenance.modules).filter(p => /sections\/s\d/.test(p)).length, 12)
  assert.match(provenance.appSha256, /^[a-f0-9]{64}$/)
  const checked = await validatePackForAgent({ path: out })
  assert.equal(checked.ok, true, JSON.stringify(checked.problems))
  assert.equal(checked.gpuValidated, false)
  const preview = await previewFrameForAgent({ path: out, t: 30 })
  assert.equal(preview.ok, true, preview.problems.join('\n'))
  assert.equal(preview.gpuValidated, false)
  assert.ok(preview.drawCalls > 10)

  const publicOut = join(mkdtempSync(join(tmpdir(), 'dsh-mv-three-public-')), 'pack')
  execFileSync(process.execPath, ['presets/ports/wiers-jack-three/build.mjs', src, publicOut, '--offline-app', '--author-mit-permission'], { cwd: root, stdio: 'pipe' })
  const publicReadText = path => readFileSync(join(publicOut, path), 'utf8')
  const publicResult = await validateWorkshopPack({
    id: 'world-execute-me-three',
    files: readdirSync(publicOut).map(path => ({ path, size: statSync(join(publicOut, path)).size })),
    readText: publicReadText,
  })
  assert.deepEqual(publicResult.errors, [])
  assert.equal(publicResult.meta.license, 'MIT')
  assert.equal(publicResult.meta.version, '1.0.1')
  assert.equal(publicResult.meta.requires, '0.9.2')
  assert.equal(publicReadText('scenes.js'), readText('scenes.js'), 'license opt-in must not change rendered code')
  assert.match(publicReadText('LICENSE.txt'), /Copyright \(c\) wiers-jack/)
  assert.match(publicReadText('LICENSE.txt'), /Copyright \(c\) Alice-Marx/)
  assert.match(publicReadText('LICENSE.txt'), /Copyright 2010-2023 Three.js Authors/)
  assert.doesNotMatch(publicReadText('LICENSE.txt'), /UPSTREAM LICENSE STATUS|newly invented|Resolve the missing/)
  assert.match(publicReadText('NOTICE.md'), /maintainer-reported direct author authorization/)
  assert.doesNotMatch(publicReadText('NOTICE.md'), /does not claim the upstream is MIT|before publishing/)
  const publicProvenance = JSON.parse(publicReadText('source-provenance.json'))
  assert.equal(publicProvenance.upstreamPackageLicense, provenance.upstreamPackageLicense, 'preserve source metadata instead of pretending upstream was changed')
  assert.equal(publicProvenance.authorGrant.license, 'MIT')
  assert.equal(publicProvenance.authorGrant.copyrightHolder, 'wiers-jack')
  assert.equal(publicProvenance.authorGrant.confirmedOn, '2026-10-05')
  assert.match(publicProvenance.authorGrant.evidenceType, /not an upstream LICENSE/)
  assert.equal(publicProvenance.adapterLicense, 'MIT')
  assert.equal(publicProvenance.bundleSha256, provenance.bundleSha256)
  assert.ok(readdirSync(publicOut).every(path => !/\.(?:lrc|mp3|wav|ogg|flac)$/i.test(path)))
})
