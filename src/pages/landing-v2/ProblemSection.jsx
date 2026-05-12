import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { PROBLEM } from "./content";

const ICONS = {
  memory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  ),
  crowd: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <circle cx="4" cy="10" r="2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
    </svg>
  ),
  isolation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  doubt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.7-1.3 2.5-3 3v1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export default function ProblemSection() {
  return (
    <section
      id="problem"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{PROBLEM.eyebrow}</EyebrowLabel>
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
              {PROBLEM.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.7,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {PROBLEM.intro}
            </p>
          </div>
        </Reveal>

        {/* Problem cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--lp-space-lg)",
            marginBottom: "var(--lp-space-2xl)",
          }}
          className="lp-problem-grid"
        >
          {PROBLEM.cards.map((card, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article
                style={{
                  height: "100%",
                  padding: "var(--lp-space-xl)",
                  background: "var(--lp-bg-raised)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-lg)",
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
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--lp-radius-card)",
                    background:
                      "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(251,191,36,0.04))",
                    border: "1px solid var(--lp-border-amber)",
                    color: "var(--lp-amber-bright)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--lp-space-lg)",
                  }}
                >
                  <span style={{ width: 24, height: 24, display: "block" }}>{ICONS[card.icon]}</span>
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
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--lp-body)",
                    lineHeight: 1.7,
                    color: "var(--lp-text-muted)",
                    margin: 0,
                  }}
                >
                  {card.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Bridge line to solution */}
        <Reveal delay={0.4}>
          <div
            style={{
              padding: "var(--lp-space-lg)",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.08), transparent)",
              border: "1px solid var(--lp-border-amber)",
              borderRadius: "var(--lp-radius-lg)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-body-l)",
                fontWeight: 600,
                color: "var(--lp-text-strong)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {PROBLEM.bridge}
            </p>
          </div>
        </Reveal>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-problem-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
