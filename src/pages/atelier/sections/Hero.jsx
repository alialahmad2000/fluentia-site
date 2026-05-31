import { motion, useReducedMotion } from "framer-motion";
import { HERO } from "../../landing-v2/content";
import { WORDMARK, HERO_EN, CTA_LABEL } from "../atelier.copy";
import { EASE_EMPHASIS } from "../atelier.tokens";
import Reveal from "../Reveal";
import { openLead } from "../cta";

export default function Hero() {
  const reduce = useReducedMotion();

  const scrollToPricing = () => {
    const el = document.getElementById("at-pricing");
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingBlock: "clamp(80px, 14vh, 160px)",
      }}
    >
      {/* ambient glows */}
      <div className="at-glow" style={{ width: "46vw", height: "46vw", top: "-14%", insetInlineEnd: "-10%", background: "rgba(56,189,248,0.16)" }} />
      <div className="at-glow" style={{ width: "40vw", height: "40vw", bottom: "-18%", insetInlineStart: "-12%", background: "rgba(251,191,36,0.10)", animationDelay: "-3s" }} />

      <div className="at-container" style={{ position: "relative", zIndex: 1, maxWidth: "880px" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE_EMPHASIS }}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "clamp(22px, 3.5vw, 30px)",
            letterSpacing: "0.04em",
            color: "var(--cream)",
            marginBottom: "26px",
          }}
        >
          {WORDMARK}
        </motion.div>

        <Reveal as="p" delay={0.15} className="at-serif-it" style={{ fontSize: "clamp(18px, 3vw, 26px)", color: "var(--sky-light)", marginBottom: "16px", letterSpacing: "0.01em" }}>
          {HERO_EN}
        </Reveal>

        <Reveal as="h1" delay={0.25} className="at-hero-title" style={{ marginBottom: "22px", maxWidth: "18ch" }}>
          {HERO.headline}
        </Reveal>

        <Reveal as="p" delay={0.4} className="at-lede" style={{ maxWidth: "56ch", marginBottom: "38px" }}>
          {HERO.sub}
        </Reveal>

        <Reveal delay={0.55} style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <button className="at-cta at-cta--primary" onClick={() => openLead("")}>
            {CTA_LABEL}
          </button>
          <button className="at-cta at-cta--ghost" onClick={scrollToPricing}>
            {HERO.secondaryCTA}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
