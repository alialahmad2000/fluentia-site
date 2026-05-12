import {
  Container,
  Section,
  EyebrowLabel,
  SectionHeading,
  PrimaryCTA,
  SecondaryCTA,
  Reveal,
} from "../components/landing";

export default function LandingV2() {
  const sections = [
    { id: "hero", num: "01", label: "Hero", title: "بطل الصفحة", note: "LP-2 — Hero + LMS Mockup + dual CTAs" },
    { id: "social-proof", num: "02", label: "Social Proof", title: "أرقام تثبت إن النظام يشتغل", note: "LP-2 — Stats bar (طلاب، كلمات، وحدات، AI feedback)" },
    { id: "problem", num: "03", label: "The Problem", title: "ليش معاهد الإنجليزي تفشل مع البالغين السعوديين", note: "LP-2 — Story-driven, 3 sub-problems" },
    { id: "solution", num: "04", label: "The Solution", title: "ثلاث ركائز تصنع الفرق", note: "LP-3 — Method + Trainer + Platform" },
    { id: "product", num: "05", label: "Product Showcase", title: "نظام تعليمي بحجم منتج سيليكون فالي", note: "LP-3 — Bento grid: Speaking AI, Vocab Mastery, IELTS Lab..." },
    { id: "method", num: "06", label: "The Method", title: "خمس قواعد تعلّم لا يفهمها أحد غيرنا", note: "LP-3 — 5 pillars" },
    { id: "pricing", num: "07", label: "Pricing", title: "اختر مسارك", note: "LP-4 — V3: الجماعي 1,200 · تميّز 2,200 · الفردي 6,000 · IELTS 25,000/12wk" },
    { id: "stories", num: "08", label: "Stories", title: "قصص طلاب حقيقيين", note: "LP-4 — هوازن، الجوهرة، منار" },
    { id: "founder", num: "09", label: "Founder Note", title: "كلمة من د. علي", note: "LP-5 — Physician → Founder story" },
    { id: "cta", num: "10", label: "Final CTA", title: "ابدأ رحلتك اليوم", note: "LP-5 — لقاء مبدئي مجاني + WhatsApp + Footer" },
  ];

  return (
    <div className="lp-scope">
      {/* Dev banner (visible only while skeleton is at /v2) */}
      <div
        style={{
          background: "linear-gradient(90deg, var(--lp-amber), var(--lp-amber-bright))",
          color: "#0a0e1a",
          textAlign: "center",
          padding: "10px 16px",
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-body-s)",
          fontWeight: 800,
          letterSpacing: "0.05em",
        }}
      >
        🚧 LANDING V2 — SKELETON (LP-1) · المحتوى الحقيقي في LP-2 → LP-5 · سيستبدل / في LP-5
      </div>

      {sections.map((s, idx) => (
        <Section key={s.id} id={s.id} raised={idx % 2 === 1}>
          <Container>
            <Reveal>
              <EyebrowLabel>
                <span className="lp-num">{s.num}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{s.label}</span>
              </EyebrowLabel>
              <SectionHeading size={idx === 0 ? "display" : "h1"}>{s.title}</SectionHeading>
              <p
                style={{
                  marginTop: "var(--lp-space-lg)",
                  color: "var(--lp-text-muted)",
                  fontSize: "var(--lp-body-l)",
                  maxWidth: "var(--lp-max-w-text)",
                }}
              >
                {s.note}
              </p>
              {/* Amber gradient divider */}
              <div
                style={{
                  marginTop: "var(--lp-space-2xl)",
                  width: 80,
                  height: 3,
                  background: "linear-gradient(90deg, var(--lp-amber), transparent)",
                  borderRadius: 3,
                }}
              />
              {/* Demo CTAs only in section 01 to verify pill rendering */}
              {idx === 0 && (
                <div
                  style={{
                    marginTop: "var(--lp-space-2xl)",
                    display: "flex",
                    gap: "var(--lp-space-md)",
                    flexWrap: "wrap",
                  }}
                >
                  <PrimaryCTA href="#cta">احجز لقاء مبدئي مجاني ←</PrimaryCTA>
                  <SecondaryCTA href="#pricing">شوف الباقات</SecondaryCTA>
                </div>
              )}
            </Reveal>
          </Container>
        </Section>
      ))}
    </div>
  );
}
