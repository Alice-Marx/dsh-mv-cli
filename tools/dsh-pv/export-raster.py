"""Export missing dsh PV raster surfaces; never download music, lyrics, or video.

The upstream production compositor remains the director. Its H3 lookups are
redirected in memory to a user-authorized, AI-generated eight-pose dance sheet.
The original MMD/AI dance cache is neither needed nor copied. Whole rendered
surfaces are graphics, not a bitmap font or reusable per-character atlas.

Example (the upstream text-only lyric inputs must already exist locally):
  python tools/dsh-pv/export-raster.py --upstream <checkout> --dance-sheet <png>
    --out dist/pv-raster-095-alpha --fps 8

--times 20,40,65,92,119,151,164,198 is a quick, reproducible visual probe.
The output contains raster-timeline.json, atlas images, and provenance.json.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import time
import zipfile
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS = 1280, 720, 24
SIZE = (W, H)
BEAT = 60 / 130
FIRST_BEAT = 0.1587
SOURCE_COMMIT = "a598092a1b1db91fa43961a81269353d13419f6f"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def load_poses(path: Path) -> list[Image.Image]:
    sheet = Image.open(path).convert("RGBA")
    if sheet.size != (1536, 1024):
        raise ValueError("Expected a 1536 x 1024 dance sheet with 4 x 2 equal cells")
    if sheet.getchannel("A").getextrema()[0] != 0:
        raise ValueError("Dance sheet must have a real transparent background")
    poses = []
    for j in range(8):
        cell = sheet.crop(((j % 4) * 384, (j // 4) * 512, (j % 4 + 1) * 384, (j // 4 + 1) * 512))
        bbox = cell.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
        if not bbox:
            raise ValueError(f"Empty dance pose {j}")
        cell = cell.crop(bbox)
        scale = min(390 / cell.width, 442 / cell.height)
        cell = cell.resize((round(cell.width * scale), round(cell.height * scale)), Image.Resampling.LANCZOS)
        stage = Image.new("RGBA", (420, 540))
        stage.alpha_composite(cell, ((420 - cell.width) // 2, 528 - cell.height))
        poses.append(stage)
    return poses


def trace_pose(image: Image.Image, rig):
    """Trace the supplied rendered pose, preserving 70 x 45 H3 frame contract."""
    small = image.resize((70, 45), Image.Resampling.BOX)
    px = np.array(small, dtype=np.float32)
    alpha = px[:, :, 3] / 255
    lum = (px[:, :, 0] * .299 + px[:, :, 1] * .587 + px[:, :, 2] * .114) / 255
    ramp = " .:-=+*#%@"
    art, shade, part = [], [], []
    for y in range(45):
        a, s, p = [], [], []
        for x in range(70):
            if alpha[y, x] < .32:
                a.append(" "); s.append(" "); p.append(" ")
                continue
            # Geometry comes from the new pose; glyphs only encode its luminance.
            a.append(ramp[max(1, min(9, int(lum[y, x] * 9)))])
            s.append(str(max(1, min(7, round(lum[y, x] ** .9 * 7)))))
            p.append("b")
        art.append("".join(a)); shade.append("".join(s)); part.append("".join(p))
    return rig.Frame(art, shade, part)


def install_dance(upstream: Path, poses: list[Image.Image]):
    # Import through the upstream director; only local files are read.
    frontend = upstream / "film/pv_dsh_frontend_20260927"
    shim = frontend / "gpu_shim"
    sys.path.insert(0, str(shim))
    sys.path.insert(0, str(frontend))
    os.environ["TUI_PALETTE"] = "deepsea"
    os.environ["V2_HER"] = "h3"
    os.environ.pop("DSH_GPU", None)
    import dsh_her as director
    # A transparent pane keeps this exporter independent of chat screenshots.
    director.dsh_frame = lambda t: Image.new("RGB", (354, 537), (4, 7, 15))
    import v2
    import h3_full as h3
    import rig
    grids = [trace_pose(pose, rig) for pose in poses]
    take_spec = json.loads((upstream / "data/h3_takes.json").read_text(encoding="utf-8"))
    lengths = {}
    for cache in take_spec["caches"]:
        for name, spec in cache["takes"].items():
            lengths["mmd_" + name if cache["read_by"].startswith("pv_full") else name] = spec["frames"]

    # Each pose occupies half a beat. A short blend around the boundary avoids
    # static standing-only movement while preserving distinct AI pose geometry.
    def phase(index):
        return index / FPS / BEAT * 2

    class PoseFrames:
        def __init__(self, name):
            self.length = lengths.get(name, 192)
        def __len__(self):
            return self.length
        def __getitem__(self, index):
            if isinstance(index, slice):
                return [self[i] for i in range(*index.indices(self.length))]
            return grids[int(phase(index)) % len(grids)]

    @lru_cache(None)
    def grid_lookup(name):
        return PoseFrames(name)

    @lru_cache(128)
    def rgba_lookup(name, index):
        p = phase(index)
        i, u = int(p) % 8, p % 1
        if u < .8:
            return poses[i]
        return Image.blend(poses[i], poses[(i + 1) % 8], (u - .8) / .2)

    h3.grids = grid_lookup
    h3.rgba = rgba_lookup
    # The original pv_full.install reads all missing cache JSONs merely to
    # assert their lengths. Preserve its exact PLAN splice and validation while
    # substituting the generated lookups before that first cache access.
    def generated_take_install():
        h3.grids, h3.rgba = grid_lookup, rgba_lookup
        h3.PLAN[:] = director.pv_full.build(list(h3.PLAN))
        for start, end, name, a, b, mode in h3.PLAN:
            if name.startswith("mmd_"):
                assert b * FPS <= len(grid_lookup(name)) + 1, (name, start, end, b)
        return v2, h3
    director.pv_full.install = generated_take_install
    v2, h3 = director.install()
    # The sample0 snapshot installed by pv_full references h3 functions via
    # its globals, so the above replacements cover every active source route.
    return director, v2, h3


class SurfaceCapture:
    """Collect source surfaces composited onto full-sized upstream layers.

    Vector draw calls are already represented in the plugin's recorded timeline.
    Capture only image compositing. Top-level post passes and the placeholder
    chat are disabled, and RGB background-clearing pastes are not resources.
    """
    def __init__(self, scale=1):
        self.ops = []
        self.active = False
        self.images = {}
        self.scale = scale
        self.original = {}
        self.depth = 0

    def clean(self, image):
        image = image.convert("RGBA")
        # Transparent full-sized carriers sometimes contain an opaque stage
        # backdrop. Keep the rendered visual itself, not a covering navy panel.
        if image.size == SIZE:
            arr = np.array(image)
            bg = np.max(np.abs(arr[:, :, :3].astype(np.int16) - np.array([4, 7, 15])), axis=2) <= 2
            arr[bg, 3] = 0
            image = Image.fromarray(arr)
        return image

    def remember(self, target, source, box, mask=None):
        if not self.active or target.size != SIZE or not isinstance(source, Image.Image):
            return
        if source.mode != "RGBA":
            # An unmasked RGB paste generally clears/moves the native vector
            # stage. Do not reintroduce opaque screenshots of that stage.
            return
        image = self.clean(source)
        if isinstance(mask, Image.Image) and mask is not source:
            from PIL import ImageChops
            try:
                image.putalpha(ImageChops.multiply(image.getchannel("A"), mask.convert("L")))
            except ValueError:
                return
        bbox = image.getchannel("A").getbbox()
        if not bbox:
            return
        x, y = box[:2] if isinstance(box, (tuple, list)) else (0, 0)
        image = image.crop(bbox)
        dst = [int(x + bbox[0]), int(y + bbox[1]), image.width, image.height]
        if dst[0] >= W or dst[1] >= H or dst[0] + dst[2] <= 0 or dst[1] + dst[3] <= 0:
            return  # A compositor fly-out that is fully outside the stage.
        # Ignore the large, deliberately blank dsh screenshot pane.
        if image.width >= 350 and image.height >= 500 and dst[0] < 390 and np.max(np.array(image)[:, :, :3]) < 20:
            return
        if dst[0] < 390 and image.width > 280 and image.height > 400:
            # Empty pane+border carriers add no missing art, and their changing
            # geometry otherwise wastes most of an atlas. Native window/chrome
            # draw calls preserve the same border and transform.
            density = float(np.mean(np.array(image.getchannel("A")) > 20))
            if density < .08:
                return
        if self.scale < 1:
            image = image.resize((max(1, round(image.width * self.scale)), max(1, round(image.height * self.scale))), Image.Resampling.LANCZOS)
        digest = hashlib.sha256(image.tobytes() + str(image.size).encode()).hexdigest()
        self.images.setdefault(digest, image)
        op = {"image": digest, "dst": dst, "alpha": 1, "z": "over"}
        # Nested full-frame carrier assembly is captured once as its final
        # composite; retain only the last identical placement in one sample.
        if op not in self.ops:
            self.ops.append(op)

    def __enter__(self):
        cls = Image.Image
        self.original = {"paste": cls.paste, "alpha_composite": cls.alpha_composite}
        capture = self
        def paste(target, source, box=None, mask=None):
            if capture.depth == 0:
                capture.remember(target, source, box or (0, 0), mask)
            return capture.original["paste"](target, source, box, mask)
        def composite(target, im, dest=(0, 0), source=(0, 0)):
            # Pillow uses source=(x,y[,w,h]) to restrict its source. Crop before
            # recording, while the real compositor still receives original args.
            piece = im
            if source != (0, 0):
                b = source if len(source) == 4 else (*source, im.width, im.height)
                piece = im.crop(b)
            capture.remember(target, piece, dest)
            capture.depth += 1
            try:
                return capture.original["alpha_composite"](target, im, dest, source)
            finally:
                capture.depth -= 1
        cls.paste = paste
        cls.alpha_composite = composite
        return self

    def __exit__(self, *_):
        for name, method in self.original.items():
            setattr(Image.Image, name, method)


def pack_atlases(images: dict, out: Path, *, page_size=2048, max_pages=16, max_bytes=1024 * 1024, quality=80):
    """Deterministic shelf packing, with an actual encoded-byte limit check."""
    mapping, pages, page_rows = {}, [], []
    current = Image.new("RGBA", (page_size, page_size))
    x = y = row_h = 0
    used_h = 0

    def flush():
        nonlocal current, x, y, row_h, used_h
        if not page_rows:
            return
        page = current.crop((0, 0, page_size, max(1, used_h)))
        encoded_quality = quality
        buf = io.BytesIO()
        page.save(buf, "WEBP", quality=encoded_quality, method=6, exact=True)
        # Alpha stays losslessly encoded. Only colour compression is reduced
        # when a visually dense page exceeds the verified Host byte limit.
        while len(buf.getvalue()) > max_bytes and encoded_quality > 40:
            encoded_quality = max(40, encoded_quality - 8)
            buf = io.BytesIO()
            page.save(buf, "WEBP", quality=encoded_quality, method=6, exact=True)
        if len(buf.getvalue()) > max_bytes:
            raise ValueError(f"Atlas {len(pages)} encodes to {len(buf.getvalue())} B > {max_bytes}; use --scale or --quality")
        if len(pages) >= max_pages:
            raise ValueError(f"Too many atlas pages (> {max_pages}); lower FPS or --scale")
        name = f"raster-atlas-{len(pages):02d}.webp"
        (out / name).write_bytes(buf.getvalue())
        index = len(pages)
        pages.append({"file": name, "width": page.width, "height": page.height, "quality": encoded_quality, "bytes": len(buf.getvalue()), "sha256": sha256(out / name)})
        for key, rect in page_rows:
            mapping[key] = {"atlas": index, "src": rect}
        page_rows.clear()
        current = Image.new("RGBA", (page_size, page_size)); x = y = row_h = used_h = 0

    for key, image in sorted(images.items(), key=lambda it: (-it[1].height, -it[1].width, it[0])):
        if image.width > page_size or image.height > page_size:
            raise ValueError(f"Rendered surface {image.size} exceeds atlas edge {page_size}")
        if x + image.width > page_size:
            y += row_h + 2; x = 0; row_h = 0
        if y + image.height > page_size:
            flush()
        current.alpha_composite(image, (x, y))
        page_rows.append((key, [x, y, image.width, image.height]))
        row_h = max(row_h, image.height); used_h = max(used_h, y + image.height)
        x += image.width + 2
    flush()
    if sum(page["width"] * page["height"] for page in pages) > 64 * 1024 * 1024:
        raise ValueError("Atlas total exceeds 64 Mi pixels")
    return mapping, pages


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--upstream", type=Path, required=True)
    parser.add_argument("--dance-sheet", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--fps", type=float, default=8)
    parser.add_argument("--times", help="comma-separated visual-probe times, instead of full timeline")
    parser.add_argument("--start", type=float, default=0)
    parser.add_argument("--end", type=float, default=207.1)
    parser.add_argument("--scale", type=float, default=1, help="raster sampling scale; destination layout stays 1280x720")
    parser.add_argument("--quality", type=int, default=80)
    parser.add_argument("--page-size", type=int, default=2048)
    parser.add_argument("--repack-capture", type=Path, help="reuse an exporter-produced local .capture.zip; skip upstream rendering")
    args = parser.parse_args()
    upstream = args.upstream.resolve(); out = args.out.resolve(); source = args.dance_sheet.resolve()
    if out.exists():
        raise FileExistsError(f"Refusing to overwrite output directory {out}")
    if not (upstream / "film/ai_mascot_mv_world_execute_20260926/audio/lyrics_synced.lrc").exists() or not (upstream / "film/world_execute_word_timing_20260927/word_timeline.json").exists():
        raise FileNotFoundError("Prepare the upstream local LRC/word timeline first. This exporter never fetches them.")
    if not (0 < args.fps <= 24 and 0 < args.scale <= 1 and 1 <= args.quality <= 100):
        raise ValueError("Invalid FPS, scale, or WebP quality")
    revision = subprocess.check_output(["git", "-C", str(upstream), "rev-parse", "HEAD"], text=True).strip()
    if revision != SOURCE_COMMIT:
        raise ValueError(f"Unsupported upstream revision {revision}; expected {SOURCE_COMMIT}")
    poses = load_poses(source)
    capture = SurfaceCapture(args.scale)
    if args.repack_capture:
        with zipfile.ZipFile(args.repack_capture) as archive:
            meta = json.loads(archive.read("capture.json"))
            if meta["sourceSha256"] != sha256(source) or meta["commit"] != revision:
                raise ValueError("Capture source sheet/revision does not match supplied inputs")
            frames = meta["frames"]
            args.fps = meta["fps"]
            args.scale = meta["scale"]
            for key, size in meta["images"].items():
                image = Image.open(io.BytesIO(archive.read(f"images/{key}.png"))).convert("RGBA")
                if list(image.size) != size or image.width > 1280 or image.height > 720:
                    raise ValueError("Invalid cached surface size")
                capture.images[key] = image
        out.mkdir(parents=True)
    else:
        director, v2, h3 = install_dance(upstream, poses)
        import engine, kit, tuikit
        # These layers are already recreated natively by DshPvFilm. Disabling
        # them also ensures no audio or screenshot is exported here.
        engine.post = lambda image, previous=None, **kw: image
        tuikit.post = lambda image, previous=None, **kw: image
        kit.chrome = lambda image, t, src, retract=0, shell=None: image
        engine.lyric_tokens = lambda *a, **kw: None
        times = [float(t) for t in args.times.split(",")] if args.times else [round(args.start + i / args.fps, 6) for i in range(math.ceil((args.end - args.start) * args.fps))]
        frames = []
        started = time.monotonic()
        with capture:
            for j, t in enumerate(times):
                capture.ops = []
                capture.active = True
                director.CUR[0] = t
                try:
                    if j == 0:
                        capture.active = False
                        v2.frame(max(0, round(t * FPS) - 1))
                        capture.active = True
                    director.finish(v2.frame(round(t * FPS)), t)
                finally:
                    capture.active = False
                frames.append({"t": round(t, 6), "ops": capture.ops})
                if j % 24 == 0 or j == len(times) - 1:
                    print(json.dumps({"frames": j + 1, "total": len(times), "surfaces": len(capture.images), "pixels": sum(im.width * im.height for im in capture.images.values()), "seconds": round(time.monotonic() - started, 1)}), flush=True)
        out.mkdir(parents=True)
        # Private mechanical cache is deliberately not listed as a pack asset.
        # Encoding retries can reuse it without rendering the whole PV again.
        with zipfile.ZipFile(out / ".capture.zip", "x", compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
            meta = {"frames": frames, "images": {key: list(im.size) for key, im in capture.images.items()}, "fps": args.fps, "scale": args.scale, "sourceSha256": sha256(source), "commit": revision}
            archive.writestr("capture.json", json.dumps(meta, ensure_ascii=False, separators=(",", ":")))
            for key, image in capture.images.items():
                buf = io.BytesIO(); image.save(buf, "PNG")
                archive.writestr(f"images/{key}.png", buf.getvalue())
    offscreen_ops = 0
    for frame in frames:
        visible = []
        for op in frame["ops"]:
            x, y, w, h = op["dst"]
            if x >= W or y >= H or x + w <= 0 or y + h <= 0:
                offscreen_ops += 1
            else:
                visible.append(op)
        frame["ops"] = visible
    mapping, pages = pack_atlases(capture.images, out, quality=args.quality, page_size=args.page_size)
    for frame in frames:
        frame["ops"] = [{**mapping[op.pop("image")], **op} for op in frame["ops"]]
    if not frames or frames[0]["t"] > 0:
        frames.insert(0, {"t": 0, "ops": []})
    clear_at = round(args.end if not args.times else frames[-1]["t"] + 1 / args.fps, 6)
    if clear_at > frames[-1]["t"]:
        frames.append({"t": clear_at, "ops": []})
    timeline = {"version": 1, "size": [W, H], "frames": frames}
    write_json(out / "raster-timeline.json", timeline)
    if args.times:
        # Developer QA only, not a declared pack resource: view the actual
        # captured surfaces in composition, with no unrelated screenshot layer.
        contact = Image.new("RGB", (640 * 3, 360 * math.ceil(len(frames) / 3)), (4, 7, 15))
        for i, frame in enumerate(frames):
            canvas = Image.new("RGBA", SIZE, (4, 7, 15, 255))
            for op in frame["ops"]:
                page = Image.open(out / pages[op["atlas"]]["file"]).convert("RGBA")
                x, y, w, h = op["src"]
                piece = page.crop((x, y, x + w, y + h))
                dx, dy, dw, dh = op["dst"]
                if piece.size != (dw, dh):
                    piece = piece.resize((dw, dh), Image.Resampling.LANCZOS)
                canvas.alpha_composite(piece, (dx, dy))
            contact.paste(canvas.convert("RGB").resize((640, 360)), ((i % 3) * 640, (i // 3) * 360))
        contact.save(out / "probe-contact.png")
    hashes = [hashlib.sha256(pose.tobytes()).hexdigest() for pose in poses]
    provenance = {
        "upstream": "https://github.com/MisakaZentai/world-execute-me-dsh-pv", "commit": revision,
        "renderer": "dsh_her production compositor with h3 lookups redirected in memory",
        "dance": {"kind": "AI-generated 8-pose remake from user-provided DeepSeek1.png; NOT original-film dance", "sheetSha256": sha256(source), "poses": 8, "poseHashes": hashes, "timing": "half-beat pose changes with short boundary blends", "originalMmdOrH3CachesUsed": False},
        "copyright": "Whale-girl derived art: CC-BY-NC-SA-4.0 with upstream attribution; renderer code MIT; label AI use",
        "fonts": {"Windows": "local rendering only; no font files or per-glyph font atlas distributed", "OFL": ["Space Mono Bold", "Anton Regular"]},
        "audioOrVideoFiles": 0, "songAudioRead": False,
        "frames": len(frames), "uniqueSurfaces": len(capture.images), "samplingFps": args.fps, "rasterScale": args.scale,
        "fullyOffscreenOpsOmitted": offscreen_ops,
        "atlasPages": pages, "timeline": {"file": "raster-timeline.json", "bytes": (out / "raster-timeline.json").stat().st_size, "sha256": sha256(out / "raster-timeline.json")},
    }
    write_json(out / "provenance.json", provenance)
    print(json.dumps({"output": str(out), "atlasPages": len(pages), "bytes": sum(p["bytes"] for p in pages) + (out / "raster-timeline.json").stat().st_size, "pixels": sum(p["width"] * p["height"] for p in pages)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
