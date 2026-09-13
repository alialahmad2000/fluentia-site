// TOUR PORT: vendored from fluentia-lms src/pages/student/grammar-reference/_ar.jsx
// (origin/main 3396e97e). Only the import paths changed.
/**
 * Rendering Arabic prose that quotes English — the single most bug-prone string on a
 * bilingual page, and the reason this is one shared helper rather than inline JSX.
 *
 * Two separate bidi failures have to be handled, and isolateLatin only covers one:
 *
 *  1. a MULTI-word Latin run inside Arabic reorders its words — isolateLatin wraps
 *     those in <bdi dir="ltr">, pulling the matching opening bracket inside so
 *     "(Present Perfect)" cannot paint as ")Present Perfect)".
 *  2. a LONE trailing Latin word is NOT wrapped by isolateLatin, and the sentence's
 *     final «.» is bidi-neutral — so it resolves against the RTL paragraph and paints
 *     on the wrong side (".works" instead of "works."). That is what LONE_TAIL fixes.
 *
 * Doing this at RENDER time rather than in the content means all ~309 entries are
 * correct by construction; the alternative was rewriting thousands of authored
 * sentences to never end on an English word, which would have made the Arabic worse.
 *
 * genderizeText runs first so second-person Arabic matches the reader. Content is
 * authored in the first-person plural precisely so this rarely has to do anything.
 */
import { genderizeText } from '../i18n/gender'
import { isolateLatin } from '../grammar/RichText'

const AR_LETTERS = '\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF'
/* The trailing Latin RUN, not just a trailing Latin WORD.
 *
 * isolateLatin wraps multi-word Latin runs in <bdi> but leaves the sentence's final stop
 * OUTSIDE it, and a bidi-neutral «.» resolves against the RTL paragraph — so
 * «… ولا نقول We have been owning it.» painted its period on the wrong side, on 529 items
 * across 185 of 309 entries. The old pattern rescued only a SINGLE trailing word, so every
 * multi-word quotation — the standard shape of a «انتبه» item — fell through.
 *
 * The Arabic question mark is the same trap from the other side: U+061F is Bidi_Class AL,
 * so a «؟» following an isolate welds onto the run's first Latin glyph
 * («؟He ate up the rice»). It has to be pulled inside the isolate too. */
const LONE_TAIL = new RegExp(
  `^([\\s\\S]*[${AR_LETTERS}])([^A-Za-z]*?)((?:[A-Za-z][A-Za-z'’-]*(?:\\s+[A-Za-z][A-Za-z'’-]*)*)[)"'\\]]?[.!?\\u061F\\u060C]*)\\s*$`
)

/* Latin tokens carrying an apostrophe, isolated one by one.
 *
 * isolateLatin deliberately skips SINGLE-word Latin runs — a lone word reorders fine on its
 * own. An apostrophe does not: it is bidi-neutral, so «'s» in an RTL paragraph paints as
 * «s'», and «it's» can split. That put the mark on the wrong side in the two entries whose
 * whole subject is where the apostrophe goes — `possessive-s`, whose own Arabic title is
 * «صيغة الملكية 's», and `s-vs-of`.
 *
 * So every apostrophe-bearing Latin token gets its own <bdi> before the normal pass. */
const APOS_TOKEN = /(['’][A-Za-z]+|[A-Za-z]+['’][A-Za-z]*)/g

function isolateApostrophes(text, key) {
  const str = String(text ?? '')
  if (!/['’]/.test(str)) return null
  const parts = str.split(APOS_TOKEN)
  if (parts.length < 2) return null
  return parts.map((part, i) =>
    APOS_TOKEN.test(part) && /['’]/.test(part) && /[A-Za-z]/.test(part)
      ? <bdi key={`${key}-a${i}`} dir="ltr" lang="en">{part}</bdi>
      : part
  )
}

export function renderAr(text, key = 'ar') {
  const s = genderizeText(String(text ?? '')) || ''
  const m = s.match(LONE_TAIL)
  if (!m) {
    // no Latin tail — but an apostrophe may still be sitting loose inside the Arabic
    return isolateApostrophes(s, key) ?? isolateLatin(s, key)
  }
  return [
    isolateApostrophes(m[1], key) ?? isolateLatin(m[1], key),
    m[2],
    <bdi key={`${key}-tail`} dir="ltr" lang="en">{m[3]}</bdi>,
  ]
}

/** Arabic paragraph, bidi-correct. Use this instead of {someArabicString}. */
export function Ar({ text, className = '', style, k = 'ar', as: Tag = 'p' }) {
  if (!text) return null
  return (
    <Tag className={`font-['Tajawal'] ${className}`} dir="rtl" style={{ lineHeight: 1.85, ...style }}>
      {renderAr(text, k)}
    </Tag>
  )
}
