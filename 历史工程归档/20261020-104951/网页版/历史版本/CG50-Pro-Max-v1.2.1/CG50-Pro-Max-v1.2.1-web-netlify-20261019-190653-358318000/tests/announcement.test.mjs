
import assert from "node:assert/strict";
import {handle} from "../netlify/functions/announcement.mjs";
const secret="a".repeat(40);
let current=null,writes=0;
const store={
 async get(){return structuredClone(current);},
 async setJSON(k,v){current=structuredClone(v);writes++;}
};
function req(path,method="GET",auth=false,body=null,origin="https://test.netlify.app"){
 return new Request("https://test.netlify.app"+path,{
  method,headers:{...(auth?{Authorization:"Bearer "+secret}:{}),
   Origin:origin,"Content-Type":"application/json"},
  ...(body!==null?{body:JSON.stringify(body)}:{})
 });
}
assert.equal((await handle(req("/api/admin/announcement"),store,secret)).status,401);
assert.equal((await handle(req("/api/admin/announcement","PUT",false,
 {title:"标题",content:"内容"}),store,secret)).status,401);
assert.equal(writes,0);
assert.equal((await handle(req("/api/admin/announcement","PUT",true,
 {title:"标题",content:"内容"},"https://wrong.example"),store,secret)).status,403);
assert.equal((await handle(req("/api/admin/announcement","PUT",true,
 {title:"",content:"内容"}),store,secret)).status,400);
assert.equal(writes,0);
let response=await handle(req("/api/admin/announcement","PUT",true,
 {title:"换了新的计算器电池🔋",content:"你好呀\n<script>这是普通文字</script>"}),store,secret);
assert.equal(response.status,200);
const first=(await response.json()).announcement.id;
response=await handle(req("/api/announcement"),store,secret);
const publicItem=(await response.json()).announcement;
assert.equal(publicItem.id,first);
assert.equal(publicItem.content,"你好呀\n<script>这是普通文字</script>");
await handle(req("/api/admin/announcement","PUT",true,
 {title:"新公告",content:"新的内容"}),store,secret);
assert.notEqual(current.id,first);
assert.equal((await handle(req("/api/admin/announcement","DELETE",true),store,secret)).status,200);
assert.equal((await (await handle(req("/api/announcement"),store,secret)).json()).announcement,null);
console.log("PASS 公告密码保护、来源检查、内容校验、新公告编号及撤回。");
