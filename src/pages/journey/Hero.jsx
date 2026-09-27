import { useEffect, useRef } from "react";
import { HERO } from "../landing-v2/content";
import { glueAr } from "../v5/V5HeroShowcase";
import Giant from "./Giant";
import { useJourney } from "./context";
import { CTA_LABEL, START_LINK, TITLES } from "./copy";
import { scrollToEl } from "./motion";
import { reducedMotion } from "./line";
import globeDesk from "./stills/globe-d.webp";
import globePhone from "./stills/globe-m.webp";

/**
 * Legs 1 + 2a — the night globe, then the fall through its atmosphere into day.
 *
 * One tall section with a sticky stage (compositor-driven on iOS, no pin
 * spacer, no layout jump when the script arrives). While the stage is held,
 * scrolling dollies the camera into the Gulf and a glow wash runs
 * navy → sky → ice-white; the header flips to ink as the white arrives.
 * The low tier gets the rendered still and no dive (the section is one screen).
 */
// «من أول كلمة» / «إلى الطلاقة» — two lines on a phone, one elsewhere.
const HERO_LINE_2 = (() => {
  const w = TITLES.hero[1].split(" ");
  return [w.slice(0, 3).join(" "), w.slice(3).join(" ")];
})();

export default function Hero() {
  const { cfg, fx, introDone, dropToLow } = useJourney();
  const secRef = useRef(null);
  const canvasRef = useRef(null);
  const tagsRef = useRef(null);
  const copyRef = useRef(null);
  const washRef = useRef(null);
  const whiteRef = useRef(null);
  const globeRef = useRef(null);
  const webgl = Boolean(cfg && cfg.webgl);

  // The globe: loaded after first paint, only above the low tier.
  useEffect(() => {
    if (!webgl) return undefined;
    let alive = true;
    let globe = null;
    let io = null;
    let onVis = null;
    let onResize = null;
    import("./gl/globe").then(({ createGlobe }) => {
      if (!alive || !canvasRef.current) return;
      try {
        globe = createGlobe(canvasRef.current, {
          cfg,
          labels: tagsRef.current,
          onLost: dropToLow,
          reduced: reducedMotion(),
        });
      } catch {
        dropToLow();
        return;
      }
      globeRef.current = globe;
      window.__jnGlobeReady?.();
      secRef.current?.setAttribute("data-gl", "");
      let inView = true;
      const sync = () => (inView && document.visibilityState === "visible" ? globe.start() : globe.stop());
      io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        sync();
      });
      io.observe(secRef.current);
      onVis = sync;
      document.addEventListener("visibilitychange", onVis);
      onResize = () => globe.resize();
      window.addEventListener("resize", onResize);
      sync();
    });
    return () => {
      alive = false;
      io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      if (onResize) window.removeEventListener("resize", onResize);
      globe?.dispose();
      globeRef.current = null;
    };
  }, [webgl, cfg, dropToLow]);

  // The dive: scrubbed by the section's scroll.
  useEffect(() => {
    if (!fx || !webgl) return undefined;
    const { ScrollTrigger } = fx;
    const sec = secRef.current;
    const head = () => document.querySelector(".jn-head");
    const apply = (p) => {
      globeRef.current?.setDive(p);
      const c = copyRef.current;
      if (c) {
        const k = Math.min(1, p / 0.22);
        c.style.opacity = String(1 - k);
        c.style.transform = `translate3d(0, ${-k * 12}vh, 0)`;
        c.style.visibility = k >= 1 ? "hidden" : "";
      }
      const wash = washRef.current;
      const white = whiteRef.current;
      const a = Math.min(1, Math.max(0, (p - 0.3) / 0.3));
      const w = Math.min(1, Math.max(0, (p - 0.58) / 0.34));
      if (wash) wash.style.opacity = a.toFixed(3);
      if (white) {
        white.style.opacity = Math.min(1, w * 1.4).toFixed(3);
        white.style.setProperty("--r", `${(w * 120).toFixed(1)}%`);
      }
      sec.setAttribute("data-theme", p > 0.72 ? "day" : "night");
      head()?.toggleAttribute("data-dive", p > 0.02);
    };
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);
    return () => st.kill();
  }, [fx, webgl]);

  // The headline rises once the preloader has handed over.
  useEffect(() => {
    if (!fx || !introDone) return undefined;
    const { gsap } = fx;
    const words = secRef.current.querySelectorAll(".jn-hero-title .jn-wi");
    const rest = secRef.current.querySelectorAll(".jn-hero-rise");
    const ctx = gsap.context(() => {
      gsap.fromTo(words, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: 0.05 });
      gsap.fromTo(rest, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.45 });
    });
    return () => ctx.revert();
  }, [fx, introDone]);

  return (
    <section id="jn-top" ref={secRef} className="jn-hero" data-theme="night" data-leg="1" aria-labelledby="jn-hero-title">
      <div className="jn-hero-stage">
        <picture className="jn-hero-still" aria-hidden="true">
          <source media="(max-aspect-ratio: 4/5)" srcSet={globePhone} />
          <img src={globeDesk} alt="" decoding="async" fetchpriority="low" />
        </picture>
        <canvas ref={canvasRef} className="jn-globe" aria-hidden="true" />
        <div ref={tagsRef} className="jn-tags" aria-hidden="true" />

        <div ref={copyRef} className="jn-hero-copy">
          <Giant id="jn-hero-title" as="h1" className="jn-hero-title" lines={[TITLES.hero[0], HERO_LINE_2]} tones={["cream", "ice"]} />
          <p className="jn-hero-sub">{glueAr(HERO.sub)}</p>
          <div className="jn-hero-actions jn-hero-rise">
            <button type="button" data-open-form className="jn-btn jn-btn--primary jn-btn--lg">
              {CTA_LABEL}
              <span aria-hidden="true">←</span>
            </button>
            <a
              href="#jn-day"
              className="jn-quiet"
              onClick={(e) => {
                e.preventDefault();
                scrollToEl(document.getElementById("jn-day"));
              }}
            >
              {START_LINK}
              <span aria-hidden="true" className="jn-quiet-arrow">↓</span>
            </a>
          </div>
        </div>

        <div ref={washRef} className="jn-wash" aria-hidden="true" />
        <div ref={whiteRef} className="jn-white" aria-hidden="true" />
      </div>
    </section>
  );
}
