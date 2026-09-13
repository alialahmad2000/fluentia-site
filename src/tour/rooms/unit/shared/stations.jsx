/**
 * The unit's six stations as the tour sees them: which open a real section, and
 * what the others do inside the platform (one line each, taken from the unit's
 * own content: its grammar lesson, speaking task and writing task).
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const UNIT_BASE = "/tour/unit/extreme-weather";

// useUnitData ACTIVITY_MAP labels
export const STATIONS = [
  { key: "reading", label: "القراءة", live: true },
  { key: "vocabulary", label: "المفردات", live: true },
  { key: "grammar", label: "القواعد", live: false },
  { key: "listening", label: "الاستماع", live: true },
  { key: "speaking", label: "المحادثة", live: false },
  { key: "writing", label: "الكتابة", live: false },
];

export const LOCKED_KEYS = STATIONS.filter((s) => !s.live).map((s) => s.key);
export const sectionPath = (key) => `${UNIT_BASE}/${key}`;
export const teaserPath = (key) => `${UNIT_BASE}?station=${key}`;

function Teaser({ lead, text, children }) {
  return (
    <div className="tu-teaser">
      <p className="tu-teaser__lead">{lead}</p>
      <p className="tu-teaser__text">{text}</p>
      {children}
    </div>
  );
}

export const TEASERS = {
  grammar: (
    <Teaser
      lead="متاح داخل المنصة"
      text={
        <>
          درس هذه الوحدة هو المضارع التام (<bdi dir="ltr">just · already · yet</bdi>): جداول ومقارنات، ثم تمارين تشرح سبب صحة كل خيار أو خطئه.
        </>
      }
    >
      <Link to="/tour/grammar" className="tu-teaser__link">
        جرّب درس قواعد كاملاً في غرفة القواعد
        <ArrowLeft size={14} />
      </Link>
    </Teaser>
  ),
  speaking: (
    <Teaser
      lead="متاح داخل المنصة"
      text="محادثة صوتية حيّة مع المنصة عن تجربة شخصية في طقس قاسٍ بالمملكة، تنتهي بدرجة وملاحظات مفصّلة على كل جملة."
    />
  ),
  writing: (
    <Teaser
      lead="متاح داخل المنصة"
      text="مقال قصير عن حادثة طقس متطرف، يقيّمه الذكاء الاصطناعي فور تسليمه في القواعد وبناء الجملة، والمفردات، والتنظيم والترابط."
    />
  ),
};
