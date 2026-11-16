
(()=>{
"use strict";
const zh=()=>document.documentElement.lang.toLowerCase().startsWith("zh");
const text=(a,b)=>zh()?a:b;

// 移动已有重载按钮，保留原确认、下载、重置和反馈流程。
function moveReload(){return true;}
function installMove(){
 if(moveReload())return;
 const observer=new MutationObserver(()=>{
  if(moveReload())observer.disconnect();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}

const seenKey="cg50.announcement-confirmed.v1";
let checked=false,busy=false,pending=null,shown=false,observer=null;
function seen(){
 try{return localStorage.getItem(seenKey)||"";}catch(_){return "";}
}
function valid(item){
 return item&&typeof item.id==="string"&&
 /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(item.id)&&
 typeof item.title==="string"&&item.title.length>0&&item.title.length<=80&&
 typeof item.content==="string"&&item.content.length>0&&item.content.length<=4000;
}
function show(){
 if(!pending||shown||document.hidden)return;
 if(document.querySelector("dialog[open]")){
  if(!observer){
   observer=new MutationObserver(show);
   observer.observe(document.body,{
    attributes:true,attributeFilter:["open"],childList:true,subtree:true
   });
  }
  return;
 }
 observer?.disconnect();observer=null;
 if(seen()===pending.id){pending=null;return;}
 shown=true;
 const item=pending;pending=null;
 const dialog=document.createElement("dialog");
 dialog.id="cg50-server-announcement";
 dialog.style.cssText="max-width:480px;width:calc(100% - 32px);"+
  "box-sizing:border-box;border:1px solid #8290a0;border-radius:16px;"+
  "padding:24px;background:var(--cg-panel,#101923);"+
  "color:var(--cg-text,#edf4fb);font:16px system-ui;";
 const title=document.createElement("h2");
 title.id="cg50-server-announcement-title";
 title.textContent=item.title;title.style.marginTop="0";
 dialog.setAttribute("aria-labelledby",title.id);
 const content=document.createElement("p");
 content.textContent=item.content;
 content.style.cssText="white-space:pre-wrap;overflow-wrap:anywhere;"+
  "line-height:1.7;max-height:55vh;overflow:auto;";
 const button=document.createElement("button");
 button.type="button";button.textContent=text("知道啦","Got it");
 button.style.cssText="padding:11px 22px;border:0;border-radius:9px;"+
  "background:#245fe0;color:white;font:inherit;cursor:pointer;";
 function acknowledge(){
  try{localStorage.setItem(seenKey,item.id);}catch(_){}
  dialog.close();dialog.remove();
 }
 button.addEventListener("click",acknowledge);
 dialog.addEventListener("cancel",e=>{e.preventDefault();acknowledge();});
 dialog.append(title,content,button);
 try{if(typeof releaseAll==="function")releaseAll();}catch(_){}
 document.body.append(dialog);
 dialog.showModal();button.focus();
}
async function check(){
 if(checked||busy||navigator.onLine===false)return;
 busy=true;
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch("/api/announcement",{
   cache:"no-store",signal:controller.signal
  });
  if(!response.ok)throw Error("Announcement unavailable");
  const result=await response.json();
  if(result.announcement!==null&&!valid(result.announcement))
   throw Error("Invalid announcement");
  checked=true;
  if(result.announcement&&seen()!==result.announcement.id){
   pending=result.announcement;show();
  }
 }catch(_){
  // 失败不阻止计算器；恢复联网时可补查，无定时轮询。
 }finally{clearTimeout(timer);busy=false;}
}
async function start(){
 installMove();
 if(window.CG50EmulatorReady)await window.CG50EmulatorReady;
 if(window.CG50FirstFrameReady)await window.CG50FirstFrameReady;
 window.addEventListener("online",check);
 document.addEventListener("visibilitychange",()=>{
  if(!document.hidden)show();
 });
 await check();
}
if(document.readyState==="loading"){
 document.addEventListener("DOMContentLoaded",()=>start().catch(()=>{}),{once:true});
}else start().catch(()=>{});
})();
