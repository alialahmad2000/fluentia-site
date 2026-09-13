import verbsData from './data/verbs.json'
import familiesData from './data/families.json'

/**
 * The room's static snapshot, shaped the way the ported components read it.
 *
 * verbs.json    — irregular_verbs rows (scripts/tour/verbs/snapshot.mjs)
 * families.json — verb_families + counts (scripts/tour/verbs/families.sql)
 */
export const VERBS = verbsData.verbs
export const FAMILIES = familiesData.families
export const CATALOGUE_TOTAL = familiesData.catalogue_total

export const verbByBase = (base) => VERBS.find((v) => v.base_form === base) || null
const V = (base) => {
  const v = verbByBase(base)
  if (!v) throw new Error(`verbs snapshot is missing «${base}»`)
  return v
}

/**
 * The demo session — one verb per rung, each showing a different drill and a
 * different named error to try (see tour-research/verbs.md §4). A real
 * newcomer's first session is six teaching cards; this is a composite of what
 * the ladder asks over several weeks, and the page says so.
 *
 *   go    · rung 0 · تعرّف          — the teaching card, with its three clips
 *   sing  · rung 1 · اختيار         — sung → v2_v3_swap, singed → regularized
 *   write · rung 2 · التصريفان      — writen → near_miss + letter diff + retype
 *   drink · rung 4 · في جملة        — drank → v2_v3_swap + trap note
 *   begin · rung 5 · الاختبار الأعمى — all three forms from «يبدأ»
 */
export const DEMO_QUEUE = [
  { verb: V('go'), stage: 0, reps: 0, mastery: 'new' },
  { verb: V('sing'), stage: 1, reps: 0, mastery: 'learning' },
  { verb: V('write'), stage: 2, reps: 1, mastery: 'learning' },
  { verb: V('drink'), stage: 4, reps: 3, mastery: 'learning' },
  { verb: V('begin'), stage: 5, reps: 4, mastery: 'learning' },
].map((r) => ({ ...r, verb_id: r.verb.id }))

/**
 * One verb on its own — what tapping a verb row opens on the platform. A
 * visitor has never met it, so it starts where a new card starts (the
 * teaching card) and then asks for the two forms once.
 */
export const singleVerbQueue = (base) => {
  const v = verbByBase(base)
  if (!v) return null
  return [
    { verb: v, verb_id: v.id, stage: 0, reps: 0, mastery: 'new' },
    { verb: v, verb_id: v.id, stage: 2, reps: 1, mastery: 'learning' },
  ]
}

/**
 * «مثال لتقدّم طالب» — an ILLUSTRATIVE state, not a real student's and not the
 * visitor's. Plausible for someone about eight weeks in at six new verbs a
 * week: 48 verbs started out of the 163. The three errors are the three the
 * design document names as most common, and the shaky rows are verbs whose
 * forms this room can actually play and drill.
 */
export const SAMPLE = {
  spread: { mastered: 11, solid: 16, learning: 21, new: CATALOGUE_TOTAL - 48 },
  errors: { regularized: 6, v2_v3_swap: 4, wrong_vowel: 3 },
  shaky: [
    { verb: V('bring'), misses: 4, last_error_kind: 'regularized' },
    { verb: V('swim'), misses: 3, last_error_kind: 'wrong_vowel' },
    { verb: V('ring'), misses: 2, last_error_kind: 'v2_v3_swap' },
  ],
}
