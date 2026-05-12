import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { SOLUTION } from "./content";

const PILLAR_ICONS = {
  method: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4h16v4H4zM4 12h16v4H4zM4 20h10" />
      <path d="M18 20l3 -3" />
      <circle cx="21" cy="17" r="0.8" fill="currentColor" />
    </svg>
  ),
  trainer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <path d="M16 5l2 2-2 2" strokeLinejoin="round" />
    </svg>
  ),
  platform: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  ),
};

export default function SolutionSection() {
  return (
    <section
      id="solution"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{SOLUTION.eyebrow}</EyebrowLabel>
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
              {SOLUTION.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {SOLUTION.intro}
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
          }}
          className="lp-solution-grid"
        >
          {SOLUTION.pillars.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article
                style={{
                  height: "100%",
                  padding: "var(--lp-space-xl)",
                  background:
                    "linear-gradient(180deg, var(--lp-bg-raised), var(--lp-bg-elevated))",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-lg)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "transform var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease), box-shadow var(--lp-dur-med) var(--lp-ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "var(--lp-border-amber)";
                  e.currentTarget.style.boxShadow = "var(--lp-shadow-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Decorative number badge in top-right corner */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "var(--lp-space-md)",
                    insetInlineEnd: "var(--lp-space-md)",
                    fontFamily: "var(--lp-font-num)",
                    fontWeight: 900,
                    fontSize: "2.5rem",
                    color: "var(--lp-amber)",
                    opacity: 0.18,
                    lineHeight: 1,
                  }}
                >
                  {p.num}
                </div>

                {/* Icon */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--lp-radius-card)",
                    background:
                      "linear-gradient(135deg, rgba(251,191,36,0.20), rgba(251,191,36,0.04))",
                    border: "1px solid var(--lp-border-amber)",
                    color: "var(--lp-amber-bright)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--lp-space-lg)",
                  }}
                >
                  <span style={{ width: 28, height: 28, display: "block" }}>
                    {PILLAR_ICONS[p.icon]}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-h2)",
                    fontWeight: 800,
                    color: "var(--lp-text-strong)",
                    lineHeight: 1.2,
                    margin: 0,
                    marginBottom: "var(--lp-space-sm)",
                  }}
                >
                  {p.title}
                </h3>

                <p
                  style={{
                    fontSize: "var(--lp-body)",
                    color: "var(--lp-amber-bright)",
                    margin: 0,
                    marginBottom: "var(--lp-space-lg)",
                    fontWeight: 500,
                  }}
                >
                  {p.tagline}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--lp-space-md)",
                  }}
                >
                  {p.points.map((pt, j) => (
                    <li
                      key={j}
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
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(251,191,36,0.12)",
                          color: "var(--lp-amber)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          marginTop: 2,
                        }}
                      >
                        ✓
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-solution-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
