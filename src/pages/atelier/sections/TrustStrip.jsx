import { TRUST_CHIPS } from "../atelier.copy";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

export default function TrustStrip() {
  return (
    <section className="at-section--tight" aria-label="عوامل الثقة">
      <hr className="at-hairline" />
      <div className="at-container">
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "clamp(18px, 3vw, 26px) 0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(10px, 2.5vw, 28px)",
          }}
        >
          {TRUST_CHIPS.map((chip, i) => (
            <Reveal as="li" key={chip} delay={i * STAGGER} y={12}>
              <span style={{ fontFamily: "var(--ui)", fontSize: "clamp(12.5px, 1.6vw, 14px)", color: "var(--soft)", whiteSpace: "nowrap" }}>
                {chip}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
      <hr className="at-hairline" />
    </section>
  );
}
