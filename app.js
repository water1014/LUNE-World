const viewport=document.querySelector("#viewport");
const scene=document.querySelector("#deskScene");
const overlay=document.querySelector("#roomOverlay");
const rooms={
 calendar:{index:"01 / 07 · OUR DAYS",title:"我们的日历",symbol:"▦",description:"把纪念日、计划和那些平凡却重要的日子，都好好记下来。",foot:"EVERY DAY CAN BE A LITTLE CEREMONY"},
 memories:{index:"02 / 07 · LITTLE MEMORIES",title:"记忆相册",symbol:"▧",description:"收好照片、片段和舍不得忘记的瞬间。以后翻开时，还能回到那一天。",foot:"SOME MOMENTS DESERVE TO STAY"},
 letters:{index:"03 / 07 · WORDS FOR YOU",title:"信件与留言",symbol:"✉",description:"写给彼此的话，可以即时送达，也可以留给未来某一天再拆开。",foot:"A FEW WORDS, KEPT CLOSE"},
 music:{index:"04 / 07 · OUR SOUNDTRACK",title:"一起听歌",symbol:"♫",description:"收藏喜欢的旋律，让每一段日常都有自己的背景音乐。",foot:"PRESS PLAY ON OUR LITTLE WORLD"},
 together:{index:"05 / 07 · YOU & ME",title:"我们的空间",symbol:"♡",description:"两个人的头像、称呼和相处时间，都可以在这里慢慢布置。",foot:"TWO LITTLE WORLDS, ONE HOME"},
 notes:{index:"06 / 07 · DAILY NOTES",title:"今日手账",symbol:"✎",description:"记下今天的心情、碎碎念和突然冒出来的小念头。",foot:"TODAY IS WORTH REMEMBERING"},
 settings:{index:"07 / 07 · MAKE IT YOURS",title:"空间设置",symbol:"⚙",description:"调整主题、装饰、头像与空间偏好，让这里真正成为自己的小天地。",foot:"A SPACE THAT FEELS LIKE YOURS"}
};
function openRoom(key){
 const data=rooms[key];if(!data)return;
 document.querySelector("#roomIndex").textContent=data.index;
 document.querySelector("#roomTitle").textContent=data.title;
 document.querySelector("#roomSymbol").textContent=data.symbol;
 document.querySelector("#roomDescription").textContent=data.description;
 document.querySelector("#roomFoot").textContent=data.foot;
 overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");
 document.body.style.overflow="hidden";
}
function closeRoom(){overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";}
document.querySelectorAll("[data-room]").forEach(el=>el.addEventListener("click",()=>openRoom(el.dataset.room)));
document.querySelector("#panelClose").addEventListener("click",closeRoom);
document.querySelector("#overlayBackdrop").addEventListener("click",closeRoom);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeRoom();});
const themeToggle=document.querySelector("#themeToggle");
themeToggle.addEventListener("click",()=>{
 const night=document.body.classList.toggle("night");
 document.querySelector("#themeIcon").textContent=night?"☀":"☾";
});
const date=new Date();
document.querySelector("#todayLabel").textContent=date.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}).toUpperCase()+" · A LITTLE MOMENT";
let pointerDown=null;
viewport.addEventListener("pointerdown",e=>{pointerDown={x:e.clientX,y:e.clientY,scroll:viewport.scrollLeft};});
viewport.addEventListener("pointerup",()=>{pointerDown=null;});
viewport.addEventListener("pointercancel",()=>{pointerDown=null;});
if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
 viewport.addEventListener("pointermove",e=>{
  if(pointerDown)return;
  const r=viewport.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5;
  const y=(e.clientY-r.top)/r.height-.5;
  scene.style.transform="perspective(1400px) rotateX("+(-y*1.1)+"deg) rotateY("+(x*1.3)+"deg)";
 });
 viewport.addEventListener("pointerleave",()=>scene.style.transform="perspective(1400px) rotateX(0) rotateY(0)");
}
