import * as P from '../src/physics.js';
import {BUILDINGS,DOCK,SPAWN} from '../src/layout.js';
import {Animator,STATES} from '../src/animations.js';
let ok=0,bad=0;const T=(n,c)=>{c?ok++:bad++;if(!c)console.log('FAIL',n)};
BUILDINGS.forEach(b=>P.addBox(b.x,b.z,b.w+.1,b.d+.1));
// 1 walk into every building from outside for 3s: never inside walls
for(const b of BUILDINGS){const s={x:b.x-b.w/2-4,y:5,z:b.z,vy:0,grounded:false};for(let i=0;i<300;i++)P.stepPlayer(s,1/60,1,0,6.5,false);
 T('wall '+b.k,s.x<=b.x-b.w/2-.39||Math.abs(s.z-b.z)>b.d/2+.3)}
// diagonal runs into corners
for(const b of BUILDINGS){const s={x:b.x-b.w/2-3,y:5,z:b.z-b.d/2-3,vy:0,grounded:false};for(let i=0;i<400;i++)P.stepPlayer(s,1/60,.7,.7,6.5,false);
 const inside=s.x>b.x-b.w/2-.01&&s.x<b.x+b.w/2+.01&&s.z>b.z-b.d/2-.01&&s.z<b.z+b.d/2+.01;T('corner '+b.k,!inside)}
// island wall: run outward in 8 directions for 20s
for(let a=0;a<8;a++){const s={x:SPAWN.x,y:5,z:SPAWN.z,vy:0,grounded:false},dx=Math.cos(a*.785),dz=Math.sin(a*.785);for(let i=0;i<1200;i++)P.stepPlayer(s,1/60,dx,dz,6.5,false);T('wall r '+a,Math.hypot(s.x,s.z)<=P.R_WALL+1e-6)}
// gravity: spawn above ground lands; never below ground; jump leaves and returns
{const s={x:0,y:20,z:0,vy:0,grounded:false};let min=1e9;for(let i=0;i<300;i++){P.stepPlayer(s,1/60,0,0,0,false);min=Math.min(min,s.y-P.heightAt(s.x,s.z))}T('lands',s.grounded&&min>=-1e-9);
 P.stepPlayer(s,1/60,0,0,0,true);T('jump leaves ground',!s.grounded&&s.vy>0);let peak=0;for(let i=0;i<120;i++){P.stepPlayer(s,1/60,0,0,0,false);peak=Math.max(peak,s.y-P.heightAt(0,0))}T('jump peak ~1.1m',peak>.9&&peak<1.4);T('landed again',s.grounded)}
// walking on a dock: height equals deck, not underwater
T('dock height',P.heightAt((DOCK.x0+DOCK.x1)/2,18)>=DOCK.y);
// spawn is not inside any collider and is on land
{const s={...SPAWN,y:0,vy:0,grounded:true};const x0=s.x,z0=s.z;P.resolve(s,.4);T('spawn free',s.x==x0&&s.z==z0&&P.heightAt(s.x,s.z)>1)}
// slope walking stays grounded (walk from plaza to shore)
{const s={x:0,y:P.heightAt(0,0),z:30,vy:0,grounded:true};let air=0;for(let i=0;i<600;i++){P.stepPlayer(s,1/60,0,1,3.2,false);if(!s.grounded)air++}T('slope grounded mostly',air<15)}
// animator state machine with stubs
const v=()=>({x:0,y:0,z:0,set(a,b,c){this.x=a;this.y=b;this.z=c},setScalar(){}});const mk=()=>({position:v(),rotation:v(),scale:{set(){},setScalar(){}},visible:false});
const an=new Animator(mk(),mk());const seen=new Set();const run=(n,c)=>{for(let i=0;i<n;i++){an.update(1/60,c);seen.add(an.state)}};
const gr={sp:0,run:false,grounded:true,vy:0};run(30,gr);T('idle',an.state=='idle');run(30,{...gr,sp:1});T('walk',an.state=='walk');run(30,{...gr,sp:1,run:true});T('run',an.state=='run');
run(10,{sp:0,run:false,grounded:false,vy:3});T('jump',an.state=='jump');run(30,gr);
an.trigger('draw');run(10,gr);T('draw',an.state=='draw');run(60,gr);T('drawn',an.drawn&&!an.act);
let strikes=0;an.onStrike=()=>strikes++;an.trigger('attack');run(20,gr);an.trigger('attack');run(60,gr);T('combo chains',seen.has('combo')&&strikes>=2);run(120,gr);T('attack ends',!an.act);
an.setBlock(true);run(30,gr);T('block',an.state=='block');an.setBlock(false);
an.trigger('victory');run(20,gr);T('victory',an.state=='victory');run(200,gr);T('victory ends',!an.act);
an.trigger('hit');run(10,gr);T('hit',an.state=='hit');run(40,gr);
an.trigger('die');run(60,gr);T('death',an.state=='death');an.trigger('attack');T('no action after death',an.act==null);
console.log('states seen:',[...seen].join(','),'| expected:',STATES.join(','));console.log('pass',ok,'fail',bad);process.exit(bad?1:0)
