// Hash-based router: #/, #/learn, #/topics/:id, #/topics/:id/:lesson, #/simulations/:id, #/walkthroughs/:id, #/about
// Hash routes need no server rewrites, so the site deploys to Vercel as plain static files.
import * as pages from "./pages.js";
import { topics } from "./content/topics.js";
import { icon } from "./icons.js";
import { enhance } from "./fx-bridge.js";
import { resetScroll, scrollToEl } from "./smooth-scroll.js";

const app = document.getElementById("app");
let cleanup = null;

function resolve(path) {
  const [section, id, sub] = path.split("/").filter(Boolean);
  switch (section) {
    case undefined: return pages.home();
    case "learn": return pages.learn();
    case "topics": return sub ? pages.lessonDetail(id, sub) : id ? pages.topicDetail(id) : pages.learn();
    case "simulations": return id ? pages.simDetail(id) : pages.learn();
    case "walkthroughs": return id ? pages.walkDetail(id) : pages.learn();
    case "about": return pages.about();
    default: return pages.notFound();
  }
}

// Typesets \( inline \) and $$ display $$ math with KaTeX (loaded from a CDN in index.html).
function renderMath(el) {
  if (!window.renderMathInElement) return;
  window.renderMathInElement(el, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
  // wide equations scroll sideways inside their own box; Lenis leaves that scrolling alone
  el.querySelectorAll(".katex-display").forEach((d) => d.setAttribute("data-lenis-prevent", ""));
}

function render() {
  const path = location.hash.replace(/^#/, "") || "/";
  if (typeof cleanup === "function") cleanup();
  cleanup = null;

  const page = resolve(path);
  app.innerHTML = page.html;
  renderMath(app);
  const pageCleanup = page.mount ? page.mount(app) : null;
  const fxCleanup = enhance(app); // animated backgrounds and scroll moments, if the page has any
  cleanup = () => { if (typeof pageCleanup === "function") pageCleanup(); fxCleanup(); };

  let section = path.split("/").filter(Boolean)[0] || "";
  if (section === "topics") section = "learn"; // module pages live under "Modules"
  document.querySelectorAll(".nav [data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === section));
  setMobileNav(false);
  closeMenu();
  resetScroll();
}

// ---- skip link (moves focus without changing the hash route) ----
document.querySelector(".skip-link").addEventListener("click", (e) => {
  e.preventDefault();
  app.focus({ preventScroll: true });
  scrollToEl(app);
});

// ---- mobile nav ----
const toggle = document.querySelector(".nav-toggle");
function setMobileNav(open) {
  document.querySelector(".nav").classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  toggle.innerHTML = icon(open ? "close" : "menu");
}
setMobileNav(false);
toggle.addEventListener("click", () => setMobileNav(!document.querySelector(".nav").classList.contains("open")));

// ---- "Modules" dropdown in the header ----
const dd = document.querySelector(".nav-dd");
const ddBtn = dd.querySelector(".nav-dd-btn");
ddBtn.querySelector(".dd-caret").innerHTML = icon("chevron");
dd.querySelector(".dd-menu").innerHTML = `
  <a href="#/learn" class="dd-all" role="menuitem">All modules ${icon("arrow")}</a>
  ${topics.map((t, i) => `
    <a href="#/topics/${t.id}" role="menuitem">
      <span class="num">${i + 1}</span>
      <span><strong>${t.title}</strong><small>${t.chapter}${t.lessons ? ` · ${t.lessons.length} lessons` : ""}</small></span>
    </a>`).join("")}`;
function closeMenu() { dd.classList.remove("open"); ddBtn.setAttribute("aria-expanded", "false"); }
ddBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !dd.classList.contains("open");
  dd.classList.toggle("open", open);
  ddBtn.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", (e) => { if (!dd.contains(e.target)) closeMenu(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// ---- theme toggle (remembered per browser) ----
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch {}
const themeBtn = document.querySelector(".theme-toggle");
const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
function showThemeIcon() {
  // the button shows the theme you would switch to
  themeBtn.innerHTML = icon(isDark() ? "sun" : "moon");
  themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
}
showThemeIcon();
themeBtn.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  showThemeIcon();
  render(); // redraw canvases with the new colors
});

window.addEventListener("hashchange", render);
render();
