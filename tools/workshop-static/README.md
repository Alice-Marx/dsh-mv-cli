# Workshop HTTPS static source

These operator tools prepare a byte-identical, fixed-commit copy of the official
workshop. They do not render MVs, upload music, run package scripts, provide an
arbitrary GitHub proxy, or change TLS/proxy settings.

## Prepare and verify locally

```powershell
node tools/workshop-static/prepare.mjs --repo ../dsh-mv-workshop --ref origin/main --out NEW_EMPTY_OUTPUT_PATH
node --test tools/workshop-static/prepare.test.mjs
```

`deploy.ps1` defaults to a non-mutating plan and requires `-Apply` for uploading
and publishing. It requires an existing task-specific known_hosts entry and
uses `BatchMode`, `IdentitiesOnly`, strict host-key verification and no global
SSH config. It never edits nginx, certificates, ports, firewalls or services.

```powershell
./tools/workshop-static/deploy.ps1 -Snapshot PREPARED_OUTPUT -Server APPROVED_HOST -IdentityFile EXISTING_LOCAL_KEY -KnownHosts TASK_KNOWN_HOSTS
# Add -Apply only after SSH diagnostics and the exact server/location plan have been approved.
```

The uploaded `activate.py` helper checks every byte against the original index
again, refuses conflicting existing commit URLs and retains previous indexes in
a private backup directory. All copied resources are completed before their
immutable URLs appear. The index is atomically replaced last. Staging is retained
for inspection; no broad cleanup/delete operation is performed.

The exporter reads regular Git blobs, not the Windows checkout. It checks every
index-listed file's original SHA256 and size before creating any output. It
rejects music/key material, unsafe paths, symlinks, oversized snapshots and
existing output directories. Fonts, lyrics, notices and images retain each
workshop pack's original license; the tool's MIT license does not relicense them.

The output contains `main/index.json`, `<40-hex-resource-commit>/packs/...`, and
`snapshot-manifest.json`. Both the index Git commit and its pinned resource
commit are recorded; they need not be identical.

An optional local JSON array supplied with `--sources PATH` can add explicitly
verified corresponding-source ZIPs:

```json
[{"id":"world-execute-me-frostnova","file":"LOCAL_SOURCE_ZIP_PATH","sha256":"EXPECTED_64_HEX_SHA256"}]
```

Only the ZIP bytes, destination path and SHA256 are exported; no local source
path or SSH credentials are included. Preserve complete corresponding source
where a pack's license requires it. Release attachments are not Git files and
must be maintained separately from main/tag synchronization.

## Server integration

First diagnose the existing web server, HTTPS certificate, routes and listen
ports without exposing secrets. Review `nginx-location.conf.example`, then add
only its independent `/dsh-mv-workshop/` location to the already-authorized HTTPS
virtual host. Verify with `nginx -t` before a graceful reload; do not replace
the server block or restart OpenClaw. Do not modify firewalls or security groups
without separate authorization. The example is not an already-applied config.

Use a dedicated static root, e.g. `/srv/dsh-mv-workshop/public`, with directory
permissions 755 and files 644; keep credentials, staging scripts and private keys
outside it. Deny directory listings. Serve original bytes and proper MIME types.
No uploader, webhook, open relay or arbitrary-URL fetch endpoint is required.

Upload to a private staging directory; validate manifest, file count, SHA256 and
sizes server-side; publish immutable commit files first and atomically replace
`main/index.json` last. Refuse divergent bytes under an existing commit URL.
Keep the previous index for rollback and retain prior snapshots still referenced
by clients. Never recursively delete a broad directory or force-reset a repo.

Verify the public HTTPS URL with certificate validation and an explicit direct
connection. Download every file of every final index-listed pack anonymously,
not just index.json or two sample packs. Check corresponding-source download
separately. Only after this passes may a plugin enable the static source as an
automatic fallback.

## Continuing synchronization

Do not copy a root SSH key into GitHub Actions or the public repository. A local
operator script may prepare a new pinned export after an official main update
and deploy it over SSH using a locally supplied existing key and task-specific
known_hosts. A dedicated least-privilege server-side timer may instead pull the
public official repository, if direct GitHub access is verified. It must fetch
only the fixed official repository, execute no repository build/hooks/scripts,
and keep the previous published index if fetch or any SHA verification fails.

An automatic timer is a separate reviewed server change, not installed by this
README. Test it against a completed final pack set before enabling. New tag
sync does not automatically copy release ZIPs. Do not bypass Gitee 451 by changing
encoding or hiding resources; platform review remains the owner's task.

`sync.ps1` provides the operator-side continuation: it verifies the existing
origin is the official workshop, fetches only public official main into
FETCH_HEAD without resetting the worktree, exports a new pinned snapshot, then
calls the same guarded deployment tool. It defaults to a deployment plan unless
`-Apply` is supplied. Existing indexes remain untouched on any fetch/hash failure.
No scheduled task or server timer is installed automatically.

`pull.py` is the reviewed server-side alternative, installed alongside `activate.py` by the operator. It uses anonymous strict TLS, no environment proxy, fixed official GitHub API/raw endpoints, bounded resources and no downloaded-code execution. The maintainer's `/etc/dsh-mv-workshop-sources.json` pins already-uploaded free Corresponding Source archives; a missing archive fails closed. A dedicated `dsh-mv-mirror` nologin user may write only the public/staging/index-backup directories under the independent root, never nginx/OpenClaw/SSH configs. Suggested systemd safeguards: ProtectSystem=strict, ProtectHome=true, NoNewPrivileges, MemoryMax=256M, CPUQuota=30%, and **TimeoutStartSec=300** for a oneshot service (RuntimeMaxSec does not bound oneshot activation). Timer every 15 minutes with jitter. Verify a successful service run and public bytes before enabling defaults; future service failure leaves the catalogue unchanged.

Anonymous direct verification: `node tools/workshop-static/verify.mjs SNAPSHOT_DIR HTTPS_BASE NEW_REPORT`. It checks every index resource plus independently declared source archive, with certificate verification and no proxy.
