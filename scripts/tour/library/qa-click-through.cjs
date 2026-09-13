// Library room click-through — every interaction, both widths.
//   node scripts/tour/library/qa-click-through.cjs http://127.0.0.1:5295 <shot-dir> [desk|mob|both]
// Needs a Playwright install (defaults to the LMS checkout's node_modules).
const PW = process.env.PLAYWRIGHT || '/Users/dr.ali/projects/fluentia-lms/node_modules/playwright'
const pw = require(PW)
const ENGINE = process.env.ENGINE || 'chromium' // ENGINE=webkit for Safari's engine
const [,, BASE = 'http://127.0.0.1:5295', OUT = '/tmp/lib-qa', WHICH = 'both'] = process.argv
require('fs').mkdirSync(OUT, { recursive: true })

let failures = 0
const ok = (cond, msg, extra) => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${msg}${extra !== undefined ? ` — ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : ''}`)
  if (!cond) failures++
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function run(name, viewport) {
  console.log(`\n=== ${name} ${viewport.width}×${viewport.height}`)
  const browser = await pw[ENGINE].launch(ENGINE === 'chromium' ? { args: ['--autoplay-policy=user-gesture-required'] } : {})
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: name === 'mob', isMobile: name === 'mob' && ENGINE !== 'firefox' })
  const page = await ctx.newPage()
  const errs = []
  const audioStatuses = []
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('response', (r) => {
    if (r.status() >= 400) errs.push(`${r.status()} ${r.url()}`)
    if (r.url().endsWith('.mp3')) audioStatuses.push(r.status())
    if (/supabase\.co/.test(r.url())) errs.push('HOTLINK ' + r.url())
  })
  page.setDefaultTimeout(90000)
  const shot = (n, full = false) => page.screenshot({ path: `${OUT}/${ENGINE === 'chromium' ? '' : ENGINE + '-'}${name}-${n}.png`, fullPage: full })
  const audio = (fn) => page.evaluate(fn)
  const overflow = () => page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const bad = [...document.querySelectorAll('.lib-tour-room *')].filter((e) => {
      const r = e.getBoundingClientRect()
      if (!r.width) return false
      if (e.closest('.lib-env-pin, .lib-tour-pin, .lib-codex-pages, .lib-codex-measure, .lib-book-spread')) return false
      return r.right > vw + 1 || r.left < -1
    }).slice(0, 6).map((e) => `${e.className?.toString().slice(0, 40) || e.tagName} [${Math.round(e.getBoundingClientRect().left)},${Math.round(e.getBoundingClientRect().right)}]`)
    return { docScroll: document.documentElement.scrollWidth - vw, bad }
  })

  // ── shelf ──
  await page.goto(`${BASE}/tour/library`, { waitUntil: 'networkidle' })
  await sleep(900)
  ok(await page.locator('.lib-card').count() === 9, 'shelf shows the 9 real covers')
  ok(await page.locator('.lib-room').count() === 3, 'three rooms (mine / tease / soon)')
  const covers = await page.$$eval('.lib-cover-art', (els) => els.map((e) => getComputedStyle(e).backgroundImage))
  ok(covers.every((c) => /\/tour\/library\/covers\/.+\.webp/.test(c)), 'covers are local WebP')
  ok((await overflow()).bad.length === 0 && (await overflow()).docScroll <= 0, 'no horizontal overflow on shelf', await overflow())
  await shot('01-shelf-top')
  // the room stays pinned while the shelves scroll
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.lib-room:nth-of-type(1)').getBoundingClientRect().top + window.scrollY + 300))
  await sleep(500)
  const pin = await page.evaluate(() => {
    const r = document.querySelector('.lib-env-pin').getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, bar: Math.round(document.querySelector('.tour-bar').getBoundingClientRect().bottom) }
  })
  ok(Math.abs(pin.top - pin.bar) <= 1 && Math.abs(pin.bottom - pin.vh) <= 1, 'reading-room backdrop is pinned under the TourBar while scrolling', pin)
  await shot('02-shelf-scrolled')

  // a cover that is not in the tour
  const silent = page.locator('.lib-card', { hasText: 'The Silent Tide' })
  await silent.scrollIntoViewIfNeeded()
  await silent.click()
  ok(await silent.locator('.lib-tour-inside').isVisible(), 'other cover → «هذه الرواية داخل المنصة» veil', await silent.locator('.lib-tour-inside b').textContent())
  ok(page.url().endsWith('/tour/library'), 'other cover does not navigate')
  await shot('03-inside-notice')
  const locked = page.locator('.lib-card', { hasText: 'The Translator' })
  await locked.scrollIntoViewIfNeeded()
  await locked.click()
  ok(await locked.locator('.lib-tour-inside').isVisible(), 'locked «قريباً» cover → the same veil')
  ok(!(await silent.locator('.lib-tour-inside').count()), 'only one veil at a time')
  // «جرّب شتاء الذئاب» inside the veil
  await locked.locator('.lib-tour-inside-go').click()
  await page.waitForURL(/\/tour\/library\/the-wolf-winter$/)
  ok(true, 'veil button → the Wolf Winter book page')
  await page.goBack(); await page.waitForURL(/\/tour\/library$/); await sleep(400)

  const wolf = page.locator('.lib-card[data-tour-open]')
  await wolf.scrollIntoViewIfNeeded()
  await wolf.click()
  await page.waitForURL(/\/tour\/library\/the-wolf-winter$/)
  await sleep(600)

  // ── book page ──
  ok((await page.locator('.lib-detail-info h1').textContent()) === 'شتاء الذئاب', 'book page title')
  ok(await page.locator('.lib-chapter-row').count() === 5, 'five chapters listed')
  ok(await page.locator('.lib-chapter-row[data-tour-inside]').count() === 4, 'chapters 2–5 marked «داخل المنصة»')
  ok((await overflow()).bad.length === 0, 'no horizontal overflow on book page', await overflow())
  await shot('04-book', true)
  await page.locator('.lib-chapter-row').nth(2).click()
  await sleep(300)
  ok(page.url().endsWith('/the-wolf-winter'), 'a later chapter stays put')
  await page.locator('.lib-start').click()
  await page.waitForURL(/\/read$/)
  await sleep(1200)

  // ── reader: cinema ──
  ok(await page.locator('.lib-cine-sentence').count() === 12, '12 sentences in cinema')
  const bg = await page.$eval('.lib-cine-bg', (e) => getComputedStyle(e).backgroundImage)
  ok(/ch1-opener\.webp/.test(bg), 'Ken-Burns plate is the cleaned opener', bg.slice(-50))
  ok((await page.$eval('.lib-cine-bg', (e) => getComputedStyle(e).animationName)) === 'lib-cine-kb', 'Ken-Burns animation runs')
  ok((await page.locator('.lib-cine-time-total').textContent()) === '1:20' || name === 'mob', 'total time from snapshot 1:20', await page.locator('.lib-cine-time-total').textContent())
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready
    const s = document.querySelector('.lib-cine-sentence')
    const d = document.querySelector('.lib-cine-sentence[data-dialogue]')
    const faces = [...document.fonts].filter((f) => /Cormorant/.test(f.family) && f.status === 'loaded').map((f) => `${f.style} ${f.weight}`)
    return {
      family: getComputedStyle(s).fontFamily, weight: getComputedStyle(s).fontWeight, dStyle: getComputedStyle(d).fontStyle,
      check400: document.fonts.check('400 20px "Cormorant Garamond"', 'The'),
      check400i: document.fonts.check('italic 400 20px "Cormorant Garamond"', 'The'),
      loaded: faces,
    }
  })
  ok(/Cormorant Garamond/.test(fonts.family) && fonts.weight === '400', 'reading text set in Cormorant Garamond 400', fonts)
  ok(fonts.loaded.some((f) => /^normal/.test(f)) && fonts.loaded.some((f) => /^italic/.test(f)), 'Cormorant normal + italic faces actually loaded (not a fallback)', fonts.loaded)
  ok(await audio(() => document.querySelector('audio').paused), 'no autoplay on arrival')
  await shot('05-cinema-arrive')


  // play
  // (this machine runs other headless sessions: poll instead of trusting fixed sleeps)
  await page.locator('.lib-cine-play').click()
  await page.waitForFunction(() => document.querySelector('audio').currentTime > 1.2, null, { timeout: 12000 }).catch(() => {})
  const t1 = await audio(() => ({ t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(!t1.paused && t1.t > 1.2, 'play → currentTime advances', t1)
  ok(t1.key === '0-0', 'first sentence glows at the start', t1.key)
  await page.waitForFunction(() => document.querySelector('audio').currentTime > 6, null, { timeout: 15000 }).catch(() => {})
  await sleep(120)
  const t2 = await audio(() => ({ t: document.querySelector('audio').currentTime, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(t2.t > 5.55 && t2.key === '0-1', 'highlight moves to sentence 2 once the voice passes 5.55 s', t2)
  await shot('06-cinema-playing')

  // polite scrolling: the voice is on screen → the page must not move
  const y0 = await page.evaluate(() => scrollY)
  await page.evaluate(() => { const a = document.querySelector('audio'); a.currentTime = 14.9 })
  await sleep(1200)
  const y1 = await page.evaluate(() => ({ y: scrollY, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(y1.key === '1-0', 'sentence 3 glows after the gap', y1.key)
  ok(Math.abs(y1.y - y0) < 2 || name === 'mob', 'no scroll while the spoken line is visible', { y0, y1: y1.y })

  // tap a sentence → seek to t0, play, Arabic unfolds beneath it
  const s21 = page.locator('[data-cinekey="2-1"]')
  await s21.scrollIntoViewIfNeeded()
  await s21.click()
  await sleep(700)
  const tap = await audio(() => ({ t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(tap.t >= 33.85 && tap.t < 35.2 && !tap.paused, 'tap sentence → seeks to its t0 (33.89 s) and plays', tap)
  ok(tap.key === '2-1', 'tapped sentence glows', tap.key)
  const rev = page.locator('[data-cinekey="2-1"] + .lib-reveal .lib-reveal-inner')
  await sleep(400)
  ok(await rev.isVisible(), 'Arabic veil-lifts beneath the tapped sentence', await rev.textContent())
  ok((await rev.textContent()).includes('الغابات البعيدة'), 'it is that sentence’s Arabic')
  ok((await page.locator('.lib-reveal').boundingBox()).height > 20, 'the veil has opened (height)')
  await shot('07-cinema-tap-reveal')

  // a sentence tapped right above the player: its Arabic must unfold into view
  await page.evaluate(() => {
    const el = document.querySelector('[data-cinekey="3-1"]'); const bar = document.querySelector('.lib-cine-bar').getBoundingClientRect()
    window.scrollBy(0, el.getBoundingClientRect().bottom - (bar.top - 6))
  })
  await sleep(700)
  const lastLine = await page.evaluate(() => { const rs = [...document.querySelector('[data-cinekey="3-1"]').getClientRects()]; const r = rs[rs.length - 1]; return { x: r.left + Math.min(30, r.width / 2), y: r.top + r.height / 2 } })
  await page.mouse.click(lastLine.x, lastLine.y)
  await sleep(1500)
  const low = await page.evaluate(() => {
    const rv = document.querySelector('[data-cinekey="3-1"] + .lib-reveal')?.getBoundingClientRect()
    const bar = document.querySelector('.lib-cine-bar').getBoundingClientRect()
    return { revBottom: rv && Math.round(rv.bottom), barTop: Math.round(bar.top) }
  })
  ok(low.revBottom && low.revBottom <= low.barTop, 'a line tapped just above the player lifts so its Arabic is not hidden under it', low)
  await shot('07b-cinema-tap-low')

  // ±10 s — measured paused, so the running clock cannot blur the step
  await page.locator('.lib-cine-play').click()
  await sleep(200)
  const before = await audio(() => document.querySelector('audio').currentTime)
  await page.locator('.lib-cine-skip').nth(1).click()
  await sleep(250)
  const fwd = await audio(() => document.querySelector('audio').currentTime)
  ok(Math.abs(fwd - before - 10) < 0.05, '+10 s skip', { before, fwd })
  ok((await page.locator('.lib-cine-time').first().textContent()) === `${Math.floor(fwd / 60)}:${String(Math.floor(fwd % 60)).padStart(2, '0')}`, 'time readout follows the skip', await page.locator('.lib-cine-time').first().textContent())
  await page.locator('.lib-cine-skip').nth(0).click()
  await sleep(250)
  const back = await audio(() => document.querySelector('audio').currentTime)
  ok(Math.abs(fwd - back - 10) < 0.05, '−10 s skip', { fwd, back })
  await page.locator('.lib-cine-play').click()

  // speed popover
  await page.locator('.lib-cine-speed').click()
  ok(await page.locator('.lib-cine-speed-pop').isVisible(), 'speed popover opens')
  await shot('08-cinema-speed')
  await page.locator('.lib-cine-speed-pop button', { hasText: '1.5×' }).click()
  ok((await audio(() => document.querySelector('audio').playbackRate)) === 1.5, 'speed 1.5× applied to the audio')
  ok((await page.locator('.lib-cine-speed').textContent()) === '1.5×', 'speed button reads 1.5×')
  await page.locator('.lib-cine-speed').click()
  await page.locator('.lib-cine-speed-pop button', { hasText: /^1×$/ }).click()

  // scrubber
  const track = await page.locator('.lib-cine-track').boundingBox()
  await page.mouse.click(track.x + track.width * 0.5, track.y + track.height / 2)
  await sleep(300)
  const mid = await audio(() => ({ t: document.querySelector('audio').currentTime, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(Math.abs(mid.t - 40.25) < 1.2, 'scrubber click at 50% → ~40 s', mid)
  ok(mid.key === '2-2', 'highlight follows the scrub (sentence 2-2 at 39.04–42.40 s)', mid.key)
  const thumb = await page.$eval('.lib-cine-thumb', (e) => e.style.left)
  ok(parseFloat(thumb) > 45 && parseFloat(thumb) < 56, 'thumb sits mid-track', thumb)

  // the visitor scrolls away → the reader must not drag them back
  await page.evaluate(() => document.querySelector('.lib-q-cta').scrollIntoView({ block: 'center' }))
  // a real wheel where supported; mobile WebKit has none, so a finger-drag's touchmove + scroll
  await page.mouse.wheel(0, 120).catch(() => page.evaluate(() => { window.dispatchEvent(new Event('touchmove')); window.scrollBy(0, 120) }))
  await sleep(300)
  const yAway = await page.evaluate(() => scrollY)
  await page.evaluate(() => { document.querySelector('audio').currentTime = 42.5 })
  await sleep(1800)
  const yAfter = await page.evaluate(() => ({ y: scrollY, key: document.querySelector('[data-spoken]')?.dataset.cinekey }))
  ok(yAfter.key === '3-0' && Math.abs(yAfter.y - yAway) < 2, 'after a manual scroll away, a new line does not yank the page back', { yAway, ...yAfter })

  // questions
  await page.locator('.lib-q-cta').click()
  ok((await page.locator('.lib-q-head span').textContent()) === 'اختبر فهمك', 'questions panel — masculine-generic heading')
  ok(await page.locator('.lib-q-item').count() === 2, 'Q1–Q2 only')
  const q1 = page.locator('.lib-q-item').nth(0)
  await q1.locator('[data-opt="A"]').click()
  ok(await q1.locator('[data-opt="A"][data-wrong]').count() === 1 && await q1.locator('[data-opt="B"][data-correct]').count() === 1, 'Q1 wrong answer → marked wrong, right one revealed')
  ok(await q1.locator('.lib-q-explain').isVisible(), 'Q1 explanation shows')
  ok((await q1.locator('.lib-q-opt:disabled').count()) === 4, 'Q1 locks after answering')
  await shot('09-q1-wrong')
  await q1.locator('.lib-q-jump').click()
  await sleep(1300)
  const jump = await page.evaluate(() => {
    const s = document.querySelector('[data-cinekey="4-1"]').getBoundingClientRect()
    const band = document.querySelector('.lib-reader-bar').getBoundingClientRect().bottom
    return { t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused, top: Math.round(s.top), bottom: Math.round(s.bottom), vh: innerHeight, band: Math.round(band) }
  })
  ok(jump.t >= 63.9 && jump.t < 67 && !jump.paused, '«اسمعها من هنا» → plays Joren’s line (63.94 s)', jump)
  ok(jump.top >= jump.band && jump.bottom < jump.vh - 70, 'and brings that line into view, clear of the TourBar, reader bar and player', jump)
  await shot('10-q-jump')
  const q2 = page.locator('.lib-q-item').nth(1)
  await q2.scrollIntoViewIfNeeded()
  await q2.locator('[data-opt="C"]').click()
  ok(await q2.locator('[data-opt="C"][data-correct]').count() === 1 && await q2.locator('.lib-q-explain[data-ok]').count() === 1, 'Q2 right answer → marked correct with its explanation')
  ok((await page.locator('.lib-q-head em').textContent()).trim() === '2 / 2', 'progress 2 / 2')

  // end card + positioning
  const end = page.locator('.lib-tour-end')
  await end.scrollIntoViewIfNeeded()
  ok((await end.locator('h3').textContent()) === 'أكمل الفصل والرواية داخل المنصة', 'end card')
  await shot('11-end-card')
  await page.evaluate(() => document.querySelector('.tour-end').scrollIntoView({ block: 'center' }))
  await sleep(400)
  const geo = await page.evaluate(() => {
    const bar = document.querySelector('.lib-cine-bar').getBoundingClientRect()
    const te = document.querySelector('.tour-end').getBoundingClientRect()
    const tb = document.querySelector('.tour-bar').getBoundingClientRect()
    const hit = document.elementFromPoint(innerWidth / 2, tb.top + tb.height / 2)
    return { barBottom: Math.round(bar.bottom), tourEndTop: Math.round(te.top), tourBarOnTop: !!hit?.closest('.tour-bar') }
  })
  ok(geo.barBottom <= geo.tourEndTop, 'player bar rests above the TourEnd, never over it', geo)
  ok(geo.tourBarOnTop, 'TourBar is not covered')
  await shot('12-tour-end')
  await end.scrollIntoViewIfNeeded()
  const tBefore = await audio(() => document.querySelector('audio').currentTime)
  await end.locator('.lib-tour-end-ghost').click()
  const rp = await audio(() => ({ t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused }))
  ok(rp.t < 1.5 && !rp.paused, '«استمع من البداية» replays from 0', { tBefore, ...rp })
  // sampled in-page so a stalled test process cannot fake a jump
  const jumps = await page.evaluate(() => new Promise((res) => {
    const a = document.querySelector('audio'); const out = []; let lt = a.currentTime, lw = performance.now(); let n = 0
    const iv = setInterval(() => { const t = a.currentTime, w = performance.now(); if (t - lt - (w - lw) / 1000 > 1.2) out.push([lt, t]); lt = t; lw = w; if (++n > 15) { clearInterval(iv); res(out) } }, 100)
  }))
  ok(jumps.length === 0, 'and nothing re-seeks it afterwards', jumps)
  const top = await page.evaluate(() => { const r = document.querySelector('[data-cinekey="0-0"]').getBoundingClientRect(); return { top: r.top, vh: innerHeight } })
  ok(top.top > 0 && top.top < top.vh, 'and scrolls the first line back into view', top)

  // settings sheet
  await page.locator('.lib-gear').click()
  ok(await page.locator('.lib-sheet').isVisible(), 'settings sheet opens under the bar')
  await page.locator('.lib-stepper button').nth(1).click()
  ok((await page.$eval('.lib-reader-stage', (e) => e.style.getPropertyValue('--lib-fontscale'))) === '1.05', 'font A+ → 105%')
  await page.locator('.lib-toggle').click()
  ok(await page.locator('.lib-candle').count() === 1, 'candlelight on')
  await shot('13-settings')
  await page.locator('.lib-sheet-done').click()
  await page.locator('.lib-cine-play').click() // pause

  ok((await overflow()).bad.length === 0 && (await overflow()).docScroll <= 0, 'no horizontal overflow in cinema', await overflow())

  // ── codex ──
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.lib-mode button', { hasText: 'صفحات' }).click()
  await sleep(1500)
  ok(await page.locator('.lib-book').isVisible(), 'codex book opens')
  ok(await audio(() => document.querySelector('audio').paused), 'narration pauses on mode change')
  const pg0 = await page.locator('.lib-codex-foot .pg').textContent()
  const dropCap = await page.evaluate(() => {
    const p = document.querySelector('.lib-codex-pages .lib-codex-p.first')
    return p ? getComputedStyle(p, '::first-letter').fontSize : null
  })
  ok(!!dropCap && parseFloat(dropCap) > 40, 'drop cap on the first paragraph', dropCap)
  await shot('14-codex')
  // arrows are scoped to the book
  const yk = await page.evaluate(() => scrollY)
  await page.evaluate(() => document.activeElement?.blur())
  await page.keyboard.press('ArrowRight')
  await sleep(300)
  ok((await page.locator('.lib-codex-foot .pg').textContent()) === pg0, 'ArrowRight with the book unfocused does not turn the page', pg0)
  await page.locator('.lib-codex').focus()
  await page.keyboard.press('ArrowRight')
  await sleep(1700)
  const pg1 = await page.locator('.lib-codex-foot .pg').textContent()
  ok(pg1 !== pg0, 'ArrowRight with the book focused turns the page', { pg0, pg1 })
  await page.locator('.lib-codex-foot button').first().click()
  await sleep(1700)
  ok((await page.locator('.lib-codex-foot .pg').textContent()) === pg0, '‹ turns back')
  void yk
  // tap a sentence → the parchment tray
  await page.locator('.lib-codex-pages .lib-sentence').first().click()
  await sleep(500)
  ok(await page.locator('.lib-codex-tray').isVisible(), 'codex sentence → tray with the Arabic', await page.locator('.lib-codex-tray .ar').textContent())
  await page.locator('.lib-codex-tray .lib-word', { hasText: 'winter' }).first().click()
  ok(await page.locator('.lib-codex-tray .lib-word[data-saved]').count() >= 1, 'tapping a word marks it')
  await shot('15-codex-tray')
  const trayBox = await page.locator('.lib-codex-tray').boundingBox()
  const tb = await page.locator('.tour-bar').boundingBox()
  ok(trayBox.y > tb.y + tb.height, 'tray sits inside the reader, below the TourBar', { trayY: trayBox.y })
  await page.locator('.lib-codex-tray .close').click()
  await sleep(400)
  // to the end of the part
  for (let i = 0; i < 8; i++) {
    const glyph = await page.locator('.lib-codex-foot button').nth(1).textContent()
    if (glyph === '✦') break
    await page.locator('.lib-codex-foot button').nth(1).click()
    await sleep(1600)
  }
  await shot('16-codex-last')
  await page.locator('.lib-codex-foot button').nth(1).click()
  await sleep(1200)
  const qv = await page.evaluate(() => { const r = document.querySelector('.lib-tour-after').getBoundingClientRect(); return { top: r.top, vh: innerHeight } })
  ok(qv.top < qv.vh, '✦ on the last page leads to the questions + end card', qv)
  await page.locator('.lib-gear').click()
  await page.locator('.lib-swatch[data-paper="night"]').click()
  ok((await page.$eval('.lib-book', (e) => e.dataset.paper)) === 'night', 'night paper applies')
  await page.locator('.lib-sheet-done').click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(500)
  await shot('17-codex-night')
  ok((await overflow()).bad.length === 0 && (await overflow()).docScroll <= 0, 'no horizontal overflow in codex', await overflow())

  // ── reveal + assist ──
  await page.locator('.lib-mode button', { hasText: 'انسياب' }).click()
  await sleep(600)
  await page.locator('.lib-prose .lib-sentence').nth(3).click()
  await sleep(500)
  ok(await page.locator('.lib-prose .lib-reveal').isVisible(), 'انسياب: tap → inline Arabic')
  await shot('18-reveal')
  await page.locator('.lib-mode button', { hasText: 'مساعدة' }).click()
  await sleep(500)
  ok(await page.locator('.lib-assist-ar').count() === 5, 'مساعدة: 5 Arabic paragraphs')
  await shot('19-assist')
  ok((await overflow()).bad.length === 0, 'no horizontal overflow in assist', await overflow())

  // iOS Safari: no metadata (no duration, no seekable range) until the first play.
  // Hold the mp3 response until the visitor presses play, then scrub, skip and tap before it.
  {
    const p2 = await ctx.newPage()
    let release; const gate = new Promise((r) => { release = r })
    await p2.route('**/*.mp3', async (route) => { await gate; await route.continue() })
    await p2.goto(`${BASE}/tour/library/the-wolf-winter/read`, { waitUntil: 'domcontentloaded' })
    await p2.waitForSelector('.lib-cine-track'); await sleep(1200)
    const a2 = (fn) => p2.evaluate(fn)
    const rs = await a2(() => ({ rs: document.querySelector('audio').readyState, dur: document.querySelector('audio').duration }))
    ok(rs.rs === 0 && !isFinite(rs.dur), 'iOS-like state: readyState 0, duration NaN', rs)
    ok((await p2.locator('.lib-cine-time-total').textContent()) === '1:20', 'total reads 1:20 from the snapshot')
    const trk = await p2.locator('.lib-cine-track').boundingBox()
    await p2.mouse.click(trk.x + trk.width * 0.5, trk.y + trk.height / 2)
    await sleep(200)
    const pre = await a2(() => ({ time: document.querySelector('.lib-cine-time').textContent, key: document.querySelector('[data-spoken]')?.dataset.cinekey, rs: document.querySelector('audio').readyState }))
    ok(pre.time === '0:40' && pre.key === '2-2' && pre.rs === 0, 'scrub before metadata: readout + highlight move, the seek is held', pre)
    await p2.locator('.lib-cine-skip').nth(1).click()
    await sleep(150)
    ok((await p2.locator('.lib-cine-time').first().textContent()) === '0:50', '+10 s before metadata steps from the held position')
    await p2.locator('.lib-cine-play').click()
    release()
    await p2.waitForFunction(() => document.querySelector('audio').currentTime > 50.3, null, { timeout: 15000 }).catch(() => {})
    const held = await a2(() => ({ t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused }))
    ok(held.t >= 50.2 && held.t < 54 && !held.paused, 'first play lands on the held seek (50.25 s) once metadata arrives', held)
    await p2.close()
    // and a sentence tapped as the very first gesture
    const p3 = await ctx.newPage()
    let release3; const gate3 = new Promise((r) => { release3 = r })
    await p3.route('**/*.mp3', async (route) => { await gate3; await route.continue() })
    await p3.goto(`${BASE}/tour/library/the-wolf-winter/read`, { waitUntil: 'domcontentloaded' })
    await p3.waitForSelector('[data-cinekey="1-1"]'); await sleep(1000)
    await p3.locator('[data-cinekey="1-1"]').click()
    release3()
    await p3.waitForFunction(() => document.querySelector('audio').currentTime > 20.5, null, { timeout: 15000 }).catch(() => {})
    const tp = await p3.evaluate(() => ({ t: document.querySelector('audio').currentTime, paused: document.querySelector('audio').paused }))
    ok(tp.t >= 20.4 && tp.t < 24 && !tp.paused, 'first gesture = tap a sentence, no metadata yet → plays from its t0 (20.44 s)', tp)
    await p3.close()
  }

  ok(audioStatuses.every((s) => s === 200 || s === 206), 'mp3 responses are 200/206', audioStatuses)
  ok(errs.length === 0, 'no console errors / 4xx / hotlinks', [...new Set(errs)])
  await browser.close()
}

;(async () => {
  if (WHICH !== 'mob') await run('desk', { width: 1440, height: 900 })
  if (WHICH !== 'desk') await run('mob', { width: 390, height: 844 })
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED')
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })
