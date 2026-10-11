// Data-driven map layout shared by world, village and physics.
export const BUILDINGS=[
 {k:'tavern',x:-12,z:-14,w:12,d:9,h:5.5},
 {k:'wood',x:10,z:-14,w:7,d:6,h:4},{k:'wood',x:16,z:-3,w:6,d:6,h:3.8},{k:'wood',x:-16,z:2,w:6,d:7,h:3.8},
 {k:'stone',x:-8,z:14,w:8,d:6,h:4.2},{k:'stone',x:8,z:14,w:7,d:6,h:4}];
export const DOCK={x0:44,x1:58,z0:16.8,z1:19.4,y:.55};
export const door=b=>Math.abs(b.x)>Math.abs(b.z)?{x:b.x-Math.sign(b.x)*(b.w/2+1.2),z:b.z}:{x:b.x,z:b.z-Math.sign(b.z)*(b.d/2+1.2)};
export const PATHS=[...BUILDINGS.map(b=>{const p=door(b);return[0,0,p.x,p.z]}),[0,0,DOCK.x0,18]];
export const SPAWN={x:0,z:7};
