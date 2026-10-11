import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {buildWorld,animateWorld} from './world.js';
import {buildVillage,flags} from './village.js';
import {buildNPCs,updateNPCs,nearestNPC,strikeDummy,setDummyCallback} from './npc.js';
import {Player,MODEL} from './player.js';
import {heightAt,colliderCount} from './physics.js';
import {input,look,edge,poll,progress,ready,say,hint,setHealth,setSword,setState,warn,isTouch} from './ui.js';
const canvas=document.getElementById('c'),renderer=new THREE.WebGLRenderer({canvas,antialias:!isTouch,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(65,1,.1,400);
const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};addEventListener('resize',resize);resize();
buildWorld(scene);buildVillage(scene);buildNPCs(scene);
const player=new Player(scene);
player.onStrike=()=>{if(strikeDummy(player))say('Hit the training dummy!',900)};
setDummyCallback(r=>say(r=='blocked'?'Blocked!':r=='hit'?'Ouch! The dummy struck you.':'You were defeated. Respawning...',1500));
const cam={yaw:0,pitch:.35,dist:5.5};let started=false;
// Load the character: try an optimized copy first, then the original GLB. No model = clearly labelled placeholder.
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const load=url=>new Promise((res,rej)=>loader.load(url,res,e=>{if(e.total)progress(e.loaded/e.total,`Loading character ${(e.loaded/1048576).toFixed(0)} / ${(e.total/1048576).toFixed(0)} MB`)},rej));
(async()=>{progress(0,'Loading character…');let g=null;
 try{g=await load(MODEL.url)}catch(_){try{g=await load(MODEL.fallback)}catch(e){console.error(e)}}
 if(g){player.setModel(g.scene);progress(1,'Ready')}else{progress(1,'Character model not found');warn('Could not load assets/models/captain_jack_sparrow.glb. Run the game from a local web server and keep the GLB in assets/models/. A placeholder is shown.')}
 ready(()=>{started=true})})();
const clock=new THREE.Clock();let T=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);T+=dt;
 if(started){poll();
  cam.yaw-=look.dx*.0028;cam.pitch=Math.min(1.2,Math.max(-.15,cam.pitch+look.dy*.0028));cam.dist=Math.min(10,Math.max(2.5,cam.dist+look.zoom*.6));look.dx=look.dy=look.zoom=0;
  player.update(dt,cam.yaw);updateNPCs(dt,T,player);
  if(edge('interact')){const n=nearestNPC(player.s.x,player.s.z);if(n)say(`${n.name}: ${n.msg}`);else say('Nothing to interact with here.',1200)}
  const n=nearestNPC(player.s.x,player.s.z);hint(n&&!player.dead?`Press F to talk to ${n.name}`:player.dead?'You were defeated...':'');
  setHealth(player.hp);setSword(player.blocking?'blocking':player.anim.drawn?'drawn':'sheathed');setState(player.anim.state);
  const tx=player.s.x,ty=player.s.y+1.5,tz=player.s.z,cp=Math.cos(cam.pitch),want=new THREE.Vector3(tx+Math.sin(cam.yaw)*cp*cam.dist,ty+Math.sin(cam.pitch)*cam.dist,tz+Math.cos(cam.yaw)*cp*cam.dist);
  want.y=Math.max(want.y,heightAt(want.x,want.z)+.5);camera.position.lerp(want,1-Math.exp(-dt*14));camera.lookAt(tx,ty-.2,tz)}
 else{camera.position.set(Math.sin(T*.1)*30,14,Math.cos(T*.1)*30);camera.lookAt(0,2,0)}
 flags.forEach((f,i)=>f.rotation.y=Math.sin(T*2+i)*.25);animateWorld(T);renderer.render(scene,camera)}
frame();
window.ANX4={player,scene,camera,colliderCount};
