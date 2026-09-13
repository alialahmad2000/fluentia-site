/**
 * Library tour snapshot: raw-snapshot.json (the output of snapshot.sql, run
 * read-only through the Supabase MCP) → src/tour/rooms/library/data/snapshot.json.
 *
 *   node scripts/tour/library/build-snapshot.mjs
 *
 * - media URLs are rewritten to the lean copies build-media.sh writes to
 *   public/tour/library/ (nothing is hotlinked from Supabase storage);
 * - the chapter gets `clip` — the trimmed part's own duration, because iOS
 *   Safari reports no duration before the first play;
 * - feminine-only Arabic is regendered for an anonymous visitor, Arabic-Indic
 *   digits become Western, and the script fails loudly if any survive.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const raw = JSON.parse(await readFile(join(HERE, "raw-snapshot.json"), "utf8"));

const slug = (en) => en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const coverUrl = (b) => `/tour/library/covers/${slug(b.title_en)}.webp`;

// Feminine second-person forms the library ships (UI + DB), and their
// masculine-generic rewrites. Extend if the snapshot grows.
const REGENDER = [
  [/هل تظنين/g, "هل تظن"],
  [/تظنين/g, "تظن"],
  [/شاركينا/g, "شاركنا"],
  [/اكتبي/g, "اكتب"],
  [/اسمعيها/g, "اسمعها"],
  [/اختبري/g, "اختبر"],
  [/ردّدي/g, "ردّد"],
  [/تدرّبي/g, "تدرّب"],
];
const toWestern = (s) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const fixAr = (s) => (typeof s === "string" ? toWestern(REGENDER.reduce((t, [re, to]) => t.replace(re, to), s)) : s);

const books = raw.books.map((b) => ({
  id: b.id,
  slug: slug(b.title_en),
  title_en: b.title_en,
  title_ar: fixAr(b.title_ar),
  theme: b.theme,
  cefr: b.cefr,
  level_number: b.level_number,
  total_chapters: b.total_chapters,
  sort_order: b.sort_order,
  author_label: b.author_label,
  cover_data: { ...b.cover_data, art_url: coverUrl(b) },
}));

const book = {
  ...raw.book,
  slug: slug(raw.book.title_en),
  title_ar: fixAr(raw.book.title_ar),
  synopsis_ar: fixAr(raw.book.synopsis_ar),
  cover_data: { ...raw.book.cover_data, art_url: coverUrl(raw.book) },
};

const chapter = {
  ...raw.chapter,
  title_ar: fixAr(raw.chapter.title_ar),
  audio_url: "/tour/library/the-wolf-winter-ch1-part1.mp3",
  illustrations: raw.chapter.illustrations.map((ill) => ({
    ...ill,
    alt: fixAr(ill.alt),
    url: ill.after === -1 ? "/tour/library/the-wolf-winter-ch1-opener.webp" : ill.url,
  })),
  // the trimmed part (build-media.sh): 0–80.5 s, 2 s fade from 78.5 s
  clip: { duration_s: 80.5, fade_from_s: 78.5, paragraphs: "0-4", source_duration_s: 149.82 },
};
if (chapter.illustrations.some((i) => /supabase/.test(i.url))) throw new Error("an illustration is still hotlinked");

const lastT1 = Math.max(...chapter.audio_timing.map((t) => t.t1));
if (lastT1 > chapter.clip.fade_from_s * 1000) throw new Error(`timing runs past the fade (${lastT1} ms)`);

const paragraphs = raw.paragraphs.map((p) => ({
  ...p,
  sentences: p.sentences.map((s) => ({ ...s, text_ar: fixAr(s.text_ar) })),
}));
const sentenceCount = paragraphs.reduce((n, p) => n + p.sentences.length, 0);
if (sentenceCount !== chapter.audio_timing.length) throw new Error(`${sentenceCount} sentences vs ${chapter.audio_timing.length} timing entries`);

const questions = raw.questions.map((q) => ({
  ...q,
  question_ar: fixAr(q.question_ar),
  explanation_ar: fixAr(q.explanation_ar),
  options: (q.options || []).map((o) => ({ ...o, ...(o.ar ? { ar: fixAr(o.ar) } : {}) })),
}));

const out = {
  snapshot_at: raw.snapshot_at,
  source: {
    book_id: raw.book.id,
    chapter_id: raw.chapter.id,
    paragraph_ids: raw.paragraphs.map((p) => p.id),
    question_ids: raw.questions.map((q) => q.id),
    note: "Read-only snapshot of fluentia-lms library_* tables; see scripts/tour/library/snapshot.sql",
  },
  books,
  book,
  chapters: raw.chapters.map((c) => ({ ...c, title_ar: fixAr(c.title_ar) })),
  chapter,
  paragraphs,
  questions,
};

const text = JSON.stringify(out, null, 2);
if (/[٠-٩]/.test(text)) throw new Error("Arabic-Indic digits survived");
for (const [re] of REGENDER) if (new RegExp(re.source).test(text)) throw new Error(`feminine form survived: ${re}`);
await writeFile(join(ROOT, "src/tour/rooms/library/data/snapshot.json"), text + "\n", "utf8");
console.log(`snapshot: ${books.length} books, ${out.chapters.length} chapters, ${paragraphs.length} paragraphs / ${sentenceCount} sentences, ${questions.length} questions → src/tour/rooms/library/data/snapshot.json`);
