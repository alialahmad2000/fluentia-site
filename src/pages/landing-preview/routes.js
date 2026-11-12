/**
 * Homepage visual-direction previews — plain data, no JSX.
 *
 * Three complete takes on the homepage at /preview/a, /preview/b and /preview/c,
 * plus a chooser at /preview, so Ali can pick one on his phone and laptop. `/`
 * is untouched until he does. All four are client-rendered and noindex (meta +
 * X-Robots-Tag in public/_headers), never in the sitemap or llms.txt, and fire
 * no conversion events (App.jsx skips TikTok ViewContent here).
 *
 * scripts/cloudflare-routing.mjs imports this in Node to give each URL a 200
 * rewrite to the app shell.
 */
export const HOME_PREVIEW_PATH = "/preview";

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

export const HOME_PREVIEW_ROUTES = [HOME_PREVIEW_PATH, ...HOME_DIRECTIONS.map((d) => homePreviewPath(d.id))];
