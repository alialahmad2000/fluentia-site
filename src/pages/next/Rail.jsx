import { useRef } from "react";
import Giant from "./Giant";
import { RAIL, RAIL_TITLE } from "./showcase";

/**
 * «وأكثر» — five more real screens (captured for the fictional «سارة»), in a
 * horizontal rail: native scroll with snap and momentum on a phone, arrows on
 * a desktop. Images are lazy; nothing here loads before the rail is near.
 */
export default function Rail() {
  const ref = useRef(null);
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
        <div className="fx-rail-arrows">
          <button type="button" onClick={() => nudge(-1)} aria-label="السابق">→</button>
          <button type="button" onClick={() => nudge(1)} aria-label="التالي">←</button>
        </div>
      </div>
      <ul ref={ref} className="fx-rail">
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
