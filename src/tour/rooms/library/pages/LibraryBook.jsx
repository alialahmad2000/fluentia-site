// TOUR PORT of fluentia-lms src/features/library/pages/LibraryBook.jsx.
// Large cover, Arabic synopsis, «ابدأ القراءة», the chapter list. Changes:
//   · data from the snapshot; no progress (resume/completed), no BookClub;
//   · chapter 1 opens the reader; chapters 2–5 carry a «داخل المنصة» mark and
//     stay put instead of routing nowhere;
//   · the back button no longer borrows .lib-foot (LMS bug: it inherited the
//     chapter-foot's flex, top border and 20px top margin under the inline styles).
import { useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen, Lock } from 'lucide-react'
import BookCover from '../components/BookCover'
import snapshot from '../data/snapshot.json'

export default function LibraryBook() {
  const navigate = useNavigate()
  const { book, chapters, chapter: sample } = snapshot
  const readPath = `/tour/library/${book.slug}/read`

  return (
    <div className="lib-detail">
      <button className="lib-tour-back" onClick={() => navigate('/tour/library')}>
        <ChevronRight size={16} /> المكتبة
      </button>

      <div className="lib-detail-hero">
        <BookCover book={book} size="lg" />
        <div className="lib-detail-info">
          <h1>{book.title_ar || book.title_en}</h1>
          <div className="en">{book.title_en}</div>
          <div className="by"><bdi>{book.author_label || 'Fluentia Originals'} · {book.cefr}</bdi></div>
        </div>
      </div>

      {book.synopsis_ar && <p className="lib-syn">{book.synopsis_ar}</p>}

      <button className="lib-start" onClick={() => navigate(readPath)}>
        <BookOpen size={17} /> ابدأ القراءة
      </button>

      <div className="lib-chapters">
        <h2>الفصول</h2>
        {chapters.map((c) => {
          const inTour = c.id === sample.id
          return (
            <div
              key={c.id}
              className="lib-chapter-row"
              data-tour-inside={inTour ? undefined : true}
              role={inTour ? 'button' : undefined}
              tabIndex={inTour ? 0 : undefined}
              onClick={inTour ? () => navigate(readPath) : undefined}
              onKeyDown={inTour ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(readPath) } } : undefined}
            >
              <span className="n">{c.chapter_number}</span>
              <div className="ti">
                <div className="a">{c.title_ar || `الفصل ${c.chapter_number}`}</div>
                {c.title_en && <div className="e">{c.title_en}</div>}
              </div>
              {inTour
                ? <span className="lib-tour-ch-tag" data-kind="open">مفتوح في الجولة</span>
                : <span className="lib-tour-ch-tag"><Lock size={11} aria-hidden /> داخل المنصة</span>}
              {c.word_count > 0 && <span className="w">{c.word_count} كلمة</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
