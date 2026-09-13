// Door art for the grammar room: the entry's two real diagrams, drawn by the real renderer
// (the running room page), composed on the reference's own obsidian ground, saved as WebP.
// usage: node scripts/tour/grammar/make-door.cjs [baseUrl] [out=public/tour/grammar/door.webp] [preview.png]
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [,, BASE = 'http://127.0.0.1:5292', OUT = path.join(__dirname, '../../../public/tour/grammar/door.webp'), PREVIEW] = process.argv;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/tour/grammar`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const svgs = document.querySelectorAll('.gref-fig svg');
    const stage = document.createElement('div');
    // inside .gref so the --gref-* tokens and .gref-fig rules resolve exactly as on the page
    stage.className = 'door-stage';
    Object.assign(stage.style, {
      position: 'fixed', left: '0', top: '0', width: '1400px', height: '900px', zIndex: '100000', background: '#05070d', overflow: 'hidden',
    });
    const place = (svg, { left, top, width, fade }) => {
      const fig = document.createElement('figure');
      fig.className = 'gref-fig';
      Object.assign(fig.style, { position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${width}px`, margin: 0, padding: 0, border: 0 });
      if (fade) {
        // the hub lays the room's title over the bottom third: let the board sink into the ground before it
        fig.style.webkitMaskImage = fig.style.maskImage = `linear-gradient(to bottom, #000 ${fade[0]}%, transparent ${fade[1]}%)`;
      }
      const clone = svg.cloneNode(true);
      clone.style.width = '100%';
      fig.appendChild(clone);
      stage.appendChild(fig);
    };
    // contrast bars across the upper third, the signal board's heads under them, fading out
    place(svgs[0], { left: 90, top: 30, width: 1240 });
    place(svgs[1], { left: 110, top: 288, width: 1180, fade: [28, 62] });
    document.querySelector('.gref').appendChild(stage);
    document.querySelector('.tour-bar').style.visibility = 'hidden';
    const st = document.createElement('style');
    st.textContent = 'html{scrollbar-width:none} html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}';
    document.head.appendChild(st);
  });
  await page.waitForTimeout(300);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 900 } });

  const dataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 1400; c.height = 900;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.86);
  }, png.toString('base64'));
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  if (PREVIEW) fs.writeFileSync(PREVIEW, png);
  console.log(`door → ${OUT} (${buf.length} bytes, ${dataUrl.startsWith('data:image/webp') ? 'webp' : 'NOT webp'})`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
