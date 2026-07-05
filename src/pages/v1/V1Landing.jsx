import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import "../../styles/v1-tokens.css";
import V1Header from "./V1Header";
import V1Hero from "./V1Hero";
import { V1Stats, V1Problem, V1Solution, V1Method } from "./V1Sections";
import V1Product from "./V1Product";
import { V1Worth, V1WhoFor } from "./V1Worth";
import V1Pricing from "./V1Pricing";
import { V1Stories, V1FAQ, V1Founder, V1FinalCTA, V1Footer } from "./V1Closing";
import V1LeadModal from "./V1LeadModal";
import { SpotlightController, MobileCtaBar, DotNav } from "./V1Interactive";
import BrandIntro from "./BrandIntro";

/**
 * V1Landing — "Obsidian Azure" candidate homepage at /v1.
 * Same proven funnel + live copy/pricing (content.js is the single
 * source of truth), fully rebuilt design system. noindex until
 * promoted to /.
 */
export default function V1Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="v1-scope" dir="rtl">
        <BrandIntro />
        <Helmet>
          <title>أكاديمية طلاقة | تعلّم إنجليزي تتكلّمه — لا تحفظه</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <V1Header />
        <main>
          <V1Hero />
          <V1Stats />
          <hr className="v1-hairline" />
          <V1Problem />
          <V1Solution />
          <V1Product />
          <V1Method />
          <hr className="v1-hairline" />
          <V1Worth />
          <V1WhoFor />
          <V1Pricing />
          <V1Stories />
          <V1FAQ />
          <hr className="v1-hairline" />
          <V1Founder />
          <V1FinalCTA />
        </main>
        <V1Footer />
        <V1LeadModal />
        <SpotlightController />
        <MobileCtaBar />
        <DotNav />
      </div>
    </MotionConfig>
  );
}
