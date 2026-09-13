import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { TourBar, RoomIntro, TourEnd } from '../../shell/TourChrome'
import './lms.generated.css'
import './tour-expressions.css'
import ProverbHall from './ProverbHall'
import IdiomLab from './IdiomLab'
import ProverbSheet from './ProverbSheet'
import IdiomSheet from './IdiomSheet'
import { ITEMS, ROOM_PATH } from './visitor'

/**
 * Room «الأمثال والتعابير».
 *
 *   /tour/expressions                 the proverb hall, then the idiom lab
 *   /tour/expressions/proverb/:slug   the proverb sheet (guess first, then the twin)
 *   /tour/expressions/idiom/:slug     the idiom sheet (the lie, the truth, the frame)
 *
 * Every surface is the platform's own component over a static snapshot of
 * four real specimens; nothing here reads or writes Supabase or calls a grader.
 */
function Landing() {
  return (
    <>
      <RoomIntro slug="expressions">
        نصفان، ولكلٍّ منهما سرّه: المثل الإنجليزي له توأم عربي تعرفه من قبل، والتعبير الاصطلاحي تكذب كلماته عمداً.
        افتح أي بطاقة لترى الورقة كاملة كما يدرسها طلابنا: تخمّن أولاً، ثم تسمع وتجرّب.
      </RoomIntro>
      <ProverbHall />
      <IdiomLab />
    </>
  )
}

function SheetRoute({ kind }) {
  const { slug } = useParams()
  const item = ITEMS.find((x) => x.kind === kind && x.slug === slug)
  if (!item) return <Navigate to={ROOM_PATH} replace />
  const Sheet = kind === 'proverb' ? ProverbSheet : IdiomSheet
  // Keyed on the slug: moving between two sheets of the same kind starts the
  // next one fresh (no carried-over pick or reveal), as the platform's reset effect does.
  return <Sheet key={item.slug} item={item} />
}

export default function Room() {
  return (
    <>
      <TourBar slug="expressions" />
      <div className="tour-expr" dir="rtl">
        <Routes>
          <Route index element={<Landing />} />
          <Route path="proverb/:slug" element={<SheetRoute kind="proverb" />} />
          <Route path="idiom/:slug" element={<SheetRoute kind="idiom" />} />
          <Route path="*" element={<Navigate to={ROOM_PATH} replace />} />
        </Routes>
      </div>
      <TourEnd slug="expressions" />
    </>
  )
}
