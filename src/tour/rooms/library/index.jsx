import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TourBar, RoomIntro, TourEnd } from "../../shell/TourChrome";
import LibraryHome from "./pages/LibraryHome";
import LibraryBook from "./pages/LibraryBook";
import LibraryReader from "./pages/LibraryReader";
import snapshot from "./data/snapshot.json";
import "./lms.generated.css";
import "./library.css";
import "./library-tour.css";

/**
 * /tour/library — «مكتبة طلاقة», the platform's Midnight Reading Room.
 *   /tour/library                          the shelves (LibraryHome)
 *   /tour/library/the-wolf-winter          the book (LibraryBook)
 *   /tour/library/the-wolf-winter/read     the reader, cinema first (LibraryReader)
 * Components are ports of fluentia-lms src/features/library over a read-only
 * snapshot; the sticky reader chrome sits under the TourBar via --tour-bar-h.
 */
function useTourBarHeight() {
  const [h, setH] = useState(58);
  useLayoutEffect(() => {
    const bar = document.querySelector(".tour-bar");
    if (!bar) return;
    const read = () => setH(Math.round(bar.getBoundingClientRect().height));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);
  return h;
}

export default function Room() {
  const ref = useRef(null);
  const barH = useTourBarHeight();
  const slug = snapshot.book.slug;
  return (
    <div ref={ref} className="lib-tour-room" dir="rtl" style={{ "--tour-bar-h": `${barH}px` }}>
      <TourBar slug="library" />
      <Routes>
        <Route
          index
          element={
            <>
              <RoomIntro slug="library">
                روايات مصوّرة كُتبت لطلاقة بإنجليزية متدرّجة. افتح «شتاء الذئاب» واستمع إلى مطلع فصلها الأول بصوت الراوي والشخصيات، وسط أجواء الشتاء.
              </RoomIntro>
              <main className="lib-tour-main">
                <LibraryHome />
              </main>
            </>
          }
        />
        <Route path={slug} element={<main className="lib-tour-main lib-tour-plain"><LibraryBook /></main>} />
        <Route path={`${slug}/read`} element={<main className="lib-tour-main"><LibraryReader /></main>} />
        <Route path="*" element={<Navigate to="/tour/library" replace />} />
      </Routes>
      <TourEnd slug="library" />
    </div>
  );
}
