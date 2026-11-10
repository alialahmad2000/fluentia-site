import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../NotFound";
import { getDirection } from "../../content/journal/preview.js";
import { getJournalArticle } from "../../content/journal/index.js";

const ARTICLES = {
  ink: lazy(() => import("./ink/Article")),
  dusk: lazy(() => import("./dusk/Article")),
  gallery: lazy(() => import("./gallery/Article")),
};
const BG = { ink: "#0e0b09", dusk: "#2a1433", gallery: "#0d0d0d" };

/** /journal/preview/:dir/:slug — any of the six articles, in that direction. */
export default function PreviewArticle() {
  const { dir, slug } = useParams();
  const direction = getDirection(dir);
  const article = getJournalArticle(slug);
  const Article = direction && ARTICLES[direction.id];
  if (!Article || !article) return <NotFound />;
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: BG[direction.id] }} />}>
      {/* key: a new article is a fresh page (scroll scenes, progress, share state). */}
      <Article key={article.slug} direction={direction} article={article} />
    </Suspense>
  );
}
