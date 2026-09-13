import { useEffect, useRef } from "react";
import { Navigate, NavLink, Route, Routes, Link } from "react-router-dom";
import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";
import "./lms.generated.css";
import "./room.css";
import GrammarEntry from "./lms/reference/GrammarEntry";
import GrammarTopic from "./lms/grammar/GrammarTopic";
import reference from "./data/reference.json";
import unitLesson from "./data/unit-lesson.json";

/**
 * Grammar room — two real surfaces of the platform, one after the other.
 *
 *   /tour/grammar       «المرجع النحوي»: the entry `present-perfect-vs-past`, whole — both
 *                        coded diagrams, every student section, all six self-check drills
 *                        graded by the platform's own fairGrader.
 *   /tour/grammar/unit  «القواعد داخل الوحدة»: the unit lesson L3 · U4 «passive voice
 *                        (present)» — its explanation UI and five of its sixteen questions,
 *                        one of each type, in a local runner that saves nothing.
 *
 * Each keeps the colour system it has inside the platform: gold on solid obsidian for the
 * reference, sky glass for the unit. The tour's own azure chrome sits between them and says
 * what changed.
 */

const U = unitLesson.unit;

/** The sticky tour bar's height, as --header-height on the room, for every sticky offset. */
function useTourBarHeight(ref) {
  useEffect(() => {
    const bar = document.querySelector(".tour-bar");
    const root = ref.current;
    if (!bar || !root) return;
    const apply = () => root.style.setProperty("--header-height", `${Math.round(bar.getBoundingClientRect().height)}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(bar);
    return () => ro.disconnect();
  }, [ref]);
}

function Chapters() {
  const cls = ({ isActive }) => `grm-ch${isActive ? " is-on" : ""}`;
  return (
    <nav className="tour-chrome grm-chapters" aria-label="جزءا غرفة القواعد" dir="rtl">
      <div className="grm-chapters-in">
        <NavLink end to="/tour/grammar" className={cls}>
          <span className="grm-ch-n" aria-hidden>1</span>
          <span className="grm-ch-body">
            <span className="grm-ch-title">المرجع النحوي</span>
            <span className="grm-ch-sub">قاعدة كاملة بالرسم والأمثلة وستة تمارين</span>
          </span>
        </NavLink>
        <NavLink end to="/tour/grammar/unit" className={cls}>
          <span className="grm-ch-n" aria-hidden>2</span>
          <span className="grm-ch-body">
            <span className="grm-ch-title">القواعد داخل الوحدة</span>
            <span className="grm-ch-sub">درس من المنهج بخمسة أنواع من الأسئلة</span>
          </span>
        </NavLink>
      </div>
    </nav>
  );
}

function ReferenceChapter() {
  const root = useRef(null);
  useTourBarHeight(root);
  return (
    <div ref={root} className="grm-room">
      <TourBar slug="grammar" />
      <RoomIntro slug="grammar">
        قاعدة كاملة من «المرجع النحوي» في طلاقة: رسمها، وأمثلتها، ولماذا يخطئ فيها الناطق بالعربية تحديدًا. ثم تمارين يشرح لك كل خيار فيها لماذا هو صحيح أو خاطئ.
      </RoomIntro>
      <Chapters />

      <main className="grm-stage grm-stage--ref" aria-label="المرجع النحوي">
        <GrammarEntry entry={reference} />
      </main>

      <section className="tour-chrome grm-bridge" dir="rtl" aria-labelledby="grm-bridge-title">
        <div className="grm-bridge-in">
          <span className="grm-bridge-kicker">الجزء الثاني · القواعد داخل الوحدة</span>
          <h2 id="grm-bridge-title" className="grm-bridge-title">وفي كل وحدة، درس قواعد بتمارينه</h2>
          <p className="grm-bridge-text">
            المرجع تعود إليه متى احتجت. أما المنهج فكل وحدة فيه تحمل درس قواعدها: شرح، ثم شرح أعمق، ثم أسئلة تُصحَّح فورًا. جرّب درس «المبني للمجهول» من وحدة «{U.theme_ar}».
          </p>
          <Link to="/tour/grammar/unit" className="tour-btn tour-btn-ghost grm-bridge-go">
            افتح درس الوحدة
            <span aria-hidden>←</span>
          </Link>
        </div>
      </section>

      <TourEnd slug="grammar" />
    </div>
  );
}

function UnitChapter() {
  const root = useRef(null);
  useTourBarHeight(root);
  return (
    <div ref={root} className="grm-room">
      <TourBar slug="grammar" />
      <RoomIntro slug="grammar">
        درس القواعد كما يأتي داخل وحدة من المنهج: الشرح، والشرح الأعمق، والأخطاء الشائعة، ثم أسئلة بخمسة أنواع تُصحَّح فورًا وتشرح لك الإجابة.
      </RoomIntro>
      <Chapters />

      <header className="tour-chrome grm-unit-context" dir="rtl">
        <div className="grm-unit-context-in">
          <p className="grm-crumb">
            <span>المستوى {U.level_number}</span>
            <span className="grm-crumb-sep" aria-hidden />
            <span>الوحدة {U.unit_number}</span>
            <span className="grm-crumb-sep" aria-hidden />
            <span className="grm-crumb-theme">{U.theme_ar}</span>
          </p>
          <p className="grm-unit-context-text">
            هذا الدرس نفسه كما يفتحه الطالب من تبويب «القواعد» في الوحدة. للدرس ستة عشر سؤالًا، وهنا خمسة منها، سؤال من كل نوع. إجاباتك هنا لا تُحفظ.
          </p>
        </div>
      </header>

      <main className="grm-stage grm-stage--unit" aria-label="درس القواعد داخل الوحدة">
        <GrammarTopic topic={unitLesson} />
      </main>

      <TourEnd slug="grammar" />
    </div>
  );
}

export default function Room() {
  return (
    <Routes>
      <Route index element={<ReferenceChapter />} />
      <Route path="unit" element={<UnitChapter />} />
      <Route path="*" element={<Navigate to="/tour/grammar" replace />} />
    </Routes>
  );
}
