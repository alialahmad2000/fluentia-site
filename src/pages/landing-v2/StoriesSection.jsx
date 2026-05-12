import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { STORIES } from "./content";

export default function StoriesSection() {
  return (
    <section
      id="stories"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{STORIES.eyebrow}</EyebrowLabel>
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
              {STORIES.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {STORIES.intro}
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--lp-space-lg)",
            alignItems: "stretch",
          }}
          className="lp-stories-grid"
        >
          {STORIES.cards.map((story, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article
                style={{
                  height: "100%",
                  padding: "var(--lp-space-xl)",
                  background: "var(--lp-bg-raised)",
                  border: "1px solid var(--lp-border-subtle)",
                  borderRadius: "var(--lp-radius-lg)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
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
                {/* Header row: avatar + name + role */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--lp-space-md)",
                    marginBottom: "var(--lp-space-lg)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
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
                      fontSize: "1.4rem",
                      border: "2px solid var(--lp-bg-base)",
                      boxShadow: "0 4px 16px rgba(251,191,36,0.3)",
                    }}
                  >
                    {story.initial}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--lp-font-display)",
                        fontWeight: 800,
                        fontSize: "var(--lp-body-l)",
                        color: "var(--lp-text-strong)",
                        lineHeight: 1.1,
                      }}
                    >
                      {story.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--lp-caption)",
                        color: "var(--lp-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {story.role}
                    </div>
                  </div>
                </div>

                {/* Result chip */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--lp-space-md)",
                    flexWrap: "wrap",
                    marginBottom: "var(--lp-space-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      paddingBlock: 6,
                      paddingInline: 12,
                      background: "rgba(74,222,128,0.10)",
                      border: "1px solid rgba(74,222,128,0.25)",
                      borderRadius: "var(--lp-radius-pill)",
                      color: "var(--lp-success)",
                      fontFamily: "var(--lp-font-display)",
                      fontSize: "var(--lp-caption)",
                      fontWeight: 700,
                    }}
                  >
                    📈 {story.level}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--lp-caption)",
                      color: "var(--lp-text-faint)",
                    }}
                  >
                    {story.duration}
                  </div>
                </div>

                {/* Quote */}
                <blockquote
                  style={{
                    margin: 0,
                    flex: 1,
                    fontFamily: "var(--lp-font-body)",
                    fontSize: "var(--lp-body)",
                    color: "var(--lp-text)",
                    lineHeight: 1.7,
                    position: "relative",
                    paddingTop: "var(--lp-space-md)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -4,
                      insetInlineStart: -2,
                      fontFamily: "Georgia, serif",
                      fontSize: "2rem",
                      color: "var(--lp-amber)",
                      opacity: 0.4,
                      lineHeight: 1,
                      fontWeight: 900,
                    }}
                  >
                    "
                  </span>
                  {story.quote}
                </blockquote>

                {/* Tag footer */}
                <div
                  style={{
                    marginTop: "var(--lp-space-lg)",
                    paddingTop: "var(--lp-space-md)",
                    borderTop: "1px solid var(--lp-border-subtle)",
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-caption)",
                    color: "var(--lp-amber-bright)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  # {story.tag}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-stories-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
