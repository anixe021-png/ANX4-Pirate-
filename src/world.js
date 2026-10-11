import * as THREE from 'three';
import {groundY,addCircle,R_WALL} from './physics.js';
import {PATHS,BUILDINGS,DOCK} from './layout.js';
export const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const dseg=(x,z,a)=>{const[x0,z0,x1,z1]=a,dx=x1-x0,dz=z1-z0,t=Math.max(0,Math.min(1,((x-x0)*dx+(z-z0)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-x0-t*dx,z-z0-t*dz)};
let water;
export function buildWorld(scene){
 scene.background=new THREE.Color(0x86bfdc);scene.fog=new THREE.Fog(0x86bfdc,60,230);
 scene.add(new THREE.HemisphereLight(0xdff1ff,0x4a3a22,1.0));const sun=new THREE.DirectionalLight(0xfff0d0,2.2);sun.position.set(60,90,40);scene.add(sun);
 const g=new THREE.PlaneGeometry(160,160,160,160).rotateX(-Math.PI/2),p=g.attributes.position,col=new Float32Array(p.count*3),R=rng(7);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=groundY(x,z);p.setY(i,h);const n=R();let c;
  const dp=Math.min(...PATHS.map(s=>dseg(x,z,s)));
  if(dp<1.4&&h>.6)c=[.45+n*.04,.33,.21];else if(h<.9)c=[.82+n*.05,.73,.5];else c=[.2+n*.06,.44+n*.08,.18];col.set(c,i*3)}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();scene.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})));
 water=new THREE.Mesh(new THREE.PlaneGeometry(700,700).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x1a7a95,transparent:true,opacity:.82,roughness:.25}));scene.add(water);
 // dock
 const wood=new THREE.MeshStandardMaterial({color:0x6b4a2b,roughness:1}),d=DOCK;
 const deck=new THREE.Mesh(new THREE.BoxGeometry(d.x1-d.x0,.16,d.z1-d.z0),wood);deck.position.set((d.x0+d.x1)/2,d.y-.08,(d.z0+d.z1)/2);scene.add(deck);
 for(let x=d.x0+1;x<d.x1;x+=3)for(const z of[d.z0+.2,d.z1-.2]){const q=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2),wood);q.position.set(x,d.y-1,z);scene.add(q)}
 // palms & rocks (colliders registered)
 const trunk=new THREE.MeshStandardMaterial({color:0x7a5a38}),leaf=new THREE.MeshStandardMaterial({color:0x2f7d32,side:THREE.DoubleSide}),rock=new THREE.MeshStandardMaterial({color:0x7d7f82,roughness:1,flatShading:true});
 const free=(x,z)=>Math.hypot(x,z)>24&&BUILDINGS.every(b=>Math.abs(x-b.x)>b.w/2+3&&Math.abs(z-b.z)>b.d/2+3)&&!(x>DOCK.x0-4&&Math.abs(z-18)<4);
 let n=0;for(let i=0;i<400&&n<30;i++){const a=R()*6.283,r=26+R()*26,x=Math.cos(a)*r,z=Math.sin(a)*r,h=groundY(x,z);if(h<.55||!free(x,z))continue;n++;
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,4.2,7),trunk);t.position.set(x,h+2.1,z);t.rotation.set((R()-.5)*.25,0,(R()-.5)*.25);scene.add(t);
  for(let k=0;k<6;k++){const l=new THREE.Mesh(new THREE.ConeGeometry(.35,2.6,3),leaf);l.position.set(x+Math.cos(k)*.9,h+4.2,z+Math.sin(k)*.9);l.rotation.set(Math.sin(k)*1.2,0,-Math.cos(k)*1.2);scene.add(l)}addCircle(x,z,.4)}
 n=0;for(let i=0;i<300&&n<14;i++){const a=R()*6.283,r=30+R()*24,x=Math.cos(a)*r,z=Math.sin(a)*r,h=groundY(x,z);if(h<.1||!free(x,z))continue;n++;const s=.7+R()*1.1,m=new THREE.Mesh(new THREE.DodecahedronGeometry(s),rock);m.position.set(x,h+s*.4,z);m.rotation.set(R()*3,R()*3,0);m.scale.y=.7;scene.add(m);addCircle(x,z,s*.85)}
}
export const animateWorld=t=>{if(water)water.position.y=Math.sin(t*.8)*.04};
