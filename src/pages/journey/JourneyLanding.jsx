import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import "../v5/V5Hero.css";
// Inlined into the prerendered markup, not linked: a lazy route's stylesheet
// only arrives with its JavaScript, and the page would paint unstyled first.
import JOURNEY_CSS from "./journey.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { JourneyContext } from "./context";
import { detectTier, forcedTier, tierConfig, writeStore, TIER_KEY } from "./perf";
import { loadGsap, startLenis, finePointer } from "./motion";
import Preloader from "./Preloader";
import Header from "./Header";
import Hero from "./Hero";
import LineLayer from "./LineLayer";
import Day from "./Day";
import FirstWord from "./FirstWord";
import Route from "./Route";
import Sea from "./Sea";
import Arrival from "./Arrival";
import Below from "./Below";
import Cursor from "./Cursor";

/**
 * /journey — «رحلة صوتك», one continuous journey (noindex, unlinked, not in
 * the sitemap). The homepage at `/` is untouched.
 *
 * The protagonist is the visitor's voice: one sky-blue line that starts silent
 * and ends as a full waveform, carried through seven legs —
 *   0 void → 1 night globe → 2 fall into day → 3 the first word (phone)
 *   → 4 the road → 5 a sea of voices at night → 6 gold arrival → 7 below.
 * Every leg reads the same line state (line.js), and every hand-off happens
 * where the last leg left the line.
 *
 * Every primary action is the homepage's `[data-open-form]` → V1LeadModal
 * (TikTok / GA4 / Supabase / WhatsApp); pricing, FAQ and footer are the
 * homepage components. Three performance tiers (perf.js); reduced motion = low.
 */

/*
 * Boot — an inline script in the prerendered markup, run BEFORE the hero is
 * parsed, so the first paint already knows:
 *   · html.jn-js        JS is on: reveal states may start hidden
 *   · html.jn-intro     the preloader plays (first visit, not low, not reduced motion)
 *   · [data-jn-tier]    a forced tier (?tier=, the footer control) or low for
 *                       reduced motion / save-data
 * If the bundle never arrives, the classes come off after 9 s and the page
 * shows everything, still. ?intro=1 replays the intro. ES5: in-app browsers.
 */
function boot() {
  try {
    var d = document.documentElement;
    if (d.getAttribute("data-jn-boot")) return;
    d.setAttribute("data-jn-boot", "1");
    var q = new URLSearchParams(window.location.search);
    var t = q.get("tier");
    var s = null;
    var seen = null;
    try {
      s = window.localStorage.getItem("fl-perf-tier");
      seen = window.localStorage.getItem("fl-journey-intro");
    } catch (e) {
      /* storage blocked */
    }
    var ok = function (v) {
      return v === "low" || v === "medium" || v === "high";
    };
    if (!ok(t)) t = ok(s) ? s : null;
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var sd = navigator.connection && navigator.connection.saveData;
    if (!t && (rm || sd)) t = "low";
    if (t) d.setAttribute("data-jn-tier", t);
    d.classList.add("jn-js");
    if (t !== "low" && !rm && (!seen || q.get("intro") === "1")) {
      d.classList.add("jn-intro");
      try {
        window.localStorage.setItem("fl-journey-intro", "1");
      } catch (e) {
        /* storage blocked: the intro plays again next time */
      }
    }
    setTimeout(function () {
      if (!window.__jnReady) {
        d.classList.remove("jn-js");
        d.classList.remove("jn-intro");
      }
    }, 9000);
  } catch (e) {
    /* never block the page */
  }
}
const BOOT = `(${boot.toString()})();`;

if (typeof window !== "undefined") boot();

export default function JourneyLanding() {
  const rootRef = useRef(null);
  const [tier, setTier] = useState(null);
  const [mode, setMode] = useState("auto");
  const [font, setFont] = useState(null);
  const [fx, setFx] = useState(null);
  const [intro, setIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // Tier: the boot guess first, then the real probe.
  useEffect(() => {
    boot();
    window.__jnReady = true;
    window.__jnMounted = (window.__jnMounted || 0) + 1;
    const d = document.documentElement;
    const pre = d.getAttribute("data-jn-tier");
    if (pre) setTier(pre);
    const playing = d.classList.contains("jn-intro");
    setIntro(playing);
    if (!playing) setIntroDone(true);
    let stored = null;
    try {
      stored = window.localStorage.getItem(TIER_KEY);
    } catch {
      /* storage blocked */
    }
    if (stored === "high" || stored === "low") setMode(stored);
    const f = new URLSearchParams(window.location.search).get("font");
    if (f === "kufam" || f === "lalezar") setFont(f);
    let alive = true;
    detectTier().then((t) => alive && setTier(t));
    return () => {
      alive = false;
      window.__jnMounted -= 1;
      // Only a real unmount clears the page state — not StrictMode's remount.
      setTimeout(() => {
        if (window.__jnMounted > 0) return;
        window.__jnReady = false;
        d.classList.remove("jn-js", "jn-intro", "jn-intro-done", "jn-cursor-on");
        d.removeAttribute("data-jn-tier");
        d.removeAttribute("data-jn-boot");
      }, 0);
    };
  }, []);

  useEffect(() => {
    if (tier) document.documentElement.setAttribute("data-jn-tier", tier);
  }, [tier]);

  const cfg = useMemo(() => (tier ? tierConfig(tier) : null), [tier]);

  // The motion stack: after first paint, never on the low tier.
  useEffect(() => {
    if (!cfg || !cfg.webgl) {
      setFx(null);
      return undefined;
    }
    let alive = true;
    loadGsap().then((m) => alive && setFx(m));
    return () => {
      alive = false;
    };
  }, [cfg]);

  // Lenis: fine pointers only (touch keeps native scroll and its momentum).
  useEffect(() => {
    if (!fx || !finePointer()) return undefined;
    let stop = null;
    let alive = true;
    startLenis(fx).then((s) => {
      if (alive) stop = s;
      else s();
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, [fx]);

  // Every giant title (the hero's waits for the preloader) rises once, by word.
  useEffect(() => {
    if (!fx) return undefined;
    const { gsap, ScrollTrigger } = fx;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".jn-giant:not(.jn-hero-title)").forEach((g) => {
        gsap.fromTo(
          g.querySelectorAll(".jn-wi"),
          { yPercent: 110, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: { trigger: g, start: "top 88%", once: true },
          }
        );
      });
    }, rootRef.current);
    const r = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(r);
      ctx.revert();
    };
  }, [fx]);

  // The header takes the colours of the leg under it.
  useEffect(() => {
    const head = document.querySelector(".jn-head");
    if (!head) return undefined;
    // the innermost zone under the header wins (the route's navy wash is a
    // night zone nested inside the day route)
    const zones = [...rootRef.current.querySelectorAll("[data-theme]")].filter((el) => !el.closest(".jn-head"));
    let raf = 0;
    const tick = () => {
      raf = 0;
      let theme = "night";
      for (const el of zones) {
        const r = el.getBoundingClientRect();
        if (r.top <= 32 && r.bottom > 32) theme = el.getAttribute("data-theme") || theme;
      }
      if (head.getAttribute("data-theme") !== theme) head.setAttribute("data-theme", theme);
      head.toggleAttribute("data-solid", window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // After a tier change the layout changes height: re-measure every trigger.
  useEffect(() => {
    if (!fx) return undefined;
    const r = requestAnimationFrame(() => fx.ScrollTrigger.refresh());
    return () => cancelAnimationFrame(r);
  }, [fx, tier]);

  const dropToLow = useCallback(() => setTier("low"), []);

  const onMode = useCallback((v) => {
    setMode(v);
    if (v === "auto") {
      writeStore(TIER_KEY, null);
      detectTier().then(setTier);
    } else {
      writeStore(TIER_KEY, v);
      setTier(forcedTier() || v);
    }
  }, []);

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
    document.documentElement.classList.remove("jn-intro");
  }, []);

  // What the preloader's counter waits for: real loading, not a timer.
  const sources = useMemo(() => {
    if (typeof window === "undefined") return [];
    return [
      loadGsap(),
      import("./gl/globe"),
      new Promise((res) => {
        window.__jnGlobeReady = res;
        setTimeout(res, 1500);
      }),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ];
  }, [intro]);

  const ctx = useMemo(() => ({ cfg, fx, introDone, dropToLow }), [cfg, fx, introDone, dropToLow]);

  return (
    <MotionConfig reducedMotion="user">
      <JourneyContext.Provider value={ctx}>
        <div ref={rootRef} className="v1-scope v5-scope jn" dir="rtl" data-font={font || undefined}>
          <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOT }} />
          <style dangerouslySetInnerHTML={{ __html: JOURNEY_CSS }} />
          <Seo path="/journey" />
          <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap" />
            {font === "kufam" ? (
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kufam:wght@800;900&display=swap" />
            ) : null}
            {font === "lalezar" ? (
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap" />
            ) : null}
          </Helmet>

          <Preloader active={intro && !introDone} sources={sources} onDone={onIntroDone} />
          <Header />
          {cfg && cfg.webgl ? <LineLayer /> : null}

          <main className="jn-main">
            <Hero />
            <Day />
            <FirstWord />
            <Route />
            <Sea />
            <Arrival />
          </main>
          <Below mode={mode} onMode={onMode} />

          <Cursor />
          <V1LeadModal />
        </div>
      </JourneyContext.Provider>
    </MotionConfig>
  );
}
