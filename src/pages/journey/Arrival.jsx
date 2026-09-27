import { useEffect, useRef } from "react";
import V1Pricing from "../v1/V1Pricing";
import { FINAL_CTA } from "../landing-v2/content";
import Giant from "./Giant";
import { useJourney } from "./context";
import { CTA_LABEL, TITLES } from "./copy";
import { voice, voiceTo, wave, reducedMotion } from "./line";

/**
 * Leg 6 — arrival. A gold horizon rises out of the night, and the line you
 * have been carrying opens into a full-width, confident waveform that
 * breathes across the screen. Then «اختر مسارك» and the homepage's pricing
 * component, unchanged, and the homepage's final call.
 */
const LAYERS = [
  { k: 1, a: 1, cls: "jn-wave-core" },
  { k: 0.62, a: 0.7, cls: "jn-wave-gold" },
  { k: 0.36, a: 0.5, cls: "jn-wave-soft" },
];

function Waveform({ grow = 1, fxOn }) {
  const svgRef = useRef(null);
  const pathsRef = useRef([]);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const reduce = reducedMotion();
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(svg);
    const draw = (now) => {
      raf = 0;
      const W = svg.clientWidth || 1000;
      const H = svg.clientHeight || 200;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const g = Number(svg.style.getPropertyValue("--grow") || grow);
      voiceTo({ amp: H * 0.36, energy: 1, thick: 3 });
      const v = voice(now);
      const t = reduce ? 1.2 : v.t;
      const half = (W / 2) * Math.max(0.002, g);
      LAYERS.forEach((L, i) => {
        let d = "";
        const n = 160;
        for (let j = 0; j <= n; j++) {
          const u = j / n;
          const x = W / 2 - half + half * 2 * u;
          const y = H / 2 + wave(u, t * (1 + i * 0.13) + i * 0.9, v.amp * L.k * g);
          d += `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        pathsRef.current[i]?.setAttribute("d", d);
      });
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [grow, fxOn]);
  return (
    <svg ref={svgRef} className="jn-wave" aria-hidden="true" style={{ "--grow": grow }}>
      {LAYERS.map((L, i) => (
        <path key={L.cls} ref={(el) => (pathsRef.current[i] = el)} className={L.cls} fill="none" />
      ))}
    </svg>
  );
}

export default function Arrival() {
  const { fx, cfg } = useJourney();
  const secRef = useRef(null);
  const moving = Boolean(fx && cfg && cfg.webgl);

  useEffect(() => {
    if (!moving) return undefined;
    const { gsap } = fx;
    const sec = secRef.current;
    const wave = sec.querySelector(".jn-arrive .jn-wave");
    const sun = sec.querySelector(".jn-sun");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wave,
        { "--grow": 0.004 },
        { "--grow": 1, ease: "power2.out", scrollTrigger: { trigger: sec, start: "top 85%", end: "top 15%", scrub: true } }
      );
      gsap.fromTo(
        sun,
        { yPercent: 55, opacity: 0.2 },
        { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true } }
      );
    }, sec);
    return () => ctx.revert();
  }, [moving, fx]);

  return (
    <div ref={secRef} className="jn-arrival-wrap" data-theme="night" data-leg="6">
      <section className="jn-arrive" aria-labelledby="jn-arrive-title">
        <div className="jn-sun" aria-hidden="true" />
        <Giant id="jn-arrive-title" className="jn-arrive-title" lines={TITLES.arrival} tones={["cream", "gold"]} />
        <Waveform grow={moving ? 0.004 : 1} fxOn={moving} />
        <div className="jn-arrive-cta">
          <button type="button" data-open-form className="jn-btn jn-btn--gold jn-btn--lg">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </section>

      <section id="jn-pricing" className="jn-pricing" aria-labelledby="jn-pricing-title">
        <Giant id="jn-pricing-title" className="jn-pricing-title jn-center" lines={[TITLES.pricing]} tones={["cream"]} />
        <V1Pricing />
      </section>

      <section className="jn-final" aria-labelledby="jn-final-title">
        <span className="jn-eyebrow jn-eyebrow--gold">{FINAL_CTA.eyebrow}</span>
        <h2 id="jn-final-title" className="jn-h2 jn-final-title">
          {FINAL_CTA.headline}
        </h2>
        <p className="jn-lede">{FINAL_CTA.sub}</p>
        <button type="button" data-open-form className="jn-btn jn-btn--primary jn-btn--lg">
          {FINAL_CTA.primaryCTA}
          <span aria-hidden="true">←</span>
        </button>
      </section>
    </div>
  );
}
