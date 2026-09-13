import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { StepHead, PlayButton, PlayDialogue, markExpression, stopAudio } from './_parts'
import World from './World'
import { Bi, KindBadge, FREQUENCY, REGISTER, themeOf } from './labels'
import { g, ROOM_PATH } from './visitor'
import { SheetSwitcher, NextSheet, SampleFeedback } from './TourBits'
import { isoLatin } from './bidi'
import './expressions.css'

/**
 * TOUR PORT of fluentia-lms src/pages/student/expressions/IdiomSheet.jsx
 * (origin/main 3396e97e).
 *
 * Stripped: the data hooks (the idiom arrives as a prop), the «seen» mount
 * effect, the progress writes on reveal and on every gap pick, and the
 * grade-expression-use invoke (step 5 is a labelled static example).
 * Rewritten by hand: the feminine strings the platform hardcodes outside g()
 * («خمّني قبل الكشف», «ترينه لو ترجمتِ»). Fixed: the forms chips were keyed on
 * the form itself, and «cost, costs, cost» repeats a form (duplicate React key);
 * «لا تتغيّر» sat inside the monospace chip and fell back to a system Arabic
 * face; English quoted in Arabic rows is bidi-isolated (see bidi.jsx).
 *
 * One idiom, taken apart.
 *
 *   1. the literal panel alone — guess against the lie
 *   2. the reveal — both panels, the gap between them is the lesson
 *   3. the FRAME — the part that actually breaks: «spill beans», «break an ice»
 *   4. a real moment, voiced
 *   5. the form drill, then a sentence of one's own
 */
export default function IdiomSheet({ item: it }) {
  const [open, setOpen] = useState(false)
  const [gapPick, setGapPick] = useState(null)

  useEffect(() => () => stopAudio(), [])

  const gap = useMemo(() => (it?.expression_questions ?? []).find((q) => q.kind === 'gap_form'), [it])
  const hasLiteral = !!it?.image_literal_url

  function reveal() {
    setOpen(true)
  }

  function pickGap(opt) {
    setGapPick(opt)
  }

  const gapText = gapPick ? gapPick.t : '؟'

  return (
    <div className="expr-root is-lab">
      <World src={it.image_url} />
      <div className="expr-wrap">
        <div className="tx-sheet-top">
          <Link to={ROOM_PATH} className="expr-back"><ArrowRight size={16} aria-hidden /> <Bi en="Proverbs & Idioms" ar="الأمثال والتعابير" /></Link>
          <SheetSwitcher current={it.slug} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <KindBadge kind="idiom" />
          <h1 className="expr-title" dir="ltr"
            style={{ fontFamily: 'var(--x-en-lab)', fontWeight: 700, letterSpacing: '-.025em', marginTop: 12 }}>
            {it.text_en}
          </h1>
          <p className="expr-eyebrow" style={{ marginTop: 10, marginBottom: 0 }}>
            <Bi en="Word for word" ar={it.literal_ar} />
          </p>
          <div style={{ marginTop: 12 }}><PlayButton url={it.audio_url} label={<Bi en="Listen" ar={g('استمع إلى النطق', 'استمعي إلى النطق')} />} /></div>
        </div>

        <section className="expr-step" style={{ borderTop: 0 }}>
          <StepHead n={1} title={<Bi en="The lie, and the truth" ar="الكذبة والحقيقة" />} hint={hasLiteral ? 'خمّن قبل الكشف' : 'هذا التعبير قريب من معناه الحرفي'} />
          <div className={`expr-split${open || !hasLiteral ? ' is-open' : ''}`}>
            {hasLiteral ? (
              <div className="expr-pane is-literal">
                <img src={it.image_literal_url} alt="" />
                <span className="lbl"><Bi en="What the words say" ar="ما تقوله الكلمات" /></span>
                <span className="cap">{it.literal_ar} — هذا ما تراه لو ترجمت التعبير حرفياً.</span>
              </div>
            ) : null}
            <div className="expr-pane is-real">
              {it.image_url ? <img src={it.image_url} alt="" /> : null}
              <span className="lbl"><Bi en="What it means" ar="ما يعنيه فعلاً" /></span>
              <span className="cap"><b>{it.meaning_ar}</b></span>
              {hasLiteral && !open ? (
                <button type="button" className="expr-cover" onClick={reveal}>
                  <span className="q" aria-hidden>؟</span>
                  <span className="t">وش {g('تتوقع', 'تتوقعين')} معناه الحقيقي؟<br />{g('اضغط', 'اضغطي')} للكشف</span>
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {(open || !hasLiteral) ? (
          <>
            <section className="expr-step">
              <StepHead n={2} title={<Bi en="The frame" ar="القالب" />} hint="هنا تقع الأخطاء، لا في المعنى" />
              <div className="expr-frame">
                {it.frame_en ? <div className="expr-pattern" dir="ltr">{it.frame_en}</div> : null}
                {(Array.isArray(it.forms) && it.forms.length) || it.fixed_part_en ? (
                  <div className="expr-forms">
                    {(it.forms ?? []).map((f, i) => <span key={`${i}-${f}`} className="expr-form" dir="ltr">{f}</span>)}
                    {it.fixed_part_en ? (
                      <span className="expr-form is-fixed" dir="ltr">{it.fixed_part_en} — <span className="tx-ar-in" dir="rtl">لا تتغيّر</span></span>
                    ) : null}
                  </div>
                ) : null}

                {it.common_error_ar ? (
                  <div className="expr-warn">
                    <b>الخطأ الشائع عند المتحدثين بالعربية:</b><br />
                    {(it.wrong_forms ?? []).map((w) => (
                      <span key={w} className="expr-code is-bad" dir="ltr" style={{ marginInlineEnd: 6 }}>{w}</span>
                    ))}
                    {(it.wrong_forms ?? []).length ? <br /> : null}
                    والصواب <span className="expr-code is-good" dir="ltr">{it.text_en}</span> — {isoLatin(it.common_error_ar)}
                  </div>
                ) : null}

                <div className="expr-tags">
                  <span className="expr-tag"><i /><Bi en={REGISTER[it.register]?.en} ar={REGISTER[it.register]?.ar} /></span>
                  <span className="expr-tag"><i /><Bi en={FREQUENCY[it.frequency]?.en} ar={FREQUENCY[it.frequency]?.ar} /></span>
                  <span className="expr-tag"><i /><Bi en={themeOf(it).en} ar={themeOf(it).ar} /></span>
                  <span className="expr-tag"><i /><Bi en={`Level ${it.cefr_level}`} ar={`المستوى ${it.cefr_level}`} /></span>
                  {it.register_warning_ar ? (
                    <span className="expr-tag is-warn"><AlertTriangle size={13} aria-hidden /><span>{isoLatin(it.register_warning_ar)}</span></span>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="expr-step">
              <StepHead n={3} title={<Bi en="In a real moment" ar="في لحظة حقيقية" />} />
              <p className="expr-meaning" style={{ fontSize: '.9375rem', marginBottom: 14 }}>{it.when_to_use_ar}</p>
              <div className="expr-dlg">
                {(it.expression_examples ?? []).map((l) => (
                  <div key={l.id} className={`expr-line${l.is_target ? ' is-target' : ''}`}>
                    <span className="expr-who" aria-hidden>{l.speaker}</span>
                    <div className="expr-bub" dir="ltr">
                      {l.is_target ? markExpression(l.text_en, it.text_en) : l.text_en}
                      <span className="ar" dir="rtl">{l.text_ar}</span>
                    </div>
                  </div>
                ))}
              </div>
              <PlayDialogue lines={it.expression_examples} />
            </section>

            {gap ? (
              <section className="expr-step">
                <StepHead n={4} title={<Bi en="Build the right form" ar={g('ركّب الصيغة الصحيحة', 'ركّبي الصيغة الصحيحة')} />} hint={gap.hint_ar || 'بالتصريف المناسب'} />
                <p className="expr-gap" dir="ltr">
                  {String(gap.prompt_en ?? '').split('___')[0]}
                  <span className={`expr-blank${gapPick ? (gapPick.ok ? ' is-right' : ' is-wrong') : ''}`}>{gapText}</span>
                  {String(gap.prompt_en ?? '').split('___')[1] ?? ''}
                </p>
                <div className="expr-row">
                  {(gap.options ?? []).map((o) => (
                    <button key={o.t} type="button" className="expr-btn is-ghost" dir="ltr" onClick={() => pickGap(o)}>
                      {o.t}
                    </button>
                  ))}
                </div>
                {gapPick ? (
                  <div className={`expr-fb${gapPick.ok ? '' : ' is-wrong'}`}>
                    <b>{gapPick.ok ? 'صحيح ✓' : 'ليست هذه'}</b><br />
                    {gapPick.ok
                      ? <>الصيغة مضبوطة، و<span className="expr-code" dir="ltr">{it.fixed_part_en || it.text_en}</span> بقيت كما هي. هذا هو القالب.</>
                      : <>{isoLatin(it.common_error_ar)} {g('جرّب', 'جرّبي')} مرة أخرى.</>}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="expr-step">
              <StepHead n={gap ? 5 : 4} title={<Bi en="Use it yourself" ar={g('استعمله أنت', 'استعمليه أنتِ')} />} hint="جملة عن موقف حصل معك" />
              <SampleFeedback slug={it.slug} />
            </section>
          </>
        ) : null}

        <NextSheet current={it.slug} />
      </div>
    </div>
  )
}
