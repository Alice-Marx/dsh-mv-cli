#!/usr/bin/env python3
"""Verify an operator-uploaded snapshot and publish static bytes, index last.

This helper is sent through SSH stdin, not executed from the workshop repo.
It never edits nginx, services, firewalls, SSH configuration or credentials.
"""
import hashlib
import json
import os
import pathlib
import re
import shutil
import sys
import uuid

COMMIT = re.compile(r"^[a-f0-9]{40}$")
HASH = re.compile(r"^[a-f0-9]{64}$")
PACK_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_FILE = 32 * 1024 * 1024
MAX_TOTAL = 256 * 1024 * 1024


def safe_relative(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9_@./-]+", value):
        raise ValueError("Unsafe resource path")
    if value.startswith("/") or any(not p or p in (".", "..") or p.startswith(".") for p in value.split("/")):
        raise ValueError("Unsafe resource path")
    if re.search(r"\.(mp3|m4a|ogg|wav|aac|flac|opus|aiff|pem|key)$", value, re.I):
        raise ValueError("Music/key material rejected")
    return value


def no_symlinks(target):
    for part in (target, *target.parents):
        if part.is_symlink():
            raise ValueError("Symlink rejected")


def digest(file):
    value = hashlib.sha256()
    with file.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def verify_file(root, entry):
    relative = safe_relative(entry["path"])
    if not isinstance(entry.get("size"), int) or isinstance(entry["size"], bool) or not 0 <= entry["size"] <= MAX_FILE or not HASH.fullmatch(entry.get("sha256", "")):
        raise ValueError("Invalid file metadata")
    file = root.joinpath(*relative.split("/"))
    no_symlinks(file)
    if not file.is_file() or file.stat().st_size != entry["size"] or digest(file) != entry["sha256"]:
        raise ValueError("Size/SHA256 mismatch: " + relative)
    return file


def activate(staging, public, apply=False):
    staging = pathlib.Path(staging).absolute()
    public = pathlib.Path(public).absolute()
    # Explicitly scoped operator directory, never a filesystem/workspace root.
    if str(public) != "/srv/dsh-mv-workshop/public" or not str(staging).startswith("/srv/dsh-mv-workshop/staging/"):
        raise ValueError("Deployment outside dedicated workshop directories rejected")
    no_symlinks(staging)
    no_symlinks(public)
    manifest_path = staging / "snapshot-manifest.json"
    if manifest_path.stat().st_size > 2 * 1024 * 1024:
        raise ValueError("Manifest too large")
    manifest = json.loads(manifest_path.read_bytes())
    if manifest.get("format") != "dsh-mv-workshop-static-snapshot" or manifest.get("version") != 1 or manifest.get("repository") != "Alice-Marx/dsh-mv-workshop":
        raise ValueError("Unexpected official snapshot identity")
    if not COMMIT.fullmatch(manifest.get("indexCommit", "")) or not COMMIT.fullmatch(manifest.get("resourceCommit", "")):
        raise ValueError("Invalid immutable commits")
    if manifest["index"]["path"] != "main/index.json":
        raise ValueError("Unexpected index path")
    index_file = verify_file(staging, manifest["index"])
    index = json.loads(index_file.read_bytes())
    if index.get("repo") != manifest["repository"] or index.get("format") != "dsh-mv-workshop-index" or index.get("version") != 1 or index.get("commit") != manifest["resourceCommit"]:
        raise ValueError("Snapshot index identity/commit mismatch")
    expected = {}
    for pack in index["packs"]:
        if not PACK_ID.fullmatch(pack["id"]):
            raise ValueError("Invalid pack ID")
        for entry in pack["files"]:
            relative = safe_relative(manifest["resourceCommit"] + "/packs/" + pack["id"] + "/" + safe_relative(entry["path"]))
            if relative in expected:
                raise ValueError("Duplicate index resource")
            expected[relative] = {"path": relative, "size": entry["size"], "sha256": entry["sha256"]}
    for source in manifest.get("sources", []):
        relative = safe_relative(source["path"])
        if not PACK_ID.fullmatch(source["id"]) or not relative.startswith("sources/" + source["id"] + "/") or not relative.endswith(".zip") or relative in expected:
            raise ValueError("Invalid corresponding-source archive")
        expected[relative] = {"path": relative, "size": source["size"], "sha256": source["sha256"]}
    files = manifest["files"]
    if len(files) != len(expected) or len(files) != manifest["resourceCount"] or len(files) > 4096 or len(index["packs"]) != manifest["packCount"]:
        raise ValueError("Snapshot file/pack count mismatch")
    seen = set()
    total = manifest["index"]["size"]
    for entry in files:
        if entry["path"] in seen or entry != expected.get(entry["path"]):
            raise ValueError("Snapshot/index file declaration mismatch")
        seen.add(entry["path"])
        verify_file(staging, entry)
        total += entry["size"]
        target = public.joinpath(*entry["path"].split("/"))
        no_symlinks(target)
        if target.exists() and (not target.is_file() or target.stat().st_size != entry["size"] or digest(target) != entry["sha256"]):
            raise ValueError("Existing immutable URL differs: " + entry["path"])
    if total > MAX_TOTAL or total != manifest["totalBytes"]:
        raise ValueError("Snapshot total size mismatch")
    report = {"verified": True, "published": False, "indexCommit": manifest["indexCommit"], "resourceCommit": manifest["resourceCommit"], "packCount": manifest["packCount"], "resourceCount": len(files), "totalBytes": total}
    if not apply:
        return report
    public.mkdir(parents=True, exist_ok=True, mode=0o755)
    for entry in files:
        source = staging.joinpath(*entry["path"].split("/"))
        target = public.joinpath(*entry["path"].split("/"))
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
        if not target.exists():
            # Complete the copy before creating its immutable public URL. A
            # failed transfer leaves the previous index and URL bytes untouched.
            temporary_blob = target.parent / (".blob-" + uuid.uuid4().hex + ".tmp")
            try:
                with temporary_blob.open("xb") as destination, source.open("rb") as original:
                    shutil.copyfileobj(original, destination)
                    destination.flush()
                    os.fsync(destination.fileno())
                temporary_blob.chmod(0o644)
                os.link(temporary_blob, target)
            finally:
                if temporary_blob.exists():
                    temporary_blob.unlink()
    main = public / "main"
    main.mkdir(exist_ok=True, mode=0o755)
    live_index = main / "index.json"
    no_symlinks(live_index)
    if live_index.exists():
        backups = public.parent / "index-backups"
        no_symlinks(backups)
        backups.mkdir(exist_ok=True, mode=0o700)
        backup = backups / (digest(live_index) + ".json")
        if not backup.exists():
            shutil.copyfile(live_index, backup)
            backup.chmod(0o600)
    temporary = main / ("index-" + uuid.uuid4().hex + ".tmp")
    with temporary.open("xb") as destination, index_file.open("rb") as original:
        shutil.copyfileobj(original, destination)
        destination.flush()
        os.fsync(destination.fileno())
    temporary.chmod(0o644)
    os.replace(temporary, live_index)
    report["published"] = True
    return report


if __name__ == "__main__":
    try:
        if len(sys.argv) not in (3, 4) or (len(sys.argv) == 4 and sys.argv[3] != "--apply"):
            raise ValueError("Usage: activate.py STAGING_SNAPSHOT /srv/dsh-mv-workshop/public [--apply]")
        print(json.dumps(activate(sys.argv[1], sys.argv[2], len(sys.argv) == 4), indent=2))
    except Exception as error:
        print(type(error).__name__ + ": " + str(error), file=sys.stderr)
        sys.exit(1)
