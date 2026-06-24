import { Container, EyebrowLabel, Reveal, PrimaryCTA } from "../../components/landing";
import { WORTH } from "./content";

/**
 * WorthSection — the value manifesto ("this is not a course").
 * Editorial centerpiece, deliberately distinct from the card-grid sections:
 * baseline-seated index numbers + a faint essence-word index filling the
 * inline-end gutter + hairline-divided movements + a two-tier closing
 * pull-quote that bridges into pricing. Honest tone, no hype.
 */
export default function WorthSection() {
  return (
    <section
      id="worth"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative amber glow — top-start, lights the header */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          insetInlineStart: "-280px",
          top: "-120px",
          width: "640px",
          height: "640px",
          background: "radial-gradient(circle, rgba(251,191,36,0.13), transparent 62%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      {/* Second glow — pools light around the closing CTA card */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          insetInlineEnd: "-240px",
          bottom: "-80px",
          width: "560px",
          height: "560px",
          background: "radial-gradient(circle, rgba(251,191,36,0.10), transparent 64%)",
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />

      <Container style={{ position: "relative" }}>
        {/* ── Header ── */}
        <Reveal>
          <div style={{ maxWidth: "var(--lp-max-w-text)", marginBottom: "var(--lp-space-2xl)" }}>
            <EyebrowLabel>{WORTH.eyebrow}</EyebrowLabel>
            <h2
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-display-2)",
                fontWeight: 800,
                color: "var(--lp-text-strong)",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: "var(--lp-space-md)",
              }}
            >
              {WORTH.headline}
            </h2>
            <p
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h3)",
                fontWeight: 600,
                color: "var(--lp-amber-bright)",
                lineHeight: 1.4,
                margin: 0,
                marginBottom: "var(--lp-space-lg)",
              }}
            >
              {WORTH.deck}
            </p>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.8,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {WORTH.intro}
            </p>
          </div>
        </Reveal>

        {/* ── Movements (hairline-divided editorial rows) ── */}
        <div style={{ borderBottom: "1px solid var(--lp-border-subtle)" }}>
          {WORTH.pillars.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className="lp-worth-row"
                style={{
                  display: "flex",
                  gap: "var(--lp-space-xl)",
                  alignItems: "baseline",
                  paddingBlock: "var(--lp-space-2xl)",
                  borderTop: "1px solid var(--lp-border-subtle)",
                }}
                onMouseEnter={(e) => {
                  const num = e.currentTarget.querySelector(".lp-worth-num");
                  const title = e.currentTarget.querySelector(".lp-worth-title");
                  const ess = e.currentTarget.querySelector(".lp-worth-essence");
                  if (num) num.style.opacity = "0.4";
                  if (title) title.style.color = "var(--lp-amber-bright)";
                  if (ess) ess.style.color = "var(--lp-amber)";
                }}
                onMouseLeave={(e) => {
                  const num = e.currentTarget.querySelector(".lp-worth-num");
                  const title = e.currentTarget.querySelector(".lp-worth-title");
                  const ess = e.currentTarget.querySelector(".lp-worth-essence");
                  if (num) num.style.opacity = "0.2";
                  if (title) title.style.color = "var(--lp-text-strong)";
                  if (ess) ess.style.color = "var(--lp-text-faint)";
                }}
              >
                <div
                  aria-hidden
                  className="lp-worth-num"
                  style={{
                    fontFamily: "var(--lp-font-display)",
                    fontWeight: 900,
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    color: "var(--lp-amber)",
                    opacity: 0.2,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: "clamp(64px, 9vw, 132px)",
                    transition: "opacity var(--lp-dur-med) var(--lp-ease)",
                  }}
                >
                  {p.num}
                </div>
                <div style={{ flex: 1, maxWidth: "var(--lp-max-w-text)" }}>
                  <h3
                    className="lp-worth-title"
                    style={{
                      fontFamily: "var(--lp-font-display)",
                      fontSize: "var(--lp-h2)",
                      fontWeight: 700,
                      color: "var(--lp-text-strong)",
                      lineHeight: 1.25,
                      letterSpacing: "-0.01em",
                      margin: 0,
                      marginBottom: "var(--lp-space-md)",
                      transition: "color var(--lp-dur-med) var(--lp-ease)",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--lp-body-l)",
                      color: "var(--lp-text-muted)",
                      lineHeight: 1.85,
                      margin: 0,
                    }}
                  >
                    {p.body}
                  </p>
                </div>
                {/* Essence index — fills the inline-end gutter, reads as an editorial register */}
                <div
                  aria-hidden
                  className="lp-worth-essence"
                  style={{
                    marginInlineStart: "auto",
                    flexShrink: 0,
                    fontFamily: "var(--lp-font-display)",
                    fontSize: "var(--lp-caption)",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "var(--lp-text-faint)",
                    transition: "color var(--lp-dur-med) var(--lp-ease)",
                  }}
                >
                  {p.essence}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Closing statement → bridge into pricing ── */}
        <Reveal delay={0.1}>
          <div
            style={{
              marginTop: "var(--lp-space-2xl)",
              padding: "clamp(28px, 4vw, 52px)",
              background: "linear-gradient(135deg, var(--lp-bg-elevated), var(--lp-bg-raised))",
              border: "1px solid var(--lp-border-amber)",
              borderRadius: "var(--lp-radius-lg)",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            {/* Brass accent bar on the inline-start edge */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                insetInlineStart: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: "linear-gradient(180deg, var(--lp-amber-bright), var(--lp-amber-deep))",
              }}
            />
            <p
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-h3)",
                fontWeight: 700,
                color: "var(--lp-text-strong)",
                lineHeight: 1.45,
                margin: 0,
                marginBottom: "var(--lp-space-md)",
                maxWidth: "var(--lp-max-w-text)",
              }}
            >
              {WORTH.closing.lead}
            </p>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                fontWeight: 500,
                color: "var(--lp-text-muted)",
                lineHeight: 1.85,
                margin: 0,
                marginBottom: "var(--lp-space-xl)",
                maxWidth: "var(--lp-max-w-text)",
              }}
            >
              {WORTH.closing.body}
            </p>
            <PrimaryCTA href={WORTH.closing.ctaHref}>
              {WORTH.closing.ctaLabel}
              <span aria-hidden style={{ fontSize: "1.1em" }}>
                ←
              </span>
            </PrimaryCTA>
          </div>
        </Reveal>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .lp-worth-essence { display: none !important; }
        }
        @media (max-width: 600px) {
          .lp-worth-row {
            gap: var(--lp-space-md) !important;
            padding-block: var(--lp-space-xl) !important;
          }
        }
      `}</style>
    </section>
  );
}
