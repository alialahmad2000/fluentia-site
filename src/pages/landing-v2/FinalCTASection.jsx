import { Container, EyebrowLabel, Reveal, PrimaryCTA } from "../../components/landing";
import { FINAL_CTA, REGISTRATION, getRegistrationStatus } from "./content";

export default function FinalCTASection() {
  const status = getRegistrationStatus();
  const copy = status === "open"
    ? {
        eyebrow: "آخر فرصة",
        headline: "النافذة مفتوحة الآن — لا تفوّتها.",
        sub: `التسجيل يُغلق ٢٧ مايو · المقاعد محدودة لكل باقة. اضغط أدناه لتعبئة النموذج والتواصل مع المدرّب فوراً.`,
        cta: "احجز مقعدك الآن",
      }
    : status === "closed_before"
    ? {
        eyebrow: "فترة التسجيل القادمة قريباً",
        headline: "كل مقاعد هذا الشهر ممتلئة — احجز مكانك للفترة القادمة.",
        sub: `فترة التسجيل القادمة: ٢٣-٢٧ مايو · ${REGISTRATION.nextWindow.cohortStartLabel} · سنتواصل معك يوم الافتتاح لإكمال الحجز.`,
        cta: "احجز للفترة القادمة",
      }
    : {
        eyebrow: FINAL_CTA.eyebrow,
        headline: FINAL_CTA.headline,
        sub: FINAL_CTA.sub,
        cta: FINAL_CTA.primaryCTA,
      };

  return (
    <section
      id="cta"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(251,191,36,0.12), transparent 70%), var(--lp-bg-base)",
        paddingBlock: "var(--lp-space-section)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dotted amber grid with radial mask */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(251,191,36,0.08) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <Container>
        <Reveal>
          <div style={{ textAlign: "center", maxWidth: "var(--lp-max-w-text)", marginInline: "auto" }}>
            <div style={{ display: "inline-flex" }}>
              <EyebrowLabel>{copy.eyebrow}</EyebrowLabel>
            </div>
            <h2
              style={{
                fontFamily: "var(--lp-font-display)",
                fontSize: "var(--lp-display-2)",
                fontWeight: 900,
                color: "var(--lp-text-strong)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: "var(--lp-space-lg)",
              }}
            >
              {copy.headline}
            </h2>
            <p
              style={{
                fontSize: "var(--lp-body-l)",
                color: "var(--lp-text-muted)",
                lineHeight: 1.65,
                margin: 0,
                marginBottom: "var(--lp-space-2xl)",
              }}
            >
              {copy.sub}
            </p>
            <PrimaryCTA
              data-open-form="true"
              style={{ fontSize: "var(--lp-body-l)", paddingBlock: 18, paddingInline: 36 }}
            >
              {copy.cta} ←
            </PrimaryCTA>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
