// Connects the taste-skill effects and moments (assets/vendor/taste-skill) to this site's router.
// The vendor loaders were written for normal pages that load once; here every route re-renders
// #app, so this mounts what a page asks for after each render and tears it down before the next.
//
//   <div data-fx="contour-lines" ...>          an animated background (WebGL, with a CSS fallback)
//   <section data-moment="pinned-chapters">    a scroll moment
//   <div data-moment="counter-rolls">          numbers that roll once like an odometer
//
// Both respect prefers-reduced-motion (a still frame / the finished state).

const VENDOR = new URL("../assets/vendor/taste-skill/", import.meta.url);
let modsP = null;

function loadMods() {
  if (!modsP) {
    window.__momentsManual = true; // we mount moments per page instead of once per document
    modsP = Promise.all([
      import(new URL("effects/fx.js", VENDOR).href),
      import(new URL("moments/moments.js", VENDOR).href),
    ]).then(([fx, moments]) => ({ fx: fx.default, moments: moments.default }));
  }
  return modsP;
}

// The diagram builder and its stylesheet, loaded only on pages that have a diagram.
let dgP = null;
function loadDiagrams() {
  if (!dgP) {
    const href = new URL("diagrams/diagram.css", VENDOR).href;
    if (![...document.styleSheets].some((s) => s.href === href)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href;
      document.head.appendChild(l);
    }
    dgP = import(new URL("diagrams/diagram.js", VENDOR).href).then((m) => m.default);
  }
  return dgP;
}

// <div class="dg" data-diagram-links="#/topics/"><script type="application/json">{spec}</script></div>
// Draws the spec. With data-diagram-links, clicking a box opens <prefix><node id>.
function mountDiagram(dg, el) {
  const spec = JSON.parse(el.querySelector(':scope > script[type="application/json"]').textContent);
  const d = dg.mount(el, spec);
  const prefix = el.dataset.diagramLinks;
  if (!prefix) return () => d.destroy();
  const onClick = (e) => {
    const node = e.target.closest(".dg-node");
    if (node?.dataset.id) location.hash = prefix + node.dataset.id;
  };
  el.addEventListener("click", onClick);
  return () => { el.removeEventListener("click", onClick); d.destroy(); };
}

// Mount every effect, moment and diagram inside root. Returns a cleanup function.
export function enhance(root) {
  // remember this page's own elements: the cleanup must never touch the next page's
  const fxEls = [...root.querySelectorAll("[data-fx]")];
  const moments = [...root.querySelectorAll("[data-moment]")];
  const diagrams = [...root.querySelectorAll("[data-diagram-links], .dg[data-diagram-spec]")];
  const dgCleanups = [];
  if (!fxEls.length && !moments.length && !diagrams.length) return () => {};
  let gone = false;
  const destroy = () => {
    fxEls.forEach((el) => { try { el.__fx?.destroy(); } catch {} });
    moments.forEach((el) => { try { el.__moment?.destroy?.(); } catch {} });
    dgCleanups.splice(0).forEach((f) => { try { f(); } catch {} });
  };
  if (diagrams.length) {
    loadDiagrams()
      .then((dg) => {
        if (gone) return;
        diagrams.forEach((el) => {
          try { dgCleanups.push(mountDiagram(dg, el)); } catch (e) { console.warn("diagram failed:", e); }
        });
      })
      .catch((e) => console.warn("diagrams could not load:", e));
  }
  if (!fxEls.length && !moments.length) return () => { gone = true; destroy(); };
  loadMods()
    .then(async ({ fx, moments: mo }) => {
      if (gone) return;
      await Promise.all([
        ...fxEls.map((el) => fx.mountAll(el)),
        ...moments.map((el) => mo.mount(el).catch((e) => {
          // a moment that fails shows its finished, static state
          console.warn(`moment ${el.dataset.moment} failed:`, e);
          el.classList.add("mo-safe");
        })),
      ]);
      if (gone) destroy(); // the visitor left while it was loading
    })
    .catch((e) => console.warn("effects could not load:", e));
  return () => { gone = true; destroy(); };
}
