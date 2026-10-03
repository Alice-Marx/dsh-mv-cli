// Builds the redesign mockups into /tmp/mv-redesign (not shipped):
//   node tools/ui-preview/redesign/build.mjs && node tools/ui-preview/make-covers.mjs (covers) — see README.md
import * as esbuild from 'esbuild'
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
const ROOT = resolve(import.meta.dirname, '../../..'), OUT = process.argv[2] || '/tmp/mv-redesign'
mkdirSync(OUT, { recursive: true })
await esbuild.build({
  absWorkingDir: ROOT, entryPoints: [join(import.meta.dirname, 'main.jsx')], bundle: true, format: 'iife', platform: 'browser', target: 'es2022',
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' }, outfile: join(OUT, 'mock.js'),
})
if (existsSync('/tmp/mv-ui-preview/covers')) cpSync('/tmp/mv-ui-preview/covers', join(OUT, 'covers'), { recursive: true })
writeFileSync(join(OUT, 'index.html'), '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>dsh-mv redesign</title><link rel="icon" href="data:,"></head><body><div id="root"></div><script src="mock.js"></script></body></html>')
console.log('mockups at', OUT)
