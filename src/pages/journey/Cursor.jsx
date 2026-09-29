import { useEffect, useRef } from "react";

/**
 * Desktop cursor (fine pointers only): a small sky dot and a thin ring whose
 * stroke is the scroll progress of the leg you are in. The ring grows over
 * anything you can press. The system cursor stays — this rides beside it.
 */
const R = 17;
const C = 2 * Math.PI * R;

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const arcRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const arc = arcRef.current;
    // leg bounds measured on resize, not per frame
    let legs = [];
    const measure = () => {
      legs = [...document.querySelectorAll("[data-leg]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, h: r.height };
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let big = 0;
    let bigT = 0;
    let raf = 0;
    let seen = false;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
        document.documentElement.classList.add("jn-cursor-on");
      }
      bigT = e.target.closest?.("a, button, [role='tab'], input, select, textarea, label, canvas") ? 1 : 0;
    };
    const leave = () => {
      document.documentElement.classList.remove("jn-cursor-on");
      seen = false;
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      big += (bigT - big) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${(1 + big * 0.7).toFixed(3)})`;
      const mid = window.scrollY + window.innerHeight / 2;
      let p = 0;
      for (const l of legs) {
        if (l.top <= mid && l.top + l.h > mid) {
          p = Math.min(1, Math.max(0, (mid - l.top) / Math.max(1, l.h)));
          break;
        }
      }
      arc.style.strokeDashoffset = String(C * (1 - p));
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("jn-cursor-on");
    };
  }, []);

  return (
    <div className="jn-cursor" aria-hidden="true">
      <span ref={dotRef} className="jn-cursor-dot" />
      <svg ref={ringRef} className="jn-cursor-ring" width="44" height="44" viewBox="-22 -22 44 44">
        <circle r={R} className="jn-cursor-track" />
        <circle ref={arcRef} r={R} className="jn-cursor-arc" strokeDasharray={C} strokeDashoffset={C} transform="rotate(-90)" />
      </svg>
    </div>
  );
}
