
import {getStore} from "@netlify/blobs";
import {createHash,timingSafeEqual,randomUUID} from "node:crypto";

const reply=(value,status=200)=>Response.json(value,{
 status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
});
function authorized(req,password){
 if(!password||password.length<24)return false;
 const hash=s=>createHash("sha256").update(s).digest();
 return timingSafeEqual(
  hash(req.headers.get("Authorization")||""),hash("Bearer "+password));
}
export async function handle(req,store,password,now=Date.now()){
 const url=new URL(req.url);
 try{
  if(url.pathname==="/api/announcement"&&req.method==="GET"){
   const item=await store.get("current",{type:"json"});
   return reply({announcement:item?.active?{
    id:item.id,title:item.title,content:item.content,publishedAt:item.publishedAt
   }:null});
  }
  if(url.pathname!=="/api/admin/announcement")
   return reply({error:"Not found"},404);
  if(!password||password.length<24)
   return reply({error:"管理密码尚未配置"},503);
  if(!authorized(req,password))
   return reply({error:"管理密码不正确"},401);
  if(req.method==="GET")
   return reply({announcement:await store.get("current",{type:"json"})});
  if(!["PUT","DELETE"].includes(req.method))
   return reply({error:"Method not allowed"},405);
  if(req.headers.get("Origin")!==url.origin)
   return reply({error:"Origin denied"},403);
  if(req.method==="DELETE"){
   await store.setJSON("current",{active:false,updatedAt:now});
   return reply({ok:true,announcement:null});
  }
  const text=await req.text();
  if(text.length>20000)return reply({error:"公告内容过长"},413);
  let data;
  try{data=JSON.parse(text);}catch(_){return reply({error:"格式不正确"},400);}
  if(typeof data.title!=="string"||typeof data.content!=="string")
   return reply({error:"请填写标题和内容"},400);
  const title=data.title.trim(),content=data.content.trim();
  if(!title||title.length>80||!content||content.length>4000)
   return reply({error:"标题限 80 字，内容限 4000 字，均不能为空"},400);
  const item={id:randomUUID(),title,content,active:true,publishedAt:now};
  await store.setJSON("current",item);
  return reply({ok:true,announcement:item});
 }catch(_){
  return reply({error:"公告服务暂时不可用，请稍后重试"},503);
 }
}
export default req=>handle(req,
 getStore({name:"cg50-announcements-v1",consistency:"strong"}),
 process.env.CG50_STATS_PASSWORD);
export const config={
 path:["/api/announcement","/api/admin/announcement"],
 rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:120}
};
