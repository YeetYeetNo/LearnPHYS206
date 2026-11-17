// Projectile motion simulation (no air resistance).
import { setupCanvas, themeColors, forceColors, drawArrow, niceStep, slider, readout } from "./canvas.js";

export function mount(container) {
  container.innerHTML = `
    <div class="sim">
      <div class="sim-canvas-wrap"><canvas aria-label="Projectile motion simulation"></canvas></div>
      <div class="sim-controls"></div>
    </div>`;
  const canvas = container.querySelector("canvas");
  const controls = container.querySelector(".sim-controls");

  const p = { v0: 20, angle: 45, h: 0, g: 9.8, showVectors: true, lockScale: false };
  let t = 0;            // animation time (s)
  let running = false;
  let raf = 0;
  let last = 0;
  let lockedView = null;

  const derived = () => {
    const th = (p.angle * Math.PI) / 180;
    const vx = p.v0 * Math.cos(th);
    const vy0 = p.v0 * Math.sin(th);
    const tf = (vy0 + Math.sqrt(vy0 * vy0 + 2 * p.g * p.h)) / p.g;
    return { vx, vy0, tf, range: vx * tf, hmax: p.h + (vy0 * vy0) / (2 * p.g) };
  };

  const onChange = () => { t = 0; running = false; draw(); };
  const add = (el) => controls.appendChild(el);
  add(slider({ label: "Launch speed v₀", min: 1, max: 40, step: 0.5, value: p.v0, unit: "m/s", onInput: (v) => { p.v0 = v; onChange(); } }));
  add(slider({ label: "Angle θ", min: 0, max: 90, step: 1, value: p.angle, unit: "°", onInput: (v) => { p.angle = v; onChange(); } }));
  add(slider({ label: "Launch height", min: 0, max: 30, step: 0.1, value: p.h, unit: "m", onInput: (v) => { p.h = v; onChange(); } }));
  const gSlider = slider({ label: "Gravity g", min: 1, max: 25, step: 0.1, value: p.g, unit: "m/s²", onInput: (v) => { p.g = v; onChange(); } });
  add(gSlider);

  const presets = document.createElement("div");
  presets.className = "filters";
  presets.style.margin = "0";
  [["Moon", 1.6], ["Earth", 9.8], ["Jupiter", 24.8]].forEach(([name, g]) => {
    const b = document.createElement("button");
    b.textContent = name;
    b.addEventListener("click", () => gSlider.set(g));
    presets.appendChild(b);
  });
  add(presets);

  const check = (label, key) => {
    const l = document.createElement("label");
    l.className = "control-check";
    l.innerHTML = `<input type="checkbox" ${p[key] ? "checked" : ""}/> ${label}`;
    l.querySelector("input").addEventListener("change", (e) => {
      p[key] = e.target.checked;
      if (key === "lockScale") lockedView = p.lockScale ? view() : null;
      draw();
    });
    return l;
  };
  add(check("Show velocity vectors", "showVectors"));
  add(check("Lock axis scale (compare runs)", "lockScale"));

  const btns = document.createElement("div");
  btns.className = "btn-row";
  btns.innerHTML = `<button class="btn btn-primary">▶ Launch</button><button class="btn btn-ghost">Reset</button>`;
  const [launchBtn, resetBtn] = btns.querySelectorAll("button");
  launchBtn.addEventListener("click", () => {
    t = 0; running = true; last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  });
  resetBtn.addEventListener("click", () => { t = 0; running = false; draw(); });
  add(btns);

  const ro = readout([["tf", "Flight time"], ["range", "Range"], ["hmax", "Max height"], ["now", "Now (x, y)"]]);
  add(ro);

  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());

  // World-to-screen mapping. Auto-fits the full trajectory unless locked.
  function view() {
    if (lockedView) return lockedView;
    const d = derived();
    const xmax = Math.max(d.range, 10) * 1.1;
    const ymax = Math.max(d.hmax, 5) * 1.2;
    return { xmax, ymax };
  }

  function draw() {
    const c = themeColors();
    const { w, h } = size;
    const pad = { l: 44, r: 16, t: 16, b: 32 };
    const { xmax, ymax } = view();
    const sx = (w - pad.l - pad.r) / xmax;
    const sy = (h - pad.t - pad.b) / ymax;
    const s = Math.min(sx, sy);
    const X = (x) => pad.l + x * s;
    const Y = (y) => h - pad.b - y * s;
    const d = derived();

    ctx.clearRect(0, 0, w, h);

    // grid + axis labels (meters)
    const step = niceStep(Math.max((w - pad.l) / s, (h - pad.b) / s));
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.fillStyle = c.muted;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    for (let x = 0; X(x) <= w; x += step) {
      ctx.beginPath(); ctx.moveTo(X(x), pad.t); ctx.lineTo(X(x), Y(0)); ctx.stroke();
      ctx.fillText(+x.toFixed(2), X(x), h - pad.b + 16);
    }
    ctx.textAlign = "right";
    for (let y = 0; Y(y) >= 0; y += step) {
      ctx.beginPath(); ctx.moveTo(pad.l, Y(y)); ctx.lineTo(w, Y(y)); ctx.stroke();
      ctx.fillText(+y.toFixed(2), pad.l - 6, Y(y) + 4);
    }
    ctx.textAlign = "left";
    ctx.fillText("m", w - 18, h - pad.b + 16);

    // ground + launch platform
    ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();
    if (p.h > 0) {
      ctx.fillStyle = c.border;
      ctx.fillRect(X(0) - 10, Y(p.h), 10, Y(0) - Y(p.h));
    }

    // predicted path (dashed)
    ctx.strokeStyle = c.primary; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const tt = (d.tf * i) / 100;
      const x = d.vx * tt, y = p.h + d.vy0 * tt - 0.5 * p.g * tt * tt;
      i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
    }
    ctx.stroke(); ctx.setLineDash([]);

    // max-height marker
    const tPeak = d.vy0 / p.g;
    if (tPeak > 0) {
      ctx.fillStyle = c.muted;
      ctx.beginPath(); ctx.arc(X(d.vx * tPeak), Y(d.hmax), 3, 0, Math.PI * 2); ctx.fill();
    }

    // ball at current time
    const tt = Math.min(t, d.tf);
    const bx = d.vx * tt, by = p.h + d.vy0 * tt - 0.5 * p.g * tt * tt;
    const vy = d.vy0 - p.g * tt;
    if (p.showVectors) {
      const k = 2.2; // px per (m/s)
      drawArrow(ctx, X(bx), Y(by), d.vx * k, 0, forceColors.vx, "vₓ");
      drawArrow(ctx, X(bx), Y(by), 0, -vy * k, forceColors.vy, "vᵧ");
      drawArrow(ctx, X(bx), Y(by), d.vx * k, -vy * k, forceColors.velocity, "v");
    }
    ctx.fillStyle = "#d4e157"; ctx.strokeStyle = "#556b00"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(bx), Y(by), 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ro.update({
      tf: `${d.tf.toFixed(2)} s`,
      range: `${d.range.toFixed(2)} m`,
      hmax: `${d.hmax.toFixed(2)} m`,
      now: `(${bx.toFixed(1)}, ${by.toFixed(1)}) m`,
    });
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    draw();
    if (running && t < derived().tf) raf = requestAnimationFrame(tick);
    else running = false;
  }

  draw();
  return () => { cancelAnimationFrame(raf); destroy(); };
}
