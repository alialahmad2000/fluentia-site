import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "./motion";

/**
 * BrandIntro — 1.5s cinematic opening veil: the official F-mark
 * assembles feather-by-feather (three clip bands of the real SVG —
 * no redrawn paths), the wordmark breathes in, the veil lifts.
 * Runs once per session; skipped entirely for reduced-motion.
 */
const KEY = "fluentia_intro_seen";
const SRC = "/brand/fluentia-mark.svg";

// feather bands as [topInset%, bottomInset%] of the mark's box
const BANDS = [
  [0, 62],   // top feather
  [36, 30],  // middle feather
  [64, 0],   // bottom feather
];

export default function BrandIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      sessionStorage.setItem(KEY, "1");
      setShow(true);
      const t = setTimeout(() => setShow(false), 2050);
      return () => clearTimeout(t);
    } catch {
      /* private mode etc. — just skip the intro */
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="veil"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            background: "radial-gradient(ellipse 70% 55% at 50% 42%, #0a1424, #04070e 75%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            pointerEvents: "none",
          }}
          aria-hidden
        >
          {/* the mark, assembled from three clip bands of the real SVG */}
          <div style={{ position: "relative", width: 84, height: 106 }}>
            {BANDS.map(([top, bottom], i) => (
              <motion.img
                key={i}
                src={SRC}
                alt=""
                width={84}
                height={106}
                initial={{ opacity: 0, y: 18, x: i === 1 ? -10 : 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.14 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  objectFit: "contain",
                  clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                }}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.62 }}
            style={{ display: "flex", alignItems: "baseline", gap: 12 }}
          >
            <span style={{ fontFamily: "var(--v1-display)", fontWeight: 800, fontSize: "1.7rem", color: "var(--v1-t-strong)" }}>
              طلاقة
            </span>
            <span className="v1-num" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3em", color: "var(--v1-azure)" }}>
              FLUENTIA
            </span>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
            style={{
              width: 120,
              height: 1,
              transformOrigin: "center",
              background: "linear-gradient(to left, transparent, var(--v1-azure), transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
