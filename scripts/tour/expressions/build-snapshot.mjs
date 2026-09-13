/**
 * build-snapshot — turn raw.json (the output of snapshot.sql) into the room's
 * static data file, src/tour/rooms/expressions/data/specimens.json.
 *
 *   node scripts/tour/expressions/build-snapshot.mjs
 *
 * What it does, in order:
 *   1. keeps only the fields the sheets render (no unit_id, no produce drill:
 *      the free-use step calls an AI grader and is not part of the tour);
 *   2. points every plate and clip at the copies in public/tour/expressions/
 *      (made by media.py), never at Supabase storage;
 *   3. rewrites the feminine second person to masculine-generic BY HAND.
 *      The LMS converter (src/i18n/gender.js) misses any word followed by
 *      «،» «؟» «؛» (they sit inside U+0600–06FF), so it cannot be relied on.
 *      Every fix asserts its source string is still present, so a changed row
 *      fails loudly instead of shipping the old tone.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const OUT = join(ROOT, "src/tour/rooms/expressions/data/specimens.json");

const raw = JSON.parse(await readFile(join(HERE, "raw.json"), "utf8"));

// Walking order inside the room: the two proverbs, then the two idioms.
const ORDER = ["dont-count-your-chickens", "the-early-bird", "cost-an-arm-and-a-leg", "spill-the-beans"];

// [slug, path, from, to] — exact substring replacements.
const GENDER_FIXES = [
  ["the-early-bird", "twin_note_ar", "فإن أردتِ الحثّ", "فإن أردت الحثّ"],
  ["dont-count-your-chickens", "q.guess_meaning.options[2].t", "اصبري، فالنتائج", "اصبر، فالنتائج"],
  ["dont-count-your-chickens", "q.guess_meaning.options[0].t", "لا تبني حساباتك", "لا تبنِ حساباتك"],
];

const FEMININE = /(اكتبي|اصبري|أردتِ|تعرفين|خمّني|ترينه|ترجمتِ|أتقنتِ|نُريكِ|تحفظينه|استمعي|اضغطي|جرّبي)/;

const img = (url) => url && `/tour/expressions/${url.split("/").pop().replace(/\.jpe?g$/i, ".webp")}`;
const aud = (url) => url && `/tour/expressions/${url.split("/").pop()}`;

const bySlug = Object.fromEntries(raw.map((r) => [r.slug, r]));
const items = ORDER.map((slug) => {
  const e = bySlug[slug];
  if (!e) throw new Error(`missing specimen ${slug}`);
  return {
    id: e.id,
    kind: e.kind,
    slug: e.slug,
    text_en: e.text_en,
    literal_ar: e.literal_ar,
    meaning_ar: e.meaning_ar,
    when_to_use_ar: e.when_to_use_ar,
    arabic_twin: e.arabic_twin,
    twin_note_ar: e.twin_note_ar,
    frame_en: e.frame_en,
    forms: e.forms,
    fixed_part_en: e.fixed_part_en,
    common_error_ar: e.common_error_ar,
    wrong_forms: e.wrong_forms,
    register: e.register,
    register_warning_ar: e.register_warning_ar,
    frequency: e.frequency,
    cefr_level: e.cefr_level,
    theme: e.theme,
    theme_label_ar: e.theme_label_ar,
    image_url: img(e.image_url),
    image_literal_url: img(e.image_literal_url),
    audio_url: aud(e.audio_url),
    sort_order: e.sort_order,
    expression_examples: [...e.expression_examples]
      .sort((a, b) => a.idx - b.idx)
      .map((x) => ({ ...x, audio_url: aud(x.audio_url) })),
    expression_questions: [...e.expression_questions]
      .filter((q) => q.kind !== "produce")
      .sort((a, b) => a.sort_order - b.sort_order),
  };
});

for (const [slug, path, from, to] of GENDER_FIXES) {
  const it = items.find((x) => x.slug === slug);
  let holder;
  let key;
  if (path.startsWith("q.")) {
    const [, kind, rest] = path.match(/^q\.(\w+)\.options\[(\d+)\]\.t$/);
    holder = it.expression_questions.find((q) => q.kind === kind).options[Number(rest)];
    key = "t";
  } else {
    holder = it;
    key = path;
  }
  if (!String(holder[key]).includes(from)) throw new Error(`gender fix no longer matches: ${slug} ${path} «${from}»`);
  holder[key] = holder[key].replace(from, to);
}

const flat = JSON.stringify(items);
const m = flat.match(FEMININE);
if (m) throw new Error(`feminine form left in snapshot: «${m[0]}»`);

const data = {
  source: "fluentia-lms expressions / expression_examples / expression_questions, read 2026-09-13 (snapshot.sql)",
  library: { proverb: 120, idiom: 200 },
  items,
};
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`build-snapshot: ${items.length} specimens → ${OUT.replace(ROOT + "/", "")} (${(JSON.stringify(data).length / 1024).toFixed(1)} KB)`);
