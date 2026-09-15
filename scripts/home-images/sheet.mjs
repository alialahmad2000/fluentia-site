#!/usr/bin/env node
/**
 * sheet — a labelled contact sheet of raw renders, for review before picking.
 *
 *   RAW_DIR=/scratch/raw node scripts/home-images/sheet.mjs [id-prefix] > /dev/null   → RAW_DIR/sheet[-prefix].jpg
 *
 * Every <id>--<seed>.jpg in RAW_DIR (or those starting with the prefix), fitted
 * whole (no crop) into equal cells, labelled with the file name.
 */
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const RAW = process.env.RAW_DIR || join(tmpdir(), "fluentia-home-raw");
const prefix = process.argv[2] || "";
const require = createRequire(import.meta.url);
const sharp = [process.env.SHARP_PATH, "sharp", join(homedir(), "projects/fluentia-lms-design/node_modules/sharp")]
  .filter(Boolean)
  .map((p) => { try { return require(p); } catch { return null; } })
  .find(Boolean);
if (!sharp) throw new Error("sharp not found: set SHARP_PATH");

const files = readdirSync(RAW).filter((f) => /--\d+\.jpg$/.test(f) && f.startsWith(prefix)).sort();
if (!files.length) throw new Error(`no renders in ${RAW}`);
const COLS = Math.min(4, files.length), CW = 560, CH = 560, PAD = 8, LABEL = 26;
const rows = Math.ceil(files.length / COLS);
const composites = [];
for (let i = 0; i < files.length; i++) {
  const x = PAD + (i % COLS) * (CW + PAD), y = PAD + Math.floor(i / COLS) * (CH + LABEL + PAD);
  const img = await sharp(join(RAW, files[i])).resize(CW, CH, { fit: "contain", background: "#111" }).toBuffer();
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${LABEL}"><rect width="100%" height="100%" fill="#000"/><text x="8" y="18" font-size="15" fill="#fff" font-family="Helvetica">${files[i]}</text></svg>`);
  composites.push({ input: img, left: x, top: y + LABEL }, { input: label, left: x, top: y });
}
const out = join(RAW, `sheet${prefix ? "-" + prefix : ""}.jpg`);
await sharp({ create: { width: PAD + COLS * (CW + PAD), height: PAD + rows * (CH + LABEL + PAD), channels: 3, background: "#1a1a1a" } })
  .composite(composites).jpeg({ quality: 84 }).toFile(out);
console.error(out);
