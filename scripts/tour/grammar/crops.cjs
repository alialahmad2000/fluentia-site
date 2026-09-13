// Viewport crops of the grammar room, top to bottom, for looking at the real pixels.
// usage: node scripts/tour/grammar/crops.cjs <baseUrl> <outDir> [path=/tour/grammar] [width=1440]
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright');
const [,, base = 'http://127.0.0.1:5292', out = '.', path = '/tour/grammar', width = '1440'] = process.argv;
(async () => {
  const w = Number(width);
  const h = w < 600 ? 844 : 900;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const tag = path.replace(/\W+/g, '_');
  let i = 0;
  for (let y = 0; y < total; y += h - 60) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/${tag}-${w}-${String(i++).padStart(2, '0')}.png` });
  }
  console.log(`${i} crops, height ${total}`, errs.length ? errs : 'no errors');
  await browser.close();
})();
