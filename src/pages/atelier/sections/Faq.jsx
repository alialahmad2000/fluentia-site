import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FAQ } from "../../landing-v2/content";
import { EASE_REVEAL } from "../atelier.tokens";
import Reveal from "../Reveal";

function Item({ item, open, onToggle }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ borderBottom: "1px solid var(--hairline)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "20px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          textAlign: "start",
        }}
      >
        <span style={{ fontFamily: "var(--display-ar)", fontWeight: 700, fontSize: "clamp(15px, 2.4vw, 17px)", color: open ? "var(--cream)" : "var(--white)" }}>
          {item.q}
        </span>
        <motion.span
          animate={reduce ? undefined : { rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE_REVEAL }}
          style={{ color: open ? "var(--gold)" : "var(--muted)", fontSize: "22px", lineHeight: 1, flexShrink: 0, fontWeight: 300 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_REVEAL }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ padding: "0 4px 22px", color: "var(--soft)", fontSize: "15px", lineHeight: 1.9 }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="at-section" style={{ background: "var(--nd)" }}>
      <div className="at-container" style={{ maxWidth: "780px" }}>
        <Reveal className="at-section-head">
          <span className="at-eyebrow">{FAQ.eyebrow}</span>
          <h2 className="at-title">{FAQ.headline}</h2>
        </Reveal>

        <Reveal>
          <div style={{ borderTop: "1px solid var(--hairline)" }}>
            {FAQ.items.map((item, i) => (
              <Item key={item.q} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
