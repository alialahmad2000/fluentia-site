/**
 * «الإنجليزي للعمل» — per-field work-English glossary pages. One source of truth.
 *
 * WHY: Saudi adults search «مصطلحات <مجال> بالانجليزي» (often + "pdf",
 * "مترجمة", "مع النطق") far more than «انجليزي للموظفين» (Google autocomplete,
 * SA, 2026-09-13). Each page is a real, checked glossary organised by work
 * situation, with ready phrases, typical mistakes, a short dialogue and an FAQ —
 * and a door into «درسك الأول» for that same field.
 *
 * Data lives one file per field in ./work-english/<slug>.js (plain objects, so
 * the Node build scripts can import them too). To add a field: create the file,
 * import it below, then run `npm run sync:rewrites` and add its URL to
 * public/sitemap.xml. Routes: /work-english (hub) and /work-english/<slug>.
 */
import medical from "./work-english/medical.js";
import nursing from "./work-english/nursing.js";
import pharmacy from "./work-english/pharmacy.js";
import medicalLab from "./work-english/medical-lab.js";
import accounting from "./work-english/accounting.js";
import banking from "./work-english/banking.js";
import engineering from "./work-english/engineering.js";
import it from "./work-english/it.js";
import marketing from "./work-english/marketing.js";
import hr from "./work-english/hr.js";
import legal from "./work-english/legal.js";

export const WORK_PAGES = [
  medical, nursing, pharmacy, medicalLab,
  accounting, banking,
  engineering, it,
  marketing, hr, legal,
].filter(Boolean);

export const WORK_HUB_PATH = "/work-english";

export const workPath = (slug) => `${WORK_HUB_PATH}/${slug}`;

export function getWorkPage(slug) {
  return WORK_PAGES.find((p) => p.slug === slug) || null;
}

export const termCount = (page) =>
  (page.groups || []).reduce((n, g) => n + (g.terms || []).length, 0);

/** Articles that belong to the work-English cluster (shown on the hub when they exist). */
export const WORK_ARTICLE_SLUGS = [
  "اسئلة-مقابلة-عمل-بالانجليزي",
  "ايميل-رسمي-بالانجليزي",
  "سيرة-ذاتية-بالانجليزي",
  "جمل-انجليزية-للعمل",
];
