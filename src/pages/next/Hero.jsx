import { useEffect, useRef, useState } from "react";
import { HERO } from "../landing-v2/content";
import Giant from "./Giant";
import Orb from "./Orb";
import { track } from "./scroll";
import { CTA_LABEL, HERO_LINES, SEE_INSIDE } from "./copy";

/**
 * Hero — the Fluentia planet, and the promise laid over it.
 *
 * Phone: the orb on top (~88vw), the headline overlapping its lower third.
 * Desktop: the orb on the left half, the headline starting on the right and
 * running over the orb's right edge. The shader darkens the region under the
 * type (the vignette) so the cream and ice lines keep their contrast.
 *
 * The headline is the LCP element: it is in the prerendered HTML and rises on a
 * CSS animation that needs no JavaScript (next.css, `.fx-hero-rv`). With the
 * intro on, the same animation simply starts later.
 */

// Vignette in disc space (x, y up, radius, strength), where the headline sits.
const VIG_PHONE = [0, -0.62, 1.05, 0.62];
const VIG_DESK = [0.78, -0.05, 0.95, 0.58];

// The hero's line under the headline (two lines at most on a phone).
const SUB = HERO.lead;

export default function Hero({ gl }) {
  const ref = useRef(null);
  const [vig, setVig] = useState(VIG_PHONE);

  useEffect(() => track(ref.current, { mode: "hero" }), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setVig(mq.matches ? VIG_DESK : VIG_PHONE);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  const seeInside = (e) => {
    e.preventDefault();
    document.getElementById("fx-platform")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="fx-top" ref={ref} className="fx-hero">
      <div className="fx-hero-orb">
        <Orb variant="planet" gl={gl} vignette={vig} mark />
      </div>
      <div className="fx-hero-copy">
        <Giant as="h1" reveal="hero" lines={HERO_LINES} className="fx-hero-title" />
        <p className="fx-hero-sub fx-hero-after">{SUB}</p>
        <div className="fx-hero-actions fx-hero-after">
          <button type="button" data-open-form className="fx-btn fx-btn--primary">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </button>
          <a href="#fx-platform" className="fx-quiet" onClick={seeInside}>
            {SEE_INSIDE}
          </a>
        </div>
      </div>
    </section>
  );
}
