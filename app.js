import * as THREE from "./vendor/three.module.js";

const canvas=document.querySelector("#worldCanvas");
const screen=document.querySelector(".world-screen");
const loading=document.querySelector("#loading");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x171d28);
scene.fog=new THREE.Fog(0x171d28,19,34);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;

const camera=new THREE.PerspectiveCamera(37,1,.1,80);
const homePosition=new THREE.Vector3(8.8,6.25,11.8);
const homeTarget=new THREE.Vector3(0,2.05,-.4);
camera.position.copy(homePosition);camera.lookAt(homeTarget);

const materials={
 plaster:new THREE.MeshStandardMaterial({color:0x777078,roughness:.96}),
 side:new THREE.MeshStandardMaterial({color:0x55545f,roughness:.94}),
 floor:new THREE.MeshStandardMaterial({color:0x40383b,roughness:.9}),
 oak:new THREE.MeshStandardMaterial({color:0x65443d,roughness:.64}),
 oak2:new THREE.MeshStandardMaterial({color:0x8c6254,roughness:.66}),
 edge:new THREE.MeshStandardMaterial({color:0xb38a70,roughness:.52}),
 linen:new THREE.MeshStandardMaterial({color:0xd6c7b7,roughness:.92}),
 paper:new THREE.MeshStandardMaterial({color:0xe8ddca,roughness:1}),
 wine:new THREE.MeshStandardMaterial({color:0x75424b,roughness:.7}),
 brass:new THREE.MeshStandardMaterial({color:0xb99a6c,metalness:.72,roughness:.3}),
 dark:new THREE.MeshStandardMaterial({color:0x292a34,roughness:.55}),
 glass:new THREE.MeshPhysicalMaterial({color:0x8ca4ba,transparent:true,opacity:.25,roughness:.12,metalness:.08,transmission:.35,thickness:.3}),
 leaf:new THREE.MeshStandardMaterial({color:0x526c5c,roughness:.9}),
 leaf2:new THREE.MeshStandardMaterial({color:0x87927a,roughness:.9})
};
const room=new THREE.Group();scene.add(room);
const clickable=[];
function mat(parent,geometry,material,pos=[0,0,0],rot=[0,0,0]){
 const o=new THREE.Mesh(geometry,material);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function box(parent,w,h,d,material,pos,bevel=0){
 const g=new THREE.BoxGeometry(w,h,d);
 return mat(parent,g,material,pos);
}
function cylinder(parent,rt,rb,h,material,pos,segments=32){
 return mat(parent,new THREE.CylinderGeometry(rt,rb,h,segments),material,pos);
}
function curveTube(parent,points,r,material){
 const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 return mat(parent,new THREE.TubeGeometry(c,48,r,10,false),material);
}
function archShape(w,h,r){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-r);
 s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(w/2,0);s.closePath();return s;
}
function extrude(parent,shape,depth,material,pos,rot=[0,0,0]){
 const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:24});
 return mat(parent,g,material,pos,rot);
}
function register(group,key){group.traverse(o=>{if(o.isMesh)o.userData.room=key;});clickable.push(group);}
function addHit(parent,key,w,h,d,pos){
 const o=box(parent,w,h,d,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),pos);
 o.userData.room=key;clickable.push(o);return o;
}

// The room is built as an open-front diorama, so the camera sees into the space.
box(room,13,.24,11,materials.floor,[0,-.12,0]);
box(room,13,7.2,.22,materials.plaster,[0,3.48,-5.35]);
box(room,.22,7.2,11,materials.side,[-6.5,3.48,0]);
box(room,13,.12,.16,materials.oak2,[0,.12,-5.2]);
box(room,.12,.12,11,materials.oak2,[-6.38,.12,0]);
// Ceiling cornice and floorboard seams.
box(room,13,.14,.32,materials.oak2,[0,6.95,-5.12]);
for(let z=-4.7;z<5;z+=1.05)box(room,12.8,.012,.018,materials.oak,[0,.012,z]);

// Tall arched window on the left wall, with a deep wooden reveal and divided panes.
const windowGroup=new THREE.Group();windowGroup.position.set(-6.34,1.02,-1.25);windowGroup.rotation.y=Math.PI/2;room.add(windowGroup);
const outer=archShape(3.45,4.65,1.72),inner=archShape(3.08,4.32,1.54);
extrude(windowGroup,outer,.25,materials.oak,[0,0,0]);
extrude(windowGroup,inner,.28,materials.edge,[-.0,.12,.23]);
const paneShape=archShape(2.83,4.02,1.415);
const paneMat=new THREE.MeshPhysicalMaterial({color:0x8faec5,transparent:true,opacity:.28,roughness:.1,metalness:.08,transmission:.32});
extrude(windowGroup,paneShape,.035,paneMat,[0,.28,.33]);
box(windowGroup,.08,3.75,.1,materials.linen,[0,2.22,.43]);
box(windowGroup,2.72,.075,.1,materials.linen,[0,2.16,.43]);
box(windowGroup,2.85,.075,.1,materials.linen,[0,3.55,.43]);
curveTube(windowGroup,[[-1.43,4.05,.45],[-1.2,4.65,.45],[-.7,4.94,.45],[0,5.02,.45],[.7,4.94,.45],[1.2,4.65,.45],[1.43,4.05,.45]],.045,materials.edge);
box(windowGroup,3.8,.17,.55,materials.oak2,[0,.03,.25]);
const nightSky=new THREE.MeshBasicMaterial({color:0x26394e});
const sky=box(windowGroup,2.7,3.6,.025,nightSky,[0,2.55,.31]);sky.position.z=.31;
for(let i=0;i<18;i++){
 const x=-1.2+(i*0.371)%2.4,y=1.2+((i*0.719)%2.8);
 const star=mat(windowGroup,new THREE.SphereGeometry(.018,8,8),new THREE.MeshBasicMaterial({color:0xf1d9ad}),[x,y,.39]);star.castShadow=false;
}
// Soft curtains, modeled as pleated fabric panels with a curved top edge.
for(const side of [-1,1]){
 const curtain=new THREE.Group();curtain.position.set(side*1.65,.15,.55);windowGroup.add(curtain);
 for(let i=0;i<7;i++){
  const fold=box(curtain,.105,4.25,.18,materials.wine,[side*-i*.07,2.0,0]);
  fold.rotation.z=side*(.015+i*.012);
 }
 box(curtain,.75,.12,.24,materials.edge,[side*-.2,4.12,0]);
}
const moon=new THREE.Mesh(new THREE.CircleGeometry(.32,40),new THREE.MeshBasicMaterial({color:0xe7d7b7}));
moon.position.set(-.72,3.72,.4);windowGroup.add(moon);

// Right-side built-in bookcase with recessed back, shelves, books and cabinet doors.
const bookcase=new THREE.Group();bookcase.position.set(5.95,0,-3.85);room.add(bookcase);
box(bookcase,3.25,5.9,.42,materials.oak,[0,3,0]);
box(bookcase,2.92,5.55,.08,materials.dark,[0,3,.25]);
for(const y of [.5,1.85,3.2,4.55,5.88])box(bookcase,3.08,.13,.62,materials.oak2,[0,y,.38]);
for(const x of [-1.48,1.48])box(bookcase,.12,5.75,.6,materials.edge,[x,3,.38]);
const bookColors=[materials.wine,materials.linen,materials.oak2,materials.dark,materials.edge];
for(let level=0;level<3;level++){
 let x=-1.22;
 for(let i=0;i<5;i++){
  const width=.22+(i%3)*.055,height=.65+(i%2)*.22;
  const b=box(bookcase,width,height,.3,bookColors[(i+level)%bookColors.length],[x+width/2,.64+level*1.35+height/2,.46]);
  b.rotation.z=(i%2?-.035:.025);x+=width+.055;
 }
}
for(const x of [-.72,.72]){
 box(bookcase,1.34,1.02,.12,materials.oak2,[x,.99,.55]);
 box(bookcase,1.18,.82,.045,materials.wine,[x,.99,.63]);
 cylinder(bookcase,.045,.045,.09,materials.brass,[x+.48,.99,.72],16);
}
register(bookcase,"memories");

// Desk: a substantial writing table with a thick top, apron, inset drawers and shaped legs.
const desk=new THREE.Group();desk.position.set(-.15,0,-.15);room.add(desk);
box(desk,4.85,.22,2.12,materials.oak2,[0,1.66,0]);
box(desk,4.7,.065,1.98,materials.edge,[0,1.53,0]);
box(desk,4.45,.42,.15,materials.oak,[0,1.26,-.88]);
for(const x of [-2.05,2.05])for(const z of [-.82,.82]){
 const leg=box(desk,.19,1.55,.19,materials.oak,[x,.75,z]);leg.rotation.z=x<0?-.035:.035;
 box(desk,.29,.12,.28,materials.oak2,[x,1.48,z]);
}
for(const x of [-1.45,0,1.45]){
 box(desk,1.05,.29,.08,materials.oak2,[x,1.27,-.99]);
 box(desk,.18,.045,.055,materials.brass,[x,1.27,-1.045]);
}
box(desk,4.9,.06,.1,materials.brass,[0,1.79,1.02]);

// Desk blotter, letter sheets, open book and pen are separate tactile objects.
const blotter=box(desk,2.55,.045,1.42,materials.wine,[-.55,1.72,.15]);
const letter=new THREE.Group();letter.position.set(-1.42,1.76,.62);letter.rotation.y=-.16;desk.add(letter);
box(letter,.95,.025,1.12,materials.paper,[0,0,0]);
for(let i=0;i<6;i++)box(letter,.62,.008,.012,materials.edge,[0,.02,-.37+i*.12]);
const envelope=box(desk,.82,.035,.58,materials.linen,[.75,1.73,.48]);envelope.rotation.y=.2;
const pen=mat(desk,new THREE.CylinderGeometry(.025,.025,.9,12),materials.brass,[.95,1.79,-.05],[0,0,Math.PI/2]);
const book=new THREE.Group();book.position.set(-.15,1.79,.05);book.rotation.y=-.08;desk.add(book);
box(book,1.72,.12,1.18,materials.wine,[0,0,0]);
box(book,1.62,.055,1.1,materials.paper,[0,.075,0]);
box(book,.045,.018,1.12,materials.edge,[0,.112,0]);
for(let i=0;i<8;i++){
 box(book,.62,.008,.012,materials.edge,[-.47,.112,-.4+i*.105]);
 box(book,.62,.008,.012,materials.edge,[.47,.112,-.4+i*.105]);
}
register(book,"notes");

// A warm brass task lamp with a weighted base, articulated stem and enamel shade.
const lamp=new THREE.Group();lamp.position.set(-1.8,1.78,-.55);desk.add(lamp);
cylinder(lamp,.34,.38,.1,materials.brass,[0,.05,0]);
cylinder(lamp,.075,.1,.68,materials.brass,[0,.39,0]);
curveTube(lamp,[[0,.72,0],[.12,1.03,0],[.42,1.19,0],[.64,1.12,0]],.045,materials.brass);
const shade=mat(lamp,new THREE.CylinderGeometry(.18,.48,.42,40,1,true),materials.linen,[.65,1.0,0],[0,0,-.25]);
cylinder(lamp,.19,.19,.035,materials.brass,[.65,.79,0]);
const bulb=new THREE.PointLight(0xffc98d,34,5.4,2);bulb.position.set(.65,.82,.05);lamp.add(bulb);
const lampGlow=new THREE.PointLight(0xffbd83,12,4);lampGlow.position.set(-1.1,3.1,.2);desk.add(lampGlow);
register(lamp,"together");

// Ceramic tea set and a small vase on the far side of the desk.
const cup=new THREE.Group();cup.position.set(1.62,1.78,.55);desk.add(cup);
cylinder(cup,.23,.27,.31,materials.linen,[0,.17,0]);
cylinder(cup,.21,.21,.015,materials.wine,[0,.33,0]);
mat(cup,new THREE.TorusGeometry(.145,.038,12,28),materials.linen,[.25,.19,0],[0,Math.PI/2,0]);
cylinder(cup,.34,.34,.035,materials.edge,[0,.015,0]);
register(cup,"together");
const vase=new THREE.Group();vase.position.set(1.65,1.78,-.72);desk.add(vase);
cylinder(vase,.19,.28,.46,materials.wine,[0,.23,0]);
cylinder(vase,.095,.12,.18,materials.wine,[0,.53,0]);
for(let i=0;i<3;i++){
 const a=i*2.1;
 curveTube(vase,[[0,.6,0],[Math.cos(a)*.18,.95,Math.sin(a)*.16],[Math.cos(a)*.38,1.25,Math.sin(a)*.32]],.018,materials.leaf);
 const leaf=mat(vase,new THREE.SphereGeometry(.22,18,14),materials.leaf2,[Math.cos(a)*.38,1.22,Math.sin(a)*.32]);leaf.scale.set(1.4,.35,.7);leaf.rotation.z=Math.cos(a)*.3;
}

// Foreground upholstered chair, deliberately offset to keep the desk surface visible.
const chair=new THREE.Group();chair.position.set(1.8,0,2.6);room.add(chair);
box(chair,1.45,.2,1.25,materials.wine,[0,1.0,0]);
box(chair,1.45,1.45,.2,materials.oak2,[0,1.78,-.52]);
box(chair,1.25,.1,1.05,materials.linen,[0,1.12,.02]);
for(const x of [-.58,.58])for(const z of [-.46,.46])box(chair,.1,.92,.1,materials.oak,[x,.5,z]);
const cushion=mat(chair,new THREE.BoxGeometry(1.16,.14,.88),materials.wine,[0,1.23,.02]);cushion.scale.set(1,.7,1);

// Side table and a small lamp silhouette in the back corner.
const sideTable=new THREE.Group();sideTable.position.set(-4.5,0,1.1);room.add(sideTable);
cylinder(sideTable,.66,.72,.14,materials.oak2,[0,1.25,0]);
for(let i=0;i<3;i++){const a=i*Math.PI*2/3;box(sideTable,.1,1.2,.1,materials.oak,[Math.cos(a)*.43,.62,Math.sin(a)*.43]);}
cylinder(sideTable,.2,.25,.42,materials.wine,[0,1.52,0]);
cylinder(sideTable,.12,.19,.3,materials.linen,[0,1.88,0]);

// Low rug gives the room a grounded foreground plane without covering the floor.
const rugMat=new THREE.MeshStandardMaterial({color:0x766268,roughness:1});
const rug=mat(room,new THREE.CylinderGeometry(3.15,3.15,.035,64),rugMat,[-.2,.02,1.5]);rug.scale.set(1.2,1,.72);
for(let i=0;i<3;i++){
 const ring=mat(room,new THREE.TorusGeometry(2.7-i*.22,.012,6,80),materials.edge,[-.2,.045,1.5]);ring.scale.set(1.2,.72,1);
}

// Lighting layers: cool moonlight at the window, warm pool at the desk, soft room bounce.
scene.add(new THREE.HemisphereLight(0x9aaac4,0x34252b,1.55));
const moonLight=new THREE.DirectionalLight(0x9eb6d0,2.0);moonLight.position.set(-5,8,-1);moonLight.castShadow=true;moonLight.shadow.mapSize.set(2048,2048);moonLight.shadow.camera.left=-10;moonLight.shadow.camera.right=10;moonLight.shadow.camera.top=10;moonLight.shadow.camera.bottom=-10;scene.add(moonLight);
const warm=new THREE.PointLight(0xffbd88,24,10,2);warm.position.set(0,4.1,1.2);scene.add(warm);
const ambient=new THREE.PointLight(0xb18d9a,7,15);ambient.position.set(3,4,3);scene.add(ambient);

// Interactive objects lead to rooms. The camera remains in the same room, not a flat card overlay.
addHit(desk,"calendar",.95,.45,.95,[1.55,1.95,-.65]);
addHit(book,"notes",1.9,.45,1.4,[0,.1,0]);
addHit(bookcase,"memories",3.2,5.8,.7,[0,3,.35]);
addHit(lamp,"together",1.4,1.9,1.2,[0,.9,0]);
const rooms={
 memories:["01 / 04","记忆相册","把舍不得忘记的瞬间，收进这间小书房。","▧"],
 calendar:["02 / 04","我们的日历","纪念日与普通日子，都值得被认真记下。","▦"],
 notes:["03 / 04","留给彼此的话","写下此刻的心情，留给未来慢慢拆开。","✉"],
 together:["04 / 04","一起生活","把日常、喜欢和小小计划放进同一个空间。","♡"]
};
const dialog=document.querySelector("#roomDialog");
function openRoom(key){
 const d=rooms[key];if(!d)return;
 document.querySelector("#dialogIndex").textContent=d[0];
 document.querySelector("#dialogTitle").textContent=d[1];
 document.querySelector("#dialogDescription").textContent=d[2];
 document.querySelector("#dialogSymbol").textContent=d[3];
 if(!dialog.open)dialog.showModal();
}
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});

// Day/night is a lighting and environment transition, not a page-level color filter.
let night=true;
function setTheme(){
 scene.background.set(night?0x171d28:0xc9b8a8);scene.fog.color.copy(scene.background);
 moonLight.intensity=night?2.0:.35;warm.intensity=night?24:10;ambient.intensity=night?7:11;
 renderer.toneMappingExposure=night?1.18:1.28;
 document.body.classList.toggle("night",night);
}
document.querySelector("#themeToggle").addEventListener("click",()=>{night=!night;setTheme();});
setTheme();

let down=null,dragged=false,azimuth=0,elevation=0;
canvas.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{
 if(!down||dialog.open)return;
 const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;
 if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)dragged=true;
 if(dragged){
  azimuth=THREE.MathUtils.clamp(azimuth-dx*.0028,-.32,.32);
  elevation=THREE.MathUtils.clamp(elevation+dy*.002,-.12,.16);
  const offset=homePosition.clone().sub(homeTarget);
  offset.applyAxisAngle(new THREE.Vector3(0,1,0),azimuth);
  offset.y+=elevation*5;
  camera.position.copy(homeTarget).add(offset);camera.lookAt(homeTarget);
 }
 down.lastX=e.clientX;down.lastY=e.clientY;
});
canvas.addEventListener("pointerup",e=>{
 if(!down)return;const moved=dragged;down=null;if(moved)return;
 const r=canvas.getBoundingClientRect(),p=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));
 const ray=new THREE.Raycaster();ray.setFromCamera(p,camera);
 const hit=ray.intersectObjects(clickable,true).find(x=>x.object.userData.room);
 if(hit)openRoom(hit.object.userData.room);
});
canvas.addEventListener("pointercancel",()=>down=null);
function resize(){
 const w=screen.clientWidth,h=screen.clientHeight;
 renderer.setSize(w,h,false);camera.aspect=w/h;
 camera.fov=window.matchMedia("(max-width:700px)").matches?43:37;
 camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(screen);resize();
function animate(){requestAnimationFrame(animate);renderer.render(scene,camera);}
animate();
canvas.dataset.ready="true";loading.classList.add("hidden");
