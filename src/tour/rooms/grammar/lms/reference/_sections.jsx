/**
 * Section renderers for «المرجع النحوي».
 *
 * NOT GrammarSections: that component's switch renders exactly five types
 * (explanation / formula / table / examples / heading) and silently returns null for
 * anything else — which would drop `contrast`, `arabic_note` and `careful`, the three
 * sections that make this a reference rather than a restatement of the lesson.
 * So the switch is new; the PRIMITIVES are reused — RichText and isolateLatin carry
 * all the bidi correctness, which is the part that is genuinely hard.
 */
// TOUR PORT: vendored from fluentia-lms src/pages/student/grammar-reference/_sections.jsx
// (origin/main 3396e97e). Removed: the trainer layer — `Teach`, `TeachRow`, `TeachSteps`,
// `boardSteps`, the `teach` keys in MAP / NAV_LABEL / AFTER_DRILLS and the auth-store import
// they needed. The snapshot JSON carries no `teach` section either (build-snapshots.mjs).
// Everything else is byte-for-byte the platform's.
import { renderAr, Ar } from './_ar'
import Diagram from './_diagrams'
import { AlertTriangle, Languages, GitCompareArrows, MessageSquareQuote, Volume2, Table2, Sparkles, Compass, Waypoints } from 'lucide-react'
import { speak, canSpeak } from './_speak'
import { arNum } from '../lib/numerals'

/* English text inside an Arabic page must be isolated, not merely marked dir="ltr" lang="en":
 * a `dir` attribute alone loses to the inherited RTL in older webviews, and the
 * neutral trailing "." resolves against the paragraph, not the run. */
const En = ({ children, className = '', style }) => (
  <span className={`gref-en font-en ${className}`} dir="ltr" lang="en" style={style}>{children}</span>
)

/* `**bold**` in an authored example marks the target structure. */
function Marked({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g)
  return <>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
    ? <b key={i} style={{ color: 'var(--gref-accent-text)', fontWeight: 600 }}>{p.slice(2, -2)}</b>
    : <span key={i}>{p}</span>)}</>
}


export function Head({ icon: Icon, children, tone }) {
  // A label and a rule. The hairline runs to the column edge and fades away from the label
  // (`to left` in RTL); the accent lives in the line, never in a glow.
  return (
    <div className="gref-head-row">
      {Icon ? <Icon size={15} className="shrink-0" style={{ color: tone || 'var(--gref-head)' }} /> : null}
      <h2 className="font-['Tajawal'] shrink-0" style={{ color: tone || 'var(--gref-head)' }}>{children}</h2>
      <span className="gref-rule-line" />
    </div>
  )
}

function Rule({ s }) {
  return (
    <div>
      <Head icon={Sparkles}>القاعدة</Head>
      <div className="gref-rule gref-prose">
      {s.en ? <p className="font-en text-[15px] leading-[1.7] mb-2" dir="ltr" lang="en" style={{ color: 'var(--gref-ink)' }}>{s.en}</p> : null}
      {s.ar ? <Ar text={s.ar} className="text-[14px]" style={{ color: 'var(--gref-body)' }} /> : null}
      </div>
    </div>
  )
}

function Form({ s }) {
  const headers = s.headers_en || s.headers || []
  const isAr = (v) => /[؀-ۿ]/.test(String(v || ''))
  // Column ORDER is inherited from the page (RTL) while each cell sets its own dir.
  // Pin the table's direction so order does not depend on how an author happened to
  // sequence the array — across 309 entries that would drift.
  const allLatin = headers.length > 0 && headers.every((h) => !isAr(h))
  return (
    <div>
      <Head icon={Table2}>الشكل</Head>
      {/* the scroll box must share the table's direction, or scrollLeft:0 opens on the LAST
          column — 210px of the first column off-screen on a phone */}
      <div className="gref-tablewrap" dir={allLatin ? 'ltr' : 'rtl'}>
      <table className="gref-table" dir={allLatin ? 'ltr' : 'rtl'}>
        {headers.length ? (
          <thead><tr>{headers.map((h, i) => (
            <th key={i} className={isAr(h) ? "font-['Tajawal']" : 'font-en'} dir={isAr(h) ? 'rtl' : 'ltr'} lang={isAr(h) ? 'ar' : 'en'}>{h}</th>
          ))}</tr></thead>
        ) : null}
        <tbody>
          {(s.rows || []).map((r, i) => (
            <tr key={i}>{r.map((c, j) => (
              <td key={j} className={isAr(c) ? "font-['Tajawal']" : 'font-en'} dir={isAr(c) ? 'rtl' : 'ltr'} lang={isAr(c) ? 'ar' : 'en'}
                  style={{ color: j === 0 ? 'var(--gref-ink)' : 'var(--gref-body)' }}>
                {isAr(c) ? renderAr(String(c), `c${i}${j}`) : <Marked text={c} />}
              </td>
            ))}</tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function Examples({ s }) {
  return (
    <div>
      <Head icon={MessageSquareQuote}>أمثلة</Head>
      {/* A ledger, not ten cards. Each example used to be its own bordered box — ten of the
          twenty-seven rectangles on the page and 22% of its height. One object with rows
          carries the same information and lets the eye run down the numbers. */}
      <ol className="gref-ledger list-none p-0 m-0">
        {(s.items || []).map((it, i) => (
          <li key={i}>
            <span className="gl-n font-num" aria-hidden="true">
              {arNum(i + 1)}
            </span>
            <div className="gl-body">
              <p className="font-en text-[14.5px] leading-[1.6]" dir="ltr" lang="en" style={{ color: 'var(--gref-ink)' }}>
                <Marked text={it.en} />
              </p>
              {it.ar ? <Ar text={it.ar} className="text-[12.5px] mt-0.5" k={`ex${i}`} style={{ color: 'var(--gref-body)' }} /> : null}
              {it.note_ar ? (
                <p className="font-['Tajawal'] text-[12px] mt-1" dir="rtl" style={{ color: 'var(--gref-muted)' }}>
                  {renderAr(it.note_ar, `n${i}`)}
                </p>
              ) : null}
            </div>
            {canSpeak() ? (
              <button type="button" onClick={() => speak(it.en)} aria-label="استمع إلى الجملة"
                      className="gl-say shrink-0 grid place-items-center rounded-full"
                      style={{ width: 44, height: 44, color: 'var(--gref-muted)' }}>
                <Volume2 size={15} />
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* The highest-value section on the page: the confusable neighbour, side by side. */
function Contrast({ s }) {
  const Side = ({ d, primary }) => (
    <div className="gref-panel p-5 flex-1 min-w-0"
         style={primary ? { borderInlineStartColor: 'var(--gref-accent)', borderInlineStartWidth: 2 } : undefined}>
      {d.label ? <En className="text-[12px] font-semibold" style={{ color: 'var(--gref-accent-text)' }}>{d.label}</En> : null}
      {d.en ? <p className="font-en text-[14px] mt-1.5 leading-[1.6]" dir="ltr" lang="en" style={{ color: 'var(--gref-ink)' }}><Marked text={d.en} /></p> : null}
      {d.ar ? <p className="font-['Tajawal'] text-[12.5px] mt-1.5" dir="rtl" style={{ color: 'var(--gref-body)' }}>{renderAr(d.ar, 'cs')}</p> : null}
    </div>
  )
  return (
    <div>
      <Head icon={GitCompareArrows}>الفرق</Head>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Side d={s.a || {}} primary /><Side d={s.b || {}} />
      </div>
      {s.verdict_ar ? (
        <div className="gref-careful gref-prose mt-2.5">
          <Ar text={s.verdict_ar} className="text-[13px]" style={{ color: 'var(--gref-ink)' }} />
        </div>
      ) : null}
    </div>
  )
}

/* The differentiator. No Cambridge volume has this layer. */
function ArabicNote({ s }) {
  return (
    <div className="gref-note gref-prose">
      <Head icon={Languages}>لماذا يخطئ الناطق بالعربية هنا</Head>
      <Ar text={s.ar} className="text-[13.5px]" style={{ color: 'var(--gref-body)' }} />
    </div>
  )
}

function Careful({ s }) {
  const items = s.items_ar || s.items || []
  return (
    <div>
      <Head icon={AlertTriangle}>انتبه للاستثناءات</Head>
      <ul className="space-y-2 list-none p-0 m-0">
        {items.map((t, i) => (
          <li key={i} className="gref-careful gref-prose">
            <p className="font-['Tajawal'] text-[13px]" dir="rtl" style={{ color: 'var(--gref-body)', lineHeight: 1.8 }}>
              {renderAr(String(t), `k${i}`)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Usage({ s, label }) {
  // Was headless. The «الاستعمال» chip therefore scrolled the reader to a bare paragraph
  // with nothing naming it — the destination existed but announced nothing on arrival.
  return (
    <div>
      <Head icon={Compass}>{label || 'الاستعمال'}</Head>
      <div className="gref-careful gref-prose">
        <Ar text={s.ar} className="text-[12.5px]" style={{ color: 'var(--gref-muted)' }} />
      </div>
    </div>
  )
}


const MAP = { rule: Rule, form: Form, examples: Examples, contrast: Contrast, arabic_note: ArabicNote, careful: Careful, usage: Usage }

const NAV_LABEL = {
  rule: 'القاعدة', form: 'الشكل', diagram: 'الرسم', examples: 'أمثلة',
  contrast: 'الفرق', arabic_note: 'لماذا نخطئ', careful: 'الاستثناءات', usage: 'الاستعمال',
}
export const sectionId = (t, i) => `gref-${t}-${i}`

/**
 * ONE source of truth for every jump destination: its anchor AND its visible heading.
 *
 * These used to be computed in two places, and they drifted — `sectionNav` numbered a
 * repeated diagram «الرسم ١ / الرسم ٢» while the sections themselves rendered no heading
 * at all, so three chips on a typical entry (both diagrams and «الاستعمال») scrolled the
 * reader to an unlabelled band of the page. Deriving both from this array makes that
 * class of drift impossible: a chip can only exist where a heading does.
 */
export function navRows(sections = []) {
  const rows = sections
    .map((s, i) => ({ type: s.type, i }))
    .filter(({ type }) => MAP[type] || type === 'diagram')
    .map(({ type, i }) => ({ id: sectionId(type, i), type, i, label: NAV_LABEL[type] || type }))
  // An entry with two diagrams produced two chips both reading «الرسم», which tells the
  // reader nothing about where either one goes. Number repeats with Arabic-Indic digits,
  // and only when there IS a repeat — a lone diagram stays «الرسم».
  const counts = rows.reduce((m, r) => (m[r.label] = (m[r.label] || 0) + 1, m), {})
  const seen = {}
  const ar = arNum
  return rows.map((r) => {
    if (counts[r.label] < 2) return r
    seen[r.label] = (seen[r.label] || 0) + 1
    return { ...r, label: `${r.label} ${ar(seen[r.label])}` }
  })
}

/** The jumper's destinations. Only types that render, in document order. */
export function sectionNav(sections = []) {
  return navRows(sections).map(({ id, label }) => ({ id, label }))
}

/** Rendered after the drills, not inside the reading spine. */
export const AFTER_DRILLS = new Set(['careful'])

export default function Sections({ sections = [], overrides = {}, only = 'spine' }) {
  // Carry the ORIGINAL index through the split. sectionNav() builds its anchors from the
  // full array, so indexing the filtered array produced `gref-careful-0` against a chip
  // pointing at `gref-careful-7` — and SectionJumper drops any chip whose target is absent,
  // silently removing «الاستثناءات» and «للمدرّب» from the rail on all 309 entries.
  // The heading each section shows is the SAME string its jumper chip shows — both read
  // from navRows(). Keyed by original index so the spine/after split cannot shift it.
  const labels = Object.fromEntries(navRows(sections).map((r) => [r.i, r.label]))
  const picked = sections
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (only === 'after' ? AFTER_DRILLS.has(s.type) : !AFTER_DRILLS.has(s.type)))
  return (
    <div className="space-y-12">
      {picked.map(({ s, i }) => {
        const anchor = sectionId(s.type, i)
        // scrollMarginTop so a jump never lands under the sticky header + rail
        const style = { scrollMarginTop: 'calc(var(--impersonation-banner-height, 0px) + var(--header-height, 64px) + 68px)' }
        if (s.type === 'diagram') {
          // The figure is the centrepiece of the page and was the only section that
          // arrived unannounced — a drawing floating between two hairlines.
          return (
            <div key={i} id={anchor} style={style}>
              <Head icon={Waypoints}>{labels[i] || 'الرسم'}</Head>
              <Diagram section={s} override={overrides[s.id]} />
            </div>
          )
        }
        const Cmp = MAP[s.type]
        // Unknown type: render nothing rather than crash. A reference page that
        // white-screens on one bad section is worse than one missing a section.
        if (!Cmp) return null
        return <div key={i} id={anchor} style={style}><Cmp s={s} label={labels[i]} /></div>
      })}
    </div>
  )
}
