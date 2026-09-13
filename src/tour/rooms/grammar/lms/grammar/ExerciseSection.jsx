/**
 * ExerciseSection — TOUR REWRITE of fluentia-lms src/components/grammar/ExerciseSection.jsx
 * (origin/main 3396e97e).
 *
 * The platform's runner owns persistence: useActivitySave (row, outbox, attempt number),
 * useActivityTimer, the in-progress hydrate, autosave, awardCurriculumXP, the toast, the
 * confetti, SaveStatus, the sticky CTA and AttemptsHistory. None of that can run for a
 * visitor, and none of it is what a visitor looks at. What they look at is kept, with the
 * same markup and classes: the section header, the progress dots, the real ExerciseCard for
 * every item, the «تسليم الإجابات (n/N)» button, ExerciseSummary after submitting, and a
 * retry that clears the board (`setAnswers({})` + a new `retryKey`).
 *
 * Attempts and the best score are counted in memory only, so the header pills and the
 * summary's best-score line behave as they do inside the platform. Nothing is written.
 */
import { useState, useRef } from 'react'
import { Target, RotateCcw } from 'lucide-react'
import ExerciseCard from './ExerciseCard'
import ExerciseSummary from './ExerciseSummary'

export default function ExerciseSection({ exercises, onAttemptUpdate, ruleSnippet, hintAr }) {
  const sectionRef = useRef(null)
  const [answers, setAnswers] = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [retrying, setRetrying] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [bestScore, setBestScore] = useState(null)

  const total = exercises.length
  const answered = Object.keys(answers).length
  const correctCount = Object.values(answers).filter(a => a.correct).length
  const allAnswered = answered === total && total > 0

  const handleFinish = () => {
    if (!allAnswered || isCompleted) return
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
    // Like the platform after it re-reads its attempt rows: the best now includes this one.
    const best = bestScore == null ? score : Math.max(bestScore, score)
    setBestScore(best)
    setIsCompleted(true)
    setRetrying(false)
    onAttemptUpdate?.(score, attemptNumber, best)
    // Scroll only if the section's top has left the viewport (the summary renders there).
    requestAnimationFrame(() => {
      const el = sectionRef.current
      if (!el) return
      if (el.getBoundingClientRect().top < 0) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }
    })
  }

  const handleRetry = () => {
    setRetrying(true)
    setIsCompleted(false)
    setAnswers({})
    setAttemptNumber((n) => n + 1)
    setRetryKey(k => k + 1)
    onAttemptUpdate?.(null, attemptNumber + 1, bestScore)
  }

  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  return (
    <div ref={sectionRef} className="space-y-4 mt-8" style={{ scrollMarginTop: 'calc(var(--header-height, 64px) + 16px)' }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'var(--accent-sky)' }} />
          <h2 className="text-sm font-bold font-['Tajawal']" style={{ color: 'var(--text-secondary)' }}>تمارين · {total} أسئلة</h2>
        </div>
        <div className="flex items-center gap-2">
          {bestScore != null && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md font-['Tajawal']" style={{ background: 'var(--success-bg, rgba(74,222,128,0.1))', color: 'var(--success)', border: '1px solid var(--success-border, rgba(74,222,128,0.2))' }}>
              أفضل درجة: {bestScore}%
            </span>
          )}
          {retrying && (
            <span className="flex items-center gap-1 text-xs font-['Tajawal']" style={{ color: 'var(--accent-sky)' }}>
              <RotateCcw size={12} />
              محاولة {attemptNumber}
            </span>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {exercises.map((ex) => {
          const a = answers[ex.id]
          let cls = 'grammar-dot'
          if (a?.correct === true) cls += ' grammar-dot--correct'
          else if (a && a.correct === false) cls += ' grammar-dot--wrong'
          return <div key={ex.id} className={cls} />
        })}
      </div>

      {/* Summary (shown after completion) */}
      {isCompleted && (
        <ExerciseSummary
          correctCount={correctCount}
          total={total}
          score={score}
          bestScore={bestScore}
          attemptNumber={attemptNumber}
          onRetry={handleRetry}
        />
      )}

      {/* Exercise cards — always visible inline */}
      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div key={`${ex.id}-${retryKey}`}>
            <ExerciseCard
              exercise={ex}
              index={idx}
              total={total}
              answer={answers[ex.id]}
              onAnswer={(ans) => setAnswers(prev => ({ ...prev, [ex.id]: ans }))}
              ruleSnippet={ruleSnippet}
              hintAr={hintAr}
            />
          </div>
        ))}
      </div>

      {/* Inline submit button — the only path to completion. Disabled until all answered,
          rendered from 0/N so the submit step is never invisible. */}
      {!isCompleted && total > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleFinish}
            disabled={!allAnswered}
            className="px-6 py-3 rounded-xl font-bold font-['Tajawal'] text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: allAnswered ? 'var(--accent-sky, #38bdf8)' : 'var(--surface-raised, rgba(255,255,255,0.05))',
              color: allAnswered ? '#0a1225' : 'var(--text-muted)',
              border: '1px solid ' + (allAnswered ? 'var(--accent-sky, #38bdf8)' : 'var(--border-subtle, rgba(255,255,255,0.1))'),
            }}
          >
            {allAnswered
              ? <span>تسليم الإجابات ({answered}/{total})</span>
              : `أجب على جميع الأسئلة قبل التسليم (${answered}/${total})`}
          </button>
        </div>
      )}
    </div>
  )
}
