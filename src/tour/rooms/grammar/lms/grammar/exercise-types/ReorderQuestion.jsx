// TOUR PORT: vendored from fluentia-lms src/components/grammar/exercise-types/ReorderQuestion.jsx (origin/main 3396e97e).
// Only import paths changed.
import { useState } from 'react'
import { shuffleReorderTokens } from '../../lib/exercises/reorderTokens'
import { gradeAnswer } from '../../lib/grading/fairGrader'
import { useG } from '../../i18n/gender'

export default function ReorderQuestion({ item, answer, onAnswer }) {
  const g = useG()
  const [selected, setSelected] = useState([])
  // The chips arrive in the answer's own order for 115 of the 218 reorder items,
  // and this component used to render them exactly as stored — the question handed
  // the student its answer. Seeded on the question so the board is stable across
  // re-renders and retries.
  const [available, setAvailable] = useState(
    () => shuffleReorderTokens(item.options, item.correct_answer, String(item.id ?? item.question ?? ''))
  )

  const handleWordClick = (word) => {
    if (answer) return
    setSelected(prev => [...prev, word])
    setAvailable(prev => {
      const idx = prev.indexOf(word)
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }

  const handleSelectedClick = (idx) => {
    if (answer) return
    const word = selected[idx]
    setAvailable(prev => [...prev, word])
    setSelected(prev => [...prev.slice(0, idx), ...prev.slice(idx + 1)])
  }

  const handleCheck = () => {
    if (answer || selected.length === 0) return
    const builtSentence = selected.join(' ')
    const acceptedAnswers = item.accepted_answers?.length ? item.accepted_answers : [item.correct_answer]
    const result = gradeAnswer(builtSentence, {
      accepted: item.accepted_answers,
      correctAnswer: item.correct_answer,
      questionText: item.question,
      type: 'reorder',
    })
    onAnswer({ selected: builtSentence, correct: result.correct, note: result.note })
  }

  // Answer area styling
  let areaStyle = { background: 'var(--glass-input)', border: '1.5px dashed var(--border-default)' }
  if (answer?.correct) areaStyle = { background: 'var(--success-bg)', border: '1.5px solid var(--success-border)' }
  else if (answer && !answer.correct) areaStyle = { background: 'var(--danger-bg)', border: '1.5px solid var(--danger-border)' }

  return (
    <div className="space-y-3" dir="ltr">
      {/* Answer area */}
      <div
        className="min-h-[48px] rounded-xl px-3 py-2.5 flex flex-wrap gap-2 transition-colors"
        style={areaStyle}
      >
        {selected.length === 0 && !answer && (
          <span className="text-xs py-1.5 font-['Tajawal']" dir="rtl" style={{ color: 'var(--text-tertiary)' }}>اضغط على الكلمات لترتيبها...</span>
        )}
        {selected.map((w, i) => (
          <button
            key={i}
            onClick={() => handleSelectedClick(i)}
            disabled={!!answer}
            className="grammar-chip grammar-chip--selected"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Available words */}
      {!answer && (
        <div className="flex flex-wrap gap-2">
          {available.map((w, i) => (
            <button key={i} onClick={() => handleWordClick(w)} className="grammar-chip">
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Check button */}
      {!answer && selected.length > 0 && (
        <button
          onClick={handleCheck}
          className="grammar-option px-5 w-auto inline-flex font-['Tajawal'] font-bold text-sm active:scale-95 transition-transform"
          style={{ color: 'var(--accent-sky)', borderColor: 'var(--info-border)' }}
        >
          تحقق
        </button>
      )}

      {answer && answer.correct && (
        <p className="text-sm font-['Tajawal'] font-bold" dir="rtl" style={{ color: 'var(--success)' }}>{g('ترتيب صحيح! ممتاز 🎯', 'ترتيب صحيح! ممتازة 🎯')}</p>
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
    </div>
  )
}
