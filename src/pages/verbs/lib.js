/**
 * Browser-only helpers for /verbs: storage that never throws, the one shared
 * audio player, and search normalisation. Nothing here runs during the
 * prerender — every caller is an event handler or an effect.
 */

/* ── storage ─────────────────────────────────────────────────────────────────
   Private windows, blocked site data and in-app browsers can all make
   localStorage throw or vanish. Every read falls back to `fallback`; every
   write is best-effort. The page works the same without it, it just forgets. */

export const KEYS = {
  mastered: "fl-verbs-mastered",
  best: "fl-verbs-quiz-best",
  barDismissed: "fl-verbs-bar-dismissed",
};

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* forgets after this visit — nothing else changes */
  }
}

/* ── audio ───────────────────────────────────────────────────────────────────
   One <audio> element for the whole page, created on the first tap, so nothing
   loads before someone asks to hear a verb. Each clip is pre-rendered
   (scripts/build-verbs-audio.py). If a file is missing or the browser refuses
   it, the device's own English voice reads the three forms instead. */

let player = null;
let current = null;
const listeners = new Set();

function emit(id) {
  current = id;
  listeners.forEach((fn) => fn(id));
}

export function onPlaying(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function speakFallback(verb) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof window.SpeechSynthesisUtterance === "undefined") {
      emit(null);
      return;
    }
    synth.cancel();
    const pasts = verb.past.split("/").map((s) => s.trim());
    const u = new window.SpeechSynthesisUtterance([verb.base, ...pasts, verb.participle].join(". "));
    u.lang = "en-US";
    u.rate = 0.8;
    u.onend = () => emit(null);
    u.onerror = () => emit(null);
    emit(verb.id);
    synth.speak(u);
  } catch {
    emit(null);
  }
}

export function playVerb(verb) {
  if (typeof window === "undefined") return;
  try {
    if (!player) {
      player = new Audio();
      player.preload = "none";
      // Not "pause": swapping src pauses the previous clip AFTER the new id is
      // announced, which would switch the new button's state straight off.
      player.addEventListener("ended", () => emit(null));
    }
    if (current === verb.id && !player.paused) {
      player.pause();
      emit(null);
      return;
    }
    player.onerror = () => speakFallback(verb);
    player.src = `/audio/verbs/${encodeURIComponent(verb.id)}.mp3`;
    emit(verb.id);
    const p = player.play();
    if (p && typeof p.catch === "function") {
      p.catch((err) => {
        // AbortError = a newer tap replaced this clip; that one is playing.
        if (err && err.name === "AbortError") return;
        speakFallback(verb);
      });
    }
  } catch {
    speakFallback(verb);
  }
}

/* ── search ──────────────────────────────────────────────────────────────────
   «أذهب» should find «يذهب، يروح»'s row as easily as «ذهب»: diacritics go, the
   hamza seats collapse to ا, ة → ه, ى → ي. English is lower-cased. */

const TASHKEEL = /[ً-ْٰـ]/g;

export function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(TASHKEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tolerant answer check: case, spaces and a trailing full stop don't matter. */
export function cleanAnswer(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[.!?,;:"'’]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
