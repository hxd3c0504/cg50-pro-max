
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/worker.js",import.meta.url),"utf8");

async function harness(busy){
 let now=0,seq=0,cycles=0,executed=0,stepCalls=0;
 const tasks=new Map(),messages=[];
 const enqueue=(fn,delay=0)=>{
  const id=++seq;
  tasks.set(id,{at:now+Math.max(0,delay),fn});
  return id;
 };
 const context={
  performance:{now:()=>now},
  Date,Map,Promise,Number,Math,Error,
  Uint8Array,ArrayBuffer,
  setTimeout:enqueue,
  clearTimeout:id=>tasks.delete(id),
  postMessage:m=>messages.push(m),
  importScripts:()=>{},
  fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}),
  WebAssembly:{instantiate:async()=>({instance:{}})},
  cg50Boot:()=>({width:1,height:1}),
  cg50SetSpeed:()=>true,
  cg50SetInputSpeed:()=>true,
  cg50Stats:()=>({cycles,executed,generation:2}),
  cg50Frame:()=>new Uint8Array([0,0,0,255]),
  cg50Step:n=>{
   assert.ok(Number.isInteger(n)&&n>0&&n<=200000);
   cycles+=n;
   executed+=busy?n:0;
   stepCalls++;
   // Busy core executes 30 million instructions per wall second.
   now+=busy?n/30000:0.02;
   return "";
  },
  cg50ReleaseKeys:()=>{},
  cg50NamedHold:()=>true,
  cg50Tap:()=>true,
  cg50Save:()=>new Uint8Array([1]),
  cg50Restore:()=>{cycles=0;executed=0;return true;}
 };
 context.self=context;
 context.Go=class{
  importObject={};
  run(){
   context.cg50CoreReady=true;
   return new Promise(()=>{});
  }
 };
 context.MessageChannel=class{
  constructor(){
   this.port1={onmessage:null};
   this.port2={postMessage:data=>
    enqueue(()=>this.port1.onmessage?.({data}),0)};
  }
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 let requestId=0;
 async function rpc(action,extra={}){
  const id=++requestId;
  await context.onmessage({data:{id,action,...extra}});
  const response=messages.find(m=>m.id===id);
  assert.ok(response,"RPC did not reply: "+action);
  assert.equal(response.error,undefined);
  return response.result;
 }
 function runFor(ms){
  const end=now+ms;
  let guard=0;
  while(true){
   let selected=null;
   for(const [id,task]of tasks)
    if(!selected||task.at<selected[1].at)selected=[id,task];
   if(!selected||selected[1].at>end)break;
   if(++guard>200000)throw Error("Scheduler did not yield");
   const [id,task]=selected;
   tasks.delete(id);now=Math.max(now,task.at);task.fn();
  }
  now=Math.max(now,end);
 }
 await rpc("boot",{
  flash:new ArrayBuffer(0),state:new ArrayBuffer(0),
  epoch:0,visible:true
 });
 return {
  rpc,runFor,
  advanceWithoutCallbacks:ms=>{now+=ms;},
  snapshot:()=>({now,cycles,stepCalls}),
  diagnostics:()=>rpc("diagnostics")
 };
}

for(const busy of [false,true]){
 const h=await harness(busy);
 const before=h.snapshot();
 h.runFor(10000);
 const after=h.snapshot();
 const ratio=(after.cycles-before.cycles)/
  ((after.now-before.now)*15000);
 assert.ok(
  busy?(ratio>1.7&&ratio<2.05):(ratio>.95&&ratio<1.02),
  `Unexpected time ratio ${ratio}`
 );
 console.log(`PASS ${busy?"忙计算":"闲置"}：模拟/实际时间=${ratio.toFixed(4)}`);

 await h.rpc("visibility",{visible:false,epoch:1});
 const paused=h.snapshot();
 h.runFor(600000);
 assert.equal(h.snapshot().cycles,paused.cycles);
 await h.rpc("visibility",{visible:true,epoch:2});
 const resumed=h.snapshot();
 h.runFor(100);
 assert.ok(h.snapshot().cycles-resumed.cycles<=(busy?3200000:1600000),
  "Background time was replayed");
 console.log("PASS 后台不推进；恢复不补跑十分钟后台时间");

 for(let epoch=3;epoch<15;epoch++)
  await h.rpc("visibility",{visible:true,epoch});
 const repeat=h.snapshot();
 h.runFor(1000);
 assert.ok(h.snapshot().cycles-repeat.cycles<=(busy?30200000:15200000),
  "Repeated resume accelerated simulation");
 console.log("PASS 重复恢复没有叠加运行速度");

 // Simulate browser throttling without a visibility event.
 h.advanceWithoutCallbacks(600000);
 const stalled=h.snapshot();
 h.runFor(100);
 assert.ok(h.snapshot().cycles-stalled.cycles<=(busy?4500000:2300000),
  "Long scheduling stall caused unlimited catch-up");
 console.log("PASS 长时间调度停顿后的追赶量受限");

 await h.rpc("load",{state:new ArrayBuffer(0)});
 const loaded=h.snapshot();
 h.runFor(1000);
 const delta=h.snapshot().cycles-loaded.cycles;
 assert.ok(
  busy?(delta>28000000&&delta<=30200000)
      :(delta>14000000&&delta<=15200000)
 );
 const d=await h.diagnostics();
 assert.equal(d.running,true);
 assert.equal(d.lastError,"");
 console.log("PASS 恢复存档后重新建立计时预算");
}
console.log("Worker 调度测试通过；此测试模拟核心，不替代真实 WASM 和设备验证。");
