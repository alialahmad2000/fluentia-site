import { Helmet } from "react-helmet-async";
import { resolveSeo, normalizeSeo } from "../content/seo";

/**
 * <Seo /> — the runtime half of the meta pipeline.
 *
 * Emits exactly the same tag set that scripts/prerender-meta.mjs bakes into the
 * static HTML, so hydration adopts those tags (they carry data-rh) instead of
 * duplicating them. Copy lives in src/content/seo.js — never inline it here.
 *
 * og:image / twitter:image are deliberately NOT emitted here: they are invariant
 * across routes and live as plain (non-data-rh) tags in index.html, so Helmet
 * never touches them and they can never be duplicated or stripped.
 *
 * Usage:
 *   <Seo path="/level-test" />          — a route listed in PAGE_SEO
 *   <Seo entry={articleSeo(article)} /> — a data-driven page (articles)
 *   <Seo noindex />                     — preview/alias routes
 *
 * JSON-LD stays in the page, in its own <Helmet>; multiple Helmets compose.
 */
export default function Seo({ path, entry, noindex = false }) {
  if (noindex) {
    return (
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    );
  }

  const seo = entry ? normalizeSeo(entry) : resolveSeo(path);
  if (!seo) return null;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords ? <meta name="keywords" content={seo.keywords} /> : null}
      <link rel="canonical" href={seo.url} />

      <meta property="og:type" content={seo.ogType} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.ogTitle} />
      <meta property="og:description" content={seo.ogDescription} />

      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.twTitle} />
      <meta name="twitter:description" content={seo.twDescription} />
    </Helmet>
  );
}
