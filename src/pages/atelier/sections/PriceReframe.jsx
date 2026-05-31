import { PRICING } from "../../landing-v2/content";
import { toArabic } from "../atelier.copy";
import Reveal from "../Reveal";
import { openLead } from "../cta";

// Daily reframe derived from the live entry tier — no hardcoded price.
export default function PriceReframe() {
  const entry = PRICING.studentTier || PRICING.tiers[0];
  const perDay = Math.round((entry.price || 0) / 30);

  return (
    <section className="at-section" style={{ background: "var(--nd)" }}>
      <div className="at-container" style={{ maxWidth: "820px", textAlign: "center" }}>
        <Reveal>
          <span className="at-eyebrow" style={{ display: "block", marginBottom: "20px" }}>القيمة الحقيقية</span>
          <h2 className="at-title" style={{ marginBottom: "10px" }}>
            وش يعادل <span className="at-numeral" style={{ fontSize: "clamp(30px, 6vw, 50px)" }}>{toArabic(perDay)}</span> ريال باليوم؟
          </h2>
          <p className="at-lede" style={{ maxWidth: "46ch", marginInline: "auto" }}>
            باقة «{entry.name}» تبدأ من أقل من فنجان قهوة في اليوم — مقابل مهارةٍ تبقى معك العمر.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="at-card at-card--gold"
          style={{
            marginTop: "clamp(26px, 4vw, 40px)",
            background: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(10,18,37,0.5))",
            display: "flex",
            gap: "22px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
          <div className="at-numeral" style={{ fontSize: "clamp(40px, 8vw, 64px)" }}>
            {toArabic(perDay)}<span style={{ fontSize: "0.38em", color: "var(--gold)" }}> ريال / يوم</span>
          </div>
          <button className="at-cta at-cta--gold" onClick={() => openLead(entry.name)}>
            ابدأ من باقة {entry.name}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
