// ── Arabic grammatical-gender tone ─────────────────────────────────────────
// Arabic addresses people differently by gender: imperatives (ابدأ vs ابدئي),
// adjectives (مستعد vs مستعدة), pronouns (أنت vs أنتِ), greetings (بك vs بكِ).
// The original copy was written female-toned because the academy is mostly women;
// male students (Ali, Abdur Rahman, …) were being addressed as female. These
// helpers resolve the right form from the logged-in/impersonated student's gender
// (`students.gender`, already populated), so every second-person string can match.
//
// DEFAULT = 'female': the academy is overwhelmingly female and the existing copy is
// female-toned, so an unknown/null gender safely preserves the prior behavior — no
// regression for current students. Only an explicit 'male' flips to the male form.
//
// USAGE (React components):
//   import { useG } from '@/i18n/gender'
//   const g = useG()
//   <h1>{g('مرحباً بك', 'مرحباً بكِ')}</h1>     // g(MALE_form, FEMALE_form)
//   <button>{g('ابدأ', 'ابدئي')}</button>
//
// USAGE (non-React: utils, constants built at call time, toast helpers):
//   import { pickGender } from '@/i18n/gender'
//   toast(pickGender('أحسنت!', 'أحسنتِ!'))
//
// Only wrap strings whose male/female forms actually DIFFER in spelling
// (imperatives ـي, adjectives ـة, explicit kasra ـكِ/ـتِ). Plain unvocalized forms
// like "حسابك" / "أكملت" read correctly for BOTH genders — leave them alone.

// ── TOUR PORT (fluentia.academy/tour) ─────────────────────────────────────────
// Vendored from fluentia-lms src/i18n/gender.js (origin/main 3396e97e). The ONE change:
// there is no signed-in student and no auth store, so the reader's gender is pinned.
// Visitors are anonymous, and the public site addresses them masculine-generic
// («ابدأ»، «جرّب») — the LMS's own unknown-gender default is female, which would read
// «اختاري» to every visitor. So: gender = 'male', and genderizeText() converts the
// stored feminine copy exactly as it does for a male student inside the platform.
import { useMemo } from 'react'

const VISITOR_GENDER = 'male'

function normalize(g) {
  return g === 'male' ? 'male' : 'female'
}

/** Reactive grammatical gender of the current student: 'male' | 'female' (default 'female'). */
export function useGender() {
  return normalize(VISITOR_GENDER)
}

/**
 * Returns g(maleForm, femaleForm) → the form matching the current student's gender.
 * Reactive: re-renders when the student/gender changes (incl. admin impersonation).
 */
export function useG() {
  const gender = useGender()
  return useMemo(() => (male, female) => (gender === 'male' ? male : female), [gender])
}

/** Non-reactive read for non-component code. Reads the store at call time. */
export function getGender() {
  return normalize(VISITOR_GENDER)
}

/** Non-hook picker for utils/constants. pickGender(maleForm, femaleForm). */
export function pickGender(male, female) {
  return getGender() === 'male' ? male : female
}

// ── DB-content transform ────────────────────────────────────────────────────
// Some second-person Arabic is STORED in the database (exercise instructions,
// writing/speaking prompts) and was written female-toned, so the static UI
// helpers above can't gender it. genderizeText() rewrites a CURATED, bounded set
// of clearly-feminine imperatives/markers to their masculine form FOR MALE
// students only (females see the stored female text unchanged → no regression).
// Word-boundary aware (Arabic letters) so an imperative inside another word is
// never touched. Only well-known instruction verbs are listed — never arbitrary
// female-looking text — to avoid false positives.
const FEM_TO_MASC = {
  اكتبي: 'اكتب', ابدئي: 'ابدأ', ابدأي: 'ابدأ', اختاري: 'اختر', حاولي: 'حاول',
  أجيبي: 'أجِب', أجبي: 'أجِب', راجعي: 'راجع', أكملي: 'أكمل', اقرئي: 'اقرأ',
  استمعي: 'استمع', شاهدي: 'شاهد', حوّلي: 'حوّل', حولي: 'حوّل', صنّفي: 'صنّف',
  رتّبي: 'رتّب', رتبي: 'رتّب', طابقي: 'طابق', عبّري: 'عبّر', عبري: 'عبّر',
  اشرحي: 'اشرح', حدّدي: 'حدّد', حددي: 'حدّد', املئي: 'املأ',
  اربطي: 'اربط', لاحظي: 'لاحظ', انتبهي: 'انتبه', تذكّري: 'تذكّر', تذكري: 'تذكّر',
  سجّلي: 'سجّل', سجلي: 'سجّل', أعيدي: 'أعِد', كرّري: 'كرّر', كرري: 'كرّر',
  ترجمي: 'ترجم', استخدمي: 'استخدم', فكّري: 'فكّر', فكري: 'فكّر', تخيّلي: 'تخيّل',
  تخيلي: 'تخيّل', لخّصي: 'لخّص', لخصي: 'لخّص', قارني: 'قارن', اذكري: 'اذكر',
  أكمِلي: 'أكمل', أنتِ: 'أنت', بكِ: 'بك',
  // ── 2026-08-04: «تحدّثي» is all over the curriculum copy (speaking prompts,
  // unit ribbons) and was reaching male students unconverted. The rest are the
  // other instruction verbs the custom-track ribbons use. Bare «صفي» is
  // deliberately excluded — too short to substring-replace safely. ──
  تحدّثي: 'تحدّث', تحدثي: 'تحدّث', اطلبي: 'اطلب', اعرضي: 'اعرض',
  ناقشي: 'ناقش', وضّحي: 'وضّح', وضحي: 'وضّح', علّقي: 'علّق',
  // Added after the Scene beats shipped feminine to male students: these three were the
  // ones genderizeText did not cover. Kept as a net for any DB copy that uses them.
  اسمعي: 'اسمع', أدّي: 'أدِّ', ادّي: 'أدِّ',

  // ── 2026-08-24: the proverbs/idioms library («الأمثال» / «التعابير») is the
  // first body of DB copy that TEACHES in prose rather than instructing in one
  // verb, so it carries whole feminine SENTENCES — «تعرفينها لكنها لا تحضر»،
  // «انتظري حتى تهدأ الأمور». That exposed a real hole: until now this map had
  // ZERO present-tense entries, so every «تفعلين» form reached male students
  // untouched. Added below, longest-first where one key contains another.
  //
  // Each key is audited against naive split/join: a key is only safe if every
  // LONGER Arabic word containing it should convert too. Deliberately NOT added,
  // because each is a substring of an unrelated word:
  //   ضعي (وضعي، موضعي) · خذي (تأخذين، مأخذي) · دعي (أدعي، مدّعي)
  //   قولي (تقولي، مقولي، القولي) · تبين (يتبيّن — genuine homograph)
  //   عاملي (معاملي) · قدّمي (مقدّمي) · عيشي (معيشي)
  // Copy needing those was rewritten at the source instead.

  // Irregular (defective) verbs — the ـين does not simply drop, so these must
  // come BEFORE the bare stem or split/join would leave «ترىه».
  ترينها: 'تراها', ترينه: 'تراه', ترين: 'ترى',
  تتمنّينها: 'يتمنّاها', تتمنّين: 'تتمنّى', تنسين: 'تنسى',

  // Present tense, 2nd person feminine (ـين drops).
  تتوقعين: 'تتوقع', تستطيعين: 'تستطيع', تحتاجين: 'تحتاج', تريدين: 'تريد',
  تحفظين: 'تحفظ', تعرفين: 'تعرف', تسمعين: 'تسمع', تقدرين: 'تقدر',
  تنتظرين: 'تنتظر', تعتذرين: 'تعتذر', تختارين: 'تختار', تجدين: 'تجد',
  تسألين: 'تسأل', تنصحين: 'تنصح', تشوفين: 'تشوف', تملكين: 'تملك',
  تضعين: 'تضع', تصفين: 'تصف', تكتبين: 'تكتب', تقولين: 'تقول',
  تفهمين: 'تفهم', تشعرين: 'تشعر', تعملين: 'تعمل', تلاحظين: 'تلاحظ',
  تتحمّلين: 'تتحمّل', تتجنّبين: 'تتجنّب', تمنعين: 'تمنع', تتّخذين: 'تتّخذ',
  ترفضين: 'ترفض', تضيفين: 'تضيف', تكونين: 'تكون', تصبحين: 'تصبح',
  تفعلين: 'تفعل', تأخذين: 'تأخذ', تبنين: 'تبني', تتقنين: 'تتقن',

  // Subjunctive / jussive after لا · أن · حتى (bare ـي ending).
  تقفزي: 'تقفز', تؤجّلي: 'تؤجّل', تتجاوزي: 'تتجاوز', تنبشي: 'تنبش',
  تتحرّكي: 'تتحرّك', تظنّي: 'تظنّ', تقودي: 'تقود', تستفيدي: 'تستفيد',
  تصدّقي: 'تصدّق', تعاملي: 'تعامل', تطالَبين: 'تطالَب',

  // Imperatives this library uses that the curated list above did not cover.
  استعملي: 'استعمل', اصبري: 'اصبر', انتظري: 'انتظر', انظري: 'انظر',
  احذري: 'احذر', تمالكي: 'تمالك', نظّمي: 'نظّم', اتركي: 'اترك',
  ابحثي: 'ابحث', تحمّلي: 'تحمّل', ارفعي: 'ارفع', حطّي: 'حطّ',
  أرسلي: 'أرسل', اسألي: 'اسأل', واصلي: 'واصل', افرزي: 'افرز',
  جرّبي: 'جرّب', جربي: 'جرّب', اسكتي: 'اسكت', افتحي: 'افتح',
  اقبلي: 'اقبل', استعيدي: 'استعِد', أنجزي: 'أنجز', سامحي: 'سامح',
  بادري: 'بادر', أدرجي: 'أدرج', تعلّمي: 'تعلّم',
}
// Plain split/join (NO regex) — avoids lookbehind, which throws on iOS Safari < 16.4
// (the students' devices). Keys are distinctive female imperatives (ـي) / kasra
// markers, so substring false-positives in short prompt text are not a concern;
// the few risky short words (ضعي، صفي، صلي) are intentionally excluded.
const KASRA_KAF = '\u0643\u0650' // ـكِ
const KASRA_TAA = '\u062A\u0650' // ـتِ

const AR_RANGE = '\u0600-\u06FF\u0750-\u077F'
const PROCLITIC = '\u0648\u0641\u0644\u0628\u0643'          // و ف ل ب ك
const FEM_SUFFIX = '(?:\u0647\u0627|\u0647\u0645\u0627|\u0647\u0645|\u0647\u0646|\u0647|\u0646\u0627|\u0643\u0645|\u0643\u0646)'
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const _femRuleCache = new Map()
function femRule(k) {
  let re = _femRuleCache.get(k)
  if (!re) {
    re = new RegExp(`(^|[^${AR_RANGE}]|[${PROCLITIC}])(${escapeRe(k)})(${FEM_SUFFIX})?(?![${AR_RANGE}])`, 'g')
    _femRuleCache.set(k, re)
  }
  re.lastIndex = 0
  return re
}

function applyMasc(text) {
  let out = text
  // WORD-BOUNDARY AWARE, since 2026-08-30. `split(k).join(v)` matched a feminine form
  // ANYWHERE inside a longer word, so male students were shown non-words:
  // «المراجعين»→«المراجعن», «اشترينا»→«اشترىا», «المتعلّمين»→«المتعلّمن»,
  // «متضادّين»→«متضأدِّن». Fourteen distinct words across the grammar reference alone,
  // and the same helper feeds every Arabic surface in the app.
  //
  // LEFT context: start of string, a non-Arabic character, or a single-letter proclitic
  // (و/ف/ل/ب/ك) so «واكتبي» and «فاختاري» still convert.
  // RIGHT context: end, a non-Arabic character, or an attached object pronoun so
  // «حوّليها» and «سجّليها» still convert. BOTH are required — «ل» is also the lam of
  // the definite article, which is the only thing that separates a real «لتكتبي» from
  // the «واصلي» buried inside «الواصلين».
  for (const k in FEM_TO_MASC) {
    if (out.indexOf(k) === -1) continue
    out = out.replace(femRule(k), (_m, pre, _key, suf) => pre + FEM_TO_MASC[k] + (suf || ''))
  }
  // Catch-all for the explicit kasra on the 2nd-person suffixes ـكِ / ـتِ
  // (كنتِ، قلتِها، اعتدتِه، عليكِ، نفسكِ). Safe as a blanket rule because a kasra
  // is only a VOWEL MARK: dropping it never changes the consonant skeleton, so
  // the worst case inside an unrelated word (كِتاب → كتاب) is a no-op. This is
  // what makes the past-tense 2fs forms convert without enumerating them.
  if (out.indexOf(KASRA_KAF) !== -1) out = out.split(KASRA_KAF).join('ك')
  if (out.indexOf(KASRA_TAA) !== -1) out = out.split(KASRA_TAA).join('ت')
  return out
}

/** Transform stored female-toned text to the current student's gender (male-only). */
export function genderizeText(text) {
  if (typeof text !== 'string' || !text || getGender() !== 'male') return text
  return applyMasc(text)
}

/** Reactive hook: returns gz(text) for DB-sourced student-facing copy. */
export function useGenderize() {
  const gender = useGender()
  return useMemo(() => (text) => {
    if (typeof text !== 'string' || !text || gender !== 'male') return text
    return applyMasc(text)
  }, [gender])
}
