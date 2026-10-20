
(()=>{
if(!("serviceWorker" in navigator))return;
let registration,busy=false,checking=false,approved=false,needsReload=false;
let lastInput=Date.now(),firstController=!navigator.serviceWorker.controller;
const registered=navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});

function hide(){
 document.getElementById("cg50-update-notice")?.remove();
}
function notice(){
 const box=document.createElement("div");
 box.id="cg50-update-notice";
 box.textContent=document.documentElement.lang.startsWith("zh")
  ?"正在保存并更新…":"Saving and updating…";
 box.style.cssText="position:fixed;bottom:14px;right:14px;padding:10px 14px;"+
  "border-radius:10px;background:var(--cg-panel,#fff);"+
  "color:var(--cg-text,#172331);box-shadow:0 2px 18px #0003;"+
  "z-index:9999;font:14px system-ui";
 document.body.append(box);
}
for(const type of ["pointerdown","keydown","click"]){
 window.addEventListener(type,e=>{
  lastInput=Date.now();
  if(busy&&!e.metaKey&&!e.ctrlKey){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },true);
}
function safe(){
 return !document.hidden&&navigator.onLine!==false&&
  Date.now()-lastInput>=2500&&!document.querySelector("dialog[open]");
}
async function apply(manual=false){
 if(busy||checking){
  if(manual)throw Error("Please wait and try again");
  return;
 }
 if(!registration)return;
 if(!manual&&(!safe()||(!registration.waiting&&!needsReload)))return;

 checking=true;
 let online=false;
 if(navigator.onLine!==false){
  try{await registration.update();online=true;}catch(_){}
 }
 checking=false;
 if(!manual&&(!online||!safe()))return;
 const waiting=online?registration.waiting:null;
 if(!manual&&!waiting&&!needsReload)return;

 busy=true;approved=false;notice();
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  if(typeof releaseAll==="function")releaseAll();
  if(typeof chain!=="undefined")await chain;
  const response=await fetch("/save",{
   method:"POST",cache:"no-store",signal:controller.signal
  });
  if(!response.ok||(await response.text()).trim()!=="state saved")
   throw Error("Could not save progress");
  approved=true;
  if(needsReload||!waiting||waiting.state==="activated"){
   location.reload();return;
  }
  waiting.postMessage("ACTIVATE_UPDATE");
  setTimeout(()=>{
   if(busy){busy=false;approved=false;hide();}
  },15000);
 }catch(e){
  busy=false;approved=false;hide();
  if(manual)throw e;
  console.warn("Update postponed",e);
 }finally{clearTimeout(timeout);}
}
navigator.serviceWorker.addEventListener("controllerchange",()=>{
 if(firstController){firstController=false;return;}
 if(busy&&approved){location.reload();return;}
 needsReload=true;apply();
});
async function check(){
 if(!registration||navigator.onLine===false||document.hidden)return;
 try{await registration.update();await apply();}catch(_){}
}
window.CG50ManualReload=async()=>{
 registration=await registered;
 return apply(true);
};

function installButton(){
 const dialog=document.getElementById("cg50-settings-dialog");
 if(!dialog||document.getElementById("cg50-reload-config"))return;
 const row=document.createElement("div");
 row.className="cg50-setting";
 const button=document.createElement("button");
 button.id="cg50-reload-config";button.type="button";
 button.style.cssText="font:inherit;padding:10px 14px;border-radius:9px;cursor:pointer";
 const hint=document.createElement("p");
 row.append(button,hint);
 const footer=dialog.querySelector("footer");
 if(footer)footer.before(row);else dialog.append(row);
 const zh=()=>document.documentElement.lang.startsWith("zh");
 function labels(){
  button.textContent=zh()?"重载配置文件":"Reload configuration";
  hint.textContent=zh()
   ?"保存计算进度，重新读取界面和设置；联网时检查更新。"
   :"Save progress and reload the interface and settings. Check for updates when online.";
 }
 labels();
 new MutationObserver(labels).observe(document.documentElement,{
  attributes:true,attributeFilter:["lang"]
 });
 button.onclick=async()=>{
  button.disabled=true;
  try{
   dialog.close();
   await window.CG50ManualReload();
  }catch(e){
   hint.textContent=(zh()?"重载未完成：":"Reload failed: ")+e.message;
   if(!dialog.open)dialog.showModal();
  }finally{button.disabled=false;}
 };
}
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",installButton,{once:true});
else installButton();

registered.then(async reg=>{
 registration=reg;
 reg.addEventListener("updatefound",()=>{
  const worker=reg.installing;
  worker?.addEventListener("statechange",()=>{
   if(worker.state==="installed")apply();
  });
 });
 await check();
 setInterval(check,60000);
 setInterval(()=>apply(),3000);
 window.addEventListener("online",check);
 window.addEventListener("focus",check);
 document.addEventListener("visibilitychange",()=>{
  if(!document.hidden)check();
 });
}).catch(e=>console.warn("Automatic updates unavailable",e));
})();
