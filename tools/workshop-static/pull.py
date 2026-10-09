#!/usr/bin/env python3
"""Fixed-repository HTTPS pull; no Git hooks, downloaded code execution or SSH keys.

Run as a dedicated unprivileged systemd user. Download and hash all immutable
resources before activate.py atomically replaces the catalogue. A failed run
keeps the live index. Corresponding Source already uploaded by the maintainer
is retained from the root-owned pinned configuration, not inferred from Git.
"""
import argparse
import hashlib
import json
import pathlib
import shutil
import tempfile
import urllib.request
import urllib.error
import ssl
import socket
import http.client
import time
import os
from activate import activate, safe_relative, no_symlinks, digest, COMMIT, HASH, PACK_ID, MAX_FILE, MAX_TOTAL

ROOT = pathlib.Path('/srv/dsh-mv-workshop')
REPO = 'Alice-Marx/dsh-mv-workshop'
RAW = 'https://raw.githubusercontent.com/' + REPO + '/'
API = 'https://api.github.com/repos/' + REPO + '/commits/main'
SOURCES = pathlib.Path('/etc/dsh-mv-workshop-sources.json')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError('Unexpected upstream redirect rejected')


def transient(error):
    if isinstance(error, urllib.error.HTTPError):
        return error.code in (408, 429, 500, 502, 503, 504)
    reason = error.reason if isinstance(error, urllib.error.URLError) else error
    if isinstance(reason, ssl.SSLError):
        return False
    return isinstance(reason, (TimeoutError, socket.timeout, ConnectionError, http.client.IncompleteRead))


def bounded_retry(operation, sleep=time.sleep):
    for attempt in range(3):
        try:
            return operation()
        except Exception as error:
            if attempt == 2 or not transient(error):
                raise
            if isinstance(error, urllib.error.HTTPError):
                error.close()
            sleep(0.5 * (attempt + 1))


def fetch(url, maximum):
    # Default SSL context verifies certificates/hostnames. Ignore environment
    # proxies to make the service's transport explicit and credential-free.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    request = urllib.request.Request(url, headers={'User-Agent': 'dsh-mv-workshop-static/1', 'Accept': 'application/vnd.github+json'})
    def once():
        with opener.open(request, timeout=30) as response:
            data = response.read(maximum + 1)
        if len(data) > maximum:
            raise ValueError('Remote byte limit exceeded')
        return data
    return bounded_retry(once)


def inventory(index, sources):
    if index.get('format') != 'dsh-mv-workshop-index' or index.get('version') != 1 or index.get('repo') != REPO or not COMMIT.fullmatch(index.get('commit', '')):
        raise ValueError('Invalid official catalogue identity')
    packs = index.get('packs')
    if not isinstance(packs, list) or not 1 <= len(packs) <= 256:
        raise ValueError('Pack count exceeded')
    rows, seen, ids, total = [], set(), set(), 0
    def add(entry, path):
        nonlocal total
        safe_relative(path)
        size = entry.get('size')
        if not isinstance(size, int) or isinstance(size, bool) or not 0 <= size <= MAX_FILE or not HASH.fullmatch(entry.get('sha256', '')) or path in seen:
            raise ValueError('Invalid immutable resource metadata')
        seen.add(path); total += size
        if total > MAX_TOTAL or len(rows) >= 4096:
            raise ValueError('Snapshot budget exceeded')
        rows.append({'path': path, 'size': size, 'sha256': entry['sha256']})
    for pack in packs:
        pid = pack.get('id', '')
        if not PACK_ID.fullmatch(pid) or pid in ids or not isinstance(pack.get('files'), list) or not 1 <= len(pack['files']) <= 160:
            raise ValueError('Invalid pack declaration')
        ids.add(pid)
        for entry in pack['files']:
            add(entry, index['commit'] + '/packs/' + pid + '/' + safe_relative(entry['path']))
    for source in sources:
        path = safe_relative(source['path'])
        if not PACK_ID.fullmatch(source.get('id', '')) or not path.startswith('sources/' + source['id'] + '/') or not path.endswith('.zip'):
            raise ValueError('Invalid pinned Corresponding Source')
        add(source, path)
    return rows


def matching_file(target, row):
    no_symlinks(target)
    return target.is_file() and target.stat().st_size == row['size'] and digest(target) == row['sha256']


def resource_key(row):
    # The prefix changes when unrelated packs are committed. Match old verified
    # bytes only for the same pack/path AND the new index's exact size/hash.
    return (row['path'].split('/packs/', 1)[-1], row['size'], row['sha256'])


def cache_bytes(cache, row, download):
    no_symlinks(cache)
    target = cache / row['sha256']
    if target.exists():
        if not matching_file(target, row):
            raise ValueError('Verified resource cache was corrupted')
        return target.read_bytes()
    entries = list(cache.iterdir())
    for entry in entries:
        no_symlinks(entry)
        if not entry.is_file():
            raise ValueError('Unexpected cache entry')
    if len(entries) >= 4096 or sum(e.stat().st_size for e in entries) + row['size'] > MAX_TOTAL:
        raise ValueError('Verified resource cache budget exceeded; operator maintenance required')
    data = download()
    if len(data) != row['size'] or hashlib.sha256(data).hexdigest() != row['sha256']:
        raise ValueError('Upstream size/SHA mismatch')
    # Private bounded cache survives failed runs; only verified bytes are named
    # by SHA. Public catalogue remains index-last and atomic in activate.py.
    fd, temporary = tempfile.mkstemp(prefix='.pending-', dir=cache)
    temporary = pathlib.Path(temporary)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data); stream.flush(); os.fsync(stream.fileno())
        os.replace(temporary, target)
    finally:
        if temporary.exists():
            no_symlinks(temporary)
            if temporary.parent.resolve() != cache.resolve():
                raise ValueError('Unsafe cache temporary cleanup')
            temporary.unlink()
    return data


def pull(apply=False):
    commit = json.loads(fetch(API, 2 * 1024 * 1024)).get('sha', '')
    if not COMMIT.fullmatch(commit):
        raise ValueError('No immutable official Git commit')
    index_bytes = fetch(RAW + commit + '/index.json', 2 * 1024 * 1024)
    index = json.loads(index_bytes)
    sources = json.loads(SOURCES.read_bytes())
    entries = inventory(index, sources)
    total = len(index_bytes) + sum(e['size'] for e in entries)
    if total > MAX_TOTAL:
        raise ValueError('Total including index exceeds budget')
    live = ROOT / 'public'
    no_symlinks(live)
    current = live / 'main/index.json'
    if current.is_file() and current.read_bytes() == index_bytes:
        # Check immutable files even when the catalogue did not change.
        for row in entries:
            target = live / row['path']; no_symlinks(target)
            if not target.is_file() or target.stat().st_size != row['size'] or digest(target) != row['sha256']:
                break
        else:
            return {'status': 'unchanged', 'indexCommit': commit, 'resourceCount': len(entries)}
    stage_root = ROOT / 'staging'; no_symlinks(stage_root)
    cache = stage_root / 'verified-cache'; no_symlinks(cache)
    cache.mkdir(exist_ok=True, mode=0o700)
    old_files = {}
    if current.is_file():
        old_index = json.loads(current.read_bytes())
        old_files = {resource_key(row): live / row['path'] for row in inventory(old_index, sources)}
    stage = pathlib.Path(tempfile.mkdtemp(prefix='pull-', dir=stage_root))
    try:
        for row in entries:
            previous = live / row['path']; no_symlinks(previous)
            target = stage / row['path']; target.parent.mkdir(parents=True, exist_ok=True)
            older = old_files.get(resource_key(row))
            if matching_file(previous, row):
                shutil.copyfile(previous, target)
            elif older is not None and matching_file(older, row):
                shutil.copyfile(older, target)
            elif row['path'].startswith('sources/'):
                raise ValueError('Maintainer must upload new pinned Corresponding Source first')
            else:
                data = cache_bytes(cache, row, lambda: fetch(RAW + row['path'], max(1, row['size'])))
                with target.open('xb') as stream:
                    stream.write(data)
        (stage / 'main').mkdir()
        (stage / 'main/index.json').write_bytes(index_bytes)
        manifest = {'format': 'dsh-mv-workshop-static-snapshot', 'version': 1, 'repository': REPO, 'indexCommit': commit, 'resourceCommit': index['commit'], 'index': {'path': 'main/index.json', 'size': len(index_bytes), 'sha256': hashlib.sha256(index_bytes).hexdigest()}, 'packCount': len(index['packs']), 'resourceCount': len(entries), 'totalBytes': total, 'sources': sources, 'files': entries}
        (stage / 'snapshot-manifest.json').write_text(json.dumps(manifest), encoding='utf8')
        result = activate(stage, live, apply)
        return {'status': 'published' if apply else 'verified', **result}
    finally:
        # Only this run's newly-created, resolved, non-symlink staging directory.
        resolved = stage.resolve()
        if resolved.parent != stage_root.resolve() or not resolved.name.startswith('pull-') or stage.is_symlink():
            raise ValueError('Unsafe staging cleanup target')
        shutil.rmtree(resolved)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    print(json.dumps(pull(args.apply)))
