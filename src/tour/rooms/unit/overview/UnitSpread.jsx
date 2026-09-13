/**
 * fluentia-lms pages/student/curriculum/unit-v2/spread/UnitSpread.jsx — the unit
 * overview every student opens: a printed spread, identity on the right leaf,
 * the index of stations on the left.
 *
 * Same markup, classes and motion. Changes for the tour:
 *   • useG/useGenderize → the masculine-generic shim (a visitor has no gender).
 *   • A station the tour does not include keeps its row and its number, marks
 *     itself «داخل المنصة» instead of «لم يبدأ», and opens a note under the row
 *     saying what happens there (the `teasers` prop) — never a dead click.
 */
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { arNum, g, useCinematicMotion } from "../lib/platform";
import "./spread.css";

// scene/sceneConfig.js — display order of the six stations.
export const SCENE_BEATS = [
  { key: "reading" },
  { key: "vocabulary" },
  { key: "grammar" },
  { key: "listening" },
  { key: "speaking" },
  { key: "writing" },
];

const toAr = arNum;
const whyFor = (unit, key) => unit?.activity_ribbons?.[key] || "";

function StatusMark({ status, locked }) {
  if (locked) {
    return (
      <span className="sp-st todo tu-st-locked">
        <Lock size={11} aria-hidden /> داخل المنصة
      </span>
    );
  }
  if (status === "completed") return <span className="sp-st done">مكتمل ✓</span>;
  if (status === "in_progress") return <span className="sp-st live">قيد التعلّم</span>;
  return <span className="sp-st todo">{g("لم يبدأ", "لم تبدئي")}</span>;
}

function Station({ activity, num, here, onSelect, why, reduced, idx, locked, open }) {
  const done = activity.status === "completed";
  return (
    <motion.button
      type="button"
      className={`sp-item ${here ? "now" : ""} ${done ? "done" : ""}${locked ? " tu-locked" : ""}${open ? " tu-open" : ""}`}
      onClick={() => onSelect(activity.key)}
      aria-expanded={locked ? open : undefined}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: idx * 0.045, ease: "easeOut" }}
    >
      <span className="sp-n">{toAr(num)}</span>
      <span className="sp-b">
        <span className="sp-t">{activity.label}</span>
        {why && <span className="sp-s">{why}</span>}
        {here && (
          <span className="sp-go">
            {g("تابع من هنا", "تابعي من هنا")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </span>
        )}
      </span>
      <StatusMark status={activity.status} locked={locked} />
    </motion.button>
  );
}

export default function UnitSpread({ activities, unit, onSelect, progress, kicker, lockedKeys = [], openKey = null, teasers = {} }) {
  const { reduced } = useCinematicMotion();

  const byKey = useMemo(() => {
    const m = {};
    for (const a of activities || []) m[a.key] = a;
    return m;
  }, [activities]);

  const stations = useMemo(() => SCENE_BEATS.map((b) => (byKey[b.key] ? { key: b.key, activity: byKey[b.key] } : null)).filter(Boolean), [byKey]);
  if (!stations.length) return null;

  const total = stations.length;
  const doneCount = stations.filter((s) => s.activity.status === "completed").length;
  const hereKey = (stations.find((s) => s.activity.status !== "completed") || {}).key || null;
  const pct = progress?.percentage ?? (total ? Math.round((doneCount / total) * 100) : 0);

  const unitNo = unit?.custom_sort ?? unit?.unit_number;
  const title = unit?.theme_ar || "";
  const titleEn = unit?.theme_en || "";
  const desc = unit?.description_ar || "";
  const why = unit?.why_matters || "";
  const outcomes = Array.isArray(unit?.outcomes) ? unit.outcomes.filter(Boolean) : [];
  const cover = unit?.cover_image_url;

  return (
    <div className="spread-root" dir="rtl">
      <motion.article
        className="sp-page"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="sp-spread">
          {/* ── LEAD LEAF: identity ── */}
          <section className="sp-lead">
            <div className="sp-kicker">
              <span className="r" aria-hidden />
              {kicker}
              {unitNo ? <> · الوحدة {toAr(unitNo)}</> : null}
            </div>

            {cover && (
              <div className="sp-plate">
                <img src={cover} alt="" />
                {unitNo ? (
                  <span className="sp-numeral" aria-hidden>
                    {toAr(unitNo)}
                  </span>
                ) : null}
              </div>
            )}

            {title && <h2 className="sp-title">{title}</h2>}
            {titleEn && (
              <div className="sp-en" dir="ltr">
                {titleEn}
              </div>
            )}

            <div className="sp-rule" aria-hidden />

            {desc && <p className="sp-desc">{desc}</p>}
            {why && (
              <blockquote className="sp-pull">
                <p>{why}</p>
              </blockquote>
            )}

            {outcomes.length > 0 && (
              <div className="sp-out">
                <h4>بنهاية هذه الوحدة</h4>
                <ul>
                  {outcomes.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ── INDEX LEAF: the stations ── */}
          <section className="sp-index">
            <div className="sp-index-head">
              <h3>محطّات الوحدة</h3>
              <span className="sp-prog">
                {toAr(doneCount)} من {toAr(total)} محطّات
              </span>
            </div>
            <div className="sp-pbar" aria-hidden>
              <i style={{ width: `${pct}%` }} />
            </div>

            {stations.map((s, i) => {
              const locked = lockedKeys.includes(s.key);
              const open = locked && openKey === s.key;
              return (
                <div key={s.key} className="tu-station" id={`station-${s.key}`}>
                  <Station
                    activity={s.activity}
                    num={i + 1}
                    here={s.key === hereKey}
                    onSelect={onSelect}
                    why={whyFor(unit, s.key)}
                    reduced={reduced}
                    idx={i}
                    locked={locked}
                    open={open}
                  />
                  <AnimatePresence initial={false}>
                    {open && teasers[s.key] && (
                      <motion.div
                        key="teaser"
                        className="tu-teaser-wrap"
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                      >
                        {teasers[s.key]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </section>
        </div>
      </motion.article>
    </div>
  );
}
