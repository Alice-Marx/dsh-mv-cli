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
html,body{margin:0;height:100%} body{background:var(--dsw-alias-bg-base,#fff)} #root{min-height:100%} .pv-host{position:fixed;inset:0;display:grid;grid-template-columns:200px minmax(0,1fr);grid-template-rows:28px minmax(0,1fr)} .pv-host-top{grid-column:1/-1;background:#1b2440;color:#fff;font:600 12px/28px sans-serif;padding-left:12px} .pv-host-side{background:#172036;color:#cbd5e1;font:12px/20px sans-serif;padding:12px} .pv-host-center{display:flex;flex-direction:column;min-width:0;overflow:hidden;background:var(--dsw-alias-bg-base,#fff)} .pv-host-art .pv-host-center{background:radial-gradient(circle at 75% 30%,#c7d2fe,transparent 45%),radial-gradient(circle at 20% 80%,#a5b4fc,transparent 40%),#e0e7ff;--dsw-alias-bg-base:transparent;--dsw-specific-sidebar-fill:transparent;--dsw-alias-bg-layer-1:rgba(255,255,255,.55)}</style></head><body><div id="root"></div><script src="preview.js"></script></body></html>`)
console.log('preview at', OUT)
