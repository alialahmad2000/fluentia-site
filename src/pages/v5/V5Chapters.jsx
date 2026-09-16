import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { PROBLEM, SOLUTION } from "../landing-v2/content";
import { Reveal, EASE, staggerParent, staggerItem } from "../v1/motion";
import HomePicture from "./HomePicture";

/**
 * V5 narrative furniture:
 * - DawnArc: fixed background that travels night → dawn with scroll
 * - Chapter: the "الفصل ٠N" headers that make the page read as a film
 * - V5Problem: the ledger — each old failure gets struck through
 * - V5Solution: the three pillars as stations on a drawing beam
 */

/* ─── Dawn arc ─── */
export function DawnArc() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 24 });
  const nightO = useTransform(p, [0, 0.55, 1], [1, 0.55, 0.2]);
  const duskO = useTransform(p, [0.15, 0.55, 0.9], [0, 0.5, 0.25]);
  const dawnO = useTransform(p, [0.55, 0.9, 1], [0, 0.55, 0.75]);

  const layer = {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  };

  return (
    <div aria-hidden>
      <motion.div style={{ ...layer, opacity: nightO, background: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(30,58,95,0.35), transparent 65%)" }} />
      <motion.div style={{ ...layer, opacity: duskO, background: "radial-gradient(ellipse 80% 55% at 20% 110%, rgba(99,102,241,0.13), transparent 60%), radial-gradient(ellipse 60% 40% at 85% -5%, rgba(56,189,248,0.08), transparent 65%)" }} />
      <motion.div style={{ ...layer, opacity: dawnO, background: "radial-gradient(ellipse 85% 55% at 50% 112%, rgba(247,169,123,0.13), transparent 62%), radial-gradient(ellipse 70% 45% at 50% -8%, rgba(125,211,252,0.1), transparent 65%)" }} />
    </div>
  );
}

/* ─── Chapter header ─── */
export function Chapter({ num, label }) {
  return (
    <div className="v1-container">
      <Reveal>
        <div className="v5-chapter">
          <span className="num">{String(num).padStart(2, "0")}</span>
          <span className="meta">
            <span className="label">{label}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="rule" style={{ flex: 1 }} />
              <img src="/brand/fluentia-mark.svg" alt="" width={13} height={13} style={{ opacity: 0.35, flexShrink: 0 }} />
            </span>
          </span>
        </div>
      </Reveal>
    </div>
  );
}

/* ─── Problem: the ledger of old attempts ─── */
function LedgerRow({ card, i }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.72", "start 0.3"] });
  const strike = useSpring(useTransform(scrollYProgress, [0.35, 1], [0, 1]), { stiffness: 140, damping: 26 });
  const tagO = useTransform(scrollYProgress, [0.75, 1], [0, 1]);
  const tagY = useTransform(scrollYProgress, [0.75, 1], [8, 0]);

  return (
    <div
      ref={ref}
      className="v5-ledger-row"
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr 1.35fr",
        gap: "14px 36px",
        alignItems: "baseline",
        padding: "clamp(28px, 4vw, 42px) 0",
        borderTop: "1px solid var(--v1-line)",
      }}
    >
      <span className="v1-num" aria-hidden style={{
        fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1, direction: "ltr",
        color: "transparent", WebkitTextStroke: "1.4px rgba(248,113,113,0.5)",
      }}>
        {String(i + 1).padStart(2, "0")}
      </span>

      <div>
        <span style={{ position: "relative", display: "inline-block" }}>
          <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0, lineHeight: 1.6 }}>
            {card.title}
          </h3>
          <motion.span className="v5-strike" style={{ scaleX: strike }} aria-hidden />
        </span>
        <motion.div style={{ opacity: tagO, y: tagY, marginTop: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: "0.76rem", fontWeight: 700, fontFamily: "var(--v1-display)",
            color: "var(--v1-azure-soft)", background: "rgba(56,189,248,0.07)",
            border: "1px solid var(--v1-line-azure)", borderRadius: 99, padding: "5px 13px",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            نعالجها في طلاقة
          </span>
        </motion.div>
      </div>

      <p style={{ margin: 0, fontSize: "1rem", lineHeight: 2, color: "var(--v1-t-mute)", fontWeight: 300 }}>
        {card.body}
      </p>
    </div>
  );
}

export function V5Problem() {
  return (
    <section className="v1-section" id="problem" style={{ position: "relative", paddingTop: "clamp(40px, 6vw, 72px)" }}>
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow" style={{ color: "var(--v1-red)" }}>{PROBLEM.eyebrow}</span>
          <h2 className="v1-headline" style={{ maxWidth: 760 }}>{PROBLEM.headline}</h2>
          <p className="v1-intro">{PROBLEM.intro}</p>
        </Reveal>

        {/* The ledger beside one still life of the years it describes. On a phone
            the picture leads, as a wide band, and the rows follow. */}
        <div className="hi-problem">
          <div>
            {PROBLEM.cards.map((c, i) => (
              <LedgerRow key={c.title} card={c} i={i} />
            ))}
            <hr className="v1-hairline" />
          </div>
          <div className="hi-problem-art" aria-hidden="true">
            <div className="hi-plate">
              <HomePicture
                id="problem-desk"
                variant="tall"
                sizes="380px"
                art={[{ variant: "phone", media: "(max-width: 820px)", sizes: "100vw" }]}
              />
            </div>
          </div>
        </div>

        <Reveal delay={0.1}>
          <p style={{ marginTop: 48, textAlign: "center", fontFamily: "var(--v1-display)", fontSize: "var(--v1-lead)", fontWeight: 600, color: "var(--v1-azure-soft)" }}>
            {PROBLEM.bridge.replace("←", "↓")}
          </p>
        </Reveal>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .v1-scope .v5-ledger-row { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── Solution: stations on a beam ─── */
export function V5Solution() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const beam = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section className="v1-section" id="solution" style={{ position: "relative", paddingTop: "clamp(40px, 6vw, 72px)" }}>
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow">{SOLUTION.eyebrow}</span>
          <h2 className="v1-headline">{SOLUTION.headline}</h2>
          <p className="v1-intro">{SOLUTION.intro}</p>
        </Reveal>

        <div ref={ref} style={{ position: "relative", marginTop: 64, paddingBottom: 8 }}>
          <div className="v5-beam" aria-hidden>
            <motion.div style={{ scaleY: beam }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(34px, 5vw, 60px)" }}>
            {SOLUTION.pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="hi-station-row">
                  {/* station node */}
                  <span className="hi-station" style={{
                    width: 56, height: 56, borderRadius: 18, position: "relative", zIndex: 1,
                    background: "linear-gradient(140deg, rgba(56,189,248,0.18), rgba(6,11,22,0.9))",
                    border: "1px solid var(--v1-line-azure)",
                    boxShadow: "0 0 24px rgba(56,189,248,0.14)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <StationIcon name={p.icon} />
                  </span>

                  <div className={`v1-card v1-card-hover hi-pillar${p.icon === "platform" ? " hi-pillar--phone" : ""}`}>
                    <div className="hi-pillar-text">
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "nowrap" }}>
                      <span className="v1-num" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--v1-azure)", letterSpacing: "0.14em", direction: "ltr" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0, minWidth: 0 }}>
                        {p.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "var(--v1-t-mute)", margin: "10px 0 16px", fontWeight: 300 }}>
                      {p.tagline}
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {p.points.map((pt) => (
                        <li key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--v1-body-s)", lineHeight: 1.8, color: "var(--v1-t)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 5 }} aria-hidden>
                            <path d="M5 13l4 4L19 7" stroke="var(--v1-azure)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="v1-num" style={{ fontWeight: 400 }}>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    </div>
                    <PillarArt name={p.icon} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Standard units only (owner_student_id IS NULL), levels 1-3 — the shared
   curriculum, never a student's custom track. Ids match scripts/home-images/images.json. */
const COVER_COURSES = [
  ["cover-l1u02", "cover-l3u04", "cover-l2u01"],
  ["cover-l1u08", "cover-l1u03", "cover-l3u02"],
  ["cover-l3u01", "cover-l2u03", "cover-l3u12"],
];

/** Each pillar's evidence: the real covers, the trainer's desk, the real platform. */
function PillarArt({ name }) {
  if (name === "method")
    return (
      <div className="hi-pillar-art hi-pillar-art--covers" aria-hidden="true">
        <div className="hi-covers">
          {COVER_COURSES.map((row, r) => (
            <div className="hi-covers-row" key={r}>
              {row.map((id) => (
                <div className="hi-cover" key={id}>
                  <HomePicture id={id} variant="tile" sizes="(max-width: 820px) 32vw, 200px" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <span className="hi-caption">أغلفة وحدات من منهج طلاقة</span>
      </div>
    );
  if (name === "trainer")
    return (
      <div className="hi-pillar-art" aria-hidden="true">
        <HomePicture id="solution-trainer" variant="main" sizes="(max-width: 820px) 80vw, 460px" />
      </div>
    );
  return (
    <div className="hi-pillar-art hi-pillar-art--phone">
      <div className="hi-phone">
        <div className="hi-phone-screen">
          <HomePicture
            id="platform-vocab"
            variant="screen"
            sizes="226px"
            alt="صفحة مفردات وحدة «الطقس المتطرف» كما تظهر للطالب في منصة طلاقة"
          />
        </div>
      </div>
      <span className="hi-caption" aria-hidden="true">شاشة حقيقية من المنصة</span>
    </div>
  );
}

function StationIcon({ name }) {
  const stroke = "var(--v1-azure-soft)";
  const common = { fill: "none", stroke, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "method")
    return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path {...common} d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" /><path {...common} d="M9 7h6M9 11h4" /></svg>;
  if (name === "trainer")
    return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><circle {...common} cx="12" cy="8" r="3.5" /><path {...common} d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" /></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><rect {...common} x="3" y="4" width="18" height="14" rx="3" /><path {...common} d="M8 21h8M12 18v3M7 9l3 3-3 3M13 15h4" /></svg>;
}
