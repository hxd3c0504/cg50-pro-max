window.CG50Release={"app": "CG50 Pro Max", "version": "1.2.2", "releaseId": "v1.2.2-20261020-100118-047440", "graphicsAcceleration": true, "notesZh": ["修复闲置计时过快，优化存档、按键和更新流程。"], "notesEn": ["Fixed accelerated idle timing and improved saving, input, and updates."], "fullRefresh": true, "preserveProgress": true};
window.CG50ConnectionStatusManaged=true;

(()=>{
"use strict";
const release=window.CG50Release;
const zh=()=>!document.documentElement.lang.startsWith("en");
const text=(a,b)=>zh()?a:b;
const seenKey="cg50.last-announced-release";
let notices=Promise.resolve(),consumed=new Set();
window.CG50Notice=options=>{
 notices=notices.catch(()=>{}).then(()=>new Promise(resolve=>{
  const show=()=>{
   if(!document.body){setTimeout(show,100);return;}
   if(!options.force&&document.querySelector("dialog[open]")){
    setTimeout(show,200);return;
   }
   const dialog=document.createElement("dialog");
   dialog.id="cg50-feedback-dialog";
   dialog.style.cssText="max-width:430px;width:calc(100% - 40px);box-sizing:border-box;border:1px solid #879bb3;border-radius:16px;padding:24px;font:16px/1.6 -apple-system,sans-serif;";
   const style=getComputedStyle(document.body);
   dialog.style.background=style.backgroundColor;dialog.style.color=style.color;
   const title=document.createElement("h2");
   title.style.cssText="font-size:22px;margin:0 0 12px";
   title.textContent=options.title;
   const body=document.createElement("p");body.textContent=options.body||"";
   dialog.append(title,body);
   if(options.items?.length){
    const list=document.createElement("ul");
    for(const item of options.items){
     const li=document.createElement("li");li.textContent=item;list.append(li);
    }
    dialog.append(list);
   }
   const close=document.createElement("button");
   close.type="button";close.textContent=text("知道啦","Got it");
   close.style.cssText="font:inherit;border:0;border-radius:10px;background:#245fe0;color:white;padding:10px 20px;cursor:pointer";
   close.onclick=()=>dialog.close();dialog.append(close);document.body.append(dialog);
   dialog.addEventListener("close",()=>{dialog.remove();resolve();},{once:true});
   if(typeof releaseAll==="function")releaseAll();
   dialog.showModal();close.focus();
  };
  show();
 }));
 return notices;
};
window.addEventListener("keydown",e=>{
 const dialog=document.getElementById("cg50-feedback-dialog");
 if(!dialog?.open||e.metaKey||e.ctrlKey)return;
 consumed.add(e.code);e.preventDefault();e.stopImmediatePropagation();
 if(!e.repeat&&["Escape","Enter"," "].includes(e.key))dialog.close();
},true);
window.addEventListener("keyup",e=>{
 if(consumed.delete(e.code)||document.getElementById("cg50-feedback-dialog")?.open){
  e.preventDefault();e.stopImmediatePropagation();
 }
},true);
window.CG50ShowRelease=async(force=false,extra="")=>{
 let seen=null;try{seen=localStorage.getItem(seenKey);}catch(_){}
 if(!force&&seen===release.releaseId&&!extra)return;
 const changed=seen!==release.releaseId;
 await window.CG50Notice({
  title:extra?text("重载成功啦","Reload successful"):text("新版已就位啦！","Update ready!"),
  body:extra||text("当前版本：v","Current version: v")+release.version,
  items:force||changed?(zh()?release.notesZh:release.notesEn):[]
 });
 try{localStorage.setItem(seenKey,release.releaseId);}catch(_){}
};
function install(){
 document.addEventListener("pointerdown",e=>{
  if(!e.isTrusted||!["touch","pen"].includes(e.pointerType))return;
  const button=e.target.closest?.("button");
  if(!button||button.disabled)return;
  try{if(typeof navigator.vibrate==="function")navigator.vibrate(10);}catch(_){}
  button.classList.add("cg50-touch-feedback");
  setTimeout(()=>button.classList.remove("cg50-touch-feedback"),100);
 },{capture:true,passive:true});
 const css=document.createElement("style");
 css.textContent=".cg50-touch-feedback{outline:2px solid #67adff!important;outline-offset:-2px}";
 document.head.append(css);
 const settings=document.getElementById("cg50-settings-dialog");
 if(settings){
  const row=document.createElement("p");row.id="cg50-current-version";
  const button=document.createElement("button");
  button.type="button";button.id="cg50-release-notes";
  const labels=()=>{
   row.textContent=text("版本：v","Version: v")+release.version;
   button.textContent=text("查看更新说明","Release notes");
  };
  labels();settings.append(row,button);
  new MutationObserver(labels).observe(document.documentElement,{
   attributes:true,attributeFilter:["lang"]
  });
  button.onclick=()=>{settings.close();window.CG50ShowRelease(true);};
 }
 startup();
}
async function startup(){
 let pending=null;
 try{pending=JSON.parse(sessionStorage.getItem("cg50.reload-result.v1")||"null");}catch(_){}
 if(pending&&Date.now()-pending.at>600000){
  sessionStorage.removeItem("cg50.reload-result.v1");pending=null;
 }
 let timer,onFault;
 try{
  const fault=new Promise((_,reject)=>{
   onFault=e=>reject(Error(e.detail||"Core startup failed"));
   window.addEventListener("cg50-core-fault",onFault,{once:true});
  });
  if(window.CG50CoreFault)throw Error(window.CG50CoreFault);
  const ready=Promise.all([window.CG50EmulatorReady,window.CG50FirstFrameReady]);
  if(pending){
   const timeout=new Promise((_,reject)=>{
    timer=setTimeout(()=>reject(Error(text("核心启动超时","Core startup timed out"))),60000);
   });
   await Promise.race([ready,fault,timeout]);
  }else await Promise.race([ready,fault]);
  if(pending)sessionStorage.removeItem("cg50.reload-result.v1");
  if(pending?.kind==="manual"){
   if(pending.expected&&pending.expected!==release.releaseId)
    throw Error(text("新版尚未载入，当前仍为 v","The update has not loaded. Current version: v")+release.version);
   const extra=text("配置文件已重载，当前版本 v","Configuration reloaded. Current version v")+release.version+
    (pending.offline?text("（使用离线缓存）"," (using offline cache)"):"");
   await window.CG50ShowRelease(false,extra);
  }else await window.CG50ShowRelease();
 }catch(error){
  if(pending){
   sessionStorage.removeItem("cg50.reload-result.v1");
   window.CG50Notice({force:true,title:text("重载没完成哦","Reload failed"),body:error.message});
  }
 }finally{
  clearTimeout(timer);
  if(onFault)window.removeEventListener("cg50-core-fault",onFault);
 }
}
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
