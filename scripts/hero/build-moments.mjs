#!/usr/bin/env node
/**
 * Builds src/pages/v5/heroMoments.json — the homepage hero's «من داخل المنصة»
 * showcase — from the /tour snapshots, so every word, meaning, correction and
 * sentence the hero plays is the platform's own content, never invented copy.
 *
 * Why a generated file instead of importing the snapshots: the hero sits in the
 * homepage's main chunk, and unit.json alone is 207 kB. This keeps ~3 kB of it.
 *
 *   node scripts/hero/build-moments.mjs          # rewrite the file
 *   node scripts/hero/build-moments.mjs --check  # exit 1 if it is stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gradeSlot, letterDiff, ERROR_AR } from "../../src/tour/rooms/verbs/verbMastery.js";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const json = (p) => JSON.parse(readFileSync(here(p), "utf8"));
const must = (v, what) => {
  if (v === undefined || v === null || v === "") throw new Error(`hero moments: snapshot is missing ${what}`);
  return v;
};

const OUT = here("../../src/pages/v5/heroMoments.json");

// ── 1 · Reading: tap «extreme» in reading A of A2·U3 ────────────────────────
const unit = json("../../src/tour/rooms/unit/data/unit.json");
const readingA = must(unit.readings.find((r) => r.reading_label === "A"), "reading A");
const WORD = "extreme";
const firstPara = must(readingA.passage_content?.paragraphs?.[0], "reading A paragraph 0");
// The paragraph's first sentence, with the platform's *vocab* markers removed.
const sentence = must(firstPara.replace(/\*/g, "").match(/^.*?[.!?](?=\s|$)/)?.[0], "reading A sentence 0");
if (!new RegExp(`\\b${WORD}\\b`).test(sentence)) throw new Error(`hero moments: «${WORD}» is not in «${sentence}»`);
const tapped = must(readingA.word_index?.[WORD], `word_index.${WORD}`);
const vocabRow = readingA.vocabulary.find((v) => v.word === WORD) || null;

const reading = {
  room: "unit",
  cefr: must(unit.level?.cefr, "level.cefr"),
  unitNumber: must(unit.unit?.unit_number, "unit.unit_number"),
  themeAr: must(unit.unit?.theme_ar, "unit.theme_ar"),
  titleEn: must(readingA.title_en, "reading A title"),
  sentence,
  word: WORD,
  pos: vocabRow?.part_of_speech || null,
  meaningAr: must(tapped.definition_ar, "word meaning"),
  example: tapped.example_sentence || vocabRow?.example_sentence || null,
  audio: must(unit.word_audio?.[WORD], `word_audio.${WORD}`),
  // the reading's own hero art, the same picture the student sees above the passage
  image: must(readingA.before_read_image_url, "reading A before_read_image_url"),
};

// ── 2 · Expressions: a proverb beside its Arabic twin ──────────────────────
const expressions = json("../../src/tour/rooms/expressions/data/specimens.json");
const proverbRow = must(expressions.items.find((i) => i.slug === "dont-count-your-chickens"), "proverb dont-count-your-chickens");
const proverb = {
  room: "expressions",
  cefr: proverbRow.cefr_level,
  textEn: must(proverbRow.text_en, "proverb text"),
  twinAr: must(proverbRow.arabic_twin, "proverb arabic_twin"),
  meaningAr: must(proverbRow.meaning_ar, "proverb meaning"),
  image: proverbRow.image_url,
  audio: must(proverbRow.audio_url, "proverb audio"),
  proverbs: must(expressions.library?.proverb, "library.proverb"),
  idioms: must(expressions.library?.idiom, "library.idiom"),
};

// ── 3 · Verb ladder: «writen» graded by the platform's own checker ──────────
const verbsData = json("../../src/tour/rooms/verbs/data/verbs.json");
const families = json("../../src/tour/rooms/verbs/data/families.json");
const write = must(verbsData.verbs.find((v) => v.base_form === "write"), "verb write");
const GIVEN = "writen";
const graded = gradeSlot(GIVEN, { slot: "v3", base: write.base_form, v2: write.past_simple, v3: write.past_participle });
if (graded.ok || graded.kind !== "near_miss") {
  throw new Error(`hero moments: the verb grader no longer calls «${GIVEN}» a near_miss (got ${graded.kind})`);
}
const verb = {
  room: "verbs",
  base: write.base_form,
  v2: write.past_simple,
  v3: write.past_participle,
  meaningAr: must(write.meaning_ar, "write meaning"),
  given: GIVEN,
  kind: graded.kind,
  diff: letterDiff(GIVEN, write.past_participle),
  errorTitle: must(ERROR_AR[graded.kind]?.title, "ERROR_AR title"),
  trapAr: must(write.trap_note_ar, "write trap note"),
  audio: must(write.audio_pp_url, "written audio"),
  catalogue: must(families.catalogue_total, "catalogue_total"),
};

// ── 4 · Library: the opening sentence of The Wolf Winter ───────────────────
const library = json("../../src/tour/rooms/library/data/snapshot.json");
const s0 = must(library.paragraphs?.[0]?.sentences?.[0], "library p0 s0");
const t0 = must(library.chapter?.audio_timing?.find((t) => t.p === 0 && t.s === 0), "audio_timing p0 s0");
const novel = {
  room: "library",
  cefr: library.book.cefr,
  titleEn: must(library.book.title_en, "book title_en"),
  titleAr: must(library.book.title_ar, "book title_ar"),
  chapter: library.chapter.chapter_number,
  chapterAr: library.chapter.title_ar,
  en: must(s0.text_en, "sentence en"),
  ar: must(s0.text_ar, "sentence ar"),
  image: library.chapter.illustrations?.[0]?.url || null,
  audio: must(library.chapter.audio_url, "chapter audio"),
  t0: t0.t0,
  t1: t0.t1,
};

const out = {
  _about: "GENERATED by scripts/hero/build-moments.mjs from src/tour/rooms/*/data — do not edit by hand.",
  moments: { reading, proverb, verb, novel },
};
const text = `${JSON.stringify(out, null, 2)}\n`;

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { /* missing */ }
  if (current !== text) {
    console.error("heroMoments.json is stale — run: node scripts/hero/build-moments.mjs");
    process.exit(1);
  }
  console.log("heroMoments.json is current");
} else {
  writeFileSync(OUT, text);
  console.log(`wrote ${OUT} (${text.length} bytes)`);
}
