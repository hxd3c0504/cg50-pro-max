
"use strict";
const RELEASE={"app": "CG50 Pro Max", "version": "1.2.0", "releaseId": "v1.2.0-20261019-145021-486143", "graphicsAcceleration": true, "notesZh": ["解决了用一会死机的遗留bug🐛 设置内增加“运行诊断”按钮 遇到bug请复制诊断内容并提交作者"], "notesEn": ["Fixed the lingering freeze issue 🐛 Added Run diagnostics to Settings. If you encounter a bug, copy the diagnostic report and send it to the author."], "fullRefresh": true, "preserveProgress": true};
const FILES=["build-info.json", "calculator-front.png", "cg50-announcements.js", "cg50-brand.js", "cg50-display.js", "cg50-factory-reset.js", "cg50-features.js", "cg50-runtime-diagnostics.js", "cg50-update.js", "cg50-usage.js", "cg50.wasm", "defaults/cg50_state.bin", "defaults/flash_full.bin", "icon-180.png", "icon-192.png", "icon-512.png", "index.html", "ipad-adapter.js", "manifest.webmanifest", "stats/index.html", "stats/stats.js", "sw.js", "version.json", "wasm_exec.js", "worker.js", "reset-manifest.json"];
const BASE=new URL("./",self.location.href).href;
const CACHE="cg50-release-"+RELEASE.releaseId;
const META="cg50-program-pointer-v1";
const POINTER=new URL("__cg50_program_pointer",BASE).href;
const JOB=new URL("__cg50_factory_job",BASE).href;
const LOCK=new URL("__cg50_factory_lock",BASE).href;
let chosen="";
const fail=code=>{throw Error(code);};
async function latest(){
 const r=await fetch(new URL("version.json?fresh="+Date.now(),BASE),{cache:"no-store"});
 if(!r.ok)fail("NETWORK");
 const m=await r.json();
 if(m.app!=="CG50 Pro Max"||typeof m.releaseId!=="string")fail("VERSION");
 return m;
}
async function selected(){
 if(chosen)return chosen;
 const c=await caches.open(META),r=await c.match(POINTER);
 if(r){
  try{
   const m=await r.json();
   if(m.releaseId===RELEASE.releaseId&&m.cache.startsWith(CACHE+"-factory-")&&
      (await caches.keys()).includes(m.cache))return chosen=m.cache;
  }catch(_){}
 }
 return chosen=CACHE;
}
async function clean(keep){
 for(const name of await caches.keys())
  if(name.toLowerCase().startsWith("cg50-")&&!keep.has(name))await caches.delete(name);
}
async function exclusive(owner){
 if(!owner)fail("CLIENT");
 const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
 if(clients.some(c=>c.id!==owner&&[new URL(BASE).pathname,new URL("index.html",BASE).pathname].includes(new URL(c.url).pathname)))
  fail("OTHER_WINDOWS");
}
async function build(name,progress=()=>{}){
 const before=await latest();
 if(before.releaseId!==RELEASE.releaseId)fail("VERSION_CHANGED");
 const mr=await fetch(new URL("reset-manifest.json?fresh="+Date.now(),BASE),{cache:"no-store"});
 if(!mr.ok)fail("NETWORK");
 const manifest=await mr.json();
 if(manifest.releaseId!==RELEASE.releaseId||manifest.version!==RELEASE.version||
    !Array.isArray(manifest.files)||manifest.files.length>1000)fail("MANIFEST");
 const used=new Set();let total=0;
 for(const f of manifest.files){
  if(typeof f.path!=="string"||f.path.startsWith("/")||/[?#\\]/.test(f.path)||
     f.path.split("/").some(s=>!s||s==="."||s==="..")||
     !Number.isSafeInteger(f.size)||f.size<0||f.size>36*1024*1024||
     !/^[0-9a-f]{64}$/.test(f.sha256)||used.has(f.path))fail("MANIFEST");
  const u=new URL(f.path,BASE);
  if(!u.href.startsWith(BASE))fail("MANIFEST");
  used.add(f.path);total+=f.size;
 }
 if(FILES.some(p=>p!=="reset-manifest.json"&&!used.has(p))||used.size!==FILES.length-1)fail("MANIFEST");
 if(total>256*1024*1024||!used.has("index.html")||
    !used.has("defaults/flash_full.bin")||!used.has("defaults/cg50_state.bin"))fail("MANIFEST");
 const cache=await caches.open(name);
 try{
  let done=0;
  for(const f of manifest.files){
   const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),120000);
   try{
    const u=new URL(f.path,BASE);
    const r=await fetch(u,{cache:"no-store",signal:abort.signal});
    if(!r.ok)fail("NETWORK");
    const bytes=await r.arrayBuffer();
    if(bytes.byteLength!==f.size)fail("VERIFY");
    const hash=await crypto.subtle.digest("SHA-256",bytes);
    const hex=[...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,"0")).join("");
    if(hex!==f.sha256)fail("VERIFY");
    const headers=new Headers(r.headers);
    for(const h of ["content-encoding","content-length","transfer-encoding"])headers.delete(h);
    await cache.put(u,new Response(bytes,{headers}));
   }finally{clearTimeout(timeout);}
   progress(++done,manifest.files.length);
  }
  const after=await latest();
  if(after.releaseId!==RELEASE.releaseId)fail("VERSION_CHANGED");
  await cache.put(new URL("reset-manifest.json",BASE),Response.json(manifest));
  const index=await cache.match(new URL("index.html",BASE));
  await cache.put(BASE,index.clone());
  return cache;
 }catch(e){await caches.delete(name);throw e;}
}
self.addEventListener("install",e=>{
 e.waitUntil((async()=>{
  await build(CACHE);
  if(!self.registration.active)await self.skipWaiting();
 })());
});
self.addEventListener("activate",e=>{
 e.waitUntil((async()=>{
  await self.clients.claim();
  const keep=new Set([META,CACHE,await selected()]);
  for(const n of await caches.keys())if(n.startsWith(CACHE+"-factory-"))keep.add(n);
  await clean(keep);
 })());
});
self.addEventListener("message",e=>{
 const m=e.data,port=e.ports&&e.ports[0];
 const reply=value=>{if(port){port.postMessage(value);port.close();}};
 if(m==="ACTIVATE_UPDATE"){e.waitUntil(self.skipWaiting());return;}
 if(m==="GET_RELEASE"){reply({...RELEASE,factoryReset:true});return;}
 e.waitUntil((async()=>{
  try{
   if(m==="check-offline"){
    const c=await caches.open(await selected());
    const entries=await Promise.all(FILES.map(p=>c.match(new URL(p,BASE))));
    reply(entries.every(Boolean)?"offline-ready":"offline-incomplete");return;
   }
   if(m?.type==="STAGE_FACTORY"){
    await exclusive(e.source&&e.source.id);
    if(m.expected!==RELEASE.releaseId)fail("VERSION_CHANGED");
    const current=await selected();
    for(const n of await caches.keys())
     if(n.startsWith(CACHE+"-factory-")&&n!==current)await caches.delete(n);
    const token=crypto.randomUUID(),name=CACHE+"-factory-"+token;
    const c=await build(name,(done,total)=>{
     try{port?.postMessage({progress:{done,total}});}catch(_){}
    });
    const job={cache:name,token,owner:e.source.id,at:Date.now(),releaseId:RELEASE.releaseId};
    await c.put(JOB,Response.json(job));
    reply({ok:true,result:{...job,version:RELEASE.version}});return;
   }
   if(m?.type==="COMMIT_FACTORY"){
    await exclusive(e.source&&e.source.id);
    if(typeof m.cache!=="string"||!m.cache.startsWith(CACHE+"-factory-"))fail("JOB");
    const c=await caches.open(m.cache),r=await c.match(JOB);
    if(!r)fail("JOB");
    const j=await r.json();
    if(j.token!==m.token||j.owner!==e.source.id||j.releaseId!==RELEASE.releaseId||
       Date.now()-j.at>10*60000)fail("JOB");
    const entries=await Promise.all(FILES.map(p=>c.match(new URL(p,BASE))));
    if(!entries.every(Boolean))fail("VERIFY");
    const meta=await caches.open(META);
    await meta.put(LOCK,Response.json({cache:m.cache,token:m.token,owner:e.source.id,until:Date.now()+120000}));
    try{await exclusive(e.source.id);}catch(error){await meta.delete(LOCK);throw error;}
    await meta.put(POINTER,Response.json({cache:m.cache,releaseId:RELEASE.releaseId}));
    chosen=m.cache;
    await clean(new Set([META,m.cache]));
    reply({ok:true,result:{version:RELEASE.version,releaseId:RELEASE.releaseId}});return;
   }
   if(m?.type==="FINISH_FACTORY"){
    const meta=await caches.open(META),r=await meta.match(LOCK);
    if(r){const lock=await r.json();if(lock.owner!==e.source?.id||lock.token!==m.token)fail("JOB");await meta.delete(LOCK);}
    reply({ok:true});return;
   }
   if(m?.type==="ABORT_FACTORY"){
    const meta=await caches.open(META),r=await meta.match(LOCK);
    if(r){const lock=await r.json();if(lock.owner===e.source?.id&&lock.token===m.token)await meta.delete(LOCK);}
    if(typeof m.cache==="string"&&m.cache.startsWith(CACHE+"-factory-")&&m.cache!==await selected())
     await caches.delete(m.cache);
    reply({ok:true});return;
   }
   reply({ok:false,error:"REQUEST"});
  }catch(error){reply({ok:false,error:error.message||"NETWORK"});}
 })());
});
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET"||u.origin!==self.location.origin)return;
 if(u.pathname.startsWith("/api/")||["version.json","sw.js","reset-manifest.json"].some(p=>u.pathname===new URL(p,BASE).pathname)){
  e.respondWith(fetch(new Request(r,{cache:"no-store"})));return;
 }
 if(u.pathname===new URL("stats",BASE).pathname){
  e.respondWith(Response.redirect(new URL("stats/",BASE),302));return;
 }
 u.search="";u.hash="";
 if(u.pathname===new URL("stats/",BASE).pathname)u.pathname+="index.html";
 e.respondWith((async()=>{
  if(r.mode==="navigate"&&[new URL(BASE).pathname,new URL("index.html",BASE).pathname].includes(u.pathname)){
   const meta=await caches.open(META),lr=await meta.match(LOCK);
   if(lr){const lock=await lr.json();if(lock.until>Date.now())return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="2"><title>CG50 Pro Max</title><p style="font:18px system-ui;padding:24px">计算器正在恢复初始状态，请稍候…</p>',{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});await meta.delete(LOCK);}
  }
  const c=await caches.open(await selected());
  return await c.match(u)||fetch(r);
 })());
});
