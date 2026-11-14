# «مجلة طلاقة» → carousels (TikTok photo mode + Instagram)

Turns journal articles into ready-to-post carousels. Standalone: it never runs the site build.

```bash
cd tools/carousels && npm install        # once: playwright-core (drives the system Chrome)
node tools/carousels/render.mjs          # lint + render all + captions + index.html + 00-POSTING-PLAN.md
node tools/carousels/render.mjs 03       # one carousel (03 07 → several)
node tools/carousels/render.mjs --check  # lint only: forbidden words, prices, slide word counts, captions
node tools/carousels/render.mjs --sheet  # rebuild captions / index.html / plan without rendering
```

Output goes to `~/Downloads/fluentia-carousels/` (override with `--out`). Never into the repo.
Each carousel gets `4x5/` (1080×1350, Instagram), `9x16/` (1080×1920, TikTok) and `caption.txt`.

## Next issue

1. Add `content/NN-<slug>.json`. Copy an existing one; `article` must be a slug in `src/content/journal/index.js`.
2. Slide types: `cover` (variants `photo` / `frame` / `split` / `type`), `text`, `swap`, `phrases`, `myth`,
   `list`, `step`, `punch`, `dialog`, `stress`, `pairs`, `timeline`, `verdict`, `cta`. See `lib/template.mjs`.
3. Inline markup: `{{English}}` → LTR span · `**bold**` · `==lime marker==`.
4. Images: names from `public/images/journal/gallery/` (`plate-<slug>`, `scene-clock`, `cover`).
   The `-post` / `-story` crop is picked per size.
5. Set `issue` / `start` in `plan.json`, then run `node tools/carousels/render.mjs` and fix every `!` warning.

## Rules the linter enforces

- No prices, ever. The CTA wording is fixed in the template.
- Forbidden words: معهد، دورة، مذهل، مميز، استثنائية، الأفضل، حبيبتي، كلاس تجريبي.
- About 25 Arabic words per body slide, and TikTok caption text ≤ 150 characters before hashtags.
