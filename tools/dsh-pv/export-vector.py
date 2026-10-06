"""Re-record native vector geometry against the newly generated dance poses.

Complements export-raster.py: direct ImageDraw point-cloud/feature/heat-map
draws must change with the new dance too. Existing 97-shot metadata, keyframe
sample times, window rectangles, and layout/chrome contracts remain unchanged.
Only a new dist output is written. No song/lyric/network fetch is performed.

  python tools/dsh-pv/export-vector.py --upstream <checkout>
    --dance-sheet <eight-pose PNG> --out dist/pv-vector-095-alpha

The complete-pack builder may pass the resulting timeline.json as --timeline.
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import time

from PIL import ImageDraw


def load_exporter():
    path = Path(__file__).with_name("export-raster.py")
    spec = importlib.util.spec_from_file_location("_dsh_pv_raster_export", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def flatten(value):
    result = []
    for item in value if isinstance(value, (list, tuple)) else [value]:
        if isinstance(item, (list, tuple)):
            result.extend(float(v) for v in item)
        else:
            result.append(float(item))
    return result


def color(value):
    if value is None:
        return None
    if isinstance(value, int):
        return [value, value, value, 255]
    if isinstance(value, (tuple, list)):
        return (list(value) + [255] * 4)[:4]
    return None


class Recorder:
    def __init__(self):
        self.ops = []
        self.active = False
        self.original = {}

    def __enter__(self):
        for name in ("text", "rectangle", "line", "ellipse", "polygon", "point", "arc", "rounded_rectangle"):
            original = getattr(ImageDraw.ImageDraw, name)
            self.original[name] = original
            recorder = self
            def wrap(draw, *args, _name=name, _original=original, **kwargs):
                if recorder.active and draw.im.size == (1280, 720):
                    xy = args[0] if args else kwargs.get("xy")
                    entry = {"k": _name, "xy": flatten(xy)}
                    if _name == "text":
                        entry["s"] = str(args[1] if len(args) > 1 else kwargs.get("text", ""))
                        font = kwargs.get("font") or (args[3] if len(args) > 3 else None)
                        entry["size"] = getattr(font, "size", None)
                        entry["font"] = os.path.basename(getattr(font, "path", "") or "")
                        entry["anchor"] = kwargs.get("anchor")
                        entry["fill"] = color(kwargs.get("fill", args[2] if len(args) > 2 else None))
                    else:
                        entry["fill"] = color(kwargs.get("fill", args[1] if len(args) > 1 else None))
                        entry["outline"] = color(kwargs.get("outline"))
                        entry["width"] = kwargs.get("width", args[2] if _name == "line" and len(args) > 2 else 1)
                    recorder.ops.append(entry)
                return _original(draw, *args, **kwargs)
            setattr(ImageDraw.ImageDraw, name, wrap)
        return self

    def __exit__(self, *_):
        for name, method in self.original.items():
            setattr(ImageDraw.ImageDraw, name, method)


class Converter:
    def __init__(self, palette, lyrics):
        self.palette = palette
        self.indices = {key: i for i, key in enumerate(palette)}
        self.lyrics = {line.strip().casefold() for line in lyrics if len(line.strip()) > 8}
        self.scrubbed = 0

    def ci(self, value):
        if not isinstance(value, list) or len(value) < 3:
            return -1
        # Grayscale-mask draws never reach the colour frame (same filter as
        # the baseline builder); they are not native visual operations.
        if value[0] == value[1] == value[2]:
            return -1
        key = "".join(f"{max(0, min(255, int(v))):02x}" for v in (value + [255])[:4])
        if key not in self.indices:
            self.indices[key] = len(self.palette)
            self.palette.append(key)
        return self.indices[key]

    @staticmethod
    def font_index(name):
        if name in ("consolab.ttf", "DejaVuSansMono-Bold.ttf"):
            return 1
        if name == "SpaceMono-Bold.ttf":
            return 2
        if name == "Anton-Regular.ttf":
            return 3
        if any(word in name for word in ("CJK", "Noto", "msyh")):
            return 4
        if "DejaVuSans" in name and "Mono" not in name or "segui" in name:
            return 5
        return 0

    def convert(self, op, out, dots, shot):
        xy = op["xy"]
        if not xy:
            return
        xs, ys, kind = xy[::2], xy[1::2], op["k"]
        if kind == "text":
            text = op["s"]
            x, y = xs[0], ys[0]
            if not text.strip() or y < 41 or y >= 612:
                return
            if 1180 <= x <= 1256 and 56 <= y <= 604 and abs(x - 1188) < 2:
                return
            fill = self.ci(op["fill"])
            if fill < 0:
                return
            if shot["fn"] == "satisfaction":
                if x == 420 and 110 <= y <= 400 and (y - 120) % 36 == 0:
                    text = "\u0001%d" % ((y - 120) // 36)
                elif y == 88 and 474 <= x <= 760 and (x - 474) % 36 == 0:
                    text = "\u0002%d" % ((x - 474) // 36)
            # This data stays MIT-only, separate from the declared lyric file.
            # Exact full-line copies are omitted, never disguised as code data.
            if text.strip().casefold() in self.lyrics:
                self.scrubbed += 1
                return
            entry = ["t", round(x), round(y), op.get("size") or 12, fill, self.font_index(op.get("font", "")), text]
            if op.get("anchor"):
                entry.append(op["anchor"])
            out.append(entry)
            return
        if max(ys) < 41 or min(ys) >= 612 or min(xs) >= 1176 and min(ys) >= 50:
            return
        if kind == "line" and min(xs) <= 1 and max(xs) >= 1278 or kind == "arc":
            return
        points = [round(v) for v in xy]
        fill = self.ci(op.get("fill"))
        if kind == "point":
            if fill >= 0:
                dots[(fill, 1, 1)].extend(points)
            return
        outline = self.ci(op.get("outline"))
        width = op.get("width") or 1
        if not isinstance(width, (int, float)):
            width = 1
        if fill < 0 and outline < 0:
            return
        if kind == "rectangle":
            if len(points) != 4:
                return
            if points[2] < points[0]:
                points[0], points[2] = points[2], points[0]
            if points[3] < points[1]:
                points[1], points[3] = points[3], points[1]
            w, h = points[2] - points[0] + 1, points[3] - points[1] + 1
            if outline < 0 and fill >= 0 and w <= 8 and h <= 8:
                dots[(fill, w, h)].extend(points[:2])
            else:
                out.append(["r", fill, outline, width, *points])
        elif kind == "line":
            if len(points) > 160:
                pairs = [points[j:j + 2] for j in range(0, len(points) - 1, 2)]
                step = len(pairs) / 80
                pairs = [pairs[int(j * step)] for j in range(80)] + [pairs[-1]]
                points = [v for pair in pairs for v in pair]
            out.append(["l", fill, width, *points])
        else:
            tag = {"ellipse": "e", "polygon": "g", "rounded_rectangle": "R"}.get(kind)
            if tag:
                out.append([tag, fill, outline, width, *points])


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--upstream", type=Path, required=True)
    parser.add_argument("--dance-sheet", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--template", type=Path, default=Path(__file__).resolve().parents[2] / "presets/dsh-pv/data/timeline.json")
    args = parser.parse_args()
    out = args.out.resolve(); upstream = args.upstream.resolve()
    if out.exists():
        raise FileExistsError(f"Refusing to overwrite {out}")
    helper = load_exporter()
    revision = subprocess.check_output(["git", "-C", str(upstream), "rev-parse", "HEAD"], text=True).strip()
    if revision != helper.SOURCE_COMMIT:
        raise ValueError("Unsupported upstream revision")
    baseline = json.loads(args.template.read_text(encoding="utf-8"))
    poses = helper.load_poses(args.dance_sheet.resolve())
    director, v2, h3 = helper.install_dance(upstream, poses)
    import engine, kit, tuikit
    engine.post = tuikit.post = lambda image, previous=None, **kw: image
    kit.chrome = lambda image, t, src, retract=0, shell=None: image
    engine.lyric_tokens = lambda *a, **kw: None
    converter = Converter(baseline["pal"], [text for start, end, text in engine.LYRICS])
    sample_count = total_ops = 0
    changed = []
    started = time.monotonic()
    with Recorder() as recorder:
        for shot in baseline["shots"]:
            old_hash = hashlib.sha256(json.dumps([kf["o"] for kf in shot["kf"]], separators=(",", ":")).encode()).hexdigest()
            for keyframe in shot["kf"]:
                frame = round(keyframe["t"] * 24)
                t = frame / 24
                director.CUR[0] = (frame - 1) / 24
                recorder.active = False
                v2.frame(max(0, frame - 1))
                director.CUR[0] = t
                recorder.ops = []
                recorder.active = True
                try:
                    director.finish(v2.frame(frame), t)
                finally:
                    recorder.active = False
                ops = []
                dots = collections.defaultdict(list)
                for entry in recorder.ops:
                    converter.convert(entry, ops, dots, shot)
                for (color_index, width, height), points in dots.items():
                    ops.append(["d", color_index, width, height, *points])
                keyframe["o"] = ops
                total_ops += len(ops)
                sample_count += 1
            new_hash = hashlib.sha256(json.dumps([kf["o"] for kf in shot["kf"]], separators=(",", ":")).encode()).hexdigest()
            if old_hash != new_hash:
                changed.append({"i": shot["i"], "fn": shot["fn"], "oldDrawHash": old_hash, "newDrawHash": new_hash})
            if shot["i"] % 10 == 0 or shot["i"] == len(baseline["shots"]) - 1:
                print(json.dumps({"shots": shot["i"] + 1, "total": len(baseline["shots"]), "keyframes": sample_count, "operations": total_ops, "seconds": round(time.monotonic() - started, 1)}), flush=True)
    baseline["about"] = "dsh PV native vector draws re-recorded from upstream production compositor with an AI-generated eight-pose dance remake; not the original-film dance. Code/data MIT, derived whale-girl artwork remains CC-BY-NC-SA-4.0; full lyric strings are separate."
    out.mkdir(parents=True)
    helper.write_json(out / "timeline.json", baseline)
    provenance = {"upstream": "https://github.com/MisakaZentai/world-execute-me-dsh-pv", "commit": revision, "templateSha256": helper.sha256(args.template), "danceSheetSha256": helper.sha256(args.dance_sheet), "shots": len(baseline["shots"]), "keyframes": sample_count, "operations": total_ops, "changedShots": changed, "fullLyricDrawsOmitted": converter.scrubbed, "originalDanceCachesRead": False, "timelineSha256": helper.sha256(out / "timeline.json"), "timelineBytes": (out / "timeline.json").stat().st_size}
    helper.write_json(out / "provenance.json", provenance)
    print(json.dumps({"output": str(out), "timelineBytes": provenance["timelineBytes"], "shots": len(baseline["shots"]), "keyframes": sample_count, "changedShots": len(changed)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
