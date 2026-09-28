import { useEffect, useState } from "react";
import {
  HERO,
  PROBLEM,
  METHOD,
  SOLUTION,
  PRODUCT,
  TRUSTED_LOGOS,
  WORTH,
  PRICING,
  SOCIAL_PROOF,
  FINAL_CTA,
} from "../landing-v2/content";
import V5HeroShowcase, { glueAr } from "../v5/V5HeroShowcase";
import HomePicture from "../v5/HomePicture";
import { SpeakingMock } from "../v1/V1Product";
import { V1WhoFor } from "../v1/V1Worth";
import V1Pricing from "../v1/V1Pricing";
import { V1FAQ, V1Footer } from "../v1/V1Closing";
import { Title, CampTag, Count, PerfControl } from "./parts";
import { TITLES, LINES, PRICING_TITLE, FINAL_TITLE } from "./copy";

/**
 * The seven chapters of the climb. Each one is a tall title track (the title
 * holds while the camera climbs, then lifts away) followed by its content.
 * Every word of content below is the homepage's own — imported, never retyped.
 */

function Chapter({ i, id, tone, trackVh, track, children, labelledBy }) {
  return (
    <section className={`as-ch as-ch--${id}`} data-camp={i} data-tone={tone} id={`camp-${id}`} aria-labelledby={labelledBy}>
      <div className="as-track" data-track="" style={{ "--track": `${trackVh}vh` }}>
        <div className="as-track-inner">
          <div className="as-track-copy as-scrim">{track}</div>
        </div>
      </div>
      {children ? <div className="as-body">{children}</div> : null}
    </section>
  );
}

function Cta({ label = HERO.primaryCTA, tier }) {
  return (
    <button type="button" data-open-form data-tier={tier} className="as-btn">
      {label}
      <span aria-hidden="true">←</span>
    </button>
  );
}

const pad = (n) => String(n).padStart(2, "0");

/* ─── 0 · base camp ───────────────────────────────────────────────────────── */

export function BaseCamp() {
  return (
    <Chapter
      i={0}
      id="base"
      tone="light"
      trackVh={165}
      labelledBy="as-t-base"
      track={
        <>
          <CampTag i={0} />
          <Title as="h1" id="as-t-base" lines={TITLES.base} className="as-hero" />
          <p className="as-sub">{glueAr(HERO.sub)}</p>
          <div className="as-actions">
            <Cta />
          </div>
          <p className="as-line">{LINES.base}</p>
        </>
      }
    >
      <div className="as-pains">
        {PROBLEM.cards.map((c, k) => (
          <article key={c.title} className="as-pain as-scrim as-rv">
            <span className="as-pain-n as-num" dir="ltr">
              {pad(k + 1)}
            </span>
            <h3 className="as-pain-t">{c.title}</h3>
            <p className="as-pain-b">{c.body}</p>
          </article>
        ))}
      </div>
    </Chapter>
  );
}

/* ─── 1 · icefall ─────────────────────────────────────────────────────────── */

function Crack() {
  return (
    <svg className="as-crack" viewBox="0 0 600 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 7 L48 5 L71 9 L118 6 L140 10 L196 4 L230 8 L282 6 L301 11 L356 5 L390 8 L437 6 L468 10 L521 5 L560 8 L600 6" />
    </svg>
  );
}

export function Icefall() {
  const [open, setOpen] = useState(0);
  return (
    <Chapter
      i={1}
      id="icefall"
      tone="light"
      trackVh={150}
      labelledBy="as-t-icefall"
      track={
        <>
          <CampTag i={1} />
          <Title id="as-t-icefall" lines={TITLES.icefall} />
          <p className="as-line">{LINES.icefall}</p>
        </>
      }
    >
      <div className="as-rows as-scrim">
        <p className="as-kicker">{METHOD.headline}</p>
        {METHOD.pillars.map((m, k) => {
          const on = open === k;
          return (
            <div key={m.title} className="as-row as-rv" data-open={on ? "" : undefined}>
              <Crack />
              <h3 className="as-row-h">
                <button type="button" aria-expanded={on} aria-controls={`as-row-${k}`} onClick={() => setOpen(on ? -1 : k)}>
                  <span className="as-row-n as-num" dir="ltr">
                    {m.num}
                  </span>
                  <span className="as-row-t">{m.title}</span>
                  <span className="as-row-x" aria-hidden="true" />
                </button>
              </h3>
              <div id={`as-row-${k}`} className="as-row-body" role="region" aria-label={m.title} hidden={!on}>
                <p>{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Chapter>
  );
}

/* ─── 2 · basin ───────────────────────────────────────────────────────────── */

function ProofIcon({ name }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "recording")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle {...c} cx="12" cy="12" r="9" />
        <path d="M10 9.5v5l4.2-2.5L10 9.5z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path {...c} d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path {...c} d="M12 12v9M12 12L4 7.5M12 12l8-4.5" />
    </svg>
  );
}

export function Basin() {
  const bigs = PRODUCT.cards.filter((c) => c.size === "big");
  const smalls = PRODUCT.cards.filter((c) => c.size === "small");
  return (
    <Chapter
      i={2}
      id="basin"
      tone="light"
      trackVh={145}
      labelledBy="as-t-basin"
      track={
        <>
          <CampTag i={2} />
          <Title id="as-t-basin" lines={TITLES.basin} />
          <p className="as-line">{LINES.basin}</p>
        </>
      }
    >
      <div className="as-phone-stage">
        <div className="as-phone" data-phone="">
          <div className="as-phone-body">
            <span className="as-phone-island" aria-hidden="true" />
            <div className="as-phone-screen">
              <V5HeroShowcase />
            </div>
          </div>
        </div>
      </div>

      <div className="as-proof">
        <p className="as-kicker as-kicker--center">{PRODUCT.headline}</p>
        {bigs.map((c) => (
          <article key={c.title} className="as-proof-big as-rv">
            <div className="as-proof-copy as-scrim">
              <h3>{c.title}</h3>
              <p>{c.tagline}</p>
              <p className="as-proof-bullet">{c.bullet}</p>
            </div>
            <div className="as-proof-visual">
              {c.mockup === "speaking" ? (
                <div className="as-proof-mock">
                  <SpeakingMock />
                </div>
              ) : (
                <div className="as-mini-phone">
                  <HomePicture
                    id="platform-vocab"
                    variant="screen"
                    sizes="226px"
                    alt="صفحة مفردات وحدة «الطقس المتطرف» كما تظهر للطالب في منصة طلاقة"
                  />
                </div>
              )}
            </div>
          </article>
        ))}
        <div className="as-proof-smalls">
          {smalls.map((c) => (
            <article key={c.title} className="as-proof-small as-scrim as-rv">
              <span className="as-proof-ico">
                <ProofIcon name={c.icon} />
              </span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.tagline}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="as-logos">
        <p className="as-logos-label">
          {TRUSTED_LOGOS.lead} <b>{TRUSTED_LOGOS.emphasis}</b>
        </p>
        <ul className="as-logos-row">
          {TRUSTED_LOGOS.items.map((it) => (
            <li key={it.name}>
              <img src={it.src} alt={it.name} loading="lazy" decoding="async" style={{ height: Math.round(it.h * 0.7) }} />
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}

/* ─── 3 · fixed rope ──────────────────────────────────────────────────────── */

export function Rope() {
  const trainer = SOLUTION.pillars.find((p) => p.icon === "trainer");
  const coach = WORTH.pillars[0];
  const vip = PRICING.vipTier;
  // The visitor's query string (utm_*) rides along to /private, as on the homepage.
  const [qs, setQs] = useState("");
  useEffect(() => setQs(window.location.search), []);
  const q = new URLSearchParams(qs);
  q.set("pkg", vip.id);
  return (
    <Chapter
      i={3}
      id="rope"
      tone="dark"
      trackVh={150}
      labelledBy="as-t-rope"
      track={
        <>
          <CampTag i={3} />
          <Title id="as-t-rope" lines={TITLES.rope} />
          <p className="as-line">{LINES.rope}</p>
        </>
      }
    >
      <div className="as-anchors">
        <article className="as-anchor as-scrim as-rv">
          <p className="as-kicker">{coach.essence}</p>
          <h3>{coach.title}</h3>
          <p>{coach.body}</p>
        </article>
        <article className="as-anchor as-scrim as-rv">
          <p className="as-kicker">{trainer.title}</p>
          <h3>{trainer.tagline}</h3>
          <ul className="as-ticks">
            {trainer.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </article>
        <article className="as-anchor as-anchor--vip as-scrim as-rv">
          <p className="as-kicker">{vip.badge}</p>
          <h3>{vip.name}</h3>
          <p className="as-vip-aud">{vip.audienceLabel}</p>
          <p>{vip.promise}</p>
          <ul className="as-vip-inside">
            {vip.inside.map((r) => (
              <li key={r.label}>
                <b>{r.label}</b>
                <span>{r.detail}</span>
              </li>
            ))}
          </ul>
          <div className="as-actions">
            <button type="button" data-open-form data-tier={vip.id} className="as-btn">
              احجز استشارة
            </button>
            <a href={`/private?${q.toString()}`} className="as-link" data-cta={`ascent_private_${vip.id}`}>
              اكتشف التجربة كاملة <span aria-hidden="true">←</span>
            </a>
          </div>
        </article>
      </div>
      <div className="as-veil">
        <V1WhoFor />
      </div>
    </Chapter>
  );
}

/* ─── 4 · high zone ───────────────────────────────────────────────────────── */

function parseStat(v) {
  const m = v.match(/^(\+?)(\d+)(K?)$/);
  if (!m) return null;
  return { prefix: m[1], num: Number(m[2]) * (m[3] ? 1000 : 1) };
}

export function HighZone() {
  return (
    <Chapter
      i={4}
      id="high"
      tone="dark"
      trackVh={150}
      labelledBy="as-t-high"
      track={
        <>
          <CampTag i={4} />
          <Title id="as-t-high" lines={TITLES.high} />
          <p className="as-line">{LINES.high}</p>
        </>
      }
    >
      <div className="as-stats as-scrim">
        <p className="as-kicker as-kicker--center">{SOCIAL_PROOF.headline}</p>
        <dl className="as-stats-grid">
          {SOCIAL_PROOF.stats.map((s) => {
            const p = parseStat(s.value);
            return (
              <div key={s.label} className="as-stat as-rv">
                <dt>{s.label}</dt>
                <dd>{p ? <Count to={p.num} prefix={p.prefix} /> : <span className="as-num">{s.value}</span>}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </Chapter>
  );
}

/* ─── 5 · summit ──────────────────────────────────────────────────────────── */

export function Summit() {
  return (
    <Chapter
      i={5}
      id="summit"
      tone="dark"
      trackVh={175}
      labelledBy="as-t-summit"
      track={
        <>
          <CampTag i={5} />
          <Title id="as-t-summit" lines={TITLES.summit} className="as-title--summit" />
        </>
      }
    >
      <div className="as-veil as-veil--gold">
        <div className="as-veil-head">
          <Title lines={[PRICING_TITLE]} className="as-title--mid" />
        </div>
        <V1Pricing />
      </div>
      <div className="as-final" data-track="" style={{ "--track": "100vh" }}>
        <div className="as-final-copy as-scrim">
          <Title lines={[FINAL_TITLE]} />
          <p className="as-sub">{FINAL_CTA.sub}</p>
          <div className="as-actions">
            <Cta label={FINAL_CTA.primaryCTA} />
          </div>
        </div>
      </div>
    </Chapter>
  );
}

/* ─── 6 · below the clouds ────────────────────────────────────────────────── */

export function Below({ mode, onMode }) {
  return (
    <section className="as-ch as-ch--below" data-camp={6} data-tone="dark" id="camp-below" aria-labelledby="as-t-below">
      <div className="as-veil as-veil--end">
        <div className="as-veil-head as-rvt" data-track="" style={{ "--track": "auto" }}>
          <Title id="as-t-below" lines={TITLES.below} className="as-title--mid" />
        </div>
        <V1FAQ />
        <V1Footer />
        <div className="as-perf-wrap">
          <PerfControl mode={mode} onMode={onMode} />
        </div>
        <p className="as-credits" dir="ltr">
          Terrain: Copernicus DEM GLO-30 — © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under
          COPERNICUS by the European Union and ESA; all rights reserved. Rendered along the South Col route.
        </p>
      </div>
    </section>
  );
}
