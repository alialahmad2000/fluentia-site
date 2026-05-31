import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import "../../styles/atelier-tokens.css";

import Hero from "./sections/Hero";
import TrustStrip from "./sections/TrustStrip";
import Problem from "./sections/Problem";
import WhoFor from "./sections/WhoFor";
import Founder from "./sections/Founder";
import Comparison from "./sections/Comparison";
import Transformation from "./sections/Transformation";
import Testimonials from "./sections/Testimonials";
import Stats from "./sections/Stats";
import PriceReframe from "./sections/PriceReframe";
import Pricing from "./sections/Pricing";
import Faq from "./sections/Faq";
import ClosingCTA from "./sections/ClosingCTA";
import Footer from "./sections/Footer";
import AtelierLeadModal from "./AtelierLeadModal";

// Heavy in-code panels (SVG radar etc.) — lazy-loaded.
const Platform = lazy(() => import("./sections/Platform"));

// NOTE on tracking parity: TikTok ttq.page() fires from index.html on load;
// AppRoutes (src/App.jsx) fires fireTikTokViewContent() once on mount and
// gtag page_path on route change — so PageView/ViewContent already fire on
// /atelier exactly as on /. Lead/Contact events fire from AtelierLeadModal.
export default function AtelierLanding() {
  return (
    <div className="atelier-scope" dir="rtl" lang="ar">
      <Helmet>
        <html lang="ar" dir="rtl" />
        <title>أكاديمية طلاقة — معاينة Atelier</title>
        {/* Preview route: keep out of the index (mirrors /v2). */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Hero />
      <TrustStrip />
      <Problem />
      <WhoFor />
      <Founder />
      <Suspense fallback={<div style={{ minHeight: "40vh" }} />}>
        <Platform />
      </Suspense>
      <Comparison />
      <Transformation />
      <Testimonials />
      <Stats />
      <PriceReframe />
      <Pricing />
      <Faq />
      <ClosingCTA />
      <Footer />

      <AtelierLeadModal />
    </div>
  );
}
