/**
 * Word pronunciation for the tour — stands in for fluentia-lms
 * lib/audio/pronounceWord.js (tap a word → its clip) and
 * lib/audio/wordAudioGate.js (vocab listen buttons, one clip at a time).
 *
 * The platform resolves a word's clip at runtime (vocab row → word-tts file →
 * edge-function synthesis → Web Speech). The tour resolves it at build time:
 * data/unit.json carries word → /tour/unit/audio/words/<word>.mp3, copied from
 * the platform's own files, so there is no network call beyond a static mp3.
 *
 * Kept from the platform: normalize() byte-for-byte, the blob-primed clip (iOS
 * Safari plays an in-memory blob inside the tap far more reliably than a fresh
 * URL), and "each tap cancels the previous word".
 */
import data from "../data/unit.json";

const WORD_AUDIO = data.word_audio;

export function normalize(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .toLowerCase()
    .replace(/’/g, "'")
    .trim()
    .replace(/[^a-z'-]/g, "")
    .replace(/^['-]+|['-]+$/g, "");
}

export const wordAudioUrl = (word) => WORD_AUDIO[normalize(word)] || null;

const blobCache = new Map(); // url → blob: URL
const inFlight = new Map();
let liveAudio = null;

function prime(url) {
  if (!url || blobCache.has(url)) return Promise.resolve(blobCache.get(url) || null);
  if (inFlight.has(url)) return inFlight.get(url);
  const p = fetch(url)
    .then((r) => (r.ok ? r.blob() : null))
    .then((b) => {
      if (!b) return null;
      const u = URL.createObjectURL(b);
      blobCache.set(url, u);
      return u;
    })
    .catch(() => null)
    .finally(() => inFlight.delete(url));
  inFlight.set(url, p);
  return p;
}

/** Warm the clips for a passage's words, a few at a time (idle, capped). */
export function prewarmWords(words, cap = 120) {
  const urls = [...new Set(words.map(wordAudioUrl).filter(Boolean))].slice(0, cap);
  let i = 0;
  const pump = () => {
    if (i >= urls.length) return;
    const batch = urls.slice(i, i + 4);
    i += 4;
    Promise.all(batch.map(prime)).then(() => setTimeout(pump, 60));
  };
  pump();
}

/**
 * Play a tapped word. Resolves { ok, source } like pronounceWord.
 * play() is called synchronously inside the gesture; the blob is used when it
 * is already primed, the static URL otherwise.
 */
export function pronounceWord(word) {
  const url = wordAudioUrl(word);
  if (liveAudio) {
    try { liveAudio.pause(); } catch { /* noop */ }
    liveAudio = null;
  }
  if (!url) return Promise.resolve({ ok: false, reason: "no_clip" });
  const a = new Audio(blobCache.get(url) || url);
  a.playsInline = true;
  liveAudio = a;
  prime(url);
  return a
    .play()
    .then(() => ({ ok: true, source: "curriculum" }))
    .catch((e) => ({ ok: false, reason: e?.name || "play_failed" }));
}

// ── wordAudioGate.playWordAudioOnce (verbatim behaviour) ────────────────────
let gateAudio = null;
let busy = false;
let safety = null;

export function stopWordAudio() {
  if (safety) { clearTimeout(safety); safety = null; }
  if (gateAudio) { try { gateAudio.pause(); } catch { /* noop */ } gateAudio = null; }
  busy = false;
}

export function playWordAudioOnce(url, { onStart, onEnd, onError } = {}) {
  if (!url) return false;
  if (busy) return false;
  let a;
  try {
    a = new Audio(blobCache.get(url) || url);
    a.playsInline = true;
  } catch {
    return false;
  }
  gateAudio = a;
  busy = true;
  const done = () => {
    if (safety) { clearTimeout(safety); safety = null; }
    if (gateAudio === a) gateAudio = null;
    if (busy) { busy = false; try { onEnd?.(); } catch { /* noop */ } }
  };
  const fail = () => { try { onError?.(); } catch { /* noop */ } done(); };
  a.addEventListener("playing", () => { try { onStart?.(); } catch { /* noop */ } }, { once: true });
  a.addEventListener("ended", done, { once: true });
  a.addEventListener("error", fail, { once: true });
  safety = setTimeout(done, 15000);
  a.play().catch(() => fail());
  return true;
}
