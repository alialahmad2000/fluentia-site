import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { StepHead, PlayButton, PlayDialogue, markExpression, stopAudio } from './_parts'
import World from './World'
import { Bi, KindBadge, FREQUENCY, themeOf } from './labels'
import { g, ROOM_PATH } from './visitor'
import { SheetSwitcher, NextSheet, SampleFeedback } from './TourBits'
import './expressions.css'

/**
 * TOUR PORT of fluentia-lms src/pages/student/expressions/ProverbSheet.jsx
 * (origin/main 3396e97e).
 *
 * Stripped: useExpressions / useExpressionProgress (the proverb arrives as a
 * prop from the snapshot), the «seen» mount effect and every record.mutate
 * (progress writes), useEffectiveStudentId, and the grade-expression-use
 * invoke. Step 4 shows a labelled static example instead of a live grader.
 * The guess-first gating (steps 2–4 only after a pick) is untouched.
 *
 * «ورقة المثل» — one proverb, studied.
 *
 * The order is deliberate: the learner GUESSES before being told anything. A
 * meaning reached alone and a twin already owned stick; a meaning handed over
 * cold does not.
 */
export default function ProverbSheet({ item: p }) {
  const [picked, setPicked] = useState(null)

  // Leaving the sheet silences whatever it was playing.
  useEffect(() => () => stopAudio(), [])

  const guess = useMemo(
    () => (p?.expression_questions ?? []).find((q) => q.kind === 'guess_meaning'),
    [p],
  )
  const revealed = picked !== null

  function pick(opt, i) {
    if (revealed) return
    setPicked(i)
  }

  return (
    <div className="expr-root is-hall">
      <World src={p.image_url} />
      <div className="expr-wrap">
        <div className="tx-sheet-top">
          <Link to={ROOM_PATH} className="expr-back"><ArrowRight size={16} aria-hidden /> <Bi en="Proverbs & Idioms" ar="الأمثال والتعابير" /></Link>
          <SheetSwitcher current={p.slug} />
        </div>

        <div className="expr-hero">
          {p.image_url ? <img src={p.image_url} alt="" /> : null}
          <span className="veil" />
          <span className="cap">
            <KindBadge kind="proverb" />
            <span className="en" dir="ltr">{p.text_en}</span>
          </span>
        </div>

        <div className="expr-tags" style={{ marginTop: 14 }}>
          <span className="expr-tag"><i /><Bi en={FREQUENCY[p.frequency]?.en} ar={FREQUENCY[p.frequency]?.ar} /></span>
          <span className="expr-tag"><i /><Bi en={themeOf(p).en} ar={themeOf(p).ar} /></span>
          <span className="expr-tag"><i /><Bi en={`Level ${p.cefr_level}`} ar={`المستوى ${p.cefr_level}`} /></span>
        </div>
        <div style={{ marginTop: 12 }}><PlayButton url={p.audio_url} label={<Bi en="Listen" ar={g('استمع إلى المثل', 'استمعي إلى المثل')} />} /></div>

        {guess ? (
          <section className="expr-step">
            <StepHead n={1} title={<Bi en="Guess first" ar={g('خمّن أولاً', 'خمّني أولاً')} />} hint="قبل أي شرح" />
            <div className="expr-opts">
              {(guess.options ?? []).map((o, i) => (
                <button key={i} type="button" disabled={revealed}
                  className={`expr-opt${revealed ? (o.ok ? ' is-right' : ' is-wrong') : ''}`}
                  onClick={() => pick(o, i)}>
                  {o.t}
                  {o.tag_ar ? <span className="tag">{o.tag_ar}{o.ok ? ' ✓' : ' ✕'}</span> : null}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {(revealed || !guess) ? (
          <>
            <section className="expr-step">
              <StepHead n={2} title={<Bi en="Meaning, then its Arabic twin" ar="المعنى، ثم التوأم" />} />
              <p className="expr-meaning">{p.meaning_ar}</p>
              {p.arabic_twin ? (
                <div className="expr-twin">
                  <p className="lbl"><Bi en="Arabic twin" ar="التوأم العربي" /></p>
                  <p className="say">{p.arabic_twin}</p>
                  {p.twin_note_ar ? <p className="note">{p.twin_note_ar}</p> : null}
                </div>
              ) : null}
            </section>

            <section className="expr-step">
              <StepHead n={3} title={<Bi en="When it is actually said" ar="متى تُقال فعلاً" />} hint="لحظة حقيقية، لا جملة معزولة" />
              <p className="expr-meaning" style={{ fontSize: '.9375rem', marginBottom: 14 }}>{p.when_to_use_ar}</p>
              <div className="expr-dlg">
                {(p.expression_examples ?? []).map((l) => (
                  <div key={l.id} className={`expr-line${l.is_target ? ' is-target' : ''}`}>
                    <span className="expr-who" aria-hidden>{l.speaker}</span>
                    <div className="expr-bub" dir="ltr">
                      {l.is_target ? markExpression(l.text_en, p.text_en) : l.text_en}
                      <span className="ar" dir="rtl">{l.text_ar}</span>
                    </div>
                  </div>
                ))}
              </div>
              <PlayDialogue lines={p.expression_examples} />
            </section>

            <section className="expr-step">
              <StepHead n={4} title={<Bi en="Use it yourself" ar={g('استخدمه أنت', 'استخدميه أنتِ')} />} hint={g('اكتب موقفاً من حياتك', 'اكتبي موقفاً من حياتك')} />
              <SampleFeedback slug={p.slug} />
            </section>
          </>
        ) : null}

        <NextSheet current={p.slug} />
      </div>
    </div>
  )
}
