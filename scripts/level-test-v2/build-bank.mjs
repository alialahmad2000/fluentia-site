#!/usr/bin/env node
// Level test v2 — turn the authoring bank (bank.source.json: scripts, rationales,
// tags, review notes) into the lean client bank the page lazy-loads.
//
//   node scripts/level-test-v2/validate.mjs scripts/level-test-v2/bank.source.json
//   node scripts/level-test-v2/build-bank.mjs
//
// Clip scripts never reach the client (they would give the answers away);
// the client only knows a clip's id, level and the Arabic situation line.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(fs.readFileSync(path.join(here, 'bank.source.json'), 'utf8'));
const out = path.join(here, '../../src/pages/level-test-v2/bank.v2.json');

const dropped = new Set(src.dropped || []);
const items = src.items.filter((i) => !dropped.has(i.id));
const usedP = new Set(items.map((i) => i.passage_id).filter(Boolean));
const usedC = new Set(items.map((i) => i.clip_id).filter(Boolean));

const lean = {
  version: src.version,
  passages: src.passages.filter((p) => usedP.has(p.id)).map(({ id, lvl, genre, title, text }) => ({ id, lvl, genre, title, text })),
  clips: src.clips.filter((c) => usedC.has(c.id)).map(({ id, lvl, kind, situation_ar }) => ({ id, lvl, kind, situation_ar })),
  items: items.map(({ id, lvl, skill, subskill, difficulty, stem, options, answer, passage_id, clip_id }) => ({
    id, lvl, skill, subskill, difficulty, stem, options, answer,
    ...(passage_id ? { passage_id } : {}),
    ...(clip_id ? { clip_id } : {}),
  })),
};
fs.writeFileSync(out, JSON.stringify(lean));
console.log(`wrote ${path.relative(process.cwd(), out)} · ${lean.items.length} items · ${lean.passages.length} passages · ${lean.clips.length} clips · ${(fs.statSync(out).size / 1024).toFixed(1)} kB`);
