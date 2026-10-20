
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/ipad-adapter.js",import.meta.url),"utf8");
const start=source.indexOf("let progressOperations=Promise.resolve();");
const end=source.indexOf("function waitReady(",start);
assert.ok(start>=0&&end>start);
const autoStart=source.indexOf("async function automaticSave()");
const autoEnd=source.indexOf("function releasePageKeys()",autoStart);
assert.ok(autoStart>=0&&autoEnd>autoStart);

function harness(){
 const log=[];
 let persisted=new Uint8Array([1]),failWrite=false;
 let releaseWrite=null,holdWrite=false;
 const ctx={
  window:{},
  Promise,Error,
  active:true,fault:"",factoryResetting:false,saveBusy:false,
  notify:message=>log.push("notice"),
  rpc:async(action,data)=>{
   log.push("rpc:"+action);
   if(action==="save")return new Uint8Array([2]);
   if(action==="load"){
    assert.equal(data.state[0],persisted[0]);
    return true;
   }
   throw Error("Unexpected action: "+action);
  },
  read:async()=>{
   log.push("read");return persisted;
  },
  write:async({state})=>{
   log.push("write:start");
   if(holdWrite)await new Promise(resolve=>releaseWrite=resolve);
   if(failWrite)throw Error("Storage unavailable");
   persisted=state;log.push("write:done");
  }
 };
 vm.createContext(ctx);
 vm.runInContext(
  source.slice(start,end)+"\n"+source.slice(autoStart,autoEnd),ctx
 );
 return {
  ctx,log,
  failWrites:value=>failWrite=value,
  holdWrites:()=>holdWrite=true,
  releaseWrite:()=>{holdWrite=false;releaseWrite?.();}
 };
}

{
 const h=harness();
 h.holdWrites();
 const saving=h.ctx.snapshot();
 // Wait until the actual database-write stub has started.
 for(let i=0;i<20&&!h.log.includes("write:start");i++)
  await Promise.resolve();
 assert.ok(h.log.includes("write:start"));
 const loading=h.ctx.restoreSavedProgress();
 await Promise.resolve();await Promise.resolve();
 assert.ok(!h.log.includes("read"),
  "Restore read the database before the preceding save committed");
 h.releaseWrite();
 await Promise.all([saving,loading]);
 assert.deepEqual(h.log,[
  "rpc:save","write:start","write:done","read","rpc:load"
 ]);
 console.log("PASS 保存提交完成之后，恢复操作才读取存档");
}
{
 const h=harness();
 h.failWrites(true);
 await assert.rejects(h.ctx.snapshot(),/Storage unavailable/);
 h.failWrites(false);
 await h.ctx.snapshot();
 assert.equal(h.log.filter(x=>x==="write:done").length,1);
 console.log("PASS 保存失败不会堵塞后续操作");
}
{
 const h=harness();
 await h.ctx.automaticSave();
 assert.ok(!h.log.includes("rpc:release"));
 assert.equal(h.ctx.saveBusy,false);
 assert.ok(h.log.includes("write:done"));
 console.log("PASS 自动保存不主动释放按键");
}
{
 const h=harness();
 h.failWrites(true);
 const state=await h.ctx.exportProgressBytes();
 assert.equal(state[0],2);
 assert.deepEqual(h.log,["rpc:save"]);
 console.log("PASS 导出当前快照不依赖数据库写入");
}
{
 const h=harness();
 h.ctx.fault="Core stopped";
 const state=await h.ctx.exportProgressBytes();
 assert.equal(state[0],1);
 assert.deepEqual(h.log,["read"]);
 console.log("PASS 核心故障时仍可导出已有本地存档");
}
{
 const h=harness();
 h.ctx.factoryResetting=true;
 await assert.rejects(h.ctx.snapshot(),/正在恢复初始状态/);
 await assert.rejects(h.ctx.restoreSavedProgress(),/正在恢复初始状态/);
 await assert.rejects(h.ctx.exportProgressBytes(),/正在恢复初始状态/);
 assert.deepEqual(h.log,[]);
 console.log("PASS 重置期间拒绝新的保存、恢复与导出操作");
}
console.log("存档操作单元检查通过；尚未验证浏览器 IndexedDB 和多窗口行为。");
