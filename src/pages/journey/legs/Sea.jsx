import { useEffect, useRef } from "react";
import { SOCIAL_PROOF, TRUSTED_LOGOS } from "../../landing-v2/content";
import Giant from "../Giant";
import { useJourney } from "../context";
import { useStage, win } from "../core/stage";
import { vh, vw, isPhone } from "../core/viewport";
import * as gl from "../gl/manager";
import seaDesk from "../stills/sea-d.webp";
import seaPhone from "../stills/sea-m.webp";

/**
 * Leg 6 — a sea of voices, at night. The road runs into the water; the packet
 * becomes a pulse that stays put on the screen while the sea travels under it,
 * trailing a real wake. The institutions the homepage names come downstream
 * one by one, each riding its own lit line; as each passes you, its logo
 * rises beside it. Two facts surface in the water. Near the end the near water
 * turns gold — the horizon of the arrival.
 *
 * No quotes: the only testimonials in the repo are the stand-ins the homepage
 * hides. The title says only what the homepage says.
 */
const FACTS = [SOCIAL_PROOF.stats[3], SOCIAL_PROOF.stats[2]]; // 6 levels · +12K words

export default function Sea() {
  const { cfg, glAlive, reduce } = useJourney();
  const secRef = useRef(null);
  const markRefs = useRef([]);
  const factRefs = useRef([]);
  const titleBottom = useRef(0);
  useEffect(() => {
    const m = () => {
      const h = secRef.current.querySelector(".jn-sea-head");
      titleBottom.current = h ? h.offsetTop + h.offsetHeight : 0;
    };
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);
  const webgl = Boolean(cfg && cfg.webgl && glAlive);

  useEffect(() => {
    // stamp ripples where a finger or cursor touches the water
    const sec = secRef.current;
    if (!webgl) return undefined;
    const onTouch = (e) => {
      const t = e.touches?.[0] || e;
      gl.params("sea")?.stamp?.(t.clientX, t.clientY, e.type === "pointerdown" ? 0.6 : 0.3);
    };
    sec.addEventListener("pointermove", onTouch, { passive: true });
    sec.addEventListener("pointerdown", onTouch, { passive: true });
    sec.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      sec.removeEventListener("pointermove", onTouch);
      sec.removeEventListener("pointerdown", onTouch);
      sec.removeEventListener("touchmove", onTouch);
    };
  }, [webgl]);

  useStage(
    secRef,
    (p, { t, enter }) => {
      const H = vh();
      const W = vw();
      if (webgl) {
        if (enter > -1) gl.warm("sea");
        const s = gl.params("sea");
        if (s) {
          s.p = p;
          s.side = isPhone() ? "right" : "left";
          s.titleBottom = titleBottom.current;
          // the window: visible as soon as the section reaches the screen
          if (enter > -1) gl.show("sea", 3, t);
        }
        const marks = s?.marks || [];
        marks.forEach((m, i) => {
          const el = markRefs.current[i];
          if (!el) return;
          // below the title, above the facts: three can ride at once; each lights at the pulse
          const top = titleBottom.current + 30;
          const end = isPhone() ? 0.62 : 0.86; // on a phone the facts own the space below the pulse
          const band = win(m.y, top, top + H * 0.04) * (1 - win(m.y, H * end, H * (end + 0.06)));
          const x = isPhone() ? W * (0.3 + 0.4 * (i % 2)) : Math.min(m.x, W * 0.42);
          el.style.opacity = (m.a * band).toFixed(2);
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0) translate(-50%, -120%) scale(${m.lit ? 1.08 : 1})`;
          el.toggleAttribute("data-lit", m.lit || m.passed);
        });
      }
      // facts surface beside the pulse, one after the other
      FACTS.forEach((f, i) => {
        const el = factRefs.current[i];
        if (!el) return;
        const a = win(p, 0.3 + i * 0.26, 0.38 + i * 0.26) * (1 - win(p, 0.5 + i * 0.26, 0.58 + i * 0.26));
        el.style.opacity = (reduce || !webgl ? 1 : a).toFixed(3);
        el.style.transform = webgl && !reduce ? `translate3d(-50%, ${((1 - a) * 18).toFixed(1)}px, 0)` : "";
      });
    },
    { margin: 0.5 }
  );

  return (
    <section id="jn-sea" ref={secRef} className="jn-sea" data-theme="night" data-leg="6" aria-labelledby="jn-sea-title">
      <div className="jn-stage jn-sea-stage">
        <picture className="jn-still" aria-hidden="true">
          <source media="(max-aspect-ratio: 4/5)" srcSet={seaPhone} />
          <img src={seaDesk} alt="" decoding="async" loading="lazy" />
        </picture>
        <div className="jn-safe">
          <div className="jn-sea-head">
            <Giant id="jn-sea-title" className="jn-sea-title" lines={[TRUSTED_LOGOS.lead, TRUSTED_LOGOS.emphasis]} tones={["cream", "gold"]} />
          </div>
          <div className="jn-facts">
            {FACTS.map((f, i) => (
              <p key={f.label} ref={(el) => (factRefs.current[i] = el)} className="jn-fact">
                <span className="jn-fact-num jn-num" dir="ltr">
                  {f.value.replace("K", ",000")}
                </span>
                <span className="jn-fact-label">{f.label}</span>
              </p>
            ))}
          </div>
          <ul className="jn-marks" aria-label={`${TRUSTED_LOGOS.lead} ${TRUSTED_LOGOS.emphasis}`}>
            {TRUSTED_LOGOS.items.map((it, i) => (
              <li key={it.name} ref={(el) => (markRefs.current[i] = el)} className="jn-mark">
                <img src={it.src} alt="" style={{ height: `${Math.round(it.h * 0.42)}px` }} />
                <span>{it.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
