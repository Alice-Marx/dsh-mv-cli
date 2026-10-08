import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prepareSnapshot, safePath, sha256 } from './prepare.mjs';

const commit = 'a'.repeat(40);
const resourceCommit = 'b'.repeat(40);
const bytes = Buffer.from('original Git blob\n');
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'dsh-static-fixture-'));
  const out = path.join(root, 'snapshot');
  const index = { format: 'dsh-mv-workshop-index', version: 1, repo: 'Alice-Marx/dsh-mv-workshop', commit: resourceCommit, packs: [{ id: 'test-pack', files: [{ path: 'NOTICE.md', size: bytes.length, sha256: sha256(bytes) }] }] };
  const indexBytes = Buffer.from(`${JSON.stringify(index)}\n`);
  const reader = { indexCommit: commit, read: (ref, relative) => relative === 'index.json' ? indexBytes : (assert.equal(ref, resourceCommit), bytes) };
  function cleanup() {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.match(path.basename(root), /^dsh-static-fixture-/);
    rmSync(root, { recursive: true, force: true });
  }
  return { root, out, index, indexBytes, reader, cleanup };
}
test('exports index and pack bytes unchanged using the pinned resource commit', () => {
  const f = fixture();
  try {
    const manifest = prepareSnapshot({ out: f.out, reader: f.reader });
    assert.equal(manifest.indexCommit, commit);
    assert.equal(manifest.resourceCommit, resourceCommit);
    assert.equal(manifest.packCount, 1);
    assert.deepEqual(readFileSync(path.join(f.out, 'main/index.json')), f.indexBytes);
    assert.deepEqual(readFileSync(path.join(f.out, resourceCommit, 'packs/test-pack/NOTICE.md')), bytes);
  } finally { f.cleanup(); }
});
test('rejects unsafe paths, music and key files', () => {
  for (const name of ['../bad', '/bad', 'a//b', 'a/./b', '.env', 'a/.git/config', 'a\\b', 'a:b', 'a?token=x', 'a%2fb', 'song.mp3', 'secret.pem']) assert.throws(() => safePath(name));
});
test('hash failure creates no partially exported output', () => {
  const f = fixture();
  try {
    f.reader.read = (ref, relative) => relative === 'index.json' ? f.indexBytes : Buffer.from('broken');
    assert.throws(() => prepareSnapshot({ out: f.out, reader: f.reader }), /mismatch/);
    assert.equal(existsSync(f.out), false);
  } finally { f.cleanup(); }
});
test('existing output is never overwritten', () => {
  const f = fixture();
  try {
    prepareSnapshot({ out: f.out, reader: f.reader });
    assert.throws(() => prepareSnapshot({ out: f.out, reader: f.reader }), /new directory/);
    assert.deepEqual(readFileSync(path.join(f.out, 'main/index.json')), f.indexBytes);
  } finally { f.cleanup(); }
});
test('rejects untrusted repository identity and duplicate pack paths', () => {
  const f = fixture();
  try {
    f.index.repo = 'another/repo';
    f.reader.read = () => Buffer.from(JSON.stringify(f.index));
    assert.throws(() => prepareSnapshot({ out: f.out, reader: f.reader }), /identity/);
    f.index.repo = 'Alice-Marx/dsh-mv-workshop';
    f.index.packs.push(f.index.packs[0]);
    f.reader.read = (ref, relative) => relative === 'index.json' ? Buffer.from(JSON.stringify(f.index)) : bytes;
    assert.throws(() => prepareSnapshot({ out: f.out, reader: f.reader }), /duplicate pack/);
  } finally { f.cleanup(); }
});
test('explicit corresponding-source archive requires its expected SHA256', () => {
  const f = fixture();
  try {
    const source = path.join(f.root, 'corresponding-source.zip');
    writeFileSync(source, bytes);
    const sourceArchives = [{ id: 'test-pack', file: source, sha256: sha256(bytes) }];
    const manifest = prepareSnapshot({ out: f.out, reader: f.reader, sourceArchives });
    assert.equal(manifest.sources[0].size, bytes.length);
    assert.deepEqual(readFileSync(path.join(f.out, 'sources/test-pack/corresponding-source.zip')), bytes);
  } finally { f.cleanup(); }
});
