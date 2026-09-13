/**
 * The hub door for /tour/verbs → public/tour/verbs/door.webp (1400×900).
 *
 *   node scripts/tour/verbs/make-door.cjs http://127.0.0.1:5294
 *
 * Cut from the room itself, not drawn: the session is walked to the sing
 * verdict (the i-a-u family's canonical sang/sung), then everything but the
 * verb room and its three-form plate is taken away, the plate is set large in
 * the upper two-thirds (left to right, as the English reads), and the frame
 * is encoded to WebP by Chromium (no cwebp on this machine). The hub crops the
 * art with background-size:cover into near-square cards whose lower half is
 * the title, so the plate stays inside the central 800px and above y≈330. No Arabic text — the only words are the three forms.
 */
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright')
const { writeFileSync } = require('node:fs')
const { join } = require('node:path')

const BASE = process.argv[2] || 'http://127.0.0.1:5294'
const OUT = join(__dirname, '..', '..', '..', 'public', 'tour', 'verbs', 'door.webp')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${BASE}/tour/verbs/session`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /فهمت، التالي/ }).click()
  await page.getByRole('button', { name: 'sang', exact: true }).click()
  await page.waitForTimeout(500)

  await page.evaluate(() => {
    document.querySelector('.tour-bar').style.display = 'none'
    document.querySelector('.tour-end').style.display = 'none'
    document.documentElement.style.scrollbarWidth = 'none'
    document.documentElement.style.overflow = 'hidden'
    const shell = document.querySelector('.vocab-cosmos')
    shell.style.cssText += ';height:900px;overflow:hidden'
    const plate = shell.querySelector('.vl-p.vl-c-green .vl-forms').cloneNode(true)
    plate.querySelectorAll('.vl-form__tag,.vl-form__note,.vl-form__say').forEach((e) => e.remove())
    plate.style.gap = '16px'
    // art, not UI: read as English reads it, sing → sang → sung
    plate.setAttribute('dir', 'ltr')
    plate.querySelectorAll('.vl-form').forEach((f) => {
      f.classList.remove('vl-form--hit')
      f.style.cssText = 'min-height:196px;border-radius:22px;animation:none'
    })
    plate.querySelectorAll('.vl-form__word').forEach((w) => { w.style.fontSize = '80px'; w.style.letterSpacing = '-0.02em' })
    const panel = document.createElement('div')
    panel.className = 'vl-p vl-c-violet'
    panel.style.cssText = 'width:800px;margin:104px auto 0;padding:22px;border-radius:30px'
    panel.appendChild(plate)
    const col = shell.querySelector('.vc-content')
    col.replaceChildren(panel)
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(400)
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 900 } })

  const webp = await page.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = 1400; c.height = 900
    c.getContext('2d').drawImage(img, 0, 0)
    for (const q of [0.86, 0.8, 0.72, 0.62]) {
      const url = c.toDataURL('image/webp', q)
      if (url.length * 0.75 < 190000) return url
    }
    return c.toDataURL('image/webp', 0.55)
  }, png.toString('base64'))
  const buf = Buffer.from(webp.split(',')[1], 'base64')
  writeFileSync(OUT, buf)
  console.log(`door.webp ${buf.length} bytes`)
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
