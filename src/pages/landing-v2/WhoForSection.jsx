import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { WHO_FOR } from "./content";

export default function WhoForSection() {
  return (
    <section
      id="who-for"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
      }}
    >
      <Container>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)", maxWidth: "var(--lp-max-w-text)" }}>
            <EyebrowLabel>{WHO_FOR.eyebrow}</EyebrowLabel>
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
              {WHO_FOR.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.7,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {WHO_FOR.intro}
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--lp-space-lg)",
            alignItems: "stretch",
          }}
          className="lp-whofor-grid"
        >
          {/* FOR YOU column */}
          <Reveal delay={0.1}>
            <article
              style={{
                height: "100%",
                padding: "var(--lp-space-xl)",
                background:
                  "linear-gradient(180deg, rgba(74,222,128,0.04), var(--lp-bg-raised))",
                border: "1px solid rgba(74,222,128,0.20)",
                borderRadius: "var(--lp-radius-lg)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-h3)",
                  fontWeight: 800,
                  color: "var(--lp-success)",
                  margin: 0,
                  marginBottom: "var(--lp-space-lg)",
                  lineHeight: 1.2,
                }}
              >
                ✓ {WHO_FOR.forYou.title}
              </h3>
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
                {WHO_FOR.forYou.items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--lp-space-md)",
                      color: "var(--lp-text)",
                      fontSize: "var(--lp-body)",
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(74,222,128,0.15)",
                        color: "var(--lp-success)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        marginTop: 3,
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          {/* NOT FOR YOU column */}
          <Reveal delay={0.2}>
            <article
              style={{
                height: "100%",
                padding: "var(--lp-space-xl)",
                background: "var(--lp-bg-raised)",
                border: "1px solid var(--lp-border-subtle)",
                borderRadius: "var(--lp-radius-lg)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-h3)",
                  fontWeight: 800,
                  color: "var(--lp-text-muted)",
                  margin: 0,
                  marginBottom: "var(--lp-space-lg)",
                  lineHeight: 1.2,
                }}
              >
                — {WHO_FOR.notForYou.title}
              </h3>
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
                {WHO_FOR.notForYou.items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--lp-space-md)",
                      color: "var(--lp-text-muted)",
                      fontSize: "var(--lp-body)",
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 2,
                        background: "var(--lp-text-faint)",
                        marginTop: 14,
                      }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </Container>

      <style>{`
        @media (max-width: 800px) {
          .lp-whofor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
