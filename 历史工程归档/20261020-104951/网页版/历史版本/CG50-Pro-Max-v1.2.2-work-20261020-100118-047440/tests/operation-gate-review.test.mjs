
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const update=readFileSync(new URL("../web/cg50-update.js",import.meta.url),"utf8");
const reset=readFileSync(new URL("../web/cg50-factory-reset.js",import.meta.url),"utf8");
function section(source,a,b){
 const start=source.indexOf(a),end=source.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,"Missing section: "+a);
 return source.slice(start,end);
}
const gate=section(update,"const operations=","const release=");
const applySource=section(update,"async function apply(","async function check(");
const resetGate=section(reset,"const operations=","const BASE=");
const resetSource=section(reset,"async function reset()","window.CG50ManualReload=");

function context(){
 const log=[];
 const ctx={
  window:{},Object,Error,Promise,Date,
  busy:false,checking:false,approved:false,needsReload:true,
  ready:true,registration:null,
  registered:Promise.resolve(null),
  safe:()=>true,
  text:a=>a,
  notice:()=>log.push("notice"),
  handshake:async()=>({releaseId:"test"}),
  save:async()=>log.push("save"),
  remember:()=>log.push("remember"),
  location:{reload:()=>log.push("reload")},
  sessionStorage:{removeItem:()=>{}},
  console:{warn:()=>{}},
  confirm:()=>true,
  errorText:e=>e.message,
  document:{},
  navigator:{},
  setTimeout,clearTimeout
 };
 vm.createContext(ctx);
 vm.runInContext(gate+"\n"+applySource,ctx);
 return {ctx,log};
}

{
 const h=context(),g=h.ctx.window.CG50OperationGate;
 const a=g.acquire("update");
 assert.equal(g.owner,"update");
 assert.equal(g.acquire("reset"),null);
 a();
 const b=g.acquire("reset");
 a(); // Old owner's delayed cleanup must not unlock the new owner.
 assert.equal(g.owner,"reset");
 b();
 assert.equal(g.owner,null);
 console.log("PASS 操作互斥；旧操作不能释放新操作的锁");
}
{
 const h=context(),g=h.ctx.window.CG50OperationGate;
 const unlock=g.acquire("reset");
 await h.ctx.apply();
 assert.deepEqual(h.log,[]);
 assert.equal(g.owner,"reset");
 unlock();
 console.log("PASS 恢复初始化期间，自动更新不保存、不刷新");
}
{
 const h=context();
 let finishSave;
 h.ctx.save=()=>new Promise(resolve=>finishSave=resolve);
 const first=h.ctx.apply();
 for(let n=0;n<20&&!finishSave;n++)await Promise.resolve();
 assert.ok(finishSave);
 assert.equal(h.ctx.window.CG50OperationGate.acquire("reset"),null);
 await h.ctx.apply();
 finishSave();
 await first;
 assert.equal(h.log.filter(x=>x==="reload").length,1);
 assert.equal(h.ctx.window.CG50OperationGate.owner,"update");
 console.log("PASS 更新期间阻止重置和重复更新；刷新时保留锁");
}
{
 const h=context();
 h.ctx.save=async()=>{throw Error("Storage failure");};
 await h.ctx.apply();
 assert.equal(h.ctx.window.CG50OperationGate.owner,null);
 assert.equal(h.ctx.busy,false);
 assert.ok(!h.log.includes("reload"));
 console.log("PASS 更新保存失败后释放锁，保留页面供重试");
}
{
 const h=context();
 vm.runInContext(resetSource,h.ctx);
 const unlock=h.ctx.window.CG50OperationGate.acquire("update");
 await h.ctx.reset();
 assert.equal(h.ctx.window.CG50OperationGate.owner,"update");
 assert.equal(h.ctx.busy,false);
 assert.ok(!h.log.includes("reload"));
 unlock();
 console.log("PASS 更新期间，手动重置在下载和存档修改前退出");
}
{
 const h=context();
 vm.runInContext(resetSource,h.ctx);
 h.ctx.confirm=()=>false;
 await h.ctx.reset();
 assert.equal(h.ctx.window.CG50OperationGate.owner,null);
 assert.deepEqual(h.log,[]);
 console.log("PASS 取消确认不占用锁、不修改数据");
}
{
 const shared={};
 const first={window:shared,Object};
 const second={window:shared,Object};
 vm.createContext(first);vm.createContext(second);
 vm.runInContext(gate,first);
 const unlock=shared.CG50OperationGate.acquire("update");
 const originalGate=shared.CG50OperationGate;
 vm.runInContext(resetGate,second);
 assert.equal(shared.CG50OperationGate,originalGate);
 assert.equal(shared.CG50OperationGate.acquire("reset"),null);
 unlock();
 console.log("PASS 两个脚本共享同一把锁，不各自创建独立锁");
}
console.log("页面操作互斥检查通过；尚未覆盖 SW 内部任务和跨窗口互斥。");
