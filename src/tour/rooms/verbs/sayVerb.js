/**
 * The tour's stand-in for the platform's `pronounceWord(word, { url })`.
 *
 * The LMS helper cannot come along: it queries curriculum_vocabulary, falls
 * back to a paid TTS edge function, and INSERTs a telemetry row per tap. On
 * the verb surface it only ever plays a known clip, so this keeps just the
 * parts that matter there:
 *   - single flight: a new tap stops the clip still playing;
 *   - one reused <audio> element, started synchronously inside the tap, which
 *     is what iOS Safari requires (no await before play());
 *   - bytes primed ahead of the tap as a blob: URL, so a tap plays from memory.
 * Keyed by URL, not by word — the LMS cache keyed by word and let the first
 * URL win.
 */
const blobs = new Map()     // url → blob: URL
const warming = new Map()   // url → Promise
let el = null

export function primeClips(urls) {
  for (const url of urls) {
    if (!url || blobs.has(url) || warming.has(url)) continue
    const p = fetch(url)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (b && b.size) blobs.set(url, URL.createObjectURL(b)) })
      .catch(() => {})
      .finally(() => warming.delete(url))
    warming.set(url, p)
  }
}

export function sayVerb(url) {
  if (!url || typeof Audio === 'undefined') return
  if (!el) {
    el = new Audio()
    el.preload = 'auto'
  }
  try { el.pause() } catch { /* nothing playing */ }
  const src = blobs.get(url) || url
  el.src = src
  const mine = el.src
  const p = el.play()
  if (p && typeof p.catch === 'function') {
    p.catch((err) => {
      // A primed blob can be refused by an older WebKit (NotSupportedError);
      // the plain file always works. An AbortError means a newer tap took
      // over — leave that one alone.
      if (err?.name === 'NotSupportedError' && src !== url && el.src === mine) {
        el.src = url
        el.play().catch(() => {})
      }
    })
  }
}
