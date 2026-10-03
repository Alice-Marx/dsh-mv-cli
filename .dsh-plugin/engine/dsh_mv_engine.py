"""dsh-mv lyrics engine (runs in its own Python env, started by the dsh-mv Host).

Usage:  python dsh_mv_engine.py <command> <args.json>
Commands: probe | prefetch | transcribe
Output: one JSON object per line on stdout:
  {"type": "progress", "stage": str, "ratio": 0..1, "message": str}
  {"type": "log", "message": str}
  {"type": "result", ...}        (last line on success)
  {"type": "error", "message": str, "code": str}
The script never uploads audio. It downloads models only in `prefetch`;
`transcribe` runs with the Hugging Face hub in offline mode.
"""
import json
import math
import os
import sys
import threading
import time
import traceback
import wave

ENGINE_VERSION = 1
WHISPER_REPOS = {
    "large-v3": "Systran/faster-whisper-large-v3",
    "medium": "Systran/faster-whisper-medium",
    "small": "Systran/faster-whisper-small",
}
WHISPER_FILES = ["config.json", "model.bin", "tokenizer.json", "vocabulary.json", "vocabulary.txt", "preprocessor_config.json"]
DEMUCS_MODEL = "htdemucs"


def emit(kind, **data):
    data["type"] = kind
    sys.stdout.write(json.dumps(data, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def progress(stage, ratio, message=""):
    emit("progress", stage=stage, ratio=round(max(0.0, min(1.0, ratio)), 4), message=message)


def models_dir(args):
    return args.get("modelsDir") or os.path.join(os.path.dirname(os.path.abspath(sys.executable)), "..", "..", "models")


def whisper_dir(args, size):
    return os.path.join(models_dir(args), "whisper", size)


def prepare_torch_dlls():
    """On Windows let CTranslate2 find the CUDA/cuDNN DLLs shipped with torch."""
    try:
        import torch  # noqa: F401  (loads cublas / cudnn when CUDA build)
        lib = os.path.join(os.path.dirname(torch.__file__), "lib")
        if os.name == "nt" and os.path.isdir(lib):
            os.add_dll_directory(lib)
            os.environ["PATH"] = lib + os.pathsep + os.environ.get("PATH", "")
        return torch
    except Exception:
        return None


def package_versions():
    from importlib import metadata
    out = {}
    for name in ["torch", "faster-whisper", "ctranslate2", "demucs", "av", "numpy", "huggingface-hub", "julius"]:
        try:
            out[name] = metadata.version(name)
        except Exception:
            out[name] = None
    return out


def cmd_probe(args):
    info = {"engineVersion": ENGINE_VERSION, "python": sys.version.split()[0], "executable": sys.executable, "packages": package_versions()}
    torch = prepare_torch_dlls()
    info["cuda"] = False
    if torch is not None:
        try:
            info["torchCuda"] = torch.version.cuda
            if torch.cuda.is_available():
                info["cuda"] = True
                props = torch.cuda.get_device_properties(0)
                info["gpu"] = {"name": props.name, "vramMB": int(props.total_memory / 1048576)}
        except Exception as error:
            info["cudaError"] = str(error)
    try:
        import ctranslate2
        info["ctranslate2Cuda"] = ctranslate2.get_cuda_device_count()
    except Exception as error:
        info["ctranslate2Error"] = str(error)
    present = {}
    for size in WHISPER_REPOS:
        present[size] = os.path.isfile(os.path.join(whisper_dir(args, size), "model.bin"))
    info["models"] = present
    info["demucs"] = demucs_present(args)
    emit("result", **info)


def demucs_present(args):
    """htdemucs weights: torch.hub checkpoints (demucs 4.0) or the HF cache (demucs 4.1)."""
    hub = os.path.join(models_dir(args), "torch", "hub", "checkpoints")
    if os.path.isdir(hub) and any(name.endswith(".th") for name in os.listdir(hub)):
        return True
    hf = os.path.join(models_dir(args), "hf", "hub")
    if not os.path.isdir(hf):
        return False
    for name in os.listdir(hf):
        if "demucs" in name.lower():
            for root, _dirs, files in os.walk(os.path.join(hf, name)):
                if any(f.endswith((".safetensors", ".th")) and not f.endswith(".incomplete") for f in files):
                    return True
    return False


def dir_size(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for name in files:
            try:
                total += os.path.getsize(os.path.join(root, name))
            except OSError:
                pass
    return total


def hf_endpoint():
    return (os.environ.get("HF_ENDPOINT") or "https://huggingface.co").rstrip("/")


def fetch_file(url, dest, size, on_bytes, attempts=12):
    """Resumable download with stall detection (30 s without data -> retry with Range)."""
    import httpx
    part = dest + ".part"
    for attempt in range(attempts):
        have = os.path.getsize(part) if os.path.exists(part) else 0
        if size and have >= size:
            break
        headers = {"User-Agent": "dsh-mv-engine/%d" % ENGINE_VERSION}
        if have:
            headers["Range"] = "bytes=%d-" % have
        try:
            timeout = httpx.Timeout(30.0, connect=20.0)
            with httpx.Client(follow_redirects=True, timeout=timeout, trust_env=True) as client:
                with client.stream("GET", url, headers=headers) as response:
                    if response.status_code == 416:
                        break
                    if response.status_code not in (200, 206):
                        raise RuntimeError("HTTP %d" % response.status_code)
                    mode = "ab" if (have and response.status_code == 206) else "wb"
                    if mode == "wb":
                        have = 0
                    with open(part, mode) as handle:
                        for chunk in response.iter_bytes(1 << 20):
                            handle.write(chunk)
                            have += len(chunk)
                            on_bytes(have)
            if not size or have >= size:
                break
        except Exception as error:  # network hiccup: resume
            emit("log", message="download %s: %s (retry %d)" % (os.path.basename(dest), error, attempt + 1))
            time.sleep(min(20, 2 + attempt * 2))
    else:
        raise RuntimeError("download failed: " + url)
    if size and os.path.getsize(part) != size:
        raise RuntimeError("download incomplete: %s (%d of %d bytes)" % (os.path.basename(dest), os.path.getsize(part), size))
    os.replace(part, dest)


def cmd_prefetch(args):
    size = args.get("model", "small")
    if size not in WHISPER_REPOS:
        raise ValueError("unknown model " + str(size))
    repo = WHISPER_REPOS[size]
    target = whisper_dir(args, size)
    os.makedirs(target, exist_ok=True)
    files = {}
    try:
        from huggingface_hub import HfApi
        meta = HfApi(endpoint=hf_endpoint()).model_info(repo, files_metadata=True)
        files = {s.rfilename: (s.size or 0) for s in meta.siblings if s.rfilename in WHISPER_FILES}
    except Exception as error:
        emit("log", message="model file list unavailable (%s); using defaults" % error)
        files = {name: 0 for name in WHISPER_FILES if name != "vocabulary.txt" or size != "large-v3"}
    expected = sum(files.values())
    done_bytes = 0
    last = [0.0]
    for name, length in sorted(files.items(), key=lambda item: item[1]):
        dest = os.path.join(target, name)
        if os.path.isfile(dest) and (not length or os.path.getsize(dest) == length):
            done_bytes += os.path.getsize(dest)
            continue
        url = "%s/%s/resolve/main/%s" % (hf_endpoint(), repo, name)

        def on_bytes(have, base=done_bytes):
            now = time.time()
            if now - last[0] >= 1.0:
                last[0] = now
                total = base + have
                progress("model", total / expected if expected else 0.0, "%s %.0f / %.0f MB" % (size, total / 1048576, expected / 1048576))
        fetch_file(url, dest, length, on_bytes)
        done_bytes += os.path.getsize(dest)
    progress("model", 1.0, size + " ready")
    if args.get("demucs", True):
        progress("demucs", 0.0, "htdemucs")
        prepare_torch_dlls()
        from demucs.pretrained import get_model
        for attempt in range(3):
            try:
                get_model(DEMUCS_MODEL)
                break
            except Exception as error:
                if attempt == 2:
                    raise
                emit("log", message="htdemucs download: %s (retry %d)" % (error, attempt + 1))
        progress("demucs", 1.0, "htdemucs ready")
    emit("result", model=size, path=target, bytes=dir_size(target), demucs=demucs_present(args))


def decode_audio(path, rate=44100):
    import av
    import numpy as np
    container = av.open(path)
    try:
        stream = next(s for s in container.streams if s.type == "audio")
        resampler = av.AudioResampler(format="fltp", layout="stereo", rate=rate)
        chunks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray())
        for out in resampler.resample(None):
            chunks.append(out.to_ndarray())
    finally:
        container.close()
    if not chunks:
        raise ValueError("no audio in file")
    return np.concatenate(chunks, axis=1).astype("float32")


def separate_vocals(torch, stereo, device):
    """htdemucs vocals stem, (n,) float32 at 44.1 kHz (mono)."""
    import numpy as np
    import demucs.apply as demucs_apply
    from demucs.pretrained import get_model

    class _Tqdm:
        @staticmethod
        def tqdm(iterable, **kwargs):
            items = list(iterable)
            for index, item in enumerate(items):
                progress("separate", index / max(1, len(items)), "demucs")
                yield item

    demucs_apply.tqdm = _Tqdm
    model = get_model(DEMUCS_MODEL)
    model.to(device).eval()
    wav = torch.from_numpy(stereo)
    ref = wav.mean(0)
    mean, std = ref.mean(), ref.std() + 1e-8
    with torch.no_grad():
        sources = demucs_apply.apply_model(model, ((wav - mean) / std)[None], device=device, split=True, overlap=0.25, progress=True)[0]
    sources = sources * std + mean
    vocals = sources[model.sources.index("vocals")].mean(0).cpu().numpy().astype("float32")
    del model, sources
    if device == "cuda":
        torch.cuda.empty_cache()
    return vocals


def resample(torch, mono, src, dst):
    import julius
    with torch.no_grad():
        return julius.resample_frac(torch.from_numpy(mono), src, dst).numpy().astype("float32")


def write_wav16(path, mono, rate):
    import numpy as np
    pcm = (np.clip(mono, -1.0, 1.0) * 32767.0).astype("<i2")
    tmp = path + ".part"
    with wave.open(tmp, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(pcm.tobytes())
    os.replace(tmp, path)


def peaks(mono, rate, per_second=50):
    import numpy as np
    hop = max(1, int(rate / per_second))
    count = int(math.ceil(len(mono) / hop))
    padded = np.zeros(count * hop, dtype="float32")
    padded[: len(mono)] = np.abs(mono)
    values = padded.reshape(count, hop).max(axis=1)
    top = float(np.percentile(values, 99.5)) or 1.0
    return [round(min(1.0, float(v) / top), 3) for v in values]


def cmd_transcribe(args):
    started = time.time()
    timings = {}
    audio = args["audio"]
    out_dir = args["outDir"]
    size = args.get("model", "small")
    language = args.get("language") or None
    if language == "auto":
        language = None
    model_path = whisper_dir(args, size)
    if not os.path.isfile(os.path.join(model_path, "model.bin")):
        emit("error", code="model-missing", message="whisper model %s is not downloaded" % size)
        return 3
    torch = prepare_torch_dlls()
    want = args.get("device", "auto")
    cuda = bool(torch is not None and torch.cuda.is_available())
    device = "cuda" if (want in ("auto", "cuda") and cuda) else "cpu"
    if want == "cuda" and not cuda:
        emit("log", message="CUDA not available, using CPU")

    progress("decode", 0.0, "decode")
    stereo = decode_audio(audio)
    duration = stereo.shape[1] / 44100.0
    timings["decode"] = round(time.time() - started, 2)
    progress("decode", 1.0, "%.1f s" % duration)

    vocals = None
    stem = None
    if args.get("separate", True):
        if torch is None:
            emit("log", message="torch missing, skipping vocal separation")
        else:
            t0 = time.time()
            progress("separate", 0.0, "demucs")
            try:
                vocals = separate_vocals(torch, stereo, device)
            except Exception as error:
                if device == "cuda":
                    emit("log", message="demucs on GPU failed (%s); retrying on CPU" % error)
                    torch.cuda.empty_cache()
                    vocals = separate_vocals(torch, stereo, "cpu")
                else:
                    raise
            timings["separate"] = round(time.time() - t0, 2)
            progress("separate", 1.0, "demucs")
    mono44 = vocals if vocals is not None else stereo.mean(axis=0)
    mono16 = resample(torch, mono44, 44100, 16000) if torch is not None else mono44[::3]
    if vocals is not None:
        stem = os.path.join(out_dir, "vocals.wav")
        write_wav16(stem, mono16, 16000)
    wave_peaks = peaks(mono44, 44100)

    t0 = time.time()
    progress("transcribe", 0.0, "load %s on %s" % (size, device))
    from faster_whisper import WhisperModel
    compute = args.get("computeType") or ("float16" if device == "cuda" else "int8")
    model = WhisperModel(model_path, device=device, compute_type=compute)
    prompt = (args.get("prompt") or "").strip()[:600] or None
    segments, info = model.transcribe(
        mono16,
        language=language,
        task="transcribe",
        beam_size=5,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 400},
        condition_on_previous_text=False,
        initial_prompt=prompt,
        hotwords=None,
    )
    words, segs = [], []
    for seg in segments:
        segs.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip(), "avgLogprob": round(seg.avg_logprob, 3), "noSpeech": round(seg.no_speech_prob, 3)})
        for w in seg.words or []:
            words.append({"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
        progress("transcribe", seg.end / duration if duration else 0.0, seg.text.strip()[:60])
    timings["transcribe"] = round(time.time() - t0, 2)
    progress("transcribe", 1.0, "%d words" % len(words))
    result = {
        "engineVersion": ENGINE_VERSION, "model": size, "device": device, "computeType": compute,
        "language": info.language, "languageProbability": round(info.language_probability, 3),
        "duration": round(duration, 3), "separated": vocals is not None, "vocals": "vocals.wav" if stem else None,
        "words": words, "segments": segs, "peaks": {"perSecond": 50, "values": wave_peaks},
        "timings": timings, "seconds": round(time.time() - started, 2),
    }
    path = os.path.join(out_dir, "transcript.json")
    with open(path + ".part", "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False)
    os.replace(path + ".part", path)
    emit("result", transcript="transcript.json", words=len(words), language=info.language, device=device, model=size,
         separated=vocals is not None, timings=timings, seconds=result["seconds"], duration=result["duration"])
    return 0


COMMANDS = {"probe": cmd_probe, "prefetch": cmd_prefetch, "transcribe": cmd_transcribe}


def main(argv):
    if len(argv) != 3 or argv[1] not in COMMANDS:
        emit("error", code="usage", message="usage: dsh_mv_engine.py probe|prefetch|transcribe args.json")
        return 2
    with open(argv[2], "r", encoding="utf-8") as fh:
        args = json.load(fh)
    try:
        return COMMANDS[argv[1]](args) or 0
    except Exception as error:
        emit("error", code="failed", message="%s: %s" % (type(error).__name__, error), trace=traceback.format_exc()[-3000:])
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
