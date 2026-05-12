import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { SOCIAL_PROOF } from "./content";
import TrustBar from "./TrustBar";

export default function SocialProofSection() {
  return (
    <section
      id="social-proof"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "var(--lp-space-2xl)" }}>
            <div style={{ display: "inline-flex" }}>
              <EyebrowLabel>{SOCIAL_PROOF.eyebrow}</EyebrowLabel>
            </div>
            <h2
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h1)",
                fontWeight: 800,
                color: "var(--lp-text-strong)",
                maxWidth: "var(--lp-max-w-text)",
                marginInline: "auto",
                marginBlock: 0,
              }}
            >
              {SOCIAL_PROOF.headline}
            </h2>
          </div>
        </Reveal>

        {/* Trust bar — institutional social proof */}
        <Reveal delay={0.05}>
          <TrustBar />
        </Reveal>

        {/* Stats row */}
        <Reveal delay={0.1}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "var(--lp-space-md)",
              marginBottom: "var(--lp-space-2xl)",
            }}
            className="lp-stats-grid"
          >
            {SOCIAL_PROOF.stats.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "var(--lp-space-lg)",
                  background: "var(--lp-bg-elevated)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-card)",
                  textAlign: "center",
                  transition: "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--lp-border-amber)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--lp-font-num)",
                    fontWeight: 900,
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    color: "var(--lp-amber)",
                    lineHeight: 1,
                    marginBottom: "var(--lp-space-sm)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "var(--lp-font-body)",
                    fontSize: "var(--lp-body-s)",
                    color: "var(--lp-text-muted)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Badges row */}
        <Reveal delay={0.15}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "var(--lp-space-md)",
              marginBottom: "var(--lp-space-2xl)",
            }}
          >
            {SOCIAL_PROOF.badges.map((b, i) => (
              <span
                key={i}
                style={{
                  paddingBlock: 8,
                  paddingInline: 16,
                  background: "var(--lp-bg-base)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-pill)",
                  color: "var(--lp-text-muted)",
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-caption)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Quote */}
        <Reveal delay={0.2}>
          <blockquote
            style={{
              maxWidth: "var(--lp-max-w-narrow)",
              marginInline: "auto",
              padding: "var(--lp-space-xl)",
              background: "var(--lp-bg-elevated)",
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-lg)",
              textAlign: "center",
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -22,
                insetInlineStart: 24,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber))",
                color: "#0a0e1a",
                fontFamily: "Georgia, serif",
                fontSize: 28,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              "
            </span>
            <p
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h3)",
                fontWeight: 600,
                lineHeight: 1.5,
                color: "var(--lp-text-strong)",
                margin: 0,
                marginBottom: "var(--lp-space-md)",
              }}
            >
              {SOCIAL_PROOF.quote.text}
            </p>
            <footer
              style={{
                color: "var(--lp-text-muted)",
                fontSize: "var(--lp-body-s)",
              }}
            >
              <span style={{ color: "var(--lp-text-strong)", fontWeight: 700 }}>
                {SOCIAL_PROOF.quote.author}
              </span>
              {" · "}
              {SOCIAL_PROOF.quote.role}
            </footer>
          </blockquote>
        </Reveal>
      </Container>

      <style>{`
        @media (max-width: 720px) {
          .lp-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
