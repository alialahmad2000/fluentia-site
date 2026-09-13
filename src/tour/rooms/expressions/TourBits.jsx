import { Link } from 'react-router-dom'
import { ITEMS, sheetPath, ROOM_PATH } from './visitor'
import { KindBadge } from './labels'
import { SAMPLES } from './samples'
import { isoLatin } from './bidi'

/* Tour-only pieces around the ported sheets. They wear the sheets' own
   tokens (--x-*) so they read as part of the room, but they are not platform
   UI: the switcher and the next-sheet card exist because the tour has four
   sheets to walk between, and the sample card replaces a server-graded step. */

const SHORT = {
  'dont-count-your-chickens': "Don't count your chickens",
  'the-early-bird': 'The early bird',
  'cost-an-arm-and-a-leg': 'Cost an arm and a leg',
  'spill-the-beans': 'Spill the beans',
}
const AR_KIND = { proverb: 'مثل', idiom: 'تعبير' }

const thumbOf = (it) => it.image_literal_url || it.image_url

/** The four sheets of the tour, one tap apart. */
export function SheetSwitcher({ current }) {
  return (
    <nav className="tx-switch" aria-label="أوراق هذه الجولة">
      <span className="tx-switch-lbl">أوراق الجولة</span>
      <div className="tx-switch-row">
        {ITEMS.map((it) => {
          const on = it.slug === current
          return (
            <Link
              key={it.slug}
              to={sheetPath(it)}
              className={`tx-sw is-${it.kind}${on ? ' is-on' : ''}`}
              aria-current={on ? 'page' : undefined}
            >
              <img src={thumbOf(it)} alt="" loading="lazy" width="40" height="40" />
              <span className="tx-sw-t">
                <b dir="ltr">{SHORT[it.slug]}</b>
                <em>{AR_KIND[it.kind]}</em>
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/** The end of a sheet walks on to the next one, then back to the room. */
export function NextSheet({ current }) {
  const i = ITEMS.findIndex((x) => x.slug === current)
  const next = ITEMS[i + 1]
  if (!next) {
    return (
      <div className="tx-next-row">
        <Link to={ROOM_PATH} className="tx-next is-home">
          <span className="tx-next-k">انتهت أوراق الجولة</span>
          <span className="tx-next-title">عُد إلى الأمثال والتعابير</span>
          <span className="tx-next-go" aria-hidden>←</span>
        </Link>
      </div>
    )
  }
  return (
    <div className="tx-next-row">
      <Link to={sheetPath(next)} className={`tx-next is-${next.kind}`}>
        <img src={thumbOf(next)} alt="" loading="lazy" />
        <span className="tx-next-body">
          <span className="tx-next-k">الورقة التالية</span>
          <KindBadge kind={next.kind} />
          <span className="tx-next-en" dir="ltr">{next.text_en}</span>
        </span>
        <span className="tx-next-go" aria-hidden>←</span>
      </Link>
    </div>
  )
}

const VERDICT_LABEL = {
  correct: 'استعمال صحيح ✓',
  partly: 'قريبة جداً',
  wrong: 'لنراجعها معاً',
}

/**
 * Stands in for the textarea + «أرسل للمراجعة» + grader round trip. The
 * feedback block below is the sheets' own `.expr-fb` markup, unchanged.
 */
export function SampleFeedback({ slug }) {
  const s = SAMPLES[slug]
  if (!s) return null
  return (
    <div className="tx-sample">
      <p className="tx-sample-note">
        <span className="tx-sample-tag">مثال توضيحي</span>
        داخل المنصة تكتب جملة عن موقف من حياتك، ويراجعها المصحّح خلال ثوانٍ. هذا شكل الرد الذي يصلك، والجملة كُتبت للجولة وليست لطالب حقيقي.
      </p>
      <div className="expr-ta tx-sample-ta" dir="ltr">{s.text}</div>
      <div className={`expr-fb${s.verdict === 'partly' ? ' is-partly' : s.verdict === 'wrong' ? ' is-wrong' : ''}`}>
        <b>{VERDICT_LABEL[s.verdict]}</b>
        <br />
        {isoLatin(s.feedback_ar)}
        {s.corrected_en ? (
          <><br /><span className="expr-code is-good" dir="ltr" style={{ marginTop: 8 }}>{s.corrected_en}</span></>
        ) : null}
      </div>
    </div>
  )
}
