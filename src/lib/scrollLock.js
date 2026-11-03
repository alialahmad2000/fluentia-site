/**
 * scrollLock — freeze the page behind an overlay (the mobile menu, the story
 * viewer). `overflow: hidden` on <body> alone does not stop iOS Safari from
 * scrolling the page under a fixed layer, so the body is pinned with
 * `position: fixed` at the current offset and put back exactly on release.
 * Ref-counted: two overlays may overlap for a frame during a hand-off.
 */
let depth = 0;
let saved = null;

export function lockScroll() {
  if (typeof document === "undefined") return;
  depth += 1;
  if (depth > 1) return;
  const y = window.scrollY;
  const b = document.body.style;
  saved = { y, position: b.position, top: b.top, left: b.left, right: b.right, width: b.width, overflow: b.overflow };
  b.position = "fixed";
  b.top = `-${y}px`;
  b.left = "0";
  b.right = "0";
  b.width = "100%";
  b.overflow = "hidden";
}

export function unlockScroll() {
  if (typeof document === "undefined" || depth === 0) return;
  depth -= 1;
  if (depth > 0 || !saved) return;
  const b = document.body.style;
  const { y, ...rest } = saved;
  Object.assign(b, rest);
  saved = null;
  // Instant, whatever the page's scroll-behavior says.
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, y);
  html.style.scrollBehavior = prev;
}

/**
 * Overlays push one history entry so the phone's back gesture closes them.
 * Closing any other way pops that entry — with the browser's own scroll
 * restoration paused, or it would jump the page back to where the entry was
 * pushed, fighting whatever the close is doing (a smooth scroll to a section).
 * `then` runs once the pop has landed.
 */
export function popOverlayEntry(key, then) {
  if (typeof window === "undefined") return;
  if (!window.history.state || !window.history.state[key]) {
    then?.();
    return;
  }
  const h = window.history;
  const prev = "scrollRestoration" in h ? h.scrollRestoration : null;
  if (prev) h.scrollRestoration = "manual";
  let done = false;
  const land = () => {
    if (done) return;
    done = true;
    window.removeEventListener("popstate", land);
    // The browser restores scroll AFTER dispatching popstate, reading the
    // setting at that moment: put «auto» back only once that has passed, or
    // its restore lands on top of `then`'s smooth scroll and cancels it.
    requestAnimationFrame(() => then?.());
    if (prev) window.setTimeout(() => (h.scrollRestoration = prev), 1000);
  };
  window.addEventListener("popstate", land);
  window.setTimeout(land, 400); // a browser that never fires popstate here
  h.back();
}

/**
 * Hand off to the page's own `[data-open-form]` listener (homepage lead modal,
 * /private and /join form scroll) from inside an overlay that is closing.
 * The overlay's button does NOT carry the attribute itself: the page's smooth
 * scroll would start before the history pop lands and the pop cancels it.
 * Called from popOverlayEntry's `then`, it clicks a throwaway trigger instead.
 */
export function triggerOpenForm() {
  const t = document.createElement("button");
  t.type = "button";
  t.setAttribute("data-open-form", "");
  t.hidden = true;
  document.body.appendChild(t);
  t.click();
  t.remove();
}
