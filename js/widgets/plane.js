// A 2D coordinate plane on a canvas: grid, axes, vectors, and draggable handles.
// Used by the vector widgets. World units are "m" unless a widget says otherwise.
import { setupCanvas, themeColors, drawArrow } from "../sims/canvas.js";

export const vecColors = {
  A: "#2f80ed",
  B: "#eb5757",
  R: "#27ae60",
  x: "#9b51e0",
  y: "#f2994a",
};

// unit: spacing of grid lines in world units (1 by default). axes: labels for the two axes.
// api.view can be changed at any time to pan or zoom (e.g. to fit a trajectory).
export function plane(canvas, { range = 10, snap = 0.1, center = [0, 0], unit = 1, axes = ["x", "y"], onDraw, onBeforeDraw }) {
  const view = { cx: center[0], cy: center[1], range, unit };
  const handles = [];
  let dragging = null;
  const { ctx, size, destroy } = setupCanvas(canvas, () => api.draw());

  const scale = () => Math.min(size.w, size.h) / (2 * view.range);
  const S = (x, y) => [size.w / 2 + (x - view.cx) * scale(), size.h / 2 - (y - view.cy) * scale()];
  const W = (px, py) => [view.cx + (px - size.w / 2) / scale(), view.cy - (py - size.h / 2) / scale()];
  const round = (v) => Math.round(v / snap) * snap;

  function grid() {
    const c = themeColors();
    const s = scale();
    const { cx, cy, unit: u } = view;
    const xr = size.w / 2 / s, yr = size.h / 2 / s;
    ctx.lineWidth = 1;
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillStyle = c.muted;
    const lines = view.range / u; // grid lines from the center to the shorter edge
    const step = lines > 12 ? 5 : lines > 6 ? 2 : 1; // label every `step` lines
    const [ox, oy] = S(0, 0);
    const axisY = Math.max(4, Math.min(size.h - 16, oy)); // keep tick labels on screen
    const axisX = Math.max(22, Math.min(size.w - 4, ox));
    const lbl = (k) => String(+(k * u).toFixed(6)).replace("-", "−");
    for (let k = Math.ceil((cx - xr) / u); k * u <= cx + xr; k++) {
      const [px] = S(k * u, 0);
      ctx.strokeStyle = k === 0 ? c.muted : c.border;
      ctx.globalAlpha = k === 0 ? 1 : k % step === 0 ? 0.9 : 0.4;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, size.h); ctx.stroke();
      if (k && k % step === 0) { ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.fillText(lbl(k), px, axisY + 13); }
    }
    for (let k = Math.ceil((cy - yr) / u); k * u <= cy + yr; k++) {
      const [, py] = S(0, k * u);
      ctx.strokeStyle = k === 0 ? c.muted : c.border;
      ctx.globalAlpha = k === 0 ? 1 : k % step === 0 ? 0.9 : 0.4;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(size.w, py); ctx.stroke();
      if (k && k % step === 0) { ctx.globalAlpha = 1; ctx.textAlign = "right"; ctx.fillText(lbl(k), axisX - 5, py + 3); }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "right";
    ctx.fillText(axes[0], size.w - 6, axisY - 6);
    ctx.textAlign = "left";
    ctx.fillText(axes[1], axisX + 6, 12);
  }

  // Draws an arrow between two world points.
  function vector(x0, y0, x1, y1, color, label, { dashed = false, width = 3 } = {}) {
    const [a, b] = S(x0, y0), [c, d] = S(x1, y1);
    ctx.save();
    if (dashed) ctx.setLineDash([6, 5]);
    ctx.lineWidth = width;
    drawArrow(ctx, a, b, c - a, d - b, color, label);
    ctx.restore();
  }

  function segment(x0, y0, x1, y1, color, { dashed = true, width = 2 } = {}) {
    const [a, b] = S(x0, y0), [c, d] = S(x1, y1);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width;
    if (dashed) ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke();
    ctx.restore();
  }

  function label(x, y, text, color, dx = 0, dy = 0) {
    const [px, py] = S(x, y);
    ctx.save();
    ctx.fillStyle = color || themeColors().text;
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, px + dx, py + dy);
    ctx.restore();
  }

  // Arc around a world point, from world angle a0 to a1 (degrees, counterclockwise).
  function arc(x, y, rPx, a0, a1, color, text) {
    const [px, py] = S(x, y);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, rPx, -rad(a0), -rad(a1), a1 > a0); ctx.stroke();
    if (text) {
      const mid = rad((a0 + a1) / 2);
      ctx.fillStyle = color; ctx.font = "600 12px Inter, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, px + Math.cos(mid) * (rPx + 14), py - Math.sin(mid) * (rPx + 14));
    }
    ctx.restore();
  }

  function dot(x, y, color, r = 4) {
    const [px, py] = S(x, y);
    ctx.save(); ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawHandles() {
    handles.forEach((h) => {
      const [x, y] = h.get();
      const [px, py] = S(x, y);
      ctx.save();
      ctx.fillStyle = themeColors().surface;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(px, py, h === dragging ? 9 : 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
  }

  // ---- pointer handling ----
  const local = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const nearest = (px, py) => {
    let best = null, bestD = 22;
    handles.forEach((h) => {
      const [hx, hy] = S(...h.get());
      const d = Math.hypot(hx - px, hy - py);
      if (d < bestD) { best = h; bestD = d; }
    });
    return best;
  };
  const clampW = ([x, y]) => {
    const s = scale();
    const m = 8 / s; // keep handles 8px inside the edge
    const xr = size.w / 2 / s - m, yr = size.h / 2 / s - m;
    const { cx, cy } = view;
    return [round(Math.max(cx - xr, Math.min(cx + xr, x))), round(Math.max(cy - yr, Math.min(cy + yr, y)))];
  };
  const down = (e) => {
    const [px, py] = local(e);
    dragging = nearest(px, py);
    if (dragging) { canvas.setPointerCapture(e.pointerId); e.preventDefault(); api.draw(); }
    else api.onClick?.(clampW(W(px, py)));
  };
  const move = (e) => {
    const [px, py] = local(e);
    if (dragging) { dragging.set(...clampW(W(px, py))); api.draw(); }
    else canvas.style.cursor = nearest(px, py) ? "grab" : api.onClick ? "crosshair" : "default";
  };
  const up = () => { if (dragging) { dragging = null; api.draw(); } };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.style.touchAction = "none";

  const api = {
    ctx, size, S, W, vector, segment, label, arc, dot, view, scale, colors: themeColors,
    addHandle: (h) => handles.push(h),
    onClick: null,
    draw() {
      if (!size.w) return;
      onBeforeDraw?.(api); // e.g. refit the view to the current canvas size
      ctx.clearRect(0, 0, size.w, size.h);
      grid();
      onDraw(api);
      drawHandles();
    },
    destroy,
  };
  return api;
}

// ---- small math helpers shared by widgets ----
export const deg = (r) => (r * 180) / Math.PI;
export const rad = (d) => (d * Math.PI) / 180;
export const mag = (x, y) => Math.hypot(x, y);
export const angle360 = (x, y) => ((deg(Math.atan2(y, x)) % 360) + 360) % 360;
export const fromPolar = (m, thetaDeg) => [m * Math.cos(rad(thetaDeg)), m * Math.sin(rad(thetaDeg))];
export const fmt = (v, d = 2) => {
  const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);
  return s.replace("-", "−");
};
