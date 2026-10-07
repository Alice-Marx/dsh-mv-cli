#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Complete editable source assembly, copyright 2026 Alice-Marx.
import assert from 'node:assert/strict'
import { cpSync, copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { UPSTREAM_COMMIT } from './build.mjs'

const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '../../..')
const [upstreamArg, fontsArg, notesArg, outArg] = process.argv.slice(2)
assert.ok(upstreamArg && fontsArg && notesArg && outArg, 'usage: archive.mjs <upstream> <baked-fonts> <source-notes-directory> <new-source-dir>')
const upstream = resolve(upstreamArg), fonts = resolve(fontsArg), notes = resolve(notesArg), out = resolve(outArg)
assert.ok(!existsSync(out), 'Use a new source directory')
assert.equal(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),UPSTREAM_COMMIT)
mkdirSync(out,{recursive:true})
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const sourceFiles = execFileSync('git',['-C',upstream,'ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean)
assert.ok(sourceFiles.every(p=>!/(?:\.(?:mp3|wav|m4a|flac|ogg|opus|mp4|webm)|(?:^|\/)(?:song|master)(?:\.|\/))/i.test(p)), 'No recording or encrypted song part in source')
const inventory=[]
for(const path of sourceFiles) {
  const target=join(out,'upstream',path);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(upstream,path),target)
  const bytes=readFileSync(target);inventory.push({path,size:bytes.length,sha256:sha(bytes)})
}
writeFileSync(join(out,'upstream/UPSTREAM-FILES.json'),JSON.stringify({commit:UPSTREAM_COMMIT,files:inventory},null,2)+'\n')
writeFileSync(join(out,'UPSTREAM-COMMIT.txt'),UPSTREAM_COMMIT+'\n')
const port=join(out,'presets/ports/frostnova-web')
cpSync(here,port,{recursive:true,filter:path=>!/(?:^|[\\/])node_modules(?:[\\/]|$)/.test(path)})
for(const dir of ['shared','client'])cpSync(join(root,'.dsh-plugin',dir),join(out,'.dsh-plugin',dir),{recursive:true})
copyFileSync(join(root,'package.json'),join(out,'package.json'))
mkdirSync(join(out,'tests'));mkdirSync(join(out,'tools'));mkdirSync(join(out,'licenses'))
for(const name of ['frostnova-builder.test.mjs','frostnova-fonts.test.mjs','frostnova-cpu-prewarm.test.mjs','frostnova-offline-data.test.mjs','scene-prepare.test.mjs','scene-play-gate.test.mjs'])copyFileSync(join(root,'tests',name),join(out,'tests',name))
for(const name of ['frostnova-smoke.mjs','scene-prepare-ui-smoke.mjs','frostnova-pack-host-smoke.mjs','frostnova-host-vm-smoke.mjs'])copyFileSync(join(root,'tools',name),join(out,'tools',name))
cpSync(fonts,join(out,'baked-fonts'),{recursive:true})
copyFileSync(join(notes,'source-README.md'),join(out,'README.md'))
copyFileSync(join(notes,'source-license-checklist.md'),join(out,'SOURCE-LICENSE-CHECKLIST.md'))
copyFileSync(join(upstream,'LICENSE'),join(out,'LICENSE.txt'))
copyFileSync(join(root,'LICENSE'),join(out,'licenses/PLUGIN-MIT.txt'))
copyFileSync(join(upstream,'NOTICE.md'),join(out,'licenses/UPSTREAM-NOTICE.md'))
copyFileSync(join(upstream,'NOTICE.zh-CN.md'),join(out,'licenses/UPSTREAM-NOTICE.zh-CN.md'))
cpSync(join(notes,'source-dependency-licenses'),join(out,'licenses/runtime-supplement'),{recursive:true})
for(const name of ['fflate','acorn','esbuild','playwright','playwright-core','react','react-dom','scheduler','loose-envify','js-tokens']) {
  const folder=join(here,'node_modules',name)
  const license=['LICENSE','LICENSE.txt','LICENSE.md'].map(n=>join(folder,n)).find(existsSync)
  assert.ok(license,`Missing public tool license: ${name}`);copyFileSync(license,join(out,'licenses',name.toUpperCase()+'-LICENSE.txt'))
}
// fflate is linked into scenes.js: its exact preferred source is part of the
// offer, not merely a URL to a moving external branch.
const fflateVersion=JSON.parse(readFileSync(join(here,'node_modules/fflate/package.json'),'utf8')).version
cpSync(join(here,'node_modules/fflate/esm'),join(out,`third-party/fflate-${fflateVersion}/esm`),{recursive:true})
copyFileSync(join(here,'node_modules/fflate/LICENSE'),join(out,`third-party/fflate-${fflateVersion}/LICENSE`))
if(existsSync(join(notes,'release-evidence')))cpSync(join(notes,'release-evidence'),join(out,'release-evidence'),{recursive:true})
const hashes=[]
function walk(at,sub='') {
  for(const item of readdirSync(at,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const name=[sub,item.name].filter(Boolean).join('/'),path=join(at,item.name)
    if(item.isDirectory())walk(path,name)
    else {const bytes=readFileSync(path);hashes.push({path:name,size:bytes.length,sha256:sha(bytes)})}
  }
}
walk(out)
writeFileSync(join(out,'SHA256SUMS.json'),JSON.stringify({format:'frostnova-corresponding-source',version:'1.0.0',upstreamCommit:UPSTREAM_COMMIT,files:hashes},null,2)+'\n')
console.log(JSON.stringify({out,files:hashes.length+1,bytes:hashes.reduce((n,f)=>n+f.size,0),upstreamFiles:inventory.length}))
