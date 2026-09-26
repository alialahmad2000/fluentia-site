import { useState } from "react";
import V5SectionFilm from "../v5/V5SectionFilm";
import { motion, AnimatePresence } from "framer-motion";
import { STORIES, FAQ, FOUNDER, FINAL_CTA, FOOTER, NAV } from "../landing-v2/content";
import { Reveal, staggerParent, staggerItem, EASE, SPRING_SMOOTH } from "./motion";
import { Magnetic } from "./V1Interactive";
import BrandMark from "../../components/BrandMark";
import HomePicture from "../v5/HomePicture";
import { useCta } from "./ctaContext";

/* ────────────────────────────────────────────────────────────
 * Stories — 3 real testimonials
 * ──────────────────────────────────────────────────────────── */
export function V1Stories() {
  return (
    <section className="v1-section" id="stories" style={{ position: "relative" }}>
      <div className="v1-glow v1-drift" aria-hidden style={{ width: 620, height: 620, top: "0%", insetInlineEnd: "-14%", background: "radial-gradient(circle, rgba(56,189,248,0.07), transparent 65%)" }} />
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow">{STORIES.eyebrow}</span>
          <h2 className="v1-headline">{STORIES.headline}</h2>
          <p className="v1-intro">{STORIES.intro}</p>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
          className="v1-stories-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 60 }}
        >
          {STORIES.cards.map((c) => (
            <motion.figure key={c.name} variants={staggerItem} className="v1-card v1-card-hover" style={{ margin: 0, padding: "clamp(24px, 3vw, 34px)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span aria-hidden style={{
                  width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(140deg, rgba(56,189,248,0.2), rgba(2,132,199,0.08))",
                  border: "1px solid var(--v1-line-azure)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--v1-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--v1-azure-soft)",
                }}>
                  {c.initial}
                </span>
                <div>
                  <div style={{ fontFamily: "var(--v1-display)", fontWeight: 700, color: "var(--v1-t-strong)", fontSize: "1rem" }}>{c.name}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--v1-t-faint)", marginTop: 2 }}>{c.role}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <span className="v1-chip v1-num" style={{ fontSize: "0.8rem", padding: "5px 12px", color: "var(--v1-azure-soft)", borderColor: "var(--v1-line-azure)", background: "rgba(56,189,248,0.05)" }}>
                  {c.level}
                </span>
                <span className="v1-chip v1-num" style={{ fontSize: "0.8rem", padding: "5px 12px" }}>{c.duration}</span>
              </div>

              <blockquote style={{ margin: "18px 0 0", fontSize: "0.95rem", lineHeight: 2, color: "var(--v1-t)", fontWeight: 300, flex: 1 }}>
                “{c.quote}”
              </blockquote>

              <figcaption style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--v1-line)", fontSize: "0.8rem", letterSpacing: "0.08em", color: "var(--v1-t-faint)", fontFamily: "var(--v1-display)", fontWeight: 600 }}>
                {c.tag}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .v1-scope .v1-stories-grid { grid-template-columns: 1fr !important; max-width: 560px; margin-inline: auto; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * FAQ — honest accordion
 * ──────────────────────────────────────────────────────────── */
export function V1FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="v1-section" id="faq" style={{ paddingTop: 0 }}>
      <div className="v1-container" style={{ maxWidth: 860 }}>
        <Reveal>
          <span className="v1-eyebrow">{FAQ.eyebrow}</span>
          <h2 className="v1-headline">{FAQ.headline}</h2>
          <p className="v1-intro">{FAQ.intro}</p>
        </Reveal>

        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className="v1-card" style={{ borderColor: isOpen ? "var(--v1-line-azure)" : "var(--v1-line)", overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18,
                      padding: "22px clamp(20px, 3vw, 30px)", background: "none", border: "none", cursor: "pointer",
                      textAlign: "start", color: "var(--v1-t-strong)",
                      fontFamily: "var(--v1-display)", fontSize: "clamp(1rem, 1.8vw, 1.15rem)", fontWeight: 600, lineHeight: 1.7,
                    }}
                  >
                    {item.q}
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={SPRING_SMOOTH}
                      aria-hidden
                      style={{
                        width: 30, height: 30, flexShrink: 0, borderRadius: "50%",
                        border: "1px solid var(--v1-line-strong)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: isOpen ? "var(--v1-azure-soft)" : "var(--v1-t-mute)", fontSize: "1.15rem", fontWeight: 300, lineHeight: 1,
                      }}
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        className="v1-acc-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: EASE }}
                      >
                        <p style={{ margin: 0, padding: "0 clamp(20px, 3vw, 30px) 26px", fontSize: "0.97rem", lineHeight: 2, color: "var(--v1-t-mute)", fontWeight: 300 }}>
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Founder — editorial letter with monogram seal
 * ──────────────────────────────────────────────────────────── */
export function V1Founder() {
  return (
    <section className="v1-section" id="founder" style={{ position: "relative" }}>
      <div className="v1-glow" aria-hidden style={{ width: 700, height: 700, top: "6%", insetInlineStart: "26%", background: "radial-gradient(circle, rgba(242,193,78,0.045), transparent 62%)" }} />
      <div className="v1-container" style={{ maxWidth: 780 }}>
        <Reveal>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Monogram seal */}
            <div aria-hidden style={{
              width: 76, height: 76, borderRadius: "50%",
              border: "1px solid var(--v1-line-gold)",
              background: "radial-gradient(circle at 35% 30%, rgba(242,193,78,0.14), rgba(242,193,78,0.02))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--v1-display)", fontSize: "2rem", fontWeight: 700, color: "var(--v1-gold-soft)",
              boxShadow: "0 0 40px rgba(242,193,78,0.12)",
            }}>
              ع
            </div>
            <span className="v1-eyebrow" style={{ color: "var(--v1-gold)", marginTop: 28 }}>{FOUNDER.eyebrow}</span>
            <h2 className="v1-headline" style={{ fontSize: "var(--v1-d2)" }}>{FOUNDER.headline}</h2>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
            {FOUNDER.paragraphs.map((p, i) => (
              <p key={i} style={{
                margin: 0, fontSize: "clamp(1rem, 1.7vw, 1.12rem)", lineHeight: 2.15,
                color: i === 0 ? "var(--v1-t-strong)" : "var(--v1-t-mute)",
                fontWeight: i === 0 ? 500 : 300,
              }}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid var(--v1-line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--v1-display)", fontWeight: 700, fontSize: "1.15rem", color: "var(--v1-t-strong)" }}>
                {FOUNDER.signature.name}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--v1-t-faint)", marginTop: 6, lineHeight: 1.7 }}>
                {FOUNDER.signature.title}
              </div>
            </div>
            <span aria-hidden style={{
              fontFamily: "'Aref Ruqaa', var(--v1-display)", fontSize: "2.5rem", fontWeight: 400,
              color: "var(--v1-gold-soft)", opacity: 0.9, lineHeight: 1.4,
            }}>
              د. علي
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Final CTA — wordmark moment + single button
 * ──────────────────────────────────────────────────────────── */
export function V1FinalCTA() {
  const cta = useCta();
  return (
    <section className="v1-section hi-cta v5-has-film" id="final-cta" style={{ position: "relative", overflow: "clip" }}>
      <V5SectionFilm src="/home/film-cta-1280.mp4" poster="/home/film-cta-poster-1280.webp" side="center" strength={0.9} />
      {/* The azure glow that sat behind this block is gone: the skyline below is
          now the light, and a blurred wash would have run over it. The words and
          their watermark stay on the page ground; the picture starts beneath them. */}
      <div className="hi-cta-head">
      {/* Giant watermark wordmark behind the closing statement */}
      <div aria-hidden className="hi-cta-mark" style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--v1-display)", fontWeight: 800, fontSize: "clamp(11rem, 30vw, 26rem)",
          lineHeight: 1, color: "transparent", WebkitTextStroke: "1px rgba(125,211,252,0.07)",
          transform: "translateY(6%)", whiteSpace: "nowrap", userSelect: "none",
        }}>
          طلاقة
        </span>
      </div>
      <div className="v1-container" style={{ textAlign: "center", position: "relative" }}>
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="v1-eyebrow">{FINAL_CTA.eyebrow}</span>
            <h2 style={{
              fontFamily: "var(--v1-display)",
              fontSize: "clamp(2.1rem, 5.6vw, 3.8rem)",
              fontWeight: 800, lineHeight: 1.38, letterSpacing: 0,
              color: "var(--v1-t-strong)", margin: "22px 0 0", maxWidth: 760,
            }}>
              {FINAL_CTA.headline}
            </h2>
            <p style={{ fontSize: "var(--v1-lead)", lineHeight: 2, color: "var(--v1-t-mute)", maxWidth: 560, margin: "22px auto 0", fontWeight: 300 }}>
              {FINAL_CTA.sub}
            </p>
            <Magnetic>
              <button type="button" data-open-form className="v1-cta v1-cta-primary" style={{ marginTop: 40, padding: "19px 52px", fontSize: "1.1rem" }}>
                {cta ? cta.label : FINAL_CTA.primaryCTA}
                <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>←</span>
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
      </div>
      {/* Riyadh at dawn: the payoff of the page's night-to-dawn arc. Full-bleed,
          faded into the page ground at both edges, never behind the headline. */}
      <div className="hi-cta-art" aria-hidden="true">
        <HomePicture
          id="cta-riyadh"
          variant="wide"
          sizes="100vw"
          art={[{ variant: "phone", media: "(max-width: 700px)", sizes: "100vw" }]}
        />
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Footer
 * ──────────────────────────────────────────────────────────── */
export function V1Footer() {
  const cta = useCta();
  return (
    <footer style={{ borderTop: "1px solid var(--v1-line)", padding: "clamp(44px, 6vw, 72px) 0 40px", position: "relative" }}>
      <div className="v1-container">
        <div className="v1-footer-grid" style={{ display: "grid", gridTemplateColumns: cta ? "1fr auto" : "1.6fr 1fr 1fr", gap: "36px 48px", alignItems: cta ? "end" : undefined }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <BrandMark size={30} />
              <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "var(--v1-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--v1-t-strong)" }}>{NAV.brand.ar}</span>
                <span className="v1-num" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: "var(--v1-azure)", textTransform: "uppercase" }}>{NAV.brand.en}</span>
              </span>
            </div>
            <p style={{ fontSize: "0.92rem", lineHeight: 2, color: "var(--v1-t-mute)", margin: "16px 0 0", maxWidth: 380, fontWeight: 300 }}>
              {FOOTER.tagline}
            </p>
          </div>

          {cta ? (
            <a href={FOOTER.contact.waLink} target="_blank" rel="noopener noreferrer" className="v1-num" dir="ltr" style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "0.95rem", padding: "12px 0" }}>
              {FOOTER.contact.whatsapp}
            </a>
          ) : (
          <>
          <div>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.14em", color: "var(--v1-t-faint)", fontFamily: "var(--v1-display)", fontWeight: 600, marginBottom: 18 }}>روابط</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {FOOTER.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "0.92rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v1-t-strong)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v1-t-mute)")}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.14em", color: "var(--v1-t-faint)", fontFamily: "var(--v1-display)", fontWeight: 600, marginBottom: 18 }}>تواصل</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li>
                <a href={FOOTER.contact.waLink} target="_blank" rel="noopener noreferrer" className="v1-num" dir="ltr" style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "0.9rem" }}>
                  {FOOTER.contact.whatsapp}
                </a>
              </li>
              <li>
                <a href={`mailto:${FOOTER.contact.email}`} className="v1-num" style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "0.9rem" }}>
                  {FOOTER.contact.email}
                </a>
              </li>
              {FOOTER.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="v1-num" style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "0.9rem" }}>
                    {s.label} ↖
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </>
          )}
        </div>

        <div style={{ marginTop: 52, paddingTop: 26, borderTop: "1px solid var(--v1-line)", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)" }} className="v1-num">{FOOTER.copyright}</span>
          <span style={{ display: "flex", gap: 20 }}>
            <a href="/privacy" style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)", textDecoration: "none" }}>الخصوصية</a>
            <a href="/terms" style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)", textDecoration: "none" }}>الشروط</a>
          </span>
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .v1-scope .v1-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
