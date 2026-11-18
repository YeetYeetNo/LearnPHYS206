// Unit 6 widgets: work, kinetic energy, springs, and power.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad } from "./plane.js";
import { shell, button, row } from "./shell.js";
import { panel } from "./graphs.js";
import { quiz } from "./applying.js";

const G = 9.8;
const POS = "#16a34a", NEG = "#d63c3c";
const fmtJ = (j) => (Math.abs(j) >= 10000 ? `${fmt(j / 1000, 1)} kJ` : `${fmt(j, Math.abs(j) < 10 ? 2 : 0)} J`);

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

// Vertical bar chart of signed energies inside a rectangle.
function energyBars(ctx, c, rect, bars, max) {
  const { x, y, w, h } = rect;
  const zero = y + h / 2, bw = Math.min(70, (w / bars.length) * 0.6);
  ctx.save();
  ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, zero); ctx.lineTo(x + w, zero); ctx.stroke();
  bars.forEach(([label, val, color], i) => {
    const cx = x + (w / bars.length) * (i + 0.5);
    const bh = (val / (max || 1)) * (h / 2 - 16);
    ctx.fillStyle = color || (val >= 0 ? POS : NEG);
    ctx.fillRect(cx - bw / 2, zero - Math.max(bh, 0), bw, Math.abs(bh));
    ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(label, cx, y + h - 2);
    ctx.font = "10px JetBrains Mono, monospace"; ctx.fillStyle = c.muted;
    ctx.fillText(fmtJ(val), cx, val >= 0 ? zero - bh - 5 : zero - bh + 12);
  });
  ctx.restore();
}

// =====================================================================
// Work and the angle φ: W = Fs cos φ
// =====================================================================
export function workAngle(el) {
  const { canvas, controls, readout } = shell(el, { title: "Work and the angle φ", icon: "🧳", canvas: true, wide: true });
  const st = { F: 50, phi: 35, s: 20 };
  const sl = {
    F: slider({ label: "Force F", min: 0, max: 150, step: 1, value: st.F, unit: "N", onInput: (v) => { st.F = v; draw(); } }),
    phi: slider({ label: "Angle φ between F and s", min: -180, max: 180, step: 1, value: st.phi, unit: "°", onInput: (v) => { st.phi = v; draw(); } }),
    s: slider({ label: "Displacement s", min: 0, max: 40, step: 1, value: st.s, unit: "m", onInput: (v) => { st.s = v; draw(); } }),
  };
  const load = (F, phi, s) => () => { sl.F.set(F); sl.phi.set(phi); sl.s.set(s); };
  controls.append(sl.F, sl.phi, sl.s, row(button("Suitcase example", load(50, 35, 20)), button("Normal force (90°)", load(100, 90, 20)), button("Friction (180°)", load(30, 180, 20)), button("Holding still (s = 0)", load(100, 90, 0))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const floor = h * 0.72, bx = w * 0.3;
    ctx.fillStyle = c.border; ctx.fillRect(0, floor, w, 4);
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(bx - 26, floor - 40, 52, 40);
    const W = st.F * st.s * Math.cos(rad(st.phi));
    const k = (h * 0.45) / 150;
    const fx = st.F * Math.cos(rad(st.phi)) * k, fy = -st.F * Math.sin(rad(st.phi)) * k;
    // displacement arrow along the floor
    ctx.save(); ctx.lineWidth = 3;
    drawArrow(ctx, bx, floor + 22, Math.max(2, (st.s / 40) * (w * 0.6)), 0, c.text, st.s ? `s = ${st.s} m` : "s = 0");
    ctx.restore();
    // force and its shadow along the motion
    const cy = floor - 20;
    ctx.save(); ctx.lineWidth = 6; ctx.globalAlpha = 0.5;
    ctx.strokeStyle = fx >= 0 ? POS : NEG; ctx.beginPath(); ctx.moveTo(bx, cy); ctx.lineTo(bx + fx, cy); ctx.stroke();
    ctx.restore();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(bx + fx, cy + fy); ctx.lineTo(bx + fx, cy); ctx.stroke(); ctx.setLineDash([]);
    drawArrow(ctx, bx, cy, fx, fy, "#9b51e0", `F = ${st.F} N`);
    const sign = Math.abs(W) < 0.5 ? "zero" : W > 0 ? "positive" : "negative";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Part of F along the motion, F cos φ</th><td>${fmt(st.F * Math.cos(rad(st.phi)), 1)} N</td></tr>
        <tr><th>Part across the motion, F sin φ</th><td>${fmt(Math.abs(st.F * Math.sin(rad(st.phi))), 1)} N (does no work)</td></tr>
        <tr><th>W = Fs cos φ</th><td><strong style="color:${sign === "zero" ? "inherit" : sign === "positive" ? POS : NEG}">${fmt(W, 0)} J</strong></td></tr>
      </table>
      <div class="verdict">${st.s === 0 ? "Nothing moves, so no work is done, however hard you push." : sign === "zero" ? "The force is perpendicular to the motion: zero work." : sign === "positive" ? "φ < 90°: positive work, adding energy." : "φ > 90°: negative work, removing energy."}</div>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Positive, zero, or negative work?
// =====================================================================
export function workSignQuiz(el) {
  quiz(el, {
    title: "Positive, zero, or negative work?",
    icon: "➕",
    choices: [["pos", "Positive"], ["zero", "Zero"], ["neg", "Negative"]],
    items: [
      { text: "You push a shopping cart forward.", answer: "pos", why: "Force and motion point the same way (φ = 0°)." },
      { text: "Friction on a box sliding across the floor.", answer: "neg", why: "Friction points opposite the motion (φ = 180°)." },
      { text: "The normal force on a hockey puck gliding across level ice.", answer: "zero", why: "n is vertical and the motion is horizontal (φ = 90°)." },
      { text: "You hold a heavy backpack perfectly still for 10 minutes.", answer: "zero", why: "Nothing moves, so s = 0. You get tired, but you do no work on the backpack." },
      { text: "Gravity on a ball as it falls.", answer: "pos", why: "Gravity points down and the ball moves down." },
      { text: "Gravity on a ball as it rises.", answer: "neg", why: "Gravity points down while the ball moves up, so it slows the ball." },
      { text: "Your upward force on a box you carry across a room at constant height and speed.", answer: "zero", why: "Your force is vertical, the motion is horizontal." },
      { text: "The brakes on a moving car.", answer: "neg", why: "The braking force opposes the motion and removes kinetic energy." },
    ],
  });
}

// =====================================================================
// Total work: a table of every force on the crate
// =====================================================================
export function workTable(el) {
  const { canvas, controls, readout } = shell(el, { title: "Crate work table", icon: "📋", canvas: true, wide: true });
  const st = { m: 40, T: 150, ang: 0, mu: 0.25, d: 8 };
  const sl = {
    T: slider({ label: "Rope tension T", min: 0, max: 400, step: 5, value: st.T, unit: "N", onInput: (v) => { st.T = v; draw(); } }),
    ang: slider({ label: "Rope angle above horizontal", min: 0, max: 60, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; draw(); } }),
    mu: slider({ label: "Kinetic friction μₖ", min: 0, max: 0.8, step: 0.05, value: st.mu, onInput: (v) => { st.mu = v; draw(); } }),
    m: slider({ label: "Mass", min: 5, max: 100, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    d: slider({ label: "Distance pulled", min: 1, max: 20, step: 0.5, value: st.d, unit: "m", onInput: (v) => { st.d = v; draw(); } }),
  };
  controls.append(sl.T, sl.ang, sl.mu, sl.m, sl.d, row(button("Worked example", () => { sl.T.set(150); sl.ang.set(0); sl.mu.set(0.25); sl.m.set(40); sl.d.set(8); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const W = st.m * G, Ty = st.T * Math.sin(rad(st.ang)), Tx = st.T * Math.cos(rad(st.ang));
    const n = Math.max(0, W - Ty), f = st.mu * n;
    const rows = [
      ["Tension", st.T, `${st.ang}°`, Tx * st.d, "#9b51e0"],
      ["Friction", f, "180°", -f * st.d, "#eb5757"],
      ["Normal force", n, "90°", 0, "#2f80ed"],
      ["Weight", W, "90°", 0, "#27ae60"],
    ];
    const total = rows.reduce((s, r) => s + r[3], 0);
    // crate with its forces on the left, bar chart on the right
    const floor = h * 0.62, bx = w * 0.18;
    ctx.fillStyle = c.border; ctx.fillRect(0, floor, w * 0.4, 4);
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(bx - 24, floor - 38, 48, 38);
    const k = 60 / Math.max(W, st.T, 1), cy = floor - 19;
    drawArrow(ctx, bx, cy, Tx * k, -Ty * k, "#9b51e0", "T");
    if (f > 0) drawArrow(ctx, bx - 24, floor - 4, -f * k, 0, "#eb5757", "f");
    drawArrow(ctx, bx, cy, 0, -n * k, "#2f80ed", "n");
    drawArrow(ctx, bx, cy, 0, W * k, "#27ae60", "w");
    const max = Math.max(...rows.map((r) => Math.abs(r[3])), Math.abs(total), 1);
    energyBars(ctx, c, { x: w * 0.42, y: 10, w: w * 0.56, h: h - 20 }, [...rows.map((r) => [r[0].split(" ")[0], r[3]]), ["Total", total, total >= 0 ? "#0e7490" : "#9f1239"]], max);
    const netF = Tx - f;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Force</th><th>Size</th><th>Angle to motion</th><th>Work</th></tr>
        ${rows.map(([name, size2, ang, work, color]) => `<tr><td style="color:${color}">${name}</td><td>${fmt(size2, 0)} N</td><td>${ang}</td><td>${work ? (work > 0 ? "+" : "") + fmt(work, 0) : 0} J</td></tr>`).join("")}
        <tr><th colspan="3">Total work (add the column)</th><td><strong>${fmt(total, 0)} J</strong></td></tr>
        <tr><th colspan="3">Check: (ΣF)·s = (${fmt(netF, 1)} N)(${st.d} m)</th><td>${fmt(netF * st.d, 0)} J</td></tr>
      </table>
      <p class="small" style="margin-top:8px">${W - Ty < 0 ? "The rope lifts the crate off the floor at this angle. " : ""}${total > 0 ? `Starting from rest, it would reach v = √(2W/m) = <strong>${fmt(Math.sqrt((2 * total) / st.m), 2)} m/s</strong> (next lesson).` : "Total work isn't positive, so a crate starting from rest wouldn't speed up: the pull doesn't beat friction."}</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// K = ½mv²: doubling v quadruples K
// =====================================================================
export function keSpeed(el) {
  const { canvas, controls, readout } = shell(el, { title: "Kinetic energy vs. speed", icon: "🚀", canvas: true, wide: true });
  let m = 1200, v = 13.4;
  controls.append(
    slider({ label: "Mass", min: 1, max: 2000, step: 1, value: m, unit: "kg", onInput: (val) => { m = val; draw(); } }),
    slider({ label: "Speed v", min: 0, max: 20, step: 0.1, value: v, unit: "m/s", onInput: (val) => { v = val; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    ctx.clearRect(0, 0, size.w, size.h);
    const vs = Array.from({ length: 81 }, (_, i) => i / 2);
    const K = (s) => 0.5 * m * s * s;
    const P = panel(ctx, c, { x: 56, y: 10, w: size.w - 68, h: size.h - 34 }, { t1: 40, y0: 0, y1: K(40) * 1.05, label: "K (J) vs. speed v (m/s)" });
    P.frame();
    P.curve(vs, vs.map(K), "#9b51e0");
    P.dot(v, K(v), "#2f80ed", 6);
    P.dot(2 * v, K(2 * v), "#eb5757", 6);
    readout.innerHTML = `
      <div class="readout">
        <div><span style="color:#2f80ed">K at ${fmt(v, 1)} m/s</span><span>${fmtJ(K(v))}</span></div>
        <div><span style="color:#eb5757">K at ${fmt(2 * v, 1)} m/s (double)</span><span>${fmtJ(K(2 * v))}</span></div>
        <div><span>Ratio</span><span>${v > 0 ? "4×" : "—"}</span></div>
      </div>
      <p class="small" style="margin-top:8px">13.4 m/s is about 30 mph, and double is about 60 mph. Four times the energy means about four times the braking distance.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Work-energy bar chart: K₁ + ΣW = K₂, as the object moves
// =====================================================================
const WE = {
  crate: { label: "Crate pulled from rest (Example 1)", m: 40, v0: 0, smax: 8, vertical: false, forces: [["Tension", 150, 0, "#9b51e0"], ["Friction", 98, 180, "#eb5757"], ["Normal", 392, 90, "#2f80ed"], ["Weight", 392, 90, "#27ae60"]] },
  brake: { label: "Car braking at 25 m/s (Example 2)", m: 1200, v0: 25, smax: 70, vertical: false, forces: [["Friction", 6000, 180, "#eb5757"], ["Normal", 11760, 90, "#2f80ed"], ["Weight", 11760, 90, "#27ae60"]] },
  drop: { label: "Object dropped 5.0 m (Example 3)", m: 2, v0: 0, smax: 5, vertical: true, forces: [["Gravity", 19.6, 0, "#27ae60"]] },
};
export function workEnergyBars(el) {
  const { canvas, controls, readout } = shell(el, { title: "Work-energy bar chart", icon: "📊", canvas: true, wide: true });
  let key = "crate", s = 8;
  let sS;
  const sc = () => WE[key];
  const sStop = () => {
    const S = sc();
    const perM = S.forces.reduce((t, [, F, a]) => t + F * Math.cos(rad(a)), 0);
    const K1 = 0.5 * S.m * S.v0 * S.v0;
    return perM < 0 ? Math.min(S.smax, K1 / -perM) : S.smax;
  };
  const anim = playLoop((dt) => { s = Math.min(sStop(), s + dt * (sStop() / 3)); sS.set(+s.toFixed(2)); return s < sStop(); });
  const build = () => {
    controls.innerHTML = "";
    const seg = row();
    Object.entries(WE).forEach(([k, v]) => {
      const b = button(v.label, () => { anim.stop(); key = k; s = sStop(); build(); });
      if (k === key) b.classList.add("active");
      seg.appendChild(b);
    });
    sS = slider({ label: sc().vertical ? "Distance fallen" : "Distance traveled", min: 0, max: +sStop().toFixed(2), step: 0.01, value: s, unit: "m", onInput: (v) => { s = v; draw(); } });
    controls.append(seg, sS, row(button("▶ Play", () => { s = 0; anim.start(); }, "btn btn-primary btn-sm")));
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const S = sc();
    const K1 = 0.5 * S.m * S.v0 * S.v0;
    const works = S.forces.map(([name, F, a, color]) => [name, F * s * Math.cos(rad(a)), color]);
    const K2 = Math.max(0, K1 + works.reduce((t, x) => t + x[1], 0));
    const v2 = Math.sqrt((2 * K2) / S.m);
    // track
    const L = w * 0.36, ox = 20;
    ctx.fillStyle = c.border;
    if (S.vertical) {
      ctx.fillRect(ox + 40, 10, 4, h - 20);
      const y = 16 + (s / S.smax) * (h - 40);
      ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(ox + 70, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`${fmt(s, 2)} m`, ox + 86, y + 4);
    } else {
      ctx.fillRect(ox, h * 0.6, L, 4);
      const x = ox + 10 + (s / S.smax) * (L - 50);
      ctx.fillStyle = key === "brake" ? "#2f80ed" : "#8d6e63"; ctx.fillRect(x, h * 0.6 - 30, 40, 30);
      ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`s = ${fmt(s, 2)} m, v = ${fmt(v2, 2)} m/s`, ox, h * 0.6 + 22);
    }
    const max = Math.max(K1, K2, ...works.map((x) => Math.abs(x[1])), 1);
    energyBars(ctx, c, { x: w * 0.42, y: 8, w: w * 0.56, h: h - 16 }, [["K₁", K1, "#0e7490"], ...works.map(([n, val]) => [`W ${n.toLowerCase()}`, val]), ["K₂", K2, "#0e7490"]], max);
    readout.innerHTML = `
      <div class="conv-chain" data-lenis-prevent>K₁ + ΣW = K₂: ${fmtJ(K1)} ${works.map(([, val]) => (val < 0 ? "− " : "+ ") + fmtJ(Math.abs(val))).join(" ")} = <strong>${fmtJ(K2)}</strong></div>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>Speed now: v = √(2K₂/m)</th><td><strong>${fmt(v2, 2)} m/s</strong></td></tr>
        ${key === "brake" && K2 < 1 ? `<tr><th>Stopped after</th><td><strong>${fmt(s, 1)} m</strong></td></tr>` : ""}
      </table>
      <p class="small muted">Forces at 90° to the motion do zero work, so their bars stay flat.</p>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// Draws a zig-zag spring between two x positions at height y.
function coil(ctx, x0, x1, y, color, turns = 10) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y);
  const n = turns * 2;
  for (let i = 1; i < n; i++) ctx.lineTo(x0 + ((x1 - x0) * i) / n, y + (i % 2 ? -9 : 9));
  ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
}

// =====================================================================
// Spring work as the area under F = kx
// =====================================================================
export function springWork(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spring work as an area", icon: "🌀", canvas: true, wide: true });
  const st = { k: 200, x: 0.15, x1: 0.1, x2: 0.2, mode: "one" };
  const XMAX = 0.4;
  const build = () => {
    controls.innerHTML = "";
    const seg = row();
    [["one", "From relaxed: 0 → x"], ["two", "Between two stretches: x₁ → x₂"]].forEach(([k, label]) => {
      const b = button(label, () => { st.mode = k; build(); });
      if (k === st.mode) b.classList.add("active");
      seg.appendChild(b);
    });
    const kS = slider({ label: "Spring constant k", min: 50, max: 1000, step: 10, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; draw(); } });
    controls.append(seg, kS);
    if (st.mode === "one") {
      const xS = slider({ label: "Stretch x", min: 0, max: XMAX, step: 0.01, value: st.x, unit: "m", onInput: (v) => { st.x = v; draw(); } });
      controls.append(xS, row(button("Example (k = 200, x = 0.15 m)", () => { kS.set(200); xS.set(0.15); })));
    } else {
      controls.append(
        slider({ label: "Start x₁", min: 0, max: XMAX, step: 0.01, value: st.x1, unit: "m", onInput: (v) => { st.x1 = Math.min(v, st.x2); draw(); } }),
        slider({ label: "End x₂", min: 0, max: XMAX, step: 0.01, value: st.x2, unit: "m", onInput: (v) => { st.x2 = Math.max(v, st.x1); draw(); } }),
      );
    }
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const [a, b] = st.mode === "one" ? [0, st.x] : [st.x1, st.x2];
    // spring at the top
    const wallX = 30, relaxed = w * 0.28, sx = (x) => relaxed + (x / XMAX) * (w * 0.38); // leaves room for the force label
    ctx.fillStyle = c.muted; ctx.fillRect(wallX - 8, 10, 8, 50);
    coil(ctx, wallX, sx(b), 35, c.text);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(sx(b), 20, 30, 30);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(relaxed, 12); ctx.lineTo(relaxed, 66); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("relaxed", relaxed, 76);
    if (b > 0) {
      drawArrow(ctx, sx(b) + 34, 35, Math.min(50, 10 + st.k * b * 0.15), 0, "#9b51e0", null);
      ctx.fillStyle = "#9b51e0"; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`F = kx = ${fmt(st.k * b, 1)} N`, sx(b) + 34, 16);
    }
    // F-x graph
    const P = panel(ctx, c, { x: 50, y: 92, w: w - 62, h: h - 116 }, { t1: XMAX, y0: 0, y1: st.k * XMAX * 1.05, label: "F (N) vs. stretch x (m)" });
    P.frame();
    const xs = Array.from({ length: 81 }, (_, i) => (XMAX * i) / 80);
    // shaded true area
    ctx.save(); ctx.fillStyle = "rgba(22,163,74,.3)"; ctx.beginPath();
    ctx.moveTo(P.X(a), P.Y(0)); ctx.lineTo(P.X(a), P.Y(st.k * a)); ctx.lineTo(P.X(b), P.Y(st.k * b)); ctx.lineTo(P.X(b), P.Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    // the common wrong answers, dashed
    ctx.save(); ctx.strokeStyle = "#d63c3c"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    if (st.mode === "one") ctx.strokeRect(P.X(0), P.Y(st.k * b), P.X(b) - P.X(0), P.Y(0) - P.Y(st.k * b));
    else { const d = b - a; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(d), P.Y(st.k * d)); ctx.lineTo(P.X(d), P.Y(0)); ctx.closePath(); ctx.stroke(); }
    ctx.restore();
    P.curve(xs, xs.map((x) => st.k * x), "#9b51e0");
    const right = 0.5 * st.k * (b * b - a * a);
    const wrong = st.mode === "one" ? st.k * b * b : 0.5 * st.k * (b - a) ** 2;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Force at the end, k·x${st.mode === "one" ? "" : "₂"}</th><td>${fmt(st.k * b, 1)} N</td></tr>
        <tr><th style="color:${POS}">Work = shaded area = ½k(${st.mode === "one" ? "x²" : "x₂² − x₁²"})</th><td><strong>${fmtJ(right)}</strong></td></tr>
        <tr><th style="color:${NEG}">Mistake: ${st.mode === "one" ? "F × x (dashed rectangle)" : "½k(x₂ − x₁)² (dashed triangle)"}</th><td><s>${fmtJ(wrong)}</s></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${st.mode === "one" ? "The force starts at zero and builds up, so the area is a triangle, half the rectangle." : "Stretching further takes more work per meter, because the spring is already pulling back harder. That extra strip under the line is why the wrong triangle comes out too small."}</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Spring launcher: ½kx² of spring work becomes ½mv²
// =====================================================================
export function springLauncher(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spring launcher", icon: "🏹", canvas: true, wide: true });
  const st = { k: 800, X: 0.1, m: 0.5 };
  let t = 0, running = false;
  const sl = {
    k: slider({ label: "Spring constant k", min: 100, max: 2000, step: 50, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; t = 0; draw(); } }),
    X: slider({ label: "Compression", min: 0.02, max: 0.3, step: 0.01, value: st.X, unit: "m", onInput: (v) => { st.X = v; t = 0; draw(); } }),
    m: slider({ label: "Block mass", min: 0.1, max: 3, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; t = 0; draw(); } }),
  };
  const om = () => Math.sqrt(st.k / st.m), tRel = () => Math.PI / (2 * om());
  const anim = playLoop((dt) => { t += dt * Math.min(1, 0.6 / tRel()) * 0.6; draw(); return t < tRel() + 1.2; });
  controls.append(sl.k, sl.X, sl.m, row(button("▶ Release", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Worked example", () => { sl.k.set(800); sl.X.set(0.1); sl.m.set(0.5); })));
  const state = () => {
    const w = om(), T = tRel(), vmax = st.X * w;
    if (t <= T) return { x: -st.X * Math.cos(w * t), v: st.X * w * Math.sin(w * t) };
    return { x: (t - T) * vmax, v: vmax };
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const { x, v } = state();
    const relaxed = w * 0.3, scale = (w * 0.18) / 0.3;
    const floor = h * 0.5;
    ctx.fillStyle = c.border; ctx.fillRect(0, floor, w * 0.62, 4);
    ctx.fillStyle = c.muted; ctx.fillRect(14, floor - 50, 8, 50);
    const springEnd = relaxed + Math.min(0, x) * scale;
    coil(ctx, 22, springEnd, floor - 18, c.text);
    const bx = relaxed + x * scale;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(bx, floor - 34, 34, 34);
    if (v > 0.01) drawArrow(ctx, bx + 17, floor - 46, Math.min(80, v * 12), 0, "#2f80ed", `v = ${fmt(v, 2)} m/s`);
    const Wsp = 0.5 * st.k * (st.X ** 2 - Math.min(0, x) ** 2), K = 0.5 * st.m * v * v;
    energyBars(ctx, c, { x: w * 0.64, y: 8, w: w * 0.34, h: h - 16 }, [["W spring so far", Wsp, POS], ["K", K, "#0e7490"]], 0.5 * st.k * st.X ** 2);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Total spring work ½kx²</th><td>${fmtJ(0.5 * st.k * st.X ** 2)}</td></tr>
        <tr><th>Launch speed v = √(2W/m)</th><td><strong>${fmt(st.X * om(), 2)} m/s</strong></td></tr>
        <tr><th>Push at release, kx</th><td>${fmt(st.k * st.X, 1)} N, fading to 0</td></tr>
      </table>
      <p class="small" style="margin-top:8px">The force changes the whole time, so the constant-acceleration equations can't do this. The work-energy theorem does it in two lines.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Power on the stairs: same work, different time
// =====================================================================
export function stairsPower(el) {
  const { canvas, controls, readout } = shell(el, { title: "Stair-climbing power", icon: "🏃", canvas: true, wide: true });
  const st = { m: 60, h: 4, t: 5 };
  let p = 0;
  controls.append(
    slider({ label: "Mass", min: 30, max: 120, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; draw(); } }),
    slider({ label: "Height of the stairs", min: 1, max: 15, step: 0.5, value: st.h, unit: "m", onInput: (v) => { st.h = v; draw(); } }),
    slider({ label: "Time to climb", min: 1, max: 30, step: 0.5, value: st.t, unit: "s", onInput: (v) => { st.t = v; draw(); } }),
    row(button("▶ Climb", () => { p = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  const anim = playLoop((dt) => { p = Math.min(1, p + dt / Math.min(4, st.t / 2)); draw(); return p < 1; });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const steps = 10, sw = (w * 0.45) / steps, shh = (h * 0.75) / steps;
    ctx.fillStyle = c.border;
    for (let i = 0; i < steps; i++) ctx.fillRect(20 + i * sw, h - 10 - (i + 1) * shh, w * 0.45 - i * sw, shh);
    const q = p * steps;
    const px = 20 + q * sw + sw / 2, py = h - 10 - q * shh - 14;
    ctx.fillStyle = "#9b51e0"; ctx.beginPath(); ctx.arc(px, py - 14, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(px - 4, py - 7, 8, 20);
    const W = st.m * G * st.h, P = W / st.t, Pwalk = W / (st.t * 3);
    const bx = w * 0.56, bw = w * 0.4, maxP = Math.max(P, 1500);
    [[`This climb (${st.t} s)`, P, "#eb5757"], [`Walking it (${st.t * 3} s)`, Pwalk, "#2f80ed"]].forEach(([label, val, color], i) => {
      const y = 30 + i * 60;
      ctx.fillStyle = c.text; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(label, bx, y);
      ctx.fillStyle = c.border; ctx.fillRect(bx, y + 8, bw, 16);
      ctx.fillStyle = color; ctx.fillRect(bx, y + 8, (val / maxP) * bw, 16);
      ctx.fillStyle = c.muted; ctx.font = "11px JetBrains Mono, monospace"; ctx.fillText(`${fmt(val, 0)} W`, bx, y + 40);
    });
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Work against gravity, mgh</th><td>${fmt(W, 0)} J (same either way)</td></tr>
        <tr><th>Power, W/t</th><td><strong>${fmt(P, 0)} W</strong> = ${fmt(P / 746, 2)} hp</td></tr>
        <tr><th>Taking 3× as long</th><td>${fmt(Pwalk, 0)} W</td></tr>
      </table>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Engine power: P = Fv
// =====================================================================
export function enginePower(el) {
  const { controls, readout } = shell(el, { title: "Engine power, P = Fv", icon: "🚗" });
  const st = { F: 2000, v: 25 };
  const fS = slider({ label: "Driving force F", min: 0, max: 10000, step: 100, value: st.F, unit: "N", onInput: (v) => { st.F = v; render(); } });
  const vS = slider({ label: "Speed v", min: 0, max: 45, step: 0.5, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; render(); } });
  controls.append(fS, vS, row(button("Cruising car (worked example)", () => { fS.set(2000); vS.set(25); })));
  function render() {
    const P = st.F * st.v;
    const pct = Math.min(100, (P / 300000) * 100);
    readout.innerHTML = `
      <div class="bars"><div class="bar-row"><span class="bar-label">Power</span><span class="bar"><span style="width:${pct}%"></span></span><span class="bar-val">${fmt(P / 1000, 1)} kW</span></div></div>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>P = Fv</th><td>(${st.F} N)(${st.v} m/s) = <strong>${fmt(P, 0)} W</strong></td></tr>
        <tr><th>In horsepower (÷ 746)</th><td><strong>${fmt(P / 746, 0)} hp</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">At a steady speed the force just balances air resistance and road friction, so all this power goes into fighting them. K stays constant.</p>`;
  }
  render();
}
