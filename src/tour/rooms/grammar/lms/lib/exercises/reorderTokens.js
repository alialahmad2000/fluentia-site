// TOUR PORT: vendored verbatim from fluentia-lms src/lib/exercises/reorderTokens.js (origin/main 3396e97e).
/**
 * The chips a reorder question shows, never in the answer's own order.
 *
 * WHY: 115 of the 218 reorder items in the bank store `options` in the exact
 * order of `correct_answer`, and ReorderQuestion rendered that array as-is —
 * so better than half of all reorder questions printed their own answer as the
 * prompt and measured nothing. questionIntegrity.js already names the defect
 * (`reorder_already_ordered`, severity FREE) and says outright that "the
 * renderer never shuffled the chips"; this is the missing half.
 *
 * MCQ needed no equivalent — MCQQuestion already seed-shuffles its options, and
 * reading and listening were swept earlier. Grammar grading compares option TEXT
 * through fairGrader and never an index, so reordering cannot affect scoring.
 * Do NOT reuse this for listening/reading items, which key their answer by
 * `correct_answer_index`.
 *
 * SEEDED on the question, matching MCQQuestion's approach: the order is stable
 * across re-renders and reloads, so chips never jump under the student's finger
 * mid-answer, and a retry shows the same board rather than a new puzzle.
 */

/** FNV-1a + xorshift — same construction MCQQuestion uses, so both feel alike. */
function seededShuffle(list, seed) {
  let h = 2166136261
  const s = String(seed || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rand = () => {
    h ^= h << 13; h >>>= 0
    h ^= h >>> 17
    h ^= h << 5; h >>>= 0
    return h / 4294967296
  }
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const norm = (v) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * @param {string[]} options    the word chips as stored
 * @param {string}   correct    the target sentence
 * @param {string}   seedKey    stable per question (id, else the prompt)
 * @returns {string[]} the same chips, not in the target's order
 */
export function shuffleReorderTokens(options, correct, seedKey) {
  const list = Array.isArray(options) ? options.filter((o) => o != null && o !== '') : []
  if (list.length < 2) return list
  const target = norm(correct)
  let out = list
  // Re-seed rather than re-roll, so the result stays a pure function of the
  // question. A 2-chip question can only have one other arrangement, and a list
  // of identical chips has none — hence the bounded loop and the fallback.
  for (let i = 0; i < 12; i++) {
    out = seededShuffle(list, `${seedKey || ''}#${i}`)
    if (!target || norm(out.join(' ')) !== target) return out
  }
  return out
}

export default shuffleReorderTokens
