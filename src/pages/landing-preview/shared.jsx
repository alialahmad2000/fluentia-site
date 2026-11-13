import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import BrandMark from "../../components/BrandMark";
import { bookingHref } from "../../lib/booking";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import {
  HERO,
  PROBLEM,
  WORTH,
  SOLUTION,
  SOCIAL_PROOF,
  PRICING,
  WHO_FOR,
  FAQ,
  FINAL_CTA,
  FOOTER,
  NAV,
  TRUSTED_LOGOS,
} from "../landing-v2/content";
import { CTA_LABEL, HERO_LINES_HOME, HERO_TRUST, SEE_INSIDE, LIVE_NOTE, STORIES_SUB, LEVEL_TEST_LINK, TITLES } from "../next/copy";
import { STAGE, RAIL } from "../next/showcase";

/**
 * Homepage visual-direction previews (/preview/a, /b, /c) — the shared layer.
 *
 * Every word comes from the live homepage's own content files (landing-v2/content.js,
 * next/copy.js, next/showcase.js), so a preview can never drift from `/` in copy,
 * prices, FAQ or links. Each direction owns only its look: its stylesheet and its
 * own hero / platform / stats sections. The structural pieces below (header,
 * pricing, fit, FAQ, final call, footer) render one semantic markup that each
 * direction's stylesheet dresses differently.
 *
 * Previews fire no conversion events: CTAs are the homepage's real links
 * (/start?src=site_home, /start?pkg=…, /private?pkg=…, WhatsApp), followed as links.
 */

export const C = {
  HERO,
  PROBLEM,
  WORTH,
  SOLUTION,
  SOCIAL_PROOF,
  PRICING,
  WHO_FOR,
  FAQ,
  FINAL_CTA,
  FOOTER,
  NAV,
  TRUSTED_LOGOS,
  CTA_LABEL,
  HERO_LINES: HERO_LINES_HOME,
  HERO_TRUST,
  SEE_INSIDE,
  LIVE_NOTE,
  STORIES_SUB,
  LEVEL_TEST_LINK,
  TITLES,
  STAGE,
  RAIL,
  PLATFORM: SOLUTION.pillars.find((p) => p.icon === "platform"),
};

export const titleText = (lines) => lines.map((l) => l.text).join(" ");
export const fmt = (n) => Number(n).toLocaleString("en-US");

/** Noindex head + the display face, preloaded. */
export function PreviewHead({ title }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="preload" as="font" type="font/woff2" href="/fonts/kufam-800-arabic.woff2" crossOrigin="" />
    </Helmet>
  );
}

/**
 * One observer reveals every `.pv-rv` inside `root` once (adds `.is-in`), and
 * counts every `[data-count]` up from zero the first time it is on screen.
 * Reduced motion / no IntersectionObserver: everything is shown at once.
 */
export function usePageMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const rv = [...root.querySelectorAll(".pv-rv")];
    const counters = [...root.querySelectorAll("[data-count]")];
    if (reduce || !("IntersectionObserver" in window)) {
      rv.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    root.classList.add("pv-motion");
    const rafs = new Set();
    const count = (el) => {
      const to = Number(el.dataset.count);
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1400);
        el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) rafs.add(requestAnimationFrame(step));
      };
      rafs.add(requestAnimationFrame(step));
    };
    counters.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = "0";
      else el.dataset.done = "";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = e.target;
          io.unobserve(t);
          if (t.classList.contains("pv-rv")) t.classList.add("is-in");
          if (t.dataset.count !== undefined && t.dataset.done === undefined) {
            t.dataset.done = "";
            count(t);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    rv.forEach((el) => io.observe(el));
    counters.forEach((el) => el.dataset.done === undefined && io.observe(el));
    return () => {
      io.disconnect();
      rafs.forEach((id) => cancelAnimationFrame(id));
    };
  }, [rootRef]);
}

/** Smooth in-page anchor jumps (instant under reduced motion). */
export function jump(e, id) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/* ── the five client logos (single-colour set; a direction can recolour them) ── */
const LOGO_FIT = {
  moi: { h: 30, r: 0.731 },
  mc: { h: 24, r: 3.0 },
  ksu: { h: 26, r: 2.72 },
  moj: { h: 26, r: 2.681 },
  kau: { h: 30, r: 0.819 },
};

export function Logos({ className = "" }) {
  return (
    <ul className={`pv-logos ${className}`} aria-label={`${TRUSTED_LOGOS.lead} ${TRUSTED_LOGOS.emphasis}`}>
      {TRUSTED_LOGOS.items.map((it) => {
        const slug = it.src.split("/").pop().replace(/\.\w+$/, "");
        const fit = LOGO_FIT[slug] || { h: 24, r: 1 };
        return (
          <li key={it.name}>
            <img
              src={`/brand/entities/mono/${slug}.webp`}
              srcSet={`/brand/entities/mono/${slug}.webp 1x, /brand/entities/mono/${slug}@2x.webp 2x`}
              alt={it.name}
              title={it.name}
              width={Math.round(fit.h * fit.r)}
              height={fit.h}
              decoding="async"
            />
          </li>
        );
      })}
    </ul>
  );
}

export function Cta({ className = "", children = CTA_LABEL, arrow = true, href = bookingHref() }) {
  return (
    <a href={href} className={`pv-cta ${className}`}>
      <span>{children}</span>
      {arrow ? (
        <svg className="pv-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </a>
  );
}

/* ── header: brand, three anchors, student login, the call ── */
const NAV_LINKS = [
  { id: "pv-platform", label: "المنصّة" },
  { id: "pv-pricing", label: "الباقات" },
  { id: "pv-stories", label: "قصص طلابنا" },
];

export function Header({ mark = "mark" }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <header className="pv-header" data-scrolled={scrolled ? "" : undefined}>
      <div className="pv-header-in">
        <a href="#pv-top" className="pv-brand" onClick={(e) => jump(e, "pv-top")} aria-label={`${NAV.brand.ar} — أعلى الصفحة`}>
          <BrandMark size={30} variant={mark} />
          <span className="pv-brand-word">{NAV.brand.ar}</span>
        </a>
        <nav className="pv-nav" aria-label="أقسام الصفحة">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
              {l.label}
            </a>
          ))}
          <a href="/journal">المجلة</a>
          <a href={NAV.studentLogin.href} target="_blank" rel="noopener noreferrer" className="pv-nav-login">
            {NAV.studentLogin.label}
          </a>
        </nav>
        <Cta className="pv-cta--nav" arrow={false} />
      </div>
    </header>
  );
}

/* ── pricing: self-study line, the two class tiers, the two 1:1 programmes ── */
const GLANCE_ROWS = [
  { key: "group", label: "حصص جماعية شهرياً" },
  { key: "solo", label: "حصص فردية شهرياً" },
  { key: "followUp", label: "متابعة المدرّب" },
];

function Tick() {
  return (
    <svg className="pv-tick" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function privateHref(id) {
  return `/private?pkg=${encodeURIComponent(id)}`;
}

export function Pricing({ title }) {
  const { entryTier: entry, tiers, vipTier: vip, intensiveTier: intensive } = PRICING;
  return (
    <section id="pv-pricing" className="pv-sec pv-pricing" aria-labelledby="pv-pricing-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          {title || <h2 id="pv-pricing-h" className="pv-h2">{titleText(TITLES.pricing)}</h2>}
          <p className="pv-lede">{PRICING.intro}</p>
        </div>

        <div className="pv-tiers">
          {tiers.map((t) => (
            <article key={t.id} className={`pv-tier pv-rv${t.isHero ? " pv-tier--hero" : ""}`}>
              {t.isHero ? <p className="pv-tier-badge">الأنسب لمعظم الطلاب</p> : null}
              <h3 className="pv-tier-name">{t.name}</h3>
              <p className="pv-tier-tag">{t.tagline}</p>
              <p className="pv-price">
                <span className="pv-price-n" dir="ltr">{fmt(t.price)}</span>
                <span className="pv-price-s">{t.priceSuffix}</span>
              </p>
              <dl className="pv-glance">
                {GLANCE_ROWS.map((r) => (
                  <div key={r.key}>
                    <dt>{r.label}</dt>
                    <dd>{t.glance[r.key]}</dd>
                  </div>
                ))}
              </dl>
              <ul className="pv-feats">
                {t.features
                  .filter((f) => !f.inGlance)
                  .map((f) => (
                    <li key={f.text}>
                      <Tick />
                      <span>{f.text}</span>
                    </li>
                  ))}
              </ul>
              <Cta href={bookingHref(t.id)} className={t.isHero ? "pv-cta--block" : "pv-cta--ghost pv-cta--block"} arrow={false}>
                {t.ctaLabel}
              </Cta>
            </article>
          ))}
        </div>

        <div className="pv-vips">
          {[vip, intensive].map((t) => (
            <article key={t.id} className="pv-vip pv-rv">
              <p className="pv-vip-badge">{t.badge}</p>
              <h3 className="pv-tier-name">{t.name}</h3>
              <p className="pv-vip-aud">{t.audienceLabel}</p>
              <p className="pv-price">
                {t.priceLow ? <span className="pv-price-from">من</span> : null}
                <span className="pv-price-n" dir="ltr">{fmt(t.priceLow || t.price)}</span>
                <span className="pv-price-s">{t.priceSuffix}</span>
              </p>
              <p className="pv-tier-tag">{t.promise}</p>
              <ul className="pv-inside">
                {t.inside.map((r) => (
                  <li key={r.label}>
                    <b>{r.label}</b>
                    <span>{r.detail}</span>
                  </li>
                ))}
              </ul>
              {t.priceNote ? <p className="pv-note">{t.priceNote}</p> : null}
              <div className="pv-vip-actions">
                <Cta href={bookingHref(t.id)} className="pv-cta--ghost" arrow={false}>
                  {t.ctaLabel}
                </Cta>
                <a href={privateHref(t.id)} className="pv-link">
                  تفاصيل البرنامج
                </a>
              </div>
            </article>
          ))}
        </div>

        <article className="pv-self pv-rv">
          <div className="pv-self-main">
            <p className="pv-vip-badge">{entry.badge}</p>
            <h3 className="pv-tier-name">{entry.name}</h3>
            <p className="pv-tier-tag">{entry.tagline}</p>
          </div>
          <p className="pv-price">
            <span className="pv-price-n" dir="ltr">{fmt(entry.price)}</span>
            <span className="pv-price-s">{entry.priceSuffix}</span>
          </p>
          <Cta href={bookingHref(entry.id)} className="pv-cta--ghost" arrow={false}>
            {entry.ctaLabel}
          </Cta>
        </article>

        <p className="pv-pricing-foot pv-rv">
          {PRICING.trust}
          <span aria-hidden="true"> · </span>
          <a href={buildWhatsAppUrl("السلام عليكم، عندي استفسار عن الباقة المناسبة لي")} target="_blank" rel="noopener noreferrer" className="pv-link">
            {PRICING.footer.waLabel}
          </a>
        </p>
      </div>
    </section>
  );
}

/* ── fit: who it is for, who it is not for ── */
export function Fit() {
  return (
    <section className="pv-sec pv-fit" aria-labelledby="pv-fit-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          <h2 id="pv-fit-h" className="pv-h2">{WHO_FOR.headline}</h2>
          <p className="pv-lede">{WHO_FOR.intro}</p>
        </div>
        <div className="pv-fit-cols">
          {[
            ["yes", WHO_FOR.forYou],
            ["no", WHO_FOR.notForYou],
          ].map(([k, col]) => (
            <div key={k} className={`pv-fit-col pv-fit-col--${k} pv-rv`}>
              <h3>{col.title}</h3>
              <ul>
                {col.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ: native disclosure, so it works before (and without) JavaScript ── */
export function Faq() {
  return (
    <section id="pv-faq" className="pv-sec pv-faq" aria-labelledby="pv-faq-h">
      <div className="pv-wrap pv-wrap--narrow">
        <div className="pv-sec-head pv-rv">
          <h2 id="pv-faq-h" className="pv-h2">{titleText(TITLES.faq)}</h2>
          <p className="pv-lede">{FAQ.intro}</p>
        </div>
        <div className="pv-qs">
          {FAQ.items.map((it, i) => (
            <details key={it.q} className="pv-q pv-rv" open={i === 0}>
              <summary>
                <span>{it.q}</span>
                <span className="pv-q-icon" aria-hidden="true" />
              </summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── the final call ── */
export function Final({ children }) {
  return (
    <section className="pv-sec pv-final" aria-labelledby="pv-final-h">
      {children}
      <div className="pv-wrap pv-final-in">
        <h2 id="pv-final-h" className="pv-h2 pv-final-title pv-rv">{titleText(TITLES.final)}</h2>
        <p className="pv-lede pv-rv">{FINAL_CTA.sub}</p>
        <div className="pv-final-actions pv-rv">
          <Cta className="pv-cta--lg" />
          <a href="/level-test" className="pv-link">
            {LEVEL_TEST_LINK}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── footer: links, contact, the «باختصار» paragraph, the legal line ── */
const GUIDE_LINKS = [
  { href: "/guide/pricing", label: "الأسعار" },
  { href: "/guide/faq", label: "الأسئلة الشائعة" },
  { href: "/guide/how-it-works", label: "كيف تبدأ" },
  { href: "/guide/private-training", label: "التدريب الفردي" },
  { href: "/guide/about", label: "عن الأكاديمية" },
];

export function Footer({ mark = "mark" }) {
  const { legal } = FOOTER;
  return (
    <footer className="pv-footer">
      <div className="pv-wrap">
        <div className="pv-foot-top">
          <div className="pv-foot-brand">
            <span className="pv-brand">
              <BrandMark size={28} variant={mark} />
              <span className="pv-brand-word">{NAV.brand.ar}</span>
            </span>
            <p>{FOOTER.tagline}</p>
          </div>
          <nav className="pv-foot-links" aria-label="روابط الموقع">
            {FOOTER.links.map((l) => (
              <a key={l.href} href={l.href.replace("/#fx-", "#pv-")}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="pv-foot-contact">
            <a href={FOOTER.contact.waLink} target="_blank" rel="noopener noreferrer" dir="ltr">
              {FOOTER.contact.whatsapp}
            </a>
            <a href={`mailto:${FOOTER.contact.email}`}>{FOOTER.contact.email}</a>
            <span>
              {FOOTER.social.map((s, i) => (
                <span key={s.href}>
                  {i ? <span aria-hidden="true"> · </span> : null}
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </span>
              ))}
            </span>
          </div>
        </div>
        <p className="pv-foot-brief">
          <strong>باختصار:</strong> أكاديمية طلاقة (Fluentia Academy) أكاديمية سعودية لتعليم الإنجليزي أونلاين للبالغين — حصص
          مباشرة عبر Google Meet في مجموعات صغيرة (7 طلاب كحد أقصى) أو تدريب فردي، ومنصّة تعلّم من Pre-A1 إلى C1. الباقات من 500
          ر.س شهرياً، وكل باقة تبدأ بلقاء مبدئي مجاني قبل أي دفع.
        </p>
        <nav className="pv-foot-guide" aria-label="دليل طلاقة">
          <a href="/guide/">دليل طلاقة: كل ما تحتاج معرفته</a>
          {GUIDE_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href="/en/about" lang="en">
            English
          </a>
          <a href="/level-test">اختبار تحديد المستوى</a>
          <a href="/verbs">الأفعال الشاذة</a>
        </nav>
        <p className="pv-legal">
          {legal.name} · {legal.crLabel} <span dir="ltr">{legal.cr}</span> · {legal.place}
        </p>
        <p className="pv-legal">{FOOTER.copyright}</p>
      </div>
    </footer>
  );
}

/* ── a phone frame around a real platform screenshot ── */
export function Device({ src, alt, className = "", width = 390, height = 844, sizes = "300px", eager = false, children }) {
  const base = src.replace(/\.webp$/, "");
  return (
    <figure className={`pv-device ${className}`}>
      <div className="pv-device-screen">
        <img
          src={src}
          srcSet={`${base}-480.webp 480w, ${src} 780w`}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          fetchpriority={eager ? "high" : undefined}
          decoding="async"
        />
        {children}
      </div>
    </figure>
  );
}

/**
 * «مشاهد» has no screen recording: it is a real line from the platform's scene
 * library (public/next/scenes-showcase.json, scene 1), set as a subtitle card.
 */
export const SCENE_LINE = {
  show: "Gilmore Girls",
  speaker: "Luke",
  before: "It's five in the morning. ",
  phrase: "Make coffee at your own house.",
  ar: "الساعة خمس الفجر. سوّي قهوة في بيتك.",
};

export function SceneCard({ className = "" }) {
  return (
    <figure className={`pv-scene ${className}`}>
      <div className="pv-scene-frame" aria-hidden="true">
        <span className="pv-scene-play" />
      </div>
      <blockquote className="pv-scene-en" dir="ltr" lang="en">
        <span className="pv-scene-who">{SCENE_LINE.speaker}:</span> {SCENE_LINE.before}
        <mark>{SCENE_LINE.phrase}</mark>
      </blockquote>
      <p className="pv-scene-ar">{SCENE_LINE.ar}</p>
      <figcaption className="pv-scene-src" dir="ltr" lang="en">
        {SCENE_LINE.show}
      </figcaption>
    </figure>
  );
}
