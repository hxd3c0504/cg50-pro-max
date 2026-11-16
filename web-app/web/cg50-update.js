
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

const release=window.CG50Release;
window.CG50ConnectionStatusManaged=true;
const zh=()=>!document.documentElement.lang.startsWith("en");
const text=(a,b)=>zh()?a:b;
let registration=null,busy=false,checking=false,approved=false,needsReload=false,ready=false;
let latest=null,network="checking",lastInput=Date.now();
let firstController=!navigator.serviceWorker?.controller,lastCheck=0;
const registered=("serviceWorker" in navigator)
 ?navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).catch(()=>null)
 :Promise.resolve(null);
function status(value){network=value;renderStatus();}
function renderStatus(){
 const el=document.getElementById("connection");if(!el)return;
 const labels={
  checking:text("检查更新中…","Checking updates…"),
  current:text("在线 · 已同步","Online · Up to date"),
  available:text("在线 · 有更新","Online · Update available"),
  offline:text("离线使用","Offline"),
  updating:text("在线 · 更新中…","Online · Updating…")
 };
 const value=labels[network]||labels.offline;
 if(el.textContent!==value)el.textContent=value;
 el.classList.toggle("online",["current","available","updating"].includes(network));
 el.title=text("当前版本 v","Current version v")+release.version;
}
function newer(meta){
 const a=meta.version.split(".").map(Number),b=release.version.split(".").map(Number);
 for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}
 return meta.releaseId!==release.releaseId;
}
async function handshake(){
 if(navigator.onLine===false){latest=null;status("offline");return null;}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
 try{
  const url=new URL("./version.json",location.href);
  url.searchParams.set("check",String(Date.now()));
  const response=await fetch(url.href,{cache:"no-store",signal:controller.signal});
  if(!response.ok)throw Error("Version check failed");
  const value=await response.json();
  if(value.app!=="CG50 Pro Max"||!(/^\d+\.\d+\.\d+$/).test(value.version)||
      typeof value.releaseId!=="string"||!value.releaseId)
   throw Error("Invalid version response");
  latest=value;status(newer(value)?"available":"current");return value;
 }catch(_){latest=null;status("offline");return null;}
 finally{clearTimeout(timer);}
}
function safe(){
 return ready&&!document.hidden&&Date.now()-lastInput>=2500&&
  !document.querySelector("dialog[open]");
}
function notice(show){
 document.getElementById("cg50-update-notice")?.remove();
 if(!show)return;
 const box=document.createElement("div");box.id="cg50-update-notice";
 box.textContent=text("正在保存进度并准备更新…","Saving progress and preparing the update…");
 box.style.cssText="position:fixed;bottom:14px;right:14px;padding:12px 16px;border-radius:10px;background:#245fe0;color:white;z-index:9999;font:14px system-ui";
 document.body.append(box);
}
function workerRelease(worker){
 return new Promise(resolve=>{
  const channel=new MessageChannel();
  const finish=value=>{clearTimeout(timer);channel.port1.close();resolve(value);};
  const timer=setTimeout(()=>finish(null),2000);
  channel.port1.onmessage=e=>finish(e.data);
  try{worker.postMessage("GET_RELEASE",[channel.port2]);}catch(_){finish(null);}
 });
}
async function waitForWorker(expected){
 const deadline=Date.now()+180000;
 while(Date.now()<deadline){
  const worker=registration?.waiting;
  if(worker){
   const meta=await workerRelease(worker);
   if(meta?.releaseId===expected)return worker;
  }
  if(!registration?.installing&&!registration?.waiting)
   throw Error(text("新版下载未完成，请稍后重试","Update download did not complete. Please retry."));
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error(text("新版下载超时，请稍后重试","Update download timed out. Please retry."));
}
async function save(){
 if(typeof window.CG50PauseForUpdate!=="function")
  throw Error("更新暂停接口尚未加载");
 await window.CG50PauseForUpdate();
 if(typeof releaseAll==="function")releaseAll();
 const controller=new AbortController();let timer;
 const job=(async()=>{
  if(typeof chain!=="undefined")await chain;
  const response=await fetch("/save",{
   method:"POST",cache:"no-store",signal:controller.signal
  });
  if(!response.ok||(await response.text()).trim()!=="state saved")
   throw Error(text("进度未能保存，已取消重载","Progress could not be saved. Reload cancelled."));
 })();
 try{
  await Promise.race([job,new Promise((_,reject)=>{
   timer=setTimeout(()=>{
    controller.abort();
    reject(Error(text("保存超时，已取消重载","Saving timed out. Reload cancelled.")));
   },15000);
  })]);
 }finally{clearTimeout(timer);}
}
function remember(kind,offline,expected){
 sessionStorage.setItem("cg50.reload-result.v1",
  JSON.stringify({kind,offline,expected,at:Date.now()}));
}
async function apply(manual=false){
 if(busy||checking){
  if(manual)throw Error(text("正在检查更新，请稍后再试","An update check is running. Please retry."));
  return;
 }
 registration=await registered;
 if(!ready){
  if(manual)throw Error(text("计算器还在启动，等一下再重载哦","The calculator is starting. Please wait."));
  return;
 }
 if(!manual&&(!safe()||(!registration?.waiting&&!needsReload)))return;
 const unlock=operations.acquire("update");
 if(!unlock){
  if(manual)throw Error(text("正在恢复初始状态，请稍后再试","A restore is in progress. Please retry later."));
  return;
 }
 let reloading=false;
 busy=true;approved=false;
 try{
  notice(true);
  const remote=await handshake();
  if(!manual&&(!remote||!safe()))return;
  let waiting=null;
  if(manual&&remote&&registration){
   await registration.update();
   if(newer(remote))waiting=await waitForWorker(remote.releaseId);
  }
  if(remote&&registration?.waiting){
   const meta=await workerRelease(registration.waiting);
   if(meta?.releaseId===remote.releaseId)waiting=registration.waiting;
  }
  if(!manual&&!waiting&&!needsReload)return;
  await save();
  remember(manual?"manual":"update",!remote,waiting?remote.releaseId:null);
  approved=true;
  if(waiting&&waiting.state!=="activated"){
   if(remote)status("updating");
   await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{
     navigator.serviceWorker.removeEventListener("controllerchange",changed);
     reject(Error(text("更新激活超时，请重试","Update activation timed out. Please retry.")));
    },20000);
    const changed=()=>{
     clearTimeout(timer);
     navigator.serviceWorker.removeEventListener("controllerchange",changed);
     resolve();
    };
    navigator.serviceWorker.addEventListener("controllerchange",changed);
    waiting.postMessage("ACTIVATE_UPDATE");
   });
  }
  reloading=true;
  location.reload();
 }catch(error){
  reloading=false;approved=false;
  try{sessionStorage.removeItem("cg50.reload-result.v1");}catch(_){}
  if(manual)throw error;
  console.warn("Update postponed",error);
 }finally{
  if(!reloading){
   try{
    await window.CG50ResumeAfterUpdate?.();
   }catch(error){
    console.warn("Update recovery not confirmed",error);
    if(window.CG50Notice){
     try{
      await window.CG50Notice({
       title:text("恢复运行未确认","Resume not confirmed"),
       body:error.message
      });
     }catch(_){}
    }
   }finally{
    busy=false;notice(false);unlock();
   }
  }
 }
}
async function check(force=false){
 if(operations.owner||busy||checking||document.hidden||
    (!force&&Date.now()-lastCheck<15000))return;
 checking=true;lastCheck=Date.now();
 try{
  const remote=await handshake();
  registration=await registered;
  if(remote&&registration)await registration.update();
 }catch(_){}finally{checking=false;}
 apply();
}
window.CG50UpdateService={check:()=>handshake(),getState:()=>network};
for(const type of ["pointerdown","keydown","click"]){
 window.addEventListener(type,e=>{
  lastInput=Date.now();
  if(busy&&!e.metaKey&&!e.ctrlKey){e.preventDefault();e.stopImmediatePropagation();}
 },true);
}
if("serviceWorker" in navigator)
 navigator.serviceWorker.addEventListener("controllerchange",()=>{
  if(firstController){firstController=false;return;}
  if(busy&&approved)return;
  needsReload=true;apply();
 });
function install(){
 renderStatus();
 new MutationObserver(renderStatus).observe(document.documentElement,{
  attributes:true,attributeFilter:["lang"]
 });
 Promise.all([window.CG50EmulatorReady,window.CG50FirstFrameReady])
  .then(()=>{ready=true;apply();}).catch(()=>{});
 check(true);setInterval(check,60000);setInterval(()=>apply(),3000);
 window.addEventListener("online",()=>check(true));
 window.addEventListener("offline",()=>{latest=null;status("offline");});
 window.addEventListener("focus",()=>check());
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)check();});
}
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
