import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { HERO, MOCKUP, TRUSTED_BY } from "../landing-v2/content";
import { EASE } from "./motion";
import { Magnetic } from "./V1Interactive";

/**
 * V1Hero — the cinematic opening.
 * Layered aurora field + word-staggered headline + floating glass
 * product panel with scroll parallax. One beam sweep on load.
 */
export default function V1Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const panelY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const glowO = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  const words = HERO.headline.split(" ");

  return (
    <section id="top" ref={ref} style={{ position: "relative", paddingTop: 148, overflow: "clip" }}>
      {/* ─── Ambient field ─── */}
      <motion.div style={{ position: "absolute", inset: 0, opacity: glowO, zIndex: 0 }} aria-hidden>
        <div className="v1-glow v1-drift" style={{ width: 780, height: 780, top: -300, insetInlineStart: "-14%", background: "radial-gradient(circle, rgba(56,189,248,0.17), transparent 65%)" }} />
        <div className="v1-glow v1-drift-late" style={{ width: 620, height: 620, top: 60, insetInlineEnd: "-16%", background: "radial-gradient(circle, rgba(2,132,199,0.14), transparent 65%)" }} />
        <div className="v1-glow" style={{ width: 500, height: 500, top: 460, insetInlineStart: "30%", background: "radial-gradient(circle, rgba(242,193,78,0.05), transparent 60%)" }} />
        {/* Star-grid dots */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(160,200,240,0.13) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 30%, transparent 75%)",
        }} />
        {/* One-shot beam sweep */}
        <div style={{
          position: "absolute", top: -100, insetInlineStart: "20%", width: 260, height: 700,
          background: "linear-gradient(to bottom, transparent, rgba(125,211,252,0.06), transparent)",
          animation: "v1-beam 2.6s var(--v1-ease) 0.5s both",
        }} />
      </motion.div>

      <div className="v1-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <span className="v1-chip" style={{ borderColor: "var(--v1-line-azure)", color: "var(--v1-azure-soft)", background: "rgba(56,189,248,0.06)", fontSize: "0.85rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--v1-green)", boxShadow: "0 0 10px var(--v1-green)" }} />
            {HERO.eyebrow}
          </span>
        </motion.div>

        {/* Word-staggered headline */}
        <h1 style={{
          fontFamily: "var(--v1-display)",
          fontSize: "var(--v1-mega)",
          fontWeight: 800,
          lineHeight: 1.34,
          color: "var(--v1-t-strong)",
          margin: "34px auto 0",
          maxWidth: 880,
          letterSpacing: 0,
        }}>
          {words.map((w, i) => (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0.22em 0 0.14em", margin: "-0.22em 0 -0.14em" }}>
              <motion.span
                style={{ display: "inline-block", whiteSpace: "pre" }}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.38 + i * 0.07 }}
              >
                {w === "تتكلّمه" ? (
                  <span style={{
                    background: "linear-gradient(120deg, var(--v1-azure-soft), var(--v1-azure))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}>{w}</span>
                ) : w}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
          style={{
            fontSize: "var(--v1-lead)",
            lineHeight: 2,
            color: "var(--v1-t-mute)",
            maxWidth: 640,
            margin: "26px auto 0",
            fontWeight: 300,
          }}
        >
          {HERO.sub}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}
        >
          <Magnetic>
            <button type="button" data-open-form className="v1-cta v1-cta-primary">
              {HERO.primaryCTA}
              <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>←</span>
            </button>
          </Magnetic>
          <a href="#pricing" className="v1-cta v1-cta-ghost">{HERO.secondaryCTA}</a>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.35 }}
          style={{ display: "flex", gap: "10px 26px", justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}
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

        {/* ─── Floating product panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1.2 }}
          style={{ y: panelY, marginTop: 84, position: "relative" }}
        >
          {/* Halo under panel */}
          <div aria-hidden style={{
            position: "absolute", inset: "-8% -6% auto", height: "110%",
            background: "radial-gradient(ellipse 60% 55% at 50% 12%, rgba(56,189,248,0.14), transparent 70%)",
            filter: "blur(30px)", zIndex: 0,
          }} />
          <HeroPanel />
        </motion.div>
      </div>

      {/* Trusted-by strip */}
      <div className="v1-container" style={{ position: "relative", zIndex: 1, marginTop: 72, paddingBottom: 8 }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}
        >
          <span style={{ fontSize: "var(--v1-cap)", letterSpacing: "0.18em", color: "var(--v1-t-faint)", fontFamily: "var(--v1-display)", fontWeight: 600 }}>
            {TRUSTED_BY.label}
          </span>
          <div style={{ display: "flex", gap: "10px 12px", flexWrap: "wrap", justifyContent: "center" }}>
            {TRUSTED_BY.items.map((it) => (
              <span key={it} className="v1-chip" style={{ fontSize: "0.85rem", borderColor: "rgba(242,193,78,0.16)", background: "rgba(242,193,78,0.03)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.7 }}>
                  <path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" stroke="var(--v1-gold)" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                {it}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * HeroPanel — in-code glass dashboard (no images, real UI feel)
 * ──────────────────────────────────────────────────────────── */
function HeroPanel() {
  const wrapRef = useRef(null);
  const rx = useSpring(0, { stiffness: 140, damping: 24, mass: 0.8 });
  const ry = useSpring(0, { stiffness: 140, damping: 24, mass: 0.8 });
  const [tiltOn, setTiltOn] = useState(false);

  useEffect(() => {
    setTiltOn(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const onMove = (e) => {
    if (!tiltOn || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    ry.set(((e.clientX - (r.left + r.width / 2)) / r.width) * -5);
    rx.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 3.5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={wrapRef}
      dir="rtl"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
        position: "relative",
        zIndex: 1,
        maxWidth: 920,
        margin: "0 auto",
        borderRadius: "var(--v1-r-lg)",
        border: "1px solid var(--v1-line-strong)",
        background: "linear-gradient(170deg, rgba(16,26,44,0.92), rgba(8,13,24,0.94))",
        boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 90px rgba(0,0,0,0.55), 0 10px 40px rgba(2,132,199,0.12)",
        overflow: "hidden",
        textAlign: "start",
      }}
    >
      {/* Window chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: "1px solid var(--v1-line)" }}>
        <span style={{ display: "flex", gap: 6 }}>
          {["#f87171", "#fbbf24", "#4ade80"].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.75 }} />
          ))}
        </span>
        <span className="v1-num" style={{ marginInlineStart: "auto", fontSize: "0.72rem", color: "var(--v1-t-faint)", letterSpacing: "0.08em" }}>
          app.fluentia.academy
        </span>
      </div>

      <div className="v1-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 14, padding: 20 }}>
        {/* Greeting + week progress */}
        <PanelCard>
          <div style={{ fontFamily: "var(--v1-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--v1-t-strong)" }}>
            {MOCKUP.greeting}
          </div>
          <div style={{ marginTop: 14, fontSize: "0.78rem", color: "var(--v1-t-faint)" }}>{MOCKUP.weekProgress.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <div style={{ flex: 1, height: 7, borderRadius: 99, background: "rgba(148,197,255,0.1)", overflow: "hidden" }}>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: MOCKUP.weekProgress.value / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.4 }}
                style={{ height: "100%", transformOrigin: "right center", borderRadius: 99, background: "linear-gradient(to left, var(--v1-azure), var(--v1-azure-soft))" }}
              />
            </div>
            <span className="v1-num" style={{ fontWeight: 700, color: "var(--v1-azure-soft)", fontSize: "0.95rem" }}>
              {MOCKUP.weekProgress.value}%
            </span>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--v1-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)" }}>{MOCKUP.nextUnit.label}</div>
              <div className="v1-num" style={{ fontWeight: 600, color: "var(--v1-t)", fontSize: "0.95rem", marginTop: 3 }}>{MOCKUP.nextUnit.title}</div>
              <div style={{ fontSize: "0.74rem", color: "var(--v1-t-faint)", marginTop: 3 }}>{MOCKUP.nextUnit.chapter}</div>
            </div>
            <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden>
              <circle cx="23" cy="23" r="19" fill="none" stroke="rgba(148,197,255,0.12)" strokeWidth="4" />
              <motion.circle
                cx="23" cy="23" r="19" fill="none"
                stroke="var(--v1-azure)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 19}
                initial={{ strokeDashoffset: 2 * Math.PI * 19 }}
                whileInView={{ strokeDashoffset: 2 * Math.PI * 19 * (1 - MOCKUP.nextUnit.progress / 100) }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
                transform="rotate(-90 23 23)"
              />
            </svg>
          </div>
        </PanelCard>

        {/* AI feedback */}
        <PanelCard accent>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(56,189,248,0.14)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v10m0 0a3 3 0 003-3M12 13a3 3 0 01-3-3m3 8a7 7 0 007-7m-14 0a7 7 0 007 7m0 0v3" stroke="var(--v1-azure-soft)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--v1-t-mute)", fontWeight: 500 }}>{MOCKUP.feedback.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 16 }}>
            <span className="v1-num" style={{ fontSize: "2.3rem", fontWeight: 700, color: "var(--v1-t-strong)", lineHeight: 1 }}>
              {MOCKUP.feedback.score}
            </span>
            <span className="v1-num" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--v1-green)" }}>
              {MOCKUP.feedback.improvement} ▲
            </span>
          </div>
          {/* Waveform */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 26, marginTop: 14 }} aria-hidden>
            {[5, 12, 8, 18, 24, 14, 20, 10, 16, 22, 9, 15, 6, 11, 17].map((h, i) => (
              <motion.span
                key={i}
                initial={{ scaleY: 0.2, opacity: 0.4 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.04, ease: EASE }}
                style={{ width: 3.5, height: h, borderRadius: 4, background: i % 3 === 0 ? "var(--v1-azure)" : "rgba(125,211,252,0.4)", transformOrigin: "bottom" }}
              />
            ))}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--v1-t-mute)", marginTop: 12, lineHeight: 1.7 }}>
            {MOCKUP.feedback.note}
          </div>
        </PanelCard>

        {/* Vocab + live class */}
        <PanelCard>
          <div style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)" }}>{MOCKUP.vocab.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span className="v1-num" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--v1-t-strong)" }}>{MOCKUP.vocab.count}</span>
            <span style={{ fontSize: "0.76rem", color: "var(--v1-t-faint)" }}>كلمة</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {MOCKUP.vocab.sample.map((w) => (
              <span key={w} className="v1-num" style={{ fontSize: "0.72rem", padding: "4px 10px", borderRadius: 99, background: "rgba(148,197,255,0.07)", border: "1px solid var(--v1-line)", color: "var(--v1-t-mute)" }}>
                {w}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--v1-line)" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)" }}>{MOCKUP.liveClass.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--v1-green)", boxShadow: "0 0 8px var(--v1-green)" }} />
              <span className="v1-num" style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--v1-t)" }}>{MOCKUP.liveClass.when}</span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--v1-t-mute)", marginTop: 4 }}>{MOCKUP.liveClass.trainer}</div>
          </div>
        </PanelCard>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .v1-scope .v1-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}

function PanelCard({ children, accent }) {
  return (
    <div style={{
      borderRadius: "var(--v1-r-md)",
      border: accent ? "1px solid var(--v1-line-azure)" : "1px solid var(--v1-line)",
      background: accent
        ? "linear-gradient(165deg, rgba(56,189,248,0.09), rgba(56,189,248,0.02))"
        : "rgba(148,197,255,0.035)",
      padding: 18,
    }}>
      {children}
    </div>
  );
}
