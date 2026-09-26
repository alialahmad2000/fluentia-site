/**
 * /join — TikTok campaign landing (noindex). /start stays the Google Ads page.
 *
 * v2: the page is the homepage, focused on one action. Every section except
 * the lead form, «كيف تبدأ» and the sticky bar is the homepage's own component,
 * rendered under a CtaContext: primary buttons read «احجز لقاءك المبدئي» and
 * links that would leave the page become `[data-open-form]` buttons (see
 * v1/ctaContext.js). The homepage's modal is not mounted here; this page's
 * delegated listener sends every `[data-open-form]` click to the form instead,
 * preselecting `data-tier` when a pricing card sent it.
 *
 * Lead pipeline is /start's, unchanged: src/lib/leads/submitLead.js →
 * fireLeadTracking (src/utils/tracking.js). Only `source` differs: 'join_page'.
 *
 * The stylesheet is inlined (?inline → <style>) rather than imported: the route
 * is prerendered, and a lazy chunk's CSS file only arrives with its JS. The
 * homepage sections' own CSS is already in the main bundle (`/` is eager).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import joinCss from "./join.css?inline";
import V1Header from "../v1/V1Header";
import V5Hero from "../v5/V5Hero";
import V5HeroShowcase from "../v5/V5HeroShowcase";
import V5LogoBand from "../v5/V5LogoBand";
import { DawnArc, Chapter, V5Problem, V5Solution } from "../v5/V5Chapters";
import { V1Stats } from "../v1/V1Sections";
import V1Product from "../v1/V1Product";
import V1TrialBand from "../v1/V1TrialBand";
import { V1WhoFor } from "../v1/V1Worth";
import V1Pricing from "../v1/V1Pricing";
import { V1FAQ, V1FinalCTA, V1Footer } from "../v1/V1Closing";
import { SpotlightController } from "../v1/V1Interactive";
import { Reveal, staggerParent, staggerItem } from "../v1/motion";
import { CtaContext } from "../v1/ctaContext";
import LeadForm from "./components/LeadForm";
import { TIERS, DEMO, STEPS, STICKY, CTA } from "./joinContent";

const TIER_IDS = new Set(TIERS.map((t) => t.id));
const COOKIE_DIALOG = '[aria-labelledby="fluentia-cookie-title"]';

/** The shared cookie banner (AppShell) sits where the sticky bar would. */
function useCookieBannerOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setOpen(!!document.querySelector(COOKIE_DIALOG));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return open;
}

export default function JoinPage() {
  const [pkgId, setPkgId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formPassed, setFormPassed] = useState(false);
  const nameRef = useRef(null);
  const formRef = useRef(null);
  const cookieOpen = useCookieBannerOpen();
  const cta = useMemo(() => ({ label: CTA }), []);

  useEffect(() => {
    // Parity with /start: TikTok PageView for this landing.
    if (window.ttq) { try { window.ttq.page(); } catch (e) { /* pixel is best-effort */ } }
  }, []);

  // Sticky bar: only once the form has scrolled away ABOVE the viewport, and
  // never while any of it is on screen.
  useEffect(() => {
    const el = formRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setFormPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goToForm = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const focusName = () => nameRef.current?.focus({ preventScroll: true });
    if (reduce) {
      el.scrollIntoView({ block: "start" });
      focusName();
      return;
    }
    // From the pricing a smooth scroll runs well past a second: focus when it
    // lands (scrollend), with a timer for browsers that do not fire it.
    let done = false;
    const land = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", land);
      focusName();
    };
    window.addEventListener("scrollend", land);
    window.setTimeout(land, 1600);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Every `[data-open-form]` on the page — header, hero, showcase, trial band,
  // pricing cards, final CTA, sticky bar — lands on the form.
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

  const stickyOn = formPassed && !submitted && !cookieOpen;

  const form = (
    <div className="v1-card j-card" id="join-form" ref={formRef}>
      <LeadForm pkgId={pkgId} setPkgId={setPkgId} nameRef={nameRef} onDone={() => setSubmitted(true)} />
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <CtaContext.Provider value={cta}>
        <div className="v1-scope v5-scope join-page" dir="rtl" lang="ar">
          <Seo path="/join" />
          <style>{joinCss}</style>
          <DawnArc />
          <div style={{ position: "relative", zIndex: 1 }}>
            <V1Header />
            <main>
              <V5Hero aside={form} />
              <V5LogoBand />

              <section className="v1-section" aria-labelledby="j-demo-h" style={{ paddingBlock: "clamp(56px, 8vw, 110px)" }}>
                <div className="v1-container j-demo">
                  <Reveal className="j-demo-head">
                    <h2 id="j-demo-h" className="v1-headline" style={{ marginTop: 0 }}>{DEMO.h2}</h2>
                    <p className="v1-intro">{DEMO.line}</p>
                  </Reveal>
                  <div className="j-demo-card">
                    <V5HeroShowcase />
                  </div>
                </div>
              </section>

              <V1Stats />
              <Chapter num={1} label="المشكلة" />
              <V5Problem />
              <Chapter num={2} label="الحل" />
              <V5Solution />
              <Chapter num={3} label="المنصة" />
              <V1Product />
              <V1TrialBand />

              <section className="v1-section" aria-labelledby="j-steps-h">
                <div className="v1-container">
                  <Reveal>
                    <h2 id="j-steps-h" className="v1-headline">{STEPS.h2}</h2>
                  </Reveal>
                  <motion.ol
                    className="j-steps"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-8% 0px" }}
                  >
                    {STEPS.items.map((s, i) => (
                      <motion.li key={s.title} variants={staggerItem} className="v1-card j-step">
                        <span className="j-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="j-step-t">{s.title}</h3>
                        <p className="j-step-b">{s.body}</p>
                      </motion.li>
                    ))}
                  </motion.ol>
                  <Reveal>
                    <button type="button" data-open-form className="v1-cta v1-cta-primary j-steps-cta">
                      {CTA} <span aria-hidden>←</span>
                    </button>
                  </Reveal>
                </div>
              </section>

              <V1WhoFor />
              <Chapter num={4} label="الباقات" />
              <V1Pricing />
              <V1FAQ />
              <V1FinalCTA />
            </main>
            <V1Footer />
          </div>
          <SpotlightController />

          <AnimatePresence>
            {stickyOn && (
              <motion.div
                className="v1-ctabar"
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                exit={{ y: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
              >
                <BrandMark size={26} />
                <div className="j-sticky-copy">
                  <div className="j-sticky-title">{STICKY.title}</div>
                  <div className="j-sticky-sub">{STICKY.sub}</div>
                </div>
                <button type="button" data-open-form className="v1-cta v1-cta-primary j-sticky-btn">
                  {CTA}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CtaContext.Provider>
    </MotionConfig>
  );
}
