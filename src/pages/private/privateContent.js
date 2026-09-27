/**
 * /private copy + data. Two sources only, and nothing invented:
 *   - PRICING (landing-v2/content.js) — both 1:1 packages: ids, names, prices,
 *     the 2,000 plan's features and pricing note.
 *   - Ali's spec for the intensive plan (FLUENTIA-PRIVATE-PAGE-AND-CARDS, §2):
 *     12 private classes + 8 practice sessions a month, the academic mentor
 *     (usually a native speaker, a different person from the teacher), the long
 *     diagnostic session, the full platform, one month ≈ 3 months of a
 *     traditional course.
 * Items the repo does NOT state for the 2,000 plan (mentor, platform access)
 * are tagged «في الفردي المكثّف» rather than claimed for both.
 *
 * Prices are monthly only — no per-day figure anywhere (owner's call, 2026-09-27).
 */
import { PRICING } from "../landing-v2/content";

const vip = PRICING.vipTier;
const intensive = PRICING.intensiveTier;

export const fmt = (n) => n.toLocaleString("en-US");

/** The two packages the form and the comparison offer. Intensive first: it is the default. */
export const PACKAGES = [
  { id: intensive.id, name: intensive.name, short: "الفردي المكثّف", price: intensive.price, priceFrom: false },
  { id: vip.id, name: vip.name, short: "الفردي", price: vip.priceLow, priceFrom: true },
];
export const DEFAULT_PKG = intensive.id;

export const CTA = "احجز استشارتك";
export const INTENSIVE_TAG = "في الفردي المكثّف";

export const HERO = {
  badge: "التدريب الفردي · VIP",
  h1: "برنامج إنجليزي مبني عليك أنت.",
  sub: "معلم خاص، مرشد أكاديمي يتابعك، ومنهج نصممه لمجالك من الصفر. لمن يبي أسرع تقدّم ممكن.",
  secondary: "قارن الباقتين",
};

/** The orbit around «أنت». Angles are degrees clockwise from 12 o'clock. */
export const ORBIT = [
  { id: "teacher", label: "معلمك الخاص", angle: -50, tone: "sky" },
  { id: "mentor", label: "مرشدك الأكاديمي", angle: 50, tone: "gold" },
  { id: "curriculum", label: "منهجك المصمم", angle: 130, tone: "gold" },
  { id: "platform", label: "المنصّة", angle: 230, tone: "sky" },
];

export const TEAM = {
  label: "فريقك",
  h2: "فريق كامل حولك",
  intro: "ما تتعلم لحالك، ولا يتعلم معك أحد. يشتغل عليك اثنين، كل واحد بدوره، على منهج مبني لك.",
  items: [
    {
      icon: "teacher",
      title: "معلمك الخاص",
      body: "حصص فردية أنت ومعلمك فقط، بمعلم مخصّص لك طوال اشتراكك.",
    },
    {
      icon: "mentor",
      title: "مرشدك الأكاديمي",
      body: "غالباً متحدث أصلي للغة. يوجّهك ويتابعك، ويعطيك جلسات ممارسة خاصة تستهدف نقاط ضعفك بالذات.",
      note: "وهو شخص مختلف عن معلمك، عشان يشتغل عليك اثنين كل واحد بدوره.",
      tag: INTENSIVE_TAG,
    },
    {
      icon: "platform",
      title: "منصّة طلاقة كاملة",
      body: "كل المنصّة التعليمية مفتوحة لك طوال اشتراكك.",
      tag: INTENSIVE_TAG,
    },
  ],
};

export const CURRICULUM = {
  label: "المنهج",
  h2: "منهج نصممه لك، مو كتاب جاهز",
  intro: "تصميم منهجك شغل دقيق: يبدأ منك أنت، من مجالك ومواقفك الحقيقية، ويتعدّل معك أول بأول.",
  steps: [
    {
      title: "جلسة تشخيص مطوّلة",
      body: "نجلس معك ونحدد بالضبط: وش تحتاج الإنجليزي فيه، وين تتعثر اليوم، ووش النتيجة اللي تبيها.",
    },
    {
      title: "تصميم منهجك",
      body: "نبني منهج على مجالك ومواقفك الحقيقية، عشان أثر التعلم يبان بسرعة في شغلك أو دراستك.",
    },
    {
      title: "تعديل مستمر",
      body: "مرشدك يتابع تقدمك ويعدّل الخطة على نقاط ضعفك أول بأول.",
    },
  ],
};

export const WEEK = {
  label: "أسبوعك",
  h2: "شكل أسبوعك",
  intro: "في الفردي المكثّف.",
  days: [
    { day: "الأحد", kind: "class" },
    { day: "الإثنين", kind: "practice" },
    { day: "الثلاثاء", kind: "class" },
    { day: "الأربعاء", kind: "practice" },
    { day: "الخميس", kind: "class" },
  ],
  chips: {
    class: { title: "حصة فردية", who: "معلمك" },
    practice: { title: "جلسة ممارسة", who: "مرشدك" },
  },
  line: "5 لقاءات كل أسبوع — تتكلم إنجليزي تقريباً كل يوم.",
  note: "الأيام توضيحية، والمواعيد نتفق عليها معك.",
  stats: [
    { value: "12", label: "حصة فردية في الشهر" },
    { value: "8", label: "جلسات ممارسة في الشهر" },
    { value: "≈ 3", label: "شهور من كورس تقليدي في شهر واحد" },
  ],
};

/**
 * Comparison rows. `vip` / `int`: a string, or true (included) / false (not
 * included). Every false is sourced: the 2,000 plan's own note sends anyone who
 * wants practice sessions to the intensive plan.
 * Dropped (not stated for the 2,000 plan anywhere): «المرشد الأكاديمي» and
 * «المنصّة التعليمية كاملة» as rows.
 */
export const COMPARE = {
  label: "قارن",
  h2: "قارن الباقتين",
  intro: "الباقتين فرديتين بالكامل. الفرق في الإيقاع، وفي جلسات الممارسة مع المرشد الأكاديمي.",
  rows: [
    // no-break spaces keep «3,000 ر.س» and «/ شهرياً» whole when a phone column wraps
    { label: "السعر الشهري", vip: `من\u00a0${fmt(vip.priceLow)}\u00a0ر.س /\u00a0شهرياً`, int: `${fmt(intensive.price)}\u00a0ر.س /\u00a0شهرياً`, strong: true },
    { label: "حصص فردية مع معلمك", vip: "حسب ما نتفق عليه معك", int: "12 في الشهر · 3 أسبوعياً" },
    { label: "جلسات ممارسة مع المرشد الأكاديمي", vip: false, int: "8 في الشهر · 2 أسبوعياً" },
    { label: "المنهج", vip: "منهج مخصّص يتكيّف معك ومع هدفك", int: "جلسة تشخيص مطوّلة + منهج مصمم لمجالك" },
    { label: "متابعة يومية + تصحيح كتابي ونطق", vip: true, int: true },
    { label: "تدريب على المقابلات والعروض والإلقاء", vip: true, int: true },
    { label: "الإيقاع الأسبوعي", vip: "نتفق عليه في اللقاء المبدئي", int: "5 لقاءات كل أسبوع" },
  ],
  vipNote: vip.priceNote,
};

export const FIT = {
  eyebrow: "قبل ما تحجز",
  headline: "لمن هذا البرنامج",
  intro: "برنامج مكثّف، ويطلب منك التزام. نقولها بوضوح من البداية.",
  forYou: {
    title: "مناسب لك إذا",
    items: [
      "تحتاج نتيجة سريعة في مجال محدد",
      "تقدر تلتزم بـ 5 لقاءات أسبوعياً",
      "تبي متابعة شخصية كاملة",
    ],
  },
  notForYou: {
    title: "مو مناسب لك إذا",
    items: [
      "تبي تتعلم على راحتك بدون جدول",
      "تدور على أرخص خيار",
    ],
  },
  groupLink: { label: "شوف باقات المجموعات", href: "/#pricing" },
};

export const FORM = {
  title: "احجز استشارتك",
  sub: "نراجع طلبك ونتواصل معك على واتساب خلال ساعات.",
  fieldPlaceholder: "مثال: تمريض، هندسة مدنية، مبيعات",
  goals: [
    { id: "work", label: "شغلي", path: "" },
    { id: "study", label: "الدراسة أو الابتعاث", path: "" },
    { id: "ielts", label: "IELTS", path: "IELTS" },
    { id: "life", label: "السفر والحياة", path: "" },
  ],
};

export const FAQ_PRIVATE = {
  eyebrow: "أسئلة",
  headline: "قبل ما تسأل",
  intro: "",
  items: [
    {
      q: "وش الفرق بين المعلم والمرشد الأكاديمي؟",
      a: "معلمك الخاص يعطيك الحصص الفردية على منهجك. مرشدك الأكاديمي شخص ثاني: يوجّهك ويتابع تقدمك، ويعطيك جلسات ممارسة خاصة تستهدف نقاط ضعفك بالذات. في الفردي المكثّف يشتغل عليك الاثنين، كل واحد بدوره.",
    },
    {
      q: "هل المرشد متحدث أصلي؟",
      a: "غالباً نعم.",
    },
    {
      q: "وش يصير في جلسة التشخيص؟",
      a: "جلسة مطوّلة في البداية، نحدد فيها بالضبط أهدافك من الإنجليزي: وين تحتاجه، وين تتعثر اليوم، ووش النتيجة اللي تبيها. منها نصمم منهجك على مجالك، عشان يبان أثر التعلم بسرعة في المكان اللي يهمك.",
    },
    {
      q: "كيف شهر واحد يعادل 3 شهور؟",
      a: "في الفردي المكثّف عندك 5 لقاءات كل أسبوع: 3 حصص فردية مع معلمك وجلستين ممارسة مع مرشدك، وكلها فردية بالكامل، أنت فقط. كورس تقليدي بمجموعة ولقاءات أقل ما يقرّب من هذا الإيقاع، ولهذا شهر واحد هنا يعادل تقريباً 3 شهور منه.",
    },
    {
      q: "هل المنصّة مشمولة؟",
      a: "نعم. في الفردي المكثّف المنصّة التعليمية كاملة مفتوحة لك طوال اشتراكك.",
    },
  ],
};

export const FINAL = {
  eyebrow: "الخطوة الأولى",
  headline: "ابدأ بجلسة تشخيص، ونبني برنامجك عليك.",
  sub: "احجز استشارتك، ونتواصل معك على واتساب خلال ساعات.",
};

export const STICKY = { title: "التدريب الفردي", sub: "لقاء مبدئي مجاني" };
