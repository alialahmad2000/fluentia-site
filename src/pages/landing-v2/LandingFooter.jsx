import { Container } from "../../components/landing";
import { NAV, FOOTER } from "./content";

export default function LandingFooter() {
  return (
    <footer
      style={{
        background: "var(--lp-bg-base)",
        borderTop: "1px solid var(--lp-border-subtle)",
        paddingBlock: "var(--lp-space-3xl)",
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: "var(--lp-space-2xl)",
            marginBottom: "var(--lp-space-2xl)",
          }}
          className="lp-footer-grid"
        >
          {/* Brand + tagline */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                marginBottom: "var(--lp-space-md)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 900,
                  fontSize: "var(--lp-h3)",
                  color: "var(--lp-text-strong)",
                  letterSpacing: "-0.02em",
                }}
              >
                {NAV.brand.en}
              </span>
              <span
                style={{
                  fontFamily: "var(--lp-font-display)",
                  fontWeight: 700,
                  fontSize: "var(--lp-body-s)",
                  color: "var(--lp-amber-bright)",
                }}
              >
                {NAV.brand.ar}
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--lp-body-s)",
                color: "var(--lp-text-muted)",
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 360,
              }}
            >
              {FOOTER.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={footerHeading}>روابط سريعة</h4>
            <ul style={footerList}>
              {FOOTER.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={footerLink}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-text-strong)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-text-muted)")}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + social */}
          <div>
            <h4 style={footerHeading}>تواصل</h4>
            <ul style={footerList}>
              <li>
                <a
                  href={FOOTER.contact.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={footerLink}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-text-strong)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-text-muted)")}
                >
                  💬 {FOOTER.contact.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${FOOTER.contact.email}`}
                  style={footerLink}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-text-strong)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-text-muted)")}
                >
                  ✉️ {FOOTER.contact.email}
                </a>
              </li>
              {FOOTER.social.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={footerLink}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-text-strong)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-text-muted)")}
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            paddingTop: "var(--lp-space-lg)",
            borderTop: "1px solid var(--lp-border-subtle)",
          }}
        >
          <div
            style={{
              marginBottom: "var(--lp-space-md)",
              fontSize: "var(--lp-caption)",
              color: "var(--lp-amber-bright)",
              textAlign: "center",
              fontFamily: "var(--lp-font-display)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            🗓️ التسجيل بفترات محدّدة · ١٠ مقاعد لكل فترة · فترة التسجيل القادمة: ٢٣-٢٧ مايو
          </div>
          <div
            style={{
              fontSize: "var(--lp-caption)",
              color: "var(--lp-text-faint)",
              textAlign: "center",
            }}
          >
            {FOOTER.copyright}
          </div>
        </div>
      </Container>

      <style>{`
        @media (max-width: 720px) {
          .lp-footer-grid {
            grid-template-columns: 1fr !important;
            gap: var(--lp-space-xl) !important;
          }
        }
      `}</style>
    </footer>
  );
}

const footerHeading = {
  fontFamily: "var(--lp-font-display)",
  fontSize: "var(--lp-body-s)",
  fontWeight: 700,
  color: "var(--lp-text-strong)",
  margin: 0,
  marginBottom: "var(--lp-space-md)",
  letterSpacing: "0.04em",
};

const footerList = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "var(--lp-space-sm)",
};

const footerLink = {
  color: "var(--lp-text-muted)",
  textDecoration: "none",
  fontFamily: "var(--lp-font-body)",
  fontSize: "var(--lp-body-s)",
  transition: "color var(--lp-dur-fast) var(--lp-ease)",
};
