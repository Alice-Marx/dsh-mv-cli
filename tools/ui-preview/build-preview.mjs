// Bundles tools/ui-preview/preview.jsx with React into /tmp/mv-ui-preview/ (not shipped).
import * as esbuild from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
const ROOT = resolve(import.meta.dirname, '../..')
const OUT = process.argv[2] || '/tmp/mv-ui-preview'
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
mkdirSync(OUT, { recursive: true })
await esbuild.build({
  absWorkingDir: ROOT, entryPoints: [join(ROOT, 'tools/ui-preview/preview.jsx')], bundle: true, format: 'iife', platform: 'browser', target: 'es2020',
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', loader: { '.css': 'text' },
  define: { __DSH_MV_CLIENT_VERSION__: JSON.stringify(pkg.version), 'process.env.NODE_ENV': '"production"' }, outfile: join(OUT, 'preview.js'),
})
// Optional: Harness design tokens extracted locally (not committed) for a faithful theme.
const theme = process.env.HARNESS_THEME_CSS && existsSync(process.env.HARNESS_THEME_CSS) ? readFileSync(process.env.HARNESS_THEME_CSS, 'utf8') : ''
writeFileSync(join(OUT, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>${theme}
html,body{margin:0;height:100%} body{background:var(--dsw-alias-bg-base,#fff)} #root{min-height:100%}</style></head><body><div id="root"></div><script src="preview.js"></script></body></html>`)
console.log('preview at', OUT)
