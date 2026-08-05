/**
 * sync-vercel-rewrites — keep vercel.json's rewrites in step with the routes
 * that scripts/prerender-meta.mjs bakes into static HTML.
 *
 * Each prerendered route needs an explicit rewrite to its .html file, placed
 * BEFORE the SPA catch-all. We do NOT use "cleanUrls": true for this: it makes
 * Vercel 404 every path that has no matching file (/w, /executive, …) instead of
 * falling through to the catch-all, which takes the SPA's own routes offline.
 *
 * Run: npm run sync:rewrites   (verified on every build by prerender-meta.mjs)
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ARTICLES } from "../src/content/articles.js";
import { PRERENDER_ROUTES } from "../src/content/seo.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(ROOT, "vercel.json");

/** Every route that has a static .html twin in dist/, "/" excluded (it IS index.html). */
export function prerenderedPaths() {
  return [
    ...PRERENDER_ROUTES.filter((p) => p !== "/"),
    ...ARTICLES.map((a) => `/articles/${a.slug}`),
  ];
}

/**
 * Vercel matches `source` against the RAW request path, and browsers/WhatsApp
 * send Arabic article slugs percent-encoded — so the source must be encoded too.
 * `destination` resolves against the build output, where the file keeps its
 * literal UTF-8 name.
 */
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

export function expectedRewrites() {
  return [
    ...prerenderedPaths().map((path) => ({
      source: encodePath(path),
      destination: `${path}.html`,
    })),
    { source: "/(.*)", destination: "/index.html" },
  ];
}

// Writing only happens when run directly — prerender-meta.mjs imports
// expectedRewrites() to CHECK the committed vercel.json, and a check that
// quietly repairs its own input would never fail.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = JSON.parse(await readFile(CONFIG, "utf8"));
  const expected = expectedRewrites();

  if (JSON.stringify(config.rewrites) === JSON.stringify(expected)) {
    console.log("sync-vercel-rewrites: already in sync");
  } else {
    config.rewrites = expected;
    await writeFile(CONFIG, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    console.log(`sync-vercel-rewrites: wrote ${expected.length} rewrites to vercel.json`);
  }
}
