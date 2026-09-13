// Grammar room click-through: every interaction, right AND wrong, at desktop and phone width.
// usage: node scripts/tour/grammar/clickthrough.cjs [baseUrl] [shotDir]
const { chromium } = require('/Users/dr.ali/projects/fluentia-lms/node_modules/playwright');
const fs = require('fs');
const [,, BASE = 'http://127.0.0.1:5292', SHOTS = '/tmp/grammar-ct'] = process.argv;
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗ FAIL'} ${msg}`); if (!cond) failures++; };

async function run(browser, width) {
  const height = width < 600 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, hasTouch: width < 600, isMobile: width < 600 });
  // speechSynthesis is the reference's audio: record what it is asked to say.
  await ctx.addInitScript(() => {
    window.__spoken = [];
    if (window.speechSynthesis) {
      window.speechSynthesis.speak = (u) => window.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate });
      window.speechSynthesis.cancel = () => {};
    }
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errs.push(`${r.status()} ${r.url()}`); });
  const shot = (name, el) => (el || page).screenshot({ path: `${SHOTS}/${width}-${name}.png` });
  const tag = width < 600 ? 'mobile' : 'desktop';

  console.log(`\n=== ${tag} ${width}px — /tour/grammar (reference) ===`);
  await page.goto(`${BASE}/tour/grammar`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // no trainer layer anywhere in the page or its data
  const html = await page.content();
  ok(!/للمدرّب|كيف نشرحها|board_ar|check_question_ar|misdiagnosis_ar/.test(html), 'no trainer («teach») layer in the DOM');
  ok(!/[٠-٩]/.test(await page.evaluate(() => document.body.innerText)), 'no Arabic-Indic digits on the page');
  ok((await page.getByText('العربية تملك ماضيًا واحدًا', { exact: false }).count()) === 1, '«العربية تملك ماضيًا واحدًا» section present');
  ok((await page.getByText('I visited Makkah three times last Ramadan.').count()) === 1, 'Makkah / Ramadan contrast present');
  ok((await page.locator('.gref-fig svg').count()) === 2, 'both coded SVG diagrams rendered');
  ok((await page.getByText('عام 2014', { exact: false }).count()) === 1, '٢٠١٤ now reads 2014');

  // overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(overflow <= 0, `no horizontal page overflow (${overflow})`);

  // «Grammar Library» and bookmark
  await page.getByRole('button', { name: /Grammar Library/ }).click();
  ok(await page.locator('.grm-inplatform', { hasText: '309 قواعد' }).isVisible(), 'Grammar Library → «متاح داخل المنصة» note with 309');
  await page.getByRole('button', { name: 'حفظ هذه القاعدة' }).click();
  ok((await page.getByRole('button', { name: 'إزالة من المحفوظات' }).getAttribute('aria-pressed')) === 'true', 'bookmark toggles on (local)');
  ok(await page.locator('.grm-inplatform', { hasText: 'المحفوظة' }).isVisible(), 'bookmark → note on where saving lives');
  await shot('01-header-notes');
  await page.getByRole('button', { name: 'إزالة من المحفوظات' }).click();

  // diagrams on a phone open at the drawing's left edge, row labels visible
  if (width < 600) {
    const fig = await page.evaluate(() => [...document.querySelectorAll('.gref-fig-scroll')].map((s) => ({ left: s.scrollLeft, dir: getComputedStyle(s).direction, edge: s.dataset.edge, sw: s.scrollWidth, cw: s.clientWidth })));
    ok(fig.length === 2 && fig.every((f) => f.left === 0 && f.dir === 'ltr' && f.sw > f.cw), `figure scrollers open at scrollLeft 0, ltr (${JSON.stringify(fig)})`);
    const figEl = page.locator('.gref-fig').first();
    await figEl.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    const labelVisible = await page.evaluate(() => {
      const t = [...document.querySelectorAll('.gref-fig text')].find((x) => x.textContent === 'has arrived');
      const r = t.getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth;
    });
    ok(labelVisible, '«has arrived» row label is on screen without scrolling the figure');
    ok(fig[0].edge === 'start', 'figure fades its far edge as a scroll hint');
    await shot('02-diagram-phone', page.locator('.gref-fig').first());
    await page.locator('.gref-fig').nth(1).scrollIntoViewIfNeeded();
    await shot('02b-signals-phone', page.locator('.gref-fig').nth(1));
    // scroll the signal board to its end: the third column comes into view
    await page.evaluate(() => { const s = document.querySelectorAll('.gref-fig-scroll')[1]; s.scrollLeft = s.scrollWidth; });
    await page.waitForTimeout(200);
    ok((await page.locator('.gref-fig-scroll').nth(1).getAttribute('data-edge')) === 'end', 'signal board scrolls to its end (edge=end)');
    await shot('02c-signals-phone-end', page.locator('.gref-fig').nth(1));
  }

  // section jumper
  const chip = page.locator('nav[aria-label="أقسام هذه الصفحة"] button', { hasText: 'تأكّد من فهمك' });
  await chip.click();
  // smooth scroll: wait for it to settle near the target (or give up after 4s and assert)
  await page.waitForFunction(() => {
    const top = document.getElementById('gref-drills').getBoundingClientRect().top;
    const bar = document.querySelector('.tour-bar').getBoundingClientRect().height;
    return top > bar && top < bar + 160;
  }, null, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(400);
  const drillsTop = await page.evaluate(() => document.getElementById('gref-drills').getBoundingClientRect().top);
  const barH = await page.evaluate(() => document.querySelector('.tour-bar').getBoundingClientRect().height);
  ok(drillsTop > barH && drillsTop < barH + 160, `jumper chip «تأكّد من فهمك» lands the drills under the bars (top ${Math.round(drillsTop)}, bar ${Math.round(barH)})`);
  const railTop = await page.evaluate(() => document.querySelector('nav[aria-label="أقسام هذه الصفحة"]').getBoundingClientRect().top);
  ok(railTop >= barH - 1 && railTop < barH + 20, `sticky rail sits under the tour bar, not beneath it (rail ${Math.round(railTop)})`);

  // speak an example
  await page.locator('.gref-ledger button[aria-label="استمع إلى الجملة"]').first().click();
  const spoken = await page.evaluate(() => window.__spoken);
  ok(spoken.length === 1 && spoken[0].text === 'I have sold my car, so I take the bus now.' && spoken[0].lang === 'en-US', `🔊 speaks the example in en-US without ** marks (${JSON.stringify(spoken[0])})`);

  const drills = page.locator('#gref-drills .gref-panel');
  ok((await drills.count()) === 6, 'six drills');

  // ── the three choose drills: wrong first, then right
  const chooseCases = [
    { wrong: 'have sold', right: 'sold', whyWrong: 'المضارع التام لا يجتمع مع ظرف زمن منتهٍ', whyRight: 'last Thursday وعاء زمني أُغلق' },
    { wrong: 'received', right: 'have received', whyWrong: 'الماضي البسيط يوحي بأن الأسبوع انتهى', whyRight: 'وعاء ما زال مفتوحًا' },
    { wrong: 'has been writing', right: 'wrote', whyWrong: 'التام المستمر يصف نشاطًا متّصلًا بالحاضر', whyRight: 'حياته انتهت فسجلّه مغلق' },
  ];
  const opt = (d, text) => d.locator('.gref-opt').filter({ has: page.locator('span[lang="en"]', { hasText: new RegExp(`^${text}$`) }) });
  for (let i = 0; i < 3; i++) {
    const d = drills.nth(i);
    const c = chooseCases[i];
    await d.scrollIntoViewIfNeeded();
    await opt(d, c.wrong).click();
    const wrongCls = await opt(d, c.wrong).getAttribute('class');
    const rightCls = await opt(d, c.right).getAttribute('class');
    ok(/gref-opt--wrong/.test(wrongCls) && /gref-opt--correct/.test(rightCls), `drill ${i + 1}: «${c.wrong}» marked wrong, «${c.right}» lights up`);
    ok(await d.getByText(c.whyWrong, { exact: false }).isVisible(), `drill ${i + 1}: why_ar for the wrong pick shown`);
    ok(await d.getByText(c.whyRight, { exact: false }).isVisible(), `drill ${i + 1}: why_ar for the correct option shown`);
    const badColor = await d.getByText(c.whyWrong, { exact: false }).evaluate((el) => getComputedStyle(el).color);
    ok(badColor === 'rgb(224, 102, 102)', `drill ${i + 1}: wrong why in --gref-bad (${badColor})`);
    if (i === 0) await shot('03-choose-wrong', d);
    await d.getByRole('button', { name: /جرّب مرة أخرى/ }).click();
    ok(!(/gref-opt--/.test(await d.locator('.gref-opt').first().getAttribute('class'))), `drill ${i + 1}: «جرّب مرة أخرى» resets`);
    await opt(d, c.right).click();
    ok(await d.getByText(c.whyRight, { exact: false }).isVisible() && !(await d.getByText(c.whyWrong, { exact: false }).isVisible()), `drill ${i + 1}: right pick shows only its own why`);
    ok((await d.getByRole('button', { name: /جرّب مرة أخرى/ }).count()) === 0, `drill ${i + 1}: no retry after a right answer`);
    if (i === 0) await shot('04-choose-right', d);
  }

  // hint toggle on drill 1
  await drills.nth(0).getByRole('button', { name: 'تلميح' }).click();
  ok(await drills.nth(0).getByText('الكلمتان الأخيرتان تحسمان الأمر', { exact: false }).isVisible(), 'hint toggle reveals hint_ar');
  await drills.nth(0).getByRole('button', { name: 'إخفاء التلميح' }).click();

  async function written(i, value) {
    const d = drills.nth(i);
    await d.scrollIntoViewIfNeeded();
    if (await d.getByRole('button', { name: /من جديد/ }).count()) await d.getByRole('button', { name: /من جديد/ }).click();
    await d.locator('.gref-input').fill(value);
    await d.getByRole('button', { name: 'تحقّق' }).click();
    const box = d.locator('.gref-careful[role="status"]');
    return (await box.innerText()).trim();
  }

  // ── error correction (drill 4)
  let t = await written(3, 'I have visited my grandmother last Friday.');
  ok(/هذه هي الجملة نفسها/.test(t), 'drill 4: resubmitting the broken sentence is refused with its own note');
  t = await written(3, 'I visit my grandmother last Friday.');
  ok(/ليست بعد/.test(t) && t.includes('I visited my grandmother last Friday.'), 'drill 4: wrong fix → «ليست بعد» + the model answer');
  ok(await drills.nth(3).getByText('الخطأ في الزمن لا في الترتيب', { exact: false }).isVisible(), 'drill 4: a miss auto-reveals the hint');
  await shot('05-fix-wrong', drills.nth(3));
  t = await written(3, 'I visited my grandmother last Friday.');
  ok(/^صحيح/.test(t), 'drill 4: correct fix → «صحيح»');

  // ── fill blank (drill 5): the false-accept fix
  for (const bad of ['worked', 'working', 'has work', 'has']) {
    t = await written(4, bad);
    ok(/ليست بعد/.test(t) && t.includes('has worked'), `drill 5: «${bad}» is REJECTED (production accepts it)`);
    if (bad === 'has work') await shot('06-fill-has-work-rejected', drills.nth(4));
  }
  for (const good of ['has worked', 'has been working', "'s worked", 'She has worked in this department since March.']) {
    t = await written(4, good);
    ok(/^صحيح/.test(t), `drill 5: «${good}» accepted`);
  }
  await shot('07-fill-right', drills.nth(4));

  // ── transform (drill 6)
  t = await written(5, 'They have opened a second branch in 2018.');
  ok(/ليست بعد/.test(t), 'drill 6: keeping the present perfect with 2018 → wrong');
  t = await written(5, 'In 2018 they opened a second branch.');
  ok(/^صحيح/.test(t), 'drill 6: fronted «In 2018 …» accepted');
  // Enter submits too
  const d6 = drills.nth(5);
  await d6.getByRole('button', { name: /من جديد/ }).click();
  await d6.locator('.gref-input').fill('They opened a second branch in 2018.');
  await d6.locator('.gref-input').press('Enter');
  ok(/^صحيح/.test((await d6.locator('.gref-careful[role="status"]').innerText()).trim()), 'drill 6: Enter key checks');

  // prev / next, related
  await page.getByRole('button', { name: /used to \(do\)/ }).click();
  ok(await page.locator('.grm-inplatform', { hasText: 'قواعد الباب كلها' }).isVisible(), '«التالي» entry → in-platform note');
  await page.getByRole('button', { name: /for and since/ }).last().click();
  ok(await page.locator('.grm-inplatform', { hasText: 'القواعد المرتبطة' }).isVisible(), '«اقرأ بعدها» → in-platform note');
  await shot('08-related-note', page.locator('.gref section').last());

  // bridge → unit chapter
  await page.getByRole('link', { name: /افتح درس الوحدة/ }).click();
  await page.waitForURL('**/tour/grammar/unit');
  await page.waitForTimeout(700);
  ok((await page.evaluate(() => scrollY)) === 0, 'bridge link → /tour/grammar/unit, scrolled to top');

  console.log(`\n=== ${tag} ${width}px — /tour/grammar/unit ===`);
  const ov2 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(ov2 <= 0, `no horizontal page overflow (${ov2})`);
  ok(!/[٠-٩]/.test(await page.evaluate(() => document.body.innerText)), 'no Arabic-Indic digits');
  ok(!/اختاري|صحّحي|رتبي|املئي|حوّلي|انتبهي/.test(await page.evaluate(() => document.body.innerText)), 'no feminine-only instructions');
  ok((await page.locator('[data-grammar-exercise-card]').count()) === 5, 'five exercise cards');
  const types = await page.locator('[data-grammar-exercise-card] .rounded-md').allInnerTexts();
  ok(['اختيار من متعدد', 'حوّل الجملة', 'صحّح الخطأ', 'رتّب الكلمات', 'أكمل الفراغ'].every((x) => types.includes(x)), 'one card per type');
  await shot('10-unit-top');

  // deep panel
  await page.getByRole('button', { name: /شرح أعمق/ }).click();
  await page.waitForTimeout(400);
  ok(await page.getByText('المبني للمجهول — المضارع').isVisible(), '«شرح أعمق» opens its tables');
  await shot('11-deep-open', page.locator('.grammar-glass', { hasText: 'شرح أعمق' }));
  await page.getByRole('button', { name: /شرح أعمق/ }).click();

  const cards = page.locator('[data-grammar-exercise-card]');
  async function attempt(n, plan) {
    // 1 · choose
    const c1 = cards.nth(0);
    await c1.scrollIntoViewIfNeeded();
    if (n === 1) {
      await c1.getByRole('button', { name: 'تلميح' }).click();
      ok(await c1.locator('.grammar-explanation-bar').isVisible(), 'unit hint opens before answering');
    }
    await c1.locator('.grammar-option', { hasText: new RegExp(`\\)\\s*${plan.mcq}$`) }).click();
    const v1 = await c1.locator('.qx-verdict').getAttribute('data-ok');
    ok(v1 === String(plan.mcq === 'is grown'), `choose «${plan.mcq}» → verdict data-ok=${v1}`);
    ok(await c1.locator('.qx-vwhy-text', { hasText: 'coffee مفرد' }).isVisible(), 'choose: explanation_ar in the verdict');
    if (plan.mcq !== 'is grown') {
      ok(/grammar-option--wrong/.test(await c1.locator('.grammar-option', { hasText: /are grown$/ }).getAttribute('class')), 'choose: wrong pick red, correct revealed');
      await shot(`12-mcq-wrong-a${n}`, c1);
    }
    // 2 · transform
    const c2 = cards.nth(1);
    await c2.scrollIntoViewIfNeeded();
    await c2.locator('textarea').fill(plan.transform);
    await c2.getByRole('button', { name: 'تحقق' }).click();
    ok((await c2.locator('.qx-verdict').getAttribute('data-ok')) === String(plan.transformOk), `transform «${plan.transform}» → ${plan.transformOk ? 'right' : 'wrong'}`);
    if (!plan.transformOk) {
      ok(await c2.locator('.qx-vchip[data-kind="correct"]', { hasText: 'Coffee is drunk all over the world.' }).isVisible(), 'transform: your answer vs the correct one');
      await c2.getByRole('button', { name: /اشرح لي/ }).click();
      ok(await c2.locator('.grm-inplatform').isVisible(), '«اشرح لي» → in-platform note (no AI call)');
      await shot(`13-transform-wrong-a${n}`, c2);
    }
    // 3 · error correction
    const c3 = cards.nth(2);
    await c3.scrollIntoViewIfNeeded();
    await c3.locator('input[type="text"]').fill(plan.fix);
    await c3.getByRole('button', { name: 'تحقق' }).click();
    ok((await c3.locator('.qx-verdict').getAttribute('data-ok')) === String(plan.fixOk), `error_correction «${plan.fix}» → ${plan.fixOk ? 'right' : 'wrong'}`);
    // 4 · reorder
    const c4 = cards.nth(3);
    await c4.scrollIntoViewIfNeeded();
    for (const w of plan.order) await c4.locator('.grammar-chip:not(.grammar-chip--selected)', { hasText: new RegExp(`^${w}$`) }).first().click();
    if (n === 1) {
      // take one word back out and put it back — chips move both ways
      await c4.locator('.grammar-chip--selected').last().click();
      await c4.locator('.grammar-chip:not(.grammar-chip--selected)', { hasText: new RegExp(`^${plan.order.at(-1)}$`) }).click();
    }
    await c4.getByRole('button', { name: 'تحقق' }).click();
    ok((await c4.locator('.qx-verdict').getAttribute('data-ok')) === String(plan.orderOk), `reorder «${plan.order.join(' ')}» → ${plan.orderOk ? 'right' : 'wrong'}`);
    if (plan.orderOk) await shot(`14-reorder-right-a${n}`, c4);
    // 5 · fill blank
    const c5 = cards.nth(4);
    await c5.scrollIntoViewIfNeeded();
    await c5.locator('input[type="text"]').fill(plan.fill);
    await c5.getByRole('button', { name: 'تحقق' }).click();
    ok((await c5.locator('.qx-verdict').getAttribute('data-ok')) === String(plan.fillOk), `fill_blank «${plan.fill}» → ${plan.fillOk ? 'right' : 'wrong'}`);
    if (!plan.fillOk) await shot(`15-fill-wrong-a${n}`, c5);

    const dots = await page.locator('.grammar-dot').evaluateAll((els) => els.map((e) => e.className));
    ok(dots.filter((c) => /correct/.test(c)).length === plan.expectCorrect, `progress dots: ${plan.expectCorrect} green`);
    const submit = page.getByRole('button', { name: /تسليم الإجابات \(5\/5\)/ });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    await page.waitForTimeout(900);
    const summary = page.locator('.grammar-glass', { hasText: 'من 5 صحيحة' });
    ok(await summary.isVisible(), 'summary shown after submitting');
    ok((await summary.innerText()).includes(`${plan.expectCorrect} من 5 صحيحة`) && (await summary.innerText()).includes(`${plan.expectCorrect * 20}%`), `summary: ${plan.expectCorrect} من 5 · ${plan.expectCorrect * 20}%`);
    const sumTop = await summary.evaluate((el) => el.getBoundingClientRect().top);
    ok(sumTop >= 0 && sumTop < innerHeightOf(height), `summary scrolled into view (top ${Math.round(sumTop)})`);
    await shot(`16-summary-a${n}`);
  }
  const innerHeightOf = (h) => h;

  await attempt(1, {
    mcq: 'are grown',
    transform: 'Coffee is drink all over the world.', transformOk: false,
    fix: 'Cappuccino is prepared with espresso and steamed milk.', fixOk: true,
    order: ['Organic', 'coffee', 'is', 'sold', 'in', 'specialty', 'shops'], orderOk: true,
    fill: 'is printed', fillOk: false,
    expectCorrect: 2,
  });
  const headerPill = await page.locator('.grammar-page').first().getByText('أفضل درجة: 40%').count();
  ok(headerPill >= 1, 'header pill «أفضل درجة: 40%» after attempt 1');

  await page.getByRole('button', { name: /محاولة جديدة/ }).click();
  await page.waitForTimeout(300);
  ok((await page.locator('.qx-verdict').count()) === 0, 'retry clears every card');
  ok(await page.getByText('محاولة 2').first().isVisible(), 'retry → «محاولة 2»');

  await attempt(2, {
    mcq: 'is grown',
    transform: 'Coffee is drunk all over the world.', transformOk: true,
    fix: 'Cappuccino is preparing with espresso and steamed milk.', fixOk: false,
    order: ['Organic', 'coffee', 'is', 'sold', 'in', 'specialty', 'shops'], orderOk: true,
    fill: 'are printed', fillOk: true,
    expectCorrect: 4,
  });
  ok(await page.locator('.grammar-page').first().getByText('أفضل درجة: 80%').first().isVisible(), 'best score updates to 80%');
  const drift = await page.evaluate(() => {
    const g = document.querySelector('.grammar-page');
    const c = [...document.querySelectorAll('[data-grammar-exercise-card]')].map((e) => e.getBoundingClientRect());
    return { sl: g.scrollLeft, out: c.filter((r) => r.left < 0 || r.right > innerWidth).length };
  });
  ok(drift.sl === 0 && drift.out === 0, `lesson never slides sideways after all the taps (scrollLeft ${drift.sl}, cards off-screen ${drift.out})`);

  // chapter nav back
  await page.locator('.grm-chapters').scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: /المرجع النحوي/ }).first().click();
  await page.waitForURL(/\/tour\/grammar$/);
  ok(await page.locator('.gref h1').waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false), 'chapter switch → back to the reference');

  ok(errs.length === 0, `no console errors / 4xx (${JSON.stringify(errs)})`);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  await run(browser, 1440);
  await run(browser, 390);
  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
