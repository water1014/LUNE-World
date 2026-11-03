const rooms={
 calendar:{index:"01 / 07 · OUR DAYS",title:"我们的日历",icon:"▦",copy:"把纪念日、计划和那些平凡却重要的日子，都好好记下来。",foot:"EVERY DAY CAN BE A LITTLE CEREMONY"},
 memories:{index:"02 / 07 · LITTLE MEMORIES",title:"记忆相册",icon:"▧",copy:"收好照片、片段和舍不得忘记的瞬间。以后翻开时，还能回到那一天。",foot:"SOME MOMENTS DESERVE TO STAY"},
 letters:{index:"03 / 07 · WORDS FOR YOU",title:"信件与留言",icon:"✉",copy:"写给彼此的话，可以即时送达，也可以留给未来某一天再拆开。",foot:"A FEW WORDS, KEPT CLOSE"},
 music:{index:"04 / 07 · OUR SOUNDTRACK",title:"一起听歌",icon:"♫",copy:"收藏喜欢的旋律，让每一段日常都有自己的背景音乐。",foot:"PRESS PLAY ON OUR LITTLE WORLD"},
 together:{index:"05 / 07 · YOU & ME",title:"我们的空间",icon:"♡",copy:"两个人的头像、称呼和相处时间，都可以在这里慢慢布置。",foot:"TWO LITTLE WORLDS, ONE HOME"},
 notes:{index:"06 / 07 · DAILY NOTES",title:"今日手账",icon:"✎",copy:"记下今天的心情、碎碎念和突然冒出来的小念头。",foot:"TODAY IS WORTH REMEMBERING"},
 settings:{index:"07 / 07 · MAKE IT YOURS",title:"空间设置",icon:"⚙",copy:"调整主题、装饰、头像与空间偏好，让这里真正成为自己的小天地。",foot:"A SPACE THAT FEELS LIKE YOURS"}
};
const overlay=document.querySelector("#overlay");
const close=()=>{overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";};
function openRoom(key){
 const room=rooms[key];if(!room)return;
 document.querySelector("#panelIndex").textContent=room.index;
 document.querySelector("#panelTitle").textContent=room.title;
 document.querySelector("#panelIcon").textContent=room.icon;
 document.querySelector("#panelCopy").textContent=room.copy;
 document.querySelector("#panelFoot").textContent=room.foot;
 overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
document.querySelectorAll("[data-room]").forEach(item=>item.addEventListener("click",()=>openRoom(item.dataset.room)));
document.querySelector("#close").addEventListener("click",close);
document.querySelector("#veil").addEventListener("click",close);
document.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
const toggle=document.querySelector("#themeToggle");
toggle.addEventListener("click",()=>{
 const night=document.body.classList.toggle("night");
 document.querySelector("#themeGlyph").textContent=night?"☀":"☾";
 toggle.setAttribute("aria-label",night?"切换日间":"切换夜间");
});
const date=new Date();
document.querySelector("#today").textContent=date.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}).toUpperCase()+" · A LITTLE MOMENT";
const scroller=document.querySelector("#roomScroll");
if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
 const room=document.querySelector("#room");
 scroller.addEventListener("pointermove",event=>{
  const bounds=scroller.getBoundingClientRect();
  const x=(event.clientX-bounds.left)/bounds.width-.5;
  room.style.filter="drop-shadow("+(-x*5)+"px 4px 12px rgba(48,32,36,.12))";
 });
 scroller.addEventListener("pointerleave",()=>room.style.filter="none");
}
