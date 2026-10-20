
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const web=new URL("../web/",import.meta.url);
const read=name=>readFileSync(new URL(name,web),"utf8");
const html=read("index.html");
const resetSource=read("cg50-factory-reset.js");
const update=read("cg50-update.js");
const adapter=read("ipad-adapter.js");
const announcements=read("cg50-announcements.js");

assert.equal((html.match(/\bid=["']cg50-reload-config["']/g)||[]).length,1);
assert.ok(!html.includes('id="cg50-reload-slot"'));
assert.ok(!update.includes('button.id="cg50-reload-config"'));
assert.ok(!update.includes("window.CG50ManualReload="));
assert.equal((resetSource.match(/window\.CG50ManualReload=reset/g)||[]).length,1);
assert.ok(!resetSource.includes('closest?.("#cg50-reload-config")'));
console.log("PASS 顶部按钮唯一，更新脚本不再创建或覆盖手动重载入口");

assert.equal((adapter.match(/serviceWorker\.register\(/g)||[]).length,0);
assert.equal((update.match(/serviceWorker\.register\(/g)||[]).length,1);
console.log("PASS 适配器不再重复注册 SW");

function section(source,start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a);
 return source.slice(a,b);
}
const binding=section(resetSource,"function bindReloadButton(){",'for(const type of ["keydown","keyup"])');
const labels=section(resetSource,"function labels(){","async function ack(){");
let calls=0,prevented=0,english=false;
const button={onclick:null,textContent:""};
const context={
 document:{getElementById:id=>id==="cg50-reload-config"?button:null},
 reset:async()=>{calls++;},
 text:(zh,en)=>english?en:zh,
 console
};
vm.createContext(context);
vm.runInContext(binding+"\n"+labels,context);
context.bindReloadButton();
context.bindReloadButton();
await button.onclick({preventDefault:()=>prevented++});
assert.equal(calls,1);
assert.equal(prevented,1);
context.labels();
assert.equal(button.textContent,"重载配置文件");
english=true;context.labels();
assert.equal(button.textContent,"Reload configuration");
console.log("PASS 按钮直接调用恢复流程，重复绑定不叠加，语言切换正常");

assert.ok(!resetSource.includes("清除本机进度和设置，重新下载程序并恢复未初始化存档。操作前需要确认。"));
assert.ok(resetSource.includes("确定清空并重新开始吗？"));
assert.ok(announcements.includes("function moveReload(){return true;}"));
console.log("PASS 不再生成已删除的设置说明，保留清空确认；公告不再搬动按钮");
