/* ============================================================================
 * Fluentia — Level Test engine
 * ----------------------------------------------------------------------------
 * A three-stage adaptive test (MST) with an IRT ability estimate.
 *
 *   Stage 1  ROUTING       8 items spread across A1→B2
 *   Stage 2  TARGETED      9 items centred on the provisional ability, one of
 *                          them a reading passage at that level
 *   Stage 3  CONFIRMATION  5 items straddling the nearest level boundary —
 *                          this is what separates "about B1" from "B1, not A2"
 *   Listening              4 items near the estimated level (skippable)
 *   Writing                1 prompt, banded — captured as evidence, not graded
 *
 * Ability is estimated with a 3-parameter logistic model. The third parameter
 * matters more than anything else here: with four options, pure guessing earns
 * 25%, and a scorer that ignores that will hand a beginner a B1.
 * ========================================================================== */

import { ITEMS, LISTENING, WRITING, PASSAGE_SETS } from './bank.js';

/* ─── Scale ──────────────────────────────────────────────────────────────── */

/** Ability/difficulty anchor for each level on the shared θ scale. */
const LEVEL_B = [-2.0, -1.2, -0.4, 0.4, 1.2, 2.0];
/** Boundaries between levels — the midpoints of the anchors above. */
const CUTS = [-1.6, -0.8, 0.0, 0.8, 1.6];

const A = 1.4;   // discrimination
const C = 0.25;  // guessing floor — 4 options
const PRIOR_SD = 2.6;

/** IRT difficulty of an item: level anchor, nudged by within-level difficulty. */
export const bOf = (item) => LEVEL_B[item.lvl] + 0.3 * (item.d || 0);

const p3pl = (theta, b) => C + (1 - C) / (1 + Math.exp(-A * (theta - b)));

export const LEVELS = [
  { i: 0, code: 'L0', cefr: 'Pre-A1', ar: 'ما قبل الخطوة الأولى', track: 'التأسيس' },
  { i: 1, code: 'L1', cefr: 'A1', ar: 'الخطوة الأولى', track: 'التأسيس' },
  { i: 2, code: 'L2', cefr: 'A2', ar: 'بداية الثقة', track: 'التأسيس' },
  { i: 3, code: 'L3', cefr: 'B1', ar: 'صار يتكلم', track: 'التطوير' },
  { i: 4, code: 'L4', cefr: 'B2', ar: 'ثقة كاملة', track: 'التطوير' },
  { i: 5, code: 'L5', cefr: 'C1', ar: 'جاهز للعالم', track: 'التطوير المتقدم' },
];

export const SKILL_AR = {
  grammar: 'القواعد',
  vocab: 'المفردات',
  reading: 'الاستيعاب',
  use: 'التواصل',
  listening: 'الاستماع',
};

/* ─── Random helpers ─────────────────────────────────────────────────────── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Prepare an item for display: options are shuffled here and ONLY here, and the
 * new index of the correct answer travels with the served item. Nothing
 * downstream may assume the answer is first — that assumption is exactly the
 * bug that once let "always tap A" score C1 on the in-app placement test.
 */
export function serve(item) {
  const order = shuffle(item.opts.map((text, idx) => ({ text, wasCorrect: idx === 0 })));
  return {
    ...item,
    options: order.map((o) => o.text),
    correctIndex: order.findIndex((o) => o.wasCorrect),
  };
}

/* ─── Ability estimation ─────────────────────────────────────────────────── */

const GRID = (() => {
  const g = [];
  for (let t = -3.5; t <= 3.5001; t += 0.01) g.push(Math.round(t * 100) / 100);
  return g;
})();

/**
 * Full posterior over ability, plus the probability that the student belongs to
 * each of the six levels.
 *
 * A single number ("θ = 0.31") hides how much is actually known after 26 items.
 * Integrating the posterior over each level band instead gives something both
 * more honest and more useful: "B1 68%, A2 24%" tells the placement
 * conversation exactly where the doubt is.
 *
 * @param {Array<{b:number, correct:boolean}>} responses
 */
export function posterior(responses) {
  const logs = GRID.map((theta) => {
    let ll = -((theta * theta) / (2 * PRIOR_SD * PRIOR_SD)); // log prior N(0, PRIOR_SD²)
    for (const r of responses) {
      const p = p3pl(theta, r.b);
      ll += r.correct ? Math.log(p) : Math.log(1 - p);
    }
    return ll;
  });

  const max = Math.max(...logs);
  const w = logs.map((l) => Math.exp(l - max));
  const total = w.reduce((a, b) => a + b, 0);
  const dens = w.map((x) => x / total);

  // EAP point estimate + posterior SD (steadier than MLE at the extremes,
  // where an all-correct pattern has no maximum at all).
  const theta = GRID.reduce((s, t, i) => s + t * dens[i], 0);
  const varTheta = GRID.reduce((s, t, i) => s + dens[i] * (t - theta) ** 2, 0);

  const levelProbs = new Array(6).fill(0);
  GRID.forEach((t, i) => { levelProbs[bandOf(t)] += dens[i]; });

  return {
    theta: Math.round(theta * 100) / 100,
    se: Math.sqrt(varTheta),
    levelProbs,
  };
}

/** Backwards-compatible point estimate used for routing between stages. */
export function estimateTheta(responses) {
  if (!responses.length) return { theta: 0, se: PRIOR_SD };
  const { theta, se } = posterior(responses);
  return { theta, se };
}

/** θ → level band index (0–5). */
export function bandOf(theta) {
  let lvl = 0;
  for (let i = 0; i < CUTS.length; i++) if (theta >= CUTS[i]) lvl = i + 1;
  return lvl;
}

/** Kept as the routing helper's name throughout the stage builders. */
export const levelOf = bandOf;

/* ─── Item selection ─────────────────────────────────────────────────────── */

const singles = ITEMS.filter((i) => !i.passageId);
const passageItemsById = PASSAGE_SETS.reduce((acc, set) => {
  acc[set.id] = ITEMS.filter((i) => i.passageId === set.id);
  return acc;
}, {});

/**
 * Pick `count` unused single items, preferring the requested levels in order
 * and spreading skills so a student is never asked six grammar gaps in a row.
 */
function pick({ levels, count, used, skills = null, theta = null }) {
  const out = [];
  const skillTally = {};
  const pool = shuffle(
    singles.filter(
      (i) => levels.includes(i.lvl) && !used.has(i.id) && (!skills || skills.includes(i.skill))
    )
  );
  // Round-robin across skills, then — once a level is being targeted — take the
  // item whose difficulty sits closest to the current estimate. An item pitched
  // at the student's own level carries far more information than an easy one.
  while (out.length < count && pool.length) {
    pool.sort((x, y) => {
      const bySkill = (skillTally[x.skill] || 0) - (skillTally[y.skill] || 0);
      if (bySkill !== 0) return bySkill;
      if (theta == null) return 0;
      return Math.abs(bOf(x) - theta) - Math.abs(bOf(y) - theta);
    });
    const next = pool.shift();
    skillTally[next.skill] = (skillTally[next.skill] || 0) + 1;
    used.add(next.id);
    out.push(next);
  }
  return out;
}

const clampLvl = (n) => Math.max(0, Math.min(5, n));

/** Stage 1 — a fixed ladder from A1 to B2: two items at each level. */
export function buildStage1(used) {
  const block = [];
  for (const lvl of [1, 2, 3, 4]) block.push(...pick({ levels: [lvl], count: 2, used }));
  return block;
}

/** Stage 2 — a reading passage at the target level plus targeted single items. */
export function buildStage2(theta, used) {
  const target = levelOf(theta);
  const set = PASSAGE_SETS.reduce((best, s) =>
    Math.abs(s.lvl - target) < Math.abs(best.lvl - target) ? s : best
  );
  const passageItems = passageItemsById[set.id] || [];
  passageItems.forEach((i) => used.add(i.id));

  const remaining = Math.max(0, 9 - passageItems.length);
  const near = pick({ levels: [target], count: Math.ceil(remaining * 0.6), used, theta });
  const spread = pick({
    levels: [clampLvl(target - 1), clampLvl(target + 1)],
    count: remaining - near.length,
    used,
    theta,
  });
  const fill = pick({
    levels: [0, 1, 2, 3, 4, 5],
    count: remaining - near.length - spread.length,
    used,
    theta,
  });

  // Passage first (it is the heaviest block; better read while fresh)
  return [...passageItems, ...shuffle([...near, ...spread, ...fill])];
}

/**
 * Stage 3 — confirmation. Aim items straight at the nearest level boundary:
 * the only question still open at this point is which side of it the student
 * belongs on.
 */
export function buildStage3(theta, used) {
  const cut = CUTS.reduce((best, c) => (Math.abs(c - theta) < Math.abs(best - theta) ? c : best));
  const below = clampLvl(CUTS.indexOf(cut));
  const above = clampLvl(below + 1);
  const a = pick({ levels: [below], count: 3, used, theta: cut });
  const b = pick({ levels: [above], count: 5 - a.length, used, theta: cut });
  const fill = pick({
    levels: [clampLvl(below - 1), clampLvl(above + 1)],
    count: 5 - a.length - b.length,
    used,
    theta: cut,
  });
  return shuffle([...a, ...b, ...fill]);
}

/** Listening — the four items closest to the estimated level. */
export function buildListening(theta) {
  const target = levelOf(theta);
  return shuffle(
    [...LISTENING]
      .sort((x, y) => Math.abs(x.lvl - target) - Math.abs(y.lvl - target))
      .slice(0, 4)
  );
}

/** Writing — one banded prompt. */
export function writingPrompt(theta) {
  const lvl = levelOf(theta);
  return WRITING.find((w) => lvl <= w.maxLvl) || WRITING[WRITING.length - 1];
}

/* ─── Skill profile ──────────────────────────────────────────────────────── */

/**
 * A skill is strong or weak RELATIVE TO the student's own ability, not in
 * absolute percentage terms. Reading items are harder than vocabulary items at
 * every level, so a raw percentage would label almost everyone "weak reader".
 * We compare what they actually scored against what the model expected them to
 * score on those exact items.
 */
export function skillProfile(responses, theta) {
  const by = {};
  for (const r of responses) {
    if (!by[r.skill]) by[r.skill] = { correct: 0, total: 0, expected: 0 };
    by[r.skill].total += 1;
    by[r.skill].correct += r.correct ? 1 : 0;
    by[r.skill].expected += p3pl(theta, r.b);
  }
  return Object.entries(by)
    .map(([skill, s]) => {
      const pct = Math.round((s.correct / s.total) * 100);
      const delta = (s.correct - s.expected) / s.total; // >0 = above own level
      return {
        skill,
        ar: SKILL_AR[skill] || skill,
        correct: s.correct,
        total: s.total,
        pct,
        delta: Math.round(delta * 100) / 100,
        verdict: delta >= 0.14 ? 'strong' : delta <= -0.14 ? 'weak' : 'even',
      };
    })
    .sort((x, y) => y.delta - x.delta);
}

/* ─── Writing signals (evidence, never a grade) ──────────────────────────── */

const SUBORDINATORS = /\b(because|although|though|while|whereas|which|that|if|when|since|so that|in order to|however|therefore)\b/gi;

export function writingSignals(text) {
  const clean = (text || '').trim();
  if (!clean) return null;
  const words = clean.split(/\s+/).filter(Boolean);
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''))).size;
  const flags = [];
  if (/(^|\s)i(\s|$|')/.test(clean)) flags.push('«i» صغيرة بدل «I»');
  if (sentences.length && !/^[A-Z]/.test(sentences[0])) flags.push('بداية الجملة بحرف صغير');
  if (!/[.!?]$/.test(clean)) flags.push('بدون علامة ترقيم في النهاية');
  const arabicChars = (clean.match(/[؀-ۿ]/g) || []).length;
  if (arabicChars > 3) flags.push('استخدم العربية داخل الإجابة');
  return {
    words: words.length,
    sentences: sentences.length,
    avgSentence: sentences.length ? Math.round((words.length / sentences.length) * 10) / 10 : 0,
    variety: words.length ? Math.round((unique / words.length) * 100) : 0,
    linkers: (clean.match(SUBORDINATORS) || []).length,
    flags,
  };
}

/* ─── Final report ───────────────────────────────────────────────────────── */

/**
 * @param {object} args
 * @param {Array} args.responses  {id, skill, b, correct, lvl, ms}
 * @param {string} args.writing   raw text (may be empty)
 * @param {boolean} args.listeningDone
 * @param {number} args.leftPage  times the tab lost focus mid-exam
 */
export function buildReport({ responses, writing, listeningDone, leftPage = 0, elapsedMs = 0 }) {
  const { theta, se, levelProbs } = posterior(responses);

  // Classify by the most probable band rather than by where the point estimate
  // happens to land — when the posterior straddles a boundary these disagree,
  // and the probability mass is the better answer.
  const ranked = levelProbs
    .map((p, i) => ({ i, p }))
    .sort((x, y) => y.p - x.p);
  const lvl = ranked[0].i;
  const level = LEVELS[lvl];
  const runnerUp = ranked[1];

  // "Borderline" only means something if it is rare. It fires when the second
  // most likely level still holds a quarter of the probability mass.
  const borderline = runnerUp.p >= 0.25;
  const alt = borderline ? LEVELS[runnerUp.i] : null;

  const topP = ranked[0].p;
  const confidence = topP >= 0.55 ? 'high' : topP >= 0.38 ? 'medium' : 'low';
  const confidenceAr = { high: 'عالية', medium: 'متوسطة', low: 'مبدئية' }[confidence];

  const skills = skillProfile(responses, theta);
  const strong = skills.filter((s) => s.verdict === 'strong');
  const weak = skills.filter((s) => s.verdict === 'weak');

  return {
    theta,
    se: Math.round(se * 100) / 100,
    level,
    lvlIndex: lvl,
    levelProbs: levelProbs.map((p) => Math.round(p * 100)),
    topProb: Math.round(topP * 100),
    altProb: Math.round(runnerUp.p * 100),
    borderline,
    alt,
    confidence,
    confidenceAr,
    skills,
    strong,
    weak,
    correct: responses.filter((r) => r.correct).length,
    total: responses.length,
    pct: responses.length ? Math.round((responses.filter((r) => r.correct).length / responses.length) * 100) : 0,
    listeningDone,
    writing: (writing || '').trim(),
    writingSignals: writingSignals(writing),
    leftPage,
    minutes: Math.max(1, Math.round(elapsedMs / 60000)),
  };
}
