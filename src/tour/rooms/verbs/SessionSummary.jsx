import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Sparkles, AlertTriangle, Compass, RotateCcw, ArrowLeft, Star } from 'lucide-react'
import { ERROR_AR } from './verbMastery'
import { neighbours, roomPath } from '../../rooms'

const toAr = (n) => (n == null ? '' : String(n))
const verbsAr = (n) => (n === 1 ? 'فعل واحد' : n === 2 ? 'فعلان'
  : n <= 10 ? `${toAr(n)} أفعال` : `${toAr(n)} فعلاً`)
const ORDER = ['regularized', 'v2_v3_swap', 'wrong_vowel', 'near_miss', 'wrong_verb', 'blank', 'other']

/**
 * The end of a run. On the platform, finish() writes the run, pays XP and
 * returns to the ladder home, which opens with this verdict panel — and the
 * home's «أخطاؤك المتكرّرة» and «أفعال تتعثّر فيها» panels are built from the
 * same error kinds and verbs. The tour shows those three panels for THIS
 * session (nothing is saved), then walks on: the atlas, or the next room.
 */
export default function SessionSummary({ summary, onAgain }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const { next } = neighbours('verbs')
  const total = summary.items.length
  const pct = total ? Math.round((summary.right / total) * 100) : 0
  const fade = (d = 0) => (reduce
    ? { initial: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 },
        transition: { delay: d, duration: 0.4, ease: [0.16, 1, 0.3, 1] } })

  const counts = {}
  for (const it of summary.items) if (!it.ok && it.kind) counts[it.kind] = (counts[it.kind] || 0) + 1
  const errorEntries = Object.entries(counts).sort((a, b) => b[1] - a[1] || ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
  const missed = summary.items.filter((it) => !it.ok)

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* ── the run's verdict ── */}
      <motion.div {...fade()} className={`vl-p p-5 ${pct >= 85 ? 'vl-c-green' : 'vl-c-amber'}`} role="status">
        <div className="flex items-start gap-3">
          <span style={{ color: 'rgb(var(--vl-rgb))' }}>
            {pct >= 85 ? <Check size={20} /> : <Sparkles size={20} />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="vl-p__h" style={{ display: 'block' }}>
              {total
                ? (summary.right ? `${toAr(summary.right)} صحيحة من ${toAr(total)}` : `لا إجابة صحيحة من ${toAr(total)}`)
                : 'انتهت الجلسة'}
            </p>
            <p className="vl-dim mt-1 text-sm">
              {summary.wrong === 0
                ? 'جلسة نظيفة بالكامل.'
                : `${verbsAr(summary.wrong)} تحتاج عودة — وفي المنصة تعود قريباً في المراجعة.`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── what went wrong, by name ── */}
      {errorEntries.length > 0 && (
        <motion.div {...fade(0.06)} className="vl-p vl-c-red p-5 sm:p-6 mt-6">
          <h2 className="vl-p__h mb-4">
            <AlertTriangle size={16} /> أخطاؤك في هذه الجلسة
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

      {/* ── the verbs that slipped ── */}
      {missed.length > 0 && (
        <motion.div {...fade(0.1)} className="vl-p vl-c-pink p-5 sm:p-6 mt-6">
          <h2 className="vl-p__h" style={{ display: 'block' }}>أفعال تعثّرت فيها</h2>
          <p className="vl-dim mt-1 mb-3 text-xs">
            واحدة منها تفتح تدريباً عليها وحدها.
          </p>
          {missed.map((it, n) => (
            <button
              key={`${it.verb.base_form}-${n}`} className="vl-row"
              onClick={() => navigate(`/tour/verbs/session?verb=${encodeURIComponent(it.verb.base_form)}`)}
              aria-label={`تدرّب على ${it.verb.base_form}`}
            >
              <span className="vl-dot vl-dot--learning" aria-hidden />
              <span className="vl-row__main">
                <span className="vl-row__forms">
                  <span className="f1">{it.verb.base_form}</span>
                  <span className="f2">{it.verb.past_simple}</span>
                  <span className="f3">{it.verb.past_participle}</span>
                </span>
                <span className="vl-row__ar">
                  {it.verb.meaning_ar}
                  {it.kind ? ` — ${ERROR_AR[it.kind]?.title || ''}` : ''}
                </span>
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* ── the honest part: one session is not mastery ── */}
      <motion.div {...fade(0.14)} className="vl-p vl-p--quiet vl-c-amber p-5 mt-6">
        <p className="font-bold text-[.95rem] flex items-center gap-1.5" style={{ color: 'var(--vl-amber)' }}>
          <Star size={15} style={{ flex: 'none' }} /> متى يصبح الفعل «مُتقَناً»؟
        </p>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--vc-text-dim)' }}>
          لا في جلسة واحدة. يُحسب الفعل مُتقَناً حين تكتب تصريفاته الثلاثة صحيحة من معناه العربي وحده،
          في ثلاثة أيام متفرّقة تمتد عشرة أيام على الأقل. لذلك لا يمكن للحفظ السريع أن يصل إليه.
        </p>
      </motion.div>

      {/* ── walk on ── */}
      <motion.div {...fade(0.18)} className="mt-6">
        <Link to="/tour/verbs/atlas" className="vl-p vl-p--link vl-c-green p-5 flex items-center gap-3"
          style={{ textDecoration: 'none' }}>
          <Compass size={18} style={{ color: 'rgb(var(--vl-rgb))', flex: 'none' }} />
          <div className="flex-1">
            <div className="vl-p__h" style={{ display: 'block' }}>أطلس الأفعال</div>
            <div className="vl-dim text-sm mt-0.5">
              العائلات التي تجمع الأفعال بقاعدة واحدة — وأين وقعت أفعال هذه الجلسة منها.
            </div>
          </div>
        </Link>
        <div className="flex gap-2.5 mt-4 flex-wrap">
          {next && (
            <Link to={roomPath(next.slug)} className="vl-b vl-b--solid vl-c-cyan" style={{ textDecoration: 'none' }}>
              الغرفة التالية: {next.title} <ArrowLeft size={16} />
            </Link>
          )}
          <button className="vl-b vl-c-violet" onClick={onAgain}>
            <RotateCcw size={16} /> أعِد الجلسة
          </button>
        </div>
      </motion.div>
    </div>
  )
}
