# «مجلة طلاقة» — art-direction previews

Three redesigns of the journal, built side by side so one can be picked.
Live (noindex, nofollow; not in sitemap or llms.txt):

| Direction | Home | Flagship | Second article |
|---|---|---|---|
| A «حبر وجمر» Ink & Ember | `/journal/preview/ink` | `/journal/preview/ink/first-ten-minutes` | `/journal/preview/ink/fear-of-mistakes` |
| B «غسق الصحراء» Desert Dusk | `/journal/preview/dusk` | `/journal/preview/dusk/first-ten-minutes` | `/journal/preview/dusk/adults-learn-differently` |
| C «معرض» Gallery | `/journal/preview/gallery` | `/journal/preview/gallery/first-ten-minutes` | `/journal/preview/gallery/words-that-betrayed-us` |

Chooser: `/journal/preview`. Every one of the six articles also renders in every
direction (22 URLs in all). Screenshots here: `<dir>/{page}-{desk|phone}-{scroll %}.webp`.
Image sources, prompts and spend: `../image-prompts.md`.

## Self-critique — round 1 (build review)

- **Gallery** — the cover photo and the side column overlapped at 1440 px; the photo
  now spans the full grid row (5:4) and the column sits beside it, no overlap.
- **Dusk** — muted text was 3.2:1 on the lightest sky band; raised to `#f3e6e2`
  (≥ 4.5:1). Station list opacity 0.7 → 0.85 for the same reason.
- **Chooser** — the Gallery card used the dark theme of the other two; it now
  previews its own paper-white + lime #C6FF3D look.
- **All** — two robots tags were served (the shell's static «index, follow» beside
  Helmet's «noindex, nofollow»); the static one is removed on preview pages, and
  `public/_headers` sends `X-Robots-Tag: noindex, nofollow` as the backstop.
- **All** — an image slot not rendered yet showed a broken-image icon; it now hides.

## Self-critique — round 2 (final pass)

- **Dusk + Gallery** — the share-as-image sheet sat *under* the site header (the
  header lives outside the article's stacking context), leaving the header CTA
  clickable behind a modal. The header is hidden while a sheet is open.
- **All** — a cold load swapped the Google display faces after first paint and
  reflowed the type-led covers (CLS 0.2–0.3 on desktop homes). The page now stays
  invisible until its faces load (every declared weight, capped at 1.5 s). On
  production: CLS 0 on all 22 URLs at 375 px. A load slow enough that the fonts
  miss the cap can still shift the Gallery/Ink covers once (seen at ~0.17 on a
  12-second desktop load).
- **Dusk** — the portrait (4:5) home cards cropped their subject (door, tree, gong)
  under the dune band and off the frame edge; the photo is lifted, the dunes
  lowered, and the crop anchored at 74 % where the subjects sit.
- **Checks** — 0 overflow at 375/390 px and 1440 px on all 22 URLs; 0 console
  errors; every image request 200; body 19.5 px / 1.95 desktop, 17.5 px mobile,
  ≤ 683 px measure; the flagship meeting game played to the end by touch in all
  three; share cards generate story + post PNGs; «احجز لقاءك المبدئي» opens the
  same lead form as the live site (same `data-open-form`, same tracking).
