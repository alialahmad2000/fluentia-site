import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { PRODUCT } from "./content";

const SMALL_ICONS = {
  recording: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10l4-2v8l-4-2z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  curriculum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  trainer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 12a9 9 0 11-3.6-7.2L21 4l-1.5 4.2A9 9 0 0121 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export default function ProductShowcaseSection() {
  return (
    <section
      id="product"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{PRODUCT.eyebrow}</EyebrowLabel>
            <h2
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h1)",
                fontWeight: 800,
                color: "var(--lp-text-strong)",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: "var(--lp-space-md)",
              }}
            >
              {PRODUCT.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {PRODUCT.intro}
            </p>
          </div>
        </Reveal>

        {/* Row 1 — 3 big feature cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
            marginBottom: "var(--lp-space-lg)",
          }}
          className="lp-product-row"
        >
          {PRODUCT.cards
            .filter((c) => c.size === "big")
            .map((card, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <BigCard card={card} />
              </Reveal>
            ))}
        </div>

        {/* Row 2 — 3 small supporting cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
          }}
          className="lp-product-row"
        >
          {PRODUCT.cards
            .filter((c) => c.size === "small")
            .map((card, i) => (
              <Reveal key={i} delay={(i + 3) * 0.08}>
                <article
                  style={{
                    padding: "var(--lp-space-lg)",
                    background: "var(--lp-bg-elevated)",
                    border: "1px solid var(--lp-border-subtle)",
                    borderRadius: "var(--lp-radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--lp-space-md)",
                    height: "100%",
                    transition:
                      "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "var(--lp-border-amber)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--lp-radius-tight)",
                      background:
                        "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(251,191,36,0.02))",
                      border: "1px solid var(--lp-border-amber)",
                      color: "var(--lp-amber-bright)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ width: 22, height: 22, display: "block" }}>
                      {SMALL_ICONS[card.icon]}
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--lp-font-display)",
                        fontSize: "var(--lp-body-l)",
                        fontWeight: 800,
                        color: "var(--lp-text-strong)",
                        margin: 0,
                        marginBottom: "var(--lp-space-sm)",
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "var(--lp-body-s)",
                        color: "var(--lp-text-muted)",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {card.tagline}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-product-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Big card with mini-mockup
// ────────────────────────────────────────────────────────────

function BigCard({ card }) {
  return (
    <article
      style={{
        padding: "var(--lp-space-xl)",
        background:
          "linear-gradient(180deg, var(--lp-bg-elevated), var(--lp-bg-raised))",
        border: "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--lp-space-lg)",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition:
          "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease), box-shadow var(--lp-dur-med) var(--lp-ease)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--lp-border-amber)";
        e.currentTarget.style.boxShadow = "var(--lp-shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Mini-mockup at top */}
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {card.mockup === "speaking" && <SpeakingMockup />}
        {card.mockup === "vocab" && <VocabMockup />}
        {card.mockup === "ielts" && <IELTSMockup />}
      </div>

      {/* Content */}
      <div>
        <h3
          style={{
            fontFamily: "var(--lp-font-display)",
            fontSize: "var(--lp-h3)",
            fontWeight: 800,
            color: "var(--lp-text-strong)",
            margin: 0,
            marginBottom: "var(--lp-space-sm)",
            lineHeight: 1.3,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontSize: "var(--lp-body)",
            color: "var(--lp-text-muted)",
            margin: 0,
            marginBottom: "var(--lp-space-md)",
            lineHeight: 1.6,
          }}
        >
          {card.tagline}
        </p>
        <p
          style={{
            fontSize: "var(--lp-body-s)",
            color: "var(--lp-amber-bright)",
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {card.bullet}
        </p>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// Mini-mockups
// ────────────────────────────────────────────────────────────

function SpeakingMockup() {
  const bars = [0.3, 0.5, 0.8, 0.6, 0.95, 0.4, 0.7, 0.9, 0.5, 0.7, 0.4, 0.8, 0.55, 0.6, 0.4];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--lp-bg-base)",
        border: "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-card)",
        display: "flex",
        alignItems: "center",
        gap: "var(--lp-space-md)",
        padding: "var(--lp-space-md)",
      }}
    >
      {/* Mic button */}
      <div
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0a0e1a",
          boxShadow: "var(--lp-shadow-amber-strong)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Waveform */}
      <div
        style={{
          flex: 1,
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              background: "linear-gradient(180deg, var(--lp-amber), var(--lp-amber-deep))",
              borderRadius: 2,
              animation: `lp-wave-${i % 5} 1.${(i % 4) + 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Score */}
      <div
        style={{
          flexShrink: 0,
          paddingBlock: 6,
          paddingInline: 12,
          background: "rgba(74,222,128,0.15)",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: "var(--lp-radius-pill)",
          color: "var(--lp-success)",
          fontFamily: "var(--lp-font-num)",
          fontWeight: 800,
          fontSize: "var(--lp-body-s)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>88</span>
        <span style={{ fontSize: 10, opacity: 0.8 }}>/100</span>
      </div>

      <style>{`
        @keyframes lp-wave-0 { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.5); } }
        @keyframes lp-wave-1 { 0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1); } }
        @keyframes lp-wave-2 { 0%,100% { transform: scaleY(0.8); } 50% { transform: scaleY(0.4); } }
        @keyframes lp-wave-3 { 0%,100% { transform: scaleY(0.5); } 50% { transform: scaleY(0.9); } }
        @keyframes lp-wave-4 { 0%,100% { transform: scaleY(0.9); } 50% { transform: scaleY(0.5); } }
      `}</style>
    </div>
  );
}

function VocabMockup() {
  const cards = [
    { en: "commute", ar: "تنقّل", status: "learning" },
    { en: "routine", ar: "روتين", status: "review" },
    { en: "schedule", ar: "جدول", status: "mastered" },
  ];
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 140,
      }}
    >
      {cards.map((c, i) => {
        const offset = i * 8;
        const rotate = (i - 1) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: offset,
              insetInlineStart: offset,
              width: 180,
              height: 110,
              padding: "var(--lp-space-md)",
              background: "var(--lp-bg-base)",
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-card)",
              boxShadow: "var(--lp-shadow-card)",
              transform: `rotate(${rotate}deg)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  color: "var(--lp-text-strong)",
                  lineHeight: 1.1,
                }}
              >
                {c.en}
              </div>
              <div
                style={{
                  fontFamily: "var(--lp-font-body)",
                  fontSize: "var(--lp-body-s)",
                  color: "var(--lp-text-muted)",
                  marginTop: 2,
                  direction: "rtl",
                  textAlign: "right",
                }}
              >
                {c.ar}
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      dot < (i === 2 ? 5 : i === 1 ? 3 : 2)
                        ? "var(--lp-amber)"
                        : "var(--lp-border-subtle)",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IELTSMockup() {
  const skills = [
    { label: "L", band: 6.5 },
    { label: "R", band: 7.0 },
    { label: "W", band: 6.0 },
    { label: "S", band: 7.5 },
  ];
  const max = 9;
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 240,
        height: "100%",
        padding: "var(--lp-space-md)",
        background: "var(--lp-bg-base)",
        border: "1px solid var(--lp-border-subtle)",
        borderRadius: "var(--lp-radius-card)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--lp-space-sm)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--lp-text-faint)",
          fontFamily: "var(--lp-font-display)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Target Band: 7.0
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--lp-space-sm)",
          alignItems: "flex-end",
          position: "relative",
          minHeight: 80,
        }}
      >
        {/* Target line at band 7.0 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            insetInlineStart: 0,
            insetInlineEnd: 0,
            bottom: `${(7.0 / max) * 100}%`,
            borderTop: "1px dashed var(--lp-amber)",
            opacity: 0.6,
          }}
        />
        {skills.map((s, i) => {
          const pct = (s.band / max) * 100;
          const hitTarget = s.band >= 7.0;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: "100%",
                  height: `${pct}%`,
                  background: hitTarget
                    ? "linear-gradient(180deg, var(--lp-amber-bright), var(--lp-amber))"
                    : "linear-gradient(180deg, rgba(248,250,252,0.25), rgba(248,250,252,0.1))",
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "var(--lp-font-num)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: hitTarget ? "var(--lp-amber-bright)" : "var(--lp-text-muted)",
                  }}
                >
                  {s.band.toFixed(1)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--lp-text-muted)",
                  fontFamily: "var(--lp-font-num)",
                  fontWeight: 700,
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
