const roomData = {
  memories: { index: "01 / 04", title: "记忆相册", description: "把那些舍不得忘记的瞬间，好好收在这里。", symbol: "▧" },
  calendar: { index: "02 / 04", title: "我们的日历", description: "纪念日、计划和普通日子，都可以认真对待。", symbol: "▦" },
  notes: { index: "03 / 04", title: "留给彼此的话", description: "一些来不及说出口的话，先放在这里。", symbol: "✉" },
  together: { index: "04 / 04", title: "一起生活", description: "属于我们的角落，慢慢添上喜欢的东西。", symbol: "♡" }
};

const dialog = document.querySelector("#roomDialog");
const themeToggle = document.querySelector("#themeToggle");
const todayDate = document.querySelector("#todayDate");

function openRoom(key) {
  const room = roomData[key];
  if (!room || !dialog) return;
  document.querySelector("#dialogIndex").textContent = room.index;
  document.querySelector("#dialogTitle").textContent = room.title;
  document.querySelector("#dialogDescription").textContent = room.description;
  document.querySelector("#dialogSymbol").textContent = room.symbol;
  if (typeof dialog.showModal === "function") dialog.showModal();
}

document.querySelectorAll("[data-room]").forEach((button) => {
  button.addEventListener("click", () => openRoom(button.dataset.room));
});

document.querySelector("#closeDialog")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector("#homeButton")?.addEventListener("click", () => {
  dialog?.close();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const savedTheme = localStorage.getItem("lune-theme");
if (savedTheme === "night") document.body.classList.add("night");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("night");
  localStorage.setItem("lune-theme", document.body.classList.contains("night") ? "night" : "day");
});

const now = new Date();
const dateText = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(now);
if (todayDate) todayDate.textContent = dateText.toUpperCase();
