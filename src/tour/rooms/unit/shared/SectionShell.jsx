/**
 * A unit section as the V2 unit page frames it (fluentia-lms UnitContent.jsx,
 * an activity open): the cover world dimmed behind, «العودة للوحدة», then the
 * «الصفحة» reading plane (unitReadingPlane.css) with its breadcrumb and the
 * ContextRibbon above the tab.
 *
 * The station bar under the breadcrumb is the tour's: the platform moves between
 * sections through the Spread, and a visitor needs to reach the next one from
 * here. It reuses the Spread's own numbering and names, and a station outside
 * the tour leads back to the Spread with its note open.
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import data from "../data/unit.json";
import CinematicBg from "./CinematicBg";
import { STATIONS, UNIT_BASE, sectionPath, teaserPath } from "./stations";
import { useCinematicMotion } from "../lib/platform";
import "./unitReadingPlane.css";

const V1 = {
  accentGold: "var(--cinematic-accent-gold)",
  textDim: "var(--cinematic-text-dim)",
  textFaint: "var(--cinematic-text-faint)",
  bodySm: "var(--cinematic-body-sm)",
};

// missions/missionConstants.ACTIVITY_LABELS_AR
const RIBBON_LABEL = { reading: "القراءة", vocabulary: "المفردات", listening: "الاستماع" };

// components/curriculum/ContextRibbon.jsx
function ContextRibbon({ activityType }) {
  const text = data.unit.activity_ribbons?.[activityType];
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 18px",
        borderRadius: "14px",
        background: "linear-gradient(90deg, rgba(56,189,248,0.07), rgba(251,191,36,0.04))",
        border: "1px solid rgba(255,255,255,0.07)",
        fontFamily: "'Tajawal', sans-serif",
        marginBottom: "20px",
      }}
    >
      <Sparkles size={15} color="var(--cinematic-accent-gold, #fbbf24)" style={{ flexShrink: 0 }} />
      <div style={{ fontSize: "14px", lineHeight: 1.55 }}>
        <span style={{ fontWeight: 800, color: "var(--cinematic-accent-cyan, #22d3ee)" }}>{RIBBON_LABEL[activityType]}:</span>{" "}
        <span style={{ color: "rgba(248,250,252,0.7)" }}>{text}</span>
      </div>
    </motion.div>
  );
}

function StationBar({ active }) {
  const railRef = useRef(null);
  // Keep the current station inside the rail on a narrow screen (rail scroll
  // only — the page itself never moves).
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector(".is-active");
    if (!rail || !chip) return;
    const c = chip.getBoundingClientRect();
    const r = rail.getBoundingClientRect();
    if (c.left < r.left || c.right > r.right) rail.scrollLeft += c.left - r.left - (r.width - c.width) / 2;
  }, [active]);
  return (
    <nav className="tu-stations" aria-label="محطّات الوحدة" dir="rtl" ref={railRef}>
      {STATIONS.map((s, i) => {
        const isActive = s.key === active;
        return (
          <Link
            key={s.key}
            to={s.live ? sectionPath(s.key) : teaserPath(s.key)}
            className={`tu-stations__item${isActive ? " is-active" : ""}${s.live ? "" : " is-locked"}`}
            aria-current={isActive ? "page" : undefined}
            title={s.live ? undefined : "متاح داخل المنصة"}
          >
            <span className="tu-stations__n">{i + 1}</span>
            {s.label}
            {!s.live && <Lock size={11} aria-hidden className="tu-stations__lock" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function SectionShell({ activity, label, children }) {
  const navigate = useNavigate();
  const m = useCinematicMotion();
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", position: "relative" }} className="tu-unitpage">
      <CinematicBg coverUrl={data.unit.cover_image_url} />

      <motion.div {...m.heroEntry} className="w-full max-w-6xl mx-auto px-4 py-6 space-y-5" style={{ position: "relative", zIndex: 10 }}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(UNIT_BASE)}
              className="flex items-center gap-1.5 transition-colors font-['Tajawal'] tu-backlink"
              style={{ color: V1.accentGold, fontSize: V1.bodySm, background: "none", border: "none" }}
            >
              <ArrowRight size={16} />
              العودة للوحدة
            </button>
          </div>
        </div>

        <div className="unit-page">
          <div className="flex items-center gap-2 mb-4 font-['Tajawal']" style={{ color: V1.textDim, fontSize: V1.bodySm }}>
            <button type="button" onClick={() => navigate(UNIT_BASE)} style={{ color: V1.accentGold, background: "none", border: "none", cursor: "pointer" }} className="font-['Tajawal']">
              الوحدة
            </button>
            <span style={{ color: V1.textFaint }}>›</span>
            <span>{label}</span>
          </div>
          <StationBar active={activity} />
          <ContextRibbon activityType={activity} />
          {children}
        </div>
      </motion.div>
    </div>
  );
}
