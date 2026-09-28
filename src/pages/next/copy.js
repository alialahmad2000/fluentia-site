/**
 * The only copy /next adds. Everything else on the page is imported from the
 * homepage's own content (landing-v2/content.js) or rendered by its components.
 *
 * CTA_LABEL is the label the brief fixed for the primary action; the same
 * phrase already runs on /join's form and /start. It opens the homepage's lead
 * modal through `[data-open-form]`, exactly like the homepage button.
 */
export const CTA_LABEL = "احجز لقاءك المبدئي";

// `mbreak`: on a phone each line breaks after that many words. Fixed breaks, so
// the layout never depends on which font has loaded (no re-wrap, no shift).
export const HERO_LINES = [
  { text: "نُزيل ما يمنعك", tone: "cream", mbreak: 2 },
  { text: "من امتلاك الإنجليزية", tone: "ice", mbreak: 2 },
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
  steps: [
    { text: "كيف", tone: "cream" },
    { text: "تبدأ", tone: "ice" },
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

/* ── /join (campaign mode) only ── */

// «كيف تبدأ» — Ali's locked copy from the /join brief (2026-09-26).
export const STEPS = [
  { title: "سجّل بياناتك", body: "اسمك ورقمك، 30 ثانية." },
  { title: "لقاء مبدئي مجاني", body: "نعرف مستواك وهدفك ووقتك، ونرشّح لك المسار والباقة المناسبة." },
  { title: "تبدأ مع مدرّبك", body: "حصص فردية، أنت ومدرّبك فقط، بمنهج مبني على هدفك ومجالك، وتدخل المنصّة من أول يوم." },
];
export const STEPS_LEDE = "لقاء مبدئي مجاني قبل أي دفع، وبدون التزام.";

// The homepage's platform tagline ends in an English word; paid traffic reads Arabic.
export const CAMPAIGN_PLATFORM_TAGLINE = "بُنيت من الصفر: تقييم فوري بالذكاء الاصطناعي، متابعة لتقدّمك، وتحديات تحمّسك.";
// The homepage pricing footer names Dr. Ali, who no longer teaches (2026-09-21).
export const CAMPAIGN_PRICING_FOOT = "محتار بين الباقتين؟ نرشّح لك الأنسب في اللقاء المبدئي.";
// /join sells the 1:1 programmes only (Ali, 2026-09-28): pricing shows the two
// individual cards, the form lists only them and opens on التدريب الفردي.
export const SOLO_PRICING = {
  headline: "تدريب فردي. أنت ومدرّبك فقط.",
  intro: "بدون قاعة ولا زملاء. منهج مبني على هدفك ومجالك، ومدرّب يتابعك كل يوم. وتبدأ بلقاء مبدئي مجاني قبل أن تدفع أي شيء.",
};
export const SOLO_FORM_SUB = "للتدريب الفردي. 30 ثانية، ونتواصل معك على واتساب خلال ساعات.";
export const STICKY_NOTE = "مجاني وبدون التزام";
