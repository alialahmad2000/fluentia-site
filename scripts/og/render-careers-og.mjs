/**
 * render-careers-og — scripts/og/careers-og.html → public/og/careers.png (1200×630).
 *
 * Zero dependencies: drives the locally installed Google Chrome in headless mode
 * (no Playwright/sharp in package.json, nothing added to the build). Then checks
 * the PNG is exactly 1200×630 and under WhatsApp's ~300 KB preview ceiling.
 *
 * Run: npm run og:careers   (CHROME=/path/to/chrome to override the binary)
 * After a change: bump ?v= on the /careers ogImage in src/content/seo.js —
 * WhatsApp caches previews per image URL.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync, crc32 } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "scripts", "og", "careers-og.html");
const OUT = join(ROOT, "public", "og", "careers.png");
const MAX_BYTES = 300 * 1024;

const CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) throw new Error("No Chrome found — set CHROME=/path/to/chrome");

execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  "--virtual-time-budget=3000", // let the woff2 fonts load before the shot
  "--allow-file-access-from-files",
  `--screenshot=${OUT}`,
  pathToFileURL(SRC).href,
], { stdio: ["ignore", "ignore", "pipe"] });

/** Chrome writes PNGs with fast zlib settings. Re-deflate the image data at
 *  level 9 — lossless, same pixels, typically 10–25% smaller. */
function recompress(buf) {
  const chunks = [];
  const idat = [];
  for (let o = 8; o < buf.length; ) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString("latin1", o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === "IDAT") { if (!idat.length) chunks.push("IDAT"); idat.push(data); }
    else if (type === "IHDR" || type === "IEND") chunks.push([type, data]); // drop ancillary chunks
    o += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const z = deflateSync(raw, { level: 9, memLevel: 9 });
  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, "latin1");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
    return Buffer.concat([head, data, crc]);
  };
  return Buffer.concat([
    buf.subarray(0, 8),
    ...chunks.map((c) => (c === "IDAT" ? chunk("IDAT", z) : chunk(c[0], c[1]))),
  ]);
}
writeFileSync(OUT, recompress(readFileSync(OUT)));

// PNG IHDR: width/height are big-endian u32 at bytes 16 and 20.
const png = readFileSync(OUT);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
const bytes = statSync(OUT).size;
if (w !== 1200 || h !== 630) throw new Error(`careers.png is ${w}×${h}, expected 1200×630`);
if (bytes > MAX_BYTES) throw new Error(`careers.png is ${Math.round(bytes / 1024)} KB — over 300 KB; simplify gradients or quantize`);
console.log(`og:careers → public/og/careers.png  ${w}×${h}  ${Math.round(bytes / 1024)} KB`);
