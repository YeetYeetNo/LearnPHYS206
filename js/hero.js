// Looping projectile animation for the home page hero.
// Visitors can drag on the picture to aim their own launch.
import { setupCanvas, themeColors } from "./sims/canvas.js";

export function heroDemo(canvas) {
  const { ctx, size, destroy } = setupCanvas(canvas);
  const angles = [30, 45, 60, 75];
  const g = 9.8, v0 = 20;
  const shot = (deg) => {
    const th = (deg * Math.PI) / 180;
    const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    return { deg, vx, vy, tf: (2 * vy) / g, range: (vx * 2 * vy) / g };
  };
  // start with the earlier angles already drawn, so the first frame is never empty
  let i = 1, cur = shot(angles[i]), t = 0, last = performance.now(), raf = 0, aiming = false;
  const trails = [shot(angles[0]), shot(75)];

  const geom = () => {
    const { w, h } = size;
    const s = (w - 48) / 44; // fits a 44 m range
    return { w, h, s, X: (x) => 24 + x * s, Y: (y) => h - 32 - y * s };
  };

  function path(sh, upTo) {
    const { X, Y } = geom();
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const tt = (upTo * j) / 60;
      const x = sh.vx * tt, y = sh.vy * tt - 0.5 * g * tt * tt;
      j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
    }
    ctx.stroke();
  }

  function frame(now) {
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    t += dt * 1.4;
    const { w, h, X, Y } = geom();
    const c = themeColors();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();

    // earlier arcs, faded
    trails.forEach((tr, k) => {
      ctx.globalAlpha = 0.35 + 0.2 * k;
      ctx.strokeStyle = c.muted; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
      path(tr, tr.tf);
    });
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    // their landing angles; angles that land together (like 30° and 60°) share one label
    const spots = new Map();
    trails.forEach((tr) => {
      const key = Math.round(tr.range);
      if (!spots.has(key)) spots.set(key, { x: tr.range, degs: [] });
      if (!spots.get(key).degs.includes(tr.deg)) spots.get(key).degs.push(tr.deg);
    });
    const landed = t >= cur.tf ? Math.round(cur.range) : null;
    ctx.fillStyle = c.muted; ctx.font = "13px Inter, sans-serif"; ctx.textAlign = "center";
    spots.forEach((sp, key) => {
      // skip a label that would collide with the landed shot's label
      if (key !== landed && !(landed !== null && Math.abs(X(sp.x) - X(cur.range)) < 90)) ctx.fillText(sp.degs.sort((a, b) => a - b).map((d) => `${d}°`).join(" & "), X(sp.x), Y(0) + 20);
    });
    ctx.textAlign = "left";

    const tt = Math.min(t, cur.tf);
    ctx.strokeStyle = c.primary; ctx.lineWidth = 3;
    path(cur, tt);
    const bx = X(cur.vx * tt), by = Y(cur.vy * tt - 0.5 * g * tt * tt);
    ctx.fillStyle = c.accent; ctx.strokeStyle = c.text; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (t >= cur.tf) {
      ctx.fillStyle = c.text; ctx.font = "600 13px Inter, sans-serif"; ctx.textAlign = "center";
      const same = [...new Set([...(spots.get(landed)?.degs ?? []), cur.deg])].sort((a, b) => a - b);
      ctx.fillText(`${same.map((d) => `${d}°`).join(" & ")}: ${cur.range.toFixed(1)} m`, X(cur.range), Y(0) + 20);
      ctx.textAlign = "left";
    }

    const narrow = w < 460; // phones: shorter lines so nothing runs off the edge
    ctx.fillStyle = c.text; ctx.font = `600 ${narrow ? 15 : 17}px Inter, sans-serif`;
    ctx.fillText(`θ = ${cur.deg}°    v₀ = ${v0} m/s`, 20, 34);
    ctx.fillStyle = c.muted; ctx.font = `${narrow ? 13 : 14}px Inter, sans-serif`;
    ctx.fillText(narrow ? "Which angle goes farthest?" : "Same speed, different angles. Which goes farthest?", 20, narrow ? 54 : 58);
    ctx.fillText(narrow ? "Drag to aim your own." : "Drag on the picture to aim your own.", 20, narrow ? 72 : 78);

    if (t > cur.tf + 0.9 && !aiming) {
      trails.push(cur);
      if (trails.length > 3) trails.shift();
      i = (i + 1) % angles.length;
      cur = shot(angles[i]);
      t = 0;
    }
    raf = requestAnimationFrame(frame);
  }

  // drag to aim: the angle points from the launch spot to the pointer
  const aim = (e) => {
    const r = canvas.getBoundingClientRect();
    const { X, Y } = geom();
    const dx = e.clientX - r.left - X(0), dy = Y(0) - (e.clientY - r.top);
    const deg = Math.round(Math.min(85, Math.max(5, (Math.atan2(dy, Math.max(dx, 1)) * 180) / Math.PI)));
    cur = shot(deg); t = 0;
  };
  const down = (e) => { aiming = true; canvas.setPointerCapture(e.pointerId); aim(e); };
  const move = (e) => { if (aiming) aim(e); };
  const up = () => { aiming = false; };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); destroy();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
  };
}
