// TOUR PORT: vendored verbatim from fluentia-lms src/lib/exercises/splitPrompt.js (origin/main 3396e97e).
/**
 * Split an exercise prompt into the INSTRUCTION and the SENTENCE it acts on.
 *
 * 524 of the 682 error_correction/transform items in the bank are stored as one
 * run-on string:
 *
 *   Find and correct the error: 'Everyone must to read the client's feedback…'
 *   Rewrite as a question: 'They have to arrive at nine.'
 *
 * Rendered as a single line, the instruction and the material the student has to
 * work on look identical, so she has to parse out which part she is meant to fix.
 * Splitting them lets the card show the task quietly and the sentence loudly.
 *
 * PRESENTATION ONLY — do NOT feed the result to fairGrader as `originalSentence`.
 * That was tried and measured against all 682 items in the bank: it flips 14 grading
 * outcomes from wrong to RIGHT, and every one of them is a student typing a single
 * word. fairGrader's partial-credit path accepts a fragment that appears in the model
 * answer but not in `originalSentence`, so passing the WHOLE prompt is load-bearing —
 * the instruction's own quoted target ("they", "how much", "inasmuch as") sits in that
 * haystack and is what stops a bare «They» scoring full marks on
 * «Rewrite for 'they': 'He can play football.'». Leave the grader call sites alone.
 *
 * Conservative by design: only the «lead: "sentence"» shape is split. Anything
 * else is returned untouched as the sentence, so a prompt that simply contains a
 * colon is never mangled.
 */
const PROMPT_RE = /^([^:"'‘“«]{2,80}):\s*["'‘“«]([\s\S]+?)["'’”»]\s*\.?$/

export function splitPrompt(question) {
  const raw = typeof question === 'string' ? question.trim() : ''
  if (!raw) return { lead: '', sentence: '' }
  const m = raw.match(PROMPT_RE)
  if (!m) {
    // Second pass: some leads quote a target form themselves, e.g.
    // «Rewrite using 'going to': 'I will call him tomorrow.'». Split on the LAST
    // colon, and accept only when the tail is FULLY quoted and carries no colon of
    // its own — so «Correct: 'He said: hello.'» is left alone rather than cut in half.
    const i = raw.lastIndexOf(':')
    if (i > 1 && i < 80) {
      const tail = raw.slice(i + 1).trim()
      const t = tail.match(/^["'‘“«]([\s\S]+?)["'’”»]\s*\.?$/)
      if (t && !t[1].includes(':')) {
        const lead2 = raw.slice(0, i).trim()
        if (lead2) return { lead: lead2, sentence: t[1].trim() }
      }
    }
    return { lead: '', sentence: raw }
  }
  const lead = m[1].trim()
  const sentence = m[2].trim()
  if (!sentence) return { lead: '', sentence: raw }
  return { lead, sentence }
}

/** The sentence the student is actually working on — safe for any prompt shape. */
export function promptSentence(question) {
  return splitPrompt(question).sentence
}

export default splitPrompt
