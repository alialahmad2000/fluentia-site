#!/usr/bin/env node
/**
 * «مجلة طلاقة» → carousel PNGs (TikTok photo mode + Instagram).
 *
 *   node tools/carousels/render.mjs              # lint + render everything + captions + contact sheet + posting plan
 *   node tools/carousels/render.mjs 03           # one carousel (id prefix); 03 07 → several
 *   node tools/carousels/render.mjs --check      # lint the content only (forbidden words, lengths, captions)
 *   node tools/carousels/render.mjs --sheet      # rebuild index.html + 00-POSTING-PLAN.md + captions, no rendering
 *   options: --out <dir> (default ~/Downloads/fluentia-carousels) · --size 4x5|9x16 · --html (keep the slide HTML next to the PNGs)
 *
 * Standalone: never runs the site build. Needs Chrome (CHROME_PATH or /Applications/Google Chrome.app)
 * and playwright-core (cd tools/carousels && npm install).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";
import { SIZES, docHTML } from "./lib/template.mjs";
import { lint } from "./lib/lint.mjs";
import { writeSheet, writePlan, captionText, folderName } from "./lib/package.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");

/* ── args ── */
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const flag = (k) => argv.includes(k);
const valued = new Set(["--out", "--size"]);
const ids = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1]));
const OUT = resolve(opt("--out") || join(os.homedir(), "Downloads", "fluentia-carousels"));
const sizes = opt("--size") ? [opt("--size")] : Object.keys(SIZES);

/* ── content ── */
const plan = JSON.parse(readFileSync(join(HERE, "plan.json"), "utf8"));
const { JOURNAL } = await import(pathToFileURL(join(ROOT, "src/content/journal/index.js")).href);
const all = readdirSync(join(HERE, "content"))
  .filter((f) => /^\d+-.+\.json$/.test(f))
  .sort()
  .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(HERE, "content", f), "utf8")) }));
for (const c of all) {
  const a = JOURNAL.find((x) => x.slug === c.article);
  if (!a) throw new Error(`${c.file}: article "${c.article}" is not in the journal`);
  c.articleTitle = a.title;
}
const pick = ids.length ? all.filter((c) => ids.some((id) => c.id === id.padStart(2, "0") || c.file.startsWith(id))) : all;
if (ids.length && !pick.length) throw new Error(`no carousel matches ${ids.join(", ")}`);

/* ── lint (always) ── */
const problems = pick.flatMap((c) => lint(c, plan));
for (const p of problems) console.log(`${p.level === "error" ? "✗" : "!"} ${p.id} ${p.msg}`);
if (problems.some((p) => p.level === "error")) {
  console.log("\nContent has errors; fix them first.");
  process.exit(1);
}
if (flag("--check")) {
  console.log(`✓ ${pick.length} carousels, ${pick.reduce((n, c) => n + c.slides.length, 0)} slides checked.`);
  process.exit(0);
}

/* ── assets: fonts (base64) ── */
const b64 = (p) => readFileSync(p).toString("base64");
const FONT = join(ROOT, "public/fonts");
const AR = "U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC";
const face = (fam, file, w, range) =>
  `@font-face{font-family:"${fam}";font-weight:${w};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${b64(join(FONT, file))}) format("woff2")${range ? `;unicode-range:${range}` : ""}}`;
const fontCSS = [
  face("Alexandria", "alexandria-var-latin.woff2", "600 900"),
  face("Alexandria", "alexandria-var-arabic.woff2", "600 900", AR),
  ...[400, 500, 700].flatMap((w) => [face("Plex", `plex-arabic-${w}-latin.woff2`, w), face("Plex", `plex-arabic-${w}-arabic.woff2`, w, AR)]),
].join("\n");
/* ── assets: brand mark, images ── */
const css = fontCSS + "\n" + readFileSync(join(HERE, "lib/styles.css"), "utf8");
mkdirSync(OUT, { recursive: true });
const finishPackage = () => {
  for (const c of pick) {
    const dir = join(OUT, folderName(c));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "caption.txt"), captionText(c, plan));
  }
  writeSheet(OUT, all, plan, fontCSS);
  writePlan(OUT, all, plan);
};
if (flag("--sheet")) {
  finishPackage();
  console.log(`✓ captions, index.html and 00-POSTING-PLAN.md → ${OUT}`);
  process.exit(0);
}

const mark = readFileSync(join(ROOT, "public/brand/fluentia-mark.svg"), "utf8")
  .replace(/<\?xml[^>]*>\s*/, "")
  .replace(/fill="rgb\([^"]*\)"/g, 'fill="currentColor"')
  .replace(/<svg /, '<svg aria-hidden="true" ');

const IMG = join(ROOT, "public/images/journal/gallery");
const imgCache = new Map();
function imageFor(size) {
  const want = SIZES[size].img; // post | story
  return (name) => {
    if (!name) throw new Error("slide needs an image");
    const key = `${name}@${want}`;
    if (imgCache.has(key)) return imgCache.get(key);
    const cands = [join(IMG, `${name}-${want}.webp`), join(IMG, `${name}-w1920.webp`), join(IMG, `${name}.webp`), join(ROOT, name)];
    const f = cands.find((p) => existsSync(p) && statSync(p).isFile());
    if (!f) throw new Error(`image "${name}" not found (looked for ${cands.join(", ")})`);
    const ext = f.split(".").pop().replace("jpg", "jpeg");
    const uri = `data:image/${ext};base64,${b64(f)}`;
    imgCache.set(key, uri);
    return uri;
  };
}

/* ── render ── */
let pw;
try { pw = await import("playwright-core"); } catch {
  try { pw = await import("playwright"); } catch {
    console.error("playwright-core is missing: cd tools/carousels && npm install");
    process.exit(1);
  }
}
const chromium = pw.chromium || pw.default?.chromium;
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROME) ? { executablePath: CHROME } : {}) });
const BUILD = join(os.tmpdir(), "fluentia-carousels-build");
mkdirSync(BUILD, { recursive: true });

const jobs = pick.flatMap((c) => sizes.map((size) => ({ c, size })));
const warnings = [];
async function run({ c, size }) {
  const S = SIZES[size];
  const html = docHTML(c, { size, mark, img: imageFor(size), issue: plan.issue, articleTitle: c.articleTitle }, css);
  const file = join(BUILD, `${c.id}-${size}.html`);
  writeFileSync(file, html);
  const dir = join(OUT, folderName(c), size);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  if (flag("--html")) writeFileSync(join(dir, "slides.html"), html.replace("<body>", '<body class="all">'));

  const page = await browser.newPage({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  // every slide visible once, so the browser fetches every face it needs (display:none text loads nothing)
  await page.evaluate(() => { document.body.classList.add("all"); return document.fonts.ready.then(() => true); });
  await page.waitForTimeout(1400);
  const fontsOk = await page.evaluate(() => {
    const ok = document.fonts.check('800 40px Alexandria', 'طلاقة') && document.fonts.check('500 40px Plex', 'طلاقة');
    document.body.classList.remove("all");
    return ok;
  });
  if (!fontsOk) warnings.push(`${c.id} ${size}: fonts did not load`);
  for (let i = 0; i < c.slides.length; i++) {
    const issues = await page.evaluate((i) => {
      document.querySelectorAll("section.s").forEach((s, k) => s.classList.toggle("show", k === i));
      const sec = document.querySelectorAll("section.s")[i];
      const out = [];
      const ct = sec.querySelector(".ct");
      if (ct && ct.scrollHeight > ct.clientHeight + 2) out.push(`content taller than its box by ${ct.scrollHeight - ct.clientHeight}px`);
      if (ct && ct.firstElementChild) {
        const top = Math.min(...[...ct.children].map((k) => k.getBoundingClientRect().top));
        const lim = ct.getBoundingClientRect().top;
        if (top < lim - 2) out.push(`content rises ${Math.round(lim - top)}px above its box`);
      }
      const box = sec.getBoundingClientRect();
      sec.querySelectorAll(".ct *, .myth *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.left < box.left - 1 || r.right > box.right + 1)) out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> spills sideways`);
      });
      return [...new Set(out)];
    }, i);
    for (const m of issues) warnings.push(`${c.id} ${size} slide ${i + 1}: ${m}`);
    await page.screenshot({ path: join(dir, `${String(i + 1).padStart(2, "0")}.png`), type: "png" });
  }
  await page.close();
  console.log(`✓ ${c.id} ${size} · ${c.slides.length} slides`);
}
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => { while (queue.length) await run(queue.shift()); }));
await browser.close();

finishPackage();
for (const w of warnings) console.log(`! ${w}`);
console.log(`\n✓ ${pick.length} carousels → ${OUT}\n  open ${join(OUT, "index.html")}`);
