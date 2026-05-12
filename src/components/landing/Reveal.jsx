import { useEffect, useRef, useState } from "react";

export default function Reveal({ delay = 0, children, style }) {
  // ALL HOOKS AT TOP — React #310 compliance
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity var(--lp-dur-slow) var(--lp-ease) ${delay}s, transform var(--lp-dur-slow) var(--lp-ease) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
