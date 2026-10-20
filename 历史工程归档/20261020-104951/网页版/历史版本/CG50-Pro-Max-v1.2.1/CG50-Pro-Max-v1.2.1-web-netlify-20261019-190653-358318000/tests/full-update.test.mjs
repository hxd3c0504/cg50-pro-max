
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {webcrypto} from "node:crypto";
const base="https://test.netlify.app/";
const web=new URL("../web/",import.meta.url);
const release=JSON.parse(readFileSync(new URL("version.json",web),"utf8"));
const manifest=JSON.parse(readFileSync(new URL("reset-manifest.json",web),"utf8"));

// CG50 RELEASE METADATA CONSISTENCY
const embeddedReleaseMatch=readFileSync(new URL("sw.js",web),"utf8")
  .match(/^\s*const\s+RELEASE\s*=\s*(\{[^\r\n]*\});[ \t]*$/m);
assert.ok(embeddedReleaseMatch,"sw.js 缺少完整版本信息");
assert.deepEqual(JSON.parse(embeddedReleaseMatch[1]),release,
  "sw.js 与 version.json 的版本信息不一致");

const maps=new Map(),events={};
let corrupt=false,missing=false,other=false,activations=0,commitRace=false;
const key=x=>x.url||String(x);
const caches={
 async keys(){return [...maps.keys()];},
 async delete(name){return maps.delete(name);},
 async open(name){
  if(!maps.has(name))maps.set(name,new Map());
  const map=maps.get(name);
  return {
   async put(k,r){map.set(key(k),{bytes:new Uint8Array(await r.arrayBuffer()),headers:[...r.headers],status:r.status});},
   async match(k){if(commitRace&&key(k)===base+"index.html"){other=true;commitRace=false;}const v=map.get(key(k));return v?new Response(v.bytes,{headers:v.headers,status:v.status}):undefined;},
   async delete(k){return map.delete(key(k));}
  };
 }
};
const network=async input=>{
 const url=new URL(input.url||String(input)),path=decodeURIComponent(url.pathname).slice(1);
 if(path==="reset-manifest.json"){
  const data=structuredClone(manifest);
  if(missing)data.files=data.files.filter(f=>f.path!=="cg50-brand.js");
  return Response.json(data);
 }
 try{
  const bytes=readFileSync(new URL(path||"index.html",web));
  if(corrupt&&path==="cg50-brand.js")bytes[0]^=1;
  return new Response(bytes,{headers:{"Content-Type":"application/octet-stream","Content-Encoding":"br"}});
 }catch(_){return new Response("missing",{status:404});}
};
const self={
 location:{href:base+"sw.js",origin:new URL(base).origin},registration:{active:{}},
 clients:{
  async matchAll(){return [{id:"owner",url:base},...(other?[{id:"other",url:base}]:[])];},
  async claim(){}
 },
 async skipWaiting(){activations++;},
 addEventListener:(type,fn)=>events[type]=fn
};
vm.runInNewContext(readFileSync(new URL("sw.js",web),"utf8"),{
 self,caches,fetch:network,crypto:webcrypto,URL,Headers,Response,Request,
 AbortController,setTimeout,clearTimeout
});
await (await caches.open("cg50-old-test-cache")).put(base,new Response("previous"));
async function message(data){
 let result;const pending=[];
 events.message({
  data,source:{id:"owner"},
  ports:[{postMessage(v){if(!v?.progress)result=v;},close(){}}],
  waitUntil:p=>pending.push(p)
 });
 await Promise.all(pending);return result;
}
async function install(){
 const pending=[];
 events.install({waitUntil:p=>pending.push(p)});
 return Promise.all(pending);
}
corrupt=true;
await assert.rejects(install(),/VERIFY/);
assert.ok(maps.has("cg50-old-test-cache"));
corrupt=false;
await install();
assert.equal(activations,0);
const automatic=await caches.open("cg50-release-"+release.releaseId);
for(const f of manifest.files)assert.ok(await automatic.match(base+f.path));
assert.ok(maps.has("cg50-old-test-cache"));
await message("ACTIVATE_UPDATE");
assert.equal(activations,1);
console.log("PASS 自动更新完整下载核验；下载失败保留旧版，核验完成后才允许切换。");

corrupt=true;
let r=await message({type:"STAGE_FACTORY",expected:release.releaseId});
assert.equal(r.ok,false);assert.equal(r.error,"VERIFY");
assert.ok(maps.has("cg50-old-test-cache"));
console.log("PASS 下载内容损坏时保留原缓存。");

corrupt=false;missing=true;
r=await message({type:"STAGE_FACTORY",expected:release.releaseId});
assert.equal(r.ok,false);assert.equal(r.error,"MANIFEST");
assert.ok(maps.has("cg50-old-test-cache"));
console.log("PASS 缺少程序文件时拒绝恢复。");

missing=false;other=true;
r=await message({type:"STAGE_FACTORY",expected:release.releaseId});
assert.equal(r.ok,false);assert.equal(r.error,"OTHER_WINDOWS");
console.log("PASS 其他计算器窗口打开时拒绝重置。");

other=false;
r=await message({type:"STAGE_FACTORY",expected:release.releaseId});
assert.equal(r.ok,true);
const job=r.result;
assert.ok(maps.has("cg50-old-test-cache"));
const staged=await caches.open(job.cache);
for(const f of manifest.files)assert.ok(await staged.match(base+f.path));
assert.equal((await staged.match(base+"index.html")).headers.get("content-encoding"),null);
console.log("PASS 实际发布文件的 SHA-256、完整下载及解压响应头检查。");


commitRace=true;
r=await message({type:"COMMIT_FACTORY",cache:job.cache,token:job.token});
assert.equal(r.ok,false);assert.equal(r.error,"OTHER_WINDOWS");
assert.ok(maps.has("cg50-old-test-cache"));
const metaCache=await caches.open("cg50-program-pointer-v1");
assert.equal(await metaCache.match(base+"__cg50_factory_lock"),undefined);
other=false;
console.log("PASS 文件准备后打开其他窗口，仍拒绝重置并保留旧数据。");

r=await message({type:"COMMIT_FACTORY",cache:job.cache,token:job.token});
assert.equal(r.ok,true);assert.equal(maps.has("cg50-old-test-cache"),false);
let output;
events.fetch({request:{url:base,method:"GET",mode:"navigate"},respondWith:p=>output=p});
assert.match(await(await output).text(),/恢复初始状态/);
await message({type:"FINISH_FACTORY",token:job.token});
events.fetch({request:{url:base,method:"GET",mode:"navigate"},respondWith:p=>output=p});
assert.equal(await(await output).text(),readFileSync(new URL("index.html",web),"utf8"));
console.log("PASS 缓存切换及重置期间的新窗口保护。");
console.log("完整更新与多窗口保护检查通过。");
