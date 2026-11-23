# Swapping `/` to the cinematic page — prepared, NOT applied

The new homepage lives at **fluentia.academy/preview** (noindex). Making it the
homepage is one line in `src/App.jsx`:

```diff
-const HOMEPAGE_VERSION = "dawn";
+const HOMEPAGE_VERSION = "cinema";
```

Push to `main`, and Cloudflare Pages deploys it. Rollback is the same line back to `"dawn"`.

## What that line does (dry-run 2026-11-24, built locally and reverted)

- `/` renders `src/pages/cinema-preview/CinemaPreview.jsx` with `seoPath="/"`, so it
  takes the homepage's own `PAGE_SEO["/"]` title, description, canonical and
  **index, follow** robots. `/preview` stays noindex.
- The prerender (`scripts/prerender-meta.mjs`) sees `data-route-chunk="CinemaPreview"`
  on the page root and puts the page CSS in the `<head>` of `index.html`, so the
  first paint at `/` is styled and the hero poster is the LCP, the same as at `/preview`.
- Tracking needs no change. App.jsx skips TikTok ViewContent only on `/preview*`,
  so at `/` it fires as it does today. GA4 `whatsapp_click` (with `cta_id`) and the
  TikTok Contact event come from the global WhatsApp listener (`main.jsx`). The booking
  CTAs go to `/start?src=site_home`, the same as the current homepage.
- **`/join` is not affected.** It renders `NextLanding` through its own route.
  In the dry-run, `dist/join.html` stayed byte-identical to production
  (hash-normalised diff: 0 lines).
- The current homepage is still reachable: set `"dawn"` again, or open `/home-v1` (pre-dawn).

## Before flipping it

1. Fill every footage slot from the Higgsfield pack: `MEDIA` in
   `src/pages/cinema-preview/media.js` must have no `null` left. Set `l: true` for
   hero / before / after / final once the 16:9 cuts exist.
2. Fill the two proof slots with real, approved student stories, or remove them.
   Never invent one.
3. Get Ali's approval on `/preview`, on a phone and a laptop.
4. Run Lighthouse mobile on production `/preview`: LCP < 2.5 s, CLS < 0.05.
