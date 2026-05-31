import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { STATS, toArabic } from "../atelier.copy";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

function CountUp({ target }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(target); return; }
    let raf;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduce]);

  return <span ref={ref}>{toArabic(val)}</span>;
}

export default function Stats() {
  return (
    <section className="at-section">
      <div className="at-container">
        <div className="at-grid at-grid-4" style={{ textAlign: "center" }}>
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * STAGGER}
              style={{ padding: "8px 0", borderInlineStart: i > 0 ? "1px solid var(--hairline)" : "none" }}>
              <div className="at-numeral" style={{ fontSize: "clamp(40px, 8vw, 68px)" }}>
                {s.value != null ? <CountUp target={s.value} /> : s.display}
              </div>
              <div className="at-meta" style={{ marginTop: "10px", maxWidth: "20ch", marginInline: "auto" }}>
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
