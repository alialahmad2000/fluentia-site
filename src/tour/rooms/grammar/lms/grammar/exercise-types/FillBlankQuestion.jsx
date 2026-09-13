// TOUR PORT: vendored from fluentia-lms src/components/grammar/exercise-types/FillBlankQuestion.jsx (origin/main 3396e97e).
// Import paths changed, plus the false-accept guard marked in handleSubmit.
import { useState, useRef } from 'react'
import { gradeAnswer } from '../../lib/grading/fairGrader'
import { guardFalseAccept } from '../../lib/grading/falseAcceptGuard'
import { useG } from '../../i18n/gender'

export default function FillBlankQuestion({ item, answer, onAnswer }) {
  const g = useG()
  const CORRECT_MSGS = [g('ممتاز! إجابة صحيحة 🎯', 'ممتازة! إجابة صحيحة 🎯'), g('أحسنت! بالضبط ✨', 'أحسنتِ! بالضبط ✨'), 'صحيح! رائع 💫', 'إجابة موفقة! 🌟']
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const acceptedAnswers = item.accepted_answers?.length ? item.accepted_answers : [item.correct_answer]
  const expectedWordCount = (acceptedAnswers[0] || '').split(/\s+/).filter(Boolean).length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer || !input.trim()) return
    // TOUR PORT FIX: guardFalseAccept (lib/grading/falseAcceptGuard.js) refuses a "typo" that is
    // really a strong-verb stem change (drink → drunk). Every other verdict is fairGrader's.
    const result = guardFalseAccept(gradeAnswer(input.trim(), {
      accepted: item.accepted_answers,
      correctAnswer: item.correct_answer,
      questionText: item.question,
      type: 'fill_blank',
      fullSentence: item.question,
    }), input.trim(), item.question)
    onAnswer({ selected: input.trim(), correct: result.correct, note: result.note })
  }

  let inputCls = 'grammar-input w-full font-en'
  if (answer?.correct) inputCls += ' grammar-input--correct'
  else if (answer && !answer.correct) inputCls += ' grammar-input--wrong'

  return (
    <form onSubmit={handleSubmit} className="space-y-3" dir="ltr">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={answer ? answer.selected : input}
          onChange={e => setInput(e.target.value)}
          disabled={!!answer}
          placeholder={expectedWordCount <= 1 ? '____ (one word)' : `____ (${expectedWordCount} words)`}
          aria-describedby="fill-blank-hint"
          className={inputCls}
        />
        {!answer && (
          <button
            type="submit"
            disabled={!input.trim()}
            className="grammar-option px-5 font-['Tajawal'] font-bold text-sm disabled:opacity-30 active:scale-95 transition-transform"
            style={{ color: 'var(--accent-sky)', borderColor: 'var(--info-border)' }}
          >
            تحقق
          </button>
        )}
      </div>
      {!answer && (
        <p id="fill-blank-hint" className="text-[11px] font-['Tajawal']" dir="rtl" style={{ color: 'var(--text-tertiary)' }}>
          {g('اكتب الكلمة الناقصة فقط — لا تعِد كتابة الجملة كاملة', 'اكتبي الكلمة الناقصة فقط — لا تعيدي كتابة الجملة كاملة')}
        </p>
      )}

      {answer && answer.correct && (
        <p className="text-sm font-['Tajawal'] font-bold" dir="rtl" style={{ color: 'var(--success)' }}>
          {CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]}
        </p>
      )}
      {answer && answer.correct && answer.note?.ar && (
        <p
          className="text-xs font-['Tajawal'] leading-relaxed"
          dir="rtl"
          style={{ color: 'var(--text-secondary)' }}
        >
          {answer.note.ar}
        </p>
      )}

      {answer && !answer.correct && (
        <div className="grammar-explanation-bar text-xs" dir="rtl">
          <span className="font-['Tajawal']" style={{ color: 'var(--text-tertiary)' }}>الإجابة الصحيحة: </span>
          <span className="font-semibold font-en" dir="ltr" style={{ color: 'var(--success)' }}>{item.correct_answer}</span>
        </div>
      )}
    </form>
  )
}
