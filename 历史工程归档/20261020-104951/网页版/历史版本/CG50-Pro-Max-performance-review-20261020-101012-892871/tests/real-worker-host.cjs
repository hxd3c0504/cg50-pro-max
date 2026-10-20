
const {parentPort,workerData,MessageChannel}=require("node:worker_threads");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
globalThis.self=globalThis;
globalThis.MessageChannel=MessageChannel;
if(!globalThis.crypto)globalThis.crypto=require("node:crypto").webcrypto;
globalThis.onmessage=null;
globalThis.postMessage=(message,transfer)=>parentPort.postMessage(message,transfer);
globalThis.importScripts=(...names)=>{
 for(const name of names){
  const file=path.resolve(workerData.web,name);
  vm.runInThisContext(fs.readFileSync(file,"utf8"),{filename:file});
 }
};
globalThis.fetch=async input=>{
 const url=new URL(
  typeof input==="string"?input:input.url,
  "https://cg50-local-test.invalid/"
 );
 if(url.origin!=="https://cg50-local-test.invalid")
  throw Error("External network disabled");
 const root=path.resolve(workerData.web);
 const file=path.resolve(root,"."+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep))throw Error("Invalid path");
 try{return new Response(fs.readFileSync(file));}
 catch{return new Response("Missing",{status:404});}
};
parentPort.on("message",data=>{
 try{
  Promise.resolve(globalThis.onmessage({data})).catch(error=>
   parentPort.postMessage({probeError:String(error)}));
 }catch(error){parentPort.postMessage({probeError:String(error)});}
});
vm.runInThisContext(
 fs.readFileSync(path.join(workerData.web,"worker.js"),"utf8"),
 {filename:"actual-worker.js"}
);
