// NPCs are clearly-labelled PLACEHOLDER figures (primitives), not realistic human models.
import * as THREE from 'three';
import {heightAt,resolve,addCircle} from './physics.js';
const fig=(body,hat)=>{const g=new THREE.Group(),m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
 const b=new THREE.Mesh(new THREE.CylinderGeometry(.26,.32,1.05,10),m(body));b.position.y=.6;const h=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),m(0xd9b08c));h.position.y=1.37;
 const t=new THREE.Mesh(new THREE.ConeGeometry(.3,.22,4),m(hat));t.position.y=1.6;t.rotation.y=.8;g.add(b,h,t);return g};
export const npcs=[];let dummy=null;
const talk=[['Old Salt','Mind the tavern, matey. The doors be barred till the next update.'],['Mara','Press V to celebrate. Press E to draw your blade.'],['Bosun Pike','Try the training dummy in the plaza. Block with the right mouse button!'],['Dockhand','No ships yet. The sea be quiet for now.'],['Barkeep Nell','The Tavern is closed for repairs. Come back later.'],['Scout','The island wall keeps you safe. You cannot swim off the edge.']];
const spots=[[-4,-2,0],[-2.6,-1.4,3.4],[6,4,1],[-10,6,2],[20,6,4.4],[44,15,.5]];
const walkers=[[[-4,4],[6,4],[6,-4],[-4,-4]],[[-9,-7],[-9,6],[4,6]],[[14,2],[14,10],[2,10]]];
export function buildNPCs(scene){
 talk.forEach((t,i)=>{const[x,z,ry]=spots[i],g=fig([0x6e2b2b,0x2b4a6e,0x3a5a2e,0x5a4a2e,0x7a3a6a,0x2e5a5a][i],0x222222);g.position.set(x,heightAt(x,z),z);g.rotation.y=ry;scene.add(g);addCircle(x,z,.4);npcs.push({g,x,z,name:t[0],msg:t[1],t:i*2})});
 walkers.forEach((w,i)=>{const g=fig([0x8a6a2b,0x4a4a7a,0x6a2b4a][i],0x111111);g.position.set(w[0][0],heightAt(w[0][0],w[0][1]),w[0][1]);scene.add(g);npcs.push({g,x:w[0][0],z:w[0][1],name:['Wanderer','Fishmonger','Sailor'][i],msg:['Just taking a stroll. Fine day for it.','Fresh catch! ...Well, yesterday\'s.','Lost me ship. Found a nice island though.'][i],path:w,wp:1,t:i})});
 // training dummy (hit target that also strikes back so Block / Hit / Death can be tried)
 const g=new THREE.Group(),w=new THREE.MeshStandardMaterial({color:0x8a6a3a});const post=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,1.6,8),w);post.position.y=.8;const arm=new THREE.Mesh(new THREE.BoxGeometry(1.2,.12,.12),w);arm.position.y=1.3;const head=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshStandardMaterial({color:0xcbb89a}));head.position.y=1.75;
 const sw=new THREE.Mesh(new THREE.BoxGeometry(.06,.8,.02),new THREE.MeshStandardMaterial({color:0x888888}));sw.position.set(.6,1.3,.1);const pivot=new THREE.Group();pivot.position.set(.6,1.3,0);sw.position.set(0,.4,.1);pivot.add(sw);g.add(post,arm,head,pivot);
 const x=-1,z=-1;g.position.set(x,heightAt(x,z),z);scene.add(g);addCircle(x,z,.5);dummy={g,pivot,x,z,hp:100,wob:0,cd:4,swing:0,pending:false};
}
export function nearestNPC(px,pz,r=2.6){let best=null,bd=r;for(const n of npcs){const d=Math.hypot(n.g.position.x-px,n.g.position.z-pz);if(d<bd){bd=d;best=n}}return best}
export function updateNPCs(dt,t,player){
 for(const n of npcs){n.t+=dt;if(n.path){const p=n.path[n.wp],gp=n.g.position,dx=p[0]-gp.x,dz=p[1]-gp.z,d=Math.hypot(dx,dz);
   if(d<.4)n.wp=(n.wp+1)%n.path.length;else{const s={x:gp.x+dx/d*1.3*dt,z:gp.z+dz/d*1.3*dt};resolve(s,.35);gp.x=s.x;gp.z=s.z;n.g.rotation.y=Math.atan2(dx,dz);gp.y=heightAt(gp.x,gp.z)+Math.abs(Math.sin(n.t*7))*.05}}
  else n.g.position.y=heightAt(n.g.position.x,n.g.position.z)+Math.sin(n.t*2)*.01}
 if(!dummy)return;const D=dummy;D.wob=Math.max(0,D.wob-dt*3);D.g.rotation.z=Math.sin(t*30)*.12*D.wob;
 const dx=player.s.x-D.x,dz=player.s.z-D.z,d=Math.hypot(dx,dz);D.cd-=dt;
 if(d<3.2&&!player.dead){D.g.rotation.y=Math.atan2(dx,dz);if(D.cd<=0&&!D.pending){D.pending=true;D.swing=0}}
 if(D.pending){D.swing+=dt;D.pivot.rotation.x=-Math.sin(Math.min(1,D.swing/.6)*Math.PI)*1.6;
  if(D.swing>.35&&D.pending==true){D.pending='done';const r=d<3.4?player.damage(12):null;if(r&&onDummyHit)onDummyHit(r)}
  if(D.swing>.7){D.pending=false;D.cd=3.5;D.pivot.rotation.x=0}}}
let onDummyHit=null;export const setDummyCallback=f=>{onDummyHit=f};
export function strikeDummy(player){if(!dummy)return false;const dx=dummy.x-player.s.x,dz=dummy.z-player.s.z,d=Math.hypot(dx,dz),fx=Math.sin(player.yaw),fz=Math.cos(player.yaw);
 if(d<2.6&&(dx*fx+dz*fz)/Math.max(d,.01)>.2){dummy.wob=1;return true}return false}
