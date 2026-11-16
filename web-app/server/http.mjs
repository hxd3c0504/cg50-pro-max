import http from "node:http";
import {readFile,realpath,stat} from "node:fs/promises";
import {createReadStream} from "node:fs";
import {pipeline} from "node:stream/promises";
import {resolve,sep,extname} from "node:path";
import {createHash} from "node:crypto";
import {isIP} from "node:net";
import {handle as stats} from "../netlify/functions/stats.mjs";
import {handle as announcement} from "../netlify/functions/announcement.mjs";

const MIME={
 ".html":"text/html; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",
 ".webmanifest":"application/manifest+json",
 ".wasm":"application/wasm",
 ".png":"image/png",".ico":"image/x-icon",
 ".bin":"application/octet-stream",
 ".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml"
};
export async function createApp({web,database,password,origin,trustProxy=false}){
 const canonical=new URL(origin);
 if(!["https:","http:"].includes(canonical.protocol)||
    canonical.username||canonical.password||
    canonical.pathname!=="/"||canonical.search||canonical.hash)
   throw Error("PUBLIC_ORIGIN must be a site origin");
 origin=canonical.origin;
 web=await realpath(web);

 const version=JSON.parse(await readFile(resolve(web,"version.json"),"utf8"));
 const manifest=JSON.parse(await readFile(resolve(web,"reset-manifest.json"),"utf8"));
 if(manifest.releaseId!==version.releaseId||manifest.version!==version.version)
   throw Error("Release manifest mismatch");

 const allowed=new Set(["reset-manifest.json"]);
 for(const f of manifest.files){
   if(typeof f.path!=="string"||/[\\?#]/.test(f.path)||
      f.path.startsWith("/")||
      f.path.split("/").some(p=>!p||p==="."||p==="..")||
      allowed.has(f.path))
     throw Error("Invalid manifest path");
   const p=await realpath(resolve(web,f.path));
   if(!p.startsWith(web+sep))throw Error("Resource outside web directory");
   const bytes=await readFile(p);
   if(bytes.length!==f.size||
      createHash("sha256").update(bytes).digest("hex")!==f.sha256)
     throw Error("Resource verification failed: "+f.path);
   allowed.add(f.path);
 }

 const usage=database.store("cg50-usage-v1");
 const notices=database.store("cg50-announcements-v1");
 const limits=new Map();
 function clientIP(req){
   // 仅在确认部署入口会清理/追加转发头后开启。
   if(trustProxy){
     const value=String(req.headers["x-real-ip"]||"").trim();
     if(isIP(value))return value;
   }
   return req.socket.remoteAddress||"unknown";
 }
 function limited(req,group){
   const now=Date.now();
   for(const [key,value] of limits)
     if(value.until<=now)limits.delete(key);
   const key=group+":"+clientIP(req);
   let entry=limits.get(key);
   if(!entry){
     if(limits.size>=10000)return true;
     entry={count:0,until:now+60000};limits.set(key,entry);
   }
   return ++entry.count>120;
 }
 function send(res,status,value,headers={}){
   res.writeHead(status,{
     "Content-Type":"application/json; charset=utf-8",
     "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
     ...headers
   });
   res.end(JSON.stringify(value));
 }
 const server=http.createServer(async(req,res)=>{
   try{
     const url=new URL(req.url,origin);
     if(url.origin!==origin)return send(res,400,{error:"Invalid URL"});
     if(url.pathname==="/healthz"){
       if(!["GET","HEAD"].includes(req.method))
         return send(res,405,{error:"Method not allowed"});
       res.writeHead(200,{"Cache-Control":"no-store"});
       return res.end(req.method==="HEAD"?"":"ok");
     }
     if(url.pathname.startsWith("/api/")){
       const isStats=["/api/usage","/api/stats"].includes(url.pathname);
       const isNotice=["/api/announcement","/api/admin/announcement"]
         .includes(url.pathname);
       if(!isStats&&!isNotice)return send(res,404,{error:"Not found"});
       if(limited(req,isStats?"stats":"announcement"))
         return send(res,429,{error:"Too many requests"},{"Retry-After":"60"});

       let size=0;const chunks=[];
       for await(const chunk of req){
         size+=chunk.length;
         if(size>128*1024){
           send(res,413,{error:"Payload too large"});
           req.resume();return;
         }
         chunks.push(chunk);
       }
       const headers=new Headers();
       for(const [key,value] of Object.entries(req.headers))
         if(value!==undefined)
           headers.set(key,Array.isArray(value)?value.join(","):value);
       const options={method:req.method,headers};
       if(!["GET","HEAD"].includes(req.method))
         options.body=Buffer.concat(chunks);
       const request=new Request(url,options);
       const response=await (isStats?stats:announcement)(
         request,isStats?usage:notices,password
       );
       res.writeHead(response.status,Object.fromEntries(response.headers));
       return res.end(Buffer.from(await response.arrayBuffer()));
     }
     if(!["GET","HEAD"].includes(req.method))
       return send(res,405,{error:"Method not allowed"});
     if(url.pathname==="/stats"){
       res.writeHead(302,{Location:"/stats/","Cache-Control":"no-cache"});
       return res.end();
     }
     let name;
     try{name=decodeURIComponent(url.pathname).slice(1);}
     catch{return send(res,400,{error:"Invalid path"});}
     if(!name)name="index.html";
     if(name==="stats/")name="stats/index.html";
     if(!allowed.has(name))return send(res,404,{error:"Not found"});
     const path=await realpath(resolve(web,name));
     if(!path.startsWith(web+sep))return send(res,404,{error:"Not found"});
     const details=await stat(path);
     if(!details.isFile())return send(res,404,{error:"Not found"});
     res.writeHead(200,{
       "Content-Type":MIME[extname(name)]||"application/octet-stream",
       "Content-Length":details.size,
       "Cache-Control":["version.json","reset-manifest.json"].includes(name)
         ?"no-store":"no-cache",
       "X-Content-Type-Options":"nosniff"
     });
     if(req.method==="HEAD")return res.end();
     await pipeline(createReadStream(path),res);
   }catch{
     if(!res.headersSent)send(res,503,{error:"Service temporarily unavailable"});
     else res.destroy();
   }
 });
 server.requestTimeout=30000;
 server.headersTimeout=15000;
 return server;
}
