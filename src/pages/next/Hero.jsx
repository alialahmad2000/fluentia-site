import { useEffect, useRef, useState } from "react";
import { bookingHref } from "../../lib/booking";
import { HERO, TRUSTED_LOGOS } from "../landing-v2/content";
import Giant from "./Giant";
import Orb from "./Orb";
// ~4 KB, inlined into the HTML so the planet paints with the first paint (it is the LCP).
import PLANET_LQIP from "./planet-lqip";
import { track } from "./scroll";
import { CTA_LABEL, HERO_LINES, HERO_LINES_HOME, HERO_TRUST, SEE_INSIDE } from "./copy";

/**
 * Hero — the promise, and the Fluentia planet beside it.
 *
 * Homepage (polished 2026-11-12, Ali: «the first screen doesn't feel
 * professionally designed»):
 *   ≥ 1024 px  a two-column grid — copy on the right (7/12), the planet on the
 *              left (5/12). Nothing overlaps, so the planet needs no vignette
 *              and the F sits at its centre.
 *   < 1024 px  stacked: a smaller planet on top, never under the letters.
 * The planet is toned down (`dim`) so the eye goes headline → line → call → planet.
 * Under the call: one quiet reassurance line and the five client logos, muted.
 *
 * The planet paints a static poster first (AVIF/WebP, rendered from the shader
 * itself, F already painted), and the shader only starts once the page has
 * loaded and the main thread is idle — never on the low tier (reduced motion,
 * save-data, slow connections, weak devices).
 *
 * /join (campaign) keeps the hero it launched with: its frozen stylesheet
 * (next-classic.css) lays the headline over the planet, so it keeps the
 * vignette, the off-centre F and no poster.
 *
 * The headline is the LCP element: it is in the prerendered HTML and rises on a
 * CSS animation that needs no JavaScript (next.css, `.fx-hero-rv`).
 */

// Vignette in disc space (x, y up, radius, strength), where /join's headline sits.
const VIG_PHONE = [0, -0.62, 1.05, 0.62];
const VIG_DESK = [0.78, -0.05, 0.95, 0.58];
const NO_VIG = [0, 0, 0, 0];

// The poster: one frame of the shader at the homepage's settings (scripts/hero/planet-poster.mjs).
const POSTER = {
  base: "/brand/hero/planet",
  widths: [360, 520, 720, 1040],
  // phone: ~46vw (clamped 168–300 px); desktop: the 5/12 column, ≤ 560 px
  sizes: "(min-width: 1024px) min(36vw, 560px), clamp(168px, 46vw, 300px)",
  lqip: PLANET_LQIP,
};

// The shader starts after load + idle: the first paint is the poster's alone.
function afterLoadIdle(fn) {
  let idle = 0;
  let timer = 0;
  const go = () => {
    const ric = window.requestIdleCallback;
    if (ric) idle = ric(fn, { timeout: 2500 });
    else timer = window.setTimeout(fn, 600);
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    if (idle) window.cancelIdleCallback?.(idle);
    if (timer) window.clearTimeout(timer);
  };
}

// The five client logos, single-colour (public/brand/entities/mono, made from the
// originals by scripts/hero/mono-logos.mjs): emblems stand a little taller than wordmarks.
const LOGO_FIT = {
  moi: { h: 30, r: 0.731 },
  mc: { h: 24, r: 3.0 },
  ksu: { h: 26, r: 2.72 },
  moj: { h: 26, r: 2.681 },
  kau: { h: 30, r: 0.819 },
};

function TrustLogos() {
  return (
    <ul className="fx-hero-logos" aria-label={`${TRUSTED_LOGOS.lead} ${TRUSTED_LOGOS.emphasis}`}>
      {TRUSTED_LOGOS.items.map((it) => {
        const slug = it.src.split("/").pop().replace(/\.\w+$/, "");
        const fit = LOGO_FIT[slug] || { h: 24, r: 1 };
        return (
          <li key={it.name}>
            <img
              src={`/brand/entities/mono/${slug}.webp`}
              srcSet={`/brand/entities/mono/${slug}.webp 1x, /brand/entities/mono/${slug}@2x.webp 2x`}
              alt={it.name}
              title={it.name}
              width={Math.round(fit.h * fit.r)}
              height={fit.h}
              style={{ "--h": `${fit.h}px` }}
              decoding="async"
              fetchpriority="low"
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function Hero({ gl, campaign = false }) {
  const ref = useRef(null);
  const [vig, setVig] = useState(campaign ? VIG_PHONE : NO_VIG);
  const [ready, setReady] = useState(false);

  useEffect(() => track(ref.current, { mode: "hero" }), []);
  useEffect(() => afterLoadIdle(() => setReady(true)), []);

  useEffect(() => {
    if (!campaign) return undefined;
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setVig(mq.matches ? VIG_DESK : VIG_PHONE);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [campaign]);

  const seeInside = (e) => {
    e.preventDefault();
    document.getElementById("fx-platform")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const live = ready ? gl : null;

  return (
    <section id="fx-top" ref={ref} className={`fx-hero${campaign ? "" : " fx-hero--home"}`}>
      <div className="fx-hero-orb">
        {campaign ? (
          <Orb variant="planet" gl={live} vignette={vig} mark />
        ) : (
          <Orb variant="planet" gl={live} mark="center" painted dim={0.8} poster={POSTER} />
        )}
      </div>
      <div className="fx-hero-copy">
        <Giant as="h1" reveal="hero" lines={campaign ? HERO_LINES : HERO_LINES_HOME} className="fx-hero-title" />
        <p className="fx-hero-sub fx-hero-after">{HERO.lead}</p>
        <div className="fx-hero-actions fx-hero-after">
          <a href={bookingHref()} data-open-form className="fx-btn fx-btn--primary">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </a>
          <a href="#fx-platform" className="fx-quiet" onClick={seeInside}>
            {SEE_INSIDE}
          </a>
        </div>
        {campaign ? null : (
          <div className="fx-hero-trust fx-hero-after">
            <p className="fx-hero-note">{HERO_TRUST}</p>
            <TrustLogos />
          </div>
        )}
      </div>
    </section>
  );
}
