#!/usr/bin/env node
// Validate one or more bank part files against SPEC.md. Prints OK or the errors.
import fs from 'node:fs';

const CEFR = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
const BAND = [[0, 0.16], [0.17, 0.33], [0.34, 0.5], [0.51, 0.66], [0.67, 0.83], [0.84, 1]];
const CLIP_MAX = [90, 120, 190, 270, 350, 430];
const SKILLS = ['grammar', 'vocab', 'reading', 'use', 'listening'];
const VOICES = ['us_male', 'us_female', 'uk_male', 'uk_female', 'au_male', 'in_female'];
const FORBIDDEN = ['معهد', 'دورة', 'دورات', 'مذهل', 'مميز', 'استثنائي', 'الأفضل', 'حبيبتي', 'كلاس تجريبي'];
const ARABIC = /[؀-ۿ]/;

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: validate.mjs file.json [...]'); process.exit(2); }

const errs = [];
const warn = [];
const ids = new Set();
const all = { passages: [], clips: [], items: [] };
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { errs.push(`${f}: invalid JSON — ${e.message}`); continue; }
  for (const k of ['passages', 'clips', 'items']) {
    if (!Array.isArray(j[k])) { errs.push(`${f}: missing array ${k}`); continue; }
    all[k].push(...j[k]);
  }
}

const dup = (id) => { if (ids.has(id)) errs.push(`duplicate id ${id}`); ids.add(id); };
const lvlOk = (o) => {
  if (!Number.isInteger(o.lvl) || o.lvl < 0 || o.lvl > 5) return errs.push(`${o.id}: bad lvl`);
  if (CEFR[o.lvl] !== o.cefr) errs.push(`${o.id}: cefr ${o.cefr} ≠ lvl ${o.lvl}`);
};

const passages = new Map();
for (const p of all.passages) {
  dup(p.id); lvlOk(p);
  if (!p.text || p.text.length < 20) errs.push(`${p.id}: passage text too short`);
  if (ARABIC.test(p.text)) errs.push(`${p.id}: Arabic in passage`);
  passages.set(p.id, p);
}
const clips = new Map();
let clipChars = 0;
for (const c of all.clips) {
  dup(c.id); lvlOk(c);
  if (!Array.isArray(c.script) || !c.script.length) { errs.push(`${c.id}: empty script`); continue; }
  const sp = new Set((c.speakers || []).map((s) => s.id));
  if (sp.size < 1 || sp.size > 2) errs.push(`${c.id}: needs 1–2 speakers`);
  for (const s of c.speakers || []) if (!VOICES.includes(s.voice)) errs.push(`${c.id}: bad voice ${s.voice}`);
  let n = 0;
  for (const line of c.script) {
    if (!sp.has(line.speaker)) errs.push(`${c.id}: unknown speaker ${line.speaker}`);
    if (ARABIC.test(line.text)) errs.push(`${c.id}: Arabic in script`);
    n += (line.text || '').length;
  }
  c._chars = n; clipChars += n;
  if (n > CLIP_MAX[c.lvl]) errs.push(`${c.id}: ${n} chars > ${CLIP_MAX[c.lvl]} budget`);
  if (!c.situation_ar || !ARABIC.test(c.situation_ar)) errs.push(`${c.id}: situation_ar missing`);
  clips.set(c.id, c);
}

const usedP = new Set(); const usedC = new Set();
const keyPos = [0, 0, 0, 0];
let longestKey = 0;
for (const it of all.items) {
  dup(it.id); lvlOk(it);
  if (!SKILLS.includes(it.skill)) errs.push(`${it.id}: bad skill`);
  if (!it.subskill || !/^[a-z0-9_]+$/.test(it.subskill)) errs.push(`${it.id}: subskill must be snake_case`);
  if (typeof it.difficulty !== 'number') errs.push(`${it.id}: difficulty missing`);
  else {
    const [lo, hi] = BAND[it.lvl] || [0, 1];
    if (it.difficulty < lo - 1e-9 || it.difficulty > hi + 1e-9) errs.push(`${it.id}: difficulty ${it.difficulty} outside ${it.cefr} band ${lo}–${hi}`);
  }
  if (!it.stem || ARABIC.test(it.stem)) errs.push(`${it.id}: stem missing or Arabic in stem`);
  if (/(in arabic|mean\?|means:)/i.test(it.stem || '')) errs.push(`${it.id}: looks like a translation/definition item`);
  if ((it.stem || '').split('___').length > 2) errs.push(`${it.id}: more than one gap`);
  if (!Array.isArray(it.options) || it.options.length !== 4) errs.push(`${it.id}: needs 4 options`);
  else {
    const norm = it.options.map((o) => String(o).trim().toLowerCase());
    if (new Set(norm).size !== 4) errs.push(`${it.id}: duplicate options`);
    if (it.options.some((o) => ARABIC.test(o))) errs.push(`${it.id}: Arabic in options`);
    if (it.options.some((o) => /all of the above|none of the above/i.test(o))) errs.push(`${it.id}: all/none of the above`);
    if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer > 3) errs.push(`${it.id}: bad answer index`);
    else {
      keyPos[it.answer]++;
      const lens = it.options.map((o) => String(o).length);
      if (lens[it.answer] === Math.max(...lens) && lens.filter((l) => l === lens[it.answer]).length === 1) longestKey++;
    }
  }
  if (!it.rationale_ar || !ARABIC.test(it.rationale_ar)) errs.push(`${it.id}: rationale_ar missing`);
  for (const w of FORBIDDEN) if ((it.rationale_ar || '').includes(w)) errs.push(`${it.id}: forbidden word «${w}»`);
  if (!Array.isArray(it.tags)) errs.push(`${it.id}: tags must be an array`);
  if (it.skill === 'reading') {
    if (!passages.has(it.passage_id)) errs.push(`${it.id}: passage_id ${it.passage_id} not found`);
    else usedP.add(it.passage_id);
  } else if (it.passage_id) errs.push(`${it.id}: passage_id on a non-reading item`);
  if (it.skill === 'listening') {
    if (!clips.has(it.clip_id)) errs.push(`${it.id}: clip_id ${it.clip_id} not found`);
    else usedC.add(it.clip_id);
  } else if (it.clip_id) errs.push(`${it.id}: clip_id on a non-listening item`);
}
for (const id of passages.keys()) if (!usedP.has(id)) errs.push(`passage ${id} has no items`);
for (const id of clips.keys()) if (!usedC.has(id)) errs.push(`clip ${id} has no items`);
for (const c of all.clips) for (const s of c.situation_ar ? FORBIDDEN : []) if (c.situation_ar.includes(s)) errs.push(`${c.id}: forbidden word «${s}»`);

// Counts
const table = {};
for (const it of all.items) {
  table[it.cefr] ??= { grammar: 0, vocab: 0, reading: 0, use: 0, listening: 0, total: 0 };
  table[it.cefr][it.skill]++; table[it.cefr].total++;
}
console.table(CEFR.filter((c) => table[c]).map((c) => ({ cefr: c, ...table[c] })));
const clipsBy = CEFR.map((c) => all.clips.filter((x) => x.cefr === c).length);
console.log('items', all.items.length, '· passages', all.passages.length, '· clips', all.clips.length, clipsBy.join('/'), '· listening chars', clipChars);
console.log('key position spread', keyPos.join('/'), `· key is the unique longest option in ${longestKey}/${all.items.length}`);
if (longestKey / Math.max(1, all.items.length) > 0.4) warn.push('the key is the longest option too often (>40%) — shorten keys or lengthen distractors');
for (const w of warn) console.log('WARN', w);
if (errs.length) { console.log(errs.length, 'ERRORS'); for (const e of errs) console.log(' -', e); process.exit(1); }
console.log('OK');
