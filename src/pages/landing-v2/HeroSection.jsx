import { Container, Reveal, PrimaryCTA, SecondaryCTA } from "../../components/landing";
import { HERO } from "./content";
import LMSMockup from "./LMSMockup";

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        background:
          "radial-gradient(ellipse at top right, rgba(251,191,36,0.08), transparent 50%), var(--lp-bg-base)",
        paddingBlock: "clamp(80px, 12vw, 140px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(248,250,252,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
            gap: "clamp(32px, 6vw, 80px)",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Text column (RTL — sits visually on the right) */}
          <Reveal>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--lp-space-sm)",
                  paddingBlock: "6px",
                  paddingInline: "14px",
                  background:
                    "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))",
                  border: "1px solid var(--lp-border-amber)",
                  borderRadius: "var(--lp-radius-pill)",
                  color: "var(--lp-amber-bright)",
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-caption)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginBottom: "var(--lp-space-lg)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--lp-amber)",
                    boxShadow: "0 0 8px var(--lp-amber-glow)",
                  }}
                />
                {HERO.eyebrow}
              </div>

              <h1
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-display-1)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "var(--lp-text-strong)",
                  margin: 0,
                  marginBottom: "var(--lp-space-lg)",
                }}
              >
                {HERO.headline}
              </h1>

              <p
                style={{
                  fontSize: "var(--lp-body-l)",
                  lineHeight: 1.65,
                  color: "var(--lp-text-muted)",
                  maxWidth: "560px",
                  marginBottom: "var(--lp-space-2xl)",
                }}
              >
                {HERO.sub}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--lp-space-md)",
                  marginBottom: "var(--lp-space-2xl)",
                }}
              >
                <PrimaryCTA href="#cta">{HERO.primaryCTA} ←</PrimaryCTA>
                <SecondaryCTA href="#pricing">{HERO.secondaryCTA}</SecondaryCTA>
              </div>

              {/* Trust row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--lp-space-lg)",
                  rowGap: "var(--lp-space-sm)",
                }}
              >
                {HERO.trustRow.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--lp-space-sm)",
                      color: "var(--lp-text-muted)",
                      fontSize: "var(--lp-body-s)",
                      fontFamily: "var(--lp-font-body)",
                    }}
                  >
                    <CheckDot />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Mockup column (sits visually on the left in RTL) */}
          <Reveal delay={0.15}>
            <LMSMockup />
          </Reveal>
        </div>
      </Container>

      {/* Mobile stacking */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}

function CheckDot() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "rgba(74, 222, 128, 0.15)",
        color: "var(--lp-success)",
        fontSize: 10,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}
