# AI-visibility / SEO audit — fluentia.academy (2026-10-27)

Phase A of `FLUENTIA-AI-VISIBILITY-SEO-GEO`. What was found, what this branch
changed, and what is left for Ali. Facts live in `FACTS.md`; open questions in
`NEEDS-ALI.md`.

## 1. Site map

- **Stack:** React 18 + Vite SPA, react-router-dom 7, react-helmet-async. Hosted on
  Cloudflare Pages (`fluentia-site`), push to `main` deploys.
- **Prerendering already exists** (since 2026-09-13): `npm run build` = vite build →
  SSR build (`src/entry-server.jsx`) → `scripts/prerender-meta.mjs`, which writes a
  full-HTML copy of every route in `PAGE_SEO` + every article + every work-English
  page (36 routes). Unknown paths → `404.html` (empty shell); client-only routes →
  explicit `_redirects` rewrites (`scripts/cloudflare-routing.mjs`).
- **Homepage `/`** = `NextLanding` (cinematic). `/join` = same component in campaign
  mode (TikTok landing, noindex). `/next` 301 → `/`.
- **Indexable:** `/`, `/start`, `/private`, `/level-test`, `/about`, `/articles` (+8),
  `/work-english` (+11), `/verbs`, `/partners`, `/partners/terms`, `/privacy`, `/terms`, `/tour`.
- **noindex previews / rollbacks** (prerendered, not in the sitemap): `/join`,
  `/classic`, `/join-classic`, `/ascent`, `/journey`. Client-only, robots-disallowed:
  `/v1`, `/v2`, `/v4`, `/v5`, `/aurora`, `/atelier`, `/cine`, `/cine2`, `/w`.
- **Static pages outside the SPA:** `/mac/` (public/mac/index.html).

## 2. Crawlability test (before this branch)

`curl -A "Mozilla/5.0 (compatible; <bot>)" https://fluentia.academy/`:

| Bot | HTTP | Bytes | `<h1>` in HTML | Challenge page |
|---|---|---|---|---|
| GPTBot | 200 | 138,861 | 1 | no |
| OAI-SearchBot | 200 | 138,861 | 1 | no |
| ChatGPT-User | 200 | 138,861 | 1 | no |
| PerplexityBot | 200 | 138,861 | 1 | no |
| ClaudeBot | 200 | 138,861 | 1 | no |
| bingbot | 200 | 138,861 | 1 | no |
| Googlebot | 200 | 138,861 | 1 | no |

The homepage HTML already carries prices (500 / 750 / 1,500 / from 2,000 / 3,000)
and the package contents. Live `robots.txt` is byte-identical to the repo's — Cloudflare's
"managed robots.txt" is **not** injecting AI disallows. A UA-spoofed curl cannot prove
Cloudflare's *verified-bot* rules (Block AI bots / Bot Fight Mode match on the real bot's
IP), and the API token here cannot read zone settings (403) → manual checklist.

## 3. Why AI assistants did not recommend the academy

1. **No quotable fact pages.** The facts existed only inside a cinematic sales page;
   there was no «كم الأسعار؟» / «ما هي أكاديمية طلاقة؟» / FAQ page that answers in
   one paragraph.
2. **Brand ambiguity in machine data.** Organization JSON-LD `name` was "Fluentia
   Academy" (English only), one `alternateName`, no `disambiguatingDescription` — next
   to an unrelated fluentia.us.
3. **Stale / contradictory structured data and llms files:**
   - JSON-LD and `llms.txt` still sold «طلاقة 1,200» (taken off sale 2026-10-04) as
     "most popular"; Course blocks described invented level syllabi ("present tenses,
     numbers…") with the founder as instructor (he stopped teaching 2026-09-21).
   - `llms.txt`: «15,000+ words» (site says 12,000+), «native-level Saudi trainers».
   - `foundingDate: 2021` vs /about «تأسست 23 مارس 2026».
4. **Homepage FAQ answers missing from the HTML.** The accordion rendered only the open
   answer, so 4 of the 5 answers that the FAQPage JSON-LD states were absent from the
   prerendered page (same on /private).

## 4. What this branch changes

| Change | Where |
|---|---|
| «دليل طلاقة» Knowledge Hub: 23 static HTML pages (no JS), one markdown source each | `content/guide/*.md` → `scripts/build-guide.mjs` → `dist/guide/`, `dist/en/about.html` |
| Markdown mirror per page | `dist/guide/<slug>.md` |
| `llms.txt` + `llms-full.txt` generated from the same files (were hand-written and stale) | `scripts/build-guide.mjs`; `public/llms*.txt` removed |
| Sitemap gets every hub page with `lastmod`; homepage lastmod bumped; `/mac/` added | `public/sitemap.xml` + build |
| Organization JSON-LD: Arabic name first, 4 alternate names, `disambiguatingDescription` (not fluentia.us), `knowsLanguage`, contact URL; no foundingDate; founder = "Founder" | `scripts/guide/org.mjs` = `index.html` (build fails on drift) |
| Homepage Course JSON-LD = the 5 packages on sale, prices read from `content.js`; Service catalog without «طلاقة» | `index.html` (build fails on drift) |
| Hub pages: Article + BreadcrumbList + FAQPage (visible text = schema text by construction) + HowTo (how-it-works) + Course/Offer (pricing) | `scripts/build-guide.mjs` |
| Own share image «أكاديمية طلاقة · FLUENTIA ACADEMY · SAUDI ARABIA» on every hub page; homepage `og:image:alt` / `og:site_name` name the academy in Arabic | `public/og/guide.jpg`, `index.html` |
| Closed FAQ answers stay in the markup (`<p hidden>`) → all 5 homepage answers (and /private's) are in the HTML | `src/pages/v1/V1Closing.jsx` |
| Homepage footer: «باختصار» summary paragraph + «دليل طلاقة» links (homepage only, not /join) ; «دليل طلاقة» in the site footer link list | `src/pages/next/Closing.jsx`, `content.js FOOTER.links` |
| robots.txt: + Perplexity-User, Claude-User, Applebot, MistralAI-User (same single group) + pointer to llms files | `public/robots.txt` |
| `Content-Type` for `.md` mirrors and llms files | `public/_headers` |
| AI-referral lead labels: ChatGPT / Perplexity / Gemini / Copilot / Claude / «دليل طلاقة · slug» / بحث جوجل / بحث Bing — one `sourceLabel()` used by every WhatsApp builder; referrer fallback stored per assistant (gemini.google.com no longer counted as Google organic) | `src/utils/tracking.js`, `src/lib/attribution.js`, `src/App.jsx`, `V1LeadModal`, `LeadFormModal`, `submitLead.js`, `track.js`, `WhatsAppRedirect.jsx` |

Not changed: page designs, heroes, ad landings, pixels, WhatsApp number, form fields.

## 5. Integrity issues found on existing pages (NOT changed here — Ali's call)

| Page | Claim | Problem |
|---|---|---|
| `/about` | «+14 طالب نشط»، «4.9★ تقييم الأكاديمية»، «+100 شهادة نجاح» | no source; a 4.9★ without published reviews is the same risk that got the fake `AggregateRating` removed on 2026-06-24 |
| `/about` | team: د. محمد شربات (beginner groups), هاجر (support); «المؤسس والمدرب الرئيسي» | staff changed since (Ali stopped teaching 09-21) |
| `/about` | «تأسست 23 مارس 2026» | contradicts «منذ 2021» elsewhere |
| `/start` | «⭐ 4.9 · +50 طالب · معتمدون رسمياً» | rating, count and "officially accredited" are unsourced |
| `/start` | «🌙 عرض عيد الأضحى المبارك — لفترة محدودة», «✓ كلاس تجريبي مجاني», still sells «طلاقة 1200» | stale offer; forbidden wording; off-sale package |
| `/` | heading «ست باقات» | five are on sale |
| `/` | «المحادثة مع ليلى» feature card | the feature is hidden from students since 2026-10-06 |
| `/privacy` | lists Vercel as host/analytics | hosting is Cloudflare since 2026-09-22 |
| `/about`, `/terms` vs footer | `fluentia.sa@gmail.com` vs `hi@fluentia.academy` | two public emails |

## 6. app.fluentia.academy (report only — not changed)

`robots.txt` = `User-agent: * / Disallow: /preview/` and every page (incl. `/login`)
serves `<meta name="robots" content="index, follow">` with the title «Fluentia Academy —
أكاديمية طلاقة». The private app is indexable. Recommended (LMS repo, separate task):
`X-Robots-Tag: noindex` on every route except deliberate public pages (`/try`), or a
`Disallow: /` robots with an allow-list.
