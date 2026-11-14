# HANDOFF — fluentia.academy full-site audit (2026-11-14)

## Done (live on main, a311b8a, verified on fluentia.academy by content)
- **Consent:** Google Consent Mode v2 (default denied until the banner choice, `wait_for_update`, ads_data_redaction, url_passthrough). TikTok pixel `holdConsent` and is not even downloaded until marketing consent. Choice in localStorage `fluentia_cookie_consent_v1`, event `fluentia-consent-updated`. /privacy has a «إعدادات ملفات تعريف الارتباط» button (event `fluentia-open-cookie-settings`). Privacy policy updated (consent, Anthropic for «مستشار طلاقة», hashed phone/email to TikTok). tour.html is the same, minus the banner (no choice = denied).
- **Indexing:** app-shell.html and 404.html have raw-HTML `noindex, nofollow` and no Course JSON-LD (scripts/prerender-meta.mjs `shellHtml`; the pristine template is in dist-ssr/template.html). X-Robots-Tag on /v1 /v2 /v4 /v5 /aurora /cine* /journey /partners/submitted /w /status*. /step→/guide/step and /ielts→/guide/ielts are 301s.
- **Headers** (public/_headers `/*`): HSTS (host only), XFO SAMEORIGIN, CSP frame-ancestors/base-uri/object-src/upgrade-insecure, Permissions-Policy (mic self), COOP same-origin-allow-popups.
- **Claims removed until sourced:** «مدربين سعوديين» (title/meta/seo.js/StartPage/articles/legacy), «⭐ 4.9 · +50 طالب · معتمدون رسمياً» (/start/form), /about «+14 / 4.9★ / +100» → 6 levels / 72 units / max 7. «وصول فوري» → «تفعيل بعد مكالمة قصيرة».
- **New:** /guide/step. The booking CTA goes to `/start?src=guide_|article_|work_<slug>` on guides, articles and work-english. SiteHeader (`src/components/SiteHeader.jsx`) is on /about, /articles, legal pages and 404. 404 has a CTA and a level-test link. Home has a level-test link under the hero. /start has an immediate greeting, a WhatsApp fallback (`data-cta="start_wa_fallback"`) and a static sky on phones and in-app browsers.
- **Fixes:** /private + /join hydration #425/#422 (`<style>` children → dangerouslySetInnerHTML), desktop planet square edge, tap targets ≥44, starfield deferred to idle and throttled (30/12 fps).
- **Lighthouse mobile /:** Perf 63 → 70–83, BP 79 → 100, TBT 1,240 → 380–1,110 ms, TTI 13.2 → 9.3–10.1 s.

## Needs Ali (cannot be done without him)
1. Homepage direction: choose /preview/a, b or c; then shorten the homepage.
2. Government logo band: which entities are real and allowed?
3. «مدربون سعوديون»: true? If yes, restore it. Also trainer credentials (NEEDS-ALI #11).
4. Founder photo for /about.
5. Ads conversions: link GA4 ↔ Google Ads and import `generate_lead` + `book_meeting` as key events (no code), OR give the AW conversion label.
6. Search Console: confirm the property is verified (the meta tag exists), and submit sitemap.xml.
7. Google Business Profile + real reviews (only then can a rating return to the site).
8. STEP format: the page says 40/40/20 (Reading/Structure/Listening) with a caution note about the older 40/30/20/10. Re-check on the ETEC page.
9. Founding date contradiction (2021 vs 23 March 2026), and the rest of docs/seo/NEEDS-ALI.md.

## Tradeoff to know
TikTok and Google Ads signals now need opt-in, so reported conversions will drop for visitors who decline. That is the legal setup (PDPL), and Consent Mode modelling recovers part of it on Google's side.

## Follow-up 14 Nov (Ali's answers)
- **Founding year 2021:** /about «تأسست عام 2021» (+ English «Founded in 2021»), `foundingDate: "2021"` in index.html and scripts/guide/org.mjs (the build compares them). /terms and /privacy keep «تاريخ السريان: 23 مارس 2026» — the policies' effective date, not a founding/CR date. `AboutPage` JSON-LD `datePublished` 2026-03-23 is the page's own date, kept.
- **«مدربون سعوديون» restored** in every place 7c856d3 + a311b8a removed it. Title (all four homepage-meta copies): «أكاديمية طلاقة | دورات إنجليزي أونلاين مع مدربين سعوديين» (56 chars). Description: «دورات إنجليزي أونلاين للكبار في السعودية مع مدربين سعوديين: …» (150). Keyword «مدرب إنجليزي سعودي». 4.9★ / +50 / معتمدون رسمياً / +14 / +100 / وصول فوري stay removed.
- **`book_meeting`:** wired since 2026-11-11 to one moment only — admissions-bot answering a slot pick in the /start chat with a booking. Zero GA4 hits = zero real bookings (bot_conversations: 31 real, 0 numbers, 0 booked). Now `method: chat_booking`, `source_page` = the `src` tag, `page_path`, and once per booking id (localStorage `fl_abot_booked`), because a re-pick returns the same booking. Leads booked by Badriyah in the CRM never touch the site, so they never send it.
- **Gov logo band:** keep as is — do not flag again.
- **Search Console + GA4↔Ads:** done by Ali; see docs/seo/NEEDS-ALI.md «Status».
