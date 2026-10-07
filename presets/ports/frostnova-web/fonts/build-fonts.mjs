#!/usr/bin/env node
/* Offline build only. Loads the upstream's OFL files in a local Chrome page,
 * snapshots just supported glyphs, and emits small inert JSON mask shards.
 * Usage: node build-fonts.mjs --upstream DIR --out NEW_DIR [--extra-fonts JSON]
 * extra-fonts: [{family,file,weights:[400,500,700],italicFile?,chars?}].
 * No audio, platform/system font files or reusable font binary is copied.
 */
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { aliasesFor } from './font-aliases.mjs';

export function encodeMask(alpha) {
  const bytes = [];
  for (let at = 0; at < alpha.length;) {
    const value = alpha[at];
    let end = at + 1;
    while (end < alpha.length && alpha[end] === value && end - at < 255) end++;
    bytes.push(end - at, value); at = end;
  }
  return Buffer.from(bytes).toString('base64');
}

export function fontCodePoints(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const tableCount = view.getUint16(4);
  let cmap = null;
  for (let i = 0; i < tableCount; i++) {
    const offset = 12 + i * 16;
    if (buffer.toString('ascii', offset, offset + 4) === 'cmap') cmap = view.getUint32(offset + 8);
  }
  if (cmap === null) throw new Error('The source font has no cmap');
  const result = new Set();
  for (let i = 0, count = view.getUint16(cmap + 2); i < count; i++) {
    const offset = cmap + view.getUint32(cmap + 4 + i * 8 + 4);
    const format = view.getUint16(offset);
    if (format === 12) {
      const groups = view.getUint32(offset + 12);
      for (let j = 0; j < groups; j++) {
        const start = view.getUint32(offset + 16 + j * 12), end = view.getUint32(offset + 20 + j * 12), glyph = view.getUint32(offset + 24 + j * 12);
        for (let code = start; code <= end; code++) if (glyph + code - start) result.add(code);
      }
    } else if (format === 4) {
      const count = view.getUint16(offset + 6) / 2;
      const ends = offset + 14, starts = ends + count * 2 + 2, deltas = starts + count * 2, ranges = deltas + count * 2;
      for (let j = 0; j < count; j++) {
        const start = view.getUint16(starts + j * 2), end = view.getUint16(ends + j * 2), delta = view.getInt16(deltas + j * 2), range = view.getUint16(ranges + j * 2);
        for (let code = start; code <= end && code < 65535; code++) {
          const location = ranges + j * 2 + range + (code - start) * 2;
          let glyph = range ? view.getUint16(location) : (code + delta) & 65535;
          if (range && glyph) glyph = (glyph + delta) & 65535;
          if (glyph) result.add(code);
        }
      }
    }
  }
  return result;
}

async function sourceText(directory) {
  const texts = [];
  async function walk(at) {
    for (const item of (await readdir(at, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const path = join(at, item.name);
      if (item.isDirectory()) await walk(path);
      else if (/\.(?:js|json)$/.test(item.name)) texts.push(await readFile(path, 'utf8'));
    }
  }
  await walk(join(directory, 'src'));
  texts.push(await readFile(join(directory, 'assets', 'subs', 'zh.json'), 'utf8'));
  return texts.join('\n');
}

export function sourceCharacters(text) {
  const chars = new Set(Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)));
  for (const char of text) if (char.codePointAt(0) >= 160 && !/[\uFE00-\uFE0F]/.test(char)) chars.add(char);
  // Some source literals quote escaped Unicode, without displaying that glyph in
  // the file itself. Include those too, but never evaluate/import upstream code.
  for (const match of text.matchAll(/\\u(?:\{([\da-fA-F]{1,6})\}|([\da-fA-F]{4}))/g)) {
    const code = parseInt(match[1] || match[2], 16);
    if (code >= 32 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)) chars.add(String.fromCodePoint(code));
  }
  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
}

function argumentsOf(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!/^--(?:upstream|out|extra-fonts|playwright|chrome)$/.test(argv[i]) || !argv[i + 1]) throw new Error(`Invalid argument ${argv[i]}`);
    result[argv[i].slice(2)] = argv[i + 1];
  }
  if (!result.upstream || !result.out) throw new Error('Supply --upstream DIR and --out NEW_DIR');
  return result;
}

export async function buildFonts(options) {
  const upstream = resolve(options.upstream), out = resolve(options.out);
  try { await stat(out); throw new Error('Output directory exists; choose a new --out directory'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const require = createRequire(import.meta.url);
  const { chromium } = require(options.playwright || process.env.DSH_MV_PLAYWRIGHT || 'playwright');
  const text = await sourceText(upstream), characters = sourceCharacters(text);
  const pairs = [...new Set(Array.from(text.matchAll(/[ -~]{2}/g), match => match[0]))].sort();
  const specs = [
    { family: 'JetBrains Mono', file: join(upstream, 'assets/fonts/JetBrainsMono-VF.ttf'), license: join(upstream, 'assets/fonts/JetBrainsMono-OFL.txt'), weights: [400, 500, 600, 700, 800] },
    { family: 'Space Grotesk', file: join(upstream, 'assets/fonts/SpaceGrotesk-VF.ttf'), license: join(upstream, 'assets/fonts/SpaceGrotesk-OFL.txt'), weights: [400, 500, 600, 700] },
    { family: 'Noto Sans SC', file: join(upstream, 'assets/fonts/NotoSansSC-Medium-zh.ttf'), license: join(upstream, 'assets/fonts/NotoSansSC-OFL.txt'), weights: [500] },
  ];
  if (options['extra-fonts']) {
    const extraPath = resolve(options['extra-fonts']);
    specs.push(...JSON.parse(await readFile(extraPath, 'utf8')).map(spec => ({ ...spec, file: resolve(dirname(extraPath), spec.file), license: resolve(dirname(extraPath), spec.license), ...(spec.italicFile ? { italicFile: resolve(dirname(extraPath), spec.italicFile) } : {}) })));
  }
  const files = new Map(), prepared = [];
  for (let index = 0; index < specs.length; index++) {
    const spec = specs[index], variants = spec.italicFile ? [false, true] : [false];
    for (const italic of variants) {
      const file = resolve(italic ? spec.italicFile : spec.file);
      const bytes = await readFile(file), supported = fontCodePoints(bytes), sourceSha256 = createHash('sha256').update(bytes).digest('hex');
      const key = `font-${index}-${italic ? 'italic' : 'normal'}.ttf`;
      files.set(`/${key}`, bytes);
      const chars = (spec.chars ? [...spec.chars] : characters).filter(char => supported.has(char.codePointAt(0)));
      for (const weight of spec.weights) prepared.push({ id: `${index}-${weight}-${italic ? 'i' : 'n'}`, family: spec.family, aliases: aliasesFor(spec.family), browserFamily: `FrostBake${index}${italic ? 'I' : 'N'}`, file: key, weight, italic, chars, sourceSha256, pairs: spec.family === 'JetBrains Mono' || spec.family.startsWith('Noto ') ? [] : pairs });
    }
  }
  const missing = characters.filter(char => !prepared.some(face => face.chars.includes(char)));
  const server = createServer((request, response) => {
    if (request.url === '/') { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><title>OFL font mask baker</title>'); return; }
    const bytes = files.get(request.url);
    if (!bytes) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', 'font/ttf'); response.end(bytes);
  });
  await new Promise((resolveListen, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolveListen); });
  let browser, result;
  try {
    browser = await chromium.launch({ ...(options.chrome ? { executablePath: options.chrome } : {}), headless: true });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    result = await page.evaluate(async (inputs) => {
      const loaded = new Set();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 224;
      const g = canvas.getContext('2d', { willReadFrequently: true });
      const faces = [], glyphs = [];
      for (const face of inputs) {
        if (!loaded.has(face.browserFamily)) {
          const font = new FontFace(face.browserFamily, `url(/${face.file})`, { weight: '100 900', style: face.italic ? 'italic' : 'normal' });
          await font.load(); document.fonts.add(font); loaded.add(face.browserFamily);
        }
        g.font = `${face.italic ? 'italic ' : ''}${face.weight} 64px "${face.browserFamily}"`;
        g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff'; g.fontKerning = 'normal'; g.letterSpacing = '0px';
        const probe = face.chars.filter(char => char.trim()).slice(0, 2).join('');
        const metrics = g.measureText(probe);
        const spec = { id: face.id, family: face.family, aliases: face.aliases, weight: face.weight, italic: face.italic, ascent: metrics.fontBoundingBoxAscent, descent: metrics.fontBoundingBoxDescent, sourceSha256: face.sourceSha256 };
        spec.baselines = {};
        for (const baseline of ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']) {
          g.textBaseline = baseline;
          spec.baselines[baseline] = metrics.actualBoundingBoxAscent - g.measureText(probe).actualBoundingBoxAscent;
        }
        g.textBaseline = 'alphabetic';
        if (face.pairs.length) {
          const widths = new Map(face.chars.map(char => [char, g.measureText(char).width]));
          spec.pairs = face.pairs.filter(pair => widths.has(pair[0]) && widths.has(pair[1])).map(pair => [pair, g.measureText(pair).width - widths.get(pair[0]) - widths.get(pair[1])]).filter(([, delta]) => Math.abs(delta) >= .001);
        }
        faces.push(spec);
        for (const char of face.chars) {
          g.clearRect(0, 0, 224, 224);
          const originX = 64, baseline = 144;
          g.fillText(char, originX, baseline);
          const rgba = g.getImageData(0, 0, 224, 224).data;
          let minX = 224, minY = 224, maxX = -1, maxY = -1;
          for (let y = 0; y < 224; y++) for (let x = 0; x < 224; x++) if (rgba[(y * 224 + x) * 4 + 3]) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
          const w = maxX < 0 ? 0 : maxX - minX + 1, h = maxY < 0 ? 0 : maxY - minY + 1, alpha = [];
          if (w) for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) alpha.push(rgba[(y * 224 + x) * 4 + 3]);
          glyphs.push({ face: face.id, char, advance: g.measureText(char).width, x: w ? minX - originX : 0, y: h ? minY - baseline : 0, w, h, alpha });
        }
      }
      return { faces, glyphs };
    }, prepared);
  } finally { if (browser) await browser.close(); await new Promise(resolveClose => server.close(resolveClose)); }
  for (const glyph of result.glyphs) { glyph.rle = gzipSync(Buffer.from(encodeMask(glyph.alpha), 'base64'), { level: 9 }).toString('base64'); delete glyph.alpha; }
  const shards = [], base = { format: 'frostnova-font-masks', version: 1, em: 64, encoding: 'gzip-rle8' };
  let glyphs = [], shardFaces = result.faces, bytes = Buffer.byteLength(JSON.stringify({ ...base, faces: shardFaces, glyphs }));
  for (const glyph of result.glyphs) {
    const size = Buffer.byteLength(JSON.stringify(glyph)) + 1;
    if (bytes + size > 480 * 1024 && glyphs.length) { shards.push({ ...base, faces: shardFaces, glyphs }); glyphs = []; shardFaces = []; bytes = Buffer.byteLength(JSON.stringify({ ...base, faces: shardFaces, glyphs })); }
    glyphs.push(glyph); bytes += size;
  }
  if (glyphs.length) shards.push({ ...base, faces: shardFaces, glyphs });
  await mkdir(out, { recursive: true });
  const summary = { format: 'frostnova-font-build', em: 64, faces: result.faces.map(({ pairs, ...face }) => face), characters: characters.length, glyphs: result.glyphs.length, shards: [], missing: missing.map(char => ({ char, codepoint: `U+${char.codePointAt(0).toString(16).toUpperCase()}` })) };
  for (let i = 0; i < shards.length; i++) {
    const name = `font-${i + 1}.json`, bytes = Buffer.from(JSON.stringify(shards[i]) + '\n');
    await writeFile(join(out, name), bytes, { flag: 'wx' });
    summary.shards.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  summary.totalBytes = summary.shards.reduce((sum, shard) => sum + shard.bytes, 0);
  summary.sources = specs.map(spec => ({ family: spec.family, license: 'SIL OFL 1.1', ...(spec.sourceUrl ? { sourceUrl: spec.sourceUrl } : { source: `FrostNova upstream assets/fonts/${spec.file.split(/[\\/]/).pop()}` }) }));
  for (const spec of specs) await writeFile(join(out, `${spec.family.replace(/[^A-Za-z0-9]+/g, '-')}-OFL.txt`), await readFile(spec.license), { flag: 'wx' });
  await writeFile(join(out, 'font-provenance.json'), JSON.stringify(summary, null, 2) + '\n', { flag: 'wx' });
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  buildFonts(argumentsOf(process.argv.slice(2))).then(summary => console.log(JSON.stringify(summary, null, 2))).catch(error => { console.error(error); process.exitCode = 1; });
}
