import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { g } from './visitor'

/* TOUR PORT of fluentia-lms src/pages/student/expressions/_parts.jsx (3396e97e).
   Changes: `useG()` → the visitor's masculine-generic `g`; `arNum` inlined
   (it is String(n) on the platform, Western digits). Everything else verbatim. */
const arNum = (n) => String(n)

/* Shared pieces for both expression worlds.
   Every component here is declared at MODULE level. Declaring one inside a page
   component remounts it on every render, which silently eats keystrokes in the
   production textarea and restarts audio mid-clip. */

export const toAr = arNum
/* Arabic counts the noun differently at 1 / 2 / 3-10 / 11+. «١٢ مثل» is simply
   wrong; this is the same ladder the dialogues surface uses. */
export const proverbsAr = (n) => (n === 1 ? 'مثل واحد' : n === 2 ? 'مثلان'
  : n <= 10 ? `${toAr(n)} أمثال` : `${toAr(n)} مثلاً`)
export const idiomsAr = (n) => (n === 1 ? 'تعبير واحد' : n === 2 ? 'تعبيران'
  : n <= 10 ? `${toAr(n)} تعابير` : `${toAr(n)} تعبيراً`)

/* ── one clip at a time ──────────────────────────────────────────────────
   A single shared element, attached to the document. A detached `new Audio()`
   is garbage-collected mid-playback on iPad and the clip dies silently. */
let sharedEl = null
let currentToken = 0
function el() {
  if (sharedEl) return sharedEl
  sharedEl = document.createElement('audio')
  sharedEl.preload = 'none'
  sharedEl.setAttribute('playsinline', '')
  sharedEl.style.display = 'none'
  sharedEl.dataset.tourAudio = 'expressions'
  document.body.appendChild(sharedEl)
  return sharedEl
}

/** Plays one url, cancelling whatever was playing. Resolves when it ends. */
export function playOnce(url) {
  const a = el()
  const token = ++currentToken
  try { a.pause() } catch { /* nothing was playing */ }
  a.src = url
  a.currentTime = 0
  return new Promise((resolve) => {
    const done = () => {
      a.removeEventListener('ended', done)
      a.removeEventListener('error', done)
      resolve(token === currentToken)
    }
    a.addEventListener('ended', done)
    a.addEventListener('error', done)
    a.play().catch(done)
  })
}

export function stopAudio() {
  currentToken++
  if (!sharedEl) return
  try { sharedEl.pause() } catch { /* nothing was playing */ }
}

/** A play button that knows whether it is the clip currently sounding. */
export function PlayButton({ url, label, playingLabel = 'جارٍ التشغيل…' }) {
  const text = label ?? g('استمع', 'استمعي')
  const [busy, setBusy] = useState(false)
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])

  const onClick = useCallback(async () => {
    if (!url) return
    if (busy) { stopAudio(); setBusy(false); return }
    setBusy(true)
    await playOnce(url)
    if (alive.current) setBusy(false)
  }, [url, busy])

  if (!url) return null
  return (
    <button type="button" className="expr-play" aria-pressed={busy} onClick={onClick}>
      {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Volume2 size={15} aria-hidden />}
      {busy ? playingLabel : text}
    </button>
  )
}

/** Plays a whole two-line exchange in order, then stops. */
export function PlayDialogue({ lines }) {
  const [busy, setBusy] = useState(false)
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])
  const urls = (lines ?? []).map((l) => l.audio_url).filter(Boolean)

  const onClick = useCallback(async () => {
    if (busy) { stopAudio(); setBusy(false); return }
    setBusy(true)
    for (const u of urls) {
      const finished = await playOnce(u)
      if (!finished || !alive.current) break   // superseded or unmounted
    }
    if (alive.current) setBusy(false)
  }, [busy, urls])

  if (!urls.length) return null
  return (
    <button type="button" className="expr-play" aria-pressed={busy} onClick={onClick}>
      {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Volume2 size={15} aria-hidden />}
      {busy ? 'جارٍ التشغيل…' : g('استمع إلى الحوار بصوتين', 'استمعي إلى الحوار بصوتين')}
    </button>
  )
}

export function StepHead({ n, title, hint }) {
  return (
    <div className="expr-steph">
      <span className="expr-stepn" aria-hidden>{toAr(n)}</span>
      <b>{title}</b>
      {hint ? <span className="hint">— {hint}</span> : null}
    </div>
  )
}

/** Highlights the expression inside its dialogue line so the eye lands on it. */
export function markExpression(text, expression) {
  if (!text || !expression) return text
  const STOP = new Set(['the', 'a', 'an', 'and', 'but', 'you', 'your', 'that',
    'this', 'with', 'for', 'not', "don't", 'can', 'his', 'her', 'their', 'are', 'was'])
  const words = String(expression).toLowerCase().replace(/[^a-z' ]/g, ' ')
    .split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w))
  if (!words.length) return text

  // Find the tightest span covering the expression's content words, tolerating
  // inflection ("spill" → "spilled", "bite" → "biting") and the small joining
  // words the frame allows between them.
  const tokens = String(text).split(/(\s+)/)
  const isHit = (tok) => {
    const t = tok.toLowerCase().replace(/[^a-z']/g, '')
    return words.some((w) => t.startsWith(w.slice(0, Math.max(3, w.length - 2))))
  }
  let first = -1; let last = -1
  tokens.forEach((tok, i) => { if (/\S/.test(tok) && isHit(tok)) { if (first < 0) first = i; last = i } })
  if (first < 0) return text

  // Pull in the expression's own SHORT words at the edges.
  //
  // The content-word filter drops anything under three letters, which is fine
  // for "spill the beans" and useless for "on Monday" — the preposition IS the
  // lesson and it was the one word never highlighted. Only words the expression
  // itself contains are added, so this cannot run away into the sentence.
  const own = new Set(String(expression).toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean))
  const bare = (tok) => tok.toLowerCase().replace(/[^a-z']/g, '')
  while (first - 2 >= 0 && own.has(bare(tokens[first - 2]))) first -= 2
  while (last + 2 < tokens.length && own.has(bare(tokens[last + 2]))) last += 2
  if (last < first) return text

  return (
    <>
      {tokens.slice(0, first).join('')}
      <mark>{tokens.slice(first, last + 1).join('')}</mark>
      {tokens.slice(last + 1).join('')}
    </>
  )
}
