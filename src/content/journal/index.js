/**
 * «مجلة طلاقة» — the journal's single source of truth.
 *
 * Plain data + pure helpers, no JSX: scripts/prerender-meta.mjs,
 * scripts/sync-vercel-rewrites.mjs and scripts/build-guide.mjs import it in Node.
 *
 * Article module shape (src/content/journal/<slug>.js, default export):
 *   { slug, title, dek, description, quote, category, date, related[], body[], sources[] , audio? }
 * Body blocks:
 *   ["p", text]            paragraph
 *   ["h", text]            section heading (h2)
 *   ["punch", text]        a short line standing alone
 *   ["pull", text]         pull quote (also offered as a share card)
 *   ["scene", id]          scrollytelling scene (src/pages/journal/scenes.jsx)
 *   ["try", id]            interactive (src/pages/journal/tries.jsx + tries-b.jsx)
 *   ["steps", [[title, text], …]]
 *   ["en", [[english, gloss], …]]   natural English lines, LTR, with an Arabic gloss
 *   ["close", text]        the closing line
 * Inline markup inside any text: {{English}} → <span dir="ltr" lang="en">, **bold**.
 */
import firstTenMinutes from "./first-ten-minutes.js";
import understandButCantSpeak from "./understand-but-cant-speak.js";
import wordsThatBetrayedUs from "./words-that-betrayed-us.js";
import accentIsNotTheProblem from "./accent-is-not-the-problem.js";
import fearOfMistakes from "./fear-of-mistakes.js";
import adultsLearnDifferently from "./adults-learn-differently.js";

export const JOURNAL_PATH = "/journal";
export const JOURNAL_NAME = "مجلة طلاقة";
export const JOURNAL_MANIFESTO = "نكتب عن الإنجليزي كما يعيشه الموظف: في الاجتماع، والإيميل، والمقابلة. بلا وعود، وبلا محاضرات.";
export const JOURNAL_DESCRIPTION =
  "مجلة طلاقة: مقالات مطوّلة بالعامية السعودية عن الإنجليزي في بيئة العمل — الاجتماعات، والخوف من الغلط، واللكنة، والترجمة الحرفية — مبنية على أبحاث حقيقية وخطوات عملية.";

/** Display order on /journal. The first is the cover story. */
export const JOURNAL = [
  firstTenMinutes,
  understandButCantSpeak,
  wordsThatBetrayedUs,
  accentIsNotTheProblem,
  fearOfMistakes,
  adultsLearnDifferently,
];

export const journalPath = (slug) => `${JOURNAL_PATH}/${slug}`;

export function getJournalArticle(slug) {
  return JOURNAL.find((a) => a.slug === slug) || null;
}

export function relatedArticles(article) {
  return (article.related || []).map(getJournalArticle).filter(Boolean).slice(0, 2);
}

/** Split inline markup into tokens: {t:"text"|"en"|"b", v}. No lookbehind (Safari < 16.4). */
export function parseInline(text) {
  const out = [];
  const re = /\{\{([\s\S]+?)\}\}|\*\*([\s\S]+?)\*\*/g;
  let last = 0;
  let m;
  const s = String(text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: "text", v: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "en", v: m[1] });
    else out.push({ t: "b", v: m[2] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}

/** Text with the markup removed. */
export const plain = (text) => String(text).replace(/\{\{([\s\S]+?)\}\}/g, "$1").replace(/\*\*([\s\S]+?)\*\*/g, "$1");

/** Every human-readable string in the body, in reading order. */
export function bodyTexts(article) {
  const out = [];
  for (const [type, v] of article.body) {
    if (type === "scene" || type === "try") continue;
    if (type === "steps") v.forEach(([a, b]) => out.push(a, b));
    else if (type === "en") v.forEach(([a, b]) => out.push(a, b));
    else out.push(v);
  }
  return out.map(plain);
}

export function wordCount(article) {
  return [article.title, article.dek, ...bodyTexts(article)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Arabic long-form reads slower than English; ~180 words a minute. */
export function readMinutes(article) {
  return Math.max(1, Math.round(wordCount(article) / 180));
}

/** «8 دقائق قراءة» — Arabic plural agreement with Western numerals. */
export function readLabel(article) {
  const n = readMinutes(article);
  if (n === 1) return "دقيقة قراءة";
  if (n === 2) return "دقيقتان قراءة";
  if (n <= 10) return `${n} دقائق قراءة`;
  return `${n} دقيقة قراءة`;
}

/** 2026-11-10 → «10 نوفمبر 2026» (Gregorian, Western digits). */
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
export function dateLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
