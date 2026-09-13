// TOUR PORT: vendored verbatim from fluentia-lms src/lib/numerals.js (origin/main 3396e97e).
/**
 * ONE definition of how a number is rendered on an Arabic surface.
 *
 * THE RULE (NUMERALS-UNIFY-v1, 2026-09-06): Western Arabic numerals everywhere —
 * 45, never ٤٥ — with the Arabic language around them untouched. Numbering
 * system and language are separate axes; changing one is not changing the other.
 *
 * Why this function still exists rather than every call site simply printing the
 * number: it did not before, and that is exactly how the platform ended up with
 * SEVENTY-ONE hand-rolled `String(n).replace(/\d/g, …)` digit maps across 69
 * files, under eight different names. Reversing that convention meant finding
 * all sixty-nine. There is now one, and the next change to this rule is one edit.
 *
 * Dates and times do NOT come through here. They are pinned platform-wide in
 * src/lib/intlDefaults.js (Gregorian calendar + `numberingSystem: 'latn'` on
 * every Intl formatter), so `toLocaleDateString('ar-SA', …)` is already correct
 * wherever it is called. Adding date functions here would be the fifth competing
 * date helper — see src/utils/dateHelpers.js for the date-fns one.
 *
 * LEFT IN PLACE ON PURPOSE: about twenty comments across the codebase justify a
 * bidi or layout workaround by the Arabic-Indic digits that used to be there —
 * «a middot beside an Arabic-Indic numeral gets reordered», «the Arabic-Indic
 * zero is itself a dot». The hazard goes with the digits; the workarounds are
 * harmless and were not unpicked inside a numerals build. They are safe to
 * simplify one surface at a time, each re-checked in a browser.
 *
 * AND NOT TOUCHED AT ALL: the INPUT normalisers. `normalize_sa_phone` in
 * Postgres, and the phone field in AdminStudents.jsx, translate Arabic-Indic
 * digits INTO Western because that is what a Saudi keyboard produces. Their
 * source alphabet is not a display convention and must never be "unified" —
 * this build did exactly that by accident and had to put it back.
 */

/** The locale tag to use when a formatter needs to be built by hand. */
export const AR_LOCALE = 'ar-SA-u-ca-gregory-nu-latn'

/**
 * A number, as this platform shows numbers.
 *
 * Deliberately NOT `Intl.NumberFormat`: most call sites here are counts, levels
 * and unit numbers («المستوى 3», «5 كلمات»), where a thousands separator would
 * be wrong, and several pass a string through unchanged. Null and undefined
 * render as an empty string rather than "null" or "0" — a missing count is not
 * a zero, and the surrounding copy already handles the empty case.
 */
export const arNum = (n) => (n == null ? '' : String(n))

/** The brief's name for the same thing. One body, so they cannot drift. */
export const formatNumberAr = arNum
