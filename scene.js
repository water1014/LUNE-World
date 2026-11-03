import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const canvas=document.querySelector("#lune3d");
const host=document.querySelector("#room");
if(!canvas||!host) throw new Error("LUNE scene mount not found");

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;

const scene3=new THREE.Scene();
scene3.background=new THREE.Color("#b9c4d0");
scene3.fog=new THREE.Fog("#b9c4d0",17,32);
const camera=new THREE.PerspectiveCamera(37,1,.1,80);
const target=new THREE.Vector3(0,1.15,-.15);
let orbit=.12, orbitGoal=.12, cameraPush=0, pushGoal=0;
const hemi=new THREE.HemisphereLight("#e8edff","#705b5b",2.0);scene3.add(hemi);
const key=new THREE.DirectionalLight("#fff0dc",3.1);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;scene3.add(key);
const fill=new THREE.PointLight("#a9c8ee",65,18);fill.position.set(1,4,-2);scene3.add(fill);
const glow=new THREE.PointLight("#dca8a4",22,9);glow.position.set(-4,2,1);scene3.add(glow);
let nightMode=false;window.addEventListener("lune-theme",e=>{nightMode=!!e.detail?.night;scene3.background=new THREE.Color(nightMode?"#252b40":"#b9c4d0");scene3.fog.color.set(nightMode?"#252b40":"#b9c4d0");hemi.intensity=nightMode?0.75:2.0;key.intensity=nightMode?1.05:3.1;fill.intensity=nightMode?95:65;glow.intensity=nightMode?36:22;renderer.toneMappingExposure=nightMode?0.9:1.15;});

const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const wood=mat("#a9867e"), woodLight=mat("#d3b7a9"), ivory=mat("#f0e8df"), wine=mat("#714752"), rose=mat("#b98c91"), brass=mat("#b49a76",.32,.68), glass=new THREE.MeshPhysicalMaterial({color:"#c5d8e7",roughness:.12,metalness:.08,transmission:.22,transparent:true,opacity:.65});
const root=new THREE.Group();scene3.add(root);
function mesh(g,m,x,y,z,parent=root){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(x,y,z,w,h,d,m,parent=root,r=0){let o=mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);if(r)o.rotation.y=r;return o}
function sphere(x,y,z,sx,sy,sz,m,parent=root){return mesh(new THREE.SphereGeometry(1,32,24),m,x,y,z,parent).scale.set(sx,sy,sz)}
function cylinder(x,y,z,rt,rb,h,m,parent=root,seg=48){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z,parent)}
function line(points,r,m,parent=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,48,r,8,false),m,0,0,0,parent)}
function group(x,y,z,parent=root){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}

// Room shell and window, built as actual geometry
box(0,3.1,-3.45,13,6.2,.28,mat("#c5b9b9"));
box(0,-.18,0,13,.35,9,wood);
for(let i=0;i<7;i++)box(-5.6+i*1.85,-.36,0,.018,.02,8.7,mat("#765b55"));
box(0,2.75,-3.22,6.8,4.2,.22,ivory);
box(0,2.75,-3.08,6.35,3.76,.12,mat("#9eafbd"));
box(0,2.75,-2.99,6.08,3.48,.06,mat("#9db9d0"));
const moon=sphere(2.05,4.0,-2.91,.52,.52,.08,mat("#f7e9ca",.28));
const moonHalo=sphere(2.05,4.0,-2.94,.78,.78,.025,new THREE.MeshBasicMaterial({color:"#f5e4c4",transparent:true,opacity:.13}));
for(let i=0;i<5;i++){const m=mesh(new THREE.ConeGeometry(1.25,1.8,4),mat(i%2?"#8299a9":"#71899b"),-2.4+i*1.05,1.45,-2.86);m.rotation.z=Math.PI;m.scale.set(1.3,.9,1)}
box(0,2.75,-2.8,.09,3.65,.18,ivory);box(0,2.75,-2.78,6.3,.09,.18,ivory);
box(-3.42,2.75,-2.7,.2,4.3,.45,woodLight);box(3.42,2.75,-2.7,.2,4.3,.45,woodLight);
for(const side of [-1,1]){
 const curtain=box(side*3.75,2.7,-2.58,.8,4.6,.32,mat("#d8c9ca"));curtain.rotation.z=side*.04;
 for(let j=0;j<5;j++)line([[side*(3.42+j*.13),4.9,-2.38],[side*(3.48+j*.13),2.7,-2.38],[side*(3.52+j*.13),.5,-2.38]],.035,mat("#eee1dc"));
}
box(0,.05,-2.65,7.8,.16,.5,woodLight);

// Desk surface
box(0,.28,.15,12.2,.35,7.4,woodLight);
box(0,.06,.15,12.0,.12,7.2,wood);
for(const x of [-5.2,5.2])for(const z of [-2.7,2.9])box(x,-1.0,z,.28,2.1,.3,wood);

// Botanical vase with individually modeled stems and petals
const vase=new THREE.Group();root.add(vase);vase.position.set(-4.45,.5,-.35);
const vaseProfile=[new THREE.Vector2(.02,0),new THREE.Vector2(.28,.02),new THREE.Vector2(.43,.18),new THREE.Vector2(.4,.55),new THREE.Vector2(.22,.8),new THREE.Vector2(.18,1.05),new THREE.Vector2(.22,1.08)];
mesh(new THREE.LatheGeometry(vaseProfile,48),mat("#aab9c4",.2),0,0,0,vase);
for(let i=0;i<6;i++){const a=i*1.05;const x=Math.cos(a)*(.35+i*.035),z=Math.sin(a)*(.35+i*.035);line([[0,.92,0],[x*.45,1.55,z*.45],[x,2.15+(i%3)*.18,z]],.025,mat("#627c70"),vase);const flower=new THREE.Group();flower.position.set(x,2.15+(i%3)*.18,z);vase.add(flower);for(let p=0;p<6;p++){const t=p*Math.PI/3;const pet=sphere(Math.cos(t)*.12,Math.sin(t)*.12,0,.13,.075,.055,mat(i%2?"#d8aeb3":"#eee0d5"),flower);pet.rotation.z=t} sphere(0,0,.04,.08,.08,.07,brass,flower);}

// Sleeping cat, soft sculpted volumes, ears, tail and paws
const cat=new THREE.Group();root.add(cat);cat.position.set(-2.4,.53,-.55);
sphere(0,.28,0,.92,.35,.58,mat("#eee9e4"),cat);
sphere(.58,.42,-.05,.43,.38,.4,mat("#f7f2ec"),cat);
for(const x of [.35,.82]){const ear=mesh(new THREE.ConeGeometry(.17,.34,3),mat("#eee9e4"),x,.76,-.04,cat);ear.rotation.z=-.15}
sphere(.73,.39,.32,.045,.025,.025,mat("#82717a"),cat);sphere(.9,.39,.32,.045,.025,.025,mat("#82717a"),cat);
line([[-.7,.3,.05],[-1.05,.22,.15],[-1.18,.36,.28]],.09,mat("#eee9e4"),cat);
for(let i=0;i<2;i++)sphere(-.45+i*.5,.12,.34,.24,.12,.2,mat("#f8f3ed"),cat);

// Calendar standing on a wooden easel
const cal=new THREE.Group();root.add(cal);cal.position.set(-3.45,.5,1.65);cal.rotation.y=.12;cal.rotation.x=-.08;
box(0,.8,0,1.35,1.55,.12,ivory,cal);box(0,1.35,.075,1.35,.22,.05,wine,cal);
for(let i=0;i<5;i++)cylinder(-.48+i*.24,1.48,.03,.035,.035,.18,brass,cal,16).rotation.z=Math.PI/2;
const calFace=mat("#e9ded5");box(0,.65,.075,1.16,1.1,.025,calFace,cal);
for(let i=0;i<5;i++)for(let j=0;j<7;j++){const dot=sphere(-.46+j*.15,.95-i*.16,.11,.025,.025,.012,mat((i===2&&j===4)?"#9a5965":"#927f80"),cal)}
box(0,-.04,-.12,.08,.95,.08,brass,cal).rotation.x=-.35;

// Layered photo stack with framed landscape image
const album=new THREE.Group();root.add(album);album.position.set(-1.2,.52,1.35);album.rotation.y=-.18;
box(0,.13,0,2.05,.12,1.48,mat("#e9dfd5"),album);
const frame=box(0,.48,.08,1.65,.95,.12,ivory,album);
box(0,.48,.15,1.42,.72,.035,mat("#b8c2c1"),album);
sphere(.35,.72,.18,.18,.18,.025,mat("#e8d9c1"),album);
const ridge=mesh(new THREE.ConeGeometry(.55,.55,4),mat("#7c928d"),-.35,.35,.19,album);ridge.rotation.z=Math.PI;

// Letter and wax seal
const letter=new THREE.Group();root.add(letter);letter.position.set(1.25,.5,1.7);letter.rotation.y=.15;letter.rotation.z=-.08;
box(0,.06,0,1.55,.08,1.05,mat("#eaded5"),letter);
for(let i=0;i<3;i++)box(-.18,.115,.2-i*.13,.72,.012,.012,mat("#b89b98"),letter);
cylinder(.48,.14,-.3,.16,.16,.035,wine,letter,48);

// Vinyl player with spinning record
const player=new THREE.Group();root.add(player);player.position.set(3.8,.5,1.45);player.rotation.y=-.1;
box(0,.16,0,1.85,.3,1.45,mat("#6d5157"),player);
box(0,.33,0,1.68,.06,1.28,mat("#c8b4aa"),player);
const disc=cylinder(-.25,.39,.02,.53,.53,.035,mat("#292a32",.28),player,64);
cylinder(-.25,.42,.02,.14,.14,.025,rose,player,48);
const spindle=cylinder(-.25,.45,.02,.025,.025,.06,brass,player,24);
const arm=new THREE.Group();player.add(arm);arm.position.set(.58,.4,-.35);cylinder(0,.12,0,.035,.035,.28,brass,arm,24).rotation.x=.7;

// Two-person portrait in a sculpted frame
const portrait=new THREE.Group();root.add(portrait);portrait.position.set(2.15,.5,-.15);portrait.rotation.y=-.22;
box(0,.9,0,1.35,1.65,.16,brass,portrait);
box(0,.9,.1,1.16,1.46,.07,mat("#a9a1a7"),portrait);
for(let i=0;i<2;i++){sphere(-.24+i*.48,1.05,.17,.22,.26,.1,mat(i?"#d5b1a9":"#e4c9b8"),portrait);sphere(-.24+i*.48,1.32,.18,.17,.18,.1,mat(i?"#51434b":"#76616a"),portrait)}
box(0,.12,.13,.8,.18,.06,ivory,portrait);

// Books, hourglass, crystal globe and candle
const books=new THREE.Group();root.add(books);books.position.set(4.9,.48,-.7);
for(let i=0;i<3;i++){const b=box(0,i*.22,0,1.15,.18,.78,mat(["#76545d","#c5a69e","#657783"][i]),books);b.rotation.z=(i-1)*.035}
const hour=new THREE.Group();root.add(hour);hour.position.set(.35,.5,-.9);
cylinder(0,.05,0,.27,.27,.09,brass,hour);cylinder(0,1.05,0,.27,.27,.09,brass,hour);
const hg=mesh(new THREE.CylinderGeometry(.025,.19,.86,32,1,true),glass,0,.55,0,hour);hg.material.side=THREE.DoubleSide;
sphere(0,.17,0,.13,.12,.13,mat("#c7a47e"),hour);sphere(0,.84,0,.13,.12,.13,mat("#c7a47e"),hour);
const globe=new THREE.Group();root.add(globe);globe.position.set(5.1,.5,1.5);
sphere(0,.72,0,.52,.52,.52,glass,globe);cylinder(0,.12,0,.48,.48,.18,brass,globe);
const globeLine=new THREE.Mesh(new THREE.TorusGeometry(.54,.018,8,64),brass);globeLine.position.y=.72;globeLine.rotation.x=.5;globe.add(globeLine);
const candle=new THREE.Group();root.add(candle);candle.position.set(3.2,.5,-1.0);
cylinder(0,.35,0,.23,.26,.7,mat("#e6d8cc"),candle);
const flame=sphere(0,.83,0,.09,.19,.08,mat("#f4c98c"),candle);flame.material.emissive=new THREE.Color("#e89d54");flame.material.emissiveIntensity=.6;

// Room rug and fine brass details
box(0,.49,2.75,5.8,.025,1.5,mat("#bda6a3"));
for(let i=0;i<18;i++)line([[-2.7+i*.32,.51,2.05],[-2.7+i*.32,.51,3.45]],.006,mat("#e2d1c8"));
const clickable=[
 [cal,"calendar"],[album,"memories"],[letter,"letters"],[player,"music"],[portrait,"together"],[books,"notes"],[globe,"settings"],[hour,"settings"],[candle,"settings"]
];
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let down=null,dragged=false;
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
function setCamera(){const radius=12.8-cameraPush;camera.position.set(Math.sin(orbit)*radius,6.6+cameraPush*.18,Math.cos(orbit)*radius+1.3);camera.lookAt(target)}
setCamera();
canvas.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,orbit};dragged=false;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>5)dragged=true;orbitGoal=THREE.MathUtils.clamp(down.orbit+dx*.003,-.48,.48)});
canvas.addEventListener("pointerup",e=>{if(!down)return;if(!dragged){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable.map(([g])=>g),true);if(hits.length){let obj=hits[0].object;let chosen=clickable.find(([g])=>{let p=obj;while(p&&p!==g)p=p.parent;return p===g});if(chosen){pushGoal=.8;setTimeout(()=>{pushGoal=0;window.openRoom?.(chosen[1]);},220)}}}down=null});
canvas.addEventListener("pointercancel",()=>down=null);
let t=0;
function animate(){requestAnimationFrame(animate);t+=.012;orbit=THREE.MathUtils.lerp(orbit,orbitGoal,.06);cameraPush=THREE.MathUtils.lerp(cameraPush,pushGoal,.08);setCamera();disc.rotation.y+=.012;flame.scale.y=1+Math.sin(t*3)*.08;renderer.render(scene3,camera)}
animate();
window.addEventListener("resize",resize);
