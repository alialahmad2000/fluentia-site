import { useState } from "react";
import V5SectionFilm from "../v5/V5SectionFilm";
import { motion } from "framer-motion";
import { PRICING } from "../landing-v2/content";
import { buildWhatsAppUrl } from "../../lib/whatsapp";
import { track } from "../../lib/track";
import { Reveal, staggerParent, staggerItem } from "./motion";

const fmt = (n) => n.toLocaleString("en-US");
const perDay = (n) => Math.round(n / 30);

const GLANCE_ROWS = [
  { key: "group", label: "حصص جماعية شهرياً" },
  { key: "solo", label: "حصص فردية شهرياً" },
  { key: "followUp", label: "متابعة المدرّب" },
];

/**
 * V1Pricing — reads everything from live content.js (single source of truth).
 *
 * Order of attention: the three class tiers first (طلاقة in the middle, raised,
 * gold-edged), each answering the same three questions in the same rows so they
 * compare at a glance; then the two 1:1 programmes side by side (regular, and the
 * intensive schedule with practice sessions); then the platform-only plan as
 * a slim line for the self-directed. No struck-through "before" prices: a premium
 * product states its price once, and anchors it to the day (≈ 40 ر.س) instead.
 *
 * Gold is spent once: the recommended card's edge, its badge, ticks and button.
 * VIP is outlined, not a second gold slab competing with the recommendation.
 *
 * Phones get a sticky segmented switcher (أساس | طلاقة | تميّز, with prices)
 * opening on طلاقة instead of three tall cards stacked. All three cards stay in
 * the markup (prerender, SEO); the switcher only toggles which one shows under 980px.
 */
export default function V1Pricing() {
  const { entryTier: entry, tiers, vipTier: vip, intensiveTier: intensive } = PRICING;
  const heroId = (tiers.find((t) => t.isHero) || tiers[0]).id;
  const [active, setActive] = useState(heroId);
  const trust = PRICING.trust.split("·").map((s) => s.trim()).filter(Boolean);
  const headline = PRICING.headline.split(/(?<=\.)\s/);

  const pick = (id) => {
    setActive(id);
    track("pricing_tier_switch", { tier_id: id });
  };

  return (
    <section className="v1-section v1p v5-has-film" id="pricing">
      <V5SectionFilm src="/home/film-pricing-1280.mp4" poster="/home/film-pricing-poster-1280.webp" side="center" strength={1.0} />
      <div className="v1-container">
        <Reveal>
          <header className="v1p-head">
            <span className="v1-eyebrow" style={{ color: "var(--v1-gold)" }}>{PRICING.eyebrow}</span>
            <h2 className="v1-headline">
              {headline.map((s, i) => (
                <span key={i} className="v1p-hl">{i ? " " : ""}{s}</span>
              ))}
            </h2>
            <p className="v1-intro">{PRICING.intro}</p>
            <ul className="v1p-trust">
              {trust.map((t) => (
                <li key={t}><Check />{t}</li>
              ))}
            </ul>
          </header>
        </Reveal>

        <div className="v1p-compare">
          {/* ── phone switcher ── */}
          <div className="v1p-switch" role="tablist" aria-label="اختر الباقة">
            {tiers.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                aria-controls={`v1p-${t.id}`}
                className={`v1p-switch-btn${t.isHero ? " is-hero" : ""}`}
                onClick={() => pick(t.id)}
              >
                {active === t.id && (
                  <motion.span layoutId="v1p-pill" className="v1p-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} aria-hidden />
                )}
                <span className="v1p-switch-label">{t.name}</span>
                <span className="v1p-switch-price v1-num">{fmt(t.price)}</span>
              </button>
            ))}
          </div>

          {/* ── class tiers ── */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-6% 0px" }}
            className="v1p-tiers"
          >
            {tiers.map((t) => {
              const hero = t.isHero;
              return (
                <motion.article
                  key={t.id}
                  id={`v1p-${t.id}`}
                  variants={staggerItem}
                  className={`v1-card v1p-tier${hero ? " is-hero" : ""}`}
                  data-active={active === t.id}
                  aria-labelledby={`v1p-${t.id}-name`}
                >
                  {hero && <div className="v1p-hero-line" aria-hidden />}

                  <div className="v1p-tier-top">
                    <h3 id={`v1p-${t.id}-name`} className="v1p-tier-name">{t.name}</h3>
                    {hero && <span className="v1p-rec">ننصح بها</span>}
                  </div>
                  <p className="v1p-tagline">{t.tagline}</p>

                  <div className="v1p-price">
                    <div className="v1p-price-row">
                      <span className="v1p-amount v1-num">{fmt(t.price)}</span>
                      <span className="v1p-cur">ر.س</span>
                      <span className="v1p-per">/ شهرياً</span>
                    </div>
                    <div className="v1p-daily">
                      حوالي <b className="v1-num">{perDay(t.price)}</b> ر.س في اليوم
                    </div>
                  </div>

                  {t.glance && (
                    <dl className="v1p-glance">
                      {GLANCE_ROWS.map((r) => (
                        <div key={r.key} className="v1p-glance-row">
                          <dt>{r.label}</dt>
                          <dd className={`v1-num${t.glance[r.key] === "—" ? " is-none" : ""}`}>{t.glance[r.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* facts already stated in the glance rows aren't repeated here */}
                  <ul className="v1p-feats">
                    {t.features.filter((f) => !f.inGlance).map((f) => (
                      <li key={f.text} className={f.bold ? "is-bold" : undefined}>
                        <Check gold={hero} />
                        <span className="v1-num">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    data-open-form
                    data-tier={t.id}
                    className={`v1-cta ${hero ? "v1-cta-gold" : "v1-cta-ghost"} v1p-cta`}
                  >
                    {t.ctaLabel}
                  </button>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* ── 1:1 programmes: regular + intensive ── */}
        <Reveal delay={0.05}>
          <div className="v1p-solo">
            <article className="v1-card v1p-vip" aria-labelledby="v1p-vip-name">
              <span className="v1p-vip-badge">{vip.badge}</span>
              <h3 id="v1p-vip-name" className="v1p-vip-name">{vip.name}</h3>
              <p className="v1p-vip-aud">{vip.audienceLabel}</p>
              <p className="v1p-tagline">{vip.tagline}</p>
              <div className="v1p-price">
                <div className="v1p-price-row">
                  <span className="v1p-from">من</span>
                  <span className="v1p-amount v1-num">{fmt(vip.priceLow)}</span>
                  <span className="v1p-cur">ر.س</span>
                  <span className="v1p-per">/ شهرياً</span>
                </div>
                <p className="v1p-vip-note">{vip.priceNote}</p>
              </div>
              <ul className="v1p-feats">
                {vip.features.map((f) => (
                  <li key={f}><Check gold /><span className="v1-num">{f}</span></li>
                ))}
              </ul>
              <button type="button" data-open-form data-tier={vip.id} className="v1-cta v1-cta-ghost v1p-cta v1p-vip-cta">
                {vip.ctaLabel}
              </button>
            </article>

            <article className="v1-card v1p-vip is-intensive" aria-labelledby="v1p-int-name">
              <div className="v1p-vip-line" aria-hidden />
              <span className="v1p-vip-badge">{intensive.badge}</span>
              <h3 id="v1p-int-name" className="v1p-vip-name">{intensive.name}</h3>
              <p className="v1p-vip-aud">{intensive.audienceLabel}</p>
              <p className="v1p-tagline">{intensive.tagline}</p>
              <div className="v1p-price">
                <div className="v1p-price-row">
                  <span className="v1p-amount v1-num">{fmt(intensive.price)}</span>
                  <span className="v1p-cur">ر.س</span>
                  <span className="v1p-per">/ شهرياً</span>
                </div>
                <div className="v1p-daily">
                  حوالي <b className="v1-num">{perDay(intensive.price)}</b> ر.س في اليوم
                </div>
              </div>
              <ul className="v1p-solo-glance">
                {intensive.glance.map((g) => (
                  <li key={g.label} className="v1p-solo-stat">
                    <span className="v1p-solo-num v1-num">{g.value}</span>
                    <span className="v1p-solo-lbl">{g.label}</span>
                    <span className="v1p-solo-sub v1-num">{g.sub}</span>
                  </li>
                ))}
              </ul>
              <ul className="v1p-feats">
                {intensive.features.map((f) => (
                  <li key={f}><Check gold /><span className="v1-num">{f}</span></li>
                ))}
              </ul>
              <button type="button" data-open-form data-tier={intensive.id} className="v1-cta v1-cta-ghost v1p-cta v1p-vip-cta">
                {intensive.ctaLabel}
              </button>
            </article>
          </div>
        </Reveal>

        {/* ── platform only ── */}
        <Reveal delay={0.05}>
          <article className="v1p-self" aria-labelledby="v1p-self-name">
            <div className="v1p-self-copy">
              <span className="v1p-self-kicker">{entry.badge}</span>
              <h3 id="v1p-self-name" className="v1p-self-name">{entry.name}</h3>
              <p className="v1p-self-line">{entry.tagline}</p>
            </div>
            <div className="v1p-self-price">
              <span className="v1p-self-amount v1-num">{fmt(entry.price)}</span>
              <span className="v1p-per">ر.س / شهرياً</span>
            </div>
            <button type="button" data-open-form data-tier={entry.id} className="v1-cta v1-cta-ghost v1p-self-cta">
              {entry.ctaLabel}
            </button>
          </article>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="v1p-foot">
            {PRICING.footer.line}{" "}
            <a href={buildWhatsAppUrl("السلام عليكم، عندي استفسار عن الباقة المناسبة لي")} target="_blank" rel="noopener noreferrer">
              {PRICING.footer.waLabel} ↖
            </a>
          </p>
        </Reveal>
      </div>

      <style>{`
        .v1-scope .v1p { position: relative; }
        .v1-scope .v1p-head { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .v1-scope .v1p-head .v1-intro { text-align: center; max-width: 56ch; margin-inline: auto; }
        .v1-scope .v1p-trust {
          list-style: none; margin: 22px 0 0; padding: 0;
          display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 22px;
          font-size: var(--v1-body-s); color: var(--v1-t-mute);
        }
        .v1-scope .v1p-trust li { display: inline-flex; align-items: center; gap: 8px; }

        /* switcher — phones only */
        .v1-scope .v1p-switch { display: none; }

        .v1-scope .v1p-tiers {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px; margin-top: clamp(48px, 6vw, 72px); align-items: stretch;
        }
        .v1-scope .v1p-tier { display: flex; flex-direction: column; padding: clamp(26px, 2.8vw, 34px); }
        /* Neutral lifted surface, gold only in the edge. Raised with margin/padding, not
           transform (the stagger variant owns it), so every row stays level across cards. */
        .v1-scope .v1p-tier.is-hero {
          border: 1px solid transparent;
          background:
            linear-gradient(170deg, rgba(148, 197, 255, 0.085), rgba(148, 197, 255, 0.02) 55%) padding-box,
            linear-gradient(var(--v1-ink-2), var(--v1-ink-2)) padding-box,
            linear-gradient(180deg, rgba(242, 193, 78, 0.85), rgba(242, 193, 78, 0.3) 38%, rgba(242, 193, 78, 0.14)) border-box;
          box-shadow: inset 0 1px 0 rgba(255, 243, 214, 0.18), var(--v1-shadow-card);
          margin-top: -14px;
          padding-top: calc(clamp(26px, 2.8vw, 34px) + 14px);
        }
        .v1-scope .v1p-hero-line {
          position: absolute; top: 0; inset-inline: 18%; height: 2px;
          background: linear-gradient(90deg, transparent, var(--v1-gold) 30%, #fff3d6 50%, var(--v1-gold) 70%, transparent);
        }
        .v1-scope .v1p-tier-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 34px; }
        .v1-scope .v1p-tier-name { margin: 0; font: 800 1.5rem/1.2 var(--v1-display); color: var(--v1-t-strong); }
        .v1-scope .v1p-rec {
          font: 700 0.74rem/1 var(--v1-display); color: #241703;
          background: linear-gradient(135deg, var(--v1-gold-soft), var(--v1-gold));
          padding: 7px 12px; border-radius: 99px; white-space: nowrap;
        }
        .v1-scope .v1p-tagline { margin: 10px 0 0; font-size: 0.9rem; line-height: 1.85; color: var(--v1-t-mute); font-weight: 400; min-height: 3.7em; text-wrap: pretty; }

        .v1-scope .v1p-price { margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--v1-line); }
        .v1-scope .v1p-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .v1-scope .v1p-amount {
          font-size: clamp(2.3rem, 3.6vw, 2.9rem); font-weight: 800; line-height: 1; letter-spacing: -0.02em;
          color: var(--v1-t-strong); font-variant-numeric: tabular-nums;
        }
        .v1-scope .v1p-cur { font: 700 1.05rem/1 var(--v1-display); color: var(--v1-t); }
        .v1-scope .v1p-per { font-size: 0.85rem; color: var(--v1-t-faint); }
        .v1-scope .v1p-from { font: 600 0.95rem/1 var(--v1-display); color: var(--v1-t-mute); }
        .v1-scope .v1p-daily { margin-top: 10px; font-size: 0.82rem; color: var(--v1-t-faint); }
        .v1-scope .v1p-daily b { color: var(--v1-azure-soft); font-weight: 700; }
        .v1-scope .v1p-tier.is-hero .v1p-daily b { color: var(--v1-gold-soft); }

        .v1-scope .v1p-glance {
          margin: 22px 0 0; border-radius: 14px; overflow: hidden;
          border: 1px solid var(--v1-line); background: rgba(4, 7, 14, 0.35);
        }
        .v1-scope .v1p-glance-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; }
        .v1-scope .v1p-glance-row + .v1p-glance-row { border-top: 1px solid var(--v1-line); }
        .v1-scope .v1p-glance dt { font-size: 0.84rem; color: var(--v1-t-mute); }
        .v1-scope .v1p-glance dd { margin: 0; font: 700 0.95rem/1 var(--v1-display); color: var(--v1-t-strong); }
        .v1-scope .v1p-glance dd.is-none { color: var(--v1-t-faint); font-weight: 400; }

        .v1-scope .v1p-feats { list-style: none; padding: 0; margin: 20px 0 0; display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .v1-scope .v1p-feats li { display: flex; gap: 10px; align-items: flex-start; font-size: 0.9rem; line-height: 1.75; color: var(--v1-t); font-weight: 400; }
        .v1-scope .v1p-feats li.is-bold { color: var(--v1-t-strong); font-weight: 600; }
        .v1-scope .v1p-feats svg { flex-shrink: 0; margin-top: 6px; }
        .v1-scope .v1p-cta { width: 100%; margin-top: 26px; }

        @media (hover: hover) {
          /* Framer leaves an inline transform on each card, so hover uses the separate translate property */
          .v1-scope .v1p-tier { transition: translate var(--v1-fast) var(--v1-ease), border-color var(--v1-fast); }
          .v1-scope .v1p-tier:not(.is-hero):hover { translate: 0 -3px; border-color: var(--v1-line-strong); }
        }

        /* 1:1 programmes — two outlined cards, never a second gold slab */
        .v1-scope .v1p-solo {
          margin-top: 22px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: stretch;
        }
        .v1-scope .v1p-vip {
          position: relative; display: flex; flex-direction: column; padding: clamp(26px, 3vw, 38px);
          border-color: rgba(242, 193, 78, 0.28);
          background: linear-gradient(170deg, rgba(148, 197, 255, 0.05), rgba(148, 197, 255, 0.012) 60%);
        }
        .v1-scope .v1p-vip.is-intensive {
          border-color: rgba(242, 193, 78, 0.5);
          background: linear-gradient(170deg, rgba(242, 193, 78, 0.06), rgba(148, 197, 255, 0.02) 55%);
        }
        .v1-scope .v1p-vip-line {
          position: absolute; top: 0; inset-inline: 22%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(242, 193, 78, 0.7) 35%, rgba(255, 243, 214, 0.9) 50%, rgba(242, 193, 78, 0.7) 65%, transparent);
        }
        .v1-scope .v1p-vip-badge {
          align-self: flex-start;
          display: inline-flex; font: 700 0.74rem/1 var(--v1-display); letter-spacing: 0.04em; color: var(--v1-gold-soft);
          padding: 8px 13px; border-radius: 99px; border: 1px solid var(--v1-line-gold); background: rgba(242, 193, 78, 0.06);
        }
        .v1-scope .v1p-vip-name { margin: 16px 0 0; font: 800 clamp(1.35rem, 2.3vw, 1.65rem)/1.3 var(--v1-display); color: var(--v1-t-strong); }
        .v1-scope .v1p-vip-aud { margin: 6px 0 0; font-size: 0.9rem; font-weight: 500; color: var(--v1-t); }
        .v1-scope .v1p-vip .v1p-tagline { min-height: 3.7em; }
        .v1-scope .v1p-vip-note { margin: 10px 0 0; font-size: 0.8rem; line-height: 1.9; color: var(--v1-t-mute); }
        .v1-scope .v1p-vip.is-intensive .v1p-daily b { color: var(--v1-gold-soft); }
        .v1-scope .v1p-vip-cta { border-color: rgba(242, 193, 78, 0.55); color: var(--v1-gold-soft); }
        .v1-scope .v1p-vip-cta:hover { border-color: var(--v1-gold); background: rgba(242, 193, 78, 0.06); }

        .v1-scope .v1p-solo-glance { list-style: none; padding: 0; margin: 20px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .v1-scope .v1p-solo-stat {
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px;
          padding: 14px 10px; border-radius: 14px; border: 1px solid var(--v1-line); background: rgba(4, 7, 14, 0.35);
        }
        .v1-scope .v1p-solo-num { font: 800 2rem/1 var(--v1-num); color: var(--v1-t-strong); letter-spacing: -0.02em; }
        .v1-scope .v1p-solo-lbl { font: 600 0.86rem/1.5 var(--v1-display); color: var(--v1-t); }
        .v1-scope .v1p-solo-sub { font-size: 0.76rem; color: var(--v1-t-faint); }

        /* platform only — slim line */
        .v1-scope .v1p-self {
          margin-top: 22px; padding: 20px clamp(20px, 3vw, 32px); border-radius: var(--v1-r-md);
          display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 14px 32px; align-items: center;
          border: 1px solid var(--v1-line);
          background: linear-gradient(165deg, rgba(148, 197, 255, 0.04), rgba(148, 197, 255, 0.01) 60%);
        }
        .v1-scope .v1p-self-kicker { font: 600 0.74rem/1 var(--v1-display); color: var(--v1-azure-soft); }
        .v1-scope .v1p-self-name { margin: 8px 0 0; font: 800 1.12rem/1.3 var(--v1-display); color: var(--v1-t-strong); }
        .v1-scope .v1p-self-line { margin: 4px 0 0; font-size: 0.86rem; line-height: 1.8; color: var(--v1-t-mute); font-weight: 400; }
        .v1-scope .v1p-self-price { display: flex; align-items: baseline; gap: 8px; white-space: nowrap; }
        .v1-scope .v1p-self-amount { font-size: 1.7rem; font-weight: 800; color: var(--v1-t-strong); letter-spacing: -0.01em; }
        .v1-scope .v1p-self-cta { padding-inline: 26px; }

        .v1-scope .v1p-foot { text-align: center; margin-top: 44px; font-size: 0.95rem; color: var(--v1-t-mute); line-height: 1.9; }
        .v1-scope .v1p-foot a { color: var(--v1-azure-soft); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--v1-line-azure); padding-bottom: 2px; }

        @media (max-width: 980px) {
          .v1-scope .v1p-switch {
            position: sticky; top: 76px; z-index: 5;
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 5px;
            max-width: 420px; margin: 36px auto 0; border-radius: 999px;
            background: var(--v1-ink-2); border: 1px solid var(--v1-line-strong);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          }
          .v1-scope .v1p-switch-btn {
            position: relative; height: 54px; border: 0; background: none; cursor: pointer; border-radius: 999px;
            display: grid; place-content: center; gap: 3px;
            font: 700 0.95rem/1 var(--v1-display); color: var(--v1-t-mute); -webkit-tap-highlight-color: transparent;
          }
          .v1-scope .v1p-switch-btn[aria-selected="true"] { color: var(--v1-t-strong); }
          .v1-scope .v1p-switch-btn.is-hero[aria-selected="true"] { color: #241703; }
          .v1-scope .v1p-switch-btn:focus-visible { outline: 2px solid var(--v1-azure-soft); outline-offset: 2px; }
          .v1-scope .v1p-pill { position: absolute; inset: 0; border-radius: 999px; background: rgba(148, 197, 255, 0.14); box-shadow: inset 0 0 0 1px var(--v1-line-strong); }
          .v1-scope .v1p-switch-btn.is-hero .v1p-pill { background: linear-gradient(135deg, var(--v1-gold-soft), var(--v1-gold)); box-shadow: 0 6px 20px rgba(242, 193, 78, 0.25); }
          .v1-scope .v1p-switch-label { position: relative; z-index: 1; }
          .v1-scope .v1p-switch-price { position: relative; z-index: 1; font: 600 0.75rem/1 var(--v1-num); color: var(--v1-t-faint); }
          .v1-scope .v1p-switch-btn[aria-selected="true"] .v1p-switch-price { color: inherit; opacity: 0.75; }

          .v1-scope .v1p-tiers { grid-template-columns: minmax(0, 1fr); max-width: 520px; margin: 18px auto 0; }
          .v1-scope .v1p-tier.is-hero { margin-top: 0; padding-top: clamp(26px, 2.8vw, 34px); }
          .v1-scope .v1p-tier[data-active="false"] { display: none; }
          .v1-scope .v1p-tier[data-active="true"] { animation: v1p-in 0.42s var(--v1-ease); }
          .v1-scope .v1p-tagline { min-height: 0; }
          .v1-scope .v1p-solo { grid-template-columns: minmax(0, 1fr); max-width: 520px; margin-inline: auto; }
          .v1-scope .v1p-vip .v1p-tagline { min-height: 0; }
          .v1-scope .v1p-self { max-width: 520px; margin-inline: auto; }
        }
        @keyframes v1p-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (max-width: 860px) {
          .v1-scope .v1p-self { grid-template-columns: minmax(0, 1fr) auto; }
          .v1-scope .v1p-self-copy { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .v1-scope .v1p-hl { display: block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .v1-scope .v1p-tier[data-active="true"] { animation: none; }
        }
      `}</style>
    </section>
  );
}

function Check({ gold }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke={gold ? "var(--v1-gold)" : "var(--v1-azure)"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
