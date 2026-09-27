/**
 * /join editorial — middle of the page.
 *   LogoTiles     square white tiles on hairlines, drifting (reference d-05)
 *   PlatformWork  «من داخل المنصة» — the platform as selected work, 2-col grid (d-02)
 *   StoneBlock    the one stone section: photo + spinning ring, headline, pillars, button (d-03)
 *   Pains         the four problems, each title struck through as it scrolls in
 *   Stats         the one ink band — big Cormorant numerals
 * Copy comes from landing-v2/content.js; the word-tap demo from v5/heroMoments.json.
 */
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { TRUSTED_LOGOS, PRODUCT, SOLUTION, PROBLEM, SOCIAL_PROOF } from "../../landing-v2/content";
import heroMoments from "../../v5/heroMoments.json";
import { Marquee, RingText, EASE } from "./primitives";

/* A heading whose line rises out of a mask. (LineReveal observes the masked
   child, which never intersects while it sits outside its clip — so here the
   parent is observed and the child follows through variants.) */
function MaskTitle({ children, className, id }) {
  return (
    <motion.h2 className={className} id={id} initial="hide" whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.12em" }}>
        <motion.span style={{ display: "block" }}
          variants={{ hide: { y: "110%" }, show: { y: "0%" } }}
          transition={{ duration: 1, ease: EASE }}>
          {children}
        </motion.span>
      </span>
    </motion.h2>
  );
}

/* ---------- helpers ---------- */

/** Render a string whose Latin runs (e.g. «(Pre-A1 → C1)», «Anki») stay LTR inside RTL text. */
function Bidi({ text }) {
  const parts = String(text).split(/([A-Za-z][A-Za-z0-9\-+ →/.]*[A-Za-z0-9])/g);
  return parts.map((p, i) =>
    /[A-Za-z]/.test(p) ? <span key={i} dir="ltr">{p}</span> : p
  );
}

/** "+12K" → "12,000+" (as the homepage writes it); other values untouched. */
function statValue(v) {
  const m = /^\+?(\d+)K$/i.exec(String(v).trim());
  if (m) return `${(Number(m[1]) * 1000).toLocaleString("en-US")}+`;
  return String(v);
}

/* ---------- 1. Logo tiles ---------- */

export function LogoTiles() {
  const names = TRUSTED_LOGOS.items.map((l) => l.name).join("، ");
  return (
    <section className="jx-logos" aria-labelledby="jx-logos-h">
      <p className="jx-logos-h" id="jx-logos-h">
        {TRUSTED_LOGOS.lead} {TRUSTED_LOGOS.emphasis}
      </p>
      <Marquee baseSpeed={28} direction={1} copies={4} className="jx-logos-row" ariaLabel={names}>
        {TRUSTED_LOGOS.items.map((l) => (
          <div className="jx-logo-tile" key={l.src}>
            <img src={l.src} alt="" width="160" height={l.h} loading="lazy" decoding="async"
              style={{ "--h": `${l.h}px` }} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ---------- 2. Platform as selected work ---------- */

const CARD = Object.fromEntries(PRODUCT.cards.map((c) => [c.mockup || c.icon, c]));
const MOMENT = heroMoments.moments.reading;

function WordTap() {
  const [open, setOpen] = useState(false);
  const audioRef = useRef(null);
  const [before, after] = MOMENT.sentence.split(MOMENT.word);

  const tap = () => {
    setOpen(true);
    try {
      if (!audioRef.current) audioRef.current = new Audio(MOMENT.audio);
      audioRef.current.currentTime = 0;
      const p = audioRef.current.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* audio is a bonus, never a blocker */ }
  };

  return (
    <div className="jx-tap">
      <img className="jx-tap-img" src={MOMENT.image} alt="" width="1024" height="576" loading="lazy" decoding="async" />
      <div className="jx-tap-page">
        <p className="jx-tap-sentence" dir="ltr" lang="en">
          {before}
          <button type="button" className={`jx-tap-word${open ? " is-open" : ""}`} onClick={tap}
            aria-expanded={open} aria-controls="jx-tap-gloss" aria-label={`${MOMENT.word} — اضغط لمعرفة المعنى وسماع النطق`}>
            {MOMENT.word}
          </button>
          {after}
        </p>
        <div className="jx-tap-gloss" id="jx-tap-gloss" aria-live="polite">
          {open ? (
            <motion.div key="g" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }} className="jx-tap-gloss-in">
              <span className="jx-tap-ar">{MOMENT.meaningAr}</span>
              <span className="jx-tap-pos" dir="ltr" lang="en">{MOMENT.pos}</span>
              <span className="jx-tap-ex" dir="ltr" lang="en">{MOMENT.example}</span>
            </motion.div>
          ) : (
            <span className="jx-tap-hint">اضغط الكلمة المظلّلة: يظهر معناها وتسمع نطقها.</span>
          )}
        </div>
      </div>
    </div>
  );
}

const COVERS = ["l3u04", "l1u08", "l2u01", "l1u02"];

export function PlatformWork() {
  const works = [
    {
      key: "tap",
      media: <WordTap />,
      title: "جرّبها الآن",
      line: <>قطعة من وحدة «{MOMENT.themeAr}» كما يراها الطالب في المنصة.</>,
    },
    {
      key: "speaking",
      media: (
        <img className="jx-work-img" src="/home/method-mic-main-1024.webp" alt="ميكروفون على مكتب تحت ضوء مصباح"
          width="1024" height="768" loading="lazy" decoding="async" />
      ),
      title: CARD.speaking.title,
      line: <Bidi text={CARD.speaking.tagline} />,
    },
    {
      key: "vocab",
      media: (
        <div className="jx-work-phone">
          <img src="/home/platform-vocab-screen-780.webp" alt="شاشة مفردات الوحدة في منصة طلاقة"
            width="780" height="1280" loading="lazy" decoding="async" />
        </div>
      ),
      title: CARD.vocab.title,
      line: <Bidi text={CARD.vocab.tagline} />,
    },
    {
      key: "curriculum",
      media: (
        <div className="jx-work-covers">
          {COVERS.map((c) => (
            <img key={c} src={`/home/cover-${c}-tile-640.webp`} alt="" width="640" height="360" loading="lazy" decoding="async" />
          ))}
        </div>
      ),
      title: CARD.curriculum.title,
      line: CARD.curriculum.tagline,
    },
  ];

  return (
    <section className="jx-section jx-work" aria-label="من داخل المنصة">
      <div className="jx-wrap">
        <header className="jx-work-head">
          <MaskTitle className="jx-display jx-h2">من داخل المنصة</MaskTitle>
          <p className="jx-body jx-work-intro">{PRODUCT.intro.split(".")[0]}.</p>
        </header>
        <div className="jx-work-grid">
          {works.map((w) => (
            <figure className={`jx-work-item jx-work-${w.key}`} key={w.key}>
              <div className="jx-work-media">{w.media}</div>
              <figcaption className="jx-work-cap">
                <h3 className="jx-work-title">{w.title}</h3>
                <p className="jx-work-line">{w.line}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Stone block ---------- */

export function StoneBlock() {
  return (
    <section className="jx-stone" aria-labelledby="jx-stone-h">
      <div className="jx-wrap jx-stone-grid">
        <div className="jx-stone-copy">
          <h2 className="jx-display jx-h2" id="jx-stone-h">{SOLUTION.headline}</h2>
          <p className="jx-lead jx-stone-lead">{SOLUTION.intro}</p>
          <ol className="jx-pillars">
            {SOLUTION.pillars.map((p) => (
              <li key={p.num} className="jx-pillar">
                <span className="jx-pillar-num jx-latin" dir="ltr">{p.num}</span>
                <span className="jx-pillar-t">{p.title}</span>
                <span className="jx-pillar-s"><Bidi text={p.points[0].replace(/ · /g, "، ")} /></span>
              </li>
            ))}
          </ol>
          <a href="#join-form" className="jx-btn jx-btn-primary jx-stone-btn" data-open-form>احجز لقاءك المبدئي</a>
        </div>
        <div className="jx-stone-photo">
          <RingText text={"speak · ".repeat(7)} size={150} className="jx-stone-ring" />
          <img src="/home/solution-trainer-main-1024.webp" alt="مكتب المدرّب: حاسوب ومصباح في غرفة هادئة"
            width="1024" height="768" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Pains ---------- */

function PainRow({ card, index }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "start 42%"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <li className="jx-pain" ref={ref}>
      <span className="jx-pain-num jx-latin" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
      <div className="jx-pain-main">
        <h3 className="jx-pain-title">
          <span className="jx-pain-t">
            <Bidi text={card.title} />
            <motion.span className="jx-pain-strike" aria-hidden="true" style={{ scaleX: reduce ? 1 : scaleX }} />
          </span>
        </h3>
        <p className="jx-body jx-pain-body"><Bidi text={card.body} /></p>
      </div>
    </li>
  );
}

export function Pains() {
  const closing = PROBLEM.bridge.split(".")[0] + ".";
  return (
    <section className="jx-section jx-pains" aria-labelledby="jx-pains-h">
      <div className="jx-wrap">
        <div className="jx-pains-head">
          <h2 className="jx-display jx-h2" id="jx-pains-h">{PROBLEM.headline}</h2>
          <p className="jx-body jx-pains-intro">{PROBLEM.intro}</p>
        </div>
        <ol className="jx-pain-list">
          {PROBLEM.cards.map((c, i) => <PainRow key={c.title} card={c} index={i} />)}
        </ol>
        <p className="jx-display jx-h3 jx-pains-close">{closing}</p>
      </div>
    </section>
  );
}

/* ---------- 5. Stats ---------- */

function StatLabel({ text }) {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(text);
  if (!m) return <>{text}</>;
  return <>{m[1]} <span dir="ltr" className="jx-stat-sub">{m[2]}</span></>;
}

export function Stats() {
  return (
    <section className="jx-section jx-stats" aria-labelledby="jx-stats-h">
      <div className="jx-wrap">
        <h2 className="jx-display jx-h2 jx-stats-h" id="jx-stats-h">{SOCIAL_PROOF.headline}</h2>
        <dl className="jx-stat-grid">
          {SOCIAL_PROOF.stats.map((s) => (
            <div className="jx-stat" key={s.label}>
              <dt className="jx-stat-label"><StatLabel text={s.label} /></dt>
              <dd className="jx-stat-num jx-latin" dir="ltr">{statValue(s.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
