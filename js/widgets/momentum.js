// Unit 8 widgets: momentum, impulse, collisions, center of mass, rockets.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { plane, fmt, rad, deg } from "./plane.js";
import { shell, button, row, checkbox } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const A_COL = "#2f80ed", B_COL = "#eb5757", T_COL = "#16a34a";
const num = (v, d = 0) => Number(v.toFixed(d)).toLocaleString(undefined, { maximumFractionDigits: d }).replace("-", "−");

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

// Signed horizontal bars (e.g. momenta before and after) inside a rectangle.
function signedBars(ctx, c, rect, rows, max) {
  const { x, y, w, h } = rect;
  const mid = x + w / 2, rh = Math.min(22, h / rows.length - 6);
  ctx.save();
  ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(mid, y); ctx.lineTo(mid, y + h); ctx.stroke();
  rows.forEach(([label, val, color], i) => {
    const yy = y + i * (rh + 6) + 4;
    const len = (val / (max || 1)) * (w / 2 - 6);
    ctx.fillStyle = color; ctx.fillRect(Math.min(mid, mid + len), yy, Math.abs(len), rh);
    ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = val >= 0 ? "right" : "left";
    ctx.fillText(label, val >= 0 ? mid - 6 : mid + 6, yy + rh / 2 + 4);
    ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = val >= 0 ? "left" : "right";
    ctx.fillText(num(val, Math.abs(val) < 10 ? 2 : 0), mid + len + (val >= 0 ? 4 : -4), yy + rh / 2 + 4);
  });
  ctx.restore();
}

// =====================================================================
// Impulse as the area under the F-t graph
// =====================================================================
export function impulseFt(el) {
  const { canvas, controls, readout } = shell(el, { title: "Impulse as an area", icon: "⚾", canvas: true, wide: true });
  const st = { m: 0.145, v1: -40, v2: 50, dt: 1.5 };
  let wrong = false;
  const sl = {
    m: slider({ label: "Mass", min: 0.05, max: 1, step: 0.005, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    v1: slider({ label: "Velocity before (+ = outgoing)", min: -60, max: 60, step: 1, value: st.v1, unit: "m/s", onInput: (v) => { st.v1 = v; draw(); } }),
    v2: slider({ label: "Velocity after", min: -60, max: 60, step: 1, value: st.v2, unit: "m/s", onInput: (v) => { st.v2 = v; draw(); } }),
    dt: slider({ label: "Contact time", min: 0.5, max: 20, step: 0.1, value: st.dt, unit: "ms", onInput: (v) => { st.dt = v; draw(); } }),
  };
  controls.append(sl.m, sl.v1, sl.v2, sl.dt, row(button("Baseball example", () => { sl.m.set(0.145); sl.v1.set(-40); sl.v2.set(50); sl.dt.set(1.5); })), checkbox('Show the "forget the sign" mistake', wrong, (v) => { wrong = v; draw(); }));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const J = st.m * (st.v2 - st.v1), T = st.dt / 1000, Favg = J / T, Fpk = (Math.PI * J) / (2 * T);
    const Jwrong = st.m * (Math.abs(st.v2) - Math.abs(st.v1));
    // ball before/after
    const by = 22;
    drawArrow(ctx, w * 0.3, by, (st.v1 / 60) * 70, 0, c.muted, `before ${st.v1} m/s`);
    drawArrow(ctx, w * 0.7, by, (st.v2 / 60) * 70, 0, A_COL, `after ${st.v2} m/s`);
    const ts = Array.from({ length: 101 }, (_, i) => (st.dt * 1.3 * i) / 100);
    const F = (t) => (t <= st.dt ? Fpk * Math.sin((Math.PI * t) / st.dt) : 0);
    const ymax = Math.max(Math.abs(Fpk), 1) * 1.15;
    const P = panel(ctx, c, { x: 56, y: 46, w: w - 68, h: h - 70 }, { t1: st.dt * 1.3, y0: Math.min(0, -ymax * (Fpk < 0)), y1: Fpk >= 0 ? ymax : 0.1, label: "F (N) vs. t (ms)" });
    P.frame();
    P.area(ts, ts.map(F), st.dt * 1.3, "rgba(47,128,237,.3)", "rgba(235,87,87,.3)");
    P.curve(ts, ts.map(F), A_COL);
    ctx.save(); ctx.strokeStyle = c.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.strokeRect(P.X(0), P.Y(Math.max(Favg, 0)), P.X(st.dt) - P.X(0), Math.abs(P.Y(Favg) - P.Y(0)));
    ctx.restore();
    ctx.fillStyle = c.text; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`average F = ${num(Favg)} N`, P.X(st.dt) + 6, P.Y(Favg) + 4);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Δv = v₂ − v₁</th><td>${fmt(st.v2, 0)} − (${fmt(st.v1, 0)}) = <strong>${fmt(st.v2 - st.v1, 0)} m/s</strong></td></tr>
        <tr><th>Impulse J = mΔv = area</th><td><strong>${fmt(J, 2)} kg·m/s</strong></td></tr>
        <tr><th>Average force J/Δt</th><td><strong>${num(Favg)} N</strong></td></tr>
        <tr><th>Peak force (this pulse shape)</th><td>${num(Fpk)} N</td></tr>
        ${wrong ? `<tr><th class="bad">Mistake: using speeds, m(|v₂| − |v₁|)</th><td class="bad"><s>${fmt(Jwrong, 2)} kg·m/s → ${num(Jwrong / T)} N</s></td></tr>` : ""}
      </table>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Airbags: same impulse, longer time, smaller force
// =====================================================================
export function airbag(el) {
  const { canvas, controls, readout } = shell(el, { title: "Why airbags work", icon: "🎈", canvas: true, wide: true });
  const st = { m: 70, v: 15, t: 0.15 };
  controls.append(
    slider({ label: "Driver mass", min: 40, max: 120, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    slider({ label: "Speed", min: 5, max: 35, step: 0.5, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; draw(); } }),
    slider({ label: "Airbag stopping time", min: 0.02, max: 0.3, step: 0.005, value: st.t, unit: "s", onInput: (v) => { st.t = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const dp = st.m * st.v, tD = 0.01;
    const Fd = dp / tD, Fa = dp / st.t;
    const tmax = 0.32, ts = Array.from({ length: 641 }, (_, i) => (tmax * i) / 640);
    const pulse = (T) => (t) => (t <= T ? ((Math.PI * dp) / (2 * T)) * Math.sin((Math.PI * t) / T) : 0);
    const P = panel(ctx, c, { x: 64, y: 10, w: w - 76, h: h - 34 }, { t1: tmax, y0: 0, y1: ((Math.PI * dp) / (2 * tD)) * 1.08, label: "F (N) vs. t (s): equal areas" });
    P.frame();
    P.area(ts, ts.map(pulse(tD)), tmax, "rgba(214,60,60,.3)");
    P.area(ts, ts.map(pulse(st.t)), tmax, "rgba(47,128,237,.3)");
    P.curve(ts, ts.map(pulse(tD)), "#d63c3c");
    P.curve(ts, ts.map(pulse(st.t)), A_COL);
    ctx.fillStyle = "#d63c3c"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText("dashboard (0.010 s)", P.X(tD) + 6, 30);
    ctx.fillStyle = A_COL; ctx.fillText(`airbag (${st.t} s)`, P.X(st.t / 2), P.Y(pulse(st.t)(st.t / 2)) - 8);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Momentum change Δp = mv (fixed)</th><td>${num(dp)} kg·m/s</td></tr>
        <tr><th style="color:#d63c3c">Dashboard: Δp / 0.010 s</th><td><strong>${num(Fd)} N</strong></td></tr>
        <tr><th style="color:${A_COL}">Airbag: Δp / ${st.t} s</th><td><strong>${num(Fa)} N</strong></td></tr>
        <tr><th>Force reduced by</th><td>${fmt(Fd / Fa, 1)}×</td></tr>
      </table>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Push apart / recoil: total momentum stays zero, CM stays put
// =====================================================================
const PUSH = {
  skaters: { label: "Skaters (60 kg, 40 kg)", m1: 60, m2: 40, v2: 3, n1: "60 kg skater", n2: "40 kg skater" },
  boat: { label: "Stepping off a boat", m1: 120, m2: 70, v2: 2, n1: "boat", n2: "person" },
  equal: { label: "Equal masses", m1: 50, m2: 50, v2: 2, n1: "A", n2: "B" },
};
export function pushApart(el) {
  const { canvas, controls, readout } = shell(el, { title: "Push-apart and recoil model", icon: "⛸️", canvas: true, wide: true });
  let p = { ...PUSH.skaters }, t = 0;
  const sl = {};
  const anim = playLoop((dt) => { t = Math.min(3, t + dt); draw(); return t < 3; });
  const build = () => {
    controls.innerHTML = "";
    sl.m1 = slider({ label: `Left: ${p.n1}`, min: 10, max: 200, step: 1, value: p.m1, unit: "kg", onInput: (v) => { p.m1 = v; draw(); } });
    sl.m2 = slider({ label: `Right: ${p.n2}`, min: 10, max: 200, step: 1, value: p.m2, unit: "kg", onInput: (v) => { p.m2 = v; draw(); } });
    sl.v2 = slider({ label: "Right object's speed after the push", min: 0.5, max: 6, step: 0.1, value: p.v2, unit: "m/s", onInput: (v) => { p.v2 = v; draw(); } });
    controls.append(sl.m1, sl.m2, sl.v2,
      row(button("▶ Push", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"), ...Object.entries(PUSH).map(([k, v]) => button(v.label, () => { p = { ...PUSH[k] }; t = 0; build(); }))));
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const v1 = (-p.m2 * p.v2) / p.m1;
    const iceY = h * 0.42, cx = w / 2, s = (w * 0.4) / Math.max(6 * 3, Math.abs(v1) * 3 + 1);
    ctx.fillStyle = "rgba(120,190,255,.2)"; ctx.fillRect(0, iceY, w, 6);
    const r = (m) => 10 + Math.sqrt(m) * 1.6;
    const x1 = cx - r(p.m1) + v1 * t * s, x2 = cx + r(p.m2) + p.v2 * t * s;
    ctx.fillStyle = A_COL; ctx.beginPath(); ctx.arc(x1, iceY - r(p.m1), r(p.m1), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = B_COL; ctx.beginPath(); ctx.arc(x2, iceY - r(p.m2), r(p.m2), 0, Math.PI * 2); ctx.fill();
    // center of mass stays at the starting point
    const xcm = (p.m1 * x1 + p.m2 * x2) / (p.m1 + p.m2);
    ctx.strokeStyle = c.text; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(xcm - 7, iceY + 16); ctx.lineTo(xcm + 7, iceY + 30); ctx.moveTo(xcm + 7, iceY + 16); ctx.lineTo(xcm - 7, iceY + 30); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("center of mass", xcm, iceY + 42);
    if (t > 0) {
      drawArrow(ctx, x1, iceY - 2 * r(p.m1) - 10, v1 * 14, 0, A_COL, `${fmt(v1, 2)} m/s`);
      drawArrow(ctx, x2, iceY - 2 * r(p.m2) - 10, p.v2 * 14, 0, B_COL, `+${fmt(p.v2, 2)} m/s`);
    }
    const pmax = Math.max(p.m2 * p.v2, 1);
    signedBars(ctx, c, { x: w * 0.15, y: h * 0.62, w: w * 0.7, h: h * 0.36 }, [[`p ${p.n1}`, p.m1 * v1, A_COL], [`p ${p.n2}`, p.m2 * p.v2, B_COL], ["total", 0, T_COL]], pmax);
    readout.innerHTML = `
      <div class="conv-chain">0 = (${p.m2})(${fmt(p.v2, 1)}) + (${p.m1})v → v = <strong>${fmt(v1, 2)} m/s</strong></div>
      <p class="small" style="margin-top:8px">The ${p.n1} moves ${Math.abs(v1) < p.v2 ? "slower" : Math.abs(v1) > p.v2 ? "faster" : "just as fast"}, in the opposite direction. The momenta are ${num(Math.abs(p.m1 * v1), 1)} kg·m/s each way, so the total stays zero and the center of mass never moves.</p>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// 1D collision lab: any mix of elastic and inelastic (coefficient e)
// =====================================================================
const COLL = {
  "rear-end": { label: "Rear-end crash (sticks)", mA: 1200, mB: 800, vA: 20, vB: 10, e: 0, unit: "kg" },
  "elastic-carts": { label: "Elastic carts (0.50 kg → 1.0 kg)", mA: 0.5, mB: 1, vA: 3, vB: 0, e: 1, unit: "kg" },
  "head-on": { label: "Head-on, half bouncy", mA: 2, mB: 3, vA: 4, vB: -2, e: 0.5, unit: "kg" },
};
export function collision1d(el, data) {
  const { canvas, controls, readout } = shell(el, { title: "1D collision lab", icon: "💥", canvas: true, wide: true });
  let p = { ...COLL[data.preset || "rear-end"] }, t = -2;
  const big = () => p.mA >= 100 || p.mB >= 100;
  const after = () => {
    const M = p.mA + p.mB, P = p.mA * p.vA + p.mB * p.vB, rel = p.vA - p.vB;
    return { vA2: (P - p.mB * p.e * rel) / M, vB2: (P + p.mA * p.e * rel) / M };
  };
  const anim = playLoop((dt) => { t = Math.min(2, t + dt * 0.8); draw(); return t < 2; });
  const build = () => {
    controls.innerHTML = "";
    const mMax = big() ? 3000 : 5, mStep = big() ? 50 : 0.1, vMax = big() ? 30 : 8;
    controls.append(
      slider({ label: "Mass A (left)", min: mStep, max: mMax, step: mStep, value: p.mA, unit: "kg", onInput: (v) => { p.mA = v; draw(); } }),
      slider({ label: "Mass B (right)", min: mStep, max: mMax, step: mStep, value: p.mB, unit: "kg", onInput: (v) => { p.mB = v; draw(); } }),
      slider({ label: "Velocity of A before", min: -vMax, max: vMax, step: 0.5, value: p.vA, unit: "m/s", onInput: (v) => { p.vA = v; draw(); } }),
      slider({ label: "Velocity of B before", min: -vMax, max: vMax, step: 0.5, value: p.vB, unit: "m/s", onInput: (v) => { p.vB = v; draw(); } }),
      slider({ label: "Bounciness e (0 = stick, 1 = elastic)", min: 0, max: 1, step: 0.05, value: p.e, onInput: (v) => { p.e = v; draw(); } }),
      row(button("▶ Collide", () => { t = -2; anim.start(); }, "btn btn-primary btn-sm"), ...Object.entries(COLL).map(([k, v]) => button(v.label, () => { p = { ...COLL[k] }; t = -2; build(); }))),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const { vA2, vB2 } = after();
    const approaching = p.vA > p.vB;
    const vmax = Math.max(Math.abs(p.vA), Math.abs(p.vB), Math.abs(vA2), Math.abs(vB2), 1);
    const s = (w * 0.22) / (vmax * 2), cx = w / 2, trackY = h * 0.34;
    ctx.fillStyle = c.border; ctx.fillRect(10, trackY, w - 20, 4);
    const tt = approaching ? t : Math.min(t, 0);
    const xA = tt < 0 ? p.vA * tt : vA2 * tt, xB = tt < 0 ? p.vB * tt : vB2 * tt;
    const bw = (m) => 30 + 20 * Math.min(1, Math.cbrt(m / (big() ? 3000 : 5)));
    const wA = bw(p.mA), wB = bw(p.mB);
    ctx.fillStyle = A_COL; ctx.fillRect(cx + xA * s - wA, trackY - 26, wA, 26);
    ctx.fillStyle = B_COL; ctx.fillRect(cx + xB * s, trackY - 26, wB, 26);
    ctx.fillStyle = "#fff"; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("A", cx + xA * s - wA / 2, trackY - 9); ctx.fillText("B", cx + xB * s + wB / 2, trackY - 9);
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif";
    ctx.fillText(t < 0 ? "before" : "after", cx, 16);
    const pA1 = p.mA * p.vA, pB1 = p.mB * p.vB, pA2 = p.mA * vA2, pB2 = p.mB * vB2;
    const K1 = 0.5 * p.mA * p.vA ** 2 + 0.5 * p.mB * p.vB ** 2, K2 = 0.5 * p.mA * vA2 ** 2 + 0.5 * p.mB * vB2 ** 2;
    const pmax = Math.max(Math.abs(pA1), Math.abs(pB1), Math.abs(pA2), Math.abs(pB2), Math.abs(pA1 + pB1), 1e-6);
    signedBars(ctx, c, { x: 10, y: h * 0.5, w: w * 0.48, h: h * 0.48 }, [["p_A before", pA1, A_COL], ["p_B before", pB1, B_COL], ["total before", pA1 + pB1, T_COL], ["total after", pA2 + pB2, T_COL]], pmax);
    // KE bars
    const kx = w * 0.62, kw = w * 0.34, kh = h * 0.4, ky = h * 0.55;
    const K = Math.max(K1, 1e-9);
    [["KE before", K1, "#9b51e0"], ["KE after", K2, "#9b51e0"]].forEach(([label, val, color], i) => {
      const bx = kx + i * (kw / 2) + kw / 8, bh = (val / K) * kh;
      ctx.fillStyle = color; ctx.fillRect(bx, ky + kh - bh, kw / 4, bh);
      ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, bx + kw / 8, ky + kh + 14);
    });
    const kind = p.e >= 0.999 ? "Elastic: KE conserved" : p.e <= 0.001 ? "Perfectly inelastic: they stick" : "Inelastic: some KE lost";
    const J = (v) => (big() ? `${num(v)} J` : `${fmt(v, 2)} J`);
    readout.innerHTML = approaching ? `
      <table class="mini-table">
        <tr><th>After: v_A2, v_B2</th><td><strong>${fmt(vA2, 2)} m/s, ${fmt(vB2, 2)} m/s</strong></td></tr>
        <tr><th>Total momentum before → after</th><td>${num(pA1 + pB1, 2)} → ${num(pA2 + pB2, 2)} kg·m/s</td></tr>
        <tr><th>KE before → after</th><td>${J(K1)} → ${J(K2)}</td></tr>
        <tr><th>KE lost (heat, sound, bent metal)</th><td><strong>${J(K1 - K2)}</strong> (${fmt(K1 ? ((K1 - K2) / K1) * 100 : 0, 0)}%)</td></tr>
      </table>
      <div class="verdict">${kind}. Momentum is conserved either way.</div>` : `<div class="verdict">A isn't catching up to B, so they never collide. Make A's velocity bigger than B's.</div>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// 2D perfectly inelastic collision at an intersection
// =====================================================================
export function collision2d(el) {
  const { canvas, controls, readout } = shell(el, { title: "2D intersection crash", icon: "🚦", canvas: true });
  const st = { m1: 1500, v1: 20, m2: 2500, v2: 12 };
  const sl = {
    m1: slider({ label: "Car mass (heading east)", min: 500, max: 4000, step: 50, value: st.m1, unit: "kg", onInput: (v) => { st.m1 = v; draw(); } }),
    v1: slider({ label: "Car speed", min: 1, max: 35, step: 0.5, value: st.v1, unit: "m/s", onInput: (v) => { st.v1 = v; draw(); } }),
    m2: slider({ label: "Truck mass (heading north)", min: 500, max: 6000, step: 50, value: st.m2, unit: "kg", onInput: (v) => { st.m2 = v; draw(); } }),
    v2: slider({ label: "Truck speed", min: 1, max: 35, step: 0.5, value: st.v2, unit: "m/s", onInput: (v) => { st.v2 = v; draw(); } }),
  };
  controls.append(sl.m1, sl.v1, sl.m2, sl.v2, row(button("Worked example", () => { sl.m1.set(1500); sl.v1.set(20); sl.m2.set(2500); sl.v2.set(12); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const px = st.m1 * st.v1, py = st.m2 * st.v2, M = st.m1 + st.m2;
    const vx = px / M, vy = py / M;
    const ox = w * 0.18, oy = h * 0.82, k = (Math.min(w, h) * 0.6) / Math.max(px, py, Math.hypot(px, py) * 0.8);
    // roads
    ctx.fillStyle = c.border; ctx.fillRect(0, oy - 10, w, 20); ctx.fillRect(ox - 10, 0, 20, h);
    ctx.save(); ctx.lineWidth = 4;
    drawArrow(ctx, ox, oy, px * k, 0, A_COL, "p_car");
    drawArrow(ctx, ox + px * k, oy, 0, -py * k, B_COL, "p_truck");
    drawArrow(ctx, ox, oy, px * k, -py * k, T_COL, "P_total");
    ctx.restore();
    const ang = deg(Math.atan2(vy, vx));
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, 34, -rad(ang), 0); ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`${fmt(ang, 1)}°`, ox + 38, oy - 8);
    const K1 = 0.5 * st.m1 * st.v1 ** 2 + 0.5 * st.m2 * st.v2 ** 2, K2 = 0.5 * M * (vx * vx + vy * vy);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>East: (m₁v₁) = (M)vₓ</th><td>vₓ = ${num(px)} / ${num(M)} = <strong>${fmt(vx, 2)} m/s</strong></td></tr>
        <tr><th>North: (m₂v₂) = (M)vᵧ</th><td>vᵧ = ${num(py)} / ${num(M)} = <strong>${fmt(vy, 2)} m/s</strong></td></tr>
        <tr><th>Wreck's velocity</th><td><strong>${fmt(Math.hypot(vx, vy), 1)} m/s at ${fmt(ang, 1)}° north of east</strong></td></tr>
        <tr><th>KE lost</th><td>${num(K1 - K2)} J (${fmt(((K1 - K2) / K1) * 100, 0)}%)</td></tr>
      </table>
      <p class="small" style="margin-top:8px">Each component is conserved separately; the green total momentum is the tail-to-head sum.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Ballistic pendulum: momentum for the hit, energy for the swing
// =====================================================================
export function ballisticPendulum(el) {
  const { canvas, controls, readout } = shell(el, { title: "Ballistic pendulum", icon: "🎯", canvas: true, wide: true });
  const st = { m: 0.01, v: 300, M: 2 };
  let t = 0;
  controls.append(
    slider({ label: "Bullet mass", min: 0.002, max: 0.05, step: 0.001, value: st.m, unit: "kg", onInput: (v) => { st.m = v; t = 0; draw(); } }),
    slider({ label: "Bullet speed", min: 50, max: 800, step: 10, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; t = 0; draw(); } }),
    slider({ label: "Block mass", min: 0.5, max: 6, step: 0.1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; t = 0; draw(); } }),
    row(button("▶ Fire", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const calc = () => {
    const V = (st.m * st.v) / (st.m + st.M), h = (V * V) / (2 * G);
    const hWrong = (0.5 * st.m * st.v ** 2) / ((st.m + st.M) * G);
    return { V, h, hWrong, lost: 1 - (0.5 * (st.m + st.M) * V * V) / (0.5 * st.m * st.v ** 2) };
  };
  const anim = playLoop((dt) => { t += dt; draw(); return t < 3; });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const r = calc();
    const L = 1.0, px = w * 0.55, py = 16, Lp = h * 0.62;
    const thMax = Math.acos(Math.max(-1, 1 - r.h / L));
    const tHit = 0.4;
    // swing like a pendulum after the hit (small-angle timing is fine for the picture)
    const th = t < tHit ? 0 : thMax * Math.sin(Math.sqrt(G / L) * (t - tHit));
    const bx = px + Lp * Math.sin(th), by = py + Lp * Math.cos(th);
    ctx.fillStyle = c.muted; ctx.fillRect(px - 40, py - 6, 80, 6);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 12, py); ctx.lineTo(bx - 12, by); ctx.moveTo(px + 12, py); ctx.lineTo(bx + 12, by); ctx.stroke();
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(bx - 26, by, 52, 34);
    if (t < tHit) {
      const xb = px - 26 - (1 - t / tHit) * (w * 0.45);
      ctx.fillStyle = "#555"; ctx.fillRect(xb - 10, by + 15, 10, 4);
    }
    ctx.setLineDash([3, 4]); ctx.strokeStyle = c.muted; ctx.beginPath();
    const topY = py + Lp * Math.cos(thMax);
    ctx.moveTo(px - 80, topY + 17); ctx.lineTo(px + Lp * Math.sin(thMax) + 40, topY + 17); ctx.stroke(); ctx.setLineDash([]);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>1. Collision (momentum): mv = (m + M)V</th><td>V = <strong>${fmt(r.V, 2)} m/s</strong></td></tr>
        <tr><th>2. Swing (energy): ½V² = gh</th><td>h = <strong>${fmt(r.h, 3)} m</strong></td></tr>
        <tr><th>KE turned to heat in the hit</th><td>${fmt(r.lost * 100, 1)}%</td></tr>
        <tr><th class="bad">Mistake: energy through the hit</th><td class="bad"><s>h = ${fmt(r.hWrong, 1)} m</s></td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Elastic collision with a target at rest: three limiting cases
// =====================================================================
export function elasticCases(el) {
  const { canvas, controls, readout } = shell(el, { title: "Mass-ratio explorer", icon: "⚖️", canvas: true, wide: true });
  let lr = 0; // log10(mA/mB)
  const sl = slider({ label: "log₁₀(m_A / m_B)", min: -2, max: 2, step: 0.01, value: lr, onInput: (v) => { lr = v; draw(); } });
  controls.append(sl, row(button("Light A hits heavy B", () => sl.set(-1.5)), button("Equal masses", () => sl.set(0)), button("Heavy A hits light B", () => sl.set(1.5)), button("Worked example (0.50 : 1.0)", () => sl.set(+Math.log10(0.5).toFixed(2)))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  const fa = (r) => (r - 1) / (r + 1), fb = (r) => (2 * r) / (r + 1);
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    ctx.clearRect(0, 0, size.w, size.h);
    const xs = Array.from({ length: 201 }, (_, i) => -2 + (4 * i) / 200);
    const P = panel(ctx, c, { x: 44, y: 10, w: size.w - 56, h: size.h - 34 }, { t0: -2, t1: 2, y0: -1.1, y1: 2.1, label: "final velocity ÷ v_A1  vs.  log₁₀(m_A/m_B)" });
    P.frame();
    P.curve(xs, xs.map((x) => fa(10 ** x)), A_COL);
    P.curve(xs, xs.map((x) => fb(10 ** x)), B_COL);
    P.cursor(lr);
    const r = 10 ** lr;
    P.dot(lr, fa(r), A_COL); P.dot(lr, fb(r), B_COL);
    const desc = Math.abs(lr) < 0.03 ? "Equal masses: A stops dead and B takes all of A's velocity." : lr > 1 ? "Heavy A hits light B: A barely slows, and B shoots off at almost twice A's speed." : lr < -1 ? "Light A hits heavy B: A bounces back at almost its original speed, and B barely moves." : lr > 0 ? "A is heavier: both move forward, B faster." : "A is lighter: A bounces back.";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>m_A / m_B</th><td>${fmt(r, r < 0.1 ? 3 : 2)}</td></tr>
        <tr><th style="color:${A_COL}">v_A2 / v_A1 = (m_A − m_B)/(m_A + m_B)</th><td><strong>${fmt(fa(r), 3)}</strong></td></tr>
        <tr><th style="color:${B_COL}">v_B2 / v_A1 = 2m_A/(m_A + m_B)</th><td><strong>${fmt(fb(r), 3)}</strong></td></tr>
      </table>
      <div class="verdict">${desc}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Center-of-mass finder: drag point masses
// =====================================================================
export function cmFinder(el) {
  const { canvas, controls, readout } = shell(el, { title: "Center-of-mass finder", icon: "✖️", canvas: true });
  let pts = [[0, 0, 2], [4, 0, 6], [2, 3, 3]], third = false;
  const COLS = [A_COL, B_COL, "#9b51e0"];
  const p = plane(canvas, { range: 4, snap: 0.5, center: [2, 1], axes: ["x (m)", "y (m)"], onDraw });
  [0, 1, 2].forEach((i) => p.addHandle({ color: COLS[i], get: () => (i < 2 || third ? pts[i] : [999, 999]), set: (x, y) => { pts[i][0] = x; pts[i][1] = y; } }));
  const sl = [0, 1, 2].map((i) => slider({ label: `Mass ${i + 1}`, min: 0.5, max: 10, step: 0.5, value: pts[i][2], unit: "kg", onInput: (v) => { pts[i][2] = v; p.draw(); } }));
  controls.append(sl[0], sl[1], sl[2], checkbox("Include mass 3", third, (v) => { third = v; p.draw(); }), row(button("Worked example", () => { pts[0] = [0, 0, 2]; pts[1] = [4, 0, 6]; sl[0].set(2); sl[1].set(6); third = false; controls.querySelector("input[type=checkbox]").checked = false; p.draw(); })));
  function onDraw(api) {
    const c = api.colors();
    const use = pts.slice(0, third ? 3 : 2);
    const M = use.reduce((s, q) => s + q[2], 0);
    const xc = use.reduce((s, q) => s + q[2] * q[0], 0) / M, yc = use.reduce((s, q) => s + q[2] * q[1], 0) / M;
    use.forEach(([x, y, m], i) => {
      const [sx, sy] = api.S(x, y);
      api.ctx.fillStyle = COLS[i]; api.ctx.globalAlpha = 0.85; api.ctx.beginPath(); api.ctx.arc(sx, sy, 8 + m * 2, 0, Math.PI * 2); api.ctx.fill(); api.ctx.globalAlpha = 1;
      api.label(x, y, `${m} kg`, "#fff");
      api.segment(x, y, xc, yc, c.border, { width: 1 });
    });
    const [cx, cy] = api.S(xc, yc);
    api.ctx.strokeStyle = c.text; api.ctx.lineWidth = 3;
    api.ctx.beginPath(); api.ctx.moveTo(cx - 8, cy - 8); api.ctx.lineTo(cx + 8, cy + 8); api.ctx.moveTo(cx + 8, cy - 8); api.ctx.lineTo(cx - 8, cy + 8); api.ctx.stroke();
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>x_cm = Σmᵢxᵢ / M</th><td>(${use.map((q) => `${q[2]}·${fmt(q[0], 1)}`).join(" + ")}) / ${M} = <strong>${fmt(xc, 2)} m</strong></td></tr>
        <tr><th>y_cm = Σmᵢyᵢ / M</th><td>(${use.map((q) => `${q[2]}·${fmt(q[1], 1)}`).join(" + ")}) / ${M} = <strong>${fmt(yc, 2)} m</strong></td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">Drag the colored dots. The ✕ sits closest to the heaviest mass.</p>`;
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Exploding firework: the CM keeps following the original parabola
// =====================================================================
export function fireworkCm(el) {
  const { canvas, controls, readout } = shell(el, { title: "Exploding firework", icon: "🎆", canvas: true, wide: true });
  let t = 0, v0 = 30, ang = 60, kick = 10;
  const FR = [[1, 1, 0.6], [2, -0.9, 0.2], [1, 0.8, -1]]; // mass, direction x, y (scaled so total momentum = 0)
  // make the burst momenta cancel exactly
  const Mtot = FR.reduce((s, f) => s + f[0], 0);
  const mx = FR.reduce((s, f) => s + f[0] * f[1], 0) / Mtot, my = FR.reduce((s, f) => s + f[0] * f[2], 0) / Mtot;
  const DIR = FR.map(([m, dx, dy]) => [m, dx - mx, dy - my]);
  controls.append(
    slider({ label: "Launch speed", min: 15, max: 40, step: 1, value: v0, unit: "m/s", onInput: (v) => { v0 = v; t = 0; draw(); } }),
    slider({ label: "Launch angle", min: 30, max: 85, step: 1, value: ang, unit: "°", onInput: (v) => { ang = v; t = 0; draw(); } }),
    slider({ label: "Burst strength", min: 0, max: 20, step: 1, value: kick, unit: "m/s", onInput: (v) => { kick = v; t = 0; draw(); } }),
    row(button("▶ Launch", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const shell0 = (tt) => [v0 * Math.cos(rad(ang)) * tt, v0 * Math.sin(rad(ang)) * tt - 0.5 * G * tt * tt];
  const tBurst = () => (v0 * Math.sin(rad(ang))) / G;
  const frag = (f, tt) => {
    const [x0, y0] = shell0(tBurst()), d = tt - tBurst();
    const vx = v0 * Math.cos(rad(ang)) + kick * f[1], vy = kick * f[2];
    return [x0 + vx * d, y0 + vy * d - 0.5 * G * d * d];
  };
  const firstLanding = () => {
    let tt = tBurst();
    while (tt < 20 && DIR.every((f) => frag(f, tt)[1] > 0)) tt += 0.01;
    return tt;
  };
  const anim = playLoop((dt) => { t += dt * 1.5; draw(); return t < firstLanding(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const R = (v0 * v0 * Math.sin(rad(2 * ang))) / G, H = (v0 * Math.sin(rad(ang))) ** 2 / (2 * G);
    const s = Math.min((w - 40) / (R * 1.3 + 1), (h - 30) / (H * 1.25 + 1));
    const X = (x) => 20 + x * s, Y = (y) => h - 14 - y * s;
    ctx.fillStyle = c.border; ctx.fillRect(0, h - 14, w, 3);
    ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = c.muted; ctx.beginPath();
    const tf = (2 * v0 * Math.sin(rad(ang))) / G;
    for (let i = 0; i <= 80; i++) { const [x, y] = shell0((tf * i) / 80); i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
    ctx.stroke(); ctx.restore();
    const tl = firstLanding();
    const tt = Math.min(t, tl);
    let cm;
    if (tt < tBurst()) {
      cm = shell0(tt);
      ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(X(cm[0]), Y(cm[1]), 7, 0, Math.PI * 2); ctx.fill();
    } else {
      const ps = DIR.map((f) => frag(f, tt));
      const COLS = ["#eb5757", "#f2c94c", "#2f80ed"];
      ps.forEach(([x, y], i) => { ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.arc(X(x), Y(y), 4 + DIR[i][0] * 2, 0, Math.PI * 2); ctx.fill(); });
      cm = ps.reduce((acc, q, i) => [acc[0] + (q[0] * DIR[i][0]) / Mtot, acc[1] + (q[1] * DIR[i][0]) / Mtot], [0, 0]);
    }
    ctx.strokeStyle = c.text; ctx.lineWidth = 2.5;
    const [cx, cy] = [X(cm[0]), Y(cm[1])];
    ctx.beginPath(); ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx + 6, cy + 6); ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(cx - 6, cy + 6); ctx.stroke();
    const onArc = shell0(tt);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Center of mass now</th><td>(${fmt(cm[0], 1)}, ${fmt(cm[1], 1)}) m</td></tr>
        <tr><th>Original parabola at this time</th><td>(${fmt(onArc[0], 1)}, ${fmt(onArc[1], 1)}) m</td></tr>
        <tr><th>Fragment masses</th><td>1, 2, 1 kg (momenta from the burst cancel)</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">The animation stops when the first piece hits the ground: from then on the ground pushes on it, an external force, and the center of mass leaves the parabola.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Rocket equation: Δv = v_ex ln(m₀/m)
// =====================================================================
export function rocket(el) {
  const { canvas, controls, readout } = shell(el, { title: "Rocket equation model", icon: "🚀", canvas: true, wide: true });
  let vex = 2000, ratio = 3;
  controls.append(
    slider({ label: "Exhaust speed v_ex", min: 500, max: 4500, step: 50, value: vex, unit: "m/s", onInput: (v) => { vex = v; draw(); } }),
    slider({ label: "Mass ratio m₀/m (start ÷ end)", min: 1, max: 20, step: 0.1, value: ratio, onInput: (v) => { ratio = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const rs = Array.from({ length: 191 }, (_, i) => 1 + (19 * i) / 190);
    const dv = (r) => vex * Math.log(r);
    const P = panel(ctx, c, { x: 56, y: 10, w: w * 0.66 - 56, h: h - 34 }, { t0: 1, t1: 20, y0: 0, y1: 4500 * Math.log(20) * 1.05, label: "speed gain Δv (m/s) vs. mass ratio m₀/m" });
    P.frame();
    P.curve(rs, rs.map(dv), "#9b51e0");
    P.dot(ratio, dv(ratio), "#eb5757", 6);
    // rocket with its fuel fraction
    const rx = w * 0.78, rw = 40, rh = h - 60, fuel = 1 - 1 / ratio;
    ctx.fillStyle = c.border; ctx.fillRect(rx, 20, rw, rh);
    ctx.fillStyle = "#f2994a"; ctx.fillRect(rx, 20 + rh * (1 - fuel), rw, rh * fuel);
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.moveTo(rx, 20); ctx.lineTo(rx + rw / 2, 2); ctx.lineTo(rx + rw, 20); ctx.fill();
    ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = c.text;
    ctx.fillText(`${fmt(fuel * 100, 0)}% fuel`, rx + rw / 2, h - 22);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Δv = v_ex ln(m₀/m)</th><td>${vex} × ln ${fmt(ratio, 1)} = <strong>${num(dv(ratio))} m/s</strong></td></tr>
        <tr><th>Fraction of the start mass that is fuel</th><td>${fmt(fuel * 100, 1)}%</td></tr>
        <tr><th>To double this Δv you'd need m₀/m =</th><td>${fmt(ratio * ratio, 1)} (${fmt((1 - 1 / (ratio * ratio)) * 100, 1)}% fuel)</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">Doubling the speed gain means squaring the mass ratio. That's why real rockets drop empty stages.</p>`;
  }
  draw();
  return destroy;
}
