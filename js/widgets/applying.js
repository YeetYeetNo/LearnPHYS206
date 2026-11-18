// Unit 5 widgets: applying Newton's laws.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad, deg } from "./plane.js";
import { shell, button, row, select } from "./shell.js";
import { panel } from "./graphs.js";
import { mount as inclineMount } from "../sims/incline.js";

const G = 9.8;
const F = { w: "#27ae60", n: "#2f80ed", f: "#eb5757", T: "#9b51e0", P: "#f2994a", v: "#2f80ed", a: "#f2994a" };

function playLoop(onFrame) {
  let raf = 0, last = 0;
  const tick = (now) => {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (onFrame(dt) === false) return;
    raf = requestAnimationFrame(tick);
  };
  return {
    start() { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { cancelAnimationFrame(raf); },
  };
}

// A two-choice quiz where each item explains itself once answered.
export function quiz(el, { title, icon, items, choices }) {
  const { controls, readout } = shell(el, { title, icon });
  const answered = new Map();
  const list = document.createElement("ol");
  list.className = "quiz-list";
  items.forEach((it, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<p>${it.text}</p><div class="widget-row"></div><p class="quiz-why small"></p>`;
    choices.forEach(([val, label]) => {
      li.querySelector(".widget-row").appendChild(button(label, () => {
        answered.set(i, val === it.answer);
        li.querySelectorAll("button").forEach((b) => (b.disabled = true));
        const why = li.querySelector(".quiz-why");
        why.className = `quiz-why small ${val === it.answer ? "good" : "bad"}`;
        why.innerHTML = `${val === it.answer ? "✓ Right." : `✗ It's <strong>${choices.find((c) => c[0] === it.answer)[1]}</strong>.`} ${it.why}`;
        score();
      }));
    });
    list.appendChild(li);
  });
  const score = () => {
    const right = [...answered.values()].filter(Boolean).length;
    readout.innerHTML = `<div class="verdict">${right} of ${answered.size} right${answered.size === items.length ? ` · done (${items.length} total)` : ""}</div>`;
  };
  controls.append(list, row(button("Start over", () => quiz(el, { title, icon, items, choices }))));
  readout.innerHTML = `<p class="muted small">${items.length} situations.</p>`;
}

// =====================================================================
// Equilibrium or dynamics? sorter
// =====================================================================
export function problemClassifier(el) {
  quiz(el, {
    title: "Equilibrium or dynamics?",
    icon: "🔀",
    choices: [["eq", "Equilibrium (ΣF = 0)"], ["dyn", "Dynamics (ΣF = ma)"]],
    items: [
      { text: "A lamp hangs at rest from two cords.", answer: "eq", why: '"At rest" means a = 0.' },
      { text: "A car drives at a constant 25 m/s on a straight, level highway.", answer: "eq", why: "Constant velocity is still equilibrium. Motion doesn't need a net force." },
      { text: "A sled starts from rest and is pulled across the snow.", answer: "dyn", why: '"Starts from rest" means it speeds up.' },
      { text: "An elevator slows down as it reaches the top floor.", answer: "dyn", why: "Slowing down is acceleration (downward here)." },
      { text: "A crate slides down a ramp at constant speed.", answer: "eq", why: "Constant speed in a straight line: friction exactly balances the down-slope part of the weight." },
      { text: "A car rounds a curve at a constant 15 m/s.", answer: "dyn", why: "Its direction changes, so it accelerates toward the center (Unit 3), even at constant speed." },
      { text: "A hockey puck glides across frictionless ice.", answer: "eq", why: "No net force, so constant velocity (first law)." },
      { text: "A ball at the very top of its throw, where v = 0.", answer: "dyn", why: "Its velocity is momentarily zero, but a = −g. It isn't in equilibrium." },
    ],
  });
}

// =====================================================================
// A sign hanging from two angled cables
// =====================================================================
export function twoCables(el) {
  const { canvas, controls, readout } = shell(el, { title: "Two-cable sign model", icon: "🪧", canvas: true });
  const st = { m: 20, a1: 30, a2: 60 };
  const sl = {
    m: slider({ label: "Mass", min: 1, max: 50, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    a1: slider({ label: "Cable 1 angle (left)", min: 3, max: 87, step: 1, value: st.a1, unit: "°", onInput: (v) => { st.a1 = v; draw(); } }),
    a2: slider({ label: "Cable 2 angle (right)", min: 3, max: 87, step: 1, value: st.a2, unit: "°", onInput: (v) => { st.a2 = v; draw(); } }),
  };
  const load = (m, a1, a2) => () => { sl.m.set(m); sl.a1.set(a1); sl.a2.set(a2); };
  controls.append(sl.m, sl.a1, sl.a2, row(button("Worked example", load(20, 30, 60)), button("Symmetric 45°", load(20, 45, 45)), button("Clothesline", load(1, 4, 4))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const W = st.m * G;
    const s = Math.sin(rad(st.a1 + st.a2));
    const T1 = (W * Math.cos(rad(st.a2))) / s, T2 = (W * Math.cos(rad(st.a1))) / s;
    const kx = w / 2, ky = h * 0.5, ceil = 16;
    ctx.fillStyle = c.muted; ctx.fillRect(0, ceil - 8, w, 8);
    // cables up to the ceiling (clipped to the canvas)
    const up = ky - ceil;
    [[-1, st.a1], [1, st.a2]].forEach(([dir, a]) => {
      const dx = up / Math.tan(rad(a));
      ctx.strokeStyle = c.text; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + dir * dx, ceil); ctx.stroke();
    });
    ctx.fillStyle = "#f2c94c"; ctx.strokeStyle = "#8a6d1c";
    ctx.fillRect(kx - 40, ky + 6, 80, 36); ctx.strokeRect(kx - 40, ky + 6, 80, 36);
    ctx.fillStyle = "#5a4500"; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(`${st.m} kg`, kx, ky + 29);
    ctx.strokeStyle = c.text; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 6); ctx.stroke();
    const k = (Math.min(w, h) * 0.32) / Math.max(T1, T2, W);
    drawArrow(ctx, kx, ky, -T1 * Math.cos(rad(st.a1)) * k, -T1 * Math.sin(rad(st.a1)) * k, F.T, "T₁");
    drawArrow(ctx, kx, ky, T2 * Math.cos(rad(st.a2)) * k, -T2 * Math.sin(rad(st.a2)) * k, F.n, "T₂");
    drawArrow(ctx, kx + 50, ky + 24, 0, W * k, F.w, "w");
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Weight w = mg</th><td>${fmt(W, 1)} N</td></tr>
        <tr><th style="color:${F.T}">T₁</th><td><strong>${fmt(T1, 1)} N</strong></td></tr>
        <tr><th style="color:${F.n}">T₂</th><td><strong>${fmt(T2, 1)} N</strong></td></tr>
        <tr><th>ΣFₓ = T₂cos θ₂ − T₁cos θ₁</th><td>${fmt(T2 * Math.cos(rad(st.a2)) - T1 * Math.cos(rad(st.a1)), 1)} N</td></tr>
        <tr><th>ΣFᵧ = T₁sin θ₁ + T₂sin θ₂ − w</th><td>${fmt(T1 * Math.sin(rad(st.a1)) + T2 * Math.sin(rad(st.a2)) - W, 1)} N</td></tr>
      </table>
      <p class="small" style="margin-top:8px">${Math.abs(T1 - T2) < 0.5 ? "Equal angles share the load equally." : `The steeper cable (${T1 > T2 ? "cable 1" : "cable 2"}) carries more.`} ${Math.max(T1, T2) > W ? `<strong>At least one cable pulls harder than the whole weight</strong>, because its angle is shallow.` : ""}</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Ramp with tilted axes: w∥ = mg sin θ, w⊥ = mg cos θ
// =====================================================================
export function tiltedAxes(el) {
  const { canvas, controls, readout } = shell(el, { title: "Tilted-axes ramp model", icon: "📐", canvas: true });
  const st = { ang: 25, m: 5 };
  const sl = {
    ang: slider({ label: "Ramp angle θ", min: 0, max: 60, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; draw(); } }),
    m: slider({ label: "Mass", min: 1, max: 20, step: 0.5, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
  };
  controls.append(sl.ang, sl.m, row(button("Worked example (5.0 kg, 25°)", () => { sl.m.set(5); sl.ang.set(25); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const th = rad(st.ang), cos = Math.cos(th), sin = Math.sin(th);
    // ramp rises to the left, block slides down to the right
    const bx = w - 20, by = h - 24, L = Math.min(w - 40, (h - 60) / Math.max(sin, 0.01));
    const tx = bx - L * cos, ty = by - L * sin;
    ctx.fillStyle = c.border; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.lineTo(tx, by); ctx.closePath(); ctx.fill();
    const u = [cos, sin], nrm = [sin, -cos]; // down-slope and outward normal (screen coords)
    const along = L * 0.45, bs = 38;
    const cx = tx + u[0] * along + nrm[0] * bs / 2, cy = ty + u[1] * along + nrm[1] * bs / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
    ctx.fillStyle = "#f2c94c"; ctx.strokeStyle = "#8a6d1c"; ctx.lineWidth = 2;
    ctx.fillRect(-bs / 2, -bs / 2, bs, bs); ctx.strokeRect(-bs / 2, -bs / 2, bs, bs);
    // tilted axes
    ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(110, 0); ctx.moveTo(0, -110); ctx.lineTo(0, 90); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.fillText("+x (down slope)", 50, 14); ctx.fillText("+y", 6, -100);
    ctx.restore();
    const W = st.m * G, k = 95 / W;
    drawArrow(ctx, cx, cy, 0, W * k, F.w, "w");
    ctx.save(); ctx.setLineDash([5, 4]);
    drawArrow(ctx, cx, cy, u[0] * W * sin * k, u[1] * W * sin * k, "#f2994a", "mg sin θ");
    drawArrow(ctx, cx, cy, -nrm[0] * W * cos * k, -nrm[1] * W * cos * k, "#9b51e0", "mg cos θ");
    ctx.restore();
    drawArrow(ctx, cx, cy, nrm[0] * W * cos * k, nrm[1] * W * cos * k, F.n, "n");
    ctx.fillStyle = c.text; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "right"; ctx.fillText(`${st.ang}°`, bx - 44, by - 6);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Weight mg</th><td>${fmt(W, 1)} N</td></tr>
        <tr><th style="color:#f2994a">Down the slope: mg sin θ</th><td>${fmt(W * sin, 1)} N</td></tr>
        <tr><th style="color:#9b51e0">Into the slope: mg cos θ</th><td>${fmt(W * cos, 1)} N</td></tr>
        <tr><th style="color:${F.n}">Normal force n = mg cos θ</th><td><strong>${fmt(W * cos, 1)} N</strong></td></tr>
        <tr><th>a = g sin θ (frictionless)</th><td><strong>${fmt(G * sin, 2)} m/s²</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${st.ang === 0 ? "θ = 0: the down-slope part is zero, which is why sine goes with down the slope." : "With tilted axes, only the weight needs splitting. n lies along y and a lies along x."}</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Elevator and apparent weight: n = m(g + a)
// =====================================================================
const TRIPS = {
  rest: { label: "At rest", v: 0, a: 0 },
  up: { label: "Accelerating up (+2.0)", v: 0, a: 2 },
  cruiseUp: { label: "Constant speed up", v: 3, a: 0 },
  slowUp: { label: "Moving up, slowing (−2.0)", v: 4, a: -2 },
  down: { label: "Accelerating down (−2.0)", v: 0, a: -2 },
  slowDown: { label: "Moving down, slowing (+2.0)", v: -4, a: 2 },
  snap: { label: "Cable snaps (free fall)", v: 0, a: -G },
};
export function elevator(el) {
  const { canvas, controls, readout } = shell(el, { title: "Elevator scale model", icon: "🛗", canvas: true, tall: true });
  let m = 60, trip = "up", t = 0;
  let sm;
  const tripSel = select(Object.entries(TRIPS).map(([k, v]) => [k, v.label]), trip, (v) => { trip = v; t = 0; draw(); });
  controls.append(
    row(tripSel),
    (sm = slider({ label: "Rider's mass", min: 20, max: 120, step: 1, value: m, unit: "kg", onInput: (v) => { m = v; draw(); } })),
  );
  const anim = playLoop((dt) => { t += dt; if (t > 2) t = 0; draw(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const tr = TRIPS[trip];
    const v = tr.v + tr.a * t;
    const y = tr.v * t + 0.5 * tr.a * t * t; // meters, up positive
    const n = Math.max(0, m * (G + tr.a));
    // shaft and car (the car moves within the shaft view, wrapping vertically)
    const shaftX = w * 0.12, shaftW = w * 0.36;
    ctx.fillStyle = c.border; ctx.fillRect(shaftX, 0, shaftW, h);
    const carH = h * 0.32, span = h - carH - 20;
    const cyTop = 10 + ((((span / 2 - y * 14) % span) + span) % span);
    ctx.fillStyle = c.surface; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    ctx.fillRect(shaftX + 8, cyTop, shaftW - 16, carH); ctx.strokeRect(shaftX + 8, cyTop, shaftW - 16, carH);
    if (trip !== "snap") { ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(shaftX + shaftW / 2, 0); ctx.lineTo(shaftX + shaftW / 2, cyTop); ctx.stroke(); }
    // person on a scale
    const px = shaftX + shaftW / 2, floorY = cyTop + carH - 8;
    ctx.fillStyle = "#555"; ctx.fillRect(px - 16, floorY - 6, 32, 6);
    ctx.fillStyle = "#9b51e0";
    ctx.beginPath(); ctx.arc(px, floorY - 50, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(px - 6, floorY - 42, 12, 36);
    drawArrow(ctx, shaftX + shaftW + 18, cyTop + carH / 2, 0, -v * 9, F.v, "v");
    drawArrow(ctx, shaftX + shaftW + 44, cyTop + carH / 2, 0, -Math.sign(tr.a) * Math.min(70, Math.abs(tr.a) * 12), F.a, "a");
    // scale dial
    const dx = w * 0.76, dy = h * 0.42, R = Math.min(w * 0.2, h * 0.22);
    const max = m * (G + 5);
    const ang = (val) => Math.PI + (Math.min(val, max) / max) * Math.PI;
    ctx.lineWidth = 10; ctx.strokeStyle = c.border; ctx.beginPath(); ctx.arc(dx, dy, R, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = F.w; const wa = ang(m * G);
    ctx.beginPath(); ctx.moveTo(dx + Math.cos(wa) * (R - 12), dy + Math.sin(wa) * (R - 12)); ctx.lineTo(dx + Math.cos(wa) * (R + 12), dy + Math.sin(wa) * (R + 12)); ctx.stroke();
    ctx.fillStyle = F.w; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("true weight", dx + Math.cos(wa) * (R + 24), dy + Math.sin(wa) * (R + 24));
    const na = ang(n);
    ctx.strokeStyle = "#d63c3c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(na) * (R - 6), dy + Math.sin(na) * (R - 6)); ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = "700 18px JetBrains Mono, monospace"; ctx.fillText(`${fmt(n, 0)} N`, dx, dy + 28);
    ctx.font = "11px Inter, sans-serif"; ctx.fillStyle = c.muted; ctx.fillText("scale reading", dx, dy + 44);
    const feel = tr.a === -G ? "weightless" : tr.a > 0 ? "heavier" : tr.a < 0 ? "lighter" : "normal";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>True weight mg</th><td>${fmt(m * G, 0)} N</td></tr>
        <tr><th>Acceleration a (+ up)</th><td>${fmt(tr.a, 1)} m/s²</td></tr>
        <tr><th>Velocity now (+ up)</th><td>${fmt(v, 1)} m/s</td></tr>
        <tr><th>Scale n = m(g + a)</th><td><strong>${fmt(n, 0)} N</strong></td></tr>
      </table>
      <div class="verdict">${feel === "weightless" ? "The scale reads zero: the rider feels weightless." : feel === "normal" ? "a = 0, so the scale reads the true weight, whichever way the elevator moves." : `The rider feels <strong>${feel}</strong>, because a points ${tr.a > 0 ? "up" : "down"}${tr.v * tr.a < 0 ? ", even though the elevator is moving " + (tr.v > 0 ? "up" : "down") : ""}.`}</div>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Connected objects: table + hanging block, or Atwood machine
// =====================================================================
export function pulleySystem(el) {
  const { canvas, controls, readout } = shell(el, { title: "Pulley system model", icon: "🪢", canvas: true, wide: true });
  const st = { mode: "table", m1: 4, m2: 2, mu: 0 };
  let t = 0;
  const sl = {};
  const solve = () => {
    const { m1, m2, mu } = st;
    if (st.mode === "atwood") {
      const a = ((m2 - m1) * G) / (m1 + m2);
      return { a, T: (2 * m1 * m2 * G) / (m1 + m2), moves: m1 !== m2 };
    }
    const drive = m2 * G - mu * m1 * G;
    if (drive <= 0) return { a: 0, T: m2 * G, moves: false };
    const a = drive / (m1 + m2);
    return { a, T: m1 * a + mu * m1 * G, moves: true };
  };
  const anim = playLoop((dt) => { t += dt; if (t > 1.6) t = 0; draw(); });
  const build = () => {
    controls.innerHTML = "";
    const seg = row();
    [["table", "Block on a table"], ["atwood", "Atwood machine"]].forEach(([k, label]) => {
      const b = button(label, () => { st.mode = k; build(); });
      if (k === st.mode) b.classList.add("active");
      seg.appendChild(b);
    });
    sl.m1 = slider({ label: st.mode === "table" ? "m₁ (on the table)" : "m₁ (left)", min: 0.5, max: 10, step: 0.5, value: st.m1, unit: "kg", onInput: (v) => { st.m1 = v; t = 0; draw(); } });
    sl.m2 = slider({ label: st.mode === "table" ? "m₂ (hanging)" : "m₂ (right)", min: 0.5, max: 10, step: 0.5, value: st.m2, unit: "kg", onInput: (v) => { st.m2 = v; t = 0; draw(); } });
    controls.append(seg, sl.m1, sl.m2);
    if (st.mode === "table") {
      sl.mu = slider({ label: "Table friction μₖ", min: 0, max: 0.8, step: 0.05, value: st.mu, onInput: (v) => { st.mu = v; t = 0; draw(); } });
      controls.append(sl.mu, row(button("Worked example (4.0 kg, 2.0 kg)", () => { sl.m1.set(4); sl.m2.set(2); sl.mu.set(0); })));
    }
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const r = solve();
    const d = Math.min(0.5 * Math.abs(r.a) * t * t, 1.2) * 40; // pixels moved
    const k = 60 / Math.max(st.m1 * G, st.m2 * G);
    const box = (x, y, m, color) => {
      const s = 22 + m * 3;
      ctx.fillStyle = color; ctx.fillRect(x - s / 2, y - s / 2, s, s);
      ctx.fillStyle = "#fff"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(`${m} kg`, x, y + 4);
      return s;
    };
    ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    if (st.mode === "table") {
      const tableY = h * 0.42, edge = w * 0.62, px = edge + 14, py = tableY - 10;
      ctx.fillStyle = "#8d6e63"; ctx.fillRect(w * 0.05, tableY, edge - w * 0.05, 10); ctx.fillRect(w * 0.08, tableY, 8, h - tableY); ctx.fillRect(edge - 14, tableY, 8, h - tableY);
      ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
      const s1 = 22 + st.m1 * 3;
      const b1x = w * 0.3 + d, b1y = tableY - s1 / 2;
      const b2x = px + 10, b2y = py + 60 + d;
      ctx.beginPath(); ctx.moveTo(b1x + s1 / 2, py); ctx.lineTo(px, py - 10); ctx.moveTo(px + 10, py); ctx.lineTo(b2x, b2y); ctx.stroke();
      box(b1x, b1y, st.m1, "#2f80ed");
      const s2 = box(b2x, b2y, st.m2, "#c0392b");
      drawArrow(ctx, b1x + s1 / 2, b1y, r.T * k, 0, F.T, "T");
      if (st.mu > 0) drawArrow(ctx, b1x - s1 / 2, tableY - 4, -Math.min(st.mu * st.m1 * G, r.moves ? 1e9 : st.m2 * G) * k, 0, F.f, "f");
      drawArrow(ctx, b2x, b2y - s2 / 2, 0, -r.T * k, F.T, "T");
      drawArrow(ctx, b2x, b2y + s2 / 2, 0, st.m2 * G * k, F.w, "m₂g");
      if (r.moves) drawArrow(ctx, b1x, b1y - s1 / 2 - 22, 30, 0, F.a, "a");
    } else {
      const px = w / 2, py = 30, R = 30;
      ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 2, 0, 4, py);
      const dir = Math.sign(st.m2 - st.m1);
      const y1 = h * 0.55 - dir * d, y2 = h * 0.55 + dir * d;
      ctx.strokeStyle = c.text; ctx.beginPath(); ctx.moveTo(px - R, py); ctx.lineTo(px - R, y1); ctx.moveTo(px + R, py); ctx.lineTo(px + R, y2); ctx.stroke();
      const s1 = box(px - R, y1, st.m1, "#2f80ed"), s2 = box(px + R, y2, st.m2, "#c0392b");
      [[px - R, y1, s1, st.m1, -1], [px + R, y2, s2, st.m2, 1]].forEach(([x, y, s, m, side]) => {
        drawArrow(ctx, x + side * (s / 2 + 18), y, 0, -r.T * k, F.T, "T");
        drawArrow(ctx, x + side * (s / 2 + 18), y, 0, m * G * k, F.w, "mg");
      });
    }
    const rows = st.mode === "table"
      ? [
          ["m₁ (table): ΣF = T − f = m₁a", `T = ${fmt(st.m1)}a${st.mu ? ` + ${fmt(st.mu * st.m1 * G, 1)}` : ""}`],
          ["m₂ (hanging, + down): m₂g − T = m₂a", `${fmt(st.m2 * G, 1)} − T = ${fmt(st.m2)}a`],
        ]
      : [
          ["m₁ (+ up): T − m₁g = m₁a", `T − ${fmt(st.m1 * G, 1)} = ${fmt(st.m1)}a`],
          ["m₂ (+ down): m₂g − T = m₂a", `${fmt(st.m2 * G, 1)} − T = ${fmt(st.m2)}a`],
        ];
    readout.innerHTML = `
      <table class="mini-table">
        ${rows.map(([k2, v]) => `<tr><th>${k2}</th><td>${v}</td></tr>`).join("")}
        <tr><th>Acceleration a</th><td><strong>${fmt(Math.abs(r.a), 2)} m/s²</strong>${st.mode === "atwood" && r.moves ? ` (${st.m2 > st.m1 ? "m₂" : "m₁"} goes down)` : ""}</td></tr>
        <tr><th>Tension T</th><td><strong>${fmt(r.T, 1)} N</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${!r.moves ? (st.mode === "table" ? "Friction can hold it: the hanging weight isn't enough to start the motion." : "Equal masses balance: no acceleration.") : st.mode === "table" ? `Check: T = ${fmt(r.T, 1)} N is less than m₂g = ${fmt(st.m2 * G, 1)} N, as it must be. System shortcut: a = ${st.mu ? "(m₂g − μₖm₁g)" : "m₂g"}/(m₁ + m₂) = ${fmt(r.a, 2)} m/s².` : `a = (m₂ − m₁)g/(m₁ + m₂) = ${fmt(Math.abs(r.a), 2)} m/s². T sits between the two weights.`}</p>`;
  }
  build();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Static vs. kinetic friction: push a box and trace f against the push
// =====================================================================
export function frictionPush(el) {
  const { canvas, controls, readout } = shell(el, { title: "Static vs. kinetic friction", icon: "📦", canvas: true, wide: true });
  const st = { m: 10, mus: 0.4, muk: 0.3, P: 20 };
  let v = 0, x = 0, sliding = false;
  const sl = {};
  sl.m = slider({ label: "Mass", min: 2, max: 40, step: 1, value: st.m, unit: "kg", onInput: (val) => { st.m = val; reset(); } });
  sl.mus = slider({ label: "Static μₛ", min: 0.05, max: 1, step: 0.05, value: st.mus, onInput: (val) => { st.mus = val; if (st.muk > val) sl.muk.set(val); reset(); } });
  sl.muk = slider({ label: "Kinetic μₖ", min: 0.05, max: 1, step: 0.05, value: st.muk, onInput: (val) => { st.muk = Math.min(val, st.mus); reset(); } });
  sl.P = slider({ label: "Your push P", min: 0, max: 150, step: 0.5, value: st.P, unit: "N", onInput: (val) => { st.P = val; draw(); } });
  const reset = () => { v = 0; sliding = false; draw(); };
  controls.append(sl.P, sl.m, sl.mus, sl.muk, row(
    button("Worked example: push 20 N", () => { sl.m.set(10); sl.mus.set(0.4); sl.muk.set(0.3); sl.P.set(20); reset(); }),
    button("Push 39.2 N", () => sl.P.set(39.2)),
    button("Stop the box", reset),
  ));
  const forces = () => {
    const n = st.m * G, fsMax = st.mus * n, fk = st.muk * n;
    if (!sliding) return { n, fsMax, fk, f: Math.min(st.P, fsMax), a: 0 };
    return { n, fsMax, fk, f: fk, a: (st.P - fk) / st.m };
  };
  const anim = playLoop((dt) => {
    const r = forces();
    if (!sliding && st.P > r.fsMax) sliding = true;
    if (sliding) {
      v += ((st.P - r.fk) / st.m) * dt;
      if (v <= 0) { v = 0; sliding = st.P > r.fsMax; }
      x += v * dt;
    }
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const r = forces();
    // floor and box (top half)
    const fy = h * 0.36;
    ctx.fillStyle = c.border; ctx.fillRect(0, fy, w, 6);
    const span = w * 0.55, bx = w * 0.12 + ((x * 30) % span);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(bx, fy - 40, 50, 40);
    const k = 70 / Math.max(r.fsMax, st.P, 1);
    if (st.P > 0) drawArrow(ctx, bx - st.P * k - 4, fy - 20, st.P * k, 0, F.P, "P");
    if (r.f > 0) drawArrow(ctx, bx + 25, fy + 3, -r.f * k, 0, F.f, sliding ? "fₖ" : "fₛ");
    if (sliding && v > 0.01) drawArrow(ctx, bx + 25, fy - 54, Math.min(80, v * 25), 0, F.v, "v");
    // friction vs. push graph (bottom)
    const Pmax = Math.max(150, r.fsMax * 1.6);
    const P = panel(ctx, c, { x: 44, y: h * 0.5, w: w - 56, h: h * 0.42 }, { t1: Pmax, y0: 0, y1: r.fsMax * 1.25 + 1, label: "friction f (N) vs. your push P (N)" });
    P.frame();
    P.curve([0, r.fsMax], [0, r.fsMax], F.f, 2.5);
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
    P.seg(P.X(r.fsMax), P.Y(r.fsMax), P.X(r.fsMax), P.Y(r.fk)); ctx.restore();
    P.curve([r.fsMax, Pmax], [r.fk, r.fk], F.f, 2.5);
    P.dot(Math.min(st.P, Pmax), r.f, sliding ? F.f : F.P, 6);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Normal force n = mg</th><td>${fmt(r.n, 1)} N</td></tr>
        <tr><th>Max static μₛn</th><td>${fmt(r.fsMax, 1)} N</td></tr>
        <tr><th>Kinetic μₖn</th><td>${fmt(r.fk, 1)} N</td></tr>
        <tr><th>Friction right now</th><td><strong>${fmt(r.f, 1)} N</strong> (${sliding ? "kinetic" : "static"})</td></tr>
        <tr><th>Acceleration</th><td>${fmt(r.a, 2)} m/s²${sliding ? `, v = ${fmt(v, 2)} m/s` : ""}</td></tr>
      </table>
      <div class="verdict">${!sliding ? (st.P <= r.fsMax ? `At rest: static friction matches your ${fmt(st.P, 1)} N push exactly. It is <em>not</em> μₛn.` : "Breaking free…") : st.P > r.fk ? "Sliding: friction dropped to μₖn, so the same push now speeds the box up." : "Sliding, but your push is less than kinetic friction, so the box slows down."}</div>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// The existing inclined-plane simulation, placed inside a lesson
// =====================================================================
export function inclineSim(el) {
  el.classList.add("sim-embed");
  return inclineMount(el);
}

// =====================================================================
// Which real force points toward the center?
// =====================================================================
export function forceSourceQuiz(el) {
  quiz(el, {
    title: "What supplies the inward force?",
    icon: "🎯",
    choices: [["fs", "Static friction"], ["T", "Tension"], ["g", "Gravity"], ["n", "Normal force"], ["cp", '"Centripetal force"']],
    items: [
      { text: "A car takes a flat, unbanked curve.", answer: "fs", why: "The road grips the tires sideways. The tires aren't sliding, so it's static friction." },
      { text: "A ball swung in a horizontal circle on a string.", answer: "T", why: "The string pulls the ball inward." },
      { text: "The Moon orbiting Earth.", answer: "g", why: "Earth's gravity pulls the Moon toward the center of its orbit." },
      { text: "A car on a banked curve at exactly its design speed, no friction needed.", answer: "n", why: "The tilted road's normal force has a horizontal part pointing toward the center." },
      { text: 'A student says the inward force is "the centripetal force."', answer: "cp", why: "This one is a trap: there's no such separate force. You must always name the real force that does the job." },
      { text: "Clothes pressed against the wall of a spinning dryer drum.", answer: "n", why: "The drum wall pushes the clothes inward." },
    ],
  });
  // a "centripetal force" pick is only right for the trap question; explain it on every item
  el.querySelectorAll(".quiz-list li").forEach((li, i) => {
    if (i === 4) return;
    const btn = [...li.querySelectorAll("button")].find((b) => b.textContent.includes("Centripetal"));
    btn?.addEventListener("click", () => {
      li.querySelector(".quiz-why").insertAdjacentHTML("beforeend", ' "Centripetal" only names the direction. It never goes on a free-body diagram.');
    });
  });
}

// =====================================================================
// Car on a curve: flat (friction) or banked (normal force)
// =====================================================================
export function curveCar(el) {
  const { canvas, controls, readout } = shell(el, { title: "Car on a curve", icon: "🏎️", canvas: true });
  const st = { mode: "flat", R: 50, v: 20, mu: 0.8, beta: 27 };
  const sl = {};
  const build = () => {
    controls.innerHTML = "";
    const seg = row();
    [["flat", "Flat curve"], ["banked", "Banked curve (no friction)"]].forEach(([k, label]) => {
      const b = button(label, () => { st.mode = k; build(); });
      if (k === st.mode) b.classList.add("active");
      seg.appendChild(b);
    });
    sl.R = slider({ label: "Radius R", min: 10, max: 150, step: 1, value: st.R, unit: "m", onInput: (v) => { st.R = v; draw(); } });
    sl.v = slider({ label: "Speed v", min: 1, max: 40, step: 0.1, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; draw(); } });
    controls.append(seg, sl.R, sl.v);
    if (st.mode === "flat") {
      sl.mu = slider({ label: "Static friction μₛ", min: 0.05, max: 1.2, step: 0.05, value: st.mu, onInput: (v) => { st.mu = v; draw(); } });
      controls.append(sl.mu, row(button("Example 1 (R 50 m, μₛ 0.80)", () => { sl.R.set(50); sl.mu.set(0.8); sl.v.set(19.8); }), button("Icy road (μₛ 0.10)", () => sl.mu.set(0.1))));
    } else {
      sl.beta = slider({ label: "Bank angle β", min: 0, max: 50, step: 1, value: st.beta, unit: "°", onInput: (v) => { st.beta = v; draw(); } });
      controls.append(sl.beta, row(button("Example 2 (R 80 m, 20 m/s)", () => { sl.R.set(80); sl.v.set(20); sl.beta.set(27); }), button("Bank it for this speed", () => sl.beta.set(Math.round(deg(Math.atan((st.v * st.v) / (G * st.R))))))));
    }
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const m = 1000, need = (m * st.v * st.v) / st.R;
    const beta = st.mode === "flat" ? 0 : rad(st.beta);
    // cross-section: center of the curve is to the left
    const cx = w * 0.55, cy = h * 0.62;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-beta);
    ctx.fillStyle = c.border; ctx.fillRect(-w * 0.45, 0, w * 0.9, 10);
    ctx.fillStyle = "#2f80ed"; ctx.fillRect(-36, -30, 72, 30);
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(-22, 0, 8, 0, Math.PI * 2); ctx.arc(22, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = c.muted; ctx.font = "12px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("← toward the center of the curve", 10, 20);
    const W = m * G, k = (Math.min(w, h) * 0.3) / Math.max(W, need);
    const ox = cx, oy = cy - 15;
    drawArrow(ctx, ox, oy, 0, W * k, F.w, "mg");
    let verdict, rows;
    if (st.mode === "flat") {
      const fmax = st.mu * W, ok = need <= fmax * 1.005; // within rounding of the limit counts as holding
      const f = Math.min(need, fmax);
      drawArrow(ctx, ox, oy, 0, -W * k, F.n, "n");
      drawArrow(ctx, ox, cy + 4, -f * k, 0, ok ? F.f : "#d63c3c", ok ? "fₛ" : "fₛ (max)");
      const vmax = Math.sqrt(st.mu * G * st.R);
      rows = [["Inward force needed mv²/R", `${fmt(need / 1000, 2)} kN`], ["Max static friction μₛmg", `${fmt(fmax / 1000, 2)} kN`], ["Max speed √(μₛgR)", `<strong>${fmt(vmax, 1)} m/s</strong>`]];
      verdict = ok ? (need > fmax * 0.98 ? "Right at the limit: static friction is at its maximum. Any faster and the car skids." : `Holds the curve. Static friction supplies ${fmt(f / 1000, 2)} kN toward the center.`) : "Skids! The road can't supply enough friction, so the car slides outward (it tries to go straight).";
    } else {
      const n = W / Math.cos(beta), inward = n * Math.sin(beta);
      drawArrow(ctx, ox, oy, -n * Math.sin(beta) * k, -n * Math.cos(beta) * k, F.n, "n");
      ctx.save(); ctx.setLineDash([4, 4]);
      drawArrow(ctx, ox, oy, -inward * k, 0, F.n, "n sin β");
      ctx.restore();
      const vIdeal = Math.sqrt(G * st.R * Math.tan(beta));
      const diff = inward - need;
      rows = [["Inward force needed mv²/R", `${fmt(need / 1000, 2)} kN`], ["Inward part of n, mg tan β", `${fmt(inward / 1000, 2)} kN`], ["Design speed √(gR tan β)", `<strong>${fmt(vIdeal, 1)} m/s</strong>`], ["Bank angle for this v: tan⁻¹(v²/gR)", `${fmt(deg(Math.atan((st.v * st.v) / (G * st.R))), 1)}°`]];
      verdict = Math.abs(diff) < need * 0.03 + 50 ? "Just right: the normal force alone turns the car. No friction needed." : diff < 0 ? "Too fast for this bank: without friction the car slides up and out." : "Too slow for this bank: without friction the car slides down the slope.";
    }
    readout.innerHTML = `<table class="mini-table">${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</table>
      <div class="verdict">${verdict}</div>
      <p class="small muted">Mass cancels out of every speed limit, so it's fixed at 1000 kg here.</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Top of a vertical loop: n + mg = mv²/R
// =====================================================================
export function loopTop(el) {
  const { canvas, controls, readout } = shell(el, { title: "Top of a vertical loop", icon: "🎢", canvas: true });
  const st = { R: 10, v: 12, m: 300 };
  const sl = {
    R: slider({ label: "Loop radius R", min: 2, max: 30, step: 0.5, value: st.R, unit: "m", onInput: (v) => { st.R = v; draw(); } }),
    v: slider({ label: "Speed at the top", min: 0, max: 30, step: 0.1, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; draw(); } }),
  };
  controls.append(sl.R, sl.v, row(button("Exactly v_min", () => sl.v.set(+Math.sqrt(G * st.R).toFixed(1))), button("10 m loop example", () => { sl.R.set(10); sl.v.set(12); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const Rp = Math.min(w, h) * 0.34, cx = w / 2, cy = h * 0.55;
    ctx.strokeStyle = c.border; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.stroke();
    const W = st.m * G, need = (st.m * st.v * st.v) / st.R, n = need - W;
    const vmin = Math.sqrt(G * st.R);
    const topY = cy - Rp + 14;
    if (n < 0) {
      // falls off: projectile path from the top, drawn to scale of the loop
      const s = Rp / st.R;
      ctx.strokeStyle = "#d63c3c"; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const t = i * 0.04; const px = cx + st.v * t * s, py = topY + 0.5 * G * t * t * s; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = n < 0 ? "#d63c3c" : "#2f80ed"; ctx.fillRect(cx - 20, topY - 10, 40, 20);
    const k = (Rp * 0.7) / Math.max(need, W);
    drawArrow(ctx, cx - 8, topY + 10, 0, W * k, F.w, "mg");
    if (n > 0) drawArrow(ctx, cx + 8, topY + 10, 0, n * k, F.n, "n");
    drawArrow(ctx, cx + 70, topY + 10, Math.min(60, st.v * 3), 0, F.v, "v");
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("center", cx, cy + 4);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Needed toward center mv²/R</th><td>${fmt(need, 0)} N</td></tr>
        <tr><th>Gravity mg</th><td>${fmt(W, 0)} N</td></tr>
        <tr><th>Track's push n = mv²/R − mg</th><td><strong>${n >= 0 ? fmt(n, 0) + " N" : "would be negative"}</strong></td></tr>
        <tr><th>v_min = √(gR)</th><td><strong>${fmt(vmin, 1)} m/s</strong></td></tr>
      </table>
      <div class="verdict ${n < 0 ? "bad" : ""}">${n < -1 ? "Too slow: gravity alone pulls the car into a tighter curve than the track, so it falls off (red path)." : n < 1 ? "At v_min: n = 0, and gravity alone supplies the inward force." : "Stays on the track: gravity plus the track's push supply the inward force."}</div>
      <p class="small muted">Car mass 300 kg (it cancels out of v_min).</p>`;
  }
  draw();
  return destroy;
}
