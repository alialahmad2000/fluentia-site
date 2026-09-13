// TOUR PORT of fluentia-lms src/features/library/pages/LibraryHome.jsx.
// The Midnight Reading Room: same env layers, masthead, three rooms, cards and
// covers. Changes for the tour:
//   · books come from the snapshot; rooms are chosen as the LMS does for a B1
//     student (level 3): mine ≤ 3, tease = 4, soon ≥ 5 — so all three rooms show;
//   · the «كلماتي» tab, continue-reading hero and guestbook are stripped (per-user);
//   · body.lib-immersive is gone; .lib-env is absolute + a sticky pin, not fixed;
//   · only «شتاء الذئاب» opens. Every other cover answers a tap with a calm
//     «هذه الرواية داخل المنصة» veil on the cover itself, never a dead tap.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import BookCover from '../components/BookCover'
import snapshot from '../data/snapshot.json'

const PREVIEW_LEVEL = 3 // a B1 student — the level of the book the tour opens
const OPEN_SLUG = snapshot.book.slug

// verbatim from hooks/useLibrary.js
function roomForBook(book, level) {
  const n = Number(book.level_number)
  if (n <= level) return 'mine'
  if (n === level + 1) return 'tease'
  return 'soon'
}

const chaptersLabel = (n) => (n === 1 ? 'فصل واحد' : n === 2 ? 'فصلان' : n <= 10 ? `${n} فصول` : `${n} فصلاً`)

function Card({ book, room, onOpen, notice, onNotice }) {
  const locked = room === 'soon'
  const isOpen = book.slug === OPEN_SLUG
  const showNotice = notice === book.id
  const activate = () => (isOpen ? onOpen(book) : onNotice(showNotice ? null : book.id))
  return (
    <div
      className="lib-card"
      data-locked={locked || undefined}
      data-tour-open={isOpen || undefined}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? `افتح رواية ${book.title_ar}` : `${book.title_ar} — هذه الرواية داخل المنصة`}
      onClick={activate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate() } }}
    >
      <div className="lib-card-cover">
        <BookCover book={book} locked={locked} />
        {showNotice && (
          <div className="lib-tour-inside" role="status">
            <BookOpen size={20} aria-hidden />
            <b>هذه الرواية داخل المنصة</b>
            <span><bdi>{book.cefr}</bdi> · {chaptersLabel(book.total_chapters)}</span>
            <button
              className="lib-tour-inside-go"
              onClick={(e) => { e.stopPropagation(); onOpen(null) }}
            >
              جرّب «شتاء الذئاب»
            </button>
          </div>
        )}
      </div>
      <div className="lib-card-meta">
        <div className="t">{book.title_ar || book.title_en}</div>
        <div className="s">{book.title_en}</div>
        {isOpen && <span className="lib-card-tag" data-kind="seal">مفتوحة في الجولة ✦</span>}
        {!isOpen && room === 'mine' && book.total_chapters > 0 && <span className="lib-card-tag" data-kind="seal">رواية كاملة</span>}
        {room === 'tease' && <span className="lib-card-tag" data-kind="tease">الفصل الأول مفتوح</span>}
        {room === 'soon' && <span className="lib-card-tag" data-kind="soon">قريباً · <bdi>{book.cefr}</bdi></span>}
      </div>
    </div>
  )
}

function Room({ title, count, children }) {
  return (
    <section className="lib-room">
      <div className="lib-room-head">
        <h2>{title}</h2>
        <span className="lib-room-rule" />
        <span className="lib-room-count">{count}</span>
      </div>
      <div className="lib-shelf fl-stagger">{children}</div>
    </section>
  )
}

export default function LibraryHome() {
  const navigate = useNavigate()
  const books = snapshot.books
  const [notice, setNotice] = useState(null)
  const timer = useRef(null)

  const rooms = useMemo(() => {
    const g = { mine: [], tease: [], soon: [] }
    for (const b of books) g[roomForBook(b, PREVIEW_LEVEL)].push(b)
    return g
  }, [books])

  // the notice fades on its own after a few seconds
  useEffect(() => {
    clearTimeout(timer.current)
    if (notice) timer.current = setTimeout(() => setNotice(null), 5200)
    return () => clearTimeout(timer.current)
  }, [notice])

  const open = () => navigate(`/tour/library/${OPEN_SLUG}`)

  return (
    <div className="lib-tour-shelf">
      <div className="lib-env" aria-hidden="true">
        <div className="lib-env-pin">
          <div className="lib-env-img" />
          <div className="lib-env-glow" />
          <div className="lib-env-motes" />
          <div className="lib-env-scrim" />
        </div>
      </div>
      <div className="lib-home" data-view="shelf">
        <header className="lib-masthead">
          <h1>مكتبة طلاقة</h1>
          <div className="lib-wordmark" dir="ltr">The Fluentia Library</div>
          <p>روايات عالمية أصلية، بإنجليزية متدرّجة — اقرأ بمتعة، واضغط أي جملة لترى معناها يظهر بهدوء من تحتها.</p>
        </header>

        <Room title="مكتبتي" count={`${rooms.mine.length} روايات`}>
          {rooms.mine.map((b) => <Card key={b.id} book={b} room="mine" onOpen={open} notice={notice} onNotice={setNotice} />)}
        </Room>
        <Room title="اقرأ الفصل الأول" count={`${rooms.tease.length}`}>
          {rooms.tease.map((b) => <Card key={b.id} book={b} room="tease" onOpen={open} notice={notice} onNotice={setNotice} />)}
        </Room>
        <Room title="قريباً" count={`${rooms.soon.length}`}>
          {rooms.soon.map((b) => <Card key={b.id} book={b} room="soon" onOpen={open} notice={notice} onNotice={setNotice} />)}
        </Room>
      </div>
    </div>
  )
}
