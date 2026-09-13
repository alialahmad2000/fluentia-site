/**
 * The level from outside — fluentia-lms pages/student/curriculum/LevelUnits.jsx
 * as a student sees /student/curriculum/level/2, fed from data/unit.json.
 *
 * Stripped: useCurriculumData (auth store + react-query + progress), the tracker,
 * the View Transitions morph and «العودة للمستويات». The page renders the
 * platform's own no-subject branch (previewMode, nobody in front of it): no fake
 * 0% ring, just «12 وحدة في هذا المستوى».
 *
 * Tour additions, both inside the cards' own chrome: the specimen unit carries
 * the platform's «التالية» badge so the one door that opens is obvious, and any
 * other card answers a tap with an in-card note instead of a dead click.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import data from "../data/unit.json";
import { arNum, g, useCinematicMotion } from "../lib/platform";
import "./levelUnits.css";

export const UNIT_PATH = "/tour/unit/extreme-weather";

const CHAPTER_NAMES = [
  { name: "الفصل الأول", theme: "أساسيات" },
  { name: "الفصل الثاني", theme: "توسّع" },
  { name: "الفصل الثالث", theme: "إتقان" },
  { name: "الفصل الرابع", theme: "تطبيق" },
];

function chunkUnits(units, size = 4) {
  const chapters = [];
  for (let i = 0; i < units.length; i += size) {
    const chapterIndex = Math.floor(i / size);
    const cn = CHAPTER_NAMES[chapterIndex] || { name: `الفصل ${arNum(chapterIndex + 1)}`, theme: "" };
    chapters.push({ index: chapterIndex, name: cn.name, theme: cn.theme, units: units.slice(i, i + size) });
  }
  return chapters;
}

// _premiumPrimitives.StatusChip (not_started only — a visitor has no progress)
function StatusChip({ size = "sm" }) {
  const isSmall = size === "sm";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        background: "var(--cinematic-bg-elevated)",
        color: "var(--cinematic-text-faint)",
        border: "1px solid var(--cinematic-border)",
        padding: isSmall ? "2px 10px" : "4px 14px",
        fontSize: isSmall ? "var(--cinematic-body-xs)" : "var(--cinematic-body-sm)",
      }}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--cinematic-text-faint)" }} />
      <span dir="auto">لم يبدأ</span>
    </span>
  );
}

function CoverImage({ src, levelColor }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="fl-squircle" style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${levelColor}, ${levelColor}66)` }} />;
  }
  return <img className="fl-squircle" src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

// The note a locked card shows in place of opening.
function CardPeek({ onOpenSpecimen, compact }) {
  return (
    <div className={`tu-peek${compact ? " tu-peek--compact" : ""}`} role="status" onClick={(e) => e.stopPropagation()}>
      <span className="tu-peek__icon" aria-hidden>
        <Lock size={15} />
      </span>
      <p className="tu-peek__title">هذه الوحدة موجودة داخل المنصة</p>
      <p className="tu-peek__text">الجولة تفتح لك وحدة واحدة كاملة من هذا المستوى.</p>
      <button type="button" className="tu-peek__go" onClick={onOpenSpecimen}>
        افتح «الطقس المتطرف»
        <ArrowLeft size={14} />
      </button>
    </div>
  );
}

function FeaturedCard({ unit, isSpecimen, peek, levelColor, onOpen, onOpenSpecimen, reveal, revealClass = "" }) {
  const hasCover = !!unit.cover_image_url;
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(unit, e);
    }
  };
  return (
    <motion.div
      {...reveal}
      onClick={(e) => onOpen(unit, e)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`الوحدة ${unit.unit_number}: ${unit.theme_ar}`}
      className={`lvx-feat${hasCover ? "" : " lvx-feat--single"} ${revealClass}${isSpecimen ? " tu-specimen" : ""}`}
    >
      {hasCover && (
        <div className="lvx-feat__media">
          <CoverImage src={unit.cover_image_url} levelColor={levelColor} />
        </div>
      )}
      <div className="lvx-feat__body">
        <span className="lvx-feat__num" aria-hidden>
          {unit.unit_number}
        </span>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <StatusChip />
          {isSpecimen && (
            <span className="lvx-next-badge">
              <Sparkles size={12} /> افتحها الآن
            </span>
          )}
        </div>
        <h3 className="lvx-feat__title" dir="auto">
          {unit.theme_ar}
        </h3>
        {unit.theme_en && (
          <p className="lvx-feat__en" dir="ltr">
            {unit.theme_en}
          </p>
        )}
        <div className="lvx-feat__meta">
          {unit.estimated_minutes && (
            <span className="lvx-feat__minutes">
              <Clock size={14} /> ~{unit.estimated_minutes} دقيقة
            </span>
          )}
        </div>
        <span className="lvx-feat__open">
          {g("افتح الوحدة", "افتحي الوحدة")}
          <ArrowLeft size={16} />
        </span>
      </div>
      {peek && <CardPeek onOpenSpecimen={onOpenSpecimen} />}
    </motion.div>
  );
}

function StandardCard({ unit, isSpecimen, peek, levelColor, onOpen, onOpenSpecimen, reveal, revealClass = "" }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(unit, e);
    }
  };
  return (
    <motion.div
      {...reveal}
      onClick={(e) => onOpen(unit, e)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`الوحدة ${unit.unit_number}: ${unit.theme_ar}`}
      className={`lvx-card ${revealClass}${isSpecimen ? " tu-specimen" : ""}`}
    >
      <div className="lvx-card__media">
        <CoverImage src={unit.cover_image_url} levelColor={levelColor} />
        <div className="lvx-card__status">
          <StatusChip size="sm" />
        </div>
        <span className="lvx-card__num" aria-hidden>
          {unit.unit_number}
        </span>
      </div>
      <div className="lvx-card__body">
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 2 }}>
          <h3 className="lvx-card__title" dir="auto">
            {unit.theme_ar}
          </h3>
          {isSpecimen && (
            <span className="lvx-next-badge">
              <Sparkles size={11} /> افتحها الآن
            </span>
          )}
        </div>
        {unit.theme_en && (
          <p className="lvx-card__en" dir="ltr">
            {unit.theme_en}
          </p>
        )}
      </div>
      {peek && <CardPeek onOpenSpecimen={onOpenSpecimen} compact />}
    </motion.div>
  );
}

export default function TourLevel() {
  const navigate = useNavigate();
  const m = useCinematicMotion();
  const { level, level_units: units, unit: specimen } = data;
  const chapters = useMemo(() => chunkUnits(units), [units]);
  const levelColor = level.color || "#38bdf8";
  const [peekId, setPeekId] = useState(null);

  // A peek closes itself, and on any tap outside its card.
  useEffect(() => {
    if (!peekId) return undefined;
    const t = setTimeout(() => setPeekId(null), 6000);
    return () => clearTimeout(t);
  }, [peekId]);

  // The specimen paints the world, as the student's next unit does.
  const worldArt = specimen.cover_image_url;

  const cssScrollDriven = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()");
  const revealClass = !m.reduced && cssScrollDriven ? "fl-reveal-up" : "";
  const reveal =
    m.reduced || cssScrollDriven
      ? {}
      : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

  const openSpecimen = () => navigate(UNIT_PATH);
  const openUnit = (unit) => {
    if (unit.id === specimen.id) openSpecimen();
    else setPeekId((cur) => (cur === unit.id ? null : unit.id));
  };

  return (
    <div dir="rtl" className="lvx-root" onClick={(e) => { if (peekId && !e.target.closest?.(".lvx-card, .lvx-feat")) setPeekId(null); }}>
      {/* ── THE WORLD ── */}
      <div className="tu-stickyframe" aria-hidden>
        <div className="tu-stickyframe__view">
          <div className={`lvx-world${worldArt ? "" : " lvx-world--empty"}`}>
            {worldArt && <div className="lvx-world__far" style={{ backgroundImage: `url(${worldArt})` }} />}
            <div className="lvx-world__near" style={worldArt ? { backgroundImage: `url(${worldArt})` } : undefined} />
            <div className="lvx-world__wash" style={{ background: `linear-gradient(180deg, ${levelColor}55, transparent 60%)` }} />
            <div className="lvx-world__bloom" />
            <div className="lvx-world__motes" />
            <div className="lvx-world__scrim" />
            <div className="lvx-world__grain" />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1160, margin: "0 auto", padding: "0 24px var(--mobile-bottom-clearance, 96px)" }}>
        <section className="tu-lvx-hero" style={{ padding: "64px 0 72px", position: "relative" }}>
          <div className="lvx-watermark" data-text={level.cefr} dir="ltr">
            {level.cefr}
          </div>

          <motion.div {...m.heroEntry}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10" style={{ marginTop: 34 }}>
              <div className="flex-1" style={{ position: "relative" }}>
                <motion.div {...m.fadeUp} className="lvx-eyebrow">
                  <span className="lvx-eyebrow__rule" />
                  <span className="lvx-eyebrow__text">رحلة المستوى</span>
                  <span className="lvx-cefr" dir="ltr">
                    {level.cefr}
                  </span>
                </motion.div>

                <motion.h1 {...m.fadeUp} className="lvx-title">
                  {level.name_ar}
                </motion.h1>

                <motion.div {...m.fadeUp} className="lvx-subtitle">
                  <span className="lvx-subtitle__name" dir="ltr">
                    {level.name_en}
                  </span>
                  <span className="lvx-subtitle__rule" />
                </motion.div>

                {level.description_ar && (
                  <motion.p {...m.fadeUp} className="lvx-desc">
                    {level.description_ar}
                  </motion.p>
                )}

                <motion.div {...m.fadeUp} className="lvx-chips">
                  <span className="lvx-chip">
                    <strong style={{ color: "#f5c842" }} dir="ltr">
                      {units.length}
                    </strong>
                    وحدة في هذا المستوى
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {chapters.map((chapter) => (
          <section key={chapter.index} style={{ marginBottom: 76 }}>
            <motion.div className={`lvx-chapter ${revealClass}`} {...reveal}>
              <div className="lvx-chapter__medal">{arNum(chapter.index + 1)}</div>
              <div className="lvx-chapter__names">
                <span className="lvx-chapter__name" dir="auto">
                  {chapter.name}
                </span>
                {chapter.theme && (
                  <span className="lvx-chapter__theme" dir="auto">
                    — {chapter.theme}
                  </span>
                )}
              </div>
              <span className="lvx-chapter__progress">
                {arNum(0)}/{arNum(chapter.units.length)}
              </span>
              <div className="lvx-chapter__rule" />
            </motion.div>

            {chapter.units[0] && (
              <FeaturedCard
                unit={chapter.units[0]}
                isSpecimen={chapter.units[0].id === specimen.id}
                peek={peekId === chapter.units[0].id}
                levelColor={levelColor}
                onOpen={openUnit}
                onOpenSpecimen={openSpecimen}
                reveal={reveal}
                revealClass={revealClass}
              />
            )}

            {chapter.units.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                {chapter.units.slice(1).map((unit) => (
                  <div className="fl-cq fl-cq-fill" key={unit.id}>
                    <StandardCard
                      unit={unit}
                      isSpecimen={unit.id === specimen.id}
                      peek={peekId === unit.id}
                      levelColor={levelColor}
                      onOpen={openUnit}
                      onOpenSpecimen={openSpecimen}
                      reveal={reveal}
                      revealClass={revealClass}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
