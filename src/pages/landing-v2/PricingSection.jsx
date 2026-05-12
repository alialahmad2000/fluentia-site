import { Container, EyebrowLabel, Reveal, PrimaryCTA, SecondaryCTA } from "../../components/landing";
import { PRICING } from "./content";

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft amber glow at top */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-200px",
          insetInlineStart: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.10), transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Container>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "var(--lp-space-2xl)", position: "relative" }}>
            <div style={{ display: "inline-flex" }}>
              <EyebrowLabel>{PRICING.eyebrow}</EyebrowLabel>
            </div>
            <h2
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h1)",
                fontWeight: 800,
                color: "var(--lp-text-strong)",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: "var(--lp-space-md)",
                maxWidth: "var(--lp-max-w-text)",
                marginInline: "auto",
              }}
            >
              {PRICING.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
                maxWidth: "var(--lp-max-w-text)",
                marginInline: "auto",
                marginBottom: "var(--lp-space-md)",
              }}
            >
              {PRICING.intro}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--lp-space-sm)",
                paddingBlock: 6,
                paddingInline: 14,
                background: "rgba(74,222,128,0.10)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: "var(--lp-radius-pill)",
                color: "var(--lp-success)",
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-caption)",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              ✓ {PRICING.trust}
            </div>
          </div>
        </Reveal>

        {/* 3 monthly tiers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
            alignItems: "stretch",
            marginBottom: "var(--lp-space-2xl)",
          }}
          className="lp-pricing-grid"
        >
          {PRICING.tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.1}>
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </div>

        {/* IELTS card */}
        <Reveal delay={0.3}>
          <IELTSCard ielts={PRICING.ielts} />
        </Reveal>

        {/* Pricing footer */}
        <Reveal delay={0.4}>
          <div
            style={{
              marginTop: "var(--lp-space-2xl)",
              textAlign: "center",
              color: "var(--lp-text-muted)",
              fontSize: "var(--lp-body)",
            }}
          >
            {PRICING.footer.line}{" "}
            <a
              href="https://wa.me/966558669974"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--lp-amber-bright)",
                textDecoration: "none",
                fontWeight: 700,
                borderBottom: "1px solid var(--lp-border-amber)",
                paddingBottom: 1,
              }}
            >
              {PRICING.footer.waLabel} ←
            </a>
          </div>
        </Reveal>
      </Container>

      <style>{`
        @media (max-width: 1000px) {
          .lp-pricing-grid {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
            margin-inline: auto !important;
          }
          .lp-tier-hero {
            transform: scale(1) !important;
          }
        }
      `}</style>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Monthly tier card
// ────────────────────────────────────────────────────────────

function TierCard({ tier }) {
  const hero = !!tier.isHero;
  return (
    <article
      className={hero ? "lp-tier-hero" : ""}
      style={{
        height: "100%",
        position: "relative",
        padding: "var(--lp-space-xl)",
        background: hero
          ? "linear-gradient(180deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02) 60%, var(--lp-bg-elevated))"
          : "var(--lp-bg-elevated)",
        border: hero
          ? "2px solid var(--lp-amber)"
          : "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-lg)",
        display: "flex",
        flexDirection: "column",
        boxShadow: hero ? "var(--lp-shadow-amber)" : "none",
        transform: hero ? "scale(1.04)" : "scale(1)",
        transition:
          "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease), box-shadow var(--lp-dur-med) var(--lp-ease)",
      }}
      onMouseEnter={(e) => {
        if (!hero) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = "var(--lp-border-amber)";
        }
      }}
      onMouseLeave={(e) => {
        if (!hero) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
        }
      }}
    >
      {/* Badge */}
      {tier.badge && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            paddingBlock: 6,
            paddingInline: 16,
            background: "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
            color: "#0a0e1a",
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-caption)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            borderRadius: "var(--lp-radius-pill)",
            boxShadow: "var(--lp-shadow-amber-strong)",
            whiteSpace: "nowrap",
          }}
        >
          ⭐ {tier.badge}
        </div>
      )}

      {/* Name + tagline */}
      <div style={{ marginBottom: "var(--lp-space-lg)" }}>
        <h3
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-h2)",
            fontWeight: 900,
            color: "var(--lp-text-strong)",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: "var(--lp-space-sm)",
          }}
        >
          {tier.name}
        </h3>
        <p
          style={{
            fontSize: "var(--lp-body)",
            color: "var(--lp-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {tier.tagline}
        </p>
      </div>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "var(--lp-space-sm)",
          marginBottom: "var(--lp-space-lg)",
          paddingBottom: "var(--lp-space-lg)",
          borderBottom: hero
            ? "1px solid var(--lp-border-amber)"
            : "1px solid var(--lp-border-subtle)",
        }}
      >
        <span
          className="lp-num"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.25rem)",
            fontWeight: 900,
            color: hero ? "var(--lp-amber-bright)" : "var(--lp-text-strong)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tier.price.toLocaleString("en")}
        </span>
        <span
          style={{
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-text-muted)",
            fontFamily: "var(--lp-font-body)",
          }}
        >
          {tier.priceSuffix}
        </span>
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          marginBottom: "var(--lp-space-xl)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--lp-space-md)",
          flex: 1,
        }}
      >
        {tier.features.map((f, j) => (
          <li
            key={j}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--lp-space-md)",
              color: f.bold ? "var(--lp-text-strong)" : "var(--lp-text-muted)",
              fontSize: "var(--lp-body-s)",
              lineHeight: 1.6,
              fontWeight: f.bold ? 600 : 400,
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(74,222,128,0.15)",
                color: "var(--lp-success)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                marginTop: 2,
              }}
            >
              ✓
            </span>
            <span>{f.text}</span>
          </li>
        ))}
        {/* Missing features — strikethrough (only for الجماعي) */}
        {tier.missing &&
          tier.missing.map((m, k) => (
            <li
              key={`m-${k}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--lp-space-md)",
                color: "var(--lp-text-faint)",
                fontSize: "var(--lp-body-s)",
                lineHeight: 1.6,
                textDecoration: "line-through",
                textDecorationColor: "rgba(248,250,252,0.2)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.08)",
                  color: "var(--lp-danger)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  marginTop: 2,
                  opacity: 0.7,
                }}
              >
                ×
              </span>
              <span>{m}</span>
            </li>
          ))}
      </ul>

      {/* CTA */}
      {hero ? (
        <PrimaryCTA href="#cta" style={{ width: "100%", justifyContent: "center" }}>
          {tier.ctaLabel} ←
        </PrimaryCTA>
      ) : (
        <SecondaryCTA href="#cta" style={{ width: "100%", justifyContent: "center" }}>
          {tier.ctaLabel}
        </SecondaryCTA>
      )}
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// IELTS card (wide, 2-col)
// ────────────────────────────────────────────────────────────

function IELTSCard({ ielts }) {
  return (
    <article
      style={{
        padding: "var(--lp-space-2xl)",
        background:
          "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, var(--lp-bg-elevated) 50%, rgba(74,222,128,0.04) 100%)",
        border: "1px solid var(--lp-border-bold)",
        borderRadius: "var(--lp-radius-lg)",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
        gap: "var(--lp-space-2xl)",
      }}
      className="lp-ielts-card"
    >
      {/* LEFT — name, price, features */}
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            paddingBlock: 6,
            paddingInline: 12,
            background: "var(--lp-bg-base)",
            border: "1px solid var(--lp-border-amber)",
            borderRadius: "var(--lp-radius-pill)",
            color: "var(--lp-amber-bright)",
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-caption)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: "var(--lp-space-md)",
          }}
        >
          🎯 {ielts.badge}
        </div>

        <h3
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-h2)",
            fontWeight: 900,
            color: "var(--lp-text-strong)",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: "var(--lp-space-sm)",
          }}
        >
          {ielts.name}
        </h3>
        <p
          style={{
            fontSize: "var(--lp-body-l)",
            color: "var(--lp-text-muted)",
            margin: 0,
            marginBottom: "var(--lp-space-lg)",
            lineHeight: 1.5,
          }}
        >
          {ielts.headline}
        </p>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "var(--lp-space-sm)",
            marginBottom: "var(--lp-space-xs)",
          }}
        >
          <span
            className="lp-num"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.25rem)",
              fontWeight: 900,
              color: "var(--lp-amber-bright)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {ielts.price.toLocaleString("en")}
          </span>
          <span style={{ fontSize: "var(--lp-body-s)", color: "var(--lp-text-muted)" }}>
            {ielts.priceSuffix}
          </span>
        </div>
        <div
          style={{
            fontSize: "var(--lp-caption)",
            color: "var(--lp-text-faint)",
            marginBottom: "var(--lp-space-xl)",
          }}
        >
          {ielts.pricePer}
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--lp-space-sm)",
            marginBottom: "var(--lp-space-xl)",
          }}
        >
          {ielts.features.map((f, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--lp-space-md)",
                color: "var(--lp-text-muted)",
                fontSize: "var(--lp-body-s)",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(74,222,128,0.15)",
                  color: "var(--lp-success)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  marginTop: 2,
                }}
              >
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <PrimaryCTA href="#cta">{ielts.ctaLabel} ←</PrimaryCTA>
      </div>

      {/* RIGHT — guarantee callout */}
      <div
        style={{
          background: "var(--lp-bg-base)",
          border: "1px solid var(--lp-border-amber)",
          borderRadius: "var(--lp-radius-card)",
          padding: "var(--lp-space-xl)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--lp-space-md)",
          position: "relative",
        }}
      >
        {/* Guarantee seal */}
        <div
          style={{
            position: "absolute",
            top: -16,
            insetInlineEnd: -16,
            width: 72,
            height: 72,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber-deep))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0a0e1a",
            fontFamily: "var(--lp-font-display)",
            fontWeight: 900,
            fontSize: "var(--lp-body-s)",
            textAlign: "center",
            lineHeight: 1.1,
            boxShadow: "var(--lp-shadow-amber-strong)",
            transform: "rotate(-8deg)",
          }}
        >
          ضمان<br />كامل
        </div>

        <div
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-h3)",
            fontWeight: 800,
            color: "var(--lp-amber-bright)",
            lineHeight: 1.2,
          }}
        >
          {ielts.guarantee.title}
        </div>
        <p
          style={{
            fontSize: "var(--lp-body)",
            color: "var(--lp-text)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {ielts.guarantee.body}
        </p>
        <div
          style={{
            marginTop: "auto",
            paddingTop: "var(--lp-space-md)",
            borderTop: "1px solid var(--lp-border-subtle)",
            fontSize: "var(--lp-caption)",
            color: "var(--lp-text-muted)",
            lineHeight: 1.5,
          }}
        >
          {ielts.guarantee.condition}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .lp-ielts-card {
            grid-template-columns: 1fr !important;
            padding: var(--lp-space-xl) !important;
          }
        }
      `}</style>
    </article>
  );
}
