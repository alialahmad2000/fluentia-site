import { COMPARISON } from "../atelier.copy";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

export default function Comparison() {
  const { eyebrow, title, columns, rows } = COMPARISON;
  return (
    <section className="at-section">
      <div className="at-container" style={{ maxWidth: "920px" }}>
        <Reveal className="at-section-head">
          <span className="at-eyebrow">{eyebrow}</span>
          <h2 className="at-title">{title}</h2>
        </Reveal>

        <Reveal className="at-card" style={{ padding: "clamp(8px, 2vw, 16px) clamp(14px, 3vw, 28px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}>
            <span className="at-meta" />
            <span style={{ fontFamily: "var(--display-ar)", fontWeight: 800, color: "var(--sky)", fontSize: "clamp(14px, 2vw, 17px)", textAlign: "center" }}>
              {columns.us}
            </span>
            <span style={{ fontFamily: "var(--ui)", color: "var(--muted)", fontSize: "clamp(13px, 1.8vw, 15px)", textAlign: "center" }}>
              {columns.them}
            </span>
          </div>

          {rows.map((row, i) => (
            <Reveal key={row.label} delay={i * (STAGGER * 0.6)} y={10}
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 1fr",
                alignItems: "center",
                padding: "15px 0",
                borderBottom: i < rows.length - 1 ? "1px solid var(--hairline)" : "none",
              }}>
              <span style={{ fontFamily: "var(--body-ar)", color: "var(--soft)", fontSize: "clamp(13.5px, 1.9vw, 15px)" }}>{row.label}</span>
              <span style={{ color: "var(--cream)", fontSize: "clamp(13px, 1.9vw, 15px)", textAlign: "center", fontWeight: 500 }}>{row.us}</span>
              <span style={{ color: "var(--muted)", fontSize: "clamp(12.5px, 1.8vw, 14px)", textAlign: "center" }}>{row.them}</span>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
