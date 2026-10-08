#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMIT = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_FILE_BYTES = 32 * 1024 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const MAX_FILES = 4096;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function safePath(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_@./-]+$/.test(value) || value.startsWith('/') || value.includes('//')) {
    throw new Error(`Unsafe resource path: ${JSON.stringify(value)}`);
  }
  if (value.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) {
    throw new Error(`Unsafe resource path: ${JSON.stringify(value)}`);
  }
  if (/\.(?:mp3|m4a|ogg|wav|aac|flac|opus|aiff|pem|key)$/i.test(value)) {
    throw new Error(`Music or key material is not a static workshop resource: ${value}`);
  }
  return value;
}

export function gitReader(repo, ref = 'origin/main') {
  const absoluteRepo = path.resolve(repo);
  if (typeof ref !== 'string' || !/^[A-Za-z0-9_./-]+$/.test(ref) || ref.startsWith('-')) throw new Error('Unsafe Git ref');
  const git = args => execFileSync('git', ['-C', absoluteRepo, ...args], { maxBuffer: MAX_FILE_BYTES + 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const top = git(['rev-parse', '--show-toplevel']).toString().trim();
  if (path.resolve(top).toLowerCase() !== absoluteRepo.toLowerCase()) throw new Error('Repository path must be its Git root');
  const indexCommit = git(['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).toString().trim();
  if (!COMMIT.test(indexCommit)) throw new Error('Unable to pin index Git commit');
  return {
    indexCommit,
    read(commit, relative) {
      if (!COMMIT.test(commit)) throw new Error('Resource commit must be complete immutable SHA');
      safePath(relative);
      const listing = git(['ls-tree', '-z', commit, '--', relative]).toString();
      const match = /^(100644|100755) blob ([a-f0-9]{40})\t([^\0]+)\0$/.exec(listing);
      if (!match || match[3] !== relative) throw new Error(`Missing regular Git blob: ${relative}`);
      return git(['cat-file', 'blob', match[2]]);
    },
  };
}

export function prepareSnapshot({ repo, ref = 'origin/main', out, reader, sourceArchives = [] }) {
  const source = reader || gitReader(repo, ref);
  if (!COMMIT.test(source.indexCommit)) throw new Error('Index commit must be complete immutable SHA');
  const output = path.resolve(out);
  if (existsSync(output)) throw new Error('Output must be a new directory; existing files are never overwritten');
  const indexBytes = source.read(source.indexCommit, 'index.json');
  if (indexBytes.length > 2 * 1024 * 1024) throw new Error('Index size exceeded');
  const index = JSON.parse(indexBytes.toString('utf8'));
  if (index.format !== 'dsh-mv-workshop-index' || index.version !== 1 || index.repo !== 'Alice-Marx/dsh-mv-workshop' || !COMMIT.test(index.commit)) {
    throw new Error('Unexpected official workshop index identity or commit');
  }
  if (!Array.isArray(index.packs) || !index.packs.length || index.packs.length > 256) throw new Error('Invalid pack list');
  const entries = [];
  const blobs = new Map();
  const packIds = new Set();
  let totalBytes = indexBytes.length;
  function add(relative, bytes, expectedSize, expectedHash) {
    safePath(relative);
    if (blobs.has(relative)) throw new Error(`Duplicate resource: ${relative}`);
    if (!Number.isSafeInteger(expectedSize) || expectedSize < 0 || expectedSize > MAX_FILE_BYTES || !HASH.test(expectedHash)) throw new Error(`Invalid resource metadata: ${relative}`);
    if (bytes.length !== expectedSize || sha256(bytes) !== expectedHash) throw new Error(`Size/SHA256 mismatch: ${relative}`);
    if (entries.length >= MAX_FILES || totalBytes + bytes.length > MAX_TOTAL_BYTES) throw new Error('Snapshot size/file count exceeded');
    blobs.set(relative, bytes);
    entries.push({ path: relative, size: bytes.length, sha256: expectedHash });
    totalBytes += bytes.length;
  }
  for (const pack of index.packs) {
    if (!ID.test(pack.id) || packIds.has(pack.id) || !Array.isArray(pack.files) || !pack.files.length) throw new Error('Invalid or duplicate pack');
    packIds.add(pack.id);
    for (const file of pack.files) {
      safePath(file.path);
      const relative = `packs/${pack.id}/${file.path}`;
      add(`${index.commit}/${relative}`, source.read(index.commit, relative), file.size, file.sha256);
    }
  }
  const sources = [];
  for (const archive of sourceArchives) {
    if (!archive || !ID.test(archive.id) || !HASH.test(archive.sha256)) throw new Error('Invalid source archive metadata');
    const name = safePath(archive.name || path.basename(archive.file));
    if (name.includes('/') || !name.endsWith('.zip')) throw new Error('Corresponding source must be named ZIP');
    const archiveStat = lstatSync(archive.file);
    if (!archiveStat.isFile() || archiveStat.isSymbolicLink() || archiveStat.size > MAX_FILE_BYTES) throw new Error('Corresponding source must be a bounded regular file');
    const bytes = readFileSync(archive.file);
    const relative = `sources/${archive.id}/${name}`;
    add(relative, bytes, bytes.length, archive.sha256);
    sources.push({ id: archive.id, path: relative, sha256: archive.sha256, size: bytes.length });
  }
  // Everything is checked before output creation: no half-export on hash failure.
  mkdirSync(output, { recursive: true });
  for (const [relative, bytes] of blobs) {
    const destination = path.join(output, ...relative.split('/'));
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, bytes, { flag: 'wx', mode: 0o644 });
  }
  mkdirSync(path.join(output, 'main'));
  writeFileSync(path.join(output, 'main', 'index.json'), indexBytes, { flag: 'wx', mode: 0o644 });
  const manifest = {
    format: 'dsh-mv-workshop-static-snapshot', version: 1,
    repository: 'Alice-Marx/dsh-mv-workshop', indexCommit: source.indexCommit, resourceCommit: index.commit,
    index: { path: 'main/index.json', size: indexBytes.length, sha256: sha256(indexBytes) },
    packCount: index.packs.length, resourceCount: entries.length, totalBytes,
    sources, files: entries,
  };
  writeFileSync(path.join(output, 'snapshot-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx', mode: 0o644 });
  return manifest;
}

function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--repo', '--ref', '--out', '--sources'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: prepare.mjs --repo ROOT --out NEW_DIR [--ref origin/main] [--sources LOCAL_JSON]');
    options[args[i].slice(2)] = args[i + 1];
  }
  if (!options.repo || !options.out) throw new Error('Both --repo and --out are required');
  const sourceArchives = options.sources ? JSON.parse(readFileSync(options.sources, 'utf8')) : [];
  const manifest = prepareSnapshot({ ...options, sourceArchives });
  console.log(JSON.stringify({ indexCommit: manifest.indexCommit, resourceCommit: manifest.resourceCommit, packCount: manifest.packCount, resourceCount: manifest.resourceCount, totalBytes: manifest.totalBytes, out: path.resolve(options.out) }, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
