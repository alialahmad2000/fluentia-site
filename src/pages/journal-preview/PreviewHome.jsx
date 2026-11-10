import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../NotFound";
import { getDirection } from "../../content/journal/preview.js";

// One chunk per direction: opening one preview never downloads the other two.
const HOMES = {
  ink: lazy(() => import("./ink/Home")),
  dusk: lazy(() => import("./dusk/Home")),
  gallery: lazy(() => import("./gallery/Home")),
};
const BG = { ink: "#0e0b09", dusk: "#2a1433", gallery: "#0d0d0d" };

/** /journal/preview/:dir — that direction's journal home. */
export default function PreviewHome() {
  const { dir } = useParams();
  const direction = getDirection(dir);
  const Home = direction && HOMES[direction.id];
  if (!Home) return <NotFound />;
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: BG[direction.id] }} />}>
      <Home direction={direction} />
    </Suspense>
  );
}
