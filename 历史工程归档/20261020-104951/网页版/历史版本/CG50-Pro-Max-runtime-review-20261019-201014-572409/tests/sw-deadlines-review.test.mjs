
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const watchdog=setTimeout(()=>{
 console.error("测试未在10秒内结束，停止检查。");
 process.exit(1);
},10000);
const source=readFileSync(new URL("../web/sw.js",import.meta.url),"utf8");
const start=source.indexOf("async function networkJSON(");
const end=source.indexOf("async function latest(",start);
assert.ok(start>=0&&end>start);
const buildStart=source.indexOf("async function build(");
const buildEnd=source.indexOf("async function buildFiles(",buildStart);
assert.ok(buildStart>=0&&buildEnd>buildStart);

function harness(fetch){
 const timers=new Map();
 let id=0;
 const context={
  fetch,AbortController,Error,Promise,
  fail:code=>{throw Error(code);},
  setTimeout:(fn,ms)=>{const key=++id;timers.set(key,{fn,ms});return key;},
  clearTimeout:key=>timers.delete(key)
 };
 vm.createContext(context);
 vm.runInContext(source.slice(start,end),context);
 return {context,timers};
}
{
 const h=harness(async()=>({ok:true,json:async()=>({version:"1.2.1"})}));
 const value=await h.context.networkJSON("test");
 assert.equal(value.version,"1.2.1");
 assert.equal(h.timers.size,0);
 console.log("PASS 正常读取版本后清理计时器");
}
{
 const h=harness(async()=>({ok:false}));
 await assert.rejects(h.context.networkJSON("test"),/NETWORK/);
 assert.equal(h.timers.size,0);
 console.log("PASS HTTP 失败返回明确错误并清理计时器");
}
{
 const h=harness((url,{signal})=>new Promise((resolve,reject)=>{
  signal.addEventListener("abort",()=>reject(Error("Aborted")),{once:true});
 }));
 const request=h.context.networkJSON("test");
 const check=assert.rejects(request,/NETWORK/);
 const timer=[...h.timers.values()][0];
 assert.equal(timer.ms,12000);
 timer.fn();
 await check;
 assert.equal(h.timers.size,0);
 console.log("PASS 版本/清单网络请求到期被取消");
}
{
 let markBodyStarted;
 const bodyStarted=new Promise(resolve=>markBodyStarted=resolve);
 const h=harness(async(url,{signal})=>({
  ok:true,
  json:()=>new Promise((resolve,reject)=>{
   const abort=()=>reject(Error("Body aborted"));
   // A real aborted response body also rejects if cancellation happened earlier.
   if(signal.aborted){
    markBodyStarted();abort();return;
   }
   signal.addEventListener("abort",abort,{once:true});
   markBodyStarted();
  })
 }));
 const parent=new AbortController();
 const request=h.context.networkJSON("test",parent.signal);
 const check=assert.rejects(request,/NETWORK/);
 // Explicitly wait for body reading, rather than guessing microtask timing.
 await bodyStarted;
 parent.abort();
 await check;
 assert.equal(h.timers.size,0);
 console.log("PASS 总任务取消会传播到正在读取的响应正文");
}
{
 const h=harness(async(url,{signal})=>{
  // Cancellation between receiving the headers and starting body consumption.
  queueMicrotask(()=>parent.abort());
  return {
   ok:true,
   json:()=>signal.aborted
    ?Promise.reject(Error("Body already aborted"))
    :Promise.reject(Error("Unexpected test ordering"))
  };
 });
 const parent=new AbortController();
 await assert.rejects(h.context.networkJSON("test",parent.signal),/NETWORK/);
 assert.equal(h.timers.size,0);
 console.log("PASS 正文开始读取前已取消，也能结束请求");
}
{
 let fetched=false;
 const h=harness(async()=>{fetched=true;});
 const parent=new AbortController();parent.abort();
 await assert.rejects(h.context.networkJSON("test",parent.signal),/NETWORK/);
 assert.equal(fetched,false);
 assert.equal(h.timers.size,0);
 console.log("PASS 已取消的任务不会再发起请求");
}
{
 const h=harness(()=>{throw Error("Unused");});
 h.context.buildFiles=(name,progress,signal)=>new Promise((resolve,reject)=>{
  signal.addEventListener("abort",()=>reject(Error("Cancelled")),{once:true});
 });
 vm.runInContext(source.slice(buildStart,buildEnd),h.context);
 const request=h.context.build("temporary");
 const check=assert.rejects(request,/NETWORK/);
 const timer=[...h.timers.values()][0];
 assert.equal(timer.ms,180000);
 timer.fn();
 await check;
 assert.equal(h.timers.size,0);
 console.log("PASS 完整下载任务有180秒总截止时间");
}
console.log("网络截止时间单元检查通过；完整缓存切换将在清单刷新后另行回归。");

clearTimeout(watchdog);
