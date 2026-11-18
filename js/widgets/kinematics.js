// Unit 2 widgets: kinematic equation solver, braking distance, free fall.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt } from "./plane.js";
import { shell, button, row, select } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;

// =====================================================================
// Kinematic equation solver: know 3, find 1, skip 1 → pick the equation
// =====================================================================
const VARS = [
  ["dx", "Δx", "displacement", "m"],
  ["v0", "v₀", "initial velocity", "m/s"],
  ["v", "v", "final velocity", "m/s"],
  ["a", "a", "acceleration", "m/s²"],
  ["t", "t", "time", "s"],
];
const NAME = Object.fromEntries(VARS.map(([k, s]) => [k, s]));

// Smallest positive root of A t² + B t + C = 0, with a note about any second root.
function quadT(A, B, C) {
  if (Math.abs(A) < 1e-12) {
    const r = -C / B;
    return isFinite(r) && r >= 0 ? { value: r } : { error: "No positive time solves this." };
  }
  const disc = B * B - 4 * A * C;
  if (disc < 0) return { error: "No real time solves this. The object never reaches that displacement." };
  const roots = [(-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A)].filter((r) => r >= -1e-9).sort((a, b) => a - b);
  if (!roots.length) return { error: "Both solutions are negative times, so this never happens." };
  return { value: Math.max(0, roots[0]), note: roots.length > 1 && roots[1] - roots[0] > 1e-6 ? `The quadratic has a second answer, t = ${fmt(roots[1])} s: the object passes the same point again on its way back.` : "" };
}
const root = (x, label) => (x < 0 ? { error: `No real answer: ${label} would be negative under the square root, so these values can't all happen.` } : { value: Math.sqrt(x), note: "The square root gives ±. The + answer is shown; pick the sign that matches the direction of motion." });

// For each equation (named by the variable it leaves out): how to solve for each other variable.
const EQUATIONS = {
  dx: { eq: "v = v₀ + at", solve: {
    v: (k) => ({ value: k.v0 + k.a * k.t, form: "v = v₀ + at" }),
    v0: (k) => ({ value: k.v - k.a * k.t, form: "v₀ = v − at" }),
    a: (k) => ({ value: (k.v - k.v0) / k.t, form: "a = (v − v₀) / t" }),
    t: (k) => ({ value: (k.v - k.v0) / k.a, form: "t = (v − v₀) / a" }),
  } },
  v: { eq: "Δx = v₀t + ½at²", solve: {
    dx: (k) => ({ value: k.v0 * k.t + 0.5 * k.a * k.t ** 2, form: "Δx = v₀t + ½at²" }),
    v0: (k) => ({ value: (k.dx - 0.5 * k.a * k.t ** 2) / k.t, form: "v₀ = (Δx − ½at²) / t" }),
    a: (k) => ({ value: (2 * (k.dx - k.v0 * k.t)) / k.t ** 2, form: "a = 2(Δx − v₀t) / t²" }),
    t: (k) => ({ ...quadT(0.5 * k.a, k.v0, -k.dx), form: "solve ½at² + v₀t − Δx = 0 for t" }),
  } },
  t: { eq: "v² = v₀² + 2aΔx", solve: {
    v: (k) => ({ ...root(k.v0 ** 2 + 2 * k.a * k.dx, "v²"), form: "v = √(v₀² + 2aΔx)" }),
    v0: (k) => ({ ...root(k.v ** 2 - 2 * k.a * k.dx, "v₀²"), form: "v₀ = √(v² − 2aΔx)" }),
    a: (k) => ({ value: (k.v ** 2 - k.v0 ** 2) / (2 * k.dx), form: "a = (v² − v₀²) / (2Δx)" }),
    dx: (k) => ({ value: (k.v ** 2 - k.v0 ** 2) / (2 * k.a), form: "Δx = (v² − v₀²) / (2a)" }),
  } },
  a: { eq: "Δx = ½(v₀ + v)t", solve: {
    dx: (k) => ({ value: 0.5 * (k.v0 + k.v) * k.t, form: "Δx = ½(v₀ + v)t" }),
    v0: (k) => ({ value: (2 * k.dx) / k.t - k.v, form: "v₀ = 2Δx / t − v" }),
    v: (k) => ({ value: (2 * k.dx) / k.t - k.v0, form: "v = 2Δx / t − v₀" }),
    t: (k) => ({ value: (2 * k.dx) / (k.v0 + k.v), form: "t = 2Δx / (v₀ + v)" }),
  } },
  v0: { eq: "Δx = vt − ½at²", extra: true, solve: {
    dx: (k) => ({ value: k.v * k.t - 0.5 * k.a * k.t ** 2, form: "Δx = vt − ½at²" }),
    v: (k) => ({ value: (k.dx + 0.5 * k.a * k.t ** 2) / k.t, form: "v = (Δx + ½at²) / t" }),
    a: (k) => ({ value: (2 * (k.v * k.t - k.dx)) / k.t ** 2, form: "a = 2(vt − Δx) / t²" }),
    t: (k) => ({ ...quadT(0.5 * k.a, -k.v, k.dx), form: "solve ½at² − vt + Δx = 0 for t" }),
  } },
};
const SOLVER_PRESETS = {
  brakeDist: { label: "Braking car: how far?", mode: { dx: "find", v0: "known", v: "known", a: "known", t: "skip" }, val: { v0: 25, v: 0, a: -5 } },
  brakeTime: { label: "Braking car: how long?", mode: { dx: "skip", v0: "known", v: "known", a: "known", t: "find" }, val: { v0: 25, v: 0, a: -5 } },
  runner: { label: "Runner: acceleration?", mode: { dx: "skip", v0: "known", v: "known", a: "find", t: "known" }, val: { v0: 0, v: 8, t: 4 } },
  ballTop: { label: "Ball thrown up: max height?", mode: { dx: "find", v0: "known", v: "known", a: "known", t: "skip" }, val: { v0: 15, v: 0, a: -9.8 } },
};

export function kinematicsSolver(el) {
  const { controls, readout } = shell(el, { title: "Kinematic equation solver", icon: "🧠" });
  const mode = { ...SOLVER_PRESETS.brakeDist.mode }, val = { dx: 0, v0: 0, v: 0, a: 0, t: 0, ...SOLVER_PRESETS.brakeDist.val };
  const tbl = document.createElement("table");
  tbl.className = "solver";
  const inputs = {}, selects = {};
  VARS.forEach(([k, sym, desc, unit]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><strong>${sym}</strong> <span class="muted small">${desc}</span></td><td></td><td></td><td class="muted small">${unit}</td>`;
    const s = select([["known", "Known"], ["find", "Find this"], ["skip", "Not needed"]], mode[k], (m) => { mode[k] = m; render(); });
    const inp = document.createElement("input");
    inp.type = "number"; inp.step = "any"; inp.className = "input input-num"; inp.value = val[k];
    inp.setAttribute("aria-label", `${sym} value`);
    inp.addEventListener("input", () => { val[k] = Number(inp.value); render(); });
    tr.children[1].appendChild(s); tr.children[2].appendChild(inp);
    selects[k] = s; inputs[k] = inp;
    tbl.appendChild(tr);
  });
  const presetSel = select([["", "Load an example…"], ...Object.entries(SOLVER_PRESETS).map(([k, p]) => [k, p.label])], "", (k) => {
    if (!k) return;
    const p = SOLVER_PRESETS[k];
    Object.assign(mode, p.mode); Object.assign(val, p.val);
    VARS.forEach(([v]) => { selects[v].value = mode[v]; inputs[v].value = val[v] ?? 0; });
    render();
  });
  controls.append(row(presetSel), tbl);

  function render() {
    [...tbl.rows].forEach((tr, i) => {
      const k = VARS[i][0];
      tr.className = mode[k] === "find" ? "is-find" : mode[k] === "skip" ? "is-skip" : "";
      inputs[k].disabled = mode[k] !== "known";
    });
    const known = VARS.filter(([k]) => mode[k] === "known").map(([k]) => k);
    const find = VARS.filter(([k]) => mode[k] === "find").map(([k]) => k);
    const skip = VARS.filter(([k]) => mode[k] === "skip").map(([k]) => k);
    if (known.length !== 3 || find.length !== 1 || skip.length !== 1) {
      readout.innerHTML = `<div class="solve-steps"><p>Choose exactly <strong>3 known</strong>, <strong>1 to find</strong>, and <strong>1 not needed</strong>.</p><p class="muted small">Right now: ${known.length} known, ${find.length} to find, ${skip.length} not needed.</p></div>`;
      return;
    }
    const E = EQUATIONS[skip[0]];
    const r = E.solve[find[0]](val);
    const [, , , unit] = VARS.find(([k]) => k === find[0]);
    const bad = r.error || !isFinite(r.value);
    readout.innerHTML = `
      <div class="solve-steps">
        <p><strong>1. Known:</strong> ${known.map((k) => `${NAME[k]} = ${fmt(val[k], 2)}`).join(", ")}</p>
        <p><strong>2. Not needed:</strong> ${NAME[skip[0]]}, so use the equation without ${NAME[skip[0]]}:</p>
        <p class="eqn">${E.eq}${E.extra ? ' <span class="muted small">(a fifth form, built from the other four)</span>' : ""}</p>
        <p><strong>3. Solve for ${NAME[find[0]]}:</strong> <span class="eqn">${r.form}</span></p>
        <p><strong>4. Answer:</strong> ${bad ? `<span class="bad">${r.error || "Can't divide by zero with these values."}</span>` : `<span class="good" style="font-size:1.15rem"><strong>${NAME[find[0]]} = ${fmt(r.value, 2)} ${unit}</strong></span>`}</p>
        ${r.note ? `<p class="muted small">${r.note}</p>` : ""}
      </div>`;
  }
  render();
}

// =====================================================================
// Braking distance: d = v₀² / (2a) grows with the square of speed
// =====================================================================
export function braking(el) {
  const { canvas, controls, readout } = shell(el, { title: "Braking distance model", icon: "🛑", canvas: true, wide: true });
  let v0 = 25, dec = 5, t = null;
  let raf = 0, last = 0;
  const stopDist = (v) => (v * v) / (2 * dec);
  controls.append(
    slider({ label: "Starting speed v₀", min: 5, max: 50, step: 1, value: v0, unit: "m/s", onInput: (v) => { v0 = v; t = null; draw(); } }),
    slider({ label: "Braking deceleration", min: 2, max: 10, step: 0.5, value: dec, unit: "m/s²", onInput: (v) => { dec = v; t = null; draw(); } }),
    row(button("▶ Brake!", () => { t = 0; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }, "btn btn-primary btn-sm")),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function tick(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
    t += dt * 2; // run at double speed
    draw();
    if (t < v0 / dec) raf = requestAnimationFrame(tick);
  }
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const d = stopDist(v0), d2 = stopDist(2 * v0);
    const span = Math.max(d2, 50) * 1.05;
    const roadY = h * 0.32, left = 30, right = w - 80; // room for the end label
    const X = (x) => left + (x / span) * (right - left);
    // road
    ctx.fillStyle = c.border; ctx.fillRect(left, roadY - 14, right - left, 28);
    ctx.strokeStyle = c.surface; ctx.setLineDash([10, 10]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(left, roadY); ctx.lineTo(right, roadY); ctx.stroke(); ctx.setLineDash([]);
    const marker = (x, color, text, up) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(x), roadY - 22); ctx.lineTo(X(x), roadY + 22); ctx.stroke();
      ctx.fillStyle = color; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(text, X(x), up ? roadY - 28 : roadY + 34);
    };
    marker(0, c.text, "brakes on", true);
    marker(d, "#27ae60", `stops: ${fmt(d, 1)} m`, false);
    marker(d2, "#eb5757", `2× speed: ${fmt(d2, 1)} m`, true);
    // ghost car at the double-speed stop point, real car moving
    const tt = t === null ? v0 / dec : Math.min(t, v0 / dec);
    const x = v0 * tt - 0.5 * dec * tt * tt;
    ctx.globalAlpha = 0.25; ctx.fillStyle = "#eb5757"; ctx.fillRect(X(d2) - 22, roadY - 9, 22, 18); ctx.globalAlpha = 1;
    ctx.fillStyle = "#9b51e0"; ctx.fillRect(X(x) - 22, roadY - 9, 22, 18);
    // distance vs speed plot
    const P = panel(ctx, c, { x: 44, y: h * 0.56, w: w - 56, h: h * 0.36 }, { t1: 100, y0: 0, y1: Math.max(stopDist(100), 10) * 1.05, label: "stopping distance (m) vs. starting speed (m/s)" });
    P.frame();
    const vs = Array.from({ length: 101 }, (_, i) => i);
    P.curve(vs, vs.map(stopDist), "#9b51e0", 2.5);
    P.dot(v0, d, "#27ae60"); P.dot(2 * v0, d2, "#eb5757");
    readout.innerHTML = `
      <div class="readout">
        <div><span>Stopping distance v₀²/(2a)</span><span>${fmt(d, 1)} m</span></div>
        <div><span>Stopping time v₀/a</span><span>${fmt(v0 / dec, 2)} s</span></div>
        <div><span>At double the speed (${2 * v0} m/s)</span><span class="bad">${fmt(d2, 1)} m</span></div>
      </div>
      <p class="small" style="margin-top:8px">Doubling the speed multiplies the stopping distance by <strong>4</strong>, because distance depends on v₀².</p>`;
  }
  draw();
  return () => { cancelAnimationFrame(raf); destroy(); };
}

// =====================================================================
// Free fall with live y-t and v-t graphs
// =====================================================================
export function freeFall(el) {
  const { canvas, controls, readout } = shell(el, { title: "Free-fall model", icon: "🏀", canvas: true, tall: true });
  let v0 = 15, y0 = 0, t = 0;
  let raf = 0, last = 0;
  const tLand = () => {
    const disc = v0 * v0 + 2 * G * y0;
    return (v0 + Math.sqrt(disc)) / G;
  };
  let sv0, sy0;
  const stop = () => cancelAnimationFrame(raf);
  controls.append(
    (sv0 = slider({ label: "Launch velocity v₀ (+ is up)", min: -15, max: 25, step: 0.5, value: v0, unit: "m/s", onInput: (v) => { v0 = v; t = 0; stop(); draw(); } })),
    (sy0 = slider({ label: "Launch height y₀", min: 0, max: 40, step: 1, value: y0, unit: "m", onInput: (v) => { y0 = v; t = 0; stop(); draw(); } })),
    row(
      button("▶ Play", () => { if (t >= tLand()) t = 0; last = performance.now(); stop(); raf = requestAnimationFrame(tick); }, "btn btn-primary btn-sm"),
      button("Jump to top", () => { stop(); t = Math.max(0, v0 / G); draw(); }),
      button("Reset", () => { stop(); t = 0; draw(); }),
    ),
    row(
      button("Throw up at 15.0 m/s", () => { sv0.set(15); sy0.set(0); }),
      button("Drop from 20 m", () => { sv0.set(0); sy0.set(20); }),
      button("Throw down from 30 m", () => { sv0.set(-8); sy0.set(30); }),
    ),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function tick(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
    t = Math.min(tLand(), t + dt);
    draw();
    if (t < tLand()) raf = requestAnimationFrame(tick);
  }
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const T = tLand();
    if (!(T > 1e-6)) {
      ctx.fillStyle = c.muted; ctx.font = "14px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Throw it upward, or start above the ground.", w / 2, h / 2);
      readout.innerHTML = "";
      return;
    }
    const ymax = v0 > 0 ? y0 + (v0 * v0) / (2 * G) : y0;
    const top = Math.max(ymax, 5) * 1.12;
    const y = y0 + v0 * t - 0.5 * G * t * t, v = v0 - G * t;
    // left column: the ball
    const colW = Math.min(150, w * 0.3), gy = h - 26, Y = (yy) => gy - (yy / top) * (gy - 20);
    ctx.fillStyle = c.border; ctx.fillRect(0, gy, colW, 4);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, Y(0)); ctx.lineTo(30, Y(top)); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = "right";
    const step = top > 40 ? 10 : top > 15 ? 5 : 2;
    for (let k = 0; k <= top; k += step) ctx.fillText(k, 26, Y(k) + 3);
    if (v0 > 0) { ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(34, Y(ymax)); ctx.lineTo(colW, Y(ymax)); ctx.stroke(); ctx.setLineDash([]); ctx.textAlign = "left"; ctx.font = "10px Inter, sans-serif"; ctx.fillText(`max ${fmt(ymax, 1)} m`, 34, Y(ymax) - 5); }
    const bx = colW * 0.74;
    drawArrow(ctx, bx, Y(y), 0, -v * 2.4, "#2f80ed", "v");
    drawArrow(ctx, bx + 26, Y(y), 0, 34, "#f2994a", "a");
    ctx.fillStyle = "#e67e22"; ctx.strokeStyle = "#8a4b0f"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bx, Y(y), 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // right: y-t and v-t
    const ts = Array.from({ length: 121 }, (_, i) => (T * i) / 120);
    const ys = ts.map((tt) => y0 + v0 * tt - 0.5 * G * tt * tt), vs = ts.map((tt) => v0 - G * tt);
    const gx = colW + 40, gw = w - gx - 10, gh = (h - 54) / 2;
    const vlo = Math.min(...vs), vhi = Math.max(...vs, 0);
    const Py = panel(ctx, c, { x: gx, y: 8, w: gw, h: gh }, { t1: T, y0: 0, y1: top, label: "y (m)" });
    const Pv = panel(ctx, c, { x: gx, y: 30 + gh, w: gw, h: gh }, { t1: T, y0: vlo - 2, y1: vhi + 2, label: "v (m/s): slope = −9.80" });
    Py.frame(); Pv.frame();
    Py.curve(ts, ys, "#2f80ed"); Pv.curve(ts, vs, "#27ae60");
    Py.cursor(t); Pv.cursor(t); Py.dot(t, y, "#2f80ed"); Pv.dot(t, v, "#27ae60");
    const atTop = v0 > 0 && Math.abs(v) < 0.25;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>t</th><td>${fmt(t)} s</td></tr>
        <tr><th>y</th><td>${fmt(y)} m</td></tr>
        <tr><th>v</th><td>${fmt(v)} m/s</td></tr>
        <tr><th>a</th><td><strong>−9.80 m/s²</strong> (always)</td></tr>
        ${v0 > 0 ? `<tr><th>Max height</th><td>${fmt(ymax)} m at t = ${fmt(v0 / G)} s</td></tr>` : ""}
        <tr><th>Back at y = 0</th><td>t = ${fmt(T)} s at v = ${fmt(v0 - G * T)} m/s</td></tr>
      </table>
      ${atTop ? `<div class="verdict">At the top: v = 0 but a is still −9.80 m/s².</div>` : ""}`;
  }
  draw();
  return () => { stop(); destroy(); };
}
