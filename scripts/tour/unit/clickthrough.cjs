// Click-through for the unit tour room — every interaction, at 1440 and 390 wide.
//   TOUR_BASE=http://127.0.0.1:5291 TOUR_SHOTS=/tmp/shots node scripts/tour/unit/clickthrough.cjs [desk|mob|both]
// Needs a running dev server and Playwright (defaults to fluentia-lms's copy; set PLAYWRIGHT_PATH).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || require('os').homedir() + '/projects/fluentia-lms/node_modules/playwright');
const BASE = process.env.TOUR_BASE || 'http://127.0.0.1:5291';
const SHOTS = process.env.TOUR_SHOTS || require('os').tmpdir();
const which = process.argv[2] || 'both';

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fails++; };

async function audioProbe(page) {
  await page.addInitScript(() => {
    window.__played = [];
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__played.push(this);
      return orig.apply(this, arguments);
    };
  });
}
// the most recent clip, polled until it has actually advanced (or ended)
const lastAudio = async (page, wait = 2500) => {
  const t0 = Date.now();
  let r = null;
  while (Date.now() - t0 < wait) {
    r = await page.evaluate(() => {
      const a = window.__played[window.__played.length - 1];
      return a ? { src: a.currentSrc || a.src, t: a.currentTime, paused: a.paused, err: a.error && a.error.code, n: window.__played.length } : null;
    });
    if (r && (r.t > 0.05 || r.err)) return r;
    await page.waitForTimeout(150);
  }
  return r;
};
const _lastAudioOnce = (page) => page.evaluate(() => {
  const a = window.__played[window.__played.length - 1];
  return a ? { src: a.currentSrc || a.src, t: a.currentTime, paused: a.paused, err: a.error && a.error.code, n: window.__played.length } : null;
});
// Mark each option with data-test-correct from the snapshot (the room's markup
// carries no answer hints of its own).
async function markCorrect(page, kind) {
  await page.evaluate(async (kind) => {
    const d = await fetch('/src/tour/rooms/unit/data/unit.json').then((r) => r.json());
    const norm = (t) => t.toLowerCase().trim();
    if (kind === 'reading') {
      const all = d.readings.flatMap((r) => r.questions);
      document.querySelectorAll('.qx-card[data-accent="sky"]').forEach((card) => {
        const qtext = card.querySelector('.qx-question').textContent.trim();
        const q = all.find((x) => x.question_en.trim() === qtext);
        card.querySelectorAll('.qx-opt').forEach((o) => {
          if (q && norm(o.lastElementChild.textContent) === norm(q.correct_answer)) o.dataset.testCorrect = 'true';
        });
      });
    } else {
      document.querySelectorAll('.qx-card[data-accent="violet"]').forEach((card, i) => {
        const ex = d.listening.exercises[i];
        card.querySelectorAll('.qx-opt').forEach((o, j) => { if (j === ex.correct_answer_index) o.dataset.testCorrect = 'true'; });
      });
    }
  }, kind);
}
async function overflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [...document.querySelectorAll('.tour-unit *')].filter((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width) return false;
      if (r.right <= vw + 1 && r.left >= -1) return false;
      // allowed: inside a horizontal scroller or a clipped backdrop
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) && p.getBoundingClientRect().right <= vw + 1) return false;
      }
      return true;
    });
    return { docX: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 6).map((e) => (e.className && e.className.toString().slice(0, 50)) || e.tagName) };
  });
}

async function run(mode) {
  const mobile = mode === 'mob';
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await audioProbe(page);
  const shot = (name) => page.screenshot({ path: `${SHOTS}/ct-${mode}-${name}.png` });
  const tap = async (loc) => { if (mobile) await loc.tap(); else await loc.click(); };

  console.log(`\n=== ${mode} ===`);

  // 1 · level page
  await page.goto(`${BASE}/tour/unit`, { waitUntil: 'load' });
  await page.waitForSelector('.lvx-card');
  ok((await page.locator('.lvx-card, .lvx-feat').count()) === 12, 'level shows 12 unit cards');
  const feat = page.locator('.lvx-feat').first();
  await feat.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await tap(feat);
  await page.waitForSelector('.tu-peek');
  ok((await page.locator('.tu-peek__title').first().textContent()).includes('موجودة داخل المنصة'), 'locked card shows «هذه الوحدة موجودة داخل المنصة»');
  await shot('01-level-peek');
  const unit4 = page.locator('.lvx-card').nth(2);
  await tap(unit4);
  ok((await page.locator('.tu-peek').count()) === 1, 'tapping another card moves the note (one at a time)');
  await tap(page.locator('.tu-peek__go').first());
  await page.waitForURL('**/tour/unit/extreme-weather');
  ok(true, 'note CTA opens the specimen unit');

  // 2 · overview
  await page.waitForSelector('.sp-page');
  ok((await page.locator('.sp-item').count()) === 6, 'spread lists 6 stations');
  const whyText = await page.locator('.sp-pull p').textContent();
  ok(!/صوراً|ستعلّم كيف وصف/.test(whyText), 'why_matters is the corrected copy');
  const grammar = page.locator('#station-grammar .sp-item');
  await grammar.scrollIntoViewIfNeeded();
  await tap(grammar);
  await page.waitForSelector('#station-grammar .tu-teaser');
  ok((await page.locator('#station-grammar .tu-teaser__link').getAttribute('href')) === '/tour/grammar', 'grammar teaser links to /tour/grammar');
  await tap(page.locator('#station-writing .sp-item'));
  await page.waitForSelector('#station-writing .tu-teaser');
  await page.waitForTimeout(500);
  ok((await page.locator('#station-writing .tu-teaser__text').textContent()).includes('الذكاء الاصطناعي'), 'writing teaser explains AI evaluation');
  ok((await page.locator('#station-grammar .tu-teaser').count()) === 0, 'opening writing closes grammar note');
  await page.waitForTimeout(400);
  await shot('02-overview-teaser');
  await tap(page.locator('#station-speaking .sp-item'));
  await page.waitForSelector('#station-speaking .tu-teaser');
  ok((await page.locator('#station-speaking .tu-teaser__text').textContent()).includes('محادثة صوتية'), 'speaking teaser explains the conversation');
  await tap(page.locator('#station-reading .sp-item'));
  await page.waitForURL('**/extreme-weather/reading');
  ok(true, 'reading station opens the reading section');

  // 3 · reading
  await page.waitForSelector('.article-body .aw');
  await page.waitForTimeout(600);
  ok((await page.locator('.article-body .pmk').first().textContent()).trim().endsWith('A'), 'paragraph letters A/B/C are shown');
  ok((await page.locator('.article-body .aw-vocab').count()) === 16, 'reading A marks 16 target words');
  const meta = await page.locator('header').filter({ hasText: 'When Nature' }).textContent();
  ok(/6 دقائق قراءة/.test(meta), 'masthead reading time uses one rate («6 دقائق قراءة»)');
  // tap a target word
  const v = page.locator('.article-body .aw-vocab').first();
  await v.scrollIntoViewIfNeeded();
  const vw = (await v.textContent()).trim();
  await tap(v);
  await page.waitForSelector('.tu-wordpopup');
  await page.waitForTimeout(1500);
  const meaning = (await page.locator('.tu-wordpopup__meaning').textContent()).trim();
  ok(meaning && !meaning.includes('لا توجد'), `tapped «${vw}» → meaning «${meaning}»`);
  let a = await lastAudio(page);
  ok(a && a.t > 0.05 && !a.err, `word audio played (${a && a.src.split('/').pop()} t=${a && a.t.toFixed(2)})`);
  const box = await page.locator('.tu-wordpopup').boundingBox();
  const vp = page.viewportSize();
  ok(box.x >= 0 && box.x + box.width <= vp.width && box.y >= 0 && box.y + box.height <= vp.height, 'word popup sits inside the viewport');
  await shot('03-reading-wordpopup');
  // tap a plain word and single letter
  for (const w of ['experience', 'a', 'hurricanes', '50°C'.replace('50°', '')]) {
    const loc = page.locator(`.article-body .aw[data-w="${w}"]`).first();
    if (!(await loc.count())) { ok(false, `word «${w}» present`); continue; }
    await loc.scrollIntoViewIfNeeded();
    await tap(loc);
    const pop = page.locator('.tu-wordpopup', { hasText: w });
    await pop.waitFor({ timeout: 5000 });
    const m = (await pop.locator('.tu-wordpopup__meaning').textContent()).trim();
    a = await lastAudio(page);
    ok(!m.includes('لا توجد') && a && !a.err && a.src.includes(`/words/`), `«${w}» → «${m}» + clip ${a && a.src.split('/').pop()}`);
  }
  await page.keyboard.press('Escape');
  // every tappable word in A resolves
  const unresolved = await page.evaluate(async () => {
    const d = await fetch('/src/tour/rooms/unit/data/unit.json').then((r) => r.json());
    const norm = (w) => (w || '').toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}]+/u, '').replace(/[^\p{L}]+$/u, '');
    const na = (raw) => raw.toLowerCase().replace(/’/g, "'").trim().replace(/[^a-z'-]/g, '').replace(/^['-]+|['-]+$/g, '');
    const idx = d.readings[0].word_index;
    return [...document.querySelectorAll('.article-body .aw')].map((b) => b.dataset.w).filter((w) => !(idx[norm(w)]?.definition_ar) || !d.word_audio[na(w)]);
  });
  ok(unresolved.length === 0, `all reading-A words resolve meaning+clip (${unresolved.slice(0, 5)})`);

  // tools + listen notes
  await tap(page.getByRole('button', { name: 'أدوات القراءة' }));
  ok(await page.getByText('أدوات القراءة متاحة داخل المنصة').isVisible(), '«أدوات» shows its note');
  await tap(page.getByRole('button', { name: 'استماع' }));
  ok(await page.getByText('القراءة مع الصوت متاحة داخل المنصة').isVisible(), '«استماع» shows its note');

  // vocab box
  const vb = page.getByRole('button', { name: /مفردات القراءة/ });
  await vb.scrollIntoViewIfNeeded();
  await tap(vb);
  await page.waitForSelector('.tu-vocab-play');
  await tap(page.locator('.tu-vocab-play').nth(2));
  await page.waitForTimeout(1200);
  a = await lastAudio(page);
  ok(a && a.t > 0.05 && a.src.includes('/words/'), `vocab box plays word (${a && a.src.split('/').pop()})`);
  await tap(vb);

  // questions
  await markCorrect(page, 'reading');
  const cards = page.locator('.qx-card[data-accent="sky"]');
  ok((await cards.count()) === 7, 'reading A has 7 questions');
  const positions = await cards.evaluateAll((els) => els.map((c) => [...c.querySelectorAll('.qx-opt')].findIndex((o) => o.dataset.testCorrect === 'true')));
  ok(new Set(positions).size >= 3, `answer positions vary: ${positions.map((p) => 'ABCD'[p]).join('')}`);
  const hintBtn = cards.nth(1).locator('.tu-hint-btn');
  await hintBtn.scrollIntoViewIfNeeded();
  await tap(hintBtn);
  await page.waitForTimeout(400);
  const hintText = await cards.nth(1).locator('.qx-foot').textContent();
  ok(/الفقرة B/.test(hintText) && hintText.includes('الإجابة مظلّلة'), 'hint shows the evidence with «الفقرة B»');
  await shot('04-reading-hint');
  const submit = page.locator('.tu-submit');
  ok((await submit.isDisabled()) && (await submit.textContent()).includes('أجب على جميع'), 'submit disabled until all answered');
  for (let i = 0; i < 7; i++) {
    const c = cards.nth(i);
    const opt = i === 0 || i === 4 ? c.locator('.qx-opt:not([data-test-correct="true"])').first() : c.locator('.qx-opt[data-test-correct="true"]');
    await opt.scrollIntoViewIfNeeded();
    await tap(opt);
  }
  ok((await cards.nth(0).locator('.qx-opt[data-state="selected"]').count()) === 1, 'selection shows before submit (no grading yet)');
  await submit.scrollIntoViewIfNeeded();
  await tap(submit);
  await page.waitForSelector('.tu-confirm');
  await shot('05-reading-confirm');
  await tap(page.locator('.tu-confirm').getByRole('button', { name: 'تسليم' }));
  await page.waitForSelector('.qx-verdict');
  ok((await page.locator('.qx-verdict[data-ok="false"]').count()) === 2 && (await page.locator('.qx-verdict[data-ok="true"]').count()) === 5, 'verdicts: 5 right, 2 wrong');
  const wrongV = page.locator('.qx-verdict[data-ok="false"]').first();
  await wrongV.scrollIntoViewIfNeeded();
  ok((await wrongV.textContent()).includes('لماذا خيارك غير صحيح'), 'wrong verdict explains why the choice is wrong');
  await shot('06-reading-verdict');
  ok((await page.locator('.tu-result').textContent()).includes('5 من 7'), 'result banner «أجبت على 5 من 7»');
  const retry = page.locator('.tu-retry');
  await retry.scrollIntoViewIfNeeded();
  await tap(retry);
  ok((await page.locator('.qx-verdict').count()) === 0 && (await page.locator('.qx-opt[data-state="selected"]').count()) === 0, 'retry resets the questions');

  // reading B
  const tabB = page.locator('button[aria-pressed]', { hasText: 'القراءة الثانية' });
  await tabB.scrollIntoViewIfNeeded();
  await tap(tabB);
  await page.waitForSelector('text=When Sand Meets Sky');
  await page.waitForTimeout(500);
  const hb = page.locator('.article-body .aw[data-w="haboob"]').first();
  await hb.scrollIntoViewIfNeeded();
  await tap(hb);
  await page.waitForTimeout(1000);
  a = await lastAudio(page);
  ok((await page.locator('.tu-wordpopup__meaning').textContent()).trim().length > 1 && a && a.src.includes('haboob'), `reading B: «haboob» → ${await page.locator('.tu-wordpopup__meaning').textContent()}`);
  await shot('07-readingB-haboob');
  await page.keyboard.press('Escape');
  ok(!(await page.locator('.qx-question').allTextContents()).some((t) => t.includes('*')), 'no raw *markers* in question text');
  ok((await overflow(page)).bad.length === 0, `reading: no horizontal overflow ${JSON.stringify(await overflow(page))}`);

  // 4 · listening via station bar
  const stL = page.locator('.tu-stations__item', { hasText: 'الاستماع' });
  await stL.scrollIntoViewIfNeeded();
  await tap(stL);
  await page.waitForURL('**/extreme-weather/listening');
  await page.waitForSelector('.tu-play');
  const play = page.locator('.tu-play');
  await play.scrollIntoViewIfNeeded();
  await tap(play);
  await page.waitForTimeout(3000);
  const la = await page.evaluate(() => { const el = document.querySelector('audio[data-listening-player]'); return { t: el.currentTime, paused: el.paused, src: el.currentSrc }; });
  ok(la.t > 1.5 && !la.paused, `listening audio plays (t=${la.t.toFixed(2)})`);
  const pill1 = await page.locator('[data-speaker]').getAttribute('data-speaker');
  await page.evaluate(() => { document.querySelector('audio[data-listening-player]').currentTime = 30; });
  await page.waitForTimeout(900);
  const pill2 = await page.locator('[data-speaker]').getAttribute('data-speaker');
  await page.evaluate(() => { document.querySelector('audio[data-listening-player]').currentTime = 45; });
  await page.waitForTimeout(900);
  const pill3 = await page.locator('[data-speaker]').getAttribute('data-speaker');
  ok(pill2 === 'Layla' && pill3 === 'Noor', `speaker pill follows the clip (${pill1} → ${pill2} → ${pill3})`);
  const dock = await page.locator('.tu-player').boundingBox();
  const bar = await page.locator('.tour-bar').boundingBox();
  ok(dock.y > bar.y + bar.height, 'player never overlaps the TourBar');
  await shot('08-listening-playing');
  await tap(play);
  await tap(page.locator('.tu-transcript-toggle'));
  await page.waitForSelector('.tu-transcript .aw');
  const tw = page.locator('.tu-transcript .aw[data-w="sandstorm"]').first();
  await tw.scrollIntoViewIfNeeded();
  await tap(tw);
  await page.waitForTimeout(1000);
  a = await lastAudio(page);
  ok((await page.locator('.tu-wordpopup__meaning').textContent()).trim() && a && a.src.includes('sandstorm'), `transcript tap «sandstorm» → ${await page.locator('.tu-wordpopup__meaning').textContent()}`);
  await shot('09-listening-transcript');
  await page.keyboard.press('Escape');
  // hint replay
  await markCorrect(page, 'listening');
  const lcards = page.locator('.qx-card[data-accent="violet"]');
  ok((await lcards.count()) === 7, 'listening has 7 questions');
  const lh = lcards.nth(0).locator('.tu-hint-btn');
  await lh.scrollIntoViewIfNeeded();
  await tap(lh);
  const replay = lcards.nth(0).getByRole('button', { name: 'تشغيل هذا الجزء' });
  await tap(replay);
  await page.waitForTimeout(2200);
  const ha = await page.evaluate(() => { const el = document.querySelector('audio[data-hint-replay]'); return el ? { t: el.currentTime, paused: el.paused } : null; });
  ok(ha && ha.t > 4.5, `«تشغيل هذا الجزء» plays the hint span (t=${ha && ha.t.toFixed(2)})`);
  await shot('10-listening-hint');
  // submit with none → guide
  const ls = page.locator('.tu-submit');
  await ls.scrollIntoViewIfNeeded();
  await tap(ls);
  await page.waitForTimeout(700);
  ok(await page.locator('.tu-guide').isVisible(), 'submit before answering guides to the first question');
  for (let i = 0; i < 7; i++) {
    const c = lcards.nth(i);
    const opt = i === 2 ? c.locator('.qx-opt:not([data-test-correct="true"])').first() : c.locator('.qx-opt[data-test-correct="true"]');
    await opt.scrollIntoViewIfNeeded();
    await tap(opt);
  }
  await ls.scrollIntoViewIfNeeded();
  await tap(ls);
  await page.waitForSelector('.tu-confirm');
  await tap(page.locator('.tu-confirm').getByRole('button', { name: 'تسليم' }));
  await page.waitForSelector('.qx-verdict');
  ok((await page.locator('.tu-result').textContent()).includes('86%'), `listening score «${(await page.locator('.tu-result').textContent()).trim()}»`);
  const lwrong = page.locator('.qx-verdict[data-ok="false"]');
  await lwrong.scrollIntoViewIfNeeded();
  await shot('11-listening-verdict');
  // IELTS mode
  const ielts = page.getByRole('button', { name: /محاكاة IELTS/ });
  await ielts.scrollIntoViewIfNeeded();
  await tap(ielts);
  ok(await page.getByText('وضع الاستماع لمرة واحدة فقط').isVisible(), 'IELTS toggle shows its banner');
  ok(await page.getByRole('button', { name: 'رجوع 10 ثواني' }).isDisabled(), 'IELTS mode disables seeking');
  ok((await overflow(page)).bad.length === 0, `listening: no horizontal overflow ${JSON.stringify(await overflow(page))}`);

  // 5 · vocabulary
  const stV = page.locator('.tu-stations__item', { hasText: 'المفردات' });
  await stV.scrollIntoViewIfNeeded();
  await tap(stV);
  await page.waitForURL('**/extreme-weather/vocabulary');
  await page.waitForSelector('.tu-wordcard');
  ok((await page.locator('.tu-wordcard').count()) === 12, '12 word cards on the first page');
  await tap(page.locator('.tu-card-play').first());
  await page.waitForTimeout(1200);
  a = await lastAudio(page);
  ok(a && a.t > 0.05 && a.src.includes('/words/'), `card audio plays (${a && a.src.split('/').pop()})`);
  await shot('12-vocab-grid');
  const devast = page.locator('.tu-wordcard', { hasText: 'يدمّر' }).first();
  const target = (await devast.count()) ? devast : page.locator('.tu-wordcard').nth(1);
  await target.scrollIntoViewIfNeeded();
  await tap(target);
  await page.waitForSelector('.tu-wordsheet');
  await page.waitForTimeout(700);
  ok((await page.locator('.tu-wordsheet').textContent()).includes('التعريف'), 'card opens the word sheet');
  const sb = await page.locator('.tu-wordsheet header').boundingBox();
  const tb = await page.locator('.tour-bar').boundingBox();
  ok(sb.y >= tb.y + tb.height - 1, 'word sheet header is not under the TourBar');
  await tap(page.locator('.tu-sheet-play'));
  await page.waitForTimeout(1000);
  a = await lastAudio(page);
  ok(a && a.t > 0.05, 'sheet pronunciation plays');
  await tap(page.getByRole('button', { name: 'تدرّب على هذي الكلمة' }));
  ok(await page.locator('.tu-wordsheet .tu-popnote').isVisible(), 'sheet CTA answers with a note');
  await shot('13-vocab-sheet');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await tap(page.getByRole('button', { name: 'فلتر: أتقنتها' }));
  ok(await page.getByText('لا توجد كلمات تطابق الفلتر').isVisible(), 'filter «أتقنتها» → empty state');
  await tap(page.getByRole('button', { name: 'فلتر: الكل' }));
  await tap(page.getByRole('button', { name: 'ابحث عن كلمة' }));
  await page.locator('.tu-vocab-search').fill('storm');
  await page.waitForTimeout(400);
  const n = await page.locator('.tu-wordcard').count();
  ok(n >= 1 && n < 12, `search «storm» filters to ${n} cards`);
  await tap(page.getByRole('button', { name: 'ابحث عن كلمة' }));
  await tap(page.getByRole('button', { name: 'قائمة' }));
  ok((await page.locator('.tu-wordcard').count()) === 0 && (await page.getByRole('button', { name: 'استمع للكلمة' }).count()) >= 12, 'list view shows rows');
  await tap(page.getByRole('button', { name: 'بطاقات' }));
  const more = page.locator('.tu-more');
  await more.scrollIntoViewIfNeeded();
  await tap(more);
  ok((await page.locator('.tu-wordcard').count()) === 24, '«عرض المزيد» adds 12 cards');
  ok((await overflow(page)).bad.length === 0, `vocab: no horizontal overflow ${JSON.stringify(await overflow(page))}`);

  // back to overview from shell
  await page.evaluate(() => window.scrollTo(0, 0));
  const back = page.getByRole('button', { name: 'العودة للوحدة' });
  await back.scrollIntoViewIfNeeded();
  await tap(back);
  await page.waitForURL('**/tour/unit/extreme-weather');
  ok(true, '«العودة للوحدة» returns to the Spread');
  // station bar locked item → overview with note open
  await page.goto(`${BASE}/tour/unit/extreme-weather/listening`, { waitUntil: 'load' });
  await page.waitForSelector('.tu-stations');
  await tap(page.locator('.tu-stations__item', { hasText: 'الكتابة' }));
  await page.waitForSelector('#station-writing .tu-teaser');
  ok(true, 'locked station in the bar opens the Spread with its note');

  const errs = [...new Set(errors)].filter((e) => !/net::ERR_ABORTED|ERR_CACHE/.test(e));
  ok(errs.length === 0, `no console errors / 4xx (${errs.slice(0, 4).join(' | ')})`);
  await browser.close();
}

(async () => {
  const modes = which === 'both' ? ['desk', 'mob'] : [which];
  for (const m of modes) {
    try { await run(m); } catch (e) { fails++; console.log('  ✗ CRASH', e.message.split('\n')[0]); }
  }
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})();
