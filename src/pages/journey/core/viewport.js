/**
 * The viewport height, frozen. iOS changes innerHeight by ~80 px whenever the
 * toolbar shows or hides; every pinned length and every screen-space geometry
 * on this page uses this number instead, measured once at boot (the inline
 * script writes --jn-vh) and re-measured only when the width changes or the
 * height changes by more than a quarter (rotation, split view).
 */
let VH = 800;
let VW = 1200;
const listeners = new Set();

function read() {
  VW = window.innerWidth;
  VH = window.__jnVH || window.innerHeight;
}

export function initViewport() {
  read();
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === VW && Math.abs(h - VH) < VH * 0.25) return;
      window.__jnVH = h;
      if (w !== VW) {
        const pr = document.createElement("div");
        pr.style.cssText = "position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden";
        document.body.appendChild(pr);
        window.__jnLVH = pr.offsetHeight;
        pr.remove();
      }
      document.documentElement.style.setProperty("--jn-vh", `${h}px`);
      read();
      listeners.forEach((f) => f());
    }, 120);
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

export const vh = () => VH;
export const vw = () => VW;
export const isPhone = () => VW < 720;

/** Called when the frozen size changes, and on "jn:layout" (fonts, tier, images). */
export function onLayout(fn) {
  listeners.add(fn);
  const ev = () => fn();
  window.addEventListener("jn:layout", ev);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("jn:layout", ev);
  };
}

export function relayout() {
  window.dispatchEvent(new Event("jn:layout"));
}
