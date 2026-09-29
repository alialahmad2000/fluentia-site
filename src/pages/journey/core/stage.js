import { useEffect, useRef } from "react";
import { subscribe } from "./ticker";
import { vh, onLayout } from "./viewport";

/**
 * A pinned leg: a tall section with a sticky stage. Progress comes from
 * scrollY and geometry cached on layout (no layout reads per frame), smoothed
 * once for the whole stage (~70 ms: absorbs iOS scroll-event jitter and keeps
 * every element in the stage coherent). The callback runs only while the
 * section is near the screen.
 *
 *   useStage(ref, (p, info) => {...}, { smooth: 14 })
 *     p      smoothed progress 0..1 across the pin
 *     info   { raw, dt, t, top, len, sy, enter }  enter: -1..0 while the
 *            section rises into view (−1 = one screen below), 0 once pinned
 */
export function useStage(ref, onFrame, { smooth = 14, phase = 0, margin = 1 } = {}) {
  const cb = useRef(onFrame);
  cb.current = onFrame;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let top = 0;
    let len = 1;
    let p = null;
    let unsub = null;
    const measure = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
      len = Math.max(1, el.offsetHeight - vh());
    };
    measure();
    const frame = (t, dt, sy) => {
      const raw = Math.min(1, Math.max(0, (sy - top) / len));
      const k = 1 - Math.exp(-dt * smooth);
      p = p == null ? raw : p + (raw - p) * k;
      if (Math.abs(raw - p) < 1e-4) p = raw;
      const enter = Math.max(-1, Math.min(0, (sy - top) / vh()));
      cb.current(p, { raw, dt, t, top, len, sy, enter });
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !unsub) {
          measure();
          unsub = subscribe(frame, phase);
        } else if (!e.isIntersecting && unsub) {
          unsub();
          unsub = null;
          p = null;
        }
      },
      { rootMargin: `${margin * 100}% 0px ${margin * 100}% 0px` }
    );
    io.observe(el);
    const off = onLayout(measure);
    return () => {
      io.disconnect();
      off();
      unsub?.();
    };
  }, [ref, smooth, phase, margin]);
}

/** Map p into a window [a,b] → 0..1. */
export const win = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
export const ease = {
  out3: (t) => 1 - Math.pow(1 - t, 3),
  in2: (t) => t * t,
  inOut2: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inOut3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
export const lerp = (a, b, t) => a + (b - a) * t;
