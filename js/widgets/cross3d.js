// 3D cross product model: drag to rotate, edit A and B, see A × B and the
// parallelogram whose area is |A × B|. Plain canvas, no 3D library needed.
import { setupCanvas, themeColors, drawArrow } from "../sims/canvas.js";
import { vecColors as C, fmt, deg } from "./plane.js";
import { shell, button, row, checkbox } from "./shell.js";

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.sqrt(dot(a, a));
const vstr = (v) => `${fmt(v[0])} î ${v[1] < 0 ? "−" : "+"} ${fmt(Math.abs(v[1]))} ĵ ${v[2] < 0 ? "−" : "+"} ${fmt(Math.abs(v[2]))} k̂`;

export function cross3d(el) {
  const { canvas, controls, readout } = shell(el, { title: "3D cross product model", icon: "🧊", canvas: true, tall: true });
  let A = [2, 3, 0], B = [4, -1, 0], swapped = false, showPara = true, spin = false;
  let yaw = -0.55, elev = 0.42, raf = 0;

  // ---- inputs for the six components ----
  const inputs = {};
  const grid = document.createElement("div");
  grid.className = "vec-inputs";
  grid.innerHTML = `<span></span><span>x</span><span>y</span><span>z</span>`;
  [["A", C.A], ["B", C.B]].forEach(([name, color]) => {
    grid.insertAdjacentHTML("beforeend", `<span style="color:${color};font-weight:700">${name}</span>`);
    inputs[name] = [0, 1, 2].map((i) => {
      const inp = document.createElement("input");
      inp.type = "number"; inp.step = "0.5"; inp.className = "input input-num";
      inp.setAttribute("aria-label", `${name} ${"xyz"[i]} component`);
      inp.addEventListener("input", () => {
        const v = Number(inp.value) || 0;
        (name === "A" ? A : B)[i] = v;
        draw();
      });
      grid.appendChild(inp);
      return inp;
    });
  });
  const sync = () => { inputs.A.forEach((n, i) => (n.value = A[i])); inputs.B.forEach((n, i) => (n.value = B[i])); };
  const set = (a, b) => { A = [...a]; B = [...b]; swapped = false; sync(); draw(); };
  const swapBtn = button("Swap order: B × A", () => { swapped = !swapped; swapBtn.textContent = swapped ? "Swap order: A × B" : "Swap order: B × A"; draw(); });
  controls.append(
    grid,
    row(button("Worked example", () => set([2, 3, 0], [4, -1, 0])), button("î × ĵ", () => set([1, 0, 0], [0, 1, 0])), button("Parallel", () => set([2, 1, 0], [4, 2, 0])), button("3D", () => set([3, -2, 1], [-1, 4, 2]))),
    row(swapBtn, button("Top view (+z)", () => { yaw = 0; elev = Math.PI / 2 - 0.001; draw(); }), button("Reset view", () => { yaw = -0.55; elev = 0.42; draw(); })),
    checkbox("Show parallelogram (area = |A × B|)", showPara, (v) => { showPara = v; draw(); }),
    checkbox("Spin slowly", spin, (v) => { spin = v; if (spin) loop(); }),
  );
  sync();

  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());

  // ---- drag to rotate ----
  let drag = null;
  canvas.style.touchAction = "none";
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY, yaw, elev]; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag[2] + (e.clientX - drag[0]) * 0.01;
    elev = Math.max(-1.5, Math.min(1.5707, drag[3] + (e.clientY - drag[1]) * 0.01));
    draw();
  });
  const end = () => { drag = null; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  function loop() {
    cancelAnimationFrame(raf);
    const step = () => { if (!spin) return; if (!drag) yaw += 0.006; draw(); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }

  function draw() {
    if (!size.w) return;
    const col = themeColors();
    const [P, Q] = swapped ? [B, A] : [A, B];
    const Cv = cross(P, Q);
    const big = Math.max(len(A), len(B), 1);
    const cl = len(Cv);
    const shrink = cl > 1.6 * big ? (1.6 * big) / cl : 1; // keep a huge A × B on screen
    const Cd = Cv.map((v) => v * shrink);
    const L = Math.max(big, len(Cd), 2);
    const s = Math.min(size.w, size.h) / (2 * L * 1.25);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), ce = Math.cos(elev), se = Math.sin(elev);
    // world: x right, y into the screen, z up (right-handed), then rotate the camera
    const pr = ([x, y, z]) => {
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      return [size.w / 2 + x1 * s, size.h / 2 - (z * ce + y1 * se) * s];
    };
    ctx.clearRect(0, 0, size.w, size.h);

    // xy-plane grid
    const n = Math.ceil(L);
    ctx.strokeStyle = col.border; ctx.lineWidth = 1;
    for (let i = -n; i <= n; i++) {
      [[[i, -n, 0], [i, n, 0]], [[-n, i, 0], [n, i, 0]]].forEach(([a, b]) => {
        const [x0, y0] = pr(a), [x1, y1] = pr(b);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      });
    }
    // axes
    [[[1, 0, 0], "x"], [[0, 1, 0], "y"], [[0, 0, 1], "z"]].forEach(([u, name]) => {
      const [x0, y0] = pr(u.map((v) => -v * n)), [x1, y1] = pr(u.map((v) => v * (n + 0.6)));
      ctx.strokeStyle = col.muted; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.fillStyle = col.muted; ctx.font = "600 13px Inter, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(name, x1 + (x1 - size.w / 2) * 0.04, y1 + (y1 - size.h / 2) * 0.04);
    });

    // parallelogram spanned by the two vectors
    if (showPara) {
      const corners = [[0, 0, 0], P, P.map((v, i) => v + Q[i]), Q].map(pr);
      ctx.fillStyle = C.R; ctx.globalAlpha = 0.16;
      ctx.beginPath(); corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = C.R; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    const arrow = (v, color, label) => {
      const [x0, y0] = pr([0, 0, 0]), [x1, y1] = pr(v);
      drawArrow(ctx, x0, y0, x1 - x0, y1 - y0, color, label);
    };
    arrow(A, C.A, "A");
    arrow(B, C.B, "B");
    arrow(Cd, "#9b51e0", swapped ? "B × A" : "A × B");

    const phi = len(A) && len(B) ? deg(Math.acos(Math.max(-1, Math.min(1, dot(A, B) / (len(A) * len(B)))))) : 0;
    const name = swapped ? "B × A" : "A × B";
    const zdir = Math.abs(Cv[0]) < 1e-9 && Math.abs(Cv[1]) < 1e-9 && Math.abs(Cv[2]) > 1e-9
      ? (Cv[2] > 0 ? "It points along +z: out of the page when you look down from +z." : "It points along −z: into the page when you look down from +z.")
      : cl < 1e-9 ? "The vectors are parallel, so the cross product is the zero vector." : "It is perpendicular to both vectors. Rotate the view to check.";
    readout.innerHTML = `
      <table class="mini-table">
        <tr><th style="color:#9b51e0">${name}</th><td><strong>${vstr(Cv)}</strong></td></tr>
        <tr><th>|${name}|</th><td>${fmt(cl)}</td></tr>
        <tr><th>AB sin φ</th><td>(${fmt(len(A))})(${fmt(len(B))}) sin ${fmt(phi, 1)}° = ${fmt(len(A) * len(B) * Math.sin((phi * Math.PI) / 180))}</td></tr>
        <tr><th>Check: A·(${name}), B·(${name})</th><td>${fmt(dot(A, Cv))}, ${fmt(dot(B, Cv))} (both 0, so it's perpendicular)</td></tr>
      </table>
      <p class="small" style="margin-top:8px">${zdir}${shrink < 1 ? ` <span class="muted">The purple arrow is drawn shorter than its true length so it fits.</span>` : ""}</p>
      <p class="small muted">Right-hand rule: fingers along ${swapped ? "B" : "A"}, curl toward ${swapped ? "A" : "B"}, thumb gives the direction.</p>`;
  }
  draw();
  return () => { spin = false; cancelAnimationFrame(raf); destroy(); };
}
