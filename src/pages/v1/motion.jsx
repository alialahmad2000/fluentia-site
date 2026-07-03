/**
 * V1 motion primitives — one shared vocabulary for the whole page.
 * Everything animates transform/opacity only; reveals fire once.
 */
import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1]; // expo-out — the house curve
export const SPRING_SMOOTH = { type: "spring", stiffness: 260, damping: 30 };
export const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

/** Scroll reveal — fade-up, fires once at -12% viewport margin. */
export function Reveal({ children, delay = 0, y = 26, className, style, as = "div" }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Stagger container + item pair. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};
export const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

/** Count-up numeral — spring-driven, starts when scrolled into view. */
export function CountUp({ to, suffix = "", prefix = "", style, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const mv = useSpring(0, { stiffness: 160, damping: 32 });
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString("en-US")}${suffix}`);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);
  return <motion.span ref={ref} className={className} style={style}>{text}</motion.span>;
}
