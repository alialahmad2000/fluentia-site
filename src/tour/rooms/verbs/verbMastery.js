/**
 * «سُلّم الأفعال» — grading, error diagnosis, and drill construction.
 *
 * TOUR PORT of fluentia-lms src/services/verbMastery.js (origin/main 3396e97e).
 *
 * The grading half (normalize → letterDiff, ERROR_AR, STAGES) is copied
 * verbatim: the visitor is marked by exactly the checker students are.
 * Removed: ts-fsrs and the whole "Scheduling + persistence" section
 * (cardFromRow, ratingFor, nextSchedule, emptyCard, recordAttempt) — the tour
 * writes nothing and schedules nothing.
 *
 * Changed, and only in drill CONSTRUCTION (never in grading), to fix three
 * defects the live platform has (each marked «TOUR FIX» below):
 *   1. -e verbs got the non-word distractor base+'ed' (writeed, takeed).
 *   2. Verbs whose regular form is an accepted alternate (light, broadcast,
 *      kneel, speed) produced a one-option multiple choice.
 *   3. The session's "shuffle" always put the correct answer last; the new
 *      orderChoices() is a real deterministic shuffle.
 *
 * Everything hard about this system lives here, and all of it comes from one
 * decision: the student TYPES the answer. Multiple choice measures whether a
 * form looks familiar; it cannot tell a student who knows `sung` from one who
 * would have written `singed` given a blank box. The old verbs page was four
 * arcade games, all multiple choice, and nobody mastered anything.
 *
 * Typing means we own three problems the platform's generic validateAnswer
 * has never handled: alternates that are genuinely correct (learned/learnt),
 * spellings that are one letter off, and — the useful one — telling those two
 * apart from the four ways a learner is actually wrong.
 */

export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 }

// ──────────────────────────────────────────────────────────────────────────
// Normalising an answer
// ──────────────────────────────────────────────────────────────────────────

/** Everything that is not a spelling difference: case, spacing, the curly
 *  apostrophe an iPhone types, a trailing full stop, an infinitive "to". */
export function normalize(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[‎‏‪-‮]/g, '')   // stray bidi marks from an RTL keyboard
    .replace(/\s+/g, ' ')
    .replace(/^to\s+/, '')
    .replace(/^[^a-z']+|[^a-z']+$/g, '')
}

/** Every spelling we accept for one slot. `was/were` is stored as a single
 *  field because both ARE the past of `be`; a student who types either is
 *  right, and one who types "was/were" has understood the point. */
export function acceptedForms(primary, alts = []) {
  const out = new Set()
  const add = (x) => { const n = normalize(x); if (n) out.add(n) }
  for (const raw of [primary, ...(alts || [])]) {
    if (!raw) continue
    add(raw)
    if (String(raw).includes('/')) {
      String(raw).split('/').forEach(add)
      add(String(raw).replace(/\s*\/\s*/g, ' / '))
    }
  }
  return out
}

/** Levenshtein, bounded — we only ever care whether it is 0, 1, or 2. */
function editDistance(a, b, cap = 3) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > cap) return cap + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < best) best = cur[j]
    }
    if (best > cap) return cap + 1
    prev = cur
  }
  return prev[b.length]
}

/** The consonant skeleton. sing / sang / sung all reduce to "sng", which is
 *  exactly what makes them confusable — and what lets us say so. */
const skeleton = (s) => s.replace(/[aeiou]/g, '')

/** Every regular -ed form a learner might reasonably build from the base.
 *  Used to recognise *goed, *bringed, *runned — the single most diagnostic
 *  error there is, because it means the student applied a rule instead of
 *  recalling a word. */
export function regularForms(base) {
  const b = normalize(base)
  const out = new Set()
  if (!b) return out
  out.add(b + 'ed')
  if (b.endsWith('e')) out.add(b + 'd')
  if (/[^aeiou]y$/.test(b)) out.add(b.slice(0, -1) + 'ied')
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)) out.add(b + b.slice(-1) + 'ed')  // stop → stopped
  return out
}

// ──────────────────────────────────────────────────────────────────────────
// Grading one slot
// ──────────────────────────────────────────────────────────────────────────

export const ERROR_AR = {
  regularized: {
    title: 'قاعدة ed على فعل شاذّ',
    body: 'الفعل الشاذّ لا يأخذ ed أبداً. هذه هي علامة أن الذاكرة استدعت القاعدة بدل الكلمة، وعلاجها الوحيد هو الكتابة المتكرّرة لا القراءة.',
  },
  v2_v3_swap: {
    title: 'خلط بين التصريف الثاني والثالث',
    body: 'التصريف الثاني يقف وحده في الماضي البسيط. أما التصريف الثالث فلا يأتي إلا بعد have أو has أو had، أو في المبني للمجهول بعد was/were/is/are.',
  },
  wrong_vowel: {
    title: 'الهيكل صحيح وحرف العلّة خطأ',
    body: 'الحروف الساكنة كلّها في مكانها، والفرق في حرف علّة واحد — مثل sang و sung. هذه أقرب الأخطاء إلى الإتقان وأكثرها إلحاحاً.',
  },
  near_miss: {
    title: 'حرف واحد فقط',
    body: 'المعرفة موجودة والإملاء ينقص. حرف مضاعف أو حرف ساقط، وهو ما يُسقط الدرجة في الاختبارات الكتابية.',
  },
  wrong_verb: {
    title: 'تصريف فعل آخر',
    body: 'الإجابة تصريف صحيح، لكنه يخصّ فعلاً غير المطلوب. المعنى نفسه هو ما يحتاج تثبيتاً هنا، لا التصريف.',
  },
  blank: {
    title: 'لم تصل الكلمة',
    body: 'لا شيء مكتوب. تخطّي السؤال أسرع من التخمين، لكن الفعل يعود أقرب في المراجعة القادمة.',
  },
  other: {
    title: 'إجابة بعيدة',
    body: 'الكلمة المكتوبة بعيدة عن المطلوب. الأفضل مراجعة بطاقة الفعل كاملة قبل إعادة المحاولة.',
  },
}

/**
 * Grade one typed form.
 *
 * Returns { ok, kind, distance, matched }. `kind` is null when ok.
 *
 * `near_miss` is scored WRONG on purpose. A student who writes "writen" does
 * not know how to write "written", and an academy that waves that through is
 * the reason people arrive at an exam believing they knew a word. The UI
 * shows exactly which letter went missing and asks for it again — which is
 * kind — but the attempt is logged as a miss, which is honest.
 */
export function gradeSlot(given, { slot, base, v2, v3, altPast = [], altPart = [] }) {
  const g = normalize(given)
  const expectedRaw = slot === 'v1' ? base : slot === 'v2' ? v2 : v3
  const alts = slot === 'v2' ? altPast : slot === 'v3' ? altPart : []
  const accepted = acceptedForms(expectedRaw, alts)

  if (!g) return { ok: false, kind: 'blank', distance: null, expected: expectedRaw }
  if (accepted.has(g)) return { ok: true, kind: null, distance: 0, expected: expectedRaw }

  // The other two forms of THIS verb — the swap, and by far the most common
  // real error in written English ("I have went").
  const others = {
    v1: acceptedForms(base),
    v2: acceptedForms(v2, altPast),
    v3: acceptedForms(v3, altPart),
  }
  for (const [k, set] of Object.entries(others)) {
    if (k !== slot && set.has(g)) {
      return { ok: false, kind: 'v2_v3_swap', distance: null, expected: expectedRaw, matched: k }
    }
  }

  if (regularForms(base).has(g)) {
    return { ok: false, kind: 'regularized', distance: null, expected: expectedRaw }
  }

  const nearest = [...accepted].reduce(
    (best, a) => { const d = editDistance(g, a); return d < best.d ? { d, a } : best },
    { d: 99, a: null }
  )
  if (nearest.d <= 2 && g.length >= 3) {
    const sameBones = [...accepted].some((a) => skeleton(a) === skeleton(g) && a !== g)
    return {
      ok: false,
      kind: sameBones ? 'wrong_vowel' : 'near_miss',
      distance: nearest.d,
      expected: expectedRaw,
    }
  }
  if ([...accepted].some((a) => skeleton(a) === skeleton(g))) {
    return { ok: false, kind: 'wrong_vowel', distance: nearest.d, expected: expectedRaw }
  }
  return { ok: false, kind: 'other', distance: nearest.d, expected: expectedRaw }
}

/** Grade a whole verb (v2 + v3, or all three in the blind drill). */
export function gradeForms(answers, verb, slots = ['v2', 'v3']) {
  const spec = {
    base: verb.base_form, v2: verb.past_simple, v3: verb.past_participle,
    altPast: verb.alt_past || [], altPart: verb.alt_participle || [],
  }
  const per = slots.map((slot) => ({ slot, ...gradeSlot(answers[slot], { slot, ...spec }) }))
  const wrong = per.filter((r) => !r.ok)
  return {
    ok: wrong.length === 0,
    per,
    // The headline error is the most diagnostic one present, not the first.
    kind: wrong.length
      ? (['regularized', 'v2_v3_swap', 'wrong_vowel', 'near_miss', 'wrong_verb', 'blank', 'other']
          .find((k) => wrong.some((w) => w.kind === k)) || 'other')
      : null,
  }
}

/** Character-level diff for the "one letter off" panel — the student sees
 *  WHICH letter, which is the only feedback that fixes a spelling. */
export function letterDiff(given, expected) {
  const g = normalize(given), e = normalize(expected)
  const out = []
  let i = 0, j = 0
  while (i < g.length || j < e.length) {
    if (g[i] === e[j]) { out.push({ ch: e[j], t: 'same' }); i++; j++; continue }
    if (g[i + 1] === e[j]) { out.push({ ch: g[i], t: 'extra' }); i++; continue }
    if (g[i] === e[j + 1]) { out.push({ ch: e[j], t: 'missing' }); j++; continue }
    if (j < e.length) out.push({ ch: e[j], t: 'wrong' })
    i++; j++
  }
  return out
}

// ──────────────────────────────────────────────────────────────────────────
// Building the drills
// ──────────────────────────────────────────────────────────────────────────

/** TOUR FIX 2 — the -ing form, for the rare verb that has no other real
 *  distractor. `broadcast / broadcasting` is a genuine confusion (the
 *  progressive), where a padded non-word would not be. */
function ingForm(base) {
  const b = normalize(base)
  if (b.endsWith('ie')) return b.slice(0, -2) + 'ying'
  if (b.endsWith('e') && !b.endsWith('ee')) return b.slice(0, -1) + 'ing'
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)) return b + b.slice(-1) + 'ing'
  return b + 'ing'
}

/**
 * MCQ options that are worth getting wrong.
 *
 * Distractors are NOT other verbs. "Which is the past of sing — sang, ate, or
 * built?" tests nothing; a student answers it by recognising the shape of the
 * word. The confusions that matter are inside the verb itself: its own other
 * form, the -ed form the rule would produce, and the vowel next door. Those
 * three are the errors this system exists to kill, so those three are the
 * options.
 */
export function buildChoices(verb, slot) {
  const correct = slot === 'v2' ? verb.past_simple : verb.past_participle
  const other = slot === 'v2' ? verb.past_participle : verb.past_simple
  const base = verb.base_form
  const out = [correct]
  const push = (x) => {
    const n = normalize(x)
    if (!n || out.some((o) => normalize(o) === n)) return
    // Never offer a form we would MARK correct — an accepted alternate as a
    // wrong option is us being wrong, not the student.
    if (acceptedForms(correct, slot === 'v2' ? verb.alt_past : verb.alt_participle).has(n)) return
    out.push(x)
  }

  // 1. the verb's own other form — "I have went" in multiple-choice form
  push(other)

  // 2. the -ed form the rule would produce. Prefer the correctly-doubled one
  //    (getted, stopped): that is what a learner actually writes, and `geted`
  //    is a typo nobody makes.
  //    TOUR FIX 1 — and for a verb ending in -e, the form a learner builds is
  //    base+'d' (writed, taked). The live code took base+'ed' first, which
  //    offered `writeed`: a non-word nobody writes, so the option taught
  //    nothing and could be ruled out without knowing the verb.
  const reg = [...regularForms(base)]
  const b = normalize(base)
  push(
    reg.find((r) => r.length > base.length + 2)
    || (b.endsWith('e') ? reg.find((r) => r === b + 'd') : null)
    || reg.find((r) => r.endsWith('ied'))
    || reg[0]
  )

  // 3. the vowel next door — but ONLY in the families where the swap lands on
  //    a real word (sang↔sung, drank↔drunk). Everywhere else it manufactures
  //    a non-word, and a question whose wrong answers are gibberish can be
  //    answered without knowing anything.
  if (verb.rhyme_family === 'i-a-u' || verb.rhyme_family === 'i-u-u') {
    push(/a(?=[^aeiou]*$)/.test(correct)
      ? correct.replace(/a(?=[^aeiou]*$)/, 'u')
      : correct.replace(/u(?=[^aeiou]*$)/, 'a'))
  }

  // TOUR FIX 2 — never a one-option question. When the verb's own forms and
  // its regular form are all correct or identical (light/lit/lighted,
  // broadcast ×3), fall back to the confusions that are still real words:
  // the base itself, then the -ing form.
  if (out.length < 2) push(base)
  if (out.length < 2) push(ingForm(base))

  // Three real options beat four with a filler in it.
  return out.slice(0, 4)
}

/**
 * TOUR FIX 3 — a real deterministic shuffle.
 *
 * The live session shuffled with `j = (seed * (k + 7)) % (k + 1)`, which is 0
 * for every seed at k = 1 and k = 2, so a three-option question always came
 * out [b, c, a]: the answer was the last button, every time. This keys a
 * small PRNG on the verb and slot, so the order is stable across re-renders
 * and differs from verb to verb.
 */
export function orderChoices(opts, key) {
  let h = 2166136261
  for (const ch of String(key)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  let s = h >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...opts]
  for (let k = out.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1))
    ;[out[k], out[j]] = [out[j], out[k]]
  }
  return out
}

/**
 * Turn an example sentence into a cloze by blanking the form it contains.
 * The catalogue loader asserts every sentence contains its form, so this
 * cannot produce a question with no answer.
 */
export function buildCloze(verb, slot) {
  const sentence = slot === 'v2' ? verb.example_past : verb.example_participle
  const primary = slot === 'v2' ? verb.past_simple : verb.past_participle
  const alts = slot === 'v2' ? (verb.alt_past || []) : (verb.alt_participle || [])
  if (!sentence) return null
  const candidates = [...acceptedForms(primary, alts)].sort((a, b) => b.length - a.length)
  for (const form of candidates) {
    const re = new RegExp(`(^|[^A-Za-z])(${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})([^A-Za-z]|$)`, 'i')
    const m = sentence.match(re)
    if (m) {
      return {
        before: sentence.slice(0, m.index + m[1].length),
        after: sentence.slice(m.index + m[1].length + m[2].length),
        answer: m[2],
        slot,
      }
    }
  }
  return null
}

/** Which drill a card is due for, from the rung it sits on. */
export const STAGES = [
  { id: 'meet',      label: 'تعرّف',            hint: 'اقرأ البطاقة كاملة' },
  { id: 'recognize', label: 'اختيار',           hint: 'اختر التصريف الصحيح' },
  { id: 'forms',     label: 'التصريفان',        hint: 'اكتب الثاني والثالث' },
  { id: 'meaning',   label: 'المعنى',           hint: 'من العربية إلى الإنجليزية' },
  { id: 'usage',     label: 'في جملة',          hint: 'الصيغة الصحيحة داخل السياق' },
  { id: 'blind',     label: 'الاختبار الأعمى',  hint: 'التصريفات الثلاثة من الذاكرة' },
]

export const drillForStage = (stage) => STAGES[Math.min(Math.max(stage ?? 0, 0), 5)].id
