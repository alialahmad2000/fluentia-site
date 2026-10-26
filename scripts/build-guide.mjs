/**
 * build-guide — «دليل طلاقة», the Knowledge Hub at /guide/, plus the machine files.
 *
 * WHY: AI assistants (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot…) mostly do
 * not run JavaScript, and they recommend whoever publishes concrete, quotable
 * facts. So the hub is plain static HTML — no bundle, no hydration — generated
 * from ONE markdown file per page in content/guide/. From the same files:
 *
 *   dist/guide/<slug>.html   the page (index.md → dist/guide/index.html = /guide/)
 *   dist/guide/<slug>.md     a markdown mirror (llms.txt links these)
 *   dist/en/about.html       the English facts page (slug "en/about")
 *   dist/llms.txt            key facts + every page, one line each
 *   dist/llms-full.txt       key facts + every page in full
 *   dist/sitemap.xml         public/sitemap.xml + one <url> per page
 *
 * Facts come only from docs/seo/FACTS.md. Prices are read from the homepage's
 * pricing source (src/pages/landing-v2/content.js) for the JSON-LD, so schema can
 * never quote a price the homepage does not show. No cloaking: every page is
 * linked from the site footer and the sitemap, and humans get the same HTML.
 *
 * The build FAILS on: a missing frontmatter key, a `related` slug that does not
 * exist, a forbidden word in our own voice, JSON-LD that does not parse, or the
 * index.html Organization block drifting from scripts/guide/org.mjs.
 *
 * Run: npm run build (last step). Standalone: node scripts/build-guide.mjs
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DISAMBIGUATION_AR,
  DISAMBIGUATION_EN,
  EMAIL,
  ORG_ID,
  ORG_LD,
  PROFILES,
  SITE,
  WA_DISPLAY,
  WA_NUMBER,
  coursesLd,
  packages,
} from "./guide/org.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "guide");
const DIST = join(ROOT, "dist");
const OG_GUIDE = `${SITE}/og/guide.jpg`;

const REQUIRED = ["slug", "order", "section", "title", "description", "h1", "crumb", "summary", "datePublished", "dateModified", "related"];
const SECTIONS = {
  core: "أساسيات أكاديمية طلاقة",
  intent: "حسب هدفك من الإنجليزي",
  decision: "قبل أن تختار",
  learn: "تعلّم بنفسك",
  trust: "الثقة والتواصل",
};
// Our voice never uses these (Ali's brand rules). They may appear only inside a
// heading or FAQ question that quotes how people search («هل … معهد معتمد؟»).
const FORBIDDEN = [/معهد/, /دورة/, /دورات/, /مذهل/, /مميز/, /استثنائي/, /الأفضل/, /حبيبتي/, /كلاس تجريبي/, /فلون/, /فلوين/];

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fail(msg) {
  throw new Error(`build-guide: ${msg}`);
}

// ── parsing ──────────────────────────────────────────────────────────────────

function parseFile(name, raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) fail(`${name}: no frontmatter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i === -1) fail(`${name}: bad frontmatter line «${line}»`);
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).replace(/\s+#\s.*$/, "").trim();
    if (/^".*"$/.test(value)) value = value.slice(1, -1);
    fm[key] = value;
  }
  for (const k of REQUIRED) if (!fm[k] && fm[k] !== "0") fail(`${name}: frontmatter is missing «${k}»`);
  if (!SECTIONS[fm.section]) fail(`${name}: unknown section «${fm.section}»`);
  const page = {
    file: name,
    slug: fm.slug,
    order: Number(fm.order),
    section: fm.section,
    title: fm.title,
    description: fm.description,
    h1: fm.h1,
    crumb: fm.crumb,
    summary: fm.summary,
    datePublished: fm.datePublished,
    dateModified: fm.dateModified,
    related: fm.related.split(",").map((s) => s.trim()).filter(Boolean),
    cta: fm.cta === "private" ? "private" : "home",
    howto: fm.howto === "true",
    faqAll: fm.faqAll === "true",
    lang: fm.lang === "en" ? "en" : "ar",
    body: m[2].replace(/\r/g, "").trim(),
  };
  page.path = page.slug === "index" ? "/guide/" : page.slug.startsWith("en/") ? `/${page.slug}` : `/guide/${page.slug}`;
  page.url = `${SITE}${page.path}`;
  page.mdPath = page.slug === "index" ? "/guide/index.md" : `${page.path}.md`;
  return page;
}

/** Markdown subset → blocks. Kept deliberately small: the content is ours. */
function blocks(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    let m;
    if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      out.push({ type: m[1].length === 2 ? "h2" : "h3", text: m[2].trim() });
      i += 1;
    } else if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|\s*$/g, "").split("|").map((c) => c.trim());
      const body = rows.filter((r) => !/^\|\s*:?-{2,}/.test(r)).map(cells);
      out.push({ type: "table", head: body[0], rows: body.slice(1) });
    } else if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push({ type: "callout", text: buf.join(" ") });
    } else if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      out.push({ type: "ul", items });
    } else if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+[.)]\s+/, ""));
      out.push({ type: "ol", items });
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|\||>|[-*]\s|\d+[.)]\s)/.test(lines[i])) buf.push(lines[i++].trim());
      out.push({ type: "p", text: buf.join(" ") });
    }
  }
  return out;
}

const plain = (s) =>
  String(s)
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .trim();

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // The brand in Latin inside Arabic: one isolated, unbroken run, or a line
  // wrap splits it and the bidi algorithm flips the parentheses.
  out = out.replace(/\(Fluentia Academy\)/g, '<bdi class="nw">(Fluentia Academy)</bdi>');
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
    const h = href.replace(/&amp;/g, "&");
    const ext = /^https?:\/\//.test(h) && !h.startsWith(SITE);
    return `<a href="${esc(h)}"${ext ? ' rel="noopener" target="_blank"' : ""}>${t}</a>`;
  });
  return out;
}

const FAQ_HEADINGS = /^(أسئلة شائعة|الأسئلة الشائعة|Frequently asked questions|FAQ)$/i;

/** FAQ = the ### items of the last «أسئلة شائعة» h2 (or of every h2, for faqAll). */
function extractFaq(page, bl) {
  const faq = [];
  let start = -1;
  if (page.faqAll) start = bl.findIndex((b) => b.type === "h2");
  else for (let k = bl.length - 1; k >= 0; k -= 1) if (bl[k].type === "h2" && FAQ_HEADINGS.test(bl[k].text)) { start = k; break; }
  if (start === -1) return faq;
  let cur = null;
  for (let k = start; k < bl.length; k += 1) {
    const b = bl[k];
    if (b.type === "h2") {
      if (!page.faqAll && k !== start) break;
      cur = null;
      continue;
    }
    if (b.type === "h3") {
      cur = { q: plain(b.text), a: [] };
      faq.push(cur);
    } else if (cur) {
      if (b.type === "p" || b.type === "callout") cur.a.push(plain(b.text));
      else if (b.type === "ul" || b.type === "ol") cur.a.push(b.items.map(plain).join("؛ "));
    }
  }
  return faq.filter((f) => f.a.length).map((f) => ({ q: f.q, a: f.a.join(" ") }));
}

function extractHowto(bl) {
  const start = bl.findIndex((b) => b.type === "h2" && /^خطوات/.test(b.text));
  if (start === -1) return null;
  const steps = [];
  let cur = null;
  for (let k = start + 1; k < bl.length && bl[k].type !== "h2"; k += 1) {
    const b = bl[k];
    if (b.type === "h3") { cur = { name: plain(b.text).replace(/^\d+[.)]\s*/, ""), text: [] }; steps.push(cur); }
    else if (cur && b.type === "p") cur.text.push(plain(b.text));
    else if (cur && (b.type === "ul" || b.type === "ol")) cur.text.push(b.items.map(plain).join("؛ "));
  }
  return { name: plain(bl[start].text), steps: steps.filter((s) => s.text.length) };
}

// ── rendering ────────────────────────────────────────────────────────────────

function renderBlocks(bl, toc) {
  let h2n = 0;
  return bl
    .map((b) => {
      switch (b.type) {
        case "h2": {
          h2n += 1;
          const id = `s${h2n}`;
          toc.push({ id, text: plain(b.text) });
          return `<h2 id="${id}">${inline(b.text)}</h2>`;
        }
        case "h3": return `<h3>${inline(b.text)}</h3>`;
        case "p": return `<p>${inline(b.text)}</p>`;
        case "callout": return `<aside class="note"><p>${inline(b.text)}</p></aside>`;
        case "ul": return `<ul>${b.items.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`;
        case "ol": return `<ol>${b.items.map((x) => `<li>${inline(x)}</li>`).join("")}</ol>`;
        case "table":
          return `<div class="table"><table><thead><tr>${b.head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c, ci) => (ci === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join("")}</tr>`)
            .join("")}</tbody></table></div>`;
        default: return "";
      }
    })
    .join("\n");
}

const dateText = (iso, lang) => {
  const [y, m, d] = iso.split("-").map(Number);
  return lang === "en" ? `${EN_MONTHS[m - 1]} ${d}, ${y}` : `${d} ${AR_MONTHS[m - 1]} ${y}`;
};

function bookingLinks(page) {
  const campaign = encodeURIComponent(page.slug.replace("/", "-"));
  const site = page.cta === "private" ? "/private" : "/";
  const bookHref = `${site}?utm_source=guide&utm_campaign=${campaign}`;
  const waText =
    page.cta === "private"
      ? `السلام عليكم، أبي أحجز استشارة للتدريب الفردي\nالمصدر: دليل طلاقة · ${page.slug}`
      : `السلام عليكم، أبي أحجز لقاء مبدئي مجاني\nالمصدر: دليل طلاقة · ${page.slug}`;
  return { bookHref, waHref: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}` };
}

function ctaBox(page) {
  const { bookHref, waHref } = bookingLinks(page);
  if (page.lang === "en") {
    return `<section class="cta" aria-labelledby="cta-h">
  <h2 id="cta-h">Start with a free initial meeting</h2>
  <p>Every package at Fluentia Academy starts with a free, no-commitment initial meeting with a trainer — level, goal and schedule first, payment only after the learner is sure the package fits.</p>
  <div class="cta-row"><a class="btn" href="${esc(bookHref)}">Book the free initial meeting</a><a class="btn btn--ghost" href="${esc(waHref)}">WhatsApp ${WA_DISPLAY}</a></div>
</section>`;
  }
  const lead = page.cta === "private"
    ? "يبدأ التدريب الفردي بحجز استشارة، ويتواصل فريق الأكاديمية على واتساب خلال ساعات. في اللقاء المبدئي المجاني يُتّفق على الهدف وعدد الحصص الأسبوعية، ومنه يتحدد السعر الشهري — بلا دفع قبل الاقتناع."
    : "كل باقة في أكاديمية طلاقة تبدأ بلقاء مبدئي مجاني مع المدرّب: نعرف المستوى والهدف والوقت، ونرشّح المسار والباقة المناسبة — ولا دفع قبل التأكد أن الباقة مناسبة.";
  const label = page.cta === "private" ? "حجز استشارة التدريب الفردي" : "حجز اللقاء المبدئي المجاني";
  return `<section class="cta" aria-labelledby="cta-h">
  <h2 id="cta-h">${page.cta === "private" ? "الخطوة الأولى: حجز استشارة" : "الخطوة الأولى: لقاء مبدئي مجاني"}</h2>
  <p>${lead}</p>
  <div class="cta-row"><a class="btn" href="${esc(bookHref)}">${label}</a><a class="btn btn--ghost" href="${esc(waHref)}"><span>واتساب <bdi>${WA_DISPLAY}</bdi></span></a></div>
</section>`;
}

function hubList(pages, current) {
  const groups = Object.entries(SECTIONS)
    .map(([key, name]) => {
      const items = pages.filter((p) => p.section === key && p.slug !== "index" && p.lang === "ar").sort((a, b) => a.order - b.order);
      if (!items.length) return "";
      return `<section class="hub-group" aria-labelledby="g-${key}"><h2 id="g-${key}">${name}</h2><ul class="cards">${items
        .map((p) => `<li><a class="card${p === current ? " is-current" : ""}" href="${p.path}"><span class="card-t">${esc(p.h1)}</span><span class="card-s">${esc(p.summary)}</span></a></li>`)
        .join("")}</ul></section>`;
    })
    .join("\n");
  return groups;
}

function relatedList(page, bySlug) {
  const items = page.related.map((s) => bySlug.get(s)).filter(Boolean);
  if (!items.length) return "";
  const head = page.lang === "en" ? "Related pages" : "صفحات ذات صلة";
  return `<nav class="related" aria-labelledby="rel-h"><h2 id="rel-h">${head}</h2><ul class="cards">${items
    .map((p) => `<li><a class="card" href="${p.path}"><span class="card-t">${esc(p.h1)}</span><span class="card-s">${esc(p.summary)}</span></a></li>`)
    .join("")}</ul></nav>`;
}

function jsonLd(page, faq, howto, pages) {
  const hub = pages.find((p) => p.slug === "index");
  const crumbs = [
    { name: page.lang === "en" ? "Home" : "الرئيسية", item: `${SITE}/` },
    ...(page.slug === "index" || page.lang === "en" ? [] : [{ name: "دليل طلاقة", item: hub.url }]),
    { name: page.crumb, item: page.url },
  ];
  const out = [
    ORG_LD,
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${page.url}#article`,
      headline: page.h1,
      name: page.title,
      description: page.description,
      inLanguage: page.lang === "en" ? "en" : "ar",
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      mainEntityOfPage: page.url,
      image: OG_GUIDE,
      isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: "أكاديمية طلاقة" },
      about: { "@id": ORG_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, n) => ({ "@type": "ListItem", position: n + 1, name: c.name, item: c.item })),
    },
  ];
  if (faq.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  if (howto && howto.steps.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.h1,
      description: page.description,
      inLanguage: "ar",
      step: howto.steps.map((s, n) => ({ "@type": "HowToStep", position: n + 1, name: s.name, text: s.text.join(" ") })),
    });
  }
  if (page.slug === "pricing") out.push(...coursesLd(page.url));
  return out.map((o) => {
    const s = JSON.stringify(o).replace(/</g, "\\u003c");
    JSON.parse(s); // must round-trip
    return `<script type="application/ld+json">${s}</script>`;
  });
}

const CSS = await readFile(join(ROOT, "scripts", "guide", "guide.css"), "utf8");

function renderPage(page, pages, bySlug) {
  const bl = blocks(page.body);
  if (!bl.length || bl[0].type !== "p") fail(`${page.file}: the page must open with the answer paragraph`);
  const faq = extractFaq(page, bl);
  if (page.slug !== "index" && !faq.length) fail(`${page.file}: no FAQ found (## أسئلة شائعة → ### questions)`);
  const howto = page.howto ? extractHowto(bl) : null;
  if (page.howto && (!howto || !howto.steps.length)) fail(`${page.file}: howto: true but no «## خطوات…» section with ### steps`);
  const toc = [];
  const [lead, ...rest] = bl;
  const bodyHtml = renderBlocks(rest, toc);
  const en = page.lang === "en";
  const dir = en ? "ltr" : "rtl";
  const enAlt = bySlug.get("en/about");
  const arAbout = bySlug.get("about");
  const alternates = [];
  if (page.slug === "about" && enAlt) alternates.push(`<link rel="alternate" hreflang="en" href="${enAlt.url}">`);
  if (page.slug === "en/about" && arAbout) alternates.push(`<link rel="alternate" hreflang="ar-SA" href="${arAbout.url}">`);
  alternates.unshift(`<link rel="alternate" hreflang="${en ? "en" : "ar-SA"}" href="${page.url}">`);
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${page.slug === "en/about" && arAbout ? arAbout.url : page.url}">`);

  const crumbHtml = en
    ? `<a href="/">Fluentia Academy</a><span aria-hidden="true">›</span><span aria-current="page">${esc(page.crumb)}</span>`
    : page.slug === "index"
      ? `<a href="/">الرئيسية</a><span aria-hidden="true">‹</span><span aria-current="page">دليل طلاقة</span>`
      : `<a href="/">الرئيسية</a><span aria-hidden="true">‹</span><a href="/guide/">دليل طلاقة</a><span aria-hidden="true">‹</span><span aria-current="page">${esc(page.crumb)}</span>`;

  const tocHtml = toc.length >= 4 && page.slug !== "index"
    ? `<nav class="toc" aria-labelledby="toc-h"><h2 id="toc-h">${en ? "On this page" : "في هذه الصفحة"}</h2><ol>${toc
        .map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`)
        .join("")}</ol></nav>`
    : "";

  const updated = en ? `Last updated: <time datetime="${page.dateModified}">${dateText(page.dateModified, "en")}</time>` : `آخر تحديث: <time datetime="${page.dateModified}">${dateText(page.dateModified, "ar")}</time>`;
  const hub = page.slug === "index" ? hubList(pages, page) : "";
  const ld = jsonLd(page, faq, howto, pages);

  const footerGuide = pages
    .filter((p) => p.lang === "ar" && p.slug !== "index" && p.section === "core")
    .sort((a, b) => a.order - b.order)
    .map((p) => `<li><a href="${p.path}">${esc(p.crumb)}</a></li>`)
    .join("");

  const html = `<!doctype html>
<html lang="${en ? "en" : "ar"}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${page.url}">
${alternates.join("\n")}
<link rel="alternate" type="text/markdown" href="${page.mdPath}" title="Markdown">
<meta name="theme-color" content="#0a1020">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/brand/app-tile-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/brand/app-tile-180.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="أكاديمية طلاقة — Fluentia Academy">
<meta property="og:locale" content="${en ? "en_US" : "ar_SA"}">
<meta property="og:url" content="${page.url}">
<meta property="og:title" content="${esc(page.h1)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${OG_GUIDE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="أكاديمية طلاقة (Fluentia Academy) — أكاديمية سعودية لتعليم الإنجليزي أونلاين">
<meta property="article:published_time" content="${page.datePublished}">
<meta property="article:modified_time" content="${page.dateModified}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.h1)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${OG_GUIDE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preload" href="/fonts/kufam-800-arabic.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
${ld.join("\n")}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-19G2SJ1WYL"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-19G2SJ1WYL');</script>
</head>
<body>
<header class="top wrap">
  <a class="brand" href="/"><img src="/brand/app-tile-96.png" width="32" height="32" alt=""><span>${en ? "Fluentia Academy" : "أكاديمية طلاقة"}</span></a>
  <a class="top-link" href="${en ? "/guide/" : "/"}">${en ? "دليل طلاقة (Arabic)" : "الموقع الرئيسي"}</a>
</header>
<main class="wrap">
  <nav class="crumbs" aria-label="${en ? "Breadcrumb" : "مسار التنقل"}">${crumbHtml}</nav>
  <article class="doc">
    <header class="doc-head">
      ${page.slug === "index" ? "" : `<p class="eyebrow">${en ? "Fluentia Academy · fact sheet" : `دليل طلاقة · ${SECTIONS[page.section]}`}</p>`}
      <h1>${esc(page.h1)}</h1>
      <p class="updated">${updated}</p>
    </header>
    <p class="lead">${inline(lead.text)}</p>
    ${tocHtml}
    <div class="prose">
${bodyHtml}
    </div>
    ${hub}
  </article>
  ${page.slug === "index" ? "" : ctaBox(page)}
  ${page.slug === "index" ? ctaBox(page) : relatedList(page, bySlug)}
</main>
<footer class="foot wrap">
  <div class="foot-col">
    <p class="foot-brand">أكاديمية طلاقة · Fluentia Academy</p>
    <p class="foot-note">${en ? esc(DISAMBIGUATION_EN) : esc(DISAMBIGUATION_AR)}</p>
    <p class="foot-contact"><a href="https://wa.me/${WA_NUMBER}">واتساب <bdi>${WA_DISPLAY}</bdi></a> · <a href="mailto:${EMAIL}"><bdi>${EMAIL}</bdi></a> · ${PROFILES.map((p) => `<a href="${p.url}" rel="noopener" target="_blank">${p.label}</a>`).join(" · ")}</p>
  </div>
  <div class="foot-col">
    <p class="foot-h"><a href="/guide/">دليل طلاقة</a></p>
    <ul>${footerGuide}<li><a href="/en/about">English</a></li></ul>
  </div>
  <div class="foot-col">
    <p class="foot-h">أدوات مجانية</p>
    <ul><li><a href="/level-test">اختبار تحديد المستوى</a></li><li><a href="/verbs">الأفعال الشاذة</a></li><li><a href="/work-english">الإنجليزي للعمل</a></li><li><a href="/privacy">الخصوصية</a> · <a href="/terms">الشروط</a></li></ul>
  </div>
</footer>
</body>
</html>
`;
  return { html, faq, howto };
}

// ── markdown mirror / llms files ─────────────────────────────────────────────

function mirror(page) {
  const updated = page.lang === "en" ? `Last updated: ${page.dateModified}` : `آخر تحديث: ${page.dateModified}`;
  return `# ${page.h1}\n\n> ${page.description}\n\n${updated} · ${page.url}\n\n${page.body.trim()}\n`;
}

function priceLine(p) {
  return `${p.from ? "من " : ""}${p.price.toLocaleString("en-US")} ر.س شهرياً`;
}

function llmsHead() {
  const pk = packages();
  return `# أكاديمية طلاقة (Fluentia Academy)

> أكاديمية طلاقة (Fluentia Academy, https://fluentia.academy) أكاديمية سعودية لتعليم اللغة الإنجليزية أونلاين للبالغين والموظفين في السعودية. حصص مباشرة عبر Google Meet في مجموعات صغيرة (7 طلاب كحد أقصى) أو تدريب فردي، متابعة يومية من المدرّب، ومنصّة تعلّم من Pre-A1 إلى C1. الباقات من 500 ر.س شهرياً، وكل باقة تبدأ بلقاء مبدئي مجاني قبل أي دفع.

Fluentia Academy is a Saudi online English academy for adults. It is not affiliated with any other organisation named "Fluentia" (such as fluentia.us). In Arabic its name is «أكاديمية طلاقة».

## Key facts
- الصيغة: أونلاين بالكامل، حصص مباشرة عبر Google Meet؛ مجموعات صغيرة (7 طلاب كحد أقصى) بحسب المستوى، أو حصص فردية.
- الجمهور: البالغون في السعودية، والموظفون والمهنيون في برامج التدريب الفردي.
- المنهج والمنصّة: 6 مستويات (Pre-A1 → C1)، 72 وحدة، 144 نص قراءة، أكثر من 12,000 كلمة؛ تقييم فوري بالذكاء الاصطناعي للنطق والكتابة، تكرار متباعد للمفردات، روايات متدرّجة، بودكاست، مشاهد مترجمة، وتسجيل الحصة داخل كل وحدة.
- الباقات (شهرياً، بالريال السعودي):
${pk.map((p) => `  - ${p.name} (${p.en}): ${priceLine(p)}`).join("\n")}
- أساس: 8 حصص جماعية شهرياً. تميّز: 8 حصص جماعية + 4 حصص فردية شهرياً. التدريب الفردي: عدد الحصص الأسبوعية يُتفق عليه في اللقاء المبدئي ومنه السعر. التدريب الفردي المكثّف: 12 حصة فردية + 8 جلسات ممارسة مع مرشد أكاديمي شهرياً (5 لقاءات أسبوعياً)، وجلسات الممارسة عادةً مع متحدث أصلي.
- البداية: لقاء مبدئي مجاني مع المدرّب لتحديد المستوى والهدف والوقت، بدون التزام. اختبار تحديد مستوى مجاني (26 سؤالاً تكيّفياً، نحو 10 دقائق): https://fluentia.academy/level-test
- الدفع شهري مقدماً بداية كل شهر ميلادي؛ لا التزام طويل؛ الإلغاء في أي وقت؛ استرداد كامل خلال 7 أيام من بداية الشهر إذا لم تُحضر أي حصة. لا ضمان لمستوى أو درجة IELTS محددة.
- التواصل: واتساب ${WA_DISPLAY} (https://wa.me/${WA_NUMBER}) · البريد ${EMAIL} · ${PROFILES.map((p) => `${p.label} ${p.url}`).join(" · ")}
`;
}

// ── main ─────────────────────────────────────────────────────────────────────

if (!existsSync(DIST)) fail("dist/ does not exist — run vite build first");

// index.html's static Organization block must equal ORG_LD.
{
  const indexHtml = await readFile(join(ROOT, "index.html"), "utf8");
  const m = indexHtml.match(/<!-- JSON-LD: Organization[^>]*-->\s*<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) fail("index.html lost its «JSON-LD: Organization» block");
  if (JSON.stringify(JSON.parse(m[1])) !== JSON.stringify(ORG_LD)) {
    fail("index.html's Organization JSON-LD differs from scripts/guide/org.mjs — paste `node -e \"import('./scripts/guide/org.mjs').then(m=>console.log(JSON.stringify(m.ORG_LD,null,2)))\"` into index.html");
  }
}

// …and its homepage Course blocks must be exactly the packages on sale.
{
  const indexHtml = await readFile(join(ROOT, "index.html"), "utf8");
  const ld = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const have = JSON.stringify(ld.filter((o) => o["@type"] === "Course"));
  if (have !== JSON.stringify(coursesLd(`${SITE}/`))) {
    fail("index.html's Course JSON-LD no longer matches the packages in src/pages/landing-v2/content.js — regenerate it from scripts/guide/org.mjs coursesLd()");
  }
}

const files = (await readdir(SRC)).filter((f) => f.endsWith(".md") && f !== "README.md");
const pages = [];
for (const f of files) pages.push(parseFile(f, await readFile(join(SRC, f), "utf8")));
pages.sort((a, b) => a.order - b.order);
const bySlug = new Map(pages.map((p) => [p.slug, p]));
if (!bySlug.has("index")) fail("content/guide/index.md is missing");

for (const p of pages) {
  for (const r of p.related) if (!bySlug.has(r)) fail(`${p.file}: related slug «${r}» does not exist`);
  // Our voice: forbidden words only inside headings (quoted search phrasing).
  p.body.split("\n").forEach((line, n) => {
    if (/^#{2,3}\s/.test(line)) return;
    for (const re of FORBIDDEN) if (re.test(plain(line))) fail(`${p.file}:${n + 1}: «${line.match(re)[0]}» is not in our voice — rewrite (allowed only in a quoted heading)`);
  });
  for (const k of ["title", "description", "h1", "summary"]) {
    for (const re of FORBIDDEN.slice(2)) if (re.test(p[k])) fail(`${p.file}: «${k}» uses «${p[k].match(re)[0]}»`);
  }
  if (p.lang === "ar" && !/طلاقة/.test(p.title)) fail(`${p.file}: title must contain «طلاقة»`);
  if (p.title.length > 65) console.warn(`  ! ${p.file}: title is ${p.title.length} chars (target ≤ 60)`);
  if (p.description.length < 110 || p.description.length > 170) console.warn(`  ! ${p.file}: description is ${p.description.length} chars (target 140–160)`);
}

const llmsFull = [llmsHead(), `\n_Last updated: ${pages.reduce((m, p) => (p.dateModified > m ? p.dateModified : m), "")}_\n`];
const sitemapUrls = [];
for (const page of pages) {
  const { html } = renderPage(page, pages, bySlug);
  const htmlFile = page.slug === "index" ? join(DIST, "guide", "index.html") : join(DIST, `${page.path.slice(1)}.html`);
  const mdFile = join(DIST, page.mdPath.slice(1));
  await mkdir(dirname(htmlFile), { recursive: true });
  await mkdir(dirname(mdFile), { recursive: true });
  await writeFile(htmlFile, html, "utf8");
  await writeFile(mdFile, mirror(page), "utf8");
  llmsFull.push(`\n---\n\n${mirror(page)}`);
  sitemapUrls.push({ loc: page.url, lastmod: page.dateModified, priority: page.slug === "index" || page.section === "core" ? "0.8" : "0.6" });
  console.log(`  ✓ ${page.path.padEnd(48)} ${Math.round(html.length / 1024)} kB`);
}

// llms.txt — the short index.
const list = (filter) =>
  pages
    .filter(filter)
    .map((p) => `- [${p.crumb}](${p.url}): ${p.summary} (markdown: ${SITE}${p.mdPath})`)
    .join("\n");
const llms = `${llmsHead()}
## دليل طلاقة — صفحات الحقائق
${list((p) => p.section === "core" || p.section === "trust")}

## حسب الهدف وقبل الاختيار
${list((p) => p.section === "intent" || p.section === "decision")}

## صفحات تعليمية
${list((p) => p.section === "learn")}

## Other pages on fluentia.academy
- [الصفحة الرئيسية والباقات](${SITE}/)
- [التدريب الفردي — /private](${SITE}/private)
- [اختبار تحديد المستوى المجاني](${SITE}/level-test)
- [جدول الأفعال الشاذة (${"191"} فعلاً، مع النطق)](${SITE}/verbs)
- [الإنجليزي للعمل — مصطلحات 11 مجالاً](${SITE}/work-english)
- [مقالات](${SITE}/articles)
- [من نحن](${SITE}/about) · [الخصوصية](${SITE}/privacy) · [الشروط](${SITE}/terms)
- [تطبيق طلاقة لأجهزة الماك](${SITE}/mac/)

## Optional
- [Full knowledge file — every guide page in one markdown file](${SITE}/llms-full.txt)
`;
await writeFile(join(DIST, "llms.txt"), llms, "utf8");
await writeFile(join(DIST, "llms-full.txt"), llmsFull.join(""), "utf8");

// sitemap.xml — append the hub.
const smPath = join(DIST, "sitemap.xml");
const sitemap = await readFile(smPath, "utf8");
if (!sitemap.includes("</urlset>")) fail("dist/sitemap.xml has no </urlset>");
const entries = sitemapUrls
  .filter((u) => !sitemap.includes(`<loc>${u.loc}</loc>`))
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join("\n");
await writeFile(smPath, sitemap.replace("</urlset>", `${entries}\n</urlset>`), "utf8");

console.log(`build-guide: ${pages.length} pages, llms.txt, llms-full.txt (${Math.round(llmsFull.join("").length / 1024)} kB), sitemap +${sitemapUrls.length}`);
