// Unit 11 widgets: equilibrium and elasticity.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad, deg } from "./plane.js";
import { shell, button, row, select, checkbox } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const C = { up: "#2f80ed", w: "#27ae60", T: "#9b51e0", f: "#eb5757", pivot: "#f2994a" };
const num = (v, d = 0) => Number(v.toFixed(d)).toLocaleString(undefined, { maximumFractionDigits: d }).replace("-", "−");
// Scientific notation like "1.2 × 10⁸"
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sci = (v, d = 2) => {
  if (v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e <= 3) return e >= 2 ? num(v) : fmt(v, d);
  return `${fmt(v / 10 ** e, d - 1 < 0 ? 0 : d - 1)} × 10${String(e).split("").map((ch) => SUP[ch]).join("")}`;
};

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

function spinArrow(ctx, cx, cy, R, dir, color) {
  if (!dir) return;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
  const a0 = Math.PI * 0.15, a1 = Math.PI * 0.85;
  ctx.beginPath(); ctx.arc(cx, cy, R, -a0, -a1, true); ctx.stroke();
  const tip = dir > 0 ? a1 : a0, tx = cx + R * Math.cos(tip), ty = cy - R * Math.sin(tip);
  const ux = -Math.sin(tip) * dir, uy = -Math.cos(tip) * dir;
  ctx.beginPath(); ctx.moveTo(tx + ux * 10, ty + uy * 10); ctx.lineTo(tx - uy * 6, ty + ux * 6); ctx.lineTo(tx + uy * 6, ty - ux * 6); ctx.fill();
  ctx.restore();
}

function triangle(ctx, x, y, color, s = 12) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s, y + s * 1.4); ctx.lineTo(x + s, y + s * 1.4); ctx.closePath(); ctx.fill();
}

// =====================================================================
// A couple: ΣF = 0 but Στ ≠ 0
// =====================================================================
export function coupleForces(el) {
  const { canvas, controls, readout } = shell(el, { title: "Balanced forces that still spin", icon: "📘", canvas: true, wide: true });
  let F = 20, d = 0.3;
  const L = 0.4;
  controls.append(
    slider({ label: "Each force F", min: 0, max: 40, step: 1, value: F, unit: "N", onInput: (v) => { F = v; draw(); } }),
    slider({ label: "Distance between their lines of action", min: 0, max: L, step: 0.01, value: d, unit: "m", onInput: (v) => { d = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const s = (w * 0.6) / L, cx = w / 2, cy = h / 2;
    ctx.fillStyle = "#f2c94c"; ctx.strokeStyle = "#8a6d1c"; ctx.lineWidth = 2;
    ctx.fillRect(cx - (L / 2) * s, cy - 18, L * s, 36); ctx.strokeRect(cx - (L / 2) * s, cy - 18, L * s, 36);
    const x1 = cx - (d / 2) * s, x2 = cx + (d / 2) * s, k = 2;
    drawArrow(ctx, x1, cy, 0, -F * k, C.up, "F (up)");
    drawArrow(ctx, x2, cy, 0, F * k, C.f, "F (down)");
    const tau = F * d;
    if (tau > 0.01) spinArrow(ctx, cx, cy, 50, 1, C.T);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>ΣF = F − F</th><td><strong>0</strong> (no sliding)</td></tr>
        <tr><th>Στ = F × d</th><td><strong>${fmt(tau, 2)} N·m</strong> ${tau > 0.01 ? "counterclockwise" : ""}</td></tr>
      </table>
      <div class="verdict ${tau < 0.01 ? "good" : "bad"}">${tau < 0.01 ? "Same line of action: both conditions hold, so it's in equilibrium." : "ΣF = 0 but Στ ≠ 0: the book spins. It is not in equilibrium."}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Torques about any pivot sum to zero for an object in equilibrium
// =====================================================================
export function pivotAnywhere(el) {
  const { canvas, controls, readout } = shell(el, { title: "Torques about any pivot", icon: "📍", canvas: true, wide: true });
  const L = 6, M = 40, m = 60, xp = 2;
  const FR = (M * G * (L / 2) + m * G * xp) / L, FL = (M + m) * G - FR;
  const forces = [["F_L (left support)", 0, FL, C.up], ["plank weight", L / 2, -M * G, C.w], ["person's weight", xp, -m * G, C.w], ["F_R (right support)", L, FR, C.up]];
  let pv = 0;
  controls.append(
    slider({ label: "Pivot position (from the left end)", min: -1, max: 7, step: 0.1, value: pv, unit: "m", onInput: (v) => { pv = v; draw(); } }),
    row(button("Pivot at the left support", () => { controls.querySelector("input").value = 0; controls.querySelector("input").dispatchEvent(new Event("input")); }), button("Pivot at the right support", () => { controls.querySelector("input").value = 6; controls.querySelector("input").dispatchEvent(new Event("input")); })),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const X = (x) => w * 0.12 + ((x + 1) / 8) * (w * 0.76), y = h * 0.5;
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(X(0), y - 6, X(L) - X(0), 12);
    triangle(ctx, X(0), y + 6, c.muted); triangle(ctx, X(L), y + 6, c.muted);
    ctx.fillStyle = "#9b51e0"; ctx.beginPath(); ctx.arc(X(xp), y - 22, 9, 0, Math.PI * 2); ctx.fill();
    const k = 0.07;
    forces.forEach(([, x, F, col]) => drawArrow(ctx, X(x), F > 0 ? y + 40 : y, 0, -F * k, col, null));
    ctx.fillStyle = C.pivot; ctx.beginPath(); ctx.arc(X(pv), y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("pivot", X(pv), y - 40);
    const taus = forces.map(([name, x, F]) => [name, (x - pv) * F]);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Force (size)</th><th>Torque about the pivot</th></tr>
        ${forces.map(([name, x, F], i) => `<tr><td>${name} (${fmt(Math.abs(F), 0)} N at ${fmt(x, 1)} m)</td><td>${fmt(taus[i][1], 0)} N·m${Math.abs(x - pv) < 0.05 ? " (passes through the pivot)" : ""}</td></tr>`).join("")}
        <tr><th>Στ</th><td><strong>${fmt(taus.reduce((s, t) => s + t[1], 0), 1)} N·m</strong></td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">The worked example's plank (6.0 m, 40 kg, person 60 kg at 2.0 m). Counterclockwise is positive.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Center of gravity of a plank plus a box
// =====================================================================
export function cgPlank(el) {
  const { canvas, controls, readout } = shell(el, { title: "Plank-and-box center of gravity", icon: "📦", canvas: true, wide: true });
  const st = { L: 4, M: 20, mb: 10, xb: 1 };
  let sx;
  const build = () => {
    controls.innerHTML = "";
    sx = slider({ label: "Box position from the left end", min: 0, max: st.L, step: 0.05, value: Math.min(st.xb, st.L), unit: "m", onInput: (v) => { st.xb = v; draw(); } });
    controls.append(
      slider({ label: "Plank length", min: 1, max: 8, step: 0.5, value: st.L, unit: "m", onInput: (v) => { st.L = v; st.xb = Math.min(st.xb, v); build(); } }),
      slider({ label: "Plank mass", min: 1, max: 60, step: 1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; draw(); } }),
      slider({ label: "Box mass", min: 0, max: 60, step: 1, value: st.mb, unit: "kg", onInput: (v) => { st.mb = v; draw(); } }),
      sx, row(button("Worked example", () => { Object.assign(st, { L: 4, M: 20, mb: 10, xb: 1 }); build(); })),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const X = (x) => w * 0.1 + (x / st.L) * (w * 0.8), y = h * 0.55;
    const xcg = (st.M * (st.L / 2) + st.mb * st.xb) / (st.M + st.mb);
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(X(0), y - 8, X(st.L) - X(0), 16);
    const bs = 16 + Math.sqrt(st.mb) * 4;
    if (st.mb > 0) { ctx.fillStyle = "#c0392b"; ctx.fillRect(X(st.xb) - bs / 2, y - 8 - bs, bs, bs); }
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("plank's center", X(st.L / 2), y + 26);
    ctx.strokeStyle = c.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(st.L / 2), y + 8); ctx.lineTo(X(st.L / 2), y + 16); ctx.stroke(); ctx.setLineDash([]);
    triangle(ctx, X(xcg), y + 8, C.pivot, 14);
    drawArrow(ctx, X(xcg), y - 8, 0, 60, C.w, null);
    ctx.fillStyle = C.pivot; ctx.font = "600 11px Inter, sans-serif"; ctx.fillText(`cg = ${fmt(xcg, 2)} m`, X(xcg), y + 44);
    readout.innerHTML = `
      <div class="conv-chain">x_cg = [(${st.M})(${fmt(st.L / 2, 2)}) + (${st.mb})(${fmt(st.xb, 2)})] / (${st.M} + ${st.mb}) = <strong>${fmt(xcg, 2)} m</strong></div>
      <p class="small" style="margin-top:8px">A single support at the orange triangle would balance the whole thing. The green arrow is the total weight acting there.</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Tipping: stays up while the center of gravity is over the base
// =====================================================================
export function tippingBlock(el) {
  const { canvas, controls, readout } = shell(el, { title: "Tipping model", icon: "🗄️", canvas: true });
  const st = { w: 0.6, h: 1.2, tilt: 10 };
  const sl = {
    w: slider({ label: "Base width", min: 0.2, max: 2, step: 0.05, value: st.w, unit: "m", onInput: (v) => { st.w = v; draw(); } }),
    h: slider({ label: "Height", min: 0.2, max: 2.5, step: 0.05, value: st.h, unit: "m", onInput: (v) => { st.h = v; draw(); } }),
    tilt: slider({ label: "Tilt about the right corner", min: 0, max: 80, step: 1, value: st.tilt, unit: "°", onInput: (v) => { st.tilt = v; draw(); } }),
  };
  controls.append(sl.w, sl.h, sl.tilt, row(button("Tall bookcase", () => { sl.w.set(0.4); sl.h.set(2.0); }), button("Race car", () => { sl.w.set(1.8); sl.h.set(0.5); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w: W, h: H } = size;
    ctx.clearRect(0, 0, W, H);
    const s = Math.min((W * 0.5) / Math.max(st.w, st.h), (H * 0.7) / Math.max(st.w, st.h));
    const px = W * 0.55, py = H - 24, th = rad(st.tilt);
    ctx.fillStyle = c.border; ctx.fillRect(0, py, W, 4);
    // box corners relative to the pivot (bottom-right), rotated clockwise by th
    const rot = ([x, y]) => [x * Math.cos(th) + y * Math.sin(th), -x * Math.sin(th) + y * Math.cos(th)];
    const corners = [[0, 0], [-st.w, 0], [-st.w, st.h], [0, st.h]].map(rot);
    ctx.fillStyle = "rgba(141,110,99,.85)"; ctx.beginPath();
    corners.forEach(([x, y], i) => (i ? ctx.lineTo(px + x * s, py - y * s) : ctx.moveTo(px + x * s, py - y * s))); ctx.closePath(); ctx.fill();
    const [gx, gy] = rot([-st.w / 2, st.h / 2]);
    ctx.fillStyle = C.pivot; ctx.beginPath(); ctx.arc(px + gx * s, py - gy * s, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.w; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + gx * s, py - gy * s); ctx.lineTo(px + gx * s, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    const crit = deg(Math.atan(st.w / st.h));
    const tips = gx > 1e-6;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Tipping angle tan⁻¹(width/height)</th><td><strong>${fmt(crit, 1)}°</strong></td></tr>
        <tr><th>Center of gravity vs. the pivot corner</th><td>${fmt(Math.abs(gx), 3)} m ${tips ? "past" : "inside"}</td></tr>
      </table>
      <div class="verdict ${tips ? "bad" : "good"}">${tips ? "The center of gravity is past the corner: gravity's torque tips it over." : "The center of gravity is still over the base: gravity's torque pulls it back upright."}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Seesaw balancer
// =====================================================================
export function seesaw(el) {
  const { canvas, controls, readout } = shell(el, { title: "Seesaw balancer", icon: "⚖️", canvas: true, wide: true });
  const st = { m1: 30, x1: 1.6, m2: 40, x2: 1.0, M: 10 };
  const sl = {
    m1: slider({ label: "Left child's mass", min: 10, max: 80, step: 1, value: st.m1, unit: "kg", onInput: (v) => { st.m1 = v; draw(); } }),
    x1: slider({ label: "Left child's distance from the pivot", min: 0, max: 2, step: 0.05, value: st.x1, unit: "m", onInput: (v) => { st.x1 = v; draw(); } }),
    m2: slider({ label: "Right child's mass", min: 10, max: 80, step: 1, value: st.m2, unit: "kg", onInput: (v) => { st.m2 = v; draw(); } }),
    x2: slider({ label: "Right child's distance from the pivot", min: 0, max: 2, step: 0.05, value: st.x2, unit: "m", onInput: (v) => { st.x2 = v; draw(); } }),
    M: slider({ label: "Seesaw mass", min: 0, max: 40, step: 1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; draw(); } }),
  };
  controls.append(sl.m1, sl.x1, sl.m2, sl.x2, sl.M, row(button("Balance it", () => sl.x2.set(Math.min(2, +((st.m1 * st.x1) / st.m2).toFixed(2)))), button("Worked example", () => { sl.m1.set(30); sl.x1.set(1.6); sl.m2.set(40); sl.x2.set(1.0); sl.M.set(10); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const net = st.m1 * G * st.x1 - st.m2 * G * st.x2; // counterclockwise +
    const tilt = Math.abs(net) < 0.5 ? 0 : Math.sign(net) * rad(10);
    const cx = w / 2, cy = h * 0.6, s = (w * 0.4) / 2.2;
    triangle(ctx, cx, cy, c.muted, 16);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt);
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(-2.1 * s, -8, 4.2 * s, 8);
    [[-st.x1, st.m1, "#2f80ed"], [st.x2, st.m2, "#eb5757"]].forEach(([x, m, col]) => {
      const r = 8 + Math.sqrt(m) * 1.8;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x * s, -8 - r, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(`${m}`, x * s, -4 - r);
    });
    ctx.restore();
    if (Math.abs(net) > 0.5) spinArrow(ctx, cx, cy - 20, 40, Math.sign(net), C.T);
    const need = (st.m1 * st.x1) / st.m2, n = (st.m1 + st.m2 + st.M) * G;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Left torque m₁g·x₁ (ccw)</th><td>+${fmt(st.m1 * G * st.x1, 0)} N·m</td></tr>
        <tr><th>Right torque m₂g·x₂ (cw)</th><td>−${fmt(st.m2 * G * st.x2, 0)} N·m</td></tr>
        <tr><th>Net torque</th><td><strong>${fmt(net, 0)} N·m</strong></td></tr>
        <tr><th>Balance point for the right child</th><td>${fmt(need, 2)} m ${need > 2 ? "(off the end!)" : ""}</td></tr>
        <tr><th>Pivot force n = (m₁ + m₂ + M)g</th><td>${fmt(n, 0)} N</td></tr>
      </table>
      <div class="verdict ${Math.abs(net) < 0.5 ? "good" : ""}">${Math.abs(net) < 0.5 ? "Balanced: Στ = 0." : `It tips ${net > 0 ? "left" : "right"}: the side with more torque wins, not the side with more weight.`}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Plank on two supports: the load shifts as a person walks
// =====================================================================
export function plankSupports(el) {
  const { canvas, controls, readout } = shell(el, { title: "Plank on two supports", icon: "🌉", canvas: true, wide: true });
  const st = { L: 6, M: 40, m: 60, x: 2 };
  let sx;
  const anim = playLoop((dt) => { st.x += dt * 0.8; if (st.x >= st.L) { st.x = st.L; sx.set(st.L); return false; } sx.set(+st.x.toFixed(2)); });
  const build = () => {
    controls.innerHTML = "";
    sx = slider({ label: "Person's position from the left end", min: 0, max: st.L, step: 0.05, value: Math.min(st.x, st.L), unit: "m", onInput: (v) => { st.x = v; draw(); } });
    controls.append(
      slider({ label: "Plank length", min: 2, max: 10, step: 0.5, value: st.L, unit: "m", onInput: (v) => { st.L = v; st.x = Math.min(st.x, v); build(); } }),
      slider({ label: "Plank mass", min: 0, max: 100, step: 1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; draw(); } }),
      slider({ label: "Person's mass", min: 0, max: 120, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
      sx, row(button("▶ Walk across", () => { st.x = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Worked example", () => { anim.stop(); Object.assign(st, { L: 6, M: 40, m: 60, x: 2 }); build(); })),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const X = (x) => w * 0.1 + (x / st.L) * (w * 0.8), y = h * 0.45;
    const FR = (st.M * G * (st.L / 2) + st.m * G * st.x) / st.L, FL = (st.M + st.m) * G - FR;
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(X(0), y - 6, X(st.L) - X(0), 12);
    triangle(ctx, X(0), y + 6, c.muted); triangle(ctx, X(st.L), y + 6, c.muted);
    ctx.fillStyle = "#9b51e0"; ctx.beginPath(); ctx.arc(X(st.x), y - 30, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(X(st.x) - 4, y - 22, 8, 16);
    const k = (h * 0.35) / Math.max((st.M + st.m) * G, 1);
    drawArrow(ctx, X(0), y + 70, 0, -FL * k, C.up, `F_L ${fmt(FL, 0)} N`);
    drawArrow(ctx, X(st.L), y + 70, 0, -FR * k, C.up, `F_R ${fmt(FR, 0)} N`);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Torques about the left end → F_R</th><td>F_R = [(${st.M})(g)(${fmt(st.L / 2, 1)}) + (${st.m})(g)(${fmt(st.x, 2)})] / ${st.L} = <strong>${fmt(FR, 0)} N</strong></td></tr>
        <tr><th>ΣFᵧ = 0 → F_L</th><td>${fmt((st.M + st.m) * G, 0)} − ${fmt(FR, 0)} = <strong>${fmt(FL, 0)} N</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">The support nearer the person always carries more of the load.</p>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Ladder against a frictionless wall
// =====================================================================
export function ladder(el) {
  const { canvas, controls, readout } = shell(el, { title: "Ladder against a wall", icon: "🪜", canvas: true });
  const st = { L: 5, m: 15, d: 3, mp: 0, s: 0.5, mu: 0.5 };
  const sl = {
    L: slider({ label: "Ladder length", min: 2, max: 10, step: 0.1, value: st.L, unit: "m", onInput: (v) => { st.L = v; st.d = Math.min(st.d, v - 0.1); draw(); } }),
    m: slider({ label: "Ladder mass", min: 5, max: 40, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    d: slider({ label: "Base distance from the wall", min: 0.3, max: 9.5, step: 0.1, value: st.d, unit: "m", onInput: (v) => { st.d = Math.min(v, st.L - 0.1); draw(); } }),
    mp: slider({ label: "Climber's mass", min: 0, max: 100, step: 1, value: st.mp, unit: "kg", onInput: (v) => { st.mp = v; draw(); } }),
    s: slider({ label: "How far up the climber is", min: 0, max: 1, step: 0.01, value: st.s, onInput: (v) => { st.s = v; draw(); } }),
    mu: slider({ label: "Floor's static friction μₛ", min: 0, max: 1, step: 0.01, value: st.mu, onInput: (v) => { st.mu = v; draw(); } }),
  };
  controls.append(sl.L, sl.m, sl.d, sl.mp, sl.s, sl.mu, row(button("Worked example", () => { sl.L.set(5); sl.m.set(15); sl.d.set(3); sl.mp.set(0); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const H = Math.sqrt(st.L ** 2 - st.d ** 2);
    const W = st.m * G, Wp = st.mp * G;
    const nw = (W * (st.d / 2) + Wp * (st.s * st.d)) / H, nf = W + Wp, need = nw / nf;
    const slips = need > st.mu + 1e-9;
    const s = Math.min((w - 80) / Math.max(st.d, 1), (h - 40) / Math.max(H, 1));
    const wallX = w - 30, floorY = h - 20, bx = wallX - st.d * s, ty = floorY - H * s;
    ctx.fillStyle = c.border; ctx.fillRect(wallX, 0, 12, h); ctx.fillRect(0, floorY, w, 6);
    ctx.strokeStyle = "#8d6e63"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, floorY); ctx.lineTo(wallX, ty); ctx.stroke();
    const k = 60 / Math.max(nf, 1);
    drawArrow(ctx, wallX, ty, -nw * k, 0, C.up, "n_w");
    drawArrow(ctx, bx, floorY, 0, -nf * k, C.up, "n_f");
    drawArrow(ctx, bx, floorY, nw * k, 0, slips ? "#d63c3c" : C.f, "f_s");
    drawArrow(ctx, bx + (st.d / 2) * s, floorY - (H / 2) * s, 0, W * k, C.w, "mg");
    if (st.mp > 0) {
      const px = bx + st.s * st.d * s, py = floorY - st.s * H * s;
      ctx.fillStyle = "#9b51e0"; ctx.beginPath(); ctx.arc(px, py - 10, 8, 0, Math.PI * 2); ctx.fill();
    }
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Height on the wall √(L² − d²)</th><td>${fmt(H, 2)} m</td></tr>
        <tr><th>Torques about the base → n_w</th><td><strong>${fmt(nw, 1)} N</strong></td></tr>
        <tr><th>ΣFᵧ = 0 → n_f</th><td><strong>${fmt(nf, 0)} N</strong></td></tr>
        <tr><th>ΣFₓ = 0 → f_s needed</th><td><strong>${fmt(nw, 1)} N</strong></td></tr>
        <tr><th>Minimum μₛ = f_s / n_f</th><td><strong>${fmt(need, 3)}</strong> (floor gives ${st.mu})</td></tr>
      </table>
      <div class="verdict ${slips ? "bad" : "good"}">${slips ? "Not enough friction: the base slides out." : "Friction can hold it: the ladder stays put."}</div>
      <p class="small muted" style="margin-top:8px">The weight's lever arm about the base is the horizontal distance d/2, not the distance along the ladder.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Beam held out from a wall by a hinge and a cable
// =====================================================================
export function hingeCable(el) {
  const { canvas, controls, readout } = shell(el, { title: "Beam with a hinge and cable", icon: "🏗️", canvas: true, wide: true });
  const st = { L: 3, mb: 20, ms: 50, ang: 30 };
  const sl = {
    L: slider({ label: "Beam length", min: 1, max: 6, step: 0.1, value: st.L, unit: "m", onInput: (v) => { st.L = v; draw(); } }),
    mb: slider({ label: "Beam mass", min: 0, max: 60, step: 1, value: st.mb, unit: "kg", onInput: (v) => { st.mb = v; draw(); } }),
    ms: slider({ label: "Sign mass (at the end)", min: 0, max: 150, step: 1, value: st.ms, unit: "kg", onInput: (v) => { st.ms = v; draw(); } }),
    ang: slider({ label: "Cable angle with the beam", min: 5, max: 80, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; draw(); } }),
  };
  controls.append(sl.L, sl.mb, sl.ms, sl.ang, row(button("Worked example", () => { sl.L.set(3); sl.mb.set(20); sl.ms.set(50); sl.ang.set(30); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const th = rad(st.ang), Wb = st.mb * G, Ws = st.ms * G;
    const T = (Wb * (st.L / 2) + Ws * st.L) / (st.L * Math.sin(th));
    const H = T * Math.cos(th), V = Wb + Ws - T * Math.sin(th);
    const wallX = 40, by = h * 0.62, s = Math.min((w * 0.55) / st.L, (by - 20) / (st.L * Math.tan(th)));
    const ex = wallX + st.L * s;
    ctx.fillStyle = c.border; ctx.fillRect(wallX - 16, 0, 16, h);
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(wallX, by - 6, st.L * s, 12);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex, by); ctx.lineTo(wallX, by - st.L * Math.tan(th) * s); ctx.stroke();
    ctx.fillStyle = "#f2c94c"; ctx.fillRect(ex - 24, by + 22, 48, 28); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(ex, by + 6); ctx.lineTo(ex, by + 22); ctx.stroke();
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(wallX, by, 6, 0, Math.PI * 2); ctx.fill();
    const k = (h * 0.3) / Math.max(T, Wb + Ws, 1);
    drawArrow(ctx, ex, by, -T * Math.cos(th) * k, -T * Math.sin(th) * k, C.T, "T");
    drawArrow(ctx, wallX, by, H * k, -V * k, C.pivot, "hinge");
    drawArrow(ctx, wallX + (st.L / 2) * s, by, 0, Wb * k, C.w, "beam");
    drawArrow(ctx, ex + 30, by + 36, 0, Ws * k, C.w, "sign");
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Torques about the hinge → T</th><td>T sin ${st.ang}°(${st.L}) = ${fmt(Wb * st.L / 2 + Ws * st.L, 0)} → <strong>T = ${num(T)} N</strong></td></tr>
        <tr><th>ΣFₓ = 0 → hinge pushes out</th><td><strong>${num(H)} N</strong></td></tr>
        <tr><th>ΣFᵧ = 0 → hinge vertical</th><td><strong>${num(V)} N</strong> ${V < 0 ? "(pulls down)" : "(pushes up)"}</td></tr>
        <tr><th>Hinge force overall</th><td>${num(Math.hypot(H, V))} N at ${fmt(deg(Math.atan2(V, H)), 1)}° above the beam</td></tr>
        <tr><th>T ÷ total weight</th><td>${fmt(T / (Wb + Ws), 2)}×</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">The hinge force doesn't point along the beam, so solve for both components.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Young's modulus: ΔL = F L₀ / (A Y)
// =====================================================================
const MATERIALS = { steel: ["Steel", 2.0e11], aluminum: ["Aluminum", 7.0e10], copper: ["Copper", 1.1e11], nylon: ["Nylon", 3.0e9] };
export function wireStretch(el) {
  const { canvas, controls, readout } = shell(el, { title: "Wire-stretch calculator", icon: "🧵", canvas: true });
  const st = { mat: "steel", m: 50, L: 2, A: 4 };
  let wrong = false;
  const sl = {
    m: slider({ label: "Hanging mass", min: 1, max: 500, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    L: slider({ label: "Wire length L₀", min: 0.5, max: 10, step: 0.1, value: st.L, unit: "m", onInput: (v) => { st.L = v; draw(); } }),
    A: slider({ label: "Cross-sectional area", min: 0.5, max: 50, step: 0.5, value: st.A, unit: "mm²", onInput: (v) => { st.A = v; draw(); } }),
  };
  controls.append(row(select(Object.entries(MATERIALS).map(([k, v]) => [k, `${v[0]} (Y = ${sci(v[1], 2)} Pa)`]), st.mat, (v) => { st.mat = v; draw(); })), sl.m, sl.L, sl.A, row(button("Worked example", () => { st.mat = "steel"; controls.querySelector("select").value = "steel"; sl.m.set(50); sl.L.set(2); sl.A.set(4); })), checkbox("Show the mistake 1 mm² = 10⁻³ m²", wrong, (v) => { wrong = v; draw(); }));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const Y = MATERIALS[st.mat][1], F = st.m * G, A = st.A * 1e-6;
    const stress = F / A, strain = stress / Y, dL = strain * st.L;
    const mag = Math.max(1, Math.round((h * 0.25) / Math.max(dL * ((h * 0.6) / st.L), 1e-9)));
    const px = (h * 0.6) / st.L;
    const x = w / 2, top = 12;
    ctx.fillStyle = c.muted; ctx.fillRect(x - 50, top - 6, 100, 6);
    const L0 = st.L * px, extra = Math.min(h * 0.25, dL * px * mag);
    ctx.strokeStyle = c.border; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x - 40, top + L0); ctx.lineTo(x + 40, top + L0); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = c.text; ctx.lineWidth = Math.max(1, Math.min(6, Math.sqrt(st.A))); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + L0 + extra); ctx.stroke();
    ctx.fillStyle = "#c0392b"; ctx.fillRect(x - 20, top + L0 + extra, 40, 30);
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`stretch drawn ${num(mag)}× larger`, x + 46, top + L0 + extra / 2);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Area</th><td>${st.A} mm² = ${sci(A, 2)} m²</td></tr>
        <tr><th>Force F = mg</th><td>${num(F)} N</td></tr>
        <tr><th>Stress F/A</th><td>${sci(stress, 2)} Pa</td></tr>
        <tr><th>Strain = stress / Y</th><td>${sci(strain, 2)}</td></tr>
        <tr><th>Stretch ΔL = FL₀/(AY)</th><td><strong>${fmt(dL * 1000, 3)} mm</strong></td></tr>
        ${wrong ? `<tr><th class="bad">With 1 mm² = 10⁻³ m² (wrong)</th><td class="bad"><s>${fmt((dL * 1000) / 1000, 6)} mm</s>: 1000× too small</td></tr>` : ""}
      </table>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Shear: S = (F/A)/(x/h)
// =====================================================================
export function shearBlock(el) {
  const { canvas, controls, readout } = shell(el, { title: "Shear deck-of-cards model", icon: "🃏", canvas: true, wide: true });
  const st = { F: 500, A: 0.1, h: 0.05, S: 1e6 };
  controls.append(
    row(select([["1e6", "Rubber (S = 1.0 × 10⁶ Pa)"], ["2.6e10", "Aluminum (S = 2.6 × 10¹⁰ Pa)"], ["7.5e10", "Steel (S = 7.5 × 10¹⁰ Pa)"]], "1e6", (v) => { st.S = Number(v); draw(); })),
    slider({ label: "Sideways force F∥", min: 0, max: 5000, step: 10, value: st.F, unit: "N", onInput: (v) => { st.F = v; draw(); } }),
    slider({ label: "Top area A", min: 0.01, max: 0.5, step: 0.01, value: st.A, unit: "m²", onInput: (v) => { st.A = v; draw(); } }),
    slider({ label: "Height h", min: 0.01, max: 0.2, step: 0.005, value: st.h, unit: "m", onInput: (v) => { st.h = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const stress = st.F / st.A, strain = stress / st.S, x = strain * st.h;
    const bw = w * 0.4, bh = h * 0.5, bx = w * 0.25, by = h * 0.8;
    const shift = Math.min(bw * 0.4, strain * bh * (strain > 0 ? Math.max(1, (bw * 0.25) / (strain * bh)) : 1));
    ctx.fillStyle = c.border; ctx.fillRect(0, by, w, 6);
    const cards = 8;
    for (let i = 0; i < cards; i++) {
      const f = (i + 1) / cards;
      ctx.fillStyle = i % 2 ? "#f2c94c" : "#e8b93a";
      ctx.fillRect(bx + shift * f - shift / cards / 2, by - bh * f, bw, bh / cards);
    }
    drawArrow(ctx, bx + shift + bw + 6, by - bh + bh / cards / 2, 50, 0, C.f, "F∥");
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`shift drawn ${num(shift / Math.max(x * (bh / st.h), 1e-12))}× larger`, bx, by + 22);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Shear stress F∥/A</th><td>${sci(stress, 2)} Pa</td></tr>
        <tr><th>Shear strain = stress / S</th><td>${sci(strain, 2)}</td></tr>
        <tr><th>Top shifts x = strain × h</th><td><strong>${sci(x, 2)} m</strong> = ${fmt(x * 1000, 3)} mm</td></tr>
      </table>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Bulk: water barely compresses even in the deep ocean
// =====================================================================
export function bulkDepth(el) {
  const { controls, readout } = shell(el, { title: "Deep-ocean compression", icon: "🌊" });
  const st = { d: 1000, B: 2.2e9 };
  controls.append(
    row(select([["2.2e9", "Water (B = 2.2 × 10⁹ Pa)"], ["1.6e11", "Steel (B = 1.6 × 10¹¹ Pa)"], ["1.4e5", "Air, roughly (B ≈ 1.4 × 10⁵ Pa)"]], "2.2e9", (v) => { st.B = Number(v); render(); })),
    slider({ label: "Depth in the ocean", min: 0, max: 11000, step: 50, value: st.d, unit: "m", onInput: (v) => { st.d = v; render(); } }),
  );
  function render() {
    const dp = 1000 * G * st.d, frac = -dp / st.B;
    const shown = Math.max(0, 1 + frac);
    readout.innerHTML = `
      <div class="bars">
        <div class="bar-row"><span class="bar-label">Volume at the surface</span><span class="bar"><span style="width:100%;background:#2f80ed"></span></span><span class="bar-val">100%</span></div>
        <div class="bar-row"><span class="bar-label">Volume at ${num(st.d)} m</span><span class="bar"><span style="width:${shown * 100}%;background:#9b51e0"></span></span><span class="bar-val">${fmt(shown * 100, 3)}%</span></div>
      </div>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>Extra pressure Δp ≈ ρgh</th><td>${sci(dp, 2)} Pa</td></tr>
        <tr><th>ΔV/V₀ = −Δp/B</th><td><strong>${sci(frac, 2)}</strong> (${fmt(frac * 100, 3)}%)</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">${st.B < 1e6 ? "Air would be crushed far more than this simple formula allows: gases aren't linear at big pressures, which is the point. Liquids and solids barely change." : "Liquids are treated as incompressible because this number is so small."}</p>`;
  }
  render();
}

// =====================================================================
// Stress-strain curve: elastic return vs. permanent set vs. fracture
// =====================================================================
export function stressStrain(el) {
  const { canvas, controls, readout } = shell(el, { title: "Stress-strain curve", icon: "📈", canvas: true, wide: true });
  const EY = 0.15, SY = 0.6, EF = 0.85, slope = SY / EY;
  const sigma = (e) => (e <= EY ? slope * e : e <= 0.6 ? SY + 0.4 * Math.sin((Math.PI / 2) * ((e - EY) / 0.45)) : 1 - 0.3 * ((e - 0.6) / 0.25) ** 2);
  let e = 0.1, released = false;
  const sE = slider({ label: "Pull to strain (schematic)", min: 0, max: 0.9, step: 0.005, value: e, onInput: (v) => { e = v; released = false; draw(); } });
  controls.append(sE, row(button("Release the load", () => { released = true; draw(); }, "btn btn-primary btn-sm"), button("Elastic", () => sE.set(0.1)), button("Past yield", () => sE.set(0.45)), button("Break it", () => sE.set(0.88))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const P = panel(ctx, c, { x: 40, y: 10, w: w - 52, h: h - 34 }, { t1: 0.92, y0: 0, y1: 1.1, label: "stress vs. strain (not to scale)" });
    P.frame();
    const xs = Array.from({ length: 171 }, (_, i) => (EF * i) / 170);
    P.curve(xs, xs.map(sigma), c.muted, 2);
    ctx.save(); ctx.fillStyle = "rgba(22,163,74,.12)"; ctx.fillRect(P.X(0), 10, P.X(EY) - P.X(0), h - 34); ctx.restore();
    ctx.fillStyle = "#16a34a"; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("elastic", P.X(EY / 2), 26);
    ctx.fillStyle = C.pivot; ctx.fillText("yield", P.X(EY), P.Y(SY) - 8);
    ctx.fillStyle = "#d63c3c"; ctx.fillText("fracture", P.X(EF), P.Y(sigma(EF)) - 8);
    const broke = e >= EF;
    const ee = Math.min(e, EF);
    P.curve(xs.filter((x) => x <= ee), xs.filter((x) => x <= ee).map(sigma), "#2f80ed", 3);
    const set = ee <= EY ? 0 : ee - sigma(ee) / slope;
    if (released && !broke) {
      ctx.save(); ctx.strokeStyle = "#9b51e0"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5; P.seg(P.X(ee), P.Y(sigma(ee)), P.X(set), P.Y(0)); ctx.restore();
      P.dot(set, 0, "#9b51e0");
    } else if (!broke) P.dot(ee, sigma(ee), "#2f80ed");
    const region = broke ? "fracture" : ee <= EY ? "elastic" : "plastic";
    readout.innerHTML = `
      <div class="verdict ${region === "elastic" ? "good" : region === "fracture" ? "bad" : ""}">${
        broke ? "Fracture: the material snapped."
        : region === "elastic" ? (released ? "Released inside the elastic region: it springs all the way back to zero strain." : "Elastic region: stress ∝ strain (Young's modulus is the slope).")
        : released ? `Released past the yield point: it comes back along a line parallel to the elastic slope and keeps a permanent stretch (strain ${fmt(set, 2)} on this scale). A bent paper clip stays bent.`
        : "Plastic region: past the elastic limit. Release to see the permanent deformation."
      }</div>`;
  }
  draw();
  return destroy;
}
