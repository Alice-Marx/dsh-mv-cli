import test from 'node:test'
import assert from 'node:assert/strict'
import { ScenePlayGate } from '../.dsh-plugin/client/mv/scene-play-gate.mjs'
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b }); return { promise, resolve, reject } }

test('transport waits for scene preparation, then starts exactly once', async () => {
  const gate = new ScenePlayGate(), load = deferred(); let starts=0
  const pending = gate.play(load.promise, () => true, () => { starts++ })
  assert.equal(gate.pending, true); assert.equal(starts,0)
  load.resolve(); assert.equal(await pending,true); assert.equal(starts,1); assert.equal(gate.pending,false)
})
test('pause / switch / newer play makes a queued request inert', async () => {
  for (const action of ['cancel','owner','newer']) {
    const gate = new ScenePlayGate(), load = deferred(); let starts=0, current=true
    const old = gate.play(load.promise, () => current, () => { starts++ })
    if(action==='cancel')gate.cancel()
    if(action==='owner')current=false
    if(action==='newer')await gate.play(Promise.resolve(), () => true, () => { starts++ })
    load.resolve(); assert.equal(await old,false); assert.equal(starts,action==='newer'?1:0); assert.equal(gate.pending,false)
  }
})
test('failed resource load does not start music or leave queued transport', async () => {
  const gate=new ScenePlayGate();let starts=0
  await assert.rejects(gate.play(Promise.reject(new Error('load failed')),()=>true,()=>{starts++}),/load failed/)
  assert.equal(starts,0);assert.equal(gate.pending,false)
})
