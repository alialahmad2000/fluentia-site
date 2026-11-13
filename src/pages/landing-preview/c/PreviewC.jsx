import { useEffect, useRef } from "react";
import StoriesProvider from "../../../components/stories/StoriesProvider";
import StoriesFeature from "../../../components/stories/StoriesFeature";
import { STORIES } from "../../../data/stories";
import { C, Cta, Device, Faq, Final, Fit, Footer, Header, Logos, PreviewHead, Pricing, SceneCard, jump, titleText, usePageMotion } from "../shared";
import "../../../components/stories/stories.css";
import "../base.css";
import "./c.css";

/**
 * Direction C — «المنصة أولاً» (product-first, bold dark).
 *
 * The one memorable thing: the product itself, floating. The hero is three real
 * platform screens (today's plan in front, Layla's conversation and the novel
 * reader behind) stacked in depth, each lit by its own colour, drifting at
 * different speeds as you scroll. Every feature on the page owns one glow —
 * blue, amber, violet, teal — and keeps it wherever it appears. The CTA is a
 * plain white pill: the only white-filled thing on the page.
 *
 * The two chips on the hero screens are the platform's real formats: Layla
 * ends with an overall score out of 10 and a band (ConversationMode.jsx), and
 * the reader glosses a word from the very paragraph on screen.
 */

const GLOW = {
  blue: "76,141,255",
  amber: "255,176,32",
  violet: "155,123,255",
  teal: "45,212,191",
};
const STAGE_GLOW = { library: "teal", podcast: "blue", scenes: "amber", speak: "violet" };
const STAGE_SHOT = { library: "novel", podcast: "podcast", speak: "layla" };
const RAIL_GLOW = { plan: "blue", vocab: "teal", shadow: "violet", recordings: "amber", curriculum: "blue" };

/** Scroll parallax for the hero screens: one CSS variable, written once per frame. */
function useDepth(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 900);
      el.style.setProperty("--depth", String(y));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    // Start after first paint so the hero renders static first.
    const t = setTimeout(() => {
      paint();
      window.addEventListener("scroll", on, { passive: true });
    }, 120);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

function Hero() {
  const stage = useRef(null);
  useDepth(stage);
  return (
    <section id="pv-top" className="pc-hero">
      <div className="pv-wrap pc-hero-grid">
        <div className="pc-hero-copy">
          <h1 className="pc-hero-title">
            {C.HERO_LINES.map((l, i) => (
              <span key={l.text} className={`pc-line pc-line--${i}`}>
                {l.text}
              </span>
            ))}
          </h1>
          <p className="pc-hero-sub">{C.HERO.lead}</p>
          <div className="pc-hero-actions">
            <Cta className="pv-cta--lg" />
            <a href="#pv-platform" className="pv-link pc-see" onClick={(e) => jump(e, "pv-platform")}>
              {C.SEE_INSIDE}
            </a>
          </div>
          <p className="pc-hero-trust">{C.HERO_TRUST}</p>
          <div className="pc-hero-logos">
            <p className="pc-logos-lead">
              {C.TRUSTED_LOGOS.lead} {C.TRUSTED_LOGOS.emphasis}
            </p>
            <Logos />
          </div>
        </div>

        <div className="pc-stage" ref={stage}>
          <div className="pc-layer pc-layer--back pc-layer--a" style={{ "--rgb": GLOW.violet }}>
            <Device src="/preview/shots/layla.webp" alt="المحادثة مع ليلى في منصة طلاقة" sizes="(min-width: 1024px) 230px, 40vw" />
            <p className="pc-chip pc-chip--score">
              <span className="pc-chip-cap">تقييم ليلى</span>
              <span className="pc-chip-n" dir="ltr">
                8.4<small>/10</small>
              </span>
              <span className="pc-chip-band">ممتازة</span>
            </p>
          </div>
          <div className="pc-layer pc-layer--back pc-layer--b" style={{ "--rgb": GLOW.amber }}>
            <Device src="/preview/shots/novel.webp" alt="قارئ الروايات بترجمة كل جملة في منصة طلاقة" sizes="(min-width: 1024px) 230px, 40vw" />
            <p className="pc-chip pc-chip--gloss">
              <span className="pc-chip-word" dir="ltr" lang="en">
                reservoir
              </span>
              <span className="pc-chip-mean">خزّان مياه</span>
            </p>
          </div>
          <div className="pc-layer pc-layer--front" style={{ "--rgb": GLOW.blue }}>
            <Device src="/preview/shots/plan.webp" alt="خطة اليوم في منصة طلاقة" sizes="(min-width: 1024px) 290px, 52vw" eager />
          </div>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  const p = C.PLATFORM;
  return (
    <section id="pv-platform" className="pv-sec pc-platform" aria-labelledby="pc-platform-h" style={{ "--rgb": GLOW.teal }}>
      <div className="pv-wrap pc-platform-grid">
        <div className="pc-platform-shot pv-rv">
          <div className="pc-glow" aria-hidden="true" />
          <Device src="/preview/shots/curriculum.webp" alt="صفحة المنهج والتقدّم في منصة طلاقة" sizes="(min-width: 1024px) 300px, 62vw" />
        </div>
        <div className="pc-platform-copy pv-rv">
          <h2 id="pc-platform-h" className="pv-h2">{p.title}</h2>
          <p className="pv-lede">{p.tagline}</p>
          <ul className="pc-points">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <Cta />
        </div>
      </div>
    </section>
  );
}

function Pains() {
  return (
    <section className="pv-sec pc-pains" aria-labelledby="pc-pains-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pc-center pv-rv">
          <h2 id="pc-pains-h" className="pv-h2 pc-giant">{titleText(C.TITLES.pains)}</h2>
          <p className="pv-lede">{C.PROBLEM.intro}</p>
        </div>
        <ul className="pc-pain-grid">
          {C.PROBLEM.cards.map((c) => (
            <li key={c.title} className="pc-tile pc-pain pv-rv">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
        <p className="pc-bridge pv-rv">{C.PROBLEM.bridge.replace("←", "↓")}</p>
      </div>
    </section>
  );
}

const HOW_GLOW = ["blue", "amber", "violet", "teal"];

function How() {
  return (
    <section className="pv-sec pc-how" aria-labelledby="pc-how-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pc-center pv-rv">
          <h2 id="pc-how-h" className="pv-h2 pc-giant">{titleText(C.TITLES.how)}</h2>
          <p className="pv-lede">{C.WORTH.deck}</p>
        </div>
        <ul className="pc-how-grid">
          {C.WORTH.pillars.map((p, i) => (
            <li key={p.num} className="pc-tile pc-pillar pv-rv" style={{ "--rgb": GLOW[HOW_GLOW[i % 4]] }}>
              <p className="pc-pillar-essence">{p.essence}</p>
              <h3>{p.title}</h3>
              <p className="pc-pillar-body">{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="pc-how-close pc-center pv-rv">
          <p className="pc-bridge">{C.WORTH.closing.lead}</p>
          <p className="pc-note">{C.LIVE_NOTE}</p>
        </div>
      </div>
    </section>
  );
}

function parseStat(v) {
  const m = String(v).match(/^(\+?)(\d+)(K?)$/);
  return m ? { pre: m[1], to: Number(m[2]), k: m[3] } : null;
}

function Stats() {
  return (
    <section className="pv-sec pc-stats" aria-labelledby="pc-stats-h">
      <div className="pv-wrap">
        <h2 id="pc-stats-h" className="pv-h2 pc-center pc-stats-title pv-rv">{titleText(C.TITLES.stats)}</h2>
        <ul className="pc-stat-row">
          {C.SOCIAL_PROOF.stats.map((s, i) => {
            const p = parseStat(s.value);
            return (
              <li key={s.label} className="pc-stat pv-rv" style={{ "--rgb": GLOW[HOW_GLOW[i % 4]] }}>
                <span className="pc-stat-n" dir="ltr">
                  {p?.pre}
                  <span data-count={p ? p.to : undefined}>{p ? p.to : s.value}</span>
                  {p?.k}
                </span>
                <span className="pc-stat-l">{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Between() {
  return (
    <section className="pv-sec pc-between" aria-labelledby="pc-between-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pc-center pv-rv">
          <h2 id="pc-between-h" className="pv-h2 pc-giant">{titleText(C.TITLES.between)}</h2>
        </div>
        <div className="pc-bento">
          {C.STAGE.map((it) => (
            <article key={it.key} className={`pc-tile pc-cell pc-cell--${it.key} pv-rv`} style={{ "--rgb": GLOW[STAGE_GLOW[it.key]] }}>
              <div className="pc-cell-copy">
                <h3>{it.title}</h3>
                {it.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              {STAGE_SHOT[it.key] ? (
                <Device
                  src={`/preview/shots/${STAGE_SHOT[it.key]}.webp`}
                  alt={`${it.title} في منصة طلاقة`}
                  className="pc-cell-device"
                  sizes="(min-width: 900px) 240px, 52vw"
                />
              ) : (
                <SceneCard className="pc-scene" />
              )}
            </article>
          ))}
          <ul className="pc-minis" aria-label="وأكثر في المنصة">
          {C.RAIL.map((r) => (
            <li key={r.key} className="pc-tile pc-mini pv-rv" style={{ "--rgb": GLOW[RAIL_GLOW[r.key]] }}>
              <div className="pc-mini-shot" aria-hidden="true">
                <img
                  src={`/preview/shots/${r.key}-480.webp`}
                  alt=""
                  width="480"
                  height="1039"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3>{r.name}</h3>
              <p>{r.line}</p>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stories() {
  return (
    <section id="pv-stories" className="pv-sec pc-stories st-scope" aria-labelledby="pc-stories-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pc-center pv-rv">
          <h2 id="pc-stories-h" className="pv-h2">{titleText(C.TITLES.stories)}</h2>
          <p className="pv-lede">{C.STORIES_SUB}</p>
        </div>
        <StoriesFeature stories={STORIES} />
      </div>
    </section>
  );
}

export default function PreviewC() {
  const ref = useRef(null);
  usePageMotion(ref);
  return (
    <StoriesProvider stories={STORIES}>
      <div ref={ref} className="pv pc" dir="rtl">
        <PreviewHead title="معاينة ج · المنصة أولاً — أكاديمية طلاقة" />
        <Header />
        <main>
          <Hero />
          <Platform />
          <Pains />
          <How />
          <Stats />
          <Between />
          <Pricing />
          <Stories />
          <Fit />
          <Faq />
          <Final>
            <div className="pc-final-ring" aria-hidden="true" />
          </Final>
        </main>
        <Footer />
      </div>
    </StoriesProvider>
  );
}
