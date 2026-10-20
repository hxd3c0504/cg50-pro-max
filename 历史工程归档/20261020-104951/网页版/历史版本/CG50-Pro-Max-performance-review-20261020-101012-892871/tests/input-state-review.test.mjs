
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/worker.js",import.meta.url),"utf8");

async function harness(busy){
 let now=0,seq=0,cycles=0,executed=0,stepCalls=0;
 const tasks=new Map(),messages=[],keyEvents=[];
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
  cg50ReleaseKeys:()=>{keyEvents.push(["release-all"]);},
  cg50NamedHold:(key,down)=>{
   if(key==="UNKNOWN")return false;
   keyEvents.push([key,down]);return true;
  },
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
  rpc,runFor,keyEvents,
  advanceWithoutCallbacks:ms=>{now+=ms;},
  snapshot:()=>({now,cycles,stepCalls}),
  diagnostics:()=>rpc("diagnostics")
 };
}


{
 const h=await harness(false);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0});
 await h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0});
 assert.deepEqual(h.keyEvents,[["LEFT",true]]);
 console.log("PASS 同一触控编号重复按下只续期，不重复按键");

 await h.rpc("hold",{token:"p1",key:"RIGHT",down:true,epoch:0});
 assert.deepEqual(h.keyEvents,[
  ["LEFT",true],["RIGHT",true],["LEFT",false]
 ]);
 console.log("PASS 同一触控编号换键时释放旧键");

 await h.rpc("hold",{token:"p1",key:"LEFT",down:false,epoch:0});
 assert.equal(h.keyEvents.length,3);
 assert.equal((await h.diagnostics()).heldKeys,1);
 await h.rpc("hold",{token:"p1",key:"RIGHT",down:false,epoch:0});
 assert.deepEqual(h.keyEvents.at(-1),["RIGHT",false]);
 assert.equal((await h.diagnostics()).heldKeys,0);
 console.log("PASS 旧键的迟到松开事件不会释放当前新键");
}
{
 const h=await harness(false);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0});
 await h.rpc("hold",{token:"p2",key:"LEFT",down:true,epoch:0});
 assert.deepEqual(h.keyEvents,[["LEFT",true]]);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:false,epoch:0});
 assert.equal(h.keyEvents.length,1);
 await h.rpc("hold",{token:"p2",key:"LEFT",down:false,epoch:0});
 assert.deepEqual(h.keyEvents,[["LEFT",true],["LEFT",false]]);
 console.log("PASS 两个触点按同一键，最后一个松开才释放核心按键");
}
{
 const h=await harness(false);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0});
 await assert.rejects(
  h.rpc("hold",{token:"p1",key:"UNKNOWN",down:true,epoch:0})
 );
 assert.equal((await h.diagnostics()).heldKeys,1);
 assert.deepEqual(h.keyEvents,[["LEFT",true]]);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:false,epoch:0});
 assert.deepEqual(h.keyEvents.at(-1),["LEFT",false]);
 console.log("PASS 无效新按键不覆盖旧按键记录，旧键仍可正常释放");
}
{
 const h=await harness(false);
 await h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0});
 await h.rpc("visibility",{visible:false,epoch:1});
 assert.equal((await h.diagnostics()).heldKeys,0);
 assert.deepEqual(h.keyEvents.at(-1),["release-all"]);
 await h.rpc("visibility",{visible:true,epoch:2});
 await assert.rejects(
  h.rpc("hold",{token:"p1",key:"LEFT",down:true,epoch:0})
 );
 assert.equal((await h.diagnostics()).heldKeys,0);
 console.log("PASS 切后台释放按键；恢复后拒绝旧页面周期的输入");
}
console.log("实际 Worker 脚本的按键状态检查通过；核心按键接口使用测试替身。");
