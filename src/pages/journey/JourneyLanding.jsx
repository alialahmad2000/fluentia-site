import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import "../v5/V5Hero.css";
// Inlined into the prerendered markup: a lazy route's stylesheet only arrives
// with its JavaScript, and the page would paint unstyled first.
import JOURNEY_CSS from "./journey.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { MobileCtaBar } from "../v1/V1Interactive";
import { JourneyContext } from "./context";
import { decideTier, tierConfig, writeStore, TIER_KEY } from "./perf";
import { loadGsap, startLenis, finePointer } from "./motion";
import { initViewport, relayout, onLayout } from "./core/viewport";
import VoiceLayer from "./core/VoiceLayer";
import * as gl from "./gl/manager";
import Intro from "./legs/Intro";
import Header from "./Header";
import Hero from "./legs/Hero";
import Day from "./legs/Day";
import FirstWord from "./legs/FirstWord";
import YourVoice from "./legs/YourVoice";
import Road from "./legs/Road";
import Sea from "./legs/Sea";
import Arrival from "./legs/Arrival";
import Closing from "./legs/Closing";
import Cursor from "./Cursor";

/**
 * /journey — «رحلة صوتك» (noindex, unlinked, not in the sitemap).
 *
 * The protagonist is the visitor's voice: one sky line, and in the middle of
 * the journey it is literally their voice — they say (or type) one sentence,
 * the line moves with their microphone, and the real product answers.
 *
 *   night globe → the fall → day, silence → the first word (a phone lowered
 *   like a crane load lifts the line) → your voice (live) → the road
 *   (how it works, the founder, a fork: for you / not yet) → a sea of voices
 *   at night (who is already here) → a gold horizon (arrival, the offer) →
 *   pricing → before you start → the map home.
 *
 * Every primary action is the homepage's `[data-open-form]` → V1LeadModal;
 * pricing / FAQ / footer are the homepage components.
 */

/*
 * Boot — inline, before the hero is parsed. Decides everything the first paint
 * needs, synchronously, once:
 *   · --jn-vh            the viewport height, frozen (every pinned length uses it)
 *   · [data-jn-tier]     low | medium | high — renderers only, never layout
 *   · html.jn-js         JS is on: reveal states may start hidden
 *   · html.jn-intro      the intro plays: fine pointer, not in-app, first visit
 * If the bundle never arrives the classes come off after 3 s. ES5 on purpose.
 */
function boot() {
  try {
    var d = document.documentElement;
    if (d.getAttribute("data-jn-boot")) return;
    d.setAttribute("data-jn-boot", "1");
    window.__jnVH = window.innerHeight;
    d.style.setProperty("--jn-vh", window.innerHeight + "px");
    // the tallest viewport (toolbar collapsed): what every fixed canvas is sized to
    var pr = document.createElement("div");
    pr.style.cssText = "position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none";
    (document.body || d).appendChild(pr);
    window.__jnLVH = pr.offsetHeight;
    pr.parentNode.removeChild(pr);
    var q = new URLSearchParams(window.location.search);
    var ok = function (v) {
      return v === "low" || v === "medium" || v === "high";
    };
    var t = q.get("tier");
    var s = null;
    var seen = null;
    try {
      s = window.localStorage.getItem("fl-perf-tier");
      seen = window.localStorage.getItem("fl-journey-intro");
    } catch (e) {
      /* storage blocked */
    }
    var mm = function (m) {
      return window.matchMedia && window.matchMedia(m).matches;
    };
    var inApp = /TikTok|musical_ly|Bytedance|Instagram|FBAN|FBAV|Snapchat/i.test(navigator.userAgent);
    var rm = mm("(prefers-reduced-motion: reduce)");
    if (!ok(t)) t = ok(s) ? s : null;
    if (!t) {
      if (rm || (navigator.connection && navigator.connection.saveData)) t = "low";
      else if (inApp || mm("(pointer: coarse)")) t = "medium";
      else t = "high";
    }
    d.setAttribute("data-jn-tier", t);
    if (rm) d.classList.add("jn-rm");
    d.classList.add("jn-js");
    d.classList.add("jn-page");
    if (t !== "low" && !rm && mm("(pointer: fine)") && !inApp && (!seen || q.get("intro") === "1")) {
      d.classList.add("jn-intro");
      try {
        window.localStorage.setItem("fl-journey-intro", "1");
      } catch (e) {
        /* storage blocked */
      }
    }
    setTimeout(function () {
      if (!window.__jnReady) {
        d.classList.remove("jn-js");
        d.classList.remove("jn-intro");
      }
    }, 3000);
  } catch (e) {
    /* never block the page */
  }
}
const BOOT = `(${boot.toString()})();`;

if (typeof window !== "undefined") boot();

function GLCanvas({ cfg }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!cfg?.webgl) return undefined;
    gl.attach(ref.current, cfg);
    return () => gl.detach();
  }, [cfg]);
  return <canvas ref={ref} className="jn-gl" aria-hidden="true" />;
}

export default function JourneyLanding() {
  const rootRef = useRef(null);
  const [tier, setTier] = useState(null);
  const [mode, setMode] = useState("auto");
  const [font, setFont] = useState(null);
  const [fx, setFx] = useState(null);
  const [intro, setIntro] = useState(false);
  const [introDone, setIntroDone] = useState(true);
  const [glAlive, setGlAlive] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    boot();
    window.__jnReady = true;
    window.__jnMounted = (window.__jnMounted || 0) + 1;
    const d = document.documentElement;
    setTier(d.getAttribute("data-jn-tier") || decideTier());
    setReduce(d.classList.contains("jn-rm"));
    const playing = d.classList.contains("jn-intro");
    setIntro(playing);
    setIntroDone(!playing);
    let stored = null;
    try {
      stored = window.localStorage.getItem(TIER_KEY);
    } catch {
      /* storage blocked */
    }
    if (stored === "high" || stored === "low") setMode(stored);
    const f = new URLSearchParams(window.location.search).get("font");
    if (f === "kufam" || f === "lalezar") setFont(f);
    const offVp = initViewport();
    const offGl = gl.onGLState((s) => setGlAlive(s !== "lost"));
    document.fonts?.ready.then(relayout);
    return () => {
      offVp();
      offGl();
      window.__jnMounted -= 1;
      // only a real unmount clears the page state — not StrictMode's remount
      setTimeout(() => {
        if (window.__jnMounted > 0) return;
        window.__jnReady = false;
        d.classList.remove("jn-js", "jn-intro", "jn-intro-done", "jn-cursor-on", "jn-page", "jn-rm");
        d.removeAttribute("data-jn-tier");
        d.removeAttribute("data-jn-boot");
        d.removeAttribute("data-jn-gl");
        d.style.removeProperty("--jn-vh");
      }, 0);
    };
  }, []);

  const cfg = useMemo(() => (tier ? tierConfig(tier) : null), [tier]);

  // the motion stack (text reveals) on every tier except reduced motion
  useEffect(() => {
    if (!cfg || reduce) return undefined;
    let alive = true;
    loadGsap().then((m) => alive && setFx(m));
    return () => {
      alive = false;
    };
  }, [cfg, reduce]);

  // Lenis on fine pointers only (touch keeps native momentum)
  useEffect(() => {
    if (!fx || !finePointer() || cfg?.tier === "low") return undefined;
    let stop = null;
    let alive = true;
    startLenis(fx).then((s) => (alive ? (stop = s) : s()));
    return () => {
      alive = false;
      stop?.();
    };
  }, [fx, cfg]);

  // every giant title (not the hero's, not the scrubbed ones) rises once, by word
  useEffect(() => {
    if (!fx) return undefined;
    const { gsap } = fx;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".jn-giant:not(.jn-hero-title):not(.jn-scrubbed)").forEach((g) => {
        gsap.fromTo(
          g.querySelectorAll(".jn-wi"),
          { yPercent: 110, y: 0 },
          { yPercent: 0, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: g, start: "top 88%", once: true } }
        );
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, [fx]);

  // the header takes the colours of the innermost zone under it
  useEffect(() => {
    const head = document.querySelector(".jn-head");
    if (!head) return undefined;
    // zones measured on layout; each frame only compares numbers
    let zones = [];
    const measure = () => {
      zones = [...rootRef.current.querySelectorAll("[data-theme]")]
        .filter((el) => !el.closest(".jn-head"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, sticky: el.classList.contains("jn-stage") };
        });
    };
    measure();
    const offLayout = onLayout(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(rootRef.current);
    let raf = 0;
    let lastTheme = "";
    let lastSolid = null;
    const tick = () => {
      raf = 0;
      const y = window.scrollY + 34;
      let theme = "night";
      for (const z of zones) if (z.top <= y && z.bottom > y) theme = z.el.getAttribute("data-theme") || theme;
      if (theme !== lastTheme) {
        head.setAttribute("data-theme", theme);
        lastTheme = theme;
      }
      const solid = window.scrollY > 40;
      if (solid !== lastSolid) {
        head.toggleAttribute("data-solid", solid);
        lastSolid = solid;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // the hero flips its own theme mid-pin: re-read it on scroll (attribute, not layout)
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      offLayout();
      ro.disconnect();
    };
  }, []);

  const onMode = useCallback((v) => {
    setMode(v);
    writeStore(TIER_KEY, v === "auto" ? null : v);
    // renderers, stills and chunks all follow from the tier: start clean
    window.location.reload();
  }, []);

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
    document.documentElement.classList.remove("jn-intro");
    document.documentElement.classList.add("jn-intro-done");
  }, []);

  const ctx = useMemo(() => ({ cfg, fx, introDone, reduce, glAlive }), [cfg, fx, introDone, reduce, glAlive]);

  return (
    <MotionConfig reducedMotion="user">
      <JourneyContext.Provider value={ctx}>
        <div ref={rootRef} className="v1-scope v5-scope jn" dir="rtl" data-font={font || undefined}>
          <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOT }} />
          <style dangerouslySetInnerHTML={{ __html: JOURNEY_CSS }} />
          <link rel="preload" href="/fonts/barlow-condensed-800-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
          <Seo path="/journey" />
          <Helmet>
            {font === "kufam" ? <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kufam:wght@800;900&display=swap" /> : null}
            {font === "lalezar" ? <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap" /> : null}
          </Helmet>

          <GLCanvas cfg={cfg} />
          <VoiceLayer />
          <Intro active={intro && !introDone} onDone={onIntroDone} />
          <Header />

          <main className="jn-main">
            <Hero />
            <Day />
            <FirstWord />
            <YourVoice />
            <Road />
            <Sea />
            <Arrival />
          </main>
          <Closing mode={mode} onMode={onMode} />

          <Cursor />
          <MobileCtaBar />
          <V1LeadModal />
        </div>
      </JourneyContext.Provider>
    </MotionConfig>
  );
}
