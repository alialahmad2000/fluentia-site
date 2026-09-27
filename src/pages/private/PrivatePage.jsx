/**
 * /private — the 1:1 programmes, lived before the call (indexable; paid ads land here).
 *
 * Built from the homepage's own system, like /join: v1/v5 tokens, chapter
 * dividers, Reveal, card surfaces, the gold VIP accent. Homepage components are
 * reused where one fits (header, «لكل مهنة إنجليزيتها الخاصة», fit/not-fit,
 * FAQ, final CTA, footer), rendered under a CtaContext so every primary button
 * reads «احجز استشارتك» and lands on this page's form instead of leaving it.
 * Only the hero orbit, team cards, week strip, comparison and form are this
 * page's own.
 *
 * Lead pipeline is /join's, unchanged (see PrivateLeadForm); source 'private_page'.
 * Facts: PRICING + Ali's package spec only — see privateContent.js.
 *
 * Both stylesheets are inlined (?inline → <style>) because the route is
 * prerendered and a lazy chunk's CSS only arrives with its JS. The root carries
 * `join-page` so /join's form, steps and converted-door rules apply as they are.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { UserRound, Compass, LayoutGrid, Check, Minus } from "lucide-react";
import Seo from "../../components/Seo";
import BrandMark from "../../components/BrandMark";
import "../../styles/v1-tokens.css";
import "../../styles/v5-tokens.css";
import joinCss from "../join/join.css?inline";
import privateCss from "./private.css?inline";
import V1Header from "../v1/V1Header";
import { DawnArc, Chapter } from "../v5/V5Chapters";
import V1TrialBand from "../v1/V1TrialBand";
import { V1WhoFor } from "../v1/V1Worth";
import { V1FAQ, V1FinalCTA, V1Footer } from "../v1/V1Closing";
import { SpotlightController } from "../v1/V1Interactive";
import { Reveal, staggerParent, staggerItem } from "../v1/motion";
import { CtaContext } from "../v1/ctaContext";
import PrivateLeadForm from "./PrivateLeadForm";
import {
  PACKAGES, DEFAULT_PKG, CTA, HERO, ORBIT, TEAM, CURRICULUM, WEEK, COMPARE,
  FIT, FAQ_PRIVATE, FINAL, STICKY,
} from "./privateContent";

const PKG_IDS = new Set(PACKAGES.map((p) => p.id));
const COOKIE_DIALOG = '[aria-labelledby="fluentia-cookie-title"]';
const TEAM_ICONS = { teacher: UserRound, mentor: Compass, platform: LayoutGrid };

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

/* ─── Hero signature: «فريقك» — four nodes around «أنت», hairlines drawn in once ─── */
function TeamOrbit() {
  const R = 38; // % of the box, centre to node
  return (
    <figure className="p-orbit" aria-label="فريقك: معلمك الخاص، مرشدك الأكاديمي، منهجك المصمم، والمنصّة — حولك أنت">
      <svg className="p-orbit-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="p-orbit-ring" cx="50" cy="50" r={R} pathLength="1" />
        {ORBIT.map((n, i) => {
          const a = (n.angle * Math.PI) / 180;
          const x = 50 + R * Math.sin(a);
          const y = 50 - R * Math.cos(a);
          return (
            <line
              key={n.id}
              className={`p-orbit-line is-${n.tone}`}
              x1="50" y1="50" x2={x.toFixed(2)} y2={y.toFixed(2)}
              pathLength="1"
              style={{ animationDelay: `${120 + i * 90}ms` }}
            />
          );
        })}
      </svg>
      <div className="p-orbit-core"><span>أنت</span></div>
      {ORBIT.map((n, i) => {
        const a = (n.angle * Math.PI) / 180;
        return (
          <div
            key={n.id}
            className={`p-orbit-node is-${n.tone}`}
            style={{
              left: `${(50 + R * Math.sin(a)).toFixed(2)}%`,
              top: `${(50 - R * Math.cos(a)).toFixed(2)}%`,
              animationDelay: `${520 + i * 110}ms`,
            }}
          >
            {n.label}
          </div>
        );
      })}
    </figure>
  );
}

function Cell({ v }) {
  if (v === true) return <span className="p-cmp-yes"><Check size={18} aria-hidden="true" /><span className="p-sr">مشمول</span></span>;
  if (v === false) return <span className="p-cmp-no"><Minus size={18} aria-hidden="true" /><span className="p-sr">غير مشمول</span></span>;
  return <span className="v1-num">{v}</span>;
}

export default function PrivatePage() {
  const [pkgId, setPkgId] = useState(DEFAULT_PKG);
  const [submitted, setSubmitted] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const nameRef = useRef(null);
  const formRef = useRef(null);
  const cookieOpen = useCookieBannerOpen();
  const cta = useMemo(() => ({ label: CTA }), []);
  const [intensive, vip] = PACKAGES;

  useEffect(() => {
    // Parity with /join: TikTok PageView for a paid landing.
    if (window.ttq) { try { window.ttq.page(); } catch (e) { /* pixel is best-effort */ } }
    // Arriving from a pricing card's «اكتشف التجربة كاملة» (?pkg=…) preselects that package.
    const pre = new URLSearchParams(window.location.search).get("pkg");
    if (pre && PKG_IDS.has(pre)) setPkgId(pre);
  }, []);

  // Sticky bar: only past the hero (its own buttons are the CTA there), never while any of the form is on screen.
  useEffect(() => {
    const el = formRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setFormInView(entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const on = () => setPastHero(window.scrollY > window.innerHeight * 0.8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
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

  // Every `[data-open-form]` — header, hero, trial band, comparison, final CTA,
  // sticky bar — lands on the form, preselecting `data-tier` when it carries one.
  useEffect(() => {
    const onClick = (e) => {
      const trigger = e.target.closest?.("[data-open-form]");
      if (!trigger) return;
      e.preventDefault();
      const tier = trigger.getAttribute("data-tier");
      if (tier && PKG_IDS.has(tier)) setPkgId(tier);
      goToForm();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [goToForm]);

  const stickyOn = pastHero && !formInView && !submitted && !cookieOpen;

  return (
    <MotionConfig reducedMotion="user">
      <CtaContext.Provider value={cta}>
        <div className="v1-scope v5-scope join-page private-page" dir="rtl" lang="ar">
          <Seo path="/private" />
          <style>{joinCss}</style>
          <style>{privateCss}</style>
          <DawnArc />
          <div style={{ position: "relative", zIndex: 1 }}>
            <V1Header />
            <main>
              {/* ── Hero ── */}
              <section id="top" className="p-hero">
                <div className="v1-container p-hero-grid">
                  <div className="p-hero-copy">
                    <Reveal>
                      <span className="p-badge">{HERO.badge}</span>
                      <h1 className="p-h1">{HERO.h1}</h1>
                      <p className="p-sub">{HERO.sub}</p>
                      <div className="p-hero-ctas">
                        <button type="button" data-open-form className="v1-cta v1-cta-primary">
                          {CTA} <span aria-hidden>←</span>
                        </button>
                        <a href="#compare" className="v1-cta v1-cta-ghost p-ghost-gold">{HERO.secondary}</a>
                      </div>
                    </Reveal>
                  </div>
                  <TeamOrbit />
                </div>
              </section>

              {/* ── 01 Team ── */}
              <Chapter num={1} label={TEAM.label} />
              <section className="v1-section p-sec" aria-labelledby="p-team-h">
                <div className="v1-container">
                  <Reveal>
                    <h2 id="p-team-h" className="v1-headline">{TEAM.h2}</h2>
                    <p className="v1-intro">{TEAM.intro}</p>
                  </Reveal>
                  <motion.ul
                    className="p-team"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-8% 0px" }}
                  >
                    {TEAM.items.map((t) => {
                      const Icon = TEAM_ICONS[t.icon];
                      return (
                        <motion.li key={t.title} variants={staggerItem} className="v1-card p-team-card">
                          <div className="p-team-top">
                            <span className={`p-team-icon is-${t.icon}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                            {t.tag ? <span className="p-tag">{t.tag}</span> : null}
                          </div>
                          <h3 className="p-team-t">{t.title}</h3>
                          <p className="p-team-b">{t.body}</p>
                          {t.note ? <p className="p-team-note">{t.note}</p> : null}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </div>
              </section>

              {/* ── 02 Curriculum ── */}
              <Chapter num={2} label={CURRICULUM.label} />
              <section className="v1-section p-sec" aria-labelledby="p-cur-h">
                <div className="v1-container">
                  <Reveal>
                    <h2 id="p-cur-h" className="v1-headline">{CURRICULUM.h2}</h2>
                    <p className="v1-intro">{CURRICULUM.intro}</p>
                  </Reveal>
                  <motion.ol
                    className="j-steps p-steps"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-8% 0px" }}
                  >
                    {CURRICULUM.steps.map((s, i) => (
                      <motion.li key={s.title} variants={staggerItem} className="v1-card j-step">
                        <span className="j-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="j-step-t">{s.title}</h3>
                        <p className="j-step-b">{s.body}</p>
                      </motion.li>
                    ))}
                  </motion.ol>
                </div>
              </section>
              <V1TrialBand />

              {/* ── 03 Week ── */}
              <Chapter num={3} label={WEEK.label} />
              <section className="v1-section p-sec" aria-labelledby="p-week-h">
                <div className="v1-container">
                  <Reveal>
                    <h2 id="p-week-h" className="v1-headline">{WEEK.h2}</h2>
                    <p className="v1-intro">{WEEK.intro}</p>
                  </Reveal>
                  <Reveal delay={0.05}>
                    <ol className="p-week" aria-label="أسبوع توضيحي في الفردي المكثّف">
                      {WEEK.days.map((d) => {
                        const c = WEEK.chips[d.kind];
                        return (
                          <li key={d.day} className={`p-day is-${d.kind}`}>
                            <span className="p-day-name">{d.day}</span>
                            <span className="p-day-chip">
                              <b>{c.title}</b>
                              <span>{c.who}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    <p className="p-week-line">{WEEK.line}</p>
                    <p className="p-week-note">{WEEK.note}</p>
                  </Reveal>
                  <motion.dl
                    className="p-stats"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-8% 0px" }}
                  >
                    {WEEK.stats.map((s) => (
                      <motion.div key={s.label} variants={staggerItem} className="p-stat">
                        <dt className="p-stat-v v1-num">{s.value}</dt>
                        <dd className="p-stat-l">{s.label}</dd>
                      </motion.div>
                    ))}
                  </motion.dl>
                </div>
              </section>

              {/* ── 04 Compare ── */}
              <Chapter num={4} label={COMPARE.label} />
              <section className="v1-section p-sec" id="compare" aria-labelledby="p-cmp-h">
                <div className="v1-container">
                  <Reveal>
                    <h2 id="p-cmp-h" className="v1-headline">{COMPARE.h2}</h2>
                    <p className="v1-intro">{COMPARE.intro}</p>
                  </Reveal>
                  <Reveal delay={0.05}>
                    <table className="p-cmp">
                      <caption className="p-sr">مقارنة بين {intensive.name} و{vip.name}</caption>
                      <thead>
                        <tr>
                          <td className="p-cmp-corner" />
                          <th scope="col" className="is-int">
                            <span className="p-cmp-badge">VIP · مكثّف</span>
                            {intensive.name}
                          </th>
                          <th scope="col" className="is-vip">
                            <span className="p-cmp-badge">VIP · مرن</span>
                            {vip.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARE.rows.map((r) => (
                          <tr key={r.label} className={r.strong ? "is-strong" : undefined}>
                            <th scope="row">{r.label}</th>
                            <td className="is-int"><Cell v={r.int} /></td>
                            <td className="is-vip"><Cell v={r.vip} /></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="p-cmp-corner" />
                          <td className="is-int">
                            <button type="button" data-open-form data-tier={intensive.id} className="v1-cta v1-cta-gold p-cmp-cta">
                              احجز استشارة {intensive.short}
                            </button>
                          </td>
                          <td className="is-vip">
                            <button type="button" data-open-form data-tier={vip.id} className="v1-cta v1-cta-ghost p-ghost-gold p-cmp-cta">
                              احجز استشارة {vip.short}
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="p-cmp-note">{vip.name}: {COMPARE.vipNote}</p>
                  </Reveal>
                </div>
              </section>

              <V1WhoFor
                data={FIT}
                after={
                  <Reveal>
                    <p className="p-fit-alt">
                      تدور على مجموعة صغيرة بسعر أقل؟{" "}
                      <a href={FIT.groupLink.href} className="p-textlink">{FIT.groupLink.label} ←</a>
                    </p>
                  </Reveal>
                }
              />

              {/* ── Booking form ── */}
              <section className="v1-section p-sec p-form-sec" aria-label={CTA}>
                <div className="v1-container">
                  <div className="v1-card j-card p-form-card" id="private-form" ref={formRef}>
                    <PrivateLeadForm pkgId={pkgId} setPkgId={setPkgId} nameRef={nameRef} onDone={() => setSubmitted(true)} />
                  </div>
                </div>
              </section>

              <V1FAQ data={FAQ_PRIVATE} />
              <V1FinalCTA data={FINAL} />
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
