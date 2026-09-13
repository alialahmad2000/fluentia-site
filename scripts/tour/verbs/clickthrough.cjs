/**
 * Click-through for /tour/verbs at desktop and phone width.
 *
 *   node scripts/tour/verbs/clickthrough.cjs http://127.0.0.1:5294 <shotDir>
 *
 * Desktop answers mostly WRONG (sung, writen → letter diff → retype, drank),
 * the phone answers mostly RIGHT, so between them every verdict path runs.
 * Also: audio currentTime advances, the Arabic-keyboard hint, Enter scoped to
 * the session, no focus stolen on load, the atlas dots, a one-verb drill, and
 * horizontal overflow measured on the room's containers.
 */
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright')
const assert = require('node:assert/strict')

const BASE = process.argv[2] || 'http://127.0.0.1:5294'
const OUT = process.argv[3] || '.'

async function audioProbe(page) {
  // poll: the first clip of a page waits for the audio device to open
  let last = null
  for (let k = 0; k < 20; k++) {
    await page.waitForTimeout(150)
    last = await page.evaluate(() => {
      const a = window.__played?.[window.__played.length - 1]
      return a ? { src: a.currentSrc || a.src, t: a.currentTime, paused: a.paused, err: a.error?.code || null, n: window.__played.length } : null
    })
    if (last && last.t > 0) return last
  }
  return last
}

async function overflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const bad = []
    for (const el of document.querySelectorAll('.vocab-cosmos, .vocab-cosmos .vc-content *, .tour-chrome')) {
      if (el.closest('.vl-room')) continue
      const r = el.getBoundingClientRect()
      if (r.width && (r.right > vw + 1 || r.left < -1)) bad.push(`${el.tagName}.${String(el.className).slice(0, 40)} ${Math.round(r.left)}..${Math.round(r.right)}`)
    }
    return { doc: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 6) }
  })
}

async function run(browser, { name, width, height, mobile }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: !!mobile, hasTouch: !!mobile })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('response', (r) => { if (r.status() >= 400) errs.push(`${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__played = []
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () { window.__played.push(this); return play.call(this) }
  })
  const shot = (n) => page.screenshot({ path: `${OUT}/${name}-${n}.png` })
  const log = (...a) => console.log(`[${name}]`, ...a)
  const session = page.locator('.vl-sess')
  const step = async (n) => assert.equal(await page.locator('.vl-num').first().innerText(), `${n}/5`)

  // ── home ──
  await page.goto(`${BASE}/tour/verbs`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  assert.equal(await page.evaluate(() => document.activeElement === document.body), true, 'focus stolen on load')
  log('home overflow', JSON.stringify(await overflow(page)))
  await page.locator('.vl-p.vl-c-amber').first().scrollIntoViewIfNeeded()
  await shot('01-home-week')
  await page.locator('.vl-sample').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(400)
  await shot('02-home-sample')

  // ── start the session ──
  await page.getByRole('button', { name: /جلسة اليوم/ }).click()
  await page.waitForURL('**/tour/verbs/session')
  await page.waitForTimeout(600)
  assert.equal(await page.evaluate(() => !(document.activeElement instanceof HTMLInputElement)), true, 'input focused on session load')
  await step(1)

  // 1 · go · teaching card + audio
  assert.match(await session.innerText(), /يذهب/)
  await session.getByRole('button', { name: 'استمع إلى went' }).click()
  const a1 = await audioProbe(page)
  log('audio went', JSON.stringify(a1))
  assert.ok(a1 && /went\.mp3|^blob:/.test(a1.src) && a1.t > 0, 'went did not play')
  await session.getByRole('button', { name: 'استمع إلى gone' }).click()
  const a1b = await audioProbe(page)
  assert.ok(a1b.t > 0, 'gone did not play')
  await shot('03-go-meet')
  await session.getByRole('button', { name: /فهمت، التالي/ }).click()
  await page.waitForTimeout(500)

  // 2 · sing · multiple choice
  const opts = await session.locator('.vl-choice').allInnerTexts()
  log('sing options', opts.join(' · '))
  assert.equal(opts.length, 3)
  assert.notEqual(opts.indexOf('sang'), opts.length - 1, 'answer is last again')
  if (!mobile) {
    await session.getByRole('button', { name: 'sung', exact: true }).click()
    await page.waitForTimeout(500)
    assert.match(await session.innerText(), /خلط بين التصريف الثاني والثالث/)
    await shot('04-sing-wrong')
    // Enter from an unrelated field on the page must NOT advance the session
    await page.evaluate(() => {
      const i = document.createElement('input'); i.id = '__outside'; i.style.cssText = 'position:fixed;top:0;left:0;width:10px'
      document.body.appendChild(i); i.focus()
    })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.vl-num').first().innerText(), '2/5', 'outside Enter advanced the session')
    await page.evaluate(() => document.getElementById('__outside').remove())
    // …but Enter inside the session does
    await session.focus()
    await page.keyboard.press('Enter')
  } else {
    await session.getByRole('button', { name: 'sang', exact: true }).click()
    await page.waitForTimeout(500)
    assert.match(await session.innerText(), /صحيح/)
    await shot('04-sing-right')
    await session.getByRole('button', { name: 'التالي', exact: true }).click()
  }
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.vl-num').first().innerText(), '3/5')

  // 3 · write · type forms 2 and 3
  await page.locator('#vl-v2').fill('wrote')
  if (!mobile) {
    await page.locator('#vl-v3').fill('writen')
    await page.locator('#vl-v3').press('Enter')
    await page.waitForTimeout(500)
    const txt = await session.innerText()
    assert.match(txt, /حرف واحد فقط/)
    const diff = await session.locator('.vl-diff span').evaluateAll((s) => s.map((x) => `${x.className}:${x.textContent}`))
    log('diff', diff.join(' '))
    assert.ok(diff.includes('d-missing:t'), 'letter diff has no missing t')
    assert.match(txt, /written بحرف t مضاعف/)
    const next = session.getByRole('button', { name: 'التالي', exact: true })
    assert.equal(await next.isDisabled(), true, 'next should wait for the retype')
    // Arabic in the retype → gentle hint
    await page.locator('#vl-retype').fill('ريتن')
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.vl-arhint').count(), 1)
    await shot('05-write-writen')
    await page.locator('#vl-retype').fill('written')
    assert.equal(await next.isDisabled(), false)
    await page.locator('#vl-retype').press('Enter')   // Enter from the retype continues
  } else {
    await page.locator('#vl-v3').fill('written')
    await session.getByRole('button', { name: /تحقّق/ }).click()
    await page.waitForTimeout(500)
    assert.match(await session.innerText(), /صحيح/)
    await shot('05-write-right')
    await session.getByRole('button', { name: 'التالي', exact: true }).click()
  }
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.vl-num').first().innerText(), '4/5')

  // 4 · drink · the gap
  assert.match(await session.innerText(), /All the water has been/)
  await page.locator('#vl-gap').fill('درنك')
  await page.waitForTimeout(200)
  assert.equal(await page.locator('.vl-arhint').count(), 1, 'no Arabic hint')
  const check = session.getByRole('button', { name: /تحقّق/ })
  assert.equal(await check.isDisabled(), true, 'Arabic answer is gradable')
  await page.locator('#vl-gap').press('Enter')
  await page.waitForTimeout(300)
  assert.equal(await session.locator('.vl-p.vl-c-red').count(), 0, 'Arabic was graded')
  await shot('06-drink-arabic')
  await page.locator('#vl-gap').fill(mobile ? 'drunk' : 'drank')
  assert.equal(await page.locator('.vl-arhint').count(), 0)
  await check.click()
  await page.waitForTimeout(500)
  if (!mobile) {
    assert.match(await session.innerText(), /خلط بين التصريف الثاني والثالث/)
    assert.match(await session.innerText(), /نفس نمط sing/)
  } else {
    assert.match(await session.innerText(), /صحيح/)
  }
  await shot('07-drink-verdict')
  await session.getByRole('button', { name: 'التالي', exact: true }).click()
  await page.waitForTimeout(600)

  // 5 · begin · all three from the Arabic
  assert.equal(await page.locator('.vl-num').first().innerText(), '5/5')
  assert.match(await session.innerText(), /يبدأ/)
  await page.locator('#vl-v1').fill('begin')
  await page.locator('#vl-v2').fill(mobile ? 'begun' : 'began')
  await page.locator('#vl-v3').fill('begun')
  await session.getByRole('button', { name: /تحقّق/ }).click()
  await page.waitForTimeout(600)
  if (!mobile) assert.match(await session.innerText(), /التصريفات الثلاثة صحيحة/)
  else assert.match(await session.innerText(), /خلط بين التصريف الثاني والثالث/)
  await session.getByRole('button', { name: 'استمع إلى began' }).click()
  const a5 = await audioProbe(page)
  log('audio began', JSON.stringify(a5))
  assert.ok(a5 && a5.t > 0, 'began did not play')
  await shot('08-begin-verdict')
  await session.getByRole('button', { name: 'إنهاء الجلسة' }).click()
  await page.waitForTimeout(900)

  // ── summary ──
  const sum = await page.locator('.vl-shell-session').innerText()
  const expectRight = mobile ? '3 صحيحة من 4' : '1 صحيحة من 4'
  assert.ok(sum.includes(expectRight), `summary: ${sum.slice(0, 80)}`)
  assert.ok(!/(^|\D)0(\D|$)/.test(sum.replace(/\d+\/\d+/g, '')), 'a bare 0 is printed')
  log('summary overflow', JSON.stringify(await overflow(page)))
  await page.screenshot({ path: `${OUT}/${name}-09-summary.png`, fullPage: false })
  await page.locator('.vl-p--link').scrollIntoViewIfNeeded()
  await shot('10-summary-cta')

  // ── atlas ──
  await page.getByRole('link', { name: /أطلس الأفعال/ }).click()
  await page.waitForURL('**/tour/verbs/atlas')
  await page.waitForTimeout(900)
  const dots = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.vl-row')].map((r) => {
    const d = r.querySelector('.vl-dot')
    return [r.querySelector('.f1').textContent, `${d.className.replace('vl-dot ', '')} ${getComputedStyle(d).backgroundColor}`]
  })))
  log('atlas dots', JSON.stringify(dots))
  assert.equal(Object.keys(dots).length, 8)
  assert.match(dots.sing, /learning/)
  assert.match(dots.begin, mobile ? /learning/ : /solid/)
  assert.match(dots.swim, /vl-dot--new/)
  const legend = await page.evaluate(() => [...document.querySelectorAll('header .vl-dot')].map((d) => getComputedStyle(d).backgroundColor))
  log('legend', legend.join(' | '))
  assert.equal(new Set(legend).size, 4, 'legend dots are not four colours')
  log('atlas overflow', JSON.stringify(await overflow(page)))
  await shot('11-atlas')
  await page.locator('.vl-row').last().scrollIntoViewIfNeeded()
  await shot('12-atlas-rows')
  // a locked family opens onto its rule and «داخل المنصة»
  await page.getByRole('button', { name: /لا يتغيّر أبداً/ }).click()
  await page.waitForTimeout(300)
  assert.match(await page.locator('.vl-fam__locked').first().innerText(), /داخل المنصة/)
  // search
  await page.getByLabel('ابحث في الأفعال').fill('sw')
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.vl-row').count(), 1)
  await shot('13-atlas-search')

  // ── one verb on its own ──
  await page.locator('.vl-row').first().click()
  await page.waitForURL('**/session?verb=swim')
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.vl-num').first().innerText(), '1/2')
  await session.getByRole('button', { name: 'استمع إلى swum' }).click()
  const a6 = await audioProbe(page)
  assert.ok(a6.t > 0 && /swum|^blob:/.test(a6.src), 'swum did not play')
  await session.getByRole('button', { name: /فهمت، التالي/ }).click()
  await page.waitForTimeout(500)
  await page.locator('#vl-v2').fill('swam')
  await page.locator('#vl-v3').fill('swum')
  await page.locator('#vl-v3').press('Enter')
  await page.waitForTimeout(500)
  await session.getByRole('button', { name: 'إنهاء الجلسة' }).click()
  await page.waitForTimeout(600)
  assert.match(await page.locator('.vl-shell-session').innerText(), /1 صحيحة من 1/)
  assert.match(await page.locator('.vl-shell-session').innerText(), /جلسة نظيفة بالكامل/)

  // again → the same run from the top; exit → home
  await page.getByRole('button', { name: /أعِد الجلسة/ }).click()
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.vl-num').first().innerText(), '1/2')
  // inputs: 16px (no iOS zoom), LTR, no autocorrect/capitalise
  await session.getByRole('button', { name: /فهمت، التالي/ }).click()
  await page.waitForTimeout(400)
  const inp = await page.locator('#vl-v2').evaluate((el) => ({ fs: getComputedStyle(el).fontSize, dir: el.dir, ac: el.getAttribute('autocapitalize'), co: el.getAttribute('autocorrect'), sc: el.spellcheck }))
  log('input', JSON.stringify(inp))
  assert.ok(parseFloat(inp.fs) >= 16 && inp.dir === 'ltr' && inp.ac === 'off' && inp.co === 'off' && inp.sc === false)
  await session.getByRole('button', { name: 'خروج' }).click()
  await page.waitForURL(/\/tour\/verbs$/)

  const uniq = [...new Set(errs)]
  log(uniq.length ? 'ERRORS\n  ' + uniq.join('\n  ') : 'no console errors / 4xx')
  await ctx.close()
  return uniq.length
}

;(async () => {
  const browser = await chromium.launch()
  let bad = 0
  try {
    bad += await run(browser, { name: 'desk', width: 1440, height: 900 })
    bad += await run(browser, { name: 'mob', width: 390, height: 844, mobile: true })
  } finally { await browser.close() }
  console.log(bad ? 'DONE with errors' : 'ALL PASS')
  process.exit(bad ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
