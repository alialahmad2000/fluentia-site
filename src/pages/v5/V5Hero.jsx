import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { HERO } from "../landing-v2/content";
import { EASE } from "../v1/motion";
import { Magnetic } from "../v1/V1Interactive";
import BrandMark from "../../components/BrandMark";

/**
 * V5Hero — "the stage".
 * The noise of failed learning rains down and dissolves; a spotlight
 * carves the promise out of the dark; and instead of a static
 * dashboard, a LIVE conversation plays: AI question → student voice →
 * AI score → the human trainer's reply. Product truth as theatre.
 */

/* The old world falling away — drill fragments, deterministic layout */
const FRAGMENTS = [
  "am / is / are", "past perfect", "memorize", "unit 1 again", "20 students",
  "grammar drill", "he go...? goes?", "silent in class", "forgot again",
  "certificate?", "am / is / are", "repeat after me", "conjugate", "worksheet",
  "start over", "too shy to speak", "irregular verbs", "translate this",
];

function WordRain() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {FRAGMENTS.map((f, i) => {
        // index-based pseudo-random: stable, no hydration drift
        const left = ((i * 61) % 97 + 2) - 1;           // 1..98 %
        const dur = 14 + ((i * 7) % 9);                  // 14..22s
        const delay = -((i * 5.3) % dur);                // negative → already mid-fall
        const size = 0.62 + ((i * 13) % 5) * 0.05;       // 0.62..0.82rem
        const op = 0.06 + ((i * 11) % 5) * 0.02;         // 0.06..0.14
        return (
          <span
            key={i}
            className="v5-frag"
            dir="ltr"
            style={{
              insetInlineStart: `${left}%`,
              fontSize: `${size}rem`,
              "--frag-d": `${dur}s`,
              "--frag-delay": `${delay}s`,
              "--frag-o": op,
              filter: i % 3 === 0 ? "blur(1px)" : "none",
            }}
          >
            {f}
          </span>
        );
      })}
    </div>
  );
}

/* ─── The live conversation loop ─── */
const CONVO_STEPS = [
  { id: "ai", type: "ai", at: 0 },
  { id: "student", type: "student", at: 1300 },
  { id: "score", type: "score", at: 3000 },
  { id: "trainer", type: "trainer", at: 4600 },
];
const LOOP_MS = 13000; // full conversation holds ~7s before replaying

function ConversationCard() {
  const [stage, setStage] = useState(0); // how many steps visible
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(CONVO_STEPS.length);
      return;
    }
    let timers = [];
    const run = () => {
      setStage(0);
      CONVO_STEPS.forEach((s, i) => {
        timers.push(setTimeout(() => setStage(i + 1), s.at + 500));
      });
    };
    run();
    const loop = setInterval(run, LOOP_MS);
    return () => { clearInterval(loop); timers.forEach(clearTimeout); };
  }, []);

  const show = (i) => stage > i;

  return (
    <div
      dir="rtl"
      style={{
        width: "min(430px, 92vw)",
        borderRadius: "var(--v1-r-lg)",
        border: "1px solid var(--v1-line-strong)",
        background: "linear-gradient(170deg, rgba(14,23,40,0.94), rgba(7,12,22,0.96))",
        boxShadow: "0 1px 0 rgba(255,255,255,0.07) inset, 0 34px 90px rgba(0,0,0,0.6), 0 12px 44px rgba(2,132,199,0.16)",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--v1-line)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--v1-green)", boxShadow: "0 0 10px var(--v1-green)" }} />
        <span style={{ fontFamily: "var(--v1-display)", fontWeight: 700, fontSize: "0.85rem", color: "var(--v1-t-strong)" }}>
          تدريب محادثة · مباشر
        </span>
        <span style={{ marginInlineStart: "auto", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span className="v1-num" style={{ fontSize: "0.68rem", color: "var(--v1-t-faint)", letterSpacing: "0.1em" }}>
            SPEAKING LAB
          </span>
          <BrandMark size={18} />
        </span>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, minHeight: 268 }}>
        <AnimatePresence>
          {show(0) && (
            <motion.div key="ai" className="v5-bubble v5-bubble-ai" dir="ltr"
              initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark size={17} style={{ opacity: 0.9 }} />
              <span className="v1-num" style={{ fontWeight: 500 }}>Tell me about your morning routine, Sara 👋</span>
            </motion.div>
          )}

          {show(1) && (
            <motion.div key="student" className="v5-bubble v5-bubble-student"
              initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", background: "rgba(226,240,253,0.14)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="var(--v1-azure-soft)" strokeWidth="1.8" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="var(--v1-azure-soft)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <span style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 20 }} aria-hidden>
                {[7, 13, 9, 17, 11, 19, 8, 15, 12, 18, 9, 14, 7, 12, 16, 10].map((h, i) => (
                  <motion.span key={i}
                    animate={{ scaleY: [0.4, 1, 0.5, 0.9, 0.4] }}
                    transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
                    style={{ width: 3, height: h, borderRadius: 3, background: "rgba(226,240,253,0.75)", transformOrigin: "bottom" }} />
                ))}
              </span>
              <span className="v1-num" style={{ fontSize: "0.68rem", color: "rgba(226,240,253,0.6)" }}>0:09</span>
            </motion.div>
          )}

          {show(2) && (
            <motion.div key="score"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                borderRadius: 13, background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.25)",
              }}>
              <ScoreRing />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--v1-green)" }}>تقييم AI فوري</div>
                <div style={{ fontSize: "0.76rem", color: "var(--v1-t-mute)", marginTop: 3, lineHeight: 1.7 }}>
                  نطق واضح — انتبهي لنبرة <span className="v1-num" dir="ltr">"routine"</span>
                </div>
              </div>
            </motion.div>
          )}

          {show(3) && (
            <motion.div key="trainer" className="v5-bubble v5-bubble-trainer"
              initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(74,222,128,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "var(--v1-green)", fontFamily: "var(--v1-display)" }}>م</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--v1-green)" }}>مدرّبك · د. محمد</span>
              </div>
              تقدّم واضح يا سارة 👏 بكرة في الحصة نشتغل على الـ tone
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* footer strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderTop: "1px solid var(--v1-line)" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--v1-t-faint)" }}>AI يقيّم · إنسان يتابع</span>
        <span className="v1-num" style={{ fontSize: "0.7rem", color: "var(--v1-azure-soft)", fontWeight: 600 }} dir="ltr">Whisper + Claude</span>
      </div>
    </div>
  );
}

function ScoreRing() {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 900, 1);
      setVal(Math.round(92 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const C = 2 * Math.PI * 15;
  return (
    <span style={{ position: "relative", width: 40, height: 40, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="3.4" />
        <circle cx="20" cy="20" r="15" fill="none" stroke="var(--v1-green)" strokeWidth="3.4" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - val / 100)} transform="rotate(-90 20 20)" />
      </svg>
      <span className="v1-num" style={{ position: "absolute", fontSize: "0.72rem", fontWeight: 800, color: "var(--v1-green)" }}>{val}</span>
    </span>
  );
}

/* ─── Hero ─── */
export default function V5Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "-26%"]);
  const headO = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const rainO = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const words = HERO.headline.split(" ");

  return (
    <section id="top" ref={ref} style={{ position: "relative", minHeight: "100vh", paddingTop: 130, overflow: "clip" }}>
      <div className="v5-spotlight" aria-hidden />
      <motion.div style={{ opacity: rainO, position: "absolute", inset: 0 }} aria-hidden>
        <WordRain />
      </motion.div>

      <div className="v1-container" style={{ position: "relative", zIndex: 2 }}>
        <div className="v5-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "40px 56px", alignItems: "center", minHeight: "72vh" }}>
          {/* ── Copy side ── */}
          <motion.div style={{ y: headY, opacity: headO }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            >
              <span className="v1-chip" style={{ borderColor: "var(--v1-line-azure)", color: "var(--v1-azure-soft)", background: "rgba(56,189,248,0.06)", fontSize: "0.83rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--v1-green)", boxShadow: "0 0 10px var(--v1-green)" }} />
                {HERO.eyebrow}
              </span>
            </motion.div>

            <h1 style={{
              fontFamily: "var(--v1-display)",
              fontSize: "clamp(2.5rem, 5.6vw, 4.4rem)",
              fontWeight: 800,
              lineHeight: 1.32,
              color: "var(--v1-t-strong)",
              margin: "30px 0 0",
              letterSpacing: 0,
            }}>
              {words.map((w, i) => (
                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0.22em 0 0.14em", margin: "-0.22em 0 -0.14em" }}>
                  <motion.span
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                    initial={{ y: "115%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.95, ease: EASE, delay: 0.4 + i * 0.08 }}
                  >
                    {w === "تتكلّمه" ? (
                      <span style={{ position: "relative", display: "inline-block" }}>
                        <span className="v5-keyword">{w}</span>
                        {/* hand-drawn underline */}
                        <svg viewBox="0 0 120 12" aria-hidden style={{ position: "absolute", bottom: "-0.12em", insetInlineStart: 0, width: "100%", height: "0.22em", overflow: "visible" }}>
                          <motion.path
                            d="M4 8 C 30 3, 60 10, 116 5"
                            fill="none" stroke="var(--v1-azure)" strokeWidth="3" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.85 }}
                            transition={{ duration: 0.8, ease: EASE, delay: 1.5 }}
                          />
                        </svg>
                      </span>
                    ) : w}
                    {i < words.length - 1 ? " " : ""}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* This paragraph is the page's LCP element on a phone, and an element
                is not "painted" for LCP while its opacity is 0 — a 1.05s delay
                plus a 0.8s fade cost ~1.8s of LCP (Lighthouse 2026-09-13: 10.1s).
                It now arrives with the headline instead of after it. */}
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
              style={{ fontSize: "var(--v1-lead)", lineHeight: 2, color: "var(--v1-t-mute)", maxWidth: 520, margin: "26px 0 0", fontWeight: 300 }}
            >
              {HERO.sub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
              style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 38 }}
            >
              <Magnetic>
                <button type="button" data-open-form className="v1-cta v1-cta-primary">
                  {HERO.primaryCTA}
                  <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>←</span>
                </button>
              </Magnetic>
              <a href="#trial" className="v1-cta v1-cta-ghost">{HERO.secondaryCTA}</a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.45 }}
              style={{ display: "flex", gap: "10px 24px", flexWrap: "wrap", marginTop: 30 }}
            >
              {HERO.trustRow.map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--v1-body-s)", color: "var(--v1-t-faint)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 13l4 4L19 7" stroke="var(--v1-azure)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="v1-num" style={{ fontWeight: 400 }}>{t}</span>
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Conversation side ── */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 1.0 }}
            style={{ y: cardY, display: "flex", justifyContent: "center", position: "relative" }}
          >
            <div aria-hidden style={{
              position: "absolute", inset: "-12%",
              background: "radial-gradient(ellipse 55% 50% at 50% 45%, rgba(56,189,248,0.12), transparent 70%)",
              filter: "blur(26px)",
            }} />
            {/* colossal ghost mark behind the card — the brand carries the stage */}
            <img aria-hidden src="/brand/fluentia-mark.svg" alt="" style={{
              position: "absolute", width: "125%", top: "-14%", insetInlineStart: "-16%",
              opacity: 0.05, filter: "saturate(0.6)", pointerEvents: "none", userSelect: "none",
              // fade its foot out so the section's clip edge never draws a line
              WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 85%)",
              maskImage: "linear-gradient(to bottom, #000 55%, transparent 85%)",
            }} />
            <ConversationCard />
          </motion.div>
        </div>
        {/* Trusted-by moved out of the hero into V5LogoBand. This spacer keeps
            the room it used to hold: the conversation card drifts down on
            scroll, and the section clips anything past its bottom edge. */}
        <div aria-hidden className="v5-hero-tail" />
      </div>

      <style>{`
        .v1-scope .v5-hero-tail { height: 56px; }
        @media (max-width: 960px) {
          /* stacked: the card sits last, so its scroll drift needs the room */
          .v1-scope .v5-hero-tail { height: 88px; }
          .v1-scope .v5-hero-grid { grid-template-columns: 1fr !important; min-height: unset !important; }
          .v1-scope .v5-hero-grid > div:first-child { text-align: center; }
          .v1-scope .v5-hero-grid > div:first-child > div { justify-content: center; }
          .v1-scope .v5-hero-grid > div:first-child p { margin-inline: auto !important; }
        }
      `}</style>
    </section>
  );
}
