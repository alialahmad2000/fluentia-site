/**
 * TOUR PORT FIX. The platform renders Arabic rows that quote English
 * («very expensive», «the beans», cost ← cost) as one plain text run, so on a
 * phone a quoted phrase can break across lines with its words reordered. Here
 * every Latin run inside an Arabic string is isolated, and short runs are kept
 * on one line.
 */
const LATIN_RUN = /([A-Za-z][A-Za-z0-9'’-]*(?:[ ,.:]+[A-Za-z][A-Za-z0-9'’-]*)*)/g

export function isoLatin(text) {
  if (typeof text !== 'string' || !/[A-Za-z]/.test(text)) return text
  return text.split(LATIN_RUN).map((part, i) => (
    i % 2
      ? <bdi key={i} dir="ltr" className={`tx-en${part.length <= 28 ? ' is-short' : ''}`}>{part}</bdi>
      : part
  ))
}
