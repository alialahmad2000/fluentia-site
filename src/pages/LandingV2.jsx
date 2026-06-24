import RegistrationStatusBanner from "./landing-v2/RegistrationStatusBanner";
import LandingHeader from "./landing-v2/LandingHeader";
import HeroSection from "./landing-v2/HeroSection";
import SocialProofSection from "./landing-v2/SocialProofSection";
import ProblemSection from "./landing-v2/ProblemSection";
import SolutionSection from "./landing-v2/SolutionSection";
import ProductShowcaseSection from "./landing-v2/ProductShowcaseSection";
import MethodSection from "./landing-v2/MethodSection";
import WorthSection from "./landing-v2/WorthSection";
import WhoForSection from "./landing-v2/WhoForSection";
import PricingSection from "./landing-v2/PricingSection";
import StoriesSection from "./landing-v2/StoriesSection";
import FAQSection from "./landing-v2/FAQSection";
import FounderSection from "./landing-v2/FounderSection";
import FinalCTASection from "./landing-v2/FinalCTASection";
import LandingFooter from "./landing-v2/LandingFooter";
import LeadFormModal from "./landing-v2/LeadFormModal";
import { Helmet } from "react-helmet-async";

/**
 * LandingV2 — Modern Cinematic landing page (COMPLETE).
 * All 10 sections + Header + Footer + Form Modal wired.
 */
export default function LandingV2() {
  return (
    <div className="lp-scope">
      <Helmet>
        <title>أكاديمية طلاقة | تعلَّم الإنجليزي مع مدربين سعوديين محترفين</title>
        <meta
          name="description"
          content="أكاديمية طلاقة — دورات إنجليزي أونلاين بمجموعات صغيرة (7 طلاب) مع مدربين سعوديين. متابعة يومية، حصص فردية، تقنيات ذكاء اصطناعي. باقات تبدأ من 500 ريال."
        />
        <link rel="canonical" href="https://fluentia.academy/" />
        <meta property="og:url" content="https://fluentia.academy/" />
        <meta property="og:title" content="أكاديمية طلاقة | تعلَّم الإنجليزي بثقة" />
        <meta
          property="og:description"
          content="دورات إنجليزي أونلاين بمجموعات صغيرة مع مدربين سعوديين محترفين. متابعة يومية. حصص فردية. باقات من 500 ريال."
        />
        <meta name="twitter:url" content="https://fluentia.academy/" />
        <meta name="twitter:title" content="أكاديمية طلاقة | تعلَّم الإنجليزي بثقة" />
        <meta
          name="twitter:description"
          content="دورات إنجليزي أونلاين بمجموعات صغيرة مع مدربين سعوديين محترفين."
        />
      </Helmet>
      <RegistrationStatusBanner />
      <LandingHeader />
      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <SolutionSection />
      <ProductShowcaseSection />
      <MethodSection />
      <WorthSection />
      <WhoForSection />
      <PricingSection />
      <StoriesSection />
      <FAQSection />
      <FounderSection />
      <FinalCTASection />
      <LandingFooter />
      <LeadFormModal />
    </div>
  );
}
