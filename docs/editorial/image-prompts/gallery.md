# Gallery («معرض») image recipe

Style: STRICTLY MONOCHROME black-and-white fine-art photograph, contemporary design-museum interior, Swiss minimalism, hard raking museum light with crisp edged shadows, true blacks and crisp whites, one object per frame, large calm negative space, subtle film grain, 50mm medium-format. NO text, letters, numbers, logos, people, colour tint. The single accent (acid lime #C6FF3D) is never in the photo: it is applied in CSS (multiply duotone, blocks) and SVG.

## Prompts attempted (nano-banana, 16:9 and 4:5, n=2 each; job list in scratchpad/shots-gallery/jobs.json)
- cover: vast empty white gallery room, one tall black doorway on the far left third, diagonal beam of window light across the floor, empty right half for a headline.
- cover-t: single black chair seen from behind facing a tall bare white wall, hard window-light shadow, empty upper half.
- per-article plates followed the same recipe with one object each (clock shadow, table, plug, etc.).

## What actually shipped
fal returned 403 "User is locked (TOP_UP)" for every job, so $0 was spent under `gallery/`. (The earlier shoot-out under `shoot/gallery` cost about $0.68, before this build.) Plates and cover are crops, grayscale and contrast tone derived with tools/img.mjs from the four shoot-out photos (winner: nano-0.jpg, chair + window shadow + clock shadow), plus SVG/CSS geometry. Re-run jobs.json once the account is topped up to replace the derived crops.


Added after review: `scene-clock` (five white plinths in a row, one per station of the first ten minutes), local Z-Image-Turbo seed 11, grayscale + contrast 1.08, used as an 18 % backdrop in the flagship's clock scene. Prompt in `../image-prompts.md`.
