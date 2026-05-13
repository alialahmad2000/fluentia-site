import { useEffect, useState } from "react";
import { NAV } from "./content";
import { PrimaryCTA } from "../../components/landing";

export default function LandingHeader() {
  // ALL HOOKS AT TOP
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when an anchor is clicked
  useEffect(() => {
    if (!mobileOpen) return;
    const onClick = (e) => {
      if (e.target.closest("a[href^='#']")) setMobileOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [mobileOpen]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(10, 14, 26, 0.92)"
          : "rgba(10, 14, 26, 0.6)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: scrolled
          ? "1px solid var(--lp-border-subtle)"
          : "1px solid transparent",
        transition:
          "background var(--lp-dur-med) var(--lp-ease), border-color var(--lp-dur-med) var(--lp-ease)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--lp-max-w)",
          marginInline: "auto",
          paddingInline: "clamp(16px, 4vw, 32px)",
          paddingBlock: scrolled ? 12 : 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--lp-space-lg)",
          transition: "padding var(--lp-dur-med) var(--lp-ease)",
        }}
      >
        {/* Brand */}
        <a
          href="#hero"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            color: "var(--lp-text-strong)",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--lp-font-display)",
              fontWeight: 900,
              fontSize: "var(--lp-h3)",
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
        </a>

        {/* Desktop nav */}
        <nav
          className="lp-nav-desktop"
          style={{ display: "flex", alignItems: "center", gap: "var(--lp-space-xl)" }}
        >
          {NAV.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: "var(--lp-text-muted)",
                textDecoration: "none",
                fontFamily: "var(--lp-font-body)",
                fontSize: "var(--lp-body-s)",
                fontWeight: 500,
                transition: "color var(--lp-dur-fast) var(--lp-ease)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-text-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-text-muted)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side: student login + CTA + hamburger */}
        <div
          className="lp-nav-actions"
          style={{ display: "flex", alignItems: "center", gap: "var(--lp-space-md)" }}
        >
          <a
            href={NAV.studentLogin.href}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-nav-login"
            style={{
              color: "var(--lp-text-muted)",
              textDecoration: "none",
              fontFamily: "var(--lp-font-body)",
              fontSize: "var(--lp-body-s)",
              fontWeight: 600,
              paddingBlock: 8,
              paddingInline: 14,
              border: "1px solid var(--lp-border-subtle)",
              borderRadius: "var(--lp-radius-pill)",
              transition: "border-color var(--lp-dur-fast) var(--lp-ease), color var(--lp-dur-fast) var(--lp-ease)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--lp-border-amber)";
              e.currentTarget.style.color = "var(--lp-text-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--lp-border-subtle)";
              e.currentTarget.style.color = "var(--lp-text-muted)";
            }}
          >
            {NAV.studentLogin.label}
          </a>
          <PrimaryCTA
            data-open-form="true"
            style={{ paddingBlock: 10, paddingInline: 20, fontSize: "var(--lp-body-s)" }}
          >
            {NAV.primaryCTA.label}
          </PrimaryCTA>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="القائمة"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="lp-nav-burger"
            style={{
              display: "none",
              width: 40,
              height: 40,
              borderRadius: "var(--lp-radius-pill)",
              background: "var(--lp-bg-elevated)",
              border: "1px solid var(--lp-border-subtle)",
              color: "var(--lp-text-strong)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "rgba(10, 14, 26, 0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid var(--lp-border-subtle)",
            paddingBlock: "var(--lp-space-lg)",
            paddingInline: "clamp(16px, 4vw, 32px)",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--lp-space-md)" }}>
            {NAV.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  color: "var(--lp-text-strong)",
                  fontFamily: "var(--lp-font-display)",
                  fontSize: "var(--lp-body-l)",
                  fontWeight: 700,
                  paddingBlock: 12,
                  paddingInline: 16,
                  borderRadius: "var(--lp-radius-card)",
                  textDecoration: "none",
                  background: "var(--lp-bg-elevated)",
                  border: "1px solid var(--lp-border-subtle)",
                }}
              >
                {l.label}
              </a>
            ))}
            <a
              href={NAV.studentLogin.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--lp-text-muted)",
                fontFamily: "var(--lp-font-body)",
                fontSize: "var(--lp-body)",
                fontWeight: 500,
                paddingBlock: 10,
                paddingInline: 16,
                textDecoration: "none",
              }}
            >
              {NAV.studentLogin.label} ↗
            </a>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .lp-nav-desktop { display: none !important; }
          .lp-nav-login   { display: none !important; }
          .lp-nav-burger  { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

function BurgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
