import { useEffect, useRef } from "react";
import Giant from "./Giant";
import { track } from "./scroll";
import { BARRIER_HEADS, BARRIER_ROWS, BARRIER_TITLE, CTA_LABEL, TITLES, STEPS, STEPS_LEDE } from "./copy";

/**
 * The three "acts": a two-line giant title that slides in from the right edge
 * while its words rise, then stays sticky (desktop) while the content column
 * scrolls past. On a phone the title reveals at the top and scrolls away.
 * Every word of content is the homepage's, from landing-v2/content.js.
 */

function Act({ id, title, lede, children, className = "" }) {
  return (
    <section id={id} className={`fx-act ${className}`}>
      <div className="fx-act-grid">
        <div className="fx-act-head">
          <Giant lines={title} className="fx-act-title" />
          {lede ? <p className="fx-act-lede fx-rv fx-fade">{lede}</p> : null}
        </div>
        <div className="fx-act-body">{children}</div>
      </div>
    </section>
  );
}

/* ── العائق ليس أنت — each old pain paired with our answer, all visible.
   Desktop: pain → connector → answer on one line; a phone stacks them. ── */
export function Barrier() {
  return (
    <section id="fx-barrier" className="fx-act fx-barrier" aria-labelledby="fx-barrier-h">
      <div className="fx-barrier-wrap">
        <Giant id="fx-barrier-h" lines={BARRIER_TITLE} className="fx-barrier-title" />
        <div className="fx-barrier-heads fx-rv fx-fade" aria-hidden="true">
          <span>{BARRIER_HEADS.pain}</span>
          <span>{BARRIER_HEADS.answer}</span>
        </div>
        <ol className="fx-barrier-rows">
          {BARRIER_ROWS.map((r, i) => (
            <li key={r.key} className="fx-brow fx-rv fx-fade" style={{ "--d": `${i * 140}ms` }}>
              <span className="fx-num fx-brow-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="fx-brow-pain">
                <span className="fx-sr">{BARRIER_HEADS.pain}: </span>
                {r.pain}
              </p>
              <span className="fx-brow-link" aria-hidden="true">
                <i />
              </span>
              <p className="fx-brow-answer">
                <span className="fx-sr">{BARRIER_HEADS.answer}: </span>
                <strong>{r.key}</strong> — {r.answer}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── الأرقام كما هي — real impact numbers from the platform, 2×2, each one
   counting up once when it scrolls in. No bars: none of these numbers has an
   honest maximum to draw against. ── */

/**
 * IMPACT_STATS — computed 2026-11-16 (read-only) from the Fluentia LMS DB, all
 * time, real students only (role student, not is_test_account / AI assistant,
 * no `records+` archive rows). Rounded DOWN, never up. Refresh by re-running:
 *  - minutes:    sum(student_daily_activity.learning_seconds) / 60 = 12,214
 *  - answers:    graded answers in student_curriculum_progress (reading,
 *                grammar, listening, vocab exercises) + verb, spelling,
 *                library, homework, study-sheet and skill attempts = 8,756
 *  - words:      vocabulary_word_mastery rows mastered (all 3 exercises) = 7,930
 *  - recordings: speaking_recordings + voice turns in speaking conversations
 *                (142 + 379) = 521
 */
export const IMPACT_STATS = [
  { to: 12000, label: "دقيقة مذاكرة على المنصّة" },
  { to: 8700, label: "سؤال أجاب عليه طلابنا" },
  { to: 7900, label: "كلمة تعلّمها طلابنا" },
  { to: 500, label: "تسجيل صوتي من طلابنا" },
];
export const IMPACT_NOTE = "أرقام حقيقية من منصّة طلاقة — تُحدَّث دورياً";

const fmt = (n) => n.toLocaleString("en-US");
const COUNT_MS = 1500;

export function Stats({ still = false, bars = false }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const rows = [...list.querySelectorAll("[data-to]")];
    const showFinal = () =>
      rows.forEach((r) => {
        r.querySelector(".fx-stat-n").textContent = fmt(Number(r.dataset.to));
      });
    // The tier can resolve to low after mount: a still page always shows the real values.
    if (still || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      showFinal();
      return undefined;
    }
    const rafs = new Set();
    // Numbers not yet on screen start from zero; the prerender carries the real values.
    rows.forEach((r) => {
      const rect = r.getBoundingClientRect();
      if (rect.top > window.innerHeight) r.querySelector(".fx-stat-n").textContent = "0";
      else r.dataset.done = "";
    });
    const run = (row) => {
      const to = Number(row.dataset.to);
      const out = row.querySelector(".fx-stat-n");
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / COUNT_MS);
        const e = 1 - Math.pow(1 - k, 4);
        out.textContent = fmt(Math.round(to * e));
        if (k < 1) {
          const id = requestAnimationFrame(step);
          rafs.add(id);
        }
      };
      rafs.add(requestAnimationFrame(step));
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || e.target.dataset.done !== undefined) return;
          e.target.dataset.done = "";
          io.unobserve(e.target);
          run(e.target);
        });
      },
      { threshold: 0.4 }
    );
    rows.forEach((r) => r.dataset.done === undefined && io.observe(r));
    return () => {
      io.disconnect();
      rafs.forEach((id) => cancelAnimationFrame(id));
      rows.forEach((r) => delete r.dataset.done);
    };
  }, [still]);

  return (
    <section id="fx-stats" className="fx-act fx-act--stats fx-impact" aria-labelledby="fx-stats-h">
      <div className="fx-impact-wrap">
        <Giant id="fx-stats-h" lines={TITLES.stats} className="fx-impact-title" />
        <ul ref={listRef} className="fx-stats fx-impact-grid">
          {IMPACT_STATS.map((s, i) => (
            <li key={s.label} className="fx-stat fx-impact-cell fx-rv" data-to={s.to} style={{ "--d": `${i * 120}ms` }}>
              <span className="fx-stat-num" dir="ltr">
                <span className="fx-stat-pre">+</span>
                <span className="fx-stat-n">{fmt(s.to)}</span>
              </span>
              <span className="fx-stat-label">{s.label}</span>
              {/* /join keeps its launch layout (bars) until it is switched to the showcase */}
              {bars ? (
                <span className="fx-bar" aria-hidden="true">
                  <i />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="fx-impact-note fx-rv fx-fade">{IMPACT_NOTE}</p>
      </div>
    </section>
  );
}

/* ── كيف تبدأ — /join only: what happens after the form, in the pains' own layout ── */
export function Steps() {
  const listRef = useRef(null);
  useEffect(() => track(listRef.current, { mode: "through" }), []);
  return (
    <Act id="fx-steps" title={TITLES.steps} lede={STEPS_LEDE}>
      <ol ref={listRef} className="fx-pains">
        {STEPS.map((s, i) => (
          <li key={s.title} className="fx-pain fx-rv fx-fade">
            <span className="fx-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="fx-pain-title">{s.title}</h3>
            <p className="fx-pain-body">{s.body}</p>
          </li>
        ))}
      </ol>
      <button type="button" data-open-form className="fx-btn fx-btn--primary fx-steps-cta fx-rv fx-fade">
        {CTA_LABEL}
        <span aria-hidden="true">←</span>
      </button>
    </Act>
  );
}
