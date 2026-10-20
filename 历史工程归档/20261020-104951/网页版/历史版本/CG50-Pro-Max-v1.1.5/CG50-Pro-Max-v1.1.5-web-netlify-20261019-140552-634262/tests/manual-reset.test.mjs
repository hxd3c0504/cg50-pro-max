
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {MessageChannel} from "node:worker_threads";
const web=new URL("../web/",import.meta.url);
const release=JSON.parse(readFileSync(new URL("version.json",web),"utf8"));
const source=readFileSync(new URL("cg50-factory-reset.js",web),"utf8");
const flash=readFileSync(new URL("defaults/flash_full.bin",web));
const state=readFileSync(new URL("defaults/cg50_state.bin",web));
const base="https://test.netlify.app/";
function storage(seed={}){
 const values=new Map(Object.entries(seed));
 return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),
  removeItem:k=>values.delete(k),clear:()=>values.clear()};
}
async function run({accept=true,downloadFails=false,writeFails=false}={}){
 const order=[],messages=[],notices=[];
 const localStorage=storage({previousSetting:"keep"});
 const sessionStorage=storage({previousSession:"keep"});
 const saved=new Map([
  ["cg50-ipad-v1",new Map([["state","old-progress"],["flash","old-firmware"]])],
  ["cg50-usage-v1",new Map([["data","old-local-record"]])]
 ]);
 let writes=0,reloaded=0,network=0;
 const worker={
  postMessage(m,ports=[]){
   messages.push(typeof m==="string"?m:m.type);
   let result;
   if(m==="GET_RELEASE")result={...release,factoryReset:true};
   else if(m.type==="STAGE_FACTORY")result=downloadFails
    ?{ok:false,error:"NETWORK"}
    :{ok:true,result:{cache:"staged",token:"token",version:release.version,releaseId:release.releaseId}};
   else result={ok:true,result:{version:release.version,releaseId:release.releaseId}};
   if(ports[0]){
    ports[0].postMessage(result);ports[0].close();
   }
  }
 };
 const reg={active:worker,waiting:null,async update(){order.push("check-update");}};
 const indexedDB={open(name){
  const request={};
  queueMicrotask(()=>{
   const db={
    close(){},objectStoreNames:{contains:()=>true},
    transaction(){
     const copy=new Map(saved.get(name)||[]),tx={};
     order.push("transaction-"+name);
     tx.objectStore=()=>({
      clear(){copy.clear();writes++;},
      put(value,key){copy.set(key,value);writes++;}
     });
     tx.abort=()=>{
      tx.error=Error("storage failure");queueMicrotask(()=>tx.onabort?.());
     };
     queueMicrotask(()=>{
      if(writeFails&&name==="cg50-ipad-v1"){
       tx.error=Error("storage failure");tx.onabort?.();
      }else{saved.set(name,copy);tx.oncomplete?.();}
     });
     return tx;
    }
   };
   request.result=db;request.onsuccess?.();
  });return request;
 }};
 const element=()=>({style:{},append(){},addEventListener(){},showModal(){},
  close(){},remove(){}});
 const window={
  addEventListener(){},
  async CG50PrepareFactoryReset(){order.push("stop-core");},
  async CG50UsageFlush(){order.push("flush-records");},
  async CG50UsageStop(){order.push("stop-record-writes");},
  async CG50Notice(n){notices.push(n);}
 };
 const context={
  window,document:{documentElement:{lang:"zh-CN"},readyState:"loading",
   addEventListener(){},getElementById:()=>null,createElement:element,body:{append(){}}},
  location:{href:base,reload(){reloaded++;}},
  navigator:{serviceWorker:{controller:worker,async getRegistration(){return reg;}}},
  confirm:()=>accept,alert(){},URL,MessageChannel,AbortController,setTimeout,clearTimeout,
  localStorage,sessionStorage,indexedDB,
  fetch:async()=>{network++;return Response.json(release);},
  caches:{async open(){return {async match(url){
   return new Response(String(url).endsWith("flash_full.bin")?flash:state);
  }};}},
  console:{warn(){}}
 };
 vm.runInNewContext(source,context);
 await window.CG50ManualReload();
 return {order,messages,notices,saved,writes,reloaded,network,localStorage,sessionStorage};
}
let r=await run({accept:false});
assert.equal(r.network,0);assert.equal(r.writes,0);assert.equal(r.reloaded,0);
assert.equal(r.saved.get("cg50-ipad-v1").get("state"),"old-progress");
console.log("PASS 取消重载不下载、不修改进度。");

r=await run({downloadFails:true});
assert.equal(r.writes,0);assert.equal(r.reloaded,0);
assert.equal(r.saved.get("cg50-ipad-v1").get("state"),"old-progress");
assert.equal(r.localStorage.getItem("previousSetting"),"keep");
assert.ok(!r.order.includes("stop-core"));
assert.equal(r.notices.length,1);
console.log("PASS 下载失败保留进度和设置，模拟器继续运行。");

r=await run();
assert.equal(r.reloaded,1);
const files=r.saved.get("cg50-ipad-v1");
assert.equal(files.size,2);
assert.deepEqual(new Uint8Array(files.get("flash")),new Uint8Array(flash));
assert.deepEqual(new Uint8Array(files.get("state")),new Uint8Array(state));
assert.equal(r.saved.get("cg50-usage-v1").size,0);
assert.equal(r.localStorage.getItem("previousSetting"),null);
assert.equal(r.sessionStorage.getItem("previousSession"),null);
assert.ok(r.order.indexOf("stop-core")<r.order.indexOf("transaction-cg50-ipad-v1"));
assert.ok(r.order.indexOf("stop-record-writes")<r.order.indexOf("transaction-cg50-usage-v1"));
const ack=JSON.parse(r.sessionStorage.getItem("cg50.factory-reset-result.v1"));
assert.equal(ack.ok,true);assert.equal(ack.version,"1.1.1");
assert.equal(ack.releaseId,release.releaseId);
assert.ok(r.messages.includes("FINISH_FACTORY"));
console.log("PASS 停止核心和后台写入后恢复正确初始化存档，并准备版本号反馈。");

r=await run({writeFails:true});
assert.equal(r.reloaded,1);
assert.equal(r.saved.get("cg50-ipad-v1").get("state"),"old-progress");
assert.equal(r.saved.get("cg50-ipad-v1").get("flash"),"old-firmware");
assert.equal(r.localStorage.getItem("previousSetting"),"keep");
const failed=JSON.parse(r.sessionStorage.getItem("cg50.factory-reset-result.v1"));
assert.equal(failed.ok,false);assert.equal(failed.restored,false);
assert.ok(r.messages.includes("ABORT_FACTORY"));
console.log("PASS 存档事务失败时保留旧进度，并记录失败反馈。");
console.log("手动重载模拟检查通过；真实 Safari 重载后启动仍需验证。");
