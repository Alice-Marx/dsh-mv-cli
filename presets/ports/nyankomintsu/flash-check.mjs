// SPDX-License-Identifier: MIT
// Copyright 2026 Alice-Marx. Thresholds/algorithm adapted from Nyankomint's
// MIT tools/check_flash.py at commit 2073b0c88c6fc837482478402a44f101b3b57d6f.
// This is a source/adaptation regression measurement, not PSE certification.
export function flashCheck(frames, fps, start = 0) {
  const pixels=64*36,win=Math.round(fps),k=(pixels-1)*.75,lo=Math.floor(k),hi=Math.ceil(k)
  const streams=['general','red'].map(name=>({name,ext:new Float64Array(pixels),direction:new Int8Array(pixels),sum:new Uint16Array(pixels),ring:[],large:0,worst:-1,at:0}))
  const deltas=[],pops=[],cuts=[]
  const distance=(a,b)=>{let sum=0;for(let j=0;j<a.length;j++)sum+=Math.abs(a[j]-b[j]);return sum/a.length/255}
  for(let i=0;i<frames.length;i++){
    const bytes=frames[i],values=streams.map(()=>new Float64Array(pixels))
    if(bytes.length!==pixels*3)throw new Error('Flash regression requires 64x36 RGB frames')
    for(let p=0;p<pixels;p++){
      const r=bytes[p*3]/255,g=bytes[p*3+1]/255,b=bytes[p*3+2]/255
      const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4
      values[0][p]=.2126*linear(r)+.7152*linear(g)+.0722*linear(b)
      values[1][p]=r/(r+g+b+1e-6)>=.8?Math.max(0,(r-g-b)*320/255):0
    }
    streams.forEach((s,j)=>{
      const marks=new Uint8Array(pixels);let large=0
      for(let p=0;p<pixels;p++){
        const v=values[j][p],threshold=j?20/255:.1
        if(i===0){s.ext[p]=v;continue}
        const rise=v-s.ext[p]>=threshold&&s.direction[p]<=0&&(j||s.ext[p]<.8)
        const fall=s.ext[p]-v>=threshold&&s.direction[p]>=0&&(j||v<.8)
        if(rise||fall){marks[p]=1;large++;s.direction[p]=rise?1:-1;s.ext[p]=v}
        s.ext[p]=s.direction[p]>0?Math.max(s.ext[p],v):s.direction[p]<0?Math.min(s.ext[p],v):s.ext[p]
      }
      if(large>=pixels*.25)s.large++
      s.ring.push(marks);for(let p=0;p<pixels;p++)s.sum[p]+=marks[p]
      if(s.ring.length>win){const old=s.ring.shift();for(let p=0;p<pixels;p++)s.sum[p]-=old[p]}
      if(i>=win){
        const histogram=new Uint16Array(win+1);for(const count of s.sum)histogram[count]++
        let seen=0,low=0,high=0;for(let n=0;n<histogram.length;n++){const next=seen+histogram[n];if(seen<=lo&&lo<next)low=n;if(seen<=hi&&hi<next)high=n;seen=next}
        const worst=(low+(high-low)*(k-lo))/2;if(worst>s.worst){s.worst=worst;s.at=i-win}
      }
    })
    if(i){const delta=distance(bytes,frames[i-1]);deltas.push(delta);if(delta>.12)cuts.push(i-1)}
    if(i>=2){const a=deltas[i-2],b=deltas[i-1],two=distance(bytes,frames[i-2]);if(a>.05&&b>.05&&two<.35*Math.min(a,b))pops.push(Number((start+(i-1)/fps).toFixed(6)))}
  }
  let busiest=0,busyAt=0;for(let i=0,j=0;i<cuts.length;i++){while(j<cuts.length&&cuts[j]<cuts[i]+fps)j++;if(j-i>busiest){busiest=j-i;busyAt=cuts[i]}}
  return {general:{largeTransitions:streams[0].large,maxFlashesPerSecond:streams[0].worst,windowStart:Number((start+streams[0].at/fps).toFixed(6))},
    red:{largeTransitions:streams[1].large,maxFlashesPerSecond:streams[1].worst,windowStart:Number((start+streams[1].at/fps).toFixed(6))},
    hardChanges:{count:cuts.length,busiestSecond:busiest,windowStart:Number((start+busyAt/fps).toFixed(6))},singleFramePops:pops}
}
