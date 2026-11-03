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
const camera=new THREE.PerspectiveCamera(41,1,.1,80);
const target=new THREE.Vector3(0,1.45,-.15);
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
function sphere(x,y,z,sx,sy,sz,m,parent=root){const o=mesh(new THREE.SphereGeometry(1,32,24),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o}
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

/* Dense atelier dressing: layered architecture, small keepsakes and tabletop life */
const plaster=mat("#b8b1bd"), trim=mat("#e7d9d6"), shadowWood=mat("#755e61"), linen=mat("#d8c9cc"), darkBlue=mat("#536778"), paper=mat("#f2e9df"), ink=mat("#92727a");
function torus(x,y,z,rx,ry,rz,m,parent=root){const o=mesh(new THREE.TorusGeometry(rx,.035,8,48),m,x,y,z,parent);o.scale.y=ry/rx;o.rotation.z=rz;return o}
// Architectural depth: window casing, sill, side pilasters and crown moulding
box(0,5.82,-3.18,8.15,.18,.38,trim);
box(0,-.02,-3.12,8.15,.22,.42,trim);
for(const x of [-4.02,4.02]){box(x,2.85,-3.12,.2,5.85,.42,trim);box(x,2.85,-2.88,.08,5.65,.08,brass)}
box(0,5.65,-2.92,7.95,.12,.12,brass);
for(let i=0;i<9;i++){
 const x=-3.8+i*.95;
 const fold=line([[x,5.45,-2.42],[x-.12,4.1,-2.42],[x+.1,2.4,-2.42],[x-.08,.55,-2.42]],.045,mat(i%2?"#c7b8c2":"#e9dce0"));
}
// Wall picture frames and a narrow floating shelf
box(-5.05,3.95,-3.1,1.35,1.7,.14,wood);
box(-5.05,3.95,-3.0,1.17,1.5,.05,ivory);
box(-5.05,3.95,-2.96,1.02,1.32,.035,mat("#aab9c5"));
sphere(-5.28,4.13,-2.92,.2,.2,.025,mat("#e8d6c4"));
const wallHill=mesh(new THREE.ConeGeometry(.42,.7,4),mat("#718895"),-4.82,3.68,-2.91);wallHill.rotation.z=Math.PI;
box(4.95,3.5,-3.08,2.2,.13,.55,wood);
for(let i=0;i<4;i++){const b=box(4.35+i*.35,3.83,-3.08,.28,.62,.38,mat(["#6d5967","#b28c91","#d4b8a9","#657b88"][i]));b.rotation.z=(i-1)*.035}
sphere(5.45,4.12,-3.08,.22,.22,.22,glass);
for(let i=0;i<3;i++){const p=sphere(5.2+i*.18,4.32,-3.08,.09,.1,.09,mat("#d9b8bf"));}
// Table edge, apron and visible turned legs
box(0,-.04,3.85,12.25,.24,.22,shadowWood);
for(const x of [-5.45,5.45])for(const z of [-2.7,3.1]){
 const leg=cylinder(x,-.86,z,.16,.22,1.65,wood,root,24);leg.position.y=-.86;
 cylinder(x,-.1,z,.24,.24,.12,brass,root,24);
}
// Layered runner and lace-like border
box(0,.475,2.55,7.4,.035,2.15,linen);
for(let i=0;i<20;i++){const x=-3.5+i*.37;line([[x,.5,1.55],[x+.08,.5,2.55],[x,.5,3.55]],.009,mat("#f3e6e0"))}
for(let i=0;i<24;i++){const z=1.58+i*.085;line([[-3.7,.5,z],[3.7,.5,z]],.006,mat("#b79ca5"))}
// A little desk lamp, with curved neck and warm shade
const lamp=new THREE.Group();root.add(lamp);lamp.position.set(-5.05,.5,1.15);
cylinder(0,.08,0,.48,.48,.14,brass,lamp);
line([[0,.15,0],[.05,.9,0],[.48,1.42,0],[.92,1.48,0]],.065,brass,lamp);
const shade=mesh(new THREE.ConeGeometry(.48,.58,48,1,true),mat("#d7c2b5",.42,.12),.92,1.42,0,lamp);shade.rotation.z=-Math.PI/2;
const bulb=sphere(1.02,1.18,0,.13,.13,.13,mat("#ffe1a8"),lamp);bulb.material.emissive=new THREE.Color("#ffc879");bulb.material.emissiveIntensity=.65;
const lampLight=new THREE.PointLight("#ffd7a1",nightMode?25:8,5);lampLight.position.set(-4.1,2.2,1.1);root.add(lampLight);
// Teacup and saucer
const cup=new THREE.Group();root.add(cup);cup.position.set(5.05,.5,-1.85);
cylinder(0,.08,0,.42,.48,.12,ivory,cup);const cupBody=mesh(new THREE.CylinderGeometry(.27,.38,.48,48,1,true),ivory,0,.36,0,cup);cupBody.material.side=THREE.DoubleSide;
torus(.48,.38,0,.22,.22,0,brass,cup);
cylinder(0,.61,0,.27,.27,.025,mat("#6b555d"),cup,48);
// Loose postcards, note scraps and envelopes create overlapping planes
function paperCard(x,z,w,h,angle,color=paper){const g=new THREE.Group();root.add(g);g.position.set(x,.535,z);g.rotation.y=angle;g.rotation.z=(Math.random()-.5)*.045;box(0,.025,0,w,.045,h,color,g);for(let i=0;i<3;i++)box(-w*.12,.052,-h*.18+i*.12,w*.52,.008,.012,ink,g);return g}
paperCard(-.25,2.85,1.2,.82,-.22,mat("#eee2dc"));
paperCard(1.15,-1.55,1.05,.72,.32,mat("#f4eadd"));
paperCard(-3.15,-1.75,.9,.65,-.18,mat("#e7d9d4"));
paperCard(2.55,2.7,1.05,.72,.12,mat("#f0e6dc"));
// Fountain pen with metal nib, laid diagonally across a note
const pen=new THREE.Group();root.add(pen);pen.position.set(1.85,.62,2.35);pen.rotation.y=.12;pen.rotation.z=-.22;
cylinder(0,0,0,.055,.055,1.45,wine,pen,24).rotation.x=Math.PI/2;
const penCap=cylinder(0,.03,-.72,.075,.075,.22,brass,pen,24);penCap.rotation.x=Math.PI/2;
const nib=mesh(new THREE.ConeGeometry(.075,.22,16),brass,0,0,.83,pen);nib.rotation.x=Math.PI/2;
// Open keepsake book with pages and ribbon
const openBook=new THREE.Group();root.add(openBook);openBook.position.set(-1.15,.55,-1.72);openBook.rotation.y=-.18;
box(-.62,.06,0,1.25,.09,1.45,mat("#79535d"),openBook);
box(.62,.06,0,1.25,.09,1.45,mat("#79535d"),openBook);
box(-.62,.12,0,1.16,.045,1.36,paper,openBook);
box(.62,.12,0,1.16,.045,1.36,paper,openBook);
for(let i=0;i<7;i++){box(-.62,.15,-.42+i*.13,.76,.008,.012,ink,openBook);box(.62,.15,-.42+i*.13,.76,.008,.012,ink,openBook)}
line([[0,.19,.55],[.12,.2,.8],[.18,.2,1.02]],.025,wine,openBook);
// Pressed flowers and petals scattered near the journal
for(let i=0;i<13;i++){const a=i*2.4,r=.25+(i%4)*.16;const pet=sphere(-3.55+Math.cos(a)*r,.55,1.8+Math.sin(a)*r,.12,.025,.055,mat(i%2?"#c18e9a":"#ead1d1"));pet.rotation.y=a;}
// A small framed instant photo leaning against the window sill
const instant=new THREE.Group();root.add(instant);instant.position.set(1.35,.5,-2.25);instant.rotation.y=-.12;
box(0,.58,0,.88,1.05,.1,ivory,instant);
box(0,.67,.06,.72,.72,.025,mat("#a7b8c1"),instant);
sphere(-.16,.82,.09,.13,.16,.025,mat("#d9b4a6"),instant);
sphere(.15,.82,.09,.13,.16,.025,mat("#e5c6b5"),instant);
box(0,.18,.08,.48,.025,.02,ink,instant);
// Fine inlaid brass lines on the desk and decorative drawer knobs
for(const x of [-4.8,-2.4,0,2.4,4.8]){line([[x,.47,-2.8],[x+.18,.47,-2.65],[x+.3,.47,-2.5]],.012,brass)}
for(const x of [-2.4,0,2.4])sphere(x,-.02,3.98,.07,.07,.04,brass);


/* Final composition pass: window glazing, layered botanicals and lived-in desk clusters */
// Window divisions and a deep sill create a readable architectural frame
for(const x of [-2.02,2.02])box(x,2.78,-2.73,.075,3.42,.22,trim);
box(0,4.49,-2.73,6.25,.075,.22,trim);
box(0,1.02,-2.73,6.25,.075,.22,trim);
box(-3.15,.88,-2.48,.5,.18,.9,woodLight);
box(3.15,.88,-2.48,.5,.18,.9,woodLight);
// Distant town lights and tiny stars beyond the glass
for(let i=0;i<26;i++){const x=-2.9+(i%13)*.48,y=1.35+Math.floor(i/13)*.19;const dot=sphere(x,y,-2.78,.025,.025,.018,mat(i%3?"#f2dfc8":"#dce8f5"));dot.material.emissive=new THREE.Color("#d9e8ff");dot.material.emissiveIntensity=.18}
for(let i=0;i<18;i++){const x=-2.8+(i*1.13)%5.6,y=3.1+(i%4)*.31;const star=sphere(x,y,-2.77,.018,.018,.012,mat("#fff0d5"));star.material.emissive=new THREE.Color("#fff0d5");star.material.emissiveIntensity=.55}
// Fine lake reflections as short horizontal strokes
for(let i=0;i<24;i++){const x=-2.85+(i%8)*.72,y=1.38+Math.floor(i/8)*.12;line([[x,y,-2.76],[x+.22,y+.015,-2.76],[x+.43,y,-2.76]],.009,mat(i%2?"#dce4ed":"#f0dfd5"))}
// Add broad leaves to the bouquet, each with a central vein
for(let i=0;i<9;i++){const a=i*2.399,x=Math.cos(a)*(.34+(i%3)*.1),z=Math.sin(a)*(.3+(i%2)*.1),y=1.12+(i%4)*.16;const leaf=sphere(x,y,z,.17,.055,.075,mat(i%2?"#718c7e":"#879b87"),vase);leaf.rotation.z=Math.sin(a)*.8;line([[0,.88,0],[x*.55,y-.05,z*.55],[x,y,z]],.012,mat("#587463"),vase)}
// Cat details: cheeks, nose, whiskers and folded sleeping paws
sphere(.72,.37,.385,.055,.035,.025,mat("#bd858b"),cat);
for(const side of [-1,1])for(let j=0;j<2;j++)line([[.7+side*.06,.34,.37],[.7+side*.34,.32-j*.07,.38]],.009,mat("#b9aaa4"),cat);
for(let i=0;i<3;i++){const paw=sphere(-.32+i*.34,.16,.4,.2,.105,.19,mat("#f8f3ed"),cat);paw.rotation.z=-.12}
// Book spines, page edges and bookmark tassels
for(let i=0;i<3;i++){const x=4.9,y=.48+i*.22;box(x,y+.08,-.7,1.08,.018,.7,mat("#e6d7cc"));line([[4.55,y+.1,-1.05],[5.25,y+.1,-1.05]],.012,brass)}
line([[4.45,1.1,-.7],[4.35,.8,-.55],[4.32,.57,-.5]],.018,wine);
// Little drawer fronts under the writing area
box(-.2,-.19,3.9,5.2,.42,.18,wood);
for(const x of [-2.15,-.2,1.75]){box(x,-.18,4.01,1.72,.28,.035,woodLight);sphere(x,-.18,4.055,.065,.065,.035,brass)}
// Desk accessories: ink bottle, paper clips, and a small stack of correspondence
const inkBottle=new THREE.Group();root.add(inkBottle);inkBottle.position.set(-4.55,.52,2.55);
cylinder(0,.24,0,.19,.22,.48,mat("#536575",.25),inkBottle);
cylinder(0,.52,0,.12,.12,.12,brass,inkBottle);
cylinder(0,.64,0,.075,.075,.14,wine,inkBottle);
for(let i=0;i<3;i++){const sheet=box(-4.45+i*.08,.55,2.1-i*.07,.78,.035,.58,mat(i%2?"#e9ddd4":"#f4eade"));sheet.rotation.y=-.16+i*.1;sheet.rotation.z=.025*i}
for(let i=0;i<2;i++){const clip=new THREE.Mesh(new THREE.TorusGeometry(.11,.012,6,24,.0+Math.PI*1.7),brass);clip.position.set(-4.1+i*.18,.59,2.15);clip.rotation.x=Math.PI/2;root.add(clip)}
// Small jewelry dish and two keepsake rings
const dish=new THREE.Group();root.add(dish);dish.position.set(4.15,.52,2.7);
cylinder(0,.035,0,.42,.42,.07,mat("#b8a0a4"),dish);
const rim=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,8,48),brass);rim.position.y=.08;dish.add(rim);
for(let i=0;i<2;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.018,8,32),brass);ring.position.set(-.1+i*.2,.13,0);ring.rotation.x=Math.PI/2;dish.add(ring)}
// A small potted trailing plant at the far corner
const plant=new THREE.Group();root.add(plant);plant.position.set(5.35,.5,-2.45);
cylinder(0,.24,0,.28,.34,.46,mat("#b58d8b"),plant);
for(let i=0;i<7;i++){const a=i*2.4;const x=Math.cos(a)*(.25+(i%3)*.08),z=Math.sin(a)*(.25+(i%3)*.08);line([[0,.43,0],[x*.5,.85,z*.5],[x,1.05+(i%2)*.18,z]],.018,mat("#637d6c"),plant);const leaf=sphere(x,1.06+(i%2)*.18,z,.15,.055,.085,mat("#829782"),plant);leaf.rotation.z=Math.cos(a)*.6}

const clickable=[
 [cal,"calendar"],[album,"memories"],[letter,"letters"],[player,"music"],[portrait,"together"],[books,"notes"],[globe,"settings"],[hour,"settings"],[candle,"settings"]
];
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let down=null,dragged=false;
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
function setCamera(){const radius=11.9-cameraPush;camera.position.set(Math.sin(orbit)*radius,7.25+cameraPush*.18,Math.cos(orbit)*radius+1.3);camera.lookAt(target)}
setCamera();
canvas.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,orbit};dragged=false;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>5)dragged=true;orbitGoal=THREE.MathUtils.clamp(down.orbit+dx*.003,-.48,.48)});
canvas.addEventListener("pointerup",e=>{if(!down)return;if(!dragged){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable.map(([g])=>g),true);if(hits.length){let obj=hits[0].object;let chosen=clickable.find(([g])=>{let p=obj;while(p&&p!==g)p=p.parent;return p===g});if(chosen){pushGoal=.8;setTimeout(()=>{pushGoal=0;window.openRoom?.(chosen[1]);},220)}}}down=null});
canvas.addEventListener("pointercancel",()=>down=null);
let t=0;
function animate(){requestAnimationFrame(animate);t+=.012;orbit=THREE.MathUtils.lerp(orbit,orbitGoal,.06);cameraPush=THREE.MathUtils.lerp(cameraPush,pushGoal,.08);setCamera();disc.rotation.y+=.012;flame.scale.y=1+Math.sin(t*3)*.08;renderer.render(scene3,camera)}
animate();
window.addEventListener("resize",resize);
