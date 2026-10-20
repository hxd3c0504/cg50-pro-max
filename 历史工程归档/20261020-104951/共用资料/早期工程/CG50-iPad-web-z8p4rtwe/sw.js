
const CACHE='cg50-ipad-test-v1';
const FILES=['./','./index.html','./worker.js','./wasm_exec.js',
 './cg50.wasm','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||
     new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(
    cached=>cached||fetch(event.request)));
});
