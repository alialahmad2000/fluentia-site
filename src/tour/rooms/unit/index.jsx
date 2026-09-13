import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";
import "./lms.generated.css";
import "./tour-unit.css";
import TourLevel from "./level/TourLevel";
import TourUnitOverview from "./overview/TourUnitOverview";
import TourReading from "./sections/reading/TourReading";
import TourListening from "./sections/listening/TourListening";
import TourVocab from "./sections/vocabulary/TourVocab";

/**
 * Room 1 — «الوحدة الدراسية».
 *
 *   /tour/unit                             the level page from outside (A2, 12 units)
 *   /tour/unit/extreme-weather             the unit page: the Spread
 *   /tour/unit/extreme-weather/reading     Reading A + B (?r=b)
 *   /tour/unit/extreme-weather/listening   the dialogue
 *   /tour/unit/extreme-weather/vocabulary  117 word cards
 *
 * Specimen: A2 · Unit 3 «الطقس المتطرف» (curriculum_units 6527e32e-…), from the
 * ordinary curriculum, snapshotted into data/unit.json by
 * scripts/tour/unit/build-snapshot.mjs.
 */

const INTRO = {
  level: "هذه صفحة المستوى الثاني كما يفتحها الطالب: اثنتا عشرة وحدة في أربعة فصول. افتح «الطقس المتطرف» وتجوّل داخلها.",
  overview: "هذه صفحة الوحدة: أهدافها، وستّ محطّات يمرّ بها الطالب بالترتيب. القراءة والمفردات والاستماع مفتوحة لك هنا.",
  reading: "مقالان حقيقيان من الوحدة. اضغط على أي كلمة لتسمعها وترى معناها، ثم أجب عن الأسئلة واستعن بالتلميح.",
  listening: "حوار من الوحدة بين ليلى ونور. شغّله، وأظهر النص إن احتجت، ثم أجب؛ كل تلميح يعيدك إلى المقطع الذي فيه الإجابة.",
  vocabulary: "مفردات الوحدة كلها، كل كلمة ببطاقتها ونطقها. اضغط على السمّاعة لتسمع الكلمة.",
};

function introFor(pathname) {
  if (/\/reading/.test(pathname)) return INTRO.reading;
  if (/\/listening/.test(pathname)) return INTRO.listening;
  if (/\/vocabulary/.test(pathname)) return INTRO.vocabulary;
  if (/\/extreme-weather/.test(pathname)) return INTRO.overview;
  return INTRO.level;
}

export default function Room() {
  const rootRef = useRef(null);
  const { pathname, search } = useLocation();

  // Moving between the room's own pages (level → unit → section) lands on the
  // content, not on the room intro again. The first arrival keeps the intro.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const root = rootRef.current;
    const bar = document.querySelector(".tour-bar");
    // ?station=… scrolls its own row into view on the Spread.
    if (!root || /station=/.test(search)) return;
    const top = root.getBoundingClientRect().top + window.scrollY - (bar ? bar.getBoundingClientRect().height : 0);
    window.scrollTo(0, Math.max(0, top));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // The platform offsets its sticky rails by --header-height; in the tour the
  // header is the TourBar, so publish its live height on the room.
  useEffect(() => {
    const bar = document.querySelector(".tour-bar");
    const root = rootRef.current;
    if (!bar || !root || typeof ResizeObserver === "undefined") return undefined;
    const set = () => root.style.setProperty("--header-height", `${Math.round(bar.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <TourBar slug="unit" />
      <RoomIntro slug="unit">{introFor(pathname)}</RoomIntro>
      <main className="tour-unit" ref={rootRef} dir="rtl">
        <Routes>
          <Route index element={<TourLevel />} />
          <Route path="extreme-weather" element={<TourUnitOverview />} />
          <Route path="extreme-weather/reading" element={<TourReading />} />
          <Route path="extreme-weather/listening" element={<TourListening />} />
          <Route path="extreme-weather/vocabulary" element={<TourVocab />} />
          <Route path="*" element={<Navigate to="/tour/unit" replace />} />
        </Routes>
      </main>
      <TourEnd slug="unit" />
    </>
  );
}
