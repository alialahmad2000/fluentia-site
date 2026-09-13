// TOUR PORT: vendored from fluentia-lms src/components/grammar/ExerciseCard.jsx (origin/main
// 3396e97e). Removed: trackEvent and ExplainModal (both need Supabase). Marked below.
import { useState } from 'react'
import { splitPrompt } from '../lib/exercises/splitPrompt'
import { Sparkles, Lightbulb } from 'lucide-react'
import { useG } from '../i18n/gender'
import RichText from './RichText'
import VerdictPanel from '../questions/VerdictPanel'
import '../questions/questionCards.css'
import InPlatformNote from '../../tour/InPlatformNote'
import MCQQuestion from './exercise-types/MCQQuestion'
import FillBlankQuestion from './exercise-types/FillBlankQuestion'
import ErrorCorrectionQuestion from './exercise-types/ErrorCorrectionQuestion'
import ReorderQuestion from './exercise-types/ReorderQuestion'
import TransformQuestion from './exercise-types/TransformQuestion'

// Tier 5 is flagged, not just numbered — a student should know when a question
// is genuinely a challenge rather than assume she is failing an easy one.
const DIFFICULTY = {
  1: { label: 'سهل', color: 'var(--success)', bg: 'var(--success-bg)' },
  2: { label: 'سهل', color: 'var(--success)', bg: 'var(--success-bg)' },
  3: { label: 'متوسط', color: 'var(--accent-sky)', bg: 'var(--info-bg)' },
  4: { label: 'صعب', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  5: { label: 'تحدٍّ', color: 'var(--accent-rose)', bg: 'var(--danger-bg)' },
}

const TYPE_LABELS = {
  fill_blank: 'أكمل الفراغ',
  choose: 'اختيار من متعدد',
  error_correction: 'صحّح الخطأ',
  reorder: 'رتّب الكلمات',
  transform: 'حوّل الجملة',
  make_question: 'كوّن سؤالاً',
}

function getFallbackInstructions(g) {
  return {
    fill_blank: g('املأ الفراغ بالكلمة المناسبة', 'املئي الفراغ بالكلمة المناسبة'),
    choose: g('اختر الإجابة الصحيحة', 'اختاري الإجابة الصحيحة'),
    error_correction: g('صحّح الخطأ في الجملة', 'صحّحي الخطأ في الجملة'),
    reorder: g('رتّب الكلمات لتكوين جملة صحيحة', 'رتّبي الكلمات لتكوين جملة صحيحة'),
    transform: g('حوّل الجملة حسب المطلوب', 'حوّلي الجملة حسب المطلوب'),
    make_question: g('كوّن سؤالاً من الجملة', 'كوّني سؤالاً من الجملة'),
  }
}

export default function ExerciseCard({ exercise, index, total, answer, onAnswer, ruleSnippet, hintAr }) {
  const g = useG()
  // TOUR PORT: «اشرح لي» opens the AI tutor (explain-grammar-answer, auth-gated and paid).
  // It is not called from the tour; the button opens a note saying where it lives.
  const [explainOpen, setExplainOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const item = exercise.items?.[0]
  if (!item) return null

  const typeLabel = TYPE_LABELS[exercise.exercise_type] || exercise.exercise_type
  const instruction = item.instruction_ar || getFallbackInstructions(g)[exercise.exercise_type] || g('أجِب عن السؤال', 'أجيبي عن السؤال')
  const num = String(index + 1).padStart(2, '0')

  // error_correction and transform items store the instruction and the sentence as
  // ONE run-on English line («Find and correct the error: 'Everyone must to read…'»),
  // so the words the student must FIX looked exactly like the words telling her to
  // fix them. Split them: the instruction reads small and quiet, the sentence gets
  // the weight and a rule beside it. Other types are rendered exactly as before.
  const SPLIT_TYPES = ['error_correction', 'transform']
  const parts = SPLIT_TYPES.includes(exercise.exercise_type) ? splitPrompt(item.question) : { lead: '', sentence: item.question }

  return (
    <div data-grammar-exercise-card className="grammar-glass p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold font-en" style={{ color: 'var(--text-tertiary)' }}>
            {num} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {DIFFICULTY[Number(item.difficulty)] && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-md font-['Tajawal']"
              style={{
                background: DIFFICULTY[Number(item.difficulty)].bg,
                color: DIFFICULTY[Number(item.difficulty)].color,
              }}
            >
              {Number(item.difficulty) === 5 ? '🔥 ' : ''}{DIFFICULTY[Number(item.difficulty)].label}
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-md font-['Tajawal']"
            style={{ background: 'var(--info-bg)', color: 'var(--accent-sky)', border: '1px solid var(--info-border)' }}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="exercise-instruction" dir="rtl">
        <span className="instruction-icon">💡</span>
        <span>{instruction}</span>
      </div>

      {/* Question text */}
      {parts.lead ? (
        <div className="space-y-1.5">
          <p className="text-[12.5px] font-en leading-snug" dir="ltr" style={{ color: 'var(--text-tertiary)' }}>
            {parts.lead}
          </p>
          <p
            className="text-[17px] font-medium font-en leading-relaxed"
            dir="ltr"
            style={{
              color: 'var(--text-primary)',
              paddingInlineStart: '0.75rem',
              borderInlineStart: '2px solid var(--accent-sky)',
            }}
          >
            {parts.sentence}
          </p>
        </div>
      ) : (
        <p className="text-[17px] font-medium font-en leading-relaxed" dir="ltr" style={{ color: 'var(--text-primary)' }}>
          {item.question}
        </p>
      )}

      {/* «تلميح» — points at the rule without giving the answer away, and only
          before she has answered. After that the explanation takes over. */}
      {hintAr && !answer && (
        <div>
          <button
            type="button"
            onClick={() => {
              // TOUR PORT: the analytics event (trackEvent → supabase) is not fired.
              setHintOpen(!hintOpen)
            }}
            className="grammar-explain-btn"
            aria-expanded={hintOpen}
          >
            <Lightbulb size={14} />
            {hintOpen ? 'إخفاء التلميح' : 'تلميح'}
          </button>
          {hintOpen && (
            <div className="grammar-explanation-bar mt-2" dir="rtl">
              <RichText
                text={hintAr}
                dir={/[؀-ۿ]/.test(hintAr) ? 'rtl' : 'ltr'}
                className="text-xs font-['Tajawal'] leading-relaxed"
              />
            </div>
          )}
        </div>
      )}

      {/* Question type renderer */}
      {exercise.exercise_type === 'choose' && (
        <MCQQuestion item={item} answer={answer} onAnswer={onAnswer} />
      )}
      {exercise.exercise_type === 'fill_blank' && (
        <FillBlankQuestion item={item} answer={answer} onAnswer={onAnswer} />
      )}
      {exercise.exercise_type === 'error_correction' && (
        <ErrorCorrectionQuestion item={item} answer={answer} onAnswer={onAnswer} />
      )}
      {exercise.exercise_type === 'reorder' && (
        <ReorderQuestion item={item} answer={answer} onAnswer={onAnswer} />
      )}
      {(exercise.exercise_type === 'transform' || exercise.exercise_type === 'make_question') && (
        <TransformQuestion item={item} answer={answer} onAnswer={onAnswer} exerciseType={exercise.exercise_type} />
      )}

      {/* Verdict after answer — your answer vs the correct one + why.
          Wrapped in .qx-scope so the shared verdict styles pick up an accent. */}
      {answer && answer.selected != null && (
        <div className="qx-scope" data-accent="violet">
          <VerdictPanel
            correct={!!answer.correct}
            selectedText={String(answer.selected)}
            correctText={item.correct_answer}
            explanationAr={item.explanation_ar}
            explanationEn={!item.explanation_ar ? (ruleSnippet || null) : null}
            kind="grammar"
          />
        </div>
      )}

      {/* "اشرح لي" AI tutor button — shown after any answer */}
      {answer && (
        <button
          className="grammar-explain-btn"
          onClick={() => setExplainOpen((v) => !v)}
          aria-expanded={explainOpen}
        >
          <Sparkles size={14} />
          اشرح لي
        </button>
      )}

      {/* TOUR PORT: in place of the AI Explain Modal */}
      {answer && explainOpen && (
        <InPlatformNote>
          داخل المنصة يفتح «اشرح لي» شرحًا لإجابتك أنت: سؤالك وإجابتك والصحيح جنبًا إلى جنب، ثم شرح سريع وآخر كامل بأمثلة من موضوع الوحدة.
        </InPlatformNote>
      )}
    </div>
  )
}
