import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WORTH, WHO_FOR } from "../landing-v2/content";
import { Reveal, staggerParent, staggerItem } from "./motion";

/* Apple-style read-along: each word brightens as it crosses the
 * reading band. One scroll progress drives every word (no per-word
 * observers); reduced-motion users get full opacity via MotionConfig. */
function ScrollBrightText({ text, style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} style={style}>
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} start={i / words.length} end={(i + 1) / words.length} />
      ))}
    </p>
  );
}

function Word({ word, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.22, 1]);
  return (
    <motion.span style={{ opacity }}>{word}{" "}</motion.span>
  );
}

/**
 * V1Worth — the value manifesto. Editorial, type-led, the quietest
 * and most confident section on the page.
 */
export function V1Worth() {
  return (
    <section className="v1-section" id="worth" style={{ position: "relative" }}>
      {/* soft gold breath — the only gold before pricing */}
      <div className="v1-glow" aria-hidden style={{ width: 700, height: 700, top: "-4%", insetInlineStart: "28%", background: "radial-gradient(circle, rgba(242,193,78,0.05), transparent 62%)" }} />
      <div className="v1-container" style={{ maxWidth: 900 }}>
        <Reveal>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="v1-eyebrow" style={{ color: "var(--v1-gold)" }}>{WORTH.eyebrow}</span>
            <h2 className="v1-headline">{WORTH.headline}</h2>
            <p style={{
              fontFamily: "var(--v1-display)", fontWeight: 500, fontSize: "var(--v1-lead)",
              color: "var(--v1-gold-soft)", margin: "18px 0 0", lineHeight: 1.9,
            }}>
              {WORTH.deck}
            </p>
          </div>
        </Reveal>
        <ScrollBrightText
          text={WORTH.intro}
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            lineHeight: 2.15,
            fontWeight: 300,
            color: "var(--v1-t)",
            textAlign: "center",
            maxWidth: 680,
            margin: "34px auto 0",
          }}
        />

        <div style={{ marginTop: 72, display: "flex", flexDirection: "column", gap: 0 }}>
          {WORTH.pillars.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.05}>
              <article style={{
                display: "grid", gridTemplateColumns: "84px 1fr", gap: "8px 28px",
                padding: "clamp(30px, 4vw, 46px) 0",
                borderTop: "1px solid var(--v1-line)",
              }} className="v1-worth-row">
                <div>
                  <div className="v1-num" aria-hidden style={{
                    fontSize: "1.9rem", fontWeight: 700, lineHeight: 1, direction: "ltr",
                    color: "transparent", WebkitTextStroke: "1.4px rgba(242,193,78,0.8)", letterSpacing: "0.04em",
                  }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ marginTop: 6, fontSize: "0.72rem", letterSpacing: "0.16em", color: "var(--v1-gold)", fontWeight: 600, fontFamily: "var(--v1-display)" }}>
                    {p.essence}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0, lineHeight: 1.6 }}>
                    {p.title}
                  </h3>
                  <p style={{ margin: "12px 0 0", fontSize: "1.02rem", lineHeight: 2.05, color: "var(--v1-t-mute)", fontWeight: 300 }}>
                    {p.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
          <hr className="v1-hairline" />
        </div>

        <Reveal delay={0.1}>
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <p style={{ fontFamily: "var(--v1-display)", fontSize: "clamp(1.3rem, 2.8vw, 1.8rem)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0 }}>
              {WORTH.closing.lead}
            </p>
            <p style={{ fontSize: "var(--v1-lead)", lineHeight: 2, color: "var(--v1-t-mute)", maxWidth: 560, margin: "16px auto 0", fontWeight: 300 }}>
              {WORTH.closing.body}
            </p>
            <a href={WORTH.closing.ctaHref} className="v1-cta v1-cta-ghost" style={{ marginTop: 32 }}>
              {WORTH.closing.ctaLabel} ↓
            </a>
          </div>
        </Reveal>
      </div>
      <style>{`
        @media (max-width: 680px) {
          .v1-scope .v1-worth-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/**
 * V1WhoFor — honest qualification split. Green/red twin columns.
 */
export function V1WhoFor() {
  const col = (data, positive) => (
    <motion.div
      variants={staggerItem}
      className="v1-card"
      style={{
        padding: "clamp(26px, 3vw, 38px)",
        borderColor: positive ? "rgba(74,222,128,0.22)" : "rgba(248,113,113,0.18)",
        background: positive
          ? "linear-gradient(170deg, rgba(74,222,128,0.05), rgba(74,222,128,0.01))"
          : "linear-gradient(170deg, rgba(248,113,113,0.045), rgba(248,113,113,0.01))",
      }}
    >
      <h3 style={{
        fontFamily: "var(--v1-display)", fontSize: "1.2rem", fontWeight: 700, margin: 0,
        color: positive ? "var(--v1-green)" : "var(--v1-red)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {positive ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" /><path d="M8 12.5l2.6 2.6L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" /><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        )}
        {data.title}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 15 }}>
        {data.items.map((it) => (
          <li key={it} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: "0.97rem", lineHeight: 1.9, color: "var(--v1-t)", fontWeight: 300 }}>
            <span aria-hidden style={{
              width: 5, height: 5, borderRadius: "50%", marginTop: 11, flexShrink: 0,
              background: positive ? "var(--v1-green)" : "var(--v1-red)", opacity: 0.8,
            }} />
            <span className="v1-num">{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <section className="v1-section" id="whofor" style={{ paddingTop: 0 }}>
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow">{WHO_FOR.eyebrow}</span>
          <h2 className="v1-headline">{WHO_FOR.headline}</h2>
          <p className="v1-intro">{WHO_FOR.intro}</p>
        </Reveal>
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="v1-whofor-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 56 }}
        >
          {col(WHO_FOR.forYou, true)}
          {col(WHO_FOR.notForYou, false)}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .v1-scope .v1-whofor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
