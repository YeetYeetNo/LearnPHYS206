// Unit 13 widgets: periodic motion (SHM, energy, pendulums, damping, resonance).
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad, deg } from "./plane.js";
import { shell, button, row, select } from "./shell.js";
import { panel } from "./graphs.js";
import { quiz } from "./applying.js";

const G = 9.8;
const TAU = Math.PI * 2;
const C = { x: "#2f80ed", v: "#27ae60", a: "#eb5757", K: "#27ae60", U: "#2f80ed", eq: "#f2994a", ghost: "rgba(155,81,224,.35)", bob: "#9b51e0" };
const GRAV = [["9.8", "Earth (g = 9.80 m/s²)"], ["1.62", "Moon (g = 1.62 m/s²)"], ["3.71", "Mars (g = 3.71 m/s²)"], ["24.8", "Jupiter (g = 24.8 m/s²)"]];

function playLoop(onFrame) {
  let raf = 0, last = 0, running = false;
  const tick = (now) => {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (onFrame(dt) === false) { running = false; return; }
    raf = requestAnimationFrame(tick);
  };
  return {
    get running() { return running; },
    start() { cancelAnimationFrame(raf); running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
}

// Play/pause button tied to a loop.
function playButton(anim, onStart) {
  const b = button("▶ Play", () => {
    if (anim.running) { anim.stop(); b.textContent = "▶ Play"; }
    else { onStart?.(); anim.start(); b.textContent = "⏸ Pause"; }
  }, "btn btn-primary btn-sm");
  return b;
}

// Zigzag spring between two points.
function drawSpring(ctx, x0, y0, x1, y1, color, coils = 10, width = 9) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, lead = Math.min(10, len * 0.1);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + ux * lead, y0 + uy * lead);
  const n = coils * 2, body = len - 2 * lead;
  for (let i = 1; i <= n; i++) {
    const s = lead + (body * (i - 0.5)) / n, side = i % 2 ? 1 : -1;
    ctx.lineTo(x0 + ux * s + nx * width * side, y0 + uy * s + ny * width * side);
  }
  ctx.lineTo(x1 - ux * lead, y1 - uy * lead); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}

function block(ctx, x, y, w, h, color, label) {
  ctx.fillStyle = color; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  if (label) { ctx.fillStyle = "#fff"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, x, y + 4); }
}

// Horizontal spring-block strip: wall at left, block at equilibrium + x*scale.
function springStrip(ctx, c, { left, right, y, x, A, color = C.x, label, h = 34 }) {
  const eqX = (left + right) / 2, half = (right - left) / 2 - 28, s = A > 0 ? half / A : 0;
  ctx.fillStyle = c.border; ctx.fillRect(left - 8, y - h / 2 - 8, 8, h + 16); ctx.fillRect(left - 8, y + h / 2, right - left + 16, 3);
  ctx.strokeStyle = c.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(eqX, y - h / 2 - 6); ctx.lineTo(eqX, y + h / 2); ctx.stroke(); ctx.setLineDash([]);
  const bx = eqX + x * s;
  drawSpring(ctx, left, y, bx - 20, y, c.muted, 9, 7);
  block(ctx, bx, y, 40, h, color, label);
  return { eqX, s, bx };
}

// Complete elliptic integral of the first kind, via the arithmetic-geometric mean.
function ellipK(k) {
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 25; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return Math.PI / (2 * a);
}
const exactPendulumT = (L, g, th0) => 4 * Math.sqrt(L / g) * ellipK(Math.sin(th0 / 2));

// One RK4 step of θ'' = −(g/L) sin θ.
function pendStep(s, g, L, dt) {
  const f = (th, w) => [w, -(g / L) * Math.sin(th)];
  const [a1, b1] = f(s.th, s.w);
  const [a2, b2] = f(s.th + (a1 * dt) / 2, s.w + (b1 * dt) / 2);
  const [a3, b3] = f(s.th + (a2 * dt) / 2, s.w + (b2 * dt) / 2);
  const [a4, b4] = f(s.th + a3 * dt, s.w + b3 * dt);
  s.th += (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
  s.w += (dt / 6) * (b1 + 2 * b2 + 2 * b3 + b4);
}

function drawPendulum(ctx, c, px, py, Lpx, th, r, color, ghost) {
  const bx = px + Lpx * Math.sin(th), by = py + Lpx * Math.cos(th);
  ctx.strokeStyle = ghost ? color : c.text; ctx.lineWidth = ghost ? 1.5 : 2;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
}

const speedSelect = (onChange, value = "1") => select([["1", "Real time"], ["0.25", "¼ speed"], ["0.1", "1/10 speed"]], value, (v) => onChange(Number(v)));

// =====================================================================
// SHM as the shadow of circular motion
// =====================================================================
export function refCircle(el) {
  const { canvas, controls, readout } = shell(el, { title: "Reference circle", icon: "⭕", canvas: true, wide: true });
  const st = { A: 0.05, T: 0.4, t: 0, speed: 0.1 };
  const anim = playLoop((dt) => { st.t += dt * st.speed; draw(); });
  controls.append(
    slider({ label: "Amplitude A", min: 0.01, max: 0.1, step: 0.005, value: st.A, unit: "m", onInput: (v) => { st.A = v; draw(); } }),
    slider({ label: "Period T", min: 0.2, max: 4, step: 0.05, value: st.T, unit: "s", onInput: (v) => { st.T = v; st.t = 0; draw(); } }),
    row(playButton(anim), speedSelect((v) => (st.speed = v), "0.1"), button("Reset", () => { st.t = 0; draw(); })),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const om = TAU / st.T, th = om * st.t;
    const R = Math.min(w * 0.16, h * 0.3) * (st.A / 0.1) + 10, cx = w * 0.2, cy = h * 0.38;
    ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    const px = cx + R * Math.cos(th), py = cy - R * Math.sin(th);
    ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = C.bob; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    const ty = cy + R + 34;
    ctx.fillStyle = c.border; ctx.fillRect(cx - R - 14, ty + 10, 2 * R + 28, 2);
    ctx.strokeStyle = c.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ty); ctx.stroke(); ctx.setLineDash([]);
    block(ctx, px, ty, 18, 18, C.x);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("−A", cx - R, ty + 26); ctx.fillText("0", cx, ty + 26); ctx.fillText("+A", cx + R, ty + 26);
    const P = panel(ctx, c, { x: w * 0.44, y: 10, w: w * 0.54, h: h - 34 }, { t1: 2 * st.T, y0: -st.A * 1.2, y1: st.A * 1.2, label: "shadow position x(t) (m) vs. t (s)" });
    P.frame();
    const tl = st.t % (2 * st.T), ts = Array.from({ length: 201 }, (_, i) => (2 * st.T * i) / 200);
    P.curve(ts, ts.map((t) => st.A * Math.cos(om * t)), c.border, 1.5);
    P.curve(ts, ts.map((t) => st.A * Math.cos(om * t)), C.x, 2.5, tl);
    P.dot(tl, st.A * Math.cos(om * tl), C.x);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Amplitude A</th><td>${fmt(st.A, 3)} m</td><th>Distance per cycle 4A</th><td>${fmt(4 * st.A, 3)} m</td></tr>
        <tr><th>Period T</th><td>${fmt(st.T, 2)} s</td><th>Frequency f = 1/T</th><td>${fmt(1 / st.T, 2)} Hz</td></tr>
        <tr><th>Angular frequency ω = 2π/T</th><td><strong>${fmt(om, 1)} rad/s</strong></td><th>Elapsed</th><td>${fmt(st.t, 2)} s = ${fmt(st.t / st.T, 2)} cycles</td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Mass on a spring with x, v, a graphs
// =====================================================================
export function springShm(el) {
  const { canvas, controls, readout } = shell(el, { title: "Mass on a spring", icon: "🔁", canvas: true, xtall: true, wide: true });
  const st = { k: 200, m: 0.5, A: 0.1, t: 0.05, speed: 0.1 };
  const TMAX = 1;
  let sT;
  const anim = playLoop((dt) => { st.t = (st.t + dt * st.speed) % TMAX; sT.set(+st.t.toFixed(3)); });
  sT = slider({ label: "Time t", min: 0, max: TMAX, step: 0.005, value: st.t, unit: "s", onInput: (v) => { st.t = v; draw(); } });
  const sk = slider({ label: "Spring constant k", min: 20, max: 400, step: 5, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; draw(); } });
  const sm = slider({ label: "Mass m", min: 0.1, max: 4, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } });
  const sA = slider({ label: "Amplitude A (pull, then release from rest)", min: 0.01, max: 0.2, step: 0.01, value: st.A, unit: "m", onInput: (v) => { st.A = v; draw(); } });
  controls.append(sk, sm, sA, sT, row(playButton(anim), speedSelect((v) => (st.speed = v), "0.1"), button("Worked example", () => { sk.set(200); sm.set(0.5); sA.set(0.1); sT.set(0.05); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const om = Math.sqrt(st.k / st.m), T = TAU / om;
    const X = (t) => st.A * Math.cos(om * t), V = (t) => -om * st.A * Math.sin(om * t), Ac = (t) => -om * om * st.A * Math.cos(om * t);
    const x = X(st.t), v = V(st.t), a = Ac(st.t);
    const { bx } = springStrip(ctx, c, { left: 40, right: w - 40, y: 34, x, A: 0.2, label: `${st.m} kg` });
    const ak = 30 / Math.max(om * om * st.A, 1e-9), vk = 30 / Math.max(om * st.A, 1e-9);
    if (Math.abs(v) * vk > 2) drawArrow(ctx, bx, 6, v * vk, 0, C.v, "v");
    if (Math.abs(a) * ak > 2) drawArrow(ctx, bx, 62, a * ak, 0, C.a, "a");
    const ts = Array.from({ length: 401 }, (_, i) => (TMAX * i) / 400);
    const top = 82, gap = 8, ph = (h - top - 20 - 2 * gap) / 3;
    [[X, "x (m)", C.x, st.A, x], [V, "v (m/s)", C.v, om * st.A, v], [Ac, "a (m/s²)", C.a, om * om * st.A, a]].forEach(([fn, lab, col, mx, cur], i) => {
      const P = panel(ctx, c, { x: 50, y: top + i * (ph + gap), w: w - 62, h: ph }, { t1: TMAX, y0: -mx * 1.25, y1: mx * 1.25, label: lab });
      P.frame({ xLabel: i === 2 });
      P.curve(ts, ts.map(fn), col, 2);
      P.cursor(st.t); P.dot(st.t, cur, col);
    });
    const wrongX = st.A * Math.cos(rad(om * st.t));
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>ω = √(k/m)</th><td><strong>${fmt(om, 2)} rad/s</strong></td><th>T = 2π/ω</th><td>${fmt(T, 3)} s (f = ${fmt(1 / T, 2)} Hz)</td></tr>
        <tr><th>v_max = ωA</th><td>${fmt(om * st.A, 2)} m/s</td><th>a_max = ω²A</th><td>${fmt(om * om * st.A, 1)} m/s²</td></tr>
        <tr><th>At t = ${fmt(st.t, 3)} s: ωt</th><td>${fmt(om * st.t, 3)} rad</td><th>x = A cos(ωt)</th><td><strong>${fmt(x, 4)} m</strong></td></tr>
        <tr><th>v</th><td>${fmt(v, 3)} m/s</td><th>a = −ω²x</th><td>${fmt(a, 2)} m/s²</td></tr>
        <tr><th class="bad">Degree-mode calculator</th><td colspan="3" class="bad">A cos(${fmt(om * st.t, 3)}°) = ${fmt(wrongX, 4)} m (wrong: the angle is in radians)</td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Two amplitudes, same period
// =====================================================================
export function amplitudeRace(el) {
  const { canvas, controls, readout } = shell(el, { title: "Amplitude race", icon: "🏁", canvas: true, wide: true });
  const k = 50;
  const st = { m1: 1, A1: 0.05, m2: 1, A2: 0.1, t: 0, speed: 0.5 };
  const anim = playLoop((dt) => { st.t += dt * st.speed; draw(); });
  const sA = slider({ label: "Bottom block's amplitude", min: 0.02, max: 0.15, step: 0.01, value: st.A2, unit: "m", onInput: (v) => { st.A2 = v; draw(); } });
  const sm = slider({ label: "Bottom block's mass", min: 0.25, max: 4, step: 0.25, value: st.m2, unit: "kg", onInput: (v) => { st.m2 = v; draw(); } });
  controls.append(sA, sm, row(playButton(anim), speedSelect((v) => (st.speed = v), "0.25"), button("Restart together", () => { st.t = 0; draw(); }), button("Same mass again", () => sm.set(1))));
  st.speed = 0.25;
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const o1 = Math.sqrt(k / st.m1), o2 = Math.sqrt(k / st.m2);
    springStrip(ctx, c, { left: 40, right: w - 40, y: h * 0.3, x: st.A1 * Math.cos(o1 * st.t), A: 0.15, color: C.x, label: "1 kg" });
    springStrip(ctx, c, { left: 40, right: w - 40, y: h * 0.72, x: st.A2 * Math.cos(o2 * st.t), A: 0.15, color: C.a, label: `${st.m2} kg` });
    const T1 = TAU / o1, T2 = TAU / o2, same = Math.abs(T1 - T2) < 1e-9;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th></th><th>Top (A = ${st.A1} m)</th><th>Bottom (A = ${fmt(st.A2, 2)} m)</th></tr>
        <tr><th>Period 2π√(m/k)</th><td>${fmt(T1, 3)} s</td><td>${fmt(T2, 3)} s</td></tr>
        <tr><th>Top speed ωA</th><td>${fmt(o1 * st.A1, 2)} m/s</td><td>${fmt(o2 * st.A2, 2)} m/s</td></tr>
      </table>
      <div class="verdict ${same ? "good" : ""}">${same ? "Same k and m: they stay in step whatever the amplitudes. The farther-pulled block simply moves faster." : "Different mass means a different period, so they drift apart. Amplitude never does this."}</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Energy well: K + U = ½kA²
// =====================================================================
export function shmEnergy(el) {
  const { canvas, controls, readout } = shell(el, { title: "SHM energy well", icon: "⚡", canvas: true, tall: true, wide: true });
  const st = { m: 0.5, k: 200, A: 0.1, x: 0.06, dir: -1, t: 0, kick: 3.0 };
  let sx, sA;
  const anim = playLoop((dt) => {
    const om = Math.sqrt(st.k / st.m);
    st.t += dt * 0.1;
    st.x = st.A * Math.cos(om * st.t); st.dir = -Math.sign(Math.sin(om * st.t)) || 1;
    sx.set(+st.x.toFixed(3));
  });
  sx = slider({ label: "Position x", min: -0.2, max: 0.2, step: 0.005, value: st.x, unit: "m", onInput: (v) => { st.x = Math.max(-st.A, Math.min(st.A, v)); draw(); } });
  sA = slider({ label: "Amplitude A", min: 0.02, max: 0.2, step: 0.005, value: st.A, unit: "m", onInput: (v) => { st.A = v; st.x = Math.max(-v, Math.min(v, st.x)); draw(); } });
  const sk = slider({ label: "Spring constant k", min: 20, max: 400, step: 5, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; draw(); } });
  const sm = slider({ label: "Mass m", min: 0.1, max: 4, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } });
  const sKick = slider({ label: "Kick speed at equilibrium", min: 0.5, max: 4, step: 0.1, value: st.kick, unit: "m/s", onInput: (v) => { st.kick = v; } });
  let note = "";
  controls.append(sm, sk, sA, sx, row(playButton(anim, () => { st.t = Math.acos(Math.max(-1, Math.min(1, st.x / st.A))) / Math.sqrt(st.k / st.m); })), sKick,
    row(button("Kick from equilibrium", () => {
      anim.stop();
      const om = Math.sqrt(st.k / st.m), A = st.kick / om;
      note = A > 0.2 ? `That kick needs A = ${fmt(A, 3)} m, past this model's 0.20 m limit.` : `All ${fmt(0.5 * st.m * st.kick ** 2, 2)} J of kinetic energy ends up in the spring at the turning point: A = v/ω = ${fmt(st.kick, 1)}/${fmt(om, 1)} = <strong>${fmt(A, 3)} m</strong>.`;
      sA.set(Math.min(0.2, +A.toFixed(3))); sx.set(0);
    }), button("Worked example", () => { anim.stop(); note = ""; sm.set(0.5); sk.set(200); sA.set(0.1); sx.set(0.06); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const E = 0.5 * st.k * st.A ** 2, U = 0.5 * st.k * st.x ** 2, K = Math.max(0, E - U);
    const om = Math.sqrt(st.k / st.m), v = om * Math.sqrt(Math.max(0, st.A ** 2 - st.x ** 2));
    const gw = w * 0.68, xr = 0.22, Umax = 0.5 * st.k * xr * xr;
    const P = panel(ctx, c, { x: 46, y: 10, w: gw - 50, h: h - 34 }, { t0: -xr, t1: xr, y0: 0, y1: Math.max(E * 1.4, 0.05), label: "U(x) = ½kx² (J) vs. x (m)" });
    P.frame();
    const xs = Array.from({ length: 161 }, (_, i) => -xr + (2 * xr * i) / 160);
    P.curve(xs, xs.map((x) => Math.min(0.5 * st.k * x * x, Umax)), C.U, 2.5);
    ctx.save(); ctx.strokeStyle = c.text; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; P.seg(P.X(-st.A), P.Y(E), P.X(st.A), P.Y(E)); ctx.restore();
    ctx.fillStyle = c.text; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText("E = ½kA²", P.X(st.A) + 4, P.Y(E) + 3);
    // K is the gap between E and U at x
    ctx.save(); ctx.strokeStyle = C.K; ctx.lineWidth = 4; P.seg(P.X(st.x), P.Y(U), P.X(st.x), P.Y(E)); ctx.strokeStyle = C.U; P.seg(P.X(st.x), P.Y(0), P.X(st.x), P.Y(U)); ctx.restore();
    P.dot(st.x, U, c.text, 6);
    const xe = st.A / Math.SQRT2;
    ctx.save(); ctx.strokeStyle = C.eq; ctx.setLineDash([3, 3]); [-xe, xe].forEach((q) => P.seg(P.X(q), P.Y(0), P.X(q), P.Y(E))); ctx.restore();
    ctx.fillStyle = C.eq; ctx.textAlign = "center"; ctx.fillText("K = U", P.X(xe), P.Y(E * 0.5) - 4);
    // bars
    const bx = gw + 10, bw = (w - bx - 16) / 3, by = h - 24, bh = h - 50, sc = bh / Math.max(E, 1e-9);
    [["K", K, C.K], ["U", U, C.U], ["E", E, c.muted]].forEach(([lab, val, col], i) => {
      ctx.fillStyle = col; ctx.fillRect(bx + i * bw + 6, by - val * sc, bw - 12, val * sc);
      ctx.fillStyle = c.text; ctx.textAlign = "center"; ctx.font = "600 11px Inter, sans-serif";
      ctx.fillText(lab, bx + i * bw + bw / 2, by + 14); ctx.font = "10px Inter, sans-serif"; ctx.fillText(`${fmt(val, 2)} J`, bx + i * bw + bw / 2, by - val * sc - 4);
    });
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Total E = ½kA²</th><td><strong>${fmt(E, 3)} J</strong></td><th>ω = √(k/m)</th><td>${fmt(om, 2)} rad/s</td></tr>
        <tr><th>Spring U = ½kx²</th><td>${fmt(U, 3)} J</td><th>Kinetic K = E − U</th><td>${fmt(K, 3)} J</td></tr>
        <tr><th>Speed ω√(A² − x²)</th><td><strong>${fmt(v, 3)} m/s</strong></td><th>K = U at x = ±A/√2</th><td>±${fmt(xe, 4)} m</td></tr>
      </table>${note ? `<p class="small" style="margin-top:8px">${note}</p>` : ""}`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Hanging spring: gravity shifts the center, not the period
// =====================================================================
export function verticalSpring(el) {
  const { canvas, controls, readout } = shell(el, { title: "Hanging spring", icon: "🪀", canvas: true, tall: true });
  const st = { m: 0.4, k: 40, g: G, pull: 0.05, t: 0 };
  const L0 = 0.3;
  const anim = playLoop((dt) => { st.t += dt; draw(); });
  const sm = slider({ label: "Mass m", min: 0.1, max: 1, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; st.t = 0; draw(); } });
  const sk = slider({ label: "Spring constant k", min: 20, max: 200, step: 1, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; st.t = 0; draw(); } });
  const sp = slider({ label: "Pull down below equilibrium, then release", min: 0, max: 0.1, step: 0.005, value: st.pull, unit: "m", onInput: (v) => { st.pull = v; st.t = 0; draw(); } });
  controls.append(row(select([["9.8", "Earth"], ["1.62", "Moon"], ["0", "No gravity (in orbit)"]], "9.8", (v) => { st.g = Number(v); st.t = 0; draw(); })), sm, sk, sp,
    row(playButton(anim, () => {}), button("Worked example", () => { sm.set(0.4); sk.set(40); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const om = Math.sqrt(st.k / st.m), T = TAU / om, dl = (st.m * st.g) / st.k;
    const y = st.pull * Math.cos(om * st.t); // below equilibrium is +
    const s = (h - 70) / (L0 + 0.5 + 0.1), top = 14, cx = w * 0.42;
    const yRelax = top + L0 * s, yEq = yRelax + dl * s, yb = yEq + y * s;
    ctx.fillStyle = c.border; ctx.fillRect(cx - 60, top - 8, 120, 8);
    drawSpring(ctx, cx, top, cx, yb, c.muted, 12, 9);
    block(ctx, cx, yb + 15, 44, 30, C.x, `${st.m} kg`);
    const line = (yy, col, lab) => { ctx.save(); ctx.strokeStyle = col; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(cx - 80, yy); ctx.lineTo(cx + 80, yy); ctx.stroke(); ctx.restore(); ctx.fillStyle = col; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(lab, cx + 84, yy + 3); };
    line(yRelax + 15, c.muted, "relaxed length");
    line(yEq + 15, C.eq, "hanging equilibrium");
    if (dl > 0.005) { ctx.strokeStyle = C.eq; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 90, yRelax + 15); ctx.lineTo(cx - 90, yEq + 15); ctx.stroke(); ctx.fillStyle = C.eq; ctx.textAlign = "right"; ctx.fillText("Δℓ", cx - 94, (yRelax + yEq) / 2 + 18); }
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Stretch at equilibrium Δℓ = mg/k</th><td><strong>${fmt(dl, 3)} m</strong></td></tr>
        <tr><th>Period T = 2π√(m/k)</th><td><strong>${fmt(T, 3)} s</strong> (the same on Earth, the Moon, or in orbit)</td></tr>
        <tr><th>Oscillation</th><td>±${fmt(st.pull, 3)} m about the orange line</td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Weighing an astronaut with a spring
// =====================================================================
export function spaceScale(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spring scale in orbit", canvas: true, wide: true });
  const st = { mode: "practice", m: 61, k: 600, t: 0, timed: null, timing: false, cycles: 0, prevSin: 0 };
  const om = () => Math.sqrt(st.k / st.m);
  const N = 3;
  const reset = () => { anim.stop(); st.t = 0; st.cycles = 0; st.prevSin = 0; st.timed = null; st.timing = false; };
  const anim = playLoop((dt) => {
    st.t += dt;
    const s = Math.sin(om() * st.t);
    if (st.prevSin < 0 && s >= 0) st.cycles++;
    st.prevSin = s;
    if (st.cycles >= N) {
      // stop exactly where the swing started, like pressing the stopwatch
      st.timed = st.t / N; st.t = N * TAU / om(); st.timing = false;
      draw();
      return false;
    }
    draw();
  });
  const mystery = () => 50 + Math.floor(Math.random() * 61); // 50 to 110 kg
  const sm = slider({ label: "Astronaut's mass", min: 40, max: 120, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; reset(); draw(); } });
  const sk = slider({ label: "Spring constant k", min: 200, max: 1200, step: 10, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; reset(); draw(); } });
  const setMode = (mode) => {
    st.mode = mode; modeSel.value = mode;
    sm.hidden = mode === "mystery";
    newBtn.hidden = mode !== "mystery";
    if (mode === "mystery") st.m = mystery(); else st.m = Number(sm.querySelector("input").value);
    reset(); draw();
  };
  const modeSel = select([["practice", "Practice: you choose the mass"], ["mystery", "Mystery astronaut: mass hidden"]], "practice", setMode);
  const timeBtn = button(`Time ${N} oscillations`, () => { reset(); st.timing = true; anim.start(); }, "btn btn-primary btn-sm");
  const newBtn = button("New mystery astronaut", () => { st.m = mystery(); reset(); draw(); });
  const exBtn = button("Worked example (k = 600 N/m)", () => { setMode("practice"); sm.set(61); sk.set(600); });
  newBtn.hidden = true;
  controls.append(row(modeSel), sm, sk, row(timeBtn, newBtn, exBtn));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());

  function astronaut(x, y, c) {
    ctx.lineWidth = 2; ctx.strokeStyle = c.text; ctx.fillStyle = c.surface;
    ctx.beginPath(); ctx.roundRect(x - 17, y - 14, 34, 38, 8); ctx.fill(); ctx.stroke();   // suit
    ctx.beginPath(); ctx.arc(x, y - 30, 17, 0, TAU); ctx.fill(); ctx.stroke();              // helmet
    ctx.fillStyle = c.accent; ctx.beginPath(); ctx.roundRect(x - 11, y - 37, 22, 12, 6); ctx.fill(); // visor
    ctx.fillStyle = c.muted; ctx.fillRect(x - 8, y - 2, 16, 8);                              // chest pack
  }

  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const y = h * 0.5, left = 34, right = w * 0.64, A = 0.15;
    const x = A * Math.cos(om() * st.t);
    ctx.fillStyle = c.muted; ctx.fillRect(left - 10, y - 56, 10, 112); ctx.fillRect(right, y - 56, 10, 112);
    const mid = (left + right) / 2, s = ((right - left) / 2 - 60) / A, bx = mid + x * s;
    drawSpring(ctx, left, y + 4, bx - 17, y + 4, c.text, 9, 8);
    drawSpring(ctx, bx + 17, y + 4, right, y + 4, c.text, 9, 8);
    astronaut(bx, y, c);
    ctx.fillStyle = c.muted; ctx.font = "13px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("astronaut held between two springs", mid, y + 78);
    // the bathroom scale that reads zero
    const sx = w * 0.83, sy = y;
    ctx.fillStyle = c.surface; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(sx - 56, sy - 32, 112, 64, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = "600 22px JetBrains Mono, monospace"; ctx.fillText("0.0 kg", sx, sy + 8);
    ctx.fillStyle = c.muted; ctx.font = "13px Inter, sans-serif"; ctx.fillText("bathroom scale in orbit", sx, sy + 56);
    // stopwatch
    ctx.fillStyle = c.text; ctx.font = "600 16px JetBrains Mono, monospace";
    ctx.fillText(st.timing ? `${fmt(st.t, 2)} s` : st.timed ? `${fmt(st.timed * N, 2)} s` : "0.00 s", mid, 30);
    ctx.fillStyle = c.muted; ctx.font = "13px Inter, sans-serif";
    ctx.fillText(st.timing ? `oscillation ${Math.min(st.cycles + 1, N)} of ${N}` : st.timed ? `${N} oscillations` : "stopwatch", mid, 48);

    const mMeasured = st.timed ? (st.k * st.timed ** 2) / (4 * Math.PI ** 2) : null;
    const reveal = st.mode === "mystery"
      ? `<tr><th>Actual mass</th><td>${mMeasured ? `${st.m} kg (your measurement is off by ${fmt(Math.abs(mMeasured - st.m) / st.m * 100, 1)}%)` : "hidden until you measure"}</td></tr>`
      : "";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Period T (${N} oscillations ÷ ${N})</th><td>${st.timing ? "timing…" : st.timed ? `<strong>${fmt(st.timed, 2)} s</strong>` : `press “Time ${N} oscillations”`}</td></tr>
        <tr><th>Mass from the period, m = kT²/(4π²)</th><td>${mMeasured ? `(${st.k})(${fmt(st.timed, 2)})²/(4π²) = <strong>${fmt(mMeasured, 1)} kg</strong>` : "—"}</td></tr>
        ${reveal}
      </table>
      <p class="small note">The bathroom scale reads zero because everything is in free fall. The springs still push back, so the oscillation still works: a heavier astronaut swings more slowly.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Pendulum lab: exact motion vs. the small-angle formula
// =====================================================================
export function pendulumLab(el) {
  const { canvas, controls, readout } = shell(el, { title: "Pendulum lab", icon: "🕰️", canvas: true, tall: true, wide: true });
  const st = { L: 1, g: G, amp: 10, t: 0, s: { th: rad(10), w: 0 } };
  const reset = () => { st.t = 0; st.s = { th: rad(st.amp), w: 0 }; };
  const anim = playLoop((dt) => {
    const n = 8; for (let i = 0; i < n; i++) pendStep(st.s, st.g, st.L, dt / n);
    st.t += dt; draw();
  });
  const sL = slider({ label: "Length L", min: 0.1, max: 3, step: 0.05, value: st.L, unit: "m", onInput: (v) => { st.L = v; reset(); draw(); } });
  const sa = slider({ label: "Release angle", min: 1, max: 170, step: 1, value: st.amp, unit: "°", onInput: (v) => { st.amp = v; reset(); draw(); } });
  const gSel = select(GRAV, "9.8", (v) => { st.g = Number(v); reset(); draw(); });
  controls.append(row(gSel), sL, sa, row(playButton(anim), button("Restart", () => { reset(); draw(); }), button("Small swing", () => sa.set(10)), button("Big swing", () => sa.set(90))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const om = Math.sqrt(st.g / st.L), T0 = TAU / om, Tx = exactPendulumT(st.L, st.g, rad(st.amp));
    const px = w * 0.5, py = h * 0.42, Lpx = Math.max(24, (st.L / 3) * Math.min(h * 0.55, w * 0.42));
    ctx.fillStyle = c.border; ctx.fillRect(px - 40, py - 6, 80, 6);
    ctx.save(); ctx.strokeStyle = c.border; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(px, py, Lpx, Math.PI / 2 - rad(st.amp), Math.PI / 2 + rad(st.amp)); ctx.stroke(); ctx.restore();
    drawPendulum(ctx, c, px, py, Lpx, rad(st.amp) * Math.cos(om * st.t), 10, C.ghost, true);
    drawPendulum(ctx, c, px, py, Lpx, st.s.th, 11, C.bob, false);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("solid: exact motion   faint: small-angle SHM", 10, h - 10);
    const diff = (Tx / T0 - 1) * 100;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Small-angle period 2π√(L/g)</th><td><strong>${fmt(T0, 3)} s</strong></td></tr>
        <tr><th>True period at ${st.amp}°</th><td>${fmt(Tx, 3)} s (${fmt(diff, diff < 1 ? 2 : 1)}% longer)</td></tr>
        <tr><th>ω = √(g/L)</th><td>${fmt(om, 2)} rad/s</td></tr>
        <tr><th>sin θ vs. θ at the release angle</th><td>${fmt(Math.sin(rad(st.amp)), 4)} vs. ${fmt(rad(st.amp), 4)}</td></tr>
      </table>
      <div class="verdict ${diff < 0.5 ? "good" : diff > 5 ? "bad" : ""}">${diff < 0.5 ? "Small swing: the formula is excellent." : diff > 5 ? "Big swing: sin θ ≈ θ fails, and the small-angle formula underestimates the period." : "Getting large: the formula is starting to drift."}</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Two pendulums: mass and small amplitude don't matter, length does
// =====================================================================
export function pendulumRace(el) {
  const { canvas, controls, readout } = shell(el, { title: "Pendulum race", icon: "🏁", canvas: true, wide: true });
  const A = { L: 1, m: 1, amp: 8 }, B = { L: 1, m: 5, amp: 12 };
  let sa, sb, t = 0;
  const reset = () => { sa = { th: rad(A.amp), w: 0 }; sb = { th: rad(B.amp), w: 0 }; t = 0; };
  reset();
  const anim = playLoop((dt) => { for (let i = 0; i < 8; i++) { pendStep(sa, G, A.L, dt / 8); pendStep(sb, G, B.L, dt / 8); } t += dt; draw(); });
  const sm = slider({ label: "Right bob's mass", min: 0.2, max: 5, step: 0.1, value: B.m, unit: "kg", onInput: (v) => { B.m = v; draw(); } });
  const sA = slider({ label: "Right bob's release angle", min: 2, max: 15, step: 1, value: B.amp, unit: "°", onInput: (v) => { B.amp = v; reset(); draw(); } });
  const sL = slider({ label: "Right string's length", min: 0.25, max: 2, step: 0.05, value: B.L, unit: "m", onInput: (v) => { B.L = v; reset(); draw(); } });
  controls.append(sm, sA, sL, row(playButton(anim), button("Restart together", () => { reset(); draw(); }), button("Same length again", () => sL.set(1))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const sc = (h - 40) / 2.1, py = 14;
    ctx.fillStyle = c.border; ctx.fillRect(w * 0.1, py - 6, w * 0.8, 6);
    drawPendulum(ctx, c, w * 0.3, py, A.L * sc, sa.th, 6 + Math.sqrt(A.m) * 4, C.x, false);
    drawPendulum(ctx, c, w * 0.7, py, B.L * sc, sb.th, 6 + Math.sqrt(B.m) * 4, C.a, false);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`${A.m} kg, ${A.L} m, ${A.amp}°`, w * 0.3, h - 6); ctx.fillText(`${fmt(B.m, 1)} kg, ${fmt(B.L, 2)} m, ${B.amp}°`, w * 0.7, h - 6);
    const TA = exactPendulumT(A.L, G, rad(A.amp)), TB = exactPendulumT(B.L, G, rad(B.amp));
    const sameL = Math.abs(A.L - B.L) < 1e-9;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Left period</th><td>${fmt(TA, 3)} s</td><th>Right period</th><td>${fmt(TB, 3)} s</td></tr>
      </table>
      <div class="verdict ${sameL ? "good" : ""}">${sameL ? "Same length: they keep step no matter the masses, and small amplitudes barely matter (well under 1%)." : `Different lengths: T ∝ √L, so the ${B.L < A.L ? "shorter right one swings faster" : "longer right one swings slower"}.`}</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Measuring g with a pendulum
// =====================================================================
export function measureG(el) {
  const { canvas, controls, readout } = shell(el, { title: "Measure g", canvas: true, wide: true });
  const PLANETS = [["9.8", "Earth"], ["1.62", "Moon"], ["3.71", "Mars"], ["24.8", "Jupiter"], ["6.4", "Mystery planet A"], ["14.2", "Mystery planet B"]];
  const st = { L: 0.5, g: 9.8, name: "Earth", s: { th: rad(8), w: 0 }, t: 0, timing: false, cycles: 0, prevW: 0, timed: null };
  const N = 5;
  const reset = () => { st.s = { th: rad(8), w: 0 }; st.t = 0; st.cycles = 0; st.prevW = 0; st.timed = null; st.lastCount = 0; st.timing = false; };
  const anim = playLoop((dt) => {
    for (let i = 0; i < 8; i++) {
      pendStep(st.s, st.g, st.L, dt / 8); st.t += dt / 8;
      // a full cycle ends each time the bob turns around at the release side (w goes from + to −)
      if (st.timing && st.prevW > 0 && st.s.w <= 0 && st.s.th > 0 && st.t - st.lastCount > 0.6 * TAU * Math.sqrt(st.L / st.g)) { st.cycles++; st.lastCount = st.t; if (st.cycles >= N) { st.timing = false; st.timed = st.t / N; } }
      st.prevW = st.s.w;
    }
    draw();
  });
  controls.append(
    row(select(PLANETS, "9.8", (v) => { st.g = Number(v); st.name = PLANETS.find((p) => p[0] === v)[1]; anim.stop(); reset(); draw(); })),
    slider({ label: "Pendulum length L", min: 0.1, max: 2, step: 0.05, value: st.L, unit: "m", onInput: (v) => { st.L = v; anim.stop(); reset(); draw(); } }),
    row(button(`Time ${N} swings`, () => { reset(); st.timing = true; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const px = w * 0.3, py = 16, Lpx = (st.L / 2) * (h - 50) + 10;
    ctx.fillStyle = c.border; ctx.fillRect(px - 40, py - 6, 80, 6);
    drawPendulum(ctx, c, px, py, Lpx, st.s.th, 10, C.bob, false);
    ctx.fillStyle = c.text; ctx.font = "600 22px JetBrains Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText(`${fmt(st.t, 2)} s`, w * 0.72, h * 0.42);
    ctx.fillStyle = c.muted; ctx.font = "13px Inter, sans-serif";
    ctx.fillText(st.timing ? `swing ${Math.min(st.cycles + 1, N)} of ${N}` : st.timed ? "done" : "stopwatch", w * 0.72, h * 0.42 + 20);
    const mystery = st.name.startsWith("Mystery");
    const gm = st.timed ? (4 * Math.PI ** 2 * st.L) / st.timed ** 2 : null;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Measured period T (${N} swings ÷ ${N})</th><td>${st.timed ? `<strong>${fmt(st.timed, 3)} s</strong>` : "—"}</td></tr>
        <tr><th>g = 4π²L/T²</th><td>${gm ? `4π²(${fmt(st.L, 2)})/(${fmt(st.timed, 3)})² = <strong>${fmt(gm, 2)} m/s²</strong>` : "—"}</td></tr>
        <tr><th>Actual g on ${st.name}</th><td>${st.timed ? `${st.g} m/s²` : mystery ? "hidden until you measure" : `${st.g} m/s²`}</td></tr>
      </table>
      <p class="small note">Pick a world, choose a length, and time ${N} swings, the way you would in lab. Longer strings and weaker gravity both mean slower swings. (The guide's example: L = 0.50 m on Earth gives T ≈ 1.42 s.)</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Spring or pendulum? quiz
// =====================================================================
export function periodTrap(el) {
  quiz(el, {
    title: "Spring or pendulum?",
    icon: "🪤",
    choices: [["spring", "Only the spring's period"], ["pend", "Only the pendulum's period"], ["neither", "Neither"]],
    items: [
      { text: "You double the mass of the block and of the bob.", answer: "spring", why: "T = 2π√(m/k) contains m. The pendulum's T = 2π√(L/g) doesn't." },
      { text: "You take both to the Moon.", answer: "pend", why: "Only the pendulum depends on g. Its period grows by √(9.80/1.62) ≈ 2.5." },
      { text: "You double the amplitude (keeping the pendulum's swing small).", answer: "neither", why: "In SHM the period doesn't depend on amplitude." },
      { text: "You ride in an elevator that's accelerating upward.", answer: "pend", why: "The pendulum feels a larger effective g and speeds up. The spring's center shifts, but its period stays √(m/k)." },
      { text: "You take both onto an orbiting space station.", answer: "pend", why: "In free fall the pendulum doesn't swing at all. The spring still works, which is how astronauts measure their mass." },
    ],
  });
}

// =====================================================================
// Physical pendulum: a rod with a movable pivot
// =====================================================================
export function physicalPendulum(el) {
  const { canvas, controls, readout } = shell(el, { title: "Swinging rod", icon: "📐", canvas: true, tall: true, wide: true });
  const st = { L: 1, p: 0, t: 0 };
  const anim = playLoop((dt) => { st.t += dt; draw(); });
  let sp;
  const build = () => {
    controls.innerHTML = "";
    sp = slider({ label: "Pivot distance from the top end", min: 0, max: st.L, step: 0.01, value: Math.min(st.p, st.L), unit: "m", onInput: (v) => { st.p = v; st.t = 0; draw(); } });
    controls.append(
      slider({ label: "Rod length L", min: 0.2, max: 2, step: 0.05, value: st.L, unit: "m", onInput: (v) => { st.L = v; st.p = Math.min(st.p, v); build(); } }),
      sp, row(playButton(anim), button("End pivot (1.0 m rod)", () => { st.L = 1; st.p = 0; build(); }), button("Pivot at 0.25 m", () => { st.L = 1; st.p = 0.25; build(); }), button("Leg (0.90 m)", () => { st.L = 0.9; st.p = 0; build(); })),
    );
    draw();
  };
  const period = (p) => { const d = Math.abs(st.L / 2 - p); if (d < 0.004) return Infinity; const I = st.L ** 2 / 12 + d * d; return TAU * Math.sqrt(I / (G * d)); };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const d = Math.abs(st.L / 2 - st.p), I = st.L ** 2 / 12 + d * d, T = period(st.p), Leq = d > 0.004 ? I / d : Infinity;
    const left = w * 0.42, s = (h * 0.42) / Math.max(st.L, 0.5), px = left * 0.32, py = h * 0.5;
    const th = Number.isFinite(T) ? rad(10) * Math.cos((TAU / T) * st.t) : 0;
    // rod: from pivot, the top end is at -p along the rod, bottom end at L-p
    const ux = Math.sin(th), uy = Math.cos(th);
    ctx.strokeStyle = "#8d6e63"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(px - ux * st.p * s, py - uy * st.p * s); ctx.lineTo(px + ux * (st.L - st.p) * s, py + uy * (st.L - st.p) * s); ctx.stroke(); ctx.lineCap = "butt";
    const cmS = st.L / 2 - st.p;
    ctx.fillStyle = C.eq; ctx.beginPath(); ctx.arc(px + ux * cmS * s, py + uy * cmS * s, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("rod", px, h - 20);
    if (Number.isFinite(Leq) && Leq * s < h * 0.9) {
      const qx = left * 0.75, qy = 14, ql = Leq * s;
      ctx.fillStyle = c.border; ctx.fillRect(qx - 20, qy - 5, 40, 5);
      drawPendulum(ctx, c, qx, qy, ql, th, 8, C.bob, false);
      ctx.fillStyle = c.muted; ctx.fillText("same-T pendulum", qx, h - 20); ctx.fillText(`(${fmt(Leq, 2)} m)`, qx, h - 8);
    }
    const ps = Array.from({ length: 201 }, (_, i) => (st.L * i) / 200), Ts = ps.map(period);
    const yTop = Math.max(3, period(0) * 2.5);
    const P = panel(ctx, c, { x: left + 40, y: 10, w: w - left - 52, h: h - 34 }, { t1: st.L, y0: 0, y1: yTop, label: "period T (s) vs. pivot position (m)" });
    P.frame();
    ctx.save(); ctx.beginPath(); ctx.rect(left + 40, 10, w - left - 52, h - 34); ctx.clip();
    const half = (arr, cond) => [ps.filter((_, i) => cond(i)), Ts.filter((_, i) => cond(i)).map((v) => Math.min(v, yTop * 2))];
    P.curve(...half(ps, (i) => ps[i] < st.L / 2 - 0.004), C.x, 2);
    P.curve(...half(ps, (i) => ps[i] > st.L / 2 + 0.004), C.x, 2);
    ctx.restore();
    if (Number.isFinite(T) && T <= yTop) P.dot(st.p, T, C.a);
    readout.innerHTML = Number.isFinite(T) ? `
      <table class="mini-table">
        <tr><th>Pivot to center of mass d</th><td>${fmt(d, 3)} m</td></tr>
        <tr><th>I about pivot = ML²/12 + Md²</th><td>${fmt(I, 4)} M</td></tr>
        <tr><th>T = 2π√(I/(Mgd))</th><td><strong>${fmt(T, 3)} s</strong></td></tr>
        <tr><th>Simple pendulum of length L</th><td>${fmt(TAU * Math.sqrt(st.L / G), 3)} s</td></tr>
        <tr><th>Equivalent simple-pendulum length I/(Md)</th><td>${fmt(Leq, 3)} m</td></tr>
      </table>` : `<div class="verdict bad">Pivot at the center of mass: gravity has no lever arm, so there's no restoring torque and no oscillation.</div>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Damped oscillator: under-, critically, and overdamped
// =====================================================================
export function dampedOscillator(el) {
  const { canvas, controls, readout } = shell(el, { title: "Damped oscillator", icon: "🛞", canvas: true, tall: true, wide: true });
  const m = 1, w0 = TAU, TMAX = 10;
  const bc = 2 * m * w0;
  const st = { b: 1, t: 0 };
  const anim = playLoop((dt) => { st.t += dt; if (st.t >= TMAX) { st.t = TMAX; draw(); return false; } draw(); });
  const sb = slider({ label: "Damping constant b", min: 0, max: 30, step: 0.1, value: st.b, unit: "kg/s", onInput: (v) => { st.b = v; st.t = 0; draw(); } });
  controls.append(sb, row(button("▶ Release", () => { st.t = 0; anim.start(); }, "btn btn-primary btn-sm"),
    button("Underdamped", () => sb.set(1)), button("Critical", () => sb.set(+bc.toFixed(1))), button("Overdamped", () => sb.set(28)), button("b/2m = 0.10 s⁻¹", () => sb.set(0.2))));
  const xOf = (t) => {
    const g = st.b / (2 * m);
    if (Math.abs(g - w0) < 0.05) return (1 + g * t) * Math.exp(-g * t);
    if (g < w0) { const wd = Math.sqrt(w0 * w0 - g * g); return Math.exp(-g * t) * (Math.cos(wd * t) + (g / wd) * Math.sin(wd * t)); }
    const q = Math.sqrt(g * g - w0 * w0), r1 = -g + q, r2 = -g - q;
    return (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const g = st.b / (2 * m);
    const regime = Math.abs(g - w0) < 0.05 ? "critical" : g < w0 ? "under" : "over";
    springStrip(ctx, c, { left: 40, right: w - 40, y: 30, x: xOf(st.t), A: 1, color: C.x });
    const P = panel(ctx, c, { x: 46, y: 64, w: w - 58, h: h - 88 }, { t1: TMAX, y0: -1.15, y1: 1.15, label: "x / x₀ vs. t (s)" });
    P.frame();
    const ts = Array.from({ length: 801 }, (_, i) => (TMAX * i) / 800);
    if (regime === "under" && g > 0) {
      ctx.save(); ctx.setLineDash([5, 4]);
      P.curve(ts, ts.map((t) => Math.exp(-g * t)), C.eq, 1.5); P.curve(ts, ts.map((t) => -Math.exp(-g * t)), C.eq, 1.5);
      ctx.restore();
    }
    P.curve(ts, ts.map(xOf), c.border, 1.5);
    P.curve(ts, ts.map(xOf), C.x, 2.5, st.t);
    P.dot(st.t, xOf(st.t), C.x);
    const names = { under: "Underdamped: it oscillates while the amplitude shrinks.", critical: "Critically damped: back to equilibrium as fast as possible, with no overshoot. Car suspensions aim for this.", over: "Overdamped: it creeps back slowly, with no oscillation, like a door closer." };
    const wd = regime === "under" ? Math.sqrt(w0 * w0 - g * g) : null;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>b/2m</th><td>${fmt(g, 2)} s⁻¹</td><th>Critical damping b = 2mω₀</th><td>${fmt(bc, 1)} kg/s</td></tr>
        <tr><th>Undamped ω₀ = √(k/m)</th><td>${fmt(w0, 2)} rad/s</td><th>Damped ω′</th><td>${wd ? `${fmt(wd, 3)} rad/s (slower)` : "no oscillation"}</td></tr>
        ${regime === "under" ? `<tr><th>Amplitude after 10 s, e^(−(b/2m)·10)</th><td colspan="3"><strong>${fmt(Math.exp(-g * 10) * 100, 1)}%</strong> of the start</td></tr>` : ""}
      </table>
      <div class="verdict ${regime === "critical" ? "good" : ""}">${names[regime]}</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Driven oscillator: resonance curve and live build-up
// =====================================================================
export function resonance(el) {
  const { canvas, controls, readout } = shell(el, { title: "Resonance", icon: "📻", canvas: true, tall: true, wide: true });
  const m = 1, w0 = TAU;
  const st = { fd: 0.5, b: 0.5, s: { x: 0, v: 0 }, t: 0 };
  const ratio = (fd, b) => { const wd = TAU * fd; return (w0 * w0) / Math.sqrt((w0 * w0 - wd * wd) ** 2 + (b * wd / m) ** 2); };
  const restart = () => { st.s = { x: 0, v: 0 }; st.t = 0; };
  const anim = playLoop((dt) => {
    const n = 10, h = dt / n, wd = TAU * st.fd;
    for (let i = 0; i < n; i++) {
      const acc = (x, v, t) => -w0 * w0 * x - (st.b / m) * v + w0 * w0 * Math.cos(wd * t); // F0/k = 1 unit
      const { x, v } = st.s, t = st.t;
      const k1x = v, k1v = acc(x, v, t);
      const k2x = v + (h / 2) * k1v, k2v = acc(x + (h / 2) * k1x, v + (h / 2) * k1v, t + h / 2);
      const k3x = v + (h / 2) * k2v, k3v = acc(x + (h / 2) * k2x, v + (h / 2) * k2v, t + h / 2);
      const k4x = v + h * k3v, k4v = acc(x + h * k3x, v + h * k3v, t + h);
      st.s.x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x); st.s.v += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v); st.t += h;
    }
    draw();
  });
  const sf = slider({ label: "Driving frequency f_d", min: 0.1, max: 3, step: 0.01, value: st.fd, unit: "Hz", onInput: (v) => { st.fd = v; restart(); draw(); } });
  const sb = slider({ label: "Damping b", min: 0.2, max: 5, step: 0.1, value: st.b, unit: "kg/s", onInput: (v) => { st.b = v; restart(); draw(); } });
  controls.append(sf, sb, row(playButton(anim, restart), button("Match the natural frequency", () => sf.set(1)), button("Way off (2.5 Hz)", () => sf.set(2.5))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors(), { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const fs = Array.from({ length: 300 }, (_, i) => 0.1 + (2.9 * i) / 299), rs = fs.map((f) => ratio(f, st.b));
    const peak = Math.max(...rs), r = ratio(st.fd, st.b);
    // live block, scaled so the resonance peak fills the track
    const left = 40, right = w - 40, y = 30, eqX = (left + right) / 2, half = (right - left) / 2 - 40;
    const drv = Math.cos(TAU * st.fd * st.t);
    ctx.fillStyle = C.eq; ctx.fillRect(left - 12 + drv * 6, y - 18, 8, 36);
    drawSpring(ctx, left - 4 + drv * 6, y, eqX + (st.s.x / peak) * half - 20, y, c.muted, 9, 7);
    block(ctx, eqX + (st.s.x / peak) * half, y, 40, 30, C.x);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText("driver", left - 14, y + 30);
    const P = panel(ctx, c, { x: 50, y: 64, w: w - 62, h: h - 88 }, { t0: 0, t1: 3, y0: 0, y1: peak * 1.12, label: "steady amplitude ÷ static stretch vs. f_d (Hz)" });
    P.frame();
    ctx.save(); ctx.strokeStyle = C.eq; ctx.setLineDash([4, 4]); P.seg(P.X(1), P.Y(0), P.X(1), P.Y(peak * 1.12)); ctx.restore();
    ctx.fillStyle = C.eq; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText("natural f₀", P.X(1) + 6, P.Y(peak * 0.45));
    P.curve(fs, rs, C.x, 2.5);
    P.dot(st.fd, r, C.a, 6);
    const near = Math.abs(st.fd - 1) < 0.05;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Natural frequency f₀</th><td>1.00 Hz</td><th>Driving frequency f_d</th><td>${fmt(st.fd, 2)} Hz</td></tr>
        <tr><th>Steady amplitude</th><td><strong>${fmt(r, r < 10 ? 2 : 1)}×</strong> the static stretch</td><th>Peak for this damping</th><td>${fmt(peak, 1)}×</td></tr>
      </table>
      <div class="verdict ${near ? "bad" : ""}">${near ? "Resonance: each push lands in step with the motion, so energy builds until damping can match it." : st.fd < 1 ? "Driven slower than f₀: the mass just follows the driver with modest motion." : "Driven faster than f₀: the mass can't keep up, and the motion stays small."} Press Play to watch the motion build up from rest.</div>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}
