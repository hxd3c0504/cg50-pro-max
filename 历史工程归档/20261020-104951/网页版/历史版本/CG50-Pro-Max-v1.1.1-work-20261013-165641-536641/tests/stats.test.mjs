
import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {handle,day} from "../netlify/functions/stats.mjs";

const now=Date.UTC(2026,9,13,8);
const password="test-only-"+"x".repeat(40);

function store(){
  const records=new Map();
  return {
    records,
    async setJSON(key,value,options){
      if(options.onlyIfNew&&records.has(key))return {modified:false};
      records.set(key,value);return {modified:true};
    },
    async list({prefix}){
      return {blobs:[...records.keys()]
        .filter(k=>k.startsWith(prefix)).map(key=>({key}))};
    }
  };
}
const event=()=>({
  id:randomUUID(),visitor:randomUUID(),session:randomUUID(),
  at:now,version:"1.1.1"
});
function request(events,auth="",origin="https://test.netlify.app"){
  return new Request(
    "https://test.netlify.app/api/"+(events?"usage":"stats"),{
      method:events?"POST":"GET",
      headers:{Origin:origin,Authorization:auth},
      ...(events?{body:JSON.stringify({events})}:{})
    }
  );
}
const metrics=async(db,time=now)=>await(
  await handle(request(null,"Bearer "+password),db,password,time)
).json();

test("并发重复上报只计一次，同一访客再次使用不重复增加活跃访客",async()=>{
  const db=store(),e=event();
  const results=await Promise.all(Array.from({length:10},()=>
    handle(request([e]),db,password,now)));
  assert.ok(results.every(r=>r.status===200));
  let m=await metrics(db);
  assert.equal(m.totalSessions,1);
  assert.equal(m.totalVisitors,1);
  assert.equal(m.days.at(-1).users,1);
  await handle(request([{
    ...e,id:randomUUID(),session:randomUUID()
  }]),db,password,now);
  m=await metrics(db);
  assert.equal(m.totalSessions,2);
  assert.equal(m.days.at(-1).users,1);
});

test("跨日使用计入两个日期，同一会话累计次数不增加",async()=>{
  const db=store(),e=event();
  await handle(request([e]),db,password,now);
  await handle(request([{
    ...e,id:randomUUID(),at:now+86400000
  }]),db,password,now+86400000);
  const m=await metrics(db,now+86400000);
  assert.equal(m.totalSessions,1);
  assert.equal(m.days.at(-1).users,1);
  assert.equal(m.days.at(-2).users,1);
  assert.equal(day(Date.UTC(2026,9,13,16)),"2026-10-14");
});

test("无密码、错误密码、缺少后台密码都不能读取数据",async()=>{
  const db=store();
  assert.equal((await handle(request(null),db,password,now)).status,401);
  assert.equal((await handle(
    request(null,"Bearer wrong"),db,password,now)).status,401);
  assert.equal((await handle(
    request(null,"Bearer "+password),db,"",now)).status,503);
  assert.equal((await handle(
    request(null,"Bearer "+password),db,password,now)).status,200);
});

test("拒绝外站、超量、未来时间、过期时间及无效编号",async()=>{
  const db=store(),e=event();
  assert.equal((await handle(
    request([e],"","https://other.example"),db,password,now)).status,403);
  for(const bad of [
    {...e,id:"bad"},{...e,at:now+600000},
    {...e,at:now-32*86400000}
  ]){
    assert.equal((await handle(
      request([bad]),db,password,now)).status,400);
  }
  assert.equal((await handle(
    request(Array(21).fill(e)),db,password,now)).status,400);
  assert.equal(db.records.size,0);
});

test("部分写入失败后可重试，累计计数不会重复",async()=>{
  const db=store(),e=event(),original=db.setJSON;
  let failed=false;
  db.setJSON=async(...args)=>{
    if(!failed&&args[0].startsWith("visitors/")){
      failed=true;throw Error("test interruption");
    }
    return original(...args);
  };
  assert.equal((await handle(request([e]),db,password,now)).status,503);
  assert.equal((await handle(request([e]),db,password,now)).status,200);
  const m=await metrics(db);
  assert.equal(m.totalSessions,1);
  assert.equal(m.totalVisitors,1);
  assert.equal(m.days.at(-1).users,1);
});
