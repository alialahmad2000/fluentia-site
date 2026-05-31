import { WHO_FOR } from "../../landing-v2/content";
import { STAGGER } from "../atelier.tokens";
import Reveal from "../Reveal";

function Mark({ kind }) {
  const ok = kind === "yes";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ flexShrink: 0, marginTop: "4px" }}>
      {ok ? (
        <path d="M5 12.5l4 4 10-10" stroke="var(--sky)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7 7l10 10M17 7L7 17" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Column({ title, items, kind }) {
  return (
    <Reveal className="at-card" style={{ borderColor: kind === "yes" ? "rgba(56,189,248,0.22)" : "var(--hairline)" }}>
      <h3 style={{ fontSize: "18px", marginBottom: "18px", color: kind === "yes" ? "var(--sky-light)" : "var(--muted)" }}>
        {title}
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "13px" }}>
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: "12px", color: "var(--soft)", fontSize: "15px", lineHeight: 1.7 }}>
            <Mark kind={kind} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function WhoFor() {
  return (
    <section className="at-section" style={{ background: "var(--nd)" }}>
      <div className="at-container" style={{ maxWidth: "960px" }}>
        <Reveal className="at-section-head" style={{ marginInline: "auto", textAlign: "center", maxWidth: "640px" }}>
          <span className="at-eyebrow">{WHO_FOR.eyebrow}</span>
          <h2 className="at-title">{WHO_FOR.headline}</h2>
          {WHO_FOR.intro && <p className="at-lede" style={{ marginTop: "16px" }}>{WHO_FOR.intro}</p>}
        </Reveal>

        <div className="at-grid at-grid-2">
          <Column title={WHO_FOR.forYou.title} items={WHO_FOR.forYou.items} kind="yes" />
          <Column title={WHO_FOR.notForYou.title} items={WHO_FOR.notForYou.items} kind="no" />
        </div>
      </div>
    </section>
  );
}
