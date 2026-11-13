// Muted single-colour versions of the client logos for the homepage hero row:
// ink (dark or coloured pixels) → cream, paper (white) → transparent.
// Run once (needs `sharp`, not a project dependency):
//   node scripts/hero/mono-logos.mjs [public/brand/entities] [public/brand/entities/mono]
import sharp from "sharp";
import fs from "node:fs";
const src = process.argv[2] || "public/brand/entities";
const out = process.argv[3] || `${src}/mono`;
fs.mkdirSync(out, { recursive: true });
for (const f of ["moi.svg", "mc.svg", "ksu.svg", "moj.png", "kau.png"]) {
  const slug = f.replace(/\.\w+$/, "");
  const img = sharp(`${src}/${f}`, { density: 300, limitInputPixels: false }).ensureAlpha().trim({ threshold: 10 });
  const { data, info } = await img.resize({ height: 160 }).raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3] / 255;
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // KSU is white on blue: its ink is the light parts.
    const ink = slug === "ksu" ? Math.min(1, Math.max(0, (L - 0.6) / 0.35)) : Math.min(1, Math.max(0, (1 - L) * 1.35));
    px[i * 4] = 243; px[i * 4 + 1] = 237; px[i * 4 + 2] = 226;
    px[i * 4 + 3] = Math.round(255 * a * ink);
  }
  const base = sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 });
  const buf = await base.png().toBuffer();
  const m = await sharp(buf).metadata();
  // 1x and 2x of the tallest use (30 px)
  for (const h of [32, 64]) {
    await sharp(buf).resize({ height: h }).webp({ quality: 72, alphaQuality: 70, effort: 6 }).toFile(`${out}/${slug}${h === 64 ? "@2x" : ""}.webp`);
  }
  console.log(slug, (m.width / m.height).toFixed(3));
}
