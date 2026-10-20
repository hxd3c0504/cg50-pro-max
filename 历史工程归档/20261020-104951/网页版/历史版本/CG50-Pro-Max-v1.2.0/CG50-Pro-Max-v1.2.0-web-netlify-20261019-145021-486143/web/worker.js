
importScripts("./wasm_exec.js");
let running=false,paused=false,width=0,height=0,lastFrame=0;
let lastGeneration=-1,lastError="",loops=0,lastLoop=0;
let scheduled=false,timer=null,ticket=0,inputEpoch=0;
let frameRequested=true,inputRefreshUntil=0;
let inputSpeed=5000000,busyWork=0,busyMillis=0,batch=50000;
const held=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function check(x){if(x&&x.error)throw Error(x.error);return x;}

function cancelScheduled(){
 ticket++;scheduled=false;
 if(timer!==null)clearTimeout(timer);
 timer=null;
}
function fail(error){
 lastError=String(error);running=false;cancelScheduled();
 postMessage({type:"fault",error:lastError});
}
const ready=(async()=>{
 const go=new Go();
 const r=await fetch("./cg50.wasm");
 if(!r.ok)throw Error("Core download failed");
 const {instance}=await WebAssembly.instantiate(
  await r.arrayBuffer(),go.importObject);
 go.run(instance).then(()=>fail("Emulator runtime exited"),fail);
 for(let i=0;i<1000&&!self.cg50CoreReady;i++)await sleep(10);
 if(!self.cg50CoreReady)throw Error("Core startup timed out");
})();
const dispatch=new MessageChannel();
dispatch.port1.onmessage=({data})=>wake(data);
function wake(id){
 if(id!==ticket||!scheduled)return;
 scheduled=false;timer=null;loop();
}
function schedule(delay=0){
 if(!running||paused||scheduled)return;
 scheduled=true;const id=++ticket;
 if(delay>0)timer=setTimeout(()=>wake(id),delay);
 else dispatch.port2.postMessage(id);
}
function release(){
 held.clear();cg50ReleaseKeys();
}
function requestFrame(){
 frameRequested=true;
 inputRefreshUntil=performance.now()+500;
}
function frame(force=false,stats=null){
 const now=performance.now();
 if(!force&&now-lastFrame<33)return;
 const s=stats||check(cg50Stats());
 if(!force&&!frameRequested&&now>=inputRefreshUntil&&
    s.generation===lastGeneration&&now-lastFrame<1000)return;
 const pixels=check(cg50Frame());
 lastFrame=now;lastGeneration=s.generation;frameRequested=false;
 postMessage({type:"frame",width,height,pixels},[pixels.buffer]);
}
function loop(){
 if(!running||paused)return;
 try{
  const start=performance.now();
  for(const [token,v]of held){
   if(start-v.time>1800){
    held.delete(token);
    if(![...held.values()].some(x=>x.key===v.key))
     cg50NamedHold(v.key,false);
   }
  }
  const before=check(cg50Stats());
  let calls=0;
  do{
   const at=performance.now();
   const fault=cg50Step(batch);
   if(fault)throw Error(fault);
   const spent=Math.max(.1,performance.now()-at);
   batch=Math.max(5000,Math.min(200000,Math.round(batch*2/spent)));
   calls++;
  }while(performance.now()-start<8&&calls<24);
  const after=check(cg50Stats());
  const now=performance.now();
  loops++;lastLoop=now;
  frame(false,after);
  const cycles=after.cycles-before.cycles;
  const executed=after.executed-before.executed;
  if(cycles>0&&executed/cycles>.75){
   busyWork+=executed;busyMillis+=now-start;
   if(busyMillis>=120){
    inputSpeed=Math.max(100000,Math.min(150000000,
     Math.round(busyWork*1000/busyMillis*.85)));
    check(cg50SetInputSpeed(inputSpeed));
    postMessage({type:"input-speed",value:inputSpeed});
    busyWork=0;busyMillis=0;
   }
  }
  const idle=cycles>0&&executed/cycles<.05;
  const delay=idle?Math.min(16,Math.max(1,
   cycles/(inputSpeed/1000)-(performance.now()-start))):0;
  schedule(delay);
 }catch(error){fail(error);}
}
function requireRunning(){
 if(lastError)throw Error(lastError);
 if(!running)throw Error("Calculator is not running");
}
function diagnostics(){
 const pixels=width&&height?check(cg50Frame()):null;
 let litPixels=0;
 if(pixels)for(let i=0;i<pixels.length;i+=4)
  if(pixels[i]||pixels[i+1]||pixels[i+2])litPixels++;
 return {
  running,paused,scheduled,loops,lastError,
  millisecondsSinceLoop:loops?Math.round(performance.now()-lastLoop):null,
  heldKeys:held.size,inputSpeed,batch,litPixels,
  stats:width?check(cg50Stats()):null
 };
}
let chain=Promise.resolve();
onmessage=({data:m})=>{
 chain=chain.then(async()=>{
  await ready;
  let result=true;
  if(m.action==="diagnostics"){
   result=diagnostics();
  }else if(m.action==="boot"){
   if(width)throw Error("Already started");
   const size=check(cg50Boot(
    new Uint8Array(m.flash),new Uint8Array(m.state),Date.now()/1000));
   width=size.width;height=size.height;
   cg50SetSpeed(15000000);
   const cached=Number(m.inputSpeed);
   inputSpeed=Number.isFinite(cached)&&cached>=100000&&cached<=150000000
    ?cached:5000000;
   check(cg50SetInputSpeed(inputSpeed));
   inputEpoch=Number.isSafeInteger(m.epoch)?m.epoch:0;
   paused=m.visible===false;running=true;requestFrame();
   frame(true);
   if(!paused)schedule();
   result=size;
  }else if(m.action==="visibility"){
   cancelScheduled();
   paused=!m.visible;
   if(Number.isSafeInteger(m.epoch))inputEpoch=m.epoch;
   release();busyWork=0;busyMillis=0;batch=50000;
   requestFrame();
   if(!paused&&running&&!lastError){frame(true);schedule();}
   result={running,paused,error:lastError||null};
  }else{
   requireRunning();
   if(m.action==="key"||m.action==="hold"){
    if(paused||(Number.isSafeInteger(m.epoch)&&m.epoch!==inputEpoch))
     throw Error("Input belongs to an inactive page");
    if(m.action==="key"){
     if(!cg50Tap(m.key))throw Error("Unknown key: "+m.key);
    }else if(m.down){
     if(!held.has(m.token)&&!cg50NamedHold(m.key,true))
      throw Error("Unknown key: "+m.key);
     held.set(m.token,{key:m.key,time:performance.now()});
    }else{
     const v=held.get(m.token);held.delete(m.token);
     if(v&&![...held.values()].some(x=>x.key===v.key))
      cg50NamedHold(v.key,false);
    }
    requestFrame();schedule();
   }else if(m.action==="release"){
    release();
   }else if(m.action==="save"){
    result=check(cg50Save());
   }else if(m.action==="load"){
    release();
    result=check(cg50Restore(new Uint8Array(m.state),Date.now()/1000));
    lastGeneration=-1;requestFrame();
    if(!paused){frame(true);schedule();}
   }else throw Error("Unknown request");
  }
  postMessage({id:m.id,result});
 }).catch(error=>postMessage({id:m.id,error:String(error)}));
 return chain;
};
