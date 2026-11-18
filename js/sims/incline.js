// Inclined plane with static and kinetic friction.
import { setupCanvas, themeColors, forceColors, drawArrow, slider, readout } from "./canvas.js";

const RAMP_LENGTH_M = 5; // physical length of the ramp surface

export function mount(container) {
  container.innerHTML = `
    <div class="sim">
      <div class="sim-canvas-wrap"><canvas aria-label="Inclined plane simulation"></canvas></div>
      <div class="sim-controls"></div>
    </div>`;
  const canvas = container.querySelector("canvas");
  const controls = container.querySelector(".sim-controls");

  const p = { angle: 30, m: 4, mus: 0.4, muk: 0.2, g: 9.8, showComponents: false };
  let s = 0;      // distance travelled down the ramp (m)
  let v = 0;      // speed down the ramp (m/s)
  let running = false;
  let raf = 0, last = 0;

  // Forces and whether the box slides, given it starts at rest.
  const physics = () => {
    const th = (p.angle * Math.PI) / 180;
    const W = p.m * p.g;
    const N = W * Math.cos(th);
    const Wpar = W * Math.sin(th);
    const fsMax = p.mus * N;
    const slides = Wpar > fsMax + 1e-9;
    const f = slides ? p.muk * N : Wpar;
    const a = slides ? (Wpar - f) / p.m : 0;
    return { th, W, N, Wpar, Wperp: N, fsMax, slides, f, a };
  };

  const reset = () => { s = 0; v = 0; running = false; draw(); };
  const add = (el) => controls.appendChild(el);
  add(slider({ label: "Ramp angle θ", min: 0, max: 60, step: 1, value: p.angle, unit: "°", onInput: (x) => { p.angle = x; reset(); } }));
  add(slider({ label: "Mass m", min: 0.5, max: 20, step: 0.5, value: p.m, unit: "kg", onInput: (x) => { p.m = x; reset(); } }));
  const muk = slider({ label: "Kinetic friction μₖ", min: 0, max: 1, step: 0.01, value: p.muk, onInput: (x) => {
    p.muk = x;
    if (p.muk > p.mus) mus.set(p.muk); // μk can't exceed μs
    reset();
  } });
  const mus = slider({ label: "Static friction μₛ", min: 0, max: 1, step: 0.01, value: p.mus, onInput: (x) => {
    p.mus = x;
    if (p.muk > p.mus) muk.set(p.mus);
    reset();
  } });
  add(mus);
  add(muk);

  const l = document.createElement("label");
  l.className = "control-check";
  l.innerHTML = `<input type="checkbox"/> Show components of mg`;
  l.querySelector("input").addEventListener("change", (e) => { p.showComponents = e.target.checked; draw(); });
  add(l);

  const btns = document.createElement("div");
  btns.className = "btn-row";
  btns.innerHTML = `<button class="btn btn-primary">▶ Release</button><button class="btn btn-ghost">Reset</button>`;
  const [goBtn, resetBtn] = btns.querySelectorAll("button");
  goBtn.addEventListener("click", () => {
    s = 0; v = 0; running = true; last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  });
  resetBtn.addEventListener("click", reset);
  add(btns);

  const ro = readout([["state", "State"], ["N", "Normal force N"], ["f", "Friction f"], ["a", "Acceleration a"], ["tan", "tan θ vs μₛ"]]);
  add(ro);

  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());

  function draw() {
    const c = themeColors();
    const { w, h } = size;
    const ph = physics();
    const cos = Math.cos(ph.th), sin = Math.sin(ph.th);
    const margin = 40;

    // Ramp: high on the left, bottom-right corner fixed.
    const L = Math.min((w - 2 * margin) / Math.max(cos, 0.01), (h - 2 * margin - 60) / Math.max(sin, 0.01), w - 2 * margin);
    const bx = w - margin, by = h - margin;
    const tx = bx - L * cos, ty = by - L * sin;
    const pxPerM = L / RAMP_LENGTH_M;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.border;
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.lineTo(tx, by); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // angle arc at the bottom-right corner
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bx, by, 40, Math.PI, Math.PI + ph.th); ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = "600 13px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${p.angle}°`, bx - 46, by - 6);

    // box
    const box = Math.max(28, Math.min(54, 26 + p.m * 1.4));
    const maxS = RAMP_LENGTH_M - box / pxPerM;
    const along = Math.min(s, maxS) * pxPerM + box / 2 + 4;
    const ux = cos, uy = sin;          // down the ramp
    const nx = sin, ny = -cos;         // outward normal
    const cx = tx + ux * along + nx * (box / 2);
    const cy = ty + uy * along + ny * (box / 2);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ph.th);
    ctx.fillStyle = "#f2c94c"; ctx.strokeStyle = "#8a6d1c"; ctx.lineWidth = 2;
    ctx.fillRect(-box / 2, -box / 2, box, box);
    ctx.strokeRect(-box / 2, -box / 2, box, box);
    ctx.fillStyle = "#5a4500"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText(`${p.m} kg`, 0, 0);
    ctx.restore();

    // force arrows, scaled so mg is ~90px
    const k = 90 / ph.W;
    drawArrow(ctx, cx, cy, 0, ph.W * k, forceColors.gravity, "mg");
    drawArrow(ctx, cx, cy, nx * ph.N * k, ny * ph.N * k, forceColors.normal, "N");
    if (ph.f > 1e-6) {
      // friction acts at the contact surface, pointing up the ramp
      const fx = cx - nx * (box / 2), fy = cy - ny * (box / 2);
      drawArrow(ctx, fx, fy, -ux * ph.f * k, -uy * ph.f * k, forceColors.friction, ph.slides ? "fₖ" : "fₛ");
    }
    if (p.showComponents) {
      ctx.setLineDash([5, 4]);
      drawArrow(ctx, cx, cy, ux * ph.Wpar * k, uy * ph.Wpar * k, forceColors.gravity, "mg sinθ");
      drawArrow(ctx, cx, cy, -nx * ph.Wperp * k, -ny * ph.Wperp * k, forceColors.gravity, "mg cosθ");
      ctx.setLineDash([]);
    }

    ro.update({
      state: ph.slides ? (running || s > 0 ? "Sliding" : "Will slide") : "At rest (static)",
      N: `${ph.N.toFixed(1)} N`,
      f: `${ph.f.toFixed(1)} N ${ph.slides ? "(kinetic)" : "(static)"}`,
      a: `${ph.a.toFixed(2)} m/s²`,
      tan: `${Math.tan(ph.th).toFixed(2)} vs ${p.mus.toFixed(2)}`,
    });
  }

  function tick(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    const ph = physics();
    v += ph.a * dt;
    s += v * dt;
    draw();
    if (running && ph.slides && s < RAMP_LENGTH_M) raf = requestAnimationFrame(tick);
    else running = false;
  }

  draw();
  return () => { cancelAnimationFrame(raf); destroy(); };
}
