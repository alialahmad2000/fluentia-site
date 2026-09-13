// TOUR PORT: vendored from fluentia-lms src/pages/student/grammar-reference/_diagrams.jsx
// (origin/main 3396e97e). The renderers are untouched; one fix in Figure(), marked there.
import { useEffect, useRef, useState } from 'react'
/**
 * Coded SVG diagrams for «المرجع النحوي».
 *
 * WHY NOT GENERATED IMAGES: every one of the 1,497 AI-generated vocabulary images on
 * this platform came back as a smear with misspelled lettering, and the whole set is
 * gated off. Grammar diagrams are TEXT-BEARING — a timeline labelled "have been
 * waiting", a block labelled "Subject" — which is exactly what diffusion models cannot
 * render. So they are drawn, not generated: crisp at any zoom, correct in both themes,
 * translatable, and free.
 *
 * PHASE 2: if `override` is a URL (from grammar_reference.diagram_overrides[id]) the
 * illustration replaces the drawing. Adding commissioned art is therefore a data write
 * — no content rewrite, no code change. The SVG stays as the permanent fallback.
 *
 * The time axis is deliberately dir="ltr" lang="en": an English tense timeline reads past→future
 * left to right regardless of the page's RTL direction. Arabic labels sit under it.
 */

const GOLD = 'var(--gref-accent)'
const EDGE = 'var(--gref-line-2)'
const INK = 'var(--gref-ink)'
const MUTED = 'var(--gref-muted)'
const BODY = 'var(--gref-body)'

function Figure({ caption, override, alt, children }) {
  // TOUR PORT FIX (mobile figures open on the wrong edge). Under 720px the figure became
  // an overflow-x scroll box with a 640px drawing inside, and it inherited dir="rtl" from
  // .gref — so it opened scrolled to its RIGHT edge: on a 390px phone the contrast bars
  // lost both row labels and the signal board showed only its third column. The drawing is
  // an LTR timeline, so its scroll box now shares that direction (the same fix the «الشكل»
  // table already carries), and the caption stays outside it in the page's RTL flow.
  // `data-edge` lets the phone CSS fade whichever side still has drawing beyond it, so a
  // cut-off bar reads as "scroll for more" rather than as the end of the figure.
  const scroller = useRef(null)
  const [edge, setEdge] = useState('none')
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setEdge(max <= 1 ? 'none' : el.scrollLeft <= 1 ? 'start' : el.scrollLeft >= max - 1 ? 'end' : 'middle')
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el)
    return () => { el.removeEventListener('scroll', update); ro?.disconnect() }
  }, [])
  return (
    <figure className="gref-fig">
      {override
        ? <img src={override} alt={alt || caption || ''} loading="lazy" style={{ width: '100%', height: 'auto', borderRadius: 12 }} />
        : <div ref={scroller} className="gref-fig-scroll" dir="ltr" data-edge={edge}>{children}</div>}
      {caption ? <figcaption className="font-['Tajawal']">{caption}</figcaption> : null}
    </figure>
  )
}

/* ── timeline ──────────────────────────────────────────────────────────────
 * spec: { now_label_ar, spans:[{from,to,label_en,label_ar,tone}], points:[{at,label_en,label_ar,tone}] }
 * from/to/at are 0..1 across the axis. */
function Timeline({ spec }) {
  const W = 640, H = 132, PAD = 26, AXIS = 74
  const x = (t) => PAD + Math.max(0, Math.min(1, t)) * (W - PAD * 2)
  const nowX = x(spec.now ?? 0.72)
  const spans = spec.spans || []
  const points = spec.points || []
  return (
    <svg viewBox={`0 0 ${W} ${H}`} dir="ltr" lang="en" role="img"
         aria-label={spec.now_label_ar ? `مخطط زمني · ${spec.now_label_ar}` : 'مخطط زمني'}>
      {/* axis */}
      <line x1={PAD} y1={AXIS} x2={W - PAD} y2={AXIS} stroke={EDGE} strokeWidth="1.5" />
      <polygon points={`${W - PAD},${AXIS} ${W - PAD - 8},${AXIS - 4} ${W - PAD - 8},${AXIS + 4}`} fill={EDGE} />
      {/* now marker */}
      <line x1={nowX} y1={AXIS - 30} x2={nowX} y2={AXIS + 16} stroke={GOLD} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={nowX} cy={AXIS} r="4.5" fill={GOLD} />
      <text x={nowX} y={AXIS + 32} fill={GOLD} fontSize="12" textAnchor="middle" className="fig-ar">
        {spec.now_label_ar || 'الآن'}
      </text>
      {spans.map((s, i) => {
        const x1 = x(s.from), x2 = x(s.to), y = AXIS - 26 - i * 26
        const c = s.tone === 'muted' ? MUTED : GOLD
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth="7" strokeLinecap="round" opacity=".9" />
            <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} stroke={c} strokeWidth="1.5" />
            <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} stroke={c} strokeWidth="1.5" />
            {s.label_en ? (
              <text x={(x1 + x2) / 2} y={y - 12} fill={INK} fontSize="12.5" textAnchor="middle"
                    className="fig-en" lang="en">{s.label_en}</text>
            ) : null}
            {s.label_ar ? (
              <text x={(x1 + x2) / 2} y={y + 21} fill={BODY} fontSize="12" textAnchor="middle"
                    className="fig-ar" direction="rtl">{s.label_ar}</text>
            ) : null}
          </g>
        )
      })}
      {points.map((p, i) => {
        const px = x(p.at), c = p.tone === 'muted' ? MUTED : GOLD
        return (
          <g key={`p${i}`}>
            <circle cx={px} cy={AXIS} r="5.5" fill="none" stroke={c} strokeWidth="2" />
            {p.label_en ? <text x={px} y={AXIS - 14} fill={INK} fontSize="12" textAnchor="middle" className="fig-en" lang="en">{p.label_en}</text> : null}
            {p.label_ar ? <text x={px} y={AXIS + 32} fill={BODY} fontSize="12" textAnchor="middle" className="fig-ar" direction="rtl">{p.label_ar}</text> : null}
          </g>
        )
      })}
    </svg>
  )
}

/* ── blocks: a sentence built from labelled parts ──────────────────────────
 * Accepts EITHER shape:
 *   { parts:[{text,label_ar,tone}] }                                — one sentence
 *   { rows:[{label_ar, ok:true|false, blocks:[{text,role}]}] }      — stacked variants
 * The second is for rules whose whole point is that the SAME words are legal in more
 * than one order (separable phrasal verbs, adverb position) — one row per variant, with
 * ok:false drawing the illegal one struck through, because seeing the wrong order beside
 * the right one is what teaches the rule. */
const ROLE_TONE = { verb: true, particle: true, target: true }

/* 698 of 2,490 authored blocks are plain strings rather than {text}, so `b.text` was
 * undefined and 61 entries rendered a figure of empty rounded rectangles. Accept both
 * shapes: the authored data is the reference, and a renderer that only accepts one of two
 * reasonable spellings is the thing that is wrong. */
const asBlock = (b) => (typeof b === 'string' ? { text: b } : (b || {}))

function BlockRow({ blocks: rawBlocks, y, W, ok, label_ar }) {
  const blocks = (rawBlocks || []).map(asBlock)
  const GAPX = 7, PADX = 12, RIGHT = 176
  const avail = W - PADX - RIGHT
  const wOf = (b) => Math.min(12, Math.max(5, (b.text || '').length))
  const total = blocks.reduce((n, b) => n + wOf(b), 0) || 1
  let cx = PADX
  return (
    <g opacity={ok === false ? 0.72 : 1}>
      {blocks.map((b, i) => {
        const w = (wOf(b) / total) * (avail - GAPX * (blocks.length - 1))
        const accent = b.tone === 'accent' || ROLE_TONE[b.role]
        const gx = cx; cx += w + GAPX
        return (
          <g key={i}>
            <rect x={gx} y={y} width={w} height={30} rx="8"
                  fill={accent ? 'var(--gref-panel)' : 'var(--gref-panel)'}
                  stroke={ok === false ? 'var(--gref-bad)' : accent ? GOLD : EDGE} strokeWidth="1" />
            <text x={gx + w / 2} y={y + 20} fill={accent ? GOLD : INK} fontSize="12.5" textAnchor="middle"
                  className="fig-en" lang="en" fontWeight={accent ? 600 : 400}>{b.text}</text>
            {b.label_ar ? (
              <text x={gx + w / 2} y={y + 44} fill={MUTED} fontSize="12" textAnchor="middle"
                    className="fig-ar" direction="rtl">{b.label_ar}</text>
            ) : null}
          </g>
        )
      })}
      {ok === false ? <line x1={PADX} y1={y + 15} x2={cx - GAPX} y2={y + 15} stroke="var(--gref-bad)" strokeWidth="1.5" /> : null}
      {label_ar ? (
        <text x={W - 12} y={y + 20} fill={ok === false ? 'var(--gref-bad)' : MUTED} fontSize="12" textAnchor="end"
              className="fig-ar" direction="rtl">{label_ar}</text>
      ) : null}
    </g>
  )
}

function Blocks({ spec }) {
  const W = 640
  const rows = (spec.rows || (spec.parts ? [{ blocks: spec.parts }] : [])).map((r) => (Array.isArray(r) ? { blocks: r } : r))
  const labelled = rows.some(r => (r.blocks || []).some(b => b.label_ar))
  const RH = labelled ? 58 : 42
  return (
    <svg viewBox={`0 0 ${W} ${rows.length * RH + 16}`} dir="ltr" lang="en" role="img" aria-label="تركيب الجملة">
      {rows.map((r, i) => (
        <BlockRow key={i} blocks={r.blocks || []} y={10 + i * RH} W={W} ok={r.ok} label_ar={r.label_ar} />
      ))}
    </svg>
  )
}

/* ── contrast-bar: the two confusable structures, side by side ─────────────
 * Accepts EITHER shape:
 *   { rows:[{label_en,label_ar,note_ar,tone}] }                     — flat bars
 *   { now_label_ar, a:{label_en,label_ar,spans[],points[]}, b:{…} } — two mini-timelines
 * The second is richer (it shows WHERE on the timeline the two differ, which is the
 * whole point of a contrast) so it is the preferred authoring shape; the flat one is
 * kept because a non-temporal contrast has no timeline to draw. */
function MiniTrack({ side, y, W, nowX }) {
  const x = (t) => 118 + Math.max(0, Math.min(1, t)) * (W - 150)
  const spans = side.spans || [], points = side.points || []
  return (
    <g>
      <text x={12} y={y + 4} fill={GOLD} fontSize="12" fontWeight="600"
            className="fig-en" lang="en">{side.label_en}</text>
      {side.label_ar ? (
        <text x={12} y={y + 19} fill={MUTED} fontSize="12" className="fig-ar">{side.label_ar}</text>
      ) : null}
      <line x1={118} y1={y} x2={W - 32} y2={y} stroke={EDGE} strokeWidth="1.2" />
      {spans.map((sp, i) => (
        <g key={i}>
          <line x1={x(sp.from)} y1={y} x2={x(sp.to)} y2={y}
                stroke={sp.tone === 'muted' ? MUTED : GOLD} strokeWidth="7" strokeLinecap="round" opacity=".9" />
          {sp.label_ar ? (
            <text x={(x(sp.from) + x(sp.to)) / 2} y={y - 11} fill={BODY} fontSize="12" textAnchor="middle"
                  className="fig-ar" direction="rtl">{sp.label_ar}</text>
          ) : null}
        </g>
      ))}
      {points.map((pt, i) => (
        <g key={`p${i}`}>
          <circle cx={x(pt.at)} cy={y} r="5" fill="none" stroke={GOLD} strokeWidth="2" />
          {pt.label_ar ? (
            <text x={x(pt.at)} y={y - 11} fill={BODY} fontSize="12" textAnchor="middle"
                  className="fig-ar" direction="rtl">{pt.label_ar}</text>
          ) : null}
        </g>
      ))}
      <line x1={nowX} y1={y - 9} x2={nowX} y2={y + 9} stroke={GOLD} strokeWidth="1.2" strokeDasharray="3 3" opacity=".75" />
    </g>
  )
}

function ContrastBar({ spec }) {
  const W = 640
  if (spec.a || spec.b) {
    const nowX = 118 + (spec.now ?? 0.82) * (W - 150)
    const H = 112
    return (
      <svg viewBox={`0 0 ${W} ${H}`} dir="ltr" lang="en" role="img" aria-label="مقارنة بين تركيبين على خط الزمن">
        {spec.a ? <MiniTrack side={spec.a} y={34} W={W} nowX={nowX} /> : null}
        {spec.b ? <MiniTrack side={spec.b} y={84} W={W} nowX={nowX} /> : null}
        <text x={nowX} y={16} fill={GOLD} fontSize="12" textAnchor="middle" className="fig-ar">
          {spec.now_label_ar || 'الآن'}
        </text>
      </svg>
    )
  }
  const rows = spec.rows || []
  const RH = 52
  return (
    <svg viewBox={`0 0 ${W} ${rows.length * RH + 12}`} dir="ltr" lang="en" role="img" aria-label="مقارنة بين تركيبين">
      {rows.map((r, i) => {
        const y = 6 + i * RH, accent = r.tone !== 'muted'
        return (
          <g key={i}>
            <rect x={12} y={y} width={W - 24} height={RH - 10} rx="10"
                  fill={accent ? 'var(--gref-panel)' : 'var(--gref-panel)'} stroke={accent ? GOLD : EDGE} />
            <text x={26} y={y + 20} fill={accent ? GOLD : INK} fontSize="13" fontWeight="600"
                  className="fig-en" lang="en">{r.label_en}</text>
            <text x={26} y={y + 35} fill={BODY} fontSize="12" className="fig-ar">{r.label_ar || ''}</text>
            {r.note_ar ? (
              <text x={W - 26} y={y + 27} fill={MUTED} fontSize="12" textAnchor="end"
                    className="fig-ar" direction="rtl">{r.note_ar}</text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

/* ── tree: a simple two-level branch (for clause structure) ────────────────
 * spec: { root:{text}, children:[{text,label_ar}] } */
function Tree({ spec }) {
  const kids = spec.children || []
  const W = 640, rootY = 26, kidY = 84
  const step = kids.length ? (W - 80) / kids.length : W
  return (
    <svg viewBox={`0 0 ${W} 120`} dir="ltr" lang="en" role="img" aria-label="تفريع الجملة">
      <rect x={W / 2 - 80} y={rootY - 16} width={160} height={30} rx="8" fill="var(--gref-panel)" stroke={GOLD} />
      <text x={W / 2} y={rootY + 4} fill={GOLD} fontSize="13" textAnchor="middle" fontWeight="600"
            className="fig-en" lang="en">{spec.root?.text}</text>
      {kids.map((k, i) => {
        const kx = 40 + step * i + step / 2
        return (
          <g key={i}>
            <path d={`M ${W / 2} ${rootY + 14} L ${kx} ${kidY - 16}`} stroke={EDGE} strokeWidth="1.2" fill="none" />
            <rect x={kx - step / 2 + 8} y={kidY - 16} width={step - 16} height={28} rx="8" fill="var(--gref-panel)" stroke={EDGE} />
            <text x={kx} y={kidY + 2} fill={INK} fontSize="12.5" textAnchor="middle"
                  className="fig-en" lang="en">{k.text}</text>
            {k.label_ar ? <text x={kx} y={kidY + 26} fill={MUTED} fontSize="12" textAnchor="middle" className="fig-ar" direction="rtl">{k.label_ar}</text> : null}
          </g>
        )
      })}
    </svg>
  )
}

/* ── table-figure: parallel columns of examples ────────────────────────────
 * spec: { columns:[{head_en,head_ar,tone,items:[…]}] }
 * For rules that are really a CHOICE BETWEEN SETS — in/on/at for time, much/many, the
 * three articles. A prose table buries the pattern; three columns side by side make the
 * narrowing obvious at a glance, which is the actual rule. */
function TableFigure({ spec }) {
  const cols = spec.columns || []
  if (!cols.length) return null
  const W = 640, CW = (W - 24) / cols.length
  const maxItems = Math.max(...cols.map(c => (c.items || []).length), 0)
  const H = 80 + maxItems * 24
  return (
    <svg viewBox={`0 0 ${W} ${H}`} dir="ltr" lang="en" role="img" aria-label="مقارنة بين مجموعات">
      {cols.map((c, i) => {
        const x = 12 + i * CW, accent = c.tone === 'accent'
        return (
          <g key={i}>
            <rect x={x + 3} y={8} width={CW - 6} height={H - 20} rx="10"
                  fill={accent ? 'var(--gref-panel)' : 'var(--gref-panel)'} stroke={accent ? GOLD : EDGE} />
            <text x={x + CW / 2} y={30} fill={GOLD} fontSize="14" textAnchor="middle" fontWeight="700"
                  className="fig-en" lang="en">{c.head_en}</text>
            {c.head_ar ? (
              <text x={x + CW / 2} y={45} fill={MUTED} fontSize="12" textAnchor="middle"
                    className="fig-ar" direction="rtl">{c.head_ar}</text>
            ) : null}
            {(c.items || []).map((it, j) => (
              <text key={j} x={x + CW / 2} y={76 + j * 24} fill={INK} fontSize="13" textAnchor="middle"
                    className="fig-en" lang="en">{it}</text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

const KINDS = { timeline: Timeline, blocks: Blocks, 'contrast-bar': ContrastBar, tree: Tree, 'table-figure': TableFigure }

export default function Diagram({ section, override }) {
  const Cmp = KINDS[section.kind]
  // An unknown kind must not crash the page; a missing drawing is survivable, a
  // white screen on a reference page is not.
  if (!Cmp && !override) return null
  return (
    <Figure caption={section.caption_ar} override={override} alt={section.caption_ar}>
      {Cmp ? <Cmp spec={section.spec || {}} /> : null}
    </Figure>
  )
}
