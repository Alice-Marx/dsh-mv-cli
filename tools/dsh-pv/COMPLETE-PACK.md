# dsh-pv complete pack builder (local, no publishing)

`build-complete.mjs` creates version **1.1.0**, requiring plugin **0.9.5+**, in a
new or empty output directory. It never downloads music/lyrics, changes the
legacy pack or presets, overwrites user files, deletes directories, or publishes.

```powershell
node tools/dsh-pv/build-complete.mjs `
  --base ../dsh-mv-workshop/packs/world-execute-me-dsh-pv `
  --upstream E:/Obsidian_ljw/Obsidian/Alice_marx_workshop/tmp/20261006_dsh_pv_complete/upstream `
  --raster dist/pv-raster-095-alpha `
  --dance E:/Obsidian_ljw/Obsidian/Alice_marx_workshop/tmp/20261006_dsh_pv_complete/generated/dance-poses-v1.png `
  --out dist/pv-complete-095
```

Optional `--timeline dist/pv-vector-095-alpha/timeline.json` uses the newly
recorded AI-dance geometry while verifying that all 97 original shot identities,
start/end times and keyframe times remain unchanged. Without it, the original
merged timeline is preserved exactly. Optional `--reference <image>` changes
where the authorized reference is read; the basename and SHA256 must still
match the specific user-confirmed `DeepSeek1.png` from this task. The builder
does not assume permission for arbitrary replacement images.

The raster exporter directory must contain `provenance.json`, its
`raster-timeline.json`, and ordered `raster-atlas-00.webp` etc. The builder checks
all hashes, byte lengths, image dimensions/crops, local filenames, the eight-pose
sheet hash, and no-audio/no-original-MMD provenance. It repartitions JSON into
480 KiB shards and drops only exporter `fps` metadata from the descriptor;
sampling FPS stays in the provenance. An empty final frame at 207.1 seconds
clears the held atlas layers.

The original JSON is merged/repartitioned with identical renderer semantics.
Duplicate `art/LICENSE.txt` is consolidated into the identical root license;
the complete original `data/NOTICE.md` MIT text moves into the root notice.
Full artwork attribution remains in `art/NOTICE.md` and its upstream notices.

Space Mono Bold and Anton Regular are copied byte-for-byte from the upstream
fonts folder, with their two full OFL texts and a separate font notice.
Consolas, Microsoft YaHei and Segoe UI/Symbol remain **local Windows fonts**:
no font binary or reusable per-glyph Windows font atlas is included.

`lyrics_synced.lrc` must already exist in the upstream local audio folder. Its
98 English cues become `lyrics.json`, separate from the MIT code and CC artwork,
under the Mili non-commercial fan-work use basis recorded in `LYRICS-NOTICE.md`.
The original PV has no supplied Chinese translation; none is invented.

AI-assisted visuals are explicitly labeled as an eight-pose remake, **not** the
original MMD model/motion, MiniMax-H3 dancer cache, or original-film restoration.
Reference basename, SHA256, this user's specific public non-commercial
confirmation, full attribution chain, atlas/lyric/font hashes and exporter
counts are embedded in `mv.json` extension metadata. No machine-local absolute
reference path is published.

The source dance sheet is archived separately in the output parent's
`source-art/` directory, not redundantly installed in the pack. All final pack
resources are validated before writing. If the current workshop file/byte
budget is exceeded, the command reports exact counts/errors and writes no pack;
it never raises caps or drops visible material to hide a budget error.
