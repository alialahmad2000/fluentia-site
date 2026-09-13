import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Play, Compass, AlertTriangle, Sparkles, Repeat2 } from 'lucide-react'
import VocabShell from './VocabShell'
import VerbRoom from './VerbRoom'
import { ERROR_AR, STAGES } from './verbMastery'
import { SAMPLE, DEMO_QUEUE } from './sample'

/**
 * TOUR PORT of fluentia-lms src/pages/student/verbs/VerbLadder.jsx — the home
 * of the irregular-verb ladder (origin/main 3396e97e).
 *
 * Kept: the header, the one progress bar with its four-state key, the week
 * panel and its primary action, the error profile, the shaky-verb rows and the
 * atlas link — same markup, classes and copy.
 *
 * Stripped: six react-query hooks, the ?verb= deep link (two table reads),
 * placement and the weekly test (RPCs), and finish() (two RPCs + XP). The
 * placement card and the test button are not shown: both need a server.
 *
 * Honest framing: the header and the week panel speak to the VISITOR (nothing
 * mastered yet, one demo session waiting). The bar, the errors and the shaky
 * rows are a labelled example of a student some weeks in — not the visitor's
 * progress, and not any real student's.
 */

const toAr = (n) => (n == null ? '' : String(n))
const verbsAr = (n) => (n === 1 ? 'فعل واحد' : n === 2 ? 'فعلان'
  : n <= 10 ? `${toAr(n)} أفعال` : `${toAr(n)} فعلاً`)

/* the four states, in the order they are earned — so the bar fills from the
   start of the line rather than scattering colour along it */
export const STATES = [
  { k: 'mastered', t: 'مُتقَن',       c: 'var(--vl-amber)' },
  { k: 'solid',    t: 'راسخ',        c: 'var(--vl-cyan)' },
  { k: 'learning', t: 'قيد التعلّم', c: 'var(--vl-violet)' },
  { k: 'new',      t: 'لم يبدأ',     c: 'rgba(255,255,255,.30)' },
]

export default function VerbLadder({ families, total }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()

  /* the caption used to say «عشرين مجموعة» — but `unique` is the leftovers
     bucket, not a family, so the real shape is nineteen families plus a
     scatter of one-offs. Counted from the data so it cannot drift again. */
  const skyShape = useMemo(() => {
    if (!families?.length) return null
    const loners = families.find((f) => f.key === 'unique')?.n || 0
    const fams = families.filter((f) => f.key !== 'unique' && f.n > 0).length
    return { loners, grouped: total - loners, fams }
  }, [families, total])

  const spread = SAMPLE.spread
  const mastered = spread.mastered
  const errorEntries = Object.entries(SAMPLE.errors).sort((a, b) => b[1] - a[1])
  const queueLen = DEMO_QUEUE.length
  const fade = (d = 0) => (reduce
    ? { initial: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 },
        transition: { delay: d, duration: 0.4, ease: [0.16, 1, 0.3, 1] } })

  const startSession = () => navigate('/tour/verbs/session')
  const drillOne = (base) => navigate(`/tour/verbs/session?verb=${encodeURIComponent(base)}`)

  return (
    <VocabShell room={<VerbRoom />} className="vl-pure" labelledBy="vl-home-title">
      <div className="vl-col">
      {/* ── header, in the shape its neighbours use ── */}
      <header className="mb-6">
        <h1 id="vl-home-title" className="vl-title text-[28px] sm:text-[34px] font-bold leading-tight">
          الأفعال الشاذة
        </h1>
        <p className="vl-sub mt-1.5 text-sm max-w-[42ch]">
          {toAr(total)} فعلاً شاذّاً، أسبوعاً بعد أسبوع. الهدف ليس أن تُقرأ، بل أن تُكتب
          التصريفات الثلاثة من الذاكرة — وأن تبقى صحيحة بعد شهر منها.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="vl-pill vl-c-cyan"><Sparkles size={14} /> أول فعل بانتظارك</span>
          <span className="vl-pill vl-c-violet">
            <Repeat2 size={14} />
            <span className="tabular-nums">{toAr(queueLen)}</span> مستحقّة الآن
          </span>
        </div>
      </header>

      {/* ── this week: the visitor's own session ── */}
      <motion.div {...fade(0.02)} className="vl-p vl-c-amber p-6 sm:p-8">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="vl-num-hero text-[2.2rem] sm:text-[2.6rem] font-bold tabular-nums">
            {toAr(queueLen)}
          </div>
          <p className="vl-sub pb-1.5 text-sm">
            أفعال في جلسة اليوم · كل فعل على درجة مختلفة من السُلّم
          </p>
        </div>

        <ol className="vl-rungs mt-5" aria-label="درجات السُلّم في هذه الجلسة">
          {DEMO_QUEUE.map((row, n) => (
            <li key={row.verb.base_form}>
              <span className="vl-rungs__n tabular-nums">{toAr(n + 1)}</span>
              <span className="vl-rungs__t">{STAGES[row.stage].label}</span>
            </li>
          ))}
        </ol>

        <div className="flex gap-2.5 mt-6 flex-wrap">
          <button className="vl-b vl-b--solid vl-c-amber" onClick={startSession}>
            <Play size={16} /> جلسة اليوم — {verbsAr(queueLen)}
          </button>
        </div>
        <p className="vl-dim mt-3 text-xs">
          تجربة كاملة داخل الصفحة: تكتب، ويصحّحك المصحّح نفسه الذي يصحّح لطلابنا. لا يُحفظ شيء.
        </p>
      </motion.div>

      {/* ── a labelled example: what the same page looks like weeks in ── */}
      <div className="vl-sample" role="note">
        <span className="vl-sample__line" aria-hidden />
        <span className="vl-sample__label">مثال لتقدّم طالب بعد بضعة أسابيع</span>
        <span className="vl-sample__line" aria-hidden />
      </div>

      {/* ── progress: one bar, four numbers ── */}
      <motion.div {...fade(0.06)} className="vl-p vl-c-cyan p-5">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="vl-p__h">تقدّم الطالب</h2>
          <span className="vl-dim text-sm">
            مُتقَن: <b className="tabular-nums" style={{ color: 'var(--vl-amber)' }}>{toAr(mastered)}</b> من {toAr(total)}
          </span>
        </div>
        <div className="vl-bar mt-3" role="img"
          aria-label={`مثال: ${toAr(spread.mastered)} مُتقَن، ${toAr(spread.solid)} راسخ، ${toAr(spread.learning)} قيد التعلّم، ${toAr(spread.new)} لم يبدأ`}>
          {STATES.map((st) => spread[st.k] > 0 && (
            <i key={st.k} style={{ width: `${(spread[st.k] / total) * 100}%`, background: st.c, color: st.c }} />
          ))}
        </div>
        <ul className="vl-key">
          {STATES.map((st) => (
            <li key={st.k}>
              <i style={{ background: st.c, color: st.c }} />
              <b className="tabular-nums">{spread[st.k] ? toAr(spread[st.k]) : '—'}</b>
              <span>{st.t}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ── the error profile: the reason this system exists ── */}
      {errorEntries.length > 0 && (
        <motion.div {...fade(0.1)} className="vl-p vl-c-red p-5 sm:p-6 mt-6 sm:mt-8">
          <h2 className="vl-p__h mb-4">
            <AlertTriangle size={16} /> أخطاؤه المتكرّرة
          </h2>
          <div className="space-y-4">
            {errorEntries.slice(0, 3).map(([kind, n]) => (
              <div key={kind}>
                <p className="flex items-baseline gap-2.5 flex-wrap font-bold text-[.95rem]"
                  style={{ color: 'var(--vl-paper)' }}>
                  {ERROR_AR[kind]?.title || kind}
                  <span className="vl-pill vl-c-red">
                    <span className="tabular-nums">{toAr(n)}</span>
                    {n === 1 ? 'مرة' : n === 2 ? 'مرتان' : 'مرات'}
                  </span>
                </p>
                <p className="vl-dim mt-1 text-sm leading-relaxed">
                  {ERROR_AR[kind]?.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── the verbs that keep slipping ── */}
      {SAMPLE.shaky.length > 0 && (
        <motion.div {...fade(0.14)} className="vl-p vl-c-pink p-5 sm:p-6 mt-6 sm:mt-8">
          <h2 className="vl-p__h" style={{ display: 'block' }}>أفعال يتعثّر فيها</h2>
          <p className="vl-dim mt-1 mb-3 text-xs">
            مرتّبة بعدد المرات التي لم تُكتب فيها صحيحة — واحدة منها تفتح تدريباً عليها وحدها. جرّب.
          </p>
          {SAMPLE.shaky.map((sv) => (
            <button
              key={sv.verb.base_form} className="vl-row"
              onClick={() => drillOne(sv.verb.base_form)}
              aria-label={`تدرّب على ${sv.verb.base_form}`}
            >
              <span className="vl-dot vl-dot--learning" aria-hidden />
              <span className="vl-row__main">
                <span className="vl-row__forms">
                  <span className="f1">{sv.verb.base_form}</span>
                  <span className="f2">{sv.verb.past_simple}</span>
                  <span className="f3">{sv.verb.past_participle}</span>
                </span>
                <span className="vl-row__ar">
                  {sv.verb.meaning_ar}
                  {sv.last_error_kind ? ` — ${ERROR_AR[sv.last_error_kind]?.title || ''}` : ''}
                </span>
              </span>
              <span className="vl-pill vl-c-pink">
                <span className="tabular-nums">{toAr(sv.misses)}</span>
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* ── the atlas ── */}
      <motion.div {...fade(0.18)} className="mt-6 sm:mt-8">
        <Link to="/tour/verbs/atlas" className="vl-p vl-p--link vl-c-green p-5 flex items-center gap-3"
          style={{ textDecoration: 'none' }}>
          <Compass size={18} style={{ color: 'rgb(var(--vl-rgb))', flex: 'none' }} />
          <div className="flex-1">
            <div className="vl-p__h" style={{ display: 'block' }}>قائمة الأفعال كاملة</div>
            <div className="vl-dim text-sm mt-0.5">
              {toAr(total)} فعلاً مرتّبة بعائلاتها{skyShape ? ` — ${toAr(skyShape.fams)} قاعدة تجمع ${toAr(skyShape.grouped)} منها.` : '.'}
            </div>
          </div>
        </Link>
      </motion.div>
      </div>
    </VocabShell>
  )
}
