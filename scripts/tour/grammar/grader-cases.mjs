/**
 * grader-cases — the grammar room's drills, graded offline by the platform's REAL grader.
 *
 *   node scripts/tour/grammar/grader-cases.mjs
 *
 * Grades every written drill of the snapshot twice: with PRODUCTION's call shape
 * (fluentia-lms _drills.jsx) and with the TOUR's (src/tour/rooms/grammar/lms/reference/_drills.jsx),
 * both against the vendored, unmodified fairGrader.js. Then the unit lesson's two
 * allowPartial types, with and without the tour's falseAcceptGuard. Fails unless the tour rejects every
 * wrong form and accepts every right one. The production column documents the live bug.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { gradeAnswer, canon } = await import(pathToFileURL(join(ROOT, "src/tour/rooms/grammar/lms/lib/grading/fairGrader.js")).href);
const entry = JSON.parse(readFileSync(join(ROOT, "src/tour/rooms/grammar/data/reference.json"), "utf8"));

const wrongSentenceOf = (d) => {
  if (d.type !== "error_correction") return null;
  const m = String(d.q_en || "").match(/[:：]\s*(.+)$/s);
  return m ? m[1].trim().replace(/^['"«]|['"»]$/g, "") : null;
};

// Written() in _drills.jsx, parameterised by the one line that differs.
function grade(d, val, shape) {
  const wrongSentence = wrongSentenceOf(d);
  if (wrongSentence && canon(val) === canon(wrongSentence)) return false;
  const fill = shape === "production"
    ? { fullSentence: d.q_en, originalSentence: d.q_en, allowPartial: true }
    : { fullSentence: d.q_en };
  return gradeAnswer(val, {
    accepted: d.accepted, correctAnswer: d.correct_answer, questionText: d.q_en, type: d.type,
    ...(d.type === "fill_blank" ? fill : { originalSentence: wrongSentence || d.q_en, strict: true }),
  }).correct;
}

const CASES = {
  fill_blank: {
    right: ["has worked", "Has worked", "'s worked", "has been working", "She has worked in this department since March.", "has workd"],
    wrong: ["worked", "working", "has work", "have worked", "works", "is working", "had worked", "has", "work"],
  },
  error_correction: {
    right: ["I visited my grandmother last Friday.", "i visited my grandmother last friday", "Last Friday I visited my grandmother."],
    wrong: ["I have visited my grandmother last Friday.", "visited", "I visit my grandmother last Friday.", "I visted my grandmother last Friday."],
  },
  transform: {
    right: ["They opened a second branch in 2018.", "In 2018 they opened a second branch."],
    wrong: ["They have opened a second branch in 2018.", "opened", "They opened a second branch.", "They open a second branch in 2018."],
  },
};

let failures = 0;
const rows = [];
for (const d of entry.drills.filter((x) => CASES[x.type])) {
  for (const [expect, list] of Object.entries(CASES[d.type])) {
    for (const val of list) {
      const prod = grade(d, val, "production");
      const tour = grade(d, val, "tour");
      const want = expect === "right";
      if (tour !== want) failures++;
      rows.push([d.type, JSON.stringify(val), want ? "accept" : "reject", prod ? "accept" : "reject", tour ? "accept" : "reject", tour === want ? "ok" : "FAIL", prod !== want ? "← live bug" : ""]);
    }
  }
}
/* ── unit lesson: TransformQuestion / ErrorCorrectionQuestion / FillBlankQuestion ──────
 * production = fairGrader as the platform calls it; tour = the same, through guardFalseAccept. */
const { guardFalseAccept } = await import(pathToFileURL(join(ROOT, "src/tour/rooms/grammar/lms/lib/grading/falseAcceptGuard.js")).href);
const lesson = JSON.parse(readFileSync(join(ROOT, "src/tour/rooms/grammar/data/unit-lesson.json"), "utf8"));
const UNIT_CASES = {
  transform: {
    right: ["Coffee is drunk all over the world.", "coffee is drunk all over the world", "drunk", "is drunk", "Cofee is drunk all over the world."],
    wrong: ["is", "Coffee is", "Coffee is drinked all over the world.", "Coffee is drink all over the world.", "Coffee is drank all over the world.", "People drink coffee all over the world."],
  },
  fill_blank: {
    right: ["are printed", "Are printed", "are prnted"],
    wrong: ["is printed", "printed", "are print", "are printing"],
  },
  error_correction: {
    right: ["Cappuccino is prepared with espresso and steamed milk.", "prepared", "is prepared", "Cappuccino is prepared with espreso and steamed milk."],
    wrong: ["ared", "Cappuccino is prepare with espresso and steamed milk.", "Cappuccino is preparing with espresso and steamed milk.", "is"],
  },
};
for (const ex of lesson.exercises.filter((e) => UNIT_CASES[e.exercise_type])) {
  const item = ex.items[0];
  // the exact call each unit component makes
  const call = (v) => gradeAnswer(v, ex.exercise_type === "fill_blank"
    ? { accepted: item.accepted_answers, correctAnswer: item.correct_answer, questionText: item.question, type: "fill_blank", fullSentence: item.question }
    : { accepted: item.accepted_answers, correctAnswer: item.correct_answer, questionText: item.question, type: ex.exercise_type, originalSentence: item.question, allowPartial: true });
  for (const [expect, list] of Object.entries(UNIT_CASES[ex.exercise_type])) {
    for (const val of list) {
      const prod = call(val).correct;
      const tour = guardFalseAccept(call(val), val, item.question).correct;
      const want = expect === "right";
      if (tour !== want) failures++;
      rows.push([`unit ${ex.exercise_type}`, JSON.stringify(val), want ? "accept" : "reject", prod ? "accept" : "reject", tour ? "accept" : "reject", tour === want ? "ok" : "FAIL", prod !== want ? "← live bug" : ""]);
    }
  }
}

const w = [22, 58, 7, 11, 7, 5];
console.log(["type", "answer", "want", "production", "tour", ""].map((h, i) => h.padEnd(w[i] || 0)).join(" "));
for (const r of rows) console.log(r.map((c, i) => String(c).padEnd(w[i] || 0)).join(" "));
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall tour gradings as expected");
process.exit(failures ? 1 : 0);
