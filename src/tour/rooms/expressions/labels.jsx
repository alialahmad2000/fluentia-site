/**
 * Bilingual chrome for the expressions surfaces — ENGLISH LEADS.
 *
 * Everywhere else on the platform Arabic leads, and for good reason: it is the
 * language the student thinks in. But this feature teaches ENGLISH phrases, and
 * a page whose every label was Arabic hid the one distinction the whole product
 * rests on — nothing on the sheet said whether she was looking at a PROVERB or
 * an IDIOM. So the label carries the English term, with the Arabic beside it as
 * support rather than as the headline.
 */
import './labels.css'

export const KIND = {
  proverb:     { en: 'Proverb',     ar: 'مثل' },
  idiom:       { en: 'Idiom',       ar: 'تعبير' },
  preposition: { en: 'Preposition', ar: 'حرف الجر' },
}

export const FREQUENCY = {
  very_common: { en: 'Very common', ar: 'شائع جداً' },
  common:      { en: 'Common',      ar: 'شائع' },
  less_common: { en: 'Less common', ar: 'أقل شيوعاً' },
  dated:       { en: 'Dated',       ar: 'قديم — نادراً ما يُستعمل' },
  literary:    { en: 'Literary',    ar: 'أدبي — للكتابة لا للحديث' },
}

export const REGISTER = {
  formal:  { en: 'Formal',   ar: 'رسمي' },
  neutral: { en: 'Neutral',  ar: 'محايد' },
  casual:  { en: 'Informal', ar: 'ودّي وغير رسمي' },
  slang:   { en: 'Slang',    ar: 'عامّي جداً' },
}

/** Keyed on the theme SLUG, not the Arabic label — several slugs carry two
 *  different Arabic labels, so the slug is the only stable key. */
export const THEME = {
  adversity:   { en: 'Hardship & relief',   ar: 'الشدّة والفرج' },
  agreement:   { en: 'Agreeing & differing', ar: 'الاتفاق والخلاف' },
  attention:   { en: 'Noticing & following', ar: 'الانتباه والمتابعة' },
  caution:     { en: 'Caution',             ar: 'الحذر والتعقّل' },
  character:   { en: 'Character',           ar: 'الأخلاق والطبع' },
  contentment: { en: 'Contentment',         ar: 'الرضا والقناعة' },
  decision:    { en: 'Deciding',            ar: 'الحسم والقرار' },
  difficulty:  { en: 'Easy & hard',         ar: 'السهولة والصعوبة' },
  effort:      { en: 'Effort',              ar: 'العزيمة والجهد' },
  family:      { en: 'Family',              ar: 'الأهل والنسب' },
  feelings:    { en: 'Feelings',            ar: 'المشاعر والحال' },
  health:      { en: 'Health',              ar: 'الصحة والعافية' },
  learning:    { en: 'Learning',            ar: 'الدراسة والتعلّم' },
  money:       { en: 'Money',               ar: 'المال والإنفاق' },
  people:      { en: 'People & company',    ar: 'الناس والصحبة' },
  place:       { en: 'Place & direction',   ar: 'المكان والاتجاه' },
  social:      { en: 'Meeting people',      ar: 'اللقاءات والمجاملات' },
  society:     { en: 'Customs & society',   ar: 'العادات والمجتمع' },
  talk:        { en: 'Talk & secrets',      ar: 'الكلام والأسرار' },
  time:        { en: 'Time',                ar: 'الوقت والمبادرة' },
  trouble:     { en: 'Trouble',             ar: 'المشكلات والورطات' },
  work:        { en: 'Work',                ar: 'العمل والتنظيم' },
}

/** English lead, Arabic support, on one line. */
export function Bi({ en, ar, className = '' }) {
  if (!en && !ar) return null
  return (
    <span className={`xbi ${className}`.trim()}>
      {en ? <b dir="ltr">{en}</b> : null}
      {ar ? <em dir="rtl">{ar}</em> : null}
    </span>
  )
}

/** The badge that answers "is this a proverb or an idiom?" — the question the
 *  Arabic-only chrome left unanswered on every sheet. */
export function KindBadge({ kind, className = '' }) {
  const k = KIND[kind]
  if (!k) return null
  return (
    <span className={`xkind is-${kind} ${className}`.trim()}>
      <b dir="ltr">{k.en}</b><em dir="rtl">{k.ar}</em>
    </span>
  )
}

/** Theme falls back to whatever Arabic label the row carries if the slug is new. */
export function themeOf(expr) {
  const t = THEME[expr?.theme]
  return { en: t?.en ?? null, ar: t?.ar ?? expr?.theme_label_ar ?? null }
}
