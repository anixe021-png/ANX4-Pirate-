// Pure math (no three.js): terrain height, colliders, gravity, island boundary.
import {DOCK} from './layout.js';
export const R_WALL=56,GRAVITY=18,JUMP_V=6.4;
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const boxes=[],circles=[],decks=[{...DOCK}];
export const addBox=(cx,cz,w,d)=>boxes.push({x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2});
export const addCircle=(x,z,r)=>circles.push({x,z,r});
export const colliderCount=()=>boxes.length+circles.length;
export function groundY(x,z){const r=Math.hypot(x,z);
 return 2.6*(1-sm(28,62,r))-.45-2*sm(55,80,r)+.35*Math.sin(x*.13)*Math.cos(z*.11)*sm(10,30,r)*(1-sm(30,52,r))}
export function heightAt(x,z){let h=groundY(x,z);for(const d of decks)if(x>d.x0&&x<d.x1&&z>d.z0&&z<d.z1)h=Math.max(h,d.y);return h}
export function resolve(s,rad){
 for(const b of boxes){const cx=Math.max(b.x0,Math.min(s.x,b.x1)),cz=Math.max(b.z0,Math.min(s.z,b.z1)),dx=s.x-cx,dz=s.z-cz,d=Math.hypot(dx,dz);
  if(d<rad){if(d>1e-6){s.x=cx+dx/d*rad;s.z=cz+dz/d*rad}else{const l=s.x-b.x0,r=b.x1-s.x,t=s.z-b.z0,u=b.z1-s.z,m=Math.min(l,r,t,u);
   if(m==l)s.x=b.x0-rad;else if(m==r)s.x=b.x1+rad;else if(m==t)s.z=b.z0-rad;else s.z=b.z1+rad}}}
 for(const c of circles){let dx=s.x-c.x,dz=s.z-c.z,d=Math.hypot(dx,dz);const m=c.r+rad;
  if(d<m){if(d<1e-6){dx=1;dz=0;d=1}s.x=c.x+dx/d*m;s.z=c.z+dz/d*m}}
 const r=Math.hypot(s.x,s.z),lim=R_WALL-rad;if(r>lim){s.x*=lim/r;s.z*=lim/r}}
// s = {x,y,z,vy,grounded}. Horizontal move, collision, gravity, ground snap.
export function stepPlayer(s,dt,wx,wz,speed,jump){
 s.x+=wx*speed*dt;s.z+=wz*speed*dt;resolve(s,.4);
 if(jump&&s.grounded){s.vy=JUMP_V;s.grounded=false}
 s.vy-=GRAVITY*dt;s.y+=s.vy*dt;const g=heightAt(s.x,s.z);
 if(s.y<=g){s.y=g;s.vy=0;s.grounded=true}
 else if(s.grounded&&s.vy<=0&&s.y-g<.3){s.y=g;s.vy=0}
 else s.grounded=false}
