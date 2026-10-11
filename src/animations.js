// Procedural animation for a RIGID (unskinned) model: the supplied GLB has no skeleton and no clips,
// so poses move the whole body (lean, bob, twist, squash) and the sword prop. Limbs do not bend.
const L=(a,b,t)=>a+(b-a)*t,E=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)};
export const HAND={x:-.42,y:.95,z:.18},HIP={x:-.28,y:.82,z:-.12}; // tune to the model if needed
export const STATES=['idle','walk','run','jump','draw','attack','combo','block','victory','hit','death'];
const swordRest=()=>({px:HIP.x,py:HIP.y,pz:HIP.z,rx:0,ry:0,rz:0,k:0});
export class Animator{
 constructor(rig,sword){Object.assign(this,{rig,sword,mats:[],t:0,ph:0,act:null,drawn:false,want:false,dead:false,queue:false,flash:0,air:0,land:0,vy:0,state:'idle',onStrike(){}});
  this.p={y:0,rx:0,ry:0,rz:0,sx:1,sy:1};this.s=swordRest()}
 get blocking(){return this.want&&this.drawn&&!this.act&&!this.dead}
 setBlock(on){this.want=on;if(on&&!this.drawn&&!this.act&&!this.dead)this.trigger('draw')}
 start(n,d,x){this.act={n,t:0,d,i:0,hit:false,...x};this.queue=false}
 trigger(n){if(this.dead)return;const a=this.act;
  if(n=='draw'){if(a)return;if(this.drawn)this.drawn=false;else{this.drawn=true;Object.assign(this.s,swordRest(),{k:1});this.start('draw',.7)}}
  else if(n=='attack'){if(this.want)return;if(!this.drawn){if(!a)this.trigger('draw');return}
   if(!a)this.start('attack',.55,{i:0});else if(a.n=='attack'&&a.t>a.d*.3&&a.i<2)this.queue=true}
  else if(n=='victory'){if(a&&a.n!='hit')return;if(!this.drawn){this.drawn=true;Object.assign(this.s,swordRest(),{k:1})}this.start('victory',2.4)}
  else if(n=='hit'){this.flash=1;this.start('hit',.45)}
  else if(n=='die'){this.dead=true;this.act=null;this.flash=1}}
 revive(){this.dead=false;this.act=null;this.drawn=false;this.want=false;this.flash=0}
 update(dt,c){this.t+=dt;this.vy=c.vy;const a=this.act,sp=c.sp;this.ph+=dt*(c.run?12:8)*Math.min(1,sp*3);
  if(a){a.t+=dt;if(a.n=='attack'){if(!a.hit&&a.t/a.d>.5){a.hit=true;this.onStrike(a.i)}
    if(a.t>=a.d){if(this.queue)this.start('attack',.5,{i:a.i+1});else this.act=null}}else if(a.t>=a.d)this.act=null}
  if(!c.grounded)this.air+=dt;else{if(this.air>.2)this.land=.18;this.air=0}
  const act=this.act,T={y:0,rx:0,ry:0,rz:0,sx:1,sy:1},S={px:HAND.x,py:HAND.y,pz:HAND.z,rx:.6,ry:0,rz:-.1,k:this.drawn?1:0},sn=Math.sin(this.ph),moving=sp>.05&&c.grounded;
  if(this.dead){T.rx=-1.45;T.y=.12;S.k=0;this.state='death'}
  else{
   if(!c.grounded){T.sy=1.04;T.sx=.98;T.rx=c.vy>0?-.12:.12}
   else if(moving){const r=c.run?1:0;T.y=(.04+.05*r)*Math.abs(sn);T.rx=.07+.16*r;T.rz=(.05+.03*r)*sn;T.ry=(.06+.04*r)*sn}
   else{T.sy=1+.012*Math.sin(this.t*2.2);T.rz=.012*Math.sin(this.t*1.3)}
   if(this.land>0){this.land-=dt;T.sy*=.9;T.sx=1.05}
   this.state=!c.grounded?'jump':moving?(c.run?'run':'walk'):'idle';
   if(this.blocking){S.px=0;S.py=1.1;S.pz=.42;S.rx=.3;S.rz=1.45;T.rx-=.1;this.state='block'}
   if(act){const u=Math.min(1,act.t/act.d);this.state=act.n=='attack'?(act.i>0?'combo':'attack'):act.n;
    if(act.n=='draw'){const e=E(u);S.px=L(HIP.x,HAND.x,e);S.py=L(HIP.y,HAND.y,e);S.pz=L(HIP.z,HAND.z,e);S.rx=L(2.2,.6,e);T.ry=L(-.25,0,e);S.k=1}
    else if(act.n=='attack'){const i=act.i,w=u<.3?E(u/.3):1,s=u<.3?0:u<.6?E((u-.3)/.3):1,rec=u<.6?0:E((u-.6)/.4);
     if(i==0){S.rx=u<.3?L(.6,-1.9,w):u<.6?L(-1.9,1.1,s):L(1.1,.6,rec);T.rx=.2*s*(1-rec);T.ry=-.25*w*(1-rec)}
     else if(i==1){S.rx=1.4;S.pz=.35;S.py=1.05;S.ry=u<.3?L(0,1.3,w):u<.6?L(1.3,-1.4,s):L(-1.4,0,rec);T.ry=u<.3?L(0,.5,w):u<.6?L(.5,-.6,s):L(-.6,0,rec)}
     else{S.rx=u<.3?L(.6,-1.7,w):u<.6?L(-1.7,1.2,s):L(1.2,.6,rec);S.rz=u<.3?L(-.1,-.9,w):u<.6?L(-.9,.6,s):L(.6,-.1,rec);T.ry=u<.6?L(0,-1.2,E(u/.6)):L(-1.2,0,rec);T.rx=.15*s*(1-rec)}}
    else if(act.n=='victory'){S.py=HAND.y+.95*E(u*4);S.px=HAND.x;S.rx=0;S.rz=-.12+.06*Math.sin(act.t*8);T.y=.1*Math.abs(Math.sin(act.t*6));T.rx=-.08;T.ry=.2*Math.sin(act.t*3);if(u>.9)T.y*=1-(u-.9)*10}
    else if(act.n=='hit'){T.rx=-.35*Math.sin(Math.PI*u);T.sy=.97;S.rx=.2}}}
  const k=1-Math.exp(-dt*(act&&act.n=='attack'?30:14)),p=this.p,s=this.s;
  for(const q in T)p[q]=L(p[q],T[q],k);for(const q in S)s[q]=L(s[q],S[q],k);
  this.rig.position.y=p.y;this.rig.rotation.set(p.rx,p.ry,p.rz);this.rig.scale.set(p.sx,p.sy,p.sx);
  const w=this.sword;w.position.set(s.px,s.py,s.pz);w.rotation.set(s.rx,s.ry,s.rz);w.scale.setScalar(Math.max(.001,s.k));w.visible=s.k>.03;
  this.flash=Math.max(0,this.flash-dt*2.5);for(const m of this.mats)if(m.emissive)m.emissive.setRGB(this.flash*.8,0,0)}
}
