
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {randomUUID} from "node:crypto";

let clock=Date.UTC(2026,9,13,8);
let data,fetches=0,fail=false,closed=0,tid=0;
const timers=new Map(),listeners={};
const copy=x=>x===undefined?undefined:structuredClone(x);

const db={
  close(){closed++;},
  transaction(){
    const tx={
      error:null,
      abort(){tx.onabort?.();},
      objectStore(){return {
        get(){
          const r={};
          Promise.resolve().then(()=>{
            r.result=copy(data);r.onsuccess?.();
            Promise.resolve().then(()=>tx.oncomplete?.());
          });
          return r;
        },
        put(value){data=copy(value);}
      };}
    };
    return tx;
  }
};
const indexedDB={
  open(){
    const r={result:db};
    Promise.resolve().then(()=>r.onsuccess?.());
    return r;
  }
};
const navigator={onLine:false};
const window={
  CG50Release:{version:"1.1.1"},
  addEventListener:(key,fn)=>listeners[key]=fn,
  fetch:async(url,options)=>{
    fetches++;assert.equal(url,"/api/usage");
    const events=JSON.parse(options.body).events;
    assert.ok(events.every(e=>
      Object.keys(e).sort().join(",")==="at,id,session,version,visitor"
    ));
    return {
      ok:!fail,
      json:async()=>({accepted:events.map(e=>e.id)})
    };
  }
};
class TestDate extends Date{static now(){return clock;}}
class Controller{
  constructor(){this.signal={};}
  abort(){}
}
vm.runInNewContext(
  readFileSync(new URL("../web/cg50-usage.js",import.meta.url),"utf8"),{
    window,navigator,indexedDB,crypto:{randomUUID},
    Date:TestDate,AbortController:Controller,
    document:{hidden:false,addEventListener(){}},
    setTimeout(fn,delay){
      const id=++tid;timers.set(id,{fn,delay});return id;
    },
    clearTimeout:id=>timers.delete(id),
    setInterval:()=>0,clearInterval(){}
  }
);
async function drain(){
  for(let i=0;i<40;i++)await Promise.resolve();
}
async function run(delay){
  const t=[...timers].find(([,t])=>t.delay===delay);
  assert.ok(t,"缺少测试定时器 "+delay);
  timers.delete(t[0]);t[1].fn();await drain();
}
await drain();
window.CG50UsageActivity("save");
assert.equal(data,undefined);

window.CG50UsageActivity("key",{key:"AC"});
await run(100);
assert.equal(data.queue.length,1);
assert.equal(fetches,0);

clock+=600000;
window.CG50UsageActivity("key",{key:"1"});
await run(10000);
assert.equal(data.queue.length,1);

clock+=1860000;
window.CG50UsageActivity("key",{key:"2"});
await run(100);
assert.equal(data.queue.length,2);

clock+=1000;
window.CG50UsageActivity("hold",{down:true,token:"touch"});
await run(10000);
const size=timers.size;
window.CG50UsageActivity("hold",{down:true,token:"touch"});
assert.equal(timers.size,size);

navigator.onLine=true;fail=true;
listeners.online();await drain();
assert.equal(data.queue.length,2);

fail=false;
listeners.online();await drain();
assert.equal(data.queue.length,0);
assert.equal(fetches,2);

await window.CG50UsageStop();
const last=data.lastAt;
clock+=1800000;
window.CG50UsageActivity("key");
await drain();
assert.equal(data.lastAt,last);
assert.equal(closed,1);

console.log("计数模拟检查通过：同会话去重、30分钟规则、长按过滤、离线补报、失败重试、重置前停止写入。");
