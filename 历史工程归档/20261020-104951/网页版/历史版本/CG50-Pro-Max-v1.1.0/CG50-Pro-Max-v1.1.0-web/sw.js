const CACHE="cg50-release-v1.1.0-792bdc0b85359296";
const RELEASE={"app": "CG50 Pro Max", "version": "1.1.0", "releaseId": "v1.1.0-20261013-161753", "graphicsAcceleration": true, "notesZh": ["支持设备上的触屏轻震反馈，并保留按键高亮。", "画图忙时自动加速，空闲时降低占用。", "新增版本号与更新说明弹窗。", "左上角显示联网同步、更新或离线状态。", "重载配置文件后显示成功或失败，成功时显示版本号。", "新用户采用未初始化的初始存档；已有进度保留。"], "notesEn": ["Touch vibration on supported devices, with visual key feedback.", "Automatic acceleration while busy and reduced work while idle.", "Version information and release notes.", "Online, update and offline status in the header.", "Reload result feedback with the installed version.", "An uninitialized starting state for new users. Existing progress is retained."]};
const FILES=["./", "./build-info.json", "./calculator-front.png", "./cg50-display.js", "./cg50-features.js", "./cg50-update.js", "./cg50.wasm", "./defaults/cg50_state.bin", "./defaults/flash_full.bin", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./index.html", "./ipad-adapter.js", "./manifest.webmanifest", "./wasm_exec.js", "./worker.js"];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    try{
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
  }else if(event.data==="GET_RELEASE"&&event.ports[0]){
    event.ports[0].postMessage(RELEASE);
    event.ports[0].close();
  }else if(event.data==="check-offline"&&event.ports[0]){
    event.waitUntil((async()=>{
      const cache=await caches.open(CACHE);
      const results=await Promise.all(FILES.map(file=>cache.match(file)));
      event.ports[0].postMessage(results.every(Boolean)
        ?"offline-ready":"offline-incomplete");
      event.ports[0].close();
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
  // 握手必须访问服务器，不能用离线缓存假装在线。
  if(url.pathname.endsWith("/version.json")){
    event.respondWith(fetch(new Request(event.request,{cache:"no-store"})));
    return;
  }
  url.search="";url.hash="";
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(url.href)||fetch(event.request);
  })());
});
