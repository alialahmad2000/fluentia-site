/**
 * «مجلة طلاقة» — art-direction PREVIEWS (noindex, not in sitemap/llms).
 *
 * Three complete redesigns of the journal, built side by side so Ali can pick
 * one. Same article text (src/content/journal/<slug>.js), three different worlds.
 * Pages: src/pages/journal-preview/<id>/. Images: public/images/journal/<id>/.
 *
 * Plain data, no JSX: scripts/cloudflare-routing.mjs imports it in Node to give
 * every preview URL a 200 rewrite to the app shell (they are client-rendered).
 */
import { JOURNAL } from "./index.js";

export const PREVIEW_PATH = "/journal/preview";

export const DIRECTIONS = [
  {
    id: "ink",
    name: "حبر وجمر",
    en: "Ink & Ember",
    line: "مجلة مطبوعة في الليل: حبر دافئ، وجمرة واحدة تشتعل كلما نزلت.",
    second: "fear-of-mistakes",
  },
  {
    id: "dusk",
    name: "غسق الصحراء",
    en: "Desert Dusk",
    line: "صحراء ساعة الغروب: سماء تتبدّل مع القراءة، وكثبان تمشي معك.",
    second: "adults-learn-differently",
  },
  {
    id: "gallery",
    name: "معرض",
    en: "Gallery",
    line: "معرض تصميم معاصر: شبكة صارمة، أرقام ضخمة، ولون واحد جريء.",
    second: "words-that-betrayed-us",
  },
];

export const FLAGSHIP = "first-ten-minutes";

export const getDirection = (id) => DIRECTIONS.find((d) => d.id === id) || null;

export const previewPath = (dir, slug) =>
  slug ? `${PREVIEW_PATH}/${dir}/${slug}` : `${PREVIEW_PATH}/${dir}`;

/** Every preview URL: the chooser, each direction's home, and all six articles in each. */
export const PREVIEW_ROUTES = [
  PREVIEW_PATH,
  ...DIRECTIONS.flatMap((d) => [previewPath(d.id), ...JOURNAL.map((a) => previewPath(d.id, a.slug))]),
];
