/**
 * «سُلّم الأفعال» tour room — snapshot the verbs and copy their audio.
 *
 *   node scripts/tour/verbs/snapshot.mjs          # verbs.json + mp3s
 *   node scripts/tour/verbs/snapshot.mjs --dry    # print, write nothing
 *
 * Read-only. `irregular_verbs` has a SELECT policy for `public`, so the public
 * anon key the site already ships (src/utils/supabase.js) is enough. The 20
 * families are authenticated-only; they come from families.sql instead.
 *
 * What is taken: the five demo-session specimens (go, sing, write, drink,
 * begin), `bring` (a sample «أفعال تتعثّر فيها» row), and the whole i-a-u family
 * for the atlas. Audio is the platform's own per-form clip (edge-tts
 * en-US-EmmaNeural), copied into public/tour/verbs so the tour never hotlinks
 * storage. No voice-clone audio exists on this surface.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DRY = process.argv.includes("--dry");
const URL_BASE = "https://nmjexpuycmqcxuxljier.supabase.co";
const SPECIMENS = ["go", "sing", "write", "drink", "begin", "bring"];
const FAMILY = "i-a-u";

const client = await readFile(join(ROOT, "src/utils/supabase.js"), "utf8");
const ANON = client.match(/SUPABASE_ANON\s*=\s*'([^']+)'/)?.[1];
if (!ANON) throw new Error("anon key not found in src/utils/supabase.js");

const cols = [
  "id", "base_form", "past_simple", "past_participle", "meaning_ar", "meaning_hint_ar",
  "example_past", "example_participle", "trap_note_ar", "pattern_group", "rhyme_family",
  "tier", "frequency_rank", "alt_past", "alt_participle", "audio_base_url", "audio_past_url", "audio_pp_url",
].join(",");
const q = new URLSearchParams({
  select: cols,
  is_active: "eq.true",
  or: `(base_form.in.(${SPECIMENS.join(",")}),rhyme_family.eq.${FAMILY})`,
  order: "frequency_rank",
});
const res = await fetch(`${URL_BASE}/rest/v1/irregular_verbs?${q}`, {
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
});
if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`);
const rows = await res.json();

// Storage URLs → the local copy. One clip per distinct spoken form, so
// `brought` serves both columns of `bring`.
const local = (u) => (u ? `/tour/verbs/audio/${u.split("/curriculum-audio/verbs/")[1]}` : null);
const clips = new Map();
const verbs = rows.map((r) => {
  for (const u of [r.audio_base_url, r.audio_past_url, r.audio_pp_url]) if (u) clips.set(local(u), u);
  return {
    ...r,
    alt_past: r.alt_past || [],
    alt_participle: r.alt_participle || [],
    audio_base_url: local(r.audio_base_url),
    audio_past_url: local(r.audio_past_url),
    audio_pp_url: local(r.audio_pp_url),
  };
});

const missing = SPECIMENS.filter((b) => !verbs.some((v) => v.base_form === b));
if (missing.length) throw new Error(`specimens missing: ${missing.join(", ")}`);
if (verbs.filter((v) => v.rhyme_family === FAMILY).length !== 8) throw new Error(`${FAMILY} is not 8 verbs`);

console.log(`${verbs.length} verbs, ${clips.size} clips`);
if (DRY) process.exit(0);

await writeFile(
  join(ROOT, "src/tour/rooms/verbs/data/verbs.json"),
  JSON.stringify({ snapshot_at: new Date().toISOString(), source: "irregular_verbs (anon REST, is_active)", verbs }, null, 2) + "\n"
);

let bytes = 0;
await mkdir(join(ROOT, "public/tour/verbs/audio"), { recursive: true });
for (const [path, remote] of clips) {
  const r = await fetch(remote);
  const type = r.headers.get("content-type") || "";
  if (!r.ok || !type.includes("audio")) throw new Error(`${remote}: ${r.status} ${type}`);
  const buf = Buffer.from(await r.arrayBuffer());
  bytes += buf.length;
  await writeFile(join(ROOT, "public", path), buf);
}
console.log(`audio: ${clips.size} files, ${bytes} bytes`);
