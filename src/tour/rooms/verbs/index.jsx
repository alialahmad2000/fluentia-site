import { useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { TourBar, RoomIntro, TourEnd } from '../../shell/TourChrome'
import './lms.generated.css'
import './verbLadder.css'
import './tour-verbs.css'
import VocabShell from './VocabShell'
import VerbRoom from './VerbRoom'
import VerbLadder from './VerbLadder'
import VerbSession from './VerbSession'
import VerbAtlas from './VerbAtlas'
import SessionSummary from './SessionSummary'
import { VERBS, FAMILIES, CATALOGUE_TOTAL, DEMO_QUEUE, singleVerbQueue } from './sample'

/**
 * /tour/verbs — «سُلّم الأفعال الشاذة», the irregular-verb ladder.
 *
 *   /tour/verbs           the ladder home (a labelled example of progress)
 *   /tour/verbs/session   a real five-rung session, graded client-side
 *   /tour/verbs/atlas     the atlas, with the i-a-u family's verbs
 *
 * The only state is this visit's: which verbs the visitor answered, so the
 * atlas dots can say so. Nothing is stored or sent.
 */
export default function Room() {
  // verb id → { mastery } for THIS visit, derived with the platform's own rule:
  // any graded attempt → «قيد التعلّم»; a correct blind answer → «راسخ».
  const [cards, setCards] = useState({})
  const onAttempt = useCallback(({ verb, drill, ok }) => {
    setCards((c) => {
      const was = c[verb.id]?.mastery
      const mastery = was === 'solid' || (drill === 'blind' && ok) ? 'solid' : 'learning'
      return { ...c, [verb.id]: { mastery } }
    })
  }, [])

  return (
    <>
      <TourBar slug="verbs" />
      <Routes>
        <Route
          index
          element={
            <>
              <RoomIntro slug="verbs">
                جلسة قصيرة من سُلّم الأفعال: خمسة أفعال، كلٌّ منها على درجة مختلفة من السُلّم.
                تكتب التصريفات بنفسك، وإن أخطأت فالمنصة تسمّي خطأك بالاسم ولا تكتفي بالدرجة.
              </RoomIntro>
              <VerbLadder families={FAMILIES} total={CATALOGUE_TOTAL} />
            </>
          }
        />
        <Route path="session" element={<SessionRoute onAttempt={onAttempt} />} />
        <Route
          path="atlas"
          element={<VerbAtlas verbs={VERBS} families={FAMILIES} cards={cards} total={CATALOGUE_TOTAL} />}
        />
        <Route path="*" element={<Navigate to="/tour/verbs" replace />} />
      </Routes>
      <TourEnd slug="verbs" />
    </>
  )
}

/* A run's new first screen starts at the top of the room — but only scroll
   when that top has actually left the viewport under the tour bar. */
function revealTop() {
  requestAnimationFrame(() => {
    const bar = document.querySelector('.tour-bar')
    const root = document.querySelector('.vl-shell-session')
    if (!root) return
    const top = root.getBoundingClientRect().top
    const barH = bar ? bar.getBoundingClientRect().height : 0
    if (top < barH) window.scrollTo({ top: window.scrollY + top - barH, behavior: 'auto' })
  })
}

function SessionRoute({ onAttempt }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const one = params.get('verb')
  const queue = useMemo(() => (one ? singleVerbQueue(one) : null) || DEMO_QUEUE, [one])
  const [run, setRun] = useState(0)
  const [summary, setSummary] = useState(null)
  const [lastKey, setLastKey] = useState(one)

  // a different verb (or the full session) is a fresh run
  if (lastKey !== one) {
    setLastKey(one)
    setSummary(null)
    setRun((r) => r + 1)
  }

  return (
    <VocabShell room={<VerbRoom />} className="vl-pure vl-shell-session">
      <div className="vl-col">
        {summary ? (
          <SessionSummary
            summary={summary}
            onAgain={() => { setSummary(null); setRun((r) => r + 1); revealTop() }}
          />
        ) : (
          <VerbSession
            key={`${one || 'demo'}-${run}`}
            queue={queue}
            onAttempt={onAttempt}
            onDone={(tally) => { setSummary(tally); revealTop() }}
            onExit={() => navigate('/tour/verbs')}
          />
        )}
      </div>
    </VocabShell>
  )
}
