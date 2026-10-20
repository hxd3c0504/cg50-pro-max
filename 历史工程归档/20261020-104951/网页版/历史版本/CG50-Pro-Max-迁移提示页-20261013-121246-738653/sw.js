const CACHE="cg50-moved-20261013-121246-738653";

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(["./","./index.html"]);
    if(!self.registration.active)await self.skipWaiting();
  })());
});
self.addEventListener("message",event=>{
  if(event.data==="ACTIVATE_UPDATE")
    event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate",event=>{
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==self.location.origin)return;
  if(event.request.mode!=="navigate"&&!url.pathname.endsWith("/index.html"))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match("./index.html")||fetch(event.request);
  })());
});
