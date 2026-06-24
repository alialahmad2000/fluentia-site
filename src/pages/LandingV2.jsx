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

/**
 * LandingV2 — Modern Cinematic landing page (COMPLETE).
 * All 10 sections + Header + Footer + Form Modal wired.
 */
export default function LandingV2() {
  return (
    <div className="lp-scope">
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
