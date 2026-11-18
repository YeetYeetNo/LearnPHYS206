// Page renderers. Each returns { html, mount? } where mount(root) runs after
// the HTML is in the page and may return a cleanup function.
import { topics, getTopic } from "./content/topics.js";
import { walkthroughs, getWalkthrough } from "./content/walkthroughs.js";
import { sims, getSim } from "./sims/index.js";
import { heroDemo } from "./hero.js";
import { mountWidgets } from "./widgets/index.js";
import { icon } from "./icons.js";
import { scrollToEl } from "./smooth-scroll.js";

// Dashed box marking a spot where content still needs to be written.
// It only shows when the site runs on your own computer, never on the live site.
const DEV = ["localhost", "127.0.0.1", ""].includes(location.hostname);
const placeholder = (title, hint) =>
  DEV ? `<div class="placeholder"><strong>✏️ ${title}</strong>${hint}</div>` : "";

// Equations are written in LaTeX and typeset by KaTeX after the page renders.
const eqBox = (e) => `<div class="eq"><div class="eq-math" data-lenis-prevent>\\(${e.eq}\\)</div><small>${e.note}</small></div>`;

const simCard = (s) => `
  <a class="card" href="#/simulations/${s.id}">
    <div class="card-top"><span class="module-num">Simulation</span></div>
    <h3>${s.title}</h3><p>${s.summary}</p></a>`;

const walkCard = (w) => `
  <a class="card" href="#/walkthroughs/${w.id}">
    <div class="card-top"><span class="chip chip-neutral">${getTopic(w.topic)?.title ?? ""}</span><span class="muted small">${w.difficulty}</span></div>
    <h3>${w.title}</h3>
    <p>${w.statement.replace(/<[^>]+>/g, "").slice(0, 110)}…</p>
  </a>`;

// The four-step way to use a module. Shown once, on the home page.
const STEPS = [
  ["compass", "Start with the overview", "Each module opens with what the unit covers and what you should be able to do by the end."],
  ["pencil", "Try the examples first", "Work each worked example yourself before you open the solution."],
  ["sliders", "Test your intuition", "Use the interactive models: change a variable and predict what happens before you watch."],
  ["check", "Finish with practice", "End each module with the practice problems, then check your answers with the answer checker."],
];

// One small, static picture of the site's own interface for each step (shown by "How it works").
const STEP_VISUALS = [
  `<div class="mock">
     <div class="eyebrow">Module 3 · Lesson 1 of 8</div>
     <div class="mock-title">Overview: what Unit 3 covers</div>
     <div class="mock-label">By the end, you should be able to</div>
     <ul class="checklist">
       <li>Split a 2D motion into independent x and y parts</li>
       <li>Find the range and flight time of a projectile</li>
       <li>Describe circular motion with a<sub>rad</sub> = v²/R</li>
     </ul>
   </div>`,
  `<div class="mock">
     <div class="example">
       <div class="example-label">Worked example</div>
       <p>A ball is thrown at 20 m/s, 30° above level ground. How far does it land?</p>
       <div class="mock-reveal">▸ Show solution</div>
     </div>
   </div>`,
  `<div class="mock">
     <div class="widget mock-widget">
       <div class="widget-head">${icon("sliders", "widget-ico")}<strong>Projectile</strong><span class="widget-tag">Interactive</span></div>
       <div class="mock-stage">
         <svg viewBox="0 0 320 130" role="img" aria-label="A projectile launched at 30, 45 and 60 degrees; 45 degrees lands farthest" data-mock="projectile">
           <line x1="10" y1="118" x2="310" y2="118" class="mk-ground"/>
           <path d="M10 118 Q 140 -12 270 118" class="mk-ghost"/>
           <path d="M10 118 Q 122.7 -77.2 235.3 118" class="mk-ghost"/>
           <path d="M10 118 Q 122.7 53 235.3 118" class="mk-arc"/>
           <circle cx="122.7" cy="85.5" r="6" class="mk-ball"/>
           <text x="235.3" y="108" class="mk-range" text-anchor="middle"></text>
         </svg>
       </div>
       <div class="control mock-control"><label>Angle θ <span>30 °</span></label><div class="mock-range"><span style="width:33%"></span></div></div>
     </div>
   </div>`,
  `<div class="mock">
     <div class="example">
       <div class="example-label">Practice problem 4</div>
       <p>Same ball, now thrown at 60°. Where does it land?</p>
       <div class="answer-check"><span class="mock-input">35.3</span> m <span class="good">✓ Correct: the same range as 30°.</span></div>
     </div>
   </div>`,
];

// The "Test your intuition" picture plays like the real model: the angle steps through 30°, 45°
// and 60°, the slider follows, and the ball flies each arc to scale (20 m/s; 260 px = 40.8 m).
// It runs only while on screen, and stands still for visitors who ask for reduced motion.
function animateProjectileMock(root) {
  const svg = root.querySelector('[data-mock="projectile"]');
  if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const arc = svg.querySelector(".mk-arc"), ball = svg.querySelector(".mk-ball"), label = svg.querySelector(".mk-range");
  const widget = svg.closest(".mock-widget");
  const fill = widget.querySelector(".mock-range span"), readout = widget.querySelector(".mock-control label span");
  const g = 9.8, v0 = 20, px = 260 / 40.8;
  const X = (x) => 10 + x * px, Y = (y) => 118 - y * px;
  const angles = [30, 45, 60];
  let i = 0, t = 0, hold = 0, last = 0, raf = 0, visible = false;

  const shot = (deg) => {
    const th = (deg * Math.PI) / 180;
    const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    return { deg, vx, vy, tf: (2 * vy) / g };
  };
  let cur = shot(angles[0]);
  const setAngle = (deg) => {
    readout.textContent = `${deg} °`;
    fill.style.width = `${(deg / 90) * 100}%`;
    label.textContent = "";
  };
  setAngle(cur.deg);

  const frame = (now) => {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (hold > 0) {
      hold -= dt;
      if (hold <= 0) { i = (i + 1) % angles.length; cur = shot(angles[i]); t = 0; setAngle(cur.deg); }
    } else {
      t = Math.min(cur.tf, t + dt * 1.5);
      let d = "";
      for (let j = 0; j <= 40; j++) {
        const tt = (t * j) / 40;
        d += `${j ? "L" : "M"}${X(cur.vx * tt).toFixed(1)} ${Y(cur.vy * tt - 0.5 * g * tt * tt).toFixed(1)}`;
      }
      arc.setAttribute("d", d);
      ball.setAttribute("cx", X(cur.vx * t).toFixed(1));
      ball.setAttribute("cy", Y(cur.vy * t - 0.5 * g * t * t).toFixed(1));
      if (t >= cur.tf) {
        const range = cur.vx * cur.tf;
        label.setAttribute("x", X(range).toFixed(1));
        label.textContent = `${range.toFixed(1)} m`;
        hold = 1.1; // show where it landed, then the next angle
      }
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
  });
  io.observe(svg);
  return () => { io.disconnect(); cancelAnimationFrame(raf); visible = false; };
}

// ---------------- Course map (home page) ----------------
// How the modules build on each other: motion, then forces, then three branches (energy,
// momentum, rotation) that meet again in oscillations. Drawn by the taste-skill diagram builder;
// each box links to its module (see js/fx-bridge.js). Positions are fractions of the box.
const MAP = [
  // [topic id, short label, [x, y]]
  ["units-vectors", "Units & vectors", [0.08, 0.2]],
  ["motion-1d", "Straight-line motion", [0.08, 0.5]],
  ["kinematics", "Motion in 2D", [0.08, 0.8]],
  ["newtons-laws", "Newton's laws", [0.29, 0.8]],
  ["applying-newton", "Applying Newton", [0.29, 0.5]],
  ["work-energy", "Work & energy", [0.52, 0.16]],
  ["energy-conservation", "Energy conservation", [0.75, 0.16]],
  ["momentum", "Momentum", [0.52, 0.5]],
  ["rotation", "Rotation", [0.48, 0.84]],
  ["rotational-dynamics", "Rotational dynamics", [0.69, 0.84]],
  ["equilibrium", "Equilibrium", [0.91, 0.84]],
  ["periodic-motion", "Periodic motion", [0.91, 0.46]],
];
const MAP_EDGES = [
  ["units-vectors", "motion-1d"], ["motion-1d", "kinematics"], ["kinematics", "newtons-laws"], ["newtons-laws", "applying-newton"],
  ["applying-newton", "work-energy"], ["applying-newton", "momentum"], ["applying-newton", "rotation"],
  ["work-energy", "energy-conservation"], ["rotation", "rotational-dynamics"], ["rotational-dynamics", "equilibrium"],
  ["energy-conservation", "periodic-motion"], ["rotational-dynamics", "periodic-motion"],
];
function courseMap() {
  const spec = {
    layout: "free",
    alt: "Course map: units, 1D and 2D motion lead to Newton's laws, which branch into energy, momentum, and rotation; energy and rotation meet again in periodic motion.",
    nodes: MAP.filter(([id]) => getTopic(id)).map(([id, label, at]) => ({ id, label, meta: String(moduleNumber(getTopic(id))), at })),
    edges: MAP_EDGES.map(([from, to]) => ({ from, to, curve: "elbow" })),
    motion: { cycle: 4 },
  };
  return `<div class="dg course-map" data-diagram-links="#/topics/"><script type="application/json">${JSON.stringify(spec).replace(/</g, "\\u003c")}</script></div>`;
}

const lessonMeta = (l) =>
  `<span class="meta-item">${icon("clock")} ${l.minutes} min</span>${l.interactives.length ? `<span class="meta-item">${icon("flask")} ${l.interactives.length} interactive</span>` : ""}`;

// ---------------- Home (landing page) ----------------
export function home() {
  const interactives = topics.reduce((n, t) => n + (t.lessons ? t.lessons.reduce((m, l) => m + l.interactives.length, 0) : 0), 0) + sims.length;
  const lessons = topics.reduce((n, t) => n + (t.lessons?.length || 0), 0);
  return {
    html: `
      <section class="hero">
        <div class="hero-ground" data-fx="contour-lines" data-fx-seed="206" data-fx-params='{"calmX":0.26,"calmY":0.45,"calm":1,"opacity":0.24,"edge":0.6,"speed":0.015}' aria-hidden="true"></div>
        <div>
          <div class="eyebrow">A learning platform for PHYS 206</div>
          <h1>Learn Newtonian mechanics by seeing it move.</h1>
          <p class="lead">LearnPHYS206 is a free study companion for Texas A&amp;M's PHYS 206. It has guided lessons, interactive models, and practice problems, in the same order as the course.</p>
          <div class="btn-row">
            <a class="btn btn-primary btn-lg" href="#/learn">Get started ${icon("arrow")}</a>
            <a class="btn btn-ghost btn-lg" href="#how-it-works" data-scroll>How it works</a>
          </div>
          <div class="stats" data-moment="counter-rolls">
            <div><strong data-count>${topics.length}</strong><span>modules</span></div>
            <div><strong data-count>${interactives}</strong><span>interactive models</span></div>
            <div><strong data-count>${lessons}</strong><span>lessons</span></div>
          </div>
        </div>
        <div class="hero-visual"><canvas aria-label="Projectile demo: drag on the picture to set the launch angle"></canvas></div>
      </section>

      <section class="section" id="about-course">
        <div class="eyebrow">The course</div>
        <h2>What is PHYS 206?</h2>
        <p class="measure">PHYS 206 is Texas A&amp;M's calculus-based Newtonian mechanics course for engineering and science majors. It covers how things move and why: kinematics, forces, energy, momentum, rotation, gravitation, and oscillations. Many students find it hard to picture what the equations mean. LearnPHYS206 lets you watch the physics happen.</p>
        <div class="course-map-panel">${courseMap()}</div>
        <ol class="course-path course-path--alt" aria-label="All modules">
          ${topics.map((t, i) => `<li><a href="#/topics/${t.id}"><span class="num">${i + 1}</span>${t.title}</a></li>`).join("")}
        </ol>
      </section>

      <section class="section how" id="how-it-works" data-moment="pinned-chapters">
        <div class="mo-pc__grid">
          <div class="mo-pc__text">
            <div>
              <div class="eyebrow">How it works</div>
              <h2>How to use this site with the course</h2>
              <p class="muted">Every module follows the same four steps.</p>
            </div>
            <ol class="mo-pc__steps">
              ${STEPS.map(([ic, title, body], i) => `
                <li class="mo-pc__step">
                  <h3><span class="step-ico">${icon(ic)}</span> ${title}</h3>
                  <p>${body}</p>
                  <figure class="mo-pc__visual mo-pc__visual--lit">${STEP_VISUALS[i]}</figure>
                </li>`).join("")}
            </ol>
          </div>
          <div class="mo-pc__visuals" aria-hidden="true"></div>
        </div>
      </section>

      <section class="section">
        <div class="week">
          <div><h3>Before lecture</h3><p>Skim the module's overview so the lecture is easier to follow.</p></div>
          <div><h3>Before homework</h3><p>Work the module's practice problems to learn the method. Then do your homework on your own.</p></div>
          <div><h3>Before exams</h3><p>Review the key equations and common mistakes, and use the interactive models to check your intuition.</p></div>
        </div>
      </section>

      <section class="section notice">
        <strong>Academic integrity.</strong> Every problem on this site is original. Nothing here is from current PHYS 206 homework, quizzes, or exams, or copied from a textbook. Use it to practice, then do your own coursework yourself.
      </section>

      <section class="cta-band">
        <h2>Ready to start?</h2>
        <p>Pick a module and begin with its overview.</p>
        <a class="btn btn-light btn-lg" href="#/learn">Get started ${icon("arrow")}</a>
      </section>`,
    mount: (root) => {
      root.querySelector("[data-scroll]").addEventListener("click", (e) => {
        e.preventDefault(); // keep the hash route intact
        scrollToEl(root.querySelector("#how-it-works"));
      });
      const stopHero = heroDemo(root.querySelector(".hero-visual canvas"));
      const stopMock = animateProjectileMock(root);
      return () => { stopHero(); stopMock(); };
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
  ...t.sims.map(getSim).filter(Boolean).map((s) => ({ title: `Simulation: ${s.title}`, href: `#/simulations/${s.id}`, meta: `<span class="meta-item">${icon("sliders")} interactive</span>`, extra: true })),
  ...walkthroughs.filter((w) => w.topic === t.id).map((w) => ({ title: `Walkthrough: ${w.title}`, href: `#/walkthroughs/${w.id}`, meta: `<span class="meta-item">${w.difficulty}</span>`, extra: true })),
];

// The rows shown when a module's dropdown is opened.
function moduleItems(t) {
  if (t.lessons) {
    const done = getDone(t.id);
    return [
      ...t.lessons.map((l) => ({ title: l.title, href: `#/topics/${t.id}/${l.id}`, meta: lessonMeta(l), done: done.has(l.id) })),
      ...extraItems(t),
    ];
  }
  return [{ title: "Concept & key equations", href: `#/topics/${t.id}`, meta: `<span class="meta-item">${t.subtopics.length} topics</span>` }, ...extraItems(t)];
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
        <span class="module-badge" aria-label="Module ${moduleNumber(t)}">${moduleNumber(t)}</span>
        <div class="dd-main">
          <div class="module-num">${t.chapter}</div>
          <h3>${t.title}</h3>
          <p>${t.summary}</p>
        </div>
        <div class="dd-meta">
          <span>${nLessons} ${t.lessons ? "lessons" : "parts"}</span>
          <span class="meta-item">${icon("flask")} ${countInteractives(t)} interactive</span>
          ${t.lessons ? `<span class="progress-pill" role="img" aria-label="${nDone} of ${nLessons} lessons done"><span style="width:${(nDone / nLessons) * 100}%"></span></span><span>${nDone}/${nLessons} done</span>` : ""}
        </div>
        <span class="dd-chev">${icon("chevron")}</span>
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
          <a class="btn btn-primary" href="${first.href}">${t.lessons ? "Start lesson 1" : "Start module"} ${icon("arrow")}</a>
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
      <p class="muted measure">The modules follow the order of PHYS 206. Open a module to see its lessons, interactive models, and practice. If you're new, start with Module 1.</p>
      <div class="btn-row toolbar">
        <button class="btn btn-ghost btn-sm" data-dd="open">Expand all</button>
        <button class="btn btn-ghost btn-sm" data-dd="close">Collapse all</button>
      </div>
      <div class="module-list">${topics.map((t) => moduleDropdown(t, t === last)).join("")}</div>`,
    mount: (root) => {
      root.querySelectorAll("[data-dd]").forEach((b) =>
        b.addEventListener("click", () => root.querySelectorAll(".module-dd").forEach((d) => (d.open = b.dataset.dd === "open"))),
      );
    },
  };
}

// Header shared by module pages: number badge, chapter line, title.
const moduleHeader = (t, n) => `
  <div class="topic-header"><span class="module-badge">${n}</span><div>
    <div class="eyebrow">Module ${n} · ${t.chapter} · PHYS 206</div>
    <h1>${t.title}</h1>
  </div></div>
  <p class="lead muted">${t.summary}</p>`;

const moduleNav = (prev, next, n) => `
  <div class="module-nav">
    ${prev ? `<a class="card" href="#/topics/${prev.id}"><span class="muted">← Previous</span><strong>Module ${n - 1}: ${prev.title}</strong></a>` : "<span></span>"}
    ${next ? `<a class="card card-next" href="#/topics/${next.id}"><span class="muted">Next →</span><strong>Module ${n + 1}: ${next.title}</strong></a>` : ""}
  </div>`;

// ---------------- Lesson-based module overview (e.g. Unit 1) ----------------
function lessonModule(t) {
  const n = moduleNumber(t);
  const prev = topics[n - 2], next = topics[n];
  const done = getDone(t.id);
  return {
    html: `
      <div class="breadcrumb"><a href="#/learn">Modules</a> / Module ${n}</div>
      ${moduleHeader(t, n)}
      <div class="module-progress">
        <span class="progress-pill" role="img" aria-label="${t.lessons.filter((l) => done.has(l.id)).length} of ${t.lessons.length} lessons done"><span style="width:${(t.lessons.filter((l) => done.has(l.id)).length / t.lessons.length) * 100}%"></span></span>
        <span class="muted small">${t.lessons.filter((l) => done.has(l.id)).length} of ${t.lessons.length} lessons done</span>
      </div>
      <div class="btn-row"><a class="btn btn-primary btn-lg" href="#/topics/${t.id}/${t.lessons[0].id}">Start lesson 1 ${icon("arrow")}</a></div>

      <section class="section">
        <h2>Lessons</h2>
        <ol class="lesson-cards">
          ${t.lessons.map((l, k) => `
            <li><a class="card" href="#/topics/${t.id}/${l.id}">
              <div class="card-top"><span class="module-num">Lesson ${k + 1}${done.has(l.id) ? " · ✓ done" : ""}</span><span class="muted small meta-item">${icon("clock")} ${l.minutes} min</span></div>
              <h3>${l.title}</h3>
              ${l.interactives.length ? `<div class="chips">${l.interactives.map((x) => `<span class="chip chip-neutral">${x}</span>`).join("")}</div>` : ""}
            </a></li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <h2>Key equations</h2>
        <div class="eq-list">${t.equations.map(eqBox).join("")}</div>
      </section>

      ${extraItems(t).length ? `
      <section class="section">
        <h2>Also in this module</h2>
        <div class="grid grid-2">
          ${t.sims.map(getSim).filter(Boolean).map(simCard).join("")}
          ${walkthroughs.filter((w) => w.topic === t.id).map(walkCard).join("")}
        </div>
      </section>` : ""}

      ${moduleNav(prev, next, n)}`,
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
          <div class="eyebrow">Lesson ${k + 1} of ${t.lessons.length} · <span class="meta-item">${icon("clock")} ${l.minutes} min</span></div>
          <h1>${l.title}</h1>
          ${l.body}
          <div class="lesson-footer">
            <button class="btn ${done.has(l.id) ? "btn-ghost" : "btn-primary"}" id="mark-done">${done.has(l.id) ? "✓ Completed" : "Mark lesson complete"}</button>
          </div>
          <div class="module-nav">
            ${prev ? `<a class="card" href="#/topics/${t.id}/${prev.id}"><span class="muted">← Previous lesson</span><strong>${prev.title}</strong></a>` : `<a class="card" href="#/topics/${t.id}"><span class="muted">← Back to</span><strong>Module ${n} overview</strong></a>`}
            ${next ? `<a class="card card-next" href="#/topics/${t.id}/${next.id}"><span class="muted">Next lesson →</span><strong>${next.title}</strong></a>` : `<a class="card card-next" href="#/learn"><span class="muted">Module finished →</span><strong>Back to all modules</strong></a>`}
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

// A module page without lessons yet: a simple four-part outline.
// (Every current module has lessons, so this only shows for a newly added one.)
export function topicDetail(id) {
  const t = getTopic(id);
  if (!t) return notFound();
  if (t.lessons) return lessonModule(t);
  const n = moduleNumber(t);
  const prev = topics[n - 2], next = topics[n];
  const tSims = t.sims.map(getSim).filter(Boolean);
  const tWalks = walkthroughs.filter((w) => w.topic === t.id);
  return {
    html: `
      <div class="breadcrumb"><a href="#/learn">Modules</a> / Module ${n}</div>
      ${moduleHeader(t, n)}

      <section class="section">
        <h2>What this module covers</h2>
        <ul class="subtopics">${t.subtopics.map((s) => `<li>${s}</li>`).join("")}</ul>
        ${placeholder("Write a short concept explanation", " Explain the big idea in your own words, with an everyday example.")}
      </section>

      <section class="section">
        <h2>Key equations</h2>
        ${t.equations.length
          ? `<div class="eq-list">${t.equations.map(eqBox).join("")}</div>`
          : placeholder("Add key equations", ` Add them to the <code>equations</code> array for <code>${t.id}</code> in <code>js/content/topics.js</code>.`)}
      </section>

      ${tSims.length || tWalks.length ? `
      <section class="section">
        <h2>Practice</h2>
        <div class="grid grid-2">${tSims.map(simCard).join("")}${tWalks.map(walkCard).join("")}</div>
      </section>` : placeholder("No practice yet", " Add a simulation in <code>js/sims/</code> or a walkthrough in <code>js/content/walkthroughs.js</code>.")}

      ${moduleNav(prev, next, n)}`,
    mount: () => { try { localStorage.setItem("lastModule", t.id); } catch {} },
  };
}

// ---------------- Simulation page ----------------
export function simDetail(id) {
  const s = getSim(id);
  if (!s) return notFound();
  const t = getTopic(s.topic);
  const related = walkthroughs.filter((w) => w.sim === s.id);
  const prompts = placeholder("Add guided questions", " Write 3–4 prompts. For example: <em>Which angle gives the longest range? Does that change if the launch height isn't zero?</em>");
  return {
    html: `
      <div class="breadcrumb"><a href="#/topics/${t.id}">${t.title}</a> / ${s.title}</div>
      <h1>${s.title}</h1>
      <p class="muted">${s.summary} Module: <a href="#/topics/${t.id}">${t.title}</a>.</p>
      <div id="sim-root"></div>

      ${prompts ? `<section class="section"><h2>Try this</h2>${prompts}</section>` : ""}

      ${related.length ? `<section class="section"><h2>Related walkthroughs</h2><div class="grid grid-2">${related.map(walkCard).join("")}</div></section>` : ""}`,
    mount: (root) => s.mount(root.querySelector("#sim-root")),
  };
}

// ---------------- Walkthrough page ----------------
export function walkDetail(id) {
  const w = getWalkthrough(id);
  if (!w) return notFound();
  const i = walkthroughs.indexOf(w);
  const prev = walkthroughs[i - 1], next = walkthroughs[i + 1];
  const t = getTopic(w.topic);
  return {
    html: `
      <div class="breadcrumb"><a href="#/topics/${t.id}">${t.title}</a> / ${w.title}</div>
      <div class="eyebrow">${t.title} · ${w.difficulty}</div>
      <h1>${w.title}</h1>
      <div class="problem-statement">${w.statement}</div>
      <div class="btn-row walk-actions">
        <button class="btn btn-ghost" id="expand">Show all steps</button>
        ${w.sim ? `<a class="btn btn-ghost" href="#/simulations/${w.sim}">Open in simulation ${icon("arrow")}</a>` : ""}
      </div>
      <div class="steps">
        ${w.steps.map((s) => `<details class="step"><summary>${s.title}</summary><div class="step-body">${s.body}</div></details>`).join("")}
      </div>
      <div class="btn-row walk-nav">
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
      <h1>About LearnPHYS206</h1>
      <p class="lead muted measure">LearnPHYS206 is a free study resource for students taking PHYS 206 (Newtonian Mechanics) at Texas A&amp;M. It follows the course from units and vectors to oscillations, with guided lessons, worked examples, practice problems, and interactive models that let you change a variable and watch the physics respond.</p>

      <section class="section">
        <h2>Why I built it</h2>
        <p class="measure">I built this site as a physics student myself. Textbooks explain the equations, but it often takes seeing a projectile's path bend or a pendulum's period change to really understand them. My goal is to make each concept click, not just to give you answers.</p>
        <p class="measure">New here? See <a href="#/" data-how>how to use the site with the course</a>.</p>
      </section>

      <section class="section notice">
        <strong>A note on academic integrity.</strong> Every problem on this site is original. Nothing here is copied from course homework, quizzes, or exams, and nothing is meant to replace your instructor, textbook, or assigned work. Use it to learn the material, and follow the Aggie Honor Code in your coursework.
      </section>

      <section class="section">
        <h2>Feedback</h2>
        <p class="measure">Found a mistake or have an idea for a new model? I'd love to hear from you at <a href="mailto:daksheeth@tamu.edu"><strong>daksheeth@tamu.edu</strong></a>.</p>
      </section>

      <section class="section">
        <p class="muted small measure">LearnPHYS206 is an independent student project and is not affiliated with or endorsed by Texas A&amp;M University or the Department of Physics &amp; Astronomy.</p>
        <p class="byline"><strong>Daksheeth Rajapandian</strong><br><span class="muted">Physics (Business Track), Texas A&amp;M University</span></p>
      </section>`,
    mount: (root) => {
      // go to the home page, then scroll to its "How it works" section
      root.querySelector("[data-how]").addEventListener("click", (e) => {
        e.preventDefault();
        // the router re-renders on hashchange; scroll once that has happened
        addEventListener("hashchange", () => setTimeout(() => scrollToEl(document.getElementById("how-it-works"))), { once: true });
        location.hash = "#/";
      });
    },
  };
}

export function notFound() {
  return {
    html: `<h1>Page not found</h1><p class="muted">That page doesn't exist yet.</p><a class="btn btn-primary" href="#/">Go home</a>`,
  };
}
