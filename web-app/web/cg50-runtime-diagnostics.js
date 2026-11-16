
(()=>{
"use strict";

function cleanSettingsHint(settings){
 const sentence="清除本机进度和设置，重新下载程序并恢复未初始化存档。操作前需要确认。";
 const walker=document.createTreeWalker(settings,NodeFilter.SHOW_TEXT);
 const matches=[];
 while(walker.nextNode()){
  if(walker.currentNode.data.trim()===sentence)matches.push(walker.currentNode);
 }
 for(const node of matches)node.data="";
}
function install(){
 const settings=document.getElementById("cg50-settings-dialog");
 if(!settings)return false;

 if(document.getElementById("cg50-diagnostic-button"))return true;
 const button=document.createElement("button");
 button.id="cg50-diagnostic-button";
 button.textContent="运行诊断";
 button.type="button";
 button.style.cssText="padding:10px 14px;border-radius:9px;"+
  "font:inherit;cursor:pointer;";
 const dialog=document.createElement("dialog");
 dialog.style.cssText="width:calc(100% - 32px);max-width:720px;"+
  "box-sizing:border-box;border:1px solid #8290a0;border-radius:14px;"+
  "padding:20px;background:#101923;color:#edf4fb;font:16px system-ui;";
 const title=document.createElement("h2");title.textContent="运行诊断";
 const hint=document.createElement("p");
 const output=document.createElement("textarea");
 output.readOnly=true;
 output.setAttribute("aria-label","运行诊断结果");
 output.style.cssText="width:100%;box-sizing:border-box;height:45vh;"+
  "background:#09111a;color:#edf4fb;border:1px solid #637c99;"+
  "padding:10px;font:12px monospace;";
 const actions=document.createElement("div");
 actions.style.cssText="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;";
 const copy=document.createElement("button");copy.textContent="复制诊断";
 const download=document.createElement("button");download.textContent="下载诊断";
 const close=document.createElement("button");close.textContent="关闭";
 for(const b of [copy,download,close]){
  b.type="button";
  b.style.cssText="padding:10px 16px;border-radius:8px;border:1px solid #637c99;"+
   "background:#1d3045;color:white;font:inherit;cursor:pointer;";
  actions.append(b);
 }
 dialog.append(title,hint,output,actions);
 const row=document.createElement("div");
 row.className="cg50-setting";row.id="cg50-diagnostic-setting";
 row.append(button);
 const footer=settings.querySelector("footer");
 if(footer)footer.before(row);else settings.append(row);
 document.body.append(dialog);
 let busy=false;
 button.onclick=async()=>{
  if(busy)return;
  busy=true;button.disabled=true;copy.disabled=true;download.disabled=true;
  output.value="";hint.textContent="正在读取运行状态，请稍候…";
  if(settings.open)settings.close();
  if(!dialog.open)dialog.showModal();
  try{
   if(typeof window.CG50RuntimeDiagnostic!=="function")
    throw Error("当前页面未加载诊断接口");
   const first=await window.CG50RuntimeDiagnostic();
   await new Promise(resolve=>setTimeout(resolve,500));
   const second=await window.CG50RuntimeDiagnostic();
   output.value=JSON.stringify({
    app:"CG50 Pro Max",version:window.CG50Release?.version,
    releaseId:window.CG50Release?.releaseId,
    userAgent:navigator.userAgent,
    samples:[first,second]
   },null,2);
   hint.textContent="请复制下面的诊断结果发给我。没有读取计算内容或存档。";
   copy.disabled=false;download.disabled=false;
  }catch(error){
   output.value=String(error);
   hint.textContent="诊断未完成，请把下面的提示发给我。";
   copy.disabled=false;
  }finally{busy=false;button.disabled=false;}
 };
 copy.onclick=async()=>{
  try{
   await navigator.clipboard.writeText(output.value);
   hint.textContent="诊断已复制，可以粘贴到聊天中。";
  }catch(_){
   output.focus();output.select();
   hint.textContent="请手动复制已选中的文字。";
  }
 };
 download.onclick=()=>{
  const url=URL.createObjectURL(new Blob([output.value],{type:"application/json"}));
  const a=document.createElement("a");
  a.href=url;a.download="CG50-Pro-Max-v1.2.0-diagnostic-"+Date.now()+".json";
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 close.onclick=()=>dialog.close();
 cleanSettingsHint(settings);
 const hintObserver=new MutationObserver(()=>cleanSettingsHint(settings));
 hintObserver.observe(settings,{
  childList:true,characterData:true,subtree:true
 });
 return true;
}
function start(){
 if(install())return;
 const observer=new MutationObserver(()=>{
  if(install())observer.disconnect();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();
