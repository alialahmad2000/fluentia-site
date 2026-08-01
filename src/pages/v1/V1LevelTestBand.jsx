import React from "react";
import { motion } from "framer-motion";

/**
 * V1LevelTestBand — the invitation to the placement exam (/level-test).
 * Sits immediately before the pricing section on the homepage: the visitor has
 * just read who the academy is for, and the honest next question is "where do
 * I actually stand?" — which is also the question that makes a price mean
 * something. Shared by V1/V4 and the live V5 homepage.
 */

const EASE = [0.16, 1, 0.3, 1];

const LADDER = [
  { code: "L0", cefr: "Pre-A1" },
  { code: "L1", cefr: "A1" },
  { code: "L2", cefr: "A2" },
  { code: "L3", cefr: "B1" },
  { code: "L4", cefr: "B2" },
  { code: "L5", cefr: "C1" },
];

export default function V1LevelTestBand() {
  return (
    <section
      id="level-test"
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
            "radial-gradient(900px 420px at 82% -10%, rgba(56,189,248,0.16), transparent 62%), linear-gradient(180deg, rgba(10,18,32,0.86), rgba(6,11,22,0.94))",
          padding: "clamp(30px, 5.5vw, 60px)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.74rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "var(--v1-azure)",
            padding: "7px 15px",
            borderRadius: 100,
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          قبل ما تختار باقة
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
            maxWidth: "22ch",
          }}
        >
          «مستواي متوسط» — أكثر جملة تكلّف الطلاب سنة كاملة.
        </h2>

        <p
          style={{
            fontSize: "var(--v1-lead)",
            lineHeight: 1.95,
            color: "var(--v1-t-mute)",
            maxWidth: "54ch",
            margin: 0,
          }}
        >
          لأن «متوسط» ما تعني شيئاً. تدخل مجموعة أسهل من قدرتك فتملّ وتترك، أو أصعب منك فتحس أنك
          الأضعف وتترك. اختبار تحديد المستوى عندنا يتكيّف مع إجاباتك ويعطيك مستوى واحداً محدداً على
          مقياس CEFR — مع تفصيل يبيّن وين قوتك ووين تحتاج شغل.
        </p>

        {/* The six levels the exam picks between */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            margin: "30px 0",
          }}
        >
          {LADDER.map((l, i) => (
            <motion.span
              key={l.code}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 7,
                padding: "9px 15px",
                borderRadius: 12,
                background: "rgba(148,197,255,0.05)",
                border: "1px solid var(--v1-line)",
              }}
            >
              <b
                style={{
                  fontFamily: "var(--v1-num)",
                  fontSize: "0.94rem",
                  fontWeight: 700,
                  color: "var(--v1-t-strong)",
                }}
              >
                {l.code}
              </b>
              <em
                style={{
                  fontStyle: "normal",
                  fontFamily: "var(--v1-num)",
                  fontSize: "0.74rem",
                  color: "var(--v1-t-faint)",
                  letterSpacing: "0.06em",
                }}
              >
                {l.cefr}
              </em>
            </motion.span>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <a href="/level-test" className="v1-cta v1-cta-primary" style={{ textDecoration: "none" }}>
            اختبر مستواك الآن ←
          </a>
          <span style={{ fontSize: "0.84rem", color: "var(--v1-t-faint)", lineHeight: 1.8 }}>
            مجاني · بدون تسجيل · ١٠ دقائق · النتيجة تظهر لك فوراً
          </span>
        </div>
      </motion.div>
    </section>
  );
}
