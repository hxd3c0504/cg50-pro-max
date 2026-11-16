
(()=>{
"use strict";
const GAP=30*60000,TTL=30*86400000;
const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const day=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
const dbReady=new Promise((resolve,reject)=>{
  const r=indexedDB.open("cg50-usage-v1",1);
  r.onupgradeneeded=()=>r.result.createObjectStore("records");
  r.onsuccess=()=>resolve(r.result);
  r.onerror=()=>reject(r.error);
});
dbReady.catch(()=>{});
let latestAt=0,persistedAt=0,timer=0,sending=false,stopped=false;
const held=new Set(),fetchAPI=window.fetch.bind(window);

async function mutate(fn){
  if(stopped)throw Error("Usage stopped");
  const db=await dbReady;
  if(stopped)throw Error("Usage stopped");
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("records","readwrite");
    const store=tx.objectStore("records"),r=store.get("data");
    let result;
    r.onsuccess=()=>{
      try{
        const data=r.result||{};
        result=fn(data);store.put(data,"data");
      }catch(e){tx.abort();reject(e);}
    };
    tx.oncomplete=()=>resolve(result);
    tx.onabort=tx.onerror=()=>reject(
      tx.error||Error("Usage storage unavailable")
    );
  });
}
async function persist(){
  const at=latestAt;
  if(stopped||!at||at<=persistedAt)return;
  await mutate(s=>{
    if(typeof s.visitor!=="string"||!UUID.test(s.visitor)){
      s.visitor=crypto.randomUUID();
      s.lastAt=0;s.session="";s.day="";
    }
    if(at<s.lastAt&&s.lastAt-at<GAP)return;
    const fresh=!s.session||at-s.lastAt>=GAP||s.lastAt-at>=GAP;
    const today=day(at);
    if(fresh)s.session=crypto.randomUUID();
    s.queue=(Array.isArray(s.queue)?s.queue:[])
      .filter(e=>e.at>=at-TTL);
    if(fresh||s.day!==today)s.queue.push({
      id:crypto.randomUUID(),session:s.session,visitor:s.visitor,
      at,version:window.CG50Release.version
    });
    s.lastAt=fresh?at:Math.max(at,s.lastAt||0);
    s.day=today;s.queue=s.queue.slice(-200);
  });
  persistedAt=Math.max(persistedAt,at);
  setTimeout(()=>flush().catch(()=>{}),2000);
}
window.CG50UsageActivity=(action,data={})=>{
  if(stopped)return;
  if(action==="release"){held.clear();return;}
  if(action==="hold"){
    const token=String(data.token||"pointer");
    if(!data.down){held.delete(token);return;}
    if(held.has(token))return;
    held.add(token);
  }else if(action!=="key")return;
  latestAt=Date.now();
  if(!timer)timer=setTimeout(()=>{
    timer=0;persist().catch(()=>{});
  },!persistedAt||latestAt-persistedAt>=GAP?100:10000);
};
async function flush(){
  if(stopped||sending||navigator.onLine===false)return;
  sending=true;
  const abort=new AbortController();
  const timeout=setTimeout(()=>abort.abort(),12000);
  try{
    const batch=await mutate(s=>{
      s.queue=(Array.isArray(s.queue)?s.queue:[])
        .filter(e=>e.at>=Date.now()-TTL).slice(-200);
      return s.queue.slice(0,20);
    });
    if(!batch.length||stopped)return;
    const response=await fetchAPI("/api/usage",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({events:batch}),
      cache:"no-store",signal:abort.signal,keepalive:true
    });
    if(!response.ok)throw Error("Usage upload unavailable");
    const result=await response.json();
    if(!Array.isArray(result.accepted))throw Error("Invalid receipt");
    const sent=new Set(batch.map(e=>e.id));
    const accepted=new Set(result.accepted.filter(x=>sent.has(x)));
    await mutate(s=>{
      s.queue=(s.queue||[]).filter(e=>!accepted.has(e.id));
    });
  }finally{clearTimeout(timeout);sending=false;}
}
const interval=setInterval(()=>flush().catch(()=>{}),60000);
window.CG50UsageFlush=async()=>{await persist();await flush();};
window.CG50UsageStop=async()=>{
  stopped=true;held.clear();
  clearTimeout(timer);clearInterval(interval);
  const db=await dbReady;db.close();
};
window.addEventListener("online",()=>flush().catch(()=>{}));
document.addEventListener("visibilitychange",()=>{
  if(document.hidden)persist().then(()=>flush()).catch(()=>{});
});
setTimeout(()=>flush().catch(()=>{}),3000);
})();
