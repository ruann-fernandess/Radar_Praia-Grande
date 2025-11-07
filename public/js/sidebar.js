const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("close-sidebar");
const overlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  sidebar.style.display = "block";
  overlay.style.display = "block";
  setTimeout(() => {
    sidebar.style.right = "0";
  }, 10);
}

function closeSidebarFunc() {
  sidebar.style.right = "-65%";
  setTimeout(() => {
    sidebar.style.display = "none";
    overlay.style.display = "none";
  }, 300);
}

menuToggle.addEventListener("click", (e) => {
  if (sidebar.style.display === "block") {
    closeSidebarFunc();
  } else {
    openSidebar();
  }
  e.stopPropagation();
});

closeSidebar.addEventListener("click", () => {
  closeSidebarFunc();
});

overlay.addEventListener("click", () => {
  closeSidebarFunc();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && sidebar.style.display === "block") {
    closeSidebarFunc();
  }
});