// Shared helpers for canvas-based simulations.

// Keeps the canvas sharp on high-DPI screens and resized with its container.
export function setupCanvas(canvas, onResize) {
  const ctx = canvas.getContext("2d");
  const size = { w: 0, h: 0 };
  let ready = false; // callers draw after setup returns, not during it
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    size.w = rect.width;
    size.h = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (ready) onResize?.();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  ready = true;
  return { ctx, size, destroy: () => ro.disconnect() };
}

// Reads theme colors from CSS custom properties so sims follow light/dark mode.
export function themeColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  return {
    text: v("--text"),
    muted: v("--muted"),
    border: v("--border"),
    primary: v("--primary"),
    surface: v("--surface"),
    bg: v("--surface-2"),
    accent: v("--accent"),
  };
}

export const forceColors = {
  gravity: "#27ae60",
  normal: "#2f80ed",
  friction: "#eb5757",
  velocity: "#2f80ed",
  vx: "#9b51e0",
  vy: "#f2994a",
};

export function drawArrow(ctx, x, y, dx, dy, color, label) {
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ux = dx / len, uy = dy / len;
  const head = Math.min(10, len * 0.4);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx - ux * head * 0.8, y + dy - uy * head * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + dx - ux * head - uy * head * 0.55, y + dy - uy * head + ux * head * 0.55);
  ctx.lineTo(x + dx - ux * head + uy * head * 0.55, y + dy - uy * head - ux * head * 0.55);
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = "600 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + dx + ux * 16, y + dy + uy * 16);
  }
  ctx.restore();
}

// Picks a tidy grid spacing (1, 2, 5, 10, 20, 50 ...) for a given range.
export function niceStep(range, targetLines = 6) {
  const raw = range / targetLines;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
}

// Builds a labeled range slider. Returns the wrapper element.
export function slider({ label, min, max, step, value, unit = "", onInput }) {
  const wrap = document.createElement("div");
  wrap.className = "control";
  const id = "s-" + Math.random().toString(36).slice(2, 8);
  wrap.innerHTML = `
    <label for="${id}">${label} <span></span></label>
    <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
  const input = wrap.querySelector("input");
  const out = wrap.querySelector("label span");
  const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  const showValue = () => { out.textContent = `${Number(input.value).toFixed(decimals)} ${unit}`.trim(); };
  const update = () => { showValue(); onInput(Number(input.value)); };
  input.addEventListener("input", update);
  showValue();
  wrap.set = (v) => { input.value = v; update(); };
  return wrap;
}

export function readout(rows) {
  const el = document.createElement("div");
  el.className = "readout";
  el.update = (values) => {
    el.innerHTML = rows.map(([key, label]) => `<div><span>${label}</span><span>${values[key]}</span></div>`).join("");
  };
  return el;
}
