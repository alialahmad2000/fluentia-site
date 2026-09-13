/**
 * Click-through for the expressions room, at desktop and phone width.
 *
 *   node scripts/tour/expressions/clickthrough.cjs [baseUrl] [shotDir]
 *
 * Walks every interaction: theme chips, the hall → sheet links, the guess-first
 * gate (wrong on one proverb, right on the other), the idiom cover, the gap
 * drill wrong then right, phrase + dialogue audio (asserting currentTime moves
 * and the dialogue reaches its second clip), the switcher across all four
 * sheets, the next-sheet chain back to the room, and the bad-slug redirect.
 * Also asserts: no request leaves for Supabase, no console errors, no
 * horizontal overflow, the World never covers the TourBar, twins set in Amiri.
 */
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright')

const BASE = process.argv[2] || 'http://127.0.0.1:5293'
const SHOTS = process.argv[3] || null
const fails = []
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fails.push(msg) }

async function audioTime(page) {
  return page.evaluate(() => {
    const a = document.querySelector('audio[data-tour-audio]')
    return a ? { t: a.currentTime, src: a.src, paused: a.paused } : null
  })
}
async function waitAdvance(page, label, { srcEndsWith } = {}) {
  const start = Date.now()
  let last = null
  while (Date.now() - start < 15000) {
    last = await audioTime(page)
    if (last && last.t > 0.25 && (!srcEndsWith || last.src.endsWith(srcEndsWith))) break
    await page.waitForTimeout(150)
  }
  ok(!!last && last.t > 0.25 && (!srcEndsWith || last.src.endsWith(srcEndsWith)),
    `${label}: audio currentTime advanced (${last ? last.t.toFixed(2) : 'no element'}s, ${last ? last.src.split('/').pop() : ''})`)
}
async function noOverflow(page, label) {
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const bad = [...document.querySelectorAll('.tour-expr *')].filter((e) => {
      if (e.closest('.xw')) return false
      const b = e.getBoundingClientRect()
      return b.width > 0 && (b.right > vw + 1 || b.left < -1)
    }).slice(0, 4).map((e) => e.className?.toString().slice(0, 50) || e.tagName)
    return { doc: document.documentElement.scrollWidth - vw, bad }
  })
  ok(r.doc <= 0 && r.bad.length === 0, `${label}: no horizontal overflow (doc ${r.doc}, els ${JSON.stringify(r.bad)})`)
}
async function barOnTop(page, label) {
  await page.evaluate(() => window.scrollTo(0, Math.max(0, document.body.scrollHeight / 2 - 400)))
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => {
    const bar = document.querySelector('.tour-bar').getBoundingClientRect()
    const hit = document.elementFromPoint(bar.left + bar.width / 2, bar.top + bar.height / 2)
    // every World must cover the part of its own room that is on screen
    const worlds = [...document.querySelectorAll('.expr-root')].map((root) => {
      const xw = root.querySelector(':scope > .xw')
      const rr = root.getBoundingClientRect(); const xr = xw.getBoundingClientRect()
      const visTop = Math.max(rr.top, 0); const visBot = Math.min(rr.bottom, innerHeight)
      return { pos: getComputedStyle(xw).position, covers: visBot <= visTop || (xr.top <= visTop + 1 && xr.bottom >= visBot - 1), h: xr.height }
    })
    return { onTop: !!hit?.closest('.tour-bar'), worlds, vh: innerHeight }
  })
  ok(r.onTop, `${label}: TourBar stays on top of the World`)
  ok(r.worlds.every((w) => w.pos === 'sticky' && w.covers && Math.abs(w.h - r.vh) < 140), `${label}: World is sticky, viewport-sized, covers its room while scrolling ${JSON.stringify(r.worlds)}`)
  await page.evaluate(() => window.scrollTo(0, 0))
}
async function shot(page, name, full = false) {
  if (!SHOTS) return
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full })
}

async function run(browser, width, height, tag) {
  console.log(`\n── ${tag} ${width}×${height}`)
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: width < 600 })
  const page = await ctx.newPage()
  const errors = []
  const supa = []
  page.on('console', (m) => { if (m.type() === 'error' || /Warning:/.test(m.text())) errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message))
  page.on('request', (r) => { if (/supabase\.co/.test(r.url())) supa.push(r.url()) })
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })

  // ── landing
  await page.goto(`${BASE}/tour/expressions`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  ok(await page.locator('.expr-plate').count() === 2, 'hall shows 2 proverb plates')
  ok(await page.locator('.expr-icard').count() === 2, 'lab shows 2 idiom cards')
  ok(await page.locator('.pod-card').count() === 1, '«مثل اليوم» card renders')
  const twinFont = await page.evaluate(() => ({
    fam: getComputedStyle(document.querySelector('.expr-plate .tw')).fontFamily,
    amiri: document.fonts.check('400 20px Amiri', 'من سبق'),
    ruqaa: [...document.fonts].some((f) => /Aref/i.test(f.family) && f.status === 'loaded'),
  }))
  ok(/^"?Amiri/.test(twinFont.fam) && twinFont.amiri && !twinFont.ruqaa, `twins set in Amiri (${twinFont.fam}; Aref loaded: ${twinFont.ruqaa})`)
  await noOverflow(page, 'landing')
  await barOnTop(page, 'landing')
  await shot(page, `${tag}-01-landing`)

  // theme chips filter locally
  await page.locator('#proverbs .expr-chip', { hasText: 'الوقت والمبادرة' }).click()
  ok(await page.locator('.expr-plate').count() === 1, 'theme chip filters the hall to 1 plate')
  await page.locator('#proverbs .expr-chip', { hasText: 'الكل' }).click()
  ok(await page.locator('.expr-plate').count() === 2, '«الكل» restores both plates')

  // ── proverb 1: don't count your chickens, guessed RIGHT
  await page.locator('.expr-plate', { hasText: "Don't count your chickens" }).click()
  await page.waitForURL('**/tour/expressions/proverb/dont-count-your-chickens')
  await page.locator('.expr-hero .en', { hasText: "Don't count" }).waitFor()
  ok(true, 'plate opens /tour/expressions/proverb/dont-count-your-chickens')
  ok(await page.locator('.expr-twin').count() === 0, 'guess-first: the twin is hidden before a pick')
  ok(await page.locator('.expr-opt').count() === 3, 'three guess options')
  const optTexts = await page.locator('.expr-opt').allTextContents()
  ok(optTexts.some((t) => t.includes('اصبر، فالنتائج')) && !optTexts.some((t) => /اصبري/.test(t)), 'option «اصبر،» is masculine (converter bug fixed)')
  await shot(page, `${tag}-02-chickens-before`)
  await page.locator('.expr-opt', { hasText: 'لا تبنِ حساباتك' }).click()
  ok(await page.locator('.expr-opt.is-right', { hasText: 'لا تبنِ حساباتك' }).count() === 1, 'right pick is marked is-right')
  ok(await page.locator('.expr-opt:not([disabled])').count() === 0, 'options lock after the pick')
  ok((await page.locator('.expr-twin .say').textContent()) === 'لا تبع السمك وهو في البحر', 'twin «لا تبع السمك وهو في البحر» revealed')
  await page.locator('.expr-opts').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-03-chickens-right`)

  // ── next sheet → proverb 2: the early bird, guessed WRONG
  await page.locator('.tx-next').click()
  await page.waitForURL('**/proverb/the-early-bird')
  await page.locator('.expr-hero .en', { hasText: 'The early bird' }).waitFor()
  ok(await page.locator('.expr-twin').count() === 0, 'next sheet starts fresh (no carried reveal)')
  await page.locator('.expr-play', { hasText: 'Listen' }).click()
  await waitAdvance(page, 'early-bird phrase', { srcEndsWith: 'the-early-bird.mp3' })
  await page.locator('.expr-opt', { hasText: 'الطيور تستيقظ' }).click()
  ok(await page.locator('.expr-opt.is-wrong', { hasText: 'الطيور تستيقظ' }).count() === 1, 'wrong pick is marked is-wrong («الفخّ الحرفي»)')
  ok(await page.locator('.expr-opt.is-right', { hasText: 'من يبدأ مبكّراً' }).count() === 1, 'the right option is revealed')
  const twin = page.locator('.expr-twin .say')
  ok((await twin.textContent()) === 'من سبق أكل النبق', 'twin «من سبق أكل النبق» revealed')
  ok(/^"?Amiri/.test(await twin.evaluate((e) => getComputedStyle(e).fontFamily)), 'sheet twin in Amiri')
  ok(/فإن أردت الحثّ/.test(await page.locator('.expr-twin .note').textContent()), 'twin note is masculine-generic')
  await page.locator('.expr-opts').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-04-early-wrong`)
  await twin.scrollIntoViewIfNeeded()
  await shot(page, `${tag}-05-early-twin`)
  await page.locator('.expr-play', { hasText: 'الحوار' }).click()
  await waitAdvance(page, 'early-bird dialogue line A', { srcEndsWith: 'the-early-bird-0.mp3' })
  await waitAdvance(page, 'early-bird dialogue reaches line B', { srcEndsWith: 'the-early-bird-1.mp3' })
  ok(await page.locator('.expr-bub mark').count() === 1, 'target line highlights the proverb')
  ok(await page.locator('.tx-sample .expr-fb').count() === 1 && await page.locator('.tx-sample-tag').count() === 1, 'free-use step is a labelled example, no textarea/submit')
  ok(await page.locator('textarea').count() === 0, 'no live textarea on the sheet')
  await page.locator('.expr-dlg').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-06-early-dialogue`)
  await page.locator('.tx-sample').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-07-early-sample`)
  await noOverflow(page, 'proverb sheet')
  await barOnTop(page, 'proverb sheet')

  // ── next sheet → idiom 1: cost an arm and a leg
  await page.locator('.tx-next').click()
  await page.waitForURL('**/idiom/cost-an-arm-and-a-leg')
  await page.locator('.expr-title', { hasText: 'cost an arm' }).waitFor()
  ok(true, 'next-sheet card opens /idiom/cost-an-arm-and-a-leg')
  ok(await page.locator('.expr-frame').count() === 0, 'idiom: frame hidden until the cover is tapped')
  ok(await page.locator('.expr-cover').count() === 1, 'idiom: the real pane is covered')
  await page.locator('.expr-play', { hasText: 'Listen' }).click()
  await waitAdvance(page, 'cost phrase', { srcEndsWith: 'cost-an-arm-and-a-leg.mp3' })
  await page.locator('.expr-split').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-08-cost-cover`)
  await page.locator('.expr-cover').click()
  ok(await page.locator('.expr-cover').count() === 0 && await page.locator('.expr-frame').count() === 1, 'cover tap reveals the real pane and the frame')
  ok(await page.locator('.expr-code.is-bad').count() === 3, 'three wrong_forms struck through')
  ok(await page.locator('.expr-form').count() === 4, 'forms chips (cost · costs · cost) + fixed part')
  await page.locator('.expr-split').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-09-cost-revealed`)
  await page.locator('.expr-frame').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-10-cost-frame`)
  await page.locator('.expr-btn.is-ghost', { hasText: 'costed an arm and a leg' }).click()
  ok(await page.locator('.expr-blank.is-wrong').count() === 1 && await page.locator('.expr-step .expr-fb.is-wrong').count() === 1, 'gap: wrong form → «ليست هذه» + retry')
  await page.locator('.expr-gap').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-11-cost-gap-wrong`)
  await page.locator('.expr-btn.is-ghost', { hasText: /^cost an arm and a leg$/ }).click()
  ok(await page.locator('.expr-blank.is-right').count() === 1, 'gap: right form fills the blank green')
  ok(/صحيح/.test(await page.locator('.expr-gap ~ .expr-fb').first().textContent()), 'gap: «صحيح ✓» feedback')
  await shot(page, `${tag}-12-cost-gap-right`)
  await page.locator('.expr-play', { hasText: 'الحوار' }).click()
  await waitAdvance(page, 'cost dialogue reaches line B', { srcEndsWith: 'cost-an-arm-and-a-leg-1.mp3' })

  // ── next → idiom 2: spill the beans
  await page.locator('.tx-next').click()
  await page.waitForURL('**/idiom/spill-the-beans')
  await page.locator('.expr-title', { hasText: 'spill the beans' }).waitFor()
  await page.locator('.expr-cover').click()
  ok(await page.locator('.expr-form').count() === 5, 'spill: 4 forms + «the beans — لا تتغيّر»')
  ok((await page.locator('.expr-code.is-bad').allTextContents()).join('|') === 'spill beans|spill the bean|spill a bean', 'spill: wrong_forms shown')
  await page.locator('.expr-btn.is-ghost', { hasText: /^spilled the beans$/ }).click()
  ok(await page.locator('.expr-blank.is-right').count() === 1, 'spill gap: right answer accepted')
  await page.locator('.expr-play', { hasText: 'الحوار' }).click()
  await waitAdvance(page, 'spill dialogue line A', { srcEndsWith: 'spill-the-beans-0.mp3' })
  await page.locator('.expr-frame').scrollIntoViewIfNeeded()
  await shot(page, `${tag}-13-spill-frame`)
  await noOverflow(page, 'idiom sheet')
  await barOnTop(page, 'idiom sheet')

  // last sheet walks back to the room
  await page.locator('.tx-next.is-home').click()
  await page.waitForURL(/\/tour\/expressions$/)
  ok(true, 'last sheet returns to /tour/expressions')
  // the router commits the new route a beat after the URL changes (a transition), and the sheet
  // pauses its clip on unmount, so give it up to 1.5s rather than reading the very same tick
  let paused = await audioTime(page)
  for (let i = 0; i < 15 && paused && !paused.paused; i++) { await page.waitForTimeout(100); paused = await audioTime(page) }
  ok(!paused || paused.paused, 'leaving a sheet stops its audio')

  // back link + switcher from an idiom to a proverb
  await page.locator('.expr-icard', { hasText: 'spill the beans' }).click()
  await page.waitForURL('**/idiom/spill-the-beans')
  await page.locator('.tx-sw', { hasText: 'The early bird' }).click()
  await page.waitForURL('**/proverb/the-early-bird')
  await page.locator('.expr-hero .en', { hasText: 'The early bird' }).waitFor()
  ok(await page.locator('.tx-sw.is-on', { hasText: 'The early bird' }).count() === 1, 'switcher marks the current sheet')
  await page.locator('.tx-sw', { hasText: 'Cost an arm' }).click()
  await page.waitForURL('**/idiom/cost-an-arm-and-a-leg')
  await page.locator('.tx-sw', { hasText: "Don't count" }).click()
  await page.waitForURL('**/proverb/dont-count-your-chickens')
  await page.locator('.expr-hero .en', { hasText: "Don't count" }).waitFor()
  await page.locator('.expr-back').click()
  await page.waitForURL(/\/tour\/expressions$/)
  ok(true, 'switcher across all four sheets, then «Proverbs & Idioms» back link')

  await page.goto(`${BASE}/tour/expressions/proverb/nope`, { waitUntil: 'networkidle' })
  ok(/\/tour\/expressions$/.test(page.url()), 'unknown slug redirects to the room')

  ok(supa.length === 0, `no request to Supabase (${supa.length})`)
  ok(errors.length === 0, `no console errors/4xx (${errors.slice(0, 4).join(' || ')})`)
  await ctx.close()
}

;(async () => {
  const browser = await chromium.launch()
  await run(browser, 1440, 900, 'desk')
  await run(browser, 390, 844, 'mob')
  await browser.close()
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED')
  process.exit(fails.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
