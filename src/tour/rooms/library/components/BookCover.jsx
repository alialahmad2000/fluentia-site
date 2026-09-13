// TOUR PORT of fluentia-lms src/features/library/components/BookCover.jsx —
// markup and classes unchanged (English runs wrapped in <bdi>); themeKicker inlined from hooks/useLibrary.js.
//
// Publisher-series cover. A tone-matched, full-bleed illustration per novel
// (locked art direction + palette) dissolving into the theme colour field, with
// the title + byline anchored on a clean scrim so the typography stays the hero.
import { Lock } from 'lucide-react'

const THEME_LABEL = { mystery: 'MYSTERY', grief: 'A QUIET DRAMA', ambition: 'AMBITION', courage: 'COURAGE', adventure: 'AN ADVENTURE', wonder: 'A WONDER', warmth: 'A WARM TALE', discovery: 'A DISCOVERY' }
export function themeKicker(theme) { return THEME_LABEL[theme] || 'A NOVEL' }

export default function BookCover({ book, size = 'md', locked = false }) {
  const art = book.cover_data?.art_url
  return (
    <div
      className={`lib-cover ${size === 'lg' ? 'lib-cover-lg' : ''}`}
      data-theme={book.theme}
      data-art={art ? 'true' : undefined}
      data-locked={locked || undefined}
    >
      {art && (
        <div className="lib-cover-art" style={{ backgroundImage: `url("${art}")` }} />
      )}
      <div className="lib-cover-field">
        <div className="lib-cover-top">
          <span className="lib-cover-kicker"><bdi>{themeKicker(book.theme)}</bdi></span>
          <span className="lib-cover-level"><bdi>{book.cefr}</bdi></span>
        </div>
        <div className="lib-cover-title"><bdi>{book.title_en}</bdi></div>
        <div className="lib-cover-rule" />
        <div className="lib-cover-author"><bdi>{book.author_label || 'Fluentia Originals'}</bdi></div>
        {!art && <div className="lib-cover-motif" />}
      </div>
      {locked && (
        <div className="lib-cover-lock"><Lock size={20} /></div>
      )}
    </div>
  )
}
