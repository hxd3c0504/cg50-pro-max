const CACHE="cg50-fast-20261012-193707-235942";
const FILES=["./", "./index.html", "./ipad-adapter.js", "./worker.js", "./wasm_exec.js", "./cg50.wasm", "./calculator-front.png", "./manifest.webmanifest", "./defaults/flash_full.bin", "./defaults/cg50_state.bin"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))
    .then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET" ||
     new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request))
    .then(hit=>hit||fetch(e.request)));
});
