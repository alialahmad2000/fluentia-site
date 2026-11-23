# Higgsfield rebuild — handoff (2026-11-24)

## Done (live on main, 3588594)
- **fluentia.academy/preview** = the cinematic homepage candidate.
  - Source: `src/pages/cinema-preview/`.
  - Prerendered, noindex (meta + X-Robots-Tag), not in the sitemap.
  - TikTok ViewContent is skipped there.
- The old a/b/c chooser moved to `/preview/directions`. `/preview/a|b|c` are unchanged.
- `/` and `/join` are untouched. Their prerendered HTML is byte-identical to production
  (hash-normalised), and the /join screenshots match the before baseline (SSIM ≥ 0.978;
  every difference is animation timing). Proof: `after/join-before-after-diff.jpg`.
- Tracking parity on /preview:
  - GA4 `whatsapp_click` fires with `cta_id` (cv_header_wa / cv_hero_wa / cv_final_wa) and UTM source/campaign.
  - TikTok Contact fires from the same global listener.
  - All 4 booking CTAs (cv_header / cv_hero / cv_steps / cv_final) go to `/start?src=site_home`.
- CLS (local): 0 phone, 0.0003 tablet, 0.0004 desktop.
- The swap is prepared as one line, but not applied: `SWAP.md`.

## Next
1. Ali runs `~/Downloads/FLUENTIA-HIGGSFIELD-GENERATION-PACK.md` in claude.ai chat
   (free-trial unlimited only; trial ends **2026-11-26 22:56 Riyadh**) and replies «خلصت».
2. Pull the results: `higgsfield generate list --size 80 --json`.
   - QA each one: dress (thobe + bare head, or ghutra + black igal; abaya + hijab),
     no Dubai / Burj Khalifa, no text, no warping, consistent cast.
   - Log every job in `generations.json` with its verdict.
3. Encode: `docs/higgsfield-rebuild/encode.sh video <in> public/media/higgsfield/<section>/<name>-p 720x1280 <start> <dur>`,
   plus `-l 1280x720` for hero, before/after and final. Then fill the `null` slots in
   `media.js` and set `l: true` where a 16:9 cut exists.
4. Replace the interim `after` clip (4593da1b: skyline only Kingdom-Centre-like) with `BA_AFTER`.
5. Re-shoot at 3 viewports with `scratchpad/qa/shots.mjs`, push, and verify production content.

## Key files
- `src/pages/cinema-preview/{CinemaPreview.jsx,cinema.css,copy.js,media.js,Footage.jsx}`
- `src/App.jsx` (`/preview` route, `HOMEPAGE_VERSION`)
- `src/content/seo.js` (`"/preview"` noindex)
- `scripts/prerender-meta.mjs` (`data-route-chunk`)
- `docs/higgsfield-rebuild/{AUDIT.md,SWAP.md,generations.json,encode.sh,before/,after/}`
