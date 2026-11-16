
(()=>{
"use strict";

// Shared page operation gate. A stale release cannot unlock a newer operation.
const operations=window.CG50OperationGate||(window.CG50OperationGate=(()=>{
 let current=null;
 return Object.freeze({
  get owner(){return current?.kind||null;},
  acquire(kind){
   if(current)return null;
   const token={kind};
   current=token;
   return ()=>{
    if(current===token)current=null;
   };
  }
 });
})());

const BASE=new URL("./",location.href).href;
const ACK="cg50.factory-reset-result.v1";
let busy=false;
const zh=()=>document.documentElement.lang.toLowerCase().startsWith("zh");
const text=(a,b)=>zh()?a:b;
const errors={
 NETWORK:["下载未完成，请检查网络后重试。","Download failed. Check your connection and retry."],
 VERIFY:["下载的文件校验未通过，原存档已保留。","Downloaded files failed verification. The previous progress was kept."],
 VERSION_CHANGED:["服务器刚更新了版本，请稍后重试。","The server version changed. Please retry."],
 OTHER_WINDOWS:["请先关闭其他 CG50 Pro Max 窗口，再重试。","Close other CG50 Pro Max windows and retry."],
 MANIFEST:["程序文件清单不完整，请稍后重试。","The app file list is incomplete. Please retry."],
 JOB:["准备的文件已失效，请重新操作。","Prepared files expired. Please retry."],
 UPDATE_BUSY:["正在更新程序，请等更新完成后重试。","An update is in progress. Please retry afterward."],
 INTERFACE:["程序尚未完整加载，请刷新后重试。","The app has not fully loaded. Refresh and retry."],
 TIMEOUT:["等待超时，请检查网络后重试。","Timed out. Check your connection and retry."]
};
const errorText=e=>errors[e.message]?.[zh()?0:1]||text("恢复未完成，请刷新页面后重试。","Restore failed. Refresh the page and retry.");
async function notice(title,body){
 if(window.CG50Notice)return window.CG50Notice({title,body,force:true});
 alert(title+"\n"+body);
}
function rpc(worker,message,timeout=5000,progress){
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel();
  const timer=setTimeout(()=>finish(Error("TIMEOUT")),timeout);
  function finish(error,result){
   clearTimeout(timer);channel.port1.close();
   if(error)reject(error);else resolve(result);
  }
  channel.port1.onmessage=({data:m})=>{
   if(m?.progress){progress?.(m.progress);return;}
   if(m?.ok===false){finish(Error(m.error||"NETWORK"));return;}
   finish(null,m?.ok===true?m.result:m);
  };
  try{worker.postMessage(message,[channel.port2]);}
  catch(e){finish(e);}
 });
}
async function latest(){
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
 try{
  const r=await fetch(new URL("version.json?reset="+Date.now(),BASE),{cache:"no-store",signal:abort.signal});
  if(!r.ok)throw Error("NETWORK");
  const m=await r.json();
  if(m.app!=="CG50 Pro Max"||typeof m.releaseId!=="string"||!/^\d+\.\d+\.\d+$/.test(m.version))throw Error("MANIFEST");
  return m;
 }catch(e){
  if(e.name==="AbortError"||e.name==="TypeError")throw Error("NETWORK");
  throw e;
 }finally{clearTimeout(timer);}
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function target(reg,expected){
 const end=Date.now()+180000;
 while(Date.now()<end){
  for(const worker of [reg.waiting,reg.active].filter(Boolean)){
   try{
    const m=await rpc(worker,"GET_RELEASE",1500);
    if(m.releaseId===expected&&m.factoryReset)return worker;
   }catch(_){}
  }
  await sleep(500);
 }
 throw Error("TIMEOUT");
}
async function activate(reg,worker,expected){
 if(navigator.serviceWorker.controller===worker)return;
 worker.postMessage("ACTIVATE_UPDATE");
 const end=Date.now()+20000;
 while(Date.now()<end){
  const current=navigator.serviceWorker.controller;
  if(current){
   try{if((await rpc(current,"GET_RELEASE",1500)).releaseId===expected)return;}
   catch(_){}
  }
  await sleep(150);
 }
 throw Error("TIMEOUT");
}
function openDB(name,store){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open(name,1);
  r.onupgradeneeded=()=>{
   if(!r.result.objectStoreNames.contains(store))r.result.createObjectStore(store);
  };
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  r.onblocked=()=>reject(Error("OTHER_WINDOWS"));
 });
}
async function rewrite(name,store,values){
 const db=await openDB(name,store);
 try{
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(store,"readwrite"),s=tx.objectStore(store);
   tx.oncomplete=resolve;
   tx.onabort=tx.onerror=()=>reject(tx.error||Error("STORAGE"));
   try{
    s.clear();
    for(const [key,value] of Object.entries(values))s.put(value,key);
   }catch(e){tx.abort();reject(e);}
  });
 }finally{db.close();}
}
async function reset(){
 if(busy)return;
 if(!confirm(text(
  "这会清除本机 CG50 Pro Max 的计算进度和个人设置，重新下载程序，并恢复未初始化存档。\n\n确定清空并重新开始吗？",
  "This clears this device's CG50 Pro Max progress and personal settings, downloads the app again, and restores the uninitialized calculator.\n\nClear local data and start over?"
 )))return;
 const unlock=operations.acquire("reset");
 if(!unlock){
  await notice(text("请稍候","Please wait"),errorText(Error("UPDATE_BUSY")));
  return;
 }
 busy=true;window.CG50FactoryResetBusy=true;
 let dialog,job,worker,stopped=false,restored=false,reloading=false;
 try{
  if(!navigator.serviceWorker||!window.CG50PrepareFactoryReset||
     !window.CG50SessionOwned)throw Error("INTERFACE");
  if(!window.CG50SessionOwned())throw Error("OTHER_WINDOWS");
  document.getElementById("cg50-settings-dialog")?.close();
  if(typeof releaseAll==="function")releaseAll();
  dialog=document.createElement("dialog");
  dialog.style.cssText="max-width:420px;width:calc(100% - 48px);box-sizing:border-box;padding:24px;border:1px solid #879bb3;border-radius:14px;font:16px system-ui";
  const title=document.createElement("h2"),hint=document.createElement("p");
  title.textContent=text("恢复初始状态","Restore initial state");
  hint.textContent=text("正在准备重新下载，请保持页面打开…","Preparing the download. Keep this page open…");
  dialog.append(title,hint);document.body.append(dialog);
  dialog.addEventListener("cancel",e=>e.preventDefault());dialog.showModal();
  const version=await latest();
  const reg=await navigator.serviceWorker.getRegistration(BASE);
  if(!reg)throw Error("INTERFACE");
  await reg.update();
  worker=await target(reg,version.releaseId);
  job=await rpc(worker,{type:"STAGE_FACTORY",expected:version.releaseId},240000,p=>{
   hint.textContent=text("正在重新下载并核验程序文件：","Downloading and verifying app files: ")+p.done+" / "+p.total;
  });
  const cache=await caches.open(job.cache);
  const flashResponse=await cache.match(new URL("defaults/flash_full.bin",BASE));
  const stateResponse=await cache.match(new URL("defaults/cg50_state.bin",BASE));
  if(!flashResponse||!stateResponse)throw Error("VERIFY");
  const flash=await flashResponse.arrayBuffer(),state=await stateResponse.arrayBuffer();
  const magic=new Uint8Array(state,0,Math.min(2,state.byteLength));
  if(flash.byteLength!==33554432||state.byteLength<16||magic[0]!==31||magic[1]!==139)throw Error("VERIFY");
  if((await latest()).releaseId!==job.releaseId)throw Error("VERSION_CHANGED");
  try{await window.CG50UsageFlush?.();}catch(_){}
  await activate(reg,worker,job.releaseId);
  await rpc(worker,{type:"COMMIT_FACTORY",cache:job.cache,token:job.token},30000);
  hint.textContent=text("文件核验完成，正在恢复初始状态…","Files verified. Restoring the initial state…");
  stopped=true;
  await window.CG50PrepareFactoryReset();
  try{await window.CG50UsageStop?.();}catch(_){}
  await rewrite("cg50-ipad-v1","files",{flash,state});
  restored=true;
  await rewrite("cg50-usage-v1","records",{});
  localStorage.clear();sessionStorage.clear();
  localStorage.setItem("cg50.last-announced-release",job.releaseId);
  sessionStorage.setItem(ACK,JSON.stringify({ok:true,version:job.version,releaseId:job.releaseId,at:Date.now()}));
  await rpc(worker,{type:"FINISH_FACTORY",token:job.token},10000);
  reloading=true;location.reload();
 }catch(e){
  console.warn("Factory reset",e);
  if(job&&worker)try{await rpc(worker,{type:"ABORT_FACTORY",cache:job.cache,token:job.token});}catch(_){}
  if(stopped){
   const result={ok:false,restored,version:job?.version,at:Date.now(),error:errorText(e)};
   try{sessionStorage.setItem(ACK,JSON.stringify(result));}catch(_){}
   reloading=true;location.reload();
  }else{
   dialog?.close();dialog?.remove();
   await notice(text("未恢复初始状态","Initial state was not restored"),errorText(e));
  }
 }finally{
  if(!reloading){
   try{dialog?.close();dialog?.remove();}
   finally{busy=false;window.CG50FactoryResetBusy=false;unlock();}
  }
 }
}
window.CG50ManualReload=reset;
function bindReloadButton(){
 const button=document.getElementById("cg50-reload-config");
 if(!button)return;
 button.onclick=async e=>{
  e.preventDefault();
  try{await reset();}catch(error){console.warn("Factory reset",error);}
 };
}
for(const type of ["keydown","keyup"])window.addEventListener(type,e=>{
 if(busy&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();}
},true);
function labels(){
 const button=document.getElementById("cg50-reload-config");
 if(button)button.textContent=text("重载配置文件","Reload configuration");
}
async function ack(){
 let result;
 try{result=JSON.parse(sessionStorage.getItem(ACK)||"null");sessionStorage.removeItem(ACK);}catch(_){}
 if(!result||Date.now()-result.at>10*60000)return;
 if(!result.ok){
  await notice(text("恢复未完成","Restore incomplete"),
   (result.restored?text("初始化存档已恢复，但后续清理未完成。","The initial snapshot was restored, but cleanup did not finish."):text("请刷新后重试。","Refresh and retry."))+" "+result.error);
  return;
 }
 let timer,listener;
 try{
  if(!window.CG50EmulatorReady||!window.CG50FirstFrameReady)throw Error("INTERFACE");
  await Promise.race([
   Promise.all([window.CG50EmulatorReady,window.CG50FirstFrameReady]),
   new Promise((_,reject)=>{
    timer=setTimeout(()=>reject(Error("TIMEOUT")),60000);
    listener=()=>reject(Error("INTERFACE"));
    window.addEventListener("cg50-core-fault",listener,{once:true});
    if(window.CG50CoreFault)listener();
   })
  ]);
  if(window.CG50Release.releaseId!==result.releaseId)throw Error("VERSION_CHANGED");
  await notice(text("已恢复初始状态","Initial state restored"),text(
   "初始化存档已恢复，当前版本 V "+result.version+"。",
   "The initial snapshot has been restored. Current version V "+result.version+"."
  ));
 }catch(e){await notice(text("启动未完成","Startup incomplete"),errorText(e));}
 finally{clearTimeout(timer);if(listener)window.removeEventListener("cg50-core-fault",listener);}
}
function install(){
 bindReloadButton();
 labels();
 new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 ack().catch(console.warn);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
