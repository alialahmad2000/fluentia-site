import { FOOTER } from "../../landing-v2/content";
import { WORDMARK } from "../atelier.copy";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", paddingBlock: "clamp(36px, 6vw, 56px)" }}>
      <div className="at-container" style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ maxWidth: "40ch" }}>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "24px", letterSpacing: "0.04em", color: "var(--cream)", marginBottom: "10px" }}>
            {WORDMARK}
          </div>
          {FOOTER.tagline && <p className="at-meta" style={{ lineHeight: 1.7 }}>{FOOTER.tagline}</p>}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
          {(FOOTER.social || []).map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "var(--ui)", fontSize: "14px", color: "var(--soft)", textDecoration: "none" }}>
              {s.label}
            </a>
          ))}
          {FOOTER.contact?.waLink && (
            <a href={FOOTER.contact.waLink} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "var(--ui)", fontSize: "14px", color: "var(--sky-light)", textDecoration: "none" }}>
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {FOOTER.copyright && (
        <div className="at-container" style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--hairline)" }}>
          <p className="at-meta" style={{ fontSize: "12px" }}>{FOOTER.copyright}</p>
        </div>
      )}
    </footer>
  );
}
