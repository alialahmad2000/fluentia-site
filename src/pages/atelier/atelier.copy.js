// ============================================================================
// Atelier page — founder-authored [NEW] copy (verbatim from the brief).
// [SOURCE COPY] sections import live copy from ../landing-v2/content instead.
// MAX_STUDENTS is centralized. Founder confirmed 12 (matches live content.js
// pricing) — keeps the whole /atelier page consistent with the pricing cards.
// ============================================================================

export const MAX_STUDENTS = 12;

export const WORDMARK = "Fluentia";
export const HERO_EN = "Speak it — don’t memorize it.";
export const CTA_LABEL = "احجز لقاءك المبدئي المجاني";

export const TRUST_CHIPS = [
  "طبيب مؤسس",
  "مدرب سعودي متخصص",
  `${toArabic(MAX_STUDENTS)} طلاب كحد أقصى للمجموعة`,
  "متابعة يومية",
  "منصّة تعليمية متكاملة",
];

export const FOUNDER_LETTER = {
  eyebrow: "رسالة من المؤسس",
  name: "د. علي الأحمد",
  role: "طبيب · مؤسس أكاديمية طلاقة · مدرّب",
  paragraphs: [
    "بدأتُ طلاقة لأنني رأيت ما يكفي من النّاس يدرسون الإنجليزية سنوات… ثم يقفون عاجزين عن جملةٍ واحدة أمام موقفٍ حقيقي. المشكلة ليست فيهم، بل في طريقةٍ تُدرَّس بها اللغة: صفوفٌ مزدحمة، ومتابعةٌ غائبة، ومحتوىً لا يراعي كيف يتعلّم الدماغ فعلاً.",
    "وكطبيب، تعوّدتُ أن أبني القرار على الدليل لا على العادة — فنقلتُ هذا إلى طلاقة: مجموعاتٌ صغيرة، ومتابعةٌ يوميةٌ شخصية، ومنهجٌ مبنيٌّ على علم اللغة والنفس والأعصاب، لا على الحشو.",
    "لا أَعِدك بمعجزة. أَعِدك بطريقٍ واضح، ومدرّبٍ يعرفك بالاسم، ويمشي معك خطوةً بخطوة حتى تتكلّم بثقة.",
  ],
  signatureEn: "— Dr. Ali Alahmad",
  signatureAr: "— د. علي",
};

export const TRANSFORM = {
  before: "ما كنت أتكلم ولا أقرأ",
  after: "والحين أقدر أتكلم وأقرأ بأقل من ١٠ دقايق",
  name: "الجوهرة",
  context: "ثالث ثانوي",
};

// The 7 real testimonials (verbatim from the brief — the canonical set).
export const TESTIMONIALS = [
  { name: "الجوهرة", context: "ثالث ثانوي", quote: "ما كنت أتكلم ولا أقرأ والحين أقدر أتكلم وأقرأ بأقل من ١٠ دقايق!", tag: "قصة نجاح" },
  { name: "ليان", context: "جامعة الملك سعود", quote: "نتعلم كل المهارات الأربع والشرح بالقرامر ماشي خطوه بخطوه والفعاليات رهيبة!", tag: "القرامر" },
  { name: "الهنوف", context: "English Level 2", quote: "فرق كبير بين مستواي بالبداية واللحين! متابعة دائماً والمجموعة بسيطة.", tag: "تقدم سريع" },
  { name: "هوازن", context: "دورة IELTS", quote: "الدكتور علي يتميّز بأسلوبه الراقي والمحفّز. مثال في المهنية والتمكن العلمي.", tag: "IELTS" },
  { name: "فيصل", context: "جامعة الملك سعود", quote: "الأنشطة والألعاب ومشروعات السبيكنج والكلاسات الخصوصيه. جزيل الشكر!", tag: "سبيكنج" },
  { name: "مها", context: "طالبة تمريض", quote: "كتاب الـGrammar رهيب! والمصطلحات مره كويسه. بإذن الله نهكر اللغه!", tag: "القرامر" },
  { name: "لمى", context: "جامعة الملك عبدالعزيز", quote: "القرامر والأزمنة للحين أتذكرها! والأكسنت حلو ويعلمنا نطق الكلمات صح.", tag: "النطق" },
];

// Honest structural facts only (brief section 10).
export const STATS = [
  { value: MAX_STUDENTS, label: "حد أقصى للطلاب في المجموعة" },
  { value: 8, label: "ساعات تدريب شهرياً" },
  { value: 4, label: "مهارات نطوّرها" },
  { display: "يومياً", label: "متابعة وتصحيح" },
];

// Comparison — Fluentia vs traditional institutes. Dimensions from the brief;
// "us" values reflect the real model, "them" kept general (no fabricated competitor claims).
export const COMPARISON = {
  eyebrow: "الفرق الحقيقي",
  title: "Fluentia مقابل المعاهد",
  columns: { us: "Fluentia", them: "المعاهد التقليدية" },
  rows: [
    { label: "عدد الطلاب في المجموعة", us: `${toArabic(MAX_STUDENTS)} كحد أقصى`, them: "٢٠ – ٣٠" },
    { label: "متابعة يومية", us: "نعم", them: "نادراً" },
    { label: "المدرب", us: "سعودي متخصص", them: "يختلف" },
    { label: "فهم شخصية الطالب", us: "أساس في المنهج", them: "غالباً لا" },
    { label: "حصص فردية", us: "متاحة", them: "نادراً" },
    { label: "المنصة التعليمية", us: "متكاملة + تقييم AI", them: "مجموعة دردشة غالباً" },
    { label: "الالتزام", us: "شهري · إلغاء بأي وقت", them: "عقود طويلة" },
  ],
};

export function toArabic(input) {
  return String(input).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}
