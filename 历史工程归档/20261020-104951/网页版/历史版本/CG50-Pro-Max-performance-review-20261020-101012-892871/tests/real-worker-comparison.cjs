
const {Worker}=require("node:worker_threads");
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wrapper=path.join(__dirname,"real-worker-host.cjs");

async function measure(web,label,checkRevised){
 const worker=new Worker(wrapper,{workerData:{web}});
 const pending=new Map();
 let id=0,fatal=null,closing=false;
 function fail(error){
  fatal=error;
  for(const p of pending.values()){
   clearTimeout(p.timer);p.reject(error);
  }
  pending.clear();
 }
 worker.on("error",fail);
 worker.on("exit",code=>{
  if(!closing)fail(Error("Worker exited unexpectedly: "+code));
 });
 worker.on("message",m=>{
  if(m.probeError||m.type==="fault"){
   fail(Error(m.probeError||m.error));return;
  }
  const p=pending.get(m.id);
  if(!p)return;
  pending.delete(m.id);clearTimeout(p.timer);
  m.error?p.reject(Error(m.error)):p.resolve(m.result);
 });
 function rpc(action,data={}){
  if(fatal)return Promise.reject(fatal);
  return new Promise((resolve,reject)=>{
   const request=++id;
   const timer=setTimeout(()=>{
    pending.delete(request);reject(Error("RPC timeout: "+action));
   },30000);
   pending.set(request,{resolve,reject,timer});
   worker.postMessage({id:request,action,...data});
  });
 }
 function bytes(name){
  const b=fs.readFileSync(path.join(web,name));
  return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
 }
 async function sample(){
  const diagnostic=await rpc("diagnostics");
  return {at:performance.now(),diagnostic};
 }
 function difference(a,b){
  const seconds=(b.at-a.at)/1000;
  const cycles=b.diagnostic.stats.cycles-a.diagnostic.stats.cycles;
  const executed=b.diagnostic.stats.executed-a.diagnostic.stats.executed;
  return {
   wallSeconds:Number(seconds.toFixed(3)),
   cyclesAdvanced:cycles,
   instructionsExecuted:executed,
   idleFraction:cycles?Number((1-executed/cycles).toFixed(6)):null,
   simulatedToWallRatio:Number((cycles/15000000/seconds).toFixed(4)),
   idleToWallRatio:Number(((cycles-executed)/15000000/seconds).toFixed(4)),
   running:b.diagnostic.running,
   paused:b.diagnostic.paused,
   lastError:b.diagnostic.lastError
  };
 }
 try{
  await rpc("boot",{
   flash:bytes("defaults/flash_full.bin"),
   state:bytes("defaults/cg50_state.bin"),
   visible:true,epoch:0,inputSpeed:4344863
  });
  await sleep(1000);
  const a=await sample();
  await sleep(8000);
  const b=await sample();
  const result=difference(a,b);
  console.log("\n【"+label+"：真实核心闲置】");
  console.log(JSON.stringify(result,null,2));
  assert.equal(result.running,true);
  assert.equal(result.lastError,"");
  assert.ok(result.cyclesAdvanced>0);

  if(checkRevised){
   assert.ok(result.idleToWallRatio<=1.08,
    "Revised idle time is still advancing too quickly");
   if(result.idleToWallRatio<.8)
    console.log("注意：闲置时间明显慢于实际时间，需要进一步检查。");

   await rpc("visibility",{visible:false,epoch:1});
   const p1=await sample();
   await sleep(500);
   const p2=await sample();
   assert.equal(p1.diagnostic.stats.cycles,p2.diagnostic.stats.cycles);
   console.log("PASS 修订版真实核心暂停期间不推进");

   await rpc("visibility",{visible:true,epoch:2});
   const r1=await sample();
   await sleep(1500);
   const r2=await sample();
   const resumed=difference(r1,r2);
   console.log("【修订版恢复前台】");
   console.log(JSON.stringify(resumed,null,2));
   assert.equal(resumed.running,true);
   assert.equal(resumed.paused,false);
   assert.equal(resumed.lastError,"");
   assert.ok(resumed.cyclesAdvanced>0);
   assert.ok(resumed.idleToWallRatio<=1.12,
    "Resuming replayed idle time too quickly");
  }
  return result;
 }finally{
  closing=true;
  for(const p of pending.values())clearTimeout(p.timer);
  pending.clear();
  await worker.terminate();
 }
}
(async()=>{
 // Sequential runs avoid CPU competition between the two versions.
 await measure(process.argv[2],"原版 1.2.1",false);
 await measure(process.argv[3],"性能修订版",true);
 console.log("\n真实核心对照完成，未发送保存或重置操作。");
 console.log("本项检查闲置计时和暂停恢复，不代表真实画图性能测试完成。");
})().catch(error=>{
 console.error(error.stack||String(error));
 process.exitCode=1;
});
