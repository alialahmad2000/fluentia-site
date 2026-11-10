# Desert Dusk (dusk) - image recipe and prompts

## Status
fal.ai returned 403 "User is locked. Reason: TOP_UP" for every job; spend under `dusk/` = $0. The shoot-out files `shoot/dusk/nano-0.jpg`, `seedream-0.jpg`, `flux3-0.jpg` were reused (cropped by tools/img.mjs) plus seeded SVG dunes. Pending slots below are to be generated locally and dropped in with tools/img.mjs at the same names under public/images/journal/dusk/. Pages already read `<Art dir="dusk" name=...>` and fall back to the sky gradient + SVG dunes if a file is missing.

## Slot to file map
- cover: `cover` (16:9 w800/1280/1920, 4:5 t600/900/1200)
- plates: `plate-<slug>` for understand-but-cant-speak, words-that-betrayed-us, accent-is-not-the-problem, fear-of-mistakes, adults-learn-differently (first-ten-minutes is the photo plate; table flipped horizontally in CSS)
- scenes: `scene-clock`, `scene-table` (w800/1280/1920)
- quote card bg: `quote-story.webp` (9:16), `quote-post.webp` (4:5)

## Style recipe
Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth dunes in warm haze. Sky from deep plum/aubergine (#2A1433) through dusty rose (#D88A8A) to apricot (#E8B48A) and burnt sand (#C9784A). No sky blue, no navy. Vast negative space in the upper half for the title. No text, people or logos.

## Prompts

### cover-wide (16:9, n=1)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, low horizon, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm, inspiring. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a single wooden writing desk with one small glowing warm desk lamp and one chair, standing alone on a distant dune crest, tiny in the frame, right third of the image, the lamp the only point of light.

### cover-tall (4:5, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm, inspiring. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a single wooden writing desk with one small glowing warm desk lamp and one chair, standing alone on a distant dune crest, tiny in the frame, lower third of the image, the lamp the only point of light, tall sky above.

### plate-understand-but-cant-speak (16:9, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a tall simple empty wooden bookshelf with a few glowing warm amber objects on its shelves, standing alone on a dune crest, small in the frame on the right, long shadow across the sand.

### plate-words-that-betrayed-us (16:9, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a narrow plain wooden plank footbridge crossing the gap between two dune crests, small in the frame on the right, long shadow, the sky wide and empty above.

### plate-accent-is-not-the-problem (16:9, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: concentric circular ripples drawn in the smooth sand around a single round brass gong hanging in a simple wooden frame on a dune, small in the frame on the right, the ripples spreading outward across the dune like sound.

### plate-fear-of-mistakes (16:9, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a plain wooden doorframe with a slightly open door standing alone on a dune crest, warm golden light spilling out through the gap onto the sand, small in the frame on the right.

### plate-adults-learn-differently (16:9, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Layered smooth sand dunes receding into warm haze. Sky graded from deep plum and aubergine at the top through dusty rose into apricot and burnt sand at the horizon. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. Vast calm negative space in the sky, long soft shadows, no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: a single lone ghaf tree with a wide flat crown standing on a dune crest, small in the frame on the right, a line of footprints winding up the dune toward it, long shadow.

### scene-clock (3:2, n=1)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Smooth sand dunes in warm haze. Sky graded from deep plum through dusty rose to apricot and burnt sand. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. no sky blue, no navy. Surreal-poetic, quiet, warm. NO text, NO letters, NO numbers, NO people, NO logos. SUBJECT: five identical simple wooden chairs in a row spaced evenly down a long dune ridge receding into the distance, each casting a long shadow, seen from a low angle.

### quote-bg (9:16, n=2)
STYLE: Fine-art desert photography at dusk, medium-format film, matte, soft grain, minimalist and abstracted. Smooth sand dunes in warm haze in the lower third only. Sky graded from deep plum and aubergine at the top through dusty rose into apricot at the horizon, very large calm empty sky for text. Palette strictly plum, aubergine, burnt sand, apricot, dusty rose. no sky blue, no navy. NO text, NO letters, NO numbers, NO people, NO objects, NO logos. Pure empty dunes and sky.
