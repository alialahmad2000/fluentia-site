import { useState } from "react";
import { Container, EyebrowLabel, Reveal } from "../../components/landing";
import { FAQ } from "./content";

export default function FAQSection() {
  // ALL HOOKS AT TOP
  const [openIdx, setOpenIdx] = useState(new Set([0])); // first item open by default

  const toggle = (i) => {
    setOpenIdx((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section
      id="faq"
      style={{
        background: "var(--lp-bg-raised)",
        paddingBlock: "var(--lp-space-section)",
        borderTop: "1px solid var(--lp-border-subtle)",
        borderBottom: "1px solid var(--lp-border-subtle)",
      }}
    >
      <Container narrow>
        <Reveal>
          <div style={{ marginBottom: "var(--lp-space-2xl)" }}>
            <EyebrowLabel>{FAQ.eyebrow}</EyebrowLabel>
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
              {FAQ.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                lineHeight: 1.65,
                color: "var(--lp-text-muted)",
                margin: 0,
              }}
            >
              {FAQ.intro}
            </p>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--lp-space-sm)" }}>
          {FAQ.items.map((item, i) => {
            const isOpen = openIdx.has(i);
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  style={{
                    background: "var(--lp-bg-elevated)",
                    border: `1px solid ${isOpen ? "var(--lp-border-amber)" : "var(--lp-border-subtle)"}`,
                    borderRadius: "var(--lp-radius-card)",
                    overflow: "hidden",
                    transition: "border-color var(--lp-dur-fast) var(--lp-ease)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      padding: "var(--lp-space-lg)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--lp-space-md)",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--lp-font-display)",
                        fontSize: "var(--lp-body-l)",
                        fontWeight: 700,
                        color: isOpen ? "var(--lp-amber-bright)" : "var(--lp-text-strong)",
                        lineHeight: 1.4,
                        transition: "color var(--lp-dur-fast) var(--lp-ease)",
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isOpen ? "rgba(251,191,36,0.15)" : "var(--lp-bg-base)",
                        border: `1px solid ${isOpen ? "var(--lp-border-amber)" : "var(--lp-border-subtle)"}`,
                        color: isOpen ? "var(--lp-amber-bright)" : "var(--lp-text-muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        transition: "all var(--lp-dur-fast) var(--lp-ease)",
                      }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 var(--lp-space-lg) var(--lp-space-lg)",
                        borderTop: "1px solid var(--lp-border-subtle)",
                        paddingTop: "var(--lp-space-md)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "var(--lp-body)",
                          color: "var(--lp-text)",
                          lineHeight: 1.75,
                          margin: 0,
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
