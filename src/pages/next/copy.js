/**
 * The only copy /next adds. Everything else on the page is imported from the
 * homepage's own content (landing-v2/content.js) or rendered by its components.
 *
 * CTA_LABEL is the label the brief fixed for the primary action; the same
 * phrase already runs on /join's form and /start. It opens the homepage's lead
 * modal through `[data-open-form]`, exactly like the homepage button.
 */
export const CTA_LABEL = "احجز لقاءك المبدئي";

export const HERO_LINES = [
  { text: "نُزيل ما يمنعك", tone: "cream" },
  { text: "من امتلاك الإنجليزية", tone: "ice" },
];
export const SEE_INSIDE = "شاهد المنصة من الداخل";

export const TITLES = {
  pains: [
    { text: "العائق", tone: "cream" },
    { text: "ليس أنت", tone: "ice" },
  ],
  how: [
    { text: "كيف", tone: "cream" },
    { text: "نُزيله", tone: "sky" },
  ],
  stats: [
    { text: "الأرقام", tone: "cream" },
    { text: "كما هي", tone: "gold" },
  ],
  between: [
    { text: "بين", tone: "cream" },
    { text: "الحصص", tone: "sky" },
  ],
  pricing: [
    { text: "اختر", tone: "cream" },
    { text: "مسارك", tone: "gold" },
  ],
  faq: [
    { text: "أسئلة", tone: "cream" },
    { text: "صريحة", tone: "ice" },
  ],
  final: [
    { text: "لنبدأ", tone: "cream" },
    { text: "بلقاء مبدئي", tone: "sky" },
  ],
};

export const PERF_LABEL = "وضع الأداء:";
export const PERF_OPTIONS = [
  { value: "auto", label: "تلقائي" },
  { value: "high", label: "كامل" },
  { value: "low", label: "خفيف" },
];
