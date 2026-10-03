// heartbeat.scene.js — an ECG-style heartbeat line that beats with the music.
//
// Technique (from the dsh PV preset, where the header's heartbeat follows the live loudness):
// a trace scrolls right-to-left; every beat it draws the P-QRS-T shape whose height follows the
// current energy. Beats come from ctx.beat (set "canvas": { "bpm": 128 } in mv.json, and
// "beatOffset" to the time of the first beat), otherwise from bass onsets. A fading "phosphor" tail
// is drawn by sampling the same function a little earlier: the frame stays a pure function of t.

/*@grid*/

// The beat shape over one beat (phase 0..1) as a height -1..1.
function pqrst(phase) {
  if (phase < 0.08) return 0.15 * Math.sin(phase / 0.08 * Math.PI)            // P
  if (phase < 0.12) return 0
  if (phase < 0.14) return -0.25                                             // Q
  if (phase < 0.18) return 1                                                 // R
  if (phase < 0.21) return -0.45                                             // S
  if (phase < 0.32) return 0
  if (phase < 0.45) return 0.3 * Math.sin((phase - 0.32) / 0.13 * Math.PI)   // T
  return 0
}

// Height of the trace at time s (seconds), using ctx.beat when present.
function trace(s, ctx, t) {
  var bpm = ctx.beat ? ctx.beat.bpm : 120
  var offset = ctx.beat ? (t - ctx.beat.index * 60 / bpm - ctx.beat.phase * 60 / bpm) : 0
  var pos = (s - offset) * bpm / 60
  var amp = 0.35 + 0.65 * energyOf(ctx, t)
  return pqrst(pos - Math.floor(pos)) * amp
}

function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows)
  var mid = Math.floor(rows / 2), span = Math.floor(rows * 0.35)
  var secondsAcross = 4 // the width of the screen shows 4 seconds of trace
  // dim grid like a monitor
  for (var y = 1; y < rows - 1; y++) for (var x = 0; x < cols; x += 8) setCell(g, x, y, '·', 0)
  for (var x2 = 0; x2 < cols; x2++) if (x2 % 2 === 0) setCell(g, x2, mid, '·', 0)
  // the trace: newest sample at the right edge
  var prev = null
  for (var x = 0; x < cols; x++) {
    var age = (cols - 1 - x) / cols * secondsAcross   // seconds ago
    var v = trace(t - age, ctx, t)
    var yy = mid - Math.round(v * span)
    var style = age < 0.4 ? 3 : age < 1.5 ? 2 : age < 3 ? 1 : 0 // phosphor fade
    // connect to the previous column with a vertical stroke so spikes are continuous
    if (prev !== null) {
      var a = Math.min(prev, yy), b = Math.max(prev, yy)
      for (var k = a; k <= b; k++) setCell(g, x, k, k === yy ? '•' : '│', style)
    } else setCell(g, x, yy, '•', style)
    prev = yy
  }
  // readout
  var bpm = ctx.beat ? ctx.beat.bpm : 120
  var pulse = ctx.beat ? ctx.beat.pulse : 0
  put(g, 2, 1, 'HEARTBEAT', 2)
  put(g, cols - 14, 1, (pulse > 0.5 ? '♥ ' : '♡ ') + bpm + ' BPM', pulse > 0.5 ? 4 : 1)
  put(g, 2, rows - 2, 'energy ' + Math.round(energyOf(ctx, t) * 100) + '%', 0)
  if (ctx.lyric) center(g, rows - 2, ctx.lyric.text, 3)
  return frameOf(g)
}
