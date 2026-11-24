import { Fragment, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Seo from "../../components/Seo";
import { HOME_BOOKING, isModifiedClick } from "../../lib/booking";
import { buildWhatsAppUrl, WA_MESSAGES } from "../../lib/whatsapp";
import { TRUSTED_LOGOS } from "../landing-v2/content";
import { STORIES } from "../../data/stories";
import { Footage, Mark } from "./Footage";
import { MEDIA } from "./media";
import {
  CTA,
  CTA_SHORT,
  WA_LABEL,
  HERO,
  BEFORE_AFTER,
  HOW,
  PLATFORM,
  WHO,
  PROOF,
  STATS,
  STEPS,
  FINAL,
  NAV,
  FOOTER,
} from "./copy";
import "./cinema.css";

/**
 * /preview — the cinematic homepage candidate (Higgsfield footage, flat colour).
 *
 * Standalone on purpose: `/` and `/join` both render NextLanding, so nothing here
 * imports from src/pages/next/ and nothing there changes.
 *
 * Tracking is the homepage's, through the same global paths:
 *  - every «احجز لقاءك المبدئي» is `<a data-open-form href=HOME_BOOKING>` → /start?src=site_home,
 *    exactly where a plain click on `/` lands (NextLanding's capture listener, mirrored below);
 *  - every WhatsApp link is a wa.me URL from buildWhatsAppUrl(WA_MESSAGES.general), so the
 *    global listener (installWhatsAppClickTracking) sends GA4 whatsapp_click + TikTok Contact,
 *    with cta_id from the nearest [data-cta];
 *  - GA4 / Ads / TikTok PageView and consent come from index.html, unchanged.
 * App.jsx skips TikTok ViewContent on /preview* (preview traffic must not train the ads);
 * once this page is `/`, ViewContent fires there as it does today.
 *
 * To make this the homepage: see docs/higgsfield-rebuild/SWAP.md (one line in App.jsx).
 */

// Cream mono logos for dark grounds + their measured ratios (same as the live hero, next/DawnHero.jsx).
const LOGO_FIT = {
  moi: { h: 50, r: 0.729 },
  mc: { h: 38, r: 3.008 },
  ksu: { h: 42, r: 2.718 },
  moj: { h: 42, r: 2.679 },
  kau: { h: 50, r: 0.817 },
};

const WA_FALLBACK = `https://wa.me/966558669974?text=${encodeURIComponent(WA_MESSAGES.general)}`;

function Book({ id, children = CTA, className = "cv-btn" }) {
  return (
    <a className={className} href={HOME_BOOKING} data-open-form="" data-cta={id}>
      {children}
    </a>
  );
}

function Kicker({ n, children }) {
  return (
    <p className="cv-kicker">
      <span className="cv-kicker-n">{n}</span>
      <span>{children}</span>
    </p>
  );
}

function Header({ wa }) {
  return (
    <header className="cv-head">
      <a className="cv-brand" href="/" aria-label="طلاقة — الرئيسية">
        <Mark className="cv-brand-mark" />
        <span>طلاقة</span>
      </a>
      <nav className="cv-nav" aria-label="أقسام الصفحة">
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
        <a href={wa} data-cta="cv_header_wa" className="cv-nav-wa" target="_blank" rel="noopener">
          واتساب
        </a>
      </nav>
      <Book id="cv_header" className="cv-btn cv-btn-sm">
        <span className="cv-only-wide">{CTA}</span>
        <span className="cv-only-narrow">{CTA_SHORT}</span>
      </Book>
    </header>
  );
}

function Hero({ wa }) {
  const m = MEDIA.hero;
  return (
    <section className={`cv-hero ${m?.l ? "has-l" : ""}`} aria-labelledby="cv-h1" data-section="hero">
      <div className="cv-hero-media">
        <Footage m={m} priority alt="" />
      </div>
      <div className="cv-hero-copy">
        <p className="cv-eyebrow">{HERO.eyebrow}</p>
        <h1 id="cv-h1" className="cv-h1">
          {HERO.lines.map((l, i) => (
            <Fragment key={l}>
              {i > 0 && " "}
              <span className="cv-slab">{l}</span>
            </Fragment>
          ))}
        </h1>
        <p className="cv-hero-sub">{HERO.sub}</p>
        <div className="cv-actions">
          <Book id="cv_hero" />
          <a className="cv-link" href={wa} data-cta="cv_hero_wa" target="_blank" rel="noopener">
            {WA_LABEL}
          </a>
        </div>
        <p className="cv-note">{HERO.note}</p>
      </div>
    </section>
  );
}

/** One sticky stage; scrolling wipes «قبل» into «بعد» (right → left, the reading direction). */
function BeforeAfter() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-still", "");
      return undefined;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      const wipe = Math.min(1, Math.max(0, (p - 0.22) / 0.5));
      el.style.setProperty("--wipe", wipe.toFixed(4));
      el.toggleAttribute("data-after", wipe > 0.5);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const wide = MEDIA.before?.l && MEDIA.after?.l;
  return (
    <section ref={ref} className={`cv-ba ${wide ? "has-l" : ""}`} aria-labelledby="cv-ba-t" data-section="before_after">
      <div className="cv-ba-stage">
        <div className="cv-ba-text">
          <Kicker n={BEFORE_AFTER.kicker}>{BEFORE_AFTER.title}</Kicker>
          <h2 id="cv-ba-t" className="cv-ba-lines">
            <span className="cv-ba-line is-before">
              <em>{BEFORE_AFTER.before.tag}</em> {BEFORE_AFTER.before.line}
            </span>{" "}
            <span className="cv-ba-line is-after">
              <em>{BEFORE_AFTER.after.tag}</em> {BEFORE_AFTER.after.line}
            </span>
          </h2>
          <p className="cv-body">{BEFORE_AFTER.body}</p>
        </div>
        <div className="cv-ba-frame">
          <div className="cv-ba-layer is-before">
            <Footage m={MEDIA.before} alt="" />
            <span className="cv-chip">{BEFORE_AFTER.before.tag}</span>
          </div>
          <div className="cv-ba-layer is-after">
            <Footage m={MEDIA.after} alt="" />
            <span className="cv-chip cv-chip-accent">{BEFORE_AFTER.after.tag}</span>
          </div>
          <span className="cv-ba-edge" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="how" className="cv-sec cv-how" aria-labelledby="cv-how-t" data-section="how">
      <div className="cv-wrap">
        <Kicker n={HOW.kicker}>كيف نشتغل</Kicker>
        <h2 id="cv-how-t" className="cv-h2">
          {HOW.title}
        </h2>
        <ol className="cv-how-list">
          {HOW.items.map((it) => (
            <li key={it.key} className="cv-how-item">
              <Footage m={MEDIA[it.key]} className="cv-r34" alt="" />
              <div className="cv-how-copy">
                <span className="cv-num" aria-hidden="true">
                  {it.n}
                </span>
                <h3 className="cv-h3">{it.title}</h3>
                <p className="cv-body">{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section id="platform" className="cv-sec cv-plat" aria-labelledby="cv-plat-t" data-section="platform">
      <div className="cv-wrap">
        <Kicker n={PLATFORM.kicker}>المنصّة</Kicker>
        <h2 id="cv-plat-t" className="cv-h2">
          {PLATFORM.title}
        </h2>
        <p className="cv-lede">{PLATFORM.sub}</p>
      </div>
      <ul className="cv-rail" aria-label="ميزات المنصّة">
        {PLATFORM.items.map((it) => (
          <li key={it.key} className="cv-card">
            <Footage m={MEDIA[it.key]} className="cv-r34" alt="" />
            <h3 className="cv-h3">{it.name}</h3>
            <p className="cv-body">{it.line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Who() {
  return (
    <section className="cv-sec cv-who" aria-labelledby="cv-who-t" data-section="who">
      <div className="cv-wrap">
        <Kicker n={WHO.kicker}>لمين</Kicker>
        <h2 id="cv-who-t" className="cv-h2">
          {WHO.title}
        </h2>
        <ul className="cv-who-list">
          {WHO.items.map((it) => (
            <li key={it.key} className="cv-who-item">
              <Footage m={MEDIA[it.key]} className="cv-r34" alt="" />
              <h3 className="cv-who-title">{it.title}</h3>
              <p className="cv-body">{it.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Real stories only (src/data/stories.js, verbatim). Empty slots are marked, never filled with invented words. */
function Proof() {
  const story = STORIES[0];
  const slots = [story, null, null];
  return (
    <section id="stories" className="cv-sec cv-proof" aria-labelledby="cv-proof-t" data-section="stories">
      <div className="cv-wrap">
        <Kicker n={PROOF.kicker}>قصص</Kicker>
        <h2 id="cv-proof-t" className="cv-h2">
          {PROOF.title}
        </h2>
        <ul className="cv-proof-list">
          {slots.map((s, i) =>
            s ? (
              <li key={s.id} className="cv-story">
                <Footage
                  m={{ poster: s.poster, mp4: s.preview, video: true, w: 720, h: 1280 }}
                  className="cv-r34"
                  alt={`${s.name}، ${s.role}`}
                />
                <blockquote className="cv-quote">
                  <p className="cv-quote-head">«{s.headline}»</p>
                  <p className="cv-body">{s.excerpt}</p>
                  <footer>
                    <strong>{s.name}</strong> — {s.role}
                  </footer>
                </blockquote>
                <a className="cv-link cv-link-dark" href="/stories">
                  {PROOF.storyCta}
                </a>
              </li>
            ) : (
              <li key={`slot-${i}`} className="cv-slot" aria-label={PROOF.slotLabel}>
                <p className="cv-slot-label">{PROOF.slotLabel}</p>
                <p className="cv-slot-hint">{PROOF.slotHint}</p>
              </li>
            ),
          )}
        </ul>
        <dl className="cv-stats">
          {STATS.map((s) => (
            <div key={s.label} className="cv-stat">
              <dt>{s.label}</dt>
              <dd>+{s.value.toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>
        <p className="cv-stats-note">{PROOF.statsNote}</p>
        <div className="cv-logos">
          <p>{PROOF.logosLead}</p>
          <ul>
            {TRUSTED_LOGOS.items.map((it) => {
              const slug = it.src.split("/").pop().replace(/\.\w+$/, "");
              const fit = LOGO_FIT[slug] || { h: 40, r: 1 };
              const w = Math.round(fit.h * fit.r);
              return (
                <li key={it.name}>
                  <img
                    src={`/brand/entities/mono-lg/${slug}.webp`}
                    srcSet={`/brand/entities/mono-lg/${slug}.webp 1x, /brand/entities/mono-lg/${slug}@2x.webp 2x`}
                    alt={it.name}
                    width={w}
                    height={fit.h}
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="cv-sec cv-steps" aria-labelledby="cv-steps-t" data-section="steps">
      <div className="cv-wrap">
        <Kicker n={STEPS.kicker}>البداية</Kicker>
        <h2 id="cv-steps-t" className="cv-h2">
          {STEPS.title}
        </h2>
        <ol className="cv-steps-list">
          {STEPS.items.map((s) => (
            <li key={s.n}>
              <span className="cv-step-n" aria-hidden="true">
                {s.n}
              </span>
              <h3 className="cv-h3">{s.title}</h3>
              <p className="cv-body">{s.body}</p>
            </li>
          ))}
        </ol>
        <Book id="cv_steps" className="cv-btn cv-btn-ink" />
      </div>
    </section>
  );
}

function Final({ wa }) {
  const m = MEDIA.final;
  return (
    <section className={`cv-final ${m ? "has-media" : ""}`} aria-labelledby="cv-final-t" data-section="final_cta">
      {m ? (
        <div className="cv-final-media">
          <Footage m={m} alt="" />
        </div>
      ) : (
        <Mark className="cv-final-mark" />
      )}
      <div className="cv-final-copy">
        <h2 id="cv-final-t" className="cv-final-t">
          {FINAL.title.map((l, i) => (
            <Fragment key={l}>
              {i > 0 && " "}
              <span>{l}</span>
            </Fragment>
          ))}
        </h2>
        <p className="cv-hero-sub">{FINAL.sub}</p>
        <div className="cv-actions">
          <Book id="cv_final" />
          <a className="cv-btn cv-btn-ghost" href={wa} data-cta="cv_final_wa" target="_blank" rel="noopener">
            {WA_LABEL}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="cv-foot">
      <div className="cv-wrap cv-foot-in">
        <a className="cv-brand" href="/">
          <Mark className="cv-brand-mark" />
          <span>طلاقة</span>
        </a>
        <p>{FOOTER.line}</p>
        <ul>
          {FOOTER.links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

/** seoPath: "/preview" (noindex candidate) or "/" once it is the homepage (docs/higgsfield-rebuild/SWAP.md). */
export default function CinemaPreview({ seoPath = "/preview" }) {
  // Same as the homepage: the ref code (cookie / ?ref=) joins the WhatsApp text on the client.
  const [wa, setWa] = useState(WA_FALLBACK);
  useEffect(() => setWa(buildWhatsAppUrl(WA_MESSAGES.general)), []);

  // Same as `/` (NextLanding): a plain click on a booking CTA goes to HOME_BOOKING;
  // cmd/ctrl/middle-click keeps the browser's own new tab.
  useEffect(() => {
    const onClick = (e) => {
      const t = e.target.closest?.("[data-open-form]");
      if (!t || (t.hasAttribute("href") && isModifiedClick(e))) return;
      e.preventDefault();
      window.location.assign(HOME_BOOKING);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const hero = MEDIA.hero;
  return (
    <div className="cv" dir="rtl" lang="ar" data-route-chunk="CinemaPreview">
      <Seo path={seoPath} />
      {hero && (
        <Helmet>
          <link rel="preload" as="image" type="image/avif" href={`${hero.p}.avif`} fetchpriority="high" media={hero.l ? "(orientation: portrait)" : undefined} />
          {hero.l && <link rel="preload" as="image" type="image/avif" href={`${hero.l}.avif`} media="(orientation: landscape)" />}
        </Helmet>
      )}
      <Header wa={wa} />
      <main>
        <Hero wa={wa} />
        <BeforeAfter />
        <How />
        <Platform />
        <Who />
        <Proof />
        <Steps />
        <Final wa={wa} />
      </main>
      <Footer />
    </div>
  );
}
