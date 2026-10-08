#!/usr/bin/env node
// Anonymous strict-TLS verification of an operator's pinned snapshot, no proxy.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { getBytes } from '../../.dsh-plugin/shared/mv-workshop-host.mjs'
import { safePath } from './prepare.mjs'

const [snapshot,baseArg,out] = process.argv.slice(2)
if(!snapshot||!baseArg||!out)throw new Error('Usage: verify.mjs SNAPSHOT_DIR HTTPS_BASE NEW_REPORT')
const base=new URL(baseArg)
if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error('Anonymous HTTPS base required')
const manifest=JSON.parse(await readFile(snapshot+'/snapshot-manifest.json','utf8'))
const report={base:base.href,proxy:false,strictTls:true,indexCommit:manifest.indexCommit,files:[],failures:[]}
try{
  for(const [i,entry] of [manifest.index,...manifest.files].entries()){
    const path=safePath(entry.path),url=base.href.replace(/\/$/,'')+'/'+path
    const bytes=await getBytes(url,{proxy:null,timeoutMs:120000,maxBytes:Math.max(1,entry.size)})
    const sha256=createHash('sha256').update(bytes).digest('hex')
    if(bytes.length!==entry.size||sha256!==entry.sha256)throw new Error('Size/hash mismatch: '+path)
    report.files.push({path,size:bytes.length,sha256})
    if(i%20===0)console.log(JSON.stringify({verified:report.files.length,total:manifest.files.length+1}))
  }
  report.status='passed';report.totalBytes=report.files.reduce((n,f)=>n+f.size,0)
  console.log(JSON.stringify({status:report.status,resources:report.files.length,totalBytes:report.totalBytes,proxy:false}))
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;console.error(error.message)}
finally{await writeFile(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'})}
