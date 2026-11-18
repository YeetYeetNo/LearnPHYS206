// Unit 3 widgets: motion in two dimensions.
import { setupCanvas, themeColors, drawArrow, slider, niceStep } from "../sims/canvas.js";
import { plane, vecColors as C, mag, fmt, deg, rad } from "./plane.js";
import { shell, button, row, select, checkbox, table } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const COL = { r: "#9b51e0", v: "#2f80ed", a: "#f2994a", g: "#27ae60", par: "#27ae60", perp: "#eb5757" };
const ij = (x, y, unit = "") => `${fmt(x)} î ${y < 0 ? "−" : "+"} ${fmt(Math.abs(y))} ĵ${unit ? " " + unit : ""}`;
const angleDeg = (x, y) => ((deg(Math.atan2(y, x)) % 360) + 360) % 360;

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

// Equal-scale world → pixel map that fits a box into the canvas.
function fit(size, [x0, x1], [y0, y1], pad = { l: 36, r: 16, t: 16, b: 26 }) {
  const s = Math.min((size.w - pad.l - pad.r) / (x1 - x0), (size.h - pad.t - pad.b) / (y1 - y0));
  const ox = pad.l + ((size.w - pad.l - pad.r) - (x1 - x0) * s) / 2;
  const X = (x) => ox + (x - x0) * s;
  const Y = (y) => size.h - pad.b - (y - y0) * s;
  return { X, Y, s };
}

function groundGrid(ctx, c, size, map, [x0, x1], [y0, y1]) {
  const { X, Y } = map;
  const step = niceStep(Math.max(x1 - x0, y1 - y0), 8);
  ctx.save();
  ctx.font = "10px JetBrains Mono, monospace"; ctx.fillStyle = c.muted; ctx.strokeStyle = c.border; ctx.lineWidth = 1;
  ctx.textAlign = "center";
  for (let x = Math.ceil(x0 / step) * step; x <= x1 + 1e-9; x += step) {
    ctx.beginPath(); ctx.moveTo(X(x), Y(y0)); ctx.lineTo(X(x), Y(y1)); ctx.stroke();
    ctx.fillText(+x.toFixed(2), X(x), Y(y0) + 14);
  }
  ctx.textAlign = "right";
  for (let y = Math.ceil(y0 / step) * step; y <= y1 + 1e-9; y += step) {
    ctx.beginPath(); ctx.moveTo(X(x0), Y(y)); ctx.lineTo(X(x1), Y(y)); ctx.stroke();
    if (y) ctx.fillText(+y.toFixed(2), X(x0) - 4, Y(y) + 3);
  }
  ctx.strokeStyle = c.text; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X(x0), Y(0)); ctx.lineTo(X(x1), Y(0)); ctx.stroke();
  ctx.restore();
}

// =====================================================================
// Path vector explorer: r, v (tangent), a (toward the inside of the curve)
// =====================================================================
const PATHS = {
  drone: { label: "Drone: r = (3.0t) î + (2.0t²) ĵ", r: (t) => [3 * t, 2 * t * t], v: (t) => [3, 4 * t], a: () => [0, 4], t1: 2.5, t0: 1 },
  ball: { label: "Thrown ball: r = (5.0t) î + (8.0t − 4.9t²) ĵ", r: (t) => [5 * t, 8 * t - 4.9 * t * t], v: (t) => [5, 8 - 9.8 * t], a: () => [0, -9.8], t1: 1.63, t0: 0.4 },
  circle: { label: "Circle: r = (4 cos t) î + (4 sin t) ĵ", r: (t) => [4 * Math.cos(t), 4 * Math.sin(t)], v: (t) => [-4 * Math.sin(t), 4 * Math.cos(t)], a: (t) => [-4 * Math.cos(t), -4 * Math.sin(t)], t1: 2 * Math.PI, t0: 0.8 },
  drift: { label: "Braking drift: r = (6.0t − t²) î + (2.0t) ĵ", r: (t) => [6 * t - t * t, 2 * t], v: (t) => [6 - 2 * t, 2], a: () => [-2, 0], t1: 5, t0: 1.5 },
};
export function pathVectors(el) {
  const { canvas, controls, readout } = shell(el, { title: "Path vector explorer", icon: "🛸", canvas: true });
  let key = "drone", t = PATHS.drone.t0;
  let sT;
  const anim = playLoop((dt) => { const P = PATHS[key]; t += dt * P.t1 / 4; if (t >= P.t1) { t = P.t1; sT.set(t); return false; } sT.set(t); });
  const build = () => {
    const P = PATHS[key];
    controls.innerHTML = "";
    sT = slider({ label: "Time t", min: 0, max: +P.t1.toFixed(2), step: 0.01, value: t, unit: "s", onInput: (v) => { t = v; p.draw(); } });
    controls.append(
      row(select(Object.entries(PATHS).map(([k, v]) => [k, v.label]), key, (v) => { anim.stop(); key = v; t = PATHS[v].t0; build(); })),
      sT,
      row(button("▶ Play", () => { if (t >= P.t1) t = 0; anim.start(); }, "btn btn-primary btn-sm")),
    );
    p.draw();
  };
  const p = plane(canvas, {
    range: 6,
    onBeforeDraw(api) {
      const P = PATHS[key];
      const pts = Array.from({ length: 81 }, (_, i) => P.r((P.t1 * i) / 80));
      const xs = pts.map((q) => q[0]).concat(0), ys = pts.map((q) => q[1]).concat(0);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const w = Math.max(1, api.size.w), h = Math.max(1, api.size.h);
      api.view.cx = (x0 + x1) / 2; api.view.cy = (y0 + y1) / 2;
      // view.range is half the shorter side, so scale each span to that side
      const half = Math.max(((y1 - y0) / 2) * Math.min(1, w / h), ((x1 - x0) / 2) * Math.min(1, h / w)) * 1.3 + 0.5;
      api.view.range = half;
      api.view.unit = niceStep(2 * half, 10);
    },
    onDraw(api) {
      const P = PATHS[key];
      const c = api.colors();
      const ctx = api.ctx;
      // full path faint, traveled part solid
      ctx.save(); ctx.lineWidth = 2;
      [[P.t1, c.muted, [5, 5]], [t, COL.r, []]].forEach(([tEnd, color, dash]) => {
        ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const [x, y] = P.r((tEnd * i) / 120); const [px, py] = api.S(x, y); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      });
      ctx.restore();
      const r = P.r(t), v = P.v(t), a = P.a(t);
      const span = api.view.range;
      const vMax = Math.max(...Array.from({ length: 41 }, (_, i) => mag(...P.v((P.t1 * i) / 40)))), aMax = Math.max(mag(...a), 1e-6);
      const kv = (span * 0.55) / vMax, ka = (span * 0.4) / Math.max(aMax, 1e-6);
      api.vector(0, 0, r[0], r[1], COL.r, "r", { dashed: true, width: 2 });
      api.vector(r[0], r[1], r[0] + v[0] * kv, r[1] + v[1] * kv, COL.v, "v");
      if (mag(...a) > 1e-6) api.vector(r[0], r[1], r[0] + a[0] * ka, r[1] + a[1] * ka, COL.a, "a");
      api.dot(r[0], r[1], c.text, 5);
      // split a into the part along v and the part across v
      const sp = mag(...v), apar = sp ? (a[0] * v[0] + a[1] * v[1]) / sp : 0, aperp = sp ? (v[0] * a[1] - v[1] * a[0]) / sp : 0;
      readout.innerHTML = `
        <table class="mini-table">
          <tr><th style="color:${COL.r}">r</th><td>${ij(...r, "m")}</td></tr>
          <tr><th style="color:${COL.v}">v = dr/dt</th><td>${ij(...v, "m/s")}</td></tr>
          <tr><th>Speed |v|</th><td>${fmt(sp)} m/s at ${fmt(angleDeg(...v), 1)}°</td></tr>
          <tr><th style="color:${COL.a}">a = dv/dt</th><td>${ij(...a, "m/s²")}</td></tr>
          <tr><th>a along v / across v</th><td>${fmt(apar)} / ${fmt(Math.abs(aperp))} m/s²</td></tr>
        </table>
        <p class="small muted" style="margin-top:8px">Arrow lengths for v and a are scaled to fit; read the values in the table. ${Math.abs(apar) < 0.01 && Math.abs(aperp) > 0.01 ? "Here a is perpendicular to v, so only the direction is changing." : ""}</p>`;
    },
  });
  build();
  return () => { anim.stop(); p.destroy(); };
}

// =====================================================================
// Acceleration splitter: a∥ changes speed, a⊥ changes direction
// =====================================================================
export function accelSplit(el) {
  const { canvas, controls, readout } = shell(el, { title: "Acceleration splitter", icon: "✂️", canvas: true });
  let v = [3, 0], a = [0, 2];
  const p = plane(canvas, { range: 5, center: [1, 0.5], onDraw });
  p.addHandle({ color: COL.v, get: () => v, set: (x, y) => { v = [x, y]; } });
  p.addHandle({ color: COL.a, get: () => a, set: (x, y) => { a = [x, y]; } });
  const preset = (V, A) => () => { v = V; a = A; p.draw(); };
  controls.append(row(
    button("Car on a curve", preset([3, 0], [0, 2])),
    button("Braking into a turn", preset([3, 0], [-1.5, 1.5])),
    button("Speeding up, turning", preset([3, 1], [1.5, 1.5])),
    button("Straight line", preset([3, 1], [1.5, 0.5])),
  ));
  function onDraw(api) {
    const c = api.colors();
    const sp = mag(...v);
    const u = sp ? [v[0] / sp, v[1] / sp] : [1, 0];
    const apar = a[0] * u[0] + a[1] * u[1];
    const par = [apar * u[0], apar * u[1]], perp = [a[0] - par[0], a[1] - par[1]];
    // the path it starts to follow (constant a for a short time)
    api.ctx.save(); api.ctx.strokeStyle = c.muted; api.ctx.setLineDash([2, 5]); api.ctx.lineWidth = 2; api.ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const t = (1.4 * i) / 40; const [px, py] = api.S(v[0] * t + 0.5 * a[0] * t * t, v[1] * t + 0.5 * a[1] * t * t); i ? api.ctx.lineTo(px, py) : api.ctx.moveTo(px, py); }
    api.ctx.stroke(); api.ctx.restore();
    api.vector(0, 0, par[0], par[1], COL.par, "a∥", { dashed: true });
    api.vector(par[0], par[1], a[0], a[1], COL.perp, "a⊥", { dashed: true });
    api.vector(0, 0, v[0], v[1], COL.v, "v", { width: 4 });
    api.vector(0, 0, a[0], a[1], COL.a, "a");
    api.dot(0, 0, c.text, 5);
    const am = mag(...a);
    const phi = sp && am ? deg(Math.acos(Math.max(-1, Math.min(1, apar / am)))) : 0;
    const across = mag(...perp);
    let verdict;
    if (am < 0.05) verdict = "No acceleration: constant velocity.";
    else if (across < 0.05) verdict = apar > 0 ? "0°: straight-line motion, speeding up." : "180°: straight-line motion, slowing down.";
    else if (Math.abs(phi - 90) < 1.5) verdict = "Exactly 90°: constant speed, only turning.";
    else verdict = phi < 90 ? "Less than 90°: speeding up and turning." : "More than 90°: slowing down and turning.";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Angle between a and v</th><td><strong>${fmt(phi, 1)}°</strong></td></tr>
        <tr><th style="color:${COL.par}">a∥ (changes speed)</th><td>${fmt(apar)} m/s²</td></tr>
        <tr><th style="color:${COL.perp}">a⊥ (changes direction)</th><td>${fmt(across)} m/s²</td></tr>
        <tr><th>Speed changing at</th><td>${fmt(apar)} m/s per s</td></tr>
      </table>
      <div class="verdict">${verdict}</div>
      <p class="small muted">The dotted curve is the path the object starts to follow.</p>`;
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Dropped vs. launched: same height at every instant
// =====================================================================
export function projectileSplit(el) {
  const { canvas, controls, readout } = shell(el, { title: "Dropped vs. launched", icon: "🎯", canvas: true, wide: true });
  let h = 20, vx = 8, t = 0;
  const T = () => Math.sqrt((2 * h) / G);
  const anim = playLoop((dt) => { t = Math.min(T(), t + dt * 0.9); draw(); return t < T(); });
  controls.append(
    slider({ label: "Launch height", min: 2, max: 40, step: 1, value: h, unit: "m", onInput: (v) => { h = v; t = T(); draw(); } }),
    slider({ label: "Horizontal launch speed", min: 0, max: 20, step: 0.5, value: vx, unit: "m/s", onInput: (v) => { vx = v; t = T(); draw(); } }),
    row(button("▶ Release both", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm")),
  );
  t = T();
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    ctx.clearRect(0, 0, size.w, size.h);
    const xr = [-3, Math.max(vx * T(), 8) + 2], yr = [0, h * 1.1];
    const map = fit(size, xr, yr);
    groundGrid(ctx, c, size, map, xr, yr);
    const { X, Y } = map;
    ctx.fillStyle = c.border; ctx.fillRect(X(-3), Y(h), X(0) - X(-3), Y(0) - Y(h));
    const n = 8, dts = T() / n;
    for (let k = 0; k <= n; k++) {
      const tk = k * dts;
      if (tk > t + 1e-9) break;
      const y = h - 0.5 * G * tk * tk;
      ctx.strokeStyle = c.muted; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(y)); ctx.lineTo(X(vx * tk), Y(y)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(X(0), Y(y), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2f80ed"; ctx.beginPath(); ctx.arc(X(vx * tk), Y(y), 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    const y = h - 0.5 * G * t * t, vy = -G * t;
    const k = map.s * 0.12;
    drawArrow(ctx, X(vx * t), Y(y), vx * k * 4, 0, C.x, "vₓ");
    drawArrow(ctx, X(vx * t), Y(y), 0, -vy * k * 4, C.y, "vᵧ");
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(X(0), Y(y), 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2f80ed"; ctx.beginPath(); ctx.arc(X(vx * t), Y(y), 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("dropped", X(0) + 10, Y(h) - 8);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>t</th><td>${fmt(t)} s</td></tr>
        <tr><th>Height of both balls</th><td>${fmt(y)} m</td></tr>
        <tr><th>Launched ball: x</th><td>${fmt(vx * t)} m</td></tr>
        <tr><th style="color:${C.x}">vₓ (constant)</th><td>${fmt(vx)} m/s</td></tr>
        <tr><th style="color:${C.y}">vᵧ (same for both)</th><td>${fmt(vy)} m/s</td></tr>
        <tr><th>Both land at</th><td><strong>t = ${fmt(T())} s</strong> = √(2h/g)</td></tr>
      </table>
      <p class="small" style="margin-top:8px">Change the launch speed: the landing time doesn't move. Only the height sets the fall time.</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Projectile lab: x and y split for every quantity
// =====================================================================
export function projectileLab(el) {
  const { canvas, controls, readout } = shell(el, { title: "Projectile lab", icon: "⚽", canvas: true, wide: true });
  const st = { v0: 20, ang: 37, h: 0 };
  let t = 0, showComp = true;
  const flight = () => {
    const vx = st.v0 * Math.cos(rad(st.ang)), vy = st.v0 * Math.sin(rad(st.ang));
    const tf = (vy + Math.sqrt(vy * vy + 2 * G * st.h)) / G;
    return { vx, vy, tf, R: vx * tf, top: vy > 0 ? st.h + (vy * vy) / (2 * G) : st.h, tTop: Math.max(0, vy / G) };
  };
  const sl = {};
  const tIn = document.createElement("input");
  tIn.type = "range"; tIn.min = "0"; tIn.step = "0.001";
  const tLbl = document.createElement("label");
  const tBox = document.createElement("div"); tBox.className = "control"; tBox.append(tLbl, tIn);
  const syncT = () => { const f = flight(); tIn.max = f.tf; tIn.value = t; tLbl.innerHTML = `Time t <span>${fmt(t)} s</span>`; };
  tIn.addEventListener("input", () => { t = Number(tIn.value); syncT(); draw(); });
  const anim = playLoop((dt) => { const f = flight(); t = Math.min(f.tf, t + dt * Math.max(0.5, f.tf / 3)); syncT(); draw(); return t < f.tf; });
  const reset = () => { anim.stop(); t = flight().tf; syncT(); draw(); };
  sl.v0 = slider({ label: "Launch speed v₀", min: 1, max: 40, step: 0.5, value: st.v0, unit: "m/s", onInput: (v) => { st.v0 = v; reset(); } });
  sl.ang = slider({ label: "Launch angle α₀", min: 0, max: 90, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; reset(); } });
  sl.h = slider({ label: "Launch height", min: 0, max: 30, step: 0.05, value: st.h, unit: "m", onInput: (v) => { st.h = v; reset(); } });
  const load = (v0, ang, h) => () => { sl.v0.set(v0); sl.ang.set(ang); sl.h.set(h); };
  controls.append(
    row(button("Example 1: off a table", load(3, 0, 1.25)), button("Example 2: soccer kick", load(20, 37, 0))),
    sl.v0, sl.ang, sl.h, tBox,
    row(button("▶ Play", () => { if (t >= flight().tf - 1e-6) t = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Jump to top", () => { anim.stop(); t = flight().tTop; syncT(); draw(); })),
    checkbox("Show velocity components", showComp, (v) => { showComp = v; draw(); }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const f = flight();
    ctx.clearRect(0, 0, size.w, size.h);
    const xr = [-Math.max(0.5, f.R * 0.06), Math.max(f.R * 1.08, 1)], yr = [0, Math.max(f.top * 1.25, 0.6)];
    const map = fit(size, xr, yr);
    groundGrid(ctx, c, size, map, xr, yr);
    const { X, Y } = map;
    if (st.h > 0) { ctx.fillStyle = c.border; ctx.fillRect(X(xr[0]), Y(st.h), X(0) - X(xr[0]), Y(0) - Y(st.h)); }
    const pos = (tt) => [f.vx * tt, st.h + f.vy * tt - 0.5 * G * tt * tt];
    ctx.save(); ctx.lineWidth = 2;
    [[f.tf, c.muted, [5, 5]], [t, "#2f80ed", []]].forEach(([tEnd, color, dash]) => {
      ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const [x, y] = pos((tEnd * i) / 100); i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke();
    });
    ctx.restore();
    if (f.vy > 0) {
      const [tx, ty] = pos(f.tTop);
      ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`top: ${fmt(f.top)} m`, X(tx), Y(ty) - 12);
    }
    const [x, y] = pos(t), vy = f.vy - G * t;
    const k = (Math.min(size.w, size.h) * 0.22) / Math.max(st.v0, Math.abs(vy), 1);
    if (showComp) {
      drawArrow(ctx, X(x), Y(y), f.vx * k, 0, C.x, "vₓ");
      drawArrow(ctx, X(x), Y(y), 0, -vy * k, C.y, "vᵧ");
    }
    drawArrow(ctx, X(x), Y(y), f.vx * k, -vy * k, "#2f80ed", "v");
    drawArrow(ctx, X(x) + 14, Y(y), 0, 26, "#eb5757", "g");
    ctx.fillStyle = "#e67e22"; ctx.strokeStyle = "#8a4b0f"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(x), Y(y), 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const vImp = f.vy - G * f.tf;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th></th><th>x (horizontal)</th><th>y (vertical)</th></tr>
        <tr><th>Launch velocity</th><td>v₀cos α₀ = ${fmt(f.vx)}</td><td>v₀sin α₀ = ${fmt(f.vy)}</td></tr>
        <tr><th>Acceleration</th><td>0</td><td>−9.80</td></tr>
        <tr><th>At t = ${fmt(t)} s: position</th><td>${fmt(x)} m</td><td>${fmt(y)} m</td></tr>
        <tr><th>At t = ${fmt(t)} s: velocity</th><td>${fmt(f.vx)} m/s</td><td>${fmt(vy)} m/s</td></tr>
      </table>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>Speed now</th><td>${fmt(Math.hypot(f.vx, vy))} m/s${Math.abs(vy) < 0.05 && f.vy > 0 ? " (at the top: vᵧ = 0, speed = vₓ)" : ""}</td></tr>
        <tr><th>Time in the air</th><td>${fmt(f.tf, 3)} s</td></tr>
        <tr><th>Horizontal distance</th><td>${fmt(f.R)} m</td></tr>
        <tr><th>Max height</th><td>${fmt(f.top)} m</td></tr>
        <tr><th>Impact</th><td>${fmt(Math.hypot(f.vx, vImp))} m/s at ${fmt(deg(Math.atan2(-vImp, f.vx)), 1)}° below horizontal</td></tr>
      </table>`;
  }
  reset();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Range vs. launch angle: α and 90° − α land together
// =====================================================================
export function rangeAngle(el) {
  const { canvas, controls, readout } = shell(el, { title: "Range vs. launch angle", icon: "📐", canvas: true, wide: true });
  let ang = 30, v0 = 20;
  controls.append(
    slider({ label: "Launch angle α", min: 5, max: 85, step: 1, value: ang, unit: "°", onInput: (v) => { ang = v; draw(); } }),
    slider({ label: "Launch speed v₀", min: 5, max: 30, step: 0.5, value: v0, unit: "m/s", onInput: (v) => { v0 = v; draw(); } }),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  const Rof = (a) => (v0 * v0 * Math.sin(rad(2 * a))) / G;
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    ctx.clearRect(0, 0, size.w, size.h);
    const Rmax = (v0 * v0) / G, Hmax = (v0 * v0) / (2 * G);
    const top = { w: size.w * 0.56, h: size.h };
    const map = fit({ w: top.w, h: size.h }, [0, Rmax * 1.05], [0, Hmax * 1.1]);
    groundGrid(ctx, c, top, map, [0, Rmax * 1.05], [0, Hmax * 1.1]);
    [[ang, "#2f80ed"], [90 - ang, "#eb5757"], [45, c.muted]].forEach(([a, color], i) => {
      const vx = v0 * Math.cos(rad(a)), vy = v0 * Math.sin(rad(a)), tf = (2 * vy) / G;
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = i === 2 ? 1.5 : 2.5; if (i === 2) ctx.setLineDash([4, 5]);
      ctx.beginPath();
      for (let k = 0; k <= 80; k++) { const tt = (tf * k) / 80; const px = map.X(vx * tt), py = map.Y(vy * tt - 0.5 * G * tt * tt); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.restore();
    });
    const P = panel(ctx, c, { x: top.w + 40, y: 12, w: size.w - top.w - 52, h: size.h - 40 }, { t1: 90, y0: 0, y1: Rmax * 1.1, label: "range R (m) vs. α (°)" });
    P.frame();
    const as = Array.from({ length: 91 }, (_, i) => i);
    P.curve(as, as.map(Rof), c.muted, 2);
    P.dot(ang, Rof(ang), "#2f80ed"); P.dot(90 - ang, Rof(90 - ang), "#eb5757"); P.dot(45, Rmax, c.text, 3);
    readout.innerHTML = `
      <div class="readout">
        <div><span style="color:#2f80ed">R at α = ${ang}°</span><span>${fmt(Rof(ang), 1)} m</span></div>
        <div><span style="color:#eb5757">R at 90° − α = ${90 - ang}°</span><span>${fmt(Rof(90 - ang), 1)} m</span></div>
        <div><span>Max range (45°)</span><span>${fmt(Rmax, 1)} m</span></div>
      </div>
      <p class="small" style="margin-top:8px">sin 2α = sin(180° − 2α) = sin 2(90° − α), so complementary angles always share a range. The steeper launch just stays up longer.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Circular motion: v tangent, a_rad inward, optional tangential part
// =====================================================================
export function circular(el) {
  const { canvas, controls, readout } = shell(el, { title: "Circular motion model", icon: "🎡", canvas: true });
  const st = { R: 50, v: 20, at: 0, usePeriod: false, T: 20 };
  let theta = 0, v = st.v;
  const sl = {};
  const speed0 = () => (st.usePeriod ? (2 * Math.PI * st.R) / st.T : st.v);
  const build = () => {
    controls.innerHTML = "";
    sl.R = slider({ label: "Radius R", min: 0.5, max: 80, step: 0.5, value: st.R, unit: "m", onInput: (x) => { st.R = x; v = speed0(); draw(); } });
    sl.v = st.usePeriod
      ? slider({ label: "Period T", min: 0.25, max: 40, step: 0.25, value: st.T, unit: "s", onInput: (x) => { st.T = x; v = speed0(); draw(); } })
      : slider({ label: "Speed v", min: 0.5, max: 40, step: 0.5, value: st.v, unit: "m/s", onInput: (x) => { st.v = x; v = speed0(); draw(); } });
    sl.at = slider({ label: "Tangential acceleration", min: -3, max: 3, step: 0.25, value: st.at, unit: "m/s²", onInput: (x) => { st.at = x; v = speed0(); draw(); } });
    controls.append(
      row(button(st.usePeriod ? "Set speed instead" : "Set period instead", () => { st.usePeriod = !st.usePeriod; v = speed0(); build(); })),
      sl.R, sl.v, sl.at,
      row(
        button("Car on a curve", () => { Object.assign(st, { R: 50, v: 20, at: 0, usePeriod: false }); v = speed0(); build(); }),
        button("Ferris wheel", () => { Object.assign(st, { R: 10, T: 20, at: 0, usePeriod: true }); v = speed0(); build(); }),
      ),
    );
    draw();
  };
  const anim = playLoop((dt) => {
    // Animation runs at a watchable pace: one lap takes 3–8 s on screen whatever the real period.
    const realT = (2 * Math.PI * st.R) / Math.max(v, 0.05);
    const slow = Math.min(8, Math.max(3, realT)) / realT;
    const dtw = dt / slow;
    v = Math.max(0, v + st.at * dtw);
    theta += (v / st.R) * dtw;
    if (theta > 2 * Math.PI || v <= 0) { theta = theta % (2 * Math.PI); v = speed0(); }
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    ctx.clearRect(0, 0, size.w, size.h);
    const cx = size.w / 2, cy = size.h / 2, Rp = Math.min(size.w, size.h) * 0.3;
    ctx.strokeStyle = c.muted; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    const px = cx + Rp * Math.cos(theta), py = cy - Rp * Math.sin(theta);
    ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = "11px Inter, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`R = ${st.R} m`, (cx + px) / 2, (cy + py) / 2 - 8);
    const tan = [-Math.sin(theta), -Math.cos(theta)]; // screen coords, counterclockwise travel
    const inward = [cx - px, cy - py].map((q) => q / Rp);
    const arad = (v * v) / st.R;
    const v0 = Math.max(speed0(), 0.1), a0 = Math.max((v0 * v0) / st.R, Math.abs(st.at), 0.1);
    const kv = (Rp * 0.7) / v0, ka = (Rp * 0.6) / a0;
    drawArrow(ctx, px, py, tan[0] * v * kv, tan[1] * v * kv, COL.v, "v");
    drawArrow(ctx, px, py, inward[0] * arad * ka, inward[1] * arad * ka, COL.a, "a_rad");
    if (st.at) {
      drawArrow(ctx, px, py, tan[0] * st.at * ka, tan[1] * st.at * ka, "#9b51e0", "a_tan");
      ctx.save(); ctx.setLineDash([5, 4]);
      drawArrow(ctx, px, py, (inward[0] * arad + tan[0] * st.at) * ka, (inward[1] * arad + tan[1] * st.at) * ka, "#eb5757", "a");
      ctx.restore();
    }
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
    const T = (2 * Math.PI * st.R) / Math.max(v, 1e-6);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Speed v</th><td>${fmt(v)} m/s</td></tr>
        <tr><th>Period T = 2πR/v</th><td>${fmt(T)} s</td></tr>
        <tr><th style="color:${COL.a}">a_rad = v²/R</th><td><strong>${fmt(arad)} m/s²</strong> toward the center</td></tr>
        <tr><th>4π²R/T²</th><td>${fmt((4 * Math.PI ** 2 * st.R) / (T * T))} m/s² (same)</td></tr>
        ${st.at ? `<tr><th style="color:#9b51e0">a_tan = d|v|/dt</th><td>${fmt(st.at)} m/s²</td></tr><tr><th style="color:#eb5757">|a| total</th><td>${fmt(Math.hypot(arad, st.at))} m/s²</td></tr>` : ""}
      </table>
      <p class="small muted" style="margin-top:8px">The circle is drawn the same size for every R, and the animation runs at a watchable pace. Read the real values in the table.${st.at ? " Speed resets each lap." : ""}</p>`;
  }
  build();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// 1D reference frames: passenger on a train
// =====================================================================
export function trainFrames(el) {
  const { canvas, controls, readout } = shell(el, { title: "Train reference frames", icon: "🚆", canvas: true, wide: true });
  let vpt = 1, vtg = 30;
  const s1 = slider({ label: "Passenger relative to train v(P/T)", min: -3, max: 3, step: 0.5, value: vpt, unit: "m/s", onInput: (v) => { vpt = v; draw(); } });
  const s2 = slider({ label: "Train relative to ground v(T/G)", min: -40, max: 40, step: 1, value: vtg, unit: "m/s", onInput: (v) => { vtg = v; draw(); } });
  controls.append(s1, s2, row(button("Walk to the front", () => { s1.set(1); s2.set(30); }), button("Walk to the back", () => { s1.set(-1); s2.set(30); })));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const lo = Math.min(0, vtg, vtg + vpt) - 4, hi = Math.max(0, vtg, vtg + vpt) + 4;
    const X = (v) => 30 + ((v - lo) / (hi - lo)) * (w - 60);
    // train body with passenger
    ctx.fillStyle = c.border; ctx.fillRect(w * 0.2, h * 0.06, w * 0.6, h * 0.22);
    ctx.fillStyle = "#9b51e0"; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.17, 8, 0, Math.PI * 2); ctx.fill();
    drawArrow(ctx, w * 0.5, h * 0.17, Math.sign(vpt) * Math.min(40, Math.abs(vpt) * 14), 0, "#9b51e0", null);
    // velocity number line
    const y0 = h * 0.86;
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(30, y0); ctx.lineTo(w - 30, y0); ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.textAlign = "center";
    const step = niceStep(hi - lo, 8);
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { ctx.fillRect(X(v) - 0.5, y0 - 4, 1, 8); ctx.fillText(v, X(v), y0 + 14); }
    ctx.save(); ctx.lineWidth = 4;
    drawArrow(ctx, X(0), h * 0.42, X(vtg) - X(0), 0, "#2f80ed", "v(T/G)");
    drawArrow(ctx, X(vtg), h * 0.42, X(vtg + vpt) - X(vtg), 0, "#9b51e0", null);
    drawArrow(ctx, X(0), h * 0.64, X(vtg + vpt) - X(0), 0, "#27ae60", "v(P/G)");
    ctx.restore();
    const sgn = (v) => (v >= 0 ? "+" : "−") + fmt(Math.abs(v), 1).replace("−", "");
    readout.innerHTML = `
      <div class="conv-chain" data-lenis-prevent>v(P/G) = v(P/T) + v(T/G) = (${sgn(vpt)}) + (${sgn(vtg)}) = <strong>${sgn(vpt + vtg)} m/s</strong></div>
      <p class="small" style="margin-top:8px">The inner T's "cancel" to leave P/G. Seen from the passenger, the ground moves at v(G/T) = −v(T/G) = ${sgn(-vtg)} m/s.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// 2D relative velocity: plane in a crosswind (or boat in a current)
// =====================================================================
const bearing = (x, y) => {
  const m = Math.hypot(x, y);
  if (m < 1e-9) return "no direction";
  const fromN = deg(Math.atan2(Math.abs(x), y)); // 0..180 from north
  if (Math.abs(x) < 1e-6) return y > 0 ? "due north" : "due south";
  if (Math.abs(y) < 1e-6) return x > 0 ? "due east" : "due west";
  if (fromN <= 90) return `${fmt(fromN, 1)}° ${x > 0 ? "east" : "west"} of north`;
  return `${fmt(180 - fromN, 1)}° ${x > 0 ? "east" : "west"} of south`;
};
export function relativeVelocity(el) {
  const { canvas, controls, readout } = shell(el, { title: "Crosswind vector model", icon: "✈️", canvas: true, tall: true });
  let air = [0, 240], wind = [100, 0];
  const p = plane(canvas, { range: 300, snap: 5, unit: 50, center: [40, 120], axes: ["east (km/h)", "north (km/h)"], onDraw });
  p.addHandle({ color: COL.v, get: () => air, set: (x, y) => { air = [x, y]; } });
  p.addHandle({ color: "#eb5757", get: () => [air[0] + wind[0], air[1] + wind[1]], set: (x, y) => { wind = [x - air[0], y - air[1]]; } });
  controls.append(
    row(button("Worked example", () => { air = [0, 240]; wind = [100, 0]; p.draw(); }), button("Head due north", () => {
      const s = Math.hypot(...air);
      if (Math.abs(wind[0]) >= s) { readout.insertAdjacentHTML("afterbegin", `<p class="bad small">The wind's sideways part is faster than the plane, so it can't hold a due-north track.</p>`); return; }
      air = [-wind[0], Math.sqrt(s * s - wind[0] ** 2)]; p.draw();
    }, "btn btn-primary btn-sm")),
  );
  function onDraw(api) {
    const c = api.colors();
    const g = [air[0] + wind[0], air[1] + wind[1]];
    // dotted ground track beyond the green arrow
    api.segment(0, 0, g[0] * 3, g[1] * 3, c.border, { dashed: true, width: 1.5 });
    api.vector(0, 0, g[0], g[1], COL.g, null, { width: 4 });
    api.vector(0, 0, air[0], air[1], COL.v, null);
    api.vector(air[0], air[1], g[0], g[1], "#eb5757", null);
    // labels sit beside each arrow's midpoint, pushed away from the triangle's middle
    const mid = [(air[0] + g[0]) / 3, (air[1] + g[1]) / 3];
    const tag = (x0, y0, x1, y1, text, color) => {
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const [sx, sy] = api.S(mx, my), [cx, cy] = api.S(...mid);
      const d = Math.hypot(sx - cx, sy - cy) || 1;
      api.label(mx, my, text, color, ((sx - cx) / d) * 38, ((sy - cy) / d) * 16);
    };
    tag(0, 0, air[0], air[1], "v(P/A)", COL.v);
    tag(air[0], air[1], g[0], g[1], "v(A/G)", "#eb5757");
    tag(0, 0, g[0], g[1], "v(P/G)", COL.g);
    // little plane at the origin, nose along its heading
    const hdg = Math.atan2(air[1], air[0]);
    const [ox, oy] = api.S(0, 0);
    api.ctx.save(); api.ctx.translate(ox, oy); api.ctx.rotate(-hdg + Math.PI / 2);
    api.ctx.fillStyle = c.text; api.ctx.beginPath();
    api.ctx.moveTo(0, -14); api.ctx.lineTo(4, -2); api.ctx.lineTo(14, 4); api.ctx.lineTo(4, 3); api.ctx.lineTo(3, 10); api.ctx.lineTo(7, 13); api.ctx.lineTo(-7, 13); api.ctx.lineTo(-3, 10); api.ctx.lineTo(-4, 3); api.ctx.lineTo(-14, 4); api.ctx.lineTo(-4, -2);
    api.ctx.closePath(); api.ctx.fill(); api.ctx.restore();
    const t = table(readout);
    t([
      ["", "speed", "direction"],
      [`<span style="color:${COL.v}">v(P/A): plane rel. air</span>`, `${fmt(mag(...air), 0)} km/h`, bearing(...air)],
      ['<span style="color:#eb5757">v(A/G): wind</span>', `${fmt(mag(...wind), 0)} km/h`, bearing(...wind)],
      [`<span style="color:${COL.g}">v(P/G): plane rel. ground</span>`, `<strong>${fmt(mag(...g), 0)} km/h</strong>`, `<strong>${bearing(...g)}</strong>`],
    ]);
    readout.insertAdjacentHTML("beforeend", `<p class="small" style="margin-top:8px">Components: (${fmt(air[0], 0)} + ${fmt(wind[0], 0)}) î + (${fmt(air[1], 0)} + ${fmt(wind[1], 0)}) ĵ = ${fmt(g[0], 0)} î + ${fmt(g[1], 0)} ĵ km/h.</p>`);
  }
  p.draw();
  return p.destroy;
}
