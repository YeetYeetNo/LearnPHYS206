// Smooth scrolling with Lenis 1.3.26 (loaded as a plain script from unpkg in index.html).
//
// autoRaf: Lenis runs its own animation loop.
// anchors: same-page links like href="#how-it-works" glide to their target.
// Route links ("#/learn", "#/topics/...") are page changes for the router, not anchors, so they
// are kept away from Lenis; otherwise it would look for an element with id "/learn" on every click.
// Lenis also respects prefers-reduced-motion by itself: scrolling is instant for those visitors.
// Inner panels that scroll sideways carry data-lenis-prevent, so Lenis leaves their scrolling alone.

export const lenis = window.Lenis ? new window.Lenis({ autoRaf: true, anchors: true }) : null;

if (lenis) {
  // Lenis listens for clicks on window; stopping route-link clicks at document keeps them from it.
  // The link still works: navigation is the click's default action, not something that propagates.
  document.addEventListener("click", (e) => {
    if (e.target.closest?.('a[href^="#/"]')) e.stopPropagation();
  });
}

// Scroll to an element, through Lenis when it is running.
export function scrollToEl(el, { smooth = true } = {}) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { immediate: !smooth });
  else el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
}

// After the router swaps the page: jump to the top and let Lenis re-measure the new page height.
export function resetScroll() {
  if (!lenis) { window.scrollTo(0, 0); return; }
  lenis.resize();
  lenis.scrollTo(0, { immediate: true, force: true });
}
