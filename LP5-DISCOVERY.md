# LP-5 Discovery Report — 2026-05-12

## Baseline
- LP-4 commit: e754d37
- Clean working tree: NO (.env modified locally — excluded from commit as all prior LPs)

## TikTok Pixel module (src/lib/tiktokPixel.js)
- Exports:
  - `normalizePhoneE164(rawPhone)` — strips 00/966/0 prefix, validates 9-digit Saudi mobile
  - `normalizeEmail(rawEmail)` — trim + lowercase
  - `sha256(text)` — Web Crypto SHA-256, returns hex string
  - `buildTikTokUserData({ email, phone, externalId })` — returns hashed { email, phone_number, external_id }
  - `fireTikTokLeadEvents({ email, phone, externalId, value, currency, contentName, contentCategory, contentId, eventIdBase })` — full identify→SubmitForm→Lead→CompleteRegistration flow with context.user
  - `fireTikTokRedirectEvents({...})` — for /w redirect pages (Lead+SubmitForm only)
  - `fireTikTokViewContent({...})` — ViewContent on page load
- Pixel ID: loaded in index.html as `ttq.load('D79DFR3C77UA3HU6E70G')` — not a constant in this file
- Phone-hash function: `sha256(text)` — async (Promise<string>), normalizes via `normalizePhoneE164` before hashing
- Init pattern: auto on import (window.ttq must be ready via index.html script), no manual init()
- CRITICAL PATTERN: identify() MUST be called BEFORE track() — function enforces this

## GA4 setup
- gtag is global (window.gtag): yes — injected by index.html
- GA4 ID: G-19G2SJ1WYL (confirmed in index.html per LP-1)
- Google Ads: AW-9314838750
- Standard event name for lead: 'generate_lead' (with value + currency + form_id)

## UTM threading
- Helper file: src/utils/tracking.js
- Key functions: `getSource()`, `fireLeadTracking()`, `saveLead()`
- Format in WA message: `المصدر: ${sourceLabel}` + ` · ${campaign}` if present
- UTM also saved to Supabase leads table (utm_source, utm_medium, utm_campaign)

## Legacy / landing file
- Route `/` renders: `HomePage` component
- File path: defined INLINE in src/App.jsx at line 479 — NOT a separate file
- Has its own form/submit logic: YES (full form, pkg selection, quiz, etc.)
- Decision: no file rename needed — just change route mapping

## Decisions
- LeadFormModal will import `fireTikTokLeadEvents` and `normalizePhoneE164` from existing `../../lib/tiktokPixel` module — NOT re-implemented inline. This preserves EMQ context.user pattern and identify-before-track order.
- LeadFormModal will also call `saveLead` from `../../utils/tracking` for Supabase persistence (same as /start).
- Phone hashing: delegated to fireTikTokLeadEvents (it calls sha256 internally via buildTikTokUserData)
- Legacy file: NO RENAME — HomePage stays inline in App.jsx.
  Instead: `/` route will render LandingV2, `/legacy` route will render the existing `<HomePage />`.
- /legacy route: `<Route path="/legacy" element={<HomePage />} />` — no new file needed.
