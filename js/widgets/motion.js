// Unit 2 widgets: motion along a straight line.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt } from "./plane.js";
import { shell, button, row, select, table } from "./shell.js";
import { panel, rangeOf, integrate } from "./graphs.js";

const COL = { x: "#2f80ed", v: "#27ae60", a: "#f2994a", obj: "#9b51e0" };
// Draws a horizontal number line inside a rectangle; returns its x → pixel mapping.
function numberLine(ctx, c, { left, right, y, lo, hi, unit = "m" }) {
  const X = (x) => left + ((x - lo) / (hi - lo)) * (right - left);
  ctx.save();
  ctx.strokeStyle = c.muted; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
  ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = "center";
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((s) => (hi - lo) / s <= 10) || 200;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    ctx.strokeStyle = v === 0 ? c.text : c.muted; ctx.lineWidth = v === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(X(v), y - 5); ctx.lineTo(X(v), y + 5); ctx.stroke();
    ctx.fillText(String(v).replace("-", "−"), X(v), y + 17);
  }
  ctx.textAlign = "right"; ctx.fillText(`x (${unit})`, right, y - 10);
  ctx.restore();
  return X;
}

const motionState = (v, a) => {
  if (Math.abs(v) < 1e-6) return Math.abs(a) < 1e-6 ? "at rest" : "momentarily at rest";
  if (Math.abs(a) < 1e-6) return "constant velocity";
  return v * a > 0 ? "speeding up" : "slowing down";
};

function playLoop(onFrame) {
  let raf = 0, last = 0, running = false;
  const tick = (now) => {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (onFrame(dt) === false) { running = false; return; }
    raf = requestAnimationFrame(tick);
  };
  return {
    start() { cancelAnimationFrame(raf); running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    get running() { return running; },
  };
}

// =====================================================================
// 1D trip builder: displacement vs. distance, average velocity vs. speed
// =====================================================================
export function trip1d(el) {
  const { canvas, controls, readout } = shell(el, { title: "1D trip builder", icon: "🚗", canvas: true, wide: true });
  let legs = [[120, 10], [-40, 5]];
  let tNow = null; // animation time; null = show whole trip
  const sliders = [];
  const leg = (i) => {
    const box = document.createElement("div");
    box.className = "widget-controls";
    box.innerHTML = `<strong class="small">Leg ${i + 1}</strong>`;
    const d = slider({ label: "Displacement", min: -150, max: 150, step: 5, value: legs[i][0], unit: "m", onInput: (v) => { legs[i][0] = v; tNow = null; draw(); } });
    const t = slider({ label: "Time", min: 1, max: 30, step: 1, value: legs[i][1], unit: "s", onInput: (v) => { legs[i][1] = v; tNow = null; draw(); } });
    sliders.push([d, t]);
    box.append(d, t);
    return box;
  };
  const set = (L) => { L.forEach(([d, t], i) => { sliders[i][0].set(d); sliders[i][1].set(t); }); };
  const anim = playLoop((dt) => {
    const T = legs[0][1] + legs[1][1];
    tNow += dt * (T / 4); // whole trip plays in about 4 s
    draw();
    if (tNow >= T) { tNow = null; draw(); return false; }
  });
  controls.append(leg(0), leg(1), row(
    button("▶ Play trip", () => { tNow = 0; anim.start(); }, "btn btn-primary btn-sm"),
    button("Car: 120 m E, 40 m W", () => set([[120, 10], [-40, 5]])),
    button("Run: 0 → 50 → 20 m", () => set([[50, 10], [-30, 10]])),
    button("No reversal", () => set([[60, 10], [40, 10]])),
  ));
  const t = table(readout);
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());

  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    const p1 = legs[0][0], p2 = p1 + legs[1][0];
    const lo = Math.min(0, p1, p2) - 15, hi = Math.max(0, p1, p2) + 15;
    ctx.clearRect(0, 0, w, h);
    const y = h * 0.62;
    const X = numberLine(ctx, c, { left: 24, right: w - 24, y, lo, hi });
    // path legs drawn above the line, one row per leg
    drawArrow(ctx, X(0), y - h * 0.42, X(p1) - X(0), 0, c.muted, `leg 1: ${legs[0][0] > 0 ? "+" : ""}${legs[0][0]} m`);
    drawArrow(ctx, X(p1), y - h * 0.24, X(p2) - X(p1), 0, c.muted, `leg 2: ${legs[1][0] > 0 ? "+" : ""}${legs[1][0]} m`);
    // displacement below the line
    ctx.save(); ctx.lineWidth = 4;
    drawArrow(ctx, X(0), y + h * 0.26, X(p2) - X(0), 0, COL.v, "Δx");
    ctx.restore();
    // moving object
    let pos = p2;
    if (tNow !== null) {
      const [d1, t1] = legs[0], [d2, t2] = legs[1];
      pos = tNow < t1 ? (d1 * tNow) / t1 : d1 + (d2 * Math.min(tNow - t1, t2)) / t2;
    }
    ctx.fillStyle = COL.obj; ctx.strokeStyle = c.surface; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(pos), y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("start", X(0), y - 12);

    const T = legs[0][1] + legs[1][1];
    const dist = Math.abs(legs[0][0]) + Math.abs(legs[1][0]);
    const vav = p2 / T, sav = dist / T;
    t([
      ["Displacement Δx", `<strong style="color:${COL.v}">${fmt(p2, 0)} m</strong>`],
      ["Distance traveled", `${fmt(dist, 0)} m`],
      ["Total time Δt", `${T} s`],
      ["Average velocity Δx/Δt", `<strong>${vav >= 0 ? "+" : ""}${fmt(vav, 2)} m/s</strong>`],
      ["Average speed (distance/Δt)", `<strong>${fmt(sav, 2)} m/s</strong>`],
    ]);
    readout.insertAdjacentHTML("beforeend", `<p class="small" style="margin-top:8px">${Math.abs(Math.abs(vav) - sav) < 1e-9 ? "No reversal, so |average velocity| equals average speed." : "The object reversed direction, so average speed is bigger than |average velocity|."}</p>`);
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// x-t graph: secant (average velocity) shrinking into the tangent (instantaneous)
// =====================================================================
const XT = {
  cyclist: { label: "Cyclist: x = 3.0t² + 2.0t", f: (t) => 3 * t * t + 2 * t, df: (t) => 6 * t + 2, tMax: 5, t1: 4 },
  outback: { label: "Out and back: x = 12t − 2.0t²", f: (t) => 12 * t - 2 * t * t, df: (t) => 12 - 4 * t, tMax: 6, t1: 1 },
  constant: { label: "Constant velocity: x = 4.0t − 5.0", f: (t) => 4 * t - 5, df: () => 4, tMax: 5, t1: 1.5 },
};
export function xtTangent(el) {
  const { canvas, controls, readout } = shell(el, { title: "Tangent vs. secant explorer", icon: "📈", canvas: true });
  let key = "cyclist", t1 = XT.cyclist.t1, dt = 1;
  let s1, s2;
  const shrink = playLoop((d) => { dt = Math.max(0.01, dt * (1 - 2.2 * d)); s2.set(+dt.toFixed(2)); return dt > 0.011; });
  const build = () => {
    controls.innerHTML = "";
    const fx = XT[key];
    s1 = slider({ label: "Time t", min: 0, max: fx.tMax, step: 0.05, value: t1, unit: "s", onInput: (v) => { t1 = v; draw(); } });
    s2 = slider({ label: "Interval Δt", min: 0.01, max: fx.tMax / 2, step: 0.01, value: dt, unit: "s", onInput: (v) => { dt = v; draw(); } });
    controls.append(
      row(select(Object.entries(XT).map(([k, v]) => [k, v.label]), key, (v) => { key = v; t1 = XT[v].t1; dt = 1; build(); })),
      s1, s2,
      row(button("Shrink Δt → 0", () => { shrink.start(); }, "btn btn-primary btn-sm"), button("Reset Δt", () => { shrink.stop(); s2.set(1); })),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const fx = XT[key];
    const ts = Array.from({ length: 201 }, (_, i) => (fx.tMax * i) / 200);
    const xs = ts.map(fx.f);
    const [y0, y1] = rangeOf(xs);
    ctx.clearRect(0, 0, size.w, size.h);
    const P = panel(ctx, c, { x: 44, y: 10, w: size.w - 56, h: size.h - 34 }, { t1: fx.tMax, y0, y1, label: "x (m) vs. t (s)" });
    P.frame();
    P.curve(ts, xs, COL.x, 3);
    const tb = Math.min(fx.tMax, t1 + dt);
    const xa = fx.f(t1), xb = fx.f(tb);
    const avg = tb > t1 ? (xb - xa) / (tb - t1) : fx.df(t1);
    // secant extended a little beyond its two points
    ctx.save(); ctx.strokeStyle = "#f2994a"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.rect(44, 10, size.w - 56, size.h - 34); ctx.clip();
    const ext = 0.6;
    P.seg(P.X(t1 - ext), P.Y(xa - avg * ext), P.X(tb + ext), P.Y(xb + avg * ext));
    ctx.restore();
    P.tangent(t1, xa, fx.df(t1), COL.v, fx.tMax * 0.22);
    P.dot(t1, xa, COL.v);
    P.dot(tb, xb, "#f2994a");
    const v = fx.df(t1);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th style="color:#f2994a">Average velocity (secant)</th><td>Δx/Δt = ${fmt(xb - xa)} / ${fmt(tb - t1)} = <strong>${fmt(avg)} m/s</strong></td></tr>
        <tr><th style="color:${COL.v}">Instantaneous velocity (tangent)</th><td>dx/dt at t = ${fmt(t1)} s = <strong>${fmt(v)} m/s</strong></td></tr>
        <tr><th>Gap</th><td>${fmt(Math.abs(avg - v), 3)} m/s</td></tr>
      </table>
      <p class="small" style="margin-top:8px">At t = ${fmt(t1)} s the object is at x = ${fmt(xa)} m and is ${Math.abs(v) < 0.05 ? "<strong>momentarily at rest</strong> (flat tangent)" : v > 0 ? "moving in the <strong>+x</strong> direction (upward slope)" : "moving in the <strong>−x</strong> direction (downward slope)"}.</p>`;
  }
  build();
  return () => { shrink.stop(); destroy(); };
}

// =====================================================================
// Speeding up or slowing down? Motion diagram for the four sign combos.
// =====================================================================
export function speedSign(el) {
  const { canvas, controls, readout } = shell(el, { title: "Speeding up or slowing down?", icon: "🚦", canvas: true, wide: true });
  let sv = 1, sa = -1, t = 0;
  const seg = (label, opts, get, setv) => {
    const r = row(Object.assign(document.createElement("span"), { className: "muted small", textContent: label }));
    opts.forEach(([val, text]) => {
      const b = button(text, () => { setv(val); r.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b)); t = 0; });
      if (val === get()) b.classList.add("active");
      r.appendChild(b);
    });
    return r;
  };
  controls.append(
    seg("Velocity v", [[1, "v > 0 (moving +x)"], [-1, "v < 0 (moving −x)"]], () => sv, (v) => (sv = v)),
    seg("Acceleration a", [[1, "a > 0"], [-1, "a < 0"]], () => sa, (v) => (sa = v)),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  const V0 = 6, A = 2, T = 2.8, step = 0.35;
  const anim = playLoop((dt) => { t += dt; if (t > T + 0.8) t = 0; draw(); });
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const v0 = sv * V0, a = sa * A;
    const xAt = (tt) => v0 * tt + 0.5 * a * tt * tt;
    const x0 = sv > 0 ? -14 : 14;
    ctx.clearRect(0, 0, size.w, size.h);
    const y = size.h * 0.6;
    const X = numberLine(ctx, c, { left: 20, right: size.w - 20, y, lo: -16, hi: 16 });
    const tt = Math.min(t, T);
    // motion-diagram snapshots
    for (let s = 0; s <= tt + 1e-9; s += step) {
      ctx.fillStyle = c.muted; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.arc(X(x0 + xAt(s)), y - 28, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const px = X(x0 + xAt(tt)), v = v0 + a * tt;
    ctx.fillStyle = COL.obj;
    ctx.fillRect(px - 16, y - 46, 32, 18);
    drawArrow(ctx, px, y - 62, v * 7, 0, COL.x, "v");
    drawArrow(ctx, px, y + 32, a * 16, 0, COL.a, "a");
    const speeding = sv === sa;
    readout.innerHTML = `
      <div class="verdict ${speeding ? "good" : "bad"}">${speeding ? "Speeding up: v and a have the same sign" : "Slowing down: v and a have opposite signs"}</div>
      <p class="small">v = ${fmt(v, 1)} m/s, a = ${fmt(a, 1)} m/s², speed = ${fmt(Math.abs(v), 1)} m/s.${sv < 0 && sa < 0 ? " Here a is negative, yet the object speeds up, because it's moving in the −x direction." : ""}</p>`;
  }
  draw();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Linked x-t, v-t, a-t graphs (constant acceleration or a(t) integration)
// =====================================================================
const CONST_PRESETS = {
  runner: { label: "Runner: 0 → 8.0 m/s in 4.0 s", x0: 0, v0: 0, a: 2, tMax: 4 },
  braking: { label: "Braking car: 25 m/s, −5.0 m/s²", x0: 0, v0: 25, a: -5, tMax: 5 },
  turnaround: { label: "Turnaround: v₀ = +6, a = −3", x0: 0, v0: 6, a: -3, tMax: 6 },
  backward: { label: "Speeding up in −x", x0: 10, v0: -2, a: -1.5, tMax: 4 },
  cruise: { label: "Constant velocity", x0: -5, v0: 3, a: 0, tMax: 5 },
};
const A_FUNCS = {
  sled: { label: "Rocket sled: a = (2.0 m/s³)t", a: (t) => 2 * t, v0: 0, tMax: 4, wrong: true },
  linear: { label: "Fading thrust: a = 4.0 − 2.0t", a: (t) => 4 - 2 * t, v0: 0, tMax: 4 },
  constant: { label: "Constant: a = 2.0 m/s²", a: () => 2, v0: 0, tMax: 4 },
  wave: { label: "Back and forth: a = 3.0 cos t", a: (t) => 3 * Math.cos(t), v0: 0, tMax: 8 },
};
export function motionGraphs(el, data) {
  const integrateMode = data.mode === "integrate";
  const { canvas, controls, readout } = shell(el, { title: integrateMode ? "Integration grapher" : "Linked motion graphs", icon: "📊", canvas: true, xtall: true });
  const p = integrateMode
    ? { fn: "sled", x0: 0, v0: 0, tMax: 4 }
    : { ...CONST_PRESETS[data.preset || "runner"] };
  let t = integrateMode ? 3 : p.tMax;
  let sim;
  const recompute = () => {
    const aFn = integrateMode ? A_FUNCS[p.fn].a : () => p.a;
    sim = integrate(aFn, p.v0, p.x0, p.tMax);
  };

  const timeIn = document.createElement("input");
  timeIn.type = "range"; timeIn.step = "0.01"; timeIn.min = "0";
  const timeLbl = document.createElement("label");
  const timeBox = document.createElement("div");
  timeBox.className = "control";
  timeBox.append(timeLbl, timeIn);
  const syncTime = () => { timeIn.max = p.tMax; timeIn.value = t; timeLbl.innerHTML = `Time t <span>${fmt(t)} s</span>`; };
  timeIn.addEventListener("input", () => { t = Number(timeIn.value); syncTime(); draw(); });
  const anim = playLoop((dt) => { t = Math.min(p.tMax, t + dt * (p.tMax / 5)); syncTime(); draw(); return t < p.tMax; });
  const playBtn = button("▶ Play", () => { if (t >= p.tMax) t = 0; anim.start(); }, "btn btn-primary btn-sm");

  const build = () => {
    controls.innerHTML = "";
    if (integrateMode) {
      controls.append(
        row(select(Object.entries(A_FUNCS).map(([k, f]) => [k, f.label]), p.fn, (v) => { p.fn = v; p.v0 = A_FUNCS[v].v0; p.tMax = A_FUNCS[v].tMax; t = Math.min(t, p.tMax); build(); })),
        slider({ label: "Initial velocity v₀", min: -6, max: 6, step: 0.5, value: p.v0, unit: "m/s", onInput: (v) => { p.v0 = v; recompute(); draw(); } }),
      );
    } else {
      controls.append(
        row(select([["", "Presets…"], ...Object.entries(CONST_PRESETS).map(([k, v]) => [k, v.label])], "", (v) => { if (!v) return; Object.assign(p, CONST_PRESETS[v]); t = p.tMax; build(); })),
        slider({ label: "Initial position x₀", min: -20, max: 20, step: 1, value: p.x0, unit: "m", onInput: (v) => { p.x0 = v; recompute(); draw(); } }),
        slider({ label: "Initial velocity v₀", min: -30, max: 30, step: 0.5, value: p.v0, unit: "m/s", onInput: (v) => { p.v0 = v; recompute(); draw(); } }),
        slider({ label: "Acceleration a", min: -10, max: 10, step: 0.5, value: p.a, unit: "m/s²", onInput: (v) => { p.a = v; recompute(); draw(); } }),
      );
    }
    controls.append(timeBox, row(playBtn, button("Reset", () => { anim.stop(); t = 0; syncTime(); draw(); })));
    recompute(); syncTime(); draw();
  };

  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w || !sim) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const i = sim.at(t);
    const x = sim.xs[i], v = sim.vs[i], a = sim.as[i];
    // track strip
    const [lo, hi] = rangeOf(sim.xs, { pad: 0.08 });
    const X = numberLine(ctx, c, { left: 44, right: w - 12, y: 30, lo, hi });
    const vMax = Math.max(...sim.vs.map(Math.abs), 1), aMax = Math.max(...sim.as.map(Math.abs), 1);
    ctx.fillStyle = COL.obj; ctx.beginPath(); ctx.arc(X(x), 30, 7, 0, Math.PI * 2); ctx.fill();
    drawArrow(ctx, X(x), 14, (v / vMax) * 40, 0, COL.v, null);
    // three panels
    const top = 58, gap = 20, ph = (h - top - gap * 3) / 3;
    const rects = [0, 1, 2].map((k) => ({ x: 44, y: top + k * (ph + gap), w: w - 56, h: ph }));
    const Px = panel(ctx, c, rects[0], { t1: p.tMax, ...yr(rangeOf(sim.xs)), label: "x (m)" });
    const Pv = panel(ctx, c, rects[1], { t1: p.tMax, ...yr(rangeOf(sim.vs)), label: "v (m/s)" });
    const Pa = panel(ctx, c, rects[2], { t1: p.tMax, ...yr(rangeOf(sim.as)), label: "a (m/s²)" });
    [Px, Pv, Pa].forEach((P) => P.frame());
    Pv.area(sim.ts, sim.vs, t);
    Pa.area(sim.ts, sim.as, t);
    Px.curve(sim.ts, sim.xs, COL.x); Pv.curve(sim.ts, sim.vs, COL.v); Pa.curve(sim.ts, sim.as, COL.a);
    [Px, Pv, Pa].forEach((P) => P.cursor(t));
    const dadt = i > 0 && i < sim.ts.length - 1 ? (sim.as[i + 1] - sim.as[i - 1]) / (sim.ts[i + 1] - sim.ts[i - 1]) : 0;
    Px.tangent(t, x, v, COL.v); Pv.tangent(t, v, a, COL.a); Pa.tangent(t, a, dadt, c.muted);
    Px.dot(t, x, COL.x); Pv.dot(t, v, COL.v); Pa.dot(t, a, COL.a);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "right";
    ctx.fillText("t (s)", w - 12, h - 4);

    const rows = [
      ["t", `${fmt(t)} s`],
      [`<span style="color:${COL.x}">x(t)</span>`, `${fmt(x)} m`],
      [`<span style="color:${COL.v}">v(t)</span> = slope of x-t`, `${fmt(v)} m/s`],
      [`<span style="color:${COL.a}">a(t)</span> = slope of v-t`, `${fmt(a)} m/s²`],
      ["Area under v-t so far = Δx", `${fmt(x - p.x0)} m`],
      ["Area under a-t so far = Δv", `${fmt(v - p.v0)} m/s`],
    ];
    readout.innerHTML = `<table class="mini-table">${rows.map(([k, val]) => `<tr><th>${k}</th><td>${val}</td></tr>`).join("")}</table>
      <div class="verdict">Right now: ${motionState(v, a)}</div>
      ${integrateMode && A_FUNCS[p.fn].wrong && p.v0 === 0 ? `<p class="small" style="margin-top:8px">Wrong method: ½·a(t)·t² = ½(${fmt(a)})(${fmt(t)})² = <span class="bad">${fmt(0.5 * a * t * t)} m</span>, but the real x is <span class="good">${fmt(x)} m</span>. The kinematic equations need constant a.</p>` : ""}
      <p class="small muted">Green shading is positive area and red is negative. Dashed lines are tangents.</p>`;
  }
  const yr = ([y0, y1]) => ({ y0, y1 });
  build();
  return () => { anim.stop(); destroy(); };
}
