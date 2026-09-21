import { lazy, Suspense, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HERO } from "../landing-v2/content";
import { EASE } from "../v1/motion";
import { Magnetic } from "../v1/V1Interactive";
import V5HeroShowcase, { glueAr } from "./V5HeroShowcase";
import { useCinema } from "./cinemaContext";
import "./V5Hero.css";

/* Lazy so the candidate backdrop stays out of the homepage main chunk that
   every visitor to / downloads. `/cine` is not prerendered, so it never has
   to resolve on the server. */
const V5Cinema = lazy(() => import("./V5Cinema"));

/**
 * V5Hero — the promise, and the proof beside it.
 *
 * The noise of failed learning still rains down behind the headline, but the
 * card no longer acts out a scripted chat: it replays real moments from inside
 * the student platform (V5HeroShowcase) and opens each one in /tour. The
 * headline keeps its counter-clause on one line, so «لا» never ends a line
 * without «تحفظه».
 */

/* The /tour door lives here, not in content.js HERO (another run owns that file). */
const TOUR_CTA = "تجوّل داخل المنصة";

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

/* One headline word, rising out of its own mask. */
function Word({ children, i, keyword }) {
  return (
    <span className="v5h-w" data-w="">
      <motion.span
        style={{ display: "inline-block" }}
        initial={{ y: "115%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.95, ease: EASE, delay: 0.4 + i * 0.08 }}
      >
        {keyword ? (
          <span style={{ position: "relative", display: "inline-block" }}>
            <span className="v5-keyword">{children}</span>
            {/* hand-drawn underline */}
            <svg viewBox="0 0 120 12" aria-hidden style={{ position: "absolute", bottom: "0.02em", insetInlineStart: 0, width: "100%", height: "0.22em", overflow: "visible" }}>
              <motion.path
                d="M4 8 C 30 3, 60 10, 116 5"
                fill="none" stroke="var(--v1-azure)" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.8, ease: EASE, delay: 1.5 }}
              />
            </svg>
          </span>
        ) : children}
      </motion.span>
    </span>
  );
}

/** Split «A — B» into its clause and counter-clause; lines are laid out by us. */
function Headline({ text }) {
  const [lead, ...rest] = text.split(/\s+—\s+/);
  const tail = rest.join(" — ");
  const leadWords = lead.split(" ");
  const tailWords = tail ? tail.split(" ") : [];
  return (
    <h1 className="v5h-title">
      <span className="v5h-line">
        {leadWords.map((w, i) => (
          <span key={i}>
            <Word i={i} keyword={tail && i === leadWords.length - 1}>{w}</Word>
            {i < leadWords.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
      {tail && (
        <>
          {/* the dash stays in the text for crawlers and screen readers; the line break replaces it on screen */}
          <span className="v5h-sr"> — </span>
          <span className="v5h-line v5h-line--tail">
            {tailWords.map((w, i) => (
              <span key={i}>
                <Word i={leadWords.length + i}>{w}</Word>
                {i < tailWords.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </>
      )}
    </h1>
  );
}

const TickIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Hero ─── */
export default function V5Hero() {
  const cine = useCinema();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const headO = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const rainO = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Off screen, the hero's endless loops (rain, keyword sweep) stop. The
  // attribute is set on the DOM directly: no re-render, nothing to hydrate.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-idle", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" ref={ref} className="v5h" data-cine={cine ? "" : undefined}>
      <div className="v5-spotlight" aria-hidden />
      {cine ? (
        <Suspense fallback={null}>
          <V5Cinema progress={scrollYProgress} />
        </Suspense>
      ) : (
        <>
          <div className="v5h-horizon" aria-hidden />
          <div className="v5h-gridlines" aria-hidden />
          <motion.div className="v5h-rain" style={{ opacity: rainO, position: "absolute", inset: 0 }} aria-hidden>
            <WordRain />
          </motion.div>
        </>
      )}

      <div className="v1-container" style={{ position: "relative", zIndex: 2 }}>
        <div className="v5h-layout">
          {/* ── Copy side ── */}
          <motion.div className="v5h-copy" style={{ y: headY, opacity: headO }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            >
              <span className="v1-chip v5h-eyebrow">
                <span className="v5h-eyebrow-dot" />
                {HERO.eyebrow}
              </span>
            </motion.div>

            <Headline text={HERO.headline} />

            {/* This paragraph is the page's LCP element on a phone, and an element
                is not "painted" for LCP while its opacity is 0 — a 1.05s delay
                plus a 0.8s fade cost ~1.8s of LCP (Lighthouse 2026-09-13: 10.1s).
                It arrives with the headline instead of after it. */}
            <motion.p
              className="v5h-sub"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            >
              {glueAr(HERO.sub)}
            </motion.p>

            <motion.div
              className="v5h-actions"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
            >
              <div className="v5h-ctas">
                <Magnetic>
                  <button type="button" data-open-form className="v1-cta v1-cta-primary">
                    {HERO.primaryCTA}
                    <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>←</span>
                  </button>
                </Magnetic>
                <a href="/tour" className="v1-cta v1-cta-ghost v5h-tour" data-cta="hero_tour">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 9h18M8 4v5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M10.5 12.5v4.5l4-2.25-4-2.25Z" fill="currentColor" />
                  </svg>
                  {TOUR_CTA}
                </a>
              </div>
              <a href="#trial" className="v5h-trial" data-cta="hero_trial">
                أو <b>{HERO.secondaryCTA}</b>
                <span aria-hidden>←</span>
              </a>
            </motion.div>

            <motion.ul
              className="v5h-trust"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              {HERO.trustRow.map((t) => (
                <li key={t}>
                  <TickIcon />
                  <span className="v1-num">{t}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ── The platform, from inside ── */}
          <motion.div className="v5h-stagecol" style={{ y: cardY }}>
            <V5HeroShowcase />
          </motion.div>
        </div>
        {/* Keeps room below the showcase: it drifts down on scroll, and the
            section clips anything past its bottom edge. */}
        <div aria-hidden className="v5-hero-tail" />
      </div>

      <style>{`
        .v1-scope .v5-hero-tail { height: 56px; }
        @media (max-width: 960px) { .v1-scope .v5-hero-tail { height: 72px; } }
      `}</style>
    </section>
  );
}
