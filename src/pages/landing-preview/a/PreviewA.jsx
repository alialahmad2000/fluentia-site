import { useEffect, useRef } from "react";
import StoriesProvider from "../../../components/stories/StoriesProvider";
import StoriesFeature from "../../../components/stories/StoriesFeature";
import { STORIES } from "../../../data/stories";
import { C, Cta, Device, Faq, Final, Fit, Footer, Header, Logos, PreviewHead, Pricing, SceneCard, jump, titleText, usePageMotion } from "../shared";
import "../../../components/stories/stories.css";
import "../base.css";
import "./a.css";

/**
 * Direction A — «فجر» (luminous dark).
 *
 * The one memorable thing: dawn. Aurora curtains move slowly over a deep navy
 * sky, and the Fluentia planet rises over a lit horizon under the call to
 * action. The sky changes colour as you scroll (night → blue hour → dawn), so
 * the page reads as one journey toward the final call, where the planet is
 * fully risen. Electric blue is the action colour and nothing else; amber is
 * the single warm accent, spent on numbers and the recommended plan.
 */

const PLANET = "/brand/hero/planet";

function Planet({ className = "", sizes, eager = false }) {
  return (
    <picture className={`pa-planet ${className}`}>
      <source type="image/avif" srcSet={`${PLANET}-360.avif 360w, ${PLANET}-520.avif 520w, ${PLANET}-720.avif 720w`} sizes={sizes} />
      <img
        src={`${PLANET}-520.webp`}
        srcSet={`${PLANET}-360.webp 360w, ${PLANET}-520.webp 520w, ${PLANET}-720.webp 720w`}
        sizes={sizes}
        width="520"
        height="520"
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

/** The sky: three tinted layers cross-fade by section; four aurora curtains drift. */
function Sky() {
  return (
    <div className="pa-sky" aria-hidden="true">
      <div className="pa-tint pa-tint--night" />
      <div className="pa-tint pa-tint--blue" />
      <div className="pa-tint pa-tint--dawn" />
      <div className="pa-aurora">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="pa-grain" />
    </div>
  );
}

/** Which sky a section asks for: the section whose middle crosses mid-screen wins. */
function useSky(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return undefined;
    const secs = [...root.querySelectorAll("[data-sky]")];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) root.setAttribute("data-sky-now", e.target.getAttribute("data-sky"));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [rootRef]);
}

function Hero() {
  return (
    <section id="pv-top" className="pa-hero" data-sky="dawn">
      <div className="pv-wrap pa-hero-in">
        <h1 className="pa-hero-title">
          {C.HERO_LINES.map((l, i) => (
            <span key={l.text} className={`pa-line pa-line--${i}`}>
              {l.text}
            </span>
          ))}
        </h1>
        <p className="pa-hero-sub">{C.HERO.lead}</p>
        <div className="pa-hero-actions">
          <Cta className="pv-cta--lg" />
          <a href="#pv-platform" className="pv-link pa-see" onClick={(e) => jump(e, "pv-platform")}>
            {C.SEE_INSIDE}
          </a>
        </div>
        <p className="pa-hero-trust">{C.HERO_TRUST}</p>
        <div className="pa-hero-logos">
          <p className="pa-logos-lead">
            {C.TRUSTED_LOGOS.lead} {C.TRUSTED_LOGOS.emphasis}
          </p>
          <Logos />
        </div>
      </div>
      <div className="pa-horizon" aria-hidden="true">
        <div className="pa-horizon-glow" />
        <Planet className="pa-planet--rise" sizes="(min-width: 1024px) 300px, 190px" eager />
        <div className="pa-horizon-line" />
      </div>
    </section>
  );
}

function Platform() {
  const p = C.PLATFORM;
  return (
    <section id="pv-platform" className="pv-sec pa-platform" data-sky="night" aria-labelledby="pa-platform-h">
      <div className="pv-wrap pa-platform-grid">
        <div className="pa-glass pa-platform-copy pv-rv">
          <h2 id="pa-platform-h" className="pv-h2">{p.title}</h2>
          <p className="pv-lede">{p.tagline}</p>
          <ul className="pa-points">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <Cta />
        </div>
        <div className="pa-platform-device pv-rv">
          <div className="pa-device-halo" aria-hidden="true" />
          <Device src="/preview/shots/plan.webp" alt="خطة اليوم في منصة طلاقة" sizes="(min-width: 1024px) 300px, 62vw" />
        </div>
      </div>
    </section>
  );
}

function Pains() {
  return (
    <section className="pv-sec pa-pains" data-sky="night" aria-labelledby="pa-pains-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          <h2 id="pa-pains-h" className="pv-h2 pa-giant">{titleText(C.TITLES.pains)}</h2>
          <p className="pv-lede">{C.PROBLEM.intro}</p>
        </div>
        <ul className="pa-pain-grid">
          {C.PROBLEM.cards.map((c) => (
            <li key={c.title} className="pa-glass pa-pain pv-rv">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
        <p className="pa-bridge pv-rv">{C.PROBLEM.bridge.replace("←", "↓")}</p>
      </div>
    </section>
  );
}

function How() {
  return (
    <section className="pv-sec pa-how" data-sky="blue" aria-labelledby="pa-how-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          <h2 id="pa-how-h" className="pv-h2 pa-giant">{titleText(C.TITLES.how)}</h2>
          <p className="pv-lede">{C.WORTH.deck}</p>
        </div>
        <ol className="pa-path">
          {C.WORTH.pillars.map((p) => (
            <li key={p.num} className="pa-step pv-rv">
              <span className="pa-step-dot" aria-hidden="true" />
              <p className="pa-step-essence">{p.essence}</p>
              <h3>{p.title}</h3>
              <p className="pa-step-body">{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="pa-how-close pv-rv">
          <p className="pa-bridge">{C.WORTH.closing.lead}</p>
          <p className="pa-note">{C.LIVE_NOTE}</p>
        </div>
      </div>
    </section>
  );
}

function parseStat(v) {
  const m = String(v).match(/^(\+?)(\d+)(K?)$/);
  return m ? { pre: m[1], to: Number(m[2]) * (m[3] ? 1000 : 1) } : null;
}

function Stats() {
  return (
    <section className="pv-sec pa-stats" data-sky="blue" aria-labelledby="pa-stats-h">
      <div className="pv-wrap">
        <h2 id="pa-stats-h" className="pv-h2 pa-stats-title pv-rv">{titleText(C.TITLES.stats)}</h2>
        <ul className="pa-stat-row">
          {C.SOCIAL_PROOF.stats.map((s) => {
            const p = parseStat(s.value);
            return (
              <li key={s.label} className="pa-stat pv-rv">
                <span className="pa-stat-n" dir="ltr">
                  {p?.pre}
                  <span data-count={p ? p.to : undefined}>{p ? p.to.toLocaleString("en-US") : s.value}</span>
                </span>
                <span className="pa-stat-l">{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const STAGE_SHOTS = { library: "novel", podcast: "podcast", speak: "layla" };

function Between() {
  return (
    <section className="pv-sec pa-between" data-sky="night" aria-labelledby="pa-between-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          <h2 id="pa-between-h" className="pv-h2 pa-giant">{titleText(C.TITLES.between)}</h2>
        </div>
        <div className="pa-feats">
          {C.STAGE.map((it) => (
            <article key={it.key} className="pa-glass pa-feat pv-rv" style={{ "--rgb": it.rgb }}>
              <div className="pa-feat-copy">
                <h3>{it.title}</h3>
                {it.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              {STAGE_SHOTS[it.key] ? (
                <Device
                  src={`/preview/shots/${STAGE_SHOTS[it.key]}.webp`}
                  alt={`${it.title} في منصة طلاقة`}
                  className="pa-feat-device"
                  sizes="(min-width: 900px) 220px, 46vw"
                />
              ) : (
                <SceneCard className="pa-scene" />
              )}
            </article>
          ))}
        </div>
        <ul className="pa-rail" aria-label="وأكثر في المنصة">
          {C.RAIL.map((r) => (
            <li key={r.key} className="pv-rv">
              <Device src={`/preview/shots/${r.key}.webp`} alt={r.name} sizes="180px" />
              <h3>{r.name}</h3>
              <p>{r.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stories() {
  return (
    <section id="pv-stories" className="pv-sec pa-stories st-scope" data-sky="dawn" aria-labelledby="pa-stories-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pv-rv">
          <h2 id="pa-stories-h" className="pv-h2">{titleText(C.TITLES.stories)}</h2>
          <p className="pv-lede">{C.STORIES_SUB}</p>
        </div>
        <StoriesFeature stories={STORIES} />
      </div>
    </section>
  );
}

export default function PreviewA() {
  const ref = useRef(null);
  usePageMotion(ref);
  useSky(ref);
  return (
    <StoriesProvider stories={STORIES}>
      <div ref={ref} className="pv pa" dir="rtl" data-sky-now="dawn">
        <PreviewHead title="معاينة أ · فجر — أكاديمية طلاقة" />
        <Sky />
        <Header />
        <main>
          <Hero />
          <Platform />
          <Pains />
          <How />
          <Stats />
          <Between />
          <div data-sky="dawn">
            <Pricing />
          </div>
          <Stories />
          <div data-sky="night">
            <Fit />
            <Faq />
          </div>
          <div data-sky="dawn">
            <Final>
              <div className="pa-final-sun" aria-hidden="true">
                <div className="pa-horizon-glow" />
                <Planet sizes="220px" />
              </div>
            </Final>
          </div>
        </main>
        <Footer />
      </div>
    </StoriesProvider>
  );
}
