// Page renderers. Each returns { html, mount? } where mount(root) runs after
// the HTML is in the page and may return a cleanup function.
import { topics, getTopic } from "./content/topics.js";
import { walkthroughs, getWalkthrough } from "./content/walkthroughs.js";
import { sims, getSim } from "./sims/index.js";
import { heroDemo } from "./hero.js";
import { mountWidgets } from "./widgets/index.js";

// Dashed box marking a spot where content still needs to be written.
const placeholder = (title, hint) =>
  `<div class="placeholder"><strong>✏️ ${title}</strong>${hint}</div>`;

const simCard = (s) => `
  <a class="card" href="#/simulations/${s.id}">
    <div class="card-top"><span class="icon">${s.icon}</span></div>
    <h3>${s.title}</h3><p>${s.summary}</p></a>`;

const walkCard = (w) => `
  <a class="card" href="#/walkthroughs/${w.id}">
    <div class="card-top"><span class="chip chip-neutral">${getTopic(w.topic)?.title ?? ""}</span><span class="muted" style="font-size:.85rem">${w.difficulty}</span></div>
    <h3>${w.title}</h3>
    <p>${w.statement.replace(/<[^>]+>/g, "").slice(0, 110)}…</p>
  </a>`;

// ---------------- Home (landing page) ----------------
export function home() {
  const interactives = topics.reduce((n, t) => n + (t.lessons ? t.lessons.reduce((m, l) => m + l.interactives.length, 0) : 0), 0) + sims.length;
  const steps = [
    ["📖", "Learn the concept", "Each module opens with a short explanation of the big idea and the key equations you'll use in PHYS 206."],
    ["🎛️", "See it in an interactive model", "Drag vectors, move sliders, and rotate 3D models. Watch the physics respond and check the formula from lecture."],
    ["🪜", "Work a problem step by step", "Try each step of an original practice problem (setup, diagram, equations, solution) before you reveal it."],
    ["✅", "Check yourself", "Review the common mistakes and equation summary before homework or an exam."],
  ];
  return {
    html: `
      <section class="hero">
        <div>
          <div class="eyebrow">A learning platform for PHYS 206</div>
          <h1>Learn Newtonian mechanics by seeing it move.</h1>
          <p class="lead">LearnPHYS206 is a free study companion for Texas A&amp;M's PHYS 206. It has guided modules, interactive simulations, and step-by-step practice problems, in the same order as the course.</p>
          <div class="btn-row">
            <a class="btn btn-primary btn-lg" href="#/learn">Get started →</a>
            <a class="btn btn-ghost btn-lg" href="#how-it-works" data-scroll>How it works</a>
          </div>
          <div class="stats">
            <div><strong>${topics.length}</strong><span>modules</span></div>
            <div><strong>${interactives}</strong><span>interactive models</span></div>
            <div><strong>${walkthroughs.length}</strong><span>walkthroughs</span></div>
          </div>
        </div>
        <div class="hero-visual"><canvas aria-label="Animated projectile demo"></canvas></div>
      </section>

      <section class="section" id="about-course">
        <div class="split">
          <div>
            <div class="eyebrow">The course</div>
            <h2>What is PHYS 206?</h2>
            <p>PHYS 206 is Texas A&amp;M's calculus-based Newtonian mechanics course for engineering and science majors. It covers how things move and why: kinematics, forces, energy, momentum, rotation, gravitation, and oscillations.</p>
            <p class="muted">Many students find it hard to picture what the equations mean. LearnPHYS206 lets you watch the physics happen.</p>
          </div>
          <div class="card">
            <h3>The course, module by module</h3>
            <ol class="course-path">
              ${topics.map((t, i) => `<li><span class="num">${i + 1}</span>${t.icon} ${t.title}</li>`).join("")}
            </ol>
          </div>
        </div>
      </section>

      <section class="section" id="how-it-works">
        <div class="section-head">
          <div><div class="eyebrow">How it works</div><h2>How to use this site with the course</h2></div>
          <p>Every module follows the same four-step path.</p>
        </div>
        <ol class="how-steps">
          ${steps.map(([icon, title, body], i) => `
            <li class="card">
              <div class="how-num">Step ${i + 1}</div>
              <div class="icon">${icon}</div>
              <h3>${title}</h3>
              <p>${body}</p>
            </li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <div class="section-head"><div><div class="eyebrow">When to use it</div><h2>Fits into your week</h2></div></div>
        <div class="grid grid-3">
          <div class="card"><h3>Before lecture</h3><p>Skim the module's concept notes so the lecture is easier to follow.</p></div>
          <div class="card"><h3>Before homework</h3><p>Work a walkthrough on the same topic to practice the method. Then do your homework on your own.</p></div>
          <div class="card"><h3>Before exams</h3><p>Review key equations and common mistakes, and use the sims to check your intuition.</p></div>
        </div>
      </section>

      <section class="section notice">
        <strong>Academic integrity.</strong> Every problem on this site is original. Nothing here is from current PHYS 206 homework, quizzes, or exams, or copied from a textbook. Use it to practice, then do your own coursework yourself.
      </section>

      <section class="cta-band">
        <h2>Ready to start?</h2>
        <p>Pick a module and begin with the first concept.</p>
        <a class="btn btn-light btn-lg" href="#/learn">Get started →</a>
      </section>`,
    mount: (root) => {
      root.querySelector("[data-scroll]").addEventListener("click", (e) => {
        e.preventDefault(); // keep the hash route intact
        root.querySelector("#how-it-works").scrollIntoView({ behavior: "smooth" });
      });
      return heroDemo(root.querySelector(".hero-visual canvas"));
    },
  };
}

// ---------------- Learn (module navigation) ----------------
export const moduleNumber = (t) => topics.indexOf(t) + 1;

// Lesson completion is remembered per browser (a convenience, not an account).
const doneKey = (topicId) => `done:${topicId}`;
export function getDone(topicId) {
  try { return new Set(JSON.parse(localStorage.getItem(doneKey(topicId)) || "[]")); } catch { return new Set(); }
}
function setDone(topicId, lessonId, on) {
  const s = getDone(topicId);
  on ? s.add(lessonId) : s.delete(lessonId);
  try { localStorage.setItem(doneKey(topicId), JSON.stringify([...s])); } catch {}
}

// Simulations and walkthroughs attached to a module.
const extraItems = (t) => [
  ...t.sims.map(getSim).filter(Boolean).map((s) => ({ title: `Simulation: ${s.title}`, href: `#/simulations/${s.id}`, meta: "🎛️ interactive", extra: true })),
  ...walkthroughs.filter((w) => w.topic === t.id).map((w) => ({ title: `Walkthrough: ${w.title}`, href: `#/walkthroughs/${w.id}`, meta: `🪜 ${w.difficulty}`, extra: true })),
];

// The rows shown when a module's dropdown is opened.
function moduleItems(t) {
  if (t.lessons) {
    const done = getDone(t.id);
    return [
      ...t.lessons.map((l) => ({
        title: l.title,
        href: `#/topics/${t.id}/${l.id}`,
        meta: `⏱ ${l.minutes} min${l.interactives.length ? ` · 🧪 ${l.interactives.length} interactive` : ""}`,
        done: done.has(l.id),
      })),
      ...extraItems(t),
    ];
  }
  return [{ title: "Concept & key equations", href: `#/topics/${t.id}`, meta: `📖 ${t.subtopics.length} topics` }, ...extraItems(t)];
}

const countInteractives = (t) =>
  (t.lessons ? t.lessons.reduce((n, l) => n + l.interactives.length, 0) : 0) + t.sims.map(getSim).filter(Boolean).length;

function moduleDropdown(t, open) {
  const items = moduleItems(t);
  const nLessons = t.lessons ? t.lessons.length : items.length;
  const nDone = items.filter((i) => i.done).length;
  const first = items[0];
  return `
    <details class="module-dd" ${open ? "open" : ""}>
      <summary>
        <span class="module-badge">${moduleNumber(t)}</span>
        <div class="dd-main">
          <div class="module-num">Module ${moduleNumber(t)} · ${t.chapter}</div>
          <h3>${t.icon} ${t.title}</h3>
          <p>${t.summary}</p>
        </div>
        <div class="dd-meta">
          <span>${nLessons} ${t.lessons ? "lessons" : "parts"}</span>
          <span>🧪 ${countInteractives(t)} interactive</span>
          ${t.lessons ? `<span class="progress-pill"><span style="width:${(nDone / nLessons) * 100}%"></span></span><span class="muted">${nDone}/${nLessons} done</span>` : ""}
        </div>
        <span class="dd-chev" aria-hidden="true">▾</span>
      </summary>
      <div class="dd-body">
        <ol class="lesson-list">
          ${items.map((it, k) => `
            <li><a href="${it.href}" class="${it.done ? "is-done" : ""}">
              <span class="num">${it.done ? "✓" : it.extra ? "+" : k + 1}</span>
              <span class="ll-title">${it.title}</span>
              <span class="ll-meta">${it.meta}</span>
            </a></li>`).join("")}
        </ol>
        <div class="btn-row">
          <a class="btn btn-primary" href="${first.href}">${t.lessons ? "Start lesson 1" : "Start module"} →</a>
          <a class="btn btn-ghost" href="#/topics/${t.id}">Module overview</a>
        </div>
      </div>
    </details>`;
}

export function learn() {
  let lastId = null;
  try { lastId = localStorage.getItem("lastModule"); } catch {}
  const last = (lastId && getTopic(lastId)) || topics[0];
  return {
    html: `
      <div class="eyebrow">PHYS 206 · Course modules</div>
      <h1>Choose a module</h1>
      <p class="muted" style="max-width:62ch">The modules follow the order of PHYS 206. Open a module to see its lessons, interactive models, and practice. If you're new, start with Module 1.</p>
      <div class="btn-row" style="margin:20px 0 16px">
        <button class="btn btn-ghost btn-sm" data-dd="open">Expand all</button>
        <button class="btn btn-ghost btn-sm" data-dd="close">Collapse all</button>
      </div>
      <div class="module-list">${topics.map((t) => moduleDropdown(t, t === last)).join("")}</div>

      <section class="section">
        <div class="section-head"><div><h2>Practice tools</h2></div><p>Go straight to a simulation or practice problem.</p></div>
        <div class="grid grid-2">
          <a class="card tool-card" href="#/simulations"><span class="icon">🎛️</span><div><h3>Simulation library</h3><p>All simulations in one place.</p></div></a>
          <a class="card tool-card" href="#/walkthroughs"><span class="icon">🪜</span><div><h3>Walkthrough library</h3><p>Original practice problems, filterable by module.</p></div></a>
        </div>
      </section>`,
    mount: (root) => {
      root.querySelectorAll("[data-dd]").forEach((b) =>
        b.addEventListener("click", () => root.querySelectorAll(".module-dd").forEach((d) => (d.open = b.dataset.dd === "open"))),
      );
    },
  };
}

// ---------------- Lesson-based module overview (e.g. Unit 1) ----------------
function lessonModule(t) {
  const n = moduleNumber(t);
  const prev = topics[n - 2], next = topics[n];
  const done = getDone(t.id);
  return {
    html: `
      <div class="breadcrumb"><a href="#/learn">Modules</a> / Module ${n}</div>
      <div class="topic-header"><span class="icon">${t.icon}</span><div>
        <div class="eyebrow" style="margin:0">Module ${n} · ${t.chapter} · PHYS 206</div>
        <h1 style="margin:0">${t.title}</h1>
      </div></div>
      <p class="lead muted" style="font-size:1.1rem">${t.summary}</p>
      <div class="btn-row"><a class="btn btn-primary btn-lg" href="#/topics/${t.id}/${t.lessons[0].id}">Start lesson 1 →</a></div>

      <section class="section">
        <h2>Lessons</h2>
        <ol class="lesson-cards">
          ${t.lessons.map((l, k) => `
            <li><a class="card" href="#/topics/${t.id}/${l.id}">
              <div class="card-top"><span class="module-num">Lesson ${k + 1}${done.has(l.id) ? " · ✓ done" : ""}</span><span class="muted small">⏱ ${l.minutes} min</span></div>
              <h3>${l.title}</h3>
              ${l.interactives.length ? `<div class="chips">${l.interactives.map((x) => `<span class="chip chip-neutral">🧪 ${x}</span>`).join("")}</div>` : ""}
            </a></li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <h2>Key equations</h2>
        <div class="eq-list">${t.equations.map((e) => `<div class="eq">${e.eq}<small>${e.note}</small></div>`).join("")}</div>
      </section>

      ${extraItems(t).length ? `
      <section class="section">
        <h2>Also in this module</h2>
        <div class="grid grid-2">
          ${t.sims.map(getSim).filter(Boolean).map(simCard).join("")}
          ${walkthroughs.filter((w) => w.topic === t.id).map(walkCard).join("")}
        </div>
      </section>` : ""}

      <div class="module-nav">
        ${prev ? `<a class="card" href="#/topics/${prev.id}"><span class="muted">← Previous</span><strong>Module ${n - 1}: ${prev.title}</strong></a>` : "<span></span>"}
        ${next ? `<a class="card" href="#/topics/${next.id}" style="text-align:right"><span class="muted">Next →</span><strong>Module ${n + 1}: ${next.title}</strong></a>` : ""}
      </div>`,
    mount: () => { try { localStorage.setItem("lastModule", t.id); } catch {} },
  };
}

// ---------------- Lesson page ----------------
export function lessonDetail(topicId, lessonId) {
  const t = getTopic(topicId);
  const k = t?.lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  if (k < 0) return notFound();
  const l = t.lessons[k], n = moduleNumber(t);
  const prev = t.lessons[k - 1], next = t.lessons[k + 1];
  const done = getDone(t.id);
  return {
    html: `
      <div class="breadcrumb"><a href="#/learn">Modules</a> / <a href="#/topics/${t.id}">Module ${n}</a> / Lesson ${k + 1}</div>
      <div class="lesson-layout">
        <aside class="lesson-aside">
          <div class="aside-title">Module ${n}: ${t.title}</div>
          <ol>
            ${t.lessons.map((x, i) => `<li><a href="#/topics/${t.id}/${x.id}" class="${i === k ? "current" : ""} ${done.has(x.id) ? "is-done" : ""}"><span class="num">${done.has(x.id) ? "✓" : i + 1}</span>${x.title}</a></li>`).join("")}
          </ol>
        </aside>
        <article class="prose">
          <div class="eyebrow">Lesson ${k + 1} of ${t.lessons.length} · ⏱ ${l.minutes} min</div>
          <h1>${l.title}</h1>
          ${l.body}
          <div class="lesson-footer">
            <button class="btn ${done.has(l.id) ? "btn-ghost" : "btn-primary"}" id="mark-done">${done.has(l.id) ? "✓ Completed" : "Mark lesson complete"}</button>
          </div>
          <div class="module-nav">
            ${prev ? `<a class="card" href="#/topics/${t.id}/${prev.id}"><span class="muted">← Previous lesson</span><strong>${prev.title}</strong></a>` : `<a class="card" href="#/topics/${t.id}"><span class="muted">← Back to</span><strong>Module ${n} overview</strong></a>`}
            ${next ? `<a class="card" href="#/topics/${t.id}/${next.id}" style="text-align:right"><span class="muted">Next lesson →</span><strong>${next.title}</strong></a>` : `<a class="card" href="#/learn" style="text-align:right"><span class="muted">Module finished →</span><strong>Back to all modules</strong></a>`}
          </div>
        </article>
      </div>`,
    mount: (root) => {
      try { localStorage.setItem("lastModule", t.id); } catch {}
      const btn = root.querySelector("#mark-done");
      btn.addEventListener("click", () => {
        const on = !getDone(t.id).has(l.id);
        setDone(t.id, l.id, on);
        btn.textContent = on ? "✓ Completed" : "Mark lesson complete";
        btn.className = `btn ${on ? "btn-ghost" : "btn-primary"}`;
        const link = root.querySelector(`.lesson-aside a.current`);
        link.classList.toggle("is-done", on);
        link.querySelector(".num").textContent = on ? "✓" : k + 1;
      });
      return mountWidgets(root);
    },
  };
}

// A module page follows the same 4-step path described on the home page.
export function topicDetail(id) {
  const t = getTopic(id);
  if (!t) return notFound();
  if (t.lessons) return lessonModule(t);
  const n = moduleNumber(t);
  const prev = topics[n - 2], next = topics[n];
  const tSims = t.sims.map(getSim).filter(Boolean);
  const tWalks = walkthroughs.filter((w) => w.topic === t.id);
  const path = [["learn", "📖", "Concept"], ["see", "🎛️", "Simulate"], ["practice", "🪜", "Practice"], ["check", "✅", "Check yourself"]];
  return {
    html: `
      <div class="breadcrumb"><a href="#/learn">Modules</a> / Module ${n}</div>
      <div class="topic-header"><span class="icon">${t.icon}</span><div>
        <div class="eyebrow" style="margin:0">Module ${n} · ${t.chapter} · PHYS 206</div>
        <h1 style="margin:0">${t.title}</h1>
      </div></div>
      <p class="lead muted" style="font-size:1.1rem">${t.summary}</p>

      <nav class="lesson-path" aria-label="Module sections">
        ${path.map(([key, icon, label], i) => `<button data-jump="${key}"><span class="num">${i + 1}</span>${icon} ${label}</button>`).join("")}
      </nav>

      <section class="section" id="sec-learn">
        <div class="eyebrow">Step 1</div>
        <h2>Learn the concept</h2>
        <h3>Lessons in this module</h3>
        <ul class="subtopics">${t.subtopics.map((s) => `<li>${s}</li>`).join("")}</ul>
        <h3 style="margin-top:24px">Concept notes</h3>
        ${placeholder("Write a short concept explanation", " Explain the big idea in your own words, with an everyday example. A tennis example works well here.")}
        <h3 style="margin-top:24px">Key equations</h3>
        ${t.equations.length
          ? `<div class="eq-list">${t.equations.map((e) => `<div class="eq">${e.eq}<small>${e.note}</small></div>`).join("")}</div>`
          : placeholder("Add key equations", ` Add them to the <code>equations</code> array for <code>${t.id}</code> in <code>js/content/topics.js</code>.`)}
      </section>

      <section class="section" id="sec-see">
        <div class="eyebrow">Step 2</div>
        <h2>See it in a simulation</h2>
        ${tSims.length ? `<div class="grid grid-2">${tSims.map(simCard).join("")}</div>`
          : placeholder("No simulation yet", " Build one in <code>js/sims/</code> and add its id to this topic's <code>sims</code> list.")}
      </section>

      <section class="section" id="sec-practice">
        <div class="eyebrow">Step 3</div>
        <h2>Work a problem step by step</h2>
        ${tWalks.length ? `<div class="grid grid-2">${tWalks.map(walkCard).join("")}</div>`
          : placeholder("No walkthroughs yet", " Copy the template at the bottom of <code>js/content/walkthroughs.js</code> and set <code>topic: \"" + t.id + "\"</code>.")}
      </section>

      <section class="section" id="sec-check">
        <div class="eyebrow">Step 4</div>
        <h2>Check yourself</h2>
        <h3>Common mistakes</h3>
        ${placeholder("List the mistakes students make most", " For example, sign errors, mixing up mass and weight, or forgetting that friction opposes motion.")}
        <h3 style="margin-top:24px">Quick check</h3>
        ${placeholder("Add 2–3 concept questions", " Short multiple-choice or one-line questions with hidden answers, so students can test themselves before moving on.")}
      </section>

      <div class="module-nav">
        ${prev ? `<a class="card" href="#/topics/${prev.id}"><span class="muted">← Previous</span><strong>Module ${n - 1}: ${prev.title}</strong></a>` : "<span></span>"}
        ${next ? `<a class="card" href="#/topics/${next.id}" style="text-align:right"><span class="muted">Next →</span><strong>Module ${n + 1}: ${next.title}</strong></a>` : ""}
      </div>`,
    mount: (root) => {
      try { localStorage.setItem("lastModule", t.id); } catch {}
      root.querySelectorAll("[data-jump]").forEach((b) =>
        b.addEventListener("click", () =>
          root.querySelector(`#sec-${b.dataset.jump}`).scrollIntoView({ behavior: "smooth", block: "start" }),
        ),
      );
    },
  };
}

// ---------------- Simulations ----------------
export function simsIndex() {
  return {
    html: `
      <div class="eyebrow">Hands-on</div>
      <h1>Simulations</h1>
      <p class="muted">Change a variable and watch the result update.</p>
      <div class="grid grid-2" style="margin-top:24px">${sims.map(simCard).join("")}</div>`,
  };
}

export function simDetail(id) {
  const s = getSim(id);
  if (!s) return notFound();
  const t = getTopic(s.topic);
  const related = walkthroughs.filter((w) => w.sim === s.id);
  return {
    html: `
      <div class="breadcrumb"><a href="#/simulations">Simulations</a> / ${s.title}</div>
      <h1>${s.icon} ${s.title}</h1>
      <p class="muted">${s.summary} Module: <a href="#/topics/${t.id}">${t.title}</a>.</p>
      <div id="sim-root" style="margin-top:20px"></div>

      <section class="section">
        <h2>Try this</h2>
        ${placeholder("Add guided questions", " Write 3–4 prompts. For example: <em>Which angle gives the longest range? Does that change if the launch height isn't zero?</em>")}
      </section>

      ${related.length ? `<section class="section"><h2>Related walkthroughs</h2><div class="grid grid-2">${related.map(walkCard).join("")}</div></section>` : ""}`,
    mount: (root) => s.mount(root.querySelector("#sim-root")),
  };
}

// ---------------- Walkthroughs ----------------
export function walksIndex() {
  const used = topics.filter((t) => walkthroughs.some((w) => w.topic === t.id));
  return {
    html: `
      <div class="eyebrow">Practice</div>
      <h1>Walkthroughs</h1>
      <p class="muted">Original problems, broken into setup, diagram, equations, and solution. Try each step yourself before you open it.</p>
      <div class="filters" style="margin-top:20px">
        <button class="active" data-topic="">All</button>
        ${used.map((t) => `<button data-topic="${t.id}">${t.title}</button>`).join("")}
      </div>
      <div class="grid grid-2" id="walk-list"></div>`,
    mount: (root) => {
      const list = root.querySelector("#walk-list");
      const render = (topic) => {
        list.innerHTML = walkthroughs.filter((w) => !topic || w.topic === topic).map(walkCard).join("");
      };
      root.querySelectorAll(".filters button").forEach((b) =>
        b.addEventListener("click", () => {
          root.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("active", x === b));
          render(b.dataset.topic);
        }),
      );
      render("");
    },
  };
}

export function walkDetail(id) {
  const w = getWalkthrough(id);
  if (!w) return notFound();
  const i = walkthroughs.indexOf(w);
  const prev = walkthroughs[i - 1], next = walkthroughs[i + 1];
  const t = getTopic(w.topic);
  return {
    html: `
      <div class="breadcrumb"><a href="#/walkthroughs">Walkthroughs</a> / ${w.title}</div>
      <div class="eyebrow">${t.title} · ${w.difficulty}</div>
      <h1>${w.title}</h1>
      <div class="problem-statement">${w.statement}</div>
      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn btn-ghost" id="expand">Show all steps</button>
        ${w.sim ? `<a class="btn btn-ghost" href="#/simulations/${w.sim}">Open in simulation →</a>` : ""}
      </div>
      <div class="steps">
        ${w.steps.map((s) => `<details class="step"><summary>${s.title}</summary><div class="step-body">${s.body}</div></details>`).join("")}
      </div>
      <div class="btn-row" style="justify-content:space-between;margin-top:32px">
        ${prev ? `<a href="#/walkthroughs/${prev.id}">← ${prev.title}</a>` : "<span></span>"}
        ${next ? `<a href="#/walkthroughs/${next.id}">${next.title} →</a>` : ""}
      </div>`,
    mount: (root) => {
      const btn = root.querySelector("#expand");
      btn.addEventListener("click", () => {
        const all = root.querySelectorAll(".step");
        const open = [...all].every((d) => d.open);
        all.forEach((d) => (d.open = !open));
        btn.textContent = open ? "Show all steps" : "Hide all steps";
      });
    },
  };
}

// ---------------- About ----------------
export function about() {
  return {
    html: `
      <div class="eyebrow">About</div>
      <h1>Why this exists</h1>
      <p class="lead muted" style="font-size:1.1rem;max-width:60ch">Many students learn mechanics by reading worked solutions. This site lets you change the variables yourself and see what happens.</p>

      <section class="section">
        <h2>Who built it</h2>
        ${placeholder("Add your bio", " Who you are, why you're building this while taking PHYS 206, and a link to your other projects.")}
      </section>

      <section class="section">
        <h2>Ground rules</h2>
        <div class="grid grid-2">
          <div class="card"><h3>✅ What's here</h3><p>Original practice problems, concept explanations, and simulations written for this site.</p></div>
          <div class="card"><h3>🚫 What's not here</h3><p>Solutions to current PHYS 206 homework, quizzes, or exams, or problems copied from textbooks. This follows the Aggie Honor Code.</p></div>
        </div>
      </section>

      <section class="section">
        <h2>Instructors &amp; TAs</h2>
        ${placeholder("Add a note for instructors", " Ask for feedback and say how to reach you. Include a contact email or form link.")}
      </section>

      <section class="section">
        <h2>Feedback</h2>
        ${placeholder("Add a feedback link", " The simplest option is a Google Form link. Ask students which topic or simulation they want next.")}
      </section>`,
  };
}

export function notFound() {
  return {
    html: `<h1>Page not found</h1><p class="muted">That page doesn't exist yet.</p><a class="btn btn-primary" href="#/">Go home</a>`,
  };
}
