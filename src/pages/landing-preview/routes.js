/**
 * Homepage visual-direction previews — plain data, no JSX.
 *
 * Three complete takes on the homepage at /preview/a, /preview/b and /preview/c,
 * plus a chooser, so Ali can pick one on his phone and laptop. `/` is untouched
 * until he does. Since 2026-11-24 the chooser lives at /preview/directions and
 * /preview itself is the cinematic candidate (src/pages/cinema-preview/,
 * prerendered via PAGE_SEO). All are noindex (meta + X-Robots-Tag in
 * public/_headers), never in the sitemap or llms.txt, and fire no TikTok
 * ViewContent (App.jsx skips it on /preview*).
 *
 * scripts/cloudflare-routing.mjs imports HOME_PREVIEW_ROUTES in Node to give each
 * client-rendered URL a 200 rewrite to the app shell (/preview itself is prerendered).
 */
export const HOME_PREVIEW_PATH = "/preview";
/** The a/b/c chooser (was /preview until 2026-11-24). */
export const HOME_DIRECTIONS_PATH = `${HOME_PREVIEW_PATH}/directions`;

export const HOME_DIRECTIONS = [
  {
    id: "a",
    letter: "أ",
    name: "فجر",
    line: "داكن لكنه حيّ: شفق أزرق يتحرّك ببطء، وكوكب طلاقة يشرق فوق الأفق، والسماء تتبدّل مع النزول.",
    accents: ["#060A1C", "#3D7BFF", "#A9CBFF", "#FFB547"],
  },
  {
    id: "b",
    letter: "ب",
    name: "صباح",
    line: "فاتح وتحريري: رمل دافئ وحبر كحلي، وصور سعوديين يتعلّمون ويتحدّثون في العمل.",
    accents: ["#F6F1E7", "#0E1A2B", "#0B6BCB", "#2F6B4F"],
  },
  {
    id: "c",
    letter: "ج",
    name: "المنصة أولاً",
    line: "المنتج هو البطل: شاشات المنصة الحقيقية تطفو بعمق، ولكل ميزة ضوء بلونها.",
    accents: ["#080B14", "#4C8DFF", "#FFB020", "#9B7BFF", "#2DD4BF"],
  },
];

export const homePreviewPath = (id) => `${HOME_PREVIEW_PATH}/${id}`;

/** Client-rendered preview URLs (the chooser and a/b/c). */
export const HOME_PREVIEW_ROUTES = [HOME_DIRECTIONS_PATH, ...HOME_DIRECTIONS.map((d) => homePreviewPath(d.id))];
