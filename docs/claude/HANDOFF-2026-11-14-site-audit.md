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
