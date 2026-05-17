import { Container, EyebrowLabel, Reveal, PrimaryCTA, SecondaryCTA } from "../../components/landing";
import { PRICING, REGISTRATION, getRegistrationStatus } from "./content";

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

        {/* WhyClose — quiet italic line */}
        <Reveal delay={0.12}>
          <p
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-body-s)",
              fontStyle: "italic",
              color: "var(--lp-text-muted)",
              textAlign: "center",
              margin: 0,
              marginBottom: "var(--lp-space-2xl)",
              letterSpacing: "0.02em",
              maxWidth: "var(--lp-max-w-text)",
              marginInline: "auto",
            }}
          >
            — {REGISTRATION.whyClose} —
          </p>
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
          {PRICING.tiers.map((tier, i) => {
            const t = REGISTRATION.tiers[tier.id];
            const status = getRegistrationStatus();
            return (
              <Reveal key={tier.id} delay={i * 0.1}>
                <TierCard tier={tier} availability={t} regStatus={status} />
              </Reveal>
            );
          })}
        </div>

        {/* IELTS card */}
        <Reveal delay={0.3}>
          <IELTSCard
            ielts={PRICING.ielts}
            availability={REGISTRATION.tiers.l3a_ielts}
            regStatus={getRegistrationStatus()}
          />
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

function TierCard({ tier, availability, regStatus }) {
  // Resolve variant with backward-compat fallback
  const variant = tier.variant || (tier.isHero ? "hero" : "standard");
  const isHero = variant === "hero";
  const isExclusive = variant === "exclusive";
  // keep legacy 'hero' local var for className
  const hero = isHero;

  return (
    <article
      className={hero ? "lp-tier-hero" : ""}
      style={{
        height: "100%",
        position: "relative",
        padding: "var(--lp-space-xl)",
        background: isHero
          ? "linear-gradient(180deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02) 60%, var(--lp-bg-elevated))"
          : isExclusive
          ? "linear-gradient(180deg, #060912 0%, #0a0e1a 100%)"
          : "var(--lp-bg-elevated)",
        border: isHero
          ? "2px solid var(--lp-amber)"
          : isExclusive
          ? "1px solid rgba(180, 83, 9, 0.4)"
          : "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-lg)",
        display: "flex",
        flexDirection: "column",
        boxShadow: isHero
          ? "var(--lp-shadow-amber)"
          : isExclusive
          ? "inset 0 1px 0 rgba(180, 83, 9, 0.15), 0 10px 40px rgba(0,0,0,0.4)"
          : "none",
        transform: isHero ? "scale(1.04)" : "scale(1)",
        transition:
          "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease), box-shadow var(--lp-dur-med) var(--lp-ease)",
      }}
      onMouseEnter={(e) => {
        if (isHero) return;
        e.currentTarget.style.transform = "translateY(-4px)";
        if (isExclusive) {
          e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.7)";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(180, 83, 9, 0.25), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(180, 83, 9, 0.15)";
        } else {
          e.currentTarget.style.borderColor = "var(--lp-border-amber)";
        }
      }}
      onMouseLeave={(e) => {
        if (isHero) return;
        e.currentTarget.style.transform = "scale(1)";
        if (isExclusive) {
          e.currentTarget.style.borderColor = "rgba(180, 83, 9, 0.4)";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(180, 83, 9, 0.15), 0 10px 40px rgba(0,0,0,0.4)";
        } else {
          e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
        }
      }}
    >
      {/* Availability badge */}
      <AvailabilityBadge availability={availability} regStatus={regStatus} />

      {/* Audience pill — exclusive variant only */}
      {isExclusive && tier.audienceLabel && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            paddingBlock: 4,
            paddingInline: 10,
            background: "rgba(180, 83, 9, 0.10)",
            border: "1px solid rgba(180, 83, 9, 0.30)",
            borderRadius: "var(--lp-radius-pill)",
            color: "#d97706",
            fontFamily: "var(--lp-font-display)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginBottom: "var(--lp-space-md)",
            width: "fit-content",
          }}
        >
          💼 {tier.audienceLabel}
        </div>
      )}

      {/* Name + tagline */}
      <div style={{ marginBottom: "var(--lp-space-lg)" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
          <h3
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-h2)",
              fontWeight: 900,
              color: "var(--lp-text-strong)",
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: isExclusive ? "0.01em" : "-0.01em",
            }}
          >
            {tier.name}
          </h3>
          {isExclusive && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                bottom: -6,
                insetInlineStart: 0,
                width: 48,
                height: 2,
                background:
                  "linear-gradient(90deg, #d97706, rgba(180, 83, 9, 0.2) 70%, transparent)",
                borderRadius: 2,
              }}
            />
          )}
        </div>
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
          borderBottom: isHero
            ? "1px solid var(--lp-border-amber)"
            : isExclusive
            ? "1px solid rgba(180, 83, 9, 0.25)"
            : "1px solid var(--lp-border-subtle)",
        }}
      >
        <span
          className="lp-num"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.25rem)",
            fontWeight: 900,
            color: isHero
              ? "var(--lp-amber-bright)"
              : isExclusive
              ? "#d97706"
              : "var(--lp-text-strong)",
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
      </ul>

      {/* CTA — dynamic based on availability + variant */}
      {(() => {
        const isFull = availability && availability.available === 0;
        const ctaLabel = isFull
          ? regStatus === "closed_before"
            ? "احجز للفترة القادمة"
            : regStatus === "open"
            ? "ممتلئة — انضم لقائمة الانتظار"
            : "احجز اهتمامك"
          : tier.ctaLabel;
        const baseProps = {
          "data-open-form": "true",
          "data-tier": tier.id,
        };

        if (isHero) {
          return (
            <PrimaryCTA {...baseProps} style={{ width: "100%", justifyContent: "center" }}>
              {ctaLabel} ←
            </PrimaryCTA>
          );
        }

        if (isExclusive) {
          return (
            <button
              type="button"
              {...baseProps}
              style={{
                width: "100%",
                paddingBlock: 14,
                paddingInline: 20,
                background: "transparent",
                color: "#d97706",
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-body)",
                fontWeight: 700,
                border: "1px solid rgba(180, 83, 9, 0.5)",
                borderRadius: "var(--lp-radius-pill)",
                cursor: "pointer",
                transition:
                  "background var(--lp-dur-fast) var(--lp-ease), border-color var(--lp-dur-fast) var(--lp-ease), color var(--lp-dur-fast) var(--lp-ease)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(180, 83, 9, 0.10)";
                e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.8)";
                e.currentTarget.style.color = "#fbbf24";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(180, 83, 9, 0.5)";
                e.currentTarget.style.color = "#d97706";
              }}
            >
              {ctaLabel} ←
            </button>
          );
        }

        return (
          <SecondaryCTA {...baseProps} style={{ width: "100%", justifyContent: "center" }}>
            {ctaLabel}
          </SecondaryCTA>
        );
      })()}
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// IELTS card (wide, 2-col)
// ────────────────────────────────────────────────────────────

function IELTSCard({ ielts, availability, regStatus }) {
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
        maxWidth: "var(--lp-max-w-text)",
        marginInline: "auto",
      }}
      className="lp-ielts-card"
    >
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

        <div style={{ marginTop: 8, marginBottom: "var(--lp-space-md)" }}>
          <AvailabilityBadge availability={availability} regStatus={regStatus} />
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

        {(() => {
          const isFull = availability && availability.available === 0;
          const label = isFull
            ? regStatus === "closed_before"
              ? "احجز للفترة القادمة"
              : "ممتلئة — قائمة الانتظار"
            : ielts.ctaLabel;
          return (
            <PrimaryCTA data-open-form="true" data-tier="l3a_ielts">
              {label} ←
            </PrimaryCTA>
          );
        })()}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .lp-ielts-card {
            padding: var(--lp-space-xl) !important;
          }
        }
      `}</style>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// Availability badge subcomponent
// ────────────────────────────────────────────────────────────

function AvailabilityBadge({ availability, regStatus }) {
  if (!availability) return null;
  const { available, total } = availability;

  let bg, border, color, label;
  if (regStatus === "closed_before") {
    bg = "rgba(251,191,36,0.10)";
    border = "var(--lp-border-amber)";
    color = "var(--lp-amber-bright)";
    label = `${available} مقاعد لفترة التسجيل القادمة`;
  } else if (available === 0) {
    bg = "rgba(239,68,68,0.10)";
    border = "rgba(239,68,68,0.35)";
    color = "#f87171";
    label = `ممتلئة · ${total}/${total} مأخوذ`;
  } else if (available <= Math.ceil(total / 2)) {
    bg = "rgba(251,191,36,0.10)";
    border = "var(--lp-border-amber)";
    color = "var(--lp-amber-bright)";
    label = `${available} مقاعد متبقية فقط`;
  } else {
    bg = "rgba(74,222,128,0.10)";
    border = "rgba(74,222,128,0.30)";
    color = "var(--lp-success)";
    label = `${available} مقعد متاح`;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingBlock: 5,
        paddingInline: 10,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--lp-radius-pill)",
        color,
        fontFamily: "var(--lp-font-display)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        marginBottom: "var(--lp-space-md)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}
