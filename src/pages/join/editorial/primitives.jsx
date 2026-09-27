import { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useVelocity, useSpring, useTransform, useReducedMotion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

/** Fade-up once, on entering the viewport. Use sparingly — one per block, not per card. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** A headline whose lines rise out of a mask (pass lines as an array of strings).
 *  The HEADING is observed and the lines follow through variants: a line that
 *  starts pushed out of its clipped mask never intersects on its own. */
export function LineReveal({ lines, className, as = "h2", delay = 0, onMount = false }) {
  const M = motion[as] || motion.h2;
  const trigger = onMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <M className={className} initial="hide" {...trigger}>
      {lines.map((l, i) => (
        <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.12em" }}>
          <motion.span
            style={{ display: "block" }}
            variants={{ hide: { y: "110%" }, show: { y: "0%" } }}
            transition={{ duration: 1, delay: delay + i * 0.09, ease: EASE }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </M>
  );
}

/**
 * Endless horizontal marquee whose speed follows scroll velocity (the
 * reference's signature). `children` is ONE copy; it is repeated `copies` times.
 * direction: 1 = content travels right, -1 = left. baseSpeed in px/s.
 */
export function Marquee({ children, baseSpeed = 60, direction = -1, copies = 4, className = "", ariaLabel }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const trackRef = useRef(null);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(vel, [-2000, 0, 2000], [4, 1, 4], { clamp: false });
  const onScreen = useRef(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, dt) => {
    if (reduce || !onScreen.current) return;
    const el = trackRef.current;
    if (!el) return;
    const unit = el.scrollWidth / copies;
    if (!unit) return;
    let next = x.get() + direction * baseSpeed * Math.abs(boost.get()) * (dt / 1000);
    if (next <= -unit) next += unit;
    if (next >= 0) next -= unit;
    x.set(next);
  });

  return (
    <div className={`jx-marquee ${className}`} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined}>
      <motion.div ref={trackRef} className="jx-marquee-track" style={{ x }} aria-hidden={ariaLabel ? true : undefined}>
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden={i > 0 || undefined}>{children}</div>
        ))}
      </motion.div>
    </div>
  );
}

/** Text set around a circle that turns slowly (the reference's «think think» ring). */
export function RingText({ text, size = 150, className = "", duration = 22 }) {
  const id = useRef(`jx-ring-${Math.random().toString(36).slice(2, 8)}`).current;
  const r = size / 2 - 12;
  return (
    <svg dir="ltr" className={`jx-ring ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true"
      style={{ animation: `jx-spin ${duration}s linear infinite` }}>
      <defs>
        <path id={id} d={`M ${size / 2},${size / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
      </defs>
      <text style={{ font: `500 13px var(--jx-latin)`, letterSpacing: "0.18em", fill: "currentColor" }}>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      <style>{`@keyframes jx-spin { to { transform: rotate(360deg); } } .jx-ring { transform-origin: 50% 50%; }`}</style>
    </svg>
  );
}
