// TOUR PORT: vendored verbatim from fluentia-lms src/pages/student/grammar-reference/_speak.js (origin/main 3396e97e).
/**
 * Zero-cost pronunciation. The browser's own speech synthesis — no audio assets, no
 * storage, no TTS bill, and it works offline. The Pro Desk already ships this exact
 * recipe; reusing it keeps the reference free.
 *
 * Single-flight: stacking utterances is the vocab-audio bug, where two taps produced
 * two overlapping voices. cancel() before every speak().
 */
export function speak(text, { rate = 0.92, lang = 'en-US' } = {}) {
  try {
    const synth = window.speechSynthesis
    if (!synth || !text) return false
    synth.cancel()
    const u = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, ''))
    u.lang = lang
    u.rate = rate
    synth.speak(u)
    return true
  } catch { return false }
}
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window
