import * as THREE from "./vendor/three.module.js";

const canvas=document.querySelector("#worldCanvas");
const screen=document.querySelector(".world-screen");
const loading=document.querySelector("#loading");
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xdce8ed,24,48);
const camera=new THREE.OrthographicCamera(-7,7,4.5,-4.5,.1,100);
const target=new THREE.Vector3(0,2.25,0);
// Front-facing orthographic camera: straight-on view, with depth kept in the geometry and lighting.
const elevation=0,azimuth=0,radius=17;
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
function round(parent,w,h,d,material,pos,r=.08){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,material,pos){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cyl(parent,rt,rb,h,material,pos,segments=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,r,material,pos,scale=[1,1,1]){const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;parent.add(m);return m;}
function hit(parent,w,h,d,pos,room){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));m.position.set(...pos);m.userData.room=room;parent.add(m);clickables.push(m);return m;}
const desk=new THREE.Group();
clickables.splice(0,clickables.length);
scene.clear(); scene.fog=new THREE.Fog(0xe3d9d5,24,48); scene.add(hemi,sun,fill);
mat.wall.color.set(0xe4dcda);mat.side.color.set(0xcfc3c0);mat.floor.color.set(0xb6a8a3);
mat.trim.color.set(0x80666a);mat.wood.color.set(0x755c5b);mat.woodLight.color.set(0xa58a82);
mat.sofa.color.set(0x9b8587);mat.blush.color.set(0xc6a6a5);mat.cream.color.set(0xeee7e1);
mat.wine.color.set(0x70434b);mat.gold.color.set(0xb49a82);mat.paper.color.set(0xf4eee7);
// Procedural material pass inspired by the reference project: fine wood grain and handmade paper, generated locally without external image assets.
function makeGrainTexture(base,dark,light,seed){const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=384;const x=canvas.getContext("2d");x.fillStyle=base;x.fillRect(0,0,1024,384);let n=seed;const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};for(let i=0;i<18;i++){const y=rand()*384,h=8+rand()*34;x.fillStyle=rand()<.5?dark:light;x.globalAlpha=.08+rand()*.09;x.fillRect(0,y,1024,h);}x.globalAlpha=1;for(let i=0;i<620;i++){const y=rand()*384,x0=rand()*1024,len=180+rand()*900,amp=.8+rand()*3.8,phase=rand()*6.28;x.strokeStyle=rand()<.68?dark:light;x.globalAlpha=.06+rand()*.13;x.lineWidth=.5+rand()*1.3;x.beginPath();for(let k=0;k<=16;k++){const px=x0+len*k/16,py=y+Math.sin(k*.48+phase)*amp+Math.sin(k*.13+phase)*amp*.35;k?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();}x.globalAlpha=1;for(let i=0;i<2600;i++){x.fillStyle=rand()<.55?dark:light;x.globalAlpha=.035+rand()*.07;x.fillRect(rand()*1024,rand()*384,1+rand()*2,.7+rand()*1.3);}x.globalAlpha=1;const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
function makePaperTexture(){const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;const x=canvas.getContext("2d");x.fillStyle="#eee6df";x.fillRect(0,0,512,512);let n=914;for(let i=0;i<7000;i++){n=(n*1664525+1013904223)>>>0;const px=(n>>>8)%512;n=(n*1664525+1013904223)>>>0;const py=(n>>>8)%512;x.fillStyle=(n&1)?"rgba(105,70,68,.045)":"rgba(255,255,255,.18)";x.fillRect(px,py,1+(n%2),1);}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;}
mat.wood.map=makeGrainTexture("#715b56","rgba(38,25,24,.8)","rgba(218,177,158,.8)",712);mat.wood.color.set(0xffffff);mat.wood.roughness=.72;mat.wood.needsUpdate=true;
mat.woodLight.map=makeGrainTexture("#a48b80","rgba(75,49,46,.65)","rgba(238,211,193,.75)",318);mat.woodLight.color.set(0xffffff);mat.woodLight.roughness=.76;mat.woodLight.needsUpdate=true;
mat.paper.map=makePaperTexture();mat.paper.color.set(0xffffff);mat.paper.roughness=.96;mat.paper.needsUpdate=true;
const room=new THREE.Group();scene.add(room);
box(room,15,.22,10,mat.floor,[0,-.18,0]);
box(room,15,10,.22,mat.wall,[0,4.75,-4.15]);
box(room,15,.13,.18,mat.trim,[0,.05,-3.98]);

// A tall window gives the close-up its quiet sense of depth.
const win=new THREE.Group();win.position.set(0,0,-3.98);room.add(win);
round(win,4.8,4.05,.18,mat.trim,[0,6.15,0],.05);
round(win,4.52,3.78,.07,mat.glass,[0,6.15,.12],.025);
round(win,.075,3.72,.09,mat.cream,[0,6.15,.19],.015);
round(win,4.55,.075,.09,mat.cream,[0,6.15,.19],.015);
round(win,4.95,.15,.25,mat.wood,[0,4.08,.14],.035);
for(const x of [-2.58,2.58]){
  const curtain=round(win,.48,4.05,.2,mat.blush,[x,6.12,.26],.06);
  curtain.rotation.z=x<0?-.025:.025;
}

// Floating shelf, small framed memory and carefully spaced books.
const shelf=new THREE.Group();shelf.position.set(-1.43,0,-3.48);room.add(shelf);
round(shelf,1.45,.13,.58,mat.wood,[0,4.25,0],.035);
for(let i=0;i<5;i++){
  const h=.55+(i%3)*.11;
  const book=round(shelf,.17,h,.25,[mat.wine,mat.cream,mat.blush,mat.woodLight,mat.dark][i],[-.49+i*.23,4.25+h/2+.06,.02],.018);
  book.rotation.z=(i%2?-.045:.035);
}
const frame=new THREE.Group();frame.position.set(1.34,4.48,-3.48);room.add(frame);
round(frame,1.08,1.35,.13,mat.gold,[0,0,0],.035);
round(frame,.91,1.18,.05,mat.blush,[0,0,.08],.02);
round(frame,.72,.96,.025,mat.paper,[0,0,.12],.012);
const portraitGlow=new THREE.Mesh(new THREE.CircleGeometry(.22,32),new THREE.MeshBasicMaterial({color:0xc99b9b}));
portraitGlow.position.set(0,.12,.145);frame.add(portraitGlow);
hit(frame,1.18,1.45,.32,[0,0,0],"memories");

// The desk is rebuilt as a single close-up composition, not recycled room furniture.
desk.position.set(0,0,.45);room.add(desk);
round(desk,3.55,.2,1.48,mat.woodLight,[0,1.25,0],.075);
round(desk,3.42,.075,1.38,mat.wood,[0,1.125,0],.035);
for(const x of [-1.48,1.48]){
  round(desk,.16,1.08,1.12,mat.wood,[x,.54,-.02],.04);
  round(desk,.2,.12,1.18,mat.woodLight,[x,.12,-.02],.025);
}
round(desk,2.88,.16,.16,mat.wood,[0,.91,-.58],.025);
for(const x of [-.65,.65]){
  round(desk,.82,.34,.055,mat.woodLight,[x,.91,-.665],.025);
  round(desk,.09,.045,.045,mat.gold,[x,.91,-.705],.018);
}
round(desk,3.18,.045,.07,mat.gold,[0,1.39,.62],.018);

// A small stack of books, with separate page blocks and cloth-like covers.
const books=new THREE.Group();books.position.set(-.72,1.37,-.02);desk.add(books);
for(let i=0;i<3;i++){
  const y=i*.13;
  round(books,.88,.105,.58,[mat.wine,mat.woodLight,mat.blush][i],[0,y,0],.025);
  round(books,.81,.035,.54,mat.paper,[0,y+.052,.012],.012);
  round(books,.045,.075,.58,mat.gold,[-.405,y+.015,0],.012);
}
hit(books,1.05,.55,.72,[0,.14,0],"together");

// Writing paper, a folded letter and a pen.
const writing=new THREE.Group();writing.position.set(.22,1.39,.16);writing.rotation.y=-.1;desk.add(writing);
round(writing,.96,.035,.68,mat.paper,[0,0,0],.018);
round(writing,.82,.012,.52,mat.cream,[0,.022,0],.012);
for(let i=0;i<5;i++)round(writing,.54,.008,.009,mat.blush,[0,.034,-.16+i*.075],.003);
const pen=round(desk,.055,.055,.72,mat.gold,[.83,1.43,.1],.018);pen.rotation.z=-.12;
hit(writing,1.05,.22,.78,[0,.03,0],"notes");

// A compact tear-off calendar and a ceramic cup.
const cal=new THREE.Group();cal.position.set(1.14,1.39,-.18);desk.add(cal);
round(cal,.58,.78,.09,mat.paper,[0,.4,0],.025);
round(cal,.6,.14,.11,mat.wine,[0,.79,.02],.025);
for(let i=0;i<3;i++)cyl(cal,.025,.025,.12,mat.gold,[-.16+i*.16,.87,.04],12);
for(let y=0;y<3;y++)for(let x=0;x<3;x++){
  const cell=round(cal,.055,.035,.012,(x+y)%4===0?mat.wine:mat.gold,[-.17+x*.17,.28+y*.13,.06],.006);
}
hit(cal,.72,1.02,.3,[0,.42,0],"calendar");
const cup=new THREE.Group();cup.position.set(-1.12,1.39,.28);desk.add(cup);
cyl(cup,.17,.2,.26,mat.cream,[0,.13,0],40);
cyl(cup,.135,.135,.018,mat.dark,[0,.265,0],32);
const handle=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,10,24),mat.cream);
handle.position.set(.17,.15,0);cup.add(handle);
const tea=new THREE.Mesh(new THREE.CircleGeometry(.12,32),new THREE.MeshBasicMaterial({color:0x80645b}));
tea.rotation.x=-Math.PI/2;tea.position.y=.277;cup.add(tea);
hit(cup,.58,.48,.58,[0,.16,0],"together");

// Warm desk lamp, with a restrained pool of light on the writing area.
const lamp=new THREE.Group();lamp.position.set(-1.34,1.39,-.22);desk.add(lamp);
cyl(lamp,.24,.27,.075,mat.gold,[0,.04,0],32);
cyl(lamp,.045,.06,.5,mat.gold,[0,.31,0],20);
const shade=new THREE.Mesh(new THREE.ConeGeometry(.31,.36,32),mat.cream);
shade.position.set(0,.72,0);shade.rotation.x=Math.PI;lamp.add(shade);
const bulb=new THREE.PointLight(0xe8c8b9,1.8,3.2);bulb.position.set(0,.62,.05);lamp.add(bulb);

// Chair edge and a soft rug give the foreground a second depth plane.
const chairNew=new THREE.Group();chairNew.position.set(2.28,0,2.58);room.add(chairNew);
round(chairNew,1.42,.2,.92,mat.sofa,[0,1.02,0],.1);
round(chairNew,1.42,1.62,.2,mat.sofa,[0,1.82,-.38],.1);
round(chairNew,.72,.16,.48,mat.blush,[0,1.15,.06],.08);
const rugNew=new THREE.Mesh(new THREE.CylinderGeometry(3.35,3.5,.055,64),new THREE.MeshStandardMaterial({color:0xd3c3bd,roughness:1}));
rugNew.position.set(0,.015,1.62);rugNew.scale.set(1,.18,.54);room.add(rugNew);
hemi.intensity=2;sun.position.set(-5,11,8);sun.intensity=2.8;fill.position.set(7,7,-7);fill.intensity=1.1;
const deskGlow=new THREE.PointLight(0xf2cdb8,2.8,5);deskGlow.position.set(-1.05,3.1,.2);room.add(deskGlow);
target.set(0,4.05,0);placeCamera();


document.querySelector("#zoneTitle").textContent="书桌";
document.querySelector("#zoneKicker").textContent="LUNE / THE DESK";
document.querySelector("#zoneSubtitle").textContent="留一盏灯，写下今天";
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
function resize(){const w=screen.clientWidth,h=screen.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const v=window.matchMedia("(max-width:700px)").matches?8.8:9.2;camera.left=-v*aspect/2;camera.right=v*aspect/2;camera.top=v/2;camera.bottom=-v/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(screen);resize();
canvas.addEventListener("pointerup",e=>{
  const r=canvas.getBoundingClientRect();
  pointer.x=(e.clientX-r.left)/r.width*2-1;
  pointer.y=-((e.clientY-r.top)/r.height*2-1);
  raycaster.setFromCamera(pointer,camera);
  const found=raycaster.intersectObjects(clickables,true).find(h=>h.object.userData.room);
  if(found)openRoom(found.object.userData.room);
});
let night=localStorage.getItem("lune-theme")==="night";
function setTheme(){document.body.classList.toggle("night",night);hemi.color.set(night?0x9a8586:0xf8eeee);hemi.groundColor.set(night?0x302526:0x9b8887);sun.color.set(night?0xd6b9b3:0xffeee5);sun.intensity=night?1.25:2.75;fill.color.set(night?0x987b80:0xe5d1cd);fill.intensity=night?1.25:1.05;scene.fog.color.set(night?0x302526:0xe3d9d5);renderer.toneMappingExposure=night?0.9:1.02;}
document.querySelector("#themeToggle").addEventListener("click",()=>{night=!night;localStorage.setItem("lune-theme",night?"night":"day");setTheme();});setTheme();
function animate(){requestAnimationFrame(animate);renderer.render(scene,camera);}
animate();
canvas.dataset.ready="true";loading.classList.add("hidden");document.querySelector("#loadError").classList.remove("visible");

