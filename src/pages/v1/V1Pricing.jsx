import { motion } from "framer-motion";
import { PRICING } from "../landing-v2/content";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import { Reveal, staggerParent, staggerItem } from "./motion";

const fmt = (n) => n.toLocaleString("en-US");

/**
 * V1Pricing — reads everything from live content.js (single source
 * of truth). Entry tier → 3-tier grid (gold hero) → VIP → footer.
 */
export default function V1Pricing() {
  const { entryTier: entry, tiers, vipTier: vip } = PRICING;
  const daily = Math.round(entry.price / 30);

  return (
    <section className="v1-section" id="pricing" style={{ position: "relative" }}>
      <div className="v1-glow" aria-hidden style={{ width: 860, height: 860, top: "22%", insetInlineStart: "12%", background: "radial-gradient(circle, rgba(242,193,78,0.06), transparent 60%)" }} />
      <div className="v1-container">
        <Reveal>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="v1-eyebrow" style={{ color: "var(--v1-gold)" }}>{PRICING.eyebrow}</span>
            <h2 className="v1-headline">{PRICING.headline}</h2>
            <p className="v1-intro" style={{ textAlign: "center" }}>{PRICING.intro}</p>
            <p style={{ marginTop: 20, fontSize: "var(--v1-body-s)", color: "var(--v1-t-faint)" }}>
              <span className="v1-num">{PRICING.trust}</span>
              {" · "}يبدأ من <b className="v1-num" style={{ color: "var(--v1-azure-soft)" }}>{daily} ر.س/يوم</b> تقريباً
            </p>
          </div>
        </Reveal>

        {/* ── Entry tier (wide) ── */}
        <Reveal delay={0.05}>
          <article className="v1-card v1-card-hover v1-entry" style={{ marginTop: 60, padding: "clamp(26px, 3.6vw, 42px)", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "22px 48px", alignItems: "center" }}>
            <div>
              <span className="v1-chip" style={{ borderColor: "var(--v1-line-azure)", color: "var(--v1-azure-soft)", background: "rgba(56,189,248,0.06)", fontSize: "0.78rem" }}>
                {entry.badge}
              </span>
              <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)", fontWeight: 800, color: "var(--v1-t-strong)", margin: "16px 0 0" }}>
                {entry.name}
              </h3>
              <p style={{ fontSize: "0.98rem", lineHeight: 1.9, color: "var(--v1-t-mute)", margin: "8px 0 0", fontWeight: 300 }}>{entry.tagline}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }} className="v1-entry-feats">
                {entry.features.map((f) => (
                  <Feat key={f} text={f} />
                ))}
              </ul>
            </div>
            <div style={{ textAlign: "center", borderInlineStart: "1px solid var(--v1-line)", paddingInlineStart: "clamp(0px, 3vw, 40px)" }} className="v1-entry-price">
              <PriceBlock price={entry.price} original={entry.originalPrice} suffix={entry.priceSuffix} savings={entry.savings} />
              <button type="button" data-open-form data-tier={entry.id} className="v1-cta v1-cta-primary" style={{ width: "100%", marginTop: 22 }}>
                {entry.ctaLabel}
              </button>
              <p style={{ fontSize: "0.78rem", color: "var(--v1-t-faint)", lineHeight: 1.8, marginTop: 14 }}>{entry.whoFor.body}</p>
            </div>
          </article>
        </Reveal>

        {/* ── 3-tier grid ── */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-6% 0px" }}
          className="v1-tiers"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 22, alignItems: "stretch" }}
        >
          {tiers.map((t) => {
            const hero = t.isHero;
            return (
              <motion.article
                key={t.id}
                variants={staggerItem}
                className="v1-card"
                style={{
                  padding: "clamp(26px, 3vw, 36px)",
                  display: "flex",
                  flexDirection: "column",
                  ...(hero
                    ? {
                        border: "1px solid var(--v1-line-gold)",
                        background: "linear-gradient(170deg, rgba(242,193,78,0.08), rgba(242,193,78,0.015) 55%)",
                        boxShadow: "var(--v1-shadow-gold)",
                        transform: "translateY(-6px)",
                      }
                    : {}),
                }}
              >
                {hero && (
                  <div style={{
                    position: "absolute", top: 0, insetInline: 0, height: 3,
                    background: "linear-gradient(to left, transparent, var(--v1-gold), transparent)",
                  }} aria-hidden />
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "1.45rem", fontWeight: 800, color: hero ? "var(--v1-gold-soft)" : "var(--v1-t-strong)", margin: 0 }}>
                    {t.name}
                  </h3>
                  {hero && (
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
                      color: "#241703", background: "linear-gradient(135deg, var(--v1-gold-soft), var(--v1-gold))",
                      padding: "5px 12px", borderRadius: 99, fontFamily: "var(--v1-display)",
                    }}>
                      الأكثر طلباً
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.8, color: "var(--v1-t-mute)", margin: "10px 0 0", fontWeight: 300, minHeight: 44 }}>
                  {t.tagline}
                </p>
                <div style={{ margin: "22px 0", paddingBlock: 20, borderBlock: "1px solid var(--v1-line)" }}>
                  <PriceBlock price={t.price} original={t.originalPrice} suffix={t.priceSuffix} savings={t.savings} gold={hero} compact />
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {t.features.map((f) => (
                    <Feat key={f.text} text={f.text} bold={f.bold} gold={hero} />
                  ))}
                </ul>
                <button
                  type="button"
                  data-open-form
                  data-tier={t.id}
                  className={`v1-cta ${hero ? "v1-cta-gold" : "v1-cta-ghost"}`}
                  style={{ width: "100%", marginTop: 26 }}
                >
                  {t.ctaLabel}
                </button>
              </motion.article>
            );
          })}
        </motion.div>

        {/* ── VIP tier (wide) ── */}
        <Reveal delay={0.05}>
          <article className="v1-card v1-card-hover v1-vip" style={{
            marginTop: 22, padding: "clamp(26px, 3.6vw, 42px)",
            display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "22px 48px", alignItems: "center",
            border: "1px solid rgba(242,193,78,0.24)",
            background: "linear-gradient(170deg, rgba(242,193,78,0.05), rgba(148,197,255,0.015) 60%)",
          }}>
            <div>
              <span className="v1-chip" style={{ borderColor: "var(--v1-line-gold)", color: "var(--v1-gold-soft)", background: "rgba(242,193,78,0.06)", fontSize: "0.78rem" }}>
                {vip.badge}
              </span>
              <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)", fontWeight: 800, color: "var(--v1-t-strong)", margin: "16px 0 0" }}>
                {vip.name}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--v1-gold-soft)", margin: "6px 0 0", fontWeight: 500 }}>{vip.audienceLabel}</p>
              <p style={{ fontSize: "0.98rem", lineHeight: 1.9, color: "var(--v1-t-mute)", margin: "8px 0 0", fontWeight: 300 }}>{vip.tagline}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }} className="v1-entry-feats">
                {vip.features.map((f) => (
                  <Feat key={f} text={f} gold />
                ))}
              </ul>
            </div>
            <div style={{ textAlign: "center", borderInlineStart: "1px solid var(--v1-line)", paddingInlineStart: "clamp(0px, 3vw, 40px)" }} className="v1-entry-price">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, direction: "ltr" }}>
                <span className="v1-num" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", fontWeight: 800, color: "var(--v1-t-strong)" }}>
                  {fmt(vip.priceLow)}–{fmt(vip.priceHigh)}
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--v1-t-faint)", marginTop: 6 }}>{vip.priceSuffix}</div>
              <p style={{ fontSize: "0.78rem", color: "var(--v1-t-mute)", lineHeight: 1.85, marginTop: 14 }}>{vip.priceNote}</p>
              <button type="button" data-open-form data-tier={vip.id} className="v1-cta v1-cta-gold" style={{ width: "100%", marginTop: 20 }}>
                {vip.ctaLabel}
              </button>
            </div>
          </article>
        </Reveal>

        {/* footer line */}
        <Reveal delay={0.05}>
          <p style={{ textAlign: "center", marginTop: 44, fontSize: "0.95rem", color: "var(--v1-t-mute)" }}>
            {PRICING.footer.line}{" "}
            <a
              href={buildWhatsAppUrl("السلام عليكم، عندي استفسار عن الباقة المناسبة لي")}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--v1-azure-soft)", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid var(--v1-line-azure)", paddingBottom: 2 }}
            >
              {PRICING.footer.waLabel} ↖
            </a>
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .v1-scope .v1-tiers { grid-template-columns: 1fr !important; max-width: 520px; margin-inline: auto; }
          .v1-scope .v1-tiers article { transform: none !important; }
        }
        @media (max-width: 860px) {
          .v1-scope .v1-entry, .v1-scope .v1-vip { grid-template-columns: 1fr !important; }
          .v1-scope .v1-entry-price { border-inline-start: none !important; padding-inline-start: 0 !important; border-top: 1px solid var(--v1-line); padding-top: 24px; }
        }
        @media (max-width: 560px) {
          .v1-scope .v1-entry-feats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Feat({ text, bold, gold }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.9rem", lineHeight: 1.75, color: bold ? "var(--v1-t-strong)" : "var(--v1-t)", fontWeight: bold ? 600 : 300 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 5 }} aria-hidden>
        <path d="M5 13l4 4L19 7" stroke={gold ? "var(--v1-gold)" : "var(--v1-azure)"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="v1-num">{text}</span>
    </li>
  );
}

function PriceBlock({ price, original, suffix, savings, gold, compact }) {
  return (
    <div>
      {original && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span className="v1-num" style={{ fontSize: "0.95rem", color: "var(--v1-t-faint)", textDecoration: "line-through", direction: "ltr" }}>
            {fmt(original)}
          </span>
          {savings ? (
            <span className="v1-num" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--v1-green)", background: "rgba(74,222,128,0.09)", border: "1px solid rgba(74,222,128,0.25)", padding: "3px 9px", borderRadius: 99, direction: "ltr" }}>
              وفّر {fmt(savings)}
            </span>
          ) : null}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginTop: 6 }}>
        <span className="v1-num" style={{
          fontSize: compact ? "clamp(2.1rem, 3.4vw, 2.7rem)" : "clamp(2.4rem, 4vw, 3.2rem)",
          fontWeight: 800, lineHeight: 1,
          color: gold ? "var(--v1-gold-soft)" : "var(--v1-t-strong)",
          letterSpacing: "-0.02em",
        }}>
          {fmt(price)}
        </span>
      </div>
      <div style={{ fontSize: "0.82rem", color: "var(--v1-t-faint)", marginTop: 8 }}>{suffix}</div>
    </div>
  );
}
