import { useRef } from "react";
import StoriesProvider from "../../../components/stories/StoriesProvider";
import StoriesFeature from "../../../components/stories/StoriesFeature";
import { STORIES } from "../../../data/stories";
import { C, Cta, Device, Faq, Final, Fit, Footer, Header, Logos, PreviewHead, Pricing, SceneCard, jump, titleText, usePageMotion } from "../shared";
import "../../../components/stories/stories.css";
import "../base.css";
import "./b.css";

/**
 * Direction B — «صباح» (light editorial).
 *
 * The one memorable thing: people. Warm sand paper, deep-navy ink, and
 * photographs of Saudi professionals learning and speaking at work, framed in
 * tall arches (the Najdi window) with the real platform screen resting on the
 * corner of each photo. Sky blue is the action colour and nothing else; palm
 * green is the one supporting accent (trust dot, ticks, the recommended plan's
 * badge). One navy band (the numbers) and the navy footer give the page weight.
 *
 * The photos are generated (public/preview/b/), following the Saudi dress rule:
 * thobe + shemagh + igal or a bare head for men; modest dress for women.
 */

const PHOTO = "/preview/b";
const W = [640, 960, 1344];

function Photo({ name, alt, sizes, className = "", eager = false, pos = "50% 50%" }) {
  const set = (ext) => W.map((w) => `${PHOTO}/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture className={`pb-photo ${className}`}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <img
        src={`${PHOTO}/${name}-960.webp`}
        srcSet={set("webp")}
        sizes={sizes}
        width="1344"
        height="896"
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchpriority={eager ? "high" : undefined}
        decoding="async"
        style={{ objectPosition: pos }}
      />
    </picture>
  );
}

function Hero() {
  return (
    <section id="pv-top" className="pb-hero">
      <div className="pv-wrap pb-hero-grid">
        <div className="pb-hero-copy">
          <h1 className="pb-hero-title">
            {C.HERO_LINES.map((l) => (
              <span key={l.text} className="pb-line">
                {l.text}
              </span>
            ))}
          </h1>
          <p className="pb-hero-sub">{C.HERO.lead}</p>
          <div className="pb-hero-actions">
            <Cta className="pv-cta--lg" />
            <a href="#pv-platform" className="pv-link pb-see" onClick={(e) => jump(e, "pv-platform")}>
              {C.SEE_INSIDE}
            </a>
          </div>
          <p className="pb-hero-trust">{C.HERO_TRUST}</p>
          <div className="pb-hero-logos">
            <p className="pb-logos-lead">
              {C.TRUSTED_LOGOS.lead} {C.TRUSTED_LOGOS.emphasis}
            </p>
            <Logos />
          </div>
        </div>
        <div className="pb-hero-visual">
          <div className="pb-arch pb-arch--hero">
            <Photo
              name="hero"
              alt="متدرّبة سعودية في مكتبها تتحدّث بالإنجليزية في اتصال عبر الحاسوب"
              sizes="(min-width: 1024px) 480px, 92vw"
              pos="68% 40%"
              eager
            />
          </div>
          <Device src="/preview/shots/plan.webp" alt="خطة اليوم في منصة طلاقة" className="pb-hero-device" sizes="(min-width: 1024px) 200px, 34vw" />
        </div>
      </div>
    </section>
  );
}

function Platform() {
  const p = C.PLATFORM;
  return (
    <section id="pv-platform" className="pv-sec pb-band pb-platform" aria-labelledby="pb-platform-h">
      <div className="pv-wrap pb-platform-grid">
        <div className="pb-platform-copy pv-rv">
          <h2 id="pb-platform-h" className="pv-h2">{p.title}</h2>
          <p className="pv-lede">{p.tagline}</p>
          <ul className="pb-points">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          <Cta />
        </div>
        <div className="pb-platform-visual pv-rv">
          <div className="pb-frame">
            <Photo name="evening" alt="شاب سعودي في بيته يراجع درسه على جواله" sizes="(min-width: 1024px) 620px, 92vw" pos="78% 40%" />
          </div>
          <Device src="/preview/shots/vocab.webp" alt="المفردات في منصة طلاقة" className="pb-platform-device" sizes="(min-width: 1024px) 200px, 34vw" />
        </div>
      </div>
    </section>
  );
}

function Pains() {
  return (
    <section className="pv-sec pb-pains" aria-labelledby="pb-pains-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pb-head pv-rv">
          <h2 id="pb-pains-h" className="pv-h2 pb-giant">{titleText(C.TITLES.pains)}</h2>
          <p className="pv-lede">{C.PROBLEM.intro}</p>
        </div>
        <ul className="pb-pain-list">
          {C.PROBLEM.cards.map((c) => (
            <li key={c.title} className="pb-pain pv-rv">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
        <p className="pb-bridge pv-rv">{C.PROBLEM.bridge.replace("←", "↓")}</p>
      </div>
    </section>
  );
}

function How() {
  return (
    <section className="pv-sec pb-how" aria-labelledby="pb-how-h">
      <div className="pv-wrap pb-how-grid">
        <div className="pb-how-aside">
          <div className="pv-sec-head pv-rv">
            <h2 id="pb-how-h" className="pv-h2 pb-giant">{titleText(C.TITLES.how)}</h2>
            <p className="pv-lede">{C.WORTH.deck}</p>
          </div>
          <div className="pb-arch pb-arch--how pv-rv">
            <Photo
              name="meeting"
              alt="موظف سعودي يقدّم عرضاً بالإنجليزية أمام زملائه"
              sizes="(min-width: 1024px) 420px, 92vw"
              pos="62% 35%"
            />
          </div>
        </div>
        <div className="pb-how-main">
          <ul className="pb-pillars">
            {C.WORTH.pillars.map((p) => (
              <li key={p.num} className="pb-pillar pv-rv">
                <p className="pb-pillar-essence">{p.essence}</p>
                <h3>{p.title}</h3>
                <p className="pb-pillar-body">{p.body}</p>
              </li>
            ))}
          </ul>
          <div className="pb-how-close pv-rv">
            <p className="pb-bridge">{C.WORTH.closing.lead}</p>
            <p className="pb-note">{C.LIVE_NOTE}</p>
          </div>
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
    <section className="pv-sec pb-stats" aria-labelledby="pb-stats-h">
      <div className="pv-wrap">
        <h2 id="pb-stats-h" className="pv-h2 pb-stats-title pv-rv">{titleText(C.TITLES.stats)}</h2>
        <ul className="pb-stat-row">
          {C.SOCIAL_PROOF.stats.map((s) => {
            const p = parseStat(s.value);
            return (
              <li key={s.label} className="pb-stat pv-rv">
                <span className="pb-stat-n" dir="ltr">
                  {p?.pre}
                  <span data-count={p ? p.to : undefined}>{p ? p.to : s.value}</span>
                  {p?.k}
                </span>
                <span className="pb-stat-l">{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const STAGE_SHOT = { library: "novel", podcast: "podcast", speak: "layla" };

function Between() {
  return (
    <section className="pv-sec pb-between" aria-labelledby="pb-between-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pb-head pv-rv">
          <h2 id="pb-between-h" className="pv-h2 pb-giant">{titleText(C.TITLES.between)}</h2>
        </div>
        <div className="pb-feats">
          {C.STAGE.map((it) => (
            <article key={it.key} className={`pb-feat pb-feat--${it.key} pv-rv`}>
              <div className="pb-feat-copy">
                <h3>{it.title}</h3>
                {it.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              {STAGE_SHOT[it.key] ? (
                <Device
                  src={`/preview/shots/${STAGE_SHOT[it.key]}.webp`}
                  alt={`${it.title} في منصة طلاقة`}
                  className="pb-feat-device"
                  sizes="(min-width: 900px) 220px, 50vw"
                />
              ) : (
                <SceneCard className="pb-scene" />
              )}
            </article>
          ))}
        </div>
        <ul className="pb-rail" aria-label="وأكثر في المنصة">
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
    <section id="pv-stories" className="pv-sec pb-band pb-stories st-scope" aria-labelledby="pb-stories-h">
      <div className="pv-wrap">
        <div className="pv-sec-head pb-head pv-rv">
          <h2 id="pb-stories-h" className="pv-h2">{titleText(C.TITLES.stories)}</h2>
          <p className="pv-lede">{C.STORIES_SUB}</p>
        </div>
        <StoriesFeature stories={STORIES} />
      </div>
    </section>
  );
}

export default function PreviewB() {
  const ref = useRef(null);
  usePageMotion(ref);
  return (
    <StoriesProvider stories={STORIES}>
      <div ref={ref} className="pv pb" dir="rtl">
        <PreviewHead title="معاينة ب · صباح — أكاديمية طلاقة" />
        <Header mark="appicon" />
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
            <div className="pv-wrap pb-final-photo pv-rv">
              <div className="pb-arch pb-arch--wide">
                <Photo name="colleagues" alt="زميلتان سعوديتان تتحدّثان وتضحكان أمام الحاسوب في المكتب" sizes="(min-width: 1024px) 1100px, 92vw" pos="50% 40%" />
              </div>
            </div>
          </Final>
        </main>
        <Footer mark="appicon" />
      </div>
    </StoriesProvider>
  );
}
