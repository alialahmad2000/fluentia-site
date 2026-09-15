import { motion } from "framer-motion";
import { SOCIAL_PROOF, PROBLEM, SOLUTION, METHOD } from "../landing-v2/content";
import { Reveal, CountUp, staggerParent, staggerItem, EASE } from "./motion";
import HomePicture from "../v5/HomePicture";

/* ────────────────────────────────────────────────────────────
 * Stats — honest numbers, gold-free, count-up numerals
 * ──────────────────────────────────────────────────────────── */
export function V1Stats() {
  // parse "+100" / "72" / "+15K" / "6" into count-up pieces; expand K so
  // the band matches the ١٥,٠٠٠+ used in prose (critic: one numeral policy)
  const parse = (v) => {
    const m = v.match(/^(\+?)(\d+)(K?)$/);
    if (!m) return null;
    return { prefix: m[1], num: Number(m[2]) * (m[3] ? 1000 : 1), suffix: "" };
  };

  return (
    <section className="v1-section" style={{ paddingBlock: "clamp(64px, 8vw, 110px)" }}>
      <div className="v1-container">
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <span className="v1-eyebrow">{SOCIAL_PROOF.eyebrow}</span>
            <h2 className="v1-headline" style={{ fontSize: "var(--v1-d2)" }}>{SOCIAL_PROOF.headline}</h2>
          </div>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="v1-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            marginTop: 56,
            borderRadius: "var(--v1-r-lg)",
            overflow: "hidden",
            border: "1px solid var(--v1-line)",
            background: "var(--v1-line)",
          }}
        >
          {SOCIAL_PROOF.stats.map((s) => {
            const p = parse(s.value);
            return (
              <motion.div
                key={s.label}
                variants={staggerItem}
                style={{
                  background: "linear-gradient(180deg, rgba(10,18,32,0.9), rgba(6,11,22,0.95))",
                  padding: "clamp(26px, 4vw, 44px) 16px",
                  textAlign: "center",
                }}
              >
                <div className="v1-num" style={{ fontSize: "clamp(2rem, 4.5vw, 3.1rem)", fontWeight: 700, color: "var(--v1-t-strong)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {p ? <CountUp to={p.num} prefix={p.prefix} suffix={p.suffix} /> : s.value}
                </div>
                <div style={{ fontSize: "var(--v1-body-s)", color: "var(--v1-t-mute)", marginTop: 12 }}>{s.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tech-name chips and the stand-in quote were removed 2026-09-14: the chips read as a
            developer spec sheet, and the quote came from the placeholder STORIES set. */}
      </div>
      {/* The 2-up phone rule used to live only in V1Problem's style block, which the V5
          homepage doesn't render — so phones got four squeezed columns. */}
      <style>{`
        @media (max-width: 720px) {
          .v1-scope .v1-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Problem — 4 numbered editorial cards
 * ──────────────────────────────────────────────────────────── */
export function V1Problem() {
  return (
    <section className="v1-section" id="problem" style={{ position: "relative" }}>
      <div className="v1-glow" aria-hidden style={{ width: 600, height: 600, top: "10%", insetInlineEnd: "-18%", background: "radial-gradient(circle, rgba(248,113,113,0.05), transparent 65%)" }} />
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow" style={{ color: "var(--v1-red)" }}>{PROBLEM.eyebrow}</span>
          <h2 className="v1-headline" style={{ maxWidth: 720 }}>{PROBLEM.headline}</h2>
          <p className="v1-intro">{PROBLEM.intro}</p>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="v1-problem-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 64 }}
        >
          {PROBLEM.cards.map((c, i) => (
            <motion.article key={c.title} variants={staggerItem} className="v1-card v1-card-hover" style={{ padding: "clamp(24px, 3.5vw, 40px)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span className="v1-num" aria-hidden style={{
                  fontSize: "1.5rem", fontWeight: 700, direction: "ltr", lineHeight: 1,
                  color: "transparent", WebkitTextStroke: "1.2px rgba(248,113,113,0.75)", letterSpacing: "0.06em",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden style={{ width: 40, height: 1, background: "linear-gradient(to left, rgba(248,113,113,0.5), transparent)" }} />
              </div>
              <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: "auto 0 0", paddingTop: 20, lineHeight: 1.5 }}>
                {c.title}
              </h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.95, color: "var(--v1-t-mute)", margin: "14px 0 0", fontWeight: 300 }}>
                {c.body}
              </p>
            </motion.article>
          ))}
        </motion.div>

        <Reveal delay={0.1}>
          <p style={{
            marginTop: 52, textAlign: "center", fontFamily: "var(--v1-display)",
            fontSize: "var(--v1-lead)", fontWeight: 600, color: "var(--v1-azure-soft)",
          }}>
            {PROBLEM.bridge.replace("←", "↓")}
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .v1-scope .v1-problem-grid { grid-template-columns: 1fr !important; }
          .v1-scope .v1-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * Solution — 3 pillars with connective spine
 * ──────────────────────────────────────────────────────────── */
export function V1Solution() {
  return (
    <section className="v1-section" id="solution" style={{ position: "relative" }}>
      <div className="v1-glow v1-drift" aria-hidden style={{ width: 700, height: 700, top: "-6%", insetInlineStart: "-16%", background: "radial-gradient(circle, rgba(56,189,248,0.08), transparent 65%)" }} />
      <div className="v1-container">
        <Reveal>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="v1-eyebrow">{SOLUTION.eyebrow}</span>
            <h2 className="v1-headline">{SOLUTION.headline}</h2>
            <p className="v1-intro" style={{ textAlign: "center" }}>{SOLUTION.intro}</p>
          </div>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="v1-solution-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 72 }}
        >
          {SOLUTION.pillars.map((p, i) => (
            <motion.article key={p.title} variants={staggerItem} className="v1-card v1-card-hover" style={{ padding: "clamp(26px, 3vw, 38px)", display: "flex", flexDirection: "column" }}>
              {/* Icon disc */}
              <div style={{
                width: 54, height: 54, borderRadius: 16,
                background: "linear-gradient(140deg, rgba(56,189,248,0.16), rgba(56,189,248,0.04))",
                border: "1px solid var(--v1-line-azure)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <PillarIcon name={p.icon} />
              </div>
              <div className="v1-num" style={{ marginTop: 22, fontSize: "0.78rem", fontWeight: 700, color: "var(--v1-azure)", letterSpacing: "0.16em", fontFamily: "var(--v1-display)" }}>
                {p.num}
              </div>
              <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: "8px 0 0" }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "var(--v1-t-mute)", margin: "10px 0 18px", fontWeight: 300 }}>
                {p.tagline}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "auto 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.points.map((pt) => (
                  <li key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--v1-body-s)", lineHeight: 1.8, color: "var(--v1-t)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 5 }} aria-hidden>
                      <path d="M5 13l4 4L19 7" stroke="var(--v1-azure)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="v1-num" style={{ fontWeight: 400 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .v1-scope .v1-solution-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function PillarIcon({ name }) {
  const stroke = "var(--v1-azure-soft)";
  const common = { fill: "none", stroke, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "method")
    return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path {...common} d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" /><path {...common} d="M9 7h6M9 11h4" /></svg>;
  if (name === "trainer")
    return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><circle {...common} cx="12" cy="8" r="3.5" /><path {...common} d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" /></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><rect {...common} x="3" y="4" width="18" height="14" rx="3" /><path {...common} d="M8 21h8M12 18v3M7 9l3 3-3 3M13 15h4" /></svg>;
}

/* Spaced repetition, drawn rather than rendered: five cards along a line, the
 * gap after each review wider than the one before. Positions are measured from
 * the inline start, so the intervals widen in reading direction (RTL: leftward). */
const INTERVALS = [0, 13.67, 30.5, 53.67, 89.5]; // card width 10.5%; each gap twice the last (3.2 → 6.3 → 12.7 → 25.3)

function PrincipleArt({ i }) {
  if (i === 0) return <HomePicture id="method-coffee" variant="main" sizes="(max-width: 900px) 100vw, 360px" />;
  if (i === 2) return <HomePicture id="method-mic" variant="main" sizes="(max-width: 900px) 100vw, 360px" />;
  return (
    <motion.div
      className="hi-intervals"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
    >
      <span className="hi-iv-track">
      <span className="hi-iv-line" />
      {INTERVALS.map((x, n) => (
        <motion.span
          key={x}
          className="hi-iv-card"
          style={{ "--x": `${x}%` }}
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
        />
      ))}
      {INTERVALS.map((x, n) => (
        <span key={`t${x}`} className="hi-iv-tick" style={{ "--x": `${x}%` }} data-now={n === 0 || undefined} />
      ))}
      <span className="hi-iv-label" style={{ "--x": `${INTERVALS[0]}%` }}>اليوم</span>
      <span className="hi-iv-label" style={{ "--x": `${INTERVALS[INTERVALS.length - 1]}%` }}>بعد أسابيع</span>
      </span>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Method — 3 principles, each with its own picture
 * ──────────────────────────────────────────────────────────── */
export function V1Method() {
  return (
    <section className="v1-section" id="method">
      <div className="v1-container">
        <Reveal>
          <span className="v1-eyebrow">{METHOD.eyebrow}</span>
          <h2 className="v1-headline">{METHOD.headline}</h2>
          <p className="v1-intro">{METHOD.intro}</p>
        </Reveal>

        {/* One picture per principle, each in a different mode: a still life for
            conversation, a drawn diagram for spacing (exact intervals, no render),
            a device for AI + human. */}
        <div className="hi-method">
          {METHOD.pillars.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.06}>
              <article>
                <div className="hi-plate hi-principle-art" aria-hidden="true">
                  <PrincipleArt i={i} />
                </div>
                <div className="hi-principle-head">
                  <span className="v1-num" aria-hidden style={{
                    fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)", fontWeight: 700, lineHeight: 1,
                    color: "transparent", WebkitTextStroke: "1.4px rgba(125,211,252,0.85)", letterSpacing: "0.04em",
                    direction: "ltr",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 style={{ fontFamily: "var(--v1-display)", fontSize: "var(--v1-h3)", fontWeight: 700, color: "var(--v1-t-strong)", margin: 0 }}>
                    {p.title}
                  </h3>
                </div>
                <p style={{ margin: "14px 0 0", fontSize: "1rem", lineHeight: 2, color: "var(--v1-t-mute)", fontWeight: 300 }}>
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      {/* Layout lives in src/styles/home-imagery.css (.hi-method). */}
    </section>
  );
}
