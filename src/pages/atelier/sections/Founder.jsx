import { motion, useReducedMotion } from "framer-motion";
import { FOUNDER_LETTER } from "../atelier.copy";
import { EASE_REVEAL } from "../atelier.tokens";
import Reveal from "../Reveal";

function Seal() {
  // Gold monogram seal — circular emblem with the Arabic letter "ع", built in SVG.
  return (
    <svg width="76" height="76" viewBox="0 0 100 100" aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="atSealGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f4d27a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#atSealGold)" strokeWidth="1.4" opacity="0.9" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#atSealGold)" strokeWidth="0.6" opacity="0.45" />
      <circle cx="50" cy="50" r="34" fill="rgba(251,191,36,0.06)" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
        fontFamily="'Cairo', sans-serif" fontWeight="800" fontSize="42" fill="url(#atSealGold)">
        ع
      </text>
    </svg>
  );
}

export default function Founder() {
  const reduce = useReducedMotion();
  return (
    <section className="at-section">
      <div className="at-container" style={{ maxWidth: "820px" }}>
        <Reveal
          className="at-card at-card--gold"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(180deg, rgba(20,33,67,0.5), rgba(10,18,37,0.7))",
            padding: "clamp(28px, 5vw, 52px)",
            textAlign: "center",
          }}
        >
          <div className="at-glow" style={{ width: "60%", height: "50%", top: "-20%", insetInlineStart: "20%", background: "rgba(251,191,36,0.10)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="at-eyebrow" style={{ color: "var(--gold)", display: "block", marginBottom: "20px" }}>
              {FOUNDER_LETTER.eyebrow}
            </span>

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE_REVEAL }}
              style={{ display: "inline-flex", marginBottom: "22px", filter: "drop-shadow(0 8px 24px rgba(251,191,36,0.25))" }}
            >
              <Seal />
            </motion.div>

            <div style={{ textAlign: "start", maxWidth: "60ch", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
              {FOUNDER_LETTER.paragraphs.map((para, i) => (
                <Reveal as="p" key={i} delay={0.12 + i * 0.08} style={{ color: "var(--soft)", fontSize: "clamp(15px, 2.1vw, 17px)", lineHeight: 2 }}>
                  {para}
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.5} style={{ marginTop: "30px", paddingTop: "24px", borderTop: "1px solid var(--hairline-gold)" }}>
              <div style={{ fontFamily: "var(--display-ar)", fontWeight: 800, fontSize: "18px", color: "var(--cream)" }}>
                {FOUNDER_LETTER.name}
              </div>
              <div className="at-meta" style={{ marginTop: "4px" }}>{FOUNDER_LETTER.role}</div>
              <div style={{ marginTop: "14px", display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", alignItems: "baseline" }}>
                <span className="at-serif-it" style={{ fontSize: "20px", color: "var(--gold)" }}>{FOUNDER_LETTER.signatureEn}</span>
                <span style={{ fontFamily: "var(--body-ar)", fontSize: "16px", color: "var(--soft)" }}>{FOUNDER_LETTER.signatureAr}</span>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
