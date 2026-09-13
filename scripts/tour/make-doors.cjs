/**
 * make-doors — the art each room shows on its doors.
 *
 *   node scripts/tour/make-doors.cjs http://127.0.0.1:5296
 *
 * Two shapes, because the doors sit in two different frames:
 *   door.webp       1400×900  the /tour hub cards (landscape, title over the lower third)
 *   door-tall.webp   600×800  the homepage band (3:4 portrait, title at the foot)
 *
 * Photographic doors (unit cover, proverb plate, reading room) are cut from
 * each room's existing door.webp around a focal point. The grammar and verbs
 * doors are composed from the rooms themselves, drawn by the real renderers on
 * a running dev server, so what's on the door is what's in the room:
 *   grammar  the entry's header (title + Arabic name) over its contrast diagram
 *   verbs    the sing · sang · sung plate, stacked for the tall frame
 * Encoding is Chromium's canvas WebP (no cwebp on this machine).
 */
const { chromium } = require("/Users/dr.ali/projects/fluentia-lms/node_modules/playwright");
const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE = process.argv[2] || "http://127.0.0.1:5296";
const PUB = join(__dirname, "..", "..", "public", "tour");
const BUDGET = 190000;
// Never send analytics hits from a tooling run.
// Match on the host, never on the path: the app's own src/lib/tiktokPixel.js must still load.
const NO_ANALYTICS = (url) =>
  /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|tiktok\.com)$/.test(url.hostname) ||
  (url.hostname === "www.google.com" && /^\/(ccm|rmkt)\//.test(url.pathname));
async function openPage(browser, opts) {
  const p = await browser.newPage(opts);
  await p.route(NO_ANALYTICS, (r) => r.abort());
  return p;
}

async function encode(page, png, w, h, crop) {
  const url = await page.evaluate(
    async ({ b64, w, h, crop, budget }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      g.imageSmoothingQuality = "high";
      if (crop) g.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
      else g.drawImage(img, 0, 0, w, h);
      for (const q of [0.86, 0.8, 0.72, 0.62]) {
        const u = c.toDataURL("image/webp", q);
        if (u.length * 0.75 < budget) return u;
      }
      return c.toDataURL("image/webp", 0.55);
    },
    { b64: png.toString("base64"), w, h, crop, budget: BUDGET }
  );
  if (!url.startsWith("data:image/webp")) throw new Error("canvas did not encode WebP");
  return Buffer.from(url.split(",")[1], "base64");
}

function save(room, name, buf) {
  writeFileSync(join(PUB, room, name), buf);
  console.log(`${room}/${name} ${buf.length} bytes`);
}

/** Tall cut of an existing landscape door around a horizontal focal point (0..1). */
async function tallFromDoor(page, room, focalX) {
  const src = readFileSync(join(PUB, room, "door.webp"));
  const png = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/webp;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/png").split(",")[1];
  }, src.toString("base64"));
  const W = 1400, H = 900, cw = Math.round((H * 3) / 4);
  const x = Math.max(0, Math.min(W - cw, Math.round(focalX * W - cw / 2)));
  save(room, "door-tall.webp", await encode(page, Buffer.from(png, "base64"), 600, 800, { x, y: 0, w: cw, h: H }));
}

async function hideChrome(page) {
  await page.addStyleTag({
    content: ".tour-bar,.tour-end,.tour-intro{display:none!important} html{scrollbar-width:none;overflow:hidden} html::-webkit-scrollbar{display:none}",
  });
}

async function grammarDoors(browser) {
  // The entry's own header (its English title + Arabic name, as the page sets
  // them) over its contrast diagram, drawn by the real renderer.
  for (const [w, h, name, cfg] of [
    [1400, 900, "door.webp", { titleSize: 76, subSize: 34, titleTop: 96, svgWidth: 1120, svgTop: 330, maxTitle: 1200 }],
    [600, 800, "door-tall.webp", { titleSize: 50, subSize: 24, titleTop: 86, svgWidth: 580, svgTop: 360, maxTitle: 400 }],
  ]) {
    const page = await openPage(browser, { viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/tour/grammar`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector(".gref-fig svg", { timeout: 15000 });
    await hideChrome(page);
    await page.evaluate(({ w, h, cfg }) => {
      const gref = document.querySelector(".gref");
      const title = gref.querySelector("h1").textContent.trim();
      const sub = gref.querySelector("h1").parentElement.querySelector("p").textContent.trim();
      const svg = gref.querySelector(".gref-fig svg");
      const stage = document.createElement("div");
      Object.assign(stage.style, {
        position: "fixed", left: "0", top: "0", width: `${w}px`, height: `${h}px`, zIndex: "100000", overflow: "hidden",
        background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(233,185,73,0.13), transparent 70%), #05070d",
        display: "flex", flexDirection: "column", alignItems: "center",
      });
      const t = document.createElement("div");
      t.textContent = title;
      t.dir = "ltr";
      Object.assign(t.style, {
        marginTop: `${cfg.titleTop}px`, maxWidth: `${cfg.maxTitle}px`, textAlign: "center", color: "#fff",
        font: `700 ${cfg.titleSize}px/1.08 "Inter Tight", Inter, system-ui, sans-serif`, letterSpacing: "-0.02em",
      });
      const a = document.createElement("div");
      a.textContent = sub;
      a.dir = "rtl";
      Object.assign(a.style, { marginTop: "18px", color: "rgba(233,185,73,0.9)", font: `500 ${cfg.subSize}px/1.4 Tajawal, sans-serif` });
      const fig = document.createElement("figure");
      fig.className = "gref-fig";
      Object.assign(fig.style, { position: "absolute", left: `${(w - cfg.svgWidth) / 2}px`, top: `${cfg.svgTop}px`, width: `${cfg.svgWidth}px`, margin: 0, padding: 0, border: 0 });
      const clone = svg.cloneNode(true);
      clone.style.width = "100%";
      // art, not a figure to read: keep the bars and their English labels, drop the small Arabic glosses
      clone.querySelectorAll("text").forEach((el) => { if (/[\u0600-\u06FF]/.test(el.textContent)) el.remove(); });
      fig.appendChild(clone);
      stage.append(t, a, fig);
      gref.appendChild(stage);
      window.scrollTo(0, 0);
    }, { w, h, cfg });
    await page.waitForTimeout(300);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h } });
    save("grammar", name, await encode(page, png, w, h));
    await page.close();
  }
}

async function verbsTall(browser) {
  const page = await openPage(browser, { viewport: { width: 600, height: 800 }, deviceScaleFactor: 2 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${BASE}/tour/verbs/session`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /فهمت، التالي/ }).click();
  await page.getByRole("button", { name: "sang", exact: true }).click();
  await page.waitForTimeout(500);
  await hideChrome(page);
  await page.evaluate(() => {
    const shell = document.querySelector(".vocab-cosmos");
    shell.style.cssText += ";height:800px;overflow:hidden";
    const plate = shell.querySelector(".vl-p.vl-c-green .vl-forms").cloneNode(true);
    plate.querySelectorAll(".vl-form__tag,.vl-form__note,.vl-form__say").forEach((e) => e.remove());
    plate.setAttribute("dir", "ltr");
    plate.style.cssText = "display:grid;grid-template-columns:1fr;gap:14px";
    plate.querySelectorAll(".vl-form").forEach((f) => {
      f.classList.remove("vl-form--hit");
      f.style.cssText = "min-height:112px;border-radius:20px;animation:none;display:flex;align-items:center;justify-content:center";
    });
    plate.querySelectorAll(".vl-form__word").forEach((wd) => { wd.style.fontSize = "64px"; wd.style.letterSpacing = "-0.02em"; });
    const panel = document.createElement("div");
    panel.className = "vl-p vl-c-violet";
    panel.style.cssText = "width:420px;margin:70px auto 0;padding:18px;border-radius:28px";
    panel.appendChild(plate);
    shell.querySelector(".vc-content").replaceChildren(panel);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 600, height: 800 } });
  save("verbs", "door-tall.webp", await encode(page, png, 600, 800));
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  const util = await openPage(browser, {});
  await util.goto(`${BASE}/tour`, { waitUntil: "domcontentloaded" });
  await grammarDoors(browser);
  await verbsTall(browser);
  await tallFromDoor(util, "unit", 0.5);
  await tallFromDoor(util, "expressions", 0.62);
  await tallFromDoor(util, "library", 0.5);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
