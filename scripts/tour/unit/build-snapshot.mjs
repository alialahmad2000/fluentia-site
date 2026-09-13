/**
 * build-snapshot — turn the raw unit snapshot into the tour room's data + media.
 *
 *   1. Run snapshot-unit.sql READ-ONLY (Supabase MCP execute_sql, or any
 *      privileged role: the anon key cannot read curriculum_*), and save the
 *      `tour_unit` object as scripts/tour/unit/raw-snapshot.json.
 *   2. node scripts/tour/unit/build-snapshot.mjs
 *
 * Writes src/tour/rooms/unit/data/unit.json and copies every image / clip the
 * room uses into public/tour/unit/ (images re-encoded to WebP with Pillow; word
 * clips copied byte-for-byte; the listening dialogue re-encoded at 64 kbps). Nothing is hot-linked from Supabase storage at runtime.
 *
 * Copy that production prints broken or feminine-only is replaced here by
 * reviewed, genderless Arabic (see COPY below); the platform itself is untouched.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, copyFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const RAW = join(ROOT, "scripts/tour/unit/raw-snapshot.json");
const OUT_JSON = join(ROOT, "src/tour/rooms/unit/data/unit.json");
const PUB = join(ROOT, "public/tour/unit");
const WEB = "/tour/unit";
const CACHE = process.env.TOUR_CACHE || join(tmpdir(), "fluentia-tour-unit-cache");
const STORAGE = "https://nmjexpuycmqcxuxljier.supabase.co/storage/v1/object/public/";

const raw = JSON.parse(readFileSync(RAW, "utf8"));
if (process.argv.includes("--clean")) rmSync(PUB, { recursive: true, force: true });
mkdirSync(CACHE, { recursive: true });
mkdirSync(PUB, { recursive: true });

// ── fetch with a local cache ───────────────────────────────────────────────
function fetchToCache(url) {
  if (!url.startsWith(STORAGE)) throw new Error("unexpected media host: " + url);
  const file = join(CACHE, url.slice(STORAGE.length).replace(/[^a-zA-Z0-9._-]/g, "_"));
  if (!existsSync(file) || statSync(file).size === 0) {
    execFileSync("curl", ["-sfL", "--retry", "3", "-o", file, url]);
  }
  return file;
}

// ── images: Pillow → WebP ──────────────────────────────────────────────────
const PY = `
import sys, json
from PIL import Image
jobs = json.loads(sys.argv[1])
for j in jobs:
    im = Image.open(j["src"]).convert("RGB")
    if j.get("crop"):
        im = im.crop(tuple(j["crop"]))
    if j.get("size"):
        im = im.resize(tuple(j["size"]), Image.LANCZOS)
    elif j.get("width") and im.width > j["width"]:
        h = round(im.height * j["width"] / im.width)
        im = im.resize((j["width"], h), Image.LANCZOS)
    im.save(j["out"], "WEBP", quality=j.get("q", 72), method=6)
`;
const imageJobs = [];
function image(url, name, opts = {}) {
  if (!url) return null;
  const out = join(PUB, name);
  mkdirSync(dirname(out), { recursive: true });
  imageJobs.push({ src: fetchToCache(url), out, ...opts });
  return `${WEB}/${name}`;
}

// ── audio: copy the platform's own mp3 ─────────────────────────────────────
const audioFiles = new Map(); // web path -> source url
function audio(url, name) {
  if (!url) return null;
  const web = `${WEB}/${name}`;
  audioFiles.set(web, url);
  return web;
}

// pronounceWord.normalize — MUST match src/tour/rooms/unit/lib/wordAudio.js
const normAudio = (w) =>
  String(w || "").toLowerCase().replace(/’/g, "'").trim().replace(/[^a-z'-]/g, "").replace(/^['-]+|['-]+$/g, "");
const fileSafe = (w) => w.toLowerCase().replace(/[^a-z0-9-]/g, "_");

// ── COPY: production text that must not reach visitors as-is ───────────────
// why_matters / outcomes: grammatical faults from a bulk rewrite («صوراً»،
// «ستعلّم كيف وصف»، «كتابة تقريراً») — rewritten, genderless, same content.
// activity_ribbons: feminine imperatives, and two that describe content the unit
// does not have (listening «مذيعاً» — the clip is a dialogue; grammar «الجمل
// السببية» — the unit teaches the present perfect).
const COPY = {
  why_matters:
    "حين تتوالى صور إعصارٍ اجتاح جزيرة، أو حريقٍ التهم غابات، يبرز سؤال: لماذا يزداد الأمر سوءاً؟ الطقس المتطرف ليس مصادفة، بل رسالة من الأرض. وهذه الوحدة تعلّمك وصف هذه الظواهر ومناقشة أسبابها بأسلوب علمي.",
  outcomes: [
    "وصف ظاهرة طقس متطرف وشرح أسبابها العلمية",
    "قراءة تقارير عن الكوارث الطبيعية واستيعاب بياناتها",
    "مناقشة العلاقة بين التغيّر المناخي والطقس المتطرف بالأدلة",
    "كتابة مقال قصير عن حادثة طقس متطرف وأثرها",
  ],
  activity_ribbons: {
    reading: "مقالان يُقرآن بعين علمية: موجات الحر والفيضانات، ثم عاصفة رملية قرب الرياض",
    vocabulary: "مصطلحات المناخ والكوارث الطبيعية، كل كلمة بمعناها ونطقها",
    grammar: "المضارع التام: الحديث عمّا حدث وما زال أثره قائماً الآن",
    listening: "حوار بين ليلى ونور عن عاصفة رملية قادمة وكيف غيّرت خططهما",
    speaking: "وصف تجربة شخصية مع طقس قاسٍ في المملكة",
    writing: "كتابة مقال قصير عن ظاهرة طقس متطرف وتأثيرها",
  },
};

// Words the snapshot's token pass skips (single letters) but the passage shows as
// tappable. Production answers these with «لا توجد ترجمة» or a live TTS call;
// the tour has no server, so they carry a meaning and a clip of their own.
const EXTRA_GLOSS = {
  a: "أداة تنكير: بمعنى «واحد» أو «أيّ»",
  i: "أنا",
  c: "درجة مئوية (Celsius)",
};

// ── build ──────────────────────────────────────────────────────────────────
const unitRaw = raw.unit;
const specimenCover = image(unitRaw.cover_image_url, "cover.webp", { width: 1024, q: 76 });
// Door: a 14:9 cut of the storm cover, focal point kept in the upper two-thirds.
image(unitRaw.cover_image_url, "door.webp", { crop: [40, 0, 936, 576], size: [1400, 900], q: 74 });

const level_units = raw.level_units.map((u) => ({
  id: u.id,
  unit_number: u.unit_number,
  theme_ar: u.theme_ar,
  theme_en: u.theme_en,
  estimated_minutes: u.estimated_minutes,
  cover_image_url:
    u.id === unitRaw.id ? specimenCover : image(u.cover_image_url, `covers/unit-${u.unit_number}.webp`, { width: 720, q: 66 }),
}));

const unitVocabAudio = new Map(); // normalized word -> this unit's own vocab clip

function slimIndex(index) {
  const out = {};
  for (const [k, row] of Object.entries(index || {})) {
    if (!row) continue;
    const r = { word: row.word, definition_ar: row.definition_ar || null, is_vocab: row.is_vocab === true };
    if (row.example_sentence && row.is_vocab) r.example_sentence = row.example_sentence;
    out[k] = r;
  }
  for (const [k, ar] of Object.entries(EXTRA_GLOSS)) if (!out[k]) out[k] = { word: k, definition_ar: ar, is_vocab: false };
  return out;
}

const strip = (s) => (typeof s === "string" ? s.replace(/\*/g, "") : s);

const readings = raw.readings.map((r) => {
  const L = r.reading_label.toLowerCase();
  const vocabulary = (r.vocabulary || []).map((v) => {
    const web = audio(v.audio_url, `audio/words/${fileSafe(v.word.trim())}.mp3`);
    if (!v.word.includes(" ")) unitVocabAudio.set(normAudio(v.word), web);
    return {
      id: v.id,
      word: v.word,
      part_of_speech: v.part_of_speech,
      pronunciation_ipa: v.pronunciation_ipa,
      definition_en: v.definition_en,
      definition_ar: v.definition_ar,
      example_sentence: v.example_sentence,
      tier: v.tier,
      audio_url: web,
      synonyms: v.synonyms || [],
      antonyms: v.antonyms || [],
      word_family: v.word_family || [],
    };
  });
  return {
    id: r.id,
    unit_id: unitRaw.id,
    reading_label: r.reading_label,
    title_en: r.title_en,
    title_ar: r.title_ar,
    before_read_image_url: image(r.before_read_image_url, `img/reading-${L}-hero.webp`, { width: 1024, q: 70 }),
    // Reading A's inline flood photo has black letterbox bars baked in (rows 0-38
    // and 553-575); production shows them inside its 16:10 frame. Cut off here.
    passage_image_urls: (r.passage_image_urls || []).map((u, i) =>
      image(u, `img/reading-${L}-inline-${i + 1}.webp`, { width: 1024, q: 70, ...(L === "a" && i === 0 ? { crop: [0, 40, 1024, 552] } : {}) })
    ),
    infographic_image_url: image(r.infographic_image_url, `img/reading-${L}-infographic.webp`, { width: 1024, q: 78 }),
    passage_content: r.passage_content,
    passage_word_count: r.passage_word_count,
    reading_skill_name_en: r.reading_skill_name_en,
    reading_skill_name_ar: r.reading_skill_name_ar,
    reading_skill_explanation: r.reading_skill_explanation,
    critical_thinking_prompt_en: r.critical_thinking_prompt_en,
    critical_thinking_prompt_ar: r.critical_thinking_prompt_ar,
    vocabulary,
    // question_en carries raw *markers* on two B questions («what does
    // '*turbulence*' mean?») that production prints verbatim; stripped here.
    questions: (r.questions || []).map((q) => ({
      id: q.id,
      reading_id: q.reading_id,
      question_type: q.question_type,
      question_en: strip(q.question_en),
      question_ar: q.question_ar,
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation_en: q.explanation_en,
      explanation_ar: q.explanation_ar,
      hint: q.hint,
      wrong_notes: q.wrong_notes,
    })),
    word_index: slimIndex(r.word_index),
  };
});

const lr = raw.listening[0];
const listening = {
  id: lr.id,
  unit_id: unitRaw.id,
  title_en: lr.title_en,
  title_ar: lr.title_ar,
  audio_type: lr.audio_type,
  audio_url: audio(lr.audio_url, "audio/listening-dialogue.mp3"),
  audio_duration_seconds: lr.audio_duration_seconds,
  image_url: image(lr.image_url, "img/listening-hero.webp", { width: 1024, q: 70 }),
  transcript: lr.transcript,
  // start_ms is filled in below from the clip's own silences (the DB has none,
  // which is why production's speaker pill never leaves the last speaker).
  speaker_segments: lr.speaker_segments.map((s) => ({ order: s.order, speaker: s.speaker, text: s.text, char_count: s.char_count })),
  exercises: [...lr.exercises].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  word_index: slimIndex(lr.word_index),
};

// Tap-word pronunciation: this unit's vocab clip first, then the snapshot's.
const word_audio = {};
for (const [w, url] of Object.entries(raw.word_audio)) {
  word_audio[w] = unitVocabAudio.get(w) || audio(url, `audio/words/${fileSafe(w)}.mp3`);
}

// ── write media ─────────────────────────────────────────────────────────────
mkdirSync(join(PUB, "audio/words"), { recursive: true });

const urls = [...new Set(audioFiles.values())];
console.log(`fetching ${urls.length} audio files + ${imageJobs.length} images …`);
const DIALOGUE_WEB = listening.audio_url;
for (const [web, url] of audioFiles) {
  const dest = join(PUB, web.slice(WEB.length + 1));
  if (existsSync(dest)) continue;
  if (web === DIALOGUE_WEB) {
    // The 2-minute dialogue ships at 128 kbps mono (1.97 MB). Speech holds up at
    // 64 kbps mono, which halves it and keeps the room inside its 9 MB budget.
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", fetchToCache(url), "-ac", "1", "-b:a", "64k", dest]);
  } else {
    copyFileSync(fetchToCache(url), dest);
  }
}

// «I» and «C» have no clip on the platform (production synthesises them per tap).
// Same generator as scripts/generate-reading-word-audio.mjs in fluentia-lms:
// edge-tts en-GB-RyanNeural, silence-trimmed, mono 24 kHz 48 kbps.
const FILTER =
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse," +
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,apad=pad_dur=0.08";
for (const w of Object.keys(EXTRA_GLOSS)) {
  if (word_audio[w]) continue;
  const dest = join(PUB, `audio/words/${fileSafe(w)}.mp3`);
  let platformClip = null;
  try { platformClip = fetchToCache(`${STORAGE}curriculum-audio/word-tts/${w}.mp3`); } catch { /* none on the platform */ }
  if (platformClip) copyFileSync(platformClip, dest);
  else if (!existsSync(dest)) {
    const tmp = join(CACHE, `tts-${w}.mp3`);
    execFileSync("python3", ["-m", "edge_tts", "--voice", "en-GB-RyanNeural", "--text", w.toUpperCase(), "--write-media", tmp]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-af", FILTER, "-ac", "1", "-ar", "24000", "-b:a", "48k", dest]);
  }
  word_audio[w] = `${WEB}/audio/words/${fileSafe(w)}.mp3`;
}

execFileSync("python3", ["-c", PY, JSON.stringify(imageJobs)], { stdio: "inherit" });

// ── speaker timings from the dialogue's own pauses ─────────────────────────
const dialogue = join(PUB, "audio/listening-dialogue.mp3");
// ffmpeg reports silencedetect on stderr, so fold it into stdout.
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${dialogue}" -af silencedetect=noise=-40dB:d=0.35 -f null - 2>&1`], {
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
});
// Turn changes are the long pauses (~0.75 s); pauses inside a turn run shorter.
const silences = [];
for (const m of log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)) {
  if (+m[2] - +m[1] >= 0.55) silences.push([+m[1], +m[2]]);
}
const segs = listening.speaker_segments;
const totalChars = segs.reduce((n, s) => n + s.char_count, 0);
const durS = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", dialogue], { encoding: "utf8" });
const secPerChar = durS / totalChars;
// Each turn's expected start = previous turn's start + its length in characters at
// the clip's speaking rate, snapped to the nearest long pause after it.
segs.forEach((s, i) => {
  if (i === 0) { s.start_ms = 0; return; }
  const prev = segs[i - 1].start_ms / 1000;
  const est = prev + segs[i - 1].char_count * secPerChar;
  let best = null;
  for (const [a, b] of silences) {
    const mid = (a + b) / 2;
    if (mid <= prev + 0.5) continue;
    if (best === null || Math.abs(mid - est) < Math.abs(best - est)) best = mid;
  }
  s.start_ms = Math.round(1000 * (best !== null && Math.abs(best - est) < 4 ? best : est));
});
console.log("speaker turns (s):", segs.map((s) => (s.start_ms / 1000).toFixed(1)).join(" "));

// ── data ───────────────────────────────────────────────────────────────────
const data = {
  snapshot_at: raw.snapshot_at,
  source: { unit_id: unitRaw.id, reading_ids: raw.readings.map((r) => r.id), listening_id: lr.id },
  level: raw.level,
  level_units,
  unit: {
    id: unitRaw.id,
    unit_number: unitRaw.unit_number,
    theme_ar: unitRaw.theme_ar,
    theme_en: unitRaw.theme_en,
    description_ar: unitRaw.description_ar,
    cover_image_url: specimenCover,
    estimated_minutes: unitRaw.estimated_minutes,
    why_matters: COPY.why_matters,
    outcomes: COPY.outcomes,
    activity_ribbons: COPY.activity_ribbons,
  },
  readings,
  listening,
  word_audio,
};
mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(data));

// ── report ─────────────────────────────────────────────────────────────────
function du(dir) {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) n += e.isDirectory() ? du(join(dir, e.name)) : statSync(join(dir, e.name)).size;
  return n;
}
const kb = (b) => `${(b / 1024).toFixed(0)} KB`;
console.log(`data/unit.json ${kb(statSync(OUT_JSON).size)}`);
console.log(`public/tour/unit ${kb(du(PUB))} (words ${kb(du(join(PUB, "audio/words")))}, ${readdirSync(join(PUB, "audio/words")).length} clips)`);
