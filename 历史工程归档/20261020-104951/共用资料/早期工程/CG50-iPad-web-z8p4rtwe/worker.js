
importScripts("./wasm_exec.js");
let running=false, width=0, height=0, lastFrame=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ready=(async()=>{
  const go=new Go();
  const response=await fetch("./cg50.wasm");
  if(!response.ok)throw Error("Cannot load emulator core");
  const {instance}=await WebAssembly.instantiate(
    await response.arrayBuffer(),go.importObject);
  go.run(instance).catch(e=>{
    running=false;
    postMessage({type:"fault",error:String(e)});
  });
  for(let i=0;i<1000&&!self.cg50CoreReady;i++)await sleep(10);
  if(!self.cg50CoreReady)throw Error("Core startup timed out");
})();
function checked(value){
  if(value&&value.error)throw Error(value.error);
  return value;
}
function loop(){
  if(!running)return;
  try{
    const fault=cg50Step(50000);
    if(fault)throw Error(fault);
    const now=performance.now();
    if(now-lastFrame>50){
      lastFrame=now;
      const pixels=checked(cg50Frame());
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
    let result;
    if(m.action==="boot"){
      if(running)throw Error("Reload the page before importing again");
      const size=checked(cg50Boot(
        new Uint8Array(m.flash),new Uint8Array(m.state),Date.now()/1000));
      width=size.width;height=size.height;
      cg50SetSpeed(5000000);
      running=true;loop();
      result=size;
    }else if(m.action==="key"){
      result=checked(cg50Tap(m.key));
    }else if(m.action==="release"){
      cg50ReleaseKeys();result=true;
    }else if(m.action==="save"){
      result=checked(cg50Save());
    }else{
      throw Error("Unknown command");
    }
    postMessage({id:m.id,result});
  }).catch(e=>postMessage({id:m.id,error:String(e)}));
};
