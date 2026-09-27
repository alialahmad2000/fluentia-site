import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import "../v5/V5Hero.css";
// Inlined into the markup, not linked: this route is a lazy chunk, and a chunk's
// stylesheet only arrives with its JavaScript — the prerendered page would paint
// unstyled and then jump.
import ASCENT_CSS from "./ascent.css?inline";
import Seo from "../../components/Seo";
import V1LeadModal from "../v1/V1LeadModal";
import { detectTier, forcedTier, readStore, writeStore, TIER_KEY, SOUND_KEY } from "./perf";
import { createController } from "./controller";
import { Header, Hud, Intro, Backdrop } from "./parts";
import { BaseCamp, Icefall, Basin, Rope, HighZone, Summit, Below } from "./chapters";

/**
 * /ascent — «الصعود». Learning English is the climb; fluency is the summit.
 * (noindex, unlinked, not in the sitemap. `/` is untouched.)
 *
 * One procedural mountain in one fixed canvas (scene/engine.js, three.js,
 * loaded after first paint and never on the low tier). Scroll climbs it: six
 * camps, each carrying one part of the homepage. Every primary action is the
 * homepage's own `[data-open-form]` → V1LeadModal (same TikTok / GA4 / Supabase /
 * WhatsApp flow); pricing, fit, FAQ and footer are the homepage components.
 */

/*
 * Boot — runs inline in the prerendered markup BEFORE the hero is parsed:
 *   html.as-js        JS is on; reveal states may start hidden
 *   html.as-intro     the whiteout intro plays (first visit, not low tier, not reduced motion)
 *   [data-as-tier]    a forced tier (?tier=, the footer control), or low for reduced motion / save-data
 *   [data-as-font]    ?font=kufam|lalezar
 * If the bundle never arrives, the classes come off after 9 s and the page shows everything.
 * ES5 on purpose: it runs in whatever in-app browser a TikTok ad opens.
 */
function boot() {
  try {
    var d = document.documentElement;
    if (d.getAttribute("data-as-boot")) return;
    d.setAttribute("data-as-boot", "1");
    var q = new URLSearchParams(window.location.search);
    var t = q.get("tier");
    var s = null;
    var seen = null;
    try {
      s = window.localStorage.getItem("fl-perf-tier");
      seen = window.localStorage.getItem("fl-ascent-intro");
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
    if (t) d.setAttribute("data-as-tier", t);
    var f = q.get("font");
    if (f === "kufam" || f === "lalezar") d.setAttribute("data-as-font", f);
    d.classList.add("as-js");
    // decided once per page view (a re-boot after a remount must not re-decide)
    if (window.__asIntro === undefined) {
      window.__asIntro = t !== "low" && !rm && (!seen || q.get("intro") === "1");
      if (window.__asIntro) {
        d.classList.add("as-intro");
        try {
          window.localStorage.setItem("fl-ascent-intro", "1");
        } catch (e) {
          /* storage blocked: the intro plays again next time */
        }
      }
    }
    setTimeout(function () {
      if (!window.__asReady) {
        d.classList.remove("as-js");
        d.classList.remove("as-intro");
      }
    }, 9000);
  } catch (e) {
    /* never block the page */
  }
}
const BOOT = `(${boot.toString()})();`;

// Client-only renders (dev, or arriving by in-app navigation) get no inline
// script execution, so boot runs as the chunk loads — still before first render.
if (typeof window !== "undefined") boot();

export default function AscentLanding() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const ctrlRef = useRef(null);
  const soundRef = useRef(null);
  const [tier, setTier] = useState(null);
  const [mode, setMode] = useState("auto");
  const [font, setFont] = useState(null);
  const [sound, setSound] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [stillSet, setStillSet] = useState(null);

  /* tier, font, stills orientation, remembered choices */
  useEffect(() => {
    boot();
    window.__asReady = true;
    const d = document.documentElement;
    const pre = d.getAttribute("data-as-tier");
    if (pre) setTier(pre);
    const stored = readStore(TIER_KEY);
    if (stored === "high" || stored === "low") setMode(stored);
    const f = d.getAttribute("data-as-font");
    if (f) setFont(f);
    if (readStore(SOUND_KEY) === "1") setSound(true);
    const portrait = window.matchMedia("(max-aspect-ratio: 1/1)");
    const pick = () => setStillSet(portrait.matches ? "p" : "l");
    pick();
    portrait.addEventListener?.("change", pick);
    let alive = true;
    detectTier().then((t) => alive && setTier(t));
    return () => {
      alive = false;
      portrait.removeEventListener?.("change", pick);
      window.__asReady = false;
      d.classList.remove("as-js");
      d.removeAttribute("data-as-tier");
      d.removeAttribute("data-as-boot");
      d.removeAttribute("data-as-font");
    };
  }, []);

  useEffect(() => {
    if (tier) document.documentElement.setAttribute("data-as-tier", tier);
  }, [tier]);

  /* the page loop */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctrl = createController(root, { calm });
    ctrlRef.current = ctrl;
    // fonts change heights; measure again once they are in
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ctrl.remeasure());
    return () => {
      ctrl.dispose();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ctrlRef.current) ctrlRef.current.remeasure();
  }, [stillSet]);

  useEffect(() => {
    if (!ctrlRef.current || !tier) return;
    ctrlRef.current.setCalm(tier === "low" || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [tier]);

  /* the mountain: three.js arrives after first paint, in its own chunk, never on the low tier */
  useEffect(() => {
    if (!tier || tier === "low") return undefined;
    let engine = null;
    let dead = false;
    const start = () => {
      import("./scene/engine")
        .then(({ createAscent }) => {
          if (dead || !canvasRef.current) return;
          try {
            engine = createAscent({
              canvas: canvasRef.current,
              tier,
              onLost: () => {
                // the GPU let go: the stills take over for the rest of the visit
                if (ctrlRef.current) ctrlRef.current.setEngine(null);
                setEngineOn(false);
                setTier("low");
              },
              onFirstFrame: () => !dead && setEngineOn(true),
            });
            if (ctrlRef.current) ctrlRef.current.setEngine(engine);
          } catch {
            setTier("low");
          }
        })
        .catch(() => setTier("low"));
    };
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 200));
    const handle = idle(start, { timeout: 1500 });
    return () => {
      dead = true;
      if (window.cancelIdleCallback && typeof handle === "number") window.cancelIdleCallback(handle);
      if (ctrlRef.current) ctrlRef.current.setEngine(null);
      if (engine) engine.dispose();
      setEngineOn(false);
    };
  }, [tier]);

  /* reveal content blocks once, as they come in */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".as-rv");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }),
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* sound: created on the tap that turns it on */
  useEffect(() => {
    if (!sound) {
      if (soundRef.current) soundRef.current.setOn(false);
      return undefined;
    }
    let armed = null;
    const on = () => {
      if (!soundRef.current) {
        import("./sound").then(({ createSound }) => {
          const s = createSound();
          if (!s) return;
          soundRef.current = s;
          s.setOn(true);
          if (ctrlRef.current) ctrlRef.current.setSound(s);
        });
      } else soundRef.current.setOn(true);
    };
    // a remembered "on" still needs a gesture before the browser lets audio play
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      armed = () => on();
      window.addEventListener("pointerdown", armed, { once: true });
      window.addEventListener("keydown", armed, { once: true });
    } else on();
    return () => {
      if (armed) {
        window.removeEventListener("pointerdown", armed);
        window.removeEventListener("keydown", armed);
      }
    };
  }, [sound]);

  useEffect(
    () => () => {
      if (soundRef.current) soundRef.current.dispose();
    },
    []
  );

  const onSound = useCallback(() => {
    setSound((v) => {
      writeStore(SOUND_KEY, v ? "0" : "1");
      return !v;
    });
  }, []);

  const onJump = useCallback((i) => ctrlRef.current && ctrlRef.current.jump(i), []);

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

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="v1-scope v5-scope as-root" dir="rtl" data-tone="light" data-engine={engineOn ? "" : undefined}>
        {/* The client and server bundles may stringify boot() differently; the
            script has already run by the time React hydrates it. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOT }} />
        <style dangerouslySetInnerHTML={{ __html: ASCENT_CSS }} />
        <Seo path="/ascent" />
        {font ? (
          <Helmet>
            {font === "kufam" ? <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kufam:wght@800;900&display=swap" /> : null}
            {font === "lalezar" ? <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap" /> : null}
          </Helmet>
        ) : null}

        <Backdrop canvasRef={canvasRef} stillSet={stillSet} showStills={!engineOn} />
        <Intro />
        <Header sound={sound} onSound={onSound} />
        <Hud onJump={onJump} />

        <main className="as-main">
          <BaseCamp />
          <Icefall />
          <Basin />
          <Rope />
          <HighZone />
          <Summit />
          <Below mode={mode} onMode={onMode} />
        </main>

        <V1LeadModal />
      </div>
    </MotionConfig>
  );
}
