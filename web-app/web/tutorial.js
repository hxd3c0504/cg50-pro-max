(()=>{
const en=()=>document.documentElement.lang.startsWith('en');
const t=(zh,english)=>en()?english:zh;
const base=[
 ['AC','拿到计算器，先找到右侧蓝色 AC/ON，按一下开机。','Press the blue AC/ON key to turn on the calculator.'],
 ['MENU','开机后，按 MENU 看看有哪些应用。','Press MENU to explore the apps.'],
 ['1','计算·矩阵在主菜单第 1 格。按 1 进入。','Run-Matrix is app 1. Press 1 to open it.'],
 ['1','先算三分之一。输入 1。','Try one third. Enter 1.'],
 ['/','按 ÷。','Press ÷.'],
 ['2','先输入 2，试试怎样改掉输错的一位。','Enter 2 first so you can practice correcting a digit.'],
 ['DEL','我们要除以 3。按 DEL 删掉刚才的 2。','We want to divide by 3. Press DEL to erase the 2.'],
 ['3','输入正确的分母 3。','Enter the correct denominator, 3.'],
 ['EXE','按 EXE 算出结果。','Press EXE to evaluate.'],
 ['SD','找到左括号旁边的 S↔D，按一下，把 0.333… 切成精确分数 1/3。','Press S↔D next to the left parenthesis to turn 0.333… into the exact fraction 1/3.'],
 ['SD','显示的是同一个数。再按一次 S↔D 切回小数。','Same number, different display. Press S↔D again for the decimal.'],
 ['SHIFT','再试试 π/2。π 是黄色标记，先按一下黄色 SHIFT。','Try π/2. The π label is yellow, so press SHIFT first.'],
 ['EXP','按黄色 π 下方的 ×10ˣ 输入 π。','Press ×10ˣ beneath the yellow π to enter π.'],
 ['/','按 ÷。','Press ÷.'],['2','输入 2。','Enter 2.'],['EXE','按 EXE 得到 π/2。','Press EXE for π/2.'],
 ['SD','按 S↔D 看 π/2 的近似值，约为 1.5708。','Press S↔D for a decimal approximation, about 1.5708.'],
 ['OPTN','接下来求 y = x² 在 x = 3 处的切线斜率。按 OPTN 打开选项。','Find the slope of y = x² at x = 3. Press OPTN for options.'],
 ['F4','看屏幕底栏，从左数第四格是「计算」(CALC)。按机身上对应的 F4。','Read the bottom row. CALC (计算) is fourth from the left. Press F4.'],
 ['F2','底栏换了一排。d/dx 在第二格，按 F2 插入求导模板。','The bottom labels changed. Press F2 under d/dx for a derivative.'],
 ['XVAR','先填函数。按 X,θ,T 输入 X。','Fill the function slot. Press X,θ,T for X.'],
 ['SQ','按 x² 得到 X²。','Press x² to square X.'],
 ['ArrowRight','按右方向键移到求导点。','Press the right arrow to move to the evaluation point.'],
 ['3','输入 3。','Enter 3.'],['EXE','按 EXE 算斜率。','Press EXE to calculate the slope.'],
 ['EXIT','斜率是 6。按 EXIT 退回一层。','The slope is 6. Press EXIT to go back one level.'],
 ['ALPHA','若要输入字母，先按红色 ALPHA。','To type a letter, press the red ALPHA key.'],
 ['XVAR','按红色 A 下方的 X,θ,T 键，看看输入行里的 A。','Press X,θ,T beneath the red A and look at the input line.'],
 ['MENU','按 MENU 返回主菜单。','Press MENU to return to the main menu.'],
 ['SHIFT','用完准备关机。OFF 印成黄色，先按 SHIFT。','Ready to power off? OFF is yellow, so press SHIFT first.'],
 ['AC','按黄色 OFF 下方的 AC/ON 关机。','Press AC/ON below the yellow OFF to turn off.']
];
const openCalc=base.slice(0,3);
const sections=[
 {title:['基础操作入门','Calculator basics'],keys:[...base.slice(0,9),['OPTN','按 OPTN 打开选项。','Press OPTN for options.'],base[18],['EXIT','按 EXIT 返回上一层菜单。','Press EXIT to go back one menu level.'],...base.slice(26)]},
 {title:['操作小技巧','Calculator tips'],keys:[...openCalc,base[3],base[4],base[7],...base.slice(8,17)]},
 {title:['怎么在x的位置求导','Find the derivative at a given x'],keys:[...openCalc,...base.slice(17,25)],result:['在 x = 3 处，切线斜率是 6。','At x = 3, the tangent slope is 6.']},
 {title:['怎么输入定积分','Enter a definite integral'],keys:[...openCalc,['OPTN','计算 x² 从 0 到 2 的定积分。按 OPTN。','Integrate x² from 0 to 2. Press OPTN.'],base[18],['F4','第四格是 ∫dx。按 F4 插入定积分。','Press F4 under ∫dx.'],base[20],base[21],['ArrowRight','按右方向键进入积分下限。','Move right to the lower limit.'],['0','输入下限 0。','Enter 0 for the lower limit.'],['ArrowRight','按右方向键进入积分上限。','Move right to the upper limit.'],['2','输入上限 2。','Enter 2 for the upper limit.'],['EXE','按 EXE 计算定积分。','Press EXE to integrate.']],result:['积分值是 8/3，约为 2.666666667。','The integral is 8/3, approximately 2.666666667.']},
 {title:['怎么输入绝对值','Enter an absolute value'],keys:[...openCalc,['OPTN','求 −3 的绝对值。按 OPTN。','Find the absolute value of −3. Press OPTN.'],['F6','按 F6 翻到下一页选项。','Press F6 for more options.'],['F4','按 F4 选择「数字」(NUM)。','Open the numeric (NUM) menu.'],['F1','按 F1 选择 Abs。','Press F1 for Abs.'],['NEG','按 (−) 输入负号。','Press (−) for the negative sign.'],base[7],['EXE','按 EXE 计算绝对值。','Press EXE to evaluate.']],result:['−3 的绝对值是 3。','The absolute value of −3 is 3.']},
 {title:['怎么画极坐标图（Polar）','Plot a polar graph'],keys:[base[0],base[1],['5','按 5 进入「图形」。','Press 5 for Graph.'],['F3','按 F3 打开图形类型菜单。','Press F3 for graph types.'],['F2','选择 r= 极坐标方程。','Select r= for a polar equation.'],['2','输入 2，画 r = 2sin(θ)。','Enter 2 to plot r = 2sin(θ).'],['SIN','输入 sin。','Press sin.'],['(','按左括号，开始填写角度。','Open a parenthesis for the angle.'],['XVAR','按变量键输入 θ。','Press the variable key for θ.'],[')','补上右括号。','Close the parenthesis.'],['EXE','按 EXE 保存方程。','Press EXE to store the equation.'],['F6','按 F6 绘图。','Press F6 to draw.']],result:['r = 2sin(θ) 的图形是一个圆。','The graph of r = 2sin(θ) is a circle.']}
];
let section=sections[0],steps=section.keys;

const card=document.createElement('aside');
card.id='lesson-coach';card.hidden=true;
card.innerHTML='<div><strong></strong><p aria-live="polite"></p></div>';
document.body.append(card);
const message=card.querySelector('p');
const seen='cg50-tutorial-keypad-v2';
let index=0,worker=null,busy=false,ready=false,lit=null,request=0,failed=false;
const screen=document.createElement('canvas');
const ctx=screen.getContext('2d');
const marker=document.createElement("span");marker.className="lesson-slot";marker.hidden=true;document.querySelector(".screen-frame").append(marker);
function placeSlot(){const img=marker.parentElement.querySelector("img"),slot=Number(steps[index]?.[0].match(/^F([1-6])$/)?.[1]);marker.hidden=card.hidden||!slot;if(marker.hidden)return;Object.assign(marker.style,{left:(img.offsetLeft+(slot-1)*img.offsetWidth/6)+"px",top:(img.offsetTop+img.offsetHeight*.9)+"px",width:img.offsetWidth/6+"px",height:img.offsetHeight*.1+"px"})}
new ResizeObserver(placeSlot).observe(marker.parentElement);
const avatar=new Image();
avatar.alt='';card.append(avatar);
const device=document.querySelector('#device');
const main=document.querySelector('main');
let manual=null,drag=null;
const heartSheet=new Image();
const heartCanvas=document.createElement('canvas');
heartCanvas.className='lesson-heart';heartCanvas.setAttribute('aria-hidden','true');card.append(heartCanvas);
const heartContext=heartCanvas.getContext('2d');
let effectFrame=0,heartRequest=0,tapTimes=[];
const ease=value=>{const t=Math.min(1,Math.max(0,value));return t*t*(3-2*t)};
// The atlas and the pink outline share the same 15 fps animation clock.
const heartFPS=15;
const heartFrameCount=45;
const heartColumns=9;
const heartDuration=heartFrameCount*1000/heartFPS;
const heartOutline=[[0,4],[0,2],[1,2],[1,1],[3,1],[3,2],[4,2],[4,3],[5,3],
 [5,2],[6,2],[6,1],[8,1],[8,2],[9,2],[9,5],[8,5],[8,6],[7,6],[7,7],
 [6,7],[6,8],[5,8],[5,9],[4,9],[4,8],[3,8],[3,7],[2,7],[2,6],[1,6],[1,5],[0,5],[0,4]];
function drawCelebration(i){
 const c=heartContext,side=heartCanvas.width,cell=heartSheet.naturalWidth/heartColumns;
 const ms=i*1000/heartFPS;
 c.clearRect(0,0,side,side);
 c.drawImage(heartSheet,(i%heartColumns)*cell,Math.floor(i/heartColumns)*cell,cell,cell,0,0,side,side);
 // The cap hand reaches the pocket at 1000 ms. The drawing hand begins after it settles.
 const reveal=ease((ms-1100)/920);
 if(!reveal)return;
 const turn=ease((ms-2020)/830),lift=ease((ms-2600)/400);
 c.save();c.scale(side,side);
 c.translate(339/443+.024*turn,153/443+.044*turn-.082*lift);
 const unit=6.8/443;c.scale(unit,unit);c.translate(0,-4);
 const amount=reveal*(heartOutline.length-1),last=Math.floor(amount);
 c.beginPath();c.moveTo(...heartOutline[0]);
 for(let i=1;i<=last;i++)c.lineTo(...heartOutline[i]);
 if(last+1<heartOutline.length){
  const [x,y]=heartOutline[last],[nx,ny]=heartOutline[last+1];
  c.lineTo(x+(nx-x)*(amount-last),y+(ny-y)*(amount-last));
 }
 if(reveal===1){
  c.closePath();c.fillStyle='rgba(255,123,164,'+ease((ms-2020)/420)+')';c.fill();
 }
 c.strokeStyle='#ff9dbd';c.lineWidth=.76;c.lineJoin='round';c.stroke();c.restore();
}
function animateHeart(start,now,previous=-1){
 const elapsed=now-start;
 if(elapsed>=heartDuration){stopHeart();placeGuide();return}
 const frame=Math.floor(elapsed*heartFPS/1000);
 if(frame!==previous)drawCelebration(frame);
 effectFrame=requestAnimationFrame(time=>animateHeart(start,time,frame));
}
function stopHeart(){
 heartRequest++;
 cancelAnimationFrame(effectFrame);effectFrame=0;
 card.classList.remove('playing-heart');
 tapTimes=[];
}
async function playHeart(){
 if(effectFrame||card.hidden)return;
 const requestId=++heartRequest;
 if(heartSheet.complete&&!heartSheet.naturalWidth)heartSheet.src='./guide-heart.png';
 try{await heartSheet.decode()}catch{return}
 if(requestId!==heartRequest||card.hidden||drag)return;
 const box=avatar.getBoundingClientRect();
 // Keep the whole square frame visible when the guide is close to the viewport edge.
 const left=Math.max(0,Math.min(box.left+(box.width-box.height)/2,innerWidth-box.height));
 card.style.setProperty('--heart-left',(left-box.left)+'px');
 const resolution=Math.max(1,Math.round(box.height*Math.min(window.devicePixelRatio||1,3)));
 heartCanvas.width=heartCanvas.height=resolution;
 card.classList.add('playing-heart');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  drawCelebration(heartFrameCount-1);
  const end=performance.now()+heartDuration;
  function wait(now){if(now<end){effectFrame=requestAnimationFrame(wait);return}stopHeart();placeGuide()}
  effectFrame=requestAnimationFrame(wait);
 }else{
  const start=performance.now();animateHeart(start,start);
 }
}
avatar.draggable=false;
avatar.addEventListener('pointerdown',event=>{
 if(effectFrame||drag||!event.isPrimary||event.button!==0)return;
 const box=card.getBoundingClientRect();
 drag={startX:event.clientX,startY:event.clientY,start:performance.now(),moved:false,id:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};
 avatar.setPointerCapture(event.pointerId);
 event.preventDefault();
});
avatar.addEventListener('pointermove',event=>{
 if(drag?.id!==event.pointerId)return;
 if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7)return;
 drag.moved=true;tapTimes=[];
 manual={left:event.clientX-drag.dx,top:event.clientY-drag.dy};
 placeGuide();
});
avatar.addEventListener('pointerup',event=>{
 if(drag?.id!==event.pointerId)return;
 const now=performance.now();
 if(!drag.moved&&now-drag.start<350&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7){
  tapTimes=tapTimes.filter(time=>now-time<=800);
  tapTimes.push(now);
  if(tapTimes.length===3&&!busy&&ready&&!failed)playHeart();
 }else tapTimes=[];
 drag=null;
});
avatar.addEventListener('pointercancel',()=>{tapTimes=[];drag=null});
function resetPosition(){
 stopHeart();
 if(drag&&avatar.hasPointerCapture(drag.id))avatar.releasePointerCapture(drag.id);
 drag=null;manual=null;
}
avatar.addEventListener('lostpointercapture',()=>{drag=null});
const settings=document.querySelector('#cg50-settings-dialog');
const setting=document.createElement('div');
setting.className='cg50-setting lesson-size';
setting.innerHTML='<label for="lesson-scale"></label><output for="lesson-scale"></output><button type="button" class="lesson-size-reset"></button><input id="lesson-scale" type="range" min="25" max="400" step="1"><img hidden alt="" src="./guide-idle.png">';
settings.querySelector('label[for="cg50-history-enabled"]').after(setting);
const slider=setting.querySelector('input'),preview=setting.querySelector('img');
const sizeKey='cg50-tutorial-guide-percent-v2';
const defaultSize=100;
const resetSize=setting.querySelector('button');
let stored=defaultSize;
try{
 const saved=localStorage.getItem(sizeKey);
 const legacy=Number(localStorage.getItem('cg50-tutorial-guide-percent'));
 if(saved!==null&&Number(saved)>=25&&Number(saved)<=400)stored=Number(saved);
 else if(legacy>=70&&legacy<=150)stored=Math.round(legacy/1.3);
}catch{}
slider.value=stored;
let hideTimer;
function sizePreview(){
 clearTimeout(hideTimer);preview.hidden=false;
 hideTimer=setTimeout(()=>{preview.hidden=true},1800);
}
function applySize(){
 const scale=1.3*1.15*Number(slider.value)/100;
 document.documentElement.style.setProperty('--lesson-avatar-width',Math.round(88*scale)+'px');
 setting.querySelector('output').textContent=slider.value+'%';
 placeGuide();
}
slider.addEventListener('pointerdown',sizePreview);
function saveSize(){
 applySize();sizePreview();
 try{localStorage.setItem(sizeKey,slider.value)}catch{}
}
slider.addEventListener('input',saveSize);
resetSize.addEventListener('click',()=>{slider.value=defaultSize;saveSize()});
settings.addEventListener('close',()=>{clearTimeout(hideTimer);preview.hidden=true});

// Source pixels: sprite dimensions, index fingertip, and direction from knuckle to tip.
const hands=[
 ['right',144,166,125,85,12,-1], ['left',144,168,8,87,-12,-1],
 ['up-left',140,180,21,55,-10,-8], ['up-right',137,180,115,55,10,-8],
 ['down-left',140,180,19,122,-9,8], ['down-right',131,180,107,122,9,8],
 ['right-up', 255, 350, 240, 125.5, 36, -18],
 ['left-up', 255, 350, 15, 125.5, -36, -18],
 ['up-right-steep', 255, 350, 212.5, 52.5, 20, -39],
 ['up-left-steep', 255, 350, 42.5, 52.5, -20, -39],
 ['right-down', 255, 350, 234.5, 195, 38, 10],
 ['left-down', 255, 350, 20.5, 195, -38, 10],
 ['down-right-steep', 255, 350, 212, 271, 22, 35],
 ['down-left-steep', 255, 350, 43, 271, -22, 35],
 ['down', 310, 440, 239, 314, 0.2, 39],
 ['up', 310, 440, 242, 74.5, 2, -40]
];
const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
function placeGuide(){
 if(card.hidden||effectFrame)return;
 const key=(lit||device).getBoundingClientRect();
 const x=key.left+key.width/2,y=key.top+key.height/2;
 const top=document.querySelector('header').getBoundingClientRect().bottom+3;
 // Leave room for the key outline even when the guide is dragged onto it.
 const clearance=8;
 const roomX=Math.max(key.left-2,innerWidth-2-key.right)-clearance;
 const roomY=Math.max(key.top-top,innerHeight-2-key.bottom)-clearance;
 const fit=Math.floor(Math.max(roomX,roomY*88/128));
 card.style.width=lit?'min(var(--lesson-fit-width), '+Math.max(1,fit)+'px)':'';
 const {width:w,height:h}=avatar.getBoundingClientRect();
 const limitX=v=>clamp(v,2,innerWidth-w-2);
 const limitY=v=>clamp(v,top,innerHeight-h-2);
 function clearKey(left,yPos){
  if(!lit||left+w<=key.left-clearance||left>=key.right+clearance||
     yPos+h<=key.top-clearance||yPos>=key.bottom+clearance)return [left,yPos];
  const sides=[[key.left-clearance-w,yPos],[key.right+clearance,yPos],
               [left,key.top-clearance-h],[left,key.bottom+clearance]];
  let closest=[left,yPos],distance=Infinity;
  for(const [sx,sy] of sides){
   if(sx<2||sx+w>innerWidth-2||sy<top||sy+h>innerHeight-2)continue;
   const shift=Math.hypot(sx-left,sy-yPos);
   if(shift<distance){closest=[sx,sy];distance=shift}
  }
  return closest;
 }
 let best;
 for(const [pose,iw,ih,tipX,tipY,vx,vy] of hands){
  // object-fit: contain centers the sprite within a fixed-aspect image box.
  const scale=Math.min(w/iw,h/ih);
  const ax=(w-iw*scale)/2+tipX*scale;
  const ay=(h-ih*scale)/2+tipY*scale;
  const norm=Math.hypot(vx,vy),ux=vx/norm,uy=vy/norm;
  // Move back along the finger's own axis until the card clears the key.
  const gapX=(key.width/2+clearance+(ux>0?w-ax:ax))/Math.abs(ux);
  const gapY=(key.height/2+clearance+(uy>0?h-ay:ay))/Math.abs(uy);
  // Find the part of the pointing ray on which the entire card still fits.
  const originX=x-ax,originY=y-ay;
  const xs=[(originX-2)/ux,(originX-limitX(Infinity))/ux];
  const ys=[(originY-top)/uy,(originY-limitY(Infinity))/uy];
  const near=Math.max(0,Math.min(...xs),Math.min(...ys));
  const far=Math.min(Math.max(...xs),Math.max(...ys));
  const desired=Math.min(gapX,gapY);
  const gap=near<=far?clamp(desired,near,far):desired;
  const [left,cardTop]=clearKey(limitX(manual?.left??x-ux*gap-ax),
                                limitY(manual?.top??y-uy*gap-ay));
  const fx=left+ax,fy=cardTop+ay,dx=x-fx,dy=y-fy;
  const forward=dx*ux+dy*uy;
  const miss=Math.hypot(dx-forward*ux,dy-forward*uy,Math.min(0,forward));
  const score=24*miss+Math.hypot(dx,dy);
  if(!best||score<best.score)best={score,pose,left,cardTop};
 }
 card.style.left=best.left+'px';card.style.top=best.cardTop+'px';
 const pose=lit?best.pose:'idle',url='./guide-'+pose+'.png';
 if(avatar.getAttribute('src')!==url)avatar.src=url;
 card.dataset.pose=pose;
 placeBubble(key,top);

}
const bubble=message.parentElement;
function placeBubble(key,top){
 const a=avatar.getBoundingClientRect(),w=bubble.offsetWidth,h=bubble.offsetHeight;
 const midX=a.left+(a.width-w)/2,midY=a.top+(a.height-h)/2;
 const deviceBox=device.getBoundingClientRect();
 const screenBox=marker.parentElement.getBoundingClientRect();
 const candidates=[[a.left-w-4,midY],[a.right+4,midY],[midX,a.top-h-4],[midX,a.bottom+4],
                   [deviceBox.right+4,midY],[deviceBox.left-w-4,midY]];
 let best;
 for(const [x,y] of candidates){
  const left=clamp(x,4,innerWidth-w-4),yPos=clamp(y,top,innerHeight-h-4);
  const overlap=r=>Math.max(0,Math.min(left+w,r.right)-Math.max(left,r.left))*
                   Math.max(0,Math.min(yPos+h,r.bottom)-Math.max(yPos,r.top));
  const distance=Math.hypot(Math.max(0,a.left-left-w,left-a.right),
                            Math.max(0,a.top-yPos-h,yPos-a.bottom));
  const score=(lit&&overlap(key)>0?1e8:0)+4*overlap(a)+overlap(deviceBox)+overlap(screenBox)+distance+Math.hypot(x-left,y-yPos);
  if(!best||score<best.score)best={left,yPos,score};
 }
 bubble.style.left=best.left+'px';bubble.style.top=best.yPos+'px';
}
const observer=new ResizeObserver(placeGuide);
for(const element of [card,bubble,device,main,document.querySelector('.screen-frame')])observer.observe(element);
window.addEventListener('resize',placeGuide);

// Emphasize key legends, menu choices and the math the student should look for.
const focusTerms=/AC\/ON|S↔D|×10ˣ|X,θ,T|→|÷|×|\(−\)|\(\)|\b(?:MENU|DEL|EXE|OPTN|EXIT|ALPHA|SHIFT|OFF|CALC|NUM|SIN|Abs|F[1-6])\b|d\/dx|∫dx|r\s*=\s*2\s*sin\(θ\)|r\s*=|π\/2|π|x²|X²|x\s*=\s*3|[−-]?\d+(?:[./]\d+)?…?|绝对值|定积分|右方向键|right arrow|精确分数|小数|fraction|decimal|「[^」]+」/g;
function showMessage(text){
 const parts=[];
 let end=0;
 for(const match of text.matchAll(focusTerms)){
  parts.push(text.slice(end,match.index));
  const mark=document.createElement('mark');mark.textContent=match[0];parts.push(mark);
  end=match.index+match[0].length;
 }
 message.replaceChildren(...parts,text.slice(end));
}
function render(){
 replay.textContent=card.hidden?t('进入教程','Enter tutorial'):t('退出教程','Exit tutorial');
 replay.setAttribute('aria-pressed',String(!card.hidden));
 document.body.classList.toggle("guided",!card.hidden);
 placeSlot();
 if(lit)lit.classList.remove('lesson-target');
 lit=null;
 if(card.hidden)return;
 const done=index===steps.length;
 card.querySelector('strong').textContent=t(...section.title)+' · '+Math.min(index+1,steps.length)+' / '+steps.length;
 showMessage(failed?t('练习加载失败，请从顶部退出教程后重试。','Practice could not load. Exit the tutorial and try again.'):done?t(...(section.result||['练习完成。','Practice complete.'])):!ready?t('hyc正在思考🤔','hyc is thinking 🤔'):t(...steps[index].slice(1)));
 if(ready&&!done&&!failed){lit=document.querySelector('#device [data-key="'+steps[index][0]+'"]');lit?.classList.add('lesson-target')}
 placeGuide();requestAnimationFrame(placeGuide);
}
function close(){
 resetPosition();
 worker?.terminate();worker=null;card.hidden=true;render();
 window.CG50PracticeFrame(null);
 try{localStorage.setItem(seen,'1')}catch{}
}

async function start(){
 resetPosition();
 if(!heartSheet.src)heartSheet.src="./guide-heart.png";
 worker?.terminate();card.hidden=false;index=0;ready=false;busy=false;failed=false;
 screen.width=384;screen.height=216;ctx.fillStyle='#18201e';ctx.fillRect(0,0,384,216);window.CG50PracticeFrame(screen);render();
 const session=new Worker('./worker.js');worker=session;
 function fault(){if(worker===session){failed=true;render()}}
 session.onerror=fault;
 session.onmessage=({data:m})=>{
  if(worker!==session)return;
  if(m.error||m.type==='fault'){fault();return}
  if(m.type==='frame'){
   if(!index)return;
   if(screen.width!==m.width||screen.height!==m.height){screen.width=m.width;screen.height=m.height}
   ctx.putImageData(new ImageData(new Uint8ClampedArray(m.pixels),m.width,m.height),0,0);window.CG50PracticeFrame(screen);
  }else if(m.id==='boot'){ready=true;render()}
  else if(busy&&m.id===request){
   resetPosition();index++;busy=false;render();
   if(index===steps.length)playHeart();
  }
 };
 try{
  const [flash,state]=await Promise.all(['flash_full.bin','cg50_state.bin'].map(async name=>{const r=await fetch('./defaults/'+name);if(!r.ok)throw Error(r.status);return r.arrayBuffer()}));
  if(worker===session)session.postMessage({action:'boot',id:'boot',flash,state},[flash,state]);
 }catch{fault()}
}
window.CG50LessonKey=id=>{
 if(card.hidden)return false;
 if(effectFrame||!ready||busy||failed||!steps[index])return true;
 if(id!==steps[index][0]){showMessage(t('试试亮起的键。','Try the highlighted key. ')+t(...steps[index].slice(1)));placeGuide();return true}
 busy=true;worker.postMessage({id:++request,action:'key',key:id});return true;
};
const replay=document.createElement('button');
replay.type='button';document.querySelector('#cg50-reload-config').before(replay);
const menu=document.createElement('nav');
menu.id='lesson-directory';menu.hidden=true;document.body.append(menu);
replay.setAttribute('aria-controls',menu.id);
const heading=document.createElement('strong');menu.append(heading);
const entries=sections.map(item=>{
 const button=document.createElement('button');button.type='button';menu.append(button);
 button.onclick=()=>{toggleMenu(false);section=item;steps=item.keys;start()};
 return button;
});
function positionMenu(){
 if(menu.hidden)return;
 const r=replay.getBoundingClientRect();
 menu.style.left=Math.max(6,Math.min(r.left,innerWidth-menu.offsetWidth-6))+'px';
 menu.style.top=r.bottom+5+'px';menu.style.maxHeight=Math.max(60,innerHeight-r.bottom-14)+'px';
}
function toggleMenu(open){
 menu.hidden=!open;replay.setAttribute('aria-expanded',String(open));positionMenu();
 try{localStorage.setItem(seen,'1')}catch{}
}
window.addEventListener('resize',positionMenu);
document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!replay.contains(e.target))toggleMenu(false)},true);
window.addEventListener('keydown',e=>{if(!menu.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();toggleMenu(false);replay.focus()}},true);

function language(){heading.textContent=t("教程目录","Tutorials");menu.setAttribute("aria-label",heading.textContent);entries.forEach((b,i)=>b.textContent=t(...sections[i].title));positionMenu();resetSize.textContent=t("恢复默认","Reset to default");setting.querySelector("label").textContent=t("教程人物大小","Tutorial character size");render()}
applySize();language();new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
replay.onclick=()=>{if(card.hidden)toggleMenu(menu.hidden);else close()};
window.CG50TutorialWelcome=()=>{try{if(localStorage.getItem(seen))return}catch{} toggleMenu(true)};
})();