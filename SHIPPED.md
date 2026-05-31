# SHIPPED — Atelier Landing Rebuild (`/atelier`)

Cinematic, editorial, RTL single-page landing in the **Velvet Midnight / Atelier**
design language, built as **brand-new components on a new route** — the live `/`
and `/v2` (both `LandingV2`), plus `/legacy` and `/v1`, were **not modified**.

**Preview:** https://fluentia.academy/atelier  (robots-disallowed — `noindex` meta + `Disallow: /atelier` in robots.txt)

---

## What was built

**Route:** `src/App.jsx` — `const AtelierLanding = lazy(...)` + `<Route path="/atelier" …>` (diff: **+2 / -0**; nothing else in App.jsx changed).

**Design system:**
- `src/styles/atelier-tokens.css` — `.atelier-scope` Velvet Midnight palette, layered radial ambient glows, hairlines, fluid type scale, card/chip/CTA primitives, `at-drift` ambient keyframe, `prefers-reduced-motion` guard. Scoped — no leak to `/` or `/v2`.
- `src/pages/atelier/atelier.tokens.js` — motion eases / durations / stagger + hex mirror for SVG.
- `src/pages/atelier/Reveal.jsx` — the single scroll-reveal primitive (`whileInView`, `once`, `margin:-10%`, reduced-motion aware).
- `src/pages/atelier/atelier.copy.js` — founder-authored [NEW] copy (trust chips, founder letter, transformation, the 7 real testimonials, stats, comparison) + `MAX_STUDENTS = 12`.

**Fonts** (`src/main.jsx`): added Cairo (700/800) + Cormorant Garamond (500/600/500-italic) via `@fontsource` (`@fontsource/cairo` installed). **Cormorant verified applied** — `var(--serif)` used across the atelier components; build bundles `cormorant-garamond-latin-500-italic.woff`.

**14 sections + footer** (`src/pages/atelier/sections/`), in order, RTL, each wrapped in `<Reveal>`:
1. Hero — wordmark fade+scale, Cormorant-italic English line, Cairo headline, single primary CTA (احجز لقاءك المبدئي المجاني), ambient glow drift.
2. TrustStrip — quiet chips, hairline top/bottom.
3. Problem — `PROBLEM` (live), de-emojied, Cormorant numerals, bridge line.
4. WhoFor — `WHO_FOR` (live) for-you / not-for-you. *(note 1)*
5. Founder — photo-free editorial letter, gold SVG monogram seal (ع), name-plate, signature; exact brief letter.
6. Platform — **lazy-loaded**; 4 in-code UI panels (daily trainer letter, SVG skill radar, mock-exam result + AI-feedback snippet, vocab + SRS). No images, no real student data.
7. Comparison — editorial table, sky/muted. *(note 2)*
8. Transformation — real الجوهرة before→after with slow gold vertical wipe.
9. Testimonials — the **7 real** testimonials; calm grid, hover-lift, no auto-scroll.
10. Stats — count-up on scroll, gold Cormorant numerals, reduced-motion safe.
11. PriceReframe — daily figure **derived from the live entry tier** (no hardcode). *(note 3)*
12. Pricing — **read from `content.js`** (`PRICING`): studentTier → 3 tiers → IELTS; Eid anchor strikethrough; hero tier gets gold + "الأكثر طلباً"; each CTA threads the package name into the lead flow.
13. FAQ — `FAQ` (live), smooth accordion.
14. ClosingCTA — wordmark fade+scale, single CTA.
+ Footer — wordmark, socials, WhatsApp, copyright.

**Lead flow + tracking parity:** `AtelierLeadModal.jsx` (Velvet Midnight) opens via the `open-lead-form` event from every CTA. On submit it fires the same events as the live `LeadFormModal`: `fireTikTokLeadEvents` (SubmitForm/Lead/CompleteRegistration), GA4 `generate_lead` + Ads `conversion` (AW-9314838750), Supabase lead insert (`source: "atelier_lead"`), then WhatsApp via `buildWhatsAppUrl` (`+966558669974`, UTM/ref preserved). PageView/ViewContent fire globally from `index.html` + `AppRoutes` on `/atelier`.

---

## Quality gates
- ✅ `npm run build` exit 0; `AtelierLanding-*.js` + `Platform-*.js` chunks compiled (full graph resolves).
- ✅ Isolation: `src/pages/landing-v2/**`, `LandingV2.jsx`, `content.js` **untouched**; App.jsx +2/-0.
- ✅ All hooks at top (no conditional hooks).
- ✅ RTL + `lang="ar"`; reduced-motion respected.
- ✅ Cormorant verified applied; fonts self-hosted, swap.
- ✅ Heavy Platform panels lazy-loaded.
- ✅ No emoji-as-decoration, no marquee, no scale-pop.
- ✅ `/atelier` robots-disallowed.

---

## Notes
- **Max students = 12** — founder-confirmed (matches live `content.js` pricing). Set in `atelier.copy.js` (`MAX_STUDENTS`).
1. **Section 4 (personas):** live `content.js` has no 3-persona "النتيجة المتوقعة" set (that's on `/legacy`); used live `WHO_FOR` for-you/not-for-you instead. Swap later if preferred.
2. **Comparison:** no comparison table in live `content.js`; authored from the brief's dimensions with honest "us" values and general "them" values (no fabricated competitor claims).
3. **PriceReframe:** no `DAILY_REFRAME` in live content; daily figure derived from the entry tier (`price / 30`).
4. **Testimonials:** used the brief's 7 real ones (live `STORIES` has only 3, marked `TODO Ali: replace with real`).

## Swap (NOT done — founder-approved later)
One-line route change in `src/App.jsx` to point `/` at `<AtelierLanding />`, keep `<LandingV2 />` at a fallback route, and drop the `/atelier` robots-disallow.
