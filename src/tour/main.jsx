import { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "@fontsource/alexandria/500.css";
import "@fontsource/alexandria/700.css";
import "./shell/shell.css";
import Hub from "./Hub";
import { captureAttribution } from "../lib/attribution";
import { installWhatsAppClickTracking } from "../lib/track";

/**
 * /tour — a walk through the real student platform, from outside.
 * Every room renders the platform's own components over a snapshot of real
 * content; nothing here talks to Supabase, and nothing is written anywhere.
 */
const ROOM_MODULES = {
  unit: lazy(() => import("./rooms/unit/index.jsx")),
  grammar: lazy(() => import("./rooms/grammar/index.jsx")),
  expressions: lazy(() => import("./rooms/expressions/index.jsx")),
  verbs: lazy(() => import("./rooms/verbs/index.jsx")),
  library: lazy(() => import("./rooms/library/index.jsx")),
};

// Same boot as the main site (src/main.jsx): remember where the visitor came
// from, and count every WhatsApp tap (CTAs carry data-cta).
captureAttribution();
installWhatsAppClickTracking();

/** Each room change starts at the top and counts as a page view, the way the
 *  main site's router reports its routes to GA4 (src/App.jsx AppRoutes). */
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      window.gtag?.("config", "G-19G2SJ1WYL", { page_path: pathname });
    } catch {
      /* analytics only */
    }
  }, [pathname]);
  return null;
}

const Loading = <div className="tour-loading" aria-hidden />;

ReactDOM.createRoot(document.getElementById("tour-root")).render(
  <BrowserRouter>
    <RouteEffects />
    <Routes>
      <Route path="/tour" element={<Hub />} />
      {Object.entries(ROOM_MODULES).map(([slug, Room]) => (
        <Route
          key={slug}
          path={`/tour/${slug}/*`}
          element={
            <Suspense fallback={Loading}>
              <Room />
            </Suspense>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/tour" replace />} />
    </Routes>
  </BrowserRouter>
);
