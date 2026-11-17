// Vector widgets: walking path, tail-to-head addition, scalar multiples,
// component explorer, and the dot product as a projection.
import { slider } from "../sims/canvas.js";
import { plane, vecColors as C, mag, angle360, fromPolar, fmt, deg } from "./plane.js";
import { shell, button, row, checkbox, select, table } from "./shell.js";

const compass = (x, y) => {
  if (Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9) return "no direction";
  if (Math.abs(x) < 1e-9) return y > 0 ? "due north" : "due south";
  if (Math.abs(y) < 1e-9) return x > 0 ? "due east" : "due west";
  return `${fmt(deg(Math.atan(Math.abs(y) / Math.abs(x))), 1)}° ${y > 0 ? "north" : "south"} of ${x > 0 ? "east" : "west"}`;
};
const ij = (x, y, unit = "") => `(${fmt(x)} î ${y < 0 ? "−" : "+"} ${fmt(Math.abs(y))} ĵ)${unit ? " " + unit : ""}`;

// =====================================================================
// Distance vs. displacement: click to walk
// =====================================================================
export function walker(el) {
  const { canvas, controls, readout } = shell(el, { title: "Distance vs. displacement", icon: "🚶", canvas: true });
  const example = () => [[0, 0], [3, 0], [3, 4]];
  let pts = example();
  const p = plane(canvas, { range: 6, snap: 1, center: [1.5, 2], onDraw });
  p.onClick = (pt) => { pts.push(pt); p.draw(); };
  controls.append(
    row(button("Undo", () => { if (pts.length > 1) pts.pop(); p.draw(); }), button("Clear", () => { pts = [[0, 0]]; p.draw(); }), button("3 m E, 4 m N", () => { pts = example(); p.draw(); })),
    Object.assign(document.createElement("p"), { className: "muted small", textContent: "Click anywhere on the grid to walk there in a straight line." }),
  );
  const t = table(readout);
  function onDraw(api) {
    const c = api.colors();
    let dist = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const d = mag(x1 - x0, y1 - y0);
      dist += d;
      api.vector(x0, y0, x1, y1, c.muted, null, { dashed: true });
      api.label((x0 + x1) / 2, (y0 + y1) / 2, `${fmt(d, 1)} m`, c.muted, 0, -12);
    }
    const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
    const dx = ex - sx, dy = ey - sy;
    if (pts.length > 1) api.vector(sx, sy, ex, ey, C.R, "Δr", { width: 4 });
    api.dot(sx, sy, c.text, 5);
    api.label(sx, sy, "start", c.text, 0, 14);
    t([
      ["Legs walked", pts.length - 1],
      ["Distance (scalar)", `<strong>${fmt(dist, 2)} m</strong>`],
      ["Displacement size", `<strong style="color:${C.R}">${fmt(mag(dx, dy), 2)} m</strong>`],
      ["Direction", compass(dx, dy)],
    ]);
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Tail-to-head addition (and subtraction), with optional components
// =====================================================================
export function vectorAdd(el, data) {
  const { canvas, controls, readout } = shell(el, { title: "Vector addition", icon: "➕", canvas: true, tall: true });
  const parse = (s, d) => (s ? s.split(",").map(Number) : d);
  const init = { A: fromPolar(...parse(data.a, [3, 0])), B: fromPolar(...parse(data.b, [4, 90])) };
  let A = [...init.A], B = [...init.B];
  let sign = 1, para = false, comps = data.components === "1";
  const R = () => [A[0] + sign * B[0], A[1] + sign * B[1]];
  // frame the starting picture
  const xs = [0, A[0], R()[0], B[0]], ys = [0, A[1], R()[1], B[1]];
  const center = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const range = Math.max(4, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.62 + 1);
  const p = plane(canvas, { range, center, onDraw });
  p.addHandle({ color: C.A, get: () => A, set: (x, y) => { A = [x, y]; } });
  p.addHandle({ color: C.B, get: () => R(), set: (x, y) => { B = [(x - A[0]) * sign, (y - A[1]) * sign]; } });

  controls.append(
    row(select([["1", "A + B"], ["-1", "A − B"]], "1", (v) => { sign = Number(v); p.draw(); }), button("Reset", () => { A = [...init.A]; B = [...init.B]; p.draw(); })),
    checkbox("Show parallelogram (B + A)", para, (v) => { para = v; p.draw(); }),
    checkbox("Show components of R", comps, (v) => { comps = v; p.draw(); }),
  );
  const t = table(readout);
  function onDraw(api) {
    const c = api.colors();
    const [rx, ry] = R();
    const sB = [sign * B[0], sign * B[1]];
    if (para) {
      api.vector(0, 0, sB[0], sB[1], C.B, null, { dashed: true });
      api.vector(sB[0], sB[1], rx, ry, C.A, null, { dashed: true });
    }
    if (sign < 0) api.vector(A[0], A[1], A[0] + B[0], A[1] + B[1], C.B, "B", { dashed: true });
    if (comps) {
      api.vector(0, 0, rx, 0, C.x, null);
      api.vector(rx, 0, rx, ry, C.y, null);
      api.label(rx / 2, 0, "Rₓ", C.x, 0, ry >= 0 ? 14 : -14);
      api.label(rx, ry / 2, "Rᵧ", C.y, rx >= 0 ? 16 : -16, 0);
    }
    api.vector(0, 0, rx, ry, C.R, "R", { width: 4 });
    api.vector(0, 0, A[0], A[1], C.A, "A");
    api.vector(A[0], A[1], rx, ry, C.B, sign > 0 ? "B" : "−B");
    const v = (name, [x, y], color) => [`<span style="color:${color}">${name}</span>`, `${fmt(mag(x, y))} m`, `${fmt(angle360(x, y), 1)}°`, fmt(x), fmt(y)];
    t([
      ["", "size", "angle", "x", "y"],
      v("A", A, C.A),
      v(sign > 0 ? "B" : "−B", sB, C.B),
      v("R", [rx, ry], C.R),
    ]);
    readout.insertAdjacentHTML("beforeend", `<p class="small" style="margin-top:8px">R = ${ij(rx, ry, "m")}. Add the x column and the y column separately.</p>`);
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Scalar multiplication cA
// =====================================================================
export function scalarMultiply(el) {
  const { canvas, controls, readout } = shell(el, { title: "Multiplying a vector by a scalar", icon: "✖️", canvas: true });
  let A = [2, 1], c = 2;
  const p = plane(canvas, { range: 6, onDraw });
  p.addHandle({ color: C.A, get: () => A, set: (x, y) => { A = [x, y]; } });
  controls.append(slider({ label: "Scalar c", min: -3, max: 3, step: 0.25, value: c, onInput: (v) => { c = v; p.draw(); } }));
  const t = table(readout);
  function onDraw(api) {
    api.vector(0, 0, c * A[0], c * A[1], C.R, `${c}A`, { width: 5 });
    api.vector(0, 0, A[0], A[1], C.A, "A");
    t([
      ["|A|", `${fmt(mag(...A))} m`],
      ["|cA| = |c|·|A|", `${fmt(Math.abs(c) * mag(...A))} m`],
      ["Direction", c > 0 ? "same as A" : c < 0 ? "flipped (opposite A)" : "none (zero vector)"],
      ["cA", ij(c * A[0], c * A[1])],
    ]);
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Component explorer with the tan⁻¹ quadrant trap
// =====================================================================
export function components(el) {
  const { canvas, controls, readout } = shell(el, { title: "Component explorer", icon: "🧭", canvas: true });
  let A = [-3, -4];
  const p = plane(canvas, { range: 6, onDraw });
  p.addHandle({ color: C.A, get: () => A, set: (x, y) => { A = [x, y]; } });
  controls.append(row(...[["Q1", [3, 4]], ["Q2", [-3, 4]], ["Q3", [-3, -4]], ["Q4", [3, -4]]].map(([n, v]) => button(n, () => { A = v; p.draw(); }))));
  function onDraw(api) {
    const [x, y] = A;
    const c = api.colors();
    // shade the quadrant the vector is in
    const [ox, oy] = api.S(0, 0);
    api.ctx.save();
    api.ctx.fillStyle = C.A; api.ctx.globalAlpha = 0.06;
    api.ctx.fillRect(x >= 0 ? ox : 0, y >= 0 ? 0 : oy, x >= 0 ? api.size.w - ox : ox, y >= 0 ? oy : api.size.h - oy);
    api.ctx.restore();
    const th = angle360(x, y);
    if (mag(x, y) > 0.2) api.arc(0, 0, 26, 0, th, c.primary, `θ = ${fmt(th, 1)}°`);
    api.vector(0, 0, x, 0, C.x, null);
    api.vector(x, 0, x, y, C.y, null);
    api.label(x / 2, 0, "Aₓ", C.x, 0, y >= 0 ? 14 : -14);
    api.label(x, y / 2, "Aᵧ", C.y, x >= 0 ? 16 : -16, 0);
    api.vector(0, 0, x, y, C.A, "A", { width: 4 });

    const calc = Math.abs(x) < 1e-9 ? null : deg(Math.atan(y / x));
    let fix;
    if (calc === null) fix = `Aₓ = 0, so tan⁻¹ is undefined. The vector points straight ${y > 0 ? "up (90°)" : "down (270°)"}.`;
    else if (x < 0) fix = `<span class="bad">Aₓ is negative, so the calculator is wrong here.</span> Add 180°: ${fmt(calc, 1)}° + 180° = <strong>${fmt(calc + 180, 1)}°</strong>.`;
    else if (y < 0) fix = `Aₓ is positive, so ${fmt(calc, 1)}° is correct. It's the same direction as ${fmt(calc + 360, 1)}° measured counterclockwise.`;
    else fix = `<span class="good">Aₓ is positive, so the calculator's answer is correct.</span>`;
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>Aₓ = A cos θ</th><td style="color:${C.x}">${fmt(x)} m</td></tr>
        <tr><th>Aᵧ = A sin θ</th><td style="color:${C.y}">${fmt(y)} m</td></tr>
        <tr><th>A = √(Aₓ² + Aᵧ²)</th><td>${fmt(mag(x, y))} m</td></tr>
        <tr><th>Calculator tan⁻¹(Aᵧ/Aₓ)</th><td>${calc === null ? "undefined" : fmt(calc, 1) + "°"}</td></tr>
        <tr><th>Real angle θ</th><td><strong>${fmt(th, 1)}°</strong></td></tr>
      </table>
      <p class="small" style="margin-top:8px">${fix}</p>
      <p class="small muted">Unit-vector form: A = ${ij(x, y, "m")}</p>`;
  }
  p.draw();
  return p.destroy;
}

// =====================================================================
// Dot product as a projection
// =====================================================================
export function dotProduct(el) {
  const { canvas, controls, readout } = shell(el, { title: "Dot product projector", icon: "🔦", canvas: true });
  let A = [2, 3], B = [4, -1];
  const p = plane(canvas, { range: 5, center: [1, 0.5], onDraw });
  p.addHandle({ color: C.A, get: () => A, set: (x, y) => { A = [x, y]; } });
  p.addHandle({ color: C.B, get: () => B, set: (x, y) => { B = [x, y]; } });
  controls.append(row(
    button("Worked example", () => { A = [2, 3]; B = [4, -1]; p.draw(); }),
    button("Perpendicular", () => { A = [2, 3]; B = [-3, 2]; p.draw(); }),
    button("Opposite-ish", () => { A = [2, 3]; B = [-3, -1]; p.draw(); }),
  ));
  function onDraw(api) {
    const c = api.colors();
    const a2 = A[0] ** 2 + A[1] ** 2;
    const d = A[0] * B[0] + A[1] * B[1];
    const color = Math.abs(d) < 0.05 ? c.muted : d > 0 ? C.R : "#d63c3c";
    if (a2 > 0.01) {
      const k = d / a2;
      const P = [k * A[0], k * A[1]];
      // the line A lies on
      const L = 20 / Math.sqrt(a2);
      api.segment(-L * A[0], -L * A[1], L * A[0], L * A[1], c.border, { dashed: false, width: 1 });
      api.segment(B[0], B[1], P[0], P[1], c.muted);
      api.segment(0, 0, P[0], P[1], color, { dashed: false, width: 8 });
      const phiA = angle360(...A), phiB = angle360(...B);
      let a0 = phiA, a1 = phiB;
      if (a1 - a0 > 180) a1 -= 360; if (a0 - a1 > 180) a1 += 360;
      api.arc(0, 0, 30, a0, a1, c.text, "φ");
    }
    api.vector(0, 0, A[0], A[1], C.A, "A");
    api.vector(0, 0, B[0], B[1], C.B, "B");
    const mA = Math.sqrt(a2), mB = mag(...B);
    const phi = mA && mB ? deg(Math.acos(Math.max(-1, Math.min(1, d / (mA * mB))))) : 0;
    const meaning = Math.abs(d) < 0.05 ? "≈ 0: perpendicular (φ = 90°)" : d > 0 ? "positive: mostly the same way (φ < 90°)" : "negative: mostly opposite (φ > 90°)";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th>A</th><td style="color:${C.A}">${ij(...A)}</td></tr>
        <tr><th>B</th><td style="color:${C.B}">${ij(...B)}</td></tr>
        <tr><th>AₓBₓ + AᵧBᵧ</th><td>(${fmt(A[0])})(${fmt(B[0])}) + (${fmt(A[1])})(${fmt(B[1])}) = <strong>${fmt(d)}</strong></td></tr>
        <tr><th>AB cos φ</th><td>(${fmt(mA)})(${fmt(mB)}) cos ${fmt(phi, 1)}° = ${fmt(mA * mB * Math.cos((phi * Math.PI) / 180))}</td></tr>
        <tr><th>Angle φ</th><td>${fmt(phi, 1)}°</td></tr>
      </table>
      <div class="verdict" style="color:${color}">A·B is ${meaning}</div>`;
  }
  p.draw();
  return p.destroy;
}
