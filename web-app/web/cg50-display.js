
(()=>{
"use strict";
window.CG50DirectFrames=true;
let source=null,queued=false,raf=0;
const views=[];
function place(v){
  const r=v.image.getBoundingClientRect(),p=v.parent.getBoundingClientRect();
  Object.assign(v.canvas.style,{
    left:(r.left-p.left-v.parent.clientLeft+v.parent.scrollLeft)+"px",
    top:(r.top-p.top-v.parent.clientTop+v.parent.scrollTop)+"px",
    width:r.width+"px",height:r.height+"px"
  });
}
function paint(){
  queued=false;raf=0;
  if(!source)return;
  for(const v of views){
    place(v);
    if(!v.image.getBoundingClientRect().width)continue;
    if(v.canvas.width!==source.width||v.canvas.height!==source.height){
      v.canvas.width=source.width;v.canvas.height=source.height;
    }
    v.context.imageSmoothingEnabled=false;
    v.context.drawImage(source,0,0);
  }
  const status=document.getElementById("connection");
  if(status&&!window.CG50ConnectionStatusManaged){
    const text=document.documentElement.lang.startsWith("en")
      ?"Screen connected":"画面已连接";
    if(status.textContent!==text)status.textContent=text;
    status.classList.add("online");
  }
}
function schedule(){
  if(!queued){queued=true;raf=requestAnimationFrame(paint);}
}
let regular=null,practice=null;
window.CG50PaintFrame=c=>{regular=c;if(!practice){source=c;schedule();}};
window.CG50PracticeFrame=c=>{practice=c;source=c||regular;schedule();};
function redraw(){
 if(raf)cancelAnimationFrame(raf);
 raf=0;queued=false;schedule();
}
window.CG50Redraw=redraw;
window.addEventListener("pageshow",redraw);
document.addEventListener("visibilitychange",()=>{
 if(!document.hidden)redraw();
});

function install(){
  for(const image of document.querySelectorAll("img.lcd")){
    const parent=image.parentElement;
    if(getComputedStyle(parent).position==="static")
      parent.style.position="relative";
    const canvas=document.createElement("canvas");
    canvas.width=canvas.height=0;
    canvas.setAttribute("aria-hidden","true");
    canvas.style.cssText="position:absolute;pointer-events:none;object-fit:contain;background:#000;z-index:1;image-rendering:pixelated;";
    parent.append(canvas);
    image.style.visibility="hidden";
    const v={image,parent,canvas,context:canvas.getContext("2d")};
    views.push(v);place(v);
    if(typeof ResizeObserver==="function"){
      const observer=new ResizeObserver(()=>{place(v);schedule();});
      observer.observe(image);observer.observe(parent);
    }
  }
  window.addEventListener("resize",schedule);
  schedule();
}
if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
