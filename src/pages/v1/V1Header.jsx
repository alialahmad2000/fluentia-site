import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { NAV } from "../landing-v2/content";
import { EASE } from "./motion";
import BrandMark from "../../components/BrandMark";

/**
 * V1Header — glass nav with scroll progress hairline.
 * Solidifies after 40px of scroll; mobile gets a simple sheet menu.
 */
export default function V1Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  const linkStyle = {
    color: "var(--v1-t-mute)",
    textDecoration: "none",
    fontSize: "0.94rem",
    fontWeight: 400,
    transition: "color var(--v1-fast) var(--v1-ease)",
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      style={{
        position: "fixed",
        top: 0,
        insetInline: 0,
        zIndex: 100,
        background: scrolled ? "var(--v1-glass)" : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid var(--v1-line)" : "1px solid transparent",
        transition: "background 380ms var(--v1-ease), border-color 380ms var(--v1-ease), backdrop-filter 380ms var(--v1-ease)",
      }}
    >
      {/* Scroll progress hairline */}
      <motion.div
        style={{
          position: "absolute",
          bottom: -1,
          insetInlineStart: 0,
          height: 2,
          width: "100%",
          transformOrigin: "right center",
          scaleX: progress,
          background: "linear-gradient(to left, var(--v1-azure), var(--v1-azure-soft))",
          opacity: scrolled ? 1 : 0,
        }}
      />

      <div
        className="v1-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          gap: 16,
        }}
      >
        {/* Brand */}
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <BrandMark size={30} />
          <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{
              fontFamily: "var(--v1-display)",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "var(--v1-t-strong)",
              letterSpacing: "0.01em",
            }}>
              {NAV.brand.ar}
            </span>
            <span className="v1-num" style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              color: "var(--v1-azure)",
              textTransform: "uppercase",
            }}>
              {NAV.brand.en}
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <nav className="v1-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {NAV.links.map((l) => (
            <a key={l.href} href={l.href} style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v1-t-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v1-t-mute)")}>
              {l.label}
            </a>
          ))}
          <a href={NAV.studentLogin.href} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontSize: "0.88rem" }}>
            {NAV.studentLogin.label}
          </a>
          <button type="button" data-open-form className="v1-cta v1-cta-primary" style={{ padding: "11px 26px", fontSize: "0.92rem" }}>
            {NAV.primaryCTA.label}
          </button>
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          className="v1-nav-burger"
          aria-label={menuOpen ? "إغلاق القائمة" : "القائمة"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "none",
            background: "rgba(148,197,255,0.05)",
            border: "1px solid var(--v1-line)",
            borderRadius: 12,
            width: 44,
            height: 44,
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <span style={{ width: 17, height: 1.5, background: "var(--v1-t)", display: "block", transition: "transform 300ms var(--v1-ease)", transform: menuOpen ? "translateY(3.25px) rotate(45deg)" : "none" }} />
          <span style={{ width: 17, height: 1.5, background: "var(--v1-t)", display: "block", transition: "transform 300ms var(--v1-ease)", transform: menuOpen ? "translateY(-3.25px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            position: "fixed",
            top: 68,
            insetInline: 0,
            bottom: 0,
            background: "rgba(4,7,14,0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "28px var(--v1-gutter) 40px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 99,
          }}
        >
          {NAV.links.map((l, i) => (
            <motion.a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: EASE }}
              style={{
                color: "var(--v1-t-strong)",
                textDecoration: "none",
                fontFamily: "var(--v1-display)",
                fontSize: "1.45rem",
                fontWeight: 600,
                padding: "14px 4px",
                borderBottom: "1px solid var(--v1-line)",
              }}
            >
              {l.label}
            </motion.a>
          ))}
          <motion.a
            href={NAV.studentLogin.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: EASE }}
            style={{ color: "var(--v1-t-mute)", textDecoration: "none", fontSize: "1rem", padding: "16px 4px" }}
          >
            {NAV.studentLogin.label} ↖
          </motion.a>
          <motion.button
            type="button"
            data-open-form
            onClick={() => setMenuOpen(false)}
            className="v1-cta v1-cta-primary"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34, ease: EASE }}
            style={{ marginTop: 18, width: "100%" }}
          >
            {NAV.primaryCTA.label}
          </motion.button>
        </motion.div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .v1-scope .v1-nav-desktop { display: none !important; }
          .v1-scope .v1-nav-burger { display: inline-flex !important; }
        }
      `}</style>
    </motion.header>
  );
}
