import { motion, useReducedMotion } from "framer-motion";
import { EASE_REVEAL, DUR } from "./atelier.tokens";

// ============================================================================
// Reveal — the single scroll-reveal primitive for the Atelier page.
// Fade-slide on enter (opacity 0->1 + translateY/X), once per element.
// Honors prefers-reduced-motion: renders content fully visible, no transforms.
// ============================================================================

export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 22,
  x = 0,
  duration = DUR.reveal,
  once = true,
  className,
  style,
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-10%" }}
      transition={{ duration, ease: EASE_REVEAL, delay }}
    >
      {children}
    </MotionTag>
  );
}
