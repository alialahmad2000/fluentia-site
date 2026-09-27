/**
 * The one scroll loop on /next.
 *
 * Sections register an element and a mode; on every scroll or resize, one rAF
 * measures them all and writes `--p` (0 → 1) on each element. Components read
 * `--p` in CSS. No component owns a scroll listener.
 *
 * Modes (vh = viewport height, rect = the element's box):
 *   hero     0 at the top of the page → 1 once the element has scrolled away
 *   through  0 as its top meets the bottom edge → 1 as its bottom leaves the top
 *   enter    0 as its top meets the bottom edge → 1 as its top reaches the top
 *   pin      0 as it pins → 1 as it releases (for tall sections with a sticky inner)
 *
 * `onP(p, el)` runs after the variable is written, for the few places that need
 * a discrete state (the stage's active item, the header's backdrop). An element
 * may be registered more than once; `write: false` observes without writing.
 */

const items = new Set();
let raf = 0;
let bound = false;
let vh = 0;

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function measure(el, mode) {
  const r = el.getBoundingClientRect();
  if (mode === "hero") return clamp(-r.top / Math.max(1, r.height));
  if (mode === "enter") return clamp((vh - r.top) / vh);
  if (mode === "pin") return clamp(-r.top / Math.max(1, r.height - vh));
  return clamp((vh - r.top) / (vh + r.height));
}

function frame() {
  raf = 0;
  vh = window.innerHeight;
  items.forEach((it) => {
    const p = measure(it.el, it.mode);
    if (Math.abs(p - it.last) < 0.0005) return;
    it.last = p;
    if (it.write) it.el.style.setProperty("--p", p.toFixed(4));
    if (it.onP) it.onP(p, it.el);
  });
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unbind() {
  if (!bound) return;
  bound = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/** Start tracking `el`; returns the function that stops it. */
export function track(el, { mode = "through", onP, write = true } = {}) {
  if (!el) return () => {};
  const it = { el, mode, onP, write, last: -1 };
  items.add(it);
  bind();
  schedule();
  return () => {
    items.delete(it);
    if (!items.size) unbind();
  };
}

/** Re-measure on the next frame (after a layout change that no scroll caused). */
export function refresh() {
  if (items.size) schedule();
}
