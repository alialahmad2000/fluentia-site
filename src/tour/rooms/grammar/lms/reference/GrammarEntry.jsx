/**
 * A single reference entry.
 *
 * TOUR PORT of fluentia-lms src/pages/student/grammar-reference/GrammarEntry.jsx
 * (origin/main 3396e97e). Same markup, classes, order and motion. What changed, and why:
 *   - data: the five react-query hooks became one `entry` prop (a static snapshot);
 *     `prev` / `next` / `related` / `library_count` travel inside it.
 *   - writes: no read receipt (useMarkViewed) and no server bookmark (useToggleSaved).
 *     The bookmark still toggles, locally, and says where saving really happens.
 *   - links: every <Link> pointed at /student/… (login-only). They are buttons here that
 *     open a small «متاح داخل المنصة» note instead of dead-ending the visitor.
 *
 * Order is deliberate: the RULE first, then how it is built, then it in use, then the
 * neighbour it gets confused with, then why an Arabic speaker specifically trips here,
 * then the exceptions — and only at the end, the self-check. A reference is read by
 * someone who arrived with a question; the answer goes at the top, not after a warm-up.
 */
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Bookmark, BookmarkCheck, NotebookPen } from 'lucide-react'
import SectionJumper from '../components/SectionJumper'
import Sections, { navRows, Head, AFTER_DRILLS } from './_sections'
import Drills from './_drills'
import InPlatformNote from '../../tour/InPlatformNote'
import './grammarRef.css'

export default function GrammarEntry({ entry }) {
  const reduce = useReducedMotion()
  const [saved, setSaved] = useState(false)
  // Which «متاح داخل المنصة» note is open, keyed by the control that opened it.
  const [note, setNote] = useState(null)
  const toggleNote = (key) => setNote((n) => (n === key ? null : key))

  // A reference is consulted mid-sentence: the ANSWER must not be staged in. Six delayed
  // fades pushed the rule to ~420ms. One short movement, no per-block delay, explicit ease —
  // passing `duration` without `ease` makes framer fall back to easeInOut, which eases IN.
  const rise = () => (reduce ? { initial: false }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } })

  // The self-check is the most useful destination on the page and was the one place the
  // rail could not reach: it lives here, not in `content.sections`, so sectionNav() never
  // saw it. Append it by hand rather than leave the exercises unreachable from the rail.
  const hasDrills = (entry.drills || []).length > 0
  const rows = navRows(entry.content?.sections || [])
  // Rail order must equal page order. «الاستثناءات» renders AFTER the self-check, so the
  // drills chip belongs between the spine and it.
  const chip = ({ id, label }) => ({ id, label })
  const nav = [
    ...rows.filter((r) => !AFTER_DRILLS.has(r.type)).map(chip),
    ...(hasDrills ? [{ id: 'gref-drills', label: 'تأكّد من فهمك' }] : []),
    ...rows.filter((r) => AFTER_DRILLS.has(r.type)).map(chip),
  ]
  const related = entry.related || []
  const overrides = entry.diagram_overrides || {}
  const libraryCount = entry.library_count || 309

  return (
    <div className="gref px-1" dir="rtl">
      <motion.div {...rise()}>
        <button type="button" onClick={() => toggleNote('library')} aria-expanded={note === 'library'}
                className="inline-flex items-center gap-1.5 font-['Tajawal'] text-[13px] mb-4"
                style={{ color: 'var(--gref-muted)' }}>
          <ArrowRight size={15} /> Grammar Library
        </button>
        {note === 'library' ? (
          <InPlatformNote className="mb-4">
            المكتبة كاملة داخل المنصة: {libraryCount} قواعد في 18 بابًا، تبحث فيها بالعربية أو الإنجليزية.
          </InPlatformNote>
        ) : null}
      </motion.div>

      <motion.header {...rise()} className="mb-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* `gref-en` sets direction:ltr, so with text-align:start the English title
                painted flush LEFT (x≈103) while its own Arabic subtitle painted flush RIGHT
                (x≈959) one line below — measured, on all 309 pages. The heading now stays in
                the page's RTL flow and only the English RUN is isolated. */}
            <h1 className="font-en text-[26px] sm:text-[34px] font-bold leading-[1.1] tracking-[-0.015em]" style={{ color: 'var(--gref-ink)' }}>
              <bdi dir="ltr" lang="en">{entry.title_en}</bdi>
            </h1>
            {/* The student searches in Arabic, so the Arabic is a title, not a caption.
                Gold at 15px read as a label; 19px in body ink reads as the name of the
                thing. Gold is reserved for the rule block. */}
            <p className="font-['Tajawal'] text-[19px] mt-2.5 font-medium" style={{ color: 'var(--gref-body)' }}>{entry.title_ar}</p>
            {entry.summary_ar ? (
              <p className="font-['Tajawal'] text-[13.5px] mt-2 gref-prose" style={{ color: 'var(--gref-body)', lineHeight: 1.85 }}>
                {entry.summary_ar}
              </p>
            ) : null}
          </div>
          <button type="button" aria-label={saved ? 'إزالة من المحفوظات' : 'حفظ هذه القاعدة'}
                  aria-pressed={saved}
                  onClick={() => { setSaved((s) => !s); setNote(saved ? null : 'saved') }}
                  className="shrink-0 grid place-items-center rounded-full"
                  style={{ width: 44, height: 44, color: saved ? 'var(--gref-accent)' : 'var(--gref-muted)', border: '1px solid var(--gref-line-2)' }}>
            {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="font-en text-[12px] px-2 py-0.5 rounded" dir="ltr" lang="en"
                style={{ color: 'var(--gref-muted)', border: '1px solid var(--gref-line-2)' }}>{entry.cefr}</span>
        </div>
        {note === 'saved' ? (
          <InPlatformNote className="mt-3">
            داخل المنصة تُحفظ القاعدة في حسابك ضمن «المحفوظة»، وتعود إليها من أي جهاز.
          </InPlatformNote>
        ) : null}
      </motion.header>

      {/* The index solved this and the entry never got it: with no ground, a 6,000–12,000px
          bilingual document paints straight THROUGH the sticky rail — English sentences
          legible over the chips. It is the biggest single contributor to the page reading as
          messy rather than composed. */}
      <div className="sticky z-rise pb-2.5 pt-1 mb-4"
           style={{
             top: 'calc(var(--impersonation-banner-height, 0px) + var(--header-height, 64px))',
             background: 'var(--ds-bg-base, #05070d)',
             backdropFilter: 'blur(18px) saturate(1.4)',
             WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
             marginInline: -16, paddingInline: 16,
             // Without a closing edge the ground reads as a stray black slab behind the
             // chips. One hairline turns it into a deliberate bar.
             borderBlockEnd: '1px solid var(--gref-line-2)',
           }}>
        <SectionJumper sections={nav} />
      </div>

      <motion.div {...rise()}>
        <Sections sections={entry.content?.sections || []} overrides={overrides} only="spine" />
      </motion.div>

      {(entry.drills || []).length ? (
        <motion.section {...rise()} id="gref-drills" className="mt-8"
                       style={{ scrollMarginTop: 'calc(var(--impersonation-banner-height, 0px) + var(--header-height, 64px) + 68px)' }}>
          {/* Was a hand-rolled heading: icon + bold text, no hairline — the only section
              title on the page that did not match the other eight. */}
          <Head icon={NotebookPen}>تأكّد من فهمك</Head>
          <Drills drills={entry.drills} />
        </motion.section>
      ) : null}

      {(() => {
        const { prev, next } = entry
        if (!prev && !next) return null
        return (
          <>
            <nav className="mt-10 flex items-stretch gap-2.5">
              {prev ? (
                <button type="button" onClick={() => toggleNote('sibling')} className="gref-panel p-4 flex-1 min-w-0 flex items-center gap-2 text-start">
                  <ArrowRight size={15} className="shrink-0" style={{ color: 'var(--gref-muted)' }} />
                  <span className="min-w-0">
                    <span className="block font-['Tajawal'] text-[12px]" style={{ color: 'var(--gref-muted)' }}>السابق</span>
                    <span lang="en" className="block gref-en font-en text-[13px] truncate" style={{ color: 'var(--gref-ink)' }}>{prev.title_en}</span>
                  </span>
                </button>
              ) : <span className="flex-1" />}
              {next ? (
                <button type="button" onClick={() => toggleNote('sibling')} className="gref-panel p-4 flex-1 min-w-0 flex items-center gap-2 justify-end text-end">
                  <span className="min-w-0">
                    <span className="block font-['Tajawal'] text-[12px]" style={{ color: 'var(--gref-muted)' }}>التالي</span>
                    <span lang="en" className="block gref-en font-en text-[13px] truncate" style={{ color: 'var(--gref-ink)' }}>{next.title_en}</span>
                  </span>
                  <ArrowLeft size={15} className="shrink-0" style={{ color: 'var(--gref-muted)' }} />
                </button>
              ) : <span className="flex-1" />}
            </nav>
            {note === 'sibling' ? (
              <InPlatformNote className="mt-2.5">
                في هذه الجولة قاعدة واحدة. داخل المنصة تتنقّل بين قواعد الباب كلها بالترتيب.
              </InPlatformNote>
            ) : null}
          </>
        )
      })()}

      {/* «انتبه للاستثناءات» renders AFTER the self-check: a list of exceptions read
          immediately before a retrieval attempt is peak interference. */}
      <div className="mt-8">
        <Sections sections={entry.content?.sections || []} overrides={overrides} only="after" />
      </div>

      {related.length ? (
        <motion.section {...rise()} className="mt-8">
          <h2 className="font-['Tajawal'] text-[15px] font-bold mb-2.5" style={{ color: 'var(--gref-ink)' }}>اقرأ بعدها</h2>
          <div className="space-y-2">
            {related.map((r) => (
              <button key={r.slug} type="button" onClick={() => toggleNote('related')} className="gref-panel w-full p-4 flex items-center gap-3 text-start">
                <div className="min-w-0 flex-1">
                  <span lang="en" className="gref-en font-en text-[14px] font-semibold" style={{ color: 'var(--gref-ink)' }}>{r.title_en}</span>
                  <p className="font-['Tajawal'] text-[12px] mt-0.5 truncate" style={{ color: 'var(--gref-body)' }}>{r.title_ar}</p>
                </div>
              </button>
            ))}
          </div>
          {note === 'related' ? (
            <InPlatformNote className="mt-2.5">
              هذه القواعد المرتبطة تفتح داخل المنصة، ولكل واحدة رسمها وتمارينها.
            </InPlatformNote>
          ) : null}
        </motion.section>
      ) : null}
    </div>
  )
}
