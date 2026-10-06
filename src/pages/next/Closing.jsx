import V1Pricing from "../v1/V1Pricing";
import { V1WhoFor } from "../v1/V1Worth";
import { V1FAQ, V1Footer } from "../v1/V1Closing";
import { FINAL_CTA } from "../landing-v2/content";
import Giant from "./Giant";
import Orb from "./Orb";
import { CTA_LABEL, PERF_LABEL, PERF_OPTIONS, TITLES } from "./copy";
import { useCta } from "../v1/ctaContext";

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
export function Final({ gl, children }) {
  return (
    <section className="fx-final">
      <div className="fx-final-orb">
        <Orb variant="planet" gl={gl} scale={0.72} mark="center" />
      </div>
      <Giant lines={TITLES.final} className="fx-center-title fx-final-title" />
      <p className="fx-final-sub fx-rv fx-fade">{FINAL_CTA.sub}</p>
      {children || (
        <div className="fx-rv fx-fade">
          <button type="button" data-open-form className="fx-btn fx-btn--primary fx-btn--lg">
            {CTA_LABEL}
            <span aria-hidden="true">←</span>
          </button>
        </div>
      )}
    </section>
  );
}

export function Footer({ mode, onMode }) {
  // /join (campaign) shares this footer; the free-tools link is homepage-only.
  const campaign = Boolean(useCta());
  return (
    <div className="fx-footer">
      <V1Footer />
      {campaign ? null : (
        <p style={{ margin: 0, padding: "0 var(--fx-gut)", textAlign: "center", fontSize: 14 }}>
          <a href="/verbs" className="fx-quiet">أدوات مجانية: الأفعال الشاذة</a>
        </p>
      )}
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
    </div>
  );
}
