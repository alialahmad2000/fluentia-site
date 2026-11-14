#!/usr/bin/env node
// Level test v2 — voice the 24 listening clips with ElevenLabs.
//   ELEVENLABS_API_KEY=… node scripts/level-test-v2/build-audio.mjs [--force]
// Each turn is synthesised once (cached by voice+text in .cache/), turns are
// joined with a short pause, and the clip is written MONO (ffmpeg -ac 1) to
// public/audio/level-test-v2/<clip>.mp3. Existing clips are skipped.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(fs.readFileSync(path.join(here, 'bank.source.json'), 'utf8'));
const outDir = path.join(here, '../../public/audio/level-test-v2');
const cache = path.join(here, '.cache');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }
const force = process.argv.includes('--force');

// Premade voices on the account. There is no Indian-English voice, so
// in_female falls back to a second American female (noted in SPEC.md).
const VOICES = {
  us_male: 'iP95p4xoKVk53GoZ742B',   // Chris
  us_female: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  uk_male: 'JBFqnCBsd6RMkjVDRZzb',   // George
  uk_female: 'Xb7hH8MSUJpSbSDYk0k2', // Alice
  au_male: 'IKne3meq5aSn9XLyUdCD',   // Charlie
  in_female: 'XrExE9yKIg1WjnnlVkGX', // Matilda (fallback)
};
// Slower, steadier delivery for the lower levels.
const settingsFor = (lvl) => ({ stability: 0.55, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true, speed: lvl <= 1 ? 0.88 : lvl <= 3 ? 0.95 : 1.0 });

async function tts(voice, text, lvl) {
  const id = VOICES[voice];
  if (!id) throw new Error(`unknown voice ${voice}`);
  const h = crypto.createHash('sha1').update(`${id}|${lvl <= 1 ? 's' : lvl <= 3 ? 'm' : 'n'}|${text}`).digest('hex').slice(0, 16);
  const f = path.join(cache, `${h}.mp3`);
  if (fs.existsSync(f)) return f;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: settingsFor(lvl) }),
    });
    if (r.ok) { fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); return f; }
    const msg = await r.text();
    if (attempt === 3 || r.status === 401 || r.status === 422) throw new Error(`${r.status} ${msg.slice(0, 200)}`);
    await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
}

let chars = 0;
for (const clip of src.clips) {
  const out = path.join(outDir, `${clip.id}.mp3`);
  if (!force && fs.existsSync(out)) { console.log(`skip ${clip.id}`); continue; }
  const vOf = Object.fromEntries((clip.speakers || []).map((s) => [s.id, s.voice]));
  const parts = [];
  for (const turn of clip.script) {
    chars += turn.text.length;
    parts.push(await tts(vOf[turn.speaker] || clip.speakers[0].voice, turn.text, clip.lvl));
  }
  // concat with a 0.45 s pause between turns, 0.3 s lead-in, then mono 64 kbps
  const inputs = []; const filt = [];
  inputs.push('-f', 'lavfi', '-t', '0.3', '-i', 'anullsrc=r=44100:cl=mono');
  parts.forEach((p, i) => {
    inputs.push('-i', p);
    if (i < parts.length - 1) inputs.push('-f', 'lavfi', '-t', '0.45', '-i', 'anullsrc=r=44100:cl=mono');
  });
  const n = inputs.filter((x) => x === '-i').length;
  for (let i = 0; i < n; i++) filt.push(`[${i}:a]aresample=44100,aformat=channel_layouts=mono[a${i}]`);
  filt.push(`${Array.from({ length: n }, (_, i) => `[a${i}]`).join('')}concat=n=${n}:v=0:a=1,loudnorm=I=-16:TP=-1.5[out]`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt.join(';'), '-map', '[out]', '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
  console.log(`wrote ${clip.id} (${parts.length} turns)`);
}
console.log(`characters this run (incl. cached): ${chars}`);
