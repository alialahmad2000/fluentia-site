import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, X, ArrowRight, Lightbulb, CornerDownLeft, Volume2, Keyboard } from 'lucide-react'
import {
  gradeSlot, gradeForms, buildChoices, orderChoices, buildCloze, letterDiff,
  drillForStage, ERROR_AR, STAGES,
} from './verbMastery'
import { sayVerb, primeClips } from './sayVerb'

/**
 * TOUR PORT of fluentia-lms src/pages/student/verbs/VerbSession.jsx
 * (origin/main 3396e97e). Same markup, classes, copy and motion.
 *
 * Stripped: recordAttempt (one RPC per answer and per teaching card), useG,
 * the Supabase-backed pronounceWord. The session now reports each graded
 * answer to the room through `onAttempt`, which only colours the atlas dots
 * for this visit — nothing is written anywhere.
 *
 * TOUR FIXES, each marked below:
 *   - the Enter-to-continue listener was bound to `window`; it is now scoped
 *     to this session's own element;
 *   - the first input was focused 120ms after every question mounted, even on
 *     page load; it is now focused only once the visitor is working the
 *     session, and never scrolls the page;
 *   - an Arabic keyboard graded as «لم تصل الكلمة — لا شيء مكتوب»; the visitor
 *     now gets a gentle «اكتب بالإنجليزية» instead of a graded miss;
 *   - multiple choice uses orderChoices (the answer was always the last button).
 */

const toAr = (n) => (n == null ? '' : String(n))
/* Arabic counts its noun differently at 1 / 2 / 3-10 / 11+. «٢ فعل» is simply
   wrong, and this surface says a count out loud on every screen. */
const verbsAr = (n) => (n === 1 ? 'فعل واحد' : n === 2 ? 'فعلان'
  : n <= 10 ? `${toAr(n)} أفعال` : `${toAr(n)} فعلاً`)

/* the platform's gender helper, fixed to the masculine-generic the public
   site speaks in (visitors are anonymous) */
const g = (m) => m

/* Arabic script, including presentation forms — what an iPhone's Arabic
   keyboard actually emits */
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
const typedArabic = (s) => ARABIC.test(String(s || ''))

/** Latin runs inside Arabic prose need isolating or bidi reorders them —
 *  «وwhen» paints as «wheng» without it. Declared above FormsCard because the
 *  V3 label («بعد have») is itself mixed-script. */
export const En = ({ children }) => <span className="vl-en">{children}</span>

/** TOUR — the hint that replaces a graded "blank" when the keyboard is Arabic. */
function ArabicHint() {
  return (
    <p className="vl-arhint" role="status">
      <Keyboard size={14} aria-hidden style={{ flex: 'none' }} />
      <span>اكتب بالإنجليزية — لوحة المفاتيح الآن على العربية</span>
    </p>
  )
}

/** The three forms as a card. The same block appears in the teaching step, in
 *  every answer panel, and in the atlas — one visual, learned once. */
export function FormsCard({ verb, reveal = { v1: true, v2: true, v3: true }, compact, hit }) {
  // `sang` and `sung` differ by one vowel. A student who has only ever READ
  // them cannot hear the difference, so every revealed form is tappable.
  // The clip is our own — voiced once, slowly — copied into the tour.
  const AUDIO = { 1: verb.audio_base_url, 2: verb.audio_past_url, 3: verb.audio_pp_url }

  useEffect(() => {
    primeClips([verb.audio_base_url, verb.audio_past_url, verb.audio_pp_url])
  }, [verb.audio_base_url, verb.audio_past_url, verb.audio_pp_url])

  const cell = (k, tag, word, note) => {
    const shown = reveal[`v${k}`]
    const url = AUDIO[k]
    return (
      <div className={`vl-form vl-form--${k}${hit ? ' vl-form--hit' : ''}`} key={k}
        style={hit ? { animationDelay: `${(k - 1) * 70}ms` } : undefined}>
        <span className="vl-form__tag">{tag}</span>
        <span className="vl-form__word">{shown ? word : '—'}</span>
        {note && shown ? <span className="vl-form__note">{note}</span> : null}
        {shown && url ? (
          <button
            type="button" className="vl-form__say"
            aria-label={`استمع إلى ${word}`}
            onClick={(e) => {
              e.stopPropagation()
              // No await: fire inside the gesture, or iOS refuses to play.
              sayVerb(url)
            }}
          >
            <Volume2 size={13} />
          </button>
        ) : null}
      </div>
    )
  }
  return (
    <div className="vl-forms">
      {cell(1, 'الأصل', verb.base_form, compact ? null : 'V1')}
      {cell(2, 'الماضي', verb.past_simple, compact ? null : 'V2')}
      {cell(3, <>بعد <En>have</En></>, verb.past_participle, compact ? null : 'V3')}
    </div>
  )
}

function Diff({ given, expected }) {
  const parts = letterDiff(given, expected)
  return (
    <span className="vl-diff" aria-label={expected}>
      {parts.map((p, i) => <span key={i} className={`d-${p.t}`}>{p.ch}</span>)}
    </span>
  )
}

/**
 * One session over a queue of cards.
 *
 * The drill is chosen by the rung the card sits on, so the question always
 * sits at the edge of what the student can already do: a verb met yesterday
 * gets multiple choice, a verb held for three weeks gets a blank page and its
 * Arabic meaning.
 */
export default function VerbSession({ queue, onDone, onExit, onAttempt, mode = 'session' }) {
  const blindRun = mode === 'placement' || mode === 'test'
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)     // null = unanswered
  const [retype, setRetype] = useState(null)     // the one-letter-off second pass
  const [tally, setTally] = useState({ right: 0, wrong: 0, items: [], mastered: [] })
  const first = useRef(null)
  const rootRef = useRef(null)
  // TOUR FIX — has the visitor actually touched this session yet?
  const engaged = useRef(false)

  const row = queue[i]
  const verb = row?.verb

  const choices = useMemo(() => {
    if (blindRun || drillForStage(row?.stage) !== 'recognize' || !verb) return null
    const slot = (row?.reps ?? 0) % 2 === 0 ? 'v2' : 'v3'
    // TOUR FIX — a real deterministic shuffle keyed on the verb, so the answer
    // is not always last and the order does not change under a re-render.
    const opts = orderChoices(buildChoices(verb, slot), `${verb.base_form}|${slot}|${row?.reps ?? 0}`)
    return { slot, opts }
  }, [blindRun, verb, row?.stage, row?.reps])

  // TOUR FIX — a question with one option is not a question: type it instead.
  const drill = blindRun ? 'blind'
    : drillForStage(row?.stage) === 'recognize' && (choices?.opts.length ?? 0) < 2 ? 'forms'
    : drillForStage(row?.stage)

  useEffect(() => {
    setAnswers({}); setResult(null); setRetype(null)
    const root = rootRef.current
    // TOUR FIX — only move focus or scroll once the visitor is working the
    // session (never on page load), and never let focus scroll the page.
    if (!engaged.current) return
    if (root) {
      const bar = document.querySelector('.tour-bar')
      const top = root.getBoundingClientRect().top
      const barH = bar ? bar.getBoundingClientRect().height : 0
      if (top < barH) {
        window.scrollTo({ top: window.scrollY + top - barH - 12, behavior: reduce ? 'auto' : 'smooth' })
      }
    }
    const t = setTimeout(() => first.current?.focus({ preventScroll: true }), 120)
    return () => clearTimeout(t)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  const slots = drill === 'blind' ? ['v1', 'v2', 'v3'] : drill === 'forms' ? ['v2', 'v3'] : []

  // Derived BEFORE the callbacks that close over them: `submit` lists `cloze`
  // in its dependency array, and a const declared further down is in its
  // temporal dead zone at that point — the session threw on first render.
  const cloze = useMemo(() => {
    if (drill !== 'usage' || !verb) return null
    // Prefer the participle sentence: "she has ___" is where the real error
    // lives. Fall back to the past if the verb has no participle example.
    return buildCloze(verb, 'v3') || buildCloze(verb, 'v2')
  }, [drill, verb])

  const advance = useCallback(() => {
    if (i + 1 >= queue.length) onDone?.(tally)
    else setI(i + 1)
  }, [i, queue.length, onDone, tally])

  const retypeBlocked = !!(retype && retype.value.trim().toLowerCase() !== retype.expected.toLowerCase())

  // Enter moves on once the verdict is up. The alternative — autoFocus on the
  // «التالي» button — scroll-jumps on iOS Safari and closes the keyboard while
  // the student is still retyping a corrected spelling.
  // TOUR FIX — the LMS bound this to `window`, which on a marketing page would
  // swallow Enter in any other form. It now lives on the session's own element,
  // which takes focus (without scrolling) when the answered input is disabled.
  const onKeyDown = (e) => {
    if (e.key !== 'Enter' || !result) return
    if (e.target instanceof HTMLButtonElement) return   // a focused button presses itself
    if (retypeBlocked) return
    e.preventDefault()
    advance()
  }
  useEffect(() => {
    if (!result) return
    const root = rootRef.current
    const active = document.activeElement
    if (root && (!active || active === document.body || (root.contains(active) && active.disabled))) {
      root.focus({ preventScroll: true })
    }
  }, [result])

  /** Commit one answer: grade, show the verdict. */
  const submit = useCallback((payload) => {
    if (result || !verb) return
    let r, given, expected

    if (drill === 'recognize') {
      const want = payload.slot === 'v2' ? verb.past_simple : verb.past_participle
      r = gradeSlot(payload.value, {
        slot: payload.slot, base: verb.base_form, v2: verb.past_simple, v3: verb.past_participle,
        altPast: verb.alt_past, altPart: verb.alt_participle,
      })
      given = payload.value; expected = want
    } else if (drill === 'meaning') {
      r = gradeSlot(answers.v1, {
        slot: 'v1', base: verb.base_form, v2: verb.past_simple, v3: verb.past_participle,
        altPast: verb.alt_past, altPart: verb.alt_participle,
      })
      given = answers.v1; expected = verb.base_form
    } else if (drill === 'usage') {
      const cz = payload.cloze
      r = gradeSlot(answers.gap, {
        slot: cz.slot, base: verb.base_form, v2: verb.past_simple, v3: verb.past_participle,
        altPast: verb.alt_past, altPart: verb.alt_participle,
      })
      given = answers.gap; expected = cz.answer
    } else {
      const whole = gradeForms(answers, verb, slots)
      r = { ok: whole.ok, kind: whole.kind, per: whole.per }
      given = slots.map((s) => answers[s] || '—').join(' · ')
      expected = slots.map((s) => (s === 'v1' ? verb.base_form : s === 'v2' ? verb.past_simple : verb.past_participle)).join(' · ')
    }

    setResult(r)
    setTally((t) => ({
      ...t,
      right: t.right + (r.ok ? 1 : 0),
      wrong: t.wrong + (r.ok ? 0 : 1),
      items: [...t.items, { verb, ok: r.ok, kind: r.kind, drill }],
    }))
    onAttempt?.({ verb, drill, ok: r.ok, kind: r.kind })

    // A one-letter miss earns a corrective retype. It is NOT logged again —
    // the miss stands, the card is rescheduled as a miss, and the retype is
    // motor memory. Waving it through is how people arrive at an exam certain
    // they knew a word.
    if (!r.ok && r.kind === 'near_miss') {
      // Which slot missed, and what was actually typed into it. `per` carries
      // the verdict per slot but not the input, so pair them back up here.
      const bad = r.per?.find((x) => !x.ok && x.kind === 'near_miss')
      const exp = bad ? bad.expected : (drill === 'usage' ? cloze?.answer : r.expected) || expected
      const typed = bad ? (answers[bad.slot] || '') : given
      if (exp) setRetype({ expected: String(exp), given: String(typed || ''), value: '' })
    }
  }, [result, verb, drill, answers, slots, cloze, onAttempt])

  // The teaching card: in the platform it logs a `meet` and moves on.
  const meet = advance

  if (!verb) return null

  const rise = reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28 } }

  const arabic = drill === 'meaning' ? typedArabic(answers.v1)
    : drill === 'usage' ? typedArabic(answers.gap)
    : slots.some((s) => typedArabic(answers[s]))
  const canSubmit = !arabic && (drill === 'meaning' ? !!answers.v1?.trim()
    : drill === 'usage' ? !!answers.gap?.trim()
    : slots.length ? slots.every((s) => (answers[s] || '').trim()) : false)

  return (
    <div
      ref={rootRef}
      className="vl-sess max-w-2xl mx-auto w-full"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDownCapture={() => { engaged.current = true }}
      onKeyDownCapture={() => { engaged.current = true }}
    >
      {/* ── progress ── */}
      <div className="flex items-center gap-3 mb-6" style={{ borderBottom: '1.5px solid var(--ink)', paddingBottom: '.7rem' }}>
        {/* «رجوع» points RIGHT in an RTL surface. A left arrow here reads as
            "forward" to an Arabic speaker. */}
        <button onClick={onExit} className="vl-b vl-c-pink !min-h-[44px] !px-3 !py-2" aria-label="خروج">
          <ArrowRight size={16} />
        </button>
        {/* One segment per question. A percentage bar is empty on the first
            card of every session, which reads as broken — and for a five-item
            session the segments also say how short it is. */}
        <div
          className="vl-steps" role="progressbar"
          aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={queue.length}
        >
          {queue.map((_, n) => (
            <i key={n} data-state={n < i ? 'done' : n === i ? 'now' : 'todo'} />
          ))}
        </div>
        <span className="vl-num text-sm" style={{ color: 'var(--vc-text-soft)' }}>
          {toAr(i + 1)}/{toAr(queue.length)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${row.verb_id}-${i}`} {...rise}>
          {/* ── the question ── */}
          <div className="vl-p vl-c-cyan p-5 sm:p-6 mb-5">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-bold text-[1.05rem]" style={{ color: 'var(--vc-text)' }}>
                {STAGES.find((x) => x.id === drill)?.label}
              </h2>
              {/* Arabic, in the Arabic face, untracked — this line used to run
                  through a tracked Latin micro-caps class, which severs the
                  connected script and drops to a different typeface. */}
              <span className="text-xs" style={{ color: 'var(--vc-text-dim)' }}>
                {verb.meaning_hint_ar || STAGES.find((x) => x.id === drill)?.hint}
              </span>
            </div>

            {drill === 'meet' && (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--vc-text-soft)' }}>فعل جديد</p>
                <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.5rem,5.5vw,2rem)', lineHeight: 1.45, color: 'var(--vc-text)' }}>{verb.meaning_ar}</h2>
                <FormsCard verb={verb} />
                <div className="mt-4 space-y-2">
                  <p className="vl-cloze"><b>{verb.example_past}</b></p>
                  <p className="vl-cloze"><b>{verb.example_participle}</b></p>
                </div>
              </>
            )}

            {drill === 'recognize' && choices && (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--vc-text-soft)' }}>
                  {choices.slot === 'v2'
                    ? 'التصريف الثاني — الماضي البسيط'
                    : <>التصريف الثالث — بعد <En>have</En></>}
                </p>
                <h2 className="vl-en font-extrabold mb-2" style={{ fontSize: 'clamp(2.2rem,10vw,3rem)', lineHeight: 1.05, color: 'var(--vc-text)' }}>{verb.base_form}</h2>
                <p className="text-sm" style={{ color: 'var(--vc-text-soft)' }}>{verb.meaning_ar}</p>
              </>
            )}

            {drill === 'forms' && (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--vc-text-soft)' }}>اكتب التصريفين الثاني والثالث</p>
                <h2 className="vl-en font-extrabold mb-2" style={{ fontSize: 'clamp(2.2rem,10vw,3rem)', lineHeight: 1.05, color: 'var(--vc-text)' }}>{verb.base_form}</h2>
                <p className="text-sm" style={{ color: 'var(--vc-text-soft)' }}>{verb.meaning_ar}</p>
              </>
            )}

            {drill === 'meaning' && (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--vc-text-soft)' }}>ما الفعل الإنجليزي؟</p>
                <h2 className="font-bold" style={{ fontSize: 'clamp(1.5rem,5.5vw,2rem)', lineHeight: 1.45, color: 'var(--vc-text)' }}>{verb.meaning_ar}</h2>
              </>
            )}

            {drill === 'usage' && cloze && (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--vc-text-soft)' }}>
                  {cloze.slot === 'v3'
                    ? <>أكمل الفراغ — انتبه: بعد <En>have</En> أو <En>has</En> يأتي التصريف الثالث</>
                    : 'أكمل الفراغ بالصيغة الصحيحة'}
                </p>
                <p className="vl-cloze mb-1">
                  <b>{cloze.before}</b>
                  <span className="vl-cloze__gap" data-slot={cloze.slot}>{result ? cloze.answer : '؟'}</span>
                  <b>{cloze.after}</b>
                </p>
                <p className="text-sm" style={{ color: 'var(--vc-text-soft)' }}>
                  الفعل: <En>{verb.base_form}</En> — {verb.meaning_ar}
                </p>
              </>
            )}

            {drill === 'blind' && (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--vc-text-soft)' }}>التصريفات الثلاثة من الذاكرة</p>
                <h2 className="font-bold" style={{ fontSize: 'clamp(1.5rem,5.5vw,2rem)', lineHeight: 1.45, color: 'var(--vc-text)' }}>{verb.meaning_ar}</h2>
              </>
            )}
          </div>

          {/* ── the answer ── */}
          {drill === 'meet' ? (
            <div className="vl-sess__act">
              <button className="vl-b vl-b--solid vl-c-cyan w-full" onClick={meet}>
                {g('فهمت، التالي', 'فهمتُ، التالي')}
              </button>
            </div>
          ) : drill === 'recognize' && choices ? (
            <div className="grid gap-3">
              {choices.opts.map((opt) => {
                const chosen = answers.pick === opt
                const correct = result && (
                  (choices.slot === 'v2' ? verb.past_simple : verb.past_participle).toLowerCase() === opt.toLowerCase()
                )
                // Colouring the SLOT teaches the grammar without leaking which
                // option is right — the one place the palette used to go silent.
                const slotClass = choices.slot === 'v2' ? 'vl-choice--v2' : 'vl-choice--v3'
                const state = !result ? slotClass
                  : correct ? 'vl-choice--ok'
                  : chosen ? 'vl-choice--no'
                  : 'vl-choice--mute'
                return (
                  <button
                    key={opt}
                    className={`vl-choice ${state}`}
                    disabled={!!result}
                    onClick={() => { setAnswers({ pick: opt }); submit({ slot: choices.slot, value: opt }) }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          ) : (
            <form
              className="grid gap-3"
              onSubmit={(e) => { e.preventDefault(); if (!result && canSubmit) submit({ cloze }) }}
            >
              {drill === 'usage' ? (
                <div>
                  <label className="vl-inlabel" htmlFor="vl-gap">الصيغة المطلوبة</label>
                  <input
                    id="vl-gap"
                    ref={first} className={`vl-in vl-in--${cloze?.slot === 'v3' ? '3' : '2'} ${result ? (result.ok ? 'vl-in--ok' : 'vl-in--no') : ''}`}
                    value={answers.gap || ''} disabled={!!result}
                    onChange={(e) => setAnswers({ gap: e.target.value })}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    inputMode="text" dir="ltr" lang="en"
                    placeholder={cloze ? cloze.answer.replace(/./g, '·') : ''}
                  />
                  {!result && typedArabic(answers.gap) && <ArabicHint />}
                </div>
              ) : drill === 'meaning' ? (
                <div>
                  <label className="vl-inlabel" htmlFor="vl-v1">الأصل — V1</label>
                  <input
                    id="vl-v1"
                    ref={first} className={`vl-in ${result ? (result.ok ? 'vl-in--ok' : 'vl-in--no') : ''}`}
                    value={answers.v1 || ''} disabled={!!result}
                    onChange={(e) => setAnswers({ v1: e.target.value })}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    dir="ltr" lang="en" placeholder={verb.base_form.replace(/./g, '·')}
                  />
                  {!result && typedArabic(answers.v1) && <ArabicHint />}
                </div>
              ) : (
                slots.map((s, n) => {
                  const per = result?.per?.find((p) => p.slot === s)
                  return (
                    <div key={s}>
                      <label className="vl-inlabel" htmlFor={`vl-${s}`}>
                        {s === 'v1' ? 'الأصل — V1' : s === 'v2' ? 'الماضي — V2' : <>بعد <En>have</En> — V3</>}
                      </label>
                      <input
                        id={`vl-${s}`}
                        ref={n === 0 ? first : null}
                        className={`vl-in vl-in--${s.slice(1)} ${per ? (per.ok ? 'vl-in--ok' : 'vl-in--no') : ''}`}
                        value={answers[s] || ''} disabled={!!result}
                        onChange={(e) => setAnswers((a) => ({ ...a, [s]: e.target.value }))}
                        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                        dir="ltr" lang="en"
                        placeholder={(s === 'v1' ? verb.base_form : s === 'v2' ? verb.past_simple : verb.past_participle)
                          .replace(/./g, '·')}
                      />
                      {!result && typedArabic(answers[s]) && <ArabicHint />}
                    </div>
                  )
                })
              )}
              {!result && (
                <button type="submit" className="vl-b vl-b--solid vl-c-cyan w-full" disabled={!canSubmit}>
                  <CornerDownLeft size={16} /> تحقّق
                </button>
              )}
            </form>
          )}

          {/* ── the verdict ── */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-7 space-y-3"
              >
                <div className={`vl-p p-5 ${result.ok ? 'vl-c-green' : 'vl-c-red'}`} role="status">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: result.ok ? 'var(--ok)' : 'var(--no)' }}>
                      {result.ok ? <Check size={18} /> : <X size={18} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: 'var(--vc-text)' }}>
                        {result.ok
                          ? (drill === 'blind' ? 'التصريفات الثلاثة صحيحة' : 'صحيح')
                          : ERROR_AR[result.kind]?.title || 'غير صحيح'}
                      </p>
                      {!result.ok && (
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--vc-text-dim)' }}>{ERROR_AR[result.kind]?.body}</p>
                      )}
                    </div>
                  </div>

                  {/* one letter off → show WHICH letter */}
                  {!result.ok && result.kind === 'near_miss' && retype && (
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <Diff given={retype.given} expected={retype.expected} />
                      <span className="text-sm" style={{ color: 'var(--vc-text-soft)' }}>الصواب</span>
                    </div>
                  )}

                  {/* The three forms live INSIDE the verdict. Five stacked
                      slabs to say "yes" is not a moment; one panel is. */}
                  <div style={{ marginTop: '1.1rem' }}>
                    <FormsCard verb={verb} compact hit={result.ok} />
                  </div>
                </div>

                {/* the trap note, only after a miss — never as a pre-emptive warning */}
                {!result.ok && verb.trap_note_ar && (
                  <div className="vl-p vl-c-amber p-4">
                    <p className="font-bold text-[.95rem] flex items-center gap-1.5" style={{ color: 'var(--vl-amber)' }}>
                      <Lightbulb size={15} style={{ flex: 'none' }} /> انتبه
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--vc-text-dim)' }}>{verb.trap_note_ar}</p>
                  </div>
                )}

                {/* the corrective retype */}
                {retype ? (
                  <div className="vl-p vl-c-green p-4">
                    <label className="block text-xs mb-2" htmlFor="vl-retype" style={{ color: 'var(--vc-text-dim)' }}>
                      لا تُحتسب في النتيجة — لكن كتابتها مرة واحدة صحيحة هي ما يثبّت الإملاء.
                    </label>
                    <input
                      id="vl-retype"
                      className={`vl-in ${retype.value && retype.value.trim().toLowerCase() === retype.expected.toLowerCase() ? 'vl-in--ok' : ''}`}
                      value={retype.value}
                      onChange={(e) => setRetype((r) => ({ ...r, value: e.target.value }))}
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      dir="ltr" lang="en" placeholder={retype.expected.replace(/./g, '·')}
                    />
                    {typedArabic(retype.value) && <ArabicHint />}
                  </div>
                ) : null}

                {/* No autoFocus: on iOS Safari focusing a button after a typed
                    answer scroll-jumps and dismisses the keyboard mid-retype.
                    Enter advances instead (see the key handler above). */}
                <div className="vl-sess__act space-y-2">
                  <button
                    className="vl-b vl-b--solid vl-c-green w-full"
                    onClick={advance}
                    disabled={retypeBlocked}
                  >
                    {i + 1 >= queue.length ? 'إنهاء الجلسة' : 'التالي'}
                  </button>
                  {/* Never a dead end: the retype teaches, it does not detain. */}
                  {retypeBlocked && (
                    <button className="vl-b vl-c-cyan w-full !min-h-[44px]" onClick={advance}>
                      تخطّي
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs pt-8" style={{ color: 'var(--vc-text-dim)' }}>
        {verbsAr(queue.length)} في هذه الجلسة
      </p>
    </div>
  )
}
