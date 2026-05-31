import { motion, useReducedMotion } from "framer-motion";
import { TRANSFORM } from "../atelier.copy";
import { EASE_REVEAL } from "../atelier.tokens";
import Reveal from "../Reveal";

export default function Transformation() {
  const reduce = useReducedMotion();

  return (
    <section className="at-section" style={{ background: "var(--nd)" }}>
      <div className="at-container" style={{ maxWidth: "760px", textAlign: "center" }}>
        <Reveal>
          <span className="at-eyebrow" style={{ display: "block", marginBottom: "34px" }}>قصص التحوّل</span>
        </Reveal>

        <Reveal y={16}>
          <div className="at-meta" style={{ marginBottom: "10px" }}>قبل</div>
          <p className="at-serif-it" style={{ fontSize: "clamp(20px, 4vw, 30px)", color: "var(--muted)", lineHeight: 1.5 }}>
            “{TRANSFORM.before}”
          </p>
        </Reveal>

        {/* slow gold vertical wipe */}
        <motion.div
          initial={reduce ? false : { scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE_REVEAL, delay: 0.2 }}
          style={{
            width: "1.5px",
            height: "clamp(40px, 8vw, 70px)",
            margin: "clamp(18px, 3vw, 28px) auto",
            transformOrigin: "top",
            background: "linear-gradient(180deg, transparent, var(--gold), transparent)",
          }}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: EASE_REVEAL, delay: 0.5 }}
        >
          <div className="at-meta" style={{ marginBottom: "10px", color: "var(--gold)" }}>بعد</div>
          <p style={{ fontFamily: "var(--display-ar)", fontWeight: 800, fontSize: "clamp(24px, 5vw, 40px)", color: "var(--cream)", lineHeight: 1.45 }}>
            “{TRANSFORM.after}”
          </p>
          <div className="at-meta" style={{ marginTop: "22px" }}>
            — {TRANSFORM.name} · {TRANSFORM.context}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
