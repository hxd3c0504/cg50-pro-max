
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const code=readFileSync(new URL("../web/cg50-announcements.js",import.meta.url),"utf8");
const tick=()=>new Promise(r=>setTimeout(r,20));
const item={id:"12345678-1234-1234-1234-123456789012",
 title:"测试公告",content:"<script>普通文字</script>"};
async function session(online,confirmed=false,fail=false){
 let calls=0;
 const events={},nodes=[],values=new Map();
 if(confirmed)values.set("cg50.announcement-confirmed.v1",item.id);
 function element(tag){
  return {tag,style:{},handlers:{},children:[],
   setAttribute(){},addEventListener(k,f){this.handlers[k]=f;},
   append(...v){this.children.push(...v);},focus(){},
   showModal(){this.open=true;},close(){this.open=false;},
   remove(){this.removed=true;}
  };
 }
 const document={
  readyState:"complete",hidden:false,documentElement:{lang:"zh-CN"},
  body:{append(v){nodes.push(v);}},getElementById(){return null;},
  querySelector(){return null;},createElement:element,
  addEventListener(k,f){events[k]=f;}
 };
 const navigator={onLine:online};
 const context={
  document,navigator,console,AbortController,setTimeout,clearTimeout,
  localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},
  MutationObserver:class{observe(){}disconnect(){}},
  fetch:async()=>{
   calls++;if(fail)throw Error("offline");
   return {ok:true,json:async()=>({announcement:item})};
  },
  CG50EmulatorReady:Promise.resolve(),CG50FirstFrameReady:Promise.resolve(),
  addEventListener(k,f){events[k]=f;}
 };
 context.window=context;
 vm.runInNewContext(code,context);
 await tick();
 return {events,nodes,values,navigator,calls:()=>calls};
}
let s=await session(true);
assert.equal(s.calls(),1);assert.equal(s.nodes.length,1);
assert.equal(s.nodes[0].children[1].textContent,item.content);
s.nodes[0].children[2].handlers.click();
assert.equal(s.values.get("cg50.announcement-confirmed.v1"),item.id);
await s.events.online();assert.equal(s.calls(),1);
s=await session(true,true);
assert.equal(s.calls(),1);assert.equal(s.nodes.length,0);
s=await session(false);
assert.equal(s.calls(),0);
s.navigator.onLine=true;await s.events.online();
assert.equal(s.calls(),1);assert.equal(s.nodes.length,1);
s=await session(true,false,true);
assert.equal(s.nodes.length,0);
console.log("PASS 启动检查一次、确认去重、离线补查、失败不阻塞及公告纯文字展示。");
