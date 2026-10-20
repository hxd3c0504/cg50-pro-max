
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/ipad-adapter.js",import.meta.url),"utf8");
function section(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"Missing source section: "+start);
 return source.slice(a,b);
}
const helpers=section("window.CG50PauseForUpdate=","function waitReady(");
const lifecycle=section("function syncLifecycle(","document.addEventListener(\"visibilitychange\"");
const rpcSource=section("function rpc(","function notify(");

function harness(){
 const calls=[];
 const ctx={
  window:{},document:{hidden:false},
  active:true,fault:"",factoryResetting:false,
  inputEpoch:0,lastVisibility:true,
  progressOperations:Promise.resolve(),
  releasePageKeys:()=>{},
  notify:()=>{},
  markCoreFault:()=>{},
  rpc:async(action,data)=>{
   calls.push({action,...data});
   return {running:true,paused:!data.visible};
  },
  Promise,Error
 };
 ctx.syncLifecycle=async()=>{
  calls.push({resume:true});
  return {running:true,paused:ctx.document.hidden};
 };
 vm.createContext(ctx);
 vm.runInContext(helpers,ctx);
 return {ctx,calls};
}
{
 const h=harness();
 let finishStorage;
 h.ctx.progressOperations=new Promise(resolve=>finishStorage=resolve);
 const pause=h.ctx.window.CG50PauseForUpdate();
 assert.equal(h.ctx.window.CG50UpdateSuspended,true);
 assert.equal(h.calls.length,0);
 finishStorage();
 await pause;
 assert.equal(h.calls[0].action,"visibility");
 assert.equal(h.calls[0].visible,false);
 assert.equal(h.ctx.lastVisibility,false);
 console.log("PASS 更新暂停先等待已有存档操作，随后确认核心暂停");
}
{
 const h=harness();
 vm.runInContext(lifecycle,h.ctx);
 await h.ctx.window.CG50PauseForUpdate();
 await h.ctx.syncLifecycle(true,true);
 assert.equal(h.calls.at(-1).visible,false);
 console.log("PASS 更新期间的聚焦和前台恢复事件不会唤醒核心");

 await h.ctx.window.CG50ResumeAfterUpdate();
 assert.equal(h.ctx.window.CG50UpdateSuspended,false);
 assert.equal(h.calls.at(-1).visible,true);
 console.log("PASS 更新失败退出后，前台页面恢复核心运行");
}
{
 const h=harness();
 vm.runInContext(lifecycle,h.ctx);
 await h.ctx.window.CG50PauseForUpdate();
 h.ctx.document.hidden=true;
 await h.ctx.window.CG50ResumeAfterUpdate();
 assert.equal(h.calls.at(-1).visible,false);
 assert.equal(h.ctx.window.CG50UpdateSuspended,false);
 console.log("PASS 更新退出时页面已在后台，核心继续暂停");
}
{
 const h=harness();
 h.ctx.rpc=async()=>{throw Error("Pause request failed");};
 await assert.rejects(h.ctx.window.CG50PauseForUpdate(),/Pause request failed/);
 assert.equal(h.ctx.window.CG50UpdateSuspended,true);
 await h.ctx.window.CG50ResumeAfterUpdate();
 assert.equal(h.ctx.window.CG50UpdateSuspended,false);
 assert.ok(h.calls.some(c=>c.resume));
 console.log("PASS 暂停请求失败后仍能执行恢复清理");
}
{
 const h=harness();
 Object.assign(h.ctx,{
  seq:0,pending:new Map(),localStorage:{getItem:()=>null},
  setTimeout,clearTimeout,
  worker:{postMessage:()=>{throw Error("Input should not be sent");}}
 });
 vm.runInContext(rpcSource,h.ctx);
 h.ctx.window.CG50UpdateSuspended=true;
 for(const action of ["key","hold","load"])
  await assert.rejects(h.ctx.rpc(action),/正在保存并更新/);
 assert.equal(h.ctx.pending.size,0);
 console.log("PASS 更新暂停期间拒绝新按键及恢复存档请求");
}
{
 const h=harness();
 await h.ctx.window.CG50PauseForUpdate();
 h.ctx.syncLifecycle=async()=>undefined;
 await assert.rejects(h.ctx.window.CG50ResumeAfterUpdate(),/恢复运行未确认/);
 console.log("PASS 无法确认恢复时明确报错，不伪报成功");
}
