/**
 * Copy for /journey. The page's own lines are the FLUENTIA-JOURNEY-LANDING §5
 * list, verbatim; everything else is imported from the homepage content or
 * copied verbatim (with its source named) from copy that already ships on the
 * site. Nothing here invents a number, a name or an outcome.
 */
import { HERO, PRICING } from "../landing-v2/content";

export const CTA_LABEL = HERO.primaryCTA; // «ابدأ بمحادثة»
export const TRUST_LINE = PRICING.trust; // «لقاء مبدئي مجاني · إلغاء بأي وقت · لا التزام طويل»

/** The homepage promise, split into its two lines (the dash stays for readers). */
export const HEADLINE = (() => {
  const [a, b] = HERO.headline.split(/\s+—\s+/);
  return { a, b, full: HERO.headline };
})();
/** The first sentence of the homepage sub, verbatim. */
export const HERO_SUB = HERO.sub.split(". ")[0] + ".";

export const TITLES = {
  hero: ["معك في كل مرحلة", "من أول كلمة إلى الطلاقة"],
  firstWord: ["أول كلمة", "تُقال بثقة"],
  path: ["طريق واضح", "خطوة بعد خطوة"],
  arrival: ["رحلتك", "تبدأ بلقاء"],
  pricing: "اختر مسارك",
  faq: "قبل أن تبدأ",
};
export const START_LINK = "ابدأ الرحلة";
export const STATEMENT = "تفهم أكثر مما تتوقع. تقرأ وتسمع وتتابع. لكن حين يأتي وقت الكلام، يسكت صوتك.";
// one name for the first step everywhere on the page (the homepage's button label)
export const HEADER_CTA = HERO.primaryCTA;
export const PERF_LABEL = "وضع الأداء:";
export const PERF_OPTIONS = [
  { value: "auto", label: "تلقائي" },
  { value: "high", label: "كامل" },
  { value: "low", label: "خفيف" },
];

/**
 * Real platform footage (captured from the student platform for a fictional
 * student, public/next/*). Titles and lines are verbatim from
 * src/pages/next/showcase.js, which traces each line to the LMS code.
 */
export const PHONE_SCREENS = [
  {
    key: "speak",
    title: "المحادثة مع ليلى",
    video: "/next/speak.mp4",
    poster: "/next/speak.webp",
    line: "محادثة صوتية بالإنجليزي مع ليلى، مدرّبة ذكاء اصطناعي، في موضوع تختاره.",
  },
  {
    key: "shadow",
    title: "الترديد بصوتك",
    image: "/next/shot-shadow.webp",
    line: "ردّد جملة الراوي، واعرف نسبة التطابق والكلمات التي فاتتك.",
  },
  {
    key: "podcast",
    title: "بودكاست طلاقة",
    video: "/next/podcast.mp4",
    poster: "/next/podcast.webp",
    line: "حلقات «من إنتاج طلاقة» بنصٍّ يتحرّك مع الصوت كلمةً كلمة، وترجمة كل جملة تحتها.",
  },
  {
    key: "library",
    title: "مكتبة طلاقة",
    video: "/next/novel.mp4",
    poster: "/next/novel.webp",
    line: "روايات أصلية بإنجليزية متدرّجة على مستواك.",
  },
];

/* Places, not claims about students. */
export const HOMES = [
  { code: "RUH", name: "الرياض", lat: 24.71, lon: 46.68 },
  { code: "JED", name: "جدة", lat: 21.54, lon: 39.17 },
  { code: "DMM", name: "الدمام", lat: 26.43, lon: 50.1 },
];
export const DESTS = [
  { code: "LHR", name: "لندن", lat: 51.47, lon: -0.45 },
  { code: "KUL", name: "كوالالمبور", lat: 2.74, lon: 101.7 },
  { code: "JFK", name: "نيويورك", lat: 40.64, lon: -73.78 },
  { code: "SYD", name: "سيدني", lat: -33.94, lon: 151.18 },
  { code: "DUB", name: "دبلن", lat: 53.43, lon: -6.25 },
  { code: "YYZ", name: "تورونتو", lat: 43.68, lon: -79.63 },
  { code: "MAN", name: "مانشستر", lat: 53.36, lon: -2.27 },
  { code: "BOS", name: "بوسطن", lat: 42.36, lon: -71.01 },
];
