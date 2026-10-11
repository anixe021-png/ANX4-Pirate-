import * as THREE from 'three';
import {addBox,addCircle,groundY,heightAt} from './physics.js';
import {BUILDINGS,door} from './layout.js';
const M=(c,r=1)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const mat={wood:M(0x7a5230),wood2:M(0x5b3d24),stone:M(0x8a8a86),roof:M(0x7b2a22),roof2:M(0x4a3a2c),door:M(0x2a1a10),win:new THREE.MeshStandardMaterial({color:0xffd27a,emissive:0xaa7a22,emissiveIntensity:.8}),cloth:new THREE.MeshStandardMaterial({color:0x111111,side:THREE.DoubleSide}),barrel:M(0x7b4a22),crate:M(0x9a7040)};
function label(text,w,h,bg='#3a2412',fg='#e8c46a'){const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,96);x.strokeStyle=fg;x.lineWidth=5;x.strokeRect(4,4,248,88);x.fillStyle=fg;x.font='bold 30px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(text,128,50);
 return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}))}
function building(scene,b){const gy=Math.max(groundY(b.x-b.w/2,b.z-b.d/2),groundY(b.x+b.w/2,b.z+b.d/2),groundY(b.x,b.z));
 const wm=b.k=='stone'?mat.stone:b.k=='tavern'?mat.wood2:mat.wood,g=new THREE.Group();g.position.set(b.x,gy,b.z);
 const walls=new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h+1,b.d),wm);walls.position.y=(b.h-1)/2;g.add(walls);
 const rh=b.k=='tavern'?3:2.4,roof=new THREE.Mesh(new THREE.ConeGeometry(1,rh,4).rotateY(Math.PI/4),b.k=='stone'?mat.roof2:mat.roof);roof.scale.set(b.w*.78,1,b.d*.78);roof.position.y=b.h+rh/2;g.add(roof);
 const dp=door(b),side=Math.abs(b.x)>Math.abs(b.z),sx=side?-Math.sign(b.x):0,sz=side?0:-Math.sign(b.z);
 const dr=new THREE.Mesh(new THREE.BoxGeometry(side?.12:1.3,2.3,side?1.3:.12),mat.door);dr.position.set(sx*(b.w/2+.01),1.15,sz*(b.d/2+.01));if(side)dr.position.z=0;else dr.position.x=0;g.add(dr);
 for(const o of[-2.6,2.6]){if(Math.abs(o)>(side?b.d:b.w)/2-.8)continue;const w=new THREE.Mesh(new THREE.BoxGeometry(side?.1:.9,.8,side?.9:.1),mat.win);w.position.set(side?sx*(b.w/2+.01):o,2.3,side?o:sz*(b.d/2+.01));g.add(w)}
 if(b.k=='tavern'){const s=label('THE ANX4 TAVERN',3.2,1.2);s.position.set(0,b.h-.4,sz*(b.d/2+.4));g.add(s);if(side)s.rotation.y=Math.PI/2,s.position.set(sx*(b.w/2+.4),b.h-.4,0)}
 scene.add(g);addBox(b.x,b.z,b.w+.1,b.d+.1)} // real collision box registered with physics
function barrel(scene,x,z){const y=heightAt(x,z),m=new THREE.Mesh(new THREE.CylinderGeometry(.42,.38,.95,12),mat.barrel);m.position.set(x,y+.48,z);scene.add(m);addCircle(x,z,.48)}
function crate(scene,x,z,s=.9){const y=heightAt(x,z),m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),mat.crate);m.position.set(x,y+s/2,z);m.rotation.y=(x*7+z)%1;scene.add(m);addCircle(x,z,s*.75)}
function flag(scene,x,z,h=6){const y=heightAt(x,z),p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,h,6),mat.wood);p.position.set(x,y+h/2,z);scene.add(p);
 const c=label('☠',1.8,1,'#111','#eee');c.position.set(x+.95,y+h-.6,z);scene.add(c);addCircle(x,z,.15);return c}
function table(scene,x,z){const y=heightAt(x,z),t=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.08,12),mat.wood);t.position.set(x,y+.8,z);const l=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.8,6),mat.wood2);l.position.set(x,y+.4,z);scene.add(t,l);addCircle(x,z,.75)}
export const flags=[];
export function buildVillage(scene){
 BUILDINGS.forEach(b=>building(scene,b));
 flags.push(flag(scene,0,-2,7),flag(scene,44,15.2,5));
 [[-5,-8],[-4,-8.8],[-18.5,-8],[7,-10.5],[13,-9],[-12,9],[-13,10],[0,10.5],[12,9.5],[19.5,-5]].forEach(([x,z],i)=>i%2?crate(scene,x,z,.9+(i%3)*.15):barrel(scene,x,z));
 [[46,15.6],[48,15.4],[50,20.8],[53,20.6]].forEach(([x,z],i)=>i%2?crate(scene,x,z):barrel(scene,x,z));
 table(scene,-3.5,-6.5);table(scene,-2.6,-4.8);table(scene,13,-9);
 const w=label('WELCOME TO PORT ANX4',3.4,1.1);w.position.set(2.5,heightAt(2.5,3)+2.3,3);scene.add(w);
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.3,6),mat.wood);post.position.set(2.5,heightAt(2.5,3)+1.15,3);scene.add(post);addCircle(2.5,3,.12);
}
