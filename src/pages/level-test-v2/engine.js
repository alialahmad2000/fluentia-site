/* ============================================================================
 * Fluentia Level Test v2 — adaptive engine (pure: no DOM, runs in Node for the
 * simulation harness in scripts/level-test-sim.mjs).
 * ----------------------------------------------------------------------------
 * Multistage design, ~10–12 minutes:
 *
 *   Stage 1  ROUTING   6 single items, A1 → B2, mixed skills
 *   Stage 2  CORE      11 items at the estimate ±1 (one reading text inside)
 *   Stage 3  BOUNDARY  5 items aimed at the border between the two most
 *                      likely levels
 *   Listening          4 clips at the estimate, 1–2 questions each (skippable)
 *
 * Scoring is a 3-parameter logistic IRT model with an EAP estimate. The
 * guessing floor (c = 0.25 with four options) is what stops a beginner who
 * taps at random from walking out with B1. On top of the model sits a plain
 * consistency rule (`evidenceGate`): a level is only awarded when the learner
 * actually answered items AT that level correctly often enough. A run of lucky
 * guesses on hard items moves the estimate, but cannot buy the level alone.
 * ========================================================================== */

/* ─── Scale ──────────────────────────────────────────────────────────────── */

/** θ range of each level band (Pre-A1 … C1). */
export const BAND_LO = [-2.4, -1.6, -0.8, 0.0, 0.8, 1.6];
export const BAND_HI = [-1.6, -0.8, 0.0, 0.8, 1.6, 2.4];
export const CUTS = [-1.6, -0.8, 0.0, 0.8, 1.6];
/** The bank's global 0–1 difficulty bands, per SPEC.md. */
const DIFF_LO = [0.0, 0.17, 0.34, 0.51, 0.67, 0.84];
const DIFF_HI = [0.16, 0.33, 0.5, 0.66, 0.83, 1.0];

const A = 1.5;     // discrimination
const C = 0.25;    // guessing floor (4 options)
const PRIOR_MEAN = -0.2;
const PRIOR_SD = 1.6;

export const LEVELS = [
  { i: 0, code: 'L0', cefr: 'Pre-A1', ar: 'ما قبل الخطوة الأولى', track: 'التأسيس' },
  { i: 1, code: 'L1', cefr: 'A1', ar: 'الخطوة الأولى', track: 'التأسيس' },
  { i: 2, code: 'L2', cefr: 'A2', ar: 'بداية الثقة', track: 'التأسيس' },
  { i: 3, code: 'L3', cefr: 'B1', ar: 'صار يتكلم', track: 'التطوير' },
  { i: 4, code: 'L4', cefr: 'B2', ar: 'ثقة كاملة', track: 'التطوير' },
  { i: 5, code: 'L5', cefr: 'C1', ar: 'جاهز للعالم', track: 'التطوير المتقدم' },
];

export const SKILLS = ['grammar', 'vocab', 'reading', 'use', 'listening'];
export const SKILL_AR = {
  grammar: 'القواعد',
  vocab: 'المفردات',
  reading: 'القراءة',
  use: 'التواصل',
  listening: 'الاستماع',
};

/**
 * IRT difficulty of an item. The writer's 0–1 estimate places it inside its
 * level band; we keep it away from the band edges (estimates are noisy) so an
 * item tagged B1 always behaves like a B1 item.
 */
export function bOf(item) {
  const L = item.lvl;
  const span = DIFF_HI[L] - DIFF_LO[L];
  const pos = Math.min(1, Math.max(0, ((item.difficulty ?? (DIFF_LO[L] + span / 2)) - DIFF_LO[L]) / span));
  return BAND_LO[L] + 0.2 + pos * 0.4;
}

export const p3pl = (theta, b) => C + (1 - C) / (1 + Math.exp(-A * (theta - b)));

/* ─── Randomness (seedable, so the simulator is reproducible) ────────────── */

export function rng(seed) {
  if (seed == null) return Math.random;
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Bank index ─────────────────────────────────────────────────────────── */

/** Build lookup tables once per bank. */
export function indexBank(bank) {
  const passages = new Map(bank.passages.map((p) => [p.id, p]));
  const clips = new Map(bank.clips.map((c) => [c.id, c]));
  const items = new Map(bank.items.map((i) => [i.id, i]));
  const byPassage = new Map();
  const byClip = new Map();
  for (const it of bank.items) {
    if (it.passage_id) byPassage.set(it.passage_id, [...(byPassage.get(it.passage_id) || []), it]);
    if (it.clip_id) byClip.set(it.clip_id, [...(byClip.get(it.clip_id) || []), it]);
  }
  const singles = bank.items.filter((i) => !i.passage_id && !i.clip_id);
  return { version: bank.version, passages, clips, items, byPassage, byClip, singles };
}

/**
 * The served form of an item: options shuffled here, and only here. The
 * correct index travels with the served item, so nothing downstream can
 * assume the key sits in a fixed position.
 */
export function serve(item, rand = Math.random) {
  const order = shuffle(item.options.map((text, idx) => ({ text, idx })), rand);
  return {
    id: item.id,
    lvl: item.lvl,
    skill: item.skill,
    stem: item.stem,
    passage_id: item.passage_id || null,
    clip_id: item.clip_id || null,
    options: order.map((o) => o.text),
    correctIndex: order.findIndex((o) => o.idx === item.answer),
  };
}

/* ─── Posterior ──────────────────────────────────────────────────────────── */

const GRID = (() => {
  const g = [];
  for (let t = -3.6; t <= 3.6001; t += 0.02) g.push(Math.round(t * 100) / 100);
  return g;
})();

export function bandOf(theta) {
  let lvl = 0;
  for (let i = 0; i < CUTS.length; i++) if (theta >= CUTS[i]) lvl = i + 1;
  return lvl;
}

/** @param {Array<{b:number, correct:boolean}>} responses */
export function posterior(responses) {
  const logs = GRID.map((t) => {
    let ll = -((t - PRIOR_MEAN) ** 2) / (2 * PRIOR_SD * PRIOR_SD);
    for (const r of responses) {
      const p = p3pl(t, r.b);
      ll += r.correct ? Math.log(p) : Math.log(1 - p);
    }
    return ll;
  });
  const max = Math.max(...logs);
  const w = logs.map((l) => Math.exp(l - max));
  const total = w.reduce((a, b) => a + b, 0);
  const dens = w.map((x) => x / total);
  const theta = GRID.reduce((s, t, i) => s + t * dens[i], 0);
  const v = GRID.reduce((s, t, i) => s + dens[i] * (t - theta) ** 2, 0);
  const probs = new Array(6).fill(0);
  GRID.forEach((t, i) => { probs[bandOf(t)] += dens[i]; });
  return { theta, se: Math.sqrt(v), probs };
}

/* ─── Item selection ─────────────────────────────────────────────────────── */

const clamp = (n) => Math.max(0, Math.min(5, n));

/**
 * Pick `count` unused singles from `levels`, skills spread round-robin, the
 * item nearest the target difficulty first, unseen-before items preferred.
 */
function pick(ix, st, { levels, count, target = null, skills = null, rand }) {
  const out = [];
  const tally = { ...st.skillTally };
  const pool = shuffle(
    ix.singles.filter((i) => levels.includes(i.lvl) && !st.used.has(i.id) && (!skills || skills.includes(i.skill))),
    rand
  );
  while (out.length < count && pool.length) {
    pool.sort((x, y) => {
      const seen = (st.seen.has(x.id) ? 1 : 0) - (st.seen.has(y.id) ? 1 : 0);
      if (seen) return seen;
      const s = (tally[x.skill] || 0) - (tally[y.skill] || 0);
      if (s) return s;
      if (target == null) return 0;
      return Math.abs(bOf(x) - target) - Math.abs(bOf(y) - target);
    });
    const next = pool.shift();
    tally[next.skill] = (tally[next.skill] || 0) + 1;
    st.used.add(next.id);
    out.push(next);
  }
  st.skillTally = tally;
  return out;
}

function pickPassage(ix, st, lvl, rand) {
  const cands = shuffle([...ix.passages.values()], rand)
    .filter((p) => !st.used.has(p.id) && (ix.byPassage.get(p.id) || []).length)
    .sort((x, y) => {
      const seen = (st.seen.has(x.id) ? 1 : 0) - (st.seen.has(y.id) ? 1 : 0);
      return seen || Math.abs(x.lvl - lvl) - Math.abs(y.lvl - lvl);
    });
  const p = cands[0];
  if (!p) return [];
  st.used.add(p.id);
  const items = (ix.byPassage.get(p.id) || []).slice(0, 3);
  items.forEach((i) => st.used.add(i.id));
  st.skillTally.reading = (st.skillTally.reading || 0) + items.length;
  return items;
}

/** Fresh state for one attempt. `seen` = item ids from earlier attempts on this device. */
export function newState(seen = []) {
  return { used: new Set(), seen: new Set(seen), skillTally: {} };
}

/** Stage 1 — routing ladder: A1, A2, A2, B1, B1, B2 — one skill each where possible. */
export function buildStage1(ix, st, rand = Math.random) {
  const ladder = [1, 2, 2, 3, 3, 4];
  const out = [];
  for (const lvl of ladder) out.push(...pick(ix, st, { levels: [lvl], count: 1, skills: ['grammar', 'vocab', 'use'], rand }));
  return out;
}

/** Stage 2 — one reading text at the estimate, then singles at the estimate ±1. */
export function buildStage2(ix, st, theta, rand = Math.random) {
  const target = bandOf(theta);
  const reading = pickPassage(ix, st, target, rand);
  const remaining = 11 - reading.length;
  const nearN = Math.round(remaining * 0.55);
  const near = pick(ix, st, { levels: [target], count: nearN, target: theta, skills: ['grammar', 'vocab', 'use'], rand });
  const around = pick(ix, st, {
    levels: [clamp(target - 1), clamp(target + 1)].filter((v, i, a) => a.indexOf(v) === i),
    count: remaining - near.length,
    target: theta,
    skills: ['grammar', 'vocab', 'use'],
    rand,
  });
  const fill = pick(ix, st, { levels: [0, 1, 2, 3, 4, 5], count: remaining - near.length - around.length, target: theta, rand });
  return [...reading, ...shuffle([...near, ...around, ...fill], rand)];
}

/** The two most likely ADJACENT levels — the border stage 3 has to settle. */
export function borderOf(probs) {
  let best = 0;
  let pair = [0, 1];
  for (let i = 0; i < 5; i++) {
    const m = probs[i] + probs[i + 1];
    if (m > best) { best = m; pair = [i, i + 1]; }
  }
  return pair;
}

/** Stage 3 — boundary probe: items from both sides of the most likely border. */
export function buildStage3(ix, st, probs, rand = Math.random) {
  const [lo, hi] = borderOf(probs);
  const cut = CUTS[lo];
  const a = pick(ix, st, { levels: [hi], count: 3, target: cut + 0.3, rand });
  const b = pick(ix, st, { levels: [lo], count: 5 - a.length, target: cut - 0.3, rand });
  const fill = pick(ix, st, { levels: [clamp(lo - 1), clamp(hi + 1)], count: 5 - a.length - b.length, target: cut, rand });
  return shuffle([...a, ...b, ...fill], rand);
}

/** Listening — four clips nearest the estimate (two at it, one either side). */
export function buildListening(ix, st, theta, rand = Math.random) {
  const target = bandOf(theta);
  const wants = [target, target, clamp(target - 1), clamp(target + 1)];
  const clips = [];
  const pool = shuffle([...ix.clips.values()], rand).filter((c) => (ix.byClip.get(c.id) || []).length);
  for (const lvl of wants) {
    const cand = pool
      .filter((c) => !clips.includes(c))
      .sort((x, y) => {
        const seen = (st.seen.has(x.id) ? 1 : 0) - (st.seen.has(y.id) ? 1 : 0);
        return seen || Math.abs(x.lvl - lvl) - Math.abs(y.lvl - lvl);
      })[0];
    if (cand) clips.push(cand);
  }
  const blocks = clips
    .sort((x, y) => x.lvl - y.lvl)
    .map((c) => ({ clip: c, items: (ix.byClip.get(c.id) || []).slice(0, 2) }));
  blocks.forEach((b) => { st.used.add(b.clip.id); b.items.forEach((i) => st.used.add(i.id)); });
  return blocks;
}

/* ─── Evidence gate ──────────────────────────────────────────────────────── */

/**
 * The model can be talked up by a lucky streak; this rule cannot. Level L is
 * awarded only if the learner answered enough items AT level L correctly:
 * at least 3 of them seen and ≥ 45% right (someone sitting at the very bottom
 * of the band gets ~52% of its items; a guesser gets 25%). When fewer than 3
 * items at L were served, the items at L and L+1 are pooled. Otherwise step
 * down until it holds. Pre-A1 needs no evidence — it is the floor.
 */
const GATE_RATE = 0.45;
export function evidenceGate(responses, lvl) {
  let L = lvl;
  while (L > 0) {
    let pool = responses.filter((r) => r.lvl === L);
    if (pool.length < 3) pool = responses.filter((r) => r.lvl === L || r.lvl === L + 1);
    const right = pool.filter((r) => r.correct).length;
    if (pool.length >= 3 && right / pool.length >= GATE_RATE) break;
    L -= 1;
  }
  return L;
}

/* ─── Integrity (quiet) ──────────────────────────────────────────────────── */

/**
 * Very fast answers and leaving the tab do not accuse anyone — they lower the
 * confidence the result is shown with, and the trainer sees why.
 */
export function integrityOf(responses, { tabSwitches = 0 } = {}) {
  const timed = responses.filter((r) => Number.isFinite(r.ms));
  const fast = timed.filter((r) => r.ms < (r.skill === 'reading' || r.skill === 'listening' ? 3500 : 2200)).length;
  const fastShare = timed.length ? fast / timed.length : 0;
  let penalty = 0;
  if (fastShare > 0.3) penalty += 0.15;
  else if (fastShare > 0.15) penalty += 0.07;
  if (tabSwitches > 4) penalty += 0.12;
  else if (tabSwitches > 1) penalty += 0.05;
  return { fast, fastShare: Math.round(fastShare * 100) / 100, tabSwitches, penalty };
}

/* ─── Skill profile ──────────────────────────────────────────────────────── */

/**
 * Strong/weak RELATIVE to the learner's own ability: observed minus what the
 * model expected on those exact items. Reading items run harder than
 * vocabulary at every level; raw percentages would call nearly everyone a
 * weak reader.
 */
export function skillProfile(responses, theta) {
  const by = {};
  for (const r of responses) {
    by[r.skill] ??= { correct: 0, total: 0, expected: 0 };
    by[r.skill].total += 1;
    by[r.skill].correct += r.correct ? 1 : 0;
    by[r.skill].expected += p3pl(theta, r.b);
  }
  return SKILLS.filter((s) => by[s]).map((skill) => {
    const s = by[skill];
    const delta = (s.correct - s.expected) / s.total;
    // A 0–100 "relative strength" for the bars: 50 = exactly at their level.
    const rel = Math.round(Math.max(6, Math.min(100, 50 + delta * 140)));
    return {
      skill,
      ar: SKILL_AR[skill],
      correct: s.correct,
      total: s.total,
      pct: Math.round((s.correct / s.total) * 100),
      delta: Math.round(delta * 100) / 100,
      rel,
      verdict: s.total < 2 ? 'even' : delta >= 0.13 ? 'strong' : delta <= -0.13 ? 'weak' : 'even',
    };
  });
}

/* ─── Writing signals (evidence for the trainer, never a grade) ──────────── */

const LINKERS = /\b(because|although|though|while|whereas|which|that|if|when|since|so that|in order to|however|therefore|but|so)\b/gi;

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
  if ((clean.match(/[؀-ۿ]/g) || []).length > 3) flags.push('كتب بالعربي داخل الإجابة');
  return {
    words: words.length,
    sentences: sentences.length,
    avgSentence: sentences.length ? Math.round((words.length / sentences.length) * 10) / 10 : 0,
    variety: words.length ? Math.round((unique / words.length) * 100) : 0,
    linkers: (clean.match(LINKERS) || []).length,
    flags,
  };
}

/* ─── Final result ───────────────────────────────────────────────────────── */

/**
 * @param {object} a
 * @param {Array<{id,lvl,skill,b,correct,ms}>} a.responses
 * @param {boolean} a.listeningSkipped
 * @param {number} a.tabSwitches
 */
export function buildResult({ responses, listeningSkipped = false, tabSwitches = 0 }) {
  const { theta, se, probs } = posterior(responses);
  const ranked = probs.map((p, i) => ({ i, p })).sort((x, y) => y.p - x.p);
  const irtLevel = ranked[0].i;
  const lvl = evidenceGate(responses, irtLevel);
  const gated = lvl < irtLevel;

  // Confidence: posterior mass on the awarded band, then quietly reduced for
  // integrity signals and for a skipped listening block.
  const integrity = integrityOf(responses, { tabSwitches });
  let conf = probs[lvl];
  if (gated) conf = Math.min(conf, 0.45); // the model and the evidence disagreed
  conf -= integrity.penalty;
  if (listeningSkipped) conf -= 0.05;
  conf = Math.max(0.05, Math.min(0.99, conf));

  // Border: the stronger NEIGHBOUR of the awarded level still holds ≥ 30%
  // (or the model wanted one level higher than the evidence allowed).
  const up = lvl < 5 ? probs[lvl + 1] : 0;
  const down = lvl > 0 ? probs[lvl - 1] : 0;
  const gatedUp = gated && irtLevel === lvl + 1;
  const borderline = gatedUp || Math.max(up, down) >= 0.3;
  const altIdx = gatedUp || up >= down ? lvl + 1 : lvl - 1;
  const alt = borderline ? LEVELS[altIdx] : null;
  const altP = altIdx > lvl ? up : down;
  // A border result is never shown as "high" confidence — the two would contradict.
  const confidence = conf >= 0.6 && !borderline ? 'high' : conf >= 0.4 ? 'medium' : 'low';

  const correct = responses.filter((r) => r.correct).length;
  return {
    theta: Math.round(theta * 100) / 100,
    se: Math.round(se * 100) / 100,
    lvl,
    irtLevel,
    gated,
    level: LEVELS[lvl],
    probs: probs.map((p) => Math.round(p * 1000) / 10),
    confidenceScore: Math.round(conf * 100) / 100,
    confidence,
    borderline,
    alt,
    altProb: Math.round(altP * 100),
    skills: skillProfile(responses, theta),
    correct,
    total: responses.length,
    pct: responses.length ? Math.round((correct / responses.length) * 100) : 0,
    listeningSkipped,
    integrity,
  };
}

/** Writing prompts by band (40–80 words), shown after the scored part. */
export const WRITING = [
  { maxLvl: 1, en: 'Write about yourself: your name, your job or studies, where you live, and what you do on a normal day.', ar: 'اكتب عن نفسك: اسمك، شغلك أو دراستك، وين تسكن، ويومك العادي.', arF: "اكتبي عن نفسك: اسمك، شغلك أو دراستك، وين تسكنين، ويومك العادي." },
  { maxLvl: 2, en: 'Write a short message to a colleague. You can’t come to tomorrow’s meeting. Say why, and suggest another time.', ar: 'اكتب رسالة قصيرة لزميل: ما تقدر تحضر اجتماع بكرة، قل السبب واقترح وقت ثاني.', arF: "اكتبي رسالة قصيرة لزميلتك: ما تقدرين تحضرين اجتماع بكرة، قولي السبب واقترحي وقت ثاني." },
  { maxLvl: 3, en: 'Describe a problem you had at work or in daily life, what you did about it, and what you learned.', ar: 'اوصف مشكلة واجهتها في الشغل أو الحياة، وش سويت، ووش تعلمت منها.', arF: "اوصفي مشكلة واجهتك في الشغل أو الحياة، وش سوّيتي، ووش تعلّمتي منها." },
  { maxLvl: 4, en: 'Some companies let staff work from home two days a week. Is this a good idea? Give your opinion with reasons.', ar: 'بعض الشركات تسمح بالعمل من البيت يومين بالأسبوع. وش رأيك؟ اذكر أسبابك.', arF: "بعض الشركات تسمح بالعمل من البيت يومين بالأسبوع. وش رأيك؟ اذكري أسبابك." },
  { maxLvl: 5, en: 'Write to your manager proposing one change that would make your team more effective. Explain the benefit and a possible risk.', ar: 'اكتب لمديرك تقترح تغيير واحد يخلي فريقك أكثر فاعلية، ووضّح الفايدة وخطر محتمل.', arF: "اكتبي لمديرك تقترحين تغيير واحد يخلي فريقك أكثر فاعلية، ووضّحي الفايدة وخطر محتمل." },
];

export function writingPromptFor(lvl) {
  return WRITING.find((w) => lvl <= w.maxLvl) || WRITING[WRITING.length - 1];
}
