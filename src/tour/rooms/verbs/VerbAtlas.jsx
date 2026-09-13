import { useState, useMemo, useDeferredValue } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Search, ArrowRight, Lock } from 'lucide-react'
import VocabShell from './VocabShell'
import VerbRoom from './VerbRoom'

/**
 * TOUR PORT of fluentia-lms src/pages/student/verbs/VerbAtlas.jsx
 * (origin/main 3396e97e). Same header, legends, search, family panels and
 * rows. `useVerbAtlas` becomes props; a row opens a one-verb drill in the
 * tour instead of `/student/irregular-verbs?verb=`.
 *
 * The tour carries one family's verbs — i-a-u, where all three forms are
 * different words — and opens it first. The other nineteen are listed with
 * their real names, counts and rules, and say their verbs are inside the
 * platform. Dots come from THIS visit: a verb answered in the demo is «قيد
 * التعلّم», and one written blind and correct is «راسخ» — the platform's own
 * rule (total_attempts > 0, blind_correct_days ≥ 1). Mastery takes three days
 * spanning ten, so no visitor ever sees «مُتقَن» here, honestly.
 */

const toAr = (n) => (n == null ? '' : String(n))
const verbsAr = (n) => (n === 1 ? 'فعل واحد' : n === 2 ? 'فعلان'
  : n <= 10 ? `${toAr(n)} أفعال` : `${toAr(n)} فعلاً`)

const PATTERN_AR = {
  aaa: 'الثلاثة متطابقة',
  aba: 'الأول والثالث متطابقان',
  abb: 'الثاني والثالث متطابقان',
  abc: 'الثلاثة مختلفة',
}
const MASTERY_AR = { mastered: 'مُتقَن', solid: 'راسخ', learning: 'قيد التعلّم', new: 'لم يبدأ' }
const SHOWN_FAMILY = 'i-a-u'

/* TOUR FIX — family names like «عائلة i ← a ← u» are Arabic prose with Latin
   letters and arrows. Unisolated, «i ← a ← u» is one left-to-right run, so the
   arrows end up pointing from u back to i: the rule printed backwards. Each
   Latin token is isolated on its own, which keeps the arrows reading in the
   Arabic direction the name was written in. */
const isolateLatin = (text) => String(text || '').split(/([A-Za-z]+)/).map((part, n) => (
  n % 2 ? <bdi key={n} className="vl-en">{part}</bdi> : part
))

export default function VerbAtlas({ verbs, families, cards = {}, total }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [openFam, setOpenFam] = useState(SHOWN_FAMILY)
  const [raw, setRaw] = useState('')
  const query = useDeferredValue(raw)
  const famByKey = useMemo(() => Object.fromEntries(families.map((f) => [f.key, f])), [families])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (v) => !q || [v.base_form, v.past_simple, v.past_participle]
      .some((f) => f.toLowerCase().includes(q)) || (v.meaning_ar || '').includes(query.trim())

    const shown = verbs.filter((v) => v.rhyme_family === SHOWN_FAMILY && match(v))
    const out = []
    if (shown.length) {
      const f = famByKey[SHOWN_FAMILY]
      out.push({
        key: SHOWN_FAMILY, name: f?.name_ar || SHOWN_FAMILY, rule: f?.rule_ar || '',
        pattern: shown[0]?.pattern_group, count: f?.n || shown.length, verbs: shown,
        // What the student HOLDS, not only what is fully mastered — mastery
        // takes ten days by design, so a mastered-only meter reads as zero for
        // a fortnight of real work.
        held: shown.filter((v) => ['solid', 'mastered'].includes(cards[v.id]?.mastery)).length,
      })
    }
    // A search reaches only the verbs this tour carries.
    if (!q) {
      families
        .filter((f) => f.key !== SHOWN_FAMILY && f.n > 0)
        // Biggest families first: they carry the most verbs per rule learned,
        // which is the whole argument for grouping by family at all.
        .sort((a, b) => (a.key === 'unique' ? 1 : b.key === 'unique' ? -1 : b.n - a.n))
        .forEach((f) => out.push({
          key: f.key, name: f.name_ar, rule: f.rule_ar, pattern: f.pattern,
          count: f.n, verbs: null, held: 0,
        }))
    }
    return out
  }, [verbs, families, famByKey, cards, query])

  const shownCount = groups.reduce((n, g) => n + (g.verbs?.length || 0), 0)
  const rise = (d) => (reduce ? { initial: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.36 } })

  return (
    <VocabShell room={<VerbRoom />} className="vl-pure" labelledBy="vl-atlas-title">
      <div className="vl-col">

        <motion.header {...rise(0)} className="mb-5">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <span className="text-xs" style={{ color: 'var(--vc-text-dim)' }}>قائمة الأفعال الشاذة</span>
            <Link to="/tour/verbs" style={{ textDecoration: 'none', color: 'var(--vc-text-soft)',
              fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: '.3rem', minHeight: 44 }}>
              <ArrowRight size={13} /> سُلّم الأفعال
            </Link>
          </div>

          <h1 id="vl-atlas-title" className="text-[28px] sm:text-[34px] font-bold leading-tight" style={{ color: 'var(--vc-text)' }}>أطلس الأفعال</h1>
          <p className="mt-1.5 text-sm max-w-[44ch]" style={{ color: 'var(--vc-text-soft)' }}>
            الأفعال الشاذّة ليست قائمة استثناءات تُحفظ فرداً فرداً — إنها عشرون عائلة.
            كلّ عائلة هنا تبدأ بقاعدتها، ثم أفرادها. واللمس على أيّ فعل يفتح تدريباً عليه وحده.
          </p>
          <div className="vl-atlas-key mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--vc-text-dim)' }}>
            <span className="k1"><i className="vl-en">go</i>الأصل</span>
            <span className="k2"><i className="vl-en">went</i>الماضي</span>
            <span className="k3"><i className="vl-en">gone</i>بعد <span className="vl-en">have</span></span>
          </div>
          {/* The dots down the rows carry four states and had no key anywhere. */}
          <div className="vl-atlas-key mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--vc-text-dim)', borderTop: 0, paddingTop: 0 }}>
            <span><i className="vl-dot vl-dot--mastered" style={{ marginInlineEnd: '.15rem' }} />مُتقَن</span>
            <span><i className="vl-dot vl-dot--solid" style={{ marginInlineEnd: '.15rem' }} />راسخ</span>
            <span><i className="vl-dot vl-dot--learning" style={{ marginInlineEnd: '.15rem' }} />قيد التعلّم</span>
            <span><i className="vl-dot" style={{ marginInlineEnd: '.15rem' }} />لم يبدأ</span>
          </div>
        </motion.header>

        <motion.div {...rise(0.04)} className="vl-p vl-c-cyan sticky top-0 z-10 flex items-center gap-2 px-3 py-2 mb-4">
          <Search size={16} style={{ color: 'var(--vc-text-dim)', flex: 'none' }} />
          <input
            value={raw} onChange={(e) => setRaw(e.target.value)}
            placeholder="ابحث بالإنجليزية أو بالعربية…"
            aria-label="ابحث في الأفعال"
          />
          {raw && <span className="text-xs" style={{ color: 'var(--vc-text-dim)', whiteSpace: 'nowrap' }}>{shownCount ? verbsAr(shownCount) : '—'}</span>}
        </motion.div>

        <div>
          {groups.map((grp, gi) => {
            const open = openFam === grp.key || !!query.trim()
            return (
              <motion.div key={grp.key} {...rise(0.05 + Math.min(gi, 8) * 0.02)} className="vl-p vl-p--quiet vl-c-green p-1.5 mb-2">
                <button className="vl-fam__h" onClick={() => setOpenFam(open && !query.trim() ? null : grp.key)} aria-expanded={open}>
                  <ChevronDown
                    size={16}
                    style={{ color: 'var(--vc-text-dim)', flex: 'none',
                             transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }}
                  />
                  <span className="flex-1" style={{ fontWeight: 600, fontSize: '.98rem' }}>
                    {isolateLatin(grp.name)}
                    <span className="text-xs" style={{ color: 'var(--vc-text-dim)', marginInlineStart: '.5rem' }}>
                      {PATTERN_AR[grp.pattern] || ''}
                    </span>
                  </span>
                  <span className="vl-fam__n">{grp.held ? toAr(grp.held) : '—'}/{toAr(grp.count)}</span>
                </button>
                {open && (
                  <>
                    {grp.rule && <p className="vl-fam__rule">{grp.rule}</p>}
                    {grp.verbs ? grp.verbs.map((v) => {
                      const m = cards[v.id]?.mastery || 'new'
                      return (
                        // A reference you cannot act on is inert: tapping a
                        // row drills that one verb.
                        <button
                          className="vl-row" key={v.id}
                          onClick={() => navigate(`/tour/verbs/session?verb=${encodeURIComponent(v.base_form)}`)}
                          aria-label={`تدرّب على ${v.base_form}`}
                        >
                          {/* The state marker LEADS the row so the dots form a
                              scannable rail; the shape is a property of the
                              FAMILY and is printed once in its header, not
                              repeated on all nineteen rows of the no-change one. */}
                          <span className={`vl-dot vl-dot--${m}`} aria-label={MASTERY_AR[m]} title={MASTERY_AR[m]} />
                          <div className="vl-row__main">
                            <div className="vl-row__forms">
                              {/* no separators: they are grid children, so five
                                  items flowed into three columns and every row
                                  wrapped. The columns ARE the separator. */}
                              <span className="f1">{v.base_form}</span>
                              <span className="f2">{v.past_simple}</span>
                              <span className="f3">{v.past_participle}</span>
                            </div>
                            <div className="vl-row__ar">
                              {v.meaning_ar}
                              {v.meaning_hint_ar ? ` — ${v.meaning_hint_ar}` : ''}
                            </div>
                          </div>
                        </button>
                      )
                    }) : (
                      <p className="vl-fam__locked">
                        <Lock size={13} aria-hidden style={{ flex: 'none' }} />
                        {verbsAr(grp.count)} في هذه العائلة — داخل المنصة.
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            )
          })}
          {query.trim() && !shownCount && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--vc-text-dim)' }}>
              لا نتائج لهذا البحث في عائلة <span className="vl-en">i-a-u</span>.
              <br />البحث في الأفعال الـ{toAr(total)} كاملة متاح داخل المنصة.
            </p>
          )}
          {query.trim() && shownCount > 0 && (
            <p className="text-xs text-center pt-3" style={{ color: 'var(--vc-text-dim)' }}>
              البحث هنا داخل عائلة <span className="vl-en">i-a-u</span>، وفي المنصة يشمل الأفعال الـ{toAr(total)} كلّها.
            </p>
          )}
        </div>
      </div>
    </VocabShell>
  )
}
