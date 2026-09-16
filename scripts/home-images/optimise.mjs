#!/usr/bin/env node
/**
 * optimise — cut, size and encode every homepage image in images.json.
 *
 *   RAW_DIR=/scratch/raw node scripts/home-images/optimise.mjs            # all images
 *   RAW_DIR=/scratch/raw node scripts/home-images/optimise.mjs worth-door  # just these ids
 *   node scripts/home-images/optimise.mjs --check                         # ship gate
 *
 * For each image and each of its variants (a crop at a fixed aspect around
 * `focus`), writes public/home/<id>-<variant>-<width>.avif and .webp, then
 * rewrites src/pages/v5/homeImages.json, which HomePicture reads for srcset,
 * width/height and aspect. Encoding steps quality down until a file fits
 * budgetKB for its width, so no single image can blow the page budget.
 *
 * An image whose `source` is null gets a flat two-tone placeholder of the exact
 * aspect, and is marked `placeholder: true` in homeImages.json (the pictures
 * carry data-placeholder). --check exits 1 while any placeholder or file is
 * missing: run it before shipping.
 *
 * sharp is not a dependency of this site (it would add a native binary to
 * every Vercel install for a script that runs by hand). It is resolved from
 * SHARP_PATH, then this repo, then ~/projects/fluentia-lms-design.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SPEC = JSON.parse(readFileSync(new URL("./images.json", import.meta.url), "utf8"));
const RAW = process.env.RAW_DIR || join(tmpdir(), "fluentia-home-raw");
const OUT = join(ROOT, SPEC.outDir);
const DATA = join(ROOT, SPEC.dataFile);

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const only = new Set(args.filter((a) => !a.startsWith("--")));

const ratio = (s) => {
  const [a, b] = String(s).split(":").map(Number);
  return a / b;
};
const fileFor = (id, variant, w, ext) => `${id}-${variant}-${w}.${ext}`;

if (CHECK) {
  const data = JSON.parse(readFileSync(DATA, "utf8"));
  const problems = [];
  for (const img of SPEC.images) {
    const d = data[img.id];
    if (!d) { problems.push(`${img.id}: missing from homeImages.json`); continue; }
    if (d.placeholder) problems.push(`${img.id}: still a placeholder`);
    for (const [v, spec] of Object.entries(img.variants)) {
      for (const w of spec.widths) {
        for (const ext of ["avif", "webp"]) {
          const f = join(OUT, fileFor(img.id, v, w, ext));
          if (!existsSync(f)) problems.push(`${img.id}: missing ${fileFor(img.id, v, w, ext)}`);
          else if (ext === "avif" && statSync(f).size > (SPEC.budgetKB[w] || 160) * 1024) problems.push(`${img.id}: ${fileFor(img.id, v, w, ext)} over budget`);
        }
      }
    }
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`home images: ${SPEC.images.length} images, all real, all files present and in budget`);
  process.exit(0);
}

const require = createRequire(import.meta.url);
function loadSharp() {
  const tries = [process.env.SHARP_PATH, "sharp", join(homedir(), "projects/fluentia-lms-design/node_modules/sharp")].filter(Boolean);
  for (const t of tries) {
    try { return require(t); } catch { /* next */ }
  }
  throw new Error("sharp not found: set SHARP_PATH to a node_modules/sharp directory");
}
const sharp = loadSharp();

async function sourceBuffer(img) {
  const s = img.source;
  if (!s) return null;
  if (s.startsWith("raw:")) {
    const f = join(RAW, s.slice(4));
    if (!existsSync(f)) throw new Error(`${img.id}: ${f} not found (set RAW_DIR)`);
    return readFileSync(f);
  }
  if (/^https:\/\//.test(s)) {
    const cache = join(RAW, "real", `${img.id}${s.match(/\.[a-z]+$/i)?.[0] || ".img"}`);
    if (existsSync(cache)) return readFileSync(cache);
    const res = await fetch(s);
    if (!res.ok) throw new Error(`${img.id}: ${res.status} fetching ${s}`);
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(join(RAW, "real"), { recursive: true });
    writeFileSync(cache, buf);
    return buf;
  }
  throw new Error(`${img.id}: unknown source ${s}`);
}

/** A flat two-tone field at the image's own aspect; honest about being a stand-in. */
async function placeholderBuffer(img) {
  const r = ratio(img.aspect);
  const W = r >= 1 ? 2400 : Math.round(2400 * r);
  const H = r >= 1 ? Math.round(2400 / r) : 2400;
  const [a, b] = img.placeholder || ["#0d1a30", "#04070e"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function cropBox(W, H, aspect, focus = [0.5, 0.5]) {
  const r = ratio(aspect);
  let w = W, h = Math.round(W / r);
  if (h > H) { h = H; w = Math.round(H * r); }
  const left = Math.min(W - w, Math.max(0, Math.round(focus[0] * W - w / 2)));
  const top = Math.min(H - h, Math.max(0, Math.round(focus[1] * H - h / 2)));
  return { left, top, width: w, height: h };
}

async function encode(base, w, h, ext, budgetBytes) {
  const steps = ext === "avif" ? [54, 48, 42, 36, 30] : [76, 70, 62, 54, 46];
  let out;
  for (const q of steps) {
    const p = sharp(base).resize(w, h, { fit: "fill", kernel: "lanczos3" });
    out = ext === "avif"
      ? await p.avif({ quality: q, effort: 6, chromaSubsampling: "4:2:0" }).toBuffer()
      : await p.webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer();
    if (out.length <= budgetBytes) return { buf: out, q };
  }
  return { buf: out, q: steps.at(-1), over: true };
}

mkdirSync(OUT, { recursive: true });
const data = existsSync(DATA) ? JSON.parse(readFileSync(DATA, "utf8")) : {};
const rows = [];
for (const img of SPEC.images) {
  if (only.size && !only.has(img.id)) continue;
  const src = await sourceBuffer(img);
  const isPlaceholder = !src;
  const buf = src || (await placeholderBuffer(img));
  const meta = await sharp(buf).metadata();
  // `grade` pulls a render into the page's palette (saturation/brightness), never a colour wash.
  const graded = img.grade ? await sharp(buf).modulate(img.grade).toBuffer() : buf;
  const entry = { placeholder: isPlaceholder, variants: {} };
  for (const [name, v] of Object.entries(img.variants)) {
    const box = cropBox(meta.width, meta.height, v.aspect, v.focus || img.focus);
    const cut = await sharp(graded).extract(box).toBuffer();
    const r = ratio(v.aspect);
    for (const w of v.widths) {
      if (!isPlaceholder && w > box.width * 1.05) console.warn(`  ! ${img.id}/${name}: ${w}w is an upscale of a ${box.width}px crop`);
      const h = Math.round(w / r);
      const budget = (SPEC.budgetKB[w] || 160) * 1024;
      for (const ext of ["avif", "webp"]) {
        // WebP only reaches browsers without AVIF; it may run a third over.
        const { buf: o, q, over } = await encode(cut, w, h, ext, ext === "avif" ? budget : budget * 1.35);
        writeFileSync(join(OUT, fileFor(img.id, name, w, ext)), o);
        rows.push(`${fileFor(img.id, name, w, ext).padEnd(38)} ${String(Math.round(o.length / 1024)).padStart(4)} KB  q${q}${over ? "  OVER BUDGET" : ""}`);
      }
    }
    const top = v.widths.at(-1);
    entry.variants[name] = { w: top, h: Math.round(top / r), widths: v.widths };
  }
  data[img.id] = entry;
}
writeFileSync(DATA, JSON.stringify(data, null, 1) + "\n");
console.log(rows.join("\n"));
const ph = Object.entries(data).filter(([, d]) => d.placeholder).map(([id]) => id);
console.log(ph.length ? `placeholders still in place: ${ph.join(", ")}` : "no placeholders");
