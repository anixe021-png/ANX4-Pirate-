import * as THREE from 'three';
import {Animator,HIP} from './animations.js';
import {stepPlayer,heightAt} from './physics.js';
import {SPAWN} from './layout.js';
import {input,edge} from './ui.js';
export const MODEL={url:'assets/models/captain_jack_sparrow.optimized.glb',fallback:'assets/models/captain_jack_sparrow.glb',yaw:0}; // yaw: set to Math.PI if the model faces backwards
const lerpAngle=(a,b,t)=>{let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t};
export class Player{
 constructor(scene){this.s={x:SPAWN.x,y:heightAt(SPAWN.x,SPAWN.z),z:SPAWN.z,vy:0,grounded:true};this.yaw=Math.PI;this.hp=100;this.dead=false;this.timer=0;this.modelLoaded=false;
  this.root=new THREE.Group();this.rig=new THREE.Group();this.root.add(this.rig);scene.add(this.root);
  const steel=new THREE.MeshStandardMaterial({color:0xc9d1d6,metalness:.8,roughness:.3}),gold=new THREE.MeshStandardMaterial({color:0xb08a2e,metalness:.6,roughness:.4});
  this.sword=new THREE.Group();const bl=new THREE.Mesh(new THREE.BoxGeometry(.05,.95,.012),steel);bl.position.y=.55;const gd=new THREE.Mesh(new THREE.BoxGeometry(.28,.04,.05),gold);gd.position.y=.06;const hl=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.2),new THREE.MeshStandardMaterial({color:0x3a2412}));hl.position.y=-.06;
  this.sword.add(bl,gd,hl);this.rig.add(this.sword);
  const sc=new THREE.Mesh(new THREE.BoxGeometry(.06,.8,.03),new THREE.MeshStandardMaterial({color:0x2a1a10}));sc.position.set(HIP.x,HIP.y,HIP.z);sc.rotation.set(1.2,0,.1);this.rig.add(sc);
  this.shadow=new THREE.Mesh(new THREE.CircleGeometry(.5,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));scene.add(this.shadow);
  this.anim=new Animator(this.rig,this.sword);this.anim.onStrike=i=>this.onStrike&&this.onStrike(i);
  this.fallback();}
 fallback(){this.ph=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0x8e1f26});const b=new THREE.Mesh(new THREE.CapsuleGeometry(.3,1,4,10),m);b.position.y=.8;const h=new THREE.Mesh(new THREE.ConeGeometry(.35,.3,12),new THREE.MeshStandardMaterial({color:0x222222}));h.position.y=1.7;this.ph.add(b,h);this.rig.add(this.ph);this.anim.mats=[m]}
 setModel(obj){if(this.ph){this.rig.remove(this.ph);this.ph=null}
  const box=new THREE.Box3().setFromObject(obj),sz=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3());
  const w=new THREE.Group();w.add(obj);obj.position.set(-c.x,-box.min.y,-c.z);const sc=(sz.y>3||sz.y<1)?1.85/sz.y:1;w.scale.setScalar(sc);w.rotation.y=MODEL.yaw;this.rig.add(w);
  const mats=new Set();obj.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))}});this.anim.mats=[...mats];this.modelLoaded=true}
 get blocking(){return this.anim.blocking}
 damage(n){if(this.dead)return'dead';if(this.blocking)return'blocked';this.hp-=n;if(this.hp<=0){this.hp=0;this.dead=true;this.timer=3;this.anim.trigger('die');return'dead'}this.anim.trigger('hit');return'hit'}
 update(dt,camYaw){const a=this.anim;
  if(this.dead){this.timer-=dt;if(this.timer<=0){this.dead=false;this.hp=100;a.revive();Object.assign(this.s,{x:SPAWN.x,z:SPAWN.z,y:heightAt(SPAWN.x,SPAWN.z),vy:0,grounded:true})}}
  else{if(edge('sword'))a.trigger('draw');if(edge('victory'))a.trigger('victory');if(edge('attack'))a.trigger('attack');a.setBlock(input.block)}
  const jump=edge('jump')&&!this.dead;let mx=input.mx,my=input.my;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}
  const f=[-Math.sin(camYaw),-Math.cos(camYaw)],r=[Math.cos(camYaw),-Math.sin(camYaw)];let wx=f[0]*my+r[0]*mx,wz=f[1]*my+r[1]*mx;
  const n=a.act&&a.act.n;let spd=input.run?6.5:3.2;if(n=='attack')spd*=.25;else if(a.blocking)spd*=.4;else if(n=='victory'||n=='draw')spd*=.5;if(this.dead||n=='hit')spd=0;
  const m=Math.hypot(wx,wz);if(m>.01&&spd>0)this.yaw=lerpAngle(this.yaw,Math.atan2(wx,wz),1-Math.exp(-dt*12));
  stepPlayer(this.s,dt,wx,wz,spd,jump);
  a.update(dt,{sp:m>.01&&spd>0?Math.min(1,m):0,run:input.run,grounded:this.s.grounded,vy:this.s.vy});
  this.root.position.set(this.s.x,this.s.y,this.s.z);this.root.rotation.y=this.yaw;
  this.shadow.position.set(this.s.x,heightAt(this.s.x,this.s.z)+.04,this.s.z);this.shadow.scale.setScalar(1-Math.min(.5,(this.s.y-heightAt(this.s.x,this.s.z))*.15))}
}
