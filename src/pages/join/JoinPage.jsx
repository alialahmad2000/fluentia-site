/**
 * /join — TikTok campaign landing (noindex). /start stays the Google Ads page.
 *
 * Lead pipeline is /start's, unchanged: src/lib/leads/submitLead.js →
 * fireLeadTracking (src/utils/tracking.js). Only `source` differs: 'join_page'.
 *
 * The stylesheet is inlined (?inline → <style>) rather than imported: the route
 * is prerendered, and a lazy chunk's CSS file only arrives with its JS, so a
 * plain import would paint the prerendered markup unstyled first.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Users, Video, MonitorSmartphone, CalendarCheck, MicOff, CircleHelp, BatteryLow,
  LayoutDashboard, Mic, UserCheck, UserRound, ChartColumn,
} from "lucide-react";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import cairo800 from "@fontsource/cairo/files/cairo-arabic-800-normal.woff2?url";
import joinCss from "./join.css?inline";
import SpeechLine from "./components/SpeechLine";
import LeadForm from "./components/LeadForm";
import Packages from "./components/Packages";
import Faq from "./components/Faq";
import { HERO, WHY, STEPS, INCLUDED, FINAL, CTA, WA_DISPLAY } from "./joinContent";

const FACT_ICONS = [Users, Video, MonitorSmartphone, CalendarCheck];
const WHY_ICONS = [MicOff, CircleHelp, BatteryLow];
const INCLUDED_ICONS = {
  users: Users, platform: LayoutDashboard, mic: Mic, follow: UserCheck, one: UserRound, report: ChartColumn,
};

export default function JoinPage() {
  const [pkgId, setPkgId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [stickyOn, setStickyOn] = useState(false);
  const nameRef = useRef(null);
  const formRef = useRef(null);

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
      setStickyOn(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goToForm = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), reduce ? 0 : 450);
  }, []);

  const choosePackage = useCallback((id) => {
    setPkgId(id);
    goToForm();
  }, [goToForm]);

  return (
    <div className="join-page" dir="rtl" lang="ar">
      <Seo path="/join" />
      <link rel="preload" as="font" type="font/woff2" href={cairo800} crossOrigin="anonymous" />
      <style>{joinCss}</style>

      <header className="j-top" id="join-top">
        <div className="j-wrap j-top-in">
          <span className="j-logo">
            <BrandMark size={30} />
            <span className="j-logo-word">أكاديمية طلاقة</span>
          </span>
          <a href="#join-form" className="j-top-link" onClick={(e) => { e.preventDefault(); goToForm(); }}>
            {CTA}
          </a>
        </div>
      </header>

      <main>
        <section className="j-hero" aria-labelledby="j-h1">
          <div className="j-wrap j-hero-grid">
            <div className="j-hero-copy">
              <h1 id="j-h1" className="j-h1">
                {HERO.h1Lines.map((line, i) => (
                  <span key={line} className="j-h1-line" style={{ "--i": i }}>{line}</span>
                ))}
              </h1>
              <SpeechLine />
              <p className="j-hero-sub">{HERO.sub}</p>
              <button type="button" className="j-btn j-btn-primary j-hero-cta" onClick={goToForm}>
                {HERO.cta}
              </button>
              <ul className="j-facts">
                {HERO.facts.map((f, i) => {
                  const Icon = FACT_ICONS[i];
                  return (
                    <li key={f}>
                      <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="j-form-card" id="join-form" ref={formRef}>
              <LeadForm pkgId={pkgId} setPkgId={setPkgId} nameRef={nameRef} onDone={() => setSubmitted(true)} />
            </div>
          </div>
        </section>

        <section className="j-section" aria-labelledby="j-why-h">
          <div className="j-wrap j-narrow">
            <h2 id="j-why-h" className="j-h2">{WHY.h2}</h2>
            <ul className="j-rows">
              {WHY.rows.map((r, i) => {
                const Icon = WHY_ICONS[i];
                return (
                  <li key={r}>
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                );
              })}
            </ul>
            <p className="j-closing">{WHY.closing}</p>
          </div>
        </section>

        <section className="j-section j-alt" aria-labelledby="j-steps-h">
          <div className="j-wrap">
            <h2 id="j-steps-h" className="j-h2">{STEPS.h2}</h2>
            <ol className="j-steps">
              {STEPS.items.map((s, i) => (
                <li key={s.title}>
                  <span className="j-step-n" aria-hidden="true">{i + 1}</span>
                  <h3 className="j-step-t">{s.title}</h3>
                  <p className="j-step-b">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="j-section" aria-labelledby="j-inc-h">
          <div className="j-wrap">
            <h2 id="j-inc-h" className="j-h2">{INCLUDED.h2}</h2>
            <ul className="j-inc">
              {INCLUDED.items.map((it) => {
                const Icon = INCLUDED_ICONS[it.icon];
                return (
                  <li key={it.title}>
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" className="j-inc-icon" />
                    <div>
                      <h3 className="j-inc-t">{it.title}</h3>
                      <p className="j-inc-b">{it.body}</p>
                      <p className="j-inc-scope">{it.scope}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <Packages onChoose={choosePackage} />

        <Faq />

        <section className="j-section j-final" aria-labelledby="j-final-h">
          <div className="j-wrap j-narrow">
            <h2 id="j-final-h" className="j-h2">{FINAL.h2}</h2>
            <p className="j-lede">{FINAL.text}</p>
            <button type="button" className="j-btn j-btn-primary j-final-btn" onClick={goToForm}>{CTA}</button>
          </div>
        </section>
      </main>

      <footer className="j-foot">
        <div className="j-wrap j-foot-in">
          <span className="j-logo">
            <BrandMark size={24} />
            <span className="j-logo-word">أكاديمية طلاقة</span>
          </span>
          <nav className="j-foot-links" aria-label="روابط">
            <a href="/privacy">الخصوصية</a>
            <a href="/terms">الشروط</a>
            <a href="https://wa.me/966558669974" target="_blank" rel="noopener" dir="ltr" className="j-num">{WA_DISPLAY}</a>
          </nav>
        </div>
      </footer>

      <div className={`j-sticky${stickyOn && !submitted ? " is-on" : ""}`} aria-hidden={!(stickyOn && !submitted)}>
        <button
          type="button"
          className="j-btn j-btn-primary"
          tabIndex={stickyOn && !submitted ? 0 : -1}
          onClick={goToForm}
        >
          {CTA}
        </button>
      </div>
    </div>
  );
}
