import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js";

const canvas=document.querySelector("#worldCanvas");
const frame=document.querySelector("#worldFrame");
const loading=document.querySelector("#loading");
const scene=new THREE.Scene();
scene.background=null;
scene.fog=new THREE.Fog(0xe5d7d3,15,29);
const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,80);
const target=new THREE.Vector3(0,1.25,0);
let azimuth=Math.PI/4+0.2,elevation=0.78,radius=15.5;
function placeCamera(){camera.position.set(target.x+Math.sin(azimuth)*Math.cos(elevation)*radius,target.y+Math.sin(elevation)*radius,target.z+Math.cos(azimuth)*Math.cos(elevation)*radius);camera.lookAt(target);camera.updateProjectionMatrix();}
placeCamera();
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const hemi=new THREE.HemisphereLight(0xfff5ee,0x76616a,2.05);scene.add(hemi);
const key=new THREE.DirectionalLight(0xffe7d2,3.1);key.position.set(-5,10,7);key.castShadow=true;key.shadow.mapSize.set(1536,1536);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.bias=-.00025;scene.add(key);
const fill=new THREE.DirectionalLight(0xd8c6e0,1.15);fill.position.set(6,5,-5);scene.add(fill);
const mats={
 wall:new THREE.MeshStandardMaterial({color:0xd9c7c2,roughness:.92}),
 side:new THREE.MeshStandardMaterial({color:0xcbb7b5,roughness:.9}),
 floor:new THREE.MeshStandardMaterial({color:0xb99891,roughness:.88}),
 floorLight:new THREE.MeshStandardMaterial({color:0xc7a69e,roughness:.88}),
 trim:new THREE.MeshStandardMaterial({color:0x987a78,roughness:.65}),
 wood:new THREE.MeshStandardMaterial({color:0x9b7770,roughness:.62}),
 sofa:new THREE.MeshStandardMaterial({color:0xa8797e,roughness:.94}),
 sofaLight:new THREE.MeshStandardMaterial({color:0xc49c98,roughness:.96}),
 cream:new THREE.MeshStandardMaterial({color:0xe6d6c8,roughness:.9}),
 wine:new THREE.MeshStandardMaterial({color:0x784752,roughness:.7}),
 leaf:new THREE.MeshStandardMaterial({color:0x71836f,roughness:.85}),
 gold:new THREE.MeshStandardMaterial({color:0xb69a75,metalness:.28,roughness:.4}),
 glass:new THREE.MeshPhysicalMaterial({color:0xb8d1d0,roughness:.18,metalness:.05,transparent:true,opacity:.62}),
 dark:new THREE.MeshStandardMaterial({color:0x59484c,roughness:.7})
};
function rounded(parent,w,h,d,mat,pos,r=.08){const g=new RoundedBoxGeometry(w,h,d,3,r);const m=new THREE.Mesh(g,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,mat,pos){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cyl(parent,rt,rb,h,mat,pos,segments=32){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function clickable(mesh,room){mesh.userData.room=room;clickables.push(mesh);return mesh;}
const clickables=[];
const floor=box(scene,9,.22,7,mats.floor,[0,-.12,0]);floor.receiveShadow=true;
// parquet seams, inset skirting and architectural corner
for(let z=-2.8;z<=2.81;z+=.7)box(scene,8.9,.008,.012,mats.floorLight,[0,.001,z]);
box(scene,9,.16,.13,mats.trim,[0,.08,-3.48]);
box(scene,.13,.16,7,mats.trim,[-4.43,.08,0]);
const back=box(scene,9,5.4,.2,mats.wall,[0,2.7,-3.5]);back.castShadow=false;
const left=box(scene,.2,5.4,7,mats.side,[-4.5,2.7,0]);left.castShadow=false;
// wall panel mouldings
for(let x=-3.7;x<4;x+=1.85){box(scene,.025,4.6,.035,mats.trim,[x,2.7,-3.37]);}
box(scene,8.7,.035,.04,mats.trim,[0,4.85,-3.36]);
// large window, thick casing, crossbars and sill
const windowGroup=new THREE.Group();scene.add(windowGroup);
box(windowGroup,2.55,2.5,.15,mats.trim,[-1.95,3.05,-3.31]);
box(windowGroup,2.28,2.22,.06,mats.glass,[-1.95,3.05,-3.205]);
box(windowGroup,.075,2.2,.08,mats.cream,[-1.95,3.05,-3.15]);
box(windowGroup,2.25,.075,.08,mats.cream,[-1.95,3.05,-3.15]);
box(windowGroup,2.75,.16,.34,mats.wood,[-1.95,1.78,-3.2]);
const sunBall=new THREE.Mesh(new THREE.SphereGeometry(.25,24,16),new THREE.MeshBasicMaterial({color:0xffe1ae}));sunBall.position.set(-2.55,3.65,-3.14);windowGroup.add(sunBall);
// wall art, a framed little moon print
const art= new THREE.Group();art.position.set(2.35,3.3,-3.34);scene.add(art);
box(art,.95,1.25,.13,mats.gold,[0,0,0]);box(art,.78,1.08,.035,mats.cream,[0,0,.08]);
const artMoon=new THREE.Mesh(new THREE.TorusGeometry(.23,.018,8,48),new THREE.MeshStandardMaterial({color:0x9b6873,metalness:.25}));artMoon.position.set(0,.08,.12);art.add(artMoon);
const artDot=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),mats.wine);artDot.position.set(.1,.15,.14);art.add(artDot);
// rug with layered stitched rim
const rug=cyl(scene,2.35,2.35,.045,new THREE.MeshStandardMaterial({color:0xd7c1b6,roughness:1}),[.15,.02,.45],64);rug.scale.set(1,.25,1);
const rugInner=cyl(scene,2.15,2.15,.047,new THREE.MeshStandardMaterial({color:0xc6aaa3,roughness:1}),[.15,.045,.45],64);rugInner.scale.set(1,.25,1);
// sofa, softly rounded upholstered pieces
const sofa=new THREE.Group();sofa.position.set(-.05,0,-.05);scene.add(sofa);
rounded(sofa,3.05,.55,1.12,mats.sofa,[0,.65,-.05],.18);
rounded(sofa,3.05,1.12,.34,mats.sofa, [0,1.2,-.48],.17);
rounded(sofa,.42,.85,1.1,mats.sofa,[-1.32,.92,-.02],.16);
rounded(sofa,.42,.85,1.1,mats.sofa,[1.32,.92,-.02],.16);
rounded(sofa,1.35,.2,.82,mats.sofaLight,[-.72,1.01,.12],.13);
rounded(sofa,1.35,.2,.82,mats.sofaLight,[.72,1.01,.12],.13);
rounded(sofa,.72,.68,.2,mats.cream,[-.85,1.38,-.28],.12).rotation.z=-.12;
rounded(sofa,.72,.68,.2,mats.wine,[.72,1.38,-.28],.12).rotation.z=.12;
for(const x of [-1.13,1.13])for(const z of [-.42,.38])cyl(sofa,.055,.07,.42,mats.wood,[x,.24,z],16);
// low coffee table with turned legs
const table=new THREE.Group();table.position.set(.1,0,1.6);scene.add(table);
const top=cyl(table,.91,.91,.14,mats.wood,[0,.72,0],48);top.scale.z=.72;
for(const [x,z] of [[-.55,-.38],[.55,-.38],[-.55,.38],[.55,.38]])cyl(table,.045,.06,.68,mats.gold,[x,.36,z],12);
const book=rounded(table,.43,.08,.31,mats.wine,[-.2,.84,-.08],.025);book.rotation.y=-.15;
const cup=cyl(table,.12,.14,.18,mats.cream,[.38,.91,.12],24);cup.position.y=.91;
const cupCoffee=cyl(table,.085,.085,.008,mats.dark,[.38,1.005,.12],24);
// floor plant in a ceramic pot
const plant=new THREE.Group();plant.position.set(-3.35,0,1.6);scene.add(plant);
cyl(plant,.31,.23,.48,mats.cream,[0,.25,0],32);cyl(plant,.32,.32,.07,mats.gold,[0,.48,0],32);
for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),mats.leaf);leaf.scale.set(.72,2.3,.48);leaf.position.set(Math.cos(a)*.3,.88+(.12*(i%3)),Math.sin(a)*.3);leaf.rotation.z=-Math.cos(a)*.55;leaf.rotation.x=Math.sin(a)*.45;leaf.castShadow=true;plant.add(leaf);}
const stem=cyl(plant,.025,.035,.72,mats.leaf,[0,.77,0],10);
// standing lamp
const lamp=new THREE.Group();lamp.position.set(3.35,0,-.2);scene.add(lamp);
cyl(lamp,.07,.08,1.75,mats.gold,[0,.9,0],20);cyl(lamp,.43,.43,.1,mats.wood,[0,.08,0],32);
const shade=new THREE.Mesh(new THREE.CylinderGeometry(.25,.55,.58,32,1,true),mats.cream);shade.position.y=1.95;shade.castShadow=true;lamp.add(shade);
const bulb=new THREE.PointLight(0xffd7a6,22,4);bulb.position.set(0,1.7,0);lamp.add(bulb);
// sideboard and framed photograph, clickable memory object
const sideboard=new THREE.Group();sideboard.position.set(-3.1,0,-2.25);scene.add(sideboard);
rounded(sideboard,1.3,.72,.52,mats.wood,[0,.48,0],.07);rounded(sideboard,1.38,.12,.58,mats.cream,[0,.9,0],.04);
for(const x of [-.48,.48])cyl(sideboard,.035,.04,.4,mats.gold,[x,.2,0],12);
const photo=new THREE.Group();photo.position.set(-.1,1.04,-.12);sideboard.add(photo);
clickable(rounded(photo,.56,.72,.09,mats.gold,[0,.35,0],.025),"memories");
rounded(photo,.46,.61,.035,mats.wine,[0,.35,.06],.01);
const photoHeart=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),mats.cream);photoHeart.scale.set(1,.8,.3);photoHeart.position.set(0,.37,.09);photo.add(photoHeart);
// calendar object on sideboard, visibly distinct
const calendar=new THREE.Group();calendar.position.set(1.65,0,-2.95);scene.add(calendar);
clickable(rounded(calendar,.7,.92,.12,mats.cream,[0,1.05,0],.04),"calendar");
rounded(calendar,.72,.16,.15,mats.wine,[0,1.52,.03],.035);
for(let i=0;i<3;i++)cyl(calendar,.035,.035,.12,mats.gold,[-.2+i*.2,1.59,.04],12);
for(let y=0;y<3;y++)for(let x=0;x<3;x++)box(calendar,.065,.045,.018,(x+y)%3===0?mats.wine:mats.gold,[-.2+x*.2,.92+y*.15,.075]);
// note envelope resting on table
const note=new THREE.Group();note.position.set(1.9,.95,1.55);note.rotation.y=-.28;scene.add(note);
clickable(rounded(note,.52,.36,.035,mats.cream,[0,0,0],.025),"notes");
const flap=new THREE.Mesh(new THREE.BufferGeometry(),mats.wine);const shape=new THREE.Shape();shape.moveTo(-.25,.16);shape.lineTo(0,-.04);shape.lineTo(.25,.16);shape.lineTo(-.25,.16);flap.geometry=new THREE.ShapeGeometry(shape);flap.position.z=.025;note.add(flap);
// small heart sculpture by the window, for together space
const heartGroup=new THREE.Group();heartGroup.position.set(3.25,.98,-2.55);scene.add(heartGroup);
const heartMat=new THREE.MeshStandardMaterial({color:0x945b67,roughness:.32,metalness:.12});
const h1=new THREE.Mesh(new THREE.SphereGeometry(.23,24,18),heartMat);h1.scale.set(1,.9,.62);h1.position.x=-.13;heartGroup.add(h1);
const h2=h1.clone();h2.position.x=.13;heartGroup.add(h2);
const htip=new THREE.Mesh(new THREE.ConeGeometry(.29,.48,4),heartMat);htip.rotation.z=Math.PI;htip.position.set(0,-.27,0);heartGroup.add(htip);
clickable(heartGroup.children[0],"together");heartGroup.children.forEach(o=>o.userData.room="together");
// tiny details: floor lamp pool, vase, candle
const vase=cyl(sideboard,.11,.17,.35,mats.wine,[.43,1.13,.02],24);vase.position.y=1.13;
const candle=cyl(table,.075,.075,.16,mats.cream,[-.55,.88,.12],20);
const flame=new THREE.PointLight(0xffc98b,4,1.5);flame.position.set(-.55,1.05,.12);table.add(flame);
// Invisible interaction helpers on larger furniture surfaces
const hitSofa=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.8,1.3),new THREE.MeshBasicMaterial({visible:false}));hitSofa.position.set(0,1.05,0);sofa.add(hitSofa);clickable(hitSofa,"together");
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function pointerX(e){
 const r=frame.getBoundingClientRect(),mobile=window.matchMedia("(max-width:700px)").matches;
 const local=(e.clientX-r.left)/r.width;
 return mobile?local*(4/3)-1/3:local*2-1;
}
function pointerY(e){const r=frame.getBoundingClientRect();return -((e.clientY-r.top)/r.height*2-1);}
function resize(){
 const w=frame.clientWidth,h=frame.clientHeight;
 const mobile=window.matchMedia("(max-width:700px)").matches;
 const renderWidth=mobile?w*1.5:w;
 renderer.setSize(renderWidth,h,false);
 const aspect=renderWidth/h;
 const span=mobile?7.2:8.3;
 camera.left=-span*aspect/2;camera.right=span*aspect/2;
 camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(frame);resize();
let down=false,moved=false,startX=0,startY=0,lastX=0,lastY=0;
canvas.addEventListener("pointerdown",e=>{down=true;moved=false;startX=lastX=e.clientX;startY=lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY)>5)moved=true;azimuth-=dx*.006;elevation=THREE.MathUtils.clamp(elevation+dy*.004,.35,1.12);lastX=e.clientX;lastY=e.clientY;placeCamera();});
canvas.addEventListener("pointerup",e=>{down=false;if(moved)return;pointer.x=pointerX(e);pointer.y=pointerY(e);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickables,true);const hit=hits.find(h=>h.object.userData.room||h.object.parent?.userData.room);if(hit){const key=hit.object.userData.room||hit.object.parent.userData.room;openRoom(key);}});
canvas.addEventListener("pointercancel",()=>down=false);
canvas.addEventListener("pointermove",e=>{if(down)return;pointer.x=(e.clientX-frame.getBoundingClientRect().left)/frame.clientWidth*2-1;pointer.y=-((e.clientY-frame.getBoundingClientRect().top)/frame.clientHeight*2-1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickables,true).length>0;canvas.style.cursor=hit?"pointer":"grab";});
const roomData={memories:{index:"01 / 04",title:"记忆相册",description:"把那些舍不得忘记的瞬间，好好收在这里。",symbol:"▧"},calendar:{index:"02 / 04",title:"我们的日历",description:"纪念日、计划和普通日子，都可以认真对待。",symbol:"▦"},notes:{index:"03 / 04",title:"留给彼此的话",description:"一些来不及说出口的话，先放在这里。",symbol:"✉"},together:{index:"04 / 04",title:"一起生活",description:"属于我们的角落，慢慢添上喜欢的东西。",symbol:"♡"}};
const dialog=document.querySelector("#roomDialog");
function openRoom(key){const d=roomData[key];if(!d)return;document.querySelector("#dialogIndex").textContent=d.index;document.querySelector("#dialogTitle").textContent=d.title;document.querySelector("#dialogDescription").textContent=d.description;document.querySelector("#dialogSymbol").textContent=d.symbol;if(!dialog.open)dialog.showModal();}
document.querySelectorAll("[data-room]").forEach(b=>b.addEventListener("click",()=>openRoom(b.dataset.room)));
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
document.querySelector("#homeButton").addEventListener("click",()=>{dialog.close();window.scrollTo({top:0,behavior:"smooth"});});
let night=localStorage.getItem("lune-theme")==="night";
function setTheme(){document.body.classList.toggle("night",night);hemi.color.set(night?0x8b849c:0xfff5ee);hemi.groundColor.set(night?0x332b3b:0x76616a);key.color.set(night?0xb7b2d2:0xffe7d2);key.intensity=night?1.45:3.1;fill.intensity=night?1.8:1.15;sunBall.material.color.set(night?0xe2d9f3:0xffe1ae);scene.fog.color.set(night?0x302831:0xe5d7d3);renderer.toneMappingExposure=night?0.92:1.12;}
document.querySelector("#themeToggle").addEventListener("click",()=>{night=!night;localStorage.setItem("lune-theme",night?"night":"day");setTheme();});setTheme();
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();bulb.intensity=night?28:12;flame.intensity=3.5+Math.sin(t*2)*.45;renderer.render(scene,camera);}
animate();
window.addEventListener("load",()=>setTimeout(()=>loading.classList.add("hidden"),350));
