import { TESTIMONIALS } from "../atelier.copy";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

export default function Testimonials() {
  return (
    <section className="at-section">
      <div className="at-container">
        <Reveal className="at-section-head">
          <span className="at-eyebrow">آراء الطلاب</span>
          <h2 className="at-title">كلمات من داخل التجربة</h2>
        </Reveal>

        <div className="at-grid at-grid-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name + i} delay={(i % 3) * STAGGER} className="at-card at-card--lift"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="at-serif" style={{ fontSize: "40px", color: "var(--sky)", lineHeight: 0.6, opacity: 0.5 }}>”</span>
              <p style={{ color: "var(--white)", fontSize: "15.5px", lineHeight: 1.9, flex: 1 }}>{t.quote}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--hairline)" }}>
                <div>
                  <div style={{ fontFamily: "var(--display-ar)", fontWeight: 700, fontSize: "15px", color: "var(--cream)" }}>{t.name}</div>
                  <div className="at-meta" style={{ marginTop: "2px" }}>{t.context}</div>
                </div>
                <span className="at-chip" style={{ fontSize: "11.5px", padding: "5px 11px", color: "var(--sky-light)" }}>
                  {t.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
