// Widgets for the units, dimensions, sig-fig, and estimation lessons.
import { setupCanvas, themeColors, slider } from "../sims/canvas.js";
import { shell, button, row, select, checkbox } from "./shell.js";

// ---------- number formatting ----------
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sup = (n) => String(n).split("").map((c) => SUP[c] ?? c).join("");
export function sci(v, digits = 4) {
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 0.01 && a < 1e5) return String(Number(v.toPrecision(digits)));
  const e = Math.floor(Math.log10(a));
  const m = Number((v / 10 ** e).toPrecision(digits));
  return `${m} × 10${sup(e)}`;
}

// =====================================================================
// Unit converter: shows each conversion factor, raised to the unit's power.
// =====================================================================
const LEN = { m: 1, km: 1e3, cm: 1e-2, mm: 1e-3, "μm": 1e-6, nm: 1e-9, mi: 1609, ft: 0.3048, in: 0.0254 };
const TIME = { s: 1, ms: 1e-3, min: 60, h: 3600, day: 86400 };
const CATS = {
  length: { label: "Length", dims: [["L", 1]], from: ["km"], to: ["m"], value: 2.5 },
  time: { label: "Time", dims: [["T", 1]], from: ["h"], to: ["s"], value: 1.5 },
  speed: { label: "Speed", dims: [["L", 1], ["T", -1]], from: ["mi", "h"], to: ["m", "s"], value: 65 },
  accel: { label: "Acceleration", dims: [["L", 1], ["T", -2]], from: ["km", "h"], to: ["m", "s"], value: 1000 },
  area: { label: "Area", dims: [["L", 2]], from: ["m"], to: ["cm"], value: 3 },
  volume: { label: "Volume", dims: [["L", 3]], from: ["m"], to: ["cm"], value: 1 },
};
const table = (d) => (d === "L" ? LEN : TIME);
export function unitConverter(el) {
  const { controls, readout } = shell(el, { title: "Unit converter", icon: "🔁" });
  let key = "speed";
  let state = structuredClone(CATS[key]);

  function build() {
    const cat = CATS[key];
    controls.innerHTML = "";
    const catSel = select(Object.entries(CATS).map(([k, c]) => [k, c.label]), key, (v) => { key = v; state = structuredClone(CATS[v]); build(); });
    const val = document.createElement("input");
    val.className = "input"; val.type = "number"; val.value = state.value; val.step = "any";
    val.addEventListener("input", () => { state.value = Number(val.value); render(); });
    const unitSelects = (which) => {
      const wrap = document.createElement("span");
      wrap.className = "unit-picks";
      cat.dims.forEach(([d, e], i) => {
        if (i > 0) wrap.append(document.createTextNode(" per "));
        const s = select(Object.keys(table(d)).map((u) => [u, u + (e > 1 ? sup(e) : e < -1 ? sup(-e) : "")]), state[which][i], (v) => { state[which][i] = v; render(); });
        wrap.appendChild(s);
      });
      return wrap;
    };
    const lbl = (t) => { const s = document.createElement("span"); s.className = "muted small"; s.textContent = t; return s; };
    controls.append(row(lbl("Quantity"), catSel), row(lbl("Value"), val, unitSelects("from")), row(lbl("Convert to"), unitSelects("to")));
    render();
  }

  function render() {
    const cat = CATS[key];
    let result = state.value;
    const steps = [];
    cat.dims.forEach(([d, e], i) => {
      const f = state.from[i], t = state.to[i];
      if (f === t) return;
      const k = table(d)[f] / table(d)[t]; // how many `t` in one `f`
      result *= k ** e;
      const p = Math.abs(e);
      const frac = e > 0 ? `<span class="frac"><span>${sci(k)} ${t}</span><span>1 ${f}</span></span>` : `<span class="frac"><span>1 ${f}</span><span>${sci(k)} ${t}</span></span>`;
      steps.push(`(${frac})${p > 1 ? `<sup>${p}</sup>` : ""}`);
    });
    const fromName = fmtUnit(cat, state.from), toName = fmtUnit(cat, state.to);
    readout.innerHTML = `
      <div class="conv-chain" data-lenis-prevent>${sci(state.value)} ${fromName}${steps.length ? " × " + steps.join(" × ") : ""} = <strong>${sci(result)} ${toName}</strong></div>
      ${cat.dims.some(([, e]) => Math.abs(e) > 1) ? `<p class="muted small">This unit has a power of ${Math.max(...cat.dims.map(([, e]) => Math.abs(e)))}, so the conversion factor gets the same power.</p>` : ""}`;
  }
  build();
}
function fmtUnit(cat, units) {
  const num = [], den = [];
  cat.dims.forEach(([, e], i) => {
    const p = Math.abs(e);
    (e > 0 ? num : den).push(units[i] + (p > 1 ? sup(p) : ""));
  });
  return num.join("·") + (den.length ? "/" + den.join("·") : "");
}

// =====================================================================
// Area scaling: 1 m² split into 1 cm² squares.
// =====================================================================
export function areaScaling(el) {
  const { controls, readout } = shell(el, { title: "Area scaling model", icon: "🟦" });
  const stage = document.createElement("div");
  stage.className = "area-stage";
  el.querySelector(".widget-body").prepend(stage);
  el.querySelector(".widget-body").classList.add("has-canvas");
  let side = 1, power = 2;

  controls.append(
    slider({ label: "Side length", min: 0.5, max: 3, step: 0.5, value: side, unit: "m", onInput: (v) => { side = v; render(); } }),
    row(...[[1, "Length"], [2, "Area"], [3, "Volume"]].map(([p, t]) => {
      const b = button(t, () => { power = p; controls.querySelectorAll(".seg button").forEach((x, i) => x.classList.toggle("active", i === p - 1)); render(); });
      if (p === power) b.classList.add("active");
      return b;
    })),
  );
  controls.lastChild.classList.add("seg");

  function render() {
    // One drawn cell = 10 cm × 10 cm, so each cell holds 100 small 1 cm² squares.
    const cells = Math.round(side * 10);
    const px = 220, cell = px / cells;
    let grid = "";
    for (let i = 1; i < cells; i++) {
      grid += `<line x1="${i * cell}" y1="0" x2="${i * cell}" y2="${px}" /><line x1="0" y1="${i * cell}" x2="${px}" y2="${i * cell}" />`;
    }
    stage.innerHTML = `
      <svg viewBox="-40 -30 300 290" role="img" aria-label="Square ${side} m on each side divided into 10 cm cells">
        <rect x="0" y="0" width="${px}" height="${px}" class="area-fill"/>
        <g class="area-grid">${grid}</g>
        <rect x="0" y="0" width="${px}" height="${px}" class="area-edge"/>
        <text x="${px / 2}" y="-10" text-anchor="middle">${side} m = ${side * 100} cm</text>
        <text x="-12" y="${px / 2}" text-anchor="middle" transform="rotate(-90 -12 ${px / 2})">${side} m = ${side * 100} cm</text>
        <text x="${px / 2}" y="${px + 22}" text-anchor="middle" class="muted-text">each cell = 10 cm × 10 cm = 100 cm²</text>
      </svg>`;
    const cm = side * 100;
    const right = cm ** power, wrong = side ** power * 100;
    const unit = ["", "", "²", "³"][power];
    readout.innerHTML = `
      <div class="readout">
        <div><span>In meters</span><span>${sci(side ** power)} m${unit}</span></div>
        <div><span>Correct (× 100${sup(power === 1 ? "" : power)})</span><span class="good">${sci(right)} cm${unit}</span></div>
        ${power > 1 ? `<div><span>Common mistake (× 100)</span><span class="bad"><s>${sci(wrong)} cm${unit}</s></span></div>` : ""}
      </div>
      <p class="muted small">1 m = 100 cm, so 1 m${unit} = (100 cm)${unit ? sup(power) : ""} = ${sci(100 ** power)} cm${unit}.</p>`;
  }
  render();
}

// =====================================================================
// Dimension checker
// =====================================================================
const EQS = [
  { eq: "x = x₀ + v₀t + ½at²", lhs: ["x", { L: 1 }], terms: [["x₀", { L: 1 }, "[L]"], ["v₀t", { L: 1 }, "[L/T][T]"], ["½at²", { L: 1 }, "[L/T²][T²]"]] },
  { eq: "v = at²", lhs: ["v", { L: 1, T: -1 }], terms: [["at²", { L: 1 }, "[L/T²][T²]"]] },
  { eq: "v = v₀ + at", lhs: ["v", { L: 1, T: -1 }], terms: [["v₀", { L: 1, T: -1 }, "[L/T]"], ["at", { L: 1, T: -1 }, "[L/T²][T]"]] },
  { eq: "v² = v₀² + 2aΔx", lhs: ["v²", { L: 2, T: -2 }], terms: [["v₀²", { L: 2, T: -2 }, "[L/T]²"], ["2aΔx", { L: 2, T: -2 }, "[L/T²][L]"]] },
  { eq: "x = ½at", lhs: ["x", { L: 1 }], terms: [["½at", { L: 1, T: -1 }, "[L/T²][T]"]] },
  { eq: "t = √(2h / g)", lhs: ["t", { T: 1 }], terms: [["√(2h/g)", { T: 1 }, "√([L] / [L/T²]) = √[T²]"]] },
  { eq: "F = mv", lhs: ["F", { M: 1, L: 1, T: -2 }], terms: [["mv", { M: 1, L: 1, T: -1 }, "[M][L/T]"]] },
  { eq: "v = 2π√(gL)", lhs: ["v", { L: 1, T: -1 }], terms: [["2π√(gL)", { L: 1, T: -1 }, "√([L/T²][L])"]], note: "Dimensionally fine, but the 2π is made up. Dimensional analysis can't tell." },
];
const dimStr = (d) => {
  const num = [], den = [];
  ["M", "L", "T"].forEach((k) => {
    const e = d[k] || 0;
    if (e > 0) num.push(k + (e > 1 ? sup(e) : ""));
    if (e < 0) den.push(k + (e < -1 ? sup(-e) : ""));
  });
  return `[${num.join("·") || "1"}${den.length ? "/" + den.join("·") : ""}]`;
};
const same = (a, b) => ["M", "L", "T"].every((k) => (a[k] || 0) === (b[k] || 0));

export function dimensionChecker(el) {
  const { controls, readout } = shell(el, { title: "Dimension checker", icon: "📐" });
  let i = 0;
  const sel = select(EQS.map((e, k) => [String(k), e.eq]), "0", (v) => { i = Number(v); render(); });
  controls.append(row(sel));
  function render() {
    const e = EQS[i];
    const ok = e.terms.every(([, d]) => same(d, e.lhs[1]));
    readout.innerHTML = `
      <div class="dim-eq">
        <span class="dim-term lhs"><b>${e.lhs[0]}</b><small>${dimStr(e.lhs[1])}</small></span>
        <span class="dim-op">=</span>
        ${e.terms.map(([name, d, how], k) => `
          ${k ? '<span class="dim-op">+</span>' : ""}
          <span class="dim-term ${same(d, e.lhs[1]) ? "ok" : "no"}"><b>${name}</b><small>${how} = ${dimStr(d)}</small></span>`).join("")}
      </div>
      <div class="verdict ${ok ? "good" : "bad"}">${ok ? "✓ Dimensionally consistent" : "✗ Dimensions don't match, so this equation must be wrong"}</div>
      ${e.note ? `<p class="muted small">${e.note}</p>` : ""}`;
  }
  render();
}

// =====================================================================
// Significant-figure counter
// =====================================================================
export function analyzeSigFigs(raw) {
  const s = raw.trim().replace(/\s+/g, "");
  const m = s.match(/^([+\-−]?)(\d*\.?\d*)(?:(?:e|E|[x×*]10\^?)([+\-−]?\d+)|[x×]10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?$/);
  if (!m || !/\d/.test(m[2])) return null;
  const mant = m[2];
  const hasDot = mant.includes(".");
  const digits = [...mant];
  const firstNZ = digits.findIndex((c) => /[1-9]/.test(c));
  const marks = digits.map(() => "dot");
  let sig = 0, amb = 0;
  if (firstNZ === -1) {
    // all zeros, e.g. "0.00"
    digits.forEach((c, k) => { if (c !== ".") marks[k] = "lead"; });
    return { digits, marks, sig: 0, amb: 0, sci: !!(m[3] || m[4]) };
  }
  let lastNZ = -1;
  digits.forEach((c, k) => { if (/[1-9]/.test(c)) lastNZ = k; });
  digits.forEach((c, k) => {
    if (c === ".") return;
    if (k < firstNZ) marks[k] = "lead";
    else if (k <= lastNZ) { marks[k] = "sig"; sig++; }
    else if (hasDot) { marks[k] = "sig"; sig++; }
    else { marks[k] = "amb"; amb++; }
  });
  return { digits, marks, sig, amb, sci: !!(m[3] || m[4]), exp: m[3] || m[4] };
}

export function sigfigCounter(el) {
  const { controls, readout } = shell(el, { title: "Significant-figure counter", icon: "🔢" });
  const input = document.createElement("input");
  input.className = "input"; input.value = "0.00420"; input.setAttribute("aria-label", "Number to analyze");
  input.addEventListener("input", render);
  const examples = row(...["347", "2005", "0.0042", "3.50", "1500", "1500.", "1.50e3"].map((x) => button(x, () => { input.value = x; render(); })));
  controls.append(row(input), examples);
  function render() {
    const r = analyzeSigFigs(input.value);
    if (!r) { readout.innerHTML = `<p class="muted">Type a number like 0.0042, 3.50, or 1.50e3.</p>`; return; }
    const shown = r.digits.map((c, k) => `<span class="sf ${r.marks[k]}">${c}</span>`).join("");
    const count = r.amb ? `${r.sig} to ${r.sig + r.amb} <span class="muted">(ambiguous)</span>` : r.sig;
    readout.innerHTML = `
      <div class="sf-display" data-lenis-prevent>${shown}${r.sci ? `<span class="sf dot"> × 10${sup(r.exp.replace("−", "-"))}</span>` : ""}</div>
      <div class="sf-count">Significant figures: <strong>${count}</strong></div>
      <div class="sf-legend"><span class="sf sig">5</span> significant <span class="sf lead">0</span> leading zero (never counts) ${r.amb ? '<span class="sf amb">0</span> trailing zero with no decimal point (unclear)' : ""}</div>
      ${r.amb ? `<p class="muted small">Write it in scientific notation to make it clear, e.g. ${r.digits.filter((c) => c !== ".").join("").replace(/^0+/, "").replace(/(\d)/, "$1.")} × 10ⁿ.</p>` : ""}`;
  }
  render();
}

// =====================================================================
// Sig-fig calculator: applies the × ÷ and + − rounding rules
// =====================================================================
const decimals = (s) => (s.includes(".") ? s.split(".")[1].replace(/e.*$/i, "").length : 0);
export function sigfigCalc(el) {
  const { controls, readout } = shell(el, { title: "Sig-fig calculator", icon: "🧮" });
  const a = document.createElement("input"), b = document.createElement("input");
  [a, b].forEach((x) => { x.className = "input input-num"; x.addEventListener("input", render); });
  a.value = "3.24"; b.value = "1.5";
  let op = "×";
  const opSel = select(["×", "÷", "+", "−"].map((o) => [o, o]), op, (v) => { op = v; render(); });
  controls.append(row(a, opSel, b), row(button("3.24 × 1.5", () => set("3.24", "×", "1.5")), button("12.11 + 0.3", () => set("12.11", "+", "0.3")), button("4.52 × 2.1", () => set("4.52", "×", "2.1"))));
  function set(x, o, y) { a.value = x; b.value = y; op = o; opSel.value = o; render(); }
  function render() {
    const ra = analyzeSigFigs(a.value), rb = analyzeSigFigs(b.value);
    const x = Number(a.value), y = Number(b.value);
    if (!ra || !rb || !isFinite(x) || !isFinite(y)) { readout.innerHTML = `<p class="muted">Enter two numbers.</p>`; return; }
    const raw = { "×": x * y, "÷": x / y, "+": x + y, "−": x - y }[op];
    let rounded, rule;
    if (op === "×" || op === "÷") {
      const n = Math.max(1, Math.min(ra.sig, rb.sig));
      rounded = raw.toPrecision(n);
      if (rounded.includes("e")) rounded = sci(Number(rounded), n);
      rule = `Multiply/divide: keep the fewest significant figures. ${a.value} has ${ra.sig}, ${b.value} has ${rb.sig}, so keep <strong>${n}</strong>.`;
    } else {
      const d = Math.min(decimals(a.value), decimals(b.value));
      rounded = raw.toFixed(d);
      rule = `Add/subtract: keep the fewest decimal places. ${a.value} has ${decimals(a.value)}, ${b.value} has ${decimals(b.value)}, so keep <strong>${d}</strong>.`;
    }
    readout.innerHTML = `
      <div class="readout"><div><span>Calculator says</span><span>${Number(raw.toPrecision(10))}</span></div><div><span>Report</span><span class="good"><strong>${rounded}</strong></span></div></div>
      <p class="small" style="margin-top:8px">${rule}</p>`;
  }
  render();
}

// =====================================================================
// Accuracy vs. precision target
// =====================================================================
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function accuracyTarget(el) {
  const { canvas, controls, readout } = shell(el, { title: "Accuracy vs. precision", icon: "🎯", canvas: true });
  let bias = 0.45, spread = 0.08, seed = 7;
  controls.append(
    slider({ label: "Bias (hurts accuracy)", min: 0, max: 0.7, step: 0.01, value: bias, onInput: (v) => { bias = v; draw(); } }),
    slider({ label: "Spread (hurts precision)", min: 0.02, max: 0.4, step: 0.01, value: spread, onInput: (v) => { spread = v; draw(); } }),
    row(button("Take new measurements", () => { seed++; draw(); })),
  );
  const { ctx, size, destroy } = setupCanvas(canvas, () => draw());
  function draw() {
    const c = themeColors();
    const { w, h } = size;
    const R = Math.min(w, h) * 0.44, cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    [1, 0.75, 0.5, 0.25].forEach((f, k) => {
      ctx.fillStyle = k % 2 ? c.surface : c.border;
      ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = c.primary;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.06, 0, Math.PI * 2); ctx.fill();
    const rand = rng(seed);
    const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
    const ang = 0.7;
    let mx = 0, my = 0;
    const pts = Array.from({ length: 12 }, () => {
      const x = bias * Math.cos(ang) + spread * gauss(), y = -bias * Math.sin(ang) + spread * gauss();
      mx += x / 12; my += y / 12;
      return [x, y];
    });
    pts.forEach(([x, y]) => {
      ctx.fillStyle = "#2f80ed"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx + x * R, cy + y * R, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.strokeStyle = "#f2994a"; ctx.lineWidth = 2;
    const [ax, ay] = [cx + mx * R, cy + my * R];
    ctx.beginPath(); ctx.moveTo(ax - 7, ay - 7); ctx.lineTo(ax + 7, ay + 7); ctx.moveTo(ax + 7, ay - 7); ctx.lineTo(ax - 7, ay + 7); ctx.stroke();
    const accurate = Math.hypot(mx, my) < 0.15, precise = spread < 0.12;
    readout.innerHTML = `
      <div class="verdict ${accurate && precise ? "good" : ""}">${accurate ? "Accurate" : "Not accurate"} · ${precise ? "precise" : "not precise"}</div>
      <p class="small muted">Blue dots are repeated measurements and the orange ✕ is their average. Accuracy is how close the ✕ is to the center. Precision is how tightly the dots cluster, whether or not they're on target.</p>`;
  }
  draw();
  return destroy;
}

// =====================================================================
// Fermi estimator: heartbeats in a lifetime on a powers-of-ten scale
// =====================================================================
export function fermi(el) {
  const { controls, readout } = shell(el, { title: "Fermi estimator: heartbeats in a lifetime", icon: "❤️" });
  let bpm = 70, years = 80, rounded = true;
  controls.append(
    slider({ label: "Heart rate", min: 40, max: 140, step: 1, value: bpm, unit: "beats/min", onInput: (v) => { bpm = v; render(); } }),
    slider({ label: "Lifetime", min: 20, max: 110, step: 1, value: years, unit: "years", onInput: (v) => { years = v; render(); } }),
    checkbox("Round minutes/year to 5 × 10⁵", rounded, (v) => { rounded = v; render(); }),
  );
  function render() {
    const mpy = rounded ? 5e5 : 525600;
    const total = bpm * mpy * years;
    const lo = 6, hi = 12;
    const pos = ((Math.log10(total) - lo) / (hi - lo)) * 100;
    const ticks = [];
    for (let e = lo; e <= hi; e++) ticks.push(`<span style="left:${((e - lo) / (hi - lo)) * 100}%">10${sup(e)}</span>`);
    readout.innerHTML = `
      <div class="conv-chain" data-lenis-prevent>${bpm} × ${rounded ? "(5 × 10⁵)" : "525,600"} × ${years} ≈ <strong>${sci(total, 2)} beats</strong></div>
      <div class="logbar">
        <div class="logbar-track"><div class="logbar-band" style="left:${((Math.log10(3e9) - 1 - lo) / (hi - lo)) * 100}%;width:${(2 / (hi - lo)) * 100}%"></div>
        <div class="logbar-dot" style="left:${Math.max(0, Math.min(100, pos))}%"></div></div>
        <div class="logbar-ticks">${ticks.join("")}</div>
        <div class="logbar-labels"><span style="left:${((Math.log10(3e6) - lo) / (hi - lo)) * 100}%">3 million</span><span style="left:${((Math.log10(3e9) - lo) / (hi - lo)) * 100}%">3 billion</span><span style="left:${((Math.log10(3e12) - lo) / (hi - lo)) * 100}%">3 trillion</span></div>
      </div>
      <p class="small muted">Order of magnitude: <strong>10${sup(Math.round(Math.log10(total)))}</strong>. The shaded band is "within a factor of 10" of 3 billion. An answer near 3 million or 3 trillion would mean a mistake.</p>`;
  }
  render();
}
