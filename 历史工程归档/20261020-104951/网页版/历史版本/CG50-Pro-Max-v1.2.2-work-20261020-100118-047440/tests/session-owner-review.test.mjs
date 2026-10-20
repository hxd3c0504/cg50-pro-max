
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../web/ipad-adapter.js",import.meta.url),"utf8");
const start=source.indexOf("let sessionOwned=false,sessionLockPending=null;");
const end=source.indexOf("async function launch()",start);
assert.ok(start>=0&&end>start);
const code=source.slice(start,end);

function lockService(){
 let owner=null,requests=0;
 return {
  get requests(){return requests;},
  forDocument(documentId){
   return {
    request:async(name,options,callback)=>{
     requests++;
     await Promise.resolve();
     assert.equal(name,"cg50-calculator-session-v1");
     assert.equal(options.mode,"exclusive");
     assert.equal(options.ifAvailable,true);
     if(owner!==null)return callback(null);
     owner=documentId;
     try{return await callback({name});}
     finally{if(owner===documentId)owner=null;}
    }
   };
  },
  // Models the browser destroying a document and releasing its lock.
  destroyDocument(id){if(owner===id)owner=null;}
 };
}
function page(locks){
 const context={window:{},navigator:{locks},Promise,Error};
 vm.createContext(context);
 vm.runInContext(code,context);
 return context;
}
{
 const service=lockService();
 const a=page(service.forDocument("A"));
 const b=page(service.forDocument("B"));
 await a.acquireSession();
 assert.equal(a.window.CG50SessionOwned(),true);
 await assert.rejects(b.acquireSession(),/另一个窗口/);
 assert.equal(b.window.CG50SessionOwned(),false);
 console.log("PASS 第二个窗口不能取得运行及存档写入权限");

 await Promise.all([a.acquireSession(),a.acquireSession()]);
 assert.equal(service.requests,2);
 console.log("PASS 已取得权限的窗口重复调用不重复申请锁");

 service.destroyDocument("A");
 await b.acquireSession();
 assert.equal(b.window.CG50SessionOwned(),true);
 console.log("PASS 模拟关闭原窗口后，另一窗口可以重新申请");
}
{
 const service=lockService();
 const a=page(service.forDocument("A"));
 await Promise.all([a.acquireSession(),a.acquireSession(),a.acquireSession()]);
 assert.equal(service.requests,1);
 console.log("PASS 同一窗口并发启动共用一次锁申请");
}
{
 const a=page(undefined);
 await assert.rejects(a.acquireSession(),/不支持多窗口存档保护/);
 assert.equal(a.window.CG50SessionOwned(),false);
 console.log("PASS 不支持保护能力时明确拒绝启动");
}
{
 const a=page({request:async()=>{throw Error("Lock service failed");}});
 await assert.rejects(a.acquireSession(),/Lock service failed/);
 await assert.rejects(a.acquireSession(),/Lock service failed/);
 assert.equal(a.window.CG50SessionOwned(),false);
 console.log("PASS 锁申请失败不误报拥有权限，后续可重试");
}
console.log("窗口权限逻辑检查通过；真实浏览器的关闭、刷新及后台行为仍需实测。");
