import * as THREE from "./vendor/three.module.js";

const canvas = document.querySelector("#worldCanvas");
const screen = document.querySelector(".world-screen");
const loading = document.querySelector("#loading");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8cecc);
scene.fog = new THREE.Fog(0xd8cecc, 22, 42);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
const homePosition = new THREE.Vector3(11.2, 8.1, 15.2);
const homeTarget = new THREE.Vector3(0, 2.45, -.8);
camera.position.copy(homePosition);
camera.lookAt(homeTarget);

const hemi = new THREE.HemisphereLight(0xfff5f1, 0x68585c, 2.1); scene.add(hemi);
const keyLight = new THREE.DirectionalLight(0xffe9df, 3.2);
keyLight.position.set(-5, 10, 7); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.camera.left = -12; keyLight.shadow.camera.right = 12; keyLight.shadow.camera.top = 12; keyLight.shadow.camera.bottom = -12; keyLight.shadow.bias = -.0003; scene.add(keyLight);
const windowLight = new THREE.DirectionalLight(0xfff3e9, 1.5); windowLight.position.set(-2, 5, -7); scene.add(windowLight);
const fill = new THREE.PointLight(0xd8aeb1, 24, 14); fill.position.set(2, 4, 3); scene.add(fill);

const mats = {
  wall: new THREE.MeshStandardMaterial({color:0xd8c9c9,roughness:.96}),
  wallSide: new THREE.MeshStandardMaterial({color:0xc5b5b7,roughness:.95}),
  floor: new THREE.MeshStandardMaterial({color:0xb49c99,roughness:.9}),
  wood: new THREE.MeshStandardMaterial({color:0x76545a,roughness:.72}),
  woodMid: new THREE.MeshStandardMaterial({color:0x98777a,roughness:.72}),
  woodLight: new THREE.MeshStandardMaterial({color:0xc5a9a6,roughness:.76}),
  ivory: new THREE.MeshStandardMaterial({color:0xf0e7e2,roughness:.84}),
  paper: new THREE.MeshStandardMaterial({color:0xf4eae3,roughness:.98}),
  rose: new THREE.MeshStandardMaterial({color:0xb78388,roughness:.86}),
  wine: new THREE.MeshStandardMaterial({color:0x633c46,roughness:.74}),
  brass: new THREE.MeshStandardMaterial({color:0xb59a78,metalness:.62,roughness:.36}),
  glass: new THREE.MeshPhysicalMaterial({color:0xd8e0e1,transparent:true,opacity:.22,roughness:.12,metalness:.04,transmission:.25,thickness:.2}),
  green: new THREE.MeshStandardMaterial({color:0x687e69,roughness:.9}),
  green2: new THREE.MeshStandardMaterial({color:0x91a18a,roughness:.92})
};
const root = new THREE.Group(); scene.add(root);
const clickable = [];
function mesh(parent, geo, mat, pos=[0,0,0], rot=[0,0,0]) {
  const o = new THREE.Mesh(geo,mat); o.position.set(...pos); o.rotation.set(...rot); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o;
}
function box(parent,w,h,d,mat,pos,bevel=.04) {
  const o=mesh(parent,new THREE.BoxGeometry(w,h,d),mat,pos);
  return o;
}
function cyl(parent,r1,r2,h,mat,pos,seg=32) { return mesh(parent,new THREE.CylinderGeometry(r1,r2,h,seg),mat,pos); }
function sphere(parent,r,mat,pos,scale=[1,1,1]) { const o=mesh(parent,new THREE.SphereGeometry(r,24,18),mat,pos); o.scale.set(...scale); return o; }
function tube(parent,points,r,mat) { const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))); return mesh(parent,new THREE.TubeGeometry(curve,48,r,10,false),mat); }
function pick(group,key){ group.traverse(o=>{if(o.isMesh){o.userData.room=key;}}); clickable.push(...group.children); }
function rounded(parent,w,h,d,mat,pos,r=.08){
  const g=new THREE.Group();g.position.set(...pos);parent.add(g);
  box(g,w,h,d,mat,[0,0,0]);
  // Soft corner accents make the furniture read less like primitive blocks.
  for(const sx of [-1,1])for(const sz of [-1,1])cyl(g,r,r,h,mat,[sx*(w/2-r),0,sz*(d/2-r)],12);
  return g;
}

// Room shell: two visible walls, a broad floor, skirting and ceiling-edge trim.
box(root,15,.22,13,mats.floor,[0,-.12,0]);
box(root,15,8,.24,mats.wall,[0,3.9,-5.5]);
box(root,.24,8,13,mats.wallSide,[-7.5,3.9,1]);
box(root,.24,8,13,mats.wall,[7.5,3.9,1]);
box(root,15,.16,.18,mats.woodMid,[0,.08,-5.34]);
box(root,.16,.16,13,mats.woodMid,[-7.34,.08,1]);
box(root,.16,.16,13,mats.woodMid,[7.34,.08,1]);

// Large arched window with deep reveal, mullions, glass and softly folded curtains.
const win=new THREE.Group();win.position.set(-7.28,0,-1.45);win.rotation.y=Math.PI/2;root.add(win);
box(win,4.15,4.25,.28,mats.wood,[0,4.25,0]);
box(win,3.84,3.85,.12,mats.glass,[0,4.23,.18]);
box(win,3.84,.12,.16,mats.ivory,[0,4.15,.29]);
box(win,.11,3.82,.16,mats.ivory,[0,4.18,.29]);
box(win,.1,3.82,.16,mats.ivory,[-1.85,4.18,.29]);
box(win,.1,3.82,.16,mats.ivory,[1.85,4.18,.29]);
box(win,3.82,.1,.16,mats.ivory,[0,5.35,.29]);
box(win,3.82,.1,.16,mats.ivory,[0,3.05,.29]);
const archPts=[];
for(let i=0;i<=24;i++){const a=Math.PI-i/24*Math.PI;archPts.push([Math.cos(a)*1.9,6.08+Math.sin(a)*1.9,.3]);}
tube(win,archPts,.105,mats.ivory);
box(win,4.45,.18,.52,mats.woodMid,[0,2.1,.22]);
for(const x of [-2.1,2.1]){
  const curtain=new THREE.Group();curtain.position.set(x,4.2,.48);win.add(curtain);
  for(let i=0;i<5;i++){const fold=box(curtain,.17,4.15,.24,mats.rose,[(x<0?1:-1)*i*.11,0,0]);fold.rotation.z=(x<0?1:-1)*(.02+i*.009);}
  box(curtain,.8,.14,.3,mats.ivory,[x<0?.18:-.18,2.12,0]);
}
const windowGlow=new THREE.PointLight(0xffe5d9,32,10);windowGlow.position.set(-2.7,5.2,-2.8);root.add(windowGlow);

// A full desk with apron, drawers, tapered legs, handles and a visible side profile.
const desk=new THREE.Group();desk.position.set(.15,0,-.15);root.add(desk);
box(desk,5.25,.22,2.25,mats.woodMid,[0,1.62,0]);
box(desk,5.1,.09,2.1,mats.woodLight,[0,1.48,0]);
box(desk,4.75,.5,.22,mats.wood,[0,1.18,-.92]);
for(const x of [-2.25,2.25])for(const z of [-.82,.82]){
  const leg=box(desk,.2,1.5,.2,mats.wood,[x,.72,z]);leg.rotation.z=x<0?-.035:.035;
}
for(const x of [-1.48,0,1.48]){
  box(desk,1.12,.34,.075,mats.woodLight,[x,1.22,-1.055]);
  box(desk,.13,.055,.08,mats.brass,[x,1.2,-1.12]);
}
box(desk,5.35,.07,.09,mats.brass,[0,1.76,1.05]);

// Desk mat and open journal with layered covers, page block and visible page lines.
const matPad=rounded(desk,2.55,.045,1.55,mats.rose,[-.45,1.72,.16],.06);
const journal=new THREE.Group();journal.position.set(-.65,1.78,.22);journal.rotation.y=-.13;desk.add(journal);
box(journal,1.75,.12,1.22,mats.wine,[0,0,0]);
box(journal,1.66,.055,1.14,mats.paper,[0,.075,0]);
box(journal,.045,.02,1.12,mats.woodMid,[0,.112,0]);
for(let i=0;i<7;i++){
  box(journal,.62,.008,.012,mats.woodLight,[-.48,.112,-.38+i*.11]);
  box(journal,.62,.008,.012,mats.woodLight,[.48,.112,-.38+i*.11]);
}
const journalRibbon=box(journal,.07,.02,1.32,mats.rose,[.72,.02,0]);journalRibbon.rotation.z=-.02;
const journalHit=box(journal,1.95,.32,1.42,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),[0,.02,0]);journalHit.userData.room="notes";

// Stack of books, with individually colored spines and page edges.
const books=new THREE.Group();books.position.set(1.55,1.78,-.35);desk.add(books);
for(let i=0;i<3;i++){
  const b=new THREE.Group();b.position.set(i*.08,i*.16,0);books.add(b);
  box(b,1.18,.15,.78,[mats.wine,mats.ivory,mats.rose][i],[0,0,0]);
  box(b,1.1,.07,.72,mats.paper,[0,.045,.015]);
  box(b,.12,.12,.8,mats.brass,[-.53,.015,0]);
}
books.userData.room="together";clickable.push(books);

// Ceramic tea cup with handle, saucer and tea surface.
const tea=new THREE.Group();tea.position.set(2.05,1.8,.75);desk.add(tea);
cyl(tea,.25,.29,.34,mats.ivory,[0,.18,0]);
cyl(tea,.225,.225,.018,mats.wine,[0,.355,0]);
const handle=mesh(tea,new THREE.TorusGeometry(.16,.045,12,32),mats.ivory,[.27,.2,0]);handle.rotation.y=Math.PI/2;
cyl(tea,.36,.36,.045,mats.paper,[0,.015,0]);
const teaTop=mesh(tea,new THREE.CircleGeometry(.21,32),new THREE.MeshBasicMaterial({color:0x8a6660}),[0,.366,0],[-Math.PI/2,0,0]);
tea.userData.room="together";clickable.push(tea);

// Desk lamp with articulated arm, shade and warm light pool.
const lamp=new THREE.Group();lamp.position.set(-2.05,1.8,-.52);desk.add(lamp);
cyl(lamp,.38,.42,.1,mats.brass,[0,.05,0]);
cyl(lamp,.09,.12,.72,mats.brass,[0,.42,0]);
tube(lamp,[[0,.75,0],[.1,1.05,0],[.38,1.18,0],[.58,1.15,0]],.055,mats.brass);
const shade=mesh(lamp,new THREE.CylinderGeometry(.22,.52,.48,40,1,true),mats.ivory,[.58,1.0,0]);shade.rotation.z=-.24;
const bulb=new THREE.PointLight(0xffd9bb,28,5);bulb.position.set(.55,.86,.05);lamp.add(bulb);
lamp.userData.room="together";clickable.push(lamp);

// Wall shelf, framed pictures and a small cabinet create a readable second depth plane.
const shelf=new THREE.Group();shelf.position.set(7.28,0,-1.35);shelf.rotation.y=-Math.PI/2;root.add(shelf);
box(shelf,2.7,.16,.62,mats.woodMid,[0,4.15,0]);
box(shelf,2.7,.13,.62,mats.woodMid,[0,5.35,0]);
for(const x of [-1.28,1.28])box(shelf,.13,1.25,.6,mats.wood,[x,4.75,0]);
for(let i=0;i<5;i++){
  const book=box(shelf,.25,.7+(i%2)*.15,.35,[mats.wine,mats.ivory,mats.rose,mats.woodLight,mats.wood][i],[-.88+i*.34,4.55,0]);
  book.rotation.z=(i%2?-.08:.04);
}
const frames=new THREE.Group();frames.position.set(7.27,2.25,-3.65);frames.rotation.y=-Math.PI/2;root.add(frames);
for(let i=0;i<2;i++){
  const f=new THREE.Group();f.position.set(i*.9,0,0);f.rotation.y=-.1;frames.add(f);
  box(f,.78,1.12,.12,mats.brass,[0,0,0]);
  box(f,.65,.98,.05,i?mats.rose:mats.ivory,[0,0,.08]);
  sphere(f,.17,mats.paper,[0,.12,.12],[1,1.35,.12]);
}
frames.userData.room="memories";clickable.push(frames);

// Low side cabinet and a tiny keepsake object.
const cabinet=new THREE.Group();cabinet.position.set(5.05,0,-3.35);cabinet.rotation.y=-.12;root.add(cabinet);
box(cabinet,1.6,1.65,.95,mats.ivory,[0,.83,0]);
box(cabinet,1.64,.12,1.0,mats.woodMid,[0,1.68,0]);
box(cabinet,1.38,.72,.05,mats.woodLight,[0,.85,.5]);
for(const x of [-.42,.42])sphere(cabinet,.055,mats.brass,[x,.86,.56],[1,1, .4]);

// Chair in foreground, deliberately offset so it does not hide the writing surface.
const chair=new THREE.Group();chair.position.set(1.25,0,3.05);root.add(chair);
box(chair,1.65,.22,1.45,mats.rose,[0,1.05,0]);
box(chair,1.65,1.65,.22,mats.woodMid,[0,1.85,-.62]);
box(chair,1.35,.16,1.12,mats.ivory,[0,1.19,.02]);
for(const x of [-.68,.68])for(const z of [-.52,.52])box(chair,.11,1,.11,mats.wood,[x,.5,z]);

// Plant: pot, stems and sculpted leaves as a soft living accent.
const plant=new THREE.Group();plant.position.set(-5.15,0,3.15);root.add(plant);
cyl(plant,.42,.3,.65,mats.rose,[0,.34,0]);
cyl(plant,.33,.33,.04,mats.wood,[0,.68,0]);
for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2;
  tube(plant,[[0,.7,0],[Math.cos(a)*.28,1.2,Math.sin(a)*.25],[Math.cos(a)*.48,1.65,Math.sin(a)*.42]],.025,mats.green);
  const leaf=sphere(plant,.34,mats.green2,[Math.cos(a)*.5,1.65,Math.sin(a)*.42],[1.7,.28,.85]);leaf.rotation.z=Math.cos(a)*.3;leaf.rotation.y=a;
}

// Rug and foreground pouf, both kept low in the frame.
const rug=mesh(root,new THREE.CylinderGeometry(3.4,3.4,.08,64),new THREE.MeshStandardMaterial({color:0xd1bfc0,roughness:1}),[0,.01,1.65]);rug.scale.set(1,.2,.7);
const pouf=new THREE.Group();pouf.position.set(-4.1,0,2.5);root.add(pouf);
cyl(pouf,.72,.82,.42,mats.ivory,[0,.3,0],48);
cyl(pouf,.74,.74,.08,mats.rose,[0,.55,0],48);

// Click targets mapped to the existing feature spaces.
const hitMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
function addHit(parent,key,size,pos){const h=new THREE.Mesh(new THREE.BoxGeometry(...size),hitMaterial);h.position.set(...pos);h.userData.room=key;parent.add(h);clickable.push(h);}
addHit(desk,"calendar",[.8,1.1,.8],[2.1,1.95,-.45]);
addHit(desk,"notes",[2.1,.5,1.6],[-.65,1.9,.2]);
addHit(desk,"together",[1.6,.9,1.2],[1.55,2.05,-.35]);

const roomData={
 memories:{index:"01 / 04",title:"记忆相册",description:"把那些舍不得忘记的瞬间，好好收在这里。",symbol:"▧"},
 calendar:{index:"02 / 04",title:"我们的日历",description:"纪念日、计划和普通日子，都可以认真对待。",symbol:"▦"},
 notes:{index:"03 / 04",title:"留给彼此的话",description:"一些来不及说出口的话，先放在这里。",symbol:"✉"},
 together:{index:"04 / 04",title:"一起生活",description:"属于我们的角落，慢慢添上喜欢的东西。",symbol:"♡"}
};
const dialog=document.querySelector("#roomDialog");
function openRoom(key){
  const d=roomData[key];if(!d)return;
  document.querySelector("#dialogIndex").textContent=d.index;
  document.querySelector("#dialogTitle").textContent=d.title;
  document.querySelector("#dialogDescription").textContent=d.description;
  document.querySelector("#dialogSymbol").textContent=d.symbol;
  if(!dialog.open)dialog.showModal();
  const obj=clickable.find(o=>o.userData.room===key);
  if(obj){const p=new THREE.Vector3();obj.getWorldPosition(p);const dir=camera.position.clone().sub(homeTarget).normalize();tweenCamera(p.clone().add(dir.multiplyScalar(5.8)).add(new THREE.Vector3(0,.8,0)),p.clone().add(new THREE.Vector3(0,.2,0)),650);}
}
let tween=null;
function tweenCamera(pos,target,duration=650){tween={from:camera.position.clone(),to:pos,fromTarget:homeTarget.clone(),target,start:performance.now(),duration};}
function updateTween(){if(!tween)return;const t=Math.min(1,(performance.now()-tween.start)/tween.duration),e=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,e);camera.lookAt(tween.fromTarget.clone().lerp(tween.target,e));if(t>=1){homeTarget.copy(tween.target);tween=null;}}
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let pointer=null,drag=false,down=null,az=0,el=0;
canvas.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY};drag=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!down||tween||dialog.open)return;const dx=e.clientX-down.px,dy=e.clientY-down.py;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)drag=true;if(drag){az=THREE.MathUtils.clamp(az-dx*.0035,-.34,.34);el=THREE.MathUtils.clamp(el+dy*.0022,-.16,.2);camera.position.copy(homePosition).add(new THREE.Vector3(az*5,el*5,0));camera.lookAt(homeTarget);}down.px=e.clientX;down.py=e.clientY;});
canvas.addEventListener("pointerup",e=>{if(!down)return;const moved=drag;down=null;if(moved)return;const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(clickable,true).find(h=>h.object.userData.room);if(hit)openRoom(hit.object.userData.room);});
canvas.addEventListener("pointercancel",()=>{down=null;});
document.querySelector("#closeDialog").addEventListener("click",()=>{dialog.close();tweenCamera(homePosition,homeTarget,550);});
dialog.addEventListener("click",e=>{if(e.target===dialog){dialog.close();tweenCamera(homePosition,homeTarget,550);}});
let night=localStorage.getItem("lune-theme")==="night";
function setTheme(){document.body.classList.toggle("night",night);scene.background.set(night?0x292226:0xd8cecc);scene.fog.color.copy(scene.background);hemi.intensity=night?1.25:2.1;keyLight.intensity=night?1.05:3.2;windowLight.intensity=night?.35:1.5;fill.intensity=night?8:24;renderer.toneMappingExposure=night?.92:1.15;}
document.querySelector("#themeToggle").addEventListener("click",()=>{night=!night;localStorage.setItem("lune-theme",night?"night":"day");setTheme();});setTheme();
function resize(){const w=screen.clientWidth,h=screen.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=window.matchMedia("(max-width:700px)").matches?48:40;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(screen);resize();
function animate(){requestAnimationFrame(animate);updateTween();renderer.render(scene,camera);}
animate();
canvas.dataset.ready="true";loading.classList.add("hidden");document.querySelector("#loadError").classList.remove("visible");
