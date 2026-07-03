import { motion } from "framer-motion";
import { PRODUCT } from "../landing-v2/content";
import { Reveal, staggerParent, staggerItem, EASE } from "./motion";

/**
 * V1Product — bento showcase. Two big cells with in-code product
 * mockups (speaking AI + vocab SRS), two quiet cells.
 */
export default function V1Product() {
  const bigs = PRODUCT.cards.filter((c) => c.size === "big");
  const smalls = PRODUCT.cards.filter((c) => c.size === "small");

  return (
    <section className="v1-section" id="product" style={{ position: "relative" }}>
      <div className="v1-glow v1-drift-late" aria-hidden style={{ width: 640, height: 640, top: "20%", insetInlineEnd: "-14%", background: "radial-gradient(circle, rgba(2,132,199,0.09), transparent 65%)" }} />
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow">{PRODUCT.eyebrow}</span>
          <h2 className="v1-headline">{PRODUCT.headline}</h2>
          <p className="v1-intro">{PRODUCT.intro}</p>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
          className="v1-bento"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 64 }}
        >
          {bigs.map((c) => (
            <motion.article key={c.title} variants={staggerItem} className="v1-card v1-card-hover" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "clamp(24px, 3vw, 36px)", paddingBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0 }}>{c.title}</h3>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "var(--v1-t-mute)", margin: "10px 0 0", fontWeight: 300 }}>{c.tagline}</p>
                <p className="v1-num" style={{ fontSize: "0.8rem", lineHeight: 1.8, color: "var(--v1-azure-soft)", margin: "12px 0 0", fontWeight: 500 }}>{c.bullet}</p>
              </div>
              <div style={{ marginTop: "auto", padding: "0 clamp(18px, 2.4vw, 28px) clamp(18px, 2.4vw, 28px)" }}>
                {c.mockup === "speaking" ? <SpeakingMock /> : <VocabMock />}
              </div>
            </motion.article>
          ))}

          {smalls.map((c) => (
            <motion.article key={c.title} variants={staggerItem} className="v1-card v1-card-hover" style={{ padding: "clamp(24px, 3vw, 36px)", display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, flexShrink: 0, borderRadius: 14,
                background: "linear-gradient(140deg, rgba(56,189,248,0.13), rgba(56,189,248,0.03))",
                border: "1px solid var(--v1-line-azure)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {c.icon === "recording" ? (
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="var(--v1-azure-soft)" strokeWidth="1.7" /><path d="M10 9.5v5l4.2-2.5L10 9.5z" fill="var(--v1-azure-soft)" /></svg>
                ) : (
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="var(--v1-azure-soft)" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 12v9M12 12L4 7.5M12 12l8-4.5" stroke="var(--v1-azure-soft)" strokeWidth="1.4" /></svg>
                )}
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0 }}>{c.title}</h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.85, color: "var(--v1-t-mute)", margin: "8px 0 0", fontWeight: 300 }}>{c.tagline}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .v1-scope .v1-bento { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* In-code speaking-feedback mock */
function SpeakingMock() {
  return (
    <div style={{ borderRadius: "var(--v1-r-md)", border: "1px solid var(--v1-line)", background: "rgba(4,7,14,0.65)", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(56,189,248,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" stroke="var(--v1-azure-soft)" strokeWidth="1.8" /><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="var(--v1-azure-soft)" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2.5, height: 22 }} aria-hidden>
          {[6, 14, 9, 19, 12, 22, 8, 16, 11, 18, 7, 13, 20, 10, 15, 6, 12, 17, 9, 14].map((h, i) => (
            <motion.span key={i}
              initial={{ scaleY: 0.15 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.03, ease: EASE }}
              style={{ flex: 1, height: h, borderRadius: 3, background: i % 4 === 0 ? "var(--v1-azure)" : "rgba(125,211,252,0.35)", transformOrigin: "bottom" }} />
          ))}
        </div>
        <span className="v1-num" style={{ fontSize: "0.7rem", color: "var(--v1-t-faint)" }}>0:12</span>
      </div>
      <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--v1-green)" }}>تقييم AI · النطق</span>
          <span className="v1-num" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--v1-green)" }}>88<span style={{ fontSize: "0.65rem", opacity: 0.7 }}>/100</span></span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--v1-t-mute)" }}>
          نطقك لصوت <span className="v1-num" dir="ltr">/θ/</span> تحسّن بوضوح — ركّز على مدّ الحركة في <span className="v1-num" dir="ltr">"schedule"</span>.
        </p>
      </div>
    </div>
  );
}

/* In-code vocab SRS mock */
function VocabMock() {
  const cards = [
    { w: "commute", due: "الآن", strength: 0.35, hot: true },
    { w: "routine", due: "بعد يومين", strength: 0.7 },
    { w: "schedule", due: "بعد أسبوع", strength: 0.9 },
  ];
  return (
    <div style={{ borderRadius: "var(--v1-r-md)", border: "1px solid var(--v1-line)", background: "rgba(4,7,14,0.65)", padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
      {cards.map((c, i) => (
        <motion.div key={c.w}
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: EASE }}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 13px",
            borderRadius: 11, border: c.hot ? "1px solid var(--v1-line-azure)" : "1px solid var(--v1-line)",
            background: c.hot ? "rgba(56,189,248,0.07)" : "rgba(148,197,255,0.03)",
          }}>
          <span className="v1-num" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--v1-t-strong)", direction: "ltr" }}>{c.w}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(148,197,255,0.1)", overflow: "hidden" }}>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: c.strength }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.45 + i * 0.1, ease: EASE }}
              style={{ height: "100%", transformOrigin: "right center", background: c.hot ? "var(--v1-azure)" : "var(--v1-green)", borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: "0.7rem", color: c.hot ? "var(--v1-azure-soft)" : "var(--v1-t-faint)", fontWeight: c.hot ? 600 : 400 }}>{c.due}</span>
        </motion.div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--v1-line)" }}>
        <span style={{ fontSize: "0.74rem", color: "var(--v1-t-faint)" }}>نظام التكرار المتباعد · Anki SRS</span>
        <span className="v1-num" style={{ fontSize: "0.74rem", color: "var(--v1-azure-soft)", fontWeight: 600 }}>+15,000 كلمة</span>
      </div>
    </div>
  );
}
