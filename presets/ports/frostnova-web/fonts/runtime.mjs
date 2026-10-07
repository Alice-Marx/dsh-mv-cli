/* FrostNova's OFL fonts, baked into inert alpha masks for the MV worker.
 * No font registration, DOM, URLs or native system-font fallback is used here.
 * Masks are sampled at 64 px; the original canvas transform/shadow/compositing
 * applies to the resulting text image. A centred alpha contour is used for
 * outlines rather than consulting a platform font rasterizer at playback.
 */
import { gunzipSync } from 'fflate';
import { canonicalFamily, normalizedFamily } from './font-aliases.mjs';

let activeAssets = null;
let faces = [];
const contexts = new WeakMap();
const gradientSpecs = new WeakMap();
const glyphImages = new Map();
const textImages = new Map();
let imagePixels = 0;
let glyphPixels = 0;
const EM = 64;
const MAX_CACHE_PIXELS = 12 * 1024 * 1024;
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function decodeMask(rle, width, height, compressed = false) {
  if (typeof rle !== 'string' || rle.length > 131072 || !Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0 || width > 192 || height > 192) throw new Error('Invalid font mask');
  const pixels = new Uint8Array(width * height);
  const bytes = [];
  let bits = 0, value = 0;
  for (const character of rle) {
    if (character === '=') break;
    const code = BASE64.indexOf(character);
    if (code < 0) throw new Error('Invalid font-mask base64');
    value = (value << 6) | code;
    bits += 6;
    if (bits >= 8) { bits -= 8; bytes.push((value >> bits) & 255); }
  }
  let runs = bytes;
  if (compressed) {
    if (bytes.length < 18) throw new Error('Invalid font-mask gzip');
    const end = bytes.length - 4;
    const expanded = (bytes[end] | bytes[end + 1] << 8 | bytes[end + 2] << 16 | bytes[end + 3] << 24) >>> 0;
    if (expanded > width * height * 2) throw new Error('Oversized font-mask gzip');
    runs = gunzipSync(new Uint8Array(bytes), { out: new Uint8Array(expanded) });
  }
  if (runs.length > width * height * 2 || runs.length % 2) throw new Error('Invalid font-mask RLE');
  let position = 0;
  for (let i = 0; i < runs.length; i += 2) {
    const count = runs[i];
    if (!count || position + count > pixels.length) throw new Error('Invalid font-mask run');
    pixels.fill(runs[i + 1], position, position + count);
    position += count;
  }
  if (position !== pixels.length) throw new Error('Incomplete font mask');
  return pixels;
}

export function configureFonts(assets) {
  if (assets === activeAssets) return faces.length;
  const next = new Map();
  const shards = Object.values(assets || {}).filter(v => v && v.format === 'frostnova-font-masks');
  if (!shards.length) throw new Error('The complete FrostNova font-mask assets are missing');
  let count = 0;
  for (const shard of shards) {
    if (shard.version !== 1 || shard.em !== EM || ![undefined, 'gzip-rle8'].includes(shard.encoding) || !Array.isArray(shard.faces) || !Array.isArray(shard.glyphs)) throw new Error('Unsupported FrostNova font-mask version');
    for (const face of shard.faces) {
      if (!face || typeof face.id !== 'string' || face.id.length > 64 || typeof face.family !== 'string' || face.family.length > 100 || !Number.isFinite(face.weight) || !Number.isFinite(face.ascent) || !Number.isFinite(face.descent) || Math.abs(face.ascent) > 192 || Math.abs(face.descent) > 192 || next.size > 64 || face.aliases !== undefined && (!Array.isArray(face.aliases) || face.aliases.length > 32 || face.aliases.some(alias => typeof alias !== 'string' || alias.length > 100))) throw new Error('Invalid font-face metrics');
      const existing = next.get(face.id);
      if (existing && JSON.stringify(existing.spec) !== JSON.stringify(face)) throw new Error('Conflicting font faces');
      if (!existing) next.set(face.id, { ...face, spec: face, glyphs: new Map(), pairs: new Map(face.pairs || []) });
    }
  }
  for (const shard of shards) {
    for (const glyph of shard.glyphs) {
      const face = next.get(glyph.face);
      if (!face || typeof glyph.char !== 'string' || [...glyph.char].length !== 1 || ![glyph.advance, glyph.x, glyph.y, glyph.w, glyph.h].every(Number.isFinite) || face.glyphs.has(glyph.char) || ++count > 12000) throw new Error('Invalid or duplicate font glyph');
      decodeMask(glyph.rle, glyph.w, glyph.h, shard.encoding === 'gzip-rle8');
      face.glyphs.set(glyph.char, { ...glyph, compressed: shard.encoding === 'gzip-rle8' });
    }
  }
  faces = [...next.values()];
  if (!faces.length || !faces.some(face => face.family === 'JetBrains Mono' && face.glyphs.has('?'))) throw new Error('Incomplete FrostNova fonts');
  activeAssets = assets;
  glyphImages.clear(); textImages.clear(); imagePixels = 0; glyphPixels = 0;
  return faces.length;
}

function fontSpec(context) {
  const css = String(context.font || '10px "JetBrains Mono"');
  const sizeMatch = /([\d.]+)px(?:\s*\/[^\s]+)?\s+(.+)$/.exec(css);
  const size = Math.max(.01, Math.min(2048, Number(sizeMatch?.[1] || 10)));
  const prefix = css.slice(0, sizeMatch?.index || 0);
  const weight = Number(/\b([1-9]\d{2})\b/.exec(prefix)?.[1] || (/\bbold\b/.test(prefix) ? 700 : 400));
  const italic = /\b(?:italic|oblique)\b/.test(prefix);
  const families = (sizeMatch?.[2] || 'JetBrains Mono').split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
  const spacing = Number.parseFloat(context.letterSpacing || '0') || 0;
  return { size, weight, italic, families, spacing, kerning: context.fontKerning !== 'none' };
}

function faceFor(spec, character) {
  const requested = [...spec.families, 'Noto Sans SC', 'STIX Two Text', 'JetBrains Mono', 'Space Grotesk', 'STIX Two Math', 'Noto Sans KR', 'Noto Sans', 'Noto Sans Symbols 2'];
  for (const requestedFamily of requested) {
    const family = canonicalFamily(requestedFamily);
    let best = null, score = Infinity;
    for (const face of faces) {
      const familyMatches = normalizedFamily(face.family) === normalizedFamily(family) || (face.aliases || []).some(alias => normalizedFamily(alias) === normalizedFamily(requestedFamily));
      if (!familyMatches || !face.glyphs.has(character)) continue;
      const candidate = Math.abs(face.weight - spec.weight) + (Boolean(face.italic) === spec.italic ? 0 : 1000);
      if (candidate < score) { score = candidate; best = face; }
    }
    if (best) return best;
  }
  return faces.find(face => face.family === 'JetBrains Mono' && face.glyphs.has('?'));
}

function layoutText(context, input) {
  if (!faces.length) throw new Error('configureFonts must run before text is drawn');
  const spec = fontSpec(context), scale = spec.size / EM;
  const chars = [...String(input).replace(/[\t\n\r\f]/g, ' ')];
  const placed = [];
  let width = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, ascent = 0, descent = 0, previous = null;
  for (let i = 0; i < chars.length; i++) {
    const face = faceFor(spec, chars[i]);
    const glyph = face.glyphs.get(chars[i]) || face.glyphs.get('?');
    if (!glyph) continue;
    if (previous && spec.kerning && previous.face === face) width += (face.pairs.get(previous.char + chars[i]) || 0) * scale;
    const x = width + glyph.x * scale, y = glyph.y * scale;
    if (glyph.w && glyph.h) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x + glyph.w * scale);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y + glyph.h * scale);
    }
    ascent = Math.max(ascent, face.ascent * scale); descent = Math.max(descent, face.descent * scale);
    placed.push({ face, glyph, x: width });
    width += glyph.advance * scale + (i + 1 < chars.length ? spec.spacing : 0);
    previous = { face, char: chars[i] };
  }
  if (minX === Infinity) minX = maxX = minY = maxY = 0;
  return { spec, scale, placed, width, minX, maxX, minY, maxY, ascent, descent };
}

function alignmentOffset(context, layout) {
  const rtl = context.direction === 'rtl', alignment = context.textAlign;
  return alignment === 'center' ? -layout.width / 2 : alignment === 'right' || alignment === 'end' && !rtl || alignment === 'start' && rtl ? -layout.width : 0;
}
function baselineOffset(context, layout) {
  return (layout.placed[0]?.face?.baselines?.[context.textBaseline] || 0) * layout.scale;
}

function rawCanvas(width, height) { return new OffscreenCanvas(Math.max(1, width), Math.max(1, height)); }

function glyphImage(face, glyph, outline) {
  const radius = Math.min(32, Math.max(0, Math.round(outline * 16) / 16));
  const key = `${face.id}/${glyph.char}/${radius}`;
  if (glyphImages.has(key)) return glyphImages.get(key);
  const alpha = decodeMask(glyph.rle, glyph.w, glyph.h, glyph.compressed);
  const pad = radius ? Math.ceil(radius) + 1 : 0;
  const width = glyph.w + pad * 2, height = glyph.h + pad * 2;
  const canvas = rawCanvas(width, height), g = canvas.getContext('2d');
  const image = g.createImageData(canvas.width, canvas.height);
  const offsets = [];
  if (radius) {
    const bound = Math.ceil(radius);
    for (let y = -bound; y <= bound; y++) for (let x = -bound; x <= bound; x++) if (x * x + y * y <= radius * radius + .25) offsets.push([x, y]);
  }
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let value;
    if (!radius) value = alpha[y * width + x];
    else {
      let high = 0, low = 255;
      for (const [dx, dy] of offsets) {
        const px = x - pad + dx, py = y - pad + dy;
        const sample = px >= 0 && py >= 0 && px < glyph.w && py < glyph.h ? alpha[py * glyph.w + px] : 0;
        high = Math.max(high, sample); low = Math.min(low, sample);
      }
      value = high - low;
    }
    const at = (y * width + x) * 4;
    image.data[at] = image.data[at + 1] = image.data[at + 2] = 255;
    image.data[at + 3] = value || 0;
  }
  g.putImageData(image, 0, 0);
  const result = { canvas, pad };
  // Outline sizes can vary continuously, so also bound actual decoded area.
  while (glyphImages.size && (glyphImages.size >= 4096 || glyphPixels + canvas.width * canvas.height > 4 * 1024 * 1024)) {
    const oldest = glyphImages.keys().next().value, item = glyphImages.get(oldest);
    glyphPixels -= item.canvas.width * item.canvas.height; glyphImages.delete(oldest);
  }
  glyphImages.set(key, result);
  glyphPixels += canvas.width * canvas.height;
  return result;
}

function matrixOf(value) { return [value.a, value.b, value.c, value.d, value.e, value.f]; }
function multiply(A, B) {
  return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
}
function inverse(A) {
  const det = A[0] * A[3] - A[1] * A[2];
  if (!det) return null;
  return [A[3] / det, -A[1] / det, -A[2] / det, A[0] / det, (A[2] * A[5] - A[3] * A[4]) / det, (A[1] * A[4] - A[0] * A[5]) / det];
}

function textImage(context, text, layout, stroke, placement) {
  const style = stroke ? context.strokeStyle : context.fillStyle;
  const outline = stroke ? Math.max(0, Number(context.lineWidth) || 1) / 2 / layout.scale : 0;
  const key = typeof style === 'string' ? JSON.stringify([context.font, context.letterSpacing, context.fontKerning, text, stroke, stroke ? context.lineWidth : 0, style]) : null;
  if (key && textImages.has(key)) {
    const result = textImages.get(key); textImages.delete(key); textImages.set(key, result); return result;
  }
  const pad = stroke ? Math.ceil((outline + 2) * layout.scale) : 1;
  const left = Math.floor(layout.minX - pad), top = Math.floor(layout.minY - pad);
  const width = Math.ceil(layout.maxX + pad) - left, height = Math.ceil(layout.maxY + pad) - top;
  if (width <= 0 || height <= 0 || width > 16384 || height > 8192 || width * height > 8 * 1024 * 1024) return null;
  const canvas = rawCanvas(width, height), g = canvas.getContext('2d');
  for (const item of layout.placed) {
    if (!item.glyph.w || !item.glyph.h) continue;
    const mask = glyphImage(item.face, item.glyph, outline);
    g.drawImage(mask.canvas, item.x + (item.glyph.x - mask.pad) * layout.scale - left, (item.glyph.y - mask.pad) * layout.scale - top, mask.canvas.width * layout.scale, mask.canvas.height * layout.scale);
  }
  g.globalCompositeOperation = 'source-in';
  const gradient = typeof style === 'object' && gradientSpecs.get(style);
  if (gradient) {
    const target = multiply(matrixOf(context.getTransform()), [placement.shrink, 0, 0, 1, placement.x + placement.shrink * (placement.offsetX + left), placement.y + placement.offsetY + top]);
    const inverted = inverse(target);
    if (!inverted) return null;
    // Canvas gradients are evaluated in the paint operation's current space,
    // not in the glyph bitmap's translated/cropped image space.
    const paint = multiply(inverted, matrixOf(context.getTransform()));
    g.setTransform(...paint);
    const replacement = g[gradient.type](...gradient.args);
    for (const [offset, color] of gradient.stops) replacement.addColorStop(offset, color);
    g.fillStyle = replacement;
    const unpaint = inverse(paint);
    if (!unpaint) return null;
    const corners = [[0, 0], [width, 0], [0, height], [width, height]].map(([x, y]) => [unpaint[0] * x + unpaint[2] * y + unpaint[4], unpaint[1] * x + unpaint[3] * y + unpaint[5]]);
    const xs = corners.map(p => p[0]), ys = corners.map(p => p[1]);
    g.fillRect(Math.min(...xs) - 1, Math.min(...ys) - 1, Math.max(...xs) - Math.min(...xs) + 2, Math.max(...ys) - Math.min(...ys) + 2);
  } else { g.fillStyle = style; g.fillRect(0, 0, width, height); }
  const result = { canvas, left, top };
  if (key) {
    while (textImages.size && (textImages.size >= 192 || imagePixels + width * height > MAX_CACHE_PIXELS)) {
      const oldest = textImages.keys().next().value, item = textImages.get(oldest);
      imagePixels -= item.canvas.width * item.canvas.height;
      textImages.delete(oldest);
    }
    textImages.set(key, result); imagePixels += width * height;
  }
  return result;
}

function drawText(context, input, x, y, maxWidth, stroke) {
  x = Number(x); y = Number(y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const text = String(input), layout = layoutText(context, text);
  if (!text || !layout.placed.length || (maxWidth !== undefined && (!Number.isFinite(Number(maxWidth)) || Number(maxWidth) <= 0))) return;
  const shrink = maxWidth !== undefined && layout.width > Number(maxWidth) ? Number(maxWidth) / layout.width : 1;
  const offsetX = alignmentOffset(context, layout), offsetY = baselineOffset(context, layout);
  const image = textImage(context, text, layout, stroke, { x, y, shrink, offsetX, offsetY });
  if (!image) return;
  context.save();
  context.translate(x, y);
  if (shrink !== 1) context.scale(shrink, 1);
  context.drawImage(image.canvas, offsetX + image.left, offsetY + image.top);
  context.restore();
}

export function restoreText(context) {
  const methods = contexts.get(context);
  if (!methods) throw new Error('Not a FrostNova text context');
  Object.defineProperty(context, 'fillText', { value: methods.fillText, writable: true, configurable: true });
  Object.defineProperty(context, 'strokeText', { value: methods.strokeText, writable: true, configurable: true });
}

export function makeCanvas(width = 300, height = 150) {
  const canvas = rawCanvas(width, height);
  const getContext = canvas.getContext.bind(canvas);
  let textContext = null;
  Object.defineProperty(canvas, 'getContext', { configurable: true, value(type, options) {
    if (type !== '2d') return getContext(type, options);
    if (textContext) return textContext;
    textContext = getContext(type, options);
    const methods = {
      fillText(text, x, y, maxWidth) { drawText(textContext, text, x, y, maxWidth, false); },
      strokeText(text, x, y, maxWidth) { drawText(textContext, text, x, y, maxWidth, true); },
    };
    contexts.set(textContext, methods);
    restoreText(textContext);
    for (const type of ['createLinearGradient', 'createRadialGradient', 'createConicGradient']) {
      if (typeof textContext[type] !== 'function') continue;
      const create = textContext[type].bind(textContext);
      Object.defineProperty(textContext, type, { configurable: true, value(...args) {
        const gradient = create(...args), addColorStop = gradient.addColorStop.bind(gradient);
        const spec = { type, args, stops: [] };
        gradientSpecs.set(gradient, spec);
        Object.defineProperty(gradient, 'addColorStop', { configurable: true, value(offset, color) {
          addColorStop(offset, color); spec.stops.push([offset, color]);
        } });
        return gradient;
      } });
    }
    Object.defineProperty(textContext, 'measureText', { configurable: true, writable: true, value(text) {
      const L = layoutText(textContext, text);
      const x = alignmentOffset(textContext, L), y = baselineOffset(textContext, L), baselines = L.placed[0]?.face?.baselines || {};
      return { width: L.width, actualBoundingBoxLeft: -L.minX - x, actualBoundingBoxRight: L.maxX + x, actualBoundingBoxAscent: -L.minY - y, actualBoundingBoxDescent: L.maxY + y, fontBoundingBoxAscent: L.ascent - y, fontBoundingBoxDescent: L.descent + y, emHeightAscent: L.ascent - y, emHeightDescent: L.descent + y, hangingBaseline: (baselines.hanging || 0) * L.scale - y, alphabeticBaseline: -y, ideographicBaseline: (baselines.ideographic || 0) * L.scale - y };
    } });
    return textContext;
  } });
  return canvas;
}

// The main adapter's synchronous factory supplies inert assets before modules
// that create glyph atlases at initialization run. Standalone tests omit it.
if (typeof __frostInitialAssets !== 'undefined' && __frostInitialAssets) configureFonts(__frostInitialAssets);
