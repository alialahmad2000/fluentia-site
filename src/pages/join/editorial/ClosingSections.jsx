/**
 * /join editorial — closing sections: Steps, Fit, Pricing, Faq, FinalCta, Footer.
 * Every fact comes from joinContent.js / landing-v2/content.js; nothing here
 * links away except WhatsApp, /privacy and /terms. Every pricing button is a
 * [data-open-form] that the page shell turns into "scroll to the form and
 * preselect this package".
 */
import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STEPS, CTA, formatPrice } from "../joinContent";
import { WHO_FOR, PRICING, FAQ, FINAL_CTA, FOOTER } from "../../landing-v2/content";
import { Reveal, LineReveal, EASE } from "./primitives";

/** "A. B." -> ["A.", "B."] without regex lookbehind (a SyntaxError on iOS Safari < 16.4). */
const sentences = (text) => text.split(". ").map((s, i, a) => (i < a.length - 1 ? `${s}.` : s));

/** Wrap Latin runs and "20+"-style numbers in LTR spans so they keep their shape in RTL. */
const LTR_RUN = /([A-Za-z][A-Za-z0-9.+\-()]*(?:\s+(?:\+\s+)?[A-Za-z][A-Za-z0-9.+\-()]*)*|\d+\+)/g;
function Bidi({ text }) {
  const parts = String(text).split(LTR_RUN);
  return parts.map((p, i) => (i % 2 === 1 ? <span key={i} dir="ltr" className="jc-ltr">{p}</span> : p));
}

function Price({ value, from = false, suffix, tone }) {
  return (
    <p className={`jc-price${tone ? ` jc-price--${tone}` : ""}`}>
      {from && <span className="jc-price-from">يبدأ من</span>}
      <span className="jc-price-num" dir="ltr">{formatPrice(value)}</span>
      <span className="jc-price-suffix">{suffix}</span>
    </p>
  );
}

/* ─────────────────────────── Steps ─────────────────────────── */
export function Steps() {
  return (
    <section className="jx-section jc-steps" aria-labelledby="jc-steps-h">
      <div className="jx-wrap">
        <div className="jc-steps-grid">
          <div className="jc-steps-head">
            <h2 id="jc-steps-h" className="jx-display jx-h2">{STEPS.h2}</h2>
          </div>
          <Reveal as="ol" className="jc-steps-list">
            {STEPS.items.map((s, i) => (
              <li key={s.title} className={`jc-step jc-step--${i + 1}`}>
                <span className="jc-step-num jx-latin" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="jc-step-text">
                  <h3 className="jx-display jx-h3">{s.title}</h3>
                  <p className="jx-body">{s.body}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Fit ─────────────────────────── */
export function Fit() {
  const cols = [
    { key: "yes", data: WHO_FOR.forYou, mark: "+" },
    { key: "no", data: WHO_FOR.notForYou, mark: "−" },
  ];
  return (
    <section className="jx-section jc-fit" aria-labelledby="jc-fit-h">
      <div className="jx-wrap">
        <header className="jc-head">
          <h2 id="jc-fit-h" className="jx-display jx-h2">{WHO_FOR.headline}</h2>
          <p className="jx-body jc-head-sub">{WHO_FOR.intro}</p>
        </header>
        <Reveal className="jc-fit-cols">
          {cols.map(({ key, data, mark }) => (
            <div key={key} className={`jc-fit-col jc-fit-col--${key}`}>
              <h3 className="jc-fit-title">{data.title}</h3>
              <ul className="jc-fit-list">
                {data.items.map((it) => (
                  <li key={it}>
                    <span className="jc-fit-mark" aria-hidden="true">{mark}</span>
                    <span><Bidi text={it} /></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── Pricing ─────────────────────────── */
const GLANCE_ROWS = [
  { key: "group", label: "حصص جماعية شهرياً" },
  { key: "solo", label: "حصص فردية شهرياً" },
  { key: "followUp", label: "المتابعة" },
];

function ClassTier({ tier }) {
  const hero = !!tier.isHero;
  const extras = tier.features.filter((f) => !f.inGlance);
  return (
    <article className={`jc-tier${hero ? " jc-tier--hero" : ""}`} aria-labelledby={`jc-t-${tier.id}`}>
      <div className="jc-tier-top">
        <h3 id={`jc-t-${tier.id}`} className="jx-display jc-tier-name">{tier.name}</h3>
        {hero && <span className="jc-tier-flag">الأكثر طلباً</span>}
      </div>
      <p className="jc-tier-tag">{tier.tagline}</p>
      <Price value={tier.price} suffix={tier.priceSuffix} tone={hero ? "inv" : undefined} />
      <dl className="jc-glance">
        {GLANCE_ROWS.map((r) => (
          <div key={r.key} className="jc-glance-row">
            <dt>{r.label}</dt>
            <dd>{tier.glance[r.key]}</dd>
          </div>
        ))}
      </dl>
      <ul className="jc-feats">
        {extras.map((f) => <li key={f.text}><Bidi text={f.text} /></li>)}
      </ul>
      <button type="button" className={`jx-btn ${hero ? "jx-btn-primary" : "jx-btn-outline"} jc-tier-btn`} data-open-form data-tier={tier.id}>
        {tier.ctaLabel}
      </button>
    </article>
  );
}

function SoloTier({ tier, from }) {
  return (
    <article className="jc-solo" aria-labelledby={`jc-t-${tier.id}`}>
      <p className="jc-solo-aud">{tier.audienceLabel}</p>
      <h3 id={`jc-t-${tier.id}`} className="jx-display jc-tier-name">{tier.name}</h3>
      <p className="jc-tier-tag">{tier.tagline}</p>
      <Price value={from ? tier.priceLow : tier.price} from={from} suffix={tier.priceSuffix} />
      <p className="jc-solo-note">{tier.priceNote}</p>
      <dl className="jc-inside">
        {(tier.inside || []).map((r) => (
          <div key={r.label} className="jc-inside-row">
            <dt>{r.label}</dt>
            <dd>{r.detail}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="jx-btn jx-btn-outline jc-tier-btn" data-open-form data-tier={tier.id}>
        {tier.ctaLabel}
      </button>
    </article>
  );
}

export function Pricing() {
  const self = PRICING.entryTier;
  return (
    <section id="pricing" className="jx-section jc-pricing" aria-labelledby="jc-pricing-h">
      <div className="jx-wrap">
        <header className="jc-head jc-head--split">
          <h2 id="jc-pricing-h" className="jx-display jx-h2">
            {sentences(PRICING.headline).map((l) => <span key={l} className="jc-line">{l}</span>)}
          </h2>
          <p className="jx-body jc-head-sub">{PRICING.intro}</p>
        </header>

        <Reveal>
          <p className="jc-group-label">مجموعات صغيرة وكلاسات مباشرة</p>
          <div className="jc-tiers">
            {PRICING.tiers.map((t) => <ClassTier key={t.id} tier={t} />)}
          </div>

          <p className="jc-group-label">تدريب فردي — أنت ومدربك فقط</p>
          <div className="jc-solos">
            <SoloTier tier={PRICING.vipTier} from />
            <SoloTier tier={PRICING.intensiveTier} />
          </div>

          <article className="jc-self" aria-labelledby={`jc-t-${self.id}`}>
            <div className="jc-self-text">
              <h3 id={`jc-t-${self.id}`} className="jx-display jc-self-name">{self.name}</h3>
              <p className="jc-tier-tag">{self.tagline}</p>
            </div>
            <Price value={self.price} suffix={self.priceSuffix} />
            <button type="button" className="jx-btn jx-btn-outline jc-self-btn" data-open-form data-tier={self.id}>
              {self.ctaLabel}
            </button>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */
function FaqItem({ item, open, onToggle }) {
  const id = useId();
  return (
    <li className={`jc-faq-item${open ? " is-open" : ""}`}>
      <h3 className="jc-faq-q">
        <button type="button" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>{item.q}</span>
          <span className="jc-faq-icon" aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="a"
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            className="jc-faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className="jx-body"><Bidi text={item.a} /></p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="jx-section jc-faq" aria-labelledby="jc-faq-h">
      <div className="jx-wrap jc-faq-grid">
        <header className="jc-faq-head">
          <h2 id="jc-faq-h" className="jx-display jx-h2">{FAQ.headline}</h2>
          <p className="jx-body jc-head-sub">{FAQ.intro}</p>
        </header>
        <ul className="jc-faq-list">
          {FAQ.items.map((it, i) => (
            <FaqItem key={it.q} item={it} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Final CTA ─────────────────────────── */
export function FinalCta() {
  return (
    <section className="jc-final" aria-labelledby="jc-final-h">
      <div className="jx-wrap jc-final-inner">
        <LineReveal as="h2" className="jx-display jc-final-h" lines={sentences(FINAL_CTA.headline)} />
        <button type="button" className="jc-final-link" data-open-form>
          <span>{CTA}</span>
          <svg className="jc-final-arrow" viewBox="0 0 120 16" aria-hidden="true" focusable="false">
            <path d="M119 8H2M9 1L2 8l7 7" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 0 16.48Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.25 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export function Footer() {
  const { whatsapp, waLink } = FOOTER.contact;
  return (
    <footer className="jc-foot">
      <div className="jx-wrap">
        <div className="jc-foot-top">
          <div className="jc-foot-brand">
            <img src="/brand/fluentia-mark.svg" alt="" width="36" height="36" />
            <span className="jx-display jc-foot-name">طلاقة</span>
          </div>
          <p className="jc-foot-tag">{FOOTER.tagline}</p>
        </div>
        <div className="jc-foot-bottom">
          <div className="jc-foot-meta">
            <p className="jc-foot-copy"><Bidi text={FOOTER.copyright} /></p>
            <nav className="jc-foot-links" aria-label="روابط قانونية">
              <a href="/privacy">سياسة الخصوصية</a>
              <a href="/terms">شروط الاستخدام</a>
            </nav>
          </div>
          <div className="jc-foot-contact">
            <a className="jc-foot-num" href={waLink} target="_blank" rel="noopener noreferrer" dir="ltr">{whatsapp}</a>
            <a className="jc-foot-wa" href={waLink} target="_blank" rel="noopener noreferrer" aria-label={`واتساب ${whatsapp}`}>
              <WhatsAppGlyph />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
