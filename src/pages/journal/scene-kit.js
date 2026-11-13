import { useEffect, useState } from "react";

/**
 * Shared kit for the journal's scroll scenes (Gallery design).
 * A scene is a tall block whose inner stage sticks while the reader scrolls;
 * progress p runs 0 → 1 across it. Reduced motion: p = 1 (final state) and the
 * stage stops sticking (CSS), so nothing is ever left hidden.
 * Render must stay pure (no window/document): pages are prerendered on the server.
 */
export const LIME = "#c6ff3d";
export const WHITE = "#f4f4f4";
export const INK = "#0b0b0c";
export const DISP = "Alexandria, 'IBM Plex Sans Arabic', system-ui, sans-serif";
export const TEXT = "'IBM Plex Sans Arabic', Alexandria, system-ui, sans-serif";

export const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (t) => 1 - Math.pow(1 - t, 3);
export const f1 = (n) => n.toFixed(1);

export function useSceneProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return undefined;
    }
    let raf = 0;
    let near = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const v = span > 0 ? clamp(-r.top / span) : 1;
      const q = Math.round(v * 100) / 100;
      setP((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => { if (near && !raf) raf = requestAnimationFrame(tick); };
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = e.isIntersecting; onScroll(); }, { rootMargin: "120px 0px" })
      : null;
    if (io) io.observe(el); else near = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}
