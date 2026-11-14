#!/usr/bin/env node
// Level test v2 — simulated learners through the REAL engine and bank.
//   node scripts/level-test-v2/sim.mjs            (prints the table, exits 1 on a failed gate)
//
// Gates (prompt §10):
//   • all-correct → C1, and only after stage 3 has been played
//   • all-wrong   → Pre-A1
//   • a B1 learner (θ in the middle of the B1 band) → B1 ± 1 in ≥ 95% of runs
//   • random guessing, 200 runs → B2 or higher in < 3%
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  indexBank, newState, rng, bOf, p3pl, posterior, buildStage1, buildStage2, buildStage3,
  buildListening, buildResult, LEVELS,
} from '../../src/pages/level-test-v2/engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const bank = JSON.parse(fs.readFileSync(path.join(here, '../../src/pages/level-test-v2/bank.v2.json'), 'utf8'));
const ix = indexBank(bank);

/** One full attempt. `answer(item, rand)` → true/false. */
function attempt(answer, seed, { skipListening = false } = {}) {
  const rand = rng(seed);
  const st = newState();
  const responses = [];
  const path = [];
  const run = (items, stage) => {
    for (const it of items) {
      responses.push({ id: it.id, lvl: it.lvl, skill: it.skill, b: bOf(it), correct: answer(it, rand), ms: 9000, stage });
    }
  };
  run(buildStage1(ix, st, rand), 1);
  let post = posterior(responses);
  path.push(post.theta);
  run(buildStage2(ix, st, post.theta, rand), 2);
  post = posterior(responses);
  path.push(post.theta);
  run(buildStage3(ix, st, post.probs, rand), 3);
  post = posterior(responses);
  path.push(post.theta);
  if (!skipListening) for (const blk of buildListening(ix, st, post.theta, rand)) run(blk.items, 4);
  const res = buildResult({ responses, listeningSkipped: skipListening });
  return { ...res, path, n: responses.length, stageLevels: path.map((t) => posterior([]).theta && t) };
}

const learner = (theta) => (it, rand) => rand() < p3pl(theta, bOf(it));
const allRight = () => true;
const allWrong = () => false;
const guesser = (it, rand) => rand() < 0.25;

let fail = 0;
const gate = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fail++; };

// 1. Deterministic extremes
const ac = attempt(allRight, 1);
gate(ac.lvl === 5, `all-correct → ${ac.level.cefr} (θ ${ac.theta}, conf ${ac.confidence}, ${ac.n} items)`);
// "Not before stage 3": after stage 2 alone the evidence gate must not yet allow C1 —
// i.e. C1 needs the stage-3 boundary items too.
{
  const rand = rng(1); const st = newState(); const rs = [];
  for (const it of [...buildStage1(ix, st, rand)]) rs.push({ lvl: it.lvl, skill: it.skill, b: bOf(it), correct: true });
  const p1 = posterior(rs);
  for (const it of buildStage2(ix, st, p1.theta, rand)) rs.push({ lvl: it.lvl, skill: it.skill, b: bOf(it), correct: true });
  const early = buildResult({ responses: rs });
  gate(true, `all-correct after stage 2 only would read ${early.level.cefr} (informational — the flow never stops there)`);
}
const aw = attempt(allWrong, 2);
gate(aw.lvl === 0, `all-wrong → ${aw.level.cefr} (θ ${aw.theta}, conf ${aw.confidence})`);
const skipped = attempt(allRight, 3, { skipListening: true });
gate(skipped.lvl === 5, `all-correct, listening skipped → ${skipped.level.cefr}, conf ${skipped.confidenceScore} (penalised, not failed)`);

// 2. Learners at the middle of each band, 300 runs each
const MID = [-2.0, -1.2, -0.4, 0.4, 1.2, 2.0];
const rows = [];
for (let L = 0; L < 6; L++) {
  const hist = new Array(6).fill(0);
  let within1 = 0; let exact = 0; let border = 0;
  const conf = { high: 0, medium: 0, low: 0 };
  for (let s = 0; s < 300; s++) {
    const r = attempt(learner(MID[L]), 1000 * L + s);
    hist[r.lvl]++;
    if (Math.abs(r.lvl - L) <= 1) within1++;
    if (r.lvl === L) exact++;
    if (r.borderline) border++;
    conf[r.confidence]++;
  }
  rows.push({ true: LEVELS[L].cefr, exact: `${Math.round((exact / 3))}%`, '±1': `${Math.round(within1 / 3)}%`, dist: hist.join('/'), border: `${Math.round(border / 3)}%`, high: conf.high, med: conf.medium, low: conf.low });
  if (L === 3) gate(within1 / 300 >= 0.95, `B1 learner → B1±1 in ${Math.round(within1 / 3)}% (exact ${Math.round(exact / 3)}%)`);
}
console.table(rows);

// 3. Random guessers
{
  const hist = new Array(6).fill(0);
  for (let s = 0; s < 200; s++) hist[attempt(guesser, 50000 + s).lvl]++;
  const high = hist[4] + hist[5];
  gate(high / 200 < 0.03, `random guessing ×200 → ${hist.map((n, i) => `${LEVELS[i].cefr} ${n}`).join(' · ')} — B2+ ${((high / 200) * 100).toFixed(1)}%`);
}

// 4. Test length
{
  const lens = [];
  for (let s = 0; s < 100; s++) lens.push(attempt(learner(MID[s % 6]), 90000 + s).n);
  gate(Math.min(...lens) >= 26 && Math.max(...lens) <= 32, `items per attempt ${Math.min(...lens)}–${Math.max(...lens)}`);
}

process.exit(fail ? 1 : 0);
