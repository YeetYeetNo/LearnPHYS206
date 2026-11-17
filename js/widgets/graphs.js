// Small graphing helpers for motion widgets: a time-axis panel drawn inside a
// rectangle of a canvas, with grid, curve, shaded area, tangent, and cursor.
import { niceStep } from "../sims/canvas.js";

const tick = (v) => String(+v.toFixed(2)).replace("-", "−");

// Range that includes zero, padded so curves don't touch the edges.
export function rangeOf(values, { includeZero = true, pad = 0.12, min = 1 } = {}) {
  let lo = Math.min(...values), hi = Math.max(...values);
  if (includeZero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  if (hi - lo < min) { const m = (hi + lo) / 2; lo = m - min / 2; hi = m + min / 2; }
  const p = (hi - lo) * pad;
  return [lo - (lo < 0 || !includeZero ? p : 0), hi + p];
}

export function panel(ctx, colors, rect, { t1, y0, y1, label, t0 = 0 }) {
  const { x, y, w, h } = rect;
  const X = (t) => x + ((t - t0) / (t1 - t0)) * w;
  const Y = (v) => y + h - ((v - y0) / (y1 - y0)) * h;
  const seg = (a, b, c, d) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); };

  function frame({ xLabel = true } = {}) {
    ctx.save();
    ctx.fillStyle = colors.surface;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = colors.border; ctx.lineWidth = 1;
    ctx.font = "10px JetBrains Mono, monospace"; ctx.fillStyle = colors.muted;
    const ts = niceStep(t1 - t0, 6);
    ctx.textAlign = "center";
    for (let t = Math.ceil(t0 / ts) * ts; t <= t1 + 1e-9; t += ts) {
      seg(X(t), y, X(t), y + h);
      if (xLabel) ctx.fillText(tick(t), X(t), y + h + 12);
    }
    const ys = niceStep(y1 - y0, 4);
    ctx.textAlign = "right";
    for (let v = Math.ceil(y0 / ys) * ys; v <= y1 + 1e-9; v += ys) {
      seg(x, Y(v), x + w, Y(v));
      ctx.fillText(tick(v), x - 4, Y(v) + 3);
    }
    if (y0 < 0 && y1 > 0) { ctx.strokeStyle = colors.muted; ctx.lineWidth = 1.5; seg(x, Y(0), x + w, Y(0)); }
    ctx.strokeStyle = colors.border; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = colors.text; ctx.font = "600 12px Inter, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(label, x + 6, y + 15);
    ctx.restore();
  }

  function curve(ts, vs, color, width = 2.5, upTo = Infinity) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    ctx.beginPath();
    let started = false;
    ts.forEach((t, i) => {
      if (t > upTo) return;
      started ? ctx.lineTo(X(t), Y(vs[i])) : ctx.moveTo(X(t), Y(vs[i]));
      started = true;
    });
    ctx.stroke();
    ctx.restore();
  }

  // Shades the area between the curve and v = 0 from t0 up to tEnd, green above and red below.
  function area(ts, vs, tEnd, pos = "rgba(39,174,96,.28)", neg = "rgba(235,87,87,.28)") {
    ctx.save();
    for (let i = 1; i < ts.length && ts[i - 1] < tEnd; i++) {
      const ta = ts[i - 1], tb = Math.min(ts[i], tEnd);
      const va = vs[i - 1], vb = vs[i - 1] + ((vs[i] - vs[i - 1]) * (tb - ta)) / (ts[i] - ta);
      ctx.fillStyle = va + vb >= 0 ? pos : neg;
      ctx.beginPath();
      ctx.moveTo(X(ta), Y(0)); ctx.lineTo(X(ta), Y(va)); ctx.lineTo(X(tb), Y(vb)); ctx.lineTo(X(tb), Y(0));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function tangent(t, value, slope, color, half = (t1 - t0) * 0.16) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.rect(x, y, w, h); ctx.clip();
    seg(X(t - half), Y(value - slope * half), X(t + half), Y(value + slope * half));
    ctx.restore();
  }

  function cursor(t) {
    ctx.save();
    ctx.strokeStyle = colors.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    seg(X(t), y, X(t), y + h);
    ctx.restore();
  }

  function dot(t, v, color, r = 5) {
    ctx.save();
    ctx.fillStyle = color; ctx.strokeStyle = colors.surface; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(t), Y(v), r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  return { X, Y, frame, curve, area, tangent, cursor, dot, seg };
}

// Integrates a(t) numerically (trapezoid rule) to get v(t) and x(t).
export function integrate(aFn, v0, x0, tMax, n = 600) {
  const ts = [], as = [], vs = [], xs = [];
  const dt = tMax / n;
  let v = v0, x = x0;
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    if (i > 0) {
      const aPrev = as[i - 1], aNow = aFn(t);
      const vNew = v + 0.5 * (aPrev + aNow) * dt;
      x += 0.5 * (v + vNew) * dt;
      v = vNew;
    }
    ts.push(t); as.push(aFn(t)); vs.push(v); xs.push(x);
  }
  return { ts, as, vs, xs, at: (t) => Math.max(0, Math.min(n, Math.round(t / dt))) };
}
