import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { MORE_THAN_LANG } from "./content";

/**
 * MoreThanLanguageSection — quiet observational section.
 * Uses real survey data to make a calm point about non-language outcomes.
 * Naval voice: state observation, don't promise, let reader decide.
 * Sits between FounderSection and FinalCTASection.
 */
export default function MoreThanLanguageSection() {
  return (
    <section
      id="more-than-language"
      style={{
        background: "var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle amber whisper in top-left */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          insetInlineStart: "-200px",
          top: "20%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.04), transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Container narrow>
        <Reveal>
          <EyebrowLabel>{MORE_THAN_LANG.eyebrow}</EyebrowLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h2
            style={{
              fontFamily: "var(--lp-font-display)",
              fontSize: "var(--lp-display-2)",
              fontWeight: 800,
              color: "var(--lp-text-strong)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              margin: 0,
              marginBottom: "var(--lp-space-2xl)",
              maxWidth: "var(--lp-max-w-text)",
            }}
          >
            {MORE_THAN_LANG.headline}
          </h2>
        </Reveal>

        {/* Opening paragraphs */}
        {MORE_THAN_LANG.paragraphs.map((p, i) => (
          <Reveal key={`p-${i}`} delay={0.12 + i * 0.06}>
            <p
              style={{
                fontFamily: "var(--lp-font-body)",
                fontSize: "var(--lp-body-l)",
                color: "var(--lp-text)",
                lineHeight: 1.8,
                margin: 0,
                marginBottom: "var(--lp-space-lg)",
                maxWidth: "var(--lp-max-w-text)",
              }}
            >
              {p}
            </p>
          </Reveal>
        ))}

        {/* Survey responses — pulled quotes block */}
        <Reveal delay={0.3}>
          <ul
            style={{
              listStyle: "none",
              padding: "var(--lp-space-xl)",
              margin: 0,
              marginBlock: "var(--lp-space-xl)",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.05), var(--lp-bg-raised))",
              border: "1px solid var(--lp-border-amber)",
              borderRadius: "var(--lp-radius-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--lp-space-md)",
              maxWidth: "var(--lp-max-w-text)",
            }}
          >
            {MORE_THAN_LANG.surveyResponses.map((r, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--lp-space-md)",
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-body-l)",
                  fontWeight: 600,
                  color: "var(--lp-text-strong)",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    fontFamily: "Georgia, serif",
                    fontSize: "1.5rem",
                    color: "var(--lp-amber-bright)",
                    lineHeight: 1,
                    marginTop: 4,
                    opacity: 0.7,
                  }}
                >
                  "
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Closing paragraphs */}
        {MORE_THAN_LANG.closingParagraphs.map((p, i) => (
          <Reveal key={`c-${i}`} delay={0.45 + i * 0.08}>
            <p
              style={{
                fontFamily: "var(--lp-font-body)",
                fontSize: "var(--lp-body-l)",
                color:
                  i === MORE_THAN_LANG.closingParagraphs.length - 1
                    ? "var(--lp-text)"
                    : "var(--lp-text-muted)",
                lineHeight: 1.8,
                margin: 0,
                marginBottom: "var(--lp-space-lg)",
                maxWidth: "var(--lp-max-w-text)",
                fontWeight:
                  i === MORE_THAN_LANG.closingParagraphs.length - 1 ? 500 : 400,
              }}
            >
              {p}
            </p>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
