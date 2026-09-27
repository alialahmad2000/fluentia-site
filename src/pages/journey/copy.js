/**
 * The only new copy on /journey (FLUENTIA-JOURNEY-LANDING §5, verbatim).
 * Everything else on the page is imported from landing-v2/content.js.
 */
import { HERO } from "../landing-v2/content";

export const CTA_LABEL = HERO.primaryCTA;

export const TITLES = {
  hero: ["معك في كل مرحلة", "من أول كلمة إلى الطلاقة"],
  firstWord: ["أول كلمة", "تُقال بثقة"],
  path: ["طريق واضح", "خطوة بعد خطوة"],
  sea: ["أصوات", "وصلت قبلك"],
  arrival: ["رحلتك", "تبدأ بلقاء"],
  pricing: "اختر مسارك",
  faq: "قبل أن تبدأ",
};

export const START_LINK = "ابدأ الرحلة";
export const STATEMENT = "تفهم أكثر مما تتوقع. تقرأ وتسمع وتتابع. لكن حين يأتي وقت الكلام، يسكت صوتك.";
export const MARQUEE = "طلاقة FLUENTIA";
export const HEADER_CTA = "احجز لقاءك المبدئي";

export const PERF_LABEL = "وضع الأداء:";
export const PERF_OPTIONS = [
  { value: "auto", label: "تلقائي" },
  { value: "high", label: "كامل" },
  { value: "low", label: "خفيف" },
];

/* Places, not claims about students. */
export const HOMES = [
  { code: "RUH", lat: 24.71, lon: 46.68 },
  { code: "JED", lat: 21.54, lon: 39.17 },
  { code: "DMM", lat: 26.43, lon: 50.1 },
];
export const DESTS = [
  { code: "LHR", lat: 51.47, lon: -0.45 },
  { code: "JFK", lat: 40.64, lon: -73.78 },
  { code: "YYZ", lat: 43.68, lon: -79.63 },
  { code: "SYD", lat: -33.94, lon: 151.18 },
  { code: "DUB", lat: 53.43, lon: -6.25 },
  { code: "MAN", lat: 53.36, lon: -2.27 },
  { code: "KUL", lat: 2.74, lon: 101.7 },
  { code: "BOS", lat: 42.36, lon: -71.01 },
];
