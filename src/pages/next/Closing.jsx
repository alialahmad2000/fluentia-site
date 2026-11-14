import { useEffect, useState } from "react";
import V1Pricing from "../v1/V1Pricing";
import { V1WhoFor } from "../v1/V1Worth";
import { V1FAQ, V1Footer } from "../v1/V1Closing";
import { FINAL_CTA } from "../landing-v2/content";
import Giant from "./Giant";
import Orb from "./Orb";
import DawnSun from "./DawnSun";
import { CTA_LABEL, LEVEL_TEST_LINK, PERF_LABEL, PERF_OPTIONS, STORIES_SUB, TITLES } from "./copy";
import StoriesFeature from "../../components/stories/StoriesFeature";
import { STORIES } from "../../data/stories";
import { useCta } from "../v1/ctaContext";
import { bookingHref } from "../../lib/booking";

/**
 * The close: the homepage's pricing, fit and FAQ components, unchanged, inside
 * /next's ground; then the final call with the planet back, small, and the
 * homepage footer with the performance-mode control under it.
 */

export function Pricing() {
  return (
    <section id="fx-pricing" className="fx-block fx-block--pricing">
      <div className="fx-block-head">
        <Giant lines={TITLES.pricing} className="fx-center-title" />
      </div>
      <V1Pricing />
    </section>
  );
}

/**
 * «قصص طلابنا» — right after the price: the moment a visitor asks «does this
 * actually work?», a student answers in her own voice, before fit and FAQ.
 * Reads src/data/stories.js only; the page wraps it in StoriesProvider.
 */
export function Stories() {
  return (
    <section id="fx-stories" className="fx-block fx-block--stories st-scope" aria-labelledby="fx-stories-h">
      <div className="fx-block-head">
        <Giant id="fx-stories-h" lines={TITLES.stories} className="fx-center-title" />
        <p className="st-sub fx-rv fx-fade">{STORIES_SUB}</p>
      </div>
      <StoriesFeature stories={STORIES} />
    </section>
  );
}

export function FitFaq() {
  return (
    <>
      <div className="fx-block fx-block--fit">
        <V1WhoFor />
      </div>
      <section id="fx-faq" className="fx-block fx-block--faq">
        <div className="fx-block-head">
          <Giant lines={TITLES.faq} className="fx-center-title" />
        </div>
        <V1FAQ />
      </section>
    </>
  );
}

/** `children` (/join) replaces the closing button — there it is the lead form itself. */
/* `dawn` (the «الفجر» homepage): the page's full dawn moment — the F sun fully
   risen over a strong horizon glow, in place of the planet. Same title, same call. */
export function Final({ gl, children, dawn = false }) {
  return (
    <section className={dawn ? "fx-final fx-final--dawn" : "fx-final"}>
      {dawn ? (
        <div className="fd-sky" aria-hidden="true">
          <div className="fd-glow" />
          <div className="fd-horizon" />
          <DawnSun id="dsf" className="fd-sun" />
        </div>
      ) : (
        <div className="fx-final-orb">
          <Orb variant="planet" gl={gl} scale={0.72} mark="center" />
        </div>
      )}
      <Giant lines={TITLES.final} className="fx-center-title fx-final-title" />
      <p className="fx-final-sub fx-rv fx-fade">{FINAL_CTA.sub}</p>
      {children || (
        <div className="fx-rv fx-fade fx-final-actions">
          <a href={bookingHref()} data-open-form className="fx-btn fx-btn--primary fx-btn--lg">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </a>
          {/* The free placement test the meta description promises (/level-test). */}
          <a href="/level-test" className="fx-quiet fx-final-test">
            {LEVEL_TEST_LINK}
          </a>
        </div>
      )}
    </section>
  );
}

const GUIDE_LINKS = [
  { href: "/guide/pricing", label: "الأسعار" },
  { href: "/guide/faq", label: "الأسئلة الشائعة" },
  { href: "/guide/how-it-works", label: "كيف تبدأ" },
  { href: "/guide/private-training", label: "التدريب الفردي" },
  { href: "/guide/about", label: "عن الأكاديمية" },
  { href: "/en/about", label: "English", lang: "en" },
];

export function Footer({ mode, onMode }) {
  // /join (campaign) shares this footer; the free-tools link is homepage-only.
  const campaign = Boolean(useCta());
  // «وضع الأداء» is a testing control, not something a visitor should read:
  // shown only with ?debug=1. The automatic tier (perf.js) and ?tier= still work.
  // Decided after hydration, so the prerendered markup never carries it.
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    try {
      setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
    } catch {
      /* no URL API: stay hidden */
    }
  }, []);
  return (
    <div className="fx-footer">
      <V1Footer />
      {campaign ? null : (
        <>
          {/* «باختصار»: the homepage in one quotable paragraph (facts: docs/seo/FACTS.md). */}
          <p style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--fx-gut)", textAlign: "center", fontSize: 14, lineHeight: 2, color: "var(--fx-faint)" }}>
            <strong style={{ fontWeight: 600 }}>باختصار:</strong> أكاديمية طلاقة (Fluentia Academy) أكاديمية سعودية لتعليم
            الإنجليزي أونلاين للبالغين — حصص مباشرة عبر Google Meet في مجموعات صغيرة (7 طلاب كحد أقصى) أو تدريب فردي،
            ومنصّة تعلّم من Pre-A1 إلى C1. الباقات من 500 ر.س شهرياً، وكل باقة تبدأ بلقاء مبدئي مجاني قبل أي دفع.
          </p>
          {/* «دليل طلاقة» — the static fact pages at /guide/ (scripts/build-guide.mjs).
              Plain <a>: they are not router routes, so a full load is required. */}
          <nav aria-label="دليل طلاقة" style={{ margin: 0, padding: "0 var(--fx-gut)", textAlign: "center", fontSize: 14, lineHeight: 2.2 }}>
            <a href="/guide/" className="fx-quiet">دليل طلاقة: كل ما تحتاج معرفته</a>
            {GUIDE_LINKS.map((l) => (
              <span key={l.href}>
                <span aria-hidden="true"> · </span>
                <a href={l.href} className="fx-quiet" lang={l.lang}>{l.label}</a>
              </span>
            ))}
          </nav>
          <p style={{ margin: 0, padding: "0 var(--fx-gut)", textAlign: "center", fontSize: 14 }}>
            أدوات مجانية: <a href="/level-test" className="fx-quiet">اختبار تحديد المستوى</a>
            <span aria-hidden="true"> · </span>
            <a href="/verbs" className="fx-quiet">الأفعال الشاذة</a>
          </p>
        </>
      )}
      {debug ? (
      <div className="fx-perf" role="group" aria-label={PERF_LABEL}>
        <span className="fx-perf-label">{PERF_LABEL}</span>
        {PERF_OPTIONS.map((o, i) => (
          <span key={o.value} className="fx-perf-opt">
            {i > 0 ? <span aria-hidden="true"> / </span> : null}
            <button type="button" aria-pressed={mode === o.value} onClick={() => onMode(o.value)}>
              {o.label}
            </button>
          </span>
        ))}
      </div>
      ) : null}
    </div>
  );
}
