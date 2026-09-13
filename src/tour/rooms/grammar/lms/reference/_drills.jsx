// TOUR PORT: vendored from fluentia-lms src/pages/student/grammar-reference/_drills.jsx
// (origin/main 3396e97e). Import paths, plus the fill-blank grading fix marked in Written().
/**
 * Self-check drills for «المرجع النحوي».
 *
 * CREDITLESS AND UNRECORDED, deliberately. Nothing is graded by AI, nothing is posted
 * to a score, nothing costs anything. That is what lets the reference stay free — and
 * it is also better pedagogy here: a missed self-check on a reference page is not an
 * error, it is the moment the explanation lands.
 *
 * Grading is the platform's real grader (fairGrader.gradeAnswer), not a new one, so a
 * drill behaves exactly like every other question on the platform — including its
 * hyphen/article/typo tolerance on open items and its deliberate strictness on MCQ.
 *
 * The Desk's three rules are inherited:
 *   1. the CORRECT option lights up even when she picked something else
 *   2. EVERY option carries a why — the wrong ones are where the learning is
 *   3. unlimited retries, no score, nothing recorded
 */
import { useState, useMemo, useId } from 'react'
import { gradeAnswer, canon } from '../lib/grading/fairGrader'
import { Ar } from './_ar'
import { Lightbulb, RotateCcw, Check, X } from 'lucide-react'
import { arNum } from '../lib/numerals'



/* Deterministic per-drill shuffle. Authored order puts the correct option first — every
 * one of the 979 MCQs, with no exceptions — so an unshuffled list makes "tap the first
 * chip" a winning strategy and teaches position, not grammar. Seeded from the question so
 * the order never changes under the reader mid-answer, and never changes between visits. */
function seededOrder(n, seedStr) {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619) }
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0
    const j = h % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

function Choose({ d }) {
  const [picked, setPicked] = useState(null)
  const liveId = useId()
  const raw = d.options || []
  const opts = useMemo(() => seededOrder(raw.length, d.q_en || '').map((i) => raw[i]), [raw, d.q_en])
  return (
    <div className="flex flex-wrap gap-2 items-start" role="group">
      {/* a screen reader was told nothing at all when an option was picked */}
      <p id={liveId} role="status" aria-live="polite" className="sr-only">
        {picked == null ? '' : opts[picked]?.correct ? 'إجابة صحيحة' : 'إجابة غير صحيحة، والصواب معروض'}
      </p>
      {opts.map((o, i) => {
        const state = picked == null ? 'idle' : o.correct ? 'correct' : picked === i ? 'wrong' : 'dim'
        const cls = state === 'correct' ? 'gref-opt gref-opt--correct'
          : state === 'wrong' ? 'gref-opt gref-opt--wrong'
          : state === 'dim' ? 'gref-opt gref-opt--dim' : 'gref-opt'
        return (
          <div key={i} className="min-w-[min(300px,100%)]">
            <button type="button" className={cls}
                    aria-pressed={picked === i}
                    onClick={() => setPicked(picked == null ? i : picked)}>
              <span className="flex items-center gap-2">
                {state === 'correct' ? <Check size={15} aria-hidden="true" style={{ color: 'var(--gref-good)' }} />
                  : state === 'wrong' ? <X size={15} aria-hidden="true" style={{ color: 'var(--gref-bad)' }} /> : null}
                {state === 'correct' ? <span className="sr-only">إجابة صحيحة: </span> : null}
                {state === 'wrong' ? <span className="sr-only">إجابة خاطئة: </span> : null}
                <span className="font-en text-[14px]" dir="ltr" lang="en">{o.text}</span>
              </span>
            </button>
            {picked != null && (o.correct || picked === i) && o.why_ar ? (
              <Ar text={o.why_ar} className="text-[12.5px] mt-1.5 mb-1 px-1"
                  style={{ color: o.correct ? 'var(--gref-good)' : 'var(--gref-bad)' }} />
            ) : null}
          </div>
        )
      })}
      {picked != null && !opts[picked]?.correct ? (
        <button type="button" onClick={() => setPicked(null)}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-['Tajawal'] mt-1"
                style={{ color: 'var(--gref-muted)' }}>
          <RotateCcw size={13} /> جرّب مرة أخرى
        </button>
      ) : null}
    </div>
  )
}

function Written({ d, onMiss }) {
  const [val, setVal] = useState('')
  const [res, setRes] = useState(null)
  // The sentence the student is asked to FIX, i.e. whatever follows the instruction colon.
  const wrongSentence = useMemo(() => {
    if (d.type !== 'error_correction') return null
    const m = String(d.q_en || '').match(/[:：]\s*(.+)$/s)
    return m ? m[1].trim().replace(/^['"«]|['"»]$/g, '') : null
  }, [d.q_en, d.type])

  const check = () => {
    if (!val.trim()) return
    // Resubmitting the prompt's own broken sentence must never pass. It did for 48 of the
    // 427 error-correction drills, which certified the error as correct — the worst
    // possible outcome for a drill whose entire job is to make the error visible.
    if (wrongSentence && canon(val) === canon(wrongSentence)) {
      setRes({ correct: false, note: { ar: 'هذه هي الجملة نفسها كما وردت — ما الذي نغيّره فيها؟' } })
      onMiss?.()
      return
    }
    const graded = gradeAnswer(val, {
      accepted: d.accepted, correctAnswer: d.correct_answer,
      questionText: d.q_en, type: d.type,
      // `fullSentence` is the FILL-BLANK affordance ("she retyped the whole sentence around
      // the right word"). Passing it for transform/error_correction let the untouched
      // prompt match. `strict` because in these two types the orthography IS the skill.
      //
      // TOUR PORT FIX (fill-blank false accept). Production passes
      // `originalSentence + allowPartial: true` here as well, which switches on fairGrader's
      // error-correction path: ANY fragment of the model answer that is absent from the prompt
      // passes. For «She ___ (work) … since March.» that accepted `worked`, `working` and even
      // `has work` (a substring of "has worked") — certifying the exact error the entry
      // teaches. A blank has no "changed word" to type on its own, so the partial path does
      // not apply; this is the same call shape the unit FillBlankQuestion uses, and it keeps
      // every legitimate accept (the key, `'s worked`, `has been working`, the whole sentence
      // retyped around the answer, a one-letter typo). Proven in
      // scripts/tour/grammar/grader-cases.mjs. fairGrader.js itself is unchanged.
      ...(d.type === 'fill_blank'
        ? { fullSentence: d.q_en }
        : { originalSentence: wrongSentence || d.q_en, strict: true }),
    })
    setRes(graded)
    // Every one of the 1,916 drills carries a rule-naming Arabic hint, hidden behind a
    // toggle a student who has just failed has no reason to press — and fairGrader returns
    // note:null on a miss, so all she saw was «ليست بعد» plus the answer string, no rule
    // named. Failed retrieval is the highest-value feedback moment in the feature.
    if (!graded.correct) onMiss?.()
  }
  const ok = res?.correct
  return (
    <div className="space-y-2">
      <input className="gref-input font-en" dir="ltr" lang="en" value={val} placeholder="اكتب إجابتك…" aria-label="اكتب إجابتك"
             onChange={(e) => { setVal(e.target.value); setRes(null) }}
             onKeyDown={(e) => { if (e.key === 'Enter') check() }} />
      <div className="flex items-center gap-2">
        <button type="button" onClick={check} className="gref-chip">تحقّق</button>
        {res ? (
          <button type="button" onClick={() => { setVal(''); setRes(null) }}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-['Tajawal'] min-h-[44px] px-2 -mx-2" style={{ color: 'var(--gref-muted)' }}>
            <RotateCcw size={13} /> من جديد
          </button>
        ) : null}
      </div>
      {res ? (
        <div className="gref-careful" role="status" aria-live="polite" style={{ borderInlineStartColor: ok ? 'var(--gref-good)' : 'var(--gref-line)' }}>
          <p className="font-['Tajawal'] text-[13px] font-semibold" dir="rtl" style={{ color: ok ? 'var(--gref-good)' : 'var(--gref-accent)' }}>
            {ok ? 'صحيح' : 'ليست بعد — قارن مع الإجابة'}
          </p>
          {!ok ? (
            <p className="font-en text-[13.5px] mt-1" dir="ltr" lang="en" style={{ color: 'var(--gref-ink)' }}>{d.correct_answer}</p>
          ) : null}
          {res.note?.ar ? <Ar text={res.note.ar} className="text-[12px] mt-1" style={{ color: 'var(--gref-muted)' }} /> : null}
        </div>
      ) : null}
    </div>
  )
}

function Drill({ d, i }) {
  const [hint, setHint] = useState(false)
  const revealHint = () => setHint(true)   // called by Written on a miss
  return (
    <div className="gref-panel p-4">
      <div className="mb-3">
        <div className="min-w-0">
          <p className="font-en text-[14.5px] leading-[1.6]" dir="ltr" style={{ color: 'var(--gref-ink)' }}>
            <span className="font-num me-2" style={{ color: 'var(--gref-muted)' }}>
              {arNum(i + 1)}.
            </span>
            {d.q_en}
          </p>
          {d.q_ar ? <Ar text={d.q_ar} className="text-[12.5px] mt-1" style={{ color: 'var(--gref-muted)' }} /> : null}
        </div>
      </div>
      {d.type === 'choose' || d.type === 'reorder' ? <Choose d={d} /> : <Written d={d} onMiss={revealHint} />}
      {d.hint_ar ? (
        <div className="mt-2.5">
          <button type="button" onClick={() => setHint(!hint)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-['Tajawal'] min-h-[44px] px-2 -mx-2" style={{ color: 'var(--gref-accent-text)' }}>
            <Lightbulb size={13} /> {hint ? 'إخفاء التلميح' : 'تلميح'}
          </button>
          {hint ? <Ar text={d.hint_ar} className="text-[12.5px] mt-1.5" style={{ color: 'var(--gref-body)' }} /> : null}
        </div>
      ) : null}
    </div>
  )
}

export default function Drills({ drills = [] }) {
  if (!drills.length) return null
  return (
    <div className="space-y-3">
      <p className="font-['Tajawal'] text-[12.5px] gref-prose" dir="rtl" style={{ color: 'var(--gref-muted)' }}>
        تمارين للتأكد من الفهم — لا تُحتسب ولا تُسجَّل، وتستطيع إعادتها كما تشاء.
      </p>
      {drills.map((d, i) => <Drill key={i} d={d} i={i} />)}
    </div>
  )
}
