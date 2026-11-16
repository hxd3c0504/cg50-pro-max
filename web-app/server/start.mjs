import {resolve} from "node:path";
import {openStores} from "./store.mjs";
import {createApp} from "./http.mjs";

const password=process.env.CG50_STATS_PASSWORD||"";
const directory=process.env.DATA_DIR;
const domain=process.env.RAILWAY_PUBLIC_DOMAIN;
const origin=process.env.PUBLIC_ORIGIN||(domain?"https://"+domain:"");
if(password.length<24)throw Error("CG50_STATS_PASSWORD must contain at least 24 characters");
if(!directory||!directory.startsWith("/"))throw Error("DATA_DIR must be an absolute persistent-volume path");
if(!origin)throw Error("Set PUBLIC_ORIGIN or generate a Railway public domain");
const port=Number(process.env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error("Invalid PORT");

const database=openStores(resolve(directory,"cg50.sqlite"));
const server=await createApp({
 web:resolve("web"),database,password,origin,
 trustProxy:process.env.TRUST_PROXY==="1"
});
server.listen(port,"0.0.0.0",()=>console.log("CG50 HTTP service ready"));
let stopping=false;
function shutdown(){
 if(stopping)return;
 stopping=true;
 const timer=setTimeout(()=>process.exit(1),10000);
 timer.unref();
 server.close(()=>{
   database.close();clearTimeout(timer);process.exit(0);
 });
 server.closeIdleConnections();
}
process.on("SIGTERM",shutdown);
process.on("SIGINT",shutdown);
