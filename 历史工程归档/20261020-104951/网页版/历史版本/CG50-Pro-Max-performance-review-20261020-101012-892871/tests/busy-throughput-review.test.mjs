
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/worker.js",import.meta.url),"utf8");

async function harness(busy,script=source){
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
 vm.runInContext(script,context);
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


const referenceSource=readFileSync(process.argv[2],"utf8");
async function measure(script){
 const h=await harness(true,script);
 const a=h.snapshot();
 h.runFor(10000);
 const b=h.snapshot();
 return (b.cycles-a.cycles)/((b.now-a.now)/1000);
}
const oldRate=await measure(referenceSource);
const newRate=await measure(source);
const ratio=newRate/oldRate;
console.log(JSON.stringify({
 referenceInstructionsPerSecond:Math.round(oldRate),
 revisedInstructionsPerSecond:Math.round(newRate),
 revisedToReference:Number(ratio.toFixed(4))
},null,2));
assert.ok(ratio>=.98,
 "Busy execution is still artificially limited relative to the original scheduler");
console.log("PASS 模拟忙核心下，新调度保留原版执行吞吐量");
console.log("此测试不测量真实设备上的接口开销或画图耗时。");
