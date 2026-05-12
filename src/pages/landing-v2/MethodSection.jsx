import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { METHOD } from "./content";

export default function MethodSection() {
  return (
    <section
      id="method"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{METHOD.eyebrow}</EyebrowLabel>
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
              {METHOD.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {METHOD.intro}
            </p>
          </div>
        </Reveal>

        {/* 5-pillar grid — 3 cols desktop, naturally wraps to 3+2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
          }}
          className="lp-method-grid"
        >
          {METHOD.pillars.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <article
                style={{
                  height: "100%",
                  padding: "var(--lp-space-xl)",
                  background: "var(--lp-bg-raised)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-lg)",
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "var(--lp-border-amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
                }}
              >
                {/* Big translucent number */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "var(--lp-space-sm)",
                    insetInlineEnd: "var(--lp-space-md)",
                    fontFamily: "var(--lp-font-num)",
                    fontWeight: 900,
                    fontSize: "3.5rem",
                    color: "var(--lp-amber)",
                    opacity: 0.12,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {p.num}
                </div>

                {/* Small amber number badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    paddingBlock: 4,
                    paddingInline: 10,
                    background: "rgba(251,191,36,0.10)",
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
                  المبدأ {p.num}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-h3)",
                    fontWeight: 800,
                    color: "var(--lp-text-strong)",
                    lineHeight: 1.3,
                    margin: 0,
                    marginBottom: "var(--lp-space-md)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--lp-body)",
                    color: "var(--lp-text-muted)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-method-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          .lp-method-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
