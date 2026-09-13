import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import World from './World'
import { IDIOMS, LIBRARY, sheetPath } from './visitor'
import './expressions.css'

/**
 * TOUR PORT of fluentia-lms src/pages/student/expressions/IdiomLab.jsx
 * (origin/main 3396e97e).
 *
 * Stripped: the data hooks (items = the tour's two idioms), the owned count
 * and the «أتقنتِه» badge. Rewritten by hand: the lede's hardcoded feminine
 * («عليكِ», «نُريكِ», «الطالبة») and the count line.
 *
 * «معمل التعابير» — the idiom lab.
 *
 * Every card shows the two panels side by side: what the words say, and what
 * they mean. The gap between the two IS the lesson, so it is the first thing
 * on the card rather than something explained after a click.
 */
export default function IdiomLab() {
  const items = IDIOMS
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
    <div className="expr-root is-lab" id="idioms">
      <World src={(items ?? [])[0]?.image_url} />
      <div className="expr-wrap">

        <p className="expr-eyebrow">معمل التعابير</p>
        <h2 className="expr-title">التعبير الاصطلاحي<br />يكذب عليك عمداً.</h2>
        <p className="expr-lede">
          الكلمات تقول شيئاً والمعنى شيء آخر — وهذه بالضبط هي الصعوبة. فبدل أن نشرحها بالكلام،
          نُريك الكذبة والحقيقة جنباً إلى جنب. ثم نُعلّمك الجزء الذي تتجاهله أكثر المناهج:
          <b> قالب التعبير</b> — لأن المتعلّم لا يُخطئ في المعنى غالباً، بل في الصياغة.
        </p>

        <p className="expr-lede" style={{ marginTop: 10, fontSize: '.875rem' }}>
          تعبيران مفتوحان في هذه الجولة، من أصل {LIBRARY.idiom} تعبير في المعمل
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

        {shown.length ? (
          <div className="expr-idioms">
            {shown.map((it) => (
              <Link key={it.id} to={sheetPath(it)} className="expr-icard">
                <span className="duo">
                  <span>
                    {it.image_literal_url ? <img src={it.image_literal_url} alt="" loading="lazy" /> : null}
                    <span className="tag">ما تقوله الكلمات</span>
                  </span>
                  <span>
                    {it.image_url ? <img src={it.image_url} alt="" loading="lazy" /> : null}
                    <span className="tag">ما يعنيه فعلاً</span>
                  </span>
                </span>
                <span className="body">
                  <span className="en" dir="ltr">{it.text_en}</span>
                  <span className="mn">{it.meaning_ar}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="expr-empty">لا توجد تعابير في هذا الموضوع بعد.</p>
        )}
      </div>
    </div>
  )
}
