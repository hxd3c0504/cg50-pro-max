const CACHE="cg50-release-v1.0.0-92ab854c9fd16839";
const FILES=["./", "./build-info.json", "./calculator-front.png", "./cg50-display.js", "./cg50-update.js", "./cg50.wasm", "./defaults/cg50_state.bin", "./defaults/flash_full.bin", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./index.html", "./ipad-adapter.js", "./manifest.webmanifest", "./wasm_exec.js", "./worker.js"];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    try {
      const cache=await caches.open(CACHE);
      await cache.addAll(FILES);
      if(!self.registration.active)await self.skipWaiting();
    }catch(error){
      await caches.delete(CACHE);throw error;
    }
  })());
});
self.addEventListener("message",event=>{
  if(event.data==="ACTIVATE_UPDATE"){
    event.waitUntil(self.skipWaiting());
  }else if(event.data==="check-offline"&&event.ports[0]){
    event.waitUntil((async()=>{
      const cache=await caches.open(CACHE);
      const results=await Promise.all(FILES.map(file=>cache.match(file)));
      event.ports[0].postMessage(results.every(Boolean)
        ?"offline-ready":"offline-incomplete");
    })());
  }
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    await self.clients.claim();
    for(const key of await caches.keys()){
      if(key!==CACHE&&(key.startsWith("cg50-release-")||
          key.startsWith("cg50-auto-update-"))){
        await caches.delete(key);
      }
    }
  })());
});
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==self.location.origin)return;
  url.search="";url.hash="";
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(url.href)||fetch(event.request);
  })());
});
