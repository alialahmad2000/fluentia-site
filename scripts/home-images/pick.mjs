#!/usr/bin/env node
/**
 * pick — point an image in images.json at a chosen raw render (and its crop focus).
 *
 *   node scripts/home-images/pick.mjs worth-door worth-door--123456.jpg [focusX focusY]
 *
 * Writes `source: "raw:<file>"` and `seed`, and — when given — the focus used by
 * every variant that has no focus of its own. Run optimise.mjs <id> afterwards.
 */
import { readFileSync, writeFileSync } from "node:fs";

const url = new URL("./images.json", import.meta.url);
const spec = JSON.parse(readFileSync(url, "utf8"));
const [id, file, fx, fy] = process.argv.slice(2);
const img = spec.images.find((i) => i.id === id);
if (!img || !file) throw new Error("usage: pick.mjs <id> <file-in-RAW_DIR> [focusX focusY]");
img.source = `raw:${file}`;
img.seed = Number(file.match(/--(\d+)\.jpg$/)?.[1]) || null;
if (fx !== undefined) img.focus = [Number(fx), Number(fy ?? 0.5)];
writeFileSync(url, JSON.stringify(spec, null, 2) + "\n");
console.log(`${id} ← raw:${file}${img.focus ? ` focus ${img.focus}` : ""}`);
