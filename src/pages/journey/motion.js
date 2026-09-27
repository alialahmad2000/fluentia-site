/**
 * The motion stack, loaded on demand — never on the critical path, never on
 * the server. GSAP + ScrollTrigger + SplitText arrive in one chunk; Lenis in
 * its own, and only for fine pointers above the low tier.
 */

let gsapP = null;
export function loadGsap() {
  if (!gsapP) {
    gsapP = Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(
      ([g, st, sp]) => {
        const gsap = g.gsap || g.default;
        const ScrollTrigger = st.ScrollTrigger || st.default;
        const SplitText = sp.SplitText || sp.default;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        ScrollTrigger.config({ ignoreMobileResize: true });
        return { gsap, ScrollTrigger, SplitText };
      }
    );
  }
  return gsapP;
}

/**
 * Lenis driven by GSAP's ticker, feeding ScrollTrigger. Returns a teardown.
 * Touch devices keep native scroll (iOS momentum is the better feel there).
 */
export async function startLenis({ gsap, ScrollTrigger }) {
  const { default: Lenis } = await import("lenis");
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__jnLenis = lenis;
  return () => {
    gsap.ticker.remove(tick);
    lenis.off?.("scroll", onScroll);
    lenis.destroy();
    if (window.__jnLenis === lenis) window.__jnLenis = null;
  };
}

/** Smooth-scroll to an element (Lenis when it runs, native otherwise). */
export function scrollToEl(el, offset = 0) {
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.__jnLenis) {
    window.__jnLenis.scrollTo(el, { offset, duration: reduce ? 0 : 1.6 });
    return;
  }
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
