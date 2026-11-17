// Unit 9 widgets: rotation of rigid bodies.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad } from "./plane.js";
import { shell, button, row, select } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const C = { v: "#2f80ed", at: "#9b51e0", ar: "#f2994a", w: "#27ae60", spin: "#eb5757" };
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

// A wheel with spokes, rotated by angle th (radians, counterclockwise on screen).
function wheel(ctx, c, cx, cy, R, th, { spokes = 6, fill = c.border } = {}) {
  ctx.save();
  ctx.fillStyle = fill; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
  for (let i = 0; i < spokes; i++) {
    const a = th + (i * 2 * Math.PI) / spokes;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); ctx.stroke();
  }
  ctx.fillStyle = C.spin; ctx.beginPath(); ctx.arc(cx + R * 0.85 * Math.cos(th), cy - R * 0.85 * Math.sin(th), 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ⊙ (toward you) or ⊗ (away) for the direction of ω.
function omegaSymbol(ctx, c, x, y, w) {
  if (Math.abs(w) < 1e-6) return;
  ctx.save(); ctx.strokeStyle = C.w; ctx.fillStyle = C.w; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
  if (w > 0) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); }
  ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText("ω", x + 14, y + 4);
  ctx.restore();
}

// =====================================================================
// Radians: arc length equals radius at 1 rad; rpm converter
// =====================================================================
export function radianWheel(el) {
  const { canvas, controls, readout } = shell(el, { title: "Radian wheel", icon: "◔", canvas: true });
  let thDeg = 57.3, r = 1.0, rpm = 3000;
  const sA = slider({ label: "Angle turned", min: 0, max: 720, step: 0.1, value: thDeg, unit: "°", onInput: (v) => { thDeg = v; draw(); } });
  const sR = slider({ label: "Radius r", min: 0.2, max: 2, step: 0.1, value: r, unit: "m", onInput: (v) => { r = v; draw(); } });
  const rpmIn = document.createElement("input");
  rpmIn.type = "number"; rpmIn.className = "input input-num"; rpmIn.value = rpm;
  rpmIn.addEventListener("input", () => { rpm = Number(rpmIn.value) || 0; draw(); });
  const lbl = Object.assign(document.createElement("span"), { className: "muted small", textContent: "rpm converter:" });
  controls.append(sA, sR, row(button("1 radian", () => sA.set(57.3)), button("π rad (half turn)", () => sA.set(180)), button("2π rad (one turn)", () => sA.set(360))), row(lbl, rpmIn, Object.assign(document.createElement("span"), { className: "muted small", textContent: "rpm" })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const th = rad(thDeg), cx = w / 2, cy = h / 2, Rp = Math.min(w, h) * 0.38 * (r / 2) + Math.min(w, h) * 0.06;
    ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.stroke();
    // arc s = rθ (wraps for more than one turn)
    ctx.strokeStyle = C.v; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, -Math.min(th, 2 * Math.PI - 1e-6), true); ctx.stroke();
    if (th > 2 * Math.PI) { ctx.strokeStyle = C.at; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, Rp + 8, 0, -(th - 2 * Math.PI), true); ctx.stroke(); }
    ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp * Math.cos(th), cy - Rp * Math.sin(th)); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(`r = ${r} m`, cx + Rp / 2, cy + 14);
    const radV = th, s = r * th, w2 = (rpm * 2 * Math.PI) / 60;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Degrees</th><td>${fmt(thDeg, 1)}°</td></tr>
        <tr><th>Radians θ = s/r</th><td><strong>${fmt(radV, 3)} rad</strong></td></tr>
        <tr><th>Revolutions</th><td>${fmt(thDeg / 360, 3)} rev</td></tr>
        <tr><th>Arc length s = rθ</th><td>${fmt(s, 3)} m ${Math.abs(radV - 1) < 0.003 ? "(equals r: that's 1 radian)" : ""}</td></tr>
        <tr><th>${num(rpm)} rpm × 2π / 60</th><td><strong>${fmt(w2, 1)} rad/s</strong></td></tr>
      </table>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Spinning wheel: ω and α signs, ω direction, θ(t) = 2.0t³ example
// =====================================================================
export function angularMotion(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spinning-wheel model", icon: "🛞", canvas: true });
  let mode = "const", w0 = 3, al = -0.5, t = 0;
  const build = () => {
    controls.innerHTML = "";
    controls.append(row(select([["const", "Constant α"], ["cubic", "Worked example: θ = 2.0t³"]], mode, (v) => { mode = v; t = 0; build(); })));
    if (mode === "const") {
      controls.append(
        slider({ label: "Starting ω₀ (+ = counterclockwise)", min: -8, max: 8, step: 0.5, value: w0, unit: "rad/s", onInput: (v) => { w0 = v; t = 0; } }),
        slider({ label: "Angular acceleration α", min: -3, max: 3, step: 0.25, value: al, unit: "rad/s²", onInput: (v) => { al = v; t = 0; } }),
      );
    }
    controls.append(row(button("Restart", () => { t = 0; })));
  };
  const state = () => mode === "const"
    ? { th: w0 * t + 0.5 * al * t * t, w: w0 + al * t, a: al }
    : { th: 2 * t ** 3, w: 6 * t * t, a: 12 * t };
  const anim = playLoop((dt) => {
    t += dt * (mode === "cubic" ? 0.25 : 1);
    const lim = mode === "cubic" ? 2.0 : 8;
    if (t > lim) t = mode === "cubic" ? 2.0 : 0;
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const s = state();
    const R = Math.min(w, h) * 0.36;
    wheel(ctx, c, w / 2, h / 2, R, s.th);
    omegaSymbol(ctx, c, w / 2, h / 2, s.w);
    // curved arrow showing the spin direction
    if (Math.abs(s.w) > 0.05) {
      ctx.save(); ctx.strokeStyle = C.w; ctx.lineWidth = 3;
      const a0 = Math.PI * 0.2, a1 = Math.PI * 0.8;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, R + 14, -a0, -a1, true); ctx.stroke();
      const tip = s.w > 0 ? a1 : a0, dir = s.w > 0 ? 1 : -1;
      const tx = w / 2 + (R + 14) * Math.cos(tip), ty = h / 2 - (R + 14) * Math.sin(tip);
      ctx.fillStyle = C.w; ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 10 * Math.sin(tip) * dir - 6 * Math.cos(tip), ty + 10 * Math.cos(tip) * dir + 6 * Math.sin(tip));
      ctx.lineTo(tx + 10 * Math.sin(tip) * dir + 6 * Math.cos(tip), ty + 10 * Math.cos(tip) * dir - 6 * Math.sin(tip));
      ctx.fill(); ctx.restore();
    }
    const state2 = Math.abs(s.w) < 0.05 ? "momentarily at rest" : Math.abs(s.a) < 1e-9 ? "constant spin" : s.w * s.a > 0 ? "speeding up (same signs)" : "slowing down (opposite signs)";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>t</th><td>${fmt(t, 2)} s</td></tr>
        <tr><th>θ</th><td>${fmt(s.th, 2)} rad</td></tr>
        <tr><th>ω = dθ/dt</th><td><strong>${fmt(s.w, 2)} rad/s</strong> ${Math.abs(s.w) < 0.05 ? "" : s.w > 0 ? "(counterclockwise, ω toward you ⊙)" : "(clockwise, ω away from you ⊗)"}</td></tr>
        <tr><th>α = dω/dt</th><td><strong>${fmt(s.a, 2)} rad/s²</strong></td></tr>
      </table>
      <div class="verdict">${mode === "cubic" && t >= 1.999 ? "At t = 2.0 s: ω = 6.0t² = 24 rad/s and α = 12t = 24 rad/s²." : `Right now: ${state2}.`}</div>`;
  }
  build();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Constant α: the area under ω-t is the angle turned
// =====================================================================
const SPIN = {
  blender: { label: "Blender winding down", w0: 300, al: -50, T: 6 },
  spinup: { label: "Wheel spinning up", w0: 0, al: 4, T: 5 },
};
export function spinGraph(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spin-up / spin-down model", icon: "🌀", canvas: true, wide: true });
  let p = { ...SPIN.blender }, t = p.T;
  const anim = playLoop((dt) => { t = Math.min(p.T, t + dt); draw(); return t < p.T; });
  const build = () => {
    controls.innerHTML = "";
    controls.append(
      slider({ label: "Starting ω₀", min: 0, max: 400, step: 5, value: p.w0, unit: "rad/s", onInput: (v) => { p.w0 = v; t = p.T; draw(); } }),
      slider({ label: "Angular acceleration α", min: -100, max: 50, step: 1, value: p.al, unit: "rad/s²", onInput: (v) => { p.al = v; t = p.T; draw(); } }),
      slider({ label: "Duration", min: 1, max: 12, step: 0.5, value: p.T, unit: "s", onInput: (v) => { p.T = v; t = p.T; draw(); } }),
      row(button("▶ Play", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"), ...Object.entries(SPIN).map(([k, v]) => button(v.label, () => { p = { ...SPIN[k] }; t = 0; build(); anim.start(); }))),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const wAt = (tt) => p.w0 + p.al * tt;
    const thAt = (tt) => p.w0 * tt + 0.5 * p.al * tt * tt;
    const th = thAt(t), revs = th / (2 * Math.PI);
    // the disk turns visibly; real spin is far too fast to watch, so show one turn per 20 real turns
    const R = Math.min(h * 0.38, w * 0.16);
    wheel(ctx, c, R + 20, h / 2, R, th / 20, { spokes: 3 });
    ctx.fillStyle = c.text; ctx.font = "700 20px JetBrains Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText(`${fmt(revs, 1)} rev`, R + 20, h / 2 + R + 26 > h ? h - 4 : h / 2 + R + 22);
    const ts = Array.from({ length: 121 }, (_, i) => (p.T * i) / 120), ws = ts.map(wAt);
    const lo = Math.min(0, ...ws), hi = Math.max(0, ...ws) * 1.1 + 1;
    const P = panel(ctx, c, { x: 2 * R + 80, y: 10, w: w - 2 * R - 92, h: h - 34 }, { t1: p.T, y0: lo, y1: hi, label: "ω (rad/s) vs. t (s)" });
    P.frame();
    P.area(ts, ws, t);
    P.curve(ts, ws, C.w);
    P.cursor(t); P.dot(t, wAt(t), C.w);
    const wf = wAt(p.T), thf = thAt(p.T);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Now: t, ω</th><td>${fmt(t, 2)} s, ${fmt(wAt(t), 1)} rad/s</td></tr>
        <tr><th>Angle so far (shaded area)</th><td>${fmt(th, 1)} rad = <strong>${fmt(revs, 1)} rev</strong></td></tr>
        <tr><th>At the end: ω = ω₀ + αt</th><td>${fmt(wf, 1)} rad/s</td></tr>
        <tr><th>Total Δθ = ½(ω₀ + ω)t</th><td>${fmt(thf, 1)} rad = ${fmt(thf / (2 * Math.PI), 1)} rev</td></tr>
      </table>
      ${wf < -0.01 ? `<p class="small bad" style="margin-top:8px">ω goes negative: with this α and duration the wheel stops and starts spinning backward.</p>` : ""}
      <p class="small muted" style="margin-top:8px">The wheel picture turns once for every 20 real revolutions so you can follow it.</p>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Two points on one wheel: same ω, different v, a_tan, a_rad
// =====================================================================
export function rimPoint(el) {
  const { canvas, controls, readout } = shell(el, { title: "Points on a spinning wheel", icon: "🎠", canvas: true });
  const st = { R: 0.3, r: 0.15, w: 20, a: 5 };
  let th = 0;
  const sl = {
    R: slider({ label: "Wheel radius R", min: 0.1, max: 1, step: 0.01, value: st.R, unit: "m", onInput: (v) => { st.R = v; st.r = Math.min(st.r, v); draw(); } }),
    r: slider({ label: "Inner point's distance r", min: 0, max: 1, step: 0.01, value: st.r, unit: "m", onInput: (v) => { st.r = Math.min(v, st.R); draw(); } }),
    w: slider({ label: "Angular velocity ω", min: 0, max: 30, step: 0.5, value: st.w, unit: "rad/s", onInput: (v) => { st.w = v; draw(); } }),
    a: slider({ label: "Angular acceleration α", min: -10, max: 10, step: 0.5, value: st.a, unit: "rad/s²", onInput: (v) => { st.a = v; draw(); } }),
  };
  controls.append(sl.R, sl.r, sl.w, sl.a, row(button("Worked example (rim of 0.30 m wheel)", () => { sl.R.set(0.3); sl.w.set(20); sl.a.set(5); sl.r.set(0.15); })));
  const anim = playLoop((dt) => { th += dt * Math.min(st.w, 3) * 0.6; draw(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, Rp = Math.min(w, h) * 0.32;
    wheel(ctx, c, cx, cy, Rp, th, { spokes: 8 });
    const pts = [[st.R, "rim"], [st.r, "inner"]];
    const amax = Math.max(st.w ** 2 * st.R, Math.abs(st.a) * st.R, 1e-6), vmax = Math.max(st.w * st.R, 1e-6);
    pts.forEach(([r, name], i) => {
      const ang = th + (i ? Math.PI : 0), px = cx + (r / st.R) * Rp * Math.cos(ang), py = cy - (r / st.R) * Rp * Math.sin(ang);
      const tx = -Math.sin(ang), ty = -Math.cos(ang); // tangent (counterclockwise) on screen
      const ix = (cx - px) / ((r / st.R) * Rp || 1), iy = (cy - py) / ((r / st.R) * Rp || 1);
      const v = r * st.w, at = r * st.a, ar = st.w ** 2 * r;
      if (r > 0) {
        drawArrow(ctx, px, py, tx * (v / vmax) * 60, ty * (v / vmax) * 60, C.v, i ? null : "v");
        drawArrow(ctx, px, py, ix * (ar / amax) * 55, iy * (ar / amax) * 55, C.ar, i ? null : "a_rad");
        if (Math.abs(at) > 1e-9) drawArrow(ctx, px, py, tx * (at / amax) * 55, ty * (at / amax) * 55, C.at, i ? null : "a_tan");
      }
      ctx.fillStyle = i ? "#16a34a" : C.spin; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    });
    const rowFor = (r) => { const v = r * st.w, at = r * st.a, ar = st.w ** 2 * r; return [fmt(v, 2), fmt(at, 2), fmt(ar, 1), fmt(Math.hypot(at, ar), 1)]; };
    const A = rowFor(st.R), B = rowFor(st.r);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th></th><th>v = rω</th><th>a_tan = rα</th><th>a_rad = ω²r</th><th>|a|</th></tr>
        <tr><td style="color:${C.spin}">rim (r = ${st.R} m)</td><td>${A[0]} m/s</td><td>${A[1]}</td><td>${A[2]}</td><td>${A[3]} m/s²</td></tr>
        <tr><td style="color:#16a34a">inner (r = ${st.r} m)</td><td>${B[0]} m/s</td><td>${B[1]}</td><td>${B[2]}</td><td>${B[3]} m/s²</td></tr>
      </table>
      <p class="small" style="margin-top:8px">Both points share ω = ${st.w} rad/s and α = ${st.a} rad/s². Arrows are to scale, so a tiny a_tan next to a huge a_rad is real.</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Moment of inertia of a dumbbell about a movable axis
// =====================================================================
export function inertiaDumbbell(el) {
  const { canvas, controls, readout } = shell(el, { title: "Dumbbell axis model", icon: "🏋️", canvas: true, wide: true });
  const L = 1.0;
  const st = { m1: 2, m2: 2, x: 0.5 };
  const sx = slider({ label: "Axis position along the 1.0 m rod", min: 0, max: L, step: 0.01, value: st.x, unit: "m", onInput: (v) => { st.x = v; draw(); } });
  controls.append(
    slider({ label: "Left ball mass", min: 0.5, max: 6, step: 0.5, value: st.m1, unit: "kg", onInput: (v) => { st.m1 = v; draw(); } }),
    slider({ label: "Right ball mass", min: 0.5, max: 6, step: 0.5, value: st.m2, unit: "kg", onInput: (v) => { st.m2 = v; draw(); } }),
    sx, row(button("About the center", () => sx.set(0.5)), button("About one end", () => sx.set(0)), button("At the center of mass", () => sx.set(+(st.m2 * L / (st.m1 + st.m2)).toFixed(2)))),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const x0 = w * 0.1, x1 = w * 0.6, y = h * 0.45, X = (x) => x0 + (x / L) * (x1 - x0);
    ctx.strokeStyle = c.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(L), y); ctx.stroke();
    [[0, st.m1, "#2f80ed"], [L, st.m2, "#eb5757"]].forEach(([x, m, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(x), y, 8 + m * 2.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = "#16a34a"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(st.x), y - 60); ctx.lineTo(X(st.x), y + 60); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(X(st.x), y - 50, 18, 6, 0, Math.PI * 0.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = "#16a34a"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("axis", X(st.x), y + 76);
    const r1 = st.x, r2 = L - st.x, I1 = st.m1 * r1 * r1, I2 = st.m2 * r2 * r2, I = I1 + I2;
    // contribution bars
    const bx = w * 0.68, bw = w * 0.28, maxI = Math.max(st.m1, st.m2) * L * L;
    [["left m r²", I1, "#2f80ed"], ["right m r²", I2, "#eb5757"], ["I total", I, "#16a34a"]].forEach(([lab, v, col], i) => {
      const yy = 20 + i * 44;
      ctx.fillStyle = c.text; ctx.textAlign = "left"; ctx.font = "600 11px Inter, sans-serif"; ctx.fillText(`${lab}: ${fmt(v, 3)} kg·m²`, bx, yy);
      ctx.fillStyle = c.border; ctx.fillRect(bx, yy + 6, bw, 14);
      ctx.fillStyle = col; ctx.fillRect(bx, yy + 6, Math.min(1, v / maxI) * bw, 14);
    });
    const xcm = (st.m2 * L) / (st.m1 + st.m2);
    readout.innerHTML = `
      <div class="conv-chain">I = (${st.m1})(${fmt(r1, 2)})² + (${st.m2})(${fmt(r2, 2)})² = <strong>${fmt(I, 3)} kg·m²</strong></div>
      <p class="small" style="margin-top:8px">${Math.abs(st.x - xcm) < 0.011 ? "The axis is at the center of mass: this is the smallest I possible for this rod." : `Center of mass is at ${fmt(xcm, 2)} m. Moving the axis there would lower I to ${fmt(st.m1 * xcm ** 2 + st.m2 * (L - xcm) ** 2, 3)} kg·m².`}</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Common shapes: same M and R, different I
// =====================================================================
const SHAPES = [
  ["Thin hoop", 1, "MR²"],
  ["Thin spherical shell", 2 / 3, "(2/3)MR²"],
  ["Solid disk", 1 / 2, "½MR²"],
  ["Solid sphere", 2 / 5, "(2/5)MR²"],
  ["Rod (L = 2R), about one end", 4 / 3, "(1/3)ML²"],
  ["Rod (L = 2R), about center", 1 / 3, "(1/12)ML²"],
];
export function inertiaShapes(el) {
  const { canvas, controls, readout } = shell(el, { title: "Shape comparison", icon: "⚪", canvas: true, wide: true });
  let M = 2, R = 0.2;
  controls.append(
    slider({ label: "Mass M", min: 0.5, max: 10, step: 0.5, value: M, unit: "kg", onInput: (v) => { M = v; draw(); } }),
    slider({ label: "Radius R", min: 0.05, max: 1, step: 0.01, value: R, unit: "m", onInput: (v) => { R = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const rowH = (h - 10) / SHAPES.length, left = Math.min(220, w * 0.42), bw = w - left - 80;
    SHAPES.forEach(([name, k, f], i) => {
      const y = 6 + i * rowH;
      ctx.fillStyle = c.text; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(name, 8, y + rowH / 2 + 4);
      ctx.fillStyle = c.border; ctx.fillRect(left, y + rowH * 0.25, bw, rowH * 0.5);
      ctx.fillStyle = i === 0 ? "#eb5757" : i === 2 ? "#2f80ed" : "#9b51e0"; ctx.fillRect(left, y + rowH * 0.25, (k / (4 / 3)) * bw, rowH * 0.5);
      ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.fillText(f, left + bw + 6, y + rowH / 2 + 4);
    });
    readout.innerHTML = `
      <table class="mini-table">
        ${SHAPES.map(([name, k, f]) => `<tr><th>${name}: ${f}</th><td>${fmt(k * M * R * R, 4)} kg·m²</td></tr>`).join("")}
      </table>
      <p class="small" style="margin-top:8px">The hoop's I is exactly twice the disk's: all its mass is at the edge. The rods use L = 2R so they're the same size as the round shapes.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Flywheel energy storage: K = ½Iω²
// =====================================================================
export function flywheel(el) {
  const { controls, readout } = shell(el, { title: "Flywheel energy", icon: "💾" });
  const st = { shape: "disk", M: 50, R: 0.4, w: 300 };
  const sl = {
    M: slider({ label: "Mass", min: 1, max: 200, step: 1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; render(); } }),
    R: slider({ label: "Radius", min: 0.05, max: 1.5, step: 0.01, value: st.R, unit: "m", onInput: (v) => { st.R = v; render(); } }),
    w: slider({ label: "Angular velocity", min: 0, max: 1000, step: 5, value: st.w, unit: "rad/s", onInput: (v) => { st.w = v; render(); } }),
  };
  controls.append(row(select([["disk", "Solid disk (½MR²)"], ["hoop", "Hoop / rim (MR²)"]], st.shape, (v) => { st.shape = v; render(); })), sl.M, sl.R, sl.w, row(button("Worked example", () => { sl.M.set(50); sl.R.set(0.4); sl.w.set(300); })));
  function render() {
    const I = (st.shape === "disk" ? 0.5 : 1) * st.M * st.R ** 2, K = 0.5 * I * st.w ** 2;
    const car = 1200, lift = K / (car * G);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>I</th><td>${fmt(I, 3)} kg·m²</td></tr>
        <tr><th>K = ½Iω²</th><td><strong>${num(K)} J</strong></td></tr>
        <tr><th>Could lift a ${car} kg car</th><td>${fmt(lift, 1)} m</td></tr>
        <tr><th>In rpm</th><td>${num((st.w * 60) / (2 * Math.PI))} rpm</td></tr>
      </table>
      <p class="small" style="margin-top:8px">K grows as ω²: double the spin and the stored energy quadruples. Moving the same mass to the rim (a hoop) doubles it again.</p>`;
  }
  render();
}

// =====================================================================
// Block unwinding from a pulley: energy split between block and pulley
// =====================================================================
export function pulleyDrop(el) {
  const { canvas, controls, readout } = shell(el, { title: "Block unwinding from a pulley", icon: "🧵", canvas: true, wide: true });
  const st = { m: 1, M: 2, shape: "disk", h: 1.5 };
  const R = 0.1;
  let y = 0;
  const kOf = () => ({ disk: 0.5, hoop: 1, none: 0 })[st.shape];
  const v = (yy) => Math.sqrt((2 * st.m * G * yy) / (st.m + kOf() * st.M));
  const anim = playLoop((dt) => {
    const a = (st.m * G) / (st.m + kOf() * st.M);
    const vNow = v(y);
    y = Math.min(st.h, y + vNow * dt * 0.7 + 0.5 * a * dt * dt * 0.5 + 0.002);
    draw(); return y < st.h;
  });
  controls.append(
    row(select([["disk", "Pulley: solid disk (½MR²)"], ["hoop", "Pulley: thin hoop (MR²)"], ["none", "Massless pulley"]], st.shape, (val) => { st.shape = val; y = st.h; draw(); })),
    slider({ label: "Block mass m", min: 0.2, max: 5, step: 0.1, value: st.m, unit: "kg", onInput: (val) => { st.m = val; y = st.h; draw(); } }),
    slider({ label: "Pulley mass M", min: 0, max: 10, step: 0.1, value: st.M, unit: "kg", onInput: (val) => { st.M = val; y = st.h; draw(); } }),
    slider({ label: "Drop height", min: 0.2, max: 4, step: 0.1, value: st.h, unit: "m", onInput: (val) => { st.h = val; y = st.h; draw(); } }),
    row(button("▶ Drop", () => { y = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  y = st.h;
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const px = w * 0.2, py = 40, Rp = 26;
    wheel(ctx, c, px, py, Rp, -y / R, { spokes: st.shape === "hoop" ? 0 : 4, fill: st.shape === "none" ? "transparent" : c.border });
    const top = py + 10, bottom = h - 30, Y = (yy) => top + 20 + (yy / st.h) * (bottom - top - 50);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + Rp, py); ctx.lineTo(px + Rp, Y(y)); ctx.stroke();
    ctx.fillStyle = "#c0392b"; ctx.fillRect(px + Rp - 16, Y(y), 32, 28);
    ctx.fillStyle = c.border; ctx.fillRect(px - 40, bottom, 120, 4);
    const vv = v(y), U = st.m * G * y, Kb = 0.5 * st.m * vv * vv, Kp = 0.5 * kOf() * st.M * vv * vv;
    const bx = w * 0.45, bw = w * 0.5, Umax = st.m * G * st.h;
    [["Block's lost U = mgy", U, "#27ae60"], ["Block's K = ½mv²", Kb, "#2f80ed"], ["Pulley's K = ½Iω²", Kp, "#9b51e0"]].forEach(([lab, val, col], i) => {
      const yy = 20 + i * 46;
      ctx.fillStyle = c.text; ctx.textAlign = "left"; ctx.font = "600 11px Inter, sans-serif"; ctx.fillText(`${lab}: ${fmt(val, 2)} J`, bx, yy);
      ctx.fillStyle = c.border; ctx.fillRect(bx, yy + 6, bw, 14);
      ctx.fillStyle = col; ctx.fillRect(bx, yy + 6, (val / Umax) * bw, 14);
    });
    const vEnd = v(st.h), vFree = Math.sqrt(2 * G * st.h);
    readout.innerHTML = `
      <div class="conv-chain">mgh = ½mv² + ${st.shape === "none" ? "0" : st.shape === "disk" ? "¼Mv²" : "½Mv²"} → v = <strong>${fmt(vEnd, 2)} m/s</strong></div>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>Massless pulley would give √(2gh)</th><td>${fmt(vFree, 2)} m/s</td></tr>
        <tr><th>Pulley's share of the energy</th><td>${fmt((kOf() * st.M) / (st.m + kOf() * st.M) * 100, 0)}%</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">The rope doesn't slip, so ω = v/R and the pulley's radius cancels out.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Parallel-axis theorem: I = I_cm + Md²
// =====================================================================
export function parallelAxis(el) {
  const { canvas, controls, readout } = shell(el, { title: "Parallel-axis explorer", icon: "↔️", canvas: true, wide: true });
  const st = { shape: "rod", M: 2, S: 1, d: 0.5 };
  let sd;
  const Icm = () => (st.shape === "rod" ? (st.M * st.S ** 2) / 12 : 0.5 * st.M * st.S ** 2);
  const dMax = () => (st.shape === "rod" ? st.S : st.S * 1.5);
  const build = () => {
    controls.innerHTML = "";
    sd = slider({ label: "Axis distance from the center of mass d", min: 0, max: +dMax().toFixed(2), step: 0.01, value: Math.min(st.d, dMax()), unit: "m", onInput: (v) => { st.d = v; draw(); } });
    controls.append(
      row(select([["rod", "Thin rod (length L)"], ["disk", "Solid disk (radius R)"]], st.shape, (v) => { st.shape = v; st.S = v === "rod" ? 1 : 0.2; st.d = v === "rod" ? 0.5 : 0.2; build(); })),
      slider({ label: "Mass M", min: 0.5, max: 10, step: 0.5, value: st.M, unit: "kg", onInput: (v) => { st.M = v; draw(); } }),
      slider({ label: st.shape === "rod" ? "Length L" : "Radius R", min: 0.1, max: 2, step: 0.01, value: st.S, unit: "m", onInput: (v) => { st.S = v; build(); } }),
      sd,
      row(st.shape === "rod" ? button("Axis at the end (d = L/2)", () => sd.set(+(st.S / 2).toFixed(2))) : button("Axis on the rim (d = R)", () => sd.set(+st.S.toFixed(2))), button("Through the center", () => sd.set(0))),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const half = w * 0.38, cx = half / 2 + 10, cy = h / 2, sc = (half * 0.8) / (st.shape === "rod" ? st.S + dMax() : 2 * st.S + 2 * dMax());
    ctx.fillStyle = c.border; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    if (st.shape === "rod") { ctx.fillRect(cx - (st.S / 2) * sc, cy - 6, st.S * sc, 12); ctx.strokeRect(cx - (st.S / 2) * sc, cy - 6, st.S * sc, 12); }
    else { ctx.beginPath(); ctx.arc(cx, cy, st.S * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#16a34a"; ctx.beginPath(); ctx.arc(cx + st.d * sc, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = c.muted; ctx.fillText("cm", cx, cy + 22); ctx.fillStyle = "#16a34a"; ctx.fillText("axis", cx + st.d * sc, cy - 14);
    const ds = Array.from({ length: 101 }, (_, i) => (dMax() * i) / 100);
    const Iof = (d) => Icm() + st.M * d * d;
    const P = panel(ctx, c, { x: half + 50, y: 10, w: w - half - 62, h: h - 34 }, { t1: dMax(), y0: 0, y1: Iof(dMax()) * 1.05, label: "I (kg·m²) vs. d (m)" });
    P.frame(); P.curve(ds, ds.map(Iof), "#9b51e0"); P.dot(st.d, Iof(st.d), "#16a34a");
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>I_cm = ${st.shape === "rod" ? "(1/12)ML²" : "½MR²"}</th><td>${fmt(Icm(), 4)} kg·m²</td></tr>
        <tr><th>Md²</th><td>${fmt(st.M * st.d ** 2, 4)} kg·m²</td></tr>
        <tr><th>I = I_cm + Md²</th><td><strong>${fmt(Iof(st.d), 4)} kg·m²</strong> (${fmt(Iof(st.d) / Icm(), 2)}× I_cm)</td></tr>
      </table>
      <p class="small" style="margin-top:8px">${st.shape === "rod" && Math.abs(st.d - st.S / 2) < 0.006 ? "At the end: (1/12 + 3/12)ML² = (1/3)ML², matching the table." : st.shape === "disk" && Math.abs(st.d - st.S) < 0.006 ? "On the rim: ½MR² + MR² = (3/2)MR², three times the central value." : "The lowest point of the curve is d = 0: the center-of-mass axis always gives the smallest I."}</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Building I = ∫r² dm from N slices of a rod
// =====================================================================
export function rodIntegral(el) {
  const { canvas, controls, readout } = shell(el, { title: "Building I from slices", icon: "🔪", canvas: true, wide: true });
  let N = 5, axis = "end";
  const M = 1, L = 1;
  controls.append(
    row(select([["end", "Axis at one end"], ["center", "Axis at the center"]], axis, (v) => { axis = v; draw(); })),
    slider({ label: "Number of slices N", min: 1, max: 100, step: 1, value: N, onInput: (v) => { N = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const x0 = 30, x1 = w - 30, y = h * 0.4, X = (x) => x0 + (x / L) * (x1 - x0);
    const ax = axis === "end" ? 0 : L / 2;
    let sum = 0;
    const dx = L / N, rmax = axis === "end" ? L : L / 2;
    for (let i = 0; i < N; i++) {
      const xm = (i + 0.5) * dx, r = Math.abs(xm - ax), dm = (M / L) * dx;
      sum += dm * r * r;
      const shade = r / rmax;
      ctx.fillStyle = `rgba(155,81,224,${0.15 + 0.85 * shade * shade})`;
      ctx.fillRect(X(i * dx) + 0.5, y - 14, X(dx) - X(0) - 1, 28);
    }
    ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(ax), y - 40); ctx.lineTo(X(ax), y + 40); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#16a34a"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("axis", X(ax), y + 56);
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.fillText("darker slices are farther from the axis and count more (r²)", w / 2, h - 14);
    const exact = axis === "end" ? (M * L * L) / 3 : (M * L * L) / 12;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Sum of N slices, Σ(M/L)Δx · r²</th><td><strong>${fmt(sum, 5)}</strong> × ML²</td></tr>
        <tr><th>Exact integral ∫r² dm</th><td>${axis === "end" ? "1/3" : "1/12"} = ${fmt(exact, 5)} × ML²</td></tr>
        <tr><th>Difference</th><td>${fmt((Math.abs(sum - exact) / exact) * 100, 3)}%</td></tr>
      </table>`;
  }
  draw();
  return destroy;
}
