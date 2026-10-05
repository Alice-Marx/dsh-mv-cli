#!/usr/bin/env node
/**
 * Bundle the ORIGINAL 12-section Three.js rendering core for the worker.
 * Usage: node build.mjs <upstream-checkout> <out-dir> [--cover file.png] [--author-mit-permission]
 * Dependency versions are taken from upstream's package-lock.json.
 * The builder does not delete an output directory. The explicit MIT opt-in
 * records direct author permission reported by the workshop maintainer.
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [checkoutArg, outArg] = process.argv.slice(2);
if (!checkoutArg || !outArg) {
  console.error('usage: build.mjs <upstream-checkout> <out-dir> [--cover file.png] [--author-mit-permission]');
  process.exit(2);
}
const checkout = resolve(checkoutArg), out = resolve(outArg);
if (existsSync(out)) throw new Error(`Output already exists; choose a new folder: ${out}`);
const offline = process.argv.includes('--offline-app');
const authorMitPermission = process.argv.includes('--author-mit-permission');
const authorGrant = authorMitPermission ? {
  license: 'MIT',
  copyrightHolder: 'wiers-jack',
  confirmedOn: '2026-10-05',
  basis: 'Workshop maintainer confirmed direct author permission to publish this adaptation under MIT.',
  evidenceType: 'maintainer confirmation of direct author contact, not an upstream LICENSE at this revision',
} : null;
const coverAt = process.argv.indexOf('--cover');
const cover = coverAt > 0 ? process.argv[coverAt + 1] : null;
const src = f => readFileSync(join(checkout, 'src', f), 'utf8');
const upstreamPackage = JSON.parse(readFileSync(join(checkout, 'package.json'), 'utf8'));
const requireUpstream = createRequire(join(checkout, 'package.json'));
const { build } = offline ? createRequire(join(here, '../../../package.json'))('esbuild') : requireUpstream('esbuild');
const threeRoot = offline ? null : dirname(dirname(requireUpstream.resolve('three')));
const threePackage = offline ? { version: '0.160.1' } : JSON.parse(readFileSync(join(threeRoot, 'package.json'), 'utf8'));
let librarySource = null, appSha256 = null;
if (offline) {
  // Use only the dependency blocks already committed in the original app.js.
  // Original scenes below still come from src and receive the same reviewed transforms.
  const app = readFileSync(join(checkout, 'app.js'), 'utf8').replace(/\r\n/g, '\n');
  const coreStart = app.indexOf('  // node_modules/three/build/three.module.js');
  const coreEnd = app.indexOf('  // src/audio.js');
  const addonsStart = app.indexOf('  // node_modules/three/examples/jsm/shaders/CopyShader.js');
  const addonsEnd = app.indexOf('  // src/post.js');
  if (coreStart < 0 || coreEnd <= coreStart || addonsStart <= coreEnd || addonsEnd <= addonsStart || !/REVISION = "160"/.test(app)) throw new Error('Unexpected prebuilt Three.js boundaries/version; review app.js.');
  const symbols = new Set(['WebGLRenderer', 'Scene', 'PerspectiveCamera', 'ACESFilmicToneMapping']);
  const scan = dir => { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (entry.name.endsWith('.js')) for (const hit of readFileSync(path, 'utf8').matchAll(/THREE\.([A-Za-z_$][\w$]*)/g)) symbols.add(hit[1]);
  } };
  scan(join(checkout, 'src'));
  const passes = ['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'ShaderPass', 'OutputPass'];
  librarySource = 'var __getOwnPropNames = Object.getOwnPropertyNames;\nvar __esm = (fn, res) => function() { return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res; };\n'
    + app.slice(coreStart, coreEnd) + app.slice(addonsStart, addonsEnd)
    + '\ninit_three_module();\n' + passes.map(name => `init_${name}();`).join('\n')
    + `\nexport { ${[...symbols, ...passes].join(', ')} };\n`;
  appSha256 = createHash('sha256').update(app).digest('hex');
}
const repo = 'https://gitee.com/wiers-jack/world-execute-me-mv';
let commit = process.env.SRC_COMMIT || '';
if (!commit) {
  try { commit = execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
}

// Parse cue timestamps as data. No upstream code is executed by the builder.
const lyrics = [...src('lyrics.js').matchAll(/\{\s*t:\s*([\d.]+),\s*en:\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g)]
  .map(m => ({ t: Number(m[1]), en: m[2].slice(1, -1).replace(/\\(['"\\])/g, '$1') }));
if (lyrics.length < 60) throw new Error('Unexpected upstream cue format; review the adaptation before building.');
const cue = (text, { prefix = false, after = -Infinity } = {}) => {
  const hit = lyrics.find(l => l.t > after && (prefix ? l.en.startsWith(text) : l.en === text));
  if (!hit) throw new Error(`Upstream cue missing for adaptation (${text.length} characters).`);
  return hit.t;
};
const executionMatch = src('lyrics.js').match(/export const EXECUTION_BEATS = (\[[\s\S]*?\]);/);
if (!executionMatch || !/^[\d.,\s\[\]]+$/.test(executionMatch[1])) throw new Error('Unexpected upstream execution beat format.');
const executionBeats = JSON.parse(executionMatch[1].replace(/,\s*\]/g, ']'));
const registrySource = src('sections/index.js');
const sectionData = [...registrySource.matchAll(/\{ id: '([^']+)',\s*start: ([\d.]+),\s*end: ([\d.]+),/g)]
  .map(m => ({ id: m[1], start: Number(m[2]), end: Number(m[3]) }));
const duration = Number(registrySource.match(/export const DURATION = ([\d.]+);/)?.[1]);
if (sectionData.length !== 12 || duration !== 213) throw new Error('Unexpected upstream section registry; review the adaptation.');

function replaceChecked(source, pattern, replacement, name) {
  if (!pattern.test(source)) throw new Error(`Upstream adaptation seam changed: ${name}`);
  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

const transformed = new Map();
function adaptModule(file) {
  let code = src(file);
  // Every canvas here is a generated texture, never a DOM overlay.
  code = code.replace(/document\.createElement\('canvas'\)/g, 'new OffscreenCanvas(300, 150)');
  code = code.replace(/^import \{ LYRICS \} from '\.\.\/lyrics\.js';\r?\n/gm, '');
  code = code.replace(/^import \{ AUDIO_BPM \} from '\.\.\/audio\.js';\r?\n/gm, 'const AUDIO_BPM = 130;\n');
  code = code.replace(/^import \{ EXECUTION_BEATS \} from '\.\.\/lyrics\.js';\r?\n/gm,
    `const EXECUTION_BEATS = ${JSON.stringify(executionBeats)};\n`);
  if (file.endsWith('s04_cage.js')) {
    code = replaceChecked(code, /const cueT = \(en, fb\) => \{[\s\S]*?\};/, '', 'cage cues');
    code = code.replace(/cueT\('([^']+)',\s*[\d.]+\)/g, (_, text) => String(cue(text)));
    // Keep the code-stream geometry while removing embedded song-line prose.
    code = code.replace("'// though we are trapped // in this strange, strange simulation'", "'// cage state: locked // simulation state: running'");
    code = code.replace("'TRAPPED · STRANGE SIMULATION · TRAPPED · STRANGE SIMULATION · '", "'LOCKED · SIMULATION · LOCKED · SIMULATION · '");
  }
  if (file.endsWith('s06_trance.js')) {
    code = replaceChecked(code, /const cueT = \(en\) => LYRICS\.find\(\(l\) => l\.en === en\)\.t - START;/, '', 'trance cues');
    code = code.replace(/cueT\('([^']+)'\)/g, (_, text) => String(cue(text) - 88.78));
  }
  if (file.endsWith('s07_leftalone.js')) {
    code = replaceChecked(code, /function findCue\(match, fallback\) \{[\s\S]*?\n\}/, '', 'isolation cue helper');
    const times = [103.48, 107.22, 110.92, 116.03];
    let i = 0;
    code = code.replace(/findCue\('[^']+',\s*[\d.]+\)/g, () => String(times[i++]));
    if (i !== 4) throw new Error('Unexpected isolation cue count.');
    code = replaceChecked(code, /const LEFT_CUES = LYRICS\.filter\([\s\S]*?\)\.map\(\(l\) => l\.t\);/,
      'const LEFT_CUES = [110.92, 112.33, 113.25, 114.18, 115.08];', 'isolation pulse cues');
  }
  if (file.endsWith('s10_finalchorus.js')) {
    code = replaceChecked(code, /    const findCue = \(prefix\) => \{[\s\S]*?    \};/, '', 'final chorus cue helper');
    code = code.replace(/findCue\('([^']+)'\)/g, (_, text) => String(cue(text, { prefix: true, after: 160 })));
    code = code.replace("'// though we are trapped'", "'// cage state: locked'")
      .replace("'// we are trapped, ah'", "'// cage state: closed'");
  }
  if (file.endsWith('s09_execution.js')) {
    code = replaceChecked(code, /const GLYPH_TEXTS = \[[^\]]+\];/,
      "const GLYPH_TEXTS = ['1', '2', '3', '4', '5', '6'];", 'countdown glyphs');
  }
  if (/\bLYRICS\b/.test(code)) throw new Error(`Unadapted lyric data dependency in ${file}.`);
  const original = src(file);
  transformed.set(file, {
    sha256: createHash('sha256').update(original).digest('hex'),
    adaptedSha256: createHash('sha256').update(code).digest('hex'),
    changed: code !== original,
  });
  return code;
}

// Reuse the original manager verbatim except its browser DPR query. Camera
// blending, fog, section crossfades and fx weights remain upstream algorithms.
const main = src('main.js');
const start = main.indexOf('const { clamp, smoothstep } = util;');
const end = main.indexOf('// -------------------------------------------------------------- boot');
if (start < 0 || end <= start) throw new Error('Unexpected upstream manager layout.');
const managerSource = `import * as THREE from 'three';\nimport * as util from 'mv:upstream/util.js';\nimport { PALETTE, COMMON } from 'mv:upstream/palette.js';\nimport { SECTIONS, XFADE } from 'mv:upstream/sections/index.js';\n`
  + main.slice(start, end).replace('Math.min(window.devicePixelRatio || 1, 2)', '1')
  + '\nexport { SectionManager };\n';

const bundle = await build({
  entryPoints: [join(here, 'scene.js')], bundle: true, format: 'iife', globalName: '__wiersMV',
  platform: 'browser', target: 'es2022', minify: false, treeShaking: true,
  legalComments: 'eof', write: false,
  // The worker has no DOM or animation clock; disable dormant library branches.
  define: { window: 'undefined', document: 'undefined' },
  plugins: [{ name: 'upstream-rendering-core', setup(b) {
    b.onResolve({ filter: /^three$/ }, () => offline ? { path: 'library', namespace: 'mv-library' } : { path: join(threeRoot, 'build/three.module.js') });
    b.onResolve({ filter: /^three\/addons\// }, args => offline ? { path: 'library', namespace: 'mv-library' } : { path: join(threeRoot, 'examples/jsm', args.path.slice('three/addons/'.length)) });
    b.onLoad({ filter: /.*/, namespace: 'mv-library' }, () => ({ contents: librarySource, loader: 'js' }));
    b.onResolve({ filter: /^mv:manager$/ }, () => ({ path: 'manager', namespace: 'mv-adapted' }));
    b.onResolve({ filter: /^mv:upstream\// }, args => ({ path: args.path.slice('mv:upstream/'.length), namespace: 'mv-upstream' }));
    b.onResolve({ filter: /^\./, namespace: 'mv-upstream' }, args => ({ path: join(dirname(args.importer), args.path).replace(/\\/g, '/'), namespace: 'mv-upstream' }));
    b.onLoad({ filter: /.*/, namespace: 'mv-upstream' }, args => ({ contents: adaptModule(args.path), loader: 'js', resolveDir: checkout }));
    b.onLoad({ filter: /.*/, namespace: 'mv-adapted' }, () => ({ contents: managerSource, loader: 'js', resolveDir: checkout }));
  } }],
});
const header = `// Original Three.js rendering core: ${repo}${commit ? ` @ ${commit}` : ''}\n// Three.js ${threePackage.version}; all 12 original scenes, camera paths and bloom chain.\n// Audio and subtitle overlays removed. See NOTICE.md and LICENSE.txt.\n`;
const source = header + bundle.outputFiles[0].text
  + '\nfunction setup(info, gl) { return __wiersMV.setup(info, gl); }\nfunction paint(gl, t, w, h, ctx) { return __wiersMV.paint(gl, t, w, h, ctx); }\n';
if (Buffer.byteLength(source) > 2 * 1024 * 1024) throw new Error('Readable Three.js bundle exceeds the 2 MiB WebGL scene limit.');

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'scenes.js'), source);
const labels = ['Boot', 'World', 'Math', 'AC/DC', 'Cage', 'Organic', 'Trance', 'Left alone', 'Fragments', 'Execution', 'Final chorus', 'Coda'];
const kinds = ['intro', 'verse', 'verse', 'verse', 'chorus', 'verse', 'verse', 'bridge', 'bridge', 'drop', 'chorus', 'outro'];
const manifest = {
  format: 'dsh-mv-pack', version: 1, title: 'world.execute(me); · Original Three.js MV', artist: 'Mili', duration,
  credits: [`Original visuals and rendering: wiers-jack, ${repo}`, 'Three.js contributors (MIT)', 'Worker adapter: Alice-Marx', 'Music and lyrics: Mili (not included)'],
  notice: 'Choose your own audio and lyric files. This pack preserves the upstream 213-second visual timeline. ' + (authorMitPermission
    ? 'Original visual code is distributed under MIT with direct author permission confirmed by the workshop maintainer on 2026-10-05; see NOTICE.md.'
    : 'Upstream package.json declares ISC but ships no LICENSE text; see NOTICE.md.'),
  canvas: { renderer: 'script', script: 'scenes.js', output: 'webgl', subtitles: true, size: [1280, 720], bpm: 130, beatOffset: 0 },
  'x-dsh-mv-ai': { sections: sectionData.map((s, i) => ({ kind: kinds[i], label: labels[i], start: s.start, end: s.end })) },
  'x-dsh-mv-workshop': { id: 'world-execute-me-three', version: '1.0.2', license: authorMitPermission ? 'MIT' : upstreamPackage.license || 'UNSPECIFIED', author: 'Alice-Marx',
    description: 'Original 12-section Three.js MV with camera blending, bloom and opt-in bilingual subtitles. Requires dsh-mv-cli 0.9.3+. Bring your own audio and local lyrics.js/LRC file.',
    tags: ['world.execute(me)', 'Mili', 'three.js', 'webgl', '3d'], source: repo, homepage: 'https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-three', requires: '0.9.3', audio: { duration } },
};
writeFileSync(join(out, 'mv.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const upstreamLicensePath = ['LICENSE', 'LICENSE.txt', 'LICENSE.md'].map(f => join(checkout, f)).find(existsSync);
const licenseStatus = upstreamLicensePath
  ? `The original license text is copied below from ${relative(checkout, upstreamLicensePath)}.\n\n${readFileSync(upstreamLicensePath, 'utf8')}`
  : `Upstream package.json declares "license": ${JSON.stringify(upstreamPackage.license || 'UNSPECIFIED')}.\nNo LICENSE file exists at the source revision used for this build.\nThe README's original permission statement is:\n\n代码部分可自由使用（建议在发布时补一个你选择的 LICENSE）。\n\nThis records the upstream statements; it does not substitute a newly invented MIT/ISC grant.\n`;
const mitLicense = holder => `MIT License\n\nCopyright (c) ${holder}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n`;
const threeLicense = offline ? `MIT License\n\nCopyright 2010-2023 Three.js Authors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n\nSPDX MIT and copyright verified from the original app.js bundled license header.\n` : readFileSync(join(threeRoot, 'LICENSE'), 'utf8');
const publicLicense = authorMitPermission
  ? `ORIGINAL VISUAL CODE\n${repo}\nDirect author MIT permission was confirmed by the workshop maintainer on 2026-10-05.\nThis grant is recorded from direct author contact, not a LICENSE file in the source revision.\n\n${mitLicense('wiers-jack')}\nWORKER ADAPTER\n${mitLicense('Alice-Marx')}`
  : `UPSTREAM LICENSE STATUS\n${repo}\n${licenseStatus}`;
writeFileSync(join(out, 'LICENSE.txt'), `${publicLicense}\n\nTHREE.JS LICENSE (verbatim)\n${threeLicense}\n`);
const grantNotice = authorMitPermission
  ? 'Authorization: on 2026-10-05 the workshop maintainer confirmed direct contact with wiers-jack and permission to publish this adaptation under MIT. The MIT grant is reproduced in LICENSE.txt with copyright credited to wiers-jack; the worker adapter is MIT, copyright Alice-Marx. This records the maintainer-reported direct author authorization, not a LICENSE file added to the upstream revision. The source checkout is unchanged; source-provenance.json preserves its historical package declaration and records this separate author grant.'
  : `The upstream package declares ${upstreamPackage.license || 'no license'}; its README says “代码部分可自由使用（建议在发布时补一个你选择的 LICENSE）。” ${upstreamLicensePath ? 'The shipped upstream license is reproduced.' : 'There is no upstream LICENSE text. This adaptation does not claim the upstream is MIT. Resolve the missing explicit license text with the original author before publishing if workshop policy requires a complete grant.'}`;
writeFileSync(join(out, 'NOTICE.md'), `# Attribution and authorization\n\nOriginal: ${repo}${commit ? ` (revision ${commit})` : ''}.\n\nThis bundle includes the original 12 scene implementations, palette, procedural texture helpers, section manager, camera paths and post-processing chain (RenderPass, UnrealBloomPass, final shader and OutputPass). It embeds Three.js ${threePackage.version}; its MIT license is reproduced separately in LICENSE.txt.\n\n${grantNotice}\n\nChanges: DOM bootstrap, keyboard controls, file picker, AudioEngine and LyricOverlay removed; generated texture canvases replaced by OffscreenCanvas; lyric-dependent visual cues resolved to numeric times; embedded lyric prose replaced by code-state labels; six sung countdown names replaced by numerals; film-grain clock anchored to audio t; discontinuous seeks reset camera state and trance audio smoothing; current camera is applied before billboard geometry updates. The panel supplies time, spectrum and optional user lyrics. No audio, lyric file, artwork or external network asset is bundled. The cover is a screenshot of this rendered scene.\n\nMusic/lyrics: © Mili and their rights holders, not included.\n`);
writeFileSync(join(out, 'README.md'), `# world.execute(me); · Original Three.js MV\n\nThis pack preserves wiers-jack's actual Three.js rendering: all 12 original scenes and their 213-second timeline, camera paths, 1.2-second crossfades, fog/palettes, UnrealBloomPass and final shader effects. Install with dsh-mv-cli 0.9.3+ and select your own audio and lyrics. The scene runs offline in the WebGL worker.\n\nVersion 1.0.2 enables canvas.subtitles: the panel renders your local bilingual lyrics over the 3D image. Select the original src/lyrics.js directly (or your own LRC/JSON). Only the static LYRICS array is read; imports and overlay code never run. Nothing from your lyric file is uploaded. Update the plugin and this workshop pack, then select the file via Lyrics -> Choose.\n\nThe default 1280×720 render target keeps the full post-processing practical. Only DOM/audio/subtitle glue and embedded lyric text have been adapted; the visuals are upstream geometry rather than replacement cubes. See NOTICE.md for exact changes and attribution.\n\n${authorMitPermission ? 'License: original visual code MIT by direct author permission confirmed by the workshop maintainer on 2026-10-05; adapter and Three.js MIT. This permission does not license Mili music or lyrics, which are not bundled.\n\n' : ''}Build from a checkout of ${repo}:\n\n\`\`\`sh\nnpm ci --ignore-scripts # in the upstream checkout (esbuild and Three.js)\nnode presets/ports/wiers-jack-three/build.mjs <checkout> <output-directory>${authorMitPermission ? ' --author-mit-permission' : ''}\n\`\`\`\n\nThe MIT flag records the separately confirmed author grant; it must not be used to assume permission for unrelated upstream revisions or assets. The output is one readable, non-minified scenes.js; source-provenance.json records source hashes, changed modules and the authorization basis. This package contains no lyric text or audio file.\n`);
writeFileSync(join(out, 'source-provenance.json'), `${JSON.stringify({ repo, commit, upstreamPackageLicense: upstreamPackage.license, authorGrant, adapterLicense: authorMitPermission ? 'MIT' : null, threeVersion: threePackage.version, dependencySource: offline ? 'original app.js dependency blocks (offline)' : 'installed upstream dependencies', appSha256, duration, crossfade: 1.2, sceneCount: sectionData.length, sections: sectionData, bundleBytes: Buffer.byteLength(source), bundleSha256: createHash('sha256').update(source).digest('hex'), modules: Object.fromEntries(transformed) }, null, 2)}\n`);
if (cover) copyFileSync(resolve(cover), join(out, 'cover.png'));
console.log(`wrote ${out}: ${Buffer.byteLength(source)} bytes; ${sectionData.length} ORIGINAL Three.js scenes + bloom; ${authorMitPermission ? 'MIT (maintainer-confirmed direct author permission)' : `upstream license declaration ${upstreamPackage.license || 'UNSPECIFIED'}`}`);
