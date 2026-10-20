
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
let now=0,stepCalls=0,releases=0,keyCalls=0,bright=false,coreFault="";
const posted=[],queue=[],timers=new Map();
let timerID=0;
const stats={cycles:0,executed:0,generation:7};
const context={
 console,Uint8Array,Date,
 performance:{now:()=>now},
 importScripts(){},
 fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}),
 WebAssembly:{instantiate:async()=>({instance:{}})},
 Go:class{constructor(){this.importObject={};}run(){return new Promise(()=>{});}},
 cg50CoreReady:true,
 setTimeout(fn){const id=++timerID;timers.set(id,fn);return id;},
 clearTimeout(id){timers.delete(id);},
 MessageChannel:class{
  constructor(){
   this.port1={};
   this.port2={postMessage:data=>queue.push(()=>this.port1.onmessage({data}))};
  }
 },
 postMessage:m=>posted.push(m),
 cg50Boot:()=>({width:1,height:1}),
 cg50SetSpeed(){},cg50SetInputSpeed(){},
 cg50ReleaseKeys(){releases++;},
 cg50Stats:()=>({...stats}),
 cg50Step(n){
  stepCalls++;now+=2;stats.cycles+=n;stats.executed+=n;
  return coreFault;
 },
 cg50Frame:()=>new Uint8Array([bright?255:0,0,0,255]),
 cg50Tap(){keyCalls++;bright=true;return true;},
 cg50NamedHold(){keyCalls++;return true;},
 cg50Save:()=>new Uint8Array([1,2,3]),
 cg50Restore(){return true;}
};
context.self=context;
vm.createContext(context);
vm.runInContext(readFileSync(new URL("../web/worker.js",import.meta.url),"utf8"),context);
let id=0;
async function rpc(action,extra={}){
 const current=++id;
 await context.onmessage({data:{id:current,action,...extra}});
 return posted.findLast(m=>m.id===current);
}
await rpc("boot",{flash:[],state:[],visible:true,epoch:0});
queue.shift()();
assert.ok(stepCalls>0);
await rpc("hold",{key:"AC",token:"finger",down:true,epoch:0});
await rpc("visibility",{visible:false,epoch:1});
const stopped=stepCalls;
while(queue.length)queue.shift()();
for(const fn of [...timers.values()])fn();
assert.equal(stepCalls,stopped);
let d=(await rpc("diagnostics")).result;
assert.equal(d.paused,true);assert.equal(d.heldKeys,0);
assert.ok((await rpc("key",{key:"AC",epoch:0})).error);
await rpc("save");
assert.equal(stepCalls,stopped);
now+=20*60*1000;
const before=posted.filter(m=>m.type==="frame").length;
await rpc("visibility",{visible:true,epoch:2});
await rpc("visibility",{visible:true,epoch:3});
assert.ok(posted.filter(m=>m.type==="frame").length>before);
const tasks=queue.length;
for(let i=0;i<tasks;i++)queue.shift()();
assert.equal(stepCalls-stopped,4);
assert.ok((await rpc("key",{key:"AC",epoch:2})).error);
await rpc("key",{key:"AC",epoch:3});
now+=34;queue.shift()();
assert.equal(posted.findLast(m=>m.type==="frame").pixels[0],255);
assert.equal(stats.generation,7);
d=(await rpc("diagnostics")).result;
assert.equal(d.running,true);assert.equal(d.paused,false);
assert.equal(d.litPixels,1);
coreFault="TEST_CORE_FAULT";
queue.shift()();
d=(await rpc("diagnostics")).result;
assert.equal(d.running,false);
await rpc("visibility",{visible:true,epoch:4});
assert.ok((await rpc("key",{key:"AC",epoch:4})).error);
assert.match((await rpc("diagnostics")).result.lastError,/TEST_CORE_FAULT/);
console.log("PASS 后台不执行、保留存档、释放按键、长时间切屏恢复、重复恢复不叠加循环。");
console.log("PASS 旧按键拒绝、画面计数不变仍刷新、核心故障保留并可诊断。");

let next=0;
const frames=new Map(),events={},cancelled=[];
const dc={
 console,document:{
  readyState:"loading",hidden:false,
  addEventListener:(k,fn)=>events[k]=fn,
  getElementById:()=>null
 },
 requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},
 cancelAnimationFrame:id=>{cancelled.push(id);frames.delete(id);},
 addEventListener:(k,fn)=>events[k]=fn
};
dc.window=dc;
vm.createContext(dc);
vm.runInContext(readFileSync(new URL("../web/cg50-display.js",import.meta.url),"utf8"),dc);
dc.CG50PaintFrame({width:396,height:224});
assert.equal(frames.size,1);
events.visibilitychange();
assert.equal(cancelled.length,1);
assert.equal(frames.size,1);
[...frames.values()][0]();
assert.equal(dc.CG50DisplayDiagnostic().queued,false);
console.log("PASS 切屏回来重新安排绘制，清除旧的等待刷新标记。");
