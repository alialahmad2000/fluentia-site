import { PROBLEM } from "../../landing-v2/content";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

export default function Problem() {
  return (
    <section className="at-section">
      <div className="at-container">
        <Reveal className="at-section-head">
          <span className="at-eyebrow">{PROBLEM.eyebrow}</span>
          <h2 className="at-title">{PROBLEM.headline}</h2>
          {PROBLEM.intro && <p className="at-lede" style={{ marginTop: "16px" }}>{PROBLEM.intro}</p>}
        </Reveal>

        <div className="at-grid at-grid-2">
          {PROBLEM.cards.map((card, i) => (
            <Reveal key={card.title} delay={(i % 2) * STAGGER} className="at-card at-card--lift">
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <span className="at-numeral" style={{ fontSize: "30px", minWidth: "42px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 style={{ fontSize: "19px", marginBottom: "8px", color: "var(--white)" }}>{card.title}</h3>
                  <p style={{ color: "var(--soft)", fontSize: "15px", lineHeight: 1.85 }}>{card.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {PROBLEM.bridge && (
          <Reveal delay={0.1}>
            <p className="at-serif-it" style={{ marginTop: "clamp(24px, 4vw, 40px)", textAlign: "center", fontSize: "clamp(18px, 3vw, 24px)", color: "var(--cream)" }}>
              {PROBLEM.bridge}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
