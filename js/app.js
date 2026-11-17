// Hash-based router: #/, #/learn, #/topics/:id, #/topics/:id/:lesson, #/simulations/:id, #/walkthroughs/:id, #/about
// Hash routes need no server rewrites, so the site deploys to Vercel as plain static files.
import * as pages from "./pages.js";
import { topics } from "./content/topics.js";

const app = document.getElementById("app");
let cleanup = null;

function resolve(path) {
  const [section, id, sub] = path.split("/").filter(Boolean);
  switch (section) {
    case undefined: return pages.home();
    case "learn": return pages.learn();
    case "topics": return sub ? pages.lessonDetail(id, sub) : id ? pages.topicDetail(id) : pages.learn();
    case "simulations": return id ? pages.simDetail(id) : pages.simsIndex();
    case "walkthroughs": return id ? pages.walkDetail(id) : pages.walksIndex();
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
}

function render() {
  const path = location.hash.replace(/^#/, "") || "/";
  if (typeof cleanup === "function") cleanup();
  cleanup = null;

  const page = resolve(path);
  app.innerHTML = page.html;
  renderMath(app);
  if (page.mount) cleanup = page.mount(app);

  let section = path.split("/").filter(Boolean)[0] || "";
  if (section === "topics") section = "learn"; // module pages live under "Modules"
  document.querySelectorAll(".nav [data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === section));
  document.querySelector(".nav").classList.remove("open");
  closeMenu();
  window.scrollTo(0, 0);
}

// ---- mobile nav ----
const toggle = document.querySelector(".nav-toggle");
toggle.addEventListener("click", () => {
  const nav = document.querySelector(".nav");
  nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
});

// ---- "Modules" dropdown in the header ----
const dd = document.querySelector(".nav-dd");
const ddBtn = dd.querySelector(".nav-dd-btn");
dd.querySelector(".dd-menu").innerHTML = `
  <a href="#/learn" class="dd-all" role="menuitem">All modules →</a>
  ${topics.map((t, i) => `
    <a href="#/topics/${t.id}" role="menuitem">
      <span class="num">${i + 1}</span>
      <span><strong>${t.icon} ${t.title}</strong><small>${t.chapter}${t.lessons ? ` · ${t.lessons.length} lessons` : ""}</small></span>
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
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  render(); // redraw canvases with the new colors
});

window.addEventListener("hashchange", render);
render();
