import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { FOUNDER } from "./content";

export default function FounderSection() {
  return (
    <section
      id="founder"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative amber glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          insetInlineEnd: "-300px",
          top: "10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(251,191,36,0.06), transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Container narrow>
        <Reveal>
          <EyebrowLabel>{FOUNDER.eyebrow}</EyebrowLabel>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-display-2)",
              fontWeight: 800,
              color: "var(--lp-text-strong)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: "var(--lp-space-2xl)",
              maxWidth: "var(--lp-max-w-text)",
            }}
          >
            {FOUNDER.headline}
          </h2>
        </Reveal>

        {FOUNDER.paragraphs.map((p, i) => (
          <Reveal key={i} delay={0.15 + i * 0.05}>
            <p
              style={{
                fontFamily: "var(--lp-font-body)",
                fontSize: "var(--lp-body-l)",
                color: i === 0 ? "var(--lp-text-strong)" : "var(--lp-text)",
                lineHeight: 1.8,
                margin: 0,
                marginBottom: "var(--lp-space-lg)",
                maxWidth: "var(--lp-max-w-text)",
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {p}
            </p>
          </Reveal>
        ))}

        <Reveal delay={0.5}>
          <div
            style={{
              marginTop: "var(--lp-space-2xl)",
              display: "flex",
              alignItems: "center",
              gap: "var(--lp-space-lg)",
            }}
          >
            {/* Typographic signature — no fake photo */}
            <div
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--lp-amber-bright), var(--lp-amber-deep))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a0e1a",
                fontFamily: "var(--lp-font-display)",
                fontWeight: 900,
                fontSize: "1.5rem",
                border: "2px solid var(--lp-bg-base)",
                boxShadow: "var(--lp-shadow-amber-strong)",
              }}
            >
              ع
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 800,
                  fontSize: "var(--lp-body-l)",
                  color: "var(--lp-text-strong)",
                  lineHeight: 1.2,
                }}
              >
                {FOUNDER.signature.name}
              </div>
              <div
                style={{
                  fontSize: "var(--lp-body-s)",
                  color: "var(--lp-amber-bright)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {FOUNDER.signature.title}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
