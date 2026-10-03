/**
 * Spectrum sources for the film's 48 bands (values 0..1).
 *  - live: an AnalyserNode on the <audio> element, folded into 48 log bands
 *    and normalised with a slowly decaying peak (no files needed);
 *  - file: the `spectrum.json` of the user's local ascii copy ({fps,bands,frames}).
 */
export const BANDS = 48
const SILENT = Object.freeze(new Array(BANDS).fill(0))

/** spectrum.json → energy(t), exactly as player.py's Film.energy. */
export function spectrumFromJson(text) {
  const data = typeof text === 'string' ? JSON.parse(text.replace(/^\uFEFF/, '')) : text
  const fps = Number(data?.fps)
  const frames = data?.frames
  if (!Number.isFinite(fps) || fps <= 0 || !Array.isArray(frames) || !frames.length) throw new Error('spectrum.json 格式无效（需要 fps 与 frames）。')
  return t => frames[Math.min(frames.length - 1, Math.max(0, Math.trunc(t * fps)))] ?? SILENT
}

/** Log-spaced FFT bin edges for `bands` bands between lo and hi Hz. */
export function bandEdges(binCount, sampleRate, bands = BANDS, lo = 40, hi = 16000) {
  const nyquist = sampleRate / 2
  const edges = []
  for (let i = 0; i <= bands; i++) {
    const f = lo * Math.pow(hi / lo, i / bands)
    edges.push(Math.min(binCount, Math.max(1, Math.round(f / nyquist * binCount))))
  }
  for (let i = 1; i < edges.length; i++) if (edges[i] <= edges[i - 1]) edges[i] = Math.min(binCount, edges[i - 1] + 1)
  return edges
}

/** Fold byte FFT magnitudes into normalised bands (pure; used by the live analyser). */
export function foldBands(bytes, edges, peaks, decay = 0.995) {
  const out = new Array(edges.length - 1)
  for (let b = 0; b < out.length; b++) {
    let sum = 0, n = 0
    for (let i = edges[b]; i < Math.max(edges[b] + 1, edges[b + 1]); i++) { sum += bytes[i] ?? 0; n++ }
    const v = n ? sum / n / 255 : 0
    peaks[b] = Math.max(v, (peaks[b] ?? 0) * decay, 0.08)
    out[b] = Math.max(0, Math.min(1, (v / peaks[b]) ** 1.6))
  }
  return out
}

/** Live analyser for an <audio> element. One per element (Web Audio rule). */
export class LiveSpectrum {
  constructor(audio, AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
    this.audio = audio
    this.Ctx = AudioContextClass
    this.context = null
    this.peaks = []
    this.last = SILENT
  }

  /** Must run from a user gesture (play button / key). */
  ensure() {
    if (this.context || !this.Ctx) { void this.context?.resume?.(); return }
    this.context = new this.Ctx()
    const source = this.context.createMediaElementSource(this.audio)
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 4096
    this.analyser.smoothingTimeConstant = 0.55
    source.connect(this.analyser)
    this.analyser.connect(this.context.destination)
    this.bytes = new Uint8Array(this.analyser.frequencyBinCount)
    this.edges = bandEdges(this.analyser.frequencyBinCount, this.context.sampleRate)
  }

  /** Bands for the current audio frame (t is ignored: the analyser is live). */
  energy() {
    if (!this.analyser || this.audio.paused) return this.last.map(v => v * 0.9)
    this.analyser.getByteFrequencyData(this.bytes)
    this.last = foldBands(this.bytes, this.edges, this.peaks)
    return this.last
  }

  close() { void this.context?.close?.(); this.context = null; this.analyser = null }
}

export const silentEnergy = () => SILENT
