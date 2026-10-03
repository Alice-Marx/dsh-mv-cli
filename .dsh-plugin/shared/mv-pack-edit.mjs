/**
 * Calibration writes and analysis reads for MV packs. Writes go only to a
 * fixed set of file names inside the pack folder (lyrics.lrc, mv.json,
 * timing.json, sections.json); the previous version is copied to
 * .dsh-mv-backup/ first (newest 10 kept per file). mv.json must parse.
 */
import { copyFile, mkdir, open, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { MV_PACK_MANIFEST, parseMvPack } from './mv-pack.mjs'
import { ANALYSIS_FILES, BACKUP_DIR, BACKUP_KEEP, PACK_TEXT_FILES, parseAnalysisRead, parsePackWriteText } from './mv-calib-protocol.mjs'

export { ANALYSIS_FILES, BACKUP_DIR, BACKUP_KEEP, PACK_TEXT_FILES, parseAnalysisRead, parsePackWriteText }

import { readPack } from './mv-pack-host.mjs'

const stampName = (date = new Date()) => date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-')

export async function writePackText({ manifestPath, file, text }, { now = () => new Date() } = {}) {
  const { packDir, manifestPath: real } = await readPack(manifestPath)
  if (file === MV_PACK_MANIFEST) parseMvPack(text)
  if (file.endsWith('.json') && file !== MV_PACK_MANIFEST) JSON.parse(text)
  const target = file === MV_PACK_MANIFEST ? real : join(packDir, file)
  let backup = null
  try {
    if ((await stat(target)).isFile()) {
      const dir = join(packDir, BACKUP_DIR)
      await mkdir(dir, { recursive: true })
      backup = join(dir, `${file}.${stampName(now())}`)
      await copyFile(target, backup)
      const old = (await readdir(dir)).filter(name => name.startsWith(`${file}.`)).sort()
      for (const name of old.slice(0, Math.max(0, old.length - BACKUP_KEEP))) await rm(join(dir, name), { force: true })
    }
  } catch (error) { if (error?.code !== 'ENOENT') throw error }
  const part = `${target}.part`
  await writeFile(part, text, 'utf8')
  await rename(part, target)
  return { path: target, backup, bytes: Buffer.byteLength(text, 'utf8') }
}

export async function readAnalysis({ manifestPath, name, offset, length }) {
  const { packDir } = await readPack(manifestPath)
  const path = join(packDir, ...ANALYSIS_FILES[name].split('/'))
  let handle
  try { handle = await open(path, 'r') } catch (error) { if (error?.code === 'ENOENT') return { exists: false, name, size: 0, offset, bytes: 0, done: true, base64: '' }; throw error }
  try {
    const { size } = await handle.stat()
    const want = Math.max(0, Math.min(length, size - offset))
    const buffer = Buffer.alloc(want)
    const { bytesRead } = want ? await handle.read(buffer, 0, want, offset) : { bytesRead: 0 }
    return { exists: true, name, size, offset, bytes: bytesRead, done: offset + bytesRead >= size, base64: buffer.subarray(0, bytesRead).toString('base64') }
  } finally { await handle.close() }
}
