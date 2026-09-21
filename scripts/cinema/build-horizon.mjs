#!/usr/bin/env node
/**
 * build-horizon — cuts the hero stage's horizon plate out of the homepage's
 * existing Riyadh render (public/home/cta-riyadh-wide-*), so V5Cinema adds a
 * strip of sky instead of a second full photograph.
 *
 *   node scripts/cinema/build-horizon.mjs
 *   node scripts/cinema/build-horizon.mjs --check   # exit 1 if outputs are stale
 *
 * The source frame is sky (top) → skyline → foreground ground (bottom). Only
 * the band from just above the towers down to the base of the city is wanted:
 * the ground is what made the plate read as a stock sunset wallpaper, and the
 * upper sky is painted by the stage's own night, not by this image.
 *
 * Output is darkened and de-saturated on the way out so the towers land as a
 * near-black silhouette and the amber stays a horizon LINE rather than a wash
 * — the scene's single light source, the way the stage's colour rules ask for.
 *
 * sharp is not a dependency of this site (a native binary in a marketing
 * site's install), so it is borrowed, exactly as scripts/home-images does.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const require = createRequire(import.meta.url);
const loadSharp = () => {
  const tries = [
    process.env.SHARP_PATH,
    "sharp",
    join(homedir(), "projects/fluentia-lms-design/node_modules/sharp"),
  ].filter(Boolean);
  for (const t of tries) {
    try { return require(t); } catch { /* next */ }
  }
  throw new Error("sharp not found: set SHARP_PATH to a node_modules/sharp directory");
};
const sharp = loadSharp();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "public/home/cta-riyadh-wide-1920.webp");
const OUT_DIR = join(ROOT, "public/home");
const WIDTHS = [1024, 1600, 1920];
const check = process.argv.includes("--check");

/* Two bands, because a phone and a desktop need different amounts of sky.
   The desktop band is tight: its aspect ratio is what sets how tall the city
   renders, and a taller crop put the skyline across the hero's buttons. The
   phone band is taller on purpose — at 390px a 11.6:1 strip renders 64px
   tall, of which the fade leaves ~24px, which is not a dawn. */
const BANDS = {
  wide: { top: 0.555, bottom: 0.815 },
  phone: { top: 0.42, bottom: 0.83 },
};

const outName = (band, w, ext) =>
  join(OUT_DIR, band === "wide" ? `cine-horizon-${w}.${ext}` : `cine-horizon-${band}-${w}.${ext}`);

const allOutputs = () =>
  Object.keys(BANDS).flatMap((b) => WIDTHS.flatMap((w) => ["avif", "webp"].map((e) => outName(b, w, e))));

async function build() {
  if (!existsSync(SRC)) throw new Error(`missing source plate: ${SRC}`);
  const { width, height } = await sharp(SRC).metadata();

  const written = [];
  for (const [band, { top: t, bottom: b }] of Object.entries(BANDS)) {
    const top = Math.round(height * t);
    const bandH = Math.round(height * (b - t));
    for (const w of WIDTHS) {
      const base = sharp(SRC)
        .extract({ left: 0, top, width, height: bandH })
        // MIRRORED. The source puts all its warmth in the left half, and this
        // page is dir="rtl": the reader enters top-right and the headline
        // column IS the right, so unmirrored the Arabic sat over the dead
        // colourless half while the dawn glowed at the reading exit. Mirroring
        // is safe here ONLY because the silhouette is deliberately generic —
        // see the note in shots.json. If a real landmark is ever rendered into
        // this plate, delete this .flop() rather than ship it backwards.
        .flop()
        .resize({ width: w })
        // Crush the silhouette, KEEP the light. The first pass did
        // `brightness 0.74 / saturation 0.92`, which dimmed and desaturated
        // the one element in the frame that is supposed to be a pure colour —
        // its hottest pixels came out grey (r−b = +17). Separate the two jobs:
        // the linear ramp takes the towers to black, the modulate lets the
        // amber back up.
        .linear(1.34, -30)
        .modulate({ brightness: 1.02, saturation: 1.42 });

      await base.clone().avif({ quality: 54, effort: 6 }).toFile(outName(band, w, "avif"));
      await base.clone().webp({ quality: 76 }).toFile(outName(band, w, "webp"));
    }
    written.push(`${band}: band ${top}..${top + bandH} of ${height} · ` +
      WIDTHS.map((w) => `${w} ${(statSync(outName(band, w, "avif")).size / 1024).toFixed(1)}kB`).join(" · "));
  }
  return { written };
}

if (check) {
  const missing = allOutputs().filter((f) => !existsSync(f));
  if (missing.length) {
    console.error(`cinema horizon: missing ${missing.length} file(s)\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
  const srcAt = statSync(SRC).mtimeMs;
  const stale = allOutputs().filter((f) => statSync(f).mtimeMs < srcAt);
  if (stale.length) {
    console.error(`cinema horizon: ${stale.length} file(s) older than the source plate`);
    process.exit(1);
  }
  console.log("cinema horizon: up to date");
} else {
  const { written } = await build();
  console.log(`cinema horizon\n  ${written.join("\n  ")}`);
}
