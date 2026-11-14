import { useEffect, useRef } from "react";
import { bookingHref } from "../../lib/booking";
import { HERO, TRUSTED_LOGOS } from "../landing-v2/content";
import { track } from "./scroll";
import DawnSun from "./DawnSun";
import { CTA_LABEL, HERO_LINES_HOME, HERO_TRUST, SEE_INSIDE } from "./copy";

/**
 * «الفجر» hero — the homepage's first screen since 2026-11-14
 * (~/Downloads/FLUENTIA-HOMEPAGE-DAWN-FIRST-IMPRESSION.md).
 *
 * The visitor starts in the night and the page opens into dawn: a night sky
 * that warms toward a low horizon glow, the F rising there as the sun, and a
 * real platform screen in front of it with three small UI cards around it.
 * Everything is CSS gradients + SVG + one image (dawn.css): no WebGL, no
 * square containers, nothing with an edge that could show as a seam.
 *
 *   ≥ 1024 px  copy on the right, the dawn scene on the left, inside 100svh
 *   < 1024 px  copy first (headline, line, call and trust all on the first
 *              screen at 390×844), the scene under it, smaller
 *
 * The cards' numbers are UI examples of what a student sees, not claims.
 * The old hero (Hero.jsx, the planet) still renders /home-v1 and /join.
 */

// The client logos: same five, same claim as the old hero, larger and cream.
// Ratios measured by the generator (mono-lg/ + color/, from public/brand/entities).
const LOGO_FIT = {
  moi: { h: 50, r: 0.729 },
  mc: { h: 38, r: 3.008 },
  ksu: { h: 42, r: 2.718 },
  moj: { h: 42, r: 2.679 },
  kau: { h: 50, r: 0.817 },
};

function TrustLogos() {
  return (
    <ul className="dh-logos" aria-label={`${TRUSTED_LOGOS.lead} ${TRUSTED_LOGOS.emphasis}`}>
      {TRUSTED_LOGOS.items.map((it) => {
        const slug = it.src.split("/").pop().replace(/\.\w+$/, "");
        const fit = LOGO_FIT[slug] || { h: 40, r: 1 };
        const w = Math.round(fit.h * fit.r);
        return (
          <li key={it.name} style={{ "--h": `${fit.h}px`, "--w": `${w}px` }}>
            <img
              className="dh-logo-mono"
              src={`/brand/entities/mono-lg/${slug}.webp`}
              srcSet={`/brand/entities/mono-lg/${slug}.webp 1x, /brand/entities/mono-lg/${slug}@2x.webp 2x`}
              alt={it.name}
              title={it.name}
              width={w}
              height={fit.h}
              decoding="async"
              fetchpriority="low"
            />
            <img
              className="dh-logo-color"
              src={`/brand/entities/color/${slug}.webp`}
              srcSet={`/brand/entities/color/${slug}.webp 1x, /brand/entities/color/${slug}@2x.webp 2x`}
              alt=""
              aria-hidden="true"
              width={w}
              height={fit.h}
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
          </li>
        );
      })}
    </ul>
  );
}

/* Three UI cards around the phone. Illustrative, like any app screenshot. */
function Cards() {
  return (
    <>
      <div className="dh-card dh-card--a" style={{ "--k": 0 }}>
        <span className="dh-ring" style={{ "--v": 87 }}>
          <svg viewBox="0 0 36 36" width="36" height="36" focusable="false">
            <circle cx="18" cy="18" r="15" />
            <circle cx="18" cy="18" r="15" />
          </svg>
        </span>
        <span className="dh-card-txt">
          <span className="dh-card-k">تقييم نطقك</span>
          <span className="dh-card-v"><bdi>87%</bdi></span>
        </span>
      </div>
      <div className="dh-card dh-card--b" style={{ "--k": 1 }}>
        <span className="dh-card-ico dh-card-ico--sky">
          <svg viewBox="0 0 24 24" width="18" height="18" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" /></svg>
        </span>
        <span className="dh-card-txt">
          <span className="dh-card-v"><bdi>32</bdi> كلمة جديدة</span>
          <span className="dh-card-k">هالأسبوع</span>
        </span>
      </div>
      <div className="dh-card dh-card--c" style={{ "--k": 2 }}>
        <span className="dh-card-ico dh-card-ico--dawn">
          <svg viewBox="0 0 24 24" width="18" height="18" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>
        </span>
        <span className="dh-card-txt">
          <span className="dh-card-k">لقاؤك المبدئي</span>
          <span className="dh-card-v">الأحد · <bdi>8</bdi> م</span>
        </span>
      </div>
    </>
  );
}

export default function DawnHero() {
  const ref = useRef(null);
  const sceneRef = useRef(null);

  // `--p` (0 → 1 as the hero scrolls away) — the header's backdrop and a little depth.
  useEffect(() => track(ref.current, { mode: "hero" }), []);

  // Mouse parallax: desktop with a real pointer only, never with reduced motion. ≤ 10 px.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !window.matchMedia) return undefined;
    const ok = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      scene.style.setProperty("--mx", x.toFixed(3));
      scene.style.setProperty("--my", y.toFixed(3));
    };
    const onMove = (e) => {
      if (!ok.matches || rm.matches || document.documentElement.getAttribute("data-fx-tier") === "low") return;
      x = (e.clientX / window.innerWidth) * 2 - 1;
      y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const seeInside = (e) => {
    e.preventDefault();
    document.getElementById("fx-platform")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [l1, l2] = HERO_LINES_HOME;

  return (
    <section id="fx-top" ref={ref} className="dh">
      <div className="dh-sky" aria-hidden="true">
        <div className="dh-stars" />
        <div className="dh-glow" />
        <div className="dh-horizon" />
        <div className="dh-grain" />
      </div>

      <div className="dh-copy">
        <h1 className="dh-title">
          <span className="dh-l"><span className="dh-l-in">{l1.text}</span></span>{" "}
          <span className="dh-l"><span className="dh-l-in dh-grad">{l2.text}</span></span>
        </h1>
        <p className="dh-sub dh-after">{HERO.lead}</p>
        <div className="dh-actions dh-after">
          <a href={bookingHref()} data-open-form className="fx-btn fx-btn--primary dh-cta">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </a>
          <a href="#fx-platform" className="dh-link" onClick={seeInside}>
            {SEE_INSIDE}
          </a>
        </div>
        <a href="/level-test?src=site_home" className="dh-level dh-after">
          أو اختبر مستواك مجاناً
          <span aria-hidden="true">←</span>
        </a>
        <div className="dh-trust dh-after">
          <p className="dh-note">{HERO_TRUST}</p>
          <TrustLogos />
        </div>
      </div>

      <div className="dh-scene" ref={sceneRef}>
        <div className="dh-depth dh-depth--sun">
          <DawnSun id="dsh" className="dh-sun" />
        </div>
        <div className="dh-depth dh-depth--phone">
          <figure className="dh-phone">
            <span className="dh-phone-island" aria-hidden="true" />
            <picture>
              <source type="image/avif" srcSet="/home/dawn/plan-400.avif 400w, /home/dawn/plan-600.avif 600w" sizes="(min-width: 1024px) 272px, 196px" />
              <img
                src="/home/dawn/plan-600.webp"
                srcSet="/home/dawn/plan-400.webp 400w, /home/dawn/plan-600.webp 600w"
                sizes="(min-width: 1024px) 272px, 196px"
                width="600"
                height="1298"
                alt="خطة اليوم في منصّة طلاقة: وقت كل مهارة وما تبقّى منها"
                decoding="async"
              />
            </picture>
          </figure>
        </div>
        <div className="dh-depth dh-depth--cards" aria-hidden="true">
          <Cards />
        </div>
      </div>
    </section>
  );
}
