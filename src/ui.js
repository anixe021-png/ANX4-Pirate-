// Input (keyboard, mouse, touch) and HUD. Movement and camera input are kept separate.
const $=id=>document.getElementById(id);
export const input={mx:0,my:0,run:false,block:false,e:{}};
export const look={dx:0,dy:0,zoom:0};
export const edge=k=>{const v=input.e[k];input.e[k]=false;return !!v};
const keys={};let tRun=false,tBlock=false,mBlock=false,jx=0,jy=0;
const canvas=$('c'),isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart'in window;
if(!isTouch)document.body.classList.add('nt');
addEventListener('keydown',e=>{if(e.repeat)return;keys[e.code]=true;
 if(e.code=='Space'){input.e.jump=true;e.preventDefault()}if(e.code=='KeyE')input.e.sword=true;if(e.code=='KeyV')input.e.victory=true;if(e.code=='KeyF')input.e.interact=true});
addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
export function poll(){const k=keys;let x=(k.KeyD?1:0)-(k.KeyA?1:0)+jx,y=(k.KeyW?1:0)-(k.KeyS?1:0)+jy;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}
 input.mx=x;input.my=y;input.run=!!(k.ShiftLeft||k.ShiftRight)||tRun;input.block=mBlock||tBlock}
// Mouse: first click captures the pointer, later clicks attack (left) / block (right).
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousedown',e=>{if(document.pointerLockElement!==canvas){try{canvas.requestPointerLock()}catch(_){}return}
 if(e.button==0)input.e.attack=true;if(e.button==2)mBlock=true});
addEventListener('mouseup',e=>{if(e.button==2)mBlock=false});
addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){look.dx+=e.movementX;look.dy+=e.movementY}});
addEventListener('wheel',e=>{look.zoom+=Math.sign(e.deltaY)},{passive:true});
// Touch: camera drag zone
const cz=$('camzone');let cp=null;
cz.addEventListener('pointerdown',e=>{if(cp!==null)return;cp={id:e.pointerId,x:e.clientX,y:e.clientY};cz.setPointerCapture(e.pointerId)});
cz.addEventListener('pointermove',e=>{if(cp&&e.pointerId==cp.id){look.dx+=(e.clientX-cp.x)*1.6;look.dy+=(e.clientY-cp.y)*1.6;cp.x=e.clientX;cp.y=e.clientY}});
const endCam=e=>{if(cp&&e.pointerId==cp.id)cp=null};cz.addEventListener('pointerup',endCam);cz.addEventListener('pointercancel',endCam);
// Touch: joystick
const joy=$('joy'),knob=$('knob');let jp=null;
const jmove=e=>{const r=joy.getBoundingClientRect(),R=r.width/2;let dx=(e.clientX-(r.left+R))/R,dy=(e.clientY-(r.top+R))/R;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}
 jx=Math.abs(dx)<.12?0:dx;jy=Math.abs(dy)<.12?0:-dy;knob.style.transform=`translate(${dx*40}px,${dy*40}px)`};
joy.addEventListener('pointerdown',e=>{jp=e.pointerId;joy.setPointerCapture(jp);jmove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId==jp)jmove(e)});
const jend=e=>{if(e.pointerId==jp){jp=null;jx=jy=0;knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
// Touch: action buttons (independent pointers, so they work together with the stick and camera)
document.querySelectorAll('#btns button').forEach(b=>{const k=b.dataset.k,hold=k=='run'||k=='block';
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('on');if(k=='run')tRun=true;else if(k=='block')tBlock=true;else input.e[k]=true});
 const up=()=>{b.classList.remove('on');if(hold){if(k=='run')tRun=false;else tBlock=false}};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('contextmenu',e=>e.preventDefault())});
$('tg').onclick=()=>document.body.classList.toggle('nt');
// Fullscreen (must be triggered by a click)
export async function toggleFS(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(_){$('warn').textContent='Fullscreen is not available in this browser.';say('Fullscreen is not available in this browser.',2500)}}
addEventListener('fullscreenchange',()=>{const f=!!document.fullscreenElement;$('xfs').hidden=!f;$('fs2').hidden=f});
$('fs').onclick=$('fs2').onclick=$('xfs').onclick=toggleFS;
// HUD
let mt;export function say(t,ms=3200){const m=$('msg');m.textContent=t;m.classList.add('on');clearTimeout(mt);mt=setTimeout(()=>m.classList.remove('on'),ms)}
export const hint=t=>{$('hint').textContent=t};
export const setHealth=v=>{$('hp').style.width=Math.max(0,v)+'%'};
export const setSword=t=>{$('sw').textContent='Sword: '+t};
export const setState=t=>{$('st').textContent='Animation: '+t};
export function progress(p,t){$('lb').style.width=Math.round(p*100)+'%';if(t)$('lt').textContent=t}
export function ready(onPlay){$('load').hidden=true;$('menu').hidden=false;$('play').onclick=()=>{$('menu').hidden=true;$('hud').hidden=false;try{canvas.requestPointerLock()}catch(_){}onPlay()}}
export const warn=t=>{$('warn').textContent=t};
export {isTouch};
