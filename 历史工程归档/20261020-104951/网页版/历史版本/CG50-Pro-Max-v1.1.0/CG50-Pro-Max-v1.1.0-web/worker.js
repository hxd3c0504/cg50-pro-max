
importScripts("./wasm_exec.js");
let running=false, width=0, height=0, lastFrame=0;
const held=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function check(x){if(x&&x.error)throw Error(x.error);return x;}
const ready=(async()=>{
  const go=new Go();
  const r=await fetch("./cg50.wasm");
  if(!r.ok)throw Error("Core download failed");
  const {instance}=await WebAssembly.instantiate(
    await r.arrayBuffer(),go.importObject);
  go.run(instance).catch(e=>{
    running=false;postMessage({type:"fault",error:String(e)});
  });
  for(let i=0;i<1000&&!self.cg50CoreReady;i++)await sleep(10);
  if(!self.cg50CoreReady)throw Error("Core startup timed out");
})();
function release(){
  held.clear();cg50ReleaseKeys();
}


// V100 INPUT CALIBRATION
let inputSpeed=5000000, busyWork=0, busyMillis=0;
let batch=50000, lastGeneration=-1;
const dispatch=new MessageChannel();
dispatch.port1.onmessage=()=>loop();
function loop(){
  if(!running)return;
  try{
    const start=performance.now();
    for(const [token,v] of held){
      if(start-v.time>1800){
        held.delete(token);
        if(![...held.values()].some(x=>x.key===v.key))
          cg50NamedHold(v.key,false);
      }
    }
    const before=check(cg50Stats());
    let calls=0;
    do {
      const at=performance.now();
      const fault=cg50Step(batch);
      if(fault)throw Error(fault);
      const spent=Math.max(.1,performance.now()-at);
      batch=Math.max(5000,Math.min(200000,Math.round(batch*2/spent)));
      calls++;
    } while(performance.now()-start<8 && calls<24);
    const after=check(cg50Stats());
    const now=performance.now();
    if(now-lastFrame>=33 && after.generation!==lastGeneration){
      lastFrame=now;lastGeneration=after.generation;
      const pixels=check(cg50Frame());
      postMessage({type:"frame",width,height,pixels},[pixels.buffer]);
    }
    const cycles=after.cycles-before.cycles;
    const executed=after.executed-before.executed;
    
if(cycles>0 && executed/cycles>.75){
      busyWork+=executed;busyMillis+=now-start;
      if(busyMillis>=120){
        const measured=Math.max(100000,Math.min(150000000,
          Math.round(busyWork*1000/busyMillis*.85)));
        inputSpeed=measured;
        check(cg50SetInputSpeed(inputSpeed));
        postMessage({type:"input-speed",value:inputSpeed});
        busyWork=0;busyMillis=0;
      }
    }
    const idle=cycles>0 && executed/cycles<.05;
    const delay=idle
      ? Math.min(16,Math.max(1,cycles/(inputSpeed/1000)-(performance.now()-start)))
      : 0;
    if(delay) setTimeout(loop,delay);
    else dispatch.port2.postMessage(null);
  }catch(e){
    running=false;
    postMessage({type:"fault",error:String(e)});
  }
}
let chain=Promise.resolve();
onmessage=({data:m})=>{
  chain=chain.then(async()=>{
    await ready;
    let result=true;
    if(m.action==="boot"){
      if(running)throw Error("Already started");
      const size=check(cg50Boot(
        new Uint8Array(m.flash),new Uint8Array(m.state),Date.now()/1000));
      width=size.width;height=size.height;
      
cg50SetSpeed(15000000);
        const cached=Number(m.inputSpeed);
        inputSpeed=Number.isFinite(cached)&&cached>=100000&&cached<=150000000
          ?cached:5000000;
        check(cg50SetInputSpeed(inputSpeed));
      running=true;loop();result=size;
    }else if(m.action==="key"){
      if(!cg50Tap(m.key))throw Error("Unknown key: "+m.key);
    }else if(m.action==="hold"){
      if(m.down){
        if(!held.has(m.token)){
          if(!cg50NamedHold(m.key,true))throw Error("Unknown key: "+m.key);
        }
        held.set(m.token,{key:m.key,time:performance.now()});
      }else{
        const v=held.get(m.token);
        held.delete(m.token);
        if(v&&![...held.values()].some(x=>x.key===v.key))
          cg50NamedHold(v.key,false);
      }
    }else if(m.action==="release"){
      release();
    }else if(m.action==="save"){
      result=check(cg50Save());
    }else if(m.action==="load"){
      release();
      lastGeneration=-1;result=check(cg50Restore(new Uint8Array(m.state),Date.now()/1000));
    }else{
      throw Error("Unknown request");
    }
    postMessage({id:m.id,result});
  }).catch(e=>postMessage({id:m.id,error:String(e)}));
};
