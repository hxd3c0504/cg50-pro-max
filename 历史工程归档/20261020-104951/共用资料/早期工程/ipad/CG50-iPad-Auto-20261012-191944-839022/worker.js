
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
function loop(){
  if(!running)return;
  try{
    const now=performance.now();
    for(const [token,v] of held){
      if(now-v.time>1800){
        held.delete(token);
        if(![...held.values()].some(x=>x.key===v.key))
          cg50NamedHold(v.key,false);
      }
    }
    const fault=cg50Step(50000);
    if(fault)throw Error(fault);
    if(now-lastFrame>50){
      lastFrame=now;
      const pixels=check(cg50Frame());
      postMessage({type:"frame",width,height,pixels},[pixels.buffer]);
    }
    setTimeout(loop,5);
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
      cg50SetSpeed(5000000);
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
      result=check(cg50Restore(new Uint8Array(m.state),Date.now()/1000));
    }else{
      throw Error("Unknown request");
    }
    postMessage({id:m.id,result});
  }).catch(e=>postMessage({id:m.id,error:String(e)}));
};
