/**
 * Renders the level-test listening clips to real audio files.
 *
 * Why not just use the Web Speech API at runtime: it isn't installed on every
 * device (some Android builds ship no English voice at all), the voice differs
 * per device, and speaking-rate differences change how hard an item is — which
 * quietly changes the score. A fixed recording makes the listening section the
 * same test for everyone. Web Speech stays as the fallback.
 *
 * Uses the macOS `say` voices (free, offline) + lame. Re-run after editing any
 * `say` text in bank.js:
 *   node scripts/build-level-test-audio.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LISTENING } from '../src/pages/level-test/bank.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/audio/level-test');
const TMP = join(ROOT, '.audio-tmp');

/* Accent widens as the level rises — understanding an unfamiliar accent is
 * part of what separates B2 listening from A2 listening. */
const VOICE_BY_LEVEL = [
  { voice: 'Samantha', rate: 150 }, // L0
  { voice: 'Samantha', rate: 155 }, // L1
  { voice: 'Samantha', rate: 165 }, // L2
  { voice: 'Daniel', rate: 170 },   // L3 — UK
  { voice: 'Daniel', rate: 180 },   // L4
  { voice: 'Karen', rate: 185 },    // L5 — AU
];

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

function render(id, text, { voice, rate }) {
  const aiff = join(TMP, `${id}.aiff`);
  const mp3 = join(OUT, `${id}.mp3`);
  // Plain AIFF: passing --data-format alongside an .aiff path makes `say` fail
  // with "Opening output file failed: fmt?". lame reads AIFF directly.
  execFileSync('say', ['-v', voice, '-r', String(rate), '-o', aiff, text]);
  // 64 kbps mono is transparent for speech and keeps the whole set under a MB.
  execFileSync('lame', ['--quiet', '-m', 'm', '-b', '64', '--resample', '22.05', aiff, mp3]);
  return mp3;
}

console.log(`Rendering ${LISTENING.length} listening clips + 1 sound check…\n`);

let total = 0;
for (const item of LISTENING) {
  const cfg = VOICE_BY_LEVEL[item.lvl] || VOICE_BY_LEVEL[2];
  const mp3 = render(item.id, item.say, cfg);
  const kb = Math.round(statSync(mp3).size / 1024);
  total += kb;
  console.log(`  ${item.id.padEnd(10)} L${item.lvl}  ${cfg.voice.padEnd(9)} ${String(kb).padStart(3)} kB  "${item.say.slice(0, 52)}…"`);
}

const check = render(
  'check',
  'Sound check. If you can hear this sentence clearly, you are ready to begin.',
  { voice: 'Samantha', rate: 160 }
);
total += Math.round(statSync(check).size / 1024);
console.log(`  ${'check'.padEnd(10)} --  Samantha  ${String(Math.round(statSync(check).size / 1024)).padStart(3)} kB  (sound check)`);

rmSync(TMP, { recursive: true, force: true });

console.log(`\n✅ ${readdirSync(OUT).length} files in public/audio/level-test — ${total} kB total`);
if (!existsSync(join(OUT, 'check.mp3'))) throw new Error('sound-check clip missing');
