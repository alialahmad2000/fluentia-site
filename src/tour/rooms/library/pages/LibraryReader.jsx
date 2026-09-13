// TOUR PORT of fluentia-lms src/features/library/pages/LibraryReader.jsx.
// The Reader — "The Midnight Reading Room", all four skins with the LMS markup,
// classes and motion: صفحات (codex) · انسياب (reveal) · مساعدة (assist) · سينما (cinema).
//
// What changed for the tour, and why:
//   · data is the snapshot (The Wolf Winter, ch. 1, paragraphs 0–4 = the trimmed
//     80.5 s part); no progress/completion/word saves, no ShadowMode, rollup or club;
//   · cinema opens by default (the LMS default is codex);
//   · fixed layers → a sticky pin inside the reader (art, veil, candle), a sticky
//     player bar, and a tray/sheet positioned inside the reader — nothing covers
//     the TourBar or the TourEnd;
//   · scrolling follows the spoken sentence only when it leaves the view, smoothly,
//     and stands down while the visitor scrolls (LMS: scrollIntoView every line);
//   · the codex arrow keys belong to the book when it has focus (LMS: window-wide
//     preventDefault, re-bound every render); pages re-measure after web fonts load;
//   · iOS Safari: play only from a tap, duration from the snapshot until metadata
//     exists, and a seek requested before metadata is applied on loadedmetadata;
//   · the spoken line is tracked with requestAnimationFrame while playing
//     (Safari's timeupdate is ~4 Hz);
//   · in cinema a tapped sentence plays from its t0 AND unfolds its Arabic
//     beneath it with the library's own veil-lift (LMS cinema uses the bottom tray);
//   · after the part: Q1–Q2 (Q3/Q4 are about text after the cut) and an end card.
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Settings2, RotateCcw, RotateCw, Clapperboard } from 'lucide-react'
import SentenceReveal, { renderEN } from '../components/SentenceReveal'
import ChapterQuestions from '../components/ChapterQuestions'
import BookCover from '../components/BookCover'
import { shareQuote } from '../lib/quoteCard'
import { whatsappHref } from '../../../shell/TourChrome'
import snapshot from '../data/snapshot.json'

const PAPERS = ['ivory', 'cream', 'linen', 'parchment', 'sepia', 'night']
const RATES = [0.75, 1, 1.25, 1.5, 1.75]
const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

// interleave authored illustrations (after:-1 = chapter opener) into the paragraph flow
function buildBlocks(paragraphs, illustrations) {
  const list = Array.isArray(paragraphs) ? paragraphs : []
  const ill = Array.isArray(illustrations) ? illustrations : []
  const after = new Map()
  ill.forEach((x) => { const n = Number(x.after); if (n >= 0) { const a = after.get(n) || []; a.push(x); after.set(n, a) } })
  const blocks = []
  ill.filter((x) => Number(x.after) < 0).forEach((img) => blocks.push({ t: 'img', img }))
  list.forEach((p) => {
    blocks.push({ t: 'p', p })
    ;(after.get(p.index) || []).forEach((img) => blocks.push({ t: 'img', img }))
  })
  return blocks
}

function Plate({ img, variant }) {
  return (
    <figure className={variant === 'codex' ? 'lib-codex-plate' : 'lib-plate'}>
      <div className="lib-plate-frame"><img src={img.url} alt={img.alt || ''} loading="lazy" width="1024" height="768" /></div>
      {img.alt && <figcaption>{img.alt}</figcaption>}
    </figure>
  )
}

// tour: marks where the sampled part stops, in every skin
function PartCut({ variant }) {
  return (
    <div className={`lib-tour-cut ${variant ? `is-${variant}` : ''}`} dir="rtl">
      <span className="lib-tour-cut-orn" aria-hidden><i /></span>
      هنا ينتهي الجزء المعروض في الجولة، ويكتمل الفصل داخل المنصة
    </div>
  )
}

function RevealProse({ blocks, help }) {
  return (
    <div className="lib-prose">
      {blocks.map((b, i) => b.t === 'img'
        ? <Plate key={`i${i}`} img={b.img} variant="scroll" />
        : (
          <p key={b.p.id}>
            {b.p.sentences.map((s) => <SentenceReveal key={s.id} en={s.text_en} ar={s.text_ar} isDialogue={s.is_dialogue} help={help} />)}
          </p>
        ))}
      <PartCut />
    </div>
  )
}

function AssistProse({ blocks }) {
  return (
    <div>
      <div className="lib-assist-badge">وضع المساعدة — لا يُحتسب ضمن التقدّم</div>
      {blocks.map((b, i) => b.t === 'img'
        ? <Plate key={`i${i}`} img={b.img} variant="scroll" />
        : (
          <div key={b.p.id} className="lib-assist-para">
            <p className="lib-assist-en" dir="ltr">{b.p.sentences.map((s) => s.text_en).join(' ')}</p>
            <p className="lib-assist-ar" dir="rtl">{b.p.sentences.map((s) => s.text_ar).filter(Boolean).join(' ')}</p>
          </div>
        ))}
      <PartCut />
    </div>
  )
}

const fmtTime = (s) => { if (!s || !isFinite(s)) return '0:00'; const m = Math.floor(s / 60); const ss = Math.floor(s % 60); return `${m}:${String(ss).padStart(2, '0')}` }

// Cinema — narrated, with the chapter art as a living backdrop; the spoken
// sentence glows. Tap a sentence → it plays from there and its Arabic unfolds.
const CinemaProse = memo(function CinemaProse({ blocks, curKey, revealKey, onSentence, onCloseReveal }) {
  return (
    <div className="lib-cine-prose" dir="ltr">
      {blocks.map((b) => b.t === 'img' ? null : (
        <p key={b.p.id}>
          {b.p.sentences.map((s) => {
            const key = `${b.p.index}-${s.sentence_index}`
            const open = key === revealKey
            return (
              <Fragment key={s.id}>
                <span data-cinekey={key} className="lib-cine-sentence"
                  data-spoken={key === curKey || undefined} data-dialogue={s.is_dialogue || undefined}
                  data-open={open || undefined}
                  role="button" tabIndex={0}
                  title="اضغط للاستماع من هنا"
                  onClick={() => onSentence(key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSentence(key) } }}
                >{s.text_en}{' '}</span>
                <AnimatePresence initial={false}>
                  {open && s.text_ar && (
                    <motion.span
                      className="lib-reveal"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                      onClick={onCloseReveal}
                    >
                      <span className="lib-reveal-inner" dir="rtl">{s.text_ar}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Fragment>
            )
          })}
        </p>
      ))}
      <PartCut variant="cine" />
    </div>
  )
})

// Codex — open book; reliable page count via a hidden single-column measurer;
// TWO facing pages on wide screens; a slow page-curl; gilt folios.
function CodexProse({ blocks, chapter, onNext, onPrev, hasNext, hasPrev, onEnd, bookTitle, paper, onTray, help }) {
  const vpRef = useRef(null)
  const pgRef = useRef(null)
  const measRef = useRef(null)
  const flipId = useRef(0)
  const [spread, setSpread] = useState(0)
  const [m, setM] = useState({ colW: 0, gap: 0, two: false, spreads: 1, pages: 1 })
  const [flip, setFlip] = useState(null)

  const measure = useCallback(() => {
    const vp = vpRef.current, pg = pgRef.current, meas = measRef.current
    if (!vp || !pg || !meas) return
    const w = vp.clientWidth
    if (!w) return
    const two = w >= 600
    const gap = two ? 56 : 0
    const colW = two ? (w - gap) / 2 : w
    pg.style.columnWidth = `${colW}px`
    pg.style.columnGap = `${gap}px`
    meas.style.width = `${colW}px`
    const pageH = pg.clientHeight || 1
    const naturalH = meas.scrollHeight || pageH
    const pages = Math.max(1, Math.ceil(naturalH / pageH))
    const spreads = Math.max(1, Math.ceil(pages / (two ? 2 : 1)))
    setM({ colW, gap, two, spreads, pages })
    setSpread((s) => Math.min(s, spreads - 1))
  }, [])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (vpRef.current) ro.observe(vpRef.current)
    const t1 = setTimeout(measure, 250)
    const t2 = setTimeout(measure, 750)
    // tour: a late web-font swap changes line breaks — measure again once fonts are in
    let alive = true
    document.fonts?.ready?.then(() => { if (alive) measure() })
    return () => { alive = false; ro.disconnect(); clearTimeout(t1); clearTimeout(t2) }
  }, [measure, blocks, chapter?.id])

  useEffect(() => { setSpread(0); setFlip(null) }, [chapter?.id])

  const per = m.two ? 2 : 1
  const stride = per * (m.colW + m.gap)
  const turn = (dir) => {
    onTray(null)
    if (dir > 0) {
      if (spread < m.spreads - 1) { flipId.current += 1; setFlip({ dir: 1, id: flipId.current }); setSpread(spread + 1) }
      else if (hasNext) onNext()
      else onEnd?.()
    } else {
      if (spread > 0) { flipId.current += 1; setFlip({ dir: -1, id: flipId.current }); setSpread(spread - 1) }
      else if (hasPrev) onPrev()
    }
  }

  // tour: arrows turn pages only while the book has focus
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1) }
  }

  // tour: the drop cap belongs to the first PARAGRAPH — the LMS tested block index 0,
  // which is the opener plate on every chapter, so the drop cap never rendered
  const firstP = blocks.findIndex((b) => b.t === 'p')
  const leftNum = spread * per + 1
  const rightNum = m.two ? spread * 2 + 2 : null
  const content = (
    <>
      <div className="lib-codex-chhead">
        <div className="ch-num">{`Chapter ${chapter?.chapter_number}`}</div>
        <div className="ch-title">{chapter?.title_en || chapter?.title_ar}</div>
        <div className="lib-ch-orn"><span /></div>
      </div>
      {blocks.map((b, i) => b.t === 'img'
        ? <Plate key={`i${i}`} img={b.img} variant="codex" />
        : (
          <p key={b.p.id} className={`lib-codex-p${i === firstP ? ' first' : ''}`}>
            {b.p.sentences.map((s) => help === 'off'
              ? <span key={s.id} className="lib-sentence" data-static="" data-dialogue={s.is_dialogue || undefined}>{s.text_en}{' '}</span>
              : (
                <span key={s.id} className="lib-sentence" data-dialogue={s.is_dialogue || undefined}
                  onClick={() => onTray({ en: s.text_en, ar: s.text_ar })}>{renderEN(s.text_en, help)}{' '}</span>
              ))}
          </p>
        ))}
      <PartCut variant="codex" />
    </>
  )

  return (
    <div className="lib-codex" tabIndex={0} onKeyDown={onKey} aria-label="صفحات الرواية — الأسهم تقلّب الصفحات">
      <div className="lib-book" data-paper={paper}>
        <div className="lib-book-head">{bookTitle}</div>
        <div className="lib-book-spread" ref={vpRef}>
          <div className="lib-codex-pages" lang="en" ref={pgRef} style={{ transform: `translateX(${-spread * stride}px)` }}>
            {content}
          </div>
          <div className="lib-codex-measure" lang="en" ref={measRef} aria-hidden="true">{content}</div>
          {leftNum <= m.pages && <span className="lib-folio left">{leftNum}</span>}
          {rightNum && rightNum <= m.pages && <span className="lib-folio right">{rightNum}</span>}
          <AnimatePresence>
            {flip && (
              <motion.div
                key={flip.id}
                className={`lib-leaf ${flip.dir > 0 ? 'next' : 'prev'} ${m.two ? '' : 'single'}`}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: flip.dir > 0 ? -176 : 176 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.33, 0.0, 0.15, 1] }}
                onAnimationComplete={() => setFlip(null)}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="lib-codex-foot">
          <button onClick={() => turn(-1)} disabled={spread === 0 && !hasPrev} aria-label="الصفحة السابقة">‹</button>
          <span className="pg">{m.two ? `${leftNum}–${Math.min(rightNum || leftNum, m.pages)}` : leftNum} / {m.pages}</span>
          <button onClick={() => turn(1)} aria-label={spread >= m.spreads - 1 && !hasNext ? 'نهاية الجزء' : 'الصفحة التالية'}>{spread >= m.spreads - 1 && !hasNext ? '✦' : '›'}</button>
        </div>
      </div>
    </div>
  )
}

// tour: the close of the sampled part
function PartEnd({ book, chapter, otherBooks, mode, onReplay, onCinema }) {
  return (
    <section className="lib-tour-end" aria-label="نهاية الجزء">
      <div className="lib-tour-end-body">
        <div className="lib-tour-end-cover"><BookCover book={book} /></div>
        <div className="lib-tour-end-text">
          <span className="k">انتهى الجزء الأول من «{chapter.title_ar}»</span>
          <h3>أكمل الفصل والرواية داخل المنصة</h3>
          <p>
            «{book.title_ar}» {book.total_chapters} فصول كاملة، كلها مصوّرة ومسموعة بهذا الصوت،
            ومعها {otherBooks} روايات أخرى في مكتبة طلاقة من <bdi>A1</bdi> إلى <bdi>C1</bdi>.
          </p>
        </div>
      </div>
      <div className="lib-tour-end-actions">
        <a className="lib-start" data-cta="tour_library_reader_end" href={whatsappHref()} target="_blank" rel="noopener noreferrer">ابدأ بمحادثة</a>
        {mode === 'cinema'
          ? <button className="lib-tour-end-ghost" onClick={onReplay}><RotateCcw size={15} aria-hidden /> استمع من البداية</button>
          : <button className="lib-tour-end-ghost" onClick={onCinema}><Clapperboard size={15} aria-hidden /> شاهده في وضع السينما</button>}
      </div>
    </section>
  )
}

export default function LibraryReader() {
  const navigate = useNavigate()
  const { book, chapter: current, paragraphs, questions, books } = snapshot
  const CLIP_DUR = current.clip.duration_s
  const timing = current.audio_timing

  const [mode, setMode] = useState('cinema')
  const [prog, setProg] = useState(0)
  const [tray, setTray] = useState(null)
  const [paper, setPaper] = useState('ivory')
  const [fontScale, setFontScale] = useState(1)
  const [candle, setCandle] = useState(false)
  const [help, setHelp] = useState('full')
  const [savedWords, setSavedWords] = useState(() => new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [revealKey, setRevealKey] = useState(null)

  const stageRef = useRef(null)
  const barRef = useRef(null)
  const cineBarRef = useRef(null)
  const afterRef = useRef(null)
  const narrRef = useRef(null)
  const trackRef = useRef(null)
  const scrubbingRef = useRef(false)
  const pendingSeek = useRef(null)
  const lastTimeRef = useRef(-1)
  const [playing, setPlaying] = useState(false)
  const [curKey, setCurKey] = useState(null)
  // the time readout, fill and thumb are painted straight onto the DOM each frame:
  // re-rendering the reader 20×/s delayed the audio clock's start on slow devices
  const timeRef = useRef(null)
  const fillRef = useRef(null)
  const thumbRef = useRef(null)
  const [audioDur, setAudioDur] = useState(CLIP_DUR)
  const [rate, setRate] = useState(1)
  const [speedOpen, setSpeedOpen] = useState(false)

  const blocks = useMemo(() => buildBlocks(paragraphs, current?.illustrations), [paragraphs, current])
  const cinemaBg = current?.illustrations?.find((x) => Number(x.after) < 0)?.url || current?.illustrations?.[0]?.url || null
  const dur = audioDur > 0 && isFinite(audioDur) ? audioDur : CLIP_DUR

  // ── narration ────────────────────────────────────────────────────────────
  const durRef = useRef(CLIP_DUR)
  durRef.current = dur
  const paint = useCallback((t) => {
    const d = durRef.current || CLIP_DUR
    const pct = `${Math.min(100, Math.max(0, (t / d) * 100))}%`
    if (fillRef.current) fillRef.current.style.width = pct
    if (thumbRef.current) thumbRef.current.style.left = pct
    if (timeRef.current) timeRef.current.textContent = fmtTime(t)
    if (trackRef.current) {
      trackRef.current.setAttribute('aria-valuenow', String(Math.round(t)))
      trackRef.current.setAttribute('aria-valuetext', `${fmtTime(t)} / ${fmtTime(d)}`)
    }
  }, [CLIP_DUR])
  const keyAt = useCallback((sec) => {
    const ms = sec * 1000
    let k = null
    for (let i = 0; i < timing.length; i++) { if (timing[i].t0 <= ms) k = `${timing[i].p}-${timing[i].s}`; else break }
    return k
  }, [timing])

  const nowTime = () => {
    const el = narrRef.current
    return pendingSeek.current ?? (el ? el.currentTime : 0)
  }

  const sync = useCallback(() => {
    const el = narrRef.current; if (!el) return
    const t = pendingSeek.current ?? el.currentTime
    if (Math.abs(t - lastTimeRef.current) >= 0.03) { lastTimeRef.current = t; paint(t) }
    const k = keyAt(t)
    setCurKey((prev) => (k !== prev ? k : prev))
  }, [keyAt, paint])

  // Safari fires timeupdate ~4×/s; follow the voice per frame while it plays
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => { sync(); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, sync])

  // iOS has no metadata before the first play: remember the seek, apply it once it can land
  const applySeek = useCallback((sec) => {
    const el = narrRef.current; if (!el) return
    const t = Math.min(dur, Math.max(0, sec))
    if (el.readyState >= 1) {
      try { el.currentTime = t; pendingSeek.current = null } catch { pendingSeek.current = t }
    } else {
      pendingSeek.current = t
    }
    lastTimeRef.current = t
    paint(t)
    setCurKey(keyAt(t))
  }, [dur, keyAt, paint])

  const play = useCallback(() => {
    const el = narrRef.current; if (!el) return
    el.playbackRate = rate
    const p = el.play()
    if (p && typeof p.then === 'function') p.then(() => setPlaying(true)).catch(() => setPlaying(false))
    else setPlaying(true)
  }, [rate])

  const onLoadedMeta = () => {
    const el = narrRef.current; if (!el) return
    if (isFinite(el.duration) && el.duration > 0) setAudioDur(el.duration)
    el.playbackRate = rate
    if (pendingSeek.current != null) {
      try { el.currentTime = pendingSeek.current } catch { /* ignore */ }
      pendingSeek.current = null
    }
  }

  // cinema narration — reset on mode change (as the LMS does)
  useEffect(() => {
    const el = narrRef.current
    if (el) { el.pause(); if (el.readyState >= 1) { try { el.currentTime = 0 } catch { /* ignore */ } } }
    pendingSeek.current = null
    lastTimeRef.current = -1
    paint(0)
    setPlaying(false); setCurKey(null); setRevealKey(null); setSpeedOpen(false)
  }, [mode])

  useEffect(() => { if (narrRef.current) narrRef.current.playbackRate = rate }, [rate])
  useEffect(() => () => { narrRef.current?.pause() }, [])

  // ── follow the spoken line, politely ────────────────────────────────────
  const followRef = useRef(true)
  const manualAt = useRef(0)
  const progUntil = useRef(0)
  const curKeyRef = useRef(null)
  curKeyRef.current = curKey

  const band = useCallback(() => {
    const tourBar = document.querySelector('.tour-bar')
    const top = (tourBar?.getBoundingClientRect().bottom || 0) + (barRef.current?.offsetHeight || 0) + 8
    const bottom = window.innerHeight - (cineBarRef.current ? cineBarRef.current.offsetHeight + 34 : 16)
    return [top, Math.max(top + 80, bottom)]
  }, [])

  const ensureVisible = useCallback((key, { withReveal = false } = {}) => {
    const el = key && stageRef.current?.querySelector(`[data-cinekey="${key}"]`)
    if (!el) return
    const r = el.getBoundingClientRect()
    const rev = withReveal && el.nextElementSibling?.classList.contains('lib-reveal') ? el.nextElementSibling.getBoundingClientRect() : null
    const bottomEdge = rev ? rev.bottom : r.bottom
    const [top, bottom] = band()
    if (r.top >= top && bottomEdge <= bottom) return
    // a tapped line already on screen whose Arabic unfolds under the player: lift just
    // enough. A line off screen (or the voice moving on) goes to the upper third.
    const target = withReveal && r.top >= top && r.top < bottom && bottomEdge - r.top < bottom - top
      ? window.scrollY + (bottomEdge - bottom) + 12
      : window.scrollY + r.top - (top + (bottom - top) * 0.28)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    progUntil.current = performance.now() + 250
    window.scrollTo({ top: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' })
  }, [band])

  useEffect(() => {
    if (mode !== 'cinema') return
    let idle = 0
    const curVisible = () => {
      const el = curKeyRef.current && stageRef.current?.querySelector(`[data-cinekey="${curKeyRef.current}"]`)
      if (!el) return true
      const r = el.getBoundingClientRect(); const [top, bottom] = band()
      return r.bottom > top && r.top < bottom
    }
    const onManual = () => {
      manualAt.current = performance.now()
      clearTimeout(idle)
      // once the visitor settles: keep following only if the voice is still on screen
      idle = setTimeout(() => { followRef.current = curVisible() }, 220)
    }
    const onScroll = () => {
      const now = performance.now()
      if (now <= progUntil.current) { progUntil.current = now + 160; return } // our own smooth scroll
      onManual()
    }
    const onKey = (e) => {
      const t = e.target
      if (NAV_KEYS.has(e.key) && !(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName) || t.getAttribute?.('role') === 'button' || t.getAttribute?.('role') === 'slider'))) onManual()
    }
    window.addEventListener('wheel', onManual, { passive: true })
    window.addEventListener('touchmove', onManual, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(idle)
      window.removeEventListener('wheel', onManual)
      window.removeEventListener('touchmove', onManual)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [mode, band])

  useEffect(() => {
    if (mode !== 'cinema' || !curKey || !playing) return
    if (!followRef.current || performance.now() - manualAt.current < 900) return
    ensureVisible(curKey)
  }, [curKey, mode, playing, ensureVisible])

  // ── player controls ──────────────────────────────────────────────────────
  const toggleNarration = () => {
    const el = narrRef.current; if (!el) return
    if (el.paused) {
      followRef.current = true
      if (nowTime() >= dur - 0.25) applySeek(0)
      play()
    } else { el.pause(); setPlaying(false) }
  }
  const seekToRatio = (r) => { followRef.current = true; applySeek(Math.min(1, Math.max(0, r)) * dur) }
  const ratioFromEvent = (e) => {
    const el = trackRef.current; if (!el) return 0
    const box = el.getBoundingClientRect()
    return box.width ? (e.clientX - box.left) / box.width : 0
  }
  const onScrubDown = (e) => { scrubbingRef.current = true; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ } seekToRatio(ratioFromEvent(e)) }
  const onScrubMove = (e) => { if (scrubbingRef.current) seekToRatio(ratioFromEvent(e)) }
  const onScrubUp = (e) => { scrubbingRef.current = false; try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ } }
  const onScrubKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); applySeek(nowTime() + 5) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); applySeek(nowTime() - 5) }
  }
  const skipBy = (d) => { followRef.current = true; applySeek(nowTime() + d) }

  const revealTimer = useRef(0)
  useEffect(() => () => clearTimeout(revealTimer.current), [])
  const jumpToSentence = useCallback((key, { reveal = false } = {}) => {
    const hit = timing.find((t) => `${t.p}-${t.s}` === key)
    if (!hit) return
    followRef.current = true
    play() // inside the tap: iOS unlocks audio here
    applySeek(hit.t0 / 1000)
    clearTimeout(revealTimer.current)
    if (reveal) {
      setRevealKey(key)
      // after the veil has unfolded (0.32 s): keep the sentence and its Arabic clear of
      // the sticky bars — measuring earlier races the height animation + scroll anchoring
      revealTimer.current = setTimeout(() => ensureVisible(key, { withReveal: true }), 380)
    } else {
      requestAnimationFrame(() => ensureVisible(key))
    }
  }, [timing, play, applySeek, ensureVisible])

  const onSentence = useCallback((key) => jumpToSentence(key, { reveal: true }), [jumpToSentence])
  const onCloseReveal = useCallback(() => setRevealKey(null), [])
  const onJumpQ = (p, s) => { if (mode === 'cinema') jumpToSentence(`${p}-${s}`) }

  // ── reveal/assist progress, measured over the reader (not the whole page) ─
  useEffect(() => {
    if (mode === 'codex' || mode === 'cinema') return
    const onScroll = () => {
      const st = stageRef.current; if (!st) return
      const r = st.getBoundingClientRect()
      const max = r.height - window.innerHeight
      setProg(max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [mode])

  // ── settings (local only in the tour) ────────────────────────────────────
  const bumpFont = (d) => setFontScale((f) => Math.min(1.35, Math.max(0.85, Math.round((f + d) * 100) / 100)))
  const changeHelp = (h) => { setHelp(h); setTray(null) }
  const cleanWord = (w) => String(w || '').replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, '').toLowerCase()
  const onSaveWord = (raw) => {
    const clean = cleanWord(raw)
    if (clean.length < 2) return
    try { const u = new SpeechSynthesisUtterance(clean); u.lang = 'en-US'; u.rate = 0.92; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch { /* ignore */ }
    if (savedWords.has(clean)) return
    setSavedWords((s) => { const n = new Set(s); n.add(clean); return n })
  }

  useEffect(() => {
    if (!showSettings && !speedOpen && !tray) return
    const onEsc = (e) => { if (e.key === 'Escape') { setShowSettings(false); setSpeedOpen(false); setTray(null) } }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showSettings, speedOpen, tray])

  const goAfter = () => afterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const toCinema = () => {
    setMode('cinema')
    requestAnimationFrame(() => stageRef.current && window.scrollTo({ top: window.scrollY + stageRef.current.getBoundingClientRect().top - 60, behavior: 'smooth' }))
  }
  const replay = () => { followRef.current = true; play(); applySeek(0); requestAnimationFrame(() => ensureVisible('0-0')) }

  const after = (
    <div ref={afterRef} className="lib-tour-after">
      <ChapterQuestions questions={questions} onJump={mode === 'cinema' ? onJumpQ : undefined} />
      <PartEnd book={book} chapter={current} otherBooks={books.length - 1} mode={mode} onReplay={replay} onCinema={toCinema} />
    </div>
  )

  return (
    <div ref={stageRef} className="lib-reader-stage" data-mode={mode} data-candle={candle || undefined} data-mood={book?.theme || undefined} style={{ '--lib-fontscale': fontScale }}>
      {(mode === 'cinema' || candle) && (
        <div className="lib-tour-pin-layer" aria-hidden="true">
          <div className="lib-tour-pin">
            {mode === 'cinema' && cinemaBg && <div className="lib-cine-bg" style={{ backgroundImage: `url("${cinemaBg}")` }} />}
            {mode === 'cinema' && <div className="lib-cine-veil" />}
            {candle && <div className="lib-candle" />}
          </div>
        </div>
      )}
      <audio
        ref={narrRef}
        src={current.audio_url}
        preload="metadata"
        playsInline
        onTimeUpdate={sync}
        onSeeked={sync}
        onLoadedMetadata={onLoadedMeta}
        onDurationChange={onLoadedMeta}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); sync() }}
      />
      <div className="lib-reader-bar" ref={barRef}>
        <button className="lib-back" onClick={() => navigate(`/tour/library/${book.slug}`)}>
          <ChevronRight size={16} /> <span className="lib-back-label">الرواية</span>
        </button>
        <div className="lib-bar-title">
          <div className="bt">{book.title_ar || book.title_en}</div>
          <div className="bc"><bdi>{current.title_en || `Chapter ${current.chapter_number}`}</bdi></div>
        </div>
        <button className="lib-gear" onClick={() => setShowSettings((v) => !v)} aria-label="إعدادات القراءة" aria-expanded={showSettings}><Settings2 size={17} /></button>
        <div className="lib-mode">
          <button data-active={mode === 'codex'} onClick={() => setMode('codex')}>صفحات</button>
          <button data-active={mode === 'reveal'} onClick={() => setMode('reveal')}>انسياب</button>
          <button data-active={mode === 'assist'} onClick={() => setMode('assist')}>مساعدة</button>
          <button data-active={mode === 'cinema'} onClick={() => setMode('cinema')}>سينما</button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div className="lib-sheet" role="dialog" aria-label="إعدادات القراءة" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}>
              {mode === 'codex' && (
                <div className="lib-sheet-row">
                  <span>الورق</span>
                  <div className="lib-papers">
                    {PAPERS.map((p) => (
                      <button key={p} className="lib-swatch" data-paper={p} data-active={paper === p} onClick={() => setPaper(p)} aria-label={`ورق ${p}`} />
                    ))}
                  </div>
                </div>
              )}
              <div className="lib-sheet-row">
                <span>حجم الخط</span>
                <div className="lib-stepper">
                  {/* tour: <bdi> — in RTL the LMS rendered «−A» / «+A» */}
                  <button onClick={() => bumpFont(-0.05)}><bdi>A−</bdi></button>
                  <i>{Math.round(fontScale * 100)}%</i>
                  <button onClick={() => bumpFont(0.05)}><bdi>A+</bdi></button>
                </div>
              </div>
              <div className="lib-sheet-row">
                <span>إضاءة الشموع</span>
                <button className={`lib-toggle ${candle ? 'on' : ''}`} onClick={() => setCandle((c) => !c)} aria-label="إضاءة الشموع" aria-pressed={candle}><i /></button>
              </div>
              <div className="lib-sheet-row">
                <span>مستوى المساعدة</span>
                <div className="lib-seg">
                  <button data-active={help === 'full'} onClick={() => changeHelp('full')}>الكل</button>
                  <button data-active={help === 'hints'} onClick={() => changeHelp('hints')}>تلميح</button>
                  <button data-active={help === 'off'} onClick={() => changeHelp('off')}>إيقاف</button>
                </div>
              </div>
              <button className="lib-sheet-done" onClick={() => setShowSettings(false)}>تم</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showSettings && <motion.div key="sheet-scrim" className="lib-sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} />}
      </AnimatePresence>
      {mode !== 'codex' && mode !== 'cinema' && <div className="lib-progress"><i style={{ width: `${Math.round(prog * 100)}%` }} /></div>}

      {mode === 'codex' ? (
        <>
          <div className="lib-tour-codex-wrap">
            <CodexProse blocks={blocks} chapter={current} onNext={() => {}} onPrev={() => {}} hasNext={false} hasPrev={false} onEnd={goAfter} bookTitle={book.title_en || book.title_ar} paper={paper} onTray={setTray} help={help} />
            <AnimatePresence>
              {tray && (
                <motion.div
                  key="scrim"
                  className="lib-tray-scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setTray(null)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {tray && (
                <motion.div
                  className="lib-codex-tray"
                  initial={{ x: '-50%', y: 44, opacity: 0 }}
                  animate={{ x: '-50%', y: 0, opacity: 1 }}
                  exit={{ x: '-50%', y: 44, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <div className="en" dir="ltr">
                    {tray.en.split(/(\s+)/).map((tok, i) => /[A-Za-z]/.test(tok)
                      ? <span key={i} className="lib-word" data-saved={savedWords.has(cleanWord(tok)) || undefined} onClick={() => onSaveWord(tok)}>{tok}</span>
                      : tok)}
                  </div>
                  {tray.ar && <div className="ar" dir="rtl">{tray.ar}</div>}
                  <div className="lib-tray-hint">اضغط أي كلمة لسماعها 🔊 وداخل المنصة تُحفظ في «كلماتي»</div>
                  <div className="lib-tray-actions">
                    <button className="lib-tray-share" onClick={() => shareQuote({ en: tray.en, ar: tray.ar, title: book.title_en || book.title_ar })}>شارك الاقتباس ✦</button>
                    <button className="close" onClick={() => setTray(null)}>إغلاق</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="lib-page lib-tour-codex-after">{after}</div>
        </>
      ) : mode === 'cinema' ? (
        <>
          <div className="lib-page lib-cine-page">
            <div className="lib-chapter-head lib-cine-head">
              <div className="ch-num">{current.title_ar ? `الفصل ${current.chapter_number}` : `Chapter ${current.chapter_number}`}</div>
              <div className="ch-title" dir="ltr">{current.title_en || current.title_ar}</div>
              <div className="ch-rule" />
            </div>
            <div className="lib-tour-hint">اضغط ▶ لتستمع، أو اضغط أي جملة لتسمعها وترى معناها بالعربية</div>
            <CinemaProse blocks={blocks} curKey={curKey} revealKey={revealKey} onSentence={onSentence} onCloseReveal={onCloseReveal} />
            {after}
          </div>
          <div className="lib-cine-bar" ref={cineBarRef} data-rich dir="ltr">
            <button className="lib-cine-play" onClick={toggleNarration} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>{playing ? '❚❚' : '▶'}</button>
            <button className="lib-cine-skip" onClick={() => skipBy(-10)} aria-label="إرجاع 10 ثوانٍ"><RotateCcw size={15} /><b>10</b></button>
            <span className="lib-cine-time" ref={timeRef}>0:00</span>
            <div className="lib-cine-track" ref={trackRef} role="slider" tabIndex={0}
              aria-label="شريط الصوت" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={0}
              onPointerDown={onScrubDown} onPointerMove={onScrubMove} onPointerUp={onScrubUp} onPointerCancel={onScrubUp} onKeyDown={onScrubKey}>
              <i ref={fillRef} style={{ width: '0%' }} />
              <span className="lib-cine-thumb" ref={thumbRef} style={{ left: '0%' }} />
            </div>
            <span className="lib-cine-time lib-cine-time-total">{fmtTime(dur)}</span>
            <button className="lib-cine-skip" onClick={() => skipBy(10)} aria-label="تقديم 10 ثوانٍ"><RotateCw size={15} /><b>10</b></button>
            <div className="lib-cine-speed-wrap">
              <button className="lib-cine-speed" onClick={() => setSpeedOpen((o) => !o)} aria-label="سرعة الصوت" aria-expanded={speedOpen}>{rate}×</button>
              {speedOpen && (
                <div className="lib-cine-speed-pop">
                  {RATES.map((r) => (
                    <button key={r} data-active={r === rate || undefined} onClick={() => { setRate(r); setSpeedOpen(false) }}>{r}×</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="lib-page">
          <div className="lib-chapter-head">
            <div className="ch-num">{current.title_ar ? `الفصل ${current.chapter_number}` : `Chapter ${current.chapter_number}`}</div>
            <div className="ch-title" dir="ltr">{current.title_en || current.title_ar}</div>
            <div className="ch-rule" />
          </div>
          {mode === 'reveal' ? <RevealProse blocks={blocks} help={help} /> : <AssistProse blocks={blocks} />}
          {after}
        </div>
      )}
    </div>
  )
}
