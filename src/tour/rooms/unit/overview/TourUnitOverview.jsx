/**
 * The unit from outside — the V2 unit page (fluentia-lms UnitContent.jsx) at
 * /student/curriculum/unit/:id with no activity open: the cover world behind,
 * the back row, and the Spread.
 *
 * Omitted, all student- or DB-bound: UnitBrief/intro cinematic, Trophy +
 * «استعرض الوحدة» buttons, ClassSummaryView, UnitMasteryCard, the class
 * recording card, the FAB with notes/bookmarks/help, and the ambient particle
 * canvas.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import data from "../data/unit.json";
import CinematicBg from "../shared/CinematicBg";
import UnitSpread from "./UnitSpread";
import { LOCKED_KEYS, STATIONS, TEASERS, sectionPath } from "../shared/stations";
import { useCinematicMotion } from "../lib/platform";

const ACTIVITIES = STATIONS.map((s) => ({ key: s.key, label: s.label, status: "not_started" }));

export default function TourUnitOverview() {
  const navigate = useNavigate();
  const m = useCinematicMotion();
  const [params, setParams] = useSearchParams();
  const openKey = params.get("station");
  const { unit, level } = data;

  const onSelect = (key) => {
    if (LOCKED_KEYS.includes(key)) {
      setParams(openKey === key ? {} : { station: key }, { replace: true });
      return;
    }
    navigate(sectionPath(key));
  };

  // Arriving from a section's station bar with ?station=… : bring that row into view.
  useEffect(() => {
    if (!openKey) return;
    const el = document.getElementById(`station-${openKey}`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "center", behavior: m.reduced ? "auto" : "smooth" });
    }
    // only on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kicker = (
    <>
      المستوى <bdi dir="ltr">{level.cefr}</bdi> — {level.name_ar}
    </>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", position: "relative" }} className="tu-unitpage">
      <CinematicBg coverUrl={unit.cover_image_url} lift />

      <motion.div {...m.heroEntry} className="w-full max-w-7xl mx-auto px-4 py-6 space-y-5" style={{ position: "relative", zIndex: 10 }}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/tour/unit")}
              className="flex items-center gap-1.5 transition-colors font-['Tajawal'] tu-backlink"
              style={{ color: "var(--cinematic-accent-gold)", fontSize: "var(--cinematic-body-sm)", background: "none", border: "none" }}
            >
              <ArrowRight size={16} />
              العودة
            </button>
          </div>
        </div>

        <div>
          <UnitSpread
            activities={ACTIVITIES}
            unit={unit}
            onSelect={onSelect}
            kicker={kicker}
            lockedKeys={LOCKED_KEYS}
            openKey={openKey}
            teasers={TEASERS}
          />
        </div>
      </motion.div>
    </div>
  );
}
