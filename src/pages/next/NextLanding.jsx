import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import "../v5/V5Hero.css";
// Inlined into the markup, not linked: this route is a lazy chunk, and a chunk's
// stylesheet only arrives with its JavaScript — the prerendered page would paint
// unstyled for a second and then jump (measured: CLS 0.53 on a throttled phone).
import NEXT_CSS from "./next.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { CtaContext } from "../v1/ctaContext";
import LeadForm from "../join/components/LeadForm";
import { TIERS } from "../join/joinContent";
// The /join form card's own styles (its j-* classes live under .join-page).
import JOIN_CSS from "../join/join.css?inline";
import { detectTier, forcedTier, tierConfig, writeStore, TIER_KEY } from "./perf";
import Starfield from "./Starfield";
import Intro from "./Intro";
import Header from "./Header";
import Hero from "./Hero";
import PhoneSection from "./PhoneSection";
import { Pains, How, Stats } from "./Acts";
import Stage from "./Stage";
import { Pricing, FitFaq, Final, Footer } from "./Closing";
import { CTA_LABEL } from "./copy";

/**
 * The cinematic landing — the homepage at `/` and, in campaign mode, the TikTok
 * landing at `/join` (since 2026-09-27; the switch is HOME_VARIANT / JOIN_VARIANT
 * in src/App.jsx, and /next now 301s to /).
 *
 * On `/` every primary action is the old homepage's own `[data-open-form]` →
 * V1LeadModal (same TikTok / GA4 / Supabase / WhatsApp flow); on `/join` it is
 * /join's LeadForm. Pricing, fit, FAQ and the footer are the homepage components.
 *
 * Motion lives in a handful of places — the intro, the planet, the headline
 * reveals, the phone, the sticky titles, the stage — and everything else is
 * still. One scroll loop (scroll.js) feeds `--p` to CSS; one observer reveals
 * `.fx-rv` once. Three performance tiers (perf.js); reduced motion = low.
 */

/*
 * Boot — runs as an inline script inside the prerendered markup, BEFORE the
 * hero is parsed, so the first paint already knows:
 *   · html.fx-js         JS is on: reveal states may start hidden
 *   · html.fx-intro      the intro plays (first visit, not low tier, not reduced motion)
 *   · [data-fx-tier]     a forced tier (?tier=, the footer control) or low for
 *                        reduced motion / save-data
 * If the bundle never arrives, the classes come off after 9 s and the page
 * shows everything, still. ?intro=1 replays the intro.
 * ES5 on purpose: it runs in whatever in-app browser a TikTok ad opens.
 */
function boot() {
  try {
    var d = document.documentElement;
    if (d.getAttribute("data-fx-boot")) return;
    d.setAttribute("data-fx-boot", "1");
    var q = new URLSearchParams(window.location.search);
    var t = q.get("tier");
    var s = null;
    var seen = null;
    try {
      s = window.localStorage.getItem("fl-perf-tier");
      seen = window.localStorage.getItem("fl-intro-seen");
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
    if (t) d.setAttribute("data-fx-tier", t);
    d.classList.add("fx-js");
    // Paid traffic lands on /join and sees the hero at once: no intro there.
    var camp = /^\/join\/?$/.test(window.location.pathname);
    if (!camp && t !== "low" && !rm && (!seen || q.get("intro") === "1")) {
      d.classList.add("fx-intro");
      try {
        window.localStorage.setItem("fl-intro-seen", "1");
      } catch (e) {
        /* storage blocked: the intro plays again next time */
      }
    }
    setTimeout(function () {
      if (!window.__fxReady) {
        d.classList.remove("fx-js");
        d.classList.remove("fx-intro");
      }
    }, 9000);
  } catch (e) {
    /* never block the page */
  }
}
const BOOT = `(${boot.toString()})();`;

/* The /join form card inside /next's ground: centred, clear of the fixed header. */
const FORM_BLOCK_CSS = `
.fx-next .fx-joinform { display: flex; justify-content: center; padding: clamp(96px, 16vh, 180px) var(--fx-gut, 20px) 0; }
.fx-next .fx-joinform .j-card { position: relative; z-index: 2; }
/* The hero's sub line is the page's LCP element on a phone, and an element is
   not counted while its opacity is 0: its delayed fade cost /join ~1.5 s of LCP
   on a throttled phone (measured live). Paid traffic gets it at once. */
html.fx-js .fx-next[data-campaign] .fx-hero-sub.fx-hero-after { animation: none; opacity: 1; }
`;

// Client-only renders (dev, or arriving by in-app navigation) get no inline
// script execution, so boot runs as the chunk loads — still before first render.
if (typeof window !== "undefined") boot();

const TIER_IDS = new Set(TIERS.map((t) => t.id));
const CAMPAIGN_CTA = { label: CTA_LABEL };

/**
 * `seoPath`  — the PAGE_SEO entry to emit ("/" when this is the homepage).
 * `campaign` — /join, the TikTok landing: no intro, and every `[data-open-form]`
 *   leads to /join's own lead form (LeadForm → submitLead, source 'join_page',
 *   unchanged) instead of the homepage modal; pricing buttons preselect their
 *   package. Homepage components read CtaContext and drop links that would
 *   leave the page.
 */
export default function NextLanding({ seoPath = "/next", campaign = false }) {
  const rootRef = useRef(null);
  const [tier, setTier] = useState(null);
  const [mode, setMode] = useState("auto");
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    boot();
    window.__fxReady = true;
    const d = document.documentElement;
    const pre = d.getAttribute("data-fx-tier");
    if (pre) setTier(pre);
    let stored = null;
    try {
      stored = window.localStorage.getItem(TIER_KEY);
    } catch {
      /* storage blocked */
    }
    if (stored === "high" || stored === "low") setMode(stored);
    let alive = true;
    detectTier().then((t) => alive && setTier(t));
    return () => {
      alive = false;
      window.__fxReady = false;
      d.classList.remove("fx-js", "fx-intro", "fx-intro-done", "fx-skip");
      d.removeAttribute("data-fx-tier");
      d.removeAttribute("data-fx-boot");
    };
  }, []);

  useEffect(() => {
    if (tier) document.documentElement.setAttribute("data-fx-tier", tier);
  }, [tier]);

  // One observer reveals every `.fx-rv` once, at 20% visible. Never replays.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".fx-rv");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onIntroDone = useCallback(() => setIntroDone(true), []);

  // ── campaign mode: the /join lead form ──
  const [pkgId, setPkgId] = useState("");
  const nameRef = useRef(null);
  const formRef = useRef(null);

  const goToForm = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const focusName = () => nameRef.current?.focus({ preventScroll: true });
    if (reduce) {
      el.scrollIntoView({ block: "start" });
      focusName();
      return;
    }
    // Focus once the smooth scroll lands (scrollend), with a timer for browsers without it.
    let done = false;
    const land = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", land);
      focusName();
    };
    window.addEventListener("scrollend", land);
    window.setTimeout(land, 1600);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!campaign) return undefined;
    const onClick = (e) => {
      const trigger = e.target.closest?.("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      const t = trigger.getAttribute("data-tier");
      if (t && TIER_IDS.has(t)) setPkgId(t);
      goToForm();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [campaign, goToForm]);

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

  const cfg = tier ? tierConfig(tier) : null;
  // The intro can start before the probe finishes; it only ever runs above the low tier.
  const introCfg = tierConfig(tier && tier !== "low" ? tier : "medium");

  return (
    <MotionConfig reducedMotion="user">
     <CtaContext.Provider value={campaign ? CAMPAIGN_CTA : null}>
      <div ref={rootRef} className="v1-scope v5-scope fx-next" dir="rtl" data-campaign={campaign ? "" : undefined}>
        {/* The client and server bundles may stringify boot() differently; the
            script has already run by the time React hydrates it. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOT }} />
        <style dangerouslySetInnerHTML={{ __html: NEXT_CSS }} />
        {/* Kufam is the display face: fetched while the HTML parses, before the
            giant type needs it (Kufam chosen by Ali, 2026-09-27). */}
        <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
        {campaign ? <style dangerouslySetInnerHTML={{ __html: JOIN_CSS + FORM_BLOCK_CSS }} /> : null}
        <Seo path={campaign ? "/join" : seoPath} />
        <Helmet>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap"
          />
        </Helmet>

        <Starfield density={cfg ? cfg.stars : 0} />
        <Intro gl={introCfg} onDone={onIntroDone} />
        <Header />

        <main className="fx-main">
          <Hero gl={introDone ? cfg : null} />
          <PhoneSection tilt={Boolean(cfg && cfg.tilt)} />
          <Pains />
          <How />
          <Stats still={tier === "low"} />
          <Stage gl={cfg} />
          <Pricing />
          <FitFaq />
          {campaign ? (
            <section className="fx-block join-page fx-joinform" aria-label={CTA_LABEL}>
              <div className="v1-card j-card" id="join-form" ref={formRef}>
                <LeadForm pkgId={pkgId} setPkgId={setPkgId} nameRef={nameRef} />
              </div>
            </section>
          ) : null}
          <Final gl={cfg} />
        </main>

        <Footer mode={mode} onMode={onMode} />
        {campaign ? null : <V1LeadModal />}
      </div>
     </CtaContext.Provider>
    </MotionConfig>
  );
}
