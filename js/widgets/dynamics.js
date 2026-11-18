// Unit 10 widgets: dynamics of rotational motion.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad, deg } from "./plane.js";
import { shell, button, row, select, checkbox } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const C = { F: "#eb5757", F2: "#2f80ed", arm: "#16a34a", T: "#9b51e0", w: "#27ae60", v: "#2f80ed", spin: "#f2994a" };
const num = (v, d = 0) => Number(v.toFixed(d)).toLocaleString(undefined, { maximumFractionDigits: d }).replace("-", "−");

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

function disk(ctx, c, cx, cy, R, th, { spokes = 4, fill = c.border } = {}) {
  ctx.save();
  ctx.fillStyle = fill; ctx.strokeStyle = c.text; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
  for (let i = 0; i < spokes; i++) { const a = th + (i * 2 * Math.PI) / spokes; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); ctx.stroke(); }
  ctx.fillStyle = C.spin; ctx.beginPath(); ctx.arc(cx + R * 0.8 * Math.cos(th), cy - R * 0.8 * Math.sin(th), 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Curved arrow around (cx, cy) showing a rotation direction (+1 counterclockwise, −1 clockwise).
function spinArrow(ctx, cx, cy, R, dir, color) {
  if (!dir) return;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
  const a0 = Math.PI * 0.15, a1 = Math.PI * 0.85;
  ctx.beginPath(); ctx.arc(cx, cy, R, -a0, -a1, true); ctx.stroke();
  const tip = dir > 0 ? a1 : a0, tx = cx + R * Math.cos(tip), ty = cy - R * Math.sin(tip);
  const ux = -Math.sin(tip) * dir, uy = -Math.cos(tip) * dir; // direction of travel at the tip (screen)
  ctx.beginPath(); ctx.moveTo(tx + ux * 10, ty + uy * 10); ctx.lineTo(tx - uy * 6, ty + ux * 6); ctx.lineTo(tx + uy * 6, ty - ux * 6); ctx.fill();
  ctx.restore();
}

// =====================================================================
// Wrench: τ = rF sin φ = Fℓ, with the lever arm drawn
// =====================================================================
export function wrenchTorque(el) {
  const { canvas, controls, readout } = shell(el, { title: "Wrench torque model", icon: "🔧", canvas: true, wide: true });
  const st = { F: 80, r: 0.25, phi: 90 };
  const sl = {
    F: slider({ label: "Force F", min: 0, max: 150, step: 1, value: st.F, unit: "N", onInput: (v) => { st.F = v; draw(); } }),
    r: slider({ label: "Distance from the bolt r", min: 0.05, max: 0.3, step: 0.01, value: st.r, unit: "m", onInput: (v) => { st.r = v; draw(); } }),
    phi: slider({ label: "Angle φ between r and F", min: 0, max: 180, step: 1, value: st.phi, unit: "°", onInput: (v) => { st.phi = v; draw(); } }),
  };
  controls.append(sl.F, sl.r, sl.phi, row(button("Perpendicular (90°)", () => sl.phi.set(90)), button("At 60°", () => sl.phi.set(60)), button("Toward the bolt (0°)", () => sl.phi.set(0)), button("Worked example", () => { sl.F.set(80); sl.r.set(0.25); sl.phi.set(90); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.2, by = h * 0.6, s = (w * 0.55) / 0.3;
    // wrench
    ctx.fillStyle = c.border; ctx.fillRect(bx, by - 8, 0.3 * s, 16);
    ctx.fillStyle = c.muted; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ctx.lineTo(bx + 16 * Math.cos(a), by + 16 * Math.sin(a)); } ctx.fill();
    const px = bx + st.r * s, py = by;
    const a = rad(st.phi), fx = Math.cos(a), fy = -Math.sin(a); // force direction, measured from r (+x) counterclockwise
    // line of action and lever arm (perpendicular from bolt to the line)
    ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px - fx * 400, py - fy * 400); ctx.lineTo(px + fx * 400, py + fy * 400); ctx.stroke(); ctx.restore();
    const t = (bx - px) * fx + (by - py) * fy, fxp = px + fx * t, fyp = py + fy * t;
    ctx.strokeStyle = C.arm; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(fxp, fyp); ctx.stroke();
    ctx.fillStyle = C.arm; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ℓ", (bx + fxp) / 2 - 8, (by + fyp) / 2 - 6);
    drawArrow(ctx, px, py, fx * 90 * (st.F / 150 + 0.2), fy * 90 * (st.F / 150 + 0.2), C.F, `F = ${st.F} N`);
    const tau = st.r * st.F * Math.sin(a), ell = st.r * Math.sin(a);
    if (Math.abs(tau) > 0.01) spinArrow(ctx, bx, by, 30, Math.sign(tau), C.T);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>τ = rF sin φ</th><td>(${st.r})(${st.F}) sin ${st.phi}° = <strong>${fmt(tau, 1)} N·m</strong></td></tr>
        <tr><th>Lever arm ℓ = r sin φ</th><td>${fmt(ell, 3)} m</td></tr>
        <tr><th>τ = Fℓ</th><td>(${st.F})(${fmt(ell, 3)}) = ${fmt(st.F * ell, 1)} N·m</td></tr>
      </table>
      <div class="verdict">${Math.abs(tau) < 0.05 ? "The force points through the bolt: the lever arm is zero, so there's no torque at all." : tau > 0 ? "Counterclockwise torque (positive)." : "Clockwise torque (negative)."}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Net torque: two tangential forces at different radii
// =====================================================================
export function netTorqueWheel(el) {
  const { canvas, controls, readout } = shell(el, { title: "Net torque on a wheel", icon: "⚙️", canvas: true });
  const st = { F1: 10, r1: 0.5, F2: 6, r2: 0.2 };
  const sl = {
    F1: slider({ label: "F₁ (counterclockwise)", min: 0, max: 20, step: 0.5, value: st.F1, unit: "N", onInput: (v) => { st.F1 = v; draw(); } }),
    r1: slider({ label: "F₁ acts at radius", min: 0.05, max: 0.5, step: 0.01, value: st.r1, unit: "m", onInput: (v) => { st.r1 = v; draw(); } }),
    F2: slider({ label: "F₂ (clockwise)", min: 0, max: 20, step: 0.5, value: st.F2, unit: "N", onInput: (v) => { st.F2 = v; draw(); } }),
    r2: slider({ label: "F₂ acts at radius", min: 0.05, max: 0.5, step: 0.01, value: st.r2, unit: "m", onInput: (v) => { st.r2 = v; draw(); } }),
  };
  controls.append(sl.F1, sl.r1, sl.F2, sl.r2, row(button("Worked example", () => { sl.F1.set(10); sl.r1.set(0.5); sl.F2.set(6); sl.r2.set(0.2); }), button("Big force, small radius", () => { sl.F1.set(4); sl.r1.set(0.5); sl.F2.set(18); sl.r2.set(0.1); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, Rp = Math.min(w, h) * 0.38, s = Rp / 0.5;
    disk(ctx, c, cx, cy, Rp, 0, { spokes: 6 });
    ctx.strokeStyle = c.muted; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(cx, cy, st.r2 * s, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // F1 at the right, pointing up (counterclockwise); F2 at the right of the inner circle pointing down (clockwise)
    drawArrow(ctx, cx + st.r1 * s, cy, 0, -st.F1 * 5, C.F, "F₁");
    drawArrow(ctx, cx - st.r2 * s, cy, 0, -st.F2 * 5, C.F2, "F₂");
    const t1 = st.r1 * st.F1, t2 = -st.r2 * st.F2, net = t1 + t2;
    spinArrow(ctx, cx, cy, Rp + 16, Math.sign(net), C.T);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th style="color:${C.F}">τ₁ = +r₁F₁</th><td>+${fmt(t1, 2)} N·m</td></tr>
        <tr><th style="color:${C.F2}">τ₂ = −r₂F₂</th><td>${fmt(t2, 2)} N·m</td></tr>
        <tr><th>Net torque</th><td><strong>${fmt(net, 2)} N·m</strong> ${Math.abs(net) < 0.01 ? "(balanced)" : net > 0 ? "counterclockwise" : "clockwise"}</td></tr>
      </table>
      <p class="small" style="margin-top:8px">F₂ pushes up on the left side of the axle, which turns the wheel clockwise. A force wins by its torque, not its size.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Στ = Iα: a string pulling a disk
// =====================================================================
export function diskTorque(el) {
  const { canvas, controls, readout } = shell(el, { title: "Disk spin-up model", icon: "🪀", canvas: true, wide: true });
  const st = { M: 5, R: 0.2, F: 10, shape: 0.5 };
  let th = 0, w = 0;
  const reset = () => { th = 0; w = 0; };
  const sl = {
    M: slider({ label: "Mass M", min: 0.5, max: 20, step: 0.5, value: st.M, unit: "kg", onInput: (v) => { st.M = v; reset(); } }),
    R: slider({ label: "Radius R", min: 0.05, max: 0.5, step: 0.01, value: st.R, unit: "m", onInput: (v) => { st.R = v; reset(); } }),
    F: slider({ label: "String force F", min: 0, max: 40, step: 0.5, value: st.F, unit: "N", onInput: (v) => { st.F = v; reset(); } }),
  };
  controls.append(row(select([["0.5", "Solid disk (½MR²)"], ["1", "Hoop (MR²)"]], "0.5", (v) => { st.shape = Number(v); reset(); })), sl.M, sl.R, sl.F, row(button("Worked example", () => { sl.M.set(5); sl.R.set(0.2); sl.F.set(10); }), button("Restart", reset)));
  const anim = playLoop((dt) => {
    const I = st.shape * st.M * st.R ** 2, al = (st.R * st.F) / I;
    w += al * dt * 0.2; th += w * dt * 0.2; // shown at one fifth speed
    if (w > 60) reset();
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w: W, h } = size;
    ctx.clearRect(0, 0, W, h);
    const I = st.shape * st.M * st.R ** 2, tau = st.R * st.F, al = tau / I;
    const cx = W * 0.25, cy = h / 2, Rp = Math.min(h * 0.38, 30 + st.R * 200);
    disk(ctx, c, cx, cy, Rp, th, { fill: st.shape === 1 ? "transparent" : c.border });
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - Rp); ctx.lineTo(W * 0.55, cy - Rp); ctx.stroke();
    if (st.F) drawArrow(ctx, W * 0.55, cy - Rp, Math.min(80, st.F * 3), 0, C.F, `F = ${st.F} N`);
    spinArrow(ctx, cx, cy, Rp + 14, -1, C.T);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>τ = RF</th><td>(${st.R})(${st.F}) = ${fmt(tau, 2)} N·m</td></tr>
        <tr><th>I = ${st.shape === 1 ? "MR²" : "½MR²"}</th><td>${fmt(I, 4)} kg·m²</td></tr>
        <tr><th>α = Στ / I</th><td><strong>${fmt(al, 1)} rad/s²</strong></td></tr>
        <tr><th>ω now (shown at ⅕ speed)</th><td>${fmt(w, 1)} rad/s</td></tr>
      </table>
      <p class="small" style="margin-top:8px">The string pulls along the top, so the disk turns clockwise here. Double R and τ doubles, but I goes up 4×, so α halves.</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Block on a heavy pulley: ΣF = ma, Στ = Iα, a = Rα
// =====================================================================
export function heavyPulley(el) {
  const { canvas, controls, readout } = shell(el, { title: "Block on a heavy pulley", icon: "🪝", canvas: true, wide: true });
  const st = { m: 1, M: 2, c: 0.5 };
  let y = 0, vv = 0;
  const solve = () => { const a = (st.m * G) / (st.m + st.c * st.M); return { a, T: st.c * st.M * a }; };
  controls.append(
    row(select([["0.5", "Pulley: solid disk (½MR²)"], ["1", "Pulley: hoop (MR²)"], ["0", "Massless pulley"]], "0.5", (v) => { st.c = Number(v); y = 0; vv = 0; draw(); })),
    slider({ label: "Block mass m", min: 0.2, max: 5, step: 0.1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; y = 0; vv = 0; draw(); } }),
    slider({ label: "Pulley mass M", min: 0, max: 10, step: 0.1, value: st.M, unit: "kg", onInput: (v) => { st.M = v; y = 0; vv = 0; draw(); } }),
    row(button("▶ Release", () => { y = 0; vv = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const anim = playLoop((dt) => { const { a } = solve(); vv += a * dt * 0.5; y += vv * dt * 0.5; draw(); return y < 1.5; });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const { a, T } = solve();
    const px = w * 0.2, py = 42, Rp = 28;
    ctx.fillStyle = c.muted; ctx.fillRect(px - 3, 0, 6, py);
    disk(ctx, c, px, py, Rp, -y / 0.1, { fill: st.c === 0 ? "transparent" : c.border });
    const by = py + 30 + (y / 1.5) * (h - py - 80);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + Rp, py); ctx.lineTo(px + Rp, by); ctx.stroke();
    ctx.fillStyle = "#c0392b"; ctx.fillRect(px + Rp - 16, by, 32, 28);
    const k = 3.5;
    drawArrow(ctx, px + Rp + 26, by + 14, 0, -T * k, C.T, "T");
    drawArrow(ctx, px + Rp + 26, by + 14, 0, st.m * G * k, "#27ae60", "mg");
    if (T > 0.01) drawArrow(ctx, px + Rp, py + 6, 0, T * k * 0.6, C.T, "T on pulley");
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Block (down +): mg − T = ma</th><td>${fmt(st.m * G, 2)} − T = ${fmt(st.m, 1)}a</td></tr>
        <tr><th>Pulley: TR = Iα, with α = a/R</th><td>T = ${st.c === 0 ? "0" : `${st.c === 1 ? "" : "½"}Ma = ${fmt(st.c * st.M, 2)}a`}</td></tr>
        <tr><th>Acceleration a</th><td><strong>${fmt(a, 2)} m/s²</strong> (g = 9.80)</td></tr>
        <tr><th>Tension T</th><td><strong>${fmt(T, 2)} N</strong> (weight = ${fmt(st.m * G, 2)} N)</td></tr>
        <tr><th>Speed after 1.5 m, √(2a·1.5)</th><td>${fmt(Math.sqrt(2 * a * 1.5), 2)} m/s</td></tr>
      </table>
      <p class="small" style="margin-top:8px">Unit 9's energy method gives the same speed. Forces and energy always agree.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Rolling: each point's velocity = center velocity + spin velocity
// =====================================================================
export function rollingWheel(el) {
  const { canvas, controls, readout } = shell(el, { title: "Rolling-wheel velocity model", icon: "🛞", canvas: true, wide: true });
  let v = 3, x = 0, showT = true, showS = true, showSum = true, trace = false;
  const R = 1;
  const path = [];
  controls.append(
    slider({ label: "Center speed v_cm", min: 0, max: 6, step: 0.1, value: v, unit: "m/s", onInput: (val) => { v = val; } }),
    checkbox("Show translation part (v_cm, same everywhere)", showT, (val) => { showT = val; }),
    checkbox("Show spin part (Rω, tangent)", showS, (val) => { showS = val; }),
    checkbox("Show total velocity", showSum, (val) => { showSum = val; }),
    checkbox("Trace a rim point (cycloid)", trace, (val) => { trace = val; path.length = 0; }),
  );
  const anim = playLoop((dt) => { x += v * dt * 0.4; draw(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const Rp = h * 0.3, groundY = h - 14, span = w / Rp;
    const xs = ((x % span) + span) % span;
    const cx = xs * Rp, cy = groundY - Rp, th = -x / R;
    ctx.fillStyle = c.border; ctx.fillRect(0, groundY, w, 4);
    disk(ctx, c, cx, cy, Rp, th, { spokes: 6 });
    if (trace) {
      path.push([cx + Rp * 0.8 * Math.cos(th), cy - Rp * 0.8 * Math.sin(th)]);
      if (path.length > 600 || (path.length > 1 && Math.abs(path[path.length - 1][0] - path[path.length - 2][0]) > w / 2)) path.length = 0;
      ctx.strokeStyle = C.spin; ctx.lineWidth = 1.5; ctx.beginPath(); path.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    }
    const k = 18;
    [[Math.PI / 2, "top"], [0, "front"], [-Math.PI / 2, "bottom"], [Math.PI, "back"]].forEach(([a, name]) => {
      const px = cx + Rp * Math.cos(a), py = cy - Rp * Math.sin(a);
      // spin velocity for clockwise rolling: tangent (sin a, cos a) in screen coords, magnitude v
      const sx = Math.sin(a) * v, sy = Math.cos(a) * v;
      if (showT) drawArrow(ctx, px, py, v * k, 0, "#94a3b8", null);
      if (showS) drawArrow(ctx, px, py, sx * k, sy * k, C.spin, null);
      if (showSum) { ctx.save(); ctx.lineWidth = 4; drawArrow(ctx, px, py, (v + sx) * k, sy * k, C.v, null); ctx.restore(); }
      ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    });
    if (showSum) drawArrow(ctx, cx, cy, v * k, 0, C.v, null);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Top: v_cm + Rω</th><td><strong>${fmt(2 * v, 1)} m/s</strong> (2v_cm)</td></tr>
        <tr><th>Center</th><td>${fmt(v, 1)} m/s</td></tr>
        <tr><th>Front / back</th><td>${fmt(Math.SQRT2 * v, 1)} m/s at 45°</td></tr>
        <tr><th>Bottom (touching the ground): v_cm − Rω</th><td><strong>0</strong> (momentarily at rest)</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">Gray: translation. Orange: spin. Blue: their sum.</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Rolling race: v = √(2gh/(1 + c)), a = g sin θ/(1 + c)
// =====================================================================
const RACERS = [["Sliding block (no friction)", 0, "#64748b"], ["Solid sphere", 0.4, "#eb5757"], ["Solid disk", 0.5, "#2f80ed"], ["Hoop", 1, "#9b51e0"]];
export function rollingRace(el) {
  const { canvas, controls, readout } = shell(el, { title: "Rolling race", icon: "🏁", canvas: true, wide: true });
  let hgt = 1, ang = 20, t = 0;
  const anim = playLoop((dt) => { t += dt * 0.7; draw(); return RACERS.some(([, cc]) => t < tEnd(cc)); });
  controls.append(
    slider({ label: "Ramp height", min: 0.2, max: 3, step: 0.1, value: hgt, unit: "m", onInput: (v) => { hgt = v; t = 0; draw(); } }),
    slider({ label: "Ramp angle", min: 5, max: 60, step: 1, value: ang, unit: "°", onInput: (v) => { ang = v; t = 0; draw(); } }),
    row(button("▶ Release all", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const acc = (cc) => (G * Math.sin(rad(ang))) / (1 + cc);
  const len = () => hgt / Math.sin(rad(ang));
  const tEnd = (cc) => Math.sqrt((2 * len()) / acc(cc));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const th = rad(ang), Lp = Math.min((w - 60) / Math.cos(th), (h - 50) / Math.sin(th));
    const bx = w - 20, by = h - 14, tx = bx - Lp * Math.cos(th), ty = by - Lp * Math.sin(th);
    ctx.fillStyle = c.border; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.lineTo(tx, by); ctx.closePath(); ctx.fill();
    RACERS.forEach(([, cc, col], i) => {
      const s = Math.min(len(), 0.5 * acc(cc) * t * t) / len();
      const off = (i - 1.5) * 4;
      const px = tx + (bx - tx) * s, py = ty + (by - ty) * s;
      const r = 9;
      const nx = Math.sin(th), ny = -Math.cos(th);
      ctx.fillStyle = col; ctx.globalAlpha = 0.9;
      if (cc === 0) ctx.fillRect(px + nx * r - r, py + ny * r - r + off, 2 * r, 2 * r);
      else { ctx.beginPath(); ctx.arc(px + nx * r, py + ny * r + off, r, 0, Math.PI * 2); if (cc === 1) { ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); } else ctx.fill(); }
      ctx.globalAlpha = 1;
    });
    const order = [...RACERS].sort((a, b) => a[1] - b[1]);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Object</th><th>c</th><th>a = g sin θ/(1 + c)</th><th>v at bottom</th><th>time</th></tr>
        ${RACERS.map(([name, cc, col]) => `<tr><td style="color:${col}">${name}</td><td>${cc === 0.4 ? "2/5" : cc === 0.5 ? "1/2" : cc}</td><td>${fmt(acc(cc), 2)} m/s²</td><td>${fmt(Math.sqrt((2 * G * hgt) / (1 + cc)), 2)} m/s</td><td>${t >= tEnd(cc) ? "✓ " : ""}${fmt(tEnd(cc), 2)} s</td></tr>`).join("")}
      </table>
      <p class="small" style="margin-top:8px">Finish order: ${order.map((r) => r[0].split(" (")[0]).join(" → ")}. Mass and radius cancel; only c matters.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Rotational work: W = τΔθ = ½Iω²
// =====================================================================
export function torqueWork(el) {
  const { canvas, controls, readout } = shell(el, { title: "Torque does work", icon: "🔩", canvas: true, wide: true });
  const st = { tau: 15, I: 0.5, dth: 20 };
  let th = st.dth;
  const anim = playLoop((dt) => { const al = st.tau / st.I; const w = Math.sqrt(2 * al * th) || 0.5; th = Math.min(st.dth, th + Math.max(w, 0.5) * dt * 0.15); draw(); return th < st.dth; });
  const sl = {
    tau: slider({ label: "Torque τ", min: 1, max: 40, step: 1, value: st.tau, unit: "N·m", onInput: (v) => { st.tau = v; th = st.dth; draw(); } }),
    I: slider({ label: "Moment of inertia I", min: 0.1, max: 3, step: 0.05, value: st.I, unit: "kg·m²", onInput: (v) => { st.I = v; th = st.dth; draw(); } }),
    dth: slider({ label: "Angle turned Δθ", min: 1, max: 60, step: 1, value: st.dth, unit: "rad", onInput: (v) => { st.dth = v; th = v; draw(); } }),
  };
  controls.append(sl.tau, sl.I, sl.dth, row(button("▶ Run", () => { th = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Worked example", () => { sl.tau.set(15); sl.I.set(0.5); sl.dth.set(20); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const W = st.tau * th, wv = Math.sqrt((2 * W) / st.I);
    disk(ctx, c, w * 0.2, h / 2, Math.min(h * 0.38, w * 0.16), th, { spokes: 5 });
    spinArrow(ctx, w * 0.2, h / 2, Math.min(h * 0.38, w * 0.16) + 12, 1, C.T);
    const bx = w * 0.45, bw = w * 0.5, Wmax = st.tau * st.dth;
    [["Work done τΔθ", W, "#27ae60"], ["K = ½Iω²", 0.5 * st.I * wv * wv, "#2f80ed"]].forEach(([lab, val, col], i) => {
      const yy = 24 + i * 54;
      ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`${lab}: ${fmt(val, 1)} J`, bx, yy);
      ctx.fillStyle = c.border; ctx.fillRect(bx, yy + 6, bw, 16);
      ctx.fillStyle = col; ctx.fillRect(bx, yy + 6, (val / Wmax) * bw, 16);
    });
    readout.innerHTML = `
      <div class="conv-chain" data-lenis-prevent>τΔθ = ½Iω² → (${st.tau})(${fmt(th, 1)}) = ½(${st.I})ω² → ω = <strong>${fmt(wv, 1)} rad/s</strong></div>
      <p class="small muted" style="margin-top:8px">No time or α needed, just like the linear work-energy theorem.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Engine power: P = τω (ω in rad/s)
// =====================================================================
export function engineTorque(el) {
  const { controls, readout } = shell(el, { title: "Engine torque and power", icon: "🏎️" });
  const st = { tau: 400, rpm: 3000 };
  const sT = slider({ label: "Engine torque τ", min: 50, max: 800, step: 10, value: st.tau, unit: "N·m", onInput: (v) => { st.tau = v; render(); } });
  const sR = slider({ label: "Engine speed", min: 500, max: 8000, step: 50, value: st.rpm, unit: "rpm", onInput: (v) => { st.rpm = v; render(); } });
  controls.append(sT, sR, row(button("Worked example", () => { sT.set(400); sR.set(3000); })));
  function render() {
    const w = (st.rpm * 2 * Math.PI) / 60, P = st.tau * w;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>ω = rpm × 2π / 60</th><td>${fmt(w, 1)} rad/s</td></tr>
        <tr><th>P = τω</th><td><strong>${num(P)} W</strong> = ${fmt(P / 1000, 1)} kW = <strong>${fmt(P / 746, 0)} hp</strong></td></tr>
        <tr><th class="bad">Mistake: τ × rpm</th><td class="bad"><s>${num(st.tau * st.rpm)} W</s> (${fmt((st.tau * st.rpm) / P, 1)}× too big)</td></tr>
      </table>`;
  }
  render();
}

// =====================================================================
// L = mvℓ for a particle moving in a straight line
// =====================================================================
export function particleL(el) {
  const { canvas, controls, readout } = shell(el, { title: "Angular momentum of a passing particle", icon: "☄️", canvas: true, wide: true });
  const st = { m: 0.2, v: 4, ell: 0.5 };
  let x = -1.5;
  controls.append(
    slider({ label: "Mass", min: 0.05, max: 1, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    slider({ label: "Speed", min: 0.5, max: 8, step: 0.5, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; draw(); } }),
    slider({ label: "Line's distance from O (lever arm ℓ)", min: 0.1, max: 1, step: 0.05, value: st.ell, unit: "m", onInput: (v) => { st.ell = v; draw(); } }),
  );
  const anim = playLoop((dt) => { x += dt * 0.5; if (x > 1.5) x = -1.5; draw(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w / 3.4, (h - 30) / 1.2), ox = w / 2, oy = h - 20;
    const X = (xx) => ox + xx * s, Y = (yy) => oy - yy * s;
    ctx.strokeStyle = c.border; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(X(-1.7), Y(st.ell)); ctx.lineTo(X(1.7), Y(st.ell)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(X(0), Y(0), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("O", X(0), Y(0) + 16 > h ? Y(0) - 10 : Y(0) + 14);
    ctx.strokeStyle = C.arm; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(st.ell)); ctx.stroke();
    ctx.fillStyle = C.arm; ctx.fillText("ℓ", X(0) - 10, Y(st.ell / 2));
    drawArrow(ctx, X(0), Y(0), X(x) - X(0), Y(st.ell) - Y(0), "#64748b", "r");
    drawArrow(ctx, X(x), Y(st.ell), st.v * 12, 0, C.v, "v");
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(X(x), Y(st.ell), 8, 0, Math.PI * 2); ctx.fill();
    const r = Math.hypot(x, st.ell), phi = deg(Math.atan2(st.ell, x));
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>r (changes)</th><td>${fmt(r, 2)} m</td></tr>
        <tr><th>φ between r and v (changes)</th><td>${fmt(phi, 1)}°</td></tr>
        <tr><th>r sin φ (never changes)</th><td>${fmt(r * Math.sin(rad(phi)), 2)} m = ℓ</td></tr>
        <tr><th>L = mvr sin φ = mvℓ</th><td><strong>${fmt(st.m * st.v * st.ell, 3)} kg·m²/s</strong></td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">No force acts on the ball, so no torque: L about O stays constant, as it must.</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Στ = dL/dt: torque builds angular momentum at rate τ
// =====================================================================
export function torqueL(el) {
  const { canvas, controls, readout } = shell(el, { title: "Torque changes L", icon: "📈", canvas: true, wide: true });
  const st = { I: 0.1, tau: 2 };
  let t = 1;
  const anim = playLoop((dt) => { t = Math.min(3, t + dt * 0.5); draw(); return t < 3; });
  controls.append(
    slider({ label: "Moment of inertia I", min: 0.05, max: 1, step: 0.05, value: st.I, unit: "kg·m²", onInput: (v) => { st.I = v; draw(); } }),
    slider({ label: "Torque τ", min: 0.5, max: 5, step: 0.1, value: st.tau, unit: "N·m", onInput: (v) => { st.tau = v; draw(); } }),
    slider({ label: "Time", min: 0, max: 3, step: 0.01, value: t, unit: "s", onInput: (v) => { t = v; draw(); } }),
    row(button("▶ Play", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const L = st.tau * t, om = L / st.I;
    const R = Math.min(h * 0.36, w * 0.14);
    disk(ctx, c, R + 16, h / 2, R, (st.tau / st.I) * t * t * 0.05, { spokes: 4 });
    const ts = [0, 3];
    const P = panel(ctx, c, { x: 2 * R + 70, y: 10, w: w - 2 * R - 82, h: h - 34 }, { t1: 3, y0: 0, y1: st.tau * 3 * 1.1, label: "L (kg·m²/s) vs. t (s): slope = τ" });
    P.frame(); P.curve(ts, ts.map((tt) => st.tau * tt), "#9b51e0"); P.cursor(t); P.dot(t, L, "#9b51e0");
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>L = τt</th><td><strong>${fmt(L, 2)} kg·m²/s</strong></td></tr>
        <tr><th>ω = L / I</th><td><strong>${fmt(om, 1)} rad/s</strong></td></tr>
        <tr><th>Time to reach L = 2.0, ΔL/τ</th><td>${fmt(2 / st.tau, 2)} s</td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Skater: I₁ω₁ = I₂ω₂, kinetic energy rises
// =====================================================================
export function skater(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spinning skater", icon: "⛸️", canvas: true });
  const st = { Iout: 4, Iin: 1, w0: 2, arms: 1 };
  let th = 0;
  const I = () => st.Iin + (st.Iout - st.Iin) * st.arms;
  const L = () => st.Iout * st.w0;
  const sA = slider({ label: "Arms: in (0) → out (1)", min: 0, max: 1, step: 0.01, value: st.arms, onInput: (v) => { st.arms = v; draw(); } });
  controls.append(
    sA,
    slider({ label: "Spin with arms out ω₁", min: 0.5, max: 4, step: 0.1, value: st.w0, unit: "rad/s", onInput: (v) => { st.w0 = v; draw(); } }),
    slider({ label: "I with arms out", min: 2, max: 6, step: 0.1, value: st.Iout, unit: "kg·m²", onInput: (v) => { st.Iout = v; draw(); } }),
    slider({ label: "I with arms in", min: 0.5, max: 2, step: 0.1, value: st.Iin, unit: "kg·m²", onInput: (v) => { st.Iin = v; draw(); } }),
    row(button("Pull arms in", () => sA.set(0)), button("Arms out", () => sA.set(1))),
  );
  const anim = playLoop((dt) => { th += (L() / I()) * dt * 0.4; draw(); });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, armLen = 30 + st.arms * Math.min(w, h) * 0.3;
    ctx.fillStyle = "rgba(120,190,255,.15)"; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9b51e0"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx - armLen * Math.cos(th), cy + armLen * Math.sin(th)); ctx.lineTo(cx + armLen * Math.cos(th), cy - armLen * Math.sin(th)); ctx.stroke();
    ctx.fillStyle = "#9b51e0"; [1, -1].forEach((sgn) => { ctx.beginPath(); ctx.arc(cx + sgn * armLen * Math.cos(th), cy - sgn * armLen * Math.sin(th), 7, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    const om = L() / I(), K = 0.5 * I() * om * om, K1 = 0.5 * st.Iout * st.w0 ** 2;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>I now</th><td>${fmt(I(), 2)} kg·m²</td></tr>
        <tr><th>L = Iω (constant)</th><td>${fmt(L(), 2)} kg·m²/s</td></tr>
        <tr><th>ω = L / I</th><td><strong>${fmt(om, 2)} rad/s</strong> (${fmt(om / st.w0, 2)}× arms-out)</td></tr>
        <tr><th>K = ½Iω²</th><td>${fmt(K, 2)} J (arms out: ${fmt(K1, 2)} J)</td></tr>
      </table>
      <p class="small" style="margin-top:8px">${K > K1 + 0.01 ? `K went up by ${fmt(K - K1, 2)} J: that's the work her muscles did pulling her arms in. L is conserved; K is not.` : "Pull the arms in and watch ω and K rise while L stays fixed."}</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Child jumps onto a merry-go-round: rotational perfectly inelastic collision
// =====================================================================
export function merryGoRound(el) {
  const { canvas, controls, readout } = shell(el, { title: "Jumping onto a merry-go-round", icon: "🎠", canvas: true });
  const st = { I: 300, R: 2, m: 30, v: 4 };
  let t = -1.2, th = 0;
  const anim = playLoop((dt) => { t += dt; if (t > 0) th += omega() * dt; if (t > 5) { t = -1.2; th = 0; } draw(); });
  const omega = () => (st.m * st.v * st.R) / (st.I + st.m * st.R ** 2);
  controls.append(
    slider({ label: "Merry-go-round I", min: 50, max: 800, step: 10, value: st.I, unit: "kg·m²", onInput: (v) => { st.I = v; draw(); } }),
    slider({ label: "Radius", min: 1, max: 4, step: 0.1, value: st.R, unit: "m", onInput: (v) => { st.R = v; draw(); } }),
    slider({ label: "Child's mass", min: 10, max: 80, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    slider({ label: "Child's running speed", min: 1, max: 8, step: 0.1, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, Rp = Math.min(w, h) * 0.32;
    disk(ctx, c, cx, cy, Rp, th, { spokes: 6 });
    // child runs along the tangent at the top, then rides at the rim
    let px, py;
    if (t < 0) { px = cx + t * st.v * 30; py = cy - Rp; }
    else { px = cx + Rp * Math.cos(Math.PI / 2 + th); py = cy - Rp * Math.sin(Math.PI / 2 + th); }
    ctx.fillStyle = "#eb5757"; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
    if (t < 0) drawArrow(ctx, px, py - 16, 40, 0, C.v, "v");
    const Lc = st.m * st.v * st.R, It = st.I + st.m * st.R ** 2, om = omega();
    const K1 = 0.5 * st.m * st.v ** 2, K2 = 0.5 * It * om * om;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Before: L = mvR (child only)</th><td>${fmt(Lc, 1)} kg·m²/s</td></tr>
        <tr><th>After: I_total = I + mR²</th><td>${fmt(st.I, 0)} + ${fmt(st.m * st.R ** 2, 0)} = ${fmt(It, 0)} kg·m²</td></tr>
        <tr><th>ω = L / I_total</th><td><strong>${fmt(om, 2)} rad/s</strong></td></tr>
        <tr><th>KE before → after</th><td>${fmt(K1, 0)} J → ${fmt(K2, 0)} J (${fmt(((K1 - K2) / K1) * 100, 0)}% lost)</td></tr>
      </table>
      <p class="small muted" style="margin-top:8px">The child "sticks": angular momentum is conserved, kinetic energy is not, like a perfectly inelastic collision.</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}
