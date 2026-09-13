/**
 * fairGrader.js — THE one grader for every typed answer on the platform.
 *
 * WHY THIS EXISTS
 * ---------------
 * Until now six different graders lived in this repo, each a slightly different
 * `trim().toLowerCase() === correct_answer`. That contract is wrong for anything
 * the student PRODUCES rather than SELECTS, and production proved it:
 *
 *   «If it were possible to stop earthquakes, people would not suffer»
 *      → marked wrong; model said «If we could stop earthquakes, …»
 *      → a flawless second conditional, which is the entire skill being taught.
 *
 *   «The new banner is more eye-caching than the previous one.»
 *      → marked wrong; model said «… than the old one.»
 *      → the comparative-with-'than' target was hit exactly. One typo, one synonym.
 *
 *   «The basketball team doesn't have sny good players»
 *      → marked wrong for a single transposed letter.
 *
 * THE CONTRACT
 * ------------
 * Grade the SKILL the question targets, not the string the author happened to type.
 *
 *   Layer 1 (this file) — instant, offline, free. Says YES only when it is certain:
 *     surface variation that no teacher would ever deduct for. It NEVER guesses.
 *     Anything it cannot clear is escalated, not failed.
 *   Layer 2 (adjudicate-answer edge fn) — an AI second opinion, cached forever and
 *     fed back into the item's accepted_answers so Layer 1 catches it next time.
 *
 * So Layer 1's job is precision, not recall. A false ACCEPT here is a real bug
 * (it would teach a mistake); a false REJECT is merely an escalation.
 *
 * STRICT MODE
 * -----------
 * Spelling drills, the irregular-verb ladder and dictation grade the ORTHOGRAPHY —
 * forgiving a typo there deletes the entire exercise. Those callers pass
 * `strict: true`, which disables typo tolerance and every spelling-variant rule
 * while keeping the harmless ones (whitespace, smart quotes, trailing period).
 */

/* ─────────────────────────── character canon ─────────────────────────── */

const ZERO_WIDTH = /[​-‍⁠﻿]/g

/** Fold the characters a keyboard/OS silently substitutes. Never semantic. */
export function canon(s) {
  return String(s ?? '')
    .replace(ZERO_WIDTH, '')
    .replace(/[‘’ʼ′`´]/g, "'")  // typographic apostrophes
    .replace(/[“”″]/g, '"')
    .replace(/[‐-―−]/g, '-')              // every dash → hyphen-minus
    .replace(/ /g, ' ')                             // nbsp
    .replace(/(\d),(?=\d{3}\b)/g, '')                 // 700,000 -> 700000, before
    .toLowerCase()                                    // stripPunct can split it apart
    .replace(/\s+/g, ' ')
    .trim()
}

/** Drop punctuation entirely — keeps letters, digits, spaces, inner apostrophes. */
export function stripPunct(s) {
  return canon(s)
    // The apostrophe is DELETED, not spaced — «didn't» must collapse to «didnt»
    // so it matches a student who never typed the apostrophe at all. Replacing
    // it with a space yields «didn t» and silently fails, which is exactly the
    // regression the differential caught. Everything else becomes a space so
    // «word,word» does not fuse into one token.
    .replace(/'/g, '')
    .replace(/[.,!?;:"()[\]{}…-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ───────────────────────────── contractions ──────────────────────────── */

// Ordered: the irregulars first, then the productive n't / 're / 've / 'll rules.
const CONTRACTION_RULES = [
  [/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'],
  [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'],
  [/\bain't\b/g, 'is not'],
  [/\blet's\b/g, 'let us'],
  [/\b(\w+)n't\b/g, '$1 not'],
  [/\b(i)'m\b/g, '$1 am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they|there|that|this)'ll\b/g, '$1 will'],
  // 'd is genuinely ambiguous (would / had) — fold both sides to one marker.
  [/\b(i|you|he|she|it|we|they|there|that)'d\b/g, '$1 __d__'],
  // 's is is/has/possessive. Only expand after a pronoun/demonstrative, where a
  // possessive reading is impossible — «the doctor's bag» must stay untouched.
  [/\b(he|she|it|that|this|there|what|who|where|here)'s\b/g, '$1 is'],
]

export function expandContractions(s) {
  let out = canon(s)
  for (const [re, to] of CONTRACTION_RULES) out = out.replace(re, to)
  return out.replace(/\s+/g, ' ').trim()
}

/* ─────────────────────── spelling / locale variants ──────────────────── */

// Both directions fold to one canonical shape, so no pair needs listing twice.
const OUR_STEMS = /(col|hon|fav|behavi|neighb|lab|hum|rum|vap|harb|arm|end)$/
const RE_STEMS = /(cent|met|lit|theat|fib|calib)$/

const SPELLING_FOLDS = [
  [/\b(\w*)our\b/g, (m, p) => (OUR_STEMS.test(p) ? p + 'or' : m)],
  [/\b(\w+)isation\b/g, '$1ization'],
  [/\b(\w+)ising\b/g, '$1izing'],
  [/\b(\w+)ised\b/g, '$1ized'],
  [/\b(\w+)ise\b/g, '$1ize'],
  [/\b(\w+)ysed\b/g, '$1yzed'],
  [/\b(\w+)yse\b/g, '$1yze'],
  [/\b(\w+)re\b/g, (m, p) => (RE_STEMS.test(p) ? p + 'er' : m)],
  [/\btravell/g, 'travel'], [/\bcancell/g, 'cancel'], [/\bmodell/g, 'model'],
  [/\bpractise\b/g, 'practice'], [/\bdefence\b/g, 'defense'], [/\boffence\b/g, 'offense'],
  [/\blicence\b/g, 'license'], [/\bgrey\b/g, 'gray'], [/\bprogramme\b/g, 'program'],
  [/\bcheque\b/g, 'check'], [/\bstorey\b/g, 'story'], [/\btyre\b/g, 'tire'],
  [/\bjudgement\b/g, 'judgment'], [/\backnowledgement\b/g, 'acknowledgment'],
]

export function foldSpelling(s) {
  let out = s
  for (const [re, to] of SPELLING_FOLDS) out = out.replace(re, to)
  return out
}

/* ─────────────────────────── numbers as words ────────────────────────── */

const NUM_WORDS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6',
  seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12',
  thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
  eighteen: '18', nineteen: '19', twenty: '20', thirty: '30', forty: '40',
  fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
  hundred: '100', thousand: '1000', million: '1000000',
  first: '1st', second: '2nd', third: '3rd', fourth: '4th', fifth: '5th',
}

export function foldNumbers(s) {
  return s
    .replace(/\b([a-z]+)\b/g, (m) => NUM_WORDS[m] || m)
    .replace(/(\d),(?=\d{3}\b)/g, '')   // 700,000 → 700000
}

/* ───────────────────────────── hyphenation ───────────────────────────── */

/** «eye-catching» / «eye catching» / «eyecatching» all fold to «eyecatching». */
function joinCompounds(s) {
  return s.replace(/([a-z])[-\s]([a-z])/g, '$1$2')
}

/* ─────────────────────────── article dropping ────────────────────────── */

export function dropArticles(s) {
  return s.replace(/\b(a|an|the)\b/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ──────────────────── typo tolerance (guarded fuzzy) ─────────────────── */

/**
 * Closed-class words carry the grammar being tested. «is» vs «are», «has» vs
 * «have», «this» vs «these», «his» vs «her» are the LESSON, never a typo — so
 * these never fuzzy-match anything.
 */
const PROTECTED = new Set([
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

export function lev(a, b, cap = 3) {
  if (a === b) return 0
  const m = a.length, n = b.length
  if (Math.abs(m - n) > cap) return cap + 1
  if (!m) return n
  if (!n) return m
  let prev = new Array(n + 1)
  let cur = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    cur[0] = i
    let best = cur[0]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < best) best = cur[j]
    }
    if (best > cap) return cap + 1
    const t = prev; prev = cur; cur = t
  }
  return prev[n]
}

const INFL_SUFFIXES = ['ies', 'ied', 'ing', 'est', 'ed', 'es', 'er', 'ly', 's']

/**
 * Is one word just the other plus an inflectional ending?
 *
 * The naive version of this — strip a suffix from both and compare — is WRONG
 * and shipped a false accept: `stripInfl('need')` returns 'ne', because "need"
 * happens to END in "ed". So «These inventions needs electricity» was accepted
 * against «need», i.e. the grader forgave the exact subject–verb agreement the
 * question was testing. This checks the real relationship instead: is the longer
 * word the shorter one carrying a suffix?
 */
function isInflectionalPair(a, b) {
  if (a === b) return false
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  for (const suf of INFL_SUFFIXES) {
    if (!long.endsWith(suf) || long.length <= suf.length) continue
    const stem = long.slice(0, -suf.length)
    if (stem === short) return true                       // need + s
    if (stem + 'e' === short) return true                 // mak- + ing  ← make
    // study → studies : stem 'studi', short 'study'
    if (short.endsWith('y') && stem === short.slice(0, -1) + 'i') return true
    // run → running : stem 'runn', short 'run'
    if (stem.length > 1 && stem.slice(0, -1) === short && stem.at(-1) === short.at(-1)) return true
  }
  return false
}

/**
 * Is `cand` the SAME word as `want`, just mistyped?
 *
 * Refuses whenever the difference could be a real morphological contrast:
 *   walk/walks, walk/walked, book/books, big/bigger, run/ran …
 * Those are the answer, not a slip of the finger.
 */
export function isTypoOf(cand, want) {
  if (cand === want) return true
  if (!cand || !want) return false
  const len = Math.max(cand.length, want.length)
  // Both sides are function words: «is»/«are», «this»/«these», «some»/«any»,
  // «a»/«an», «his»/«her». That contrast IS the exercise — never bridge it.
  if (PROTECTED.has(cand) && PROTECTED.has(want)) return false
  if (isInflectionalPair(cand, want)) return false        // inflection, not a typo
  // One side is a function word and the other is not a word at all («sny» for
  // «any»). No lesson can hinge on that, so a single-character slip is forgiven.
  if (PROTECTED.has(cand) || PROTECTED.has(want)) {
    return len >= 3 && lev(cand, want, 1) <= 1
  }
  if (len < 5) return false                       // too short to guess safely
  const tol = len >= 9 ? 2 : 1
  return lev(cand, want, tol) <= tol
}

/** Two token lists equal, allowing per-token typos. Order and count must match. */
function tokensMatchFuzzy(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (!isTypoOf(a[i], b[i])) return false
  return true
}

/* ────────────────────────── slash alternatives ───────────────────────── */

/**
 * Authors write a genuinely open slot as «that/which» or «who/that». The slash
 * means "either of these", and the deployed validator honours it — dropping that
 * would mark a correct relative pronoun wrong.
 *
 * Disambiguated by SPACING, which is how the two conventions actually differ in
 * the bank: «that/which» (tight) is a choice, «told / had been» (spaced) is a
 * multi-blank separator. Getting this backwards would let a student answer one
 * blank of a two-blank question and pass.
 */
function slashAlternatives(s) {
  const t = String(s ?? '')
  if (!t.includes('/')) return null
  const parts = t.split('/').map((x) => x.trim()).filter(Boolean)
  // Gated on every part being a SINGLE word, so a real two-blank answer like
  // «was, were» is never loosened into "either will do".
  if (parts.length < 2 || parts.some((x) => /\s/.test(x))) return null
  return parts
}

/* ─────────────────────── multi-blank separators ──────────────────────── */

function splitMultiBlank(s) {
  return canon(s)
    .split(/\s*[,;/\\]\s*|\n|\s+-\s+|\s+&\s+|\s+and\s+/i)
    .map((t) => t.trim())
    .filter(Boolean)
}

/* ───────────────────────────── the ladder ────────────────────────────── */

const tok = (s) => (s ? s.split(' ').filter(Boolean) : [])

/**
 * Progressive normalisations, cheapest first. Each returns a comparable string.
 * `strict` stops the ladder before anything that would forgive a spelling error.
 */
function ladder(s, strict, closed = false) {
  const c = canon(s)
  const out = [c, stripPunct(c)]
  const noPunct = stripPunct(expandContractions(c))
  out.push(noPunct)
  if (strict) return out
  // A closed-set question stops here. Its options are deliberately MINIMAL
  // PAIRS, so the folds below erase the thing being tested: dropping articles
  // made «such an» match «such» on four real MCQ answers, and let
  // «We attended festival the last month» pass a reorder whose entire skill is
  // where «the» goes. Case, punctuation and contractions are still forgiven.
  if (closed) return out
  const folded = foldSpelling(noPunct)
  out.push(folded)
  out.push(joinCompounds(folded))
  out.push(foldNumbers(folded))
  out.push(dropArticles(folded))
  out.push(dropArticles(joinCompounds(foldNumbers(folded))))
  return out
}

/** Which rung matched — drives the Arabic note the student sees. */
const RUNG_NOTE = {
  1: null,                                   // punctuation only — say nothing
  2: null,                                   // contraction — say nothing
  3: { kind: 'spelling_variant', ar: 'إملاء بريطاني/أمريكي — كلاهما صحيح.' },
  4: { kind: 'hyphen', ar: 'الشرطة بين الكلمتين اختيارية هنا.' },
  5: { kind: 'numeral', ar: 'الرقم والكلمة كلاهما مقبول.' },
  6: { kind: 'article', ar: 'أداة التعريف لم تكن جزءاً من المطلوب.' },
  7: { kind: 'article', ar: 'أداة التعريف لم تكن جزءاً من المطلوب.' },
}

/* ────────────────────────── open-ended detection ─────────────────────── */

const OPEN_MARKERS = [
  /\(sample answer\)/i, /\(example\)/i, /your own/i, /answers? (will|may) vary/i,
  /\bopinion\b/i, /بأسلوبك/, /من عندك/, /إجابة نموذجية/,
]

/** A prompt whose model answer is one of many — string equality is meaningless. */
export function isOpenEnded({ questionText, correctAnswer }) {
  const hay = `${questionText || ''} ${correctAnswer || ''}`
  return OPEN_MARKERS.some((re) => re.test(hay))
}

/** Question types the student SELECTS from a closed set — never escalate those. */
export const CLOSED_TYPES = new Set([
  'choose', 'mcq', 'multiple_choice', 'true_false', 'matching', 'ordering', 'reorder',
])

/* ──────────────────────────────── API ────────────────────────────────── */

/**
 * @typedef {Object} GradeResult
 * @property {boolean} correct            Layer-1 verdict. `false` may still become
 *                                        true after adjudication — read `escalate`.
 * @property {'exact'|'normalized'|'tolerant'|'none'} confidence
 * @property {{kind:string, ar:string}|null} note   A gentle aside, not a deduction.
 * @property {boolean} escalate           Layer 2 should get a second opinion.
 * @property {string}  matched            The accepted answer that matched, if any.
 */

/**
 * @param {string} studentAnswer
 * @param {object} spec
 * @param {string|string[]} [spec.accepted]      accepted_answers
 * @param {string} [spec.correctAnswer]
 * @param {string} [spec.questionText]
 * @param {string} [spec.type]                   exercise/question type
 * @param {string} [spec.fullSentence]           fill_blank host sentence
 * @param {boolean} [spec.strict]                orthography IS the skill
 * @returns {GradeResult}
 */
export function gradeAnswer(studentAnswer, spec = {}) {
  const {
    accepted, correctAnswer, type = '',
    fullSentence = '', strict = false,
    originalSentence = '', allowPartial = false,
  } = spec

  const rawPool = (Array.isArray(accepted) ? accepted : accepted ? [accepted] : [])
    .concat(correctAnswer ? [correctAnswer] : [])
    .map((a) => String(a ?? ''))
  const pool = rawPool
    // Authors leave editorial tails on model answers; they are not part of the answer.
    .map((a) => a.replace(/\s*\((sample answer|example|or similar)\)\s*$/i, '').trim())
    .filter(Boolean)

  // «that/which» contributes both branches as accepted answers in their own
  // right, and a student who writes BOTH alternatives back is also correct.
  const allAlts = []
  for (const a of [...pool]) {
    const alts = slashAlternatives(a)
    if (alts) { pool.push(...alts); allAlts.push(...alts.map((x) => canon(x))) }
  }

  const raw = String(studentAnswer ?? '').trim()
  if (!raw) return miss(false)
  if (!pool.length) return miss(!CLOSED_TYPES.has(type))

  // «Complete with your own idea» has no single right answer. A key explicitly
  // marked "(sample answer)" is ONE example, and grading against it as if it
  // were THE answer is how «If I lived in an earthquake zone, I would take
  // safety measures» got marked wrong. Any substantive attempt counts.
  const isSample = rawPool.some((a) => /\bsample answer\b/i.test(a))
  if (isSample && !strict) {
    const words = canon(raw).split(' ').filter(Boolean).length
    if (words >= 3) {
      return { correct: true, confidence: 'normalized', note: null, escalate: false, matched: '' }
    }
    return miss(true)
  }

  const closed = CLOSED_TYPES.has(type)
  const studentRungs = ladder(raw, strict, closed)

  for (const ans of pool) {
    const ansRungs = ladder(ans, strict, closed)
    for (let r = 0; r < studentRungs.length; r++) {
      if (!studentRungs[r] || !ansRungs[r]) continue
      if (studentRungs[r] === ansRungs[r]) {
        return {
          correct: true,
          confidence: r === 0 ? 'exact' : 'normalized',
          note: RUNG_NOTE[r] || null,
          escalate: false,
          matched: ans,
        }
      }
    }

    // Multi-blank: «can, can't» vs «can — can't» vs «can / can't».
    const sTok = splitMultiBlank(raw).map((t) => stripPunct(expandContractions(t)))
    const aTok = splitMultiBlank(ans).map((t) => stripPunct(expandContractions(t)))
    if (sTok.length > 1 && sTok.length === aTok.length && sTok.every((t, i) => t === aTok[i])) {
      return { correct: true, confidence: 'normalized', note: null, escalate: false, matched: ans }
    }
    // Counts differ — she wrote «Have seen» for a «Have / seen» two-blank key,
    // i.e. the same words without the separator. Compare the joined forms, as
    // the deployed validator does.
    if (sTok.length && aTok.length && sTok.length !== aTok.length &&
        sTok.join(' ') === aTok.join(' ')) {
      return { correct: true, confidence: 'normalized', note: null, escalate: false, matched: ans }
    }

    // fill_blank: she retyped the whole sentence around the right word.
    if (fullSentence && !closed) {
      const sFlat = stripPunct(expandContractions(raw))
      const aFlat = stripPunct(expandContractions(ans))
      if (aFlat && sFlat.length > aFlat.length && new RegExp(`\\b${escapeRe(aFlat)}\\b`).test(sFlat)) {
        const hostWords = tok(stripPunct(fullSentence.replace(/_{2,}|\.{3,}/g, ' ')))
        const extra = tok(sFlat).filter((w) => !hostWords.includes(w) && !tok(aFlat).includes(w))
        if (extra.length === 0) {
          return {
            correct: true,
            confidence: 'normalized',
            note: { kind: 'whole_sentence', ar: 'الكلمة الناقصة وحدها كانت تكفي — لكن إجابتك صحيحة.' },
            escalate: false,
            matched: ans,
          }
        }
      }
    }

    // Typo tolerance — last rung, and never in strict mode.
    if (!strict && !closed) {
      const sT = tok(dropArticles(foldSpelling(stripPunct(expandContractions(raw)))))
      const aT = tok(dropArticles(foldSpelling(stripPunct(expandContractions(ans)))))
      if (sT.length && tokensMatchFuzzy(sT, aT)) {
        // Pair each mistyped word with its correction. Showing «caching» alone
        // tells her something is wrong without telling her what right looks
        // like — the correction is the entire teaching value of the note.
        //
        // Phrased NOMINALLY on purpose. This module is pure (no React, so no
        // useG), and «انتبه» would address every female student in the
        // masculine — most of this academy. A nominal phrase is correct for
        // everyone and needs no gender map.
        const pairs = sT.map((w, i) => [w, aT[i]]).filter(([a, b]) => a !== b)
        return {
          correct: true,
          confidence: 'tolerant',
          note: pairs.length
            ? {
                kind: 'typo',
                ar: `إجابة صحيحة — مع تصحيح إملائي: ${pairs.map(([a, b]) => `«${a}» ← «${b}»`).join('، ')}.`,
                fix: pairs.map(([, b]) => b),
              }
            : null,
          escalate: false,
          matched: ans,
        }
      }
    }
  }

  // She answered «Which/That» to a «that/which» key — every token she gave is a
  // listed alternative, so she has named the right options.
  if (allAlts.length) {
    const sAlts = splitMultiBlank(raw).map((t) => canon(t)).filter(Boolean)
    if (sAlts.length && sAlts.every((t) => allAlts.includes(t))) {
      return { correct: true, confidence: 'normalized', note: null, escalate: false, matched: '' }
    }
  }

  // She typed ONLY the word she changed. «caught» for «The octopus caught a small
  // fish», «Have been studying» for the full corrected sentence. That is a
  // correct answer to an error-correction prompt, and the deployed validator has
  // always accepted it — dropping the behaviour would mark 37 real answers in the
  // current bank wrong that are accepted today.
  //
  // Guarded the same way it always was: the fragment must appear in the MODEL
  // answer and must NOT appear in the ORIGINAL faulty sentence, so it can only be
  // the correction and never a phrase copied from the prompt.
  if (allowPartial && originalSentence && !strict && !closed) {
    const sFrag = stripPunct(expandContractions(raw))
    const origin = stripPunct(expandContractions(originalSentence))
    if (sFrag.length >= 2 && !origin.includes(sFrag)) {
      for (const ans of pool) {
        if (stripPunct(expandContractions(ans)).includes(sFrag)) {
          return {
            correct: true,
            confidence: 'normalized',
            note: { kind: 'partial', ar: 'صحيح — والإجابة الكاملة مذكورة بالأسفل.' },
            escalate: false,
            matched: ans,
          }
        }
      }
    }
  }

  // Nothing matched. A closed-set question is simply wrong; a produced answer
  // deserves a second opinion before we tell a student she failed.
  return miss(!closed)
}

function miss(escalate) {
  return { correct: false, confidence: 'none', note: null, escalate, matched: '' }
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

/**
 * Should Layer 2 be asked at all? Kept separate so callers can decide to skip
 * the round-trip (offline, timed exam, closed-set question) without duplicating
 * the type logic.
 */
export function shouldAdjudicate(result, spec = {}) {
  if (!result || result.correct) return false
  if (spec.strict) return false
  if (CLOSED_TYPES.has(spec.type)) return false
  if (!result.escalate) return false
  return String(spec.studentAnswer ?? '').trim().length >= 2
}

export default gradeAnswer
