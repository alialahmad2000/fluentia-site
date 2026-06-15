import { PRICING } from "../../landing-v2/content";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";
import { openLead } from "../cta";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : n);
const normFeatures = (features = []) =>
  features.map((f) => (typeof f === "string" ? { text: f, bold: false } : f));

function ribbonFor(card) {
  if (card.isHero || card.variant === "hero") return { text: "الأكثر طلباً", gold: true };
  if (card.badge) return { text: card.badge, gold: false };
  if (card.audienceLabel) return { text: card.audienceLabel, gold: false };
  return null;
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: "4px" }}>
      <path d="M5 12.5l4 4 10-10" stroke="var(--sky)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ card, delay }) {
  const hero = card.isHero || card.variant === "hero";
  const ribbon = ribbonFor(card);
  const features = normFeatures(card.features);
  const showAnchor = card.eidOffer && card.originalPrice && card.originalPrice > card.price;

  return (
    <Reveal
      delay={delay}
      className={`at-card ${hero ? "at-card--gold" : "at-card--lift"}`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        ...(hero
          ? { background: "linear-gradient(180deg, rgba(251,191,36,0.08), rgba(10,18,37,0.6))", boxShadow: "0 30px 80px -40px rgba(251,191,36,0.4)" }
          : {}),
      }}
    >
      {ribbon && (
        <span
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            top: "-12px",
            transform: "translateX(50%)",
            fontFamily: "var(--ui)",
            fontSize: "11.5px",
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: "100px",
            whiteSpace: "nowrap",
            background: ribbon.gold ? "linear-gradient(135deg, var(--gold), #f4d27a)" : "var(--nv)",
            color: ribbon.gold ? "#2a1d02" : "var(--soft)",
            border: ribbon.gold ? "none" : "1px solid var(--hairline)",
          }}
        >
          {ribbon.text}
        </span>
      )}

      <div>
        <h3 style={{ fontSize: "21px", color: "var(--cream)" }}>{card.name}</h3>
        {card.tagline && <p className="at-meta" style={{ marginTop: "6px", lineHeight: 1.6 }}>{card.tagline}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span className="at-numeral" style={{ fontSize: "38px", color: hero ? "var(--gold)" : "var(--cream)" }}>
          {fmt(card.price)}
        </span>
        {showAnchor && (
          <span style={{ color: "var(--muted)", textDecoration: "line-through", fontFamily: "var(--serif)", fontSize: "20px" }}>
            {fmt(card.originalPrice)}
          </span>
        )}
        <span className="at-meta">{card.priceSuffix || "ر.س / شهرياً"}</span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "11px", flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", gap: "11px", fontSize: "14px", lineHeight: 1.65, color: f.bold ? "var(--white)" : "var(--soft)", fontWeight: f.bold ? 600 : 400 }}>
            <Check />
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        className={`at-cta ${hero ? "at-cta--gold" : "at-cta--ghost"}`}
        style={{ justifyContent: "center", width: "100%" }}
        onClick={() => openLead(card.name)}
      >
        {card.ctaLabel || "تواصل لمعرفة المزيد"}
      </button>
    </Reveal>
  );
}

export default function Pricing() {
  const cards = [
    PRICING.studentTier && { ...PRICING.studentTier, _k: "student" },
    ...(PRICING.tiers || []),
  ].filter(Boolean);

  const eyebrow = (PRICING.eyebrow || "").replace(/^[^؀-٠A-Za-z]+/, "");

  return (
    <section id="at-pricing" className="at-section">
      <div className="at-container">
        <Reveal className="at-section-head" style={{ marginInline: "auto", textAlign: "center", maxWidth: "680px" }}>
          <span className="at-eyebrow" style={{ color: "var(--gold)" }}>{eyebrow}</span>
          <h2 className="at-title">{PRICING.headline}</h2>
          {PRICING.intro && <p className="at-lede" style={{ marginTop: "16px" }}>{PRICING.intro}</p>}
        </Reveal>

        <div
          className="at-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", alignItems: "stretch" }}
        >
          {cards.map((card, i) => (
            <Card key={card.id || card.name} card={card} delay={(i % 3) * STAGGER} />
          ))}
        </div>

        {PRICING.trust && (
          <Reveal delay={0.1}>
            <p className="at-meta" style={{ textAlign: "center", marginTop: "clamp(24px, 4vw, 38px)" }}>{PRICING.trust}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
