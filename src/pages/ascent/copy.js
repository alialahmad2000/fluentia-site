/**
 * The only copy /ascent adds — verbatim from the brief (FLUENTIA-ASCENT-LANDING §5).
 * Everything else on the page is the homepage's own content (landing-v2/content.js)
 * or is rendered by the homepage's own components.
 */

export const INTRO = ["الطلاقة قمّة.", "ولكل قمّة طريق."];

/** Six camps. `alt` is the altitude the HUD counts to. */
export const CAMPS = [
  { id: "base", name: "المعسكر الأساسي", alt: 5364 },
  { id: "icefall", name: "شقوق الجليد", alt: 5800 },
  { id: "basin", name: "الهضبة", alt: 6400 },
  { id: "rope", name: "الحبل الثابت", alt: 7200 },
  { id: "high", name: "المنطقة العالية", alt: 8000 },
  { id: "summit", name: "القمّة", alt: 8849 },
];
export const METRE = "م";

export const TITLES = {
  base: ["ابدأ صعودك", "نحو الطلاقة"],
  icefall: ["شقوق الجليد"],
  basin: ["الهضبة"],
  rope: ["الحبل الثابت"],
  high: ["المنطقة العالية"],
  summit: ["القمّة", "أن تتكلم بلا تردّد"],
  below: ["قبل أن تبدأ"],
};

export const LINES = {
  base: "هنا يقف أكثر الناس: يفهمون الإنجليزية، ولا يتكلمونها.",
  icefall: "الخوف من الخطأ، الكلمات التي تهرب، القواعد التي لا تثبت. نعبرها معك خطوة خطوة.",
  basin: "هنا يتوقف تقدّم الكثيرين. المنصّة تُبقيك تمشي كل يوم.",
  rope: "لا أحد يصعد هذا الجدار وحده. معك مدرّب يثبّت كل خطوة.",
  high: "مقابلة، اختبار، اجتماع بالإنجليزية. هنا يظهر أثر الصعود.",
};

export const PRICING_TITLE = "اختر مسار صعودك";
export const FINAL_TITLE = "ابدأ صعودك";

/* The header's small button — the brief's label for the same lead action. */
export const HEADER_CTA = "احجز لقاءك المبدئي";

export const SOUND_ON = "الصوت";
export const SOUND_OFF = "بدون صوت";

export const PERF_LABEL = "وضع الأداء:";
export const PERF_OPTIONS = [
  { value: "auto", label: "تلقائي" },
  { value: "high", label: "كامل" },
  { value: "low", label: "خفيف" },
];
