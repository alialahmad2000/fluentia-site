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

/* The band, as a fraction of the source frame. Measured off the plate: the
   towers top out around 0.50 and their base sits on 0.80. The band is kept
   TIGHT — its aspect ratio is what sets how tall the city renders, and a
   taller crop put the skyline across the hero's buttons. */
const BAND_TOP = 0.555;
const BAND_BOTTOM = 0.815;

const outName = (w, ext) => join(OUT_DIR, `cine-horizon-${w}.${ext}`);

async function build() {
  if (!existsSync(SRC)) throw new Error(`missing source plate: ${SRC}`);
  const src = sharp(SRC);
  const { width, height } = await src.metadata();
  const top = Math.round(height * BAND_TOP);
  const bandH = Math.round(height * (BAND_BOTTOM - BAND_TOP));

  const written = [];
  for (const w of WIDTHS) {
    const base = sharp(SRC)
      .extract({ left: 0, top, width, height: bandH })
      .resize({ width: w })
      // towers → silhouette, amber → a line and not a wash
      .modulate({ brightness: 0.74, saturation: 0.92 })
      .linear(1.12, -14);

    await base.clone().avif({ quality: 52, effort: 6 }).toFile(outName(w, "avif"));
    await base.clone().webp({ quality: 74 }).toFile(outName(w, "webp"));
    written.push(
      `${w}: avif ${(statSync(outName(w, "avif")).size / 1024).toFixed(1)} kB · webp ${(statSync(outName(w, "webp")).size / 1024).toFixed(1)} kB`
    );
  }
  return { written, band: `${top}..${top + bandH} of ${height}` };
}

if (check) {
  const missing = WIDTHS.flatMap((w) => ["avif", "webp"].map((e) => outName(w, e))).filter((f) => !existsSync(f));
  if (missing.length) {
    console.error(`cinema horizon: missing ${missing.length} file(s)\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
  const srcAt = statSync(SRC).mtimeMs;
  const stale = WIDTHS.flatMap((w) => ["avif", "webp"].map((e) => outName(w, e))).filter((f) => statSync(f).mtimeMs < srcAt);
  if (stale.length) {
    console.error(`cinema horizon: ${stale.length} file(s) older than the source plate`);
    process.exit(1);
  }
  console.log("cinema horizon: up to date");
} else {
  const { written, band } = await build();
  console.log(`cinema horizon — band ${band}\n  ${written.join("\n  ")}`);
}
