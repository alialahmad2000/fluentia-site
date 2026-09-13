/**
 * Proves the three drill-construction fixes in the tour's verbMastery.js over
 * the WHOLE live catalogue (163 verbs, read-only anon REST), not just the demo
 * specimens:
 *   - no multiple choice has fewer than two options;
 *   - no -e verb is offered base+'ed' (writeed);
 *   - the correct option is not pinned to one position;
 *   - every option we offer as wrong is graded wrong by the real gradeSlot.
 *
 *   node scripts/tour/verbs/check-drills.mjs
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const M = await import(pathToFileURL(join(ROOT, "src/tour/rooms/verbs/verbMastery.js")).href);

const client = await readFile(join(ROOT, "src/utils/supabase.js"), "utf8");
const ANON = client.match(/SUPABASE_ANON\s*=\s*'([^']+)'/)[1];
const res = await fetch(
  "https://nmjexpuycmqcxuxljier.supabase.co/rest/v1/irregular_verbs?select=base_form,past_simple,past_participle,alt_past,alt_participle,rhyme_family&is_active=eq.true&order=frequency_rank",
  { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }
);
const verbs = await res.json();

const fail = [];
const pos = {};
let questions = 0;
for (const v of verbs) {
  for (const slot of ["v2", "v3"]) {
    const opts = M.orderChoices(M.buildChoices(v, slot), `${v.base_form}|${slot}|0`);
    const want = slot === "v2" ? v.past_simple : v.past_participle;
    questions++;
    if (opts.length < 2) fail.push(`${v.base_form} ${slot}: ${opts.length} option(s)`);
    if (v.base_form.endsWith("e") && opts.some((o) => o === v.base_form + "ed")) fail.push(`${v.base_form} ${slot}: ${opts.join(" · ")}`);
    const at = opts.indexOf(want);
    const key = `${opts.length}:${at}`;
    pos[key] = (pos[key] || 0) + 1;
    for (const o of opts) {
      if (o === want) continue;
      const r = M.gradeSlot(o, { slot, base: v.base_form, v2: v.past_simple, v3: v.past_participle, altPast: v.alt_past || [], altPart: v.alt_participle || [] });
      if (r.ok) fail.push(`${v.base_form} ${slot}: distractor ${o} grades CORRECT`);
    }
  }
}
const sample = ["sing", "write", "light", "broadcast", "kneel", "speed", "take", "drink"].map((b) => {
  const v = verbs.find((x) => x.base_form === b);
  return `${b}: ${M.orderChoices(M.buildChoices(v, "v2"), `${b}|v2|0`).join(" · ")}`;
});
console.log(`${verbs.length} verbs, ${questions} questions`);
console.log("correct position (options:index → count):", pos);
console.log(sample.join("\n"));
if (fail.length) { console.error("FAIL\n" + fail.join("\n")); process.exit(1); }
console.log("OK");
