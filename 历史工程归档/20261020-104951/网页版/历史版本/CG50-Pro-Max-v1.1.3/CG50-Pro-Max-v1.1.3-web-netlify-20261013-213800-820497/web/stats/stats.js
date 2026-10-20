
const $=id=>document.getElementById(id);
let data=null;
function render(){
  const rows=data.days.slice(-Number($("range").value));
  $("today-sessions").textContent=data.days.at(-1).sessions.toLocaleString();
  $("today-users").textContent=data.days.at(-1).users.toLocaleString();
  $("total-sessions").textContent=data.totalSessions.toLocaleString();
  $("total-users").textContent=data.totalVisitors.toLocaleString();
  $("seven-days").textContent=data.days.slice(-7)
    .reduce((n,d)=>n+d.sessions,0).toLocaleString();

  const max=Math.max(1,...rows.map(d=>d.sessions));
  $("rows").replaceChildren();
  for(const r of [...rows].reverse()){
    const tr=document.createElement("tr");
    for(const value of [r.day,r.sessions,r.users]){
      const td=document.createElement("td");
      td.textContent=String(value);tr.append(td);
    }
    const td=document.createElement("td");
    const bar=document.createElement("progress");
    bar.max=max;bar.value=r.sessions;
    bar.setAttribute("aria-label",r.day+" 使用 "+r.sessions+" 次");
    td.append(bar);tr.append(td);$("rows").append(tr);
  }
  $("status").textContent="统计截至："+
    new Date(data.updatedAt).toLocaleString("zh-CN",{
      timeZone:"Asia/Shanghai"
    })+"（北京时间）";
  $("result").hidden=false;
}
$("range").onchange=()=>{if(data)render();};
$("login").onsubmit=async e=>{
  e.preventDefault();$("refresh").disabled=true;
  $("status").textContent="正在读取统计…";
  const abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),20000);
  try{
    const response=await fetch("/api/stats",{
      headers:{Authorization:"Bearer "+$("password").value.trim()},
      cache:"no-store",signal:abort.signal
    });
    const result=await response.json();
    if(!response.ok)throw Error(result.error||"读取失败");
    data=result;render();
  }catch(error){
    $("result").hidden=true;
    $("status").textContent="读取未完成："+error.message;
  }finally{
    clearTimeout(timer);$("refresh").disabled=false;
  }
};
$("logout").onclick=()=>{
  data=null;$("password").value="";
  $("result").hidden=true;
  $("status").textContent="已退出统计页面。";
};
