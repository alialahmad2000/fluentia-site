import React from "react";
import { motion } from "framer-motion";

/**
 * V1TrialBand — the invitation to «درسك الأول» (app.fluentia.academy/try).
 *
 * Sits immediately after the Solution chapter: the visitor has just been TOLD
 * that we write the course around their own work, and the only honest next
 * move is to prove it rather than describe it again. Everything else on this
 * page is a claim; this is the one place they can check the claim themselves,
 * in ninety seconds, without handing over anything.
 *
 * Deliberately warm (amber) where the level-test band is cool (azure) — two
 * different invitations, and a visitor should never confuse "sit an exam" with
 * "see a lesson about your own job".
 */

const EASE = [0.16, 1, 0.3, 1];

/* Shown as evidence, not decoration: these are real seeded jobs, so a visitor
   who recognises their own profession here is being told the truth. */
const JOBS = [
  "تمريض",
  "محاسبة",
  "تسويق",
  "تعليم",
  "هندسة",
  "تقنية معلومات",
  "صيدلة",
  "طيران",
  "مبيعات",
  "موارد بشرية",
];

const TRIAL_URL = "https://app.fluentia.academy/try";

export default function V1TrialBand() {
  return (
    <section
      id="trial"
      style={{
        padding: "var(--v1-section) var(--v1-gutter)",
        maxWidth: "var(--v1-maxw)",
        margin: "0 auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--v1-r-lg)",
          border: "1px solid var(--v1-line-strong)",
          background:
            "radial-gradient(900px 420px at 18% -10%, rgba(251,191,36,0.16), transparent 62%), linear-gradient(180deg, rgba(10,18,32,0.86), rgba(6,11,22,0.94))",
          padding: "clamp(30px, 5.5vw, 60px)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.74rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "#fbbf24",
            padding: "7px 15px",
            borderRadius: 100,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.22)",
          }}
        >
          جرّبها قبل أي شيء
        </span>

        <h2
          style={{
            fontFamily: "var(--v1-display)",
            fontSize: "var(--v1-d2)",
            fontWeight: 800,
            lineHeight: 1.28,
            letterSpacing: "-0.02em",
            color: "var(--v1-t-strong)",
            margin: "20px 0 16px",
            maxWidth: "24ch",
          }}
        >
          أعطنا مهنتك، ونكتب لك درساً عنها الآن.
        </h2>

        <p
          style={{
            fontSize: "var(--v1-lead)",
            lineHeight: 1.95,
            color: "var(--v1-t-mute)",
            maxWidth: "56ch",
            margin: 0,
          }}
        >
          كل ما سبق كلام عن المنصّة. هذا الجزء يخليك تشوفها بنفسك: سطر واحد عن شغلك، ونكتب لك درساً
          إنجليزياً حقيقياً من داخل يومك — النص الذي تقرأه فعلاً، والمصطلحات التي تسمعها فعلاً. تقرأه
          وتجاوب عليه، ويجيك التصحيح بالعربي في نفس اللحظة. ما نطلب رقمك إلا بعد ما تشوف الدرس.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            margin: "30px 0",
          }}
        >
          {JOBS.map((j, i) => (
            <motion.span
              key={j}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 15px",
                borderRadius: 100,
                fontSize: "0.9rem",
                color: "var(--v1-t-strong)",
                background: "rgba(251,191,36,0.05)",
                border: "1px solid var(--v1-line)",
              }}
            >
              {j}
            </motion.span>
          ))}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 15px",
              fontSize: "0.9rem",
              color: "var(--v1-t-faint)",
            }}
          >
            أو أي مهنة أخرى
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <a href={TRIAL_URL} className="v1-cta v1-cta-primary" style={{ textDecoration: "none" }}>
            اكتبوا لي درسي الأول ←
          </a>
          <span style={{ fontSize: "0.84rem", color: "var(--v1-t-faint)", lineHeight: 1.8 }}>
            مجاني · بدون تسجيل · ٩٠ ثانية · درس حقيقي لا عيّنة
          </span>
        </div>
      </motion.div>
    </section>
  );
}
