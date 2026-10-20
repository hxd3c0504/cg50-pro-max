
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {webcrypto}=require("node:crypto");
if(!globalThis.crypto)globalThis.crypto=webcrypto;
globalThis.self=globalThis;
const [web,stateFile]=process.argv.slice(2);
setTimeout(()=>{console.error("WASM 测试超时");process.exit(2)},90000);
function check(v){if(v&&v.error)throw Error(v.error);return v}
function advance(n){
 while(n>0){
  const count=Math.min(n,50000),fault=check(cg50Step(count));
  if(fault)throw Error(String(fault));
  n-=count;
 }
}
function lit(){
 const p=check(cg50Frame());let count=0;
 for(let i=0;i+3<p.length;i+=4)if(p[i]||p[i+1]||p[i+2])count++;
 return count;
}
(async()=>{
 vm.runInThisContext(fs.readFileSync(path.join(web,"wasm_exec.js"),"utf8"));
 const go=new Go();
 const {instance}=await WebAssembly.instantiate(
  fs.readFileSync(path.join(web,"cg50.wasm")),go.importObject);
 go.run(instance).catch(e=>{console.error(String(e));process.exit(2)});
 for(let i=0;i<1000&&!globalThis.cg50CoreReady;i++)
  await new Promise(r=>setTimeout(r,10));
 if(!globalThis.cg50CoreReady)throw Error("核心未就绪");
 check(cg50Boot(
  new Uint8Array(fs.readFileSync(path.join(web,"defaults/flash_full.bin"))),
  new Uint8Array(fs.readFileSync(stateFile)),Date.now()/1000));
 check(cg50SetSpeed(15000000));
 check(cg50SetInputSpeed(4344863));
 advance(8000000);
 if(check(cg50Key(0,0,true))!==true)throw Error("AC/ON 按下失败");
 advance(1500000);
 check(cg50Key(0,0,false));
 advance(6000000);
 if(!lit()||check(cg50Stats()).executed<=400)throw Error("未恢复显示");
 console.log("AC/ON 恢复显示通过：",JSON.stringify(check(cg50Stats())));
 const saved=check(cg50Save());
 check(cg50Restore(saved,Date.now()/1000));
 advance(1000000);
 if(!lit())throw Error("保存恢复后黑屏");
 console.log("实际 WASM 保存恢复通过。");
 process.exit(0);
})().catch(e=>{console.error(e.stack||String(e));process.exit(1)});
