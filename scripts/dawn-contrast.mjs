// «الفجر» contrast check — every text/background pair the dawn homepage uses.
// node scripts/dawn-contrast.mjs   (exits 1 if any pair fails WCAG AA)
//
// Translucent text is composited over its background first, so "cream 75%"
// is measured as the colour the eye actually sees.

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const over = ([r, g, b], a, bg) => [r, g, b].map((c, i) => c * a + bg[i] * (1 - a));
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const T = {
  night950: "#060914",
  night900: "#0b1024",
  indigo800: "#18204a",
  sky400: "#38bdf8",
  sky200: "#bae6fd",
  dawn400: "#ffb547",
  dawn500: "#ff8a4c",
  cream50: "#f6f1e8",
  sand100: "#f3ece0",
  storyLink: "#0369a1", // sky's role on the sand section
  warmest: "#23172c", // the warmest point of the page gradient (above the final)
};

// [label, text, text alpha, background, min ratio]  — 4.5 body, 3 large/UI
const PAIRS = [
  ["cream on night (headings, body)", T.cream50, 1, T.night950, 4.5],
  ["cream 75% on night (hero subhead)", T.cream50, 0.75, T.night950, 4.5],
  ["cream 70% on night (trust line)", T.cream50, 0.7, T.night950, 4.5],
  ["cream 60% on night (hero level-test link)", T.cream50, 0.6, T.night950, 4.5],
  ["cream 66% on night (secondary text)", T.cream50, 0.66, T.night950, 4.5],
  ["cream on indigo-800 (glass cards)", T.cream50, 1, T.indigo800, 4.5],
  ["cream 72% on indigo-800 (card body)", T.cream50, 0.72, T.indigo800, 4.5],
  ["night on dawn-400 (primary call)", T.night950, 1, T.dawn400, 4.5],
  ["dawn-400 on night (key numbers)", T.dawn400, 1, T.night950, 4.5],
  ["dawn-400 on indigo-800 (card numbers, prices)", T.dawn400, 1, T.indigo800, 4.5],
  ["sky-400 on night (links, accents)", T.sky400, 1, T.night950, 4.5],
  ["sky-200 on night (soft brand text)", T.sky200, 1, T.night950, 4.5],
  ["cream on warmest page tone", T.cream50, 1, T.warmest, 4.5],
  ["cream 80% on warmest (final sub)", T.cream50, 0.8, T.warmest, 4.5],
  ["night on sand-100 (light section)", T.night950, 1, T.sand100, 4.5],
  ["night 68% on sand-100 (light section body)", T.night950, 0.68, T.sand100, 4.5],
  ["night 62% on sand-100 (story duration)", T.night950, 0.62, T.sand100, 4.5],
  ["#0369a1 on sand-100 (light section accent)", T.storyLink, 1, T.sand100, 4.5],
];

let fail = 0;
for (const [label, fg, a, bg, min] of PAIRS) {
  const b = hex(bg);
  const r = ratio(over(hex(fg), a, b), b);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)} : 1  (≥ ${min})  ${label}`);
}
console.log(fail ? `\n${fail} pair(s) fail WCAG AA` : "\nall pairs pass WCAG AA");
process.exit(fail ? 1 : 0);
