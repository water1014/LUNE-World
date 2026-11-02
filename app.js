import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js";

const canvas=document.querySelector("#worldCanvas");
const screen=document.querySelector(".world-screen");
const loading=document.querySelector("#loading");
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xdce8ed,24,48);
const camera=new THREE.OrthographicCamera(-7,7,4.5,-4.5,.1,100);
const target=new THREE.Vector3(0,1.35,0);
const elevation=.58,azimuth=.68,radius=17;
function placeCamera(){camera.position.set(target.x+Math.sin(azimuth)*Math.cos(elevation)*radius,target.y+Math.sin(elevation)*radius,Math.cos(azimuth)*Math.cos(elevation)*radius);camera.lookAt(target);camera.updateProjectionMatrix();}
placeCamera();
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
const hemi=new THREE.HemisphereLight(0xf5fbff,0x8297a2,2.25);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xf1f8ff,3.05);sun.position.set(-7,12,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.00025;scene.add(sun);
const fill=new THREE.DirectionalLight(0xc7dce8,1.25);fill.position.set(8,7,-8);scene.add(fill);
const mat={
 wall:new THREE.MeshStandardMaterial({color:0xdce7e9,roughness:.94}),
 side:new THREE.MeshStandardMaterial({color:0xc8d8dd,roughness:.94}),
 floor:new THREE.MeshStandardMaterial({color:0xb8cbd0,roughness:.92}),
 floor2:new THREE.MeshStandardMaterial({color:0xc8d9dc,roughness:.92}),
 trim:new THREE.MeshStandardMaterial({color:0x829da6,roughness:.7}),
 wood:new THREE.MeshStandardMaterial({color:0x8b9da0,roughness:.68}),
 woodLight:new THREE.MeshStandardMaterial({color:0xb2c4c5,roughness:.72}),
 sofa:new THREE.MeshStandardMaterial({color:0x9eb8c1,roughness:.94}),
 blush:new THREE.MeshStandardMaterial({color:0xc2d4d8,roughness:.94}),
 cream:new THREE.MeshStandardMaterial({color:0xe8eff0,roughness:.92}),
 wine:new THREE.MeshStandardMaterial({color:0x718c98,roughness:.72}),
 leaf:new THREE.MeshStandardMaterial({color:0x829b8e,roughness:.88}),
 leaf2:new THREE.MeshStandardMaterial({color:0xa7b9a2,roughness:.9}),
 gold:new THREE.MeshStandardMaterial({color:0xaab8b6,metalness:.18,roughness:.48}),
 glass:new THREE.MeshPhysicalMaterial({color:0xc8e1e8,roughness:.18,metalness:.025,transparent:true,opacity:.54}),
 dark:new THREE.MeshStandardMaterial({color:0x617780,roughness:.72}),
 paper:new THREE.MeshStandardMaterial({color:0xf1f5f3,roughness:.94})
};
const clickables=[];
function round(parent,w,h,d,material,pos,r=.08){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,material,pos){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cyl(parent,rt,rb,h,material,pos,segments=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,r,material,pos,scale=[1,1,1]){const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;parent.add(m);return m;}
function hit(parent,w,h,d,pos,room){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));m.position.set(...pos);m.userData.room=room;parent.add(m);clickables.push(m);return m;}
function makePlant(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);cyl(g,.28,.21,.4,mat.cream,[0,.2,0]);cyl(g,.29,.29,.06,mat.gold,[0,.42,0]);cyl(g,.025,.035,.9,mat.leaf,[0,.83,0],10);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const l=sphere(g,.17, i%2?mat.leaf:mat.leaf2,[Math.cos(a)*.28,.9+(i%3)*.12,Math.sin(a)*.28],[.7,2.1,.55]);l.rotation.z=-Math.cos(a)*.5;l.rotation.x=Math.sin(a)*.4;}return g;}
function makeZoneMarker(x,label){const g=new THREE.Group();g.position.set(x,0,-3.05);scene.add(g);box(g,1.35,.05,.05,mat.gold,[0,2.45,0]);const p=box(g,.018,.55,.018,mat.gold,[-.66,2.18,0]);p.castShadow=false;}

// A continuous architectural shell: three connected spaces, not three cards.
box(scene,27,.22,8,mat.floor,[0,-.12,0]);
box(scene,27,5.35,.2,mat.wall,[0,2.67,-4]);
box(scene,.2,5.35,8,mat.side,[-13.5,2.67,0]);
box(scene,.2,5.35,8,mat.side,[13.5,2.67,0]);
box(scene,27,.16,.13,mat.trim,[0,.08,-3.88]);
for(let x=-12.8;x<=12.81;x+=.72)box(scene,.012,.008,7.8,mat.floor2,[x,.002,0]);
for(let x=-8.8;x<=8.81;x+=8.8){box(scene,.12,5.2,.16,mat.trim,[x,2.6,-3.88]);box(scene,.12,5.2,.16,mat.trim,[x,2.6,3.88]);}
for(let x=-12.5;x<=12.51;x+=1.8)box(scene,.025,4.55,.035,mat.trim,[x,2.55,-3.86]);

// Garden zone on the left.
const gardenRug=cyl(scene,2.25,2.25,.045,new THREE.MeshStandardMaterial({color:0xc4d4d5,roughness:1}),[-9,.02,.35],48);gardenRug.scale.set(1,.22,1);
makePlant(-11.7,-1.1,1.45);makePlant(-7.1,-1.1,1.18);makePlant(-11.2,2.1,.9);
const tree=new THREE.Group();tree.position.set(-9.4,0,-1.65);scene.add(tree);
cyl(tree,.15,.2,2.25,mat.wood,[0,1.1,0],16);
sphere(tree,.95,mat.leaf,[-.25,2.25,0],[1.05,1.1,.8]);sphere(tree,.78,mat.leaf2,[.45,2.55,-.12],[1,.95,.82]);sphere(tree,.72,mat.leaf,[-.75,2.72,-.1],[.95,.9,.75]);
const gardenBench=new THREE.Group();gardenBench.position.set(-9.1,0,1.75);scene.add(gardenBench);
round(gardenBench,2,.16,.55,mat.wood,[0,.72,0],.06);for(const x of [-.78,.78]){box(gardenBench,.12,.7,.48,mat.wood,[x,.36,0]);}round(gardenBench,2,.72,.13,mat.wood,[0,1.12,-.22],.05);
const gardenArch=new THREE.Group();gardenArch.position.set(-12.1,0,-2.9);scene.add(gardenArch);
round(gardenArch,.14,2.8,.16,mat.gold,[-.9,1.4,0],.05);round(gardenArch,.14,2.8,.16,mat.gold,[.9,1.4,0],.05);round(gardenArch,1.9,.14,.16,mat.gold,[0,2.78,0],.05);
for(let i=0;i<5;i++){const f=sphere(gardenArch,.13,mat.leaf2,[-.72+i*.35,2.55,0],[.8,1.5,.7]);f.rotation.z=-.35+i*.15;}
hit(gardenBench,2.4,1.6,1.1,[0,.85,0],"together");

// Living room in the middle.
const windowG=new THREE.Group();windowG.position.set(-1.95,0,-3.78);scene.add(windowG);
box(windowG,2.65,2.55,.16,mat.trim,[0,3.05,0]);box(windowG,2.38,2.28,.06,mat.glass,[0,3.05,.09]);
box(windowG,.07,2.25,.08,mat.cream,[0,3.05,.14]);box(windowG,2.35,.07,.08,mat.cream,[0,3.05,.14]);box(windowG,2.8,.16,.34,mat.wood,[0,1.77,.12]);
const sunDisc=sphere(windowG,.22,new THREE.MeshBasicMaterial({color:0xf4f4e8}),[-.58,3.65,.16]);
const rug=cyl(scene,2.3,2.3,.05,mat.cream,[.1,.02,.5],56);rug.scale.set(1,.22,1);
const sofa=new THREE.Group();sofa.position.set(0,0,-.1);scene.add(sofa);
round(sofa,3.1,.55,1.1,mat.sofa,[0,.65,0],.18);round(sofa,3.1,1.12,.34,mat.sofa,[0,1.2,-.47],.17);
round(sofa,.42,.85,1.08,mat.sofa,[-1.34,.92,-.02],.15);round(sofa,.42,.85,1.08,mat.sofa,[1.34,.92,-.02],.15);
round(sofa,1.35,.2,.8,mat.blush,[-.72,1.01,.12],.12);round(sofa,1.35,.2,.8,mat.blush,[.72,1.01,.12],.12);
round(sofa,.7,.65,.2,mat.cream,[-.82,1.38,-.28],.12).rotation.z=-.12;round(sofa,.7,.65,.2,mat.wine,[.76,1.38,-.28],.12).rotation.z=.12;
for(const x of [-1.15,1.15])for(const z of [-.42,.38])cyl(sofa,.055,.07,.42,mat.wood,[x,.24,z],12);
hit(sofa,3.4,1.8,1.4,[0,1.05,0],"together");
const table=new THREE.Group();table.position.set(.1,0,1.65);scene.add(table);
const tableTop=cyl(table,.92,.92,.14,mat.wood,[0,.72,0],48);tableTop.scale.z=.72;
for(const [x,z] of [[-.55,-.38],[.55,-.38],[-.55,.38],[.55,.38]])cyl(table,.045,.06,.68,mat.gold,[x,.36,z],12);
round(table,.44,.08,.32,mat.wine,[-.2,.84,-.08],.02).rotation.y=-.15;
cyl(table,.12,.14,.18,mat.cream,[.38,.91,.12],24);cyl(table,.085,.085,.008,mat.dark,[.38,1.005,.12],24);
const sideboard=new THREE.Group();sideboard.position.set(-3.1,0,-2.3);scene.add(sideboard);
round(sideboard,1.35,.72,.55,mat.wood,[0,.48,0],.07);round(sideboard,1.42,.12,.6,mat.cream,[0,.9,0],.04);
for(const x of [-.5,.5])cyl(sideboard,.035,.04,.4,mat.gold,[x,.2,0],12);
const photo=new THREE.Group();photo.position.set(-.15,1.04,-.1);sideboard.add(photo);
round(photo,.56,.72,.09,mat.gold,[0,.35,0],.025);round(photo,.45,.6,.035,mat.wine,[0,.35,.06],.01);sphere(photo,.13,mat.cream,[0,.37,.09],[1,.8,.3]);
hit(photo,.8,1.1,.3,[0,.4,0],"memories");
const calendar=new THREE.Group();calendar.position.set(1.7,0,-2.95);scene.add(calendar);
round(calendar,.72,.94,.12,mat.cream,[0,1.05,0],.04);round(calendar,.74,.16,.15,mat.wine,[0,1.52,.03],.035);
for(let i=0;i<3;i++)cyl(calendar,.035,.035,.12,mat.gold,[-.2+i*.2,1.59,.04],12);
for(let y=0;y<3;y++)for(let x=0;x<3;x++)box(calendar,.065,.045,.018,(x+y)%3===0?mat.wine:mat.gold,[-.2+x*.2,.92+y*.15,.075]);
hit(calendar,.95,1.3,.3,[0,1.1,0],"calendar");
const note=new THREE.Group();note.position.set(1.9,.95,1.55);note.rotation.y=-.28;scene.add(note);
round(note,.52,.36,.035,mat.paper,[0,0,0],.025);hit(note,.7,.55,.2,[0,0,0],"notes");
const lamp=new THREE.Group();lamp.position.set(3.35,0,-.2);scene.add(lamp);
cyl(lamp,.07,.08,1.75,mat.gold,[0,.9,0],20);cyl(lamp,.43,.43,.1,mat.wood,[0,.08,0],32);
const shade=new THREE.Mesh(new THREE.CylinderGeometry(.25,.55,.58,32,1,true),mat.cream);shade.position.y=1.95;lamp.add(shade);
const bulb=new THREE.PointLight(0xe3eff0,8,4);bulb.position.set(0,1.7,0);lamp.add(bulb);
makePlant(3.8,2.0,.82);

// Study zone on the right.
const bookcase=new THREE.Group();bookcase.position.set(8.6,0,-3.45);scene.add(bookcase);
round(bookcase,2.45,3.35,.48,mat.wood,[0,1.72,0],.06);
for(const y of [.62,1.55,2.48]){box(bookcase,2.35,.1,.55,mat.gold,[0,y,.04]);}
for(let row=0;row<3;row++){let x=-.88;for(let n=0;n<6;n++){const w=.16+(n%3)*.035,h=.55+(n%2)*.15;const b=round(bookcase,w,h,.12,[mat.wine,mat.cream,mat.blush,mat.leaf][(n+row)%4],[x+w/2,.94+row*.93+h/2,.12],.018);b.rotation.z=(n%2?-.05:.04);x+=w+.08;}}
const desk=new THREE.Group();desk.position.set(9.6,0,.85);scene.add(desk);
round(desk,3.1,.18,1.25,mat.woodLight,[0,1.2,0],.08);
for(const x of [-1.28,1.28]){round(desk,.13,1.18,.95,mat.wood,[x,.59,0],.04);}
round(desk,.65,.06,.45,mat.paper,[-.55,1.32,-.12],.015).rotation.y=-.08;
round(desk,.42,.07,.32,mat.wine,[.55,1.33,-.08],.02);
const deskLamp=new THREE.Group();deskLamp.position.set(-1.05,1.3,-.25);desk.add(deskLamp);
cyl(deskLamp,.035,.04,.5,mat.gold,[0,.25,0],12);cyl(deskLamp,.34,.34,.07,mat.gold,[0,.05,0],24);
const deskShade=new THREE.Mesh(new THREE.ConeGeometry(.32,.42,24),mat.cream);deskShade.position.set(0,.58,0);deskLamp.add(deskShade);
const chair=new THREE.Group();chair.position.set(9.5,0,2.15);scene.add(chair);
round(chair,1.05,.18,.85,mat.sofa,[0,.72,0],.08);round(chair,1.05,1.25,.16,mat.sofa,[0,1.32,-.36],.08);
for(const x of [-.4,.4])cyl(chair,.035,.04,.68,mat.gold,[x,.34,.28],12);
hit(desk,3.6,2.4,1.8,[0,1.1,0],"notes");
hit(bookcase,2.8,3.7,.8,[0,1.8,0],"memories");
makePlant(12.1,2.5,.9);

// Architectural dividers, soft rugs and little floor lights establish each room as a connected place.
for(const x of [-4.5,4.5]){const post=round(scene,.22,4.9,.22,mat.trim,[x,2.45,-3.75],.05);post.castShadow=true;}
for(const x of [-8.5,0,8.5]){const glow=new THREE.PointLight(0xd7e9ed,2.2,5);glow.position.set(x,3.2,-1.8);scene.add(glow);}
makeZoneMarker(-9,"GARDEN");makeZoneMarker(0,"LIVING");makeZoneMarker(9,"STUDY");

const zones=[
 {title:"花园",kicker:"01 / THE GARDEN",subtitle:"把日子种成喜欢的样子",x:-9},
 {title:"客厅",kicker:"02 / THE LIVING ROOM",subtitle:"在寻常日子里，好好相处",x:0},
 {title:"书房",kicker:"03 / THE STUDY",subtitle:"留一盏灯，也留一点时间",x:9}
];
let activeZone=1;
function goZone(index,animate=true){activeZone=THREE.MathUtils.clamp(index,0,2);target.x=zones[activeZone].x;placeCamera();document.querySelector("#zoneTitle").textContent=zones[activeZone].title;document.querySelector("#zoneKicker").textContent=zones[activeZone].kicker;document.querySelector("#zoneSubtitle").textContent=zones[activeZone].subtitle;document.querySelector("#zoneCounter").textContent=String(activeZone+1).padStart(2,"0")+" — 03";document.querySelectorAll("[data-zone]").forEach(b=>b.classList.toggle("active",Number(b.dataset.zone)===activeZone));}
document.querySelectorAll("[data-zone]").forEach(b=>b.addEventListener("click",()=>goZone(Number(b.dataset.zone))));
const roomData={
 memories:{index:"01 / 04",title:"记忆相册",description:"把那些舍不得忘记的瞬间，好好收在这里。",symbol:"▧"},
 calendar:{index:"02 / 04",title:"我们的日历",description:"纪念日、计划和普通日子，都可以认真对待。",symbol:"▦"},
 notes:{index:"03 / 04",title:"留给彼此的话",description:"一些来不及说出口的话，先放在这里。",symbol:"✉"},
 together:{index:"04 / 04",title:"一起生活",description:"属于我们的角落，慢慢添上喜欢的东西。",symbol:"♡"}
};
const dialog=document.querySelector("#roomDialog");
function openRoom(key){const d=roomData[key];if(!d)return;document.querySelector("#dialogIndex").textContent=d.index;document.querySelector("#dialogTitle").textContent=d.title;document.querySelector("#dialogDescription").textContent=d.description;document.querySelector("#dialogSymbol").textContent=d.symbol;if(!dialog.open)dialog.showModal();}
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function resize(){const w=screen.clientWidth,h=screen.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const v=window.matchMedia("(max-width:700px)").matches?8.3:8.7;camera.left=-v*aspect/2;camera.right=v*aspect/2;camera.top=v/2;camera.bottom=-v/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(screen);resize();
let down=false,moved=false,startX=0,lastX=0,startY=0;
canvas.addEventListener("pointerdown",e=>{down=true;moved=false;startX=lastX=e.clientX;startY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-lastX;if(Math.abs(e.clientX-startX)>7)moved=true;target.x=THREE.MathUtils.clamp(target.x-dx*(window.matchMedia("(max-width:700px)").matches ? 0.045 : 0.035),-9.5,9.5);lastX=e.clientX;placeCamera();});
canvas.addEventListener("pointerup",e=>{down=false;if(moved){const nearest=zones.reduce((best,z,i)=>Math.abs(z.x-target.x)<Math.abs(zones[best].x-target.x)?i:best,0);goZone(nearest);return;}const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-((e.clientY-r.top)/r.height*2-1);raycaster.setFromCamera(pointer,camera);const found=raycaster.intersectObjects(clickables,true).find(h=>h.object.userData.room);if(found)openRoom(found.object.userData.room);});
canvas.addEventListener("pointercancel",()=>down=false);
canvas.addEventListener("wheel",e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){target.x=THREE.MathUtils.clamp(target.x+e.deltaX*.018,-9.5,9.5);placeCamera();}}, {passive:true});
let night=localStorage.getItem("lune-theme")==="night";
function setTheme(){document.body.classList.toggle("night",night);hemi.color.set(night?0x858094:0xf5fbff);hemi.groundColor.set(night?0x342b3b:0x8297a2);sun.color.set(night?0xb7b0d0:0xf1f8ff);sun.intensity=night?1.45:3.05;fill.intensity=night?1.65:1.25;sunDisc.material.color.set(night?0xe3d9f5:0xf4f4e8);scene.fog.color.set(night?0x302831:0xdce8ed);renderer.toneMappingExposure=night ? 0.92 : 1.04;}
document.querySelector("#themeToggle").addEventListener("click",()=>{night=!night;localStorage.setItem("lune-theme",night?"night":"day");setTheme();});setTheme();
function animate(){requestAnimationFrame(animate);renderer.render(scene,camera);}
animate();
canvas.dataset.ready="true";loading.classList.add("hidden");document.querySelector("#loadError").classList.remove("visible");
goZone(1);
