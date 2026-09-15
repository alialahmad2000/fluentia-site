/**
 * shoot-platform — the REAL platform screen for the homepage's «منصة متكاملة» pillar.
 *
 *   node scripts/home-images/shoot-platform.cjs http://127.0.0.1:5173   (a running dev or preview server)
 *
 * Renders /tour/unit/extreme-weather/vocabulary — the unit's vocabulary room,
 * drawn by the platform's own components from a static snapshot (no student
 * data) — at 390 wide, DPR 2, with the tour's own chrome (.tour-chrome: top
 * bar, room intro, room end) removed so what remains is the student screen.
 * Writes RAW_DIR/real/platform-vocab.png (780×1280); optimise.mjs cuts it.
 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || require("os").homedir() + "/projects/fluentia-lms/node_modules/playwright");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");

const BASE = process.argv[2] || "http://127.0.0.1:5173";
const RAW = process.env.RAW_DIR || join(tmpdir(), "fluentia-home-raw");
// Match analytics on the HOST: a path regex on "tiktok" also blocks the site's own src/lib/tiktokPixel.js.
const NO_ANALYTICS = (u) =>
  /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|tiktok\.com)$/.test(u.hostname) ||
  (u.hostname === "www.google.com" && /^\/(ccm|rmkt)\//.test(u.pathname));

(async () => {
  mkdirSync(join(RAW, "real"), { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.route(NO_ANALYTICS, (r) => r.abort());
  await page.goto(`${BASE}/tour/unit/extreme-weather/vocabulary`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".tour-chrome{display:none!important} html{scroll-behavior:auto!important}" });
  await page.waitForTimeout(1500);
  if (await page.$("vite-error-overlay")) throw new Error("vite error overlay on the tour page");
  // Open on the unit's word header, the way the student lands on the tab.
  const top = await page.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find((p) => p.textContent.trim() === "مفردات الوحدة");
    const card = el && el.closest(".rounded-2xl");
    if (!card) return null;
    return Math.max(0, card.getBoundingClientRect().top + window.scrollY - 16);
  });
  if (top === null) throw new Error("vocabulary header card not found — the room changed; update this script");
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(1200);
  const words = await page.evaluate(() => document.body.innerText.match(/precipitation|shoreline|parched/g)?.length || 0);
  if (!words) throw new Error("no word cards rendered");
  const out = join(RAW, "real", "platform-vocab.png");
  await page.screenshot({ path: out });
  console.log(out);
  await browser.close();
})();
