const CACHE="cg50-auto-update-3a8c43418bced648";
const FILES=["./", "./calculator-front.png", "./cg50-update.js", "./cg50.wasm", "./defaults/cg50_state.bin", "./defaults/flash_full.bin", "./index.html", "./ipad-adapter.js", "./manifest.webmanifest", "./wasm_exec.js", "./worker.js"];

self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);
   await cache.addAll(FILES);
   if(!self.registration.active)await self.skipWaiting();
  }catch(e){
   await caches.delete(CACHE);
   throw e;
  }
 })());
});
self.addEventListener("message",event=>{
 if(event.data==="ACTIVATE_UPDATE")
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  await self.clients.claim();
  for(const name of await caches.keys()){
   if(name.startsWith("cg50-auto-update-")&&name!==CACHE)
    await caches.delete(name);
  }
 })());
});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=="GET"||url.origin!==self.location.origin)return;
 url.search="";
 event.respondWith(
  caches.open(CACHE).then(cache=>cache.match(url.href))
   .then(hit=>hit||fetch(event.request))
 );
});
