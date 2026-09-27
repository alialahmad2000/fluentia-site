/**
 * /join — editorial light edition (preview branch design/join-editorial).
 * Style after moe-alhakeem.webflow.io, on white, in Fluentia's colours:
 * calligraphic Arabic display, scroll-speed marquees, a picture that rises
 * over the headline, sharp rectangular buttons, colour-blocked sections.
 *
 * The lead pipeline is /join's, unchanged: components/LeadForm.jsx →
 * lib/leads/submitLead.js (source 'join_page'). Every [data-open-form]
 * on the page scrolls to the form; data-tier preselects the package.
 *
 * Sections are split across three files so they can be built in parallel:
 *   HeroParts.jsx       Header, Hero (+ form slot), Intro, StickyCta
 *   MidSections.jsx     LogoTiles, PlatformWork, StoneBlock, Pains, Stats
 *   ClosingSections.jsx Steps, Fit, Pricing, Faq, FinalCta, Footer
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
// Inlined like the section CSS: the route is prerendered, and @font-face rules
// that only arrive with the lazy chunk's stylesheet would paint fallback type first.
import rukaaCss from "@fontsource/aref-ruqaa/700.css?inline";
import rukaa400Css from "@fontsource/aref-ruqaa/400.css?inline";
import cormorantCss from "@fontsource/cormorant-garamond/500.css?inline";
import Seo from "../../../components/Seo";
import tokensCss from "./jx-tokens.css?inline";
import heroCss from "./jx-hero.css?inline";
import formCss from "./jx-form.css?inline";
import midCss from "./jx-mid.css?inline";
import closeCss from "./jx-close.css?inline";
import LeadForm from "../components/LeadForm";
import { TIERS } from "../joinContent";
import { Header, Hero, Intro, StickyCta } from "./HeroParts";
import { LogoTiles, PlatformWork, StoneBlock, Pains, Stats } from "./MidSections";
import { Steps, Fit, Pricing, Faq, FinalCta, Footer } from "./ClosingSections";

const TIER_IDS = new Set(TIERS.map((t) => t.id));

export default function JoinEditorial() {
  const [pkgId, setPkgId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formPassed, setFormPassed] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const nameRef = useRef(null);
  const formRef = useRef(null);

  // The site's body is dark (index.css). Under iOS's bottom bar, overscroll and
  // the sticky CTA's safe-area inset it would show as a navy strip on this page.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#ffffff";
    return () => { document.body.style.background = prev; };
  }, []);

  useEffect(() => {
    if (window.ttq) { try { window.ttq.page(); } catch (e) { /* best-effort */ } }
  }, []);

  useEffect(() => {
    const el = formRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setFormPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The closing screen has its own call to action: the bar steps aside there.
  useEffect(() => {
    const end = document.querySelector(".jx [data-jx-end]");
    if (!end || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setAtEnd(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    io.observe(end);
    return () => io.disconnect();
  }, []);

  const goToForm = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const focusName = () => nameRef.current?.focus({ preventScroll: true });
    if (reduce) { el.scrollIntoView({ block: "start" }); focusName(); return; }
    let done = false;
    const land = () => { if (done) return; done = true; window.removeEventListener("scrollend", land); focusName(); };
    window.addEventListener("scrollend", land);
    window.setTimeout(land, 1600);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      const trigger = e.target.closest?.("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      const tier = trigger.getAttribute("data-tier");
      if (tier && TIER_IDS.has(tier)) setPkgId(tier);
      goToForm();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [goToForm]);

  const form = (
    <div className="jx-form" id="join-form" ref={formRef}>
      <LeadForm pkgId={pkgId} setPkgId={setPkgId} nameRef={nameRef} onDone={() => setSubmitted(true)} />
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="jx" dir="rtl" lang="ar">
        <Seo path="/join" />
        <style>{rukaa400Css + rukaaCss + cormorantCss + tokensCss + heroCss + formCss + midCss + closeCss}</style>
        <Header />
        <main>
          <Hero form={form} />
          <Intro />
          <LogoTiles />
          <PlatformWork />
          <StoneBlock />
          <Pains />
          <Stats />
          <Steps />
          <Fit />
          <Pricing />
          <Faq />
          <div data-jx-end aria-hidden="true" />
          <FinalCta />
        </main>
        <Footer />
        <StickyCta show={formPassed && !submitted && !atEnd} />
      </div>
    </MotionConfig>
  );
}
