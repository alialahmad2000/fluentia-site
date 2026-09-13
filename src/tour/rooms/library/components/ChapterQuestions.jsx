// TOUR PORT of fluentia-lms src/features/library/components/ChapterQuestions.jsx.
// Same markup, classes and flow (calm CTA → questions → instant gentle feedback,
// a miss offers a jump back into the story). Changes for the tour:
//   · questions arrive as a prop from the snapshot; answers live in local state
//     only (no saveQuestionAttempt, no prior attempts, no react-query);
//   · the opinion question + share-to-book-club are gone (Q3/Q4 sit after the cut);
//   · copy is masculine-generic for an anonymous visitor («اختبر فهمك», «اسمعها من هنا»),
//     and the count reads «سؤالان قصيران» instead of the LMS's «2 أسئلة».
import { useState } from 'react'
import { Sparkles, Check, X, Volume2 } from 'lucide-react'

const COUNT_LABEL = (n) => (n === 1 ? 'سؤال قصير' : n === 2 ? 'سؤالان قصيران' : `${n} أسئلة قصيرة`)

export default function ChapterQuestions({ questions = [], onJump, onAnswered }) {
  const [open, setOpen] = useState(false)
  const [ans, setAns] = useState({}) // qid -> {selected_id, is_correct}

  if (!questions.length) return null

  const graded = questions.filter((q) => q.type !== 'opinion')
  const doneCount = graded.filter((q) => ans[q.id]?.selected_id).length

  const pick = (q, optId) => {
    if (ans[q.id]?.selected_id) return // locked after answering
    const is_correct = optId === q.correct_id
    const next = { ...ans, [q.id]: { selected_id: optId, is_correct } }
    setAns(next)
    onAnswered?.(graded.filter((g) => next[g.id]?.selected_id).length, graded.length)
  }

  if (!open) {
    return (
      <button className="lib-q-cta" onClick={() => setOpen(true)}>
        <Sparkles size={16} />
        <span><b>اختبر فهمك</b><i>{COUNT_LABEL(questions.length)} — اختياري</i></span>
      </button>
    )
  }

  return (
    <div className="lib-q-panel" dir="rtl">
      <div className="lib-q-head">
        <span>اختبر فهمك</span>
        {graded.length > 0 && <em dir="ltr">{doneCount} / {graded.length}</em>}
      </div>
      {questions.map((q) => {
        const st = ans[q.id]
        const kind = { comprehension: 'فهم', inference: 'استنتاج', vocabulary: 'مفردات', opinion: 'رأيك' }[q.type]
        return (
          <div key={q.id} className="lib-q-item">
            <div className="lib-q-kind">{kind}</div>
            <p className="lib-q-text" dir="ltr">{q.question_en}</p>
            {q.question_ar && <p className="lib-q-ar">{q.question_ar}</p>}
            <div className="lib-q-opts">
              {(q.options || []).map((o) => {
                const picked = st?.selected_id === o.id
                const isAnswer = st?.selected_id && o.id === q.correct_id
                const isWrongPick = picked && !st?.is_correct
                return (
                  <button key={o.id} className="lib-q-opt" disabled={!!st?.selected_id}
                    data-correct={isAnswer || undefined} data-wrong={isWrongPick || undefined}
                    data-opt={o.id}
                    onClick={() => pick(q, o.id)}>
                    <span className="lib-q-optid">{o.id}</span>
                    <span className="lib-q-opttext" dir="ltr">{o.en}{o.ar ? <i> — {o.ar}</i> : null}</span>
                    {isAnswer && <Check size={15} className="lib-q-mk ok" />}
                    {isWrongPick && <X size={15} className="lib-q-mk no" />}
                  </button>
                )
              })}
            </div>
            {st?.selected_id && (
              <div className="lib-q-explain" data-ok={st.is_correct || undefined} role="status">
                {q.explanation_ar}
                {!st.is_correct && q.jump_p != null && onJump && (
                  <button className="lib-q-jump" onClick={() => onJump(q.jump_p, q.jump_s)}>
                    <Volume2 size={13} /> اسمعها من هنا
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
