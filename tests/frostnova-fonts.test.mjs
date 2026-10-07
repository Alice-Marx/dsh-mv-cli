import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { encodeMask, sourceCharacters, fontCodePoints } from '../presets/ports/frostnova-web/fonts/build-fonts.mjs';
import { decodeMask, configureFonts, makeCanvas, restoreText } from '../presets/ports/frostnova-web/fonts/runtime.mjs';
import { FONT_ALIASES, canonicalFamily } from '../presets/ports/frostnova-web/fonts/font-aliases.mjs';

test('font alpha RLE is lossless, bounded and does not use RGBA/network fonts', () => {
  const pixels = Uint8Array.from([0, 0, 30, 30, 128, 255, 255, 255, 1, 0, 0, 0]);
  const rle = encodeMask(pixels);
  assert.deepEqual(decodeMask(rle, 4, 3), pixels);
  const compressed = gzipSync(Buffer.from(rle, 'base64')).toString('base64');
  assert.deepEqual(decodeMask(compressed, 4, 3, true), pixels);
  assert.deepEqual(decodeMask(encodeMask(new Uint8Array()), 0, 0), new Uint8Array());
  assert.throws(() => decodeMask('!', 1, 1), /base64/);
  assert.throws(() => decodeMask(Buffer.from([0, 255]).toString('base64'), 1, 1), /run/);
  assert.throws(() => decodeMask(encodeMask(new Uint8Array(2)), 1, 1), /run/);
  assert.throws(() => decodeMask('', 1, 1), /Incomplete/);
  assert.throws(() => decodeMask('', 193, 1), /Invalid/);
  assert.throws(() => decodeMask(gzipSync(new Uint8Array(1000)).toString('base64'), 1, 1, true), /Oversized/);
});

test('character extraction preserves source Unicode without executing source', () => {
  const chars = sourceCharacters('"警告、넷、λ、ᵀ"; const x = "\\u221E"; throw Error("not executed")');
  for (const char of ['警', '告', '넷', 'λ', 'ᵀ', '∞', '?', ' ']) assert.ok(chars.includes(char));
  assert.equal(new Set(chars).size, chars.length);
  assert.throws(() => fontCodePoints(Buffer.alloc(2)));
});

class FakeContext {
  constructor(canvas) {
    this.canvas = canvas; this.font = '400 64px "JetBrains Mono"'; this.letterSpacing = '0px'; this.fontKerning = 'normal';
    this.fillStyle = this.strokeStyle = '#fff'; this.lineWidth = 1; this.textAlign = 'left'; this.textBaseline = 'alphabetic'; this.stack = []; this.calls = [];
  }
  save() { this.stack.push({ font: this.font, letterSpacing: this.letterSpacing }); }
  restore() { Object.assign(this, this.stack.pop()); }
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
  putImageData(image) { this.image = image; }
  drawImage(...args) { this.calls.push(['drawImage', ...args]); }
  translate(...args) { this.calls.push(['translate', ...args]); }
  scale(...args) { this.calls.push(['scale', ...args]); }
  fillRect(...args) { this.calls.push(['fillRect', ...args]); }
}
class FakeCanvas {
  constructor(w, h) { this.width = w; this.height = h; }
  getContext(type) { if (type !== '2d') return { type }; return this.context ||= new FakeContext(this); }
}
const face = { id: 'mono', family: 'JetBrains Mono', weight: 400, italic: false, ascent: 48, descent: 16, baselines: { top: 48, middle: 16, alphabetic: 0, bottom: -16 } };
const glyph = char => ({ face: 'mono', char, advance: 40, x: 2, y: -4, w: 2, h: 4, rle: encodeMask(Uint8Array.from([255, 0, 255, 255, 255, 255, 255, 0])) });
const fixture = {
  'font-2': { format: 'frostnova-font-masks', version: 1, em: 64, faces: [], glyphs: [glyph('A')] },
  'font-1': { format: 'frostnova-font-masks', version: 1, em: 64, faces: [face], glyphs: [glyph('?')] },
};

test('canvas wrapper preserves drawing and restoration after words-off assignment', () => {
  const previous = globalThis.OffscreenCanvas;
  globalThis.OffscreenCanvas = FakeCanvas;
  try {
    assert.equal(configureFonts(fixture), 1);
    const canvas = makeCanvas(200, 100), g = canvas.getContext('2d');
    assert.ok(canvas instanceof FakeCanvas);
    assert.equal(canvas.getContext('2d'), g);
    assert.equal(canvas.getContext('webgl2').type, 'webgl2');
    assert.equal(g.measureText('AA').width, 80);
    g.letterSpacing = '3px';
    assert.equal(g.measureText('AA').width, 83);
    g.font = '400 32px "JetBrains Mono"';
    assert.equal(g.measureText('AA').width, 43);
    assert.equal(g.measureText('A').actualBoundingBoxAscent, 2);
    g.textAlign = 'center'; g.textBaseline = 'top';
    const positioned = g.measureText('A');
    assert.equal(positioned.actualBoundingBoxLeft, 9);
    assert.equal(positioned.actualBoundingBoxAscent, -22);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const wrapped = g.fillText;
    g.fillText = () => {};
    g.fillText('A', 10, 20);
    assert.equal(g.calls.length, 0);
    delete g.fillText; delete g.strokeText;
    restoreText(g);
    assert.equal(g.fillText, wrapped);
    g.fillText('AA', 10, 20, 12);
    assert.ok(g.calls.some(c => c[0] === 'scale' && c[1] < 1));
    assert.ok(g.calls.some(c => c[0] === 'drawImage'));
    g.calls.length = 0; g.strokeText('A', 10, 20);
    assert.ok(g.calls.some(c => c[0] === 'drawImage'));
    g.fillRect(0, 0, 2, 2);
    assert.equal(g.calls.at(-1)[0], 'fillRect');
    assert.throws(() => restoreText({}), /Not a/);
  } finally { globalThis.OffscreenCanvas = previous; }
});

test('shards cannot silently duplicate glyphs or accept unknown encodings', () => {
  assert.throws(() => configureFonts({ bad: { ...fixture['font-1'], encoding: 'url' } }), /version/);
  assert.throws(() => configureFonts({ a: fixture['font-1'], b: fixture['font-1'] }), /duplicate/);
  assert.throws(() => configureFonts({}), /missing/);
});

test('upstream Avenir Next/AvenirNext logo and all source font aliases route to explicit OFL faces', () => {
  for (const [family, aliases] of Object.entries(FONT_ALIASES)) for (const alias of aliases) assert.equal(canonicalFamily(alias), family);
  assert.equal(canonicalFamily('avenir next'), 'Space Grotesk');
  assert.equal(canonicalFamily('AvenirNext-Heavy'), 'Space Grotesk');
  const previous = globalThis.OffscreenCanvas;
  globalThis.OffscreenCanvas = FakeCanvas;
  try {
    const space = { ...face, id: 'space', family: 'Space Grotesk', weight: 600, aliases: FONT_ALIASES['Space Grotesk'] };
    const serif = { ...face, id: 'serif', family: 'STIX Two Text' };
    configureFonts({ one: { ...fixture['font-1'], faces: [face, space, serif], glyphs: [glyph('?'), glyph('A'), { ...glyph('A'), face: 'space', advance: 25 }, { ...glyph('A'), face: 'serif', advance: 31 }] } });
    const g = makeCanvas().getContext('2d');
    for (const family of ['Space Grotesk', 'Avenir Next', 'AvenirNext', 'AvenirNext-Regular', 'AvenirNext-Medium', 'AvenirNext-DemiBold', 'AvenirNext-Bold', 'AvenirNext-Heavy']) {
      g.font = `600 64px "${family}"`;
      assert.equal(g.measureText('AA').width, 50, `${family} must not silently fall through to the serif face`);
    }
    g.font = '400 64px "Menlo"'; assert.equal(g.measureText('A').width, 40);
    g.font = '400 64px serif'; assert.equal(g.measureText('A').width, 31);
  } finally { globalThis.OffscreenCanvas = previous; }
});

const fontDirectory = process.env.FROSTNOVA_FONT_DIR;
test('real Chrome uses baked OFL glyphs with alignment, outlines, gradients, glow and words restore', { skip: !fontDirectory }, async () => {
  const require = createRequire(new URL('../presets/ports/frostnova-web/package.json', import.meta.url));
  const { build } = require('esbuild');
  const { chromium } = require(process.env.DSH_MV_PLAYWRIGHT || 'playwright');
  const runtimePath = resolve('presets/ports/frostnova-web/fonts/runtime.mjs');
  const bundle = await build({ entryPoints: [runtimePath], bundle: true, format: 'iife', globalName: 'FrostFonts', platform: 'browser', write: false, minify: false });
  const assets = {};
  for (const name of (await readdir(fontDirectory)).sort()) {
    if (/^font-\d+\.json$/.test(name)) assets[name.slice(0, -5)] = JSON.parse(await readFile(join(fontDirectory, name), 'utf8'));
  }
  const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><body><h1>Offline OFL mask QA</h1></body>'); });
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const browser = await chromium.launch({ ...(process.env.DSH_MV_CHROME ? { executablePath: process.env.DSH_MV_CHROME } : {}), headless: true });
  try {
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const report = await page.evaluate(async assets => {
      const faceCount = FrostFonts.configureFonts(assets), canvas = FrostFonts.makeCanvas(960, 720), g = canvas.getContext('2d');
      g.fillStyle = '#071019'; g.fillRect(0, 0, 960, 720);
      let y = 54;
      const lines = [
        ['700 40px "JetBrains Mono"', 'world.execute(me);  AV  λ ∞ ≠ ⎿ ✢✳✻', '#9ff3ff'],
        ['600 48px "Avenir Next"', 'FrostNovaOrg  AV 0123456789', '#fff'],
        ['italic 400 44px "STIX Two Text"', 'Projection ℝ⁴ → ℝ³:  p′ = 2p ⁄ (3 − w).', '#ffe5b0'],
        ['500 36px "Noto Sans SC"', '本视频包含强烈闪烁与快速切换的画面', '#c4fcdb'],
        ['800 90px "Apple SD Gothic Neo"', '넷', '#9ff3ff'],
      ];
      for (const [font, text, color] of lines) {
        g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = color;
        g.letterSpacing = '0.8px'; g.fillText(text, 24, y); y += 100;
      }
      g.font = '700 72px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const gradient = g.createLinearGradient(80, 0, 720, 0); gradient.addColorStop(0, '#f33'); gradient.addColorStop(1, '#3df');
      g.strokeStyle = gradient; g.lineWidth = 5; g.shadowColor = '#28c8ff'; g.shadowBlur = 10;
      g.save(); g.translate(480, 610); g.rotate(-.03); g.globalAlpha = .75;
      g.strokeText('EXECUTION', 0, 0); g.shadowBlur = 0; g.fillStyle = '#fff'; g.fillText('EXECUTION', 0, 0); g.restore();
      g.shadowBlur = 0; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '400 64px "JetBrains Mono"';
      const widths = [g.measureText('M').width, g.measureText('W').width, g.measureText('i').width];
      const aliasWidths = {};
      for (const family of ['Space Grotesk', 'Avenir Next', 'AvenirNext']) { g.font = `600 48px "${family}"`; aliasWidths[family] = g.measureText('FrostNovaOrg').width; }
      const previous = g.fillText; g.fillText = () => {}; g.strokeText = () => {}; delete g.fillText; delete g.strokeText; FrostFonts.restoreText(g);
      if (g.fillText !== previous) throw new Error('words-on lost the mask wrapper');
      const image = g.getImageData(0, 0, 960, 720).data;
      let lit = 0; for (let i = 0; i < image.length; i += 4) if (image[i] + image[i + 1] + image[i + 2] > 150) lit++;
      // A gradient made in canvas space must retain that space when the glyph
      // is drawn at an offset or under a new transform.
      const check = FrostFonts.makeCanvas(240, 180), c = check.getContext('2d');
      c.font = '700 128px "JetBrains Mono"'; c.textBaseline = 'alphabetic';
      const grad = c.createLinearGradient(0, 0, 200, 0); grad.addColorStop(0, '#f00'); grad.addColorStop(1, '#00f');
      c.fillStyle = grad; c.fillText('A', 100, 130);
      const sample = c.getImageData(0, 0, 240, 180).data;
      let gradientError = 0, sampled = 0;
      for (let py = 0; py < 180; py++) for (let px = 100; px < 190; px++) {
        const index = (py * 240 + px) * 4;
        if (sample[index + 3] < 250) continue;
        gradientError += Math.abs(sample[index + 2] - 255 * (px + .5) / 200); sampled++;
      }
      return { faceCount, widths, aliasWidths, lit, gradientError: gradientError / sampled, sampled, png: Array.from(new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer())) };
    }, assets);
    assert.equal(report.faceCount, 22);
    assert.ok(Math.max(...report.widths) - Math.min(...report.widths) < .001);
    assert.equal(report.aliasWidths['Avenir Next'], report.aliasWidths['Space Grotesk']);
    assert.equal(report.aliasWidths.AvenirNext, report.aliasWidths['Space Grotesk']);
    assert.ok(report.lit > 20000);
    assert.ok(report.sampled > 100);
    assert.ok(report.gradientError < 2, `Canvas-space gradient error ${report.gradientError}`);
    assert.deepEqual(errors, []);
    if (process.env.FROSTNOVA_FONT_QA_DIR) {
      const output = process.env.FROSTNOVA_FONT_QA_DIR;
      await mkdir(output, { recursive: true });
      await writeFile(join(output, 'font-runtime.png'), Buffer.from(report.png));
      const { png, ...metrics } = report;
      await writeFile(join(output, 'font-runtime-report.json'), JSON.stringify(metrics, null, 2) + '\n');
    }
  } finally { await browser.close(); await new Promise(resolveClose => server.close(resolveClose)); }
});
