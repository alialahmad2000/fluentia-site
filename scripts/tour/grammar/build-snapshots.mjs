/**
 * build-snapshots — turn the raw read-only query results into the grammar room's data.
 *
 *   raw/reference.json    ← snapshot-reference.sql   (grammar_reference · present-perfect-vs-past)
 *   raw/unit-lesson.json  ← snapshot-unit.sql        (curriculum_grammar · L3 U4 passive voice)
 *
 *   node scripts/tour/grammar/build-snapshots.mjs
 *
 * 1. TRANSCRIPTION CHECK. The raw files were saved from the Supabase MCP by hand, so every
 *    content field is re-serialised the way Postgres prints jsonb and compared against the
 *    md5 the database returned for the same field (`md5(x::text)`). Any drift aborts.
 * 2. PUBLIC-SAFETY ASSERTS. No trainer layer (`teach` / board_ar / check_question_ar …),
 *    no audio, no student-owned rows, no more than the five sampled unit exercises.
 * 3. VISITOR FIXES, each listed in FIXES below and printed when applied:
 *    Western digits, masculine-generic instructions, two «؟» that were stored as «.».
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const OUT = join(ROOT, "src/tour/rooms/grammar/data");
const read = (f) => JSON.parse(readFileSync(join(HERE, "raw", f), "utf8"));

/* ── 1. transcription check ─────────────────────────────────────────────── */

/** Postgres jsonb::text — keys ordered by byte length then bytes, ", " and ": " separators. */
function jsonbText(v) {
  if (v === null) return "null";
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    return '"' + v.replace(/[\\"\u0000-\u001f]/g, (c) => {
      const m = { "\\": "\\\\", '"': '\\"', "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "\t": "\\t" };
      return m[c] ?? "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    }) + '"';
  }
  if (Array.isArray(v)) return "[" + v.map(jsonbText).join(", ") + "]";
  const keys = Object.keys(v).sort((a, b) => {
    const la = Buffer.byteLength(a), lb = Buffer.byteLength(b);
    return la !== lb ? la - lb : Buffer.compare(Buffer.from(a), Buffer.from(b));
  });
  return "{" + keys.map((k) => jsonbText(k) + ": " + jsonbText(v[k])).join(", ") + "}";
}
const md5 = (s) => createHash("md5").update(s, "utf8").digest("hex");

// Returned by the database on 2026-09-13 for exactly these fields (see snapshot-*.sql).
const EXPECTED = {
  "reference.content.sections": "7e0dee1817a825f022a543f9d205044a",
  "reference.drills": "e13d899c76d3a7aa49bd9b0ad71cb090",
  "reference.related": "8cf05de511425062f51e910b98d4be15",
  "reference.summary|title": "2d6b5f3e05177a504307b4fbad51d1e0",
  "unit.explanation_content": "742f30b4cb531290170d4ede80c7bc52",
  "unit.deep_content": "e89cebea4e4e0b9d2b3066132214387e",
  "unit.items.0": "669d3445be443abe5c1b267ecf03e3f5",
  "unit.items.2": "49bbd512bb8e2bb47164d40a6b9793ce",
  "unit.items.4": "f0ec969e0b8d9e2073634118424af4b7",
  "unit.items.6": "ff8b7d88d0696c5f43770c8ffbb60323",
  "unit.items.11": "9a4f651852ec701ef9b26ffb8fef31fb",
};

const ref = read("reference.json");
const unit = read("unit-lesson.json");

const actual = {
  "reference.content.sections": md5(jsonbText(ref.content.sections)),
  "reference.drills": md5(jsonbText(ref.drills)),
  "reference.related": md5(jsonbText(ref.related)),
  "reference.summary|title": md5(`${ref.summary_ar}|${ref.title_ar}`),
  "unit.explanation_content": md5(jsonbText(unit.explanation_content)),
  "unit.deep_content": md5(jsonbText(unit.deep_content)),
  ...Object.fromEntries(unit.exercises.map((e) => [`unit.items.${e.sort_order}`, md5(jsonbText(e.items))])),
};
let drift = 0;
for (const [k, want] of Object.entries(EXPECTED)) {
  const ok = actual[k] === want;
  if (!ok) drift++;
  console.log(`${ok ? "ok  " : "DIFF"} ${k}`);
}
if (drift) {
  console.error(`\n${drift} field(s) do not match the database — re-save raw/*.json from the MCP.`);
  process.exit(1);
}

/* ── 2. public-safety asserts ───────────────────────────────────────────── */

function assert(cond, msg) {
  if (!cond) { console.error("ASSERT FAILED: " + msg); process.exit(1); }
}

/* ── 3. visitor fixes ───────────────────────────────────────────────────── */

const applied = [];
const note = (what) => applied.push(what);

/** Arabic-Indic and Extended Arabic-Indic digits → Western (NUMERALS-UNIFY-v1). */
function westernDigits(node, path = "") {
  if (typeof node === "string") {
    const out = node
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
    if (out !== node) note(`digits → Western at ${path}: «${node.match(/[٠-٩۰-۹]+/g).join("، ")}»`);
    return out;
  }
  if (Array.isArray(node)) return node.map((x, i) => westernDigits(x, `${path}[${i}]`));
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, westernDigits(v, path ? `${path}.${k}` : k)]));
  }
  return node;
}

/* reference entry */
{
  const TRAINER_KEYS = ["board_ar", "analogy_ar", "if_stuck_ar", "check_question_ar", "misdiagnosis_ar"];
  assert(!ref.content.sections.some((s) => s.type === "teach"), "teach section present");
  const blob = JSON.stringify(ref);
  for (const k of TRAINER_KEYS) assert(!blob.includes(k), `trainer field ${k} present`);
  assert(!/\.mp3|audio|voice/i.test(blob), "audio reference present");

  let entry = westernDigits(ref, "reference");

  // Two example translations are questions stored with a full stop.
  entry.content.sections = entry.content.sections.map((s, si) => {
    if (s.type !== "examples") return s;
    return {
      ...s,
      items: s.items.map((it, ii) => {
        if (/\?\s*$/.test(it.en) && /^هل\s/.test(it.ar) && /\.\s*$/.test(it.ar)) {
          const ar = it.ar.replace(/\.\s*$/, "؟");
          note(`«؟» for a question at content.sections[${si}].items[${ii}]: «${ar}»`);
          return { ...it, ar };
        }
        return it;
      }),
    };
  });

  const { updated_at, ...rest } = entry;
  const data = { source: { table: "grammar_reference", id: ref.id, slug: ref.slug, updated_at, snapshot: "2026-09-13" }, ...rest };
  assert(!/[٠-٩]/.test(JSON.stringify(data)), "Arabic-Indic digit left in reference");
  writeFileSync(join(OUT, "reference.json"), JSON.stringify(data, null, 2) + "\n");
}

/* unit lesson */
{
  assert(unit.exercises.length === 5, "the unit sample must stay at five exercises (scored bank)");
  assert(new Set(unit.exercises.map((e) => e.exercise_type)).size === 5, "one exercise per type");

  let lesson = westernDigits(unit, "unit");

  // Stored instructions alternate «اختر» / «صحّحي» / «رتبي» / «املئي» inside one lesson.
  // Visitors are anonymous: masculine-generic, like the rest of fluentia.academy.
  const MASC = { "صحّحي": "صحّح", "صححي": "صحّح", "رتّبي": "رتّب", "رتبي": "رتّب", "املئي": "املأ", "اختاري": "اختر", "حوّلي": "حوّل", "حولي": "حوّل", "اكتبي": "اكتب", "أكملي": "أكمل" };
  lesson.exercises = lesson.exercises.map((ex) => ({
    ...ex,
    items: ex.items.map((it) => {
      let t = it.instruction_ar || "";
      for (const [f, m] of Object.entries(MASC)) t = t.replace(new RegExp(`(^|\\s)${f}(?=\\s|$)`, "g"), `$1${m}`);
      if (t !== it.instruction_ar) note(`instruction masculine-generic (${ex.exercise_type}): «${it.instruction_ar}» → «${t}»`);
      return { ...it, instruction_ar: t };
    }),
  }));
  assert(!lesson.exercises.some((e) => /(?:ي|ئي)(?=\s|$)/.test(e.items[0].instruction_ar.split(" ")[0])), "feminine imperative left in an instruction");

  // Two small Arabic slips in the explanation, fixed by hand.
  const sec = lesson.explanation_content.sections;
  const ex = sec.find((s) => s.type === "explanation");
  if (ex.content_ar.startsWith("الصوت المبني للمجهول")) {
    ex.content_ar = ex.content_ar.replace("الصوت المبني للمجهول يركز", "المبني للمجهول يركّز");
    note("«الصوت المبني للمجهول» (a calque of “passive voice”) → «المبني للمجهول»");
  }
  const egs = sec.find((s) => s.type === "examples");
  egs.items = egs.items.map((it) => {
    if (it.translation_ar === "تُصنع الكابتشينو بالحليب المبخر") {
      note("«تُصنع الكابتشينو» → «يُصنع الكابتشينو» (agreement)");
      return { ...it, translation_ar: "يُصنع الكابتشينو بالحليب المبخّر" };
    }
    return it;
  });

  // Generic lessons store the English topic in lower case, twice. Title-case the English and
  // give the header the Arabic name it renders whenever the two differ (as custom tracks do).
  lesson.topic_name_en = "Passive voice (present)";
  lesson.topic_name_ar = "المبني للمجهول في المضارع";
  note("topic name: «passive voice (present)» → «Passive voice (present)» + Arabic «المبني للمجهول في المضارع»");

  // The «تلميح» GrammarTab derives at render: the depth layer's first Arabic rule, else the formula.
  const hintAr =
    (lesson.deep_content?.sections || []).find((s) => s.type === "explanation" && s.content_ar)?.content_ar ||
    sec.find((s) => s.type === "formula")?.content || null;

  const data = {
    source: { table: "curriculum_grammar", id: unit.id, unit_id: unit.unit.id, exercise_sort_orders: unit.exercises.map((e) => e.sort_order), snapshot: "2026-09-13", owner_student_id: null },
    ...lesson,
    hintAr,
  };
  writeFileSync(join(OUT, "unit-lesson.json"), JSON.stringify(data, null, 2) + "\n");
}

console.log("\nvisitor fixes applied:");
for (const a of applied) console.log("  · " + a);
console.log(`\nwrote src/tour/rooms/grammar/data/{reference,unit-lesson}.json`);
