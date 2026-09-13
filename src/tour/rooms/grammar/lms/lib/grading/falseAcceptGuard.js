/**
 * falseAcceptGuard — TOUR-ONLY. Not part of fluentia-lms.
 *
 * The unit's TransformQuestion and ErrorCorrectionQuestion call fairGrader with
 * `allowPartial: true`, so a student may type only the word she changed («drunk»,
 * «prepared») and be marked right. fairGrader's guard for that path is "the fragment
 * appears in the model answer and not in the prompt" — a SUBSTRING test. Measured on this
 * lesson's items, that also accepts:
 *   «is» and «Coffee is» for "Change to passive: People drink coffee all over the world."
 *   «ared» (a piece of "prepared") for the cappuccino error-correction item.
 * None of those contains the change the question is about.
 *
 * The typo rung has the same hole from the other side: «drink» is one letter from «drunk»,
 * so "Coffee is drink all over the world." came back correct «مع تصحيح إملائي» on the one
 * item whose whole point is the irregular participle. English strong verbs change their
 * stem VOWEL (drink/drank/drunk, sing/sang/sung, begin/began/begun): a one-letter "typo"
 * that only swaps i/a/u is the grammar, not a slip, so that accept is refused too.
 *
 * So a PARTIAL accept (and only that kind) stands here only if the fragment is made of
 * whole words of the model answer, and at least one of them is a content word the prompt
 * does not already contain. Every other verdict passes through untouched, and fairGrader.js
 * stays byte-identical to the platform's. Proven in scripts/tour/grammar/grader-cases.mjs.
 */
import { stripPunct, expandContractions } from './fairGrader.js'

// fairGrader's PROTECTED set (not exported there): the closed-class words that carry grammar.
const FUNCTION_WORDS = new Set([
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done', 'has', 'have', 'had',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'a', 'an', 'the', 'some', 'any', 'no', 'not', 'never',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'his', 'hers', 'its', 'my', 'your', 'our', 'their', 'mine', 'yours', 'theirs',
  'this', 'that', 'these', 'those', 'there', 'here',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'into', 'than', 'then',
  'and', 'or', 'but', 'if', 'so', 'because', 'while', 'when', 'where', 'who', 'whom',
  'whose', 'which', 'what', 'why', 'how', 'more', 'most', 'less', 'least', 'as', 'too',
  'much', 'many', 'few', 'little', 'very', 'ever', 'yet', 'still', 'just', 'only', 'also',
])

const words = (s) => stripPunct(expandContractions(String(s ?? ''))).split(' ').filter(Boolean)

const ABLAUT = new Set(['i', 'a', 'u'])
/** «drink» → «drunk»: same length, exactly one differing letter, both of them i / a / u. */
function isStemVowelSwap(a, b) {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0, ok = true
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue
    diff++
    if (!ABLAUT.has(a[i]) || !ABLAUT.has(b[i])) ok = false
  }
  return diff === 1 && ok
}

export function guardFalseAccept(result, studentAnswer, originalSentence) {
  if (result?.correct && result.note?.kind === 'typo') {
    const fix = result.note.fix || []
    const typed = String(result.note.ar || '').match(/«([^»]+)» ← «([^»]+)»/g) || []
    const pairs = typed.map((m) => m.match(/«([^»]+)» ← «([^»]+)»/).slice(1, 3))
    return pairs.some(([a, b]) => isStemVowelSwap(a, b)) && fix.length
      ? { ...result, correct: false, confidence: 'none', note: null, matched: '' }
      : result
  }
  if (!result?.correct || result.note?.kind !== 'partial') return result
  const frag = words(studentAnswer)
  const model = new Set(words(result.matched))
  const prompt = new Set(words(originalSentence))
  const wholeWords = frag.length > 0 && frag.every((w) => model.has(w))
  const carriesTheChange = frag.some((w) => !prompt.has(w) && !FUNCTION_WORDS.has(w))
  return wholeWords && carriesTheChange
    ? result
    : { ...result, correct: false, confidence: 'none', note: null, matched: '' }
}

export default guardFalseAccept
