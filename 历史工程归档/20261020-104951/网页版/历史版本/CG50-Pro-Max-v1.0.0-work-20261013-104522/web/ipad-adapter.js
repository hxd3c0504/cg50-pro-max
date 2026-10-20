
(()=>{
"use strict";
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
let readyResolve;
const sessionReady=new Promise(r=>readyResolve=r);

function rpc(action,data={}){
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
    },30000);
    pending.set(id,{resolve,reject,timer});
    worker.postMessage({id,action,...data});
  });
}
function notify(text){
  console.log("[CG50 iPad]",text);
  const el=document.getElementById("ipad-status");
  if(el)el.textContent=text;
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
    
frameReady=true;
    if(window.CG50PaintFrame)window.CG50PaintFrame(canvas);
    return;
  }
  if(m.type==="fault"){
    fault=m.error;notify("Emulator stopped: "+fault);
    alert("CG50 emulator stopped:\n"+fault);return;
  }
  const p=pending.get(m.id);
  if(!p)return;
  clearTimeout(p.timer);pending.delete(m.id);
  m.error?p.reject(Error(m.error)):p.resolve(m.result);
};
worker.onerror=e=>{
  fault=e.message;
  notify("Worker error: "+fault);
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
  const db=await dbReady;
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
  await rpc("boot",{flash,state});
  active=true;readyResolve();
}
async function snapshot(){
  if(fault)throw Error(fault);
  const state=await rpc("save");
  await write({state});
}
function waitReady(signal){
  if(signal?.aborted)return Promise.reject(
    new DOMException("Aborted","AbortError"));
  if(active)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(new DOMException("Aborted","AbortError"));
    signal?.addEventListener("abort",abort,{once:true});
    sessionReady.then(()=>{
      signal?.removeEventListener("abort",abort);resolve();
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
      const state=await read("state");
      if(!state)throw Error("No saved progress");
      await rpc("load",{state});
      return new Response("state reloaded");
    }
    return new Response(null,{status:204});
  }catch(e){return new Response(String(e),{status:500});}
};
async function automaticSave(){
  if(!active||fault||saveBusy)return;
  saveBusy=true;
  try{await rpc("release");await snapshot();}
  catch(e){notify("Automatic save failed: "+e.message);}
  finally{saveBusy=false;}
}
document.addEventListener("visibilitychange",()=>{
  if(document.hidden)automaticSave();
});
window.addEventListener("blur",()=>{
  if(active)rpc("release").catch(()=>{});
});
setInterval(automaticSave,60000);

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
      if(active&&!fault)await snapshot();
      const state=await read("state");
      if(!state)throw Error("No saved progress");
      const url=URL.createObjectURL(new Blob([state]));
      const a=document.createElement("a");
      a.href=url;a.download="cg50-ipad-state.bin";a.click();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(e){alert(e.message);}
  };
  document.body.append(backup);
  if("serviceWorker" in navigator){
    try{await navigator.serviceWorker.register("./sw.js");}
    catch(e){console.warn("Offline setup failed",e);}
  }
}
document.addEventListener("DOMContentLoaded",launch,{once:true});
})();
