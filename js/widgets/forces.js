// Unit 4 widgets: forces and Newton's laws.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { plane, mag, fmt, deg, rad } from "./plane.js";
import { shell, button, row, select, checkbox, table } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const F = { w: "#27ae60", n: "#2f80ed", f: "#eb5757", T: "#9b51e0", P: "#f2994a", net: "#16a34a", v: "#2f80ed" };
const angleDeg = (x, y) => ((deg(Math.atan2(y, x)) % 360) + 360) % 360;

function playLoop(onFrame) {
  let raf = 0, last = 0;
  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (onFrame(dt) === false) return;
    raf = requestAnimationFrame(tick);
  };
  return {
    start() { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { cancelAnimationFrame(raf); },
  };
}

// =====================================================================
// Net force builder: drag rope forces on a crate, see ΣF
// =====================================================================
export function netForce(el) {
  const { canvas, controls, readout } = shell(el, { title: "Net force builder", icon: "📦", canvas: true });
  const COLORS = ["#2f80ed", "#eb5757", "#9b51e0"];
  let forces = [[50, 0], [-15, 26]];
  let third = false, chain = false;
  const p = plane(canvas, { range: 45, unit: 10, snap: 1, center: [14, 12], axes: ["x (N)", "y (N)"], onDraw });
  [0, 1, 2].forEach((i) => p.addHandle({ color: COLORS[i], get: () => (i < forces.length ? forces[i] : [9999, 9999]), set: (x, y) => { if (i < forces.length) forces[i] = [x, y]; } }));
  controls.append(
    row(button("Worked example", () => { forces = third ? [[50, 0], [-15, 26], [0, -20]] : [[50, 0], [-15, 26]]; p.draw(); })),
    checkbox("Add a third rope", third, (v) => { third = v; forces = v ? [...forces, [-20, -26]] : forces.slice(0, 2); p.draw(); }),
    checkbox("Show tail-to-head addition", chain, (v) => { chain = v; p.draw(); }),
  );
  function onDraw(api) {
    const c = api.colors();
    const net = forces.reduce((s, f) => [s[0] + f[0], s[1] + f[1]], [0, 0]);
    const [ox, oy] = api.S(0, 0);
    api.ctx.fillStyle = c.border; api.ctx.strokeStyle = c.muted; api.ctx.lineWidth = 2;
    api.ctx.fillRect(ox - 14, oy - 14, 28, 28); api.ctx.strokeRect(ox - 14, oy - 14, 28, 28);
    if (chain) {
      let s = [0, 0];
      forces.forEach((f, i) => { api.vector(s[0], s[1], s[0] + f[0], s[1] + f[1], COLORS[i], null, { dashed: true, width: 2 }); s = [s[0] + f[0], s[1] + f[1]]; });
    }
    api.vector(0, 0, net[0], net[1], F.net, "ΣF", { width: 5 });
    forces.forEach((f, i) => api.vector(0, 0, f[0], f[1], COLORS[i], `F${i + 1}`));
    const rowOf = (name, [x, y], color) => [`<span style="color:${color}">${name}</span>`, fmt(x, 1), fmt(y, 1), fmt(mag(x, y), 1), `${fmt(angleDeg(x, y), 0)}°`];
    table(readout)([
      ["", "Fₓ (N)", "Fᵧ (N)", "size (N)", "angle"],
      ...forces.map((f, i) => rowOf(`F${i + 1}`, f, COLORS[i])),
      rowOf("<strong>ΣF</strong>", net, F.net),
    ]);
    const zero = mag(...net) < 1.5;
    readout.insertAdjacentHTML("beforeend", `<div class="verdict ${zero ? "good" : ""}">${zero ? "ΣF ≈ 0: the crate is in equilibrium." : `The crate acts as if one ${fmt(mag(...net), 0)} N force pulled it at ${fmt(angleDeg(...net), 0)}°.`}</div>`);
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Inertia: a puck that only stops if friction acts
// =====================================================================
export function inertiaPuck(el) {
  const { canvas, controls, readout } = shell(el, { title: "Hockey puck on ice", icon: "🏒", canvas: true, wide: true });
  const m = 0.17, PUSH = 2.0, PUSH_TIME = 0.4, L = 24;
  let mu = 0.05, x = 2, v = 0, pushLeft = 0, time = 0;
  const hist = [];
  controls.append(
    slider({ label: "Friction coefficient μ", min: 0, max: 0.3, step: 0.01, value: mu, onInput: (val) => { mu = val; draw(); } }),
    row(
      button("👋 Push", () => { pushLeft = PUSH_TIME; }, "btn btn-primary btn-sm"),
      button("Frictionless ice", () => { mu = 0; controls.querySelector("input").value = 0; controls.querySelector("input").dispatchEvent(new Event("input")); }),
      button("Reset", () => { x = 2; v = 0; pushLeft = 0; hist.length = 0; time = 0; draw(); }),
    ),
  );
  const forces = () => {
    const push = pushLeft > 0 ? PUSH : 0;
    const moving = Math.abs(v) > 1e-4;
    const fr = moving ? mu * m * G : Math.min(push, mu * m * G);
    return { push, fr, net: push - (moving || push > 0 ? fr : 0) };
  };
  const anim = playLoop((dt) => {
    const f = forces();
    let a = f.net / m;
    const vNew = v + a * dt;
    v = pushLeft <= 0 && v > 0 && vNew < 0 ? 0 : Math.max(0, vNew); // friction can stop it, never reverse it
    x = (x + v * dt) % L;
    pushLeft = Math.max(0, pushLeft - dt);
    time += dt;
    hist.push([time, v]);
    while (hist.length && hist[0][0] < time - 10) hist.shift();
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const ty = h * 0.3, X = (xx) => 20 + (xx / L) * (w - 40);
    ctx.fillStyle = mu === 0 ? "rgba(120,190,255,.25)" : c.border; ctx.fillRect(20, ty - 4, w - 40, 22);
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(mu === 0 ? "frictionless ice (the puck wraps around)" : `ice with friction μ = ${mu}`, 22, ty + 32);
    const px = X(x);
    const f = forces();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.ellipse(px, ty, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
    if (f.push) drawArrow(ctx, px - 50, ty - 18, 36, 0, F.P, "push");
    if (v > 1e-3 && mu > 0) drawArrow(ctx, px, ty - 18, -24, 0, F.f, "friction");
    if (v > 1e-3) drawArrow(ctx, px, ty - 34, Math.min(70, v * 10), 0, F.v, "v");
    const P = panel(ctx, c, { x: 44, y: h * 0.52, w: w - 56, h: h * 0.4 }, { t0: Math.max(0, time - 10), t1: Math.max(10, time), y0: 0, y1: Math.max(6, ...hist.map((q) => q[1] * 1.15)), label: "speed v (m/s) vs. time (s)" });
    P.frame();
    if (hist.length > 1) P.curve(hist.map((q) => q[0]), hist.map((q) => q[1]), F.v);
    const state = f.push ? "Push acting: net force forward, so the puck speeds up." : v < 1e-3 ? "At rest, no net force: it stays at rest." : mu === 0 ? "<strong>No net force, so the velocity stays constant.</strong> It will slide forever." : "Only friction acts, so the puck slows down.";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Speed</th><td>${fmt(v)} m/s</td></tr>
        <tr><th style="color:${F.P}">Push</th><td>${fmt(f.push)} N</td></tr>
        <tr><th style="color:${F.f}">Friction</th><td>${fmt(v > 1e-3 ? f.fr : 0, 3)} N</td></tr>
        <tr><th>Net horizontal force</th><td>${fmt(f.push ? f.net : v > 1e-3 ? -f.fr : 0, 3)} N</td></tr>
      </table>
      <div class="verdict">${state}</div>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Inertial vs. accelerating frames: coffee cup in a braking car
// =====================================================================
export function framesCup(el) {
  const { canvas, controls, readout } = shell(el, { title: "Coffee cup in a braking car", icon: "☕", canvas: true, wide: true });
  const V0 = 15, A = 5, TB = 0.5, DASH = 1.2, T_END = TB + V0 / A + 0.5;
  let t = 0, view = "ground";
  const carX = (tt) => (tt < TB ? V0 * tt : tt < TB + V0 / A ? V0 * TB + V0 * (tt - TB) - 0.5 * A * (tt - TB) ** 2 : V0 * TB + (V0 * V0) / (2 * A));
  const carV = (tt) => (tt < TB ? V0 : Math.max(0, V0 - A * (tt - TB)));
  const hitT = TB + Math.sqrt((2 * DASH) / A); // cup reaches the windshield
  const rel = (tt) => (tt < TB ? 0 : tt < hitT ? 0.5 * A * (tt - TB) ** 2 : DASH);
  const cupV = (tt) => (tt < hitT ? V0 : carV(tt));
  const anim = playLoop((dt) => { t = Math.min(T_END, t + dt * 0.6); draw(); return t < T_END; });
  const seg = row();
  [["ground", "View from the ground"], ["car", "View from inside the car"]].forEach(([k, label]) => {
    const b = button(label, () => { view = k; seg.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b)); draw(); });
    if (k === view) b.classList.add("active");
    seg.appendChild(b);
  });
  controls.append(seg, row(button("▶ Play", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Reset", () => { anim.stop(); t = 0; draw(); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const xc = carX(t);
    // ground view shows the whole stretch of road; car view keeps the car fixed and zooms in
    const [lo, hi] = view === "ground" ? [-2, 34] : [xc - 1.5, xc + 6];
    const X = (x) => 10 + ((x - lo) / (hi - lo)) * (w - 20);
    const roadY = h * 0.72;
    ctx.fillStyle = c.border; ctx.fillRect(0, roadY, w, 6);
    for (let post = Math.floor(lo / 5) * 5; post <= hi; post += 5) {
      ctx.fillStyle = c.muted; ctx.fillRect(X(post) - 1.5, roadY - 26, 3, 26);
      ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = "center"; ctx.fillText(`${post} m`, X(post), roadY + 18);
    }
    const s = (w - 20) / (hi - lo);
    const carLen = 4.5, carH = Math.min(h * 0.32, carLen * s * 0.32);
    ctx.fillStyle = "#9b51e0"; ctx.globalAlpha = 0.85;
    ctx.fillRect(X(xc), roadY - carH, carLen * s, carH);
    ctx.globalAlpha = 1;
    // dashboard, windshield, cup
    const dashY = roadY - carH * 0.55;
    ctx.fillStyle = c.surface; ctx.fillRect(X(xc + 1.6), dashY, DASH * s, 4);
    ctx.strokeStyle = c.surface; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(xc + 1.6 + DASH), dashY); ctx.lineTo(X(xc + 1.6 + DASH) + carH * 0.25, roadY - carH); ctx.stroke();
    const cx = X(xc + 1.6 + rel(t));
    const cupW = Math.max(8, 0.18 * s), cupH = Math.max(10, 0.24 * s);
    ctx.fillStyle = "#f2c94c"; ctx.fillRect(cx - cupW / 2, dashY - cupH, cupW, cupH);
    const vFrame = view === "ground" ? cupV(t) : cupV(t) - carV(t);
    if (Math.abs(vFrame) > 0.05) drawArrow(ctx, cx, dashY - cupH - 10, Math.max(-60, Math.min(80, vFrame * (view === "ground" ? 4 : 12))), 0, F.v, "v of cup");
    const braking = t > TB && t < TB + V0 / A;
    const sliding = t > TB && t < hitT;
    const aFrame = view === "ground" ? (sliding ? 0 : braking ? -A : 0) : sliding ? A : 0;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>t</th><td>${fmt(t)} s</td></tr>
        <tr><th>Car speed (ground)</th><td>${fmt(carV(t))} m/s</td></tr>
        <tr><th>Cup velocity in this frame</th><td>${fmt(vFrame)} m/s</td></tr>
        <tr><th>Cup acceleration in this frame</th><td>${fmt(aFrame)} m/s²</td></tr>
        <tr><th>Horizontal force on the cup</th><td>${sliding ? "none (smooth dashboard)" : t >= hitT && braking ? "windshield pushes it back" : "none"}</td></tr>
      </table>
      <div class="verdict">${view === "ground"
        ? sliding ? "Ground frame: no force on the cup, so it keeps its 15 m/s. The car slows down underneath it. The first law works." : t < TB ? "Ground frame: car and cup cruise together." : "Ground frame: the windshield now pushes the cup, so the cup slows with the car."
        : sliding ? "Car frame: the cup speeds up forward with no force on it. The first law seems to fail, because the car is not an inertial frame." : t < TB ? "Car frame: the cup sits still on the dashboard." : "Car frame: the cup rests against the windshield."}</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Second law: sled pulled by an angled rope
// =====================================================================
export function sled(el) {
  const { canvas, controls, readout } = shell(el, { title: "Sled force model", icon: "🛷", canvas: true, wide: true });
  const st = { m: 25, T: 100, ang: 30, f: 40 };
  let t = 3;
  const sl = {
    m: slider({ label: "Mass m", min: 5, max: 60, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; t = 3; draw(); } }),
    T: slider({ label: "Rope tension T", min: 0, max: 200, step: 2, value: st.T, unit: "N", onInput: (v) => { st.T = v; t = 3; draw(); } }),
    ang: slider({ label: "Rope angle θ", min: 0, max: 80, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; t = 3; draw(); } }),
    f: slider({ label: "Friction (while sliding)", min: 0, max: 100, step: 1, value: st.f, unit: "N", onInput: (v) => { st.f = v; t = 3; draw(); } }),
  };
  const anim = playLoop((dt) => { t = Math.min(3, t + dt); draw(); return t < 3; });
  controls.append(sl.m, sl.T, sl.ang, sl.f, row(
    button("▶ Run 3 s", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"),
    button("Worked example", () => { sl.m.set(25); sl.T.set(100); sl.ang.set(30); sl.f.set(40); }),
  ));
  const calc = () => {
    const Tx = st.T * Math.cos(rad(st.ang)), Ty = st.T * Math.sin(rad(st.ang));
    const W = st.m * G, n = W - Ty;
    const moves = Tx > st.f && n >= 0;
    const fr = moves ? st.f : Math.min(Tx, st.f);
    const a = moves ? (Tx - st.f) / st.m : 0;
    return { Tx, Ty, W, n, moves, fr, a, lift: n < 0 };
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const r = calc();
    const groundY = h * 0.78;
    ctx.fillStyle = "rgba(200,220,255,.35)"; ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = c.muted; ctx.fillRect(0, groundY, w, 2);
    const dist3 = 0.5 * r.a * 9, x = 0.5 * r.a * t * t;
    const track = w * 0.45;
    const sx = w * 0.3 + (dist3 > 0 ? (x / dist3) * track : 0);
    const bw = 70, bh = 26;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(sx - bw / 2, groundY - bh, bw, bh);
    const cx = sx, cy = groundY - bh / 2;
    const k = 80 / Math.max(r.W, st.T, 1);
    const n = Math.max(0, r.n);
    drawArrow(ctx, cx, cy, 0, r.W * k, F.w, `w = ${fmt(r.W, 0)} N`);
    if (n > 0) drawArrow(ctx, cx - 18, cy, 0, -n * k, F.n, `n = ${fmt(n, 0)} N`);
    if (st.T > 0) drawArrow(ctx, cx + 10, cy, r.Tx * k, -r.Ty * k, F.T, `T = ${st.T} N`);
    if (r.fr > 0) drawArrow(ctx, cx - bw / 2, groundY - 4, -r.fr * k, 0, F.f, `f = ${fmt(r.fr, 0)} N`);
    if (st.T > 0) { ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx + 10, cy); ctx.lineTo(cx + 10 + 160 * Math.cos(rad(st.ang)), cy - 160 * Math.sin(rad(st.ang))); ctx.stroke(); ctx.setLineDash([]); }
    readout.innerHTML = r.lift
      ? `<div class="verdict bad">The rope's upward pull (${fmt(r.Ty, 0)} N) is more than the weight (${fmt(r.W, 0)} N), so the sled would lift off the snow. Lower the angle or the tension.</div>`
      : `
      <table class="mini-table">
        <tr><th>Rope components</th><td>Tₓ = ${fmt(r.Tx, 1)} N, Tᵧ = ${fmt(r.Ty, 1)} N</td></tr>
        <tr><th>ΣFᵧ = 0 → n = mg − Tᵧ</th><td><strong>${fmt(r.n, 0)} N</strong> ${Math.abs(r.Ty) > 0.5 ? `(not mg = ${fmt(r.W, 0)} N)` : "(= mg)"}</td></tr>
        <tr><th>ΣFₓ = Tₓ − f</th><td>${fmt(r.moves ? r.Tx - st.f : 0, 1)} N</td></tr>
        <tr><th>aₓ = ΣFₓ / m</th><td><strong>${fmt(r.a, 2)} m/s²</strong></td></tr>
        <tr><th>After 3.0 s from rest</th><td>v = ${fmt(3 * r.a, 1)} m/s, Δx = ${fmt(dist3, 1)} m</td></tr>
        <tr><th>Now (t = ${fmt(t, 1)} s)</th><td>v = ${fmt(r.a * t, 1)} m/s</td></tr>
      </table>
      ${r.moves ? "" : `<div class="verdict">Tₓ (${fmt(r.Tx, 0)} N) isn't bigger than friction (${st.f} N), so the sled doesn't start moving. Friction only pushes back as hard as needed.</div>`}`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Mass vs. weight on other worlds
// =====================================================================
const WORLDS = [["Earth", 9.8, "🌍"], ["Moon", 1.62, "🌕"], ["Mars", 3.71, "🔴"], ["Jupiter", 24.8, "🟠"]];
export function weightPlanets(el) {
  const { controls, readout } = shell(el, { title: "Weight on other worlds", icon: "⚖️" });
  let mode = "mass", value = 70;
  const input = document.createElement("input");
  input.type = "number"; input.className = "input input-num"; input.value = value; input.step = "any";
  const unit = Object.assign(document.createElement("span"), { className: "muted small", textContent: "kg" });
  input.addEventListener("input", () => { value = Number(input.value) || 0; render(); });
  controls.append(row(select([["mass", "I know the mass (kg)"], ["weight", "I know the weight on Earth (N)"]], mode, (m) => { mode = m; unit.textContent = m === "mass" ? "kg" : "N on Earth"; render(); }), input, unit));
  function render() {
    const m = mode === "mass" ? value : value / 9.8;
    const ws = WORLDS.map(([name, g, icon]) => ({ name, g, icon, w: m * g }));
    const max = Math.max(...ws.map((x) => x.w), 1);
    readout.innerHTML = `
      <div class="bars">
        <div class="bar-row"><span class="bar-label">Mass (everywhere)</span><span class="bar"><span style="width:${m > 0 ? 100 : 0}%;background:#9b51e0"></span></span><span class="bar-val">${fmt(m, 1)} kg</span></div>
        ${ws.map((x) => `<div class="bar-row"><span class="bar-label">${x.icon} Weight on ${x.name} <small class="muted">(g = ${x.g})</small></span><span class="bar"><span style="width:${(x.w / max) * 100}%"></span></span><span class="bar-val">${fmt(x.w, 0)} N</span></div>`).join("")}
      </div>
      <p class="small" style="margin-top:8px">${mode === "weight" ? `A weight of ${fmt(value, 0)} N on Earth means a mass of ${fmt(value, 0)} / 9.80 = <strong>${fmt(m, 2)} kg</strong>. Use the mass, never the weight, in ΣF = ma.` : `w = mg: the mass stays ${fmt(m, 1)} kg on every world. Only g changes, so only the weight changes.`}</p>`;
  }
  render();
}

// =====================================================================
// Third-law pair finder: book on a table
// =====================================================================
const BOOK_FORCES = {
  A: { name: "Earth pulls the book down", on: "book", by: "Earth", type: "gravity", dir: -1, color: F.w },
  B: { name: "The table pushes the book up", on: "book", by: "table", type: "normal", dir: 1, color: F.n },
  C: { name: "The book pulls Earth up", on: "Earth", by: "book", type: "gravity", dir: 1, color: F.w },
  D: { name: "The book pushes the table down", on: "table", by: "book", type: "normal", dir: -1, color: F.n },
};
export function pairFinder(el) {
  const { controls, readout } = shell(el, { title: "Action-reaction pair finder", icon: "🤝" });
  let picked = [];
  const stage = document.createElement("div");
  stage.className = "pair-stage";
  el.querySelector(".widget-body").prepend(stage);
  el.querySelector(".widget-body").classList.add("has-canvas");
  const cards = document.createElement("div");
  cards.className = "pair-cards";
  Object.entries(BOOK_FORCES).forEach(([k, f]) => {
    const b = button(`${k}. ${f.name}`, () => {
      picked = picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k].slice(-2);
      render();
    }, "btn btn-ghost btn-sm pair-card");
    b.dataset.k = k;
    cards.appendChild(b);
  });
  controls.append(cards);
  const arrow = (x, y1, y2, color, label, on) => `
    <g class="${on ? "on" : ""}"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${color}" stroke-width="${on ? 5 : 3}" marker-end="url(#ah-${color.slice(1)})"/>
    <text x="${x + 8}" y="${(y1 + y2) / 2 + 4}" fill="${color}" font-weight="700">${label}</text></g>`;
  function render() {
    cards.querySelectorAll("button").forEach((b) => b.classList.toggle("active", picked.includes(b.dataset.k)));
    const on = (k) => picked.includes(k);
    stage.innerHTML = `
      <svg viewBox="0 0 320 300" role="img" aria-label="Book on a table on Earth with four forces">
        <defs>${[F.w, F.n].map((c) => `<marker id="ah-${c.slice(1)}" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="${c}"/></marker>`).join("")}</defs>
        <path d="M0 300 Q160 230 320 300 Z" class="earth"/>
        <text x="160" y="290" text-anchor="middle" class="lbl">Earth</text>
        <rect x="70" y="150" width="180" height="12" class="table-top"/><rect x="85" y="162" width="10" height="90" class="table-leg"/><rect x="225" y="162" width="10" height="90" class="table-leg"/>
        <text x="240" y="145" class="lbl">table</text>
        <rect x="130" y="118" width="60" height="32" rx="3" class="book"/><text x="160" y="139" text-anchor="middle" class="lbl dark">book</text>
        ${arrow(148, 134, 200, BOOK_FORCES.A.color, "A", on("A"))}
        ${arrow(172, 150, 78, BOOK_FORCES.B.color, "B", on("B"))}
        ${arrow(160, 262, 222, BOOK_FORCES.C.color, "C", on("C"))}
        ${arrow(205, 150, 186, BOOK_FORCES.D.color, "D", on("D"))}
      </svg>`;
    if (picked.length < 2) { readout.innerHTML = `<p class="muted">Pick two forces to test them as a pair.</p>`; return; }
    const [a, b] = picked.map((k) => BOOK_FORCES[k]);
    const checks = [
      ["Two different objects", a.on !== b.on, `${picked[0]} acts on the ${a.on}, ${picked[1]} acts on the ${b.on}.`],
      ["Swapped labels (A on B ↔ B on A)", a.on === b.by && a.by === b.on, `${a.by} on ${a.on} vs. ${b.by} on ${b.on}.`],
      ["Same type of force", a.type === b.type, `${a.type} vs. ${b.type}.`],
      ["Equal size, opposite direction", a.dir === -b.dir, a.dir === -b.dir ? "Both have size mg here, pointing opposite ways." : "They point the same way."],
    ];
    const all = checks.every((c) => c[1]);
    readout.innerHTML = `
      <ul class="check-list">${checks.map(([n, ok, why]) => `<li class="${ok ? "good" : "bad"}">${ok ? "✓" : "✗"} <strong>${n}</strong><br/><span class="small muted">${why}</span></li>`).join("")}</ul>
      <div class="verdict ${all ? "good" : "bad"}">${all ? "A true third-law pair." : picked.sort().join("") === "AB" ? "Not a pair. A and B balance because of the first law (the book isn't accelerating), not the third law." : "Not a third-law pair."}</div>`;
  }
  render();
}

// =====================================================================
// Collision: equal third-law forces, unequal accelerations
// =====================================================================
export function collisionPair(el) {
  const { canvas, controls, readout } = shell(el, { title: "Car vs. truck collision", icon: "💥", canvas: true, wide: true });
  let m1 = 1000, m2 = 4000, Fc = 20000;
  controls.append(
    slider({ label: "Car mass", min: 500, max: 3000, step: 100, value: m1, unit: "kg", onInput: (v) => { m1 = v; draw(); } }),
    slider({ label: "Truck mass", min: 1000, max: 8000, step: 100, value: m2, unit: "kg", onInput: (v) => { m2 = v; draw(); } }),
    slider({ label: "Contact force", min: 5000, max: 40000, step: 1000, value: Fc, unit: "N", onInput: (v) => { Fc = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const a1 = Fc / m1, a2 = Fc / m2;
    const groundY = h * 0.82, mid = w / 2;
    const sz = (m) => 30 + Math.cbrt(m) * 4.5;
    const s1 = sz(m1), s2 = sz(m2);
    ctx.fillStyle = c.border; ctx.fillRect(0, groundY, w, 4);
    ctx.fillStyle = "#2f80ed"; ctx.fillRect(mid - s1 * 1.6, groundY - s1, s1 * 1.6, s1);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(mid, groundY - s2, s2 * 1.8, s2);
    ctx.fillStyle = "#fff"; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`car ${m1} kg`, mid - s1 * 0.8, groundY - s1 / 2 + 4);
    ctx.fillText(`truck ${m2} kg`, mid + s2 * 0.9, groundY - s2 / 2 + 4);
    const fl = 40 + (Fc / 40000) * 90;
    const fy = groundY - Math.min(s1, s2) / 2;
    drawArrow(ctx, mid - 4, fy, -fl, 0, "#f2994a", "F truck on car");
    drawArrow(ctx, mid + 4, fy, fl, 0, "#f2994a", "F car on truck");
    const amax = Math.max(a1, a2);
    drawArrow(ctx, mid - s1 * 0.8, groundY - s1 - 18, -(a1 / amax) * 120, 0, "#9b51e0", `a = ${fmt(a1, 1)} m/s²`);
    drawArrow(ctx, mid + s2 * 0.9, groundY - s2 - 18, (a2 / amax) * 120, 0, "#9b51e0", `a = ${fmt(a2, 1)} m/s²`);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Force on each (third law)</th><td><strong>${Fc.toLocaleString()} N</strong> each, opposite directions</td></tr>
        <tr><th>Car: a = F/m</th><td>${Fc.toLocaleString()} / ${m1} = <strong>${fmt(a1, 1)} m/s²</strong></td></tr>
        <tr><th>Truck: a = F/m</th><td>${Fc.toLocaleString()} / ${m2} = <strong>${fmt(a2, 1)} m/s²</strong></td></tr>
        <tr><th>Ratio</th><td>the ${a1 >= a2 ? "car" : "truck"}'s acceleration is ${fmt(Math.max(a1, a2) / Math.min(a1, a2), 1)}× larger</td></tr>
      </table>
      <p class="small" style="margin-top:8px">The forces are always equal. The lighter vehicle gets the bigger acceleration, so it fares worse.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Free-body diagram builder with feedback
// =====================================================================
const FBD_OPTIONS = {
  weight: { label: "Weight w", color: F.w, dir: 270 },
  normal: { label: "Normal force n", color: F.n, dir: 90 },
  friction: { label: "Friction f", color: F.f, dir: 180 },
  tension: { label: "Tension T", color: F.T, dir: 90 },
  push: { label: "Applied push P", color: F.P, dir: 0 },
  motion: { label: '"Force of motion"', color: "#888", dir: 0 },
  ma: { label: "ma", color: "#888", dir: 0 },
  velocity: { label: "Velocity v", color: "#888", dir: 0 },
  throw: { label: "Force of the throw", color: "#888", dir: 45 },
};
const ALWAYS_WRONG = {
  motion: "There's no such thing as a force of motion. Moving at constant velocity needs no force (first law).",
  ma: "ma is the result of the forces, not another force.",
  velocity: "Velocity describes motion, not force. It never goes on a free-body diagram.",
  throw: "The hand let go. Once the ball leaves the hand, the hand exerts no force on it.",
};
const SCENES = {
  book: { label: "A book resting on a table", surface: "table", correct: { weight: [270, "Earth"], normal: [90, "the table"] }, wrong: { friction: "Nothing is trying to slide the book, so there's no friction.", tension: "No rope or string is attached.", push: "Nothing is pushing the book." }, note: "Here n = w, because nothing else acts vertically and the book isn't accelerating." },
  bag: { label: "A bag hanging at rest from a strap", surface: "strap", correct: { weight: [270, "Earth"], tension: [90, "the strap"] }, wrong: { normal: "No surface touches the bag, so there's no normal force.", friction: "Nothing slides against a surface.", push: "Nothing pushes the bag." }, note: "At rest, so T = w." },
  sled: { label: "A sled pulled across snow by a rope angled 30° up", surface: "ground", rope: 30, correct: { weight: [270, "Earth"], normal: [90, "the snow"], tension: [30, "the rope"], friction: [180, "the snow"] }, wrong: { push: "The rope pulls (that's tension); nothing pushes." }, note: "n = mg − T sin 30°, which is less than mg." },
  ball: { label: "A ball in flight after it's thrown (no air resistance)", surface: "none", extra: ["throw"], correct: { weight: [270, "Earth"] }, wrong: { normal: "Nothing touches the ball.", friction: "Nothing touches the ball, and we're ignoring air.", tension: "There's no string.", push: "Nothing touches the ball now." }, note: "Only gravity. That's why every projectile has a = −g." },
  shove: { label: "A box you're shoving to the right across a floor", surface: "ground", correct: { weight: [270, "Earth"], normal: [90, "the floor"], push: [0, "your hands"], friction: [180, "the floor"] }, wrong: { tension: "There's no rope." } },
  coast: { label: "A box still sliding right after you let go", surface: "ground", correct: { weight: [270, "Earth"], normal: [90, "the floor"], friction: [180, "the floor"] }, wrong: { push: "You let go, so your push is gone. The box keeps moving because of inertia, and friction slows it.", tension: "There's no rope." } },
};
export function fbdBuilder(el) {
  const { canvas, controls, readout } = shell(el, { title: "Free-body diagram builder", icon: "🧭", canvas: true });
  let key = "book", chosen = new Set(), checked = false;
  const list = document.createElement("div");
  list.className = "fbd-options";
  const buildList = () => {
    const opts = ["weight", "normal", "friction", "tension", "push", "motion", "ma", "velocity", ...(SCENES[key].extra || [])];
    list.innerHTML = "";
    opts.forEach((o) => list.appendChild(checkbox(FBD_OPTIONS[o].label, chosen.has(o), (v) => { v ? chosen.add(o) : chosen.delete(o); checked = false; draw(); })));
  };
  controls.append(
    row(select(Object.entries(SCENES).map(([k, s]) => [k, s.label]), key, (v) => { key = v; chosen = new Set(); checked = false; buildList(); draw(); })),
    list,
    row(button("Check my diagram", () => { checked = true; draw(); }, "btn btn-primary btn-sm"), button("Clear", () => { chosen = new Set(); checked = false; buildList(); draw(); })),
  );
  buildList();
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const sc = SCENES[key];
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, bs = 46;
    // the surroundings, drawn faintly
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = c.muted; ctx.strokeStyle = c.muted; ctx.lineWidth = 3;
    if (sc.surface === "table" || sc.surface === "ground") ctx.fillRect(0, cy + bs / 2, w, 8);
    if (sc.surface === "strap") { ctx.beginPath(); ctx.moveTo(cx, cy - bs / 2); ctx.lineTo(cx, 8); ctx.stroke(); ctx.fillRect(cx - 30, 4, 60, 6); }
    if (sc.rope) { ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(cx + bs / 2, cy); ctx.lineTo(cx + bs / 2 + 200 * Math.cos(rad(sc.rope)), cy - 200 * Math.sin(rad(sc.rope))); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = c.border; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    if (sc.surface === "none") { ctx.beginPath(); ctx.arc(cx, cy, bs / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(cx - bs / 2, cy - bs / 2, bs, bs); ctx.strokeRect(cx - bs / 2, cy - bs / 2, bs, bs); }
    const L = Math.min(w, h) * 0.3;
    chosen.forEach((o) => {
      const good = o in sc.correct;
      const dirDeg = good ? sc.correct[o][0] : FBD_OPTIONS[o].dir;
      const color = !checked ? FBD_OPTIONS[o].color : good ? "#16a34a" : "#d63c3c";
      ctx.save();
      if (o === "velocity" || o === "ma" || o === "motion" || o === "throw") ctx.setLineDash([6, 4]);
      const off = o === "ma" ? 14 : o === "velocity" ? -14 : 0;
      drawArrow(ctx, cx, cy + off, L * Math.cos(rad(dirDeg)), -L * Math.sin(rad(dirDeg)), color, FBD_OPTIONS[o].label.replace(/"/g, ""));
      ctx.restore();
    });
    if (!checked) { readout.innerHTML = `<p class="muted">Choose the forces that act <em>on</em> the object, then press Check.</p>`; return; }
    const items = [];
    chosen.forEach((o) => {
      if (o in sc.correct) items.push(`<li class="good">✓ <strong>${FBD_OPTIONS[o].label}</strong>, exerted by ${sc.correct[o][1]}</li>`);
      else items.push(`<li class="bad">✗ <strong>${FBD_OPTIONS[o].label}</strong>: ${ALWAYS_WRONG[o] || sc.wrong[o] || "Nothing in this scene exerts that force."}</li>`);
    });
    Object.keys(sc.correct).forEach((o) => { if (!chosen.has(o)) items.push(`<li class="bad">✗ Missing <strong>${FBD_OPTIONS[o].label}</strong>, from ${sc.correct[o][1]}</li>`); });
    const perfect = Object.keys(sc.correct).every((o) => chosen.has(o)) && [...chosen].every((o) => o in sc.correct);
    readout.innerHTML = `
      <ul class="check-list">${items.join("")}</ul>
      <div class="verdict ${perfect ? "good" : "bad"}">${perfect ? "Correct free-body diagram." : "Not quite. Fix the red items and check again."}</div>
      ${perfect && sc.note ? `<p class="small" style="margin-top:8px">${sc.note}</p>` : ""}`;
  }
  draw();
  return destroy;
}
