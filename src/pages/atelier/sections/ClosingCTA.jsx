import { motion, useReducedMotion } from "framer-motion";
import { FINAL_CTA } from "../../landing-v2/content";
import { WORDMARK, CTA_LABEL } from "../atelier.copy";
import { EASE_EMPHASIS } from "../atelier.tokens";
import Reveal from "../Reveal";
import { openLead } from "../cta";

export default function ClosingCTA() {
  const reduce = useReducedMotion();
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingBlock: "clamp(90px, 16vh, 180px)", textAlign: "center" }}>
      <div className="at-glow" style={{ width: "60vw", height: "50vw", top: "-10%", insetInlineStart: "20%", background: "rgba(56,189,248,0.12)" }} />
      <div className="at-glow" style={{ width: "44vw", height: "44vw", bottom: "-20%", insetInlineEnd: "-6%", background: "rgba(251,191,36,0.08)", animationDelay: "-4s" }} />

      <div className="at-container" style={{ position: "relative", zIndex: 1, maxWidth: "680px" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE_EMPHASIS }}
          style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(24px, 4vw, 34px)", letterSpacing: "0.04em", color: "var(--cream)", marginBottom: "22px" }}
        >
          {WORDMARK}
        </motion.div>

        <Reveal as="h2" delay={0.15} className="at-title" style={{ marginBottom: "16px" }}>
          {FINAL_CTA.headline}
        </Reveal>

        {FINAL_CTA.sub && (
          <Reveal as="p" delay={0.28} className="at-lede" style={{ maxWidth: "48ch", marginInline: "auto", marginBottom: "36px" }}>
            {FINAL_CTA.sub}
          </Reveal>
        )}

        <Reveal delay={0.4}>
          <button className="at-cta at-cta--primary" onClick={() => openLead("")}>
            {CTA_LABEL}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
