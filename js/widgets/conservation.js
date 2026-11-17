// Unit 7 widgets: potential energy and conservation of energy.
import { setupCanvas, themeColors, drawArrow, slider } from "../sims/canvas.js";
import { fmt, rad } from "./plane.js";
import { shell, button, row, select } from "./shell.js";
import { panel } from "./graphs.js";

const G = 9.8;
const E = { K: "#2f80ed", Ug: "#27ae60", Ue: "#9b51e0", heat: "#f2994a", tot: "#475569" };
const J = (v) => (Math.abs(v) >= 10000 ? `${fmt(v / 1000, 1)} kJ` : `${fmt(v, Math.abs(v) < 10 ? 2 : 1)} J`);

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

// Energy columns plus one stacked "total" column, so conservation is visible as a constant height.
function energyBars(ctx, c, rect, items, max) {
  const { x, y, w, h } = rect;
  const n = items.length + 1, colW = w / n, bw = Math.min(46, colW * 0.6);
  const base = y + h - 18, H = h - 40;
  const hgt = (v) => (Math.max(0, v) / (max || 1)) * H;
  ctx.save();
  ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + w, base); ctx.stroke();
  items.forEach(([label, val, color], i) => {
    const cx = x + colW * (i + 0.5);
    ctx.fillStyle = color; ctx.fillRect(cx - bw / 2, base - hgt(val), bw, hgt(val));
    if (val < -1e-9) { ctx.fillStyle = "#d63c3c"; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("(below 0)", cx, base - 4); }
    ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, cx, base + 14);
    ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace"; ctx.fillText(J(val), cx, base - hgt(val) - 5);
  });
  // stacked total
  const cx = x + colW * (n - 0.5);
  let top = base;
  items.forEach(([, val, color]) => { const hh = hgt(val); ctx.fillStyle = color; ctx.fillRect(cx - bw / 2, top - hh, bw, hh); top -= hh; });
  ctx.fillStyle = c.text; ctx.font = "600 11px Inter, sans-serif"; ctx.fillText("Total", cx, base + 14);
  ctx.fillStyle = c.muted; ctx.font = "10px JetBrains Mono, monospace";
  ctx.fillText(J(items.reduce((s, it) => s + it[1], 0)), cx, top - 5);
  ctx.restore();
}

// =====================================================================
// Frictionless slide: any shape, same speed at the same height
// =====================================================================
const SHAPES = {
  straight: { label: "Straight ramp", y: (u) => 1 - u },
  steep: { label: "Steep, then gentle", y: (u) => (1 - u) ** 2 },
  gentle: { label: "Gentle, then steep", y: (u) => 1 - u * u },
  wavy: { label: "Wavy tube", y: (u) => Math.max(0, 1 - u + 0.12 * Math.sin(2 * Math.PI * u) * (1 - u)) },
};
export function slideEnergy(el) {
  const { canvas, controls, readout } = shell(el, { title: "Slide energy model", icon: "🛝", canvas: true, wide: true });
  const H = 20, L = 30;
  let shape = "straight", u = 0, m = 30, zeroTop = false;
  const yAt = (uu) => H * SHAPES[shape].y(uu);
  let sU;
  const anim = playLoop((dt) => {
    // move along the slide at the real speed (arc length per second), slowed 2× to watch
    const v = Math.sqrt(Math.max(0, 2 * G * (H - yAt(u))));
    const du = 0.001, ds = Math.hypot(L * du, yAt(Math.min(1, u + du)) - yAt(u)) / du;
    u = Math.min(1, u + ((Math.max(v, 1.2) * dt) / 2) / ds);
    sU.set(+u.toFixed(3));
    return u < 1;
  });
  const shapeSel = select(Object.entries(SHAPES).map(([k, s]) => [k, s.label]), shape, (v) => { shape = v; draw(); });
  const zeroSel = select([["bottom", "y = 0 at the bottom"], ["top", "y = 0 at the top"]], "bottom", (v) => { zeroTop = v === "top"; draw(); });
  sU = slider({ label: "Position along the slide", min: 0, max: 1, step: 0.001, value: u, onInput: (v) => { u = v; draw(); } });
  const at8 = () => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; yAt(mid) > 8 ? (lo = mid) : (hi = mid); } sU.set(+hi.toFixed(3)); };
  controls.append(row(shapeSel, zeroSel), sU, row(button("▶ Slide", () => { u = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Jump to 8.0 m high", at8), button("Bottom", () => sU.set(1))));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const left = 30, right = w * 0.55, top = 16, bot = h - 24;
    const X = (uu) => left + uu * (right - left), Y = (yy) => bot - (yy / H) * (bot - top);
    ctx.fillStyle = c.border; ctx.strokeStyle = c.muted; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X(0), bot);
    for (let i = 0; i <= 100; i++) ctx.lineTo(X(i / 100), Y(yAt(i / 100)));
    ctx.lineTo(X(1), bot); ctx.closePath(); ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= 100; i++) { const px = X(i / 100), py = Y(yAt(i / 100)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    // height marks
    ctx.font = "10px JetBrains Mono, monospace"; ctx.fillStyle = c.muted; ctx.textAlign = "right";
    [0, 8, 20].forEach((hh) => { ctx.fillText(`${hh} m`, left - 4, Y(hh) + 3); ctx.setLineDash([2, 4]); ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, Y(hh)); ctx.lineTo(right, Y(hh)); ctx.stroke(); ctx.setLineDash([]); });
    const y = yAt(u), v = Math.sqrt(Math.max(0, 2 * G * (H - y)));
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(X(u), Y(y) - 8, 8, 0, Math.PI * 2); ctx.fill();
    const y0 = zeroTop ? H : 0;
    const U = m * G * (y - y0), K = 0.5 * m * v * v, U1 = m * G * (H - y0);
    const max = Math.max(K + Math.max(U, 0), m * G * H);
    energyBars(ctx, c, { x: w * 0.6, y: 6, w: w * 0.38, h: h - 10 }, [["K", K, E.K], ["U", U, E.Ug]], max);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Height y</th><td>${fmt(y, 2)} m</td></tr>
        <tr><th>U = mg(y − y₀)</th><td>${J(U)}</td></tr>
        <tr><th>K = ½mv²</th><td>${J(K)}</td></tr>
        <tr><th>E = K + U</th><td><strong>${J(K + U)}</strong> (always ${J(U1)})</td></tr>
        <tr><th>Speed v = √(2g·height lost)</th><td><strong>${fmt(v, 1)} m/s</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${zeroTop ? "With y = 0 at the top, U is negative on the way down, but ΔU and the speed are exactly the same." : "Mass cancels, and so does the shape: only the height lost sets the speed."}</p>`;
  }
  draw();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Pendulum: tension never does work
// =====================================================================
export function pendulumEnergy(el) {
  const { canvas, controls, readout } = shell(el, { title: "Pendulum energy model", icon: "🕰️", canvas: true });
  let Lp = 1.0, h = 0.5, th = 0, om = 0, m = 1;
  const th0 = () => Math.acos(1 - h / Lp);
  const reset = () => { th = th0(); om = 0; draw(); };
  controls.append(
    slider({ label: "String length", min: 0.5, max: 3, step: 0.1, value: Lp, unit: "m", onInput: (v) => { Lp = v; h = Math.min(h, Lp * 1.8); reset(); } }),
    slider({ label: "Release height above the bottom", min: 0.05, max: 1.5, step: 0.05, value: h, unit: "m", onInput: (v) => { h = Math.min(v, Lp * 1.8); reset(); } }),
    row(button("Reset", reset)),
  );
  const anim = playLoop((dt) => {
    const n = 20, d = dt / n;
    for (let i = 0; i < n; i++) { const a = -(G / Lp) * Math.sin(th); om += a * d; th += om * d; }
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h: H } = size;
    ctx.clearRect(0, 0, w, H);
    const px = w * 0.32, py = 20, scale = Math.min((H - 70) / Lp, (w * 0.28) / Lp);
    const bx = px + Lp * scale * Math.sin(th), by = py + Lp * scale * Math.cos(th);
    ctx.fillStyle = c.muted; ctx.fillRect(px - 30, py - 6, 60, 6);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px, py, Lp * scale, Math.PI / 2 - th0(), Math.PI / 2 + th0()); ctx.stroke();
    const yb = py + Lp * scale, yt = py + Lp * scale * Math.cos(th0());
    ctx.beginPath(); ctx.moveTo(px - Lp * scale, yb); ctx.lineTo(px + Lp * scale, yb); ctx.moveTo(px - Lp * scale, yt); ctx.lineTo(px + Lp * scale, yt); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`h = ${fmt(h, 2)} m`, px + Lp * scale * 0.5, (yb + yt) / 2);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    const v = om * Lp;
    const tx = Math.cos(th), ty = -Math.sin(th); // tangent direction on screen for increasing θ
    drawArrow(ctx, bx, by, tx * v * 18, ty * v * 18, E.K, Math.abs(v) > 0.05 ? "v" : null);
    drawArrow(ctx, bx, by, (px - bx) * 0.35, (py - by) * 0.35, "#9b51e0", "T");
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();
    const y = Lp * (1 - Math.cos(th));
    const U = m * G * y, K = 0.5 * m * v * v;
    energyBars(ctx, c, { x: w * 0.62, y: 6, w: w * 0.36, h: H - 10 }, [["K", K, E.K], ["U", U, E.Ug]], m * G * h);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Height above the bottom</th><td>${fmt(y, 3)} m</td></tr>
        <tr><th>Speed now</th><td>${fmt(Math.abs(v), 2)} m/s</td></tr>
        <tr><th>Speed at the bottom, √(2gh)</th><td><strong>${fmt(Math.sqrt(2 * G * h), 2)} m/s</strong></td></tr>
        <tr><th>Work by tension</th><td>0 (T ⟂ v at every instant)</td></tr>
      </table>`;
  }
  reset();
  anim.start();
  return () => { anim.stop(); destroy(); };
}

// Zig-zag spring between two x positions.
function coil(ctx, x0, x1, y, color, turns = 9) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y);
  for (let i = 1; i < turns * 2; i++) ctx.lineTo(x0 + ((x1 - x0) * i) / (turns * 2), y + (i % 2 ? -9 : 9));
  ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
}

// =====================================================================
// Block hits a spring: K ↔ ½kx²
// =====================================================================
export function springBlockEnergy(el) {
  const { canvas, controls, readout } = shell(el, { title: "Block hits a spring", icon: "🧱", canvas: true, wide: true });
  const st = { m: 0.4, v0: 3, k: 250 };
  let x = -0.15; // compression (negative = not yet touching)
  const xmax = () => st.v0 * Math.sqrt(st.m / st.k);
  let sX;
  const build = () => {
    controls.innerHTML = "";
    sX = slider({ label: "Compression x (negative = not touching yet)", min: -0.15, max: +xmax().toFixed(3), step: 0.001, value: Math.min(x, xmax()), unit: "m", onInput: (v) => { x = v; draw(); } });
    controls.append(
      slider({ label: "Mass", min: 0.1, max: 2, step: 0.05, value: st.m, unit: "kg", onInput: (v) => { st.m = v; x = Math.min(x, xmax()); build(); } }),
      slider({ label: "Speed before impact", min: 0.5, max: 6, step: 0.1, value: st.v0, unit: "m/s", onInput: (v) => { st.v0 = v; x = Math.min(x, xmax()); build(); } }),
      slider({ label: "Spring constant k", min: 50, max: 1000, step: 10, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; x = Math.min(x, xmax()); build(); } }),
      sX,
      row(button("Max compression", () => sX.set(+xmax().toFixed(3))), button("Half of max", () => sX.set(+(xmax() / 2).toFixed(3))), button("Worked example", () => { Object.assign(st, { m: 0.4, v0: 3, k: 250 }); x = xmax() / 2; build(); })),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const xc = Math.max(0, x);
    const Ue = 0.5 * st.k * xc * xc, K = Math.max(0, 0.5 * st.m * st.v0 ** 2 - Ue), v = Math.sqrt((2 * K) / st.m);
    const wallX = w * 0.56, relaxed = wallX - w * 0.2, s = (w * 0.2) / 0.3;
    const floor = h * 0.6;
    ctx.fillStyle = c.border; ctx.fillRect(10, floor, wallX - 10, 4);
    ctx.fillStyle = c.muted; ctx.fillRect(wallX, floor - 60, 8, 64);
    coil(ctx, relaxed + xc * s, wallX, floor - 18, c.text);
    const bx = relaxed + x * s - 40;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(bx, floor - 36, 40, 36);
    if (v > 0.02) drawArrow(ctx, bx + 20, floor - 48, Math.min(70, v * 14), 0, E.K, `v = ${fmt(v, 2)} m/s`);
    energyBars(ctx, c, { x: w * 0.62, y: 6, w: w * 0.36, h: h - 10 }, [["K", K, E.K], ["U_el", Ue, E.Ue]], 0.5 * st.m * st.v0 ** 2);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Starting K = ½mv₀²</th><td>${J(0.5 * st.m * st.v0 ** 2)}</td></tr>
        <tr><th>Spring U_el = ½kx²</th><td>${J(Ue)}</td></tr>
        <tr><th>Block K</th><td>${J(K)} → v = <strong>${fmt(v, 2)} m/s</strong></td></tr>
        <tr><th>Max compression √(m/k)·v₀</th><td><strong>${fmt(xmax(), 3)} m</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${Math.abs(xc - xmax() / 2) < 0.002 ? "At half the compression the spring holds only a quarter of the energy: that's the x²." : xc >= xmax() - 0.001 ? "Maximum compression: the block stops for an instant and all the energy is in the spring." : ""}</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Spring launches a ball upward: U_el → K → U_grav
// =====================================================================
export function launcherHeight(el) {
  const { canvas, controls, readout } = shell(el, { title: "Spring launches a ball upward", icon: "⬆️", canvas: true });
  const st = { k: 500, x: 0.2, m: 0.1 };
  let y = 0;
  const hmax = () => (0.5 * st.k * st.x ** 2) / (st.m * G);
  let sY;
  const build = () => {
    controls.innerHTML = "";
    sY = slider({ label: "Ball height above launch", min: 0, max: +hmax().toFixed(2), step: 0.01, value: Math.min(y, hmax()), unit: "m", onInput: (v) => { y = v; draw(); } });
    controls.append(
      slider({ label: "Spring constant k", min: 100, max: 1500, step: 10, value: st.k, unit: "N/m", onInput: (v) => { st.k = v; y = 0; build(); } }),
      slider({ label: "Compression", min: 0.05, max: 0.3, step: 0.01, value: st.x, unit: "m", onInput: (v) => { st.x = v; y = 0; build(); } }),
      slider({ label: "Ball mass", min: 0.05, max: 1, step: 0.01, value: st.m, unit: "kg", onInput: (v) => { st.m = v; y = 0; build(); } }),
      sY,
      row(button("▶ Launch", () => { t = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Worked example", () => { Object.assign(st, { k: 500, x: 0.2, m: 0.1 }); y = 0; build(); })),
    );
    draw();
  };
  let t = 0;
  const anim = playLoop((dt) => {
    const v0 = Math.sqrt(2 * G * hmax());
    t += dt * 0.8;
    y = Math.max(0, v0 * t - 0.5 * G * t * t);
    sY.set(+Math.min(y, hmax()).toFixed(2));
    return t < (2 * v0) / G;
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const U0 = 0.5 * st.k * st.x ** 2, Ug = st.m * G * y, K = Math.max(0, U0 - Ug);
    const launched = y > 0 || t > 0;
    const col = w * 0.25, base = h - 40, top = 20, Y = (yy) => base - (yy / Math.max(hmax(), 0.5)) * (base - top);
    ctx.fillStyle = c.border; ctx.fillRect(col - 30, base, 60, 30);
    if (!launched) { // compressed spring under the ball
      ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(col, base);
      for (let i = 1; i < 10; i++) ctx.lineTo(col + (i % 2 ? -8 : 8), base - i * 1.6);
      ctx.lineTo(col, base - 16); ctx.stroke();
    }
    ctx.strokeStyle = c.muted; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(col - 40, Y(hmax())); ctx.lineTo(col + 40, Y(hmax())); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.muted; ctx.font = "10px Inter, sans-serif"; ctx.textAlign = "left"; ctx.fillText(`h = ${fmt(hmax(), 2)} m`, col + 44, Y(hmax()) + 3);
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(col, Y(y) - 8, 8, 0, Math.PI * 2); ctx.fill();
    const Ue = y === 0 && !launched ? U0 : 0;
    energyBars(ctx, c, { x: w * 0.45, y: 6, w: w * 0.53, h: h - 10 }, [["U_el", Ue, E.Ue], ["K", Ue ? 0 : K, E.K], ["U_grav", Ug, E.Ug]], U0);
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Spring stores ½kx²</th><td>${J(U0)}</td></tr>
        <tr><th>At the top: mgh = ½kx²</th><td>h = <strong>${fmt(hmax(), 2)} m</strong></td></tr>
        <tr><th>Now: U_grav = mgy</th><td>${J(Ug)}, K = ${J(Ue ? 0 : K)}</td></tr>
      </table>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Ramp with friction: K₁ + U₁ + W_other = K₂ + U₂, with the heat shown
// =====================================================================
export function energyLedger(el) {
  const { canvas, controls, readout } = shell(el, { title: "Ramp with friction energy ledger", icon: "🧾", canvas: true, wide: true });
  const st = { m: 2, ang: 30, L: 4, mu: 0.2 };
  let s = 4, sS;
  const calc = (ss) => {
    const h = st.L * Math.sin(rad(st.ang));
    const f = st.mu * st.m * G * Math.cos(rad(st.ang));
    const U1 = st.m * G * h, U = st.m * G * (h - ss * Math.sin(rad(st.ang)));
    const Wf = -f * ss, K = U1 - U + Wf;
    return { h, f, U1, U, Wf, K };
  };
  const slides = () => Math.tan(rad(st.ang)) > st.mu;
  const build = () => {
    controls.innerHTML = "";
    sS = slider({ label: "Distance slid down the ramp", min: 0, max: st.L, step: 0.01, value: Math.min(s, st.L), unit: "m", onInput: (v) => { s = v; draw(); } });
    controls.append(
      slider({ label: "Ramp angle", min: 5, max: 60, step: 1, value: st.ang, unit: "°", onInput: (v) => { st.ang = v; s = 0; build(); } }),
      slider({ label: "Ramp length", min: 1, max: 10, step: 0.5, value: st.L, unit: "m", onInput: (v) => { st.L = v; s = 0; build(); } }),
      slider({ label: "Kinetic friction μₖ", min: 0, max: 0.8, step: 0.01, value: st.mu, onInput: (v) => { st.mu = v; s = 0; build(); } }),
      slider({ label: "Mass", min: 0.5, max: 10, step: 0.5, value: st.m, unit: "kg", onInput: (v) => { st.m = v; build(); } }),
      sS,
      row(button("▶ Slide", () => { s = 0; anim.start(); }, "btn btn-primary btn-sm"), button("Worked example", () => { Object.assign(st, { m: 2, ang: 30, L: 4, mu: 0.2 }); s = 4; build(); })),
    );
    draw();
  };
  const anim = playLoop((dt) => {
    if (!slides()) return false;
    const r = calc(s), v = Math.sqrt(Math.max(0, (2 * r.K) / st.m));
    s = Math.min(st.L, s + Math.max(v, 0.6) * dt * 0.6);
    sS.set(+s.toFixed(2));
    return s < st.L;
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const ok = slides();
    const r = calc(ok ? s : 0);
    const K = Math.max(0, r.K), v = Math.sqrt((2 * K) / st.m);
    const th = rad(st.ang), bx0 = w * 0.55, by0 = h - 20;
    const Lp = Math.min((w * 0.5) / Math.cos(th), (h - 40) / Math.sin(th));
    const tx = bx0 - Lp * Math.cos(th), ty = by0 - Lp * Math.sin(th);
    ctx.fillStyle = c.border; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx0, by0); ctx.lineTo(tx, by0); ctx.closePath(); ctx.fill();
    const frac = (ok ? s : 0) / st.L;
    const cx = tx + (bx0 - tx) * frac, cy = ty + (by0 - ty) * frac;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(-14, -26, 28, 26); ctx.restore();
    const heat = -r.Wf;
    energyBars(ctx, c, { x: w * 0.58, y: 6, w: w * 0.4, h: h - 10 }, [["K", K, E.K], ["U", r.U, E.Ug], ["Heat", ok ? heat : 0, E.heat]], r.U1);
    const vFree = Math.sqrt(2 * G * r.h);
    readout.innerHTML = ok ? `
      <div class="conv-chain">K₁ + U₁ + W_other = K₂ + U₂: 0 + ${J(r.U1)} − ${J(heat)} = ${J(K)} + ${J(r.U)}</div>
      <table class="mini-table" style="margin-top:8px">
        <tr><th>Friction fₖ = μₖmg cos θ</th><td>${fmt(r.f, 2)} N</td></tr>
        <tr><th>W_other = −fₖs</th><td>${J(r.Wf)} (becomes heat)</td></tr>
        <tr><th>Speed now</th><td><strong>${fmt(v, 2)} m/s</strong></td></tr>
        <tr><th>Frictionless speed at the bottom</th><td>${fmt(vFree, 2)} m/s</td></tr>
      </table>` : `<div class="verdict">tan θ = ${fmt(Math.tan(th), 2)} isn't bigger than μ = ${st.mu}, so the box doesn't start sliding (taking μₛ ≈ μₖ).</div>`;
  }
  build();
  return () => { anim.stop(); destroy(); };
}

// =====================================================================
// Work backward: find W_other from known speeds
// =====================================================================
export function frictionDetective(el) {
  const { controls, readout } = shell(el, { title: "Where did the energy go?", icon: "🔍" });
  const st = { m: 50, h: 5, v: 9 };
  const sl = {
    m: slider({ label: "Mass", min: 10, max: 120, step: 1, value: st.m, unit: "kg", onInput: (v) => { st.m = v; render(); } }),
    h: slider({ label: "Height of the ramp", min: 1, max: 50, step: 0.5, value: st.h, unit: "m", onInput: (v) => { st.h = v; render(); } }),
    v: slider({ label: "Speed measured at the bottom", min: 0, max: 35, step: 0.5, value: st.v, unit: "m/s", onInput: (v) => { st.v = v; render(); } }),
  };
  controls.append(sl.m, sl.h, sl.v, row(button("Skateboarder example", () => { sl.m.set(50); sl.h.set(5); sl.v.set(9); })));
  function render() {
    const U1 = st.m * G * st.h, K2 = 0.5 * st.m * st.v ** 2, W = K2 - U1;
    const pct = (Math.abs(W) / U1) * 100;
    readout.innerHTML = `
      <div class="conv-chain">0 + ${J(U1)} + W_other = ${J(K2)} + 0 → W_other = <strong>${J(W)}</strong></div>
      <div class="bars" style="margin-top:10px">
        <div class="bar-row"><span class="bar-label">Starting U = mgh</span><span class="bar"><span style="width:100%;background:${E.Ug}"></span></span><span class="bar-val">${J(U1)}</span></div>
        <div class="bar-row"><span class="bar-label">K at the bottom</span><span class="bar"><span style="width:${Math.min(100, (K2 / U1) * 100)}%;background:${E.K}"></span></span><span class="bar-val">${J(K2)}</span></div>
      </div>
      <div class="verdict" style="margin-top:8px">${W < -0.5 ? `Friction and drag removed ${J(-W)}, ${fmt(pct, 0)}% of the starting energy, as heat.` : W > 0.5 ? `W_other is positive: something pushed the skater (${J(W)} added). That's faster than frictionless, √(2gh) = ${fmt(Math.sqrt(2 * G * st.h), 1)} m/s.` : "No energy lost: this is the frictionless speed."}</div>`;
  }
  render();
}

// =====================================================================
// Conservative vs. nonconservative: work along different paths
// =====================================================================
const PATHS = {
  straight: { label: "Straight line", pts: [[0, 10], [10, 0]] },
  stairs: { label: "Staircase", pts: [[0, 10], [2.5, 10], [2.5, 7.5], [5, 7.5], [5, 5], [7.5, 5], [7.5, 2.5], [10, 2.5], [10, 0]] },
  winding: { label: "Winding path", pts: Array.from({ length: 61 }, (_, i) => { const u = i / 60; return [10 * u + 2.2 * Math.sin(4 * Math.PI * u), 10 * (1 - u) + 2.2 * Math.sin(3 * Math.PI * u)]; }) },
  loop: { label: "Round trip A → B → A", pts: [[0, 10], [10, 0], [10, 10], [0, 10]] },
};
const pathLen = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
export function pathWork(el) {
  const { canvas, controls, readout } = shell(el, { title: "Path-dependence explorer", icon: "🗺️", canvas: true });
  const m = 2, mu = 0.3;
  let force = "gravity", path = "straight";
  const work = (f, pts) => {
    let W = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      W += f === "gravity" ? -m * G * dy : -mu * m * G * Math.hypot(dx, dy);
    }
    return W;
  };
  controls.append(row(
    select([["gravity", "Gravity (side view, A is 10 m higher)"], ["friction", "Friction (top view, dragging on a floor)"]], force, (v) => { force = v; draw(); }),
    select(Object.entries(PATHS).map(([k, p]) => [k, p.label]), path, (v) => { path = v; draw(); }),
  ));
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const pad = 36, s = Math.min(w, h) - 2 * pad;
    const X = (x) => pad + (x / 10) * s, Y = (y) => pad + ((10 - y) / 10) * s;
    if (force === "gravity") { ctx.fillStyle = c.border; ctx.fillRect(0, Y(0) + 2, w, 4); }
    Object.entries(PATHS).forEach(([k, p]) => {
      ctx.strokeStyle = k === path ? "#9b51e0" : c.border; ctx.lineWidth = k === path ? 3 : 1.5;
      ctx.beginPath(); p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
    });
    [["A", 0, 10], ["B", 10, 0]].forEach(([n, x, y]) => {
      ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(X(x), Y(y), 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 14px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(n, X(x) + (x ? 14 : -14), Y(y) - 8);
    });
    const rows = Object.entries(PATHS).map(([k, p]) => `<tr class="${k === path ? "is-find" : ""}"><td>${p.label}</td><td>${fmt(pathLen(p.pts), 1)} m</td><td>${J(work("gravity", p.pts))}</td><td>${J(work("friction", p.pts))}</td></tr>`).join("");
    readout.innerHTML = `
      <table class="mini-table solver">
        <tr><th>Path</th><th>Length</th><th>W by gravity</th><th>W by friction</th></tr>
        ${rows}
      </table>
      <div class="verdict" style="margin-top:8px">${force === "gravity" ? "Gravity's work is the same on every path from A to B, and zero around the round trip: conservative." : "Friction's work grows with path length and is negative even around the round trip: nonconservative."}</div>
      <p class="small muted">2.0 kg box; μₖ = 0.30 for friction.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Force from the slope of U(x)
// =====================================================================
const UFUNCS = {
  cubic: { label: "U = 3x² − 2x³ (worked example)", U: (x) => 3 * x * x - 2 * x ** 3, dU: (x) => 6 * x - 6 * x * x, r: [-0.8, 2.2], x0: 2, unit: "m" },
  spring: { label: "Spring: U = ½(200)x²", U: (x) => 100 * x * x, dU: (x) => 200 * x, r: [-0.15, 0.15], x0: 0.08, unit: "m" },
  gravity: { label: "Gravity: U = mgy (m = 1.0 kg)", U: (x) => 9.8 * x, dU: () => 9.8, r: [0, 3], x0: 1.5, unit: "m" },
};
export function forceFromU(el) {
  const { canvas, controls, readout } = shell(el, { title: "Force from the slope of U(x)", icon: "⛰️", canvas: true, xtall: true });
  let key = "cubic", x = 2;
  const build = () => {
    const f = UFUNCS[key];
    controls.innerHTML = "";
    controls.append(
      row(select(Object.entries(UFUNCS).map(([k, v]) => [k, v.label]), key, (v) => { key = v; x = UFUNCS[v].x0; build(); })),
      slider({ label: "Position x", min: f.r[0], max: f.r[1], step: (f.r[1] - f.r[0]) / 400, value: x, unit: f.unit, onInput: (v) => { x = v; draw(); } }),
    );
    draw();
  };
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const f = UFUNCS[key];
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const xs = Array.from({ length: 201 }, (_, i) => f.r[0] + ((f.r[1] - f.r[0]) * i) / 200);
    const Us = xs.map(f.U), Fs = xs.map((q) => -f.dU(q));
    const range = (arr) => { const lo = Math.min(...arr, 0), hi = Math.max(...arr, 0), p = (hi - lo) * 0.1 || 1; return [lo - p, hi + p]; };
    const [u0, u1] = range(Us), [f0, f1] = range(Fs);
    const gh = (h - 54) / 2;
    const PU = panel(ctx, c, { x: 46, y: 8, w: w - 58, h: gh }, { t0: f.r[0], t1: f.r[1], y0: u0, y1: u1, label: "U(x) (J)" });
    const PF = panel(ctx, c, { x: 46, y: 30 + gh, w: w - 58, h: gh }, { t0: f.r[0], t1: f.r[1], y0: f0, y1: f1, label: "F(x) = −dU/dx (N)" });
    PU.frame(); PF.frame();
    PU.curve(xs, Us, "#27ae60"); PF.curve(xs, Fs, "#eb5757");
    PU.tangent(x, f.U(x), f.dU(x), "#2f80ed", (f.r[1] - f.r[0]) * 0.18);
    PU.cursor(x); PF.cursor(x);
    PF.dot(x, -f.dU(x), "#eb5757");
    // ball on the curve with the force arrow pointing downhill
    const bx = PU.X(x), by = PU.Y(f.U(x));
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(bx, by - 7, 7, 0, Math.PI * 2); ctx.fill();
    const F = -f.dU(x), Fmax = Math.max(...Fs.map(Math.abs), 1e-9);
    if (Math.abs(F) > Fmax * 0.01) drawArrow(ctx, bx, by - 22, (F / Fmax) * 60, 0, "#eb5757", "F");
    // F = 0 where it changes sign; an exact zero on a sample point counts once
    const zeros = [];
    for (let i = 1; i < xs.length; i++) {
      if (Fs[i] === 0) zeros.push(xs[i]);
      else if (Fs[i - 1] !== 0 && Fs[i] * Fs[i - 1] < 0) zeros.push((xs[i] + xs[i - 1]) / 2);
    }
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>U(x)</th><td>${fmt(f.U(x), 3)} J</td></tr>
        <tr><th>Slope dU/dx</th><td>${fmt(f.dU(x), 3)} J/m</td></tr>
        <tr><th>F = −dU/dx</th><td><strong>${fmt(F, 2)} N</strong> ${Math.abs(F) < 1e-6 ? "(equilibrium)" : F > 0 ? "→ +x" : "← −x"}</td></tr>
        <tr><th>F = 0 at</th><td>${zeros.length ? zeros.map((z) => `x ≈ ${fmt(z, 2)}`).join(", ") : "nowhere (constant force)"}</td></tr>
      </table>
      <p class="small" style="margin-top:8px">Uphill slope means the force points the other way: the force always points toward lower U.</p>`;
  }
  build();
  return destroy;
}

// =====================================================================
// Energy diagram: E line, allowed regions, turning points, a moving ball
// =====================================================================
const DIAGRAMS = {
  spring: { label: "Spring: U = ½(200)x²", U: (x) => 100 * x * x, dU: (x) => 200 * x, r: [-0.16, 0.16], m: 0.5, E0: 1.0, Emax: 2.4, x0: 0 },
  cubic: { label: "Cubic: U = 3x² − 2x³", U: (x) => 3 * x * x - 2 * x ** 3, dU: (x) => 6 * x - 6 * x * x, r: [-0.9, 1.8], m: 1, E0: 0.6, Emax: 2.0, x0: 0 },
};
export function energyDiagram(el) {
  const { canvas, controls, readout } = shell(el, { title: "Interactive energy diagram", icon: "📉", canvas: true });
  let key = "spring", Etot = 1.0, x = 0, v = 0;
  const launch = () => { const d = DIAGRAMS[key]; x = d.x0; v = Math.sqrt(Math.max(0, (2 * (Etot - d.U(x))) / d.m)); };
  const build = () => {
    const d = DIAGRAMS[key];
    controls.innerHTML = "";
    controls.append(
      row(select(Object.entries(DIAGRAMS).map(([k, v2]) => [k, v2.label]), key, (val) => { key = val; Etot = DIAGRAMS[val].E0; launch(); build(); })),
      slider({ label: "Total energy E", min: 0.02, max: d.Emax, step: 0.01, value: Etot, unit: "J", onInput: (val) => { Etot = val; launch(); draw(); } }),
      row(button("Restart the ball", () => { launch(); })),
    );
    draw();
  };
  const anim = playLoop((dt) => {
    const d = DIAGRAMS[key];
    const span = d.r[1] - d.r[0];
    const n = 40, h = (dt * (key === "spring" ? 0.5 : 0.8)) / n;
    for (let i = 0; i < n; i++) { const a = -d.dU(x) / d.m; v += a * h; x += v * h; }
    // keep energy exact so the ball turns where the diagram says
    const K = Etot - d.U(x);
    if (K > 0) v = Math.sign(v || 1) * Math.sqrt((2 * K) / d.m);
    if (x > d.r[1] + span * 0.05 || x < d.r[0] - span * 0.05) launch();
    draw();
  });
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    if (!size.w) return;
    const c = themeColors();
    const d = DIAGRAMS[key];
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);
    const xs = Array.from({ length: 301 }, (_, i) => d.r[0] + ((d.r[1] - d.r[0]) * i) / 300);
    const Us = xs.map(d.U);
    const y1 = Math.max(d.Emax, Math.min(...Us) + 0.5) * 1.08, y0 = Math.min(0, ...Us) - 0.2;
    const P = panel(ctx, c, { x: 44, y: 10, w: w - 56, h: h - 34 }, { t0: d.r[0], t1: d.r[1], y0, y1, label: "U(x) and E (J)" });
    P.frame();
    // forbidden regions
    ctx.save(); ctx.fillStyle = "rgba(214,60,60,.14)";
    for (let i = 1; i < xs.length; i++) if (Us[i] > Etot) ctx.fillRect(P.X(xs[i - 1]), 10, P.X(xs[i]) - P.X(xs[i - 1]) + 0.5, h - 34);
    ctx.restore();
    P.curve(xs, Us, "#27ae60", 3);
    ctx.save(); ctx.strokeStyle = "#2f80ed"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    P.seg(P.X(d.r[0]), P.Y(Etot), P.X(d.r[1]), P.Y(Etot)); ctx.restore();
    ctx.fillStyle = "#2f80ed"; ctx.font = "600 11px Inter, sans-serif"; ctx.textAlign = "right"; ctx.fillText(`E = ${fmt(Etot, 2)} J`, P.X(d.r[1]) - 4, P.Y(Etot) - 6);
    // turning points and equilibria
    const turns = [], eq = [];
    for (let i = 1; i < xs.length; i++) {
      if (Math.sign(Us[i] - Etot) !== Math.sign(Us[i - 1] - Etot)) turns.push((xs[i] + xs[i - 1]) / 2);
      // slope going − to + is a valley (stable); + to − is a hilltop (unstable)
      const s0 = d.dU(xs[i - 1]), s1 = d.dU(xs[i]);
      if (s0 < 0 && s1 >= 0) eq.push([s1 === 0 ? xs[i] : (xs[i] + xs[i - 1]) / 2, "stable"]);
      else if (s0 > 0 && s1 <= 0) eq.push([s1 === 0 ? xs[i] : (xs[i] + xs[i - 1]) / 2, "unstable"]);
    }
    turns.forEach((t) => P.dot(t, Etot, "#d63c3c", 5));
    eq.forEach(([xe, kind]) => {
      ctx.fillStyle = kind === "stable" ? "#16a34a" : "#d63c3c"; ctx.font = "600 10px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(kind, P.X(xe), P.Y(d.U(xe)) + (kind === "stable" ? 16 : -10));
    });
    // the ball sits on the E line; its K is the gap down to U
    const K = Math.max(0, Etot - d.U(x));
    ctx.save(); ctx.strokeStyle = "#2f80ed"; ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
    P.seg(P.X(x), P.Y(Etot), P.X(x), P.Y(d.U(x))); ctx.restore();
    ctx.fillStyle = "#e67e22"; ctx.beginPath(); ctx.arc(P.X(x), P.Y(d.U(x)) - 7, 7, 0, Math.PI * 2); ctx.fill();
    const trapped = key === "spring" || Etot < 1;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Turning points (U = E)</th><td>${turns.length ? turns.map((t) => `x ≈ ${fmt(t, 3)}`).join(", ") : "none in view"}</td></tr>
        <tr><th>K = E − U at the ball</th><td>${fmt(K, 3)} J</td></tr>
        <tr><th>Equilibrium points</th><td>${eq.map(([xe, kind]) => `${kind} at x ≈ ${fmt(xe, 2)}`).join("; ")}</td></tr>
      </table>
      <div class="verdict">${key === "spring" ? `Oscillates between ±√(2E/k) = ±${fmt(Math.sqrt((2 * Etot) / 200), 3)} m, fastest at x = 0.` : trapped ? "E is below the 1.0 J hilltop: the ball is trapped in the valley, oscillating." : "E is above the 1.0 J hilltop: the ball climbs over at x = 1.0 m and escapes toward large x."}</div>`;
  }
  launch();
  build();
  anim.start();
  return () => { anim.stop(); destroy(); };
}
