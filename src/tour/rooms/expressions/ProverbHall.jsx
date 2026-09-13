import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import World from './World'
import ProverbOfDayCard from './ProverbOfDayCard'
import { PROVERBS, LIBRARY, sheetPath } from './visitor'
import './expressions.css'

// Verbatim from useExpressions.js, the only non-data export the hall used.
const FREQUENCY_AR = {
  very_common: 'شائع جداً',
  common: 'شائع',
  less_common: 'أقل شيوعاً',
  dated: 'قديم — نادراً ما يُستعمل',
  literary: 'أدبي — للكتابة لا للحديث',
}

/**
 * TOUR PORT of fluentia-lms src/pages/student/expressions/ProverbHall.jsx
 * (origin/main 3396e97e).
 *
 * Stripped: useExpressions / useExpressionProgress (items = the tour's two
 * proverbs), the owned count and the «أتقنتِه» badge (a visitor owns nothing).
 * Rewritten by hand: the lede's hardcoded feminine («نُريكِ … تحفظينه»), and
 * the count line, which says how many of the hall's proverbs the tour opens.
 * Added for the tour: the «مثل اليوم» card from the student home, beside the
 * masthead. The theme chips filter locally, exactly as on the platform.
 *
 * «قاعة الأمثال» — the proverb hall.
 *
 * The card face deliberately shows the Arabic twin next to the English. That is
 * the hook, not a spoiler: a proverb known since childhood is recognised and
 * the English one arrives already attached to it. The guessing happens inside
 * the sheet, on the meaning — which is the part not already owned.
 */
export default function ProverbHall() {
  const items = PROVERBS
  const [theme, setTheme] = useState('all')

  const themes = useMemo(() => {
    const out = []; const seen = {}
    for (const it of items ?? []) {
      if (!seen[it.theme]) { seen[it.theme] = true; out.push({ key: it.theme, label: it.theme_label_ar }) }
    }
    return out
  }, [items])

  const shown = useMemo(
    () => (items ?? []).filter((it) => theme === 'all' || it.theme === theme),
    [items, theme],
  )

  return (
    <div className="expr-root is-hall" id="proverbs">
      <World src={(items ?? [])[0]?.image_url} />
      <div className="expr-wrap">

        <div className="tx-hall">
          <div className="tx-head-main">
            <p className="expr-eyebrow">قاعة الأمثال</p>
            <h2 className="expr-title">لكل مثلٍ إنجليزي<br />توأمٌ تعرفه من قبل.</h2>
            <p className="expr-lede">
              أنت تملك مكتبة حكمة كاملة بالعربية. لا نُعلّمك المثل الإنجليزي من الصفر —
              نُريك <b>توأمه العربي</b> الذي تحفظه منذ الطفولة، فيثبت في ذاكرتك من أول مرة.
            </p>

            <p className="expr-lede" style={{ marginTop: 10, fontSize: '.875rem' }}>
              مثلان مفتوحان في هذه الجولة، من أصل {LIBRARY.proverb} مثلاً في القاعة
            </p>

            {themes.length > 1 ? (
              <div className="expr-themes">
                <button type="button" className="expr-chip" aria-pressed={theme === 'all'} onClick={() => setTheme('all')}>
                  الكل
                </button>
                {themes.map((t) => (
                  <button key={t.key} type="button" className="expr-chip"
                    aria-pressed={theme === t.key} onClick={() => setTheme(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="tx-head-aside">
            <p className="tx-aside-lbl">«مثل اليوم» كما يظهر في الصفحة الرئيسية للطالب</p>
            <ProverbOfDayCard />
          </aside>

          <div className="tx-hall-plates">
            {shown.length ? (
              <div className="expr-plates">
                {shown.map((p) => (
                  <Link key={p.id} to={sheetPath(p)} className="expr-plate">
                    {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : null}
                    <span className="veil" />
                    <span className="expr-badge">{FREQUENCY_AR[p.frequency]}</span>
                    <span className="txt">
                      <span className="en" dir="ltr">{p.text_en}</span>
                      <span className="tw">{p.arabic_twin}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="expr-empty">لا توجد أمثال في هذا الموضوع بعد.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
