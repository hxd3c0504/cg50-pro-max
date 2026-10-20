
import {getStore} from "@netlify/blobs";
import {createHash,timingSafeEqual} from "node:crypto";

const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const DAY=86400000;
export const day=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
const json=(value,status=200)=>Response.json(value,{
  status,headers:{
    "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff"
  }
});

function authorized(req,password){
  if(!password||password.length<24)return false;
  const supplied=req.headers.get("Authorization")||"";
  const hash=s=>createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(supplied),hash("Bearer "+password));
}

export async function handle(req,store,password,now=Date.now()){
  const path=new URL(req.url).pathname;
  try{
    if(path==="/api/usage"&&req.method==="POST"){
      if(req.headers.get("Origin")!==new URL(req.url).origin)
        return json({error:"Origin denied"},403);
      const body=await req.text();
      if(body.length>20000)return json({error:"Payload too large"},413);

      let batch;
      try{batch=JSON.parse(body).events;}
      catch(_){return json({error:"Invalid JSON"},400);}

      if(!Array.isArray(batch)||batch.length<1||batch.length>20)
        return json({error:"Invalid batch"},400);

      if(batch.some(e=>!e||
        ![e.id,e.session,e.visitor].every(v=>
          typeof v==="string"&&UUID.test(v))||
        !Number.isSafeInteger(e.at)||e.at<now-31*DAY||
        e.at>now+300000||typeof e.version!=="string"||
        !/^\d+\.\d+\.\d+$/.test(e.version)))
        return json({error:"Invalid event"},400);

      for(const e of batch){
        const d=day(e.at);
        await Promise.all([
          store.setJSON("sessions/"+e.session,
            {at:e.at,version:e.version},{onlyIfNew:true}),
          store.setJSON("visitors/"+e.visitor,{},{onlyIfNew:true}),
          store.setJSON("daily-visitors/"+d+"/"+e.visitor,
            {},{onlyIfNew:true}),
          store.setJSON("daily-sessions/"+d+"/"+e.session,
            {},{onlyIfNew:true})
        ]);
      }
      return json({accepted:batch.map(e=>e.id)});
    }

    if(path==="/api/stats"&&req.method==="GET"){
      if(!password||password.length<24)
        return json({error:"统计管理密码尚未配置"},503);
      if(!authorized(req,password))
        return json({error:"管理密码不正确"},401);

      const results=await Promise.all([
        "sessions/","visitors/","daily-visitors/","daily-sessions/"
      ].map(prefix=>store.list({prefix})));

      const days=new Map();
      for(let n=29;n>=0;n--){
        const d=day(now-n*DAY);
        days.set(d,{day:d,users:0,sessions:0});
      }
      for(const b of results[2].blobs){
        const row=days.get(b.key.split("/")[1]);
        if(row)row.users++;
      }
      for(const b of results[3].blobs){
        const row=days.get(b.key.split("/")[1]);
        if(row)row.sessions++;
      }
      return json({
        totalSessions:results[0].blobs.length,
        totalVisitors:results[1].blobs.length,
        days:[...days.values()],
        timezone:"Asia/Shanghai",
        updatedAt:now
      });
    }
    return json({error:"Not found"},404);
  }catch(_){
    return json({error:"统计服务暂时不可用，请稍后重试"},503);
  }
}

export default req=>handle(
  req,
  getStore({name:"cg50-usage-v1",consistency:"strong"}),
  process.env.CG50_STATS_PASSWORD
);

export const config={
  path:["/api/usage","/api/stats"],
  rateLimit:{
    action:"rate_limit",aggregateBy:"ip",
    windowSize:60,windowLimit:120
  }
};
