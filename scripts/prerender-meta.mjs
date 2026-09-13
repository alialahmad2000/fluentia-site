/**
 * prerender-meta — bake per-route social/SEO meta into static HTML files.
 *
 * WHY: fluentia-site is a client-rendered Vite SPA. react-helmet-async sets the
 * head correctly for humans, but WhatsApp / X / Telegram / LinkedIn crawlers do
 * not execute JavaScript — they only ever saw index.html, which carried no
 * description at all, so WhatsApp scraped a stray HTML comment and printed it
 * as the link preview.
 *
 * HOW: after `vite build`, for every route in src/content/seo.js we write a copy
 * of dist/index.html whose SOCIAL_META block holds that route's real tags.
 * vercel.json carries an explicit rewrite per route (/level-test → /level-test.html,
 * kept in sync by scripts/sync-vercel-rewrites.mjs) ahead of the SPA catch-all, so
 * GET /level-test serves dist/level-test.html; the bundle is identical, React
 * boots as usual, and Helmet adopts the baked tags (they carry data-rh) rather
 * than duplicating them. Unlisted routes still fall through to dist/index.html,
 * which keeps the homepage block — a correct brand preview, never a comment.
 *
 * Run: npm run build  (wired as the postbuild half of the build script)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ARTICLES } from "../src/content/articles.js";
import { PRERENDER_ROUTES, articleSeo, resolveSeo } from "../src/content/seo.js";
import { expectedRewrites } from "./sync-vercel-rewrites.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const START = "<!-- SOCIAL_META:START";
const END = "<!-- SOCIAL_META:END -->";

/** Escape for an HTML double-quoted attribute value. */
const attr = (v) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Escape for HTML text content (<title>). */
const text = (v) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function metaBlock(seo) {
  const lines = [
    `<!-- SOCIAL_META:START — generated for ${seo.path} by scripts/prerender-meta.mjs. Do not hand-edit. -->`,
    `<title>${text(seo.title)}</title>`,
    `<meta data-rh="true" name="description" content="${attr(seo.description)}" />`,
  ];
  if (seo.keywords) {
    lines.push(`<meta data-rh="true" name="keywords" content="${attr(seo.keywords)}" />`);
  }
  lines.push(
    `<link data-rh="true" rel="canonical" href="${attr(seo.url)}" />`,
    `<meta data-rh="true" property="og:type" content="${attr(seo.ogType)}" />`,
    `<meta data-rh="true" property="og:url" content="${attr(seo.url)}" />`,
    `<meta data-rh="true" property="og:title" content="${attr(seo.ogTitle)}" />`,
    `<meta data-rh="true" property="og:description" content="${attr(seo.ogDescription)}" />`,
    `<meta data-rh="true" name="twitter:url" content="${attr(seo.url)}" />`,
    `<meta data-rh="true" name="twitter:title" content="${attr(seo.twTitle)}" />`,
    `<meta data-rh="true" name="twitter:description" content="${attr(seo.twDescription)}" />`,
    END,
  );
  // First line inherits the indentation already sitting before the marker.
  return lines.join("\n    ");
}

const HOME_LD_START = "<!-- HOME_JSONLD:START";
const HOME_LD_END = "<!-- HOME_JSONLD:END -->";

/** Homepage-only JSON-LD (Courses, Service, FAQPage, BreadcrumbList) stays on
 *  "/" and is cut from every other route, where it would describe content that
 *  page does not show — Google treats that as misleading structured data. */
function scopeHomeJsonLd(html, path) {
  if (path === "/") return html;
  const start = html.indexOf(HOME_LD_START);
  const end = html.indexOf(HOME_LD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("HOME_JSONLD markers missing from dist/index.html — did index.html get edited?");
  }
  return html.slice(0, start) + html.slice(end + HOME_LD_END.length);
}

function inject(html, seo) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      "SOCIAL_META markers missing from dist/index.html — did index.html get edited?",
    );
  }
  const withMeta = html.slice(0, start) + metaBlock(seo) + html.slice(end + END.length);
  return scopeHomeJsonLd(withMeta, seo.path);
}

/** /level-test → dist/level-test.html ; /partners/terms → dist/partners/terms.html */
function outFile(path) {
  if (path === "/") return join(DIST, "index.html");
  return join(DIST, `${path.replace(/^\//, "")}.html`);
}

// A prerendered file nobody routes to is invisible: fail loudly instead of
// silently shipping the homepage preview on a route that has its own copy.
const vercelConfig = JSON.parse(await readFile(join(ROOT, "vercel.json"), "utf8"));
if (JSON.stringify(vercelConfig.rewrites) !== JSON.stringify(expectedRewrites())) {
  throw new Error(
    "vercel.json rewrites are out of sync with the prerendered routes.\n" +
      "Run `npm run sync:rewrites` and commit vercel.json.",
  );
}

const indexPath = join(DIST, "index.html");
const template = await readFile(indexPath, "utf8");

const targets = [
  ...PRERENDER_ROUTES.map((path) => resolveSeo(path)),
  ...ARTICLES.map((article) => articleSeo(article)),
];

let written = 0;
for (const seo of targets) {
  const file = outFile(seo.path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, inject(template, seo), "utf8");
  written += 1;
  console.log(`  ✓ ${seo.path.padEnd(28)} → ${file.replace(`${ROOT}/`, "")}`);
}

console.log(`prerender-meta: ${written} route${written === 1 ? "" : "s"} written`);
