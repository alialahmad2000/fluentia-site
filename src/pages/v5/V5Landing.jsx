import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
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
import BrandIntro from "../v1/BrandIntro";

/**
 * V5Landing — "Dawn Stage" at /v5.
 * The V1 Obsidian Azure system + a narrative layer: word-rain stage
 * hero with a live conversation, chapter structure (الفصل ٠١..٠٧),
 * ledger strike-through problem, beam-timeline solution, and a
 * scroll-driven night→dawn background arc. Conversion sections
 * (pricing/stories/FAQ/founder) are the proven V1 ones.
 *
 * PROMOTED to the official homepage 2026-07-07: at `/` it carries the
 * full canonical SEO block (per the Helmet-owned META ARCHITECTURE —
 * index.html keeps only invariant tags). On the preview aliases
 * (/v5, and V1 at /v1 + /v4) it stays noindexed so Google only ever
 * sees the root.
 */
export default function V5Landing() {
  const isRoot = useLocation().pathname === "/";
  return (
    <MotionConfig reducedMotion="user">
      <div className="v1-scope v5-scope" dir="rtl">
        <BrandIntro />
        <Helmet>
          <title>أكاديمية طلاقة | تعلَّم الإنجليزي مع مدربين سعوديين محترفين</title>
          {isRoot ? (
            <>
              <meta
                name="description"
                content="أكاديمية طلاقة — دورات إنجليزي أونلاين بمجموعات صغيرة (7 طلاب) مع مدربين سعوديين. متابعة يومية، حصص فردية، تقييم بالذكاء الاصطناعي. باقات تبدأ من 500 ريال."
              />
              <link rel="canonical" href="https://fluentia.academy/" />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://fluentia.academy/" />
              <meta property="og:title" content="أكاديمية طلاقة | تعلّم إنجليزي تتكلّمه — لا تحفظه" />
              <meta
                property="og:description"
                content="أكاديمية أونلاين للراشدين السعوديين — منهج علمي، مدرّبون أكاديميون، متابعة يومية، تقييم AI. باقات من 500 ريال."
              />
              <meta name="twitter:url" content="https://fluentia.academy/" />
              <meta name="twitter:title" content="أكاديمية طلاقة | تعلّم إنجليزي تتكلّمه — لا تحفظه" />
              <meta
                name="twitter:description"
                content="أكاديمية أونلاين للراشدين السعوديين — منهج علمي ومتابعة شخصية حقيقية."
              />
            </>
          ) : (
            <meta name="robots" content="noindex, nofollow" />
          )}
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
