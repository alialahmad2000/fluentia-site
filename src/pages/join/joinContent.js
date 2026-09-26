/**
 * /join copy + data. Every fact here is sourced from content the site already
 * publishes — nothing is invented for the campaign:
 *   - tiers, prices, taglines, features → PRICING in landing-v2/content.js
 *     (the homepage's source of truth); no strikethrough/savings fields read.
 *   - "7 students", monthly, no commitment, cohorts start each month, change
 *     package any time → /start's FAQ and PRICING.
 * Testimonials are deliberately absent: the homepage hid STORIES as stand-in
 * templates, and the /start quotes are still unverified.
 */
import { PRICING } from "../landing-v2/content";

const [asas, talaqa, tamayuz] = PRICING.tiers;
const self = PRICING.entryTier;
const vip = PRICING.vipTier;

// "منهج 6 مستويات (Pre-A1 → C1) · 72 وحدة · …" → the first clause only.
const clean = (t) => String(typeof t === "string" ? t : t.text).split(" · ")[0].trim();
const pick = (features, n = 4) => features.slice(0, n).map(clean);

export const TIERS = [
  { id: self.id, name: self.name, tagline: self.tagline, price: self.price, features: pick(self.features) },
  { id: asas.id, name: asas.name, tagline: asas.tagline, price: asas.price, features: pick(asas.features) },
  { id: talaqa.id, name: talaqa.name, tagline: talaqa.tagline, price: talaqa.price, features: pick(talaqa.features), recommended: true },
  { id: tamayuz.id, name: tamayuz.name, tagline: tamayuz.tagline, price: tamayuz.price, features: pick(tamayuz.features) },
  { id: vip.id, name: vip.name, tagline: vip.tagline, price: vip.priceLow, priceFrom: true, features: pick(vip.features) },
];

export const formatPrice = (n) => n.toLocaleString("en-US");

/** Goal chips → the `path` values /start already sends ('' = undecided). */
export const GOALS = [
  { id: "foundation", label: "تأسيس من الصفر", path: "تأسيس" },
  { id: "conversation", label: "تطوير المحادثة", path: "تطوير" },
  { id: "ielts", label: "IELTS", path: "IELTS" },
  { id: "unsure", label: "مو متأكد", path: "" },
];

export const HERO = {
  h1Lines: ["من «أفهم بس ما أعرف أتكلم»…", "إلى كلام بثقة."],
  sub: "مجموعات صغيرة، حصص مباشرة أونلاين، ومنصّة تتدرب عليها كل يوم. ابدأ بلقاء مبدئي مجاني نحدد فيه مستواك وهدفك، بدون أي التزام.",
  cta: "احجز لقاءك المبدئي المجاني",
  facts: ["مجموعات من 7 طلاب", "حصص مباشرة أونلاين", "منصّة تدريب يومي", "اشتراك شهري بدون عقود"],
};

export const WHY = {
  h2: "المشكلة غالبًا مو في المعلومة",
  rows: [
    "تعرف كلمات كثيرة، بس وقت الكلام ما تطلع.",
    "تتردد تتكلم لأنك خايف تغلط.",
    "تبدأ بحماس، وبعد أسبوعين توقف.",
  ],
  closing: "عشان كذا طلاقة مبنية على ثلاث: تتكلم في كل حصة، أحد يتابعك، وتتدرب كل يوم على المنصّة.",
};

export const STEPS = {
  h2: "كيف تبدأ",
  items: [
    { title: "سجّل بياناتك", body: "اسمك ورقمك، 30 ثانية." },
    { title: "لقاء مبدئي مجاني", body: "نعرف مستواك وهدفك ووقتك، ونرشّح لك المسار والباقة المناسبة." },
    { title: "تبدأ مع مجموعتك", body: "تنضم لمجموعة صغيرة بمستواك، وتدخل المنصّة من أول يوم." },
  ],
};

/** Built only from PRICING features; `scope` names the tiers that include it. */
export const INCLUDED = {
  h2: "وش تحصل مع طلاقة",
  items: [
    { icon: "users", title: "8 حصص جماعية مباشرة كل شهر", body: "في مجموعة حدّها الأقصى 7 طلاب.", scope: "في باقة أساس وأعلى" },
    { icon: "platform", title: "المنصّة كاملة", body: "منهج من 6 مستويات، مع تمارين قواعد ومفردات وقراءة واستماع.", scope: "في كل الباقات" },
    { icon: "mic", title: "مساعد AI للمحادثة والنطق", body: "تتدرب عليه في أي وقت، بدون ما تنتظر الحصة.", scope: "في كل الباقات" },
    { icon: "follow", title: "متابعة من مدربك", body: "تقييم شهري في أساس، ومتابعة يومية من باقة طلاقة.", scope: "في باقة أساس وأعلى" },
    { icon: "one", title: "حصة فردية شهرية مع مدربك", body: "وقت لك وحدك تركّز فيه على نقاط ضعفك.", scope: "في باقة طلاقة وأعلى" },
    { icon: "report", title: "تقييم كل أسبوعين وتقرير شهري", body: "تعرف وين وصلت، ووش الخطوة الجاية.", scope: "في باقة طلاقة وأعلى" },
  ],
};

export const PACKAGES = {
  h2: "الباقات",
  sub: "كل الباقات شهرية. وفي اللقاء المبدئي نرشّح لك الأنسب.",
  badge: "الأكثر طلبًا",
  suffix: "ر.س / شهريًا",
};

/** Repo facts win (/start FAQ): monthly, change package any time, cohorts each month. */
export const FAQ = {
  h2: "أسئلة شائعة",
  items: [
    { q: "وش يصير في اللقاء المبدئي؟", a: "مكالمة قصيرة نعرف فيها مستواك وهدفك ووقتك، ونرشّح لك المسار والباقة. مجاني وبدون التزام." },
    { q: "ما أعرف مستواي، عادي؟", a: "عادي جدًا. نحدد مستواك معك في اللقاء المبدئي." },
    { q: "الحصص أونلاين؟", a: "نعم، حصص مباشرة أونلاين مع مدربك ومجموعتك." },
    { q: "الاشتراك شهري؟", a: "نعم، شهري وبدون عقود." },
    { q: "أقدر أغيّر باقتي بعدين؟", a: "نعم، الدفع شهري، وتقدر ترفع باقتك أو تنزّلها." },
    { q: "متى أقدر أبدأ؟", a: "المجموعات تبدأ مع بداية كل شهر ميلادي، وتقدر تنضم في أي وقت والمدرب يعوّضك اللي فاتك." },
  ],
};

export const FINAL = {
  h2: "أول خطوة: لقاء مبدئي مجاني",
  text: "سجّل بياناتك ونتواصل معك على واتساب خلال ساعات.",
};

export const CTA = "احجز لقاءك المبدئي";

export const WA_DISPLAY = "+966 55 866 9974";
