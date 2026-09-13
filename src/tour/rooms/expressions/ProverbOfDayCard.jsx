// TOUR PORT of fluentia-lms src/components/expressions/ProverbOfDayCard.jsx
// (origin/main 3396e97e).
//
// Stripped: useAuthStore, both react-query/supabase reads (the pool is the
// tour's two proverbs; there is no "owned" list for a visitor), and the
// genderize hooks. The pick keeps the platform's rule exactly: Riyadh day
// index + hash of the student id, which for a visitor is the platform's own
// fallback 'anon'.
//
// «مثل اليوم» — one proverb a day on the Living Atlas home.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Feather, ChevronLeft } from 'lucide-react'
import { Bi } from './labels'
import { PROVERBS, sheetPath } from './visitor'
import './proverbOfDay.css'

/** Riyadh-local day index — the card must turn over at local midnight, not UTC's. */
function riyadhDayIndex() {
  const nowMs = Date.now() + 3 * 60 * 60 * 1000 // UTC+3, no DST in Saudi Arabia
  return Math.floor(nowMs / 86_400_000)
}

/** Small stable string hash, so two students rarely share the same day's proverb. */
function hash(str) {
  let h = 5381
  for (let i = 0; i < String(str).length; i++) h = ((h << 5) + h + String(str).charCodeAt(i)) >>> 0
  return h
}

export default function ProverbOfDayCard() {
  const pick = useMemo(() => {
    const pool = PROVERBS.filter((p) => p.image_url)
    if (!pool.length) return null
    const seed = riyadhDayIndex() + hash('anon')
    return pool[seed % pool.length]
  }, [])

  if (!pick) return null

  return (
    <Link to={sheetPath(pick)} className="pod-card">
      <img className="pod-card__img" src={pick.image_url} alt="" loading="lazy" />
      <span className="pod-card__veil" aria-hidden="true" />

      <span className="pod-card__tag">
        <Feather size={13} aria-hidden="true" />
        <Bi en="Proverb of the day" ar="مثل اليوم" />
      </span>

      <span className="pod-card__body">
        <span className="pod-card__en" dir="ltr">{pick.text_en}</span>
        {pick.arabic_twin ? <span className="pod-card__tw">{pick.arabic_twin}</span> : null}
        <span className="pod-card__cta">
          <Bi en="Open it" ar="افتح المثل" />
          <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}
