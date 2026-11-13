# «معرض» Gallery — final screenshots (2026-11-14)

The official journal design: `/journal` + the 6 articles. Shots taken from the
real pages on a vite dev server (no production build), system Chrome,
1440×900 (`-d-`) and 390×844 touch (`-m-`), at three depths: `1top`, `2mid`,
`3end`. Downscaled + JPEG-compressed for the repo.

## Each article is its own exhibit

| # | Article | Plate | Opening device | Pull-quote wall | Scenes (tone) |
|---|---|---|---|---|---|
| 01 | first-ten-minutes | full photo + «10:00» outline, lime colon | lime bar | ink | clock (ink), table (paper) |
| 02 | understand-but-cant-speak | split: photo half / paper half, lime disc over the numeral | big first sentence | paper | gap (ink), bridge (paper) |
| 03 | words-that-betrayed-us | band: lime title slab over the photo, «~~open~~ turn on» | lime number mark | ink | plug (ink), swap (paper) |
| 04 | accent-is-not-the-problem | frame: matted photo, IPA /ˈækˌsənt/ | big first sentence | paper | meters (lime), waves (paper) |
| 05 | fear-of-mistakes | spot: dark stage, lime spotlight, outlined numeral | lime bar | lime | spotlight (ink), stage (lime) |
| 06 | adults-learn-differently | field: lime field, photo strip, arrow | lime number mark | ink | paths (paper), roots (ink) |

## Critique log

**Round 1**
- **Blocker:** on wtbu and adults the whole article collapsed into a 96px column at the right edge, on desktop and mobile.
  - Cause: the `<article>` carried `g-lead-mark`, which is also the class of the lime number block, so it inherited `display:grid; width:96px`.
  - Fix: the article modifier is now `g-ld-<lead>`.
- The site's cookie banner covered every shot. It is site-wide and was left as is; the QA run pre-accepts essential cookies only.

**Round 2**
- wtbu desktop: the lime «turn on» motif ran into the lime title slab and the kicker, so lime on lime turned to mush.
  - Fix: on ≥900px it sits in the clear strip under the nav at 7vw.
  - Screens shorter than 820px have no such strip, so the motif is hidden there.
- adults desktop: the «06» numeral reached the viewport edge with no gutter.

**Round 3**
- adults: the first fix (4 columns for the numeral) pushed the title to 5 lines.
- Final: 3/9 split with the numeral at `clamp(110px, 9vw, 150px)`. The title is back to 4 lines and the numeral sits inside its cell.

## Checks on the final state (all 7 pages × 2 widths)
- **Layout:** horizontal overflow 0; broken images 0; console errors 0.
- **CLS:** ≤ 0.015 (most pages 0–0.004).
- **Reduced motion at 375px:** 0 hidden text, 0 overflow; captions all shown, scenes static.
- **Contrast:** ≈1,200 text elements measured against their solid background; 0 below 4.5:1 (body) or 3:1 (large).
- **Copy:** forbidden words 0; Arabic-Indic digits 0.
- **SSR:** full article text in the server HTML for all 6 articles. Numbered headings render as «01» + heading instead of «1. heading».
