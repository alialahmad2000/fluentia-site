import {
  Container,
  Section,
  EyebrowLabel,
  SectionHeading,
  Reveal,
} from "../components/landing";
import HeroSection from "./landing-v2/HeroSection";
import SocialProofSection from "./landing-v2/SocialProofSection";
import ProblemSection from "./landing-v2/ProblemSection";

/**
 * LandingV2 — Modern Cinematic landing page.
 * Sections 01–03 built in LP-2 (Hero, Social Proof, Problem).
 * Remaining sections (04–10) are LP-1 skeleton placeholders until LP-3/4/5.
 */
export default function LandingV2() {
  // ALL HOOKS AT TOP — React #310 (this component has no hooks but the rule stands)

  const placeholders = [
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
      {/* Dev banner */}
      <div
        style={{
          background:
            "linear-gradient(90deg, var(--lp-amber), var(--lp-amber-bright))",
          color: "#0a0e1a",
          textAlign: "center",
          padding: "10px 16px",
          fontFamily: "var(--lp-font-display)",
          fontSize: "var(--lp-body-s)",
          fontWeight: 800,
          letterSpacing: "0.05em",
        }}
      >
        🚧 LANDING V2 — LP-2 (Hero + Social Proof + Problem live) · سيستبدل / في LP-5
      </div>

      <HeroSection />
      <SocialProofSection />
      <ProblemSection />

      {/* Remaining sections — placeholders for LP-3/4/5 */}
      {placeholders.map((s, idx) => (
        <Section key={s.id} id={s.id} raised={idx % 2 === 0}>
          <Container>
            <Reveal>
              <EyebrowLabel>
                <span className="lp-num">{s.num}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{s.label}</span>
              </EyebrowLabel>
              <SectionHeading>{s.title}</SectionHeading>
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
              <div
                style={{
                  marginTop: "var(--lp-space-2xl)",
                  width: 80,
                  height: 3,
                  background: "linear-gradient(90deg, var(--lp-amber), transparent)",
                  borderRadius: 3,
                }}
              />
            </Reveal>
          </Container>
        </Section>
      ))}
    </div>
  );
}
