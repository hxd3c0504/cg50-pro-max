
"use strict";
const $=id=>document.getElementById(id);
let data=null,token="",epoch=0,editing=false,latestAnnouncement=null;
const controllers=new Set();
async function request(path,method="GET",body){
 const generation=epoch,secret=token;
 const abort=new AbortController();controllers.add(abort);
 const timer=setTimeout(()=>abort.abort(),20000);
 try{
  const response=await fetch(path,{
   method,headers:{Authorization:"Bearer "+secret,
    ...(body?{"Content-Type":"application/json"}:{})},
   ...(body?{body:JSON.stringify(body)}:{}),
   cache:"no-store",signal:abort.signal
  });
  const value=await response.json();
  if(generation!==epoch)throw Error("登录状态已改变");
  if(!response.ok)throw Error(value.error||"请求失败");
  return value;
 }finally{clearTimeout(timer);controllers.delete(abort);}
}
function draw(){
 const rows=data.days.slice(-Number($("range").value));
 const svg=$("chart");svg.replaceChildren();
 const ns="http://www.w3.org/2000/svg";
 function node(type,attrs={},text){
  const el=document.createElementNS(ns,type);
  for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));
  if(text!==undefined)el.textContent=text;
  svg.append(el);return el;
 }
 const top=20,bottom=250,left=60,right=875;
 const highest=Math.max(1,...rows.map(r=>r.sessions));
 const step=Math.max(1,Math.ceil(highest/4));
 const max=step*4;
 const x=i=>left+(right-left)*i/Math.max(1,rows.length-1);
 const y=n=>bottom-(bottom-top)*n/max;
 for(let n=0;n<=4;n++){
  const value=n*step,at=y(value);
  node("line",{x1:left,x2:right,y1:at,y2:at,stroke:"#31465b"});
  node("text",{x:left-12,y:at+5,fill:"#aabbcc","text-anchor":"end",
   "font-size":14},value);
 }
 node("polyline",{
  points:rows.map((r,i)=>x(i)+","+y(r.sessions)).join(" "),
  fill:"none",stroke:"#50aaff","stroke-width":3
 });
 for(let i=0;i<rows.length;i++){
  const r=rows[i],cx=x(i),cy=y(r.sessions);
  node("circle",{cx,cy,r:4,fill:"#50aaff"});
  const hit=node("circle",{cx,cy,r:12,fill:"transparent",
   tabindex:0,role:"button","aria-label":r.day+" 使用 "+r.sessions+" 次"});
  hit.style.cursor="pointer";
  const show=()=>$("chart-detail").textContent=r.day+"：使用 "+r.sessions+" 次";
  hit.addEventListener("click",show);hit.addEventListener("focus",show);
  hit.addEventListener("keydown",e=>{
   if(e.key==="Enter"||e.key===" "){e.preventDefault();show();}
  });
  if(i===0||i===rows.length-1||i===Math.floor((rows.length-1)/2)){
   node("text",{x:cx,y:280,fill:"#aabbcc","text-anchor":"middle",
    "font-size":14},r.day.slice(5));
  }
 }
 node("title",{},"每日使用次数："+rows.map(r=>r.day+" "+r.sessions+"次").join("，"));
}
function render(){
 $("today-sessions").textContent=(data.days.at(-1)?.sessions||0).toLocaleString();
 $("total-sessions").textContent=data.totalSessions.toLocaleString();
 $("seven-days").textContent=data.days.slice(-7)
  .reduce((n,d)=>n+d.sessions,0).toLocaleString();
 draw();
 $("status").textContent="统计截至："+new Date(data.updatedAt).toLocaleString(
  "zh-CN",{timeZone:"Asia/Shanghai"})+"（北京时间）";
 $("result").hidden=false;
}
function announcement(item){
 latestAnnouncement=item;
 $("announcement-state").textContent=item?.active
  ?"当前已发布："+item.title+" · "+new Date(item.publishedAt).toLocaleString(
   "zh-CN",{timeZone:"Asia/Shanghai"})
  :"当前没有已发布的公告。";
 $("withdraw").disabled=!item?.active;
}
function editorBusy(value){
 editing=value;$("publish").disabled=value;
 $("withdraw").disabled=value;
}
$("range").onchange=()=>{if(data)draw();};
$("login").onsubmit=async e=>{
 e.preventDefault();
 if(editing)return;
 epoch++;for(const c of controllers)c.abort();
 token=$("password").value.trim();
 const generation=epoch;
 $("refresh").disabled=true;$("result").hidden=true;
 $("status").textContent="正在读取统计…";
 try{
  data=await request("/api/stats");
  if(generation!==epoch)return;
  render();
  try{
   const result=await request("/api/admin/announcement");
   if(generation!==epoch)return;
   announcement(result.announcement);
   $("announcement-title").value=result.announcement?.title||"";
   $("announcement-content").value=result.announcement?.content||"";
   $("announcement-status").textContent="";
  }catch(error){
   if(generation===epoch)$("announcement-status").textContent="公告读取失败："+error.message;
  }
 }catch(error){
  if(generation===epoch){
   data=null;$("result").hidden=true;
   $("status").textContent="读取未完成："+error.message;
  }
 }finally{if(generation===epoch)$("refresh").disabled=false;}
};
$("logout").onclick=()=>{
 epoch++;for(const c of controllers)c.abort();
 token="";data=null;$("password").value="";
 $("result").hidden=true;$("refresh").disabled=false;
 $("preview-dialog").close();editorBusy(false);
 $("announcement-title").value="";$("announcement-content").value="";
 $("status").textContent="已退出管理页面。";
};
$("preview").onclick=()=>{
 $("preview-title").textContent=$("announcement-title").value.trim()||"公告标题";
 $("preview-content").textContent=$("announcement-content").value.trim()||"公告内容";
 if(!$("preview-dialog").open)$("preview-dialog").showModal();
};
$("preview-close").onclick=()=>$("preview-dialog").close();
$("announcement-form").onsubmit=async e=>{
 e.preventDefault();
 if(editing||!token)return;
 if(!confirm("发布这条公告？用户下次启动并联网时会收到。"))return;
 const generation=epoch;editorBusy(true);
 $("announcement-status").textContent="正在发布…";
 try{
  const result=await request("/api/admin/announcement","PUT",{
   title:$("announcement-title").value,content:$("announcement-content").value
  });
  if(generation!==epoch)return;
  announcement(result.announcement);
  $("announcement-status").textContent="公告发布成功。";
 }catch(error){
  if(generation===epoch)$("announcement-status").textContent="发布失败："+error.message;
 }finally{if(generation===epoch){editing=false;$("publish").disabled=false;announcement(latestAnnouncement);}}
};
$("withdraw").onclick=async()=>{
 if(editing||!token||!confirm("撤回当前公告？"))return;
 const generation=epoch;editorBusy(true);
 try{
  await request("/api/admin/announcement","DELETE");
  if(generation!==epoch)return;
  announcement(null);$("announcement-status").textContent="公告已撤回。";
 }catch(error){
  if(generation===epoch){
   $("announcement-status").textContent="撤回失败："+error.message;
   $("withdraw").disabled=false;
  }
 }finally{if(generation===epoch){editing=false;$("publish").disabled=false;announcement(latestAnnouncement);}}
};
