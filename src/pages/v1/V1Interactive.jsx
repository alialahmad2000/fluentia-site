/**
 * V1 flagship interaction layer — all decorative, all gated:
 * fine pointers only for spotlight/magnetic/tilt; mobile gets the
 * sticky CTA bar instead. Everything transform/opacity only.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import { HERO } from "../landing-v2/content";
import BrandMark from "../../components/BrandMark";

const FINE_POINTER = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One delegated, rAF-throttled listener drives every card's spotlight. */
export function SpotlightController() {
  useEffect(() => {
    if (!FINE_POINTER()) return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const card = e.target.closest?.(".v1-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

/** Mobile sticky CTA — springs in after the hero, stays out of the modal's way.
 *  It also steps aside over the speak demo (it covered the mic caption and the
 *  typed toggle) and over pricing (an azure CTA under the gold «اختر طلاقة»). */
export function MobileCtaBar() {
  const [show, setShow] = useState(false);
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setCovered(visible.size > 0);
      },
      { rootMargin: "-20% 0px -20% 0px" }
    );
    ["speak", "pricing"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 1.4;
      const nearEnd = window.scrollY + window.innerHeight > document.body.scrollHeight - 420;
      setShow(past && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !covered && (
        <motion.div
          className="v1-ctabar"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          <BrandMark size={26} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--v1-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--v1-t-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              محادثة أولى مجانية
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--v1-t-faint)", marginTop: 2, whiteSpace: "nowrap" }}>
              بدون التزام · إلغاء بأي وقت
            </div>
          </div>
          <button
            type="button"
            data-open-form
            className="v1-cta v1-cta-primary"
            style={{ padding: "12px 24px", fontSize: "0.92rem", marginInlineStart: "auto", flexShrink: 0 }}
          >
            {HERO.primaryCTA}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Desktop side dot-nav — active section via IntersectionObserver. */
const DOT_SECTIONS = [
  { id: "top", label: "البداية" },
  { id: "speak", label: "قلها بالإنجليزي" },
  { id: "problem", label: "المشكلة" },
  { id: "solution", label: "المنهج" },
  { id: "product", label: "المنصة" },
  { id: "worth", label: "لماذا طلاقة" },
  { id: "pricing", label: "الباقات" },
  { id: "faq", label: "أسئلة" },
  { id: "founder", label: "المؤسس" },
];

export function DotNav() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px" }
    );
    DOT_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="v1-dotnav" aria-label="أقسام الصفحة">
      {DOT_SECTIONS.map(({ id, label }, i) => (
        <a
          key={id}
          href={`#${id}`}
          className={active === id ? "active" : ""}
          aria-label={label}
          style={i === 0 ? { background: "none", boxShadow: "none", width: 14, height: 14 } : undefined}
        >
          {i === 0 && (
            <img src="/brand/fluentia-mark.svg" alt="" width={14} height={14}
              style={{ display: "block", opacity: active === id ? 1 : 0.45, transition: "opacity 300ms var(--v1-ease)" }} />
          )}
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

/** Magnetic wrapper — the button leans ≤5px toward the cursor, springs back. */
export function Magnetic({ children }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 260, damping: 22, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 22, mass: 0.6 });
  const enabled = useRef(false);
  useEffect(() => {
    enabled.current = FINE_POINTER();
  }, []);

  const onMove = (e) => {
    if (!enabled.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
    y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 10);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x, y, display: "inline-block" }}>
      {children}
    </motion.div>
  );
}
