
(()=>{
"use strict";
let inputEpoch=0,lastFrameAt=0,lastVisibility=null;

window.CG50NativeCompact=false;
try {
    window.CG50NativeCompact=localStorage.getItem("cg50-mini")==="true";
} catch (_) {}
const networkFetch=window.fetch.bind(window);
const worker=new Worker("./worker.js");
const pending=new Map();
let seq=0, active=false, fault="", frameReady=false, saveBusy=false;
const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");
let readyResolve,readyReject;
const sessionReady=new Promise((resolve,reject)=>{
 readyResolve=resolve;readyReject=reject;
});
sessionReady.catch(()=>{});
window.CG50EmulatorReady=sessionReady;
let firstFrameResolve,firstFrameReject;
window.CG50FirstFrameReady=new Promise((resolve,reject)=>{
 firstFrameResolve=resolve;firstFrameReject=reject;
});
window.CG50FirstFrameReady.catch(()=>{});
window.CG50ReportCoreFault=error=>{
  window.CG50CoreFault=String(error);
  window.dispatchEvent(new CustomEvent("cg50-core-fault",{
    detail:window.CG50CoreFault
  }));
};



// CG50 V111 RESET PREPARE
let factoryResetting=false;
window.CG50PrepareFactoryReset=async()=>{
  factoryResetting=true;
  active=false;saveBusy=true;
  worker.terminate();
  for(const p of pending.values()){
    clearTimeout(p.timer);
    p.reject(Error("正在恢复初始状态"));
  }
  pending.clear();
  const db=await dbReady;
  await new Promise((resolve,reject)=>{
    const tx=db.transaction("files","readwrite");
    tx.oncomplete=resolve;
    tx.onabort=tx.onerror=()=>reject(
      tx.error||Error("无法停止存档写入")
    );
  });
  db.close();
};
function rpc(action,data={},timeoutMs=30000){
if(action==="key"||action==="hold")
 data={...data,epoch:inputEpoch};
if(action==="boot")
 data={...data,epoch:inputEpoch,visible:!document.hidden};

if(factoryResetting)return Promise.reject(Error("正在恢复初始状态"));
if(fault&&action!=="diagnostics")return Promise.reject(Error(fault));
if(window.CG50UpdateSuspended&&["key","hold","load"].includes(action))
 return Promise.reject(Error("正在保存并更新，请稍候"));

  // V100 INPUT CACHE
  if(action==="boot"){
    let speed=5000000;
    try { speed=Number(localStorage.getItem("cg50-input-ips-v1"))||speed; } catch(_){}
    data={...data,inputSpeed:speed};
  }
  return new Promise((resolve,reject)=>{
    const id=++seq;
    const timer=setTimeout(()=>{
      pending.delete(id);reject(Error("Emulator timed out"));
    },timeoutMs);
    
    // CG50 V111 USAGE HOOK
    pending.set(id,{action,
      resolve(value){
        resolve(value);
        try{window.CG50UsageActivity?.(action,data);}catch(_){}
      },
      reject,timer
    });

    try{
      worker.postMessage({id,action,...data});
    }catch(error){
      clearTimeout(timer);pending.delete(id);reject(error);
    }
  });
}
function notify(text){
  console.log("[CG50 iPad]",text);
  const el=document.getElementById("ipad-status");
  if(el)el.textContent=text;
}

// One terminal-fault path for readiness, pending requests and UI state.
function markCoreFault(error){
  const message=error instanceof Error?error.message:String(error);
  const first=!fault;
  fault=fault||message||"Emulator failed";
  active=false;
  const reason=Error(fault);
  readyReject(reason);
  firstFrameReject(reason);
  for(const p of pending.values()){
    clearTimeout(p.timer);
    p.reject(reason);
  }
  pending.clear();
  if(first){
    window.CG50ReportCoreFault(fault);
    notify("Emulator stopped: "+fault);
  }
}
worker.onmessage=({data:m})=>{
  if(m.type==="input-speed"){
    try { localStorage.setItem("cg50-input-ips-v1",String(m.value)); } catch(_){}
    return;
  }
  if(m.type==="frame"){
    if(canvas.width!==m.width||canvas.height!==m.height){
      canvas.width=m.width;canvas.height=m.height;
    }
    ctx.putImageData(new ImageData(
      new Uint8ClampedArray(m.pixels),m.width,m.height),0,0);
    
frameReady=true;lastFrameAt=performance.now();
    if(firstFrameResolve){firstFrameResolve();firstFrameResolve=null;}
    if(window.CG50PaintFrame)window.CG50PaintFrame(canvas);
    return;
  }
  if(m.type==="fault"){
    markCoreFault(m.error);return;
  }
  const p=pending.get(m.id);
  if(!p)return;
  clearTimeout(p.timer);pending.delete(m.id);
  m.error?p.reject(Error(m.error)):p.resolve(m.result);
};
worker.onerror=e=>{
  markCoreFault(e.message||"Worker execution failed");
};
worker.onmessageerror=()=>{
  markCoreFault("Worker message could not be decoded");
};

const dbReady=new Promise((resolve,reject)=>{
  const r=indexedDB.open("cg50-ipad-v1",1);
  r.onupgradeneeded=()=>r.result.createObjectStore("files");
  r.onsuccess=()=>resolve(r.result);
  r.onerror=()=>reject(r.error);
});
async function read(key){
  const db=await dbReady;
  return new Promise((resolve,reject)=>{
    const r=db.transaction("files").objectStore("files").get(key);
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
}
async function write(values){
if(!sessionOwned)throw Error("当前窗口没有存档写入权限");
if(factoryResetting)throw Error("正在恢复初始状态");

  const db=await dbReady;
if(factoryResetting)throw Error("正在恢复初始状态");

  return new Promise((resolve,reject)=>{
    const t=db.transaction("files","readwrite");
    for(const [k,v] of Object.entries(values))
      t.objectStore("files").put(v,k);
    t.oncomplete=resolve;
    t.onabort=()=>reject(t.error||Error("Storage write failed"));
    t.onerror=()=>reject(t.error);
  });
}
async function boot(flash,state){
  if(!sessionOwned)throw Error("当前窗口没有计算器运行权限");
  try {
    await rpc("boot",{flash,state});
  } catch(error) {
    markCoreFault(error);
    throw error;
  }
  active=true;readyResolve();syncLifecycle(true);
}
// Serialize complete storage operations, not just Worker requests.
let progressOperations=Promise.resolve();
function progressOperation(task){
  const operation=progressOperations.then(()=>{
    if(factoryResetting)throw Error("正在恢复初始状态");
    if(fault)throw Error(fault);
    return task();
  });
  // A failed operation must not permanently block later operations.
  progressOperations=operation.catch(()=>{});
  return operation;
}
function snapshot(){
  return progressOperation(async()=>{
    const state=await rpc("save");
    await write({state});
  });
}
function restoreSavedProgress(){
  return progressOperation(async()=>{
    const state=await read("state");
    if(!state)throw Error("No saved progress");
    await rpc("load",{state});
  });
}
async function exportProgressBytes(){
  if(factoryResetting)throw Error("正在恢复初始状态");
  if(active&&!fault){
    return progressOperation(()=>rpc("save"));
  }
  // Rescue export of the last persisted state when the core is unavailable.
  await progressOperations;
  if(factoryResetting)throw Error("正在恢复初始状态");
  const state=await read("state");
  if(!state)throw Error("No saved progress");
  return state;
}

window.CG50PauseForUpdate=async()=>{
 if(factoryResetting)throw Error("正在恢复初始状态");
 if(fault)throw Error(fault);
 if(!active)throw Error("计算器尚未启动");
 if(window.CG50UpdateSuspended)throw Error("更新暂停已在进行");
 window.CG50UpdateSuspended=true;
 releasePageKeys();
 // Finish already queued storage work before taking the final update snapshot.
 await progressOperations;
 const result=await rpc("visibility",{
  visible:false,epoch:++inputEpoch
 });
 lastVisibility=false;
 if(result?.error||!result?.running||result.paused!==true)
  throw Error(result?.error||"未能确认计算器已暂停");
};
window.CG50ResumeAfterUpdate=async()=>{
 if(!window.CG50UpdateSuspended)return;
 window.CG50UpdateSuspended=false;
 if(factoryResetting||fault||!active)return;
 const result=await syncLifecycle(true);
 if(!result||result.error||!result.running||
    result.paused!==document.hidden)
  throw Error(result?.error||"恢复运行未确认，请检查运行诊断或刷新页面");
};

function waitReady(signal){
  if(factoryResetting)return Promise.reject(Error("正在恢复初始状态"));
  if(fault)return Promise.reject(Error(fault));
  if(signal?.aborted)return Promise.reject(
    new DOMException("Aborted","AbortError"));
  if(active)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const cleanup=()=>signal?.removeEventListener("abort",abort);
    const abort=()=>{
      cleanup();reject(new DOMException("Aborted","AbortError"));
    };
    signal?.addEventListener("abort",abort,{once:true});
    sessionReady.then(()=>{
      cleanup();resolve();
    },error=>{
      cleanup();reject(error);
    });
  });
}
const endpoints=new Set(["/frame","/key","/hold","/save","/load"]);
window.fetch=async(input,options={})=>{
  const u=new URL(input instanceof Request?input.url:input,location.href);
  if(u.origin!==location.origin||!endpoints.has(u.pathname))
    return networkFetch(input,options);
  const signal=options.signal||(input instanceof Request?input.signal:null);
  await waitReady(signal);
  if(fault)return new Response(fault,{status:503});
  try{
    if(u.pathname==="/frame"){
      if(!frameReady)return new Response("Starting",{status:503});
      const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
      return new Response(blob,{headers:{"Content-Type":"image/png"}});
    }
    if(u.pathname==="/key")
      await rpc("key",{key:u.searchParams.get("k")});
    if(u.pathname==="/hold"){
      if(u.searchParams.has("reset"))await rpc("release");
      else await rpc("hold",{
        key:u.searchParams.get("k"),
        token:u.searchParams.get("id")||"pointer",
        down:u.searchParams.get("down")==="1"
      });
    }
    if(u.pathname==="/save"){
      await snapshot();return new Response("state saved");
    }
    if(u.pathname==="/load"){
      await restoreSavedProgress();
      return new Response("state reloaded");
    }
    return new Response(null,{status:204});
  }catch(e){return new Response(String(e),{status:500});}
};
async function automaticSave(){
  if(!active||fault||saveBusy||window.CG50UpdateSuspended)return;
  saveBusy=true;
  try{await snapshot();}
  catch(e){notify("Automatic save failed: "+e.message);}
  finally{saveBusy=false;}
}

function releasePageKeys(){
 try{if(typeof releaseAll==="function")releaseAll();}catch(_){}
}
function syncLifecycle(force=false,visible=!document.hidden){
 if(factoryResetting||!active)return;
 visible=visible&&!window.CG50UpdateSuspended;
 if(!force&&visible===lastVisibility)return;
 lastVisibility=visible;
 const epoch=++inputEpoch;
 releasePageKeys();
 return rpc("visibility",{visible,epoch}).then(result=>{
  if(factoryResetting||epoch!==inputEpoch)return;
  if(result?.error){markCoreFault(result.error);return;}
  if(visible)window.CG50Redraw?.();
  return result;
 }).catch(error=>{
  if(!factoryResetting)notify("恢复运行未完成："+error.message);
 });
}
document.addEventListener("visibilitychange",()=>{
 syncLifecycle();
 if(document.hidden)automaticSave();
});
window.addEventListener("pagehide",()=>{
 syncLifecycle(true,false);automaticSave();
});
window.addEventListener("pageshow",()=>syncLifecycle(true));
document.addEventListener("freeze",()=>syncLifecycle(true,false));
document.addEventListener("resume",()=>syncLifecycle(true));
window.addEventListener("blur",()=>{
 releasePageKeys();
 if(active&&!factoryResetting)rpc("release").catch(()=>{});
});
window.addEventListener("focus",()=>{
 if(!document.hidden)syncLifecycle(true);
});
setInterval(automaticSave,60000);

window.CG50RuntimeDiagnostic=async()=>{
 const result={
  version:window.CG50Release?.version||null,
  time:new Date().toISOString(),
  pageVisible:!document.hidden,
  active,factoryResetting,saveBusy,fault,frameReady,
  millisecondsSinceFrame:lastFrameAt?Math.round(performance.now()-lastFrameAt):null,
  pendingRequests:[...pending.values()].map(p=>p.action),
  display:window.CG50DisplayDiagnostic?.()||null
 };
 try{result.worker=await rpc("diagnostics",{},4000);}
 catch(error){result.workerError=String(error);}
 return result;
};



// One calculator owner per origin. Keep the lock until the document is destroyed.
let sessionOwned=false,sessionLockPending=null;
window.CG50SessionOwned=()=>sessionOwned;
function acquireSession(){
 if(sessionOwned)return Promise.resolve();
 if(sessionLockPending)return sessionLockPending;
 if(!navigator.locks?.request)
  return Promise.reject(Error(
   "此浏览器不支持多窗口存档保护，请使用新版 Safari 或 Chrome。"
  ));
 const granted=new Promise((resolve,reject)=>{
  try{
   navigator.locks.request(
    "cg50-calculator-session-v1",
    {mode:"exclusive",ifAvailable:true},
    lock=>{
     if(!lock){
      reject(Error("另一个窗口正在运行计算器，请关闭那个窗口后点击重试。"));
      return;
     }
     sessionOwned=true;
     resolve();
     // The browser releases the lock when this document is destroyed.
     return new Promise(()=>{});
    }
   ).catch(reject);
  }catch(error){reject(error);}
 });
 sessionLockPending=granted.catch(error=>{
  sessionLockPending=null;
  throw error;
 });
 return sessionLockPending;
}

async function launch(){
  const dialog=document.createElement("dialog");
  dialog.style.cssText="max-width:420px;width:calc(100% - 64px);"+
    "border:1px solid #879bb3;border-radius:16px;padding:24px;"+
    "font:16px system-ui";
  dialog.innerHTML=`
    <h2>CG50 Pro Max</h2>
    <p id="ipad-status">Loading saved calculator…</p>
    <div id="ipad-import" hidden>
      <p>首次使用，请选择固件和进度；已有数据会自动恢复。</p>
      <p>Firmware <input id="ipad-flash" type="file" accept=".bin"></p>
      <p>Saved progress <input id="ipad-state" type="file" accept=".bin"></p>
      <button id="ipad-start">Import and start</button>
    </div>`;
  document.body.append(dialog);
  dialog.addEventListener("cancel",e=>e.preventDefault());
  dialog.addEventListener("keydown",e=>e.stopPropagation());
  dialog.addEventListener("keyup",e=>e.stopPropagation());
  dialog.showModal();
  try{
    
    /* CG50 AUTOMATIC DEFAULTS */
    await acquireSession();
    let [flash,state]=await Promise.all([read("flash"),read("state")]);
    if(!flash && !state){
      notify("首次准备，请稍候… / Preparing first launch…");
      async function download(name){
        const controller=new AbortController();
        const timer=setTimeout(()=>controller.abort(),120000);
        try{
          const response=await networkFetch("./defaults/"+name,{
            signal:controller.signal
          });
          if(!response.ok)throw Error("Download failed: "+name);
          return await response.arrayBuffer();
        }finally{clearTimeout(timer);}
      }
      [flash,state]=await Promise.all([
        download("flash_full.bin"),download("cg50_state.bin")
      ]);
      if(flash.byteLength!==33554432 || !state.byteLength)
        throw Error("Initial data is incomplete");
      await write({flash,state});
    }
    if(!flash || !state)
      throw Error("Local data incomplete; existing progress preserved.");

    if(flash&&state){
      await boot(flash,state);dialog.close();
    }else{
      document.getElementById("ipad-import").hidden=false;
      notify("First-time setup");
    }
  }catch(e){
    notify("启动失败 / Startup failed: "+e.message);
        const retry=document.createElement("button");
        retry.textContent="重试 / Retry";
        retry.onclick=()=>location.reload();
        dialog.append(retry);
    document.getElementById("ipad-import").hidden=false;
  }
  document.getElementById("ipad-start").onclick=async()=>{
    const button=document.getElementById("ipad-start");
    button.disabled=true;
    try{
      await acquireSession();
      const f=document.getElementById("ipad-flash").files[0];
      const s=document.getElementById("ipad-state").files[0];
      if(!f||!s)throw Error("Choose both files");
      if(f.size!==33554432)throw Error("Firmware must be 32 MiB");
      const flash=await f.arrayBuffer(),state=await s.arrayBuffer();
      await boot(flash,state);
      await write({flash,state});
      dialog.close();
      navigator.storage?.persist?.().catch(()=>{});
    }catch(e){notify(e.message);}
    finally{button.disabled=false;}
  };

  // Standalone backup control, separate from native Mac menu actions.
  const backup=document.createElement("button");
  backup.textContent="Export backup / 导出备份";
  backup.style.cssText="display:block;margin:16px auto;padding:8px 12px";
  backup.onclick=async()=>{
    try{
      const state=await exportProgressBytes();
      const url=URL.createObjectURL(new Blob([state]));
      const a=document.createElement("a");
      a.href=url;a.download="cg50-ipad-state.bin";a.click();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(e){alert(e.message);}
  };
  document.body.append(backup);
}
document.addEventListener("DOMContentLoaded",launch,{once:true});
})();
