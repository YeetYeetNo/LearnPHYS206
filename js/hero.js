// Looping projectile animation for the home page hero.
import { setupCanvas, themeColors } from "./sims/canvas.js";

export function heroDemo(canvas) {
  const { ctx, size, destroy } = setupCanvas(canvas);
  const angles = [30, 45, 60, 75];
  const g = 9.8, v0 = 20;
  let i = 0, t = 0, last = performance.now(), raf = 0;
  const trails = [];

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt * 1.4;
    const { w, h } = size;
    const c = themeColors();
    const s = (w - 40) / 45;               // fits a 45 m range
    const X = (x) => 20 + x * s, Y = (y) => h - 24 - y * s;

    const th = (angles[i] * Math.PI) / 180;
    const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    const tf = (2 * vy) / g;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = c.text; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();

    // earlier arcs fade out
    trails.forEach((tr, k) => {
      ctx.globalAlpha = 0.25 + 0.15 * k;
      ctx.strokeStyle = c.muted; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const tt = (tr.tf * j) / 60;
        const x = tr.vx * tt, y = tr.vy * tt - 0.5 * g * tt * tt;
        j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.setLineDash([]);

    const tt = Math.min(t, tf);
    ctx.strokeStyle = c.primary; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const ts = (tt * j) / 60;
      const x = vx * ts, y = vy * ts - 0.5 * g * ts * ts;
      j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
    }
    ctx.stroke();
    ctx.fillStyle = "#d4e157"; ctx.strokeStyle = "#556b00";
    ctx.beginPath(); ctx.arc(X(vx * tt), Y(vy * tt - 0.5 * g * tt * tt), 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = c.text; ctx.font = "600 14px Inter, sans-serif";
    ctx.fillText(`θ = ${angles[i]}°   v₀ = ${v0} m/s`, 16, 26);
    ctx.fillStyle = c.muted; ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Same speed, different angles. Which goes farthest?", 16, 46);

    if (t > tf + 0.6) {
      trails.push({ vx, vy, tf });
      if (trails.length > 3) trails.shift();
      i = (i + 1) % angles.length;
      t = 0;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); destroy(); };
}
