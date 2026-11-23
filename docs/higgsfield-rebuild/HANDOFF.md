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

## Pack placed (2026-11-24)
- Every slot on /preview has footage (`media.js` has no `null`). 24 pack assets are used, and the job → slot map is in `generations.json` → `pack`.
- Hero = one 21 s reel per orientation: meeting → café → airport, with 1 s dissolves. It loops seamlessly. mp4 2.1–2.3 MB, webm 1.6–1.8 MB.
- «بعد» = V_BA_AFTER_W/T (the real Kingdom Centre and KAFD), replacing the interim 4593da1b.
- Loop edits:
  - Ping-pong: BA_BEFORE W/T (first 5 s) and FINAL_W (first 5 s).
  - Crossfade: the rest.
  - V_PODCAST: trimmed to 7 s.
  - V_WHO_EMPLOYEE: plays once and holds the last frame (`loop:false`).
- DETAIL_COFFEE was cropped to remove the phone, which showed a logo.
- Rejected in Claude Code QA: V_WHO_STUDENT. The classmate wears jeans and a navy hijab, and a woman without hijab is behind him. «طلاب» uses the CAST_ABDULLAH still instead.
- Not placed: PRIVATE, CAREER, the alternate hero takes, and the cast sheets except Abdullah's.

## Next
1. Ali reviews /preview on a phone and a laptop.
2. The two proof slots still need real, approved student stories (or removal) before the swap.
3. The swap is one line, and only when Ali says so: `SWAP.md`.

## Key files
- `src/pages/cinema-preview/{CinemaPreview.jsx,cinema.css,copy.js,media.js,Footage.jsx}`
- `src/App.jsx` (`/preview` route, `HOMEPAGE_VERSION`)
- `src/content/seo.js` (`"/preview"` noindex)
- `scripts/prerender-meta.mjs` (`data-route-chunk`)
- `docs/higgsfield-rebuild/{AUDIT.md,SWAP.md,generations.json,encode.sh,before/,after/}`
