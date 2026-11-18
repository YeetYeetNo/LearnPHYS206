import { icon as svgIcon } from "../icons.js";

// Common frame for an interactive widget: title bar, stage, controls, readout.
// Layout options: tall/xtall make the canvas taller; wide puts a short, wide canvas above the controls.
export function shell(el, { title, icon = "🧪", canvas = false, tall = false, xtall = false, wide = false }) {
  el.classList.add("widget");
  const stage = [tall && "tall", xtall && "xtall", wide && "wide"].filter(Boolean).join(" ");
  el.innerHTML = `
    <div class="widget-head">${svgIcon("sliders", "widget-ico")}<strong>${title}</strong><span class="widget-tag">Interactive</span></div>
    <div class="widget-body ${canvas ? "has-canvas" : ""} ${wide ? "stacked" : ""}">
      ${canvas ? `<div class="widget-stage ${stage}"><canvas></canvas></div>` : ""}
      <div class="widget-side">
        <div class="widget-controls"></div>
        <div class="widget-readout"></div>
      </div>
    </div>`;
  return {
    canvas: el.querySelector("canvas"),
    controls: el.querySelector(".widget-controls"),
    readout: el.querySelector(".widget-readout"),
  };
}

export function button(label, onClick, cls = "btn btn-ghost btn-sm") {
  const b = document.createElement("button");
  b.className = cls;
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

export function row(...children) {
  const d = document.createElement("div");
  d.className = "widget-row";
  children.forEach((c) => d.appendChild(c));
  return d;
}

export function checkbox(label, checked, onChange) {
  const l = document.createElement("label");
  l.className = "control-check";
  l.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}/> ${label}`;
  l.querySelector("input").addEventListener("change", (e) => onChange(e.target.checked));
  return l;
}

export function select(options, value, onChange) {
  const s = document.createElement("select");
  s.className = "input";
  options.forEach(([v, text]) => {
    const o = document.createElement("option");
    o.value = v; o.textContent = text;
    if (v === value) o.selected = true;
    s.appendChild(o);
  });
  s.addEventListener("change", () => onChange(s.value));
  return s;
}

// Table of label/value rows. update(rows) re-renders.
export function table(el) {
  return (rows) => {
    el.innerHTML = `<table class="mini-table">${rows
      .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`)
      .join("")}</table>`;
  };
}
