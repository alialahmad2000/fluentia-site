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
import { PRICING } from "../landing-v2/content";
// The /join form card's own styles (its j-* classes live under .join-page).
import JOIN_CSS from "../join/join.css?inline";
import { detectTier, forcedTier, tierConfig, writeStore, TIER_KEY } from "./perf";
import Starfield from "./Starfield";
import Intro from "./Intro";
import Header from "./Header";
import Hero from "./Hero";
import PhoneSection from "./PhoneSection";
import { Pains, How, Stats, Steps } from "./Acts";
import Stage from "./Stage";
// /join (paid TikTok traffic) keeps the stylesheet it launched with, frozen as of
// 2026-09-27; the homepage gets the real-footage showcase. (StageClassic.jsx, its
// frozen stage, left /join on 2026-09-28 — see the Steps comment below.)
import NEXT_CLASSIC_CSS from "./next-classic.css?inline";
import { Pricing, FitFaq, Final, Footer } from "./Closing";
import { CTA_LABEL, CAMPAIGN_PRICING_FOOT, STICKY_NOTE, SOLO_PRICING } from "./copy";

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

/* The /join form cards inside /next's ground: centred, clear of the fixed header.
   The first sits right under the hero — a paid visitor meets it on the second
   screen, not the twentieth; the second closes the page under the final title. */
const FORM_BLOCK_CSS = `
.fx-next .fx-joinform { display: flex; justify-content: center; padding: 8px var(--fx-gut, 20px) 0; }
.fx-next .fx-joinform .j-card { position: relative; z-index: 2; }
.fx-next .fx-final .j-card { position: relative; z-index: 2; margin: 8px auto 0; text-align: start; }
.fx-next .fx-final-form { display: flex; justify-content: center; }
.fx-next .fx-steps-cta { margin-top: 36px; }
/* Sticky call on a phone: only while no form is on screen. */
.fx-next .fx-sticky {
  position: fixed; inset-inline: 0; bottom: 0; z-index: 40;
  display: flex; align-items: center; gap: 14px;
  padding: 12px var(--fx-gut, 20px) max(12px, env(safe-area-inset-bottom));
  background: rgba(5, 11, 22, 0.92);
  border-top: 1px solid var(--fx-rule);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  transform: translateY(110%); transition: transform 280ms var(--fx-ease-soft);
}
.fx-next .fx-sticky[data-on] { transform: none; }
.fx-next .fx-sticky .fx-btn { flex: 1; justify-content: center; min-height: 52px; }
.fx-next .fx-sticky-note { font-size: 13px; color: var(--fx-faint); white-space: nowrap; }
html.fx-menu-open .fx-next .fx-sticky { transform: translateY(110%); }
@media (min-width: 900px) { .fx-next .fx-sticky { display: none; } }
@media (prefers-reduced-motion: reduce) { .fx-next .fx-sticky { transition: none; } }
/* The hero's sub line is the page's LCP element on a phone, and an element is
   not counted while its opacity is 0: its delayed fade cost /join ~1.5 s of LCP
   on a throttled phone (measured live). Paid traffic gets it at once. */
html.fx-js .fx-next[data-campaign] .fx-hero-sub.fx-hero-after { animation: none; opacity: 1; }
`;

// Client-only renders (dev, or arriving by in-app navigation) get no inline
// script execution, so boot runs as the chunk loads — still before first render.
if (typeof window !== "undefined") boot();

// /join sells the 1:1 programmes only: the form lists them. It opens undecided —
// only a pricing card's own button ([data-tier]) ever sets a package.
const SOLO_IDS = [PRICING.vipTier.id, PRICING.intensiveTier.id];
const TIER_IDS = new Set(SOLO_IDS);
const CAMPAIGN_CTA = { label: CTA_LABEL, pricingFoot: CAMPAIGN_PRICING_FOOT, solo: SOLO_PRICING };

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
  // What the visitor picked in the select themselves. A pricing card's button
  // sets its package; every other button puts back this (or "undecided").
  const manualPkg = useRef("");
  const pickPkg = useCallback((v) => {
    manualPkg.current = v;
    setPkgId(v);
  }, []);
  const nameRef = useRef(null);
  const formRef = useRef(null);
  const nameRefB = useRef(null);
  const formRefB = useRef(null);
  const [doneIn, setDoneIn] = useState(null); // "top" | "bottom" once a lead is sent
  const [sticky, setSticky] = useState(false);
  const [stickyLift, setStickyLift] = useState(0); // px above the cookie bar

  // Every call to action goes to the NEARER of the two forms.
  const goToForm = useCallback(() => {
    const cards = [
      [formRef.current, nameRef],
      [formRefB.current, nameRefB],
    ].filter(([c]) => c);
    if (!cards.length) return;
    cards.sort((a, b) => Math.abs(a[0].getBoundingClientRect().top) - Math.abs(b[0].getBoundingClientRect().top));
    const [el, ref] = cards[0];
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const focusName = () => ref.current?.focus({ preventScroll: true });
    // Card top under the fixed header — unless the card is taller than the
    // screen (825 px on a 360×740 phone): then just enough that the submit
    // button is on screen, so nothing has to be scrolled or dismissed to send.
    const cardTop = el.getBoundingClientRect().top + window.scrollY;
    const submit = el.querySelector("[type=submit]");
    const submitBottom = submit ? submit.getBoundingClientRect().bottom + window.scrollY : cardTop;
    const top = Math.max(cardTop - 80, submitBottom - window.innerHeight + 16);
    if (reduce) {
      window.scrollTo(0, top);
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
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!campaign) return undefined;
    const onClick = (e) => {
      const trigger = e.target.closest?.("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      const t = trigger.getAttribute("data-tier");
      setPkgId(t && TIER_IDS.has(t) ? t : manualPkg.current);
      goToForm();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [campaign, goToForm]);

  // The phone's sticky call: past the hero, no form card on screen, no cookie
  // banner up (it sits at the bottom too), and never once a lead is sent.
  useEffect(() => {
    if (!campaign || doneIn) {
      setSticky(false);
      return undefined;
    }
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight;
      const hero = document.getElementById("fx-top");
      const pastHero = hero ? hero.getBoundingClientRect().bottom < vh * 0.4 : window.scrollY > vh;
      const formOnScreen = [formRef.current, formRefB.current].some((c) => {
        if (!c) return false;
        const r = c.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      });
      // The cookie bar (until the visitor chooses) sits at the bottom too:
      // the sticky call rides just above it rather than waiting behind it.
      const cookie = document.querySelector("[aria-labelledby=fluentia-cookie-title]");
      setStickyLift(cookie ? Math.round(window.innerHeight - cookie.getBoundingClientRect().top) : 0);
      setSticky(pastHero && !formOnScreen);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [campaign, doneIn]);

  const backToPlatform = useCallback(() => {
    document.getElementById("fx-platform")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const backToTop = useCallback(() => {
    document.getElementById("fx-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
        <style dangerouslySetInnerHTML={{ __html: campaign ? NEXT_CLASSIC_CSS : NEXT_CSS }} />
        {/* Kufam is the display face: fetched while the HTML parses, before the
            giant type needs it (Kufam chosen by Ali, 2026-09-27). */}
        <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
        {campaign ? <style dangerouslySetInnerHTML={{ __html: JOIN_CSS + FORM_BLOCK_CSS }} /> : null}
        <Seo path={campaign ? "/join" : seoPath} />
        {campaign ? (
          <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap" />
          </Helmet>
        ) : (
          <link rel="preload" as="font" type="font/woff2" href="/fonts/barlow-condensed-800-latin.woff2" crossOrigin="" />
        )}

        <Starfield density={cfg ? cfg.stars : 0} />
        <Intro gl={introCfg} onDone={onIntroDone} />
        <Header />

        <main className="fx-main">
          <Hero gl={introDone ? cfg : null} />
          {campaign ? (
            <section className="fx-block join-page fx-joinform" aria-label={CTA_LABEL}>
              <div className="v1-card j-card" id="join-form" ref={formRef}>
                <LeadForm
                  pkgId={pkgId}
                  setPkgId={pickPkg}
                  nameRef={nameRef}
                  tierIds={SOLO_IDS}
                  onDone={() => setDoneIn("top")}
                  onBack={backToPlatform}
                />
              </div>
            </section>
          ) : null}
          <PhoneSection tilt={Boolean(cfg && cfg.tilt)} />
          <Pains />
          <How />
          <Stats still={tier === "low"} bars={campaign} />
          {/* /join drops the between-classes stage: ~4,900 px of pinned scroll
              between a paid visitor and the price, for detail the phone above
              already shows. «كيف تبدأ» — what happens after the form — takes its place. */}
          {campaign ? <Steps /> : <Stage gl={cfg} tier={tier} />}
          <Pricing />
          <FitFaq />
          {campaign ? (
            <Final gl={cfg}>
              {doneIn === "top" ? null : (
                <div className="join-page fx-final-form">
                  <div className="v1-card j-card" id="join-form-bottom" ref={formRefB}>
                    <LeadForm
                      pkgId={pkgId}
                      setPkgId={pickPkg}
                      nameRef={nameRefB}
                      idPrefix="join-b"
                      tierIds={SOLO_IDS}
                      onDone={() => setDoneIn("bottom")}
                      onBack={backToTop}
                    />
                  </div>
                </div>
              )}
            </Final>
          ) : (
            <Final gl={cfg} />
          )}
        </main>
        {campaign ? (
          <div
            className="fx-sticky"
            data-on={sticky ? "" : undefined}
            aria-hidden={!sticky}
            style={stickyLift ? { bottom: stickyLift, paddingBottom: 12, borderBottom: "1px solid var(--fx-rule)" } : undefined}
          >
            <button type="button" data-open-form className="fx-btn fx-btn--primary" tabIndex={sticky ? 0 : -1}>
              {CTA_LABEL}
            </button>
            <span className="fx-sticky-note">{STICKY_NOTE}</span>
          </div>
        ) : null}

        <Footer mode={mode} onMode={onMode} />
        {campaign ? null : <V1LeadModal />}
      </div>
     </CtaContext.Provider>
    </MotionConfig>
  );
}
