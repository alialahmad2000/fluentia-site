import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import V1Header from "../v1/V1Header";
import V5Hero from "./V5Hero";
import { DawnArc, Chapter, V5Problem, V5Solution } from "./V5Chapters";
import { V1Stats, V1Method } from "../v1/V1Sections";
import V1Product from "../v1/V1Product";
import { V1Worth, V1WhoFor } from "../v1/V1Worth";
import V1Pricing from "../v1/V1Pricing";
import { V1Stories, V1FAQ, V1Founder, V1FinalCTA, V1Footer } from "../v1/V1Closing";
import V1LeadModal from "../v1/V1LeadModal";
import { SpotlightController, MobileCtaBar, DotNav } from "../v1/V1Interactive";

/**
 * V5Landing — "Dawn Stage" at /v5.
 * The V1 Obsidian Azure system + a narrative layer: word-rain stage
 * hero with a live conversation, chapter structure (الفصل ٠١..٠٧),
 * ledger strike-through problem, beam-timeline solution, and a
 * scroll-driven night→dawn background arc. Conversion sections
 * (pricing/stories/FAQ/founder) are the proven V1 ones.
 * noindex until promoted.
 */
export default function V5Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="v1-scope v5-scope" dir="rtl">
        <Helmet>
          <title>أكاديمية طلاقة | تعلّم إنجليزي تتكلّمه — لا تحفظه</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <DawnArc />
        <div style={{ position: "relative", zIndex: 1 }}>
          <V1Header />
          <main>
            <V5Hero />
            <V1Stats />
            <Chapter num={1} label="المشكلة" />
            <V5Problem />
            <Chapter num={2} label="الحل" />
            <V5Solution />
            <Chapter num={3} label="المنصة" />
            <V1Product />
            <V1Method />
            <Chapter num={4} label="لماذا طلاقة" />
            <V1Worth />
            <V1WhoFor />
            <Chapter num={5} label="الباقات" />
            <V1Pricing />
            <Chapter num={6} label="قصص الطلاب" />
            <V1Stories />
            <V1FAQ />
            <Chapter num={7} label="كلمة المؤسس" />
            <V1Founder />
            <V1FinalCTA />
          </main>
          <V1Footer />
        </div>
        <V1LeadModal />
        <SpotlightController />
        <MobileCtaBar />
        <DotNav />
      </div>
    </MotionConfig>
  );
}
