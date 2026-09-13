import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getVisitorId } from "../../utils/affiliateTracking";
import { SUPABASE_URL } from "../../utils/tracking";
import { getAttribution } from "../../lib/attribution";
import { track } from "../../lib/track";
import { useTrialHref } from "../../lib/trialLink";

/**
 * V1TrialBand — the invitation to «درسك الأول» (app.fluentia.academy/try).
 *
 * The first version of this band was an argument in a box: a headline, a wall
 * of prose, and a row of inert pills that read as disabled buttons. It claimed
 * the English differs by profession and then showed nothing — the one section
 * whose whole point is "see a lesson from your field" contained no lesson, and
 * half the card was empty.
 *
 * So the STRUCTURE changed, not the paint. The professions are now a live
 * selector, and picking one swaps a real SPECIMEN taken verbatim from that
 * profession's seeded lesson: its unit, a line of its English with the taught
 * terms marked, and three of its actual glossary entries. The claim proves
 * itself in place, before the visitor clicks anything.
 *
 * The band's accent is the selected field's own hue — the same hue that unit
 * carries inside the product — so changing profession visibly repaints the
 * whole surface. That is the argument restated in colour.
 *
 * Copy rule this section lives under: sell the OUTCOME (a lesson from your
 * field), never the act of producing one on demand, and never list what we
 * won't ask for. An academy states what it gives, it does not reassure.
 */

const EASE = [0.16, 1, 0.3, 1];
const ROTATE_MS = 5200;

/* ── measurement ─────────────────────────────────────────────────────────────
   After three weeks the band had produced 12 trial starts and nobody could say
   whether that was good, because nothing before `start` was recorded: not how
   many saw the band, tapped a profession, or clicked through.

   Now the band writes three anonymous steps to the LMS `trial_funnel_events`
   table (through the public trial-lesson function) and mirrors them to GA4:
     band_view  — the band was actually on screen (once per browser session)
     band_pick  — a profession was TAPPED (not hovered, not auto-rotated)
     band_cta   — «ادخل على درس من مجالك» was clicked, with the field shown
   /try then logs its own view + steps under the SAME visitor id, carried
   across origins as ?vid=, so one query reads the whole funnel.

   UTMs on the link: utm_source=home_band identifies the entry point, and
   utm_campaign keeps the channel that brought the visitor to the site
   (tiktok, google, direct…) — trial_sessions has only three utm columns and
   losing the original channel would cost more than a purist utm_campaign. */
const FUNNEL_URL = `${SUPABASE_URL}/functions/v1/trial-lesson`;

function visitor() {
  try { return getVisitorId(); } catch { return null; }
}

function funnel(event, slug) {
  try {
    const visitor_id = visitor();
    if (!visitor_id) return;
    const { utm_source } = getAttribution();
    const body = JSON.stringify({
      action: "event", event, visitor_id, job_slug: slug || null,
      utm_source: "home_band", utm_medium: "site", utm_campaign: utm_source || "direct",
    });
    // Beacon: the CTA navigates away immediately, and a fetch would be cancelled.
    if (!navigator.sendBeacon?.(FUNNEL_URL, body)) {
      fetch(FUNNEL_URL, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch { /* measurement must never break the band */ }
}

/* Verbatim from the seeded lessons in `trial_lesson_cache`. `**term**` marks a
   word that is genuinely taught in that lesson's glossary — the highlight is a
   claim, so it has to be true. */
const SPECIMENS = [
  {
    slug: "nurse",
    q: "Why was Mr. Al-Otaibi admitted?",
    qAr: "ليش أُدخِل المريض المستشفى؟",
    label: "تمريض",
    hue: 188,
    unitAr: "تسليم المناوبة",
    unitEn: "The Handover",
    line: "Overnight his oxygen **saturation** dropped to 89 percent, so we increased the flow to 4 litres. Please monitor his **output** closely and **escalate** if there is no improvement by midday.",
    terms: [
      ["saturation", "تشبّع الأكسجين"],
      ["escalate", "رفع الحالة لمستوى أعلى"],
      ["the round", "جولة الطبيب"],
    ],
  },
  {
    slug: "accountant",
    q: "What is the size of the variance?",
    qAr: "كم مقدار الفرق؟",
    label: "محاسبة",
    hue: 42,
    unitAr: "إقفال آخر الشهر",
    unitEn: "Month-End Close",
    line: "The bank **reconciliation** still shows a **variance** of 12,400 SAR. I think it is a timing difference — two cheques cleared after the **cut-off date**.",
    terms: [
      ["reconciliation", "التسوية / المطابقة"],
      ["variance", "فرق — لا «تنوّع»"],
      ["accruals", "المستحقّات"],
    ],
  },
  {
    slug: "engineer",
    q: "What is the cause of the delay?",
    qAr: "وش سبب التأخير؟",
    label: "هندسة",
    hue: 28,
    unitAr: "تقرير الموقع",
    unitEn: "The Site Report",
    line: "We are two weeks **behind schedule** on the steel package. I have raised an **RFI** on the connection detail at grid line C, and we cannot proceed until the consultant responds.",
    terms: [
      ["behind schedule", "متأخّر عن الجدول"],
      ["RFI", "طلب توضيح رسمي"],
      ["signed off", "اعتُمد رسمياً"],
    ],
  },
  {
    slug: "it",
    q: "What has been ruled out?",
    qAr: "وش الاحتمال اللي استُبعد؟",
    label: "تقنية معلومات",
    hue: 210,
    unitAr: "بلاغ العطل",
    unitEn: "The Incident Ticket",
    line: "Initial investigation points to the authentication service, which is timing out **intermittently**. We have **ruled out** the network, as other applications are responding normally.",
    terms: [
      ["intermittently", "بشكل متقطّع"],
      ["ruled out", "استُبعد هذا الاحتمال"],
      ["workaround", "حلّ مؤقّت لا إصلاح"],
    ],
  },
  {
    slug: "marketing",
    q: "What did the campaign do well?",
    qAr: "وش الشي اللي نجحت فيه الحملة؟",
    label: "تسويق",
    hue: 280,
    unitAr: "مراجعة الحملة",
    unitEn: "The Campaign Review",
    line: "The creative with the customer testimonial **outperformed** the product-only creative by a wide margin — **click-through rate** was almost double.",
    terms: [
      ["conversions", "التحويلات"],
      ["cost per acquisition", "تكلفة الاكتساب"],
      ["outperformed", "تفوّقت بوضوح"],
    ],
  },
  {
    slug: "teacher",
    q: "What has improved?",
    qAr: "وش الشي اللي تحسّن؟",
    label: "تعليم",
    hue: 150,
    unitAr: "اجتماع أولياء الأمور",
    unitEn: "The Parent Meeting",
    line: "Her reading has improved a lot — she has moved up two reading levels since September. Her writing is still **behind**: she **struggles with** full sentences.",
    terms: [
      ["behind", "متأخّرة عن المستوى"],
      ["struggles with", "تتعثّر في"],
      ["term", "الفصل الدراسي"],
    ],
  },
];

/** `**word**` → a marked span, rendered as the product's taught-term treatment
 *  rather than a generic highlighter. */
function MarkedLine({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <mark key={i} className="tb-mark">{part.slice(2, -2)}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

export default function V1TrialBand() {
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef(null);

  /* Rotates on its own until the visitor takes over: the whole point is that
     the English CHANGES per field, and a static card never shows that. Stops
     permanently on first interaction, and never runs under reduced motion. */
  useEffect(() => {
    if (touched || reduce) return undefined;
    timer.current = setInterval(() => setI((n) => (n + 1) % SPECIMENS.length), ROTATE_MS);
    return () => clearInterval(timer.current);
  }, [touched, reduce]);

  const pick = (n) => { setTouched(true); clearInterval(timer.current); setI(n); };
  const s = SPECIMENS[i];

  // band_view: at least a third of the band on screen, once per session.
  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    try { if (sessionStorage.getItem("flu_trial_band_seen")) return undefined; } catch { /* count it */ }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      try { sessionStorage.setItem("flu_trial_band_seen", "1"); } catch { /* ignore */ }
      funnel("band_view");
      track("trial_band_view", { page_path: window.location.pathname });
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPickClick = (n) => {
    pick(n);
    funnel("band_pick", SPECIMENS[n].slug);
    track("trial_band_select", { field: SPECIMENS[n].slug });
  };

  // Prerendered: the vid/channel-bearing href is only computed after mount.
  const ctaHref = useTrialHref({ source: "home_band", job: s.slug });

  const onCtaClick = () => {
    funnel("band_cta", s.slug);
    track("trial_band_click", { field: s.slug });
  };

  return (
    <section id="trial" className="tb" ref={sectionRef}>
      <style>{`
        .tb {
          padding: var(--v1-section) var(--v1-gutter);
          max-width: var(--v1-maxw);
          margin: 0 auto;
        }
        .tb-shell {
          position: relative;
          overflow: hidden;
          border-radius: var(--v1-r-lg);
          border: 1px solid var(--v1-line-strong);
          padding: clamp(26px, 4.4vw, 54px);
          background:
            radial-gradient(760px 380px at 88% -12%, hsla(var(--tb-h), 85%, 58%, 0.16), transparent 64%),
            radial-gradient(620px 340px at 8% 108%, hsla(var(--tb-h), 85%, 58%, 0.09), transparent 62%),
            linear-gradient(180deg, rgba(10,18,32,0.88), rgba(6,11,22,0.96));
          transition: background 900ms ease;
        }
        /* The room the lesson comes from, carrying the whole band. Blurred and
           held at low opacity because it sits UNDER Arabic body copy: an
           un-scrimmed plate would eat the text. The scrim is directional —
           heaviest on the right, where the text column lives in RTL. */
        .tb-atmo { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .tb-atmo img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.46;
          filter: blur(34px) saturate(1.25);
          transform: scale(1.18);
        }
        .tb-atmo::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to left,
            rgba(6,11,22,0.94) 0%, rgba(6,11,22,0.82) 40%,
            rgba(6,11,22,0.52) 74%, rgba(6,11,22,0.34) 100%);
        }

        /* A hairline of the field's own colour along the top edge, so the whole
           surface answers to the selection — not just the card. */
        .tb-shell::before {
          content: "";
          position: absolute; inset-inline: 0; top: 0; height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--tb-h), 85%, 62%), transparent);
          opacity: .55;
          transition: background 900ms ease;
        }
        .tb-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
          grid-template-rows: auto auto;
          gap: clamp(28px, 4vw, 56px);
          align-items: stretch;
        }
        .tb-say     { grid-column: 1; grid-row: 1; }
        .tb-cta-row { grid-column: 1; grid-row: 2; align-self: start; }
        .tb-show    { grid-column: 2; grid-row: 1 / span 2; }

        .tb-eyebrow {
          display: inline-block;
          font-size: 0.74rem; font-weight: 600; letter-spacing: 0.14em;
          color: hsl(var(--tb-h), 85%, 74%);
          padding: 7px 15px; border-radius: 100px;
          background: hsla(var(--tb-h), 85%, 58%, 0.09);
          border: 1px solid hsla(var(--tb-h), 85%, 58%, 0.24);
          transition: color 700ms ease, background 700ms ease, border-color 700ms ease;
        }
        .tb-h2 {
          font-family: var(--v1-display);
          font-size: var(--v1-d2); font-weight: 800; line-height: 1.26;
          letter-spacing: -0.02em; color: var(--v1-t-strong);
          margin: 20px 0 14px; max-width: 18ch;
          text-wrap: balance;
        }
        .tb-lead {
          font-size: var(--v1-lead); line-height: 1.9;
          color: var(--v1-t-mute); max-width: 42ch; margin: 0;
        }

        .tb-pickhead {
          margin: 26px 0 10px;
          font-size: 0.78rem; letter-spacing: 0.1em;
          color: var(--v1-t-faint);
        }
        .tb-chips {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .tb-chip {
          appearance: none; cursor: pointer;
          font-family: inherit; font-size: 0.9rem;
          padding: 10px 16px; border-radius: 100px;
          min-height: 42px;
          color: var(--v1-t-mute);
          background: rgba(148,197,255,0.04);
          border: 1px solid var(--v1-line);
          transition: color .25s, background .25s, border-color .25s, transform .25s;
        }
        .tb-chip:hover { color: var(--v1-t-strong); transform: translateY(-1px); }
        .tb-chip[aria-pressed="true"] {
          color: #fff;
          background: hsla(var(--tb-h), 85%, 58%, 0.16);
          border-color: hsl(var(--tb-h), 85%, 60%);
          box-shadow: 0 0 0 3px hsla(var(--tb-h), 85%, 58%, 0.10);
        }
        .tb-chip:focus-visible { outline: 2px solid hsl(var(--tb-h), 85%, 68%); outline-offset: 3px; }

        .tb-cta-row {
          display: flex; flex-wrap: wrap; align-items: center;
          gap: 16px;
        }
        .tb-note { font-size: 0.84rem; color: var(--v1-t-faint); line-height: 1.8; }

        /* ── the specimen: a page out of the product, not an illustration ── */
        .tb-show { position: relative; display: flex; align-items: center; }
        .tb-show > * { width: 100%; }
        .tb-card {
          border-radius: 18px;
          border: 1px solid var(--v1-line-strong);
          background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
          box-shadow: 0 30px 70px -34px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05);
          overflow: hidden;
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
        .tb-cover {
          position: relative; height: 138px; overflow: hidden;
          border-bottom: 1px solid var(--v1-line);
        }
        .tb-cover > img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
        }
        /* Scrim + the field's hue, so the cover reads as one system with the
           rest of the band rather than a photo dropped into a dark page. */
        .tb-cover::after {
          content: ""; position: absolute; inset: 0;
          background:
            linear-gradient(to top, rgba(8,13,24,0.94) 8%, rgba(8,13,24,0.42) 58%, rgba(8,13,24,0.30) 100%),
            linear-gradient(115deg, hsla(var(--tb-h), 85%, 55%, 0.30), transparent 70%);
        }
        .tb-cardhead {
          position: absolute; z-index: 1; inset-inline: 0; bottom: 0;
          display: flex; align-items: center; gap: 13px;
          padding: 14px 18px;
        }
        .tb-no {
          width: 38px; height: 38px; border-radius: 11px; flex: 0 0 auto;
          display: grid; place-items: center;
          font-family: var(--v1-num); font-weight: 700; font-size: 0.86rem;
          color: hsl(var(--tb-h), 85%, 76%);
          background: hsla(var(--tb-h), 85%, 58%, 0.14);
          border: 1px solid hsla(var(--tb-h), 85%, 60%, 0.36);
        }
        .tb-unit { font-size: 1rem; font-weight: 700; color: var(--v1-t-strong); line-height: 1.35; }
        .tb-uniten {
          font-family: var(--v1-num); direction: ltr; unicode-bidi: isolate;
          font-size: 0.76rem; letter-spacing: 0.06em; color: var(--v1-t-faint);
          margin-top: 2px;
        }
        .tb-body { padding: 20px 18px 8px; min-height: 132px; }
        .tb-line {
          font-family: var(--v1-num);
          direction: ltr; text-align: left; unicode-bidi: isolate;
          font-size: 0.98rem; line-height: 1.95; color: #dde6f2;
          margin: 0;
        }
        .tb-mark {
          background: hsla(var(--tb-h), 85%, 58%, 0.17);
          color: hsl(var(--tb-h), 90%, 82%);
          padding: 1px 4px; border-radius: 5px;
          border-bottom: 1px dashed hsla(var(--tb-h), 85%, 62%, 0.55);
        }
        .tb-terms { padding: 6px 18px 14px; display: grid; gap: 1px; }
        .tb-ask {
          padding: 14px 18px 16px;
          border-top: 1px solid var(--v1-line);
          background: hsla(var(--tb-h), 85%, 58%, 0.05);
        }
        .tb-asklbl {
          font-size: 0.7rem; letter-spacing: 0.12em;
          color: hsl(var(--tb-h), 85%, 74%); margin-bottom: 7px;
        }
        .tb-askq {
          font-family: var(--v1-num); direction: ltr; text-align: left;
          unicode-bidi: isolate;
          font-size: 0.92rem; color: var(--v1-t-strong); line-height: 1.6;
        }
        .tb-askar { font-size: 0.82rem; color: var(--v1-t-faint); margin-top: 5px; }
        .tb-term {
          display: flex; align-items: baseline; gap: 14px;
          padding: 10px 0;
          border-top: 1px solid var(--v1-line);
        }
        .tb-term b {
          font-family: var(--v1-num); direction: ltr; unicode-bidi: isolate;
          font-weight: 500; font-size: 0.88rem;
          color: hsl(var(--tb-h), 85%, 76%);
          flex: 0 0 auto; min-width: 9.5rem;
        }
        .tb-term span { font-size: 0.86rem; color: var(--v1-t-mute); line-height: 1.6; }

        @media (max-width: 900px) {
          .tb-grid { grid-template-columns: 1fr; grid-template-rows: none; gap: 26px; }
          /* claim → selector → PROOF → call to action */
          .tb-say     { grid-column: 1; grid-row: auto; order: 1; }
          .tb-show    { grid-column: 1; grid-row: auto; order: 2; min-height: 0; }
          .tb-cta-row { grid-column: 1; grid-row: auto; order: 3; }
          .tb-h2, .tb-lead { max-width: none; }
          .tb-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .tb-term b { min-width: 7.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tb-shell, .tb-shell::before, .tb-eyebrow { transition: none; }
        }
      `}</style>

      <motion.div
        className="tb-shell"
        style={{ "--tb-h": s.hue }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Keyed so the room cross-fades with the lesson it belongs to. */}
        <div className="tb-atmo" aria-hidden="true">
          <motion.img
            key={s.slug}
            src={`/worlds/${s.slug}.jpg`}
            alt=""
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 0.46 }}
            transition={{ duration: 0.8, ease: EASE }}
          />
        </div>

        <div className="tb-grid">
          {/* ── the claim, and the control that tests it ── */}
          <div className="tb-say">
            <span className="tb-eyebrow">قبل أن تقرّر</span>

            <h2 className="tb-h2">لكل مهنة إنجليزيتها الخاصة.</h2>

            <p className="tb-lead">
              لا شيء منها في كتاب عام، ولا في معهد يعطي الجميع نفس الملف.
              اختر مجالاً وانظر بنفسك.
            </p>

            <div className="tb-pickhead">اختر مجالاً</div>
            <div className="tb-chips" role="group" aria-label="اختر مجالاً">
              {SPECIMENS.map((sp, n) => (
                <button
                  key={sp.slug}
                  type="button"
                  className="tb-chip"
                  aria-pressed={n === i}
                  onClick={() => onPickClick(n)}
                  onMouseEnter={() => pick(n)}
                >
                  {sp.label}
                </button>
              ))}
            </div>

          </div>

          {/* ── the proof ── */}
          <div className="tb-show">
            <div className="tb-card">
              <motion.div
                key={s.slug}
                initial={reduce ? false : { opacity: 0.25, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {/* A cover, the way every unit carries one inside the product —
                    the room this lesson is set in, with the title sitting on it. */}
                <div className="tb-cover">
                  <img src={`/worlds/${s.slug}.jpg`} alt="" loading="lazy" decoding="async" />
                  <div className="tb-cardhead">
                    {/* Latin + isolated: Arabic-Indic «٠١» flips inside an RTL run. */}
                    <div className="tb-no">01</div>
                    <div>
                      <div className="tb-unit">{s.unitAr}</div>
                      <div className="tb-uniten">{s.unitEn}</div>
                    </div>
                  </div>
                </div>

                <div className="tb-body">
                  <p className="tb-line"><MarkedLine text={s.line} /></p>
                </div>

                <div className="tb-terms">
                  {s.terms.map(([en, ar]) => (
                    <div className="tb-term" key={en}>
                      <b>{en}</b><span>{ar}</span>
                    </div>
                  ))}
                </div>

                {/* The card has to be the whole shape of a lesson — you read,
                    you learn the terms, then you are asked. */}
                <div className="tb-ask">
                  <div className="tb-asklbl">سؤال من الدرس</div>
                  <div className="tb-askq">{s.q}</div>
                  <div className="tb-askar">{s.qAr}</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Its own grid child: beneath the claim on desktop, and AFTER the
              specimen on a phone — the evidence has to land before the ask. */}
          <div className="tb-cta-row">
            <a href={ctaHref} onClick={onCtaClick} data-cta="trial_band"
               className="v1-cta v1-cta-primary" style={{ textDecoration: "none" }}>
              ادخل على درس من مجالك ←
            </a>
            <span className="tb-note">
              أو أي مهنة أخرى — درس كامل وتصحيح فوري بالعربية.
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
