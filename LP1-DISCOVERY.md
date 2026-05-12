# LP-1 Discovery Report — 2026-05-12

## Branch state
- Branch: main
- Clean: NO — .env modified (SUPABASE_SERVICE_ROLE_KEY added locally, must NOT be committed); 3 untracked files (FRESH-V2-DISCOVERY.md, scripts/discover-2026-05-11.cjs, scripts/verify-2026-05-11.cjs)
- Latest commit: cc460bd "Add 2 students: سارة العرابي (A2 private 3000) + لمياء الحربي (A1 asas 750)"
- Decision: Proceeding. Will use targeted git add (NOT git add -A) at B.9 to keep .env and scripts out of the LP-1 commit.

## Entry & Router
- Entry file: src/main.jsx
- Router: BrowserRouter (react-router-dom v7)
- Routes currently registered:
  - `/`           → HomePage (defined inline in src/App.jsx:478)
  - `/start`      → src/pages/StartPage.jsx (lazy)
  - `/partners`   → src/pages/partners/PartnersLanding.jsx (lazy)
  - `/partners/submitted` → src/pages/partners/PartnersSubmitted.jsx (lazy)
  - `/partners/terms`     → src/pages/partners/PartnersTerms.jsx (lazy)
  - `/about`      → src/pages/AboutPage.jsx (lazy)
  - `/privacy`    → src/pages/PrivacyPolicy.jsx (lazy)
  - `/terms`      → src/pages/TermsOfService.jsx (lazy)
  - `/w`          → src/pages/WhatsAppRedirect.jsx (lazy)
  - `/v1`         → src/pages/PremiumV1.jsx (eager import)

## Current `/` landing
- File: src/App.jsx (HomePage function at line 478)
- Line count: 1211 (entire App.jsx including all routes + HomePage inline)
- Sanity check: YES — dark navy (#060e1c), Tajawal font, scrolling landing with pricing packages, reviews, placement quiz. Expected legacy structure confirmed.

## FRESH-V1 leftovers
- src/pages/PremiumV1.jsx: EXISTS (6407 bytes, last modified May 1)
- src/styles/fresh-tokens.css: EXISTS (12752 bytes, last modified May 1)
- src/styles/premium-tokens.css: absent
- /v1 route registered: YES (App.jsx:1199)
- Tajawal font installed: YES (@fontsource/tajawal in devDependencies, weights 300–900 imported in main.jsx)
- Existing git tags matching premium/fresh/landing:
  - v1-classic-2026-05-01
  - v2-editorial-archive-2026-05-01

## Fonts currently loaded (in src/main.jsx)
- @fontsource/tajawal — weights 300, 400, 500, 700, 800, 900 (individual CSS imports)
- @fontsource-variable/readex-pro — variable font (full axis, single import)
- @fontsource-variable/inter — variable font (full axis, single import)
- NOTE: package.json has @fontsource-variable/readex-pro and @fontsource-variable/inter (variable versions),
  NOT @fontsource/readex-pro or @fontsource/inter (fixed-weight versions required by LP-1 prompt).
  Will install both fixed-weight packages in B.3.

## Tracking code locations (PRESERVE in later prompts)

### TikTok Pixel
- index.html:91 — TikTok Pixel loader script (pixel ID: D79DFR3C77UA3HU6E70G), ttq.load() + ttq.page()
- index.html:93 — `ttq.load('D79DFR3C77UA3HU6E70G')`
- index.html:94 — `ttq.page()`
- src/lib/tiktokPixel.js:5 — full pixel module (all raw ttq.track calls routed here)
- src/lib/tiktokPixel.js:133 — `window.ttq.identify(identifyPayload)`
- src/lib/tiktokPixel.js:159 — `window.ttq.track('SubmitForm', ...)`
- src/lib/tiktokPixel.js:162 — `window.ttq.track('Lead', ...)`
- src/lib/tiktokPixel.js:165 — `window.ttq.track('CompleteRegistration', ...)`
- src/lib/tiktokPixel.js:209 — `window.ttq.track('Lead', ...)`
- src/lib/tiktokPixel.js:210 — `window.ttq.track('SubmitForm', ...)`
- src/lib/tiktokPixel.js:236 — `window.ttq.track('ViewContent', ...)`
- src/App.jsx:1183 — comment noting no PII, goes through tiktokPixel helper
- src/pages/StartPage.jsx:250 — `window.ttq.page()`
- src/pages/WhatsAppRedirect.jsx:56 — TikTok events routed through shared helper

### GA4
- index.html:78-85 — GA4 script (G-19G2SJ1WYL) + Google Ads (AW-9314838750) init
- src/App.jsx:346 — `window.gtag('event','conversion',{'send_to':'AW-9314838750',...})`
- src/App.jsx:381 — `window.gtag('event','generate_lead',...)` + conversion
- src/App.jsx:1174-1175 — `window.gtag('config','G-19G2SJ1WYL',...)`
- src/pages/StartPage.jsx:330-331 — `window.gtag('event','conversion',{send_to:'AW-9314838750',...})`
- src/pages/WhatsAppRedirect.jsx:58-74 — `window.gtag('event','generate_lead',...)` + conversion
- src/utils/tracking.js:93-104 — centralized GA4 generate_lead + Ads conversion

### UTM source
- src/App.jsx:32 — `params.get('utm_source') || sessionStorage.getItem('utm_source')`
- src/App.jsx:92-94 — utm_source, utm_medium, utm_campaign saved to Supabase leads
- src/App.jsx:361 — utm_source read for WA message building
- src/App.jsx:509 — utm_source persisted to sessionStorage on mount
- src/pages/StartPage.jsx:193-195 — utm_source/medium/campaign read for lead submission
- src/pages/WhatsAppRedirect.jsx:35-36 — utm_source/campaign read for routing
- src/utils/affiliateTracking.js:70-72 — utm params captured and stored
- src/utils/tracking.js:23,61-63 — utm params forwarded with lead data

### Phone EMQ hashing
- src/lib/tiktokPixel.js:41-63 — `sha256()` using Web Crypto API; hashes phone, email, external_id
- src/lib/tiktokPixel.js:68 — `userData.phone_number = hashedPhone`
- src/lib/tiktokPixel.js:128 — hashed phone passed to `ttq.identify()`
- src/App.jsx:365 — comment: "SHA-256 hashing + identify-before-track" via unified helper
- src/utils/tracking.js:109 — comment: SHA-256 hashes phone/email/external_id

## Decisions for Phase B
- /v1 leftovers: src/pages/PremiumV1.jsx will be renamed to PremiumV1.deprecated.jsx; src/styles/fresh-tokens.css will be renamed to fresh-tokens.deprecated.css (both via git mv). /v1 route will remain pointing at deprecated file (harmless, no traffic).
- Existing fonts to remove: none (all kept for legacy / compatibility)
- New fonts to install: @fontsource/readex-pro (fixed-weight), @fontsource/inter (fixed-weight) — tajawal already installed
- Token scoping: .lp-scope class (no leakage to legacy /)
- Commit strategy: targeted git add (not git add -A) to exclude .env and scripts/
