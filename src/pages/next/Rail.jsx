import { useEffect, useId, useRef, useState } from "react";
import Giant from "./Giant";
import { RAIL, RAIL_TITLE } from "./showcase";

/**
 * «وأكثر» — five more real screens (captured for the fictional «سارة»), in a
 * horizontal rail: native scroll with snap and momentum on a phone, arrows on
 * a desktop. Images are lazy; nothing here loads before the rail is near.
 *
 * Arrows are icon buttons named السابق / التالي, pointing the RTL way (السابق
 * → toward the start, i.e. right; التالي ← toward the end, left). Each one is
 * disabled at its end, and both hide when the rail has nothing to scroll.
 */

// Chevron pointing right; the "next" button mirrors it.
function Chevron({ flip = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M7 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Rail() {
  const ref = useRef(null);
  const listId = useId();
  // { atStart, atEnd, scrollable } — measured from the rail itself.
  const [edge, setEdge] = useState({ atStart: true, atEnd: false, scrollable: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      // Ends are read from the cards, not scrollLeft: scroll-snap parks the
      // rail a few dozen px in, and RTL scrollLeft signs differ by engine.
      // RTL: the first card sits at the right edge, the last at the left.
      const box = el.getBoundingClientRect();
      const first = el.firstElementChild?.getBoundingClientRect();
      const last = el.lastElementChild?.getBoundingClientRect();
      const next = {
        atStart: !first || first.right <= box.right + 2,
        atEnd: !last || last.left >= box.left - 2,
        scrollable: max > 2,
      };
      setEdge((p) => (p.atStart === next.atStart && p.atEnd === next.atEnd && p.scrollable === next.scrollable ? p : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // RTL: "next" moves toward the inline end, i.e. to the left.
  const nudge = (dir) => {
    const el = ref.current;
    if (!el) return;
    const step = el.firstElementChild ? el.firstElementChild.getBoundingClientRect().width + 20 : 300;
    el.scrollBy({ left: -dir * step, behavior: "smooth" });
  };
  return (
    <section className="fx-rail-sec" aria-label={RAIL_TITLE[0].text}>
      <div className="fx-rail-head">
        <Giant lines={RAIL_TITLE} className="fx-rail-title" />
        <div className="fx-rail-arrows" hidden={!edge.scrollable}>
          <button type="button" onClick={() => nudge(-1)} aria-label="السابق" aria-controls={listId} disabled={edge.atStart}>
            <Chevron />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="التالي" aria-controls={listId} disabled={edge.atEnd}>
            <Chevron flip />
          </button>
        </div>
      </div>
      <ul ref={ref} id={listId} className="fx-rail">
        {RAIL.map((r) => (
          <li key={r.key} className="fx-rail-item">
            <div className="fx-rail-dev">
              <img src={r.src} alt={r.name} width="390" height="844" loading="lazy" decoding="async" />
            </div>
            <h3 className="fx-rail-name">{r.name}</h3>
            <p className="fx-rail-line">{r.line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
