
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/ipad-adapter.js",import.meta.url),"utf8");
function between(start,end){
 const a=source.indexOf(start);
 const b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"Missing source section: "+start);
 return source.slice(a,b);
}
const readiness=between("let readyResolve,readyReject;","window.CG50ReportCoreFault=");
const rpcSource=between("function rpc(","function notify(");
const faultSource=between("function markCoreFault(","worker.onmessage=");
const waitSource=between("function waitReady(","const endpoints=");

function harness(){
 const reports=[],messages=[];
 let sendError=false;
 const ctx={
  window:{CG50ReportCoreFault:error=>reports.push(error)},
  document:{hidden:false},
  localStorage:{getItem:()=>null},
  worker:{postMessage:m=>{
   if(sendError)throw Error("Send failed");
   messages.push(m);
  }},
  pending:new Map(),seq:0,inputEpoch:0,
  active:false,fault:"",factoryResetting:false,
  notify:()=>{},
  setTimeout,clearTimeout,Promise,Error,DOMException,
  Number,Map
 };
 vm.createContext(ctx);
 vm.runInContext(readiness+"\n"+rpcSource+"\n"+faultSource+"\n"+waitSource,ctx);
 return {ctx,reports,messages,failSend:()=>sendError=true};
}

{
 const h=harness();
 const waiting=h.ctx.waitReady();
 const waitingCheck=assert.rejects(waiting,/Core stopped/);
 const firstFrameCheck=assert.rejects(
  h.ctx.window.CG50FirstFrameReady,/Core stopped/);
 const request=h.ctx.rpc("save");
 const requestCheck=assert.rejects(request,/Core stopped/);
 h.ctx.active=true;
 h.ctx.markCoreFault("Core stopped");
 await Promise.all([waitingCheck,firstFrameCheck,requestCheck]);
 assert.equal(h.ctx.active,false);
 assert.equal(h.ctx.pending.size,0);
 assert.equal(h.reports.length,1);
 h.ctx.markCoreFault("Later error");
 assert.equal(h.reports.length,1);
 console.log("PASS 故障立即结束启动、首帧和请求等待；重复故障不重复通知");
}
{
 const h=harness();
 h.ctx.markCoreFault("Core stopped");
 await assert.rejects(h.ctx.rpc("key",{key:"AC"}),/Core stopped/);
 assert.equal(h.messages.length,0);

 const diagnostic=h.ctx.rpc("diagnostics");
 assert.equal(h.messages.length,1);
 const sent=h.messages[0],pending=h.ctx.pending.get(sent.id);
 clearTimeout(pending.timer);
 h.ctx.pending.delete(sent.id);
 pending.resolve({running:false});
 assert.equal((await diagnostic).running,false);
 console.log("PASS 故障后阻止普通操作，仍允许诊断请求");
}
{
 const h=harness();
 h.failSend();
 await assert.rejects(h.ctx.rpc("save"),/Send failed/);
 assert.equal(h.ctx.pending.size,0);
 console.log("PASS 消息发送失败立即清理请求");
}
{
 const h=harness();
 const controller=new AbortController();
 const result=h.ctx.waitReady(controller.signal);
 const check=assert.rejects(result,error=>error.name==="AbortError");
 controller.abort();
 await check;
 h.ctx.markCoreFault("Startup later failed");
 await Promise.resolve();
 console.log("PASS 取消启动等待后，后续启动失败不会产生未处理拒绝");
}
{
 const h=harness();
 h.ctx.factoryResetting=true;
 await assert.rejects(h.ctx.waitReady(),/正在恢复初始状态/);
 await assert.rejects(h.ctx.rpc("save"),/正在恢复初始状态/);
 console.log("PASS 重置期间拒绝新的启动等待与核心请求");
}
